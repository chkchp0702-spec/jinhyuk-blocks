<script>
/* ================= v34: 🛒 상점 =================
   아래 줄 「상점」 버튼(어디서나) · 가방의 「🛒 상점」 탭 · 메뉴에서 열림. 금화(게임 안 돈)로만 삼 — 진짜 돈 없음.
   탭: ⚔ 장비(계급에 맞는 장비 + 다음 계급 미리보기 + 장비 뽑기 상자, 확률 공개) · 🧪 물약·두루마리(3~10분 버프) · ⛓ 재료(대장간·불가사의·신수 간식)
   날마다 「오늘의 특가」 하나가 30% 할인(날짜로 정해져 모든 폰이 같음). 두루마리 효과는 G.bf 에 끝나는 시각으로 저장(게임을 꺼도 시간은 흘러감). */
const BUFFS={atk:{n:"용사의 두루마리",ic:"⚔️",d:"3분 동안 공격 +25%",min:3,price:150,c:"#ff8d6a"},def:{n:"수호의 두루마리",ic:"🛡️",d:"3분 동안 방어 +30%",min:3,price:150,c:"#8fd0ff"},gold:{n:"행운의 두루마리",ic:"🪙",d:"10분 동안 금화 +50%",min:10,price:250,c:"#ffd24a"},xp:{n:"경험의 두루마리",ic:"📘",d:"10분 동안 경험치 +30%",min:10,price:300,c:"#b8a0ff"},spd:{n:"바람의 두루마리",ic:"💨",d:"5분 동안 달리기 +15%",min:5,price:120,c:"#bfffe0"}};
const SHOP_MAT=[{k:"ore",n:"⛓ 쇳조각 10개",d:"대장간 강화 재료",q:10,price:150},{k:"rune",n:"✨ 룬 가루 1개",d:"대장간 +4부터 필요한 재료",q:1,price:400},{k:"stone",n:"🧱 건축 돌 20개",d:"세계 불가사의에 바치는 돌",q:20,price:200},{k:"snack",n:"🍖 신수 간식",d:"짝꿍 신수 경험치 +5",q:5,price:180},{k:"pots",n:"🧪 물약 3개",d:"체력 50% 회복 (하나 40 금화보다 싸요)",q:3,price:100}];
const GACHA={price:220,p:[.6,.28,.1,.02]};
let SHOP_TAB="eq";
function bfOn(k){ return !!(G.bf&&G.bf[k]>Date.now()); }
function bfLeft(k){ return bfOn(k)?Math.ceil((G.bf[k]-Date.now())/1000):0; }
function bfAdd(k){ const B=BUFFS[k]; G.bf=G.bf||{}; const base=Math.max(Date.now(),G.bf[k]||0); G.bf[k]=base+B.min*60000; G.bfBuy=(G.bfBuy||0)+1; }
function shopDay(){ return typeof dgDay==="function"?dgDay():Math.floor((Date.now()+9*3600000)/86400000); }
function shopDeal(){ const items=[]; ["w","a","r"].forEach(s=>items.push({kind:"eq",s})); for(const k in BUFFS) items.push({kind:"bf",k}); SHOP_MAT.forEach((m,i)=>items.push({kind:"mat",i})); const d=shopDay(); let h=0; const str=String(d); for(let i=0;i<str.length;i++) h=(h*31+str.charCodeAt(i))%100003; return items[h%items.length]; }
function dealKey(it){ return it.kind+":"+(it.s||it.k||it.i); }
function shopPrice(base,it){ const deal=shopDeal(); return dealKey(deal)===dealKey(it)?Math.round(base*.7):base; }
function shopBuy(cost){ if(G.gold<cost){ toast("금화가 모자라요",`${fmt(cost-G.gold)} 금화 더 필요해요 — 괴물·낚시·임무로 모아요`,2.2); buzz(40); return false; } G.gold-=cost; G.shopN=(G.shopN||0)+1; G.shopGold=(G.shopGold||0)+cost; jingle([659,784,1046]); return true; }
/* ---------- 효과 붙이기 ---------- */
(function(){ const _st=stat; stat=function(){ const s=_st(); if(bfOn("atk")) s.atk*=1.25; if(bfOn("def")) s.def*=1.3; return s; };
  const _km=killMob; killMob=function(m){ const g0=G.gold; _km(m); try{ if(bfOn("gold")){ const dg=G.gold-g0; if(dg>0) G.gold+=Math.round(dg*.5); } }catch(e){} };
  const _gx=gainXp; gainXp=function(n){ try{ if(bfOn("xp")&&n>0) n=Math.round(n*1.3); }catch(e){} return _gx(n); }; })();
/* ---------- 창 ---------- */
function showShop(tab){ if(tab) SHOP_TAB=tab; const deal=shopDeal(); const dk=dealKey(deal);
  const tabs=`<div class="tabs">${[["eq","⚔ 장비"],["bf","🧪 물약·두루마리"],["mat","⛓ 재료"]].map(([k,n])=>`<button class="tab ${SHOP_TAB===k?"on":""}" data-st="${k}">${n}</button>`).join("")}</div>`;
  const head=`<h2>🛒 상점</h2><div class="idlegrid"><div><b class="gold">⬤ ${fmt(G.gold)}</b><span>내 금화</span></div><div><b>🔥 오늘의 특가</b><span>${dealName(deal)} 30% 할인</span></div></div>${tabs}`;
  let body="";
  if(SHOP_TAB==="eq"){ const t=Math.min(3,G.rank); const rows=["w","a","r"].map(s=>{ const base=SHOP_PRICE[t], c=shopPrice(base,{kind:"eq",s}); const have=G.eq[s]>=t||G.bag.some(it=>it.s===s&&it.t>=t); return `<div class="row ${dk==="eq:"+s?"deal":""}"><div class="ic">${{w:"⚔",a:"🛡",r:"✨"}[s]}</div><div class="t"><div>${rarTag(t)}${itemName(s,t)}${dk==="eq:"+s?' <i class="dl">특가</i>':""}</div><span>${itemDesc(s,t)}${have?" · 이미 같은 등급이 있어요":""}</span></div><button class="buy" data-sb="${s}" data-t="${t}" data-c="${c}" ${G.gold<c?"disabled":""}>${c<base?`<s>${fmt(base)}</s> `:""}${fmt(c)}</button></div>`; }).join("");
    const nx=t<3?`<div class="row" style="opacity:.6"><div class="ic">🔒</div><div class="t"><div>${rarTag(t+1)}다음 등급 장비</div><span>${RM().ranks[t+1]} 계급이 되면 살 수 있어요 (성전에서 승급 시험)</span></div><button class="buy" disabled>${fmt(SHOP_PRICE[t+1])}</button></div>`:"";
    const gc=shopPrice(GACHA.price,{kind:"gacha"}); const maxT=Math.min(3,G.rank+1);
    body=`<h3>내 계급에 맞는 장비</h3>${rows}${nx}<h3>🎁 장비 뽑기 상자</h3><div class="row"><div class="ic">🎁</div><div class="t"><div>무엇이 나올지 모르는 상자</div><span>무기·방어구·유물 중 하나 · 일반 ${Math.round(GACHA.p[0]*100)}% · 희귀 ${Math.round(GACHA.p[1]*100)}% · 영웅 ${Math.round(GACHA.p[2]*100)}% · 신화 ${Math.round(GACHA.p[3]*100)}% (내 계급+1까지만 나와요)</span></div><button class="buy" id="sbGacha" ${G.gold<gc?"disabled":""}>${fmt(gc)}</button></div><p style="font-size:12px">필요 없는 장비는 가방에서 팔면 값의 ¼을 돌려받아요. 진짜 돈은 전혀 쓰지 않아요.</p>`; }
  else if(SHOP_TAB==="bf"){ body=`<h3>물약</h3><div class="row"><div class="ic">🧪</div><div class="t"><div>${RM().potion} <b>${G.pots}개</b></div><span>체력 50% 회복 · 아래 「물약」 버튼으로 마셔요</span></div><button class="buy" data-pot="1" ${G.gold<40?"disabled":""}>40</button><button class="buy" data-pot="5" ${G.gold<180?"disabled":""}>5개 180</button></div><h3>두루마리 (읽으면 바로 효과)</h3>`+Object.keys(BUFFS).map(k=>{ const B=BUFFS[k]; const c=shopPrice(B.price,{kind:"bf",k}); const on=bfOn(k); return `<div class="row ${dk==="bf:"+k?"deal":""}"><div class="ic">${B.ic}</div><div class="t"><div>${B.n}${dk==="bf:"+k?' <i class="dl">특가</i>':""} ${on?`<i class="st on">${fmtLeft0(bfLeft(k))} 남음</i>`:""}</div><span>${B.d}${on?" · 또 사면 시간이 이어져요":""}</span></div><button class="buy" data-bf="${k}" data-c="${c}" ${G.gold<c?"disabled":""}>${c<B.price?`<s>${fmt(B.price)}</s> `:""}${fmt(c)}</button></div>`; }).join(""); }
  else { body=`<h3>재료</h3>`+SHOP_MAT.map((m,i)=>{ const c=shopPrice(m.price,{kind:"mat",i}); const have=m.k==="pots"?G.pots:m.k==="snack"?"":(G[m.k]||0); return `<div class="row ${dk==="mat:"+i?"deal":""}"><div class="ic">${m.n.slice(0,2)}</div><div class="t"><div>${m.n.slice(2)}${dk==="mat:"+i?' <i class="dl">특가</i>':""}</div><span>${m.d}${have!==""?` · 지금 ${fmt(have)}개`:""}</span></div><button class="buy" data-mat="${i}" data-c="${c}" ${G.gold<c?"disabled":""}>${c<m.price?`<s>${fmt(m.price)}</s> `:""}${fmt(c)}</button></div>`; }).join("")+`<p style="font-size:12px">쇳조각·룬 가루는 괴물·낚시·미궁에서도 나와요. 급할 때만 사면 금화가 아껴져요.</p>`; }
  card(head+body);
  layers.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>{ tone(700,.04); showShop(b.dataset.st); });
  layers.querySelectorAll("[data-sb]").forEach(b=>b.onclick=()=>{ const c=+b.dataset.c; if(!shopBuy(c)) return; G.bag.push({s:b.dataset.sb,t:+b.dataset.t}); saveGame(); toast(`${itemName(b.dataset.sb,+b.dataset.t)} 샀어요!`,"가방에서 「끼기」를 눌러요",2); showShop(); });
  if($("sbGacha")) $("sbGacha").onclick=()=>{ const c=shopPrice(GACHA.price,{kind:"gacha"}); if(!shopBuy(c)) return; const maxT=Math.min(3,G.rank+1); let r=Math.random(), t=0; for(let i=0;i<4;i++){ r-=GACHA.p[i]; if(r<=0){ t=i; break; } } t=Math.min(t,maxT); const s=pick(["w","a","r"]); G.bag.push({s,t}); G.gachaN=(G.gachaN||0)+1; if(t>=3) G.gachaMy=(G.gachaMy||0)+1; saveGame(); closeLayer();
    try{ LOOT.drop(P.x+1.5,P.z+1.5,t); }catch(e){} setTimeout(()=>{ toast(`🎁 ${RAR[t].n}! ${itemName(s,t)}`,t>=2?"와! 아주 좋은 게 나왔어요":"가방에서 확인해요",2.6); if(t>=2){ jingle([784,988,1175,1568]); buzz([30,30,80]); } },900); };
  layers.querySelectorAll("[data-pot]").forEach(b=>b.onclick=()=>{ const n=+b.dataset.pot, c=n===5?180:40; if(!shopBuy(c)) return; G.pots+=n; saveGame(); showShop(); });
  layers.querySelectorAll("[data-bf]").forEach(b=>b.onclick=()=>{ const k=b.dataset.bf, c=+b.dataset.c; if(!shopBuy(c)) return; bfAdd(k); saveGame(); const B=BUFFS[k]; try{ fxRing(P.x,P.z,new THREE.Color(B.c).getHex(),6,.7); fxSpark(P.x,2.5,P.z,new THREE.Color(B.c).getHex(),24); }catch(e){} toast(`${B.ic} ${B.n}`,B.d,2.2); showShop(); });
  layers.querySelectorAll("[data-mat]").forEach(b=>b.onclick=()=>{ const m=SHOP_MAT[+b.dataset.mat], c=+b.dataset.c; if(!shopBuy(c)) return; if(m.k==="ore") fgGive(m.q,0,"",true); else if(m.k==="rune") fgGive(0,m.q,"",true); else if(m.k==="stone") wdGive(m.q,true); else if(m.k==="pots") G.pots+=m.q; else if(m.k==="snack"){ const up=typeof petGain==="function"?petGain(m.q):0; if(G.pet==null||G.pet<0||!G.pets||!G.pets[G.pet]){ G.gold+=c; toast("짝꿍 신수가 없어요","알을 먼저 깨워요 — 금화는 돌려줬어요",2.2); return; } if(up) toast(`${PETS[G.pet].n} 레벨 업!`,null,2); } saveGame(); toast(`${m.n.slice(2)} 샀어요!`,null,1.6); showShop(); }); }
function dealName(it){ if(it.kind==="eq") return itemName(it.s,Math.min(3,G.rank)); if(it.kind==="bf") return BUFFS[it.k].n; if(it.kind==="mat") return SHOP_MAT[it.i].n.slice(2); return "뽑기 상자"; }
function fmtLeft0(sec){ return sec>=60?`${Math.floor(sec/60)}분 ${sec%60}초`:`${sec}초`; }
/* ---------- 화면 표시: 켜진 두루마리 ---------- */
let BFEL=null, bfT=0;
function bfTick(dt){ bfT-=dt; if(bfT>0) return; bfT=1; if(!BFEL){ BFEL=document.createElement("div"); BFEL.id="buffs"; const tl=$("status")||document.querySelector(".hud.tl"); (tl||document.body).appendChild(BFEL); }
  const h=Object.keys(BUFFS).filter(bfOn).map(k=>`<span style="border-color:${BUFFS[k].c}">${BUFFS[k].ic} ${fmtLeft0(bfLeft(k))}</span>`).join(""); if(BFEL._h!==h){ BFEL._h=h; BFEL.innerHTML=h; } }
/* ---------- 버튼 · 칭호 ---------- */
(function(){ const bl=document.querySelector(".hud.bl"); if(bl){ const b=document.createElement("button"); b.className="mbtn"; b.id="bShop"; b.type="button"; b.textContent="상점"; b.onclick=()=>{ if(started&&!layerOpen) showShop(); }; bl.insertBefore(b,$("bSay")); } })();
TITLES.push({id:"shop1",n:"단골 손님",t:1,h:"상점에서 10번 사기",g:()=>[G.shopN||0,10]},{id:"shopM",n:"행운의 손",t:3,h:"뽑기 상자에서 신화 장비 뽑기",g:()=>[Math.min(1,G.gachaMy||0),1]});
</script>
