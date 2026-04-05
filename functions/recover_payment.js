/* ═══════════════════════════════════════════════════════════════
   Fatlin AI — Script de recuperación manual de pago
   
   Uso: node recover_payment.js
   
   Requisito: ejecutar desde la carpeta /functions del proyecto
   donde está el serviceAccountKey.json o con las credenciales
   de Firebase ya configuradas (firebase login).
═══════════════════════════════════════════════════════════════ */

const admin = require("firebase-admin");

// ── Inicializar con credenciales del proyecto ─────────────────
// Opción A: usando Application Default Credentials (si ya hiciste firebase login)
//admin.initializeApp({
//  credential: admin.credential.applicationDefault(),
//  projectId: "fatlin"
//});

// Opción B: si tienes el serviceAccountKey.json, descomenta esto y comenta Opción A:
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount)
 });

const db = admin.firestore();

// ── Datos del pago a recuperar ────────────────────────────────
const UID      = "A6A7DtwydGhdnv51RzVUFWu3Eqn2";
const LEVEL    = 160;
const ORDER_ID = "55W534180K6425525";
const AMOUNT   = 15.00;

async function recoverPayment() {
  const docId  = `${UID}_${LEVEL}_attempt`;
  const docRef = db.collection("fatlin_payments").doc(docId);

  console.log(`\n🔍 Verificando documento: ${docId}`);
  const snap = await docRef.get();

  if (snap.exists) {
    const data = snap.data();
    console.log("📄 Estado actual:", JSON.stringify(data, null, 2));
    if (data.paid === true) {
      console.log("✅ Este pago YA está confirmado en Firestore. No se necesita acción.");
      process.exit(0);
    }
  } else {
    console.log("📄 Documento no existe aún, se creará.");
  }

  console.log(`\n💳 Confirmando pago manualmente...`);
  console.log(`   uid:     ${UID}`);
  console.log(`   level:   ${LEVEL}`);
  console.log(`   orderId: ${ORDER_ID}`);
  console.log(`   amount:  $${AMOUNT} USD`);

  await docRef.set({
    uid:       UID,
    level:     LEVEL,
    gateway:   "pp",
    status:    "approved",
    paid:      true,
    txId:      ORDER_ID,
    amountUSD: AMOUNT,
    paidAt:    Date.now(),
    sandbox:   true,
    recoveredManually: true,   // marca para auditoría
    recoveredAt: new Date().toISOString()
  }, { merge: true });

  console.log(`\n✅ ¡Pago confirmado exitosamente en Firestore!`);
  console.log(`   Documento: fatlin_payments/${docId}`);
  console.log(`   El certificado del nivel ${LEVEL} ya está activo para el usuario.`);
  console.log(`\n   El usuario debe recargar la app para verlo reflejado.\n`);

  process.exit(0);
}

recoverPayment().catch(err => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
