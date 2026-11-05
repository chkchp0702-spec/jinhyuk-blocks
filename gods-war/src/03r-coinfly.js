<script>
/* ================= 금화가 금화 칸으로 날아감 (v65) =================
   괴물을 쓰러뜨리면 그 자리에서 반짝이는 금화 몇 개가 톡 튀어 오른 뒤 → 화면 왼쪽 위 금화 숫자 칸으로 휘익 날아 들어감.
   들어갈 때마다 "띵" 소리, 금화 칸이 톡 커지며 금빛으로 반짝. 보스는 금화 8개.
   그림(3D)이 아니라 화면 위 작은 동그라미(DOM)라 그리기 호출 0. 한 번에 최대 14개, 배터리 절약 모드는 절반. 금화 양·계산은 그대로. */
const COINFLY=(()=>{ let live=0; const V=new THREE.Vector3();
  function target(){ const el=document.getElementById("pgold"); if(!el) return null; const r=el.getBoundingClientRect(); if(!r.width||r.bottom<0) return null; return {x:r.left-9,y:r.top+r.height/2,el}; }
  function pop(el){ const box=el.parentElement||el; box.classList.remove("cpop"); void box.offsetWidth; box.classList.add("cpop"); }
  function burst(x,y,z,n){ try{ if(document.hidden||typeof camera==="undefined") return; const T=target(); if(!T) return; V.set(x,y+hAt(x,z),z).project(camera); if(V.z>1) return;
      const sx=(V.x+1)/2*innerWidth, sy=(1-V.y)/2*innerHeight; if(sx<-40||sx>innerWidth+40||sy<-40||sy>innerHeight+40) return;
      n=Math.min(n||4,(typeof ECO==="function"&&ECO())?3:8, 14-live); for(let i=0;i<n;i++) one(sx,sy,T,i,n); }catch(e){} }
  function one(sx,sy,T,i,n){ const c=document.createElement("div"); c.className="coinfly"; document.body.appendChild(c); live++;
    const a=-Math.PI/2+(i-(n-1)/2)*.55+(Math.random()-.5)*.4, r=34+Math.random()*26; const px=sx+Math.cos(a)*r, py=sy+Math.sin(a)*r;
    const mx=(px+T.x)/2+(Math.random()-.5)*60, my=Math.min(py,T.y)-30-Math.random()*40;
    const dur=780+i*70; let anim=null;
    if(c.animate){ anim=c.animate([
        {transform:`translate(${sx}px,${sy}px) scale(.3) rotateY(0deg)`,opacity:0},
        {transform:`translate(${px}px,${py}px) scale(1.15) rotateY(180deg)`,opacity:1,offset:.22,easing:"ease-out"},
        {transform:`translate(${px}px,${py+6}px) scale(1) rotateY(300deg)`,opacity:1,offset:.36,easing:"ease-in"},
        {transform:`translate(${mx}px,${my}px) scale(.9) rotateY(540deg)`,opacity:1,offset:.68,easing:"ease-in"},
        {transform:`translate(${T.x}px,${T.y}px) scale(.55) rotateY(720deg)`,opacity:.95}],{duration:dur,delay:i*55,fill:"both"}); }
    const done=()=>{ if(!c.parentNode) return; c.remove(); live--; pop(T.el); try{ tone(1568+i*90,.05,"sine",0,.05); tone(2093+i*90,.08,"triangle",.03,.035); }catch(e){} };
    if(anim) anim.onfinish=done; else { c.style.transform=`translate(${T.x}px,${T.y}px)`; setTimeout(done,dur); }
    setTimeout(()=>{ if(c.parentNode){ c.remove(); live--; } },dur+i*55+600); }
  return {burst};
})();
</script>
