<script>
/* ================= 상점에서 산 물건이 가방으로 휘익 (v128) =================
   상점에서 「사기」를 누르면 → 그 줄의 물건 아이콘이 빛나는 동그라미에 담겨 톡 튀어 올랐다가
   빙글 돌며 왼쪽 아래 「가방」 버튼으로(물약은 「물약」 버튼, 두루마리는 내 정보 칸으로) 날아가 쏙.
   사기 버튼 자리엔 빨간 「−금화」 글씨가 떠오르고 금화 알갱이가 톡톡 흩어짐, 도착하면 버튼이 톡 튀며 「+1」.
   사는 규칙·값·저장은 그대로 — 누르기 전·후 금화를 비교해 진짜 샀을 때만 보여 줌. 뽑기 상자는 원래 연출(LOOT) 그대로.
   화면 위 작은 DOM 이라 그리기 호출 0, 한 번에 최대 6개. */
const SHOPFLY=(()=>{ let live=0;
  function tgt(id){ const el=document.getElementById(id); if(!el) return null; const r=el.getBoundingClientRect(); if(!r.width||r.bottom<0||r.top>innerHeight) return null; return {x:r.left+r.width/2,y:r.top+r.height/2,el}; }
  function bump(el,col,txt){ el.style.setProperty("--pkc",col); el.classList.remove("pkbump"); void el.offsetWidth; el.classList.add("pkbump");
    const p=document.createElement("div"); p.className="pkplus"; p.textContent=txt||"+1"; p.style.color=col; const r=el.getBoundingClientRect(); p.style.left=(r.left+r.width*.6)+"px"; p.style.top=(r.top-4)+"px"; document.body.appendChild(p); setTimeout(()=>p.remove(),900); }
  function cost(x,y,c){ const d=document.createElement("div"); d.className="sfcost"; d.textContent="−"+(typeof fmt==="function"?fmt(c):c); d.style.left=x+"px"; d.style.top=y+"px"; document.body.appendChild(d); setTimeout(()=>d.remove(),1000);
    for(let k=0;k<6;k++){ const s=document.createElement("i"); s.className="sfcoin"; const a=-Math.PI*(.15+.7*k/5), r=26+Math.random()*16; s.style.left=x+"px"; s.style.top=y+"px"; s.style.setProperty("--dx",(Math.cos(a)*r).toFixed(0)+"px"); s.style.setProperty("--dy",(Math.sin(a)*r).toFixed(0)+"px"); document.body.appendChild(s); setTimeout(()=>s.remove(),700); } }
  function fly(sx,sy,ic,col,T,i,txt){ if(live>=6||!T) return; const d=document.createElement("div"); d.className="pkfly sfly"; d.style.setProperty("--pkc",col); d.textContent=ic; document.body.appendChild(d); live++;
    const px=sx+[0,-24,24][i%3], py=sy-40-Math.random()*12, mx=(px+T.x)/2+(T.x<px?-30:30), my=Math.min(py,T.y)-50-Math.random()*25, dur=900, del=i*120; let an=null;
    if(d.animate) an=d.animate([
      {transform:`translate(${sx}px,${sy}px) scale(.5) rotate(0deg)`,opacity:.2},
      {transform:`translate(${px}px,${py}px) scale(1.45) rotate(-14deg)`,opacity:1,offset:.26,easing:"ease-out"},
      {transform:`translate(${px}px,${py+4}px) scale(1.2) rotate(8deg)`,opacity:1,offset:.42,easing:"ease-in"},
      {transform:`translate(${mx}px,${my}px) scale(1) rotate(200deg)`,opacity:1,offset:.72,easing:"ease-in"},
      {transform:`translate(${T.x}px,${T.y}px) scale(.35) rotate(360deg)`,opacity:.9}],{duration:dur,delay:del,fill:"both"});
    let fin=false; const done=()=>{ if(fin) return; fin=true; d.remove(); live--; if(i===0){ bump(T.el,col,txt); try{ tone(880,.05,"triangle",0,.05); tone(1320,.09,"sine",.04,.04); }catch(e){} } };
    if(an) an.onfinish=done; setTimeout(done,dur+del+120); }
  const COL={eq:["#ffd24a","#ff9a3c","#c084fc","#ffe066"],pot:"#58e08a",bf:"#7fd8ff",mat:"#ffb84a"};
  document.addEventListener("click",e=>{ try{ const b=e.target&&e.target.closest&&e.target.closest("#layers .buy"); if(!b||b.disabled||b.id==="sbGacha"||typeof G==="undefined") return;
      const row=b.closest(".row"); const ic=row&&row.querySelector(".ic"); const R=(ic||b).getBoundingClientRect(), BR=b.getBoundingClientRect();
      const g0=G.gold, p0=G.pots, ds=b.dataset; let icon=(ic?ic.textContent.trim():"✨")||"✨";
      setTimeout(()=>{ try{ if(!(G.gold<g0)) return;   // 진짜 샀을 때만
        const sx=R.left+R.width/2, sy=R.top+R.height/2; cost(BR.left+BR.width/2,BR.top+4,g0-G.gold);
        let T=null, col=COL.mat, n=1, txt="+1";
        if(ds.sb){ T=tgt("bBag"); col=COL.eq[Math.min(3,+ds.t||0)]; }
        else if(ds.pot||G.pots>p0){ T=tgt("bPot")||tgt("bBag"); col=COL.pot; n=Math.min(3,G.pots-p0||1); txt="+"+(G.pots-p0||1); icon="🧪"; }
        else if(ds.bf){ T=tgt("portrait")||tgt("buffs")||tgt("bBag"); col=(typeof BUFFS!=="undefined"&&BUFFS[ds.bf]&&BUFFS[ds.bf].c)||COL.bf; txt="ON"; }
        else { T=tgt("bBag"); }
        for(let k=0;k<n;k++) fly(sx,sy,icon,col,T,k,txt); }catch(err){} },0); }catch(err){} },true);
  return {fly};
})();
</script>
