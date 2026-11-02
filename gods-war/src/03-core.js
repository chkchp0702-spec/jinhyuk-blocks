<script>
/* ================= 기본 도구 ================= */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const fmt=n=>Math.round(n).toLocaleString("ko-KR");
function save(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
let soundOn=load("gw-sound")!=="0", actx=null;
function initAudio(){ if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(actx&&actx.state==="suspended") actx.resume(); }
function tone(f,d,type,delay,vol){ if(!soundOn||!actx) return; const t=actx.currentTime+(delay||0),o=actx.createOscillator(),g=actx.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol||.15,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g).connect(actx.destination); o.start(t); o.stop(t+d+.03); }
function jingle(arr){ arr.forEach((f,k)=>tone(f,.14,"triangle",k*.08)); }
function thud(){ tone(110,.12,"square",0,.12); tone(70,.18,"sawtooth",.02,.08); }
function buzz(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms||30); }catch(e){} }
let toastT=0; function toast(msg,sub,dur){ const t=$("toast"); t.innerHTML=msg+(sub?`<small>${sub}</small>`:""); t.style.opacity=1; toastT=dur||1.8; }

/* ================= 방(초대 링크) ================= */
const ROOM=(function(){ const u=new URL(location.href); let k=u.searchParams.get("k"); if(k){ k=k.replace(/[^a-zA-Z0-9_-]/g,"").slice(0,24); save("gw-room",k); } else k=load("gw-room"); return k||""; })();
function inviteLink(){ const u=new URL(location.href); u.search="?k="+ROOM; return u.toString(); }

/* ================= 저장 ================= */
const SAVEKEY="gw-save-"+ROOM;
function freshSave(){ return {v:1,name:"",realm:-1,lv:1,xp:0,gold:50,rank:0,eq:{w:-1,a:-1,r:-1},bag:[],pots:2,kills:0,war:0,capt:0,deaths:0,quests:[],qdone:0,bossKills:0,t:Date.now(),gfx:"high",id:Math.random().toString(36).slice(2,8)}; }
let G=(function(){ try{ const s=JSON.parse(load(SAVEKEY)||"null"); if(s&&s.v===1) return Object.assign(freshSave(),s); }catch(e){} return freshSave(); })();
function saveGame(){ G.t=Date.now(); save(SAVEKEY,JSON.stringify(G)); }
document.addEventListener("visibilitychange",()=>{ if(document.hidden) saveGame(); });
const RM=()=>REALMS[G.realm]||REALMS[0];

/* ================= 능력치 ================= */
function xpNeed(lv){ return Math.round(40*Math.pow(lv,1.5)); }
function terrBonus(){ let n=0; for(let i=0;i<REGIONS.length;i++) if(!REGIONS[i].cap && W.o[i]===G.realm) n++; return n; }
function hegemon(){ const cnt=[0,0,0,0]; for(let i=0;i<REGIONS.length;i++){ if(W.o[i]>=0) cnt[W.o[i]]++; } let best=-1,bn=0; cnt.forEach((c,i)=>{ if(c>bn){bn=c;best=i;} }); return cnt.filter(c=>c===bn).length===1?best:-1; }
function stat(){
  const r=G.rank, lv=G.lv, w=G.eq.w, a=G.eq.a, rl=G.eq.r;
  let mhp=120+lv*14+r*70+(a>=0?TIER.a[a]:0);
  let atk=(9+lv*2.2+r*12+(w>=0?TIER.w[w]:0))*(1+terrBonus()*.03);
  let def=lv*.8+r*5+(a>=0?(a+1)*4:0);
  const crit=rl>=0?TIER.r[rl]:0.02;
  if(P.weak>0) atk*=.75; if(P.shadow>0) def*=.7; if(P.dizzy>0) def*=.8;
  return {mhp:Math.round(mhp),atk,def,crit};
}
function dmgReduce(def){ return def/(def+60); }
function gainXp(n){ if(hegemon()===G.realm) n=Math.round(n*1.15); G.xp+=n; let up=false; while(G.xp>=xpNeed(G.lv)&&G.lv<60){ G.xp-=xpNeed(G.lv); G.lv++; up=true; } if(up){ P.hp=stat().mhp; toast(`레벨 ${G.lv}!`,"체력과 공격력이 올랐어요",2.2); jingle([523,659,784,1046]); fxRing(P.x,P.z,0xffffff,6); } }
function itemName(s,t){ return RM().items[s][t]; }
function itemDesc(s,t){ return s==="w"?`공격 +${TIER.w[t]}`:s==="a"?`체력 +${TIER.a[t]} · 방어 +${(t+1)*4}`:`치명타 ${Math.round(TIER.r[t]*100)}%`; }

/* ================= 세계 상태(영토) ================= */
let W=(function(){ const o=REGIONS.map(r=>r.cap?r.realm:-1), ts=REGIONS.map(()=>0); try{ const s=JSON.parse(load("gw-world-"+ROOM)||"null"); if(s&&s.o&&s.o.length===REGIONS.length){ for(let i=0;i<REGIONS.length;i++){ if(!REGIONS[i].cap){ o[i]=s.o[i]; ts[i]=s.ts[i]||0; } } } }catch(e){} return {o,ts}; })();
function saveWorld(){ save("gw-world-"+ROOM,JSON.stringify(W)); }
function mergeWorld(s){ if(!s||!s.o||!s.ts) return false; let ch=false; for(let i=0;i<REGIONS.length;i++){ if(REGIONS[i].cap) continue; if((s.ts[i]||0)>(W.ts[i]||0)){ W.o[i]=s.o[i]; W.ts[i]=s.ts[i]; ch=true; } } if(ch){ saveWorld(); paintTerritory(); } return ch; }
function regionAt(x,z){ let best=null,bd=1e9; for(const r of REGIONS){ const d=Math.hypot(x-r.x,z-r.z); if(d<r.r&&d<bd){ bd=d; best=r; } } return best; }
function inCapital(x,z){ const r=regionAt(x,z); return r&&r.cap?r:null; }

/* ================= 3D 장면 ================= */
const canvas=$("view");
const HIGH=()=>G.gfx!=="low";
const renderer=new THREE.WebGLRenderer({canvas,antialias:HIGH(),powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,HIGH()?2:1.3));
renderer.shadowMap.enabled=HIGH(); renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9fd4ff); scene.fog=new THREE.Fog(0xdcefff,60,150);
const camera=new THREE.PerspectiveCamera(55,1,.1,500);
const TOON=(function(){ const c=new Uint8Array([80,140,200,255]); const t=new THREE.DataTexture(c,4,1,THREE.LuminanceFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t; })();
function toon(o){ return new THREE.MeshToonMaterial(Object.assign({gradientMap:TOON},o||{})); }
const hemi=new THREE.HemisphereLight(0xffffff,0x7a6a5a,.55); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff4d8,.7); sun.position.set(40,80,30); sun.castShadow=HIGH();
if(HIGH()){ sun.shadow.mapSize.set(2048,2048); const s=sun.shadow.camera; s.left=-60;s.right=60;s.top=60;s.bottom=-60;s.near=10;s.far=220; sun.shadow.bias=-.0008; }
scene.add(sun); scene.add(sun.target);
function shadowify(o){ o.traverse(m=>{ if(m.isMesh){ m.castShadow=HIGH(); m.receiveShadow=HIGH(); } }); return o; }
const GEO={ box:new THREE.BoxGeometry(1,1,1), sph:new THREE.SphereGeometry(.5,14,10), cyl:new THREE.CylinderGeometry(.5,.5,1,12), cone:new THREE.ConeGeometry(.5,1,10), ring:new THREE.RingGeometry(.8,1,40) };
function box(w,h,d,mat,x,y,z){ const m=new THREE.Mesh(GEO.box,mat); m.scale.set(w,h,d); m.position.set(x||0,y||0,z||0); return m; }
function cyl(rt,rb,h,mat,x,y,z){ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,12),mat); m.position.set(x||0,y||0,z||0); return m; }

/* ---- 땅: 네 세계의 색 + 가운데 중립 ---- */
(function ground(){
  const S=WORLD_HALF;
  REALMS.forEach((R,i)=>{ const sx=(i===0||i===2)?1:-1, sz=(i>=2)?1:-1; const g=new THREE.Mesh(new THREE.PlaneGeometry(S,S,1,1),toon({color:R.ground})); g.rotation.x=-Math.PI/2; g.position.set(sx*S/2,0,sz*S/2); g.receiveShadow=HIGH(); scene.add(g);
    // 영토 느낌의 길
    for(let k=0;k<2;k++){ const rg=REGIONS[i*3+1+k]; const p=new THREE.Mesh(new THREE.CircleGeometry(rg.r*.55,28),toon({color:R.ground2})); p.rotation.x=-Math.PI/2; p.position.set(rg.x,.02,rg.z); scene.add(p); } });
  const c=new THREE.Mesh(new THREE.CircleGeometry(REGIONS[12].r,48),toon({color:0x6e6a80})); c.rotation.x=-Math.PI/2; c.position.y=.03; scene.add(c);
  const c2=new THREE.Mesh(new THREE.CircleGeometry(22,40),toon({color:0x4a4660})); c2.rotation.x=-Math.PI/2; c2.position.y=.04; scene.add(c2);
  // 세계의 경계 벽
  const wm=toon({color:0x2a2340}); [[0,-S,S*2,2],[0,S,S*2,2],[-S,0,2,S*2],[S,0,2,S*2]].forEach(([x,z,w,d])=>{ const m=box(w,6,d,wm,x,3,z); scene.add(m); });
})();
/* ---- 소품: 세계마다 다른 장식 ---- */
const TERR_RINGS={}, ALTARS={};
(function props(){
  const M={ gold:toon({color:0xffd05a}), white:toon({color:0xfaf6ec}), trunk:toon({color:0x8a5a3a}), pine:toon({color:0x2e6b4a}), snow:toon({color:0xf4f8ff}), ice:toon({color:0x9fd6ff,transparent:true,opacity:.85}), rock:toon({color:0x6a7080}), temple:toon({color:0xe36b2a}), tgold:toon({color:0xf5c04a}), lotus:toon({color:0xff8fb8}), water:toon({color:0x4aa3ff,transparent:true,opacity:.8}), marble:toon({color:0xf2f0ea}), laurel:toon({color:0x5a9a4a}), cloud:toon({color:0xffffff,transparent:true,opacity:.75}), dark:toon({color:0x3a3250}), stone:toon({color:0x8a8a9a}) };
  function tree(x,z,R){ const g=new THREE.Group(); const kind=R.prop;
    if(kind==="tree-gold"){ g.add(cyl(.25,.35,2.4,M.white,0,1.2,0)); const c=new THREE.Mesh(GEO.sph,M.gold); c.scale.set(3,3.4,3); c.position.y=3.6; g.add(c); }
    else if(kind==="pine"){ g.add(cyl(.25,.35,1.6,M.trunk,0,.8,0)); for(let k=0;k<3;k++){ const c=new THREE.Mesh(GEO.cone,M.pine); const s=2.6-k*.6; c.scale.set(s,1.6,s); c.position.y=1.8+k*1.1; g.add(c);} const sn=new THREE.Mesh(GEO.cone,M.snow); sn.scale.set(1.3,.9,1.3); sn.position.y=4.3; g.add(sn); }
    else if(kind==="temple"){ const w=rnd(2.2,3.2); g.add(box(w,1.6,w,M.temple,0,.8,0)); g.add(box(w*.7,1.4,w*.7,M.temple,0,2.3,0)); g.add(box(w*.45,1.2,w*.45,M.tgold,0,3.6,0)); const t=new THREE.Mesh(GEO.cone,M.tgold); t.scale.set(1,1.4,1); t.position.y=4.9; g.add(t); }
    else { const h=rnd(3,4.5); g.add(cyl(.42,.5,h,M.marble,0,h/2,0)); g.add(box(1.4,.35,1.4,M.marble,0,h+.15,0)); g.add(box(1.2,.3,1.2,M.marble,0,.15,0)); }
    g.position.set(x,0,z); g.rotation.y=rnd(0,6.3); return shadowify(g); }
  function deco(x,z,R){ const g=new THREE.Group(); const k=R.prop;
    if(k==="tree-gold"){ const p=cyl(.5,.7,rnd(5,9),M.white,0,3,0); g.add(p); const l=new THREE.PointLight(0xfff0b0,.0,0); g.add(l); }
    else if(k==="pine"){ const r=new THREE.Mesh(GEO.box,M.rock); r.scale.set(rnd(2,4),rnd(1,2.5),rnd(2,3)); r.position.y=.6; r.rotation.set(rnd(0,.4),rnd(0,3),rnd(0,.4)); g.add(r); const i=new THREE.Mesh(GEO.cone,M.ice); i.scale.set(1.2,rnd(2,4),1.2); i.position.y=1.5; g.add(i); }
    else if(k==="temple"){ const w=new THREE.Mesh(new THREE.CircleGeometry(rnd(4,7),24),M.water); w.rotation.x=-Math.PI/2; w.position.y=.06; g.add(w); for(let j=0;j<4;j++){ const l=new THREE.Mesh(GEO.sph,M.lotus); l.scale.set(.9,.4,.9); l.position.set(rnd(-3,3),.25,rnd(-3,3)); g.add(l);} }
    else { const b=new THREE.Mesh(GEO.sph,M.laurel); b.scale.set(rnd(1.5,2.5),1.2,rnd(1.5,2.5)); b.position.y=.6; g.add(b); const c=new THREE.Mesh(GEO.sph,M.cloud); c.scale.set(rnd(4,7),1.5,rnd(2,3)); c.position.y=rnd(9,14); g.add(c); }
    g.position.set(x,0,z); return shadowify(g); }
  REALMS.forEach((R,i)=>{ const sx=(i===0||i===2)?1:-1, sz=(i>=2)?1:-1;
    for(let k=0;k<34;k++){ const x=sx*rnd(12,WORLD_HALF-8), z=sz*rnd(12,WORLD_HALF-8); if(Math.hypot(x,z)<REGIONS[12].r+6) continue; const cap=REGIONS[i*3]; if(Math.hypot(x-cap.x,z-cap.z)<22) continue; let near=false; for(const rg of REGIONS){ if(Math.hypot(x-rg.x,z-rg.z)<9) near=true; } if(near) continue; scene.add(k%3===0?deco(x,z,R):tree(x,z,R)); } });
  // 세계의 중심: 세계수
  (function tree(){ const g=new THREE.Group(); g.add(cyl(2.2,3.4,26,M.trunk,0,13,0)); const c=new THREE.Mesh(GEO.sph,toon({color:0x3fa36a})); c.scale.set(22,14,22); c.position.y=30; g.add(c); for(let k=0;k<6;k++){ const r=cyl(.5,.9,8,M.trunk,Math.cos(k)*4,2,Math.sin(k)*4); r.rotation.z=Math.cos(k)*.9; r.rotation.x=Math.sin(k)*.9; g.add(r);} g.position.set(0,0,0); scene.add(shadowify(g)); })();
  for(let k=0;k<10;k++){ const a=k/10*Math.PI*2, r=rnd(28,56); const s=new THREE.Mesh(GEO.box,M.dark); s.scale.set(rnd(2,4),rnd(3,8),rnd(2,4)); s.position.set(Math.cos(a)*r,2,Math.sin(a)*r); s.rotation.y=a; scene.add(shadowify(s)); }
  // 각 지역의 제단(점령 지점) · 수도의 승급 제단과 부활 장소
  REGIONS.forEach(rg=>{ const g=new THREE.Group(); const base=cyl(3.2,3.8,.6,M.stone,0,.3,0); g.add(base); const pil=cyl(.5,.6,2.4,M.stone,0,1.7,0); g.add(pil);
    const orb=new THREE.Mesh(GEO.sph,toon({color:0xffffff})); orb.scale.set(1.3,1.3,1.3); orb.position.y=3.5; g.add(orb); g.userData.orb=orb;
    const ring=new THREE.Mesh(new THREE.RingGeometry(7.2,8,48),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false})); ring.rotation.x=-Math.PI/2; ring.position.y=.08; g.add(ring); g.userData.ring=ring;
    if(rg.cap){ g.position.set(rg.x+(rg.x>0?-16:16),0,rg.z); const R=REALMS[rg.realm];
      // 승급 제단(신의 조각상)
      const st=new THREE.Group(); st.add(box(4,1,4,M.marble,0,.5,0)); const b=makeAvatar(rg.realm,6,true); b.scale.set(1.9,1.9,1.9); b.position.y=1; st.add(b); st.position.set(rg.x,0,rg.z-14); scene.add(shadowify(st)); ALTARS[rg.id]={trial:st.position.clone()};
      // 부활 장소
      const sh=new THREE.Group(); const pk=R.prop;
      if(pk==="tree-gold"){ sh.add(cyl(.8,1.1,6,M.white,0,3,0)); const c=new THREE.Mesh(GEO.sph,M.gold); c.scale.set(7,6,7); c.position.y=7.5; sh.add(c); }
      else if(pk==="pine"){ sh.add(box(10,.6,8,M.trunk,0,.3,0)); for(let j=0;j<4;j++) sh.add(cyl(.4,.4,5,M.trunk,-4+j*2.7,2.8,-3.5)); const rf=new THREE.Mesh(GEO.cone,M.gold); rf.scale.set(11,3,9); rf.position.y=6.5; sh.add(rf); }
      else if(pk==="temple"){ const w=new THREE.Mesh(new THREE.CircleGeometry(8,32),M.water); w.rotation.x=-Math.PI/2; w.position.y=.06; sh.add(w); for(let j=0;j<5;j++){ const l=new THREE.Mesh(GEO.sph,M.lotus); l.scale.set(1.2,.5,1.2); l.position.set(Math.cos(j*1.3)*4,.3,Math.sin(j*1.3)*4); sh.add(l);} }
      else { const w=new THREE.Mesh(new THREE.PlaneGeometry(14,6),toon({color:0x203050,transparent:true,opacity:.9})); w.rotation.x=-Math.PI/2; w.position.y=.06; sh.add(w); sh.add(box(1.2,5,1.2,M.dark,-5,2.5,-4)); sh.add(box(1.2,5,1.2,M.dark,5,2.5,-4)); sh.add(box(11.4,1,1.2,M.dark,0,5.3,-4)); }
      sh.position.set(rg.x,0,rg.z+14); scene.add(shadowify(sh)); ALTARS[rg.id].shrine=sh.position.clone();
    } else g.position.set(rg.x,0,rg.z);
    scene.add(shadowify(g)); TERR_RINGS[rg.id]=g; });
  paintTerritory();
})();
function paintTerritory(){ REGIONS.forEach(rg=>{ const g=TERR_RINGS[rg.id]; if(!g) return; const o=W.o[rg.id]; const col=o>=0?new THREE.Color(REALMS[o].c1):new THREE.Color(0xaaaaaa); g.userData.orb.material.color.copy(col); g.userData.ring.material.color.copy(col); }); if(typeof drawMinimap==="function") drawMinimap(); }

/* ---- 캐릭터(블록 아바타): 세계마다 다른 옷·장식, 계급이 오르면 더 화려해짐 ---- */
function makeAvatar(realm,rank,statue){
  const R=REALMS[realm]||REALMS[0]; const g=new THREE.Group();
  const skin=toon({color:statue?0xd9d4c8:[0xffd9b3,0xf1c9a5,0xc98a5a,0xe6b89c][realm]});
  const cloth=toon({color:statue?0xcfcabd:[0xf7f2e6,0x3b5a8a,0xff8a2a,0xf2eee3][realm]});
  const acc=toon({color:statue?0xbdb6a8:[0xffd05a,0x9fd6ff,0xffd05a,0x7fe0ff][realm]});
  const body=new THREE.Group(); g.add(body); g.userData.body=body;
  const torso=box(1.3,1.5,.75,cloth,0,1.95,0); body.add(torso);
  const head=box(1.05,1.05,1.05,skin,0,3.3,0); body.add(head); g.userData.head=head;
  // 얼굴
  const eyeM=new THREE.MeshBasicMaterial({color:0x1b1430}); [-.22,.22].forEach(x=>{ const e=box(.14,.2,.06,eyeM,x,3.38,.54); body.add(e); });
  const mk=(w,h,d,m,x,y,z)=>{ const p=new THREE.Group(); p.position.set(x,y,z); const b=box(w,h,d,m,0,-h/2,0); p.add(b); return p; };
  const armL=mk(.45,1.3,.45,cloth,-.9,2.65,0), armR=mk(.45,1.3,.45,cloth,.9,2.65,0), legL=mk(.55,1.2,.55,toon({color:0x3a3350}),-.33,1.2,0), legR=mk(.55,1.2,.55,toon({color:0x3a3350}),.33,1.2,0);
  body.add(armL,armR); g.add(legL,legR); Object.assign(g.userData,{armL,armR,legL,legR});
  // 세계별 장식
  if(realm===0){ const halo=new THREE.Mesh(new THREE.TorusGeometry(.6,.08,8,24),acc); halo.rotation.x=Math.PI/2; halo.position.y=4.1; body.add(halo); if(rank>=1){ [-1,1].forEach(s=>{ const w=box(.15,1.4+rank*.15,1.2+rank*.15,toon({color:0xffffff}),s*.85,2.4,-.5); w.rotation.y=s*.5; w.rotation.z=s*.35; body.add(w); }); } }
  else if(realm===1){ const helm=box(1.15,.5,1.15,toon({color:0x6b7f99}),0,3.75,0); body.add(helm); [-1,1].forEach(s=>{ const h=cyl(.08,.18,.8,acc,s*.6,4.05,0); h.rotation.z=s*-.6; body.add(h); }); if(rank>=2){ const cape=box(1.4,2.2,.1,toon({color:0x8a1f2a}),0,1.9,-.45); body.add(cape); } }
  else if(realm===2){ const eye=box(.14,.22,.06,toon({color:0xff3d4a}),0,3.6,.54); body.add(eye); const crown=cyl(.55,.45,.35,acc,0,3.95,0); body.add(crown); if(rank>=3){ const a2=mk(.4,1.2,.4,cloth,-1.25,2.3,0); a2.rotation.z=.6; const a3=mk(.4,1.2,.4,cloth,1.25,2.3,0); a3.rotation.z=-.6; body.add(a2,a3); } }
  else { const l=new THREE.Mesh(new THREE.TorusGeometry(.6,.08,8,20),toon({color:0x5a9a4a})); l.rotation.x=Math.PI/2; l.position.y=3.72; body.add(l); const toga=box(.5,1.5,.8,toon({color:0xffffff}),-.45,1.95,.02); toga.rotation.z=.15; body.add(toga); if(rank>=2){ const bolt=box(.25,1.2,.25,acc,1.25,2.2,0); bolt.rotation.z=.5; body.add(bolt); } }
  if(rank>=4&&!statue){ const aura=new THREE.Mesh(new THREE.RingGeometry(1,1.35,32),new THREE.MeshBasicMaterial({color:R.c1,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false})); aura.rotation.x=-Math.PI/2; aura.position.y=.07; g.add(aura); g.userData.aura=aura; }
  return shadowify(g);
}
function makeWeapon(realm,tier){ const g=new THREE.Group(); const m=toon({color:[0xffd05a,0x9fd6ff,0xffb347,0xe0e8ff][realm]}); const dark=toon({color:0x3a3350});
  if(realm===0){ g.add(box(.12,1.5+tier*.25,.3,m,0,.9,0)); g.add(box(.5,.12,.12,dark,0,.2,0)); }
  else if(realm===1){ g.add(cyl(.07,.07,1.3,dark,0,.6,0)); g.add(box(.9+tier*.1,.55,.4,m,0,1.3,0)); }
  else if(realm===2){ g.add(cyl(.06,.06,1.8,dark,0,.9,0)); for(let k=-1;k<=1;k++) g.add(box(.08,.6,.12,m,k*.22,2.0,0)); }
  else { g.add(cyl(.06,.06,1.8,dark,0,.9,0)); if(tier>=2){ for(let k=-1;k<=1;k++) g.add(box(.08,.5,.1,m,k*.22,2.0,0)); } else g.add(box(.1,.6,.2,m,0,1.9,0)); }
  return shadowify(g); }

/* ---- 괴물 ---- */
function makeMob(shape,color,scale){ const g=new THREE.Group(); const m=toon({color}); const eye=new THREE.MeshBasicMaterial({color:0xff3d3d});
  if(shape==="ghost"){ const b=new THREE.Mesh(GEO.sph,m); b.scale.set(1.6,1.9,1.6); b.position.y=1.8; g.add(b); g.userData.float=1; }
  else if(shape==="angel"){ g.add(box(1.1,1.5,.7,m,0,1.9,0)); g.add(box(.9,.9,.9,m,0,3.1,0)); [-1,1].forEach(s=>{ const w=box(.12,1.6,1.3,toon({color:0x2a2240}),s*.9,2.3,-.4); w.rotation.y=s*.5; g.add(w); }); g.userData.float=.5; }
  else if(shape==="giant"){ g.add(box(2.2,2.6,1.4,m,0,2.2,0)); g.add(box(1.4,1.3,1.3,m,0,4.3,0)); g.add(box(.7,1.9,.7,m,-1.5,2.4,0)); g.add(box(.7,1.9,.7,m,1.5,2.4,0)); g.add(box(.8,1.1,.8,m,-.6,.55,0)); g.add(box(.8,1.1,.8,m,.6,.55,0)); }
  else if(shape==="snake"){ for(let k=0;k<5;k++){ const s=new THREE.Mesh(GEO.sph,m); const r=1.1-k*.12; s.scale.set(r,r,r*1.3); s.position.set(0,.55,k*.9); g.add(s); } g.add(box(.9,.7,1.1,m,0,.9,-.6)); }
  else if(shape==="wolf"){ g.add(box(2.2,1,1,m,0,1.1,0)); g.add(box(.9,.8,.9,m,1.4,1.5,0)); [-1,1].forEach(s=>{ const e=new THREE.Mesh(GEO.cone,m); e.scale.set(.3,.5,.3); e.position.set(1.5,2.1,s*.3); g.add(e);}); for(let k=0;k<4;k++) g.add(box(.3,.9,.3,m,-.7+(k%2)*1.4,.45,(k<2?-1:1)*.35)); }
  else { g.add(box(1.3,1.5,.8,m,0,1.9,0)); g.add(box(1,1,1,m,0,3.1,0)); [-1,1].forEach(s=>{ const h=cyl(.05,.18,.8,toon({color:0x2a1a1a}),s*.45,3.9,0); h.rotation.z=s*-.4; g.add(h); }); g.add(box(.45,1.3,.45,m,-.9,1.9,0)); g.add(box(.45,1.3,.45,m,.9,1.9,0)); }
  const ey=g.userData.float?2.1:(shape==="giant"?4.4:shape==="wolf"?1.6:shape==="snake"?1.0:3.2), ex=shape==="wolf"?1.85:(shape==="snake"?.0:0), ez=shape==="wolf"?.0:(shape==="snake"?-1.1:(shape==="giant"?.66:.5));
  [-.2,.2].forEach(x=>{ const e=box(.16,.16,.06,eye,ex+(shape==="wolf"?0:x),ey,ez+(shape==="wolf"?x:0)); if(shape==="wolf") e.rotation.y=Math.PI/2; g.add(e); });
  g.scale.set(scale,scale,scale); return shadowify(g); }

/* ================= 라벨 ================= */
const labelsEl=$("labels"); const _v=new THREE.Vector3();
function makeLabel(cls){ const d=document.createElement("div"); d.className="lbl "+(cls||""); labelsEl.appendChild(d); return d; }
function placeLabel(el,x,y,z,html){ _v.set(x,y,z).project(camera); if(_v.z>1||Math.abs(_v.x)>1.2||Math.abs(_v.y)>1.2){ el.style.display="none"; return; } el.style.display=""; const sx=(_v.x+1)/2*innerWidth, sy=(1-_v.y)/2*innerHeight; el.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`; if(html!==undefined&&el._h!==html){ el._h=html; el.innerHTML=html; } }
function floatDmg(x,y,z,txt,cls){ const el=makeLabel("dmg "+(cls||"")); placeLabel(el,x,y,z,txt); setTimeout(()=>el.remove(),800); }

/* ================= 효과 ================= */
const FX=[];
function fxRing(x,z,color,size,dur){ const m=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.set(x,.12,z); scene.add(m); FX.push({m,t:0,d:dur||.5,size:size||4,kind:"ring"}); }
function fxFlash(x,y,z,color,size,dur){ const m=new THREE.Mesh(GEO.sph,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95,depthWrite:false})); m.position.set(x,y,z); scene.add(m); FX.push({m,t:0,d:dur||.3,size:size||2,kind:"flash"}); }
function fxBolt(x,z,color){ const m=cyl(.15,.5,30,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95,depthWrite:false}),x,15,z); scene.add(m); FX.push({m,t:0,d:.3,size:1,kind:"bolt"}); }
function fxLine(x,z,rot,len,color){ const m=box(2.2,.4,len,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,depthWrite:false})); m.position.set(x+Math.sin(rot)*len/2,1.2,z+Math.cos(rot)*len/2); m.rotation.y=rot; scene.add(m); FX.push({m,t:0,d:.35,size:1,kind:"line"}); }
function tickFX(dt){ for(let i=FX.length-1;i>=0;i--){ const f=FX[i]; f.t+=dt; const k=f.t/f.d; if(k>=1){ scene.remove(f.m); f.m.material.dispose(); FX.splice(i,1); continue; } if(f.kind==="ring"){ const s=.5+k*f.size; f.m.scale.set(s,s,s); f.m.material.opacity=.9*(1-k); } else if(f.kind==="flash"){ const s=f.size*(.6+k); f.m.scale.set(s,s,s); f.m.material.opacity=.95*(1-k); } else f.m.material.opacity=.9*(1-k); } }
</script>
