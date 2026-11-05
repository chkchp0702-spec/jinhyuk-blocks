<script>
/* ================= v56-3: 🌌 라그나로크의 밤 — 한 번뿐인 생방송 세계 이벤트 (IDEAS G11/5-6) =================
   축제 시즌(04l)의 마지막 토요일 저녁 8시(한국 시간)에 모든 폰에서 똑같이 벌어지는 큰 사건. 첫 회는 개막 기념 11/7(토) 저녁 8시.
   10분 전부터 화면 위 보라색 띠에 카운트다운 → 수도마다 열리는 「🌌 라그나로크의 문」으로 바다 결투장(지도 밖 x≈-380, z≈380)에 모임.
   ① 비늘 깨기: 뱀 둘레 수정 비늘을 때릴 때마다 1점(깨면 +6) — 모두의 점수를 더해 뱀 체력이 줄어듦
   ② 혼돈 괴물 막기: 바다에서 기어오르는 혼돈 괴물을 모두 함께 잡기 (처치 수 합산)
   ③ 신들의 힘 모으기: 「✨ 힘 모으기」 버튼을 다 같이 톡톡 → 네 세계의 신이 내려와 마지막 한 방(화면 가득 연출)
   끝나면 세계가 진짜로 바뀜: 뱀이 쓰러진 자리에 「🏝 뱀의 섬」이 솟아 사냥터가 되고, 수도의 문은 섬으로 가는 문이 됨(계속 남음).
   함께한 사람: 칭호 «그날 그곳에 있었다» · 신전 장식 «세계 뱀의 비늘» · 큰 보상. 못 온 사람: 다음에 켜면 작은 상자 + 「그날의 기록」 다시 보기.
   결투장에서는 다치긴 해도 쓰러지지 않아요(체력 1에서 멈춤) · 친구끼리 때리지 않음 · 무서운 장면 없음.
   보관(retained) 주제 lv/<회차>/<id> = {i,n,r,e,s(비늘 점수),k(처치),p(힘),ts} → 다 더하기. 단계는 시각 + 모두의 합으로 각 폰이 똑같이 정함. */
const LVX=-380, LVZ=380, LV_IN=14, LV_OUT=46;
const LV_PRE=10*60000, LV_P1=6*60000, LV_P2=4*60000, LV_P3=45000, LV_FIN=17000, LV_END=16*60000;
const LV_PREMIERE=Date.UTC(2026,10,7,11,0,0);   // 2026-11-07(토) 20:00 KST
const LV_BOSS=[
 {n:"세계 뱀 요르문간드",w:"아스가르드",c:0x3f8a5a,c2:0x9ad88a,eye:0xffe040},
 {n:"가뭄의 뱀 브리트라",w:"인도",c:0x8a4a2a,c2:0xe0a060,eye:0xff8040},
 {n:"델포이의 큰 뱀 피톤",w:"올림푸스",c:0x6a6a2a,c2:0xd8d070,eye:0x80ffd0},
 {n:"바다 괴물 레비아탄",w:"에덴",c:0x2a4a8a,c2:0x8ab8ff,eye:0xffffff} ];
const LV={on:false,built:false,parts:[],ser:null,isle:null,scales:[],gods:[],beams:[],ph:"",phT:0,ev:null,s:0,k:0,p:0,pubT:0,dirty:false,bandEl:null,btn:null,crack:null,warnT:4,warns:[],spT:0,amb:0,fin:null,cd:0,gates:[],gateLbl:null,replay:false,p2t:0,p3t:0,finT:0,tapT:0,hurtOk:false,claimT:3};
const LVO={};
const CAMX={on:false,pos:new THREE.Vector3(),look:new THREE.Vector3()};
function lvIn(x,z){ return Math.abs(x-LVX)<150&&Math.abs(z-LVZ)<150; }
function lvAt(day){ return day*86400000+11*3600000; }
function lvEvents(){ const L=[{id:"p0",t:LV_PREMIERE,b:0}]; const S=ssNo(); for(let s=Math.max(0,S-1);s<=S+1;s++){ const t=lvAt(ssStartDay(s+1)-2); if(Math.abs(t-LV_PREMIERE)>86400000) L.push({id:"s"+s,t,b:(s+1)%4}); } return L.sort((a,b)=>a.t-b.t); }
function lvCur(){ const now=Date.now(); return lvEvents().find(e=>now<e.t+LV_END)||null; }
function lvPast(){ const now=Date.now(); return lvEvents().filter(e=>now>=e.t+LV_END); }
function lvIsle(){ return Date.now()>=LV_PREMIERE+LV_END||!!(G.lvDone&&Object.keys(G.lvDone).length); }
function lvLive(e){ const now=Date.now(); return !!e&&now>=e.t-LV_PRE&&now<e.t+LV_END; }
function lvBoss(e){ return LV_BOSS[(e?e.b:0)%4]; }
function lvWhen(t){ const d=new Date(t+9*3600000); return `${d.getUTCMonth()+1}/${d.getUTCDate()}(${"일월화수목금토"[d.getUTCDay()]}) 저녁 ${d.getUTCHours()>12?d.getUTCHours()-12:d.getUTCHours()}시`; }
function lvLeft(ms){ ms=Math.max(0,ms); const s=Math.floor(ms/1000); if(s>=86400) return `${Math.floor(s/86400)}일 ${Math.floor(s%86400/3600)}시간`; if(s>=3600) return `${Math.floor(s/3600)}시간 ${Math.floor(s%3600/60)}분`; return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
/* ---------- 모두의 합 ---------- */
function lvRecs(e){ const o=LVO[e.id]||{}; const L=[]; for(const id in o) if(id!==G.id) L.push(o[id]); if(LV.ev&&LV.ev.id===e.id&&(LV.s||LV.k||LV.p)) L.push({i:G.id,n:G.name,r:G.realm,s:LV.s,k:LV.k,p:LV.p,me:1}); return L; }
function lvN(e){ return Math.max(1,lvRecs(e).length); }
function lvSum(e,key){ return lvRecs(e).reduce((a,x)=>a+(+x[key]||0),0); }
function lvGoal(e,key){ const n=Math.pow(lvN(e),.8); return Math.round((key==="s"?260:key==="k"?22:140)*n); }
function lvPhase(e){ if(!e) return "none"; const now=Date.now(); if(now<e.t-LV_PRE) return "soon"; if(now<e.t) return "gather"; if(now>=e.t+LV_END) return "over";
  if(LV.fin&&LV.fin.e===e.id) return LV.fin.done?"done":"finale"; if(LV.finAt&&LV.finE===e.id) return now-LV.finAt>LV_FIN?"done":"finale";
  const s=lvSum(e,"s")>=lvGoal(e,"s")||now>=e.t+LV_P1; if(!s) return "p1"; if(!LV.p2t) LV.p2t=Math.min(now,e.t+LV_P1);
  const k=lvSum(e,"k")>=lvGoal(e,"k")||now>=LV.p2t+LV_P2||now>=e.t+11*60000; if(!k) return "p2"; if(!LV.p3t) LV.p3t=now;
  const p=lvSum(e,"p")>=lvGoal(e,"p")||now>=LV.p3t+LV_P3||now>=e.t+13*60000; if(!p) return "p3"; LV.finAt=now; LV.finE=e.id; return "finale"; }
NETX.push({sub:"lv/+/+",pre:"lv/",f:(d)=>{ if(!d||!d.i||!d.e||d.i===G.id) return; (LVO[d.e]=LVO[d.e]||{})[d.i]=d; }});
function lvPub(){ const e=LV.ev; if(!e||!(LV.s||LV.k||LV.p)) return; try{ net.pushRet("lv/"+e.id+"/"+G.id,{i:G.id,n:G.name,r:G.realm,e:e.id,s:LV.s,k:LV.k,p:LV.p,ts:Date.now()}); }catch(e2){} }
/* ---------- 뱀 모델 ---------- */
function lvSerpent(B){ const g=new THREE.Group(); const m=mat({color:B.c,roughness:.55,metalness:.15}), m2=mat({color:B.c2,roughness:.6}), eye=mat({color:B.eye,emissive:B.eye,emissiveIntensity:1.4});
  const segs=[]; const N=ECO()?18:26; for(let i=0;i<N;i++){ const r=3.4-i*.07; const s=sph(r,i%2?m:m2,0,0,0); s.scale.z*=1.15; g.add(s); segs.push(s); }
  const head=new THREE.Group(); const sk=sph(3.6,m,0,0,0); sk.scale.multiply(new THREE.Vector3(1,.8,1.5)); head.add(sk); const jaw=sph(2.6,m2,0,-1.3,2.2); jaw.scale.multiply(new THREE.Vector3(1,.45,1.3)); head.add(jaw); head.userData.jaw=jaw;
  [-1,1].forEach(k=>{ head.add(sph(.6,eye,k*1.7,1.1,3.1)); const h=new THREE.Mesh(GEO.cone,m2); h.scale.set(.7,2.6,.7); h.position.set(k*1.6,2.6,-1); h.rotation.x=-.6; h.rotation.z=-k*.35; head.add(h); });
  for(let k=0;k<5;k++){ const f=new THREE.Mesh(GEO.cone,m2); f.scale.set(.5,1.6,.5); f.position.set(0,2.2,-2.6-k*.2); f.rotation.x=-1; head.add(f); } g.add(head);
  g.userData={segs,head,rise:0,sink:0}; return g; }
function lvPoseSerpent(dt){ const g=LV.ser; if(!g) return; const u=g.userData, tn=performance.now()/1000; const N=u.segs.length; const ph=LV.ph;
  const up=ph==="gather"?.25:ph==="soon"?0:1; u.rise+=(up-u.rise)*Math.min(1,dt*.6); const sink=LV.fin&&LV.fin.t>8.5?Math.min(1,(LV.fin.t-8.5)/5):0; u.sink=sink;
  const vis=!!LV.ev&&sink<1; if(u.vis!==vis){ u.vis=vis; u.segs.forEach(x=>x.visible=vis); u.head.visible=vis; } if(!vis) return;
  const base=-30+u.rise*30-sink*55; let hx=0,hy=0,hz=0;
  for(let i=0;i<N;i++){ const k=i/(N-1); const a=k*Math.PI*2.3+tn*.5; const r=8.5-k*5; const y=base+k*24+Math.sin(tn*1.3+k*5)*.8; const s=u.segs[i]; s.position.set(LVX+Math.cos(a)*r,y,LVZ+Math.sin(a)*r); if(i===N-1){ hx=s.position.x; hy=s.position.y; hz=s.position.z; } }
  const hd=u.head; hd.position.set(hx,hy+3.2,hz); const tx=P.x-hx, tz=P.z-hz; const want=Math.atan2(tx,tz); let dr=want-hd.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; hd.rotation.y+=dr*Math.min(1,dt*1.2); hd.rotation.x=-.25+Math.sin(tn*.9)*.08+(LV.roar>0?-.35:0); if(hd.userData.jaw) hd.userData.jaw.position.y=-1.3-(LV.roar>0?1.2:Math.max(0,Math.sin(tn*.7))*.4);
  LV.headP={x:hx,y:hy+3.2,z:hz}; }
/* ---------- 결투장 만들기 ---------- */
function lvBuild(e){ const B=lvBoss(e); if(LV.built&&LV.bid===e.id) return; lvClear(); LV.built=true; LV.bid=e.id; const add=o=>{ scene.add(o); LV.parts.push(o); return o; };
  const stone=mat({color:0x8a8aa0,roughness:.9}), dk=mat({color:0x5a5a70,roughness:.95}), top=mat({color:0xb8b8c8,roughness:.85}), gold=M.gold;
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(560,560),M.water||mat({color:0x2a4a7a})); sea.rotation.x=-Math.PI/2; sea.position.set(LVX,-1.2,LVZ); add(sea);
  const G0=new THREE.Group(); const ring=new THREE.Mesh(new THREE.RingGeometry(LV_IN,LV_OUT,64,1),top); ring.rotation.x=-Math.PI/2; ring.position.set(LVX,.02,LVZ); G0.add(ring);
  const wallO=new THREE.Mesh(new THREE.CylinderGeometry(LV_OUT,LV_OUT+1.5,3,64,1,true),stone); wallO.position.set(LVX,-1.5,LVZ); G0.add(wallO); const wallI=new THREE.Mesh(new THREE.CylinderGeometry(LV_IN,LV_IN-.5,3,48,1,true),dk); wallI.material.side=THREE.DoubleSide; wallI.position.set(LVX,-1.5,LVZ); G0.add(wallI);
  for(let k=0;k<4;k++){ const a=k/4*6.283+.785; const x=LVX+Math.cos(a)*(LV_OUT-3), z=LVZ+Math.sin(a)*(LV_OUT-3); const R=REALMS[[1,2,3,0][k]]; G0.add(cyl(1.1,1.4,9,stone,x,4.5,z,10)); const f=sph(1,glowMat(new THREE.Color(R.c1).getHex(),.85),x,9.8,z); f.userData.noOutline=true; G0.add(f); }
  for(let k=0;k<24;k++){ const a=k/24*6.283; G0.add(box(1.4,.7,1.4,dk,LVX+Math.cos(a)*(LV_OUT-.8),.35,LVZ+Math.sin(a)*(LV_OUT-.8))); }
  const rune=new THREE.Mesh(new THREE.RingGeometry(LV_IN+.6,LV_IN+1.6,64),glowMat(0xb07aff,.35)); rune.rotation.x=-Math.PI/2; rune.position.set(LVX,.08,LVZ); rune.userData.noOutline=true; G0.add(rune); LV.rune=rune;
  add(shadowify(G0));
  // 돌아가는 문(남쪽 끝)
  { const g=pgArch(false); g.position.set(LVX,0,LVZ+LV_OUT-5); add(shadowify(g)); LV.exitArch={x:LVX,z:LVZ+LV_OUT-5}; }
  // 하늘의 금
  { const cg=new THREE.Group(); let x=-120,y=0; for(let k=0;k<14;k++){ const nx=x+rnd(12,22), ny=y+rnd(-9,9); const len=Math.hypot(nx-x,ny-y); const b=box(len,1.4,1,glowMat(0xff5a8a,.9),(x+nx)/2,(y+ny)/2,0); b.rotation.z=Math.atan2(ny-y,nx-x); b.userData.noOutline=true; cg.add(b); x=nx; y=ny; } cg.position.set(LVX,95,LVZ-160); cg.visible=false; add(cg); LV.crack=cg; }
  // 뱀
  LV.ser=lvSerpent(B); LV.ser.userData.segs.forEach(s=>LV.parts.push(s)); LV.parts.push(LV.ser.userData.head); LV.ser.userData.segs.forEach(s=>scene.add(s)); scene.add(LV.ser.userData.head); LV.ser.userData.segs.forEach(s=>s.userData.cullR=-1); LV.ser.userData.head.userData.cullR=-1;
  // 섬 (끝나면 솟아오름)
  { const g=new THREE.Group(); const grass=mat({color:0x6fae58,roughness:.9}), sand=mat({color:0xe8d09a,roughness:.95}); const hill=cyl(LV_IN-1.2,LV_IN-.6,6,sand,0,-3,0,32); g.add(hill); const tp=sph(LV_IN-2,grass,0,0,0); tp.scale.y*=.12; g.add(tp);
    for(let k=0;k<6;k++){ const a=k/6*6.283; const t=new THREE.Group(); t.add(cyl(.3,.4,3.4,mat({color:0x8a6040}),0,1.7,0,7)); const lf=sph(1.6,grass,0,3.8,0); lf.scale.y*=.8; t.add(lf); t.position.set(Math.cos(a)*8,.6,Math.sin(a)*8); g.add(t); }
    const bone=mat({color:0xf2ead8,roughness:.8}); for(let k=0;k<7;k++){ const a=-.6+k*.2; const rb=new THREE.Mesh(new THREE.TorusGeometry(5,.45,8,20,Math.PI),bone); rb.position.set(Math.cos(a)*2,1,Math.sin(a)*2-2+k*.9); rb.rotation.y=a+Math.PI/2; g.add(rb); }
    const stat=lvSerpent(B); stat.userData.segs.forEach((s,i)=>{ s.position.set(Math.cos(i*.5)*4.5,1.2+i*.12,Math.sin(i*.5)*4.5); s.scale.multiplyScalar(.35); s.material=bone; stat.add(s); }); stat.userData.head.position.set(0,5.3,0); stat.userData.head.scale.setScalar(.45); stat.userData.head.traverse(o=>{ if(o.isMesh) o.material=bone; }); stat.add(stat.userData.head); g.add(stat);
    g.position.set(LVX,lvIsle()?0:-14,LVZ); add(shadowify(g)); LV.isle=g; }
  LV.parts.forEach(o=>o.traverse&&o.traverse(m=>{ if(m.material&&m.material.blending===THREE.AdditiveBlending){ m.castShadow=false; m.userData.noOutline=true; } })); }
function lvClear(){ LV.parts.forEach(o=>scene.remove(o)); LV.parts=[]; LV.built=false; lvClearMobs(); LV.gods.forEach(g=>scene.remove(g)); LV.gods=[]; LV.beams.forEach(b=>scene.remove(b)); LV.beams=[]; }
function lvClearMobs(){ for(let i=mobs.length-1;i>=0;i--) if(mobs[i].lvm) removeMob(mobs[i]); LV.scales=[]; }
function lvShow(v){ LV.parts.forEach(o=>{ o.visible=v; }); if(LV.crack) LV.crack.visible=false; }
(function(){ const _h=hAt; hAt=function(x,z){ if(!lvIn(x,z)) return _h(x,z); const r=Math.hypot(x-LVX,z-LVZ); if(r<LV_IN) return lvIsle()&&!LV.ev?Math.max(0,1.5*(1-Math.pow(r/(LV_IN-1.5),2))):-1; return 0; }; })();
/* ---------- 괴물 · 비늘 ---------- */
function lvMob(def,lv,x,z,scale,o){ const st=mobStats(lv,false); const mesh=def.mk?def.mk():makeMob(def.shape,def.c,1); const m=Object.assign({n:def.n,shape:def.shape||"x",mesh,x,z,hx:x,hz:z,lv,boss:false,world:false,hp:st.mhp,mhp:st.mhp,atk:st.atk,xp:st.xp,gold:st.gold,rg:12,cd:1.2,state:"idle",t:rnd(0,2),lbl:makeLabel(""),rot:rnd(0,6.28),hit:0,scale,power:0,ev:1,lvm:1,warn:0},o||{});
  mesh.position.set(x,hAt(x,z),z); mesh.scale.setScalar(scale); scene.add(mesh); mobs.push(m); return m; }
function lvScaleMesh(c){ const g=new THREE.Group(); const cr=new THREE.Mesh(new THREE.OctahedronGeometry(1.1,0),mat({color:c,roughness:.25,metalness:.3,emissive:c,emissiveIntensity:.35,transparent:true,opacity:.92})); cr.scale.set(1,1.6,1); cr.position.y=1.8; g.add(cr); const gl=new THREE.Mesh(new THREE.RingGeometry(1,1.5,24),glowMat(c,.5)); gl.rotation.x=-Math.PI/2; gl.position.y=.1; gl.userData.noOutline=true; g.add(gl); g.userData.cr=cr; g.userData.h=3.6; return g; }
function lvSpawnScale(slot){ const B=lvBoss(LV.ev); const a=slot/8*6.283+.2, r=LV_IN+2.6; const x=LVX+Math.cos(a)*r, z=LVZ+Math.sin(a)*r; const m=lvMob({n:"뱀의 비늘",mk:()=>lvScaleMesh(B.c2)},Math.max(1,G.lv),x,z,1,{lvScale:1,slot,still:1}); const hp=Math.round(stat().atk*7.5); m.hp=m.mhp=Math.max(30,hp); m.xp=Math.round(m.xp*.6); m.gold=Math.round(m.gold*.6); LV.scales[slot]=m; return m; }
const LV_CHAOS=[{n:"혼돈의 바다뱀",shape:"naga",c:0x5a3a8a},{n:"혼돈의 뼈 병사",shape:"draugr",c:0x6a5a7a},{n:"검은 안개 늑대",shape:"wolf",c:0x3a2a4a}];
(function(){ const _dm=damageMob; damageMob=function(m,dmg,crit){ const was=m.hp>0; _dm(m,dmg,crit); if(m.lvScale&&was&&LV.on&&LV.ph==="p1"){ LV.s+=1; LV.dirty=true; } };
  const _km=killMob; killMob=function(m){ const lvm=m.lvm, sc=m.lvScale, slot=m.slot; _km(m); if(!lvm) return; if(sc){ if(LV.ph==="p1"){ LV.s+=6; LV.dirty=true; floatDmg(m.x,4,m.z,"비늘 깨짐! +6","gain"); } LV.scales[slot]=null; setTimeout(()=>{ if(LV.on&&LV.ph==="p1"&&!LV.scales[slot]) lvSpawnScale(slot); },3500); } else if(LV.ph==="p2"){ LV.k+=1; LV.dirty=true; } else if(lvIsle()&&!LV.ev){ G.lvIsleK=(G.lvIsleK||0)+1; if(Math.random()<.25){ G.lvBits=(G.lvBits||0)+1; floatDmg(m.x,5,m.z,"🐍 비늘 조각 +1","gain"); } } };
  const _hp=hurtPlayer; hurtPlayer=function(d,f){ if(LV.on&&!LV.hurtOk) return; return _hp(d,f); };
  const _sh=spawnAtHome; spawnAtHome=function(){ if(LV.on) lvExit(true,true); _sh(); }; })();
function lvHurt(d,who){ if(P.dead||P.invul>0) return; const st=stat(); d=Math.min(d,P.hp-1); if(d<=0){ P.invul=.6; toast("💫 아슬아슬! 결투장에서는 쓰러지지 않아요","물약을 먹거나 잠깐 물러나요",1.2); return; } LV.hurtOk=true; try{ hurtPlayer(d,who); }catch(e){} LV.hurtOk=false; if(P.hp<1) P.hp=1; if(P.dead){ P.dead=false; P.hp=Math.max(1,P.hp); } }
function lvTickMobs(dt){ const st=stat(), tn=performance.now(); mobs.forEach(m=>{ if(!m.lvm) return; m.hit=Math.max(0,m.hit-dt); const u=m.mesh.userData;
    if(m.still){ if(u.cr){ u.cr.rotation.y+=dt*1.2; u.cr.position.y=1.8+Math.sin(tn/400+m.slot)*.25; } hitTint(m.mesh,m.hit/.15); m.mesh.scale.setScalar(m.hit>0?1.12:1); m.mesh.position.set(m.x,hAt(m.x,m.z),m.z); if(Math.hypot(P.x-m.x,P.z-m.z)<40) placeLabel(m.lbl,m.x,4.4,m.z,`💠 뱀의 비늘<span class="hp"><i style="width:${Math.round(m.hp/m.mhp*100)}%"></i></span>`); else m.lbl.style.display="none"; return; }
    const dx=P.x-m.x, dz=P.z-m.z, d=Math.hypot(dx,dz); m.cd-=dt; m.t-=dt; const spd=m.shape==="wolf"?5.2:4;
    if(!P.dead&&d<34){ m.state="chase"; if(d>2.3){ m.x+=dx/d*spd*dt; m.z+=dz/d*spd*dt; } m.rot=Math.atan2(dx,dz); if(d<=2.4&&m.cd<=0){ m.cd=1.4; lvHurt(m.atk*.8*(1-dmgReduce(st.def)),m.n); u.lunge=.25; } }
    else { m.state="idle"; if(m.t<=0){ m.t=rnd(1.5,4); m.wx=m.hx+rnd(-6,6); m.wz=m.hz+rnd(-6,6); } if(m.wx!=null){ const wx=m.wx-m.x, wz=m.wz-m.z, wd=Math.hypot(wx,wz); if(wd>.5){ m.x+=wx/wd*1.5*dt; m.z+=wz/wd*1.5*dt; m.rot=Math.atan2(wx,wz); } } }
    const r=Math.hypot(m.x-LVX,m.z-LVZ), lo=lvIsle()&&!LV.ev?3:LV_IN+1, hi=LV_OUT-1.5; if(r<lo||r>hi){ const k=clamp(r,lo,hi)/(r||1); m.x=LVX+(m.x-LVX)*k; m.z=LVZ+(m.z-LVZ)*k; }
    m.mesh.position.set(m.x,hAt(m.x,m.z)+(u.lunge>0?.4:0),m.z); if(u.lunge>0) u.lunge-=dt; let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*8);
    hitTint(m.mesh,m.hit/.15); m.mesh.scale.setScalar(m.scale*(m.hit>0?1.12:1)); try{ HITF.apply(m,dt); }catch(e){}
    if(d<40){ placeLabel(m.lbl,m.x,(u.h||4)*m.scale,m.z,`${m.n} <b>Lv.${m.lv}</b><span class="hp"><i style="width:${Math.round(m.hp/m.mhp*100)}%"></i></span>`); } else m.lbl.style.display="none"; }); }
function lvSpot(lo){ for(let k=0;k<20;k++){ const a=rnd(0,6.283), r=rnd(lo||LV_IN+3,LV_OUT-3); const x=LVX+Math.cos(a)*r, z=LVZ+Math.sin(a)*r; if(Math.hypot(x-P.x,z-P.z)<10) continue; return {x,z}; } return {x:LVX+LV_OUT-6,z:LVZ}; }
/* ---------- 들어가기 · 나가기 ---------- */
function lvEnter(replay){ const e=lvCur(); const live=lvLive(e); if(!replay&&!live&&!lvIsle()){ toast("🌌 아직 문이 열리지 않았어요",e?`${lvWhen(e.t)}에 열려요`:"",2); return; } if(LV.on||P.dead) return; if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&!m.lvm&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  try{ twBusyExit(); }catch(er){ closeLayer(); } try{ if(TW.on) twExit(true,true); }catch(er){}
  const ev=replay?{id:"replay",t:Date.now()-LV_P1,b:(lvPast().slice(-1)[0]||{b:0}).b}:live?e:null; LV.ev=ev; LV.replay=!!replay; LV.fin=null; LV.p2t=0; LV.p3t=0; LV.s=LV.k=LV.p=0; LV.ph="";
  if(ev&&!replay){ const me=(LVO[ev.id]||{})[G.id]; if(me){ LV.s=me.s||0; LV.k=me.k||0; LV.p=me.p||0; } }
  lvBuild(ev||{id:"isle",b:(lvPast().slice(-1)[0]||{b:0}).b}); lvShow(true); LV.on=true; LV.cd=2.5; P.x=LVX; P.z=LVZ+LV_OUT-10; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul,1.5); P.guide=null; $("guide").hidden=true; G.lvIn=(G.lvIn||0)+1; saveGame();
  if(LV.isle) LV.isle.position.y=(ev?-14:0); if(LV.ser){ LV.ser.userData.vis=null; LV.ser.userData.rise=replay||(ev&&Date.now()>=ev.t)?1:0; }
  if(replay){ LV.fin={e:"replay",t:0,done:false,rep:1}; try{ lvBanner("그날의 기록","🌌 라그나로크의 밤","네 세계의 신들이 함께 큰 뱀을 물리친 그날","#c9a0ff"); }catch(er){} }
  else if(ev){ const B=lvBoss(ev); try{ lvBanner("라그나로크의 밤",`🌌 ${B.n}`,Date.now()<ev.t?`곧 바다에서 깨어나요 · ${lvLeft(ev.t-Date.now())} 남음`:"모두 함께 비늘을 깨요!","#c9a0ff"); }catch(er){} }
  else { try{ lvBanner("다섯 바다의 끝","🏝 뱀의 섬","큰 뱀이 쓰러진 자리에 솟은 섬 · 혼돈의 괴물을 잡아 🐍 비늘 조각을 모아요","#9ad88a"); }catch(er){} }
  fxRing(P.x,P.z,0xc9a0ff,8,.8); fxSpark(P.x,2,P.z,0xc9a0ff,30); jingle([392,466,587,784]); }
function lvExit(silent,noTp){ if(!LV.on) return; LV.on=false; lvClearMobs(); lvShow(false); LV.gods.forEach(g=>scene.remove(g)); LV.gods=[]; LV.beams.forEach(b=>scene.remove(b)); LV.beams=[]; if(LV.btn) LV.btn.hidden=true; if(typeof CAMX!=="undefined") CAMX.on=false; LV.warns.forEach(w=>scene.remove(w.m)); LV.warns=[]; lvPub();
  if(!noTp){ const s=LV.gates[Math.max(0,G.realm)]||{x:REGIONS[G.realm*3].x,z:REGIONS[G.realm*3].z,rot:0}; P.x=s.x+Math.sin(s.rot)*6; P.z=s.z+Math.cos(s.rot)*6; P.y=0; P.vy=0; P.rot=s.rot; LV.cd=4; } if(!silent) toast("수도로 돌아왔어요",null,1.6); }
/* ---------- 수도의 라그나로크 문 ---------- */
function lvGateModel(){ const g=new THREE.Group(); const st=mat({color:0x5a5a78,roughness:.9}), gold=M.gold;
  [-1,1].forEach(k=>{ g.add(cyl(.5,.65,6.5,st,k*2.8,3.25,0,10)); g.add(sph(.55,glowMat(0xc9a0ff,.9),k*2.8,6.9,0)); });
  const arcM=mat({color:0xf2ead8,roughness:.8}); for(let k=0;k<5;k++){ const rb=new THREE.Mesh(new THREE.TorusGeometry(3.2-k*.05,.22,8,20,Math.PI),arcM); rb.position.set(0,6.4,-1+k*.5); g.add(rb); }
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.3,.2,10,40),glowMat(0xb07aff,.8)); ring.position.y=3.1; ring.userData.noOutline=true; g.add(ring); const disc=new THREE.Mesh(new THREE.CircleGeometry(2.2,40),glowMat(0x6a3aff,.3)); disc.position.y=3.1; disc.userData.noOutline=true; g.add(disc);
  g.userData.ring=ring; g.userData.disc=disc; return g; }
setTimeout(()=>{ for(let r=0;r<4;r++){ let s; try{ s=xCapSpot(r,38); }catch(e){ const c=REGIONS[r*3]; s={x:c.x+(c.x>0?-34:34),z:c.z-14,rot:0}; } XSPOT_USED.push({r,x:s.x,z:s.z,rad:6}); const g=lvGateModel(); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; g.visible=false; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); LV.gates[r]={x:s.x,z:s.z,rot:s.rot,g}; } },10);
function lvGateOpen(){ return lvLive(lvCur())||lvIsle(); }
function lvGateNear(){ if(LV.on||!lvGateOpen()) return null; if((typeof TW!=="undefined"&&TW.on)||(typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on)) return null; for(const s of LV.gates){ if(s&&Math.hypot(P.x-s.x,P.z-s.z)<5.5) return s; } return null; }
/* ---------- 카운트다운 띠 · 힘 모으기 버튼 ---------- */
function lvBand(txt,sub,p){ if(!LV.bandEl){ const b=document.createElement("div"); b.id="lvbar"; b.hidden=true; document.body.appendChild(b); b.addEventListener("pointerdown",e=>{ e.stopPropagation(); if(!LV.on&&started&&!layerOpen) showLive(); }); LV.bandEl=b;
    const st=document.createElement("style"); st.textContent=`#lvbar{position:fixed;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);z-index:6;min-width:240px;max-width:min(52vw,440px);padding:6px 14px 8px;border-radius:14px;background:linear-gradient(180deg,rgba(40,14,60,.9),rgba(14,8,34,.9));border:2px solid #c9a0ff;box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 18px rgba(176,122,255,.55);color:#fff;text-align:center;display:flex;flex-direction:column;gap:2px;cursor:pointer}#lvbar[hidden]{display:none}#lvbar b{font-size:15px;color:#e8d4ff;text-shadow:0 2px 0 #000}#lvbar span{font-size:12px;opacity:.92}#lvbar i{display:block;height:7px;border-radius:6px;background:rgba(255,255,255,.18);overflow:hidden}#lvbar i s{display:block;height:100%;background:linear-gradient(90deg,#b07aff,#ff7ab0)}
#lvPow{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 118px);transform:translateX(-50%);z-index:7;border:0;border-radius:999px;padding:14px 30px;font-size:22px;font-weight:900;font-family:inherit;color:#2a1050;background:radial-gradient(circle at 50% 35%,#fff8d0,#ffd24a 60%,#e8a020);box-shadow:0 0 0 3px #fff,0 0 30px #ffe08a,0 6px 0 #a0701a;cursor:pointer;touch-action:manipulation}#lvPow[hidden]{display:none}#lvPow.hit{animation:mtHit .25s ease-out}#lvFlash{position:fixed;inset:0;z-index:20;pointer-events:none;background:#fff;opacity:0;transition:opacity .25s}`; document.head.appendChild(st); }
  const b=LV.bandEl; if(!txt){ if(!b.hidden) b.hidden=true; return; } b.hidden=false; let top=""; const wb=$("warbar"), eb=$("evbar"); [wb,eb].forEach(x=>{ if(x&&!x.hidden){ const r=x.getBoundingClientRect(); if(r.height>0) top=Math.round(r.bottom+6)+"px"; } }); if(b._t!==top){ b._t=top; b.style.top=top; }
  const h=`<b>${txt}</b>${sub?`<span>${sub}</span>`:""}${p!=null?`<i><s style="width:${Math.round(clamp(p,0,1)*100)}%"></s></i>`:""}`; if(b._h!==h){ b._h=h; b.innerHTML=h; } }
function lvPowBtn(on){ if(!LV.btn){ const b=document.createElement("button"); b.id="lvPow"; b.type="button"; b.hidden=true; b.textContent="✨ 힘 모으기"; b.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); lvTap(); b.classList.remove("hit"); void b.offsetWidth; b.classList.add("hit"); }); document.body.appendChild(b); LV.btn=b; const f=document.createElement("div"); f.id="lvFlash"; document.body.appendChild(f); }
  if(LV.btn.hidden===on) LV.btn.hidden=!on; }
function lvTap(){ if(LV.ph!=="p3") return; const now=performance.now(); if(now-LV.tapT<120) return; LV.tapT=now; LV.p+=1; LV.dirty=true; tone(660+Math.random()*400,.05,"triangle",0,.05); fxSpark(P.x,2.5,P.z,new THREE.Color(RM().c1).getHex(),6); }
/* ---------- 신들 · 마지막 한 방 ---------- */
function lvGods(){ if(LV.gods.length) return; for(let k=0;k<4;k++){ let g; try{ g=makeAvatar(k,6,true); }catch(e){ g=new THREE.Group(); g.add(sph(1.2,glowMat(0xffffff,.9),0,2,0)); } const col=new THREE.Color(REALMS[k].c1).getHex(); g.traverse(o=>{ if(o.isMesh){ o.material=glowMat(col,.75); o.castShadow=false; o.userData.noOutline=true; } });
    const a=k/4*6.283+.785; g.position.set(LVX+Math.cos(a)*26,110,LVZ+Math.sin(a)*26); g.scale.setScalar(3.4); g.rotation.y=Math.atan2(LVX-g.position.x,LVZ-g.position.z); g.userData={a,col,show:0}; g.visible=false; scene.add(g); LV.gods.push(g);
    const bm=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,1,10,1,true),glowMat(col,.0)); bm.userData.noOutline=true; bm.visible=false; scene.add(bm); LV.beams.push(bm); } }
const _ba=new THREE.Vector3(), _bb=new THREE.Vector3();
function lvGodsTick(dt,frac,fin){ lvGods(); const H=LV.headP||{x:LVX,y:24,z:LVZ}; LV.gods.forEach((g,k)=>{ const want=fin?1:frac>=(k+1)*.25-.001?1:0; g.userData.show+=(want-g.userData.show)*Math.min(1,dt*1.5); const s=g.userData.show; g.visible=s>.02; const a=g.userData.a; g.position.set(LVX+Math.cos(a)*26,110-s*62+Math.sin(performance.now()/700+k)*.6,LVZ+Math.sin(a)*36); g.traverse(o=>{ if(o.isMesh) o.material.opacity=.75*s; });
    const bm=LV.beams[k]; const on=fin&&LV.fin.t>3&&LV.fin.t<9.5; bm.visible=on; if(on){ _ba.set(g.position.x,g.position.y+6,g.position.z); _bb.set(H.x,H.y,H.z); const len=_ba.distanceTo(_bb); bm.position.copy(_ba).add(_bb).multiplyScalar(.5); bm.scale.set(1+Math.sin(performance.now()/60)*.25+(LV.fin.t>6?1.5:0),len,1+Math.sin(performance.now()/60)*.25+(LV.fin.t>6?1.5:0)); bm.lookAt(_bb); bm.rotateX(Math.PI/2); bm.material.opacity=.7; } }); }
function lvFinTick(dt){ const F=LV.fin; if(!F.st) F.st=Date.now(); F.t=(Date.now()-F.st)/1000; const H=LV.headP||{x:LVX,y:24,z:LVZ}; lvGodsTick(dt,1,true);
  if(typeof CAMX!=="undefined"){ CAMX.on=F.t<15.5; const a=performance.now()/9000; const d=70-Math.min(F.t,10)*1.4; CAMX.pos.set(LVX+Math.sin(a)*d,24+Math.min(F.t,8)*1.6,LVZ+Math.cos(a)*d); CAMX.look.set(H.x,Math.max(4,H.y-(F.t>8.5?(F.t-8.5)*4:0)),H.z); }
  if(!F.s1&&F.t>.3){ F.s1=1; try{ lvBanner("네 세계의 신들이","✨ 하늘에서 내려와요!","모두가 모은 힘으로 마지막 한 방!","#ffe08a"); }catch(e){} jingle([523,659,784,1046,1318]); }
  if(!F.s2&&F.t>3.2){ F.s2=1; for(let k=0;k<4;k++) tone(220*(k+1),1.4,"sine",k*.1,.06); }
  if(!F.s3&&F.t>7.6){ F.s3=1; const fl=$("lvFlash"); if(fl){ fl.style.opacity=.95; setTimeout(()=>{ fl.style.opacity=0; },350); } P.shake=Math.max(P.shake||0,1.6); buzz([120,60,200]); thud(); tone(70,1.2,"sawtooth",0,.22); tone(48,1.6,"sine",.05,.25); for(let k=0;k<6;k++) setTimeout(()=>{ try{ fxSpark(H.x+rnd(-6,6),H.y-hAt(H.x,H.z)+rnd(-4,4),H.z+rnd(-6,6),[0xffe08a,0xffffff,0xc9a0ff][k%3],40); }catch(e){} },k*120); }
  if(F.t>8.5&&LV.isle){ LV.isle.position.y=Math.min(0,-14+(F.t-8.5)*2.6); if(Math.random()<dt*8) fxSpark(LVX+rnd(-10,10),rnd(0,3),LVZ+rnd(-10,10),0xbfe6ff,8); }
  if(!F.s4&&F.t>13.5){ F.s4=1; const B=lvBoss(LV.ev); try{ lvBanner("세계가 바뀌었어요!","🏝 뱀의 섬이 솟아올랐어요",`${B.n}${josa(B.n,"이","가")} 쓰러진 자리 — 이제 언제든 갈 수 있는 사냥터예요`,"#9ad88a"); }catch(e){} jingle([392,523,659,784,1046,1318,1568]); }
  if(F.t>LV_FIN/1000&&!F.done){ F.done=true; if(typeof CAMX!=="undefined") CAMX.on=false; LV.gods.forEach(g=>g.visible=false); LV.beams.forEach(b=>b.visible=false); if(F.rep){ setTimeout(()=>{ if(LV.on) card(`<h2>🌌 그날의 기록</h2><p>네 세계의 신들이 함께 내려와 큰 뱀을 물리치고, 그 자리에 <b>🏝 뱀의 섬</b>이 솟아올랐어요. 다음 라그나로크의 밤에는 꼭 함께해요!</p><button class="go" id="lvOk" style="align-self:center">좋아요!</button>`),$("lvOk").onclick=closeLayer; },400); } else lvReward(); } }
function lvGrant(e,took,st){ G.lvDone=G.lvDone||{}; if(G.lvDone[e.id]) return null; st=st||{s:0,k:0,p:0}; G.lvDone[e.id]={t:Date.now(),s:st.s,k:st.k,p:st.p,in:took?1:0}; const L=G.lv; const got=[];
  if(took){ G.lvThere=(G.lvThere||0)+1; const xp=Math.round(xpNeed(L)*.35), gold=800+L*60; gainXp(xp); G.gold+=gold; G.ore=(G.ore||0)+15; G.rune=(G.rune||0)+5; got.push(`경험치 +${fmt(xp)}`,`금화 +${fmt(gold)}`,"⛓ +15","✨ +5"); try{ if(!G.lvDeco){ G.lvDeco=1; got.push("🏡 "+hmAdd(LV_DECO,"라그나로크의 밤에")); } }catch(er){} }
  else { const gold=150+L*12; G.gold+=gold; G.lvMissed=(G.lvMissed||0)+1; got.push(`금화 +${fmt(gold)}`); }
  saveGame(); return got; }
function lvReward(){ const e=LV.ev; if(!e||e.id==="replay") return; const took=LV.s+LV.k+LV.p>0; const got=lvGrant(e,took,{s:LV.s,k:LV.k,p:LV.p}); if(!got) return; lvPub();
  const recs=lvRecs(e).sort((a,b)=>(b.s+b.k*5+b.p)-(a.s+a.k*5+a.p)).slice(0,8);
  setTimeout(()=>{ if(!LV.on) return; card(`<h2>🌌 라그나로크의 밤 — 승리!</h2><p>${lvBoss(e).n}${josa(lvBoss(e).n,"을","를")} 모두 함께 물리쳤어요! 함께한 사람 <b>${lvN(e)}명</b>.${took?" 칭호 «그날 그곳에 있었다»를 받았어요!":""}</p>
     <div class="idlegrid"><div><b>💠 ${LV.s}</b><span>내가 깬 비늘 점수</span></div><div><b>⚔ ${LV.k} · ✨ ${LV.p}</b><span>혼돈 괴물 · 모은 힘</span></div></div>
     ${got.map(t=>`<div class="row"><div class="t"><span style="font-size:14px;opacity:1">🎁 ${t}</span></div></div>`).join("")}
     <h3>함께한 사람</h3>${recs.map(x=>`<div class="row"><div class="ic" style="color:${REALMS[x.r]?REALMS[x.r].c1:"#fff"}">🌌</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>💠 ${x.s||0} · ⚔ ${x.k||0} · ✨ ${x.p||0}</span></div></div>`).join("")}
     <button class="go" id="lvOk" style="align-self:center">좋아요!</button>`); $("lvOk").onclick=closeLayer; },1800); }
/* ---------- 매 프레임 ---------- */
function lvTick(dt){ if(!started||G.realm<0) return; const tn=performance.now(); LV.cd=Math.max(0,LV.cd-dt); LV.roar=Math.max(0,(LV.roar||0)-dt);
  const e=lvCur(); const live=lvLive(e);
  // 문
  const gopen=live||lvIsle(); LV.gates.forEach(s=>{ if(!s||!s.g) return; if(s.g.visible!==gopen) s.g.visible=gopen; if(gopen){ const u=s.g.userData; u.ring.rotation.z+=dt*1.4; u.disc.material.opacity=.25+Math.sin(tn/240)*.1; } });
  if(!LV.gateLbl) LV.gateLbl=makeLabel("ally"); { const s=gopen&&!LV.on?LV.gates.find(s=>s&&Math.hypot(P.x-s.x,P.z-s.z)<30):null; if(s&&!layerOpen) placeLabel(LV.gateLbl,s.x,8.4,s.z,live?`🌌 <b>라그나로크의 문</b>`:`🏝 <b>뱀의 섬</b>`); else LV.gateLbl.style.display="none"; }
  // 띠
  if(live&&!(LV.on&&LV.ev&&LV.ev.id==="replay")){ const ph=LV.on&&LV.ev?LV.ph:lvPhase(e); const B=lvBoss(e);
    if(ph==="gather") lvBand(`🌌 라그나로크의 밤까지 ${lvLeft(e.t-Date.now())}`,LV.on?"바다 결투장에서 모두 기다려요":"눌러서 보기 · 수도의 🌌 라그나로크의 문으로 모여요",1-(e.t-Date.now())/LV_PRE);
    else if(ph==="p1") lvBand(`① 💠 ${B.n}의 비늘 깨기`,`모두의 점수 ${fmt(lvSum(e,"s"))} / ${fmt(lvGoal(e,"s"))} · 함께 ${lvN(e)}명`,lvSum(e,"s")/lvGoal(e,"s"));
    else if(ph==="p2") lvBand("② ⚔ 혼돈 괴물 막기",`모두 ${lvSum(e,"k")} / ${lvGoal(e,"k")}마리`,lvSum(e,"k")/lvGoal(e,"k"));
    else if(ph==="p3") lvBand("③ ✨ 신들의 힘 모으기",`버튼을 톡톡! ${fmt(lvSum(e,"p"))} / ${fmt(lvGoal(e,"p"))}`,lvSum(e,"p")/lvGoal(e,"p"));
    else if(ph==="finale") lvBand("✨ 네 세계의 신들이 내려와요!",null,null);
    else if(ph==="done") lvBand("🏝 승리! 뱀의 섬이 솟아올랐어요",null,null);
    else lvBand(null); }
  else lvBand(null);
  // 못 온 사람 작은 상자
  LV.claimT-=dt; if(LV.claimT<=0){ LV.claimT=20; lvPast().forEach(x=>{ G.lvDone=G.lvDone||{}; if(G.lvDone[x.id]||Date.now()-x.t>14*86400000) return; const mine=LV.ev&&LV.ev.id===x.id&&(LV.s||LV.k||LV.p)?{s:LV.s,k:LV.k,p:LV.p}:null; const got=lvGrant(x,!!mine,mine); if(!got) return; setTimeout(()=>{ toast(mine?"🌌 라그나로크의 밤 — 함께해서 고마워요!":"🌌 라그나로크의 밤이 지나갔어요",`🎁 ${got.join(" · ")}${mine?"":" · 메뉴 → 🌌에서 「그날의 기록」"}`,3.6); },1500); }); }
  if(!LV.on) return; if(!lvIn(P.x,P.z)){ lvExit(true,true); return; }
  // 결투장 안
  if(LV.ev&&LV.ev.id!=="replay"&&!lvLive(LV.ev)&&!(LV.fin&&!LV.fin.done)){ LV.ev=null; lvClearMobs(); toast("🌌 라그나로크의 밤이 끝났어요","이제 여기는 🏝 뱀의 섬이에요",2.4); if(LV.isle) LV.isle.position.y=0; }
  const ev=LV.ev; const prev=LV.ph; LV.ph=ev?(ev.id==="replay"?(LV.fin.done?"done":"finale"):lvPhase(ev)):"isle";
  if(LV.ph==="finale"&&!LV.fin&&ev){ LV.fin={e:ev.id,t:0,done:false}; lvClearMobs(); lvPowBtn(false); }
  if(prev!==LV.ph) lvOnPhase(prev,LV.ph);
  lvPoseSerpent(dt);
  if(LV.crack){ LV.crack.visible=!!ev&&LV.ph!=="done"; if(LV.crack.visible) LV.crack.children.forEach((b,i)=>{ b.material.opacity=.55+Math.sin(tn/200+i)*.35; }); }
  if(LV.rune) LV.rune.material.opacity=.25+Math.sin(tn/300)*.15;
  if(LV.ph==="p1"){ for(let s=0;s<8;s++) if(!LV.scales[s]||mobs.indexOf(LV.scales[s])<0){ if(!LV.scales[s]) lvSpawnScale(s); }
    LV.warnT-=dt; if(LV.warnT<=0){ LV.warnT=rnd(4.5,6.5); const a=rnd(0,6.283), d=rnd(0,4); const x=clamp(P.x+Math.cos(a)*d,LVX-LV_OUT,LVX+LV_OUT), z=P.z+Math.sin(a)*d; const m=new THREE.Mesh(new THREE.RingGeometry(3.2,3.8,40),glowMat(0xff4060,.85)); m.rotation.x=-Math.PI/2; m.position.set(x,.15,z); m.userData.noOutline=true; scene.add(m); LV.warns.push({m,x,z,t:1.3}); LV.roar=.8; tone(90,.4,"sawtooth",0,.08); } }
  for(let i=LV.warns.length-1;i>=0;i--){ const w=LV.warns[i]; w.t-=dt; w.m.material.opacity=.4+Math.sin(tn/60)*.4; w.m.scale.setScalar(1+(1.3-w.t)*.15); if(w.t<=0){ scene.remove(w.m); LV.warns.splice(i,1); fxRing(w.x,w.z,0x9ad88a,8,.5); fxSpark(w.x,.5,w.z,0xbfe6ff,24); P.shake=Math.max(P.shake||0,.5); thud(); if(Math.hypot(P.x-w.x,P.z-w.z)<3.8) lvHurt(stat().mhp*.14,"꼬리"); } }
  if(LV.ph==="p2"){ const n=mobs.filter(m=>m.lvm&&!m.still).length; LV.spT-=dt; if(n<Math.min(10,5+twCountPeers())&&LV.spT<=0){ LV.spT=rnd(.8,1.6); const s=lvSpot(); const d=pick(LV_CHAOS); const m=lvMob(d,clamp(G.lv+rint(-1,1),1,60),s.x,s.z,d.shape==="wolf"?1:rnd(.95,1.15)); fxSpark(s.x,1,s.z,0x8a5aff,16); } }
  if(LV.ph==="isle"){ const n=mobs.filter(m=>m.lvm).length; LV.spT-=dt; if(n<8&&LV.spT<=0){ LV.spT=rnd(1,2.2); const s=lvSpot(4); const d=pick(LV_CHAOS); lvMob(d,clamp(G.lv+rint(0,2),1,60),s.x,s.z,1); } }
  lvTickMobs(dt);
  if(LV.ph==="p3"||LV.ph==="gather"||LV.ph==="p1"||LV.ph==="p2") lvGodsTick(dt,LV.ph==="p3"&&ev?lvSum(ev,"p")/lvGoal(ev,"p"):0,false);
  lvPowBtn(LV.ph==="p3"&&!layerOpen);
  if(LV.fin&&!LV.fin.done) lvFinTick(dt);
  if(LV.dirty){ LV.pubT-=dt; if(LV.pubT<=0){ LV.pubT=2.5; LV.dirty=false; lvPub(); } }
  const ex=LV.exitArch; if(ex&&LV.cd<=0&&Math.hypot(P.x-ex.x,P.z-ex.z)<2.6&&!(LV.fin&&!LV.fin.done)){ lvExit(); return; }
  LV.amb-=dt; if(LV.amb<=0){ LV.amb=ECO()?.5:.2; fxSpark(P.x+rnd(-18,18),rnd(.3,3),P.z+rnd(-14,6),ev?0xc9a0ff:0xbfe6ff,2); }
  $("region").innerHTML=ev?`🌌 라그나로크의 바다 <b>${({gather:"곧 시작",p1:"① 비늘 깨기",p2:"② 혼돈 괴물 막기",p3:"③ 힘 모으기",finale:"✨ 마지막 한 방",done:"승리!"})[LV.ph]||""}</b>`:`🏝 뱀의 섬 <b>🐍 비늘 조각 ${G.lvBits||0}</b>`; }
function twCountPeers(){ let n=0; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&lvIn(o.x,o.z)) n++; } return n; }
function lvOnPhase(a,b){ const B=lvBoss(LV.ev);
  if(b==="p1"){ LV.roar=1.5; tone(55,1.4,"sawtooth",0,.18); P.shake=Math.max(P.shake||0,1.2); try{ lvBanner("① 비늘 깨기",`🐍 ${B.n}${josa(B.n,"이","가")} 깨어났어요!`,"뱀 둘레의 💠 수정 비늘을 때려요 · 빨간 고리가 보이면 피해요","#c9a0ff"); }catch(e){} }
  if(b==="p2"){ lvClearMobs(); try{ lvBanner("② 혼돈 괴물 막기","⚔ 바다에서 괴물이 올라와요!","모두 함께 잡아요","#ff9ab0"); }catch(e){} jingle([330,392,466,587]); }
  if(b==="p3"){ lvClearMobs(); try{ lvBanner("③ 신들의 힘 모으기","✨ 버튼을 톡톡 눌러요!","힘이 모일수록 네 세계의 신이 하나씩 내려와요","#ffe08a"); }catch(e){} jingle([523,659,784,1046]); } }
XTICK.push(lvTick);
(function(){ const _sw=showWarPrompt; showWarPrompt=function(){ if(LV.on||(typeof TW!=="undefined"&&TW.on)){ toast("⚔ 다른 곳에서 전쟁이 벌어지고 있어요","지금 있는 곳을 마치고 가 봐요",1.8); return; } _sw(); }; })();
function lvSky(dt){ const e=LV.ev; const dark=!!e&&LV.ph!=="done"; SKY.tTop.setHex(dark?0x24103a:0x4a9ae8); SKY.tBot.setHex(dark?0x7a3a6a:0xd8f0ff); const k=Math.min(1,dt*1.5); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=90; scene.fog.far=320;
  sky.position.copy(camera.position); STARS.material.opacity=dark?.6:0; STARS.position.copy(camera.position); MOON.visible=false; sun.position.set(P.x+30,95,P.z+30); sun.target.position.set(P.x,0,P.z); sun.intensity=dark?.6:1.05; sun.color.setHex(dark?0xd8b0ff:0xfff2dc); hemi.intensity=dark?.4:.5; fill.intensity=.25; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=dark?.85:.92; }
function lvMinimap(){ const ctx=mctx, S=fitCanvas(mm); const s=S*.94/(LV_OUT*2+6); const X=x=>S/2+(x-LVX)*s, Z=z=>S/2+(z-LVZ)*s;
  ctx.fillStyle="#2a4a7a"; ctx.fillRect(0,0,S,S); dot(ctx,X(LVX),Z(LVZ),LV_OUT*s,"#b8b8c8","#5a5a70",2); dot(ctx,X(LVX),Z(LVZ),LV_IN*s,lvIsle()&&!LV.ev?"#6fae58":"#2a4a7a","#5a5a70",1);
  if(LV.ev&&LV.ph!=="done") dot(ctx,X(LVX),Z(LVZ),S/14,"#7a3aff","#fff",2); if(LV.exitArch) dot(ctx,X(LV.exitArch.x),Z(LV.exitArch.z),S/26,"#ffd27a","#fff",2);
  mobs.forEach(m=>{ if(m.lvm) dot(ctx,X(m.x),Z(m.z),m.still?S/40:S/50,m.still?"#9ad8ff":"#d93025","#fff",1); }); for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&lvIn(o.x,o.z)) dot(ctx,X(o.x),Z(o.z),S/36,"#1e8e3e","#fff",1.5); }
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const a=S/20; ctx.moveTo(0,-a); ctx.lineTo(a*.7,a*.7); ctx.lineTo(0,a*.35); ctx.lineTo(-a*.7,a*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,LV.ev?"🌌 라그나로크":"🏝 뱀의 섬",S/2,S*.07,Math.round(S/12),"#fff"); }
XZONE.push({on:()=>LV.on,clamp:()=>{ if(!lvIn(P.x,P.z)){ lvExit(true,true); return false; } const r=Math.hypot(P.x-LVX,P.z-LVZ), lo=lvIsle()&&!LV.ev?.5:LV_IN+.8, hi=LV_OUT-1.2; if(r<lo||r>hi){ const k=clamp(r,lo,hi)/(r||1); P.x=LVX+(P.x-LVX)*k; P.z=LVZ+(P.z-LVZ)*k; } return true; },sky:lvSky,mm:lvMinimap});
/* ---------- 창 ---------- */
function showLive(){ const e=lvCur(), live=lvLive(e), past=lvPast(); const B=lvBoss(e); const ph=e?lvPhase(e):"none"; const done=G.lvDone||{};
  const next=e?(live?`<b style="color:#e8d4ff">지금 벌어지고 있어요!</b> ${({gather:"곧 시작해요 — 결투장에 모여요",p1:"① 비늘 깨기",p2:"② 혼돈 괴물 막기",p3:"③ 신들의 힘 모으기",finale:"마지막 한 방!",done:"승리!"})[ph]||""}`:`다음: <b style="color:#e8d4ff">${lvWhen(e.t)}</b> · ${lvLeft(e.t-Date.now())} 남음`):"";
  card(`<h2>🌌 라그나로크의 밤</h2><p>축제 시즌의 마지막 토요일 저녁 8시, <b>모든 사람의 폰에서 똑같이</b> 벌어지는 큰 사건이에요. 하늘이 갈라지고 바다에서 거대한 뱀이 솟아올라요. 네 세계 사람이 모두 한곳에 모여 함께 물리쳐요!</p>
   <p>${next}${e?` · 이번 상대: <b>${B.n}</b>`:""}</p>
   <div class="row"><div class="ic">💠</div><div class="t"><div>① 비늘 깨기</div><span>뱀 둘레의 수정 비늘을 때리면 1점, 깨면 +6 — 모두의 점수가 더해져요 · 빨간 고리(꼬리 내려치기)는 피해요</span></div></div>
   <div class="row"><div class="ic">⚔</div><div class="t"><div>② 혼돈 괴물 막기</div><span>바다에서 기어오르는 괴물을 모두 함께 잡아요</span></div></div>
   <div class="row"><div class="ic">✨</div><div class="t"><div>③ 신들의 힘 모으기</div><span>「힘 모으기」 버튼을 톡톡 — 네 세계의 신이 내려와 마지막 한 방!</span></div></div>
   <div class="row"><div class="ic">🏝</div><div class="t"><div>세계가 바뀌어요</div><span>뱀이 쓰러진 자리에 「뱀의 섬」이 솟아 언제든 갈 수 있는 사냥터가 돼요 (🐍 비늘 조각 ${G.lvBits||0}개)</span></div></div>
   <p style="font-size:13px">🎁 함께한 사람: 칭호 «그날 그곳에 있었다» · 신전 장식 «세계 뱀의 비늘» · 경험치(한 레벨의 35%)·금화·재료 · 못 온 사람도 작은 상자 + 「그날의 기록」 · 결투장에서는 쓰러지지 않아요.</p>
   <div class="exgrid">${LV.on?`<button class="buy alt" id="lvLeave">수도로 돌아가기</button>`:(live||lvIsle())?`<button class="go" id="lvGo" style="font-size:17px">${live?"🌌 결투장으로":"🏝 뱀의 섬으로"}</button>`:""}${past.length||lvIsle()?`<button class="buy alt" id="lvRep">🎬 그날의 기록</button>`:""}</div>
   ${Object.keys(done).length?`<p style="font-size:12px">지난 라그나로크: ${Object.keys(done).map(k=>`${done[k].in?"✅ 함께함":"놓침"}`).join(" · ")}</p>`:""}`);
  if($("lvGo")) $("lvGo").onclick=()=>{ closeLayer(); lvEnter(false); }; if($("lvLeave")) $("lvLeave").onclick=()=>{ closeLayer(); lvExit(); }; if($("lvRep")) $("lvRep").onclick=()=>{ closeLayer(); if(LV.on) lvExit(true,true); lvEnter(true); }; }
CTX_EXTRA.push(()=>lvGateNear()?{t:lvLive(lvCur())?"🌌 라그나로크의 결투장으로":"🏝 뱀의 섬으로",f:()=>lvEnter(false)}:null);
MENU_X.push({ic:"🌌",n:"라그나로크의 밤",id:"lvBtn",sub:()=>{ const e=lvCur(); if(!e) return "곧 다음 일정이 정해져요"; if(lvLive(e)) return "지금 벌어지고 있어요! 결투장으로"; return `다음: ${lvWhen(e.t)} · ${lvLeft(e.t-Date.now())} 남음${lvIsle()?" · 🏝 뱀의 섬 열림":""}`; },f:showLive});
const LV_DECO=DECO.length;
DECO.push({n:"세계 뱀의 비늘",ic:"🐍",t:3,sc:25,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(1.2,1.4,.5,M.marble,0,.25,0,16)); const c=new THREE.Mesh(new THREE.OctahedronGeometry(.9,0),mat({color:0x9ad88a,roughness:.25,metalness:.3,emissive:0x2a6a3a,emissiveIntensity:.5})); c.scale.set(1,1.7,1); c.position.y=2; g.add(c); return g; }});
TITLES.push({id:"lv1",n:"그날 그곳에 있었다",t:3,h:"라그나로크의 밤에 함께하기",g:()=>[G.lvThere||0,1]},{id:"lvisle",n:"뱀의 섬 사냥꾼",t:1,h:"뱀의 섬에서 괴물 50마리 잡기",g:()=>[G.lvIsleK||0,50]});
</script>
