<script>
/* ================= v135-1: 🏺 톡 깨지는 보물 항아리 (IDEAS G11/15-1) =================
   네 세계 땅(수도 바깥쪽 둘레 + 사냥터 + 세계의 중심) 곳곳에 항아리·통이 놓여 있음. 때리면(공격 버튼 · 활·지팡이도) 「와장창!」 조각이 튀고
   금화가 쏟아지고 가끔 ⛓ 쇳조각 · 🧪 물약 · 🦴 신수 간식(짝꿍 신수 경험치) · ✨ 룬 가루. 사냥터 항아리는 가끔 「뿅!」 숨어 있던 괴물이 튀어나옴(6%).
   모양은 세계마다: 에덴 꽃 바구니 · 아스가르드 룬 통 · 인도 놋쇠 물단지 · 올림푸스 그림 항아리 · 세계의 중심은 네 가지 섞어서.
   자리는 지역 번호로 정해서 모두의 폰에 같은 자리. 깨지면 실시간 jb 로 모두의 화면에서도 깨짐 → 3분 뒤 다시 생김.
   🌟 황금 항아리: 15분마다 한 곳(시계로 모두 같은 곳) 사냥터 항아리 하나가 황금으로 바뀜(처음 12분). 깬 사람은 큰 상자, 35m 안 모두에게 금화비(jgb).
   저장: G.jarN(깬 수) · G.jarG(황금) · G.jarGS(마지막으로 금화비 받은 황금 번호). 칭호 3개. 그리기: 80m 안 항아리만 보임(항아리 1개 = 1~2번). */
const JAR_RESP=180000, JAR_GP=15*60000, JAR_GON=12*60000;
const JAR={list:[],byK:{},built:false,mats:null,geo:{},shards:[],gS:-1,gLbl:null,annS:-1,chk:0};
function jarRegions(){ return REGIONS.filter(r=>true); }
function jarGeo(){ if(JAR.geo.amph) return JAR.geo; const L=pts=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),12);
  JAR.geo.amph=L([[0,0],[.32,.02],[.5,.25],[.62,.6],[.58,.95],[.36,1.2],[.22,1.32],[.24,1.5],[.3,1.56],[.22,1.58],[0,1.58]]);
  JAR.geo.pot=L([[0,0],[.35,.02],[.62,.3],[.7,.62],[.58,.92],[.3,1.06],[.26,1.18],[.36,1.24],[0,1.24]]);
  JAR.geo.basket=L([[0,0],[.42,.02],[.56,.4],[.66,.8],[.7,.86],[.62,.86],[0,.86]]);
  JAR.geo.barrel=L([[0,0],[.48,0],[.58,.35],[.62,.6],[.58,.85],[.48,1.2],[0,1.2]]);
  JAR.geo.bloom=new THREE.SphereGeometry(.2,8,6); JAR.geo.band=new THREE.TorusGeometry(.6,.05,4,16); JAR.geo.shard=new THREE.BoxGeometry(.22,.16,.05); return JAR.geo; }
function jarMats(){ if(JAR.mats) return JAR.mats; JAR.mats={ basket:mat({color:0xc8a060,roughness:.95}), bloom:[mat({color:0xff8ab8}),mat({color:0xffe060}),mat({color:0xffffff})], barrel:mat({color:0x8a5a30,roughness:.9}), band:mat({color:0x9ad8ff,emissive:0x2a5a8a}),
  pot:mat({color:0xd8a040,metalness:.55,roughness:.35}), amph:mat({color:0xc8643a,roughness:.8}), amphB:mat({color:0x2a1a14}), gold:mat({color:0xffd24a,metalness:.7,roughness:.25,emissive:0x6a4a00}) }; return JAR.mats; }
/* 자리 정하기 (지역마다 같은 씨앗) */
function jarPlan(){ if(JAR.list.length) return; jarRegions().forEach(rg=>{ const r=hsRng(9100+rg.id*31); const n=rg.cap?5:rg.center?9:7;
  for(let i=0;i<n;i++){ let x=0,z=0,ok=false; for(let t=0;t<14&&!ok;t++){ const a=r()*6.283, d=rg.cap?32+r()*(rg.r-38):8+r()*(rg.r-14); x=rg.x+Math.cos(a)*d; z=rg.z+Math.sin(a)*d; ok=Math.abs(x)<WORLD_HALF-6&&Math.abs(z)<WORLD_HALF-6; if(ok&&typeof ALTARS!=="undefined") ok=!Object.values(ALTARS).some(A=>A&&A.shrine&&Math.hypot(A.shrine.x-x,A.shrine.z-z)<14); if(ok&&typeof PLACED!=="undefined") ok=!PLACED.some(p=>p&&Math.hypot(p.x-x,p.z-z)<7); if(ok&&typeof TREEPOS!=="undefined") ok=!TREEPOS.some(t=>Math.hypot(t[0]-x,t[1]-z)<4.5); }
    if(!ok) continue; const kind=rg.realm>=0?["basket","barrel","pot","amph"][rg.realm]:["basket","barrel","pot","amph"][i%4]; const k=rg.id*20+i; const j={k,rg:rg.id,x,z,kind,rot:r()*6.283,s:1.5+r()*.45,mesh:null,broke:0,field:!rg.cap}; JAR.list.push(j); JAR.byK[k]=j; } }); }
function jarMesh(kind,gold){ const g=new THREE.Group(), G0=jarGeo(), M0=jarMats();
  if(gold){ const b=new THREE.Mesh(G0.amph,M0.gold); b.scale.setScalar(1.25); g.add(b); const h=new THREE.Mesh(new THREE.RingGeometry(.9,1.25,20),glowMat(0xffe060,.55)); h.rotation.x=-Math.PI/2; h.position.y=.05; h.userData.noOutline=true; g.add(h); g.userData.halo=h; return g; }
  if(kind==="basket"){ g.add(new THREE.Mesh(G0.basket,M0.basket)); for(let q=0;q<3;q++){ const f=new THREE.Mesh(G0.bloom,M0.bloom[q]); f.position.set(Math.cos(q*2.1)*.3,.92,Math.sin(q*2.1)*.3); g.add(f); } }
  else if(kind==="barrel"){ g.add(new THREE.Mesh(G0.barrel,M0.barrel)); const b=new THREE.Mesh(G0.band,M0.band); b.rotation.x=Math.PI/2; b.position.y=.6; g.add(b); }
  else if(kind==="pot"){ g.add(new THREE.Mesh(G0.pot,M0.pot)); }
  else { g.add(new THREE.Mesh(G0.amph,M0.amph)); const b=new THREE.Mesh(G0.band,M0.amphB); b.rotation.x=Math.PI/2; b.position.y=.62; g.add(b); }
  return g; }
/* ---------- 황금 항아리 (15분마다 한 곳) ---------- */
function jarGSlot(t){ return Math.floor((t||Date.now())/JAR_GP); }
function jarGold(t){ t=t||Date.now(); const s=jarGSlot(t); if(t-s*JAR_GP>JAR_GON) return null; const F=JAR.list.filter(j=>j.field); if(!F.length) return null; const r=hsRng(7777+s*13); r(); return {s,j:F[Math.floor(r()*F.length)]}; }
function jarIsGold(j){ const g=jarGold(); return !!(g&&g.j===j&&(G.jarGB||-1)!==g.s&&!JAR.gBroke); }
/* ---------- 매 프레임 ---------- */
function jarTick(dt){ if(!started||G.realm<0) return; jarPlan(); const away=(typeof glAway==="function"&&glAway()); const now=Date.now(); const tn=performance.now();
  const gg=jarGold(now); if(!gg||gg.s!==JAR.gS){ JAR.gS=gg?gg.s:-1; JAR.gBroke=false; JAR.list.forEach(j=>{ if(j.gold){ j.gold=false; if(j.mesh){ scene.remove(j.mesh); j.mesh=null; } } }); }
  if(gg&&!JAR.gBroke&&JAR.annS!==gg.s&&!away){ const rg=REGIONS[gg.j.rg]; if(rg&&Math.hypot(P.x-rg.x,P.z-rg.z)<rg.r+40){ JAR.annS=gg.s; toast("🌟 근처에 황금 항아리가 반짝여요!",`${rg.n} 어딘가 · 12분 안에 깨 보세요`,2.6); tone(1320,.08,"sine"); tone(1760,.1,"sine",.08); } }
  JAR.chk-=dt; const doVis=JAR.chk<=0; if(doVis) JAR.chk=.5;
  for(const j of JAR.list){ if(j.broke&&now-j.broke>JAR_RESP) j.broke=0;
    const d=Math.hypot(P.x-j.x,P.z-j.z); const show=!away&&!j.broke&&d<80;
    if(doVis||j.mesh){ const gold=jarIsGold(j)&&!j.broke; if(gold!==!!j.gold&&j.mesh){ scene.remove(j.mesh); j.mesh=null; } j.gold=gold;
      if(show&&!j.mesh){ j.mesh=jarMesh(j.kind,j.gold); j.mesh.position.set(j.x,hAt(j.x,j.z),j.z); j.mesh.rotation.y=j.rot; j.mesh.scale.multiplyScalar(j.s); shadowify(j.mesh); scene.add(j.mesh); }
      else if(!show&&j.mesh){ scene.remove(j.mesh); j.mesh=null; } }
    if(j.mesh&&j.hitT>0){ j.hitT-=dt; j.mesh.rotation.z=Math.sin(j.hitT*40)*.12*j.hitT/.3; }
    if(j.mesh&&j.gold){ const h=j.mesh.userData.halo; if(h){ h.scale.setScalar(1+Math.sin(tn/250)*.15); h.material.opacity=.4+Math.sin(tn/200)*.2; } if(Math.random()<dt*3) fxSpark(j.x+rnd(-.6,.6),1.4+rnd(0,.8),j.z+rnd(-.6,.6),0xffe060,2);
      if(!JAR.gLbl) JAR.gLbl=makeLabel(""); if(d<60&&!layerOpen) placeLabel(JAR.gLbl,j.x,2.6,j.z,`🌟 <b>황금 항아리</b> ${Math.round(d)}m`); else JAR.gLbl.style.display="none"; } }
  if(JAR.gLbl&&(!gg||JAR.gBroke||away||!gg.j.mesh)) JAR.gLbl.style.display="none";
  for(let i=JAR.shards.length-1;i>=0;i--){ const s=JAR.shards[i]; s.t+=dt; s.vy-=22*dt; s.m.position.x+=s.vx*dt; s.m.position.y=Math.max(s.gy,s.m.position.y+s.vy*dt); s.m.position.z+=s.vz*dt; s.m.rotation.x+=s.rx*dt; s.m.rotation.y+=s.ry*dt; if(s.m.position.y<=s.gy){ s.vx*=.6; s.vz*=.6; s.rx*=.5; s.ry*=.5; }
    if(s.t>1.4){ scene.remove(s.m); JAR.shards.splice(i,1); } } }
XTICK.push(jarTick);
/* ---------- 깨기 ---------- */
function jarShatter(j,col){ const M0=jarMats(); const m=j.gold?M0.gold:j.kind==="basket"?M0.basket:j.kind==="barrel"?M0.barrel:j.kind==="pot"?M0.pot:M0.amph; const gy=hAt(j.x,j.z)+.05; const n=ECO()?5:9;
  for(let i=0;i<n;i++){ const s=new THREE.Mesh(jarGeo().shard,m); s.position.set(j.x+rnd(-.3,.3),gy+.4+rnd(0,.8),j.z+rnd(-.3,.3)); s.scale.setScalar(rnd(.7,1.6)*(j.gold?1.3:1)); scene.add(s); const a=rnd(0,6.283), sp=rnd(2,5); JAR.shards.push({m:s,t:0,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:rnd(4,8),rx:rnd(-12,12),ry:rnd(-12,12),gy}); }
  fxSpark(j.x,1,j.z,col,ECO()?8:16); fxRing(j.x,j.z,col,2.4,.35); }
function jarBreak(j,mine){ if(!j||j.broke) return; const wasGold=j.gold; j.broke=Date.now(); j.hp=null; jarShatter(j,wasGold?0xffe060:0xffd8a0); if(j.mesh){ scene.remove(j.mesh); j.mesh=null; }
  tone(900,.05,"square",0,.08); tone(1300,.07,"triangle",.03,.07); tone(600,.09,"triangle",.07,.06);
  if(!mine) return; try{ net.send({t:"jb",k:j.k}); }catch(e){} G.jarN=(G.jarN||0)+1; buzz(20); P.shake=Math.max(P.shake||0,.2);
  const L=G.lv, got=[]; const gold=Math.round(rint(5,12)+L*.6); G.gold+=gold; try{ COINFLY.burst(j.x,1,j.z,3); }catch(e){} floatDmg(j.x,2.4,j.z,`+${gold} 금화`,"gain");
  if(wasGold){ JAR.gBroke=true; const gs=jarGSlot(); G.jarGB=gs; G.jarG=(G.jarG||0)+1; G.jarGS=gs; try{ net.send({t:"jgb",s:gs,x:Math.round(j.x),z:Math.round(j.z)}); }catch(e){}
    const big=Math.round(200+L*20); G.gold+=big; G.rune=(G.rune||0)+2; G.ore=(G.ore||0)+3; got.push(`금화 +${fmt(big)}`,"✨ +2","⛓ +3"); if(Math.random()<.3){ try{ got.push("🎁 "+evGear(.3,j.x,j.z)); }catch(e){} }
    try{ COINFLY.burst(j.x,1,j.z,12); [["✨",0x9fe0ff],["⛓",0xc8d0dc]].forEach((q,i)=>PICKFLY.fly(j.x,1,j.z,q[0],q[1],i)); }catch(e){}
    for(let q=0;q<10;q++) setTimeout(()=>fxSpark(j.x+rnd(-3,3),5+rnd(0,3),j.z+rnd(-3,3),0xffe060,8),q*90);
    try{ lvBanner("🌟 황금 항아리!","와르르 쏟아진 보물",got.join(" · ")+" · 근처 친구들에게도 금화비!","#ffd24a"); }catch(e){ toast("🌟 황금 항아리!",got.join(" · "),3); } jingle([784,988,1175,1568,1976]); saveGame(); return; }
  const r=Math.random(); const fly=(ic,c)=>{ try{ PICKFLY.fly(j.x,1,j.z,ic,c,0); }catch(e){} };
  if(r<.18){ G.ore=(G.ore||0)+1; fly("⛓",0xc8d0dc); floatDmg(j.x,3,j.z,"⛓ +1","gain"); }
  else if(r<.26){ G.pots++; fly("🧪",0x9dffb8); floatDmg(j.x,3,j.z,"🧪 물약 +1","gain"); }
  else if(r<.36){ let up=0; try{ up=petGain(4); }catch(e){} fly("🦴",0xffc8a0); floatDmg(j.x,3,j.z,G.pet>=0?"🦴 신수 간식!":"🦴 간식 (신수가 생기면 먹어요)","gain"); if(up) toast("🦴 냠냠! 신수가 자랐어요",null,1.6); }
  else if(r<.40){ G.rune=(G.rune||0)+1; fly("✨",0x9fe0ff); floatDmg(j.x,3,j.z,"✨ 룬 가루 +1","gain"); }
  else if(r<.46&&j.field&&typeof evSpawnFree==="function"){ setTimeout(()=>{ const m=evSpawnFree(j.x,j.z,1); if(m){ floatDmg(j.x,3.4,j.z,"뿅! 숨어 있던 괴물!","me"); tone(160,.2,"sawtooth",0,.1); } },250); }
  saveGame(); }
NETR.jb=(o,d)=>{ const j=JAR.byK[d.k|0]; if(j&&!j.broke) jarBreak(j,false); };
NETR.jgb=(o,d)=>{ const s=d.s|0; if(s!==jarGSlot()) return; JAR.gBroke=true; const g=jarGold(); if(g&&g.j&&!g.j.broke) jarBreak(g.j,false);
  if((G.jarGS|0)===s||P.dead) return; const x=+d.x||0, z=+d.z||0; if(Math.hypot(P.x-x,P.z-z)>35) return; G.jarGS=s; const L=G.lv, gold=Math.round(100+L*10); G.gold+=gold; saveGame();
  for(let q=0;q<8;q++) setTimeout(()=>{ fxSpark(P.x+rnd(-2,2),5,P.z+rnd(-2,2),0xffe060,6); },q*100); try{ COINFLY.burst(P.x,3,P.z,8); }catch(e){} toast(`🌟 ${o.name||"누군가"}가 황금 항아리를 깼어요!`,`금화비 +${fmt(gold)}`,2.4); jingle([988,1175,1568]); };
/* 공격하면 앞의 항아리를 깸 (근접: 손 닿는 곳 · 활·지팡이: 앞 12m) */
function jarHitCheck(ranged){ const wk=(typeof myWeaponKind==="function")?myWeaponKind():"sword"; const reach=ranged?12:(wk==="spear"?4.8:wk==="hammer"?4:3.6); let best=null, bd=1e9;
  for(const j of JAR.list){ if(j.broke||!j.mesh) continue; const d=Math.hypot(j.x-P.x,j.z-P.z); if(d>reach+.6) continue; if(!facingHit(j.x,j.z,reach+.6,ranged?.45:1.1)) continue; if(d<bd){ bd=d; best=j; } }
  if(!best) return; if(ranged){ setTimeout(()=>jarBreak(best,true),Math.min(400,bd*30)); return; } best.hp=(best.hp==null?(best.gold?3:1):best.hp)-1; best.hitT=.3; if(best.hp<=0) jarBreak(best,true); else { tone(700,.05,"square",0,.07); floatDmg(best.x,2.4,best.z,"쨍!",""); } }
(function(){ const _at=attack; attack=function(){ const c0=P.atkCd; const r=_at.apply(this,arguments); try{ if(P.atkCd>c0&&!P.dead&&!(typeof glAway==="function"&&glAway())){ const wk=(typeof myWeaponKind==="function")?myWeaponKind():"sword"; jarHitCheck(wk==="bow"||wk==="magic"); } }catch(e){} return r; }; })();
TITLES.push({id:"jar1",n:"와장창 꼬마",t:1,h:"🏺 항아리 50개 깨기",g:()=>[G.jarN||0,50]},{id:"jar2",n:"항아리 깨기 대장",t:2,h:"🏺 항아리 500개 깨기",g:()=>[G.jarN||0,500]},{id:"jar3",n:"황금 손",t:2,h:"🌟 황금 항아리 5번 깨기",g:()=>[G.jarG||0,5]});
</script>
