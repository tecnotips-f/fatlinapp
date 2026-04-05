/* ═══════════════════════════════════════════════════════
    Fatlin AI | pwa.js — Service Worker & PWA Install
═══════════════════════════════════════════════════════ */

window.FATLIN_LOGO_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="FATLIN AI Emblem">
  <defs>
    <filter id="fglow-pwa">
      <feGaussianBlur stdDeviation="2" result="cb"/>
      <feMerge>
        <feMergeNode in="cb"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="fbg-pwa" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(56,189,248,.15)"/>
      <stop offset="100%" stop-color="rgba(56,189,248,0)"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#fbg-pwa)"/>
  <path d="M50 90 L90 70 L50 50 L10 70 Z" fill="#075985"/>
  <path d="M50 82 L90 62 L50 42 L10 62 Z" fill="#0369a1"/>
  <path d="M50 74 L90 54 L50 34 L10 54 Z" fill="#0284c7"/>
  <path d="M50 66 L90 46 L50 26 L10 46 Z" fill="#0ea5e9"/>
  <path d="M50 58 L90 38 L50 18 L10 38 Z" fill="#38bdf8"/>
  <path d="M50 50 L75 38 L50 26 L25 38 Z" fill="#7dd3fc" filter="url(#fglow-pwa)"/>
  <circle cx="50" cy="38" r="3.5" fill="white" opacity="0.9"/>
</svg>
`;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        var refreshing = false;

        // ── Mostrar banner de actualización ──────────────────────
        function mostrarBanner(workerEsperando) {
            var banner = document.getElementById('update-banner');
            if (!banner) return;

            banner.classList.add('show');

            // Guardar referencia al worker esperando para usarla en el botón
            banner._pendingWorker = workerEsperando;
        }

        // ── Registro del Service Worker ───────────────────────────
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(function (reg) {
                console.log('[PWA] SW registrado, scope:', reg.scope);

                // ✅ CASO 1: Ya hay un SW en waiting al momento de cargar la página
                // (usuario navegó sin haber actualizado antes)
                if (reg.waiting && navigator.serviceWorker.controller) {
                    console.log('[PWA] SW en waiting detectado al cargar — mostrando banner');
                    mostrarBanner(reg.waiting);
                }

                // ✅ CASO 2: Se detecta una actualización mientras la página está abierta
                reg.addEventListener('updatefound', function () {
                    var newWorker = reg.installing;
                    newWorker.addEventListener('statechange', function () {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[PWA] Nueva versión instalada — mostrando banner');
                            mostrarBanner(newWorker);
                        }
                    });
                });
            })
            .catch(function (err) {
                console.warn('[PWA] SW falló:', err);
            });

        // ✅ CLAVE: cuando el nuevo SW toma control → recargar la página
        navigator.serviceWorker.addEventListener('controllerchange', function () {
            if (refreshing) return;
            refreshing = true;
            console.log('[PWA] Nuevo SW activo — recargando...');
            window.location.reload();
        });

        // ── Botón "Actualizar" ────────────────────────────────────
        var btnReload = document.getElementById('btn-update-reload');
        if (btnReload) {
            btnReload.addEventListener('click', function () {
                var banner = document.getElementById('update-banner');
                var workerEsperando = banner && banner._pendingWorker;

                if (workerEsperando) {
                    // Decirle al SW en waiting que tome control
                    workerEsperando.postMessage({ type: 'SKIP_WAITING' });
                } else {
                    // Fallback: buscar en el registro por si acaso
                    navigator.serviceWorker.getRegistration().then(function (reg) {
                        if (reg && reg.waiting) {
                            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                        } else {
                            window.location.reload();
                        }
                    });
                }
                // El reload lo dispara automáticamente el listener 'controllerchange'
            });
        }

        // ── Botón "Cerrar" (descartar banner) ─────────────────────
        var btnDismiss = document.getElementById('btn-update-dismiss');
        if (btnDismiss) {
            btnDismiss.addEventListener('click', function () {
                var banner = document.getElementById('update-banner');
                if (banner) {
                    banner.classList.remove('show');
                    banner._pendingWorker = null;
                }
            });
        }
    });
}

window.addEventListener('appinstalled', function () {
    console.log('[PWA] App instalada en pantalla de inicio');
});
