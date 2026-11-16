<script>
/* ================= v136 그래픽: 기술 이름 띠 =================
   기술이 실제로 나갔을 때만(쿨타임이 새로 걸렸는지로 판단) 화면 아래쪽 가운데에 세계·기술 색 띠 + 아이콘 + 기술 이름 큰 글씨를 0.85초 보여 줌.
   궁극기는 「궁극기」 딱지·더 큰 글씨·1.2초. 규칙·쿨타임·피해 그대로. DOM 하나를 다시 쓰고 CSS 애니메이션 한 번(무한 아님), 그리기 호출 0. */
const SKNAME=(function(){ let el=null;
  function hex(c){ return "#"+(c>>>0&0xffffff).toString(16).padStart(6,"0"); }
  function mk(){ el=document.createElement("div"); el.id="skname"; el.innerHTML='<span class="sh"></span><i></i><em>궁극기</em><b></b>'; document.body.appendChild(el); }
  function show(S){ try{ if(!S||!S.n) return; if(!el) mk();
      el.querySelector("i").textContent=(S.type==="line"?"🗡️":typeof skIcon==="function"?skIcon(S):"✨");
      el.querySelector("b").textContent=S.n;
      let col=S.color!=null?hex(S.color):"#ffd34a"; if(/^#f{5,6}|^#fffff/i.test(col)){ try{ col=RM().c1||col; }catch(e){} }
      el.style.setProperty("--sc",col);
      el.classList.toggle("ult",S.type==="ult");
      el.classList.remove("on"); void el.offsetWidth; el.classList.add("on");
    }catch(e){} }
  if(typeof useSkill==="function"){ const _us=useSkill; useSkill=function(slot){
      let si=-1, before=0; try{ si=skSlot(slot||0); before=P.sklCd[si]||0; }catch(e){}
      const r=_us.apply(this,arguments);
      try{ if(si>=0&&(P.sklCd[si]||0)>before+.01) show(RM().skills[si]); }catch(e){}
      return r; }; }
  return {show};
})();
</script>
