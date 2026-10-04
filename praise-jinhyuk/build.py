import json
frag=open('game.html',encoding='utf-8').read()
head='''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#7fd0ff">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="진혁이 블록">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<style>#app{padding-top:max(10px,env(safe-area-inset-top));padding-bottom:max(14px,env(safe-area-inset-bottom))}</style>
'''
i=frag.index('<div class="sky"')
open('index.html','w',encoding='utf-8').write(head+frag[:i]+'</head>\n<body>\n'+frag[i:]+'\n</body>\n</html>\n')
json.dump({"name":"진혁이 칭찬 블록","short_name":"진혁이 블록","description":"진혁이를 위한 칭찬 블록 퍼즐","lang":"ko",
 "id":"/jinhyuk-blocks/praise-jinhyuk/","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#7fd0ff","theme_color":"#7fd0ff",
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},
 {"src":"icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open('manifest.webmanifest','w',encoding='utf-8'),ensure_ascii=False,indent=2)
open('sw.js','w').write('''const V="pj-v1";
const CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("pj-")&&k!==V).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(e.request);
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==="opaque"))c.put(e.request,r.clone());return r;}).catch(()=>hit);
    return hit||net;
  }));
});
''')
