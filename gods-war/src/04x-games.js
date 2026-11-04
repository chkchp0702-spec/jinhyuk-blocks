<script>
/* ================= v49-1: 🏟️ 올림피아 놀이 마당 — 처음 만난 사람과 3분 미니게임 (IDEAS G11/5-2) =================
   네 수도마다 「놀이 마당 문」(월계관 아치). 들어가면 지도 밖(z≈-700) 올림피아 경기장 대기실.
   2~8명이 모일 때까지 20초 기다렸다가(가장 먼저 온 사람 폰이 "방장"이 되어 시작 신호 t:"pgs"), 모자라면 청동 거인 「탈로스」 로봇이 6자리까지 채움.
   미니게임 3판(오늘의 순서는 날짜로 정해짐, 모든 폰이 같음): 🪨 굴러오는 바위 피하기 · 🍎 황금 사과 줍기 · ☁ 무너지는 구름 발판.
   계급·장비·레벨·기술·신수 타기와 상관없이 모두 같은 속도·같은 힘(기술은 잠김, 다치지 않음).
   바위·사과·발판 순서는 시작 신호의 씨앗(seed)으로 모든 폰이 똑같이 만듦. 사람끼리는 사과 줍기(t:"pga")·발판 밟기(t:"pgt")·탈락(t:"pgo")·판 점수(t:"pgr")만 주고받음.
   판마다 순위 점수(1등 5·2등 3·3등 2·나머지 1) → 3판 합계로 시상대. 월계관 점수: 1등 10·2등 6·3등 4·나머지 2 → 이번 주 순위(보관 pl/<주>/<id>).
   꼴찌도 참가 상자. 판이 끝나면 정해진 말 버튼("한 판 더!"·"잘했어!"·"또 만나!"·"고마워!")으로 인사. */
const PGX=0, PGZ=-700, PG_T=4, PG_N=9, PG_H=18;
const PG_GAMES=[
 {id:"rock",n:"굴러오는 바위 피하기",ic:"🪨",L:50,how:"바위에 맞으면 ❤ 하나를 잃어요 · 작은 바위는 점프로 넘어요"},
 {id:"apple",n:"황금 사과 줍기",ic:"🍎",L:40,how:"사과를 많이 주워요 · 반짝이는 큰 사과는 3점!"},
 {id:"cloud",n:"무너지는 구름 발판",ic:"☁",L:60,how:"흔들리는 발판에서 얼른 비켜요 · 한 곳에 오래 서 있으면 무너져요"}];
const PG_INTRO=5, PG_RES=5, PG_POD=9, PG_FILL=6, PG_MAX=8, PG_WAIT=20;
const PG_PTS=[5,3,2], PG_LAUREL=[10,6,4];
const PG_SAY=["한 판 더!","잘했어!","또 만나!","고마워!"];
const PG_BOTN=["탈로스 ①","탈로스 ②","탈로스 ③","탈로스 ④","탈로스 ⑤","탈로스 ⑥"];
const PG={on:false,built:false,parts:[],state:"off",joinT:0,lobby:{},hostT:0,left:PG_WAIT,hbT:0,m:null,cd:0,lbl:null,gates:[],gateLbl:null,fall:null,px:0,pz:0,crowd:null,crowdT:0,cheer:0,tiles:[],hud:null,lastHud:"",pubT:5,dirty:true,amb:0};
const PLO={};
function pgIn(z){ return z<-550; }
function pgWeek(){ return Math.floor((kday()+3)/7); }
function pgData(){ const w=pgWeek(); if(!G.pl||G.pl.w!==w) G.pl={w,p:0,wn:0,g:0}; return G.pl; }
function pgOrder(){ const r=dgRng(kday()*977+41); const a=[0,1,2]; for(let i=2;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
/* ---------- 높이: 시상대만 솟아 있고 나머지는 평평 (발판 떨어짐은 따로 계산) ---------- */
const PG_POD_SPOT=[{x:0,h:2.8},{x:-5,h:2},{x:5,h:1.4}];   // 1·2·3등 (북쪽 z=-27)
function pgH(x,z){ const lx=x-PGX, lz=z-PGZ; if(Math.abs(lz+27)<2){ for(const s of PG_POD_SPOT) if(Math.abs(lx-s.x)<2) return s.h; } return 0; }
(function(){ const _h=hAt; hAt=function(x,z){ return z<-550?pgH(x,z):_h(x,z); }; })();
/* ---------- 수도의 놀이 마당 문 ---------- */
function pgSpot(r){ const cap=REGIONS[r*3]; const obs=[]; const add=(x,z,rad)=>obs.push([x,z,rad]);
  try{ const f=fgSpot(r); add(f.x,f.z,7); }catch(e){} try{ const g=gdSpot(r); add(g.x,g.z,7); }catch(e){} try{ const w=wdSpot(r); add(w.x,w.z,15); }catch(e){} try{ const o=OR.spots[r]; add(o.x,o.z,8); }catch(e){}
  const A=ALTARS[cap.id]; if(A){ add(A.trial.x,A.trial.z,6); if(A.shrine){ add(A.shrine.x,A.shrine.z,11); const dir=cap.z>0?-1:1, sx=cap.x>0?-1:1; add(A.shrine.x+sx*11,A.shrine.z+dir*20,5); add(A.shrine.x,A.shrine.z+dir*16,4); } }
  add(cap.x+(cap.x>0?-18:18),cap.z+(cap.z>0?6:-6),9);
  const PR={house:6,church:9,prop:3,flag:2,market:4,castle:15}; try{ PLACED.forEach(o=>{ if(o.realm===r&&PR[o.kind]&&Math.hypot(o.x-cap.x,o.z-cap.z)<75) add(o.x,o.z,PR[o.kind]); }); }catch(e){} add(cap.x,cap.z,6);
  try{ TREEPOS.forEach(t=>{ const tx=t.x!=null?t.x:t[0], tz=t.z!=null?t.z:t[1]; if(Math.hypot(tx-cap.x,tz-cap.z)<70) add(tx,tz,3); }); }catch(e){}
  try{ const co=RC.courses[r]; add(co.S.x,co.S.z,8); co.rings.forEach(k=>{ if(Math.hypot(k.x-cap.x,k.z-cap.z)<70) add(k.x,k.z,4); }); }catch(e){}
  let best=null; for(let a=0;a<6.283;a+=.08) for(let d=16;d<=40;d+=2){ const x=cap.x+Math.cos(a)*d, z=cap.z+Math.sin(a)*d; if(Math.abs(x)>WORLD_HALF-10||Math.abs(z)>WORLD_HALF-10) continue; let m=99; obs.forEach(o=>{ m=Math.min(m,Math.hypot(x-o[0],z-o[1])-o[2]); }); const sc=Math.min(m,9)-Math.abs(d-28)*.08; if(!best||sc>best.sc) best={x,z,sc}; }
  return {x:best.x,z:best.z,rot:Math.atan2(cap.x-best.x,cap.z-best.z)}; }
function pgArch(big){ const g=new THREE.Group(); const marble=M.marble||mat({color:0xf4efe2}), gold=M.gold; const s=big?1.5:1;
  [-1,1].forEach(k=>{ g.add(cyl(.55*s,.65*s,6*s,marble,k*3.2*s,3*s,0,12)); g.add(box(1.7*s,.5*s,1.7*s,marble,k*3.2*s,.25*s,0)); g.add(box(1.5*s,.4*s,1.5*s,gold,k*3.2*s,6.15*s,0)); });
  g.add(box(8.4*s,.9*s,1.6*s,marble,0,6.8*s,0)); g.add(box(8.8*s,.25*s,1.8*s,gold,0,7.35*s,0));
  const lr=new THREE.Mesh(new THREE.TorusGeometry(1.25*s,.22*s,8,28),mat({color:0x4fae4a,roughness:.7})); lr.position.set(0,8.4*s,0); g.add(lr);
  for(let k=0;k<10;k++){ const a=k/10*6.283; const lf=sph(.28*s,mat({color:0x6bc85a,roughness:.6}),Math.cos(a)*1.25*s,8.4*s+Math.sin(a)*1.25*s,.12*s); lf.scale.set(1,.5,.5); lf.rotation.z=a; g.add(lf); }
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.45*s,.2*s,10,40),glowMat(0xffd27a,.75)); ring.position.y=3.1*s; ring.userData.noOutline=true; g.add(ring);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(2.35*s,40),glowMat(0x7ac8ff,.28)); disc.position.y=3.1*s; disc.userData.noOutline=true; g.add(disc);
  [-1,1].forEach(k=>{ const f=sph(.42*s,glowMat(0xff9a30,.85),k*3.2*s,6.9*s,.9*s); f.userData.noOutline=true; g.add(f); g.userData["f"+k]=f; });
  g.userData.ring=ring; g.userData.disc=disc; return g; }
(function(){ for(let r=0;r<4;r++){ let s; try{ s=pgSpot(r); }catch(e){ const c=REGIONS[r*3]; s={x:c.x+(c.x>0?-26:26),z:c.z,rot:0}; } const g=pgArch(false); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); PG.gates[r]={x:s.x,z:s.z,rot:s.rot,g}; } })();
function pgGateNear(){ if((typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||PG.on) return null; for(const s of PG.gates){ if(s&&Math.hypot(P.x-s.x,P.z-s.z)<6) return s; } return null; }
/* ---------- 청동 거인 탈로스 (로봇 참가자) ---------- */
function pgTalos(k){ const g=new THREE.Group(); const br=mat({color:0xa8601c,metalness:.45,roughness:.42}), dk=mat({color:0x5a3410,metalness:.35,roughness:.55}), eye=glowMat([0x7af0ff,0xffd27a,0xff7ab0,0x9aff7a,0xc89aff,0xffa040][k%6],.95);
  const body=new THREE.Group(); g.add(body); body.add(box(1.25,1.4,.8,br,0,2.25,0)); body.add(box(1.35,.25,.9,dk,0,1.55,0)); body.add(box(1.4,.18,.95,dk,0,2.95,0));
  const head=new THREE.Group(); head.position.y=3.35; body.add(head); head.add(box(.75,.7,.7,br,0,.15,0)); const v=box(.62,.14,.05,eye,0,.2,.36); v.userData.noOutline=true; head.add(v); const crest=box(.12,.35,.75,dk,0,.6,0); head.add(crest);
  const limb=(x,y,len,w)=>{ const p=new THREE.Group(); p.position.set(x,y,0); const c=cyl(w,w*.9,len,br,0,-len/2,0,8); p.add(c); p.add(sph(w*1.15,dk,0,-len,0)); return p; };
  const aL=limb(-.8,2.85,1.15,.2), aR=limb(.8,2.85,1.15,.2), lL=limb(-.32,1.5,1.45,.24), lR=limb(.32,1.5,1.45,.24); body.add(aL,aR); g.add(lL,lR);
  g.userData={body,aL,aR,lL,lR,h:4.2}; return g; }
/* ---------- 경기장 만들기 ---------- */
function pgBuild(){ if(PG.built) return; PG.built=true; const add=o=>{ scene.add(shadowify(o)); PG.parts.push(o); return o; };
  const marble=M.marble||mat({color:0xf4efe2}), gold=M.gold, stone=mat({color:0xd8cfbd,roughness:.9}), dk=mat({color:0xa89a82,roughness:.9});
  const G0=new THREE.Group(); G0.position.set(PGX,0,PGZ);
  // 바닥: 가운데 9×9 구름 발판을 둘러싼 대리석 테두리(4조각)
  G0.add(box(70,1,17,marble,0,-.5,-26.5)); G0.add(box(70,1,17,marble,0,-.5,26.5)); G0.add(box(17,1,36,marble,-26.5,-.5,0)); G0.add(box(17,1,36,marble,26.5,-.5,0));
  G0.add(box(36.6,.18,.5,gold,0,.04,-18.1)); G0.add(box(36.6,.18,.5,gold,0,.04,18.1)); G0.add(box(.5,.18,36.6,gold,-18.1,.04,0)); G0.add(box(.5,.18,36.6,gold,18.1,.04,0));
  // 관중석(북·동·서 계단) + 남쪽 입구
  for(let k=0;k<3;k++){ const h=1.6+k*1.7, d=37+k*3.6, w=72+k*7.2; G0.add(box(w,h,3.6,stone,0,h/2,-d)); G0.add(box(3.6,h,w*.88,stone,-d,h/2,-3)); G0.add(box(3.6,h,w*.88,stone,d,h/2,-3)); G0.add(box(w,.2,3.7,dk,0,h+.1,-d)); }
  [-1,1].forEach(s=>{ for(let k=0;k<3;k++){ const h=1.6+k*1.7, d=37+k*3.6; G0.add(box(22,h,3.6,stone,s*(24+k*1.5),h/2,d)); } });
  // 기둥 + 세계 깃발
  [[-34,-34],[34,-34],[-34,34],[34,34]].forEach(([x,z],i)=>{ G0.add(cyl(.9,1.1,12,marble,x,6,z,12)); G0.add(box(2.4,.6,2.4,gold,x,12.2,z)); const R=REALMS[i]; const fl=box(.12,3,4.4,mat({color:new THREE.Color(R.c1),roughness:.8}),x,9.6,z+(z<0?2.3:-2.3)); fl.userData.flag=1; G0.add(fl); G0.add(cyl(.12,.12,4,gold,x,9.6,z,6)); });
  // 성화대
  { const t=new THREE.Group(); t.add(cyl(1.6,2.2,1,marble,0,.5,0,16)); t.add(cyl(.7,1,8,marble,0,5,0,12)); t.add(cyl(2.2,1,1.4,gold,0,9.6,0,16)); const f1=sph(1.7,glowMat(0xff7a20,.85),0,11,0), f2=sph(1.1,glowMat(0xffd060,.9),0,11.9,0); f1.userData.noOutline=f2.userData.noOutline=true; t.add(f1,f2); t.position.set(0,6.8,-46); G0.add(t); PG.fire=[f1,f2]; }
  // 시상대
  PG_POD_SPOT.forEach((s,i)=>{ G0.add(box(4,s.h,4,[gold,mat({color:0xd8dde6,metalness:.6,roughness:.35}),mat({color:0xcd8a4e,metalness:.55,roughness:.4})][i],s.x,s.h/2,-27)); G0.add(box(4.2,.2,4.2,marble,s.x,s.h+.1,-27)); });
  // 남쪽: 돌아가는 문
  const arch=pgArch(true); arch.position.set(0,0,33.5); G0.add(arch); PG.exitArch=arch;
  add(G0);
  // 구름 발판
  const tg=new THREE.BoxGeometry(PG_T-.25,.8,PG_T-.25); const tm=[mat({color:0xffffff,roughness:.85}),mat({color:0xcfe4ff,roughness:.85})];
  PG.tiles=[]; for(let i=0;i<PG_N;i++) for(let j=0;j<PG_N;j++){ const k=i*PG_N+j; const m=new THREE.Mesh(tg,tm[(i+j)%2].clone()); const x=PGX-PG_H+PG_T/2+j*PG_T, z=PGZ-PG_H+PG_T/2+i*PG_T; m.position.set(x,-.4,z); m.receiveShadow=HIGH(); scene.add(m); PG.parts.push(m); PG.tiles.push({m,x,z,s:0,t:0,c0:m.material.color.clone()}); }
  // 발판 아래 구름 바다
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(260,260),new THREE.MeshBasicMaterial({color:0xf2f8ff,transparent:true,opacity:.92})); sea.rotation.x=-Math.PI/2; sea.position.set(PGX,-26,PGZ); scene.add(sea); PG.parts.push(sea);
  for(let k=0;k<26;k++){ const c=sph(rnd(3,7),mat({color:0xffffff,roughness:1}),PGX+rnd(-60,60),-24+rnd(-1,2),PGZ+rnd(-60,60)); c.scale.y=.45; scene.add(c); PG.parts.push(c); }
  // 관중(로봇 아닌 그림자 관중)
  const N=ECO()?60:130; const cg=new THREE.BoxGeometry(.9,1.5,.7); const cm=mat({roughness:.8}); const im=new THREE.InstancedMesh(cg,cm,N); const dm=new THREE.Object3D(); const cols=[0xffd95e,0x8fd0ff,0xff8a5a,0xa0e070,0xd8a0ff,0xffffff].map(c=>new THREE.Color(c)); const pos=[];
  for(let i=0;i<N;i++){ const side=i%3, k=Math.floor(rnd(0,3)), h=1.6+k*1.7, d=37+k*3.6; let x,z; if(side===0){ x=rnd(-32,32); z=-d; } else { x=(side===1?-1:1)*d; z=rnd(-30,24); } pos.push({x:PGX+x,y:h+.75,z:PGZ+z,p:rnd(0,6)}); dm.position.set(PGX+x,h+.75,PGZ+z); dm.updateMatrix(); im.setMatrixAt(i,dm.matrix); im.setColorAt(i,cols[i%cols.length]); }
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(im); PG.parts.push(im); PG.crowd={im,pos,dm};
  PG.parts.forEach(o=>o.traverse(m=>{ if(m.material&&m.material.blending===THREE.AdditiveBlending){ m.castShadow=false; m.userData.noOutline=true; } })); }
function pgTileAt(x,z){ const lx=x-PGX+PG_H, lz=z-PGZ+PG_H; if(lx<0||lz<0||lx>=PG_H*2||lz>=PG_H*2) return -1; return Math.floor(lz/PG_T)*PG_N+Math.floor(lx/PG_T); }
function pgTilesReset(){ PG.tiles.forEach(t=>{ t.s=0; t.t=0; t.m.visible=true; t.m.position.set(t.x,-.4,t.z); t.m.rotation.set(0,0,0); t.m.material.color.copy(t.c0); }); }
function pgShake(k){ const t=PG.tiles[k]; if(!t||t.s) return false; t.s=1; t.t=1.3; return true; }
/* ---------- 들어가기 · 나가기 ---------- */
function pgEnter(){ if(PG.on||P.dead) return; if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  closeLayer(); if(DG.on) dgExit(true); if(HM.on) hmExit(); if(DS.on) dsExit(true,true); if(typeof RC!=="undefined"&&RC.on) try{ rcEnd(false); }catch(e){} try{ if(P.ride) rdSet(false); }catch(e){}
  pgBuild(); pgTilesReset(); PG.on=true; PG.state="lobby"; PG.joinT=Date.now(); PG.hostT=0; PG.lobby={}; PG.m=null; PG.fall=null; PG.cd=2.5; PG.hbT=0;
  P.x=PGX+rnd(-6,6); P.z=PGZ+26; P.y=0; P.vy=0; P.rot=Math.PI; P.guide=null; $("guide").hidden=true; PG.px=P.x; PG.pz=P.z; G.pgIn=(G.pgIn||0)+1; saveGame();
  try{ lvBanner("올림피아","🏟️ 놀이 마당","사람이 모이면 미니게임 3판 · 20초가 지나면 탈로스 로봇이 빈자리를 채워요","#ffd27a"); }catch(e){ toast("🏟️ 올림피아 놀이 마당"); } fxRing(P.x,P.z,0xffd27a,8,.8); fxSpark(P.x,2,P.z,0xffd27a,30); jingle([523,659,784,1046]); }
function pgExit(silent,noTp){ if(!PG.on) return; if(PG.m) pgDropMatch(); player.visible=true; PG.on=false; PG.state="off"; PG.fall=null; if(PG.lbl) PG.lbl.style.display="none"; if(PG.hud) PG.hud.hidden=true;
  if(!noTp){ const s=PG.gates[Math.max(0,G.realm)]; P.x=s.x+Math.sin(s.rot)*7; P.z=s.z+Math.cos(s.rot)*7; P.y=0; P.vy=0; P.rot=s.rot; PG.cd=4; } if(!silent) toast("수도로 돌아왔어요","놀이 마당 문은 언제든 열려 있어요",2); }
(function(){ const _sh=spawnAtHome; spawnAtHome=function(){ if(PG.on) pgExit(true,true); _sh(); };
  const _hp=hurtPlayer; hurtPlayer=function(d,f){ if(PG.on) return; return _hp(d,f); };
  const _us=useSkill; useSkill=function(i){ if(PG.on){ toast("🏟️ 놀이 마당에서는 모두 같은 힘!","기술 대신 점프로 피해요",1.4); return; } return _us(i); }; })();
/* ---------- 대기실: 함께 모이기 (방장 = 가장 먼저 온 사람) ---------- */
NETR.pgl=(o,d)=>{ if(!PG.on) return; PG.lobby[o.id]={j:d.j||0,mt:d.mt||0,left:d.left,last:performance.now(),n:o.name,r:o.realm}; };
function pgMembers(){ const now=performance.now(); const L=[{id:G.id,j:PG.joinT,n:G.name,r:G.realm,me:1}]; let busy=false; for(const id in PG.lobby){ const l=PG.lobby[id]; if(now-l.last>5000||!PEERS[id]){ delete PG.lobby[id]; continue; } if(l.mt) busy=true; else L.push({id,j:l.j,n:l.n,r:l.r,left:l.left}); }
  L.sort((a,b)=>a.j-b.j||(a.id<b.id?-1:1)); return {L,busy}; }
function pgLobbyTick(dt){ const {L,busy}=pgMembers(); const host=L[0]; PG.isHost=host.me===1; PG.nMem=L.length; PG.busy=busy;
  if(busy){ PG.hostT=0; PG.left=PG_WAIT; return; }
  if(PG.isHost){ if(!PG.hostT) PG.hostT=Date.now(); PG.left=Math.max(0,PG_WAIT-(Date.now()-PG.hostT)/1000); if(PG.left<=0||L.length>=PG_MAX) pgHostStart(L); }
  else { PG.hostT=0; PG.left=host.left!=null?host.left:PG_WAIT; } }
function pgHostStart(L){ L=L||pgMembers().L; const ids=L.slice(0,PG_MAX).map(x=>x.id); const sd=1+Math.floor(Math.random()*2e9); try{ net.send({t:"pgs",m:sd,ids}); setTimeout(()=>{ try{ net.send({t:"pgs",m:sd,ids}); }catch(e){} },400); }catch(e){} pgBegin(sd,ids); }
NETR.pgs=(o,d)=>{ if(!PG.on||PG.m||PG.state!=="lobby") return; if(!Array.isArray(d.ids)||d.ids.indexOf(G.id)<0) return; pgBegin(d.m|0,d.ids); };
/* ---------- 경기 ---------- */
function pgBegin(sd,ids){ if(PG.m) return; const order=pgOrder(); const plist=[]; ids.slice(0,PG_MAX).forEach(id=>{ if(id===G.id) plist.push({id,n:G.name,r:G.realm,me:1}); else { const o=PEERS[id]; plist.push({id,n:o?o.name:"모험가",r:o?o.realm:0,hum:1}); } });
  const br=dgRng(sd*13+5); let b=0; while(plist.length<PG_FILL){ plist.push({id:"bot"+b,n:PG_BOTN[b],r:-1,bot:1,sk:.45+br()*.4,k:b}); b++; }
  const m={sd,order,plist,t0:Date.now()+3000,ph:[],pi:0,pts:{},rec:[{},{},{}],live:{},rs:null,cur:-1,done:false,mine:[0,0,0],podium:null};
  let t=0; order.forEach((g,i)=>{ const L=PG_GAMES[g].L; m.ph.push({k:"intro",i,at:t}); m.ph.push({k:"play",i,at:t+PG_INTRO}); m.ph.push({k:"res",i,at:t+PG_INTRO+L}); t+=PG_INTRO+L+PG_RES; }); m.ph.push({k:"pod",at:t}); m.ph.push({k:"end",at:t+PG_POD}); m.len=t+PG_POD;
  plist.forEach(p=>{ m.pts[p.id]=0; if(p.bot){ p.mesh=pgTalos(p.k); p.x=PGX; p.z=PGZ+20; p.y=0; p.vy=0; p.rot=0; p.walk=0; p.lbl=makeLabel(""); scene.add(shadowify(p.mesh)); } });
  PG.m=m; PG.state="play"; closeLayer(); const hum=plist.filter(p=>!p.bot).length;
  toast(`🏟️ ${hum}명${plist.length>hum?" + 탈로스 "+(plist.length-hum):""} · 곧 시작!`,order.map(g=>PG_GAMES[g].ic+" "+PG_GAMES[g].n).join(" → "),3); jingle([392,523,659,784]); }
function pgDropMatch(){ const m=PG.m; if(!m) return; pgClearRound(); m.plist.forEach(p=>{ if(p.bot){ scene.remove(p.mesh); p.lbl.remove(); } }); PG.m=null; PG.state="lobby"; PG.joinT=Date.now(); PG.hostT=0; pgTilesReset(); }
function pgNow(){ return PG.m?(Date.now()-PG.m.t0)/1000:0; }
function pgSlot(p,i,n){ const a=i/n*6.283+.3; return {x:PGX+Math.cos(a)*9,z:PGZ+Math.sin(a)*9,rot:Math.atan2(-Math.cos(a),-Math.sin(a))}; }
function pgSpec(){ P.x=PGX+rnd(-12,12); P.z=PGZ+rnd(23,29); P.y=0; P.vy=0; P.rot=Math.PI; PG.px=P.x; PG.pz=P.z; }
function pgClearRound(){ const rs=PG.m&&PG.m.rs; if(!rs) return; (rs.rocks||[]).forEach(b=>{ if(b.mesh) scene.remove(b.mesh); }); (rs.apples||[]).forEach(a=>{ if(a.mesh) scene.remove(a.mesh); }); PG.m.rs=null; }
const PGGEO={};
function pgRockMesh(r){ if(!PGGEO.rock) PGGEO.rock=new THREE.DodecahedronGeometry(1,1); if(!PGGEO.rm) PGGEO.rm=mat({color:0x9a8670,roughness:.95,map:noiseTex("#c8c8c8",["#a8a8a8","#dadada","#909090"],10)}); const g=new THREE.Group(); const s=new THREE.Mesh(PGGEO.rock,PGGEO.rm); s.scale.setScalar(r); s.castShadow=HIGH(); g.add(s); g.userData.s=s; return g; }
function pgAppleMesh(big){ const g=new THREE.Group(); const gm=big?mat({color:0xffc830,metalness:.7,roughness:.25,emissive:0x664400,emissiveIntensity:.4}):mat({color:0xe8b020,metalness:.5,roughness:.35}); const s=big?1.1:.62; g.add(sph(s,gm,0,s,0)); const st=cyl(.05,.05,.4,mat({color:0x6a4a2a}),0,s*2+.1,0,5); g.add(st); const lf=sph(.2,mat({color:0x5ab84a}),.18,s*2+.15,0); lf.scale.set(1.4,.35,.7); g.add(lf); const ring=new THREE.Mesh(new THREE.RingGeometry(s*1.1,s*1.5,24),glowMat(big?0xffe07a:0xfff0b0,.55)); ring.rotation.x=-Math.PI/2; ring.position.y=.06; ring.userData.noOutline=true; g.add(ring); return g; }
function pgRoundSetup(i){ const m=PG.m; const gi=m.order[i], gd=PG_GAMES[gi]; const r=dgRng(m.sd*31+i*977+7); const rs={g:gd.id,i,L:gd.L,me:{out:false,score:0,hearts:3,inv:0,stand:-1,standT:0},bots:{}};
  if(gd.id==="rock"){ rs.rocks=[]; let t=1.4; while(t<gd.L-1.5){ const f=t/gd.L; const mk=()=>{ const small=r()<.55; rs.rocks.push({t,side:Math.floor(r()*4),off:(r()*2-1)*15.5,sp:(8+f*7)*(small?1.15:1)*(.9+r()*.25),r:small?.9:2,on:false,gone:false}); }; mk(); if(f>.45&&r()<.35) mk(); if(f>.75&&r()<.3) mk(); t+=1.5-f*.95; } }
  if(gd.id==="apple"){ rs.apples=[]; let k=0; for(let t=.4;t<gd.L-1.2;t+=.62){ const big=k%7===6; rs.apples.push({k,t,x:PGX+(r()*2-1)*16,z:PGZ+(r()*2-1)*16,big,life:big?7:10,on:false,got:null}); k++; } }
  if(gd.id==="cloud"){ const ord=[...Array(PG_N*PG_N).keys()]; for(let a=ord.length-1;a>0;a--){ const j=Math.floor(r()*(a+1)); [ord[a],ord[j]]=[ord[j],ord[a]]; } rs.ev=[]; let t=2,j=0; while(t<gd.L-1&&j<ord.length){ const f=t/gd.L; const n=f>.6?2:1; for(let q=0;q<n&&j<ord.length;q++) rs.ev.push({t,k:ord[j++]}); t+=2-f*1.4; } rs.evI=0; pgTilesReset(); }
  m.plist.forEach(p=>{ if(p.bot) rs.bots[p.id]={out:false,score:0,hearts:3,inv:0,tx:null,tz:null,think:0,eva:0,ex:0,ez:0,fall:0,wait:0}; });
  m.rs=rs; return rs; }
function pgPhase(ph){ const m=PG.m; if(ph.k==="intro"){ pgClearRound(); const rs=pgRoundSetup(ph.i); const gd=PG_GAMES[m.order[ph.i]];
    m.plist.forEach((p,i)=>{ const s=pgSlot(p,i,m.plist.length); if(p.me){ PG.fall=null; P.x=s.x; P.z=s.z; P.y=0; P.vy=0; P.rot=s.rot; PG.px=P.x; PG.pz=P.z; } else if(p.bot){ p.x=s.x; p.z=s.z; p.y=0; p.vy=0; p.rot=s.rot; p.mesh.visible=true; } });
    try{ lvBanner(`${ph.i+1}판 / 3판`,`${gd.ic} ${gd.n}`,gd.how,"#ffd27a"); }catch(e){ toast(`${ph.i+1}판 ${gd.ic} ${gd.n}`,gd.how,3); } jingle([523,659,784]); m.cnt=4; }
  else if(ph.k==="play"){ const gd=PG_GAMES[m.order[ph.i]]; toast(`${gd.ic} 시작!`,null,1.2); tone(1046,.25,"square",0,.12); buzz(40); PG.cheer=1.2; }
  else if(ph.k==="res"){ const rs=m.rs; if(rs&&!rs.me.out&&rs.g!=="apple") rs.me.score=rs.L+(rs.g==="rock"?rs.me.hearts*5:0); if(rs&&rs.g!=="apple") for(const id in rs.bots){ const b=rs.bots[id]; if(!b.out) b.score=rs.L+(rs.g==="rock"?b.hearts*5:0); } if(rs){ m.mine[ph.i]=rs.me.score; const s=rs.me.score; try{ net.send({t:"pgr",m:m.sd,g:ph.i,s}); setTimeout(()=>{ try{ net.send({t:"pgr",m:m.sd,g:ph.i,s}); }catch(e){} },700); }catch(e){} }
    m.resAt=ph.at+1.3; m.resI=ph.i; player.visible=true; tone(784,.2,"triangle"); }
  else if(ph.k==="pod") pgPodium();
  else if(ph.k==="end") pgFinish(); }
/* 판 점수 → 순위 점수 */
function pgScores(i){ const m=PG.m, rs=m.rs; const L=m.plist.map(p=>{ let s=0; if(p.me) s=m.mine[i]; else if(p.bot) s=rs&&rs.bots[p.id]?rs.bots[p.id].score:0; else s=m.rec[i][p.id]!=null?m.rec[i][p.id]:((m.live[i]||{})[p.id]||0); return {p,s}; }); L.sort((a,b)=>b.s-a.s); return L; }
function pgRank(L){ let rk=0; L.forEach((x,j)=>{ if(j===0||x.s<L[j-1].s) rk=j; x.rk=rk; x.pt=PG_PTS[rk]||1; }); return L; }
function pgResult(i){ const m=PG.m; const L=pgRank(pgScores(i)); L.forEach(x=>{ m.pts[x.p.id]+=x.pt; }); const me=L.find(x=>x.p.me); const gd=PG_GAMES[m.order[i]];
  const unit=gd.id==="apple"?"점":"초"; m.lastRes={i,L:L.map(x=>({n:x.p.n,s:x.s,rk:x.rk,me:x.p.me,bot:x.p.bot}))}; PG.cheer=2;
  try{ lvBanner(`${i+1}판 결과`,me?`${me.rk+1}등! +${me.pt}점`:"",L.slice(0,3).map((x,j)=>`${["🥇","🥈","🥉"][x.rk]||"·"} ${x.p.n} ${gd.id==="apple"?x.s:Math.round(x.s)}${unit}`).join("  "),me&&me.rk===0?"#ffd27a":"#bfe0ff"); }catch(e){}
  if(me&&me.rk===0){ jingle([659,784,1046,1318]); buzz([40,30,60]); } else jingle([523,659,784]); }
function pgFinal(){ const m=PG.m; const L=m.plist.map(p=>({p,s:m.pts[p.id]})); L.sort((a,b)=>b.s-a.s||(a.p.me?-1:b.p.me?1:0)); return pgRank(L); }
function pgPodium(){ const m=PG.m; pgClearRound(); pgTilesReset(); const L=pgFinal(); m.final=L; PG.cheer=PG_POD;
  L.forEach((x,j)=>{ const sp=x.rk<3&&j<3?PG_POD_SPOT[x.rk]:null; let px,pz; if(sp){ px=PGX+sp.x; pz=PGZ-27; } else { px=PGX+(j-4)*2.6; pz=PGZ-21; }
    if(x.p.me){ P.x=px; P.z=pz; P.y=0; P.vy=0; P.rot=0; PG.fall=null; PG.px=P.x; PG.pz=P.z; } else if(x.p.bot){ x.p.x=px; x.p.z=pz; x.p.rot=0; x.p.mesh.visible=true; } });
  const me=L.find(x=>x.p.me); try{ lvBanner("🏆 시상식",`${me.rk+1}등!`,L.slice(0,3).map(x=>`${["🥇","🥈","🥉"][x.rk]} ${x.p.n} ${x.s}점`).join("  "),"#ffd27a"); }catch(e){}
  try{ drama(0xffd27a,.35,2); fxPillar(0xffd27a,2.2,30,2.4,.45); }catch(e){} jingle([523,659,784,1046,1318,1568]); buzz([60,40,60]);
  for(let k=0;k<14;k++) setTimeout(()=>{ if(!PG.on) return; fxSpark(PGX+rnd(-14,14),rnd(8,16),PGZ-27+rnd(-6,6),[0xffd27a,0xff7ab0,0x7ac8ff,0x9aff7a][k%4],26); tone(rnd(700,1400),.08,"triangle",0,.05); },k*420); }
function pgFinish(){ const m=PG.m; const L=m.final||pgFinal(); const me=L.find(x=>x.p.me); const rk=me?me.rk:L.length-1; const last=rk===L[L.length-1].rk&&L.length>1;
  const lp=PG_LAUREL[rk]||2; const d=pgData(); d.p+=lp; d.g++; if(rk===0) d.wn++; G.pgGames=(G.pgGames||0)+1; G.lp=(G.lp||0)+lp; if(rk===0) G.pgWins=(G.pgWins||0)+1; PG.dirty=true;
  const gold=40+G.lv*4+([60,35,20][rk]||8); G.gold+=gold; const xp=Math.round(xpNeed(G.lv)*([.12,.08,.06][rk]||.04)); gainXp(xp); const got=[`🌿 월계관 점수 +${lp} (이번 주 ${d.p}점)`,`⬤ 금화 +${fmt(gold)}`,`✨ 경험치 +${fmt(xp)}`];
  if(rk===0){ G.rune=(G.rune||0)+2; G.ore=(G.ore||0)+3; got.push("🏆 월계관 상자: ✨ 룬 가루 2 · ⛓ 쇳조각 3"); }
  if(last){ G.pots=(G.pots||0)+1; G.gold+=30; got.push("🎁 참가 상자: 물약 1 · 금화 30 (다음엔 더 잘할 수 있어요!)"); }
  saveGame(); pgPub(); const res=L.map(x=>({n:x.p.n,s:x.s,rk:x.rk,me:x.p.me,bot:x.p.bot,r:x.p.r}));
  m.plist.forEach(p=>{ if(p.bot){ scene.remove(p.mesh); p.lbl.remove(); } }); PG.m=null; PG.state="lobby"; PG.joinT=Date.now(); PG.hostT=0; PG.fall=null; pgTilesReset(); pgSpec();
  pgShowResult(res,got,rk); }
function pgShowResult(res,got,rk){ card(`<h2>🏟️ 놀이 마당 결과</h2><p style="font-size:22px;text-align:center;margin:4px 0"><b>${["🥇 1등!","🥈 2등!","🥉 3등!"][rk]||`${rk+1}등 — 잘했어요!`}</b></p>
   ${res.map(x=>`<div class="row"><div class="ic">${["🥇","🥈","🥉"][x.rk]||"🌿"}</div><div class="t"><div>${x.n}${x.me?" (나)":""}${x.bot?" 🤖":""}</div><span>${x.r>=0&&REALMS[x.r]?REALMS[x.r].n+" · ":""}${x.s}점</span></div></div>`).join("")}
   <div class="diary">${got.map(g=>`<p>${g}</p>`).join("")}</div>
   <h3>👋 인사하기</h3><div class="say">${PG_SAY.map(s=>`<button type="button" data-pgs="${s}">${s}</button>`).join("")}</div>
   <div class="exgrid"><button class="go" id="pgAgain" style="font-size:17px;padding:9px 12px">🔁 한 판 더!</button><button class="buy alt" id="pgOut">🚪 수도로 돌아가기</button></div>`);
  layers.querySelectorAll("[data-pgs]").forEach(b=>b.onclick=()=>{ pgSay(b.dataset.pgs); b.disabled=true; });
  $("pgAgain").onclick=()=>{ pgSay("한 판 더!"); closeLayer(); toast("🔁 다음 판을 기다려요","20초 안에 다시 시작해요",2); }; $("pgOut").onclick=()=>{ closeLayer(); pgExit(); }; }
function pgSay(s){ try{ net.send({t:"say",m:s}); net.chat(G.name,s,G.realm); }catch(e){} }
NETR.pga=(o,d)=>{ const m=PG.m; if(!m||d.m!==m.sd) return; (m.live[d.g]=m.live[d.g]||{})[o.id]=d.s|0; const rs=m.rs; if(rs&&rs.i===d.g&&rs.apples){ const a=rs.apples[d.k]; if(a&&!a.got){ a.got=o.id; if(a.mesh){ fxSpark(a.x,1,a.z,0xffd27a,10); scene.remove(a.mesh); a.mesh=null; } } } };
NETR.pgt=(o,d)=>{ const m=PG.m; if(!m||d.m!==m.sd) return; const rs=m.rs; if(rs&&rs.i===d.g&&rs.g==="cloud") pgShake(d.k|0); };
NETR.pgo=(o,d)=>{ const m=PG.m; if(!m||d.m!==m.sd) return; (m.live[d.g]=m.live[d.g]||{})[o.id]=+d.s||0; m.outN=(m.outN||0)+1; fxSpark(o.x,1,o.z,0xffffff,14); toast(`${o.name} 탈락!`,null,1.2); };
NETR.pgr=(o,d)=>{ const m=PG.m; if(!m||d.m!==m.sd||d.g<0||d.g>2) return; m.rec[d.g][o.id]=+d.s||0; };
/* ---------- 판 진행 (매 프레임) ---------- */
function pgMeOut(score){ const m=PG.m, rs=m.rs; if(!rs||rs.me.out) return; rs.me.out=true; rs.me.score=score; try{ net.send({t:"pgo",m:m.sd,g:rs.i,s:score}); }catch(e){} }
function pgPlayTick(dt,tp){ const m=PG.m, rs=m.rs; if(!rs) return; const me=rs.me; me.inv=Math.max(0,me.inv-dt); const bots=m.plist.filter(p=>p.bot);
  if(rs.g==="rock"){ rs.rocks.forEach(b=>{ if(b.gone) return; if(!b.on&&tp>=b.t){ b.on=true; b.mesh=pgRockMesh(b.r); scene.add(b.mesh); } if(!b.on) return; const d=(tp-b.t)*b.sp-23; let x,z,dx=0,dz=0; if(b.side===0){ x=b.off; z=d; dz=1; } else if(b.side===1){ x=b.off; z=-d; dz=-1; } else if(b.side===2){ x=d; z=b.off; dx=1; } else { x=-d; z=b.off; dx=-1; }
      b.x=PGX+x; b.z=PGZ+z; b.dx=dx; b.dz=dz; if(d>24){ b.gone=true; scene.remove(b.mesh); b.mesh=null; return; } b.mesh.position.set(b.x,b.r,b.z); b.mesh.userData.s.rotation.set(dz*(tp-b.t)*b.sp/b.r,0,-dx*(tp-b.t)*b.sp/b.r);
      if(!me.out&&me.inv<=0&&!PG.fall&&Math.hypot(P.x-b.x,P.z-b.z)<b.r+.65&&P.y<b.r*1.45){ me.hearts--; me.inv=1.4; const px=-dz, pz=dx, sgn=((P.x-b.x)*px+(P.z-b.z)*pz)>=0?1:-1; P.dashT=.18; P.dashX=(px*sgn*3+dx*1.5)/.18; P.dashZ=(pz*sgn*3+dz*1.5)/.18; P.vy=8; P.shake=Math.max(P.shake||0,.8); P.hitFlash=.25; thud(); buzz(60); floatDmg(P.x,4,P.z,me.hearts>0?`💥 ❤ ${me.hearts}`:"💥 탈락!",""); if(me.hearts<=0){ pgMeOut(tp); setTimeout(()=>{ if(PG.on&&PG.m===m) pgSpec(); },900); } }
      bots.forEach(p=>{ const s=rs.bots[p.id]; if(s.out||s.inv>0) return; if(Math.hypot(p.x-b.x,p.z-b.z)<b.r+.65&&p.y<b.r*1.45){ s.hearts--; s.inv=1.4; s.ex=-dz*3; s.ez=dx*3; s.eva=.3; p.vy=7; fxSpark(p.x,2,p.z,0xc88a3e,10); if(s.hearts<=0){ s.out=true; s.score=tp; setTimeout(()=>{ if(PG.m===m&&p.mesh){ p.x=PGX+rnd(-12,12); p.z=PGZ+rnd(23,29); } },900); } } }); });
    bots.forEach(p=>{ const s=rs.bots[p.id]; s.inv=Math.max(0,s.inv-dt); if(s.out) return; s.eva-=dt; if(s.eva<=0){ s.ex=s.ez=0; for(const b of rs.rocks){ if(!b.on||b.gone) continue; const rx=p.x-b.x, rz=p.z-b.z; const ahead=rx*b.dx+rz*b.dz, side=Math.abs(rx*-b.dz+rz*b.dx); if(ahead>0&&ahead<9&&side<b.r+1.4){ if(Math.random()<p.sk*dt*9){ if(b.r<1.2&&Math.random()<.5){ if(p.y<=0) p.vy=12; } else { const sg=(rx*-b.dz+rz*b.dx)>=0?1:-1; s.ex=-b.dz*sg*8.5; s.ez=b.dx*sg*8.5; s.eva=.55; } } break; } } if(s.eva<=0&&Math.random()<dt*.6){ s.ex=rnd(-3,3); s.ez=rnd(-3,3); s.eva=.8; } } p.x+=s.ex*dt; p.z+=s.ez*dt; });
    if(!me.out&&!PG.fall&&me.inv>0) player.visible=Math.floor(me.inv*10)%2===0; else player.visible=true; }
  if(rs.g==="apple"){ rs.apples.forEach(a=>{ if(a.got||a.gone) return; if(!a.on&&tp>=a.t){ a.on=true; a.mesh=pgAppleMesh(a.big); a.mesh.position.set(a.x,0,a.z); scene.add(a.mesh); fxSpark(a.x,1,a.z,0xffe07a,6); } if(!a.on) return; if(tp>a.t+a.life){ a.gone=true; if(a.mesh){ scene.remove(a.mesh); a.mesh=null; } return; }
      a.mesh.position.y=.15+Math.sin(tp*4+a.k)*.15; a.mesh.rotation.y+=dt*2; const fade=a.t+a.life-tp; a.mesh.visible=fade>2||Math.floor(fade*8)%2===0;
      if(Math.hypot(P.x-a.x,P.z-a.z)<(a.big?2:1.7)&&P.y<2.2){ a.got=G.id; me.score+=a.big?3:1; scene.remove(a.mesh); a.mesh=null; fxSpark(a.x,1.2,a.z,0xffd27a,a.big?26:12); floatDmg(a.x,3,a.z,a.big?"🍎 +3":"🍎 +1","gain"); tone(a.big?1318:1046,.08,"triangle"); if(a.big) tone(1568,.1,"triangle",.06); try{ net.send({t:"pga",m:m.sd,g:rs.i,k:a.k,s:me.score}); }catch(e){} return; }
      for(const p of bots){ if(Math.hypot(p.x-a.x,p.z-a.z)<1.5){ a.got=p.id; rs.bots[p.id].score+=a.big?3:1; scene.remove(a.mesh); a.mesh=null; fxSpark(a.x,1,a.z,0xc88a3e,8); break; } } });
    bots.forEach(p=>{ const s=rs.bots[p.id]; s.think-=dt; if(s.think<=0||!s.tg||s.tg.got||s.tg.gone){ s.think=rnd(.4,1.2)*(1.3-p.sk); let best=null,bd=1e9; rs.apples.forEach(a=>{ if(!a.on||a.got||a.gone) return; const d=Math.hypot(a.x-p.x,a.z-p.z)-(a.big?6:0)+Math.random()*6; if(d<bd){ bd=d; best=a; } }); s.tg=best; } if(s.tg&&s.think>0){ const dx=s.tg.x-p.x, dz=s.tg.z-p.z, d=Math.hypot(dx,dz); if(d>.3){ const sp=6+p.sk*3.5; p.x+=dx/d*sp*dt; p.z+=dz/d*sp*dt; } } }); }
  if(rs.g==="cloud"){ while(rs.evI<rs.ev.length&&rs.ev[rs.evI].t<=tp){ pgShake(rs.ev[rs.evI].k); rs.evI++; }
    if(!me.out&&!PG.fall){ const k=pgTileAt(P.x,P.z); if(k!==me.stand){ me.stand=k; me.standT=0; } else if(k>=0&&P.y<.05){ me.standT+=dt; if(me.standT>1.5&&tp>3&&PG.tiles[k].s===0){ if(pgShake(k)) try{ net.send({t:"pgt",m:m.sd,g:rs.i,k}); }catch(e){} } }
      if(k>=0&&P.y<.05&&PG.tiles[k].s===2){ pgMeOut(tp); PG.fall={t:0,x:P.x,z:P.z}; tone(500,.4,"sawtooth",0,.08); tone(250,.5,"sawtooth",.15,.06); } }
    bots.forEach(p=>{ const s=rs.bots[p.id]; if(s.out){ if(s.fall>0){ s.fall+=dt; p.y=-14*s.fall*s.fall; if(s.fall>1.3){ s.fall=0; p.y=0; p.x=PGX+rnd(-12,12); p.z=PGZ+rnd(23,29); } } return; } const k=pgTileAt(p.x,p.z);
      if(k>=0&&p.y<=0&&PG.tiles[k].s===2){ s.out=true; s.score=tp; s.fall=.01; return; }
      const danger=k>=0&&PG.tiles[k].s===1; s.think-=dt; if(s.think<=0||(danger&&Math.random()<p.sk*dt*5)||s.tx==null){ s.think=rnd(1,2.6); let best=null; for(let q=0;q<10;q++){ const kk=Math.floor(Math.random()*PG_N*PG_N); const t=PG.tiles[kk]; if(t.s) continue; const d=Math.hypot(t.x-p.x,t.z-p.z); if(d>12) continue; if(!best||d<best.d) best={t,d}; } if(best){ s.tx=best.t.x+rnd(-1,1); s.tz=best.t.z+rnd(-1,1); } }
      if(s.tx!=null){ const dx=s.tx-p.x, dz=s.tz-p.z, d=Math.hypot(dx,dz); if(d>.3){ const sp=5+p.sk*3; p.x+=dx/d*sp*dt; p.z+=dz/d*sp*dt; } } }); }
  // 탈로스 공통: 경기장 안에 두기 · 점프 · 모습
  bots.forEach(p=>{ const s=rs.bots[p.id]; if(!(s&&s.out)){ p.x=clamp(p.x,PGX-PG_H+.6,PGX+PG_H-.6); p.z=clamp(p.z,PGZ-PG_H+.6,PGZ+PG_H-.6); } if(!(s&&s.fall>0)){ p.vy-=28*dt; p.y=Math.max(0,p.y+p.vy*dt); if(p.y<=0) p.vy=0; } }); }
function pgTilesTick(dt){ PG.tiles.forEach(t=>{ if(t.s===1){ t.t-=dt; const k=1-t.t/1.3; t.m.position.x=t.x+Math.sin(performance.now()/30+t.x)*.08*k; t.m.material.color.copy(t.c0).lerp(new THREE.Color(0xff9a7a),k*.8); if(t.t<=0){ t.s=2; t.t=0; t.vy=0; fxSpark(t.x,0,t.z,0xffffff,8); } }
  else if(t.s===2&&t.m.visible){ t.t+=dt; t.m.position.y=-.4-14*t.t*t.t; t.m.rotation.x+=dt*1.5; if(t.m.position.y<-24) t.m.visible=false; } }); }
function pgBotsDraw(dt){ const m=PG.m; if(!m) return; const tn=performance.now(); m.plist.forEach(p=>{ if(!p.bot) return; const u=p.mesh.userData; const dx=p.x-(p.lx==null?p.x:p.lx), dz=p.z-(p.lz==null?p.z:p.lz); const sp=Math.hypot(dx,dz)/Math.max(dt,1e-3); p.lx=p.x; p.lz=p.z; if(sp>.5) p.rot=Math.atan2(dx,dz); p.walk+=dt*sp*1.3;
    const sw=sp>.5?Math.sin(p.walk)*.7:0; u.lL.rotation.x=sw; u.lR.rotation.x=-sw; u.aL.rotation.x=-sw*.8; u.aR.rotation.x=sw*.8; u.body.position.y=sp>.5?Math.abs(Math.sin(p.walk))*.1:Math.sin(tn/500+p.k)*.03;
    p.mesh.position.set(p.x,hAt(p.x,p.z)+p.y,p.z); let dr=p.rot-p.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; p.mesh.rotation.y+=dr*Math.min(1,dt*10);
    const rs=m.rs, s=rs&&rs.bots[p.id]; if(Math.hypot(p.x-P.x,p.z-P.z)<55&&!layerOpen&&p.y>-6){ const tag=rs?(rs.g==="rock"?(s.out?"탈락":"❤".repeat(Math.max(0,s.hearts))):rs.g==="apple"?`🍎 ${s.score}`:(s.out?"탈락":"☁")):`🌿 ${m.pts[p.id]}점`; placeLabel(p.lbl,p.x,4.7+p.y,p.z,`🤖 ${p.n} <b>${tag}</b>`); } else p.lbl.style.display="none"; }); }
/* ---------- 화면 위 띠 (HUD) ---------- */
function pgHudEl(){ if(PG.hud) return PG.hud; const st=document.createElement("style"); st.textContent=`#pgHud{position:fixed;left:50%;top:calc(max(6px,env(safe-area-inset-top)) + 4px);transform:translateX(-50%);z-index:6;background:linear-gradient(135deg,rgba(40,26,8,.88),rgba(20,14,40,.88));border:2px solid #ffd27a;border-radius:14px;padding:5px 12px;color:#fff;font-weight:800;text-align:center;min-width:min(64vw,250px);max-width:min(80vw,420px);pointer-events:auto;font-size:14px;line-height:1.35;box-shadow:0 4px 14px rgba(0,0,0,.35)}
#pgHud .big{font-size:26px;color:#ffd27a;display:block;line-height:1.1}#pgHud small{display:block;font-size:12px;font-weight:700;opacity:.9}#pgHud .rk{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;font-size:12px;margin-top:2px}#pgHud .rk i{font-style:normal;opacity:.92}#pgHud .rk i.me{color:#9dffb8}
#pgHud button{margin:4px 3px 0;font:inherit;font-size:13px;padding:3px 10px;border-radius:10px;border:1px solid #ffd27a;background:#3a2a10;color:#ffe9b0}
@media (orientation:landscape) and (max-height:540px){ #pgHud{font-size:12px;padding:3px 10px} #pgHud .big{font-size:20px} }
body:has(#title) #pgHud{visibility:hidden} body.pgOn #quest,body.pgOn #titanPill{visibility:hidden}`; document.head.appendChild(st);
  const h=document.createElement("div"); h.id="pgHud"; h.hidden=true; h.addEventListener("pointerdown",e=>e.stopPropagation()); h.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; if(b.dataset.a==="go"&&PG.state==="lobby"&&PG.isHost&&!PG.busy) pgHostStart(); else if(b.dataset.a==="out") pgExit(); else if(b.dataset.a==="info") showPlay(); }); document.body.appendChild(h); PG.hud=h; return h; }
function pgHudSet(html){ const h=pgHudEl(); h.hidden=false; if(PG.lastHud!==html){ PG.lastHud=html; h.innerHTML=html; } }
function pgHudTick(){ const m=PG.m; if(!m){ const n=PG.nMem||1; pgHudSet(PG.busy?`🏟️ 다른 사람들이 경기 중이에요<small>끝나면 바로 다음 판이 시작돼요 · 관중석에서 응원해요!</small><button data-a="out" type="button">🚪 나가기</button>`:`🏟️ 놀이 마당 · 모이는 중 ${n}/${PG_MAX}명<span class="big">${Math.ceil(PG.left)}초</span><small>${n>=PG_FILL?"곧 시작해요!":`모자라면 탈로스 로봇 ${PG_FILL-n}명이 채워요`}</small>${PG.isHost?`<button data-a="go" type="button">▶ 지금 시작</button>`:""}<button data-a="info" type="button">🏆 순위</button><button data-a="out" type="button">🚪 나가기</button>`); return; }
  const t=pgNow(); if(t<0){ pgHudSet(`🏟️ 곧 시작!<span class="big">${Math.ceil(-t)}</span><small>${m.order.map(g=>PG_GAMES[g].ic).join(" → ")}</small>`); return; }
  const ph=m.ph[Math.max(0,m.pi-1)]; if(!ph){ return; } const i=ph.i, gd=i!=null?PG_GAMES[m.order[i]]:null, rs=m.rs;
  if(ph.k==="intro"){ const left=PG_INTRO-(t-ph.at); pgHudSet(`${i+1}판 / 3판 · ${gd.ic} ${gd.n}<span class="big">${left>3?"준비!":Math.ceil(left)}</span><small>${gd.how}</small>`); return; }
  if(ph.k==="play"&&rs){ const left=Math.max(0,gd.L-(t-ph.at)); const me=rs.me; const mine=rs.g==="rock"?(me.out?"💥 탈락 — 관중석에서 응원해요":"❤".repeat(me.hearts)+"🤍".repeat(3-me.hearts)):rs.g==="apple"?`🍎 ${me.score}점`:(me.out?"☁ 떨어졌어요 — 응원해요":"☁ 버티는 중!");
    let rk=""; if(rs.g==="apple"){ const L=pgScores(i).slice(0,4); rk=`<div class="rk">${L.map(x=>`<i class="${x.p.me?"me":""}">${x.p.bot?"🤖":""}${x.p.n} ${x.s}</i>`).join("")}</div>`; } else { const alive=m.plist.filter(p=>p.me?!me.out:p.bot?!rs.bots[p.id].out:(m.live[i]||{})[p.id]==null).length; rk=`<div class="rk"><i>남은 사람 ${alive}/${m.plist.length}</i></div>`; }
    pgHudSet(`${gd.ic} ${gd.n} · <b style="color:#ffd27a">${Math.ceil(left)}초</b><small>${mine}</small>${rk}`); return; }
  if(ph.k==="res"){ const r=m.lastRes; pgHudSet(`${i+1}판 결과${r&&r.i===i?`<div class="rk">${r.L.map(x=>`<i class="${x.me?"me":""}">${["🥇","🥈","🥉"][x.rk]||"·"}${x.n}</i>`).join("")}</div>`:"<small>점수를 모으는 중…</small>"}<small>합계: ${Object.entries(m.pts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,s])=>`${(m.plist.find(p=>p.id===id)||{}).n} ${s}`).join(" · ")}</small>`); return; }
  if(ph.k==="pod"){ const L=m.final||[]; pgHudSet(`🏆 시상식<div class="rk">${L.slice(0,3).map(x=>`<i class="${x.p.me?"me":""}">${["🥇","🥈","🥉"][x.rk]} ${x.p.n} ${x.s}점</i>`).join("")}</div>`); } }
/* ---------- 매 프레임 ---------- */
function pgTick(dt){ if(!started) return; const tn=performance.now();
  // 수도 문 반짝임 + 들어가기
  let near=null; PG.gates.forEach(s=>{ if(!s) return; const d=Math.hypot(P.x-s.x,P.z-s.z); if(d>90) return; const u=s.g.userData; u.ring.rotation.z+=dt*1.2; u.disc.material.opacity=.22+Math.sin(tn/300)*.08; [-1,1].forEach(k=>{ const f=u["f"+k]; if(f) f.scale.setScalar(1+Math.sin(tn/90+k)*.12); }); if(d<40&&(!near||d<near.d)) near={s,d}; });
  if(!PG.gateLbl) PG.gateLbl=makeLabel("ally"); if(near&&!PG.on&&!layerOpen&&!(typeof DS!=="undefined"&&DS.on)) placeLabel(PG.gateLbl,near.s.x,9.6,near.s.z,`🏟️ 올림피아 놀이 마당 <b>처음 만난 사람과 미니게임 3판</b>`); else PG.gateLbl.style.display="none";
  PG.cd=Math.max(0,PG.cd-dt);
  document.body.classList.toggle("pgOn",PG.on);
  if(!PG.on){ if(PG.hud) PG.hud.hidden=true; if(near&&near.d<2.2&&PG.cd<=0&&!layerOpen&&!P.dead) pgEnter(); return; }
  if(!pgIn(P.z)){ pgExit(true,true); return; }
  // 모두 같은 힘: 신수 타기·빨라지는 효과를 지워 이동 거리를 똑같게
  try{ if(P.ride) rdSet(false); }catch(e){} const f=(G.eq.r===1?1.1:1)*((typeof bfOn==="function"&&bfOn("spd"))?1.15:1)*(P.haste>0?1.5:1)*(P.slow>0?.7:1)*(P.heat>0?1.15:1); if(f!==1&&P.dashT<=0&&!PG.fall){ P.x=PG.px+(P.x-PG.px)/f; P.z=PG.pz+(P.z-PG.pz)/f; }
  PG.hbT-=dt; if(PG.hbT<=0){ PG.hbT=1.5; try{ net.send({t:"pgl",j:PG.joinT,mt:PG.m?PG.m.sd:0,left:PG.isHost?Math.round(PG.left):null}); }catch(e){} }
  const m=PG.m;
  if(!m){ pgLobbyTick(dt); }
  else { const t=pgNow(); while(m.pi<m.ph.length&&m.ph[m.pi].at<=t){ const ph=m.ph[m.pi++]; try{ pgPhase(ph); }catch(e){ console.warn(e); } if(!PG.m) break; }
    if(PG.m){ const ph=m.ph[m.pi-1]; if(ph&&ph.k==="intro"){ const left=PG_INTRO-(t-ph.at); const c=Math.ceil(left); if(c<=3&&c>=1&&c!==m.cnt){ m.cnt=c; tone(660,.12,"square",0,.08); } }
      if(ph&&ph.k==="play") pgPlayTick(dt,t-ph.at);
      if(ph&&ph.k==="res"&&m.resAt!=null&&t>=m.resAt){ m.resAt=null; try{ pgResult(m.resI); }catch(e){ console.warn(e); } }
      if(t<0||(ph&&ph.k==="intro")){ /* 출발선에 붙잡아 둠 */ const me=m.plist.findIndex(p=>p.me); const s=pgSlot(null,me,m.plist.length); if(t>=0&&Math.hypot(P.x-s.x,P.z-s.z)>1.2){ P.x+=(s.x-P.x)*Math.min(1,dt*6); P.z+=(s.z-P.z)*Math.min(1,dt*6); } } } }
  if(PG.m&&PG.m.rs&&PG.m.rs.g==="cloud") pgTilesTick(dt); else if(PG.tiles.some(t=>t.s)) pgTilesTick(dt);
  pgBotsDraw(dt);
  // 떨어지는 중
  if(PG.fall){ PG.fall.t+=dt; P.x=PG.fall.x; P.z=PG.fall.z; P.y=0; P.vy=0; const y=-14*PG.fall.t*PG.fall.t; P.gy=y; player.position.y=y; if(PG.fall.t>1.3){ PG.fall=null; fxSpark(P.x,0,P.z,0xffffff,10); pgSpec(); toast("☁ 구름 아래로 떨어졌어요!","관중석에서 응원해요",1.6); } }
  PG.px=P.x; PG.pz=P.z;
  // 경기장 꾸밈: 성화·관중·출구
  if(PG.fire){ PG.fire[0].scale.setScalar(1+Math.sin(tn/80)*.1); PG.fire[1].scale.setScalar(1+Math.sin(tn/60+1)*.14); }
  if(PG.crowd&&!ECO()){ PG.crowdT-=dt; PG.cheer=Math.max(0,PG.cheer-dt); if(PG.crowdT<=0){ PG.crowdT=.08; const c=PG.crowd; c.pos.forEach((p,i)=>{ const j=PG.cheer>0?Math.max(0,Math.sin(tn/140+p.p))*.9:Math.max(0,Math.sin(tn/600+p.p))*.08; c.dm.position.set(p.x,p.y+j,p.z); c.dm.updateMatrix(); c.im.setMatrixAt(i,c.dm.matrix); }); c.im.instanceMatrix.needsUpdate=true; } }
  if(PG.exitArch){ const u=PG.exitArch.userData; u.ring.rotation.z+=dt*1.4; u.disc.material.opacity=.22+Math.sin(tn/300)*.08; if(!PG.lbl) PG.lbl=makeLabel("ally"); const ex=PGX, ez=PGZ+33.5; const d=Math.hypot(P.x-ex,P.z-ez); if(d<40&&!layerOpen&&!PG.m) placeLabel(PG.lbl,ex,12.5,ez,`🚪 수도로 <b>돌아가는 문</b>`); else PG.lbl.style.display="none"; if(d<2.6&&PG.cd<=0&&!PG.m&&!P.dead){ pgExit(); return; } }
  PG.amb-=dt; if(PG.amb<=0){ PG.amb=ECO()?.6:.25; fxSpark(PGX+rnd(-30,30),rnd(3,9),PGZ+rnd(-30,30),[0xffd27a,0xffffff,0x9fd8ff][Math.floor(rnd(0,3))],2); }
  pgHudTick(); const ph=m&&PG.m?m.ph[Math.max(0,m.pi-1)]:null; $("region").innerHTML=`🏟️ 올림피아 놀이 마당 <b>${!PG.m?`모이는 중 ${PG.nMem||1}명`:ph&&ph.i!=null?`${ph.i+1}판 · ${PG_GAMES[m.order[ph.i]].n}`:ph&&ph.k==="pod"?"시상식":"곧 시작"}</b>`; }
XTICK.push(pgTick);
function pgClampP(){ if(!pgIn(P.z)){ pgExit(true,true); return false; } const m=PG.m, rs=m&&m.rs; const t=m?pgNow():0; const ph=m?m.ph[Math.max(0,m.pi-1)]:null;
  if(m&&ph&&(ph.k==="play"||ph.k==="intro")&&rs&&!rs.me.out){ P.x=clamp(P.x,PGX-PG_H+.5,PGX+PG_H-.5); P.z=clamp(P.z,PGZ-PG_H+.5,PGZ+PG_H-.5); }
  else if(m&&rs&&rs.me.out){ P.x=clamp(P.x,PGX-32,PGX+32); P.z=clamp(P.z,PGZ+20.5,PGZ+32); }
  else { P.x=clamp(P.x,PGX-32.5,PGX+32.5); P.z=clamp(P.z,PGZ-32.5,PGZ+32.5); }
  return true; }
function pgSky(dt){ SKY.tTop.setHex(0x3a8cf0); SKY.tBot.setHex(0xe6f3ff); const k=Math.min(1,dt*2); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=90; scene.fog.far=260;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+30,95,P.z+30); sun.target.position.set(P.x,0,P.z); sun.intensity=1.05; sun.color.setHex(0xfff2dc); hemi.intensity=.5; fill.intensity=.25; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=.92; }
function pgMinimap(){ const ctx=mctx, S=fitCanvas(mm); const s=S*.94/72; const X=x=>S/2+(x-PGX)*s, Z=z=>S/2+(z-PGZ)*s;
  ctx.fillStyle="#cfe6ff"; ctx.fillRect(0,0,S,S); ctx.fillStyle="#f2ecdf"; ctx.fillRect(X(PGX-35),Z(PGZ-35),70*s,70*s);
  PG.tiles.forEach(t=>{ ctx.fillStyle=t.s===2?"#cfe6ff":t.s===1?"#ffb49a":"#ffffff"; ctx.fillRect(X(t.x-1.85),Z(t.z-1.85),3.7*s,3.7*s); });
  ctx.fillStyle="#ffd27a"; PG_POD_SPOT.forEach(p=>ctx.fillRect(X(PGX+p.x-2),Z(PGZ-29),4*s,4*s)); dot(ctx,X(PGX),Z(PGZ+33.5),S/26,"#7ac8ff","#fff",2);
  const rs=PG.m&&PG.m.rs; if(rs){ (rs.rocks||[]).forEach(b=>{ if(b.on&&!b.gone) dot(ctx,X(b.x),Z(b.z),b.r*s*1.1,"#8a7660","#fff",1); }); (rs.apples||[]).forEach(a=>{ if(a.on&&!a.got&&!a.gone) dot(ctx,X(a.x),Z(a.z),S/(a.big?32:46),"#ffc830","#fff",1); }); }
  if(PG.m) PG.m.plist.forEach(p=>{ if(p.bot) dot(ctx,X(p.x),Z(p.z),S/40,"#c88a3e","#fff",1); });
  for(const id in PEERS){ const o=PEERS[id]; if(pgIn(o.z)) dot(ctx,X(o.x),Z(o.z),S/36,"#1e8e3e","#fff",1.5); }
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const a=S/20; ctx.moveTo(0,-a); ctx.lineTo(a*.7,a*.7); ctx.lineTo(0,a*.35); ctx.lineTo(-a*.7,a*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,"🏟️ 놀이 마당",S/2,S*.06,Math.round(S/12),"#3a2a00"); }
/* ---------- 이번 주 월계관 순위 (보관 pl/<주>/<id>) ---------- */
function pgPub(){ if(G.realm<0) return; const d=pgData(); try{ net.pushRet("pl/"+d.w+"/"+G.id,{i:G.id,n:G.name,r:G.realm,p:d.p,wn:d.wn,g:d.g,w:d.w,t:Date.now()}); PG.dirty=false; }catch(e){} }
NETX.push({sub:()=>"pl/"+pgWeek()+"/+",pre:"pl/",f:(d)=>{ if(!d||!d.i||d.i===G.id||d.w!==pgWeek()) return; PLO[d.i]=d; }});
function pgBoard(){ const d=pgData(); const L=[]; for(const id in PLO){ const o=PLO[id]; if(o.w===d.w&&o.p>0) L.push(o); } if(d.p>0) L.push({n:G.name,r:G.realm,p:d.p,wn:d.wn,g:d.g,me:1}); L.sort((a,b)=>b.p-a.p||b.wn-a.wn); return L; }
XTICK.push(dt=>{ if(!started) return; PG.pubT-=dt; if(PG.pubT<=0){ PG.pubT=120; if(PG.dirty&&pgData().p>0) pgPub(); } });
function showPlay(){ const d=pgData(), L=pgBoard(); const myI=L.findIndex(x=>x.me); const order=pgOrder();
  card(`<h2>🏟️ 올림피아 놀이 마당</h2><p>네 수도마다 있는 <b>놀이 마당 문</b>(월계관 아치)으로 들어가면 처음 만난 사람과 함께 <b>미니게임 3판</b>! 2~8명이 모이면 시작하고, 20초가 지나도 모자라면 청동 거인 <b>탈로스</b> 로봇이 빈자리를 채워요. 계급·장비·레벨과 상관없이 <b>모두 같은 힘</b>이라 처음 온 사람도 1등을 할 수 있어요.</p>
   <h3>오늘의 순서</h3>${order.map((g,i)=>`<div class="row"><div class="ic">${PG_GAMES[g].ic}</div><div class="t"><div>${i+1}판 · ${PG_GAMES[g].n} <small>${PG_GAMES[g].L}초</small></div><span>${PG_GAMES[g].how}</span></div></div>`).join("")}
   <div class="idlegrid"><div><b>${d.p}점</b><span>🌿 이번 주 내 월계관${myI>=0?` · ${myI+1}등`:""}</span></div><div><b>${G.pgWins||0}번</b><span>🥇 1등 · 놀이 ${G.pgGames||0}판</span></div></div>
   <div class="exgrid">${PG.on?`<button class="buy alt" id="pgLeave">🚪 수도로 돌아가기</button>`:`<button class="go" id="pgGo" style="font-size:17px;padding:9px 12px">🏟️ 놀이 마당으로</button><button class="buy alt" id="pgWay">문으로 길 안내</button>`}</div>
   <p style="font-size:12px">판마다 1등 5점 · 2등 3점 · 3등 2점 · 나머지 1점 → 3판 합계로 시상식. 월계관 점수: 1등 10 · 2등 6 · 3등 4 · 나머지 2. 꼴찌도 참가 상자를 받아요. 월요일마다 새 주가 시작돼요.</p>
   <h3>🌿 이번 주 월계관 순위</h3>${L.slice(0,10).map((x,i)=>`<div class="row"><div class="ic" style="color:${REALMS[x.r]?REALMS[x.r].c1:"#fff"}">${["🥇","🥈","🥉"][i]||"🌿"}</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>${REALMS[x.r]?REALMS[x.r].n+" · ":""}${x.p}점 · 1등 ${x.wn||0}번 · ${x.g||0}판</span></div></div>`).join("")||'<p style="font-size:13px">아직 아무도 없어요. 이번 주 첫 월계관을 써 보세요!</p>'}`);
  if($("pgGo")) $("pgGo").onclick=()=>{ if(DG.on||HM.on){ toast("미궁·신전 섬에서 먼저 나와요"); return; } pgEnter(); };
  if($("pgWay")) $("pgWay").onclick=()=>{ const s=PG.gates[Math.max(0,G.realm)]; setGuide({x:s.x+Math.sin(s.rot)*5,z:s.z+Math.cos(s.rot)*5,label:"🏟️ 놀이 마당 문"}); closeLayer(); };
  if($("pgLeave")) $("pgLeave").onclick=()=>{ closeLayer(); pgExit(); }; }
CTX_EXTRA.push(()=>pgGateNear()?{t:"🏟️ 놀이 마당으로",f:pgEnter}:null);
TITLES.push({id:"pg1",n:"놀이 마당 새내기",t:0,h:"올림피아 놀이 마당에서 3판 끝까지 하기",g:()=>[G.pgGames||0,1]},{id:"pgw1",n:"월계관의 주인",t:1,h:"놀이 마당에서 1등 하기",g:()=>[G.pgWins||0,1]},{id:"pgw10",n:"올림피아 챔피언",t:3,h:"놀이 마당에서 1등 10번",g:()=>[G.pgWins||0,10]},{id:"pgp100",n:"놀이의 신",t:2,h:"월계관 점수 100점 모으기",g:()=>[G.lp||0,100]});
</script>
