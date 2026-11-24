<script>
/* ================= v176: 장소·NPC 이름표 앞 그림 아이콘을 금빛 동그라미 메달로 + 둥실 흔들림 + 가까이 가면 커짐 =================
   「🏛️ 세계의 경이」「⚔️ 발할라 결투장」「🗿 신탁」처럼 그림 글자로 시작하는 이름표는 그 그림을 금테 두른 동그란 메달 안에 넣고,
   메달이 천천히 위아래로 둥실 + 살짝 갸웃 흔들림. 가까이(12m 안) 가면 메달이 커지고 빛이 밝아져 "여기 들어갈 수 있어" 느낌.
   「❗」로 시작하는 이야기 전령 같은 이름표는 빨간 메달에 흰 느낌표(할 일 있음 표시).
   placeLabel 감싸기 — 글이 바뀔 때만 한 번 고쳐 씀. 움직임은 3D 프레임(XTICK)에서 보이는 메달만(보통 1~4개), 절약 모드는 3장에 1번.
   CSS 무한 애니메이션 없음, 그리기 호출 0. 모습만. */
const LBLIC=(()=>{
  const RX=/^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍(?:\p{Extended_Pictographic})|\p{Emoji_Modifier}|\p{Regional_Indicator})*)️?\s*/u;
  const L=new Set(); let fr=0;
  const _pl=placeLabel;
  placeLabel=function(el,x,y,z,html){
    if(html!==undefined&&typeof html==="string"&&el._icSrc!==html){ el._icSrc=html; const m=RX.exec(html);
      if(m&&!el.classList.contains("dmg")){ const q=/^[\u2757\u2755\u203C\u2049]/.test(m[1]); el._icOut=(q?`<i class="lic lq"><u>!</u></i>`:`<i class="lic"><u>${m[1]}</u></i>`)+html.slice(m[0].length); el._ic=1; L.add(el); }
      else { el._icOut=html; if(el._ic){ el._ic=0; L.delete(el); el._icEl=null; } } }
    if(html!==undefined&&el._ic) html=el._icOut;
    _pl(el,x,y,z,html);
    if(el._ic){ el._icd=Math.hypot(x-P.x,z-P.z); if(!el._icEl||!el._icEl.isConnected){ el._icEl=el.querySelector(".lic"); el._icK=-1; el._icPh=Math.random()*6.28; } }
  };
  function tick(dt){ if(!L.size) return; fr++; if(ECO()&&fr%3) return; const tn=performance.now()/1000;
    for(const el of L){ if(!el.isConnected){ L.delete(el); continue; } const ic=el._icEl; if(!ic||el.style.display==="none") continue;
      const d=el._icd==null?99:el._icd, near=Math.max(0,Math.min(1,(16-d)/10));   // 16m→6m 사이 서서히 커짐
      el._icN=(el._icN==null?near:el._icN+(near-el._icN)*Math.min(1,dt*(ECO()?18:6)));
      const n=el._icN, ph=el._icPh||0, s=1+n*.38;
      const by=Math.sin(tn*2.1+ph)*(2+n*1.5), rot=Math.sin(tn*1.3+ph*1.7)*(5+n*3);
      ic.style.transform=`translateY(${by.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${s.toFixed(3)})`;
      const k=n>.5?1:0; if(k!==el._icK){ el._icK=k; ic.classList.toggle("near",!!k); } } }
  XTICK.push(tick);
  return {get n(){ return L.size; }};
})();
</script>
<style>
.lbl .lic{display:inline-block;position:relative;width:27px;height:27px;margin:0 6px 0 0;vertical-align:-7px;border-radius:50%;transform-origin:50% 85%;
  background:radial-gradient(circle at 34% 28%,#fffbe8 0%,#ffe08a 30%,#e9a52a 68%,#9a5a0c 100%);
  box-shadow:0 0 0 2px #3a2008,inset 0 -2px 3px rgba(90,40,0,.55),inset 0 2px 2px rgba(255,255,255,.8),0 3px 4px rgba(0,0,0,.45);transition:box-shadow .3s}
.lbl .lic u{position:absolute;left:0;top:0;width:100%;height:100%;line-height:27px;text-align:center;font-size:16px;text-decoration:none;font-style:normal;text-shadow:0 1px 1px rgba(60,30,0,.5)}
.lbl .lic.lq{background:radial-gradient(circle at 34% 28%,#ffe4e0 0%,#ff6a5a 32%,#d41e2a 70%,#7a0614 100%)}
.lbl .lic.lq u{color:#fff;font-weight:900;font-size:18px;text-shadow:0 1px 0 #7a0614,0 0 4px rgba(255,255,255,.6)}
.lbl .lic.near{box-shadow:0 0 0 2px #3a2008,0 0 0 4px rgba(255,214,110,.75),inset 0 -2px 3px rgba(90,40,0,.55),inset 0 2px 2px rgba(255,255,255,.8),0 3px 4px rgba(0,0,0,.45),0 0 14px 4px rgba(255,200,80,.55)}
@media (orientation:landscape) and (max-height:430px){ .lbl .lic{width:23px;height:23px;vertical-align:-6px;margin-right:5px} .lbl .lic u{line-height:23px;font-size:14px} .lbl .lic.lq u{font-size:16px} }
</style>
