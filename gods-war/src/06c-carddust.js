<style>
/* v122 창 안에 은은한 금빛 먼지 알갱이가 천천히 떠오름 — 창 열렸을 때만, transform·opacity 만 움직임(화면 다시 칠하기 적음) */
.card>.cdust{position:sticky;top:0;height:0;margin:0 0 -10px;pointer-events:none;z-index:3;flex-shrink:0}
.card>.cdust>b{position:absolute;left:-16px;right:-16px;top:-18px;height:var(--ch,300px);overflow:hidden;border-radius:20px;display:block}
.card>.cdust i{position:absolute;bottom:-8px;width:var(--s,4px);height:var(--s,4px);margin-left:calc(var(--s,4px) / -2);border-radius:50%;opacity:0;
  background:radial-gradient(circle,#fffdf0 0%,#ffe08a 30%,#ffc848 52%,rgba(255,190,60,0) 74%);box-shadow:0 0 10px 3px rgba(255,200,80,.5);
  animation:cdustUp var(--d,7s) linear var(--w,0s) infinite;will-change:transform,opacity}
.card>.cdust i.st{width:calc(var(--s,4px) * 3.2);height:calc(var(--s,4px) * 3.2);margin-left:calc(var(--s,4px) * -1.6);border-radius:0;box-shadow:none;
  background:radial-gradient(circle,#fff 0%,rgba(255,230,150,.9) 14%,rgba(255,210,90,0) 40%),linear-gradient(0deg,transparent 45%,rgba(255,240,180,.95) 50%,transparent 55%),linear-gradient(90deg,transparent 45%,rgba(255,240,180,.95) 50%,transparent 55%)}
@keyframes cdustUp{0%{transform:translate3d(0,0,0) scale(.6);opacity:0}12%{opacity:var(--o,.6)}50%{transform:translate3d(var(--x,10px),calc(var(--dy,-300px) * .5),0) scale(1);opacity:var(--o,.6)}
  80%{opacity:calc(var(--o,.6) * .7)}100%{transform:translate3d(calc(var(--x,10px) * -.4),var(--dy,-300px),0) scale(.5);opacity:0}}
.layer.out .card>.cdust{display:none}
@media (prefers-reduced-motion:reduce){.card>.cdust{display:none}}
</style>
<script>
/* v122 메뉴 창(가방·상점·임무·세계 …)에 금빛 먼지 알갱이가 아래에서 천천히 떠오르며 반짝, 가끔 십자 반짝이.
   창 안에 붙어 다니고(스크롤해도 창 테두리 안에 그대로), 창 닫히면 같이 없어짐. 3D 그리기 호출 0.
   높음 24개·보통 16개·절약 10개(절약 모드는 한 번만 떠오르고 멈춤 — 06b-power.js 규칙). 죽음 화면엔 안 붙임. 모습만. */
const CDUST=(()=>{
  function add(){ try{ const c=layers.querySelector(".layer:not(.out) .card"); if(!c||c.querySelector(".cdust")||document.body.classList.contains("dying")) return;
      const n=ECO()?10:HIGH()?24:16, h=Math.max(160,c.clientHeight+20);
      const w=document.createElement("div"); w.className="cdust"; w.setAttribute("aria-hidden","true");
      let s=`<b style="--ch:${h}px">`;
      for(let i=0;i<n;i++){ const st=i%5===4, d=(5.5+Math.random()*5).toFixed(2), sz=(4.5+Math.random()*5.5).toFixed(1);
        s+=`<i class="${st?"st":""}" style="left:${(4+Math.random()*92).toFixed(1)}%;--s:${sz}px;--d:${d}s;--w:${(-Math.random()*d).toFixed(2)}s;--dy:${-Math.round(h*(.55+Math.random()*.45))}px;--x:${Math.round((Math.random()-.5)*36)}px;--o:${(.55+Math.random()*.4).toFixed(2)}"></i>`; }
      w.innerHTML=s+"</b>"; c.insertBefore(w,c.firstChild); }catch(e){} }
  const _card=card; card=function(){ const r=_card.apply(this,arguments); add(); return r; };
  return {add};
})();
</script>
