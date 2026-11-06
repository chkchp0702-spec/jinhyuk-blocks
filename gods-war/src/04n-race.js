<script>
/* ================= v24-2: 🐎 신수 타기 + 🏁 하늘 고리 경주 (IDEAS G11/4-2) =================
   짝꿍 신수 Lv5 부터 「타기」 버튼 → 신수가 커지고 등에 올라탐(이동 1.6배, 공중에서 천천히 활공). 친구 화면에도 탄 모습(st.rd).
   세계마다 수도 앞 출발 문에서 시작하는 고리 20개 경주 길(내 세계의 두 땅을 한 바퀴). 순서대로 통과하는 시간 겨루기.
   내 가장 빠른 기록은 「그림자 길」로 보관(retained rc/<길>/<id>) → 같은 방의 누구든 그 그림자와 나란히 달려 이길 수 있음.
   남의 기록을 깨면 그 사람에게 「○○이 기록을 깼어요!」가 남음(retained rcb/<그 사람>/<나>). 경주 중엔 괴물 공격을 안 받음. */
const RIDE_H=1.25, RC_N=20, RC_SAMPLE=.2;
const RD={btn:null,t:0};
const RCO=[{},{},{},{}];   // 길마다 {id: 기록}
const RC={on:false,c:-1,ri:0,t:0,cd:0,path:[],pt:0,ghost:null,gl:null,rival:null,rings:[],beam:null,courses:[],hud:null};
/* ---------- 탈것 ---------- */
function rdCan(){ const a=typeof petArr==="function"?petArr():null; return !!(a&&a[1]>=5&&PETMESH.me); }
function rdSet(on){ if(on&&!rdCan()){ toast("신수가 Lv.5가 되면 탈 수 있어요","메뉴 → 🐣 신수에서 짝꿍 신수를 데려가요",2.4); return; } if(!!P.ride===!!on) return; P.ride=!!on; const me=PETMESH.me;
  if(me){ const m=me.mesh; if(m.userData._bs==null) m.userData._bs=m.scale.x; m.scale.setScalar(m.userData._bs*(on?2.1:1)); }
  if(on){ fxRing(P.x,P.z,0xffffff,4,.5); fxSpark(P.x,1,P.z,PETS[G.pet].c,20); tone(660,.08,"triangle"); tone(990,.1,"triangle",.06); G.rideN=(G.rideN||0)+1; } else { fxSpark(P.x,1,P.z,0xffffff,8); tone(440,.08,"triangle"); }
  rdBtn(); try{ saveGame(); }catch(e){} }
function rdBtn(){ if(!RD.btn){ const acts=document.querySelector(".acts"); if(!acts) return; const b=document.createElement("button"); b.className="act"; b.id="bRide"; b.type="button"; b.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); if(!layerOpen&&!P.dead) rdSet(!P.ride); }); acts.appendChild(b); RD.btn=b; }
  const can=rdCan(); RD.btn.hidden=!can&&!P.ride; RD.btn.classList.toggle("on",!!P.ride); const ic=G.pet>=0?(["🦅","🐎","🐦","🦄","🔥"][G.pet]||"🐾"):"🐎"; const html=`${ic}<small>${P.ride?"내리기":"타기"}</small>`; if(RD.btn.innerHTML!==html) RD.btn.innerHTML=html; }
function rdTick(dt){ if(!started) return; RD.t-=dt; if(RD.t<=0){ RD.t=.5; rdBtn(); }
  if(P.ride&&(!rdCan()||P.dead||(typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on))){ P.ride=false; const me=PETMESH.me; if(me&&me.mesh.userData._bs!=null) me.mesh.scale.setScalar(me.mesh.userData._bs); rdBtn(); }
  if(P.ride){ const me=PETMESH.me; if(me){ const m=me.mesh; const bob=P.moving&&P.y===0?Math.abs(Math.sin(P.walk*.55))*.18:0; me.x=P.x; me.z=P.z; m.position.set(P.x,(P.gy||0)+P.y+bob,P.z); m.rotation.y=player.rotation.y; m.visible=!P.dead; player.position.y+=bob; }
    if(P.y>0&&P.vy<0) P.vy+=16*dt;   // 활공: 천천히 내려옴
    if(P.moving&&P.y===0&&Math.random()<dt*(ECO()?5:10)) fxSpark(P.x+rnd(-.6,.6),.3,P.z+rnd(-.6,.6),0xd8cfb8,2); }
  // 친구가 탄 모습
  for(const id in PEERS){ const o=PEERS[id]; const pm=PETMESH.others["p"+id]; if(!pm) continue; const m=pm.mesh; if(m.userData._bs==null) m.userData._bs=m.scale.x;
    if(o.ride&&!o.dead){ m.scale.setScalar(m.userData._bs*2.1); pm.x=o.x; pm.z=o.z; m.position.set(o.x,hAt(o.x,o.z),o.z); m.rotation.y=o.mesh.rotation.y; o.mesh.position.y+=RIDE_H; } else if(m.scale.x!==m.userData._bs) m.scale.setScalar(m.userData._bs); } }
/* ---------- 경주 길 ---------- */
function rcBuild(c){ const cap=REGIONS[c*3], A=REGIONS[c*3+1], B=REGIONS[c*3+2]; const inward=Math.atan2(-cap.z,-cap.x); const S={x:cap.x+Math.cos(inward)*34,z:cap.z+Math.sin(inward)*34};
  const off=(R,k)=>{ const dx=R.x-cap.x, dz=R.z-cap.z, L=Math.hypot(dx,dz); return new THREE.Vector3(R.x+dx/L*12+(-dz/L)*k,0,R.z+dz/L*12+(dx/L)*k); };
  const mid=(p,q,k)=>{ const x=(p.x+q.x)/2, z=(p.z+q.z)/2; const dx=q.x-p.x, dz=q.z-p.z, L=Math.hypot(dx,dz); return new THREE.Vector3(x+(-dz/L)*k,0,z+(dx/L)*k); };
  const s3=new THREE.Vector3(S.x,0,S.z), a3=off(A,0), b3=off(B,0);
  const ctrl=[s3, mid(s3,a3,10), a3, mid(a3,b3,-14), b3, mid(b3,s3,10)];
  const curve=new THREE.CatmullRomCurve3(ctrl,true,"centripetal"); const pts=curve.getSpacedPoints(RC_N);
  const rings=[]; for(let k=1;k<=RC_N;k++){ const p=pts[k%RC_N===0?0:k]; const q=pts[(k+1)%RC_N]||pts[1]; const high=k%5===3; rings.push({x:p.x,z:p.z,y:high?4.6:2.1,high,rot:Math.atan2(q.x-p.x,q.z-p.z)}); }
  return {c,S,rings,len:curve.getLength()}; }
for(let c=0;c<4;c++) RC.courses[c]=rcBuild(c);
/* 출발 문 (세계마다) */
(function(){ RC.courses.forEach(co=>{ const g=new THREE.Group(); const col=new THREE.Color(REALMS[co.c].c1); const pm=mat({color:0xf4f1ea,roughness:.5}), cm=mat({color:col,roughness:.6});
  const r0=co.rings[0]; const ang=Math.atan2(r0.x-co.S.x,r0.z-co.S.z);
  [-4.2,4.2].forEach(x=>{ g.add(cyl(.55,.7,6,pm,x,3,0,12)); g.add(sph(.7,glowMat(col.getHex(),.9),x,6.4,0)); });
  g.add(box(9.4,.9,.8,cm,0,6,0)); const ck=document.createElement("canvas"); ck.width=128; ck.height=16; const x=ck.getContext("2d"); for(let i=0;i<16;i++) for(let j=0;j<2;j++){ x.fillStyle=(i+j)%2?"#111":"#fff"; x.fillRect(i*8,j*8,8,8); }
  const ban=new THREE.Mesh(new THREE.PlaneGeometry(8.6,1.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(ck),side:THREE.DoubleSide})); ban.position.set(0,5,0); g.add(ban);
  const line=new THREE.Mesh(new THREE.PlaneGeometry(8.4,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(ck),transparent:true,opacity:.85})); line.rotation.x=-Math.PI/2; line.position.y=.08; line.userData.noOutline=true; g.add(line);
  g.position.set(co.S.x,hAt(co.S.x,co.S.z),co.S.z); g.rotation.y=ang; scene.add(shadowify(g)); co.gate=g; }); })();
function rcNearGate(){ if((typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)) return null; for(const co of RC.courses){ if(Math.hypot(P.x-co.S.x,P.z-co.S.z)<6.5) return co; } return null; }
/* 고리 메시: 경주 중에만 만듦 (앞 고리 3개만 보임) */
function rcRingMesh(col){ const g=new THREE.Group(); const t=new THREE.Mesh(new THREE.TorusGeometry(2.7,.28,10,40),glowMat(col,.95)); g.add(t); const t2=new THREE.Mesh(new THREE.TorusGeometry(2.7,.12,8,40),new THREE.MeshBasicMaterial({color:0xffffff})); g.add(t2); const disc=new THREE.Mesh(new THREE.CircleGeometry(2.5,32),glowMat(col,.12)); disc.material.side=THREE.DoubleSide; g.add(disc); g.userData={t,t2,disc}; g.traverse(o=>o.userData.noOutline=true); return g; }
function rcClearMeshes(){ RC.rings.forEach(m=>scene.remove(m)); RC.rings=[]; if(RC.beam){ scene.remove(RC.beam); RC.beam=null; } if(RC.ghost){ scene.remove(RC.ghost); RC.ghost=null; } if(RC.gl){ RC.gl.remove(); RC.gl=null; } if(RC.hud){ RC.hud.remove(); RC.hud=null; } const cd=$("rcCount"); if(cd) cd.remove(); }
/* ---------- 기록 ---------- */
function rcMine(c){ G.rc=G.rc||{}; return G.rc[c]||null; }
function rcBoard(c){ const L={}; for(const id in RCO[c]) L[id]=RCO[c][id]; const m=rcMine(c); if(m&&G.realm>=0) L[G.id]={i:G.id,n:G.name,r:G.realm,t:m.t,me:1}; return Object.values(L).filter(x=>x&&x.t>0).sort((a,b)=>a.t-b.t); }
function rcRival(c){ const b=rcBoard(c); const m=rcMine(c); const others=b.filter(x=>!x.me&&x.p&&x.p.length>4); if(!others.length) return m&&m.p?{n:"내 그림자",t:m.t,p:m.p,r:G.realm,mine:1}:null;
  // 내 기록보다 조금 빠른 사람(없으면 1등)
  const faster=others.filter(x=>!m||x.t<m.t); return faster.length?faster[faster.length-1]:others[0]; }
function rcPub(c){ const m=rcMine(c); if(!m) return; try{ net.pushRet("rc/"+c+"/"+G.id,{i:G.id,n:G.name,r:G.realm,k:G.rank,c,t:m.t,p:m.p,ts:Date.now()}); }catch(e){} }
NETX.push({sub:"rc/+/+",pre:"rc/",f:(d)=>{ if(!d||!d.i||d.i===G.id||d.c==null||!RCO[d.c]) return; RCO[d.c][d.i]=d; }});
NETX.push({sub:()=>"rcb/"+G.id+"/+",pre:"rcb/",f:(d)=>{ if(!d||!d.i||d.i===G.id||!d.ts) return; G.rcSeen=G.rcSeen||{}; if((G.rcSeen[d.i]||0)>=d.ts) return; G.rcSeen[d.i]=d.ts; saveGame();
  setTimeout(()=>{ toast(`🏁 ${d.n}이(가) 내 경주 기록을 깼어요!`,`${REALMS[d.c].n} 길 ${rcFmt(d.t)} (내 기록 ${rcFmt(d.o)}) · 다시 도전!`,4); },started?200:4000); }});
function rcFmt(t){ return (t||0).toFixed(2)+"초"; }
/* ---------- 경주 진행 ---------- */
function rcStart(co){ if(RC.on||P.dead) return; if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<14)){ toast("괴물이 가까이 있어요!","싸움이 끝나면 출발해요",1.8); return; }
  closeLayer(); if(rdCan()&&!P.ride) rdSet(true);
  rcClearMeshes(); Object.assign(RC,{on:true,c:co.c,ri:0,t:0,cd:3.2,path:[],pt:0,rival:rcRival(co.c)}); const col=new THREE.Color(REALMS[co.c].c1).getHex();
  co.rings.forEach((r,k)=>{ const m=rcRingMesh(r.high?0xffd24a:col); m.position.set(r.x,hAt(r.x,r.z)+r.y,r.z); m.rotation.y=r.rot; m.visible=false; scene.add(m); RC.rings.push(m); });
  RC.beam=cyl(1.2,1.2,60,glowMat(0xfff2a0,.18),0,30,0,12); RC.beam.userData.noOutline=true; scene.add(RC.beam);
  if(RC.rival&&RC.rival.p){ let gh=null; try{ const gr=RC.rival.r>=0?RC.rival.r:G.realm; gh=(typeof avatarGL==="function"&&avatarGL(gr,RC.rival.k||0,{},undefined,{w:-1,a:-1,r:-1}))||makeAvatar(gr,RC.rival.k||0,false,{}); if(typeof DREAM!=="undefined"&&DREAM.dreamify) DREAM.dreamify(gh); }catch(e){ gh=null; } if(!gh){ gh=new THREE.Group(); gh.add(sph(.9,glowMat(0x9fb6ff,.8),0,1.6,0)); } RC.ghost=gh; scene.add(gh); RC.gl=makeLabel("ally"); }
  const h=document.createElement("div"); h.id="rcHud"; document.body.appendChild(h); RC.hud=h; h.addEventListener("pointerdown",e=>{ if(e.target.tagName==="BUTTON"){ e.stopPropagation(); rcEnd(false,"그만뒀어요"); } });
  const cd=document.createElement("div"); cd.id="rcCount"; document.body.appendChild(cd);
  P.x=co.S.x; P.z=co.S.z; P.rot=Math.atan2(co.rings[0].x-co.S.x,co.rings[0].z-co.S.z); tone(523,.12,"square"); }
function rcGhostAt(t){ const p=RC.rival&&RC.rival.p; if(!p) return null; const f=t/RC_SAMPLE; const i=Math.floor(f); if(i>=p.length/2-1){ const n=p.length/2-1; return {x:p[n*2],z:p[n*2+1],done:1}; } const a=f-i; return {x:p[i*2]+(p[i*2+2]-p[i*2])*a,z:p[i*2+1]+(p[i*2+3]-p[i*2+1])*a}; }
function rcTick(dt){ if(!RC.on) return; const co=RC.courses[RC.c];
  if(P.dead||(typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)){ rcEnd(false,"경주가 멈췄어요"); return; }
  const cdEl=$("rcCount");
  if(RC.cd>0){ const before=Math.ceil(RC.cd); RC.cd-=dt; P.x=co.S.x; P.z=co.S.z; P.dashT=0; const now=Math.ceil(RC.cd); if(cdEl) cdEl.textContent=RC.cd>0?now:"출발!"; if(now!==before&&RC.cd>0) { tone(523,.12,"square"); buzz(30); } if(RC.cd<=0){ tone(1046,.25,"square"); buzz([40,20,40]); setTimeout(()=>{ const e=$("rcCount"); if(e) e.remove(); },650); } rcDraw(); return; }
  RC.t+=dt; RC.pt-=dt; if(RC.pt<=0){ RC.pt+=RC_SAMPLE; RC.path.push(Math.round(P.x*2)/2,Math.round(P.z*2)/2); }
  const r=co.rings[RC.ri]; const d=Math.hypot(P.x-r.x,P.z-r.z);
  if(d<3.4&&(!r.high||P.y>.9)){ const m=RC.rings[RC.ri]; m.visible=false; fxRing(r.x,r.z,r.high?0xffd24a:0xffffff,4,.4); fxSpark(r.x,hAt(r.x,r.z)+r.y,r.z,r.high?0xffd24a:0xffffff,HIGH()?26:14); tone(700+RC.ri*28,.07,"triangle"); buzz(15); RC.ri++; if(RC.ri>=RC_N){ rcEnd(true); return; } }
  else if(d<3.4&&r.high&&P.y<=.9&&!RC.hint){ RC.hint=1; toast("높은 고리는 점프!","금빛 고리는 뛰어서 통과해요",1.4); }
  if(d>110){ rcEnd(false,"길에서 너무 멀어졌어요"); return; }
  rcDraw(); }
function rcDraw(){ const co=RC.courses[RC.c]; const t=performance.now()/1000;
  RC.rings.forEach((m,k)=>{ const show=k>=RC.ri&&k<RC.ri+3; m.visible=show; if(show){ const u=m.userData; const nx=k===RC.ri; const s=nx?1+Math.sin(t*6)*.06:.85; m.scale.setScalar(s); u.t.material.opacity=nx?.95:.45; u.disc.material.opacity=nx?.16:.05; u.t.rotation.z=t*(nx?2:1); } });
  const r=co.rings[Math.min(RC.ri,RC_N-1)]; if(RC.beam){ RC.beam.position.set(r.x,hAt(r.x,r.z)+30,r.z); RC.beam.material.opacity=.14+Math.sin(t*4)*.05; }
  let gtxt=""; if(RC.ghost){ const g=rcGhostAt(Math.max(0,RC.t)); if(g){ const p=RC.ghost.position; const nx=g.x, nz=g.z; if(p.x||p.z){ const dx=nx-p.x, dz=nz-p.z; if(Math.hypot(dx,dz)>.05) RC.ghost.rotation.y=Math.atan2(dx,dz); } p.set(nx,hAt(nx,nz)+(RC.rival.mine?0:RIDE_H*.6),nz); if(RC.ghost.userData.gl) animState(RC.ghost,g.done?"idle":"run");
      placeLabel(RC.gl,nx,4.4,nz,`👻 ${RC.rival.n} <b>${rcFmt(RC.rival.t)}</b>`); const diff=RC.t-RC.rival.t; gtxt=g.done?`<span class="gh">👻 ${RC.rival.n} 도착 · ${rcFmt(RC.rival.t)}</span>`:`<span class="gh">👻 ${RC.rival.n} ${rcFmt(RC.rival.t)}</span>`; } }
  if(RC.hud) RC.hud.innerHTML=`🏁 <b>${Math.min(RC.ri+1,RC_N)}</b>/${RC_N} · <b>${RC.cd>0?"0.00":RC.t.toFixed(2)}</b>초 ${gtxt}<button type="button">그만</button>`; }
function rcEnd(ok,why){ const c=RC.c, t=RC.t, path=RC.path.slice(), rival=RC.rival; RC.on=false; rcClearMeshes(); if(!ok){ toast("🏁 경주 끝",why||"",1.8); return; }
  path.push(Math.round(P.x*2)/2,Math.round(P.z*2)/2);
  const prev=rcMine(c); const best=!prev||t<prev.t; G.rcN=(G.rcN||0)+1; const gold=Math.round(40+G.lv*6+(best?60:0)), xp=Math.round(30+G.lv*8); G.gold+=gold; gainXp(xp);
  // 내가 이긴 사람들 (보관된 기록 중 내 새 기록보다 느린데, 예전 내 기록은 그보다 느렸던 사람)
  const beaten=[]; if(best){ for(const id in RCO[c]){ const o=RCO[c][id]; if(!o||!o.t) continue; if(t<o.t&&(!prev||prev.t>=o.t)) beaten.push(o); } G.rc=G.rc||{}; G.rc[c]={t:+t.toFixed(2),p:path,ts:Date.now()}; rcPub(c); }
  beaten.forEach(o=>{ try{ net.pushRet("rcb/"+o.i+"/"+G.id,{i:G.id,n:G.name,c,t:+t.toFixed(2),o:o.t,ts:Date.now()}); }catch(e){} }); G.rcBeat=(G.rcBeat||0)+beaten.length;
  const vsGhost=rival&&!rival.mine?(t<rival.t?`<p style="color:#9dffb8"><b>👻 ${rival.n}의 그림자를 이겼어요!</b> (${rcFmt(rival.t)})</p>`:`<p>👻 ${rival.n}의 그림자보다 ${(t-rival.t).toFixed(2)}초 늦었어요. 다시 도전!</p>`):"";
  saveGame(); jingle(best?[523,659,784,1046,1318,1568]:[659,784,1046]); fxRing(P.x,P.z,0xffd24a,8,.8); if(best&&typeof fxPillar==="function") fxPillar(0xffd24a,1.4,14,1.2,.4);
  const rank=rcBoard(c).findIndex(x=>x.me)+1;
  card(`<h2>🏁 도착!</h2><div class="fishbig" style="--c:#ffd24a"><em>⏱</em><b>${rcFmt(t)}</b><span>${REALMS[c].n} 하늘 고리 길${best?" · <b>새 기록!</b>":` · 내 기록 ${rcFmt(prev.t)}`}${rank?` · ${rank}등`:""}</span></div>
   ${vsGhost}${beaten.length?`<p style="color:#ffcf4a">기록을 깬 사람: <b>${beaten.map(o=>o.n).join(", ")}</b> — 알림이 남아요!</p>`:""}
   <p>금화 +${gold} · 경험치 +${xp}</p><div class="exgrid"><button class="buy" id="rcAgain">다시 달리기</button><button class="buy alt" id="rcBd">순위 보기</button></div>`);
  $("rcAgain").onclick=()=>{ const co=RC.courses[c]; P.x=co.S.x; P.z=co.S.z; rcStart(co); }; $("rcBd").onclick=()=>showRace(c); }
(function(){ const _hp=hurtPlayer; hurtPlayer=function(d,f){ if(RC.on) return; return _hp(d,f); }; })();
/* ---------- 창 ---------- */
function showRace(c){ if(c==null) c=G.realm; const a=typeof petArr==="function"?petArr():null; const co=RC.courses[c]; const bd=rcBoard(c).slice(0,10).map((x,k)=>`<div class="row"><div class="ic">${k===0?"🥇":k===1?"🥈":k===2?"🥉":k+1}</div><div class="t"><div>${x.n}${x.me?" (나)":""}</div><span>${REALMS[x.r]?REALMS[x.r].n:""} · <b style="color:var(--gold)">${rcFmt(x.t)}</b></span></div></div>`).join("");
  card(`<h2>🐎 신수 타기 · 🏁 하늘 고리 경주</h2>
   <div class="row"><div class="ic">${G.pet>=0?(["🦅","🐎","🐦","🦄","🔥"][G.pet]||"🐾"):"🐣"}</div><div class="t"><div>신수 타기</div><span>${a?(a[1]>=5?`${PETS[a[0]].n} Lv.${a[1]} — 오른쪽 아래 「타기」 버튼! 이동 1.6배 · 공중에서 활공`:`${PETS[a[0]].n} Lv.${a[1]} — Lv.5부터 탈 수 있어요 (${5-a[1]}레벨 남음)`):"짝꿍 신수가 있어야 해요 (메뉴 → 🐣 신수)"}</span></div>${a&&a[1]>=5?`<button class="buy" id="rdGo">${P.ride?"내리기":"타기"}</button>`:""}</div>
   <p>세계마다 수도 앞 <b>출발 문</b>에서 시작해요. 고리 ${RC_N}개를 순서대로 통과! 금빛 고리는 점프로. 내 가장 빠른 기록은 <b>그림자</b>로 남아서, 내가 꺼져 있어도 다른 사람이 내 그림자와 겨뤄요.</p>
   <div class="exgrid three">${REALMS.map((R,i)=>`<button class="buy ${i===c?"":"alt"}" data-rc="${i}">${R.icon} ${R.n}<small>${rcMine(i)?"내 기록 "+rcFmt(rcMine(i).t):"기록 없음"}</small></button>`).join("")}</div>
   <button class="go" id="rcWay" style="align-self:center">${rcNearGate()===co?"🏁 여기서 출발!":`${REALMS[c].n} 출발 문으로 길 안내`}</button>
   <h3>🏆 ${REALMS[c].n} 길 순위</h3>${bd||'<p style="font-size:13px">아직 기록이 없어요. 첫 1등이 되어 보세요!</p>'}`);
  if($("rdGo")) $("rdGo").onclick=()=>{ rdSet(!P.ride); showRace(c); };
  layers.querySelectorAll("[data-rc]").forEach(b=>b.onclick=()=>showRace(+b.dataset.rc));
  $("rcWay").onclick=()=>{ if(rcNearGate()===co){ rcStart(co); return; } setGuide({x:co.S.x,z:co.S.z,label:"🏁 출발 문"}); closeLayer(); }; }
/* ---------- 칭호 ---------- */
TITLES.push({id:"ride1",n:"신수 기수",t:1,h:"짝꿍 신수 타기",g:()=>[G.rideN?1:0,1]},{id:"rc5",n:"바람의 기수",t:2,h:"하늘 고리 경주 5번 완주",g:()=>[G.rcN||0,5]},{id:"rcb",n:"기록 파괴자",t:2,h:"다른 사람 경주 기록 3번 깨기",g:()=>[G.rcBeat||0,3]});
</script>
