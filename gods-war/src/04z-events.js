<script>
/* ================= v53: 🎲 돌발 이벤트 · 🍀 길에서 줍기 · ★ 정예 괴물 =================
   - 정예 괴물: 사냥터 괴물의 12%가 ★정예(체력 2.6배·공격 1.45배·경험치/금화 3배·더 크고 금빛 고리). 잡으면 쇳조각 + 30% 장비.
   - 돌발 이벤트: 사냥터(수도 밖)에 있으면 2~3분마다 하나가 갑자기 벌어짐. 다섯 가지 —
       ⚔ 습격대(3파도) · 💰 황금 도깨비 도둑(도망가는 도깨비 잡기) · 👹 떠돌이 정예(내려찍기 하는 큰 괴물)
       ⭐ 떨어진 별 조각(괴물이 지키는 조각 7개 줍기) · 🔮 저주받은 제단 정화(제단 안에 버티며 20초 채우기)
     괴물 레벨은 내 레벨보다 높게(+1~+4) → 쉽지 않음. 성공하면 레벨의 12~20% 경험치·금화·재료·장비.
   - 길에서 줍기: 사냥터를 걸으면 앞쪽 길에 ✨가 생김(평균 70~120걸음마다, 동시에 3개까지). 무엇인지는 주워 봐야 앎 —
       금화·경험의 구슬·물약·쇳조각·건축 돌·태양 조각·룬 가루·신수 간식·두루마리·장비·보물 지도(지킴이가 있는 보물)
       그리고 함정: 수상한 상자(미믹 정예!)·독버섯(체력 -12%).
   - 저장: G.pk(주운 수) · G.evN(이벤트 성공) · G.eliteN(정예 처치). 칭호 3개. */
const EV={t:95,cur:null,last:"",id:0,bar:null,noElite:false};
const PK={list:[],dist:0,next:80,tm:null};
function evOver(){ return Math.abs(P.x)<WORLD_HALF&&Math.abs(P.z)<WORLD_HALF; }
function evRegion(){ if(!evOver()) return null; const r=regionAt(P.x,P.z); return r&&!r.cap?r:null; }
function evFree(){ return started&&G.realm>=0&&!P.dead&&!P.trial&&!layerOpen&&!(typeof RC!=="undefined"&&RC.on)&&!(typeof warActive==="function"&&warActive()&&typeof WAR!=="undefined"&&WAR.joined)&&!document.body.classList.contains("stOn"); }
function evTier(up){ let t=Math.min(3,Math.max(0,G.rank)); if(Math.random()<(up||0)) t=Math.min(3,t+1); return t; }
function evGear(up,x,z){ const t=evTier(up), s=pick(["w","a","r"]); G.bag.push({s,t}); try{ LOOT.drop(x!=null?x:P.x,z!=null?z:P.z,t); }catch(e){} return `${RAR[t].n} ${itemName(s,t)}`; }

/* ---------- ★ 정예 괴물 ---------- */
function makeElite(m){ if(!m||m.elite||m.boss) return m; m.elite=true; m.mhp=m.hp=Math.round(m.mhp*2.6); m.atk*=1.45; m.xp=Math.round(m.xp*3); m.gold=Math.round(m.gold*3); m.scale*=1.25; try{ const a=new THREE.Mesh(new THREE.RingGeometry(1.1,1.5,32),glowMat(0xffc83a,.75)); a.rotation.x=-Math.PI/2; a.position.y=.12; m.mesh.add(a); m.aura=a; }catch(e){} return m; }
(function(){ const _sp=spawnMob; spawnMob=function(rg,boss,world){ const m=_sp(rg,boss,world); if(m&&!boss&&!EV.noElite&&!rg.cap&&Math.random()<.15) makeElite(m); return m; };
  const _km=killMob; killMob=function(m){ const el=m.elite, ev=m.evId, x=m.x, z=m.z; _km(m);
    if(el){ G.eliteN=(G.eliteN||0)+1; const o=2+Math.floor(Math.random()*3); G.ore=(G.ore||0)+o; floatDmg(x,5,z,`★ 정예 · ⛓ +${o}`,"gain"); if(Math.random()<.3){ const nm=evGear(.15,x,z); toast("★ 정예의 전리품!",nm,2); jingle([659,784,1046]); } }
    if(ev&&EV.cur&&EV.cur.id===ev&&EV.cur.onKill) EV.cur.onKill(m); }; })();
function evSpawn(x,z,lvAdd,elite){ const rg=regionAt(x,z)||regionAt(P.x,P.z); if(!rg||rg.cap) return null; EV.noElite=true; let m=null; try{ m=spawnMob(rg,false,false); }finally{ EV.noElite=false; } if(!m) return null;
  const lv=Math.min(LVMAX,Math.max(rg.lv[0],G.lv)+lvAdd); const st=mobStats(lv,false); Object.assign(m,{lv,hp:st.mhp,mhp:st.mhp,atk:st.atk,xp:st.xp,gold:st.gold}); m.x=m.hx=x; m.z=m.hz=z; m.mesh.position.set(x,hAt(x,z),z); if(elite) makeElite(m); m.evId=EV.cur?EV.cur.id:-1; m.state="chase"; fxRing(x,z,0xff4060,3.2,.5); fxSpark(x,1.5,z,0xff6a80,12); return m; }
function evAround(r0,r1){ const a=rnd(0,6.283), d=rnd(r0,r1); return {x:clamp(P.x+Math.sin(a)*d,-WORLD_HALF+4,WORLD_HALF-4),z:clamp(P.z+Math.cos(a)*d,-WORLD_HALF+4,WORLD_HALF-4)}; }
function evAlive(){ return EV.cur?mobs.filter(m=>m.evId===EV.cur.id&&m.hp>0):[]; }

/* ---------- 이벤트 화면 띠 ---------- */
function evBar(){ if(!EV.bar){ const b=document.createElement("div"); b.id="evbar"; b.hidden=true; document.body.appendChild(b); EV.bar=b; } return EV.bar; }
function evHud(){ const b=evBar(), c=EV.cur; if(!c){ if(!b.hidden) b.hidden=true; return; } b.hidden=false; let top="", bot=0; ["warbar","bossbar"].forEach(id=>{ const el=$(id); if(el&&!el.hidden){ const r=el.getBoundingClientRect(); if(r.height>0) bot=Math.max(bot,r.bottom); } }); if(bot>0) top=Math.round(bot+6)+"px";   /* v88: 보스 체력판과 겹치지 않게 */ if(b._t!==top){ b._t=top; b.style.top=top; } const left=Math.max(0,Math.ceil(c.end-performance.now()/1000)); const p=Math.max(0,Math.min(1,c.prog()));
  const h=`<b>${c.ic} ${c.n}</b><span>${c.goal()} · ⏱ ${left}초</span><i><s style="width:${Math.round(p*100)}%"></s></i>`; if(b._h!==h){ b._h=h; b.innerHTML=h; } }
function evReward(c,mul){ const L=G.lv, need=xpNeed(L); const xp=Math.round(need*c.xp*(mul||1)), gold=Math.round((40+L*14)*c.gold*(mul||1)); gainXp(xp); G.gold+=gold; const got=[`경험치 +${fmt(xp)}`,`금화 +${fmt(gold)}`];
  if(c.ore){ G.ore=(G.ore||0)+c.ore; got.push(`⛓ +${c.ore}`); } if(c.rune){ G.rune=(G.rune||0)+c.rune; got.push(`✨ +${c.rune}`); } if(c.pots){ G.pots+=c.pots; got.push(`🧪 +${c.pots}`); }
  if(c.stone&&typeof wdGive==="function"){ wdGive(c.stone,true); got.push(`🧱 +${c.stone}`); } if(c.sun&&typeof gtGive==="function"){ gtGive(c.sun,true); got.push(`☀ +${c.sun}`); }
  if(c.item&&Math.random()<c.item) got.push("🎁 "+evGear(c.itemUp||0));
  return got; }
function evEnd(ok,why){ const c=EV.cur; if(!c) return; EV.cur=null; evHud();
  mobs.filter(m=>m.evId===c.id&&m.hp>0&&(m.ev||!ok)).forEach(m=>{ fxSpark(m.x,1.5,m.z,0xffffff,10); removeMob(m); });
  try{ c.clean&&c.clean(c); }catch(e){}
  if(ok){ G.evN=(G.evN||0)+1; const got=evReward(c); try{ lvBanner(c.ic+" 돌발 이벤트 성공!",c.n,got.join(" · "),"#7dffb0"); }catch(e){ toast(`${c.ic} ${c.n} 성공!`,got.join(" · "),3); } try{ fxPillar(0x7dffb0,.8,HIGH()?34:18,1.4,.45); }catch(e){} jingle([523,659,784,1046,1318]); buzz([30,20,60]); }
  else { toast(`${c.ic} ${c.n} 실패…`,why||"다음 기회에!",2.4); tone(220,.3,"sawtooth",0,.08); }
  saveGame(); EV.t=rnd(120,190); }

/* ---------- 다섯 가지 돌발 이벤트 ---------- */
const EVDEF={
 ambush:{ic:"⚔",n:"습격대",xp:.12,gold:1.4,ore:3,item:.45,dur:100,start(c){ c.w=0; c.next=()=>{ c.w++; const n=2+c.w; for(let i=0;i<n;i++){ const q=evAround(11,15); evSpawn(q.x,q.z,1+c.w,c.w>=2&&i===0); } toast(`⚔ 습격대 ${c.w}파도!`,`괴물 ${n}마리가 몰려와요`,1.6); tone(140,.4,"sawtooth",0,.12); }; c.next(); },
   tick(c){ if(!evAlive().length){ if(c.w>=3) return evEnd(true); c.next(); } }, goal(c){ return `${c.w}/3 파도 · 남은 괴물 ${evAlive().length}`; }, prog(c){ return (c.w-1+(1-evAlive().length/(2+c.w)))/3; } },
 thief:{ic:"💰",n:"황금 도깨비 도둑",xp:.1,gold:3.5,rune:1,item:.55,itemUp:.2,dur:35,start(c){ const q=evAround(12,15); const m=evSpawn(q.x,q.z,2,false); if(!m) return evEnd(false); m.ev=1; m.mhp=m.hp=Math.round(m.mhp*2.2); m.n="황금 도깨비"; m.scale*=.8; m.mesh.traverse(o=>{ if(o.material&&o.material.color){ o.material=o.material.clone(); o.material.color.setHex(0xffcf3a); if(o.material.emissive){ o.material.emissive.setHex(0x6a4a00); } } }); c.m=m; c.rest=6; c.blink=4; },
   tick(c,dt){ const m=c.m; if(!m||m.hp<=0||mobs.indexOf(m)<0) return evEnd(true); evThief(c,m,dt); }, onKill(){}, goal(c){ return c.m?`도망가는 도깨비를 잡아요 · 체력 ${Math.ceil(c.m.hp/c.m.mhp*100)}%`:""; }, prog(c){ return c.m?1-c.m.hp/c.m.mhp:1; }, fail:"도깨비가 금화를 들고 도망쳤어요!" },
 champ:{ic:"👹",n:"떠돌이 정예",xp:.18,gold:2,ore:5,rune:1,item:1,itemUp:.35,dur:120,start(c){ const q=evAround(13,16); const m=evSpawn(q.x,q.z,4,true); if(!m) return evEnd(false); m.mhp=m.hp=Math.round(m.mhp*2.4); m.atk*=1.25; m.scale*=1.3; m.n=m.n; c.m=m; c.st=4; toast("👹 떠돌이 정예가 나타났어요!","빨간 고리가 보이면 피해요",2.2); },
   tick(c,dt){ const m=c.m; if(!m||m.hp<=0||mobs.indexOf(m)<0) return evEnd(true); evStomp(c,m,dt); }, goal(c){ return c.m?`${c.m.n} 쓰러뜨리기 · 체력 ${Math.ceil(c.m.hp/c.m.mhp*100)}%`:""; }, prog(c){ return c.m?1-c.m.hp/c.m.mhp:1; }, fail:"정예가 떠나 버렸어요" },
 shard:{ic:"⭐",n:"떨어진 별 조각",xp:.15,gold:1.2,sun:5,item:.35,dur:55,start(c){ c.got=0; c.list=[]; for(let i=0;i<7;i++){ const q=evAround(9,26); c.list.push(evShard(q.x,q.z)); } for(let i=0;i<3;i++){ const q=evAround(10,18); evSpawn(q.x,q.z,2,i===0); } c.sp=6; toast("⭐ 별 조각이 떨어졌어요!","괴물을 피해 7개를 모아요",2.2); jingle([1046,1318,1568]); },
   tick(c,dt){ c.list.forEach(s=>{ if(s.got) return; s.g.rotation.y+=dt*2.5; s.g.position.y=hAt(s.x,s.z)+1.1+Math.sin(performance.now()/300+s.x)*.25; placeLabel(s.lbl,s.x,2.4,s.z,"⭐"); if(Math.hypot(P.x-s.x,P.z-s.z)<1.9){ s.got=true; c.got++; scene.remove(s.g); s.lbl.remove(); fxSpark(s.x,1.5,s.z,0xfff2a0,18); tone(1200+c.got*90,.08,"sine",0,.07); floatDmg(s.x,3,s.z,`⭐ ${c.got}/7`,"gain"); gainXp(Math.round(xpNeed(G.lv)*.01)); } });
     c.sp-=dt; if(c.sp<=0){ c.sp=7; if(evAlive().length<5){ const q=evAround(10,16); evSpawn(q.x,q.z,2,false); } } if(c.got>=7) evEnd(true); },
   clean(c){ c.list.forEach(s=>{ if(!s.got){ scene.remove(s.g); s.lbl.remove(); } }); }, goal(c){ return `별 조각 ${c.got}/7`; }, prog(c){ return c.got/7; }, fail:"별 조각이 빛을 잃었어요" },
 altar:{ic:"🔮",n:"저주받은 제단 정화",xp:.16,gold:1.3,pots:2,stone:10,item:.5,dur:80,start(c){ const a=P.rot; c.x=clamp(P.x+Math.sin(a)*9,-WORLD_HALF+6,WORLD_HALF-6); c.z=clamp(P.z+Math.cos(a)*9,-WORLD_HALF+6,WORLD_HALF-6); c.v=0; c.sp=1; c.mesh=evAltarMesh(c.x,c.z); toast("🔮 저주받은 제단!","보라 고리 안에서 20초 버티면 정화돼요",2.4); tone(110,.6,"sawtooth",0,.1); },
   tick(c,dt){ const inside=Math.hypot(P.x-c.x,P.z-c.z)<5.2; if(inside) c.v+=dt; const g=c.mesh; g.userData.ring.material.opacity=inside?.85:.45; g.userData.ring.rotation.z+=dt*(inside?2.5:.8); g.userData.orb.position.y=hAt(c.x,c.z)+2.6+Math.sin(performance.now()/260)*.2; g.userData.orb.material.color.setHex(c.v>=20?0xffffff:0xb050ff); placeLabel(c.lbl||(c.lbl=makeLabel("")),c.x,4.4,c.z,`🔮 정화 <b>${Math.floor(c.v)}/20초</b>`);
     c.sp-=dt; if(c.sp<=0){ c.sp=c.v>12?3:4; if(evAlive().length<6){ const q={x:c.x+rnd(-1,1)*12,z:c.z+rnd(-1,1)*12}; evSpawn(q.x,q.z,2,Math.random()<.2); } } if(c.v>=20) evEnd(true); },
   clean(c){ if(c.mesh) scene.remove(c.mesh); if(c.lbl) c.lbl.remove(); }, goal(c){ return Math.hypot(P.x-c.x,P.z-c.z)<5.2?`제단을 지키는 중 ${Math.floor(c.v)}/20초`:`보라 고리 안으로! ${Math.floor(c.v)}/20초`; }, prog(c){ return c.v/20; }, fail:"제단의 저주가 퍼져 버렸어요" } };
function evThief(c,m,dt){ const dx=m.x-P.x, dz=m.z-P.z, d=Math.hypot(dx,dz)||1; m.hit=Math.max(0,m.hit-dt); c.rest-=dt; c.blink-=dt; const tn=performance.now();
  if(m.hit>0) m.slowT=.5; m.slowT=Math.max(0,(m.slowT||0)-dt); let spd=c.rest<0?0:(m.slowT>0?3:8.2); if(c.rest<-1.3) c.rest=rnd(5,7);
  if(c.blink<=0&&d<7){ c.blink=rnd(4,6); const a=Math.atan2(dx,dz)+rnd(-.9,.9); fxSpark(m.x,1.4,m.z,0xffe27a,16); m.x=clamp(m.x+Math.sin(a)*7,-WORLD_HALF+4,WORLD_HALF-4); m.z=clamp(m.z+Math.cos(a)*7,-WORLD_HALF+4,WORLD_HALF-4); fxRing(m.x,m.z,0xffe27a,3,.4); tone(1500,.05,"square",0,.05); }
  if(d<30&&spd>0){ const a=Math.atan2(dx,dz)+Math.sin(tn/380)*.7; m.x=clamp(m.x+Math.sin(a)*spd*dt,-WORLD_HALF+4,WORLD_HALF-4); m.z=clamp(m.z+Math.cos(a)*spd*dt,-WORLD_HALF+4,WORLD_HALF-4); m.rot=a; }
  if(Math.random()<dt*2.5) fxSpark(m.x,1,m.z,0xffd24a,3);
  m.mesh.position.set(m.x,hAt(m.x,m.z)+(spd>0?Math.abs(Math.sin(tn/70))*.35:0),m.z); m.mesh.rotation.y=m.rot; try{ if(m.mesh.userData.gl) animState(m.mesh,m.hit>0?"hit":spd>0?"run":"idle"); }catch(e){} try{ hitTint(m.mesh,m.hit/.15); HITF.apply(m,dt); }catch(e){} const sc=m.scale; m.mesh.scale.setScalar(sc);
  if(d<48){ placeLabel(m.lbl,m.x,(m.mesh.userData.h||4)*m.scale,m.z,`💰 황금 도깨비 <b>Lv.${m.lv}</b>${c.rest<0?" 😮‍💨":""}<span class="hp mob"><s></s><i></i></span>`); hpBar(m.lbl,m.hp/m.mhp); } else m.lbl.style.display="none";
  if(d>45) evEnd(false,"도깨비가 너무 멀리 도망쳤어요"); }
function evStomp(c,m,dt){ c.st-=dt; const d=Math.hypot(P.x-m.x,P.z-m.z); if(c.st<=0&&d<22&&!P.dead){ c.st=rnd(4,5.5); const x=m.x, z=m.z, r=6.5; fxRing(x,z,0xff2a2a,r*1.6,1.1); m.mesh.userData.lunge=1.1; tone(90,.5,"sawtooth",0,.08);
    setTimeout(()=>{ if(!EV.cur||m.hp<=0) return; try{ SFX.shock(x,z,0xff6a3d,r,.6); }catch(e){ fxRing(x,z,0xff6a3d,r*1.4,.5); } P.shake=Math.max(P.shake||0,1); thud(); if(Math.hypot(P.x-x,P.z-z)<r) hurtPlayer(m.atk*1.9*(1-dmgReduce(stat().def)),{n:m.n,sure:true}); },1100); } }
function evShard(x,z){ const g=new THREE.Group(); const s=new THREE.Mesh(new THREE.OctahedronGeometry(.55),glowMat(0xfff2a0,.95)); g.add(s); const b=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,7,6,1,true),glowMat(0xfff2a0,.22)); b.position.y=2.6; g.add(b); g.position.set(x,hAt(x,z)+1.1,z); g.userData.noOutline=true; scene.add(g); return {g,x,z,got:false,lbl:makeLabel("")}; }
function evAltarMesh(x,z){ const g=new THREE.Group(); const y=hAt(x,z); const base=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.7,1.6,8),mat({color:0x3a2650,roughness:.8})); base.position.set(x,y+.8,z); g.add(base);
  const ring=new THREE.Mesh(new THREE.RingGeometry(4.8,5.2,48),glowMat(0xb050ff,.5)); ring.rotation.x=-Math.PI/2; ring.position.set(x,y+.15,z); g.add(ring); const orb=sph(.55,glowMat(0xb050ff,.95),x,y+2.6,z); g.add(orb); g.userData={ring,orb,noOutline:true}; scene.add(g); return g; }
function evStart(k){ const r=evRegion(); if(!r) return false; const D=EVDEF[k]; EV.id++; EV.last=k; const c=Object.assign({},D,{k,id:EV.id,end:performance.now()/1000+D.dur}); c.goal=()=>D.goal(c); c.prog=()=>D.prog(c); EV.cur=c;
  try{ fxRing(P.x,P.z,0xffd24a,10,.8); }catch(e){} jingle([392,523,392,659]); buzz([40,30,40]); D.start(c); return true; }
function evTick(dt){ evHud(); if(!started) return; const c=EV.cur;
  if(c){ if(P.dead||!evOver()) return evEnd(false,P.dead?"쓰러져서 이벤트가 끝났어요":"이벤트 장소를 떠났어요"); if(performance.now()/1000>c.end) return evEnd(false,c.fail||"시간이 다 됐어요"); try{ c.tick(c,dt); }catch(e){ console.warn(e); evEnd(false); } return; }
  if(!evFree()||!evRegion()) return; EV.t-=dt; if(EV.t>0) return; if(mobs.some(m=>m.boss&&m.state==="chase")){ EV.t=20; return; }
  const ks=Object.keys(EVDEF).filter(k=>k!==EV.last); evStart(pick(ks)); }
XTICK.push(evTick);

/* ---------- 🍀 길에서 줍기 ---------- */
const PKT=[
 {k:"gold",w:26,ic:"🪙",n:"금화 주머니",c:0xffd24a,f(){ const g=Math.round((20+G.lv*6)*rnd(.6,1.6)); G.gold+=g; return `금화 +${fmt(g)}`; }},
 {k:"xp",w:15,ic:"🔮",n:"경험의 구슬",c:0xb8a0ff,f(){ const x=Math.round(xpNeed(G.lv)*rnd(.015,.035)); gainXp(x); return `경험치 +${fmt(x)}`; }},
 {k:"pot",w:10,ic:"🧪",n:"떨어진 물약",c:0x9dffb8,f(){ G.pots++; return "물약 +1"; }},
 {k:"ore",w:12,ic:"⛓",n:"쇳조각 무더기",c:0xc8d0dc,f(){ const n=rint(2,4); G.ore=(G.ore||0)+n; return `쇳조각 +${n}`; }},
 {k:"stone",w:7,ic:"🧱",n:"건축 돌",c:0xe0c8a0,f(){ const n=rint(3,6); if(typeof wdGive==="function") wdGive(n,true); else G.gold+=n*8; return `건축 돌 +${n}`; }},
 {k:"sun",w:5,ic:"☀",n:"태양 열쇠 조각",c:0xffb040,f(){ if(typeof gtGive==="function") gtGive(2,true); else G.gold+=30; return "태양 조각 +2"; }},
 {k:"rune",w:4,ic:"✨",n:"룬 가루",c:0x9fe0ff,f(){ G.rune=(G.rune||0)+1; return "룬 가루 +1"; }},
 {k:"snack",w:5,ic:"🍖",n:"신수 간식",c:0xff9a6a,f(){ let n=0; try{ n=petGain(5); }catch(e){} if(G.pet>=0&&G.pets&&G.pets[G.pet]) return "짝꿍 신수 경험치 +5"; const g=25+G.lv*3; G.gold+=g; return `신수가 없어서 팔았어요 · 금화 +${g}`; }},
 {k:"scroll",w:4,ic:"📜",n:"낡은 두루마리",c:0xfff0b0,f(){ if(typeof bfAdd!=="function"){ G.gold+=60; return "금화 +60"; } const k=pick(Object.keys(BUFFS)); bfAdd(k); return `${BUFFS[k].ic} ${BUFFS[k].n} 효과 (${BUFFS[k].d})`; }},
 {k:"gear",w:3,ic:"🎁",n:"버려진 장비",c:0xb070ff,f(){ return evGear(.15); }},
 {k:"map",w:3,ic:"🗺",n:"보물 지도",c:0x7dd0ff,f(){ return pkMap(); }},
 {k:"mimic",w:3,ic:"📦",n:"수상한 상자",c:0xffd24a,f(){ const m=evSpawnFree(P.x+Math.sin(P.rot)*2.5,P.z+Math.cos(P.rot)*2.5,3); if(m){ m.n="미믹"; } P.shake=Math.max(P.shake||0,.8); tone(120,.3,"sawtooth",0,.12); return "함정이었다! 미믹이 덤벼요"; }, trap:1},
 {k:"shroom",w:3,ic:"🍄",n:"독버섯",c:0x9dff70,f(){ const d=Math.round(stat().mhp*.12); hurtPlayer(d,{n:"독버섯",sure:true}); return `으악, 독버섯! 체력 -${fmt(d)}`; }, trap:1} ];
function evSpawnFree(x,z,lvAdd){ const id=EV.cur?EV.cur.id:-1; const keep=EV.cur; EV.cur=null; const m=evSpawn(x,z,lvAdd,true); EV.cur=keep; if(m) m.evId=undefined; return m; }
function pkSpawn(){ if(PK.list.length>=3) return; const a=P.rot+rnd(-.35,.35), d=rnd(10,16); const x=P.x+Math.sin(a)*d, z=P.z+Math.cos(a)*d; if(Math.abs(x)>WORLD_HALF-4||Math.abs(z)>WORLD_HALF-4) return; const r=regionAt(x,z); if(!r||r.cap) return;
  let s=0; PKT.forEach(t=>s+=t.w); let q=Math.random()*s, T=PKT[0]; for(const t of PKT){ q-=t.w; if(q<0){ T=t; break; } }
  const col=T.trap?0xfff2a0:T.c; const g=new THREE.Group(); const o=sph(.36,glowMat(col,.95),0,0,0); g.add(o); const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.75,24),glowMat(col,.6)); ring.rotation.x=-Math.PI/2; g.add(ring); const beam=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,4.5,6,1,true),glowMat(col,.25)); beam.position.y=2; g.add(beam);
  g.userData.noOutline=true; g.position.set(x,hAt(x,z),z); scene.add(g); PK.list.push({g,o,ring,x,z,T,t:90,lbl:makeLabel("")}); }
function pkTick(dt){ if(!started||G.realm<0) return; const tn=performance.now();
  if(evOver()&&!P.dead&&P.moving&&!(typeof RC!=="undefined"&&RC.on)){ const r=regionAt(P.x,P.z); if(r&&!r.cap){ const step=Math.hypot(P.x-(PK.lx??P.x),P.z-(PK.lz??P.z)); if(step<3) PK.dist+=step; if(PK.dist>=PK.next){ PK.dist=0; PK.next=rnd(70,120); pkSpawn(); } } }
  PK.lx=P.x; PK.lz=P.z;
  for(let i=PK.list.length-1;i>=0;i--){ const p=PK.list[i]; p.t-=dt; const d=Math.hypot(P.x-p.x,P.z-p.z);
    if(p.t<=0||d>90||!evOver()){ scene.remove(p.g); p.lbl.remove(); PK.list.splice(i,1); continue; }
    const y=hAt(p.x,p.z); p.o.position.y=.9+Math.sin(tn/280+p.x)*.18; p.ring.position.y=.12; p.ring.scale.setScalar(1+Math.sin(tn/300)*.15); p.g.position.y=y; if(d<40) placeLabel(p.lbl,p.x,2.1,p.z,"✨"); else p.lbl.style.display="none";
    if(d<1.9&&!P.dead){ scene.remove(p.g); p.lbl.remove(); PK.list.splice(i,1); G.pk=(G.pk||0)+1; const txt=p.T.f(); fxSpark(p.x,1.2,p.z,p.T.c,p.T.trap?10:18); try{ PICKFLY.pick(p.T,p.x,p.z); }catch(e){} if(!p.T.trap){ tone(1000,.06,"sine",0,.06); tone(1400,.08,"sine",.05,.05); } floatDmg(p.x,3.2,p.z,`${p.T.ic} ${p.T.n}`,p.T.trap?"me":"gain"); toast(`${p.T.ic} ${p.T.n}!`,txt,1.8); saveGame(); } } }
XTICK.push(pkTick);

/* ---------- 🗺 보물 지도 ---------- */
function pkMap(){ if(PK.tm){ const g=Math.round(30+G.lv*5); G.gold+=g; return `지도가 겹쳐서 팔았어요 · 금화 +${g}`; } for(let k=0;k<20;k++){ const a=rnd(0,6.283), d=rnd(35,60); const x=P.x+Math.sin(a)*d, z=P.z+Math.cos(a)*d; if(Math.abs(x)>WORLD_HALF-8||Math.abs(z)>WORLD_HALF-8) continue; const r=regionAt(x,z); if(!r||r.cap) continue;
    const g=new THREE.Group(); const X1=new THREE.Mesh(new THREE.BoxGeometry(2.6,.12,.45),glowMat(0xff3a3a,.85)); X1.rotation.y=.785; const X2=X1.clone(); X2.rotation.y=-.785; g.add(X1,X2); const beam=new THREE.Mesh(new THREE.CylinderGeometry(.25,.3,14,8,1,true),glowMat(0xffd24a,.22)); beam.position.y=7; g.add(beam); g.position.set(x,hAt(x,z)+.15,z); g.userData.noOutline=true; scene.add(g);
    PK.tm={x,z,g,guards:false,t:300,lbl:makeLabel("")}; try{ setGuide({x,z,label:"🗺 보물 지도 표시"}); }catch(e){} return "보물 위치를 길 안내해요 (지킴이 조심!)"; }
  const g=30+G.lv*5; G.gold+=g; return `지도가 찢어져 있어요 · 금화 +${g}`; }
function tmTick(dt){ const T=PK.tm; if(!T) return; T.t-=dt; T.g.rotation.y+=dt; const d=Math.hypot(P.x-T.x,P.z-T.z); if(d<60) placeLabel(T.lbl,T.x,3,T.z,`🗺 보물 <b>${Math.round(d)}m</b>`); else T.lbl.style.display="none";
  const end=()=>{ scene.remove(T.g); T.lbl.remove(); PK.tm=null; if(P.guide&&P.guide.label==="🗺 보물 지도 표시"){ P.guide=null; $("guide").hidden=true; } };
  if(T.t<=0) { end(); toast("🗺 보물 지도가 바래 버렸어요",null,1.6); return; }
  if(d<8&&!T.guards){ T.guards=[]; for(let i=0;i<2;i++){ const m=evSpawnFree(T.x+rnd(-4,4),T.z+rnd(-4,4),2); if(m){ m.n=m.n; m.tg=1; T.guards.push(m); } } toast("🗺 보물 지킴이가 나타났어요!","지킴이를 모두 쓰러뜨려야 보물을 꺼내요",2.2); tone(140,.4,"sawtooth",0,.12); }
  if(T.guards&&d<3&&T.guards.every(m=>m.hp<=0||mobs.indexOf(m)<0)){ end(); const L=G.lv; const gold=Math.round((120+L*30)*rnd(.9,1.3)); const xp=Math.round(xpNeed(L)*.08); G.gold+=gold; gainXp(xp); G.rune=(G.rune||0)+1; G.ore=(G.ore||0)+4; G.tmN=(G.tmN||0)+1; const got=[`금화 +${fmt(gold)}`,`경험치 +${fmt(xp)}`,"✨ +1","⛓ +4"]; if(Math.random()<.6) got.push("🎁 "+evGear(.3,T.x,T.z)); else { try{ LOOT.drop(T.x,T.z,1); }catch(e){} }
    try{ COINFLY.burst(T.x,1,T.z,8); [["✨",0x9fe0ff],["⛓",0xc8d0dc],["🎁",0xb070ff]].forEach((q,i)=>PICKFLY.fly(T.x,1,T.z,q[0],q[1],i)); }catch(e){}
    try{ lvBanner("🗺 보물을 찾았어요!","숨겨진 보물 상자",got.join(" · "),"#ffd24a"); }catch(e){ toast("🗺 보물 상자!",got.join(" · "),3); } jingle([523,659,784,1046,1318]); saveGame(); } }
XTICK.push(tmTick);

/* ---------- 칭호 ---------- */
TITLES.push({id:"pk50",n:"줍기 대장",t:1,h:"길에서 물건 50개 줍기",g:()=>[G.pk||0,50]},{id:"pk300",n:"반짝이 수집가",t:2,h:"길에서 물건 300개 줍기",g:()=>[G.pk||0,300]},
 {id:"ev10",n:"돌발 사냥꾼",t:1,h:"돌발 이벤트 10번 성공",g:()=>[G.evN||0,10]},{id:"ev50",n:"모험의 해결사",t:2,h:"돌발 이벤트 50번 성공",g:()=>[G.evN||0,50]},
 {id:"el30",n:"정예 사냥꾼",t:1,h:"★정예 괴물 30마리 잡기",g:()=>[G.eliteN||0,30]},{id:"tm5",n:"보물 사냥꾼",t:2,h:"보물 지도로 보물 5번 찾기",g:()=>[G.tmN||0,5]});
</script>
<style>
#evbar{position:fixed;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);z-index:6;pointer-events:none;min-width:240px;max-width:min(46vw,420px);padding:6px 14px 8px;border-radius:14px;background:linear-gradient(180deg,rgba(40,18,10,.88),rgba(22,10,30,.88));border:2px solid #ffc83a;box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 18px rgba(255,180,40,.45);color:#fff;text-align:center;display:flex;flex-direction:column;gap:2px}
#evbar[hidden]{display:none}
#evbar b{font-size:15px;color:#ffe08a;text-shadow:0 2px 0 #000}
#evbar span{font-size:12.5px;opacity:.95}
#evbar i{display:block;height:6px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden;margin-top:2px}
#evbar i s{display:block;height:100%;background:linear-gradient(90deg,#ffb020,#fff07a);text-decoration:none}
body:has(#title) #evbar,body.stOn #evbar{visibility:hidden}
@media (orientation:portrait){#evbar{max-width:80vw;top:calc(max(8px,env(safe-area-inset-top)) + 150px)}}
</style>
