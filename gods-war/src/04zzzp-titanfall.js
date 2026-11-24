<script>
/* ================= v171: 주간 거대 보스 쓰러질 때 — 느린 화면 · 무너짐 · 금빛 폭발 고리 · 조각 흩어짐 =================
   전에는 체력이 0이 되는 순간 거대 보스가 그냥 사라지고 보상 창이 떴음.
   이제 (내가 80m 안에 있으면) 약 1.9초 동안: 세상이 느려지고 영화 띠 → 보스가 하얗게 번쩍이며 비틀비틀 옆으로 쓰러지고 땅속으로 가라앉음
   → 금빛 고리가 세 번 퍼짐 → 마지막에 큰 금빛 폭발과 함께 세계 색·금빛 조각(한 번에 그리는 묶음 1개)이 사방으로 튀어 떨어짐 → 그 뒤 원래 보상 창.
   보상·저장(TB)·함께하기 메시지는 원래 titanDefeated 그대로(1.9초 늦게 부를 뿐 — 그 사이 앱을 꺼도 다음에 열면 그대로 받음).
   04zt-gacha.js 의 titanDefeated 감싸기보다 뒤 이름이라 바깥에서 감쌈(뽑기권 보상 그대로). PointLight 없음, 그리기 +1(조각) 잠깐. */
const TFALL={on:false,t:0,m:null,shard:null,sv:[],fired:0,base:{x:0,y:0,z:0}};
(function(){
  if(typeof titanDefeated!=="function") return;
  const _td=titanDefeated;
  titanDefeated=function(){ if(TFALL.on) return; const m=TITAN.m;
    if(TB.claimed||!m||!m.mesh||P.dead||Math.hypot(P.x-TITAN_POS.x,P.z-TITAN_POS.z)>80) return _td.apply(this,arguments);
    // 몸을 괴물 목록에서 떼어 냄(더 못 때리고, tickTitan 이 바로 지우지 않게) — 보상은 연출 끝에
    TITAN.m=null; const i=mobs.indexOf(m); if(i>=0) mobs.splice(i,1); try{ m.lbl.remove(); }catch(e){}
    TFALL.on=true; TFALL.t=0; TFALL.m=m; TFALL.fired=0; TFALL.rot0=m.mesh.rotation.y; TFALL.side=Math.random()<.5?-1:1;
    TFALL.base={x:m.mesh.position.x,y:m.mesh.position.y,z:m.mesh.position.z};
    try{ animState(m.mesh,"hit"); }catch(e){}
    try{ KILLCAM.cool=0; KILLCAM.go({boss:true,x:TITAN_POS.x,z:TITAN_POS.z,scale:m.scale,mesh:{position:{y:m.mesh.position.y+4}}}); KILLCAM.d=1.05; KILLCAM.slow=.22; KILLCAM.zoom=.1; KILLCAM.cool=3; }catch(e){}
    try{ fxFlash(TITAN_POS.x,7,TITAN_POS.z,0xffffff,5,.35); fxRing(TITAN_POS.x,TITAN_POS.z,0xffe08a,14,.7); }catch(e){}
    P.shake=Math.max(P.shake||0,.9); try{ buzz([60,40,60]); }catch(e){}
    try{ tone(98,.6,"sawtooth",0,.12); tone(196,.4,"triangle",.05,.06); }catch(e){}
  };
  function shards(){ const eco=(typeof ECO==="function"&&ECO()), N=(typeof HIGH==="function"&&HIGH())?(eco?28:44):18;
    const D=titanDef(TB.w); const rc=new THREE.Color((REALMS[D.realm]&&REALMS[D.realm].c1)||0xff7a3d); const gold=new THREE.Color(0xffd86a);
    const geo=new THREE.TetrahedronGeometry(.55,0); const mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
    const im=new THREE.InstancedMesh(geo,mat,N); im.frustumCulled=false; im.userData.noLod=true; TFALL.sv=[];
    for(let k=0;k<N;k++){ const a=Math.random()*Math.PI*2, sp=rnd(7,17); TFALL.sv.push({x:TITAN_POS.x+Math.cos(a)*rnd(1,4),y:TFALL.base.y+rnd(3,8),z:TITAN_POS.z+Math.sin(a)*rnd(1,4),vx:Math.cos(a)*sp,vy:rnd(6,16),vz:Math.sin(a)*sp,rx:rnd(0,6),ry:rnd(0,6),wx:rnd(-9,9),wy:rnd(-9,9),s:rnd(.6,1.6)});
      im.setColorAt(k,(k%3===0?rc.clone():gold.clone()).multiplyScalar(k%5===0?1.4:1)); }
    scene.add(im); TFALL.shard=im; TFALL.st=0; }
  const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler(), V=new THREE.Vector3(), S=new THREE.Vector3();
  function end(){ const m=TFALL.m; TFALL.on=false; TFALL.m=null; if(m&&m.mesh) scene.remove(m.mesh);
    try{ _td(); }catch(e){ console.warn(e); } }
  document.addEventListener("DOMContentLoaded",()=>{ try{ const _up=update;
  update=function(dt){ _up(dt); if(!TFALL.on&&!TFALL.shard) return;
    try{ const K=KILLCAM; if(K.d>0&&K.t<K.d){ const q=K.t/K.d; dt*=K.slow+(1-K.slow)*q*q*q; } }catch(e){}
    if(TFALL.on){ const F=TFALL, m=F.m; F.t+=dt; const t=F.t, X=TITAN_POS.x, Z=TITAN_POS.z;
      if(m&&m.mesh&&m.mesh.parent){ const g=m.mesh;
        // 0~.5 비틀비틀(하얗게 깜빡) → .5~1.6 옆으로 쓰러지며 가라앉음
        const wob=t<.6?Math.sin(t*38)*.06*(1-t/.6):0; const fall=Math.max(0,Math.min(1,(t-.45)/1.15)); const fe=fall*fall*(3-2*fall);
        g.rotation.set(0,F.rot0,0); g.rotateZ(F.side*(fe*1.25+wob)); g.rotateX(fe*.25);
        const H=(g.userData.h||4)*m.scale; g.position.set(F.base.x,F.base.y-fe*H*.55,F.base.z);
        g.scale.setScalar(m.scale*(1+.05*Math.sin(Math.min(t,.5)*Math.PI*6)*(1-fall))*(1-fe*.12));
        try{ hitTint(g,t<1.6?(.35+.4*Math.abs(Math.sin(t*14)))*(1-fe*.5):0); }catch(e){}
        if(m.aura){ m.aura.material.opacity=.75*(1-fe); }
        if(fall>0&&Math.floor((t-dt-.45)/.22)!==Math.floor((t-.45)/.22)){ try{ fxSpark(X+rnd(-5,5),.6,Z+rnd(-5,5),0xcfb48a,HIGH()?16:8); }catch(e){} } }
      const at=[0.3,0.75,1.2]; while(F.fired<3&&t>=at[F.fired]){ const n=F.fired++; try{ fxRing(X,Z,n===1?0xfff3c0:0xffd86a,16+n*9,.9); thud(); }catch(e){} P.shake=Math.max(P.shake||0,.5+n*.15); }
      if(F.fired===3&&t>=1.62&&!F.boom){ F.boom=1; try{ fxFlash(X,7,Z,0xffe08a,8,.6); fxRing(X,Z,0xffe08a,44,1.7); fxRing(X,Z,0xffffff,26,1.0); fxSpark(X,6,Z,0xffe08a,HIGH()?90:40); drama(0xffe9a8,.5,1.2); }catch(e){}
        shards(); P.shake=Math.max(P.shake||0,1.3); try{ buzz([90,40,140]); tone(60,.9,"sawtooth",0,.16); tone(523,.3,"sine",.1,.06); tone(1046,.4,"sine",.18,.05); }catch(e){}
        if(m&&m.mesh) scene.remove(m.mesh); }
      if(t>=1.95){ F.boom=0; end(); } }
    if(TFALL.shard){ const im=TFALL.shard; TFALL.st+=dt; const st=TFALL.st, life=1.7, k=st/life;
      if(k>=1){ scene.remove(im); im.geometry.dispose(); im.material.dispose(); TFALL.shard=null; return; }
      im.material.opacity=k<.6?1:1-(k-.6)/.4;
      for(let i=0;i<TFALL.sv.length;i++){ const s=TFALL.sv[i]; s.vy-=22*dt; s.x+=s.vx*dt; s.y+=s.vy*dt; s.z+=s.vz*dt; s.vx*=.985; s.vz*=.985;
        const gy=hAt(s.x,s.z)+.25; if(s.y<gy){ s.y=gy; s.vy=Math.abs(s.vy)*.35; s.vx*=.6; s.vz*=.6; }
        s.rx+=s.wx*dt; s.ry+=s.wy*dt; E.set(s.rx,s.ry,0); Q.setFromEuler(E); V.set(s.x,s.y,s.z); S.setScalar(s.s*(1-k*.5)); M4.compose(V,Q,S); im.setMatrixAt(i,M4); }
      im.instanceMatrix.needsUpdate=true; }
  }; }catch(e){ console.warn(e); } });
})();
</script>
