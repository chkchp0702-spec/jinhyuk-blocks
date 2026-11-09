<script>
/* v92 임무 카드가 조이스틱(방향키)을 덮지 않게: 왼쪽 위 칸(임무 목록·함께 임무·만남 임무)이 조이스틱 쉬는 자리 위에서 멈춤.
   자리가 모자라면 만남 임무 → 함께 임무 → 위쪽 임무 순서로 먼저 보여 주고, 나머지는 「📜 임무 N개 더」 칩 하나로 접음(누르면 임무 창).
   임무가 몇 개로 늘어나도, 폰 화면 높이가 달라도 자동으로 맞춤. 게임 규칙은 그대로. */
const HUDFIT=(()=>{
  const st=document.createElement("style");
  st.textContent=`.hfx{display:none!important}
#qMore{pointer-events:auto;align-self:flex-start;margin-top:2px;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:800;color:#fff3c4;background:rgba(40,26,70,.82);border:1.5px solid rgba(255,210,90,.75);box-shadow:0 2px 0 rgba(0,0,0,.45);text-shadow:0 1px 0 rgba(0,0,0,.65);cursor:pointer;white-space:nowrap}
#qMore[hidden]{display:none}
@media (orientation:landscape) and (max-height:540px){ #meetq,#coop{padding:3px 9px 5px!important;margin-top:3px!important;font-size:11.5px!important;line-height:1.25!important} #meetq b,#coop b{font-size:11px!important} #qMore{padding:2px 9px;font-size:11.5px} }`;
  document.head.appendChild(st);
  const GAP=4, PAD=8;
  let more=null, busy=false, pend=false, joyTop=0;
  function chip(){ if(more&&more.isConnected) return more; more=document.createElement("div"); more.id="qMore"; more.hidden=true;
    more.addEventListener("pointerdown",e=>e.stopPropagation());
    more.onclick=()=>{ try{ if(!layerOpen) showQuests(); }catch(e){} };
    return more; }
  // 조이스틱이 쉬고 있을 때의 맨 윗줄(움직이는 중이면 마지막으로 잰 값)
  function limit(){ const j=document.getElementById("joy");
    if(j&&j.classList.contains("rest")&&getComputedStyle(j).display!=="none"){ const r=j.getBoundingClientRect(); if(r.height>0) joyTop=r.top; }
    if(!joyTop) joyTop=innerHeight-185;
    return joyTop-PAD; }
  function fit(){ pend=false; if(busy) return; busy=true;
    try{
      const q=document.getElementById("quest"); if(!q){ busy=false; return; }
      const coop=document.getElementById("coop"), meet=document.getElementById("meetq");
      const qs=[...q.querySelectorAll(":scope > .q")];
      const all=[...qs,coop,meet].filter(Boolean);
      all.forEach(e=>e.classList.remove("hfx"));
      const m=chip(); const host=(meet&&meet.parentNode)||(coop&&coop.parentNode)||q.parentNode;
      if(host&&m.parentNode!==host) host.appendChild(m);
      m.hidden=true;
      if(q.style.visibility==="hidden"||getComputedStyle(q).visibility==="hidden"){ busy=false; return; }
      const vis=e=>e&&!e.hidden&&getComputedStyle(e).display!=="none";
      const items=all.filter(vis);
      if(!items.length){ busy=false; return; }
      const top=Math.min(...items.map(e=>e.getBoundingClientRect().top));
      const avail=limit()-top;
      const h=new Map(items.map(e=>[e,e.getBoundingClientRect().height+GAP]));
      const lim=limit(); if(Math.max(...items.map(e=>e.getBoundingClientRect().bottom))<=lim){ busy=false; return; }
      // 자리가 모자람 → 만남 임무·함께 임무 먼저, 그다음 위쪽 임무부터
      m.hidden=false; m.textContent="📜 임무 9개 더"; const chipH=m.getBoundingClientRect().height+GAP+3;
      let left=avail-chipH; const keep=[];
      const order=[meet,coop,...qs].filter(e=>items.includes(e));
      for(const e of order){ const eh=h.get(e); if(eh<=left){ keep.push(e); left-=eh; } }
      const apply=()=>{ let hid=0; items.forEach(e=>{ const k=keep.includes(e); e.classList.toggle("hfx",!k); if(!k) hid++; }); m.textContent=`📜 임무 ${hid}개 더`; };
      apply();
      // 실제로 재 보고, 칩이 조이스틱에 닿으면 가장 덜 중요한 카드부터 하나씩 더 접음
      let guard=12; while(guard-->0&&keep.length&&m.getBoundingClientRect().bottom>lim){ keep.pop(); apply(); }
      if(m.getBoundingClientRect().bottom>lim) m.hidden=true;
    }catch(e){ console.warn(e); }
    busy=false; }
  function sched(){ if(pend) return; pend=true; requestAnimationFrame(fit); }
  const mo=new MutationObserver(rs=>{ if(rs.some(r=>!(more&&(r.target===more||more.contains(r.target))))) sched(); });
  function watch(){ const q=document.getElementById("quest"); const host=q&&q.parentNode;
    if(host) mo.observe(host,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["hidden"]}); }
  watch();
  addEventListener("resize",()=>{ joyTop=0; setTimeout(sched,120); });
  addEventListener("orientationchange",()=>{ joyTop=0; setTimeout(sched,300); });
  setInterval(sched,1000); // 혹시 놓친 변화(글자 크기 등)도 1초마다 맞춤
  sched();
  return {fit,sched};
})();
</script>
