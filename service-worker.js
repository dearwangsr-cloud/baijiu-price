const CACHE_NAME = 'liquor-pwa-v2';
const urlsToCache = [
  './',
  './白酒价格记录.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});