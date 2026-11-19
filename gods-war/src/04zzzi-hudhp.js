<script>
/* ================= v157 그래픽: 내 체력바 잔상·흔들림(상업 모바일 RPG 식) =================
   - 맞으면 깎인 만큼이 하얀 크림색 잔상으로 0.45초 남았다가 스르륵 줄어듦(얼마나 아팠는지 눈에 보임).
   - 한 번에 최대 체력의 8% 넘게 깎이면 체력 칸(#status)이 덜덜 흔들리고 깎인 조각이 하얗게 번쩍, 숫자도 톡 튐.
   - 회복하면 초록 빛이 체력바를 쓱 훑고 지나감.
   보기만 — P.hp 를 매 장 읽기만 함(전투 규칙·저장 그대로). CSS 애니메이션은 한 번만 돎(무한 아님). DOM 은 처음 한 번만 만듦. */
const HUDHP=(()=>{ let bar=null, tr=null, st=null, txt=null, last=-1, gh=1, hold=0, mh=1, mhT=0, hl=0;
  const css=`#status .bar.hp{overflow:hidden;background:linear-gradient(180deg,#14081e,#2a1230)}
#status .bar.hp #hpBar{position:relative;z-index:1}
#status .bar.hp span{z-index:2}
#status .bar.hp s.hptr{position:absolute;left:0;top:0;bottom:0;width:100%;display:block;text-decoration:none;border-radius:6px;background:linear-gradient(180deg,#ffffff,#fff1c4 50%,#ffd27a);box-shadow:inset 0 0 0 1px rgba(255,255,255,.6);z-index:0}
#status .bar.hp s.hptr.flash{animation:hptrFl .32s ease-out 1}
#status .bar.hp b.hpheal{position:absolute;top:0;bottom:0;width:36px;left:-40px;z-index:2;background:linear-gradient(90deg,transparent,rgba(170,255,190,.9),transparent);transform:skewX(-20deg);pointer-events:none;opacity:0}
#status .bar.hp b.hpheal.go{animation:hpHeal .55s ease-out 1}
#status.hpshk{animation:hpShk .36s cubic-bezier(.36,.07,.19,.97) 1}
#status.hpshk .bar.hp{box-shadow:0 0 0 1px #ff5040,0 0 10px 2px rgba(255,60,40,.75)}
#hpTxt.pop{animation:hpTxtPop .3s ease-out 1}
@keyframes hptrFl{0%{filter:brightness(2.4) saturate(.2)}100%{filter:none}}
@keyframes hpHeal{0%{left:-40px;opacity:1}100%{left:105%;opacity:.9}}
@keyframes hpShk{0%,100%{transform:translate(0,0)}15%{transform:translate(-4px,1px) rotate(-.6deg)}30%{transform:translate(4px,-1px) rotate(.5deg)}45%{transform:translate(-3px,0)}60%{transform:translate(3px,1px)}80%{transform:translate(-1px,0)}}
@keyframes hpTxtPop{0%{transform:scale(1)}35%{transform:scale(1.3);color:#ffd0c0}100%{transform:scale(1)}}`;
  function ensure(){ if(bar) return true; const hb=document.getElementById("hpBar"); if(!hb) return false; bar=hb.parentNode; st=document.getElementById("status"); txt=document.getElementById("hpTxt");
    const s=document.createElement("style"); s.textContent=css; document.head.appendChild(s);
    tr=document.createElement("s"); tr.className="hptr"; bar.insertBefore(tr,hb);
    hl=document.createElement("b"); hl.className="hpheal"; bar.appendChild(hl); return true; }
  function re(el,c){ el.classList.remove(c); void el.offsetWidth; el.classList.add(c); }
  function tick(dt){ if(typeof started==="undefined"||!started||typeof P==="undefined") { last=-1; return; } if(!ensure()) return;
    dt=Math.min(.1,dt||.016);
    mhT-=dt; if(mhT<=0){ mhT=.5; try{ mh=Math.max(1,stat().mhp); }catch(e){} }
    const p=Math.max(0,Math.min(1,P.hp/mh));
    if(last<0){ last=p; gh=p; tr.style.width=(p*100)+"%"; return; }
    if(p<last-1e-4){ const d=last-p; hold=.45; if(d>=.08&&!P.dead){ re(st,"hpshk"); re(tr,"flash"); if(txt) re(txt,"pop"); } }
    else if(p>last+.02){ re(hl,"go"); }
    if(p>=gh) gh=p; else { hold-=dt; if(hold<=0) gh=Math.max(p,gh-dt*(.25+(gh-p)*2.4)); }
    last=p; const w=Math.round(gh*1000)/10+"%"; if(tr._w!==w){ tr._w=w; tr.style.width=w; } }
  XTICK.push(dt=>{ try{ tick(dt); }catch(e){} });
  return {tick};
})();
</script>
