<script>
/* ================= v113-2: 🐫 헤르메스 짐수레 호송 — 모두 함께 지키는 세계 길 (IDEAS G11/11-2) =================
   세계의 중심 둘레(반지름 112m) 큰길을 헤르메스의 짐수레가 장터 4곳(동·남·서·북 갈림길)을 돌며 쉬지 않고 굴러감.
   - 아무도 없어도 아기 당나귀가 혼자 끌고 감: 모든 폰이 같은 공식으로 앞으로 계산(마지막 상태 + 흐른 시간).
   - 수레 14m 안에 있는 사람(나+친구)이 많을수록 빨라짐: 1명 ×1.25 … 4명 이상 ×2.
   - 사람이 가까이 있으면 장난꾸러기 「사티로스 도둑」이 짐을 노리고 몰려옴(내 폰에서만 생김) → 수레에 닿으면 짐을 1개씩 훔쳐 달아남.
     달아나기 전에 잡으면 훔친 짐을 되찾음. 짐 20개를 다 빼앗기면 빈 수레로 가고, 다음 수레엔 🛡 경비병 2명이 붙어 도둑이 덜 옴.
   - 사람이 지켜 준 수레가 장터에 닿을 때마다(짐이 남아 있으면) 그 장터가 자라고(Lv), 모두의 배달 수가 늘어 짐수레 시장에 새 물건이 열림(10·30·60번).
   - 그 길을 지킨(25초 넘게 수레 곁에 있던) 사람: 🐫 호송 도장 + 금화·경험치(남은 짐만큼 더).
   공유: 보관 crv/s = {n 도착 수, d 짐 있는 배달 수, tw[4] 장터별 배달, lg 다리, p 진행, w 장터에서 쉬는 남은 초, c 짐, gd 경비, ts, by}
         수레 40m 안의 사람 중 id 가 가장 작은 사람(대장)이 4초마다 올림. 실시간: t:"crs"(훔침) · "crg"(되찾음) → 대장이 반영.
   저장: G.crSt(도장) · G.crT(도장 모은 수) · G.crRw(보상 받은 도착 번호) · G.crK(잡은 도둑) · G.crBack(되찾은 짐) · G.crSeen · G.crS(마지막 상태). 칭호 3개. */
const CR_R=112, CR_SPD=.9, CR_WAIT=45, CR_CAR=20, CR_ESC=14, CR_NEAR=40, CR_LEG=CR_R*Math.PI/2, CR_E0=Date.UTC(2026,10,11,12,0,0);
const CR_TOWN=[{n:"에덴·인도 갈림길 장터",ic:"🌅"},{n:"인도·올림푸스 장터",ic:"🪷"},{n:"올림푸스·아스가르드 장터",ic:"🏛"},{n:"아스가르드·에덴 장터",ic:"❄"}];
const CR_TIER=[0,10,30,60];
const CR={S:null,src:0,pubT:2,t:0,built:false,g:null,lbl:null,wheels:[],crates:[],guards:[],donkey:null,stalls:[],sLbl:[],bandits:[],waveT:6,escT:0,lastEsc:0,mult:1,lead:false,rep:false,repT:8,el:null,arr:null};
function crTheta(S){ return ((S.lg+(S.w>0?0:S.p))%4)*Math.PI/2; }
function crPos(S){ const a=crTheta(S); return {x:Math.cos(a)*CR_R,z:Math.sin(a)*CR_R,a}; }
function crStop(i){ const a=(i%4)*Math.PI/2; return {x:Math.cos(a)*CR_R,z:Math.sin(a)*CR_R}; }
function crInit(){ return {n:0,d:0,tw:[0,0,0,0],lg:0,p:0,w:0,c:CR_CAR,gd:0,ts:CR_E0,by:""}; }
function crClean(d){ if(!d||typeof d!=="object") return null; const S={n:Math.max(0,d.n|0),d:Math.max(0,d.d|0),tw:[0,1,2,3].map(i=>Math.max(0,(d.tw&&d.tw[i])|0)),lg:((d.lg|0)%4+4)%4,p:clamp(+d.p||0,0,1),w:clamp(+d.w||0,0,CR_WAIT),c:clamp(d.c|0,0,CR_CAR),gd:d.gd?1:0,ts:+d.ts||0,by:String(d.by||"").slice(0,40)}; if(!(S.ts>CR_E0-86400000)) return null; return S; }
/* 앞으로 계산: sec 초 동안, 빠르기 mult. 도착하면 onArr(S, 짐 있었나) */
function crAdvance(S,sec,mult,onArr,esc){ sec=Math.min(sec,30*86400); let guard=0;
  while(sec>1e-6&&guard++<100000){
    if(S.w>0){ const u=Math.min(S.w,sec); S.w-=u; sec-=u; if(S.w<=1e-6){ S.w=0; S.p=0; } continue; }
    const v=CR_SPD*(mult||1)/CR_LEG; const need=(1-S.p)/v; if(sec<need){ S.p+=v*sec; sec=0; break; }
    sec-=need; const had=S.c>0; S.lg=(S.lg+1)%4; S.p=0; S.n++; if(had&&esc){ S.d++; S.tw[S.lg]++; }
    if(onArr) try{ onArr(S,had); }catch(e){ console.warn(e); }
    S.gd=had?0:1; S.c=CR_CAR; S.w=CR_WAIT; }
  return S; }
function crData(){ if(!CR.S){ let s=crClean(G.crS)||crInit(); crAdvance(s,(Date.now()-s.ts)/1000,1); s.ts=Date.now(); CR.S=s; } return CR.S; }
/* ---------- 보관 메시지 ---------- */
NETX.push({sub:"crv/s",pre:"crv/",f:d=>{ const S=crClean(d); if(!S) return; if(S.ts<=CR.src) return; if(CR.lead&&S.by&&S.by>G.id&&Date.now()-S.ts<15000) return;
  CR.src=S.ts; const before=CR.S?CR.S.n:null; const sec=(Date.now()-S.ts)/1000; crAdvance(S,Math.max(0,sec),1); S.ts=Date.now(); CR.S=S; if(before!=null&&S.n>before) crArrivedRemote(before,S.n); }});
function crPub(){ const S=crData(); if(!S) return; S.ts=Date.now(); S.by=G.id; try{ net.pushRet("crv/s",S); CR.src=S.ts; }catch(e){} }
NETR.crs=(o,d)=>{ if(!CR.lead) return; const S=crData(); const k=clamp(d.k|0,1,3); S.c=Math.max(0,S.c-k); CR.pubT=Math.min(CR.pubT,.6); };
NETR.crg=(o,d)=>{ if(!CR.lead) return; const S=crData(); const k=clamp(d.k|0,1,3); S.c=Math.min(CR_CAR,S.c+k); CR.pubT=Math.min(CR.pubT,.6); };
/* ---------- 모습 ---------- */
function crBuild(){ if(CR.built) return; CR.built=true;
  const g=new THREE.Group(); const wood=mat({color:0x9a6a3a,roughness:.9}), dk=mat({color:0x5a3a20,roughness:.95}), cloth=mat({color:0x3a8ad8,roughness:.8}), gold=M.gold;
  g.add(box(2.4,.25,3.6,wood,0,1.05,0)); g.add(box(.12,.6,3.6,wood,1.15,1.45,0)); g.add(box(.12,.6,3.6,wood,-1.15,1.45,0)); g.add(box(2.4,.6,.12,wood,0,1.45,-1.75));
  [[1.3,1.1],[-1.3,1.1],[1.3,-1.1],[-1.3,-1.1]].forEach(([x,z])=>{ const w=new THREE.Mesh(new THREE.TorusGeometry(.55,.12,6,14),dk); w.position.set(x,.62,z); w.rotation.y=Math.PI/2; g.add(w); const hub=cyl(.12,.12,.26,gold,x,.62,z,8); hub.rotation.z=Math.PI/2; g.add(hub); CR.wheels.push(w); });
  // 짐(상자·자루) 20개 자리 중 남은 만큼 보임
  const cc=[0xd8a24a,0xc0503a,0x5aa04a,0x8a6ad8,0xe8d8b0];
  for(let i=0;i<CR_CAR;i++){ const lx=i%3, lz=Math.floor(i/3)%4, ly=Math.floor(i/12); const sack=i%4===3; const c=sack?sph(.32,mat({color:0xe8d8b0,roughness:1}),0,0,0):box(.62,.5,.62,mat({color:cc[i%cc.length],roughness:.85}),0,0,0); c.position.set(-.75+lx*.75,1.45+ly*.55+(sack?.05:0),-1.15+lz*.75); g.add(c); CR.crates.push(c); }
  // 날개 깃발(헤르메스)
  g.add(cyl(.06,.06,3,dk,.95,2.6,-1.6,6)); const fl=box(1,.65,.04,cloth,1.45,3.7,-1.6); g.add(fl); CR.flag=fl;
  const wg=mat({color:0xffffff,roughness:.6}); [-1,1].forEach(s=>{ const w=box(.5,.18,.04,wg,1.45+s*.62,3.95,-1.6); w.rotation.z=s*.5; g.add(w); });
  // 손잡이 + 아기 당나귀
  g.add(box(.1,.1,1.8,dk,.45,.95,2.6)); g.add(box(.1,.1,1.8,dk,-.45,.95,2.6));
  const dn=new THREE.Group(); const fur=mat({color:0x9a8a7a,roughness:1}), belly=mat({color:0xe8e0d0,roughness:1}), blk=mat({color:0x2a2420});
  dn.add(box(.9,.8,1.6,fur,0,1.15,0)); dn.add(box(.8,.3,1.3,belly,0,.82,0)); const head=new THREE.Group(); head.add(box(.55,.6,.8,fur,0,0,.2)); head.add(box(.45,.38,.35,belly,0,-.1,.62)); head.add(box(.12,.5,.12,fur,.18,.48,0)); head.add(box(.12,.5,.12,fur,-.18,.48,0)); head.add(sph(.07,blk,.2,.12,.5)); head.add(sph(.07,blk,-.2,.12,.5)); head.position.set(0,1.85,.95); dn.add(head);
  const legs=[]; [[.3,.55],[-.3,.55],[.3,-.55],[-.3,-.55]].forEach(([x,z])=>{ const l=box(.22,.75,.22,fur,x,.38,z); dn.add(l); legs.push(l); }); dn.add(box(.08,.5,.08,blk,0,1.2,-.85)); dn.position.set(0,0,3.6); g.add(dn); CR.donkey={g:dn,head,legs};
  // 경비병 2명(짐을 다 빼앗긴 다음 수레)
  [-1,1].forEach(s=>{ const gu=new THREE.Group(); const bm=mat({color:0xc8a040,metalness:.4,roughness:.4}); gu.add(cyl(.32,.4,1.3,mat({color:0x8a2a2a}),0,.95,0,8)); gu.add(sph(.32,mat({color:0xf0c8a0}),0,1.85,0)); gu.add(cyl(.34,.34,.25,bm,0,2.05,0,10)); gu.add(box(.08,.5,.08,mat({color:0xd84a3a}),0,2.35,0)); const sh=cyl(.5,.5,.1,bm,s*.45,1.1,.2,14); sh.rotation.z=Math.PI/2; gu.add(sh); gu.add(cyl(.04,.04,2.6,dk,-s*.4,1.4,0,6)); gu.position.set(s*2,0,0); gu.visible=false; g.add(gu); CR.guards.push(gu); });
  shadowify(g); g.userData.cullR=-1; scene.add(g); CR.g=g; CR.lbl=makeLabel("");
  // 장터 4곳: 천막 노점 + 이름표
  for(let i=0;i<4;i++){ const p=crStop(i); const a=i*Math.PI/2; const st=new THREE.Group(); const can=[0xe84a4a,0x3a9ae8,0xf2b21a,0x4ab85a][i];
    const ox=Math.cos(a)*7, oz=Math.sin(a)*7; for(let k=0;k<2;k++){ const s2=new THREE.Group(); [[1.2,1],[-1.2,1],[1.2,-1],[-1.2,-1]].forEach(([x,z])=>s2.add(cyl(.07,.07,2.4,dk,x,1.2,z,6))); s2.add(box(2.7,.7,2.3,mat({color:0x9a6a3a}),0,.35,0)); const roof=new THREE.Mesh(new THREE.ConeGeometry(2.1,1,4),mat({color:k?0xfaf6ec:can,roughness:.8})); roof.position.y=2.9; roof.rotation.y=Math.PI/4; s2.add(roof); for(let q=0;q<4;q++) s2.add(box(.42,.36,.42,mat({color:cc[(q+k+i)%cc.length]}),-.8+q*.53,.88,0)); s2.position.set((k?-1:1)*2.4*Math.sin(a),0,(k?1:-1)*2.4*Math.cos(a)); s2.rotation.y=-a; st.add(s2); }
    st.add(cyl(.09,.09,3.2,dk,0,1.6,0,6)); const sg=box(1.6,.6,.08,mat({color:0xf2e2b0}),0,2.9,0); sg.rotation.y=-a+Math.PI/2; st.add(sg);
    st.position.set(p.x+ox,hAt(p.x+ox,p.z+oz),p.z+oz); shadowify(st); scene.add(st); CR.stalls.push(st); CR.sLbl.push(makeLabel("")); } }
function crCrates(c){ CR.crates.forEach((m,i)=>{ m.visible=i<c; }); }
/* ---------- 도둑 ---------- */
function crBandit(){ const S=crData(), q=crPos(S); const fx=-Math.sin(q.a), fz=Math.cos(q.a); const side=Math.random()<.5?-1:1; const ang=side*rnd(.5,1.1); const ca=Math.cos(ang), sa=Math.sin(ang);
  const dx=fx*ca-fz*sa, dz=fx*sa+fz*ca; const x=q.x+dx*rnd(18,24), z=q.z+dz*rnd(18,24);
  const lv=Math.max(1,G.lv); const st=mobStats(lv,false); const mesh=makeMob("satyr",0x9a6a3a,.8);
  const sack=sph(.38,mat({color:0xe8d8b0,roughness:1}),0,1.5,-.45); sack.visible=false; mesh.add(sack); mesh.userData.sack=sack;
  const mask=box(.9,.18,.06,mat({color:0x2a2a3a}),0,2.15,.42); mesh.add(mask);
  const hp=Math.max(40,Math.round(stat().atk*3.4));
  const m={n:"사티로스 도둑",shape:"satyr",mesh,x,z,hx:x,hz:z,lv,boss:false,world:false,hp,mhp:hp,atk:st.atk*.4,xp:Math.round(st.xp*.8),gold:Math.round(st.gold*.8),rg:12,cd:1.2,state:"chase",t:0,lbl:makeLabel(""),rot:0,hit:0,scale:.8,power:0,ev:1,crb:1,carry:0,stealT:0,flee:0,fx:0,fz:0};
  mesh.position.set(x,hAt(x,z),z); mesh.scale.setScalar(.8); scene.add(mesh); mobs.push(m); fxSpark(x,1,z,0x9a6a3a,10); CR.bandits.push(m); return m; }
function crClearBandits(){ for(let i=mobs.length-1;i>=0;i--) if(mobs[i].crb) removeMob(mobs[i]); CR.bandits=[]; }
(function(){ const _km=killMob; killMob=function(m){ const was=m&&m.crb, k=was?m.carry:0, x=m&&m.x, z=m&&m.z; _km(m); if(!was) return; G.crK=(G.crK||0)+1; const i=CR.bandits.indexOf(m); if(i>=0) CR.bandits.splice(i,1);
  if(k>0){ G.crBack=(G.crBack||0)+k; const S=crData(); if(CR.lead){ S.c=Math.min(CR_CAR,S.c+k); CR.pubT=Math.min(CR.pubT,.6); } else { S.c=Math.min(CR_CAR,S.c+k); try{ net.send({t:"crg",k}); }catch(e){} } floatDmg(x,4.4,z,`📦 짐 +${k} 되찾음!`,"gain"); jingle([659,880,1046]); }
  saveGame(); }; })();
function crTickBandits(dt,S,q){ const tn=performance.now(); for(let i=CR.bandits.length-1;i>=0;i--){ const m=CR.bandits[i]; if(mobs.indexOf(m)<0){ CR.bandits.splice(i,1); continue; } const u=m.mesh.userData;
    m.hit=Math.max(0,m.hit-dt); if(m.ctStun>0){ } else if(m.flee>0){ m.flee-=dt; m.x+=m.fx*6.5*dt; m.z+=m.fz*6.5*dt; m.rot=Math.atan2(m.fx,m.fz); if(m.flee<=0){ fxSpark(m.x,1,m.z,0x9a6a3a,10); removeMob(m); CR.bandits.splice(i,1); continue; } }
    else { const dx=q.x-m.x, dz=q.z-m.z, d=Math.hypot(dx,dz); if(d>2.6){ const sp=(S.w>0?3:4.8)*(m.hit>0?.4:1); m.x+=dx/d*sp*dt; m.z+=dz/d*sp*dt; m.rot=Math.atan2(dx,dz); m.state="chase"; }
      else { m.stealT+=dt; m.rot=Math.atan2(dx,dz); if(m.stealT>1.6&&S.c>0){ m.stealT=0; m.carry++; S.c=Math.max(0,S.c-1); u.lunge=.25; floatDmg(q.x,3.4,q.z,"📦 짐 -1","me"); tone(300,.08,"square",0,.06); if(CR.lead) CR.pubT=Math.min(CR.pubT,.6); else try{ net.send({t:"crs",k:1}); }catch(e){}
          if(m.carry>=2||S.c<=0){ const k=d||1; m.fx=-dx/k; m.fz=-dz/k; m.flee=6; if(u.sack) u.sack.visible=true; toast("🐒 도둑이 짐을 들고 달아나요!","달아나기 전에 잡으면 되찾아요",1.4); } } } }
    m.mesh.position.set(m.x,hAt(m.x,m.z)+(u.lunge>0?.35:0)+Math.abs(Math.sin(tn/90+m.x))*.2,m.z); if(u.lunge>0) u.lunge-=dt; let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*10);
    hitTint(m.mesh,m.hit/.15); m.mesh.scale.setScalar(m.scale*(m.hit>0?1.12:1)); try{ HITF.apply(m,dt); }catch(e){}
    if(Math.hypot(P.x-m.x,P.z-m.z)<40) placeLabel(m.lbl,m.x,3.2,m.z,`${m.carry?"💰":"🐒"} 도둑<span class="hp"><i style="width:${Math.round(m.hp/m.mhp*100)}%"></i></span>`); else m.lbl.style.display="none"; } }
/* ---------- 도착 ---------- */
function crArrive(S,had){ const T=CR_TOWN[S.lg]; const near=Math.hypot(P.x-crStop(S.lg).x,P.z-crStop(S.lg).z)<60;
  const esc=CR.escT; CR.escT=0; crClearBandits();
  if(esc>=25&&(G.crRw||0)<S.n){ G.crRw=S.n; const k=had?1+Math.round(2*S.c/CR_CAR):0; const gold=Math.round((40+G.lv*6)*(had?(.5+S.c/CR_CAR):.3)); const xp=Math.round((30+G.lv*10)*(had?1:.4));
    if(k>0){ G.crSt=(G.crSt||0)+k; G.crT=(G.crT||0)+k; } G.gold+=gold; gainXp(xp); saveGame(); CR.arr={T,had,k,gold,c:S.c,n:S.n};
    jingle(had?[523,659,784,1046,1318]:[440,392,349]); buzz([30,30,60]); }
  else if(near&&started){ toast(`🐫 짐수레가 ${T.ic} ${T.n}에 닿았어요!`,had?`짐 ${S.c}/${CR_CAR}개 배달 · 장터가 자라요`:"빈 수레… 다음 수레엔 경비병이 붙어요",2.4); } }
function crArrivedRemote(a,b){ /* 남의 소식으로 도착 수가 올랐을 때 — 보상은 내가 곁에서 지켜본 경우만(crArrive 가 처리), 여긴 도둑 정리만 */ if(CR.escT>=25){ const S=crData(); crArrive(S,S.d>0); } else { CR.escT=0; crClearBandits(); } }
/* ---------- 매 프레임 ---------- */
function crEscorts(q){ let n=0; if(!P.dead&&Math.hypot(P.x-q.x,P.z-q.z)<CR_ESC&&!(typeof glAway==="function"&&glAway())) n++; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&Math.hypot(o.x-q.x,o.z-q.z)<CR_ESC) n++; } return n; }
function crLeader(q){ if(P.dead||Math.hypot(P.x-q.x,P.z-q.z)>CR_NEAR) return false; for(const id in PEERS){ const o=PEERS[id]; if(id<G.id&&Math.hypot(o.x-q.x,o.z-q.z)<CR_NEAR) return false; } return true; }
function crTick(dt){ if(!started||G.realm<0) return; const S=crData(); crBuild();
  let q=crPos(S); const esc=crEscorts(q); CR.lastEsc=esc; CR.mult=1+.25*Math.min(4,esc);
  const n0=S.n; crAdvance(S,dt,S.w>0?1:CR.mult,crArrive,esc>0); S.ts=Date.now(); q=crPos(S);
  const away=typeof glAway==="function"&&glAway(); const myD=Math.hypot(P.x-q.x,P.z-q.z);
  CR.lead=!away&&crLeader(q); if(CR.lead){ CR.pubT-=dt; if(CR.pubT<=0||S.n!==n0){ CR.pubT=4; crPub(); } }
  if(!away&&!P.dead&&myD<CR_ESC&&S.w<=0) CR.escT+=dt;
  // 도둑 무리
  if(!away&&!P.dead&&myD<CR_NEAR&&S.w<=0&&S.c>0){ CR.waveT-=dt; if(CR.waveT<=0){ CR.waveT=S.gd?34:22; const alive=CR.bandits.length; const k=Math.min(6-alive,S.gd?1:Math.min(4,1+esc)); for(let i=0;i<k;i++) crBandit(); if(k>0&&myD<25) toast("🐒 사티로스 도둑이 짐을 노려요!","수레 곁에서 막아요",1.6); } }
  else if(myD>CR_NEAR+30&&CR.bandits.length) crClearBandits();
  crTickBandits(dt,S,q);
  // 모습
  const g=CR.g; if(g){ const vis=!away&&myD<220; g.visible=vis; CR.stalls.forEach(s=>s.visible=!away);
    if(vis){ const y=hAt(q.x,q.z); g.position.set(q.x,y,q.z); const yaw=Math.atan2(-Math.sin(q.a),Math.cos(q.a)); g.rotation.y=yaw; const moving=S.w<=0; const tn=performance.now();
      if(moving){ CR.wheels.forEach(w=>w.rotation.x-=dt*CR_SPD*CR.mult/.55); const sw=Math.sin(tn/(160/CR.mult)); CR.donkey.legs.forEach((l,i)=>l.rotation.x=(i%2?sw:-sw)*.5); CR.donkey.head.rotation.x=Math.sin(tn/300)*.08; }
      else { CR.donkey.legs.forEach(l=>l.rotation.x=0); CR.donkey.head.rotation.x=.25+Math.sin(tn/500)*.1; }
      CR.flag.rotation.y=Math.sin(tn/250)*.25; crCrates(S.c); CR.guards.forEach(gu=>gu.visible=!!S.gd);
      if(myD<70){ placeLabel(CR.lbl,q.x,4.8,q.z,`<b style="color:#ffe08a">🐫 헤르메스 짐수레</b><br>📦 ${S.c}/${CR_CAR}${S.gd?" · 🛡 경비":""}${S.w>0?` · ⏳ ${Math.ceil(S.w)}초 뒤 출발`:esc>0?` · 👥${esc} <b style="color:#9dffb8">×${CR.mult.toFixed(2).replace(/0$/,"")}</b>`:""}`); } else CR.lbl.style.display="none"; }
    else CR.lbl.style.display="none";
    CR.sLbl.forEach((el,i)=>{ const p=crStop(i); if(away||Math.hypot(P.x-p.x,P.z-p.z)>55){ el.style.display="none"; return; } placeLabel(el,p.x+Math.cos(i*Math.PI/2)*7,4.4,p.z+Math.sin(i*Math.PI/2)*7,`${CR_TOWN[i].ic} ${CR_TOWN[i].n} <b>Lv.${crTownLv(S.tw[i])}</b>`); }); }
  // 저장 · 쉬는 동안 소식
  CR.t-=dt; if(CR.t<=0){ CR.t=5; G.crS={n:S.n,d:S.d,tw:S.tw.slice(),lg:S.lg,p:S.p,w:S.w,c:S.c,gd:S.gd,ts:Date.now(),by:S.by}; }
  if(!CR.rep){ CR.repT-=dt; if(CR.repT<=0){ CR.rep=true; const seen=G.crSeen; if(seen!=null&&S.n>seen){ const k=S.n-seen; toast(`🐫 쉬는 동안 짐수레가 장터에 ${k}번 도착했어요`,`모두의 배달 ${S.d}번 · 짐수레 시장이 자라요`,3); } G.crSeen=S.n; } } else G.crSeen=S.n;
  if(CR.arr&&!layerOpen&&!P.dead){ const a=CR.arr; CR.arr=null; toast(`🐫 ${a.T.ic} ${a.T.n}에 무사히 도착!`,a.had?`짐 ${a.c}/${CR_CAR} · 🐫 호송 도장 +${a.k} · 금화 +${fmt(a.gold)}`:`빈 수레였어요 · 금화 +${fmt(a.gold)} · 다음 수레엔 경비병이!`,3); try{ fxRing(P.x,P.z,0xffe08a,6,.6); }catch(e){} } }
XTICK.push(crTick);
function crTownLv(n){ return 1+Math.min(9,Math.floor(Math.sqrt((n||0)/2))); }
/* ---------- 지도 ---------- */
MAP_X.push((ctx,tx,tz,big,u)=>{ if(typeof glAway==="function"&&glAway()) return; const S=crData(); ctx.save(); ctx.setLineDash([4*u,4*u]); ctx.strokeStyle="rgba(200,160,90,.55)"; ctx.lineWidth=1.4*u; ctx.beginPath(); for(let k=0;k<=48;k++){ const a=k/48*6.2832; const X=tx(Math.cos(a)*CR_R), Z=tz(Math.sin(a)*CR_R); if(k) ctx.lineTo(X,Z); else ctx.moveTo(X,Z); } ctx.stroke(); ctx.restore();
  if(big) for(let i=0;i<4;i++){ const p=crStop(i); ctx.beginPath(); ctx.arc(tx(p.x),tz(p.z),2.6*u,0,6.2832); ctx.fillStyle="#f2b21a"; ctx.fill(); }
  const q=crPos(S); mapPin(ctx,tx(q.x),tz(q.z),(big?6:7.5)*u,"#c08a3a","🐫"); });
/* ---------- 창 ---------- */
const CR_DECO=DECO.length;
DECO.push({n:"헤르메스 짐수레 모형",ic:"🐫",t:2,sc:12,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); const w=mat({color:0x9a6a3a}); g.add(box(1.4,.18,2,w,0,.6,0)); [[.75,.6],[-.75,.6],[.75,-.6],[-.75,-.6]].forEach(([x,z])=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(.32,.08,6,12),mat({color:0x5a3a20})); t.position.set(x,.36,z); t.rotation.y=Math.PI/2; g.add(t); }); [0xd8a24a,0xc0503a,0x5aa04a].forEach((c,i)=>g.add(box(.42,.36,.42,mat({color:c}),-.45+i*.45,.88,0))); g.add(cyl(.04,.04,1.6,mat({color:0x5a3a20}),.55,1.3,-.8,6)); g.add(box(.6,.4,.03,mat({color:0x3a8ad8}),.85,1.9,-.8)); return g; }},
 {n:"날개 달린 이정표",ic:"🪧",t:3,sc:16,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.12,.15,3,mat({color:0x8a6040}),0,1.5,0,8)); [0,1,2].forEach(k=>{ const b=box(1.5,.38,.08,mat({color:[0xf2e2b0,0xe8c890,0xf2e2b0][k]}),.5-k*.3,2.6-k*.55,0); b.rotation.y=k*.9; g.add(b); }); [-1,1].forEach(s=>{ const wg=box(.7,.22,.04,mat({color:0xffffff}),s*.4,3.15,0); wg.rotation.z=s*.5; g.add(wg); }); g.add(sph(.18,M.gold,0,3.1,0)); return g; }});
const CR_SHOP=[{n:"물약 3개",ic:"🧪",c:2,t:0,f:()=>{ G.pots+=3; }},{n:"쇳조각 5개",ic:"⛓",c:3,t:0,f:()=>{ G.ore=(G.ore||0)+5; }},{n:"금화 꾸러미",ic:"💰",c:2,t:0,f:()=>{ G.gold+=150+G.lv*20; }},
 {n:"무기 뽑기권 1장",ic:"🎟",c:8,t:1,f:()=>{ try{ gz().tk++; }catch(e){} }},{n:"룬 가루 2개",ic:"✨",c:4,t:1,f:()=>{ G.rune=(G.rune||0)+2; }},
 {n:"신전 장식 «헤르메스 짐수레 모형»",ic:"🐫",c:15,t:2,f:()=>{ hmAdd(CR_DECO); }},{n:"신전 장식 «날개 달린 이정표»",ic:"🪧",c:25,t:3,f:()=>{ hmAdd(CR_DECO+1); }}];
function crTier(){ const d=crData().d; let t=0; CR_TIER.forEach((v,i)=>{ if(d>=v) t=i; }); return t; }
function crGo(){ if(P.dead||P.trial){ toast("지금은 갈 수 없어요"); return; } if(typeof glAway==="function"&&glAway()){ toast("지금 있는 곳에서 먼저 나와요"); return; } if(mobs.some(m=>m.state==="chase"&&!m.crb&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  const q=crPos(crData()); closeLayer(); P.x=q.x+Math.cos(q.a)*4; P.z=q.z+Math.sin(q.a)*4; P.y=0; P.vy=0; P.invul=Math.max(P.invul||0,1.5); fxRing(P.x,P.z,0xffe08a,6,.7); fxSpark(P.x,2,P.z,0xffe08a,26); jingle([523,784,1046]); toast("🐫 짐수레 곁에 왔어요!","도둑이 오면 막아 줘요 · 사람이 많을수록 빨라져요",2.4); }
function showCaravan(){ const S=crData(), q=crPos(S), T=crTier(); const at=S.w>0?CR_TOWN[S.lg]:null, nx=CR_TOWN[(S.lg+1)%4]; const left=S.w>0?null:Math.round((1-S.p)*CR_LEG/(CR_SPD*CR.mult)); const myD=Math.round(Math.hypot(P.x-q.x,P.z-q.z));
  card(`<h2>🐫 헤르메스 짐수레</h2><p>세계의 중심 둘레 큰길을 짐수레가 장터 4곳을 돌며 <b>쉬지 않고</b> 굴러가요(아무도 없어도 아기 당나귀가 혼자 끌어요). 곁에 사람이 많을수록 빨라지고, <b>🐒 사티로스 도둑</b>이 짐을 노려요!</p>
   <div class="idlegrid"><div><b>${at?`${at.ic} 쉬는 중`:`${nx.ic} 가는 중`}</b><span>${at?`${at.n} · ${Math.ceil(S.w)}초 뒤 출발`:`${nx.n}까지 약 ${Math.floor(left/60)}분 ${left%60}초`}</span></div><div><b>📦 ${S.c}/${CR_CAR}</b><span>남은 짐${S.gd?" · 🛡 경비병":""}</span></div><div><b>${myD}m</b><span>나와 수레 거리</span></div></div>
   <div class="idlegrid"><div><b>${S.d}</b><span>모두의 배달</span></div><div><b>🐫 ${G.crSt||0}</b><span>내 호송 도장</span></div><div><b>${G.crK||0}</b><span>잡은 도둑</span></div></div>
   <button class="go" id="crGoB" style="align-self:center">🌀 짐수레 곁으로 가기</button>
   <h3>🏪 장터</h3>${CR_TOWN.map((t,i)=>`<div class="row"><div class="ic">${t.ic}</div><div class="t"><div>${t.n} <b>Lv.${crTownLv(S.tw[i])}</b></div><span>배달 ${S.tw[i]}번</span></div></div>`).join("")}
   <h3>🛒 짐수레 시장 (🐫 도장으로 사요)</h3>
   ${CR_SHOP.map((it,i)=>{ const lock=it.t>T; return `<div class="row"${lock?' style="opacity:.55"':""}><div class="ic">${it.ic}</div><div class="t"><div>${it.n}</div><span>${lock?`🔒 모두 함께 ${CR_TIER[it.t]}번 배달하면 열려요`:`🐫 ${it.c}개`}</span></div>${lock?"":`<button class="buy" data-cs="${i}" ${(G.crSt||0)<it.c?"disabled":""}>사기</button>`}</div>`; }).join("")}
   <p style="font-size:12px">수레 곁(14m)에 25초 넘게 있다가 장터에 닿으면 🐫 호송 도장 + 금화·경험치(짐이 많이 남을수록 더). 달아나는 도둑을 잡으면 짐을 되찾아요!</p>`);
  $("crGoB").onclick=crGo;
  layers.querySelectorAll("[data-cs]").forEach(b=>b.onclick=()=>{ const it=CR_SHOP[+b.dataset.cs]; if((G.crSt||0)<it.c) return; G.crSt-=it.c; it.f(); saveGame(); jingle([659,880]); toast(`🐫 ${it.ic} ${it.n}`,`도장 −${it.c}`,1.6); showCaravan(); }); }
MENU_X.push({ic:"🐫",n:"헤르메스 짐수레",id:"crBtn",sub:()=>{ const S=crData(); return S.w>0?`${CR_TOWN[S.lg].ic} 장터에서 쉬는 중 · 📦 ${S.c}`:`${CR_TOWN[(S.lg+1)%4].ic} 가는 중 · 📦 ${S.c}/${CR_CAR}${CR.lastEsc?` · 👥${CR.lastEsc}`:""}`; },f:showCaravan});
TITLES.push({id:"cr1",n:"짐수레 지킴이",t:1,h:"🐫 호송 도장 10개 모으기",g:()=>[G.crT||0,10]},{id:"cr2",n:"도둑 잡는 사람",t:2,h:"사티로스 도둑 50마리",g:()=>[G.crK||0,50]},{id:"cr3",n:"헤르메스의 단짝",t:3,h:"🐫 호송 도장 100개 모으기",g:()=>[G.crT||0,100]});
</script>
