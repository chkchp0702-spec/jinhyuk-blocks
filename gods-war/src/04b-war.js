<script>
/* ================= 영역 침범 전쟁 =================
   - 6분마다(초대 방마다 같은 시각) 62% 확률로 한 세계가 다른 땅을 침공함. 모든 폰이 같은 전쟁을 봄(시간+초대 코드로 결정).
   - 시작 20초 전에 알림 → 합류하면 공격대/수비대로 전장 순간이동. 전투 2분 30초.
   - 점수 = 기본 군세(정해진 값) + 참전한 플레이어들의 활약(병사 처치 3점, 대장 10점, 실시간 공유).
   - 공격 승리: 그 땅이 공격 세계로. 수비 승리: 공격 세계의 가장 가까운 땅 하나를 반격으로 빼앗음.
   - 합류하면 처치 보상 2배 + 끝나고 활약 보너스(이기면 2배).
   - 앱을 안 켠 동안 벌어진 전쟁은 기본 군세로만 결과를 계산해 나중에 반영(최대 6시간). */
const WARCFG={slot:360,notice:40,start:60,dur:150,chance:62};
const WAR={cur:null,units:[],contrib:{},my:0,joined:false,side:null,spawnT:0,sendT:0,announced:false,wave:0};
function hh(a,b){ let h=2166136261>>>0; const s=ROOM+":"+a+":"+b; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h; }
function warSlotNow(){ return Math.floor(Date.now()/1000/WARCFG.slot); }
function warEvent(slot){ if(hh(slot,"on")%100>=WARCFG.chance) return null;
  const cands=REGIONS.filter(r=>!r.cap&&!r.center); const rg=cands[hh(slot,"rg")%cands.length]; const def=W.o[rg.id];
  const atts=[0,1,2,3].filter(r=>r!==def).sort((a,b)=>Math.hypot(REGIONS[a*3].x-rg.x,REGIONS[a*3].z-rg.z)-Math.hypot(REGIONS[b*3].x-rg.x,REGIONS[b*3].z-rg.z));
  const k=hh(slot,"att")%6; const att=atts[k<3?0:k<5?1:Math.min(2,atts.length-1)];
  const t0=slot*WARCFG.slot*1000; return {slot,rg:rg.id,att,def,notice:t0+WARCFG.notice*1000,start:t0+WARCFG.start*1000,end:t0+(WARCFG.start+WARCFG.dur)*1000,baseAtt:30+hh(slot,"a")%40,baseDef:30+hh(slot,"d")%40+(def>=0?6:0),resolved:false}; }
function warApply(ev,a,d,ts){ const rg=REGIONS[ev.rg]; let msg;
  if(a>d){ W.o[ev.rg]=ev.att; W.ts[ev.rg]=ts; msg=`${REALMS[ev.att].n} 침공 성공! ${rg.n}이(가) ${REALMS[ev.att].n} 땅이 됐어요`; }
  else if(ev.def>=0){ let best=null,bd=1e9; REGIONS.forEach(r=>{ if(r.cap||r.center||W.o[r.id]!==ev.att) return; const dd=Math.hypot(r.x-rg.x,r.z-rg.z); if(dd<bd){ bd=dd; best=r; } });
    if(best){ W.o[best.id]=ev.def; W.ts[best.id]=ts; msg=`${REALMS[ev.def].n} 방어 성공 + 반격! ${REALMS[ev.att].n}의 ${best.n}을(를) 빼앗았어요`; } else msg=`${REALMS[ev.def].n} 방어 성공! ${rg.n}을(를) 지켜냈어요`; }
  else msg=`${rg.n}의 토착 수비대가 ${REALMS[ev.att].n}의 침공을 막아냈어요`;
  return msg; }
function warCatchUp(){ const now=warSlotNow(); if(W.sim==null) W.sim=now-10; for(let s=Math.max(W.sim+1,now-60);s<=now;s++){ const ev=warEvent(s); if(ev&&Date.now()>ev.end) warApply(ev,ev.baseAtt,ev.baseDef,ev.end); if(!ev||Date.now()>(ev?ev.end:0)) W.sim=s; } saveWorld(); paintTerritory(); }
function warContrib(id,d){ if(WAR.cur&&WAR.cur.slot===d.s&&!WAR.cur.none){ const first=!WAR.contrib[id]; WAR.contrib[id]={side:d.side,c:d.c||0}; if(first&&PEERS[id]) toast(`${PEERS[id].name} 참전!`,d.side==="att"?"공격대":"수비대",1.6); } }
function warScores(){ const ev=WAR.cur; let a=ev.baseAtt,d=ev.baseDef,any=false; for(const id in WAR.contrib){ const c=WAR.contrib[id]; if(c.c>0) any=true; if(c.side==="att") a+=c.c; else d+=c.c; } if(WAR.joined&&WAR.my>0){ any=true; if(WAR.side==="att") a+=WAR.my; else d+=WAR.my; } return {a,d,any}; }
function warActive(){ const ev=WAR.cur; return ev&&!ev.none&&!ev.resolved&&Date.now()>=ev.notice&&Date.now()<ev.end; }

/* ---- 병사 (v15: 세 갈래 공격 · 궁수·창병·전사 · 대형) ----
   - 공격대는 정면 + 왼쪽·오른쪽 옆구리(±60°) 세 갈래에서 번갈아 분대(전사 2·창병 1·궁수 2)로 몰려옴.
   - 수비대는 제단 둘레에 진을 치고(궁수는 뒤쪽), 가까이 온 적만 맞받아침.
   - 궁수는 15걸음 밖에서 화살(포물선), 창병은 11걸음에서 창을 던진 뒤 붙어서 싸움. 너무 붙으면 궁수는 뒤로 물러남. */
const ROLE={melee:{hp:1.6,atk:.85,sp:5.2,reach:2.4,ic:"⚔"},archer:{hp:1.0,atk:.75,sp:4.6,reach:2.2,range:15,ic:"🏹"},spear:{hp:1.3,atk:.8,sp:5.5,reach:2.8,throwR:11,ic:"🔱"},captain:{hp:3.5,atk:1.3,sp:4.8,reach:3.2,ic:"👑"}};
function warAxis(){ const ev=WAR.cur; const g=TERR_RINGS[ev.rg].position; const cap=REGIONS[ev.att*3]; const dx=cap.x-g.x, dz=cap.z-g.z, L=Math.hypot(dx,dz)||1; return {g,ux:dx/L,uz:dz/L}; }
function laneDir(lane){ const A=warAxis(); const a=[0,1.05,-1.05][lane||0]; const c=Math.cos(a), s=Math.sin(a); return {x:A.ux*c-A.uz*s, z:A.ux*s+A.uz*c}; }
const LANE_N=["정면","왼쪽 옆구리","오른쪽 옆구리"];
function sidePos(side,lane){ const g=warAxis().g, d=laneDir(lane||0); return side==="att"?{x:g.x+d.x*30,z:g.z+d.z*30}:{x:g.x+d.x*6,z:g.z+d.z*6}; }
function isEnemy(u){ return WAR.joined&&u.side!==WAR.side; }
function makeUnit(side,captain,role,lane,slot,row){ const ev=WAR.cur, rg=REGIONS[ev.rg]; const realm=side==="att"?ev.att:ev.def; role=captain?"captain":(role||"melee"); const RL=ROLE[role]; const lv=Math.round((rg.lv[0]+rg.lv[1])/2)+(captain?3:0); const st=mobStats(lv,false);
  let mesh=null,name; const look=role==="archer"?{weapon:10}:role==="spear"?{weapon:12}:{};
  if(realm>=0){ const rank=captain?5:rint(1,3); mesh=(typeof avatarGL==="function"&&avatarGL(realm,rank,look))||makeAvatar(realm,rank,false); name=captain?`${REALMS[realm].n} 대장`:`${REALMS[realm].n} ${role==="archer"?"궁수":role==="spear"?"창병":"전사"}`; }
  else { const d=pick(REALMS[rg.realm].mobs); mesh=(typeof mobGL==="function"&&mobGL(d.n,captain?1.3:1))||makeMob(d.shape,d.c,captain?1.3:1); name=captain?"토착 수비대장":d.n+(role==="archer"?" 투석꾼":role==="spear"?" 창잡이":""); }
  if(captain) mesh.scale.multiplyScalar(1.25);
  const A=warAxis(), d=laneDir(lane||0), px=-d.z, pz=d.x; let x,z,hx,hz;
  if(side==="att"){ const back=(row||0)*2.6+(role==="archer"?4:0); x=A.g.x+d.x*(32+back)+px*((slot||0)*2.4)+rnd(-.6,.6); z=A.g.z+d.z*(32+back)+pz*((slot||0)*2.4)+rnd(-.6,.6); hx=A.g.x+d.x*3+px*(slot||0)*1.6; hz=A.g.z+d.z*3+pz*(slot||0)*1.6; }
  else { const rr=role==="archer"?rnd(2.5,4.5):rnd(6,10), a=Math.atan2(d.z,d.x)+rnd(-.5,.5); hx=A.g.x+Math.cos(a)*rr; hz=A.g.z+Math.sin(a)*rr; x=A.g.x-A.ux*10+rnd(-4,4); z=A.g.z-A.uz*10+rnd(-4,4); }
  const u={war:true,side,realm,captain,role,lane:lane||0,n:name,mesh,x,z,hx,hz,lv,boss:false,hp:Math.round(st.mhp*RL.hp),atk:st.atk*RL.atk,xp:st.xp*2*(captain?4:1),gold:st.gold*2*(captain?4:1),rg:rg.id,cd:rnd(.3,1.2),jav:role==="spear"?1:0,javT:0,state:"chase",t:99,lbl:makeLabel(captain?"boss":""),rot:Math.atan2(-d.x,-d.z),hit:0,scale:captain?1.25:1,shape:"war",walk:0,sp:RL.sp*rnd(.92,1.08)};
  u.mhp=u.hp; mesh.position.set(x,hAt(x,z),z); scene.add(mesh); WAR.units.push(u); if(isEnemy(u)) mobs.push(u); return u; }
function unitDie(u){ if(u.dead) return; u.dead=true; fxFlash(u.x,1.5,u.z,0xffffff,2,.3); fxSpark(u.x,1.5,u.z,u.side==="att"?0xff8a3d:0x4aa3ff,14); scene.remove(u.mesh); if(u.lbl){ u.lbl.remove(); } const i=mobs.indexOf(u); if(i>=0) mobs.splice(i,1); }
function warOnKill(m){ const pts=m.captain?10:3; WAR.my+=pts; m.dead=true; floatDmg(m.x,5,m.z,`전공 +${pts}`,"crit"); if(m.captain){ toast(`${m.n} 격파!`,`전공 +10`,1.8); jingle([523,784,1046]); } }
function cleanupUnits(){ WAR.units.forEach(u=>{ if(!u.dead){ scene.remove(u.mesh); if(u.lbl) u.lbl.remove(); const i=mobs.indexOf(u); if(i>=0) mobs.splice(i,1); } u.dead=true; }); WAR.units=[]; WAR.capt_att=WAR.capt_def=0; WAR.wave=0; }
function spawnSquad(side,lane,n){ const roles=["melee","melee","spear","archer","archer","melee","archer"].slice(0,n); let sl=0; roles.forEach((r,k)=>{ const row=r==="archer"?1:0; const slot=(k%3)-1+(row?.5:0); makeUnit(side,false,r,lane,slot+(sl++%2?.3:-.3),row); }); }
function unitShoot(u,tx,tz,tgt,isPl,kind){ const far=Math.hypot(tx-u.x,tz-u.z); fireProj({x:u.x,z:u.z,y:2.2,tx:tx+rnd(-.6,.6),tz:tz+rnd(-.6,.6),ty:1.4,kind,speed:kind==="arrow"?30:26,arc:kind==="arrow"?(far>9?.6:.25):.45,dmg:u.atk*(kind==="javelin"?1.8:kind==="rock"?1.4:1.05),r:kind==="javelin"?1.6:1.3,hits:isPl?"player":"units",target:tgt,owner:u.n,color:u.side==="att"?0xff8a3d:0x4aa3ff});
  if(Math.hypot(u.x-P.x,u.z-P.z)<40) tone(kind==="arrow"?900:300,.04,"triangle",0,.03); }
function runUnits(dt){ const ev=WAR.cur; const A=warAxis(), g=A.g;
  WAR.spawnT-=dt; if(WAR.spawnT<=0){ WAR.spawnT=8; WAR.wave=(WAR.wave||0)+1;
    // 공격대: 갈래를 번갈아 가며 분대가 옴
    const nA=WAR.units.filter(u=>u.side==="att"&&!u.dead).length, capA=6+Math.round(ev.baseAtt/9); if(nA<capA){ const lane=(WAR.wave-1)%3; spawnSquad("att",lane,Math.min(5,capA-nA)); if(WAR.joined&&lane>0&&Math.hypot(P.x-g.x,P.z-g.z)<60){ toast(WAR.side==="def"?`⚠ ${LANE_N[lane]}에서 적이 몰려와요!`:`${LANE_N[lane]}으로 우리 분대 돌격!`,null,1.6); tone(196,.3,"sawtooth",0,.1); } }
    if(!WAR.capt_att){ makeUnit("att",true,"captain",0,0,0); WAR.capt_att=1; }
    // 수비대: 제단 둘레를 채움
    const nD=WAR.units.filter(u=>u.side==="def"&&!u.dead).length, capD=6+Math.round(ev.baseDef/9); for(let k=nD;k<Math.min(capD,nD+4);k++){ const r=k%3===0?"archer":k%5===0?"spear":"melee"; makeUnit("def",false,r,k%3,0,0); }
    if(!WAR.capt_def){ makeUnit("def",true,"captain",0,0,0); WAR.capt_def=1; } }
  const st=stat();
  for(let i=WAR.units.length-1;i>=0;i--){ const u=WAR.units[i]; if(u.dead||u.hp<=0){ if(!u.dead) unitDie(u); WAR.units.splice(i,1); continue; }
    const RL=ROLE[u.role]||ROLE.melee; const sight=u.role==="archer"?19:u.side==="def"?14:17;
    let tg=null,td=1e9; for(const v of WAR.units){ if(v.dead||v.side===u.side) continue; const d=Math.hypot(v.x-u.x,v.z-u.z); if(d<td){ td=d; tg=v; } }
    let tPl=false; if(WAR.joined&&u.side!==WAR.side&&!P.dead){ const d=Math.hypot(P.x-u.x,P.z-u.z); if(d<Math.min(td,sight)+1){ td=d; tPl=true; } }
    const has=(tPl||tg)&&td<sight; const tx=tPl?P.x:tg?tg.x:0, tz=tPl?P.z:tg?tg.z:0;
    u.cd-=dt; u.hit=Math.max(0,u.hit-dt); if(u.jav<=0){ u.javT+=dt; if(u.javT>9){ u.jav=1; u.javT=0; } }
    let mvx=0,mvz=0,swing=false,face=null;
    if(!has){ const gx=u.side==="att"?u.hx:u.hx, gz=u.side==="att"?u.hz:u.hz; const dx=gx-u.x, dz=gz-u.z, L=Math.hypot(dx,dz); if(L>1.2){ mvx=dx/L; mvz=dz/L; } else face=Math.atan2(g.x-u.x,g.z-u.z)+(u.side==="def"?Math.PI:0); }
    else { const dx=tx-u.x, dz=tz-u.z, L=Math.hypot(dx,dz)||.01; face=Math.atan2(dx,dz);
      if(u.role==="archer"){ if(L<5){ mvx=-dx/L*.8; mvz=-dz/L*.8; } else if(L>RL.range){ mvx=dx/L; mvz=dz/L; } else if(u.cd<=0){ u.cd=rnd(1.8,2.6); swing=true; unitShoot(u,tx,tz,tPl?null:tg,tPl,u.realm>=0?"arrow":"rock"); } }
      else if(u.role==="spear"&&u.jav>0&&L>5&&L<RL.throwR){ if(u.cd<=0){ u.cd=rnd(1.2,1.8); u.jav=0; swing=true; unitShoot(u,tx,tz,tPl?null:tg,tPl,u.realm>=0?"javelin":"rock"); } }
      else if(L>RL.reach){ mvx=dx/L; mvz=dz/L; }
      else if(u.cd<=0){ u.cd=rnd(1.0,1.5); swing=true; if(tPl) hurtPlayer(u.atk*(1-dmgReduce(st.def)),u.n); else { tg.hp-=u.atk*rnd(.8,1.2); tg.hit=.15; fxSpark(tg.x,1.6,tg.z,0xffffff,4); if(tg.hp<=0) unitDie(tg); } } }
    const moving=mvx||mvz; if(moving){ const sp=u.sp*(has?1:.8); u.x+=mvx*sp*dt; u.z+=mvz*sp*dt; if(face==null) face=Math.atan2(mvx,mvz); }
    for(const v of WAR.units){ if(v===u||v.dead) continue; const ox=u.x-v.x, oz=u.z-v.z, od=Math.hypot(ox,oz); if(od<1.7&&od>.001){ u.x+=ox/od*(1.7-od)*.5; u.z+=oz/od*(1.7-od)*.5; } }
    if(face!=null) u.rot=face; let dr=u.rot-u.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; u.mesh.rotation.y+=dr*Math.min(1,dt*10);
    u.mesh.position.set(u.x,hAt(u.x,u.z),u.z); hitTint(u.mesh,u.hit/.15);
    const ud=u.mesh.userData; if(ud.gl){ animState(u.mesh,swing?(u.role==="spear"&&u.jav===0&&u.javT<.1?"skill":"attack"):moving?"run":"idle"); } else if(ud.legL){ if(moving) u.walk+=dt*10; const sw=moving?Math.sin(u.walk)*.7:0; ud.legL.rotation.x=sw; ud.legR.rotation.x=-sw; ud.armL.rotation.x=-sw; ud.armR.rotation.x=swing?-2.2:sw; }
    const dp=Math.hypot(u.x-P.x,u.z-P.z); if(dp<60){ const mine=WAR.joined?(u.side===WAR.side):null; const col=mine===null?(u.side==="att"?"#ffb070":"#8fd0ff"):mine?"#9dffb8":"#ff8d8d"; placeLabel(u.lbl,u.x,(ud.h||4.6)*u.scale,u.z,`<span style="color:${col}">${u.captain?RL.ic+" "+u.n:RL.ic}</span><span class="hp"><i style="width:${Math.max(0,Math.round(u.hp/u.mhp*100))}%;background:${col}"></i></span>`); } else u.lbl.style.display="none"; } }

/* ---- 화면 ---- */
function joinWar(side){ const ev=WAR.cur; if(!warActive()) return; WAR.joined=true; WAR.side=side; closeLayer(); const p=sidePos(side); P.x=p.x+rnd(-3,3); P.z=p.z+rnd(-3,3); P.hp=stat().mhp; P.invul=2; P.dead=false;
  WAR.units.forEach(u=>{ if(!u.dead&&isEnemy(u)&&mobs.indexOf(u)<0) mobs.push(u); }); net.send({t:"wc",s:ev.slot,side,c:WAR.my});
  toast(side==="att"?"공격대 합류!":"수비대 합류!","병사를 쓰러뜨리면 전공 · 보상 2배",2.4); jingle([392,523,659,784]); buzz([60,30,60]); }
function warSides(ev){ const A=REALMS[ev.att], D=ev.def>=0?REALMS[ev.def]:null; return {A,D,an:A.n,dn:D?D.n:"토착 수비대",ac:A.c1,dc:D?D.c1:"#cfcfcf"}; }
function showWarPrompt(){ const ev=WAR.cur, rg=REGIONS[ev.rg], s=warSides(ev); const mine=G.realm; let btns;
  if(mine===ev.att) btns=`<button class="go" id="wjA" type="button">공격대로 참전!</button>`;
  else if(mine===ev.def) btns=`<button class="go" id="wjD" type="button">수비대로 참전!</button>`;
  else btns=`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="go" id="wjA" type="button" style="font-size:17px;padding:11px 16px">${s.an} 편 용병</button><button class="go" id="wjD" type="button" style="font-size:17px;padding:11px 16px">${s.dn} 편 용병</button></div>`;
  const left=Math.ceil((ev.start-Date.now())/1000);
  card(`<h2>⚔ 영역 침범 전투!</h2><p><b style="color:${s.ac}">${s.an}</b>이(가) ${ev.def>=0?`<b style="color:${s.dc}">${s.dn}</b>의 `:"중립 지역 "}<b>${rg.n}</b>을(를) 침공해요!<br>${left>0?`${left}초 뒤 시작`:"지금 싸우는 중"} · 전투 2분 30초</p><p>합류하면 <b style="color:var(--gold)">처치 보상 2배</b>, 끝나고 활약 보너스(이기면 또 2배).<br>이긴 쪽이 땅을 차지해요. 수비가 이기면 공격한 세계의 땅을 하나 빼앗아요.</p>${btns}`,"warbg");
  $("cls").textContent="지켜보기"; if($("wjA")) $("wjA").onclick=()=>joinWar("att"); if($("wjD")) $("wjD").onclick=()=>joinWar("def"); tone(196,.4,"sawtooth",0,.18); tone(147,.5,"sawtooth",.25,.18); buzz([80,40,80]); }
function showWarResult(won,msg,sc,gold,xp){ card(`<h2>${won?"🏆 승리!":"패배…"}</h2><p>${msg}</p><p>점수 공격 ${sc.a} : 수비 ${sc.d}<br>내 전공 ${WAR.my}점</p><div class="row"><div class="ic">⬤</div><div class="t"><div>금화 +${fmt(gold)}</div><span>${won?"승리 보너스 2배":"패배해도 참전 보상"}</span></div></div><div class="row"><div class="ic">★</div><div class="t"><div>경험치 +${fmt(xp)}</div></div></div>`,"warres"); jingle(won?[523,659,784,1046,1318]:[392,330,262]); }
function renderWarHud(){ const el=$("warbar"); const ev=WAR.cur; if(!warActive()){ el.hidden=true; return; } el.hidden=false; const s=warSides(ev), sc=warScores(), now=Date.now(); const fight=now>=ev.start; const t=Math.max(0,Math.ceil(((fight?ev.end:ev.start)-now)/1000)); const pa=Math.round(sc.a/(sc.a+sc.d)*100);
  const dist=Math.hypot(TERR_RINGS[ev.rg].position.x-P.x,TERR_RINGS[ev.rg].position.z-P.z);
  const btn=!WAR.joined?`<button id="wJoin" type="button">합류</button>`:(dist>60&&!P.dead?`<button id="wGo" type="button">전장으로</button>`:"");
  const html=`<div class="wt"><b style="color:${s.ac}">${s.an}</b> ⚔ <b style="color:${s.dc}">${s.dn}</b> · ${REGIONS[ev.rg].n} · ${fight?"남은":"시작까지"} ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}</div><div class="wb"><i style="width:${pa}%;background:${s.ac}"></i><i style="width:${100-pa}%;background:${s.dc}"></i><span>${sc.a} : ${sc.d}</span></div>${WAR.joined?`<div class="wm">${WAR.side==="att"?"공격대":"수비대"} · 내 전공 ${WAR.my}</div>`:""}${btn}`;
  if(el._h!==html){ el._h=html; el.innerHTML=html; if($("wJoin")) $("wJoin").onclick=()=>{ if(G.realm===ev.att) joinWar("att"); else if(G.realm===ev.def) joinWar("def"); else showWarPrompt(); }; if($("wGo")) $("wGo").onclick=()=>{ const p=sidePos(WAR.side); P.x=p.x; P.z=p.z; toast("전장으로!"); }; } }
function resolveWar(){ const ev=WAR.cur; if(!ev||ev.none||ev.resolved) return; ev.resolved=true; const sc=warScores(); const attWin=sc.a>sc.d;
  const msg=warApply(ev,sc.a,sc.d,ev.end+(sc.any?1:0)); W.sim=Math.max(W.sim==null?0:W.sim,ev.slot); saveWorld(); paintTerritory(); try{ net.pushWorld(); }catch(e){} cleanupUnits(); $("warbar").hidden=true;
  if(WAR.joined){ const won=(WAR.side==="att")===attWin; const lv=G.lv; let gold=Math.round((60+lv*12)*(1+WAR.my/15)), xp=Math.round((80+lv*20)*(1+WAR.my/15)); if(WAR.my<3){ gold=Math.round(gold*.3); xp=Math.round(xp*.3); } if(won){ gold*=2; xp*=2; G.war++; } G.gold+=gold; gainXp(xp); saveGame(); showWarResult(won,msg,sc,gold,xp); }
  else toast("⚔ 전쟁 결과",msg,3.5); WAR.joined=false; WAR.side=null; }
function tickWar(dt){ const now=Date.now(); const slot=warSlotNow();
  if(WAR.cur&&!WAR.cur.none&&!WAR.cur.resolved&&now>=WAR.cur.end) resolveWar();
  if(!WAR.cur||WAR.cur.slot!==slot){ cleanupUnits(); const ev=(W.sim==null||W.sim<slot)?warEvent(slot):null; WAR.cur=ev||{slot,none:true}; WAR.contrib={}; WAR.my=0; WAR.joined=false; WAR.side=null; WAR.announced=false; WAR.spawnT=0; }
  const ev=WAR.cur; if(!warActive()){ $("warbar").hidden=true; return; }
  if(!WAR.announced&&!P.dead&&now<ev.end-25000){ WAR.announced=true; showWarPrompt(); }
  renderWarHud();
  if(now>=ev.start){ const g=TERR_RINGS[ev.rg].position; if(WAR.joined||Math.hypot(g.x-P.x,g.z-P.z)<90) runUnits(dt); else if(WAR.units.length) cleanupUnits(); }
  if(WAR.joined){ WAR.sendT-=dt; if(WAR.sendT<=0){ WAR.sendT=3; net.send({t:"wc",s:ev.slot,side:WAR.side,c:WAR.my}); } } }
function forceWar(rgId,att){ const now=Date.now(); cleanupUnits(); const slot=warSlotNow(); const def=W.o[rgId]; WAR.cur={slot,rg:rgId,att,def,notice:now-1,start:now+1500,end:now+60000,baseAtt:40,baseDef:40,resolved:false}; WAR.contrib={}; WAR.my=0; WAR.joined=false; WAR.side=null; WAR.announced=false; WAR.spawnT=0; }
</script>
