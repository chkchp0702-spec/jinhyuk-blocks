<script>
/* ================= v19-1: 🏅 칭호 모음과 자랑 이름표 (IDEAS G11/3-1) =================
   하는 일마다 칭호가 생김. 고른 칭호 하나가 내 머리 위·친구 화면·모험가 명부에 색깔 글씨로 보임.
   못 딴 칭호는 "???" + 힌트 + 얼마나 했는지 막대. */
function josa(w,a,b){ const c=w.charCodeAt(w.length-1); return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28?a:b; }
function maxPetLv(){ let m=0; for(const k in (G.pets||{})) m=Math.max(m,G.pets[k].lv||0); return m; }
const TITLES=[
 {id:"lv5",n:"첫 걸음",t:0,h:"레벨 5 되기",g:()=>[G.lv,5]},
 {id:"lv20",n:"이름난 모험가",t:1,h:"레벨 20 되기",g:()=>[G.lv,20]},
 {id:"lv40",n:"전설의 영웅",t:3,h:"레벨 40 되기",g:()=>[G.lv,40]},
 {id:"k500",n:"백전용사",t:1,h:"괴물 500마리 잡기",g:()=>[G.kills,500]},
 {id:"k3000",n:"괴물들의 악몽",t:2,h:"괴물 3,000마리 잡기",g:()=>[G.kills,3000]},
 {id:"boss10",n:"보스 사냥꾼",t:1,h:"보스 10마리 잡기",g:()=>[G.bossKills,10]},
 {id:"dodge50",n:"바람의 발",t:1,h:"높이 뛰어서 공격 50번 피하기 (\"피함!\")",g:()=>[G.dodges||0,50]},
 {id:"cap10",n:"땅따먹기 왕",t:1,h:"제단 10번 점령하기",g:()=>[G.capt,10]},
 {id:"war5",n:"제단 수호자",t:2,h:"전쟁 점수 5점 얻기",g:()=>[G.war,5]},
 {id:"pet10",n:"신수의 벗",t:1,h:"신수 하나를 레벨 10까지 키우기",g:()=>[maxPetLv(),10]},
 {id:"pet4",n:"신수 박사",t:3,h:"신수 도감 4칸 모두 모으기",g:()=>[Object.keys(G.pets||{}).length,4]},
 {id:"combo3",n:"환상의 짝꿍",t:2,h:"친구와 합체 기술 3가지 성공하기",g:()=>[Object.keys(G.combos||{}).length,3]},
 {id:"titan1",n:"거인 사냥꾼",t:2,h:"주간 거대 보스를 다 함께 쓰러뜨리기",g:()=>[G.titanWins||0,1]},
 {id:"hero",n:"이번 주의 용사",t:3,h:"거대 보스 데미지 1등 하기",g:()=>[G.hero!=null?1:0,1]},
 {id:"dg1",n:"미궁 탐험가",t:1,h:"신들의 미궁 5층까지 깨기",g:()=>[G.dgClear||0,1]},
 {id:"dg10",n:"미궁의 왕",t:3,h:"신들의 미궁 10번 깨기",g:()=>[G.dgClear||0,10]},
 {id:"dgfast",n:"번개 탐험대",t:2,h:"미궁을 5분 안에 깨기",g:()=>[G.dgBest&&G.dgBest<=300?1:0,1]},
 {id:"sleep",n:"꿀잠 수련가",t:1,h:"쉬는 동안 수련 합쳐서 24시간",g:()=>[Math.floor((G.idleTot||0)/60),24]},
 {id:"exp5",n:"원정 대장",t:1,h:"신수 원정 5번 다녀오기",g:()=>[G.expN||0,5]},
 {id:"expP",n:"형제 원정대",t:2,h:"친구와 함께 원정대 3번",g:()=>[G.expParty||0,3]},
 {id:"rich",n:"황금 부자",t:2,h:"금화 10,000개 모으기",g:()=>[G.gold,10000]},
 {id:"phoenix",n:"불사조",t:0,h:"20번 쓰러지고 다시 일어나기",g:()=>[G.deaths,20]},
];
// 세계마다 괴물 4종 × 100마리 = "○○ 사냥꾼", 세계 보스를 이기면 "○○를 이긴 자"
REALMS.forEach((R,r)=>{ R.mobs.forEach((M,i)=>TITLES.push({id:"m"+r+i,n:M.n+" 사냥꾼",t:1,realm:r,h:`${R.n}의 ${M.n} 100마리 잡기`,g:()=>[(G.mk||{})[M.n]||0,100]}));
  TITLES.push({id:"wb"+r,n:R.worldBoss.n+josa(R.worldBoss.n,"을","를")+" 이긴 자",t:3,realm:r,h:`${R.worldBoss.n} 쓰러뜨리기 (세계의 중심이나 미궁 5층에 나타나요)`,g:()=>[Math.min(1,(G.mk||{})[R.worldBoss.n]||0),1]}); });
function titleOf(id){ return id?TITLES.find(x=>x.id===id):null; }
function titleCss(id){ const T=titleOf(id); return T?RAR[T.t].c:"#fff"; }
function titleHtml(id){ const T=titleOf(id); if(!T) return ""; return `<span class="ttl" style="color:${RAR[T.t].c}">«${T.n}»</span>`; }
const TTL={t:0,first:true};
function tickTitles(dt){ if(!started) return; TTL.t-=dt; if(TTL.t>0) return; TTL.t=1.5; G.titles=G.titles||{}; const fresh=[];
  TITLES.forEach(T=>{ if(G.titles[T.id]) return; let v; try{ v=T.g(); }catch(e){ return; } if(v[0]>=v[1]){ G.titles[T.id]=Date.now(); fresh.push(T); } });
  if(!fresh.length){ TTL.first=false; return; }
  if(!G.title||!titleOf(G.title)){ fresh.sort((a,b)=>b.t-a.t); G.title=fresh[0].id; }
  saveGame(); try{ net.hello(); net.pushProfile(1); }catch(e){}
  if(TTL.first&&fresh.length>1){ toast(`🏅 칭호 ${fresh.length}개를 받았어요!`,"메뉴 → 칭호 모음에서 골라 달아요",3.2); jingle([659,784,1046,1318]); TTL.first=false; return; }
  TTL.first=false; const T=fresh[0];
  if(typeof LVFX!=="undefined"&&LVFX.bt==null){ lvBanner("새 칭호!","«"+T.n+"»",T.h+(fresh.length>1?` · 외 ${fresh.length-1}개`:""),RAR[T.t].c); fxRing(P.x,P.z,0xffd76a,8,.8); fxRiseDust(0xffe9a8,HIGH()?40:18,1.6); }
  else toast(`🏅 새 칭호! «${T.n}»`,T.h,3);
  jingle([784,988,1175,1568]); buzz([30,30,60]); }
function showTitles(){ G.titles=G.titles||{}; const got=TITLES.filter(T=>G.titles[T.id]).length;
  const row=T=>{ const have=!!G.titles[T.id]; let v=[0,1]; try{ v=T.g(); }catch(e){} const pct=Math.round(clamp(v[0]/v[1],0,1)*100); const on=G.title===T.id;
    return `<div class="row"${have?"":' style="opacity:.62"'}><div class="ic" style="color:${have?RAR[T.t].c:"#888"}">${have?"🏅":"❔"}</div><div class="t"><div style="color:${have?RAR[T.t].c:"#ddd"}">${have?"«"+T.n+"»":"???"} <small style="font-size:11px;color:${RAR[T.t].c}">${RAR[T.t].n}</small>${on?' <i class="st on">다는 중</i>':""}</div><span>${T.h}${have?"":` · ${fmt(Math.min(v[0],v[1]))}/${fmt(v[1])}`}</span>${have?"":`<span class="tbar"><i style="width:${pct}%"></i></span>`}</div>${have&&!on?`<button class="buy" data-tt="${T.id}">달기</button>`:""}</div>`; };
  const common=TITLES.filter(T=>T.realm==null), byRealm=REALMS.map((R,r)=>TITLES.filter(T=>T.realm===r));
  card(`<h2>🏅 칭호 모음</h2><p>모은 칭호 <b style="color:var(--gold)">${got}/${TITLES.length}</b> · 고른 칭호는 내 머리 위와 친구 화면, 모험가 명부에 보여요.</p>
   <div class="row"><div class="ic">🏷</div><div class="t"><div>지금 다는 칭호</div><span>${G.title?titleHtml(G.title):"없음"}</span></div>${G.title?'<button class="buy sell" id="ttOff">떼기</button>':""}</div>
   <h3>모험</h3>${common.map(row).join("")}${byRealm.map((L,r)=>`<h3>${REALMS[r].icon} ${REALMS[r].n}의 괴물</h3>${L.map(row).join("")}`).join("")}`);
  layers.querySelectorAll("[data-tt]").forEach(b=>b.onclick=()=>{ G.title=b.dataset.tt; saveGame(); try{ net.hello(); net.pushProfile(1); }catch(e){} jingle([659,784,1046]); showTitles(); });
  if($("ttOff")) $("ttOff").onclick=()=>{ G.title=""; saveGame(); try{ net.hello(); net.pushProfile(1); }catch(e){} showTitles(); }; }
</script>
