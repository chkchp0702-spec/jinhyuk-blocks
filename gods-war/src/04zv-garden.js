<script>
/* ================= v103-1: 🌱 데메테르의 씨앗 밭 — 꺼 둬도 자라는 내 밭과 날씨 변신 (IDEAS G11/10-1) =================
   내 신전 섬(04k-home) 길 양옆에 밭 4칸(Lv30 5칸 · Lv60 6칸). 씨앗을 심으면 게임을 꺼 둬도 시간이 흐르며 자람(1~8시간).
   🔮 마법 날씨: 40분 칸마다 절반쯤 「⚡ 번개 비 · 🌈 무지개 · 🌠 별똥별」 중 하나가 8분 동안 옴(한국 시간·날짜로 정해져 모든 폰이 같음).
      작물이 자라는 동안 마법 날씨가 지나가면 정해진 확률로 ⚡번개·🌈무지개·🌠별빛 작물로 변신(확률은 창에 공개, 돈과 상관없음).
      변신 여부는 심은 시각 + 날씨 시각으로 계산 → 게임을 꺼 둔 동안 온 날씨도 똑같이 셈.
   💧 물 주기: 다른 사람(처음 보는 사람도) 밭에 하루 5번(같은 사람은 하루 1번). 그 밭의 자라는 작물이 모두 10분 빨리 자람 + 주인에게 하트.
      보관(retained) gn/<id> = 내 밭 모습 {i,n,r,p:[[씨앗,심은시각,당긴ms]|0],h,t} · gnw/<주인>/<준 사람> = {ts,n,d}
      주인 폰이 켜지면 받은 물을 밭에 더하고 "○○ 님이 물을 줬어요 💧".
   씨앗: 매일 무료 3개 · 괴물 4%(보스 40%) · 낚시 15% · 거둘 때 25% 다시 · 씨앗 가게(금화, 앞 6종).
   거두기: 2~4개 → 금화·경험치(변신 ×3·×5·×8) · 변신하면 ✨ 룬 가루. 작물 도감 32칸(8종 × 보통·⚡·🌈·🌠).
   저장: G.gn={p:[{s,t0,w}|null],sd:[8],dex:{},hv,mu,fd,wd:{d,n,who},ws:{},hearts,wg}. 칭호 4개. */
const GN_CROPS=[
 {n:"생명나무 사과",ic:"🍎",h:1,c:0xe8423a,v:40,buy:1},
 {n:"황금 밀",ic:"🌾",h:1.5,c:0xf0c040,v:55,buy:1},
 {n:"무지개 당근",ic:"🥕",h:2,c:0xff8a2a,v:70,buy:1},
 {n:"아테나 올리브",ic:"🫒",h:3,c:0x7a9a3a,v:100,buy:1},
 {n:"연꽃 망고",ic:"🥭",h:4,c:0xffb030,v:130,buy:1},
 {n:"해님 해바라기",ic:"🌻",h:5,c:0xffd020,v:160,buy:1},
 {n:"별빛 호박",ic:"🎃",h:6,c:0xff7a20,v:200,buy:0},
 {n:"구름 포도",ic:"🍇",h:8,c:0x9a5ae0,v:260,buy:0} ];
const GN_MUT=[{n:"번개",ic:"⚡",mul:3,p:.45,c:0x8fe6ff,css:"#8fe6ff"},{n:"무지개",ic:"🌈",mul:5,p:.3,c:0xff8ad8,css:"#ff9ae0"},{n:"별빛",ic:"🌠",mul:8,p:.22,c:0xfff2a0,css:"#fff2a0"}];
const GN_WX=[{n:"번개 비",ic:"⚡",d:"번쩍번쩍 파란 번개 비"},{n:"무지개",ic:"🌈",d:"하늘에 커다란 무지개"},{n:"별똥별",ic:"🌠",d:"반짝 별똥별이 쏟아져요"}];
const GN_POS=[[-3.3,5.2],[3.3,5.2],[-3.3,8.4],[3.3,8.4],[-3.3,11.4],[3.3,11.4]];
const GN_BLOCK=40*60000, GN_LEN=8*60000, GN_WATER=10*60000, GN_WDAY=5;
const GN={g:null,owner:null,key:"",t:0,pubT:3,dirty:true,lbls:[],wq:[],wqT:0,wx:-1,rain:null,sky:null,starT:0,boltT:3,readyTold:false,seedT:0};
const GNO={};
function gnH(a,b){ let h=Math.imul((a|0)^0x9e3779b9,0x85ebca6b)^Math.imul((b|0)+0x632be5ab,0xc2b2ae35); h^=h>>>15; h=Math.imul(h,0x27d4eb2f); h^=h>>>13; return (h>>>0)/4294967296; }
function gnData(){ const g=G.gn=G.gn||{}; if(!Array.isArray(g.p)) g.p=[]; while(g.p.length<GN_POS.length) g.p.push(null); if(!Array.isArray(g.sd)||g.sd.length!==GN_CROPS.length){ const o=Array.isArray(g.sd)?g.sd:[]; g.sd=GN_CROPS.map((c,i)=>o[i]||0); if(!g.init){ g.init=1; g.sd[0]+=3; g.sd[1]+=2; } } g.dex=g.dex||{}; g.ws=g.ws||{}; return g; }
function gnSlots(){ return 4+(G.lv>=30?1:0)+(G.lv>=60?1:0); }
function gnGrowMs(s){ return GN_CROPS[s].h*3600000; }
function gnReadyAt(p){ return p.t0+gnGrowMs(p.s)-(p.w||0); }
function gnProg(p,now){ const g=gnGrowMs(p.s); return clamp(((now||Date.now())-p.t0+(p.w||0))/g,0,1); }
/* ---------- 🔮 마법 날씨 (모든 폰 같음) ---------- */
function gnBlk(t){ return Math.floor((t+9*3600000)/GN_BLOCK); }
function gnWxOf(b){ if(gnH(b,77)<.5) return null; const r=gnH(b,31); const k=r<.45?0:r<.8?1:2; const s=b*GN_BLOCK-9*3600000+Math.floor(gnH(b,13)*30)*60000; return {k,s,e:s+GN_LEN,b}; }
function gnWxNow(t){ t=t||Date.now(); const w=gnWxOf(gnBlk(t)); return w&&t>=w.s&&t<w.e?w:null; }
function gnWxNext(t){ t=t||Date.now(); for(let b=gnBlk(t);b<gnBlk(t)+40;b++){ const w=gnWxOf(b); if(w&&w.e>t) return w; } return null; }
function gnMutOf(p,now){ const end=Math.min(gnReadyAt(p),now||Date.now()); let best=-1; if(end<=p.t0) return -1;
  for(let b=gnBlk(p.t0);b<=gnBlk(end);b++){ const w=gnWxOf(b); if(!w||w.e<=p.t0||w.s>=end) continue; if(gnH(Math.floor(p.t0/1000),Math.floor(w.s/60000))<GN_MUT[w.k].p) best=Math.max(best,w.k); } return best; }
function gnHM(t){ const d=new Date(t+9*3600000); return `${d.getUTCHours()}:${String(d.getUTCMinutes()).padStart(2,"0")}`; }
function gnLeft(ms){ ms=Math.max(0,ms); const m=Math.ceil(ms/60000); return m>=60?`${Math.floor(m/60)}시간 ${m%60?m%60+"분":""}`.trim():`${m}분`; }
/* ---------- 씨앗 얻기 ---------- */
function gnSeedPick(rare){ const w=GN_CROPS.map((c,i)=>i<6?(6-i)*1.0:rare?2.2:.7); let r=Math.random()*w.reduce((a,b)=>a+b,0); for(let i=0;i<w.length;i++){ r-=w[i]; if(r<=0) return i; } return 0; }
function gnGiveSeed(s,n,why){ const g=gnData(); g.sd[s]=(g.sd[s]||0)+(n||1); GN.dirty=true; if(why&&!layerOpen) floatDmg(P.x,4.6,P.z,`🌱 ${GN_CROPS[s].ic} 씨앗 +${n||1}`,"gain"); }
function gnDaily(){ const g=gnData(), d=kday(); if(g.fd===d) return null; g.fd=d; const got=[gnSeedPick(true),gnSeedPick(false),gnSeedPick(false)]; got.forEach(s=>g.sd[s]++); saveGame(); return got; }
(function(){ const _km=killMob; killMob=function(m){ _km(m); try{ if(m.war||m.titan||m.arena||!started) return; if(Math.random()<(m.boss?.4:.04)) gnGiveSeed(gnSeedPick(!!m.boss),1,true); }catch(e){} }; })();
(function(){ if(typeof fishCaught!=="function") return; const _fc=fishCaught; fishCaught=function(g){ _fc(g); try{ if(Math.random()<.15) gnGiveSeed(gnSeedPick(false),1,true); }catch(e){} }; })();
/* ---------- 심기 · 거두기 ---------- */
function gnPlant(i,s){ const g=gnData(); if(i>=gnSlots()||g.p[i]) return; if((g.sd[s]||0)<=0){ toast("그 씨앗이 없어요",null,1.4); return; } g.sd[s]--; g.p[i]={s,t0:Date.now(),w:0}; GN.dirty=true; saveGame();
  jingle([523,659,784]); buzz(15); if(GN.g&&GN.owner===G.id){ const q=GN_POS[i]; fxSpark(HM.cx+q[0],.8,HM.cz+q[1],0x9dffb8,12); }
  toast(`🌱 ${GN_CROPS[s].ic} ${GN_CROPS[s].n}을(를) 심었어요`,`${gnLeft(gnGrowMs(s))} 뒤에 다 자라요 · 게임을 꺼 둬도 자라요`,2.6); }
function gnHarvest(i){ const g=gnData(), p=g.p[i]; if(!p) return; const now=Date.now(); if(gnReadyAt(p)>now){ toast("🌱 아직 자라는 중이에요",`${gnLeft(gnReadyAt(p)-now)} 남았어요`,1.6); return; }
  const C=GN_CROPS[p.s], mu=gnMutOf(p,now), mul=mu>=0?GN_MUT[mu].mul:1; const cnt=2+Math.floor(gnH(Math.floor(p.t0/1000),5)*3);
  const gold=Math.round(C.v*cnt*mul*(1+G.lv*.04)), xp=Math.round(xpNeed(G.lv)*.004*C.h*mul)+10; G.gold+=gold; gainXp(xp);
  const key=p.s+"_"+mu, isNew=!g.dex[key]; g.dex[key]=1; g.hv=(g.hv||0)+1; if(mu>=0){ g.mu=(g.mu||0)+1; G.rune=(G.rune||0)+mu+1; }
  let back=""; if(Math.random()<.25){ g.sd[p.s]++; back=` · ${C.ic} 씨앗 +1`; }
  g.p[i]=null; GN.dirty=true; saveGame();
  try{ COINFLY.burst(P.x,1.6,P.z,mu>=0?9:5); }catch(e){} buzz([20,20,40]);
  if(GN.g&&GN.owner===G.id){ const q=GN_POS[i]; fxSpark(HM.cx+q[0],1,HM.cz+q[1],mu>=0?GN_MUT[mu].c:C.c,mu>=0?28:14); fxRing(HM.cx+q[0],HM.cz+q[1],mu>=0?GN_MUT[mu].c:0xffe08a,3,.5); }
  const name=(mu>=0?GN_MUT[mu].ic+" "+GN_MUT[mu].n+" ":"")+C.n; const sub=`${C.ic}×${cnt} · 금화 +${fmt(gold)} · 경험치 +${fmt(xp)}${mu>=0?` · ✨ 룬 가루 +${mu+1}`:""}${back}${isNew?" · 📖 도감 새 칸!":""}`;
  if(mu>=0||isNew){ jingle(mu>=0?[659,880,1046,1318,1568]:[523,659,784,1046]); try{ lvBanner(mu>=0?`${GN_MUT[mu].ic} 날씨 변신 작물!`:"📖 처음 거둔 작물!",name,sub,mu>=0?GN_MUT[mu].css:"#9dffb8"); }catch(e){ toast("🧺 "+name,sub,3); } }
  else { jingle([523,659,784]); toast(`🧺 ${name} 거뒀어요!`,sub,2.6); } }
function gnHarvestAll(){ const g=gnData(); let n=0; for(let i=0;i<gnSlots();i++){ const p=g.p[i]; if(p&&gnReadyAt(p)<=Date.now()){ gnHarvest(i); n++; } } return n; }
/* ---------- 💧 물 주기 ---------- */
function gnWDay(){ const g=gnData(), d=kday(); if(!g.wd||g.wd.d!==d) g.wd={d,n:0,who:{}}; return g.wd; }
function gnGrowing(rec){ const now=Date.now(); return (rec.p||[]).filter(q=>q&&q[1]+GN_CROPS[q[0]].h*3600000-(q[2]||0)>now).length; }
function gnCanWater(id){ const W=gnWDay(); return id!==G.id&&W.n<GN_WDAY&&!W.who[id]; }
function gnWater(id){ const rec=GNO[id]; if(!rec||!gnCanWater(id)) return; if(!gnGrowing(rec)){ toast("그 밭은 지금 자라는 작물이 없어요",null,1.6); return; }
  const W=gnWDay(); W.n++; W.who[id]=1; const g=gnData(); g.wg=(g.wg||0)+1; try{ net.pushRet("gnw/"+id+"/"+G.id,{ts:Date.now(),n:G.name,d:kday()}); }catch(e){}
  (rec.p||[]).forEach(q=>{ if(q) q[2]=(q[2]||0)+GN_WATER; }); const gold=25+G.lv*2, xp=Math.round(xpNeed(G.lv)*.003)+5; G.gold+=gold; gainXp(xp); saveGame();
  if(GN.g&&GN.owner===id){ GN.key=""; (rec.p||[]).forEach((q,i)=>{ if(q){ const s=GN_POS[i]; fxSpark(HM.cx+s[0],1.2,HM.cz+s[1],0x7ad8ff,10); } }); }
  jingle([784,988,1175]); buzz(15); toast(`💧 ${rec.n}님 밭에 물을 줬어요!`,`작물이 10분 빨리 자라요 · 금화 +${gold} · 경험치 +${fmt(xp)} · 오늘 ${W.n}/${GN_WDAY}`,2.4); }
function gnPub(){ if(G.realm<0) return; const g=gnData(); try{ net.pushRet("gn/"+G.id,{i:G.id,n:G.name,r:G.realm,p:g.p.slice(0,gnSlots()).map(p=>p?[p.s,p.t0,p.w||0]:0),h:g.hearts||0,t:Date.now()}); GN.dirty=false; }catch(e){} }
NETX.push({sub:"gn/+",pre:"gn/",f:d=>{ if(!d||!d.i||d.i===G.id||!REALMS[d.r]||!Array.isArray(d.p)) return; const o=GNO[d.i]; if(o&&o.t>d.t) return; d.p=d.p.slice(0,GN_POS.length).map(q=>Array.isArray(q)&&GN_CROPS[q[0]]?[q[0]|0,+q[1]||0,+q[2]||0]:0); GNO[d.i]=d; if(GN.owner===d.i) GN.key=""; }});
NETX.push({sub:()=>"gnw/"+G.id+"/+",pre:"gnw/",f:(d,topic)=>{ const a=String(topic).split("/"); if(a[1]!==G.id) return; const who=a[2]; if(!who||who===G.id||!d||!d.ts) return; const g=gnData(); if((g.ws[who]||0)>=d.ts) return; if(Date.now()-d.ts>3*86400000){ g.ws[who]=d.ts; return; }
  g.ws[who]=d.ts; let n=0; g.p.forEach(p=>{ if(p&&gnReadyAt(p)>Date.now()){ p.w=(p.w||0)+GN_WATER; n++; } }); g.hearts=(g.hearts||0)+1; GN.dirty=true; GN.key=""; saveGame(); GN.wq.push({n:String(d.n||"누군가").slice(0,8),k:n}); GN.wqT=1.5; }});
function gnWaterToast(){ const L=GN.wq.splice(0); if(!L.length) return; const names=[...new Set(L.map(x=>x.n))]; jingle([784,988,1175,1568]); buzz([15,20,15]);
  toast(`💧 ${names.slice(0,3).join(" · ")}${names.length>3?` 외 ${names.length-3}명`:""}님이 내 밭에 물을 줬어요!`,`💖 하트 +${L.length} · 자라는 작물이 ${L.length*10}분 빨리 자라요`,3.2); }
/* ---------- 신전 섬의 밭 (3D) ---------- */
const GNM={};
function gnMat(k,o){ return GNM[k]||(GNM[k]=mat(o)); }
function gnPlantMesh(s,prog,mu){ const C=GN_CROPS[s], g=new THREE.Group(); const leaf=gnMat("leaf",{color:0x4fae4a,roughness:.8}), stem=gnMat("stem",{color:0x3f8a3a,roughness:.9});
  if(prog<.25){ const sp=new THREE.Mesh(GEO.cone,leaf); sp.scale.set(.25,.4+prog*1.2,.25); sp.position.y=.3; g.add(sp); [-1,1].forEach(k=>{ const l=sph(.13,leaf,k*.14,.4,0); l.scale.set(1.4,.5,.9); g.add(l); }); return g; }
  const h=.5+prog*1.1; g.add(cyl(.05,.07,h,stem,0,.15+h/2,0,6)); for(let k=0;k<3;k++){ const l=sph(.2,leaf,Math.cos(k*2.1)*.22,.3+h*(.35+k*.2),Math.sin(k*2.1)*.22); l.scale.set(1.5,.45,.9); l.rotation.y=k*2.1; g.add(l); }
  if(prog>=1){ const fm=mu>=0?new THREE.MeshStandardMaterial({color:C.c,emissive:GN_MUT[mu].c,emissiveIntensity:.55,roughness:.4,metalness:.2}):gnMat("crop"+s,{color:C.c,roughness:.5});
    const n=s===1?5:3; for(let k=0;k<n;k++){ const f=sph(s===6?.34:s===7?.13:.2,fm,Math.cos(k*2.4)*.28,.35+h*.75+(k%2)*.12,Math.sin(k*2.4)*.28); if(s===1) f.scale.set(.6,1.8,.6); g.add(f); if(s===7) for(let j=0;j<4;j++) g.add(sph(.12,fm,f.position.x+Math.cos(j*1.6)*.12,f.position.y-.12-(j%2)*.1,f.position.z+Math.sin(j*1.6)*.12)); }
    if(s===5){ const fl=cyl(.4,.4,.08,gnMat("sunf",{color:0xffd020,roughness:.5}),0,.3+h,.1,14); fl.rotation.x=1.2; g.add(fl); g.add(sph(.18,gnMat("sunc",{color:0x6a3a1a}),0,.32+h,.15)); }
    if(mu>=0){ const r=new THREE.Mesh(GEO.ring,glowMat(GN_MUT[mu].c,.55)); r.rotation.x=-Math.PI/2; r.scale.setScalar(1.2); r.position.y=.15; r.userData.noOutline=true; r.userData.gspin=1; g.add(r); const o=sph(.12,glowMat(GN_MUT[mu].c,.9),0,h+1.1,0); o.userData.noOutline=true; o.userData.gbob=1; g.add(o); }
    else { const sp=sph(.08,glowMat(0xfff2a0,.8),0,h+.9,0); sp.userData.noOutline=true; sp.userData.gbob=1; g.add(sp); } }
  return g; }
function gnBuild3D(){ if(GN.g){ try{ GN.g.parent&&GN.g.parent.remove(GN.g); }catch(e){} GN.g=null; } if(!HM.on||!HM.g||!HM.data) return; const owner=HM.data.i; const mine=owner===G.id;
  const rec=mine?{p:gnData().p.map(p=>p?[p.s,p.t0,p.w||0]:0)}:GNO[owner]; const slots=mine?gnSlots():Math.max(4,(rec&&rec.p?rec.p.length:4));
  const g=new THREE.Group(); const soil=gnMat("soil",{color:0x6a4a30,roughness:1}), soil2=gnMat("soil2",{color:0x58391f,roughness:1}), wood=gnMat("gwood",{color:0x9a6a3a,roughness:.9}), now=Date.now();
  GN.plots=[]; for(let i=0;i<slots&&i<GN_POS.length;i++){ const [x,z]=GN_POS[i]; const pl=new THREE.Group(); pl.position.set(x,0,z); pl.add(box(2.3,.22,2.3,wood,0,.11,0)); pl.add(box(2,.26,2,soil,0,.14,0)); for(let k=-1;k<=1;k+=2) pl.add(box(1.8,.06,.25,soil2,0,.29,k*.45));
    const q=rec&&rec.p?rec.p[i]:0; let st="empty", mu=-1;
    if(q){ const p={s:q[0],t0:q[1],w:q[2]}; const pr=gnProg(p,now); mu=pr>=1?gnMutOf(p,now):-1; st=pr>=1?"ready":"grow"; const pm=gnPlantMesh(p.s,pr,mu); pm.position.y=.2; pl.add(pm); }
    else if(mine){ const m=new THREE.Mesh(new THREE.RingGeometry(.55,.75,24),glowMat(0x9dffb8,.35)); m.rotation.x=-Math.PI/2; m.position.y=.32; m.userData.noOutline=true; m.userData.gpulse=1; pl.add(m); }
    g.add(pl); GN.plots.push({x,z,st,q,mu}); }
  if(mine&&slots<GN_POS.length){ for(let i=slots;i<GN_POS.length;i++){ const [x,z]=GN_POS[i]; const pl=box(2.3,.18,2.3,gnMat("lock",{color:0xb8a888,roughness:1}),x,.09,z); g.add(pl); } }
  shadowify(g); HM.g.add(g); GN.g=g; GN.owner=owner; }
(function(){ const _hb=hmBuild; hmBuild=function(){ _hb(); try{ GN.key=""; gnBuild3D(); }catch(e){ console.warn(e); } }; })();
function gnKey(){ if(!HM.on||!HM.data) return ""; const owner=HM.data.i, mine=owner===G.id, now=Date.now(); const rec=mine?{p:gnData().p.map(p=>p?[p.s,p.t0,p.w||0]:0)}:GNO[owner];
  return owner+"|"+(mine?gnSlots():"")+"|"+(rec&&rec.p?rec.p.map(q=>{ if(!q) return 0; const p={s:q[0],t0:q[1],w:q[2]}; const pr=gnProg(p,now); return q[0]+":"+Math.floor(pr*6)+":"+(pr>=1?gnMutOf(p,now):-2); }).join(","):"x"); }
function gnPlotCtx(){ if(!HM.on||!GN.plots||!HM.data) return null; const mine=HM.data.i===G.id; let best=null,bd=2.1;
  GN.plots.forEach((p,i)=>{ const d=Math.hypot(P.x-(HM.cx+p.x),P.z-(HM.cz+p.z)); if(d<bd){ bd=d; best={i,p}; } }); if(!best) return null; const {i,p}=best;
  if(mine){ if(p.st==="ready") return {t:`🧺 거두기 · ${p.mu>=0?GN_MUT[p.mu].ic:""}${GN_CROPS[p.q[0]].ic}`,f:()=>{ gnHarvest(i); GN.key=""; }};
    if(p.st==="grow"){ const q=p.q; return {t:`🌱 ${GN_CROPS[q[0]].ic} ${gnLeft(q[1]+gnGrowMs(q[0])-(gnData().p[i]?gnData().p[i].w||0:0)-Date.now())} 남음`,f:showGarden}; }
    return {t:"🌱 씨앗 심기",f:()=>gnSeedCard(i)}; }
  const id=HM.data.i; if(p.st==="grow"&&gnCanWater(id)) return {t:"💧 물 주기",f:()=>gnWater(id)}; return null; }
CTX_EXTRA.push(gnPlotCtx);
/* ---------- 🔮 날씨 그림 ---------- */
function gnRainMk(){ const N=HIGH()?320:160, geo=new THREE.BufferGeometry(), a=new Float32Array(N*6); geo.setAttribute("position",new THREE.BufferAttribute(a,3));
  const m=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xc8ecff,transparent:true,opacity:.7,fog:false,depthWrite:false})); m.frustumCulled=false; m.userData.noOutline=true; m.userData.v=[]; for(let i=0;i<N;i++) m.userData.v.push([rnd(-22,22),rnd(0,18),rnd(-22,22)]); scene.add(m); return m; }
function gnSkyEl(){ if(GN.sky) return GN.sky; const d=document.createElement("div"); d.id="gnSky"; d.innerHTML='<i class="bow"></i><i class="st"></i><i class="st"></i><i class="st"></i><i class="st"></i>'; document.body.appendChild(d); GN.sky=d; return d; }
function gnWxTick(dt){ const w=gnWxNow(), away=(typeof DG!=="undefined"&&DG.on)||(typeof xzOn==="function"&&!!xzOn()); const k=w&&!away&&started?w.k:-1;
  if(w&&w.b!==GN.wx){ GN.wx=w.b; if(started&&!layerOpen&&!P.dead){ const g=gnData(); const grow=g.p.some(p=>p&&gnReadyAt(p)>Date.now()); toast(`${GN_WX[w.k].ic} 마법 날씨 — ${GN_WX[w.k].n}!`,grow?`8분 동안 · 자라는 작물이 ${GN_MUT[w.k].ic}${GN_MUT[w.k].n} 작물로 변할 수 있어요 (${Math.round(GN_MUT[w.k].p*100)}%)`:"8분 동안 · 밭에 씨앗을 심어 두면 날씨 변신 작물이 생길 수 있어요",3.4); jingle([659,880,1175]); } }
  const sk=gnSkyEl(); const cls=k<0?"":["rain","bow","star"][k]; if(sk._c!==cls){ sk._c=cls; sk.className=cls; }
  // 번개 비 — 내 둘레에 파란 빗줄기 + 가끔 번개
  if(k===0){ if(!GN.rain) GN.rain=gnRainMk(); GN.rain.visible=true; const R=GN.rain, a=R.geometry.attributes.position.array, base=hAt(P.x,P.z); R.userData.v.forEach((v,i)=>{ v[1]-=dt*26; if(v[1]<0){ v[1]=rnd(12,18); v[0]=rnd(-22,22); v[2]=rnd(-22,22); } const x=P.x+v[0], y=base+v[1], z=P.z+v[2]; a[i*6]=x; a[i*6+1]=y; a[i*6+2]=z; a[i*6+3]=x+.12; a[i*6+4]=y+1.3; a[i*6+5]=z; }); R.geometry.attributes.position.needsUpdate=true;
    GN.boltT-=dt; if(GN.boltT<=0){ GN.boltT=rnd(5,10); try{ fxBolt(P.x+rnd(-20,20),P.z+rnd(-20,20),0x8fe6ff); WEATHER.flash=Math.max(WEATHER.flash,.7); }catch(e){} } }
  else if(GN.rain) GN.rain.visible=false;
  // 별똥별 — 땅에도 가끔 반짝 별가루
  if(k===2){ GN.starT-=dt; if(GN.starT<=0){ GN.starT=rnd(.6,1.4); fxSpark(P.x+rnd(-14,14),rnd(.5,3),P.z+rnd(-14,14),0xfff2a0,8); } } }
/* ---------- 매 프레임 ---------- */
function gnTick(dt){ if(!started||G.realm<0) return; const g=gnData(); gnWxTick(dt);
  if(GN.wqT>0){ GN.wqT-=dt; if(GN.wqT<=0){ if(!layerOpen&&!P.dead) gnWaterToast(); else GN.wqT=1; } }
  GN.pubT-=dt; if(net.up>0&&(GN.pubT<=0||(GN.dirty&&GN.pubT<290))){ GN.pubT=300; gnPub(); }
  GN.t-=dt; if(GN.t<=0){ GN.t=1;
    if(!GN.seedT){ GN.seedT=1; const got=gnDaily(); if(got) setTimeout(()=>{ if(!layerOpen) toast("🌱 오늘의 무료 씨앗 3개!",got.map(s=>GN_CROPS[s].ic+" "+GN_CROPS[s].n).join(" · ")+" · 메뉴 → 데메테르의 씨앗 밭",3); },9000); }
    if(!GN.readyTold&&!layerOpen&&!P.dead){ const n=g.p.filter((p,i)=>p&&i<gnSlots()&&gnReadyAt(p)<=Date.now()).length; if(n){ GN.readyTold=true; toast(`🧺 밭에 작물이 ${n}개 다 자랐어요!`,"메뉴 → 데메테르의 씨앗 밭에서 거두기",2.6); } }
    if(HM.on){ const k=gnKey(); if(k!==GN.key){ GN.key=k; gnBuild3D(); } } else if(GN.g){ GN.g=null; GN.plots=null; } }
  if(GN.g&&HM.on){ const tn=performance.now()/1000; GN.g.traverse(o=>{ const u=o.userData; if(u.gspin) o.rotation.z+=dt*1.2; if(u.gbob){ o.position.y+=Math.sin(tn*2.6+o.id)*dt*.35; } if(u.gpulse&&o.material) o.material.opacity=.25+Math.sin(tn*3+o.id)*.15; });
    while(GN.lbls.length<GN_POS.length) GN.lbls.push(makeLabel("ally"));
    const near=(GN.plots||[]).map((p,i)=>({i,d:Math.hypot(P.x-(HM.cx+p.x),P.z-(HM.cz+p.z))})).filter(x=>x.d<7).sort((a,b)=>a.d-b.d).slice(0,3).map(x=>x.i);
    GN.lbls.forEach((l,i)=>{ const p=GN.plots&&GN.plots[i]; if(!p||layerOpen||near.indexOf(i)<0||p.st==="empty"&&HM.data.i!==G.id){ l.style.display="none"; return; }
      const q=p.q; let h; if(p.st==="empty") h="🌱 빈 밭"; else if(p.st==="ready") h=`${p.mu>=0?`<b style="color:${GN_MUT[p.mu].css}">${GN_MUT[p.mu].ic}${GN_MUT[p.mu].n}</b> `:""}${GN_CROPS[q[0]].ic} <b>다 자랐어요!</b>`; else h=`${GN_CROPS[q[0]].ic} ${gnLeft(q[1]+gnGrowMs(q[0])-(q[2]||0)-Date.now())}`;
      placeLabel(l,HM.cx+p.x,2.6,HM.cz+p.z,h); }); }
  else GN.lbls.forEach(l=>l.style.display="none"); }
XTICK.push(gnTick);
/* ---------- 창 ---------- */
function gnSeedCard(i){ const g=gnData(); const have=GN_CROPS.map((C,s)=>({C,s})).filter(x=>g.sd[x.s]>0);
  card(`<h2>🌱 어떤 씨앗을 심을까요?</h2><p style="font-size:13px">밭 ${i+1}번 칸 · 게임을 꺼 둬도 자라요. 자라는 동안 🔮 마법 날씨가 오면 날씨 변신 작물이 될 수 있어요!</p>
   ${have.length?`<div class="exgrid">${have.map(x=>`<button class="buy" data-s="${x.s}">${x.C.ic} ${x.C.n}<br><small>${gnLeft(gnGrowMs(x.s))} · ${g.sd[x.s]}개</small></button>`).join("")}</div>`:`<p>씨앗이 없어요. 씨앗 가게에서 사거나 괴물·낚시에서 모아요.</p>`}
   <div style="display:flex;gap:8px;justify-content:center"><button class="buy alt" id="gnShop">🛒 씨앗 가게</button><button class="buy alt" id="gnBack">↩ 밭 보기</button></div>`);
  layers.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{ gnPlant(i,+b.dataset.s); GN.key=""; showGarden(); });
  $("gnShop").onclick=()=>gnShop(i); $("gnBack").onclick=showGarden; }
function gnPrice(s){ return Math.round(GN_CROPS[s].v*.9*(1+G.lv*.02)); }
function gnShop(back){ const g=gnData();
  card(`<h2>🛒 데메테르의 씨앗 가게</h2><p style="font-size:13px">금화로 씨앗을 사요(진짜 돈 없음). 🎃 별빛 호박 · 🍇 구름 포도 씨앗은 괴물·낚시·매일 선물에서만 나와요.</p>
   <div class="exgrid">${GN_CROPS.map((C,s)=>C.buy?`<button class="buy" data-b="${s}" ${G.gold<gnPrice(s)?"disabled":""}>${C.ic} ${C.n}<br><small>🪙 ${fmt(gnPrice(s))} · 가진 것 ${g.sd[s]}</small></button>`:"").join("")}</div>
   <p style="font-size:12px;text-align:center">🪙 ${fmt(G.gold)}</p><button class="buy alt" id="gnBack" style="align-self:center">↩ 돌아가기</button>`);
  layers.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{ const s=+b.dataset.b, pr=gnPrice(s); if(G.gold<pr) return; G.gold-=pr; g.sd[s]++; saveGame(); tone(880,.06); gnShop(back); });
  $("gnBack").onclick=()=>back!=null&&back>=0?gnSeedCard(back):showGarden(); }
function gnDex(){ const g=gnData(); const n=Object.keys(g.dex).length;
  card(`<h2>📖 작물 도감 ${n}/${GN_CROPS.length*4}</h2><p style="font-size:13px">작물마다 보통 · ⚡번개 · 🌈무지개 · 🌠별빛 네 가지 모습이 있어요. 마법 날씨 때 자라는 작물이 변신해요!</p>
   <div class="diary">${GN_CROPS.map((C,s)=>`<p>${C.ic} ${C.n} ${[-1,0,1,2].map(m=>g.dex[s+"_"+m]?`<b style="color:${m<0?"#fff":GN_MUT[m].css}">${m<0?"●":GN_MUT[m].ic}</b>`:'<span style="opacity:.3">○</span>').join(" ")}</p>`).join("")}</div>
   <button class="buy alt" id="gnBack" style="align-self:center">↩ 밭 보기</button>`); $("gnBack").onclick=showGarden; }
function showGarden(){ const g=gnData(), now=Date.now(), S=gnSlots(), W=gnWDay(); const wn=gnWxNow(), nx=wn||gnWxNext(); const ready=g.p.filter((p,i)=>p&&i<S&&gnReadyAt(p)<=now).length;
  const rows=[]; for(let i=0;i<GN_POS.length;i++){ const p=g.p[i]; if(i>=S){ rows.push(`<div class="row"><div class="ic">🔒</div><div class="t"><div>밭 ${i+1}</div><span>Lv.${i===4?30:60}에 열려요</span></div></div>`); continue; }
    if(!p){ rows.push(`<div class="row"><div class="ic">🟫</div><div class="t"><div>밭 ${i+1} · 비어 있어요</div><span>씨앗을 심어요</span></div><button class="buy" data-plant="${i}">🌱 심기</button></div>`); continue; }
    const C=GN_CROPS[p.s], ra=gnReadyAt(p), done=ra<=now, mu=gnMutOf(p,now); const bar=Math.round(gnProg(p,now)*100);
    rows.push(`<div class="row"><div class="ic">${C.ic}</div><div class="t"><div>${mu>=0?`<b style="color:${GN_MUT[mu].css}">${GN_MUT[mu].ic}${GN_MUT[mu].n}</b> `:""}${C.n}</div><span>${done?"다 자랐어요! 🧺":`${bar}% · ${gnLeft(ra-now)} 남음 (${gnHM(ra)})`}${!done&&mu>=0?" · 날씨 변신 성공!":""}</span></div>${done?`<button class="buy" data-hv="${i}">🧺 거두기</button>`:""}</div>`); }
  const nbr=Object.values(GNO).filter(r=>Date.now()-r.t<7*86400000&&gnGrowing(r)>0).sort((a,b)=>(PEERS[b.i]?1:0)-(PEERS[a.i]?1:0)||(W.who[a.i]?1:0)-(W.who[b.i]?1:0)||b.t-a.t).slice(0,8);
  const seeds=GN_CROPS.map((C,s)=>g.sd[s]?`${C.ic}${g.sd[s]}`:"").filter(Boolean).join(" ")||"없음";
  card(`<h2>🌱 데메테르의 씨앗 밭</h2><p>내 <b>신전 섬</b> 길 옆 밭에 씨앗을 심으면 <b>게임을 꺼 둬도 자라요.</b> 자라는 동안 🔮 마법 날씨가 지나가면 ⚡번개 · 🌈무지개 · 🌠별빛 작물로 변신할 수 있어요!</p>
   <div class="idlegrid"><div><b>${ready?`🧺 ${ready}`:"🌿"}</b><span>${ready?"다 자란 작물":"자라는 중"}</span></div><div><b>💖 ${g.hearts||0}</b><span>물 받은 하트</span></div><div><b>📖 ${Object.keys(g.dex).length}/${GN_CROPS.length*4}</b><span>작물 도감</span></div></div>
   <p style="font-size:13px;text-align:center">${wn?`🔮 지금 <b>${GN_WX[wn.k].ic} ${GN_WX[wn.k].n}</b>! (${gnHM(wn.e)}까지) · 변신 확률 ${Math.round(GN_MUT[wn.k].p*100)}%`:nx?`🔮 다음 마법 날씨: <b>${gnHM(nx.s)} ${GN_WX[nx.k].ic} ${GN_WX[nx.k].n}</b> (변신 확률 ${Math.round(GN_MUT[nx.k].p*100)}%)`:""}</p>
   ${rows.join("")}
   <p style="font-size:12px">🌱 가진 씨앗: ${seeds}</p>
   <div class="exgrid">${ready>1?`<button class="buy" id="gnAll">🧺 모두 거두기</button>`:""}<button class="buy alt" id="gnShopB">🛒 씨앗 가게</button><button class="buy alt" id="gnDexB">📖 작물 도감</button><button class="buy alt" id="gnHome">🏡 내 신전 섬으로</button></div>
   <h3>💧 이웃 밭에 물 주기 <small style="font-size:12px;opacity:.8">오늘 ${W.n}/${GN_WDAY}</small></h3>
   ${nbr.length?nbr.map(r=>{ const R=REALMS[r.r]; const did=W.who[r.i]; return `<div class="row"><div class="ic" style="color:${R.c1}">${R.icon}</div><div class="t"><div>${r.n}${PEERS[r.i]?' <i class="st on">접속 중</i>':""}</div><span>자라는 작물 ${gnGrowing(r)}개 · 💖 ${r.h||0}</span></div><button class="buy" data-w="${r.i}" ${did||W.n>=GN_WDAY?"disabled":""}>${did?"✅ 줬어요":"💧 물 주기"}</button></div>`; }).join(""):'<p style="font-size:13px">지금은 물이 필요한 이웃 밭이 없어요.</p>'}
   <p style="font-size:12px">💧 물을 주면 그 밭이 10분 빨리 자라고 주인에게 💖 하트가 가요 (같은 사람은 하루 1번). 내 밭도 다른 사람이 물을 주면 꺼 둔 동안에도 빨리 자라요!</p>
   <p style="font-size:12px">🔮 마법 날씨는 40분마다 절반쯤 와요(8분). 변신 확률: ⚡ 45% · 🌈 30% · 🌠 22% (날씨가 한 번 지나갈 때마다). 변신 작물은 금화 ×3 · ×5 · ×8 + ✨ 룬 가루!</p>`);
  layers.querySelectorAll("[data-plant]").forEach(b=>b.onclick=()=>gnSeedCard(+b.dataset.plant));
  layers.querySelectorAll("[data-hv]").forEach(b=>b.onclick=()=>{ closeLayer(); gnHarvest(+b.dataset.hv); GN.key=""; });
  layers.querySelectorAll("[data-w]").forEach(b=>b.onclick=()=>{ gnWater(b.dataset.w); showGarden(); });
  if($("gnAll")) $("gnAll").onclick=()=>{ closeLayer(); gnHarvestAll(); GN.key=""; };
  $("gnShopB").onclick=()=>gnShop(-1); $("gnDexB").onclick=gnDex; $("gnHome").onclick=()=>{ if(HM.on&&HM.data&&HM.data.i===G.id){ closeLayer(); return; } hmEnter(G.id); }; }
MENU_X.push({ic:"🌱",n:"데메테르의 씨앗 밭",id:"gnBtn",sub:()=>{ const g=gnData(), now=Date.now(); const r=g.p.filter((p,i)=>p&&i<gnSlots()&&gnReadyAt(p)<=now).length, gr=g.p.filter((p,i)=>p&&i<gnSlots()&&gnReadyAt(p)>now).length; const w=gnWxNow(); return `${r?`🧺 ${r}개 다 자람 · `:""}${gr?`🌿 ${gr}개 자라는 중`:"빈 밭에 씨앗 심기"}${w?` · ${GN_WX[w.k].ic} 마법 날씨!`:""}`; },f:showGarden});
TITLES.push({id:"gn10",n:"새싹 농부",t:1,h:"작물 10번 거두기",g:()=>[(G.gn&&G.gn.hv)||0,10]},{id:"gnm10",n:"날씨를 기다리는 농부",t:2,h:"날씨 변신 작물 10번 거두기",g:()=>[(G.gn&&G.gn.mu)||0,10]},
 {id:"gnd24",n:"데메테르의 정원사",t:3,h:"작물 도감 24칸 채우기",g:()=>[G.gn&&G.gn.dex?Object.keys(G.gn.dex).length:0,24]},{id:"gnw30",n:"물 주는 이웃",t:1,h:"이웃 밭에 물 30번 주기",g:()=>[(G.gn&&G.gn.wg)||0,30]});
</script>
<style>
#gnSky{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;opacity:0;transition:opacity 2s}
#gnSky.rain,#gnSky.bow,#gnSky.star{opacity:1}
#gnSky .bow{position:absolute;left:-10%;right:-10%;top:-38vh;height:110vh;display:none;background:radial-gradient(ellipse 60% 80% at 50% 100%,transparent 52%,rgba(180,90,255,.34) 53.5%,rgba(80,110,255,.36) 55.5%,rgba(60,180,255,.36) 57.5%,rgba(90,215,90,.36) 59.5%,rgba(255,230,60,.4) 61.5%,rgba(255,150,40,.4) 63.5%,rgba(255,70,70,.4) 65.5%,transparent 67.5%);animation:gnBow 6s ease-in-out infinite}
#gnSky.bow .bow{display:block}
#gnSky.rain{background:linear-gradient(180deg,rgba(40,70,120,.22),rgba(40,70,120,0) 60%)}
#gnSky .st{position:absolute;display:none;width:120px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,250,210,0),#fff6c8);box-shadow:0 0 8px #fff2a0;transform:rotate(-24deg);animation:gnStar 2.6s linear infinite}
#gnSky.star .st{display:block}
#gnSky.star{background:linear-gradient(180deg,rgba(30,20,80,.25),rgba(30,20,80,0) 55%)}
#gnSky .st:nth-child(2){left:62%;top:6%;animation-delay:-.4s} #gnSky .st:nth-child(3){left:30%;top:2%;animation-delay:-1.3s;animation-duration:3.1s} #gnSky .st:nth-child(4){left:82%;top:16%;animation-delay:-2.1s} #gnSky .st:nth-child(5){left:12%;top:12%;animation-delay:-.9s;animation-duration:3.6s}
@keyframes gnStar{0%{opacity:0;translate:0 0}8%{opacity:1}35%{opacity:0;translate:-260px 115px}100%{opacity:0;translate:-260px 115px}}
@keyframes gnBow{0%,100%{opacity:.85}50%{opacity:1}}
</style>
