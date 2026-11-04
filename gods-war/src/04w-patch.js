<script>
/* ================= v47-3: 🛠 업데이트 소식(패치 노트) =================
   새 버전으로 처음 켜면 한 번, 무엇이 바뀌었는지 쉬운 말로 보여 줌(G.seenVer). 메뉴 → 업데이트 소식에서 다시 볼 수 있음.
   ※ 버전을 올릴 때마다 맨 앞에 한 줄 묶음을 더해요(오래된 것은 8개까지만 남김). */
const PATCH_NOTES=[
 {v:"v47",d:"11/5",t:"👥 친구 위치 · 🤝 함께 임무 · ✨ 기술 9개",items:[
   "접속한 친구가 화면 밖에 있으면 가장자리에 이름·거리가 떠요. 누르면 그 친구에게 가는 길을 계속 알려 줘요.",
   "👥 버튼: 친구가 어디 있는지(장소·방향·거리) 보고, 길 안내나 🌀 곁으로 가기(1분에 한 번)를 할 수 있어요.",
   "🤝 함께 임무: 2명 이상 접속하면 15분마다 새 공동 임무! 다 같이 채우면 보탠 사람 모두 상자를 받아요.",
   "✨ 세계마다 기술이 3개 → 9개! 방패·화살비·함께 회복·얼리기·끌어당기기·정령 부르기·떨어지는 큰 폭발·궁극기.",
   "📖 기술 책: 화면 기술 버튼 3칸에 원하는 기술을 골라 끼워요. 쿨타임은 기술마다 따로예요.",
   "🛠 이제 업데이트할 때마다 이 소식 창이 한 번 떠요."]},
 {v:"v43~46",d:"11/5",t:"🎨 그래픽",items:["메뉴 창 디자인 · 발자국과 발먼지 · 괴물 체력바 금테 · 세계마다 색감과 밤 분위기."]},
 {v:"v42",d:"11/4",t:"🗿 석상 · 🌱 길잡이 · ☀ 다섯 번째 세계",items:[
   "수도마다 지혜의 석상: 날마다 신화 수수께끼 3문제, 다 맞히면 10분 경험치 +15%.",
   "🌱 새싹과 🧭 길잡이: 함께 다니면 둘 다 경험치 +20%, 새싹이 승급하면 길잡이 별.",
   "세계의 중심 남쪽 ☀ 문: 모두 함께 열쇠 조각을 모으면 「태양의 사막」이 열려요."]},
];
function patchNew(){ const seen=G.seenVer; if(!seen) return PATCH_NOTES.slice(0,1); const i=PATCH_NOTES.findIndex(p=>p.v===seen); return i<0?PATCH_NOTES.slice(0,1):PATCH_NOTES.slice(0,i); }
function showPatch(all){ const L=all?PATCH_NOTES:patchNew(); G.seenVer=PATCH_NOTES[0].v; saveGame();
  card(`<h2>🛠 업데이트 소식</h2><p>지금 버전 <b style="color:var(--gold)">${VER}</b> · 게임은 켤 때마다 저절로 최신으로 바뀌어요.</p>
   ${L.map(p=>`<h3>${p.v} <small style="font-size:12px;opacity:.75">${p.d}</small> · ${p.t}</h3>${p.items.map(t=>`<div class="row"><div class="t"><span style="font-size:13.5px;opacity:1">${t}</span></div></div>`).join("")}`).join("")}
   ${all?"":'<button class="buy alt" id="ptAll" style="align-self:center">지난 소식도 보기</button>'}<button class="go" id="ptOk" style="align-self:center;font-size:19px;padding:10px 30px">좋아요!</button>`);
  $("ptOk").onclick=closeLayer; if($("ptAll")) $("ptAll").onclick=()=>showPatch(true); }
const PT={at:0};
XTICK.push(dt=>{ if(!started||G.realm<0||G.seenVer===PATCH_NOTES[0].v) return; const now=performance.now(); if(layerOpen||P.dead||!PT.at){ PT.at=now; return; } if(now-PT.at>2500){ if(!G.seenVer&&(G.kills||0)<5){ G.seenVer=PATCH_NOTES[0].v; saveGame(); return; } showPatch(false); } });
</script>
