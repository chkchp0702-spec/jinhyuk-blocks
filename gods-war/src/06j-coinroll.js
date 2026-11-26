<script>
/* ================= v188 그래픽: 금화 숫자가 굴러가며 올라감(카운트업) + "+N" 금빛 글씨 =================
   금화가 늘면 화면 위 금화 숫자가 한 번에 바뀌지 않고 0.5~1초 동안 또르르 올라가고, 옆에 "+25" 금빛 글씨가 톡 떠올랐다 사라짐.
   짧은 시간에 여러 번 얻으면 "+N" 이 하나로 합쳐져 커짐. 쓰면(줄면) 바로 바뀌고 숫자가 잠깐 붉게.
   글자만 바뀜(그리기 호출 0). 실제 금화 값·저장은 그대로 — 보이는 숫자만. */
const COINROLL={d:null,from:0,to:0,t:1,dur:.6,gain:0,gt:0,el:null,shown:""};
(function(){
  const C=COINROLL, _hT=hT;
  function show(n){ const s=fmt(n); if(C.shown===s) return; C.shown=s; HUDM.pgold=s; const e=$("pgold"); if(e) e.textContent=s; }
  function plus(n){ const g=$("pgold"); if(!g||!g.parentNode) return;
    C.gain=(C.gt>0?C.gain:0)+n; C.gt=.65;
    let e=C.el; if(!e||!e.isConnected){ e=C.el=document.createElement("i"); e.className="cgain"; g.parentNode.style.position="relative"; g.parentNode.appendChild(e); }
    e.textContent="+"+fmt(C.gain); e.classList.remove("on"); void e.offsetWidth; e.classList.add("on"); e.classList.toggle("big",C.gain>=500); }
  hT=function(id,v){ if(id!=="pgold") return _hT(id,v);
    const g=Math.round(G.gold||0);
    if(C.d===null){ C.d=C.from=C.to=g; C.t=1; return show(g); }
    if(g===C.to) return;
    if(g>C.to){ const add=g-C.to; C.from=C.d; C.to=g; C.t=0; C.dur=Math.min(1.05,.5+Math.log10(1+g-C.from)*.13); try{ plus(add); }catch(e){} }
    else { C.d=C.from=C.to=g; C.t=1; show(g); const e=$("pgold"); if(e){ e.classList.remove("cdown"); void e.offsetWidth; e.classList.add("cdown"); } } };
  COINROLL.tick=function(dt){ if(C.gt>0) C.gt-=dt; if(C.t>=1||C.d===null) return; C.t=Math.min(1,C.t+dt/C.dur); const k=C.t<.5?2*C.t*C.t:1-Math.pow(-2*C.t+2,2)/2;
    C.d=C.t>=1?C.to:Math.floor(C.from+(C.to-C.from)*k); show(C.d); };
})();
{ const _u=update; update=function(dt){ _u(dt); try{ COINROLL.tick(Math.min(dt,.1)); }catch(e){} }; }
</script>
