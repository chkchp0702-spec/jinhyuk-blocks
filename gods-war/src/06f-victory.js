<script>
/* ================= v147: 보스 토벌 성공 — 금빛 승리 배너 + 별 폭죽 =================
   보스를 쓰러뜨리면 원래 가운데 띠(「○○ 처치!」 토스트) 대신, 마무리 느린 화면(06e)이 끝날 무렵
   화면 위쪽에 「✦ 토벌 성공! ✦」 금빛 큰 글씨가 쾅 내려앉고 별 조각이 사방으로 튐 · 빛줄기가 한 번 쓱.
   아래에 보상 줄(경험치·금화)은 그대로 보여 줌. 모습만 — 보상·규칙 그대로. CSS 한 번짜리(무한 애니메이션 없음), 그리기 호출 0. */
const VICT=(()=>{ let cur=null, tm=0;
  function el(){ let c=document.getElementById("vict"); if(c) return c;
    c=document.createElement("div"); c.id="vict"; document.body.appendChild(c); return c; }
  function show(name,sub){ const c=el(); const N=ECO()?8:14; let st="";
    for(let i=0;i<N;i++){ const a=(i/N)*6.2832+Math.random()*.3, R=90+Math.random()*90; const x=Math.cos(a)*R*1.6, y=Math.sin(a)*R*.55;
      st+=`<b class="vk" style="--x:${x|0}px;--y:${y|0}px;--s:${(.8+Math.random()*1.1).toFixed(2)};--d:${(.08+Math.random()*.18).toFixed(2)}s"></b>`; }
    const esc=t=>String(t).replace(/[<>&]/g,"");
    c.innerHTML=`<div class="vp"><span class="vsh"></span><span class="vn">${esc(name)} 쓰러뜨림</span><span class="vt"><i>✦</i>토벌 성공!<i>✦</i></span>${sub?`<span class="vs">${sub}</span>`:""}</div>${st}`;
    try{ toastT=0; $("toast").style.opacity=0; }catch(e){} c.classList.remove("on"); void c.offsetWidth; c.classList.add("on");
    clearTimeout(tm); tm=setTimeout(()=>c.classList.remove("on"),3000);
    try{ tone(1568,.18,"sine",.05,.035); tone(2093,.22,"sine",.16,.03); }catch(e){} }
  const _km=killMob;
  killMob=function(m){ cur=(m&&m.boss&&!m.titan&&!m.trialOf)?m:null; try{ return _km.apply(this,arguments); } finally{ cur=null; } };
  const _toast=toast;
  toast=function(msg,sub,dur){ if(cur&&msg===`${cur.n} 처치!`){ const n=cur.n; try{ setTimeout(()=>show(n,sub),ECO()?120:380); return; }catch(e){} } return _toast.apply(this,arguments); };
  return {show};
})();
</script>
