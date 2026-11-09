<script>
/* ================= v89-3: 🏔️ 걸어 다니는 산 거인 — 등에 올라타는 대모험 (IDEAS G11/9-6) =================
   언제: 토요일·일요일 하루 종일 + 평일 저녁 7시~7시 40분(한국 시간) 짧은 「저녁 산책」.
   이끼 낀 둥근 돌 거인(키 약 28m, 졸린 얼굴 — 우리 게임만의 모습)이 세계의 중심 둘레를 아주 천천히 한 바퀴씩 걸어 다님.
   위치는 시계로 정함 → 모든 폰에서 같은 자리. 땅에서 때리는 게 아니라 등에 매달린 덩굴 사다리 발판을 점프로 타고 올라가서
   등·양 어깨·머리 꼭대기의 반짝이는 룬 돌 5개를 부숨(룬마다 10번 — 같은 방 모두의 타격을 합침, t:"gih").
   거인이 24초마다 몸을 흔들 때(2초 전 경고) 「✊ 꽉 붙잡기!」를 안 누르면 떨어짐(날개 신발로 다시 붙을 수도).
   발을 쿵 내디딜 때 발 근처 땅에 있으면 살짝 다침(점프하면 피함).
   룬 5개를 다 부수면 거인이 「하암~」 하고 앉아서 5분 동안 잠듦 → 그 판에 룬을 때렸거나 거인 위에 있었던 사람 모두 보물 상자.
   머리 꼭대기에 처음 오른 판마다 「정상!」 보너스. 판 번호·잠 = 보관 gis/<날>, 부순 룬 = 보관 gib/<날>/<판>/<룬>.
   높이: 게임의 높이 계산(hAt)은 땅 하나뿐이라, 하늘 탑처럼 내 발 높이 = 땅 + GI.gy(발판) + P.y 로 직접 셈. 서 있으면 거인과 함께 실려 감.
   저장: G.giN(보물 받은 판) · G.giTop(정상 오른 판) · G.giRune(마지막 한 방으로 부순 룬). 칭호 3개. */
const GI_R=105, GI_SPD=1.7, GI_HP=10, GI_SLEEP=300000, GI_SHAKE=24000, GI_STEP=6;
const GI={built:false,g:null,P:null,x:0,z:0,yaw:0,base:0,lift:0,px:null,pz:0,pyaw:0,gy:0,on:false,onLedge:null,camY:0,prevAbs:0,lpx:0,lpz:0,onT:0,
  day:-1,r:0,allB:{},hits:[0,0,0,0,0],sleep:null,myHit:{},paid:{},topR:{},shCyc:-1,held:false,warnShown:-1,stepN:-1,lbl:null,bar:null,sendT:0,annDay:-1,wasActive:false,chests:[],vis:false};
/* 발판(거인 기준 좌표: 앞 = +z, 등 = -z). top = 발판 윗면 높이 */
const GI_LEDGES=[
 {x:-2.6,y:2.4,z:-4.2,r:1.5},{x:-3.6,y:4.8,z:-4.4,r:1.4},{x:-1.6,y:7.2,z:-4.6,r:1.4},{x:.8,y:9.6,z:-4.6,r:1.6},
 {x:3.2,y:12.0,z:-4.4,r:1.4},{x:1.2,y:14.4,z:-4.4,r:1.4},{x:-1.4,y:16.8,z:-4.4,r:1.4},{x:-3.6,y:19.2,z:-4.0,r:1.5},
 {x:-2.9,y:22.6,z:-2.3,r:1.15},{x:0,y:25.2,z:-3.5,r:1.2},{x:0,y:27.6,z:.4,r:2.0,top:1}];
const GI_TORSO={hw:5.6,hd:3.3,y:20};
const GI_RUNES=[{x:.8,y:10.9,z:-5.0},{x:-1.4,y:17.9,z:-4.9},{x:-4.6,y:21.1,z:0},{x:4.6,y:21.1,z:0},{x:0,y:28.7,z:.4}];
const GI_RUNE_N=["허리 룬","등 룬","왼쪽 어깨 룬","오른쪽 어깨 룬","머리 꼭대기 룬"];
/* ---------- 언제 · 어디 ---------- */
function giKst(t){ return new Date((t||Date.now())+9*3600000); }
function giActive(t){ const d=giKst(t); const w=d.getUTCDay(); if(w===0||w===6) return true; return d.getUTCHours()===19&&d.getUTCMinutes()<40; }
function giNextTxt(){ const d=giKst(); const w=d.getUTCDay(); const h=d.getUTCHours(); if(w>=1&&w<=5&&h<19) return "오늘 저녁 7시에 산책을 나와요"; if(w===5) return "내일(토요일) 하루 종일 걸어 다녀요"; return "내일 저녁 7시에 산책을 나와요"; }
function giPath(t){ const s=(t==null?Date.now():t)/1000; const th=s*GI_SPD/GI_R; const R=GI_R+10*Math.sin(th*3); return {x:Math.cos(th)*R,z:Math.sin(th)*R}; }
function giPose(t){ const now=t==null?Date.now():t; const a=giPath(now), b=giPath(now+1000); return {x:a.x,z:a.z,yaw:Math.atan2(b.x-a.x,b.z-a.z)}; }
function giSleeping(){ return !!(GI.sleep&&Date.now()-GI.sleep.ts<GI_SLEEP); }
function giL2W(lx,lz){ const c=Math.cos(GI.yaw), s=Math.sin(GI.yaw); return {x:GI.x+lx*c+lz*s,z:GI.z-lx*s+lz*c}; }
function giW2L(x,z,gx,gz,yaw){ const dx=x-gx, dz=z-gz; const c=Math.cos(yaw), s=Math.sin(yaw); return {x:dx*c-dz*s,z:dx*s+dz*c}; }
/* ---------- 모양 ---------- */
function giModel(){ const g=new THREE.Group(); const stone=mat({color:0x7f7668,roughness:1}), stone2=mat({color:0x5f584e,roughness:1}), moss=mat({color:0x4f8a3a,roughness:1}), moss2=mat({color:0x6aa848,roughness:1}),
   wood=mat({color:0x8a5a34,roughness:.9}), vine=mat({color:0x3f7a35,roughness:1}), dark=mat({color:0x2a2a30,roughness:1}), pink=mat({color:0xf2a0a0,roughness:1}), white=mat({color:0xf4f0e6,roughness:1});
  const legs=[], arms=[];
  [-1,1].forEach(s=>{ const L=new THREE.Group(); L.position.set(s*3.2,10,0); L.add(cyl(2.0,2.3,10,stone,0,-5,0,12)); L.add(box(3.4,1.5,4.6,stone2,0,-9.3,.7)); L.add(box(2.6,.6,1.8,moss,0,-3.5,-1.9)); g.add(L); legs.push(L);
    const A=new THREE.Group(); A.position.set(s*6.6,19,0); A.add(sph(1.9,stone,0,0,0)); A.add(cyl(1.4,1.7,8,stone,0,-4.6,0,10)); A.add(sph(1.9,stone2,0,-9,0)); A.add(box(1.6,.5,1.2,moss2,0,-2,-1.3)); g.add(A); arms.push(A); });
  g.add(box(11,10,6.5,stone,0,15,0)); g.add(sph(5.2,stone,0,13.5,.6)); g.add(box(11.4,.9,6.9,wood,0,10.4,0));
  g.add(box(11.2,.4,6.6,moss,0,GI_TORSO.y-.2,0)); [[-3.5,17,-3.3],[2.5,13,-3.3],[4,18,1],[-4.5,12,2.5]].forEach(p=>g.add(box(2.6,1.8,.5,moss2,p[0],p[1],p[2]+(p[2]<0?-.05:.05))));
  // 머리
  g.add(sph(3.6,stone,0,24,.4)); g.add(sph(3.0,moss,0,26.3,.1)); g.add(sph(1.1,moss2,-1.6,27.2,1.2)); g.add(sph(.9,moss2,1.8,27,0));
  const eyes=[], lids=[]; [-1,1].forEach(s=>{ const e=box(1.1,.32,.2,dark,s*1.35,24.5,3.85); g.add(e); eyes.push(e); const l=box(1.3,.5,.22,stone2,s*1.35,24.85,3.82); g.add(l); lids.push(l); g.add(sph(.45,pink,s*2.2,23.5,3.4)); });
  const mouth=box(.9,.18,.2,dark,0,22.7,3.9); g.add(mouth); g.add(box(.5,.35,.2,white,0,22.95,3.92));
  // 덩굴 사다리 발판
  GI_LEDGES.forEach((L,i)=>{ if(L.top){ const p=new THREE.Mesh(new THREE.CylinderGeometry(L.r,L.r,.35,16),moss2); p.position.set(L.x,L.y-.17,L.z); g.add(p); return; }
    g.add(box(L.r*2,.35,L.r*1.5,wood,L.x,L.y-.17,L.z)); g.add(box(L.r*1.8,.18,L.r*1.2,moss,L.x,L.y+.02,L.z));
    const nx=GI_LEDGES[i+1]; if(nx&&!nx.top){ const mx=(L.x+nx.x)/2, my=(L.y+nx.y)/2, mz=(L.z+nx.z)/2; const len=Math.hypot(nx.x-L.x,nx.y-L.y,nx.z-L.z); const v=cyl(.12,.12,len,vine,mx,my,mz,5); v.lookAt(new THREE.Vector3(nx.x,nx.y,nx.z)); v.rotateX(Math.PI/2); g.add(v); } });
  [-1,1].forEach(s=>g.add(cyl(.12,.12,8,vine,-2.6+s*1.1,6.2,-4.3,5)));
  // 룬 돌
  const runes=GI_RUNES.map(R=>{ const o=new THREE.Group(); o.position.set(R.x,R.y,R.z); const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.85),glowMat(0x9fd0ff,.95)); o.add(gem); const core=new THREE.Mesh(new THREE.OctahedronGeometry(.5),mat({color:0x3a5aa8,emissive:0x2a4aff})); o.add(core);
    const ring=new THREE.Mesh(GEO.ring,glowMat(0xd8b0ff,.6)); ring.scale.setScalar(1.3); o.add(ring); const crack=box(.9,.5,.9,stone2,0,-.4,0); crack.visible=false; o.add(crack); g.add(o); o.userData={gem,core,ring,crack}; return o; });
  g.userData.noOutline=true; shadowify(g); return {g,legs,arms,eyes,lids,mouth,runes}; }
/* ---------- 판 · 룬 (함께) ---------- */
function giDaySync(){ const d=kday(); if(GI.day===d) return; GI.day=d; GI.r=0; GI.allB={}; GI.hits=[0,0,0,0,0]; GI.sleep=null; GI.myHit={}; GI.paid={}; GI.topR={}; }
function giBroken(){ return GI.allB[GI.r]||(GI.allB[GI.r]={}); }
function giBrokenN(){ return Object.keys(giBroken()).length; }
NETX.push({sub:()=>"gis/"+kday(),pre:"gis/",f:(d,topic)=>{ const a=String(topic).split("/"); if(+a[1]!==kday()||!d) return; giDaySync(); if((d.r|0)>GI.r) giAdopt(d); }});
NETX.push({sub:()=>"gib/"+kday()+"/+/+",pre:"gib/",f:(d,topic)=>{ const a=String(topic).split("/"); if(+a[1]!==kday()) return; giDaySync(); const r=+a[2], k=+a[3]; if(!(k>=0&&k<5)) return; const B=GI.allB[r]||(GI.allB[r]={}); if(B[k]) return; B[k]=1;
  if(r===GI.r){ giRuneFx(k,true); if(giBrokenN()>=5) giSleepStart(false); } }});
NETR.gih=(o,d)=>{ giDaySync(); if(d.d!==kday()||d.r!==GI.r) return; const k=d.k|0; if(giBroken()[k]) return; GI.hits[k]=(GI.hits[k]||0)+1; if(GI.hits[k]>=GI_HP) giBreak(k,false,o.name); };
NETR.gitp=(o,d)=>{ if(!layerOpen&&GI.vis) toast(`🏔️ ${o.name}님이 거인 머리 꼭대기에 올랐어요!`,null,2); };
NETR.giy=(o,d)=>{ o.giY=+d.y||0; o.giT=performance.now(); };
function giRuneFx(k,quiet){ if(!GI.P) return; const R=GI_RUNES[k]; const p=giL2W(R.x,R.z); const y=GI.base+GI.lift+R.y-hAt(p.x,p.z); fxSpark(p.x,y,p.z,0x9fd0ff,quiet?10:26); if(!quiet){ fxFlash(p.x,y,p.z,0xd8b0ff,3,.4); } }
function giBreak(k,mine,who){ const B=giBroken(); if(B[k]) return; B[k]=1; giRuneFx(k,false); jingle([784,988,1175]);
  if(mine){ G.giRune=(G.giRune||0)+1; saveGame(); try{ net.pushRet("gib/"+kday()+"/"+GI.r+"/"+k,{ts:Date.now(),n:G.name}); }catch(e){} }
  const n=giBrokenN(); if(GI.vis&&!layerOpen) toast(`💎 ${GI_RUNE_N[k]}이(가) 부서졌어요! (${n}/5)`,mine?"마지막 한 방!":`${who||"친구"}님이 마지막 한 방`,2);
  if(n>=5) giSleepStart(true); }
function giSleepStart(mine){ const st={r:GI.r+1,ts:Date.now(),x:+GI.x.toFixed(1),z:+GI.z.toFixed(1),yaw:+GI.yaw.toFixed(3)};
  if(mine){ try{ net.pushRet("gis/"+kday(),st); }catch(e){} } giAdopt(st); }
function giAdopt(st){ const prev=(st.r|0)-1; const was=GI.r; GI.r=st.r|0; GI.hits=[0,0,0,0,0]; GI.allB[GI.r]=GI.allB[GI.r]||{};
  if(Date.now()-st.ts<GI_SLEEP){ GI.sleep={r:GI.r,ts:+st.ts,x:+st.x,z:+st.z,yaw:+st.yaw}; giChests(true); if(GI.vis&&!layerOpen){ toast("🏔️ 하암~ 거인이 앉아서 잠들었어요 💤","5분 뒤 다시 산책을 떠나요",2.6); } tone(220,.5,"sine"); tone(165,.7,"sine",.3); }
  if(prev>=was&&(GI.myHit[prev]||Date.now()-GI.onT<120000)&&!GI.paid[prev]){ GI.paid[prev]=1; giPay(); } }
function giPay(){ const L=G.lv; const gold=Math.round(600+L*45), xp=Math.round(xpNeed(L)*.12), ore=4+Math.floor(Math.random()*3), rune=2; G.gold+=gold; gainXp(xp); G.ore=(G.ore||0)+ore; G.rune=(G.rune||0)+rune; G.giN=(G.giN||0)+1;
  const got=[`금화 +${fmt(gold)}`,`경험치 +${fmt(xp)}`,`⛓ +${ore}`,`✨ +${rune}`]; if(Math.random()<.5){ try{ got.push("🎁 "+evGear(.3)); }catch(e){} } saveGame();
  try{ COINFLY.burst(P.x,1.6,P.z,12); }catch(e){} jingle([523,659,784,1046,1318]); buzz([30,20,60]);
  try{ lvBanner("🏔️ 산 거인을 멈췄어요!","보물 언덕 상자",got.join(" · "),"#b8e07a"); }catch(e){ toast("🏔️ 보물 상자!",got.join(" · "),3); } }
function giChests(on){ GI.chests.forEach(c=>scene.remove(c)); GI.chests=[]; if(!on||!GI.sleep) return; const gold=mat({color:0xffc83a,metalness:.5,roughness:.35,emissive:0x4a3000}), wood=mat({color:0x8a5a34});
  for(let i=0;i<7;i++){ const a=GI.sleep.yaw+Math.PI*.15+i/7*Math.PI*1.7, d=11+(i%2)*3; const x=GI.sleep.x+Math.sin(a)*d, z=GI.sleep.z+Math.cos(a)*d; const c=new THREE.Group(); c.add(box(1.4,.9,1,wood,0,.45,0)); c.add(box(1.5,.35,1.1,gold,0,1.05,0)); c.add(sph(.25,gold,0,1.3,.5)); c.position.set(x,hAt(x,z),z); c.rotation.y=a+Math.PI; scene.add(c); GI.chests.push(c); } }
/* ---------- 거인 위 높이 (하늘 탑과 같은 방식) ---------- */
function giSupport(px,pz,refAbsB){ const l=giW2L(px,pz,GI.x,GI.z,GI.yaw); let best=-1, led=null; const lift=GI.lift;
  for(const L of GI_LEDGES){ const top=L.y+lift; if(top<=.3) continue; if(Math.hypot(l.x-L.x,l.z-L.z)<L.r&&top<=refAbsB+.35&&top>best){ best=top; led=L; } }
  const tt=GI_TORSO.y+lift; if(Math.abs(l.x)<GI_TORSO.hw&&Math.abs(l.z)<GI_TORSO.hd&&tt<=refAbsB+.35&&tt>best){ best=tt; led=GI_TORSO; }
  return {top:best,led,l}; }
function giDrop(){ if(GI.gy>0){ P.y=Math.max(0,P.y+GI.gy); } GI.gy=0; GI.on=false; GI.onLedge=null; GI.camY=0; }
function giPhys(dt){ if(P.dead||(typeof glAway==="function"&&glAway())){ giDrop(); return; }
  if(GI.gy>0&&Math.hypot(P.x-GI.lpx,P.z-GI.lpz)>15){ giDrop(); }   // 순간 이동했으면 내려놓음
  // 거인과 함께 실려 가기
  if(GI.px!=null&&GI.vis){ const l=giW2L(P.x,P.z,GI.px,GI.pz,GI.pyaw); const over=Math.abs(l.x)<8.5&&Math.abs(l.z)<8&&GI.gy+P.y>1; if(GI.on||GI.gy>0||over){ const w=giL2W(l.x,l.z); P.x=w.x; P.z=w.z; if(GI.on) P.rot+=GI.yaw-GI.pyaw; } }   // 발판 위·거인 몸 둘레 공중에서는 거인과 함께 움직임(점프해도 발판이 도망가지 않게)
  const near=GI.vis&&Math.hypot(P.x-GI.x,P.z-GI.z)<16;
  if(!near&&GI.gy<=0){ GI.on=false; GI.onLedge=null; GI.prevAbs=P.y; GI.lpx=P.x; GI.lpz=P.z; return; }
  const th=hAt(P.x,P.z); let abs=GI.gy+P.y; const ref=Math.max(GI.prevAbs,abs); const S=near?giSupport(P.x,P.z,th+ref-GI.base):{top:-1,led:null};
  const g=S.top>0?Math.max(0,GI.base+S.top-th):0; const was=GI.on;
  // 머리에 부딪치면 밀어냄
  if(near&&S.l){ const hl=S.l; const hy=GI.base+GI.lift+24-th; if(abs>hy-4&&abs<hy+3.2){ const dx=hl.x, dz=hl.z-.4, d=Math.hypot(dx,dz); if(d<3.2&&d>.01){ const w=giL2W(dx/d*3.2,.4+dz/d*3.2); P.x=w.x; P.z=w.z; } } }
  if(S.top>0&&abs<=g+(was?.35:.001)&&P.vy<=0){ P.y=0; P.vy=0; P.air=0; GI.gy=g; abs=g; GI.on=true; GI.onLedge=S.led; GI.onT=Date.now(); if(!was){ fxRing(P.x,P.z,0x9dffb8,2.4,.3); } }
  else { if(was&&P.y<=.01&&P.vy<=0&&P.air===0) P.air=1; GI.on=false; GI.onLedge=null; GI.gy=g; P.y=Math.max(0,abs-g); if(abs<g){ GI.gy=g; P.y=0; } }
  GI.prevAbs=GI.gy+P.y; GI.lpx=P.x; GI.lpz=P.z;
  const tot=GI.gy+P.y; player.position.set(P.x,th+tot+(P.ride?RIDE_H:0),P.z);
  const ct=GI.on?GI.gy:Math.min(GI.gy+P.y,Math.max(GI.camY,GI.gy)); GI.camY+=(ct-GI.camY)*Math.min(1,dt*(ct<GI.camY-3?8:4)); if(GI.camY<.02&&GI.gy<=0) GI.camY=0; P.gy=th+GI.camY;
  // 정상!
  if(GI.on&&GI.onLedge&&GI.onLedge.top&&!giSleeping()&&!GI.topR[GI.r]){ GI.topR[GI.r]=1; G.giTop=(G.giTop||0)+1; const gold=Math.round(150+G.lv*15); G.gold+=gold; saveGame(); try{ net.send({t:"gitp"}); }catch(e){}
    fxSpark(P.x,tot+1,P.z,0xffe08a,30); jingle([659,880,1175,1568]); buzz([20,20,40]); try{ lvBanner("🏔️ 정상!","거인 머리 꼭대기",`금화 +${fmt(gold)} · 머리 꼭대기 룬을 부숴요!`,"#ffe08a"); }catch(e){ toast("🏔️ 정상!",`금화 +${fmt(gold)}`,2.4); } } }
/* 거인 위(3m 넘게)에 있을 때는 땅의 괴물·친구 공격이 닿지 않음 — 거인이 주는 피해만 */
(function(){ const _h=hurtPlayer; hurtPlayer=function(dmg,from){ if(GI.gy>3&&!(from&&typeof from==="object"&&from.gi)) return; return _h(dmg,from); }; })();
/* 룬 때리기: 공격 버튼이 나갔을 때(쿨이 다시 걸렸을 때) 가까운 룬을 맞힘 */
(function(){ const _a=attack; attack=function(){ const c0=P.atkCd; const r=_a.apply(this,arguments); if(P.atkCd>c0+.01) try{ giTryHit(); }catch(e){ console.warn(e); } return r; }; })();
function giTryHit(){ if(!GI.vis||giSleeping()||!giActive()) return; const B=giBroken(); const wk=(typeof myWeaponKind==="function")?myWeaponKind():"sword"; const reach=wk==="bow"||wk==="magic"?14:4.6;
  const my=hAt(P.x,P.z)+GI.gy+P.y+1.2; let best=-1, bd=1e9;
  GI_RUNES.forEach((R,k)=>{ if(B[k]) return; const p=giL2W(R.x,R.z); const d=Math.hypot(p.x-P.x,p.z-P.z,GI.base+GI.lift+R.y-my); if(d<reach&&d<bd){ bd=d; best=k; } });
  if(best<0) return; const k=best; GI.hits[k]=(GI.hits[k]||0)+1; GI.myHit[GI.r]=1; try{ net.send({t:"gih",d:kday(),r:GI.r,k}); }catch(e){}
  const R=GI_RUNES[k], p=giL2W(R.x,R.z); const y=GI.base+GI.lift+R.y-hAt(p.x,p.z); fxSpark(p.x,y,p.z,0xd8b0ff,8); floatDmg(p.x,y+1,p.z,`💎 ${Math.min(GI_HP,GI.hits[k])}/${GI_HP}`,"crit"); tone(1200,.06,"triangle"); tone(900,.08,"square",.03,.05);
  const rm=GI.P&&GI.P.runes[k]; if(rm) rm.userData.hit=.15;
  if(GI.hits[k]>=GI_HP) giBreak(k,true); }
/* ---------- 흔들기 · 발 구르기 ---------- */
function giShakeTick(dt){ const now=Date.now(); const cyc=Math.floor(now/GI_SHAKE), ph=now%GI_SHAKE; const walking=!giSleeping();
  if(cyc!==GI.shCyc){ GI.shCyc=cyc; GI.held=false; }
  const warn=walking&&ph>GI_SHAKE-3500&&ph<GI_SHAKE-1500; GI.warn=warn;
  if(warn&&GI.on&&GI.warnShown!==cyc){ GI.warnShown=cyc; toast("🏔️ 거인이 몸을 흔들려고 해요!","✊ 꽉 붙잡기 버튼을 눌러요!",1.8); tone(140,.4,"sawtooth",0,.08); buzz([40,40,40]); }
  if(walking&&ph>=GI_SHAKE-1500&&GI.shDone!==cyc){ GI.shDone=cyc; const d=Math.hypot(P.x-GI.x,P.z-GI.z); if(d<70){ P.shake=Math.max(P.shake||0,d<20?1:.5); thud(); }
    if(GI.P){ GI.shT=1.2; }
    if(GI.on||(GI.gy>0&&P.y<1.5)){ if(GI.held){ toast("✊ 꽉 붙잡고 버텼어요!",null,1.4); jingle([659,880]); fxSpark(P.x,GI.gy+1,P.z,0xffffff,10); }
      else { const dx=P.x-GI.x, dz=P.z-GI.z, dd=Math.hypot(dx,dz)||1; P.dashT=.35; P.dashX=dx/dd*26; P.dashZ=dz/dd*26; P.vy=7; P.y=Math.max(P.y,.05); P.air=1; GI.on=false; toast("😵 거인이 흔들어서 떨어졌어요!","날개 신발(점프 3번)로 다시 붙어 봐요",2); buzz(60); } } } }
CTX_EXTRA.unshift(()=>GI.warn&&(GI.on||GI.gy>0)&&!GI.held?{t:"✊ 꽉 붙잡기!",f:()=>{ GI.held=true; tone(500,.08,"square"); buzz(20); toast("✊ 꽉 붙잡았어요!",null,.8); }}:null);
function giStep(){ if(giSleeping()) return; const dist=Date.now()/1000*GI_SPD; const n=Math.floor(dist/GI_STEP); if(n===GI.stepN) return; const first=GI.stepN<0; GI.stepN=n; if(first) return;
  const s=n%2?1:-1; const f=giL2W(s*3.2,.8); const d=Math.hypot(P.x-f.x,P.z-f.z); const far=Math.hypot(P.x-GI.x,P.z-GI.z);
  if(far<90){ const v=Math.max(.02,.14*(1-far/90)); tone(60,.3,"sine",0,v); tone(45,.4,"sine",.04,v); if(far<40){ P.shake=Math.max(P.shake||0,.35*(1-far/40)); } fxRing(f.x,f.z,0xd8cfb8,6,.6); if(far<60) for(let i=0;i<(ECO()?3:7);i++) fxSpark(f.x+rnd(-2,2),.4,f.z+rnd(-2,2),0xd8cfb8,2); }
  if(d<4.2&&GI.gy<=0&&P.y<.8&&!P.dead){ hurtPlayer(stat().mhp*.07,{n:"산 거인의 발",gi:1}); const dd=d||1; P.dashT=.25; P.dashX=(P.x-f.x)/dd*20; P.dashZ=(P.z-f.z)/dd*20; P.vy=6; } }
/* ---------- 매 프레임 ---------- */
function giTick(dt){ if(!started||G.realm<0) return; giDaySync(); const act=giActive(); const away=(typeof glAway==="function"&&glAway());
  if(act&&!GI.wasActive&&GI.annDay!==kday()+(giKst().getUTCHours()>=19?.5:0)){ GI.annDay=kday()+(giKst().getUTCHours()>=19?.5:0); setTimeout(()=>{ if(!layerOpen){ toast("🏔️ 산 거인이 산책을 나왔어요!","메뉴 → 걸어 다니는 산 거인 · 등에 올라타서 룬 5개를 부숴요",3.4); jingle([392,523,659]); } },2500); }
  GI.wasActive=act;
  if(!act){ if(GI.g&&GI.g.visible){ GI.g.visible=false; } GI.vis=false; if(GI.gy>0) giDrop(); giChests(false); giBar(); return; }
  if(!GI.built){ GI.built=true; try{ GI.P=giModel(); GI.g=GI.P.g; scene.add(GI.g); }catch(e){ console.warn(e); GI.g=null; } }
  if(!GI.g) return;
  GI.px=GI.x; GI.pz=GI.z; GI.pyaw=GI.yaw; const sl=giSleeping();
  if(GI.sleep&&!sl&&GI.wokeR!==GI.sleep.r){ GI.wokeR=GI.sleep.r; fxSpark(GI.sleep.x,2,GI.sleep.z,0xd8cfb8,40); giChests(false); const pp=giPose(); fxSpark(pp.x,2,pp.z,0xd8cfb8,40); GI.px=null; if(GI.gy>0) giDrop(); if(Math.hypot(P.x-GI.x,P.z-GI.z)<120&&!layerOpen) toast("🏔️ 거인이 일어나서 다시 산책을 떠났어요!","새 룬 5개가 반짝여요",2.4); }
  if(sl){ GI.x=GI.sleep.x; GI.z=GI.sleep.z; GI.yaw=GI.sleep.yaw; } else { const p=giPose(); GI.x=p.x; GI.z=p.z; GI.yaw=p.yaw; }
  const tgtLift=sl?-5.5:0; GI.lift+=(tgtLift-GI.lift)*Math.min(1,dt*1.5); if(Math.abs(GI.lift-tgtLift)<.02) GI.lift=tgtLift;
  GI.base=hAt(GI.x,GI.z);
  const dist=Math.hypot(P.x-GI.x,P.z-GI.z); GI.vis=!away&&dist<230; GI.g.visible=GI.vis;
  if(GI.vis){ const Pm=GI.P, tn=performance.now(); GI.g.position.set(GI.x,GI.base+GI.lift,GI.z); GI.g.rotation.y=GI.yaw;
    const ph=Date.now()/1000*GI_SPD/GI_STEP*Math.PI; let sw=sl?0:Math.sin(ph)*.32; GI.shT=Math.max(0,(GI.shT||0)-dt); const sh=GI.shT>0?Math.sin(tn/40)*.06*GI.shT:0;
    Pm.legs[0].rotation.x=sl?-1.45:sw; Pm.legs[1].rotation.x=sl?-1.45:-sw; Pm.legs.forEach(L=>L.position.y=10); Pm.arms[0].rotation.x=sl?-.2:-sw*.8; Pm.arms[1].rotation.x=sl?-.2:sw*.8; Pm.arms[0].rotation.z=sl?-.5:-.08; Pm.arms[1].rotation.z=sl?.5:.08;
    GI.g.rotation.z=sh; GI.g.rotation.x=sl?0:Math.abs(Math.sin(ph))*.015;
    const blink=(tn%4200)<160; Pm.lids.forEach(l=>{ l.position.y=sl||blink?24.55:24.85; }); Pm.eyes.forEach(e=>e.visible=!sl&&!blink);
    const B=giBroken(); Pm.runes.forEach((o,k)=>{ const u=o.userData; const br=!!B[k]; u.gem.visible=!br; u.core.visible=!br; u.ring.visible=!br; u.crack.visible=br; if(!br){ u.gem.rotation.y+=dt*1.5; u.ring.rotation.z+=dt*2; u.ring.rotation.x=Math.PI/2; const pul=1+Math.sin(tn/300+k)*.12+(u.hit>0?.35:0); u.gem.scale.setScalar(pul); u.hit=Math.max(0,(u.hit||0)-dt); } });
    if(sl&&Math.random()<dt*1.5){ const p=giL2W(0,4); fxSpark(p.x,GI.base+GI.lift+27-hAt(p.x,p.z),p.z,0xffffff,3); }
    if(!sl) giStep(); giShakeTick(dt); }
  else GI.warn=false;
  giPhys(dt);
  // 다른 사람이 거인 위에 있으면 높이 올려서 보임
  GI.sendT-=dt; const myTop=GI.gy+P.y; if(GI.sendT<=0&&(myTop>.5||GI.sentUp)){ GI.sendT=ECO()?.45:.3; GI.sentUp=myTop>.5; if(!(typeof GL!=="undefined"&&GL.on)) try{ net.send({t:"giy",y:+(GI.gy).toFixed(1)}); }catch(e){} }
  const tn=performance.now(); for(const id in PEERS){ const o=PEERS[id]; const up=o.giY>0&&tn-(o.giT||0)<1200; o.giS=(o.giS||0)+((up?o.giY:0)-(o.giS||0))*Math.min(1,dt*6); const add=Math.max(0,o.giS-(o.glS||0)); if(add>.05&&o.mesh) o.mesh.position.y+=add; }
  giLabel(dist); giBar(dist); }
XTICK.push(giTick);
function giLabel(dist){ if(!GI.lbl) GI.lbl=makeLabel("boss"); if(!GI.vis||layerOpen||dist>120||dist<20){ GI.lbl.style.display="none"; return; } const sl=giSleeping(); const n=giBrokenN();
  placeLabel(GI.lbl,GI.x,GI.base+GI.lift+32-hAt(GI.x,GI.z),GI.z,`<em style="color:#b8e07a">🏔️ 걸어 다니는 산 거인</em> <b>${sl?"💤 쿨쿨…":`💎 룬 ${n}/5`}</b>`); }
function giBar(dist){ if(!GI.bar){ const b=document.createElement("div"); b.id="giBar"; b.hidden=true; document.body.appendChild(b); GI.bar=b; } const b=GI.bar;
  const show=GI.vis&&dist!=null&&dist<70&&!layerOpen&&started; if(!show){ if(!b.hidden) b.hidden=true; return; } b.hidden=false; let bot=0; ["warbar","bossbar","evbar"].forEach(id=>{ const el=$(id); if(el&&!el.hidden){ const r=el.getBoundingClientRect(); if(r.height>0) bot=Math.max(bot,r.bottom); } }); const top=bot>0?Math.round(bot+6)+"px":""; if(b._t!==top){ b._t=top; b.style.top=top; } const B=giBroken(), sl=giSleeping();
  const h=sl?`<b>🏔️ 산 거인 💤</b><span>${Math.max(1,Math.ceil((GI.sleep.ts+GI_SLEEP-Date.now())/60000))}분 뒤 일어나요 · 오늘 멈춘 횟수 ${GI.r}</span>`:`<b>🏔️ 산 거인 · 💎 ${GI_RUNES.map((r,k)=>B[k]?"✅":"💎").join("")}</b><span>${GI.on||GI.gy>0?`높이 ${Math.round(GI.gy+P.y)}m · 등의 덩굴 발판으로 올라가요`:"등 뒤 덩굴 사다리를 점프로 타고 올라가요"}</span>`;
  if(b._h!==h){ b._h=h; b.innerHTML=h; } }
/* ---------- 지도 · 길 안내 · 창 ---------- */
MAP_X.push((ctx,tx,tz,big,u)=>{ if(!giActive()||(typeof glAway==="function"&&glAway())) return; const X=tx(GI.x), Z=tz(GI.z); ctx.beginPath(); ctx.arc(X,Z,9*u,0,6.2832); ctx.fillStyle="rgba(120,200,90,.25)"; ctx.fill(); mapPin(ctx,X,Z,(big?6:7.5)*u,"#6a8a4a","🏔️"); });
function giGuide(){ if(!giActive()){ toast("🏔️ 산 거인은 지금 쉬는 중",giNextTxt(),2.4); return; } const label="🏔️ 산 거인"; if(P.guide&&P.guide.label===label){ setGuide(null); return; } setGuide({x:GI.x,z:GI.z,label}); if(P.guide) P.guide.gi=1; }
XTICK.push(()=>{ const g=P.guide; if(!g||!g.gi) return; if(!giActive()){ P.guide=null; $("guide").hidden=true; return; } g.x=GI.x; g.z=GI.z; if(Math.hypot(P.x-GI.x,P.z-GI.z)<14){ P.guide=null; $("guide").hidden=true; toast("🏔️ 거인 발밑에 왔어요!","등 뒤의 덩굴 사다리를 점프로 올라가요",2.2); } });
function showGiant(){ giDaySync(); const act=giActive(), sl=giSleeping(), n=giBrokenN();
  card(`<h2>🏔️ 걸어 다니는 산 거인</h2><p>이끼 낀 둥근 돌 거인이 세계의 중심 둘레를 아주 천천히 걸어 다녀요. 땅에서 때리는 게 아니라, <b>등 뒤 덩굴 사다리 발판</b>을 점프로 타고 올라가 <b>반짝이는 룬 돌 5개</b>(허리·등·양 어깨·머리 꼭대기)를 부숴요. 친구가 때린 만큼 함께 깎여요!</p>
   <div class="idlegrid"><div><b>${act?(sl?"💤 잠자는 중":"🚶 걷는 중"):"🌙 쉬는 중"}</b><span>${act?(sl?`${Math.max(1,Math.ceil((GI.sleep.ts+GI_SLEEP-Date.now())/60000))}분 뒤 일어나요`:`룬 ${n}/5 부숨`):giNextTxt()}</span></div><div><b>${GI.r}</b><span>오늘 멈춘 횟수</span></div><div><b>${G.giN||0}</b><span>받은 보물 상자</span></div><div><b>${G.giTop||0}</b><span>정상에 오른 판</span></div></div>
   <h3>🎮 이렇게 놀아요</h3><div class="diary"><p>🪜 등 뒤 덩굴 발판을 점프로 하나씩 올라가요. 서 있으면 거인과 함께 실려 가요.</p><p>✊ 24초마다 거인이 몸을 흔들어요. 경고가 뜨면 「꽉 붙잡기!」를 눌러요 — 안 누르면 떨어져요(날개 신발로 다시 붙을 수도!).</p><p>🦶 발을 쿵 내디딜 때 발 옆에 있으면 아파요 — 점프하면 피해요.</p><p>💤 룬 5개를 다 부수면 거인이 앉아서 5분 동안 잠들고, 그 판에 함께한 사람 모두 <b>보물 상자</b>! 머리 꼭대기에 오르면 <b>정상 보너스</b>도 있어요.</p></div>
   <p style="font-size:12px">언제: 토요일·일요일 하루 종일 + 평일 저녁 7시~7시 40분(한국 시간). 거인 위(3m 넘게)에 있으면 땅의 괴물 공격이 닿지 않아요.</p>
   <button class="buy" id="giGo" style="align-self:center" ${act?"":"disabled"}>🧭 거인에게 길 안내</button>`);
  if($("giGo")) $("giGo").onclick=()=>{ closeLayer(); giGuide(); }; }
MENU_X.push({ic:"🏔️",n:"걸어 다니는 산 거인",id:"giBtn",sub:()=>{ giDaySync(); if(!giActive()) return "🌙 "+giNextTxt(); return giSleeping()?"💤 잠자는 중":`🚶 지금 걷는 중 · 룬 ${giBrokenN()}/5`; },f:showGiant});
TITLES.push({id:"gitop",n:"거인 정복자",t:2,h:"산 거인 머리 꼭대기에 오르기",g:()=>[G.giTop||0,1]},{id:"gin3",n:"거인의 친구",t:2,h:"산 거인을 멈추고 보물 상자 3번",g:()=>[G.giN||0,3]},{id:"gir10",n:"룬 부수는 망치",t:3,h:"룬 돌 마지막 한 방 10번",g:()=>[G.giRune||0,10]});
</script>
<style>
#giBar{position:fixed;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);z-index:5;pointer-events:none;min-width:240px;max-width:min(52vw,440px);padding:5px 14px 7px;border-radius:14px;background:linear-gradient(180deg,rgba(26,40,18,.88),rgba(18,26,30,.88));border:2px solid #b8e07a;box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 14px rgba(160,220,100,.4);color:#fff;text-align:center;display:flex;flex-direction:column;gap:1px}
#giBar[hidden]{display:none} #giBar b{font-size:14px;color:#e4ffc0;text-shadow:0 2px 0 #000} #giBar span{font-size:12px;opacity:.92}
</style>
