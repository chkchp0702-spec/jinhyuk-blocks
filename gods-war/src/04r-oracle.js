<script>
/* ================= v42-1: 🗿 지혜의 석상 — 하루 3문제 신화 수수께끼 (IDEAS G11/4-7) =================
   네 수도 광장마다 석상(에덴 지혜의 천사 · 아스가르드 미미르의 머리 · 인도 가네샤 · 올림푸스 스핑크스).
   한국 날짜로 문제 3개가 정해져서 같은 방의 모든 사람이 같은 문제를 받음. 문제는 02-data.js 의 신·기술·괴물·수도·보물 이야기로 자동으로 만듦.
   한 문제에 한 번만 고를 수 있음. 틀리면 정답과 짧은 이야기를 보여 줌(신화 배우기).
   3개 다 맞히면 「지혜의 축복」(10분 경험치 +15%) + 룬 가루 2 + 금화 · 석상 눈이 빛남.
   오늘 맞힌 수는 내 캐릭터 정보(oq)에 실려 모험가 명부·석상 「오늘의 지혜왕」에 🧠. 7일 연속 다 맞히면 칭호 「신탁의 현자」. */
const XTICK=[];   // 새 기능들의 매 프레임 일 (06-ui.js update 에서 부름)
const NETR={};    // 새 기능들의 실시간 메시지 (05-net.js recv 에서 부름: NETR[t](친구, 메시지))
const OR_NAME=["지혜의 천사","미미르의 머리","가네샤","스핑크스"];
const OR={spots:[],lbl:null,t:0,cache:null};
// 수도 안에서 다른 건물(집·성·시장·대장간·게시판·불가사의·성전·성소·제단·미궁 문·경주 문과 고리)과 가장 멀리 떨어진 빈자리를 찾음
function orSpot(r){ const cap=REGIONS[r*3]; const obs=[]; const add=(x,z,rad)=>obs.push([x,z,rad]);
  try{ const f=fgSpot(r); add(f.x,f.z,7); }catch(e){} try{ const g=gdSpot(r); add(g.x,g.z,7); }catch(e){} try{ const w=wdSpot(r); add(w.x,w.z,15); }catch(e){}
  const A=ALTARS[cap.id]; if(A){ add(A.trial.x,A.trial.z,6); if(A.shrine){ add(A.shrine.x,A.shrine.z,11); const dir=cap.z>0?-1:1, sx=cap.x>0?-1:1; add(A.shrine.x+sx*11,A.shrine.z+dir*20,5); } }
  add(cap.x+(cap.x>0?-18:18),cap.z+(cap.z>0?6:-6),9);
  const PR={house:6,church:9,prop:3,flag:2,market:4,castle:15}; PLACED.forEach(o=>{ if(o.realm===r&&PR[o.kind]&&Math.hypot(o.x-cap.x,o.z-cap.z)<75) add(o.x,o.z,PR[o.kind]); }); add(cap.x,cap.z,6); try{ TREEPOS.forEach(t=>{ const tx=t.x!=null?t.x:t[0], tz=t.z!=null?t.z:t[1]; if(Math.hypot(tx-cap.x,tz-cap.z)<70) add(tx,tz,3); }); }catch(e){}
  try{ const co=RC.courses[r]; add(co.S.x,co.S.z,8); co.rings.forEach(k=>{ if(Math.hypot(k.x-cap.x,k.z-cap.z)<70) add(k.x,k.z,4); }); }catch(e){}
  let best=null; for(let a=0;a<6.283;a+=.08) for(let d=18;d<=40;d+=2){ const x=cap.x+Math.cos(a)*d, z=cap.z+Math.sin(a)*d; if(Math.abs(x)>WORLD_HALF-10||Math.abs(z)>WORLD_HALF-10) continue; let m=99; obs.forEach(o=>{ m=Math.min(m,Math.hypot(x-o[0],z-o[1])-o[2]); }); const sc=Math.min(m,10)-Math.abs(d-30)*.08; if(!best||sc>best.sc) best={x,z,sc,m,d}; }
  return {x:best.x,z:best.z,m:best.m,d:best.d,rot:Math.atan2(cap.x-best.x,cap.z-best.z)}; }
/* ---------- 오늘의 문제 (날짜 씨앗 → 모든 폰이 같음) ---------- */
function orQuiz(day){ if(OR.cache&&OR.cache.day===day) return OR.cache.qs; const r=dgRng(day*131+71); const ri=n=>Math.floor(r()*n);
  const sh=a=>{ for(let i=a.length-1;i>0;i--){ const j=ri(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const opts=(pool,ans)=>{ const u=[...new Set(pool)].filter(x=>x!==ans); return sh([ans].concat(sh(u).slice(0,3))); };
  const RN=REALMS.map(R=>R.icon+" "+R.n); const eun=w=>`「${w}」${josa(w,"은","는")}`;
  const realmQ=(k,what,ex)=>({q:what,a:RN[k],c:RN.slice(),ex,ic:"🗿"});
  const T=[
   ()=>{ const k=ri(4), R=REALMS[k]; const L=R.gods.filter(g=>g.d); const g=L[ri(L.length)]; return {q:`「${g.d}」<br>이 이야기의 주인공은 누구일까요?`,a:g.n,c:opts(L.map(x=>x.n),g.n),ex:`${R.n}의 ${g.n} — ${g.d}`,ic:R.icon}; },
   ()=>{ const L=[]; REALMS.forEach(R=>R.skills.forEach(S=>L.push({S,R}))); const x=L[ri(L.length)]; return {q:`「${x.S.desc}」<br>이런 기술의 이름은?`,a:x.S.n,c:opts(L.map(y=>y.S.n),x.S.n),ex:`${x.R.n}의 기술 「${x.S.n}」 — ${x.S.desc}`,ic:"✨"}; },
   ()=>{ const k=ri(4), M=REALMS[k].mobs[ri(REALMS[k].mobs.length)]; return realmQ(k,`${eun(M.n)} 어느 세계의 괴물일까요?`,`${M.n}${josa(M.n,"은","는")} ${REALMS[k].n}의 땅에 살아요.`); },
   ()=>{ const k=ri(4), R=REALMS[k], b=ri(2)?R.worldBoss:R.boss; return realmQ(k,`무시무시한 ${eun(b.n)} 어느 세계의 보스일까요?`,`${b.n}(파워 ${b.p})${josa(b.n,"은","는")} ${R.n}의 ${b===R.worldBoss?"세계 보스":"보스"}예요.`); },
   ()=>{ const k=ri(4), R=REALMS[k]; const L=[[R.capital,"수도"],[R.respawn.n,"쓰러지면 다시 깨어나는 곳"],[R.regions[0],"땅"],[R.regions[1],"땅"]]; const x=L[ri(L.length)]; return realmQ(k,`${eun(x[0])} 어느 세계의 ${x[1]}일까요?`,`${x[0]}${josa(x[0],"은","는")} ${R.n}의 ${x[1]}이에요.${x[0]===R.respawn.n?" "+R.respawn.desc+".":""}`); },
   ()=>{ const k=ri(4), R=REALMS[k]; return realmQ(k,`체력을 채워 주는 ${eun(R.potion)} 어느 세계의 물약일까요?`,`${R.potion}${josa(R.potion,"은","는")} ${R.n}의 물약이에요.`); },
   ()=>{ const k=ri(4), R=REALMS[k]; return {q:`${R.n}의 닿을 수 없는 절대자는?`,a:R.absolute,c:opts(REALMS.map(x=>x.absolute),R.absolute),ex:`${R.absolute} — ${R.absoluteDesc}`,ic:R.icon}; },
   ()=>{ const k=ri(4), R=REALMS[k], i=ri(R.ranks.length-1); return {q:`${R.n}에서 「${R.ranks[i]}」 다음 계급은?`,a:R.ranks[i+1],c:opts(R.ranks.filter((x,j)=>j!==i),R.ranks[i+1]),ex:`${R.n}의 계급: ${R.ranks.join(" → ")}`,ic:R.icon}; },
   ()=>{ const k=ri(4), R=REALMS[k], s=["w","a","r"][ri(3)], it=R.items[s][ri(R.items[s].length)]; return realmQ(k,`보물 ${eun(it)} 어느 세계에서 나올까요?`,`${it}${josa(it,"은","는")} ${R.n}의 ${s==="w"?"무기":s==="a"?"갑옷":"유물"}이에요.`); },
   ()=>{ const k=ri(4), R=REALMS[k], i=ri(R.trials.length); return realmQ(k,`승급 시험에서 「${R.trials[i]}」${josa(R.trials[i],"을","를")} 만나는 세계는?`,`${R.n}의 ${i+2}번째 계급 「${R.ranks[i+1]}」 시험 상대가 ${R.trials[i]}예요.`); },
  ];
  const kinds=sh(T.map((f,i)=>i)).slice(0,3); const qs=kinds.map(i=>T[i]()); OR.cache={day,qs}; return qs; }
function orToday(){ const d=kday(); if(!G.orc||G.orc.d!==d) G.orc={d,a:[-1,-1,-1],ok:[0,0,0]}; return G.orc; }
function orDone(){ const o=orToday(); return o.a.every(x=>x>=0); }
function orOk(){ const o=orToday(); return o.ok.reduce((s,x)=>s+x,0); }
function orNeedRows(){ const o=orToday(); return o.a.filter(x=>x<0).length; }
function wisOn(){ return (G.wisB||0)>Date.now(); }
/* ---------- 고르기 ---------- */
function orAnswer(i,c){ const o=orToday(); if(o.a[i]>=0) return; const Q=orQuiz(o.d)[i]; o.a[i]=c; const ok=Q.c[c]===Q.a; o.ok[i]=ok?1:0;
  if(ok){ G.orcTot=(G.orcTot||0)+1; const g=10+G.lv*2; G.gold+=g; jingle([784,988,1175]); buzz(20); toast("⭕ 정답!",`금화 +${g}`,1.4); } else { tone(220,.18,"triangle",0,.1); buzz([30,40,30]); toast("❌ 아쉬워요",`정답은 「${Q.a}」`,1.8); }
  if(orDone()){ const n=orOk(); const lv=G.lv; const day=o.d;
    if(n===3){ G.wisB=Math.max(Date.now(),G.wisB||0)+10*60000; const g=100+lv*10; G.gold+=g; if(typeof fgGive==="function") fgGive(0,2,"",true); else G.rune=(G.rune||0)+2; G.orcSt=(G.orcLast===day-1?(G.orcSt||0):0)+1; G.orcLast=day; G.orcFull=(G.orcFull||0)+1; G.orcBest=Math.max(G.orcBest||0,G.orcSt);
      setTimeout(()=>{ try{ lvBanner("지혜의 축복!","🧠 3문제 모두 정답",`10분 동안 경험치 +15% · 금화 +${g} · 룬 가루 +2 · ${G.orcSt}일 연속`,"#9fd8ff"); }catch(e){} jingle([523,659,784,1046,1318,1568]); buzz([40,30,80]); const s=orNearest(); if(s){ fxRing(s.x,s.z,0x9fd8ff,10,1); fxSpark(s.x,5,s.z,0xcfeaff,40); } },350); }
    else if(n===2){ const g=50+lv*5; G.gold+=g; setTimeout(()=>toast("🗿 2문제 맞혔어요!",`금화 +${g} · 내일 또 도전해요`,2.6),400); G.orcSt=0; }
    else { setTimeout(()=>toast("🗿 오늘의 수수께끼 끝!","정답 이야기를 읽어 두면 내일 더 잘 맞힐 수 있어요",2.6),400); G.orcSt=0; }
    try{ net.pushProfile(1); }catch(e){} }
  saveGame(); showOracle(); }
/* ---------- 석상 모델 ---------- */
function orModel(r){ const g=new THREE.Group(); const eyes=[]; const marble=M.marble, gold=M.gold; const stone=mat({color:[0xf2ecdf,0x8e98a4,0xd9a066,0xd8be8a][r],roughness:.85});
  g.add(cyl(2.9,3.3,.6,M.stone,0,.3,0,24)); g.add(cyl(2.3,2.6,1.4,marble,0,1.3,0,24)); { const t=new THREE.Mesh(new THREE.TorusGeometry(2.45,.12,6,32),gold); t.position.y=2; t.rotation.x=Math.PI/2; g.add(t); }
  const eye=(x,y,z,s)=>{ const e=sph(s||.13,glowMat(0x7fd8ff,.35),x,y,z); e.userData.noOutline=true; e.userData.s0=e.scale.x; g.add(e); eyes.push(e); };
  if(r===0){ // 지혜의 천사: 날개 + 펼친 책 + 후광
    const robe=new THREE.Mesh(new THREE.ConeGeometry(1.25,3.4,16),stone); robe.position.y=3.7; g.add(robe); g.add(sph(.55,stone,0,5.75,0));
    [-1,1].forEach(s=>{ for(let f=0;f<3;f++){ const w=sph(.5,stone,s*(.75+f*.45),4.6+f*.35,-.45); w.scale.set(.5,2.1+f*.35,.22); w.rotation.z=s*(.55+f*.2); g.add(w); } });
    const book=new THREE.Group(); book.add(box(.9,.08,.7,gold,-.45,0,0)); book.add(box(.9,.08,.7,gold,.45,0,0)); book.children[0].rotation.z=.18; book.children[1].rotation.z=-.18; book.position.set(0,4.4,.95); g.add(book);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.62,.07,8,32),glowMat(0xffe9a0,.85)); halo.position.set(0,6.55,-.1); halo.rotation.x=-.3; halo.userData.noOutline=true; g.add(halo); g.userData.spin=halo; eye(-.19,5.82,.48,.09); eye(.19,5.82,.48,.09); }
  else if(r===1){ // 미미르의 머리: 지혜의 샘 위의 큰 머리 + 룬 돌
    const well=cyl(1.9,2.1,.7,M.rock||M.stone,0,2.35,0,20); g.add(well); const wg=new THREE.CircleGeometry(1.6,24); wg.setAttribute('sq',new THREE.BufferAttribute(new Float32Array(wg.attributes.position.count).fill(1),1)); const w=new THREE.Mesh(wg,M.water); w.rotation.x=-Math.PI/2; w.position.y=2.72; g.add(w);
    const head=sph(1.45,stone,0,4.4,0); head.scale.multiply(new THREE.Vector3(1,1.12,.95)); g.add(head); const beard=new THREE.Mesh(new THREE.ConeGeometry(1.1,2.2,12),mat({color:0xcfd6de,roughness:.9})); beard.rotation.x=Math.PI; beard.position.set(0,3.2,.65); g.add(beard);
    g.add(box(1.7,.28,.5,stone,0,4.95,1.2)); g.add(sph(.28,stone,0,4.35,1.42)); eye(-.48,4.62,1.3,.16); eye(.48,4.62,1.3,.16);
    for(let k=0;k<6;k++){ const a=k/6*6.283; const rs=box(.5,1.1,.28,M.stone,Math.cos(a)*2.6,2.4,Math.sin(a)*2.6); rs.rotation.y=-a; g.add(rs); const rn=box(.18,.5,.05,glowMat(0x8fe0ff,.7),Math.cos(a)*2.45,2.55,Math.sin(a)*2.45); rn.rotation.y=-a+Math.PI/2; rn.userData.noOutline=true; g.add(rn); } }
  else if(r===2){ // 가네샤: 코끼리 머리 · 큰 귀 · 긴 코 · 금관
    const body=sph(1.35,stone,0,3.6,0); body.scale.multiply(new THREE.Vector3(1.05,1,.9)); g.add(body); { const t=new THREE.Mesh(new THREE.TorusGeometry(1.05,.12,6,24),M.tgold||gold); t.position.y=3.9; t.rotation.x=Math.PI/2; g.add(t); }
    const head=sph(.95,stone,0,5.25,.15); g.add(head); [-1,1].forEach(s=>{ const ear=cyl(.85,.85,.1,stone,s*1.05,5.25,0,18); ear.rotation.z=Math.PI/2; ear.rotation.y=s*.35; g.add(ear); const tusk=new THREE.Mesh(new THREE.ConeGeometry(.08,.45,6),M.white||marble); tusk.position.set(s*.32,4.75,.9); tusk.rotation.x=1.9; g.add(tusk); });
    for(let k=0;k<5;k++){ const t=cyl(.24-k*.03,.26-k*.03,.45,stone,0,4.85-k*.36,1.05+Math.sin(k*.7)*.25+k*.06,10); t.rotation.x=.3-k*.2; g.add(t); }
    const crown=new THREE.Mesh(new THREE.ConeGeometry(.55,1,8),M.tgold||gold); crown.position.y=6.45; g.add(crown); { const gl=sph(.5,glowMat(0xffd080,.18),0,6.95,0); gl.userData.noOutline=true; g.add(gl); } eye(-.42,5.45,.82,.1); eye(.42,5.45,.82,.1);
    [-1,1].forEach(s=>{ const l=sph(.55,M.lotus||stone,s*1.6,2.15,1.2); l.scale.y=.4; g.add(l); }); }
  else { // 스핑크스: 엎드린 사자 몸 + 머리 수건
    const body=box(2.2,1.5,4.2,stone,0,2.75,-.6); g.add(body); g.add(box(2.4,.6,4.4,stone,0,2.25,-.6)); [-1,1].forEach(s=>{ g.add(box(.6,.5,1.8,stone,s*.75,2.25,1.8)); g.add(box(.62,.3,.4,stone,s*.75,2.2,2.75)); });
    g.add(box(1.4,1.6,1.2,stone,0,4.3,1.05)); const nem=new THREE.Mesh(new THREE.ConeGeometry(1.25,1.6,4),mat({color:0x3a6ea8,roughness:.6})); nem.rotation.y=Math.PI/4; nem.position.set(0,4.6,.75); nem.scale.set(1,1,.8); g.add(nem);
    g.add(box(1.25,1.25,.25,mat({color:0xd8be8a,roughness:.8}),0,4.3,1.68)); [-1,1].forEach(s=>g.add(box(.35,1.4,.5,mat({color:0x3a6ea8,roughness:.6}),s*.78,3.85,1.35))); g.add(box(.2,.6,.2,gold,0,3.35,1.72));
    eye(-.28,4.5,1.82,.1); eye(.28,4.5,1.82,.1); const tail=cyl(.07,.07,1.6,stone,1.1,2.4,-2.6,6); tail.rotation.z=1.2; g.add(tail); }
  g.userData.eyes=eyes; return g; }
(function(){ for(let r=0;r<4;r++){ const s=orSpot(r); const g=orModel(r); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); OR.spots[r]={x:s.x,z:s.z,g,r}; } })();
function orNear(){ if((typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)) return null; for(const s of OR.spots){ if(Math.hypot(P.x-s.x,P.z-s.z)<7) return s; } return null; }
function orNearest(){ let b=null,bd=1e9; OR.spots.forEach(s=>{ const d=Math.hypot(P.x-s.x,P.z-s.z); if(d<bd){ bd=d; b=s; } }); return b; }
/* ---------- 매 프레임 ---------- */
function orTick(dt){ if(!started) return; OR.t-=dt; const tn=performance.now()/1000; const full=orDone()&&orOk()===3;
  let near=null; OR.spots.forEach(s=>{ const d=Math.hypot(P.x-s.x,P.z-s.z); if(d>90) return; const u=s.g.userData; if(u.spin) u.spin.rotation.z+=dt*.9; const k=full?.75+Math.sin(tn*3+s.r)*.2:.25+Math.sin(tn*2)*.08; u.eyes.forEach(e=>{ e.material.opacity=k; e.scale.setScalar(e.userData.s0*(full?1.25:1)); }); if(full&&Math.random()<dt*1.5&&d<50) fxSpark(s.x+rnd(-1,1),5+rnd(0,1.5),s.z+rnd(-1,1),0xbfe8ff,3); if(d<40&&(!near||d<near.d)) near={s,d}; });
  if(!OR.lbl) OR.lbl=makeLabel("ally"); if(near&&!layerOpen&&!(typeof DS!=="undefined"&&DS.on)){ const left=orNeedRows(); placeLabel(OR.lbl,near.s.x,8,near.s.z,`🗿 ${OR_NAME[near.s.r]} <b>${left>0?`오늘의 수수께끼 ${3-left}/3 · 말을 걸어요!`:`오늘 ${orOk()}/3 정답${full?" · 🧠 지혜의 축복":""}`}</b>`); } else OR.lbl.style.display="none"; }
XTICK.push(orTick);
/* ---------- 창 ---------- */
function showOracle(){ const o=orToday(), qs=orQuiz(o.d); const near=orNear(); const s=near||OR.spots[Math.max(0,G.realm)]; const done=orDone(), n=orOk();
  const qh=qs.map((Q,i)=>{ const ans=o.a[i]>=0; return `<div class="orq${ans?(o.ok[i]?" ok":" no"):""}"><div class="qh"><b>${i+1}</b>${Q.ic&&Q.ic!=="🗿"?`<span class="qi">${Q.ic}</span>`:""}${Q.q}</div><div class="oropt">${Q.c.map((c,j)=>`<button class="buy alt${ans&&c===Q.a?" ok":""}${ans&&o.a[i]===j&&c!==Q.a?" no":""}" data-q="${i}" data-c="${j}" ${ans||!near?"disabled":""}>${c}</button>`).join("")}</div>${ans?`<p class="orex">${o.ok[i]?"⭕ 정답!":"❌ 정답은 「"+Q.a+"」"} · ${Q.ex}</p>`:""}</div>`; }).join("");
  const today=kday(); const kings=Object.values(typeof ROSTER!=="undefined"?ROSTER:{}).filter(p=>p.oq&&p.oq[0]===today&&p.oq[1]>=3&&p.i!==G.id).map(p=>p.n); if(done&&n===3) kings.unshift(G.name+" (나)");
  card(`<h2>🗿 ${OR_NAME[s.r]}의 수수께끼</h2><p>오늘의 문제 3개예요. 같은 방 모두에게 똑같은 문제가 나와요. <b>한 문제에 한 번만</b> 고를 수 있어요! 3개 다 맞히면 <b style="color:#9fd8ff">지혜의 축복</b>(10분 경험치 +15%) · 룬 가루 · 금화.</p>
   ${near?"":`<div class="row"><div class="ic">📍</div><div class="t"><div>석상 앞에서 풀 수 있어요</div><span>네 수도 광장마다 석상이 있어요(지도에 🗿)</span></div><button class="buy alt" id="orWay">길 안내</button></div>`}
   ${qh}
   <div class="idlegrid"><div><b>${n}/3</b><span>오늘 맞힌 문제${done?"":" · 남은 "+orNeedRows()+"개"}</span></div><div><b>${G.orcLast===today||G.orcLast===today-1?(G.orcSt||0):0}일</b><span>연속 모두 정답 · 7일이면 «신탁의 현자»</span></div></div>
   ${wisOn()?`<p style="color:#9fd8ff">🧠 지혜의 축복 ${Math.ceil(((G.wisB||0)-Date.now())/60000)}분 남음 (경험치 +15%)</p>`:""}
   <h3>🧠 오늘의 지혜왕 (3문제 모두 정답)</h3>${kings.length?`<p>${kings.join(" · ")}</p>`:'<p style="font-size:13px">아직 아무도 없어요. 첫 번째 지혜왕이 되어 보세요!</p>'}
   <p style="font-size:12px">문제는 한국 시간 밤 12시에 바뀌어요. 지금까지 맞힌 문제 ${fmt(G.orcTot||0)}개.</p>`);
  layers.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>orAnswer(+b.dataset.q,+b.dataset.c));
  if($("orWay")) $("orWay").onclick=()=>{ const t=OR.spots[Math.max(0,G.realm)]; setGuide({x:t.x,z:t.z+4,label:"🗿 지혜의 석상"}); closeLayer(); }; }
/* ---------- 경험치 · 캐릭터 정보 · 상황 버튼 · 칭호 ---------- */
(function(){ const _gx=gainXp; gainXp=function(n){ try{ if(n>0&&wisOn()) n=Math.round(n*1.15); }catch(e){} return _gx(n); };
  const _mp=myProfile; myProfile=function(on){ const p=_mp(on); try{ const o=G.orc; if(o&&o.d===kday()) p.oq=[o.d,orOk()]; }catch(e){} return p; }; })();
CTX_EXTRA.push(()=>{ const s=orNear(); return s?{t:orNeedRows()>0?"🗿 수수께끼 풀기":"🗿 지혜의 석상",f:showOracle}:null; });
TITLES.push({id:"or1",n:"지혜의 첫걸음",t:1,h:"석상 수수께끼 3문제 모두 맞히기",g:()=>[G.orcFull||0,1]},{id:"or7",n:"신탁의 현자",t:3,h:"7일 연속 3문제 모두 맞히기",g:()=>[G.orcBest||0,7]},{id:"or100",n:"걸어 다니는 신화 사전",t:2,h:"수수께끼 100문제 맞히기",g:()=>[G.orcTot||0,100]});
</script>
