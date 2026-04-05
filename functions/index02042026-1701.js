/* ═══════════════════════════════════════════════════════════════
   Fatlin AI — Cloud Functions
   Proyecto: fatlin | Gen 1 | Node 22

   1. claudeProxy     — proxy seguro a Anthropic Claude
   2. mpCreatePref    — crea preferencia dinámica MercadoPago
   3. mpWebhook       — webhook MercadoPago → confirma pago
   4. ppCreateOrder   — crea orden dinámica PayPal
   5. ppWebhook       — webhook PayPal → confirma pago
═══════════════════════════════════════════════════════════════ */

const functions = require("firebase-functions");
const admin     = require("firebase-admin");
const fetch     = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

/* ══════════════════════════════════════════════════════════════
   🔧 MODO DE OPERACIÓN
   ──────────────────────────────────────────────────────────────
   Cambia SOLO esta línea para alternar entre pruebas y producción.

   true  → SANDBOX    (pruebas con cuentas de developer.paypal.com)
   false → PRODUCCIÓN (pagos reales con cuenta PayPal Business)

   ── Credenciales que debes tener configuradas ─────────────────

   SANDBOX (pruebas):
     firebase functions:config:set \
       pp.client_id="TU_SANDBOX_CLIENT_ID" \
       pp.client_secret="TU_SANDBOX_SECRET"
     Obténlas en: developer.paypal.com → Apps & Credentials → Sandbox

   PRODUCCIÓN (cuando lances):
     firebase functions:config:set \
       pp.client_id="TU_LIVE_CLIENT_ID" \
       pp.client_secret="TU_LIVE_SECRET" \
       pp.webhook_id="TU_WEBHOOK_ID"
     Obténlas en: developer.paypal.com → Apps & Credentials → Live
     El webhook_id lo obtienes al registrar la URL del webhook en PayPal.
══════════════════════════════════════════════════════════════ */

const SANDBOX_MODE = true;    // ← PRUEBAS  (activo ahora)
// const SANDBOX_MODE = false; // ← PRODUCCIÓN (descomentar al lanzar)

/* ── URL base de la API PayPal según modo ────────────────────── */
const PP_BASE = SANDBOX_MODE
  ? "https://api-m.sandbox.paypal.com"  // SANDBOX
  : "https://api-m.paypal.com";         // PRODUCCIÓN

/* ══════════════════════════════════════════════════════════════
   HELPER — Confirmar pago en Firestore (admin SDK)
   El admin SDK bypasea las reglas de seguridad de Firestore,
   así el cliente nunca puede escribir paid:true por su cuenta.
══════════════════════════════════════════════════════════════ */
async function confirmPayment(uid, level, gateway, txId, amountUSD) {
  if (!uid || !level) return false;

  const docId = `${uid}_${level}_attempt`;
  const docRef = db.collection("fatlin_payments").doc(docId);

  try {
    // 1️⃣ Guardar el pago (auditoría)
    await docRef.set({
      uid,
      level,
      gateway,
      status: "approved",
      paid: true,
      txId: String(txId || ""),
      amountUSD: amountUSD || 0,
      paidAt: Date.now(),
      sandbox: SANDBOX_MODE,
    }, { merge: true });

    // 2️⃣ ACTIVAR NIVEL EN EL USUARIO
    await db.collection("users").doc(uid).set({
      paidLevels: admin.firestore.FieldValue.arrayUnion(level),
      lastPaymentAt: Date.now()
    }, { merge: true });

    console.log(`[confirmPayment] ✅ uid=${uid} level=${level} agregado a paidLevels`);
    return true;
  } catch (err) {
    console.error("[confirmPayment] ❌ Error:", err.message);
    return false;
  }
}

/* ── Validar token Firebase Auth ─────────────────────────────── */
async function verifyToken(req, res) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) { res.status(401).json({ error: "Token requerido" }); return null; }
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (e) {
    res.status(403).json({ error: "Token inválido" });
    return null;
  }
}

/* ── CORS helper ─────────────────────────────────────────────── */
function setCors(res) {
  res.set("Access-Control-Allow-Origin",  "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/* ══════════════════════════════════════════════════════════════
   1. CLAUDE PROXY
══════════════════════════════════════════════════════════════ */
exports.claudeProxy = functions
  .runWith({ timeoutSeconds: 540, memory: "512MB" })
  .https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST")    { res.status(405).json({ error: "Solo POST" }); return; }

  const decoded = await verifyToken(req, res);
  if (!decoded) return;

  const ANTHROPIC_KEY = functions.config().anthropic?.api_key
                     || process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) { res.status(500).json({ error: "API key no configurada" }); return; }

  try {
    console.log("[claudeProxy] model:", req.body?.model,
                "max_tokens:", req.body?.max_tokens,
                "tools:", req.body?.tools?.length);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta":    "web-search-2025-03-05"
      },
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("[claudeProxy] Anthropic error:", r.status, JSON.stringify(data).slice(0,300));
      res.status(r.status).json(data);
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   2. MERCADOPAGO — CREAR PREFERENCIA DINÁMICA
   El cliente llama a esta función con { level }
   La función crea una preferencia en MP con external_reference
   = "{uid}_{level}" y devuelve la URL del checkout.
══════════════════════════════════════════════════════════════ */
exports.mpCreatePref = functions.https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST")    { res.status(405).json({ error: "Solo POST" }); return; }

  const decoded = await verifyToken(req, res);
  if (!decoded) return;

  const uid      = decoded.uid;
  const level    = parseInt(req.body.level);
  const deviceId = req.body.deviceId || "";
  const isDiplo  = level === 480;
  const title    = isDiplo
    ? "Diplomado en Metodología PACIE — Fatlin AI"
    : `Certificado Nivel ${level} — Fatlin AI`;

  const cfg      = functions.config();
  const MP_TOKEN = (cfg.mp && cfg.mp.access_token)
                || process.env.MP_ACCESS_TOKEN;

  console.log("[mpCreatePref] uid:", uid, "level:", level,
              "token_set:", !!MP_TOKEN,
              "token_prefix:", MP_TOKEN ? MP_TOKEN.slice(0,10) : "none");

  if (!MP_TOKEN) {
    res.status(500).json({ error: "MP token no configurado — ejecuta: firebase functions:config:set mp.access_token=TU_TOKEN" });
    return;
  }

  // ── Montos por país ───────────────────────────────────────────
  const MONTOS = {
    MLC: { currency: "CLP", cert: 14000, diplo: 93000  }, // Chile
    MCO: { currency: "COP", cert: 62000, diplo: 415000 }, // Colombia
    MPE: { currency: "PEN", cert: 56,    diplo: 375    }, // Perú
    MLM: { currency: "MXN", cert: 255,   diplo: 1700   }, // México
    MLA: { currency: "ARS", cert: 15000, diplo: 100000 }, // Argentina
    MLV: { currency: "USD", cert: 15,    diplo: 100    }, // Venezuela
    MLB: { currency: "BRL", cert: 75,    diplo: 500    }, // Brasil
  };
  const DEFAULT_MONTO = { currency: "USD", cert: 15, diplo: 100 };

  let currency = DEFAULT_MONTO.currency;
  let amount   = isDiplo ? DEFAULT_MONTO.diplo : DEFAULT_MONTO.cert;

  try {
    const meRes  = await fetch("https://api.mercadopago.com/users/me", {
      headers: { "Authorization": `Bearer ${MP_TOKEN}` }
    });
    const meData = await meRes.json();
    const siteId = meData.site_id || "";
    const monto  = MONTOS[siteId] || DEFAULT_MONTO;
    currency     = monto.currency;
    amount       = isDiplo ? monto.diplo : monto.cert;
    console.log("[mpCreatePref] site_id:", siteId, "country:", meData.country_id,
                "currency:", currency, "amount:", amount);
  } catch(e) {
    console.warn("[mpCreatePref] No se pudo detectar país, usando USD:", e.message);
  }

  try {
    const userRecord  = await admin.auth().getUser(uid).catch(() => null);
    const displayName = userRecord?.displayName || "";
    const email       = userRecord?.email || "";
    const nameParts   = displayName.split(" ");
    const firstName   = nameParts[0] || "Usuario";
    const lastName    = nameParts.slice(1).join(" ") || "Fatlin";

    const body = {
      items: [{
        id:          `fatlin-cert-${level}`,
        title,
        description: `Certificado de Metodología PACIE — Nivel ${level} — Fatlin AI`,
        category_id: "education",
        quantity:    1,
        unit_price:  amount,
        currency_id: currency
      }],
      payer: {
        name:    firstName,
        surname: lastName,
        email:   email || "pagador@fatlin.web.app",
        identification: { type: "RUT", number: "11111111-1" }
      },
      external_reference: `${uid}_${level}`,
      back_urls: {
        success: `https://fatlin.web.app/payment-success.html?uid=${uid}&level=${level}`,
        failure: `https://fatlin.web.app/payment-failed.html`,
        pending: `https://fatlin.web.app/payment-failed.html`
      },
      auto_return:          "approved",
      notification_url:     "https://us-central1-fatlin.cloudfunctions.net/mpWebhook",
      statement_descriptor: "FATLIN AI",
      binary_mode:          false,
      expires:              false,
      metadata: {
        user_id:  uid,
        level:    level,
        platform: "fatlin-web",
        version:  "2.0"
      },
      ...(deviceId && { additional_info: { ip_address: req.ip } })
    };

    const mpRes  = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${MP_TOKEN}`
      },
      body: JSON.stringify(body)
    });
    const pref = await mpRes.json();

    console.log("[mpCreatePref] pref_id:", pref.id);
    console.log("[mpCreatePref] init_point:", pref.init_point);
    console.log("[mpCreatePref] sandbox_init_point:", pref.sandbox_init_point);

    if (!mpRes.ok) {
      console.error("[mpCreatePref] MP error:", pref);
      res.status(500).json({ error: "Error creando preferencia MP", detail: pref });
      return;
    }

    await db.collection("fatlin_payments").doc(`${uid}_${level}_attempt`).set({
      uid, level,
      gateway:   "mp",
      status:    "pending",
      paid:      false,
      prefId:    pref.id,
      createdAt: Date.now(),
    }, { merge: true });

    // MP ya detecta sandbox/prod por el token — no necesita el flag
    const isSandbox   = MP_TOKEN.includes("TEST");
    const checkoutUrl = isSandbox ? pref.sandbox_init_point : pref.init_point;

    res.status(200).json({ url: checkoutUrl, prefId: pref.id });

  } catch (err) {
    console.error("[mpCreatePref] Error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   3. MERCADOPAGO WEBHOOK
   Recibe notificaciones de MP y confirma el pago en Firestore
══════════════════════════════════════════════════════════════ */
exports.mpWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method === "GET") { res.status(200).send("OK"); return; }

  console.log("[mpWebhook]", JSON.stringify(req.body).slice(0, 200));

  const { type, data } = req.body;
  if (type !== "payment") { res.status(200).send("ignored"); return; }

  const paymentId = data?.id;
  if (!paymentId)  { res.status(400).send("no id"); return; }

  const MP_TOKEN = functions.config().mp?.access_token
                || process.env.MP_ACCESS_TOKEN;
  if (!MP_TOKEN) { res.status(500).send("config error"); return; }

  try {
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${MP_TOKEN}` }
    });
    const payment = await r.json();

    console.log("[mpWebhook] status:", payment.status,
                "ext_ref:", payment.external_reference,
                "amount:", payment.transaction_amount);

    if (payment.status !== "approved") {
      if (payment.status === "rejected" && payment.external_reference?.includes("_")) {
        const [uid, lvl] = payment.external_reference.split("_");
        await db.collection("fatlin_payments").doc(`${uid}_${lvl}_attempt`)
          .set({ status: "rejected", paid: false }, { merge: true }).catch(() => {});
      }
      res.status(200).send("not approved");
      return;
    }

    const extRef = payment.external_reference || "";
    if (!extRef.includes("_")) {
      console.warn("[mpWebhook] Sin external_reference válido:", extRef);
      res.status(200).send("no ref");
      return;
    }

    const [uid, levelStr] = extRef.split("_");
    const level = parseInt(levelStr);

    await confirmPayment(uid, level, "mp", String(paymentId), payment.transaction_amount);
    res.status(200).send("confirmed");

  } catch (err) {
    console.error("[mpWebhook] Error:", err.message);
    res.status(500).send("error");
  }
});

/* ══════════════════════════════════════════════════════════════
   4. PAYPAL — CREAR ORDEN DINÁMICA
   El cliente llama con { level }
   La función crea una orden PayPal con custom_id = "{uid}_{level}"
   PP_BASE se toma del flag SANDBOX_MODE definido al inicio.
══════════════════════════════════════════════════════════════ */
exports.ppCreateOrder = functions.https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST")    { res.status(405).json({ error: "Solo POST" }); return; }

  const decoded = await verifyToken(req, res);
  if (!decoded) return;

  const uid       = decoded.uid;
  const level     = parseInt(req.body.level);
  const isDiplo   = level === 480;
  const amount    = isDiplo ? "100.00" : "15.00";
  const returnUrl = req.body.returnUrl || `https://fatlin.web.app/paypal-return.html?uid=${uid}&level=${level}`;
  const cancelUrl = req.body.cancelUrl || `https://fatlin.web.app/?payment_cancelled=1`;

  const PP_CLIENT_ID     = functions.config().pp?.client_id     || process.env.PP_CLIENT_ID;
  const PP_CLIENT_SECRET = functions.config().pp?.client_secret || process.env.PP_CLIENT_SECRET;

  if (!PP_CLIENT_ID || !PP_CLIENT_SECRET) {
    res.status(500).json({ error: "PayPal no configurado" }); return;
  }

  console.log(`[ppCreateOrder] modo=${SANDBOX_MODE ? "SANDBOX" : "PRODUCCIÓN"}`);
  console.log(`[ppCreateOrder] uid=${uid} level=${level} amount=${amount}`);

  try {
    // ── Obtener access token PayPal ──────────────────────────────
    const tokenRes = await fetch(`${PP_BASE}/v1/oauth2/token`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${PP_CLIENT_ID}:${PP_CLIENT_SECRET}`).toString("base64")
      },
      body: "grant_type=client_credentials"
    });
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      console.error("[ppCreateOrder] No se obtuvo token PayPal:", tokenData);
      res.status(500).json({ error: "No se pudo autenticar con PayPal", detail: tokenData });
      return;
    }

    // ── Crear orden ──────────────────────────────────────────────
    const orderRes = await fetch(`${PP_BASE}/v2/checkout/orders`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          custom_id:   `${uid}_${level}`,   // ← identifica usuario + nivel en el webhook
          description: `Fatlin AI — ${isDiplo ? "Diplomado" : "Certificado Nivel " + level}`,
          amount: {
            currency_code: "USD",
            value:         amount
          }
        }],
        application_context: {
          return_url:  returnUrl,
          cancel_url:  cancelUrl,
          brand_name:  "Fatlin AI",
          user_action: "PAY_NOW"
        }
      })
    });
    const order = await orderRes.json();

    if (!orderRes.ok) {
      console.error("[ppCreateOrder] PP error:", order);
      res.status(500).json({ error: "Error creando orden PayPal", detail: order });
      return;
    }

    // ── Registrar intento pendiente en Firestore ─────────────────
    await db.collection("fatlin_payments").doc(`${uid}_${level}_attempt`).set({
      uid, level,
      gateway:   "pp",
      status:    "pending",
      paid:      false,
      orderId:   order.id,
      sandbox:   SANDBOX_MODE,
      createdAt: Date.now(),
    }, { merge: true });

    const approveUrl = order.links?.find(l => l.rel === "approve")?.href;
    console.log(`[ppCreateOrder] ✅ orderId=${order.id}`);
    console.log(`[ppCreateOrder] approveUrl=${approveUrl}`);

    res.status(200).json({ url: approveUrl, orderId: order.id });

  } catch (err) {
    console.error("[ppCreateOrder] Error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   5. PAYPAL — CAPTURAR ORDEN
   El cliente llama con { orderId, uid, level } desde payment-success.html
   La función captura el pago en PayPal y confirma en Firestore.
══════════════════════════════════════════════════════════════ */
exports.ppCaptureOrder = functions
  .runWith({ timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST")    { res.status(405).json({ error: "Solo POST" }); return; }

  // ── LOG 1: Inicio y parámetros recibidos ────────────────────
  console.log(`[ppCaptureOrder] ── INICIO ── modo=${SANDBOX_MODE ? "SANDBOX" : "PRODUCCIÓN"}`);
  console.log(`[ppCaptureOrder] body recibido:`, JSON.stringify(req.body).slice(0, 200));

  const { orderId, uid, level } = req.body;
  if (!orderId || !uid || !level) {
    console.error("[ppCaptureOrder] ❌ Faltan parámetros:", { orderId: !!orderId, uid: !!uid, level: !!level });
    res.status(400).json({ error: "Faltan parámetros: orderId, uid, level" }); return;
  }

  console.log(`[ppCaptureOrder] orderId=${orderId} uid=${uid} level=${level}`);

  const PP_CLIENT_ID     = functions.config().pp?.client_id     || process.env.PP_CLIENT_ID;
  const PP_CLIENT_SECRET = functions.config().pp?.client_secret || process.env.PP_CLIENT_SECRET;

  // ── LOG 2: Verificar credenciales ───────────────────────────
  console.log(`[ppCaptureOrder] credenciales: client_id=${PP_CLIENT_ID ? "OK ("+PP_CLIENT_ID.slice(0,6)+"...)" : "FALTA"} secret=${PP_CLIENT_SECRET ? "OK" : "FALTA"}`);

  if (!PP_CLIENT_ID || !PP_CLIENT_SECRET) {
    console.error("[ppCaptureOrder] ❌ PayPal no configurado");
    res.status(500).json({ error: "PayPal no configurado" }); return;
  }

  try {
    // ── LOG 3: Verificar Firestore (idempotencia) ────────────
    console.log("[ppCaptureOrder] verificando Firestore...");
    const docRef = db.collection("fatlin_payments").doc(`${uid}_${level}_attempt`);
    const snap   = await docRef.get();
    console.log(`[ppCaptureOrder] doc existe=${snap.exists} paid=${snap.exists ? snap.data().paid : "N/A"}`);

    if (snap.exists && snap.data().paid === true) {
      console.log("[ppCaptureOrder] ✅ Pago ya confirmado anteriormente — respondiendo alreadyPaid");
      res.status(200).json({ success: true, alreadyPaid: true }); return;
    }

    // ── LOG 4: Obtener token PayPal ──────────────────────────
    console.log(`[ppCaptureOrder] obteniendo token PayPal desde ${PP_BASE}...`);
    const tokenRes = await fetch(`${PP_BASE}/v1/oauth2/token`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${PP_CLIENT_ID}:${PP_CLIENT_SECRET}`).toString("base64")
      },
      body: "grant_type=client_credentials"
    });

    const tokenBody = await tokenRes.json();
    console.log(`[ppCaptureOrder] token HTTP=${tokenRes.status} access_token=${tokenBody.access_token ? "OK" : "FALTA"} error=${tokenBody.error || "ninguno"}`);

    if (!tokenBody.access_token) {
      console.error("[ppCaptureOrder] ❌ No se obtuvo access_token:", JSON.stringify(tokenBody));
      res.status(500).json({ error: "No se pudo autenticar con PayPal", detail: tokenBody }); return;
    }

    // ── LOG 5: Capturar la orden ─────────────────────────────
    console.log(`[ppCaptureOrder] capturando orden ${orderId}...`);
    const captureRes = await fetch(`${PP_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${tokenBody.access_token}`
      }
    });

    const capture = await captureRes.json();
    console.log(`[ppCaptureOrder] capture HTTP=${captureRes.status} status=${capture.status}`);
    console.log(`[ppCaptureOrder] capture completo:`, JSON.stringify(capture).slice(0, 500));

    // ── Si ya fue capturada antes (INSTRUMENT_DECLINED o ORDER_ALREADY_CAPTURED) ──
    // PayPal puede devolver status 422 con estos códigos — igual confirmamos si existe captures
    const captures = capture.purchase_units?.[0]?.payments?.captures || [];
    const completedCapture = captures.find(c => c.status === "COMPLETED");

    if (capture.status === "COMPLETED" || completedCapture) {
      const captureId = completedCapture?.id
                     || captures[0]?.id
                     || orderId;
      const amountUSD = parseFloat(
        completedCapture?.amount?.value
        || captures[0]?.amount?.value
        || "0"
      );

      console.log(`[ppCaptureOrder] captureId=${captureId} amountUSD=${amountUSD}`);
      const ok = await confirmPayment(uid, parseInt(level), "pp", captureId, amountUSD);
      console.log(`[ppCaptureOrder] confirmPayment resultado=${ok}`);

      if (ok) {
        console.log(`[ppCaptureOrder] ✅ Pago capturado y confirmado uid=${uid} level=${level}`);
        // ✅ FIX: incluir level en la respuesta para que paypal-return.html lo use si viene vacío en URL
        res.status(200).json({ success: true, captureId, amountUSD, level: parseInt(level) });
      } else {
        console.error("[ppCaptureOrder] ❌ confirmPayment falló — Firestore no se actualizó");
        res.status(500).json({ error: "Error al confirmar en base de datos" });
      }

    } else {
      // ── Captura falló ────────────────────────────────────────
      const ppError = capture.details?.[0]?.issue || capture.name || "UNKNOWN";
      const ppDesc  = capture.details?.[0]?.description || capture.message || "";
      console.error(`[ppCaptureOrder] ❌ Captura no completada: status=${capture.status} error=${ppError} desc=${ppDesc}`);
      console.error(`[ppCaptureOrder] PayPal full response:`, JSON.stringify(capture));

      // ✅ FIX SANDBOX: si el error es ORDER_ALREADY_CAPTURED el pago sí ocurrió —
      // confirmar en Firestore igual usando orderId como captureId de respaldo
      const alreadyCaptured = ppError === "ORDER_ALREADY_CAPTURED"
                           || (capture.details || []).some(d => d.issue === "ORDER_ALREADY_CAPTURED");
      if (alreadyCaptured) {
        console.log(`[ppCaptureOrder] ⚠️  ORDER_ALREADY_CAPTURED — confirmando con orderId como fallback`);
        const ok = await confirmPayment(uid, parseInt(level), "pp", orderId, 0);
        if (ok) {
          res.status(200).json({ success: true, captureId: orderId, amountUSD: 0, level: parseInt(level) });
          return;
        }
      }

      res.status(400).json({
        error:  "Captura no completada",
        status: capture.status,
        ppError,
        ppDesc
      });
    }

  } catch (err) {
    console.error("[ppCaptureOrder] ❌ EXCEPCIÓN:", err.message);
    console.error("[ppCaptureOrder] stack:", err.stack);
    res.status(502).json({ error: err.message });
  }
});

/* ══════════════════════════════════════════════════════════════
   6. PAYPAL WEBHOOK
   Recibe PAYMENT.CAPTURE.COMPLETED → confirma pago en Firestore

   🔒 VERIFICACIÓN DE FIRMA:
      SANDBOX_MODE = true  → OMITIDA
        PayPal sandbox no envía los headers de firma de forma
        confiable. Se procesa el evento directamente.

      SANDBOX_MODE = false → ACTIVA (obligatoria en producción)
        Se verifica la firma con la API de PayPal usando
        pp.webhook_id antes de confirmar cualquier pago.
══════════════════════════════════════════════════════════════ */
exports.ppWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method === "GET") { res.status(200).send("OK"); return; }

  console.log("[ppWebhook] evento recibido:", req.body?.event_type);
  console.log("[ppWebhook] body:", JSON.stringify(req.body).slice(0, 300));

  const eventType = req.body?.event_type;
  if (eventType !== "PAYMENT.CAPTURE.COMPLETED") {
    console.log("[ppWebhook] evento ignorado:", eventType);
    res.status(200).send("ignored"); return;
  }

  /* ── BLOQUE DE VERIFICACIÓN DE FIRMA ─────────────────────────
     PRODUCCIÓN: verifica que el evento venga realmente de PayPal.
     SANDBOX: omitido porque sandbox no envía headers de firma fiables.
  ──────────────────────────────────────────────────────────────── */
  if (!SANDBOX_MODE) {
    // ── PRODUCCIÓN — verificar firma ────────────────────────────
    const PP_CLIENT_ID     = functions.config().pp?.client_id     || process.env.PP_CLIENT_ID;
    const PP_CLIENT_SECRET = functions.config().pp?.client_secret || process.env.PP_CLIENT_SECRET;
    const PP_WEBHOOK_ID    = functions.config().pp?.webhook_id    || process.env.PP_WEBHOOK_ID;

    if (!PP_WEBHOOK_ID) {
      console.error("[ppWebhook] FALTA pp.webhook_id — configura con: firebase functions:config:set pp.webhook_id=TU_ID");
      res.status(200).send("config error"); return;
    }

    try {
      const tokenRes = await fetch(`${PP_BASE}/v1/oauth2/token`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/x-www-form-urlencoded",
          "Authorization": "Basic " + Buffer.from(`${PP_CLIENT_ID}:${PP_CLIENT_SECRET}`).toString("base64")
        },
        body: "grant_type=client_credentials"
      });
      const { access_token } = await tokenRes.json();

      const verifyRes = await fetch(`${PP_BASE}/v1/notifications/verify-webhook-signature`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${access_token}`
        },
        body: JSON.stringify({
          auth_algo:         req.headers["paypal-auth-algo"],
          cert_url:          req.headers["paypal-cert-url"],
          transmission_id:   req.headers["paypal-transmission-id"],
          transmission_sig:  req.headers["paypal-transmission-sig"],
          transmission_time: req.headers["paypal-transmission-time"],
          webhook_id:        PP_WEBHOOK_ID,
          webhook_event:     req.body,
        })
      });
      const { verification_status } = await verifyRes.json();

      if (verification_status !== "SUCCESS") {
        console.warn("[ppWebhook] ❌ Firma inválida:", verification_status);
        res.status(400).send("Firma inválida"); return;
      }
      console.log("[ppWebhook] ✅ Firma verificada");

    } catch (verifyErr) {
      console.error("[ppWebhook] Error verificando firma:", verifyErr.message);
      res.status(200).send("verify error"); return;
    }

  } else {
    // ── SANDBOX — sin verificación de firma ─────────────────────
    console.log("[ppWebhook] ⚠️  SANDBOX_MODE activo — firma omitida intencionalmente");
  }

  /* ── Procesar el pago ──────────────────────────────────────── */
  try {
    const resource  = req.body.resource || {};
    const customId  = resource.custom_id
                   || resource.purchase_units?.[0]?.custom_id
                   || "";
    const amountUSD = parseFloat(resource.amount?.value || "0");
    const txId      = resource.id || "";

    console.log("[ppWebhook] customId:", customId, "amount:", amountUSD, "txId:", txId);

    if (!customId.includes("_")) {
      console.warn("[ppWebhook] custom_id no tiene formato uid_level:", customId);
      res.status(200).send("no ref"); return;
    }

    // Separar por el ÚLTIMO guion bajo para soportar UIDs con guiones
    const lastIdx = customId.lastIndexOf("_");
    const uid     = customId.substring(0, lastIdx);
    const level   = parseInt(customId.substring(lastIdx + 1));

    if (!uid || isNaN(level)) {
      console.warn("[ppWebhook] customId malformado:", customId);
      res.status(200).send("invalid ref"); return;
    }

    // ── Idempotencia: no procesar el mismo pago dos veces ────────
    const docRef = db.collection("fatlin_payments").doc(`${uid}_${level}_attempt`);
    const snap   = await docRef.get();
    if (snap.exists && snap.data().paid === true) {
      console.log("[ppWebhook] Pago ya confirmado, ignorando duplicado");
      res.status(200).send("already confirmed"); return;
    }

    await confirmPayment(uid, level, "pp", txId, amountUSD);
    res.status(200).send("confirmed");

  } catch (err) {
    console.error("[ppWebhook] Error:", err.message);
    res.status(500).send("error");
  }
});
