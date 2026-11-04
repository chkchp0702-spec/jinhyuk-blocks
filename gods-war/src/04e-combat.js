<script>
/* ================= v15: 날아가는 무기(화살·창·도끼·망치·마법탄) =================
   - 공용 투사체 PROJ: 포물선/직선으로 날아가 맞으면 데미지. 화살은 땅에 잠깐 꽂혀 있음.
   - 내 무기 종류(weaponKindOf): 활 → 기본 공격이 화살(16걸음), 지팡이·마법봉 → 마법탄(14걸음), 창 → 찌르기 거리 김.
   - 「던지기」 버튼(키 O): 무기마다 다름 — 창 던지기 · 손도끼 · 돌아오는 망치(번개) · 단검 3개 부채꼴 · 화살비 · 큰 불덩이.
   - 전쟁 병사(궁수·창병)도 같은 투사체를 씀(04b-war.js). */
const PROJ=[];
const PMAT={ wood:mat({color:0x8a5a30,roughness:.8}), iron:mat({color:0xc9ced8,metalness:.8,roughness:.3}), feather:mat({color:0xf4f0e6,roughness:.9}), red:mat({color:0xd83a3a,roughness:.8}), gold:mat({color:0xffd05a,metalness:.6,roughness:.3}) };
function weaponKindOf(w){ w=String(w||""); if(/bow/i.test(w)) return "bow"; if(/Spear|trident/i.test(w)) return "spear"; if(/staff|Staff|wand|Wand/.test(w)) return "magic"; if(/hammer|Wrench/i.test(w)) return "hammer"; if(/axe/i.test(w)) return "axe"; if(/dagger/i.test(w)) return "dagger"; return w?"sword":"fist"; }
function myWeaponKind(){ try{ const s=lookSpec(G.realm,G.rank,G.look||{},G.eq); return weaponKindOf(s.weapon); }catch(e){ return "sword"; } }
const THROW={ spear:{n:"창 던지기",cd:3,mult:2.6,r:2.2,speed:34,arc:.5,kind:"javelin"}, axe:{n:"손도끼",cd:2.5,mult:2.2,r:2,speed:26,arc:.35,kind:"axe"}, hammer:{n:"돌아오는 망치",cd:4,mult:2.4,r:3.5,speed:28,arc:.15,kind:"hammer",back:1,zap:1},
  dagger:{n:"단검 부채",cd:3,mult:1.25,r:1.6,speed:32,arc:.1,kind:"dagger",fan:3}, sword:{n:"단검 부채",cd:3,mult:1.25,r:1.6,speed:32,arc:.1,kind:"dagger",fan:3}, fist:{n:"돌 던지기",cd:2.5,mult:1.4,r:1.6,speed:26,arc:.5,kind:"rock"},
  bow:{n:"화살비",cd:5,mult:1.1,r:2,speed:30,arc:1,kind:"arrow",rain:6}, magic:{n:"큰 불덩이",cd:4,mult:2.7,r:4.2,speed:20,arc:.25,kind:"orb",big:1} };
function makeProjMesh(kind,color){ const g=new THREE.Group(); const inner=new THREE.Group(); g.add(inner);
  if(kind==="arrow"||kind==="javelin"){ const L=kind==="javelin"?2.6:1.5, r=kind==="javelin"?.06:.035; const sh=cyl(r,r,L,PMAT.wood,0,0,0,6); sh.rotation.x=Math.PI/2; inner.add(sh); const hd=new THREE.Mesh(GEO.cone,PMAT.iron); hd.scale.set(r*4,kind==="javelin"?.45:.3,r*4); hd.rotation.x=Math.PI/2; hd.position.z=L/2+.12; inner.add(hd);
    if(kind==="arrow"){ [-1,1].forEach(s=>{ const f=box(.02,.16,.32,color!=null?mat({color}):PMAT.feather,s*.06,0,-L/2+.15); inner.add(f); const f2=box(.16,.02,.32,color!=null?mat({color}):PMAT.feather,0,s*.06,-L/2+.15); inner.add(f2); }); } }
  else if(kind==="axe"){ inner.add(cyl(.04,.05,.9,PMAT.wood,0,0,0,6)); const b=box(.5,.36,.06,PMAT.iron,.2,.32,0); inner.add(b); inner.userData.spin=1; }
  else if(kind==="hammer"){ inner.add(cyl(.05,.06,.9,PMAT.wood,0,0,0,6)); inner.add(box(.7,.42,.42,mat({color:0xb8c6e0,metalness:.8,roughness:.25,emissive:0x2a58ff,emissiveIntensity:.35}),0,.5,0)); inner.add(sph(.55,glowMat(0x7ab8ff,.45),0,.4,0)); inner.userData.spin=1; }
  else if(kind==="dagger"){ inner.add(box(.05,.05,.32,PMAT.gold,0,0,-.2)); const bl=box(.12,.03,.62,PMAT.iron,0,0,.25); inner.add(bl); }
  else if(kind==="rock"){ inner.add(sph(.28,mat({color:0x8a8478,roughness:1}),0,0,0)); inner.userData.spin=1; }
  else { const c=color!=null?color:0xff8a3d; inner.add(sph(.45,mat({color:0xffffff,emissive:c,emissiveIntensity:2}),0,0,0)); inner.add(sph(.85,glowMat(c,.55),0,0,0)); g.userData.glow=c; }
  g.userData.inner=inner; return g; }
/* o: {x,y,z, tx,tz, ty?, kind, speed, arc, dmg, crit, r, hits:"mobs"|"player"|"units", side, target, color, back, zap, cosmetic, owner} */
function fireProj(o){ const mesh=makeProjMesh(o.kind,o.color); const y0=(o.y!=null?o.y:2)+hAt(o.x,o.z); const ty=(o.ty!=null?o.ty:1.2)+hAt(o.tx,o.tz); const d=Math.max(.5,Math.hypot(o.tx-o.x,o.tz-o.z)); const T=Math.max(.12,d/(o.speed||28)); const g=28*(o.arc||0);
  const p=Object.assign({},o,{mesh,t:0,T,vx:(o.tx-o.x)/T,vz:(o.tz-o.z)/T,vy:(ty-y0+.5*g*T*T)/T,g,y:y0,px:o.x,pz:o.z,stuck:0}); mesh.position.set(o.x,y0,o.z); scene.add(mesh); PROJ.push(p); return p; }
function projImpact(p){ const ix=p.mesh.position.x, iz=p.mesh.position.z; const R=p.r||1.5; let hitAny=false;
  if(p.cosmetic){ fxSpark(ix,.6,iz,p.mesh.userData.glow||0xcfc4ac,6); return false; }
  if(p.hits==="mobs"){ mobs.forEach(m=>{ if(m.hp<=0) return; const big=m.titan?6.5:m.scale>1.5?1.4:0; if(Math.hypot(m.x-ix,m.z-iz)<R+big){ damageMob(m,p.dmg*(p.crit?1.8:1)*rnd(.92,1.08),p.crit); hitAny=true; } });
    for(const id in PEERS){ const o=PEERS[id]; if(o.realm===G.realm||o.dead||inCapital(o.x,o.z)||inCapital(P.x,P.z)) continue; if(Math.hypot(o.x-ix,o.z-iz)<R){ const dmg=Math.round(p.dmg*.55); net.send({t:"hit",to:id,d:dmg}); floatDmg(o.x,4,o.z,"-"+fmt(dmg)); hitAny=true; } } }
  else if(p.hits==="player"){ if(!P.dead&&Math.hypot(P.x-ix,P.z-iz)<R+.4){ hurtPlayer(p.dmg*(1-dmgReduce(stat().def)),p.owner||"화살"); hitAny=true; } }
  else if(p.hits==="units"){ const t=p.target; if(t&&!t.dead&&Math.hypot(t.x-ix,t.z-iz)<R+.6){ t.hp-=p.dmg*rnd(.85,1.15); t.hit=.15; if(t.hp<=0&&typeof unitDie==="function") unitDie(t); hitAny=true; } }
  if(p.zap){ fxBolt(ix,iz,0x7ab8ff); fxRing(ix,iz,0x7ab8ff,p.r*1.6,.4); thud(); }
  if(p.kind==="orb"){ fxFlash(ix,1,iz,p.mesh.userData.glow||0xff8a3d,p.big?4:1.6,.35); fxSpark(ix,1,iz,p.mesh.userData.glow||0xff8a3d,p.big?40:14); if(p.big){ fxRing(ix,iz,0xff8a3d,p.r*1.8,.5); thud(); } }
  else fxSpark(ix,1,iz,hitAny?0xffffff:0xcfc4ac,hitAny?10:5);
  return hitAny; }
function tickProj(dt){ for(let i=PROJ.length-1;i>=0;i--){ const p=PROJ[i]; const m=p.mesh;
    if(p.stuck>0){ p.stuck-=dt; if(p.stuck<=0){ scene.remove(m); PROJ.splice(i,1); } continue; }
    if(p.returning){ const tx=p.ownerObj?p.ownerObj.x:P.x, tz=p.ownerObj?p.ownerObj.z:P.z; const dx=tx-m.position.x, dz=tz-m.position.z, L=Math.hypot(dx,dz); if(L<1.5){ scene.remove(m); PROJ.splice(i,1); continue; } const sp=32*dt; m.position.x+=dx/L*Math.min(L,sp); m.position.z+=dz/L*Math.min(L,sp); m.position.y+=(hAt(m.position.x,m.position.z)+2-m.position.y)*Math.min(1,dt*6); p.mesh.userData.inner.rotation.x+=dt*22; continue; }
    p.t+=dt; const t=Math.min(p.t,p.T); const nx=p.x+p.vx*t, nz=p.z+p.vz*t, ny=p.y+p.vy*t-.5*p.g*t*t;
    // 날아가는 방향으로 머리 돌리기
    const dx=nx-m.position.x, dy=ny-m.position.y, dz=nz-m.position.z; m.position.set(nx,ny,nz);
    if(p.kind==="arrow"||p.kind==="javelin"||p.kind==="dagger"){ if(Math.hypot(dx,dy,dz)>1e-4) m.lookAt(nx+dx,ny+dy,nz+dz); }
    else if(m.userData.inner.userData.spin){ m.rotation.y=Math.atan2(p.vx,p.vz); m.userData.inner.rotation.x+=dt*20; }
    if(p.kind==="orb"&&Math.random()<dt*30) fxSpark(nx,ny-hAt(nx,nz),nz,m.userData.glow||0xff8a3d,2);
    // 날아가는 중에 표적에 닿으면 바로 맞음(직선형)
    let early=false; if(!p.cosmetic&&p.hits==="mobs"&&p.t<p.T){ for(const mb of mobs){ if(mb.hp<=0) continue; const big=mb.titan?6.5:mb.scale>1.5?1.4:0; if(Math.hypot(mb.x-nx,mb.z-nz)<.9+big&&ny-hAt(nx,nz)<4+big){ early=true; break; } } }
    if(p.t>=p.T||early){ projImpact(p); if(p.back){ p.returning=true; continue; } if((p.kind==="arrow"||p.kind==="javelin")&&!early){ p.stuck=2.2; m.position.y=Math.max(hAt(nx,nz)+.2,ny); continue; } scene.remove(m); PROJ.splice(i,1); } } }

/* ---- 내 원거리 기본 공격(활·마법) ---- */
function nearestFoe(range){ let best=null,bd=1e9; mobs.forEach(m=>{ if(m.hp<=0) return; const d=Math.hypot(m.x-P.x,m.z-P.z); if(d<range&&d<bd){ bd=d; best=m; } }); for(const id in PEERS){ const o=PEERS[id]; if(o.realm===G.realm||o.dead||inCapital(o.x,o.z)||inCapital(P.x,P.z)) continue; const d=Math.hypot(o.x-P.x,o.z-P.z); if(d<range&&d<bd){ bd=d; best=o; } } return best; }
function rangedAttack(kind){ const range=(kind==="bow"?16:14)+((typeof DG!=="undefined"&&DG.on&&DG.plan&&DG.plan.floors[DG.f].k==="shoot")?10:0); P.atkCd=kind==="bow"?.42:.5; P.atkAnim=.25; P.combat=4; if(player.userData.gl) animState(player,"attack"); const st=stat();
  const tg=nearestFoe(range); if(tg) P.rot=Math.atan2(tg.x-P.x,tg.z-P.z); if(player) player.rotation.y=P.rot;
  const tx=tg?tg.x:P.x+Math.sin(P.rot)*range, tz=tg?tg.z:P.z+Math.cos(P.rot)*range; const crit=Math.random()<st.crit;
  const sx=P.x+Math.sin(P.rot)*.8, sz=P.z+Math.cos(P.rot)*.8;
  if(kind==="bow"){ fireProj({x:sx,z:sz,y:2.1,tx,tz,ty:1.6,kind:"arrow",speed:38,arc:.18,dmg:st.atk*1.0,crit,r:1.3,hits:"mobs"}); tone(980,.04,"triangle",0,.06); tone(420,.08,"sine",.02,.05); }
  else { const c=RM().skills[0].color; fireProj({x:sx,z:sz,y:2.4,tx,tz,ty:1.6,kind:"orb",color:c,speed:24,arc:0,dmg:st.atk*1.05,crit,r:2,hits:"mobs"}); tone(660,.08,"sine",0,.07); tone(990,.06,"triangle",.03,.05); }
  net.send({t:"a",k:"atk",pj:[kind==="bow"?"arrow":"orb",+sx.toFixed(1),+sz.toFixed(1),+tx.toFixed(1),+tz.toFixed(1)]}); }
/* ---- 던지기 버튼 ---- */
let throwCd=0;
function throwWeapon(){ if(P.dead||layerOpen||throwCd>0) return; const kind=myWeaponKind(); const T=THROW[kind]||THROW.sword; throwCd=T.cd; const st=stat(); P.atkAnim=.35; P.combat=4; if(player.userData.gl) animState(player,"skill");
  const tg=nearestFoe(20); if(tg) P.rot=Math.atan2(tg.x-P.x,tg.z-P.z); if(player) player.rotation.y=P.rot; const range=18;
  const tx=tg?tg.x:P.x+Math.sin(P.rot)*range, tz=tg?tg.z:P.z+Math.cos(P.rot)*range; const sx=P.x+Math.sin(P.rot)*.8, sz=P.z+Math.cos(P.rot)*.8; const crit=Math.random()<st.crit; const sent=[];
  const shoot=(x,z,dly)=>{ const go=()=>{ fireProj({x:sx,z:sz,y:2.6,tx:x,tz:z,ty:1.4,kind:T.kind,speed:T.speed,arc:T.arc,dmg:st.atk*T.mult,crit,r:T.r,hits:"mobs",back:T.back,zap:T.zap,big:T.big,color:T.kind==="orb"?0xff7a2a:undefined}); }; if(dly) setTimeout(go,dly); else go(); sent.push([+x.toFixed(1),+z.toFixed(1)]); };
  if(T.fan){ for(let k=-1;k<=1;k++){ const a=P.rot+k*.22, d=Math.hypot(tx-P.x,tz-P.z)||12; shoot(P.x+Math.sin(a)*d,P.z+Math.cos(a)*d,0); } }
  else if(T.rain){ for(let k=0;k<T.rain;k++) shoot(tx+rnd(-3.5,3.5),tz+rnd(-3.5,3.5),k*70); fxRing(tx,tz,0xffe08a,8,.8); }
  else shoot(tx,tz,0);
  drama(RM().skills[0].color,.25,.6); tone(300,.12,"sawtooth",0,.1); tone(600,.1,"triangle",.05,.08); buzz(20);
  net.send({t:"a",k:"thr",pk:T.kind,sx:+sx.toFixed(1),sz:+sz.toFixed(1),pts:sent}); }
/* 친구가 쏜 것 — 보기만(데미지는 쏜 사람 폰이 계산) */
function peerProj(o,d){ try{ if(Math.hypot(o.x-P.x,o.z-P.z)>70) return; if(d.k==="atk"&&d.pj){ const a=d.pj; fireProj({x:a[1],z:a[2],y:2.1,tx:a[3],tz:a[4],ty:1.6,kind:a[0],speed:a[0]==="arrow"?38:24,arc:a[0]==="arrow"?.18:0,cosmetic:1,color:REALMS[o.realm].skills[0].color}); }
  if(d.k==="thr"&&d.pts){ const T=Object.values(THROW).find(t=>t.kind===d.pk)||THROW.sword; d.pts.forEach((p,k)=>setTimeout(()=>fireProj({x:d.sx,z:d.sz,y:2.6,tx:p[0],tz:p[1],ty:1.4,kind:d.pk,speed:T.speed,arc:T.arc,cosmetic:1,back:T.back,ownerObj:o,color:d.pk==="orb"?0xff7a2a:undefined}),T.rain?k*70:0)); } }catch(e){} }
function throwHud(){ const b=$("bThrow"); if(!b) return; const kind=myWeaponKind(); const T=THROW[kind]||THROW.sword; if(b._k!==kind){ b._k=kind; $("thrNm").textContent=T.n; } $("thrCd").textContent=throwCd>0?Math.ceil(throwCd)+"초":""; $("thrCdV").style.setProperty("--p",throwCd>0?Math.round(throwCd/T.cd*100)+"%":"0%"); }
</script>
