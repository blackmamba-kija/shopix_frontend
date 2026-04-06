const CACHE_NAME = 'shopix-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/shopix-logo.png',
];

// Force update check on every load
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API calls for caching
  if (url.pathname.startsWith('/api') || url.host.includes('.kija.co.tz')) {
    return;
  }

  // Navigation requests for the SPA
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Handle assets (scripts, styles, images)
  const isAsset = request.destination === 'script' || 
                  request.destination === 'style' || 
                  request.destination === 'image' || 
                  url.pathname.includes('/assets/');

  if (isAsset) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          return networkResponse;
        }).catch((err) => {
           console.error('Fetch failed for asset:', request.url);
           throw err;
        });
      })
    );
    return;
  }

  // Standard cache-first strategy for anything else
  event.respondWith(
    caches.match(request).then((response) => response || fetch(request))
  );
});

