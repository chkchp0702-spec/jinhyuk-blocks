<script>
/* ================= v22-1: 🎣 신화 낚시와 쉬는 동안 통발 (IDEAS G11/3-4) =================
   물가(수도 분수·연꽃 연못·호수)에서 「🎣 낚시」 → 찌가 쏙 들어가면 움직이는 막대가 초록 칸에 올 때 「당기기」.
   세계마다 물고기 6종 도감(별 1~5개·크기 기록). 통발을 던져 두면 게임을 꺼 둔 동안에도 물고기가 들어옴.
   "오늘 가장 큰 물고기"는 내 캐릭터 정보(fb)에 실려 친구 화면 낚시 창·모험가 명부에 보임. */
function kday(t){ return Math.floor(((t||Date.now())+9*3600000)/86400000); }   // 한국 날짜 번호
const FISH=[
 [["생명수 송사리",1,8,"🐟"],["꽃잎 붕어",1,16,"🐟"],["무지개 송어",2,32,"🐠"],["황금 잉어",3,48,"🐠"],["날개 달린 가오리",4,75,"🪽"],["빛나는 생명나무 물고기",5,95,"✨"]],
 [["얼음 빙어",1,10,"🐟"],["서리 대구",1,32,"🐟"],["얼음 연어",2,60,"🐠"],["룬 무늬 송어",3,52,"🐠"],["무지개다리 청어",4,42,"🌈"],["아기 요르문간드 장어",5,120,"🐍"]],
 [["연꽃 구피",1,6,"🐟"],["갠지스 메기",1,42,"🐟"],["망고빛 잉어",2,36,"🐠"],["마츠야 물고기",3,64,"🐠"],["코끼리 코 물고기",4,50,"🐘"],["황금 마카라",5,110,"🐊"]],
 [["올리브 정어리",1,12,"🐟"],["파도 고등어",1,36,"🐟"],["은빛 해마",2,20,"🦄"],["삼지창 황새치",3,92,"🐠"],["세이렌 비늘 돔",4,44,"🧜"],["아기 히포캄포스",5,100,"🐴"]] ];
const FISH_W={1:30,2:20,3:10,4:4,5:1.6};
const STARC=["","#9fb0c8","#5fd0ff","#3a8dff","#b061ff","#ffcf4a"];
const FS={spots:null,near:null,game:null};
function fishSpots(){ if(FS.spots) return FS.spots; const L=[]; try{ scene.updateMatrixWorld(true); const v=new THREE.Vector3(), sc=new THREE.Vector3();
  scene.traverse(o=>{ if(!o.isMesh||(o.material!==WATER&&o.material!==M.water)) return; if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.getWorldPosition(v); o.getWorldScale(sc); if(Math.abs(v.x)>WORLD_HALF||Math.abs(v.z)>WORLD_HALF) return; const r=o.geometry.boundingSphere.radius*Math.max(sc.x,sc.z); if(r<1.5||r>60) return; L.push({x:v.x,z:v.z,r}); }); }catch(e){ console.warn(e); }
  FS.spots=L; return L; }
function fishRealmAt(x,z){ return x>=0?(z<0?0:2):(z<0?1:3); }
function nearWater(){ if(Math.abs(P.x)>WORLD_HALF||Math.abs(P.z)>WORLD_HALF) return null; let best=null,bd=1e9; fishSpots().forEach(s=>{ const d=Math.hypot(P.x-s.x,P.z-s.z)-s.r; if(d<3.2&&d<bd){ bd=d; best=s; } }); return best; }
function fishRoll(r,maxStar){ const L=FISH[r].map((f,i)=>({i,w:f[1]<=(maxStar||5)?FISH_W[f[1]]:0})); let s=L.reduce((a,b)=>a+b.w,0)*Math.random(); for(const x of L){ s-=x.w; if(s<=0) return x.i; } return 0; }
function fishSize(f){ return Math.round(f[2]*(.7+Math.random()*.8)*(Math.random()<.06?1.35:1)); }
function fishRecord(r,i,cm){ G.fish=G.fish||{}; const k=r+":"+i; const o=G.fish[k]||{n:0,b:0}; const isNew=!o.n, rec=cm>o.b&&o.n>0; o.n++; o.b=Math.max(o.b,cm); G.fish[k]=o; G.fishN=(G.fishN||0)+1;
  const f=FISH[r][i]; if(f[1]>=5) G.fish5=(G.fish5||0)+1; const d=kday(); if(!G.fishBest||G.fishBest.d!==d||cm>G.fishBest.cm) G.fishBest={d,n:f[0],cm,s:f[1],r}; return {isNew,rec}; }
function fishDex(){ return Object.keys(G.fish||{}).length; }
/* ---------- 낚시 놀이 ---------- */
function startFish(){ const w=nearWater(); if(!w){ toast("물가로 가 보세요","수도 분수·연꽃 연못·호숫가에서 낚시할 수 있어요",2.2); return; } if(P.dead) return;
  if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<14)){ toast("괴물이 가까이 있어요!","싸움이 끝나면 낚시해요",1.8); return; }
  P.rot=Math.atan2(w.x-P.x,w.z-P.z); const r=fishRealmAt(w.x,w.z); const i=fishRoll(r); const f=FISH[r][i];
  const G0={r,i,f,phase:"wait",t:1.4+Math.random()*3,hits:0,need:1+(f[1]>=3?1:0)+(f[1]>=5?1:0),miss:0,pos:0,dir:1,spd:.55+f[1]*.13,zw:Math.max(.16,.36-f[1]*.035),zc:.5,last:performance.now()};
  FS.game=G0; fxRing(w.x+(P.x-w.x)*.3,w.z+(P.z-w.z)*.3,0xbfe8ff,2,.6); tone(520,.08,"sine");
  card(`<h2>🎣 낚시</h2><p id="fsMsg">찌를 던졌어요… 찌를 잘 보다가 <b>쏙!</b> 들어가면 당겨요</p>
    <div class="fsbob" id="fsBob">🎈</div>
    <div class="fstrack" id="fsTrack"><i class="zone" id="fsZone"></i><i class="mark" id="fsMark"></i></div>
    <div class="fshits" id="fsHits"></div>
    <button class="go" id="fsPull" style="align-self:center;font-size:20px;padding:12px 30px">당기기!</button>`);
  const cls=$("cls"); cls.onclick=()=>{ FS.game=null; closeLayer(); };
  $("fsPull").addEventListener("pointerdown",e=>{ e.preventDefault(); fishPull(); });
  fishDraw(); requestAnimationFrame(fishLoop); }
function fishDraw(){ const g=FS.game; if(!g||!$("fsTrack")) return; const z=$("fsZone"), m=$("fsMark"); z.style.left=((g.zc-g.zw/2)*100)+"%"; z.style.width=(g.zw*100)+"%"; m.style.left=(g.pos*100)+"%";
  $("fsTrack").style.opacity=g.phase==="bite"?1:.35; $("fsHits").innerHTML=g.phase==="bite"?Array.from({length:g.need},(_,k)=>k<g.hits?"🟢":"⚪").join(" ")+(g.miss?` · 놓침 ${g.miss}/2`:""):""; }
function fishLoop(){ const g=FS.game; if(!g||!$("fsTrack")){ FS.game=null; return; } const now=performance.now(), dt=Math.min(.05,(now-g.last)/1000); g.last=now;
  if(g.phase==="wait"){ g.t-=dt; const b=$("fsBob"); if(b) b.style.transform=`translateY(${Math.sin(now/260)*4}px)`; if(g.t<=0){ g.phase="bite"; $("fsMsg").innerHTML=`<b style="color:#9dffb8;font-size:20px">쏙! 걸렸다!</b><br>움직이는 막대가 <b style="color:#3fd27a">초록 칸</b>에 올 때 당기기!`; if($("fsBob")) $("fsBob").textContent="💦"; tone(880,.08,"square"); buzz(40); } }
  else if(g.phase==="bite"){ g.pos+=g.dir*g.spd*dt; if(g.pos>1){ g.pos=1; g.dir=-1; } if(g.pos<0){ g.pos=0; g.dir=1; } }
  fishDraw(); if(g.phase!=="done") requestAnimationFrame(fishLoop); }
function fishPull(){ const g=FS.game; if(!g) return;
  if(g.phase==="wait"){ g.t+=.8; $("fsMsg").innerHTML="아직이에요! 찌가 <b>쏙</b> 들어갈 때까지 기다려요"; tone(300,.06); return; }
  if(g.phase!=="bite") return; const ok=Math.abs(g.pos-g.zc)<=g.zw/2;
  if(ok){ g.hits++; tone(660+g.hits*120,.08,"triangle"); buzz(25); if(g.hits>=g.need){ g.phase="done"; fishCaught(g); return; } g.zc=.2+Math.random()*.6; g.spd*=1.12; $("fsMsg").innerHTML=`좋아요! <b>${g.need-g.hits}번</b> 더!`; }
  else { g.miss++; tone(220,.12,"sawtooth"); buzz(60); if(g.miss>=2){ g.phase="done"; $("fsMsg").innerHTML=`앗, <b>${g.f[1]>=3?"큰 ":""}물고기</b>가 도망갔어요…`; $("fsPull").textContent="다시 던지기"; $("fsPull").onclick=null; $("fsPull").addEventListener("pointerdown",e=>{ e.preventDefault(); startFish(); },{once:true}); fishDraw(); return; } $("fsMsg").innerHTML="빗나갔어요! 한 번만 더 놓치면 도망가요"; } fishDraw(); }
function fishCaught(g){ const f=g.f, cm=fishSize(f); const rec=fishRecord(g.r,g.i,cm); const gold=Math.round(5+f[1]*f[1]*5+G.lv*1.5), xp=Math.round(8*f[1]+G.lv*2.5); G.gold+=gold; gainXp(xp);
  let deco=null; if(f[1]>=4&&typeof hmGift==="function") deco=hmGift(f[1]>=5?2:1,"물고기 배 속에서");
  saveGame(); try{ net.pushProfile(1); }catch(e){} jingle(f[1]>=4?[523,659,784,1046,1318,1568]:[659,784,1046]); fxSpark(P.x,1.5,P.z,parseInt(STARC[f[1]].slice(1),16),20+f[1]*8); if(f[1]>=4){ fxRing(P.x,P.z,0xffd76a,8,.8); }
  card(`<h2>🎣 잡았다!</h2><div class="fishbig" style="--c:${STARC[f[1]]}"><em>${f[3]}</em><b>${f[0]}</b><span>${"★".repeat(f[1])}${"☆".repeat(5-f[1])} · ${cm}cm</span></div>
   ${rec.isNew?'<p style="color:#9dffb8"><b>새 물고기!</b> 도감에 적었어요</p>':rec.rec?'<p style="color:#ffcf4a"><b>기록 경신!</b> 가장 큰 크기</p>':""}
   <p>금화 +${gold} · 경험치 +${xp}${deco?` · 🏡 장식 <b>${deco}</b>!`:""}</p>
   <div class="exgrid"><button class="buy" id="fsAgain">또 낚기</button><button class="buy alt" id="fsDex">도감 보기</button></div>`);
  $("fsAgain").onclick=startFish; $("fsDex").onclick=showFish; FS.game=null; }
/* ---------- 통발 ---------- */
const TRAP_MAX_H=12;
function trapHours(){ return G.trap?Math.min(TRAP_MAX_H,(Date.now()-G.trap.t0)/3600000):0; }
function trapSet(){ const w=nearWater(); if(!w){ toast("통발은 물가에서 던져요"); return; } if(G.trap){ toast("통발은 하나만 둘 수 있어요"); return; } G.trap={t0:Date.now(),r:fishRealmAt(w.x,w.z)}; saveGame(); tone(440,.1); fxRing(w.x,w.z,0xbfe8ff,4,.8); toast("🪤 통발을 던졌어요!","게임을 꺼 둬도 물고기가 들어와요 (최대 12시간)",2.6); showFish(); }
function trapClaim(){ const h=trapHours(); if(!G.trap) return; if(h<1/6){ toast("아직 비어 있어요","10분은 지나야 물고기가 들어와요",2); return; } const r=G.trap.r; const n=Math.min(30,Math.max(1,Math.floor(h*2.5)));
  const got={}; let gold=0, best=null; for(let k=0;k<n;k++){ const i=fishRoll(r,h>=6&&Math.random()<.05?4:3); const f=FISH[r][i]; const cm=fishSize(f); fishRecord(r,i,cm); got[i]=(got[i]||0)+1; gold+=3+f[1]*f[1]*3; if(!best||f[1]>best.f[1]) best={f,cm}; }
  gold=Math.round(gold+G.lv*n*.4); G.gold+=gold; const snack=Math.floor(h/2); let pet=null; if(snack>0&&typeof petGain==="function"&&G.pet>=0&&G.pets&&G.pets[G.pet]){ const lv0=G.pets[G.pet].lv; petGain(snack*6); pet={n:PETS[G.pet].n,lv0,lv:G.pets[G.pet].lv}; }
  G.trap=null; G.trapN=(G.trapN||0)+1; saveGame(); try{ net.pushProfile(1); }catch(e){} jingle([523,659,784,1046]);
  card(`<h2>🪤 통발을 걷었어요!</h2><p>${fmtDur(h*60)} 동안 ${REALMS[r].n} 물가에서 <b style="color:var(--gold)">${n}마리</b>가 들어왔어요.</p>
   <div class="diary">${Object.keys(got).map(i=>`<p>${FISH[r][i][3]} ${FISH[r][i][0]} <b style="color:${STARC[FISH[r][i][1]]}">${"★".repeat(FISH[r][i][1])}</b> × ${got[i]}</p>`).join("")}</div>
   <div class="idlegrid"><div><b>+${fmt(gold)}</b><span>금화</span></div><div><b>${snack}</b><span>신수 간식</span></div></div>
   ${pet?`<p>🐣 ${pet.n}에게 간식을 줬어요${pet.lv>pet.lv0?` · Lv.${pet.lv0} → ${pet.lv}`:""}</p>`:snack?'<p style="font-size:12px">짝꿍 신수가 있으면 간식으로 자라요</p>':""}
   <button class="buy" id="trOk" style="align-self:center">좋아요!</button>`); $("trOk").onclick=closeLayer; }
/* ---------- 도감·오늘의 가장 큰 물고기 ---------- */
function fishBoard(){ const d=kday(); const list=[]; if(G.fishBest&&G.fishBest.d===d) list.push({n:G.name,r:G.realm,f:G.fishBest,me:1});
  for(const id in ROSTER){ const p=ROSTER[id]; if(p.fb&&p.fb[3]===d) list.push({n:p.n,r:p.r,f:{n:p.fb[0],cm:p.fb[1],s:p.fb[2]}}); }
  return list.sort((a,b)=>b.f.cm-a.f.cm).slice(0,6); }
function showFish(){ G.fish=G.fish||{}; const w=nearWater(); const h=trapHours();
  const dex=FISH.map((L,r)=>`<h3>${REALMS[r].icon} ${REALMS[r].n}의 물고기</h3><div class="fishgrid">${L.map((f,i)=>{ const o=G.fish[r+":"+i]; return `<div class="${o?"":"no"}" style="--c:${STARC[f[1]]}"><em>${o?f[3]:"❔"}</em><b>${o?f[0]:"???"}</b><span>${"★".repeat(f[1])}${o?` · 최고 ${o.b}cm · ${o.n}마리`:""}</span></div>`; }).join("")}</div>`).join("");
  const bd=fishBoard().map((x,k)=>`<div class="row"><div class="ic">${k===0?"🥇":k===1?"🥈":k===2?"🥉":k+1}</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>${x.f.n} · <b style="color:${STARC[x.f.s]}">${"★".repeat(x.f.s)}</b> · ${x.f.cm}cm</span></div></div>`).join("");
  card(`<h2>🎣 낚시 · 물고기 도감</h2><p>모은 물고기 <b style="color:var(--gold)">${fishDex()}/24</b> · 잡은 수 ${fmt(G.fishN||0)}마리<br>수도 분수·연꽃 연못·호숫가에 가면 「🎣 낚시」 버튼이 나와요.</p>
   ${w?'<button class="go" id="fsGo" style="align-self:center">🎣 여기서 낚시하기</button>':""}
   <div class="row"><div class="ic">🪤</div><div class="t"><div>통발 ${G.trap?`(${REALMS[G.trap.r].n} 물가)`:""}</div><span>${G.trap?`${fmtDur(h*60)}째 · 약 ${Math.min(30,Math.floor(h*2.5))}마리 들어 있어요${h>=TRAP_MAX_H?" · 가득 찼어요!":""}`:"물가에서 던져 두면 게임을 꺼 둔 동안에도 물고기가 들어와요(최대 12시간). 신수 간식도!"}</span>${G.trap?`<span class="tbar"><i style="width:${Math.round(h/TRAP_MAX_H*100)}%"></i></span>`:""}</div>${G.trap?'<button class="buy" id="trGet">걷기</button>':w?'<button class="buy" id="trSet">던지기</button>':""}</div>
   <h3>🏆 오늘 가장 큰 물고기</h3>${bd||'<p style="font-size:13px">오늘은 아직 아무도 못 잡았어요. 1등을 노려 보세요!</p>'}${dex}`);
  if($("fsGo")) $("fsGo").onclick=startFish; if($("trSet")) $("trSet").onclick=trapSet; if($("trGet")) $("trGet").onclick=trapClaim; }
/* ---------- 칭호 ---------- */
TITLES.push({id:"fish30",n:"강태공",t:1,h:"물고기 30마리 잡기",g:()=>[G.fishN||0,30]},{id:"fishdex",n:"물고기 박사",t:2,h:"물고기 도감 16칸 모으기",g:()=>[fishDex(),16]},{id:"fish5",n:"전설의 낚시꾼",t:3,h:"별 5개 물고기 잡기",g:()=>[G.fish5||0,1]});
</script>
