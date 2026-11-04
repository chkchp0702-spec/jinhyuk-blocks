<script>
/* ================= v33: 🛡️ 신전 기사단(길드) (IDEAS G11/4-5) =================
   같은 초대 방 안에서 누구나 기사단을 만들거나(이름은 정해진 낱말 3개 고르기 — 나쁜 말 걱정 없음) 공개 목록·6글자 코드로 들어감. 최대 20명.
   세계가 달라도 같은 기사단 가능. 단원마다 자기 기록을 보관(retained) gd/<코드>/<id> 로 올리고, 모든 폰이 gd/+/+ 를 받아 다 더함(04o 불가사의와 같은 방식).
   주간 「기사단 임무」: 괴물 1점(보스 10점)·물고기 5점·미궁 정복 30점·쉬는 동안 4분에 1점(하루 최대 120) → 기사단 모두의 점수를 더한 막대 3칸.
   칸마다 보상 상자(이번 주 1점이라도 보탠 단원). 모든 주의 점수 합 = 기사단 경험치 → 기사단 Lv.1~10(금화 +1%/Lv, 깃발 문양·금테·빛).
   단원끼리 30걸음 안에서 같이 싸우면 경험치 +10%. 미니맵·이름표에 기사단 깃발. 수도마다 「기사단 게시판」(이번 주 순위 3위)과 내 기사단 깃대. */
const GD_A=["빛의","서리","황금","천둥","연꽃","별빛","불꽃","바람의","무지개","은빛","용감한","전설의"];
const GD_B=["늑대","독수리","사자","용","페가수스","그리핀","호랑이","거북","불사조","곰","고래","여우"];
const GD_C=["기사단","수호대","원정대","전사단","동맹","방패단"];
const GD_COL=["#e8453c","#f29900","#f4c430","#34a853","#1a9be8","#5b5fe8","#a142f4","#e8559c","#2b2f3a","#f2f2f2"];
const GD_SYM=["⚔️","🛡️","🐺","🦅","🦁","⭐","🔥","🌙","⚡","🌸","🐉","🔱","👑","🌈","💎","☀️"];
const GD_SYMLV=[1,1,1,1,1,1,2,2,3,3,4,5,6,7,8,10];   // 기사단 레벨이 오르면 문양이 더 열려요
const GD_LV=[0,400,1200,2800,5500,9500,15000,23000,34000,50000];
const GD_TIER=[100,300,650];            // 단원 1명당 주간 임무 칸 (단원 수 × 이 값, 최소 2명 기준)
const GD_MAX=20;
const GDO={};                            // 코드 → {id: 기록}
const GD={t:0,pubT:5,dirty:false,seen:false,board:[],lbl:null,brdKey:"",bnKey:""};
const GD_CODECH="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function gdName(gn){ return gn?`${GD_A[gn[0]]||""} ${GD_B[gn[1]]||""} ${GD_C[gn[2]]||""}`:""; }
function gdWeek(){ return titanWeek(); }
function gdMine(){ const g=G.gd; if(!g) return null; const w=gdWeek(); if(g.w!==w){ g.w=w; g.p=0; g.cl=0; } return g; }
function gdAlive(d){ return d&&!d.left&&Date.now()-(d.t||0)<21*86400000; }
function gdMembers(code){ const L=[]; const o=GDO[code]||{}; for(const id in o){ if(id!==G.id&&gdAlive(o[id])) L.push(o[id]); } const g=gdMine(); if(g&&g.c===code) L.push(gdRec()); return L; }
function gdRec(){ const g=gdMine(); return {i:G.id,n:G.name,r:G.realm,l:G.lv,c:g.c,gn:g.gn,gf:g.gf,ft:g.ft||0,b:g.b,w:g.w,p:Math.round(g.p),a:Math.round(g.a),t:Date.now(),me:1}; }
function gdWeekPts(code){ const w=gdWeek(); return gdMembers(code).reduce((s,d)=>s+(d.w===w?d.p||0:0),0); }
function gdAllPts(code){ return gdMembers(code).reduce((s,d)=>s+(d.a||0),0); }
function gdLvOf(a){ let k=0; while(k<GD_LV.length-1&&a>=GD_LV[k+1]) k++; return k+1; }
function gdLv(){ const g=gdMine(); return g?gdLvOf(gdAllPts(g.c)):0; }
function gdTiers(code){ const n=Math.max(2,gdMembers(code).length); return GD_TIER.map(v=>v*n); }
function gdMeta(code){ let best=null; for(const d of gdMembers(code)){ if(!best||(d.ft||0)>(best.ft||0)) best=d; } return best; }
function gdMate(o){ const g=gdMine(); return !!(g&&o&&o.gd&&o.gd[3]===g.c); }
function gdTag(){ const g=gdMine(); return g?[g.gf[1],g.gf[0],gdName(g.gn),g.c]:0; }
function gdTagHtml(t){ if(!t) return ""; const col=GD_COL[t[1]]||"#888"; return `<span class="gdt" style="background:${col};color:${t[1]===9||t[1]===2?"#201a10":"#fff"}">${GD_SYM[t[0]]||"🛡️"} ${t[2]}</span>`; }
function gdPub(){ const g=gdMine(); if(!g) return; try{ net.pushRet("gd/"+g.c+"/"+G.id,gdRec()); GD.dirty=false; }catch(e){} }
function gdAdd(n){ const g=gdMine(); if(!g||!(n>0)) return; g.p+=n; g.a+=n; GD.dirty=true; }
NETX.push({sub:"gd/+/+",pre:"gd/",f:(d,topic)=>{ if(!d||!d.i||!d.c) return; const code=String(d.c).slice(0,8); if(d.i===G.id){ // 다른 폰에서 같은 캐릭터로 했던 기록이 더 크면 이어받기
    const g=gdMine(); if(g&&g.c===code&&!d.left&&d.w===g.w&&(d.p||0)>g.p){ g.p=d.p; g.a=Math.max(g.a,d.a||0); } return; }
  (GDO[code]=GDO[code]||{}); if(d.left) delete GDO[code][d.i]; else GDO[code][d.i]=d;
  const g=gdMine(); if(g&&g.c===code&&(d.ft||0)>(g.ft||0)&&d.gf&&d.gn){ g.gf=d.gf; g.gn=d.gn; g.ft=d.ft; g.b=d.b; saveGame(); GD.bnKey=""; } }});
/* ---------- 만들기 · 가입 · 탈퇴 ---------- */
function gdNewCode(){ let s=""; for(let i=0;i<6;i++) s+=GD_CODECH[Math.floor(Math.random()*GD_CODECH.length)]; return s; }
function gdCreate(gn,gf){ if(G.gd) return; G.gd={c:gdNewCode(),gn,gf,ft:Date.now(),b:G.id,w:gdWeek(),p:0,a:0,cl:0,jt:Date.now()}; G.gdMade=1; saveGame(); gdPub(); GD.bnKey=""; GD.brdKey="";
  try{ lvBanner("기사단 창설",gdName(gn),"친구에게 코드 "+G.gd.c+" 를 알려 주세요",GD_COL[gf[0]]); }catch(e){} jingle([523,659,784,1046]); buzz([30,30,60]); }
function gdJoin(code){ code=String(code||"").toUpperCase().replace(/[^A-Z0-9]/g,""); if(G.gd){ toast("이미 기사단에 있어요"); return false; }
  const meta=gdMeta(code); if(!meta){ toast("그런 기사단을 못 찾았어요","코드를 다시 확인해 주세요 (방금 만든 기사단은 몇 초 뒤에 보여요)",2.4); return false; }
  if(gdMembers(code).length>=GD_MAX){ toast("자리가 꽉 찼어요",`기사단은 ${GD_MAX}명까지예요`,2); return false; }
  G.gd={c:code,gn:meta.gn,gf:meta.gf,ft:meta.ft||0,b:meta.b,w:gdWeek(),p:0,a:0,cl:0,jt:Date.now()}; G.gdJoin=(G.gdJoin||0)+1; saveGame(); gdPub(); GD.bnKey=""; GD.brdKey="";
  try{ lvBanner("기사단 입단",gdName(meta.gn),"함께 주간 임무를 채워요!",GD_COL[meta.gf[0]]); }catch(e){} jingle([523,659,784,1046]); buzz([30,30,60]); try{ net.hello(); }catch(e){} return true; }
function gdLeave(){ const g=gdMine(); if(!g) return; try{ net.pushRet("gd/"+g.c+"/"+G.id,{i:G.id,c:g.c,left:1,t:Date.now()}); }catch(e){} G.gd=null; saveGame(); GD.bnKey=""; GD.brdKey=""; try{ net.hello(); }catch(e){} toast("기사단에서 나왔어요"); }
function gdCanEdit(){ const g=gdMine(); if(!g) return false; if(g.b===G.id) return true; const L=gdMembers(g.c); if(L.some(d=>d.i===g.b)) return false; L.sort((x,y)=>(y.a||0)-(x.a||0)); return L[0]&&L[0].i===G.id; }
/* ---------- 주간 보상 ---------- */
function gdClaim(){ const g=gdMine(); if(!g) return; const T=gdTiers(g.c), tot=gdWeekPts(g.c); let k=0; while(k<3&&tot>=T[k]) k++; if(g.p<=0){ toast("이번 주에 1점 이상 보태면 받을 수 있어요"); return; } if(k<=g.cl) return;
  let gold=0,xp=0,ore=0,rune=0; for(let i=g.cl;i<k;i++){ gold+=(150+G.lv*15)*(i+1); xp+=(120+G.lv*20)*(i+1); ore+=6*(i+1); rune+=i; } const lvB=1+(gdLv()-1)*.05; gold=Math.round(gold*lvB); xp=Math.round(xp*lvB);
  g.cl=k; G.gold+=gold; gainXp(xp); if(typeof fgGive==="function") fgGive(ore,rune,"",true); else { G.ore=(G.ore||0)+ore; G.rune=(G.rune||0)+rune; } G.gdChest=(G.gdChest||0)+1; if(k>=3) G.gdFull=(G.gdFull||0)+1; saveGame();
  try{ LOOT.drop(P.x+1.2,P.z+1.2,Math.min(3,k)); }catch(e){} jingle([659,784,1046,1318,1568]); buzz([30,40,80]);
  toast(`🎁 기사단 상자 ${k}칸!`,`금화 +${fmt(gold)} · 경험치 +${fmt(xp)} · ⛓ +${ore}${rune?` · ✨ +${rune}`:""}`,3); showGuild(); }
/* ---------- 점수 붙이기 ---------- */
function gdMateNear(){ const g=gdMine(); if(!g) return false; for(const id in PEERS){ const o=PEERS[id]; if(gdMate(o)&&!o.dead&&Math.hypot(o.x-P.x,o.z-P.z)<30) return true; } return false; }
(function(){ const _km=killMob; killMob=function(m){ const g0=G.gold; _km(m); try{ if(G.gd){ const L=gdLv(); const dg=G.gold-g0; if(dg>0&&L>1) G.gold+=Math.round(dg*(L-1)*.01); gdAdd(m.boss||m.titan?10:1); } }catch(e){} };
  const _gx=gainXp; gainXp=function(n){ try{ if(G.gd&&n>0&&gdMateNear()) n=Math.round(n*1.1); }catch(e){} return _gx(n); };
  const _fc=fishCaught; fishCaught=function(g){ _fc(g); try{ gdAdd(5); }catch(e){} };
  const _df=dgFinish; dgFinish=function(){ const r=_df.apply(this,arguments); try{ gdAdd(30); }catch(e){} return r; };
  const _gi=grantIdle; grantIdle=function(){ const r=_gi(); try{ if(r&&r.mins>0&&G.gd){ const n=Math.min(120,Math.floor(r.mins/4)); if(n>0){ gdAdd(n); r.gdPts=n; saveGame(); setTimeout(()=>{ if(!layerOpen&&G.gd) toast(`🛡️ 쉬는 동안 기사단 임무 +${n}점`,gdName(G.gd.gn)+"에 보탰어요",3); },9500); } } }catch(e){} return r; }; })();
/* ---------- 수도의 기사단 게시판 + 깃대 ---------- */
function gdSpot(r){ const cap=REGIONS[r*3]; const inward=Math.atan2(-cap.z,-cap.x); const a=inward; return {x:cap.x+Math.cos(a)*24,z:cap.z+Math.sin(a)*24,rot:0}; }   // 카메라가 늘 북쪽을 보니 게시판은 남쪽(화면 쪽)을 봄
function gdBannerCanvas(){ const c=document.createElement("canvas"); c.width=128; c.height=192; return c; }
function gdDrawBanner(c){ const x=c.getContext("2d"); const g=gdMine(); x.clearRect(0,0,128,192);
  x.beginPath(); x.moveTo(4,4); x.lineTo(124,4); x.lineTo(124,160); x.lineTo(64,188); x.lineTo(4,160); x.closePath();
  if(!g){ x.fillStyle="#3a3350"; x.fill(); x.lineWidth=5; x.strokeStyle="#8d84aa"; x.stroke(); x.font="900 64px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillStyle="#d8d0f0"; x.fillText("?",64,80); x.font="900 15px sans-serif"; x.fillText("기사단",64,136); return; }
  const L=gdLv(); x.fillStyle=GD_COL[g.gf[0]]; x.fill(); x.lineWidth=L>=5?9:5; x.strokeStyle=L>=5?"#ffd24a":"rgba(255,255,255,.8)"; x.stroke();
  x.font="64px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(GD_SYM[g.gf[1]]||"🛡️",64,76);
  x.font="900 15px sans-serif"; x.fillStyle=g.gf[0]===9||g.gf[0]===2?"#201a10":"#fff"; x.fillText(GD_B[g.gn[1]]||"",64,128); x.font="800 12px sans-serif"; x.fillText("Lv."+L,64,148); if(L>=10){ x.font="26px sans-serif"; x.fillText("👑",64,22); } }
function gdDrawBoard(c){ const x=c.getContext("2d"); x.fillStyle="#6b4a2a"; x.fillRect(0,0,256,160); x.fillStyle="#f3e6c4"; x.fillRect(8,8,240,144);
  x.fillStyle="#5a3a1a"; x.font="900 19px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText("🛡️ 기사단 게시판",128,26);
  const R=gdRanking().slice(0,3); x.textAlign="left"; x.font="800 14px sans-serif";
  if(!R.length){ x.textAlign="center"; x.fillStyle="#7a6040"; x.fillText("첫 기사단을 만들어 보세요!",128,90); return; }
  R.forEach((q,i)=>{ const y=58+i*32; x.fillStyle=GD_COL[q.gf[0]]; x.fillRect(16,y-12,24,24); x.font="16px sans-serif"; x.textAlign="center"; x.fillText(GD_SYM[q.gf[1]]||"",28,y+1); x.textAlign="left"; x.fillStyle="#3a2a10"; x.font="800 13px sans-serif"; x.fillText(`${["🥇","🥈","🥉"][i]} ${gdName(q.gn)}`,46,y-4); x.font="700 11px sans-serif"; x.fillStyle="#7a6040"; x.fillText(`이번 주 ${fmt(q.w)}점 · ${q.m}명 · Lv.${q.lv}`,46,y+10); }); }
(function(){ const bnC=gdBannerCanvas(); const bnT=new THREE.CanvasTexture(bnC); const bdC=document.createElement("canvas"); bdC.width=256; bdC.height=160; const bdT=new THREE.CanvasTexture(bdC); GD.bnC=bnC; GD.bnT=bnT; GD.bdC=bdC; GD.bdT=bdT;
  const bnM=new THREE.MeshBasicMaterial({map:bnT,transparent:true,side:THREE.DoubleSide,alphaTest:.1}); const bdM=new THREE.MeshBasicMaterial({map:bdT});
  for(let r=0;r<4;r++){ const s=gdSpot(r); const g=new THREE.Group(); const wood=M.wood;
    g.add(cyl(.18,.2,3.6,wood,-2.1,1.8,0,8)); g.add(cyl(.18,.2,3.6,wood,2.1,1.8,0,8)); g.add(box(4.8,3,.25,wood,0,2.7,0)); const roof=box(5.4,.25,1.1,M.stone||wood,0,4.35,.1); roof.rotation.x=-.18; g.add(roof);
    const brd=new THREE.Mesh(new THREE.PlaneGeometry(4.4,2.75),bdM); brd.position.set(0,2.7,.14); brd.userData.noOutline=true; g.add(brd);
    const pole=cyl(.12,.14,8,M.gold||wood,3.6,4,0,8); g.add(pole); g.add(sph(.28,M.gold||wood,3.6,8.1,0));
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(2,3,6,1),bnM); fl.position.set(4.62,6.3,0); fl.userData.noOutline=true; g.add(fl); fl.castShadow=false;
    g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; g.scale.setScalar(1.3); scene.add(shadowify(g)); brd.castShadow=false; GD.board[r]={x:s.x,z:s.z,g,fl,base:fl.geometry.attributes.position.array.slice()}; } })();
function gdNear(){ if((typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)) return null; for(let r=0;r<4;r++){ const b=GD.board[r]; if(b&&Math.hypot(P.x-b.x,P.z-b.z)<6) return b; } return null; }
function gdRanking(){ const w=gdWeek(); const out=[]; const codes=new Set(Object.keys(GDO)); const g=gdMine(); if(g) codes.add(g.c);
  codes.forEach(c=>{ const L=gdMembers(c); if(!L.length) return; const meta=gdMeta(c); if(!meta||!meta.gn) return; out.push({c,gn:meta.gn,gf:meta.gf,w:L.reduce((s,d)=>s+(d.w===w?d.p||0:0),0),m:L.length,lv:gdLvOf(L.reduce((s,d)=>s+(d.a||0),0)),mine:g&&g.c===c}); });
  out.sort((a,b)=>b.w-a.w||b.lv-a.lv); return out; }
/* ---------- 매 프레임 ---------- */
function gdTick(dt){ if(!started) return; GD.t-=dt; GD.pubT-=dt; const g=gdMine();
  if(GD.pubT<=0){ GD.pubT=60; if(g&&(GD.dirty||!GD.seen)){ GD.seen=true; gdPub(); saveGame(); } }
  if(GD.t<=0){ GD.t=2; const bk=g?[g.c,g.gf.join(),g.gn.join(),gdLv()].join("|"):"none"; if(bk!==GD.bnKey){ GD.bnKey=bk; gdDrawBanner(GD.bnC); GD.bnT.needsUpdate=true; }
    let near=false; for(const b of GD.board) if(Math.hypot(P.x-b.x,P.z-b.z)<90) near=true; if(near){ const R=gdRanking().slice(0,3).map(q=>q.c+q.w+q.lv+q.m).join(); if(R!==GD.brdKey){ GD.brdKey=R; gdDrawBoard(GD.bdC); GD.bdT.needsUpdate=true; } } }
  const t=performance.now()/1000; for(const b of GD.board){ if(Math.hypot(P.x-b.x,P.z-b.z)>70) continue; const pa=b.fl.geometry.attributes.position; const a=pa.array; for(let i=0;i<a.length;i+=3){ const u=(b.base[i]+1)/2; a[i+2]=b.base[i+2]+Math.sin(t*3+u*4)*.22*u; } pa.needsUpdate=true; } }
/* ---------- 창 ---------- */
let GDPICK=null;
function showGuild(){ const g=gdMine(); if(!g) return gdShowJoin(); const L=gdMembers(g.c), w=gdWeek(); const lv=gdLv(), all=gdAllPts(g.c), nx=GD_LV[lv]||null; const T=gdTiers(g.c), tot=gdWeekPts(g.c); let k=0; while(k<3&&tot>=T[k]) k++;
  L.sort((a,b)=>((b.w===w?b.p:0)||0)-((a.w===w?a.p:0)||0));
  const rows=L.map((d,i)=>{ const on=d.me||!!PEERS[d.i]; const R=REALMS[d.r]||REALMS[0]; return `<div class="row"><div class="ic" style="color:${R.c1}">${i===0&&(d.w===w?d.p:0)>0?"🥇":R.icon}</div><div class="t"><div>${d.n}${d.me?" (나)":""}${d.i===g.b?" 👑":""} <i class="st ${on?"on":""}">${on?"접속 중":"💤 쉬는 중"}</i></div><span>${R.n} · Lv.${d.l||1} · 이번 주 ${fmt(d.w===w?d.p||0:0)}점</span></div></div>`; }).join("");
  const RK=gdRanking(); const myRank=RK.findIndex(q=>q.mine)+1;
  const rk=RK.slice(0,5).map((q,i)=>`<div class="row"><div class="ic"><span class="gdflag" style="background:${GD_COL[q.gf[0]]}">${GD_SYM[q.gf[1]]}</span></div><div class="t"><div>${i+1}위 ${gdName(q.gn)}${q.mine?" (우리)":""}</div><span>이번 주 ${fmt(q.w)}점 · ${q.m}명 · Lv.${q.lv}</span></div></div>`).join("");
  const canClaim=g.p>0&&k>g.cl;
  card(`<h2><span class="gdflag big" style="background:${GD_COL[g.gf[0]]}">${GD_SYM[g.gf[1]]}</span> ${gdName(g.gn)}</h2>
   <p>기사단 Lv.<b>${lv}</b> · 단원 ${L.length}/${GD_MAX}명 · 이번 주 순위 <b>${myRank||"-"}위</b></p>
   <div class="wdbar"><i style="width:${nx?Math.round(Math.min(1,(all-GD_LV[lv-1])/(nx-GD_LV[lv-1]))*100):100}%;background:linear-gradient(90deg,#8fd0ff,#5b5fe8)"></i><span>${nx?`기사단 경험치 ${fmt(all)} / ${fmt(nx)} · Lv.${lv+1}까지`:"최고 레벨! 전설의 기사단"}</span></div>
   <h3>📜 이번 주 기사단 임무</h3>
   <div class="wdbar" style="height:20px"><i style="width:${Math.round(Math.min(1,tot/T[2])*100)}%"></i><span>모두 함께 ${fmt(tot)} / ${fmt(T[2])}점</span></div>
   <div class="wdst three">${T.map((v,i)=>`<div class="${tot>=v?"on":""}"><b>${i<g.cl?"✅":tot>=v?"🎁":"🔒"}</b>${i+1}칸<br>${fmt(v)}점</div>`).join("")}</div>
   ${canClaim?`<button class="go" id="gdClaim" style="align-self:center">🎁 상자 받기</button>`:`<p style="font-size:12px">${g.p>0?(k>=3?"이번 주 상자를 모두 받았어요! 월요일에 새 임무가 와요.":"다음 칸을 채우면 상자를 받아요."):"괴물을 잡거나 낚시를 하면 점수가 쌓여요. 1점이라도 보태면 상자를 받을 수 있어요."}</p>`}
   <div class="idlegrid"><div><b>${fmt(Math.round(g.p))}</b><span>내가 이번 주에 보탠 점수</span></div><div><b>+${lv-1}%</b><span>금화 보너스 · 단원 곁에서 경험치 +10%</span></div></div>
   <p style="font-size:12px">점수: 괴물 1점 · 보스 10점 · 물고기 5점 · 미궁 정복 30점 · 게임을 꺼 둔 동안에도 4분마다 1점(하루 최대 120점)</p>
   <h3>🔑 초대 코드</h3><div class="exgrid"><button class="buy" id="gdCode" style="font-size:20px;letter-spacing:3px">${g.c}</button><button class="buy alt" id="gdCopy">코드 복사</button></div>
   <h3>🛡️ 단원</h3>${rows}
   <h3>🏆 이번 주 기사단 순위</h3>${rk||'<p style="font-size:13px">아직 다른 기사단이 없어요</p>'}
   <div class="exgrid" style="margin-top:8px">${gdCanEdit()?'<button class="buy alt" id="gdEdit">🎨 깃발 바꾸기</button>':'<button class="buy alt" disabled>깃발은 단장이 바꿔요</button>'}<button class="buy sell" id="gdLeave">기사단 나가기</button></div>`);
  if($("gdClaim")) $("gdClaim").onclick=gdClaim;
  const cp=()=>{ const s=`신들의 전쟁 기사단 「${gdName(g.gn)}」 초대 코드: ${g.c}`; (navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>toast("코드 복사됨!",g.c),()=>toast("초대 코드",g.c,3)); };
  $("gdCode").onclick=cp; $("gdCopy").onclick=cp;
  if($("gdEdit")) $("gdEdit").onclick=()=>gdShowMake(true);
  $("gdLeave").onclick=()=>{ card(`<h2>기사단을 나갈까요?</h2><p>${gdName(g.gn)}에서 나가요. 이번 주 내 점수는 기사단에 남지 않아요.</p><button class="go" id="gdYes" style="background:#ff5a5f;color:#fff">나가기</button>`); $("gdYes").onclick=()=>{ gdLeave(); showGuild(); }; }; }
function gdShowJoin(){ const RK=gdRanking();
  const list=RK.slice(0,12).map(q=>`<div class="row"><div class="ic"><span class="gdflag" style="background:${GD_COL[q.gf[0]]}">${GD_SYM[q.gf[1]]}</span></div><div class="t"><div>${gdName(q.gn)}</div><span>Lv.${q.lv} · ${q.m}/${GD_MAX}명 · 이번 주 ${fmt(q.w)}점</span></div><button class="buy" data-gj="${q.c}" ${q.m>=GD_MAX?"disabled":""}>${q.m>=GD_MAX?"꽉 참":"가입"}</button></div>`).join("");
  card(`<h2>🛡️ 신전 기사단</h2><p>친구들, 처음 만난 모험가와 함께 기사단을 만들어요. 세계가 달라도 같은 기사단이 될 수 있어요. 일주일마다 다 같이 <b>기사단 임무</b>를 채우면 모두 상자를 받고, 기사단 레벨이 올라 깃발이 멋있어져요.</p>
   <div class="exgrid"><button class="buy" id="gdMake">✨ 기사단 만들기</button><button class="buy alt" id="gdCodeGo">🔑 코드로 가입</button></div>
   <div class="chatin" id="gdCodeBox" style="margin-top:6px;display:none"><input class="inp" id="gdIn" maxlength="6" placeholder="6글자 코드" autocomplete="off" style="flex:1;width:auto;font-size:18px;text-align:center;letter-spacing:3px;text-transform:uppercase"><button class="buy" id="gdInGo">가입</button></div>
   <h3>지금 있는 기사단</h3>${list||'<p style="font-size:13px">아직 기사단이 없어요. 첫 기사단을 만들어 보세요!</p>'}
   <p style="font-size:12px">이름은 정해진 낱말을 골라서 지어요. 기사단 안에서는 정해진 인사말만 써서 처음 만난 사람과도 안전하게 놀 수 있어요.</p>`);
  $("gdMake").onclick=()=>gdShowMake(false); $("gdCodeGo").onclick=()=>{ $("gdCodeBox").style.display="flex"; $("gdIn").focus(); };
  const go=()=>{ if(gdJoin($("gdIn").value)) showGuild(); }; $("gdInGo").onclick=go; $("gdIn").onkeydown=e=>{ if(e.key==="Enter") go(); };
  layers.querySelectorAll("[data-gj]").forEach(b=>b.onclick=()=>{ if(gdJoin(b.dataset.gj)) showGuild(); }); }
function gdShowMake(edit){ const g=gdMine(); if(!GDPICK||GDPICK.edit!==edit) GDPICK={edit,gn:edit&&g?g.gn.slice():[Math.floor(Math.random()*12),Math.floor(Math.random()*12),0],gf:edit&&g?g.gf.slice():[Math.floor(Math.random()*8),Math.floor(Math.random()*6)]}; const P2=GDPICK; const lv=edit?gdLv():1;
  const chips=(arr,k)=>arr.map((s,i)=>`<button class="chip" data-k="${k}" data-v="${i}" style="${P2.gn[k]===i?"background:#ffcf4a;color:#201a10;border-color:#ffcf4a":""}">${s}</button>`).join("");
  card(`<h2>${edit?"🎨 깃발 바꾸기":"✨ 기사단 만들기"}</h2>
   <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin:4px 0 8px"><span class="gdflag big" style="background:${GD_COL[P2.gf[0]]}">${GD_SYM[P2.gf[1]]}</span><b style="font-size:19px">${gdName(P2.gn)}</b></div>
   <h3>① 꾸밈말</h3><div class="chips">${chips(GD_A,0)}</div><h3>② 상징 동물</h3><div class="chips">${chips(GD_B,1)}</div><h3>③ 무리 이름</h3><div class="chips">${chips(GD_C,2)}</div>
   <h3>④ 깃발 색</h3><div class="chips">${GD_COL.map((c,i)=>`<button class="sw" data-c="${i}" style="background:${c};${P2.gf[0]===i?"border-color:#ffcf4a;transform:scale(1.15)":""}"></button>`).join("")}</div>
   <h3>⑤ 문양</h3><div class="chips">${GD_SYM.map((s,i)=>`<button class="chip" data-s="${i}" ${GD_SYMLV[i]>lv?"disabled":""} style="font-size:18px;${P2.gf[1]===i?"background:#ffcf4a;border-color:#ffcf4a":""}${GD_SYMLV[i]>lv?";opacity:.35":""}">${GD_SYMLV[i]>lv?"🔒":s}</button>`).join("")}</div>
   <p style="font-size:12px">🔒 문양은 기사단 레벨이 오르면 열려요.</p>
   <button class="go" id="gdOk" style="align-self:center">${edit?"이렇게 바꾸기":"이 이름으로 만들기"}</button>`);
  layers.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{ P2.gn[+b.dataset.k]=+b.dataset.v; tone(700,.04); gdShowMake(edit); });
  layers.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{ P2.gf[0]=+b.dataset.c; tone(760,.04); gdShowMake(edit); });
  layers.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{ if(b.disabled) return; P2.gf[1]=+b.dataset.s; tone(820,.04); gdShowMake(edit); });
  $("gdOk").onclick=()=>{ if(edit){ const g2=gdMine(); if(!g2) return; g2.gn=P2.gn.slice(); g2.gf=P2.gf.slice(); g2.ft=Date.now(); saveGame(); gdPub(); GD.bnKey=""; GD.brdKey=""; try{ net.hello(); }catch(e){} toast("깃발을 바꿨어요!",gdName(g2.gn),2); GDPICK=null; showGuild(); }
    else { gdCreate(P2.gn.slice(),P2.gf.slice()); GDPICK=null; showGuild(); } }; }
/* ---------- 상황 버튼 · 칭호 · 팁 ---------- */
CTX_EXTRA.push(()=>gdNear()?{t:"🛡️ 기사단 게시판",f:showGuild}:null);
TITLES.push({id:"gd1",n:"기사단의 일원",t:1,h:"기사단 만들거나 들어가기",g:()=>[G.gd||G.gdMade||G.gdJoin?1:0,1]},{id:"gdc",n:"기사단 상자 사냥꾼",t:2,h:"기사단 상자 10번 받기",g:()=>[G.gdChest||0,10]},{id:"gdf",n:"원탁의 영웅",t:3,h:"주간 기사단 임무 3칸 모두 채우기",g:()=>[Math.min(1,G.gdFull||0),1]});
</script>
