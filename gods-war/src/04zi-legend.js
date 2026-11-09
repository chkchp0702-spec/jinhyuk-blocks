<script>
/* ================= v85-2: 🐲 전설 신수 길들이기 대작전 (IDEAS G11/9-3) =================
   첫 방문 11/14(토) 저녁 8시(한국 시간), 그다음부터 매달 첫째 토요일 저녁 8시. 30분 동안, 세계마다 돌아가며 전설 신수가 그 세계 수도 하늘에 내려옴.
   (에덴 빛의 불사조 → 아스가르드 은빛 늑대 → 인도 황금 날개새 → 올림푸스 하얀 천마 — 모두 우리 게임만의 모습)
   싸우지 않음: 둘레(20걸음 안)에 서서 「🪢 빛의 밧줄」을 박자 맞춰 누르면 밧줄이 걸리고 길들이기 점수가 쌓임(딱 맞춤 3 · 좋아 2 · 조금 1).
   모두의 점수를 더함(보관 lg/<회차>/<비행>/<id>={p}) — 목표는 함께한 사람 수에 맞춰 커짐(사람^0.8) → 여럿이면 더 빨리.
   신수가 가끔 「날개 바람」(경고 후 퍼지는 고리) → 점프하면 피하고 +1, 맞으면 뒤로 밀리고 연속 박자가 끊김(다치지 않음).
   6분마다 한 번씩 비행(30분에 5번): 길들이면 → 함께 밧줄을 건 사람 모두 「전설 신수 알」(회차마다 한 번, 꺼 둬도 하루 뒤 부화) · 다음 비행부터는 금화·룬.
   10분 전부터 화면 위 띠에 카운트다운 · 메뉴/띠에서 「🌀 바로 가기」. 저장: G.lgGot{회차} · G.lgEgg{r,t0} · G.lgN. 칭호 2개.
   시험: __lg.force(분 뒤, 세계) */
const LG_PREMIERE=Date.UTC(2026,10,14,11,0,0);   // 2026-11-14(토) 20:00 KST
const LG_PRE=10*60000, LG_LIVE=30*60000, LG_SLOT=6*60000, LG_STAY=5*60000, LG_DESC=7000, LG_EGG_MS=24*3600000;
const LG_BEAT=1.25, LG_R=20, LG_BASE=180, LG_MINP=12, LG_H=5.8;
const LGP0=PETS.length;
PETS.push(
 {n:"전설 빛의 불사조",kind:"bird",c:0xfff3d0,c2:0xffb030,egg:"빛나는 전설 알",leg:1},
 {n:"전설 은빛 늑대",kind:"wolf",c:0xdfe8f4,c2:0x8ea8d8,egg:"은빛 전설 알",leg:1},
 {n:"전설 황금 날개새",kind:"bird",c:0xffc83a,c2:0xff5a3a,egg:"황금 전설 알",leg:1},
 {n:"전설 하얀 천마",kind:"pegasus",c:0xffffff,c2:0xffe08a,egg:"구름빛 전설 알",leg:1});
try{ NE_ICON.push("🕊️","🐺","🦅","🦄"); }catch(e){}
const LG={force:0,forceR:0,ev:null,key:"",p:0,streak:0,lastCyc:-1,stun:0,dirty:false,pubT:0,mesh:null,meshR:-1,ropes:[],band:null,tap:null,tamed:{},paid:{},miss:{},gust:{},gIdx:-1,warnIdx:-1,clearT:0,ann:{},t:0,judge:null,judgeT:0,joyT:0};
const LGO={};   // LGO["회차/비행"][id]={i,n,r,p,ts}
function lgName(r){ return PETS[LGP0+r].n.replace("전설 ",""); }
/* ---------- 언제 ---------- */
function lgEvents(){ const L=[]; if(LG.force) L.push({id:"t"+Math.floor(LG.force/60000),t:LG.force,r:LG.forceR}); L.push({id:"p1",t:LG_PREMIERE,r:0});
  const now=new Date(Date.now()+9*3600000); const y=now.getUTCFullYear(), m=now.getUTCMonth();
  for(let i=-1;i<=3;i++){ let mm=m+i, yy=y; while(mm<0){ mm+=12; yy--; } while(mm>11){ mm-=12; yy++; } const base=Date.UTC(yy,mm,1)/86400000; const dow=new Date(Date.UTC(yy,mm,1)).getUTCDay(); const d=base+((6-dow+7)%7); const t=d*86400000+11*3600000; if(t<=LG_PREMIERE) continue; const n=(yy-2026)*12+mm-10; L.push({id:"m"+yy+"-"+(mm+1),t,r:((n%4)+4)%4}); }
  return L.sort((a,b)=>a.t-b.t); }
function lgCur(){ const now=Date.now(); return lgEvents().find(e=>now<e.t+LG_LIVE)||null; }
function lgLive(e){ const now=Date.now(); return !!e&&now>=e.t&&now<e.t+LG_LIVE; }
function lgSoon(e){ const now=Date.now(); return !!e&&now>=e.t-LG_PRE&&now<e.t; }
function lgWhen(t){ const d=new Date(t+9*3600000); const h=d.getUTCHours(); return `${d.getUTCMonth()+1}/${d.getUTCDate()}(${"일월화수목금토"[d.getUTCDay()]}) 저녁 ${h>12?h-12:h}시`; }
function lgLeft(ms){ ms=Math.max(0,ms); const s=Math.floor(ms/1000); if(s>=86400) return `${Math.floor(s/86400)}일 ${Math.floor(s%86400/3600)}시간`; if(s>=3600) return `${Math.floor(s/3600)}시간 ${Math.floor(s%3600/60)}분`; return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function lgSpot(e){ const rg=REGIONS[e.r*3]; return {x:rg.x,z:rg.z,rg}; }
/* 지금 몇 번째 비행, 무슨 단계 */
function lgState(e){ const now=Date.now(); if(!lgLive(e)) return null; const i=Math.floor((now-e.t)/LG_SLOT); const ts=e.t+i*LG_SLOT; const w=now-ts; const key=e.id+"/"+i;
  const tm=LG.tamed[key]; let ph; if(tm) ph=now-tm<10000?"tamed":"away"; else if(w<LG_DESC) ph="desc"; else if(w<LG_STAY) ph="live"; else ph="away";
  return {i,ts,w,key,ph,next:ts+LG_SLOT,last:i>=Math.floor(LG_LIVE/LG_SLOT)-1}; }
/* ---------- 모두의 점수 ---------- */
NETX.push({sub:()=>{ const e=lgCur(); return "lg/"+(e?e.id:"x")+"/+/+"; },pre:"lg/",f:(d,topic)=>{ const a=String(topic).split("/"); if(!d||!d.i||d.i===G.id) return; const k=a[1]+"/"+a[2]; (LGO[k]=LGO[k]||{})[d.i]=d; }});
function lgRecs(key){ const o=LGO[key]||{}; const L=Object.values(o).filter(x=>x.i!==G.id&&x.p>0); if(LG.key===key&&LG.p>0) L.push({i:G.id,n:G.name,r:G.realm,p:LG.p,me:1}); return L; }
function lgSum(key){ return lgRecs(key).reduce((a,x)=>a+(+x.p||0),0); }
function lgGoal(key){ return Math.round(LG_BASE*Math.pow(Math.max(1,lgRecs(key).length),.8)); }
function lgPub(){ const e=LG.ev; if(!e||!LG.key) return; const s=LG.key.split("/"); try{ net.pushRet("lg/"+s[0]+"/"+s[1]+"/"+G.id,{i:G.id,n:G.name,r:G.realm,p:LG.p,ts:Date.now()}); }catch(e2){} LG.dirty=false; }
/* ---------- 전설 신수 모습 ---------- */
(function(){ const _mp=makePet; makePet=function(r,lv,sh){ const D=PETS[r]; if(!D||!D.leg) return _mp(r,lv,sh); const wolf=D.kind==="wolf"; if(wolf) D.kind="pegasus"; let g; try{ g=_mp(r,lv,sh); }finally{ if(wolf) D.kind="wolf"; } const u=g.userData;
    if(wolf){ u.wings.forEach(w=>w.visible=false); u.wings=[]; u.fly=false; const tail=sph(.26,mat({color:D.c2,roughness:.6}),0,.35,-.85); tail.scale.set(.8,.8,1.7); tail.rotation.x=-.6; u.body.add(tail); u.body.add(sph(.09,mat({color:0x2a2a34,roughness:.4}),0,.6,1.17)); }
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.32,.04,6,24),glowMat(0xffe08a,.9)); halo.rotation.x=Math.PI/2; halo.position.set(0,1.42,.5); halo.userData.noOutline=true; u.body.add(halo);
    const aura=new THREE.Mesh(new THREE.SphereGeometry(1.05,16,12),glowMat(D.c2,.12)); aura.userData.noOutline=true; u.body.add(aura); u.legHalo=halo;
    g.scale.multiplyScalar(1.12); return g; };
  const _pb=petBonus; petBonus=function(){ const b=_pb(); return b>0&&PETS[G.pet]&&PETS[G.pet].leg?b+5:b; }; })();
/* ---------- 하늘의 전설 신수 ---------- */
function lgMesh(e){ if(LG.mesh&&LG.meshR===e.r) return LG.mesh; lgMeshDrop(); const g=new THREE.Group(); const pet=makePet(LGP0+e.r,20,false); pet.scale.multiplyScalar(7); g.add(pet);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(6.6,.2,8,48),glowMat(0xfff2a0,.0)); ring.rotation.x=Math.PI/2; ring.position.y=2.2; ring.userData.noOutline=true; g.add(ring);
  const gl=new THREE.Mesh(new THREE.RingGeometry(LG_R-.6,LG_R,64),glowMat(0xfff2a0,.35)); gl.rotation.x=-Math.PI/2; gl.userData.noOutline=true; g.add(gl);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(3.6,3.6,70,24,1,true),glowMat(0xfff2a0,.0)); beam.position.y=35; beam.userData.noOutline=true; g.add(beam);
  const gust=new THREE.Mesh(new THREE.RingGeometry(.9,1,64),glowMat(0xbfe8ff,.0)); gust.rotation.x=-Math.PI/2; gust.userData.noOutline=true; g.add(gust);
  g.userData={pet,ring,gl,beam,gust}; g.visible=false; scene.add(g); LG.mesh=g; LG.meshR=e.r; return g; }
function lgMeshDrop(){ if(LG.mesh){ scene.remove(LG.mesh); LG.mesh=null; LG.meshR=-1; } LG.ropes.forEach(r=>scene.remove(r)); LG.ropes=[]; }
const LGQ=new THREE.Quaternion(), LGUP=new THREE.Vector3(0,1,0), LGA=new THREE.Vector3(), LGB=new THREE.Vector3(), LGD=new THREE.Vector3();
function lgRope(i){ let m=LG.ropes[i]; if(!m){ m=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1,6,1,true),glowMat(0xfff2a0,.75)); m.userData.noOutline=true; scene.add(m); LG.ropes[i]=m; } return m; }
function lgRopeSet(m,ax,ay,az,bx,by,bz,op){ LGA.set(ax,ay,az); LGB.set(bx,by,bz); LGD.subVectors(LGB,LGA); const L=LGD.length(); m.position.copy(LGA).addScaledVector(LGD,.5); m.scale.set(1,L,1); LGQ.setFromUnitVectors(LGUP,LGD.normalize()); m.quaternion.copy(LGQ); m.material.opacity=op; m.visible=true; }
/* 날개 바람 시각표(비행마다 같은 시각 — 모든 폰이 같음) */
function lgGusts(st){ const L=[]; const r=dgRng((st.ts/1000|0)^0x5bd1); let t=16000; while(t<LG_STAY-6000){ L.push(t); t+=8000+Math.floor(r()*4000); } return L; }
/* ---------- 박자 누르기 ---------- */
function lgCanTap(){ const e=LG.ev; if(!e||!started||P.dead||layerOpen) return false; const st=lgState(e); if(!st||st.ph!=="live") return false; const s=lgSpot(e); return Math.hypot(P.x-s.x,P.z-s.z)<LG_R; }
function lgPress(){ if(!lgCanTap()) return; const e=LG.ev, st=lgState(e); if(LG.stun>0){ lgJudge("휘청… 잠깐!","#9fd4ff"); return; }
  const c=(st.w/1000)/LG_BEAT; const cyc=Math.round(c); if(cyc===LG.lastCyc){ lgJudge("천천히! 박자에 맞춰요","#ffd0a0"); return; } LG.lastCyc=cyc; const off=Math.abs(c-cyc);
  let pt=0, txt, col; if(off<.08){ pt=3; txt="딱 맞춤!"; col="#fff07a"; } else if(off<.16){ pt=2; txt="좋아요!"; col="#9dffb8"; } else if(off<.26){ pt=1; txt="조금 빨라요/늦어요"; col="#cfe0ff"; } else { txt="놓쳤어요"; col="#ff9a8a"; }
  if(pt>0){ LG.streak++; if(LG.streak%5===0){ pt+=1; txt+=` 🔥${LG.streak}연속`; } } else LG.streak=0;
  if(pt>0){ LG.p+=pt; LG.dirty=true; const s=lgSpot(e); fxSpark(P.x,1.8,P.z,0xfff2a0,pt*4); try{ const g=LG.mesh; if(g) fxSpark(s.x,hAt(s.x,s.z)+LG_H,s.z,0xfff2a0,6); }catch(e2){} tone(660+pt*180,.07,"triangle"); if(pt>=3) tone(1320,.08,"sine",.05,.05); buzz(pt>=3?20:10); } else { tone(220,.08,"sine",0,.05); }
  lgJudge(`${txt}${pt?` +${pt}`:""}`,col); }
function lgJudge(t,c){ LG.judge={t,c}; LG.judgeT=.9; }
/* ---------- 매 프레임 ---------- */
function lgTick(dt){ if(!started||G.realm<0){ lgHud(null,null); return; } const e=lgCur(); LG.ev=e; const now=Date.now(); const tn=performance.now(); LG.stun=Math.max(0,LG.stun-dt); LG.judgeT=Math.max(0,LG.judgeT-dt); LG.pubT-=dt; LG.t-=dt;
  lgEggTick(dt);
  if(!e||(!lgLive(e)&&!lgSoon(e))){ if(LG.mesh) lgMeshDrop(); lgHud(null,null); return; }
  // 알림 (10분 전 · 1분 전 · 시작)
  const ann=(k,a,b)=>{ if(LG.ann[e.id+k]) return; LG.ann[e.id+k]=1; toast(a,b,3.4); jingle([392,523,659,784]); buzz([30,30,30]); };
  if(lgSoon(e)){ if(e.t-now<=LG_PRE&&e.t-now>60000) ann("a",`🐲 곧 전설 신수 「${lgName(e.r)}」이(가) 내려와요!`,`${lgSpot(e).rg.n} 하늘 · ${lgLeft(e.t-now)} 뒤 · 메뉴 🐲 에서 바로 가기`); else if(e.t-now<=60000) ann("b",`🐲 1분 뒤 「${lgName(e.r)}」 등장!`,`${lgSpot(e).rg.n}으로 모여요`); }
  const st=lgState(e); if(!st){ if(LG.mesh) LG.mesh.visible=false; lgHud(e,null); return; }
  ann("c",`🐲 전설 신수 「${lgName(e.r)}」이(가) 내려왔어요!`,`${lgSpot(e).rg.n} · 둘레에 서서 🪢 빛의 밧줄을 박자 맞춰 눌러요`);
  if(LG.key!==st.key){ if(LG.dirty) lgPub(); LG.key=st.key; LG.p=0; LG.streak=0; LG.lastCyc=-1; LG.gIdx=-1; LG.warnIdx=-1; }
  const s=lgSpot(e); const g=lgMesh(e); const u=g.userData; const pet=u.pet, pu=pet.userData; const gy=hAt(s.x,s.z); const myD=Math.hypot(P.x-s.x,P.z-s.z);
  const sum=lgSum(st.key), goal=lgGoal(st.key), prog=Math.min(1,sum/goal);
  // 길들였나?
  if(st.ph==="live"&&sum>=goal&&!LG.tamed[st.key]){ LG.tamed[st.key]=now; lgTamed(e,st); }
  if(st.ph==="away"&&!LG.tamed[st.key]&&!LG.miss[st.key]&&st.w>=LG_STAY){ LG.miss[st.key]=1; if(myD<60) toast(`🐲 ${lgName(e.r)}이(가) 하늘로 날아갔어요…`,st.last?"오늘 비행은 끝! 다음 방문 때 다시 만나요":"조금 뒤 다시 내려와요 — 다음엔 꼭 길들여요!",3); }
  // 모습
  g.visible=st.ph!=="away"&&myD<230; g.position.set(s.x,gy,s.z);
  let hy=LG_H, op=1; if(st.ph==="desc"){ const k=st.w/LG_DESC; hy=LG_H+(1-k)*(1-k)*60; } if(st.ph==="tamed"){ const k=(now-LG.tamed[st.key])/10000; hy=k<.6?LG_H-Math.min(1,k/.25)*(LG_H-4.6):4.6+Math.pow((k-.6)/.4,2)*70; }
  pet.position.y=hy+Math.sin(tn/600)*.5; pet.rotation.y+=dt*(st.ph==="tamed"?1.2:.25);
  pu.wings&&pu.wings.forEach(w=>w.rotation.z=w.userData.s*Math.sin(tn/(st.ph==="live"?160:110))*.6);
  if(pu.legHalo) pu.legHalo.rotation.z+=dt*2;
  u.ring.position.y=hy+2.2; u.ring.material.opacity=st.ph==="live"?.25+prog*.7:st.ph==="tamed"?.95:0; u.ring.scale.setScalar(1.25-prog*.35); u.ring.rotation.z+=dt*(1+prog*3);
  u.gl.material.opacity=st.ph==="live"?.28+Math.sin(tn/300)*.1:0; u.gl.position.y=.15;
  u.beam.material.opacity=st.ph==="desc"?.35*(1-st.w/LG_DESC):st.ph==="tamed"?.3:0;
  // 날개 바람
  let gop=0; if(st.ph==="live"){ const GS=lgGusts(st); const gi=GS.findIndex(t=>st.w>=t-1300&&st.w<t+1100);
    if(gi>=0){ const t0=GS[gi]; if(st.w<t0){ if(LG.warnIdx!==gi){ LG.warnIdx=gi; if(myD<LG_R+6){ toast("⚠ 날개 바람! 점프!",null,1.1); tone(330,.12,"square",0,.05); } } pu.wings&&pu.wings.forEach(w=>w.rotation.z=w.userData.s*-1.1); }
      else { const k=(st.w-t0)/900; const rr=k*(LG_R+3); u.gust.scale.setScalar(Math.max(.01,rr)); gop=Math.max(0,.75*(1-k)); u.gust.position.y=1.2;
        if(LG.gIdx!==gi&&myD<LG_R+3&&rr>=myD-1){ LG.gIdx=gi; if(P.y>.5){ LG.p+=1; LG.dirty=true; lgJudge("점프로 피했어요! +1","#9dffb8"); tone(990,.08,"sine"); } else { LG.stun=1.2; LG.streak=0; const a=Math.atan2(P.x-s.x,P.z-s.z); const nd=Math.min(Math.max(myD,LG_R-3),myD+1.2); P.x=s.x+Math.sin(a)*nd; P.z=s.z+Math.cos(a)*nd; P.shake=Math.max(P.shake||0,.5); lgJudge("휘청! 날개 바람에 밀렸어요","#9fd4ff"); tone(180,.15,"sawtooth",0,.06); } }
        if(LG.gSnd!==st.key+gi){ LG.gSnd=st.key+gi; tone(140,.3,"sine",0,.08); } } } }
  u.gust.material.opacity=gop;
  // 밧줄: 나 + 근처 친구
  let n=0; const top=gy+hy+1.2; if(st.ph==="live"||st.ph==="tamed"){ if(myD<LG_R&&!P.dead){ lgRopeSet(lgRope(n++),P.x,hAt(P.x,P.z)+1.6+(P.y||0),P.z,s.x,top,s.z,LG.judgeT>0?.95:.55); }
    for(const id in PEERS){ const o=PEERS[id]; if(o.dead||Math.hypot(o.x-s.x,o.z-s.z)>=LG_R) continue; lgRopeSet(lgRope(n++),o.x,hAt(o.x,o.z)+1.6,o.z,s.x,top,s.z,.4+.25*Math.sin(tn/200+n)); if(n>=12) break; } }
  for(let i=n;i<LG.ropes.length;i++) LG.ropes[i].visible=false;
  // 둘레 괴물 비키기 (1초마다)
  LG.clearT-=dt; if(LG.clearT<=0&&myD<80){ LG.clearT=1; for(let i=mobs.length-1;i>=0;i--){ const m=mobs[i]; if(m.boss||m.ev||m.war||m.titan||m.dg||m.ds) continue; if(Math.hypot(m.x-s.x,m.z-s.z)<36){ fxSpark(m.x,1.4,m.z,0xfff2a0,8); removeMob(m); } } }
  if(LG.dirty&&LG.pubT<=0){ LG.pubT=2; lgPub(); }
  lgHud(e,st,sum,goal,myD); }
XTICK.push(lgTick);
function lgTamed(e,st){ const s=lgSpot(e); const myD=Math.hypot(P.x-s.x,P.z-s.z); if(LG.dirty) lgPub(); const ppl=lgRecs(st.key); const mine=LG.key===st.key?LG.p:0;
  try{ fxRing(s.x,s.z,0xfff2a0,LG_R,1.2); fxSpark(s.x,hAt(s.x,s.z)+5,s.z,0xfff2a0,60); }catch(e2){}
  if(mine<LG_MINP||LG.paid[st.key]){ if(myD<80) toast(`🐲 모두가 「${lgName(e.r)}」을(를) 길들였어요!`,mine>0?"조금만 더 밧줄을 걸었으면 선물을 받았을 텐데! 다음 비행에 도전해요":"다음 비행 때 함께 밧줄을 걸어요",3); return; }
  LG.paid[st.key]=1; G.lgGot=G.lgGot||{}; const L=G.lv; const got=[]; let egg=false;
  if(!G.lgGot[e.id]){ G.lgGot[e.id]=Date.now(); G.lgN=(G.lgN||0)+1; if(!G.lgEgg){ G.lgEgg={r:LGP0+e.r,t0:Date.now()}; egg=true; got.push(`🥚 ${PETS[LGP0+e.r].egg} (하루 뒤 부화)`); } else { const g=2000+L*40; G.gold+=g; G.rune=(G.rune||0)+5; got.push(`금화 +${fmt(g)}`,"✨ +5"); } const xp=Math.round(xpNeed(L)*.2); gainXp(xp); got.push(`경험치 +${fmt(xp)}`); }
  else { const g=300+L*20; G.gold+=g; G.rune=(G.rune||0)+2; const xp=Math.round(xpNeed(L)*.06); gainXp(xp); got.push(`금화 +${fmt(g)}`,"✨ +2",`경험치 +${fmt(xp)}`); }
  saveGame(); const names=ppl.map(x=>x.n).slice(0,6).join(" · ");
  try{ lvBanner(egg?"🐲 전설 신수를 길들였어요!":"🐲 또 길들였어요!",lgName(e.r),`${names}${ppl.length>6?" 외":""} · ${got.join(" · ")}`,"#fff07a"); }catch(e2){ toast("🐲 전설 신수를 길들였어요!",got.join(" · "),3.5); }
  try{ fxPillar(0xfff07a,1,HIGH()?36:18,1.6,.5); fxRiseDust(0xfff2a0,HIGH()?40:18,1.8); }catch(e2){} jingle([523,659,784,1046,1318,1568,2093]); buzz([40,30,80]); }
/* ---------- 전설 알 ---------- */
let lgEggT=0;
function lgEggLeft(){ return G.lgEgg?Math.max(0,G.lgEgg.t0+LG_EGG_MS-Date.now()):0; }
function lgEggTick(dt){ lgEggT-=dt; if(lgEggT>0) return; lgEggT=3; if(!G.lgEgg||lgEggLeft()>0||layerOpen||P.dead) return; lgHatch(); }
function lgHatch(){ petData(); const r=G.lgEgg.r; G.lgEgg=null; const D=PETS[r]; const had=G.pets[r]; let msg;
  if(had){ had.lv=Math.min(PET_MAX,had.lv+3); had.xp=0; msg=`이미 있는 ${D.n}의 형제 알! ${D.n} 레벨 +3 (Lv.${had.lv})`; }
  else { G.pets[r]={lv:5,xp:0,t:Date.now(),leg:1}; msg=`<b style="color:var(--gold)">${D.n}</b>이(가) 태어났어요! Lv.5부터 시작하고, 금화 보너스가 +5% 더 커요.`; }
  G.pet=r; saveGame(); rebuildMyPet(); try{ net.hello(); net.pushProfile(1); }catch(e){}
  card(`<h2>🐲 전설 알이 깨어났어요!</h2><canvas id="petPrev" width="260" height="200" style="width:220px;height:170px;align-self:center"></canvas><p>${msg}</p><p style="font-size:13px">전설 신수는 머리 위에 빛의 고리가 있어요. 친구 화면에도 보여요!</p><button class="buy" id="petOk" style="align-self:center">좋아요!</button>`);
  $("petOk").onclick=closeLayer; drawPetPreview($("petPrev"),r); jingle([523,659,784,1046,1318,1568,2093]); fxRing(P.x,P.z,D.c2,12,1); fxSpark(P.x,2,P.z,0xfff2a0,60); buzz([40,30,40,30,80]); }
(function(){ const _sp=showPets; showPets=function(){ _sp(); if(!G.lgEgg) return; const p=layers.querySelector(".card p"); if(!p) return; const lf=lgEggLeft();
  p.insertAdjacentHTML("afterend",`<div class="row" style="border:1px solid #ffe08a"><div class="ic">🥚</div><div class="t"><div>🐲 ${PETS[G.lgEgg.r].egg} 품는 중</div><span>${lf>0?`깨어나기까지 ${lgLeft(lf)} · 게임을 꺼 둬도 자라요`:"곧 깨어나요!"}</span></div></div>`); }; })();
/* ---------- 화면: 위쪽 띠 + 밧줄 버튼 ---------- */
function lgHud(e,st,sum,goal,myD){ if(!LG.band){ const b=document.createElement("div"); b.id="lgband"; b.hidden=true; b.addEventListener("pointerdown",ev=>ev.stopPropagation()); b.onclick=()=>{ if(started&&!layerOpen) showLegend(); }; document.body.appendChild(b); LG.band=b;
    const t=document.createElement("div"); t.id="lgtap"; t.hidden=true; t.innerHTML='<i class="rg"></i><div class="core">🪢<b>빛의 밧줄</b></div><span class="jd"></span><span class="sc"></span>'; t.addEventListener("pointerdown",ev=>{ ev.stopPropagation(); ev.preventDefault(); lgPress(); }); document.body.appendChild(t); LG.tap=t; }
  const b=LG.band, t=LG.tap; const now=Date.now();
  if(!e||!started||layerOpen){ b.hidden=true; t.hidden=true; document.body.classList.remove("lgOn"); return; }
  let h; const nm=lgName(e.r), place=lgSpot(e).rg.n;
  if(!st) h=`<b>🐲 전설 신수 「${nm}」이(가) 곧 내려와요!</b><span>${place} 하늘 · ⏱ ${lgLeft(e.t-now)} · 눌러서 바로 가기</span>`;
  else if(st.ph==="away") h=`<b>🐲 ${nm} — ${st.last?"오늘 비행 끝!":"하늘을 날고 있어요"}</b><span>${st.last?`다음 방문 ${(()=>{ const n=lgEvents().find(x=>x.t>e.t); return n?lgWhen(n.t):"곧"; })()}`:`다시 내려오기까지 ⏱ ${lgLeft(st.next-now)} · ${place}`}</span>`;
  else { const p=Math.min(1,sum/goal); const n=lgRecs(st.key).length; h=`<b>🐲 「${nm}」 길들이기 ${Math.floor(p*100)}%</b><span>🪢 함께 ${Math.max(1,n)}명 · ${st.ph==="desc"?"내려오는 중…":`⏱ ${lgLeft(st.ts+LG_STAY-now)}`}${myD>=LG_R?` · ${place}로 가요!`:""}</span><i><s style="width:${Math.round(p*100)}%"></s></i>`; }
  if(b._h!==h){ b._h=h; b.innerHTML=h; } b.hidden=false; const ev=$("evbar"); b.classList.toggle("low",!!(ev&&!ev.hidden));
  const can=lgCanTap(); t.hidden=!can; if(document.body.classList.contains("lgOn")!==can) document.body.classList.toggle("lgOn",can); if(can){ const c=(st.w/1000)/LG_BEAT; const f=c-Math.floor(c); const sc=1+(1-f)*1.25; const rg=t.querySelector(".rg"); rg.style.transform=`translate(-50%,-50%) scale(${sc.toFixed(3)})`; const near=f>.84||f<.08; rg.classList.toggle("hot",near);
    t.classList.toggle("stun",LG.stun>0); const jd=t.querySelector(".jd"); const jt=LG.judgeT>0&&LG.judge?LG.judge.t:""; if(jd._t!==jt){ jd._t=jt; jd.textContent=jt; jd.style.color=LG.judge?LG.judge.c:"#fff"; jd.classList.remove("pop"); void jd.offsetWidth; if(jt) jd.classList.add("pop"); }
    const sc2=`내 밧줄 ${LG.p}${LG.p<LG_MINP?` (선물까지 ${LG_MINP-LG.p})`:" ✔"}${LG.streak>=3?` · 🔥${LG.streak}`:""}`; const se=t.querySelector(".sc"); if(se._t!==sc2){ se._t=sc2; se.textContent=sc2; } } }
/* ---------- 바로 가기 ---------- */
function lgGo(){ const e=lgCur(); if(!e) return; if(P.dead||P.trial){ toast("지금은 갈 수 없어요"); return; } if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  try{ if(DG.on) dgExit(true); if(HM.on) hmExit(); if(DS.on) dsExit(true,true); if(typeof RC!=="undefined"&&RC.on) rcEnd(false); }catch(e2){}
  if(!evOver()){ toast("지금 있는 곳에서 먼저 나와요","그다음 다시 「바로 가기」를 눌러요",2.2); return; }
  const s=lgSpot(e); const a=Math.random()*6.283, d=rnd(9,13); closeLayer(); P.x=s.x+Math.sin(a)*d; P.z=s.z+Math.cos(a)*d; P.y=0; P.vy=0; P.invul=Math.max(P.invul,1.5); fxRing(P.x,P.z,0xfff2a0,6,.7); fxSpark(P.x,2,P.z,0xfff2a0,30); jingle([523,784,1046]); toast(`🌀 ${s.rg.n}에 왔어요!`,lgLive(e)?"하늘의 전설 신수 둘레에 서서 🪢 빛의 밧줄!":"여기서 기다려요 — 곧 내려와요",2.2); }
/* ---------- 창 ---------- */
function showLegend(){ const e=lgCur(); const now=Date.now(); const st=e?lgState(e):null; const nm=e?lgName(e.r):""; const s=e?lgSpot(e):null;
  const next=lgEvents().filter(x=>x.t+LG_LIVE>now).slice(0,4).map(x=>`<div class="row"><div class="ic">${REALMS[x.r].icon}</div><div class="t"><div>${lgName(x.r)} <small>· ${REGIONS[x.r*3].n}</small>${G.lgGot&&G.lgGot[x.id]?' <i class="st on">길들임</i>':""}</div><span>${lgWhen(x.t)}${x.id==="p1"?" · ✨ 첫 방문":""}${x.id[0]==="t"?" · 시험":""}</span></div></div>`).join("");
  const stTxt=!e?"":lgLive(e)?(st&&st.ph==="away"?(st.last?"오늘 비행은 끝났어요":`하늘을 날고 있어요 · ${lgLeft(st.next-now)} 뒤 다시 내려와요`):`🔴 지금 「${nm}」이(가) ${s.rg.n} 하늘에 있어요!`):`${lgWhen(e.t)} · ${lgLeft(e.t-now)} 남음`;
  const owned=PETS.map((D,r)=>D.leg&&G.pets&&G.pets[r]?D.n:null).filter(Boolean);
  card(`<h2>🐲 전설 신수 길들이기 대작전</h2><canvas id="lgPrev" width="260" height="200" style="width:200px;height:154px;align-self:center"></canvas>
   <p style="text-align:center"><b style="font-size:17px;color:#fff07a">${e?`「${nm}」`:""}</b><br>${stTxt}</p>
   ${e&&(lgLive(e)||lgSoon(e))?`<div class="exgrid"><button class="go" id="lgGo">🌀 ${s.rg.n}로 바로 가기</button><button class="buy alt" id="lgWay">🧭 길 안내</button></div>`:""}
   <p style="font-size:13.5px">한 달에 한 번, 전설 신수가 한 세계의 수도 하늘에 내려와요. <b>싸우지 않아요!</b> 둘레(빛의 고리 안)에 서서 <b>🪢 빛의 밧줄</b> 버튼을 바깥 고리가 버튼에 딱 닿을 때 눌러요. 모두의 밧줄을 더해 고리가 가득 차면 길들이기 성공 — 함께 밧줄을 건 사람 <b>모두</b> 전설 신수 알을 받아요(회차마다 한 번, 하루 뒤 부화). 사람이 많을수록 빨리 길들여요!</p>
   <p style="font-size:12.5px">⚠ 날개 바람: 신수가 날개를 번쩍 들면 고리가 퍼져요 — <b>점프</b>하면 피하고 +1! 맞으면 뒤로 밀리지만 다치지 않아요. 30분 동안 6분마다 다시 내려와서 늦게 와도 괜찮아요.</p>
   ${G.lgEgg?`<div class="row" style="border:1px solid #ffe08a"><div class="ic">🥚</div><div class="t"><div>${PETS[G.lgEgg.r].egg} 품는 중</div><span>깨어나기까지 ${lgLeft(lgEggLeft())}</span></div></div>`:""}
   <h3>📅 다음 방문</h3>${next||'<p style="font-size:13px">곧 알려 줄게요</p>'}
   <p style="font-size:12px">내 전설 신수: ${owned.length?owned.join(" · "):"아직 없음"} · 길들인 횟수 ${G.lgN||0}</p>`);
  try{ drawPetPreview($("lgPrev"),LGP0+(e?e.r:0)); }catch(e2){}
  if($("lgGo")) $("lgGo").onclick=lgGo; if($("lgWay")) $("lgWay").onclick=()=>{ closeLayer(); P.guide=null; setGuide({x:s.x,z:s.z,label:"🐲 "+s.rg.n}); }; }
MENU_X.push({ic:"🐲",n:"전설 신수 길들이기",id:"lgBtn",sub:()=>{ const e=lgCur(); if(!e) return "곧 알려 줄게요"; if(lgLive(e)) return `🔴 지금 ${REGIONS[e.r*3].n} 하늘에 「${lgName(e.r)}」!`; return `다음: ${lgWhen(e.t)} · ${lgName(e.r)}${G.lgEgg?" · 🥚 품는 중":""}`; },f:showLegend});
TITLES.push({id:"lg1",n:"전설을 길들인 자",t:2,h:"전설 신수 길들이기 성공하기",g:()=>[G.lgN||0,1]},{id:"lgp2",n:"전설 조련사",t:3,h:"전설 신수 2마리 모으기",g:()=>[PETS.filter((D,r)=>D.leg&&G.pets&&G.pets[r]).length,2]});
window.__lg={force:(min,r)=>{ LG.force=Date.now()+(min||0)*60000; LG.forceR=r||0; },LG,LGO,lgCur,lgState,lgSum,lgGoal,lgPress,lgHatch,showLegend,lgGo};
</script>
<style>
#lgband{position:fixed;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);z-index:6;pointer-events:auto;cursor:pointer;min-width:250px;max-width:min(50vw,440px);padding:6px 14px 8px;border-radius:14px;background:linear-gradient(180deg,rgba(60,44,10,.9),rgba(26,16,48,.9));border:2px solid #fff07a;box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 18px rgba(255,230,120,.5);color:#fff;text-align:center;display:flex;flex-direction:column;gap:2px}
#lgband[hidden]{display:none} #lgband.low{top:calc(max(8px,env(safe-area-inset-top)) + 112px)}
#lgband b{font-size:15px;color:#fff07a;text-shadow:0 2px 0 #000} #lgband span{font-size:12.5px;opacity:.95}
#lgband i{display:block;height:7px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden;margin-top:2px} #lgband i s{display:block;height:100%;background:linear-gradient(90deg,#ffd24a,#fffbd0);text-decoration:none;transition:width .4s}
body:has(#title) #lgband,body:has(#title) #lgtap,body.stOn #lgband{visibility:hidden}
#lgtap{position:fixed;left:50%;bottom:calc(max(10px,env(safe-area-inset-bottom)) + 70px);width:96px;height:96px;margin-left:-48px;z-index:7;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none}
#lgtap[hidden]{display:none} body.lgOn #bCtx{display:none!important}
#lgtap .core{position:absolute;inset:0;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:30px;line-height:1;background:radial-gradient(circle at 40% 35%,#fffbe0,#ffd24a 55%,#b07a10);border:3px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,.4),0 0 22px rgba(255,230,120,.8);color:#4a2a00}
#lgtap .core b{font-size:12px;font-weight:900;margin-top:2px}
#lgtap:active .core{transform:scale(.93)}
#lgtap .rg{position:absolute;left:50%;top:50%;width:96px;height:96px;border-radius:50%;border:4px solid rgba(255,250,210,.85);box-shadow:0 0 10px rgba(255,240,160,.8);pointer-events:none}
#lgtap .rg.hot{border-color:#7dffb0;box-shadow:0 0 16px #7dffb0}
#lgtap.stun .core{filter:grayscale(.7) brightness(.8)}
#lgtap .jd{position:absolute;left:50%;bottom:118px;transform:translateX(-50%);white-space:nowrap;font-size:17px;font-weight:900;text-shadow:0 2px 0 #000,0 0 6px #000;pointer-events:none}
#lgtap .jd.pop{animation:lgPop .5s ease-out}
#lgtap .sc{position:absolute;left:50%;top:102px;transform:translateX(-50%);white-space:nowrap;font-size:12px;font-weight:800;color:#fff;background:rgba(20,12,36,.75);padding:2px 8px;border-radius:8px;pointer-events:none}
@keyframes lgPop{0%{transform:translateX(-50%) scale(.6);opacity:0}40%{transform:translateX(-50%) scale(1.2);opacity:1}100%{transform:translateX(-50%) scale(1)}}
@media (orientation:portrait){#lgband{max-width:84vw;top:calc(max(8px,env(safe-area-inset-top)) + 150px)} #lgtap{bottom:calc(max(10px,env(safe-area-inset-bottom)) + 210px)}}
</style>
