<script>
/* ================= v56-1: 🪜 신들의 하늘 탑 — 점프로 오르는 장애물 탑 (IDEAS G11/5-4) =================
   네 수도마다 「하늘 탑 문」. 들어가면 지도 밖(x≈380, z≈-380) 구름 위 탑 아래 마당.
   기둥을 빙글빙글 감고 올라가는 30층 — 층마다 발판 2개 + 층 발판. 계급·장비·레벨 상관없이 모두 같은 점프(기술 잠김, 다치지 않음).
   층 종류: 디딤돌 · 좁은 다리 · 움직이는 발판 · 빙글 막대(맞으면 튕겨 나감) · 튕기는 버섯 · 사라지는 구름.
   5층마다 🚩 깃발(떨어지면 거기서 다시). 30층 꼭대기 종을 치면 "땡!" — 같은 탑 사람 모두에게 들리고 오늘 오른 사람 명부에 이름 + 걸린 시간.
   모양은 날짜로 정해져 모든 폰이 똑같음. 매일 3개 층이 다른 종류로 바뀜.
   탑 안 높이: 게임의 높이 계산(hAt)은 땅 높이 하나뿐이라, 탑 안에서는 내 발 높이(TW.gy+P.y)를 직접 셈 — 발판은 위로 뚫고 올라가서 내려앉는(한쪽 길) 발판.
   친구 높이는 t:"twp" 로 주고받음. 기록 보관 tw/<날>/<id> = {i,n,r,t(ms),d}. 종 소리 t:"twb".
   ※ 여기서 공용 고리도 만듦: XZONE(지도 밖 장소의 하늘·지도·울타리) · MENU_X(메뉴 줄) · xCapSpot(수도 빈자리 찾기). */
const XZONE=[];   // {on:()=>bool, clamp:()=>bool(true면 기본 울타리 안 씀), sky:dt=>{}, mm:()=>{}}
function xzOn(){ for(const z of XZONE){ try{ if(z.on()) return z; }catch(e){} } return null; }
const MENU_X=[];  // {ic, n, sub:()=>"", id, f}
function menuXRows(){ return MENU_X.map(m=>{ let s=""; try{ s=m.sub(); }catch(e){} return `<div class="row"><div class="ic">${m.ic}</div><div class="t"><div>${m.n}</div><span>${s}</span></div><button class="buy" id="${m.id}">열기</button></div>`; }).join(""); }
function menuXBind(){ MENU_X.forEach(m=>{ const b=$(m.id); if(b) b.onclick=m.f; }); }
const XSPOT_USED=[];
function xCapSpot(r,dPref){ const cap=REGIONS[r*3]; const obs=[]; const add=(x,z,rad)=>obs.push([x,z,rad]);
  try{ const f=fgSpot(r); add(f.x,f.z,7); }catch(e){} try{ const g=gdSpot(r); add(g.x,g.z,7); }catch(e){} try{ const w=wdSpot(r); add(w.x,w.z,15); }catch(e){} try{ const o=OR.spots[r]; add(o.x,o.z,8); }catch(e){} try{ const p=PG.gates[r]; add(p.x,p.z,9); }catch(e){}
  XSPOT_USED.forEach(s=>{ if(s.r===r) add(s.x,s.z,s.rad||8); });
  const A=ALTARS[cap.id]; if(A){ add(A.trial.x,A.trial.z,6); if(A.shrine){ add(A.shrine.x,A.shrine.z,11); const dir=cap.z>0?-1:1, sx=cap.x>0?-1:1; add(A.shrine.x+sx*11,A.shrine.z+dir*20,5); add(A.shrine.x,A.shrine.z+dir*16,4); } }
  add(cap.x+(cap.x>0?-18:18),cap.z+(cap.z>0?6:-6),9);
  const PR={house:6,church:9,prop:3,flag:2,market:4,castle:15}; try{ PLACED.forEach(o=>{ if(o.realm===r&&PR[o.kind]&&Math.hypot(o.x-cap.x,o.z-cap.z)<80) add(o.x,o.z,PR[o.kind]); }); }catch(e){} add(cap.x,cap.z,6);
  try{ TREEPOS.forEach(t=>{ const tx=t.x!=null?t.x:t[0], tz=t.z!=null?t.z:t[1]; if(Math.hypot(tx-cap.x,tz-cap.z)<75) add(tx,tz,3); }); }catch(e){}
  try{ const co=RC.courses[r]; add(co.S.x,co.S.z,8); co.rings.forEach(k=>{ if(Math.hypot(k.x-cap.x,k.z-cap.z)<75) add(k.x,k.z,4); }); }catch(e){}
  const dp=dPref||30; let best=null; for(let a=0;a<6.283;a+=.07) for(let d=16;d<=44;d+=2){ const x=cap.x+Math.cos(a)*d, z=cap.z+Math.sin(a)*d; if(Math.abs(x)>WORLD_HALF-10||Math.abs(z)>WORLD_HALF-10) continue; let m=99; obs.forEach(o=>{ m=Math.min(m,Math.hypot(x-o[0],z-o[1])-o[2]); }); const sc=Math.min(m,9)-Math.abs(d-dp)*.08; if(!best||sc>best.sc) best={x,z,sc}; }
  return {x:best.x,z:best.z,rot:Math.atan2(cap.x-best.x,cap.z-best.z)}; }

const TWX=380, TWZ=-380, TW_N=30, TW_R=22, TW_BASE=30;
const TW_SAY=["같이 올라가자!","여기 조심!","거의 다 왔어!","잘했어!"];
const TW_KIND={step:{n:"디딤돌",ic:"🪨"},beam:{n:"좁은 다리",ic:"🌉"},move:{n:"움직이는 발판",ic:"↔"},spin:{n:"빙글 막대",ic:"🌀"},bounce:{n:"튕기는 버섯",ic:"🍄"},vanish:{n:"사라지는 구름",ic:"☁"}};
const TW_THEME=[
 {n:"구름 계단",top:0xfffdf4,side:0xf3e2a8,rim:0xffd95e,pil:0xfff2c0,pilGlow:0xfff2a0,sky:[0x6fb8ff,0xfff6dc]},
 {n:"세계수 가지",top:0x6aa85a,side:0x7a5232,rim:0x9fd8ff,pil:0x6b4a2e,pilGlow:0x9fd8ff,sky:[0x3f6fb8,0xd8ecff]},
 {n:"메루 산 바위",top:0xe0a868,side:0xb87a48,rim:0xff9f3d,pil:0xc48a5a,pilGlow:0xffb060,sky:[0xe0905a,0xffe8c8]},
 {n:"대리석 기둥",top:0xf4efe2,side:0xd8cfbd,rim:0xffd05a,pil:0xf4efe2,pilGlow:0x9fd0ff,sky:[0x3a8cf0,0xe6f3ff]} ];
const TW={on:false,built:false,day:-1,parts:[],pl:[],gy:0,prevAbs:0,camY:0,onPl:null,lastTop:0,cp:0,st:0,t0:0,falls:0,done:false,gates:[],sayBar:null,sayOn:false,pubT:0,hudT:0,lbls:[],kT:0,ringT:0,amb:0,cd:0,gateLbl:null};
const TWO={};
function twIn(x,z){ return Math.abs(x-TWX)<150&&Math.abs(z-TWZ)<150; }
function twTh(){ return TW_THEME[Math.max(0,G.realm)]||TW_THEME[0]; }

/* ---------- 탑 모양 (날짜로 정함 — 모든 폰이 같음) ---------- */
function twTypes(day){ const rA=dgRng(9173); const T=[];
  for(let s=1;s<=TW_N;s++){ const k=s/TW_N; let t; const u=rA();
    if(s<=3) t="step"; else if(s%5===0) t=u<.5?"step":"beam"; else if(s<=8) t=u<.4?"step":u<.7?"beam":"bounce"; else t=u<.18?"step":u<.34?"beam":u<.52?"move":u<.68?"spin":u<.84?"bounce":"vanish"; T[s]=t; }
  const rD=dgRng(day*7919+13); const pool=[]; for(let s=4;s<TW_N;s++) if(s%5) pool.push(s); const kinds=["beam","move","spin","bounce","vanish"]; const today=[];
  for(let n=0;n<3;n++){ const i=Math.floor(rD()*pool.length); const s=pool.splice(i,1)[0]; let t; do{ t=kinds[Math.floor(rD()*kinds.length)]; }while(t===T[s]); T[s]=t; today.push(s); }
  return {T,today:today.sort((a,b)=>a-b)}; }
function twLayout(day){ const {T,today}=twTypes(day); const rr=dgRng(day*131+7); const L=[]; let th=Math.PI/2-.3, y=0, rPrev=0;
  const put=(o)=>{ const D=rPrev+o.rr+o.gap; th+=D/TW_R; y+=o.rise; const x=TWX+Math.cos(th)*TW_R, z=TWZ+Math.sin(th)*TW_R; const p=Object.assign({x,z,x0:x,z0:z,top:y,th,tx:-Math.sin(th),tz:Math.cos(th),rx:Math.cos(th),rz:Math.sin(th)},o); L.push(p); rPrev=o.rr; return p; };
  for(let s=1;s<=TW_N;s++){ const k=(s-1)/(TW_N-1), t=T[s]; const gap=()=>1.4+k*1.5+rr()*.5, rise=()=>1.3+k*.85+rr()*.3, R=()=>2.35-k*.6;
    if(t==="step"||t==="spin"){ for(let i=0;i<(t==="spin"?1:2);i++){ const r=R(); put({sh:"c",r,rr:r,gap:gap(),rise:rise(),kind:"step",s}); } }
    else if(t==="beam"){ for(let i=0;i<2;i++){ const hl=2.6, hw=.75-k*.2; put({sh:"b",hl,hw,rr:hl,gap:gap()*.8,rise:rise()*.8,kind:"beam",s}); } }
    else if(t==="move"){ for(let i=0;i<2;i++){ const r=R()+.15; put({sh:"c",r,rr:r,gap:gap()+1.4,rise:rise(),kind:"move",s,amp:1.7+k*.7,w:1.1+k*.5+i*.15,ph:rr()*6.28}); } }
    else if(t==="bounce"){ put({sh:"c",r:1.55,rr:1.55,gap:gap(),rise:.3,kind:"bounce",s}); const r=R(); put({sh:"c",r,rr:r,gap:1.6+k*.6,rise:5.6+k*.6,kind:"step",s}); }
    else if(t==="vanish"){ for(let i=0;i<3;i++){ const r=1.9-k*.3; put({sh:"c",r,rr:r,gap:gap()*.85,rise:rise()*.8,kind:"vanish",s,vt:0,gone:0}); } }
    // 층 발판 (5층마다 깃발 · 30층 꼭대기)
    const isTop=s===TW_N, cpk=s%5===0&&!isTop, spin=t==="spin"; const r=isTop?5:spin?3.7:cpk?3.2:2.8;
    put({sh:"c",r,rr:r,gap:gap()*(spin?1:.9),rise:rise(),kind:spin?"spin":"land",s,land:1,cp:cpk?1:0,isTop:isTop?1:0,w:spin?(1.15+k*1.1)*(rr()<.5?1:-1):0}); }
  return {L,T,today}; }
function twLanding(s){ return TW.pl.find(p=>p.land&&p.s===s)||null; }

/* ---------- 만들기 ---------- */
function twMatC(c,o){ return mat(Object.assign({color:c,roughness:.8},o||{})); }
function twBuild(){ const day=kday(); if(TW.built&&TW.day===day) return; twClear(); TW.built=true; TW.day=day; const lay=twLayout(day); TW.pl=lay.L; TW.T=lay.T; TW.today=lay.today;
  const th=twTh(); const add=o=>{ scene.add(o); TW.parts.push(o); return o; };
  const mTop=twMatC(th.top), mSide=twMatC(th.side), mRim=mat({color:th.rim,metalness:.4,roughness:.4}), mCloud=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.95});
  const G0=new THREE.Group();
  // 마당(출발점) + 남쪽 돌아가는 문
  G0.add(cyl(TW_BASE,TW_BASE-1.5,3,mSide,TWX,-1.5,TWZ,40)); const fl=cyl(TW_BASE-.4,TW_BASE-.4,.12,mTop,TWX,.02,TWZ,40); G0.add(fl);
  const ring=new THREE.Mesh(new THREE.RingGeometry(TW_BASE-1.2,TW_BASE-.5,64),glowMat(th.rim,.35)); ring.rotation.x=-Math.PI/2; ring.position.set(TWX,.1,TWZ); ring.userData.noOutline=true; G0.add(ring);
  // 가운데 기둥
  const topY=TW.pl[TW.pl.length-1].top; const pil=cyl(3.2,3.6,topY+8,twMatC(th.pil),TWX,(topY+8)/2-2,TWZ,20); G0.add(pil);
  for(let y=6;y<topY;y+=14){ const b=new THREE.Mesh(new THREE.TorusGeometry(3.45,.22,8,28),glowMat(th.pilGlow,.55)); b.rotation.x=Math.PI/2; b.position.set(TWX,y,TWZ); b.userData.noOutline=true; G0.add(b); }
  if(G.realm===1){ for(let k=0;k<8;k++){ const a=k/8*6.283; const br=cyl(.5,.9,9,twMatC(0x6b4a2e),TWX+Math.cos(a)*4.5,topY+4+Math.sin(k)*2,TWZ+Math.sin(a)*4.5,6); br.rotation.z=Math.cos(a)*.9; br.rotation.x=Math.sin(a)*.9; G0.add(br); const lf=sph(3.2,twMatC(0x5a9a4a),TWX+Math.cos(a)*8,topY+8+Math.sin(k*3)*1.5,TWZ+Math.sin(a)*8); lf.scale.y*=.55; G0.add(lf); } }
  add(shadowify(G0));
  // 돌아가는 문
  { const g=pgArch(false); g.position.set(TWX,0,TWZ-TW_BASE+4); add(shadowify(g)); TW.exitArch={x:TWX,z:TWZ-TW_BASE+4,g}; }
  // 발판들
  TW.pl.forEach((p,i)=>{ let m; const tk=.8;
    if(p.sh==="b"){ m=new THREE.Group(); m.add(box(p.hw*2,tk,p.hl*2,mSide,0,-tk/2-.02,0)); m.add(box(p.hw*2+.04,.12,p.hl*2+.04,mTop,0,0,0)); [-1,1].forEach(k=>m.add(box(.14,.16,p.hl*2,mRim,k*p.hw,.04,0))); m.rotation.y=Math.atan2(p.tx,p.tz); }
    else if(p.kind==="bounce"){ m=new THREE.Group(); m.add(cyl(.45,.6,1.2,twMatC(0xf4ead2),0,-.6,0,10)); const cap=sph(p.r,mat({color:0xff4a5a,roughness:.5,emissive:0x501010}),0,-.1,0); cap.scale.y*=.45; m.add(cap); for(let k=0;k<6;k++){ const a=k/6*6.283; m.add(sph(.22,twMatC(0xffffff),Math.cos(a)*p.r*.6,.12,Math.sin(a)*p.r*.6)); } const rg=new THREE.Mesh(new THREE.RingGeometry(p.r*.9,p.r*1.1,32),glowMat(0xff9ab0,.6)); rg.rotation.x=-Math.PI/2; rg.position.y=.18; rg.userData.noOutline=true; m.add(rg); p.glow=rg; }
    else if(p.kind==="vanish"){ m=new THREE.Group(); const mm=mCloud.clone(); for(let k=0;k<5;k++){ const a=k/5*6.283; const c=sph(p.r*.62,mm,Math.cos(a)*p.r*.45,-.35,Math.sin(a)*p.r*.45); c.scale.y*=.5; m.add(c); } const c0=sph(p.r*.8,mm,0,-.25,0); c0.scale.y*=.45; m.add(c0); p.cmat=mm; }
    else { m=new THREE.Group(); const isTop=p.isTop; m.add(cyl(p.r,p.r*.88,tk,mSide,0,-tk/2-.02,0,isTop?32:20)); m.add(cyl(p.r+.02,p.r+.02,.12,mTop,0,0,0,isTop?32:20));
      const rim=new THREE.Mesh(new THREE.TorusGeometry(p.r,.09,6,isTop?48:28),p.kind==="move"?glowMat(0x7af0ff,.8):mRim); rim.rotation.x=Math.PI/2; rim.position.y=.05; if(p.kind==="move") rim.userData.noOutline=true; m.add(rim);
      if(p.land&&!isTop){ const n=sph(.32,glowMat(th.rim,.85),0,.6,0); n.userData.noOutline=true; n.visible=false; m.add(n); }
      if(p.cp){ m.add(cyl(.09,.09,4.2,M.gold,p.r-.6,2.1,0,6)); const fg=box(.08,1.3,1.9,mat({color:new THREE.Color(RM().c1),roughness:.8}),p.r-.6,3.5,.95); fg.userData.flag=1; m.add(fg); p.flag=fg; }
      if(p.kind==="spin"){ const bar=new THREE.Group(); bar.add(box(p.r*2+.6,.42,.42,mat({color:0xff6a3a,roughness:.5,emissive:0x401000}),0,0,0)); bar.add(cyl(.45,.55,.5,M.gold,0,-.2,0,10)); [-1,1].forEach(k=>{ const b=sph(.32,glowMat(0xffc070,.9),k*(p.r+.3),0,0); b.userData.noOutline=true; bar.add(b); }); bar.position.y=.62; m.add(bar); p.bar=bar; }
      if(isTop){ // 종 + 지붕
        const g=new THREE.Group(); [0,1,2,3].forEach(k=>{ const a=k/4*6.283+.78; g.add(cyl(.28,.32,5.5,M.gold,Math.cos(a)*3.4,2.75,Math.sin(a)*3.4,8)); }); const roof=new THREE.Mesh(new THREE.ConeGeometry(4.6,2.4,4),mRim); roof.rotation.y=.78; roof.position.y=6.6; g.add(roof);
        const bell=new THREE.Group(); const bm=mat({color:0xffc23a,metalness:.75,roughness:.28,emissive:0x3a2200}); const bb=cyl(.75,1.35,1.8,bm,0,-1,0,18); bell.add(bb); bell.add(sph(.55,bm,0,-.1,0)); bell.add(sph(.25,twMatC(0x8a5a1a),0,-2.05,0)); bell.position.y=5.2; g.add(bell); p.bell=bell;
        const halo=new THREE.Mesh(new THREE.RingGeometry(4.2,4.9,48),glowMat(0xffe08a,.4)); halo.rotation.x=-Math.PI/2; halo.position.y=.12; halo.userData.noOutline=true; g.add(halo); p.halo=halo; m.add(g); } }
    m.position.set(p.x,p.top,p.z); m.userData.cullR=-1; add(shadowify(m)); p.mesh=m; p.i=i; });
  // 구름 바다 · 떠다니는 구름
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(520,520),new THREE.MeshBasicMaterial({color:0xf4f9ff,transparent:true,opacity:.93})); sea.rotation.x=-Math.PI/2; sea.position.set(TWX,-34,TWZ); add(sea);
  const cm=twMatC(0xffffff,{roughness:1}); const CN=ECO()?18:40; for(let k=0;k<CN;k++){ const a=rnd(0,6.283), d=rnd(36,110), y=k<CN*.4?rnd(-32,-26):rnd(-10,topY+20); const c=sph(rnd(3,8),cm,TWX+Math.cos(a)*d,y,TWZ+Math.sin(a)*d); c.scale.y*=.42; c.userData.v=rnd(.5,1.5); c.userData.a=a; c.userData.d=d; add(c); }
  TW.parts.forEach(o=>o.traverse(m=>{ if(m.material&&m.material.blending===THREE.AdditiveBlending){ m.castShadow=false; m.userData.noOutline=true; } })); }
function twClear(){ TW.parts.forEach(o=>scene.remove(o)); TW.parts=[]; TW.pl=[]; TW.built=false; TW.lbls.forEach(l=>l.remove()); TW.lbls=[]; }
function twShow(v){ TW.parts.forEach(o=>{ o.visible=v; }); }

/* ---------- 수도의 하늘 탑 문 ---------- */
function twGateModel(){ const g=new THREE.Group(); const th=twTh(); const st=twMatC(th.side), tp=twMatC(th.top), gold=M.gold;
  g.add(cyl(3.2,3.6,.6,st,0,.3,0,20)); g.add(cyl(3.25,3.25,.1,tp,0,.62,0,20));
  for(let k=0;k<6;k++){ const a=k/6*6.283; const s=cyl(.75,.75,.35,k%2?tp:st,Math.cos(a)*2,1.1+k*.85,Math.sin(a)*2,10); g.add(s); }
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.3,.18,10,40),glowMat(0x9fd8ff,.75)); ring.position.y=3.2; ring.userData.noOutline=true; g.add(ring);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(2.2,40),glowMat(0xbfe6ff,.25)); disc.position.y=3.2; disc.userData.noOutline=true; g.add(disc);
  g.add(cyl(.12,.12,7.6,gold,0,3.8,0,6)); const top=sph(.5,glowMat(0xffe08a,.95),0,7.8,0); top.userData.noOutline=true; g.add(top);
  const bell=cyl(.35,.6,.8,mat({color:0xffc23a,metalness:.7,roughness:.3}),0,6.9,0,12); g.add(bell);
  g.userData.ring=ring; g.userData.disc=disc; return g; }
setTimeout(()=>{ for(let r=0;r<4;r++){ let s; try{ s=xCapSpot(r,34); }catch(e){ const c=REGIONS[r*3]; s={x:c.x+(c.x>0?-30:30),z:c.z+8,rot:0}; } XSPOT_USED.push({r,x:s.x,z:s.z,rad:6}); const g=twGateModel(); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); TW.gates[r]={x:s.x,z:s.z,rot:s.rot,g}; } },0);
function twGateNear(){ if(TW.on||(typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on)) return null; for(const s of TW.gates){ if(s&&Math.hypot(P.x-s.x,P.z-s.z)<5.5) return s; } return null; }

/* ---------- 들어가기 · 나가기 ---------- */
function twBusyExit(){ closeLayer(); try{ if(DG.on) dgExit(true); }catch(e){} try{ if(HM.on) hmExit(); }catch(e){} try{ if(DS.on) dsExit(true,true); }catch(e){} try{ if(PG.on) pgExit(true,true); }catch(e){} try{ if(typeof RC!=="undefined"&&RC.on) rcEnd(false); }catch(e){} try{ if(P.ride) rdSet(false); }catch(e){} try{ if(typeof LV!=="undefined"&&LV.on) lvExit(true,true); }catch(e){} }
function twEnter(){ if(TW.on||P.dead) return; if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  twBusyExit(); twBuild(); twShow(true); TW.on=true; twStart(); G.twIn=(G.twIn||0)+1; saveGame();
  const td=TW.today.map(s=>`${s}층 ${TW_KIND[TW.T[s]].ic}`).join(" · ");
  try{ lvBanner(twTh().n,"🪜 신들의 하늘 탑",`30층 꼭대기 종을 쳐요 · 5층마다 🚩 깃발 · 오늘 바뀐 층: ${td}`,"#9fd8ff"); }catch(e){ toast("🪜 신들의 하늘 탑"); } fxRing(P.x,P.z,0x9fd8ff,8,.8); fxSpark(P.x,2,P.z,0xbfe6ff,30); jingle([523,659,784,1046]); }
function twStart(){ P.x=TWX+rnd(4,7); P.z=TWZ+12; P.y=0; P.vy=0; P.air=0; P.rot=0; P.guide=null; $("guide").hidden=true; TW.gy=0; TW.prevAbs=0; TW.camY=0; TW.lastTop=0; TW.onPl=null; TW.cp=0; TW.st=0; TW.t0=0; TW.falls=0; TW.done=false; TW.cd=2.5; TW.pl.forEach(p=>{ p.vt=0; p.gone=0; }); }
function twExit(silent,noTp){ if(!TW.on) return; TW.on=false; twShow(false); twSay(false); if(TW.gateLbl) TW.gateLbl.style.display="none"; TW.lbls.forEach(l=>l.style.display="none");
  if(!noTp){ const s=TW.gates[Math.max(0,G.realm)]||{x:REGIONS[G.realm*3].x,z:REGIONS[G.realm*3].z,rot:0}; P.x=s.x+Math.sin(s.rot)*6; P.z=s.z+Math.cos(s.rot)*6; P.y=0; P.vy=0; P.rot=s.rot; TW.cd=4; } P.gy=hAt(P.x,P.z); if(!silent) toast("수도로 돌아왔어요","하늘 탑 문은 언제든 열려 있어요",2); }
(function(){ const _sh=spawnAtHome; spawnAtHome=function(){ if(TW.on) twExit(true,true); _sh(); };
  const _hp=hurtPlayer; hurtPlayer=function(d,f){ if(TW.on) return; return _hp(d,f); };
  const _us=useSkill; useSkill=function(i){ if(TW.on){ toast("🪜 하늘 탑에서는 모두 같은 힘!","점프 두 번(2단 점프)으로 올라가요",1.4); return; } return _us(i); };
  const _h=hAt; hAt=function(x,z){ if(!twIn(x,z)) return _h(x,z); if(x===P.x&&z===P.z) return TW.on?TW.gy+P.y:0; for(const id in PEERS){ const o=PEERS[id]; if(o.x===x&&o.z===z&&o.twT&&performance.now()-o.twT<3000) return o.twY; } return TW.on?TW.gy:0; };
  try{ const _fz=frZone; frZone=function(x,z){ return twIn(x,z)?"🪜 신들의 하늘 탑":_fz(x,z); }; const _fa=frArea; frArea=function(x,z){ return twIn(x,z)?"tw":_fa(x,z); }; }catch(e){} })();

/* ---------- 발판 높이 ---------- */
function twOver(p,x,z,pad){ const dx=x-p.x, dz=z-p.z; if(p.sh==="b"){ const a=dx*p.tx+dz*p.tz, c=dx*p.rx+dz*p.rz; return Math.abs(a)<=p.hl+pad&&Math.abs(c)<=p.hw+pad; } return dx*dx+dz*dz<=(p.r+pad)*(p.r+pad); }
function twGround(x,z,ref){ let best=-60, bp=null; if(Math.hypot(x-TWX,z-TWZ)<TW_BASE-.3){ best=0; }
  for(const p of TW.pl){ if(p.gone) continue; if(p.top>ref+.4||p.top<=best) continue; if(twOver(p,x,z,.25)){ best=p.top; bp=p; } }
  return {y:best,p:bp}; }
/* ---------- 매 프레임 ---------- */
function twAnim(dt){ const t=Date.now()/1000, tn=performance.now();
  TW.pl.forEach(p=>{ if(p.kind==="move"){ const o=Math.sin(t*p.w+p.ph)*p.amp; const nx=p.x0+p.tx*o, nz=p.z0+p.tz*o; p.dx=nx-p.x; p.dz=nz-p.z; p.x=nx; p.z=nz; p.mesh.position.set(nx,p.top,nz); }
    else if(p.kind==="spin"&&p.bar){ p.ang=t*p.w; p.bar.rotation.y=-p.ang; }
    else if(p.kind==="bounce"&&p.glow){ p.glow.material.opacity=.45+Math.sin(tn/180+p.i)*.25; if(p.sq>0){ p.sq-=dt; const k=1-Math.sin(Math.min(1,p.sq/.25)*Math.PI)*.3; p.mesh.scale.set(1/k*.9+.1,k,1/k*.9+.1); } else p.mesh.scale.set(1,1,1); }
    else if(p.kind==="vanish"){ if(p.gone){ p.gone-=dt; if(p.gone<=0){ p.gone=0; p.vt=0; p.mesh.visible=true; p.cmat.opacity=.95; p.mesh.position.set(p.x,p.top,p.z); } } else if(p.vt>0){ const f=Math.max(0,1-(p.vt-.7)/.7); p.cmat.opacity=.95*Math.min(1,f+.15); p.mesh.position.set(p.x+(p.vt>.5?rnd(-.08,.08):0),p.top,p.z+(p.vt>.5?rnd(-.08,.08):0)); if(p.vt>=1.4){ p.gone=2.6; p.mesh.visible=false; fxSpark(p.x,p.top-hAt(p.x,p.z)+.2,p.z,0xffffff,10); if(TW.onPl===p) TW.onPl=null; } } }
    if(p.isTop&&p.bell){ p.bell.rotation.z=Math.sin(tn/600)*.08+(p.ring>0?Math.sin(p.ring*18)*p.ring*.6:0); if(p.ring>0) p.ring=Math.max(0,p.ring-dt); if(p.halo) p.halo.rotation.z+=dt*.4; }
    if(p.flag) p.flag.rotation.y=Math.sin(tn/400+p.i)*.25; });
  TW.parts.forEach(o=>{ if(o.userData&&o.userData.v&&o.userData.d){ o.userData.a+=dt*o.userData.v*.01; o.position.x=TWX+Math.cos(o.userData.a)*o.userData.d; o.position.z=TWZ+Math.sin(o.userData.a)*o.userData.d; } }); }
function twTick(dt){ if(TW.gates.length) twGateTick(dt); if(!TW.on) return; if(!twIn(P.x,P.z)){ twExit(true,true); return; } TW.cd=Math.max(0,TW.cd-dt);
  twAnim(dt);
  // 움직이는 발판에 실려 가기
  if(TW.onPl&&TW.onPl.kind==="move"&&P.y<=.01){ P.x+=TW.onPl.dx||0; P.z+=TW.onPl.dz||0; }
  // 가운데 기둥 밀어내기
  { const dx=P.x-TWX, dz=P.z-TWZ, d=Math.hypot(dx,dz); if(d<3.9&&d>0){ P.x=TWX+dx/d*3.9; P.z=TWZ+dz/d*3.9; } }
  let abs=TW.gy+P.y; const ref=Math.max(TW.prevAbs,abs); const g=twGround(P.x,P.z,ref); const was=TW.onPl;
  if(abs<=g.y+.001&&P.vy<=0){ P.y=0; P.vy=0; P.air=0; TW.gy=g.y; abs=g.y; TW.lastTop=g.y; if(g.p!==was){ TW.onPl=g.p; if(g.p) twLand(g.p); else if(g.y===0&&TW.prevAbs>1.2) fxRing(P.x,P.z,0xffffff,3,.3); } }
  else { if(was&&P.y<=.01&&P.vy<=0&&P.air===0) P.air=1; TW.onPl=null; TW.gy=g.y; P.y=abs-g.y; }
  if(TW.onPl&&TW.onPl.kind==="vanish") TW.onPl.vt+=dt;
  if(!TW.t0&&TW.onPl) TW.t0=Date.now();
  // 빙글 막대
  TW.kT=Math.max(0,TW.kT-dt); const sp=TW.pl.find(p=>p.kind==="spin"&&Math.abs(abs-p.top)<1.2&&Math.hypot(P.x-p.x,P.z-p.z)<p.r+.6);
  if(sp&&TW.kT<=0){ const dx=P.x-sp.x, dz=P.z-sp.z, a=sp.ang||0; const bx=Math.cos(a), bz=Math.sin(a); const along=dx*bx+dz*bz, perp=dx*(-bz)+dz*bx; if(Math.abs(perp)<.75&&Math.abs(along)<sp.r+.5&&abs<sp.top+1.05){
      TW.kT=.9; const s=Math.sign(sp.w)*(Math.sign(along)||1); const nx=-bz*s, nz=bx*s; P.dashT=.22; P.dashX=nx*9/.22*.5; P.dashZ=nz*9/.22*.5; P.vy=9; P.y=Math.max(P.y,.05); P.air=1; TW.onPl=null; P.shake=Math.max(P.shake||0,.5); thud(); buzz(40); fxSpark(P.x,1.2,P.z,0xffc070,16); toast("🌀 빙글 막대에 맞았어요!","막대가 오기 전에 점프!",1.2); } }
  // 떨어지면 깃발로
  const cpP=TW.cp?twLanding(TW.cp):null, cpY=cpP?cpP.top:0;
  if(abs<cpY-14||abs<-10){ TW.falls++; G.twFall=(G.twFall||0)+1; twRespawn(); abs=TW.gy; }
  TW.prevAbs=abs;
  // 내 몸 높이 고치기 + 카메라 높이(점프할 때 흔들리지 않게)
  player.position.y=TW.gy+P.y; const ct=P.y<=.01?TW.gy:Math.min(TW.lastTop,abs);
  TW.camY+=(ct-TW.camY)*Math.min(1,dt*(abs<TW.camY-3?9:4)); P.gy=TW.camY;
  // 친구에게 내 높이
  TW.pubT-=dt; if(TW.pubT<=0){ TW.pubT=ECO()?.35:.22; try{ net.send({t:"twp",y:+(TW.gy+P.y).toFixed(2)}); }catch(e){} }
  for(const id in PEERS){ const o=PEERS[id]; if(o.twT&&twIn(o.x,o.z)&&performance.now()-o.twT<3000&&o.mesh) o.mesh.position.y=o.twY; }
  // 층 이름표 · 문 이름표 · 화면 글씨
  TW.hudT-=dt; if(TW.hudT<=0){ TW.hudT=.2; twHud(abs); }
  twSay(!layerOpen&&!P.dead&&twPeers().length>0);
  const ex=TW.exitArch; if(ex&&TW.cd<=0&&Math.hypot(P.x-ex.x,P.z-ex.z)<2.6&&abs<1){ twExit(); return; }
  TW.amb-=dt; if(TW.amb<=0){ TW.amb=ECO()?.6:.25; fxSpark(P.x+rnd(-14,14),rnd(-2,6),P.z+rnd(-14,14),0xffffff,2); } }
XTICK.push(twTick);
function twLand(p){ TW.lastTop=p.top;
  if(p.kind==="bounce"){ P.vy=21; P.y=.02; P.air=1; TW.onPl=null; p.sq=.25; tone(220,.08,"sine"); tone(440,.12,"sine",.05); tone(880,.1,"triangle",.11); fxRing(p.x,p.z,0xff9ab0,4,.4); return; }
  if(p.land&&p.s>TW.st){ TW.st=p.s; if(!p.isTop){ tone(660+p.s*12,.08,"triangle"); floatDmg(P.x,3,P.z,`${p.s}층`,"gain"); } if(p.s>=5&&p.s%5===0&&!p.isTop){ TW.cp=p.s; jingle([659,784,988]); fxRing(p.x,p.z,new THREE.Color(RM().c1).getHex(),6,.7); toast(`🚩 ${p.s}층 깃발!`,"떨어지면 여기서 다시 시작해요",1.8); } }
  if(p.isTop&&!TW.done) twFinish(p); }
function twRespawn(){ const p=TW.cp?twLanding(TW.cp):null; if(p){ P.x=p.x-p.tx*.5; P.z=p.z-p.tz*.5; TW.gy=p.top; TW.onPl=p; TW.lastTop=p.top; } else { P.x=TWX+rnd(4,7); P.z=TWZ+12; TW.gy=0; TW.onPl=null; TW.lastTop=0; } P.y=0; P.vy=0; P.air=0; P.dashT=0; TW.prevAbs=TW.gy; TW.camY=TW.gy; P.invul=Math.max(P.invul,.6); fxRing(P.x,P.z,0x9fd8ff,4,.6); tone(330,.1,"triangle"); tone(262,.12,"triangle",.08); toast(TW.cp?`🚩 ${TW.cp}층 깃발에서 다시!`:"처음부터 다시!","괜찮아요, 또 해 봐요",1.2); }
function twFmt(ms){ const s=Math.floor(ms/1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function twFinish(p){ TW.done=true; const ms=Math.max(1000,Date.now()-(TW.t0||Date.now())); p.ring=2; const day=kday();
  for(let k=0;k<3;k++){ tone(523,.9,"sine",k*.55,.12); tone(1046,.7,"sine",k*.55+.01,.06); tone(1568,.5,"triangle",k*.55+.02,.03); }
  fxRing(p.x,p.z,0xffe08a,12,1.2); fxSpark(P.x,3,P.z,0xffe08a,50); P.shake=Math.max(P.shake||0,.4);
  const d=twData(); const first=!d.n, newDay=d.day!==day; d.n=(d.n||0)+1; if(newDay){ d.day=day; d.dn=0; d.today=0; d.days=(d.days||0)+1; } d.dn=(d.dn||0)+1; const best=!d.best||ms<d.best; if(best) d.best=ms; const bestToday=!d.today||ms<d.today; if(bestToday) d.today=ms;
  const L=G.lv; const got=[]; if(d.dn===1){ const xp=Math.round(xpNeed(L)*.15), gold=200+L*25; gainXp(xp); G.gold+=gold; G.ore=(G.ore||0)+6; G.rune=(G.rune||0)+2; got.push(`경험치 +${fmt(xp)}`,`금화 +${fmt(gold)}`,"⛓ +6","✨ +2"); } else { const gold=40+L*4; G.gold+=gold; got.push(`금화 +${fmt(gold)} (오늘 ${d.dn}번째)`); }
  if(first){ try{ got.push("🏡 "+hmAdd(TW_DECO,"하늘 탑 꼭대기에서")); }catch(e){} }
  saveGame(); if(bestToday) try{ net.pushRet("tw/"+day+"/"+G.id,{i:G.id,n:G.name,r:G.realm,t:ms,d:day}); }catch(e){}
  try{ net.send({t:"twb",ms}); }catch(e){}
  try{ lvBanner("땡! 땡! 땡!","🔔 꼭대기에 올랐어요!",`${twFmt(ms)} 걸렸어요${best?" · 🏆 내 최고 기록!":""} · 떨어진 횟수 ${TW.falls}번`,"#ffe08a"); }catch(e){}
  setTimeout(()=>{ if(!TW.on) return; card(`<h2>🔔 하늘 탑 꼭대기!</h2><p>${twTh().n} 30층을 <b style="color:var(--gold)">${twFmt(ms)}</b> 만에 올랐어요.${best?" 🏆 내 최고 기록!":""}</p>
     <div class="idlegrid"><div><b>${twFmt(d.best)}</b><span>내 최고 기록</span></div><div><b>${d.n}번</b><span>꼭대기에 오른 횟수</span></div></div>
     ${got.map(t=>`<div class="row"><div class="t"><span style="font-size:14px;opacity:1">🎁 ${t}</span></div></div>`).join("")}
     <div class="exgrid"><button class="go" id="twAgain">🪜 처음부터 다시</button><button class="buy alt" id="twOut">수도로 돌아가기</button></div><button class="buy alt" id="twBoard" style="align-self:center">오늘의 명부 보기</button>`);
    $("twAgain").onclick=()=>{ closeLayer(); twStart(); toast("🪜 다시 출발!","시간은 첫 발판을 밟으면 시작해요",1.6); }; $("twOut").onclick=()=>{ closeLayer(); twExit(); }; $("twBoard").onclick=()=>showTower(); },2600); }
function twData(){ G.tw=G.tw||{}; return G.tw; }
NETR.twp=(o,d)=>{ if(typeof d.y!=="number") return; o.twY=d.y; o.twT=performance.now(); };
NETR.twb=(o,d)=>{ const near=TW.on||TW.gates.some(s=>s&&Math.hypot(P.x-s.x,P.z-s.z)<40); if(!near) return; toast(`🔔 땡! ${o.name}님이 하늘 탑 꼭대기에 올랐어요!`,d.ms?twFmt(d.ms)+" 걸렸어요":null,2.2); tone(523,.8,"sine",0,.06); tone(1046,.6,"sine",.02,.03); };
NETX.push({sub:()=>"tw/"+kday()+"/+",pre:"tw/",f:(d)=>{ if(!d||!d.i||d.i===G.id||d.d!==kday()||!(d.t>0)) return; TWO[d.i]=d; }});
function twPeers(){ const L=[]; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&twIn(o.x,o.z)) L.push(o); } return L; }
function twBoard(){ const L=[]; const day=kday(); for(const id in TWO){ const o=TWO[id]; if(o.d===day) L.push(o); } const d=twData(); if(d.day===day&&d.today) L.push({n:G.name,r:G.realm,t:d.today,me:1}); L.sort((a,b)=>a.t-b.t); return L; }
function twHud(abs){ const near=TW.pl.filter(p=>p.land&&!p.isTop&&p.top>abs-2&&p.top<abs+16).slice(0,3);
  while(TW.lbls.length<3) TW.lbls.push(makeLabel("ally")); TW.lbls.forEach((l,i)=>{ const p=near[i]; if(p&&!layerOpen) placeLabel(l,p.x,p.top-hAt(p.x,p.z)+(p.cp?4.8:1.6),p.z,`${p.cp?"🚩 ":""}<b>${p.s}층</b>${p.kind==="spin"?" 🌀":""}`); else l.style.display="none"; });
  const t=TW.t0?twFmt(Date.now()-TW.t0):"0:00"; const nx=TW.T[Math.min(TW_N,TW.st+1)]; $("region").innerHTML=`🪜 하늘 탑 <b>${TW.st}/${TW_N}층 · ⏱ ${t}${TW.cp?` · 🚩 ${TW.cp}층`:""}${!TW.done&&nx?` · 다음: ${TW_KIND[nx].ic} ${TW_KIND[nx].n}`:""}</b>`; }
function twSay(on){ if(!TW.sayBar){ const b=document.createElement("div"); b.id="twBar"; b.hidden=true; b.innerHTML=`<span class="mth">🪜</span>`+TW_SAY.map((m,i)=>`<button type="button" data-m="${i}">${m}</button>`).join(""); document.body.appendChild(b); TW.sayBar=b;
    b.querySelectorAll("button").forEach(x=>x.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); const m=TW_SAY[+x.dataset.m]; try{ net.send({t:"say",m}); net.chat(G.name,m,G.realm); }catch(er){} x.classList.remove("hit"); void x.offsetWidth; x.classList.add("hit"); })); b.addEventListener("pointerdown",e=>e.stopPropagation());
    const st=document.createElement("style"); st.textContent=`#twBar{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 96px);transform:translateX(-50%);z-index:6;display:flex;gap:4px;max-width:min(470px,60vw);overflow-x:auto;scrollbar-width:none;padding:5px 8px;border-radius:14px;background:rgba(20,40,70,.55);border:1px solid rgba(159,216,255,.5)}#twBar[hidden]{display:none}#twBar .mth{font-size:14px;align-self:center}#twBar button{flex:none;border:0;border-radius:999px;padding:4px 8px;font-size:12px;font-family:inherit;background:#e8f4ff;color:#173050;box-shadow:0 2px 0 #4a7aa8;cursor:pointer}#twBar button.hit{animation:mtHit .35s ease-out}`; document.head.appendChild(st); }
  if(TW.sayOn!==on){ TW.sayOn=on; TW.sayBar.hidden=!on; } }
function twGateTick(dt){ const tn=performance.now(); TW.gates.forEach(s=>{ if(!s||!s.g) return; const u=s.g.userData; if(u.ring) u.ring.rotation.z+=dt*1.2; if(u.disc) u.disc.material.opacity=.22+Math.sin(tn/260)*.08; });
  TW.ringT-=dt; if(TW.ringT>0) return; TW.ringT=.25; if(!TW.gateLbl) TW.gateLbl=makeLabel("ally"); const s=TW.on?null:TW.gates.find(s=>s&&Math.hypot(P.x-s.x,P.z-s.z)<30); if(s&&!layerOpen&&started) placeLabel(TW.gateLbl,s.x,8.8,s.z,`🪜 <b>하늘 탑</b>`); else TW.gateLbl.style.display="none"; }
/* ---------- 하늘 · 작은 지도 · 울타리 ---------- */
function twSky(dt){ const th=twTh(); SKY.tTop.setHex(th.sky[0]); SKY.tBot.setHex(th.sky[1]); const k=Math.min(1,dt*2); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=110; scene.fog.far=420;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+30,(P.gy||0)+95,P.z+30); sun.target.position.set(P.x,P.gy||0,P.z); sun.intensity=1.05; sun.color.setHex(0xfff2dc); hemi.intensity=.55; fill.intensity=.25; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=.92; }
function twMinimap(){ const ctx=mctx, S=fitCanvas(mm); const s=S*.94/64; const X=x=>S/2+(x-TWX)*s, Z=z=>S/2+(z-TWZ)*s;
  ctx.fillStyle="#dcefff"; ctx.fillRect(0,0,S,S); dot(ctx,X(TWX),Z(TWZ),TW_BASE*s,"#f4efe2","#c8b890",1); dot(ctx,X(TWX),Z(TWZ),3.4*s,"#b89a70","#fff",1);
  const abs=TW.gy+P.y; TW.pl.forEach(p=>{ if(Math.abs(p.top-abs)>18) return; const on=p.s<=TW.st; dot(ctx,X(p.x),Z(p.z),Math.max(S/70,(p.sh==="b"?p.hw:p.r)*s),p.isTop?"#ffd24a":p.cp?"#ff8a5a":on?"#9fd8ff":p.kind==="bounce"?"#ff5a7a":p.kind==="vanish"?"#ffffff":"#7a8aa8","#fff",1); });
  twPeers().forEach(o=>dot(ctx,X(o.x),Z(o.z),S/36,"#1e8e3e","#fff",1.5));
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const a=S/20; ctx.moveTo(0,-a); ctx.lineTo(a*.7,a*.7); ctx.lineTo(0,a*.35); ctx.lineTo(-a*.7,a*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,`🪜 ${TW.st}/${TW_N}층`,S/2,S*.07,Math.round(S/12),"#173050"); }
XZONE.push({on:()=>TW.on,clamp:()=>{ if(!twIn(P.x,P.z)){ twExit(true,true); return false; } P.x=clamp(P.x,TWX-140,TWX+140); P.z=clamp(P.z,TWZ-140,TWZ+140); return true; },sky:twSky,mm:twMinimap});
/* ---------- 창 ---------- */
function showTower(){ const L=twBoard(), d=twData(), day=kday(); const T=TW.T&&TW.day===day?TW:Object.assign({},twTypes(day));
  const rows=L.slice(0,10).map((x,i)=>`<div class="row"><div class="ic" style="color:${REALMS[x.r]?REALMS[x.r].c1:"#fff"}">${i===0?"🥇":i===1?"🥈":i===2?"🥉":"🔔"}</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>${REALMS[x.r]?REALMS[x.r].n+" · ":""}${twFmt(x.t)}</span></div></div>`).join("");
  const today=(T.today||[]).map(s=>`${s}층 ${TW_KIND[T.T[s]].ic} ${TW_KIND[T.T[s]].n}`).join(" · ");
  card(`<h2>🪜 신들의 하늘 탑</h2><p>수도의 <b>하늘 탑 문</b>으로 들어가 30층 꼭대기 종을 쳐요! 레벨·장비 상관없이 모두 같은 점프라 누구나 오를 수 있어요. 점프 버튼을 두 번 누르면 2단 점프.</p>
   <div class="idlegrid"><div><b>${d.best?twFmt(d.best):"-"}</b><span>내 최고 기록</span></div><div><b>${d.n||0}번</b><span>꼭대기에 오른 횟수</span></div></div>
   <p style="font-size:13px">🪨 디딤돌 · 🌉 좁은 다리 · ↔ 움직이는 발판(올라타면 같이 움직여요) · 🌀 빙글 막대(막대가 오면 점프!) · 🍄 튕기는 버섯(높이 솟아요) · ☁ 사라지는 구름(얼른 다음으로!)<br>🚩 5층마다 깃발 — 떨어지면 깃발에서 다시. 오늘 바뀐 층: ${today}</p>
   <p style="font-size:13px">🎁 날마다 처음 오르면 경험치(한 레벨의 15%)·금화·⛓ 6·✨ 2 · 처음 오르면 신전 장식 «🔔 하늘 탑의 종»</p>
   <div class="exgrid">${TW.on?`<button class="buy alt" id="twLeave">수도로 돌아가기</button>`:`<button class="buy" id="twWay">탑 문으로 길 안내</button>`}</div>
   <h3>🔔 오늘 꼭대기에 오른 사람</h3>${rows||'<p style="font-size:13px">아직 아무도 없어요. 첫 번째로 종을 쳐 보세요!</p>'}`);
  if($("twWay")) $("twWay").onclick=()=>{ const s=TW.gates[Math.max(0,G.realm)]; if(s){ setGuide({x:s.x,z:s.z,label:"🪜 하늘 탑 문"}); } closeLayer(); }; if($("twLeave")) $("twLeave").onclick=()=>{ closeLayer(); twExit(); }; }
CTX_EXTRA.push(()=>twGateNear()?{t:"🪜 하늘 탑 오르기",f:twEnter}:null);
MENU_X.push({ic:"🪜",n:"신들의 하늘 탑",id:"twBtn",sub:()=>`${TW.on?"탑 안에 있어요":"점프로 오르는 30층 장애물 탑"} · 내 기록 ${twData().best?twFmt(twData().best):"-"} · 오늘 ${twBoard().length}명 올랐어요`,f:showTower});
const TW_DECO=DECO.length;
DECO.push({n:"하늘 탑의 종",ic:"🔔",t:3,sc:25,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); [0,1,2,3].forEach(k=>{ const a=k/4*6.283+.78; g.add(cyl(.12,.14,2.6,M.gold,Math.cos(a)*1.1,1.3,Math.sin(a)*1.1,8)); }); const roof=new THREE.Mesh(new THREE.ConeGeometry(1.6,.9,4),M.marble); roof.rotation.y=.78; roof.position.y=3; g.add(roof); g.add(cyl(.38,.7,.9,mat({color:0xffc23a,metalness:.75,roughness:.28}),0,2,0,14)); g.add(cyl(1.3,1.4,.3,M.marble,0,.15,0,16)); return g; }});
TITLES.push({id:"tw1",n:"하늘을 오른 자",t:2,h:"하늘 탑 30층 꼭대기 종 치기",g:()=>[twData().n?1:0,1]},{id:"tw10",n:"구름 위의 단골",t:2,h:"하늘 탑 꼭대기에 10번 오르기",g:()=>[twData().n||0,10]},{id:"twfast",n:"바람의 계단",t:3,h:"하늘 탑을 3분 안에 오르기",g:()=>[twData().best&&twData().best<=180000?1:0,1]},{id:"twfall",n:"넘어져도 다시",t:0,h:"하늘 탑에서 30번 떨어지고도 다시 오르기",g:()=>[G.twFall||0,30]});
</script>
