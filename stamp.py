# 모든 게임을 다시 만들고, 바뀐 내용으로 버전을 자동으로 붙여요.
# 사용법: python3 stamp.py  (그 다음 git add/commit/push)
import os, re, json, hashlib, subprocess
APPS={"praise-jinhyuk":"pj","praise-jinyul":"py","egg-steal":"es","infinite-game":"ig"}
CORE={"praise-jinhyuk":["icons/icon-192.png"],"praise-jinyul":["icons/icon-192.png"],"egg-steal":["three.min.js","icons/icon-192.png"],"infinite-game":["three.min.js","icons/icon-192.png"]}
def run(cwd,script): subprocess.run(["python3",script],cwd=cwd,check=True)
run("praise-jinhyuk","build.py"); run("praise-jinhyuk","make_jinyul.py")
run("egg-steal","build.py"); run("infinite-game","build.py")
SNIP_START="<!--auto-update-->"; SNIP_END="<!--/auto-update-->"
def snippet(ver): return SNIP_START+'''<script>
(function(){ var CUR="'''+ver+'''";
  function check(){ if(!/^https?:/.test(location.protocol)) return;
    fetch("version.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.json();}).then(function(j){
      if(!j||!j.v||j.v===CUR) return; var k="upd:"+location.pathname; if(sessionStorage.getItem(k)===j.v) return; sessionStorage.setItem(k,j.v);
      var go=function(){ location.replace(location.pathname.replace(/index\\.html$/,"")+"?v="+j.v); };
      try{ var p=[]; if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations) p.push(navigator.serviceWorker.getRegistrations().then(function(rs){ return Promise.all(rs.filter(function(r){return location.href.indexOf(r.scope)===0;}).map(function(r){return r.unregister();})); }));
        if(window.caches) p.push(caches.keys().then(function(ks){ return Promise.all(ks.map(function(c){return caches.delete(c);})); }));
        Promise.all(p).then(go,go); }catch(e){ go(); }
    }).catch(function(){});
  }
  check(); document.addEventListener("visibilitychange",function(){ if(!document.hidden) check(); });
})();
</script>'''+SNIP_END
def sw(prefix,ver,core): V=prefix+"-"+ver; return f'''const V="{V}";
const CORE={json.dumps(["./","index.html","manifest.webmanifest"]+core)};
self.addEventListener("install",e=>{{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{{}}));self.skipWaiting();}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("{prefix}-")&&k!==V).map(k=>caches.delete(k))))); self.clients.claim();}});
self.addEventListener("fetch",e=>{{
  if(e.request.method!=="GET")return;
  if(e.request.url.indexOf("version.json")>=0) return;
  e.respondWith(fetch(e.request,{{cache:"no-store"}}).then(r=>{{ if(r&&r.ok){{ const cp=r.clone(); caches.open(V).then(c=>c.put(e.request,cp)); }} return r; }})
    .catch(()=>caches.match(e.request,{{ignoreSearch:true}})));
}});
'''
for d,prefix in APPS.items():
    p=os.path.join(d,"index.html"); s=open(p,encoding="utf-8").read()
    s=re.sub(re.escape(SNIP_START)+".*?"+re.escape(SNIP_END),"",s,flags=re.S)
    ver=hashlib.sha1(s.encode()).hexdigest()[:8]
    s=s.replace("</body>",snippet(ver)+"\n</body>",1)
    open(p,"w",encoding="utf-8").write(s)
    json.dump({"v":ver},open(os.path.join(d,"version.json"),"w"))
    open(os.path.join(d,"sw.js"),"w").write(sw(prefix,ver,CORE[d]))
    print(d,ver)
