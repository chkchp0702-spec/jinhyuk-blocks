<script>
/* ================= 주운 물건이 가방으로 쏙 (v70) =================
   길에서 ✨를 줍거나 보물 상자를 열면 → 그 자리에서 물건 아이콘(빛나는 동그라미 안 🪙🧪🎁…)이 톡 튀어 올라
   빙글 돌며 왼쪽 아래 「가방」 버튼으로 휘익 빨려 들어감. 들어가면 가방 버튼이 톡 튀고 물건 색으로 반짝, 작은 "+1" 이 뜸.
   금화 주머니는 금화 칸(v65 COINFLY)으로. 함정(미믹·독버섯)은 날아가지 않음.
   화면 위 작은 DOM 이라 그리기 호출 0. 한 번에 최대 6개. 줍는 규칙·양은 그대로. */
const PICKFLY=(()=>{ let live=0; const V=new THREE.Vector3();
  const hex=c=>"#"+(c>>>0).toString(16).padStart(6,"0").slice(-6);
  function bag(){ const el=document.getElementById("bBag"); if(!el) return null; const r=el.getBoundingClientRect(); if(!r.width||r.bottom<0||r.top>innerHeight) return null; return {x:r.left+r.width/2,y:r.top+r.height/2,el}; }
  function bump(el,col){ el.style.setProperty("--pkc",col); el.classList.remove("pkbump"); void el.offsetWidth; el.classList.add("pkbump");
    const p=document.createElement("div"); p.className="pkplus"; p.textContent="+1"; p.style.color=col; const r=el.getBoundingClientRect(); p.style.left=(r.left+r.width*.72)+"px"; p.style.top=(r.top-4)+"px"; document.body.appendChild(p); setTimeout(()=>p.remove(),900); }
  function scr(x,y,z){ if(typeof camera==="undefined") return null; V.set(x,y+(typeof hAt==="function"?hAt(x,z):0),z).project(camera); if(V.z>1) return null;
    const sx=(V.x+1)/2*innerWidth, sy=(1-V.y)/2*innerHeight; if(sx<-40||sx>innerWidth+40||sy<-40||sy>innerHeight+40) return null; return {sx,sy}; }
  /* fly(월드 x,y,z, 아이콘, 색(숫자), 몇 번째(여러 개일 때 0,1,2…)) */
  function fly(x,y,z,ic,col,i){ try{ if(document.hidden||live>=6) return; i=i||0; const T=bag(); if(!T) return; const S=scr(x,y,z); if(!S) return;
      const c=hex(col==null?0xffd24a:col); const d=document.createElement("div"); d.className="pkfly"; d.style.setProperty("--pkc",c); d.textContent=ic||"✨"; document.body.appendChild(d); live++;
      const {sx,sy}=S, a=-Math.PI/2+(i%3-1)*.6, px=sx+Math.cos(a)*30, py=sy-46-Math.random()*16;
      const mx=(px+T.x)/2+40+(Math.random()-.5)*50, my=Math.min(py,T.y)-40-Math.random()*30, dur=950, del=i*110; let an=null;
      if(d.animate){ an=d.animate([
          {transform:`translate(${sx}px,${sy}px) scale(.2) rotate(0deg)`,opacity:0},
          {transform:`translate(${px}px,${py}px) scale(1.35) rotate(-12deg)`,opacity:1,offset:.24,easing:"ease-out"},
          {transform:`translate(${px}px,${py+4}px) scale(1.15) rotate(8deg)`,opacity:1,offset:.42,easing:"ease-in"},
          {transform:`translate(${mx}px,${my}px) scale(.95) rotate(200deg)`,opacity:1,offset:.72,easing:"ease-in"},
          {transform:`translate(${T.x}px,${T.y}px) scale(.35) rotate(360deg)`,opacity:.9}],{duration:dur,delay:del,fill:"both"}); }
      const done=()=>{ if(!d.parentNode) return; d.remove(); live--; bump(T.el,c); try{ tone(880+i*60,.05,"triangle",0,.05); tone(1320+i*60,.09,"sine",.04,.04); }catch(e){} };
      if(an) an.onfinish=done; else setTimeout(done,dur+del);
      setTimeout(()=>{ if(d.parentNode){ d.remove(); live--; } },dur+del+700); }catch(e){} }
  /* pick(T, x,z): 길에서 줍기 한 개 */
  function pick(T,x,z){ if(!T||T.trap) return; if(T.k==="gold"&&typeof COINFLY!=="undefined"){ COINFLY.burst(x,1,z,5); return; } fly(x,1,z,T.ic,T.c,0); }
  return {fly,pick};
})();
</script>
