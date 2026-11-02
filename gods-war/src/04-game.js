<script>
/* ================= 플레이어 ================= */
const P={x:0,z:0,y:0,vy:0,rot:0,hp:1,walk:0,moving:false,atkCd:0,sklCd:[0,0,0],rage:0,haste:0,combat:0,dashT:0,atkAnim:0,slow:0,weak:0,shadow:0,dizzy:0,heat:0,dead:false,deadT:0,orbitT:0,orbitTick:0,capProg:0,capRg:-1,bag:null,trial:null,invul:0,hitFlash:0};
let player=null, weaponMesh=null, orbitMesh=null;
function buildPlayer(){ if(player){ scene.remove(player); } player=makeAvatar(G.realm,G.rank,false); scene.add(player); applyWeapon(); }
function applyWeapon(){ if(!player) return; if(weaponMesh){ weaponMesh.parent.remove(weaponMesh); weaponMesh=null; } if(G.eq.w>=0){ weaponMesh=makeWeapon(G.realm,G.eq.w); weaponMesh.position.set(0,-1.2,.3); weaponMesh.rotation.x=-.3; player.userData.armR.add(weaponMesh); } }
function homeShrine(){ const a=ALTARS[G.realm*3]; return a?a.shrine:new THREE.Vector3(0,0,0); }
function spawnAtHome(){ const s=homeShrine(); const rg=REGIONS[G.realm*3]; const dir=rg.z>0?-1:1; P.x=s.x+rnd(-2,2); P.z=s.z+dir*20; P.y=0; P.vy=0; P.rot=rg.z>0?0:Math.PI; }
function setRealmTheme(){ const R=RM(); document.documentElement.style.setProperty("--c1",R.c1); document.documentElement.style.setProperty("--c2",R.c2); R.skills.forEach((S,i)=>{ $("sklNm"+i).textContent=S.n; }); }

/* ================= 괴물 ================= */
const mobs=[]; const REG_STATE=REGIONS.map(()=>({bossT:rnd(20,60),boss:null}));
function mobStats(lv,boss){ const m=boss?6:1; return {mhp:Math.round((22+lv*13)*m),atk:(3+lv*1.7)*(boss?1.4:1),xp:Math.round((10+lv*7)*(boss?12:1)),gold:Math.round((4+lv*2)*(boss?15:1))}; }
function spawnMob(rg,boss,world){
  const R=rg.realm>=0?REALMS[rg.realm]:REALMS[Math.floor(Date.now()/60000)%4];
  const def=boss?(world?R.worldBoss:R.boss):pick(R.mobs);
  const lv=boss?(world?rint(34,40):rg.lv[1]+2):rint(rg.lv[0],rg.lv[1]);
  const st=mobStats(lv,boss); const scale=boss?(world?2.6:1.9):rnd(.85,1.15);
  let x,z; for(let k=0;k<12;k++){ const a=rnd(0,6.3), d=rg.cap?rnd(28,rg.r-6):rnd(8,rg.r-8); x=rg.x+Math.cos(a)*d; z=rg.z+Math.sin(a)*d; if(Math.hypot(x-P.x,z-P.z)>14) break; }
  const m={n:def.n,shape:def.shape,mesh:makeMob(def.shape,def.c,scale),x,z,hx:x,hz:z,lv,boss:!!boss,world:!!world,hp:st.mhp,mhp:st.mhp,atk:st.atk,xp:st.xp,gold:st.gold,rg:rg.id,cd:0,state:"idle",t:rnd(0,3),lbl:makeLabel(boss?"boss":""),rot:rnd(0,6.3),hit:0,scale,power:boss?def.p:0};
  m.mesh.position.set(x,0,z); scene.add(m.mesh); mobs.push(m); if(boss){ REG_STATE[rg.id].boss=m; toast(world?`세계 보스 ${def.n} 출현!`:`${def.n}이(가) 나타났다!`,world?`파워 ${def.p} · 세계의 중심`:rg.n,2.6); tone(90,.4,"sawtooth",0,.2); buzz([60,40,60]); }
  return m; }
function removeMob(m){ scene.remove(m.mesh); m.lbl.remove(); const i=mobs.indexOf(m); if(i>=0) mobs.splice(i,1); if(m.boss){ const s=REG_STATE[m.rg]; if(s.boss===m) s.boss=null; } }
function tickMobs(dt){
  // 지역별 스폰: 내가 근처에 있는 지역만
  REGIONS.forEach(rg=>{ const d=Math.hypot(P.x-rg.x,P.z-rg.z); const s=REG_STATE[rg.id]; if(d>rg.r+50) return; const cnt=mobs.filter(m=>m.rg===rg.id&&!m.boss).length; const want=rg.cap?3:rg.center?7:5; if(cnt<want&&Math.random()<dt*.8) spawnMob(rg,false,false);
    if(!rg.cap&&!P.trial){ s.bossT-=dt; if(s.bossT<=0&&!s.boss&&d<rg.r+10){ spawnMob(rg,true,!!rg.center); s.bossT=rg.center?300:240; } } });
  const st=stat();
  for(let i=mobs.length-1;i>=0;i--){ const m=mobs[i]; const dx=P.x-m.x, dz=P.z-m.z, d=Math.hypot(dx,dz);
    if(d>150){ removeMob(m); continue; }
    m.hit=Math.max(0,m.hit-dt); m.cd-=dt; m.t-=dt;
    const spd=(m.boss?3.4:m.shape==="wolf"?5.2:3.6)*(m.scale>1.5?1.1:1);
    const safe=inCapital(P.x,P.z); const shrineD=safe?Math.hypot(P.x-ALTARS[safe.id].shrine.x,P.z-ALTARS[safe.id].shrine.z):99;
    const aggro=!P.dead&&d<(m.boss?24:11)&&shrineD>18&&!(m.trial===false);
    if(m.trialOf&&!P.trial){ removeMob(m); continue; }
    if(aggro){ m.state="chase"; if(d>(m.boss?3.4:2.3)){ m.x+=dx/d*spd*dt; m.z+=dz/d*spd*dt; m.rot=Math.atan2(dx,dz); } else if(m.cd<=0){ m.cd=m.boss?1.7:1.5; hurtPlayer(m.atk*(1-dmgReduce(st.def)),m.n); m.mesh.userData.lunge=.25; } }
    else { if(m.t<=0){ m.t=rnd(1.5,4); m.state=Math.random()<.5?"idle":"wander"; m.wx=m.hx+rnd(-8,8); m.wz=m.hz+rnd(-8,8); } if(m.state==="wander"){ const wx=m.wx-m.x, wz=m.wz-m.z, wd=Math.hypot(wx,wz); if(wd>.5){ m.x+=wx/wd*1.6*dt; m.z+=wz/wd*1.6*dt; m.rot=Math.atan2(wx,wz); } } }
    const rg=REGIONS[m.rg]; const rd=Math.hypot(m.x-rg.x,m.z-rg.z); if(rd>rg.r+6){ m.x+= (rg.x-m.x)/rd*spd*dt; m.z+=(rg.z-m.z)/rd*spd*dt; }
    m.x=clamp(m.x,-WORLD_HALF+3,WORLD_HALF-3); m.z=clamp(m.z,-WORLD_HALF+3,WORLD_HALF-3);
    m.mesh.position.set(m.x,(m.mesh.userData.float?Math.sin(performance.now()/400+m.x)*.3+.2:0)+(m.mesh.userData.lunge>0?.4:0),m.z); if(m.mesh.userData.lunge>0) m.mesh.userData.lunge-=dt;
    let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*8);
    const sc=m.scale*(m.hit>0?1.12:1); m.mesh.scale.set(sc,sc,sc);
    if(d<48){ const h=m.mesh.userData.float?3.6:(m.shape==="giant"?5.6:m.shape==="wolf"?2.8:m.shape==="snake"?2:4.4); placeLabel(m.lbl,m.x,h*m.scale,m.z,`${m.boss?"👑 ":""}${m.n} <b>Lv.${m.lv}${m.power?" · 파워 "+m.power:""}</b><span class="hp"><i style="width:${Math.round(m.hp/m.mhp*100)}%"></i></span>`); } else m.lbl.style.display="none";
  }
  const bb=$("bossbar"); const near=mobs.find(m=>m.boss&&Math.hypot(m.x-P.x,m.z-P.z)<40); if(near){ bb.hidden=false; $("bossNm").textContent=(near.trialOf?"승급 시험: ":"")+near.n; $("bossHp").style.width=Math.round(near.hp/near.mhp*100)+"%"; } else bb.hidden=true;
}
function damageMob(m,dmg,crit){ if(m.hp<=0) return; dmg=Math.round(dmg); m.hp-=dmg; m.hit=.15; P.combat=4; floatDmg(m.x,3.5*m.scale,m.z,"-"+fmt(dmg),crit?"crit":""); fxSpark(m.x,1.8*m.scale,m.z,crit?0xffe08a:0xffffff,crit?16:8); tone(crit?660:440,.06,"square",0,.08);
  if(m.hp<=0){ killMob(m); } }
function killMob(m){ const st=stat(); G.kills++; gainXp(m.xp); G.gold+=m.gold; fxFlash(m.x,2,m.z,0xffe08a,m.boss?6:2.2,.45); fxRing(m.x,m.z,0xffffff,m.boss?10:3);
  floatDmg(m.x,4,m.z,`+${m.gold} 금화`,"");
  // 드랍
  const rg=REGIONS[m.rg]; const roll=Math.random(); let tier=-1; if(m.boss){ tier=m.world?3:Math.min(3,Math.floor(rg.lv[1]/10)+1); if(Math.random()<.35) tier=Math.min(3,tier+1); } else if(roll<.06){ tier=Math.min(3,Math.floor(rg.lv[0]/8)); if(Math.random()<.15) tier=Math.min(3,tier+1); }
  if(tier>=0){ const s=pick(["w","a","r"]); G.bag.push({s,t:tier}); toast(`${RAR[tier].n} 아이템!`,itemName(s,tier),2.2); jingle([659,784,1046]); }
  if(Math.random()<(m.boss?1:.08)){ G.pots++; }
  if(m.boss){ G.bossKills++; toast(`${m.n} 처치!`,`경험치 +${m.xp} · 금화 +${m.gold}`,2.6); jingle([523,659,784,1046,1318]); buzz([40,30,80]); if(m.trialOf){ finishTrial(true); } }
  questEvent("kill",m); removeMob(m); saveGame(); }

/* ================= 전투 ================= */
function facingHit(x,z,r,ang){ const dx=x-P.x, dz=z-P.z, d=Math.hypot(dx,dz); if(d>r) return false; if(d<1.2) return true; let a=Math.atan2(dx,dz)-P.rot; while(a>Math.PI)a-=Math.PI*2; while(a<-Math.PI)a+=Math.PI*2; return Math.abs(a)<ang; }
function attack(){ if(P.dead||P.atkCd>0) return; P.atkCd=.28; P.atkAnim=.25; P.combat=4; const st=stat(); let any=false;
  mobs.forEach(m=>{ if(facingHit(m.x,m.z,3.4+(m.scale>1.5?1.5:0),1.0)){ const crit=Math.random()<st.crit; damageMob(m,st.atk*rnd(.9,1.1)*(crit?1.8:1),crit); any=true; } });
  for(const id in PEERS){ const o=PEERS[id]; if(o.realm===G.realm||o.dead) continue; if(inCapital(o.x,o.z)||inCapital(P.x,P.z)) continue; if(facingHit(o.x,o.z,3.4,1.0)){ const crit=Math.random()<st.crit; const dmg=Math.round(st.atk*rnd(.9,1.1)*(crit?1.8:1)*.55); net.send({t:"hit",to:id,d:dmg}); floatDmg(o.x,4,o.z,"-"+fmt(dmg),crit?"crit":""); any=true; } }
  if(any){ tone(220,.05,"square",0,.1); buzz(15); } else tone(180,.04,"triangle",0,.05);
  net.send({t:"a",k:"atk"}); }
function useSkill(i){ i=i||0; if(P.dead||layerOpen) return; const S=RM().skills[i]; if(!S) return; if(G.rank<S.rank){ toast(`${RM().ranks[S.rank]}부터 쓸 수 있어요`,S.n,1.4); return; } if(P.sklCd[i]>0) return; const st=stat(); P.sklCd[i]=S.cd; P.atkAnim=.4; P.combat=4; net.send({t:"a",k:"skl"});
  const hitMob=(m,mult)=>{ const crit=Math.random()<st.crit; damageMob(m,st.atk*mult*rnd(.9,1.1)*(crit?1.8:1),crit); };
  const hitPl=(o,id,mult)=>{ if(o.realm===G.realm||o.dead||inCapital(o.x,o.z)||inCapital(P.x,P.z)) return; const dmg=Math.round(st.atk*mult*.55); net.send({t:"hit",to:id,d:dmg}); floatDmg(o.x,4,o.z,"-"+fmt(dmg)); };
  const aoe=(r,mult)=>{ fxRing(P.x,P.z,S.color,r*1.6,.5); fxFlash(P.x,2,P.z,S.color,r*.8,.4); fxSpark(P.x,2,P.z,S.color,40); mobs.forEach(m=>{ if(Math.hypot(m.x-P.x,m.z-P.z)<r) hitMob(m,mult); }); for(const id in PEERS){ const o=PEERS[id]; if(Math.hypot(o.x-P.x,o.z-P.z)<r) hitPl(o,id,mult); } };
  if(S.type==="aoe"){ aoe(S.r,S.mult); if(S.heal){ P.hp=Math.min(st.mhp,P.hp+st.mhp*S.heal); } jingle([784,1046,1318]); buzz(30); }
  else if(S.type==="line"){ fxLine(P.x,P.z,P.rot,S.r,S.color); const inLine=(x,z)=>{ const dx=x-P.x,dz=z-P.z; const f=dx*Math.sin(P.rot)+dz*Math.cos(P.rot); const side=Math.abs(dx*Math.cos(P.rot)-dz*Math.sin(P.rot)); return f>0&&f<S.r&&side<(S.w||2.6); }; mobs.forEach(m=>{ if(inLine(m.x,m.z)){ hitMob(m,S.mult); fxSpark(m.x,2,m.z,S.color,12); } }); for(const id in PEERS){ const o=PEERS[id]; if(inLine(o.x,o.z)) hitPl(o,id,S.mult); } tone(120,.3,"sawtooth",0,.15); buzz(25); }
  else if(S.type==="orbit"){ P.orbitT=S.dur; if(!orbitMesh){ orbitMesh=new THREE.Mesh(new THREE.TorusGeometry(1,.16,10,32),glowMat(S.color,.95)); scene.add(orbitMesh); } tone(880,.2,"triangle"); }
  else if(S.type==="bolt"){ const list=mobs.map(m=>({m,d:Math.hypot(m.x-P.x,m.z-P.z)})).filter(o=>o.d<S.r).sort((a,b)=>a.d-b.d).slice(0,S.cnt); list.forEach(o=>{ fxBolt(o.m.x,o.m.z,S.color); fxRing(o.m.x,o.m.z,S.color,3); hitMob(o.m,S.mult); }); let n=0; for(const id in PEERS){ const o=PEERS[id]; if(n<S.cnt&&Math.hypot(o.x-P.x,o.z-P.z)<S.r){ fxBolt(o.x,o.z,S.color); hitPl(o,id,S.mult); n++; } } if(!list.length&&!n) fxBolt(P.x+Math.sin(P.rot)*4,P.z+Math.cos(P.rot)*4,S.color); tone(1200,.15,"square",0,.12); tone(200,.3,"sawtooth",.05,.12); buzz(25); }
  else if(S.type==="heal"){ if(S.heal) P.hp=Math.min(st.mhp,P.hp+Math.round(st.mhp*S.heal)); if(S.haste) P.haste=S.haste; if(S.invul) P.invul=Math.max(P.invul,S.invul); fxRing(P.x,P.z,S.color,6,.7); fxSpark(P.x,2,P.z,S.color,30); jingle([523,659,784,1046]); }
  else if(S.type==="rage"){ P.rage=S.dur; fxRing(P.x,P.z,S.color,7,.8); fxSpark(P.x,2,P.z,S.color,30); tone(90,.5,"sawtooth",0,.2); buzz([40,30,40]); }
  else if(S.type==="dash"){ P.dashT=.25; P.dashX=Math.sin(P.rot)*S.dist/.25; P.dashZ=Math.cos(P.rot)*S.dist/.25; P.vy=7; P.invul=Math.max(P.invul,.5); setTimeout(()=>{ aoe(S.r,S.mult); thud(); },300); tone(500,.2,"triangle"); }
  $("hurt").style.opacity=0; }
function usePotion(){ if(P.dead||G.pots<=0||layerOpen) return; const st=stat(); if(P.hp>=st.mhp){ toast("체력이 가득해요"); return; } G.pots--; P.hp=Math.min(st.mhp,P.hp+Math.round(st.mhp*.5)); fxRing(P.x,P.z,0x9dffb8,4); jingle([523,659]); saveGame(); }
function hurtPlayer(dmg,from){ if(P.dead||P.invul>0) return; dmg=Math.max(1,Math.round(dmg)); P.hp-=dmg; P.combat=5; P.hitFlash=.25; floatDmg(P.x,4.2,P.z,"-"+fmt(dmg),"me"); $("hurt").style.opacity=Math.min(1,.4+ (1-P.hp/stat().mhp)); setTimeout(()=>{ $("hurt").style.opacity=P.hp/stat().mhp<.3?.5:0; },250); thud(); buzz(25);
  if(P.hp<=0){ P.hp=0; die(from); } }

/* ================= 죽음과 부활 ================= */
function die(by){ const R=RM(); P.dead=true; P.deadT=6; net.send({t:"dead",by:typeof by==="string"?by:(by||"")});
  const lost=Math.round(G.gold*R.respawn.gold); G.gold-=lost; G.deaths++;
  if(R.respawn.xp){ G.xp=Math.max(0,G.xp-Math.round(xpNeed(G.lv)*R.respawn.xp)); }
  if(lost>0){ if(P.bag){ scene.remove(P.bag.mesh); } const bm=new THREE.Group(); bm.add(box(1,.9,.8,toon({color:0x8a5a2a}),0,.45,0)); bm.add(new THREE.Mesh(GEO.sph,toon({color:0xffd05a}))); bm.children[1].position.y=1.1; bm.children[1].scale.set(.6,.6,.6); bm.position.set(P.x,0,P.z); scene.add(bm); P.bag={mesh:bm,x:P.x,z:P.z,gold:Math.round(lost*.5),t:120}; }
  if(P.trial) finishTrial(false);
  mobs.forEach(m=>{ if(m.state==="chase") m.state="idle"; });
  showDeath(by,lost); saveGame(); }
function respawn(){ const R=RM(); P.dead=false; closeLayer(); spawnAtHome(); P.hp=Math.round(stat().mhp*.6); P.invul=3;
  if(R.respawn.slow) P.slow=R.respawn.slow; if(R.respawn.weak){ P.weak=R.respawn.weak; P.heat=20; } if(R.respawn.shadow) P.shadow=R.respawn.shadow; if(R.respawn.xp) P.dizzy=30;
  fxRing(P.x,P.z,R.c1,8,.8); jingle([392,523,659]); toast(`${R.respawn.n}에서 부활`,R.respawn.pen,3.2); }

/* ================= 승급 시험 ================= */
function canTrial(){ return G.rank<6&&G.lv>=RANK_LV[G.rank+1]&&G.gold>=RANK_GOLD[G.rank+1]; }
function startTrial(){ const R=RM(); if(!canTrial()||P.trial) return; const next=G.rank+1; G.gold-=RANK_GOLD[next]; closeLayer();
  const rg=REGIONS[G.realm*3]; const lv=RANK_LV[next]+5; const st=mobStats(lv,true); const god=R.trials[G.rank];
  const m={n:god,shape:["angel","giant","demon","giant"][G.realm],mesh:makeAvatar(G.realm,next,false),x:rg.x,z:rg.z-6,hx:rg.x,hz:rg.z,lv,boss:true,world:false,hp:Math.round(st.mhp*.8),mhp:Math.round(st.mhp*.8),atk:st.atk*.85,xp:st.xp,gold:Math.round(RANK_GOLD[next]*.4),rg:rg.id,cd:1,state:"chase",t:0,lbl:makeLabel("boss"),rot:0,hit:0,scale:1.6,power:R.gods.find(g=>g.n.indexOf(god.split(" ").pop())>=0)?.p||40+next*9,trialOf:next};
  m.mesh.scale.set(1.6,1.6,1.6); m.mesh.position.set(m.x,0,m.z); scene.add(m.mesh); mobs.push(m); P.trial={m,t:90,next};
  toast(`승급 시험: ${god}`,"90초 안에 이기면 "+R.ranks[next]+"(으)로 승급!",3); tone(80,.6,"sawtooth",0,.2); buzz([80,40,80]); }
function finishTrial(win){ const T=P.trial; if(!T) return; P.trial=null; const R=RM();
  if(win){ G.rank=T.next; buildPlayer(); P.hp=stat().mhp; toast(`승급! ${R.ranks[G.rank]}`,G.rank===6?`${R.absolute} 바로 아래, 최고 계급!`:"더 강해졌어요 · 새 장비를 낄 수 있어요",3.5); jingle([523,659,784,1046,1318,1568]); fxRing(P.x,P.z,R.c1,14,1.2); net.send({t:"say",m:`${R.ranks[G.rank]}(으)로 승급했다!`}); questEvent("rank"); }
  else { if(T.m&&mobs.indexOf(T.m)>=0) removeMob(T.m); toast("시험 실패…","비용의 절반을 돌려받았어요",2.5); G.gold+=Math.round(RANK_GOLD[T.next]*.5); }
  saveGame(); }

/* ================= 영토 점령 ================= */
function tickTerritory(dt){ const rg=regionAt(P.x,P.z); $("region").innerHTML=rg?`${rg.n} <b>${W.o[rg.id]>=0?REALMS[W.o[rg.id]].n+" 영토":"중립"}</b>`:"황야";
  if(!rg||rg.cap||P.dead){ P.capProg=0; P.capRg=-1; return; }
  const g=TERR_RINGS[rg.id]; const d=Math.hypot(P.x-g.position.x,P.z-g.position.z);
  if(d<8&&W.o[rg.id]!==G.realm){ let blocked=false; for(const id in PEERS){ const o=PEERS[id]; if(o.realm===W.o[rg.id]&&!o.dead&&Math.hypot(o.x-g.position.x,o.z-g.position.z)<16) blocked=true; }
    if(blocked){ toast("상대 세계 플레이어가 제단을 지키고 있어요",null,.6); return; }
    if(P.capRg!==rg.id){ P.capRg=rg.id; P.capProg=0; } P.capProg+=dt/12; g.userData.orb.scale.setScalar(1.3+Math.sin(performance.now()/120)*.3);
    toast(`${rg.n} 점령 중… ${Math.round(P.capProg*100)}%`,null,.3);
    if(P.capProg>=1){ W.o[rg.id]=G.realm; W.ts[rg.id]=Date.now(); G.capt++; saveWorld(); paintTerritory(); net.send({t:"cap",o:W.o,ts:W.ts}); net.pushWorld(); toast(`${rg.n}을(를) ${RM().n} 영토로!`,`영토 ${terrBonus()}곳 · 공격 +${terrBonus()*3}%`,3); jingle([523,659,784,1046]); fxRing(g.position.x,g.position.z,RM().c1,16,1.2); G.gold+=60; gainXp(80+G.lv*10); questEvent("cap",rg); P.capProg=0; P.capRg=-1; saveGame(); } }
  else { P.capProg=0; P.capRg=-1; g.userData.orb.scale.setScalar(1.3); } }

/* ================= 임무(롤) ================= */
function newQuest(){ const rg=REGIONS.filter(r=>!r.cap&&Math.abs(r.lv[0]-G.lv)<14); const R=RM(); const kinds=["kill","kill","visit","cap","boss"]; if(G.rank<6&&G.lv>=RANK_LV[G.rank+1]) kinds.push("rank"); const k=pick(kinds);
  if(k==="kill"){ const mob=pick(R.mobs); const n=rint(5,10); return {k,mob:mob.n,n,c:0,txt:`${mob.n} ${n}마리 처치`,gold:30+G.lv*6,xp:40+G.lv*12}; }
  if(k==="visit"){ const r=pick(REGIONS.filter(r=>r.id!==G.realm*3)); return {k,rg:r.id,txt:`${r.n} 순례하기`,gold:25+G.lv*4,xp:30+G.lv*10}; }
  if(k==="cap"){ const r=pick(rg.filter(r=>W.o[r.id]!==G.realm)||rg); if(!r) return newQuest(); return {k,rg:r.id,txt:`${r.n} 제단 점령`,gold:80+G.lv*10,xp:90+G.lv*18}; }
  if(k==="boss"){ return {k,txt:"보스 1마리 처치",gold:120+G.lv*12,xp:120+G.lv*20}; }
  return {k,txt:`승급 시험 통과 (${R.ranks[G.rank+1]})`,gold:200+G.lv*15,xp:150+G.lv*25}; }
function ensureQuests(){ let guard=0; while(G.quests.length<3&&guard++<30){ const q=newQuest(); if(!G.quests.some(x=>x.txt===q.txt)) G.quests.push(q); } renderQuests(); }
function questEvent(type,obj){ let ch=false; G.quests.forEach(q=>{ if(q.done) return;
  if(type==="kill"&&q.k==="kill"&&obj.n===q.mob){ q.c++; if(q.c>=q.n) q.done=true; ch=true; }
  if(type==="kill"&&q.k==="boss"&&obj.boss){ q.done=true; ch=true; }
  if(type==="visit"&&q.k==="visit"&&obj.id===q.rg){ q.done=true; ch=true; }
  if(type==="cap"&&q.k==="cap"&&obj.id===q.rg){ q.done=true; ch=true; }
  if(type==="rank"&&q.k==="rank"){ q.done=true; ch=true; } });
  if(ch){ renderQuests(); const d=G.quests.find(q=>q.done); if(d) toast("임무 완료!","임무 창에서 보상을 받아요",1.6); } }
function claimQuest(i){ const q=G.quests[i]; if(!q||!q.done) return; G.gold+=q.gold; gainXp(q.xp); G.qdone++; G.quests.splice(i,1); jingle([659,784,1046]); toast(`보상: 금화 ${q.gold} · 경험치 ${q.xp}`); ensureQuests(); saveGame(); }
function renderQuests(){ $("quest").innerHTML=G.quests.map((q,i)=>`<div class="q${q.done?" done":""}" data-i="${i}">${q.done?"✔ ":""}${q.txt}${q.k==="kill"?` <small>${q.c}/${q.n}</small>`:""}</div>`).join(""); $("quest").querySelectorAll(".q").forEach(el=>el.onclick=()=>{ const i=+el.dataset.i; if(G.quests[i].done) claimQuest(i); else showQuests(); }); }

/* ================= 미니맵 ================= */
const mm=$("minimap"), mctx=mm.getContext("2d");
function drawMinimap(ctxIn,size){ const ctx=ctxIn||mctx, S=size||mm.width; const big=!!ctxIn; ctx.clearRect(0,0,S,S);
  const half=big?WORLD_HALF:95, cx=big?0:P.x, cz=big?0:P.z; const k=S/(half*2); const tx=x=>(x-cx+half)*k, tz=z=>(z-cz+half)*k;
  ctx.save(); if(!big){ ctx.beginPath(); ctx.arc(S/2,S/2,S/2-2,0,6.3); ctx.clip(); }
  REALMS.forEach((R,i)=>{ const sx=(i===0||i===2)?1:-1, sz=(i>=2)?1:-1; ctx.fillStyle=R.ground; ctx.globalAlpha=.5; ctx.fillRect(tx(sx>0?0:-WORLD_HALF),tz(sz>0?0:-WORLD_HALF),WORLD_HALF*k,WORLD_HALF*k); }); ctx.globalAlpha=1;
  ctx.fillStyle="#2a2340"; ctx.fillRect(tx(-WORLD_HALF)-S,0,S,S); ctx.fillRect(tx(WORLD_HALF),0,S,S); ctx.fillRect(0,tz(-WORLD_HALF)-S,S,S); ctx.fillRect(0,tz(WORLD_HALF),S,S);
  REGIONS.forEach(rg=>{ const o=W.o[rg.id]; ctx.beginPath(); ctx.arc(tx(rg.x),tz(rg.z),rg.r*k,0,6.3); ctx.fillStyle=o>=0?REALMS[o].c1:"#8a8a9a"; ctx.globalAlpha=rg.cap?.85:.5; ctx.fill(); ctx.globalAlpha=1; ctx.strokeStyle="rgba(255,255,255,.5)"; ctx.lineWidth=1; ctx.stroke();
    if(rg.cap){ ctx.fillStyle="#1b1430"; ctx.font=`${Math.round(S*(big?.06:.09))}px sans-serif`; ctx.textAlign="center"; ctx.fillText(REALMS[rg.realm].icon,tx(rg.x),tz(rg.z)+S*.025); }
    if(!big){ ctx.fillStyle="#fff"; ctx.font=`${Math.round(S*.075)}px sans-serif`; ctx.textAlign="center"; ctx.shadowColor="#000"; ctx.shadowBlur=3; ctx.fillText(rg.n,tx(rg.x),tz(rg.z)+(rg.cap?S*.12:S*.03)); ctx.shadowBlur=0; }
    // 제단 점
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(tx(TERR_RINGS[rg.id].position.x),tz(TERR_RINGS[rg.id].position.z),S*.012,0,6.3); ctx.fill(); });
  mobs.forEach(m=>{ ctx.fillStyle=m.boss?"#ffcf4a":"rgba(255,90,95,.8)"; ctx.beginPath(); ctx.arc(tx(m.x),tz(m.z),S*(m.boss?.02:.01),0,6.3); ctx.fill(); });
  for(const id in PEERS){ const o=PEERS[id]; ctx.fillStyle=o.realm===G.realm?"#3fd27a":"#ff5a5f"; ctx.beginPath(); ctx.arc(tx(o.x),tz(o.z),S*.022,0,6.3); ctx.fill(); ctx.strokeStyle="#000"; ctx.stroke(); }
  if(player){ ctx.save(); ctx.translate(tx(P.x),tz(P.z)); ctx.rotate(-P.rot); ctx.fillStyle="#fff"; ctx.strokeStyle="#000"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,-S*.035); ctx.lineTo(S*.025,S*.025); ctx.lineTo(-S*.025,S*.025); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore(); }
let mmT=0;
</script>
