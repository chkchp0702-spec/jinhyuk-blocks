<script>
/* ================= v51: ⚔ 전쟁 전술 — 전투 종류 4가지 · 작전 · 새 병사 · 사기 · 지휘 =================
   사용자 11/5: "전쟁 좀 전술 같은 거도 그렇고 다양하게 … 맨날 같은 방향으로 우르르 몰려오고 끝이야"
   ① 전투 종류(시간 칸으로 정해짐 → 모든 폰이 같은 종류): ⚔ 정면 대결 · 🏰 공성전(나무 성벽·성문·망루 vs 공성추) · 🚩 깃발 쟁탈전 · 🌫 안개 속 매복전.
   ② 공격대 작전이 분대마다 바뀜: 정면 돌격 · 양옆 포위 · 궁수 일제 사격 후 전진 · 방패 진형 · 거짓 후퇴 + 기병 기습 · 기병 측면 돌파 (화면에 "적의 작전: …" 알림).
      수비대도 방패벽 + 궁수 진지 + 예비 기병 반격.
   ③ 새 병사: 🛡 방패병(앞에서 오는 화살을 막음) · 🐎 기병(빠름, 궁수에 강하고 창병에 약함) · ✚ 치유사(다친 편을 고침) · 🪵 공성추 · 🗼 망루 · 🚪 성문.
      상성: 창병 → 기병 2배 · 기병 → 궁수·치유사 1.8배 · 방패병은 앞쪽 화살 65% 막음.
   ④ 사기: 대장이 쓰러지거나 성문·공성추·깃발을 잃으면 사기가 떨어지고, 30 아래면 병사들이 겁먹고(😨) 잠깐 물러남.
   ⑤ 지휘(참전했을 때): 📯 돌격 · 🛡 방어진 · 🏹 일제 사격 · 🚩 따라와 — 근처 우리 편 병사에게 명령.
   병사 움직임은 원래처럼 각 폰이 계산(모습)하고, 점수는 그대로 기본 군세 + 참전한 사람의 전공(공유)만 씀. 공성·깃발·매복에서 세운 공은 내 전공에 더해짐. */
const BTYPES=[
 {id:"field",n:"정면 대결",ic:"⚔",d:"양쪽 군대가 작전을 바꿔 가며 맞붙어요. 적의 작전을 보고 막아요!"},
 {id:"siege",n:"공성전",ic:"🏰",d:"수비대는 나무 성벽·성문·망루 안에서 지키고, 공격대는 공성추로 성문을 부숴요!"},
 {id:"flags",n:"깃발 쟁탈전",ic:"🚩",d:"깃발 3개를 차지해요. 우리 편 깃발 옆에 서 있으면 전공이 계속 쌓여요!"},
 {id:"ambush",n:"안개 속 매복전",ic:"🌫",d:"안개 낀 덤불에 수비대가 숨어 있어요. 갑자기 튀어나오니 조심!"}];
const WTAC={charge:{n:"정면 돌격",ic:"⚔"},pincer:{n:"양옆 포위",ic:"🔱"},volley:{n:"궁수 일제 사격 후 전진",ic:"🏹"},testudo:{n:"방패 진형 전진",ic:"🛡"},feint:{n:"거짓 후퇴 + 기병 기습",ic:"🐎"},cavalry:{n:"기병 측면 돌파",ic:"🐎"},escort:{n:"공성추 호위",ic:"🪵"},flag:{n:"깃발 습격",ic:"🚩"}};
Object.assign(ROLE,{shield:{hp:2.4,atk:.6,sp:4.2,reach:2.4,ic:"🛡"},cav:{hp:1.5,atk:1.0,sp:9,reach:2.7,ic:"🐎"},healer:{hp:1.0,atk:.4,sp:4.6,reach:2.2,ic:"✚"},
  ram:{hp:13,atk:0,sp:2.3,reach:0,ic:"🪵"},tower:{hp:8,atk:.9,sp:0,reach:0,range:22,ic:"🗼"},gate:{hp:15,atk:0,sp:0,reach:0,ic:"🚪"}});
const TAC={ev:null,type:"field",g:null,props:[],flags:[],gate:null,ram:null,ramT:0,towers:[],wallR:13,gateA:0,wallBroken:false,mor:{att:100,def:100},tacA:"charge",waveT:0,amb:[],ambT:0,cd:{},el:null,lastH:"",scare:{att:0,def:0},flagT:0,mistT:0,banT:0};
function warTypeOf(ev){ if(!ev||ev.none) return BTYPES[0]; if(ev.wt==null) ev.wt=hh(ev.slot,"wtype")%4; return BTYPES[ev.wt]; }
function tSay(t,s,force){ if(!WAR.cur) return; const g=TAC.g; if(!force&&g&&!WAR.joined&&Math.hypot(P.x-g.x,P.z-g.z)>70) return; try{ WARFX.banner(t,s||""); }catch(e){ toast(t,s,2); } }
function tMine(u){ return WAR.joined&&u.side===WAR.side; }
/* ---------- 모델 ---------- */
function tRamMesh(realm){ const g=new THREE.Group(); const wd=mat({color:0x7a5230,roughness:.9}), dk=mat({color:0x4a3018,roughness:.95}), ir=mat({color:0x6a6a74,metalness:.6,roughness:.4});
  g.add(box(2.4,.4,4.6,dk,0,.9,0)); [-1.3,1.3].forEach(z=>[-1.1,1.1].forEach(x=>{ const w=cyl(.55,.55,.3,wd,x,.55,z,12); w.rotation.z=Math.PI/2; g.add(w); }));
  const log=cyl(.42,.42,5.4,wd,0,1.8,.4,10); log.rotation.x=Math.PI/2; g.add(log); const head=cyl(.55,.6,.8,ir,0,1.8,3.1,10); head.rotation.x=Math.PI/2; g.add(head);
  [-1,1].forEach(s=>{ const r=box(1.7,.12,4.8,mat({color:realm>=0?new THREE.Color(REALMS[realm].c1).multiplyScalar(.7):0x8a6a3a,roughness:.8}),s*.72,2.9,0); r.rotation.z=-s*.6; g.add(r); g.add(box(.18,2.4,.18,dk,s*1.05,2,-2)); g.add(box(.18,2.4,.18,dk,s*1.05,2,2)); });
  g.userData.h=4; return g; }
function tTowerMesh(realm){ const g=new THREE.Group(); const wd=mat({color:0x8a6038,roughness:.9}), dk=mat({color:0x5a3a20,roughness:.95});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([x,z])=>g.add(cyl(.2,.24,4.4,dk,x*1.2,2.2,z*1.2,6))); g.add(box(3.2,.3,3.2,wd,0,4.4,0));
  [[0,1.5,3.2,.12],[0,-1.5,3.2,.12]].forEach(([x,z,w,d])=>g.add(box(w,.9,d,wd,x,5,z))); [[1.5,0],[-1.5,0]].forEach(([x,z])=>g.add(box(.12,.9,3.2,wd,x,5,z)));
  const roof=new THREE.Mesh(new THREE.ConeGeometry(2.6,1.6,4),mat({color:realm>=0?new THREE.Color(REALMS[realm].c1).multiplyScalar(.75):0x7a5a3a,roughness:.8})); roof.rotation.y=Math.PI/4; roof.position.y=7.4; g.add(roof); [-1,1].forEach(x=>[-1,1].forEach(z=>g.add(cyl(.08,.08,2,dk,x*1.3,6.4,z*1.3,4))));
  if(realm>=0){ const a=(typeof avatarGL==="function"&&avatarGL(realm,2,{weapon:10}))||makeAvatar(realm,2,false); a.scale.multiplyScalar(.8); a.position.y=4.55; g.add(a); g.userData.archer=a; }
  g.userData.h=9; return g; }
function tGateMesh(){ const g=new THREE.Group(); const wd=mat({color:0x7a5230,roughness:.9}), dk=mat({color:0x4a3018,roughness:.95}), ir=mat({color:0x5a5a64,metalness:.6,roughness:.45});
  [-2.4,2.4].forEach(x=>{ g.add(cyl(.45,.5,4.6,dk,x,2.3,0,8)); const c=new THREE.Mesh(new THREE.ConeGeometry(.5,.8,8),dk); c.position.set(x,4.9,0); g.add(c); });
  g.add(box(4.2,3.4,.4,wd,0,1.8,0)); [.8,2.6].forEach(y=>g.add(box(4.3,.22,.5,ir,0,y,0))); g.add(box(5.4,.5,.6,dk,0,4,0)); g.userData.h=5.5; return g; }
function tHorse(realm){ const g=new THREE.Group(); const c=realm>=0?[0xf2ece0,0x8a6a4a,0x5a3a2a,0x3a3030][realm]:0x6a5a4a; const m=mat({color:c,roughness:.8}), dk=mat({color:0x2a2020,roughness:.9}), cl=mat({color:realm>=0?new THREE.Color(REALMS[realm].c1):0x8a6a3a,roughness:.8});
  const b=sph(.75,m,0,1.25,0); b.scale.set(.9,.85,1.7); g.add(b); g.add(box(1.3,.12,1.5,cl,0,1.82,-.1)); const nk=cyl(.28,.36,1.1,m,0,1.75,1.1,8); nk.rotation.x=-.7; g.add(nk); const hd=box(.42,.45,.95,m,0,2.15,1.6); g.add(hd); g.add(box(.12,.5,.8,dk,0,2.2,1.05));
  const legs=[]; [[-.38,.85],[.38,.85],[-.38,-.85],[.38,-.85]].forEach(([x,z])=>{ const p=new THREE.Group(); p.position.set(x,1,z); p.add(cyl(.12,.1,1,m,0,-.5,0,6)); p.add(box(.2,.14,.24,dk,0,-1,.02)); g.add(p); legs.push(p); }); const tl=cyl(.08,.03,.9,dk,0,1.3,-1.45,5); tl.rotation.x=.6; g.add(tl);
  g.userData.legs=legs; return g; }
function tMesh(side,role,realm,captain,lane){ const ev=WAR.cur, rg=REGIONS[ev.rg];
  if(role==="ram") return {mesh:tRamMesh(realm)}; if(role==="tower") return {mesh:tTowerMesh(realm)}; if(role==="gate") return {mesh:tGateMesh()};
  let av,name; const look=role==="archer"?{weapon:10}:role==="spear"?{weapon:12}:{};
  if(realm>=0){ const rank=captain?5:role==="cav"?3:role==="healer"?2:rint(1,3); av=(typeof avatarGL==="function"&&avatarGL(realm,rank,look))||makeAvatar(realm,rank,false); const RN={archer:"궁수",spear:"창병",melee:"전사",shield:"방패병",cav:"기병",healer:"치유사"}; name=captain?`${REALMS[realm].n} 대장`:`${REALMS[realm].n} ${RN[role]||"전사"}`; }
  else { const d=pick(REALMS[rg.realm].mobs); av=(typeof mobGL==="function"&&mobGL(d.n,captain?1.3:1))||makeMob(d.shape,d.c,captain?1.3:1); const RN={archer:" 투석꾼",spear:" 창잡이",shield:" 방패꾼",cav:" 돌격대",healer:" 주술사"}; name=captain?"토착 수비대장":d.n+(RN[role]||""); }
  if(captain) av.scale.multiplyScalar(1.25);
  if(role==="shield"){ const sm=mat({color:realm>=0?new THREE.Color(REALMS[realm].c1).multiplyScalar(.8):0x7a5a3a,roughness:.6,metalness:.3}); const s=box(1.2,1.7,.16,sm,.15,1.35,.62); av.add(s); const b=sph(.2,M.gold,.15,1.35,.72); av.add(b); }
  if(role==="healer"){ const st=cyl(.05,.05,2.6,mat({color:0x8a6a4a}),.55,1.3,.2,5); av.add(st); const o=sph(.22,glowMat(0x9dffb8,.95),.55,2.7,.2); o.userData.noOutline=true; av.add(o); }
  if(role==="cav"){ const g=new THREE.Group(); const h=tHorse(realm); g.add(h); av.position.y=1.05; av.scale.multiplyScalar(.92); g.add(av); g.userData.h=(av.userData.h||4.2)+1.2; g.userData.horse=h; return {mesh:g,anim:av,name}; }
  return {mesh:av,anim:av,name}; }
/* ---------- 병사 만들기 ---------- */
function tUnit(side,role,o){ o=o||{}; const ev=WAR.cur, rg=REGIONS[ev.rg]; const realm=side==="att"?ev.att:ev.def; const captain=role==="captain"; const RL=ROLE[role]||ROLE.melee; const lv=Math.round((rg.lv[0]+rg.lv[1])/2)+(captain?3:0); const st=mobStats(lv,false);
  const M0=tMesh(side,role,realm,captain,o.lane); const nm={ram:"공성추",tower:"망루",gate:"성문"}[role]; const name=nm?(realm>=0?`${REALMS[realm].n} ${nm}`:`토착 ${nm}`):M0.name;
  const x=o.x, z=o.z; const u={war:true,side,realm,captain,role,lane:o.lane||0,n:name,mesh:M0.mesh,am:M0.anim||null,x,z,hx:o.hx!=null?o.hx:x,hz:o.hz!=null?o.hz:z,lv,boss:false,hp:Math.round(st.mhp*RL.hp),atk:st.atk*RL.atk,xp:st.xp*2*(captain?4:role==="ram"||role==="gate"||role==="tower"?3:1),gold:st.gold*2*(captain?4:role==="ram"||role==="gate"||role==="tower"?3:1),rg:rg.id,cd:rnd(.3,1.2),jav:role==="spear"?1:0,javT:0,state:"chase",t:99,lbl:makeLabel(captain||nm?"boss":""),rot:o.rot!=null?o.rot:0,hit:0,scale:captain?1.25:1,shape:"war",walk:0,sp:RL.sp*rnd(.92,1.08),
    mode:o.mode||"adv",gx:o.gx,gz:o.gz,holdT:o.holdT||0,path:o.path||null,flag:o.flag,hidden:!!o.hidden,fleeT:0,cmd:null,cmdT:0,charge:role==="cav"?1:0,healT:rnd(1,3),y0:o.y0||0,stat:!!(nm),tac:o.tac||null,hd:o.hd};
  u.mhp=u.hp; if(u.hidden){ u.mesh.visible=false; } u.mesh.position.set(x,hAt(x,z)+u.y0,z); u.mesh.rotation.y=u.rot; scene.add(u.mesh); WAR.units.push(u); if(isEnemy(u)&&!u.hidden) mobs.push(u); return u; }
/* ---------- 전장 준비 ---------- */
function tClearProps(){ TAC.props.forEach(o=>scene.remove(o)); TAC.props=[]; TAC.flags.forEach(f=>{ if(f.lbl) f.lbl.remove(); }); TAC.flags=[]; TAC.gate=null; TAC.ram=null; TAC.towers=[]; TAC.amb=[]; TAC.wallBroken=false; }
function tSetup(ev){ tClearProps(); TAC.ev=ev; const T=warTypeOf(ev); TAC.type=T.id; const A=warAxis(); TAC.g=A.g; TAC.mor={att:100,def:100}; TAC.scare={att:0,def:0}; TAC.ramT=0; TAC.ambT=30; TAC.flagT=0; TAC.waveT=0; TAC.wave=0; TAC.dWave=0; TAC.lastTac=null;
  const g=A.g, add=o=>{ scene.add(shadowify(o)); TAC.props.push(o); return o; };
  if(T.id==="siege"){ const R=TAC.wallR; TAC.gateA=Math.atan2(A.uz,A.ux); const N=78; const sg=new THREE.CylinderGeometry(.32,.38,2.8,6); sg.translate(0,1.4,0); const tg=new THREE.ConeGeometry(.34,.7,6); tg.translate(0,3.15,0);
    const sm=mat({color:0x8a6038,roughness:.95}); const im=new THREE.InstancedMesh(sg,sm,N), it=new THREE.InstancedMesh(tg,sm,N); const dm=new THREE.Object3D(); let n=0;
    for(let k=0;k<N;k++){ const a=k/N*6.283; let da=Math.abs(((a-TAC.gateA+Math.PI*3)%(Math.PI*2))-Math.PI); if(da<.24) continue; const x=g.x+Math.cos(a)*R, z=g.z+Math.sin(a)*R; dm.position.set(x,hAt(x,z)-.2,z); dm.rotation.set(rnd(-.06,.06),0,rnd(-.06,.06)); dm.scale.set(1,rnd(.9,1.12),1); dm.updateMatrix(); im.setMatrixAt(n,dm.matrix); it.setMatrixAt(n,dm.matrix); n++; }
    im.count=n; it.count=n; im.castShadow=it.castShadow=HIGH(); add(im); add(it);
    const gx=g.x+A.ux*R, gz=g.z+A.uz*R; TAC.gate=tUnit("def","gate",{x:gx,z:gz,rot:Math.atan2(A.ux,A.uz),mode:"static"});
    [-1,1].forEach(s=>{ const a=TAC.gateA+s*.55; const x=g.x+Math.cos(a)*(R-2.4), z=g.z+Math.sin(a)*(R-2.4); TAC.towers.push(tUnit("def","tower",{x,z,rot:Math.atan2(A.ux,A.uz),mode:"static"})); }); }
  if(T.id==="flags"){ const pos=[{x:g.x,z:g.z,n:"제단"}]; [1,2].forEach(l=>{ const d=laneDir(l); pos.push({x:g.x+d.x*17,z:g.z+d.z*17,n:l===1?"왼쪽":"오른쪽"}); });
    pos.forEach((p,i)=>{ const f=new THREE.Group(); f.add(cyl(.1,.12,6.5,mat({color:0x5a3a22}),0,3.25,0,6)); const cl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.5),new THREE.MeshLambertMaterial({color:0xcccccc,side:THREE.DoubleSide})); cl.position.set(1.2,5.6,0); f.add(cl);
      const ring=new THREE.Mesh(new THREE.RingGeometry(5.6,6.2,40),glowMat(0xffffff,.45)); ring.rotation.x=-Math.PI/2; ring.position.y=.15; ring.userData.noOutline=true; f.add(ring); f.position.set(p.x+(i===0?3.5:0),hAt(p.x,p.z),p.z+(i===0?3.5:0)); add(f);
      TAC.flags.push({i,x:p.x,z:p.z,n:p.n,p:-1,own:"def",cl,ring,f,lbl:makeLabel("ally"),myT:0}); }); }
  if(T.id==="ambush"){ const sp=[]; [0,1,2].forEach(l=>{ const d=laneDir(l), px=-d.z, pz=d.x; [-1,1].forEach(s=>{ if(l>0&&s===(l===1?1:-1)) return; sp.push({x:g.x+d.x*rnd(16,21)+px*s*rnd(5,7),z:g.z+d.z*rnd(16,21)+pz*s*rnd(5,7)}); }); });
    sp.forEach((p,i)=>{ const b=new THREE.Group(); const lm=[mat({color:0x3f7a3a,roughness:.9}),mat({color:0x2f6a32,roughness:.9}),mat({color:0x4f8a42,roughness:.9})]; for(let k=0;k<7;k++){ const s=sph(rnd(1,1.6),lm[k%3],rnd(-1.8,1.8),rnd(.5,1.2),rnd(-1.4,1.4)); s.scale.y=.75; b.add(s); } b.position.set(p.x,hAt(p.x,p.z),p.z); add(b);
      const grp=[]; ["melee","spear",i%2?"cav":"melee"].forEach((r,k)=>grp.push(tUnit("def",r,{x:p.x+rnd(-1.2,1.2),z:p.z+rnd(-1.2,1.2),hidden:true,mode:"ambush"}))); TAC.amb.push({x:p.x,z:p.z,bush:b,units:grp,sprung:false}); }); }
  if(T.id==="siege") tSay(`${T.ic} ${T.n}`,`${warSides(ev).dn}의 나무 성벽 · 공격대는 🪵 공성추로 성문을 부숴요!`);
  else if(T.id!=="field") tSay(`${T.ic} ${T.n}`,T.d); }
/* ---------- 분대 (작전) ---------- */
function tAttTactic(){ const ev=WAR.cur; TAC.wave++; if(TAC.type==="siege"&&!TAC.wallBroken&&TAC.wave%2===1) return "escort"; if(TAC.type==="flags"&&TAC.wave%2===0) return "flag";
  const L=["charge","pincer","volley","testudo","feint","cavalry"]; let t=L[hh(ev.slot,"tac"+TAC.wave)%L.length]; if(t===TAC.lastTac) t=L[(L.indexOf(t)+1)%L.length]; return t; }
function tSpawnAtt(n){ const ev=WAR.cur, A=warAxis(), g=A.g; const tac=tAttTactic(); TAC.lastTac=tac; TAC.tacA=tac; const W=WTAC[tac];
  const at=(lane,dist,lat)=>{ const d=laneDir(lane), px=-d.z, pz=d.x; return {x:g.x+d.x*dist+px*lat+rnd(-.5,.5),z:g.z+d.z*dist+pz*lat+rnd(-.5,.5),rot:Math.atan2(-d.x,-d.z)}; };
  const goal=(lane,dist,lat)=>{ const d=laneDir(lane), px=-d.z, pz=d.x; return {gx:g.x+d.x*dist+px*(lat||0),gz:g.z+d.z*dist+pz*(lat||0)}; };
  const mk=(role,lane,dist,lat,o)=>{ const p=at(lane,dist,lat); return tUnit("att",role,Object.assign({x:p.x,z:p.z,rot:p.rot,lane,tac},goal(lane,TAC.type==="siege"&&!TAC.wallBroken?TAC.wallR+2.5:3,lat*.6),o||{})); };
  if(tac==="charge"){ ["melee","melee","spear","melee","archer"].slice(0,n).forEach((r,k)=>mk(r,0,33+(r==="archer"?4:0),(k%3-1)*2.4)); }
  else if(tac==="pincer"){ ["melee","spear","cav","melee","spear","cav"].slice(0,Math.max(4,n)).forEach((r,k)=>mk(r,1+(k%2),34,(Math.floor(k/2)%2?1:-1)*1.6)); }
  else if(tac==="volley"){ ["shield","shield","archer","archer","archer","melee"].slice(0,Math.max(5,n)).forEach((r,k)=>mk(r,0,r==="archer"?36:32,(k%3-1)*2.4,{mode:"hold",holdT:7,hd:r==="archer"?17:14})); }
  else if(tac==="testudo"){ ["shield","shield","shield","melee","melee","spear"].slice(0,Math.max(5,n)).forEach((r,k)=>mk(r,0,r==="shield"?32:35,(k%3-1)*1.7,{mode:"testudo"})); }
  else if(tac==="feint"){ ["melee","melee","spear"].forEach((r,k)=>mk(r,0,33,(k-1)*2.4,{mode:"feint"})); [1,2].forEach(l=>mk("cav",l,36,0,{mode:"lurk",holdT:9})); }
  else if(tac==="cavalry"){ [1,2,1].forEach((l,k)=>mk("cav",l,38,k===2?2:0,{mode:"flank"})); mk("melee",0,33,0); }
  else if(tac==="escort"){ if(!TAC.ram||TAC.ram.dead){ if(TAC.ramT<=0){ const p=at(0,36,0); TAC.ram=tUnit("att","ram",{x:p.x,z:p.z,rot:p.rot,mode:"ram"}); TAC.ramT=40; tSay("🪵 공성추가 온다!",WAR.joined&&WAR.side==="def"?"성문에 닿기 전에 부숴요!":"공성추를 지켜서 성문까지!"); } }
    ["shield","shield","melee","spear","archer"].slice(0,Math.max(4,n)).forEach((r,k)=>mk(r,0,34+(r==="archer"?3:0),(k%2?1:-1)*(1.8+Math.floor(k/2)*1.2),{mode:"escort"})); }
  else if(tac==="flag"){ const tf=TAC.flags.filter(f=>f.own!=="att"); const f=tf.length?tf[TAC.wave%tf.length]:TAC.flags[0]; const lane=f.i===0?0:f.i; ["melee","spear","shield","archer"].forEach((r,k)=>mk(r,lane,34,(k%2?1:-1)*1.8,{mode:"flag",flag:f.i})); }
  if(TAC.wave%3===0) mk("healer",0,38,0,{mode:"support"});
  const mine=WAR.joined&&WAR.side==="att"; const near=WAR.joined||Math.hypot(P.x-g.x,P.z-g.z)<70; if(near&&TAC.wave>1) toast(`${W.ic} ${mine?"우리":"적의"} 작전: ${W.n}!`,mine?"작전에 맞춰 함께 싸워요":wTacTip(tac),2.4); }
function wTacTip(t){ return {charge:"정면을 단단히 막아요",pincer:"양옆에서도 와요! 옆을 조심",volley:"화살비가 와요 — 방패병 뒤나 점프로 피해요",testudo:"방패병은 옆이나 뒤가 약해요",feint:"물러나도 쫓아가지 마요! 기병이 숨어 있어요",cavalry:"기병이 궁수를 노려요 — 창병이 기병에 강해요",escort:"공성추를 먼저 부숴요!",flag:"깃발을 지켜요!"}[t]||""; }
function tSpawnDef(n){ const A=warAxis(), g=A.g; const siege=TAC.type==="siege"; const R=siege?TAC.wallR-2.5:9;
  for(let k=0;k<n;k++){ const kk=TAC.dWave++; let role=["shield","archer","melee","spear","archer","shield","healer","cav","melee"][kk%9]; if(role==="cav"&&siege) role="spear";
    let a=Math.atan2(A.uz,A.ux)+((kk%5)-2)*.38; let r=role==="shield"?R:role==="archer"||role==="healer"?R*.45:R*.75; let mode="guard", flag;
    if(TAC.type==="flags"){ const f=TAC.flags[kk%3]; flag=f.i; const d=Math.atan2(f.z-g.z,f.x-g.x); if(f.i>0){ a=d; } mode="flag"; }
    if(role==="cav"){ mode="reserve"; a=Math.atan2(A.uz,A.ux)+Math.PI+(kk%2?.6:-.6); r=6; }
    let hx=g.x+Math.cos(a)*r, hz=g.z+Math.sin(a)*r; if(flag>0){ const f=TAC.flags[flag]; hx=f.x+rnd(-3,3); hz=f.z+rnd(-3,3); }
    const sx=g.x-A.ux*(siege?5:10)+rnd(-3,3), sz=g.z-A.uz*(siege?5:10)+rnd(-3,3); tUnit("def",role,{x:sx,z:sz,hx,hz,gx:hx,gz:hz,mode,flag,rot:Math.atan2(A.ux,A.uz)}); } }
/* ---------- 상성 · 피해 ---------- */
function tMul(a,b){ if(a.role==="spear"&&b.role==="cav") return 2; if(a.role==="cav"&&(b.role==="archer"||b.role==="healer")) return 1.8; if(b.role==="shield"&&a.role==="melee") return .65; if((b.role==="gate"||b.role==="tower")&&a.role!=="ram") return a.role==="archer"?.25:.7; return 1; }
function tFront(b,sx,sz){ const fx=Math.sin(b.rot), fz=Math.cos(b.rot); const dx=sx-b.x, dz=sz-b.z, L=Math.hypot(dx,dz)||1; return (dx*fx+dz*fz)/L>.3; }
function tHitUnit(u,v,dmg){ if(v.dead) return; let k=tMul(u,v); if(u.charge>0&&u.role==="cav"){ k*=2; u.charge=0; fxRing(v.x,v.z,0xffffff,3,.3); if(Math.hypot(v.x-P.x,v.z-P.z)<30) thud(); }
  if(v.cmd==="guard") k*=.6; if(u.cmd==="charge") k*=1.15; const d=dmg*k*rnd(.85,1.15); v.hp-=d; v.hit=.15; fxSpark(v.x,1.6,v.z,0xffffff,4);
  if(k>=1.8&&Math.random()<.4&&Math.hypot(v.x-P.x,v.z-P.z)<35) floatDmg(v.x,4,v.z,"약점!","crit"); if(v.hp<=0) tKill(v,u); }
function tKill(v,by){ if(v.dead) return; unitDie(v); tLost(v); }
function tLost(v){ if(!v||v._lost||!TAC.g) return; v._lost=1; const s=v.side; if(v.captain){ TAC.mor[s]=Math.max(0,TAC.mor[s]-30); tSay("👑 대장이 쓰러졌다!",`${s===WAR.side?"우리 편":"적"}이 흔들려요!`); }
  else if(v.role==="gate"){ TAC.wallBroken=true; TAC.mor.def=Math.max(0,TAC.mor.def-25); tSay("🚪 성문이 부서졌다!",WAR.joined&&WAR.side==="att"?"성 안으로 돌격! (전공 +15)":"성 안을 지켜요!"); if(WAR.joined&&WAR.side==="att"){ WAR.my+=15; } P.shake=Math.max(P.shake||0,.8); WAR.units.forEach(u=>{ if(u.side==="att"&&!u.dead&&!u.stat){ u.mode="adv"; u.gx=TAC.g.x; u.gz=TAC.g.z; } }); }
  else if(v.role==="ram"){ TAC.mor.att=Math.max(0,TAC.mor.att-15); TAC.ramT=30; tSay("🪵 공성추를 부쉈다!",WAR.joined&&WAR.side==="def"?"전공 +10":"다음 공성추를 기다려요"); if(WAR.joined&&WAR.side==="def") WAR.my+=10; }
  else if(v.role==="tower"){ TAC.mor.def=Math.max(0,TAC.mor.def-10); tSay("🗼 망루가 무너졌다!",""); if(WAR.joined&&WAR.side==="att") WAR.my+=6; }
  else TAC.mor[s]=Math.max(0,TAC.mor[s]-2); }
(function(){ const _wk=warOnKill; warOnKill=function(m){ _wk(m); try{ tLost(m); }catch(e){} }; const _ud=unitDie; unitDie=function(u){ _ud(u); try{ tLost(u); }catch(e){} }; })();
function tShoot(u,tg,tPl,kind,mult){ const tx=tPl?P.x:tg.x, tz=tPl?P.z:tg.z; let k=mult||1; if(!tPl&&tg&&tg.role==="shield"&&tFront(tg,u.x,u.z)){ k*=.35; if(Math.random()<.3&&Math.hypot(tg.x-P.x,tg.z-P.z)<30) floatDmg(tg.x,4,tg.z,"🛡 막음!",""); } if(!tPl&&tg) k*=tMul(u,tg)>1?1:tMul(u,tg); if(tPl&&TAC.guardT>0) k*=.6;
  const far=Math.hypot(tx-u.x,tz-u.z); fireProj({x:u.x,z:u.z,y:2.2+(u.y0||0)+(u.role==="tower"?3.4:0),tx:tx+rnd(-.6,.6),tz:tz+rnd(-.6,.6),ty:1.4,kind,speed:kind==="arrow"?30:26,arc:kind==="arrow"?(far>9?.6:.25):.45,dmg:u.atk*(kind==="javelin"?1.8:kind==="rock"?1.4:1.05)*k,r:kind==="javelin"?1.6:1.3,hits:tPl?"player":"units",target:tPl?null:tg,owner:u.n,color:u.side==="att"?0xff8a3d:0x4aa3ff});
  if(Math.hypot(u.x-P.x,u.z-P.z)<40) tone(kind==="arrow"?900:300,.04,"triangle",0,.03); }
/* ---------- 성벽 ---------- */
function tInside(x,z){ return Math.hypot(x-TAC.g.x,z-TAC.g.z)<TAC.wallR; }
function tAtGate(x,z){ const a=Math.atan2(z-TAC.g.z,x-TAC.g.x); const da=Math.abs(((a-TAC.gateA+Math.PI*3)%(Math.PI*2))-Math.PI); return da<.26; }
function tWall(o,inside){ if(TAC.type!=="siege"||!TAC.g) return; const dx=o.x-TAC.g.x, dz=o.z-TAC.g.z, d=Math.hypot(dx,dz)||.01, R=TAC.wallR; if(TAC.wallBroken&&tAtGate(o.x,o.z)) return;
  if(inside&&d>R-.9){ o.x=TAC.g.x+dx/d*(R-.9); o.z=TAC.g.z+dz/d*(R-.9); } else if(!inside&&d<R+.9){ o.x=TAC.g.x+dx/d*(R+.9); o.z=TAC.g.z+dz/d*(R+.9); } }
function tReach(u,v){ if(TAC.type!=="siege"||TAC.wallBroken||u.stat||v.stat&&v.role!=="tower") return true; return tInside(u.x,u.z)===tInside(v.x,v.z); }
/* ---------- 병사 생각하기 (runUnits 를 새로) ---------- */
runUnits=function(dt){ const ev=WAR.cur; if(TAC.ev!==ev||!TAC.g) tSetup(ev); const A=warAxis(), g=A.g; const st=stat(); const siege=TAC.type==="siege";
  TAC.waveT-=dt; TAC.ramT-=dt; if(TAC.waveT<=0){ TAC.waveT=TAC.type==="field"?9:10;
    const nA=WAR.units.filter(u=>u.side==="att"&&!u.dead&&!u.stat).length, capA=8+Math.round(ev.baseAtt/8); if(nA<capA) tSpawnAtt(Math.min(6,capA-nA));
    if(!WAR.capt_att){ const d=laneDir(0); tUnit("att","captain",{x:g.x+d.x*40,z:g.z+d.z*40,rot:Math.atan2(-d.x,-d.z),mode:"captain"}); WAR.capt_att=1; }
    const nD=WAR.units.filter(u=>u.side==="def"&&!u.dead&&!u.stat&&u.mode!=="ambush").length, capD=7+Math.round(ev.baseDef/8); if(nD<capD) tSpawnDef(Math.min(5,capD-nD));
    if(!WAR.capt_def){ tUnit("def","captain",{x:g.x-A.ux*3,z:g.z-A.uz*3,hx:g.x-A.ux*3,hz:g.z-A.uz*3,mode:"guard",rot:Math.atan2(A.ux,A.uz)}); WAR.capt_def=1; } }
  if(TAC.type==="ambush"){ TAC.ambT-=dt; if(TAC.ambT<=0){ TAC.ambT=35; const free=TAC.amb.filter(a=>a.sprung&&a.units.every(u=>u.dead)); if(free.length){ const a=pick(free); a.sprung=false; a.units=["melee","spear","cav"].map(r=>tUnit("def",r,{x:a.x+rnd(-1.2,1.2),z:a.z+rnd(-1.2,1.2),hidden:true,mode:"ambush"})); } }
    TAC.mistT-=dt; if(TAC.mistT<=0&&Math.hypot(P.x-g.x,P.z-g.z)<70){ TAC.mistT=ECO()?.35:.15; fxSpark(P.x+rnd(-20,20),rnd(.3,2.5),P.z+rnd(-20,14),0xdde4ec,3); } }
  // 사기
  ["att","def"].forEach(s=>{ TAC.mor[s]=Math.min(100,TAC.mor[s]+dt*1.2); }); const shaky=s=>TAC.mor[s]<30;
  if(TAC.type==="flags") tFlags(dt);
  TAC.guardT=Math.max(0,(TAC.guardT||0)-dt);
  const live=WAR.units;
  for(let i=live.length-1;i>=0;i--){ const u=live[i]; if(u.dead||u.hp<=0){ if(!u.dead){ unitDie(u); tLost(u); } live.splice(i,1); continue; }
    const RL=ROLE[u.role]||ROLE.melee; u.cd-=dt; u.hit=Math.max(0,u.hit-dt); u.cmdT=Math.max(0,u.cmdT-dt); if(u.cmdT<=0) u.cmd=null; u.fleeT=Math.max(0,u.fleeT-dt); if(u.jav<=0){ u.javT+=dt; if(u.javT>9){ u.jav=1; u.javT=0; } } if(u.role==="cav"&&!u.charge){ u.chT=(u.chT||0)+dt; if(u.chT>6){ u.charge=1; u.chT=0; } }
    if(u.hidden){ // 매복: 적이 가까이 오면 튀어나옴
      let trig=false; for(const v of live){ if(!v.dead&&v.side!==u.side&&Math.hypot(v.x-u.x,v.z-u.z)<9){ trig=true; break; } } if(!trig&&WAR.joined&&WAR.side!==u.side&&Math.hypot(P.x-u.x,P.z-u.z)<8) trig=true;
      if(trig) tSpring(u); else { u.mesh.visible=tMine(u)&&Math.hypot(P.x-u.x,P.z-u.z)<25; if(u.mesh.visible) placeLabel(u.lbl,u.x,4.2,u.z,`<span style="color:#9dffb8">🌿 숨은 우리 편</span>`); else u.lbl.style.display="none"; continue; } }
    // 목표 고르기
    const sight=u.role==="tower"?22:u.role==="archer"?19:u.role==="cav"?24:u.cmd==="charge"?30:u.side==="def"?14:17;
    let tg=null,td=1e9; if(u.role!=="gate"&&u.role!=="ram"&&u.role!=="healer"){ for(const v of live){ if(v.dead||v.side===u.side||v.hidden) continue; let d=Math.hypot(v.x-u.x,v.z-u.z); if(v.role==="gate"){ if(u.side!=="att"||u.role==="archer") continue; d+=8; } if(v.role==="tower"&&u.role!=="archer"&&!tReach(u,v)) d+=6;
        if(u.role==="cav"&&(v.role==="archer"||v.role==="healer")) d*=.55; if(v.role==="ram"&&u.side==="def") d*=.6; if(u.role!=="archer"&&u.role!=="tower"&&v.role!=="gate"&&!tReach(u,v)) continue; if(d<td){ td=d; tg=v; } } }
    let tPl=false; if(WAR.joined&&u.side!==WAR.side&&!P.dead&&u.role!=="gate"&&u.role!=="ram"&&u.role!=="healer"){ const d=Math.hypot(P.x-u.x,P.z-u.z); const ok=u.role==="archer"||u.role==="tower"||TAC.type!=="siege"||TAC.wallBroken||tInside(P.x,P.z)===tInside(u.x,u.z); if(ok&&d<Math.min(td,sight)+1){ td=d; tPl=true; tg=null; } }
    // 성 밖 공격대 근접 병사: 성문을 두드림
    if(siege&&!TAC.wallBroken&&u.side==="att"&&u.role!=="archer"&&!tPl&&(!tg||tg.role==="tower")&&TAC.gate&&!TAC.gate.dead&&(u.mode==="adv"||u.mode==="escort"||u.mode==="testudo")){ const d=Math.hypot(TAC.gate.x-u.x,TAC.gate.z-u.z); if(d<26){ tg=TAC.gate; td=d; } }
    let engage=(tPl||tg)&&td<sight; const tx=tPl?P.x:tg?tg.x:0, tz=tPl?P.z:tg?tg.z:0;
    // 작전/명령에 따른 행동
    let mvx=0,mvz=0,swing=false,face=null,spd=u.sp;
    const goTo=(x,z,stop)=>{ const dx=x-u.x, dz=z-u.z, L=Math.hypot(dx,dz); if(L>(stop||1.2)){ mvx=dx/L; mvz=dz/L; return false; } return true; };
    if(u.fleeT>0){ engage=false; const L=Math.hypot(u.x-g.x,u.z-g.z)||1; const s=u.side==="att"?1:-1; goTo(u.x+(u.x-g.x)/L*10*s+(s<0?(g.x-u.x)/L*10:0),u.z+(u.z-g.z)/L*10*s+(s<0?(g.z-u.z)/L*10:0),.5); spd*=1.1; }
    else if(shaky(u.side)&&!u.stat&&!u.captain&&Math.random()<dt*.25){ u.fleeT=rnd(2.5,4.5); if(Math.hypot(u.x-P.x,u.z-P.z)<35&&Math.random()<.4) floatDmg(u.x,4,u.z,"😨","" ); }
    if(u.cmd==="follow"&&!(engage&&td<8)){ engage=false; const a=(i*1.3)%6.283; goTo(P.x+Math.cos(a)*3.2,P.z+Math.sin(a)*3.2,1); spd*=1.15; }
    else if(u.cmd==="guard"&&!(engage&&td<4)){ engage=engage&&(u.role==="archer"); const a=(i*1.7)%6.283; goTo(P.x+Math.cos(a)*3.4,P.z+Math.sin(a)*3.4,.8); }
    if(u.cmd==="charge") spd*=1.3;
    if(u.fleeT<=0&&u.cmd!=="follow"&&u.cmd!=="guard"){
      if(u.mode==="hold"){ u.holdT-=dt; if(u.holdT<=0){ u.mode="adv"; if(u.role==="archer"&&Math.hypot(P.x-g.x,P.z-g.z)<60&&u.tac==="volley"&&!TAC.vNote){ TAC.vNote=1; setTimeout(()=>TAC.vNote=0,4000); toast("⚔ 이제 앞으로!",null,1); } } else { const hd=u.hd||15; const dl=Math.hypot(u.x-g.x,u.z-g.z); if(dl>hd+.5){ const L=dl||1; mvx=(g.x-u.x)/L; mvz=(g.z-u.z)/L; } if(u.role!=="archer"&&!(engage&&td<6)) engage=false; } }
      if(u.mode==="lurk"){ u.holdT-=dt; const front=live.some(v=>v.side==="att"&&v.tac==="feint"&&v.mode==="feint"&&v.backT>0); if(u.holdT<=0||front){ u.mode="flank"; if(Math.hypot(P.x-g.x,P.z-g.z)<60) toast("🐎 숨어 있던 기병이 튀어나와요!",null,1.6); } else engage=false; }
      if(u.mode==="feint"&&engage&&td<4&&!u.feinted){ u.feinted=true; u.backT=3; }
      if(u.backT>0){ u.backT-=dt; engage=false; const d=laneDir(u.lane); goTo(u.x+d.x*8,u.z+d.z*8,.5); spd*=1.1; if(u.backT<=0) u.mode="adv"; }
      if(u.mode==="testudo"){ const sh=live.filter(v=>v.side==="att"&&v.tac===u.tac&&v.role==="shield"&&!v.dead); spd=Math.min(spd,ROLE.shield.sp); if(u.role!=="shield"&&sh.length){ let cx=0,cz=0; sh.forEach(v=>{ cx+=v.x; cz+=v.z; }); cx/=sh.length; cz/=sh.length; const d=laneDir(u.lane); if(!(engage&&td<4)){ engage=false; goTo(cx+d.x*2.2+rnd(-.2,.2),cz+d.z*2.2,.8); } } if(!sh.length) u.mode="adv"; }
      if(u.mode==="flank"&&!(engage&&td<10)){ engage=false; const d=laneDir(u.lane), px=-d.z, pz=d.x; const s=u.lane===2?-1:1; const wx=g.x-A.ux*6+px*s*8, wz=g.z-A.uz*6+pz*s*8; if(goTo(wx,wz,3)) u.mode="adv"; spd*=1.05; }
      if(u.mode==="escort"&&(!TAC.ram||TAC.ram.dead)) u.mode="adv";
      if(u.mode==="escort"&&TAC.ram&&!TAC.ram.dead&&!(engage&&td<7)){ engage=false; const r=TAC.ram, a=(i*2.1)%6.283; goTo(r.x+Math.cos(a)*3+Math.sin(r.rot)*1.5,r.z+Math.sin(a)*3+Math.cos(r.rot)*1.5,1); spd=Math.max(spd*.6,ROLE.ram.sp+.6); }
      if(u.mode==="flag"&&!(engage&&td<9)){ const f=TAC.flags[u.flag]; if(f){ engage=false; if(u.side==="att"&&f.own==="att"){ const nf=TAC.flags.find(q=>q.own!=="att"); if(nf) u.flag=nf.i; } goTo(f.x+Math.cos(i)*2.5,f.z+Math.sin(i)*2.5,1.2); } }
      if(u.mode==="reserve"){ const foes=live.some(v=>v.side==="att"&&!v.dead&&!v.stat&&Math.hypot(v.x-g.x,v.z-g.z)<15); if(foes){ u.mode="adv"; if(Math.hypot(P.x-g.x,P.z-g.z)<60&&!TAC.rNote){ TAC.rNote=1; setTimeout(()=>TAC.rNote=0,9000); toast(`🐎 ${WAR.joined&&WAR.side==="def"?"우리":"적"} 예비 기병 반격!`,null,1.6); } } else { engage=engage&&td<5; if(!engage) goTo(u.hx,u.hz,1); } }
      if(u.mode==="ram"){ engage=false; const gt=TAC.gate; if(gt&&!gt.dead){ const reach=goTo(gt.x,gt.z,3.3); spd=u.sp; if(reach&&u.cd<=0){ u.cd=2.2; swing=true; gt.hp-=gt.mhp*.06; gt.hit=.2; fxSpark(gt.x,2,gt.z,0xd8b080,16); if(Math.hypot(gt.x-P.x,gt.z-P.z)<50){ thud(); P.shake=Math.max(P.shake||0,.25); } if(gt.hp<=0){ unitDie(gt); tLost(gt); } } } else { u.mode="adv"; goTo(g.x,g.z,2); } face=Math.atan2(mvx||(gt?gt.x-u.x:0),mvz||(gt?gt.z-u.z:1)); }
      if(u.mode==="support"||u.role==="healer"){ engage=false; const al=live.filter(v=>v.side===u.side&&!v.dead&&!v.stat&&v!==u&&!v.hidden); let cx=u.x,cz=u.z; if(al.length){ cx=0;cz=0; al.forEach(v=>{ cx+=v.x; cz+=v.z; }); cx/=al.length; cz/=al.length; } const s=u.side==="att"?1:-1; const L=Math.hypot(cx-g.x,cz-g.z)||1; goTo(cx+(cx-g.x)/L*4*s,cz+(cz-g.z)/L*4*s,1.5);
        u.healT-=dt; if(u.healT<=0){ u.healT=3; let n=0; al.forEach(v=>{ if(n<3&&v.hp<v.mhp*.75&&Math.hypot(v.x-u.x,v.z-u.z)<9){ v.hp=Math.min(v.mhp,v.hp+v.mhp*.22); n++; fxSpark(v.x,2,v.z,0x9dffb8,8); } }); if(tMine(u)&&!P.dead&&Math.hypot(P.x-u.x,P.z-u.z)<9&&P.hp<st.mhp){ P.hp=Math.min(st.mhp,P.hp+st.mhp*.1); n++; fxSpark(P.x,2,P.z,0x9dffb8,10); } if(n){ swing=true; fxRing(u.x,u.z,0x9dffb8,9,.5); } } }
      if(u.mode==="captain"&&!(engage&&td<10)){ engage=false; const al=live.filter(v=>v.side==="att"&&!v.dead&&!v.stat&&!v.captain); if(al.length){ let fx=0,fz=0; al.forEach(v=>{ fx+=v.x; fz+=v.z; }); goTo(fx/al.length+A.ux*6,fz/al.length+A.uz*6,2); } }
      if(u.mode==="guard"&&!(engage&&td<(u.role==="archer"?19:8))){ engage=engage&&u.role==="archer"; if(!engage) goTo(u.hx,u.hz,1); }
      if((u.mode==="adv"||u.mode==="feint"||(u.mode==="testudo"&&u.role==="shield"))&&!engage){ const gx=u.gx!=null?u.gx:g.x, gz=u.gz!=null?u.gz:g.z; if(goTo(gx,gz,1.5)){ u.gx=g.x+rnd(-3,3); u.gz=g.z+rnd(-3,3); } }
    }
    if(u.role==="tower"){ mvx=mvz=0; if(engage&&u.cd<=0&&td<22){ u.cd=rnd(1.6,2.3); swing=true; tShoot(u,tg,tPl,"arrow"); } face=engage?Math.atan2(tx-u.x,tz-u.z):null; if(u.mesh.userData.archer&&face!=null) u.mesh.userData.archer.rotation.y=face-u.mesh.rotation.y; face=null; }
    else if(u.role==="gate"){ mvx=mvz=0; }
    else if(engage){ const dx=tx-u.x, dz=tz-u.z, L=Math.hypot(dx,dz)||.01; face=Math.atan2(dx,dz); const reachD=(tg&&(tg.role==="gate"||tg.role==="ram"||tg.role==="tower"))?3.4:RL.reach;
      if(u.role==="archer"){ if(L<5&&u.mode!=="guard"){ mvx=-dx/L*.8; mvz=-dz/L*.8; } else if(L>RL.range){ mvx=dx/L; mvz=dz/L; } else if(u.cd<=0){ const vol=u.tac==="volley"&&u.mode==="hold"; u.cd=vol?rnd(1.2,1.6):rnd(1.8,2.6); swing=true; tShoot(u,tg,tPl,u.realm>=0?"arrow":"rock"); if(vol&&tg&&!tPl) setTimeout(()=>{ if(!u.dead&&!tg.dead) tShoot(u,tg,false,u.realm>=0?"arrow":"rock"); },220); } }
      else if(u.role==="spear"&&u.jav>0&&L>5&&L<ROLE.spear.throwR){ if(u.cd<=0){ u.cd=rnd(1.2,1.8); u.jav=0; swing=true; tShoot(u,tg,tPl,u.realm>=0?"javelin":"rock"); } }
      else if(L>reachD){ mvx=dx/L; mvz=dz/L; if(u.role==="cav"&&u.charge) spd*=1.25; }
      else if(u.cd<=0){ u.cd=u.role==="cav"?rnd(1.2,1.6):rnd(1.0,1.5); swing=true; if(tPl){ let k=(u.charge&&u.role==="cav")?1.6:1; if(u.role==="cav") u.charge=0; if(TAC.guardT>0) k*=.6; hurtPlayer(u.atk*k*(1-dmgReduce(st.def)),u.n); } else tHitUnit(u,tg,u.atk); } }
    if(u.role==="ram"&&!mvx&&!mvz&&u.mode!=="ram") { const gt=TAC.gate; if(gt&&!gt.dead) u.mode="ram"; }
    const moving=mvx||mvz; if(moving){ const sp=spd*(engage?1:.85); const ox=u.x, oz=u.z; const inside=siege?tInside(u.x,u.z):false; u.x+=mvx*sp*dt; u.z+=mvz*sp*dt; if(face==null) face=Math.atan2(mvx,mvz); if(siege) tWall(u,inside); }
    if(!u.stat) for(const v of live){ if(v===u||v.dead||v.hidden) continue; const rr=v.role==="ram"||v.role==="gate"?3:v.role==="tower"?2.4:v.role==="cav"||u.role==="cav"?2.1:1.7; const ox=u.x-v.x, oz=u.z-v.z, od=Math.hypot(ox,oz); if(od<rr&&od>.001){ const k=v.stat?1:.5; u.x+=ox/od*(rr-od)*k; u.z+=oz/od*(rr-od)*k; } }
    if(face!=null) u.rot=face; let dr=u.rot-u.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; u.mesh.rotation.y+=dr*Math.min(1,dt*(u.role==="ram"?3:10));
    u.mesh.position.set(u.x,hAt(u.x,u.z)+(u.y0||0),u.z); hitTint(u.mesh,u.hit/.15);
    const an=u.am||u.mesh, ud=an.userData; if(u.role==="cav"&&u.mesh.userData.horse){ if(moving) u.walk+=dt*spd*1.6; const lg=u.mesh.userData.horse.userData.legs; const sw=moving?Math.sin(u.walk)*.6:0; lg[0].rotation.x=sw; lg[3].rotation.x=sw; lg[1].rotation.x=-sw; lg[2].rotation.x=-sw; u.mesh.position.y+=moving?Math.abs(Math.sin(u.walk))*.12:0; if(ud.gl) animState(an,swing?"attack":"idle"); }
    else if(u.role==="ram"){ if(moving) u.walk+=dt*3; u.mesh.children.forEach((c,k)=>{ if(k>=1&&k<=4) c.rotation.x=u.walk; }); }
    else if(ud.gl){ animState(an,swing?(u.role==="spear"&&u.jav===0&&u.javT<.1?"skill":"attack"):moving?"run":"idle"); } else if(ud.legL){ if(moving) u.walk+=dt*10; const sw=moving?Math.sin(u.walk)*.7:0; ud.legL.rotation.x=sw; ud.legR.rotation.x=-sw; ud.armL.rotation.x=-sw; ud.armR.rotation.x=swing?-2.2:sw; }
    const dp=Math.hypot(u.x-P.x,u.z-P.z); if(dp<60){ const mine=WAR.joined?(u.side===WAR.side):null; const col=mine===null?(u.side==="att"?"#ffb070":"#8fd0ff"):mine?"#9dffb8":"#ff8d8d"; const h=(u.mesh.userData.h||ud.h||4.6)*u.scale+(u.y0||0); const ic=u.fleeT>0?"😨":u.cmd?({charge:"📯",guard:"🛡",follow:"🚩"}[u.cmd]||RL.ic):RL.ic;
      placeLabel(u.lbl,u.x,h,u.z,`<span style="color:${col}">${u.captain||u.stat?ic+" "+u.n:ic}</span><span class="hp"><i style="width:${Math.max(0,Math.round(u.hp/u.mhp*100))}%;background:${col}"></i></span>`); } else u.lbl.style.display="none"; }
  tTick(dt); };
function tSpring(u){ const a=TAC.amb.find(q=>q.units.indexOf(u)>=0); const grp=a?a.units:[u]; if(a&&a.sprung) { } if(a) a.sprung=true;
  grp.forEach(v=>{ if(v.dead||!v.hidden) return; v.hidden=false; v.mesh.visible=true; v.mode="adv"; v.gx=v.x; v.gz=v.z; v.cd=.2; if(v.role==="cav") v.charge=1; if(isEnemy(v)&&mobs.indexOf(v)<0) mobs.push(v); fxSpark(v.x,1,v.z,0x6aa04a,16); });
  if(a){ fxRing(a.x,a.z,0x9aff7a,7,.5); } const d=Math.hypot(P.x-u.x,P.z-u.z); if(d<45){ toast(WAR.joined&&WAR.side==="def"?"🌿 우리 매복이 튀어나왔어요!":"🌿 매복이다!",WAR.joined&&WAR.side==="def"?"":"덤불 속에 적이 숨어 있었어요",1.8); tone(330,.2,"sawtooth",0,.1); buzz([60,30,60]); if(WAR.joined&&WAR.side==="def"&&d<14) WAR.my+=3; } }
/* ---------- 깃발 ---------- */
function tFlags(dt){ TAC.flagT-=dt; const tick4=TAC.flagT<=0; if(tick4) TAC.flagT=4; const sides=warSides(WAR.cur);
  TAC.flags.forEach(f=>{ let a=0,d=0; WAR.units.forEach(u=>{ if(u.dead||u.hidden||u.stat) return; if(Math.hypot(u.x-f.x,u.z-f.z)<6.2){ if(u.side==="att") a++; else d++; } }); const meNear=WAR.joined&&!P.dead&&Math.hypot(P.x-f.x,P.z-f.z)<6.2; if(meNear){ if(WAR.side==="att") a+=2; else d+=2; }
    const old=f.own; f.p=clamp(f.p+(a-d)*.09*dt,-1,1); if(f.p>=1) f.own="att"; else if(f.p<=-1) f.own="def"; else if(Math.abs(f.p)<.05) f.own="none";
    if(old!==f.own&&f.own!=="none"){ const s=f.own; if(old!=="none") TAC.mor[old]=Math.max(0,TAC.mor[old]-10); tSay(`🚩 ${f.n} 깃발: ${s==="att"?sides.an:sides.dn}!`,meNear&&WAR.side===s?"깃발을 차지했어요! 전공 +5":""); if(meNear&&WAR.side===s) WAR.my+=5; }
    const c=new THREE.Color(sides.ac).lerp(new THREE.Color(sides.dc),(1-f.p)/2); f.cl.material.color.copy(Math.abs(f.p)<.98?c.lerp(new THREE.Color(0xffffff),.35):c); f.ring.material.color.copy(c); f.ring.material.opacity=.3+Math.abs(f.p)*.35; f.cl.rotation.y=Math.sin(performance.now()/300+f.i)*.25;
    if(meNear&&f.own===WAR.side&&tick4){ WAR.my+=1; floatDmg(P.x,4.6,P.z,"🚩 전공 +1","gain"); }
    const dp=Math.hypot(P.x-f.x,P.z-f.z); if(dp<70&&!layerOpen){ const own=f.own==="att"?sides.an:f.own==="def"?sides.dn:"아무도 없음"; placeLabel(f.lbl,f.x+(f.i===0?3.5:0),7.6,f.z+(f.i===0?3.5:0),`🚩 ${f.n} <b>${own}${Math.abs(f.p)<1?` · ${Math.round(Math.abs(f.p)*100)}%`:""}</b>`); } else f.lbl.style.display="none"; }); }
/* ---------- 지휘 버튼 · 전투 정보 띠 ---------- */
const TCMD=[{k:"charge",ic:"📯",n:"돌격",cd:18},{k:"guard",ic:"🛡",n:"방어진",cd:20},{k:"volley",ic:"🏹",n:"일제 사격",cd:15},{k:"follow",ic:"🚩",n:"따라와",cd:12}];
function tCmd(k){ const C=TCMD.find(c=>c.k===k); if(!C||!WAR.joined||P.dead) return; const now=performance.now(); if((TAC.cd[k]||0)>now) return; TAC.cd[k]=now+C.cd*1000;
  const mine=WAR.units.filter(u=>!u.dead&&!u.hidden&&!u.stat&&u.side===WAR.side&&Math.hypot(u.x-P.x,u.z-P.z)<(k==="volley"?42:32));
  if(k==="volley"){ const fx=P.x+Math.sin(P.rot)*12, fz=P.z+Math.cos(P.rot)*12; const foes=WAR.units.filter(u=>!u.dead&&!u.hidden&&u.side!==WAR.side&&u.role!=="gate").sort((a,b)=>Math.hypot(a.x-fx,a.z-fz)-Math.hypot(b.x-fx,b.z-fz)).slice(0,6); const sh=WAR.units.filter(u=>!u.dead&&u.side===WAR.side&&(u.role==="archer"||u.role==="tower")&&Math.hypot(u.x-P.x,u.z-P.z)<42);
    if(!foes.length){ toast("🏹 쏠 적이 없어요"); TAC.cd[k]=now+2000; return; } const shooters=sh.length?sh:[{x:P.x,z:P.z,atk:stat().atk*.3,n:G.name,side:WAR.side,y0:0}]; for(let r=0;r<3;r++) setTimeout(()=>{ shooters.forEach((s,j)=>{ const t=foes[(j+r)%foes.length]; if(!t.dead) tShoot(s,t,false,"arrow",1.3); }); },r*350); toast(`🏹 일제 사격! (궁수 ${sh.length}명)`,null,1.4); }
  else { mine.forEach(u=>{ u.cmd=k; u.cmdT=k==="follow"?12:k==="guard"?10:8; u.fleeT=0; }); if(k==="guard") TAC.guardT=10; toast(`${C.ic} ${C.n}! (우리 편 ${mine.length}명)`,{charge:"8초 동안 빠르고 세게",guard:"10초 동안 내 둘레에서 지켜요 · 받는 피해 -40%",follow:"12초 동안 나를 따라와요"}[k],1.6); if(k==="charge") TAC.mor[WAR.side]=Math.min(100,TAC.mor[WAR.side]+10); }
  try{ WARFX&&tone(196,.25,"sawtooth",0,.08); tone(262,.25,"sawtooth",.15,.08); }catch(e){} fxRing(P.x,P.z,0xffd27a,k==="volley"?6:10,.5); buzz(30); }
function tEl(){ if(TAC.el) return TAC.el; const s=document.createElement("style"); s.textContent=`#wtac{position:fixed;left:50%;transform:translateX(-50%);z-index:6;display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none;font-weight:800;color:#fff;text-shadow:0 1px 0 #000}
#wtac .ti{font-size:12px;background:rgba(20,8,20,.72);border:1px solid rgba(255,200,90,.55);border-radius:10px;padding:2px 10px;white-space:nowrap}#wtac .mo{display:inline-block;width:46px;height:6px;border-radius:3px;background:rgba(255,255,255,.2);vertical-align:middle;margin:0 3px;overflow:hidden}#wtac .mo i{display:block;height:100%}
#wtac .cm{display:flex;gap:5px;pointer-events:auto}#wtac .cm button{font:inherit;font-size:13px;padding:4px 8px;border-radius:12px;border:2px solid #ffd27a;background:linear-gradient(#5a3a10,#2a1808);color:#ffe9b0;min-width:58px;position:relative;overflow:hidden}#wtac .cm button:disabled{opacity:.55;border-color:#888}#wtac .cm button i{position:absolute;left:0;bottom:0;height:3px;background:#ffd27a}
@media (orientation:landscape) and (max-height:540px){ #wtac .cm button{font-size:12px;padding:3px 6px;min-width:50px} }`; document.head.appendChild(s);
  const el=document.createElement("div"); el.id="wtac"; el.hidden=true; el.addEventListener("pointerdown",e=>e.stopPropagation()); el.addEventListener("click",e=>{ const b=e.target.closest("button[data-c]"); if(b) tCmd(b.dataset.c); }); document.body.appendChild(el); TAC.el=el; return el; }
function tTick(dt){ const el=tEl(); const ev=WAR.cur; TAC.uiT=(TAC.uiT||0)-dt; if(TAC.uiT>0) return; TAC.uiT=.25; const bar=$("warbar"); if(!ev||!warActive()||bar.hidden||Date.now()<ev.start){ el.hidden=true; return; }
  const r=bar.getBoundingClientRect(); el.style.top=Math.round(r.bottom+4)+"px"; el.hidden=false; const T=warTypeOf(ev), s=warSides(ev), now=performance.now(); const W=WTAC[TAC.tacA]||WTAC.charge;
  const mo=(k,c)=>`<span class="mo"><i style="width:${Math.round(TAC.mor[k])}%;background:${c}"></i></span>`; let extra="";
  if(TAC.type==="siege"&&TAC.gate) extra=` · 🚪 ${TAC.wallBroken?"부서짐!":Math.max(0,Math.round(TAC.gate.hp/TAC.gate.mhp*100))+"%"}${TAC.ram&&!TAC.ram.dead?` · 🪵 ${Math.round(TAC.ram.hp/TAC.ram.mhp*100)}%`:""}`;
  if(TAC.type==="flags") extra=" · "+TAC.flags.map(f=>`<span style="color:${f.own==="att"?s.ac:f.own==="def"?s.dc:"#ccc"}">🚩</span>`).join("");
  const html=`<div class="ti">${T.ic} ${T.n} · 공격 작전 ${W.ic} ${W.n}${extra}</div><div class="ti">사기 <b style="color:${s.ac}">${s.an}</b>${mo("att",s.ac)} <b style="color:${s.dc}">${s.dn}</b>${mo("def",s.dc)}</div>${WAR.joined?`<div class="cm">${TCMD.map(c=>{ const left=Math.max(0,((TAC.cd[c.k]||0)-now)/1000); return `<button type="button" data-c="${c.k}" ${left>0||P.dead?"disabled":""}>${c.ic} ${left>0?Math.ceil(left)+"초":c.n}${left>0?`<i style="width:${Math.round((1-left/c.cd)*100)}%"></i>`:""}</button>`; }).join("")}</div>`:""}`;
  if(html!==TAC.lastH){ TAC.lastH=html; el.innerHTML=html; } }
document.addEventListener("DOMContentLoaded",()=>XTICK.push(dt=>{ if(!TAC.el) return; if(!warActive()||!WAR.cur||WAR.cur.none){ TAC.el.hidden=true; }
  // 성벽: 나도 못 지나감(부서진 성문 자리만 통과)
  if(TAC.type==="siege"&&TAC.g&&warActive()&&Date.now()>=WAR.cur.start&&Math.abs(Math.hypot(P.x-TAC.g.x,P.z-TAC.g.z)-TAC.wallR)<3){ if(TAC.pIn==null) TAC.pIn=tInside(P.x,P.z); tWall(P,TAC.pIn); TAC.pIn=tInside(P.x,P.z); } else if(TAC.g) TAC.pIn=tInside(P.x,P.z); }));
(function(){ const _cl=cleanupUnits; cleanupUnits=function(){ _cl(); tClearProps(); TAC.ev=null; TAC.g=null; if(TAC.el) TAC.el.hidden=true; };
  const _sp=showWarPrompt; showWarPrompt=function(){ _sp(); try{ const T=warTypeOf(WAR.cur); const h=layers.querySelector(".card h2"); if(h) h.insertAdjacentHTML("afterend",`<p style="font-size:17px;margin:2px 0"><b>${T.ic} ${T.n}</b></p><p style="font-size:13px;margin:0 0 4px">${T.d}<br>참전하면 화면 위 지휘 버튼(📯 돌격 · 🛡 방어진 · 🏹 일제 사격 · 🚩 따라와)으로 우리 편 병사에게 명령할 수 있어요.</p>`); }catch(e){} };
  const _sw=showWarResult; showWarResult=function(won,msg,sc,gold,xp){ _sw(won,msg,sc,gold,xp); try{ const T=warTypeOf(TAC.lastEv||WAR.cur); const h=layers.querySelector(".card h2"); if(h) h.insertAdjacentHTML("afterend",`<p style="font-size:13px;margin:0">${T.ic} ${T.n}</p>`); }catch(e){} };
  const _rw=resolveWar; resolveWar=function(){ TAC.lastEv=WAR.cur; _rw(); };
  const _jw=joinWar; joinWar=function(side){ _jw(side); try{ WAR.units.forEach(u=>{ if(u.hidden){ const i=mobs.indexOf(u); if(i>=0) mobs.splice(i,1); } }); }catch(e){} }; })();
</script>
