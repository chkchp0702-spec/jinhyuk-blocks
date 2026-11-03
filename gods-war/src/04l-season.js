<script>
/* ================= v22-3: 🎆 4주 시즌 「신들의 축제」와 무료 별 길 (IDEAS G11/3-6) =================
   한국 시간 2026-11-02(월)부터 4주마다 새 축제(올림피아 경기 → 디왈리 빛 축제 → 한겨울 율 축제 → 에덴 빛의 날 → …).
   날마다 할 일 3개(별 2개씩)·주마다 큰 할 일 3개(별 5개씩)·출석 별 1개·쉬는 동안 수련 별(4시간마다 1개, 하루 2개까지).
   별 7개마다 별 길 한 칸(30칸) → 금화·물약·장비·신전 장식·시즌 한정 장식·칭호. 진짜 돈은 없음, 전부 무료.
   할 일은 날짜로 정해져 모든 폰이 같음. 진행은 G의 숫자(처치 수 등)가 그날 처음보다 얼마나 늘었나로 셈.
   세계 경쟁: 각자 별 수를 중계 서버에 보관 …/ss/<시즌>/<id> → 세계별 합계. 지난 시즌 1등 세계 수도엔 불꽃놀이 + 사냥 금화 +10%. */
const SS_STEP=7, SS_LEN=30;
function weekIdx(t){ return Math.floor((kday(t)-4)/7); }
const SS_W0=weekIdx(Date.UTC(2026,10,1,15,0,0));
function ssNo(t){ return Math.max(0,Math.floor((weekIdx(t)-SS_W0)/4)); }
function ssStartDay(S){ return (SS_W0+S*4)*7+4; }
function ssDaysLeft(){ return ssStartDay(ssNo()+1)-kday(); }
const SS_THEMES=[
 {n:"올림피아 경기 축제",ic:"🏅",realm:3,c:"#ffcf4a",d:"올림푸스의 신들이 여는 달리기·힘겨루기 잔치"},
 {n:"디왈리 빛 축제",ic:"🪔",realm:2,c:"#ff9f3d",d:"수천 개의 등불이 밤을 밝히는 인도의 빛 잔치"},
 {n:"한겨울 율 축제",ic:"❄",realm:1,c:"#8fd0ff",d:"아스가르드의 가장 긴 밤, 모닥불과 노래의 잔치"},
 {n:"에덴 빛의 날",ic:"🕊",realm:0,c:"#fff2a0",d:"천사들이 하늘 문을 열고 빛을 나누는 날"} ];
function ssTheme(S){ return SS_THEMES[(S==null?ssNo():S)%4]; }
// 시즌 한정 장식 (신전 꾸미기 DECO 에 덧붙임 — 뒤에 붙여서 예전 저장 안 깨짐)
const SS_DECO0=DECO.length;
DECO.push(
 {n:"올림피아 성화대",ic:"🔥",t:2,sc:15,p:0,season:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.5,.7,3.4,M.marble,0,1.7,0,12)); g.add(cyl(1.1,.5,.6,M.tgold,0,3.7,0,16)); hmFlame(g,4.6,0xff8a2a,1.6); return g; }},
 {n:"월계관 비석",ic:"🌿",t:2,sc:15,p:0,season:1,mk:r=>{ const g=new THREE.Group(); g.add(box(1.6,2.4,.5,M.marble,0,1.2,0)); const w=new THREE.Mesh(new THREE.TorusGeometry(.6,.13,8,20),M.laurel); w.position.set(0,1.6,.3); g.add(w); return g; }},
 {n:"디왈리 등불탑",ic:"🪔",t:2,sc:15,p:0,season:1,mk:r=>{ const g=new THREE.Group(); for(let k=0;k<4;k++){ g.add(cyl(1.2-k*.25,1.3-k*.25,.35,M.temple,0,.2+k*.9,0,16)); for(let j=0;j<6-k;j++){ const a=j/(6-k)*6.283; const s=sph(.13,glowMat(0xffc040,.95),Math.cos(a)*(1.1-k*.25),.55+k*.9,Math.sin(a)*(1.1-k*.25)); s.userData.pulse=1; g.add(s); } } return g; }},
 {n:"랑골리 꽃무늬",ic:"🌺",t:2,sc:15,p:0,season:1,mk:r=>{ const g=new THREE.Group(); [0xff4a8a,0xffa94a,0xffe14a,0x4ad0ff,0xa070ff].forEach((c,k)=>{ const m=new THREE.Mesh(new THREE.RingGeometry(.3+k*.35,.6+k*.35,6+k*2),hmMat("rg"+k,{color:c,roughness:1})); m.rotation.x=-Math.PI/2; m.rotation.z=k*.3; m.position.y=.04+k*.005; g.add(m); }); return g; }},
 {n:"율 트리",ic:"🎄",t:2,sc:15,p:0,season:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.2,.3,.8,M.trunk,0,.4,0,8)); [[1.6,2,1.4],[1.2,1.7,2.6],[.8,1.4,3.6]].forEach(a=>{ const c=new THREE.Mesh(new THREE.ConeGeometry(a[0],a[1],10),M.pine); c.position.y=a[2]; g.add(c); }); const cs=[0xff4a4a,0xffd84a,0x4ad0ff,0xffffff]; for(let k=0;k<10;k++){ const y=1.2+k*.3, rr=1.4-k*.12; const s=sph(.12,glowMat(cs[k%4],.95),Math.cos(k*2.1)*rr,y,Math.sin(k*2.1)*rr); s.userData.pulse=1; g.add(s); } const st=sph(.3,glowMat(0xffe14a,1),0,4.5,0); st.userData.pulse=1; g.add(st); return g; }},
 {n:"눈사람",ic:"⛄",t:2,sc:15,p:0,season:1,mk:r=>{ const g=new THREE.Group(); g.add(sph(1,M.snow,0,1,0)); g.add(sph(.7,M.snow,0,2.4,0)); g.add(sph(.08,M.dark,-.22,2.55,.62)); g.add(sph(.08,M.dark,.22,2.55,.62)); const n=new THREE.Mesh(new THREE.ConeGeometry(.1,.5,6),hmMat("carrot",{color:0xff8a2a})); n.rotation.x=Math.PI/2; n.position.set(0,2.4,.85); g.add(n); g.add(cyl(.45,.5,.5,M.dark,0,3.2,0,12)); return g; }},
 {n:"빛의 천사상",ic:"👼",t:2,sc:15,p:0,season:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(1,1.15,.8,M.marble,0,.4,0,16)); try{ const a=makeAvatar(0,6,true); a.traverse(o=>{ if(o.isMesh&&!(o.material&&o.material.blending===THREE.AdditiveBlending)) o.material=M.marble; }); a.scale.setScalar(1.2); a.position.y=.8; g.add(a); }catch(e){ g.add(sph(.8,M.marble,0,1.8,0)); } return g; }},
 {n:"하늘 빛기둥",ic:"✨",t:2,sc:15,p:0,season:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.9,1,.4,M.marble,0,.2,0,16)); const b=cyl(.5,.7,9,glowMat(0xfff2a0,.35),0,4.8,0,12); b.userData.pulse=1; b.userData.noOutline=true; g.add(b); return g; }},
 {n:"축제 트로피",ic:"🏆",t:3,sc:25,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); g.add(box(1.4,.8,1.4,M.marble,0,.4,0)); g.add(cyl(.18,.35,1,M.gold,0,1.3,0,12)); const cup=cyl(.9,.35,1.2,M.gold,0,2.4,0,18); g.add(cup); [-1,1].forEach(s=>{ const h=new THREE.Mesh(new THREE.TorusGeometry(.35,.08,6,14),M.gold); h.position.set(s*.95,2.4,0); h.rotation.y=Math.PI/2; g.add(h); }); const st=sph(.25,glowMat(0xfff2a0,.9),0,3.3,0); st.userData.pulse=1; g.add(st); return g; }} );
function ssDecoOf(S,k){ return SS_DECO0+((S%4)*2+k); }
const SS_TROPHY=SS_DECO0+8;
const SS_CNT={kills:()=>G.kills,boss:()=>G.bossKills,capt:()=>G.capt,war:()=>G.war,dodge:()=>G.dodges||0,fish:()=>G.fishN||0,bless:()=>G.blessN||0,dg:()=>G.dgClear||0,exp:()=>G.expN||0,place:()=>G.hmPlace||0,lv:()=>G.lv,trap:()=>G.trapN||0};
const SS_DAILY=[["kills",30,"괴물 30마리 잡기","⚔"],["kills",60,"괴물 60마리 잡기","⚔"],["boss",1,"보스 1마리 잡기","👑"],["capt",2,"제단 2번 점령하기","🚩"],["dodge",5,"높이 뛰어 공격 5번 피하기","💨"],["fish",3,"물고기 3마리 낚기","🎣"],["bless",1,"친구 신전에 축복 도장 찍기","🌟"],["lv",1,"레벨 1 올리기","⬆"],["trap",1,"통발 한 번 걷기","🪤"]];
const SS_WEEKLY=[["kills",400,"괴물 400마리 잡기","⚔"],["boss",8,"보스 8마리 잡기","👑"],["dg",2,"신들의 미궁 2번 깨기","🌀"],["exp",2,"신수 원정 2번 다녀오기","🧭"],["fish",20,"물고기 20마리 낚기","🎣"],["bless",3,"친구 신전 3곳에 축복","🌟"],["war",2,"전쟁 점수 2점 얻기","⚔"],["capt",12,"제단 12번 점령하기","🚩"],["place",3,"내 신전에 장식 3번 놓기","🏡"]];
function ssPick(pool,seed,n){ const r=expRng(seed*2654435761); const idx=[]; const used={}; let guard=0; while(idx.length<n&&guard++<50){ const i=Math.floor(r()*pool.length); if(idx.indexOf(i)>=0||used[pool[i][0]]) continue; used[pool[i][0]]=1; idx.push(i); } return idx; }
function ssSnap(){ const o={}; for(const k in SS_CNT) o[k]=SS_CNT[k](); return o; }
const SSO={}; const SST={t:0,pubT:0,dirty:true,fw:0};
function ssData(){ const S=ssNo(), d=kday(), w=weekIdx(); let s=G.ss;
  if(!s||s.S!==S){ s=G.ss={S,day:-1,base:{},dd:{},wk:-1,wbase:{},wd:{},st:0,cl:0,login:-1,idl:{d:-1,n:0}}; }
  if(s.day!==d){ s.day=d; s.base=ssSnap(); s.dd={}; }
  if(s.wk!==w){ s.wk=w; s.wbase=ssSnap(); s.wd={}; }
  return s; }
function ssTasks(){ const s=ssData(); return {daily:ssPick(SS_DAILY,s.day,3).map(i=>({T:SS_DAILY[i],i,v:SS_CNT[SS_DAILY[i][0]]()-(s.base[SS_DAILY[i][0]]||0),done:!!s.dd[i]})),
  weekly:ssPick(SS_WEEKLY,s.wk+1000,3).map(i=>({T:SS_WEEKLY[i],i,v:SS_CNT[SS_WEEKLY[i][0]]()-(s.wbase[SS_WEEKLY[i][0]]||0),done:!!s.wd[i]}))}; }
function ssStep(){ return Math.min(SS_LEN,Math.floor(ssData().st/SS_STEP)); }
function ssAdd(n,why){ const s=ssData(); const st0=ssStep(); s.st+=n; SST.dirty=true; saveGame(); const st1=ssStep();
  toast(`🎆 축제 별 +${n}`,why+(st1>st0?` · 별 길 ${st1}칸 도착! 메뉴 → 축제에서 받아요`:""),2.6); jingle(st1>st0?[784,988,1175,1568]:[880,1175]); fxSpark(P.x,2.5,P.z,0xffe14a,16); }
function ssIdle(mins){ const s=ssData(); const d=kday(); if(s.idl.d!==d) s.idl={d,n:0}; const n=Math.min(2-s.idl.n,Math.floor(mins/240)); if(n>0){ s.idl.n+=n; s.st+=n; SST.dirty=true; saveGame(); return n; } return 0; }
// 보상: k = 1~30칸
function ssReward(k,S){ if(k===SS_LEN) return {ic:"🏆",n:"축제 트로피 + 금화 2,000",k:"trophy"}; if(k===10||k===20) { const D=DECO[ssDecoOf(S,k===10?0:1)]; return {ic:D.ic,n:D.n+" (시즌 한정 장식)",k:"sdeco",j:k===10?0:1}; }
  if(k%5===0) return {ic:"⚔",n:"장비 상자",k:"gear"}; if(k%4===0) return {ic:"🏡",n:"신전 장식 상자",k:"deco"}; if(k%3===0) return {ic:"🧪",n:"물약 3개",k:"pot"}; return {ic:"💰",n:`금화 ${fmt(100+k*30)}+`,k:"gold"}; }
function ssClaim(){ const s=ssData(); const top=ssStep(); const got=[]; while(s.cl<top){ s.cl++; const k=s.cl; const R=ssReward(k,s.S);
    if(R.k==="gold"){ const g=100+k*30+G.lv*10; G.gold+=g; got.push(`💰 금화 ${fmt(g)}`); }
    else if(R.k==="pot"){ G.pots+=3; got.push(`🧪 ${RM().potion} 3개`); }
    else if(R.k==="gear"){ const t=Math.min(3,Math.floor(G.rank/2)+(k>=25?1:0)); const sl=pick(["w","a","r"]); G.bag.push({s:sl,t}); got.push(`⚔ ${rarTag(t)}${itemName(sl,t)}`); }
    else if(R.k==="deco"){ got.push("🏡 "+hmGift(k>=20?2:1,"별 길에서")); }
    else if(R.k==="sdeco"){ got.push("✨ "+hmAdd(ssDecoOf(s.S,R.j),"축제 별 길에서")); }
    else if(R.k==="trophy"){ G.gold+=2000; got.push("🏆 "+hmAdd(SS_TROPHY,"축제 별 길 끝에서")); got.push("💰 금화 2,000"); } }
  G.ssMax=Math.max(G.ssMax||0,s.cl); saveGame(); if(got.length){ jingle([523,659,784,1046,1318,1568]); buzz([30,30,60]); fxRing(P.x,P.z,0xffe14a,9,.9); fxRiseDust&&fxRiseDust(0xffe9a8,30,1.4); }
  return got; }
function ssPub(){ try{ const s=ssData(); net.pushRet("ss/"+s.S+"/"+G.id,{i:G.id,n:G.name,r:G.realm,s:s.st,S:s.S,t:Date.now()}); }catch(e){} }
function ssMsg(d){ if(!d||!d.i||d.S==null||!REALMS[d.r]) return; (SSO[d.S]=SSO[d.S]||{})[d.i]=d; }
function ssSums(S){ const sum=[0,0,0,0], ppl=[0,0,0,0]; const L=Object.assign({},SSO[S]||{}); if(S===ssNo()&&G.realm>=0) L[G.id]={r:G.realm,s:ssData().st}; for(const id in L){ const d=L[id]; sum[d.r]+=d.s||0; ppl[d.r]++; } return {sum,ppl}; }
function ssWinner(){ const S=ssNo()-1; if(S<0) return null; const w=G.ssWin; const {sum}=ssSums(S); const mx=Math.max(...sum); if(mx>0){ const r=sum.indexOf(mx); if(!w||w.S!==S||w.r!==r){ G.ssWin={S,r}; } return r; } return w&&w.S===S?w.r:null; }
function ssTick(dt){ if(!started||G.realm<0) return; SST.t-=dt; SST.pubT-=dt;
  // 불꽃놀이: 지난 시즌 1등 세계 수도
  const wr=ssWinner(); if(wr!=null&&!DG.on&&!HM.on){ const c=REGIONS[wr*3]; if(Math.hypot(P.x-c.x,P.z-c.z)<130){ SST.fw-=dt; if(SST.fw<=0){ SST.fw=.7+Math.random()*.6; const cs=[0xff5a5f,0xffe14a,0x5fdc6a,0x4aa8ff,0xd070ff,0xffffff]; fxSpark(c.x+rnd(-28,28),26+rnd(0,12),c.z+rnd(-28,28),cs[Math.floor(Math.random()*cs.length)],HIGH()?46:24); } } }
  if(SST.t>0) return; SST.t=1; const s=ssData();
  if(s.login!==s.day){ s.login=s.day; s.st+=1; SST.dirty=true; saveGame(); setTimeout(()=>{ if(!layerOpen) toast(`${ssTheme().ic} ${ssTheme().n}`,"오늘의 출석 별 +1 · 메뉴 → 🎆 축제에서 할 일 보기",3); },2600); }
  const T=ssTasks(); T.daily.forEach(x=>{ if(!x.done&&x.v>=x.T[1]){ s.dd[x.i]=1; ssAdd(2,"오늘의 할 일: "+x.T[2]); } }); T.weekly.forEach(x=>{ if(!x.done&&x.v>=x.T[1]){ s.wd[x.i]=1; ssAdd(5,"이번 주 할 일: "+x.T[2]); } });
  if(net.up>0&&(SST.dirty&&SST.pubT<=0||SST.pubT<-300)){ SST.dirty=false; SST.pubT=15; ssPub(); } }
function showSeason(){ const s=ssData(), S=s.S, Th=ssTheme(S), step=ssStep(); const T=ssTasks(); const pct=step>=SS_LEN?100:Math.round((s.st%SS_STEP)/SS_STEP*100);
  const road=Array.from({length:SS_LEN},(_,j)=>{ const k=j+1, R=ssReward(k,S); const cls=k<=s.cl?"got":k<=step?"ready":""; return `<div class="${cls}${k%10===0?" big":""}" title="${R.n}"><em>${k<=s.cl?"✓":R.ic}</em><i>${k}</i></div>`; }).join("");
  const trow=(x,star)=>`<div class="row"${x.done?' style="opacity:.6"':""}><div class="ic">${x.done?"✅":x.T[3]}</div><div class="t"><div>${x.T[2]} <small style="color:#ffe14a">+${star}★</small></div><span>${x.done?"완료!":`${fmt(Math.max(0,Math.min(x.v,x.T[1])))}/${fmt(x.T[1])}`}</span>${x.done?"":`<span class="tbar"><i style="width:${Math.round(clamp(x.v/x.T[1],0,1)*100)}%"></i></span>`}</div></div>`;
  const {sum,ppl}=ssSums(S); const mx=Math.max(1,...sum); const wr=ssWinner();
  const bars=REALMS.map((R,r)=>`<div class="ssbar"><span style="color:${R.c1}">${R.icon} ${R.n}</span><b><i style="width:${Math.round(sum[r]/mx*100)}%;background:${R.c1}"></i></b><small>${fmt(sum[r])}★ · ${ppl[r]}명</small></div>`).join("");
  card(`<h2>${Th.ic} ${Th.n}</h2><p>${Th.d}<br>시즌 ${S+1} · <b>${ssDaysLeft()}일</b> 남음 · 4주마다 새 축제가 열려요 (전부 무료!)</p>
   <div class="row"><div class="ic">⭐</div><div class="t"><div>축제 별 <b style="color:#ffe14a">${s.st}개</b> · 별 길 <b>${step}/${SS_LEN}칸</b></div><span>${step>=SS_LEN?"별 길 끝까지 왔어요! 최고!":`다음 칸까지 별 ${SS_STEP-s.st%SS_STEP}개`}</span><span class="tbar"><i style="width:${pct}%"></i></span></div>${s.cl<step?'<button class="buy" id="ssGet">받기</button>':""}</div>
   <div class="ssroad">${road}</div><p style="font-size:12px">10칸·20칸 = 이번 축제에만 나오는 신전 장식 · 30칸 = 🏆 축제 트로피 · 칭호 «축제 손님»(10칸)·«축제의 주인공»(30칸)</p>
   <h3>☀ 오늘의 할 일 (날마다 바뀌어요)</h3>${T.daily.map(x=>trow(x,2)).join("")}
   <div class="row"><div class="ic">📅</div><div class="t"><div>출석 별 <small style="color:#ffe14a">+1★</small></div><span>${s.login===s.day?"오늘 받았어요":"오늘 처음 켜면 받아요"}</span></div></div>
   <div class="row"><div class="ic">💤</div><div class="t"><div>쉬는 동안 수련 별 <small style="color:#ffe14a">4시간마다 +1★</small></div><span>오늘 ${s.idl.d===kday()?s.idl.n:0}/2개 · 게임을 꺼 둬도 모여요</span></div></div>
   <h3>📆 이번 주 큰 할 일</h3>${T.weekly.map(x=>trow(x,5)).join("")}
   <h3>🌍 세계 대항 별 모으기</h3>${bars}<p style="font-size:12px">우리 세계 친구들이 모은 별을 다 더해요. 시즌이 끝나면 1등 세계 수도에 다음 시즌 내내 🎆 불꽃놀이 + 사냥 금화 +10%!</p>
   ${wr!=null?`<p>지난 축제 1등: <b style="color:${REALMS[wr].c1}">${REALMS[wr].icon} ${REALMS[wr].n}</b>${wr===G.realm?" — 우리 세계! 사냥 금화 +10% 중":""}</p>`:""}`);
  if($("ssGet")) $("ssGet").onclick=()=>{ const got=ssClaim(); card(`<h2>🎆 별 길 보상!</h2><div class="diary">${got.map(g=>`<p>${g}</p>`).join("")}</div><button class="buy" id="ssOk" style="align-self:center">좋아요!</button>`); $("ssOk").onclick=showSeason; }; }
TITLES.push({id:"ss10",n:"축제 손님",t:1,h:"축제 별 길 10칸 가기",g:()=>[G.ssMax||0,10]},{id:"ss30",n:"축제의 주인공",t:3,h:"축제 별 길 30칸 끝까지 가기",g:()=>[G.ssMax||0,30]});
/* ---------- 상황 버튼(🎣 낚시 · 🏺 제단 · ✨ 장식) ---------- */
const CTX={t:0,a:null,el:null};
function ctxTick(dt){ if(!CTX.el){ const b=document.createElement("button"); b.id="bCtx"; b.type="button"; b.hidden=true; b.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); if(CTX.a&&!layerOpen&&!P.dead) CTX.a.f(); }); document.body.appendChild(b); CTX.el=b; }
  CTX.t-=dt; if(CTX.t>0) return; CTX.t=.25; let a=null; if(started&&!layerOpen&&!P.dead){ a=hmCtx(); if(!a&&!DG.on&&!HM.on&&nearWater()) a={t:"🎣 낚시",f:startFish}; }
  CTX.a=a; CTX.el.hidden=!a; if(a&&CTX.el.textContent!==a.t) CTX.el.textContent=a.t; }
setTimeout(()=>{ const z=$("zoomBtns"); if(!z) return; [["bHome","🏡",()=>showHome()],["bFest","🎆",()=>showSeason()]].forEach(([id,t,f])=>{ const b=document.createElement("button"); b.id=id; b.type="button"; b.textContent=t; b.style.fontSize="17px"; b.addEventListener("pointerdown",e=>e.stopPropagation()); b.onclick=e=>{ e.stopPropagation(); if(started&&!layerOpen) f(); }; z.appendChild(b); }); },0);
</script>
