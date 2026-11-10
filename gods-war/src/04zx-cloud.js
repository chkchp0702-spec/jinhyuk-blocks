<script>
/* ================= v103-3: 🏯 구름 나라 옥황 궁궐 — 열두 띠 수호 동물이 사는 새 땅 (IDEAS G11/10-3) =================
   Lv30부터 세계의 중심 북쪽 「🏯 구름 문(홍살문)」 → 지도 밖(x≈-380, z≈-380) 구름 바다 위 옥황 궁궐 + 띠 동물 섬 12개. 괴물 없는 안전한 땅.
   섬마다 띠 수호 동물이 시험을 냄 — 작은 동물은 혼자(👥1), 큰 동물은 여럿(용 👥6). 4가지 놀이:
     🧺 모으기(쥐·토끼·원숭이·닭) · 🛞 밀기(소·양·돼지: 미는 사람이 많을수록 빨라짐) · 🏃 술래잡기(호랑이·뱀·말) · 🛡 지키기(용·개: 여의주/등불을 꼬마 구름 도깨비에게서 지킴)
   사람이 모자라면 쉬고 있는 친구 영웅(💤 그림자) 또는 ☁ 구름 동자가 대신 도와줌(사람보다 조금 느림). 근처에 진짜 사람이 있으면 그 사람 움직임도 내 시험에 그대로 셈.
   처음 깨면 띠 도장 + 큰 상(진짜 사람 2명 이상이면 ×1.5 「함께 깬 시험」). 하루 한 번 다시 깨면 작은 상. 도장 12개 → 띠 동물 하나를 짝꿍 신수로(🐣 신수 도감에 12칸 추가).
   🍑 하늘 복숭아 잔치: 매주 토요일 저녁 8시~8시 15분(한국 시간). 장난꾸러기 구름 원숭이 떼가 복숭아나무로 몰려옴 → 몸으로 막으면(닿으면) 쫓아냄.
      내가 지킨 수는 보관 okf/<주>/<id> → 모두 더한 수만큼 다음 주 궁궐 상점 칸이 열림(100 · 300). 🍑 천도복숭아로 상점에서 뽑기권·재료·신전 장식.
   💤 쉬는 동안 내 영웅이 궁궐 정원사를 도와 2시간마다 🍑 1개(최대 6개) → 복숭아나무에서 받기.
   저장: G.ok={st{k:1},dy{k:날},n,tog,pk(고른 띠),pc(🍑),gt(정원 받은 때),fw,fs,fb}. 칭호 4개. */
const OKX=-380, OKZ=-380, OK_R=106, OK_IR=72, OK_IS=11, OK_PLZ=44;
const OK_ZOD=[
 {n:"쥐",ic:"🐭",ty:"col",need:1,it:"별 치즈",c:0xffe060,pc:0xb8b8c8,pc2:0xffb0c0,f:"round"},
 {n:"소",ic:"🐮",ty:"push",need:2,it:"구름 수레바퀴",c:0xc8a070,pc:0xf4efe6,pc2:0x5a4030,f:"horn"},
 {n:"호랑이",ic:"🐯",ty:"tag",need:3,pc:0xffa040,pc2:0x3a2a20,f:"stripe"},
 {n:"토끼",ic:"🐰",ty:"col",need:1,it:"달 떡",c:0xffffff,pc:0xffffff,pc2:0xffc0d0,f:"long"},
 {n:"용",ic:"🐲",ty:"def",need:6,it:"여의주",c:0x7ad8ff,pc:0x4ac08a,pc2:0xffd24a,f:"dragon"},
 {n:"뱀",ic:"🐍",ty:"tag",need:2,pc:0x8ad04a,pc2:0xffe08a,f:"none"},
 {n:"말",ic:"🐴",ty:"tag",need:3,pc:0xb07a4a,pc2:0x3a2a1a,f:"none",fast:1},
 {n:"양",ic:"🐑",ty:"push",need:2,it:"구름 털실 공",c:0xfffbea,pc:0xfffbea,pc2:0xc8a070,f:"curl"},
 {n:"원숭이",ic:"🐵",ty:"col",need:3,it:"천도복숭아",c:0xff9ab0,pc:0xa0704a,pc2:0xf0c8a0,f:"round"},
 {n:"닭",ic:"🐔",ty:"col",need:1,it:"황금 알",c:0xffd040,pc:0xffffff,pc2:0xff3a3a,f:"comb",bird:1},
 {n:"개",ic:"🐶",ty:"def",need:3,it:"수호 등불",c:0xffb040,pc:0xe0b070,pc2:0x8a5a30,f:"flop"},
 {n:"돼지",ic:"🐷",ty:"push",need:4,it:"커다란 도토리",c:0xa06a3a,pc:0xffb0c0,pc2:0xff8aa0,f:"snout"} ];
const OK_TY={col:{n:"모으기",ic:"🧺"},push:{n:"밀기",ic:"🛞"},tag:{n:"술래잡기",ic:"🏃"},def:{n:"지키기",ic:"🛡"}};
const OK_SHOP=[{n:"물약 3개",ic:"🧪",c:2,t:0,f:()=>{ G.pots+=3; }},{n:"쇳조각 5개",ic:"⛓",c:3,t:0,f:()=>{ G.ore=(G.ore||0)+5; }},
 {n:"무기 뽑기권 1장",ic:"🎟",c:8,t:1,f:()=>{ try{ gz().tk++; }catch(e){} }},{n:"룬 가루 2개",ic:"✨",c:4,t:1,f:()=>{ G.rune=(G.rune||0)+2; }},
 {n:"신전 장식 «구름 궁궐 등불»",ic:"🏮",c:15,t:2,f:()=>{ hmAdd(OK_DECO); }},{n:"신전 장식 «띠 동물 석상»",ic:"🗿",c:25,t:2,f:()=>{ hmAdd(OK_DECO+1); }}];
const OK_TIER=[0,100,300];
const OK={on:false,built:false,parts:[],isl:[],ani:[],gate:null,gateLbl:null,lbls:[],tr:null,bar:null,cd:0,amb:0,t:0,pubT:5,dirty:false,fe:null,feLbl:null,mon:[],tree:null,treeLbl:null,palLbl:null,exit:null,force:0};
const OKF={};   // OKF[주][id]={i,n,s}
function okIn(x,z){ return Math.abs(x-OKX)<150&&Math.abs(z-OKZ)<150; }
function okData(){ const o=G.ok=G.ok||{}; o.st=o.st||{}; o.dy=o.dy||{}; if(o.pk==null) o.pk=-1; o.pc=o.pc||0; return o; }
function okStamps(){ return Object.keys(okData().st).length; }
function okIslPos(k){ const a=-Math.PI/2+k*Math.PI/6; return {x:OKX+Math.cos(a)*OK_IR,z:OKZ+Math.sin(a)*OK_IR,a}; }
function okWeek(){ return Math.floor((kday()+3)/7); }
(function(){ const _h=hAt; hAt=function(x,z){ return okIn(x,z)?0:_h(x,z); }; })();
/* ---------- 띠 짝꿍 신수 (PETS에 12칸) ---------- */
const OKP0=PETS.length;
OK_ZOD.forEach(Z=>PETS.push({n:"띠 수호 "+Z.n,kind:Z.bird?"bird":"pegasus",c:Z.pc,c2:Z.pc2,egg:"구름 무늬 알",zod:1,par:[0,0]}));
try{ OK_ZOD.forEach(Z=>NE_ICON.push(Z.ic)); }catch(e){}
(function(){ const _mp=makePet; makePet=function(r,lv,sh){ const D=PETS[r]; if(!D||!D.zod) return _mp(r,lv,sh); const g=_mp(r,lv,sh); try{ const Z=OK_ZOD[r-OKP0]; const u=g.userData, b=u.body;
    if(Z.f!=="dragon"){ (u.wings||[]).forEach(w=>w.visible=false); u.fly=false; }
    const m2=mat({color:Z.pc2,roughness:.55}), m1=mat({color:Z.pc,roughness:.55}), gold=mat({color:0xffc83a,metalness:.4,roughness:.35});
    b.children.forEach(c=>{ if(c.geometry===GEO.cone&&c.position.y>1&&Math.abs(c.position.x)>.2&&Z.f!=="none") c.visible=false; });
    if(Z.f==="round") [-1,1].forEach(s=>{ const e=sph(.2,m1,s*.32,1.02,.45); e.scale.z=.4; b.add(e); b.add(sph(.12,m2,s*.32,1.02,.5)); });
    if(Z.f==="long") [-1,1].forEach(s=>{ const e=sph(.13,m1,s*.16,1.25,.42); e.scale.set(1,3.2,.6); e.rotation.z=-s*.15; b.add(e); });
    if(Z.f==="flop") [-1,1].forEach(s=>{ const e=sph(.16,m2,s*.42,.75,.5); e.scale.set(.6,1.6,.5); e.rotation.z=s*.3; b.add(e); });
    if(Z.f==="horn"||Z.f==="dragon") [-1,1].forEach(s=>{ const h=new THREE.Mesh(GEO.cone,Z.f==="dragon"?gold:mat({color:0xf3e2b8})); h.scale.set(.1,.36,.1); h.position.set(s*.26,1.1,.5); h.rotation.z=-s*.5; b.add(h); });
    if(Z.f==="dragon") for(let k=0;k<4;k++){ const sp=new THREE.Mesh(GEO.cone,gold); sp.scale.set(.09,.2,.09); sp.position.set(0,.55-k*.05,.1-k*.22); b.add(sp); }
    if(Z.f==="curl") [-1,1].forEach(s=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(.14,.06,6,12),m2); t.position.set(s*.4,.85,.5); t.rotation.y=Math.PI/2; b.add(t); });
    if(Z.f==="curl") for(let k=0;k<6;k++) b.add(sph(.22,m1,Math.cos(k)*.32,.32+(k%2)*.1,Math.sin(k*1.7)*.35));
    if(Z.f==="stripe") for(let k=0;k<3;k++){ const s=box(.9,.08,.12,m2,0,.3,.25-k*.28); s.rotation.x=.2; b.add(s); }
    if(Z.f==="snout"){ const s=cyl(.16,.16,.12,m2,0,.5,1.02,12); s.rotation.x=Math.PI/2; b.add(s); }
    if(Z.f==="comb") for(let k=0;k<3;k++) b.add(sph(.09,mat({color:0xff3a3a}),0,1.06+(k===1?.06:0),.5-k*.1));
  }catch(e){ console.warn(e); } return g; }; })();
/* ---------- 신수 도감에서 띠 신수 설명 ---------- */
(function(){ const _sp=showPets; showPets=function(){ _sp(); try{ const t=`섞인 신수 · 🥚 신수 둥지에서 ${PETS[0].n.replace("아기 ","")}+${PETS[0].n.replace("아기 ","")}`; layers.querySelectorAll(".row span").forEach(s=>{ if(s.textContent===t) s.textContent="🏯 구름 나라 · 띠 도장 12개를 모으면 하나를 골라요"; }); }catch(e){} }; })();
/* ---------- 신전 장식 2개 ---------- */
const OK_DECO=DECO.length;
DECO.push({n:"구름 궁궐 등불",ic:"🏮",t:2,sc:14,p:0,mk:r=>{ const g=new THREE.Group(); g.add(box(.9,.3,.9,mat({color:0x8a7a68}),0,.15,0)); g.add(cyl(.12,.12,2.6,mat({color:0xc8322a}),0,1.6,0,8)); const l=cyl(.55,.55,.9,glowMat(0xff7a4a,.75),0,3,0,10); l.userData.noOutline=true; l.userData.pulse=1; g.add(l); g.add(cyl(.62,.62,.12,mat({color:0x2f8a6a}),0,3.5,0,10)); g.add(cyl(.62,.62,.12,mat({color:0x2f8a6a}),0,2.5,0,10)); return g; }},
 {n:"띠 동물 석상",ic:"🗿",t:3,sc:20,p:0,mk:r=>{ const g=new THREE.Group(); g.add(cyl(1.2,1.4,.8,M.marble,0,.4,0,16)); try{ const k=Math.max(0,(G.ok&&G.ok.pk>=0)?G.ok.pk:2); const p=makePet(OKP0+k,12); p.traverse(o=>{ if(o.isMesh) o.material=M.gold; }); p.scale.multiplyScalar(1.8); p.position.y=.8; g.add(p); }catch(e){} return g; }});
/* ---------- 모양 ---------- */
function okPalace(){ const g=new THREE.Group(); const st=mat({color:0xb0a898,roughness:.9}), st2=mat({color:0x948c7c,roughness:.95}), red=mat({color:0xb8281f,roughness:.6}), grn=mat({color:0x2f8a6a,roughness:.6}), roofM=mat({color:0x3d4b5c,roughness:.55}), gold=M.gold;
  g.add(box(30,1.4,20,st,0,.7,0)); g.add(box(31,.3,21,st2,0,1.45,0)); g.add(box(10,.7,3,st,0,.35,11.3)); g.add(box(10,.35,1.6,st,0,.9,10.6));
  for(let k=0;k<8;k++){ const x=-11.2+k*3.2; g.add(cyl(.42,.48,6,red,x,4.6,6.4,10)); g.add(cyl(.42,.48,6,red,x,4.6,-6.4,10)); }
  [-1,1].forEach(s=>{ g.add(cyl(.42,.48,6,red,s*11.2,4.6,0,10)); });
  g.add(box(25,4.6,11.4,mat({color:0xf2e6cc,roughness:.9}),0,3.9,0)); for(let k=0;k<6;k++) g.add(box(2.2,3,.2,mat({color:0x8a3a2a}),-8+k*3.2,3.4,5.75));
  g.add(box(27,1,15,grn,0,8.1,0)); g.add(box(27.4,.25,15.4,gold,0,7.55,0));
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(.62,1,1,4,1),roofM); roof.rotation.y=Math.PI/4; roof.scale.set(25,4.2,17); roof.position.y=10.7; g.add(roof);
  const eave=new THREE.Mesh(new THREE.CylinderGeometry(1,1.08,1,4,1),roofM); eave.rotation.y=Math.PI/4; eave.scale.set(25.5,.5,17.5); eave.position.y=8.85; g.add(eave);
  g.add(box(17,.9,.9,mat({color:0x2a3440}),0,12.9,0)); [-1,1].forEach(s=>{ const o=new THREE.Mesh(GEO.cone,gold); o.scale.set(.6,1.6,.6); o.position.set(s*8.8,13.6,0); o.rotation.z=s*.35; g.add(o); });
  [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([a,b])=>{ const t=new THREE.Mesh(GEO.cone,roofM); t.scale.set(.7,2,.7); t.position.set(a*17.5,9.6,b*12); t.rotation.z=-a*.9; t.rotation.x=b*.9; g.add(t); });
  const pl=box(5,1.6,.3,mat({color:0x1a2a50}),0,9.2,8.1); g.add(pl); g.add(box(5.4,1.9,.2,gold,0,9.2,8.0));
  [-1,1].forEach(s=>{ const lp=new THREE.Group(); lp.add(cyl(.5,.6,1.4,st,0,.7,0,8)); const f=sph(.5,glowMat(0xffa860,.85),0,1.9,0); f.userData.noOutline=true; lp.add(f); lp.position.set(s*7,0,14.5); g.add(lp); });
  return g; }
function okGateModel(){ const g=new THREE.Group(); const red=mat({color:0xc8322a,roughness:.6}), dk=mat({color:0x3d4b5c,roughness:.6}), gold=M.gold;
  [-1,1].forEach(s=>{ g.add(cyl(.42,.5,7.4,red,s*3,3.7,0,10)); g.add(cyl(.62,.7,.6,mat({color:0x9a8a78}),s*3,.3,0,10)); });
  g.add(box(7.6,.45,.45,red,0,6.2,0)); g.add(box(8.2,.5,.5,red,0,7.3,0)); for(let k=0;k<9;k++){ const sl=cyl(.07,.07,1.6,red,-2.6+k*.65,8.1,0,6); g.add(sl); const tip=new THREE.Mesh(GEO.cone,gold); tip.scale.set(.12,.3,.12); tip.position.set(-2.6+k*.65,9,0); g.add(tip); }
  const tg=new THREE.Group(); tg.position.set(0,8.4,.1); const t1=sph(.5,mat({color:0xc8322a}),0,0,0); tg.add(t1); g.add(tg);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.2,10,40),glowMat(0xbfe8ff,.8)); ring.position.y=3.3; ring.userData.noOutline=true; g.add(ring);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(2.3,40),glowMat(0xffffff,.35)); disc.position.y=3.3; disc.userData.noOutline=true; g.add(disc);
  for(let k=0;k<6;k++){ const c=sph(.9+k%2*.4,mat({color:0xffffff,roughness:1}),Math.cos(k)*3.6,.4,Math.sin(k*1.3)*1.2); c.scale.y=.55; g.add(c); }
  g.userData.ring=ring; g.userData.disc=disc; return g; }
function okTree(){ const g=new THREE.Group(); const tr=mat({color:0x7a5236,roughness:.95}), lf=mat({color:0x6ab85a,roughness:.8}), bl=mat({color:0xffb8d0,roughness:.7}), pm=mat({color:0xffa0a8,roughness:.45,emissive:0x401010});
  g.add(cyl(.7,1,4.5,tr,0,2.25,0,9)); [[0,5.6,0,2.8],[2,5,1,2],[-2,5.2,-.6,2.1],[.6,6.6,-1.4,1.8],[-1,6.4,1.4,1.9]].forEach(([x,y,z,r],i)=>g.add(sph(r,i%2?bl:lf,x,y,z)));
  const pe=new THREE.Group(); for(let k=0;k<14;k++){ const a=k*2.39, rr=1.6+(k%3)*.7; const p=sph(.32,pm,Math.cos(a)*rr,4.4+(k%4)*.7,Math.sin(a)*rr); pe.add(p); } g.add(pe); g.userData.pe=pe;
  g.add(cyl(3.2,3.4,.5,mat({color:0x9a8a78}),0,.25,0,18)); return g; }
function okBuild(){ if(OK.built) return; OK.built=true; const add=o=>{ scene.add(o); OK.parts.push(o); return o; };
  const cloud=mat({color:0xa8b8d4,roughness:1}), puff=mat({color:0xdce6f4,roughness:1}), plz=mat({color:0x957e58,roughness:.95}), grass=mat({color:0x3f9232,roughness:1}), rim=mat({color:0x86704f,roughness:.95}), wood=mat({color:0x74492a,roughness:.9});
  const G0=new THREE.Group();
  const sea=new THREE.Mesh(new THREE.CircleGeometry(OK_R+14,72),cloud); sea.rotation.x=-Math.PI/2; sea.position.set(OKX,-.05,OKZ); G0.add(sea);
  for(let k=0;k<46;k++){ const a=k/46*6.283, rr=OK_R+6+(k*13)%10; const c=sph(4+(k%4)*1.6,puff,OKX+Math.cos(a)*rr,.6+(k%3),OKZ+Math.sin(a)*rr); c.scale.y=.5; G0.add(c); }
  for(let k=0;k<30;k++){ const a=k*2.4, rr=20+(k*37)%80; const c=sph(1.5+(k%3)*.8,puff,OKX+Math.cos(a)*rr,-.2,OKZ+Math.sin(a)*rr); c.scale.y=.3; G0.add(c); }
  const p0=cyl(OK_PLZ,OK_PLZ+.6,.5,plz,OKX,-.2,OKZ,64); G0.add(p0); const gr=new THREE.Mesh(new THREE.RingGeometry(OK_PLZ-2.2,OK_PLZ-1.4,64),M.gold); gr.rotation.x=-Math.PI/2; gr.position.set(OKX,.07,OKZ); G0.add(gr);
  for(let k=0;k<12;k++){ const P1=okIslPos(k); const isl=cyl(OK_IS,OK_IS+.5,.6,grass,P1.x,-.25,P1.z,32); G0.add(isl); const ri=new THREE.Mesh(new THREE.RingGeometry(OK_IS-.3,OK_IS+.5,32),rim); ri.rotation.x=-Math.PI/2; ri.position.set(P1.x,.07,P1.z); G0.add(ri);
    const len=OK_IR-OK_IS-OK_PLZ+2, mx=OKX+Math.cos(P1.a)*(OK_PLZ+len/2-1), mz=OKZ+Math.sin(P1.a)*(OK_PLZ+len/2-1); const br=box(len,.3,3.2,wood,mx,.05,mz); br.rotation.y=-P1.a; G0.add(br);
    const px=P1.x+Math.cos(P1.a)*6.5, pz=P1.z+Math.sin(P1.a)*6.5; G0.add(cyl(1.8,2.1,1,M.marble,px,.5,pz,16)); G0.add(cyl(1.85,1.85,.15,M.gold,px,1.05,pz,16));
    OK.isl.push({k,x:P1.x,z:P1.z,a:P1.a,px,pz}); }
  add(shadowify(G0));
  const pal=okPalace(); pal.position.set(OKX,0,OKZ-6); add(shadowify(pal));
  const tr=okTree(); tr.position.set(OKX+26,0,OKZ+12); add(shadowify(tr)); OK.tree={x:OKX+26,z:OKZ+12,g:tr};
  const ex=okGateModel(); ex.position.set(OKX,0,OKZ+OK_R-6); add(shadowify(ex)); OK.exit={x:OKX,z:OKZ+OK_R-6.6,g:ex};
  OK.isl.forEach(s=>{ const pet=makePet(OKP0+s.k,12); pet.scale.multiplyScalar(2.4); pet.position.set(s.px,1.1,s.pz); pet.rotation.y=Math.atan2(s.x-s.px,s.z-s.pz); add(pet); OK.ani.push({k:s.k,m:pet,y0:1.1,t:Math.random()*6}); });
  OK.parts.forEach(o=>o.traverse&&o.traverse(m=>{ if(m.material&&m.material.blending===THREE.AdditiveBlending){ m.castShadow=false; m.userData.noOutline=true; } })); }
function okShow(v){ OK.parts.forEach(o=>o.visible=v); }
/* ---------- 들어가기 · 나가기 ---------- */
const OK_GATE={x:0,z:-46};
function okEnter(){ if(OK.on||P.dead) return; if(G.lv<30){ toast("🏯 구름 나라는 Lv.30부터 갈 수 있어요",`지금 Lv.${G.lv}`,2); return; } if(P.trial){ toast("승급 시험 중이에요"); return; }
  if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  try{ if(TW.on) twExit(true,true); }catch(e){} try{ if(LV.on) lvExit(true,true); }catch(e){} try{ if(AR.on) arExit(true,true); }catch(e){}
  okBuild(); OK.on=true; okShow(true); OK.cd=2.5; P.x=OKX; P.z=OKZ+32; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul||0,1.5); P.guide=null; $("guide").hidden=true; closeLayer();
  const o=okData(); const first=!o.vis; o.vis=(o.vis||0)+1; saveGame();
  try{ lvBanner("옥황상제의 하늘 궁궐","🏯 구름 나라",first?"열두 섬의 띠 수호 동물이 시험을 내요 — 큰 동물은 여럿이 함께!":`띠 도장 ${okStamps()}/12`,"#bfe8ff"); }catch(e){}
  fxRing(P.x,P.z,0xbfe8ff,8,.8); fxSpark(P.x,2,P.z,0xffffff,30); jingle([523,659,784,1046,1318]); }
function okExit(silent,noTp){ if(!OK.on) return; if(OK.tr) okEndTrial(false,true); OK.on=false; okShow(false); OK.lbls.forEach(l=>l.style.display="none"); [OK.treeLbl,OK.palLbl].forEach(l=>l&&(l.style.display="none")); okMonClear();
  if(!noTp){ P.x=OK_GATE.x; P.z=OK_GATE.z+6; P.y=0; P.vy=0; P.rot=0; OK.cd=4; } if(!silent) toast("세계의 중심으로 돌아왔어요",null,1.6); }
setTimeout(()=>{ try{ const g=okGateModel(); g.position.set(OK_GATE.x,hAt(OK_GATE.x,OK_GATE.z),OK_GATE.z); scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); OK.gate=g; }catch(e){ console.warn(e); } },30);
function okGateNear(){ if(OK.on||!evOver()) return false; if(typeof glAway==="function"&&glAway()) return false; return Math.hypot(P.x-OK_GATE.x,P.z-OK_GATE.z)<5.5; }
/* ---------- 시험 ---------- */
function okRnd(seed){ let s=seed>>>0||1; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function okActors(){ const L=[{x:P.x,z:P.z,me:1}]; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&okIn(o.x,o.z)) L.push({x:o.x,z:o.z,peer:id}); } return L; }
function okRealOn(s){ let n=1; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&Math.hypot(o.x-s.x,o.z-s.z)<OK_IS+6) n++; } return n; }
function okHelperName(i){ const L=[]; try{ for(const id in ROSTER){ const p=ROSTER[id]; if(p&&p.n&&isAway(p)) L.push(p); } }catch(e){} const p=L[i%Math.max(1,L.length)]; return p&&L.length>i?{n:p.n+"의 그림자",r:p.r|0,k:p.k|0,lk:p.lk}:{n:"☁ 구름 동자",r:-1}; }
function okHelperMesh(h){ let m=null; try{ if(h.r>=0){ m=makeAvatar(h.r,h.k||0,false,typeof ghostLook==="function"?ghostLook(h.lk):{}); m.traverse(o=>{ if(o.material&&!o.material._okc){ o.material=o.material.clone(); o.material._okc=1; o.material.transparent=true; o.material.opacity=.6; } }); } }catch(e){ m=null; }
  if(!m){ m=new THREE.Group(); const w=mat({color:0xffffff,roughness:.8}), f=mat({color:0xffe0c8,roughness:.7}); m.add(sph(.7,w,0,.8,0)); m.add(sph(.45,f,0,1.75,0)); m.add(sph(.55,w,0,2.15,-.05)); [-1,1].forEach(s=>m.add(sph(.07,mat({color:0x222222}),s*.16,1.8,.4))); for(let k=0;k<5;k++){ const c=sph(.35,w,Math.cos(k*1.25)*.7,.25,Math.sin(k*1.25)*.7); c.scale.y=.6; m.add(c); } }
  scene.add(m); return m; }
function okIslIn(s,x,z,pad){ const dx=x-s.x, dz=z-s.z, d=Math.hypot(dx,dz), lim=OK_IS-(pad||1); if(d>lim){ return {x:s.x+dx/d*lim,z:s.z+dz/d*lim}; } return {x,z}; }
function okStart(k){ if(OK.tr) return; const Z=OK_ZOD[k], s=OK.isl[k]; const real=okRealOn(s); const hn=Math.max(0,Z.need-real); const R=okRnd(Date.now()); const tr={k,ty:Z.ty,t0:performance.now(),real,need:Z.need,score:0,goal:0,hl:[],objs:[],s};
  for(let i=0;i<hn;i++){ const H=okHelperName(i); const a=R()*6.283; const h={n:H.n,x:s.x+Math.cos(a)*6,z:s.z+Math.sin(a)*6,mv:0,f:0,i}; h.mesh=okHelperMesh(H); h.lbl=makeLabel("ally"); tr.hl.push(h); }
  const add=o=>{ scene.add(o); tr.objs.push(o); return o; };
  if(Z.ty==="col"){ tr.goal=6+Z.need*4; tr.T=40+Z.need*6; tr.items=[]; for(let i=0;i<tr.goal;i++){ const a=R()*6.283, d=2+R()*(OK_IS-3); const x=s.x+Math.cos(a)*d, z=s.z+Math.sin(a)*d; const m=new THREE.Group(); const core=Z.it==="달 떡"?cyl(.35,.35,.25,mat({color:0xffffff,emissive:0x888888,emissiveIntensity:.3}),0,0,0,14):sph(.32,mat({color:Z.c,emissive:Z.c,emissiveIntensity:.35,roughness:.4}),0,0,0); m.add(core); const gl=sph(.55,glowMat(Z.c,.35),0,0,0); gl.userData.noOutline=true; m.add(gl); m.position.set(x,.7,z); add(m); tr.items.push({x,z,m,ph:R()*6}); } }
  if(Z.ty==="push"){ tr.T=65; const ga=s.a+Math.PI; const gx=s.x+Math.cos(ga)*(OK_IS-2.4), gz=s.z+Math.sin(ga)*(OK_IS-2.4); tr.goalP={x:gx,z:gz}; const g=new THREE.Mesh(new THREE.RingGeometry(1.6,2.3,32),glowMat(0x9dffb8,.7)); g.rotation.x=-Math.PI/2; g.position.set(gx,.1,gz); g.userData.noOutline=true; add(g);
    const bx=s.x+Math.cos(s.a)*1.5, bz=s.z+Math.sin(s.a)*1.5; const r=Z.need>=4?1.5:1.15; const bm=new THREE.Group(); const ball=sph(r,mat({color:Z.c,roughness:.7}),0,0,0); bm.add(ball); if(Z.f==="horn"){ const sp=new THREE.Mesh(new THREE.TorusGeometry(r*.95,.12,6,20),mat({color:0x6a4a2a})); bm.add(sp); } if(Z.f==="snout"){ const cap=sph(r*.75,mat({color:0x6a4a2a}),0,r*.55,0); cap.scale.y=.6; bm.add(cap); } bm.position.set(bx,r,bz); add(bm); tr.ball={x:bx,z:bz,r,m:bm,roll:0}; tr.goal=1; tr.d0=Math.hypot(bx-gx,bz-gz); }
  if(Z.ty==="tag"){ tr.goal=2+Z.need; tr.T=50+Z.need*5; const m=makePet(OKP0+k,12); m.scale.multiplyScalar(1.6); m.position.set(s.x,0,s.z); add(m); tr.ani={x:s.x,z:s.z,m,imm:0,sp:5.3+Z.need*.2+(Z.fast?.8:0),h:0,wT:0,wa:0}; const st=OK.ani[k]; if(st) st.m.visible=false; }
  if(Z.ty==="def"){ tr.T=45; const N=Math.max(3,Z.need); tr.orbs=[]; for(let i=0;i<N;i++){ const a=i/N*6.283; const x=s.x+Math.cos(a)*5, z=s.z+Math.sin(a)*5; const m=new THREE.Group(); m.add(cyl(.5,.6,.8,M.marble,0,.4,0,10)); const o=sph(.5,mat({color:Z.c,emissive:Z.c,emissiveIntensity:.6,roughness:.3}),0,1.4,0); m.add(o); const gl=sph(.8,glowMat(Z.c,.35),0,1.4,0); gl.userData.noOutline=true; m.add(gl); m.position.set(x,0,z); add(m); tr.orbs.push({x,z,hp:3,m,o}); }
    tr.imps=[]; tr.spT=1.5; tr.spI=2.6/Math.sqrt(N); tr.goal=Math.ceil(N/2); }
  OK.tr=tr; G.okTry=(G.okTry||0)+1;
  try{ lvBanner(`${Z.ic} ${Z.n}의 시험 — ${OK_TY[Z.ty].ic} ${OK_TY[Z.ty].n}`,okGoalTxt(tr),`${real>1?`👥 진짜 친구 ${real}명`:"👤 나 혼자"}${hn?` + ${tr.hl[0].n.indexOf("그림자")>0?"💤":"☁"} 도우미 ${hn}명`:""} · 권장 👥${Z.need}명`,"#bfe8ff"); }catch(e){}
  jingle([523,659,784]); fxRing(s.x,s.z,0xbfe8ff,OK_IS,.8); }
function okGoalTxt(tr){ const Z=OK_ZOD[tr.k]; return tr.ty==="col"?`${Z.it} ${tr.goal}개를 모두 모아요`:tr.ty==="push"?`${Z.it}을(를) 초록 고리까지 밀어요 — 여럿이 밀면 빨라요`:tr.ty==="tag"?`${Z.n}에게 ${tr.goal}번 닿아요 — 둘러싸서 잡아요`:`${Z.it} ${tr.orbs.length}개 중 ${tr.goal}개 이상 지켜요 — 꼬마 도깨비에게 닿으면 펑!`; }
function okMove(h,tx,tz,sp,dt){ const dx=tx-h.x, dz=tz-h.z, d=Math.hypot(dx,dz); if(d>.1){ const v=Math.min(d,sp*dt); h.x+=dx/d*v; h.z+=dz/d*v; h.f=Math.atan2(dx,dz); h.mv=1; } else h.mv=0; }
function okTickTrial(dt){ const tr=OK.tr; if(!tr) return; const Z=OK_ZOD[tr.k], s=tr.s; tr.el=(tr.el||0)+Math.min(dt,.1); const el=tr.el, left=tr.T-el; const tn=performance.now()/1000;
  if(Math.hypot(P.x-s.x,P.z-s.z)>OK_IS+14){ okEndTrial(false,false,"섬을 떠나서 시험이 멈췄어요"); return; }
  const A=okActors(); tr.hl.forEach(h=>A.push(h));
  if(tr.ty==="col"){ tr.items=tr.items.filter(it=>{ it.ph+=dt*3; it.m.position.y=.7+Math.sin(it.ph)*.15; it.m.rotation.y+=dt*2; for(const a of A){ if(Math.hypot(a.x-it.x,a.z-it.z)<1.7){ scene.remove(it.m); tr.score++; fxSpark(it.x,1,it.z,Z.c,10); tone(880+tr.score*20,.06,"triangle"); if(a.me) floatDmg(it.x,2,it.z,`${Z.ic} ${tr.score}/${tr.goal}`,"gain"); return false; } } return true; });
    tr.hl.forEach((h,i)=>{ let best=null,bd=1e9; tr.items.forEach((it,j)=>{ const d=Math.hypot(it.x-h.x,it.z-h.z)+(j%tr.hl.length===i?0:3); if(d<bd){ bd=d; best=it; } }); if(best) okMove(h,best.x,best.z,5.2,dt); else okMove(h,s.x,s.z,4,dt); });
    if(tr.score>=tr.goal){ okEndTrial(true); return; } }
  if(tr.ty==="push"){ const b=tr.ball, g=tr.goalP; let n=0, vx=0, vz=0; A.forEach(a=>{ const dx=b.x-a.x, dz=b.z-a.z, d=Math.hypot(dx,dz); if(d<b.r+1.6&&d>.05){ n++; vx+=dx/d; vz+=dz/d; } }); const vl=Math.hypot(vx,vz);
    if(n>0&&vl>.01){ const sp=Math.min(3.8,3.4*n/tr.need); const nx=b.x+vx/vl*sp*dt, nz=b.z+vz/vl*sp*dt; const c=okIslIn(s,nx,nz,b.r+.3); b.roll+=sp*dt/b.r; b.x=c.x; b.z=c.z; tr.push=n; } else tr.push=0;
    b.m.position.set(b.x,b.r,b.z); b.m.rotation.x=b.roll;
    A.forEach(a=>{ if(!a.me&&!a.peer) return; const dx=a.x-b.x, dz=a.z-b.z, d=Math.hypot(dx,dz); if(a.me&&d<b.r+.6&&d>.01){ P.x=b.x+dx/d*(b.r+.6); P.z=b.z+dz/d*(b.r+.6); } });
    const gx=g.x-b.x, gz=g.z-b.z, gd=Math.hypot(gx,gz)||1; tr.hl.forEach((h,i)=>{ const lat=(i-(tr.hl.length-1)/2)*1.3; const tx=b.x-gx/gd*(b.r+.9)-gz/gd*lat, tz=b.z-gz/gd*(b.r+.9)+gx/gd*lat; okMove(h,tx,tz,4.6,dt); });
    tr.score=Math.max(0,Math.round((1-gd/tr.d0)*100)); if(gd<1.8){ okEndTrial(true); return; } }
  if(tr.ty==="tag"){ const a=tr.ani; a.imm=Math.max(0,a.imm-dt); let fx=0,fz=0,near=0; A.forEach(q=>{ const dx=a.x-q.x, dz=a.z-q.z, d=Math.hypot(dx,dz); if(d<8&&d>.01){ const w=(8-d)/8; fx+=dx/d*w; fz+=dz/d*w; near++; } });
    const toC={x:s.x-a.x,z:s.z-a.z}, dc=Math.hypot(toC.x,toC.z); if(dc>OK_IS-4){ fx+=toC.x/dc*(dc-(OK_IS-4))*.6; fz+=toC.z/dc*(dc-(OK_IS-4))*.6; }
    let vx=0,vz=0; const fl=Math.hypot(fx,fz); if(fl>.02){ const k=a.imm>0?1.25:1; vx=fx/fl*a.sp*k; vz=fz/fl*a.sp*k; a.wT-=dt; if(a.wT<=0){ a.wT=rnd(.6,1.2); a.wa=rnd(-.8,.8); } const c=Math.cos(a.wa), sn=Math.sin(a.wa); const ox=vx*c-vz*sn, oz=vx*sn+vz*c; vx=ox; vz=oz; } else { a.wT-=dt; if(a.wT<=0){ a.wT=rnd(1,2); a.wa=Math.random()*6.283; } vx=Math.cos(a.wa)*1.5; vz=Math.sin(a.wa)*1.5; }
    const c=okIslIn(s,a.x+vx*dt,a.z+vz*dt,1.2); const mv=Math.hypot(c.x-a.x,c.z-a.z)/Math.max(dt,.001); if(mv>.2) a.h=Math.atan2(c.x-a.x,c.z-a.z); a.x=c.x; a.z=c.z;
    a.m.position.set(a.x,Math.abs(Math.sin(tn*12))*.25*Math.min(1,mv/4),a.z); a.m.rotation.y=a.h; if(a.m.userData.body) a.m.userData.body.rotation.z=Math.sin(tn*14)*.08*Math.min(1,mv/4);
    if(a.imm<=0){ for(const q of A){ if(Math.hypot(q.x-a.x,q.z-a.z)<2.4){ tr.score++; a.imm=1.2; fxSpark(a.x,1.5,a.z,0xffe08a,18); fxRing(a.x,a.z,0xffe08a,3,.4); tone(988,.08,"triangle"); tone(1318,.1,"triangle",.07); floatDmg(a.x,3,a.z,`${Z.ic} 잡았다! ${tr.score}/${tr.goal}`,"gain"); buzz(15); break; } } }
    tr.hl.forEach((h,i)=>{ const n=tr.hl.length+1; const ang=(i+1)/n*6.283+tn*.3; const tx=a.x+Math.cos(ang)*1.6, tz=a.z+Math.sin(ang)*1.6; okMove(h,tx,tz,6.4,dt); });
    if(tr.score>=tr.goal){ okEndTrial(true); return; } }
  if(tr.ty==="def"){ tr.spT-=dt; const alive=tr.orbs.filter(o=>o.hp>0); if(tr.spT<=0&&left>2){ tr.spT=tr.spI; const a=Math.random()*6.283; const x=s.x+Math.cos(a)*(OK_IS-.5), z=s.z+Math.sin(a)*(OK_IS-.5); const m=new THREE.Group(); const body=sph(.45,mat({color:0x9a8ab8,roughness:.7,emissive:0x2a1a4a,emissiveIntensity:.4}),0,.6,0); body.scale.y=.85; m.add(body); [-1,1].forEach(q=>{ m.add(sph(.1,mat({color:0xffffff,emissive:0xffffff,emissiveIntensity:.6}),q*.15,.7,.38)); const h=new THREE.Mesh(GEO.cone,mat({color:0xffd24a})); h.scale.set(.08,.2,.08); h.position.set(q*.2,1.05,0); m.add(h); }); const c=sph(.5,mat({color:0xffffff,roughness:1}),0,.15,0); c.scale.y=.4; m.add(c); m.position.set(x,0,z); scene.add(m); tr.objs.push(m); tr.imps.push({x,z,m,ph:Math.random()*6}); }
    tr.imps=tr.imps.filter(im=>{ let tg=null,bd=1e9; alive.forEach(o=>{ const d=Math.hypot(o.x-im.x,o.z-im.z); if(d<bd){ bd=d; tg=o; } }); if(!tg){ scene.remove(im.m); return false; }
      for(const q of A){ if(Math.hypot(q.x-im.x,q.z-im.z)<1.6){ scene.remove(im.m); tr.score++; fxSpark(im.x,.8,im.z,0xd8c8ff,10); tone(700+Math.random()*300,.05,"triangle"); if(q.me) floatDmg(im.x,2,im.z,"펑!","gain"); return false; } }
      okMove(im,tg.x,tg.z,2.5,dt); im.ph+=dt*8; im.m.position.set(im.x,Math.abs(Math.sin(im.ph))*.3,im.z); im.m.rotation.y=im.f||0;
      if(Math.hypot(tg.x-im.x,tg.z-im.z)<1){ tg.hp--; scene.remove(im.m); fxSpark(tg.x,1.4,tg.z,0xff6a6a,12); tone(220,.12,"sawtooth"); if(tg.hp<=0){ tg.o.material.emissiveIntensity=0; tg.o.material.color.setHex(0x555566); tg.m.children.forEach(c=>{ if(c.material&&c.material.blending===THREE.AdditiveBlending) c.visible=false; }); floatDmg(tg.x,2.6,tg.z,`${Z.it} 꺼짐!`,""); } return false; } return true; });
    tr.orbs.forEach(o=>{ if(o.hp>0){ o.o.position.y=1.4+Math.sin(tn*2+o.x)*.12; o.o.scale.setScalar(.6+o.hp*.13); } });
    tr.hl.forEach((h,i)=>{ const o=tr.orbs[i%tr.orbs.length]; let tg=null,bd=6.5; tr.imps.forEach(im=>{ const d=Math.hypot(im.x-o.x,im.z-o.z); if(d<bd){ bd=d; tg=im; } }); if(tg) okMove(h,tg.x,tg.z,5,dt); else okMove(h,o.x+1.2,o.z+1.2,4,dt); });
    if(alive.length<tr.goal){ okEndTrial(false,false,`${Z.it}이(가) 너무 많이 꺼졌어요`); return; } if(left<=0){ okEndTrial(true); return; } }
  if(left<=0&&OK.tr){ okEndTrial(false,false,"시간이 다 됐어요"); return; }
  tr.hl.forEach(h=>{ h.mesh.position.set(h.x,Math.abs(Math.sin(tn*9+h.i))*(h.mv?.15:0),h.z); h.mesh.rotation.y=h.f||0; const u=h.mesh.userData; if(u&&u.legL){ const sw=h.mv?Math.sin(tn*10+h.i)*.7:0; u.legL.rotation.x=sw; u.legR.rotation.x=-sw; } if(!layerOpen) placeLabel(h.lbl,h.x,3.2,h.z,h.n); else h.lbl.style.display="none"; });
  okBar(tr,left); }
function okBar(tr,left){ if(!OK.bar){ const b=document.createElement("div"); b.id="okBar"; b.hidden=true; document.body.appendChild(b); OK.bar=b; } const b=OK.bar; if(!tr||layerOpen){ if(!b.hidden) b.hidden=true; return; } b.hidden=false;
  const Z=OK_ZOD[tr.k]; const sec=Math.max(0,Math.ceil(left)); const prog=tr.ty==="col"?`${Z.it} ${tr.score}/${tr.goal}`:tr.ty==="push"?`${Z.it} ${tr.score}% · 미는 사람 ${tr.push||0}/${tr.need}`:tr.ty==="tag"?`잡기 ${tr.score}/${tr.goal}`:`${Z.it} ${tr.orbs.filter(o=>o.hp>0).length}/${tr.orbs.length} (${tr.goal}개 지키기) · 펑 ${tr.score}`;
  const h=`<b>${Z.ic} ${Z.n}의 시험 · ${prog}</b><span>⏱ ${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")} · 👥 ${tr.real}명${tr.hl.length?` + 도우미 ${tr.hl.length}`:""}</span>`; if(b._h!==h){ b._h=h; b.innerHTML=h; } }
function okEndTrial(win,silent,why){ const tr=OK.tr; if(!tr) return; OK.tr=null; tr.objs.forEach(o=>scene.remove(o)); tr.hl.forEach(h=>{ scene.remove(h.mesh); h.lbl.remove(); }); const st=OK.ani[tr.k]; if(st) st.m.visible=true; okBar(null);
  if(silent) return; const Z=OK_ZOD[tr.k]; if(!win){ toast(`${Z.ic} 아쉬워요!`,(why||"")+" · 동물 앞에서 다시 도전해요",2.4); tone(330,.2,"triangle"); return; }
  const o=okData(), d=kday(), first=!o.st[tr.k], daily=o.dy[tr.k]!==d; const tog=tr.real>=2; const mul=tog?1.5:1; let gold=0,xp=0,rune=0,pc=0;
  if(first){ gold=300+G.lv*25; xp=Math.round(xpNeed(G.lv)*.15); rune=2; pc=5; o.st[tr.k]=Date.now(); }
  else if(daily){ gold=80+G.lv*8; xp=Math.round(xpNeed(G.lv)*.04); pc=2; }
  if(first||daily){ o.dy[tr.k]=d; gold=Math.round(gold*mul); xp=Math.round(xp*mul); G.gold+=gold; gainXp(xp); G.rune=(G.rune||0)+rune; o.pc+=pc; }
  o.n=(o.n||0)+1; if(tog) o.tog=(o.tog||0)+1; saveGame(); try{ COINFLY.burst(P.x,1.6,P.z,first?10:5); }catch(e){} jingle(first?[523,659,784,1046,1318,1568]:[523,659,784,1046]); buzz([20,30,40]); fxRing(tr.s.x,tr.s.z,0xffe08a,OK_IS,1);
  const sub=first||daily?`금화 +${fmt(gold)} · 경험치 +${fmt(xp)}${rune?` · ✨ +${rune}`:""} · 🍑 +${pc}${tog?" · 👥 함께 깬 시험 ×1.5":""}`:"오늘 상은 이미 받았어요 · 연습 성공!";
  try{ lvBanner(first?`${Z.ic} 띠 도장을 받았어요!`:`${Z.ic} ${Z.n}의 시험 성공!`,first?`띠 도장 ${okStamps()}/12`:`${OK_TY[tr.ty].ic} ${OK_TY[tr.ty].n}`,sub,"#bfe8ff"); }catch(e){ toast(`${Z.ic} 성공!`,sub,3); }
  if(first&&okStamps()>=12&&o.pk<0) setTimeout(()=>{ if(OK.on) okPetCard(); },3200); }
function okPetCard(){ const o=okData(); if(o.pk>=0||okStamps()<12) return;
  card(`<h2>🐲 열두 띠의 친구!</h2><p>띠 도장 12개를 다 모았어요! 마음에 드는 <b>띠 수호 동물</b> 하나가 짝꿍 신수로 와요. (한 번만 고를 수 있어요)</p>
   <div class="exgrid">${OK_ZOD.map((Z,k)=>`<button class="buy" data-zp="${k}">${Z.ic} ${Z.n}</button>`).join("")}</div>`);
  layers.querySelectorAll("[data-zp]").forEach(b=>b.onclick=()=>{ const k=+b.dataset.zp; const r=OKP0+k; o.pk=k; petData(); if(!G.pets[r]) G.pets[r]={lv:1,xp:0,t:Date.now()}; G.pet=r; saveGame(); try{ rebuildMyPet(); net.hello(); net.pushProfile(1); }catch(e){} closeLayer();
    jingle([523,659,784,1046,1318,1568]); try{ lvBanner("🐣 새 짝꿍 신수!",PETS[r].n,"이제 나를 따라다녀요 · 🐣 신수 도감에서 바꿀 수 있어요","#ffe08a"); }catch(e){} }); }
/* ---------- 🍑 하늘 복숭아 잔치 ---------- */
function okFeast(){ const now=Date.now(); if(OK.force&&now<OK.force+15*60000) return {t:OK.force,w:okWeek()}; const k=kday(); for(let d=k-1;d<=k+7;d++){ if((d+4)%7!==6) continue; const t=d*86400000-9*3600000+20*3600000; if(now<t+15*60000) return {t,w:Math.floor((d+3)/7)}; } return null; }
function okFeastLive(){ const f=okFeast(); return f&&Date.now()>=f.t&&Date.now()<f.t+15*60000?f:null; }
function okFeastTotal(w){ const L=OKF[w]||{}; let s=0; for(const id in L) s+=L[id].s||0; const o=okData(); if(o.fw===w&&!(L[G.id])) s+=o.fs||0; return s; }
function okTier(){ const w=okWeek(); const prev=okFeastTotal(w-1), cur=okFeastTotal(w); const v=Math.max(prev,okFeastLive()?cur:0); let t=0; OK_TIER.forEach((m,i)=>{ if(v>=m) t=i; }); return {t,v,prev,cur}; }
NETX.push({sub:"okf/+/+",pre:"okf/",f:(d,topic)=>{ const a=String(topic).split("/"); const w=+a[1], id=a[2]; if(!d||!id||!(w>0)) return; (OKF[w]=OKF[w]||{})[id]={i:id,n:String(d.n||"?").slice(0,8),s:Math.max(0,Math.min(999,d.s|0))}; }});
function okFeastPub(){ const o=okData(); if(!o.fw) return; try{ net.pushRet("okf/"+o.fw+"/"+G.id,{n:G.name,s:o.fs||0,t:Date.now()}); OK.dirty=false; }catch(e){} }
function okMonClear(){ OK.mon.forEach(m=>scene.remove(m.m)); OK.mon=[]; }
function okMonMesh(){ const g=new THREE.Group(); const fur=mat({color:0xd8d0e8,roughness:.9}), face=mat({color:0xffe0c8,roughness:.8}); g.add(sph(.55,fur,0,.9,0)); g.add(sph(.42,fur,0,1.6,.1)); g.add(sph(.3,face,0,1.55,.32)); [-1,1].forEach(s=>{ g.add(sph(.16,fur,s*.42,1.7,.05)); g.add(sph(.06,mat({color:0x222222}),s*.1,1.62,.6)); }); const t=new THREE.Mesh(new THREE.TorusGeometry(.35,.07,6,12,Math.PI*1.3),fur); t.position.set(0,1,-.5); g.add(t); const c=sph(.6,mat({color:0xffffff,roughness:1}),0,.2,0); c.scale.y=.4; g.add(c); return g; }
function okFeastTick(dt){ const f=okFeastLive(), o=okData(); const tr=OK.tree;
  if(f&&OK.feT!==f.t){ OK.feT=f.t; if(o.fw!==f.w){ o.fw=f.w; o.fs=0; } OK.fePe=60; if(!layerOpen&&started) toast("🍑 구름 나라 하늘 복숭아 잔치!","장난꾸러기 구름 원숭이가 복숭아를 훔치러 와요 · 15분 동안 몸으로 막아요!",3.4); jingle([659,784,988,1318]); }
  if(!f){ if(OK.mon.length) okMonClear(); return; } if(!OK.on||!tr) return;
  OK.feSp=(OK.feSp||0)-dt; const ppl=okActors().length; if(OK.feSp<=0&&OK.mon.length<6+ppl*3){ OK.feSp=Math.max(.4,1.6-ppl*.2); const a=Math.random()*6.283; const x=tr.x+Math.cos(a)*30, z=tr.z+Math.sin(a)*30; const m=okMonMesh(); m.position.set(x,0,z); scene.add(m); OK.mon.push({x,z,m,st:0,ph:Math.random()*6,sp:rnd(4.2,5.6)}); }
  const A=okActors(); const tn=performance.now()/1000;
  OK.mon=OK.mon.filter(mo=>{ for(const q of A){ if(Math.hypot(q.x-mo.x,q.z-mo.z)<1.8){ scene.remove(mo.m); fxSpark(mo.x,1,mo.z,0xffb8d0,12); if(q.me){ o.fs=(o.fs||0)+1; o.pc+=1; OK.dirty=true; floatDmg(mo.x,2.4,mo.z,`🍑 지켰다! ${o.fs}`,"gain"); tone(880+Math.random()*200,.06,"triangle"); } return false; } }
    if(mo.st===0){ okMove(mo,tr.x,tr.z,mo.sp,dt); if(Math.hypot(mo.x-tr.x,mo.z-tr.z)<3.6){ mo.st=1; OK.fePe=Math.max(0,(OK.fePe||60)-1); mo.away=Math.random()*6.283; floatDmg(mo.x,3,mo.z,"🍑 쏙!",""); } }
    else { okMove(mo,tr.x+Math.cos(mo.away)*40,tr.z+Math.sin(mo.away)*40,mo.sp*1.2,dt); if(Math.hypot(mo.x-tr.x,mo.z-tr.z)>36){ scene.remove(mo.m); return false; } }
    mo.ph+=dt*10; mo.m.position.set(mo.x,Math.abs(Math.sin(mo.ph))*.5,mo.z); mo.m.rotation.y=mo.f||0; return true; });
  if(tr.g&&tr.g.userData.pe){ const n=Math.ceil((OK.fePe==null?60:OK.fePe)/60*14); tr.g.userData.pe.children.forEach((p,i)=>p.visible=i<n); }
  OK.pubT-=dt; if(OK.dirty&&OK.pubT<=0){ OK.pubT=8; okFeastPub(); } }
/* ---------- 매 프레임 ---------- */
function okTick(dt){ if(!started||G.realm<0) return; const tn=performance.now(); OK.cd=Math.max(0,OK.cd-dt);
  if(OK.gate){ const u=OK.gate.userData; u.ring.rotation.z+=dt*1.2; u.disc.material.opacity=.25+Math.sin(tn/260)*.1; if(!OK.gateLbl) OK.gateLbl=makeLabel("ally"); if(!OK.on&&!layerOpen&&evOver()&&Math.hypot(P.x-OK_GATE.x,P.z-OK_GATE.z)<34) placeLabel(OK.gateLbl,OK_GATE.x,10.2,OK_GATE.z,`🏯 <b>구름 나라</b>${okFeastLive()?" · 🍑 잔치 중!":""}`); else OK.gateLbl.style.display="none"; }
  okFeastTick(dt);
  if(!OK.on) return; if(!okIn(P.x,P.z)){ okExit(true,true); return; }
  if(OK.exit){ const u=OK.exit.g.userData; u.ring.rotation.z+=dt*1.2; if(OK.cd<=0&&!OK.tr&&Math.hypot(P.x-OK.exit.x,P.z-OK.exit.z)<2.6){ okExit(); return; } }
  OK.ani.forEach(a=>{ a.t+=dt; if(a.m.visible){ a.m.position.y=a.y0+Math.abs(Math.sin(a.t*2.2))*.25; const u=a.m.userData; if(u&&u.body) u.body.rotation.z=Math.sin(a.t*1.6)*.06; } });
  okTickTrial(dt);
  while(OK.lbls.length<12) OK.lbls.push(makeLabel("ally")); const o=okData(), d=kday();
  OK.isl.forEach((s,i)=>{ const l=OK.lbls[i]; const dist=Math.hypot(P.x-s.px,P.z-s.pz); if(layerOpen||dist>40||(OK.tr&&OK.tr.k!==i)){ l.style.display="none"; return; } const Z=OK_ZOD[i];
    placeLabel(l,s.px,6.8,s.pz,`${o.st[i]?"🔖":""}${Z.ic} <b>${Z.n}</b> <span style="font-size:11px">${OK_TY[Z.ty].ic}${OK_TY[Z.ty].n} · 👥${Z.need}${o.dy[i]===d?" · 오늘 ✅":""}</span>`); });
  if(!OK.treeLbl) OK.treeLbl=makeLabel("ally"); if(!OK.palLbl) OK.palLbl=makeLabel("boss");
  if(!layerOpen&&Math.hypot(P.x-OK.tree.x,P.z-OK.tree.z)<30){ const f=okFeastLive(); placeLabel(OK.treeLbl,OK.tree.x,9,OK.tree.z,f?`🍑 <b>복숭아 잔치!</b> 내가 지킨 ${o.fs||0}`:`🍑 <b>하늘 복숭아나무</b>${okGarden()>0?` · 씨 ${okGarden()}개`:""}`); } else OK.treeLbl.style.display="none";
  if(!layerOpen&&Math.hypot(P.x-OKX,P.z-OKZ)<46) placeLabel(OK.palLbl,OKX,15.5,OKZ-6,`🏯 옥황 궁궐 <b>띠 도장 ${okStamps()}/12</b>`); else OK.palLbl.style.display="none";
  OK.amb-=dt; if(OK.amb<=0){ OK.amb=ECO()?.7:.3; fxSpark(P.x+rnd(-30,30),rnd(.5,3),P.z+rnd(-30,30),0xffffff,2); }
  $("region").innerHTML=OK.tr?`🏯 구름 나라 <b>${OK_ZOD[OK.tr.k].ic} 시험 중</b>`:`🏯 구름 나라 <b>띠 도장 ${okStamps()}/12 · 🍑 ${o.pc}</b>`; }
XTICK.push(okTick);
function okGarden(){ const o=okData(); if(!o.gt){ o.gt=Date.now(); return 0; } return Math.min(6,Math.floor((Date.now()-o.gt)/(2*3600000))); }
function okGardenTake(){ const n=okGarden(); if(n<=0){ toast("🍑 아직 복숭아 씨가 없어요","내가 쉬는 동안 2시간마다 1개씩 모여요 (최대 6개)",2); return; } const o=okData(); o.pc+=n; o.gt=Date.now(); saveGame(); jingle([659,880,1046]); toast(`🍑 천도복숭아 +${n}`,"쉬는 동안 내 영웅이 궁궐 정원사를 도왔어요 · 궁궐 상점에서 써요",2.6); }
CTX_EXTRA.push(()=>{ if(okGateNear()) return {t:G.lv>=30?"🏯 구름 나라로":"🏯 구름 나라 (Lv.30)",f:okEnter};
  if(!OK.on||OK.tr) return null;
  for(const s of OK.isl){ if(Math.hypot(P.x-s.px,P.z-s.pz)<4.2){ const Z=OK_ZOD[s.k]; const done=okData().dy[s.k]===kday(); return {t:`${Z.ic} ${Z.n}의 시험 ${OK_TY[Z.ty].ic}${done?" (연습)":""}`,f:()=>okStart(s.k)}; } }
  if(Math.hypot(P.x-OK.tree.x,P.z-OK.tree.z)<5&&!okFeastLive()) return {t:`🍑 복숭아 씨 받기${okGarden()?` (${okGarden()})`:""}`,f:okGardenTake};
  if(Math.hypot(P.x-OKX,P.z-(OKZ+8))<5.5) return {t:"🏯 궁궐 상점",f:okShop};
  if(okData().pk<0&&okStamps()>=12&&Math.hypot(P.x-OKX,P.z-(OKZ+8))<9) return {t:"🐲 띠 짝꿍 고르기",f:okPetCard};
  return null; });
/* ---------- 울타리 · 하늘 · 지도 ---------- */
function okClamp(){ if(!okIn(P.x,P.z)){ okExit(true,true); return false; } const r=Math.hypot(P.x-OKX,P.z-OKZ); if(r>OK_R-1.5){ const k=(OK_R-1.5)/r; P.x=OKX+(P.x-OKX)*k; P.z=OKZ+(P.z-OKZ)*k; }
  const bx=OKX, bz=OKZ-6, hx=15.8, hz=10.8; const dx=P.x-bx, dz=P.z-bz; if(Math.abs(dx)<hx&&Math.abs(dz)<hz){ if(hx-Math.abs(dx)<hz-Math.abs(dz)) P.x=bx+Math.sign(dx||1)*hx; else P.z=bz+Math.sign(dz||1)*hz; }
  const t=OK.tree; if(t){ const ex=P.x-t.x, ez=P.z-t.z, d=Math.hypot(ex,ez); if(d<3.6&&d>.01){ P.x=t.x+ex/d*3.6; P.z=t.z+ez/d*3.6; } }
  OK.isl.forEach(s=>{ const ex=P.x-s.px, ez=P.z-s.pz, d=Math.hypot(ex,ez); if(d<2.3&&d>.01){ P.x=s.px+ex/d*2.3; P.z=s.pz+ez/d*2.3; } }); return true; }
function okSky(dt){ SKY.tTop.setHex(0x4a86d8); SKY.tBot.setHex(0xcfe0ff); const k=Math.min(1,dt*1.5); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=110; scene.fog.far=360;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+40,90,P.z+30); sun.target.position.set(P.x,0,P.z); const e=ECO(); sun.intensity=e?.8:.95; sun.color.setHex(0xfff0e0); hemi.intensity=e?.34:.44; fill.intensity=e?.15:.2; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=e?.78:.84; }
function okMinimap(){ const ctx=mctx, S=fitCanvas(mm); const s=S*.94/(OK_R*2+8); const X=x=>S/2+(x-OKX)*s, Z=z=>S/2+(z-OKZ)*s;
  ctx.fillStyle="#9fc8f0"; ctx.fillRect(0,0,S,S); dot(ctx,X(OKX),Z(OKZ),OK_R*s,"#ffffff","#dbe8f8",2); dot(ctx,X(OKX),Z(OKZ),OK_PLZ*s,"#eae2d2","#ffc83a",2);
  const o=okData(); OK.isl.forEach(i=>{ dot(ctx,X(i.x),Z(i.z),OK_IS*s,o.st[i.k]?"#bfe6a0":"#8fd47a","#fff",1.5); mmLabel(ctx,OK_ZOD[i.k].ic,X(i.x),Z(i.z),Math.round(S/16),"#fff"); });
  ctx.fillStyle="#c8322a"; ctx.fillRect(X(OKX-15),Z(OKZ-16),30*s,20*s); if(OK.tree) mmLabel(ctx,"🍑",X(OK.tree.x),Z(OK.tree.z),Math.round(S/16),"#fff"); if(OK.exit) dot(ctx,X(OK.exit.x),Z(OK.exit.z),S/30,"#ffd27a","#fff",2);
  for(const id in PEERS){ const q=PEERS[id]; if(!q.dead&&okIn(q.x,q.z)) dot(ctx,X(q.x),Z(q.z),S/36,"#1e8e3e","#fff",1.5); }
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const q=S/20; ctx.moveTo(0,-q); ctx.lineTo(q*.7,q*.7); ctx.lineTo(0,q*.35); ctx.lineTo(-q*.7,q*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,"🏯 구름 나라",S/2,S*.07,Math.round(S/12),"#fff"); }
XZONE.push({on:()=>OK.on,clamp:okClamp,sky:okSky,mm:okMinimap});
MAP_X.push((ctx,tx,tz,big,u)=>{ mapPin(ctx,tx(OK_GATE.x),tz(OK_GATE.z),(big?6:7.5)*u,"#c8322a","🏯"); });
/* ---------- 친구 위치·곁으로 가기에서 구름 나라 알아보기 ---------- */
(function(){ try{ const _fz=frZone; frZone=function(x,z){ return okIn(x,z)?"🏯 구름 나라":_fz(x,z); }; const _fa=frArea; frArea=function(x,z){ return okIn(x,z)?"ok":_fa(x,z); };
  const _ft=frTeleport; frTeleport=function(id){ const o=PEERS[id]; if(o&&okIn(o.x,o.z)&&!OK.on){ if(CQ.tpT>0||P.dead||P.trial){ return _ft(id); } okEnter(); if(!OK.on) return; } else if(o&&!okIn(o.x,o.z)&&OK.on){ okExit(true,true); } return _ft(id); }; }catch(e){ console.warn(e); } })();
/* ---------- 창 ---------- */
function okShop(){ const o=okData(), T=okTier();
  card(`<h2>🏯 옥황 궁궐 상점</h2><p>🍑 천도복숭아로 사요(진짜 돈 없음). 토요일 저녁 <b>하늘 복숭아 잔치</b>에서 모두가 지킨 복숭아가 많을수록 다음 주에 더 많은 칸이 열려요!</p>
   <div class="idlegrid"><div><b>🍑 ${o.pc}</b><span>내 천도복숭아</span></div><div><b>${fmt(T.v)}</b><span>${T.prev>=T.cur||!okFeastLive()?"지난 잔치에서 모두가 지킨 복숭아":"이번 잔치 (지금)"}</span></div></div>
   ${OK_SHOP.map((it,i)=>{ const lock=it.t>T.t; return `<div class="row"${lock?' style="opacity:.55"':""}><div class="ic">${it.ic}</div><div class="t"><div>${it.n}</div><span>${lock?`🔒 모두 함께 복숭아 ${OK_TIER[it.t]}개를 지키면 열려요`:`🍑 ${it.c}개`}</span></div>${lock?"":`<button class="buy" data-sh="${i}" ${o.pc<it.c?"disabled":""}>사기</button>`}</div>`; }).join("")}`);
  layers.querySelectorAll("[data-sh]").forEach(b=>b.onclick=()=>{ const it=OK_SHOP[+b.dataset.sh]; if(o.pc<it.c) return; o.pc-=it.c; it.f(); saveGame(); jingle([659,880]); toast(`🏯 ${it.ic} ${it.n}`,`🍑 −${it.c}`,1.6); okShop(); }); }
function showCloud(){ const o=okData(), d=kday(), f=okFeast(), live=okFeastLive();
  const fd=f?new Date(f.t+9*3600000):null; const ftxt=live?"🍑 <b>지금 하늘 복숭아 잔치 중!</b> 구름 나라 복숭아나무로!":f?`🍑 다음 하늘 복숭아 잔치: ${fd.getUTCMonth()+1}/${fd.getUTCDate()}(토) 저녁 8시`:"";
  card(`<h2>🏯 구름 나라 옥황 궁궐</h2><p>세계의 중심 북쪽 <b>🏯 구름 문</b>(Lv.30)으로 가면 하늘 위 궁궐과 띠 동물 섬 12개! 섬마다 띠 수호 동물이 시험을 내요. <b>작은 동물은 혼자, 큰 동물은 여럿이</b> — 사람이 모자라면 💤 쉬는 친구의 그림자나 ☁ 구름 동자가 도와줘요.</p>
   <div class="idlegrid"><div><b>🔖 ${okStamps()}/12</b><span>띠 도장</span></div><div><b>🍑 ${o.pc}</b><span>천도복숭아</span></div><div><b>👥 ${o.tog||0}</b><span>함께 깬 시험</span></div></div>
   <p style="font-size:13px;text-align:center">${ftxt}</p>
   <div class="diary">${OK_ZOD.map((Z,k)=>`<p>${o.st[k]?"🔖":"⬜"} ${Z.ic} <b>${Z.n}</b> · ${OK_TY[Z.ty].ic} ${OK_TY[Z.ty].n} · 👥${Z.need}명${o.dy[k]===d?" · 오늘 ✅":""}</p>`).join("")}</div>
   ${o.pk>=0?`<p style="font-size:13px">🐣 내 띠 짝꿍: ${OK_ZOD[o.pk].ic} ${PETS[OKP0+o.pk].n}</p>`:`<p style="font-size:12px">🔖 도장 12개를 다 모으면 띠 동물 하나가 짝꿍 신수로 와요!</p>`}
   <p style="font-size:12px">처음 깨면 도장 + 큰 상 · 하루 한 번 다시 깨면 작은 상 · 진짜 사람 2명 이상이면 상 ×1.5. 💤 쉬는 동안 내 영웅이 2시간마다 🍑 1개를 모아 둬요(복숭아나무에서 받기, 최대 6개).</p>
   <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${OK.on?'<button class="buy alt" id="okShopB">🏯 궁궐 상점</button>':'<button class="go" id="okGo">🧭 구름 문으로 길 안내</button>'}${o.pk<0&&okStamps()>=12?'<button class="buy" id="okPk">🐲 띠 짝꿍 고르기</button>':""}</div>`);
  if($("okGo")) $("okGo").onclick=()=>{ closeLayer(); if(Math.hypot(P.x-OK_GATE.x,P.z-OK_GATE.z)<8) okEnter(); else setGuide({x:OK_GATE.x,z:OK_GATE.z+5,label:"🏯 구름 문"}); };
  if($("okShopB")) $("okShopB").onclick=okShop; if($("okPk")) $("okPk").onclick=okPetCard; }
MENU_X.push({ic:"🏯",n:"구름 나라 옥황 궁궐",id:"okBtn",sub:()=>`${okFeastLive()?"🍑 복숭아 잔치 중! · ":""}띠 도장 ${okStamps()}/12 · 🍑 ${okData().pc}${G.lv<30?" · Lv.30부터":""}`,f:showCloud});
TITLES.push({id:"ok1",n:"구름 나라 손님",t:1,h:"띠 도장 1개 받기",g:()=>[okStamps(),1]},{id:"ok12",n:"열두 띠의 친구",t:3,h:"띠 도장 12개 모두 받기",g:()=>[okStamps(),12]},
 {id:"okt10",n:"함께 여는 하늘 문",t:2,h:"진짜 친구와 함께 띠 시험 10번 깨기",g:()=>[(G.ok&&G.ok.tog)||0,10]},{id:"okf30",n:"복숭아 지킴이",t:2,h:"복숭아 잔치에서 원숭이 30마리 쫓기",g:()=>[(G.ok&&G.ok.fs)||0,30]});
</script>
<style>
#okBar{position:fixed;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);z-index:5;pointer-events:none;min-width:250px;max-width:min(60vw,480px);padding:5px 14px 7px;border-radius:14px;background:linear-gradient(180deg,rgba(30,60,100,.9),rgba(20,34,60,.9));border:2px solid #bfe8ff;box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 14px rgba(191,232,255,.4);color:#fff;text-align:center;display:flex;flex-direction:column;gap:1px}
#okBar[hidden]{display:none} #okBar b{font-size:14px;color:#e8f6ff;text-shadow:0 2px 0 #000} #okBar span{font-size:12px;opacity:.92}
</style>
