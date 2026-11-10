<script>
/* ================= v103-2: 📯 모여라 뿔나팔 — 처음 보는 사람과 바로 파티 짓기 (IDEAS G11/10-2) =================
   메뉴 → 모여라 뿔나팔 → 하고 싶은 일(같이 사냥·미궁·거대 보스·산 거인·양 몰이·하늘 탑·현상수배·영토 전쟁·구름 나라)을 고르면
   같은 방 모든 사람 화면 오른쪽에 카드가 떠요: "📯 ○○ · 🌀 신들의 미궁 · 2/4명 · 📍 장소". 「함께!」→ 파티가 되고 그 사람 곁으로 휙.
   파티(최대 4명): 왼쪽 위 파티 칸에 친구 체력 막대 · 파티원 발밑 하늘색 고리 · 가까이(30m) 있으면 경험치 +10% · 정해진 말 버튼(글자 안 침).
   파티가 끝날 때 2분 넘게 함께였으면 「🤝 함께한 모험 ★」 도장 + 「⭐ 또 만나요」(그 사람이 나팔을 불면 내 카드가 맨 위에, 소리도 남).
   카드 끄기 가능. 실시간 메시지: t:"hnp"(방장이 3초마다 파티 모습 알림) · "hnj"(함께 하기) · "hnl"(나가기). 방장 소식이 15초 없으면 파티 끝.
   저장: G.hnStar · G.hnFav{id:이름} · G.hnMute · G.hnN(파티 수) · G.hnHost(나팔 분 수) · G.hnTog(함께한 초). 칭호 3개. */
const HN_ACT=[{ic:"⚔️",n:"같이 사냥해요"},{ic:"🌀",n:"신들의 미궁"},{ic:"🌋",n:"거대 보스"},{ic:"🏔️",n:"산 거인"},{ic:"🐏",n:"황금 양 몰이"},{ic:"🪜",n:"하늘 탑"},{ic:"🎯",n:"현상수배"},{ic:"🚩",n:"영토 전쟁"},{ic:"🏯",n:"구름 나라 띠 시험"}];
const HN_SAY=["이쪽으로!","잠깐 기다려!","보스 간다!","도와줘!","고마워! 🤝","잘했어! 👍"];
const HN_MAX=4, HN_OPEN=180000, HN_NEAR=30, HN_STAR=120;
const HN={party:null,ads:{},hide:{},sendT:0,t:0,el:null,cards:null,rings:{},tog:0,sayOpen:false,lastFav:{}};
function hnPid(){ return G.id+"-"+Date.now().toString(36); }
function hnMine(){ return HN.party&&HN.party.h===G.id; }
function hnZoneOk(x,z){ if(typeof dsIn==="function"&&dsIn(z)) return "ds"; if(Math.abs(x)<WORLD_HALF&&Math.abs(z)<WORLD_HALF) return "w"; return ""; }
function hnZone(x,z){ try{ if(typeof okIn==="function"&&okIn(x,z)) return "🏯 구름 나라"; if(typeof twIn==="function"&&twIn(x,z)) return "🪜 하늘 탑"; if(typeof arIn==="function"&&arIn(x,z)) return "⚔️ 결투장"; if(typeof pgIn==="function"&&pgIn(z)) return "🏟️ 놀이 마당"; return frZone(x,z); }catch(e){ return "어딘가"; } }
/* ---------- 나팔 불기 (방장) ---------- */
function hnBlow(a){ if(HN.party&&!hnMine()){ toast("지금은 다른 파티에 있어요","파티를 나간 다음 불어요",1.8); return; }
  if(hnMine()){ HN.party.a=a; HN.party.open=Date.now()+HN_OPEN; }
  else HN.party={p:hnPid(),h:G.id,hn:G.name,a,m:[G.id],mn:[G.name],open:Date.now()+HN_OPEN,t0:Date.now(),last:Date.now(),seen:{}};
  G.hnHost=(G.hnHost||0)+1; saveGame(); HN.sendT=0; closeLayer();
  jingle([392,523,659,784,1046]); buzz([30,40,30]); fxRing(P.x,P.z,0x6af0ff,7,.7); fxSpark(P.x,3,P.z,0x6af0ff,24);
  toast(`📯 뿔나팔을 불었어요! — ${HN_ACT[a].ic} ${HN_ACT[a].n}`,`같은 방 모두에게 카드가 가요 · 3분 동안 모집 · 최대 ${HN_MAX}명`,3); }
function hnSend(){ const p=HN.party; if(!p||!hnMine()) return; const open=p.open>Date.now()&&p.m.length<HN_MAX?1:0;
  const ml=p.m.map(id=>id===G.id?G.lv:(PEERS[id]?PEERS[id].lv:0)); try{ net.send({t:"hnp",p:p.p,a:p.a,m:p.m,mn:p.mn,ml,open,x:Math.round(P.x),z:Math.round(P.z),zn:hnZone(P.x,P.z),hl:G.lv}); }catch(e){} }
function hnDisband(){ const p=HN.party; if(!p) return; if(hnMine()){ try{ net.send({t:"hnp",p:p.p,a:p.a,m:[],mn:[],open:0,dis:1}); }catch(e){} } else { try{ net.send({t:"hnl",p:p.p}); }catch(e){} } hnEnd(true); }
/* ---------- 받기 ---------- */
NETR.hnp=(o,d)=>{ if(!d||!d.p||!Array.isArray(d.m)) return; const now=Date.now();
  if(d.dis||!d.m.length){ delete HN.ads[d.p]; if(HN.party&&HN.party.p===d.p&&!hnMine()){ hnEnd(false,`${o.name}님이 파티를 끝냈어요`); } return; }
  HN.ads[d.p]={p:d.p,h:o.id,hn:o.name,hr:o.realm,a:d.a|0,m:d.m.slice(0,HN_MAX),mn:(d.mn||[]).slice(0,HN_MAX).map(s=>String(s).slice(0,8)),ml:d.ml||[],open:!!d.open,x:+d.x||0,z:+d.z||0,zn:String(d.zn||"").slice(0,16),hl:d.hl|0,last:now};
  const P0=HN.party; const inIt=d.m.indexOf(G.id)>=0;
  if(P0&&P0.p===d.p&&!hnMine()){ if(!inIt){ hnEnd(false,"파티에서 빠졌어요"); return; } Object.assign(P0,{a:d.a|0,m:d.m.slice(0,HN_MAX),mn:HN.ads[d.p].mn,last:now}); }
  else if(inIt&&(!P0||P0.p!==d.p)&&HN.want===d.p){ HN.want=null; hnJoined(HN.ads[d.p]); }
  else if(!P0&&d.open&&!G.hnMute&&!HN.hide[d.p]&&G.hnFav&&G.hnFav[o.id]&&!HN.lastFav[d.p]){ HN.lastFav[d.p]=1; jingle([784,988,1175,1568]); buzz([20,30,20]); } };
NETR.hnj=(o,d)=>{ const p=HN.party; if(!p||!hnMine()||d.p!==p.p) return; if(p.m.indexOf(o.id)>=0){ HN.sendT=0; return; } if(p.m.length>=HN_MAX||p.open<Date.now()){ return; }
  p.m.push(o.id); p.mn.push(o.name); p.seen[o.id]=1; HN.sendT=0; jingle([659,880,1046]); toast(`📯 ${o.name}님이 파티에 들어왔어요!`,`${HN_ACT[p.a].ic} ${HN_ACT[p.a].n} · ${p.m.length}/${HN_MAX}명`,2.2); };
NETR.hnl=(o,d)=>{ const p=HN.party; if(!p||!hnMine()||d.p!==p.p) return; const i=p.m.indexOf(o.id); if(i<=0) return; p.m.splice(i,1); p.mn.splice(i,1); HN.sendT=0; toast(`👋 ${o.name}님이 파티를 나갔어요`,null,1.6); };
/* ---------- 함께 하기 (파티원) ---------- */
function hnJoin(pid){ const ad=HN.ads[pid]; if(!ad||!ad.open){ toast("모집이 끝났어요",null,1.4); return; } if(HN.party){ toast("이미 파티에 있어요",null,1.4); return; } HN.want=pid; HN.wantT=6; try{ net.send({t:"hnj",p:pid}); }catch(e){} tone(880,.06); toast(`📯 ${ad.hn}님 파티에 들어가는 중…`,null,1.2); }
function hnJoined(ad){ HN.party={p:ad.p,h:ad.h,hn:ad.hn,a:ad.a,m:ad.m.slice(),mn:ad.mn.slice(),open:0,t0:Date.now(),last:Date.now(),seen:{}}; G.hnN=(G.hnN||0)+1; saveGame();
  jingle([523,659,784,1046,1318]); buzz([20,30,40]); hnGoTo(ad.h,true); }
function hnGoTo(id,first){ const o=PEERS[id]; if(!o){ return; } const hz=hnZoneOk(o.x,o.z), mz=hnZoneOk(P.x,P.z);
  const say=t=>toast(first?`📯 ${o.name}님 파티에 들어왔어요!`:`📯 ${o.name}님에게`,t,2.6);
  if(typeof okIn==="function"&&okIn(o.x,o.z)&&!P.dead&&!P.trial){ if(!OK.on) okEnter(); if(OK.on){ P.x=o.x+rnd(-2,2); P.z=o.z+2.5; fxRing(P.x,P.z,0x6af0ff,6,.7); say("🏯 구름 나라에서 만났어요!"); } return; }
  if(!hz){ say(`📍 ${hnZone(o.x,o.z)}에 있어요 — 입구로 가서 만나요`); return; }
  if(P.dead||P.trial){ say("지금은 갈 수 없어요 · 나중에 파티 칸에서 「곁으로」를 눌러요"); return; }
  if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ say("전투가 끝나면 파티 칸에서 「곁으로」를 눌러요"); return; }
  if(hz==="ds"){ if(typeof gtOpen!=="function"||!gtOpen()){ say("태양의 사막에 있어요"); return; } if(!DS.on) dsEnter(); }
  else if(mz!=="w"||(typeof glAway==="function"&&glAway())){ try{ if(DG.on) dgExit(true); }catch(e){} try{ if(HM.on) hmExit(); }catch(e){} try{ if(DS.on) dsExit(true,true); }catch(e){} try{ if(typeof RC!=="undefined"&&RC.on) rcEnd(false); }catch(e){} try{ if(typeof OK!=="undefined"&&OK.on) okExit(true,true); }catch(e){} if(typeof glAway==="function"&&glAway()){ say(`지금 있는 곳(${hnZone(P.x,P.z)})에서 먼저 나와요`); return; } }
  closeLayer(); P.x=o.x+rnd(-2,2); P.z=o.z+2.5; P.y=0; P.vy=0; P.invul=Math.max(P.invul||0,1.5); fxRing(P.x,P.z,0x6af0ff,6,.7); fxSpark(P.x,2,P.z,0x6af0ff,30); jingle([523,784,1046]);
  say(first?`🌀 곁으로 왔어요! ${HN_ACT[HN.party?HN.party.a:0].ic} ${HN_ACT[HN.party?HN.party.a:0].n}`:"🌀 곁으로 왔어요!"); }
/* ---------- 파티 끝 ---------- */
function hnEnd(self,why){ const p=HN.party; if(!p) return; HN.party=null; HN.want=null; for(const id in HN.rings){ scene.remove(HN.rings[id]); } HN.rings={}; HN.sayOpen=false;
  const tog=Math.round(HN.tog); HN.tog=0; const mates=p.m.map((id,i)=>({id,n:p.mn[i]})).filter(x=>x.id!==G.id);
  if(why&&!self) toast("📯 "+why,null,2);
  if(tog>=HN_STAR&&mates.length){ G.hnStar=(G.hnStar||0)+1; const gold=60+G.lv*6; G.gold+=gold; saveGame(); HN.endQ={mates,tog,gold}; }
  else saveGame(); }
function hnEndCard(q){ G.hnFav=G.hnFav||{};
  card(`<h2>🤝 함께한 모험 ★</h2><p style="font-size:16px">${Math.floor(q.tog/60)}분 동안 함께했어요! 「함께한 모험」 도장 ★ ${G.hnStar} · 금화 +${fmt(q.gold)}</p>
   ${q.mates.map(m=>`<div class="row"><div class="ic">🙂</div><div class="t"><div><b>${m.n}</b></div><span>${G.hnFav[m.id]?"⭐ 또 만나요 친구":"다음에 또 만날까요?"}</span></div><button class="buy${G.hnFav[m.id]?" alt":""}" data-fav="${m.id}" data-n="${m.n}">${G.hnFav[m.id]?"⭐ 친구예요":"⭐ 또 만나요"}</button></div>`).join("")}
   <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="buy" id="hnThx">고마워! 🤝 보내기</button><button class="go" id="hnOk">좋아요!</button></div>
   <p style="font-size:12px">⭐ 또 만나요 친구가 뿔나팔을 불면 카드가 맨 위에 뜨고 소리로 알려 줘요.</p>`); jingle([523,659,784,1046,1318]);
  layers.querySelectorAll("[data-fav]").forEach(b=>b.onclick=()=>{ const id=b.dataset.fav; if(G.hnFav[id]) delete G.hnFav[id]; else { const k=Object.keys(G.hnFav); if(k.length>=30) delete G.hnFav[k[0]]; G.hnFav[id]=b.dataset.n; } saveGame(); hnEndCard(q); });
  $("hnThx").onclick=()=>{ hnSay(4); $("hnThx").disabled=true; }; $("hnOk").onclick=closeLayer; }
function hnSay(i){ const m=HN_SAY[i]; if(!m) return; try{ net.send({t:"say",m}); net.chat(G.name,m,G.realm); }catch(e){} HN.sayOpen=false; }
/* ---------- 경험치 +10% ---------- */
function hnNearMates(){ const p=HN.party; if(!p) return 0; let n=0; p.m.forEach(id=>{ if(id===G.id) return; const o=PEERS[id]; if(o&&!o.dead&&Math.hypot(o.x-P.x,o.z-P.z)<HN_NEAR) n++; }); return n; }
(function(){ const _gx=gainXp; gainXp=function(n){ try{ if(n>0&&HN.party&&hnNearMates()>0) n=Math.round(n*1.1); }catch(e){} return _gx(n); }; })();
/* ---------- 화면: 카드 · 파티 칸 ---------- */
function hnCardsEl(){ const q=$("quest"); const host=q&&q.parentNode;
  if(!HN.cards){ const d=document.createElement("div"); d.id="hnCards"; d.addEventListener("pointerdown",e=>e.stopPropagation()); HN.cards=d;
    d.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; if(b.dataset.j) hnJoin(b.dataset.j); else if(b.dataset.x){ HN.hide[b.dataset.x]=1; tone(440,.05); } HN.cardKey=""; hnCards(); }); }
  if(HN.cards.parentNode!==host||!HN.cards.isConnected){ if(host&&q) host.insertBefore(HN.cards,q); else document.body.appendChild(HN.cards); } return HN.cards; }
function hnCards(){ const el=hnCardsEl(); const now=Date.now(); const show=started&&!layerOpen&&!P.dead&&!HN.party&&!G.hnMute;
  const L=show?Object.values(HN.ads).filter(a=>a.open&&now-a.last<9000&&!HN.hide[a.p]&&PEERS[a.h]&&a.m.indexOf(G.id)<0).sort((a,b)=>((G.hnFav||{})[b.h]?1:0)-((G.hnFav||{})[a.h]?1:0)||b.last-a.last).slice(0,2):[];
  const key=L.map(a=>a.p+a.m.length+a.a+a.zn+(HN.want===a.p?"w":"")).join("|"); if(key===HN.cardKey) return; HN.cardKey=key;
  el.innerHTML=L.map(a=>{ const fav=(G.hnFav||{})[a.h]; const R=REALMS[a.hr]||REALMS[0]; return `<div class="hnc${fav?" fav":""}" style="--rc:${R.c1}"><div class="hd">📯${fav?"⭐":""} <b>${a.hn}</b> · ${HN_ACT[a.a].ic} ${HN_ACT[a.a].n} <em>${a.m.length}/${HN_MAX}</em></div><div class="bt"><span class="zn">📍 ${a.zn||"?"}</span><button type="button" class="go" data-j="${a.p}" ${HN.want===a.p?"disabled":""}>${HN.want===a.p?"…":"함께!"}</button><button type="button" class="x" data-x="${a.p}">✕</button></div></div>`; }).join(""); el.hidden=!L.length; }
function hnPanelEl(){ const q=$("quest"); const host=q&&q.parentNode; if(HN.el&&HN.el.isConnected&&HN.el.parentNode===host) return HN.el;
  if(!HN.el){ const d=document.createElement("div"); d.id="hnParty"; d.hidden=true; d.addEventListener("pointerdown",e=>e.stopPropagation());
    d.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; if(b.dataset.go) hnGoTo(b.dataset.go,false); else if(b.dataset.s!=null) hnSay(+b.dataset.s); else if(b.id==="hnSayB"){ HN.sayOpen=!HN.sayOpen; } else if(b.id==="hnMenuB") showHorn(); HN.panelKey=""; hnPanel(); }); HN.el=d; }
  if(host&&q) host.insertBefore(HN.el,q); else document.body.appendChild(HN.el); return HN.el; }
function hnPanel(){ const el=hnPanelEl(); const p=HN.party; const show=!!p&&started&&!layerOpen; if(!show){ if(!el.hidden){ el.hidden=true; HN.panelKey=""; } return; }
  const rows=p.m.map((id,i)=>{ const me=id===G.id; const o=PEERS[id]; const hp=me?P.hp/stat().mhp:o?(o.hp/(o.mhp||1)):0; const near=me||o&&Math.hypot(o.x-P.x,o.z-P.z)<HN_NEAR; const pc=Math.round(clamp(hp,0,1)*100);
    return `<div class="m${me?" me":""}${o&&o.dead?" dead":""}"><span class="n">${id===p.h?"👑":""}${p.mn[i]||"?"}</span><span class="hb"><i style="width:${pc}%"></i></span>${!me&&o&&!near?`<button type="button" data-go="${id}">곁으로</button>`:!me&&!o?'<span class="off">…</span>':""}</div>`; }).join("");
  const open=hnMine()&&p.open>Date.now()&&p.m.length<HN_MAX; const bonus=hnNearMates()>0;
  const h=`<div class="hd"><button type="button" id="hnMenuB">📯 ${HN_ACT[p.a].ic} ${p.m.length}/${HN_MAX}</button>${bonus?'<span class="bn">경험치 +10%</span>':""}${open?'<span class="op">모집 중</span>':""}<button type="button" id="hnSayB">💬</button></div>${rows}${HN.sayOpen?`<div class="say">${HN_SAY.map((s,i)=>`<button type="button" data-s="${i}">${s}</button>`).join("")}</div>`:""}`;
  if(el.hidden) el.hidden=false; if(HN.panelKey!==h){ HN.panelKey=h; el.innerHTML=h; } }
function hnRings(dt){ const p=HN.party; const want={}; if(p) p.m.forEach(id=>{ if(id!==G.id&&PEERS[id]&&!PEERS[id].dead) want[id]=1; });
  for(const id in HN.rings){ if(!want[id]){ scene.remove(HN.rings[id]); delete HN.rings[id]; } }
  for(const id in want){ let r=HN.rings[id]; if(!r){ r=new THREE.Mesh(GEO.ring,glowMat(0x6af0ff,.75)); r.rotation.x=-Math.PI/2; r.scale.setScalar(1.5); r.userData.noOutline=true; scene.add(r); HN.rings[id]=r; } const o=PEERS[id]; r.position.set(o.x,hAt(o.x,o.z)+.1,o.z); r.rotation.z+=dt*1.5; r.material.opacity=.5+Math.sin(performance.now()/300)*.2; } }
/* ---------- 매 프레임 ---------- */
function hnTick(dt){ if(!started||G.realm<0) return; const now=Date.now(); const p=HN.party;
  if(p){ if(hnMine()){ HN.sendT-=dt; if(HN.sendT<=0){ HN.sendT=3; hnSend(); } for(let i=p.m.length-1;i>=1;i--){ if(!PEERS[p.m[i]]){ const n=p.mn[i]; p.m.splice(i,1); p.mn.splice(i,1); HN.sendT=0; toast(`👋 ${n}님이 떠났어요`,null,1.4); } } if(p.m.length<=1&&p.open<now&&now-p.t0>HN_OPEN){ hnEnd(true); toast("📯 아무도 오지 않아서 모집을 끝냈어요","다음에 다시 불어 봐요!",2.2); } }
    else if(now-p.last>15000||!PEERS[p.h]){ hnEnd(false,`${p.hn}님의 파티가 끝났어요`); }
    if(HN.party&&hnNearMates()>0){ HN.tog+=dt; G.hnTog=(G.hnTog||0)+dt; } }
  if(HN.want){ HN.wantT-=dt; if(HN.wantT<=0){ const ad=HN.ads[HN.want]; HN.want=null; HN.cardKey=""; toast("📯 파티에 못 들어갔어요",ad&&ad.m.length>=HN_MAX?"자리가 다 찼어요":"다시 눌러 봐요",1.8); } }
  if(HN.endQ&&!layerOpen&&!P.dead){ const q=HN.endQ; HN.endQ=null; hnEndCard(q); }
  HN.t-=dt; if(HN.t<=0){ HN.t=.25; for(const k in HN.ads){ if(now-HN.ads[k].last>20000) delete HN.ads[k]; } hnCards(); hnPanel(); }
  hnRings(dt); }
XTICK.push(hnTick);
/* ---------- 창 ---------- */
function showHorn(){ const p=HN.party; const open=Object.values(HN.ads).filter(a=>a.open&&Date.now()-a.last<9000&&PEERS[a.h]&&a.m.indexOf(G.id)<0);
  card(`<h2>📯 모여라 뿔나팔</h2><p>하고 싶은 일을 골라 뿔나팔을 불면, 같은 방 모든 사람 화면에 카드가 떠요. 「함께!」를 누른 사람은 파티가 되어 내 곁으로 와요 (최대 ${HN_MAX}명).</p>
   ${p?`<div class="idlegrid"><div><b>${HN_ACT[p.a].ic} ${p.m.length}/${HN_MAX}</b><span>${hnMine()?"내 파티":p.hn+"님의 파티"}</span></div><div><b>${hnNearMates()>0?"+10%":"—"}</b><span>경험치 (가까이 있을 때)</span></div><div><b>${Math.floor(HN.tog/60)}분</b><span>함께한 시간</span></div></div><p style="font-size:13px">👥 ${p.mn.join(" · ")}</p>`:""}
   <h3>${p&&hnMine()?"🔄 하고 싶은 일 바꾸고 다시 모집":"📯 무엇을 같이 할까요?"}</h3>
   ${p&&!hnMine()?'<p style="font-size:13px">지금은 다른 사람 파티에 있어요.</p>':`<div class="exgrid">${HN_ACT.map((A,i)=>`<button class="buy" data-a="${i}">${A.ic} ${A.n}</button>`).join("")}</div>`}
   ${!p&&open.length?`<h3>📯 지금 모집 중인 파티</h3>${open.map(a=>`<div class="row"><div class="ic">${HN_ACT[a.a].ic}</div><div class="t"><div>${(G.hnFav||{})[a.h]?"⭐ ":""}<b>${a.hn}</b> · ${HN_ACT[a.a].n}</div><span>${a.m.length}/${HN_MAX}명 · 📍 ${a.zn}</span></div><button class="go" data-j="${a.p}">함께!</button></div>`).join("")}`:""}
   ${p?`<button class="buy alt" id="hnLeave" style="align-self:center">${hnMine()?"🏁 파티 끝내기":"👋 파티 나가기"}</button>`:""}
   <div class="idlegrid"><div><b>★ ${G.hnStar||0}</b><span>함께한 모험 도장</span></div><div><b>⭐ ${Object.keys(G.hnFav||{}).length}</b><span>또 만나요 친구</span></div><div><b>${G.hnN||0}</b><span>들어간 파티</span></div></div>
   <div class="exgrid"><button class="buy alt" id="hnMute">${G.hnMute?"🔕 나팔 카드 꺼짐 (켜기)":"🔔 나팔 카드 켜짐 (끄기)"}</button>${Object.keys(G.hnFav||{}).length?'<button class="buy alt" id="hnFavB">⭐ 또 만나요 친구 보기</button>':""}</div>
   <p style="font-size:12px">글자는 치지 않고 정해진 말(💬)만 써요. 파티 칸에서 친구 체력을 보고 「곁으로」로 다시 모일 수 있어요. 2분 넘게 함께하면 「함께한 모험 ★」 도장!</p>`);
  layers.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>hnBlow(+b.dataset.a));
  layers.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{ hnJoin(b.dataset.j); closeLayer(); });
  if($("hnLeave")) $("hnLeave").onclick=()=>{ hnDisband(); closeLayer(); toast("📯 파티를 나왔어요",null,1.4); };
  $("hnMute").onclick=()=>{ G.hnMute=!G.hnMute; saveGame(); HN.cardKey=""; showHorn(); };
  if($("hnFavB")) $("hnFavB").onclick=()=>{ const F=G.hnFav||{}; card(`<h2>⭐ 또 만나요 친구</h2>${Object.keys(F).map(id=>`<div class="row"><div class="ic">⭐</div><div class="t"><div><b>${F[id]}</b>${PEERS[id]?' <i class="st on">접속 중</i>':""}</div><span>이 친구가 뿔나팔을 불면 카드가 맨 위에 떠요</span></div><button class="buy alt" data-un="${id}">빼기</button></div>`).join("")}<button class="buy alt" id="hnBk" style="align-self:center">↩ 돌아가기</button>`); layers.querySelectorAll("[data-un]").forEach(b=>b.onclick=()=>{ delete F[b.dataset.un]; saveGame(); b.closest(".row").remove(); }); $("hnBk").onclick=showHorn; }; }
MENU_X.push({ic:"📯",n:"모여라 뿔나팔",id:"hnBtn",sub:()=>{ const p=HN.party; if(p) return `${HN_ACT[p.a].ic} 파티 ${p.m.length}/${HN_MAX}명${hnNearMates()>0?" · 경험치 +10%":""}`; const n=Object.values(HN.ads).filter(a=>a.open&&PEERS[a.h]).length; return n?`📯 모집 중인 파티 ${n}개!`:"처음 보는 사람과 바로 파티 짓기"; },f:showHorn});
TITLES.push({id:"hn5",n:"함께 가요",t:1,h:"「함께한 모험 ★」 도장 5개",g:()=>[G.hnStar||0,5]},{id:"hnh10",n:"뿔나팔 부는 사람",t:1,h:"뿔나팔 10번 불기",g:()=>[G.hnHost||0,10]},{id:"hn30",n:"모두의 파티 친구",t:3,h:"「함께한 모험 ★」 도장 30개",g:()=>[G.hnStar||0,30]});
</script>
<style>
#hnCards{pointer-events:auto;align-self:flex-start;display:flex;flex-direction:column;gap:3px;margin-top:3px;max-width:200px}
#hnCards[hidden]{display:none}
#hnCards .hnc{padding:4px 7px 5px;border-radius:11px;background:linear-gradient(180deg,rgba(18,48,70,.94),rgba(14,26,48,.94));border:1.5px solid #6af0ff;box-shadow:0 2px 0 rgba(0,0,0,.45),0 0 10px rgba(106,240,255,.35);color:#fff;font-size:11.5px;line-height:1.3;animation:hnIn .35s ease-out}
#hnCards .hnc.fav{border-color:#ffd24a;box-shadow:0 2px 0 rgba(0,0,0,.45),0 0 12px rgba(255,210,74,.55)}
#hnCards .hd{text-shadow:0 1px 0 #000} #hnCards .hd b{color:var(--rc)} #hnCards .hd em{font-style:normal;color:#9dffb8;font-weight:800}
#hnCards .bt{display:flex;gap:4px;align-items:center;margin-top:2px} #hnCards .zn{flex:1;opacity:.85;font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#hnCards .bt .go{font-size:12.5px;padding:2px 10px;min-height:0;border-radius:9px} #hnCards .bt .x{width:24px;height:22px;border-radius:7px;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:11px}
@keyframes hnIn{from{transform:translateX(-24px);opacity:0}to{transform:none;opacity:1}}
#hnParty{pointer-events:auto;align-self:flex-start;margin-top:3px;padding:4px 7px 5px;border-radius:12px;background:rgba(14,30,52,.85);border:1.5px solid rgba(106,240,255,.8);box-shadow:0 2px 0 rgba(0,0,0,.45);color:#fff;font-size:11.5px;min-width:150px;max-width:190px}
#hnParty[hidden]{display:none}
#hnParty .hd{display:flex;gap:4px;align-items:center;margin-bottom:2px} #hnParty .hd button{border:0;border-radius:8px;background:rgba(106,240,255,.22);color:#e8fbff;font-size:12px;font-weight:800;padding:1px 7px}
#hnParty .hd #hnSayB{margin-left:auto} #hnParty .bn{font-size:10.5px;color:#9dffb8;font-weight:800} #hnParty .op{font-size:10.5px;color:#ffe08a}
#hnParty .m{display:flex;align-items:center;gap:5px;line-height:1.35} #hnParty .m .n{flex:0 0 64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} #hnParty .m.me .n{color:#ffe08a} #hnParty .m.dead{opacity:.5}
#hnParty .hb{flex:1;height:6px;border-radius:4px;background:rgba(0,0,0,.5);overflow:hidden;min-width:40px} #hnParty .hb i{display:block;height:100%;background:linear-gradient(90deg,#3fd46a,#9dffb8)}
#hnParty .m button{border:0;border-radius:7px;background:#6af0ff;color:#0e2030;font-size:10.5px;font-weight:800;padding:0 5px} #hnParty .off{opacity:.6}
#hnParty .say{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px} #hnParty .say button{border:0;border-radius:8px;background:rgba(255,255,255,.16);color:#fff;font-size:11px;padding:2px 6px}
</style>
