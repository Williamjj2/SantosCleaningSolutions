const STATIC_CACHE_PREFIX = 'santos-cleaning-cache-';
const RUNTIME_CACHE = 'santos-cleaning-runtime';
const MANIFEST_URL = '/asset-manifest.json';
const OFFLINE_FALLBACK = '/index.html';

let manifestPromise = null;

async function fetchManifest() {
    if (!manifestPromise) {
        manifestPromise = fetch(MANIFEST_URL, { cache: 'no-store' })
            .then((response) => (response.ok ? response.json() : null))
            .catch(() => null);
    }
    return manifestPromise;
}

async function getCacheName() {
    const manifest = await fetchManifest();
    if (manifest?.files?.['main.js']) {
        const match = /main\.(\w+)\.js$/.exec(manifest.files['main.js']);
        if (match && match[1]) {
            return `${STATIC_CACHE_PREFIX}${match[1]}`;
        }
    }
    return `${STATIC_CACHE_PREFIX}fallback`;
}

async function buildPrecacheList() {
    const resources = new Set([
        '/',
        OFFLINE_FALLBACK,
        '/robots.txt',
        '/sitemap.xml',
        '/favicon.ico',
        '/manifest.json'
    ]);

    const manifest = await fetchManifest();
    if (manifest) {
        if (Array.isArray(manifest.entrypoints)) {
            manifest.entrypoints.forEach((entry) => resources.add(`/${entry.replace(/^\//, '')}`));
        }
        if (manifest.files) {
            Object.values(manifest.files).forEach((value) => {
                if (typeof value === 'string' && !value.endsWith('.map')) {
                    resources.add(value.startsWith('/') ? value : `/${value}`);
                }
            });
        }
    }

    return Array.from(resources);
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cacheName = await getCacheName();
            const cache = await caches.open(cacheName);
            const assetsToCache = await buildPrecacheList();

            await Promise.all(
                assetsToCache.map(async (url) => {
                    try {
                        await cache.add(url);
                    } catch (error) {
                        // Falha ao fazer cache de algum recurso (ex.: externo sem CORS). Ignorar para não quebrar a instalação.
                    }
                })
            );

            await self.skipWaiting();
        })()
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const expectedCacheName = await getCacheName();
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter((name) => name.startsWith(STATIC_CACHE_PREFIX) && name !== expectedCacheName)
                    .map((name) => caches.delete(name))
            );
            await clients.claim();
        })()
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        // Estratégia network-first para recursos externos
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
        return;
    }

    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        // Navegação: network-first com fallback offline
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(async () => {
                    const cache = await caches.open(RUNTIME_CACHE);
                    const cachedResponse = await cache.match(request);
                    return cachedResponse || caches.match(OFFLINE_FALLBACK);
                })
        );
        return;
    }

    // Assets estáticos: cache-first
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request)
                .then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const copy = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => caches.match(OFFLINE_FALLBACK));
        })
    );
}); 