<script>
/* ================= v95-2: 🐏 헬리오스의 황금 양 몰이 — 여럿이 둘러싸야 잡히는 양 떼 (IDEAS G11/9-8) =================
   올림포스 「올리브 언덕」에 황금 양 12마리가 풀을 뜯음. 양은 사람이 8m 안에 오면 반대쪽으로 도망치는데,
   한 사람만 쫓으면 옆으로 흩어지고(양마다 흩어지는 쪽이 다름), 여럿이 빙 둘러싸면 가운데로 모여 똑바로 밀림.
   울타리 우리(앞쪽 입구 하나)에 들어간 양은 다시 안 나옴.
   판: 우리 앞 표지판에서 「🐏 양 몰이 시작」 → 2분. 시작한 사람 폰(방장)이 양을 계산해서 0.2초마다 보냄(t:"shp"),
   다른 폰은 그대로 그림. 시작 t:"shs"(먼저 시작한 쪽이 이김), 끝 t:"she". 방장 소식이 4초 넘게 없으면 그 판은 멈춤.
   사람이 3명보다 적으면 쉬고 있는 친구 영웅(모험가 명부의 💤 친구, 없으면 「올림포스 양치기」) 그림자 한 명이 반대쪽에서 도와줌.
   끝났을 때 언덕(70m 안)에 있던 사람 모두: 넣은 양 수만큼 🧶 황금 양털 · 금화 · 경험치. 양털 3개 → ⛓ 쇳조각 4 + ✨ 룬 가루 1(대장간 재료).
   저장: G.fleece · G.shFleeceT · G.shN · G.shBest · G.shPerfect. 칭호 3개. */
const SH_C={x:-150,z:46}, SH_R=40, SH_PEN={x:-150,z:82,hx:5.2,hz:4}, SH_GATE=3, SH_N=12, SH_T=120000, SH_FLEE=9;
const SH={built:false,sheep:[],round:null,host:false,lastMsg:0,sendT:0,helper:null,hMesh:null,hLbl:null,bar:null,lbl:null,cool:0,endT:0,fence:null,vis:false,sync:{}};
function shRand(seed){ let s=seed>>>0||1; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
/* ---------- 모양 ---------- */
function shModel(){ const g=new THREE.Group(); const wool=mat({color:0xffd24a,metalness:.35,roughness:.45,emissive:0x3a2600}), face=mat({color:0x5a4030,roughness:1}), leg=mat({color:0x3a2a20});
  const body=sph(.8,wool,0,1.05,0); body.scale.set(1.5,1.25,1.9); g.add(body); [[-.35,.3],[.35,.3],[0,-.4]].forEach(p=>g.add(sph(.45,wool,p[0],1.55,p[1])));
  const head=new THREE.Group(); head.position.set(0,1.25,1.05); head.add(box(.55,.55,.7,face,0,0,.15)); head.add(sph(.32,wool,0,.32,0)); [-1,1].forEach(s=>{ head.add(box(.35,.12,.18,face,s*.38,.1,0)); head.add(sph(.07,mat({color:0x000000}),s*.17,.08,.5)); }); g.add(head);
  const legs=[]; [[-.38,.5],[.38,.5],[-.38,-.5],[.38,-.5]].forEach(p=>{ const l=box(.18,.6,.18,leg,p[0],.3,p[1]); g.add(l); legs.push(l); });
  g.userData={head,legs}; g.userData.noOutline=true; shadowify(g); return g; }
function shFence(){ const g=new THREE.Group(); const wood=mat({color:0x9a6a3a,roughness:.9}), gold=mat({color:0xffc83a,metalness:.5,roughness:.35,emissive:0x3a2600}); const P0=SH_PEN;
  const y=x=>hAt(x[0],x[1]); const post=(x,z)=>{ const p=box(.3,1.6,.3,wood,x,y([x,z])+.8,z); g.add(p); };
  const rail=(x1,z1,x2,z2)=>{ const len=Math.hypot(x2-x1,z2-z1), mx=(x1+x2)/2, mz=(z1+z2)/2, yy=y([mx,mz]); [.6,1.2].forEach(h=>{ const r=box(len,.14,.12,wood,mx,yy+h,mz); r.rotation.y=-Math.atan2(z2-z1,x2-x1); g.add(r); }); };
  const L=P0.x-P0.hx, R=P0.x+P0.hx, F=P0.z-P0.hz, B=P0.z+P0.hz;
  [[L,F],[L,B],[R,B],[R,F],[P0.x-SH_GATE,F],[P0.x+SH_GATE,F],[L,P0.z],[R,P0.z],[P0.x,B]].forEach(p=>post(p[0],p[1]));
  rail(L,F,L,B); rail(L,B,R,B); rail(R,B,R,F); rail(L,F,P0.x-SH_GATE,F); rail(P0.x+SH_GATE,F,R,F);
  // 입구 금빛 아치 + 표지판
  [-1,1].forEach(s=>g.add(box(.35,3.2,.35,gold,P0.x+s*SH_GATE,y([P0.x,F])+1.6,F))); g.add(box(SH_GATE*2+.4,.35,.35,gold,P0.x,y([P0.x,F])+3.2,F));
  const sx=P0.x+SH_GATE+2.5, sz=F-2; g.add(box(.2,1.4,.2,wood,sx,y([sx,sz])+.7,sz)); const sg=box(1.6,.9,.12,mat({color:0xf3e2b8}),sx,y([sx,sz])+1.5,sz); g.add(sg);
  // 풀밭 바닥 (우리 안)
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(P0.hx*2,P0.hz*2),mat({color:0xc9e07a,roughness:1})); fl.rotation.x=-Math.PI/2; fl.position.set(P0.x,y([P0.x,P0.z])+.06,P0.z); g.add(fl);
  g.userData.noOutline=true; shadowify(g); return g; }
function shBuild(){ if(SH.built) return; SH.built=true; try{ SH.fence=shFence(); scene.add(SH.fence); for(let i=0;i<SH_N;i++){ const m=shModel(); scene.add(m); SH.sheep.push({m,x:0,z:0,tx:0,tz:0,h:0,pen:0,sc:1,scT:0,wT:0,wh:Math.random()*6.28,mv:0,ph:Math.random()*6}); } shScatter(1); }catch(e){ console.warn(e); } }
function shScatter(seed){ const r=shRand(seed||Math.floor(Math.random()*1e9)); SH.sheep.forEach((s,i)=>{ const a=r()*6.283, d=6+r()*22; s.x=s.tx=SH_C.x+Math.cos(a)*d; s.z=s.tz=SH_C.z-4+Math.sin(a)*d*.8; s.pen=0; s.sc=r()<.5?-1:1; s.h=r()*6.28; }); }
/* ---------- 방장 계산 ---------- */
function shPushers(){ const L=[[P.x,P.z]]; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&Math.hypot(o.tx-SH_C.x,o.tz-SH_C.z)<70) L.push([o.tx,o.tz]); } if(SH.helper) L.push([SH.helper.x,SH.helper.z]); return L; }
function shInPen(x,z,m){ return Math.abs(x-SH_PEN.x)<SH_PEN.hx-(m||0)&&Math.abs(z-SH_PEN.z)<SH_PEN.hz-(m||0); }
function shSim(dt){ const pu=shPushers(); const free=SH.sheep.filter(s=>!s.pen); let cx=0,cz=0; free.forEach(s=>{ cx+=s.x; cz+=s.z; }); if(free.length){ cx/=free.length; cz/=free.length; }
  const FV=SH.sheep.map(s=>{ if(s.pen) return null; let fx=0,fz=0; pu.forEach(p=>{ const dx=s.x-p[0], dz=s.z-p[1], d=Math.hypot(dx,dz); if(d<SH_FLEE&&d>.01){ const w=(SH_FLEE-d)/SH_FLEE; fx+=dx/d*w; fz+=dz/d*w; } }); return Math.hypot(fx,fz)>.02?[fx,fz]:null; });
  SH.sheep.forEach((s,i)=>{ let vx=0,vz=0,sp=0;
    if(s.pen){ s.wT-=dt; if(s.wT<=0){ s.wT=rnd(1,3); s.wh=Math.random()*6.28; } vx=Math.cos(s.wh)*.5; vz=Math.sin(s.wh)*.5; }
    else { let fx=0,fz=0,near=0; pu.forEach(p=>{ const dx=s.x-p[0], dz=s.z-p[1], d=Math.hypot(dx,dz); if(d<SH_FLEE&&d>.01){ const w=(SH_FLEE-d)/SH_FLEE; fx+=dx/d*w; fz+=dz/d*w; near++; } });
      const f=Math.hypot(fx,fz); s.scT-=dt; if(s.scT<=0){ s.scT=rnd(1.2,2.6); if(Math.random()<.4) s.sc=-s.sc; }
      if(f>.02){ const nx=fx/f, nz=fz/f; const scat=near===1?.6:near===2?.3:.1;   // 한 사람만 쫓으면 옆으로 흩어짐
        vx=nx+(-nz)*s.sc*scat; vz=nz+nx*s.sc*scat; const vv=Math.hypot(vx,vz)||1; sp=1.8+Math.min(1,f)*4.6; vx=vx/vv*sp; vz=vz/vv*sp;
        if(free.length>1){ vx+=(cx-s.x)*.12; vz+=(cz-s.z)*.12; }
        const gdx=SH_PEN.x-s.x, gdz=SH_PEN.z-s.z, gd=Math.hypot(gdx,gdz); if(gd<12&&s.z<SH_PEN.z-SH_PEN.hz+.5){ vx+=gdx/gd*2.6; vz+=gdz/gd*2.6; } }   // 우리 입구 가까이 오면 열린 우리 안으로 쏙 들어가고 싶어함
      else { let ax=0,az=0,an=0; SH.sheep.forEach((o,j)=>{ const F=FV[j]; if(!F||j===i) return; if(Math.hypot(o.x-s.x,o.z-s.z)<5.5){ const l=Math.hypot(F[0],F[1]); ax+=F[0]/l; az+=F[1]/l; an++; } });   // 옆 양이 놀라 뛰면 같이 뜀(양 떼)
        if(an){ const l=Math.hypot(ax,az)||1; vx=ax/l*3.2; vz=az/l*3.2; s.graze=false; }
        else { s.wT-=dt; if(s.wT<=0){ s.wT=rnd(1.5,4); s.wh=Math.random()*6.28; s.graze=Math.random()<.5; } if(!s.graze){ vx=Math.cos(s.wh)*.7; vz=Math.sin(s.wh)*.7; } const dcx=cx-s.x, dcz=cz-s.z, dd=Math.hypot(dcx,dcz); if(dd>9&&free.length>2){ vx+=dcx/dd*1.4; vz+=dcz/dd*1.4; } } }
      SH.sheep.forEach((o,j)=>{ if(j===i||o.pen) return; const dx=s.x-o.x, dz=s.z-o.z, d=Math.hypot(dx,dz); if(d<1.6&&d>.01){ vx+=dx/d*(1.6-d)*3; vz+=dz/d*(1.6-d)*3; } });
      const dc=Math.hypot(s.x-SH_C.x,s.z-SH_C.z); if(dc>SH_R-4){ const k=(dc-(SH_R-4))*1.2; vx-=(s.x-SH_C.x)/dc*k; vz-=(s.z-SH_C.z)/dc*k; } }
    let nx=s.x+vx*dt, nz=s.z+vz*dt;
    if(s.pen){ nx=clamp(nx,SH_PEN.x-SH_PEN.hx+.9,SH_PEN.x+SH_PEN.hx-.9); nz=clamp(nz,SH_PEN.z-SH_PEN.hz+.9,SH_PEN.z+SH_PEN.hz-.9); }
    else { const inO=Math.abs(nx-SH_PEN.x)<SH_PEN.hx+.6&&Math.abs(nz-SH_PEN.z)<SH_PEN.hz+.6;
      if(inO){ const front=s.z<SH_PEN.z-SH_PEN.hz+.2&&Math.abs(s.x-SH_PEN.x)<SH_GATE-.5; if(SH.round&&(front||shInPen(s.x,s.z,0))){ if(shInPen(nx,nz,.8)) shPenned(i,true); } else { const ox=Math.abs(nx-SH_PEN.x)<SH_PEN.hx+.6&&Math.abs(s.z-SH_PEN.z)<SH_PEN.hz+.6; if(!ox) nz=s.z; else if(!(Math.abs(s.x-SH_PEN.x)<SH_PEN.hx+.6&&Math.abs(nz-SH_PEN.z)<SH_PEN.hz+.6)) nx=s.x; else { nx=s.x; nz=s.z; } } } }
    s.mv=Math.hypot(nx-s.x,nz-s.z)/Math.max(dt,.001); if(s.mv>.1) s.h=Math.atan2(nx-s.x,nz-s.z); s.x=nx; s.z=nz; s.tx=nx; s.tz=nz; });
  // 그림자 도우미: 우리 반대쪽에서 양 떼를 밀어 줌
  const h=SH.helper; if(h&&free.length){ const gx=SH_PEN.x, gz=SH_PEN.z-SH_PEN.hz; let ax=cx-gx, az=cz-gz; const al=Math.hypot(ax,az)||1; ax/=al; az/=al; let mx=-1e9, lo=1e9, hi=-1e9;
    free.forEach(q=>{ const pr=(q.x-gx)*ax+(q.z-gz)*az, lt=-(q.x-gx)*az+(q.z-gz)*ax; if(pr>mx) mx=pr; lo=Math.min(lo,lt); hi=Math.max(hi,lt); });
    const lt=(lo+hi)/2+Math.sin(Date.now()/1600)*Math.max(2,(hi-lo)/2), pr=mx+3.5; const tx=gx+ax*pr-az*lt, tz=gz+az*pr+ax*lt;
    const dx=tx-h.x, dz=tz-h.z, d=Math.hypot(dx,dz); const v=Math.min(d,7*dt); if(d>.05){ h.x+=dx/d*v; h.z+=dz/d*v; h.f=Math.atan2(dx,dz); h.mv=1; } else h.mv=0; } }
function shPenned(i,mine){ const s=SH.sheep[i]; if(!s||s.pen) return; s.pen=1; if(SH.round) SH.round.n=SH.sheep.filter(q=>q.pen).length; fxSpark(s.x,1.5,s.z,0xffe08a,16); fxRing(s.x,s.z,0xffe08a,3,.4); tone(880,.1,"triangle"); tone(1175,.12,"triangle",.08);
  if(SH.vis&&!layerOpen) floatDmg(s.x,2.6,s.z,`🐏 ${SH.round?SH.round.n:""}/${SH_N}`,"gain");
  if(SH.host&&SH.round&&SH.round.n>=SH_N) shEnd(); }
/* ---------- 판 ---------- */
function shCanStart(){ return !SH.round&&Date.now()>SH.cool&&Math.hypot(P.x-(SH_PEN.x+SH_GATE+2.5),P.z-(SH_PEN.z-SH_PEN.hz-2))<9; }
function shPickHelper(){ const L=[]; try{ for(const id in ROSTER){ const p=ROSTER[id]; if(p&&p.n&&isAway(p)) L.push(p); } }catch(e){} const p=L.length?L[Math.floor(Math.random()*L.length)]:null;
  return p?{n:p.n,r:p.r,k:p.k||0,lk:p.lk}:{n:"올림포스 양치기",r:3,k:0,lk:null}; }
function shStart(){ if(!shCanStart()) return; const seed=Math.floor(Math.random()*1e9), t0=Date.now(); const ppl=1+Object.values(PEERS).filter(o=>Math.hypot(o.tx-SH_C.x,o.tz-SH_C.z)<70).length;
  const hp=ppl<3?shPickHelper():null; shBegin({h:G.id,t0,seed,hp},true); try{ net.send({t:"shs",t0,seed,hp}); }catch(e){} }
function shBegin(d,mine){ SH.round={h:d.h,t0:d.t0,n:0,seed:d.seed}; SH.host=!!mine; SH.lastMsg=Date.now(); shBuild(); shScatter(d.seed); shHelper(d.hp);
  if(Math.hypot(P.x-SH_C.x,P.z-SH_C.z)<120&&!layerOpen){ toast("🐏 황금 양 몰이 시작!","여럿이 빙 둘러싸고 천천히 밀어서 우리에 넣어요 · 2분",3); jingle([392,523,659,784]); } }
function shHelper(hp){ if(SH.hMesh){ scene.remove(SH.hMesh); SH.hMesh=null; } SH.helper=null; if(!hp) return;
  const a=Math.random()*6.28; SH.helper={x:SH_C.x+Math.cos(a)*18,z:SH_C.z+Math.sin(a)*18,f:0,mv:0,n:hp.n};
  try{ SH.hMesh=makeAvatar(hp.r|0,hp.k|0,false,typeof ghostLook==="function"?ghostLook(hp.lk):{}); SH.hMesh.traverse(o=>{ if(o.material&&!o.material._shc){ o.material=o.material.clone(); o.material._shc=1; o.material.transparent=true; o.material.opacity=.6; } }); scene.add(SH.hMesh); }catch(e){ console.warn(e); SH.hMesh=null; } }
function shEnd(){ if(!SH.round) return; const n=SH.sheep.filter(q=>q.pen).length; if(SH.host) try{ net.send({t:"she",t0:SH.round.t0,n}); }catch(e){} shFinish(n); }
function shFinish(n){ SH.round=null; SH.host=false; SH.cool=Date.now()+15000; SH.endT=Date.now(); if(SH.hMesh){ scene.remove(SH.hMesh); SH.hMesh=null; } SH.helper=null;
  if(Math.hypot(P.x-SH_C.x,P.z-SH_C.z)<70) shPay(n); setTimeout(()=>{ if(!SH.round){ SH.sheep.forEach(s=>{ if(s.pen) fxSpark(s.x,1.5,s.z,0xffffff,8); }); shScatter(); } },6000); }
function shPay(n){ G.shN=(G.shN||0)+1; G.shBest=Math.max(G.shBest||0,n); if(n>=SH_N) G.shPerfect=(G.shPerfect||0)+1;
  if(n<=0){ saveGame(); toast("🐏 양이 한 마리도 안 들어갔어요","다음엔 여럿이 빙 둘러싸 봐요!",2.6); return; }
  const L=G.lv, gold=Math.round(n*(30+L*4)), xp=Math.round(xpNeed(L)*.012*n); G.fleece=(G.fleece||0)+n; G.shFleeceT=(G.shFleeceT||0)+n; G.gold+=gold; gainXp(xp); saveGame();
  try{ COINFLY.burst(P.x,1.6,P.z,8); }catch(e){} jingle([523,659,784,1046]); buzz([20,20,40]);
  const top=n>=SH_N?"🐏 완벽한 양 떼!":"🐏 양 몰이 끝!"; const sub=`🧶 황금 양털 +${n} · 금화 +${fmt(gold)} · 경험치 +${fmt(xp)}`;
  try{ lvBanner(top,`우리에 ${n}/${SH_N}마리`,sub,"#ffd24a"); }catch(e){ toast(top,sub,3); } }
NETR.shs=(o,d)=>{ if(SH.round&&(SH.round.t0<d.t0||(SH.round.t0===d.t0&&SH.round.h<o.id))) return; shBegin({h:o.id,t0:d.t0,seed:d.seed,hp:d.hp},false); };
NETR.shp=(o,d)=>{ if(!SH.round||SH.round.h!==o.id||SH.host) { if(!SH.round&&Array.isArray(d.p)&&Math.hypot(P.x-SH_C.x,P.z-SH_C.z)<120){ shBegin({h:o.id,t0:d.t0,seed:1,hp:null},false); } else return; }
  SH.lastMsg=Date.now(); const p=d.p||[]; SH.sheep.forEach((s,i)=>{ if(p[i*3]==null) return; s.tx=p[i*3]/10; s.tz=p[i*3+1]/10; if(p[i*3+2]&&!s.pen) shPenned(i,false); });
  if(d.hx!=null){ if(!SH.helper){ shHelper({n:d.hn||"그림자 친구",r:d.hr|0,k:0,lk:null}); } if(SH.helper){ SH.helper.tx=d.hx/10; SH.helper.tz=d.hz/10; } } };
NETR.she=(o,d)=>{ if(!SH.round||SH.round.h!==o.id) return; shFinish(d.n|0); };
/* ---------- 매 프레임 ---------- */
function shTick(dt){ if(!started||G.realm<0) return; const dist=Math.hypot(P.x-SH_C.x,P.z-SH_C.z); SH.vis=dist<150;
  if(!SH.vis&&!SH.round){ if(SH.built) SH.sheep.forEach(s=>s.m.visible=false); if(SH.fence) SH.fence.visible=false; shUi(dist); return; }
  shBuild(); if(SH.fence) SH.fence.visible=SH.vis;
  const R=SH.round; if(R){ const left=SH_T-(Date.now()-R.t0);
    if(SH.host){ shSim(dt); if(left<=0) shEnd(); else { SH.sendT-=dt; if(SH.sendT<=0){ SH.sendT=.2; const p=[]; SH.sheep.forEach(s=>p.push(Math.round(s.x*10),Math.round(s.z*10),s.pen?1:0)); const m={t:"shp",t0:R.t0,p}; if(SH.helper){ m.hx=Math.round(SH.helper.x*10); m.hz=Math.round(SH.helper.z*10); m.hn=SH.helper.n; } try{ net.send(m); }catch(e){} } } }
    else { if(Date.now()-SH.lastMsg>4000){ SH.round=null; SH.cool=Date.now()+3000; if(SH.hMesh){ scene.remove(SH.hMesh); SH.hMesh=null; } SH.helper=null; if(SH.vis&&!layerOpen) toast("🐏 양 몰이가 멈췄어요","시작한 사람이 떠났어요 · 표지판에서 다시 시작해요",2.4); }
      SH.sheep.forEach(s=>{ const dx=s.tx-s.x, dz=s.tz-s.z; const d=Math.hypot(dx,dz); if(d>12){ s.x=s.tx; s.z=s.tz; } else { s.x+=dx*Math.min(1,dt*8); s.z+=dz*Math.min(1,dt*8); } s.mv=d*6; if(d>.03) s.h=Math.atan2(dx,dz); });
      if(SH.helper&&SH.helper.tx!=null){ const h=SH.helper, dx=h.tx-h.x, dz=h.tz-h.z, d=Math.hypot(dx,dz); h.x+=dx*Math.min(1,dt*8); h.z+=dz*Math.min(1,dt*8); h.mv=d>.05?1:0; if(d>.05) h.f=Math.atan2(dx,dz); } } }
  else shSim(dt);   // 판이 없을 때는 각자 폰에서 풀 뜯으며 도망 다님
  const tn=performance.now()/1000;
  SH.sheep.forEach(s=>{ const m=s.m; m.visible=SH.vis; if(!SH.vis) return; const mv=Math.min(1,s.mv/3); s.ph+=SH.vis?(.04+mv*.5):0; m.position.set(s.x,hAt(s.x,s.z)+Math.abs(Math.sin(s.ph))*.18*mv,s.z);
    let dr=s.h-m.rotation.y; while(dr>Math.PI) dr-=6.283; while(dr<-Math.PI) dr+=6.283; m.rotation.y+=dr*Math.min(1,dt*8);
    const u=m.userData; u.head.rotation.x=mv<.1&&!s.pen?.5+Math.sin(tn*3+s.ph)*.15:0; u.legs.forEach((l,k)=>l.rotation.x=Math.sin(s.ph*2+(k%2?Math.PI:0)+(k>1?Math.PI:0))*.7*mv); });
  if(SH.hMesh&&SH.helper){ const h=SH.helper; SH.hMesh.position.set(h.x,hAt(h.x,h.z),h.z); SH.hMesh.rotation.y=h.f||0; const u=SH.hMesh.userData; if(u&&u.legL){ const sw=h.mv?Math.sin(tn*9)*.7:0; u.legL.rotation.x=sw; u.legR.rotation.x=-sw; } }
  shUi(dist); }
XTICK.push(shTick);
CTX_EXTRA.push(()=>shCanStart()?{t:"🐏 양 몰이 시작",f:shStart}:null);
function shUi(dist){ if(!SH.lbl) SH.lbl=makeLabel(""); if(!SH.hLbl) SH.hLbl=makeLabel("ally");
  const sx=SH_PEN.x+SH_GATE+2.5, sz=SH_PEN.z-SH_PEN.hz-2;
  if(SH.vis&&!layerOpen&&dist<60&&!SH.round) placeLabel(SH.lbl,sx,2.8,sz,`<em style="color:#ffd24a">🐏 황금 양 우리</em> <b>${Date.now()<SH.cool?"잠깐 쉬는 중":"표지판 앞에서 시작!"}</b>`); else SH.lbl.style.display="none";
  if(SH.helper&&SH.vis&&!layerOpen) placeLabel(SH.hLbl,SH.helper.x,3.4,SH.helper.z,`💤 ${SH.helper.n}의 그림자`); else SH.hLbl.style.display="none";
  if(!SH.bar){ const b=document.createElement("div"); b.id="shBar"; b.hidden=true; document.body.appendChild(b); SH.bar=b; } const b=SH.bar;
  const show=!!SH.round&&dist<90&&!layerOpen&&started; if(!show){ if(!b.hidden) b.hidden=true; return; } b.hidden=false;
  let bot=0; ["warbar","bossbar","evbar","giBar"].forEach(id=>{ const el=$(id); if(el&&!el.hidden){ const r=el.getBoundingClientRect(); if(r.height>0) bot=Math.max(bot,r.bottom); } }); const top=bot>0?Math.round(bot+6)+"px":""; if(b._t!==top){ b._t=top; b.style.top=top; }
  const n=SH.sheep.filter(q=>q.pen).length, left=Math.max(0,Math.ceil((SH_T-(Date.now()-SH.round.t0))/1000));
  const h=`<b>🐏 황금 양 몰이 · 우리 ${n}/${SH_N}</b><span>⏱ ${Math.floor(left/60)}:${String(left%60).padStart(2,"0")} · 혼자 쫓으면 흩어져요 — 빙 둘러싸요!</span>`; if(b._h!==h){ b._h=h; b.innerHTML=h; } }
/* ---------- 지도 · 창 ---------- */
MAP_X.push((ctx,tx,tz,big,u)=>{ mapPin(ctx,tx(SH_PEN.x),tz(SH_PEN.z),(big?6:7.5)*u,"#c8a030","🐏"); });
function showSheep(){ const can=(G.fleece||0)>=3;
  card(`<h2>🐏 헬리오스의 황금 양 몰이</h2><p>올림포스 <b>올리브 언덕</b>에 황금 양 12마리가 살아요. 양은 사람이 다가오면 반대쪽으로 도망치고, <b>한 사람만 쫓으면 옆으로 흩어져요.</b> 여럿이 빙 둘러싸고 천천히 밀어서 2분 안에 우리에 넣어요!</p>
   <div class="idlegrid"><div><b>${SH.round?`${SH.sheep.filter(q=>q.pen).length}/${SH_N}`:"🌿"}</b><span>${SH.round?"지금 몰이 중":"풀 뜯는 중"}</span></div><div><b>${G.fleece||0}</b><span>🧶 황금 양털</span></div><div><b>${G.shBest||0}</b><span>최고 기록</span></div><div><b>${G.shN||0}</b><span>참여한 판</span></div></div>
   <h3>🎮 이렇게 놀아요</h3><div class="diary"><p>🪧 우리 앞 표지판에서 「🐏 양 몰이 시작」을 눌러요(근처 사람 모두 함께).</p><p>👥 양 떼 뒤쪽(우리 반대편)에서 여럿이 반달 모양으로 서서 천천히 밀어요.</p><p>💤 사람이 3명보다 적으면 쉬고 있는 친구 영웅의 그림자가 도와줘요.</p><p>🧶 넣은 양 수만큼 끝날 때 언덕에 있던 사람 모두 황금 양털 · 금화 · 경험치!</p></div>
   <h3>🔨 양털 바꾸기</h3><p style="font-size:13px">🧶 황금 양털 3개 → ⛓ 쇳조각 4 + ✨ 룬 가루 1 (대장간 재료)</p>
   <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="buy" id="shEx" type="button" ${can?"":"disabled"}>🧶×3 바꾸기</button><button class="go" id="shGo" type="button">🧭 양 우리로 길 안내</button></div>`);
  $("shEx").onclick=()=>{ if((G.fleece||0)<3) return; G.fleece-=3; G.ore=(G.ore||0)+4; G.rune=(G.rune||0)+1; saveGame(); jingle([659,880]); toast("🔨 바꿨어요!","⛓ +4 · ✨ +1",1.6); showSheep(); };
  $("shGo").onclick=()=>{ closeLayer(); setGuide({x:SH_PEN.x+SH_GATE+2.5,z:SH_PEN.z-SH_PEN.hz-4,label:"🐏 황금 양 우리"}); }; }
MENU_X.push({ic:"🐏",n:"황금 양 몰이",id:"shBtn",sub:()=>SH.round?`🐏 지금 몰이 중 ${SH.sheep.filter(q=>q.pen).length}/${SH_N}`:`올리브 언덕 · 🧶 ${G.fleece||0}`,f:showSheep});
TITLES.push({id:"sh6",n:"양치기",t:1,h:"양 몰이 한 판에 6마리 넣기",g:()=>[G.shBest||0,6]},{id:"sh12",n:"완벽한 양 떼",t:3,h:"12마리 모두 우리에 넣기",g:()=>[G.shPerfect||0,1]},{id:"shf30",n:"황금 양털 수집가",t:2,h:"황금 양털 30개 모으기",g:()=>[G.shFleeceT||0,30]});
</script>
<style>
#shBar{position:fixed;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);z-index:5;pointer-events:none;min-width:240px;max-width:min(56vw,460px);padding:5px 14px 7px;border-radius:14px;background:linear-gradient(180deg,rgba(60,44,10,.88),rgba(30,24,14,.88));border:2px solid #ffd24a;box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 14px rgba(255,210,80,.4);color:#fff;text-align:center;display:flex;flex-direction:column;gap:1px}
#shBar[hidden]{display:none} #shBar b{font-size:14px;color:#fff1b0;text-shadow:0 2px 0 #000} #shBar span{font-size:12px;opacity:.92}
</style>
