<script>
/* ================= v19-3: 🌀 매일 바뀌는 파티 던전 「신들의 미궁」 (IDEAS G11/3-3) =================
   지도 밖(x≈700)에 5층 미궁. 날짜(한국 시간)로 층 순서·괴물·함정·미궁 왕이 정해져서 모든 폰이 같은 미궁.
   1층 괴물의 방 → 2~4층(굴러오는 바위 · 불기둥 · 미끄러운 얼음 중 2개 + 두 발판의 문) → 5층 미궁 왕.
   두 발판의 문: 발판 두 개가 동시에 켜져야 열림(친구와 함께면 쉬움 · 혼자면 6초 안에 뛰어가기).
   미궁 왕은 친구가 준 데미지도 내 화면 보스에 깎임(t:"dgh"). 깬 시간은 중계 서버에 보관 → 오늘의 기록판. */
const DGX=700, DG_W=44, DG_D=72;
const DG_THEME=[{floor:0x6e6248,wall:0x9a8a66,glow:0xffd060},{floor:0x3e4a5a,wall:0x5f7084,glow:0x7fd0ff},{floor:0x5a3428,wall:0x84563a,glow:0xff9030},{floor:0x4c4c5a,wall:0x8a8a9a,glow:0x8fd8ff}];
const DG_ROOM={mobs:{n:"괴물의 방",ic:"⚔",h:"괴물을 모두 물리치면 포털이 열려요"},boulder:{n:"굴러오는 바위의 방",ic:"🪨",h:"빨간 줄이 보이면 바위가 굴러와요 · 점프로 넘거나 피해요"},fire:{n:"불기둥의 방",ic:"🔥",h:"바닥 구멍이 주황색으로 빛나면 불기둥이 솟아요"},ice:{n:"미끄러운 얼음의 방",ic:"🧊",h:"얼음 바닥이라 쭉쭉 미끄러져요"},plates:{n:"두 발판의 문",ic:"🤝",h:"양쪽 발판을 동시에 밟아야 문이 열려요"},boss:{n:"미궁 왕의 방",ic:"👑",h:"빨간 고리가 보이면 멀리 피하거나 높이 점프!"}};
function dgDay(){ const d=new Date(Date.now()+9*3600000); return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate(); }
function dgRng(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function dgPlan(day){ const r=dgRng(day*7919+13); const sh=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const tr=sh(["boulder","fire","ice"]); const mid=sh([tr[0],tr[1],"plates"]); const floors=["mobs"].concat(mid,["boss"]).map(k=>({k,realm:Math.floor(r()*4)}));
  const pool=[]; REALMS.forEach((R,i)=>{ pool.push(Object.assign({},R.boss,{realm:i})); pool.push(Object.assign({},R.worldBoss,{realm:i})); }); const boss=pool[Math.floor(r()*pool.length)]; floors[4].realm=boss.realm; return {day,floors,boss}; }
const DG={on:false,f:0,plan:null,grp:null,t0:0,party:{},torches:[],trap:null,gate:null,plates:null,portal:null,doors:null,doorCd:0,lx:0,lz:0,vx:0,vz:0,ft:0,fx:[]};
const DGR={};   // 오늘의 기록 (중계 서버)
function dgZ(f){ return -f*140; }
function dgIn(x){ return x>DGX-150; }
// 미궁 안은 평평한 바닥
const _hAt0=hAt; hAt=function(x,z){ return x>DGX-150?0:_hAt0(x,z); };
function dgMsg(d){ if(!d||!d.i||!d.day) return; const o=DGR[d.i]; if(o&&o.day===d.day&&o.t<=d.t) return; DGR[d.i]=d; }
function fmtSec(t){ t=Math.round(t); const m=Math.floor(t/60), s=t%60; return m>0?`${m}분 ${s}초`:`${s}초`; }
let DGTEX=null;
function dgTex(){ if(DGTEX) return DGTEX; const c=document.createElement("canvas"); c.width=c.height=128; const g=c.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0,0,128,128);
  for(let i=0;i<2;i++) for(let j=0;j<2;j++){ const v=225+Math.floor(Math.random()*30); g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(i*64+2,j*64+2,60,60); }
  g.strokeStyle="rgba(0,0,0,.35)"; g.lineWidth=3; for(let k=0;k<=128;k+=64){ g.beginPath(); g.moveTo(k,0); g.lineTo(k,128); g.stroke(); g.beginPath(); g.moveTo(0,k); g.lineTo(128,k); g.stroke(); }
  DGTEX=new THREE.CanvasTexture(c); DGTEX.wrapS=DGTEX.wrapT=THREE.RepeatWrapping; DGTEX.repeat.set((DG_W+8)/6,(DG_D+8)/6); return DGTEX; }
function dgClear3D(){ if(DG.grp){ scene.remove(DG.grp); DG.grp=null; } DG.torches=[]; DG.trap=null; DG.gate=null; DG.plates=null; DG.portal=null; DG.fx.forEach(o=>scene.remove(o.mesh)); DG.fx=[];
  for(let i=mobs.length-1;i>=0;i--){ if(mobs[i].dg) removeMob(mobs[i]); } }
function dgSpawn(def,lv,boss,x,z,scale){ const st=mobStats(lv,boss); const mesh=(typeof mobGL==="function"&&mobGL(def.n,scale))||makeMob(def.shape,def.c,scale);
  const m={n:def.n,shape:def.shape,mesh,x,z,hx:x,hz:z,lv,boss:!!boss,world:false,hp:st.mhp,mhp:st.mhp,atk:st.atk,xp:st.xp,gold:st.gold,rg:DG.rg,cd:1,state:"idle",t:rnd(0,2),lbl:makeLabel(boss?"boss":""),rot:Math.PI,hit:0,scale,power:boss?(def.p||0):0,dg:true,slamT:4,warn:0};
  if(boss){ m.hp=m.mhp=Math.round(st.mhp*1.5); m.atk=st.atk*.85; m.dgBoss=true; const aura=new THREE.Mesh(new THREE.RingGeometry(1.6,2.4,40),glowMat(0xb08cff,.7)); aura.rotation.x=-Math.PI/2; aura.position.y=.1; mesh.add(aura); m.aura=aura; }
  mesh.position.set(x,0,z); mesh.rotation.y=Math.PI; scene.add(mesh); mobs.push(m); return m; }
function dgBuild(f){ dgClear3D(); const F=DG.plan.floors[f]; const T=DG_THEME[F.realm]; const g=new THREE.Group(); const cx=DGX, cz=dgZ(f), W=DG_W, D=DG_D, hi=HIGH();
  const ice=F.k==="ice"; const fm=mat({color:ice?0xd6f0ff:T.floor,map:dgTex(),roughness:ice?.12:.85,metalness:ice?.35:.05}); const fl=box(W+8,1,D+8,fm,cx,-.5,cz); fl.receiveShadow=hi; g.add(fl);
  const wm=mat({color:T.wall,roughness:.9}), dk=mat({color:new THREE.Color(T.wall).multiplyScalar(.6),roughness:.9});
  [[2,9,D+4,cx-W/2-1,4.5,cz],[2,9,D+4,cx+W/2+1,4.5,cz],[W+4,9,2,cx,4.5,cz-D/2-1]].forEach(a=>{ const w=box(a[0],a[1],a[2],wm,a[3],a[4],a[5]); w.castShadow=hi; w.receiveShadow=hi; g.add(w); });
  g.add(box(W+4,1.2,2,dk,cx,.6,cz+D/2+1));   // 남쪽은 낮게 (카메라가 가리지 않게)
  g.add(box(W+4,.6,.6,mat({color:T.glow,emissive:T.glow,emissiveIntensity:.6}),cx,9.1,cz-D/2));
  const torchM=new THREE.MeshBasicMaterial({color:T.glow});
  for(let z=cz-D/2+6;z<cz+D/2-2;z+=12){ [-1,1].forEach(s=>{ const p=cyl(1,1.25,10,dk,cx+s*(W/2-.4),5,z,10); p.castShadow=hi; g.add(p); g.add(box(.5,.5,.9,dk,cx+s*(W/2-1.2),4.6,z)); g.add(sph(.32,torchM,cx+s*(W/2-1.5),5.2,z)); const gl=sph(.55,glowMat(T.glow,.45),cx+s*(W/2-1.6),5.2,z); gl.userData.noOutline=true; g.add(gl); DG.torches.push(gl); }); }
  // 출구 포털(북쪽)
  const pz=cz-D/2+6.5; const pg=new THREE.Group(); pg.position.set(cx,0,pz); const arch=mat({color:T.wall,roughness:.7}); pg.add(cyl(.7,.8,8,arch,-4.2,4,0,10)); pg.add(cyl(.7,.8,8,arch,4.2,4,0,10)); pg.add(box(10.4,1.2,1.6,arch,0,8.4,0));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.3,.35,10,40),glowMat(0x9a7aff,.25)); ring.position.y=3.8; pg.add(ring); const disc=new THREE.Mesh(new THREE.CircleGeometry(3.2,40),glowMat(0x6a4aff,.0)); disc.position.y=3.8; pg.add(disc);
  const pad=new THREE.Mesh(new THREE.RingGeometry(2,3,40),glowMat(0x9a7aff,.25)); pad.rotation.x=-Math.PI/2; pad.position.set(0,.06,2.2); pg.add(pad); g.add(pg); DG.portal={x:cx,z:pz+2.2,ring,disc,pad,on:false};
  // 입구 표시(남쪽)
  const st=new THREE.Mesh(new THREE.RingGeometry(1.6,2.2,32),glowMat(0xffffff,.35)); st.rotation.x=-Math.PI/2; st.position.set(cx,.06,cz+D/2-5); g.add(st);
  // 함정
  if(F.k==="fire"){ const vents=[]; let i=0; for(let z=cz-D/2+16;z<=cz+D/2-14;z+=11) for(const x of [cx-13,cx,cx+13]){ const ox=x+((i%2)?3:-3); const base=new THREE.Mesh(new THREE.CircleGeometry(1.7,24),mat({color:0x2a1a14,roughness:1})); base.rotation.x=-Math.PI/2; base.position.set(ox,.03,z); g.add(base);
      const warn=new THREE.Mesh(new THREE.RingGeometry(1.5,2.1,32),glowMat(0xff7a20,0)); warn.rotation.x=-Math.PI/2; warn.position.set(ox,.07,z); g.add(warn);
      const fire=cyl(1.1,1.7,8,glowMat(0xff5a10,.5),ox,4,z,14); fire.visible=false; fire.userData.noOutline=true; g.add(fire); const core=cyl(.45,.8,8.4,glowMat(0xffb040,.45),ox,4.2,z,10); core.visible=false; core.userData.noOutline=true; g.add(core);
      vents.push({x:ox,z,warn,fire,core,ph:(i*1.37)%4.2}); i++; } DG.trap={k:"fire",vents,hitT:0}; }
  if(F.k==="boulder"){ DG.trap={k:"boulder",t:2,list:[]}; }
  if(F.k==="ice"){ for(let k=0;k<10;k++){ const ic=new THREE.Mesh(GEO.cone,mat({color:0xe8f7ff,roughness:.2,metalness:.2,transparent:true,opacity:.85})); ic.scale.set(1.4,rnd(2.5,4.5),1.4); const s=k%2?1:-1; ic.position.set(cx+s*(W/2-3),ic.scale.y/2,cz-D/2+8+k*6.5); g.add(ic); } DG.vx=DG.vz=0; }
  if(F.k==="plates"){ const gz=cz-D/2+15; const bars=new THREE.Group(); const iron=mat({color:0x4a4a58,metalness:.7,roughness:.35}); for(let x=-W/2+1;x<=W/2-1;x+=2.4) bars.add(cyl(.28,.28,8,iron,cx+x,4,gz,8)); bars.add(box(W,.8,.8,iron,cx,7.6,gz)); bars.add(box(W,.6,.6,iron,cx,2.2,gz)); g.add(bars);
    const pl=[-1,1].map(s=>{ const x=cx+s*(W/2-4), z=cz+4; const base=cyl(2.4,2.6,.4,mat({color:0x3a3348,roughness:.6}),x,.2,z,24); g.add(base); const top=cyl(2,2,.25,mat({color:0x6a5a8a,emissive:0x000000,roughness:.4}),x,.45,z,24); g.add(top);
      const glow=new THREE.Mesh(new THREE.RingGeometry(2.3,3.1,32),glowMat(0x7affb0,0)); glow.rotation.x=-Math.PI/2; glow.position.set(x,.08,z); g.add(glow); const beam=cyl(.25,.25,14,glowMat(0x7affb0,0),x,7,z,8); beam.userData.noOutline=true; g.add(beam); return {x,z,top,glow,beam,lit:0,press:false}; });
    DG.plates=pl; DG.gate={z:gz,bars,open:false,y:0}; }
  scene.add(g); DG.grp=g;
  // 괴물
  const R=REALMS[F.realm]; const lv=clamp(G.lv+f,1,60);
  if(F.k==="boss"){ const B=DG.plan.boss; dgSpawn(B,clamp(G.lv+4,1,60),true,cx,cz-10,2.4); for(let k=0;k<2;k++) dgSpawn(pick(R.mobs),lv,false,cx+(k?-9:9),cz-4,1); }
  else { const n=F.k==="mobs"?6:5; const zTop=F.k==="plates"?cz-D/2+22:cz-D/2+10; for(let k=0;k<n;k++){ const x=cx+rnd(-W/2+5,W/2-5), z=rnd(zTop,cz+D/2-24); dgSpawn(pick(R.mobs),lv,false,x,z,rnd(.9,1.15)); } } }
function dgEnter(){ if(DG.on) return; if(P.dead) return; if(mobs.some(m=>m.state==="chase"&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 들어갈 수 없어요"); return; } if(P.trial){ toast("승급 시험 중이에요"); return; }
  closeLayer(); DG.plan=dgPlan(dgDay()); DG.on=true; DG.t0=Date.now(); DG.party={}; DG.rg=idleRegion(G.lv,G.realm).id; P.guide=null; $("guide").hidden=true; dgFloor(0); }
function dgFloor(f){ DG.f=f; dgBuild(f); const cz=dgZ(f); P.x=DGX; P.z=cz+DG_D/2-5; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul,1.5); DG.lx=P.x; DG.lz=P.z; DG.vx=DG.vz=0; P.guide=null; $("guide").hidden=true;
  const F=DG.plan.floors[f], Rm=DG_ROOM[F.k]; try{ lvBanner(`신들의 미궁 ${f+1}층`,Rm.ic+" "+Rm.n,Rm.h+(F.k==="boss"?` · ${DG.plan.boss.n}`:""),hexCss(DG_THEME[F.realm].glow)); }catch(e){ toast(`미궁 ${f+1}층 · ${Rm.n}`,Rm.h,3); }
  fxRing(P.x,P.z,0x9a7aff,8,.8); fxSpark(P.x,2,P.z,0x9a7aff,30); jingle(f===4?[392,330,262,196]:[392,523,659]); if(f===4){ tone(70,.8,"sawtooth",0,.2); buzz([80,40,80]); } }
function dgExit(silent){ if(!DG.on) return; DG.on=false; dgClear3D(); P.guide=null; $("guide").hidden=true; if(!silent) toast("미궁에서 나왔어요","내일은 또 다른 미궁이 열려요",2.2); }
// 집으로 순간이동·부활하면 미궁에서 나옴
const _spawnHome0=spawnAtHome; spawnAtHome=function(){ if(DG.on) dgExit(); if(P.bag&&dgIn(P.bag.x)){ G.gold+=P.bag.gold; scene.remove(P.bag.mesh); P.bag=null; } _spawnHome0(); };
// 미궁 왕에게 준 데미지는 친구 화면 보스에도 깎이게
const _damageMob0=damageMob; damageMob=function(m,dmg,crit){ const h0=m.hp; _damageMob0(m,dmg,crit); if(m.dgBoss&&h0>0){ const d=Math.round(h0-Math.max(0,m.hp)); if(d>0) try{ net.send({t:"dgh",d,day:DG.plan.day}); }catch(e){} } };
function dgRecv(o,d){ if(!DG.on||DG.f!==4||!DG.plan||d.day!==DG.plan.day) return; const b=mobs.find(m=>m.dgBoss); if(!b||b.hp<=0) return; const dmg=Math.min(d.d|0,b.mhp); if(dmg<=0) return; b.hp-=dmg; b.hit=.12; floatDmg(b.x+rnd(-1.5,1.5),3*b.scale,b.z,"-"+fmt(dmg),""); if(b.hp<=0){ b.hp=0; killMob(b); toast(`${o.name}와(과) 함께 미궁 왕을 쓰러뜨렸어요!`,null,2.4); } }
function dgClampP(){ if(Math.abs(P.x-DGX)>150){ dgExit(true); return false; } const cz=dgZ(DG.f); P.x=clamp(P.x,DGX-DG_W/2+1.3,DGX+DG_W/2-1.3); let zmin=cz-DG_D/2+1.6; if(DG.gate&&!DG.gate.open) zmin=DG.gate.z+1.5; P.z=clamp(P.z,zmin,cz+DG_D/2-1.3); return true; }
function dgPeersHere(){ const L=[]; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&dgIn(o.x)&&Math.abs(o.z-dgZ(DG.f))<DG_D/2+4) L.push(o); } return L; }
function dgTickMobs(dt){ const st=stat(), cz=dgZ(DG.f), tnow=performance.now(); const list=mobs.filter(m=>m.dg);
  list.forEach(m=>{ const dx=P.x-m.x, dz=P.z-m.z, d=Math.hypot(dx,dz); m.hit=Math.max(0,m.hit-dt); m.cd-=dt; m.t-=dt; const spd=m.boss?3.8:m.shape==="wolf"?5:3.7; const reach=m.boss?2.6+m.scale*.9:2.3;
    if(!P.dead&&d<(m.boss?44:22)){ m.state="chase"; if(d>reach&&m.warn<=0){ m.x+=dx/d*spd*dt; m.z+=dz/d*spd*dt; } m.rot=Math.atan2(dx,dz); if(d<=reach&&m.cd<=0&&m.warn<=0){ m.cd=m.boss?1.7:1.3; hurtPlayer(m.atk*(1-dmgReduce(st.def)),m.n); m.mesh.userData.lunge=.25; if(m.mesh.userData.gl) animState(m.mesh,"attack"); } }
    else { m.state="idle"; if(m.t<=0){ m.t=rnd(1.5,4); m.wx=m.hx+rnd(-5,5); m.wz=m.hz+rnd(-5,5); } if(m.wx!=null){ const wx=m.wx-m.x, wz=m.wz-m.z, wd=Math.hypot(wx,wz); if(wd>.5){ m.x+=wx/wd*1.4*dt; m.z+=wz/wd*1.4*dt; m.rot=Math.atan2(wx,wz); } } }
    // 미궁 왕: 쿵! 내려찍기 (1.1초 전에 빨간 고리)
    if(m.boss&&!P.dead&&m.state==="chase"){ m.slamT-=dt; if(m.slamT<=0&&m.warn<=0&&d<18){ m.warn=1.1; fxRing(m.x,m.z,0xff3030,18,1.1); tone(70,.5,"sawtooth",0,.12); }
      if(m.warn>0){ m.warn-=dt; if(m.warn<=0){ m.slamT=rnd(4,6); fxRing(m.x,m.z,0xffb070,20,.6); fxSpark(m.x,1,m.z,0xcfc4ac,40); P.shake=Math.max(P.shake||0,.8); thud(); if(Math.hypot(P.x-m.x,P.z-m.z)<9) hurtPlayer(m.atk*1.7*(1-dmgReduce(st.def)),m.n); } } }
    // 서로 겹치지 않게
    list.forEach(o=>{ if(o===m) return; const ex=m.x-o.x, ez=m.z-o.z, e=Math.hypot(ex,ez), want=(m.scale+o.scale)*.9; if(e>0&&e<want){ m.x+=ex/e*(want-e)*.5; m.z+=ez/e*(want-e)*.5; } });
    m.x=clamp(m.x,DGX-DG_W/2+2,DGX+DG_W/2-2); m.z=clamp(m.z,(DG.gate&&!DG.gate.open?DG.gate.z+2:cz-DG_D/2+3),cz+DG_D/2-2);
    const u=m.mesh.userData; m.mesh.position.set(m.x,(u.float?Math.sin(tnow/400+m.x)*.3+.2:0)+(u.lunge>0?.4:0)+(m.warn>0?Math.min(1.5,(1.1-m.warn)*2):0),m.z); if(u.lunge>0) u.lunge-=dt; if(m.aura){ m.aura.rotation.z+=dt*2; m.aura.scale.setScalar(1+Math.sin(tnow/250)*.12); }
    let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*8);
    if(u.gl){ animState(m.mesh,m.hit>0&&m.hp>0?"hit":m.warn>0?"attack":m.state==="chase"?(d>reach?"run":"idle"):"idle"); if(u.lunge>.2) animState(m.mesh,"attack"); }
    hitTint(m.mesh,m.hit/.15); const sc=m.scale*(m.hit>0?1.12:1); m.mesh.scale.set(sc,sc,sc);
    if(d<48){ const h=u.h||4; placeLabel(m.lbl,m.x,h*m.scale,m.z,`${m.boss?"👑 ":""}${m.n} <b>Lv.${m.lv}${m.boss?" · 미궁 왕":""}</b><span class="hp"><i style="width:${Math.round(m.hp/m.mhp*100)}%"></i></span>`); } else m.lbl.style.display="none"; }); return list.length; }
function dgTickTrap(dt){ const T=DG.trap, cz=dgZ(DG.f), st=stat(); if(!T) return;
  if(T.k==="fire"){ DG.ft+=dt; T.hitT-=dt; T.vents.forEach(v=>{ const c=(DG.ft+v.ph)%4.2; const warn=c>=2.2&&c<3.1, burn=c>=3.1; v.warn.material.opacity=warn?.45+Math.sin(DG.ft*20)*.3:burn?.6:0; v.fire.visible=v.core.visible=burn; if(burn){ const k=1+Math.sin(DG.ft*30+v.x)*.08; v.fire.scale.set(k,1,k); }
      if(burn&&!P.dead&&T.hitT<=0&&Math.hypot(P.x-v.x,P.z-v.z)<2.2){ T.hitT=.5; hurtPlayer(st.mhp*.08,"불기둥"); fxSpark(P.x,1.5,P.z,0xff8a30,10); } }); }
  if(T.k==="boulder"){ T.t-=dt; if(T.t<=0){ T.t=rnd(1.5,2.6); const z=rnd(cz-DG_D/2+12,cz+DG_D/2-14); const s=Math.random()<.5?-1:1; const warn=box(DG_W,.08,3.4,glowMat(0xff3030,.35),DGX,.06,z); warn.userData.noOutline=true; scene.add(warn);
      const rock=sph(1.7,mat({color:0x7a6a5a,roughness:1}),DGX-s*(DG_W/2-2),1.7,z); rock.visible=false; rock.castShadow=HIGH(); scene.add(rock); T.list.push({z,s,x:DGX-s*(DG_W/2-2),warn,rock,w:1.0,hit:false}); DG.fx.push({mesh:warn},{mesh:rock}); tone(220,.12,"triangle",0,.06); }
    for(let i=T.list.length-1;i>=0;i--){ const b=T.list[i]; if(b.w>0){ b.w-=dt; b.warn.material.opacity=.25+Math.sin(performance.now()/60)*.15; if(b.w<=0){ b.rock.visible=true; thud(); } continue; }
      b.x+=b.s*17*dt; b.rock.position.x=b.x; b.rock.rotation.z-=b.s*17*dt/1.7; b.warn.material.opacity=.12;
      if(!b.hit&&!P.dead&&Math.abs(P.x-b.x)<2.3&&Math.abs(P.z-b.z)<2.3){ b.hit=true; hurtPlayer(st.mhp*.14,"굴러오는 바위"); if(P.y<=0.8){ P.dashT=.15; P.dashX=b.s*30; P.dashZ=0; } }
      if(Math.abs(b.x-DGX)>DG_W/2-1){ fxSpark(b.x,1,b.z,0xa89880,14); scene.remove(b.rock); scene.remove(b.warn); T.list.splice(i,1); } } }
  if(T.k==="fire"||T.k==="boulder") return; }
function dgTickPlates(dt){ const pl=DG.plates, gate=DG.gate; if(!pl) return; const peers=dgPeersHere(); const LIT=peers.length?2.5:6;
  pl.forEach(p=>{ let on=!P.dead&&Math.hypot(P.x-p.x,P.z-p.z)<2.4; peers.forEach(o=>{ if(Math.hypot(o.x-p.x,o.z-p.z)<2.6) on=true; }); if(on&&!p.press){ tone(660,.08,"triangle"); fxRing(p.x,p.z,0x7affb0,5,.4); } p.press=on; if(on) p.lit=LIT; else p.lit=Math.max(0,p.lit-dt);
    const k=p.lit/LIT; p.glow.material.opacity=p.lit>0?.35+.5*k:0; p.beam.material.opacity=p.lit>0?.15+.4*k:0; p.top.material.emissive.setHex(p.lit>0?0x2aff8a:0x000000); p.top.material.emissiveIntensity=p.lit>0?.4+.6*k:0; p.top.position.y=on?.3:.45; });
  if(!gate.open&&pl.every(p=>p.lit>0)){ gate.open=true; jingle([523,659,784,1046,1318]); buzz([40,30,60]); toast("🤝 문이 열렸어요!",peers.length?`${peers.map(o=>o.name).join(", ")}와(과) 힘을 합쳤어요`:"혼자서 해냈어요!",2.6); fxRing(DGX,gate.z,0x7affb0,26,1); }
  if(gate.open&&gate.y>-8.4){ gate.y=Math.max(-8.4,gate.y-dt*6); gate.bars.position.y=gate.y; }
  if(!gate.open&&!pl.some(p=>p.lit>0)&&Math.random()<dt*.15&&Math.abs(P.z-pl[0].z)<20) toast("양쪽 발판을 동시에 밟아요",peers.length?"친구와 한 명씩!":"혼자면 한쪽을 밟고 6초 안에 반대쪽으로!",2); }
function dgSky(dt){ SKY.tTop.setHex(0x0c0a1c); SKY.tBot.setHex(0x221a36); const k=Math.min(1,dt*2); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=45; scene.fog.far=130;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+25,75,P.z+35); sun.target.position.set(P.x,0,P.z); sun.intensity=.75; sun.color.setHex(0xffdcb0); hemi.intensity=.5; fill.intensity=.22; skyMat.uniforms.sunDir.value.set(0,-1,0); renderer.toneMappingExposure=.9; }
function dgMinimap(){ const ctx=mctx, S=fitCanvas(mm); const cz=dgZ(DG.f); const s=S*.88/DG_D; const X=x=>S/2+(x-DGX)*s, Z=z=>S/2+(z-cz)*s;
  ctx.fillStyle="#120c22"; ctx.fillRect(0,0,S,S); const T=DG_THEME[DG.plan.floors[DG.f].realm]; ctx.fillStyle="#"+new THREE.Color(T.floor).getHexString(); ctx.fillRect(X(DGX-DG_W/2),Z(cz-DG_D/2),DG_W*s,DG_D*s); ctx.strokeStyle="#"+new THREE.Color(T.wall).getHexString(); ctx.lineWidth=Math.max(2,S/60); ctx.strokeRect(X(DGX-DG_W/2),Z(cz-DG_D/2),DG_W*s,DG_D*s);
  if(DG.gate&&!DG.gate.open){ ctx.strokeStyle="#c9c9d8"; ctx.beginPath(); ctx.moveTo(X(DGX-DG_W/2),Z(DG.gate.z)); ctx.lineTo(X(DGX+DG_W/2),Z(DG.gate.z)); ctx.stroke(); }
  if(DG.plates) DG.plates.forEach(p=>dot(ctx,X(p.x),Z(p.z),S/28,p.lit>0?"#7affb0":"#6a5a8a","#fff",1.5));
  if(DG.portal) dot(ctx,X(DG.portal.x),Z(DG.portal.z-2.2),S/22,DG.portal.on?"#b49aff":"#3a2a6a","#fff",2);
  mobs.forEach(m=>{ if(m.dg) dot(ctx,X(m.x),Z(m.z),m.boss?S/22:S/45,"#ff4a4a","#200",1); });
  dgPeersHere().forEach(o=>dot(ctx,X(o.x),Z(o.z),S/36,"#3fd27a","#fff",1.5));
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const a=S/20; ctx.moveTo(0,-a); ctx.lineTo(a*.7,a*.7); ctx.lineTo(0,a*.35); ctx.lineTo(-a*.7,a*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,`미궁 ${DG.f+1}층`,S/2,S*.05,Math.round(S/11),"#e8dcff"); }
function dgTick(dt){ if(!DG.on) return; if(Math.abs(P.x-DGX)>150){ dgExit(true); return; }
  const F=DG.plan.floors[DG.f];
  // 얼음: 쭉 미끄러짐
  if(F.k==="ice"&&dt>0){ const vx=(P.x-DG.lx)/dt, vz=(P.z-DG.lz)/dt; const k=Math.min(1,dt*1.6); DG.vx+=(vx-DG.vx)*k; DG.vz+=(vz-DG.vz)*k; if(P.dashT<=0){ P.x=DG.lx+DG.vx*dt; P.z=DG.lz+DG.vz*dt; } if(Math.hypot(DG.vx,DG.vz)>4&&Math.random()<dt*8) fxSpark(P.x,.2,P.z,0xe8f7ff,3); }
  dgClampP(); DG.lx=P.x; DG.lz=P.z;
  dgPeersHere().forEach(o=>DG.party[o.name]=1);
  const left=dgTickMobs(dt); dgTickTrap(dt); dgTickPlates(dt);
  const tn=performance.now(); DG.torches.forEach((t,i)=>{ const k=1+Math.sin(tn/90+i*1.7)*.12+Math.sin(tn/37+i)*.06; t.scale.setScalar(k*1.1); });
  const po=DG.portal; if(po){ const ready=left===0&&(!DG.gate||DG.gate.open); if(ready&&!po.on){ po.on=true; jingle([659,784,1046,1318]); toast(DG.f===4?"🏆 미궁 왕을 쓰러뜨렸어요!":"✨ 포털이 열렸어요!",DG.f===4?"빛나는 문으로 들어가면 보물 상자!":"맨 위 빛나는 문으로 들어가요",2.6); P.guide={x:po.x,z:po.z,label:DG.f===4?"미궁 출구":"다음 층 포털"}; $("guide").hidden=false; }
    po.ring.material.opacity=po.on?.75+Math.sin(tn/150)*.2:.22; po.disc.material.opacity=po.on?.35+Math.sin(tn/200)*.1:0; po.pad.material.opacity=po.on?.6:.2; po.ring.rotation.z+=dt*(po.on?2:.3);
    if(po.on&&Math.hypot(P.x-po.x,P.z-po.z)<3.2&&!P.dead){ if(DG.f<4) dgFloor(DG.f+1); else dgFinish(); return; } }
  $("region").innerHTML=`🌀 미궁 ${DG.f+1}층 <b>${DG_ROOM[F.k].n} · ${fmtSec((Date.now()-DG.t0)/1000)}</b>`; }
function dgFinish(){ const t=Math.round((Date.now()-DG.t0)/1000), day=DG.plan.day, first=G.dgDay!==day, lv=G.lv; const party=Object.keys(DG.party);
  let gold=250+lv*30, xp=250+lv*45; if(!first){ gold=Math.round(gold*.3); xp=Math.round(xp*.3); } let tier=Math.min(3,Math.max(0,G.rank)); if(first&&Math.random()<.35) tier=Math.min(3,tier+1); const s=pick(["w","a","r"]);
  if(first) G.bag.push({s,t:tier}); G.gold+=gold; gainXp(xp); G.pots+=2; G.dgClear=(G.dgClear||0)+1; G.dgDay=day; const pb=!G.dgBest||t<G.dgBest; if(pb) G.dgBest=t; const better=!G.dgToday||G.dgToday.day!==day||t<G.dgToday.t; if(better) G.dgToday={day,t,p:party};
  saveGame(); if(better) try{ net.pushRet("dg/"+G.id,{i:G.id,n:G.name,r:G.realm,day,t,p:party}); }catch(e){}
  dgExit(true); _spawnHome0(); P.hp=stat().mhp;
  card(`<h2>🏆 신들의 미궁 정복!</h2><p>5층까지 <b style="color:var(--gold)">${fmtSec(t)}</b>${pb?" · <b style=\"color:#9dffb8\">내 최고 기록!</b>":""}${party.length?`<br>함께한 친구: ${party.join(", ")}`:""}</p>
   <div class="idlegrid"><div><b>+${fmt(gold)}</b><span>금화</span></div><div><b>+${fmt(xp)}</b><span>경험치</span></div><div><b>${first?rarTag(tier):"—"}</b><span>${first?itemName(s,tier):"보물은 하루 한 번"}</span></div><div><b>+2</b><span>${RM().potion}</span></div></div>
   ${first?"":'<p style="font-size:12px">오늘은 이미 깼어요. 다시 깨면 보상이 조금 작아요(기록은 더 빠르면 바뀌어요).</p>'}${dgBoardHtml()}<button class="buy" id="dgOk" style="align-self:center">만세!</button>`);
  $("dgOk").onclick=closeLayer; jingle([523,659,784,1046,1318,1568,2093]); buzz([80,40,80,40,120]); try{ fxPillar(0xb49aff,1.2,HIGH()?44:28,2.2,.42); for(let i=0;i<4;i++) fxRiseRing(i%2?0xffe08a:0xb49aff,i*.16,3,1.2); fxRiseDust(0xe8dcff,HIGH()?60:24,2.2); lvBanner("미궁 정복!","🏆 "+fmtSec(t),pb?"내 최고 기록!":"보물 상자를 열었어요","#b49aff"); }catch(e){} }
function dgBoardHtml(){ const day=dgDay(); const list=Object.values(DGR).filter(d=>d.day===day); if(G.dgToday&&G.dgToday.day===day) list.push({i:G.id,n:G.name,r:G.realm,t:G.dgToday.t,p:G.dgToday.p||[],me:1});
  const seen={}; const rows=list.sort((a,b)=>a.t-b.t).filter(d=>{ const k=[d.n].concat(d.p||[]).sort().join("+"); if(seen[k]) return false; seen[k]=1; return true; }).slice(0,8).map((d,k)=>`<div class="row"><div class="ic" style="color:${REALMS[d.r]?REALMS[d.r].c1:"#fff"}">${k===0?"🥇":k===1?"🥈":k===2?"🥉":k+1}</div><div class="t"><div>${d.n}${(d.p&&d.p.length)?" + "+d.p.join(", "):""}${d.me?" (나)":""}</div><span>${fmtSec(d.t)}</span></div></div>`).join("");
  return `<h3>🏁 오늘의 가장 빠른 파티</h3>${rows||'<p style="font-size:13px">아직 아무도 깨지 못했어요. 1등을 노려 보세요!</p>'}`; }
function showDungeon(){ const plan=dgPlan(dgDay()); const day=dgDay(); const done=G.dgDay===day;
  const fl=plan.floors.map((F,f)=>{ const Rm=DG_ROOM[F.k]; return `<div class="row"><div class="ic" style="color:${REALMS[F.realm].c1}">${Rm.ic}</div><div class="t"><div>${f+1}층 · ${Rm.n}${F.k==="boss"?` — ${plan.boss.n}`:""}</div><span>${F.k==="boss"?"미궁 왕 · 친구가 준 데미지도 함께 깎여요":REALMS[F.realm].n+"의 괴물 · "+Rm.h}</span></div></div>`; }).join("");
  card(`<h2>🌀 신들의 미궁</h2><p>날마다 모양이 바뀌는 5층 미궁이에요. 오늘의 미궁은 모두에게 똑같아요. 혼자도 되지만 <b>친구와 함께</b> 들어가면 훨씬 쉬워요!<br>오늘 ${done?'<b style="color:#9dffb8">정복 완료</b>':"아직 못 깸 · 첫 정복 보물 상자"} · 지금까지 ${G.dgClear||0}번 정복${G.dgBest?` · 최고 ${fmtSec(G.dgBest)}`:""}</p>
   ${fl}${dgBoardHtml()}${DG.on?'<button class="buy sell" id="dgOut" style="align-self:center">미궁에서 나가기</button>':'<button class="go" id="dgGo" style="align-self:center;font-size:18px;padding:10px 22px">미궁으로 들어가기</button>'}`);
  if($("dgGo")) $("dgGo").onclick=dgEnter; if($("dgOut")) $("dgOut").onclick=()=>{ closeLayer(); spawnAtHome(); }; }
// 수도마다 미궁 입구(보라색 문) — 가까이 가면 창이 열림
function dgDoors(){ if(DG.doors) return; DG.doors=[]; REGIONS.filter(r=>r.cap).forEach(rg=>{ const a=ALTARS[rg.id]; if(!a) return; const s=a.shrine; const dir=rg.z>0?-1:1, sx=rg.x>0?-1:1; const x=s.x+sx*11, z=s.z+dir*20; const g=new THREE.Group(); g.position.set(x,hAt(x,z),z); g.rotation.y=dir>0?0:Math.PI;
    const st=mat({color:0x4a3a6a,roughness:.6}); g.add(cyl(.45,.55,5,st,-2.4,2.5,0,8)); g.add(cyl(.45,.55,5,st,2.4,2.5,0,8)); g.add(box(6,.8,1,st,0,5.2,0)); const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.22,8,32),glowMat(0xa07aff,.8)); ring.position.y=2.4; g.add(ring); const disc=new THREE.Mesh(new THREE.CircleGeometry(1.9,32),glowMat(0x6a4aff,.35)); disc.position.y=2.4; g.add(disc);
    scene.add(g); const lbl=makeLabel("boss"); DG.doors.push({x,z:z+(dir>0?1.5:-1.5),g,ring,lbl}); }); }
function tickDungeonDoors(dt){ if(!started) return; dgDoors(); DG.doorCd=Math.max(0,DG.doorCd-dt); if(DG.on){ DG.doors.forEach(d=>d.lbl.style.display="none"); return; } const tn=performance.now();
  DG.doors.forEach(d=>{ d.ring.rotation.z+=dt*1.5; d.ring.material.opacity=.6+Math.sin(tn/200)*.2; const dist=Math.hypot(P.x-d.x,P.z-d.z); if(dist<45) placeLabel(d.lbl,d.x,6.2,d.z,`🌀 신들의 미궁 <b>${G.dgDay===dgDay()?"오늘 정복 완료!":"오늘의 미궁이 열렸어요"}</b>`); else d.lbl.style.display="none";
    if(dist<2.8&&!layerOpen&&!P.dead&&DG.doorCd<=0){ DG.doorCd=6; showDungeon(); } }); }
</script>
