import json
frag=open('game.html',encoding='utf-8').read()
frag=frag.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','three.min.js')
head='''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#9fdcff">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="알 훔치기">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
'''
i=frag.index('<canvas id="view">')
open('index.html','w',encoding='utf-8').write(head+frag[:i]+'</head>\n<body>\n'+frag[i:]+'\n</body>\n</html>\n')
json.dump({"name":"알 훔치기 대작전","short_name":"알 훔치기","description":"알을 훔쳐 펫을 키우는 3D 게임","lang":"ko",
 "start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#9fdcff","theme_color":"#9fdcff",
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},
 {"src":"icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open('manifest.webmanifest','w',encoding='utf-8'),ensure_ascii=False,indent=2)
open('sw.js','w').write('''const V="egg-v6";
const CORE=["./","index.html","three.min.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("egg-")&&k!==V).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(V).then(c=>c.put(e.request,cp)); } return r; })
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
''')
