const CACHE_NAME = "plc-generator-v3";
const ASSETS = [
    "./index.html",
    "./manifest.json",
    "./version.json",
    "./src/plc.js",
    "./src/i18n.js",
    "./src/ai-interface.js",
    "./src/diagnostics.js",
    "./src/remote.js",
    "./src/updater.js",
    "./src/ui.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Permite que la página fuerce la activación del nuevo worker (auto-update).
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    // version.json siempre desde la red para detectar actualizaciones.
    if (req.url.indexOf("version.json") !== -1) {
        event.respondWith(fetch(req).catch(() => caches.match(req)));
        return;
    }
    event.respondWith(
        caches.match(req).then((cached) => cached || fetch(req))
    );
});
