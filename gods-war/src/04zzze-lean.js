<script>
/* ================= v151 그래픽: 달릴 때 몸 기울이기(손맛) =================
   상업용 액션 게임처럼 ①달리면 몸을 앞으로 살짝 숙이고 ②방향을 홱 틀면 도는 쪽으로 몸을 기울이고(오토바이처럼)
   ③달리다 멈추면 몸이 앞으로 쏠렸다 뒤로 살짝 버티며 제자리(브레이크 반동).
   IDLEFX 와 같은 방식 — 애니메이션 믹서가 뼈를 움직인 "뒤"에 hips·spine 뼈에 살짝 더함. 위치·속도·규칙 그대로, 모습만.
   공격·점프 중엔 약하게, 탈것·죽음·창 열림이면 끔. 뼈 2개 회전만이라 휴대폰 부담 없음. */
const LEAN=(()=>{ let bones=null, owner=null, lastRot=null, lastX=0, lastZ=0, roll=0, pitch=0, spd=0, brake=0, bv=0;
  function findBones(){ const u=player&&player.userData; if(!u||!u.gl) return null; if(owner===player&&bones) return bones; owner=player; bones={}; player.traverse(o=>{ if(!o.isBone) return; const n=o.name.toLowerCase(); if(n==="hips") bones.hips=o; else if(n==="spine") bones.spine=o; else if(n==="chest") bones.chest=o; }); lastRot=null; return bones; }
  function post(dt){ try{ if(!started||!player||!player.userData.gl||dt<=0) return; const B=findBones(); if(!B||!B.hips) return;
      const off=P.dead||P.ride||layerOpen||!player.visible;
      let dr=0; if(lastRot!=null){ dr=player.rotation.y-lastRot; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; } lastRot=player.rotation.y;
      const v=Math.hypot(P.x-lastX,P.z-lastZ)/dt; lastX=P.x; lastZ=P.z; const vv=(v>40||P.twirl>0)?0:v; /* 순간이동·빙글 돌기는 무시 */
      const k=Math.min(1,dt*7); const wasSpd=spd; spd+=(Math.min(1,vv/4.5)*(P.moving?1:0)-spd)*k;
      /* 멈추는 순간 브레이크 반동(앞으로 쏠림 → 뒤로 버팀) — 용수철처럼 */
      if(wasSpd>.45&&!P.moving&&brake===0&&bv===0) bv=-2.6*wasSpd;
      bv+=(-brake*90-bv*11)*dt; brake+=bv*dt; if(Math.abs(brake)<.002&&Math.abs(bv)<.02){ brake=0; bv=0; }
      const busy=(P.atkAnim>0)||P.y>.05; const w=off?0:busy?.35:1;
      const tRoll=w*Math.max(-.17,Math.min(.17,-(dr/dt)*.12*Math.max(.4,spd))); roll+=(tRoll-roll)*Math.min(1,dt*10);
      const tPitch=w*(.13*spd); pitch+=(tPitch-pitch)*k;
      if(off){ brake=0; bv=0; }
      if(Math.abs(roll)+Math.abs(pitch)+Math.abs(brake)<.002) return;
      B.hips.rotation.z+=roll; B.hips.rotation.x+=pitch*.45;
      const sp=B.spine||B.chest; if(sp){ sp.rotation.x+=pitch*.55-brake; sp.rotation.z+=roll*.4; }
    }catch(e){} }
  return {post,get roll(){ return roll; },get pitch(){ return pitch; },get brake(){ return brake; }};
})();
{ const _tm=tickMixers; tickMixers=function(dt){ _tm(dt); LEAN.post(dt); }; }
</script>
