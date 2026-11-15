<script>
/* ================= v135-4: ⚔ 난이도 — "너무 쉬워요!" (사용자 11/16) =================
   왜 쉬웠나: 모두 60레벨 선물(v74) 뒤로 내 레벨은 60 넘는데 들판 괴물은 1~16, 세계의 중심도 18~40레벨 → 한두 대에 쓰러지고 방어 70%↑.
   고침:
   ① 「괴물이 나와 함께 자라요」 — 들판·수도 둘레·세계의 중심 괴물과 보스 레벨이 내 레벨을 따라옴(보통부터).
      수도 −8 · 첫 사냥터 −4 · 둘째 사냥터 −1 · 세계의 중심 +3 · 지역 보스 +3 · 세계 보스 +7 (+ 난이도 덧셈)
   ② 방어가 너무 세지 않게: 피해 줄임 = 방어/(방어+50+레벨×k) (보통 k=1.4 · 어려움 1.8 · 신화 2.2). 예전엔 레벨 60에 70%가 넘었음.
   ③ 메뉴 ⚔ 난이도에서 고름 — 🌱 쉬움(예전 그대로) · ⚔ 보통(새 기본) · 🔥 어려움 · ⚡ 신화.
      어려움·신화는 괴물 체력·공격이 더 세고, ★정예가 더 자주, 공격 간격이 짧음. 대신 경험치·금화 ×1.3 / ×1.6, 쇳조각도 더.
   mobStats 를 감싸므로 미궁·전쟁·이벤트 괴물도 함께 세짐. 저장: G.diff(0~3, 없으면 1) · G.hardK(어려움 이상 처치 수) · G.mythK(신화 처치 수). 칭호 3개. */
const DIFF=[
 {ic:"🌱",n:"쉬움",d:"예전 그대로 — 괴물이 레벨을 따라오지 않아요",hp:1,atk:1,k:0,lv:null,el:0,cd:1,rw:1},
 {ic:"⚔",n:"보통",d:"괴물이 나와 함께 자라요 (새 기본)",hp:1.15,atk:1.2,k:1.4,lv:0,el:0,cd:1,rw:1},
 {ic:"🔥",n:"어려움",d:"더 세고 빠른 괴물 · ★정예 자주 · 보상 ×1.3",hp:1.5,atk:1.6,k:1.8,lv:2,el:.1,cd:1.18,rw:1.3},
 {ic:"⚡",n:"신화",d:"진짜 신들의 전쟁 · 보상 ×1.6",hp:2,atk:2.2,k:2.2,lv:5,el:.2,cd:1.35,rw:1.6}];
function dfI(){ const v=G.diff==null?1:G.diff|0; return clamp(v,0,3); }
function DF(){ return DIFF[dfI()]; }
/* ① 세기 */
(function(){ const _ms=mobStats; mobStats=function(lv,boss){ const s=_ms(lv,boss); const D=DF(); s.mhp=Math.round(s.mhp*D.hp); s.atk*=D.atk; return s; };
  const _dr=dmgReduce; dmgReduce=function(def){ const D=DF(); if(!D.k) return _dr(def); return def/(def+50+Math.max(1,G.lv)*D.k); };
  /* 레벨 따라오기 (spawnMob 이 만든 뒤 레벨·능력치를 다시 맞춤) */
  const _sp=spawnMob; spawnMob=function(rg,boss,world){ const m=_sp.apply(this,arguments); try{ const D=DF(); if(m&&D.lv!=null&&rg&&G.lv>0){ let off;
      if(boss) off=world?7:3; else if(rg.cap) off=-8; else if(rg.center) off=3; else off=rg.lv[1]<=10?-4:-1; off+=D.lv; const want=Math.min(LVMAX,Math.max(1,G.lv+off+(boss?0:rint(-1,1))));
      if(want>m.lv){ const st=mobStats(want,boss); const f=m.hp/m.mhp; const elM=m.elite?2.6:1, elA=m.elite?1.45:1, elR=m.elite?3:1; m.lv=want; m.mhp=Math.round(st.mhp*elM); m.hp=Math.max(1,Math.round(m.mhp*f)); m.atk=st.atk*elA; m.xp=Math.round(st.xp*elR); m.gold=Math.round(st.gold*elR); m.dfF=1; } }
      if(m&&!boss&&!m.elite&&rg&&!rg.cap&&DF().el>0&&Math.random()<DF().el&&typeof makeElite==="function") makeElite(m); }catch(e){ console.warn(e); } return m; };
  /* 보상 · 처치 수 */
  const _km=killMob; killMob=function(m){ try{ const D=DF(); if(m&&!m.dfPaid&&D.rw>1&&!m.war){ m.dfPaid=1; m.xp=Math.round((m.xp||0)*D.rw); m.gold=Math.round((m.gold||0)*D.rw); if(Math.random()<(dfI()===3?.25:.12)) G.ore=(G.ore||0)+1; }
      if(m&&!m.war&&dfI()>=2) G.hardK=(G.hardK||0)+1; if(m&&!m.war&&dfI()===3) G.mythK=(G.mythK||0)+1; }catch(e){} return _km.apply(this,arguments); }; })();
/* 어려움 이상: 쫓아오는 괴물의 공격 간격이 짧아짐 */
XTICK.push(dt=>{ const D=DF(); if(D.cd<=1||!started) return; for(const m of mobs){ if(m.state==="chase"&&m.cd>0&&!m.titan&&!m.war) m.cd-=dt*(D.cd-1); } });
/* ---------- 창 ---------- */
function showDiff(){ const cur=dfI();
  card(`<h2>⚔ 난이도</h2><p>"너무 쉬워요!" 해서 바꿨어요. <b>보통</b>부터는 괴물이 <b>내 레벨을 따라 함께 자라요</b> — 들판에서도 이제 진짜 싸움이에요! 어려울수록 보상이 커져요.</p>
   ${DIFF.map((D,i)=>`<div class="row"><div class="ic">${D.ic}</div><div class="t"><div>${D.n}${i===cur?" <b style=\"color:#7ad87a\">· 지금</b>":""}</div><span>${D.d}${D.hp>1?` · 괴물 체력 ×${D.hp} · 공격 ×${D.atk}`:""}</span></div><button class="buy${i===cur?" alt":""}" data-df="${i}" ${i===cur?"disabled":""}>${i===cur?"고름":"고르기"}</button></div>`).join("")}
   <div class="idlegrid"><div><b>${fmt(G.hardK||0)}</b><span>🔥 어려움 이상 처치</span></div><div><b>${fmt(G.mythK||0)}</b><span>⚡ 신화 처치</span></div><div><b>${Math.round(dmgReduce(stat().def)*100)}%</b><span>🛡 지금 내 피해 줄임</span></div></div>
   <p style="font-size:12px">💡 빨간 원은 점프로 피해요 · 🧪 물약은 체력 반을 채워요 · 어려우면 친구와 함께! 바꾼 난이도는 새로 나오는 괴물부터 적용돼요.</p>`);
  layers.querySelectorAll("[data-df]").forEach(b=>b.onclick=()=>{ G.diff=+b.dataset.df; saveGame(); const D=DF(); jingle(G.diff>=2?[392,523,659,880]:[523,659]); toast(`${D.ic} 난이도: ${D.n}`,D.d,2); showDiff(); }); }
MENU_X.push({ic:"⚔",n:"난이도",id:"dfBtn",sub:()=>`${DF().ic} ${DF().n} — ${dfI()>=1?"괴물이 나와 함께 자라요":"예전 그대로"}`,f:showDiff});
TITLES.push({id:"df1",n:"겁 없는 용사",t:1,h:"🔥 어려움 이상에서 괴물 200마리",g:()=>[G.hardK||0,200]},{id:"df2",n:"신화의 용사",t:2,h:"⚡ 신화에서 괴물 300마리",g:()=>[G.mythK||0,300]},{id:"df3",n:"신들도 놀란 자",t:3,h:"⚡ 신화에서 괴물 3000마리",g:()=>[G.mythK||0,3000]});
</script>
