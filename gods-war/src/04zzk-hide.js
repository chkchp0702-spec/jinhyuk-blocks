<script>
/* ================= v118-2: 🐴 트로이 목마 숨바꼭질 — 항아리로 변신해 숨는 술래잡기 (IDEAS G11/12-2) =================
   수도마다 「🐴 목마 문」(또는 메뉴 🐴) → 지도 밖(x≈380, z≈0) 트로이 광장. 가운데 커다란 나무 목마, 둘레에 항아리·석상·짐수레·양·꽃화분 「가짜 물건」 40개.
   - 대기실: 광장에 모인 사람끼리(가장 먼저 온 사람 = 방장) 15초 기다렸다가 시작(t:"hss"). 혼자면 탈로스 로봇이 같이 놀아 줌.
   - 한 판: 3초 준비 → 🙈 20초 숨기(술래는 멀리 「목마 대기실」에서 눈 감고 세기, 숨는 사람은 물건 5가지 중 하나로 변신) → 🔍 2분 찾기.
   - 술래: 공격 버튼 = 🪖 창으로 콕! 앞 2.8m 안의 물건을 찔러요. 숨은 사람이면 「찾았다!」(t:"hsc"), 가짜면 「꽝!」(1.2초 쉬기).
   - 숨는 사람: 움직여도 되지만 술래 눈에 물건이 움직이는 게 보여요. 20초마다 모든 숨은 사람 몸에서 「뿅!」 반짝이와 소리(같은 시각 계산 — 통신 없음).
   - 다 찾으면 술래 승, 한 명이라도 끝까지 버티면 숨은 쪽 승. 레벨·장비 상관없이 모두 같은 힘(기술 잠김·다치지 않음).
   - 사람 둘 이상이면 술래는 판마다 돌아가며(씨앗으로 정함), 숨는 사람이 3명보다 적으면 탈로스 로봇이 숨는 쪽으로 채움(로봇 자리는 씨앗으로 모든 폰이 같음).
     혼자일 때는 번갈아: 내가 술래(로봇 4명이 숨음) ↔ 내가 숨기(로봇 술래 1 + 로봇 숨기 2).
   - 판이 끝나면 정해진 말 버튼("한 판 더!"·"잘 숨었다!"·"찾았다!"·"고마워!").
   실시간: hsl(대기실 소식) · hss(시작) · hsv(변신 모양) · hsp(판 중 소식) · hsc(찾았다)
   저장: G.hsPlay · G.hsSurv(끝까지 버팀) · G.hsCatch(찾은 수) · G.hsSeek(술래 승) · G.hsN(혼자 판 번갈이) */
const HSX=380, HSZ=0, HS_R=33, HS_OUT=44, HS_WAITZ=112, HS_HIDE=20, HS_SEEK=120, HS_INTRO=3, HS_RES=7, HS_LOBBY=15, HS_REACH=2.8;
const HS_KIND=[{n:"항아리",ic:"🏺"},{n:"석상",ic:"🗿"},{n:"짐수레",ic:"🛒"},{n:"양",ic:"🐑"},{n:"꽃화분",ic:"🪴"}];
const HS_SAY=["한 판 더!","잘 숨었다!","찾았다!","고마워!"];
const HS_BOTN=["탈로스 ①","탈로스 ②","탈로스 ③","탈로스 ④"];
const HS={on:false,built:false,parts:[],decoys:[],gates:[],gateLbl:null,cd:0,joinT:0,lobby:{},hostT:0,left:HS_LOBBY,hbT:0,m:null,hud:null,bar:null,myProp:null,myK:0,peerProp:{},pokeCd:0,lastMove:0,boopN:-1,resT:0,horse:null,exitArch:null,lbl:null};
function hsIn(x,z){ return Math.abs(x-HSX)<150&&Math.abs(z-HSZ)<150; }
(function(){ const _h=hAt; hAt=function(x,z){ return hsIn(x,z)?0:_h(x,z); }; })();
/* ---------- 물건 모양 5가지 (변신·가짜 물건 모두 같은 모양) ---------- */
const HSM={};
function hsMats(){ if(HSM.ok) return HSM; HSM.ok=1; HSM.clay=mat({color:0xc8743a,roughness:.85}); HSM.clay2=mat({color:0x2a1a10,roughness:.9}); HSM.marble=M.marble||mat({color:0xf4efe2}); HSM.wood=mat({color:0x9a6a3a,roughness:.9}); HSM.dk=mat({color:0x5a3a20,roughness:.95}); HSM.wool=mat({color:0xf6f2ea,roughness:1}); HSM.blk=mat({color:0x2a2420}); HSM.leaf=mat({color:0x4aa04a,roughness:.8}); HSM.pink=mat({color:0xff7ab0}); HSM.yel=mat({color:0xffd23a}); HSM.box=mat({color:0xd8a24a}); return HSM; }
function hsPropMesh(k){ const m=hsMats(); const g=new THREE.Group();
  if(k===0){ g.add(cyl(.38,.3,.25,m.clay,0,.12,0,12)); const b=sph(.62,m.clay,0,.85,0); b.scale.set(1,1.15,1); g.add(b); g.add(cyl(.22,.3,.5,m.clay,0,1.55,0,12)); g.add(cyl(.32,.24,.12,m.clay,0,1.82,0,12)); g.add(cyl(.6,.6,.16,m.clay2,0,.95,0,14)); [-1,1].forEach(s=>{ const h=new THREE.Mesh(new THREE.TorusGeometry(.2,.05,6,10,Math.PI),m.clay); h.position.set(s*.42,1.45,0); h.rotation.z=s>0?-Math.PI/2:Math.PI/2; g.add(h); }); }
  else if(k===1){ g.add(box(1.1,.5,1.1,m.marble,0,.25,0)); g.add(cyl(.32,.4,1.4,m.marble,0,1.2,0,10)); g.add(sph(.3,m.marble,0,2.15,0)); g.add(box(.9,.18,.4,m.marble,0,1.85,0)); }
  else if(k===2){ g.add(box(1.2,.16,1.6,m.wood,0,.6,0)); g.add(box(.08,.4,1.6,m.wood,.58,.85,0)); g.add(box(.08,.4,1.6,m.wood,-.58,.85,0)); g.add(box(1.2,.4,.08,m.wood,0,.85,-.78)); [[.68,.5],[-.68,.5],[.68,-.5],[-.68,-.5]].forEach(([x,z])=>{ const w=new THREE.Mesh(new THREE.TorusGeometry(.3,.07,6,12),m.dk); w.position.set(x,.32,z); w.rotation.y=Math.PI/2; g.add(w); }); g.add(box(.5,.4,.5,m.box,-.2,.95,.2)); g.add(sph(.25,m.wool,.25,.95,-.3)); g.add(box(.07,.07,1,m.dk,.3,.55,1.2)); g.add(box(.07,.07,1,m.dk,-.3,.55,1.2)); }
  else if(k===3){ [[0,.85,0,.55],[.3,.95,.25,.4],[-.3,.95,.25,.4],[.3,.95,-.25,.4],[-.3,.95,-.25,.4],[0,1.15,0,.42]].forEach(([x,y,z,r])=>g.add(sph(r,m.wool,x,y,z))); g.add(box(.36,.42,.4,m.blk,0,1.05,.68)); [-1,1].forEach(s=>g.add(box(.22,.08,.12,m.blk,s*.26,1.15,.62))); [[.25,.25],[-.25,.25],[.25,-.25],[-.25,-.25]].forEach(([x,z])=>g.add(box(.12,.5,.12,m.blk,x,.25,z))); }
  else { g.add(cyl(.5,.36,.75,m.clay,0,.38,0,12)); g.add(cyl(.56,.56,.12,m.clay,0,.78,0,12)); const bu=sph(.62,m.leaf,0,1.25,0); bu.scale.y=.85; g.add(bu); [[.3,1.6,.25,m.pink],[-.32,1.5,.2,m.yel],[.05,1.75,-.25,m.pink],[-.15,1.45,.45,m.yel],[.42,1.35,-.2,m.yel]].forEach(([x,y,z,mm])=>g.add(sph(.13,mm,x,y,z))); }
  return hsMerge(g); }
/* 같은 재질끼리 한 덩어리로 합쳐서 그리는 횟수를 줄임(배터리) */
function hsMerge(g){ g.updateMatrixWorld(true); const by=new Map(); g.traverse(o=>{ if(!o.isMesh) return; let geo=o.geometry; geo=geo.index?geo.toNonIndexed():geo.clone(); geo.applyMatrix4(o.matrixWorld); const L=by.get(o.material)||[]; L.push(geo); by.set(o.material,L); });
  const out=new THREE.Group(); by.forEach((L,mt)=>{ let n=0; L.forEach(q=>n+=q.attributes.position.count); const pos=new Float32Array(n*3), nor=new Float32Array(n*3); let o=0; L.forEach(q=>{ pos.set(q.attributes.position.array,o*3); if(q.attributes.normal) nor.set(q.attributes.normal.array,o*3); o+=q.attributes.position.count; q.dispose(); });
    const bg=new THREE.BufferGeometry(); bg.setAttribute("position",new THREE.BufferAttribute(pos,3)); bg.setAttribute("normal",new THREE.BufferAttribute(nor,3)); bg.computeBoundingSphere(); out.add(new THREE.Mesh(bg,mt)); });
  shadowify(out); return out; }
/* ---------- 광장 만들기 ---------- */
function hsRng(sd){ let s=(sd>>>0)||1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>17; s^=s<<5; s>>>=0; return (s%100000)/100000; }; }
function hsBuild(){ if(HS.built) return; HS.built=true; const add=o=>{ scene.add(o); HS.parts.push(o); return o; };
  const stone=mat({color:0xd8c8a8,roughness:.95}), dk=mat({color:0xa89070,roughness:.95}), grass=mat({color:0x9ac070,roughness:1}), wood=mat({color:0x9a6a3a,roughness:.9}), wd2=mat({color:0x6a4424,roughness:.95}), gold=M.gold;
  const G0=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CircleGeometry(HS_OUT+4,64),grass); base.rotation.x=-Math.PI/2; base.position.set(HSX,-.02,HSZ); G0.add(base);
  const plaza=new THREE.Mesh(new THREE.CircleGeometry(HS_R+2,64),stone); plaza.rotation.x=-Math.PI/2; plaza.position.set(HSX,.01,HSZ); G0.add(plaza);
  for(let k=0;k<6;k++){ const r=new THREE.Mesh(new THREE.RingGeometry(5+k*5.4,5.25+k*5.4,64),dk); r.rotation.x=-Math.PI/2; r.position.set(HSX,.02,HSZ); G0.add(r); }
  // 성벽(남쪽 문 자리만 비움)
  for(let k=0;k<28;k++){ const a=k/28*6.283; if(Math.abs(Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2)))<.25) continue; const x=HSX+Math.cos(a)*(HS_OUT+1.5), z=HSZ+Math.sin(a)*(HS_OUT+1.5); const w=box(10.4,4.2,1.6,stone,x,2.1,z); w.rotation.y=-a+Math.PI/2; G0.add(w); if(k%2===0){ const tw=cyl(1.5,1.7,6,stone,x,3,z,10); G0.add(tw); G0.add(cyl(1.8,1.8,.5,dk,x,6.2,z,10)); } }
  // 가운데 트로이 목마
  const H=new THREE.Group(); H.add(box(3.2,3,7.5,wood,0,6.2,0)); H.add(box(2.6,2.6,1.2,wood,0,8.2,4.3)); H.add(box(1.8,4.4,1.8,wood,0,9.4,4.1)); const hd=box(1.8,1.8,3.6,wood,0,11.4,5.2); H.add(hd); H.add(box(1.2,1.2,1.4,wd2,0,11.1,7.1));
  [-1,1].forEach(s=>{ H.add(box(.3,1,.6,wd2,s*.6,12.6,4.4)); H.add(sph(.18,mat({color:0x1a1410}),s*.92,11.8,6.2)); }); H.add(box(.5,2.4,4.2,wd2,0,10.6,3.1));
  [[1.1,2.8],[-1.1,2.8],[1.1,-2.8],[-1.1,-2.8]].forEach(([x,z])=>H.add(box(.9,4.4,.9,wood,x,2.6,z))); H.add(box(4.2,.6,9,wd2,0,.3,0));
  [[1.9,3.6],[-1.9,3.6],[1.9,-3.6],[-1.9,-3.6]].forEach(([x,z])=>{ const w=new THREE.Mesh(new THREE.TorusGeometry(.8,.2,8,16),wd2); w.position.set(x,.8,z); w.rotation.y=Math.PI/2; H.add(w); });
  H.add(box(.4,2.6,.4,wd2,0,5.2,-4)); const tail=box(.4,2.4,.4,mat({color:0x5a3a20}),0,6,-4.1); tail.rotation.x=.4; H.add(tail);
  H.position.set(HSX,0,HSZ); H.rotation.y=Math.PI*.15; G0.add(H); HS.horse={x:HSX,z:HSZ};
  // 기둥 + 깃발
  for(let k=0;k<8;k++){ const a=k/8*6.283+.2; const x=HSX+Math.cos(a)*(HS_R+4.5), z=HSZ+Math.sin(a)*(HS_R+4.5); G0.add(cyl(.6,.75,7,stone,x,3.5,z,10)); G0.add(box(1.6,.4,1.6,gold,x,7.2,z)); const f=sph(.45,glowMat(0xffa040,.85),x,7.9,z); f.userData.noOutline=true; G0.add(f); }
  // 목마 대기실(술래가 눈 감고 세는 곳)
  const hut=new THREE.Group(); hut.add(box(12,.4,12,wd2,0,.2,0)); [[-6,0],[6,0],[0,-6]].forEach(([x,z])=>{ const w=box(z?12:.6,4,z?.6:12,wood,x,2.2,z); hut.add(w); }); hut.add(box(13,.5,13,wd2,0,4.4,0)); hut.position.set(HSX,0,HSZ+HS_WAITZ); G0.add(hut);
  add(shadowify(G0));
  { const g=pgArch(false); g.position.set(HSX,0,HSZ+HS_OUT-2.5); add(shadowify(g)); HS.exitArch={x:HSX,z:HSZ+HS_OUT-3.2}; }
  // 가짜 물건 40개 (모든 폰이 같은 자리)
  const r=hsRng(20261112); HS.decoys=[]; let tries=0; while(HS.decoys.length<40&&tries++<2000){ const a=r()*6.283, d=7+r()*(HS_R-8); const x=HSX+Math.cos(a)*d, z=HSZ+Math.sin(a)*d; if(Math.hypot(x-HSX,z-HSZ)<7.5) continue; if(Math.abs(x-HSX)<3&&z>HSZ+HS_R-6) continue; if(HS.decoys.some(o=>Math.hypot(o.x-x,o.z-z)<2.6)) continue; const k=Math.floor(r()*5); const mesh=hsPropMesh(k); const rot=r()*6.283; mesh.position.set(x,0,z); mesh.rotation.y=rot; add(mesh); HS.decoys.push({x,z,k,rot,mesh,wob:0}); }
  HS.parts.forEach(o=>o.traverse&&o.traverse(m=>{ if(m.material&&m.material.blending===THREE.AdditiveBlending){ m.castShadow=false; m.userData.noOutline=true; } })); }
function hsShow(v){ HS.parts.forEach(o=>o.visible=v); }
/* ---------- 수도의 목마 문 ---------- */
function hsGateModel(){ const g=new THREE.Group(); const wood=mat({color:0x9a6a3a,roughness:.9}), wd2=mat({color:0x6a4424,roughness:.95});
  [-1,1].forEach(k=>{ g.add(cyl(.5,.6,6,wood,k*2.9,3,0,10)); }); g.add(box(7.2,.7,1,wd2,0,6.4,0));
  const h=new THREE.Group(); h.add(box(1.2,1,2.4,wood,0,0,0)); h.add(box(.7,1.5,.7,wood,0,.9,1.1)); h.add(box(.7,.7,1.3,wood,0,1.6,1.6)); [[.4,.9],[-.4,.9],[.4,-.9],[-.4,-.9]].forEach(([x,z])=>h.add(box(.3,1.1,.3,wood,x,-1,z))); h.position.set(0,8.3,0); h.rotation.y=Math.PI/2; g.add(h);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.35,.2,10,40),glowMat(0xffc860,.8)); ring.position.y=3; ring.userData.noOutline=true; g.add(ring); const disc=new THREE.Mesh(new THREE.CircleGeometry(2.25,40),glowMat(0xffe0a0,.28)); disc.position.y=3; disc.userData.noOutline=true; g.add(disc);
  g.userData.ring=ring; g.userData.disc=disc; return g; }
setTimeout(()=>{ for(let r=0;r<4;r++){ let s; try{ s=xCapSpot(r,30); }catch(e){ const c=REGIONS[r*3]; s={x:c.x+(c.x>0?-30:30),z:c.z-16,rot:0}; } XSPOT_USED.push({r,x:s.x,z:s.z,rad:6}); const g=hsGateModel(); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); HS.gates[r]={x:s.x,z:s.z,rot:s.rot,g}; } },30);
function hsGateNear(){ if(HS.on) return null; if(typeof glAway==="function"&&glAway()) return null; for(const s of HS.gates){ if(s&&Math.hypot(P.x-s.x,P.z-s.z)<5.5) return s; } return null; }
/* ---------- 들어가기 · 나가기 ---------- */
function hsEnter(){ if(HS.on||P.dead) return; if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  closeLayer(); try{ if(typeof glAway==="function"&&glAway()){ if(typeof DG!=="undefined"&&DG.on) dgExit(true); if(typeof HM!=="undefined"&&HM.on) hmExit(); if(typeof PG!=="undefined"&&PG.on) pgExit(true,true); if(typeof TW!=="undefined"&&TW.on) twExit(true,true); if(typeof LV!=="undefined"&&LV.on) lvExit(true,true); if(typeof AR!=="undefined"&&AR.on) arExit(true,true); if(typeof OK!=="undefined"&&OK.on) okExit(true,true); if(typeof HY!=="undefined"&&HY.on) hyExit(true,true); } }catch(e){} try{ if(P.ride) rdSet(false); }catch(e){}
  hsBuild(); hsShow(true); HS.on=true; HS.m=null; HS.joinT=Date.now(); HS.hostT=0; HS.lobby={}; HS.cd=2.5; HS.hbT=0;
  P.x=HSX+rnd(-5,5); P.z=HSZ+HS_R-3; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul||0,1.5); P.guide=null; $("guide").hidden=true; G.hsIn=(G.hsIn||0)+1; saveGame();
  try{ lvBanner("트로이 광장","🐴 트로이 목마 숨바꼭질","항아리·석상·양으로 변신해 숨어요 · 술래는 창으로 콕!","#ffc860"); }catch(e){ toast("🐴 트로이 목마 숨바꼭질"); }
  fxRing(P.x,P.z,0xffc860,8,.8); fxSpark(P.x,2,P.z,0xffc860,30); jingle([392,523,659,784]); hsHudInit(); }
function hsExit(silent,noTp){ if(!HS.on) return; if(HS.m) hsEndMatch(true); HS.on=false; hsShow(false); hsUndisguise(); if(HS.hud) HS.hud.hidden=true; if(HS.bar) HS.bar.hidden=true; if(HS.lbl) HS.lbl.style.display="none";
  for(const id in HS.peerProp){ scene.remove(HS.peerProp[id].mesh); delete HS.peerProp[id]; }
  if(!noTp){ const s=HS.gates[Math.max(0,G.realm)]||{x:REGIONS[Math.max(0,G.realm)*3].x,z:REGIONS[Math.max(0,G.realm)*3].z,rot:0}; P.x=s.x+Math.sin(s.rot)*6; P.z=s.z+Math.cos(s.rot)*6; P.y=0; P.vy=0; P.rot=s.rot; HS.cd=4; } if(!silent) toast("수도로 돌아왔어요","목마 문은 언제든 열려 있어요",1.8); }
(function(){ const _sh=spawnAtHome; spawnAtHome=function(){ if(HS.on) hsExit(true,true); _sh(); };
  const _hp=hurtPlayer; hurtPlayer=function(d,f){ if(HS.on) return; return _hp(d,f); };
  const _us=useSkill; useSkill=function(i){ if(HS.on){ toast("🐴 숨바꼭질에서는 모두 같은 힘!",HS.m&&hsRole()==="seek"?"공격 버튼으로 콕 찔러요":"물건으로 변신해 숨어요",1.4); return; } return _us(i); };
  const _at=attack; attack=function(){ if(HS.on){ if(P.dead||layerOpen) return; hsPoke(); return; } return _at(); }; })();
/* ---------- 변신 ---------- */
function hsDisguise(k){ k=clamp(k|0,0,4); HS.myK=k; if(HS.myProp){ scene.remove(HS.myProp); HS.myProp=null; } HS.myProp=hsPropMesh(k); scene.add(HS.myProp); player.visible=false; fxSpark(P.x,1.2,P.z,0xffffff,22); fxRing(P.x,P.z,0xffe0a0,3,.4); tone(880,.08,"sine",0,.1); tone(1320,.1,"sine",.08,.08);
  if(HS.m) try{ net.send({t:"hsv",m:HS.m.sd,k}); }catch(e){} hsBarDraw(); }
function hsUndisguise(){ if(HS.myProp){ scene.remove(HS.myProp); HS.myProp=null; } player.visible=true; }
/* ---------- 대기실 ---------- */
NETR.hsl=(o,d)=>{ if(!HS.on) return; HS.lobby[o.id]={j:+d.j||0,mt:d.mt||0,left:d.left,last:performance.now(),n:o.name,r:o.realm}; };
function hsMembers(){ const now=performance.now(); const L=[{id:G.id,j:HS.joinT,me:1}]; let busy=false; for(const id in HS.lobby){ const l=HS.lobby[id]; if(now-l.last>5000||!PEERS[id]){ delete HS.lobby[id]; continue; } if(l.mt) busy=true; else L.push({id,j:l.j,left:l.left}); } L.sort((a,b)=>a.j-b.j||(a.id<b.id?-1:1)); return {L,busy}; }
function hsLobbyTick(dt){ const {L,busy}=hsMembers(); HS.nMem=L.length; HS.busy=busy; if(busy){ HS.hostT=0; HS.left=HS_LOBBY; return; }
  const host=L[0]; HS.isHost=host.me===1; if(HS.isHost){ if(!HS.hostT) HS.hostT=Date.now(); HS.left=Math.max(0,HS_LOBBY-(Date.now()-HS.hostT)/1000); if(HS.left<=0) hsHostStart(L); } else { HS.hostT=0; HS.left=host.left!=null?host.left:HS_LOBBY; } }
function hsHostStart(L){ const ids=L.slice(0,8).map(x=>x.id); const sd=1+Math.floor(Math.random()*2e9); let sk=null; if(ids.length>1){ const sorted=ids.slice().sort(); sk=sorted[sd%sorted.length]; }
  const msg={t:"hss",m:sd,ids,sk}; try{ net.send(msg); setTimeout(()=>{ try{ net.send({t:"hss",m:sd,ids,sk}); }catch(e){} },400); }catch(e){} hsBegin(sd,ids,sk); }
NETR.hss=(o,d)=>{ if(!HS.on||HS.m) return; if(!Array.isArray(d.ids)||d.ids.indexOf(G.id)<0) return; hsBegin(d.m|0,d.ids.slice(0,8).map(String),d.sk?String(d.sk):null); };
/* ---------- 판 ---------- */
function hsRole(){ const m=HS.m; if(!m) return ""; if(m.sk===G.id) return "seek"; const h=m.hid[G.id]; return h?(h.caught?"out":"hide"):""; }
function hsBegin(sd,ids,sk){ if(HS.m) return; const r=hsRng(sd*7+3); const solo=ids.length<=1; const m={sd,ids,sk:sk,t0:Date.now()+HS_INTRO*1000,hid:{},bots:[],botSeek:null,catches:0,done:false,res:null,boop:-1};
  if(solo){ G.hsN=(G.hsN||0)+1; if(G.hsN%2===1){ m.sk=G.id; } else { m.sk="botS"; } }
  ids.forEach(id=>{ if(id!==m.sk) m.hid[id]={id,k:Math.floor(r()*5),caught:false,hum:1}; });
  const nBots=solo?(m.sk===G.id?4:2):Math.max(0,3-Object.keys(m.hid).length);
  for(let b=0;b<nBots;b++){ let x=0,z=0,ok=false,t=0; while(!ok&&t++<200){ const a=r()*6.283, d=8+r()*(HS_R-10); x=HSX+Math.cos(a)*d; z=HSZ+Math.sin(a)*d; ok=!HS.decoys.some(o=>Math.hypot(o.x-x,o.z-z)<2.2)&&!m.bots.some(o=>Math.hypot(o.x-x,o.z-z)<3); } const k=Math.floor(r()*5); const id="bot"+b; const mesh=hsPropMesh(k); mesh.position.set(x,0,z); mesh.rotation.y=r()*6.283; mesh.visible=false; scene.add(mesh); const bo={id,n:HS_BOTN[b],k,x,z,mesh,caught:false,bot:1}; m.bots.push(bo); m.hid[id]=bo; }
  if(m.sk==="botS"){ const tm=pgTalos(1); tm.position.set(HSX,0,HSZ+HS_WAITZ); scene.add(shadowify(tm)); m.botSeek={mesh:tm,x:HSX,z:HSZ+HS_WAITZ,tx:null,tz:null,think:0,poke:0,walk:0,lbl:makeLabel("foe"),visit:{}}; }
  HS.m=m; HS.boopN=-1; closeLayer(); const role=hsRole();
  if(role==="hide"){ P.x=HSX+rnd(-4,4); P.z=HSZ+rnd(5,8); P.y=0; P.vy=0; hsDisguise(m.hid[G.id].k); }
  else if(role==="seek"){ hsUndisguise(); P.x=HSX; P.z=HSZ+HS_WAITZ; P.y=0; P.vy=0; P.rot=Math.PI; }
  const nh=Object.keys(m.hid).length; const skName=m.sk===G.id?"나":m.sk==="botS"?"탈로스 술래":owlEsc(PEERS[m.sk]?PEERS[m.sk].name:"친구");
  try{ lvBanner(role==="seek"?"🪖 내가 술래!":"🙈 숨어요!",role==="seek"?"목마 대기실에서 20까지 세요":"물건으로 변신해 숨어요",`술래: ${skName} · 숨는 사람 ${nh}명`,"#ffc860"); }catch(e){ toast(role==="seek"?"🪖 내가 술래!":"🙈 숨어요!",null,2.4); }
  jingle([392,523,659,784]); hsBarDraw(); G.hsPlay=(G.hsPlay||0)+1; saveGame(); }
function hsNow(){ return HS.m?(Date.now()-HS.m.t0)/1000:0; }
function hsPhase(){ const t=hsNow(); if(t<0) return "intro"; if(t<HS_HIDE) return "hide"; if(t<HS_HIDE+HS_SEEK) return "seek"; return "end"; }
function hsLeft(){ const m=HS.m; if(!m) return 0; let n=0; for(const id in m.hid){ const h=m.hid[id]; if(h.caught) continue; if(h.hum&&id!==G.id&&!PEERS[id]) continue; n++; } return n; }
function hsCatch(id,by,silent){ const m=HS.m; if(!m) return; const h=m.hid[id]; if(!h||h.caught) return; h.caught=true; const x=h.bot?h.x:id===G.id?P.x:(PEERS[id]?PEERS[id].x:HSX), z=h.bot?h.z:id===G.id?P.z:(PEERS[id]?PEERS[id].z:HSZ);
  fxSpark(x,1.4,z,0xffe08a,30); fxRing(x,z,0xffe08a,5,.6); if(h.bot&&h.mesh){ h.mesh.visible=false; }
  if(id===G.id){ hsUndisguise(); P.x=HSX+rnd(-12,12); P.z=HSZ+HS_R+5; P.y=0; P.vy=0; toast("🙈 들켰어요!","관중석에서 친구들을 응원해요",2.4); tone(330,.2,"triangle"); tone(262,.3,"triangle",.18); buzz([40,40,40]); hsBarDraw(); }
  else if(!silent){ const nm=h.bot?h.n:owlEsc(PEERS[id]?PEERS[id].name:"친구"); toast(`🪖 찾았다! ${nm}`,`${HS_KIND[h.k].ic} ${HS_KIND[h.k].n}였어요 · 남은 사람 ${hsLeft()}명`,2); jingle([659,880,1046]); }
  if(hsLeft()<=0&&!m.done) hsFinish(true); }
NETR.hsc=(o,d)=>{ const m=HS.m; if(!m||(d.m|0)!==m.sd||o.id!==m.sk) return; hsCatch(String(d.id),o.id); };
NETR.hsv=(o,d)=>{ const m=HS.m; if(!m||(d.m|0)!==m.sd) return; const h=m.hid[o.id]; if(h&&!h.caught) h.k=clamp(d.k|0,0,4); };
NETR.hsp=(o,d)=>{ const m=HS.m; if(!m||(d.m|0)!==m.sd) return; const h=m.hid[o.id]; if(h&&!h.caught&&!d.c) h.k=clamp(d.k|0,0,4); if(h&&d.c&&!h.caught) hsCatch(o.id,null,true); if(o.id===m.sk&&Array.isArray(d.cg)) d.cg.forEach(id=>{ if(m.hid[id]&&!m.hid[id].caught) hsCatch(String(id),o.id,true); }); };
/* ---------- 콕 찌르기 ---------- */
function hsTargets(){ const m=HS.m; const L=[]; if(!m) return L; for(const id in m.hid){ const h=m.hid[id]; if(h.caught) continue; if(h.bot) L.push({id,x:h.x,z:h.z,hid:1}); else if(id!==G.id&&PEERS[id]) L.push({id,x:PEERS[id].x,z:PEERS[id].z,hid:1}); else if(id===G.id) L.push({id,x:P.x,z:P.z,hid:1}); } HS.decoys.forEach((o,i)=>L.push({id:"d"+i,x:o.x,z:o.z,dec:o})); return L; }
function hsPoke(){ const m=HS.m; const ph=m?hsPhase():""; if(!m||hsRole()!=="seek"){ if(hsRole()==="hide"&&ph==="seek"){ toast("쉿! 🤫 가만히 숨어 있어요",null,1); } else if(!m){ P.atkAnim=.25; if(player.userData.gl) animState(player,"attack"); } return; }
  if(ph!=="seek"){ toast("아직 눈 감고 세는 중이에요 🙈",null,1); return; } if(HS.pokeCd>0) return; HS.pokeCd=.45; P.atkAnim=.25; if(player.userData.gl) animState(player,"attack"); try{ SLASH.swing&&SLASH.swing(); }catch(e){}
  let best=null, bd=99; hsTargets().forEach(t=>{ if(t.id===G.id) return; const d=Math.hypot(t.x-P.x,t.z-P.z); if(d<HS_REACH&&facingHit(t.x,t.z,HS_REACH,1.1)&&d<bd){ bd=d; best=t; } });
  const fx=P.x+Math.sin(P.rot)*1.8, fz=P.z+Math.cos(P.rot)*1.8; fxSpark(fx,1.2,fz,0xd8dde6,6); tone(500,.05,"square",0,.06); try{ net.send({t:"a",k:"atk"}); }catch(e){}
  if(!best) return; if(best.hid){ m.catches++; G.hsCatch=(G.hsCatch||0)+1; try{ net.send({t:"hsc",m:m.sd,id:best.id}); }catch(e){} hsCatch(best.id,G.id); P.shake=Math.max(P.shake||0,.3); buzz(30); saveGame(); }
  else { best.dec.wob=.6; HS.pokeCd=1.2; floatDmg(best.x,2.4,best.z,"꽝! 진짜 물건","me"); tone(200,.12,"triangle"); } }
/* ---------- 로봇 술래 (혼자 숨을 때) ---------- */
function hsBotSeek(dt){ const m=HS.m, b=m.botSeek; if(!b) return; const ph=hsPhase(); const tn=performance.now();
  if(ph==="seek"&&!m.done){ b.think-=dt; b.poke=Math.max(0,b.poke-dt);
    if(b.tx==null||b.think<=0){ const L=hsTargets(); const meMoving=hsRole()==="hide"&&tn-HS.lastMove<1600&&Math.hypot(P.x-b.x,P.z-b.z)<16; let t=null;
      if(meMoving) t={id:G.id,x:P.x,z:P.z,hid:1}; else { const cand=L.filter(o=>!b.visit[o.id]); cand.sort((p,q)=>Math.hypot(p.x-b.x,p.z-b.z)-Math.hypot(q.x-b.x,q.z-b.z)); t=cand[Math.floor(Math.random()*Math.min(4,cand.length))]||null; if(!t){ b.visit={}; } }
      if(t){ b.tg=t; b.tx=t.x+rnd(-.4,.4); b.tz=t.z+rnd(-.4,.4); } else { b.tx=HSX+rnd(-20,20); b.tz=HSZ+rnd(-20,20); b.tg=null; } b.think=rnd(3,5); }
    const dx=b.tx-b.x, dz=b.tz-b.z, d=Math.hypot(dx,dz); if(d>2){ b.x+=dx/d*4.2*dt; b.z+=dz/d*4.2*dt; b.rot=Math.atan2(dx,dz); b.walk+=dt*9; }
    else if(b.tg&&b.poke<=0){ b.poke=1.6; b.visit[b.tg.id]=1; const t=b.tg; b.tg=null; b.think=.8; const tx=t.id===G.id?P.x:t.x, tz=t.id===G.id?P.z:t.z;
      fxSpark(tx,1.2,tz,0xd8dde6,8); tone(500,.05,"square",0,.04); const u=b.mesh.userData; if(u.aR) u.aR.rotation.x=-2;
      if(t.hid&&Math.hypot(tx-b.x,tz-b.z)<HS_REACH+.6){ const lucky=t.id===G.id&&!(tn-HS.lastMove<1600)&&Math.random()<.35; if(lucky){ floatDmg(P.x,2.6,P.z,"휴… 지나갔다!","gain"); } else hsCatch(t.id,"botS"); }
      else if(t.dec){ t.dec.wob=.6; } } }
  else if(ph==="hide"||ph==="intro"){ b.x=HSX; b.z=HSZ+HS_WAITZ; }
  else if(ph==="seek"&&b.x===HSX&&b.z===HSZ+HS_WAITZ){ b.x=HSX; b.z=HSZ+HS_R+2; }
  if(ph==="seek"&&b.z>HSZ+HS_OUT) { b.x=HSX; b.z=HSZ+HS_R+2; }
  b.mesh.position.set(b.x,0,b.z); b.mesh.rotation.y=b.rot||Math.PI; const u=b.mesh.userData; const sw=Math.sin(b.walk)*.6; if(u.lL){ u.lL.rotation.x=sw; u.lR.rotation.x=-sw; } if(u.aR) u.aR.rotation.x+=(0-u.aR.rotation.x)*Math.min(1,dt*5);
  if(Math.hypot(b.x-P.x,b.z-P.z)<45&&!layerOpen) placeLabel(b.lbl,b.x,5,b.z,"🪖 <b>탈로스 술래</b>"); else b.lbl.style.display="none"; }
/* ---------- 끝 ---------- */
function hsFinish(seekWin){ const m=HS.m; if(!m||m.done) return; m.done=true; const role=hsRole(); const me=m.hid[G.id]; const L=G.lv; let gold=0,xp=0,line="";
  if(m.sk===G.id){ gold=m.catches*(25+L*3)+(seekWin?60+L*5:0); xp=m.catches*(20+L*6)+(seekWin?50+L*8:0); if(seekWin) G.hsSeek=(G.hsSeek||0)+1; line=seekWin?`🪖 술래 승리! 모두 찾았어요 (${m.catches}명)`:`⏰ 시간 끝! ${m.catches}명 찾았어요`; }
  else if(me){ if(!me.caught){ gold=80+L*6; xp=60+L*10; G.hsSurv=(G.hsSurv||0)+1; line=`🏺 끝까지 숨었어요! «${HS_KIND[me.k].n}» 변신 대성공`; } else { gold=20+L*2; xp=15+L*3; line="🙈 들켰지만 재밌었어요!"; } }
  G.gold+=gold; gainXp(xp); saveGame(); m.res={seekWin,line,gold,xp}; HS.resT=HS_RES; hsUndisguise();
  jingle(seekWin===(m.sk===G.id)||(me&&!me.caught)?[523,659,784,1046,1318]:[523,659,784]);
  card(`<h2>🐴 숨바꼭질 끝!</h2><p style="font-size:18px;font-weight:900">${seekWin?"🪖 술래 승리!":"🏺 숨은 쪽 승리!"}</p><p>${line}</p>
   <div class="idlegrid"><div><b>+${fmt(gold)}</b><span>금화</span></div><div><b>+${fmt(xp)}</b><span>경험치</span></div><div><b>${G.hsPlay||0}</b><span>내가 한 판</span></div></div>
   <div class="row" style="flex-wrap:wrap;gap:4px">${Object.values(m.hid).map(h=>`<span style="padding:3px 7px;border-radius:9px;background:${h.caught?"#5a3a3a":"#3a5a3a"}">${HS_KIND[h.k].ic} ${h.bot?h.n:h.id===G.id?"나":owlEsc(PEERS[h.id]?PEERS[h.id].name:"친구")} ${h.caught?"🙈":"🏆"}</span>`).join("")}</div>
   <div class="exgrid">${HS_SAY.map((s,i)=>`<button class="buy alt" data-hsy="${i}">${s}</button>`).join("")}</div><p style="font-size:12px">곧 광장으로 돌아가 다음 판을 기다려요.</p>`);
  layers.querySelectorAll("[data-hsy]").forEach(b=>b.onclick=()=>{ const s=HS_SAY[+b.dataset.hsy]; try{ net.send({t:"say",m:s}); net.chat(G.name,s,G.realm); }catch(e){} b.disabled=true; }); }
function hsEndMatch(silent){ const m=HS.m; if(!m) return; m.bots.forEach(b=>{ if(b.mesh) scene.remove(b.mesh); }); if(m.botSeek){ scene.remove(m.botSeek.mesh); m.botSeek.lbl.remove(); } for(const id in HS.peerProp){ scene.remove(HS.peerProp[id].mesh); delete HS.peerProp[id]; }
  HS.m=null; hsUndisguise(); HS.joinT=Date.now(); HS.hostT=0; if(HS.on&&!silent){ P.x=HSX+rnd(-5,5); P.z=HSZ+HS_R-3; P.y=0; P.vy=0; P.rot=Math.PI; } hsBarDraw(); }
/* ---------- 화면 위 칸 ---------- */
function hsHudInit(){ if(!HS.hud){ const d=document.createElement("div"); d.id="hsHud"; d.style.cssText="position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 54px);transform:translateX(-50%);z-index:30;padding:5px 12px;border-radius:12px;background:rgba(40,24,10,.82);color:#ffe8b0;font:900 14px sans-serif;text-align:center;pointer-events:none;white-space:nowrap;border:2px solid #c89a4a"; document.body.appendChild(d); HS.hud=d; }
  if(!HS.bar){ const b=document.createElement("div"); b.id="hsBar"; b.style.cssText="position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 88px);transform:translateX(-50%);z-index:31;display:flex;gap:5px"; document.body.appendChild(b); HS.bar=b; b.addEventListener("click",e=>{ const t=e.target.closest("[data-hk]"); if(!t) return; e.stopPropagation(); if(hsRole()!=="hide") return; if(hsPhase()!=="hide"&&hsPhase()!=="intro"){ toast("변신은 숨는 시간에만!",null,1); return; } hsDisguise(+t.dataset.hk); }); }
  HS.hud.hidden=false; hsBarDraw(); }
function hsBarDraw(){ if(!HS.bar) return; const show=!layerOpen&&HS.on&&HS.m&&hsRole()==="hide"&&(hsPhase()==="hide"||hsPhase()==="intro"); HS.bar.hidden=!show; if(!show) return; if(HS.barK===HS.myK) return; HS.barK=HS.myK;
  HS.bar.innerHTML=HS_KIND.map((k,i)=>`<button type="button" data-hk="${i}" style="min-width:48px;height:44px;border-radius:12px;border:2px solid ${i===HS.myK?"#ffd27a":"#8a6a3a"};background:${i===HS.myK?"#7a4a1a":"rgba(40,24,10,.85)"};color:#fff;font:900 20px sans-serif;pointer-events:auto">${k.ic}</button>`).join(""); }
/* ---------- 매 프레임 ---------- */
function hsTick(dt){ const tn=performance.now();
  HS.gates.forEach(s=>{ if(!s||!s.g) return; const u=s.g.userData; u.ring.rotation.z+=dt*1.4; u.disc.material.opacity=.22+Math.sin(tn/240)*.08; });
  if(!HS.gateLbl) HS.gateLbl=makeLabel("ally"); { const s=!HS.on?HS.gates.find(s=>s&&Math.hypot(P.x-s.x,P.z-s.z)<30):null; if(s&&!layerOpen) placeLabel(HS.gateLbl,s.x,10,s.z,`🐴 <b>목마 숨바꼭질</b>`); else HS.gateLbl.style.display="none"; }
  if(!HS.on) return; if(!hsIn(P.x,P.z)){ hsExit(true,true); return; }
  HS.cd=Math.max(0,HS.cd-dt); HS.pokeCd=Math.max(0,HS.pokeCd-dt); if(P.moving) HS.lastMove=tn;
  // 신수 숨기기(따라다니는 신수가 숨은 곳을 알려 주지 않게)
  try{ if(PETMESH.me) PETMESH.me.mesh.visible=false; for(const k in PETMESH.others) PETMESH.others[k].mesh.visible=false; }catch(e){}
  HS.decoys.forEach(o=>{ if(o.wob>0){ o.wob-=dt; o.mesh.rotation.z=Math.sin(o.wob*30)*.12*o.wob; } else o.mesh.rotation.z=0; });
  const m=HS.m; HS.hbT-=dt;
  if(!m){ // 대기실
    if(HS.hbT<=0){ HS.hbT=1; try{ net.send({t:"hsl",j:HS.joinT,mt:0,left:HS.isHost?Math.round(HS.left):null}); }catch(e){} }
    hsLobbyTick(dt); const ex=HS.exitArch; if(ex&&HS.cd<=0&&Math.hypot(P.x-ex.x,P.z-ex.z)<2.6){ hsExit(); return; }
    HS.hud.hidden=layerOpen; { const tx=HS.busy?"🐴 다른 판이 끝나기를 기다려요…":`🐴 ${HS.nMem}명 모임 · <b style="color:#fff">${Math.ceil(HS.left)}</b>초 뒤 시작${HS.nMem<2?" (혼자면 탈로스와 함께!)":""}`; if(HS.hud._h!==tx){ HS.hud._h=tx; HS.hud.innerHTML=tx; } }
    $("region").innerHTML=`🐴 트로이 광장 <b>숨바꼭질 대기 중</b>`; }
  else { const ph=hsPhase(), t=hsNow(), role=hsRole();
    if(HS.hbT<=0){ HS.hbT=1.5; const cg=role==="seek"?Object.keys(m.hid).filter(id=>m.hid[id].caught):null; try{ net.send({t:"hsl",j:HS.joinT,mt:m.sd}); net.send({t:"hsp",m:m.sd,k:HS.myK,c:role==="out"?1:0,cg}); }catch(e){} }
    // 술래가 사라지면 숨은 쪽 승
    if(!m.done&&m.sk!==G.id&&m.sk!=="botS"&&!PEERS[m.sk]&&ph!=="intro"){ hsFinish(false); }
    if(!m.done&&ph==="end") hsFinish(hsLeft()<=0);
    if(m.done){ HS.resT-=dt; if(HS.resT<=0){ if(layerOpen) closeLayer(); hsEndMatch(); return; } }
    // 술래는 숨는 동안 대기실에 묶임
    if(role==="seek"&&(ph==="intro"||ph==="hide")){ P.x=clamp(P.x,HSX-5,HSX+5); P.z=clamp(P.z,HSZ+HS_WAITZ-5,HSZ+HS_WAITZ+5); }
    if(role==="seek"&&ph==="seek"&&P.z>HSZ+HS_OUT){ P.x=HSX; P.z=HSZ+HS_R+2; P.rot=Math.PI; toast("🔍 찾기 시작!","물건을 공격 버튼으로 콕 찔러 봐요",2); jingle([523,784,1046]); }
    // 내 변신 모습
    if(HS.myProp&&role==="hide"){ HS.myProp.position.set(P.x,0,P.z); HS.myProp.rotation.y=P.rot; player.visible=false; } else if(role!=="hide"&&HS.myProp) hsUndisguise();
    // 친구 변신 모습
    for(const id in m.hid){ const h=m.hid[id]; if(h.bot){ h.mesh.visible=!h.caught&&ph!=="intro"; continue; } if(id===G.id) continue; const o=PEERS[id]; let pp=HS.peerProp[id];
      if(!o||h.caught){ if(pp){ scene.remove(pp.mesh); delete HS.peerProp[id]; } if(o) o.mesh.visible=!o.dead; continue; }
      if(!pp||pp.k!==h.k){ if(pp) scene.remove(pp.mesh); pp=HS.peerProp[id]={k:h.k,mesh:hsPropMesh(h.k)}; scene.add(pp.mesh); }
      o.mesh.visible=false; o.lbl.style.display="none"; pp.mesh.position.set(o.x,0,o.z); pp.mesh.rotation.y=o.mesh.rotation.y; pp.mesh.visible=!(role==="seek"&&ph==="hide"); }
    // 뿅! (20초마다, 모든 폰이 같은 시각)
    if(ph==="seek"){ const n=Math.floor((t-HS_HIDE)/20); if(n>=1&&n!==HS.boopN){ HS.boopN=n; let near=99; for(const id in m.hid){ const h=m.hid[id]; if(h.caught) continue; let x,z; if(h.bot){ x=h.x; z=h.z; } else if(id===G.id){ x=P.x; z=P.z; } else if(PEERS[id]){ x=PEERS[id].x; z=PEERS[id].z; } else continue; fxSpark(x,2.2,z,0xff9ad8,18); fxRing(x,z,0xff9ad8,2.5,.5); near=Math.min(near,Math.hypot(x-P.x,z-P.z)); if(Math.hypot(x-P.x,z-P.z)<40) floatDmg(x,2.8,z,"뿅!","gain"); }
      if(near<60){ const v=clamp(.14*(1-near/60),.02,.14); tone(1200,.08,"sine",0,v); tone(1600,.1,"sine",.08,v); } } }
    hsBotSeek(dt);
    // 화면 위 칸
    const left=hsLeft(), tot=Object.keys(m.hid).length; let txt="";
    if(m.done) txt=m.res?m.res.line:"";
    else if(ph==="intro") txt=`🐴 곧 시작! <b style="color:#fff">${Math.ceil(-t)}</b>`;
    else if(ph==="hide") txt=role==="seek"?`🙈 눈 감고 세는 중… <b style="color:#fff">${Math.ceil(HS_HIDE-t)}</b>`:`🙈 숨어요! 변신을 골라요 · <b style="color:#fff">${Math.ceil(HS_HIDE-t)}</b>초`;
    else { const s=Math.max(0,Math.ceil(HS_HIDE+HS_SEEK-t)); txt=`${role==="seek"?"🪖 찾아요! 공격 버튼으로 콕":role==="hide"?`${HS_KIND[HS.myK].ic} 쉿! 숨어 있어요`:"👀 구경 중"} · ⏰ <b style="color:#fff">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</b> · 남은 사람 <b style="color:#fff">${left}/${tot}</b>`; }
    HS.hud.hidden=layerOpen&&!m.done; if(HS.hud._h!==txt){ HS.hud._h=txt; HS.hud.innerHTML=txt; } hsBarDraw();
    $("region").innerHTML=`🐴 트로이 광장 <b>${role==="seek"?"🪖 술래":role==="hide"?"🙈 숨는 중":"👀 구경"}</b>`; } }
XTICK.push(hsTick);
function hsSky(dt){ const blind=HS.m&&hsRole()==="seek"&&(hsPhase()==="hide"||hsPhase()==="intro");
  SKY.tTop.setHex(blind?0x1a1430:0x4a8ad8); SKY.tBot.setHex(blind?0x3a2a40:0xffe2b0); const k=Math.min(1,dt*1.5); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=blind?8:90; scene.fog.far=blind?40:320;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+40,80,P.z+20); sun.target.position.set(P.x,0,P.z); sun.intensity=blind?.4:1.05; sun.color.setHex(0xffe8c0); hemi.intensity=blind?.25:.5; fill.intensity=.25; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=.92; }
function hsMinimap(){ const ctx=mctx, S=fitCanvas(mm); const blind=HS.m&&hsRole()==="seek"&&(hsPhase()==="hide"||hsPhase()==="intro");
  ctx.fillStyle=blind?"#1a1430":"#5a7a3a"; ctx.fillRect(0,0,S,S); if(blind){ mmLabel(ctx,"🙈 세는 중",S/2,S/2,Math.round(S/9),"#fff"); return; }
  const s=S*.94/(HS_OUT*2+6); const X=x=>S/2+(x-HSX)*s, Z=z=>S/2+(z-HSZ)*s; dot(ctx,X(HSX),Z(HSZ),HS_OUT*s,"#9ac070","#d8c8a8",3); dot(ctx,X(HSX),Z(HSZ),(HS_R+2)*s,"#e8dcc0","#a89070",1.5);
  HS.decoys.forEach(o=>dot(ctx,X(o.x),Z(o.z),S/70,"#a87a4a")); if(HS.m) HS.m.bots.forEach(b=>{ if(!b.caught) dot(ctx,X(b.x),Z(b.z),S/70,"#a87a4a"); });
  dot(ctx,X(HSX),Z(HSZ),S/22,"#9a6a3a","#fff",1.5); if(HS.exitArch) dot(ctx,X(HS.exitArch.x),Z(HS.exitArch.z),S/26,"#ffd27a","#fff",2);
  const m=HS.m; for(const id in PEERS){ const o=PEERS[id]; if(!hsIn(o.x,o.z)||o.dead) continue; if(m&&m.hid[id]&&!m.hid[id].caught) continue; dot(ctx,X(o.x),Z(o.z),S/36,id===(m&&m.sk)?"#d93025":"#1e8e3e","#fff",1.5); }
  if(m&&m.botSeek) dot(ctx,X(m.botSeek.x),Z(m.botSeek.z),S/36,"#d93025","#fff",1.5);
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const q=S/20; ctx.moveTo(0,-q); ctx.lineTo(q*.7,q*.7); ctx.lineTo(0,q*.35); ctx.lineTo(-q*.7,q*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,"🐴 숨바꼭질",S/2,S*.07,Math.round(S/12),"#fff"); }
XZONE.push({on:()=>HS.on,clamp:()=>{ if(!hsIn(P.x,P.z)){ hsExit(true,true); return false; } const role=hsRole(), ph=HS.m?hsPhase():""; if(role==="seek"&&(ph==="intro"||ph==="hide")){ P.x=clamp(P.x,HSX-5,HSX+5); P.z=clamp(P.z,HSZ+HS_WAITZ-5,HSZ+HS_WAITZ+5); return true; }
  const r=Math.hypot(P.x-HSX,P.z-HSZ), lim=HS_OUT-1.2; if(r>lim){ const k=lim/r; P.x=HSX+(P.x-HSX)*k; P.z=HSZ+(P.z-HSZ)*k; } if(r<4.2){ const k=4.2/(r||1); P.x=HSX+(P.x-HSX)*k; P.z=HSZ+(P.z-HSZ)*k; } return true; },sky:hsSky,mm:hsMinimap});
/* ---------- 창 · 메뉴 · 칭호 ---------- */
function showHide(){ card(`<h2>🐴 트로이 목마 숨바꼭질</h2><p>트로이 광장에 모이면 한 명은 🪖 <b>술래</b>, 나머지는 광장의 물건(🏺 항아리·🗿 석상·🛒 짐수레·🐑 양·🪴 꽃화분)으로 <b>변신</b>해서 숨어요!</p>
   <p>🙈 20초 동안 숨기 → 🔍 2분 동안 술래가 공격 버튼으로 콕콕 찔러 찾아요. 숨은 사람은 20초마다 「뿅!」 반짝여서 들킬 수도 있어요. 다 찾으면 술래 승, 한 명이라도 끝까지 버티면 숨은 쪽 승!</p>
   <div class="idlegrid"><div><b>${G.hsPlay||0}</b><span>한 판</span></div><div><b>🏺 ${G.hsSurv||0}</b><span>끝까지 숨음</span></div><div><b>🪖 ${G.hsCatch||0}</b><span>찾은 사람</span></div></div>
   ${HS.on?"":`<button class="go" id="hsGo" style="align-self:center">🐴 트로이 광장으로 가기</button>`}
   <p style="font-size:12px">레벨·장비와 상관없이 모두 같은 힘 · 혼자면 탈로스 로봇이 같이 놀아 줘요 · 수도의 🐴 목마 문으로도 갈 수 있어요.</p>`); const b=$("hsGo"); if(b) b.onclick=hsEnter; }
MENU_X.push({ic:"🐴",n:"트로이 목마 숨바꼭질",id:"hsBtn",sub:()=>HS.on?(HS.m?"지금 한 판 하는 중":"광장에서 기다리는 중"):`한 판 ${G.hsPlay||0} · 🏺 ${G.hsSurv||0} · 🪖 ${G.hsCatch||0}`,f:showHide});
CTX_EXTRA.push(()=>{ if(hsGateNear()) return {t:"🐴 트로이 목마 숨바꼭질로",f:hsEnter}; return null; });
TITLES.push({id:"hs1",n:"목마 놀이꾼",t:1,h:"🐴 숨바꼭질 10판",g:()=>[G.hsPlay||0,10]},{id:"hs2",n:"완벽한 항아리",t:2,h:"🏺 끝까지 숨기 5번",g:()=>[G.hsSurv||0,5]},{id:"hs3",n:"트로이의 매의 눈",t:3,h:"🪖 숨은 사람 30명 찾기",g:()=>[G.hsCatch||0,30]});
</script>
