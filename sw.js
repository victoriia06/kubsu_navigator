const CACHE_NAME = 'nav-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/scripts/constants.js',
  '/scripts/map-manager.js',
  '/scripts/points-manager.js',
  '/scripts/search-manager.js',
  '/scripts/ui-manager.js',
  '/data/map-svg.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});