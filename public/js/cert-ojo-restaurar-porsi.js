/* ══════════════════════════════════════════════════════════
   CERTIFICADOS FATLIN AI
   cert.js — renderModulo(data) · renderDiplomado(data)
   Protocolo FMG-IAG · 100% SVG Logo · Sin Tablas
   ══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   CONSTANTES DEL PROGRAMA
   ────────────────────────────────────────────────────────── */

const FATLIN_MODULOS = {
  nombres: [
    'Fundamentos PACIE',
    'Presencia PACIE',
    'Alcance PACIE',
    'Capacitación PACIE',
    'Interacción y E-learning'
  ],
  romanos: ['I', 'II', 'III', 'IV', 'V'],
  colores: ['#cd7f32', '#8b9cad', '#d97706', '#0ea5e9', '#7c3aed'],
  descripciones: [
    'Ha completado exitosamente el primer módulo de la Metodología PACIE en la plataforma Fatlin AI, cubriendo las bases conceptuales de la educación virtual bajo el protocolo Genesis-IAG, con evaluación continua generada por Inteligencia Artificial.',
    'Ha completado exitosamente el segundo módulo de la Metodología PACIE en la plataforma Fatlin AI, dominando los fundamentos de Presencia digital en entornos educativos virtuales, bajo evaluación continua por Inteligencia Artificial.',
    'Ha completado exitosamente el tercer módulo de la Metodología PACIE, demostrando dominio en estrategias de Alcance pedagógico en entornos virtuales avalados por Planeta FATLA, con evaluación continua por Inteligencia Artificial.',
    'Ha completado exitosamente el cuarto módulo de la Metodología PACIE, acreditando competencias en Capacitación virtual y diseño instruccional en plataformas digitales, con evaluación continua por Inteligencia Artificial.',
    'Ha completado exitosamente el quinto módulo de la Metodología PACIE, demostrando dominio integral en Interacción pedagógica y E-learning bajo el modelo FATLA, con evaluación continua por Inteligencia Artificial.'
  ]
};

/* ──────────────────────────────────────────────────────────
   SVG LOGO FATLIN AI — versión azul (módulos)
   ────────────────────────────────────────────────────────── */

function fatlinLogoAzul(size = 48) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100"
         xmlns="http://www.w3.org/2000/svg" class="mod-logo-svg" aria-label="Fatlin AI Logo">
      <defs>
        <radialGradient id="fbg-azul" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(56,189,248,.15)"/>
          <stop offset="100%" stop-color="rgba(56,189,248,0)"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#fbg-azul)"/>
      <path d="M50 90 L90 70 L50 50 L10 70 Z" fill="#075985"/>
      <path d="M50 82 L90 62 L50 42 L10 62 Z" fill="#0369a1"/>
      <path d="M50 74 L90 54 L50 34 L10 54 Z" fill="#0284c7"/>
      <path d="M50 66 L90 46 L50 26 L10 46 Z" fill="#0ea5e9"/>
      <path d="M50 58 L90 38 L50 18 L10 38 Z" fill="#38bdf8"/>
      <path d="M50 50 L75 38 L50 26 L25 38 Z" fill="#7dd3fc"/>
      <circle cx="50" cy="38" r="3.5" fill="white" opacity="0.9"/>
    </svg>`;
}

/* ──────────────────────────────────────────────────────────
   SVG LOGO FATLIN AI — versión dorada (diplomado)
   ────────────────────────────────────────────────────────── */

function fatlinLogoDorado(size = 96) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100"
         xmlns="http://www.w3.org/2000/svg" class="dc-logo-svg" aria-label="Fatlin AI Logo">
      <defs>
        <radialGradient id="fbg-gold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(240,192,64,.25)"/>
          <stop offset="100%" stop-color="rgba(240,192,64,0)"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#fbg-gold)"/>
      <path d="M50 90 L90 70 L50 50 L10 70 Z" fill="#c8920a"/>
      <path d="M50 82 L90 62 L50 42 L10 62 Z" fill="#d4a017"/>
      <path d="M50 74 L90 54 L50 34 L10 54 Z" fill="#e0b020"/>
      <path d="M50 66 L90 46 L50 26 L10 46 Z" fill="#ecc030"/>
      <path d="M50 58 L90 38 L50 18 L10 38 Z" fill="#f0c040"/>
      <path d="M50 50 L75 38 L50 26 L25 38 Z" fill="#f8d870"/>
      <circle cx="50" cy="38" r="3.5" fill="white" opacity="0.95"/>
    </svg>`;
}

/* ──────────────────────────────────────────────────────────
   QR — módulo (azul navy)
   ────────────────────────────────────────────────────────── */

function qrModulo(verifyUrl) {
  const url  = verifyUrl || 'https://fatlin.web.app';
  const data = encodeURIComponent(url);
  const src  = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${data}&bgcolor=ffffff&color=0a1e35&qzone=2`;
  return `<a href="${url}" target="_blank" rel="noopener"
             style="display:block;width:100%;height:100%;text-decoration:none;position:relative;z-index:9999;cursor:pointer;"
             onclick="event.stopPropagation();window.open('${url}','_blank');return false;">
    <img src="${src}" alt="QR verificación" style="display:block;width:100%;height:100%;border-radius:2px;pointer-events:none;">
  </a>`;
}

/* ──────────────────────────────────────────────────────────
   QR — diplomado (dorado) — usado solo en printCert(), el footer usa QR inline
   ────────────────────────────────────────────────────────── */

function qrDiplomado(verifyUrl) {
  const url  = verifyUrl || 'https://fatlin.web.app';
  // Evitar doble-encode: si ya viene encodeada no volvemos a encodear
  //const data = url.includes('%') ? url : encodeURIComponent(url);
  const data = encodeURIComponent(url);
  const src  = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&data=${data}&bgcolor=ffffff&color=0f2456&qzone=2`;
  return `<a href="${url}" target="_blank" rel="noopener"
             style="display:block;width:100%;height:100%;text-decoration:none;position:relative;z-index:9999;cursor:pointer;"
             onclick="event.stopPropagation();window.open('${url}','_blank');return false;">
    <img src="${src}" alt="QR verificación" style="display:block;width:100%;height:100%;border-radius:2px;filter:none;pointer-events:none;">
  </a>`;
}

/* ──────────────────────────────────────────────────────────
   renderModulo(data)
   ────────────────────────────────────────────────────────── */

function renderModulo(data) {
  const d = {
    name:   data.name   || 'Participante',
    modulo: Math.min(Math.max(parseInt(data.modulo) || 1, 1), 5),
    date:   data.date   || '—',   /* fecha de emisión desde Firestore — nunca new Date() */
    certId: data.certId || `FATLIN-${new Date().getFullYear()}-MOD${data.modulo || 1}-${_uid()}`,
    qr:     data.qr     || ''
  };

  const idx    = d.modulo - 1;
  const romano = FATLIN_MODULOS.romanos[idx];
  const color  = FATLIN_MODULOS.colores[idx];
  const nombre = FATLIN_MODULOS.nombres[idx];
  const desc   = FATLIN_MODULOS.descripciones[idx];
  const accent = `linear-gradient(90deg, #1a3a6b, ${color}, #1a3a6b)`;

  return `
  <div class="cert-wrapper">
    <div class="cert-modulo-preview" id="preview-modulo">
      <div class="cert-modulo" id="cert-inner-modulo">

        <div class="mod-accent-top" style="background:${accent}"></div>

        <div class="mod-navy-bar">
          <span class="mod-nav-txt">Fatlin AI · Metodología PACIE</span>
          <span class="mod-nav-txt">Módulo ${romano} de V</span>
        </div>

        <div class="mod-body">

          <div class="mod-inst-row">
            <div class="mod-logo-wrap">
              ${fatlinLogoAzul(48)}
              <div>
                <div class="mod-inst-name">Fatlin AI</div>
                <div class="mod-inst-sub">Avalado por Planeta FATLA · ASOMTV</div>
              </div>
            </div>
            <div class="mod-doc-type">
              <div class="mod-doc-lbl">Documento académico</div>
              <div class="mod-doc-val">Certificado de Módulo</div>
            </div>
          </div>

          <div class="mod-center">
            <div class="mod-certify-lbl">Se certifica que</div>
            <div class="mod-name">${d.name}</div>
            <div class="mod-badge" style="border-color:${color};color:${color}">
              Módulo ${romano} — ${nombre}
            </div>
            <div class="mod-desc">${desc}</div>
            <div class="pacie-row">
              <span class="pp pp-p">Presencia</span>
              <span class="pp pp-a">Alcance</span>
              <span class="pp pp-c">Capacitación</span>
              <span class="pp pp-i">Interacción</span>
              <span class="pp pp-e">E-learning</span>
            </div>
            <div class="mod-metrics">
              <div class="mod-metric">
                <div class="mod-mval">80</div>
                <div class="mod-mlbl">Niveles</div>
              </div>
              <div class="mod-metric">
                <div class="mod-mval">${romano}</div>
                <div class="mod-mlbl">Módulo</div>
              </div>
              <div class="mod-metric">
                <div class="mod-mval">36</div>
                <div class="mod-mlbl">Horas</div>
              </div>
              <div class="mod-metric">
                <div class="mod-mval">IA</div>
                <div class="mod-mlbl">Evaluación</div>
              </div>
              <div class="mod-metric">
                <div class="mod-mval">1</div>
                <div class="mod-mlbl">Mes equiv.</div>
              </div>
            </div>
          </div>

        </div>

        <div class="mod-accent-bot"></div>

        <div class="mod-footer">
          <div class="mod-orgs">
            <span class="mod-org">FATLA</span>
            <span class="mod-org-div"></span>
            <span class="mod-org">Fatlin AI</span>
            <span class="mod-org-div"></span>
            <span class="mod-org">ASOMTV</span>
          </div>
          <div class="mod-right">
            <div style="text-align:right">
              <div class="mod-date-lbl">Emitido el</div>
              <div class="mod-date-val">${d.date}</div>
              <div class="mod-cert-id">${d.certId}</div>
            </div>
            <div class="mod-qr">${qrModulo(d.qr)}</div>
          </div>
        </div>

      </div>
    </div>

    <div class="cert-actions">
      <button class="btn-print"
              style="background:#1a3a6b;color:#fff;"
              onclick="printCert('modulo')">
        Imprimir · Guardar PDF
      </button>
    </div>
  </div>`;
}

/* ──────────────────────────────────────────────────────────
   renderDiplomado(data)
   ────────────────────────────────────────────────────────── */

function renderDiplomado(data) {
  const d = {
    name:      data.name   || 'Participante',
    date:      data.date   || '—',   /* fecha de emisión desde Firestore — nunca new Date() */
    certId:    data.certId || `FATLIN-${new Date().getFullYear()}-DIPLOM-${_uid()}`,
    qr:        data.qr     || '',
    signer1:   data.signer1   || { name: 'Xxxxxx Xxx Xxxxxx', role: 'Yyyy Yyyyy · FATLA' },
    signer2:   data.signer2   || { name: 'Xxxxxx Xxx Xxxxxx', role: 'Yyyy Yyyyy' },
    pacieImg:  data.pacieImg  || 'pacie-icon-boxes.png',
  };

  /* ── URL de verificación: calcular UNA sola vez, sin doble-encode ── */
  const verifyUrl = d.qr || `https://fatlin.web.app/verify-pending.html?id=${d.certId}`;
  const qrApiUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&ecc=M&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=0f2456&qzone=3`;

  /* ── SHA-256 se genera de forma asíncrona tras insertar el HTML ── */
  const uid = `dc-${Date.now()}`;

  /* Dispara el cálculo SHA-256 en el siguiente tick (el DOM ya existirá) */
  setTimeout(async () => {
    try {
      const buf = await crypto.subtle.digest(
        'SHA-256', new TextEncoder().encode(d.certId));
      const hex = Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2,'0')).join('');
      const elHash  = document.getElementById(`${uid}-hash`);
      const elFoot  = document.getElementById(`${uid}-foot-hash`);
      if (elHash)  elHash.textContent  = hex;
      if (elFoot)  elFoot.textContent  = 'sha256:' + hex.substring(0, 32) + '…';
    } catch(_) { /* silencioso */ }
  }, 80);

  return `
  <div class="cert-wrapper">
    <div class="cert-diplomado-preview" id="preview-diplomado">
      <div class="cert-diplomado" id="cert-inner-diplomado">

        <!-- ══ Marco dorado doble (via CSS ::before/::after en .cert-diplomado) ══ -->

        <!-- ══ Esquinas caladas ══ -->
        <div class="dc-corn" style="top:16px;left:16px">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <path d="M108,62 L108,2 L48,2" stroke="#c8920a" stroke-width="3.5" fill="none" stroke-linecap="square"/>
            <path d="M94,58 L94,16 L58,16" stroke="#1a3a6b" stroke-width="1" fill="none" stroke-linecap="square" opacity=".4"/>
            <rect x="-7" y="-7" width="14" height="14" fill="#c8920a" transform="rotate(45,2,2)"/>
          </svg>
        </div>
        <div class="dc-corn" style="top:16px;right:16px">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <path d="M2,62 L2,2 L62,2" stroke="#c8920a" stroke-width="3.5" fill="none" stroke-linecap="square"/>
            <path d="M16,58 L16,16 L52,16" stroke="#1a3a6b" stroke-width="1" fill="none" stroke-linecap="square" opacity=".4"/>
            <rect x="-7" y="-7" width="14" height="14" fill="#c8920a" transform="rotate(45,108,2)"/>
          </svg>
        </div>
        <div class="dc-corn" style="bottom:16px;left:16px">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <path d="M108,48 L108,108 L48,108" stroke="#c8920a" stroke-width="3.5" fill="none" stroke-linecap="square"/>
            <path d="M94,52 L94,94 L58,94" stroke="#1a3a6b" stroke-width="1" fill="none" stroke-linecap="square" opacity=".4"/>
            <rect x="-7" y="-7" width="14" height="14" fill="#c8920a" transform="rotate(45,2,108)"/>
          </svg>
        </div>
        <div class="dc-corn" style="bottom:16px;right:16px">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <path d="M2,48 L2,108 L62,108" stroke="#c8920a" stroke-width="3.5" fill="none" stroke-linecap="square"/>
            <path d="M16,52 L16,94 L52,94" stroke="#1a3a6b" stroke-width="1" fill="none" stroke-linecap="square" opacity=".4"/>
            <rect x="-7" y="-7" width="14" height="14" fill="#c8920a" transform="rotate(45,108,108)"/>
          </svg>
        </div>

        <!-- ══ Watermark ══ -->
        <div class="dc-wm">
          <svg width="1100" height="1100" viewBox="0 0 100 100">
            <path d="M50 90 L90 70 L50 50 L10 70 Z" fill="#c8920a"/>
            <path d="M50 82 L90 62 L50 42 L10 62 Z" fill="#d4a017"/>
            <path d="M50 74 L90 54 L50 34 L10 54 Z" fill="#e0b020"/>
            <path d="M50 66 L90 46 L50 26 L10 46 Z" fill="#ecc030"/>
            <path d="M50 58 L90 38 L50 18 L10 38 Z" fill="#f0c040"/>
            <path d="M50 50 L75 38 L50 26 L25 38 Z" fill="#f8d870"/>
          </svg>
        </div>

        <!-- ══ Contenido interior ══ -->
        <div class="dc-inn">

          <!-- ① HEADER: PACIE (extremo izq) ←────────sep────────→ Fatlin AI (extremo der) -->
          <div class="dc-hdr">

            <!-- PACIE — extremo izquierdo: SVG inline (2 cuadros superpuestos) + nombre -->
            <div class="dc-hdr-brand">
              <!-- Emblema PACIE: cuadro teal arriba-izq + cuadro negro abajo-der superpuesto -->
              <svg width="200" height="200" viewBox="0 0 130 130"
                   xmlns="http://www.w3.org/2000/svg"
                   style="flex-shrink:0;display:block;"
                   aria-label="PACIE emblema">
                <!-- cuadro teal superior-izquierda -->
                <rect x="0"  y="0"  width="88" height="88" fill="#0bbdb6"/>
                <!-- cuadro negro inferior-derecha superpuesto -->
                <rect x="42" y="42" width="88" height="88" fill="#1a1a1a"/>
                <!-- zona intersección en blanco → crea el efecto de hueco -->
                <rect x="42" y="42" width="46" height="46" fill="#ffffff"/>
              </svg>
              <div class="dc-hdr-text">
                <div class="dc-hdr-name dc-hdr-teal">PACIE</div>
                <div class="dc-hdr-sub">Modelo Tecnopedagógico</div>
              </div>
            </div>

            <div class="dc-hdr-sep"></div>

            <!-- Fatlin AI — extremo derecho: logo + nombre + subtítulo en fila -->
            <div class="dc-hdr-brand dc-hdr-brand-r">
              <div class="dc-hdr-text dc-hdr-text-r">
                <div class="dc-hdr-name dc-hdr-blue">FATLIN AI</div>
                <div class="dc-hdr-sub">Plataforma Educativa</div>
              </div>
              <svg width="160" height="160" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
                <defs>
                  <radialGradient id="dc-rg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stop-color="rgba(56,189,248,.22)"/>
                    <stop offset="100%" stop-color="rgba(56,189,248,0)"/>
                  </radialGradient>
                  <linearGradient id="dc-lg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stop-color="#38bdf8"/>
                    <stop offset="100%" stop-color="#075985"/>
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="url(#dc-rg)"/>
                <circle cx="50" cy="50" r="47" fill="none" stroke="#0284c7" stroke-width=".8" opacity=".35"/>
                <path d="M50 90 L90 70 L50 50 L10 70 Z" fill="#075985"/>
                <path d="M50 82 L90 62 L50 42 L10 62 Z" fill="#0369a1"/>
                <path d="M50 74 L90 54 L50 34 L10 54 Z" fill="#0284c7"/>
                <path d="M50 66 L90 46 L50 26 L10 46 Z" fill="#0ea5e9"/>
                <path d="M50 58 L90 38 L50 18 L10 38 Z" fill="#38bdf8"/>
                <path d="M50 50 L75 38 L50 26 L25 38 Z" fill="#7dd3fc"/>
                <circle cx="50" cy="38" r="4" fill="white" opacity=".95"/>
              </svg>
            </div>

          </div>

          <div class="dc-g1"></div>
          <div class="dc-dv"><div class="dc-ln"></div><div class="dc-ds"></div><div class="dc-dm"></div><div class="dc-ds"></div><div class="dc-ln"></div></div>
          <div class="dc-g1"></div>

          <!-- ② TIPO DE DOCUMENTO + TÍTULO -->
          <div class="dc-tb">
            <div class="dc-doctype">La Plataforma Fatlin AI, en nombre de Planeta FATLA y ASOMTV, otorga el presente</div>
            <div class="dc-mtitle">Diplomado en Metodología PACIE</div>
            <div class="dc-msub">Protocolo Genesis-IAG &nbsp;·&nbsp; Evaluación continua por Inteligencia Artificial</div>
          </div>

          <div class="dc-g2"></div>
          <div class="dc-dvstar">
            <div class="dc-ln"></div>
            <svg width="56" height="30" viewBox="0 0 56 30" style="flex-shrink:0;margin:0 22px;">
              <polygon points="28,2 31,10.5 40,10.5 33,16 35.5,24.5 28,19.5 20.5,24.5 23,16 16,10.5 25,10.5" fill="#c8920a"/>
            </svg>
            <div class="dc-ln"></div>
          </div>
          <div class="dc-g2"></div>

          <!-- ③ NOMBRE -->
          <div class="dc-nb">
            <div class="dc-clbl">Se certifica que</div>
            <div class="dc-cname">${d.name}</div>
            <div class="dc-cdesc">Ha participado y aprobado satisfactoriamente los estudios conducentes a la obtención<br>del Título Propio del FATLINAI, digital 100% virtual, como</div>
          </div>

          <div class="dc-g3"></div>

          <!-- ④ TÍTULO PROPIO -->
          <div class="dc-tp">
            <div class="dc-tptext">Experto en Metodología PACIE</div>
            <div class="dc-tpbar"></div>
          </div>

          <div class="dc-g4"></div>

          <!-- ⑤ PÍLDORAS PACIE -->
          <div class="dc-pacie-row">
            <span class="dpp dpp-p">Presencia</span>
            <span class="dpp dpp-a">Alcance</span>
            <span class="dpp dpp-c">Capacitación</span>
            <span class="dpp dpp-i">Interacción</span>
            <span class="dpp dpp-e">E-learning</span>
          </div>

          <div class="dc-g4"></div>
          <div class="dc-dvthin"></div>
          <div class="dc-g5"></div>

          <!-- ⑥ MÉTRICAS -->
          <div class="dc-mets">
            <div class="dc-met"><div class="dc-mv">15</div><div class="dc-ml">Créditos académicos</div></div>
            <div class="dc-met"><div class="dc-mv">6</div><div class="dc-ml">Módulos curriculares</div></div>
            <div class="dc-met"><div class="dc-mv">320</div><div class="dc-ml">Horas académicas</div></div>
            <div class="dc-met"><div class="dc-mv">IA</div><div class="dc-ml">Evaluación continua</div></div>
            <div class="dc-met"><div class="dc-mv">6m</div><div class="dc-ml">Equivalente online</div></div>
          </div>

          <div class="dc-g5"></div>

          <!-- ⑦ FIRMAS + SELLO -->
          <div class="dc-sigwrap">
            <div class="dc-sigrow">
              <!-- Firma izquierda -->
              <div class="dc-sig">
                <div class="dc-svgw">
                  <svg viewBox="0 0 400 130" width="400" height="130">
                    <path d="M10,100 C50,36 100,116 156,68 C192,36 232,92 288,68 C324,48 364,80 390,60"
                          stroke="#1a3a6b" stroke-width="4.4" fill="none" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="dc-sline"></div>
                <div class="dc-sname">${d.signer1.name}</div>
                <div class="dc-srole">${d.signer1.role}</div>
              </div>

              <!-- Sello institucional -->
              <svg viewBox="0 0 160 160" width="380" height="380">
                <circle cx="80" cy="80" r="76" fill="none" stroke="#1a3a6b" stroke-width="2.5" stroke-dasharray="6 4"/>
                <circle cx="80" cy="80" r="63" fill="none" stroke="#c8920a" stroke-width="1.5"/>
                <circle cx="80" cy="80" r="52" fill="rgba(26,58,107,.03)"/>
                <text x="80" y="48"  text-anchor="middle" font-size="10"  fill="#1a3a6b" font-family="Georgia,serif" letter-spacing="2.5" font-weight="700">FATLIN AI</text>
                <text x="80" y="67"  text-anchor="middle" font-size="15"  fill="#1a3a6b" font-family="Georgia,serif" font-weight="700">OFICIAL</text>
                <text x="80" y="83"  text-anchor="middle" font-size="9.5" fill="#c8920a" font-family="Georgia,serif" letter-spacing="1.5">PLANETA FATLA</text>
                <text x="80" y="97"  text-anchor="middle" font-size="9"   fill="#1a3a6b" font-family="Georgia,serif" letter-spacing="1">ASOMTV · 2026</text>
                <text x="80" y="116" text-anchor="middle" font-size="7.5" fill="#1a3a6b" font-family="Georgia,serif" letter-spacing="1.5" opacity=".55">SELLO INSTITUCIONAL</text>
                <polygon points="80,20 83,29 92.5,29 85,35 87.5,44.5 80,39 72.5,44.5 75,35 67.5,29 77,29" fill="#c8920a" opacity=".9"/>
              </svg>

              <!-- Firma derecha -->
              <div class="dc-sig">
                <div class="dc-svgw">
                  <svg viewBox="0 0 400 130" width="400" height="130">
                    <path d="M8,92 C52,32 100,108 152,60 C188,28 232,84 288,60 C328,44 368,76 392,52"
                          stroke="#1a3a6b" stroke-width="4.4" fill="none" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="dc-sline"></div>
                <div class="dc-sname">${d.signer2.name}</div>
                <div class="dc-srole">${d.signer2.role}</div>
              </div>
            </div>
          </div>

          <div class="dc-g6"></div>

          <!-- ⑧ HUELLA DIGITAL SHA-256 -->
          <div class="dc-huella-block">
            <div class="dc-dvthin" style="width:100%;margin-bottom:20px;"></div>
            <div class="dc-huella-label">Huella digital del certificado &nbsp;·&nbsp; SHA-256</div>
            <div class="dc-huella-id">${d.certId}</div>
            <div class="dc-huella-hash" id="${uid}-hash">calculando…</div>
          </div>

          <div class="dc-g7"></div>

          <!-- ⑨ FOOTER — orgs + fecha + QR dentro del canvas nativo -->
          <div class="dc-foot" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:36px 48px;gap:32px;border-top:1.5px solid rgba(200,146,10,0.35);margin-top:0;background:transparent;">

            <!-- Organizaciones — extremo izquierdo -->
            <div style="display:flex;flex-direction:column;gap:6px;flex:1;">
              <div style="font-size:18px;text-transform:uppercase;letter-spacing:3px;color:#94a3b8;margin-bottom:4px;font-family:sans-serif;">Avalado por</div>
              <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
                <span style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1a3a6b;">FATLA</span><span style="color:#c8920a;font-size:22px;margin:0 4px;">·</span>
                <span style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1a3a6b;">Fatlin AI</span><span style="color:#c8920a;font-size:22px;margin:0 4px;">·</span>
                <span style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1a3a6b;">ASOMTV</span><span style="color:#c8920a;font-size:22px;margin:0 4px;">·</span>
                <span style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1a3a6b;">Planeta FATLA</span>
              </div>
            </div>

            <!-- Fecha + hash — centro -->
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;text-align:center;">
              <div style="font-size:16px;text-transform:uppercase;letter-spacing:3px;color:#94a3b8;font-family:sans-serif;">World Wide Web, emitido el</div>
              <div style="font-family:'Georgia',serif;font-size:24px;font-weight:700;color:#1a3a6b;">${d.date}</div>
              <div id="${uid}-foot-hash" style="font-family:'Courier New',monospace;font-size:16px;color:#94a3b8;word-break:break-all;max-width:500px;">sha256:…</div>
            </div>

            <!-- QR verificación — extremo derecho, DENTRO del canvas -->
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex-shrink:0;">
              <div style="width:220px;height:220px;border:3px solid #c8920a;border-radius:10px;
                          padding:8px;background:#fff;box-shadow:0 2px 12px rgba(200,146,10,0.2);">
                <a href="${verifyUrl}" target="_blank" rel="noopener"
                   style="display:block;width:204px;height:204px;text-decoration:none;"
                   onclick="event.stopPropagation();window.open('${verifyUrl}','_blank');return false;">
                  <img src="${qrApiUrl}"
                       alt="QR verificación"
                       style="display:block;width:204px;height:204px;border-radius:4px;pointer-events:none;"
                       loading="eager" crossorigin="anonymous">
                </a>
              </div>
              <div style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;font-family:sans-serif;">Escanea para verificar</div>
            </div>

          </div>

        </div><!-- /dc-inn -->
      </div><!-- /cert-diplomado -->
    </div><!-- /preview -->

    <div class="cert-actions">
      <button class="btn-print"
              style="background:#c8920a;color:#fff;"
              onclick="printCert('diplomado')">
        Descargar Diploma · Guardar PDF
      </button>
    </div>
  </div>`;
}

/* ──────────────────────────────────────────────────────────
   HELPER INTERNO: genera ID único corto
   ────────────────────────────────────────────────────────── */

function _uid() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/* ──────────────────────────────────────────────────────────
   _watchScale — escala el certificado al ancho del wrapper
   FIX: usa RAF + múltiples intentos para garantizar que
   offsetWidth > 0 antes de calcular la escala.
   ────────────────────────────────────────────────────────── */

function _watchScale(wrapperId, certNativeW, certNativeH) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  function applyScale() {
    const cert = wrapper.firstElementChild;
    if (!cert) return;
    const w = wrapper.getBoundingClientRect().width || wrapper.offsetWidth;
    if (!w) return;
    const s = w / certNativeW;
    cert.style.transform       = `scale(${s})`;
    cert.style.transformOrigin = 'top left';
    wrapper.style.height       = (Math.round(w * certNativeH / certNativeW) + 10) + 'px';
  }

  /* ResizeObserver — dispara cuando hay dimensiones reales */
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => applyScale());
    ro.observe(wrapper);
  }

  /* Escucha cambios de ventana (orientación, sidebar) */
  window.addEventListener('resize', applyScale);

  /* Intentos escalonados con RAF para asegurar que el layout se haya pintado */
  requestAnimationFrame(() => {
    applyScale();
    requestAnimationFrame(applyScale); // doble RAF cubre el caso de fonts / imágenes tardías
  });

  /* Último recurso: disparo a 300 ms por si hay fuentes web que retrasan el layout */
  setTimeout(applyScale, 300);
}

/* ──────────────────────────────────────────────────────────
   initCertScale()
   Llamar desde main.js DESPUÉS de insertar el HTML en el DOM.
   ────────────────────────────────────────────────────────── */

function initCertScale() {
  _watchScale('preview-modulo',    1024, 768);
  _watchScale('preview-diplomado', 4200, 2970);
}

/* ──────────────────────────────────────────────────────────
   printCert(tipo)
   tipo: 'modulo' | 'diplomado'
   • Móvil  → html2canvas → descarga PNG
   • Desktop → ventana de impresión dimensionada correctamente
   ────────────────────────────────────────────────────────── */

function printCert(tipo) {
  // ✅ FIX: IDs únicos por tipo para evitar colisión cuando ambos certs
  // están en el DOM simultáneamente (historial de diplomas, etc.)
  const id = tipo === 'diplomado' ? 'cert-inner-diplomado' : 'cert-inner-modulo';
  const certEl = document.getElementById(id);
  if (!certEl) { console.error('[printCert] #' + id + ' no encontrado'); return; }

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) { _certDownloadPNG(certEl, tipo); return; }
  _certPrintWindow(certEl, tipo);
}

/* ── Descarga PNG via html2canvas (móvil y diplomado) ── */
async function _certDownloadPNG(certEl, tipo) {
  if (typeof html2canvas === 'undefined') {
    const msg = '⚠️ Usa "Compartir → Imprimir" desde el navegador';
    typeof window.showToast === 'function'
      ? window.showToast(msg, '#d97706', 5000) : alert(msg);
    return;
  }

  const btn = certEl.closest('.cert-wrapper')?.querySelector('.btn-print');
  const origTxt = btn?.textContent || '';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generando...'; }

  /* Obtener el preview wrapper padre */
  const previewEl = certEl.parentElement;

  /* Guardar estado actual */
  const savedTransform  = certEl.style.transform;
  const savedPosition   = certEl.style.position;
  const savedTop        = certEl.style.top;
  const savedLeft       = certEl.style.left;

  try {
    /* Mostrar a tamaño nativo para captura */
    certEl.style.setProperty('transform',  'none',     'important');
    certEl.style.setProperty('position',   'relative', 'important');
    certEl.style.setProperty('top',        'auto',     'important');
    certEl.style.setProperty('left',       'auto',     'important');
    if (previewEl) {
      previewEl.style.overflow = 'visible';
      previewEl.style.height   = 'auto';
    }

    /* Esperar reflow */
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    /* Esperar que todas las imágenes (incluyendo el QR) estén cargadas */
    await Promise.all(
      Array.from(certEl.querySelectorAll('img')).map(img =>
        img.complete ? Promise.resolve() :
        new Promise(res => { img.onload = res; img.onerror = res; })
      )
    );
    /* Pequeña pausa extra para que el QR se pinte en pantalla */
    await new Promise(r => setTimeout(r, 400));

    /* Escala de captura */
    const captureScale = tipo === 'diplomado' ? 0.5 : 1.5;

    const canvas = await html2canvas(certEl, {
      scale:           captureScale,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: '#ffffff',
      logging:         false,
      imageTimeout:    8000,
    });

    /* Descargar */
    const link = document.createElement('a');
    link.download = tipo === 'diplomado'
      ? 'Fatlin-AI-Diplomado-PACIE.png'
      : 'Fatlin-AI-Certificado-PACIE.png';
    link.href = canvas.toDataURL('image/png', 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch(err) {
    console.error('[printCert] html2canvas error:', err);
    const msg = '⚠️ Usa "Compartir → Imprimir" desde el navegador';
    typeof window.showToast === 'function'
      ? window.showToast(msg, '#d97706', 5000) : alert(msg);
  } finally {
    /* Restaurar estilos */
    certEl.style.transform = savedTransform;
    certEl.style.position  = savedPosition;
    certEl.style.top       = savedTop;
    certEl.style.left      = savedLeft;
    if (previewEl) { previewEl.style.overflow = 'hidden'; previewEl.style.height = ''; }
    requestAnimationFrame(() => { if (typeof initCertScale === 'function') initCertScale(); });
    if (btn) { btn.disabled = false; btn.textContent = origTxt; }
  }
}

/* ── Ventana de impresión desktop ── */
function _certPrintWindow(certEl, tipo) {
  const nativeW = tipo === 'diplomado' ? 4200 : 1024;
  const nativeH = tipo === 'diplomado' ? 2970 : 768;

  /* Clonar SOLO el cert (sin wrappers de preview) */
  const clone = certEl.cloneNode(true);
  clone.id    = 'cert-clone';
  clone.style.cssText = [
    `width:${nativeW}px`,
    `height:${nativeH}px`,
    'transform:none',
    'position:static',
    'left:auto',
    'top:auto',
    'margin:0',
    'padding:0',
  ].join(';');

  /*
   * Diplomado  → A3 landscape (420×297mm)  ≈ 16.54×11.69in
   *              Cert a 200dpi = 16.54×11.41in → cabe perfectamente
   *              Scale CSS: 420mm / (3307px*25.4/96)mm = 0.4803
   * Módulo     → A4 landscape (297×210mm)
   *              Cert 1024×768px = 10.67×8in → cabe con margen en A4
   */
  const isD    = tipo === 'diplomado';
  const page   = isD ? 'A3 landscape' : 'A4 landscape';
  const scale  = isD ? '0.4803' : '1';
  const bodyW  = isD ? '4200px' : '100%';
  const bodyH  = isD ? '2970px' : 'auto';
  const origin = isD ? 'top left' : 'top center';

  /* Recopilar CSS relevante de la página (evitar reglas de #diploma-content) */
  const certCSS = (() => {
    const rules = [];
    Array.from(document.styleSheets).forEach(ss => {
      try {
        Array.from(ss.cssRules).forEach(r => {
          const txt = r.cssText;
          if (
            /\.cert-|\.mod-|\.dc-|\.pp |\.dpp|btn-print|cert-modulo|cert-diplomado/.test(txt) &&
            !/#diploma-content/.test(txt)
          ) rules.push(txt);
        });
      } catch(e) {}
    });
    return rules.join('\n');
  })();

  const win = window.open('', '_blank', `width=${isD?1300:1100},height=${isD?900:800}`);
  if (!win) {
    typeof window.showToast === 'function'
      ? window.showToast('⚠️ Permite ventanas emergentes para imprimir', '#d97706')
      : alert('Permite ventanas emergentes para imprimir');
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado Fatlin AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body {
      background: #fff;
      display: flex;
      align-items: ${isD ? 'flex-start' : 'center'};
      justify-content: center;
      width: ${bodyW};
      min-height: ${bodyH};
    }
    #cert-clone {
      transform: scale(${scale});
      transform-origin: ${origin};
      flex-shrink: 0;
    }
    @page { size: ${page}; margin: ${isD ? '0' : '10mm'}; }
    @media print {
      body { background:#fff !important; }
      #cert-clone { transform:scale(${scale}); transform-origin:${origin}; }
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    ${certCSS}
  </style>
</head>
<body>${clone.outerHTML}
<script>
  window.addEventListener('load', function() {
    document.fonts.ready.then(function() {
      var imgs = Array.from(document.querySelectorAll('img'));
      if (!imgs.length) { setTimeout(function(){ window.print(); }, 500); return; }
      var done = 0;
      function check() { if (++done >= imgs.length) setTimeout(function(){ window.print(); }, 500); }
      imgs.forEach(function(img) {
        if (img.complete) check();
        else { img.onload = check; img.onerror = check; }
      });
      setTimeout(function(){ window.print(); }, 3000);
    });
  });
  window.onafterprint = function() { window.close(); };
<\/script>
</body>
</html>`);
  win.document.close();
}

/* ──────────────────────────────────────────────────────────
   EXPOSICIÓN GLOBAL
   ────────────────────────────────────────────────────────── */

window.renderModulo    = renderModulo;
window.renderDiplomado = renderDiplomado;
window.initCertScale   = initCertScale;
window.printCert       = printCert;

/* ──────────────────────────────────────────────────────────
   COMPATIBILIDAD LEGACY — renderByLevel()
   ────────────────────────────────────────────────────────── */

window.renderByLevel = function(data) {
  const level = parseInt(data.level) || 0;
  return (level >= 480)
    ? renderDiplomado(data)
    : renderModulo({ ...data, modulo: Math.ceil(level / 80) || 1 });
};
