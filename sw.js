const CACHE="velero-v2";
const ASSETS=["/index.html","/dashboard.html","/produits.html","/parrainage.html","/compte.html","/recharge.html","/retrait.html","/historique.html","/tache.html","/offres.html","/contrats.html","/banque.html","/about.html","/reglement.html","/securite.html","/parametres.html","/manifest.json","/pwa-install.js"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener("activate",e=>{
  self.clients.claim();
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(
    fetch(e.request).then(r=>{
      const clone=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,clone));
      return r;
    }).catch(()=>caches.match(e.request))
  );
});
