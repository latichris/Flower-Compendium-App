// ============================================================
// Flower Compendium — Service Worker
// Caches the app shell, all flower pages, images, and the
// AI model so the app works fully offline after first visit.
// ============================================================

const CACHE_NAME = 'flower-compendium-v1';

// App shell — everything needed to load the UI
const SHELL_ASSETS = [
  '/Flower-Compendium-App/',
  '/Flower-Compendium-App/index.html',
  '/Flower-Compendium-App/style.css',
  '/Flower-Compendium-App/script.js',
  '/Flower-Compendium-App/Home.mp3',
  '/Flower-Compendium-App/manifest.json',
];

// All 59 flower HTML pages
const FLOWER_PAGES = [
  'amaryllis','anemone','aster','azalea','babysbreath',
  'begonia','buttercup','camellia','carnation','chrysanthemum',
  'clematis','clover','columbine','cornflower','crocus',
  'daffodil','dahlia','daisy','dandelion','dogwood',
  'forget','foxglove','gladiolus','hawthorn','heather',
  'hellebore','holly','honeysuckle','hyacinth','hydrangea',
  'hyssop','iris','jasmine','slipper','larkspur',
  'lavender','lilac','lily','valley','magnolia',
  'marigold','monkshood','oleander','orchid','pansy',
  'passionflower','peony','petunia','poppy','rose',
  'snapdragon','snowdrop','sunflower','sweetpea','sweetwilliam',
  'tulip','violet','yarrow','zinnia'
].map(f => `/Flower-Compendium-App/data/${f}.html`);

// Per-flower CSS files
const FLOWER_CSS = [
  'flower-base','amaryllis','anemone','aster','azalea','babysbreath',
  'begonia','buttercup','camellia','carnation','chrysanthemum',
  'clematis','clover','columbine','cornflower','crocus',
  'daffodil','dahlia','daisy','dandelion','dogwood',
  'forget','foxglove','gladiolus','hawthorn','heather',
  'hellebore','holly','honeysuckle','hyacinth','hydrangea',
  'hyssop','iris','jasmine','slipper','larkspur',
  'lavender','lilac','lily','valley','magnolia',
  'marigold','monkshood','oleander','orchid','pansy',
  'passionflower','peony','petunia','poppy','rose',
  'snapdragon','snowdrop','sunflower','sweetpea','sweetwilliam',
  'tulip','violet','yarrow','zinnia'
].map(f => `/Flower-Compendium-App/data/${f}.css`);

// AI model files
const MODEL_ASSETS = [
  '/Flower-Compendium-App/models/model.json',
  '/Flower-Compendium-App/models/labels.json',
  // model.json references shard files — these are fetched on demand
  // and cached by the fetch handler below
];

// Catalogue thumbnail images (PNG)
const FLOWER_NAMES = [
  'amaryllis','anemone','aster','azalea','babysbreath',
  'begonia','buttercup','camellia','carnation','chrysanthemum',
  'clematis','clover','columbine','cornflower','crocus',
  'daffodil','dahlia','daisy','dandelion','dogwood',
  'forget','foxglove','gladiolus','hawthorn','heather',
  'hellebore','holly','honeysuckle','hyacinth','hydrangea',
  'hyssop','iris','jasmine','slipper','larkspur',
  'lavender','lilac','lily','valley','magnolia',
  'marigold','monkshood','oleander','orchid','pansy',
  'passionflower','peony','petunia','poppy','rose',
  'snapdragon','snowdrop','sunflower','sweetpea','sweetwilliam',
  'tulip','violet','yarrow','zinnia'
];

const THUMBNAIL_ASSETS = FLOWER_NAMES.map(
  f => `/Flower-Compendium-App/images/${f}.png`
);

// All assets to pre-cache on install
const PRECACHE_ASSETS = [
  ...SHELL_ASSETS,
  ...FLOWER_PAGES,
  ...FLOWER_CSS,
  ...MODEL_ASSETS,
  ...THUMBNAIL_ASSETS,
];

// ============================================================
// INSTALL — cache everything
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching app assets...');
      // Cache in batches to avoid overwhelming the browser
      const batchSize = 20;
      const batches = [];
      for (let i = 0; i < PRECACHE_ASSETS.length; i += batchSize) {
        batches.push(PRECACHE_ASSETS.slice(i, i + batchSize));
      }
      return batches.reduce((promise, batch) => {
        return promise.then(() =>
          Promise.all(
            batch.map(url =>
              cache.add(url).catch(err => {
                // Don't fail the whole install if one asset is missing
                console.warn(`[SW] Failed to cache: ${url}`, err);
              })
            )
          )
        );
      }, Promise.resolve());
    }).then(() => {
      console.log('[SW] Pre-cache complete.');
      return self.skipWaiting();
    })
  );
});

// ============================================================
// ACTIVATE — clean up old caches
// ============================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH — cache-first for app assets, network-first for others
// ============================================================
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle requests within our app scope
  if (!url.pathname.startsWith('/Flower-Compendium-App/')) return;

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Cache-first strategy for all app assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not in cache — fetch from network and cache it
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache model shards and gallery images on demand
        const shouldCache =
          url.pathname.includes('/models/') ||
          url.pathname.includes('/gallery/') ||
          url.pathname.includes('/images/') ||
          url.pathname.includes('/data/');

        if (shouldCache) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // Offline fallback — return a simple offline message for HTML pages
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return new Response(
            '<html><body style="font-family:serif;text-align:center;padding:2rem">' +
            '<h2>🌸 You\'re offline</h2>' +
            '<p>Please reconnect to use the Flower Compendium.</p>' +
            '</body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      });
    })
  );
});
