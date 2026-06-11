const CACHE_NAME = 'kxtxr-edwing-registry-t1818-v1';
const ASSETS = [
  '/edwing-registry-T1818.html',
  '/edwing-manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
