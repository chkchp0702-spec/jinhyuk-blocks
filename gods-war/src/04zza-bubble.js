<script>
/* ================= 말풍선 글자 또르르 (v107) =================
   NPC·친구·내 말풍선이 나올 때 톡 튀어나오고, 글자가 하나씩 나옴(뒤 글자는 투명으로 자리만 잡아 풍선 크기가 흔들리지 않음).
   placeLabel 을 감싸서 .bub 가 있는 이름표만 손봄 — 글자 바뀔 때만 DOM 씀. 게임 규칙·함께하기 메시지 그대로. */
(function(){ if(typeof placeLabel!=="function") return; const _pl=placeLabel; const SPD=42;
  const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  placeLabel=function(el,x,y,z,html){ const h0=el._h; _pl(el,x,y,z,html); if(el.style.display==="none") return;
    if(el._h!==h0||el._bk!==el._h){ el._bk=el._h; const b=el.querySelector(".bub"); if(b){ const txt=b.textContent; const now=performance.now(); if(el._bt!==txt){ el._bt=txt; el._b0=now; el._bch=Array.from(txt); } el._bEl=b; el._bn=-1; if(now-el._b0<300) b.classList.add("bnew"); } else { el._bEl=null; el._bt=null; } }
    const b=el._bEl; if(!b) return; const ch=el._bch, n=Math.min(ch.length,Math.floor((performance.now()-el._b0)/SPD)+1); if(n===el._bn) return; el._bn=n;
    b.innerHTML=n>=ch.length?esc(el._bt):esc(ch.slice(0,n).join(""))+'<i class="bc"></i><span class="bh">'+esc(ch.slice(n).join(""))+'</span>'; };
})();
</script>
