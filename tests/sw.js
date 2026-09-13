// Source template. scripts/build-sw.mjs injects the production asset manifest.
const BUILD = '__BUILD_ID__';
const CORE = __CORE_ASSETS__;
const ILLUSTRATIONS = new Set(__ILLUSTRATION_ASSETS__.map(path => new URL(path, self.registration.scope).href));
const PREFIX = `achilles-return:${self.registration.scope}:`;
const CACHE = PREFIX + BUILD;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
});
self.addEventListener('message', event => {
  if (event.data === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith(PREFIX) && key !== CACHE) || /^achilles-return-v0\./.test(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || !url.href.startsWith(self.registration.scope)) return;
  // Cache only explicitly bundled illustrations on demand. Never cache external demos.
  if (ILLUSTRATIONS.has(url.href)) {
    const response = caches.open(CACHE).then(async cache => {
      const saved = await cache.match(event.request);
      if (saved) return saved;
      const fetched = await fetch(event.request);
      if (fetched.ok && fetched.headers.get('content-type')?.includes('image/png')) {
        // A full/quota-restricted cache must not prevent displaying an online image.
        await cache.put(event.request, fetched.clone()).catch(() => {});
      }
      return fetched;
    });
    event.respondWith(response);
    event.waitUntil(response.then(() => {}, () => {}));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match('./index.html'))));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
});
