<script>
/* v91 공격 버튼 길게 누르기 손맛(모습만 — 공격 규칙·속도 그대로): 누르고 있으면 버튼 둘레에 기 모으는 금빛 고리가 1.2초 동안 시계 방향으로 차오르고,
   꽉 차면 「기 가득」 불꽃빛으로 두근두근. 손을 떼면 꽉 찼을 때만 빛이 펑 퍼짐. DOM 추가 없음(::before/::after 와 CSS 변수만). */
const ATKCHG=(()=>{
  const b=document.getElementById("bAtk"); if(!b) return {};
  let t0=0, raf=0, full=false;
  const step=()=>{ if(!t0) return; const k=Math.min(1,(performance.now()-t0)/1200); b.style.setProperty("--chg",k.toFixed(3)); if(k>=1&&!full){ full=true; b.classList.add("full"); try{ if(navigator.vibrate&&!ECO()) navigator.vibrate(12); }catch(e){} } raf=requestAnimationFrame(step); };
  b.addEventListener("pointerdown",()=>{ t0=performance.now(); full=false; b.classList.remove("rel","full"); b.classList.add("chg"); b.style.setProperty("--chg","0"); cancelAnimationFrame(raf); raf=requestAnimationFrame(step); });
  const stop=()=>{ if(!t0) return; t0=0; cancelAnimationFrame(raf); b.classList.remove("chg"); if(full){ b.classList.remove("full"); void b.offsetWidth; b.classList.add("rel"); setTimeout(()=>b.classList.remove("rel"),420); } full=false; b.style.setProperty("--chg","0"); };
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,stop));
  return {stop};
})();
</script>
