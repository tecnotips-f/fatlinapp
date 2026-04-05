/* ═══════════════════════════════════════════════════════════════
   Fatlin AI — fixes.js  (archivo único, reemplaza v2/diploma/v3)
   1.  Botón Pausar — siempre funciona
   2.  stat-user visible en HUD
   3.  Footer restaurado con texto correcto
   4.  Diploma verificador — doble escritura Firebase
   5.  Modal-rest wrapper
   6.  Diploma: layout scroll-zone + botones sticky
   7.  Diploma: marca .is-diplo según nivel (480+ = doble carta)
   8.  Diploma: escala dinámica para caber en pantalla
   9.  Diploma: ventana impresión HD con @page exacto
   10. Diploma: PDF móvil con html2canvas (no queda colgado)
   11. Paywall: clic en nodo 81/161 no salta al mapa
   12. Sidebar GALA: badge visible cuando GALA está activo
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── TAMAÑOS DE PÁGINA ────────────────────────────────────
     A4 landscape:      297×210mm a 150dpi = 1754×1240px
     Doble carta land.: 431×279mm a 150dpi, escala 70% = 1785×1155px
  ────────────────────────────────────────────────────────── */
  const SIZES = {
    cert:  { w: 1754, h: 1240, page: 'A4 landscape' },
    diplo: { w: 1785, h: 1155, page: '279mm 216mm'  },
  };

  /* ══════════════════════════════════════════════════════════
     1 — BOTÓN PAUSAR
  ══════════════════════════════════════════════════════════ */
  window.pauseChallenge = function () {
    const modal = document.getElementById('modal-challenge');
    if (!modal || !modal.classList.contains('active')) return;
    modal.classList.remove('active');
    document.body.classList.remove('in-challenge');
    try {
      if (typeof game !== 'undefined') {
        game.isProcessing = false;
        game.correctCount = 0;
        game.consecutiveErrors = 0;
      }
      if (typeof renderMap    === 'function') renderMap();
      if (typeof centerCamera === 'function') centerCamera();
    } catch (e) {}
    if (typeof showToast === 'function') showToast('⏸ Desafío pausado — vuelve cuando quieras', '#0369a1');
  };

  /* ══════════════════════════════════════════════════════════
     2 — stat-user visible
  ══════════════════════════════════════════════════════════ */
  function fixUserVisibility() {
    const el = document.getElementById('stat-user');
    if (!el) return;
    if (!el.innerText || el.innerText === '...') {
      try {
        if (typeof game !== 'undefined' && game.user)
          el.innerText = game.user.displayName || game.user.email?.split('@')[0] || 'Usuario';
      } catch (e) {}
    }
    el.style.cssText += ';max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:middle;';
    const parent = el.closest('.hstat-name');
    if (parent) parent.style.cssText += ';min-width:60px;flex-shrink:1;';
  }

  /* ══════════════════════════════════════════════════════════
     3 — FOOTER con texto original correcto
  ══════════════════════════════════════════════════════════ */
  function fixFooter() {
    const footer = document.querySelector('footer.page-footer');
    if (!footer) return;
    // Si el <p> fue eliminado, restaurarlo
    if (!footer.querySelector('p')) {
      footer.innerHTML = '<p data-i18n="footer">Tecnotips &copy; - 2026 &nbsp;&middot;&nbsp; Tecnolog&iacute;a con prop&oacute;sito</p>';
    }
    // Actualizar el nivel en la función i18n si existe
    if (typeof applyI18n === 'function') { try { applyI18n(); } catch(e){} }
  }

  /* ══════════════════════════════════════════════════════════
     4 — DIPLOMA: doble escritura Firebase para verificador
  ══════════════════════════════════════════════════════════ */
  function patchDiplomaVerification() {
    waitFor(() => typeof window.generateDiploma === 'function', 8000, function () {
      const orig = window.generateDiploma;
      window.generateDiploma = async function (completedLevel) {
        await orig.call(this, completedLevel);
        try {
          const { getFirestore, doc, setDoc } = await import(
            'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js'
          );
          if (typeof game === 'undefined' || !game.user) return;
          const name = game.user.displayName || game.user.email?.split('@')[0] || 'Usuario';
          const year = new Date().getFullYear();
          const shortName = name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 4);
          const seedStr = `${game.user.uid}-${completedLevel}-${year}`;
          let _h = 2166136261;
          for (let i = 0; i < seedStr.length; i++) { _h ^= seedStr.charCodeAt(i); _h = Math.imul(_h, 16777619) >>> 0; }
          const rand = _h.toString(36).substring(0, 5).toUpperCase();
          const tierLabels = { 80:'BRONCE',160:'PLATA',240:'ORO',320:'PLATINO',400:'DIAMANTE',480:'GRAN' };
          const tierInitial = (tierLabels[completedLevel] || 'B')[0];
          const certId = `FATLIN-${year}-${shortName}${completedLevel}${tierInitial}-${rand}`;
          const db = getFirestore();
          await setDoc(doc(db, 'fatlin_diplomas', certId), {
            certId, level: completedLevel, userName: name,
            userUid: game.user.uid, issuedAt: Date.now(), valid: true
          }, { merge: true });
        } catch (e) { console.warn('[FIX4]', e); }
      };
    });
  }

  /* ══════════════════════════════════════════════════════════
     5 — MODAL-REST: agregar wrapper si falta
  ══════════════════════════════════════════════════════════ */
  function fixRestModal() {
    const card = document.querySelector('.rest-card:not(#modal-rest .rest-card)');
    if (!card || card.closest('#modal-rest')) return;
    const wrap = document.createElement('div');
    wrap.id = 'modal-rest';
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9500;display:none;align-items:center;justify-content:center;padding:20px;';
    card.parentNode.insertBefore(wrap, card);
    wrap.appendChild(card);
    const origShow  = window.showRestModal;
    const origClose = window.closeRestModal;
    if (origShow)  window.showRestModal  = function ()   { origShow();  wrap.style.display = 'flex'; };
    if (origClose) window.closeRestModal = function (sk) { wrap.style.display = 'none'; if (origClose) origClose(sk); };
  }

  /* ══════════════════════════════════════════════════════════
     6 — DIPLOMA: reubicación DOM (scroll-zone + sticky actions)
  ══════════════════════════════════════════════════════════ */
  function fixDiplomaLayout() {
    const wrap    = document.querySelector('#modal-diploma .diploma-wrap');
    const content = document.getElementById('diploma-content');
    const actions = document.querySelector('#modal-diploma .diploma-actions');
    if (!wrap || !content || !actions || wrap.querySelector('.diploma-scroll-zone')) return;
    const zone = document.createElement('div');
    zone.className = 'diploma-scroll-zone';
    wrap.insertBefore(zone, content);
    zone.appendChild(content);
    wrap.appendChild(actions);
  }

  /* ══════════════════════════════════════════════════════════
     7 — DIPLOMA: marcar .is-diplo
  ══════════════════════════════════════════════════════════ */
  function markDiplomaType(level) {
    const el = document.getElementById('diploma-content');
    if (!el) return;
    el.classList.toggle('is-diplo', level >= 480);
    scaleDiploma();
  }

  /* ══════════════════════════════════════════════════════════
     8 — DIPLOMA: escala dinámica
  ══════════════════════════════════════════════════════════ */
  function scaleDiploma() {
    const el = document.getElementById('diploma-content');
    if (!el) return;
    const size  = el.classList.contains('is-diplo') ? SIZES.diplo : SIZES.cert;
    const scale = Math.min((window.innerWidth - 32) / size.w, (window.innerHeight - 100) / size.h, 1);
    el.style.transform = `scale(${scale})`;
    const zone = document.querySelector('.diploma-scroll-zone');
    if (zone) zone.style.minHeight = `${size.h * scale + 24}px`;
  }

  /* ══════════════════════════════════════════════════════════
     9 — DIPLOMA: ventana impresión HD
  ══════════════════════════════════════════════════════════ */
  function patchPrintButton() {
    const btn = document.getElementById('btn-dip-print');
    if (!btn) return;

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (isMobile) {
      /* ── 10. PDF MÓVIL: html2canvas → descarga JPG ─────── */
      btn.onclick = async function () {
        btn.disabled = true;
        btn.innerHTML = '⏳ Generando...';
        try {
          const el = document.getElementById('diploma-content');
          if (!el) throw new Error('Sin diploma');
          if (typeof html2canvas === 'undefined') throw new Error('html2canvas no disponible');
          const origTransform = el.style.transform;
          el.style.transform = 'none';
          await new Promise(r => requestAnimationFrame(r));
          await new Promise(r => setTimeout(r, 200));
          const isDiplo = el.classList.contains('is-diplo');
          const size = isDiplo ? SIZES.diplo : SIZES.cert;
          const canvas = await html2canvas(el, {
            scale: 1, useCORS: true, allowTaint: true,
            backgroundColor: '#0a1628',
            width: size.w, height: size.h,
            logging: false, imageTimeout: 8000,
          });
          el.style.transform = origTransform;
          const link = document.createElement('a');
          const certId = document.getElementById('dip-cert-id')?.textContent || 'certificado';
          link.download = `Certificado_FatlinAI_${certId.replace(/[^A-Z0-9-]/gi,'_')}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          if (typeof showToast === 'function')
            showToast('✅ Imagen descargada — comparte o imprime desde tu galería', '#16a34a');
        } catch (err) {
          console.error('[FIX10]', err);
          if (typeof showToast === 'function')
            showToast('⚠️ Usa "Compartir → Imprimir" desde el navegador', '#d97706');
        } finally {
          btn.disabled = false;
          btn.innerHTML = '🖨️ Generar PDF';
          scaleDiploma();
        }
      };
      return;
    }

    /* ── 9. DESKTOP: html2canvas → imagen → print (1 página exacta) ── */
    btn.onclick = async function () {
      btn.disabled = true;
      btn.innerHTML = '⏳ Generando...';
      try {
        const el = document.getElementById('diploma-content');
        if (!el) throw new Error('Sin diploma');
        if (typeof html2canvas === 'undefined') throw new Error('html2canvas no disponible');

        const isDiplo = el.classList.contains('is-diplo');
        const size = isDiplo ? SIZES.diplo : SIZES.cert;

        // Quitar transform para capturar a tamaño real
        const origTransform = el.style.transform;
        const origBg        = el.style.background;
        const origBR        = el.style.borderRadius;
        const origShadow    = el.style.boxShadow;
        el.style.transform    = 'none';
        el.style.background   = '#ffffff';
        el.style.borderRadius = '0';
        el.style.boxShadow    = 'none';

        // También forzar fondo blanco en cert-paper-inner para la captura
        const paper = el.querySelector('.cert-paper-inner');
        const origPaperBg = paper ? paper.style.background : '';
        if (paper) paper.style.background = '#f5f8ff';

        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => setTimeout(r, 300));

        const canvas = await html2canvas(el, {
          scale: 2,              // 2× = alta resolución
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width:  size.w,
          height: size.h,
          logging: false,
          imageTimeout: 10000,
          onclone: function(doc) {
            // En el clon forzar todos los fondos y colores correctos
            const dp = doc.getElementById('diploma-content') || doc.querySelector('[class*="cert-paper"]')?.closest('div');
            if (dp) {
              dp.style.background   = '#ffffff';
              dp.style.borderRadius = '0';
              dp.style.boxShadow    = 'none';
              dp.style.transform    = 'none';
            }
            const cp = doc.querySelector('.cert-paper-inner');
            if (cp) cp.style.background = '#f5f8ff';
          }
        });

        // Restaurar estilos originales
        el.style.transform    = origTransform;
        el.style.background   = origBg;
        el.style.borderRadius = origBR;
        el.style.boxShadow    = origShadow;
        if (paper) paper.style.background = origPaperBg;

        // Convertir a dataURL
        const imgData = canvas.toDataURL('image/png', 1.0);
        const certId  = document.getElementById('dip-cert-id')?.textContent || 'certificado';

        // Abrir ventana de impresión con la imagen exacta (1 página garantizada)
        const w = window.open('', '_blank', `width=${Math.min(size.w, 1200)},height=${Math.min(size.h, 900)}`);
        if (!w) {
          // Fallback: descargar imagen directamente
          const a = document.createElement('a');
          a.download = `Certificado_FatlinAI_${certId.replace(/[^A-Z0-9-]/gi,'_')}.png`;
          a.href = imgData;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          if (typeof showToast === 'function') showToast('✅ Imagen PNG descargada', '#16a34a');
          return;
        }

        w.document.write(`<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8">
<title>Certificado Fatlin AI</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{
    width:100%;height:100%;
    background:#ffffff;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
  }
  @page{
    size:${size.page};
    margin:0;
  }
  .cert-img{
    display:block;
    width:100%;
    height:auto;
    max-height:100vh;
    object-fit:contain;
    page-break-inside:avoid;
    break-inside:avoid;
  }
  @media print{
    html,body{width:${size.page === 'A4 landscape' ? '297mm' : '431mm'};height:${size.page === 'A4 landscape' ? '210mm' : '279mm'}}
    .cert-img{width:100%;height:100%;object-fit:fill}
  }
</style>
</head><body>
<img class="cert-img" src="${imgData}" alt="Certificado Fatlin AI">
<script>
  document.querySelector('img').onload = function(){
    setTimeout(function(){
      window.print();
      window.onafterprint = function(){ window.close(); };
    }, 800);
  };
<\/script>
</body></html>`);
        w.document.close();

      } catch (err) {
        console.error('[FIX9 desktop]', err);
        if (typeof showToast === 'function')
          showToast('Error al generar — intenta de nuevo', '#dc2626');
      } finally {
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '🖨️ Generar PDF'; }, 3000);
        scaleDiploma();
      }
    };
  }

  /* ══════════════════════════════════════════════════════════
     11 — PAYWALL: clic en nodo 81/161 no salta al mapa
  ══════════════════════════════════════════════════════════ */
  function fixPaywallNodeClick() {
    // ── FIX: el paywall ya está integrado en renderMap() de main.js
    // mediante el flag n._needsPay. Esta función ya no necesita
    // sobreescribir renderMap ni usar un MutationObserver (que causaba
    // un loop infinito: renderMap → observer → renderMap → ...).
    // Se deja vacía para compatibilidad sin romper nada.
  }

  /* ══════════════════════════════════════════════════════════
     12 — SIDEBAR GALA: badge visible
  ══════════════════════════════════════════════════════════ */
  function fixSidebarGala() {
    waitFor(() => typeof window.updateHUD === 'function', 6000, function () {
      const orig = window.updateHUD;
      window.updateHUD = function () {
        orig.apply(this, arguments);
        try {
          const badge   = document.getElementById('sidebar-gala-badge');
          const timerEl = document.getElementById('sidebar-gala-timer');
          if (!badge) return;
          const isGala = typeof game !== 'undefined' && game.infiniteLivesUntil && game.infiniteLivesUntil > Date.now();
          if (isGala) {
            const rem = game.infiniteLivesUntil - Date.now();
            const h = Math.floor(rem / 3600000), m = Math.floor((rem % 3600000) / 60000);
            if (timerEl) timerEl.innerText = `${h}h${m}m`;
            badge.style.display = '';
          } else {
            badge.style.display = 'none';
          }
        } catch (e) {}
      };
    });
  }

  /* ══════════════════════════════════════════════════════════
     13 — PAYWALL: abrir modal correctamente
  ══════════════════════════════════════════════════════════ */
  function fixPaywall() {
    const modal = document.getElementById('modal-paywall');
    if (!modal) return;

    // Asegurar display:none inicial
    if (!modal.classList.contains('active')) modal.style.display = 'none';

    const certNames = {
      80: 'Certificado Bronce · Fundamentos PACIE',
      160:'Certificado Plata · Practicante PACIE',
      240:'Certificado Oro · Experto PACIE',
      320:'Certificado Platino · Máster PACIE',
      400:'Certificado Diamante · Mentor PACIE',
      480:'Diplomado en Metodología PACIE'
    };

    // Función showPayWall robusta: si payment.js la define, la envuelve;
    // si no, la crea desde cero
    function _openPaywall(completedLevel) {
      const name = certNames[completedLevel] || `Certificado Nivel ${completedLevel}`;
      const el = document.getElementById('pw-cert-name');
      const nl = document.getElementById('pw-next-level');
      const ti = document.getElementById('pw-title');
      if (el) el.textContent = name;
      if (nl) nl.textContent = completedLevel + 1;
      if (ti) ti.textContent = 'Activa tu certificado para continuar';
      modal.style.display = 'flex';
      modal.classList.add('active');
    }

    // Si payment.js ya definió showPayWall, envolverla para garantizar que el modal abre
    if (typeof window.showPayWall === 'function') {
      const origShow = window.showPayWall;
      window.showPayWall = function(level) {
        try { origShow(level); } catch(e) {}
        // Siempre abrir el modal aunque payment.js falle
        if (!modal.classList.contains('active')) _openPaywall(level);
      };
    } else {
      // payment.js aún no cargó — definir fallback y re-intentar envolver
      window.showPayWall = _openPaywall;
      // Re-intentar envolver cuando payment.js cargue
      let attempts = 0;
      const retryTimer = setInterval(function() {
        attempts++;
        if (attempts > 30) { clearInterval(retryTimer); return; }
        // Detectar si payment.js redefinió showPayWall con más lógica
        if (window.showPayWall !== _openPaywall) {
          clearInterval(retryTimer);
          const paymentShow = window.showPayWall;
          window.showPayWall = function(level) {
            try { paymentShow(level); } catch(e) {}
            if (!modal.classList.contains('active')) _openPaywall(level);
          };
        }
      }, 500);
    }

    // closePayWall
    window.closePayWall = function() {
      modal.classList.remove('active');
      modal.style.display = 'none';
    };

    // payWallPay — redirigir a PayPal (reemplaza URL con la real)
    if (typeof window.payWallPay !== 'function') {
      window.payWallPay = function(method) {
        const PAYPAL_URL = 'https://www.paypal.com/paypalme/tecnotips';
        window.open(PAYPAL_URL, '_blank', 'noopener');
      };
    }

    // Cerrar al clic fuera de la card
    modal.addEventListener('click', function(e) {
      if (e.target === modal) window.closePayWall();
    });

    console.log('[FIX13] Paywall listo.');
  }

  /* ── HELPER: esperar hasta que condición sea verdadera ─── */
  function waitFor(condition, maxMs, callback) {
    const step = 200;
    let elapsed = 0;
    const t = setInterval(function () {
      elapsed += step;
      if (condition()) { clearInterval(t); callback(); }
      else if (elapsed >= maxMs) { clearInterval(t); }
    }, step);
  }

  /* ── PATCH generateDiploma para marcar tipo + escalar ─── */
  function patchGenerateDiploma() {
    waitFor(() => typeof window.generateDiploma === 'function', 6000, function () {
      const orig = window.generateDiploma;
      window.generateDiploma = async function (completedLevel) {
        markDiplomaType(completedLevel);
        const result = orig.call(this, completedLevel);
        if (result && typeof result.then === 'function') result.then(() => requestAnimationFrame(scaleDiploma));
        else requestAnimationFrame(scaleDiploma);
        return result;
      };
    });
  }

  /* ── OBSERVAR apertura del modal diploma ─────────────── */
  function observeModal() {
    const modal = document.getElementById('modal-diploma');
    if (!modal) return;
    new MutationObserver(function () {
      if (modal.classList.contains('active')) requestAnimationFrame(scaleDiploma);
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── RESIZE ──────────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scaleDiploma, 120);
  });

  /* ── OBSERVAR stat-user ──────────────────────────────── */
  function observeStatUser() {
    const el = document.getElementById('stat-user');
    if (!el) return;
    new MutationObserver(fixUserVisibility).observe(el, { childList: true, characterData: true, subtree: true });
  }

  /* ══════════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════════ */
  function init() {
    fixRestModal();
    fixUserVisibility();
    observeStatUser();
    fixFooter();
    fixDiplomaLayout();
    patchPrintButton();
    patchGenerateDiploma();
    patchDiplomaVerification();
    fixPaywallNodeClick();
    fixSidebarGala();
    fixPaywall();
    observeModal();
    scaleDiploma();
    console.log('[Fatlin fixes.js] ✅ Todos los fixes aplicados.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
