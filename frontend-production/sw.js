const CACHE_NAME = 'santos-cleaning-v2';
const MANIFEST_URL = '/asset-manifest.json';
const STATIC_PRECACHE = [
  '/',
  '/images/santos-logo.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const resp = await fetch(MANIFEST_URL, { cache: 'no-store' });
      const manifest = await resp.json();
      const files = manifest && manifest.files ? Object.values(manifest.files) : [];
      const assetsToCache = [...STATIC_PRECACHE, ...files];
      await cache.addAll(assetsToCache);
    } catch (e) {
      // fallback para pre-cache estático mínimo
      await cache.addAll(STATIC_PRECACHE);
    }
  })());
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const resp = await fetch(event.request);
      // Cache-first para GET
      if (event.request.method === 'GET') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, resp.clone());
      }
      return resp;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 