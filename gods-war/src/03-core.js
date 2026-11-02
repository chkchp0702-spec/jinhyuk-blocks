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
function goFull(){ try{ const el=document.documentElement; const f=el.requestFullscreen||el.webkitRequestFullscreen; if(f&&!document.fullscreenElement) f.call(el,{navigationUI:"hide"}).catch(()=>{}); }catch(e){} }

/* ================= 방(초대 링크) ================= */
const ROOM=(function(){ const u=new URL(location.href); let k=u.searchParams.get("k"); if(k){ k=k.replace(/[^a-zA-Z0-9_-]/g,"").slice(0,24); save("gw-room",k); } else k=load("gw-room"); return k||""; })();
function inviteLink(){ const u=new URL(location.href); u.search="?k="+ROOM; return u.toString(); }

/* ================= 저장 ================= */
const SAVEKEY="gw-save-"+ROOM;
function freshSave(){ return {v:1,name:"",realm:-1,lv:1,xp:0,gold:80,rank:0,eq:{w:0,a:0,r:-1},bag:[],pots:4,kills:0,war:0,capt:0,deaths:0,quests:[],qdone:0,bossKills:0,t:Date.now(),gfx:"high",id:Math.random().toString(36).slice(2,8)}; }
let G=(function(){ try{ const s=JSON.parse(load(SAVEKEY)||"null"); if(s&&s.v===1) return Object.assign(freshSave(),s); }catch(e){} return freshSave(); })();
function saveGame(){ G.t=Date.now(); save(SAVEKEY,JSON.stringify(G)); }
document.addEventListener("visibilitychange",()=>{ if(document.hidden) saveGame(); });
const RM=()=>REALMS[G.realm]||REALMS[0];

/* ================= 능력치 ================= */
function xpNeed(lv){ return Math.round(36*Math.pow(lv,1.45)); }
function terrBonus(){ let n=0; for(let i=0;i<REGIONS.length;i++) if(!REGIONS[i].cap && W.o[i]===G.realm) n++; return n; }
function hegemon(){ const cnt=[0,0,0,0]; for(let i=0;i<REGIONS.length;i++){ if(W.o[i]>=0) cnt[W.o[i]]++; } let best=-1,bn=0; cnt.forEach((c,i)=>{ if(c>bn){bn=c;best=i;} }); return cnt.filter(c=>c===bn).length===1?best:-1; }
function stat(){
  const r=G.rank, lv=G.lv, w=G.eq.w, a=G.eq.a, rl=G.eq.r;
  let mhp=220+lv*22+r*90+(a>=0?TIER.a[a]:0);
  let atk=(16+lv*3+r*14+(w>=0?TIER.w[w]:0))*(1+terrBonus()*.03)*(P.rage>0?1.5:1);
  let def=4+lv*1.2+r*6+(a>=0?(a+1)*5:0);
  const crit=(rl>=0?TIER.r[rl]:0.05)+(P.rage>0?.15:0);
  if(P.weak>0) atk*=.75; if(P.shadow>0) def*=.7; if(P.dizzy>0) def*=.8;
  return {mhp:Math.round(mhp),atk,def,crit};
}
function dmgReduce(def){ return def/(def+50); }
function gainXp(n){ if(hegemon()===G.realm) n=Math.round(n*1.15); G.xp+=n; let up=false; while(G.xp>=xpNeed(G.lv)&&G.lv<60){ G.xp-=xpNeed(G.lv); G.lv++; up=true; } if(up){ P.hp=stat().mhp; toast(`레벨 ${G.lv}!`,"체력과 공격력이 올랐어요",2.2); jingle([523,659,784,1046]); fxRing(P.x,P.z,0xffffff,6); fxSpark(P.x,2,P.z,0xffe08a,40); } }
function itemName(s,t){ return RM().items[s][t]; }
function itemDesc(s,t){ return s==="w"?`공격 +${TIER.w[t]}`:s==="a"?`체력 +${TIER.a[t]} · 방어 +${(t+1)*5}`:`치명타 ${Math.round(TIER.r[t]*100)}%`; }

/* ================= 세계 상태(영토) ================= */
let W=(function(){ const o=REGIONS.map(r=>r.cap?r.realm:-1), ts=REGIONS.map(()=>0); try{ const s=JSON.parse(load("gw-world-"+ROOM)||"null"); if(s&&s.o&&s.o.length===REGIONS.length){ for(let i=0;i<REGIONS.length;i++){ if(!REGIONS[i].cap){ o[i]=s.o[i]; ts[i]=s.ts[i]||0; } } } }catch(e){} return {o,ts}; })();
function saveWorld(){ save("gw-world-"+ROOM,JSON.stringify(W)); }
function mergeWorld(s){ if(!s||!s.o||!s.ts) return false; let ch=false; for(let i=0;i<REGIONS.length;i++){ if(REGIONS[i].cap) continue; if((s.ts[i]||0)>(W.ts[i]||0)){ W.o[i]=s.o[i]; W.ts[i]=s.ts[i]; ch=true; } } if(ch){ saveWorld(); paintTerritory(); } return ch; }
function regionAt(x,z){ let best=null,bd=1e9; for(const r of REGIONS){ const d=Math.hypot(x-r.x,z-r.z); if(d<r.r&&d<bd){ bd=d; best=r; } } return best; }
function inCapital(x,z){ const r=regionAt(x,z); return r&&r.cap?r:null; }

/* ================= 3D 장면 ================= */
const canvas=$("view");
const HIGH=()=>G.gfx!=="low";
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,HIGH()?2:1.5));
renderer.shadowMap.enabled=HIGH(); renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.95;
renderer.physicallyCorrectLights=false;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9fd4ff); scene.fog=new THREE.Fog(0xdcefff,55,165);
const camera=new THREE.PerspectiveCamera(55,1,.1,600);
/* 재질: 표준 PBR + 약간의 광택. 세계마다 색은 다르게 */
function mat(o){ return new THREE.MeshStandardMaterial(Object.assign({roughness:.78,metalness:.05},o||{})); }
function toon(o){ return mat(o); }
function glowMat(color,op){ return new THREE.MeshBasicMaterial({color,transparent:true,opacity:op==null?.9:op,depthWrite:false,blending:THREE.AdditiveBlending}); }
const hemi=new THREE.HemisphereLight(0xdff3ff,0x6b5a4a,.5); scene.add(hemi);
scene.add(new THREE.AmbientLight(0xffffff,.12));
const sun=new THREE.DirectionalLight(0xfff1d6,1.25); sun.position.set(40,80,30); sun.castShadow=HIGH();
if(HIGH()){ sun.shadow.mapSize.set(2048,2048); const s=sun.shadow.camera; s.left=-55;s.right=55;s.top=55;s.bottom=-55;s.near=10;s.far=220; sun.shadow.bias=-.0006; sun.shadow.normalBias=.03; sun.shadow.radius=3; }
scene.add(sun); scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xb8d4ff,.3); fill.position.set(-30,40,-50); scene.add(fill);
function shadowify(o){ o.traverse(m=>{ if(m.isMesh){ m.castShadow=HIGH(); m.receiveShadow=HIGH(); } }); return o; }
const GEO={ box:new THREE.BoxGeometry(1,1,1), rbox:new THREE.BoxGeometry(1,1,1,2,2,2), sph:new THREE.SphereGeometry(.5,18,14), cyl:new THREE.CylinderGeometry(.5,.5,1,14), cone:new THREE.ConeGeometry(.5,1,12), ring:new THREE.RingGeometry(.8,1,48) };
function box(w,h,d,m,x,y,z){ const o=new THREE.Mesh(GEO.box,m); o.scale.set(w,h,d); o.position.set(x||0,y||0,z||0); return o; }
function cyl(rt,rb,h,m,x,y,z,seg){ const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),m); o.position.set(x||0,y||0,z||0); return o; }
function sph(r,m,x,y,z){ const o=new THREE.Mesh(GEO.sph,m); o.scale.setScalar(r*2); o.position.set(x||0,y||0,z||0); return o; }

/* ---- 하늘: 그라데이션 돔 + 태양 ---- */
const SKY={top:new THREE.Color(0x3d7fd6),bot:new THREE.Color(0xdcefff),tTop:new THREE.Color(0x3d7fd6),tBot:new THREE.Color(0xdcefff)};
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:SKY.top},bot:{value:SKY.bot},sunDir:{value:new THREE.Vector3(.4,.5,.3).normalize()}},
  vertexShader:`varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`uniform vec3 top,bot,sunDir; varying vec3 vP; void main(){ float h=clamp(vP.y*1.6+.25,0.,1.); vec3 c=mix(bot,top,pow(h,.75)); float s=max(dot(vP,sunDir),0.); c+=vec3(1.,.95,.8)*pow(s,180.)*1.2+vec3(1.,.9,.7)*pow(s,8.)*.25; gl_FragColor=vec4(c,1.); }`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(420,24,16),skyMat); scene.add(sky);
/* 구름 */
const CLOUDS=[];
(function clouds(){ const m=mat({color:0xffffff,transparent:true,opacity:.85,roughness:1}); for(let k=0;k<26;k++){ const g=new THREE.Group(); const n=rint(3,6); for(let j=0;j<n;j++){ const s=sph(rnd(4,9),m,rnd(-8,8),rnd(-1,1),rnd(-3,3)); s.scale.y*=.55; g.add(s); } g.position.set(rnd(-260,260),rnd(48,70),rnd(-260,260)); g.userData.v=rnd(.4,1); scene.add(g); CLOUDS.push(g); } })();

/* ---- 절차 텍스처: 땅의 결 ---- */
function noiseTex(base,spots,scale){ const c=document.createElement("canvas"); c.width=c.height=256; const x=c.getContext("2d"); x.fillStyle=base; x.fillRect(0,0,256,256);
  for(let k=0;k<900;k++){ x.fillStyle=pick(spots); x.globalAlpha=rnd(.15,.5); const r=rnd(2,9); x.beginPath(); x.ellipse(rnd(0,256),rnd(0,256),r,r*rnd(.4,1),rnd(0,3),0,6.3); x.fill(); }
  x.globalAlpha=1; const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(scale||40,scale||40); t.anisotropy=4; t.encoding=THREE.sRGBEncoding; return t; }
const GROUND_TEX=[ noiseTex("#c4dd9c",["#a8c97d","#d9eab5","#ffe9a3","#9bbf6f"]), noiseTex("#e9f1f8",["#cfdde9","#ffffff","#b9cde0","#f4f8ff"]), noiseTex("#d2ac6c",["#b9905a","#e0c08a","#b07a40","#d4a05c"]), noiseTex("#d6e3c8",["#b9cfa8","#ecf3e4","#9fbf8c","#e4e9d6"]) ];
const CENTER_TEX=noiseTex("#5d5a70",["#3f3c50","#7a7690","#4a4660","#8a86a0"],30);

/* ---- 땅 ---- */
(function ground(){
  const S=WORLD_HALF;
  REALMS.forEach((R,i)=>{ const sx=(i===0||i===2)?1:-1, sz=(i>=2)?1:-1; const g=new THREE.Mesh(new THREE.PlaneGeometry(S,S,1,1),mat({map:GROUND_TEX[i],roughness:1})); g.rotation.x=-Math.PI/2; g.position.set(sx*S/2,0,sz*S/2); g.receiveShadow=HIGH(); scene.add(g);
    for(let k=0;k<2;k++){ const rg=REGIONS[i*3+1+k]; const p=new THREE.Mesh(new THREE.CircleGeometry(rg.r*.6,40),mat({color:R.ground2,roughness:1,transparent:true,opacity:.55})); p.rotation.x=-Math.PI/2; p.position.set(rg.x,.02,rg.z); scene.add(p); }
    // 수도 광장: 돌바닥
    const cap=REGIONS[i*3]; const pl=new THREE.Mesh(new THREE.CircleGeometry(30,48),mat({color:[0xf3ead2,0x9aa7b5,0xe0a060,0xece8dc][i],roughness:.9})); pl.rotation.x=-Math.PI/2; pl.position.set(cap.x,.03,cap.z); pl.receiveShadow=HIGH(); scene.add(pl);
    const ring=new THREE.Mesh(new THREE.RingGeometry(30,32,48),mat({color:0xffffff,roughness:.6})); ring.rotation.x=-Math.PI/2; ring.position.set(cap.x,.035,cap.z); scene.add(ring); });
  const c=new THREE.Mesh(new THREE.CircleGeometry(REGIONS[12].r,64),mat({map:CENTER_TEX,roughness:1})); c.rotation.x=-Math.PI/2; c.position.y=.03; c.receiveShadow=HIGH(); scene.add(c);
  const c2=new THREE.Mesh(new THREE.RingGeometry(20,23,48),glowMat(0xb08cff,.5)); c2.rotation.x=-Math.PI/2; c2.position.y=.05; scene.add(c2);
  // 길: 수도 ↔ 중심
  REGIONS.filter(r=>r.cap).forEach(r=>{ const len=Math.hypot(r.x,r.z)-70; const road=new THREE.Mesh(new THREE.PlaneGeometry(7,len),mat({color:0xcfc4ac,roughness:1,transparent:true,opacity:.7})); road.rotation.x=-Math.PI/2; road.rotation.z=-Math.atan2(r.x,r.z); road.position.set(r.x/2*(1-30/Math.hypot(r.x,r.z)),.025,r.z/2*(1-30/Math.hypot(r.x,r.z))); scene.add(road); });
  const wm=mat({color:0x2a2340,roughness:.9}); [[0,-S,S*2,2],[0,S,S*2,2],[-S,0,2,S*2],[S,0,2,S*2]].forEach(([x,z,w,d])=>{ scene.add(box(w,8,d,wm,x,4,z)); });
})();

/* ---- 소품: 세계마다 다른 장식 ---- */

/* ---- 물: 물결 + 반짝임 셰이더 ---- */
const TIME={value:0};
const WATER=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{time:TIME,deep:{value:new THREE.Color(0x1f5fb8)},shallow:{value:new THREE.Color(0x6fd0ff)},sunDir:{value:new THREE.Vector3(.4,.6,.3)}}]),
  vertexShader:`varying vec3 vW; varying vec3 vN; varying vec2 vUv; #include <fog_pars_vertex>
    void main(){ vUv=uv; vec4 wp=modelMatrix*vec4(position,1.); vW=wp.xyz; vN=normalize(mat3(modelMatrix)*normal); vec4 mv=viewMatrix*wp; gl_Position=projectionMatrix*mv; #include <fog_vertex> }`,
  fragmentShader:`uniform float time; uniform vec3 deep,shallow,sunDir; varying vec3 vW; varying vec3 vN; varying vec2 vUv; #include <fog_pars_fragment>
    void main(){ float w=sin(vW.x*1.3+time*1.6)*.5+sin(vW.z*1.1-time*1.3)*.5+sin((vW.x+vW.z)*2.2+time*2.4)*.25; vec3 n=normalize(vN+vec3(w*.12,0.,w*.1)); vec3 v=normalize(cameraPosition-vW); float fr=pow(1.-max(dot(n,v),0.),2.); vec3 c=mix(deep,shallow,.35+w*.25); c=mix(c,vec3(.9,.97,1.),fr*.5); vec3 h=normalize(normalize(sunDir)+v); c+=vec3(1.)*pow(max(dot(n,h),0.),90.)*.9; float ring=smoothstep(.98,1.,fract(length(vUv-.5)*6.-time*.4)); c+=ring*.08; gl_FragColor=vec4(c,.86); #include <fog_fragment> }`});
const TERR_RINGS={}, ALTARS={};
const M={ gold:mat({color:0xffd05a,metalness:.6,roughness:.35}), white:mat({color:0xfaf6ec}), trunk:mat({color:0x7a4e2e,roughness:1}), pine:mat({color:0x2e6b4a}), snow:mat({color:0xf6f9ff,roughness:1}), ice:mat({color:0xa6dcff,transparent:true,opacity:.8,roughness:.2,metalness:.1}), rock:mat({color:0x66707f,roughness:1}), temple:mat({color:0xd8602a}), tgold:mat({color:0xf5c04a,metalness:.6,roughness:.3}), lotus:mat({color:0xff8fb8}), water:WATER, marble:mat({color:0xf4f1ea,roughness:.5}), laurel:mat({color:0x5a9a4a}), dark:mat({color:0x3a3250,roughness:.95}), stone:mat({color:0x8a8a9a,roughness:.95}), red:mat({color:0x9a2030}), wood:mat({color:0x5a3a22,roughness:1}), leaf:mat({color:0x3fa36a}), shield:mat({color:0xc9a24a,metalness:.4,roughness:.5}) };
const EMBLEM={}; function emblemMat(realm){ if(EMBLEM[realm]) return EMBLEM[realm]; const c=document.createElement("canvas"); c.width=c.height=64; const x=c.getContext("2d"); x.fillStyle=["#c9a227","#2d4e7a","#b8471e","#2f6fb0"][realm]; x.beginPath(); x.arc(32,32,30,0,6.3); x.fill(); x.fillStyle="#fff"; x.font="bold 40px serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(REALMS[realm].icon,32,34); const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; return EMBLEM[realm]=mat({map:t,transparent:true,roughness:.5,metalness:.3}); }
function tree(x,z,R){ const g=new THREE.Group(); const kind=R.prop;
  if(kind==="tree-gold"){ g.add(cyl(.22,.4,2.8,M.white,0,1.4,0)); const c=sph(1.7,M.gold,0,3.9,0); c.scale.y*=1.15; g.add(c); g.add(sph(.9,M.gold,.9,3.2,.5)); g.add(sph(.8,M.gold,-.9,3.4,-.4)); }
  else if(kind==="pine"){ g.add(cyl(.22,.36,1.8,M.trunk,0,.9,0)); for(let k=0;k<3;k++){ const c=new THREE.Mesh(GEO.cone,M.pine); const s=2.8-k*.65; c.scale.set(s,1.7,s); c.position.y=2+k*1.15; g.add(c); const sn=new THREE.Mesh(GEO.cone,M.snow); sn.scale.set(s*.95,.5,s*.95); sn.position.y=2.55+k*1.15; g.add(sn); } }
  else if(kind==="temple"){ const w=rnd(2.4,3.4); g.add(box(w,1.6,w,M.temple,0,.8,0)); g.add(box(w*.72,1.3,w*.72,M.temple,0,2.25,0)); g.add(box(w*.5,1.1,w*.5,M.tgold,0,3.45,0)); const t=new THREE.Mesh(GEO.cone,M.tgold); t.scale.set(1.1,1.5,1.1); t.position.y=4.7; g.add(t); for(let j=0;j<4;j++){ const a=j*Math.PI/2; g.add(box(.35,1.2,.35,M.tgold,Math.cos(a)*w*.45,2.2,Math.sin(a)*w*.45)); } }
  else { const h=rnd(3.2,4.8); g.add(cyl(.42,.5,h,M.marble,0,h/2,0,16)); g.add(box(1.5,.35,1.5,M.marble,0,h+.15,0)); g.add(box(1.3,.3,1.3,M.marble,0,.15,0)); for(let j=0;j<8;j++){ const a=j/8*6.283; g.add(box(.12,h*.9,.12,M.marble,Math.cos(a)*.44,h/2,Math.sin(a)*.44)); } }
  g.position.set(x,0,z); g.rotation.y=rnd(0,6.3); return shadowify(g); }
function deco(x,z,R){ const g=new THREE.Group(); const k=R.prop;
  if(k==="tree-gold"){ const h=rnd(5,9); g.add(cyl(.45,.7,h,M.white,0,h/2,0,10)); g.add(sph(.8,glowMat(0xfff0b0,.7),0,h+.6,0)); }
  else if(k==="pine"){ const r=new THREE.Mesh(GEO.box,M.rock); r.scale.set(rnd(2,4),rnd(1,2.5),rnd(2,3)); r.position.y=.6; r.rotation.set(rnd(0,.4),rnd(0,3),rnd(0,.4)); g.add(r); for(let j=0;j<3;j++){ const i=new THREE.Mesh(GEO.cone,M.ice); i.scale.set(rnd(.6,1.2),rnd(2,4.5),rnd(.6,1.2)); i.position.set(rnd(-1,1),1.5,rnd(-1,1)); i.rotation.z=rnd(-.3,.3); g.add(i); } }
  else if(k==="temple"){ const w=new THREE.Mesh(new THREE.CircleGeometry(rnd(4,7),28),M.water); w.rotation.x=-Math.PI/2; w.position.y=.06; g.add(w); for(let j=0;j<5;j++){ const l=sph(.5,M.lotus,rnd(-3,3),.25,rnd(-3,3)); l.scale.y*=.4; g.add(l); g.add(sph(.2,M.gold,l.position.x,.45,l.position.z)); } }
  else { const b=sph(rnd(.9,1.4),M.laurel,0,.7,0); b.scale.y*=.8; g.add(b); g.add(sph(.6,M.laurel,.9,.5,.4)); g.add(sph(.5,M.laurel,-.8,.5,-.3)); if(Math.random()<.5){ const st=box(1.2,1.6,1.2,M.marble,2.5,.8,0); g.add(st); g.add(sph(.4,M.marble,2.5,1.9,0)); } }
  g.position.set(x,0,z); return shadowify(g); }
/* 수도 건물: 세계마다 다른 양식 */
function capitalBuilding(i,x,z){ const g=new THREE.Group();
  if(i===0){ // 에덴: 흰 아치와 황금 돔
    g.add(cyl(9,10,1.2,M.marble,0,.6,0,32)); for(let j=0;j<8;j++){ const a=j/8*6.283; g.add(cyl(.6,.7,9,M.white,Math.cos(a)*7,5.5,Math.sin(a)*7,12)); } g.add(cyl(8.5,8.5,.8,M.marble,0,10.4,0,32)); const d=sph(7,M.gold,0,11,0); d.scale.y*=.8; g.add(d); g.add(cyl(.4,.6,4,M.gold,0,17,0)); g.add(sph(.8,glowMat(0xfff4c0,.8),0,19.5,0)); }
  else if(i===1){ // 아스가르드: 롱하우스 + 방패
    g.add(box(22,1,14,M.rock,0,.5,0)); for(let j=0;j<6;j++) g.add(cyl(.5,.5,7,M.wood,-9+j*3.6,4,-6.4)); for(let j=0;j<6;j++) g.add(cyl(.5,.5,7,M.wood,-9+j*3.6,4,6.4)); g.add(box(20,6,12,M.wood,0,4,0)); const rf=new THREE.Mesh(new THREE.ConeGeometry(9,6,4),M.red); rf.rotation.y=Math.PI/4; rf.scale.set(1.35,1,1); rf.position.y=10; g.add(rf); for(let j=0;j<5;j++){ const s=cyl(1,1,.3,M.shield,-8+j*4,5.5,6.6); s.rotation.x=Math.PI/2; g.add(s); } g.add(cyl(.3,.3,5,M.gold,-8,14,0)); g.add(cyl(.3,.3,5,M.gold,8,14,0)); }
  else if(i===2){ // 인도: 층층 고푸람
    const cols=[M.temple,M.tgold]; for(let k=0;k<6;k++){ const w=20-k*3; g.add(box(w,2.4,w,cols[k%2],0,1.2+k*2.4,0)); for(let j=0;j<4;j++){ const a=j*Math.PI/2+Math.PI/4; g.add(sph(.7,M.tgold,Math.cos(a)*w*.6,2.4+k*2.4,Math.sin(a)*w*.6)); } } const t=new THREE.Mesh(GEO.cone,M.tgold); t.scale.set(4,4,4); t.position.y=16.4; g.add(t); g.add(sph(.9,glowMat(0xffd080,.8),0,19,0)); }
  else { // 올림푸스: 기둥 신전 + 박공
    g.add(box(24,1.4,16,M.marble,0,.7,0)); g.add(box(22,.8,14,M.marble,0,1.8,0)); for(let j=0;j<6;j++){ g.add(cyl(.7,.8,9,M.marble,-10+j*4,6.5,-6,16)); g.add(cyl(.7,.8,9,M.marble,-10+j*4,6.5,6,16)); } g.add(box(24,1.2,16,M.marble,0,11.6,0)); const ped=new THREE.Mesh(new THREE.ConeGeometry(9,4,4),M.marble); ped.rotation.y=Math.PI/4; ped.scale.set(1.4,1,1); ped.position.y=14; g.add(ped); g.add(box(.6,.6,.6,M.gold,0,16.3,0)); g.add(sph(.9,glowMat(0xaee8ff,.8),0,17,0)); }
  g.position.set(x,0,z); return shadowify(g); }
(function props(){
  REALMS.forEach((R,i)=>{ const sx=(i===0||i===2)?1:-1, sz=(i>=2)?1:-1;
    for(let k=0;k<70;k++){ const x=sx*rnd(10,WORLD_HALF-8), z=sz*rnd(10,WORLD_HALF-8); if(Math.hypot(x,z)<REGIONS[12].r+6) continue; const cap=REGIONS[i*3]; if(Math.hypot(x-cap.x,z-cap.z)<34) continue; let near=false; for(const rg of REGIONS){ if(Math.hypot(x-rg.x,z-rg.z)<10) near=true; } if(near) continue; scene.add(k%3===0?deco(x,z,R):tree(x,z,R)); }
    const cap=REGIONS[i*3]; scene.add(capitalBuilding(i,cap.x+(cap.x>0?14:-14),cap.z+(cap.z>0?-14:14)));
    // 수도 둘레 가로등/횃불
    for(let j=0;j<10;j++){ const a=j/10*6.283; const px=cap.x+Math.cos(a)*31, pz=cap.z+Math.sin(a)*31; const g=new THREE.Group(); g.add(cyl(.15,.2,4,M.dark,0,2,0,8)); g.add(sph(.4,glowMat(R.c1,.9),0,4.3,0)); g.position.set(px,0,pz); scene.add(g); } });
  // 빛 기둥(광선): 에덴 수도와 세계의 중심
  (function shafts(){ const cap=REGIONS[0]; for(let j=0;j<7;j++){ const a=j/7*6.283; const c=cyl(.6,3.5,60,glowMat(0xfff2c0,.16),cap.x+Math.cos(a)*22,30,cap.z+Math.sin(a)*22,8); c.rotation.z=Math.cos(a)*.15; c.rotation.x=Math.sin(a)*.15; c.userData.noOutline=true; scene.add(c); } for(let j=0;j<6;j++){ const a=j/6*6.283; const c=cyl(.5,2.5,50,glowMat(0xb08cff,.14),Math.cos(a)*26,28,Math.sin(a)*26,8); scene.add(c); } })();
  // 세계수
  (function(){ const g=new THREE.Group(); g.add(cyl(2.4,4,28,M.trunk,0,14,0,16)); for(let k=0;k<7;k++){ const a=k/7*6.283; const r=cyl(.6,1.2,10,M.trunk,Math.cos(a)*4.5,2.5,Math.sin(a)*4.5,8); r.rotation.z=Math.cos(a)*1; r.rotation.x=Math.sin(a)*1; g.add(r); const br=cyl(.5,.9,12,M.trunk,Math.cos(a)*6,26,Math.sin(a)*6,8); br.rotation.z=-Math.cos(a)*.9; br.rotation.x=Math.sin(a)*.9; g.add(br); g.add(sph(6,M.leaf,Math.cos(a)*11,31,Math.sin(a)*11)); } g.add(sph(12,M.leaf,0,34,0)); for(let k=0;k<30;k++){ g.add(sph(.35,glowMat(0xc8ffd8,.9),rnd(-14,14),rnd(24,42),rnd(-14,14))); } scene.add(shadowify(g)); })();
  for(let k=0;k<14;k++){ const a=k/14*6.283, r=rnd(30,58); const s=new THREE.Mesh(GEO.box,M.dark); s.scale.set(rnd(2,4),rnd(3,9),rnd(2,4)); s.position.set(Math.cos(a)*r,2,Math.sin(a)*r); s.rotation.y=a; s.rotation.z=rnd(-.15,.15); scene.add(shadowify(s)); const rune=sph(.3,glowMat(0xb08cff,.9),s.position.x,s.scale.y+2.5,s.position.z); scene.add(rune); }
  // 제단 · 수도의 승급 조각상 · 부활 장소
  REGIONS.forEach(rg=>{ const g=new THREE.Group(); g.add(cyl(3.4,4,.7,M.stone,0,.35,0,24)); g.add(cyl(2.6,3,.5,M.stone,0,.95,0,24)); for(let j=0;j<4;j++){ const a=j*Math.PI/2; g.add(cyl(.3,.35,3.2,M.stone,Math.cos(a)*2.2,2.6,Math.sin(a)*2.2,10)); } g.add(cyl(2.6,2.6,.4,M.stone,0,4.3,0,24));
    const orb=sph(.8,glowMat(0xffffff,.95),0,3.3,0); g.add(orb); g.userData.orb=orb; const core=sph(.5,mat({color:0xffffff,emissive:0xffffff,emissiveIntensity:.8}),0,3.3,0); g.add(core); g.userData.core=core;
    const ring=new THREE.Mesh(new THREE.RingGeometry(7.2,8,64),glowMat(0xffffff,.55)); ring.rotation.x=-Math.PI/2; ring.position.y=.08; g.add(ring); g.userData.ring=ring;
    if(rg.cap){ g.position.set(rg.x+(rg.x>0?-18:18),0,rg.z+(rg.z>0?6:-6));
      const st=new THREE.Group(); st.add(cyl(2.8,3.2,1.2,M.marble,0,.6,0,24)); const b=makeAvatar(rg.realm,6,true); b.scale.setScalar(2.1); b.position.y=1.2; st.add(b); st.position.set(rg.x,0,rg.z+(rg.z>0?-16:16)); scene.add(shadowify(st)); ALTARS[rg.id]={trial:st.position.clone()};
      const sh=new THREE.Group(); const pk=REALMS[rg.realm].prop;
      if(pk==="tree-gold"){ sh.add(cyl(.9,1.5,13,M.white,0,6.5,0,12)); const c=sph(4.5,M.gold,0,15,0); c.scale.y*=.8; sh.add(c); sh.add(sph(2.4,M.gold,3,13.5,1.5)); sh.add(sph(2.2,M.gold,-2.8,14,-1)); for(let j=0;j<12;j++) sh.add(sph(.25,glowMat(0xfff4c0,.9),rnd(-4,4),rnd(8,15),rnd(-4,4))); }
      else if(pk==="pine"){ sh.add(box(12,.6,9,M.wood,0,.3,0)); for(let j=0;j<4;j++){ sh.add(cyl(.4,.4,5,M.wood,-4.5+j*3,2.8,-4)); sh.add(cyl(.4,.4,5,M.wood,-4.5+j*3,2.8,4)); } const rf=new THREE.Mesh(new THREE.ConeGeometry(7,4,4),M.gold); rf.rotation.y=Math.PI/4; rf.scale.set(1.3,1,1); rf.position.y=7; sh.add(rf); sh.add(sph(.9,glowMat(0xaee8ff,.8),0,9.6,0)); }
      else if(pk==="temple"){ const w=new THREE.Mesh(new THREE.CircleGeometry(9,40),M.water); w.rotation.x=-Math.PI/2; w.position.y=.06; sh.add(w); for(let j=0;j<7;j++){ const l=sph(.7,M.lotus,Math.cos(j*.9)*5,.3,Math.sin(j*.9)*5); l.scale.y*=.4; sh.add(l); } sh.add(cyl(1.2,1.4,.6,M.tgold,0,.3,0)); sh.add(sph(1,glowMat(0xffd080,.8),0,2,0)); }
      else { const w=new THREE.Mesh(new THREE.PlaneGeometry(16,7),WATER); w.rotation.x=-Math.PI/2; w.position.y=.06; sh.add(w); sh.add(cyl(.7,.8,6,M.dark,-6,3,-4.5)); sh.add(cyl(.7,.8,6,M.dark,6,3,-4.5)); sh.add(box(13.5,1.2,1.4,M.dark,0,6.2,-4.5)); sh.add(box(5,1.6,2,M.wood,0,.5,1)); sh.add(sph(.6,glowMat(0x9fe0ff,.8),0,7.2,-4.5)); }
      sh.position.set(rg.x,0,rg.z+(rg.z>0?24:-24)); scene.add(shadowify(sh)); ALTARS[rg.id].shrine=sh.position.clone();
    } else g.position.set(rg.x,0,rg.z);
    scene.add(shadowify(g)); TERR_RINGS[rg.id]=g; });
  paintTerritory();
})();
function paintTerritory(){ REGIONS.forEach(rg=>{ const g=TERR_RINGS[rg.id]; if(!g) return; const o=W.o[rg.id]; const col=o>=0?new THREE.Color(REALMS[o].c1):new THREE.Color(0xaaaaaa); g.userData.orb.material.color.copy(col); g.userData.core.material.emissive.copy(col); g.userData.ring.material.color.copy(col); }); if(typeof drawMinimap==="function") drawMinimap(); }

/* ---- 세계별 입자(황금빛·눈·꽃잎·번개 불꽃) ---- */
const PART=(function(){ const N=HIGH()?500:200; const geo=new THREE.BufferGeometry(); const pos=new Float32Array(N*3); for(let i=0;i<N;i++){ pos[i*3]=rnd(-60,60); pos[i*3+1]=rnd(0,30); pos[i*3+2]=rnd(-60,60); } geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const c=document.createElement("canvas"); c.width=c.height=32; const x=c.getContext("2d"); const gr=x.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,"rgba(255,255,255,1)"); gr.addColorStop(.5,"rgba(255,255,255,.5)"); gr.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=gr; x.fillRect(0,0,32,32);
  const m=new THREE.PointsMaterial({size:1.1,map:new THREE.CanvasTexture(c),transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,color:0xffe9a0,sizeAttenuation:true}); const pts=new THREE.Points(geo,m); scene.add(pts); return {pts,pos,N,geo,m}; })();
function tickParticles(dt,cx,cz,realmIdx){ const a=PART.pos; const R=REALMS[realmIdx]||REALMS[0]; const mode=R.prop; PART.m.color.set(mode==="pine"?0xffffff:mode==="temple"?0xffb0c8:mode==="column"?0xcfe8ff:0xffe9a0); PART.m.size=mode==="pine"?.9:1.2;
  for(let i=0;i<PART.N;i++){ const j=i*3; if(mode==="pine"){ a[j+1]-=dt*3.5; a[j]+=Math.sin(performance.now()/900+i)*dt*.8; } else if(mode==="temple"){ a[j+1]-=dt*1.6; a[j]+=dt*1.2; } else { a[j+1]+=dt*(mode==="column"?2:1); a[j]+=Math.sin(performance.now()/700+i)*dt*.5; }
    if(a[j+1]<0) a[j+1]=30; if(a[j+1]>32) a[j+1]=0; if(a[j]-cx>60) a[j]-=120; if(a[j]-cx<-60) a[j]+=120; if(a[j+2]-cz>60) a[j+2]-=120; if(a[j+2]-cz<-60) a[j+2]+=120; }
  PART.geo.attributes.position.needsUpdate=true; }

/* ---- 캐릭터(블록 아바타): 세계·계급에 따라 장비가 화려해짐 ---- */
function makeAvatar(realm,rank,statue){
  const R=REALMS[realm]||REALMS[0]; const g=new THREE.Group();
  const skin=mat({color:statue?0xd9d4c8:[0xffd9b3,0xf1c9a5,0xc98a5a,0xe6b89c][realm],roughness:.9});
  const clothC=[[0xf7f2e6,0xffffff,0xfff3c4],[0x3b5a8a,0x2b3f66,0x5a7fb0],[0xff8a2a,0xd84a2a,0xffb347],[0xf2eee3,0xffffff,0xe8dcc0]][realm];
  const cloth=mat({color:statue?0xcfcabd:clothC[Math.min(2,Math.floor(rank/3))],roughness:.8});
  const accC=[0xffd05a,0x9fd6ff,0xffd05a,0x7fe0ff][realm]; const acc=mat({color:statue?0xbdb6a8:accC,metalness:.7,roughness:.3});
  const armor=mat({color:statue?0xbdb6a8:(rank>=5?0xffd05a:rank>=3?[0xe8e2d0,0x8fa8c8,0xd8a040,0xd8e4f0][realm]:0x6b6b7a),metalness:rank>=3?.75:.3,roughness:.35});
  const pants=mat({color:statue?0xbdb6a8:[0x4a4a66,0x2a2a3a,0x6a2a1a,0x3a3a50][realm],roughness:.9});
  const body=new THREE.Group(); g.add(body); g.userData.body=body;
  body.add(box(1.3,1.5,.78,cloth,0,1.95,0));
  if(rank>=1) body.add(box(1.36,.55,.84,armor,0,2.4,0));              // 흉갑
  body.add(box(1.34,.22,.82,acc,0,1.3,0));                              // 허리띠
  const head=box(1.05,1.05,1.05,skin,0,3.3,0); body.add(head); g.userData.head=head;
  const hair=mat({color:[0xfff1c4,0xc98a3a,0x1a1a1a,0x5a3a1a][realm],roughness:1}); body.add(box(1.12,.4,1.12,hair,0,3.72,0)); body.add(box(1.12,.6,.3,hair,0,3.45,-.45));
  const eyeW=new THREE.MeshBasicMaterial({color:0xffffff}), eyeM=new THREE.MeshBasicMaterial({color:0x1b1430}); [-.22,.22].forEach(x=>{ body.add(box(.22,.26,.04,eyeW,x,3.36,.55)); body.add(box(.11,.16,.05,eyeM,x+.02,3.34,.56)); }); body.add(box(.26,.06,.04,new THREE.MeshBasicMaterial({color:0x8a4a3a}),0,3.08,.55));
  const mk=(w,h,d,m,x,y,z)=>{ const p=new THREE.Group(); p.position.set(x,y,z); p.add(box(w,h,d,m,0,-h/2,0)); return p; };
  const armL=mk(.46,1.3,.46,cloth,-.9,2.65,0), armR=mk(.46,1.3,.46,cloth,.9,2.65,0), legL=mk(.56,1.2,.56,pants,-.33,1.2,0), legR=mk(.56,1.2,.56,pants,.33,1.2,0);
  if(rank>=3){ armL.add(box(.62,.45,.62,armor,0,-.1,0)); armR.add(box(.62,.45,.62,armor,0,-.1,0)); } // 어깨 갑옷
  armL.add(box(.5,.3,.5,acc,0,-1.2,0)); armR.add(box(.5,.3,.5,acc,0,-1.2,0)); armL.add(box(.4,.3,.4,skin,0,-1.45,0)); armR.add(box(.4,.3,.4,skin,0,-1.45,0)); legL.add(box(.6,.35,.6,armor,0,-1.05,0)); legR.add(box(.6,.35,.6,armor,0,-1.05,0)); legL.add(box(.62,.25,.8,mat({color:0x3a2a1a}),0,-1.1,.08)); legR.add(box(.62,.25,.8,mat({color:0x3a2a1a}),0,-1.1,.08));
  body.add(box(.5,.5,.06,emblemMat(realm),0,2.05,.42)); [-.26,.26].forEach(x=>{ const br=box(.3,.06,.04,hair,x,3.56,.56); br.rotation.z=x>0?-.2:.2; body.add(br); }); [-.4,.4].forEach(x=>body.add(box(.16,.1,.03,new THREE.MeshBasicMaterial({color:0xff9aa0,transparent:true,opacity:.6}),x,3.15,.56)));
  body.add(armL,armR); g.add(legL,legR); Object.assign(g.userData,{armL,armR,legL,legR});
  if(realm===0){ const halo=new THREE.Mesh(new THREE.TorusGeometry(.62,.07,10,32),mat({color:0xffe27a,emissive:0xffd05a,emissiveIntensity:1,metalness:.5,roughness:.3})); halo.rotation.x=Math.PI/2; halo.position.y=4.15; body.add(halo); if(rank>=1){ const wm=mat({color:0xffffff,roughness:.9}); g.userData.wings=[]; [-1,1].forEach(s=>{ const wg=new THREE.Group(); wg.position.set(s*.6,2.4,-.5); wg.userData.s=s; for(let f=0;f<3;f++){ const w=box(.12,1.1+rank*.12+f*.2,.5,wm,s*(.15+f*.42),.1+f*.25,0); w.rotation.y=s*.5; w.rotation.z=s*(.3+f*.25); wg.add(w); } body.add(wg); g.userData.wings.push(wg); }); } }
  else if(realm===1){ body.add(box(1.16,.5,1.16,mat({color:0x7a8ea8,metalness:.7,roughness:.35}),0,3.78,0)); body.add(box(1.2,.3,.2,acc,0,3.6,.5)); [-1,1].forEach(s=>{ const h=cyl(.06,.2,.9,acc,s*.62,4.1,0); h.rotation.z=s*-.7; body.add(h); }); if(rank>=2){ const cg=new THREE.Group(); cg.position.set(0,2.75,-.42); const cape=box(1.5,2.3,.1,mat({color:rank>=5?0xffd05a:0x8a1f2a,roughness:.9}),0,-1.15,0); cg.add(cape); body.add(cg); g.userData.cape=cg; } body.add(box(.9,.35,.2,hair,0,2.9,.5)); }
  else if(realm===2){ body.add(box(.14,.24,.05,mat({color:0xff3d4a,emissive:0xff3d4a,emissiveIntensity:1}),0,3.6,.55)); const crown=cyl(.6,.5,.4,acc,0,4,0,8); body.add(crown); for(let j=0;j<5;j++){ const a=j/5*6.283; body.add(box(.12,.5,.12,acc,Math.cos(a)*.55,4.3,Math.sin(a)*.55)); } body.add(new THREE.Mesh(new THREE.TorusGeometry(.45,.06,8,20),acc)).position.set(0,1.4,0); if(rank>=3){ const a2=mk(.42,1.2,.42,cloth,-1.25,2.3,0); a2.rotation.z=.7; const a3=mk(.42,1.2,.42,cloth,1.25,2.3,0); a3.rotation.z=-.7; body.add(a2,a3); } }
  else { const l=new THREE.Mesh(new THREE.TorusGeometry(.62,.09,8,24),M.laurel); l.rotation.x=Math.PI/2; l.position.y=3.76; body.add(l); const toga=box(.55,1.55,.86,mat({color:0xffffff,roughness:.9}),-.42,1.95,.02); toga.rotation.z=.15; body.add(toga); body.add(box(.6,.2,.3,acc,-.42,2.72,.42)); if(rank>=2){ const bolt=box(.22,1.3,.22,mat({color:0xaee8ff,emissive:0x7fe0ff,emissiveIntensity:1}),1.3,2.3,0); bolt.rotation.z=.5; body.add(bolt); } }
  if(rank>=4&&!statue){ const aura=new THREE.Mesh(new THREE.RingGeometry(1.1,1.5,40),glowMat(R.c1,.7)); aura.rotation.x=-Math.PI/2; aura.position.y=.08; g.add(aura); g.userData.aura=aura; }
  if(rank>=6&&!statue){ const crown=new THREE.Mesh(new THREE.TorusGeometry(.9,.05,8,24),glowMat(R.c1,.9)); crown.position.y=4.6; g.userData.crown=crown; g.add(crown); }
  // 발 밑 그림자 원
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=.05; g.add(sh);
  shadowify(g); if(!statue&&typeof outlined==="function") outlined(g,1.06); return g;
}
function makeWeapon(realm,tier){ const g=new THREE.Group(); const col=[0xffd05a,0x9fd6ff,0xffb347,0xe0e8ff][realm]; const m=mat({color:col,metalness:.8,roughness:.25,emissive:tier>=2?col:0x000000,emissiveIntensity:tier>=3?.8:.35}); const dark=mat({color:0x3a3350,roughness:.8}); const blade=mat({color:0xe8ecf4,metalness:.9,roughness:.2});
  if(realm===0){ g.add(box(.14,1.6+tier*.3,.34,blade,0,1,0)); g.add(box(.6,.14,.14,m,0,.2,0)); g.add(cyl(.07,.07,.5,dark,0,-.15,0)); if(tier>=2) g.add(sph(.3,glowMat(0xfff2a0,.8),0,1.9+tier*.3,0)); }
  else if(realm===1){ g.add(cyl(.07,.07,1.3,dark,0,.6,0)); g.add(box(.9+tier*.15,.6,.45,m,0,1.3,0)); g.add(box(.5,.35,.5,dark,0,1.3,0)); if(tier>=2){ g.add(sph(.25,glowMat(0x9fe0ff,.9),.6+tier*.07,1.3,0)); } }
  else if(realm===2){ g.add(cyl(.06,.06,1.9,dark,0,.9,0)); for(let k=-1;k<=1;k++) g.add(box(.09,.65+Math.abs(k)*-.15,.12,blade,k*.24,2.05,0)); g.add(box(.6,.1,.14,m,0,1.72,0)); if(tier>=2) g.add(new THREE.Mesh(new THREE.TorusGeometry(.45,.06,8,24),m)).position.set(0,2.1,-.1); }
  else { g.add(cyl(.06,.06,1.9,dark,0,.9,0)); if(tier>=2){ for(let k=-1;k<=1;k++) g.add(box(.09,.55,.1,blade,k*.24,2,0)); g.add(box(.6,.1,.12,m,0,1.72,0)); } else g.add(box(.12,.7,.22,blade,0,1.95,0)); if(tier>=3) g.add(sph(.3,glowMat(0xffffff,.9),0,2.5,0)); }
  return shadowify(g); }

/* ---- 괴물 ---- */
function makeMob(shape,color,scale){ const g=new THREE.Group(); const m=mat({color,roughness:.85}); const dk=mat({color:new THREE.Color(color).multiplyScalar(.55),roughness:.9}); const eye=mat({color:0xff3d3d,emissive:0xff2020,emissiveIntensity:1.2});
  if(shape==="ghost"){ const b=sph(.9,mat({color,transparent:true,opacity:.85,roughness:.4}),0,1.9,0); b.scale.y*=1.2; g.add(b); for(let k=0;k<4;k++){ const t=new THREE.Mesh(GEO.cone,m); t.scale.set(.5,.8,.5); t.rotation.x=Math.PI; t.position.set(-.6+k*.4,.9,0); g.add(t);} g.userData.float=1; }
  else if(shape==="angel"){ g.add(box(1.1,1.5,.7,m,0,1.9,0)); g.add(box(.9,.9,.9,m,0,3.1,0)); g.add(box(1.14,.5,.74,dk,0,2.3,0)); [-1,1].forEach(s=>{ for(let f=0;f<2;f++){ const w=box(.12,1.6-f*.3,1.2,mat({color:0x2a2240}),s*(.9+f*.4),2.3+f*.2,-.45); w.rotation.y=s*.5; w.rotation.z=s*(.3+f*.3); g.add(w);} }); g.add(new THREE.Mesh(new THREE.TorusGeometry(.5,.05,8,20),mat({color:0x4a3a6a,emissive:0x6a3aa0,emissiveIntensity:.8}))).position.set(0,3.85,0); g.userData.float=.5; }
  else if(shape==="giant"){ g.add(box(2.2,2.6,1.4,m,0,2.2,0)); g.add(box(2.3,.9,1.5,dk,0,1.3,0)); g.add(box(1.4,1.3,1.3,m,0,4.3,0)); g.add(box(1.5,.5,1.4,dk,0,4.9,0)); g.add(box(.75,1.9,.75,m,-1.55,2.4,0)); g.add(box(.75,1.9,.75,m,1.55,2.4,0)); g.add(box(.9,.6,.9,dk,-1.55,1.3,0)); g.add(box(.9,.6,.9,dk,1.55,1.3,0)); g.add(box(.85,1.1,.85,dk,-.6,.55,0)); g.add(box(.85,1.1,.85,dk,.6,.55,0)); const club=cyl(.25,.45,2.4,M.wood,2.2,2.2,.6); club.rotation.z=.4; g.add(club); }
  else if(shape==="snake"){ for(let k=0;k<6;k++){ const r=1.15-k*.13; const s=sph(r/2,k%2?dk:m,0,.55,k*.85); s.scale.z*=1.3; g.add(s); } g.add(box(1,.7,1.2,m,0,.95,-.6)); g.add(box(.3,.08,.5,mat({color:0xff4060}),0,.75,-1.4)); }
  else if(shape==="wolf"){ g.add(box(2.2,1,1,m,0,1.1,0)); g.add(box(2,.5,1.05,dk,0,1.45,0)); g.add(box(.95,.85,.9,m,1.45,1.55,0)); g.add(box(.5,.4,.6,dk,2,1.35,0)); [-1,1].forEach(s=>{ const e=new THREE.Mesh(GEO.cone,m); e.scale.set(.3,.5,.3); e.position.set(1.5,2.15,s*.3); g.add(e);}); for(let k=0;k<4;k++) g.add(box(.32,.9,.32,dk,-.7+(k%2)*1.4,.45,(k<2?-1:1)*.35)); const tail=box(.25,.25,1.1,m,-1.4,1.4,0); tail.rotation.x=.4; g.add(tail); }
  else { g.add(box(1.3,1.5,.8,m,0,1.9,0)); g.add(box(1.34,.5,.84,dk,0,2.3,0)); g.add(box(1,1,1,m,0,3.1,0)); [-1,1].forEach(s=>{ const h=cyl(.05,.2,.9,mat({color:0x2a1a1a}),s*.45,3.95,0); h.rotation.z=s*-.45; g.add(h); }); g.add(box(.45,1.3,.45,m,-.9,1.9,0)); g.add(box(.45,1.3,.45,m,.9,1.9,0)); const tri=cyl(.05,.05,2.2,mat({color:0x2a1a1a}),1.2,2.2,.3); g.add(tri); for(let k=-1;k<=1;k++) g.add(box(.08,.5,.1,mat({color:0xaaaaaa,metalness:.8}),1.2+k*.2,3.4,.3)); }
  const ey=g.userData.float?2.1:(shape==="giant"?4.4:shape==="wolf"?1.6:shape==="snake"?1.0:3.2), ex=shape==="wolf"?1.93:0, ez=shape==="wolf"?0:(shape==="snake"?-1.2:(shape==="giant"?.66:.5));
  [-.2,.2].forEach(x=>{ const e=box(.18,.18,.06,eye,ex+(shape==="wolf"?0:x),ey,ez+(shape==="wolf"?x:0)); if(shape==="wolf") e.rotation.y=Math.PI/2; g.add(e); });
  const sh=new THREE.Mesh(new THREE.CircleGeometry(shape==="giant"?1.6:1,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=.05; g.add(sh);
  g.scale.set(scale,scale,scale); shadowify(g); if(typeof outlined==="function") outlined(g,1.06); return g; }

/* ================= 라벨 ================= */
const labelsEl=$("labels"); const _v=new THREE.Vector3();
function makeLabel(cls){ const d=document.createElement("div"); d.className="lbl "+(cls||""); labelsEl.appendChild(d); return d; }
function placeLabel(el,x,y,z,html){ _v.set(x,y,z).project(camera); if(_v.z>1||Math.abs(_v.x)>1.2||Math.abs(_v.y)>1.2){ el.style.display="none"; return; } el.style.display=""; const sx=(_v.x+1)/2*innerWidth, sy=(1-_v.y)/2*innerHeight; el.style.transform=`translate(${sx}px,${sy}px) translate(-50%,-100%)`; if(html!==undefined&&el._h!==html){ el._h=html; el.innerHTML=html; } }
function floatDmg(x,y,z,txt,cls){ const el=makeLabel("dmg "+(cls||"")); placeLabel(el,x,y,z,txt); setTimeout(()=>el.remove(),800); }

/* ================= 효과 ================= */
const FX=[];
function fxRing(x,z,color,size,dur){ const m=new THREE.Mesh(GEO.ring,glowMat(color,.9)); m.rotation.x=-Math.PI/2; m.position.set(x,.12,z); scene.add(m); FX.push({m,t:0,d:dur||.5,size:size||4,kind:"ring"}); }
function fxFlash(x,y,z,color,size,dur){ const m=new THREE.Mesh(GEO.sph,glowMat(color,.95)); m.position.set(x,y,z); scene.add(m); FX.push({m,t:0,d:dur||.3,size:size||2,kind:"flash"}); }
function fxBolt(x,z,color){ const m=cyl(.18,.6,34,glowMat(color,.95),x,17,z,8); scene.add(m); FX.push({m,t:0,d:.3,size:1,kind:"bolt"}); fxFlash(x,1,z,color,3,.3); fxSpark(x,1,z,color,24); }
function fxLine(x,z,rot,len,color){ const m=box(2.4,.5,len,glowMat(color,.8)); m.position.set(x+Math.sin(rot)*len/2,1.2,z+Math.cos(rot)*len/2); m.rotation.y=rot; scene.add(m); FX.push({m,t:0,d:.35,size:1,kind:"line"}); }
function fxArc(x,z,rot,color){ const m=new THREE.Mesh(new THREE.TorusGeometry(2.6,.18,6,24,Math.PI*.9),glowMat(color,.9)); m.rotation.x=-Math.PI/2; m.rotation.z=-rot-Math.PI*.05+Math.PI/2; m.position.set(x,1.6,z); m.userData.noOutline=true; scene.add(m); FX.push({m,t:0,d:.18,size:1,kind:"arc"}); }
function fxSpark(x,y,z,color,n){ const N=n||14; const geo=new THREE.BufferGeometry(); const p=new Float32Array(N*3); const v=[]; for(let i=0;i<N;i++){ p[i*3]=x; p[i*3+1]=y; p[i*3+2]=z; v.push(new THREE.Vector3(rnd(-1,1),rnd(.2,1.4),rnd(-1,1)).normalize().multiplyScalar(rnd(4,11))); } geo.setAttribute("position",new THREE.BufferAttribute(p,3)); const m=new THREE.Points(geo,new THREE.PointsMaterial({color,size:.45,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending})); scene.add(m); FX.push({m,t:0,d:.55,kind:"spark",v,p}); }
function tickFX(dt){ for(let i=FX.length-1;i>=0;i--){ const f=FX[i]; f.t+=dt; const k=f.t/f.d; if(k>=1){ scene.remove(f.m); f.m.material.dispose(); if(f.m.geometry&&f.kind==="spark") f.m.geometry.dispose(); FX.splice(i,1); continue; }
  if(f.kind==="ring"){ const s=.5+k*f.size; f.m.scale.set(s,s,s); f.m.material.opacity=.9*(1-k); } else if(f.kind==="flash"){ const s=f.size*(.6+k); f.m.scale.set(s,s,s); f.m.material.opacity=.95*(1-k); } else if(f.kind==="spark"){ for(let j=0;j<f.v.length;j++){ f.v[j].y-=18*dt; f.p[j*3]+=f.v[j].x*dt; f.p[j*3+1]+=f.v[j].y*dt; f.p[j*3+2]+=f.v[j].z*dt; } f.m.geometry.attributes.position.needsUpdate=true; f.m.material.opacity=1-k; } else if(f.kind==="arc"){ f.m.material.opacity=.9*(1-k); f.m.scale.setScalar(1+k*.5); } else f.m.material.opacity=.9*(1-k); } }
</script>
