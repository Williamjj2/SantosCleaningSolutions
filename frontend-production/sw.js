const CACHE_NAME = 'santos-cleaning-v4';
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
      // Apenas assets essenciais do entrypoint
      const core = [];
      if (manifest && manifest.files) {
        if (manifest.files['main.css']) core.push(manifest.files['main.css']);
        if (manifest.files['main.js']) core.push(manifest.files['main.js']);
      }
      const filtered = core.filter((url) => typeof url === 'string' && !url.endsWith('.map'));
      const assetsToCache = [...STATIC_PRECACHE, ...filtered];
      await cache.addAll(assetsToCache);
    } catch (e) {
      // fallback para pre-cache estático mínimo
      await cache.addAll(STATIC_PRECACHE);
    }
    // garantir que o novo SW assuma imediatamente
    await self.skipWaiting();
  })());
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Não cachear chamadas de API; usar network-first sem gravar no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      try {
        return await fetch(request, { cache: 'no-store' });
      } catch (e) {
        // Sem fallback para API no cache para evitar dados obsoletos
        return new Response('Service unavailable', { status: 503 });
      }
    })());
    return;
  }

  // HTML/documents: network-first para evitar HTML obsoleto
  const isHTML = request.destination === 'document' || (request.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        // opcional: atualizar cache
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(request);
        return cached || Response.error();
      }
    })());
    return;
  }

  // Para demais assets: cache-first seguro
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const resp = await fetch(request);
      if (request.method === 'GET') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, resp.clone());
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
    }).then(() => self.clients.claim())
  );
}); 