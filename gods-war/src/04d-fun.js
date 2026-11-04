<script>
/* ================= v14: 재미 3종 (IDEAS G11/2-1·2·3) =================
   1) 🐣 신수 알과 짝꿍 신수: 괴물을 잡으면 가끔 알 → 실제 시간 20분 뒤 부화(게임을 꺼 둬도 자람).
      신수는 따라다니며 같이 싸우고, 금화 보너스. 쉬는 동안 수련한 만큼 신수도 자람. 친구 화면에도 보임(pt).
   2) 🤝 합체 기술: 같은 세계 친구 둘이 8걸음 안에서 3초 안에 기술을 하나씩 쓰면 합체 기술(세계마다 6가지) + 도감.
   3) 🌋 주간 거대 보스: 매주 월요일 0시(한국 시간)에 세계의 중심에 거대 보스. 체력 하나를 모두 함께 깎음
      (각자 준 데미지를 중계 서버에 보관 → 다 더함). 쉬는 동안 수련도 데미지로 보탬. 쓰러뜨리면 모두 신화 상자, 1등은 용사. */

/* ---------- 1. 신수 ---------- */
const PETS=[
 {n:"아기 그리핀",kind:"griffin",c:0xffd95e,c2:0xfff3c4,egg:"황금빛 알"},
 {n:"아기 슬레이프니르",kind:"horse8",c:0xb8c6d8,c2:0x5a6a86,egg:"서리 무늬 알"},
 {n:"아기 가루다",kind:"bird",c:0xff9a3d,c2:0xffd24a,egg:"불꽃 무늬 알"},
 {n:"아기 페가수스",kind:"pegasus",c:0xffffff,c2:0x9fd4ff,egg:"구름 무늬 알"} ];
const EGG_MS=20*60000, PET_MAX=20;
function petNeed(lv){ return 12*lv; }
function petData(){ G.pets=G.pets||{}; if(G.pet==null) G.pet=-1; return G.pets; }
function petBonus(){ const p=G.pet>=0&&G.pets&&!expPetAway(G.pet)&&G.pets[G.pet]; return p?p.lv*2:0; }   // 금화 +%
function petArr(){ const p=G.pet>=0&&G.pets&&!expPetAway(G.pet)&&G.pets[G.pet]; return p?[G.pet,p.lv]:null; }
function petGain(n){ const p=G.pet>=0&&G.pets&&!expPetAway(G.pet)&&G.pets[G.pet]; if(!p||p.lv>=PET_MAX) return 0; p.xp=(p.xp||0)+n; let up=0; while(p.lv<PET_MAX&&p.xp>=petNeed(p.lv)){ p.xp-=petNeed(p.lv); p.lv++; up++; } if(p.lv>=PET_MAX) p.xp=0; if(up&&PETMESH.me){ rebuildMyPet(); } return up; }
function petOnKill(m){ petData(); const b=petBonus(); if(b>0){ const extra=Math.max(1,Math.round(m.gold*b/100)); G.gold+=extra; }
  const up=petGain(m.boss?6:1); if(up){ const p=G.pets[G.pet]; toast(`${PETS[G.pet].n} Lv.${p.lv}!`,`금화 보너스 +${p.lv*2}%`,2); jingle([784,988,1175]); }
  if(!G.egg&&!m.war&&!m.titan){ const first=!G.eggEver; const ch=first?1:m.boss?.3:.02; if(Math.random()<ch){ const rg=REGIONS[m.rg]; const r=rg&&rg.realm>=0?rg.realm:rint(0,3); G.egg={r,t0:Date.now()}; G.eggEver=1;
      toast(`🥚 ${PETS[r].egg}을(를) 주웠어요!`,"20분 뒤에 깨어나요 · 게임을 꺼 둬도 자라요",3.2); jingle([659,880,1046,1318]); fxRing(m.x,m.z,PETS[r].c,6,.8); } } }
function eggLeft(){ return G.egg?Math.max(0,G.egg.t0+EGG_MS-Date.now()):0; }
let eggCheckT=0;
function tickEgg(dt){ eggCheckT-=dt; if(eggCheckT>0) return; eggCheckT=2; if(!G.egg||eggLeft()>0||layerOpen||P.dead) return; hatchEgg(); }
function hatchEgg(){ petData(); const r=G.egg.r; G.egg=null; const had=G.pets[r]; let msg;
  if(had){ had.lv=Math.min(PET_MAX,had.lv+2); had.xp=0; msg=`이미 있는 ${PETS[r].n}의 형제 알이었어요! ${PETS[r].n} 레벨 +2 (Lv.${had.lv})`; }
  else { G.pets[r]={lv:1,xp:0,t:Date.now()}; msg=`새 친구 <b style="color:var(--gold)">${PETS[r].n}</b>! 이제 나를 따라다니며 같이 싸워요.`; }
  if(!had||G.pet<0) G.pet=r; saveGame(); rebuildMyPet(); try{ net.hello(); net.pushProfile(1); }catch(e){}
  card(`<h2>🐣 알이 깨어났어요!</h2><canvas id="petPrev" width="260" height="200" style="width:200px;height:154px;align-self:center"></canvas><p>${msg}</p><p style="font-size:13px">신수는 괴물을 같이 공격하고, 금화를 더 주워 줘요(레벨×2%). 내가 쉬는 동안 수련하면 신수도 같이 자라요.</p><button class="buy" id="petOk" style="align-self:center">좋아요!</button>`);
  $("petOk").onclick=closeLayer; drawPetPreview($("petPrev"),r); jingle([523,659,784,1046,1318,1568]); fxRing(P.x,P.z,PETS[r].c,10,1); fxSpark(P.x,2,P.z,PETS[r].c,50); buzz([40,30,40]); }
function petIdle(r){ petData(); const n=Math.floor(r.kills||0); if(!n) return null; const p=G.pet>=0&&!expPetAway(G.pet)&&G.pets[G.pet]; if(!p) return null; const lv0=p.lv; petGain(n); return {n:PETS[G.pet].n,lv0,lv:p.lv}; }

// 신수 모델(코드로 만든 귀여운 아기 동물)
function makePet(r,lv){ const D=PETS[r]; const g=new THREE.Group(); const body=new THREE.Group(); g.add(body);
  const m=mat({color:D.c,roughness:.55}), m2=mat({color:D.c2,roughness:.55}), eye=mat({color:0x111111,roughness:.25}), wh=mat({color:0xffffff,emissive:0xffffff,emissiveIntensity:.8}), gold=mat({color:0xffc83a,metalness:.4,roughness:.35});
  const b=sph(.55,m,0,0,0); b.scale.set(1,.9,1.15); body.add(b);
  const h=sph(.46,m,0,.62,.55); body.add(h);
  [-1,1].forEach(s=>{ body.add(sph(.12,eye,s*.19,.7,.94)); body.add(sph(.04,wh,s*.19+.04,.75,1.03)); body.add(sph(.07,mat({color:0xff9aa8,roughness:.8}),s*.3,.55,.9)); });
  const wings=[];
  if(D.kind==="griffin"||D.kind==="bird"){ const bk=new THREE.Mesh(GEO.cone,mat({color:0xffa53a,roughness:.5})); bk.scale.set(.2,.32,.2); bk.rotation.x=Math.PI/2; bk.position.set(0,.55,1.05); body.add(bk); }
  else { body.add(sph(.24,m2,0,.5,.95)); }
  if(D.kind!=="bird"){ [-1,1].forEach(s=>{ const e=new THREE.Mesh(GEO.cone,m); e.scale.set(.16,.32,.16); e.position.set(s*.25,1.05,.45); e.rotation.z=-s*.3; body.add(e); }); }
  if(D.kind==="bird"){ for(let k=0;k<3;k++){ const c=new THREE.Mesh(GEO.cone,m2); c.scale.set(.1,.36,.1); c.position.set(0,1.02+k*.02,.42-k*.14); c.rotation.x=-.4-k*.25; body.add(c); } }
  if(D.kind==="horse8"||D.kind==="pegasus"){ for(let k=0;k<4;k++) body.add(sph(.12,m2,0,.9-k*.12,.3-k*.2)); }
  if(D.kind!=="horse8"){ [-1,1].forEach(s=>{ const w=new THREE.Group(); w.position.set(s*.45,.25,-.05); for(let f=0;f<3;f++){ const fe=sph(.17,m2,s*(.22+f*.22),.12+f*.1,0); fe.scale.set(1,.5+f*.25,.4); fe.rotation.z=s*(.5+f*.25); w.add(fe); } w.userData.s=s; body.add(w); wings.push(w); }); }
  const legN=D.kind==="horse8"?8:D.kind==="bird"?2:4; for(let k=0;k<legN;k++){ const row=D.kind==="horse8"?Math.floor(k/2):k%2===0?0:1; const side=k%2===0?-1:1; const z=legN===2?0:legN===8?(.35-Math.floor(k/2)*.23):(Math.floor(k/2)?-.3:.3); body.add(cyl(.08,.07,.4,D.kind==="bird"?mat({color:0xffa53a}):m2,side*(legN===8?.22+(row%2)*.05:.25),-.48,z,8)); }
  const tail=sph(.16,m2,0,.15,-.68); tail.scale.set(1,1,1.6); body.add(tail);
  if(lv>=10){ const c=new THREE.Mesh(new THREE.TorusGeometry(.2,.05,6,16),gold); c.rotation.x=Math.PI/2; c.position.set(0,1.18,.55); body.add(c); }
  g.userData={body,wings,fly:D.kind!=="horse8",t:Math.random()*6};
  const sc=.7+Math.min(lv||1,PET_MAX)*.02; g.scale.setScalar(sc); return g; }
function drawPetPreview(cv,r){ try{ const rr=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true}); rr.setSize(cv.width,cv.height,false); const sc=new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff,0x553366,1.1)); const dl=new THREE.DirectionalLight(0xffffff,1); dl.position.set(2,4,5); sc.add(dl); const pet=makePet(r,1); pet.scale.setScalar(1.3); sc.add(pet); const cam=new THREE.PerspectiveCamera(40,cv.width/cv.height,.1,50); cam.position.set(0,1.2,4.4); cam.lookAt(0,.4,0); let t=0; const loop=()=>{ if(!document.body.contains(cv)){ rr.dispose(); return; } t+=.03; pet.rotation.y=Math.sin(t)*.7; pet.position.y=Math.abs(Math.sin(t*3))*.2; pet.userData.wings.forEach(w=>w.rotation.z=w.userData.s*Math.sin(t*12)*.5); rr.render(sc,cam); requestAnimationFrame(loop); }; loop(); }catch(e){} }
const PETMESH={me:null,others:{}};
function rebuildMyPet(){ if(PETMESH.me){ scene.remove(PETMESH.me.mesh); PETMESH.me=null; } const a=petArr(); if(!a||!started) return; const mesh=makePet(a[0],a[1]); scene.add(mesh); PETMESH.me={mesh,x:P.x-1.5,z:P.z-1.5,key:a.join(","),atk:1}; }
function followPet(o,ox,oz,orot,dt){ const bx=ox-Math.sin(orot)*1.6+Math.cos(orot)*1.3, bz=oz-Math.cos(orot)*1.6-Math.sin(orot)*1.3; const dx=bx-o.x, dz=bz-o.z, L=Math.hypot(dx,dz);
  if(L>30){ o.x=bx; o.z=bz; } else if(L>.3){ const sp=Math.min(L*3,16); o.x+=dx/L*sp*dt; o.z+=dz/L*sp*dt; }
  const u=o.mesh.userData; u.t+=dt*(L>.5?14:5); const tx=o.tx!=null?o.tx:bx+Math.sin(orot)*3, tz=o.tz!=null?o.tz:bz+Math.cos(orot)*3; o.mesh.rotation.y=Math.atan2(tx-o.x,tz-o.z);
  const fly=u.fly?1.6+Math.sin(u.t*.4)*.25:Math.abs(Math.sin(u.t*.7))*.25; o.mesh.position.set(o.x,hAt(o.x,o.z)+fly,o.z); u.wings.forEach(w=>w.rotation.z=w.userData.s*Math.sin(u.t*2.2)*.6); u.body.rotation.z=Math.sin(u.t*.35)*.08; }
function tickPets(dt){ if(!started) return; tickEgg(dt);
  const a=petArr(); if(a&&(!PETMESH.me||PETMESH.me.key!==a.join(","))) rebuildMyPet(); if(!a&&PETMESH.me) rebuildMyPet();
  const me=PETMESH.me; if(me){ me.mesh.visible=!P.dead; me.tx=me.tz=null;
    me.atk-=dt; const tgt=mobs.find(m=>m.hp>0&&(m.state==="chase"||m.titan)&&Math.hypot(m.x-me.x,m.z-me.z)<(m.titan?14:8));
    if(tgt){ me.tx=tgt.x; me.tz=tgt.z; if(me.atk<=0&&!P.dead){ me.atk=1.4; const p=G.pets[G.pet]; const dmg=stat().atk*(.15+.012*p.lv); fxLine(me.x,me.z,Math.atan2(tgt.x-me.x,tgt.z-me.z),Math.min(8,Math.hypot(tgt.x-me.x,tgt.z-me.z)),PETS[G.pet].c); damageMob(tgt,dmg,false); } }
    followPet(me,P.x,P.z,P.rot,dt); }
  // 친구·쉬는 친구의 신수
  const want={};
  for(const id in PEERS){ const o=PEERS[id]; if(o.pt&&!o.dead) want["p"+id]={pt:o.pt,x:o.x,z:o.z,rot:o.mesh?o.mesh.rotation.y:0}; }
  for(const id in GHOSTS){ const g=GHOSTS[id]; if(g.p&&g.p.pt) want["g"+id]={pt:g.p.pt,x:g.x,z:g.z,rot:g.mesh.rotation.y}; }
  for(const k in PETMESH.others){ const o=PETMESH.others[k]; const w=want[k]; if(!w||o.key!==w.pt.join(",")){ scene.remove(o.mesh); delete PETMESH.others[k]; } }
  for(const k in want){ const w=want[k]; if(Math.hypot(w.x-P.x,w.z-P.z)>70){ if(PETMESH.others[k]){ scene.remove(PETMESH.others[k].mesh); delete PETMESH.others[k]; } continue; }
    let o=PETMESH.others[k]; if(!o){ const mesh=makePet(w.pt[0],w.pt[1]); scene.add(mesh); o=PETMESH.others[k]={mesh,x:w.x-1.5,z:w.z-1.5,key:w.pt.join(",")}; } followPet(o,w.x,w.z,w.rot,dt); } }
function showPets(){ petData(); const eg=G.egg?`<div class="row"><div class="ic">🥚</div><div class="t"><div>${PETS[G.egg.r].egg} 품는 중</div><span>${eggLeft()>0?`깨어나기까지 ${Math.ceil(eggLeft()/60000)}분 · 게임을 꺼 둬도 자라요`:"곧 깨어나요!"}</span></div></div>`:`<div class="row"><div class="ic">🥚</div><div class="t"><div>알 없음</div><span>괴물을 잡으면 가끔 알이 나와요(보스는 자주). 알은 한 번에 하나만 품을 수 있어요.</span></div></div>`;
  const rows=PETS.map((D,r)=>{ const p=G.pets[r]; if(!p) return `<div class="row" style="opacity:.55"><div class="ic">❔</div><div class="t"><div>???</div><span>${REALMS[r].n}의 신수 · ${D.egg}에서 태어나요</span></div></div>`;
    const on=G.pet===r, away=expPetAway(r); return `<div class="row"><div class="ic" style="color:#${D.c.toString(16).padStart(6,"0")}">${REALMS[r].icon}</div><div class="t"><div>${D.n} Lv.${p.lv}${away?' <i class="st">🧭 원정 중</i>':on?' <i class="st on">함께하는 중</i>':""}</div><span>금화 +${p.lv*2}% · 공격 함께 ${p.lv>=PET_MAX?"· 최고 레벨!":`· 다음 레벨까지 ${petNeed(p.lv)-Math.floor(p.xp||0)}마리`}${p.lv>=10?" · 👑 왕관":""}</span></div>${on||away?"":`<button class="buy" data-pet="${r}">데려가기</button>`}</div>`; }).join("");
  card(`<h2>🐣 신수</h2><p>신수 도감 ${Object.keys(G.pets).length}/${PETS.length} · 신수는 괴물을 같이 공격하고 금화를 더 주워 줘요. 친구 화면에도 보여요.</p>${eg}${rows}<p style="font-size:12px">괴물 1마리 = 신수 경험치 1 (보스 6). 쉬는 동안 수련한 괴물 수만큼 신수도 자라요. 레벨 10이 되면 왕관!</p>`);
  layers.querySelectorAll("[data-pet]").forEach(b=>b.onclick=()=>{ G.pet=+b.dataset.pet; saveGame(); rebuildMyPet(); try{ net.hello(); net.pushProfile(1); }catch(e){} jingle([659,784,1046]); showPets(); }); }

/* ---------- 2. 합체 기술 ---------- */
const COMBOS=[
 {"0-0":"쌍둥이 심판","1-1":"천사의 합창","2-2":"천군의 창비","0-1":"빛의 날개 폭풍","0-2":"천군의 빛창","1-2":"부활의 창"},
 {"0-0":"쌍둥이 묠니르","1-1":"늑대 형제의 포효","2-2":"신들의 황혼","0-1":"천둥 함성","0-2":"번개 라그나로크","1-2":"광전사 폭풍"},
 {"0-0":"두 개의 차크라","1-1":"원숭이 군단 도약","2-2":"우주의 춤","0-1":"날아오는 차크라","0-2":"춤추는 원반","1-2":"하늘을 가르는 춤"},
 {"0-0":"제우스의 천둥비","1-1":"날개신 두 켤레","2-2":"거대한 해일","0-1":"번개 질주","0-2":"폭풍의 바다","1-2":"파도 타기 돌격"} ];
const CB={me:null,cd:0};
function comboKey(a,b){ return Math.min(a,b)+"-"+Math.max(a,b); }
function comboOnSkill(i){ const now=performance.now(); CB.me={i,t:now}; try{ net.send({t:"sk",s:i}); }catch(e){}
  for(const id in PEERS){ const o=PEERS[id]; if(o.realm!==G.realm||o.dead||!o.sk||o.sk.used||now-o.sk.t>3000) continue; if(Math.hypot(o.x-P.x,o.z-P.z)>8) continue;
    o.sk.used=true; CB.me.used=true; try{ net.send({t:"combo",w:id,a:o.sk.i,b:i}); }catch(e){} comboFire(o,o.sk.i,i); return; } }
function comboRecv(o,d){ const now=performance.now();
  if(d.t==="sk"){ o.sk={i:d.s,t:now}; return; }
  if(d.t==="combo"&&d.w===G.id){ if(CB.me) CB.me.used=true; comboFire(o,d.a,d.b); } }
function comboFire(o,a,b){ if(CB.cd>0||G.realm<0) return; CB.cd=1.5; const key=comboKey(a,b), name=COMBOS[G.realm][key]; const R=RM(); const S1=R.skills[a]||R.skills[0], S2=R.skills[b]||R.skills[0];
  const mx=(P.x+o.x)/2, mz=(P.z+o.z)/2, st=stat();
  drama(0xffd76a,.85,2.2); P.shake=Math.max(P.shake||0,1.2); fxRing(mx,mz,S1.color,26,1.2); fxRing(mx,mz,S2.color,18,.9); fxRing(mx,mz,0xffe08a,34,1.6); fxFlash(mx,3,mz,0xffffff,7,.5); fxSpark(mx,2,mz,0xffe08a,70);
  for(let k=0;k<8;k++) setTimeout(()=>fxBolt(mx+rnd(-11,11),mz+rnd(-11,11),k%2?S1.color:S2.color),k*90);
  mobs.forEach(m=>{ if(Math.hypot(m.x-mx,m.z-mz)<14){ const crit=Math.random()<st.crit+.2; damageMob(m,st.atk*6*rnd(.95,1.1)*(crit?1.8:1),crit); } });
  P.hp=Math.min(st.mhp,P.hp+st.mhp*(a===1&&b===1?1:.3)); jingle([523,659,784,1046,1318,1568]); tone(110,.6,"sawtooth",0,.18); buzz([60,40,90]);
  G.combos=G.combos||{}; const ck=G.realm+":"+key; const first=!G.combos[ck];
  if(first){ G.combos[ck]={n:o.name,t:Date.now()}; const gold=100+G.lv*12, xp=120+G.lv*20; G.gold+=gold; gainXp(xp); toast(`🤝 새 합체 기술! ${name}`,`${o.name}와(과) 함께 · 도감 기록 · 금화 +${gold}`,3.4); }
  else toast(`🤝 합체 기술! ${name}`,`${o.name}와(과) 함께 · 데미지 6배`,2.4);
  saveGame(); }
function showCombos(){ const R=RM(); G.combos=G.combos||{}; const keys=["0-0","1-1","2-2","0-1","0-2","1-2"]; const got=keys.filter(k=>G.combos[G.realm+":"+k]).length;
  const rows=keys.map(k=>{ const [a,b]=k.split("-").map(Number); const rec=G.combos[G.realm+":"+k]; const d=rec?new Date(rec.t):null;
    return `<div class="row"${rec?"":' style="opacity:.6"'}><div class="ic">${rec?"🤝":"❔"}</div><div class="t"><div>${rec?COMBOS[G.realm][k]:"??? 합체 기술"}</div><span>${R.skills[a].n} + ${R.skills[b].n}${rec?` · ${rec.n}와(과) 처음 성공 (${d.getMonth()+1}/${d.getDate()})`:""}${R.skills[Math.max(a,b)].rank>G.rank?` · ${R.ranks[R.skills[Math.max(a,b)].rank]}부터`:""}</span></div></div>`; }).join("");
  card(`<h2>🤝 합체 기술 도감</h2><p>${R.n} 합체 기술 ${got}/6</p><p style="font-size:13px">같은 세계 친구와 <b>8걸음 안</b>에 서서, <b>3초 안에</b> 둘이 기술을 하나씩 쓰면 합체 기술이 터져요! 데미지 6배 · 체력 회복 · 처음 성공하면 금화와 경험치 보너스.<br>"하나, 둘, 셋!" 하고 맞춰 보세요.</p>${rows}`); }

/* ---------- 3. 주간 거대 보스 ---------- */
const TITAN_HP=2000000, TITAN_POS={x:0,z:-24}, WEEK_MS=7*86400000;
function titanWeek(){ return Math.floor((Date.now()+9*3600000-4*86400000)/WEEK_MS); }   // 한국 시간 월요일 0시에 바뀜
function titanWeekStart(w){ return w*WEEK_MS+4*86400000-9*3600000; }
function titanDef(w){ const R=REALMS[((w%4)+4)%4]; return {n:R.worldBoss.n,shape:R.worldBoss.shape,c:R.worldBoss.c,realm:REALMS.indexOf(R)}; }
const TB=(function(){ let s=null; try{ s=JSON.parse(load("gw-titan-"+ROOM)||"null"); }catch(e){} if(!s||s.w!==titanWeek()) s={w:titanWeek(),mine:0,others:{},claimed:false}; return s; })();
function titanSave(){ save("gw-titan-"+ROOM,JSON.stringify(TB)); }
function titanRoll(){ const w=titanWeek(); if(TB.w!==w){ TB.w=w; TB.mine=0; TB.others={}; TB.claimed=false; TB.dirty=true; titanSave(); if(TITAN.m) titanRemove(); } }
function titanTotal(){ let t=TB.mine; for(const id in TB.others) t+=TB.others[id].d||0; return t; }
function titanLeft(){ return Math.max(0,TITAN_HP-titanTotal()); }
function titanMsg(d){ if(!d||d.w!==TB.w||!d.i) return; if(d.i===G.id){ if((d.d||0)>TB.mine){ TB.mine=d.d; titanSave(); } return; } const o=TB.others[d.i]; if(!o||(d.d||0)>=o.d){ TB.others[d.i]={n:d.n,r:d.r,d:d.d||0}; titanSave(); } }
const TITAN={m:null,sendT:5,stompT:4,warnT:0};
function titanSpawn(){ const D=titanDef(TB.w); const scale=3.3; const mesh=(typeof mobGL==="function"&&mobGL(D.n,scale))||makeMob(D.shape,D.c,scale);
  const m={n:"거대 "+D.n,shape:D.shape,mesh,x:TITAN_POS.x,z:TITAN_POS.z,hx:TITAN_POS.x,hz:TITAN_POS.z,lv:Math.max(20,G.lv+5),boss:true,world:true,titan:true,hp:titanLeft(),mhp:TITAN_HP,atk:0,xp:0,gold:0,rg:12,cd:0,state:"idle",t:0,lbl:makeLabel("boss"),rot:0,hit:0,scale,power:99};
  const aura=new THREE.Mesh(new THREE.RingGeometry(1.6,2.4,48),glowMat(0xff7a3d,.75)); aura.rotation.x=-Math.PI/2; aura.position.y=.1; mesh.add(aura); m.aura=aura;
  m.rise=-1; TITAN.intro=0; // v29 등장 연출: 처음엔 땅속에 묻혀 있다가 내가 가까이 오면 솟아오름
  mesh.position.set(m.x,hAt(m.x,m.z),m.z); scene.add(mesh); mobs.push(m); TITAN.m=m; return m; }
function titanRemove(){ const m=TITAN.m; if(!m) return; scene.remove(m.mesh); m.lbl.remove(); const i=mobs.indexOf(m); if(i>=0) mobs.splice(i,1); TITAN.m=null; }
function titanHit(m,dmg,crit){ if(titanLeft()<=0) return; dmg=Math.round(Math.min(dmg,50000)); TB.mine+=dmg; TB.dirty=true; m.hp=titanLeft(); m.hit=.15; P.combat=4;
  floatDmg(m.x+rnd(-2,2),3.5*m.scale*.6,m.z+rnd(-2,2),"-"+fmt(dmg),crit?"crit":""); fxSpark(m.x+rnd(-2,2),4,m.z+rnd(-2,2),crit?0xffe08a:0xffffff,crit?14:6); tone(crit?660:440,.05,"square",0,.07);
  if(titanLeft()<=0) titanDefeated(); }
function titanPush(){ if(!TB.dirty) return; TB.dirty=false; titanSave(); try{ net.pushTitan({i:G.id,n:G.name,r:G.realm,w:TB.w,d:Math.round(TB.mine)}); }catch(e){} }
function titanRank(){ const list=[{id:G.id,n:G.name,r:G.realm,d:TB.mine,me:1}]; for(const id in TB.others){ const o=TB.others[id]; if(o.d>0) list.push({id,n:o.n,r:o.r,d:o.d}); } return list.sort((a,b)=>b.d-a.d); }
function titanDefeated(){ if(TB.claimed) return; TB.claimed=true; titanSave(); titanPush();
  const m=TITAN.m; if(m){ fxFlash(m.x,6,m.z,0xffe08a,14,.8); fxRing(m.x,m.z,0xffe08a,40,1.6); fxSpark(m.x,6,m.z,0xffe08a,90); titanRemove(); }
  const D=titanDef(TB.w); const rank=titanRank(); const hero=rank[0]; const meHero=hero&&hero.me&&TB.mine>0; const helped=TB.mine>0;
  let gold=helped?300+G.lv*25:Math.round((300+G.lv*25)*.4), xp=helped?250+G.lv*35:Math.round((250+G.lv*35)*.4); if(meHero){ gold*=2; xp*=2; G.hero=TB.w; }
  G.titanWins=(G.titanWins||0)+1; const t=Math.min(3,Math.max(G.rank,1)); const s=pick(["w","a","r"]); G.bag.push({s,t}); G.gold+=gold; gainXp(xp); G.pots+=3; saveGame();
  card(`<h2>🏆 거대 ${D.n} 쓰러뜨림!</h2><p>모두 함께 힘을 합쳐 이겼어요!</p><div class="idlegrid"><div><b>+${fmt(gold)}</b><span>금화</span></div><div><b>+${fmt(xp)}</b><span>경험치</span></div><div><b>${rarTag(t)}</b><span>${itemName(s,t)}</span></div><div><b>+3</b><span>${RM().potion}</span></div></div>
   <p>${hero?`이번 주 <b style="color:var(--gold)">🏅 용사: ${hero.n}</b> (${fmt(hero.d)} 데미지)`:""}${meHero?"<br>내가 용사예요! 보상 2배 · 다음 주까지 이름 옆에 🏅":""}${helped?"":"<br>(이번엔 직접 때리지 않아서 보상이 조금 작아요)"}</p><button class="buy" id="tOk" style="align-self:center">만세!</button>`);
  $("tOk").onclick=closeLayer; jingle([523,659,784,1046,1318,1568,2093]); buzz([80,40,80,40,120]); }
function titanIdle(r){ titanRoll(); if(TB.claimed||titanLeft()<=0||!r||!r.kills) return null; const now=Date.now(), ws=titanWeekStart(TB.w); const away=r.away||1; const frac=clamp((now-Math.max(now-away,ws))/away,0,1); const d=Math.round(r.kills*frac*(40+r.lv*20)); if(d<=0) return null; TB.mine+=d; TB.dirty=true; titanSave(); if(titanLeft()<=0) setTimeout(()=>{ if(!layerOpen) titanDefeated(); else TB.pending=1; },4000); return {d,n:"거대 "+titanDef(TB.w).n}; }
/* v29 거대 보스 등장: 땅이 갈라지며 붉은 빛 → 쿵쿵 흔들리며 솟아오름 → 흙먼지·충격파 → 큰 이름 */
function titanSink(m,dt){ const H=(m.mesh.userData.h||4)*m.scale; if(m.rise<0) return H*1.05; if(m.rise>=1) return 0;
  const was=m.rise; m.rise=Math.min(1,m.rise+dt/2.4); const e=1-Math.pow(1-m.rise,3); const X=TITAN_POS.x,Z=TITAN_POS.z;
  P.shake=Math.max(P.shake||0,.55*(1-m.rise)+.15); if(Math.floor(was*6)!==Math.floor(m.rise*6)){ thud(); try{ SFX.dust(X+rnd(-4,4),Z+rnd(-4,4),HIGH()?8:4,9); }catch(e){} fxSpark(X+rnd(-5,5),.5,Z+rnd(-5,5),0xcfb48a,HIGH()?22:10); }
  if(m.rise>=1){ P.shake=Math.max(P.shake||0,1.2); buzz([80,40,160]); try{ SFX.shock(X,Z,0xff7a3d,22,1); }catch(e){ fxRing(X,Z,0xff7a3d,34,1); } fxRing(X,Z,0xffd0a0,16,.7); fxSpark(X,3,Z,0xffb070,HIGH()?70:30); tone(55,.9,"sawtooth",0,.16); tone(82,.7,"square",.05,.08); }
  return H*1.05*(1-e)+Math.sin(m.rise*60)*.08*(1-m.rise); }
function titanIntro(m){ m.rise=0; const X=TITAN_POS.x,Z=TITAN_POS.z; const D=titanDef(TB.w); const c=(REALMS[D.realm]&&REALMS[D.realm].c1)||0xff6a3d;
  fxRing(X,Z,0xff3a1a,30,2.4); fxRing(X,Z,0xffa040,14,1.6); fxFlash(X,1,Z,0xff5a20,10,1.4); drama(0xff4a20,.45,2.6); tone(48,1.6,"sawtooth",0,.14); tone(36,2,"triangle",.2,.12);
  if(!layerOpen&&!TITAN.intro){ TITAN.intro=1; setTimeout(()=>{ if(TITAN.m===m&&!layerOpen) lvBanner("⚠ 이번 주 거대 보스",m.n,"모두의 힘으로 쓰러뜨려요 · <b>빨간 고리</b>가 보이면 멀리 피해요","#ff6a3d"); },900); } }
function tickTitan(dt){ if(!started) return; titanRoll(); const dead=titanLeft()<=0; if(dead&&!TB.claimed&&!layerOpen) titanDefeated();
  const near=Math.hypot(P.x-TITAN_POS.x,P.z-TITAN_POS.z);
  if(!dead&&!TB.claimed&&near<120&&!TITAN.m) titanSpawn(); if((dead||near>140)&&TITAN.m) titanRemove();
  TITAN.sendT-=dt; if(TITAN.sendT<=0){ TITAN.sendT=5; titanPush(); }
  const m=TITAN.m; if(m){ m.hp=titanLeft(); m.hit=Math.max(0,m.hit-dt); const tn=performance.now(); const d=Math.hypot(P.x-TITAN_POS.x,P.z-TITAN_POS.z);
    // 몸이 아주 커서: 맞는 점(m.x,m.z)을 내 쪽 몸 가장자리(6.5걸음)에 둠 → 공격·기술 거리 계산이 그대로 맞음
    const k=Math.min(d,6.5)/(d||1); m.x=TITAN_POS.x+(P.x-TITAN_POS.x)*k; m.z=TITAN_POS.z+(P.z-TITAN_POS.z)*k;
    if(d<40&&!P.dead){ m.rot=Math.atan2(P.x-TITAN_POS.x,P.z-TITAN_POS.z); } let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*2);
    if(m.rise<0&&d<58&&!P.dead) titanIntro(m); const sink=titanSink(m,dt);
    m.mesh.position.set(TITAN_POS.x,hAt(TITAN_POS.x,TITAN_POS.z)+(m.mesh.userData.float?Math.sin(tn/600)*.5+.5:0)-sink,m.z); if(m.aura) m.aura.position.y=.1+sink/m.scale; if(m.aura){ m.aura.rotation.z+=dt; m.aura.scale.setScalar(1+Math.sin(tn/300)*.1); }
    if(m.mesh.userData.gl) animState(m.mesh,TITAN.warnT>0?"attack":m.hit>0?"hit":"idle");
    hitTint(m.mesh,m.hit/.15); m.mesh.scale.setScalar(m.scale*(m.hit>0?1.04:1));
    // 쿵! 발 구르기: 1초 전에 빨간 고리로 미리 알려 줌 → 멀리 피하면 안 맞음
    TITAN.stompT-=dt; if(d<26&&!P.dead){ if(TITAN.stompT<=0&&TITAN.warnT<=0){ TITAN.warnT=1.1; fxRing(TITAN_POS.x,TITAN_POS.z,0xff4040,26,1.1); tone(70,.5,"sawtooth",0,.12); }
      if(TITAN.warnT>0){ TITAN.warnT-=dt; if(TITAN.warnT<=0){ TITAN.stompT=rnd(3.5,5); fxRing(TITAN_POS.x,TITAN_POS.z,0xffb070,30,.6); fxSpark(TITAN_POS.x,1,TITAN_POS.z,0xcfc4ac,40); P.shake=Math.max(P.shake||0,.8); thud();
        if(Math.hypot(P.x-TITAN_POS.x,P.z-TITAN_POS.z)<13) hurtPlayer(mobStats(G.lv,false).atk*1.6*(1-dmgReduce(stat().def)),m.n); } } }
    if(d<70) placeLabel(m.lbl,TITAN_POS.x,(m.mesh.userData.h||4)*m.scale*.5,TITAN_POS.z,`🌋 ${m.n} <b>모두의 거대 보스 · 남은 체력 ${fmt(titanLeft())}</b><span class="hp"><i style="width:${Math.round(titanLeft()/TITAN_HP*100)}%"></i></span>`); else m.lbl.style.display="none"; }
  const pill=$("titanPill"); if(pill){ const pct=Math.round(titanLeft()/TITAN_HP*100); const txt=TB.claimed||dead?"🌋 🏆 이번 주 승리":`🌋 ${titanDef(TB.w).n} ${pct}%`; if(pill._t!==txt){ pill._t=txt; pill.textContent=txt; } } }
function titanGo(){ if(mobs.some(m=>!m.titan&&m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 안 돼요"); return; } P.x=TITAN_POS.x+rnd(-3,3); P.z=TITAN_POS.z+30; P.invul=2; closeLayer(); toast("거대 보스 앞에 왔어요!","빨간 고리가 보이면 멀리 피해요",2.6); }
function showTitan(){ titanRoll(); const D=titanDef(TB.w); const left=titanLeft(), pct=Math.round(left/TITAN_HP*100); const end=titanWeekStart(TB.w+1); const hrs=Math.max(0,(end-Date.now())/3600000);
  const rank=titanRank().map((x,k)=>`<div class="row"><div class="ic" style="color:${REALMS[x.r]?REALMS[x.r].c1:"#fff"}">${k===0&&x.d>0?"🏅":k+1}</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>${fmt(Math.round(x.d))} 데미지</span></div></div>`).join("");
  const done=TB.claimed||left<=0;
  card(`<h2>🌋 이번 주 거대 보스</h2><p><b style="color:var(--gold)">거대 ${D.n}</b> · ${done?"쓰러뜨렸어요! 다음 주 월요일에 새 보스가 깨어나요":`남은 체력 ${fmt(left)} / ${fmt(TITAN_HP)} (${pct}%) · 남은 시간 ${hrs>=24?Math.floor(hrs/24)+"일 ":""}${Math.floor(hrs%24)}시간`}</p>
   <div class="bar" style="height:14px;border:2px solid #ffcf4a;border-radius:8px;overflow:hidden;background:#000"><i style="display:block;height:100%;width:${pct}%;background:linear-gradient(90deg,#b01030,#ff3d4a)"></i></div>
   <p style="font-size:13px">세계의 중심에 사는 아주 큰 보스예요. 체력은 <b>모든 친구가 함께</b> 깎아요. 게임을 꺼 둔 동안 수련한 것도 데미지로 보태져요.<br>쓰러뜨리면 모두에게 신화 상자(금화·경험치·장비·물약), 가장 많이 때린 사람은 <b>🏅 용사</b>(보상 2배).</p>
   <h3>데미지 순위</h3>${rank}${done?"":`<button class="go" id="tGo" style="align-self:center;font-size:18px;padding:10px 22px">보스에게 가기</button>`}`);
  if($("tGo")) $("tGo").onclick=titanGo; }
</script>
