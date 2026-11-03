<script>
/* ================= v19-2: 🧭 형제 원정대 (IDEAS G11/3-2) =================
   짝꿍 신수를 원정(30분·4시간·8시간)에 보냄 → 게임을 꺼 둬도 시간이 흐름 → 돌아오면 보물 + 원정 그림일기.
   친구가 같은 곳·같은 시간 원정에 신수를 보내면(시작 시각이 원정 시간의 절반 안) "원정대" → 보물 2배.
   각자 원정 정보를 중계 서버에 보관(retained) …/x/<id> → 꺼져 있는 친구의 원정도 보임. */
const EXPS=[
 {n:"생명나무 뿌리 동굴",realm:0,ic:"🌳",ev:["{p}이(가) 반짝이는 생명나무 뿌리 사이로 기어 들어갔어요.","길 잃은 영혼을 만나 금빛 날개로 길을 비춰 줬어요.","천사의 깃털 더미 속에서 낮잠을 잤어요.","뿌리 끝에서 황금 열매가 열린 비밀 방을 찾았어요!","무너진 천사의 문을 지나 반짝이는 보물 상자를 발견했어요!"]},
 {n:"요툰하임 얼음 동굴",realm:1,ic:"🧊",ev:["{p}이(가) 미끄러운 얼음 언덕을 썰매처럼 타고 내려갔어요.","서리 늑대 무리를 만났지만 꼬리를 흔들며 친구가 됐어요.","얼음 속에 갇힌 룬 돌을 콕콕 쪼아 꺼냈어요.","트롤이 코를 골며 자는 사이 살금살금 지나갔어요.","얼음 동굴 맨 끝에서 드워프가 숨긴 금화 더미를 찾았어요!"]},
 {n:"황금 연꽃 숲",realm:2,ic:"🪷",ev:["{p}이(가) 커다란 연꽃잎 위를 퐁퐁 뛰어다녔어요.","나가 뱀이 낸 수수께끼를 맞혀서 길을 열었어요.","코끼리 신 가네샤의 달콤한 과자를 나눠 먹었어요.","원숭이들과 나무 꼭대기에서 망고 따기 시합을 했어요.","숲 한가운데 황금 연꽃 아래에서 반짝이는 보석을 찾았어요!"]},
 {n:"다이달로스의 미로",realm:3,ic:"🏛",ev:["{p}이(가) 빙글빙글 미로에서 실타래를 따라 걸었어요.","하르피이가 깃털을 떨어뜨리고 도망갔어요.","키클롭스의 커다란 신발 속에서 숨바꼭질을 했어요.","날개 달린 샌들을 신고 미로 벽 위로 날아올랐어요!","미로 한가운데 황금 양털 조각을 찾았어요!"]} ];
const EXP_PARTY=["{p}가 함께 손발을 척척 맞췄어요!","둘이서 힘을 합쳐 무거운 돌문을 밀어 열었어요!","{p}가 서로 등을 맞대고 괴물을 물리쳤어요!"];
const EXP_DUR=[{h:.5,n:"30분 산책"},{h:4,n:"4시간 탐험"},{h:8,n:"8시간 대모험",sub:"자기 전에 딱!"}];
const EXPO={};   // 친구들의 원정 (중계 서버에서 받음)
const EXPT={t:0,since:0};
function expPetAway(r){ return !!(G.exp&&G.exp.pet===r); }
function expMsg(d){ if(!d||!d.i||d.i===G.id) return; const o=EXPO[d.i]; if(o&&o.t0>d.t0) return; EXPO[d.i]=d; }
function expPush(e,done){ e=e||G.exp; try{ net.pushRet("x/"+G.id,e?{i:G.id,n:G.name,r:G.realm,d:e.d,h:e.h,t0:e.t0,t1:e.t1,pt:[e.pet,e.plv],done:done?1:0}:{i:G.id,n:G.name,r:G.realm,done:1,d:-1,t0:Date.now()}); }catch(err){} }
function expMates(e){ // 같은 원정지·같은 길이, 시작 시각이 원정 길이의 절반 안이면 원정대
  const win=e.h*3600000*.5; return Object.values(EXPO).filter(o=>o.d===e.d&&o.h===e.h&&Math.abs(o.t0-e.t0)<=win); }
function expLeft(){ return G.exp?Math.max(0,G.exp.t1-Date.now()):0; }
function fmtLeft(ms){ const m=Math.ceil(ms/60000); return m>=60?`${Math.floor(m/60)}시간 ${m%60}분`:`${m}분`; }
function expStart(d,h){ if(G.exp) return; if(G.pet==null||G.pet<0||!G.pets||!G.pets[G.pet]){ toast("함께할 신수가 없어요","괴물을 잡으면 가끔 신수 알이 나와요",2.4); return; }
  const now=Date.now(); G.exp={d,h,t0:now,t1:now+h*3600000,pet:G.pet,plv:G.pets[G.pet].lv}; saveGame(); expPush(); try{ net.hello(); net.pushProfile(1); }catch(e){}
  const mates=expMates(G.exp); jingle([523,659,784,1046]); fxRing(P.x,P.z,PETS[G.pet].c,8,.8); fxSpark(P.x,2,P.z,PETS[G.pet].c,30);
  toast(`🧭 ${PETS[G.pet].n} 원정 출발!`,`${EXPS[d].n} · ${fmtLeft(h*3600000)} 뒤에 돌아와요${mates.length?` · ${mates.map(m=>m.n).join(", ")}와(과) 원정대!`:""}`,3.2); showExp(); }
function expRng(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function expClaim(){ const e=G.exp; if(!e) return; const mates=expMates(e); const party=mates.length>0; const D=EXPS[e.d]; const lv=G.lv;
  const k=party?2:1; const gold=Math.round((30+lv*6)*e.h*k*1.2), xp=Math.round((40+lv*10)*e.h*k); G.gold+=gold; gainXp(xp);
  const items=[]; const rolls=Math.max(1,Math.ceil(e.h)); const rr=expRng(e.t0); for(let i=0;i<rolls;i++){ if(rr()<(party?.32:.18)){ let t=Math.min(3,Math.max(0,Math.floor(lv/12))); if(rr()<(party?.3:.12)) t=Math.min(3,t+1); const s=["w","a","r"][Math.floor(rr()*3)]; G.bag.push({s,t}); items.push({s,t}); } }
  const pots=Math.max(1,Math.round(e.h/2)); G.pots+=pots;
  const p=G.pets&&G.pets[e.pet]; let plv0=p?p.lv:0; if(p){ const keep=G.pet; G.pet=e.pet; const ex=G.exp; G.exp=null; petGain(Math.round(e.h*18*k)); G.exp=ex; G.pet=keep; }
  // 그림일기: 같은 시드 → 다시 봐도 같은 이야기
  const pn=PETS[e.pet].n; const evs=D.ev.slice(); const lines=[]; const nEv=e.h>=8?4:e.h>=4?3:2; for(let i=0;i<nEv&&evs.length;i++){ const j=i===nEv-1?evs.length-1:Math.floor(rr()*(evs.length-1)); lines.push(evs.splice(j,1)[0]); }
  const names=[pn].concat(mates.map(m=>`${m.n}의 ${m.pt&&PETS[m.pt[0]]?PETS[m.pt[0]].n:"신수"}`)); const who=names.join("와(과) ");
  const story=lines.map((s,i)=>s.replace("{p}",i===0?who:pn)); if(party) story.splice(1,0,EXP_PARTY[Math.floor(rr()*EXP_PARTY.length)].replace("{p}",names.join("와(과) ")));
  G.expN=(G.expN||0)+1; if(Math.random()<(party?.6:.35)) try{ hmGift(party?2:1,"원정에서"); }catch(e){} if(party) G.expParty=(G.expParty||0)+1; G.exp=null; saveGame(); expPush(e,1); try{ net.hello(); net.pushProfile(1); }catch(err){} rebuildMyPet();
  const pl=p?p.lv:0;
  card(`<h2>🧭 원정대가 돌아왔어요!</h2><p>${D.ic} <b style="color:var(--gold)">${D.n}</b> · ${EXP_DUR.find(x=>x.h===e.h)?.n||fmtLeft(e.h*3600000)}${party?` · <b style="color:#9dffb8">원정대 보물 2배!</b>`:""}</p>
   <div class="diary">${story.map(s=>`<p>✏️ ${s}</p>`).join("")}</div>
   <div class="idlegrid"><div><b>+${fmt(gold)}</b><span>금화</span></div><div><b>+${fmt(xp)}</b><span>경험치</span></div><div><b>+${pots}</b><span>${RM().potion}</span></div><div><b>${pl>plv0?`Lv.${plv0} → ${pl}`:`Lv.${pl}`}</b><span>${pn}</span></div></div>
   ${items.length?`<p>보물: ${items.map(it=>rarTag(it.t)+itemName(it.s,it.t)).join(", ")} (가방에 넣어 뒀어요)</p>`:""}
   ${party?`<p style="font-size:13px">함께 간 친구: ${mates.map(m=>m.n).join(", ")}</p>`:`<p style="font-size:13px">다음엔 친구와 같은 곳·같은 시간으로 보내 보세요. 원정대가 되면 보물이 2배!</p>`}
   <button class="buy" id="expOk" style="align-self:center">좋아요!</button>`); $("expOk").onclick=closeLayer; jingle([523,659,784,1046,1318,1568]); buzz([40,30,60]); fxRing(P.x,P.z,PETS[e.pet].c,10,1); }
function tickExp(dt){ if(!started) return; EXPT.since+=dt; EXPT.t-=dt; if(EXPT.t>0) return; EXPT.t=2;
  if(!G.exp||expLeft()>0||layerOpen||P.dead) return; if(EXPT.since<7&&net.up>0) return;  // 친구 원정 정보가 도착할 시간을 조금 줌
  expClaim(); }
function showExp(){ petData(); const e=G.exp;
  const friends=Object.values(EXPO).filter(o=>!o.done&&o.t1>Date.now()).sort((a,b)=>a.t1-b.t1);
  const fr=friends.map(o=>{ const D=EXPS[o.d]; const pet=o.pt&&PETS[o.pt[0]]?PETS[o.pt[0]].n:"신수"; return `<div class="row"><div class="ic" style="color:${REALMS[o.r]?REALMS[o.r].c1:"#fff"}">${D?D.ic:"🧭"}</div><div class="t"><div>${o.n}의 ${pet}</div><span>${D?D.n:"?"} · ${EXP_DUR.find(x=>x.h===o.h)?.n||""} · ${fmtLeft(o.t1-Date.now())} 남음</span></div>${!e?(Date.now()-o.t0<=o.h*1800000?`<button class="buy" data-join="${o.i}">같이 가기</button>`:'<i class="st">출발한 지 오래됨</i>'):e.d===o.d&&e.h===o.h&&Math.abs(o.t0-e.t0)<=o.h*1800000?'<i class="st on">원정대</i>':""}</div>`; }).join("");
  let top;
  if(e){ const D=EXPS[e.d]; const left=expLeft(); const mates=expMates(e); const pct=Math.round((1-left/(e.t1-e.t0))*100);
    top=`<div class="row"><div class="ic">${D.ic}</div><div class="t"><div>${PETS[e.pet].n} 원정 중 · ${D.n}</div><span>${left>0?`${fmtLeft(left)} 뒤에 돌아와요 · 게임을 꺼 둬도 시간이 흘러요`:"곧 돌아와요!"}${mates.length?` · 원정대: ${mates.map(m=>m.n).join(", ")}`:""}</span><span class="tbar"><i style="width:${pct}%"></i></span></div>${left<=0?'<button class="buy" id="expGet">맞이하기</button>':""}</div>
      <p style="font-size:12px">원정 중인 신수는 나를 따라다니지 않아요. 다른 신수가 있으면 메뉴 → 신수에서 데려갈 수 있어요.</p>${left>0?'<button class="buy sell" id="expCancel" style="align-self:center">원정 그만두고 부르기 (보물 없음)</button>':""}`; }
  else { const p=G.pet>=0&&G.pets[G.pet]; if(!p) top=`<p>함께할 신수가 없어요. 괴물을 잡으면 가끔 신수 알이 나와요(메뉴 → 신수).</p>`;
    else top=`<p>${PETS[G.pet].n} Lv.${p.lv}을(를) 어디로 보낼까요? 원정지와 시간을 골라요.</p>
      <div class="exgrid">${EXPS.map((D,d)=>`<button class="exd${d===(EXPT.pick??G.realm)?" on":""}" data-d="${d}"><em>${D.ic}</em><b>${D.n}</b><i>${REALMS[D.realm].n}</i></button>`).join("")}</div>
      <div class="exgrid three">${EXP_DUR.map(x=>`<button class="buy" data-h="${x.h}">${x.n}${x.sub?`<small>${x.sub}</small>`:""}</button>`).join("")}</div>`; }
  card(`<h2>🧭 원정 게시판</h2><p style="font-size:13px">신수를 원정에 보내면 <b>게임을 꺼 둔 동안에도</b> 모험해요. 돌아오면 금화·경험치·보물과 원정 그림일기!<br>친구가 <b>같은 곳, 같은 시간</b> 원정에 신수를 보내면 <b style="color:#9dffb8">원정대 → 보물 2배</b>.</p>${top}<h3>원정 중인 친구</h3>${fr||'<p style="font-size:13px">아직 없어요. 먼저 보내면 친구 화면에 보여요!</p>'}`);
  layers.querySelectorAll(".exd").forEach(b=>b.onclick=()=>{ EXPT.pick=+b.dataset.d; layers.querySelectorAll(".exd").forEach(x=>x.classList.toggle("on",x===b)); tone(660,.05); });
  layers.querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>expStart(EXPT.pick??G.realm,+b.dataset.h));
  layers.querySelectorAll("[data-join]").forEach(b=>b.onclick=()=>{ const o=EXPO[b.dataset.join]; if(!o) return; EXPT.pick=o.d; if(G.pet==null||G.pet<0||!G.pets[G.pet]){ toast("함께할 신수가 없어요"); return; } const now=Date.now(); G.exp={d:o.d,h:o.h,t0:now,t1:now+o.h*3600000,pet:G.pet,plv:G.pets[G.pet].lv}; saveGame(); expPush(); try{ net.hello(); net.pushProfile(1); }catch(err){} jingle([523,659,784,1046,1318]); toast(`🤝 ${o.n}와(과) 원정대!`,`${EXPS[o.d].n} · 돌아오면 보물 2배`,3); showExp(); });
  if($("expGet")) $("expGet").onclick=()=>{ closeLayer(); expClaim(); };
  if($("expCancel")) $("expCancel").onclick=()=>{ G.exp=null; saveGame(); expPush(); try{ net.hello(); net.pushProfile(1); }catch(err){} rebuildMyPet(); toast("신수가 돌아왔어요"); showExp(); }; }
</script>
