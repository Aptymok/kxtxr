const CACHE_NAME = 'kxtxr-grimoire-v1';
const STATIC_ASSETS = [
  '/manifest.webmanifest.json',
  '/grimoire/ledger.json',
  '/historical/rem618/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate';
  const isLedger = requestUrl.pathname === '/grimoire/ledger.json';

  if (isNavigation || isLedger) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/historical/rem618/')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok && requestUrl.origin === self.location.origin) {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      }
      return response;
    }))
  );
});
