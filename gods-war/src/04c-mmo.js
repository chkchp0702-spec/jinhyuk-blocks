<script>
/* ================= MMO (v11) =================
   1) 자리 비움 성장: 앱을 끈 동안(최대 24시간) 캐릭터가 자기 세계 사냥터에서 혼자 수련 → 다시 열면 보고서.
      다음 승급에 필요한 레벨 +6 에서 멈춤(승급 시험은 직접 해야 더 자람).
   2) (자동사냥 버튼은 v12에서 뺌 — 사용자 요청 "아직 넣지 마")
   3) 모험가 명부: 각자 캐릭터 정보를 중계 서버에 보관(retained) → 접속 안 한 친구도 사냥터에 "💤 수련 중"으로 보이고
      지금쯤 레벨(같은 계산식)으로 표시. 공격은 안 됨.
*/
const IDLE_MAX_H=24, IDLE_KPM=0.4, IDLE_EFF=0.5;          // 최대 시간 · 분당 처치 수 · 보상 비율
function idleRegion(lv,realm){ const own=[realm*3,realm*3+1,realm*3+2].map(i=>REGIONS[i]); const list=own.concat([REGIONS[12]]); let best=list[0]; list.forEach(r=>{ if(r.lv[0]<=lv) best=r; }); return best; }
function idleCap(rank){ return rank>=RANK_LV.length-1?60:Math.min(60,RANK_LV[rank+1]+6); }
// 같은 입력이면 어느 폰에서 계산해도 같은 결과(친구 화면의 "지금쯤 레벨"도 이걸로 계산)
function idleSim(lv,xp,realm,rank,ms){ const mins=Math.min(IDLE_MAX_H*60,Math.max(0,ms/60000)); const cap=idleCap(rank); let kills=0,gold=0,gxp=0,left=mins; const lv0=lv;
  while(left>0){ const step=Math.min(10,left); left-=step; const rg=idleRegion(lv,realm); const L=clamp(lv,rg.lv[0],rg.lv[1]); const k=step*IDLE_KPM; const ex=(10+L*7)*IDLE_EFF*k, gd=(4+L*2)*IDLE_EFF*k; kills+=k; gold+=gd;
    if(lv<cap){ xp+=ex; gxp+=ex; while(lv<cap&&xp>=xpNeed(lv)){ xp-=xpNeed(lv); lv++; } if(lv>=cap) xp=Math.min(xp,xpNeed(lv)-1); } }
  return {lv,xp:Math.round(xp),kills:Math.floor(kills),gold:Math.round(gold),gxp:Math.round(gxp),mins:Math.round(mins),capped:lv>=cap,rg:idleRegion(lv,realm)}; }
let lastIdle=null;
function grantIdle(){ if(G.realm<0||!G.t) return null; const ms=Date.now()-G.t; if(ms<2*60000) return null;
  const r=idleSim(G.lv,G.xp,G.realm,G.rank,ms); const lv0=G.lv; G.lv=r.lv; G.xp=r.xp; G.gold+=r.gold; G.kills+=r.kills;
  const pots=Math.min(6,Math.floor(r.kills/40)); G.pots+=pots; let items=[]; const tries=Math.min(12,Math.floor(r.kills/25)); for(let i=0;i<tries;i++){ if(Math.random()<.12){ const t=Math.min(3,Math.floor(r.rg.lv[0]/8)); const s=pick(["w","a","r"]); G.bag.push({s,t}); items.push(itemName(s,t)); } }
  let pet=null,titan=null; try{ pet=petIdle(r); }catch(e){} try{ titan=titanIdle(Object.assign({},r,{away:ms})); }catch(e){}
  G.idleTot=(G.idleTot||0)+r.mins; saveGame(); lastIdle=Object.assign({lv0,pots,items,away:ms,pet,titan},r); return lastIdle; }
function fmtDur(min){ const h=Math.floor(min/60), m=Math.round(min%60); return h>0?`${h}시간${m?" "+m+"분":""}`:`${m}분`; }
function showIdleReport(r){ if(!r) return; const lvUp=r.lv-r.lv0;
  card(`<h2>💤 쉬는 동안 수련 보고서</h2><p>${fmtDur(r.away/60000)} 동안 쉬는 사이 <b style="color:var(--gold)">${r.rg.n}</b>에서 혼자 사냥했어요${r.away/60000>IDLE_MAX_H*60?` (최대 ${IDLE_MAX_H}시간까지만 쳐 줘요)`:""}.</p>
  <div class="idlegrid"><div><b>${fmt(r.kills)}</b><span>괴물 처치</span></div><div><b>+${fmt(r.gxp)}</b><span>경험치</span></div><div><b>+${fmt(r.gold)}</b><span>금화</span></div><div><b>${lvUp>0?`Lv.${r.lv0} → ${r.lv}`:`Lv.${r.lv}`}</b><span>${lvUp>0?`레벨 +${lvUp}!`:"레벨"}</span></div></div>
  ${r.pots?`<p>물약 +${r.pots}개</p>`:""}${r.items.length?`<p>주운 아이템: ${r.items.join(", ")} (가방에 넣어 뒀어요)</p>`:""}
  ${r.pet?`<p>🐣 ${r.pet.n}도 같이 수련했어요${r.pet.lv>r.pet.lv0?` · Lv.${r.pet.lv0} → ${r.pet.lv}`:""}</p>`:""}${r.titan?`<p>🌋 ${r.titan.n}에게 쉬는 동안 <b style="color:var(--gold)">${fmt(r.titan.d)}</b> 데미지를 보탰어요</p>`:""}
  ${r.capped?`<p style="color:#ffcf4a">Lv.${idleCap(G.rank)}에서 멈췄어요. 성전에서 <b>승급 시험</b>을 통과해야 자는 동안에도 더 자라요.</p>`:""}
  <button class="buy" id="idleOk" style="align-self:center">좋아요!</button>`); $("idleOk").onclick=closeLayer; jingle([523,659,784,1046]); if(lvUp>0){ P.hp=stat().mhp; fxRing(P.x,P.z,0xffffff,6); } }
let hiddenAt=0;
document.addEventListener("visibilitychange",()=>{ if(document.hidden){ hiddenAt=Date.now(); try{ net.pushProfile(0); }catch(e){} }
  else if(started&&hiddenAt&&Date.now()-hiddenAt>2*60000){ const r=grantIdle(); hiddenAt=0; if(r&&!P.dead&&!layerOpen) showIdleReport(r); try{ net.pushProfile(1); }catch(e){} hud(); } });
addEventListener("pagehide",()=>{ try{ saveGame(); net.pushProfile(0); }catch(e){} });

/* ---------- 모험가 명부 · 쉬는 친구 캐릭터 ---------- */
const ROSTER=(function(){ try{ return JSON.parse(load("gw-roster")||"{}")||{}; }catch(e){ return {}; } })();
const GHOSTS={};
function myProfile(on){ return {i:G.id,n:G.name,r:G.realm,k:G.rank,l:G.lv,x:Math.round(G.xp),lk:(()=>{ const l=G.look||{}; return [l.face||0,l.body||0,l.hat||0,l.cape||0,l.weapon||0,l.tint||0]; })(),e:[G.eq.w,G.eq.a,G.eq.r],t:Date.now(),on:on?1:0,kills:G.kills,pt:(typeof petArr==="function"?petArr():null)}; }
function mmoProfile(d){ if(!d||!d.i||d.i===G.id||d.r==null||d.r<0||!REALMS[d.r]) return; const old=ROSTER[d.i]; if(old&&old.t>d.t) return; ROSTER[d.i]=d; save("gw-roster",JSON.stringify(ROSTER)); }
function isAway(p){ return !PEERS[p.i]&&(p.on===0||Date.now()-p.t>3*60000); }
function projected(p){ return idleSim(p.l,p.x||0,p.r,p.k,isAway(p)?Date.now()-p.t:0); }
function ghostLook(a){ a=a||[0,0,0,0,0,0]; return {face:a[0]||0,body:a[1]||0,hat:a[2]||0,cape:a[3]||0,weapon:a[4]||0,tint:a[5]||0}; }
function ghostEq(p){ const e=p.e||[-1,-1,-1]; return {w:e[0],a:e[1],r:e[2]}; }
function makeGhost(p){ const lk=ghostLook(p.lk); const mesh=(typeof avatarGL==="function"&&avatarGL(p.r,p.k,lk,undefined,ghostEq(p)))||makeAvatar(p.r,p.k,false,lk); scene.add(mesh); return mesh; }
function dropGhost(id){ const g=GHOSTS[id]; if(!g) return; scene.remove(g.mesh); g.lbl.remove(); delete GHOSTS[id]; }
let ghostT=0;
function tickGhosts(dt){ if(!started) return; ghostT-=dt;
  if(ghostT<=0){ ghostT=2; let n=0;
    for(const id in ROSTER){ const p=ROSTER[id]; const away=isAway(p); const pr=away?projected(p):null; const rg=pr?pr.rg:null; const near=rg&&Math.hypot(rg.x-P.x,rg.z-P.z)<rg.r+110;
      if(!away||!near||n>=10||Date.now()-p.t>14*86400000){ dropGhost(id); continue; } n++;
      let g=GHOSTS[id]; if(!g){ const a=Math.random()*6.283, r=rnd(6,rg.r*.6); g=GHOSTS[id]={id,mesh:makeGhost(p),lbl:makeLabel("ally"),x:rg.x+Math.cos(a)*r,z:rg.z+Math.sin(a)*r,tx:0,tz:0,t:0,walk:0,act:0,rg:rg.id}; g.tx=g.x; g.tz=g.z; }
      if(g.rg!==rg.id){ g.rg=rg.id; g.x=rg.x; g.z=rg.z; g.tx=g.x; g.tz=g.z; }
      if(!g.mesh.userData.glAvatar&&typeof avatarGL==="function"){ const m2=avatarGL(p.r,p.k,ghostLook(p.lk),undefined,ghostEq(p)); if(m2){ scene.remove(g.mesh); g.mesh=m2; scene.add(m2); } }
      g.p=p; g.pr=pr; } }
  for(const id in GHOSTS){ const g=GHOSTS[id]; const rg=REGIONS[g.rg]; g.t-=dt; g.act=Math.max(0,g.act-dt);
    if(g.t<=0){ g.t=rnd(2,5); const m=mobs.find(m=>!m.war&&m.rg===g.rg&&Math.hypot(m.x-g.x,m.z-g.z)<16); if(m&&Math.random()<.6){ g.tx=m.x+rnd(-1.5,1.5); g.tz=m.z+rnd(-1.5,1.5); g.fight=m; } else { const a=rnd(0,6.283), r=rnd(4,rg.r*.65); g.tx=rg.x+Math.cos(a)*r; g.tz=rg.z+Math.sin(a)*r; g.fight=null; } }
    const dx=g.tx-g.x, dz=g.tz-g.z, L=Math.hypot(dx,dz); const moving=L>1;
    if(moving){ g.x+=dx/L*4*dt; g.z+=dz/L*4*dt; g.walk+=dt*10; g.mesh.rotation.y=Math.atan2(dx,dz); }
    else if(g.fight&&mobs.indexOf(g.fight)>=0){ g.mesh.rotation.y=Math.atan2(g.fight.x-g.x,g.fight.z-g.z); if(g.act<=0){ g.act=.9; if(Math.hypot(g.x-P.x,g.z-P.z)<50) fxSpark(g.fight.x,1.6,g.fight.z,0xffffff,5); } }
    g.mesh.position.set(g.x,hAt(g.x,g.z),g.z); const u=g.mesh.userData;
    if(u.gl) animState(g.mesh,g.act>.6?"attack":moving?"run":"idle"); else if(u.legL){ const sw=moving?Math.sin(g.walk)*.7:0; u.legL.rotation.x=sw; u.legR.rotation.x=-sw; u.armL.rotation.x=-sw; u.armR.rotation.x=g.act>.6?-2.2:sw; }
    if(Math.hypot(g.x-P.x,g.z-P.z)<55){ const p=g.p, pr=g.pr; placeLabel(g.lbl,g.x,4.6,g.z,`💤 ${p.n} <b>${REALMS[p.r].n} · ${REALMS[p.r].ranks[p.k]} Lv.${pr?pr.lv:p.l}</b><span class="away">쉬는 중 · 혼자 수련 ${fmtDur((Date.now()-p.t)/60000)}째</span>`); } else g.lbl.style.display="none"; } }
function showRoster(){ const me=`<div class="row"><div class="ic" style="color:${REALMS[G.realm].c1}">${REALMS[G.realm].icon}</div><div class="t"><div>${G.name} (나) <i class="st on">접속 중</i></div><span>${REALMS[G.realm].n} · ${REALMS[G.realm].ranks[G.rank]} Lv.${G.lv} · ${(regionAt(P.x,P.z)||{n:"황야"}).n}</span></div></div>`;
  const live=Object.values(PEERS).map(o=>{ const rg=regionAt(o.x,o.z); return {s:1e15+o.lv,h:`<div class="row"><div class="ic" style="color:${REALMS[o.realm].c1}">${REALMS[o.realm].icon}</div><div class="t"><div>${o.name} <i class="st on">접속 중</i></div><span>${REALMS[o.realm].n} · ${REALMS[o.realm].ranks[o.rank]} Lv.${o.lv} · ${rg?rg.n:"황야"}</span></div></div>`}; });
  const away=Object.values(ROSTER).filter(p=>isAway(p)&&Date.now()-p.t<30*86400000).map(p=>{ const pr=projected(p); const hrs=(Date.now()-p.t)/60000; return {s:pr.lv*1e6-hrs,h:`<div class="row"><div class="ic" style="color:${REALMS[p.r].c1}">${REALMS[p.r].icon}</div><div class="t"><div>${p.n} <i class="st">💤 쉬는 중</i></div><span>${REALMS[p.r].n} · ${REALMS[p.r].ranks[p.k]} Lv.${pr.lv}${pr.lv>p.l?` <b style="color:#3fd27a">(+${pr.lv-p.l})</b>`:""} · ${pr.rg.n} · ${fmtDur(hrs)} 전 접속${pr.capped?" · 승급 기다리는 중":""}</span></div></div>`}; });
  const rows=live.concat(away).sort((a,b)=>b.s-a.s).map(x=>x.h).join("");
  card(`<h2>모험가 명부</h2><p>접속 중 ${Object.keys(PEERS).length+1}명 · 쉬는 중 ${away.length}명 · 중계 서버 ${net.up}/4</p>${me}${rows}<p style="font-size:12px">쉬는 친구도 자기 세계 사냥터에서 혼자 수련하며 자라고 있어요(최대 ${IDLE_MAX_H}시간). 사냥터에 가면 💤 표시로 보여요.</p><button class="buy alt" id="toChat" style="align-self:center">대화하기</button>`); $("toChat").onclick=showSay; }
</script>
