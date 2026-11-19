<script>
/* ================= v154 그래픽: 획득 알림 줄(상업 MMO 식 루팅 피드) =================
   금화·아이템·물약을 얻으면 화면 오른쪽(기술 버튼 왼쪽)에 작은 알림 줄이 오른쪽에서 스르륵 들어와 쌓였다가 2.6초 뒤 사라짐.
   - 금화: 금빛 동전 아이콘 + "+35 금화". 1.4초 안에 또 얻으면 새 줄 대신 숫자가 늘며 톡 튐(줄이 마구 쌓이지 않게).
   - 아이템: 등급 색 테두리·빛 + 무기/갑옷/장신구 아이콘 + 이름(희귀 이상은 반짝 띠).
   - 물약: 초록 물약 + "물약 +1".
   보기만 — 금화·가방·물약 숫자를 매 장 비교만 함(얻는 규칙·저장 그대로). 줄은 최대 4개, CSS 애니메이션은 한 번만 돎(무한 아님). */
const LOOTFEED=(()=>{ let box=null, last=null, gRow=null, gAmt=0, gT=0;
  const css=`#lootfeed{position:fixed;right:calc(max(12px,env(safe-area-inset-right)) + 214px);bottom:calc(max(12px,env(safe-area-inset-bottom)) + 96px);z-index:6;display:flex;flex-direction:column-reverse;align-items:flex-end;gap:4px;pointer-events:none;width:190px}
#lootfeed .lf{display:flex;align-items:center;gap:6px;max-width:190px;padding:3px 10px 3px 4px;border-radius:14px 4px 4px 14px;background:linear-gradient(90deg,rgba(20,12,40,.15),rgba(20,12,40,.78) 30%,rgba(20,12,40,.86));border-right:3px solid var(--c,#ffd24a);color:#fff;font-size:12.5px;font-weight:700;white-space:nowrap;text-shadow:0 1px 2px #000;box-shadow:0 2px 6px rgba(0,0,0,.25);animation:lfIn .28s cubic-bezier(.2,1.4,.4,1) both;transition:opacity .35s,transform .35s;position:relative;overflow:hidden}
#lootfeed .lf.out{opacity:0;transform:translateX(24px)}
#lootfeed .lf b{color:var(--c,#ffd24a);font-weight:800;overflow:hidden;text-overflow:ellipsis}
#lootfeed .lf i{flex:0 0 auto;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:14px;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.35),rgba(0,0,0,.25));box-shadow:inset 0 0 0 2px var(--c,#ffd24a),0 0 8px var(--c,#ffd24a)}
#lootfeed .lf i.coin{background:radial-gradient(circle at 35% 30%,#fff6c0,#ffd24a 45%,#c9861a);box-shadow:inset 0 0 0 2px #fff2a0,0 0 6px #ffcf4a;color:#8a5200;font-size:11px;font-weight:900}
#lootfeed .lf.pop{animation:lfPop .22s ease-out}
#lootfeed .lf.rare::after{content:"";position:absolute;top:0;bottom:0;width:30px;left:-40px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);animation:lfShine .9s .25s ease-out 1 both}
@keyframes lfIn{from{opacity:0;transform:translateX(40px) scale(.9)}to{opacity:1;transform:none}}
@keyframes lfPop{0%{transform:scale(1)}40%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes lfShine{from{left:-40px}to{left:110%}}
@media (orientation:portrait){#lootfeed{right:12px;bottom:calc(max(12px,env(safe-area-inset-bottom)) + 330px);width:170px}}`;
  function ensure(){ if(box) return box; const st=document.createElement("style"); st.textContent=css; document.head.appendChild(st); box=document.createElement("div"); box.id="lootfeed"; document.body.appendChild(box); return box; }
  function kill(r){ if(!r||r._k) return; r._k=1; r.classList.add("out"); setTimeout(()=>r.remove(),380); if(r===gRow) gRow=null; }
  function row(icon,cls,text,col,rare){ const b=ensure(); const r=document.createElement("div"); r.className="lf"+(rare?" rare":""); r.style.setProperty("--c",col);
    r.innerHTML=`<i class="${cls}">${icon}</i><span>${text}</span>`; b.appendChild(r);
    const live=[...b.children].filter(x=>!x._k); if(live.length>4) kill(live[0]);
    r._t=setTimeout(()=>kill(r),rare?3600:2600); return r; }
  const fmtN=n=>typeof fmt==="function"?fmt(n):String(n);
  const SLOT={w:"⚔️",a:"🛡️",r:"💍"};
  function gold(n){ const now=performance.now();
    if(gRow&&!gRow._k&&now-gT<1400){ gAmt+=n; gRow.querySelector("span").innerHTML=`<b>+${fmtN(gAmt)}</b> 금화`; clearTimeout(gRow._t); gRow._t=setTimeout(()=>kill(gRow),2600); gRow.classList.remove("pop"); void gRow.offsetWidth; gRow.classList.add("pop"); }
    else { gAmt=n; gRow=row("G","coin",`<b>+${fmtN(n)}</b> 금화`,"#ffd24a",false); }
    gT=now; }
  function item(it){ if(!it||it.t==null) return; const t=Math.max(0,Math.min(3,it.t|0)); let nm=""; try{ nm=itemName(it.s,t); }catch(e){} const col=RAR[t]?RAR[t].c:"#fff";
    row(SLOT[it.s]||"🎁","",`<b>${nm||"아이템"}</b>`,col,t>=1); }
  function pot(n){ row("🧪","",`물약 <b>+${n}</b>`,"#5dff8a",false); }
  function tick(){ if(typeof started==="undefined"||!started||typeof G==="undefined") { last=null; return; }
    const cur={g:G.gold|0,b:G.bag?G.bag.length:0,p:G.pots|0};
    if(!last||typeof layerOpen!=="undefined"&&layerOpen){ last=cur; return; }   // 처음·창 열림(상점 사고팔기)은 비교만 새로
    if(cur.g>last.g) gold(cur.g-last.g);
    if(cur.b>last.b&&cur.b-last.b<=3){ for(let i=last.b;i<cur.b;i++) item(G.bag[i]); }
    if(cur.p>last.p&&cur.p-last.p<=5) pot(cur.p-last.p);
    last=cur; }
  XTICK.push(()=>{ try{ tick(); }catch(e){} });
  return {gold,item,pot,tick};
})();
</script>
