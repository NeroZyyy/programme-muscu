const CACHE = 'muscu-v2';
 
// Cache uniquement les assets statiques, jamais les données
const ASSETS = [
  '/programme-muscu/',
  '/programme-muscu/index.html',
  '/programme-muscu/manifest.json',
  '/programme-muscu/icon-192.png',
  '/programme-muscu/icon-512.png'
];
 
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});
 
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
self.addEventListener('fetch', e => {
  // Network first pour index.html — toujours charger la dernière version
  if (e.request.url.includes('index.html') || e.request.url.endsWith('/programme-muscu/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache first pour les autres assets (icônes, manifest)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
