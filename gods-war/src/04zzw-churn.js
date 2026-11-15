<script>
/* ================= v135-3: 🌊 우유 바다 젓기 — 모두가 큰 뱀 밧줄을 당기는 인도 대축제 (IDEAS G11/15-3) =================
   언제: 매주 토·일 오후 4시~4시 30분(한국 시간). 첫 회 11/21(토). 그 밖에는 바다에 가서 박자 연습만.
   메뉴 🌊 → 지도 밖(x≈0, z≈400) 우유 바다. 가운데 만다라 산, 그 아래 거북 할아버지 쿠르마, 산에 감긴 큰 뱀 바수키가 양쪽 부두로 뻗은 밧줄.
   🌞 해님 편(서쪽 부두) · 🌙 달님 편(동쪽 부두) — 서 있는 부두로 편이 정해짐.
   박자: 1.2초마다 「둥」 — 짝수 박은 해님 편, 홀수 박은 달님 편 차례(모든 폰이 시계로 같음). 내 편 차례에 「영차!」를 박자에 맞춰 누르면 완벽 2 · 좋아 1.
   🤝 호흡 맞추기: 바로 앞 박에 상대 편 누군가가 당겼으면(실시간 chp) 내 힘 ×1.5 → 모르는 사람끼리 번갈아 당겨야 빨라짐.
   전 세계 합(보관 ch/<회>/<id>: 편·힘·구운 힘) + 🐢 거북 할아버지(6초마다 1) 가 200·500·900·1400·2000 을 넘을 때마다 바다에서 보물이 떠오름:
     🐄 소원 소(금화) · 🌙 달(신전 장식 «우유 바다의 초승달») · 🐘 하늘 코끼리(무기 뽑기권) · 💎 카우스투바 보석(장비) · 🍯 불사의 감로(하루 동안 경험치 +20%)
   보물은 그 회에 한 번이라도 당긴 사람 모두(꺼 둔 뒤 다음에 켜도 7일 안이면 받음).
   🫧 거품 괴물: 축제 중 70초마다 부두로 올라옴(내 레벨) — 싸우고 다시 당기기.
   쉬는 동안 성장: 내 영웅이 20분마다 힘 1(최대 30)을 모아 두었다가 축제 때 저절로 보탬.
   저장: G.chK(대상 회) · G.chBT(모으기 시작) · G.chS(이번 회 힘) · G.chPaid{회:단계} · G.chTot · G.chMoon(초승달 받음) · G.chBest. 칭호 3개. */
const CHX=0, CHZ=400, CH_BEAT=1200, CH_DUR=30*60000, CH_GOALS=[200,500,900,1400,2000], CH_BAKE=20*60000, CH_BAKEMAX=30, CH_TURTLE=6000;
const CH_TRE=[{ic:"🐄",n:"소원 소 카마데누",d:"금화가 쏟아져요"},{ic:"🌙",n:"우유 바다의 달",d:"신전 장식 «우유 바다의 초승달»"},{ic:"🐘",n:"하늘 코끼리 아이라바타",d:"무기 뽑기권 1장"},{ic:"💎",n:"카우스투바 보석",d:"장비 하나"},{ic:"🍯",n:"불사의 감로",d:"하루 동안 경험치 +20%"}];
const CH={on:false,built:false,parts:[],rec:{},pubT:0,dirty:false,lastNb:-99,peerNb:{},mtA:0,rope:null,sway:0,tre:[],stShown:{},ann:{},btn:null,bar:null,mobT:20,mobs:[],paidChk:0,fb:null};
/* ---------- 언제 ---------- */
function chKst(t){ return new Date(t+9*3600000); }
function chStartOfDay(day){ return day*86400000-9*3600000+16*3600000; }   // kday → 그날 오후 4시(UTC ms)
function chIsDay(day){ const w=new Date(day*86400000).getUTCDay(); return w===6||w===0; }
function chCur(t){ t=t||Date.now(); const d=kday(t); if(chIsDay(d)){ const s=chStartOfDay(d); if(t>=s&&t<s+CH_DUR) return d; } return -1; }
function chNext(t){ t=t||Date.now(); for(let d=kday(t);d<kday(t)+8;d++){ if(!chIsDay(d)) continue; const s=chStartOfDay(d); if(t<s+CH_DUR) return d; } return kday(t)+7; }
function chPrev(t){ t=t||Date.now(); for(let d=kday(t);d>kday(t)-8;d--){ if(!chIsDay(d)) continue; const s=chStartOfDay(d); if(t>=s+CH_DUR) return d; } return -1; }
function chActive(){ return chCur()>=0; }
function chWhen(d){ const x=chKst(chStartOfDay(d)); return `${x.getUTCMonth()+1}/${x.getUTCDate()}(${"일월화수목금토"[x.getUTCDay()]}) 오후 4시`; }
function chTurtle(k,t){ t=t||Date.now(); const s=chStartOfDay(k); return Math.max(0,Math.floor((Math.min(t,s+CH_DUR)-s)/CH_TURTLE)); }
function chBaked(k){ if(G.chK!==k||!G.chBT) return 0; return Math.max(0,Math.min(CH_BAKEMAX,Math.floor((Math.min(Date.now(),chStartOfDay(k))-G.chBT)/CH_BAKE))); }
function chSum(k){ const R=CH.rec[k]||{}; let tot=0, sun=0, moon=0; for(const id in R){ if(id===G.id) continue; const o=R[id]; const v=(o.s|0)+Math.min(CH_BAKEMAX,o.b|0); tot+=v; if(o.r===1) moon+=o.s|0; else sun+=o.s|0; }
  if(G.chK===k){ tot+=(G.chS|0)+chBaked(k); } else if(R[G.id]){ tot+=(R[G.id].s|0)+Math.min(CH_BAKEMAX,R[G.id].b|0); }
  return {tot:tot+chTurtle(k),sun,moon,turtle:chTurtle(k)}; }
function chStage(tot){ let n=0; CH_GOALS.forEach(g=>{ if(tot>=g) n++; }); return n; }
function chRecv(d,topic){ const a=String(topic).split("/"); const k=+a[1], id=a[2]; if(!(k>0)||!id||!d) return; (CH.rec[k]||(CH.rec[k]={}))[id]={r:d.r|0,s:Math.max(0,d.s|0),b:Math.max(0,d.b|0),n:String(d.n||"?").slice(0,12)}; }
NETX.push({sub:()=>"ch/"+chNext()+"/+",pre:"ch/",f:chRecv});
NETX.push({sub:()=>"ch/"+Math.max(1,chPrev())+"/+",pre:"ch/",f:chRecv});
function chRoll(){ const k=chNext(); if(G.chK===k) return; const prev=G.chK; if(prev!=null&&prev<k) G.chBT=Math.max(G.chBT||0,chStartOfDay(prev)+CH_DUR); if(!G.chBT) G.chBT=Date.now()-3*3600000;   // 처음엔 9 모아 둔 채로
  G.chK=k; G.chS=0; saveGame(); CH.dirty=true; }
function chPub(){ if(G.chK==null||G.realm<0) return; const k=G.chK; const rec={i:G.id,n:G.name,r:CH.side|0,s:G.chS|0,b:chBaked(k),t:Date.now()}; (CH.rec[k]||(CH.rec[k]={}))[G.id]={r:rec.r,s:rec.s,b:rec.b,n:rec.n}; try{ net.pushRet("ch/"+k+"/"+G.id,rec); CH.dirty=false; }catch(e){} }
/* ---------- 바다 만들기 ---------- */
function chIn(x,z){ return Math.abs(x-CHX)<140&&Math.abs(z-CHZ)<140; }
(function(){ const _h=hAt; hAt=function(x,z){ return chIn(x,z)?0:_h(x,z); }; })();
function chWalk(x,z){ const lx=x-CHX, lz=z-CHZ; const ax=Math.abs(lx);
  if(ax>=13&&ax<=31&&Math.abs(lz)<=5) return true;     // 부두 두 개
  if(ax>=24&&ax<=31&&lz>=-5&&lz<=27) return true;       // 양쪽 옆길
  if(ax<=31&&lz>=20&&lz<=27) return true;               // 뒷길(입구)
  return false; }
function chBuild(){ if(CH.built) return; CH.built=true; const add=o=>{ scene.add(o); CH.parts.push(o); return o; };
  const milk=mat({color:0xf6f2ea,roughness:.35}), wood=mat({color:0x9a6a3a,roughness:.9}), wood2=mat({color:0x7a4a28,roughness:.9}), stone=mat({color:0x8a7a68,roughness:.95}), stone2=mat({color:0x6a5a4a,roughness:.95});
  const G0=new THREE.Group(); const sea=new THREE.Mesh(new THREE.CircleGeometry(120,64),milk); sea.rotation.x=-Math.PI/2; sea.position.set(CHX,-.3,CHZ); G0.add(sea);
  // 부두
  const deck=(x0,x1,z0,z1)=>{ const w=x1-x0, d=z1-z0; const b=box(w,.5,d,wood,CHX+(x0+x1)/2,-.05,CHZ+(z0+z1)/2); G0.add(b); for(let x=x0+1.5;x<x1;x+=3){ G0.add(box(.12,.52,d,wood2,CHX+x,-.04,CHZ+(z0+z1)/2)); } [[x0,z0],[x1,z0],[x0,z1],[x1,z1]].forEach(p=>G0.add(cyl(.35,.35,3,wood2,CHX+p[0],-.5,CHZ+p[1],8))); };
  deck(-31,-13,-5,5); deck(13,31,-5,5); deck(-31,-24,-5,27); deck(24,31,-5,27); deck(-31,31,20,27);
  // 깃발
  [[-1,0xffc83a,"🌞"],[1,0x9ab8ff,"🌙"]].forEach(([sg,c])=>{ const g=new THREE.Group(); g.add(cyl(.12,.15,6,wood2,0,3,0,6)); const f=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.5),mat({color:c,side:THREE.DoubleSide})); f.position.set(1.2,5.2,0); g.add(f); const em=sph(.45,glowMat(c,.9),0,6.3,0); em.userData.noOutline=true; g.add(em); g.position.set(CHX+sg*29,0,CHZ-4.5); G0.add(g); });
  add(shadowify(G0));
  // 거북 할아버지 + 만다라 산 (산은 돌아감)
  const tu=new THREE.Group(); const shell=new THREE.Mesh(new THREE.SphereGeometry(10,24,12,0,Math.PI*2,0,Math.PI/2),mat({color:0x4a8a5a,roughness:.7})); shell.scale.y=.35; tu.add(shell);
  for(let k=0;k<8;k++){ const a=k/8*6.283; const p=new THREE.Mesh(new THREE.CircleGeometry(1.6,6),mat({color:0x6aaa6a})); p.position.set(Math.cos(a)*6.5,2.2,Math.sin(a)*6.5); p.lookAt(Math.cos(a)*20,8,Math.sin(a)*20); tu.add(p); }
  const hd=new THREE.Group(); hd.add(sph(1.6,mat({color:0x8ac08a}),0,0,0)); [-1,1].forEach(s=>{ hd.add(sph(.35,mat({color:0xffffff}),s*.6,.4,1.2)); hd.add(sph(.17,mat({color:0x1a1a1a}),s*.6,.42,1.45)); }); const sm=new THREE.Mesh(new THREE.TorusGeometry(.5,.08,4,10,Math.PI),mat({color:0x2a4a2a})); sm.position.set(0,-.3,1.4); sm.rotation.z=Math.PI; hd.add(sm); hd.position.set(0,1,11); tu.add(hd); CH.thead=hd;
  tu.position.set(CHX,-.6,CHZ); add(shadowify(tu));
  const mt=new THREE.Group(); mt.add(cyl(1.4,6.5,24,stone,0,12,0,9)); for(let k=0;k<6;k++){ const r=new THREE.Mesh(new THREE.BoxGeometry(.8,22,1.2),stone2); const a=k/6*6.283; r.position.set(Math.cos(a)*3.6,11,Math.sin(a)*3.6); r.rotation.y=-a; r.rotation.z=.18*Math.cos(a)*0; mt.add(r); }
  const top=new THREE.Mesh(new THREE.ConeGeometry(1.8,3,8),mat({color:0xffffff})); top.position.y=25.5; mt.add(top); for(let k=0;k<5;k++){ const tr=sph(1.3,mat({color:0x5a9a4a}),Math.cos(k*1.3)*3.5,8+k*3,Math.sin(k*1.3)*3.5); mt.add(tr); }
  mt.position.set(CHX,1.6,CHZ); add(shadowify(mt)); CH.mt=mt;
  // 거품 고리
  const foam=new THREE.Group(); for(let k=0;k<3;k++){ const t=new THREE.Mesh(new THREE.TorusGeometry(9+k*3.5,.35+k*.1,4,40),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7-k*.18})); t.rotation.x=Math.PI/2; t.position.y=.05; foam.add(t); } foam.position.set(CHX,0,CHZ); add(foam); CH.foam=foam;
  // 바수키 밧줄 (꼬리 서쪽 · 머리 동쪽)
  const P3=(x,y,z)=>new THREE.Vector3(x,y,z); const pts=[P3(-31,1.4,0),P3(-22,1.4,0),P3(-13,1.6,0),P3(-8,3,0)]; for(let k=0;k<=24;k++){ const a=Math.PI+k/24*Math.PI*4; pts.push(P3(Math.cos(a)*7.4*(1-k/24*.25),4+k*.42,Math.sin(a)*7.4*(1-k/24*.25))); } pts.push(P3(8,3.4,0),P3(13,1.6,0),P3(22,1.4,0),P3(30,1.6,0));
  const curve=new THREE.CatmullRomCurve3(pts); const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,220,.62,8,false),mat({color:0x3a6aa8,roughness:.5})); const belly=new THREE.Mesh(new THREE.TubeGeometry(curve,220,.5,6,false),mat({color:0xbfe0ff,roughness:.6})); belly.position.y=-.18;
  const rope=new THREE.Group(); rope.add(tube); rope.add(belly);
  const head=new THREE.Group(); const hs=mat({color:0x3a6aa8}); head.add(box(1.8,1.1,2.2,hs,0,0,0)); head.add(box(1.6,.4,1.8,mat({color:0xbfe0ff}),0,-.55,.1)); [-1,1].forEach(s=>{ head.add(sph(.32,mat({color:0xffffff}),s*.55,.5,.7)); head.add(sph(.16,mat({color:0x1a1a1a}),s*.55,.55,.9)); const fr=new THREE.Mesh(new THREE.CircleGeometry(1.4,10,0,Math.PI),mat({color:0x5a8ad8,side:THREE.DoubleSide})); fr.position.set(s*.95,.6,-.6); fr.rotation.set(0,s*1.1,s*.3); head.add(fr); });
  const crown=new THREE.Group(); for(let q=0;q<3;q++){ const c=new THREE.Mesh(new THREE.ConeGeometry(.18,.6,4),M.gold); c.position.set((q-1)*.4,.9,0); crown.add(c); } head.add(crown); head.position.set(31.5,1.9,0); head.rotation.y=Math.PI/2; rope.add(head); CH.shead=head;
  rope.position.set(CHX,0,CHZ); add(shadowify(rope)); CH.rope=rope;
  // 보물 받침대 (북쪽 물 위)
  CH_TRE.forEach((T,i)=>{ const g=new THREE.Group(); g.add(cyl(1.6,2,1,stone,0,.2,0,10)); const it=chTreMesh(i); it.scale.setScalar(1.7); it.position.y=2.2; g.add(it); const gl=new THREE.Mesh(new THREE.RingGeometry(2.2,3.2,24),glowMat([0xffe08a,0xfff2b0,0xbfe0ff,0xff8aa0,0xffd24a][i],.6)); gl.rotation.x=-Math.PI/2; gl.position.y=.75; gl.userData.noOutline=true; g.add(gl); g.userData.it=it; g.position.set(CHX+(i-2)*10,0,CHZ-22); g.visible=false; add(g); CH.tre.push(g); });
  { const g=pgArch(false); g.position.set(CHX,0,CHZ+26.5); add(g); CH.exitArch={x:CHX,z:CHZ+25.6}; } }
function chTreMesh(i){ const g=new THREE.Group(); const W=mat({color:0xffffff}), Gd=M.gold;
  if(i===0){ g.add(box(1.8,1,1,W,0,0,0)); g.add(box(.7,.7,.8,W,1.1,.4,0)); [-1,1].forEach(s=>[-1,1].forEach(t=>g.add(cyl(.12,.12,.8,W,s*.6,-.8,t*.3,6)))); [-1,1].forEach(s=>{ const h=new THREE.Mesh(new THREE.ConeGeometry(.1,.4,5),Gd); h.position.set(1.2,.95,s*.25); g.add(h); }); g.add(sph(.25,mat({color:0xffb0c0}),1.45,.25,0)); }
  else if(i===1){ const m=new THREE.Mesh(new THREE.TorusGeometry(1,.32,8,20,Math.PI*1.3),new THREE.MeshBasicMaterial({color:0xfff2b0})); m.rotation.z=-.6; g.add(m); g.add(sph(.6,glowMat(0xfff2b0,.35),0,0,0)); }
  else if(i===2){ g.add(sph(1.1,W,0,0,0)); g.add(sph(.7,W,.9,.5,0)); const tr=cyl(.15,.25,1.2,W,1.4,0,0,6); tr.rotation.z=.4; g.add(tr); [-1,1].forEach(s=>{ const e=new THREE.Mesh(new THREE.CircleGeometry(.55,10),mat({color:0xf0e0e0,side:THREE.DoubleSide})); e.position.set(.7,.6,s*.6); g.add(e); const w=new THREE.Mesh(new THREE.CircleGeometry(.9,3),mat({color:0xbfe0ff,side:THREE.DoubleSide})); w.position.set(-.2,.9,s*.9); w.rotation.x=s*.6; g.add(w); }); [0,1,2,3].forEach(q=>g.add(cyl(.18,.18,.8,W,(q<2?-.5:.5),-1,(q%2?-.4:.4),6))); }
  else if(i===3){ const j=new THREE.Mesh(new THREE.OctahedronGeometry(.9,0),mat({color:0xff4a6a,metalness:.4,roughness:.15,emissive:0x5a0a1a})); g.add(j); g.add(sph(1.1,glowMat(0xff8aa0,.25),0,0,0)); }
  else { g.add(new THREE.Mesh(new THREE.LatheGeometry([[0,-.8],[.6,-.7],[.8,-.2],[.5,.4],[.3,.6],[.45,.8],[0,.8]].map(p=>new THREE.Vector2(p[0],p[1])),12),Gd)); g.add(sph(.5,glowMat(0xffe08a,.4),0,.9,0)); }
  return g; }
/* ---------- 들어가기 · 나가기 ---------- */
function chEnter(){ if(CH.on||P.dead) return; if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  closeLayer(); try{ if(typeof glAway==="function"&&glAway()){ if(typeof DG!=="undefined"&&DG.on) dgExit(true); if(typeof HM!=="undefined"&&HM.on) hmExit(); if(typeof PG!=="undefined"&&PG.on) pgExit(true,true); if(typeof TW!=="undefined"&&TW.on) twExit(true,true); if(typeof LV!=="undefined"&&LV.on) lvExit(true,true); if(typeof AR!=="undefined"&&AR.on) arExit(true,true); if(typeof OK!=="undefined"&&OK.on) okExit(true,true); if(typeof HS!=="undefined"&&HS.on) hsExit(true,true); if(typeof HY!=="undefined"&&HY.on) hyExit(true,true); if(typeof CV!=="undefined"&&CV.on) cvExit(true,true); } }catch(e){} try{ if(P.ride) rdSet(false); }catch(e){}
  chBuild(); chRoll(); CH.on=true; CH.parts.forEach(o=>o.visible=true); CH.tre.forEach(g=>g.visible=false); P.x=CHX-20; P.z=CHZ+23.5; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul||0,2); P.guide=null; $("guide").hidden=true; CH.cd=2.5; CH.mobT=15; CH.lastOk={x:P.x,z:P.z}; saveGame(); chUI(true);
  try{ lvBanner(chActive()?"🌊 축제가 열렸어요!":"🌊 우유 바다",chActive()?"다 같이 영차!":"축제는 토·일 오후 4시",chActive()?"부두에 서서 내 편 차례에 「영차!」 — 상대 편과 번갈아 당기면 ×1.5!":`지금은 박자 연습만 돼요 · 다음 축제 ${chWhen(chNext())}`,"#8ac8ff"); }catch(e){ toast("🌊 우유 바다"); } jingle([392,523,659,784]); }
function chExit(silent,noTp){ if(!CH.on) return; CH.on=false; CH.parts.forEach(o=>o.visible=false); chUI(false); CH.mobs.forEach(m=>{ if(mobs.indexOf(m)>=0) removeMob(m); }); CH.mobs=[]; if(CH.dirty) chPub();
  if(!noTp){ const c=REGIONS[Math.max(0,G.realm)*3]; P.x=c.x+4; P.z=c.z+4; P.y=0; P.vy=0; } if(!silent) toast("수도로 돌아왔어요",null,1.6); }
/* ---------- 화면 (박자 막대 · 영차 버튼) ---------- */
function chUI(on){ if(on&&!CH.btn){ const b=document.createElement("button"); b.id="chPull"; b.type="button"; b.style.cssText="position:fixed;left:50%;bottom:calc(max(10px,env(safe-area-inset-bottom)) + 74px);transform:translateX(-50%);z-index:6;border:3px solid #fff;border-radius:999px;padding:10px 26px;font-size:19px;font-family:inherit;font-weight:700;color:#fff;background:linear-gradient(180deg,#7ab8ff,#2a6ad8);box-shadow:0 6px 0 #1a3a8a,0 10px 20px rgba(0,0,0,.4);touch-action:none;white-space:nowrap";
    b.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); chPull(); }); document.body.appendChild(b); CH.btn=b;
    const bar=document.createElement("div"); bar.id="chBar"; bar.style.cssText="position:fixed;left:calc(50% + 60px);top:calc(env(safe-area-inset-top) + 96px);transform:translateX(-50%);z-index:5;width:min(30vw,210px);height:34px;border-radius:18px;background:rgba(10,20,40,.72);border:2px solid rgba(255,255,255,.6);overflow:hidden;pointer-events:none;font-family:inherit";
    bar.innerHTML='<div id="chT" style="position:absolute;left:50%;top:0;bottom:0;width:22%;transform:translateX(-50%);background:rgba(255,220,120,.35);border-left:2px solid #fff;border-right:2px solid #fff"></div><div id="chM" style="position:absolute;top:3px;width:24px;height:24px;margin-left:-12px;border-radius:50%;background:#fff;box-shadow:0 0 10px #fff;font-size:15px;text-align:center;line-height:24px"></div><div id="chL" style="position:absolute;left:8px;top:0;line-height:30px;font-size:13px;color:#fff;font-weight:700;text-shadow:0 1px 2px #000"></div>';
    document.body.appendChild(bar); CH.bar=bar; }
  if(CH.btn) CH.btn.style.display=on?"":"none"; if(CH.bar) CH.bar.style.display=on?"":"none"; }
function chSideAt(x){ return x<CHX?0:1; }
function chOnDock(){ const lx=P.x-CHX, lz=P.z-CHZ; return Math.abs(lx)>=13&&Math.abs(lx)<=31&&Math.abs(lz)<=5.2; }
function chPull(){ if(!CH.on||P.dead||layerOpen) return; if(!chOnDock()){ toast("부두(밧줄 옆)에 서야 당길 수 있어요","🌞 서쪽 = 해님 편 · 🌙 동쪽 = 달님 편",1.6); return; }
  const now=Date.now(), side=chSideAt(P.x); const nb=Math.round(now/CH_BEAT), off=now-nb*CH_BEAT; if(nb===CH.lastNb){ return; }
  if(nb%2!==side){ CH.lastNb=nb; floatDmg(P.x,3.6,P.z,side?"쉿! 해님 편 차례":"쉿! 달님 편 차례","me"); tone(200,.08,"triangle"); return; }
  const a=Math.abs(off); let pw=a<140?2:a<300?1:0; CH.lastNb=nb; if(!pw){ floatDmg(P.x,3.6,P.z,"헛손질!","me"); tone(180,.08,"triangle"); return; }
  const pt=CH.peerNb[nb-1]&&chActive(); if(pt) pw*=1.5; P.atkAnim=.25; try{ if(player.userData.gl) animState(player,"attack"); }catch(e){} CH.sway=side?1:-1; buzz(18);
  const msg=(pw>=2?"완벽!":"좋아!")+(pt?" 🤝×1.5":""); floatDmg(P.x,3.8,P.z,`${side?"🌙":"🌞"} 영차! ${msg}`,"gain"); tone(pw>=2?880:660,.08,"square",0,.07); tone(220,.12,"sine",.02,.12);
  try{ net.send({t:"chp",nb,s:side}); }catch(e){}
  if(chActive()){ chRoll(); const add=Math.round(pw); G.chS=(G.chS|0)+add; G.chTot=(G.chTot||0)+add; CH.dirty=true; CH.part=true; } else floatDmg(P.x,2.8,P.z,"(연습)",""); }
NETR.chp=(o,d)=>{ const nb=+d.nb||0; if(Math.abs(nb-Math.round(Date.now()/CH_BEAT))>3) return; CH.peerNb[nb]=1; if(CH.on&&chIn(o.x,o.z)){ o.anim=.3; CH.sway=d.s?1:-1; } };
/* ---------- 거품 괴물 ---------- */
function chSpawnMobs(){ const n=1+Math.min(2,Object.values(PEERS).filter(o=>chIn(o.x,o.z)).length>0?2:1); const side=chSideAt(P.x)?1:-1; const lv=Math.max(1,G.lv); const ms=mobStats(lv,false);
  for(let i=0;i<n;i++){ const x=CHX+side*rnd(15,29), z=CHZ+rnd(-4,4); const mesh=makeMob("naga",0xd8f0ff,1.05); mesh.position.set(x,0,z); scene.add(mesh);
    const m={n:"거품 나가",shape:"naga",mesh,x,z,hx:x,hz:z,lv,boss:false,world:false,hp:ms.mhp,mhp:ms.mhp,atk:ms.atk,xp:ms.xp,gold:ms.gold,rg:12,cd:1.5,state:"chase",t:0,lbl:makeLabel(""),rot:0,hit:0,scale:1.05,power:0,ev:1,chm:1}; mobs.push(m); CH.mobs.push(m); fxSpark(x,.6,z,0xffffff,18); fxRing(x,z,0xffffff,3,.5); }
  toast("🫧 거품 괴물이 올라왔어요!","물리치고 다시 영차!",1.8); tone(160,.25,"sawtooth",0,.08); }
function chMobTick(dt){ const st=stat(); for(let i=CH.mobs.length-1;i>=0;i--){ const m=CH.mobs[i]; if(mobs.indexOf(m)<0||m.hp<=0){ CH.mobs.splice(i,1); continue; } m.hit=Math.max(0,m.hit-dt); m.cd-=dt;
    const dx=P.x-m.x, dz=P.z-m.z, d=Math.hypot(dx,dz); if(d>2.2&&!P.dead){ const sp=3.8*dt; const nx=m.x+dx/d*sp, nz=m.z+dz/d*sp; if(chWalk(nx,nz)){ m.x=nx; m.z=nz; } m.rot=Math.atan2(dx,dz); } else if(m.cd<=0&&!P.dead){ m.cd=1.3; hurtPlayer(m.atk*(1-dmgReduce(st.def)),m.n); m.mesh.userData.lunge=.25; }
    const tn=performance.now(); m.mesh.position.set(m.x,Math.abs(Math.sin(tn/120+m.x))*.2+(m.mesh.userData.lunge>0?.4:0),m.z); if(m.mesh.userData.lunge>0) m.mesh.userData.lunge-=dt; m.mesh.rotation.y=m.rot; hitTint(m.mesh,m.hit/.15);
    if(d<40&&!layerOpen){ placeLabel(m.lbl,m.x,3,m.z,mobTag?mobTag(m):m.n); try{ hpBar(m.lbl,m.hp/m.mhp); }catch(e){} } else m.lbl.style.display="none"; } }
/* ---------- 보물 · 보상 ---------- */
function chPay(k,quiet){ G.chPaid=G.chPaid||{}; const mine=G.chK===k?(G.chS|0):(((CH.rec[k]||{})[G.id]||{}).s|0); if(mine<=0) return; const st=chStage(chSum(k).tot); const done=G.chPaid[k]|0; if(st<=done) return; G.chPaid[k]=st; const L=G.lv, got=[];
  for(let i=done;i<st;i++){ if(i===0){ const g=Math.round(400+L*25); G.gold+=g; got.push(`🐄 금화 +${fmt(g)}`); try{ COINFLY.burst(P.x,1.6,P.z,10); }catch(e){} }
    else if(i===1){ if(!G.chMoon){ G.chMoon=1; hmAdd(CH_DECO,"우유 바다에서"); got.push("🌙 신전 장식 «우유 바다의 초승달»"); } else { G.rune=(G.rune||0)+2; got.push("🌙 ✨ +2"); } }
    else if(i===2){ try{ gz().tk++; got.push("🐘 무기 뽑기권 +1"); }catch(e){ G.ore=(G.ore||0)+5; got.push("🐘 ⛓ +5"); } }
    else if(i===3){ try{ got.push("💎 "+evGear(.4)); }catch(e){ G.rune=(G.rune||0)+3; got.push("💎 ✨ +3"); } }
    else { const now=Date.now(); G.blessUntil=Math.max(G.blessUntil||0,now)+24*3600000; const xp=Math.round(xpNeed(L)*.12); gainXp(xp); got.push(`🍯 하루 동안 경험치 +20% · 경험치 +${fmt(xp)}`); } }
  G.chBest=Math.max(G.chBest||0,st); saveGame();
  setTimeout(()=>{ try{ lvBanner(st>=5?"🍯 불사의 감로까지!":"🌊 바다에서 보물이 떠올랐어요!",`${CH_TRE[st-1].ic} ${CH_TRE[st-1].n}`,got.join(" · "),"#8ac8ff"); }catch(e){ toast("🌊 우유 바다의 보물!",got.join(" · "),3); } jingle([523,659,784,1046,1318]); },quiet?3000:1200); }
function chPastCheck(){ const k=chPrev(); if(k<0||!CH.rec[k]) return; if(Date.now()-chStartOfDay(k)>7*86400000) return; chPay(k,true); }
/* ---------- 매 프레임 ---------- */
function chTick(dt){ if(!started||G.realm<0) return; const now=Date.now(); const cur=chCur(now);
  CH.paidChk-=dt; if(CH.paidChk<=0){ CH.paidChk=10; try{ chRoll(); chPastCheck(); if(CH.dirty&&(CH.part||!CH.pubOnce)){ CH.pubOnce=1; chPub(); } }catch(e){} }
  if(cur>=0&&CH.pubCur!==cur&&G.chK===cur){ CH.pubCur=cur; try{ chPub(); }catch(e){} }
  if(cur>=0&&!CH.ann[cur]&&!CH.on&&!layerOpen){ CH.ann[cur]=1; toast("🌊 우유 바다 젓기 축제가 시작됐어요!","메뉴 🌊 → 다 같이 영차! (30분)",3.2); jingle([392,523,659,784,1046]); }
  for(const nb in CH.peerNb){ if(+nb<Math.round(now/CH_BEAT)-6) delete CH.peerNb[nb]; }
  if(!CH.on) return; if(!chIn(P.x,P.z)){ chExit(true,true); return; } CH.cd=Math.max(0,(CH.cd||0)-dt); const tn=performance.now();
  // 박자 막대
  const ph=(now%CH_BEAT)/CH_BEAT; const nbN=Math.round(now/CH_BEAT); const nextSide=(Math.floor(now/CH_BEAT)+1)%2; const curSide=nbN%2; const mySide=chSideAt(P.x);
  if(CH.bar){ const m=$("chM"), t=$("chT"), l=$("chL"); const pos=((ph+.5)%1); m.style.left=(pos*100).toFixed(1)+"%"; const sideNow=(ph<.5?Math.floor(now/CH_BEAT):Math.floor(now/CH_BEAT)+1)%2; m.textContent=sideNow?"🌙":"🌞"; t.style.background=sideNow===mySide&&chOnDock()?"rgba(255,220,120,.55)":"rgba(160,170,200,.25)"; l.textContent=chActive()?`${sideNow?"🌙 달님":"🌞 해님"} 차례`:"연습"; }
  if(CH.btn){ const mine=curSide===mySide; CH.btn.textContent=`${mySide?"🌙":"🌞"} 영차!`; CH.btn.style.opacity=chOnDock()?"1":".45"; CH.btn.style.transform=`translateX(-50%) scale(${mine&&Math.abs((now/CH_BEAT)-nbN)<.12?1.12:1})`; }
  if(Math.abs(ph)<.03||ph>.97){ if(CH.lastTick!==nbN){ CH.lastTick=nbN; tone(curSide?196:262,.07,"sine",0,.07); } }
  // 산 · 밧줄 · 거품
  const S=G.chK!=null?chSum(G.chK):{tot:0}; const act=chActive(); const tgt=(act?S.tot*.035:0)+tn/1000*(act?.25:.04); CH.mtA+=(tgt-CH.mtA)*Math.min(1,dt*1.5); if(CH.mt) CH.mt.rotation.y=CH.mtA; if(CH.foam){ CH.foam.rotation.y=CH.mtA*.6; CH.foam.children.forEach((t,i)=>{ t.scale.setScalar(1+Math.sin(tn/400+i)*.04*(act?2:1)); }); }
  CH.sway*=Math.pow(.05,dt); if(CH.rope) CH.rope.position.x=CHX+CH.sway*.45; if(CH.shead) CH.shead.rotation.z=Math.sin(tn/300)*.15; if(CH.thead) CH.thead.position.y=1+Math.sin(tn/900)*.25;
  // 보물 단계
  if(G.chK!=null){ const st=act||chCur()===G.chK?chStage(S.tot):0; CH.tre.forEach((g,i)=>{ const v=i<st; if(v&&!g.visible){ g.visible=true; g.userData.rise=0; if(CH.stShown[G.chK+":"+i]!==1){ CH.stShown[G.chK+":"+i]=1; if(act){ fxRing(g.position.x,g.position.z,0xffffff,8,.8); for(let q=0;q<8;q++) setTimeout(()=>fxSpark(g.position.x+rnd(-2,2),2+rnd(0,3),g.position.z+rnd(-2,2),0xbfe0ff,10),q*80); } } } else if(!v) g.visible=false;
      if(g.visible){ g.userData.rise=Math.min(1,(g.userData.rise||0)+dt*.6); const it=g.userData.it; it.position.y=-2+4.2*g.userData.rise+Math.sin(tn/600+i)*.2; it.rotation.y+=dt*.8; } });
    if(act&&CH.part) chPay(G.chK); }
  // 괴물
  if(act){ CH.mobT-=dt; if(CH.mobT<=0&&CH.mobs.length<3){ CH.mobT=70; chSpawnMobs(); } } chMobTick(dt);
  const ex=CH.exitArch; if(ex&&CH.cd<=0&&Math.hypot(P.x-ex.x,P.z-ex.z)<2){ chExit(); return; }
  $("region").innerHTML=act?`🌊 <b>${fmt(S.tot)}/${CH_GOALS[Math.min(4,chStage(S.tot))]}</b> · 보물 ${chStage(S.tot)}/5 · ⏱ ${Math.max(0,Math.ceil((chStartOfDay(chCur())+CH_DUR-now)/60000))}분`:`🌊 우유 바다 <b>연습</b>`; }
XTICK.push(chTick);
function chSky(dt){ SKY.tTop.setHex(0x8ac8ff); SKY.tBot.setHex(0xfff2e0); const k=Math.min(1,dt*1.5); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=80; scene.fog.far=260;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+30,70,P.z+30); sun.target.position.set(P.x,0,P.z); sun.intensity=1; sun.color.setHex(0xfff2e0); hemi.intensity=.6; fill.intensity=.3; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=1; }
function chMinimap(){ const ctx=mctx, S0=fitCanvas(mm); const s=S0*.94/72; const X=x=>S0/2+(x-CHX)*s, Z=z=>S0/2+(z-CHZ-6)*s;
  ctx.fillStyle="#f6f2ea"; ctx.fillRect(0,0,S0,S0); ctx.fillStyle="#9a6a3a"; [[-31,-13,-5,5],[13,31,-5,5],[-31,-24,-5,27],[24,31,-5,27],[-31,31,20,27]].forEach(r=>ctx.fillRect(X(CHX+r[0]),Z(CHZ+r[2]),(r[1]-r[0])*s,(r[3]-r[2])*s));
  dot(ctx,X(CHX),Z(CHZ),10*s,"#4a8a5a"); dot(ctx,X(CHX),Z(CHZ),5*s,"#8a7a68"); ctx.strokeStyle="#3a6aa8"; ctx.lineWidth=Math.max(2,s*1.1); ctx.beginPath(); ctx.moveTo(X(CHX-31),Z(CHZ)); ctx.lineTo(X(CHX+31),Z(CHZ)); ctx.stroke();
  CH.tre.forEach(g=>{ if(g.visible) dot(ctx,X(g.position.x),Z(g.position.z),S0/30,"#ffd24a","#fff",1.5); }); CH.mobs.forEach(m=>dot(ctx,X(m.x),Z(m.z),S0/40,"#ff4a4a","#fff",1));
  for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&chIn(o.x,o.z)) dot(ctx,X(o.x),Z(o.z),S0/36,"#1e8e3e","#fff",1.5); } if(CH.exitArch) dot(ctx,X(CH.exitArch.x),Z(CH.exitArch.z),S0/26,"#ffd27a","#fff",2);
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const q=S0/20; ctx.moveTo(0,-q); ctx.lineTo(q*.7,q*.7); ctx.lineTo(0,q*.35); ctx.lineTo(-q*.7,q*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,"🌊 우유 바다",S0/2,S0*.07,Math.round(S0/12),"#2a4a8a"); }
XZONE.push({on:()=>CH.on,clamp:()=>{ if(!chIn(P.x,P.z)){ chExit(true,true); return false; } if(chWalk(P.x,P.z)){ CH.lastOk={x:P.x,z:P.z}; return true; } const o=CH.lastOk||{x:CHX-20,z:CHZ+23.5}; if(chWalk(P.x,o.z)) P.z=o.z; else if(chWalk(o.x,P.z)) P.x=o.x; else { P.x=o.x; P.z=o.z; } CH.lastOk={x:P.x,z:P.z}; return true; },sky:chSky,mm:chMinimap});
/* ---------- 창 · 메뉴 · 칭호 · 장식 ---------- */
const CH_DECO=DECO.length;
DECO.push({n:"우유 바다의 초승달",ic:"🌙",t:3,sc:14,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.5,.7,.5,mat({color:0x8a7a68}),0,.25,0,10)); const m=new THREE.Mesh(new THREE.TorusGeometry(.8,.26,8,18,Math.PI*1.3),new THREE.MeshBasicMaterial({color:0xfff2b0})); m.position.y=1.6; m.rotation.z=-.6; g.add(m); g.add(sph(.5,glowMat(0xfff2b0,.3),0,1.6,0)); return g; }});
function showChurn(){ const act=chActive(); chRoll(); const k=G.chK; const S=chSum(k); const st=chStage(S.tot); const here=Object.values(PEERS).filter(o=>chIn(o.x,o.z)).length+(CH.on?1:0);
  card(`<h2>🌊 우유 바다 젓기 대축제</h2><p>인도 신화에서 신들이 큰 뱀 <b>바수키</b>를 밧줄 삼아 <b>만다라 산</b>을 돌려 우유 바다를 저었더니 보물이 하나씩 떠올랐대요! 부두에 서서 <b>내 편 차례</b>(🌞 해님 = 서쪽 · 🌙 달님 = 동쪽)에 박자 맞춰 <b>「영차!」</b>. 바로 앞 박에 상대 편이 당겼으면 <b>×1.5</b> — 모르는 사람과 번갈아 당겨요!</p>
   <div class="idlegrid"><div><b>${act?"🎉 지금!":"⏳"}</b><span>${act?`${Math.ceil((chStartOfDay(chCur())+CH_DUR-Date.now())/60000)}분 남음`:"다음: "+chWhen(chNext())}</span></div><div><b>${fmt(S.tot)}</b><span>${act?"모두의 힘":"모아 둔 힘(영웅·거북)"}</span></div><div><b>👥 ${here}</b><span>지금 바다에 있는 사람</span></div></div>
   <div class="idlegrid"><div><b>${G.chS|0}</b><span>이번 축제 내 힘</span></div><div><b>💪 ${chBaked(k)}</b><span>내 영웅이 모아 둔 힘</span></div><div><b>${G.chBest||0}/5</b><span>가장 많이 꺼낸 보물</span></div></div>
   ${CH_TRE.map((T,i)=>`<div class="row"><div class="ic">${T.ic}</div><div class="t"><div>${T.n}${act&&i<st?" <b style=\"color:#7ad87a\">· 떠올랐어요!</b>":""}</div><span>힘 ${fmt(CH_GOALS[i])} · ${T.d}</span></div></div>`).join("")}
   ${CH.on?"":`<button class="go" id="chGo" style="align-self:center">🌊 우유 바다로 가기</button>`}
   <p style="font-size:12px">매주 토·일 오후 4시~4시 30분 · 축제 밖에서는 박자 연습만 · 🐢 거북 할아버지가 6초마다 1씩 보태요 · 내 영웅은 꺼 둔 동안 20분마다 힘 1 (최대 30) · 보물은 한 번이라도 당긴 사람 모두! · 🫧 거품 괴물 조심</p>`);
  const g=$("chGo"); if(g) g.onclick=chEnter; }
MENU_X.push({ic:"🌊",n:"우유 바다 젓기",id:"chBtn",sub:()=>chActive()?`🎉 지금 축제 중! 보물 ${chStage(chSum(G.chK).tot)}/5`:`토·일 오후 4시 · 다음 ${chWhen(chNext())}`,f:showChurn});
TITLES.push({id:"ch1",n:"영차 영차",t:1,h:"🌊 우유 바다 젓기에서 힘 100 모으기",g:()=>[G.chTot||0,100]},{id:"ch2",n:"바수키의 친구",t:2,h:"🌊 한 축제에서 보물 5개 모두 꺼내기",g:()=>[G.chBest||0,5]},{id:"ch3",n:"불사의 감로를 맛본 자",t:3,h:"🌊 힘 3000 모으기",g:()=>[G.chTot||0,3000]});
</script>
