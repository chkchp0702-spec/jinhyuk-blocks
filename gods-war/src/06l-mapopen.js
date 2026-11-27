<script>
/* ================= v190: 지도 창 열 때 두루마리 종이가 펼쳐짐 =================
   세계 지도 창을 열면 지도가 가운데 한 줄에서 위아래로 쫙 펼쳐지고(나무 축 2개가 위·아래로 굴러감, 누런 옛 종이 색 → 원래 색),
   다 펼쳐지면 금빛 빛줄기가 한 번 쓱 지나가고, 위쪽에 "📍 지금 있는 곳" 금빛 이름 띠가 톡 나타남. 종이 펄럭 소리.
   모습만(지도 그림·길 안내·버튼 그대로). CSS 한 번만 도는 애니메이션, 그리기 호출 0. */
(function(){
  const _sm=showMap;
  function hereName(){ try{ let best=null, bd=1e9; REGIONS.forEach(rg=>{ const d=Math.hypot(P.x-rg.x,P.z-rg.z); if(d<(rg.r||20)*1.15&&d<bd){ bd=d; best=rg; } }); return best?best.n:null; }catch(e){ return null; } }
  showMap=function(){ const r=_sm.apply(this,arguments);
    try{ const c=$("bigmap"); if(!c||c.parentNode.classList.contains("mapscroll")) return r;
      const w=document.createElement("div"); w.className="mapscroll"; c.parentNode.insertBefore(w,c); w.appendChild(c);
      const n=hereName(); w.insertAdjacentHTML("beforeend",`<i class="rod t"></i><i class="rod b"></i><div class="shine"></div>${n?`<div class="where">📍 ${n}</div>`:""}`);
      const h=c.clientHeight||c.offsetWidth||300; w.style.setProperty("--mh",Math.round(h/2+3)+"px");
      void w.offsetWidth; w.classList.add("unroll");
      try{ tone(220,.09,"triangle",0,.035); tone(330,.08,"triangle",.07,.03); tone(520,.12,"sine",.2,.025); tone(990,.22,"sine",.62,.02); }catch(e){}
    }catch(e){} return r; };
})();
</script>
