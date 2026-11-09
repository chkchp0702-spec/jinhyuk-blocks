<script>
/* ================= v88-2: 🎲 돌발 이벤트 3가지 더 (혼자서도) =================
   04z-events.js 의 EVDEF 에 더해서, 사냥터에서 2~3분마다 나오는 돌발 이벤트가 5가지 → 8가지.
     ❄ 서리 폭풍 버티기 — 하늘에서 얼음 기둥이 떨어짐(파란 고리 1초 뒤). 35초 버티기. 점프·달리기로 피해요.
     ⏱ 사냥 시간 도전 — 50초 안에 괴물 12마리(계속 몰려옴).
     🧚 길 잃은 요정 데려다주기 — 요정이 나를 따라옴. 등불까지 데려가기. 가는 길에 매복 2번, 괴물이 요정 곁에 있으면 요정이 멈춰서 떨어요. */
function ev2Id(){ return EV.cur?EV.cur.id:-1; }
EVDEF.frost={ic:"❄",n:"서리 폭풍 버티기",xp:.14,gold:1.5,rune:1,item:.4,dur:48,start(c){ c.v=0; c.fall=1.2; c.hits=0; for(let i=0;i<2;i++){ const q=evAround(11,15); evSpawn(q.x,q.z,2,false); } toast("❄ 서리 폭풍이 몰아쳐요!","파란 고리가 보이면 피해요 · 35초 버티기",2.4); tone(180,.6,"sine",0,.1); },
  tick(c,dt){ c.v+=dt; c.fall-=dt; if(c.fall<=0){ c.fall=c.v>20?.75:1.05; const n=c.v>20?2:1; for(let i=0;i<n;i++) ev2Ice(c,i===0); } if(c.v>=35) evEnd(true); },
  goal(c){ return `얼음을 피해 버텨요 ${Math.floor(c.v)}/35초 · 맞은 수 ${c.hits}`; }, prog(c){ return c.v/35; }, fail:"서리 폭풍에 길을 잃었어요" };
function ev2Ice(c,aim){ const id=ev2Id(); const lead=aim&&P.moving?2.2:0; const x=clamp(P.x+Math.sin(P.rot)*lead+rnd(-1,1)*(aim?1.2:7),-WORLD_HALF+3,WORLD_HALF-3), z=clamp(P.z+Math.cos(P.rot)*lead+rnd(-1,1)*(aim?1.2:7),-WORLD_HALF+3,WORLD_HALF-3), r=2.3;
  fxRing(x,z,0x7fd8ff,r*1.7,1); tone(1600,.04,"sine",0,.03);
  setTimeout(()=>{ if(!EV.cur||EV.cur.id!==id) return; const g=new THREE.Mesh(new THREE.ConeGeometry(.6,2.6,6),glowMat(0xbfefff,.9)); g.rotation.x=Math.PI; g.position.set(x,hAt(x,z)+1.3,z); g.userData.noOutline=true; scene.add(g); setTimeout(()=>scene.remove(g),500);
    fxSpark(x,1,z,0xdff6ff,14); fxRing(x,z,0xdff6ff,r*1.4,.4); tone(900,.05,"square",0,.04);
    if(Math.hypot(P.x-x,P.z-z)<r){ const before=P.hp; hurtPlayer(stat().mhp*.08,{n:"얼음 기둥"}); if(P.hp<before&&EV.cur&&EV.cur.id===id) EV.cur.hits++; } },1000); }
EVDEF.hunt={ic:"⏱",n:"사냥 시간 도전",xp:.15,gold:1.6,ore:3,item:.45,dur:50,start(c){ c.kn=0; c.sp=0; for(let i=0;i<5;i++){ const q=evAround(9,14); evSpawn(q.x,q.z,1,false); } toast("⏱ 사냥 시간 도전!","50초 안에 괴물 12마리를 잡아요",2.2); jingle([659,784,659,988]); },
  tick(c,dt){ c.sp-=dt; if(c.sp<=0){ c.sp=1.6; if(evAlive().length<6){ const q=evAround(9,14); evSpawn(q.x,q.z,1,c.kn>=6&&Math.random()<.2); } } }, onKill(m){ const c=EV.cur; c.kn++; floatDmg(m.x,4.5,m.z,`⏱ ${c.kn}/12`,"gain"); if(c.kn>=12) evEnd(true); },
  goal(c){ return `괴물 ${c.kn}/12마리`; }, prog(c){ return c.kn/12; }, fail:"시간 안에 다 못 잡았어요" };
EVDEF.fairy={ic:"🧚",n:"길 잃은 요정 데려다주기",xp:.17,gold:1.6,rune:1,pots:1,item:.5,dur:120,start(c){ let ok=false; for(let i=0;i<30&&!ok;i++){ const q=evAround(42,58); const r=regionAt(q.x,q.z); if(r&&!r.cap){ c.gx=q.x; c.gz=q.z; ok=true; } } if(!ok){ c.gx=clamp(P.x+40,-WORLD_HALF+6,WORLD_HALF-6); c.gz=P.z; }
   c.fx=P.x+Math.sin(P.rot)*3; c.fz=P.z+Math.cos(P.rot)*3; c.d0=Math.hypot(c.gx-c.fx,c.gz-c.fz); c.amb=0; c.f=ev2Fairy(); c.goalG=ev2Lamp(c.gx,c.gz); c.lbl=makeLabel(""); c.glbl=makeLabel("");
   try{ setGuide({x:c.gx,z:c.gz,label:"🧚 요정의 등불"}); }catch(e){} toast("🧚 길 잃은 요정을 만났어요!","요정이 나를 따라와요 · 분홍 등불까지 데려가요",2.6); jingle([1046,1318,1568,1318]); },
  tick(c,dt){ const tn=performance.now(); const dP=Math.hypot(P.x-c.fx,P.z-c.fz); const near=evAlive().some(m=>Math.hypot(m.x-c.fx,m.z-c.fz)<8); c.scared=near; c.wait=dP>18;
    if(!near&&dP>2.6&&!c.wait){ const a=Math.atan2(P.x-c.fx,P.z-c.fz); const sp=Math.min(7.5,dP*1.4); c.fx+=Math.sin(a)*sp*dt; c.fz+=Math.cos(a)*sp*dt; }
    const y=hAt(c.fx,c.fz)+1.6+Math.sin(tn/220)*.25+(near?Math.sin(tn/40)*.06:0); c.f.position.set(c.fx+(near?Math.sin(tn/30)*.08:0),y,c.fz); c.f.userData.w1.rotation.y=Math.sin(tn/60)*.8; c.f.userData.w2.rotation.y=-Math.sin(tn/60)*.8; if(Math.random()<dt*6) fxSpark(c.fx,1.4,c.fz,0xffc8f0,2);
    c.goalG.userData.beam.rotation.y+=dt; placeLabel(c.lbl,c.fx,2.6,c.fz,near?"🧚 <b>무서워요!</b>":c.wait?"🧚 <b>기다려요~</b>":"🧚"); const dG=Math.hypot(c.fx-c.gx,c.fz-c.gz); if(Math.hypot(P.x-c.gx,P.z-c.gz)<70) placeLabel(c.glbl,c.gx,5,c.gz,`🏮 요정의 등불 <b>${Math.round(dG)}m</b>`); else c.glbl.style.display="none";
    const prog=1-dG/c.d0; if(c.amb<2&&prog>(c.amb+1)/3){ c.amb++; for(let i=0;i<3;i++){ const a=rnd(0,6.283); evSpawn(clamp(c.fx+Math.sin(a)*10,-WORLD_HALF+4,WORLD_HALF-4),clamp(c.fz+Math.cos(a)*10,-WORLD_HALF+4,WORLD_HALF-4),2,i===0&&c.amb===2); } toast(`⚠ 매복! 요정을 지켜요 (${c.amb}/2)`,"괴물이 요정 곁에 있으면 요정이 멈춰요",1.8); tone(140,.4,"sawtooth",0,.12); }
    if(dG<3.5){ fxRing(c.gx,c.gz,0xff9ad8,8,1); fxSpark(c.gx,2,c.gz,0xffc8f0,30); evEnd(true); return; }
    if(dP>45) evEnd(false,"요정을 잃어버렸어요"); },
  clean(c){ if(c.f) scene.remove(c.f); if(c.goalG) scene.remove(c.goalG); if(c.lbl) c.lbl.remove(); if(c.glbl) c.glbl.remove(); if(P.guide&&P.guide.label==="🧚 요정의 등불"){ P.guide=null; $("guide").hidden=true; } },
  goal(c){ return c.scared?"요정 곁의 괴물을 물리쳐요!":c.wait?"요정이 기다려요 — 돌아가요":`요정과 함께 등불까지 ${Math.round(Math.hypot(c.fx-c.gx,c.fz-c.gz))}m`; }, prog(c){ return c.d0?1-Math.hypot(c.fx-c.gx,c.fz-c.gz)/c.d0:0; }, fail:"요정이 숲속으로 숨어 버렸어요" };
function ev2Fairy(){ const g=new THREE.Group(); g.add(sph(.32,glowMat(0xffe0f6,.95),0,0,0)); const wm=glowMat(0xc8f0ff,.55); const w1=new THREE.Mesh(new THREE.PlaneGeometry(.7,.45),wm); w1.position.set(.3,.1,0); const w2=w1.clone(); w2.position.x=-.3; g.add(w1,w2); g.userData={w1,w2,noOutline:true}; scene.add(g); return g; }
function ev2Lamp(x,z){ const g=new THREE.Group(); const y=hAt(x,z); const post=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,3,8),mat({color:0x5a3a22,roughness:.8})); post.position.set(x,y+1.5,z); g.add(post); g.add(sph(.6,glowMat(0xff9ad8,.95),x,y+3.3,z));
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.4,.7,18,8,1,true),glowMat(0xff9ad8,.22)); beam.position.set(x,y+9,z); g.add(beam); const ring=new THREE.Mesh(new THREE.RingGeometry(3,3.4,40),glowMat(0xff9ad8,.6)); ring.rotation.x=-Math.PI/2; ring.position.set(x,y+.14,z); g.add(ring); g.userData={beam,noOutline:true}; scene.add(g); return g; }
</script>
