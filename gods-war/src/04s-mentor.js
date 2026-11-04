<script>
/* ================= v42-2: 🌱 새싹과 길잡이 — 처음 온 사람 도와주기 (IDEAS G11/4-8) =================
   새싹 = 아직 첫 승급 전(계급 1단계). 이름표에 🌱. 길잡이 = 세 번째 계급 이상.
   새싹과 길잡이가 12걸음 안에 있으면 「함께」 → 둘 다 경험치 +20%. 함께한 시간은 새싹 폰이 길잡이마다 셈(G.mtPal).
   함께일 때 화면 아래에 정해진 말 버튼(따라와!·여기 보물!·물약 먹어!·잘했어!…) → 글자를 치지 않아도 모르는 사람과 안전하게 도움을 주고받음.
   새싹이 첫 승급 시험을 통과하면 졸업! 1분 넘게 함께한 길잡이마다 보관(retained) mt/<길잡이id>/<새싹id> 를 남김
   → 길잡이가 켜져 있으면 바로, 꺼져 있으면 다음 접속 때 「길잡이 별」 + 상자. 새싹도 졸업 상자.
   길잡이 별 수는 인사(hello ms)에 실려 이름표에 🧭숫자로 보임. 칭호: 새싹 졸업생 · 친절한 길잡이 · 빛의 길잡이. */
const MT_NEAR=12, MT_NEED=60;
const MT_SAY=["따라와!","여기 보물!","물약 먹어!","조심해!","잘했어!","고마워!"];
const MT={t:0,pals:[],seen:{},hintT:0,bar:null,barOn:false,fxT:0,saveT:0,queue:[]};
function mtSprout(rank){ return rank===0; }
function mtGuide(rank){ return rank>=2; }
function mtRole(){ if(G.realm<0) return ""; return mtSprout(G.rank)?"sprout":mtGuide(G.rank)?"guide":""; }
function mtStars(){ return G.mtStar||0; }
function mtStarTag(n){ return n>0?`<span class="mtb${n>=5?" gold":""}">${n>=5?"✨":""}🧭${n}</span>`:""; }
function mtPeerTag(o){ return (mtSprout(o.rank)?'<span class="mtb sp">🌱</span>':"")+mtStarTag(o.ms||0); }
function mtMyTag(){ if(G.realm<0) return ""; return (mtSprout(G.rank)?'<span class="mtb sp">🌱 새싹</span>':"")+mtStarTag(mtStars()); }
function mtPair(o){ const me=mtRole(); if(!me||!o||o.dead) return false; return me==="sprout"?mtGuide(o.rank):mtSprout(o.rank); }
/* ---------- 매 프레임 ---------- */
function mtTick(dt){ if(!started||G.realm<0) return; MT.t-=dt; MT.hintT-=dt; MT.saveT-=dt;
  if(MT.t<=0){ MT.t=.5; const role=mtRole(); const pals=[]; const far=[];
    if(role&&!P.dead){ for(const id in PEERS){ const o=PEERS[id]; if(!mtPair(o)) continue; const d=Math.hypot(o.x-P.x,o.z-P.z); if(d<MT_NEAR) pals.push(o); else if(d<90) far.push(o); } }
    const was=MT.pals.length; MT.pals=pals;
    if(pals.length){ if(role==="sprout"){ G.mtPal=G.mtPal||{}; pals.forEach(o=>{ const p=G.mtPal[o.id]||(G.mtPal[o.id]={n:o.name,r:o.realm,s:0}); const s0=p.s; p.n=o.name; p.s+=.5; if(s0<MT_NEED&&p.s>=MT_NEED) toast(`🧭 ${o.name}님이 내 길잡이가 되었어요!`,"첫 승급을 하면 둘 다 졸업 상자를 받아요",3); }); }
      else { G.mtSec=(G.mtSec||0)+.5; }
      if(!was){ toast(role==="sprout"?`🌱 길잡이 ${pals.map(o=>o.name).join(", ")}님과 함께!`:`🧭 새싹 ${pals.map(o=>o.name).join(", ")}님과 함께!`,"함께 있는 동안 둘 다 경험치 +20%",2.4); jingle([659,880,1046]); }
      if(MT.saveT<=0){ MT.saveT=10; saveGame(); } }
    if(!pals.length&&far.length&&MT.hintT<=0){ const nw=far.filter(o=>!MT.seen[o.id]); if(nw.length){ nw.forEach(o=>MT.seen[o.id]=1); MT.hintT=60;
      if(role==="sprout") toast(`🧭 근처에 길잡이 ${far.length}명이 있어요!`,`${far.map(o=>o.name).slice(0,3).join(", ")} — 가까이 가서 「따라와!」 말을 걸어 봐요`,3.4);
      else toast(`🌱 근처에 새싹 ${far.length}명이 있어요!`,`${far.map(o=>o.name).slice(0,3).join(", ")} — 함께 싸우면 둘 다 경험치 +20% · 졸업하면 길잡이 별`,3.4); } }
    if(MT.queue.length&&!layerOpen&&!P.dead) mtShowStar(MT.queue.shift()); }
  // 함께일 때: 발밑에 작은 초록 빛 · 말 버튼
  if(MT.pals.length){ MT.fxT-=dt; if(MT.fxT<=0){ MT.fxT=2.6; fxRing(P.x,P.z,0x7affb0,3.2,.5); MT.pals.forEach(o=>fxSpark((P.x+o.x)/2,1.6,(P.z+o.z)/2,0x9dffb8,4)); } }
  mtBar(MT.pals.length>0&&!layerOpen&&!P.dead); }
XTICK.push(mtTick);
function mtBar(on){ if(!MT.bar){ const b=document.createElement("div"); b.id="mtBar"; b.hidden=true; b.innerHTML=`<span class="mth">🌱🧭</span>`+MT_SAY.map((m,i)=>`<button type="button" data-m="${i}">${m}</button>`).join(""); document.body.appendChild(b); MT.bar=b;
    b.querySelectorAll("button").forEach(x=>x.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); const m=MT_SAY[+x.dataset.m]; try{ net.send({t:"say",m}); net.chat(G.name,m,G.realm); }catch(er){} G.mtSay=(G.mtSay||0)+1; x.classList.remove("hit"); void x.offsetWidth; x.classList.add("hit"); })); b.addEventListener("pointerdown",e=>e.stopPropagation()); }
  if(MT.barOn!==on){ MT.barOn=on; MT.bar.hidden=!on; } }
/* ---------- 경험치 +20% · 졸업 ---------- */
(function(){ const _gx=gainXp; gainXp=function(n){ try{ if(n>0&&MT.pals.length) n=Math.round(n*1.2); }catch(e){} return _gx(n); };
  const _ft=finishTrial; finishTrial=function(win){ const r0=G.rank; _ft(win); try{ if(win&&r0===0&&G.rank>=1) setTimeout(mtGraduate,2600); }catch(e){ console.warn(e); } }; })();
function mtGraduate(){ if(G.mtGrad) return; const pal=G.mtPal||{}; const list=Object.keys(pal).filter(id=>pal[id].s>=MT_NEED).map(id=>Object.assign({id},pal[id])); G.mtGrad=list.length?2:1;
  if(!list.length){ saveGame(); toast("🌱 새싹을 졸업했어요!","이제 다음 계급까지 오르면 새싹들의 길잡이가 될 수 있어요",3.2); return; }
  const lv=G.lv, gold=200+lv*20; G.gold+=gold; G.pots+=3; const tier=1; const s=pick(["w","a","r"]); G.bag.push({s,t:tier}); gainXp(150+lv*25); saveGame();
  list.forEach(p=>{ try{ net.pushRet("mt/"+p.id+"/"+G.id,{i:G.id,n:G.name,r:G.realm,s:Math.round(p.s),t:Date.now()}); }catch(e){} });
  card(`<h2>🎓 새싹 졸업!</h2><p>첫 승급을 해냈어요! 함께해 준 길잡이에게 <b style="color:var(--gold)">길잡이 별</b>이 전해져요(꺼져 있어도 다음에 켜면 받아요).</p>
   ${list.map(p=>`<div class="row"><div class="ic" style="color:${REALMS[p.r]?REALMS[p.r].c1:"#fff"}">🧭</div><div class="t"><div>${p.n}</div><span>함께한 시간 ${fmtDur(p.s/60)}</span></div></div>`).join("")}
   <h3>🎁 졸업 상자</h3><div class="idlegrid"><div><b>+${fmt(gold)}</b><span>금화</span></div><div><b>${rarTag(tier)}</b><span>${itemName(s,tier)}</span></div><div><b>+3</b><span>${RM().potion}</span></div><div><b>🎓</b><span>칭호 «새싹 졸업생»</span></div></div>
   <p style="font-size:12px">나중에 세 번째 계급이 되면 나도 길잡이가 되어 새싹을 도울 수 있어요.</p><button class="buy" id="mtOk" style="align-self:center">고마워요!</button>`);
  $("mtOk").onclick=closeLayer; jingle([523,659,784,1046,1318,1568]); buzz([40,30,80]); try{ fxPillar(0x7affb0,1,HIGH()?36:20,1.8,.4); }catch(e){} }
NETX.push({sub:()=>"mt/"+G.id+"/+",pre:"mt/",f:(d,topic)=>{ if(!d||!d.i||!d.n||topic.indexOf("mt/"+G.id+"/")!==0||d.i===G.id) return; G.mtGot=G.mtGot||{}; if(G.mtGot[d.i]) return;
  G.mtGot[d.i]={n:d.n,r:d.r,t:d.t||Date.now()}; G.mtStar=(G.mtStar||0)+1; const lv=G.lv, gold=300+lv*15; G.gold+=gold; if(typeof fgGive==="function") fgGive(3,2,"",true); else { G.ore=(G.ore||0)+3; G.rune=(G.rune||0)+2; } gainXp(200+lv*20); saveGame();
  try{ net.hello(); }catch(e){} MT.queue.push({n:d.n,r:d.r,gold}); }});
function mtShowStar(q){ const n=mtStars(); card(`<h2>🌟 길잡이 별!</h2><p>새싹 <b style="color:${REALMS[q.r]?REALMS[q.r].c1:"#fff"}">${q.n}</b>님이 첫 승급을 해냈어요! 함께 도와준 덕분이에요.</p>
   <div class="idlegrid"><div><b>🧭 ${n}</b><span>내 길잡이 별</span></div><div><b>+${fmt(q.gold)}</b><span>금화 · 쇳조각 3 · 룬 가루 2</span></div></div>
   <p style="font-size:13px">길잡이 별은 내 이름표에 🧭${n}로 보여요. 5개면 금빛 ✨ · 칭호 «빛의 길잡이».</p><button class="buy" id="mtOk" style="align-self:center">좋아요!</button>`);
  $("mtOk").onclick=closeLayer; jingle([784,988,1175,1568,2093]); buzz([30,30,60]); try{ fxRing(P.x,P.z,0xffe27a,10,1); fxRiseDust(0xfff2b0,HIGH()?40:18,1.6); }catch(e){} }
/* ---------- 창 ---------- */
function showMentor(){ const role=mtRole(); const pal=G.mtPal||{}; const got=G.mtGot||{};
  const palRows=Object.keys(pal).sort((a,b)=>pal[b].s-pal[a].s).slice(0,8).map(id=>{ const p=pal[id]; const ok=p.s>=MT_NEED; return `<div class="row"><div class="ic" style="color:${REALMS[p.r]?REALMS[p.r].c1:"#fff"}">🧭</div><div class="t"><div>${p.n}${PEERS[id]?' <i class="st on">접속 중</i>':""}</div><span>함께한 시간 ${fmtDur(p.s/60)} ${ok?'· <b style="color:#9dffb8">내 길잡이 ✓</b>':`· 1분 넘게 함께하면 내 길잡이`}</span>${ok?"":`<span class="tbar"><i style="width:${Math.round(Math.min(1,p.s/MT_NEED)*100)}%"></i></span>`}</div></div>`; }).join("");
  const gotRows=Object.keys(got).sort((a,b)=>got[b].t-got[a].t).slice(0,10).map(id=>{ const p=got[id]; return `<div class="row"><div class="ic">🎓</div><div class="t"><div>${p.n}</div><span>${REALMS[p.r]?REALMS[p.r].n:""} · 졸업을 도왔어요</span></div></div>`; }).join("");
  const now=Object.values(PEERS).filter(o=>mtPair(o)).map(o=>`${o.name}(${Math.round(Math.hypot(o.x-P.x,o.z-P.z))}m)`);
  card(`<h2>🌱 새싹과 길잡이</h2><p>처음 온 사람(첫 승급 전)은 <b>🌱 새싹</b>, 세 번째 계급부터는 <b>🧭 길잡이</b>가 될 수 있어요. 새싹과 길잡이가 <b>12걸음 안</b>에서 함께 다니면 <b style="color:#9dffb8">둘 다 경험치 +20%</b>! 함께일 때는 화면 아래에 정해진 말 버튼이 떠서 글자를 치지 않아도 도와줄 수 있어요.</p>
   <div class="idlegrid"><div><b>${role==="sprout"?"🌱 새싹":role==="guide"?"🧭 길잡이":"🌿 수련생"}</b><span>${role==="sprout"?"첫 승급을 하면 졸업!":role==="guide"?"새싹을 도와 졸업시키면 별":`${RM().ranks[2]}부터 길잡이`}</span></div><div><b>🧭 ${mtStars()}</b><span>내 길잡이 별 · 5개면 «빛의 길잡이»</span></div></div>
   ${now.length?`<p>지금 근처: ${now.join(" · ")}${MT.pals.length?' · <b style="color:#9dffb8">함께하는 중!</b>':""}</p>`:`<p style="font-size:13px">지금 근처에 ${role==="sprout"?"길잡이":"새싹"}가 없어요. 모험가 명부에서 누가 접속했는지 볼 수 있어요.</p>`}
   ${role==="sprout"?`<h3>🧭 나를 도와준 길잡이</h3>${palRows||'<p style="font-size:13px">아직 없어요. 이름 옆에 🧭가 있는 높은 계급 모험가 곁에서 함께 싸워 봐요!</p>'}`:""}
   ${role!=="sprout"?`<h3>🎓 내가 졸업시킨 새싹</h3>${gotRows||'<p style="font-size:13px">아직 없어요. 이름 옆에 🌱가 있는 새싹을 찾아 함께 싸워 주세요!</p>'}`:""}
   <h3>💬 정해진 말</h3><p style="font-size:13px">${MT_SAY.join(" · ")}</p>`); }
TITLES.push({id:"mtg",n:"새싹 졸업생",t:1,h:"길잡이와 함께 다니다가 첫 승급하기",g:()=>[G.mtGrad===2?1:0,1]},{id:"mt1",n:"친절한 길잡이",t:1,h:"새싹 1명의 졸업 돕기 (길잡이 별 1개)",g:()=>[mtStars(),1]},{id:"mt5",n:"빛의 길잡이",t:3,h:"길잡이 별 5개 모으기",g:()=>[mtStars(),5]});
</script>
