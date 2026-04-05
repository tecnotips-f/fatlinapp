/* ═══════════════════════════════════════════════════════════════
   Fatlin AI — Service Worker (sw.js)
   Estrategia: Network First para HTML (Bypass Cache) · Cache First para assets
   Versión: v141
═══════════════════════════════════════════════════════════════ */

const CACHE_VERSION  = 'fatlin-v150'; 
const CACHE_STATIC   = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC  = `${CACHE_VERSION}-dynamic`;

// Archivos esenciales para el funcionamiento offline
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/js/pwa.js',
  '/js/cert.js',
  '/js/leccion.js',
  '/js/splash.js',
  '/js/restSystem.js',
  '/js/payment.js',
  '/manifest.json',
  '/verify-pending.html',
  '/icons/icon-48.png',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
];

// ── INSTALL: Precarga y forzado de activación ────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalando versión:', CACHE_VERSION);
  
  // Forzamos a que este SW se convierta en el activo inmediatamente
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(
        PRECACHE_ASSETS.filter(url => !url.startsWith('https://fonts'))
      ))
      .then(() => console.log('[SW] Precarga completada'))
      .catch(err => console.warn('[SW] Error en precarga:', err))
  );
});

// ── ACTIVATE: Limpieza profunda de versiones anteriores ───────
self.addEventListener('activate', event => {
  console.log('[SW] Activando versión:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
          .map(key => {
            console.log('[SW] Eliminando caché obsoleta:', key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      // Tomar el control de todas las pestañas abiertas inmediatamente
      return self.clients.claim();
    }).then(() => {
      // Notificar a la app que hay una nueva versión activa
      return self.clients.matchAll({ includeUncontrolled: true });
    }).then(clients => {
      clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
    })
  );
});

// ── FETCH: Gestión inteligente de red y caché ────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Ignorar métodos que no sean GET y extensiones del navegador
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  /**
   * 2. EXCEPCIÓN PARA APIS (Firebase, Firestore, Pagos)
   * IMPORTANTE: No usamos respondWith para que el Service Worker NO intercepte.
   * Esto soluciona el error de "Fallo al cargar... ServiceWorker interceptó la solicitud".
   */
  if (
    url.hostname.includes('firebaseio.com')                  ||
    url.hostname.includes('googleapis.com')                  ||
    url.hostname.includes('firestore.googleapis.com')        ||
    url.hostname.includes('firebase.googleapis.com')         ||
    url.hostname.includes('identitytoolkit.googleapis.com')  ||
    url.hostname.includes('securetoken.googleapis.com')      ||
    url.hostname.includes('anthropic.com')                   ||
    url.hostname.includes('cloudfunctions.net')              ||
    url.hostname.includes('gstatic.com')                     ||
    url.hostname.includes('firebaseapp.com')                 ||
    url.hostname.includes('mercadopago.com')                 ||
    url.hostname.includes('paypal.com')                      ||
    url.hostname.includes('sandbox.paypal.com')              ||
    url.pathname.includes('/v1/messages')                    ||
    url.pathname.includes('/google.firestore')
  ) {
    return; // El navegador gestiona la conexión de forma nativa
  }

  /**
   * 3. ESTRATEGIA PARA HTML (Network First con Bypass de Caché HTTP)
   * Obliga al smartphone a consultar al servidor ignorando el caché del navegador.
   */
  if (request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request, { cache: 'reload' }) // 'reload' obliga a ir a la red
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_STATIC).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Si no hay red, servir desde caché o index por defecto
          return caches.match(request).then(r => r || caches.match('/index.html'));
        })
    );
    return;
  }

  /**
   * 4. ESTRATEGIA PARA ASSETS (Cache First)
   * CSS, JS, Imágenes y Fuentes.
   */
  if (
    url.pathname.startsWith('/css/')   ||
    url.pathname.startsWith('/js/')    ||
    url.pathname.startsWith('/icons/') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_STATIC).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 5. RESTO DE PETICIONES (Network First con Caché Dinámica)
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_DYNAMIC).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── Mensajería con el Frontend ───────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Forzando activación de nueva versión...');
    self.skipWaiting();
  }
});