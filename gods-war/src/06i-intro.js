<script>
/* ================= v184 그래픽: 첫 접속 소개 카메라 비행 =================
   처음 들어왔을 때 딱 한 번, 카메라가 하늘 높이에서 세계 위를 크게 한 바퀴 돌며 내려와 내 캐릭터 뒤에 착 붙음(약 7초).
   위·아래 검은 영화 띠 + 가운데 세계 이름 큰 글씨, 화면 어디든 누르면 바로 건너뜀. 창(이야기·쉬는 동안 보고)이 뜨면 바로 끝.
   CAMX(04zc-live.js 카메라 넘겨받기)만 씀 → 그리기 호출 0, 저장 기록·규칙 그대로(본 적 있는지는 따로 gw-intro 한 칸). */
const INTRO=(()=>{ let on=false, t=0, D=7.2, a0=0, el=null, gy=0;
  const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
  function bars(show){ try{ if(show){ if(!el){ el=document.createElement("div"); el.id="introCam"; el.innerHTML='<i class="ibT"></i><i class="ibB"></i><div class="ibTxt"><small>⚔ 신들의 전쟁</small><b></b><em></em></div><div class="ibSkip">화면을 누르면 건너뛰어요 ▶</div>'; document.body.appendChild(el); }
        let n="", s=""; try{ n=RM().n; s=RM().absolute+"의 세계"; }catch(e){} el.querySelector("b").textContent=n; el.querySelector("em").textContent=s; el.classList.remove("off","quiet"); void el.offsetWidth; el.classList.add("on"); document.body.classList.add("introOn"); }
      else { document.body.classList.remove("introOn"); if(el){ el.classList.remove("on"); el.classList.add("off"); } } }catch(e){} }
  function skip(){ if(on) stop(); }
  function start(force){ try{ if(on) return; if(!force&&load("gw-intro")==="1") return; save("gw-intro","1"); if(typeof CAMX==="undefined") return;
      on=true; t=0; a0=Math.random()*Math.PI*2; gy=P.gy||0; CAMX.on=true; CAMX.pos.set(P.x+Math.sin(a0)*70,gy+46,P.z+Math.cos(a0)*70); CAMX.look.set(P.x,gy+2,P.z); camera.position.copy(CAMX.pos); camera.lookAt(CAMX.look); bars(true);
      setTimeout(()=>{ addEventListener("pointerdown",skip,{capture:true,once:true}); },350); }catch(e){ on=false; } }
  function stop(){ on=false; try{ CAMX.on=false; }catch(e){} bars(false); removeEventListener("pointerdown",skip,{capture:true}); }
  function tick(dt){ if(!on) return; if(!started||P.dead||layerOpen||(typeof LV!=="undefined"&&LV.on)){ stop(); return; }
    t+=dt; const k=Math.min(1,t/D), e=ease(k); gy=P.gy||0;
    /* 반지름 70→12.5, 높이 46→11.5, 각도는 한 바퀴 가까이 돌아 내 뒤(+z 쪽)로 */ const T2=Math.PI*2, aEnd=Math.ceil((a0+T2*.75)/T2)*T2; const ang=a0+(aEnd-a0)*e;
    const R=70+(12.5-70)*e, H=46+(11.5-46)*Math.pow(e,1.4); CAMX.pos.set(P.x+Math.sin(ang)*R,gy+H,P.z+Math.cos(ang)*R);
    CAMX.look.set(P.x,gy+2+(1-e)*4,P.z-5*e); if(k>=1) stop(); }
  return {start,stop,tick,get on(){ return on; }};
})();
{ const _b=begin; begin=function(){ const r=_b.apply(this,arguments); try{ setTimeout(()=>{ if(!layerOpen) INTRO.start(); },250); }catch(e){} return r; }; }
{ const _lb=lvBanner; lvBanner=function(){ try{ if(INTRO.on&&el0()) el0().classList.add("quiet"); }catch(e){} return _lb.apply(this,arguments); }; }
function el0(){ return document.getElementById("introCam"); }
{ const _u=update; update=function(dt){ _u(dt); try{ INTRO.tick(dt); }catch(e){} }; }
</script>
