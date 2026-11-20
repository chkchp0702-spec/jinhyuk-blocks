<script>
/* ================= v160 친구 이름표 옆 세계 문장 배지 =================
   - 함께하는 친구(PEERS) 이름 앞에 작은 방패 문장: 세계 색 그라데이션 + 세계 표시(✝ ᛟ ॐ ⚡) + 아래 계급 별(계급 단계 1~7, 별 점).
   - 같은 편은 금빛 테, 다른 편은 붉은 테. 높은 계급(5단계부터)은 테가 은은히 빛남(애니메이션 없이 그림자만).
   - placeLabel 을 감싸 친구 이름표 글자(html)에만 끼워 넣음 — 05-net.js·메시지 형식 그대로, 보기만. 그리기 호출 0. */
(function(){
  if(typeof placeLabel!=="function") return;
  function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function badge(o){ const R=REALMS[o.realm]; if(!R) return ""; const rk=Math.max(0,Math.min(6,o.rank|0)); const foe=o.realm!==G.realm;
    let pips=""; const n=rk+1; for(let i=0;i<Math.min(n,4);i++) pips+="<s></s>";
    return `<span class="pbdg${foe?" foe":""}${rk>=4?" hi":""}" style="--c1:${R.c1};--a:${R.a};--b:${R.b}"><i>${esc(R.icon||"✦")}</i><u>${pips}${n>4?`<em>${n}</em>`:""}</u></span>`; }
  const _pl=placeLabel;
  placeLabel=function(el,x,y,z,html){
    if(html!==undefined&&el&&el.__pb){ const o=el.__pb; const key=o.name+" <b>"; const k=html.lastIndexOf(key); if(k>=0) html=html.slice(0,k)+badge(o)+html.slice(k); }
    return _pl.call(this,el,x,y,z,html); };
  XTICK.push(function(){ for(const id in PEERS){ const o=PEERS[id]; if(o&&o.lbl&&o.lbl.__pb!==o) o.lbl.__pb=o; } });
})();
</script>
