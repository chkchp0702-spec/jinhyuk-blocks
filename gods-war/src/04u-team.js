<script>
/* ================= v47-1: 👥 접속한 친구 위치 + 🤝 함께 임무 =================
   1) 친구 위치: 접속 중인 친구(PEERS)가 화면 밖에 있으면 화면 가장자리에 이름·거리·방향 화살표 칩(가까운 4명).
      칩을 누르면 그 친구를 따라가는 길 안내(친구가 움직여도 계속 따라감). 친구가 들어오면 "어디에 있는지" 알림.
      👥 창: 모든 접속 친구의 장소·거리·방향 · 길 안내 · 🌀 곁으로 가기(1분에 한 번, 전투·시험 중엔 안 됨).
   2) 함께 임무: 2명 이상 접속해 있으면 15분마다 새 공동 임무(모든 폰이 같은 임무 — 시간 칸으로 정함).
      각자 보탠 수를 보관(retained) cq/<id> = {s:시간 칸, c:보탠 수} 로 올리고 모두 더함. 다 채우면 보탠 사람 모두 상자.
      「모여라」 임무는 접속한 모두가 정해진 장소 22걸음 안에 3초 동안 함께 있으면 완료. */
const CQ_MS=15*60000;
const CQ_LIST=[
 {k:"kill",ic:"⚔️",n:"괴물 60마리 함께 잡기",t:60},
 {k:"boss",ic:"👑",n:"보스 3마리 함께 쓰러뜨리기",t:3},
 {k:"center",ic:"🌐",n:"세계의 중심에서 괴물 25마리",t:25},
 {k:"skill",ic:"✨",n:"기술 40번 함께 쓰기",t:40},
 {k:"fish",ic:"🎣",n:"물고기 8마리 함께 낚기",t:8},
 {k:"gather",ic:"📍",n:"모두 한곳에 모여라!",t:1},
 {k:"capt",ic:"🏳️",n:"제단 2번 점령하기",t:2},
 {k:"sun",ic:"☀",n:"태양 열쇠 조각 25개 모으기",t:25},
 {k:"kill",ic:"⚔️",n:"괴물 80마리 함께 잡기",t:80},
 {k:"gather",ic:"📍",n:"모두 한곳에 모여라!",t:1} ];
const CQO={};
const CQ={t:0,pubT:0,dirty:false,el:null,last:{},gatherT:0,seen:{},chips:{},chipT:0,box:null,tpT:0};
function cqSlot(){ return Math.floor(Date.now()/CQ_MS); }
function cqHash(n){ n=(n*2654435761)>>>0; n^=n>>>15; n=(n*2246822519)>>>0; n^=n>>>13; return n>>>0; }
function cqMis(slot){ slot=slot==null?cqSlot():slot; const d=CQ_LIST[cqHash(slot)%CQ_LIST.length]; const m=Object.assign({},d,{slot}); if(m.k==="gather"){ const L=REGIONS.filter(r=>!r.cap); const rg=L[cqHash(slot+77)%L.length]; m.rg=rg.id; m.n=`모두 「${rg.n}」에 모여라!`; } return m; }
function cqOnline(){ return Object.values(PEERS).length; }
function cqActive(){ return started&&G.realm>=0&&cqOnline()>=1; }
function cqMine(){ const s=cqSlot(); if(!G.cq||G.cq.s!==s) G.cq={s,c:0}; return G.cq; }
function cqTotal(){ const s=cqSlot(); let t=cqMine().c; const ppl=[]; if(t>0) ppl.push(G.name); for(const id in CQO){ const o=CQO[id]; if(id!==G.id&&o.s===s&&o.c>0){ t+=o.c; ppl.push(o.n); } } return {t,ppl}; }
function cqAdd(k,n){ if(!n||!cqActive()) return; const m=cqMis(); if(m.k!==k||G.cqDone===m.slot) return; cqMine().c+=n; CQ.dirty=true; }
function cqPub(){ try{ const c=cqMine(); net.pushRet("cq/"+G.id,{i:G.id,n:G.name,r:G.realm,s:c.s,c:c.c,t:Date.now()}); CQ.dirty=false; }catch(e){} }
NETX.push({sub:"cq/+",pre:"cq/",f:(d)=>{ if(!d||!d.i||d.i===G.id) return; CQO[d.i]=d; }});
(function(){ const _km=killMob; killMob=function(m){ _km(m); try{ if(!m.titan){ cqAdd("kill",1); if(m.boss) cqAdd("boss",1); if(m.rg===12&&!m.ds&&!m.dg) cqAdd("center",1); } }catch(e){} };
  const _fc=fishCaught; fishCaught=function(g){ _fc(g); try{ cqAdd("fish",1); }catch(e){} };
  const _gg=gtGive; gtGive=function(n,q){ _gg(n,q); try{ cqAdd("sun",n||0); }catch(e){} }; })();
/* ---------- 방향 · 장소 글씨 ---------- */
function frZone(x,z){ if(typeof dgIn==="function"&&dgIn(x)) return "🌀 신들의 미궁"; if(typeof hmIn==="function"&&hmIn(x)) return "🏡 신전 섬"; if(typeof dsIn==="function"&&dsIn(z)) return "☀ 태양의 사막"; const rg=regionAt(x,z); return rg?rg.n:"황야"; }
function frArea(x,z){ if(typeof dgIn==="function"&&dgIn(x)) return "dg"; if(typeof hmIn==="function"&&hmIn(x)) return "hm"; if(typeof dsIn==="function"&&dsIn(z)) return "ds"; return "w"; }
function frDir(dx,dz){ const a=(Math.atan2(dx,-dz)*180/Math.PI+360)%360; return ["북쪽","북동쪽","동쪽","남동쪽","남쪽","남서쪽","서쪽","북서쪽"][Math.round(a/45)%8]; }
function frInfo(o){ const same=frArea(o.x,o.z)===frArea(P.x,P.z); const d=Math.hypot(o.x-P.x,o.z-P.z); return {same,d,zone:frZone(o.x,o.z),dir:frDir(o.x-P.x,o.z-P.z)}; }
/* ---------- 화면 가장자리 친구 칩 ---------- */
const FRV=new THREE.Vector3();
function frChips(){ if(!CQ.box){ const b=document.createElement("div"); b.id="frChips"; document.body.appendChild(b); CQ.box=b; }
  const W=innerWidth, H=innerHeight; const L=Object.values(PEERS).map(o=>Object.assign({o},frInfo(o))).sort((a,b)=>(b.same-a.same)||(a.d-b.d)).slice(0,4); const keep={};
  let topN=0; L.forEach(x=>{ const o=x.o; let el=CQ.chips[o.id]; if(!el){ el=document.createElement("button"); el.type="button"; el.className="frc"; el.innerHTML='<i class="ar">➤</i><b></b><span></span>'; el.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); frFollow(o.id); }); CQ.box.appendChild(el); CQ.chips[o.id]=el; }
    keep[o.id]=1; el.style.setProperty("--rc",REALMS[o.realm]?REALMS[o.realm].c1:"#fff"); el.querySelector("b").textContent=o.name; el.classList.toggle("fol",P.follow===o.id);
    let px,py,show=true,ang=null;
    if(x.same){ FRV.set(o.x,(o.mesh?o.mesh.position.y:0)+2,o.z).project(camera); let sx=(FRV.x*.5+.5)*W, sy=(-FRV.y*.5+.5)*H; const behind=FRV.z>1; const on=!behind&&sx>40&&sx<W-40&&sy>40&&sy<H-40;
      if(on&&x.d<34){ show=false; } else { const cx=W/2, cy=H*.55; let dx=sx-cx, dy=sy-cy; if(behind){ dx=-dx; dy=-dy; } if(Math.abs(dx)<1&&Math.abs(dy)<1) dy=1; const mL=Math.min(215,W*.24), mR=Math.min(175,W*.2), mT=74, mB=Math.min(165,H*.38); const kx=dx>0?(W-mR-cx)/dx:(mL-cx)/dx, ky=dy>0?(H-mB-cy)/dy:(mT-cy)/dy; const k=Math.min(Math.abs(kx),Math.abs(ky)); px=cx+dx*k; py=cy+dy*k; ang=Math.atan2(dy,dx); }
      el.querySelector("span").textContent=`${Math.round(x.d)}m`; }
    else { px=W/2+(topN-(L.filter(y=>!y.same).length-1)/2)*118; py=62; topN++; el.querySelector("span").textContent=x.zone; }
    el.hidden=!show; if(show){ el.style.transform=`translate(${Math.round(px)}px,${Math.round(py)}px) translate(-50%,-50%)`; const ar=el.querySelector(".ar"); ar.style.display=ang==null?"none":""; if(ang!=null) ar.style.transform=`rotate(${ang}rad)`; } });
  for(const id in CQ.chips){ if(!keep[id]){ CQ.chips[id].remove(); delete CQ.chips[id]; } }
  CQ.box.hidden=!started||layerOpen||P.dead; }
function frFollow(id){ const o=PEERS[id]; if(!o) return; if(P.follow===id){ P.follow=null; setGuide(null); toast("따라가기를 멈췄어요",null,1.2); return; } const x=frInfo(o); if(!x.same){ toast(`${o.name}님은 ${x.zone}에 있어요`,"👥 친구 창에서 「곁으로 가기」를 눌러요",2.2); return; } P.follow=id; toast(`👥 ${o.name}에게 가는 길`,`${x.dir} ${Math.round(x.d)}m · 친구가 움직여도 따라가요`,2); tone(880,.06); }
/* ---------- 매 프레임 ---------- */
function cqTick(dt){ if(!started||G.realm<0) return; CQ.chipT-=dt; CQ.t-=dt; CQ.pubT-=dt; CQ.tpT=Math.max(0,CQ.tpT-dt);
  if(CQ.chipT<=0){ CQ.chipT=ECO()?.25:.12; frChips(); }
  if(P.follow){ const o=PEERS[P.follow]; if(!o||!frInfo(o).same){ P.follow=null; setGuide(null); } else if(Math.hypot(o.x-P.x,o.z-P.z)<8.5){ P.follow=null; setGuide(null); toast(`👥 ${o.name} 곁에 왔어요!`,null,1.6); jingle([659,880]); } else { P.guide={x:o.x,z:o.z,label:`👥 ${o.name}`}; $("guide").hidden=false; } }
  if(CQ.t>0) return; CQ.t=.5;
  // 새로 들어온 친구: 어디 있는지 알려 줌
  for(const id in PEERS){ if(CQ.seen[id]) continue; CQ.seen[id]=performance.now(); }
  for(const id in CQ.seen){ const t=CQ.seen[id]; if(t>0&&performance.now()-t>1800){ CQ.seen[id]=-1; const o=PEERS[id]; if(o&&!layerOpen){ const x=frInfo(o); toast(`👥 ${o.name} 접속! · ${x.zone}`,x.same?`${x.dir}으로 ${Math.round(x.d)}m · 화면 가장자리 이름을 누르면 길 안내`:"👥 친구 창에서 곁으로 갈 수 있어요",3); } } if(t<0&&!PEERS[id]) delete CQ.seen[id]; }
  // 함께 임무
  const m=cqMis(); const act=cqActive(); const c=cqMine();
  if(act){ const cap=G.capt||0, sk=G.sklN||0; if(CQ.last.capt!=null&&cap>CQ.last.capt) cqAdd("capt",cap-CQ.last.capt); if(CQ.last.sk!=null&&sk>CQ.last.sk) cqAdd("skill",sk-CQ.last.sk); CQ.last.capt=cap; CQ.last.sk=sk; } else { CQ.last={}; }
  if(act&&m.k==="gather"&&G.cqDone!==m.slot){ const rg=REGIONS[m.rg]; const all=[{x:P.x,z:P.z}].concat(Object.values(PEERS)); const inn=all.filter(o=>Math.hypot(o.x-rg.x,o.z-rg.z)<22).length; CQ.inn=inn; CQ.all=all.length; if(inn===all.length&&all.length>=2){ if(!CQ.gat0) CQ.gat0=performance.now(); CQ.gatherT=(performance.now()-CQ.gat0)/1000; if(CQ.gatherT>=3){ cqMine().c=1; CQ.dirty=true; } } else { CQ.gat0=0; CQ.gatherT=0; } }
  if(CQ.dirty&&CQ.pubT<=0){ CQ.pubT=2.5; cqPub(); }
  const tot=cqTotal(); if(act&&G.cqDone!==m.slot&&c.c>0&&tot.t>=m.t) cqFinish(m,tot);
  cqHud(m,act,tot); }
XTICK.push(cqTick);
function cqLeft(){ return CQ_MS-(Date.now()%CQ_MS); }
function cqHud(m,act,tot){ if(!CQ.el){ const el=document.createElement("div"); el.id="coop"; el.addEventListener("pointerdown",e=>{ e.stopPropagation(); }); el.onclick=()=>{ if(!layerOpen) showTeam(); }; const q=$("quest"); if(q&&q.parentNode) q.parentNode.insertBefore(el,q.nextSibling); else document.body.appendChild(el); CQ.el=el; }
  const show=act||cqMine().c>0; CQ.el.hidden=!show; if(!show) return; const done=G.cqDone===m.slot; const t=m.k==="gather"?(done?1:0):Math.min(tot.t,m.t); const mins=Math.ceil(cqLeft()/60000);
  const txt=done?`✔ 함께 임무 완료! · 다음 임무 ${mins}분 뒤`:m.k==="gather"?`${m.ic} ${m.n} <small>${CQ.inn||0}/${CQ.all||cqOnline()+1}명 · ${mins}분</small>`:`${m.ic} ${m.n} <small>${t}/${m.t} · ${mins}분</small>`;
  const h=`<b>🤝 함께 임무 · ${cqOnline()+1}명</b>${txt}<i style="width:${Math.round((done?1:t/m.t)*100)}%"></i>`; if(CQ.el._h!==h){ CQ.el._h=h; CQ.el.innerHTML=h; CQ.el.classList.toggle("done",done); } }
function cqFinish(m,tot){ G.cqDone=m.slot; G.cqN=(G.cqN||0)+1; const lv=G.lv; const gold=150+lv*15, xp=120+lv*20; G.gold+=gold; gainXp(xp); G.pots+=2; try{ gtGive(5,true); }catch(e){} let item=null; if(Math.random()<.3){ const tier=clamp(Math.floor(G.rank/2),0,3); const s=pick(["w","a","r"]); G.bag.push({s,t:tier}); item={s,t:tier}; } saveGame(); cqPub();
  try{ lvBanner("함께 임무 완료!",`${m.ic} ${m.n}`,`${tot.ppl.join(" · ")} · 금화 +${fmt(gold)} · 경험치 +${fmt(xp)} · 물약 2 · ☀ 5${item?" · "+itemName(item.s,item.t):""}`,"#9dffb8"); }catch(e){ toast("🤝 함께 임무 완료!",`금화 +${gold}`,3); }
  jingle([523,659,784,1046,1318,1568]); buzz([40,30,80]); fxRing(P.x,P.z,0x9dffb8,10,1); try{ fxRiseDust(0xc8ffd8,HIGH()?40:18,1.6); }catch(e){} }
/* ---------- 👥 창 ---------- */
function frTeleport(id){ const o=PEERS[id]; if(!o) return; if(CQ.tpT>0){ toast(`${Math.ceil(CQ.tpT)}초 뒤에 다시 갈 수 있어요`,null,1.6); return; } if(P.dead||P.trial){ toast("지금은 갈 수 없어요"); return; } if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  const a=frArea(o.x,o.z); if(a==="dg"||a==="hm"){ toast(`${o.name}님은 ${frZone(o.x,o.z)}에 있어요`,"그곳은 순간이동으로 갈 수 없어요",2.2); return; }
  if(a==="ds"){ if(typeof gtOpen!=="function"||!gtOpen()) return; if(!DS.on) dsEnter(); }
  else { if(DG.on) dgExit(true); if(HM.on) hmExit(); if(DS.on) dsExit(true,true); if(typeof RC!=="undefined"&&RC.on) try{ rcEnd(false); }catch(e){} }
  closeLayer(); P.x=o.x+rnd(-2,2); P.z=o.z+2.5; P.y=0; P.vy=0; P.invul=Math.max(P.invul,1.5); CQ.tpT=60; fxRing(P.x,P.z,0xb08cff,6,.7); fxSpark(P.x,2,P.z,0xb08cff,30); jingle([523,784,1046]); toast(`🌀 ${o.name} 곁으로 왔어요!`,null,1.8); }
function showTeam(){ const m=cqMis(), act=cqActive(), tot=cqTotal(), done=G.cqDone===m.slot;
  const rows=Object.values(PEERS).map(o=>Object.assign({o},frInfo(o))).sort((a,b)=>a.d-b.d).map(x=>{ const o=x.o, R=REALMS[o.realm]||REALMS[0]; const mine=(CQO[o.id]&&CQO[o.id].s===m.slot)?CQO[o.id].c:0;
    return `<div class="row"><div class="ic" style="color:${R.c1}">${R.icon}</div><div class="t"><div>${o.rank===0?"🌱":""}${o.name} <i class="st on">접속 중</i></div><span>${R.n} · ${R.ranks[o.rank]} Lv.${o.lv} · 📍 ${x.zone}${x.same?` · ${x.dir} ${Math.round(x.d)}m`:""}${mine?` · 🤝 ${mine}`:""}</span></div><div class="frbtn">${x.same?`<button class="buy" data-fw="${o.id}">${P.follow===o.id?"그만":"길 안내"}</button>`:""}<button class="buy alt" data-tp="${o.id}">🌀 곁으로</button></div></div>`; }).join("");
  const prog=m.k==="gather"?(done?"완료!":`${CQ.inn||0}/${CQ.all||cqOnline()+1}명 모임`):`${Math.min(tot.t,m.t)}/${m.t}`;
  card(`<h2>👥 함께하는 친구</h2><p>지금 접속 중 <b>${cqOnline()+1}명</b>. 화면 밖에 있는 친구는 가장자리에 이름과 거리가 떠요. 이름을 누르면 그 친구에게 가는 길을 계속 알려 줘요.</p>
   <h3>🤝 함께 임무 <small style="font-size:12px;opacity:.8">15분마다 바뀜 · ${Math.ceil(cqLeft()/60000)}분 남음</small></h3>
   ${act?`<div class="row"><div class="ic">${m.ic}</div><div class="t"><div>${m.n}${done?' <i class="st on">완료</i>':""}</div><span>${prog} · 보탠 사람 ${tot.ppl.length?tot.ppl.join(", "):"아직 없음"}</span><span class="tbar"><i style="width:${Math.round((done?1:Math.min(1,(m.k==="gather"?0:tot.t)/m.t))*100)}%"></i></span></div></div>
     <p style="font-size:12px">${m.k==="gather"?"접속한 모두가 그곳 22걸음 안에 3초 동안 함께 있으면 완료!":"내가 조금이라도 보태야 상자를 받아요."} 보상: 금화 · 경험치 · 물약 2 · ☀ 열쇠 조각 5 · 가끔 장비.</p>${m.k==="gather"&&!done?`<button class="buy" id="cqWay" style="align-self:center">📍 모이는 곳 길 안내</button>`:""}`
     :`<p style="font-size:13px">친구가 한 명이라도 접속하면 함께 임무가 열려요. 초대 링크를 보내 보세요!</p>`}
   <h3>📍 친구 위치</h3>${rows||'<p style="font-size:13px">지금은 나 혼자예요.</p>'}<p style="font-size:12px">🌀 곁으로 가기는 1분에 한 번 · 전투·승급 시험 중엔 안 돼요 · 미궁·신전 섬에 있는 친구에게는 못 가요. 지금까지 함께 임무 ${G.cqN||0}번 완료.</p>`);
  layers.querySelectorAll("[data-fw]").forEach(b=>b.onclick=()=>{ closeLayer(); frFollow(b.dataset.fw); });
  layers.querySelectorAll("[data-tp]").forEach(b=>b.onclick=()=>frTeleport(b.dataset.tp));
  if($("cqWay")) $("cqWay").onclick=()=>{ const rg=REGIONS[m.rg]; setGuide({x:rg.x,z:rg.z,label:"📍 "+rg.n}); closeLayer(); }; }
setTimeout(()=>{ const z=$("zoomBtns"); if(!z) return; const b=document.createElement("button"); b.id="bTeam"; b.type="button"; b.textContent="👥"; b.style.fontSize="17px"; b.addEventListener("pointerdown",e=>e.stopPropagation()); b.onclick=e=>{ e.stopPropagation(); if(started&&!layerOpen) showTeam(); }; z.appendChild(b); },0);
TITLES.push({id:"cq1",n:"함께하는 용사",t:1,h:"함께 임무 1번 완료하기",g:()=>[G.cqN||0,1]},{id:"cq10",n:"환상의 팀",t:2,h:"함께 임무 10번 완료하기",g:()=>[G.cqN||0,10]},{id:"cq50",n:"전설의 원정대",t:3,h:"함께 임무 50번 완료하기",g:()=>[G.cqN||0,50]});
</script>
