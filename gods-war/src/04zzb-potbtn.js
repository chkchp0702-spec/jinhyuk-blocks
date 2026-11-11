<script>
// v109 그래픽: 물약 버튼 — 그림 병(출렁이는 물약)·남은 개수 배지·마시면 병 흔들림+거품, 없으면 흐리게, 체력 낮으면 콩닥 — 모습만(물약 규칙 그대로)
const POTBTN=(function(){
  const SVG='<svg class="pbot" viewBox="0 0 40 48" aria-hidden="true"><defs><radialGradient id="pbL" cx="38%" cy="40%" r="70%"><stop offset="0" stop-color="#d6ffe0"/><stop offset=".45" stop-color="#3fe07c"/><stop offset="1" stop-color="#0b6b34"/></radialGradient><clipPath id="pbC"><circle cx="20" cy="30" r="13.2"/></clipPath></defs>'
   +'<rect x="14.5" y="2" width="11" height="6" rx="2" fill="#a86a32" stroke="#4a2a0e" stroke-width="1.4"/>'
   +'<path d="M16 8h8v7.2a15 15 0 1 1-8 0z" fill="rgba(220,250,255,.28)" stroke="#173a2a" stroke-width="2"/>'
   +'<g clip-path="url(#pbC)"><path class="pbwave" d="M0 26 Q5 23.5 10 26 T20 26 T30 26 T40 26 T50 26 V50 H0z" fill="url(#pbL)"/>'
   +'<circle class="pbub b1" cx="15" cy="38" r="1.6" fill="#eafff0"/><circle class="pbub b2" cx="23" cy="40" r="1.2" fill="#eafff0"/><circle class="pbub b3" cx="19" cy="36" r="1" fill="#eafff0"/></g>'
   +'<ellipse cx="13.5" cy="25" rx="3" ry="5.5" fill="rgba(255,255,255,.75)" transform="rotate(25 13.5 25)"/>'
   +'<circle cx="26.5" cy="36" r="1.4" fill="rgba(255,255,255,.55)"/></svg>';
  let el=null, lastN=null, lowT=0, ok=false;
  function setup(){
    el=document.getElementById("bPot"); if(!el||el.classList.contains("hasbot")) return;
    const n=document.getElementById("potN"); if(!n) return;
    el.classList.add("hasbot");
    el.textContent="";
    el.insertAdjacentHTML("beforeend",SVG+'<span class="pnm">물약</span>');
    n.className="pbadge"; el.appendChild(n);
    ok=true; tick();
  }
  function re(c){ if(!el) return; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); }
  function cur(){ let p=0; try{ p=G.pots|0; }catch(e){} try{ if(typeof AR!=="undefined"&&AR.f&&AR.f.state==="fight") p=AR.f.pots|0; }catch(e){} return p; }
  function tick(){
    if(!ok) return;
    const n=cur();
    if(lastN!==null&&n>lastN) re("pgain");
    lastN=n;
    el.classList.toggle("pempty",n<=0);
    el.classList.toggle("pmany",n>=10);
    // 체력 낮고 물약 있으면 1.4초마다 한 번 콩닥(끝나는 애니메이션이라 절약 모드도 OK)
    let low=false; try{ low=started&&!P.dead&&n>0&&P.hp<stat().mhp*.35; }catch(e){}
    if(low){ const t=performance.now(); if(t-lowT>1400){ lowT=t; re("plow"); } }
  }
  function wrap(){
    if(typeof usePotion!=="function") return;
    const _u=usePotion;
    usePotion=function(){ const b=cur(); const r=_u.apply(this,arguments);
      try{ const a=cur(); if(a<b){ re("pdrink"); lastN=a; el.classList.toggle("pempty",a<=0); }
        else if(b<=0&&!layerOpen&&!(P&&P.dead)) re("pnope"); }catch(e){}
      return r; };
  }
  wrap(); setInterval(tick,300); setTimeout(setup,30);
  return {tick,setup};
})();
</script>
