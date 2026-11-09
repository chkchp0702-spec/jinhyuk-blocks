<script>
/* v97 쓰러짐 연출 — 세상이 흑백으로 바래고 카메라가 쓰러진 나를 천천히 올려다보며 빙 돌아 올라감. 부활 땐 빛기둥·하얀 번쩍과 함께 색이 돌아옴. 모습만(부활 시간·벌칙 그대로) */
const DEATHFX={t:0,on:false,a0:0};
DEATHFX.start=function(){ DEATHFX.t=0; DEATHFX.on=true; try{ DEATHFX.a0=Math.atan2(camera.position.x-P.x,camera.position.z-P.z); }catch(e){ DEATHFX.a0=0; } document.body.classList.add("dying"); try{ tone(220,.5,"sine",0,.06); tone(165,.8,"sine",.25,.05); }catch(e){} };
DEATHFX.stop=function(revive){ const was=DEATHFX.on; DEATHFX.on=false; document.body.classList.remove("dying"); if(!revive||!was) return;
  try{ const R=RM(); fxPillar(R.c1!=null?R.c1:0xffe08a,1.1,HIGH()?30:16,1.4,.55); fxPillar(0xffffff,.55,HIGH()?30:16,1,.6); }catch(e){}
  try{ fxSpark(P.x,1.5,P.z,0xfff2b0,ECO()?10:24); }catch(e){}
  const f=document.createElement("div"); f.className="revfl"; document.body.appendChild(f); setTimeout(()=>f.remove(),900); };
/* 06-ui.js 카메라에서 부름: 처리했으면 true */
DEATHFX.cam=function(dt,gy){ if(!P.dead){ if(DEATHFX.on) DEATHFX.stop(false); return false; } if(!DEATHFX.on) DEATHFX.start();
  DEATHFX.t+=dt; const t=DEATHFX.t, e=1-Math.exp(-t*.55), a=DEATHFX.a0+t*.22, R=6+e*5;
  const tx=P.x+Math.sin(a)*R, tz=P.z+Math.cos(a)*R, ty=gy+2.4+e*9;
  camera.position.x+=(tx-camera.position.x)*Math.min(1,dt*2.2); camera.position.y+=(ty-camera.position.y)*Math.min(1,dt*2.2); camera.position.z+=(tz-camera.position.z)*Math.min(1,dt*2.2);
  camera.lookAt(P.x+(camera.position.x-P.x)*.12,gy-.2-e*.9,P.z+(camera.position.z-P.z)*.12); /* 쓰러진 나는 화면 위쪽(글씨에 안 가리게) */ return true; };
</script>
