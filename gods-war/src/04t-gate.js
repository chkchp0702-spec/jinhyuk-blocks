<script>
/* ================= v42-3: 🔓 다섯 번째 세계의 문 — 모두 함께 여는 「태양의 사막」 (IDEAS G11/4-9) =================
   세계의 중심(옴팔로스) 남쪽 모래 속에 거대한 문이 묻혀 있음. 네 세계 모든 사람이 ☀ 태양 열쇠 조각을 바치면
   모두의 몫이 더해져(보관 retained gt/<id> → 다 더하기, 04o 불가사의와 같은 방식) 문이 5단계로 솟아오름.
   조각: 괴물 30%(보스 5개) · 별 4개 이상 물고기 2개 · 미궁 정복 10개 · 쉬는 동안 10분에 1개(최대 40개, 바로 바침).
   5단계가 되는 날 모래 폭풍과 함께 문이 열림(한 번 열리면 닫히지 않음, G.gtMax). 처음 연 날짜와 가장 많이 바친 10명이 문 기둥에 새겨짐.
   열린 문으로 걸어 들어가면 지도 밖(z≈700) 「태양의 사막」: 피라미드·나일 강·스핑크스·야자수.
   새 괴물(모래 전갈·미라 병사·딱정벌레 떼·모래 코브라, 내 레벨에 맞춰 나옴) + 4분마다(모든 폰이 같은 시각) 깨어나는 「혼돈의 뱀 아펩」
   — 친구가 준 데미지도 내 화면 보스에 깎임(t:"dsh"). 아펩: 신화 장비 · 처음 이기면 아기 불사조 알(다섯 번째 신수). */
const GT_POS={x:0,z:40};
const GT_ST=[200,700,1600,3000,5000];
const GT_TXT=["문 꼭대기가 모래 위로","두 기둥이 솟아요","오벨리스크가 깨어나요","날개 달린 태양이 빛나요","문이 열려요! 태양의 사막"];
const GTO={};
const GT={t:0,pubT:6,dirty:true,seen:false,lbl:null,g:null,rise:null,ry:-15,cd:0,storm:0,ob:null,door:null,beam:null,sun:null};
function gtData(){ G.gt=G.gt||{s:0}; return G.gt; }
function gtTotal(){ let s=gtData().s; for(const id in GTO) if(id!==G.id) s+=GTO[id].s||0; return s; }
function gtStageOf(n){ let k=0; while(k<5&&n>=GT_ST[k]) k++; return k; }
function gtStage(){ const k=gtStageOf(gtTotal()); if(k>(G.gtMax||0)) G.gtMax=k; return G.gtMax||0; }
function gtOpen(){ return gtStage()>=5; }
function gtOd(){ let od=G.gtOd||0; for(const id in GTO){ const o=GTO[id].od; if(o&&(!od||o<od)) od=o; } return od; }
function gtDate(kd){ if(!kd) return ""; const d=new Date(kd*86400000); return `${d.getUTCFullYear()}년 ${d.getUTCMonth()+1}월 ${d.getUTCDate()}일`; }
function gtPub(){ if(G.realm<0) return; try{ net.pushRet("gt/"+G.id,{i:G.id,n:G.name,r:G.realm,s:gtData().s,od:G.gtOd||0,t:Date.now()}); GT.dirty=false; }catch(e){} }
NETX.push({sub:"gt/+",pre:"gt/",f:(d)=>{ if(!d||!d.i||d.i===G.id) return; GTO[d.i]=d; }});
function gtGive(n,quiet){ if(!n) return; G.sun=(G.sun||0)+n; if(!quiet) floatDmg(P.x,5,P.z,`☀ +${n}`,"gain"); }
/* ---------- 조각 모으기 ---------- */
(function(){ const _km=killMob; killMob=function(m){ try{ if(m.dsBoss&&!G.egg&&!(G.pets||{})[4]&&(!G.apep||Math.random()<.35)){ G.egg={r:4,t0:Date.now()}; G.eggEver=1; setTimeout(()=>{ toast(`🥚 ${PETS[4].egg}을(를) 주웠어요!`,"다섯 번째 신수 · 20분 뒤에 깨어나요",3.4); jingle([659,880,1046,1318,1568]); },1200); } }catch(e){}
    _km(m); try{ if(m.dsBoss){ G.apep=(G.apep||0)+1; DS.killed=m.slot; saveGame(); } if(!m.war&&!m.titan){ if(m.boss) gtGive(m.ds?12:5); else if(Math.random()<(m.ds?.5:.3)) gtGive(1,true); } }catch(e){} };
  const _fc=fishCaught; fishCaught=function(g){ _fc(g); try{ if(g.f[1]>=4) gtGive(2,true); }catch(e){} };
  const _df=dgFinish; dgFinish=function(){ _df(); try{ gtGive(10,true); setTimeout(()=>toast("☀ 태양 열쇠 조각 +10","미궁 정복 선물 · 세계의 중심 문에 바쳐요",2.4),1500); }catch(e){} };
  const _gi=grantIdle; grantIdle=function(){ const r=_gi(); try{ if(r&&r.mins>0&&!gtOpen()){ const n=Math.min(40,Math.floor(r.mins/10)); if(n>0){ gtData().s+=n; GT.dirty=true; r.gtSun=n; saveGame(); setTimeout(()=>{ if(!layerOpen) toast(`☀ 쉬는 동안 열쇠 조각 ${n}개를 바쳤어요`,"다섯 번째 세계의 문이 조금 더 솟았어요",3); },11500); } } }catch(e){} return r; }; })();
/* ---------- 문 모델 ---------- */
function gtGlyphTex(){ const c=document.createElement("canvas"); c.width=64; c.height=256; const x=c.getContext("2d"); x.strokeStyle="#fff"; x.fillStyle="#fff"; x.lineWidth=4; x.lineCap="round";
  for(let k=0;k<8;k++){ const y=16+k*30, t=k%4; x.save(); x.translate(32,y);
    if(t===0){ x.beginPath(); x.ellipse(0,0,14,7,0,0,6.283); x.stroke(); x.beginPath(); x.arc(0,0,3.5,0,6.283); x.fill(); x.beginPath(); x.moveTo(-4,7); x.lineTo(-8,14); x.stroke(); }   // 눈
    else if(t===1){ x.beginPath(); x.ellipse(0,-5,6,7,0,0,6.283); x.stroke(); x.beginPath(); x.moveTo(-11,4); x.lineTo(11,4); x.moveTo(0,2); x.lineTo(0,14); x.stroke(); }   // 앙크
    else if(t===2){ x.beginPath(); x.arc(0,0,9,0,6.283); x.fill(); x.beginPath(); x.moveTo(-18,0); x.lineTo(-11,0); x.moveTo(11,0); x.lineTo(18,0); x.stroke(); }   // 태양
    else { x.beginPath(); x.moveTo(-12,8); x.quadraticCurveTo(-2,-14,8,-4); x.lineTo(14,-8); x.moveTo(-12,8); x.lineTo(10,8); x.stroke(); }   // 새
    x.restore(); }
  const t=new THREE.CanvasTexture(c); return t; }
function gtModel(){ const g=new THREE.Group(); const sand=mat({color:0xe2c48a,roughness:1}), ss=mat({color:0xd6b47a,roughness:.88}), dk=mat({color:0x9a7442,roughness:.9}), gold=M.gold;
  const md=sph(10,sand,0,-1.6,1); md.scale.multiply(new THREE.Vector3(1.15,.26,.75)); g.add(md);
  const rise=new THREE.Group(); const gt=gtGlyphTex(); const glyph=new THREE.MeshBasicMaterial({map:gt,color:0xffd27a,transparent:true,opacity:.85,depthWrite:false});
  [-6,6].forEach(x=>{ rise.add(box(2.6,14,2.6,ss,x,7,0)); [2.5,7,11.5].forEach(y=>rise.add(box(2.8,.35,2.8,gold,x,y,0))); const gp=new THREE.Mesh(new THREE.PlaneGeometry(1.5,8.6),glyph); gp.position.set(x,7,1.32); gp.userData.noOutline=true; rise.add(gp); });
  rise.add(box(16,2.2,3.2,ss,0,15.1,0)); rise.add(box(17,.6,3.6,dk,0,16.5,0));
  const sun=new THREE.Group(); const disc=cyl(1.4,1.4,.4,gold,0,0,0,24); disc.rotation.x=Math.PI/2; sun.add(disc); const sg=sph(1.6,glowMat(0xffc040,.35),0,0,-.1); sg.userData.noOutline=true; sun.add(sg);
  [-1,1].forEach(s=>{ for(let f=0;f<3;f++){ const w=box(3.6-f*.7,.42,.16,gold,s*(3.1+f*.2),-.5+f*.45,.1); w.rotation.z=s*(.12+f*.06); sun.add(w); } }); [-1,1].forEach(s=>{ const cb=sph(.38,mat({color:0x2f8a76,roughness:.4}),s*1.9,-.1,.25); sun.add(cb); });
  sun.position.set(0,15.1,1.8); rise.add(sun);
  const door=new THREE.Mesh(new THREE.PlaneGeometry(9.4,13.6),glowMat(0xffd070,0)); door.position.set(0,6.9,.2); door.userData.noOutline=true; rise.add(door);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.6,.3,8,40),glowMat(0xfff0b0,0)); ring.position.set(0,6.6,.4); ring.userData.noOutline=true; rise.add(ring);
  g.add(rise);
  const ob=new THREE.Group(); [-11,11].forEach(x=>{ ob.add(box(1.4,9,1.4,ss,x,4.5,2.5)); const pc=new THREE.Mesh(new THREE.ConeGeometry(1,1.5,4),gold); pc.rotation.y=Math.PI/4; pc.position.set(x,9.75,2.5); ob.add(pc); const gp=new THREE.Mesh(new THREE.PlaneGeometry(.8,6),glyph); gp.position.set(x,4.6,3.21); gp.userData.noOutline=true; ob.add(gp); ob.add(cyl(1.3,1.5,.6,dk,x,.3,2.5,8)); }); g.add(ob);
  const beam=cyl(3.5,4.6,90,glowMat(0xffd27a,.0),0,45,0,16); beam.userData.noOutline=true; g.add(beam);
  for(let k=0;k<6;k++){ const r=box(rnd(.8,1.6),rnd(.4,.9),rnd(.8,1.4),ss,rnd(-9,9),.2,rnd(4,7)); r.rotation.y=rnd(0,3); g.add(r); }
  GT.rise=rise; GT.ob=ob; GT.door=door; GT.ring=ring; GT.beam=beam; GT.sun=sun; return g; }
(function(){ const g=gtModel(); g.position.set(GT_POS.x,hAt(GT_POS.x,GT_POS.z),GT_POS.z); scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); GT.g=g; GT.ry=-15+3*Math.min(5,G.gtMax||0); GT.rise.position.y=GT.ry; })();
function gtNear(){ if(DG.on||HM.on||DS.on) return false; return Math.hypot(P.x-GT_POS.x,P.z-(GT_POS.z+3))<15; }
/* ---------- 바치기 ---------- */
function gtDonate(){ if(!gtNear()) return; const n=G.sun||0; if(n<=0){ toast("☀ 열쇠 조각이 없어요","괴물·낚시·미궁에서 모여요",2); return; }
  const k0=gtStage(); G.sun=0; gtData().s+=n; GT.dirty=true; G.gtDon=(G.gtDon||0)+1; saveGame(); gtPub();
  for(let i=0;i<Math.min(10,2+Math.floor(n/15));i++) setTimeout(()=>fxSpark(GT_POS.x+rnd(-6,6),2+rnd(0,9),GT_POS.z+rnd(-1,2),0xffd27a,8),i*90); fxRing(GT_POS.x,GT_POS.z+3,0xffc040,12,.8); jingle([523,659,784,988]); buzz(30);
  toast(`☀ 열쇠 조각 ${n}개를 바쳤어요!`,k0<5?`${fmt(gtTotal())} / ${fmt(GT_ST[k0])} · ${k0+1}단계까지`:"문 기둥에 이름이 더 크게 새겨져요",2.4); gtCheck(); if(layerOpen) showGate(); }
function gtCheck(){ const k=gtStage(); if(G.gtSeen==null){ G.gtSeen=k; if(k>=5&&!G.gtOd) G.gtOd=kday(); return; } if(k<=G.gtSeen) return; G.gtSeen=k; if(k>=5&&!G.gtOd){ G.gtOd=kday(); GT.dirty=true; } saveGame();
  if(k>=5){ GT.storm=7; try{ drama(0xe0b060,.55,3); }catch(e){} P.shake=Math.max(P.shake||0,1.4); try{ lvBanner("다섯 번째 세계가 열렸어요!","☀ 태양의 사막","세계의 중심 빛의 문으로 들어가요 · 모두 함께 연 문이에요","#ffd27a"); }catch(e){} jingle([392,523,659,784,1046,1318,1568,2093]); buzz([80,40,80,40,160]); try{ fxPillar(0xffd27a,2.4,HIGH()?60:30,2.6,.5); }catch(e){} }
  else { try{ lvBanner("다섯 번째 세계의 문",`${k}단계!`,GT_TXT[k-1],"#ffd27a"); }catch(e){} jingle([523,659,784,1046,1318]); buzz([40,30,60]); } }
/* ---------- 매 프레임 (문) ---------- */
function gtTick(dt){ if(!started||G.realm<0) return; GT.t-=dt; GT.pubT-=dt; GT.cd=Math.max(0,GT.cd-dt); const tn=performance.now()/1000;
  if(GT.t<=0){ GT.t=1; gtCheck(); }
  if(GT.pubT<=0){ GT.pubT=90; if(GT.dirty||!GT.seen){ GT.seen=true; gtPub(); } }
  const k=gtStage(), open=k>=5, dist=Math.hypot(P.x-GT_POS.x,P.z-GT_POS.z);
  if(dist<150){ const ty=-15+3*k; const dy=ty-GT.ry; if(Math.abs(dy)>.02){ GT.ry+=dy*Math.min(1,dt*.7); if(dist<70&&Math.random()<dt*14) fxSpark(GT_POS.x+rnd(-8,8),.4,GT_POS.z+rnd(-2,3),0xe2c48a,5); if(dist<40) P.shake=Math.max(P.shake||0,.15); } GT.rise.position.y=GT.ry;
    GT.ob.visible=k>=3; GT.ob.position.y=k>=3?Math.min(0,GT.ob.position.y+dt*3):-10; GT.sun.children[1].material.opacity=k>=4?.35+Math.sin(tn*2.4)*.15:.08; GT.sun.rotation.z=0;
    GT.door.material.opacity=open?.32+Math.sin(tn*2)*.1:0; GT.ring.material.opacity=open?.7:0; GT.ring.rotation.z+=dt*(open?2.4:0); GT.beam.material.opacity=open?.14+Math.sin(tn*1.5)*.04:0; }
  if(!GT.lbl) GT.lbl=makeLabel("boss"); if(dist<60&&!layerOpen&&!DS.on){ placeLabel(GT.lbl,GT_POS.x,open?19:Math.max(5,GT.ry+19),GT_POS.z,open?`☀ 태양의 사막 <b>문이 열렸어요! 빛 속으로 걸어 들어가요</b>`:`☀ 다섯 번째 세계의 문 <b>${k}/5단계</b><span class="hp"><i style="width:${Math.round(Math.min(1,gtTotal()/GT_ST[k])*100)}%;background:#ffd27a"></i></span>`); } else GT.lbl.style.display="none";
  if(open&&!DS.on&&!P.dead&&GT.cd<=0&&!layerOpen&&Math.abs(P.x-GT_POS.x)<4.2&&Math.abs(P.z-GT_POS.z)<1.4) dsEnter();
  if(GT.storm>0){ GT.storm-=dt; const n=HIGH()?4:2; for(let i=0;i<n;i++) fxSpark(P.x+rnd(-14,14),rnd(.5,7),P.z+rnd(-12,10),[0xe8c890,0xf2dcae,0xd4a860][i%3],4); if(Math.random()<dt*2) tone(rnd(90,140),.5,"sawtooth",0,.03); } }
XTICK.push(gtTick);
/* ================= 태양의 사막 (지도 밖 z≈700) ================= */
const DSX=0, DSZ=700, DS_R=115;
const DS={on:false,built:false,parts:[],cd:0,bossSlot:-1,boss:null,portal:null,plbl:null,amb:0};
const DS_MOBS=[{n:"모래 전갈",shape:"scorpion",c:0xc8924a},{n:"미라 병사",shape:"mummy",c:0xe2d4b0},{n:"딱정벌레 떼",shape:"scarab",c:0x2f8a76},{n:"모래 코브라",shape:"naga",c:0xc9a24e}];
const DS_BOSS={n:"혼돈의 뱀 아펩",shape:"apep",c:0x5a2a8a,p:98};
const DS_PY={x:0,z:-62,h:25}, DS_ARENA={x:0,z:-22};
const DS_BLOCK=[{x:0,z:-62,r:25,sq:1},{x:-62,z:-86,r:11},{x:64,z:-82,r:9.5},{x:40,z:32,r:8.5}];
PETS.push({n:"아기 불사조",kind:"bird",c:0xff5a2a,c2:0xffd04a,egg:"태양 무늬 알"});
function dsIn(z){ return z>550; }
function dsH(x,z){ const lx=x-DSX, lz=z-DSZ; let h=Math.sin(lx*.045+1.3)*Math.cos(lz*.038)*1.25+Math.sin((lx+lz)*.085)*.5+Math.sin(lx*.13-lz*.07)*.22;
  const fl=(cx,cz,r)=>clamp((Math.hypot(lx-cx,lz-cz)-r)/14,0,1); h=(h+1.4)*Math.min(fl(0,96,14),fl(DS_ARENA.x,DS_ARENA.z,20),fl(DS_PY.x,DS_PY.z,28),fl(40,32,10),fl(-62,-86,13),fl(64,-82,12))*.75;
  const rv=Math.abs(lx+88); if(rv<7) h=-.8; else if(rv<13) h=-.8+(h+.8)*((rv-7)/6); return h; }
(function(){ const _h=hAt; hAt=function(x,z){ return z>550?dsH(x,z):_h(x,z); }; })();
function dsScorpion(c){ const g=new THREE.Group(); const m=mat({color:c,roughness:.7}), dk=mat({color:new THREE.Color(c).multiplyScalar(.6),roughness:.8}), eye=mat({color:0xff3d3d,emissive:0xff2020,emissiveIntensity:1.2});
  const b=sph(.8,m,0,.7,0); b.scale.multiply(new THREE.Vector3(1,.55,1.5)); g.add(b); g.add(sph(.45,dk,0,.75,.95)); [-.15,.15].forEach(x=>g.add(sph(.07,eye,x,.95,1.3)));
  [[.9,-1.15],[1.3,-1.5],[1.8,-1.7],[2.3,-1.6],[2.7,-1.3]].forEach(([y,z],k)=>g.add(sph(.34-k*.035,k%2?dk:m,0,y,z))); const st=new THREE.Mesh(GEO.cone,dk); st.scale.set(.22,.6,.22); st.position.set(0,2.75,-.95); st.rotation.x=2.2; g.add(st);
  [-1,1].forEach(s=>{ const arm=cyl(.1,.12,1,dk,s*.7,.65,1.15,6); arm.rotation.x=1.2; arm.rotation.z=s*.6; g.add(arm); const cl=sph(.3,m,s*1.05,.65,1.65); cl.scale.multiply(new THREE.Vector3(1,.6,1.5)); g.add(cl); [-.12,.12].forEach(o=>{ const p=new THREE.Mesh(GEO.cone,dk); p.scale.set(.1,.45,.1); p.position.set(s*1.05+o,.65,2.05); p.rotation.x=Math.PI/2; g.add(p); });
    for(let k=0;k<3;k++){ const l=cyl(.05,.04,.9,dk,s*.75,.35,.35-k*.45,5); l.rotation.z=s*1.1; g.add(l); } });
  g.userData.h=3; return g; }
function dsScarab(c){ const g=new THREE.Group(); const m=mat({color:c,roughness:.3,metalness:.5}), dk=mat({color:0x1a2a24,roughness:.6}), gl=mat({color:0xffd060,emissive:0xffa020,emissiveIntensity:.5});
  [[0,0,0],[.9,.25,-.6],[-.9,.15,-.5]].forEach(([x,y,z],k)=>{ const bt=new THREE.Group(); const b=sph(.42,m,0,0,0); b.scale.multiply(new THREE.Vector3(1,.55,1.25)); bt.add(b); bt.add(sph(.2,dk,0,0,.5)); bt.add(box(.04,.05,.8,gl,0,.2,-.05)); [-1,1].forEach(s=>{ const w=sph(.3,mat({color:0xcfe8ff,transparent:true,opacity:.45}),s*.35,.25,-.1); w.scale.multiply(new THREE.Vector3(1,.2,1.4)); bt.add(w); }); bt.position.set(x,1.1+y,z); g.add(bt); });
  g.userData.h=2.4; g.userData.float=true; return g; }
function dsMesh(def){ let g; if(def.shape==="scorpion") g=dsScorpion(def.c); else if(def.shape==="scarab") g=dsScarab(def.c); else if(def.shape==="mummy") g=makeMob("draugr",def.c,1);
  else if(def.shape==="apep"){ g=makeMob("snake",def.c,1); const eye=mat({color:0xffe040,emissive:0xffc020,emissiveIntensity:1.5}); [-.25,.25].forEach(x=>g.add(sph(.12,eye,x,1.25,-.95))); for(let k=0;k<6;k++){ const sp=new THREE.Mesh(GEO.cone,mat({color:0xb07aff,emissive:0x6a2aff,emissiveIntensity:.6})); sp.scale.set(.18,.5,.18); sp.position.set(0,1.05,k*.85); g.add(sp); } }
  else g=makeMob(def.shape,def.c,1); if(!g.userData.h) g.userData.h=def.shape==="apep"?2:4; return g; }
function dsPalm(x,z){ const g=new THREE.Group(); const tr=mat({color:0x8a6a44,roughness:.95}), lf=mat({color:0x4f9a3a,roughness:.8}); const lean=rnd(-.15,.15);
  for(let k=0;k<6;k++) g.add(cyl(.3-k*.025,.34-k*.025,1.3,tr,lean*k*1.3,.65+k*1.25,0,7)); const tx=lean*7.8, ty=7.6;
  for(let k=0;k<7;k++){ const a=k/7*6.283; const l=sph(.5,lf,tx+Math.cos(a)*1.4,ty-.2,Math.sin(a)*1.4); l.scale.multiply(new THREE.Vector3(Math.abs(Math.cos(a))*2.6+.5,.12,Math.abs(Math.sin(a))*2.6+.5)); l.rotation.z=Math.cos(a)*-.35; l.rotation.x=Math.sin(a)*.35; g.add(l); }
  for(let k=0;k<3;k++) g.add(sph(.2,mat({color:0x6a4a2a}),tx+Math.cos(k*2)*.35,ty-.55,Math.sin(k*2)*.35)); g.position.set(x,hAt(x,z),z); g.rotation.y=rnd(0,6.28); return g; }
function dsBuild(){ if(DS.built) return; DS.built=true; const add=o=>{ scene.add(shadowify(o)); DS.parts.push(o); return o; };
  const ss=mat({color:0xbf9558,roughness:.88}), dk=mat({color:0x9a7442,roughness:.9}), gold=M.gold;
  // 모래 땅
  const S=DS_R*2+30, N=ECO()?56:84; const geo=new THREE.PlaneGeometry(S,S,N,N); geo.rotateX(-Math.PI/2); const pos=geo.attributes.position; const col=new Float32Array(pos.count*3); const c=new THREE.Color(), sand=new THREE.Color(0xf2c47a), sand2=new THREE.Color(0xdca25a), green=new THREE.Color(0x86b04a);
  for(let i=0;i<pos.count;i++){ const x=pos.getX(i)+DSX, z=pos.getZ(i)+DSZ; const h=dsH(x,z); pos.setY(i,h); c.copy(sand).lerp(sand2,clamp(.5+Math.sin(x*.31)*Math.cos(z*.27)*.5,0,1)*.5+clamp(-h,0,1)*.3); const rv=Math.abs(x-DSX+88); if(rv<20) c.lerp(green,clamp(1-(rv-8)/12,0,1)*.7); if(Math.max(Math.abs(x-DSX),Math.abs(z-DSZ))>DS_R+4) c.multiplyScalar(.82); col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
  geo.setAttribute("color",new THREE.BufferAttribute(col,3)); geo.computeVertexNormals(); const ground=new THREE.Mesh(geo,mat({vertexColors:true,map:noiseTex("#c4c4c4",["#b0b0b0","#d6d6d6","#a4a4a4","#cfcfcf"],26),roughness:1})); ground.position.set(DSX,0,DSZ); ground.receiveShadow=HIGH(); scene.add(ground); DS.parts.push(ground);
  // 나일 강
  const rg=new THREE.PlaneGeometry(14,S,1,1); rg.setAttribute('sq',new THREE.BufferAttribute(new Float32Array(rg.attributes.position.count).fill(1),1)); const river=new THREE.Mesh(rg,M.water); river.rotation.x=-Math.PI/2; river.position.set(DSX-88,-.35,DSZ); scene.add(river); DS.parts.push(river);
  for(let z=-105;z<=105;z+=17){ add(dsPalm(DSX-74+rnd(-2,2),DSZ+z+rnd(-3,3))); add(dsPalm(DSX-102+rnd(-2,2),DSZ+z+8+rnd(-3,3))); }
  [[18,60],[-22,58],[55,-30],[-40,20],[80,40],[-55,-40]].forEach(([x,z])=>add(dsPalm(DSX+x,DSZ+z)));
  // 큰 피라미드 + 작은 피라미드
  const pyr=(x,z,r,h)=>{ const g=new THREE.Group(); const p=new THREE.Mesh(new THREE.ConeGeometry(r,h,4),ss); p.rotation.y=Math.PI/4; p.position.y=h/2; g.add(p); const cap=new THREE.Mesh(new THREE.ConeGeometry(r*.1,h*.1,4),gold); cap.rotation.y=Math.PI/4; cap.position.y=h*.95; g.add(cap);
    for(let k=1;k<6;k++){ const t=k/6; const b=box(r*1.414*(1-t)*1.005+.1,.18,r*1.414*(1-t)*1.005+.1,dk,0,h*t,0); g.add(b); } g.position.set(DSX+x,hAt(DSX+x,DSZ+z),DSZ+z); return add(g); };
  const big=pyr(DS_PY.x,DS_PY.z,34,40); big.add(box(4,5,1,mat({color:0x2a1a10}),0,2.5,22.6)); big.add(box(5.2,.8,1.4,dk,0,5.2,21.1)); pyr(-62,-86,15,17); pyr(64,-82,13,15);
  // 스핑크스(석상 모델 재사용, 크게)
  { const sp=orModel(3); sp.scale.setScalar(2.4); sp.position.set(DSX+40,hAt(DSX+40,DSZ+32),DSZ+32); sp.rotation.y=-.35; add(sp); }
  // 결투장(아펩이 깨어나는 곳)
  { const g=new THREE.Group(); const ring=new THREE.Mesh(new THREE.RingGeometry(17,18.2,64),glowMat(0xffa020,.22)); ring.rotation.x=-Math.PI/2; ring.position.y=.08; g.add(ring); const ring2=new THREE.Mesh(new THREE.RingGeometry(9,9.6,48),glowMat(0xb07aff,.3)); ring2.rotation.x=-Math.PI/2; ring2.position.y=.09; g.add(ring2); DS.arenaRing=ring2;
    for(let k=0;k<6;k++){ const a=k/6*6.283+.26; const x=Math.cos(a)*19.5, z=Math.sin(a)*19.5; g.add(cyl(.6,.8,4,ss,x,2,z,8)); g.add(cyl(.9,.6,.5,dk,x,4.2,z,8)); const f=sph(.5,glowMat(0xff9a30,.8),x,4.8,z); f.userData.noOutline=true; g.add(f); }
    g.position.set(DSX+DS_ARENA.x,hAt(DSX+DS_ARENA.x,DSZ+DS_ARENA.z),DSZ+DS_ARENA.z); add(g); }
  // 무너진 기둥들 · 오벨리스크
  [[-30,-10],[30,-5],[-15,40],[70,0],[-45,70],[60,75],[-70,-10],[85,-55]].forEach(([x,z],k)=>{ const g=new THREE.Group(); const h=rnd(2,7); g.add(cyl(.9,1,h,ss,0,h/2,0,10)); g.add(box(2.2,.5,2.2,dk,0,.25,0)); if(k%2){ const f=cyl(.9,.9,5,ss,2.6,.9,.8,10); f.rotation.z=Math.PI/2; f.rotation.y=rnd(0,3); g.add(f); } g.position.set(DSX+x,hAt(DSX+x,DSZ+z),DSZ+z); add(g); });
  [-9,9].forEach(x=>{ const g=new THREE.Group(); g.add(cyl(1.4,1.6,.7,dk,0,.35,0,8)); g.add(box(1.4,10,1.4,ss,0,5.5,0)); const pc=new THREE.Mesh(new THREE.ConeGeometry(1,1.5,4),gold); pc.rotation.y=Math.PI/4; pc.position.y=11.2; g.add(pc); g.position.set(DSX+x,hAt(DSX+x,DSZ+86),DSZ+86); add(g); });
  // 돌아가는 문(남쪽)
  { const g=new THREE.Group(); const z=DSZ+100; g.add(cyl(.7,.8,8,ss,-4.2,4,0,10)); g.add(cyl(.7,.8,8,ss,4.2,4,0,10)); g.add(box(10.4,1.2,1.6,ss,0,8.4,0)); const ring=new THREE.Mesh(new THREE.TorusGeometry(3.3,.35,10,40),glowMat(0x9a7aff,.7)); ring.position.y=3.8; ring.userData.noOutline=true; g.add(ring); const disc=new THREE.Mesh(new THREE.CircleGeometry(3.2,40),glowMat(0x6a4aff,.3)); disc.position.y=3.8; disc.userData.noOutline=true; g.add(disc);
    g.position.set(DSX,hAt(DSX,z),z); add(g); DS.portal={x:DSX,z:z-1,ring,disc}; }
  DS.parts.forEach(o=>o.traverse(m=>{ if(m.material&&m.material.blending===THREE.AdditiveBlending){ m.castShadow=false; m.userData.noOutline=true; } })); }
/* ---------- 들어가기 · 나가기 ---------- */
function dsEnter(){ if(DS.on||P.dead) return; if(!gtOpen()){ toast("☀ 문이 아직 열리지 않았어요","모두 함께 열쇠 조각을 모아요",2); return; } if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); GT.cd=3; return; }
  closeLayer(); if(DG.on) dgExit(true); if(HM.on) hmExit(); if(typeof RC!=="undefined"&&RC.on) try{ rcEnd(false); }catch(e){} dsBuild(); DS.on=true; DS.cd=2.5; P.x=DSX; P.z=DSZ+90; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul,1.5); P.guide=null; $("guide").hidden=true; G.dsIn=(G.dsIn||0)+1; saveGame();
  try{ lvBanner("다섯 번째 세계","☀ 태양의 사막","피라미드 앞 결투장에 4분마다 혼돈의 뱀 아펩이 깨어나요","#ffd27a"); }catch(e){ toast("☀ 태양의 사막","",2.4); } fxRing(P.x,P.z,0xffd27a,8,.8); fxSpark(P.x,2,P.z,0xffd27a,30); jingle([392,523,659,784,1046]); }
function dsClear(){ for(let i=mobs.length-1;i>=0;i--) if(mobs[i].ds) removeMob(mobs[i]); DS.boss=null; }
function dsExit(silent,noTp){ if(!DS.on) return; DS.on=false; if(DS.boss&&mobs.indexOf(DS.boss)>=0&&DS.boss.hp>0) DS.bossSlot=-1; dsClear(); if(DS.plbl) DS.plbl.style.display="none"; if(!noTp){ P.x=GT_POS.x; P.z=GT_POS.z+7; P.y=0; P.vy=0; P.rot=0; GT.cd=4; } if(!silent) toast("세계의 중심으로 돌아왔어요","문은 언제든 열려 있어요",2); }
(function(){ const _sh=spawnAtHome; spawnAtHome=function(){ if(DS.on) dsExit(true,true); if(P.bag&&dsIn(P.bag.z)){ G.gold+=P.bag.gold; scene.remove(P.bag.mesh); P.bag=null; } _sh(); };
  const _dm=damageMob; damageMob=function(m,dmg,crit){ const h0=m.hp; _dm(m,dmg,crit); if(m.dsBoss&&h0>0){ const d=Math.round(h0-Math.max(0,m.hp)); if(d>0) try{ net.send({t:"dsh",d,s:m.slot}); }catch(e){} } }; })();
NETR.dsh=(o,d)=>{ if(!DS.on) return; const b=DS.boss; if(!b||b.hp<=0||mobs.indexOf(b)<0||d.s!==b.slot) return; const dmg=Math.min(d.d|0,b.mhp); if(dmg<=0) return; b.hp-=dmg; b.hit=.12; floatDmg(b.x+rnd(-1.5,1.5),3*b.scale,b.z,"-"+fmt(dmg),""); if(b.hp<=0){ b.hp=0; killMob(b); toast(`${o.name}와(과) 함께 아펩을 쓰러뜨렸어요!`,null,2.6); } };
function dsClampP(){ if(!dsIn(P.z)){ dsExit(true,true); return false; } P.x=clamp(P.x,DSX-DS_R+2,DSX+DS_R-2); P.z=clamp(P.z,DSZ-DS_R+2,DSZ+DS_R-2); const p=dsPush(P.x,P.z,.8); P.x=p.x; P.z=p.z; return true; }
function dsPush(x,z,pad){ for(const b of DS_BLOCK){ const bx=DSX+b.x, bz=DSZ+b.z; if(b.sq){ const dx=x-bx, dz=z-bz, r=b.r+pad; if(Math.abs(dx)<r&&Math.abs(dz)<r){ if(r-Math.abs(dx)<r-Math.abs(dz)) x=bx+Math.sign(dx||1)*r; else z=bz+Math.sign(dz||1)*r; } } else { const dx=x-bx, dz=z-bz, d=Math.hypot(dx,dz), r=b.r+pad; if(d<r&&d>0){ x=bx+dx/d*r; z=bz+dz/d*r; } } } return {x,z}; }
function dsPeers(){ const L=[]; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&dsIn(o.z)) L.push(o); } return L; }
function dsSpawn(def,lv,boss,x,z,scale){ const st=mobStats(lv,boss); const mesh=dsMesh(def); const m={n:def.n,shape:def.shape,mesh,x,z,hx:x,hz:z,lv,boss:!!boss,world:false,hp:st.mhp,mhp:st.mhp,atk:st.atk,xp:st.xp,gold:st.gold,rg:12,cd:1,state:"idle",t:rnd(0,2),lbl:makeLabel(boss?"boss":""),rot:rnd(0,6.28),hit:0,scale,power:boss?def.p:0,ds:true,warn:0,slamT:4};
  if(boss){ const k=1+.6*dsPeers().length; m.hp=m.mhp=Math.round(st.mhp*3.2*k); m.xp=Math.round(st.xp*1.6); m.gold=Math.round(st.gold*1.6); m.dsBoss=true; m.slot=DS.bossSlot; const aura=new THREE.Mesh(new THREE.RingGeometry(1.6,2.4,40),glowMat(0xb07aff,.7)); aura.rotation.x=-Math.PI/2; aura.position.y=.1; mesh.add(aura); m.aura=aura; }
  mesh.position.set(x,hAt(x,z),z); mesh.scale.setScalar(scale); scene.add(mesh); mobs.push(m); return m; }
function dsSpot(){ for(let k=0;k<20;k++){ const x=DSX+rnd(-DS_R+10,DS_R-10), z=DSZ+rnd(-DS_R+10,DS_R-20); if(Math.hypot(x-DSX,z-(DSZ+92))<30) continue; if(Math.abs(x-(DSX-88))<9) continue; if(Math.hypot(x-P.x,z-P.z)<14) continue; const p=dsPush(x,z,2); if(p.x!==x||p.z!==z) continue; return {x,z}; } return null; }
/* ---------- 사막 괴물 움직임 ---------- */
function dsTickMobs(dt){ const st=stat(), tn=performance.now(); const list=mobs.filter(m=>m.ds);
  list.forEach(m=>{ const dx=P.x-m.x, dz=P.z-m.z, d=Math.hypot(dx,dz); m.hit=Math.max(0,m.hit-dt); m.cd-=dt; m.t-=dt; const spd=m.boss?4:m.shape==="scarab"?5.4:m.shape==="scorpion"?4.6:3.7; const reach=m.boss?2.8+m.scale*.8:2.3;
    if(!P.dead&&d<(m.boss?42:15)){ m.state="chase"; if(d>reach&&m.warn<=0){ m.x+=dx/d*spd*dt; m.z+=dz/d*spd*dt; } m.rot=Math.atan2(dx,dz); if(d<=reach&&m.cd<=0&&m.warn<=0){ m.cd=m.boss?1.7:1.3; hurtPlayer(m.atk*(1-dmgReduce(st.def)),m.n); m.mesh.userData.lunge=.25; } }
    else { m.state="idle"; if(m.t<=0){ m.t=rnd(1.5,4); m.wx=m.hx+rnd(-7,7); m.wz=m.hz+rnd(-7,7); } if(m.wx!=null){ const wx=m.wx-m.x, wz=m.wz-m.z, wd=Math.hypot(wx,wz); if(wd>.5){ m.x+=wx/wd*1.5*dt; m.z+=wz/wd*1.5*dt; m.rot=Math.atan2(wx,wz); } } }
    if(m.boss&&!P.dead&&m.state==="chase"){ m.slamT-=dt; if(m.slamT<=0&&m.warn<=0&&d<22){ m.warn=1; fxRing(m.x,m.z,0xff3030,24,1); tone(70,.5,"sawtooth",0,.12); }
      if(m.warn>0){ m.warn-=dt; if(m.warn<=0){ m.slamT=rnd(2.8,4.2); fxRing(m.x,m.z,0xffc070,22,.6); fxSpark(m.x,1,m.z,0xe8c890,46); P.shake=Math.max(P.shake||0,.9); thud(); if(Math.hypot(P.x-m.x,P.z-m.z)<12) hurtPlayer(m.atk*1.8*(1-dmgReduce(st.def)),m.n); } }
      if(!m.summoned&&m.hp<m.mhp*.5){ m.summoned=true; toast("🐍 아펩이 딱정벌레 떼를 불렀어요!","먼저 작은 괴물을 피해요",2.2); for(let k=0;k<3;k++){ const a=k/3*6.283; dsSpawn(DS_MOBS[2],Math.max(10,m.lv-6),false,m.x+Math.cos(a)*7,m.z+Math.sin(a)*7,1); } } }
    list.forEach(o=>{ if(o===m) return; const ex=m.x-o.x, ez=m.z-o.z, e=Math.hypot(ex,ez), want=(m.scale+o.scale)*.9; if(e>0&&e<want){ m.x+=ex/e*(want-e)*.5; m.z+=ez/e*(want-e)*.5; } });
    m.x=clamp(m.x,DSX-DS_R+3,DSX+DS_R-3); m.z=clamp(m.z,DSZ-DS_R+3,DSZ+DS_R-3); const pp=dsPush(m.x,m.z,m.scale*.8); m.x=pp.x; m.z=pp.z;
    const u=m.mesh.userData; m.mesh.position.set(m.x,hAt(m.x,m.z)+(u.float?Math.sin(tn/300+m.x)*.3+.3:0)+(u.lunge>0?.4:0)+(m.warn>0?Math.min(1.5,(1-m.warn)*2):0),m.z); if(u.lunge>0) u.lunge-=dt; if(m.aura){ m.aura.rotation.z+=dt*2; m.aura.scale.setScalar(1+Math.sin(tn/250)*.12); }
    let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*8);
    hitTint(m.mesh,m.hit/.15); const sc=m.scale*(m.hit>0?1.12:1); m.mesh.scale.set(sc,sc*(m.state==="chase"&&!u.float?1+Math.abs(Math.sin(tn/90+m.x))*.05:1),sc); try{ HITF.apply(m,dt); }catch(e){}
    if(d<48){ const h=u.h||4; placeLabel(m.lbl,m.x,h*m.scale+(m.boss?1:0),m.z,`${m.boss?"🐍 ":""}${m.n} <b>Lv.${m.lv}${m.boss?" · 파워 "+m.power:""}</b><span class="hp"><i style="width:${Math.round(m.hp/m.mhp*100)}%"></i></span>`); } else m.lbl.style.display="none"; });
  return list; }
/* ---------- 매 프레임 (사막) ---------- */
function dsTick(dt){ if(!DS.on) return; if(!dsIn(P.z)){ dsExit(true,true); return; } DS.cd=Math.max(0,DS.cd-dt); const tn=performance.now();
  const peers=dsPeers(); const list=mobs.filter(m=>m.ds&&!m.boss); const want=Math.min(14,9+peers.length*2);
  if(list.length<want&&Math.random()<dt*1.4){ const s=dsSpot(); if(s){ const def=pick(DS_MOBS); dsSpawn(def,clamp(G.lv+rint(-1,2),10,60),false,s.x,s.z,def.shape==="naga"?1.05:rnd(.9,1.15)); } }
  const slot=Math.floor(Date.now()/240000); if(DS.boss&&mobs.indexOf(DS.boss)<0) DS.boss=null;
  if(!DS.boss&&DS.bossSlot!==slot&&Math.hypot(P.x-(DSX+DS_ARENA.x),P.z-(DSZ+DS_ARENA.z))<75){ DS.bossSlot=slot; DS.boss=dsSpawn(DS_BOSS,clamp(G.lv+6,18,60),true,DSX+DS_ARENA.x,DSZ+DS_ARENA.z-3,3.2);
    try{ lvBanner("혼돈의 뱀","🐍 아펩이 깨어났어요!","결투장에서 함께 쓰러뜨려요 · 빨간 고리가 보이면 피해요","#b07aff"); }catch(e){} tone(60,.9,"sawtooth",0,.2); buzz([80,40,80]); fxRing(DSX+DS_ARENA.x,DSZ+DS_ARENA.z,0xb07aff,18,1.2); P.shake=Math.max(P.shake||0,1); }
  dsTickMobs(dt);
  if(DS.arenaRing){ DS.arenaRing.material.opacity=DS.boss?.55+Math.sin(tn/150)*.2:.22; DS.arenaRing.rotation.z+=dt*(DS.boss?1.5:.3); }
  const po=DS.portal; if(po){ po.ring.rotation.z+=dt*1.6; po.disc.material.opacity=.3+Math.sin(tn/200)*.1; if(!DS.plbl) DS.plbl=makeLabel("ally"); const d=Math.hypot(P.x-po.x,P.z-po.z); if(d<45&&!layerOpen) placeLabel(DS.plbl,po.x,9.5,po.z,`🌀 세계의 중심으로 <b>돌아가는 문</b>`); else DS.plbl.style.display="none"; if(d<3&&DS.cd<=0&&!P.dead){ dsExit(); return; } }
  DS.amb-=dt; if(DS.amb<=0){ DS.amb=ECO()?.5:.2; fxSpark(P.x+rnd(-18,18),rnd(.3,2.5),P.z+rnd(-14,6),0xf2dcae,2); }
  const bossTxt=DS.boss?` · 🐍 아펩 ${Math.round(DS.boss.hp/DS.boss.mhp*100)}%`:` · 아펩까지 ${Math.ceil((240000-Date.now()%240000)/1000)}초`; $("region").innerHTML=`☀ 태양의 사막 <b>다섯 번째 세계${DS.killed===slot&&!DS.boss?" · 이번 아펩 처치!":bossTxt}</b>`; }
XTICK.push(dsTick);
function dsSky(dt){ SKY.tTop.setHex(0x3f8fdc); SKY.tBot.setHex(0xf0cf94); const k=Math.min(1,dt*2); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=80; scene.fog.far=230;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+35,90,P.z+25); sun.target.position.set(P.x,0,P.z); sun.intensity=1.05; sun.color.setHex(0xffe8c0); hemi.intensity=.42; fill.intensity=.22; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=.9; }
function dsMinimap(){ const ctx=mctx, S=fitCanvas(mm); const s=S*.94/(DS_R*2); const X=x=>S/2+(x-DSX)*s, Z=z=>S/2+(z-DSZ)*s;
  ctx.fillStyle="#e8c88a"; ctx.fillRect(0,0,S,S); ctx.fillStyle="#9cc0e8"; ctx.fillRect(X(DSX-95),0,14*s,S); ctx.fillStyle="#8fb35a"; ctx.fillRect(X(DSX-108),0,6*s,S); ctx.fillRect(X(DSX-75),0,5*s,S);
  const tri=(x,z,r)=>{ ctx.fillStyle="#c9a060"; ctx.strokeStyle="#7a5a2a"; ctx.lineWidth=Math.max(1,S/120); ctx.beginPath(); ctx.moveTo(X(DSX+x),Z(DSZ+z-r)); ctx.lineTo(X(DSX+x+r),Z(DSZ+z+r)); ctx.lineTo(X(DSX+x-r),Z(DSZ+z+r)); ctx.closePath(); ctx.fill(); ctx.stroke(); }; tri(DS_PY.x,DS_PY.z,24); tri(-62,-86,11); tri(64,-82,9);
  ctx.strokeStyle=DS.boss?"#b07aff":"rgba(160,110,40,.7)"; ctx.lineWidth=Math.max(2,S/70); ctx.beginPath(); ctx.arc(X(DSX+DS_ARENA.x),Z(DSZ+DS_ARENA.z),17*s,0,6.283); ctx.stroke();
  if(DS.portal) dot(ctx,X(DS.portal.x),Z(DS.portal.z),S/24,"#9a7aff","#fff",2);
  mobs.forEach(m=>{ if(m.ds) dot(ctx,X(m.x),Z(m.z),m.boss?S/18:S/50,m.boss?"#7a3aff":"#d93025","#fff",1); }); dsPeers().forEach(o=>dot(ctx,X(o.x),Z(o.z),S/36,"#1e8e3e","#fff",1.5));
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const a=S/20; ctx.moveTo(0,-a); ctx.lineTo(a*.7,a*.7); ctx.lineTo(0,a*.35); ctx.lineTo(-a*.7,a*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,"☀ 태양의 사막",S/2,S*.06,Math.round(S/12),"#6a3a00"); }
/* ---------- 창 ---------- */
function showGate(){ const k=gtStage(), tot=gtTotal(), me=gtData().s, open=k>=5, near=gtNear();
  const L=[]; for(const id in GTO) if(id!==G.id&&GTO[id].s>0) L.push(GTO[id]); if(me>0) L.push({n:G.name,s:me,r:G.realm,me:1}); L.sort((a,b)=>b.s-a.s);
  const wall=L.slice(0,10).map((x,i)=>`<div class="row"><div class="ic" style="color:${REALMS[x.r]?REALMS[x.r].c1:"#fff"}">${i===0?"🥇":i===1?"🥈":i===2?"🥉":"☀"}</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>${REALMS[x.r]?REALMS[x.r].n+" · ":""}열쇠 조각 ${fmt(x.s)}개</span></div></div>`).join("");
  const od=gtOd();
  card(`<h2>☀ 다섯 번째 세계의 문</h2><p>세계의 중심 남쪽 모래 속에 거대한 문이 묻혀 있어요. <b>네 세계 모든 사람</b>이 ☀ 태양 열쇠 조각을 바치면 모두의 몫이 더해져 문이 조금씩 솟아올라요. 다 솟아오르면 누구나 갈 수 있는 새 땅 <b style="color:#ffd27a">「태양의 사막」</b>이 열려요!</p>
   <div class="wdst">${[0,1,2,3,4].map(i=>`<div class="${i<k?"on":""}"><b>${i<k?"✅":i===k?"⏳":"🔒"}</b>${i+1}단계<br>${GT_TXT[i]}</div>`).join("")}</div>
   ${open?`<p style="color:#ffd27a"><b>문이 열렸어요!</b>${od?` 처음 열린 날: ${gtDate(od)}`:""} · 모두 함께 연 문이에요.</p>`:`<div class="wdbar"><i style="width:${Math.round(Math.min(1,tot/GT_ST[k])*100)}%"></i><span>${fmt(tot)} / ${fmt(GT_ST[k])} 조각 · ${k+1}단계까지</span></div>`}
   <div class="idlegrid"><div><b>${fmt(G.sun||0)}</b><span>☀ 내가 가진 조각</span></div><div><b>${fmt(me)}</b><span>내가 바친 조각 · 함께한 사람 ${L.length}명</span></div></div>
   <div class="exgrid">${near?`<button class="go" id="gtGive" ${(G.sun||0)>0?"":"disabled"} style="font-size:18px;padding:10px 12px">☀ 조각 바치기</button>`:`<button class="buy" id="gtWay">문으로 길 안내</button>`}${open?`<button class="buy alt" id="gtGo">${DS.on?"사막에 있어요":"☀ 태양의 사막으로"}</button>`:'<button class="buy alt" disabled>🔒 5단계에 열려요</button>'}</div>
   <p style="font-size:12px">조각은 괴물을 잡으면 가끔(보스 5개), 별 4개 넘는 물고기 2개, 미궁 정복 10개. 게임을 꺼 둔 동안에도 10분마다 1개씩(최대 40개) 저절로 바쳐져요.</p>
   ${open?`<h3>☀ 태양의 사막</h3><p style="font-size:13px">피라미드·나일 강·스핑크스 · 새 괴물(모래 전갈·미라 병사·딱정벌레 떼·모래 코브라, 내 레벨에 맞춰 나와요) · 4분마다 결투장에 <b style="color:#c9a0ff">혼돈의 뱀 아펩</b>이 깨어나요(친구가 준 데미지도 함께 깎여요). 아펩을 이기면 신화 장비, 처음 이기면 <b>아기 불사조 알</b>!</p>`:""}
   <h3>🏛 문 기둥에 새겨진 이름 (가장 많이 바친 10명)</h3>${wall||'<p style="font-size:13px">첫 조각을 바쳐 이름을 새겨 보세요!</p>'}`);
  if($("gtGive")) $("gtGive").onclick=gtDonate; if($("gtWay")) $("gtWay").onclick=()=>{ setGuide({x:GT_POS.x,z:GT_POS.z+6,label:"☀ 다섯 번째 세계의 문"}); closeLayer(); };
  if($("gtGo")) $("gtGo").onclick=()=>{ if(DS.on){ closeLayer(); return; } if(DG.on||HM.on){ toast("미궁·신전 섬에서 먼저 나와요"); return; } dsEnter(); }; }
/* ---------- 상황 버튼 · 칭호 ---------- */
CTX_EXTRA.push(()=>{ if(!gtNear()) return null; if(gtOpen()) return (G.sun||0)>0?{t:`☀ 조각 바치기 (${G.sun})`,f:gtDonate}:{t:"☀ 태양의 사막으로",f:dsEnter}; return {t:(G.sun||0)>0?`☀ 조각 바치기 (${G.sun})`:"☀ 다섯 번째 세계의 문",f:(G.sun||0)>0?gtDonate:showGate}; });
TITLES.push({id:"gt1",n:"문지기의 친구",t:1,h:"다섯 번째 세계의 문에 열쇠 조각 바치기",g:()=>[G.gtDon?1:0,1]},{id:"gt300",n:"태양의 열쇠",t:2,h:"열쇠 조각 300개 바치기",g:()=>[gtData().s,300]},{id:"ds1",n:"사막의 개척자",t:2,h:"태양의 사막에 들어가기",g:()=>[G.dsIn?1:0,1]},{id:"apep",n:"혼돈을 물리친 자",t:3,h:"혼돈의 뱀 아펩 쓰러뜨리기",g:()=>[Math.min(1,G.apep||0),1]});
</script>
