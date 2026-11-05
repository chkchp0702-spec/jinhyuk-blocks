<script>
/* ================= v47-2: ✨ 기술 9개씩 (세계마다 +6) + 📖 기술 책 =================
   세계마다 기술이 3개 → 9개. 화면의 기술 버튼 3칸에 배운 기술 중 아무거나 골라 끼움(G.sk=[칸1,칸2,칸3]의 기술 번호).
   쿨타임은 기술마다 따로(P.sklCd[기술 번호]) → 칸을 바꿔도 쿨타임이 초기화되지 않음.
   새 기술 종류: multi(부채꼴 여러 발) · shield(보호막) · team(나와 근처 친구 회복·질주, t:"tb") · meteor(앞에 떨어지는 큰 폭발)
               pull(끌어당겨 터뜨리기) · freeze(얼려서 멈춤) · summon(정령 부르기) · ult(궁극기: 큰 폭발 + 모두 멈춤).
   합체 기술(04d)은 원래 기술 3개(0~2번)끼리만. */
const SK_NEW=[
 [ {n:"빛의 화살비",desc:"빛의 화살 5발을 부채꼴로 쏨",type:"multi",cnt:5,spread:.22,r:17,mult:1.4,pj:"arrow",cd:5,color:0xfff2a0,rank:0},
   {n:"수호천사의 방패",desc:"8초 동안 체력 30%만큼 막아 주는 빛의 방패",type:"shield",sh:.3,dur:8,cd:16,color:0xfff6c8,rank:1},
   {n:"축복의 빛",desc:"나와 12걸음 안 친구들 체력 30% 회복 + 3초 질주",type:"team",r:12,heal:.3,haste:3,cd:18,color:0xfffbe0,rank:2},
   {n:"케루빔의 불칼",desc:"불타는 칼이 앞의 땅을 길게 가름",type:"line",r:15,w:4,mult:3.4,cd:9,color:0xff9a40,rank:3},
   {n:"세라핌의 날개",desc:"빛의 회오리로 주변 적을 끌어당겨 터뜨림",type:"pull",r:12,mult:3.6,cd:15,color:0xffe27a,rank:5},
   {n:"최후의 나팔",desc:"궁극기: 하늘 나팔 소리로 큰 폭발 + 모두 2초 멈춤",type:"ult",r:16,mult:6,stun:2,cd:30,color:0xffffff,rank:6} ],
 [ {n:"서리 숨결",desc:"얼음 입김: 주변 적이 1.5초 꽁꽁",type:"freeze",r:7,mult:1.4,stun:1.5,cd:7,color:0xbfe8ff,rank:0},
   {n:"발키리의 창",desc:"창 3자루를 부채꼴로 던짐",type:"multi",cnt:3,spread:.18,r:18,mult:2,pj:"javelin",cd:6,color:0x9fe0ff,rank:1},
   {n:"이그드라실의 축복",desc:"세계 나무의 힘: 나와 근처 친구 체력 25% + 질주",type:"team",r:12,heal:.25,haste:4,cd:18,color:0x9dffb8,rank:2},
   {n:"펜리르 소환",desc:"늑대 정령이 10초 동안 함께 싸움",type:"summon",kind:"wolf",dur:10,mult:.9,cd:20,color:0xcfe0f0,rank:3},
   {n:"궁니르",desc:"오딘의 창이 앞에 떨어져 크게 폭발",type:"meteor",r:7,dist:11,mult:5,delay:.7,cd:12,color:0x9fe0ff,rank:5},
   {n:"요르문간드의 고리",desc:"궁극기: 세계 뱀이 감싸 큰 폭발 + 모두 2초 멈춤",type:"ult",r:15,mult:5.5,stun:2,cd:30,color:0x5fdc9a,rank:6} ],
 [ {n:"아그니의 불꽃",desc:"불꽃이 가까운 적 4명에게 옮겨 붙음",type:"bolt",r:11,cnt:4,mult:1.6,cd:5,color:0xff8a3d,rank:0},
   {n:"나가의 올가미",desc:"뱀 올가미로 주변 적을 끌어와 조임",type:"pull",r:10,mult:1.9,cd:9,color:0x5fdc6a,rank:1},
   {n:"락슈미의 축복",desc:"연꽃 빛: 나와 근처 친구 체력 30% 회복",type:"team",r:12,heal:.3,haste:2,cd:18,color:0xffb0d0,rank:2},
   {n:"가네샤의 방패",desc:"8초 동안 체력 35%만큼 막아 주는 방패",type:"shield",sh:.35,dur:8,cd:16,color:0xffd080,rank:3},
   {n:"인드라의 바즈라",desc:"번개 금강저가 앞에 떨어져 크게 폭발",type:"meteor",r:8,dist:11,mult:5.2,delay:.7,cd:12,color:0xfff2a0,rank:5},
   {n:"칼리의 분노",desc:"궁극기: 파괴의 춤으로 큰 폭발 + 모두 2초 멈춤",type:"ult",r:14,mult:6,stun:2,cd:30,color:0xff3d5a,rank:6} ],
 [ {n:"아폴론의 화살",desc:"태양 화살 5발을 부채꼴로 쏨",type:"multi",cnt:5,spread:.2,r:18,mult:1.4,pj:"arrow",cd:5,color:0xffd060,rank:0},
   {n:"아이기스",desc:"아테나의 방패: 8초 동안 체력 35%를 막고 주변 적 1초 멈춤",type:"shield",sh:.35,dur:8,stun:1,r:6,cd:16,color:0xd8e8ff,rank:1},
   {n:"아스클레피오스의 지팡이",desc:"치유의 뱀 지팡이: 나와 근처 친구 체력 30% 회복",type:"team",r:12,heal:.3,haste:2,cd:18,color:0x9dffb8,rank:2},
   {n:"메두사의 눈",desc:"눈빛으로 주변 적을 2.5초 돌처럼 굳힘",type:"freeze",r:9,mult:1.5,stun:2.5,cd:14,color:0xb8c8a0,rank:3},
   {n:"하데스의 손",desc:"지하의 손이 주변 적을 끌어당겨 움켜쥠",type:"pull",r:12,mult:3.4,cd:13,color:0x9a6aff,rank:5},
   {n:"제우스의 심판",desc:"궁극기: 하늘 번개가 떨어져 큰 폭발 + 모두 2초 멈춤",type:"ult",r:16,mult:6.5,stun:2,cd:30,color:0xaee8ff,rank:6} ] ];
REALMS.forEach((R,r)=>{ if(R.skills.length<9) SK_NEW[r].forEach(S=>R.skills.push(S)); });
P.sklCd=new Array(9).fill(0);
const SKN=6; /* v52: 화면 기술 버튼 6칸 */
function skSlots(){ if(!Array.isArray(G.sk)) G.sk=[0,1,2]; if(G.sk.length!==SKN){ const a=G.sk.slice(0,SKN); for(let k=0;a.length<SKN&&k<9;k++) if(a.indexOf(k)<0) a.push(k); G.sk=a; } return G.sk; }
function skSlot(i){ const s=skSlots()[i]; return (RM().skills[s]?s:i); }
function skCan(si){ const S=RM().skills[si]; return !!S&&G.rank>=S.rank; }
function skIcon(S){ return {aoe:"💥",line:"➖",orbit:"🌀",bolt:"⚡",heal:"💚",rage:"🔥",dash:"💨",multi:"🏹",shield:"🛡",team:"🤝",meteor:"☄️",pull:"🌪",freeze:"❄️",summon:"🐺",ult:"🌟"}[S.type]||"✨"; }
function skNames(){ const R=RM(); for(let i=0;i<SKN;i++){ const el=$("sklNm"+i); if(el) el.textContent=(R.skills[skSlot(i)]||{}).n||"기술"; } try{ for(let i=0;i<SKN;i++){ HUDM["lk"+i]=null; HUDM["co"+i]=null; HUDM["cv"+i]=null; } }catch(e){} }
/* ---------- 새 기술 쓰기 ---------- */
const SKX={multi:1,shield:1,team:1,meteor:1,pull:1,freeze:1,summon:1,ult:1};
const SKS={sum:[],bub:null};
function skStun(m,t){ if(!m||m.titan||m.hp<=0) return; t=m.boss?t*.5:t; m.frz=Math.max(m.frz||0,t); m.fx=m.x; m.fz=m.z; m.cd=Math.max(m.cd||0,t); }
function skUseX(si,S){ const st=stat(); P.sklCd[si]=S.cd; autoFace(S.type==="meteor"?14:S.type==="multi"?S.r:8); P.atkAnim=.4; P.combat=4; if(player.userData.gl) animState(player,"skill"); try{ net.send({t:"a",k:"skl"}); }catch(e){}
  const big=S.type==="ult"; try{ drama(S.color,big?.8:.45,big?2.2:1); }catch(e){} try{ SFX.runeAt(P.x,P.z,S.color,big?12:6.5,big?1.3:.85); }catch(e){} P.shake=Math.max(P.shake||0,big?1.2:.5); G.sklN=(G.sklN||0)+1;
  const hitMob=(m,mult)=>{ if(m.hp<=0) return; const crit=Math.random()<st.crit; damageMob(m,st.atk*mult*rnd(.9,1.1)*(crit?1.8:1),crit); };
  const hitPl=(o,id,mult)=>{ if(o.realm===G.realm||o.dead||inCapital(o.x,o.z)||inCapital(P.x,P.z)) return; const dmg=Math.round(st.atk*mult*.55); net.send({t:"hit",to:id,d:dmg}); floatDmg(o.x,4,o.z,"-"+fmt(dmg)); };
  const area=(x,z,r,mult,stun)=>{ try{ SFX.shock(x,z,S.color,r,.6); }catch(e){ fxRing(x,z,S.color,r*1.6,.5); } fxFlash(x,2,z,S.color,r*.8,.4); fxSpark(x,2,z,S.color,HIGH()?44:22); mobs.slice().forEach(m=>{ if(Math.hypot(m.x-x,m.z-z)<r){ if(mult) hitMob(m,mult); if(stun) skStun(m,stun); } }); if(mult) for(const id in PEERS){ const o=PEERS[id]; if(Math.hypot(o.x-x,o.z-z)<r) hitPl(o,id,mult); } };
  if(S.type==="multi"){ const tgt=mobs.filter(m=>m.hp>0&&Math.hypot(m.x-P.x,m.z-P.z)<S.r).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0]; const base=tgt?Math.atan2(tgt.x-P.x,tgt.z-P.z):P.rot; P.rot=base;
    for(let k=0;k<S.cnt;k++){ const a=base+(k-(S.cnt-1)/2)*S.spread; const crit=Math.random()<st.crit; try{ fireProj({x:P.x+Math.sin(a)*.8,z:P.z+Math.cos(a)*.8,y:2.2,tx:P.x+Math.sin(a)*S.r,tz:P.z+Math.cos(a)*S.r,ty:1.4,kind:S.pj||"arrow",color:S.color,speed:34,arc:0,dmg:st.atk*S.mult*(crit?1.8:1),crit,r:1.6,hits:"mobs"}); }catch(e){} }
    tone(900,.08,"triangle",0,.08); tone(700,.08,"triangle",.05,.07); buzz(20); }
  else if(S.type==="shield"){ P.shield=Math.round(st.mhp*S.sh); P.shieldT=S.dur; skBubble(S.color); fxRing(P.x,P.z,S.color,7,.8); fxSpark(P.x,2,P.z,S.color,30); if(S.stun) area(P.x,P.z,S.r||6,0,S.stun); jingle([659,784,988]); buzz(25); toast(`${skIcon(S)} ${S.n}`,`${fmt(P.shield)}만큼 막아 줘요`,1.4); }
  else if(S.type==="team"){ P.hp=Math.min(st.mhp,P.hp+Math.round(st.mhp*S.heal)); if(S.haste) P.haste=Math.max(P.haste,S.haste); fxRing(P.x,P.z,S.color,S.r*1.3,.9); fxSpark(P.x,2,P.z,S.color,40); jingle([523,659,784,1046]);
    const fr=Object.values(PEERS).filter(o=>!o.dead&&Math.hypot(o.x-P.x,o.z-P.z)<S.r); fr.forEach(o=>{ fxRing(o.x,o.z,S.color,4,.6); fxSpark(o.x,2,o.z,S.color,14); }); try{ net.send({t:"tb",to:fr.map(o=>o.id),h:S.heal,hs:S.haste||0,n:S.n}); }catch(e){} toast(`${skIcon(S)} ${S.n}`,fr.length?`${fr.map(o=>o.name).join(", ")}도 함께 회복!`:"근처 친구도 함께 회복돼요",1.6); }
  else if(S.type==="meteor"){ const tg=mobs.filter(m=>m.hp>0&&Math.hypot(m.x-P.x,m.z-P.z)<16).sort((a,b)=>b.mhp-a.mhp)[0]; const x=tg?tg.x:P.x+Math.sin(P.rot)*S.dist, z=tg?tg.z:P.z+Math.cos(P.rot)*S.dist;
    fxRing(x,z,0xff4040,S.r*1.6,S.delay); const rock=sph(1.1,glowMat(S.color,.95),x,24,z); rock.userData.noOutline=true; scene.add(rock); const t0=performance.now(); tone(300,.5,"sawtooth",0,.06);
    const fall=()=>{ const k=Math.min(1,(performance.now()-t0)/(S.delay*1000)); rock.position.y=hAt(x,z)+24*(1-k*k); if(k<1&&rock.parent) requestAnimationFrame(fall); else { scene.remove(rock); area(x,z,S.r,S.mult,0); try{ fxPillar(S.color,.6,HIGH()?30:16,1.2,.4); }catch(e){} P.shake=Math.max(P.shake||0,1); thud(); buzz([30,20,50]); } }; fall(); }
  else if(S.type==="pull"){ const L=mobs.filter(m=>m.hp>0&&!m.titan&&Math.hypot(m.x-P.x,m.z-P.z)<S.r); L.forEach(m=>{ const dx=P.x-m.x, dz=P.z-m.z, d=Math.hypot(dx,dz)||1; const k=Math.max(0,(d-2.4)/d)*(m.boss?.35:.8); m.x+=dx*k; m.z+=dz*k; fxSpark(m.x,1.5,m.z,S.color,8); });
    try{ SFX.shock(P.x,P.z,S.color,S.r,.45); }catch(e){} for(let k=0;k<3;k++) setTimeout(()=>fxRing(P.x,P.z,S.color,S.r*(1.4-k*.4),.35),k*90); tone(200,.3,"sine",0,.1); setTimeout(()=>{ area(P.x,P.z,5,S.mult,0); thud(); buzz(30); },340); }
  else if(S.type==="freeze"){ area(P.x,P.z,S.r,S.mult,S.stun); tone(1500,.2,"sine",0,.07); tone(1900,.25,"sine",.06,.05); buzz(20); }
  else if(S.type==="summon"){ skSummon(S,st); jingle([392,523,659]); tone(120,.4,"sawtooth",0,.1); }
  else if(S.type==="ult"){ fxRing(P.x,P.z,S.color,S.r*2,1.2); try{ fxPillar(S.color,1.4,HIGH()?50:26,2,.45); }catch(e){} setTimeout(()=>{ area(P.x,P.z,S.r,S.mult,S.stun); try{ SFX.shock(P.x,P.z,S.color,S.r*1.3,1.1); }catch(e){} P.shake=Math.max(P.shake||0,1.6); thud(); },260); jingle([392,523,659,784,1046,1318]); buzz([60,30,90]); }
  $("hurt").style.opacity=0; }
function skBubble(col){ if(!SKS.bub){ const b=new THREE.Mesh(new THREE.SphereGeometry(1.7,20,14),glowMat(col,.22)); b.userData.noOutline=true; scene.add(b); SKS.bub=b; } SKS.bub.material.color.setHex(col); SKS.bub.visible=true; }
function skSummon(S,st){ while(SKS.sum.length>=2){ const o=SKS.sum.shift(); scene.remove(o.mesh); } const mesh=makeMob(S.kind||"wolf",S.color,1); mesh.scale.setScalar(.9); mesh.traverse(o=>{ if(o.material){ o.material=o.material.clone(); o.material.transparent=true; o.material.opacity=.75; if(o.material.emissive){ o.material.emissive.setHex(0x6aa8ff); o.material.emissiveIntensity=.5; } } });
  const x=P.x+Math.sin(P.rot+1.2)*2, z=P.z+Math.cos(P.rot+1.2)*2; mesh.position.set(x,hAt(x,z),z); scene.add(mesh); fxRing(x,z,S.color,5,.7); fxSpark(x,1.5,z,S.color,30); SKS.sum.push({mesh,x,z,t:S.dur,hitT:.4,mult:S.mult,col:S.color,tg:null}); }
/* ---------- 매 프레임: 멈춘 괴물 · 보호막 · 정령 ---------- */
function skTick(dt){ if(!started) return; const tn=performance.now();
  for(const m of mobs){ if(m.frz>0){ m.frz-=dt; if(m.fx!=null){ m.x=m.fx; m.z=m.fz; if(m.mesh){ m.mesh.position.x=m.x; m.mesh.position.z=m.z; } } try{ hitTint(m.mesh,.55,0x8fd8ff); }catch(e){} if(m.frz<=0){ m.frz=0; m.fx=null; try{ hitTint(m.mesh,0); }catch(e){} } } }
  if(P.shieldT>0){ P.shieldT-=dt; if(P.shieldT<=0||P.shield<=0){ P.shieldT=0; P.shield=0; } } if(SKS.bub){ const on=P.shieldT>0&&!P.dead; SKS.bub.visible=on; if(on){ SKS.bub.position.set(P.x,(P.gy||0)+P.y+1.8,P.z); SKS.bub.material.opacity=.16+Math.sin(tn/160)*.06+(P.shieldT<1.5?Math.sin(tn/60)*.08:0); } }
  const st=stat(); for(let i=SKS.sum.length-1;i>=0;i--){ const s=SKS.sum[i]; s.t-=dt; s.hitT-=dt; if(s.t<=0||P.dead){ fxSpark(s.x,1.5,s.z,s.col,16); scene.remove(s.mesh); SKS.sum.splice(i,1); continue; }
    if(!s.tg||s.tg.hp<=0||mobs.indexOf(s.tg)<0||Math.hypot(s.tg.x-P.x,s.tg.z-P.z)>18) s.tg=mobs.filter(m=>m.hp>0&&!m.titan&&Math.hypot(m.x-P.x,m.z-P.z)<14).sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z))[0]||null;
    const tx=s.tg?s.tg.x:P.x+Math.sin(P.rot+2)*2.5, tz=s.tg?s.tg.z:P.z+Math.cos(P.rot+2)*2.5; const dx=tx-s.x, dz=tz-s.z, d=Math.hypot(dx,dz); if(d>(s.tg?1.8:.8)){ const v=Math.min(d,dt*11); s.x+=dx/d*v; s.z+=dz/d*v; s.mesh.rotation.y=Math.atan2(dx,dz); }
    if(s.tg&&d<2.6&&s.hitT<=0){ s.hitT=.7; damageMob(s.tg,st.atk*s.mult,false); fxSpark(s.tg.x,1.6,s.tg.z,s.col,8); }
    s.mesh.position.set(s.x,hAt(s.x,s.z)+Math.abs(Math.sin(tn/120))*.2,s.z); } }
XTICK.push(skTick);
/* ---------- 원래 함수 고치기: 칸 → 기술 번호 · 보호막 · 합체는 0~2번만 ---------- */
(function(){ const _us=useSkill; useSkill=function(slot){ slot=slot||0; if(P.dead||layerOpen) return; const si=skSlot(slot); const S=RM().skills[si]; if(!S) return;
    if(G.rank<S.rank){ toast(`${RM().ranks[S.rank]}부터 쓸 수 있어요`,S.n,1.4); return; } if(P.sklCd[si]>0) return; if(SKX[S.type]) return skUseX(si,S); G.sklN=(G.sklN||0)+1; return _us(si); };
  const _hp=hurtPlayer; hurtPlayer=function(dmg,from){ if(P.shieldT>0&&P.shield>0&&!P.dead&&P.invul<=0&&!(P.y>0.8&&!(typeof from==="object"&&from&&from.sure))){ const a=Math.min(P.shield,dmg); P.shield-=a; dmg-=a; floatDmg(P.x,4.4,P.z,"🛡 "+fmt(a),"gain"); if(dmg<=0){ tone(1000,.05,"sine",0,.05); return; } } return _hp(dmg,from); };
  const _co=comboOnSkill; comboOnSkill=function(i){ if(i>2) return; return _co(i); };
  const _cr=comboRecv; comboRecv=function(o,d){ if((d.s!=null&&d.s>2)||(d.a!=null&&d.a>2)||(d.b!=null&&d.b>2)) return; return _cr(o,d); };
  const _rt=setRealmTheme; setRealmTheme=function(){ const R=RM(); document.documentElement.style.setProperty("--c1",R.c1); document.documentElement.style.setProperty("--c2",R.c2); skNames(); }; })();
NETR.tb=(o,d)=>{ if(!d.to||d.to.indexOf(G.id)<0||P.dead) return; const st=stat(); P.hp=Math.min(st.mhp,P.hp+Math.round(st.mhp*(d.h||0))); if(d.hs) P.haste=Math.max(P.haste,d.hs); fxRing(P.x,P.z,0x9dffb8,5,.7); fxSpark(P.x,2,P.z,0x9dffb8,24); jingle([659,784,1046]); toast(`💚 ${o.name}의 ${d.n||"축복"}!`,`체력 +${Math.round((d.h||0)*100)}%${d.hs?" · 질주":""}`,1.8); };
/* ---------- 새 기술 배우면 알려 주고, 잠긴 칸에 자동으로 끼움 ---------- */
const SKL={t:0};
function skLearnTick(dt){ if(!started||G.realm<0) return; SKL.t-=dt; if(SKL.t>0) return; SKL.t=1; const R=RM(); const sl=skSlots(); let ch=false;
  for(let i=0;i<SKN;i++){ if(!skCan(sl[i])){ const free=R.skills.map((S,k)=>k).filter(k=>skCan(k)&&sl.indexOf(k)<0); if(free.length){ sl[i]=free[0]; ch=true; } } }
  G.skSeen=G.skSeen||0; const n=R.skills.filter(S=>G.rank>=S.rank).length; if(n>G.skSeen){ const first=G.skSeen===0; let fresh=R.skills.filter(S=>G.rank>=S.rank).slice(G.skSeen); if(first) fresh=fresh.filter(S=>R.skills.indexOf(S)>=3); G.skSeen=n; ch=true; if(fresh.length) setTimeout(()=>{ if(!layerOpen) toast(`✨ 새 기술 ${fresh.length}개를 배웠어요!`,`${fresh.map(S=>S.n).join(" · ")} — 📖 기술 책에서 칸에 끼워요`,3.4); },1200); }
  if(ch){ skNames(); saveGame(); } }
XTICK.push(skLearnTick);
/* ---------- 📖 기술 책 ---------- */
let SKPICK=-1;
function showSkills(){ const R=RM(), sl=skSlots();
  const slotHtml=[0,1,2,3,4,5].map(i=>{ const S=R.skills[sl[i]]; return `<button class="skslot${SKPICK===i?" on":""}" data-sl="${i}"><b>${i+1}번 칸</b><span>${skIcon(S)} ${S.n}</span></button>`; }).join("");
  const rows=R.skills.map((S,k)=>{ const can=skCan(k), at=sl.indexOf(k); return `<div class="row"${can?"":' style="opacity:.6"'}><div class="ic">${can?skIcon(S):"🔒"}</div><div class="t"><div>${S.n}${at>=0?` <i class="st on">${at+1}번 칸</i>`:""}${k>=3?' <small style="color:#9dffb8">새 기술</small>':""}</div><span>${S.desc} · ${S.cd}초${can?"":` · ${R.ranks[S.rank]}부터`}</span></div>${can?(at>=0?"":`<button class="buy" data-k="${k}">${SKPICK>=0?(SKPICK+1)+"번 칸에":"끼우기"}</button>`):""}</div>`; }).join("");
  card(`<h2>📖 ${R.n}의 기술 책</h2><p>기술이 <b>${R.skills.length}개</b> 있어요. 화면의 기술 버튼 <b>6칸</b>에 배운 기술 중 마음에 드는 것을 골라 끼워요(버튼 왼쪽 위 숫자가 칸 번호). 칸을 먼저 누르고 기술의 「끼우기」를 누르면 그 칸에 들어가요. 쿨타임은 기술마다 따로라서 바꿔 끼워도 그대로예요.</p>
   <div class="skslots">${slotHtml}</div>${rows}<p style="font-size:12px">승급할수록 새 기술이 열려요. 🤝 기술은 근처 친구도 함께 회복시켜 줘요.</p>`);
  layers.querySelectorAll("[data-sl]").forEach(b=>b.onclick=()=>{ SKPICK=SKPICK===+b.dataset.sl?-1:+b.dataset.sl; showSkills(); });
  layers.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{ const k=+b.dataset.k; let i=SKPICK; if(i<0){ i=sl.findIndex(x=>!skCan(x)); if(i<0) i=SKN-1; } sl[i]=k; SKPICK=-1; skNames(); saveGame(); tone(880,.06); toast(`${i+1}번 칸: ${R.skills[k].n}`,null,1.2); showSkills(); }); }
setTimeout(()=>{ const z=$("zoomBtns"); if(!z) return; const b=document.createElement("button"); b.id="bSkBook"; b.type="button"; b.textContent="📖"; b.style.fontSize="17px"; b.addEventListener("pointerdown",e=>e.stopPropagation()); b.onclick=e=>{ e.stopPropagation(); if(started&&!layerOpen) showSkills(); }; z.appendChild(b); },0);
TITLES.push({id:"sk9",n:"기술의 달인",t:2,h:"기술 9개를 모두 배우기",g:()=>[RM().skills.filter(S=>G.rank>=S.rank).length,9]},{id:"sk500",n:"기술 폭풍",t:1,h:"기술 500번 쓰기",g:()=>[G.sklN||0,500]});
</script>
