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
let audioNap=null;   // v30 배터리: 4초 동안 소리가 없으면 소리 장치를 재움(안드로이드는 조용해도 소리 스레드가 계속 돎)
function audioWake(){ if(actx&&actx.state==="suspended") try{ actx.resume(); }catch(e){} clearTimeout(audioNap); audioNap=setTimeout(()=>{ try{ if(actx&&actx.state==="running") actx.suspend(); }catch(e){} },4000); }
function initAudio(){ if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } audioWake(); }
document.addEventListener("visibilitychange",()=>{ if(document.hidden&&actx) try{ actx.suspend(); }catch(e){} });
function tone(f,d,type,delay,vol){ if(!soundOn||!actx) return; audioWake(); const t=actx.currentTime+(delay||0),o=actx.createOscillator(),g=actx.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol||.15,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g).connect(actx.destination); o.start(t); o.stop(t+d+.03); }
function jingle(arr){ arr.forEach((f,k)=>tone(f,.14,"triangle",k*.08)); }
function thud(){ tone(110,.12,"square",0,.12); tone(70,.18,"sawtooth",.02,.08); }
function buzz(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms||30); }catch(e){} }
let toastT=0; function toast(msg,sub,dur){ const t=$("toast"); t.innerHTML=msg+(sub?`<small>${sub}</small>`:""); t.style.opacity=1; toastT=dur||1.8; }
function lockLand(){ try{ if(screen.orientation&&screen.orientation.lock) screen.orientation.lock("landscape").catch(()=>{}); }catch(e){} }
/* v19.3: 게임을 끄거나 홈으로 나가면 가로 고정을 풀고 전체 화면도 나감 → 폰이 가로로 남아 엉키지 않게.
   다시 돌아오면 첫 터치 때 다시 가로 고정(전체 화면이었으면 전체 화면도). */
const ORI={was:false,relock:false};
function unlockLand(){ try{ if(screen.orientation&&screen.orientation.unlock) screen.orientation.unlock(); }catch(e){} }
function releaseScreen(){ unlockLand(); try{ if(document.fullscreenElement){ ORI.was=true; (document.exitFullscreen||document.webkitExitFullscreen).call(document).catch(()=>{}); } }catch(e){} }
document.addEventListener("visibilitychange",()=>{ if(document.hidden){ releaseScreen(); ORI.relock=true; } });
addEventListener("pagehide",releaseScreen); addEventListener("beforeunload",releaseScreen);
addEventListener("pointerdown",()=>{ if(!ORI.relock||document.hidden) return; ORI.relock=false; if(typeof started!=="undefined"&&started){ if(ORI.was){ ORI.was=false; goFull(); } else lockLand(); } },true);
function goFull(){ try{ const el=document.documentElement; const f=el.requestFullscreen||el.webkitRequestFullscreen; if(f&&!document.fullscreenElement){ const p=f.call(el,{navigationUI:"hide"}); if(p&&p.then) p.then(lockLand,()=>{}); else lockLand(); } else lockLand(); }catch(e){} }

/* ================= 방(초대 링크) ================= */
const PASS="1004";            // 비밀번호 (v11~). 바꾸려면 여기만 고치면 됨
const ROOM="gods-7h3k9q";      // 내부 방 이름 — 저장·영토·중계 주제가 여기에 묶여 있으니 바꾸지 않음
const ACCESS=(function(){ const u=new URL(location.href); const k=u.searchParams.get("k");
  if(k===PASS) save("gw-ok","1");
  if(load("gw-room")===ROOM) save("gw-ok","1");   // 예전 초대 링크로 이미 들어와 있던 폰은 그대로 통과
  if(k!==null){ try{ u.searchParams.delete("k"); history.replaceState(null,"",u.pathname+u.search+u.hash); }catch(e){} }
  return load("gw-ok")==="1"; })();
function tryPass(v){ if(String(v).trim()===PASS){ save("gw-ok","1"); return true; } return false; }
function inviteLink(){ const u=new URL(location.href); u.search="?k="+PASS; u.hash=""; return u.toString(); }

/* ================= 저장 ================= */
const SAVEKEY="gw-save-"+ROOM;
function freshSave(){ return {v:1,name:"",realm:-1,lv:1,xp:0,gold:80,rank:0,eq:{w:0,a:0,r:-1},bag:[],pots:4,kills:0,war:0,capt:0,deaths:0,quests:[],qdone:0,bossKills:0,t:Date.now(),gfx:"high",id:Math.random().toString(36).slice(2,8)}; }
let G=(function(){ try{ const s=JSON.parse(load(SAVEKEY)||"null"); if(s&&s.v===1) return Object.assign(freshSave(),s); }catch(e){} return freshSave(); })();
function saveGame(){ G.t=Date.now(); save(SAVEKEY,JSON.stringify(G)); }
document.addEventListener("visibilitychange",()=>{ if(document.hidden) saveGame(); });
const RM=()=>REALMS[G.realm]||REALMS[0];

/* ================= 능력치 ================= */
function xpNeed(lv){ return Math.round(80*Math.pow(lv,1.9)); }   // v28 패치: 더 어렵게 (Lv10 약 1.9배, Lv30 약 2.3배)   // v17 패치: 예전 36·lv^1.45 → 레벨이 너무 빨리 올라서 약 3~4배 느리게
function lvGap(mlv){ const d=G.lv-mlv; return d<=5?1:Math.max(.1,1-(d-5)*.15); }   // 나보다 6레벨 넘게 낮은 괴물은 경험치 줄어듦
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
function gainXp(n){ if(hegemon()===G.realm) n=Math.round(n*1.15); if(G.blessUntil>Date.now()) n=Math.round(n*1.2); G.xp+=n; let up=false; const s0=G.xp>=xpNeed(G.lv)&&G.lv<60?stat():null; while(G.xp>=xpNeed(G.lv)&&G.lv<60){ G.xp-=xpNeed(G.lv); G.lv++; up=true; } if(up){ P.hp=stat().mhp; jingle([523,659,784,1046]); fxSpark(P.x,2,P.z,0xffe08a,40); try{ celebrateLevel(G.lv,s0); }catch(e){ console.warn(e); toast(`레벨 ${G.lv}!`,"체력과 공격력이 올랐어요",2.2); } } }
function itemName(s,t){ return RM().items[s][t]; }
function itemDesc(s,t){ return s==="w"?`공격 +${TIER.w[t]}`:s==="a"?`체력 +${TIER.a[t]} · 방어 +${(t+1)*5}`:`치명타 ${Math.round(TIER.r[t]*100)}%`; }

/* ================= 세계 상태(영토) ================= */
let W=(function(){ const o=REGIONS.map(r=>r.cap?r.realm:-1), ts=REGIONS.map(()=>0); let sim=null; try{ const s=JSON.parse(load("gw-world-"+ROOM)||"null"); if(s&&s.o&&s.o.length===REGIONS.length){ for(let i=0;i<REGIONS.length;i++){ if(!REGIONS[i].cap){ o[i]=s.o[i]; ts[i]=s.ts[i]||0; } } if(s.sim!=null) sim=s.sim; } }catch(e){} return {o,ts,sim}; })();
function saveWorld(){ save("gw-world-"+ROOM,JSON.stringify(W)); }
function mergeWorld(s){ if(!s||!s.o||!s.ts) return false; let ch=false; if(s.sim!=null&&(W.sim==null||s.sim>W.sim)) W.sim=s.sim; for(let i=0;i<REGIONS.length;i++){ if(REGIONS[i].cap) continue; if((s.ts[i]||0)>(W.ts[i]||0)){ W.o[i]=s.o[i]; W.ts[i]=s.ts[i]; ch=true; } } if(ch){ saveWorld(); paintTerritory(); } return ch; }
function regionAt(x,z){ let best=null,bd=1e9; for(const r of REGIONS){ const d=Math.hypot(x-r.x,z-r.z); if(d<r.r&&d<bd){ bd=d; best=r; } } return best; }
function inCapital(x,z){ const r=regionAt(x,z); return r&&r.cap?r:null; }

/* ================= 3D 장면 ================= */
const canvas=$("view");
const HIGH=()=>G.gfx!=="low";
const ECO=()=>G.eco!==false;
try{ if(ECO()) document.body.classList.add("eco"); }catch(e){}
/* v30 배터리: 배터리가 20% 이하이고 충전 중이 아니면 자동 초절약(초당 24장·해상도 더 낮게) */
const LOWBAT={on:false,told:false};
try{ navigator.getBattery&&navigator.getBattery().then(b=>{ const f=()=>{ const on=ECO()&&!b.charging&&b.level<=.2; if(on!==LOWBAT.on){ LOWBAT.on=on; try{ resize(); }catch(e){} if(on&&!LOWBAT.told&&typeof toast==="function"){ LOWBAT.told=true; toast("🔋 배터리가 얼마 없어요","초절약 모드로 바꿨어요 (충전하면 원래대로)",3); } } }; f(); b.addEventListener("levelchange",f); b.addEventListener("chargingchange",f); }).catch(()=>{}); }catch(e){}   // v19.2 배터리 절약(기본 켬): 초당 30장, 화면 해상도·그림자 낮춤, 가만히 있으면 20장
const renderer=new THREE.WebGLRenderer({canvas,antialias:!ECO(),powerPreference:ECO()?"low-power":"high-performance"});
/* v20.2 배터리 절약 강화: 화면 크기와 상관없이 그리는 점 개수를 약 90만 개로 제한(큰 탭은 원래 400만 개 넘게 그렸음) */
function ecoRatio(){ const dpr=devicePixelRatio||1; if(!ECO()) return Math.min(dpr,HIGH()?2:1.5); const px=Math.max(1,innerWidth*innerHeight); return clamp(Math.min(dpr,Math.sqrt((LOWBAT.on?380000:520000)/px),HIGH()?1.25:1.0),.55,2); }
renderer.setPixelRatio(ecoRatio());
renderer.shadowMap.enabled=HIGH()&&!ECO(); renderer.shadowMap.type=ECO()?THREE.PCFShadowMap:THREE.PCFSoftShadowMap; if(ECO()) renderer.shadowMap.autoUpdate=false;   // 절약 모드: 그림자는 3장에 한 번만 다시 계산
renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.95;
renderer.physicallyCorrectLights=false;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9fd4ff); scene.fog=new THREE.Fog(0xdcefff,55,165);
const camera=new THREE.PerspectiveCamera(55,1,.1,600);
/* 재질: 표준 PBR + 약간의 광택. 세계마다 색은 다르게 */
/* v32 배터리: 절약 모드는 픽셀마다 계산이 무거운 Standard(PBR) 재질 대신 Lambert 재질(약 2~3배 가벼움) */
function mat(o){ if(!ECO()) return new THREE.MeshStandardMaterial(Object.assign({roughness:.78,metalness:.05},o||{})); const p=Object.assign({},o||{}); delete p.roughness; delete p.metalness; return new THREE.MeshLambertMaterial(p); }
function lambertize(root){ if(!ECO()||!root) return root; root.traverse(o=>{ if(!o.isMesh||!o.material) return; const conv=m=>{ if(!m||!m.isMeshStandardMaterial) return m; if(m._lam) return m._lam; const L=new THREE.MeshLambertMaterial({color:m.color,map:m.map,emissive:m.emissive,emissiveIntensity:m.emissiveIntensity,emissiveMap:m.emissiveMap,transparent:m.transparent,opacity:m.opacity,side:m.side,alphaTest:m.alphaTest,vertexColors:m.vertexColors,skinning:!!m.skinning,morphTargets:!!m.morphTargets,morphNormals:!!m.morphNormals,depthWrite:m.depthWrite,depthTest:m.depthTest,blending:m.blending,fog:m.fog}); L.name=m.name; m._lam=L; return L; }; o.material=Array.isArray(o.material)?o.material.map(conv):conv(o.material); }); return root; }
function toon(o){ return mat(o); }
function glowMat(color,op){ return new THREE.MeshBasicMaterial({color,transparent:true,opacity:op==null?.9:op,depthWrite:false,blending:THREE.AdditiveBlending}); }
const hemi=new THREE.HemisphereLight(0xdff3ff,0x6b5a4a,.5); scene.add(hemi);
scene.add(new THREE.AmbientLight(0xffffff,.12));
const sun=new THREE.DirectionalLight(0xfff1d6,1.25); sun.position.set(40,80,30); sun.castShadow=HIGH()&&!ECO();   // v37 배터리: 절약 모드는 진짜 그림자 대신 발밑 동그란 그림자
if(HIGH()&&!ECO()){ sun.shadow.mapSize.set(ECO()?768:2048,ECO()?768:2048); const s=sun.shadow.camera; const R=ECO()?42:55; s.left=-R;s.right=R;s.top=R;s.bottom=-R;s.near=10;s.far=220; sun.shadow.bias=-.0006; sun.shadow.normalBias=.03; sun.shadow.radius=3; }
scene.add(sun); scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xb8d4ff,.3); fill.position.set(-30,40,-50); scene.add(fill);
function shadowify(o){ if(ECO()) return o; o.traverse(m=>{ if(m.isMesh){ m.castShadow=HIGH(); m.receiveShadow=HIGH(); } }); return o; }
const GEO={ box:new THREE.BoxGeometry(1,1,1), rbox:new THREE.BoxGeometry(1,1,1,2,2,2), sph:new THREE.SphereGeometry(.5,18,14), cyl:new THREE.CylinderGeometry(.5,.5,1,14), cone:new THREE.ConeGeometry(.5,1,12), ring:new THREE.RingGeometry(.8,1,48) };
function box(w,h,d,m,x,y,z){ const o=new THREE.Mesh(GEO.box,m); o.scale.set(w,h,d); o.position.set(x||0,y||0,z||0); return o; }
function cyl(rt,rb,h,m,x,y,z,seg){ const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),m); o.position.set(x||0,y||0,z||0); return o; }
function sph(r,m,x,y,z){ const o=new THREE.Mesh(GEO.sph,m); o.scale.setScalar(r*2); o.position.set(x||0,y||0,z||0); return o; }

/* ---- 하늘: 그라데이션 돔 + 태양 ---- */
const SKY={top:new THREE.Color(0x3d7fd6),bot:new THREE.Color(0xdcefff),tTop:new THREE.Color(0x3d7fd6),tBot:new THREE.Color(0xdcefff)};
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:SKY.top},bot:{value:SKY.bot},sunDir:{value:new THREE.Vector3(.4,.5,.3).normalize()},time:{value:0}},
  vertexShader:`varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`uniform vec3 top,bot,sunDir; uniform float time; varying vec3 vP; void main(){ float h=clamp(vP.y*1.6+.25,0.,1.); vec3 c=mix(bot,top,pow(h,.75)); float s=max(dot(vP,sunDir),0.); float ang=atan(vP.y-sunDir.y,vP.x-sunDir.x); float ray=.5+.5*sin(ang*9.+time*.3)*sin(ang*17.-time*.2); c+=vec3(1.,.95,.8)*pow(s,180.)*1.2+vec3(1.,.9,.7)*pow(s,8.)*.25+vec3(1.,.9,.7)*pow(s,3.)*ray*.12; gl_FragColor=vec4(c,1.); }`});
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
/* ---- 지형: 언덕·산·골짜기 (높이맵) ---- */
const NOISE=(function(){ const P=new Uint8Array(512); const p=[]; for(let i=0;i<256;i++) p[i]=i; for(let i=255;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [p[i],p[j]]=[p[j],p[i]]; } for(let i=0;i<512;i++) P[i]=p[i&255];
  const h=(x,z)=>P[(P[x&255]+z)&255]/255; const sm=t=>t*t*(3-2*t);
  function val(x,z){ const xi=Math.floor(x), zi=Math.floor(z), fx=sm(x-xi), fz=sm(z-zi); const a=h(xi,zi),b=h(xi+1,zi),c=h(xi,zi+1),d=h(xi+1,zi+1); return (a+(b-a)*fx)*(1-fz)+(c+(d-c)*fx)*fz; }
  return (x,z)=>val(x*.05,z*.05)*.55+val(x*.11+7,z*.11+3)*.3+val(x*.27+13,z*.27+5)*.15; })();
const smooth=(a,b,t)=>{ t=clamp((t-a)/(b-a),0,1); return t*t*(3-2*t); };
function flatMask(x,z){ let m=1; for(const rg of REGIONS){ const d=Math.hypot(x-rg.x,z-rg.z); m*=smooth(rg.r*.92,rg.r*1.35,d); } for(const rg of REGIONS){ if(!rg.cap) continue; const L=Math.hypot(rg.x,rg.z); const ux=rg.x/L, uz=rg.z/L; const t=clamp(x*ux+z*uz,0,L); const dd=Math.hypot(x-ux*t,z-uz*t); m*=smooth(4.5,10,dd); } return m; }
function hAt(x,z){ const e=Math.max(Math.abs(x),Math.abs(z)); const mtn=smooth(186,215,e); const n=NOISE(x,z); return (n-.45)*9*flatMask(x,z)*(1-mtn)+mtn*(26+n*22); }
const TERRAIN=(function(){ const S=WORLD_HALF*2+40, NT=6, segT=32, TS=S/NT; const grp=new THREE.Group(); grp.name="terrain";
  const realmCol=[new THREE.Color(0xa9d27f),new THREE.Color(0xe6eef6),new THREE.Color(0xd9b06c),new THREE.Color(0xb9d3a4)], rock=new THREE.Color(0x6b6c78), snow=new THREE.Color(0xf7f9ff), stone=new THREE.Color(0x66627a), road=new THREE.Color(0xcbbd9c), dark=new THREE.Color(0x2a2340);
  const c=new THREE.Color(), c2=new THREE.Color();
  function colAt(x,z,y){ const bx=smooth(-18,18,x), bz=smooth(-18,18,z); c.copy(realmCol[1]).lerp(realmCol[0],bx); c2.copy(realmCol[3]).lerp(realmCol[2],bx); c.lerp(c2,bz);
    const dc=Math.hypot(x,z); c.lerp(stone,1-smooth(REGIONS[12].r-6,REGIONS[12].r+8,dc));
    let rd=0; for(const rg of REGIONS){ if(!rg.cap) continue; const L=Math.hypot(rg.x,rg.z); const ux=rg.x/L, uz=rg.z/L; const t=clamp(x*ux+z*uz,0,L); rd=Math.max(rd,1-smooth(2.5,4.5,Math.hypot(x-ux*t,z-uz*t))); } c.lerp(road,rd*.85);
    const n=NOISE(x*3+50,z*3+50); c.multiplyScalar(.9+n*.22); c.lerp(rock,smooth(9,18,y)); c.lerp(snow,smooth(28,40,y)); if(Math.max(Math.abs(x),Math.abs(z))>WORLD_HALF+6) c.lerp(dark,.6); return c; }
  const detail=noiseTex("#bdbdbd",["#a8a8a8","#d2d2d2","#9c9c9c","#cccccc"],60); const tm=mat({vertexColors:true,map:detail,roughness:1}); const E=.6;
  for(let ti=0;ti<NT;ti++) for(let tj=0;tj<NT;tj++){ const cx=-S/2+TS*(ti+.5), cz=-S/2+TS*(tj+.5); const geo=new THREE.PlaneGeometry(TS,TS,segT,segT); geo.rotateX(-Math.PI/2); geo.translate(cx,0,cz);
    const pos=geo.attributes.position, col=new Float32Array(pos.count*3), nrm=new Float32Array(pos.count*3);
    for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i); const y=hAt(x,z); pos.setY(i,y); const cc=colAt(x,z,y); col[i*3]=cc.r; col[i*3+1]=cc.g; col[i*3+2]=cc.b;
      // 조각 경계에서도 이어지도록 법선은 높이 함수에서 직접 계산
      const nx=hAt(x-E,z)-hAt(x+E,z), nz=hAt(x,z-E)-hAt(x,z+E); const L=Math.hypot(nx,2*E,nz); nrm[i*3]=nx/L; nrm[i*3+1]=2*E/L; nrm[i*3+2]=nz/L; }
    geo.setAttribute("color",new THREE.BufferAttribute(col,3)); geo.setAttribute("normal",new THREE.BufferAttribute(nrm,3)); geo.computeBoundingSphere();
    const m=new THREE.Mesh(geo,tm); m.receiveShadow=HIGH(); m.userData.noOutline=true; grp.add(m); }
  scene.add(grp); return grp; })();
(function ground(){
  REALMS.forEach((R,i)=>{ for(let k=0;k<2;k++){ const rg=REGIONS[i*3+1+k]; const p=new THREE.Mesh(new THREE.CircleGeometry(rg.r*.6,40),mat({color:R.ground2,roughness:1,transparent:true,opacity:.45})); p.rotation.x=-Math.PI/2; p.position.set(rg.x,.04,rg.z); scene.add(p); }
    const cap=REGIONS[i*3]; const pl=new THREE.Mesh(new THREE.CircleGeometry(30,48),mat({color:[0xf3ead2,0x9aa7b5,0xd8a060,0xece8dc][i],roughness:.9})); pl.rotation.x=-Math.PI/2; pl.position.set(cap.x,.05,cap.z); pl.receiveShadow=HIGH(); scene.add(pl);
    const ring=new THREE.Mesh(new THREE.RingGeometry(30,32,48),mat({color:0xffffff,roughness:.6})); ring.rotation.x=-Math.PI/2; ring.position.set(cap.x,.06,cap.z); scene.add(ring); });
  const c2=new THREE.Mesh(new THREE.RingGeometry(20,23,48),glowMat(0xb08cff,.5)); c2.rotation.x=-Math.PI/2; c2.position.y=.08; scene.add(c2);
})();

/* ---- 소품: 세계마다 다른 장식 ---- */

/* ---- 물: 물결 + 반짝임 셰이더 ---- */
const TIME={value:0};
const WATER=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{time:{value:0},deep:{value:new THREE.Color(0x1660c8)},shallow:{value:new THREE.Color(0x4fd2ff)},sunDir:{value:new THREE.Vector3(.4,.6,.3)},skyTop:{value:new THREE.Color()},skyBot:{value:new THREE.Color()},day:{value:1},hq:{value:1}}]),
  vertexShader:`attribute float sq; varying vec3 vW; varying vec2 vUv; varying float vSq;
#include <fog_pars_vertex>
    void main(){ vUv=uv; vSq=sq; vec4 wp=modelMatrix*vec4(position,1.); vW=wp.xyz; vec4 mvPosition=viewMatrix*wp; gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
  fragmentShader:`uniform float time,day,hq; uniform vec3 deep,shallow,sunDir,skyTop,skyBot; varying vec3 vW; varying vec2 vUv; varying float vSq;
#include <fog_pars_fragment>
    float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y); }
    float wh(vec2 p){ return vn(p*.55+vec2(time*.25,time*.18))*.6+vn(p*1.3-vec2(time*.32,-time*.21))*.3+vn(p*3.1+vec2(-time*.5,time*.42))*.1*hq; }
    void main(){ vec2 p=vW.xz; float e=.04; float h0=wh(p); vec3 n=normalize(vec3((h0-wh(p+vec2(e,0.)))*1.6/e*.12,1.,(h0-wh(p+vec2(0.,e)))*1.6/e*.12));
      vec3 v=normalize(cameraPosition-vW); float fr=.12+.88*pow(1.-max(dot(n,v),0.),3.);
      vec3 base=mix(deep,shallow,.25+h0*.55)*(.35+.65*day);
      float cs=sin(p.x*2.1+sin(p.y*1.7+time*.9)*1.4+time*.6)*sin(p.y*2.3+sin(p.x*1.5-time*.8)*1.4-time*.5); base+=vec3(.55,.85,1.)*pow(1.-abs(cs),7.)*.16*day;
      vec3 r=reflect(-v,n); vec3 sk=mix(skyBot,skyTop,clamp(r.y*1.4,0.,1.)); vec3 c=mix(base,mix(base,sk,.6)*1.1,fr*.55);
      vec3 sd=normalize(sunDir); vec3 hh=normalize(sd+v); float sp=pow(max(dot(n,hh),0.),160.);
      float tw=step(.86-.06*hq,vn(p*7.+vec2(time*1.3,-time*.9))*vn(p*4.3-vec2(time*.7,time*1.1))*2.);
      c+=mix(vec3(.75,.82,1.)*.5,vec3(1.,.96,.85),day)*(sp*1.4+tw*.55*(.25+.75*pow(max(dot(n,hh),0.),6.)));
      vec2 q=vUv-.5; float ed=mix(length(q)*2.,max(abs(q.x)*2.,abs(q.y)*2.),vSq); float wob=vn(p*2.5+time*.4)*.06;
      float foam=smoothstep(.84,.97,ed+wob); float band=smoothstep(.75,1.,sin((ed*11.-time*1.1)*3.14159))*smoothstep(.62,.9,ed)*(1.-foam);
      c=mix(c,vec3(.92,.97,1.)*(.4+.6*day),clamp(foam*.85+band*.35,0.,1.));
      gl_FragColor=vec4(c,mix(.8,.95,max(foam,fr*.6)));
#include <fog_fragment>
}`});
WATER.uniforms.time=TIME; WATER.uniforms.skyTop.value=SKY.top; WATER.uniforms.skyBot.value=SKY.bot;
const TERR_RINGS={}, ALTARS={}; const PLACED=[];  // 건물·나무 배치 기록 {kind, realm, x, z, rot, obj}
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
/* 수도 도시: 집·시장·분수 */
const NPCS=[];
function house(i){ const g=new THREE.Group();
  if(i===0){ g.add(cyl(2.2,2.4,3,M.white,0,1.5,0,14)); const d=sph(2.3,M.gold,0,3.6,0); d.scale.y*=.7; g.add(d); g.add(box(.9,1.6,.2,mat({color:0x8a6a3a}),0,.8,2.3)); [-1,1].forEach(s=>g.add(box(.6,.6,.2,mat({color:0x9fd4ff,emissive:0xfff0b0,emissiveIntensity:.5}),s*1.2,1.8,2.1))); }
  else if(i===1){ g.add(box(5,2.6,4,M.wood,0,1.3,0)); const rf=new THREE.Mesh(new THREE.ConeGeometry(3.6,2.2,4),M.snow); rf.rotation.y=Math.PI/4; rf.scale.set(1.2,1,1); rf.position.y=3.6; g.add(rf); g.add(box(.9,1.5,.2,mat({color:0x3a2a1a}),0,.75,2.05)); g.add(cyl(.3,.3,1.6,M.rock,1.5,3.6,-.5)); g.add(sph(.5,glowMat(0xffa040,.6),1.5,4.5,-.5)); }
  else if(i===2){ const c=[0xe36b2a,0xd84a8a,0x3a8ad8,0x2fa06a][Math.floor(Math.random()*4)]; g.add(box(4,3,4,mat({color:c}),0,1.5,0)); const d=sph(1.6,M.tgold,0,3.6,0); d.scale.y*=.8; g.add(d); g.add(cyl(.15,.15,1.2,M.tgold,0,5.2,0)); g.add(box(1,1.8,.2,mat({color:0x5a2a1a}),0,.9,2.05)); [-1.2,1.2].forEach(x=>g.add(box(.7,.9,.2,mat({color:0xffe0a0,emissive:0xffd080,emissiveIntensity:.5}),x,1.9,2.05))); }
  else { g.add(box(4.4,2.8,3.6,M.marble,0,1.4,0)); const rf=new THREE.Mesh(new THREE.ConeGeometry(3.2,1.6,4),mat({color:0xb0523a})); rf.rotation.y=Math.PI/4; rf.scale.set(1.25,1,1); rf.position.y=3.6; g.add(rf); [-1.5,1.5].forEach(x=>g.add(cyl(.22,.26,2.6,M.marble,x,1.3,1.9,10))); g.add(box(.9,1.7,.2,mat({color:0x4a3a2a}),0,.85,1.85)); }
  return shadowify(g); }
function cityProps(i,cap){ const R=REALMS[i]; const inward=Math.atan2(-cap.z,-cap.x);
  for(let k=0;k<7;k++){ const a=inward+Math.PI+(k-3)*.42; const r=rnd(38,48); const x=cap.x+Math.cos(a)*r, z=cap.z+Math.sin(a)*r; const h=house(i); h.position.set(x,hAt(x,z),z); h.rotation.y=-a+Math.PI/2; scene.add(h); PLACED.push({kind:"house",realm:i,x,z,rot:-a+Math.PI/2,obj:h}); }
  for(let k=0;k<2;k++){ const a=inward+Math.PI+(k?1.6:-1.6); const x=cap.x+Math.cos(a)*44, z=cap.z+Math.sin(a)*44; PLACED.push({kind:"church",realm:i,x,z,rot:-a+Math.PI/2,obj:null}); }
  for(let k=0;k<6;k++){ const a=rnd(0,6.283); const r=rnd(34,40); const x=cap.x+Math.cos(a)*r, z=cap.z+Math.sin(a)*r; PLACED.push({kind:"prop",realm:i,x,z,rot:rnd(0,6.3),obj:null}); }
  for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4; PLACED.push({kind:"flag",realm:i,x:cap.x+Math.cos(a)*33,z:cap.z+Math.sin(a)*33,rot:0,obj:null}); }
  // 시장 노점
  for(let k=0;k<3;k++){ const a=inward+Math.PI/2+(k-1)*.5; const x=cap.x+Math.cos(a)*25, z=cap.z+Math.sin(a)*25; const g=new THREE.Group(); g.add(box(3,.9,1.6,M.wood,0,.45,0)); [-1.3,1.3].forEach(xx=>g.add(cyl(.08,.08,2.6,M.wood,xx,1.3,-.6))); const aw=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2),mat({color:k%2?0xff5a5f:R.c1,side:THREE.DoubleSide})); aw.rotation.x=-1.1; aw.position.set(0,2.5,-.2); g.add(aw); for(let j=0;j<4;j++) g.add(sph(.22,mat({color:[0xff5a5f,0xffcf4a,0x3fd27a,0xff9f3d][j]}),-1+j*.65,1.05,.2)); g.position.set(x,0,z); g.rotation.y=-a-Math.PI/2; scene.add(shadowify(g)); PLACED.push({kind:"market",realm:i,x,z,rot:-a-Math.PI/2,obj:g}); }
  // 분수
  const f=new THREE.Group(); f.add(cyl(4,4.3,.6,M.marble,0,.3,0,24)); const w=new THREE.Mesh(new THREE.CircleGeometry(3.6,28),WATER); w.rotation.x=-Math.PI/2; w.position.y=.62; f.add(w); f.add(cyl(.5,.7,2.2,M.marble,0,1.5,0,12)); f.add(cyl(1.4,1.2,.3,M.marble,0,2.6,0,20)); f.add(sph(.5,glowMat(R.c1,.8),0,3.3,0)); f.position.set(cap.x,0,cap.z); scene.add(shadowify(f));
  // 돌아다니는 신들(NPC)
  const list=[["예수","가브리엘","라파엘"],["토르","프레이야","헤임달"],["하누만","가네샤","아그니"],["아테나","아폴론","헤르메스"]][i];
  list.forEach((nm,k)=>{ const god=R.gods.find(x=>x.n===nm)||{p:80,d:""}; const mesh=makeAvatar(i,6,false,{hair:[1,2,3,4][(k+i)%4],cloth:[5,1,8,3][(k+i)%4]}); mesh.scale.setScalar(1.15); const a=inward+Math.PI/2+(k-1)*.7; const x=cap.x+Math.cos(a)*14, z=cap.z+Math.sin(a)*14; mesh.position.set(x,0,z); scene.add(mesh); NPCS.push({n:nm,p:god.p,d:god.d,mesh,x,z,tx:x,tz:z,cap,t:rnd(1,4),walk:0,lbl:null,say:0,sayT:rnd(10,30)}); }); }
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
const TREEPOS=[];   // v15 지도용: 나무·장식 자리
(function props(){
  REALMS.forEach((R,i)=>{ const sx=(i===0||i===2)?1:-1, sz=(i>=2)?1:-1;
    for(let k=0;k<70;k++){ const x=sx*rnd(10,WORLD_HALF-8), z=sz*rnd(10,WORLD_HALF-8); if(Math.hypot(x,z)<REGIONS[12].r+6) continue; const cap=REGIONS[i*3]; if(Math.hypot(x-cap.x,z-cap.z)<34) continue; let near=false; for(const rg of REGIONS){ if(Math.hypot(x-rg.x,z-rg.z)<10) near=true; } if(near) continue; { const isDeco=k%3===0; const o=isDeco?deco(x,z,R):tree(x,z,R); TREEPOS.push([x,z,isDeco?0:1,i]); o.position.y=hAt(x,z)-.15; scene.add(o); if(!isDeco||R.prop==="pine") PLACED.push({kind:isDeco?"rock":"tree",realm:i,x,z,rot:rnd(0,6.3),obj:o}); } }
    const cap=REGIONS[i*3]; { const bx=cap.x+(cap.x>0?14:-14), bz=cap.z+(cap.z>0?-14:14); const b=capitalBuilding(i,bx,bz); scene.add(b); PLACED.push({kind:"castle",realm:i,x:bx,z:bz,rot:Math.atan2(-cap.x,-cap.z),obj:b}); } cityProps(i,cap);
    // 수도 둘레 가로등/횃불
    for(let j=0;j<10;j++){ const a=j/10*6.283; const px=cap.x+Math.cos(a)*31, pz=cap.z+Math.sin(a)*31; const g=new THREE.Group(); g.add(cyl(.15,.2,4,M.dark,0,2,0,8)); g.add(sph(.4,glowMat(R.c1,.9),0,4.3,0)); g.position.set(px,0,pz); scene.add(g); } });
  // 빛 기둥(광선): 에덴 수도와 세계의 중심
  (function shafts(){ const cap=REGIONS[0]; for(let j=0;j<7;j++){ const a=j/7*6.283; const c=cyl(.6,3.5,60,glowMat(0xfff2c0,.16),cap.x+Math.cos(a)*22,30,cap.z+Math.sin(a)*22,8); c.rotation.z=Math.cos(a)*.15; c.rotation.x=Math.sin(a)*.15; c.userData.noOutline=true; scene.add(c); } for(let j=0;j<6;j++){ const a=j/6*6.283; const c=cyl(.5,2.5,50,glowMat(0xb08cff,.14),Math.cos(a)*26,28,Math.sin(a)*26,8); scene.add(c); } })();
  // 세계수
  (function(){ const g=new THREE.Group(); g.add(cyl(2.4,4,28,M.trunk,0,14,0,16)); for(let k=0;k<7;k++){ const a=k/7*6.283; const r=cyl(.6,1.2,10,M.trunk,Math.cos(a)*4.5,2.5,Math.sin(a)*4.5,8); r.rotation.z=Math.cos(a)*1; r.rotation.x=Math.sin(a)*1; g.add(r); const br=cyl(.5,.9,12,M.trunk,Math.cos(a)*6,26,Math.sin(a)*6,8); br.rotation.z=-Math.cos(a)*.9; br.rotation.x=Math.sin(a)*.9; g.add(br); g.add(sph(6,M.leaf,Math.cos(a)*11,31,Math.sin(a)*11)); } g.add(sph(12,M.leaf,0,34,0)); for(let k=0;k<30;k++){ g.add(sph(.35,glowMat(0xc8ffd8,.9),rnd(-14,14),rnd(24,42),rnd(-14,14))); } scene.add(shadowify(g)); })();
  for(let k=0;k<14;k++){ const a=k/14*6.283, r=rnd(30,58); const s=new THREE.Mesh(GEO.box,M.dark); s.scale.set(rnd(2,4),rnd(3,9),rnd(2,4)); s.position.set(Math.cos(a)*r,2+hAt(Math.cos(a)*r,Math.sin(a)*r),Math.sin(a)*r); s.rotation.y=a; s.rotation.z=rnd(-.15,.15); scene.add(shadowify(s)); const rune=sph(.3,glowMat(0xb08cff,.9),s.position.x,s.scale.y+2.5,s.position.z); scene.add(rune); }
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
      else { const wg=new THREE.PlaneGeometry(16,7); wg.setAttribute('sq',new THREE.BufferAttribute(new Float32Array(wg.attributes.position.count).fill(1),1)); const w=new THREE.Mesh(wg,WATER); w.rotation.x=-Math.PI/2; w.position.y=.06; sh.add(w); sh.add(cyl(.7,.8,6,M.dark,-6,3,-4.5)); sh.add(cyl(.7,.8,6,M.dark,6,3,-4.5)); sh.add(box(13.5,1.2,1.4,M.dark,0,6.2,-4.5)); sh.add(box(5,1.6,2,M.wood,0,.5,1)); sh.add(sph(.6,glowMat(0x9fe0ff,.8),0,7.2,-4.5)); }
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
function tickParticles(dt,cx,cz,realmIdx){ const a=PART.pos; const R=REALMS[realmIdx]||REALMS[0]; let mode=R.prop; const wt=(typeof WEATHER!=="undefined")?WEATHER.type:"clear"; if(wt==="rain"||wt==="storm") mode="rain"; else if(wt==="blizzard") mode="blizzard"; else if(wt==="wind") mode="wind"; else if(wt==="gold") mode="gold";
  PART.m.color.set(mode==="rain"?0x9fd4ff:mode==="wind"?0xe0c080:mode==="gold"?0xffe08a:mode==="pine"||mode==="blizzard"?0xffffff:mode==="temple"?0xffb0c8:mode==="column"?0xcfe8ff:0xffe9a0); PART.m.size=mode==="rain"?.5:mode==="blizzard"?1.1:mode==="pine"?.9:1.2; PART.m.opacity=mode==="rain"?.6:.85;
  for(let i=0;i<PART.N;i++){ const j=i*3; if(mode==="rain"){ a[j+1]-=dt*28; a[j]+=dt*2; } else if(mode==="blizzard"){ a[j+1]-=dt*9; a[j]+=dt*14+Math.sin(performance.now()/300+i)*dt*3; } else if(mode==="wind"){ a[j+1]+=Math.sin(performance.now()/500+i)*dt*2; a[j]+=dt*18; } else if(mode==="gold"){ a[j+1]-=dt*4; a[j]+=Math.sin(performance.now()/700+i)*dt; } else if(mode==="pine"){ a[j+1]-=dt*3.5; a[j]+=Math.sin(performance.now()/900+i)*dt*.8; } else if(mode==="temple"){ a[j+1]-=dt*1.6; a[j]+=dt*1.2; } else { a[j+1]+=dt*(mode==="column"?2:1); a[j]+=Math.sin(performance.now()/700+i)*dt*.5; }
    if(a[j+1]<0) a[j+1]=30; if(a[j+1]>32) a[j+1]=0; if(a[j]-cx>60) a[j]-=120; if(a[j]-cx<-60) a[j]+=120; if(a[j+2]-cz>60) a[j+2]-=120; if(a[j+2]-cz<-60) a[j+2]+=120; }
  PART.geo.attributes.position.needsUpdate=true; }

/* ---- 캐릭터(블록 아바타): 세계·계급에 따라 장비가 화려해짐 ---- */
function capsule(r,h,m,x,y,z){ const g=new THREE.Group(); const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,Math.max(.01,h-r*2),14,1),m); g.add(c); const t=sph(r,m,0,(h-r*2)/2,0), b=sph(r,m,0,-(h-r*2)/2,0); g.add(t,b); g.position.set(x||0,y||0,z||0); return g; }
function makeAvatar(realm,rank,statue,look){ look=look||{};
  const R=REALMS[realm]||REALMS[0]; const g=new THREE.Group();
  const skin=mat({color:statue?0xd9d4c8:[0xffdcc0,0xf3cfb0,0xd29a6e,0xf0c6a8][realm],roughness:.75});
  const clothC=[[0xf7f2e6,0xffffff,0xfff3c4],[0x3b5a8a,0x2b3f66,0x5a7fb0],[0xff8a2a,0xd84a2a,0xffb347],[0xf2eee3,0xffffff,0xe8dcc0]][realm];
  const cloth=mat({color:statue?0xcfcabd:(typeof LOOKS.cloth[look.cloth]==="number"?LOOKS.cloth[look.cloth]:clothC[Math.min(2,Math.floor(rank/3))]),roughness:.8});
  const accC=[0xffd05a,0x9fd6ff,0xffd05a,0x7fe0ff][realm]; const acc=mat({color:statue?0xbdb6a8:accC,metalness:.7,roughness:.3});
  const armor=mat({color:statue?0xbdb6a8:(rank>=5?0xffd05a:rank>=3?[0xe8e2d0,0x8fa8c8,0xd8a040,0xd8e4f0][realm]:0x6b6b7a),metalness:rank>=3?.75:.3,roughness:.35});
  const pants=mat({color:statue?0xbdb6a8:[0x4a4a66,0x2a2a3a,0x6a2a1a,0x3a3a50][realm],roughness:.9});
  const hair=mat({color:statue?0xbdb6a8:(typeof LOOKS.hair[look.hair]==="number"?LOOKS.hair[look.hair]:[0xfff1c4,0xc98a3a,0x1a1a1a,0x5a3a1a][realm]),roughness:.9});
  const body=new THREE.Group(); g.add(body); g.userData.body=body;
  // 몸통: 허리에서 어깨로 넓어지는 곡선
  const torso=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.45,0),new THREE.Vector2(.52,.3),new THREE.Vector2(.6,.8),new THREE.Vector2(.68,1.25),new THREE.Vector2(.6,1.5),new THREE.Vector2(.25,1.6)],18),cloth); torso.position.y=1.2; body.add(torso);
  if(rank>=1){ const plate=new THREE.Mesh(new THREE.SphereGeometry(.66,18,12,0,Math.PI,0,Math.PI*.55),armor); plate.rotation.x=-.3; plate.position.set(0,2.3,0); plate.scale.set(1,.9,.8); body.add(plate); }
  body.add(new THREE.Mesh(new THREE.TorusGeometry(.5,.07,8,24),acc)).position.set(0,1.45,0);
  body.add(box(.5,.5,.06,emblemMat(realm),0,2.05,.6));
  // 머리: 둥근 얼굴 + 큰 눈
  const head=sph(.66,skin,0,3.25,0); head.scale.y*=.95; body.add(head); g.userData.head=head;
  const eyeW=new THREE.MeshBasicMaterial({color:0xffffff}), iris=new THREE.MeshBasicMaterial({color:(typeof LOOKS.eye[look.eye]==="number"?LOOKS.eye[look.eye]:[0x3a7bd5,0x2f8f8f,0x4a2a1a,0x3a8a5a][realm])}), pupil=new THREE.MeshBasicMaterial({color:0x101020}), hl=new THREE.MeshBasicMaterial({color:0xffffff});
  [-.24,.24].forEach(x=>{ const e=sph(.15,eyeW,x,3.3,.56); e.scale.multiply(new THREE.Vector3(1,1.25,.5)); body.add(e); const ir=sph(.09,iris,x+(x>0?-.01:.01),3.29,.66); ir.scale.multiply(new THREE.Vector3(1,1.25,.4)); body.add(ir); const pu=sph(.045,pupil,x,3.28,.7); body.add(pu); body.add(sph(.03,hl,x+.04,3.35,.72)); const br=box(.26,.05,.04,hair,x,3.55,.6); br.rotation.z=x>0?-.2:.2; body.add(br); });
  body.add(box(.22,.04,.03,new THREE.MeshBasicMaterial({color:0xc0604a}),0,3.02,.64)); [-.4,.4].forEach(x=>body.add(sph(.09,new THREE.MeshBasicMaterial({color:0xff9aa0,transparent:true,opacity:.55}),x,3.12,.52)));
  // 머리카락: 세계별 스타일
  const hc=new THREE.Mesh(new THREE.SphereGeometry(.71,18,12,0,Math.PI*2,0,Math.PI*.5),hair); hc.position.set(0,3.28,-.04); hc.rotation.x=-.25; body.add(hc); const back=new THREE.Mesh(new THREE.SphereGeometry(.7,18,12,0,Math.PI,0,Math.PI*.85),hair); back.position.set(0,3.22,-.08); back.rotation.y=Math.PI; body.add(back);
  if(realm===0){ for(let k=0;k<5;k++){ const st=capsule(.12,.9,hair,-.5+k*.25,3.1,-.45); st.rotation.x=.6; body.add(st); } }
  else if(realm===1){ const helm=new THREE.Mesh(new THREE.SphereGeometry(.74,18,12,0,Math.PI*2,0,Math.PI*.55),mat({color:0x7a8ea8,metalness:.7,roughness:.35})); helm.position.y=3.48; body.add(helm); body.add(new THREE.Mesh(new THREE.TorusGeometry(.72,.05,8,24),acc)).position.set(0,3.5,0); [-1,1].forEach(sg=>{ const h=cyl(.05,.2,.9,acc,sg*.68,3.75,0); h.rotation.z=sg*-.75; body.add(h); }); const braid=capsule(.12,1.2,hair,0,2.6,-.6); body.add(braid); }
  else if(realm===2){ const crown=cyl(.62,.5,.4,acc,0,3.95,0,8); body.add(crown); for(let j=0;j<5;j++){ const a=j/5*6.283; body.add(box(.1,.45,.1,acc,Math.cos(a)*.55,4.25,Math.sin(a)*.55)); } body.add(sph(.12,glowMat(0xff3d4a,.9),0,3.55,.62)); const bun=sph(.3,hair,0,3.95,-.3); body.add(bun); }
  else { const l=new THREE.Mesh(new THREE.TorusGeometry(.68,.08,8,24),M.laurel); l.rotation.x=Math.PI/2; l.rotation.z=.1; l.position.y=3.72; body.add(l); for(let k=0;k<6;k++){ const c=sph(.22,hair,Math.cos(k)*.5,3.75,Math.sin(k)*.4); body.add(c); } }
  // 팔·다리: 캡슐
  const mk=(r,h,m,x,y,z)=>{ const p=new THREE.Group(); p.position.set(x,y,z); const c=capsule(r,h,m,0,-h/2,0); p.add(c); return p; };
  const armL=mk(.2,1.2,cloth,-.82,2.55,0), armR=mk(.2,1.2,cloth,.82,2.55,0), legL=mk(.24,1.2,pants,-.3,1.25,0), legR=mk(.24,1.2,pants,.3,1.25,0);
  [armL,armR].forEach(a=>{ a.add(sph(.2,skin,0,-1.2,0)); a.add(sph(rank>=3?.34:.27,rank>=3?armor:cloth,0,-.05,0)); });
  [legL,legR].forEach(l=>{ const bt=capsule(.26,.55,mat({color:0x3a2a1a,roughness:.9}),0,-1.05,.08); l.add(bt); if(rank>=3) l.add(sph(.3,armor,0,-.55,0)); });
  body.add(armL,armR); g.add(legL,legR); Object.assign(g.userData,{armL,armR,legL,legR});
  // 세계별 장식
  if(realm===0){ const halo=new THREE.Mesh(new THREE.TorusGeometry(.6,.06,10,32),mat({color:0xffe27a,emissive:0xffd05a,emissiveIntensity:1.2,metalness:.5,roughness:.3})); halo.rotation.x=Math.PI/2; halo.position.y=4.2; body.add(halo);
    if(rank>=1){ const wm=mat({color:0xffffff,roughness:.9}); g.userData.wings=[]; [-1,1].forEach(sg=>{ const wg=new THREE.Group(); wg.position.set(sg*.45,2.5,-.45); wg.userData.s=sg; for(let f=0;f<4;f++){ const fe=sph(.16,wm,sg*(.35+f*.38),.25+f*.22-(f>2?.2:0),-.1); fe.scale.multiply(new THREE.Vector3(1.1,2.6+f*.35+rank*.12,.5)); fe.rotation.z=sg*(.45+f*.22); wg.add(fe); } body.add(wg); g.userData.wings.push(wg); }); } }
  else if(realm===1){ if(rank>=2){ const cg=new THREE.Group(); cg.position.set(0,2.75,-.5); const cape=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.3,4,6),mat({color:rank>=5?0xffd05a:0x8a1f2a,roughness:.9,side:THREE.DoubleSide})); cape.position.y=-1.15; cape.userData.noOutline=true; cg.add(cape); body.add(cg); g.userData.cape=cg; } body.add(capsule(.12,.7,hair,.12,2.85,.55)); }
  else if(realm===2){ if(rank>=3){ const a2=mk(.18,1.1,cloth,-1.05,2.35,0); a2.rotation.z=.8; const a3=mk(.18,1.1,cloth,1.05,2.35,0); a3.rotation.z=-.8; body.add(a2,a3); } }
  else { const toga=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.3,0),new THREE.Vector2(.72,.1),new THREE.Vector2(.7,1.0)],14,0,Math.PI*1.2),mat({color:0xffffff,roughness:.9,side:THREE.DoubleSide})); toga.position.set(0,1.6,0); toga.rotation.y=.9; body.add(toga); body.add(sph(.13,acc,.45,2.6,.4)); if(rank>=2){ const bolt=box(.2,1.3,.2,mat({color:0xaee8ff,emissive:0x7fe0ff,emissiveIntensity:1}),1.2,2.3,0); bolt.rotation.z=.5; body.add(bolt); } }
  if(rank>=4&&!statue){ const aura=new THREE.Mesh(new THREE.RingGeometry(1.1,1.5,40),glowMat(R.c1,.7)); aura.rotation.x=-Math.PI/2; aura.position.y=.08; g.add(aura); g.userData.aura=aura; }
  if(rank>=6&&!statue){ const crown=new THREE.Mesh(new THREE.TorusGeometry(.9,.05,8,24),glowMat(R.c1,.9)); crown.position.y=4.6; g.userData.crown=crown; g.add(crown); }
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=.05; g.add(sh);
  shadowify(g); if(!statue&&typeof outlined==="function") outlined(g,1.05); return g;
}
function makeWeapon(realm,tier){ const g=new THREE.Group(); const col=[0xffd05a,0x9fd6ff,0xffb347,0xe0e8ff][realm]; const m=mat({color:col,metalness:.8,roughness:.25,emissive:tier>=2?col:0x000000,emissiveIntensity:tier>=3?.8:.35}); const dark=mat({color:0x3a3350,roughness:.8}); const blade=mat({color:0xe8ecf4,metalness:.9,roughness:.2});
  if(realm===0){ g.add(box(.14,1.6+tier*.3,.34,blade,0,1,0)); g.add(box(.6,.14,.14,m,0,.2,0)); g.add(cyl(.07,.07,.5,dark,0,-.15,0)); if(tier>=2) g.add(sph(.3,glowMat(0xfff2a0,.8),0,1.9+tier*.3,0)); }
  else if(realm===1){ g.add(cyl(.07,.07,1.3,dark,0,.6,0)); g.add(box(.9+tier*.15,.6,.45,m,0,1.3,0)); g.add(box(.5,.35,.5,dark,0,1.3,0)); if(tier>=2){ g.add(sph(.25,glowMat(0x9fe0ff,.9),.6+tier*.07,1.3,0)); } }
  else if(realm===2){ g.add(cyl(.06,.06,1.9,dark,0,.9,0)); for(let k=-1;k<=1;k++) g.add(box(.09,.65+Math.abs(k)*-.15,.12,blade,k*.24,2.05,0)); g.add(box(.6,.1,.14,m,0,1.72,0)); if(tier>=2) g.add(new THREE.Mesh(new THREE.TorusGeometry(.45,.06,8,24),m)).position.set(0,2.1,-.1); }
  else { g.add(cyl(.06,.06,1.9,dark,0,.9,0)); if(tier>=2){ for(let k=-1;k<=1;k++) g.add(box(.09,.55,.1,blade,k*.24,2,0)); g.add(box(.6,.1,.12,m,0,1.72,0)); } else g.add(box(.12,.7,.22,blade,0,1.95,0)); if(tier>=3) g.add(sph(.3,glowMat(0xffffff,.9),0,2.5,0)); }
  return shadowify(g); }

/* ---- 괴물 ---- */
function makeMob(shape,color,scale){ const g=new THREE.Group(); const m=mat({color,roughness:.85}); const dk=mat({color:new THREE.Color(color).multiplyScalar(.55),roughness:.9}); const lt=mat({color:new THREE.Color(color).lerp(new THREE.Color(0xffffff),.35),roughness:.8}); const eye=mat({color:0xff3d3d,emissive:0xff2020,emissiveIntensity:1.2}); const bone=mat({color:0xe8e2d0,roughness:.9}); const metal=mat({color:0xaab0bb,metalness:.8,roughness:.3});
  const eyes=(y,z,dx,r)=>{ [-dx,dx].forEach(x=>g.add(sph(r||.1,eye,x,y,z))); };
  const horns=(y,z,len,col)=>{ [-1,1].forEach(sg=>{ const h=cyl(.05,.18,len,col||dk,sg*.4,y,z); h.rotation.z=sg*-.5; g.add(h); }); };
  const wings=(y,z,span,col,feather)=>{ [-1,1].forEach(sg=>{ const w=new THREE.Group(); w.position.set(sg*.5,y,z); for(let f=0;f<(feather?4:2);f++){ const fe=sph(.16,col,sg*(.35+f*.4),.2+f*.15,0); fe.scale.multiply(new THREE.Vector3(1,span+f*.3,.45)); fe.rotation.z=sg*(.4+f*.22); w.add(fe); } g.add(w); }); };
  let H=3.4, shadowR=1;
  if(shape==="ghost"){ const b=sph(.9,mat({color,transparent:true,opacity:.85,roughness:.4}),0,1.9,0); b.scale.y*=1.2; g.add(b); for(let k=0;k<4;k++){ const t=new THREE.Mesh(GEO.cone,m); t.scale.set(.5,.8,.5); t.rotation.x=Math.PI; t.position.set(-.6+k*.4,.9,0); g.add(t);} g.userData.float=1; eyes(2.1,.75,.25,.12); H=3.4; }
  else if(shape==="vetala"){ const b=sph(.75,m,0,2.2,0); g.add(b); wings(2.4,0,2.2,dk,false); g.add(capsule(.12,.9,dk,-.3,1.3,0)); g.add(capsule(.12,.9,dk,.3,1.3,0)); [-1,1].forEach(sg=>{ const e=new THREE.Mesh(GEO.cone,dk); e.scale.set(.3,.6,.3); e.position.set(sg*.5,3,0); g.add(e); }); eyes(2.3,.62,.25,.12); g.userData.float=1; H=3.6; }
  else if(shape==="angel"||shape==="darkangel"){ const dark=shape==="darkangel"; g.add(capsule(.55,1.7,m,0,1.9,0)); g.add(sph(.5,lt,0,3.1,0)); g.add(new THREE.Mesh(new THREE.TorusGeometry(.5,.1,8,20),dk)).position.set(0,2.3,0); wings(2.5,-.45,dark?3.4:2.6,mat({color:dark?0x1a1020:0x2a2240,roughness:.9}),true); g.add(new THREE.Mesh(new THREE.TorusGeometry(.5,.05,8,20),mat({color:dark?0x6a2aa0:0x4a3a6a,emissive:dark?0x8a2aff:0x6a3aa0,emissiveIntensity:1}))).position.set(0,3.85,0); if(dark){ horns(3.5,0,.8,mat({color:0x0a0a0a})); const sw=box(.12,2.2,.3,metal,.95,1.6,.3); g.add(sw); } eyes(3.15,.45,.18,.09); g.userData.float=.5; H=4.3; }
  else if(shape==="nephilim"){ const t=sph(1.2,m,0,2.5,0); t.scale.multiply(new THREE.Vector3(1,1.2,.8)); g.add(t); g.add(sph(.75,lt,0,4.4,0)); wings(3.2,-.8,3.6,mat({color:0xe8e0d0,roughness:.9}),true); const aL=capsule(.36,2,m,-1.5,2.5,0), aR=capsule(.36,2,m,1.5,2.5,0); aL.rotation.z=.2; aR.rotation.z=-.2; g.add(aL,aR); g.add(capsule(.42,1.3,dk,-.55,.65,0)); g.add(capsule(.42,1.3,dk,.55,.65,0)); g.add(new THREE.Mesh(new THREE.TorusGeometry(.7,.06,8,20),M.gold)).position.set(0,5.2,0); eyes(4.5,.62,.25,.1); H=5.8; shadowR=1.6; }
  else if(shape==="fireserpent"){ for(let k=0;k<7;k++){ const r=1.1-k*.11; const sg=sph(r/2,k%2?dk:m,0,.5+Math.sin(k)*.15,k*.8); sg.scale.z*=1.3; g.add(sg); if(k<5){ const fl=new THREE.Mesh(GEO.cone,glowMat(0xffa030,.9)); fl.scale.set(.35,.9,.35); fl.position.set(0,1.1+Math.sin(k)*.15,k*.8); g.add(fl); } } g.add(sph(.6,m,0,1,-.5)); g.add(box(.3,.08,.6,glowMat(0xff4060,1),0,.8,-1.2)); eyes(1.15,-.9,.25,.1); H=2.4; }
  else if(shape==="giant"||shape==="icegiant"){ const t=sph(1.3,m,0,2.4,0); t.scale.multiply(new THREE.Vector3(1,1.15,.75)); g.add(t); g.add(new THREE.Mesh(new THREE.TorusGeometry(1.1,.18,8,20),dk)).position.set(0,1.5,0); g.add(sph(.8,lt,0,4.3,0)); g.add(new THREE.Mesh(new THREE.SphereGeometry(.85,14,10,0,6.3,0,1.5),dk)).position.set(0,4.4,0); const aL=capsule(.38,2,m,-1.6,2.4,0), aR=capsule(.38,2,m,1.6,2.4,0); aL.rotation.z=.2; aR.rotation.z=-.2; g.add(aL,aR); g.add(sph(.5,dk,-1.75,1.35,0)); g.add(sph(.5,dk,1.75,1.35,0)); g.add(capsule(.45,1.2,dk,-.6,.6,0)); g.add(capsule(.45,1.2,dk,.6,.6,0));
    if(shape==="icegiant"){ for(let k=0;k<5;k++){ const ic=new THREE.Mesh(GEO.cone,M.ice); ic.scale.set(.5,rnd(1,2),.5); ic.position.set(rnd(-.8,.8),3.2+rnd(0,1),rnd(-.6,.2)); ic.rotation.z=rnd(-.5,.5); g.add(ic); } const beard=sph(.5,M.snow,0,3.9,.55); beard.scale.y*=1.4; g.add(beard); } else { const club=cyl(.25,.45,2.4,M.wood,2.2,2.2,.6); club.rotation.z=.4; g.add(club); }
    eyes(4.45,.66,.25,.11); H=5.6; shadowR=1.6; }
  else if(shape==="troll"){ const t=sph(1.4,m,0,1.9,0); t.scale.multiply(new THREE.Vector3(1.1,.9,.9)); g.add(t); g.add(sph(.9,lt,0,3.4,.3)); g.add(sph(.35,dk,0,3.3,1.1)); [-1,1].forEach(sg=>{ const e=new THREE.Mesh(GEO.cone,m); e.scale.set(.35,.7,.35); e.rotation.z=sg*-.9; e.position.set(sg*.95,3.7,.2); g.add(e); }); const aL=capsule(.45,2.4,m,-1.6,1.8,0), aR=capsule(.45,2.4,m,1.6,1.8,0); aL.rotation.z=.35; aR.rotation.z=-.35; g.add(aL,aR); g.add(capsule(.5,1.1,dk,-.6,.55,0)); g.add(capsule(.5,1.1,dk,.6,.55,0)); for(let k=0;k<3;k++) g.add(sph(.2,M.rock,rnd(-.8,.8),2.6+rnd(0,.6),-.9)); eyes(3.55,1.05,.3,.1); H=4.6; shadowR=1.5; }
  else if(shape==="draugr"){ g.add(capsule(.42,1.5,bone,0,1.9,0)); for(let k=0;k<4;k++) g.add(new THREE.Mesh(new THREE.TorusGeometry(.45,.05,6,16),bone)).position.set(0,1.5+k*.25,0); g.add(sph(.48,bone,0,3.05,0)); g.add(box(.5,.25,.3,mat({color:0x111111}),0,2.95,.4)); const helm=new THREE.Mesh(new THREE.SphereGeometry(.52,14,10,0,6.3,0,1.4),metal); helm.position.y=3.15; g.add(helm); horns(3.4,0,.7,bone); g.add(capsule(.14,1.2,bone,-.7,2.4,0)); g.add(capsule(.14,1.2,bone,.7,2.4,0)); g.add(capsule(.16,1.1,bone,-.28,.6,0)); g.add(capsule(.16,1.1,bone,.28,.6,0)); const sw=box(.1,1.8,.25,metal,.75,1.9,.4); sw.rotation.x=-.4; g.add(sw); eyes(3.1,.42,.17,.08); H=4.1; }
  else if(shape==="snake"){ for(let k=0;k<6;k++){ const r=1.15-k*.13; const sg=sph(r/2,k%2?dk:m,0,.55,k*.85); sg.scale.z*=1.3; g.add(sg); } g.add(box(1,.7,1.2,m,0,.95,-.6)); g.add(box(.3,.08,.5,mat({color:0xff4060}),0,.75,-1.4)); eyes(1.1,-1.15,.25,.1); H=2; }
  else if(shape==="hydra"){ const body=sph(1,m,0,.9,.6); body.scale.multiply(new THREE.Vector3(1.2,.9,1.4)); g.add(body); [-1,0,1].forEach(k=>{ const nk=capsule(.3,2.4,k?dk:m,k*.9,2,-.3); nk.rotation.x=.5; nk.rotation.z=-k*.35; g.add(nk); const hd=sph(.45,m,k*1.3,3.1,-1.1); g.add(hd); g.add(box(.25,.06,.5,mat({color:0xff4060}),k*1.3,2.95,-1.6)); [-.15,.15].forEach(x=>g.add(sph(.08,eye,k*1.3+x,3.2,-1.5))); }); for(let k=0;k<4;k++){ const t=sph(.4-k*.08,dk,0,.6,1.8+k*.7); g.add(t); } H=4.2; shadowR=1.6; }
  else if(shape==="naga"){ for(let k=0;k<6;k++){ const r=.9-k*.1; const sg=sph(r/2,k%2?dk:m,0,.45,.6+k*.75); g.add(sg); } g.add(capsule(.45,1.5,m,0,1.9,0)); g.add(sph(.45,lt,0,3.1,0)); const hood=new THREE.Mesh(new THREE.SphereGeometry(.9,14,10,0,Math.PI,0,Math.PI*.6),dk); hood.position.set(0,3.1,-.2); hood.rotation.y=Math.PI; hood.scale.set(1.2,1,.6); g.add(hood); g.add(new THREE.Mesh(new THREE.TorusGeometry(.4,.06,8,20),M.gold)).position.set(0,3.5,0); g.add(capsule(.14,1.1,m,-.65,2.4,0)); g.add(capsule(.14,1.1,m,.65,2.4,0)); const tri=cyl(.05,.05,2.2,M.gold,.75,2.4,.3); g.add(tri); eyes(3.15,.4,.17,.09); H=4.2; }
  else if(shape==="rakshasa"){ g.add(capsule(.7,1.9,m,0,1.95,0)); g.add(sph(.62,lt,0,3.3,0)); [-1,1].forEach(sg=>{ const tk=cyl(.03,.1,.5,bone,sg*.25,3.0,.55); tk.rotation.x=-.4; g.add(tk); }); horns(3.8,0,.9,dk); g.add(capsule(.22,1.3,m,-.95,2.5,0)); g.add(capsule(.22,1.3,m,.95,2.5,0)); g.add(capsule(.25,1.2,dk,-.35,.6,0)); g.add(capsule(.25,1.2,dk,.35,.6,0)); const mane=sph(.75,dk,0,3.35,-.25); mane.scale.set(1.2,1.1,.9); g.add(mane); eyes(3.35,.55,.22,.1); H=4.5; }
  else if(shape==="asura"){ g.add(capsule(.6,1.9,m,0,2,0)); g.add(sph(.55,lt,0,3.35,0)); const crown=cyl(.6,.5,.35,M.gold,0,4,0,8); g.add(crown); [[-1,2.6],[1,2.6],[-1,2.1],[1,2.1]].forEach(([sg,y])=>{ const a=capsule(.17,1.2,m,sg*.85,y,0); a.rotation.z=sg*(y>2.4?-.3:-.9); g.add(a); }); g.add(capsule(.25,1.2,dk,-.3,.6,0)); g.add(capsule(.25,1.2,dk,.3,.6,0)); g.add(sph(.1,glowMat(0xff3d4a,1),0,3.6,.52)); eyes(3.4,.48,.2,.09); H=4.6; }
  else if(shape==="ravana"){ g.add(capsule(.8,2.2,m,0,2.2,0)); for(let k=-2;k<=2;k++){ g.add(sph(.42,lt,k*.6,3.8+(Math.abs(k)===1?.3:Math.abs(k)===2?-.1:.6),Math.abs(k)*-.25)); [-.13,.13].forEach(x=>g.add(sph(.07,eye,k*.6+x,3.85+(Math.abs(k)===1?.3:Math.abs(k)===2?-.1:.6),.4+Math.abs(k)*-.25))); } g.add(cyl(.7,.6,.3,M.gold,0,4.75,0,8)); [[-1,2.9],[1,2.9],[-1,2.3],[1,2.3],[-1,1.7],[1,1.7]].forEach(([sg,y])=>{ const a=capsule(.18,1.3,m,sg*1.05,y,0); a.rotation.z=sg*(-.4-(2.9-y)); g.add(a); }); g.add(capsule(.3,1.3,dk,-.4,.65,0)); g.add(capsule(.3,1.3,dk,.4,.65,0)); H=5.6; shadowR=1.5; }
  else if(shape==="wolf"){ const bd=capsule(.55,2.4,m,0,1.1,0); bd.rotation.z=Math.PI/2; g.add(bd); const mane=sph(.6,dk,.6,1.3,0); mane.scale.multiply(new THREE.Vector3(1,.8,1.1)); g.add(mane); g.add(sph(.5,m,1.5,1.55,0)); const sn=capsule(.25,.7,dk,2.05,1.4,0); sn.rotation.z=Math.PI/2; g.add(sn); [-1,1].forEach(sg=>{ const e=new THREE.Mesh(GEO.cone,m); e.scale.set(.3,.5,.3); e.position.set(1.5,2.15,sg*.3); g.add(e);}); for(let k=0;k<4;k++) g.add(capsule(.16,.9,dk,-.7+(k%2)*1.4,.45,(k<2?-1:1)*.35)); const tail=capsule(.14,1.1,m,-1.5,1.4,0); tail.rotation.z=1.2; g.add(tail); [-.3,.3].forEach(z=>g.add(sph(.09,eye,1.93,1.65,z))); H=2.8; }
  else if(shape==="harpy"){ g.add(capsule(.45,1.3,mat({color:0xe8c8a8,roughness:.8}),0,2.1,0)); g.add(sph(.45,mat({color:0xf0d0b0}),0,3.1,0)); const hr=sph(.5,dk,0,3.25,-.1); hr.scale.y*=.8; g.add(hr); wings(2.5,-.2,2.8,m,true); for(let k=0;k<2;k++){ const lg=capsule(.12,1,m,-.3+k*.6,.9,0); g.add(lg); [-1,0,1].forEach(t=>{ const c=cyl(.03,.08,.4,dk,-.3+k*.6+t*.12,.2,.25); c.rotation.x=-.9; g.add(c); }); } eyes(3.15,.4,.16,.08); g.userData.float=.4; H=4.2; }
  else if(shape==="cyclops"){ const t=sph(1.25,m,0,2.4,0); t.scale.multiply(new THREE.Vector3(1,1.2,.8)); g.add(t); g.add(box(2.2,.5,1.6,mat({color:0x6a4a2a}),0,1.5,0)); g.add(sph(.85,lt,0,4.35,0)); g.add(sph(.3,new THREE.MeshBasicMaterial({color:0xffffff}),0,4.45,.72)); g.add(sph(.15,eye,0,4.45,.95)); const aL=capsule(.36,2.1,m,-1.55,2.4,0), aR=capsule(.36,2.1,m,1.55,2.4,0); aL.rotation.z=.2; aR.rotation.z=-.3; g.add(aL,aR); g.add(capsule(.42,1.2,dk,-.55,.6,0)); g.add(capsule(.42,1.2,dk,.55,.6,0)); const club=cyl(.2,.5,2.6,M.wood,2.1,2.4,.5); club.rotation.z=.3; g.add(club); H=5.6; shadowR=1.6; }
  else if(shape==="satyr"){ g.add(capsule(.42,1.3,mat({color:0xe0b890,roughness:.8}),0,2.1,0)); g.add(sph(.45,mat({color:0xe8c0a0}),0,3.1,0)); horns(3.45,0,.6,bone); g.add(capsule(.14,1,mat({color:0xe0b890}),-.62,2.5,0)); g.add(capsule(.14,1,mat({color:0xe0b890}),.62,2.5,0)); [-.28,.28].forEach(x=>{ const l=capsule(.2,.8,m,x,1.1,0); g.add(l); const h=capsule(.14,.7,dk,x,.4,.15); h.rotation.x=.4; g.add(h); }); const fl=cyl(.05,.05,.9,M.wood,.7,2.9,.4); fl.rotation.z=1.2; g.add(fl); const bd=sph(.3,dk,0,2.85,.3); bd.scale.y*=1.3; g.add(bd); eyes(3.15,.4,.16,.08); H=4; }
  else if(shape==="bull"){ const t=sph(1.3,m,0,2.5,0); t.scale.multiply(new THREE.Vector3(1.15,1.2,.85)); g.add(t); g.add(sph(.85,dk,0,4.3,.2)); const sn=capsule(.4,.7,lt,0,4.05,.9); sn.rotation.x=Math.PI/2; g.add(sn); [-1,1].forEach(sg=>{ const h=cyl(.07,.2,1.3,bone,sg*.9,4.7,.1); h.rotation.z=sg*-1.1; g.add(h); }); g.add(new THREE.Mesh(new THREE.TorusGeometry(.18,.04,6,12),M.gold)).position.set(0,3.85,1.3); const aL=capsule(.4,2.1,m,-1.65,2.5,0), aR=capsule(.4,2.1,m,1.65,2.5,0); aL.rotation.z=.25; aR.rotation.z=-.25; g.add(aL,aR); g.add(capsule(.42,1.3,dk,-.55,.65,0)); g.add(capsule(.42,1.3,dk,.55,.65,0)); const ax=cyl(.07,.07,2.4,M.wood,2.2,2.4,.5); g.add(ax); g.add(box(.9,.7,.15,metal,2.2,3.5,.5)); eyes(4.4,.9,.3,.1); H=5.8; shadowR=1.6; }
  else { g.add(capsule(.65,1.8,m,0,1.9,0)); g.add(new THREE.Mesh(new THREE.TorusGeometry(.6,.1,8,20),dk)).position.set(0,2.3,0); g.add(sph(.58,lt,0,3.15,0)); horns(3.95,0,.9,mat({color:0x2a1a1a})); g.add(capsule(.2,1.3,m,-.9,2.5,0)); g.add(capsule(.2,1.3,m,.9,2.5,0)); g.add(capsule(.25,1.2,dk,-.33,.6,0)); g.add(capsule(.25,1.2,dk,.33,.6,0)); const tri=cyl(.05,.05,2.2,mat({color:0x2a1a1a}),1.2,2.2,.3); g.add(tri); for(let k=-1;k<=1;k++) g.add(box(.08,.5,.1,metal,1.2+k*.2,3.4,.3)); eyes(3.2,.5,.2,.09); H=4.4; }
  g.userData.h=H; const sh=new THREE.Mesh(new THREE.CircleGeometry(shadowR,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=.05; g.add(sh);
  g.scale.set(scale,scale,scale); shadowify(g); if(typeof outlined==="function") outlined(g,1.06); return g; }

/* ================= 라벨 ================= */
const labelsEl=$("labels"); const _v=new THREE.Vector3();
function makeLabel(cls){ const d=document.createElement("div"); d.className="lbl "+(cls||""); labelsEl.appendChild(d); return d; }
function placeLabel(el,x,y,z,html){ _v.set(x,y+hAt(x,z),z).project(camera); if(_v.z>1||Math.abs(_v.x)>1.2||Math.abs(_v.y)>1.2){ el.style.display="none"; return; } el.style.display=""; const sx=(_v.x+1)/2*innerWidth; let sy=(1-_v.y)/2*innerHeight; if(html!==undefined&&el._h!==html){ el._h=html; el.innerHTML=html; el._w=0; } if(!el._w){ el._w=el.offsetWidth||1; el._hh=el.offsetHeight||1; } if(sy-el._hh<44) sy=44+el._hh;   /* v37: 화면 위로 잘려 나가지 않게 */ el._sx=sx; el._sy=sy; el._f=LBLF; el.style.transform=`translate(${Math.round(sx-el._w/2)}px,${Math.round(sy-el._hh)}px)`; }
/* v34 글자 겹침: 같은 장에 놓인 이름표끼리 겹치면 뒤의 것을 위로 밀어 올림(데미지 숫자는 빼고) */
let LBLF=0; function deoverlapLabels(){ const L=[]; for(const el of labelsEl.children){ if(el._f===LBLF&&el.style.display!=="none"&&!el.classList.contains("dmg")) L.push(el); } LBLF++; if(L.length<2) return; L.sort((a,b)=>b._sy-a._sy);
  for(let i=1;i<L.length;i++){ const b=L[i]; for(let j=0;j<i;j++){ const a=L[j]; const w=(a._w+b._w)/2; if(Math.abs(a._sx-b._sx)<w*.9){ const top=a._sy-a._hh; if(b._sy>top&&b._sy-b._hh<a._sy){ b._sy=top-2; } } } b.style.transform=`translate(${Math.round(b._sx-b._w/2)}px,${Math.round(b._sy-b._hh)}px)`; } }
function floatDmg(x,y,z,txt,cls){ txt=String(txt); cls=cls||""; if(!cls&&txt[0]==="+") cls="gain"; const el=makeLabel("dmg "+cls); const dx=Math.round((Math.random()-.5)*44); placeLabel(el,x,y,z,`<em class="${cls==="crit"&&txt[0]==="-"?"c":""}" style="--dx:${dx}px">${txt}</em>`); setTimeout(()=>el.remove(),1150); }

/* ================= 효과 ================= */
const FX=[];
function fxRing(x,z,color,size,dur){ const m=new THREE.Mesh(GEO.ring,glowMat(color,.9)); m.rotation.x=-Math.PI/2; m.position.set(x,.12+hAt(x,z),z); scene.add(m); FX.push({m,t:0,d:dur||.5,size:size||4,kind:"ring"}); }
function fxFlash(x,y,z,color,size,dur){ if(typeof SFX!=="undefined"){ try{ return SFX.glow(x,y+hAt(x,z),z,color,size||2,(dur||.3)*1.2); }catch(e){} } const m=new THREE.Mesh(GEO.sph,glowMat(color,.95)); m.position.set(x,y+hAt(x,z),z); scene.add(m); FX.push({m,t:0,d:dur||.3,size:size||2,kind:"flash"}); }
function fxBolt(x,z,color){ const m=cyl(.18,.6,34,glowMat(color,.95),x,17+hAt(x,z),z,8); scene.add(m); FX.push({m,t:0,d:.3,size:1,kind:"bolt"}); fxFlash(x,1,z,color,3,.3); fxSpark(x,1,z,color,24); }
function fxLine(x,z,rot,len,color){ const m=box(2.4,.5,len,glowMat(color,.8)); m.position.set(x+Math.sin(rot)*len/2,1.2+hAt(x,z),z+Math.cos(rot)*len/2); m.rotation.y=rot; scene.add(m); FX.push({m,t:0,d:.35,size:1,kind:"line"}); }
function fxArc(x,z,rot,color){ const m=new THREE.Mesh(new THREE.TorusGeometry(2.6,.18,6,24,Math.PI*.9),glowMat(color,.9)); m.rotation.x=-Math.PI/2; m.rotation.z=-rot-Math.PI*.05+Math.PI/2; m.position.set(x,1.6+hAt(x,z),z); m.userData.noOutline=true; scene.add(m); FX.push({m,t:0,d:.18,size:1,kind:"arc"}); }
function fxSpark(x,y,z,color,n){ y+=hAt(x,z); const N=n||14; const geo=new THREE.BufferGeometry(); const p=new Float32Array(N*3); const v=[]; for(let i=0;i<N;i++){ p[i*3]=x; p[i*3+1]=y; p[i*3+2]=z; v.push(new THREE.Vector3(rnd(-1,1),rnd(.2,1.4),rnd(-1,1)).normalize().multiplyScalar(rnd(4,11))); } geo.setAttribute("position",new THREE.BufferAttribute(p,3)); const m=new THREE.Points(geo,new THREE.PointsMaterial({color,size:.45,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending})); scene.add(m); FX.push({m,t:0,d:.55,kind:"spark",v,p}); }
function tickFX(dt){ for(let i=FX.length-1;i>=0;i--){ const f=FX[i]; f.t+=dt; const k=f.t/f.d; if(k>=1){ scene.remove(f.m); f.m.material.dispose(); if(f.m.geometry&&(f.kind==="spark"||f.own)) f.m.geometry.dispose(); FX.splice(i,1); continue; }
  if(f.tick){ f.tick(f,k,dt); continue; }
  if(f.kind==="ring"){ const s=.5+k*f.size; f.m.scale.set(s,s,s); f.m.material.opacity=.9*(1-k); } else if(f.kind==="flash"){ const s=f.size*(.6+k); f.m.scale.set(s,s,s); f.m.material.opacity=.95*(1-k); } else if(f.kind==="spark"){ for(let j=0;j<f.v.length;j++){ f.v[j].y-=18*dt; f.p[j*3]+=f.v[j].x*dt; f.p[j*3+1]+=f.v[j].y*dt; f.p[j*3+2]+=f.v[j].z*dt; } f.m.geometry.attributes.position.needsUpdate=true; f.m.material.opacity=1-k; } else if(f.kind==="arc"){ f.m.material.opacity=.9*(1-k); f.m.scale.setScalar(1+k*.5); } else f.m.material.opacity=.9*(1-k); } }
</script>
