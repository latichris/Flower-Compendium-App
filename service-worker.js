const CACHE_NAME = 'flower-compendium-v2';

// Only core app shell (FAST install)
const SHELL_ASSETS = [
  '/Flower-Compendium-App/',
  '/Flower-Compendium-App/index.html',
  '/Flower-Compendium-App/style.css',
  '/Flower-Compendium-App/script.js',
  '/Flower-Compendium-App/manifest.json'
];

// ==========================
// INSTALL (fast!)
// ==========================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// ==========================
// ACTIVATE
// ==========================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ==========================
// FETCH
// ==========================
self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(res => {
        // Cache useful assets dynamically
        const url = new URL(req.url);

        if (
          url.pathname.startsWith('/Flower-Compendium-App/data/') ||
          url.pathname.startsWith('/Flower-Compendium-App/images/') ||
          url.pathname.startsWith('/Flower-Compendium-App/models/')
        ) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, resClone);
          });
        }

        return res;
      }).catch(() => {
        // Basic offline fallback
        if (req.headers.get('accept')?.includes('text/html')) {
          return caches.match('/Flower-Compendium-App/index.html');
        }
      });
    })
  );
});
