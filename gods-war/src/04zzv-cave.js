<script>
/* ================= v135-2: 🕯️ 프로메테우스의 불씨 — 손잡고 걸으면 밝아지는 별빛 동굴 (IDEAS G11/15-2) =================
   메뉴 🕯️ → 지도 밖(x≈0, z≈-400) 별빛 동굴. 안은 캄캄해서 혼자면 내 둘레만 보여요(안개를 카메라~불빛 거리로).
   🕯️ 불빛 = 손잡은 무리 사람 수 + 데리고 다니는 별빛 요정 수. 불빛이 클수록 멀리 보임.
   🤝 손잡기: 동굴 안 4m 안의 사람에게 「손잡기」 → 상대도 「손 잡아 주기」(또는 서로 동시에) → 빛줄로 이어짐. 한 사람 손 2개(양손) → 줄줄이 사슬.
      멀어지면 서로 끌어당겨서 같이 걸음. 글자 없이 버튼만(모르는 사람과도 안전).
   ✨ 길 잃은 별빛 요정 3마리: 구석에 숨어 있음. 닿으면 나를 따라오며 불빛 +1 (혼자서도 끝까지 갈 수 있게).
   🌉 불빛 3이면 낭떠러지 위 빛 다리가 보이고 건널 수 있음(아니면 떨어져서 앞으로 돌아옴). 🦇 장난꾸러기 박쥐는 불빛 3 미만이면 요정을 놀래켜 쫓아버림.
   🚪 불빛 4면 룬 돌문이 열림 → 🔥 불씨 제단에서 「불씨 켜기」 → 함께 손잡은 사람 모두 보상(cvw). 손잡은 사람이 많을수록 🔥 불씨 조각 더.
      새싹(첫 계급)과 손잡고 불씨를 켜면 🧭 길잡이 별 +1(하루 한 번).
   실시간: hh(내 손잡은 목록·요정 수, 1.5초마다) · hhq(손 내밀기) · hha(잡아 주기) · cvw(불씨 켬)
   저장: G.cvEmb(불씨 조각) · G.cvLit(켠 수) · G.cvDay(하루 첫 켜기) · G.cvPal{id:1}(손잡아 본 사람) · G.cvSprDay. 칭호 3개. */
const CVX=0, CVZ=-400;
const CV={on:false,built:false,parts:[],links:{},req:{},inq:{},peer:{},fairies:[],bats:[],light:1,grp:[],hbT:0,lines:[],bridge:null,door:null,doorY:0,lit:false,altar:null,fire:null,cd:0,lbl:null,fallT:0,lastOk:null,name:{}};
const CV_FAIRY=[{x:-15,z:42},{x:15,z:28},{x:-12,z:-30}];
function cvIn(x,z){ return Math.abs(x-CVX)<140&&Math.abs(z-CVZ)<140; }
(function(){ const _h=hAt; hAt=function(x,z){ return cvIn(x,z)?0:_h(x,z); }; })();
function cvWalk(x,z){ const lx=x-CVX, lz=z-CVZ;
  if(Math.hypot(lx,lz-37)<17.5) return true;
  if(Math.abs(lx)<3.4&&lz>=-9&&lz<=22) return true;
  if(Math.hypot(lx,lz+22)<15.5) return true;
  if(Math.abs(lx)<2.8&&lz>=-49&&lz<=-35){ if(lz<-39.3&&CV.light<4) return false; return true; }
  if(Math.hypot(lx,lz+52)<10.5) return true; return false; }
function cvChasm(x,z){ const lz=z-CVZ; return Math.abs(x-CVX)<3.4&&lz>-4.5&&lz<6.5; }
/* ---------- 동굴 만들기 ---------- */
function cvBuild(){ if(CV.built) return; CV.built=true; const add=o=>{ scene.add(o); CV.parts.push(o); return o; };
  const floor=mat({color:0x2a2838,roughness:1}), rock=mat({color:0x3a3648,roughness:.95}), rock2=mat({color:0x4a4458,roughness:.95});
  const G0=new THREE.Group(); const disc=(x,z,r)=>{ const m=new THREE.Mesh(new THREE.CircleGeometry(r,40),floor); m.rotation.x=-Math.PI/2; m.position.set(CVX+x,0,CVZ+z); G0.add(m); };
  disc(0,37,19); disc(0,-22,17); disc(0,-52,12); const strip=(z0,z1,w)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,z1-z0),floor); m.rotation.x=-Math.PI/2; m.position.set(CVX,.001,CVZ+(z0+z1)/2); G0.add(m); }; strip(6.5,22,8); strip(-9,-4.5,8); strip(-49,-35,7);
  // 낭떠러지(검은 틈)
  const pit=new THREE.Mesh(new THREE.PlaneGeometry(9,11),new THREE.MeshBasicMaterial({color:0x000000})); pit.rotation.x=-Math.PI/2; pit.position.set(CVX,.01,CVZ+1); G0.add(pit);
  for(let q=0;q<6;q++){ const g=new THREE.Mesh(new THREE.PlaneGeometry(9,.4),new THREE.MeshBasicMaterial({color:0x3a2a6a,transparent:true,opacity:.5-q*.07,fog:false})); g.rotation.x=-Math.PI/2; g.position.set(CVX,.02,CVZ-4.4+q*.2); G0.add(g); }
  // 벽 돌 (가장자리를 따라)
  const r=hsRng(5151); const wall=(cx,cz,R,skipA)=>{ const n=Math.round(R*1.6); for(let k=0;k<n;k++){ const a=k/n*6.283; if(skipA&&skipA.some(s=>Math.abs(Math.atan2(Math.sin(a-s),Math.cos(a-s)))<.28)) continue; const s=1.8+r()*1.8; const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),r()<.5?rock:rock2); rk.position.set(CVX+cx+Math.cos(a)*(R+s*.6),s*.6,CVZ+cz+Math.sin(a)*(R+s*.6)); rk.rotation.set(r()*3,r()*3,0); G0.add(rk); } };
  wall(0,37,18,[Math.PI/2,-Math.PI/2]); wall(0,-22,16,[Math.PI/2,-Math.PI/2]); wall(0,-52,11,[Math.PI/2]);
  const side=(z0,z1,w)=>{ for(let z=z0;z<=z1;z+=2.4){ [-1,1].forEach(sg=>{ const s=1.4+r()*.8; const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),rock); rk.position.set(CVX+sg*(w+s*.6),s*.5,CVZ+z); rk.rotation.set(r()*3,r()*3,0); G0.add(rk); }); } };
  side(-9,20,3.6); side(-48,-36,3);
  // 빛나는 수정 (안개 무시 · 희미하게 → 어둠 속 길잡이)
  const cols=[0x7ad8ff,0xb08cff,0x8affd8,0xffa8e8]; for(let k=0;k<30;k++){ const zone=k%3; const c=zone===0?{x:0,z:37,R:16}:zone===1?{x:0,z:-22,R:14}:{x:0,z:-52,R:9.5}; const a=r()*6.283; const d=c.R*(.86+r()*.12); const x=CVX+c.x+Math.cos(a)*d, z=CVZ+c.z+Math.sin(a)*d; const col=cols[k%4];
    const cr=new THREE.Mesh(new THREE.ConeGeometry(.35+r()*.3,1.4+r()*1.6,5),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,fog:false})); cr.position.set(x,.7,z); cr.rotation.z=(r()-.5)*.6; cr.userData.noOutline=true; G0.add(cr); }
  add(G0);
  // 입구 아치
  { const g=pgArch(false); g.position.set(CVX,0,CVZ+54.5); add(g); CV.exitArch={x:CVX,z:CVZ+53}; }
  // 빛 다리
  { const b=new THREE.Group(); for(let q=0;q<8;q++){ const p=new THREE.Mesh(new THREE.BoxGeometry(4.4,.18,1.05),new THREE.MeshBasicMaterial({color:0xffe9a8,transparent:true,opacity:.8,fog:false})); p.position.set(CVX,.1,CVZ-4+q*1.4); b.add(p); } [-2.3,2.3].forEach(x=>{ const rl=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,11),glowMat(0xffd27a,.9)); rl.position.set(CVX+x,.9,CVZ+1); b.add(rl); }); b.userData.noOutline=true; b.visible=false; add(b); CV.bridge=b;
    const ghost=new THREE.Group(); for(let q=0;q<8;q+=2){ const p=new THREE.Mesh(new THREE.BoxGeometry(4.4,.05,1),new THREE.MeshBasicMaterial({color:0x6a5aa8,transparent:true,opacity:.18,fog:false})); p.position.set(CVX,.06,CVZ-4+q*1.4); ghost.add(p); } add(ghost); CV.ghost=ghost; }
  // 룬 돌문
  { const d=new THREE.Group(); d.add(box(6.4,6,1.2,rock2,0,3,0)); const rn=new THREE.Mesh(new THREE.RingGeometry(1,1.4,6),new THREE.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:.85,fog:false})); rn.position.set(0,3.3,.62); d.add(rn); const rn2=new THREE.Mesh(new THREE.CircleGeometry(.5,6),new THREE.MeshBasicMaterial({color:0xffd27a,fog:false})); rn2.position.set(0,3.3,.63); d.add(rn2); d.userData.rn=rn; d.position.set(CVX,0,CVZ-39.6); add(shadowify(d)); CV.door=d; }
  // 불씨 제단
  { const g=new THREE.Group(); const st=mat({color:0x8a8070,roughness:.9}); g.add(cyl(2.2,2.6,.8,st,0,.4,0,12)); g.add(cyl(1.2,1.5,1.6,st,0,1.6,0,10)); g.add(cyl(1.5,1,.6,mat({color:0x5a4a3a}),0,2.7,0,12)); const coal=sph(.7,mat({color:0x3a2a2a,emissive:0x2a0a00}),0,2.9,0); coal.scale.y=.4; g.add(coal);
    const fire=new THREE.Group(); const f1=new THREE.Mesh(new THREE.ConeGeometry(.9,2.4,8),glowMat(0xff7a20,.85)); f1.position.y=1.2; fire.add(f1); const f2=new THREE.Mesh(new THREE.ConeGeometry(.5,1.6,8),glowMat(0xffe060,.95)); f2.position.y=1; fire.add(f2); fire.position.y=2.9; fire.visible=false; fire.userData.noOutline=true; g.add(fire);
    g.position.set(CVX,0,CVZ-52); add(shadowify(g)); CV.altar={x:CVX,z:CVZ-52}; CV.fire=fire; }
  CV.lbl=makeLabel(""); }
/* ---------- 요정 · 박쥐 ---------- */
function cvFairyMesh(){ const g=new THREE.Group(); const b=sph(.22,new THREE.MeshBasicMaterial({color:0xfff6c8,fog:false}),0,0,0); g.add(b); const h=new THREE.Mesh(new THREE.SphereGeometry(.55,10,8),new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})); g.add(h);
  [-1,1].forEach(s=>{ const w=new THREE.Mesh(new THREE.CircleGeometry(.32,10),new THREE.MeshBasicMaterial({color:0xc8f0ff,transparent:true,opacity:.7,side:THREE.DoubleSide,fog:false})); w.position.set(s*.28,.1,0); w.scale.set(1,.6,1); g.add(w); g.userData["w"+(s>0?1:0)]=w; }); g.userData.noOutline=true; return g; }
function cvBatMesh(){ const g=new THREE.Group(); const m=mat({color:0x4a3a6a}); g.add(sph(.4,m,0,0,0)); const ey=new THREE.MeshBasicMaterial({color:0xffe060}); [-1,1].forEach(s=>{ g.add(sph(.09,ey,s*.15,.1,.33)); const w=new THREE.Mesh(new THREE.CircleGeometry(.6,3),m); w.material=mat({color:0x5a4a7a,side:THREE.DoubleSide}); w.position.set(s*.55,0,0); w.rotation.x=-Math.PI/2; g.add(w); g.userData["w"+(s>0?1:0)]=w; const e=new THREE.Mesh(new THREE.ConeGeometry(.1,.25,4),m); e.position.set(s*.2,.4,0); g.add(e); }); return g; }
function cvSpawnCritters(){ CV.fairies.forEach(f=>scene.remove(f.m)); CV.bats.forEach(b=>scene.remove(b.m)); CV.fairies=[]; CV.bats=[];
  CV_FAIRY.forEach((h,i)=>{ const m=cvFairyMesh(); m.position.set(CVX+h.x,1.4,CVZ+h.z); scene.add(m); CV.fairies.push({m,hx:CVX+h.x,hz:CVZ+h.z,fol:false,i,x:CVX+h.x,z:CVZ+h.z,ph:i*2}); });
  for(let i=0;i<4;i++){ const m=cvBatMesh(); const a=i*1.57; const x=CVX+Math.cos(a)*8, z=CVZ-22+Math.sin(a)*8; m.position.set(x,2.2,z); scene.add(m); CV.bats.push({m,x,z,tx:x,tz:z,t:0,ph:i}); } }
function cvMyFairies(){ return CV.fairies.filter(f=>f.fol).length; }
/* ---------- 손잡기 ---------- */
function cvLinkIds(){ return Object.keys(CV.links); }
function cvGroup(){ const adj={}; const me=G.id; adj[me]=cvLinkIds().filter(id=>PEERS[id]&&CV.peer[id]&&cvIn(PEERS[id].x,PEERS[id].z));
  for(const id in CV.peer){ const p=CV.peer[id]; if(!PEERS[id]||performance.now()-p.t>5000) continue; adj[id]=(p.l||[]).filter(x=>x===me||(PEERS[x]&&CV.peer[x])); }
  const mutual=(a,b)=>(adj[a]||[]).indexOf(b)>=0&&(adj[b]||[]).indexOf(a)>=0; const seen={[me]:1}, q=[me]; while(q.length){ const a=q.shift(); for(const b of (adj[a]||[])){ if(!seen[b]&&mutual(a,b)){ seen[b]=1; q.push(b); } } } return Object.keys(seen); }
function cvCalcLight(){ const g=cvGroup(); CV.grp=g; let L=0; g.forEach(id=>{ L+=1+(id===G.id?cvMyFairies():Math.min(3,(CV.peer[id]&&CV.peer[id].f)|0)); }); CV.light=L; return L; }
function cvHB(){ try{ net.send({t:"hh",l:cvLinkIds(),f:cvMyFairies(),c:CV.on?1:0}); }catch(e){} }
NETR.hh=(o,d)=>{ if(!d.c){ delete CV.peer[o.id]; if(CV.links[o.id]){ delete CV.links[o.id]; } return; } CV.peer[o.id]={l:Array.isArray(d.l)?d.l.slice(0,2).map(String):[],f:clamp(d.f|0,0,3),t:performance.now()}; CV.name[o.id]=o.name;
  if(CV.links[o.id]&&CV.peer[o.id].l.indexOf(G.id)<0&&!CV.req[o.id]){ delete CV.links[o.id]; } };
NETR.hhq=(o,d)=>{ if(d.to!==G.id||!CV.on) return; CV.inq[o.id]=performance.now(); if(CV.req[o.id]){ cvLink(o.id); try{ net.send({t:"hha",to:o.id}); }catch(e){} return; } toast(`🤝 ${o.name} 님이 손을 내밀었어요`,"「손 잡아 주기」를 누르면 함께 걸어요",2.4); tone(660,.08,"sine"); tone(880,.1,"sine",.08); };
NETR.hha=(o,d)=>{ if(d.to!==G.id||!CV.on) return; if(CV.req[o.id]) cvLink(o.id); };
function cvLink(id){ if(CV.links[id]) return; if(cvLinkIds().length>=2){ toast("손이 두 개뿐이에요!","먼저 한 손을 놓아요",1.6); return; } CV.links[id]=performance.now(); delete CV.req[id]; delete CV.inq[id]; G.cvPal=G.cvPal||{}; if(!G.cvPal[id]){ G.cvPal[id]=1; saveGame(); }
  const o=PEERS[id]; toast(`🤝 ${o?o.name:"친구"} 님과 손을 잡았어요!`,"불빛이 커져요",1.8); jingle([523,659,784,1046]); if(o) fxSpark((P.x+o.x)/2,1.6,(P.z+o.z)/2,0xffe08a,16); CV.hbT=0; }
function cvUnlink(id){ if(!CV.links[id]) return; delete CV.links[id]; CV.hbT=0; const o=PEERS[id]; toast(`👋 ${o?o.name:"친구"} 님의 손을 놓았어요`,null,1.4); tone(440,.1,"triangle"); }
function cvAsk(id){ if(CV.inq[id]&&performance.now()-CV.inq[id]<12000){ CV.req[id]=performance.now(); cvLink(id); try{ net.send({t:"hha",to:id}); }catch(e){} return; } CV.req[id]=performance.now(); try{ net.send({t:"hhq",to:id}); }catch(e){} const o=PEERS[id]; toast(`🤝 ${o?o.name:"친구"} 님에게 손을 내밀었어요`,"상대가 잡아 주면 이어져요",1.6); tone(660,.08,"sine"); }
function cvNearPeer(){ let best=null, bd=4.2; for(const id in PEERS){ const o=PEERS[id]; if(o.dead||!cvIn(o.x,o.z)||CV.links[id]) continue; if(!CV.peer[id]) continue; const d=Math.hypot(o.x-P.x,o.z-P.z); if(d<bd){ bd=d; best=id; } } return best; }
/* ---------- 들어가기 · 나가기 ---------- */
function cvEnter(){ if(CV.on||P.dead) return; if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  closeLayer(); try{ if(typeof glAway==="function"&&glAway()){ if(typeof DG!=="undefined"&&DG.on) dgExit(true); if(typeof HM!=="undefined"&&HM.on) hmExit(); if(typeof PG!=="undefined"&&PG.on) pgExit(true,true); if(typeof TW!=="undefined"&&TW.on) twExit(true,true); if(typeof LV!=="undefined"&&LV.on) lvExit(true,true); if(typeof AR!=="undefined"&&AR.on) arExit(true,true); if(typeof OK!=="undefined"&&OK.on) okExit(true,true); if(typeof HS!=="undefined"&&HS.on) hsExit(true,true); if(typeof HY!=="undefined"&&HY.on) hyExit(true,true); if(typeof CH!=="undefined"&&CH.on) chExit(true,true); } }catch(e){} try{ if(P.ride) rdSet(false); }catch(e){}
  cvBuild(); CV.on=true; CV.links={}; CV.req={}; CV.inq={}; CV.lit=false; CV.light=1; CV.parts.forEach(o=>o.visible=true); cvSpawnCritters(); if(CV.fire) CV.fire.visible=false; CV.doorY=0;
  P.x=CVX; P.z=CVZ+46; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul||0,2); P.guide=null; $("guide").hidden=true; CV.cd=2.5; CV.lastOk={x:P.x,z:P.z}; G.cvIn=(G.cvIn||0)+1; saveGame(); cvHB();
  try{ lvBanner("프로메테우스의 불씨","🕯️ 별빛 동굴","캄캄해요! 🤝 손을 잡거나 ✨ 요정을 찾으면 불빛이 커져요","#ffd27a"); }catch(e){ toast("🕯️ 별빛 동굴"); } jingle([330,392,523,659]); }
function cvExit(silent,noTp){ if(!CV.on) return; CV.on=false; CV.links={}; cvHB(); CV.parts.forEach(o=>o.visible=false); CV.fairies.forEach(f=>scene.remove(f.m)); CV.bats.forEach(b=>scene.remove(b.m)); CV.fairies=[]; CV.bats=[]; CV.lines.forEach(l=>scene.remove(l)); CV.lines=[]; if(CV.lbl) CV.lbl.style.display="none"; cvDark(false);
  if(!noTp){ const c=REGIONS[Math.max(0,G.realm)*3]; P.x=c.x+4; P.z=c.z+4; P.y=0; P.vy=0; } if(!silent) toast("수도로 돌아왔어요",null,1.6); }
/* ---------- 불씨 켜기 ---------- */
function cvLight(){ if(!CV.on||CV.lit) return; if(CV.light<4){ toast("🔥 불빛이 4가 되어야 해요",null,1.6); return; } const ids=CV.grp.filter(id=>id!==G.id); try{ net.send({t:"cvw",ids}); }catch(e){} cvReward(ids.length+1,ids,true); }
NETR.cvw=(o,d)=>{ if(!CV.on||CV.lit) return; const ids=Array.isArray(d.ids)?d.ids:[]; if(ids.indexOf(G.id)<0) return; if(!CV.altar||Math.hypot(P.x-CV.altar.x,P.z-CV.altar.z)>22) return; cvReward(ids.length+1,ids.filter(x=>x!==G.id).concat([o.id]),false); };
function cvReward(people,others,me){ CV.lit=true; if(CV.fire) CV.fire.visible=true; const d=kday(); const first=G.cvDay!==d; G.cvDay=d; const L=G.lv; const emb=(first?3:1)+(people-1)*(first?2:1); const gold=Math.round((first?300+L*20:100+L*8)*(1+(people-1)*.25)); const xp=Math.round(xpNeed(L)*(first?.06:.02));
  G.cvEmb=(G.cvEmb||0)+emb; G.cvLit=(G.cvLit||0)+1; G.gold+=gold; gainXp(xp); const got=[`🔥 불씨 조각 +${emb}`,`금화 +${fmt(gold)}`,`경험치 +${fmt(xp)}`];
  const spr=others.some(id=>PEERS[id]&&(PEERS[id].rank|0)===0)&&(G.rank|0)>0; if(spr&&G.cvSprDay!==d){ G.cvSprDay=d; G.mtStar=(G.mtStar||0)+1; got.push("🧭 길잡이 별 +1 (새싹과 함께!)"); }
  saveGame(); const A=CV.altar; for(let q=0;q<12;q++) setTimeout(()=>{ fxSpark(A.x+rnd(-2,2),4+rnd(0,2),A.z+rnd(-2,2),[0xff8a20,0xffe060,0xffffff][q%3],10); },q*80); fxRing(A.x,A.z,0xffa040,12,.9); P.shake=Math.max(P.shake||0,.4);
  try{ lvBanner("🔥 불씨가 켜졌어요!",people>1?`${people}명이 손잡고 해냈어요!`:"동굴이 환해졌어요",got.join(" · "),"#ffa040"); }catch(e){ toast("🔥 불씨가 켜졌어요!",got.join(" · "),3); } jingle([392,523,659,784,1046,1318]); buzz([40,30,40]); }
/* ---------- 매 프레임 ---------- */
function cvTick(dt){ if(!started) return; if(!CV.on){ return; } if(!cvIn(P.x,P.z)){ cvExit(true,true); return; } CV.cd=Math.max(0,CV.cd-dt); const tn=performance.now();
  // 친구 기록 정리 · 나간 사람 손 놓기
  for(const id in CV.peer){ if(!PEERS[id]||tn-CV.peer[id].t>6000) delete CV.peer[id]; } CV.far=CV.far||{}; for(const id of cvLinkIds()){ const o=PEERS[id]; const far=o&&Math.hypot((o.tx??o.x)-P.x,(o.tz??o.z)-P.z)>14; CV.far[id]=far?(CV.far[id]||0)+dt:0; if(!o||!CV.peer[id]||!cvIn(o.tx??o.x,o.tz??o.z)||CV.far[id]>2.5) cvUnlink(id); }
  for(const id in CV.req){ if(tn-CV.req[id]>12000) delete CV.req[id]; }
  CV.hbT-=dt; if(CV.hbT<=0){ CV.hbT=1.5; cvHB(); }
  const L0=CV.light; cvCalcLight(); if(CV.light!==L0){ if(CV.light>L0){ floatDmg(P.x,3.6,P.z,`🕯️ 불빛 ${CV.light}`,"gain"); tone(880+CV.light*80,.1,"sine"); } if(CV.light>=3&&L0<3) toast("🌉 빛 다리가 나타났어요!",null,1.6); if(CV.light>=4&&L0<4) toast("🚪 룬 돌문이 열려요!","안쪽 🔥 불씨 제단으로!",2); }
  // 끌어당기기 (손잡은 사람에게)
  for(const id of cvLinkIds()){ const o=PEERS[id]; if(!o) continue; const dx=o.x-P.x, dz=o.z-P.z, d=Math.hypot(dx,dz); if(d>3.2&&!P.dead){ const sp=Math.min(9,(d-3.2)*3)*dt; const nx=P.x+dx/d*sp, nz=P.z+dz/d*sp; if(cvWalk(nx,nz)){ P.x=nx; P.z=nz; } } }
  // 빛줄
  const pairs=[]; for(const id of cvLinkIds()){ if(PEERS[id]) pairs.push([P,PEERS[id]]); } for(const a in CV.peer){ for(const b of CV.peer[a].l){ if(b===G.id||a>b) continue; if(CV.peer[b]&&CV.peer[b].l.indexOf(a)>=0&&PEERS[a]&&PEERS[b]) pairs.push([PEERS[a],PEERS[b]]); } }
  while(CV.lines.length<pairs.length){ const m=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1,6,1,true),new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})); m.userData.noOutline=true; m.rotation.order="YXZ"; scene.add(m); CV.lines.push(m); }
  CV.lines.forEach((m,i)=>{ const p=pairs[i]; if(!p){ m.visible=false; return; } m.visible=true; const ax=p[0].x, az=p[0].z, bx=p[1].x, bz=p[1].z; const d=Math.hypot(bx-ax,bz-az)||.01; m.position.set((ax+bx)/2,1.25+Math.sin(tn/200+i)*.05,(az+bz)/2); m.scale.set(1+Math.sin(tn/120)*.3,d,1+Math.sin(tn/120)*.3); m.rotation.set(Math.PI/2,Math.atan2(bx-ax,bz-az),0); });
  // 요정
  let fi=0; CV.fairies.forEach(f=>{ if(!f.fol&&!P.dead&&Math.hypot(P.x-f.x,P.z-f.z)<1.8){ f.fol=true; G.cvFairy=(G.cvFairy||0)+1; toast("✨ 별빛 요정이 따라와요!",`불빛 +1`,1.6); jingle([988,1175,1568]); fxSpark(f.x,1.4,f.z,0xfff6c8,14); CV.hbT=0; }
    let tx,tz,ty; if(f.fol){ const a=P.rot+Math.PI+(fi-1)*.7; tx=P.x+Math.sin(a)*1.6; tz=P.z+Math.cos(a)*1.6; ty=2+Math.sin(tn/300+f.ph)*.3; fi++; } else { tx=f.hx+Math.sin(tn/900+f.ph)*1.2; tz=f.hz+Math.cos(tn/1100+f.ph)*1.2; ty=1.3+Math.sin(tn/400+f.ph)*.3; }
    const k=Math.min(1,dt*(f.fol?6:2)); f.x+=(tx-f.x)*k; f.z+=(tz-f.z)*k; f.m.position.set(f.x,ty,f.z); const fl=Math.sin(tn/60+f.ph)*.9; if(f.m.userData.w0) f.m.userData.w0.rotation.y=fl; if(f.m.userData.w1) f.m.userData.w1.rotation.y=-fl; });
  // 박쥐 (방 B)
  CV.bats.forEach(b=>{ const dP=Math.hypot(P.x-b.x,P.z-b.z); b.t-=dt; const bright=CV.light>=3; let sp=2.4;
    if(bright&&dP<9){ const a=Math.atan2(b.z-P.z,b.x-P.x); b.tx=b.x+Math.cos(a)*6; b.tz=b.z+Math.sin(a)*6; sp=6; }
    else if(!bright&&dP<10&&cvMyFairies()>0){ b.tx=P.x; b.tz=P.z; sp=3.6; }
    else if(b.t<=0){ b.t=rnd(1.5,3); const a=rnd(0,6.283), d=rnd(2,12); b.tx=CVX+Math.cos(a)*d; b.tz=CVZ-22+Math.sin(a)*d; }
    const dx=b.tx-b.x, dz=b.tz-b.z, d=Math.hypot(dx,dz); if(d>.2){ const s=Math.min(d,sp*dt); const nx=b.x+dx/d*s, nz=b.z+dz/d*s; if(Math.hypot(nx-CVX,nz-(CVZ-22))<14.5){ b.x=nx; b.z=nz; } else b.t=0; }
    b.m.position.set(b.x,2.2+Math.sin(tn/150+b.ph)*.3,b.z); b.m.rotation.y=Math.atan2(dx,dz); const fl=Math.sin(tn/45+b.ph)*.7; if(b.m.userData.w0) b.m.userData.w0.rotation.z=fl; if(b.m.userData.w1) b.m.userData.w1.rotation.z=-fl;
    if(!bright&&dP<1.5&&cvMyFairies()>0&&!b.cool){ b.cool=1; setTimeout(()=>{ b.cool=0; },2500); const f=CV.fairies.filter(q=>q.fol).pop(); if(f){ f.fol=false; CV.hbT=0; toast("🦇 박쥐가 요정을 놀래켰어요!","요정이 원래 자리로 날아갔어요 — 불빛 3이면 박쥐가 도망가요",2.2); tone(300,.15,"sawtooth",0,.07); fxSpark(P.x,2,P.z,0x8a6aaa,10); } } });
  // 다리 · 낭떠러지
  if(CV.bridge) CV.bridge.visible=CV.light>=3; if(CV.ghost) CV.ghost.visible=CV.light<3;
  if(cvChasm(P.x,P.z)&&CV.light<3&&P.y<.5&&!P.dead){ P.x=CVX; P.z=CVZ+10; P.y=0; P.vy=0; P.shake=Math.max(P.shake||0,.5); toast("😵 으악, 미끄러졌어요!","🕯️ 불빛 3이 되면 빛 다리가 보여요 (손잡기 · 요정)",2.2); tone(200,.3,"sawtooth",0,.06); }
  // 문
  const open=CV.light>=4; CV.doorY+=((open?-6.3:0)-CV.doorY)*Math.min(1,dt*2); if(CV.door){ CV.door.position.y=CV.doorY; if(CV.door.userData.rn) CV.door.userData.rn.rotation.z+=dt*(open?3:.5); }
  // 불꽃
  if(CV.fire&&CV.fire.visible){ CV.fire.scale.set(1+Math.sin(tn/90)*.1,1+Math.sin(tn/70)*.15,1+Math.cos(tn/90)*.1); if(Math.random()<dt*10) fxSpark(CV.altar.x+rnd(-.5,.5),4.2,CV.altar.z+rnd(-.5,.5),0xffa040,2); }
  // 이름표 도움말
  if(CV.lbl){ const lz=P.z-CVZ; let h=null, x=0, z=0; if(CV.light<3&&lz>4&&lz<16){ h=`🌉 <b>불빛 ${CV.light}/3</b> · 다리가 안 보여요`; x=CVX; z=CVZ+7; } else if(CV.light<4&&lz<-28&&lz>-40){ h=`🚪 <b>불빛 ${CV.light}/4</b> · 룬 돌문`; x=CVX; z=CVZ-39; } else if(CV.altar&&Math.hypot(P.x-CV.altar.x,P.z-CV.altar.z)<14){ h=CV.lit?"🔥 <b>불씨가 타올라요</b>":"🔥 <b>불씨 제단</b>"; x=CV.altar.x; z=CV.altar.z; }
    if(h&&!layerOpen){ placeLabel(CV.lbl,x,h.indexOf("제단")>0||h.indexOf("타올라")>0?5:4,z,h); } else CV.lbl.style.display="none"; }
  const ex=CV.exitArch; if(ex&&CV.cd<=0&&Math.hypot(P.x-ex.x,P.z-ex.z)<2.2){ cvExit(); return; }
  const others=CV.grp.length-1; $("region").innerHTML=`🕯️ 별빛 동굴 <b>불빛 ${CV.light}</b>${others>0?` · 🤝 ${others}명과 손잡음`:""}${cvMyFairies()?` · ✨ 요정 ${cvMyFairies()}`:""}${CV.lit?" · 🔥 불씨 켬!":""}`; }
XTICK.push(cvTick);
function cvSky(dt){ SKY.tTop.setHex(0x05040c); SKY.tBot.setHex(0x0a0818); const k=Math.min(1,dt*2); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.setHex(0x06050e);
  const cd=camera.position.distanceTo(_cvW.set(P.x,1,P.z)); const R=3+CV.light*3.2; CV.fogR=(CV.fogR||R)+(R-(CV.fogR||R))*Math.min(1,dt*2); scene.fog.near=cd+CV.fogR*.8; scene.fog.far=cd+CV.fogR*3+20; cvDark(true);
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+10,40,P.z+10); sun.target.position.set(P.x,0,P.z); sun.intensity=.55; sun.color.setHex(0xffd8a8); hemi.intensity=.35; fill.intensity=.15; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=.95; }
const _cvV=new THREE.Vector3(), _cvW=new THREE.Vector3();
/* 어둠 가리개: 화면 위 동그란 구멍(내 불빛) — 화면 기준이라 카메라 각도와 상관없이 둥글게 밝음. DOM 하나라 그리기 0 */
function cvDark(on){ let d=CV.dk; if(!d){ if(!on) return; d=CV.dk=document.createElement("div"); d.id="cvDark"; d.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:0;transition:opacity .6s"; const lb=$("labels"); lb.parentNode.insertBefore(d,lb); }
  if(!on){ d.style.opacity="0"; d.style.display="none"; return; } d.style.display=""; d.style.opacity="1";
  _cvV.set(P.x,hAt(P.x,P.z)+1.2,P.z).project(camera); const sx=(_cvV.x+1)/2*innerWidth, sy=(1-_cvV.y)/2*innerHeight; const R=CV.fogR||8; _cvW.set(P.x+R,hAt(P.x,P.z)+1.2,P.z).project(camera); const px=Math.max(40,Math.hypot((_cvW.x-_cvV.x)/2*innerWidth,(_cvW.y-_cvV.y)/2*innerHeight));
  d.style.background=`radial-gradient(circle at ${sx.toFixed(0)}px ${sy.toFixed(0)}px, rgba(4,3,12,0) ${(px*.55).toFixed(0)}px, rgba(4,3,12,.55) ${(px*.85).toFixed(0)}px, rgba(4,3,12,.96) ${(px*1.15).toFixed(0)}px)`; }
function cvMinimap(){ const ctx=mctx, S0=fitCanvas(mm); const s=S0*.94/120; const X=x=>S0/2+(x-CVX)*s, Z=z=>S0/2+(z-CVZ+2)*s;
  ctx.fillStyle="#06050e"; ctx.fillRect(0,0,S0,S0); const c="#2a2838"; dot(ctx,X(CVX),Z(CVZ+37),17.5*s,c); dot(ctx,X(CVX),Z(CVZ-22),15.5*s,c); dot(ctx,X(CVX),Z(CVZ-52),10.5*s,c); ctx.fillStyle=c; ctx.fillRect(X(CVX-3.4),Z(CVZ-9),6.8*s,31*s); ctx.fillRect(X(CVX-2.8),Z(CVZ-49),5.6*s,14*s);
  ctx.fillStyle=CV.light>=3?"#ffe9a8":"#000"; ctx.fillRect(X(CVX-3.4),Z(CVZ-4.5),6.8*s,11*s); ctx.fillStyle=CV.light>=4?"#2a2838":"#8a7a9a"; ctx.fillRect(X(CVX-3.2),Z(CVZ-40.2),6.4*s,1.4*s);
  if(CV.altar) dot(ctx,X(CV.altar.x),Z(CV.altar.z),S0/24,CV.lit?"#ffa040":"#8a8070","#fff",1.5); CV.fairies.forEach(f=>{ if(!f.fol) dot(ctx,X(f.x),Z(f.z),S0/45,"#fff6c8"); });
  if(CV.exitArch) dot(ctx,X(CV.exitArch.x),Z(CV.exitArch.z),S0/26,"#ffd27a","#fff",2);
  for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&cvIn(o.x,o.z)) dot(ctx,X(o.x),Z(o.z),S0/36,CV.links[id]?"#ffe08a":"#1e8e3e","#fff",1.5); }
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const q=S0/20; ctx.moveTo(0,-q); ctx.lineTo(q*.7,q*.7); ctx.lineTo(0,q*.35); ctx.lineTo(-q*.7,q*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,"🕯️ 별빛 동굴",S0/2,S0*.07,Math.round(S0/12),"#fff"); }
XZONE.push({on:()=>CV.on,clamp:()=>{ if(!cvIn(P.x,P.z)){ cvExit(true,true); return false; } if(cvWalk(P.x,P.z)){ CV.lastOk={x:P.x,z:P.z}; return true; } const o=CV.lastOk||{x:CVX,z:CVZ+49}; if(cvWalk(P.x,o.z)){ P.z=o.z; } else if(cvWalk(o.x,P.z)){ P.x=o.x; } else { P.x=o.x; P.z=o.z; } CV.lastOk={x:P.x,z:P.z}; return true; },sky:cvSky,mm:cvMinimap});
/* ---------- 상황 버튼 · 창 · 메뉴 · 칭호 · 장식 ---------- */
CTX_EXTRA.unshift(()=>{ if(!CV.on) return null;
  if(CV.altar&&!CV.lit&&Math.hypot(P.x-CV.altar.x,P.z-CV.altar.z)<5) return {t:CV.light>=4?"🔥 불씨 켜기!":`🔥 불빛 ${CV.light}/4`,f:cvLight};
  const id=cvNearPeer(); if(id&&cvLinkIds().length<2){ const o=PEERS[id]; const inq=CV.inq[id]&&performance.now()-CV.inq[id]<12000; if(inq) return {t:`🤝 ${o.name} 손 잡아 주기`,f:()=>cvAsk(id)}; if(!CV.req[id]) return {t:`🤝 ${o.name}와 손잡기`,f:()=>cvAsk(id)}; return {t:"🤝 기다리는 중…",f:()=>{}}; }
  const ls=cvLinkIds(); if(ls.length&&!P.moving) return {t:"👋 손 놓기",f:()=>ls.forEach(cvUnlink)}; return null; });
const CV_DECO=DECO.length;
DECO.push({n:"프로메테우스의 불씨 화로",ic:"🔥",t:3,sc:14,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); const st=mat({color:0x8a8070}); g.add(cyl(.7,.9,.5,st,0,.25,0,10)); g.add(cyl(.35,.5,1,st,0,1,0,8)); g.add(cyl(.8,.45,.4,mat({color:0x5a4a3a}),0,1.7,0,10)); const f=new THREE.Mesh(new THREE.ConeGeometry(.5,1.3,8),glowMat(0xff7a20,.85)); f.position.y=2.4; g.add(f); const f2=new THREE.Mesh(new THREE.ConeGeometry(.28,.9,8),glowMat(0xffe060,.95)); f2.position.y=2.3; g.add(f2); return g; }});
const CV_SHOP=[{n:"물약 3개",ic:"🧪",c:2,f:()=>{ G.pots+=3; }},{n:"룬 가루 2개",ic:"✨",c:4,f:()=>{ G.rune=(G.rune||0)+2; }},{n:"무기 뽑기권 1장",ic:"🎟",c:8,f:()=>{ try{ gz().tk++; }catch(e){} }},{n:"신전 장식 «프로메테우스의 불씨 화로»",ic:"🔥",c:12,f:()=>{ hmAdd(CV_DECO); }}];
function showCave(){ const here=Object.values(PEERS).filter(o=>cvIn(o.x,o.z)).length+(CV.on?1:0); const pals=Object.keys(G.cvPal||{}).length;
  card(`<h2>🕯️ 별빛 동굴 — 프로메테우스의 불씨</h2><p>동굴 안은 <b>캄캄</b>해요. 처음 만난 사람에게 다가가 <b>🤝 손잡기</b>를 누르고, 상대도 눌러 주면 빛줄로 이어져서 함께 걸어요. 손잡은 사람이 많을수록 🕯️ <b>불빛</b>이 커져요! 구석에 숨은 <b>✨ 별빛 요정</b>도 불빛 +1.</p>
   <div class="idlegrid"><div><b>🌉 3</b><span>불빛 3: 빛 다리 · 박쥐가 도망</span></div><div><b>🚪 4</b><span>불빛 4: 룬 돌문 열림</span></div><div><b>👥 ${here}</b><span>지금 동굴에 있는 사람</span></div></div>
   <div class="idlegrid"><div><b>🔥 ${G.cvEmb||0}</b><span>내 불씨 조각</span></div><div><b>${G.cvLit||0}</b><span>불씨를 켠 수</span></div><div><b>🤝 ${pals}</b><span>손잡아 본 사람</span></div></div>
   ${CV.on?"":`<button class="go" id="cvGo" style="align-self:center">🕯️ 별빛 동굴로 가기</button>`}
   <h3>🛒 불씨 가게</h3>${CV_SHOP.map((it,i)=>`<div class="row"><div class="ic">${it.ic}</div><div class="t"><div>${it.n}</div><span>🔥 ${it.c}개</span></div><button class="buy" data-cv="${i}" ${(G.cvEmb||0)<it.c?"disabled":""}>사기</button></div>`).join("")}
   <p style="font-size:12px">🔥 하루 처음 불씨를 켜면 조각 +3 (손잡은 사람마다 +2) · 그 뒤로는 +1 (+1씩) · 🌱 새싹과 손잡고 켜면 🧭 길잡이 별 +1 · 말 대신 버튼만 써요 · 손은 두 개 — 줄줄이 사슬도 돼요!</p>`);
  const g=$("cvGo"); if(g) g.onclick=cvEnter;
  layers.querySelectorAll("[data-cv]").forEach(b=>b.onclick=()=>{ const it=CV_SHOP[+b.dataset.cv]; if((G.cvEmb||0)<it.c) return; G.cvEmb-=it.c; it.f(); saveGame(); jingle([659,880]); toast(`🔥 ${it.ic} ${it.n}`,`불씨 조각 −${it.c}`,1.6); showCave(); }); }
MENU_X.push({ic:"🕯️",n:"별빛 동굴",id:"cvBtn",sub:()=>{ const n=Object.values(PEERS).filter(o=>cvIn(o.x,o.z)).length; return `손잡고 걸으면 밝아져요${n?` · 지금 ${n}명`:""} · 🔥 ${G.cvEmb||0}`; },f:showCave});
TITLES.push({id:"cv1",n:"불씨를 켠 자",t:1,h:"🔥 별빛 동굴 불씨 켜기 1번",g:()=>[G.cvLit||0,1]},{id:"cv2",n:"손잡은 여행자",t:2,h:"🤝 동굴에서 서로 다른 5명과 손잡기",g:()=>[Object.keys(G.cvPal||{}).length,5]},{id:"cv3",n:"프로메테우스의 친구",t:3,h:"🔥 불씨 켜기 30번",g:()=>[G.cvLit||0,30]});
</script>
