const CACHE_NAME = "velero-v1";
const ASSETS = [
  "/index.html",
  "/dashboard.html",
  "/produits.html",
  "/parrainage.html",
  "/recharge.html",
  "/retrait.html",
  "/tache.html",
  "/missions.html",
  "/banque.html",
  "/pointage.html",
  "/compte.html",
  "/manifest.json"
];

// Installation : mettre en cache les pages principales
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activation : supprimer les anciens caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : Network first, fallback cache
self.addEventListener("fetch", e => {
  // Ne pas intercepter les requetes Supabase
  if (e.request.url.includes("supabase.co")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre à jour le cache avec la nouvelle réponse
        if (res && res.status === 200 && e.request.method === "GET") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
