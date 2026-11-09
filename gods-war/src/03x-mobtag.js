<script>
/* v90: 괴물 이름표 디자인 — 레벨 색 배지(나보다 약하면 회색·초록, 비슷하면 흰색, 세면 주황·빨강) · 정예는 금빛 별 배지 · 보스는 금테 리본 */
function mobLvCls(lv){ const d=(lv||1)-(G.lv||1); return d<=-6?"gy":d<=-3?"gn":d<=2?"wh":d<=5?"or":"rd"; }
function mobTag(m){
  const c=mobLvCls(m.lv);
  const pw=m.power?`<u class="mtpw">파워 ${m.power}</u>`:"";
  if(m.boss) return `<span class="mtag boss"><span class="mtrib"><i class="mtlv ${c}">${m.lv}</i><span class="mtn">👑 ${m.n}</span></span>${pw}</span><span class="hp mob"><s></s><i></i></span>`;
  return `<span class="mtag${m.elite?" elite":""}"><i class="mtlv ${c}">${m.lv}</i>${m.elite?'<em class="mtel">★정예</em>':""}<span class="mtn">${m.n}</span></span>${pw}<span class="hp mob"><s></s><i></i></span>`;
}
</script>
