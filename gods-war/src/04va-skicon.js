<script>
/* ================= 기술 버튼에 그림 아이콘 (v99) =================
   기술 버튼이 글씨만 있어서 무슨 기술인지 한눈에 안 보였음 → 버튼 가운데 큰 그림(이모지) + 아래 작은 이름.
   기술 이름으로 그림을 고르고(망치 🔨·서리 ❄️·늑대 🐺 …), 모르는 기술은 종류(type)로 고름. 0.5초마다 이름이 바뀌었는지만 봄(칸 바꾸기·세계 바꾸기 따라감).
   글씨(DOM)만 바꾸니 그리기 호출 0. 기술 규칙·쿨타임 그대로. */
const SKICON=(()=>{
  const BYN={"심판의 빛":"☀️","치유의 날개":"🕊️","미카엘의 창":"⚜️","빛의 화살비":"🏹","수호천사의 방패":"🛡️","축복의 빛":"💖","케루빔의 불칼":"🔥","세라핌의 날개":"🌀","최후의 나팔":"📯",
    "천둥의 망치":"🔨","광전사의 포효":"💢","라그나로크":"🌋","서리 숨결":"❄️","발키리의 창":"🗡️","이그드라실의 축복":"🌳","펜리르 소환":"🐺","궁니르":"☄️","요르문간드의 고리":"🐍",
    "수다르샤나 차크라":"☸️","하누만의 도약":"🐒","시바의 춤":"🔱","아그니의 불꽃":"🔥","나가의 올가미":"🐍","락슈미의 축복":"🌸","가네샤의 방패":"🐘","인드라의 바즈라":"⚡","칼리의 분노":"💥",
    "번개 낙하":"⚡","헤르메스의 질주":"👟","포세이돈의 해일":"🌊","아폴론의 화살":"🏹","아이기스":"🛡️","아스클레피오스의 지팡이":"⚕️","메두사의 눈":"👁️","하데스의 손":"✋","제우스의 심판":"🌩️"};
  const BYT={aoe:"💥",bolt:"⚡",dash:"💨",heal:"💚",line:"🗡️",orbit:"🌀",rage:"💢",freeze:"❄️",meteor:"☄️",multi:"🏹",pull:"🌀",shield:"🛡️",summon:"🐾",team:"💖",ult:"🌟"};
  const KW=[["화살","🏹"],["방패","🛡️"],["망치","🔨"],["번개","⚡"],["불","🔥"],["얼음","❄️"],["서리","❄️"],["창","🗡️"],["치유","💚"],["축복","💖"],["파도","🌊"],["해일","🌊"],["뱀","🐍"]];
  function icon(S){ if(!S) return "✨"; if(BYN[S.n]) return BYN[S.n]; for(const k of KW) if(S.n.indexOf(k[0])>=0) return k[1]; return BYT[S.type]||"✨"; }
  const last=[];
  function sync(){ try{ if(typeof G==="undefined"||!G||typeof RM!=="function") return; const R=RM(); if(!R||!R.skills) return;
      for(let i=0;i<6;i++){ const b=document.getElementById("bSkill"+i); if(!b) continue; let si=i; try{ si=skSlot(i); }catch(e){} const S=R.skills[si]; const key=(S&&S.n)||"";
        if(last[i]===key&&b.querySelector(".sic")) continue; last[i]=key; let ic=b.querySelector(".sic"); if(!ic){ ic=document.createElement("i"); ic.className="sic"; const sp=b.querySelector("span"); b.insertBefore(ic,sp||null); b.classList.add("hasic"); }
        ic.textContent=icon(S); } }catch(e){} }
  setInterval(sync,500); return {sync,icon};
})();
</script>
