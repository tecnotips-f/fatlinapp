/* ═══════════════════════════════════════════════════════════════
   Fatlin AI — fixes_v2.js
   FIX 1: Botón Pausar funciona siempre (no solo durante isProcessing)
   FIX 2: stat-user visible en HUD móvil
   FIX 3: Footer con información clara
   FIX 4: certId nivel 82 → colección correcta en Firebase
   Instrucción: agregar en index.html ANTES de </body>, DESPUÉS de restSystem.js
   <script src="js/fixes_v2.js?v=1"></script>
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     FIX 1 — Botón Pausar
     El bug: window.pauseChallenge tenía `if(!game.isProcessing) return;`
     game.isProcessing es TRUE solo durante animaciones de respuesta,
     NO durante la pregunta activa → el botón no hacía nada.
     Solución: reemplazar la función por una que siempre cierre el modal.
  ───────────────────────────────────────────────────────────── */
  window.pauseChallenge = function () {
    const modal = document.getElementById('modal-challenge');
    if (!modal || !modal.classList.contains('active')) return;

    // Cerrar modal y limpiar estado de challenge
    modal.classList.remove('active');
    document.body.classList.remove('in-challenge');

    // Acceder al objeto game (definido en main.js en scope global)
    if (typeof game !== 'undefined') {
      game.isProcessing = false;
      game.correctCount = 0;
      game.consecutiveErrors = 0;
      if (typeof renderMap === 'function') renderMap();
      if (typeof centerCamera === 'function') centerCamera();
    }

    if (typeof showToast === 'function') {
      showToast('⏸ Desafío pausado — vuelve cuando quieras', '#0369a1');
    }
  };

  /* ─────────────────────────────────────────────────────────────
     FIX 2 — stat-user visible en móvil
     En pantallas pequeñas el nombre del usuario desaparecía porque
     hud-left se queda sin espacio. Forzamos visibilidad mínima.
  ───────────────────────────────────────────────────────────── */
  function fixUserVisibility() {
    const statUser = document.getElementById('stat-user');
    if (!statUser) return;

    // Asegurar que tenga texto antes de aplicar estilos
    if (!statUser.innerText || statUser.innerText === '...') {
      // Intentar rellenar desde game
      try {
        if (typeof game !== 'undefined' && game.user) {
          statUser.innerText =
            game.user.displayName ||
            game.user.email?.split('@')[0] ||
            'Usuario';
        }
      } catch (e) {}
    }

    // Aplicar estilos de visibilidad
    statUser.style.cssText +=
      ';max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:middle;';

    // El contenedor hstat-name tampoco debe colapsarse
    const hstatName = statUser.closest('.hstat-name');
    if (hstatName) {
      hstatName.style.cssText += ';min-width:60px;flex-shrink:1;';
    }
  }

  /* ─────────────────────────────────────────────────────────────
     FIX 3 — Footer con información clara
     El footer actual muestra "Tecnotips © - 2026 · Tecnología con propósito"
     sin contexto. Lo enriquecemos con links de verificación y nivel.
  ───────────────────────────────────────────────────────────── */
  function fixFooter() {
    const footer = document.querySelector('footer.page-footer');
    if (!footer) return;

    footer.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;
                  flex-wrap:wrap;gap:6px;padding:0 12px;width:100%">
        <span style="font-size:11px;color:rgba(255,255,255,.55);font-weight:600">
          Tecnotips © 2026 · Tecnología con propósito
        </span>
        <span id="footer-level-info" style="font-size:11px;color:rgba(255,255,255,.4);font-weight:600">
          Fatlin AI · Metodología PACIE
        </span>
        <a href="https://fatlin.web.app/verify.html" target="_blank" rel="noopener"
           style="font-size:10px;color:rgba(56,189,248,.7);font-weight:700;
                  text-decoration:none;letter-spacing:.04em">
          🔗 Verificar diploma
        </a>
      </div>`;

    // Actualizar el nivel en el footer cuando cambie
    function updateFooterLevel() {
      const el = document.getElementById('footer-level-info');
      if (!el) return;
      try {
        if (typeof game !== 'undefined' && game.level) {
          el.textContent = `Nivel ${game.level} · ${game.stars || 0} ⭐`;
        }
      } catch (e) {}
    }

    // Escuchar cambios en el HUD como proxy para actualizar el footer
    const statLevel = document.getElementById('stat-level');
    if (statLevel) {
      new MutationObserver(updateFooterLevel).observe(statLevel, { childList: true });
    }
    updateFooterLevel();
  }

  /* ─────────────────────────────────────────────────────────────
     FIX 4 — Verificador de diplomas: colección Firebase correcta
     El problema: el verify.html busca en "fatlin_diplomas" (sin APP_ID)
     pero main.js guarda en "fatlin_diplomas_fatlin-ai-v1".
     Este fix PARCHEA generateDiploma para asegurarse de guardar
     TAMBIÉN en la colección simple "fatlin_diplomas" para que
     el verificador pueda encontrarlo.

     IMPORTANTE: También corrige el diseño del verify.html (ver fixes_v2.css)
  ───────────────────────────────────────────────────────────── */
  function patchDiplomaVerification() {
    // Esperar a que Firebase esté disponible
    const MAX_WAIT = 8000;
    const INTERVAL = 200;
    let waited = 0;

    const tryPatch = setInterval(function () {
      waited += INTERVAL;

      // Verificar que tenemos las funciones de Firebase en scope
      if (typeof window.generateDiploma !== 'function') {
        if (waited >= MAX_WAIT) {
          clearInterval(tryPatch);
          console.warn('[FIX4] generateDiploma no encontrada en scope global.');
        }
        return;
      }

      clearInterval(tryPatch);

      const originalGenerate = window.generateDiploma;
      window.generateDiploma = async function (completedLevel) {
        // Llamar la función original primero
        await originalGenerate.call(this, completedLevel);

        // Después, intentar escribir también en la colección sin sufijo
        // para que el verificador pueda encontrar el diploma
        try {
          const { getFirestore, doc, setDoc } = await import(
            'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
          );

          if (typeof game === 'undefined' || !game.user) return;

          const name =
            game.user.displayName ||
            game.user.email?.split('@')[0] ||
            'Usuario';
          const year = new Date().getFullYear();
          const shortName = name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .substring(0, 4);

          // Recrear mismo hash determinista que main.js
          const seedStr = `${game.user.uid}-${completedLevel}-${year}`;
          let _h = 2166136261;
          for (let i = 0; i < seedStr.length; i++) {
            _h ^= seedStr.charCodeAt(i);
            _h = Math.imul(_h, 16777619) >>> 0;
          }
          const rand = _h.toString(36).substring(0, 5).toUpperCase();

          // Determinar tierInitial (debe coincidir con main.js)
          const tierLabels = {
            80: '🥉 BRONCE · FUNDAMENTOS',
            160: '🥈 PLATA · PRACTICANTE',
            240: '🥇 ORO · EXPERTO',
            320: '✦ PLATINO · MÁSTER',
            400: '💎 DIAMANTE · MENTOR',
            480: '🔴 GEMA ROJA · GRAN MAESTRO',
          };
          const label = tierLabels[completedLevel] || '🥉 BRONCE · FUNDAMENTOS';
          const tierInitial = (label.match(/[A-Z]/g) || ['X'])[0];
          const certId = `FATLIN-${year}-${shortName}${completedLevel}${tierInitial}-${rand}`;

          const db = getFirestore();
          // Colección sin sufijo (la que usa verify.html)
          await setDoc(
            doc(db, 'fatlin_diplomas', certId),
            {
              certId,
              level: completedLevel,
              userName: name,
              userUid: game.user.uid,
              issuedAt: Date.now(),
              valid: true,
            },
            { merge: true }
          );

          console.log('[FIX4] Diploma también guardado en fatlin_diplomas (sin sufijo):', certId);
        } catch (e) {
          console.warn('[FIX4] No se pudo duplicar en colección de verificación:', e);
        }
      };

      console.log('[FIX4] generateDiploma parcheado para doble escritura.');
    }, INTERVAL);
  }

  /* ─────────────────────────────────────────────────────────────
     FIX 4b — modal-rest faltaba el div contenedor #modal-rest
     En index.html el .rest-card existe pero sin el div#modal-rest
     envolvente, por lo que restSystem.js no puede hacer
     document.getElementById('modal-rest').classList.add('active')
  ───────────────────────────────────────────────────────────── */
  function fixRestModal() {
    const restCard = document.querySelector('.rest-card:not(#modal-rest .rest-card)');
    if (!restCard) return;

    // Verificar si ya tiene el wrapper correcto
    if (restCard.closest('#modal-rest')) return;

    // Crear wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'modal-rest';
    wrapper.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9500;display:none;align-items:center;justify-content:center;padding:20px;';

    // Mover rest-card dentro del wrapper
    restCard.parentNode.insertBefore(wrapper, restCard);
    wrapper.appendChild(restCard);

    // Parchear funciones de restSystem para que usen classList en el wrapper
    const originalShow = window.showRestModal;
    const originalClose = window.closeRestModal;

    if (originalShow) {
      window.showRestModal = function () {
        originalShow();
        wrapper.style.display = 'flex';
      };
    }
    if (originalClose) {
      window.closeRestModal = function (skip) {
        wrapper.style.display = 'none';
        if (originalClose) originalClose(skip);
      };
    }

    console.log('[FIX4b] #modal-rest wrapper creado correctamente.');
  }

  /* ─────────────────────────────────────────────────────────────
     INIT — Ejecutar todos los fixes en el momento correcto
  ───────────────────────────────────────────────────────────── */
  function initFixes() {
    fixRestModal();
    fixUserVisibility();
    fixFooter();
    patchDiplomaVerification();

    // Re-aplicar fix del usuario cada vez que el HUD se actualice
    const statUser = document.getElementById('stat-user');
    if (statUser) {
      new MutationObserver(fixUserVisibility).observe(statUser, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    console.log('[Fatlin fixes_v2] ✅ Todos los fixes aplicados.');
  }

  // Esperar DOM listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFixes);
  } else {
    initFixes();
  }
})();
