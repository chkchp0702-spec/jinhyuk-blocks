<script>
/* ================= v88-1: 🤝 만남 임무 · 🎪 함께 이벤트 =================
   친구(같은 방, v88 이상 폰)를 실제로 「만나면」(같은 세계 땅에서 28걸음 안에 2초) 생기는 것들.
   1) 만남 인사: 🤝 알림 + 빛 고리. 친구마다 하루 처음 만나면 작은 만남 선물.
   2) 만남 임무(3단계 이어하기): 무리의 대장(아이디가 가장 작은 폰)이 임무를 정해서 t:"mq" 로 4초마다 알려 줌 → 모든 폰이 같은 임무.
        1단계(몸풀기): 🙌 하이파이브 · 🦘 다 같이 점프 · 📍 비밀 장소 찾기
        2단계(사냥): ⚔ 함께 사냥 · ✨ 기술 함께 쓰기 · ★ 정예 함께 잡기
        3단계(큰일): 🛡 등 맞대고 버티기(괴물이 몰려옴) · ⚔ 대사냥
      각자 보탠 수 t:"mqc" → 모두 더함. 점프·버티기는 대장 폰이 세서 mq 의 p 로 알림. 3단계를 모두 마치면 보너스 상자.
   3) 함께 이벤트: 무리가 사냥터에 있으면 대장 폰이 4~5분마다 t:"me" 로 모두에게 같은 이벤트를 같은 자리에 엶.
        🗿 함께 거인 쓰러뜨리기(체력을 모두 함께 깎음 t:"med"/"mek", 내려찍기는 점프로 피함)
        🌠 별비 함께 받기(씨앗으로 같은 자리·같은 시각에 별 24개, 받은 별 t:"mes")
        🏮 수호 등불 밝히기(사람 수만큼 등불, 곁에 서 있으면 차오름, 서로 값 t:"mlc" 로 맞춤)
   ※ 패치 호환: 예전 버전 폰은 t:"mh"(만남 신호)를 안 보내므로 무리에 안 넣음 → 예전 폰은 아무 영향 없음.
   저장: G.mtd{d,ids} · G.meetFr(만난 친구 수) · G.meetN(만남 임무) · G.meetChain(3단계 완주) · G.mevN(함께 이벤트). 칭호 4개. */
const MEET_R=28, MEET_KEEP=60;
const MEET={ver:{},nearT:{},met:{},cur:null,cc:{},myc:{},done:{},cd:0,evT:60,ev:null,evLast:"",evSeen:{},hud:null,bar:null,sendT:0,hiT:0,t:0,jumps:{},jlast:0,py:0,lastSk:null,grpT:0,advAt:0,lostT:0,lastP:0,mqT:0,hfBtn:null,hfT:0,spotG:null};
function meetPeers(far){ const now=performance.now(), L=[]; if(frArea(P.x,P.z)!=="w") return L; for(const id in PEERS){ const o=PEERS[id]; if(!o||o.dead||!MEET.ver[id]||now-MEET.ver[id]>15000) continue; if(frArea(o.x,o.z)!=="w") continue; const d=Math.hypot(o.x-P.x,o.z-P.z); if(d<(far||MEET_R)) L.push(o); } return L; }
function meetGroup(){ const L=meetPeers(MEET.cur?MEET_KEEP:MEET_R).filter(o=>MEET.cur||(MEET.nearT[o.id]||0)>=2); return L; }
function meetLeader(grp){ grp=grp||meetGroup(); let m=G.id; grp.forEach(o=>{ if(o.id<m) m=o.id; }); return m; }
function meetIsLeader(grp){ grp=grp||meetGroup(); return grp.length>0&&meetLeader(grp)===G.id; }
function meetHunt(x,z){ x=x==null?P.x:x; z=z==null?P.z:z; if(Math.abs(x)>WORLD_HALF||Math.abs(z)>WORLD_HALF) return false; const r=regionAt(x,z); return !!(r&&!r.cap); }
function meetSpawn(x,z,lvAdd,elite,tag){ const rg=regionAt(x,z)||regionAt(P.x,P.z); if(!rg||rg.cap) return null; EV.noElite=true; let m=null; try{ m=spawnMob(rg,false,false); }finally{ EV.noElite=false; } if(!m) return null;
  const lv=Math.min(LVMAX,Math.max(rg.lv[0],G.lv)+lvAdd); const st=mobStats(lv,false); Object.assign(m,{lv,hp:st.mhp,mhp:st.mhp,atk:st.atk,xp:st.xp,gold:st.gold}); m.x=m.hx=x; m.z=m.hz=z; m.mesh.position.set(x,hAt(x,z),z); if(elite) makeElite(m); m.state="chase"; Object.assign(m,tag||{}); fxRing(x,z,0xff4060,3.2,.5); fxSpark(x,1.5,z,0xff6a80,12); return m; }
function meetAround(cx,cz,r0,r1){ const a=rnd(0,6.283), d=rnd(r0,r1); return {x:clamp(cx+Math.sin(a)*d,-WORLD_HALF+4,WORLD_HALF-4),z:clamp(cz+Math.cos(a)*d,-WORLD_HALF+4,WORLD_HALF-4)}; }
function meetName(id){ if(id===G.id) return G.name; const o=PEERS[id]; return o?o.name:"친구"; }

/* ---------- 만남 인사 ---------- */
function meetGreet(o){ MEET.met[o.id]=performance.now(); const d=kday(); if(!G.mtd||G.mtd.d!==d) G.mtd={d,ids:{}};
  let gift=""; if(!G.mtd.ids[o.id]){ G.mtd.ids[o.id]=1; G.meetFr=(G.meetFr||0)+1; const g=40+G.lv*5; G.gold+=g; gift=` · 오늘 첫 만남 선물 금화 +${fmt(g)}`; saveGame(); }
  toast(`🤝 ${o.name}님과 만났어요!`,`곧 「만남 임무」가 생겨요${gift}`,2.6); fxRing(P.x,P.z,0x9dffb8,7,.8); fxRing(o.x,o.z,0x9dffb8,7,.8); try{ floatDmg(o.x,4.6,o.z,"🤝","gain"); }catch(e){} jingle([659,784,988]); buzz([20,30,20]); }

/* ---------- 만남 임무 ---------- */
const MQ_DEF={
 hifive:{ic:"🙌",n:"하이파이브!",how:"친구 곁(5걸음 안)에서 🙌 버튼을 눌러요 — 모두 한 번씩",tg:n=>n,dur:180,all:1},
 jump:{ic:"🦘",n:"하나 둘 셋, 다 같이 점프!",how:"모두 1.5초 안에 동시에 점프 — 3번 성공",tg:()=>3,dur:180,all:1,lead:1},
 spot:{ic:"📍",n:"비밀 장소 함께 찾기",how:"금빛 기둥이 있는 곳까지 누구든 먼저 가면 성공",tg:()=>1,dur:200,all:1},
 kill:{ic:"⚔️",n:"함께 괴물 사냥",how:"친구 곁(40걸음 안)에서 괴물 잡기",tg:n=>8+5*n,dur:300},
 skill:{ic:"✨",n:"기술 함께 쓰기",how:"친구 곁에서 기술 쓰기",tg:n=>12+4*n,dur:240},
 elite:{ic:"★",n:"★정예 함께 잡기",how:"친구 곁에서 ★정예 괴물 잡기",tg:n=>1+Math.ceil(n/2),dur:330},
 guard:{ic:"🛡",n:"등 맞대고 버티기",how:"모두 12걸음 안에 모여서 25초 버티기 — 괴물이 몰려와요!",tg:()=>25,dur:170,all:1,lead:1},
 kill2:{ic:"⚔️",n:"함께 대사냥",how:"친구 곁(40걸음 안)에서 괴물 잡기 — 많이!",tg:n=>14+8*n,dur:360} };
const MQ_STAGE=[["hifive","jump","spot"],["kill","skill","elite"],["guard","kill2"]];
function mqDef(c){ return MQ_DEF[c.k]||MQ_DEF.kill; }
function mqNew(st,grp){ const n=grp.length+1; let L=MQ_STAGE[st].slice(); if(!meetHunt()) L=L.filter(k=>k!=="guard"&&k!=="elite"); if(!L.length) L=["kill2"]; if(MEET.cur&&L.length>1) L=L.filter(k=>k!==MEET.cur.k);
  const k=pick(L), D=MQ_DEF[k]; const c={id:G.id.slice(-4)+Date.now().toString(36),st,k,tg:D.tg(n),mem:[G.id].concat(grp.map(o=>o.id)).sort(),end:Date.now()+D.dur*1000,p:0,L:G.id,n};
  if(k==="spot"){ let cx=P.x,cz=P.z; grp.forEach(o=>{ cx+=o.x; cz+=o.z; }); cx/=n; cz/=n; let ok=false; for(let i=0;i<24&&!ok;i++){ const q=meetAround(cx,cz,30,48); if(frArea(q.x,q.z)==="w"&&regionAt(q.x,q.z)){ c.x=Math.round(q.x); c.z=Math.round(q.z); ok=true; } } if(!ok){ c.x=Math.round(clamp(cx+30,-WORLD_HALF+6,WORLD_HALF-6)); c.z=Math.round(cz); } }
  return c; }
function mqSend(){ const c=MEET.cur; if(!c) return; try{ net.send({t:"mq",id:c.id,st:c.st,k:c.k,tg:c.tg,mem:c.mem,end:c.end,p:c.p,x:c.x,z:c.z,n:c.n}); }catch(e){} MEET.mqT=(c.k==="guard"||c.k==="jump")?1:4; }
function mqTotal(c){ if(mqDef(c).lead) return c.p||0; let t=MEET.myc[c.id]||0; const cc=MEET.cc[c.id]||{}; for(const id in cc) if(id!==G.id) t+=cc[id]; return t; }
function mqNearMem(r){ const c=MEET.cur; if(!c) return false; return c.mem.some(id=>{ if(id===G.id) return false; const o=PEERS[id]; return o&&!o.dead&&Math.hypot(o.x-P.x,o.z-P.z)<(r||40); }); }
function mqAdd(k,n){ const c=MEET.cur; if(!c||MEET.done[c.id]||!n) return; if(c.k!==k&&!(k==="kill"&&c.k==="kill2")) return; if(!mqNearMem(40)) return; MEET.myc[c.id]=(MEET.myc[c.id]||0)+n; MEET.dirty=true; }
function mqAdopt(c,fromId){ const old=MEET.cur; MEET.cur=Object.assign({},c,{L:fromId}); if(!old||old.id!==c.id){ MEET.lostT=0; const D=mqDef(c); toast(`🤝 만남 임무 ${c.st+1}/3 · ${D.ic} ${D.n}`,D.how,3); jingle([523,659,784]); MEET.lastP=c.p||0; if(c.k==="spot") mqSpotShow(); else mqSpotHide(); } }
function mqSpotShow(){ const c=MEET.cur; mqSpotHide(); if(!c||c.x==null) return; const g=new THREE.Group(); const beam=new THREE.Mesh(new THREE.CylinderGeometry(.5,.8,26,10,1,true),glowMat(0xffd24a,.28)); beam.position.y=13; g.add(beam); const ring=new THREE.Mesh(new THREE.RingGeometry(3.4,4,40),glowMat(0xffd24a,.7)); ring.rotation.x=-Math.PI/2; ring.position.y=.15; g.add(ring); const orb=sph(.6,glowMat(0xfff2a0,.95),0,1.6,0); g.add(orb); g.userData={noOutline:true,ring,orb}; g.position.set(c.x,hAt(c.x,c.z),c.z); scene.add(g); MEET.spotG={g,lbl:makeLabel(""),x:c.x,z:c.z}; try{ setGuide({x:c.x,z:c.z,label:"📍 비밀 장소"}); }catch(e){} }
function mqSpotHide(){ const s=MEET.spotG; if(!s) return; scene.remove(s.g); s.lbl.remove(); MEET.spotG=null; if(P.guide&&P.guide.label==="📍 비밀 장소"){ P.guide=null; $("guide").hidden=true; } }
function mqDone(c){ MEET.done[c.id]=1; mqSpotHide(); const D=mqDef(c); const mine=(MEET.myc[c.id]||0)>0; const n=c.n||c.mem.length; const lv=G.lv;
  if(!D.all&&!mine){ toast(`🤝 ${D.ic} ${D.n} 완료!`,"이번엔 내가 보탠 게 없어서 상자는 친구들이 받았어요",2.4); return; }
  G.meetN=(G.meetN||0)+1; const mul=[.06,.09,.14][c.st]*(1+.1*Math.max(0,n-2)); const xp=Math.round(xpNeed(lv)*mul), gold=Math.round((80+lv*16)*(1+c.st*.6)); gainXp(xp); G.gold+=gold; const got=[`경험치 +${fmt(xp)}`,`금화 +${fmt(gold)}`];
  if(c.st>=1){ G.pots+=1; got.push("🧪 +1"); } if(c.st>=2){ G.ore=(G.ore||0)+4; G.rune=(G.rune||0)+1; got.push("⛓ +4","✨ +1"); if(Math.random()<.5) got.push("🎁 "+evGear(.2)); }
  if(c.st>=2){ G.meetChain=(G.meetChain||0)+1; G.rune=(G.rune||0)+2; got.push("🏆 3단계 완주 보너스: ✨ +2 · 🎁 "+evGear(.35)); }
  saveGame(); try{ lvBanner(c.st>=2?"🏆 만남 임무 완주!":`🤝 만남 임무 ${c.st+1}/3 완료!`,`${D.ic} ${D.n}`,`${c.mem.map(meetName).join(" · ")} · ${got.join(" · ")}`,"#9dffb8"); }catch(e){ toast("🤝 만남 임무 완료!",got.join(" · "),3); }
  jingle([523,659,784,1046,1318]); buzz([30,20,60]); fxRing(P.x,P.z,0x9dffb8,10,1); try{ fxRiseDust(0xc8ffd8,HIGH()?36:16,1.4); }catch(e){} }
function mqFail(c,why){ mqSpotHide(); MEET.done[c.id]=-1; toast(`🤝 만남 임무 실패…`,why||"시간이 다 됐어요 — 조금 뒤 새 임무가 와요",2.6); tone(220,.3,"sawtooth",0,.08); }
/* 대장 폰: 임무를 정하고, 점프·버티기를 세고, 다음 단계로 넘김 */
function mqDirect(grp,dt){ const now=Date.now(); let c=MEET.cur;
  if(!c){ if(now<MEET.cd||MEET.grpT<5) return; MEET.cur=mqNew(0,grp); mqAdopt(MEET.cur,G.id); mqSend(); return; }
  if(c.L!==G.id){ c.L=G.id; }   // 대장이 바뀌면 이어받음
  const mem=[G.id].concat(grp.map(o=>o.id)); c.mem.forEach(id=>{ if(mem.indexOf(id)<0&&PEERS[id]&&MEET.ver[id]) mem.push(id); }); c.mem=mem.sort();
  const D=mqDef(c);
  if(!MEET.done[c.id]){
    if(c.k==="jump"){ const tn=performance.now(); const all=c.mem.every(id=>MEET.jumps[id]&&tn-MEET.jumps[id]<1500); if(all&&tn-MEET.jlast>2000){ MEET.jlast=tn; c.p=(c.p||0)+1; mqSend(); } }
    if(c.k==="guard"){ const pts=c.mem.map(id=>id===G.id?{x:P.x,z:P.z}:PEERS[id]).filter(Boolean); let cx=0,cz=0; pts.forEach(q=>{ cx+=q.x; cz+=q.z; }); cx/=pts.length; cz/=pts.length; const tight=pts.length>=2&&pts.every(q=>Math.hypot(q.x-cx,q.z-cz)<12)&&meetHunt(cx,cz); if(tight){ c.p=Math.min(c.tg,(c.p||0)+dt); c.gx=cx; c.gz=cz; } MEET.gTight=tight; }
    if(mqTotal(c)>=c.tg){ mqSend(); return; } }
  else if(MEET.done[c.id]===1||MEET.done[c.id]===-1){ if(!MEET.advAt) MEET.advAt=now+3500; if(now>=MEET.advAt){ MEET.advAt=0; const ok=MEET.done[c.id]===1; if(ok&&c.st<2){ MEET.cur=mqNew(c.st+1,grp); mqAdopt(MEET.cur,G.id); mqSend(); } else { MEET.cur=null; MEET.cd=now+(ok?150000:60000); try{ net.send({t:"mqe",id:c.id}); }catch(e){} } } return; }
  if(now>c.end){ mqSend(); } }
NETR.mh=(o,d)=>{ MEET.ver[o.id]=performance.now(); };
NETR.mq=(o,d)=>{ MEET.ver[o.id]=performance.now(); if(!d||!d.id||!Array.isArray(d.mem)||d.mem.indexOf(G.id)<0) return; const c=MEET.cur;
  if(c&&c.id===d.id){ const p0=c.p||0; Object.assign(c,{tg:d.tg,mem:d.mem,end:d.end,p:d.p,L:o.id}); if(c.k==="jump"&&(d.p||0)>p0){ toast(`🦘 척척! 다 같이 점프 ${d.p}/${c.tg}`,null,1.4); jingle([784,1046]); fxRing(P.x,P.z,0x9dffb8,5,.5); } return; }
  if(c&&!MEET.done[c.id]&&c.L===G.id&&G.id<o.id) return;   // 내가 더 작은 아이디의 대장이면 내 임무 유지
  if(MEET.done[d.id]) return; mqAdopt(d,o.id); };
NETR.mqc=(o,d)=>{ if(!d||!d.id) return; (MEET.cc[d.id]=MEET.cc[d.id]||{})[o.id]=d.c|0; };
NETR.mqj=(o,d)=>{ MEET.jumps[o.id]=performance.now(); try{ floatDmg(o.x,4.4,o.z,"🦘","gain"); }catch(e){} };
NETR.mhf=(o,d)=>{ if(d.to&&d.to!==G.id) return; fxSpark(o.x,2.4,o.z,0xfff2a0,16); try{ floatDmg(o.x,4.6,o.z,"🙌 짝!","gain"); }catch(e){} tone(1320,.06,"square",0,.06); };
NETR.mqe=(o,d)=>{ const c=MEET.cur; if(c&&c.id===d.id&&c.L===o.id){ MEET.cur=null; mqSpotHide(); } };
function meetHiFive(){ const c=MEET.cur; if(!c||c.k!=="hifive"||MEET.done[c.id]) return; const o=c.mem.map(id=>PEERS[id]).filter(q=>q&&Math.hypot(q.x-P.x,q.z-P.z)<5)[0]; if(!o){ toast("🙌 친구 곁(5걸음 안)으로 가요!",null,1.4); return; }
  if(!(MEET.myc[c.id]>0)){ MEET.myc[c.id]=1; MEET.dirty=true; } P.rot=Math.atan2(o.x-P.x,o.z-P.z); try{ if(player.userData.gl) animState(player,"attack"); }catch(e){} fxSpark((P.x+o.x)/2,2.4,(P.z+o.z)/2,0xfff2a0,26); fxRing((P.x+o.x)/2,(P.z+o.z)/2,0xfff2a0,4,.5); try{ floatDmg(P.x,4.6,P.z,"🙌 짝!","gain"); }catch(e){} tone(1320,.06,"square",0,.07); tone(1760,.08,"square",.06,.05); buzz(30); try{ net.send({t:"mhf",to:o.id}); }catch(e){} }

/* ---------- 함께 이벤트 ---------- */
const MEV_DEF={
 giant:{ic:"🗿",n:"함께 거인 쓰러뜨리기",dur:130,xp:.2,gold:2.4,ore:5,rune:1,item:.7,itemUp:.3},
 rain:{ic:"🌠",n:"별비 함께 받기",dur:55,xp:.16,gold:1.8,sun:5,rune:1,item:.5},
 lamp:{ic:"🏮",n:"수호 등불 밝히기",dur:80,xp:.17,gold:1.8,pots:2,stone:8,item:.55} };
function mevBar(){ if(!MEET.bar){ const b=document.createElement("div"); b.id="mtbar"; b.hidden=true; document.body.appendChild(b); MEET.bar=b; } return MEET.bar; }
function mevHud(){ const b=mevBar(), e=MEET.ev; if(!e){ if(!b.hidden) b.hidden=true; return; } b.hidden=false; let top="", bot=0; ["evbar","warbar","bossbar"].forEach(id=>{ const el=$(id); if(el&&!el.hidden){ const r=el.getBoundingClientRect(); if(r.height>0) bot=Math.max(bot,r.bottom); } }); if(bot>0) top=Math.round(bot+6)+"px"; if(b._t!==top){ b._t=top; b.style.top=top; }
  const left=Math.max(0,Math.ceil((e.end-Date.now())/1000)); const p=Math.max(0,Math.min(1,mevProg(e))); const far=Math.hypot(P.x-e.x,P.z-e.z)>30;
  const h=`<b>🎪 함께 이벤트 · ${e.D.ic} ${e.D.n}</b><span>${far?"📍 모이는 곳으로 가요! · ":""}${mevGoal(e)} · ${e.mem.length}명 · ⏱ ${left}초</span><i><s style="width:${Math.round(p*100)}%"></s></i>`; if(b._h!==h){ b._h=h; b.innerHTML=h; } }
function mevProg(e){ if(e.k==="giant") return e.lost||0; if(e.k==="rain") return e.got/e.tg; if(e.k==="lamp") return e.lamps.reduce((s,l)=>s+Math.min(10,l.v),0)/(e.lamps.length*10); return 0; }
function mevGoal(e){ if(e.k==="giant") return `거인 체력 ${Math.ceil((1-(e.lost||0))*100)}% · 빨간 고리는 점프!`; if(e.k==="rain") return `받은 별 ${e.got}/${e.tg} (내가 ${e.mine})`; if(e.k==="lamp") return `밝힌 등불 ${e.lamps.filter(l=>l.v>=10).length}/${e.lamps.length} · 등불 곁에 서 있어요`; return ""; }
function mevAlive(e){ return mobs.filter(m=>m.mev===e.id&&m.hp>0); }
function mevStart(d,fromId){ if(MEET.ev||MEET.evSeen[d.id]) return; if(Date.now()>d.end) return; MEET.evSeen[d.id]=1; const D=MEV_DEF[d.k]; if(!D) return;
  if(EV.cur){ try{ evEnd(false,"함께 이벤트가 시작돼서 멈췄어요"); }catch(e){} }
  const e=Object.assign({},d,{D,L:fromId,part:false,sp:3,t0:performance.now()}); MEET.ev=e; const rng=dgRng(d.s>>>0); const n=d.mem.length;
  if(e.k==="giant") mevGiant(e,rng,n);
  if(e.k==="rain"){ e.stars=[]; for(let i=0;i<24;i++){ const a=rng()*6.283, r=4+rng()*16; e.stars.push({j:i,x:e.x+Math.sin(a)*r,z:e.z+Math.cos(a)*r,t:2+i*1.75+rng()*.9,got:false,g:null}); } e.got=0; e.mine=0; e.tg=n>=3?16:14; }
  if(e.k==="lamp"){ const L=clamp(n,2,4); e.lamps=[]; const a0=rng()*6.283; for(let i=0;i<L;i++){ const a=a0+i*6.283/L; const x=e.x+Math.sin(a)*10, z=e.z+Math.cos(a)*10; e.lamps.push({x,z,v:0,g:mevLampMesh(x,z),lbl:makeLabel("")}); } e.sent=0; }
  const far=Math.hypot(P.x-e.x,P.z-e.z); try{ fxRing(e.x,e.z,0xff8ad8,12,1); }catch(err){} jingle([392,523,659,784,1046]); buzz([40,30,40]);
  toast(`🎪 함께 이벤트! ${D.ic} ${D.n}`,far>25?`${frDir(e.x-P.x,e.z-P.z)} ${Math.round(far)}m · 길 안내를 켰어요`:"친구들과 함께 해요!",3); if(far>25) try{ setGuide({x:e.x,z:e.z,label:"🎪 함께 이벤트"}); }catch(err){} }
function mevGiant(e,rng,n){ const rg=regionAt(e.x,e.z)||regionAt(P.x,P.z); if(!rg){ return; } const R=REALMS[rg.realm>=0?rg.realm:Math.max(0,G.realm)]; const def=R.mobs[Math.floor(rng()*R.mobs.length)]; const lv=Math.min(LVMAX,Math.max(rg.lv[1],G.lv)+3); const st=mobStats(lv,true); const sc=2.2;
  const mesh=(typeof mobGL==="function"&&mobGL(def.n,sc))||makeMob(def.shape,def.c,sc); const mhp=Math.round(st.mhp*(.7+.45*n));
  const m={n:`거인 ${def.n}`,shape:def.shape,mesh,x:e.x,z:e.z,hx:e.x,hz:e.z,lv,boss:true,world:false,hp:mhp,mhp,atk:st.atk*.9,xp:st.xp,gold:st.gold,rg:rg.id,cd:0,state:"idle",t:0,lbl:makeLabel("boss"),rot:0,hit:0,scale:sc,power:0,ev:1,mev:e.id,meetG:1};
  try{ const a=new THREE.Mesh(new THREE.RingGeometry(1.6,2.2,36),glowMat(0xff8ad8,.7)); a.rotation.x=-Math.PI/2; a.position.y=.12; mesh.add(a); m.aura=a; }catch(err){} mesh.position.set(e.x,hAt(e.x,e.z),e.z); scene.add(mesh); mobs.push(m); e.m=m; e.lost=0; e.out=0; e.st=5; e.sendT=0; }
function mevLampMesh(x,z){ const g=new THREE.Group(); const y=hAt(x,z); const post=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,2.6,8),mat({color:0x5a3a22,roughness:.8})); post.position.set(x,y+1.3,z); g.add(post); const orb=sph(.55,glowMat(0xff9a40,.35),x,y+2.9,z); g.add(orb);
  const ring=new THREE.Mesh(new THREE.RingGeometry(2.9,3.2,40),glowMat(0xffb060,.45)); ring.rotation.x=-Math.PI/2; ring.position.set(x,y+.14,z); g.add(ring); g.userData={orb,ring,noOutline:true}; scene.add(g); return g; }
function mevStarMesh(){ const g=new THREE.Group(); const s=new THREE.Mesh(new THREE.OctahedronGeometry(.5),glowMat(0xfff2a0,.95)); g.add(s); const tail=new THREE.Mesh(new THREE.CylinderGeometry(.04,.22,3.2,6,1,true),glowMat(0xffe0f4,.35)); tail.position.y=1.8; g.add(tail); g.userData.noOutline=true; scene.add(g); return g; }
function mevEnd(ok,why){ const e=MEET.ev; if(!e) return; MEET.ev=null; mevHud();
  mobs.filter(m=>m.mev===e.id&&m.hp>0).forEach(m=>{ fxSpark(m.x,1.5,m.z,0xffffff,10); removeMob(m); });
  if(e.stars) e.stars.forEach(s=>{ if(s.g){ scene.remove(s.g); s.g=null; } }); if(e.lamps) e.lamps.forEach(l=>{ scene.remove(l.g); l.lbl.remove(); });
  if(P.guide&&P.guide.label==="🎪 함께 이벤트"){ P.guide=null; $("guide").hidden=true; }
  if(ok&&e.part){ G.mevN=(G.mevN||0)+1; const got=evReward(e.D,1+.12*Math.max(0,e.mem.length-1)); try{ lvBanner("🎪 함께 이벤트 성공!",`${e.D.ic} ${e.D.n}`,`${e.mem.map(meetName).join(" · ")} · ${got.join(" · ")}`,"#ff9ad8"); }catch(err){ toast("🎪 함께 이벤트 성공!",got.join(" · "),3); } try{ fxPillar(0xff9ad8,.8,HIGH()?34:18,1.4,.45); }catch(err){} jingle([523,659,784,1046,1318,1568]); buzz([30,20,60]); }
  else if(ok){ toast(`🎪 ${e.D.n} — 친구들이 해냈어요!`,"다음엔 가까이 가서 같이 해요",2.4); }
  else { toast(`🎪 ${e.D.n} 실패…`,why||"시간이 다 됐어요",2.4); tone(220,.3,"sawtooth",0,.08); }
  saveGame(); }
function mevTick(dt){ const e=MEET.ev; mevHud(); if(!e) return; const now=Date.now(); if(now>e.end){ mevEnd(false, e.k==="giant"?"거인이 산으로 돌아갔어요":e.k==="rain"?"별비가 그쳤어요":"등불이 꺼져 버렸어요"); return; }
  const dC=Math.hypot(P.x-e.x,P.z-e.z); if(dC<30&&!P.dead) e.part=true; const tEv=(now-e.at)/1000;
  if(dC<45&&P.guide&&P.guide.label==="🎪 함께 이벤트"){ P.guide=null; $("guide").hidden=true; }
  // 함께 싸울 괴물(폰마다 따로)
  if(e.k!=="giant"&&dC<40&&meetHunt()){ e.sp-=dt; if(e.sp<=0){ e.sp=e.k==="lamp"?5:7; if(mevAlive(e).length<(e.k==="lamp"?5:4)){ const q=meetAround(P.x,P.z,10,15); meetSpawn(q.x,q.z,2,Math.random()<.15,{mev:e.id,ev:1}); } } }
  if(e.k==="giant"){ const m=e.m; if(!m) return mevEnd(false);
    if(mobs.indexOf(m)<0||m.hp<=0){ return; }
    e.sendT-=dt; if(e.sendT<=0&&e.out>0){ e.sendT=.4; try{ net.send({t:"med",id:e.id,f:+e.out.toFixed(4)}); }catch(err){} e.out=0; }
    e.st-=dt; const d=Math.hypot(P.x-m.x,P.z-m.z); if(e.st<=0&&d<24&&!P.dead){ e.st=rnd(5,6.5); const x=m.x, z=m.z, r=7; fxRing(x,z,0xff2a2a,r*1.6,1.1); m.mesh.userData.lunge=1.1; tone(90,.5,"sawtooth",0,.08); toast("⚠ 거인의 내려찍기! 점프!",null,1);
      setTimeout(()=>{ if(MEET.ev!==e||m.hp<=0) return; try{ SFX.shock(x,z,0xff6a3d,r,.6); }catch(err){ fxRing(x,z,0xff6a3d,r*1.4,.5); } P.shake=Math.max(P.shake||0,1); thud(); if(Math.hypot(P.x-x,P.z-z)<r) hurtPlayer(m.atk*1.7*(1-dmgReduce(stat().def)),{n:m.n}); },1100); } }
  if(e.k==="rain"){ const tn=performance.now(); e.stars.forEach(s=>{ if(s.got) return; const k=tEv-s.t; if(k<0) return; if(k>6.5){ if(s.g){ scene.remove(s.g); s.g=null; fxSpark(s.x,1,s.z,0xaaaaff,6); } return; } if(!s.g){ s.g=mevStarMesh(); }
      const f=Math.min(1,k/1.1); s.g.position.set(s.x,hAt(s.x,s.z)+1.1+(1-f)*15+Math.sin(tn/250+s.j)*.15*f,s.z); s.g.rotation.y+=dt*3; s.g.children[1].visible=f<1;
      if(f>=.6&&Math.hypot(P.x-s.x,P.z-s.z)<2.2&&!P.dead){ mevCatch(e,s.j,true); } }); }
  if(e.k==="lamp"){ const pts=[{x:P.x,z:P.z}].concat(e.mem.filter(id=>id!==G.id).map(id=>PEERS[id]).filter(o=>o&&!o.dead)); const tn=performance.now(); let lit=0;
    e.lamps.forEach((l,i)=>{ const on=pts.some(q=>Math.hypot(q.x-l.x,q.z-l.z)<3.2); if(on&&l.v<10) l.v=Math.min(10,l.v+dt); const k=Math.min(1,l.v/10); if(l.v>=10) lit++;
      l.g.userData.orb.material.opacity=.35+.6*k; l.g.userData.orb.material.color.setHex(k>=1?0xfff2a0:0xff9a40); l.g.userData.ring.material.opacity=on?.85:.45; l.g.userData.ring.rotation.z+=dt*(on?2.4:.6); l.g.userData.orb.scale.setScalar(1.1+k*.6+Math.sin(tn/300+i)*.06);
      if(Math.hypot(P.x-l.x,P.z-l.z)<60) placeLabel(l.lbl,l.x,4,l.z,l.v>=10?"🏮 <b>밝음!</b>":`🏮 <b>${Math.floor(l.v)}/10</b>`); else l.lbl.style.display="none"; });
    e.sent-=dt; if(e.sent<=0){ e.sent=1; try{ net.send({t:"mlc",id:e.id,v:e.lamps.map(l=>+l.v.toFixed(1))}); }catch(err){} }
    if(lit>=e.lamps.length){ try{ net.send({t:"mlc",id:e.id,v:e.lamps.map(l=>l.v)}); }catch(err){} mevEnd(true); } } }
function mevCatch(e,j,mine){ const s=e.stars[j]; if(!s||s.got) return; s.got=true; e.got++; if(s.g){ scene.remove(s.g); s.g=null; } fxSpark(s.x,1.5,s.z,0xfff2a0,mine?20:8);
  if(mine){ e.mine++; e.part=true; tone(1200+e.got*60,.08,"sine",0,.07); floatDmg(s.x,3,s.z,`🌠 ${e.got}/${e.tg}`,"gain"); try{ net.send({t:"mes",id:e.id,j}); }catch(err){} }
  if(e.got>=e.tg) mevEnd(true); }
NETR.me=(o,d)=>{ MEET.ver[o.id]=performance.now(); if(!d||!Array.isArray(d.mem)||d.mem.indexOf(G.id)<0) return; mevStart(d,o.id); };
NETR.med=(o,d)=>{ const e=MEET.ev; if(!e||e.id!==d.id||e.k!=="giant"||!e.m||!(d.f>0)) return; e.lost=Math.min(1,e.lost+Math.min(.5,d.f)); const m=e.m; m.hp=Math.max(0,m.mhp*(1-e.lost)); m.hit=.12; if(e.lost>=.999){ if(mobs.indexOf(m)>=0){ fxRing(m.x,m.z,0xff9ad8,10,.8); fxSpark(m.x,2,m.z,0xff9ad8,30); removeMob(m); } mevEnd(true); } };
NETR.mek=(o,d)=>{ const e=MEET.ev; if(!e||e.id!==d.id) return; if(e.m&&mobs.indexOf(e.m)>=0){ const m=e.m; fxRing(m.x,m.z,0xff9ad8,10,.8); fxSpark(m.x,2,m.z,0xff9ad8,30); removeMob(m); } mevEnd(true); };
NETR.mes=(o,d)=>{ const e=MEET.ev; if(!e||e.id!==d.id||e.k!=="rain") return; mevCatch(e,d.j|0,false); };
NETR.mlc=(o,d)=>{ const e=MEET.ev; if(!e||e.id!==d.id||e.k!=="lamp"||!Array.isArray(d.v)) return; e.lamps.forEach((l,i)=>{ if(d.v[i]>l.v) l.v=Math.min(10,d.v[i]); }); };
function mevDirect(grp,dt){ if(MEET.ev||grp.length<1) return; if(MEET.cur&&MEET.cur.k==="guard"&&!MEET.done[MEET.cur.id]) return; if(!meetHunt()||P.dead) return; MEET.evT-=dt; if(MEET.evT>0) return; MEET.evT=rnd(240,300);
  const ks=Object.keys(MEV_DEF).filter(k=>k!==MEET.evLast); const k=pick(ks); MEET.evLast=k; let x=P.x+Math.sin(P.rot)*8, z=P.z+Math.cos(P.rot)*8; if(!meetHunt(x,z)){ x=P.x; z=P.z; }
  const d={t:"me",id:G.id.slice(-4)+"e"+Date.now().toString(36),k,x:+x.toFixed(1),z:+z.toFixed(1),s:(Math.random()*4294967295)>>>0,at:Date.now(),end:Date.now()+MEV_DEF[k].dur*1000,mem:[G.id].concat(grp.map(o=>o.id)).sort()};
  try{ net.send(d); setTimeout(()=>{ try{ if(MEET.ev&&MEET.ev.id===d.id) net.send(d); }catch(e){} },1500); }catch(e){} mevStart(d,G.id); }
(function(){ const _dm=damageMob; damageMob=function(m,dmg,crit){ if(m&&m.meetG&&MEET.ev&&MEET.ev.m===m&&m.hp>0){ const e=MEET.ev; const h0=m.hp; _dm(m,dmg,crit); const f=(h0-Math.max(0,m.hp))/m.mhp; if(f>0){ e.lost=Math.min(1,e.lost+f); e.out+=f; e.part=true; } return; } return _dm(m,dmg,crit); };
  const _km=killMob; killMob=function(m){ const g=m&&m.meetG, mid=m&&m.mev, el=m&&m.elite; _km(m); try{ if(!m.titan){ mqAdd("kill",1); if(el) mqAdd("elite",1); } if(g&&MEET.ev&&MEET.ev.id===mid){ try{ net.send({t:"mek",id:mid}); }catch(e){} mevEnd(true); } }catch(e){ console.warn(e); } };
  const _ef=evFree; evFree=function(){ return _ef()&&!MEET.ev; }; })();

/* ---------- 매 프레임 ---------- */
function meetTick(dt){ if(!started||G.realm<0) return; const tn=performance.now();
  if(MEET.py<=.01&&P.y>.01&&P.vy>5){ MEET.jumps[G.id]=tn; const c=MEET.cur; if(c&&c.k==="jump"&&!MEET.done[c.id]){ try{ net.send({t:"mqj"}); }catch(e){} } } MEET.py=P.y;
  mevTick(dt); mqHiBtn();
  MEET.t-=dt; if(MEET.t>0) return; const step=.5-MEET.t; MEET.t=.5;
  MEET.sendT-=step; if(MEET.sendT<=0&&Object.keys(PEERS).length){ MEET.sendT=4; try{ net.send({t:"mh",v:88}); }catch(e){} }
  // 가까운 친구 · 만남 인사
  const near=meetPeers(MEET_R); const ids={}; near.forEach(o=>{ ids[o.id]=1; MEET.nearT[o.id]=(MEET.nearT[o.id]||0)+step; if(MEET.nearT[o.id]>=2&&(!MEET.met[o.id]||tn-MEET.met[o.id]>600000)) meetGreet(o); }); for(const id in MEET.nearT) if(!ids[id]) MEET.nearT[id]=Math.max(0,MEET.nearT[id]-step*.5);
  const grp=meetGroup(); if(grp.length) MEET.grpT+=step; else MEET.grpT=0;
  if(grp.length&&meetIsLeader(grp)){ mqDirect(grp,step); mevDirect(grp,step); } else if(!grp.length) MEET.evT=Math.max(MEET.evT,60);
  const c=MEET.cur;
  if(c){ if(c.L!==G.id){ if(!mqNearMem(MEET_KEEP)) MEET.lostT+=step; else MEET.lostT=0; if(MEET.lostT>15){ MEET.cur=null; mqSpotHide(); toast("🤝 친구와 멀어져서 만남 임무가 멈췄어요","다시 만나면 새 임무가 생겨요",2.4); } }
    if(MEET.cur){ if(G.sklN!=null&&MEET.lastSk!=null&&G.sklN>MEET.lastSk) mqAdd("skill",G.sklN-MEET.lastSk);
      if(c.k==="spot"&&c.x!=null&&!MEET.done[c.id]&&Math.hypot(P.x-c.x,P.z-c.z)<4.5&&!(MEET.myc[c.id]>0)){ MEET.myc[c.id]=1; MEET.dirty=true; }
      if(c.k==="guard"&&!MEET.done[c.id]&&meetHunt()&&mqNearMem(30)){ MEET.gsp=(MEET.gsp||0)-step; if(MEET.gsp<=0){ MEET.gsp=4.5; if(mobs.filter(m=>m.mtg===c.id&&m.hp>0).length<4){ const q=meetAround(P.x,P.z,11,15); meetSpawn(q.x,q.z,2,Math.random()<.2,{mtg:c.id}); } } }
      if(MEET.dirty){ MEET.dirty=false; try{ net.send({t:"mqc",id:c.id,c:MEET.myc[c.id]||0}); }catch(e){} }
      if(!MEET.done[c.id]){ if(mqTotal(c)>=c.tg) mqDone(c); else if(Date.now()>c.end+1500) mqFail(c); }
      if(c.L===G.id){ MEET.mqT-=step; if(MEET.mqT<=0) mqSend(); } } }
  MEET.lastSk=G.sklN||0;
  if(c&&c.k!=="guard") mobs.forEach(m=>{ if(m.mtg&&m.hp>0&&MEET.done[m.mtg]) { fxSpark(m.x,1.5,m.z,0xffffff,8); removeMob(m); } });
  meetHud(); }
XTICK.push(meetTick);
function mqHiBtn(){ const c=MEET.cur; const show=!!(c&&c.k==="hifive"&&!MEET.done[c.id]&&!(MEET.myc[c.id]>0)&&started&&!layerOpen&&!P.dead);
  if(!MEET.hfBtn){ if(!show) return; const b=document.createElement("button"); b.id="mtHi"; b.type="button"; b.textContent="🙌 하이파이브!"; b.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); meetHiFive(); }); document.body.appendChild(b); MEET.hfBtn=b; }
  MEET.hfBtn.hidden=!show; if(show){ const ok=c.mem.some(id=>{ const o=PEERS[id]; return id!==G.id&&o&&Math.hypot(o.x-P.x,o.z-P.z)<5; }); MEET.hfBtn.classList.toggle("ok",ok); } }
function meetHud(){ if(!MEET.hud){ const el=document.createElement("div"); el.id="meetq"; el.addEventListener("pointerdown",e=>e.stopPropagation()); el.onclick=()=>{ if(!layerOpen) showMeet(); }; const q=$("coop")||$("quest"); if(q&&q.parentNode) q.parentNode.insertBefore(el,q.nextSibling); else document.body.appendChild(el); MEET.hud=el; }
  const c=MEET.cur; MEET.hud.hidden=!c||!started; if(!c) return; const D=mqDef(c); const done=MEET.done[c.id]; const t=Math.min(mqTotal(c),c.tg); const left=Math.max(0,Math.ceil((c.end-Date.now())/1000));
  let txt; if(done===1) txt=c.st>=2?"🏆 3단계 완주!":"✔ 완료! 다음 단계 준비 중…"; else if(done===-1) txt="✖ 실패 — 잠시 뒤 새 임무"; else if(c.k==="guard") txt=`${D.ic} ${D.n} <small>${Math.floor(t)}/${c.tg}초${MEET.gTight===false&&c.L===G.id?" · 더 가까이!":""} · ${left}초</small>`; else if(c.k==="spot") txt=`${D.ic} ${D.n} <small>${c.x!=null?Math.round(Math.hypot(P.x-c.x,P.z-c.z))+"m":""} · ${left}초</small>`; else txt=`${D.ic} ${D.n} <small>${Math.floor(t)}/${c.tg} · ${left}초</small>`;
  const h=`<b>🤝 만남 임무 ${c.st+1}/3 · ${c.mem.length}명</b>${txt}<i style="width:${Math.round((done===1?1:t/c.tg)*100)}%"></i>`; if(MEET.hud._h!==h){ MEET.hud._h=h; MEET.hud.innerHTML=h; MEET.hud.classList.toggle("done",done===1); }
  const s=MEET.spotG; if(s){ s.g.userData.ring.rotation.z+=.03; const d=Math.hypot(P.x-s.x,P.z-s.z); if(d<70) placeLabel(s.lbl,s.x,4.2,s.z,`📍 비밀 장소 <b>${Math.round(d)}m</b>`); else s.lbl.style.display="none"; } }
function showMeet(){ const c=MEET.cur; const D=c?mqDef(c):null; const grp=meetPeers(MEET_KEEP);
  card(`<h2>🤝 만남 임무</h2><p>친구를 실제로 만나면(28걸음 안) 함께하는 임무가 3단계로 이어져요. 사냥터에 같이 있으면 4~5분마다 🎪 함께 이벤트도 열려요!</p>
   ${c?`<div class="row"><div class="ic">${D.ic}</div><div class="t"><div>${c.st+1}단계 · ${D.n}</div><span>${D.how}</span><span>함께: ${c.mem.map(meetName).join(", ")}</span><span class="tbar"><i style="width:${Math.round(Math.min(1,mqTotal(c)/c.tg)*100)}%"></i></span></div></div>`:`<p style="font-size:13px">${grp.length?"곧 새 만남 임무가 생겨요!":"지금은 곁에 친구가 없어요. 👥 버튼으로 친구에게 가 보세요."}</p>`}
   <h3>🎪 함께 이벤트</h3>${Object.values(MEV_DEF).map(v=>`<div class="row"><div class="ic">${v.ic}</div><div class="t"><div>${v.n}</div><span>${v===MEV_DEF.giant?"체력을 모두 함께 깎아요 · 빨간 고리는 점프로 피해요":v===MEV_DEF.rain?"하늘에서 떨어지는 별을 함께 받아요":"등불마다 한 명씩 서서 모두 밝혀요"}</span></div></div>`).join("")}
   <p style="font-size:12px">지금까지 만난 친구 ${G.meetFr||0}번 · 만남 임무 ${G.meetN||0}번 · 3단계 완주 ${G.meetChain||0}번 · 함께 이벤트 ${G.mevN||0}번</p>`); }
(function(){ const _st=showTeam; showTeam=function(){ _st(); try{ const cd=layers.querySelector(".card"); if(!cd) return; const d=document.createElement("div"); const c=MEET.cur; d.innerHTML=`<h3>🤝 만남 임무 ${c?`<small style="font-size:12px;opacity:.8">${c.st+1}/3 단계</small>`:""}</h3><p style="font-size:12.5px">${c?`${mqDef(c).ic} ${mqDef(c).n} — ${mqDef(c).how}`:"친구 곁(28걸음 안)에 가면 만남 임무와 🎪 함께 이벤트가 생겨요!"}</p>`; const btn=cd.querySelector("#cls"); cd.insertBefore(d,btn||null); }catch(e){} }; })();
TITLES.push({id:"mt10",n:"반가운 친구",t:1,h:"친구 만남 인사 10번(친구마다 하루 한 번)",g:()=>[G.meetFr||0,10]},{id:"mq20",n:"손발이 척척",t:1,h:"만남 임무 20번 완료",g:()=>[G.meetN||0,20]},
 {id:"mqc5",n:"끝까지 함께",t:2,h:"만남 임무 3단계 완주 5번",g:()=>[G.meetChain||0,5]},{id:"mev10",n:"함께라면 무적",t:2,h:"🎪 함께 이벤트 10번 성공",g:()=>[G.mevN||0,10]});
window.__meet={MEET,MQ_DEF,MEV_DEF,mqNew,mqAdopt,mqDone,mevStart,mevEnd,meetHiFive,meetPeers,meetGroup,showMeet,mqTotal};
</script>
<style>
#meetq{position:relative;margin-top:6px;padding:6px 10px 9px;border-radius:12px;background:linear-gradient(180deg,rgba(18,40,52,.86),rgba(14,22,40,.86));border:2px solid #6ff0d0;color:#fff;font-size:12.5px;line-height:1.35;pointer-events:auto;cursor:pointer;overflow:hidden;box-shadow:0 0 12px rgba(80,240,200,.35)}
#meetq[hidden]{display:none}
#meetq b{display:block;color:#9dffe0;font-size:12px}
#meetq small{opacity:.85}
#meetq i{position:absolute;left:0;bottom:0;height:4px;background:linear-gradient(90deg,#3affc0,#c8fff0);transition:width .3s}
#meetq.done{border-color:#ffd24a}
#mtbar{position:fixed;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);z-index:6;pointer-events:none;min-width:250px;max-width:min(48vw,440px);padding:6px 14px 8px;border-radius:14px;background:linear-gradient(180deg,rgba(52,14,46,.9),rgba(22,10,40,.9));border:2px solid #ff8ad8;box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 18px rgba(255,120,210,.45);color:#fff;text-align:center;display:flex;flex-direction:column;gap:2px}
#mtbar[hidden]{display:none}
#mtbar b{font-size:15px;color:#ffc8ee;text-shadow:0 2px 0 #000}
#mtbar span{font-size:12.5px;opacity:.95}
#mtbar i{display:block;height:6px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden;margin-top:2px}
#mtbar i s{display:block;height:100%;background:linear-gradient(90deg,#ff6ac8,#fff0fa);text-decoration:none}
body:has(#title) #mtbar,body.stOn #mtbar{visibility:hidden}
#mtHi{position:fixed;left:50%;bottom:calc(max(10px,env(safe-area-inset-bottom)) + 96px);transform:translateX(-50%);z-index:7;font-size:20px;font-weight:800;padding:12px 26px;border-radius:30px;border:3px solid #ffd24a;background:linear-gradient(180deg,#5a3a10,#2a1a08);color:#fff;opacity:.6;box-shadow:0 4px 0 #000}
#mtHi.ok{opacity:1;animation:mtHiP 0.8s ease-in-out infinite}
#mtHi[hidden]{display:none}
@keyframes mtHiP{50%{transform:translateX(-50%) scale(1.08)}}
@media (orientation:portrait){#mtbar{max-width:80vw;top:calc(max(8px,env(safe-area-inset-top)) + 150px)}}
</style>
