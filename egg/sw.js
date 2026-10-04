self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>{e.waitUntil((async()=>{
  const ks=await caches.keys(); await Promise.all(ks.filter(k=>/^(jh|jy|egg|inf)-v\d+$/.test(k)).map(k=>caches.delete(k)));
  await self.registration.unregister();
  (await self.clients.matchAll({type:"window"})).forEach(c=>c.navigate(c.url));
})());});
