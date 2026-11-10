<script>
// v100 그래픽: 아래 메뉴 버튼(가방·임무·세계·상점·말하기·≡) 글씨 옆 작은 그림 + 새 소식 빨간 점 반짝 — 모습만
const MENUIC=(function(){
  const IC={bBag:"🎒",bQuest:"📜",bMap:"🗺️",bShop:"🛒",bSay:"💬",bMenu:"⚙️"};
  const TXT={"성전":"🏛️"};
  let last={};
  function tick(){
    try{
      for(const id in IC){ const el=document.getElementById(id); if(!el) continue;
        const ic=TXT[el.textContent.trim()]||IC[id]; if(el.dataset.ic!==ic){ el.dataset.ic=ic; el.classList.add("hasmic"); }
        if(id==="bMenu"&&el.textContent.trim()==="≡") el.classList.add("micOnly"); }
      if(typeof started==="undefined"||!started) return;
      // 새 소식: 받을 임무 보상 / 가방에 더 센 장비
      let q=false,b=false;
      try{ q=(G.quests||[]).some(x=>x.done); }catch(e){}
      try{ const bb=bagBest(); b=["w","a","r"].some(s=>bb[s].t!==G.eq[s]); }catch(e){}
      set("bQuest",q); set("bBag",b);
    }catch(e){}
  }
  function set(id,on){ const el=document.getElementById(id); if(!el) return; if(last[id]===on) return; last[id]=on;
    el.classList.toggle("newdot",on); if(on){ el.classList.remove("ndpop"); void el.offsetWidth; el.classList.add("ndpop"); } }
  setInterval(tick,600); setTimeout(tick,50);
  return {tick};
})();
</script>
