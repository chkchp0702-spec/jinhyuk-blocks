const V="egg-v3";
const CORE=["./","index.html","three.min.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("egg-")&&k!==V).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(V).then(c=>c.put(e.request,cp)); } return r; })
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
