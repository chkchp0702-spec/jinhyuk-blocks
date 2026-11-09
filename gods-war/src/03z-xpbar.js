<script>
/* v96 경험치 바 — 빛 알갱이가 흐르고, 오를 때 반짝·꽉 차기 직전 금빛 두근, 레벨업 땐 하얗게 번쩍. 모습만(경험치 계산 그대로) */
const XPBAR={p:-1,lv:-1,t:0};
(function(){ function sp(bar,pct,n){ const host=bar.parentNode; if(!host||host.querySelectorAll(".xpsp").length>6) return; const br=bar.getBoundingClientRect(), hr=host.getBoundingClientRect(); for(let i=0;i<n;i++){ const s=document.createElement("i"); s.className="xpsp"; s.style.left=(br.left-hr.left+br.width*pct/100-2+Math.random()*4)+"px"; s.style.top=(br.top-hr.top+br.height/2-2)+"px"; s.style.setProperty("--dx",(Math.random()*16-8).toFixed(1)+"px"); s.style.setProperty("--dy",(-8-Math.random()*12).toFixed(1)+"px"); s.style.animationDelay=(i*.07)+"s"; host.appendChild(s); setTimeout(()=>s.remove(),900); } }
  function kick(el,c,ms){ el.classList.remove(c); void el.offsetWidth; el.classList.add(c); clearTimeout(el["_"+c]); el["_"+c]=setTimeout(()=>el.classList.remove(c),ms); }
  setInterval(()=>{ try{ if(typeof started==="undefined"||!started||typeof G==="undefined"||!G||!$("xpBar")) return; const bar=$("xpBar").parentNode; const need=xpNeed(G.lv)||1; const pct=clamp(G.xp/need*100,0,100);
    if(XPBAR.lv>=0&&G.lv>XPBAR.lv){ kick(bar,"lvup",900); if(!ECO()) sp(bar,100,5); }
    else if(XPBAR.p>=0&&pct>XPBAR.p+.05){ kick(bar,"gain",520); if(!ECO()&&!document.hidden) sp(bar,pct,pct-XPBAR.p>4?3:1); }
    bar.classList.toggle("near",pct>=85&&G.lv<(typeof LVMAX!=="undefined"?LVMAX:1e9)); XPBAR.p=pct; XPBAR.lv=G.lv; }catch(e){} },220); })();
</script>
