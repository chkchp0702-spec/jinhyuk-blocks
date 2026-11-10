<script>
/* ================= 경험치 구슬이 경험치 바로 빨려듦 (v98) =================
   괴물을 쓰러뜨리면 몸에서 파란 빛 구슬(꼬리 달린 반딧불 모양)이 몇 개 피어올라 빙글 한 번 맴돈 뒤 → 화면 위 경험치 바 끝으로 휘익 빨려 들어감.
   들어가면 바 끝이 하얗게 톡 번쩍(.xphit)하고 맑은 "딩" 소리. 보스는 구슬 9개, 정예 5개, 보통 3개.
   화면 위 작은 DOM 이라 그리기 호출 0, 한 번에 최대 16개, 배터리 절약 모드는 2개. 경험치 양·계산은 그대로(바는 지금처럼 바로 오름). */
const XPFLY=(()=>{ let live=0; const V=new THREE.Vector3();
  function target(){ const el=document.getElementById("xpBar"); if(!el) return null; const bar=el.parentNode, r=bar.getBoundingClientRect(), f=el.getBoundingClientRect(); if(!r.width||r.bottom<0) return null;
    return {x:Math.max(r.left+6,Math.min(r.right-4,f.right)),y:r.top+r.height/2,bar}; }
  function hit(bar){ try{ const r=bar.getBoundingClientRect(), f=bar.firstElementChild.getBoundingClientRect(); bar.style.setProperty("--xpe",Math.max(3,Math.min(100,(f.right-r.left)/r.width*100)).toFixed(1)+"%"); }catch(e){} bar.classList.remove("xphit"); void bar.offsetWidth; bar.classList.add("xphit"); clearTimeout(bar._xh); bar._xh=setTimeout(()=>bar.classList.remove("xphit"),380); }
  function burst(x,y,z,n){ try{ if(document.hidden||typeof camera==="undefined") return; const T=target(); if(!T) return; V.set(x,y+hAt(x,z),z).project(camera); if(V.z>1) return;
      const sx=(V.x+1)/2*innerWidth, sy=(1-V.y)/2*innerHeight; if(sx<-40||sx>innerWidth+40||sy<-40||sy>innerHeight+40) return;
      n=Math.min(n||3,(typeof ECO==="function"&&ECO())?2:9,16-live); for(let i=0;i<n;i++) one(sx,sy,T,i,n); }catch(e){} }
  function one(sx,sy,T,i,n){ const c=document.createElement("div"); c.className="xpfly"+(i%3===2?" v":""); document.body.appendChild(c); live++;
    const a=Math.PI*2*i/n+Math.random()*.6, r=22+Math.random()*20;
    const p1x=sx+Math.cos(a)*r, p1y=sy-20+Math.sin(a)*r*.6-Math.random()*16;          // 피어오름
    const p2x=sx+Math.cos(a+1.9)*r*1.15, p2y=sy-34+Math.sin(a+1.9)*r*.5;               // 한 바퀴 맴돌기
    const mx=(p2x+T.x)/2+(Math.random()-.5)*80, my=Math.min(p2y,T.y)+(sy>T.y?-10:30)-Math.random()*30; // 휘어 날아감
    const dur=900+i*60, delay=120+i*70; let anim=null;
    if(c.animate){ anim=c.animate([
        {transform:`translate(${sx}px,${sy}px) scale(.2)`,opacity:0},
        {transform:`translate(${p1x}px,${p1y}px) scale(1.25)`,opacity:1,offset:.24,easing:"ease-out"},
        {transform:`translate(${p2x}px,${p2y}px) scale(1)`,opacity:1,offset:.46,easing:"ease-in-out"},
        {transform:`translate(${mx}px,${my}px) scale(.85)`,opacity:1,offset:.74,easing:"ease-in"},
        {transform:`translate(${T.x}px,${T.y}px) scale(.45)`,opacity:.9}],{duration:dur,delay,fill:"both"}); }
    const done=()=>{ if(!c.parentNode) return; c.remove(); live--; hit(T.bar); try{ if(i===0||i===n-1) tone(1975+i*60,.06,"sine",0,.035); }catch(e){} };
    if(anim) anim.onfinish=done; else { c.style.transform=`translate(${T.x}px,${T.y}px)`; setTimeout(done,dur); }
    setTimeout(()=>{ if(c.parentNode){ c.remove(); live--; } },dur+delay+600); }
  return {burst};
})();
</script>
