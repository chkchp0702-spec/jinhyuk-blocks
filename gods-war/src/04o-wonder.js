<script>
/* ================= v24-3: 🏛️ 다 같이 짓는 세계 불가사의 (IDEAS G11/4-3) =================
   세계마다 수도 옆 공사장. 사냥·낚시·보스에서 모은 🧱 건축 돌을 바치면 그 세계 모든 사람의 몫이 더해져 5단계로 자람.
   (각자 바친 양을 보관(retained) wd/<세계>/<id> 로 올리고 다 더함 — 04d 거대 보스와 같은 방식)
   단계마다 건물이 눈에 보이게 커지고 큰 축하 + 그 세계 모두에게 영원한 보너스(경험치·금화 +2%씩, 3단계 순간이동 문, 5단계 공격 +5%).
   게임을 꺼 둔 사람도 쉬는 동안 「일꾼」이 돌을 조금씩 날라 줌. 공사장 이름 벽에 가장 많이 바친 사람. 한 번 오른 단계는 내려가지 않음(G.wdMax). */
const WD_NAME=["하늘 사다리 탑","비프로스트 문","황금 연꽃 사원","거인 경기장"];
const WD_ST=[150,500,1200,2500,5000];
const WD_BONUS=["경험치·금화 +2%","경험치·금화 +4%","+6% · 🌀 순간이동 문","+8%","+10% · 공격 +5%"];
const WDO=[{},{},{},{}];
const WD={sites:[],t:0,pubT:8,dirty:true,lbl:null,fw:0,fwT:0,seen:false};
function wdData(){ G.wd=G.wd||{s:0}; G.wdMax=G.wdMax||[0,0,0,0]; return G.wd; }
function wdSpot(r){ const cap=REGIONS[r*3]; const inward=Math.atan2(-cap.z,-cap.x); const a=inward+.78; return {x:cap.x+Math.cos(a)*45,z:cap.z+Math.sin(a)*45,rot:Math.atan2(cap.x-(cap.x+Math.cos(a)*45),cap.z-(cap.z+Math.sin(a)*45))}; }
function wdTotal(r){ let s=0; for(const id in WDO[r]) if(id!==G.id) s+=WDO[r][id].s||0; if(r===G.realm) s+=wdData().s; return s; }
function wdStageOf(n){ let k=0; while(k<5&&n>=WD_ST[k]) k++; return k; }
function wdStage(r){ wdData(); const k=wdStageOf(wdTotal(r)); if(k>(G.wdMax[r]||0)) G.wdMax[r]=k; return G.wdMax[r]; }
function wdBonus(){ return G.realm>=0?wdStage(G.realm)*.02:0; }
function wdPub(){ if(G.realm<0) return; try{ net.pushRet("wd/"+G.realm+"/"+G.id,{i:G.id,n:G.name,r:G.realm,s:wdData().s,t:Date.now()}); WD.dirty=false; }catch(e){} }
NETX.push({sub:"wd/+/+",pre:"wd/",f:(d)=>{ if(!d||!d.i||d.i===G.id||!REALMS[d.r]) return; WDO[d.r][d.i]=d; }});
function wdGive(n,quiet){ G.stone=(G.stone||0)+n; if(!quiet&&n) floatDmg(P.x,5,P.z,`🧱 +${n}`,"gain"); }
(function(){ const _km=killMob; killMob=function(m){ const g0=G.gold; _km(m); try{ const dg=G.gold-g0; const b=wdBonus(); if(dg>0&&b>0) G.gold+=Math.round(dg*b); if(!m.war&&!m.titan){ if(m.boss) wdGive(8); else if(Math.random()<.6) wdGive(1,true); } }catch(e){} };
  const _gx=gainXp; gainXp=function(n){ return _gx(Math.round(n*(1+wdBonus()))); };
  const _fc=fishCaught; fishCaught=function(g){ _fc(g); try{ wdGive(1+(g.f[1]>=4?2:0),true); }catch(e){} };
  const _st=stat; stat=function(){ const s=_st(); if(G.realm>=0&&wdStage(G.realm)>=5) s.atk*=1.05; return s; };
  const _gi=grantIdle; grantIdle=function(){ const r=_gi(); try{ if(r&&r.mins>0){ const n=Math.min(60,Math.floor(r.mins/8)); if(n>0){ wdData().s+=n; WD.dirty=true; r.wdStone=n; saveGame(); setTimeout(()=>{ if(!layerOpen) toast(`🏛️ 쉬는 동안 일꾼이 돌 ${n}개를 날랐어요`,`${WD_NAME[G.realm]} 짓기에 보탰어요`,3); },7000); } } }catch(e){} return r; }; })();
/* ---------- 모델: 세계마다 5단계 ---------- */
function wdModel(r){ const g=new THREE.Group(); const st=[0,1,2,3,4].map(()=>new THREE.Group()); st.forEach(s=>g.add(s)); const col=new THREE.Color(REALMS[r].c1).getHex();
  const marble=M.marble, gold=M.gold, stone=M.stone, glow=c=>glowMat(c,.85);
  if(r===0){ // 하늘 사다리 탑
    st[0].add(cyl(10,11,1.4,marble,0,.7,0,32)); for(let k=0;k<4;k++){ const a=k*Math.PI/2; st[0].add(box(4,.7,2.6,marble,Math.cos(a)*11.2,.35,Math.sin(a)*11.2)); }
    st[1].add(cyl(6.5,7.2,7,M.white,0,4.9,0,24)); st[1].add(cyl(7.4,7.4,.6,gold,0,8.5,0,24)); for(let k=0;k<8;k++){ const a=k/8*6.283; { const b=box(.9,2.4,.4,glowMat(0xfff2a0,.6),Math.cos(a)*6.9,5.2,Math.sin(a)*6.9); b.rotation.y=-a+Math.PI/2; st[1].add(b); } }
    st[2].add(cyl(4.8,5.4,7,M.white,0,12.3,0,22)); st[2].add(cyl(5.6,5.6,.5,gold,0,15.9,0,22)); for(let k=0;k<14;k++){ const a=k/14*6.283*1.6; { const b=box(1.6,.35,.9,marble,Math.cos(a)*5.6,9+k*.5,Math.sin(a)*5.6); b.rotation.y=-a; st[2].add(b); } }
    st[3].add(cyl(3.2,3.8,6,M.white,0,19,0,20)); const dome=sph(3.4,gold,0,22.2,0); dome.scale.y=.8; st[3].add(dome); st[3].add(cyl(.25,.25,3,gold,0,25.4,0,8));
    const beam=cyl(1.2,2.2,80,glowMat(0xfff2c0,.2),0,64,0,12); beam.userData.noOutline=true; st[4].add(beam); const halo=new THREE.Mesh(new THREE.TorusGeometry(5,.35,8,48),glow(0xffe27a)); halo.rotation.x=Math.PI/2; halo.position.y=28; st[4].add(halo); g.userData.spin=halo;
    for(let k=0;k<10;k++){ const a=k/10*6.283; st[4].add(sph(.4,glow(0xfff6d0),Math.cos(a)*7,26+Math.sin(k)*2,Math.sin(a)*7)); } }
  else if(r===1){ // 비프로스트 문
    st[0].add(box(22,1.4,9,stone,0,.7,0)); st[0].add(box(18,.7,6,M.rock,0,1.75,0));
    [-6,6].forEach(x=>{ st[1].add(box(3,11,3,stone,x,7.6,0)); for(let k=0;k<4;k++) st[1].add(box(.4,.9,3.1,glowMat(0x8fe0ff,.7),x+(x>0?-1.55:1.55),4+k*2.4,0)); });
    st[2].add(box(16.5,2.2,3.6,stone,0,14.2,0)); const roof=new THREE.Mesh(new THREE.ConeGeometry(10,4,4),gold); roof.rotation.y=Math.PI/4; roof.scale.set(1.15,1,.36); roof.position.y=17.3; st[2].add(roof);
    [-9.5,9.5].forEach(x=>{ st[3].add(cyl(1.1,1.4,1.6,stone,x,2.9,2.6,12)); const f=sph(.9,glow(0x8fe0ff),x,4.2,2.6); f.scale.y=1.4; st[3].add(f); const rv=new THREE.Group(); rv.add(sph(.9,M.dark,0,0,0)); rv.add(sph(.55,M.dark,0,.8,.5)); const bk=new THREE.Mesh(new THREE.ConeGeometry(.22,.7,6),gold); bk.rotation.x=Math.PI/2; bk.position.set(0,.8,1.1); rv.add(bk); rv.position.set(x*.63,16.6,0); st[3].add(rv); });
    const RB=[0xff4a4a,0xffa040,0xffe24a,0x5fdc6a,0x4aa8ff,0x9a6aff]; RB.forEach((c,k)=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(15-k*.9,.42,8,48,Math.PI),glowMat(c,.7)); t.position.set(0,1.5,-3.2); t.userData.noOutline=true; st[4].add(t); }); }
  else if(r===2){ // 황금 연꽃 사원
    const pool=new THREE.Mesh(new THREE.CircleGeometry(12,40),M.water); pool.rotation.x=-Math.PI/2; pool.position.y=.25; st[0].add(pool); st[0].add(cyl(12.4,12.6,.4,M.tgold,0,.2,0,40)); for(let k=0;k<9;k++){ const l=sph(.8,M.lotus,Math.cos(k*.7)*9.6,.4,Math.sin(k*.7)*9.6); l.scale.y=.35; st[0].add(l); } st[0].add(cyl(7.6,8,1.2,M.temple,0,.9,0,8));
    st[1].add(cyl(6.2,6.8,4.2,M.temple,0,3.6,0,8)); st[1].add(cyl(7,7,.5,M.tgold,0,5.9,0,8)); for(let k=0;k<8;k++){ const a=k/8*6.283+.39; st[1].add(cyl(.35,.35,4,M.tgold,Math.cos(a)*6.6,3.6,Math.sin(a)*6.6,8)); }
    const sk=new THREE.Mesh(new THREE.ConeGeometry(5.2,13,8),M.tgold); sk.position.y=12.6; st[2].add(sk); for(let k=0;k<4;k++){ const a=k*Math.PI/2+.39; const s2=new THREE.Mesh(new THREE.ConeGeometry(1.8,6,8),M.temple); s2.position.set(Math.cos(a)*5.4,9,Math.sin(a)*5.4); st[2].add(s2); }
    for(let k=0;k<10;k++){ const a=k/10*6.283; const p=sph(1.8,M.lotus,Math.cos(a)*7.8,6.6,Math.sin(a)*7.8); p.scale.set(.6,1.1,1.6); p.rotation.y=-a; p.rotation.z=.5; st[3].add(p); }
    const kal=sph(1.3,M.tgold,0,20.2,0); st[4].add(kal); st[4].add(cyl(.2,.2,2.4,M.tgold,0,22,0,8)); const halo=new THREE.Mesh(new THREE.TorusGeometry(3.2,.3,8,40),glow(0xffd080)); halo.position.y=20.5; st[4].add(halo); g.userData.spin=halo; st[4].add(sph(.9,glow(0xfff2a0),0,23.4,0)); }
  else { // 거인 경기장
    const fl=cyl(13,13.6,1,marble,0,.5,0,40); fl.scale.z=.72; st[0].add(fl); const tr=new THREE.Mesh(new THREE.RingGeometry(7.5,10.5,40),mat({color:0xc87a4a,roughness:.95})); tr.rotation.x=-Math.PI/2; tr.position.y=1.02; tr.scale.y=.72; st[0].add(tr);
    for(let k=0;k<18;k++){ const a=k/18*6.283; st[1].add(cyl(.55,.65,7,marble,Math.cos(a)*12.4,4.5,Math.sin(a)*12.4*.72,10)); }
    const ent=new THREE.Mesh(new THREE.TorusGeometry(12.4,.75,6,48),marble); ent.rotation.x=Math.PI/2; ent.scale.y=.72; ent.position.y=8.3; st[2].add(ent); for(let k=0;k<3;k++){ const s3=new THREE.Mesh(new THREE.TorusGeometry(11.2-k*1.1,.5,4,40),M.stone); s3.rotation.x=Math.PI/2; s3.scale.y=.72; s3.position.y=1.4+k*.8; st[2].add(s3); }
    [[0,1],[0,-1]].forEach(([x,z])=>{ const ob=new THREE.Group(); ob.add(cyl(1.4,1.6,1,marble,0,.5,0,12)); try{ const b=makeAvatar(3,6,true); b.scale.setScalar(1.8); b.position.y=1; ob.add(b); }catch(e){} ob.position.set(x,1,z*6.4); st[3].add(ob); }); for(let k=0;k<4;k++){ const a=k*Math.PI/2+Math.PI/4; const lr=new THREE.Mesh(new THREE.TorusGeometry(.9,.28,6,16),M.laurel); lr.position.set(Math.cos(a)*12.4,9.5,Math.sin(a)*12.4*.72); st[3].add(lr); }
    st[4].add(cyl(1.6,.8,1.6,gold,0,2.2,0,16)); st[4].add(cyl(.5,.6,1.2,gold,0,1,0,10)); const fire=sph(1.4,glow(0xff8a2a),0,3.6,0); fire.scale.y=1.6; st[4].add(fire); st[4].add(sph(.8,glow(0xffe27a),0,3.5,0)); g.userData.fire=fire; const crown=new THREE.Mesh(new THREE.TorusGeometry(13.5,.35,6,48),glow(0xffd24a)); crown.rotation.x=Math.PI/2; crown.scale.y=.72; crown.position.y=9.4; st[4].add(crown); }
  // 공사장 비계(다 지으면 사라짐)
  const sc=new THREE.Group(); const wood=M.wood; for(let k=0;k<8;k++){ const a=k/8*6.283; const x=Math.cos(a)*12.5, z=Math.sin(a)*12.5; sc.add(cyl(.14,.14,10,wood,x,5,z,6)); } for(let h=2;h<=10;h+=4){ const ring=new THREE.Mesh(new THREE.TorusGeometry(12.5,.12,4,8),wood); ring.rotation.x=Math.PI/2; ring.rotation.z=Math.PI/8; ring.position.y=h; sc.add(ring); }
  const crane=new THREE.Group(); crane.add(box(.6,16,.6,mat({color:0xf2b233,roughness:.7}),0,8,0)); crane.add(box(12,.5,.5,mat({color:0xf2b233,roughness:.7}),4,16,0)); crane.add(cyl(.05,.05,6,M.dark,9,13,0,4)); crane.add(box(1.4,1,1.4,stone,9,9.6,0)); crane.position.set(-12,0,-9); sc.add(crane); g.userData.crane=crane;
  const pile=new THREE.Group(); for(let k=0;k<7;k++) pile.add(box(1.2,.8,.9,stone,rnd(-1.6,1.6),.4+Math.floor(k/3)*.8,rnd(-1,1))); pile.position.set(13,0,7); sc.add(pile); g.add(sc);
  g.userData.st=st; g.userData.sc=sc; return g; }
(function(){ for(let r=0;r<4;r++){ const s=wdSpot(r); const g=wdModel(r); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; g.scale.setScalar(.85); scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); WD.sites[r]={x:s.x,z:s.z,g,shown:-1}; } })();
function wdNear(){ if((typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)) return null; for(let r=0;r<4;r++){ const s=WD.sites[r]; if(Math.hypot(P.x-s.x,P.z-s.z)<17) return {r,s}; } return null; }
function wdShow(r){ const s=WD.sites[r]; const k=wdStage(r); if(s.shown===k) return; s.g.userData.st.forEach((g,i)=>g.visible=i<k); s.g.userData.sc.visible=k<5; s.shown=k; }
/* ---------- 바치기 ---------- */
function wdDonate(){ const n=G.stone||0; const nr=wdNear(); if(!nr) return; if(nr.r!==G.realm){ toast(`${REALMS[nr.r].n}의 불가사의예요`,"내 세계 공사장에 바쳐요",2); return; } if(n<=0){ toast("🧱 건축 돌이 없어요","괴물을 잡거나 낚시하면 모여요",2); return; }
  const k0=wdStage(G.realm); G.stone=0; wdData().s+=n; WD.dirty=true; G.wdDon=(G.wdDon||0)+1; saveGame(); wdPub();
  const s=WD.sites[G.realm]; for(let i=0;i<Math.min(8,2+Math.floor(n/20));i++) setTimeout(()=>{ fxSpark(s.x+rnd(-6,6),2+rnd(0,8),s.z+rnd(-6,6),0xd8c8a8,8); },i*90); fxRing(s.x,s.z,new THREE.Color(REALMS[G.realm].c1).getHex(),12,.8); jingle([523,659,784]); buzz(30);
  toast(`🧱 돌 ${n}개를 바쳤어요!`,`${WD_NAME[G.realm]} ${wdTotal(G.realm)}/${WD_ST[Math.min(4,k0)]}`,2.2); wdCheck(); if(layerOpen) showWonder(); }
function wdCheck(){ if(G.realm<0) return; const before=G.wdSeen==null?wdStage(G.realm):G.wdSeen; const k=wdStage(G.realm); if(G.wdSeen==null){ G.wdSeen=k; return; } if(k>before){ G.wdSeen=k; saveGame(); WD.fw=25; WD.fwR=G.realm;
  try{ lvBanner("세계 불가사의",`${k}단계 완성!`,`${WD_NAME[G.realm]}이(가) 자랐어요 · ${REALMS[G.realm].n} 모두 ${WD_BONUS[k-1]}`,REALMS[G.realm].c1); }catch(e){} jingle([523,659,784,1046,1318,1568,2093]); buzz([40,30,80]); if(typeof fxPillar==="function") fxPillar(new THREE.Color(REALMS[G.realm].c1).getHex(),2,26,1.6,.45); } }
/* ---------- 매 프레임 ---------- */
function wdTick(dt){ if(!started||G.realm<0) return; WD.t-=dt; WD.pubT-=dt; const t=performance.now()/1000;
  if(WD.t<=0){ WD.t=1; for(let r=0;r<4;r++) wdShow(r); wdCheck(); }
  if(WD.pubT<=0){ WD.pubT=90; if(WD.dirty||!WD.seen){ WD.seen=true; wdPub(); } }
  const nr=wdNear(); let near=null; for(let r=0;r<4;r++){ const s=WD.sites[r]; const d=Math.hypot(P.x-s.x,P.z-s.z); if(d>110) continue; const u=s.g.userData; if(u.spin) u.spin.rotation.z+=dt*.8; if(u.fire){ u.fire.scale.set(1+Math.sin(t*8)*.1,1.6+Math.sin(t*11)*.2,1); } if(u.crane&&u.sc.visible) u.crane.rotation.y=Math.sin(t*.25)*.6; if(d<60&&(!near||d<near.d)) near={r,s,d}; }
  if(!WD.lbl) WD.lbl=makeLabel("ally"); if(near&&!layerOpen){ const k=wdStage(near.r); const tot=wdTotal(near.r); placeLabel(WD.lbl,near.s.x,k>=4?32:k>=2?24:16,near.s.z,`🏛️ ${WD_NAME[near.r]} <b>${k}/5단계</b>${k<5?`<span class="hp"><i style="width:${Math.round(Math.min(1,tot/WD_ST[k])*100)}%;background:#ffcf4a"></i></span>`:""}`); } else WD.lbl.style.display="none";
  if(WD.fw>0){ WD.fw-=dt; WD.fwT-=dt; const s=WD.sites[WD.fwR]; if(WD.fwT<=0&&Math.hypot(P.x-s.x,P.z-s.z)<140){ WD.fwT=.35; const cs=[0xff5a5f,0xffe14a,0x5fdc6a,0x4aa8ff,0xd070ff,0xffffff]; fxSpark(s.x+rnd(-14,14),20+rnd(0,14),s.z+rnd(-14,14),cs[Math.floor(Math.random()*cs.length)],HIGH()?40:22); } } }
/* ---------- 창 ---------- */
function showWonder(){ if(G.realm<0) return; const r=G.realm, k=wdStage(r), tot=wdTotal(r), me=wdData().s; const nr=wdNear();
  const L=[]; for(const id in WDO[r]) if(id!==G.id) L.push(WDO[r][id]); L.push({n:G.name,s:me,me:1}); L.sort((a,b)=>(b.s||0)-(a.s||0)); const ppl=L.filter(x=>x.s>0).length;
  const wall=L.filter(x=>x.s>0).slice(0,8).map((x,i)=>`<div class="row"><div class="ic">${i===0?"🥇":i===1?"🥈":i===2?"🥉":"🧱"}</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>돌 ${fmt(x.s)}개</span></div></div>`).join("");
  const others=REALMS.map((R,i)=>`<div><b>${R.icon}</b>${R.n}<br>${wdStage(i)}/5</div>`).join("");
  card(`<h2>🏛️ ${WD_NAME[r]}</h2><p>${REALMS[r].n} 사람 모두가 함께 짓는 세계 불가사의예요. 🧱 건축 돌을 공사장에 바치면 모두의 몫이 더해져요. 한 번 완성된 단계는 사라지지 않아요.</p>
   <div class="wdst">${[0,1,2,3,4].map(i=>`<div class="${i<k?"on":""}"><b>${i<k?"✅":i===k?"🏗️":"🔒"}</b>${i+1}단계<br>${WD_BONUS[i]}</div>`).join("")}</div>
   ${k<5?`<div class="wdbar"><i style="width:${Math.round(Math.min(1,tot/WD_ST[k])*100)}%"></i><span>${fmt(tot)} / ${fmt(WD_ST[k])} 돌 · ${k+1}단계까지</span></div>`:`<p style="color:#ffcf4a"><b>완공!</b> ${REALMS[r].n} 모두 경험치·금화 +10% · 공격 +5%</p>`}
   <div class="idlegrid"><div><b>${fmt(G.stone||0)}</b><span>🧱 내가 가진 돌</span></div><div><b>${fmt(me)}</b><span>내가 바친 돌 · 함께한 사람 ${ppl}명</span></div></div>
   ${nr&&nr.r===r?`<button class="go" id="wdGive" style="align-self:center" ${(G.stone||0)>0?"":"disabled"}>🧱 돌 바치기</button>`:`<div class="exgrid"><button class="buy" id="wdWay">공사장으로 길 안내</button>${k>=3?'<button class="buy alt" id="wdTp">🌀 순간이동 문</button>':'<button class="buy alt" disabled>🌀 3단계에 열려요</button>'}</div>`}
   <p style="font-size:12px">돌은 괴물을 잡으면 자주(보스 8개), 낚시로도 모여요. 게임을 꺼 둔 동안에도 일꾼이 8분마다 1개씩(최대 60개) 날라 줘요.</p>
   <h3>🧱 이름 벽 (가장 많이 바친 사람)</h3>${wall||'<p style="font-size:13px">첫 돌을 바쳐 이름을 새겨 보세요!</p>'}
   <h3>네 세계 불가사의</h3><div class="wdst">${others}</div>`);
  if($("wdGive")) $("wdGive").onclick=wdDonate; if($("wdWay")) $("wdWay").onclick=()=>{ const s=WD.sites[r]; setGuide({x:s.x,z:s.z,label:"🏛️ "+WD_NAME[r]}); closeLayer(); };
  if($("wdTp")) $("wdTp").onclick=()=>{ if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 안 돼요"); return; } if(RC.on) return; if(DG.on||HM.on){ toast("미궁·신전 섬에서는 안 돼요"); return; } const s=WD.sites[r]; const cap=REGIONS[r*3]; const dx=cap.x-s.x, dz=cap.z-s.z, Ld=Math.hypot(dx,dz); P.x=s.x+dx/Ld*15; P.z=s.z+dz/Ld*15; P.y=0; P.vy=0; closeLayer(); fxRing(P.x,P.z,0xb08cff,6,.7); toast("🌀 불가사의로 왔어요"); }; }
/* ---------- 상황 버튼 · 칭호 ---------- */
const CTX_EXTRA=[
 ()=>{ const s=fgNear(); return s?{t:"🔨 대장간",f:showForge}:null; },
 ()=>{ if(RC.on) return null; const co=rcNearGate(); return co?{t:"🏁 경주 출발",f:()=>rcStart(co)}:null; },
 ()=>{ const nr=wdNear(); return nr&&nr.r===G.realm?{t:(G.stone||0)>0?`🧱 돌 바치기 (${G.stone})`:"🏛️ 불가사의",f:(G.stone||0)>0?wdDonate:showWonder}:null; } ];
TITLES.push({id:"wd1",n:"첫 돌을 놓은 자",t:1,h:"불가사의에 돌 바치기",g:()=>[G.wdDon?1:0,1]},{id:"wd500",n:"불가사의 건축가",t:2,h:"돌 500개 바치기",g:()=>[wdData().s,500]},{id:"wd5",n:"세계의 기적",t:3,h:"내 세계 불가사의 완공",g:()=>[G.realm>=0?wdStage(G.realm):0,5]});
</script>
