const CACHE_NAME = "lida-shell-v1";
const APP_SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./src/app.js", "./src/data/demo-data.js", "./src/modules/storage.js",
  "./src/modules/navigation.js", "./src/modules/dialogs.js",
  "./src/styles/tokens.css", "./src/styles/base.css", "./src/styles/components.css",
  "./assets/icons/lida-mark.svg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match("./index.html"))));
});
