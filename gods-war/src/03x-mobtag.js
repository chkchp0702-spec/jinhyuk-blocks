<script>
/* v90: 괴물 이름표 디자인 — 레벨 색 배지(나보다 약하면 회색·초록, 비슷하면 흰색, 세면 주황·빨강) · 정예는 금빛 별 배지 · 보스는 금테 리본 */
function mobLvCls(lv){ const d=(lv||1)-(G.lv||1); return d<=-6?"gy":d<=-3?"gn":d<=2?"wh":d<=5?"or":"rd"; }
/* v162: 이름표 앞 작은 방패 문장 — 괴물이 사는 세계 색(에덴 금빛·아스가르드 하늘·인도 주황·올림푸스 파랑, 중립은 잿빛) + 종류 표시
   (🐾 짐승 · 🗿 거인 · 💀 망령 · 😈 마귀 · 🕊 날개족). 보스는 금테가 두껍고 빛남, 세계 보스는 보라 테. 글자만 바뀜 — 그리기 호출 0. */
const MOBKIND={wolf:"🐾",bull:"🐾",naga:"🐾",fireserpent:"🐾",hydra:"🐾",satyr:"🐾",icegiant:"🗿",troll:"🗿",cyclops:"🗿",nephilim:"🗿",ghost:"💀",vetala:"💀",draugr:"💀",asura:"😈",rakshasa:"😈",ravana:"😈",darkangel:"😈",harpy:"🕊",angel:"🕊"};
let MOBREALM=null;
function mobRealm(m){ if(m.__rl!==undefined) return m.__rl;
  if(!MOBREALM){ MOBREALM={}; try{ REALMS.forEach((R,i)=>{ (R.mobs||[]).forEach(d=>{ if(d&&d.n&&MOBREALM[d.n]==null) MOBREALM[d.n]=i; }); [R.boss,R.worldBoss].forEach(d=>{ if(d&&d.n&&MOBREALM[d.n]==null) MOBREALM[d.n]=i; }); }); }catch(e){} }
  let r=MOBREALM[m.n]; if(r==null){ try{ const rg=REGIONS.find(g=>g.id===m.rg); if(rg&&rg.realm>=0) r=rg.realm; }catch(e){} }
  return m.__rl=(r==null?-1:r); }
function mobBadge(m){ const r=mobRealm(m); const R=r>=0?REALMS[r]:null; const k=MOBKIND[m.shape]||"⚔";
  const st=R?`--a:${R.c1};--b:${R.a};--c:${R.b}`:"--a:#d8d4cc;--b:#7a7670;--c:#2e2c2a";
  return `<span class="mbdg${m.boss?(m.world?" wb":" bs"):m.elite?" el":""}" style="${st}"><i>${k}</i></span>`; }
function mobTag(m){
  const c=mobLvCls(m.lv); const bd=mobBadge(m);
  const pw=m.power?`<u class="mtpw">파워 ${m.power}</u>`:"";
  if(m.boss) return `<span class="mtag boss"><span class="mtrib">${bd}<i class="mtlv ${c}">${m.lv}</i><span class="mtn">👑 ${m.n}</span></span>${pw}</span><span class="hp mob"><s></s><i></i></span>`;
  return `<span class="mtag${m.elite?" elite":""}">${bd}<i class="mtlv ${c}">${m.lv}</i>${m.elite?'<em class="mtel">★정예</em>':""}<span class="mtn">${m.n}</span></span>${pw}<span class="hp mob"><s></s><i></i></span>`;
}
</script>
