<script>
/* ================= v89-1: 🪽 헤르메스의 날개 신발 — 하늘을 미끄러져 나는 활강 (IDEAS G11/9-4) =================
   점프 → 공중에서 한 번 더(2단 점프) → 한 번 더 누르면 발목에 금빛 날개가 펴지며 천천히 미끄러져 내려감(활강).
   활강 중에는 바라보는 쪽으로 저절로 앞으로 나아가고, 조이스틱으로 방향을 바꿈. 점프를 또 누르면 날개를 접음(9초 지나면 저절로 접힘).
   🌀 바람 기둥: 사냥터·세계의 중심 곳곳(12곳). 들어가면 바람이 위로 붕 올려 줌(최대 약 14m) → 높이 올라가서 멀리 활강.
   💥 착지 공격: 1초 넘게 날다가 땅에 내려앉으면 「쿵!」 — 둘레 괴물에게 큰 피해.
   다른 사람 화면에도: 활강 중이면 t:"gl" 로 높이를 보내서, 친구 화면에서도 내가 날개를 펴고 공중에 떠 있음.
   미궁·신전 섬·하늘 탑·놀이 마당·사막·생방송 섬 같은 따로 된 곳, 신수를 탄 동안(신수는 원래 활공함)에는 안 펴짐.
   저장: G.glDist(활강한 거리 m) · G.glStomp(착지 공격 수) · G.glTip(처음 안내 봄). 칭호 2개. */
const GL={on:false,t:0,cd:0,send:0,trail:0,wing:null,ups:[],upBuilt:false,tipT:0,lbl:null,peerW:{},upHint:0};
function glAway(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof PG!=="undefined"&&PG.on)||(typeof DS!=="undefined"&&DS.on)||(typeof TW!=="undefined"&&TW.on)||(typeof LV!=="undefined"&&LV.on)||(typeof AR!=="undefined"&&AR.on)||(typeof RC!=="undefined"&&RC.on)||(typeof xzOn==="function"&&!!xzOn()); }
function glCan(){ return started&&G.realm>=0&&!P.dead&&!layerOpen&&!P.ride&&!glAway()&&GL.cd<=0; }
/* ---------- 날개 모양 (발목에 한 쌍씩) ---------- */
function glWingPair(col){ const g=new THREE.Group(); const m1=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.95}), m2=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95});
  [-1,1].forEach(s=>{ const w=new THREE.Group(); for(let i=0;i<4;i++){ const f=new THREE.Mesh(GEO.box,i===0?m2:m1); f.scale.set(.62-i*.1,.06,.24); f.position.set(s*(.26+(.62-i*.1)/2),.02+i*.07,-.06-i*.11); f.rotation.y=s*(.15+i*.22); w.add(f); } w.userData.s=s; g.add(w); });
  return g; }
function glMakeWings(col){ const g=new THREE.Group(); const a=glWingPair(col), b=glWingPair(col); a.position.set(-.28,.32,0); a.scale.setScalar(1.1); b.position.set(.28,.32,0); b.scale.setScalar(1.1); g.add(a,b);
  const big=glWingPair(col); big.position.set(0,2.2,-.45); big.scale.setScalar(2.9); g.add(big); g.userData.parts=[a,b,big]; g.visible=false; g.userData.noOutline=true; return g; }
function glFlap(g,tn,on){ if(!g) return; g.visible=on; if(!on) return; const k=Math.sin(tn/85)*.35; g.userData.parts.forEach((p,i)=>p.children.forEach(w=>{ w.rotation.z=w.userData.s*(i===2?.25+k*.6:.5+k); })); }
function glMyWing(){ const c=0xffb020; if(!GL.wing||GL.wing.userData.col!==c){ if(GL.wing&&GL.wing.parent) GL.wing.parent.remove(GL.wing); GL.wing=glMakeWings(c); GL.wing.userData.col=c; } if(player&&GL.wing.parent!==player) player.add(GL.wing); return GL.wing; }
/* ---------- 펴기 · 접기 · 내려앉기 ---------- */
function glStart(){ GL.on=true; GL.t=0; P.vy=Math.max(P.vy,5.5); P.twirl=0; glMyWing(); tone(660,.12,"sine"); tone(990,.16,"triangle",.06); tone(1320,.1,"sine",.12); fxSpark(P.x,P.y+1,P.z,0xfff2a0,14); buzz(15);
  if(!G.glTip){ G.glTip=1; saveGame(); toast("🪽 헤르메스의 날개 신발!","바라보는 쪽으로 날아가요 · 조이스틱으로 방향 · 점프 한 번 더 = 날개 접기",3.2); } }
function glEnd(why){ if(!GL.on) return; GL.on=false; GL.cd=.35; if(why==="fold"){ tone(520,.08,"triangle"); tone(390,.1,"triangle",.05); } try{ net.send({t:"gl",y:0}); }catch(e){} }
function glLand(){ const flew=GL.t; glEnd(); fxRing(P.x,P.z,0xfff2a0,3.5,.4);
  if(flew>1){ const st=stat(), r=4.8; let n=0; mobs.forEach(m=>{ if(m.hp>0&&Math.hypot(m.x-P.x,m.z-P.z)<r+(m.scale||1)*.5){ damageMob(m,st.atk*2.4,true); n++; } });
    try{ SFX.shock(P.x,P.z,0xffd24a,r,.55); }catch(e){ fxRing(P.x,P.z,0xffd24a,r*1.6,.5); } P.shake=Math.max(P.shake||0,.45); thud(); buzz(35);
    if(n){ G.glStomp=(G.glStomp||0)+1; floatDmg(P.x,4.5,P.z,"🪽 착지 공격!","crit"); saveGame(); } } }
/* 점프 버튼·스페이스: 06-ui.js 의 jump() 보다 먼저 들음 → 2단 점프 뒤 한 번 더 누르면 날개 펴기, 날 때 누르면 접기 */
function glPress(){ if(GL.on){ glEnd("fold"); return; } if(P.air===2&&P.y>.6&&glCan()) glStart(); }
(function(){ const b=$("bJump"); if(b) b.addEventListener("pointerdown",()=>{ if(!layerOpen) glPress(); }); addEventListener("keydown",e=>{ if(e.key===" "&&!e.repeat&&!layerOpen) glPress(); }); })();
/* ---------- 🌀 바람 기둥 ---------- */
function glUpSpots(){ const L=[]; const r=dgRng(8901); for(let realm=0;realm<4;realm++){ [1,2].forEach(k=>{ const rg=REGIONS[realm*3+k]; const a=r()*6.283, d=rg.r*(.3+r()*.25); L.push({x:rg.x+Math.cos(a)*d,z:rg.z+Math.sin(a)*d,realm}); }); }
  for(let i=0;i<4;i++){ const a=i/4*6.283+.6; L.push({x:Math.cos(a)*34,z:Math.sin(a)*34,realm:-1}); } return L; }
function glUpBuild(){ GL.upBuilt=true; const pole=new THREE.CylinderGeometry(2.6,2.6,16,20,1,true);
  glUpSpots().forEach(s=>{ const col=s.realm>=0?new THREE.Color(REALMS[s.realm].c1).getHex():0xbfe8ff; const g=new THREE.Group(); const c=new THREE.Mesh(pole,glowMat(0xd8f4ff,.13)); c.position.y=8; g.add(c);
    const rings=[]; for(let i=0;i<3;i++){ const t=new THREE.Mesh(GEO.ring,glowMat(i===1?col:0xffffff,.55)); t.rotation.x=-Math.PI/2; t.scale.setScalar(2.4); t.position.y=1+i*5; t.userData.p=i/3; g.add(t); rings.push(t); }
    const base=new THREE.Mesh(GEO.ring,glowMat(col,.7)); base.rotation.x=-Math.PI/2; base.scale.setScalar(3); base.position.y=.15; g.add(base);
    g.position.set(s.x,hAt(s.x,s.z),s.z); g.userData.noOutline=true; scene.add(g); GL.ups.push(Object.assign({g,rings,base},s)); }); }
function glUpTick(dt,tn){ if(!GL.upBuilt){ if(started&&G.realm>=0) try{ glUpBuild(); }catch(e){ console.warn(e); GL.upBuilt=true; } return; }
  const away=glAway(); let inUp=null;
  GL.ups.forEach(u=>{ const d=Math.hypot(P.x-u.x,P.z-u.z); const vis=!away&&d<150; if(u.g.visible!==vis) u.g.visible=vis; if(!vis) return;
    u.rings.forEach(t=>{ t.userData.p=(t.userData.p+dt*.35)%1; t.position.y=.5+t.userData.p*15; t.material.opacity=.6*Math.sin(t.userData.p*Math.PI); t.rotation.z+=dt*2; }); u.base.rotation.z-=dt;
    if(d<45&&Math.random()<dt*(ECO()?2:5)) fxSpark(u.x+rnd(-1.5,1.5),rnd(.5,6),u.z+rnd(-1.5,1.5),0xffffff,2);
    if(d<2.9) inUp=u; });
  if(inUp&&!P.dead&&!P.ride){ const gy=(typeof GI!=="undefined"&&GI.gy)||0; if(P.y+gy<14){ if(P.y<=.01){ P.vy=12; P.air=1; P.y=.02; tone(300,.1,"sine"); tone(600,.12,"sine",.06); }
      else P.vy=Math.max(P.vy,GL.on?11:9); if(Math.random()<dt*12) fxSpark(P.x,P.y,P.z,0xffffff,3); }
    if(!GL.on&&P.air<2&&GL.upHint<=0&&P.y>3){ GL.upHint=20; toast("🌀 바람 기둥!","점프를 두 번 더 누르면 날개가 펴져요 🪽",2.2); } }
  GL.upHint=Math.max(0,GL.upHint-dt); }
/* ---------- 매 프레임 ---------- */
function glTick(dt){ if(!started) return; const tn=performance.now(); GL.cd=Math.max(0,GL.cd-dt);
  glUpTick(dt,tn);
  if(GL.on){ if(P.dead||P.ride||glAway()){ glEnd(); } else if(P.y<=.001){ glLand(); } else {
      GL.t+=dt; if(P.vy<-1.6) P.vy=-1.6;
      const fx=Math.sin(P.rot), fz=Math.cos(P.rot), sp=7.5; const ox=P.x, oz=P.z; P.x=clamp(P.x+fx*sp*dt,-WORLD_HALF+2,WORLD_HALF-2); P.z=clamp(P.z+fz*sp*dt,-WORLD_HALF+2,WORLD_HALF-2);
      const step=Math.hypot(P.x-ox,P.z-oz)+(P.moving?10.5*dt:0); G.glDist=(G.glDist||0)+step; player.position.x=P.x; player.position.z=P.z;
      GL.trail-=dt; if(GL.trail<=0){ GL.trail=ECO()?.14:.07; fxSpark(P.x-fx*.6,P.y+((typeof GI!=="undefined"&&GI.gy)||0)+.4,P.z-fz*.6,0xfff2a0,2); }
      if(GL.t>9){ glEnd("fold"); toast("🪽 날개가 지쳤어요","바람 기둥에서 다시 날아올라요",1.6); }
      GL.send-=dt; if(GL.send<=0){ GL.send=ECO()?.4:.25; try{ net.send({t:"gl",y:+(P.y+((typeof GI!=="undefined"&&GI.gy)||0)).toFixed(1)}); }catch(e){} } } }
  glFlap(GL.wing,tn,GL.on);
  { const tg=GL.on||P.y>2.5?P.y*.6:0; GL.camY=(GL.camY||0)+(tg-(GL.camY||0))*Math.min(1,dt*3); if(GL.camY>.03&&!(typeof GI!=="undefined"&&GI.gy>0)) P.gy=(P.gy||0)+GL.camY; }   // 높이 날면 카메라도 살짝 따라 올라감
  if(GL.on&&player&&player.userData.gl) try{ animState(player,"jump"); }catch(e){}
  // 다른 사람의 날개
  for(const id in PEERS){ const o=PEERS[id]; const fly=o.glY>0&&tn-(o.glT||0)<1200&&!o.dead; o.glS=(o.glS||0)+((fly?o.glY:0)-(o.glS||0))*Math.min(1,dt*6); if(o.glS>.05&&o.mesh) o.mesh.position.y+=o.glS;
    let w=GL.peerW[id]; if(fly&&!w){ w=GL.peerW[id]=glMakeWings(0xffb020); } if(w){ if(o.mesh&&w.parent!==o.mesh) o.mesh.add(w); glFlap(w,tn,fly); } }
  for(const id in GL.peerW){ if(!PEERS[id]){ const w=GL.peerW[id]; if(w.parent) w.parent.remove(w); delete GL.peerW[id]; } }
  if(!G.glTip2&&GL.ups.length&&tn>9000&&!layerOpen){ G.glTip2=1; saveGame(); toast("🪽 새 기능: 헤르메스의 날개 신발","점프를 세 번 누르면 날개가 펴져요! 🌀 바람 기둥에 들어가면 높이 올라가요",4); } }
XTICK.push(glTick);
NETR.gl=(o,d)=>{ o.glY=+d.y||0; o.glT=performance.now(); };
/* 활강 중 높이 0.8 넘으면 땅 공격은 원래처럼 피함(hurtPlayer) */
MAP_X.push((ctx,tx,tz,big,u)=>{ if(glAway()) return; GL.ups.forEach(s=>{ const X=tx(s.x), Z=tz(s.z); ctx.beginPath(); ctx.arc(X,Z,(big?3.2:4)*u,0,6.2832); ctx.fillStyle="rgba(200,240,255,.85)"; ctx.fill(); ctx.strokeStyle="#4aa8d8"; ctx.lineWidth=1.2*u; ctx.stroke(); }); });
function showGlide(){ card(`<h2>🪽 헤르메스의 날개 신발</h2><p><b>점프 → 공중에서 점프(2단) → 한 번 더 점프</b>하면 발목에 금빛 날개가 펴져요. 바라보는 쪽으로 천천히 날아가고, 조이스틱으로 방향을 바꿔요. 날 때 점프를 또 누르면 날개를 접어요.</p>
  <h3>🌀 바람 기둥</h3><p>사냥터와 세계의 중심에 하얀 바람 기둥이 12개 있어요(지도에 하늘색 동그라미). 들어가면 바람이 위로 붕 올려 줘요 → 높이 올라가서 날개를 펴면 아주 멀리 날아가요!</p>
  <h3>💥 착지 공격</h3><p>1초 넘게 날다가 괴물 옆에 내려앉으면 「쿵!」 — 둘레 괴물에게 큰 피해를 줘요.</p>
  <div class="idlegrid"><div><b>${fmt(Math.round(G.glDist||0))}m</b><span>날아간 거리</span></div><div><b>${G.glStomp||0}</b><span>착지 공격</span></div></div>
  <p style="font-size:12px">미궁·신전 섬·하늘 탑·놀이 마당 같은 따로 된 곳, 신수를 타고 있을 때는 날개가 안 펴져요(신수는 원래 천천히 내려와요). 날 때 높이 0.8m 넘으면 땅 공격을 피해요.</p>`); }
MENU_X.push({ic:"🪽",n:"날개 신발 · 바람 기둥",id:"glBtn",sub:()=>`날아간 거리 ${fmt(Math.round(G.glDist||0))}m`,f:showGlide});
TITLES.push({id:"gl1k",n:"바람을 타는 자",t:1,h:"날개 신발로 1,000m 날기",g:()=>[Math.round(G.glDist||0),1000]},{id:"gls30",n:"헤르메스의 제자",t:2,h:"착지 공격 30번",g:()=>[G.glStomp||0,30]});
</script>
