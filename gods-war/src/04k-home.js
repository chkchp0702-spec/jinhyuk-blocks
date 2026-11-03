<script>
/* ================= v22-2: 🏡 나만의 신전 꾸미기 + 친구 축복 도장 (IDEAS G11/3-5) =================
   하늘에 떠 있는 내 신전 섬(지도 밖 x≈-700, 사람마다 다른 자리). 장식 10칸을 꾸미면 "아름다움" 점수.
   제단은 게임을 꺼 둔 동안에도 봉헌물(금화·물약)을 쌓음(최대 16시간).
   신전 모양은 중계 서버에 보관(retained) …/h/<id> → 친구가 놀러 올 수 있음.
   친구가 제단에 축복 도장을 찍으면 …/b/<주인>/<친구> 에 보관 → 주인이 다음에 켰을 때 "1시간 경험치 +20%" + 방명록. */
const HMX=-700;
const _hAt1=hAt; hAt=function(x,z){ return x<HMX+150?0:_hAt1(x,z); };
function hmIn(x){ return x<HMX+150; }
function hmHash(s){ let h=7; for(const c of String(s)) h=(h*31+c.charCodeAt(0))>>>0; return h; }
function hmZ(id){ return ((hmHash(id)%41)-20)*90; }
const HM_SLOTS=[[-11,-7],[11,-7],[-13.5,-1],[13.5,-1],[-12,5],[12,5],[-7,10.5],[7,10.5],[-5.5,1.5],[5.5,1.5]];
const HM_ALTAR=[0,-4.5], HM_R=17.2;
const STAMPS=[["🌟","반짝 별"],["🌸","꽃 한 송이"],["⚡","힘내라 번개"],["🍀","행운 클로버"]];
const HMAT={};
function hmMat(k,o){ return HMAT[k]||(HMAT[k]=mat(o)); }
function hmFlame(g,y,c,s){ const f=new THREE.Mesh(new THREE.ConeGeometry(.45*(s||1),1.3*(s||1),8),glowMat(c||0xff9a3d,.85)); f.position.y=y; f.userData.flame=1; f.userData.noOutline=true; g.add(f); const f2=sph(.3*(s||1),glowMat(0xfff0a0,.9),0,y-.25,0); f2.userData.noOutline=true; g.add(f2); return f; }
function hmHex(name,sc,fallback){ const o=typeof hexModel==="function"?hexModel(name,sc):null; if(o) return o; return fallback(); }
const RFLAG=["flag_yellow","flag_blue","flag_red","flag_green"];
const DECO=[
 {n:"꽃밭",ic:"🌷",t:0,sc:3,p:120,mk:r=>{ const g=new THREE.Group(); const d=new THREE.Mesh(new THREE.CircleGeometry(1.7,20),hmMat("leafd",{color:0x4f9a4a})); d.rotation.x=-Math.PI/2; d.position.y=.05; g.add(d); const cs=[0xff6a8a,0xffd84a,0xff9ad0,0xffffff,0xb08aff]; for(let k=0;k<14;k++){ const a=k*2.4, rr=.3+((k*37)%10)/10*1.2; g.add(sph(.22,hmMat("fl"+(k%5),{color:cs[k%5]}),Math.cos(a)*rr,.3,Math.sin(a)*rr)); } return g; }},
 {n:"불꽃 화로",ic:"🔥",t:0,sc:4,p:160,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.25,.4,1.1,M.stone,0,.55,0,10)); g.add(cyl(.9,.5,.5,M.stone,0,1.3,0,14)); hmFlame(g,2.1); return g; }},
 {n:"대리석 기둥",ic:"🏛",t:0,sc:4,p:160,mk:r=>{ const g=new THREE.Group(); g.add(box(1.4,.35,1.4,M.marble,0,.17,0)); g.add(cyl(.42,.48,4.2,M.marble,0,2.45,0,14)); g.add(box(1.3,.35,1.3,M.marble,0,4.7,0)); g.add(sph(.32,glowMat(new THREE.Color(REALMS[r].c1).getHex(),.7),0,5.2,0)); return g; }},
 {n:"깃발",ic:"🚩",t:0,sc:2,p:80,mk:r=>hmHex(RFLAG[r],5,()=>{ const g=new THREE.Group(); g.add(cyl(.08,.08,4,M.wood,0,2,0)); g.add(box(1.4,.9,.05,hmMat("flag"+r,{color:new THREE.Color(REALMS[r].a).getHex()}),.7,3.4,0)); return g; })},
 {n:"천막",ic:"⛺",t:0,sc:3,p:100,mk:r=>hmHex("tent",4,()=>{ const g=new THREE.Group(); const c=new THREE.Mesh(new THREE.ConeGeometry(1.6,2.2,4),M.red); c.position.y=1.1; g.add(c); return g; })},
 {n:"무기 걸이",ic:"⚔",t:0,sc:3,p:100,mk:r=>hmHex("weaponrack",4,()=>{ const g=new THREE.Group(); g.add(box(2,1.6,.3,M.wood,0,.8,0)); return g; })},
 {n:"룬 돌",ic:"🪨",t:1,sc:6,p:300,mk:r=>{ const g=new THREE.Group(); const s=box(1.2,2.6,.7,M.rock,0,1.3,0); s.rotation.y=.2; g.add(s); const p=new THREE.Mesh(new THREE.PlaneGeometry(.7,1.6),glowMat(new THREE.Color(REALMS[r].c1).getHex(),.75)); p.position.set(0,1.4,.37); p.rotation.y=.2; p.userData.pulse=1; p.userData.noOutline=true; g.add(p); return g; }},
 {n:"연꽃 등불",ic:"🪷",t:1,sc:6,p:300,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.07,.09,2.6,M.tgold,0,1.3,0,8)); for(let k=0;k<6;k++){ const l=sph(.32,M.lotus,Math.cos(k)*.38,2.7,Math.sin(k)*.38); l.scale.y*=.55; g.add(l); } const s=sph(.3,glowMat(0xffe0a0,.9),0,2.85,0); s.userData.pulse=1; g.add(s); return g; }},
 {n:"황금 나무",ic:"🌳",t:1,sc:7,p:380,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.25,.4,2.4,M.trunk,0,1.2,0,8)); [[0,3.1,0,1.3],[.8,2.7,.3,.9],[-.7,2.8,-.2,.95],[0,3.9,.2,.8]].forEach(a=>g.add(sph(a[3],M.gold,a[0],a[1],a[2]))); return g; }},
 {n:"작은 분수",ic:"⛲",t:1,sc:8,p:450,mk:r=>{ const g=new THREE.Group(); g.add(cyl(1.6,1.8,.5,M.marble,0,.25,0,20)); const w=new THREE.Mesh(new THREE.CircleGeometry(1.4,20),WATER); w.rotation.x=-Math.PI/2; w.position.y=.52; g.add(w); g.add(cyl(.18,.25,1.4,M.marble,0,1.1,0,8)); const s=sph(.25,glowMat(0xbfe8ff,.8),0,1.95,0); s.userData.pulse=1; g.add(s); return g; }},
 {n:"신수 동상",ic:"🗿",t:2,sc:12,p:0,mk:(r,pr)=>{ const g=new THREE.Group(); g.add(cyl(1,1.15,.9,M.marble,0,.45,0,16)); try{ const p=makePet(pr==null||pr<0?r:pr,12); p.traverse(o=>{ if(o.isMesh) o.material=M.marble; }); p.scale.multiplyScalar(1.9); p.position.y=.9; g.add(p); }catch(e){ g.add(sph(.8,M.marble,0,1.7,0)); } return g; }},
 {n:"무지개 아치",ic:"🌈",t:2,sc:12,p:0,mk:r=>{ const g=new THREE.Group(); [0xff5a5f,0xffa94a,0xffe14a,0x5fdc6a,0x4aa8ff,0xa070ff].forEach((c,k)=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(2.6-k*.17,.09,6,28,Math.PI),glowMat(c,.85)); t.userData.noOutline=true; g.add(t); }); return g; }},
 {n:"수정 탑",ic:"💎",t:2,sc:14,p:0,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.9,1.1,.5,M.stone,0,.25,0,6)); const c=new THREE.Mesh(new THREE.OctahedronGeometry(.9,0),new THREE.MeshStandardMaterial({color:new THREE.Color(REALMS[r].c1),emissive:new THREE.Color(REALMS[r].c1),emissiveIntensity:.6,metalness:.3,roughness:.15,transparent:true,opacity:.88})); c.scale.set(1,2.2,1); c.position.y=2.6; c.userData.spin=1; g.add(c); return g; }},
 {n:"천둥 구름",ic:"⛈",t:3,sc:18,p:0,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.12,.12,3.4,M.stone,0,1.7,0,6)); const cm=hmMat("cloudd",{color:0x8a8fa8,roughness:1}); [[0,0,1.1],[1,.1,.8],[-1,.05,.85],[.4,.45,.75],[-.4,.4,.7]].forEach(a=>g.add(sph(a[2],cm,a[0],4.2+a[1],0))); const b=new THREE.Mesh(new THREE.ConeGeometry(.18,1.6,4),glowMat(0xfff27a,.9)); b.position.y=3.1; b.rotation.z=.3; b.userData.blink=1; b.userData.noOutline=true; g.add(b); return g; }},
 {n:"세계수 묘목",ic:"🌲",t:3,sc:20,p:0,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.3,.5,3,M.trunk,0,1.5,0,8)); const lm=new THREE.MeshStandardMaterial({color:0x6fe0a0,emissive:0x2a8a5a,emissiveIntensity:.5,roughness:.6}); [[0,3.6,0,1.5],[1,3.1,.4,1],[-.9,3.2,-.3,1.05],[0,4.6,0,1]].forEach(a=>g.add(sph(a[3],lm,a[0],a[1],a[2]))); for(let k=0;k<5;k++){ const s=sph(.12,glowMat(0xd8ffe8,.9),Math.cos(k*1.3)*1.6,3+k*.35,Math.sin(k*1.3)*1.6); s.userData.pulse=1; g.add(s); } return g; }},
];
const HM={on:false,owner:null,data:null,g:null,deco:[],slotMk:[],lbl:null,altLbl:null,pubT:0,first:true,blessQ:[]};
const HOMES={};
function hmData(){ G.home=G.home||{own:{},d:Array(10).fill(-1),t:0,gb:[],seen:{}}; const h=G.home; if(!h.own) h.own={}; if(!h.d||h.d.length!==10) h.d=Array(10).fill(-1); if(!h.gb) h.gb=[]; if(!h.seen) h.seen={}; return h; }
function hmFree(id){ const h=hmData(); return (h.own[id]||0)-h.d.filter(x=>x===id).length; }
function hmBeauty(d){ d=d||hmData().d; let s=0; const kinds={}; d.forEach(id=>{ if(id>=0&&DECO[id]){ s+=DECO[id].sc; kinds[id]=1; } }); return s+Object.keys(kinds).length*2; }
function hmGift(tier,from){ const pool=DECO.map((D,i)=>({D,i})).filter(x=>!x.D.season&&!x.D.trophy&&x.D.t<=tier); const w=pool.map(x=>x.D.t===tier?3:1); let s=w.reduce((a,b)=>a+b,0)*Math.random(), pick=pool[0]; for(let k=0;k<pool.length;k++){ s-=w[k]; if(s<=0){ pick=pool[k]; break; } }
  return hmAdd(pick.i,from); }
function hmAdd(id,from){ const h=hmData(); h.own[id]=(h.own[id]||0)+1; saveGame(); const D=DECO[id]; setTimeout(()=>{ if(!layerOpen) toast(`🏡 신전 장식 «${D.ic} ${D.n}»`,(from?from+" ":"")+"얻었어요! 메뉴 → 나만의 신전",2.6); },from?0:400); tone(988,.08,"triangle"); return D.ic+" "+D.n; }
function hmOnKill(m){ if(m.war||m.dg) return; if(Math.random()<(m.boss?.15:.012)) hmGift(m.boss?2:1,m.n+"에게서"); }
function hmOffer(){ const h=hmData(); if(!h.t) return {gold:0,pots:0,h:0}; const hrs=Math.min(16,(Date.now()-h.t)/3600000); const rate=15+hmBeauty()*1.2+G.lv; return {gold:Math.floor(rate*hrs),pots:Math.min(2,Math.floor(hrs/6)),h:hrs}; }
function hmCollect(){ const h=hmData(); const o=hmOffer(); if(o.gold<1){ toast("봉헌물이 아직 없어요","시간이 지나면 쌓여요 (게임을 꺼 둬도!)",2); return; } G.gold+=o.gold; G.pots+=o.pots; h.t=Date.now(); saveGame(); jingle([659,784,1046,1318]); fxSpark(HMX+HM_ALTAR[0],2.5,hmZ(G.id)+HM_ALTAR[1],0xffd76a,40); fxRing(P.x,P.z,0xffd76a,6,.6); toast(`🏺 봉헌물 금화 +${fmt(o.gold)}${o.pots?` · ${RM().potion} +${o.pots}`:""}`,`${fmtDur(o.h*60)} 동안 쌓였어요`,2.6); hmRefresh(); }
function hmPub(){ try{ const h=hmData(); net.pushRet("h/"+G.id,{i:G.id,n:G.name,r:G.realm,d:h.d,sc:hmBeauty(),pr:G.pet,t:Date.now()}); }catch(e){} }
function hmMsg(d){ if(!d||!d.i||d.i===G.id||!Array.isArray(d.d)||!REALMS[d.r]) return; const o=HOMES[d.i]; if(o&&o.t>d.t) return; HOMES[d.i]=d; if(HM.on&&HM.owner===d.i){ HM.data=d; hmBuild(); } }
function hmBlessMsg(d){ if(!d||d.to!==G.id||!d.i||d.i===G.id) return; const h=hmData(); if((h.seen[d.i]||0)>=d.t) return; if(Date.now()-d.t>7*86400000) return; h.seen[d.i]=d.t;
  h.gb.unshift({n:d.n,r:d.r,m:d.m,t:d.t}); h.gb=h.gb.slice(0,20); const now=Date.now(); G.blessUntil=Math.min(now+3*3600000,Math.max(G.blessUntil||0,now)+3600000); saveGame(); HM.blessQ.push(d); }
function hmBlessTick(){ if(!HM.blessQ.length||layerOpen||!started||P.dead) return; const L=HM.blessQ.splice(0); const names=[...new Set(L.map(d=>d.n))];
  card(`<h2>🌟 축복이 도착했어요!</h2><p><b style="color:var(--gold)">${names.join(", ")}</b>${josa(names[names.length-1],"이","가")} 내 신전 제단에 축복 도장을 찍고 갔어요.</p><div class="diary">${L.map(d=>`<p>${(STAMPS[d.m]||STAMPS[0])[0]} ${d.n}: "${(STAMPS[d.m]||STAMPS[0])[1]}" 도장</p>`).join("")}</div><p>지금부터 <b style="color:#9dffb8">경험치 +20%</b> · 남은 시간 ${fmtDur((G.blessUntil-Date.now())/60000)}</p><button class="buy" id="blOk" style="align-self:center">고마워!</button>`); $("blOk").onclick=closeLayer; jingle([784,988,1175,1568]); buzz([30,30,60]); fxRiseDust&&fxRiseDust(0xffe9a8,24,1.4); }
/* ---------- 3D ---------- */
function hmClear(){ if(HM.g){ scene.remove(HM.g); HM.g=null; } HM.deco=[]; HM.slotMk=[]; }
function hmBuild(){ hmClear(); const d=HM.data; const r=d.r, cx=HMX, cz=hmZ(d.i), mine=d.i===G.id; const g=new THREE.Group(); g.position.set(cx,0,cz); HM.cx=cx; HM.cz=cz; HM.r=r; const R=REALMS[r];
  const top=cyl(HM_R+.8,HM_R+.3,1.2,hmMat("isl"+r,{color:new THREE.Color(R.ground).getHex(),roughness:1}),0,-.6,0,40); g.add(top);
  const rim=cyl(HM_R+.35,HM_R+.85,.7,hmMat("isl2"+r,{color:new THREE.Color(R.ground2).getHex(),roughness:1}),0,-.05,0,40); g.add(rim);
  const under=new THREE.Mesh(new THREE.ConeGeometry(HM_R+.4,15,14),hmMat("rockU",{color:0x7d6e62,roughness:1})); under.rotation.x=Math.PI; under.position.y=-8.6; g.add(under);
  for(let k=0;k<5;k++){ const a=k*1.25+.4, rr=HM_R+5+k%2*4; const s=sph(1+k%3*.5,hmMat("rockU",{}),Math.cos(a)*rr,-3-k%3*2.5,Math.sin(a)*rr); s.scale.y*=.6; s.userData.bob=k; g.add(s); }
  const cm=hmMat("cloudw",{color:0xffffff,roughness:1,transparent:true,opacity:.92}); for(let k=0;k<12;k++){ const a=k*.52, rr=HM_R+8+(k*7)%12; g.add(sph(2.5+(k%4),cm,Math.cos(a)*rr,-12-(k%3)*3,Math.sin(a)*rr)); }
  // 길 + 신전
  const path=new THREE.Mesh(new THREE.PlaneGeometry(3,18),hmMat("path",{color:0xe8dcc0,roughness:1})); path.rotation.x=-Math.PI/2; path.position.set(0,.03,3); g.add(path);
  const T=new THREE.Group(); T.position.set(0,0,-12.2); T.add(box(13,.9,7,M.marble,0,.45,0)); T.add(box(11,.5,1.6,M.marble,0,.25,4.2));
  for(let k=0;k<6;k++){ T.add(cyl(.42,.48,5,M.marble,-5+k*2,3.4,2.6,12)); T.add(cyl(.42,.48,5,M.marble,-5+k*2,3.4,-2.6,12)); }
  T.add(box(13,.7,7,M.marble,0,6.25,0)); const roofM=hmMat("roof"+r,{color:new THREE.Color(R.a).getHex(),roughness:.6}); const roof=new THREE.Mesh(new THREE.CylinderGeometry(0,4.2,2.4,4,1),roofM); roof.rotation.y=Math.PI/4; roof.scale.set(2.1,1,1.15); roof.position.y=7.8; T.add(roof);
  T.add(box(3,4.6,.3,hmMat("door",{color:0x3a2a20}),0,3.2,-2.4)); const em=sph(.6,glowMat(new THREE.Color(R.c1).getHex(),.85),0,7.2,3.6); em.userData.pulse=1; T.add(em); g.add(T);
  // 제단
  const A=new THREE.Group(); A.position.set(HM_ALTAR[0],0,HM_ALTAR[1]); A.add(cyl(1.5,1.8,.5,M.marble,0,.25,0,18)); A.add(cyl(.8,1,1.2,M.marble,0,1.1,0,14)); A.add(cyl(1.1,.9,.3,M.tgold,0,1.85,0,16)); const orb=sph(.55,glowMat(new THREE.Color(R.c1).getHex(),.9),0,2.7,0); orb.userData.pulse=1; A.add(orb); HM.orb=orb;
  HM.coins=new THREE.Group(); A.add(HM.coins); g.add(A);
  // 장식
  d.d.forEach((id,s)=>{ const [x,z]=HM_SLOTS[s]; if(id>=0&&DECO[id]){ let o=null; try{ o=DECO[id].mk(r,d.pr); }catch(e){ console.warn(e); } if(o){ o.position.set(x,0,z); o.rotation.y=Math.atan2(-x,-z)+Math.PI; g.add(o); HM.deco.push(o); } }
    else if(mine){ const m=new THREE.Mesh(new THREE.RingGeometry(.9,1.25,28),glowMat(0xffffff,.35)); m.rotation.x=-Math.PI/2; m.position.set(x,.08,z); m.userData.noOutline=true; g.add(m); HM.slotMk.push(m); } });
  scene.add(shadowify(g)); HM.g=g; if(!HM.lbl){ HM.lbl=makeLabel("boss"); HM.altLbl=makeLabel("ally"); } hmRefresh(); }
function hmRefresh(){ if(!HM.on||!HM.coins) return; const mine=HM.owner===G.id; while(HM.coins.children.length) HM.coins.remove(HM.coins.children[0]); if(mine){ const o=hmOffer(); const n=Math.min(14,Math.ceil(o.gold/40)); for(let k=0;k<n;k++){ const c=cyl(.22,.22,.08,M.gold,Math.cos(k*2.4)*(.3+k*.04),2.05+k*.03,Math.sin(k*2.4)*(.3+k*.04),10); HM.coins.add(c); } } }
function hmEnter(id){ if(DG.on){ toast("미궁에서 먼저 나와요"); return; } if(P.dead||P.trial) return; if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  let d; if(id===G.id){ const h=hmData(); if(!h.t){ h.t=Date.now(); saveGame(); } d={i:G.id,n:G.name,r:G.realm,d:h.d,pr:G.pet}; } else { d=HOMES[id]; if(!d){ toast("그 친구 신전을 아직 못 찾았어요"); return; } }
  closeLayer(); HM.on=true; HM.owner=id; HM.data=d; hmBuild(); P.x=HM.cx; P.z=HM.cz+13; P.y=0; P.vy=0; P.rot=Math.PI; P.guide=null; $("guide").hidden=true; P.invul=Math.max(P.invul,1);
  fxRing(P.x,P.z,0xffffff,6,.7); fxSpark(P.x,2,P.z,0xffffff,30); jingle([523,784,1046]);
  if(id===G.id){ const o=hmOffer(); toast("🏡 나만의 신전",`빈 칸(하얀 고리)에 가면 장식을 놓을 수 있어요${o.gold>0?` · 제단에 봉헌물 ${fmt(o.gold)}금화`:""}`,3); if(!hmData().pub){ hmData().pub=1; hmPub(); } }
  else toast(`🏡 ${d.n}의 신전`,`제단에 가서 🌟 축복 도장을 찍어 줘요`,3); }
function hmExit(){ if(!HM.on) return; HM.on=false; hmClear(); if(HM.lbl){ HM.lbl.style.display="none"; HM.altLbl.style.display="none"; } }
function hmClampP(){ if(!hmIn(P.x)){ hmExit(); return false; } const dx=P.x-HM.cx, dz=P.z-HM.cz, L=Math.hypot(dx,dz); if(L>HM_R-.8){ P.x=HM.cx+dx/L*(HM_R-.8); P.z=HM.cz+dz/L*(HM_R-.8); } if(P.z<HM.cz-8.6&&Math.abs(P.x-HM.cx)<6.8) P.z=HM.cz-8.6; return true; }
function hmTick(dt){ if(!started) return; hmBlessTick(); HM.pubT-=dt; if(net.up>0&&(HM.first||HM.pubT<=0)&&hmData().pub){ HM.first=false; HM.pubT=300; hmPub(); }
  if(HM.on&&!hmIn(P.x)) hmExit(); if(!HM.on) return; const tn=performance.now()/1000;
  HM.g&&HM.g.traverse(o=>{ const u=o.userData; if(u.flame){ o.scale.y=1+Math.sin(tn*9+o.id)*.15; } if(u.pulse&&o.material){ o.material.opacity=.6+Math.sin(tn*3+o.id)*.3; } if(u.spin) o.rotation.y+=dt*.8; if(u.blink&&o.material) o.material.opacity=Math.sin(tn*7)>.6?.95:.15; if(u.bob!=null) o.position.y+=Math.sin(tn+u.bob)*dt*.3; });
  HM.slotMk.forEach((m,k)=>{ m.material.opacity=.25+Math.sin(tn*3+k)*.15; });
  const d=HM.data, mine=HM.owner===G.id; placeLabel(HM.lbl,HM.cx,10.2,HM.cz-12,`🏡 ${d.n}의 신전 <b>아름다움 ${hmBeauty(d.d)}점</b>`);
  const ax=HM.cx+HM_ALTAR[0], az=HM.cz+HM_ALTAR[1]; if(mine){ const o=hmOffer(); placeLabel(HM.altLbl,ax,3.8,az,`🏺 봉헌 제단 <b>${o.gold>0?`금화 ${fmt(o.gold)} 쌓임`:"조금씩 쌓이는 중"}</b>`); }
  else { const done=(G.blessDay||{})[HM.owner]===kday(); placeLabel(HM.altLbl,ax,3.8,az,`🌟 축복 제단 <b>${done?"오늘 축복 완료!":"도장을 찍어 줘요"}</b>`); }
  HM.ref=(HM.ref||0)-dt; if(HM.ref<=0){ HM.ref=20; hmRefresh(); } }
function hmCtx(){ if(!HM.on) return null; const ax=HM.cx+HM_ALTAR[0], az=HM.cz+HM_ALTAR[1]; const mine=HM.owner===G.id;
  if(Math.hypot(P.x-ax,P.z-az)<3.6) return mine?{t:"🏺 봉헌물 받기",f:hmCollect}:{t:"🌟 축복 도장",f:hmBlessCard};
  if(mine){ for(let s=0;s<HM_SLOTS.length;s++){ const x=HM.cx+HM_SLOTS[s][0], z=HM.cz+HM_SLOTS[s][1]; if(Math.hypot(P.x-x,P.z-z)<2.4) return {t:hmData().d[s]>=0?"✨ 장식 바꾸기":"✨ 장식 놓기",f:()=>hmSlotCard(s)}; } }
  return null; }
function hmSlotCard(s){ const h=hmData(); const cur=h.d[s]; const owned=DECO.map((D,i)=>({D,i})).filter(x=>hmFree(x.i)>0);
  card(`<h2>✨ ${s+1}번 칸 꾸미기</h2>${cur>=0?`<div class="row"><div class="ic">${DECO[cur].ic}</div><div class="t"><div>${DECO[cur].n} ${rarTag(DECO[cur].t)}</div><span>아름다움 +${DECO[cur].sc}</span></div><button class="buy sell" id="hmTake">치우기</button></div>`:'<p>무엇을 놓을까요? 가진 장식만 보여요.</p>'}
   ${owned.length?`<div class="decogrid">${owned.map(x=>`<button class="buy" data-dc="${x.i}"><em>${x.D.ic}</em><b>${x.D.n}</b><small>아름다움 +${x.D.sc} · ${hmFree(x.i)}개</small></button>`).join("")}</div>`:'<p style="font-size:13px">놓을 장식이 없어요. 괴물·보스·미궁·원정·큰 물고기에서 가끔 나오고, 아래 장식 가게에서도 살 수 있어요.</p>'}
   <button class="buy alt" id="hmShop" style="align-self:center">🛒 장식 가게</button>`);
  layers.querySelectorAll("[data-dc]").forEach(b=>b.onclick=()=>{ h.d[s]=+b.dataset.dc; G.hmPlace=(G.hmPlace||0)+1; saveGame(); hmPub(); HM.data=Object.assign({},HM.data,{d:h.d,pr:G.pet}); hmBuild(); closeLayer(); jingle([659,784,1046]); fxSpark(HM.cx+HM_SLOTS[s][0],1.5,HM.cz+HM_SLOTS[s][1],0xffe9a8,30); fxRing(HM.cx+HM_SLOTS[s][0],HM.cz+HM_SLOTS[s][1],0xffd76a,4,.6); toast(`${DECO[h.d[s]].ic} ${DECO[h.d[s]].n}`,`아름다움 ${hmBeauty()}점`,1.8); });
  if($("hmTake")) $("hmTake").onclick=()=>{ h.d[s]=-1; saveGame(); hmPub(); HM.data=Object.assign({},HM.data,{d:h.d}); hmBuild(); closeLayer(); tone(440,.08); };
  $("hmShop").onclick=()=>hmShop(s); }
function hmShop(back){ const list=DECO.map((D,i)=>({D,i})).filter(x=>x.D.p>0);
  card(`<h2>🛒 장식 가게</h2><p>금화 <b style="color:var(--gold)">${fmt(G.gold)}</b> · 희귀한 장식(🗿🌈💎⛈🌲)은 가게에 없어요. 모험에서 찾아요!</p>${list.map(x=>`<div class="row"><div class="ic">${x.D.ic}</div><div class="t"><div>${x.D.n} ${rarTag(x.D.t)}</div><span>아름다움 +${x.D.sc} · 가진 것 ${hmData().own[x.i]||0}개</span></div><button class="buy" data-sb="${x.i}" ${G.gold<x.D.p?"disabled":""}>${fmt(x.D.p)}</button></div>`).join("")}${back!=null?'<button class="buy alt" id="hmBack" style="align-self:center">← 칸 꾸미기로</button>':""}`);
  layers.querySelectorAll("[data-sb]").forEach(b=>b.onclick=()=>{ const i=+b.dataset.sb; if(G.gold<DECO[i].p) return; G.gold-=DECO[i].p; hmAdd(i,"가게에서"); jingle([659,784,1046]); hmShop(back); });
  if($("hmBack")) $("hmBack").onclick=()=>hmSlotCard(back); }
function hmBlessCard(){ const id=HM.owner, d=HM.data; G.blessDay=G.blessDay||{}; const done=G.blessDay[id]===kday();
  card(`<h2>🌟 ${d.n}에게 축복 도장</h2><p>${done?"오늘은 벌써 축복했어요. 내일 또 와요!":`도장을 하나 골라 찍어 주면, ${d.n}${josa(d.n,"이","가")} 다음에 게임을 켤 때 <b style="color:#9dffb8">1시간 경험치 +20%</b>를 받아요. 나도 금화를 받아요!`}</p>
   ${done?"":`<div class="exgrid">${STAMPS.map((s,k)=>`<button class="buy" data-st="${k}"><em style="font-size:26px;font-style:normal">${s[0]}</em>${s[1]}</button>`).join("")}</div>`}`);
  layers.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{ const m=+b.dataset.st; G.blessDay[id]=kday(); G.blessN=(G.blessN||0)+1; const gold=30+G.lv*3; G.gold+=gold; saveGame(); try{ net.pushRet("b/"+id+"/"+G.id,{i:G.id,n:G.name,r:G.realm,to:id,m,t:Date.now()}); }catch(e){}
    closeLayer(); jingle([784,988,1175,1568]); buzz([30,30,60]); const ax=HM.cx+HM_ALTAR[0], az=HM.cz+HM_ALTAR[1]; fxRing(ax,az,0xffd76a,8,.9); fxSpark(ax,3,az,0xffe9a8,50); toast(`${STAMPS[m][0]} 축복 도장 꾹!`,`${d.n}${josa(d.n,"이","가")} 다음에 켜면 알게 돼요 · 금화 +${gold}`,2.8); }); }
function hmMinimap(){ const ctx=mctx, S=fitCanvas(mm); const s=S*.42/HM_R; const X=x=>S/2+(x-HM.cx)*s, Z=z=>S/2+(z-HM.cz)*s; ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle="#aadaff"; ctx.fillRect(0,0,S,S);
  dot(ctx,S/2,S/2,HM_R*s,REALMS[HM.r].ground,"#fff",2); ctx.fillStyle="#f4f1ea"; ctx.fillRect(X(HM.cx-6.5),Z(HM.cz-15.7),13*s,7*s); dot(ctx,X(HM.cx+HM_ALTAR[0]),Z(HM.cz+HM_ALTAR[1]),S/22,"#ffcf4a","#fff",1.5);
  HM.data.d.forEach((id,k)=>{ const x=X(HM.cx+HM_SLOTS[k][0]), z=Z(HM.cz+HM_SLOTS[k][1]); if(id>=0){ ctx.font=`${Math.round(S/11)}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(DECO[id].ic,x,z); } else dot(ctx,x,z,S/30,"rgba(255,255,255,.5)"); });
  for(const id in PEERS){ const o=PEERS[id]; if(Math.hypot(o.x-HM.cx,o.z-HM.cz)<HM_R+2) dot(ctx,X(o.x),Z(o.z),S/30,"#3fd27a","#fff",1.5); }
  dot(ctx,X(P.x),Z(P.z),S/24,"#2a7cff","#fff",2); }
function showHome(){ const h=hmData(); const o=hmOffer(); const sc=hmBeauty(); const total=Object.values(h.own).reduce((a,b)=>a+b,0);
  const list=Object.values(HOMES).filter(x=>Date.now()-x.t<30*86400000).sort((a,b)=>b.sc-a.sc); const rank=list.concat([{i:G.id,n:G.name,r:G.realm,sc,me:1}]).sort((a,b)=>b.sc-a.sc);
  const today=kday(); G.blessDay=G.blessDay||{};
  card(`<h2>🏡 나만의 신전</h2><p>하늘에 떠 있는 내 신전 섬을 장식으로 꾸며요. <b>아름다움 ${sc}점</b> · 장식 ${total}개 · 놓은 칸 ${h.d.filter(x=>x>=0).length}/10<br>제단에는 게임을 꺼 둔 동안에도 봉헌물이 쌓여요(최대 16시간). 아름다울수록 많이!</p>
   <div class="row"><div class="ic">🏺</div><div class="t"><div>봉헌물</div><span>${h.t?`금화 ${fmt(o.gold)}${o.pots?` · ${RM().potion} ${o.pots}`:""} 쌓임 · ${fmtDur(o.h*60)}째`:"처음 가면 쌓이기 시작해요"}</span></div></div>
   ${G.blessUntil>Date.now()?`<div class="row"><div class="ic">🌟</div><div class="t"><div>친구 축복 중 · 경험치 +20%</div><span>${fmtDur((G.blessUntil-Date.now())/60000)} 남음</span></div></div>`:""}
   <div class="exgrid"><button class="go" id="hmGo">${HM.on&&HM.owner===G.id?"신전에 있어요":"내 신전으로 가기"}</button><button class="buy alt" id="hmShop2">🛒 장식 가게</button></div>
   ${HM.on?'<button class="buy sell" id="hmOut" style="align-self:center">땅(수도)으로 돌아가기</button>':""}
   <h3>🌟 친구 신전 놀러 가기</h3>${list.length?list.map(x=>`<div class="row"><div class="ic" style="color:${REALMS[x.r].c1}">${REALMS[x.r].icon}</div><div class="t"><div>${x.n}의 신전</div><span>아름다움 ${x.sc}점 · ${G.blessDay[x.i]===today?"오늘 축복 완료":"축복 도장을 기다려요"}</span></div><button class="buy" data-vi="${x.i}">놀러 가기</button></div>`).join(""):'<p style="font-size:13px">아직 신전을 꾸민 친구가 없어요. 친구가 신전에 한 번 가 보면 여기 나와요.</p>'}
   <h3>🏆 가장 멋진 신전</h3>${rank.slice(0,6).map((x,k)=>`<div class="row"><div class="ic">${k===0?"🥇":k===1?"🥈":k===2?"🥉":k+1}</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>아름다움 ${x.sc}점</span></div></div>`).join("")}
   <h3>📖 방명록</h3>${h.gb.length?`<div class="diary">${h.gb.slice(0,10).map(g=>`<p>${(STAMPS[g.m]||STAMPS[0])[0]} ${g.n} · ${new Date(g.t).getMonth()+1}/${new Date(g.t).getDate()}</p>`).join("")}</div>`:'<p style="font-size:13px">아직 비어 있어요. 친구에게 놀러 오라고 해요!</p>'}`);
  $("hmGo").onclick=()=>{ if(!(HM.on&&HM.owner===G.id)) hmEnter(G.id); else closeLayer(); }; $("hmShop2").onclick=()=>hmShop(); if($("hmOut")) $("hmOut").onclick=()=>{ closeLayer(); hmExit(); spawnAtHome(); };
  layers.querySelectorAll("[data-vi]").forEach(b=>b.onclick=()=>hmEnter(b.dataset.vi)); }
TITLES.push({id:"hm60",n:"신전 장인",t:1,h:"내 신전 아름다움 60점",g:()=>[hmBeauty(),60]},{id:"hm150",n:"신들의 건축가",t:3,h:"내 신전 아름다움 150점",g:()=>[hmBeauty(),150]},{id:"bless10",n:"축복 천사",t:2,h:"친구 신전에 축복 도장 10번",g:()=>[G.blessN||0,10]});
</script>
