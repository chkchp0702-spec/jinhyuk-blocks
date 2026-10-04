const V="es-4b978a8b";
const CORE=["./", "index.html", "manifest.webmanifest", "three.min.js", "icons/icon-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("es-")&&k!==V).map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  if(e.request.url.indexOf("version.json")>=0) return;
  e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(V).then(c=>c.put(e.request,cp)); } return r; })
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
