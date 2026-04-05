/* ═══════════════════════════════════════════════════════════════
   Fatlin AI — fixes_diploma.js
   FIX A: Escala dinámica del diploma para que entre en pantalla
   FIX B: Diplomado marca clase .is-diplo para CSS correcto
   FIX C: Ventana de impresión con tamaño de página exacto y HD
   FIX D: Botón imprimir siempre visible (reubicación DOM)
   Instrucción: agregar en index.html ANTES de </body>
   <script src="js/fixes_diploma.js?v=1"></script>
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CONSTANTES DE TAMAÑO (en píxeles — mismos que el CSS)
     Certificados  80-400: A4 landscape HD  → 1684 × 1190
     Diplomado     480+:   Doble carta HD   → 1700 × 1100
  ───────────────────────────────────────────────────────────── */
  const SIZES = {
    cert:   { w: 1684, h: 1190, page: 'A4 landscape',     label: 'A4 landscape' },
    diplo:  { w: 1700, h: 1100, page: '11in 8.5in',       label: 'Doble Carta landscape' },
  };

  /* ─────────────────────────────────────────────────────────────
     FIX B — Marcar el #diploma-content con .is-diplo
     según el nivel del diploma que se está mostrando.
     generateDiploma en main.js usa `completedLevel`.
     Niveles ≥ 480 → Diplomado (doble carta).
  ───────────────────────────────────────────────────────────── */
  function markDiplomaType(completedLevel) {
    const el = document.getElementById('diploma-content');
    if (!el) return;
    const isDiplo = completedLevel >= 480;
    el.classList.toggle('is-diplo', isDiplo);
    scaleDiploma(); // re-escalar después de cambiar clase
  }

  /* ─────────────────────────────────────────────────────────────
     FIX A — Escala dinámica del diploma para caber en pantalla
     Calcula transform:scale(N) según el espacio disponible
     (viewport menos la barra de botones de ~72px).
  ───────────────────────────────────────────────────────────── */
  function scaleDiploma() {
    const el = document.getElementById('diploma-content');
    if (!el) return;

    const isDiplo = el.classList.contains('is-diplo');
    const size = isDiplo ? SIZES.diplo : SIZES.cert;

    // Espacio disponible = viewport menos botones y padding
    const availW = window.innerWidth  - 32;  // 16px padding × 2
    const availH = window.innerHeight - 100; // ~72px botones + 28px margen

    const scaleX = availW / size.w;
    const scaleY = availH / size.h;
    const scale  = Math.min(scaleX, scaleY, 1); // nunca agrandar más de 1:1

    el.style.transform = `scale(${scale})`;

    // Ajustar el contenedor scroll para que no haya espacio en blanco
    const scaledH = size.h * scale;
    const zone = document.querySelector('.diploma-scroll-zone');
    if (zone) {
      zone.style.minHeight = `${scaledH + 24}px`;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     FIX D — Reubicar el DOM del modal-diploma
     El HTML original tiene:
       .diploma-wrap > #diploma-content + .diploma-actions
     Necesitamos:
       .diploma-wrap > .diploma-scroll-zone(#diploma-content) + .diploma-actions
     Así los botones quedan sticky al fondo.
  ───────────────────────────────────────────────────────────── */
  function fixDiplomaLayout() {
    const wrap    = document.querySelector('#modal-diploma .diploma-wrap');
    const content = document.getElementById('diploma-content');
    const actions = document.querySelector('#modal-diploma .diploma-actions');

    if (!wrap || !content || !actions) return;
    if (wrap.querySelector('.diploma-scroll-zone')) return; // ya aplicado

    // Crear zona de scroll
    const zone = document.createElement('div');
    zone.className = 'diploma-scroll-zone';

    // Mover #diploma-content dentro de la zona
    wrap.insertBefore(zone, content);
    zone.appendChild(content);

    // Asegurar que .diploma-actions es el último hijo (sticky bottom)
    wrap.appendChild(actions);

    console.log('[Diploma Fix] Layout reubicado: scroll-zone + sticky actions.');
  }

  /* ─────────────────────────────────────────────────────────────
     FIX C — Ventana de impresión HD con tamaño de página exacto
     Reemplaza la función onclick del botón btn-dip-print.
  ───────────────────────────────────────────────────────────── */
  function patchPrintButton() {
    const btn = document.getElementById('btn-dip-print');
    if (!btn) return;

    btn.onclick = function () {
      btn.disabled = true;
      btn.textContent = '⏳ Preparando...';

      try {
        const el      = document.getElementById('diploma-content');
        const isDiplo = el.classList.contains('is-diplo');
        const size    = isDiplo ? SIZES.diplo : SIZES.cert;

        // Extraer CSS relevante (mismas reglas que el original, más las nuestras)
        const diplomaCSS = Array.from(document.styleSheets)
          .flatMap(ss => {
            try { return Array.from(ss.cssRules).map(r => r.cssText); }
            catch (e) { return []; }
          })
          .filter(r => /diploma|cert-|cer-|dip-|wbtn|is-diplo|Playfair|Source.Serif|JetBrains/.test(r))
          .join('\n');

        // Clonar el diploma SIN el transform de escala para obtener tamaño real
        const clone = el.cloneNode(true);
        clone.style.transform = 'none';
        clone.style.width     = `${size.w}px`;
        clone.style.height    = `${size.h}px`;
        clone.style.maxWidth  = 'none';
        clone.style.borderRadius = '0'; // sin bordes redondeados en papel
        clone.style.boxShadow    = 'none';
        clone.removeAttribute('id'); // evitar conflictos de ID

        const w = window.open('', '_blank', `width=${size.w},height=${size.h + 60}`);
        if (!w) {
          showToastSafe('⚠️ Permite ventanas emergentes para imprimir', '#d97706');
          btn.disabled = false;
          btn.textContent = '🖨️ Generar PDF';
          return;
        }

        w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado Fatlin AI — ${isDiplo ? 'Diplomado' : 'Certificado'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* Forzar página exacta */
    @page {
      size: ${size.page};
      margin: 0;
    }

    html, body {
      width:  ${size.w}px;
      height: ${size.h}px;
      overflow: hidden;
      background: #0a1628;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* El diploma ocupa exactamente la página */
    #diploma-print-root {
      width:  ${size.w}px !important;
      height: ${size.h}px !important;
      max-width: none !important;
      aspect-ratio: unset !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      transform: none !important;
      position: relative;
      overflow: hidden;
    }

    @media print {
      html, body {
        width:  ${size.w}px;
        height: ${size.h}px;
      }
      #diploma-print-root {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }

    /* CSS del diploma extraído de la app */
    ${diplomaCSS}
  </style>
</head>
<body>
  ${clone.outerHTML.replace('class="', 'id="diploma-print-root" class="')}
  <script>
    // Re-generar QR si existe la librería
    if (typeof QRCode !== 'undefined') {
      const qrEl = document.getElementById('dip-qr-container');
      if (qrEl && qrEl.dataset.url) {
        try {
          new QRCode(qrEl, {
            text: qrEl.dataset.url,
            width: 110, height: 110,
            colorDark: '#002860', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
        } catch(e) {}
      }
    }

    // Imprimir después de que las fuentes carguen
    document.fonts.ready.then(function() {
      // Esperar un tick extra para que los SVG y QR rendericen
      setTimeout(function() {
        window.print();
        window.onafterprint = function() { window.close(); };
      }, 1200);
    });
  <\/script>
</body>
</html>`);
        w.document.close();

      } catch (err) {
        console.error('[Diploma print error]:', err);
        showToastSafe('Error al preparar la impresión', '#dc2626');
      } finally {
        setTimeout(function () {
          btn.disabled = false;
          btn.innerHTML = '🖨️ Generar PDF';
        }, 2000);
      }
    };

    console.log('[Diploma Fix] Botón imprimir parcheado con calidad HD.');
  }

  /* Helper: showToast puede no existir todavía */
  function showToastSafe(msg, color) {
    if (typeof showToast === 'function') showToast(msg, color);
    else console.warn('[Toast]', msg);
  }

  /* ─────────────────────────────────────────────────────────────
     PATCH generateDiploma — interceptar para marcar tipo y escalar
  ───────────────────────────────────────────────────────────── */
  function patchGenerateDiploma() {
    const MAX_WAIT = 6000;
    const STEP     = 150;
    let waited     = 0;

    const timer = setInterval(function () {
      waited += STEP;

      if (typeof window.generateDiploma !== 'function') {
        if (waited >= MAX_WAIT) {
          clearInterval(timer);
          console.warn('[Diploma Fix] generateDiploma no encontrada.');
        }
        return;
      }

      clearInterval(timer);
      const original = window.generateDiploma;

      window.generateDiploma = function (completedLevel) {
        // Marcar el tipo ANTES de llamar al original
        // (el original hace classList.add('active') al final)
        markDiplomaType(completedLevel);

        const result = original.call(this, completedLevel);

        // Si es promesa, esperar; si no, escalar de inmediato
        if (result && typeof result.then === 'function') {
          result.then(function () {
            requestAnimationFrame(scaleDiploma);
          });
        } else {
          requestAnimationFrame(scaleDiploma);
        }

        return result;
      };

      console.log('[Diploma Fix] generateDiploma interceptado.');
    }, STEP);
  }

  /* ─────────────────────────────────────────────────────────────
     OBSERVAR apertura del modal para re-escalar
  ───────────────────────────────────────────────────────────── */
  function observeModal() {
    const modal = document.getElementById('modal-diploma');
    if (!modal) return;

    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          if (modal.classList.contains('active')) {
            // El modal se abrió → escalar
            requestAnimationFrame(scaleDiploma);
          }
        }
      });
    }).observe(modal, { attributes: true });
  }

  /* ─────────────────────────────────────────────────────────────
     RESIZE: re-escalar cuando cambia el tamaño de pantalla
  ───────────────────────────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scaleDiploma, 120);
  });

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  function init() {
    fixDiplomaLayout();
    patchPrintButton();
    patchGenerateDiploma();
    observeModal();
    scaleDiploma(); // escalar si el modal ya está visible (improbable, pero seguro)
    console.log('[Fatlin fixes_diploma] ✅ Todos los fixes de diploma aplicados.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
