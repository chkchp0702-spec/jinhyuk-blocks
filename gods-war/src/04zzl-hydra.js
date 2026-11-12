<script>
/* ================= v118-3: 🐍 레르나 늪의 히드라 — 자르는 사람·지지는 사람이 함께 잡는 레이드 (IDEAS G11/12-3) =================
   메뉴 🐍 → 지도 밖(x≈-380, z≈0) 레르나 늪. 가운데 머리 아홉 개 히드라.
   - 머리를 베면(그 머리 체력 0) 목만 남고(「잘린 목」), 5초 안에 🔥 횃불 든 사람이 그 목을 지지면 영영 없어짐.
     못 지지면 그 자리에 머리가 다시 자라고 + 빈자리에 하나 더(머리가 두 개로!) → 최대 18개.
   - 🔥 횃불: 늪 가장자리 횃불대 4곳에서 「횃불 들기」. 횃불을 들고 잘린 목 곁에서 공격 버튼(또는 「목 지지기」)을 누르면 지짐.
   - 머리를 다 없애면 가운데 「👑 불멸의 머리」가 솟아요. 모두의 공격을 합쳐서 쓰러뜨림(같은 2초 안에 둘 이상 때리면 「함께 공격 ×1.6」). 쓰러지면 큰 바위에 묻힘 → 1분 뒤 새 히드라.
   - 머리가 물기 전에 땅에 빨간 원 → 점프·옆으로 피하기. 불멸의 머리는 넓은 초록 독 숨결 원.
   - 함께 쓰는 상태(보관 hyd/s): {e 히드라 번호, sl[18] 0 빈·1 머리·2 잘린 목·3 지진 목, st[18] 잘린 시각, ih 불멸 머리(0 없음·1 있음), w 다음 히드라 시각, ts, by}
     잘린 목이 5초 지나면 모든 폰이 같은 규칙으로 다시 자라게 계산(아무도 없어도 히드라는 머리를 다시 키움).
     실시간: hyc(벰) · hyb(지짐) · hyi(불멸 머리 데미지 비율) · hyw(쓰러뜨림) · hyp(횃불 들었나)
   - 보상: 쓰러뜨릴 때 늪 안에서 싸운 사람 모두 🐍 히드라 비늘 + 금화·경험치. 하루 첫 승리 비늘 +5. 매일 저녁 8~9시 「늪의 밤」 비늘 ×2.
     비늘 가게: 물약·룬 가루·무기 뽑기권·신전 장식 «히드라 비늘 방패».
   저장: G.hyScale · G.hyWin · G.hyCut · G.hyBurn · G.hyDay(하루 첫 승리) · G.hyS(마지막 상태) */
const HYX=-380, HYZ=0, HY_R=40, HY_BODY=3.6, HY_NR=6.2, HY_N=18, HY_GROW=5, HY_RESP=60, HY_E0=Date.UTC(2026,10,12,0,0,0);
const HY_TORCH=[0,1,2,3].map(i=>{ const a=i*Math.PI/2+Math.PI/4; return {x:HYX+Math.cos(a)*30,z:HYZ+Math.sin(a)*30}; });
const HY={on:false,built:false,parts:[],S:null,src:0,pubT:2,t:0,heads:{},necks:[],torch:false,torchMesh:null,peerT:{},peerTorch:{},imm:null,immHits:{},warn:[],biteT:3,breathT:6,fought:false,lbl:[],hpT:0,hbT:0,boulder:null,repT:0,rewE:-1,ringGeo:null};
function hyIn(x,z){ return Math.abs(x-HYX)<150&&Math.abs(z-HYZ)<150; }
(function(){ const _h=hAt; hAt=function(x,z){ return hyIn(x,z)?0:_h(x,z); }; })();
function hySlotPos(k){ const a=k<9?k*(Math.PI*2/9):(k-9+.5)*(Math.PI*2/9); return {x:HYX+Math.cos(a)*HY_NR,z:HYZ+Math.sin(a)*HY_NR,a}; }
function hyInit(e){ const sl=[]; const st=[]; for(let k=0;k<HY_N;k++){ sl.push(k<9?1:0); st.push(0); } return {e:e||1,sl,st,ih:0,w:0,ts:Date.now(),by:""}; }
function hyClean(d){ if(!d||typeof d!=="object"||!Array.isArray(d.sl)||!Array.isArray(d.st)) return null; const S={e:Math.max(1,d.e|0),sl:[],st:[],ih:d.ih?1:0,w:+d.w||0,ts:+d.ts||0,by:String(d.by||"").slice(0,40)}; for(let k=0;k<HY_N;k++){ S.sl.push(clamp(d.sl[k]|0,0,3)); S.st.push(+d.st[k]||0); } if(!(S.ts>HY_E0)) return null; return S; }
/* 규칙: 잘린 목이 5초 지나면 다시 자람(+빈자리 하나 더) · 머리가 다 없어지면 불멸의 머리 · 쉬는 시간이 끝나면 새 히드라 */
function hyRules(S,now){ let ch=false;
  if(S.w>0){ if(now>=S.w){ const n=hyInit(S.e); S.sl=n.sl; S.st=n.st; S.ih=0; S.w=0; ch=true; } return ch; }
  for(let k=0;k<HY_N;k++){ if(S.sl[k]===2&&now-S.st[k]>=HY_GROW*1000){ S.sl[k]=1; S.st[k]=0; ch=true; const order=[...Array(HY_N).keys()].map(i=>(k+1+i)%HY_N); const f=order.find(i=>S.sl[i]===0); if(f!=null){ S.sl[f]=1; S.st[f]=0; } } }
  if(!S.ih&&!S.sl.some(v=>v===1||v===2)){ S.ih=1; ch=true; }
  return ch; }
function hyData(){ if(!HY.S){ HY.S=hyClean(G.hyS)||hyInit(1); hyRules(HY.S,Date.now()); } return HY.S; }
/* ---------- 보관 · 실시간 ---------- */
NETX.push({sub:"hyd/s",pre:"hyd/",f:d=>{ const S=hyClean(d); if(!S) return; const cur=hyData(); if(S.e<cur.e) return; if(S.e===cur.e&&S.ts<=HY.src) return; if(S.e===cur.e&&HY.on&&hyLeader()&&S.by>G.id&&Date.now()-S.ts<10000) return;
  HY.src=S.ts; const wasImm=cur.ih; if(S.e>cur.e){ hyClearHeads(); hyImmDrop(); } HY.S=S; hyRules(S,Date.now()); if(HY.on&&S.ih&&!wasImm) hyImmUp(); }});
function hyPub(){ const S=hyData(); S.ts=Date.now(); S.by=G.id; try{ net.pushRet("hyd/s",S); HY.src=S.ts; }catch(e){} }
NETR.hyc=(o,d)=>{ const S=hyData(); if((d.e|0)!==S.e) return; const k=d.k|0; if(k<0||k>=HY_N) return; if(S.sl[k]===1){ S.sl[k]=2; S.st[k]=Math.min(Date.now(),+d.ts||Date.now()); hyRemoveHead(k,true); } };
NETR.hyb=(o,d)=>{ const S=hyData(); if((d.e|0)!==S.e) return; const k=d.k|0; if(k<0||k>=HY_N) return; if(S.sl[k]===2){ S.sl[k]=3; if(HY.on){ const p=hySlotPos(k); fxSpark(p.x,1.4,p.z,0xff8a20,18); } } };
NETR.hyi=(o,d)=>{ const S=hyData(); if((d.e|0)!==S.e||!HY.imm) return; const f=clamp(+d.f||0,0,.2); HY.immHits[o.id]=performance.now(); const m=HY.imm; if(m.hp>0){ m.hp-=f*m.mhp; m.hit=.1; if(m.hp<=0){ m.hp=1; } } };
NETR.hyw=(o,d)=>{ const S=hyData(); if((d.e|0)!==S.e) return; hyWin(false); };
NETR.hyp=(o,d)=>{ HY.peerT[o.id]=d.tc?performance.now():0; };
function hyLeader(){ if(!HY.on) return false; for(const id in PEERS){ const o=PEERS[id]; if(id<G.id&&hyIn(o.x,o.z)) return false; } return true; }
/* ---------- 늪 만들기 ---------- */
function hyBuild(){ if(HY.built) return; HY.built=true; const add=o=>{ scene.add(o); HY.parts.push(o); return o; };
  const mud=mat({color:0x5a5a3a,roughness:1}), moss=mat({color:0x4a7a3a,roughness:1}), water=mat({color:0x3a6a5a,roughness:.3,metalness:.1,transparent:true,opacity:.85}), rock=mat({color:0x6a6a60,roughness:.95}), reed=mat({color:0x7a9a4a,roughness:.9}), wood=mat({color:0x5a3a20,roughness:.95});
  const G0=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CircleGeometry(HY_R+8,64),mud); base.rotation.x=-Math.PI/2; base.position.set(HYX,-.02,HYZ); G0.add(base);
  const pool=new THREE.Mesh(new THREE.CircleGeometry(HY_BODY+3.5,40),water); pool.rotation.x=-Math.PI/2; pool.position.set(HYX,.02,HYZ); G0.add(pool);
  const r=hsRng(4242); for(let k=0;k<26;k++){ const a=r()*6.283, d=12+r()*(HY_R-14); const x=HYX+Math.cos(a)*d, z=HYZ+Math.sin(a)*d; if(HY_TORCH.some(t=>Math.hypot(t.x-x,t.z-z)<5)) continue; if(r()<.5){ const p=new THREE.Mesh(new THREE.CircleGeometry(1.5+r()*2.5,20),water); p.rotation.x=-Math.PI/2; p.position.set(x,.015,z); G0.add(p); } else { for(let q=0;q<5;q++){ const rd=cyl(.05,.07,1.6+r()*1.4,reed,x+r()*1.4-.7,.9,z+r()*1.4-.7,5); rd.rotation.z=(r()-.5)*.3; G0.add(rd); } } }
  for(let k=0;k<22;k++){ const a=k/22*6.283; const x=HYX+Math.cos(a)*(HY_R+3), z=HYZ+Math.sin(a)*(HY_R+3); if(Math.abs(Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2)))<.2) continue; const s=2+((k*7)%5)*.5; const rk=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),rock); rk.position.set(x,s*.5,z); rk.rotation.set(k,k*2,0); G0.add(rk); const tr=new THREE.Group(); tr.add(cyl(.3,.45,5,wood,0,2.5,0,7)); const cr=sph(2.2,moss,0,5.6,0); cr.scale.y=.7; tr.add(cr); tr.position.set(HYX+Math.cos(a+.13)*(HY_R+6),0,HYZ+Math.sin(a+.13)*(HY_R+6)); G0.add(tr); }
  // 히드라 몸통(가운데)
  const sk=mat({color:0x3a7a4a,roughness:.7}), sk2=mat({color:0x8ac070,roughness:.7});
  const body=new THREE.Group(); const b0=sph(HY_BODY,sk,0,1.2,0); b0.scale.y=.6; body.add(b0); const bl=sph(HY_BODY*.75,sk2,0,.9,HY_BODY*.35); bl.scale.set(1,.45,.6); body.add(bl);
  for(let k=0;k<10;k++){ const a=k/10*6.283; const sp=new THREE.Mesh(new THREE.ConeGeometry(.35,1.1,5),mat({color:0x2a5a3a})); sp.position.set(Math.cos(a)*HY_BODY*.55,2.9,Math.sin(a)*HY_BODY*.55); sp.rotation.z=Math.cos(a)*.4; sp.rotation.x=-Math.sin(a)*.4; body.add(sp); }
  const tail=cyl(.9,.2,7,sk,0,.6,-HY_BODY-2.6,8); tail.rotation.x=Math.PI/2; body.add(tail);
  body.position.set(HYX,0,HYZ); G0.add(body); HY.body=body;
  // 횃불대
  HY_TORCH.forEach(t=>{ const g=new THREE.Group(); g.add(cyl(.18,.25,2.4,wood,0,1.2,0,7)); g.add(cyl(.45,.3,.4,mat({color:0x3a3a3a}),0,2.5,0,8)); const f=sph(.45,glowMat(0xff8a20,.9),0,2.95,0); f.userData.noOutline=true; g.add(f); const f2=sph(.28,glowMat(0xffe060,.95),0,3.2,0); f2.userData.noOutline=true; g.add(f2); for(let q=0;q<4;q++) g.add(box(.08,1,.08,wood,Math.cos(q*1.57)*.6,.5,Math.sin(q*1.57)*.6)); g.position.set(t.x,0,t.z); G0.add(g); t.f=f; t.f2=f2; });
  add(shadowify(G0));
  { const g=pgArch(false); g.position.set(HYX,0,HYZ+HY_R-1.2); add(shadowify(g)); HY.exitArch={x:HYX,z:HYZ+HY_R-2}; }
  // 목 18개 (모양은 미리 만들어 두고 상태에 따라 보이기)
  for(let k=0;k<HY_N;k++){ const p=hySlotPos(k); const ng=new THREE.Group(); const segs=[]; for(let q=0;q<6;q++){ const s=sph(.62-q*.05,q%2?sk2:sk,0,0,0); ng.add(s); segs.push(s); }
    const stump=new THREE.Group(); stump.add(cyl(.62,.7,1.2,sk,0,.6,0,10)); const cut=new THREE.Mesh(new THREE.CircleGeometry(.6,14),mat({color:0xd84a3a,emissive:0x501010})); cut.rotation.x=-Math.PI/2; cut.position.y=1.22; stump.add(cut); const glow=new THREE.Mesh(new THREE.RingGeometry(.7,1.2,20),glowMat(0xff6a30,.7)); glow.rotation.x=-Math.PI/2; glow.position.y=1.25; glow.userData.noOutline=true; stump.add(glow);
    const burnt=new THREE.Group(); burnt.add(cyl(.55,.7,.9,mat({color:0x2a2420,roughness:1}),0,.45,0,10)); const ash=new THREE.Mesh(new THREE.CircleGeometry(.55,14),mat({color:0x5a5048})); ash.rotation.x=-Math.PI/2; ash.position.y=.92; burnt.add(ash);
    const bx=HYX+Math.cos(p.a)*HY_BODY*.7, bz=HYZ+Math.sin(p.a)*HY_BODY*.7; stump.position.set(bx,0,bz); burnt.position.set(bx,0,bz); ng.visible=stump.visible=burnt.visible=false; add(ng); add(shadowify(stump)); add(burnt);
    HY.necks.push({ng,segs,stump,glow,cut,burnt,bx,bz,p,ph:k*1.7}); HY.lbl.push(makeLabel("")); }
  HY.ringGeo=new THREE.RingGeometry(.85,1,32); }
function hyShow(v){ HY.parts.forEach(o=>{ if(o!==undefined) o.visible=v; }); if(v) hyNecksDraw(0); }
/* ---------- 머리 ---------- */
function hyHeadMesh(big){ const g=new THREE.Group(); const sk=mat({color:big?0x6a4a9a:0x3a8a4a,roughness:.6}), sk2=mat({color:big?0xd8b0ff:0x9ad07a,roughness:.7}), ey=mat({color:0xffe040,emissive:0x806000}), th=mat({color:0xfff8e8}), red=mat({color:0xd8303a});
  const s=big?2.2:1; const hd=box(1.1*s,.8*s,1.6*s,sk,0,0,.2*s); g.add(hd); const jaw=box(1*s,.25*s,1.3*s,sk2,0,-.45*s,.35*s); g.add(jaw);
  [-1,1].forEach(q=>{ g.add(sph(.16*s,ey,q*.38*s,.25*s,.75*s)); g.add(sph(.07*s,mat({color:0x1a1a1a}),q*.38*s,.27*s,.86*s)); const hn=new THREE.Mesh(new THREE.ConeGeometry(.12*s,.6*s,5),sk2); hn.position.set(q*.35*s,.6*s,-.2*s); hn.rotation.x=-.6; g.add(hn); for(let t=0;t<3;t++){ const tt=new THREE.Mesh(new THREE.ConeGeometry(.06*s,.2*s,4),th); tt.position.set(q*.3*s,-.25*s,(.5+t*.22)*s); tt.rotation.x=Math.PI; g.add(tt); } });
  const tg=box(.12*s,.05*s,.6*s,red,0,-.35*s,1.1*s); g.add(tg); if(big){ const cr=new THREE.Group(); for(let q=0;q<5;q++){ const c=new THREE.Mesh(new THREE.ConeGeometry(.22,.7,4),M.gold); c.position.set((q-2)*.42,0,0); cr.add(c); } cr.position.set(0,1.25*s*.6+.4,0); g.add(cr); }
  g.userData={h:big?6:2.2,jaw,tg}; shadowify(g); return g; }
function hyMakeHead(k){ const st=stat(); const lv=Math.max(1,G.lv); const ms=mobStats(lv,false); const hp=Math.max(60,Math.round(st.atk*7)); const mesh=hyHeadMesh(false); const p=hySlotPos(k);
  const m={n:"히드라 머리",shape:"hydra",mesh,x:p.x,z:p.z,hx:p.x,hz:p.z,lv,boss:false,world:false,hp,mhp:hp,atk:ms.atk*.6,xp:Math.round(ms.xp*.6),gold:Math.round(ms.gold*.6),rg:12,cd:2,state:"chase",t:0,lbl:makeLabel(""),rot:0,hit:0,scale:1,power:0,ev:1,hyd:1,slot:k,e:hyData().e,bite:rnd(2,5),y:4};
  mesh.position.set(p.x,4,p.z); scene.add(mesh); mobs.push(m); HY.heads[k]=m; return m; }
function hyRemoveHead(k,anim){ const m=HY.heads[k]; if(!m) return; delete HY.heads[k]; if(mobs.indexOf(m)<0) return; if(anim){ try{ fxSpark(m.x,m.y,m.z,0x9ad07a,16); }catch(e){} } removeMob(m); }
function hyClearHeads(){ for(const k in HY.heads) hyRemoveHead(+k,false); }
function hyImmUp(){ if(HY.imm||!HY.on) return; const st=stat(); const lv=Math.max(1,G.lv); const ms=mobStats(lv,true); const hp=Math.max(800,Math.round(st.atk*60)); const mesh=hyHeadMesh(true);
  const m={n:"불멸의 머리",shape:"hydra",mesh,x:HYX,z:HYZ,hx:HYX,hz:HYZ,lv,boss:true,world:false,hp,mhp:hp,atk:ms.atk*.5,xp:0,gold:0,rg:12,cd:2,state:"chase",t:0,lbl:makeLabel(""),rot:0,hit:0,scale:2.2,power:0,ev:1,hyd:1,hyImm:1,y:7};
  mesh.position.set(HYX,7,HYZ); scene.add(mesh); mobs.push(m); HY.imm=m; HY.breathT=4;
  try{ lvBanner("레르나 늪","👑 불멸의 머리!","모두 함께 공격해요 — 둘 이상 같이 때리면 ×1.6!","#c89aff"); }catch(e){ toast("👑 불멸의 머리가 솟았어요!","모두 함께 공격해요",2.4); } jingle([262,330,392,523]); buzz([60,40,60]); }
function hyImmDrop(){ const m=HY.imm; if(!m) return; HY.imm=null; if(mobs.indexOf(m)>=0) removeMob(m); }
/* 머리 공격 → 베면 잘린 목 · 불멸의 머리는 데미지 비율을 다른 사람에게 알림 */
(function(){ const _dm=damageMob; damageMob=function(m,dmg,crit){ if(m&&m.hyImm&&m.hp>0){ const now=performance.now(); HY.immHits[G.id]=now; let n=0; for(const id in HY.immHits){ if(now-HY.immHits[id]<2000) n++; } if(n>=2){ dmg*=1.6; if(Math.random()<.3) floatDmg(m.x,8,m.z,"🤝 함께 공격 ×1.6!","gain"); }
      const f=Math.min(.2,dmg/m.mhp); try{ net.send({t:"hyi",e:hyData().e,f:+f.toFixed(4)}); }catch(e){} HY.fought=true; if(m.hp-dmg<=0){ m.hp=0; floatDmg(m.x,7,m.z,"-"+fmt(Math.round(dmg)),crit?"crit":""); hyWin(true); return; } }
    if(m&&m.hyd&&!m.hyImm){ HY.fought=true; if(HY.torch) dmg*=.5; }
    return _dm(m,dmg,crit); };
  const _km=killMob; killMob=function(m){ if(m&&m.hyd&&!m.hyImm){ const k=m.slot; const S=hyData(); delete HY.heads[k]; _km(m); if(S.sl[k]===1&&m.e===S.e){ S.sl[k]=2; S.st[k]=Date.now(); try{ net.send({t:"hyc",e:S.e,k,ts:S.st[k]}); }catch(e){} G.hyCut=(G.hyCut||0)+1; HY.pubT=Math.min(HY.pubT,.5);
        toast("✂ 머리를 벴어요!",HY.torch?"🔥 지금 목을 지져요! (공격 버튼)":"5초 안에 🔥 횃불로 지져야 해요 — 아니면 두 개로 자라요!",1.8); saveGame(); } return; }
    if(m&&m.hyImm) return; return _km(m); };
  const _at=attack; attack=function(){ if(HY.on&&HY.torch&&!P.dead&&!layerOpen){ const k=hyNearStump(); if(k>=0){ hyBurn(k); P.atkAnim=.25; P.atkCd=.3; return; } } return _at(); };
  const _sh=spawnAtHome; spawnAtHome=function(){ if(HY.on) hyExit(true,true); _sh(); }; })();
function hyNearStump(){ const S=hyData(); let best=-1, bd=3.6; for(let k=0;k<HY_N;k++){ if(S.sl[k]!==2) continue; const n=HY.necks[k]; if(!n) continue; const d=Math.hypot(P.x-n.bx,P.z-n.bz); if(d<bd){ bd=d; best=k; } } return best; }
function hyBurn(k){ const S=hyData(); if(S.sl[k]!==2) return; S.sl[k]=3; try{ net.send({t:"hyb",e:S.e,k}); }catch(e){} G.hyBurn=(G.hyBurn||0)+1; HY.fought=true; HY.pubT=Math.min(HY.pubT,.5); const n=HY.necks[k];
  fxSpark(n.bx,1.4,n.bz,0xff8a20,26); fxRing(n.bx,n.bz,0xffa040,3,.5); floatDmg(n.bx,2.6,n.bz,"🔥 지졌다!","gain"); tone(180,.25,"sawtooth",0,.08); tone(520,.12,"triangle",.1,.1); buzz(25); saveGame(); hyRules(S,Date.now()); if(S.ih) hyImmUp(); }
function hyWin(mine){ const S=hyData(); if(S.w>0) return; const e=S.e; if(mine){ try{ net.send({t:"hyw",e}); setTimeout(()=>{ try{ net.send({t:"hyw",e}); }catch(er){} },500); }catch(er){} }
  hyImmDrop(); hyClearHeads(); S.e=e+1; const n=hyInit(S.e); S.sl=n.sl.map(()=>0); S.st=n.st; S.ih=0; S.w=Date.now()+HY_RESP*1000; HY.pubT=0;
  if(HY.on){ HY.boulder=HY.boulder||null; try{ const b=new THREE.Mesh(new THREE.DodecahedronGeometry(4,1),mat({color:0x8a8070,roughness:.95})); b.position.set(HYX,40,HYZ); scene.add(b); HY.boulder={m:b,t:0}; }catch(er){} }
  if(HY.on&&HY.fought&&HY.rewE!==e){ HY.rewE=e; const d=kday(); const first=G.hyDay!==d; G.hyDay=d; const night=hyNight(); const sc=(3+(first?5:0))*(night?2:1); const L=G.lv; const gold=200+L*25, xp=150+L*30;
    G.hyScale=(G.hyScale||0)+sc; G.hyWin=(G.hyWin||0)+1; G.gold+=gold; gainXp(xp); saveGame(); HY.fought=false;
    setTimeout(()=>{ try{ lvBanner("레르나 늪","🐍 히드라를 물리쳤어요!",`🐍 비늘 +${sc}${first?" (오늘 첫 승리!)":""}${night?" · 🌙 늪의 밤 ×2":""} · 금화 +${fmt(gold)}`,"#9ad07a"); }catch(er){ toast("🐍 히드라를 물리쳤어요!",`비늘 +${sc}`,3); } jingle([523,659,784,1046,1318,1568]); try{ fxRing(P.x,P.z,0x9ad07a,10,.8); }catch(er){} },900); }
  else if(HY.on) toast("🐍 누군가 히드라를 물리쳤어요!","1분 뒤 새 히드라가 나와요",2.2); }
function hyNight(){ const h=new Date(Date.now()+9*3600000).getUTCHours(); return h===20; }
/* ---------- 들어가기 · 나가기 ---------- */
function hyEnter(){ if(HY.on||P.dead) return; if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&!m.hyd&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  closeLayer(); try{ if(typeof glAway==="function"&&glAway()){ if(typeof DG!=="undefined"&&DG.on) dgExit(true); if(typeof HM!=="undefined"&&HM.on) hmExit(); if(typeof PG!=="undefined"&&PG.on) pgExit(true,true); if(typeof TW!=="undefined"&&TW.on) twExit(true,true); if(typeof LV!=="undefined"&&LV.on) lvExit(true,true); if(typeof AR!=="undefined"&&AR.on) arExit(true,true); if(typeof OK!=="undefined"&&OK.on) okExit(true,true); if(typeof HS!=="undefined"&&HS.on) hsExit(true,true); } }catch(e){} try{ if(P.ride) rdSet(false); }catch(e){}
  hyBuild(); HY.on=true; hyShow(true); HY.cd=2.5; HY.fought=false; P.x=HYX; P.z=HYZ+HY_R-8; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul||0,2); P.guide=null; $("guide").hidden=true; G.hyIn=(G.hyIn||0)+1; saveGame();
  const S=hyData(); hyRules(S,Date.now()); if(S.ih) hyImmUp();
  try{ lvBanner("헤라클레스의 두 번째 과업","🐍 레르나 늪의 히드라","머리를 베고 🔥 횃불로 지져요 — 안 지지면 두 개로 자라요!","#9ad07a"); }catch(e){ toast("🐍 레르나 늪"); } fxRing(P.x,P.z,0x9ad07a,8,.8); jingle([262,330,392,523]); }
function hyExit(silent,noTp){ if(!HY.on) return; HY.on=false; hyClearHeads(); hyImmDrop(); hyShow(false); hyTorch(false); HY.warn.forEach(w=>scene.remove(w.m)); HY.warn=[]; HY.lbl.forEach(l=>l.style.display="none"); if(HY.boulder){ scene.remove(HY.boulder.m); HY.boulder=null; } for(const id in HY.peerTorch){ scene.remove(HY.peerTorch[id]); delete HY.peerTorch[id]; }
  if(!noTp){ const c=REGIONS[Math.max(0,G.realm)*3]; P.x=c.x+4; P.z=c.z+4; P.y=0; P.vy=0; } if(!silent) toast("수도로 돌아왔어요",null,1.6); }
/* ---------- 횃불 ---------- */
function hyFlame(){ const g=new THREE.Group(); g.add(cyl(.06,.08,1.1,mat({color:0x5a3a20}),0,0,0,6)); const f=sph(.28,glowMat(0xff8a20,.9),0,.65,0); f.userData.noOutline=true; g.add(f); const f2=sph(.16,glowMat(0xffe060,.95),0,.8,0); f2.userData.noOutline=true; g.add(f2); g.userData.f=f; return g; }
function hyTorch(on){ HY.torch=!!on; if(on&&!HY.torchMesh){ HY.torchMesh=hyFlame(); scene.add(HY.torchMesh); } if(!on&&HY.torchMesh){ scene.remove(HY.torchMesh); HY.torchMesh=null; } try{ net.send({t:"hyp",tc:on?1:0}); }catch(e){} }
function hyTorchNear(){ if(!HY.on) return null; return HY_TORCH.find(t=>Math.hypot(P.x-t.x,P.z-t.z)<4)||null; }
/* ---------- 경고 원(물기 · 독 숨결) ---------- */
function hyWarn(x,z,r,col,t,dmg,breath){ const m=new THREE.Mesh(HY.ringGeo,glowMat(col,.85)); m.rotation.x=-Math.PI/2; m.position.set(x,.08,z); m.scale.setScalar(r); m.userData.noOutline=true; scene.add(m); const fill=new THREE.Mesh(new THREE.CircleGeometry(1,28),glowMat(col,.25)); fill.rotation.x=-Math.PI/2; fill.position.set(x,.07,z); fill.scale.setScalar(.01); fill.userData.noOutline=true; scene.add(fill); HY.warn.push({m,fill,x,z,r,t:0,T:t,dmg,breath}); }
function hyTickWarn(dt){ for(let i=HY.warn.length-1;i>=0;i--){ const w=HY.warn[i]; w.t+=dt; const k=Math.min(1,w.t/w.T); w.fill.scale.setScalar(w.r*k); if(k>=1){ scene.remove(w.m); scene.remove(w.fill); HY.warn.splice(i,1); fxSpark(w.x,.6,w.z,w.breath?0x9aff7a:0xff5a3a,w.breath?24:10);
      if(!P.dead&&Math.hypot(P.x-w.x,P.z-w.z)<w.r&&P.y<.8){ hurtPlayer(w.dmg,w.breath?"독 숨결":"히드라 머리"); } } } }
/* ---------- 모습 그리기 ---------- */
function hyNecksDraw(dt){ const S=hyData(); const tn=performance.now()/1000;
  for(let k=0;k<HY_N;k++){ const n=HY.necks[k]; if(!n) continue; const v=HY.on?S.sl[k]:0; const head=HY.heads[k];
    n.ng.visible=v===1; n.stump.visible=v===2; n.burnt.visible=v===3;
    if(v===1&&head){ const sway=Math.sin(tn*1.3+n.ph)*.8, bob=Math.sin(tn*1.9+n.ph)*.5; const lunge=head.lunge>0?head.lunge:0; const hx=n.p.x+Math.cos(n.p.a)*(sway*.3+lunge*2.5)-Math.sin(n.p.a)*sway, hz=n.p.z+Math.sin(n.p.a)*(sway*.3+lunge*2.5)+Math.cos(n.p.a)*sway, hy=4+bob-lunge*1.5;
      head.x=hx; head.z=hz; head.y=hy; head.mesh.position.set(hx,hy,hz); const tx=P.x-hx, tz=P.z-hz; head.rot=Math.atan2(tx,tz); let dr=head.rot-head.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; head.mesh.rotation.y+=dr*Math.min(1,dt*5);
      if(head.mesh.userData.jaw) head.mesh.userData.jaw.rotation.x=lunge>0?.5:Math.max(0,Math.sin(tn*2+n.ph))*.15;
      n.segs.forEach((s,q)=>{ const u=(q+1)/7; const x=n.bx+(hx-n.bx)*u, z=n.bz+(hz-n.bz)*u, y=.8+(hy-.8)*u+Math.sin(u*Math.PI)*1.2; s.position.set(x,y,z); });
      hitTint(head.mesh,head.hit/.15); }
    if(v===2){ const left=Math.max(0,HY_GROW-(Date.now()-S.st[k])/1000); n.glow.material.opacity=.4+Math.sin(tn*10)*.3; n.glow.scale.setScalar(1+(1-left/HY_GROW)*.6);
      if(HY.on&&Math.hypot(P.x-n.bx,P.z-n.bz)<40&&!layerOpen) placeLabel(HY.lbl[k],n.bx,2.4,n.bz,`<b style="color:#ff9a6a">✂ ${left.toFixed(1)}초</b>${HY.torch&&Math.hypot(P.x-n.bx,P.z-n.bz)<3.6?" · 🔥 공격 버튼!":""}`); else HY.lbl[k].style.display="none"; }
    else HY.lbl[k].style.display="none"; } }
/* ---------- 매 프레임 ---------- */
function hyTick(dt){ if(!started) return; const S=hyData(); const now=Date.now(); const before=S.sl.join("")+S.ih+S.w;
  if(hyRules(S,now)){ /* 모습은 아래에서 맞춤 */ }
  HY.t-=dt; if(HY.t<=0){ HY.t=5; G.hyS={e:S.e,sl:S.sl.slice(),st:S.st.slice(),ih:S.ih,w:S.w,ts:now,by:S.by}; }
  if(!HY.on) return; if(!hyIn(P.x,P.z)){ hyExit(true,true); return; }
  HY.cd=Math.max(0,HY.cd-dt); const tn=performance.now();
  // 상태에 맞춰 머리 만들기·없애기
  for(let k=0;k<HY_N;k++){ const v=S.sl[k]; const h=HY.heads[k]; if(v===1&&!h&&S.w<=0) hyMakeHead(k); else if(v!==1&&h) hyRemoveHead(k,true); else if(h&&h.e!==S.e){ hyRemoveHead(k,false); } }
  if(S.ih&&!HY.imm&&S.w<=0) hyImmUp(); if(!S.ih&&HY.imm) hyImmDrop();
  if(HY.on&&hyLeader()){ HY.pubT-=dt; if(HY.pubT<=0||before!==S.sl.join("")+S.ih+S.w){ HY.pubT=3; hyPub(); } }
  HY.hbT-=dt; if(HY.hbT<=0){ HY.hbT=4; try{ net.send({t:"hyp",tc:HY.torch?1:0}); }catch(e){} }
  // 머리가 물기
  for(const k in HY.heads){ const h=HY.heads[k]; if(mobs.indexOf(h)<0){ delete HY.heads[k]; continue; } h.hit=Math.max(0,h.hit-dt); if(h.lunge>0) h.lunge-=dt*2.5; h.bite-=dt;
    if(h.bite<=0){ h.bite=rnd(3.5,6.5); const d=Math.hypot(P.x-h.x,P.z-h.z); if(d<9&&!P.dead){ const tx=P.x, tz=P.z; hyWarn(tx,tz,1.9,0xff4a3a,1.05,h.atk,false); setTimeout(()=>{ if(HY.heads[k]===h) h.lunge=1; },850); } }
    if(h.hp<h.mhp&&Math.hypot(P.x-h.x,P.z-h.z)<40&&!layerOpen) placeLabel(h.lbl,h.x,h.y+1.6,h.z,`<span class="hp"><i style="width:${Math.round(h.hp/h.mhp*100)}%"></i></span>`); else h.lbl.style.display="none"; }
  // 불멸의 머리
  const im=HY.imm; if(im){ if(mobs.indexOf(im)<0){ HY.imm=null; } else { im.hit=Math.max(0,im.hit-dt); const bob=Math.sin(tn/600)*.6; im.mesh.position.set(HYX,7+bob,HYZ); im.rot=Math.atan2(P.x-HYX,P.z-HYZ); let dr=im.rot-im.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; im.mesh.rotation.y+=dr*Math.min(1,dt*3); hitTint(im.mesh,im.hit/.15);
      HY.breathT-=dt; if(HY.breathT<=0){ HY.breathT=rnd(5,7); const a=Math.atan2(P.z-HYZ,P.x-HYX); hyWarn(HYX+Math.cos(a)*9,HYZ+Math.sin(a)*9,5,0x7aff5a,1.6,im.atk*1.2,true); toast("☁ 독 숨결! 초록 원 밖으로!",null,1); }
      if(!layerOpen) placeLabel(im.lbl,HYX,11,HYZ,`👑 <b>불멸의 머리</b><span class="hp"><i style="width:${Math.max(0,Math.round(im.hp/im.mhp*100))}%"></i></span>`); else im.lbl.style.display="none";
      try{ BOSSBAR.update(im); }catch(e){} } }
  hyTickWarn(dt); hyNecksDraw(dt);
  // 바위
  if(HY.boulder){ const b=HY.boulder; b.t+=dt; const k=Math.min(1,b.t/1.1); b.m.position.y=40-39*k*k+(k>=1?0:0); b.m.rotation.x+=dt*2*(1-k); if(k>=1&&!b.land){ b.land=true; P.shake=Math.max(P.shake||0,.8); fxRing(HYX,HYZ,0xc8b090,16,.9); fxSpark(HYX,1,HYZ,0xc8b090,40); tone(80,.5,"sawtooth",0,.15); } if(S.w<=0){ scene.remove(b.m); HY.boulder=null; } }
  if(HY.body) HY.body.visible=S.w<=0||!HY.boulder;
  // 내 횃불·친구 횃불
  if(HY.torchMesh){ const a=P.rot; HY.torchMesh.position.set(P.x+Math.cos(a)*.6+Math.sin(a)*.3,hAt(P.x,P.z)+P.y+1.7,P.z-Math.sin(a)*.6+Math.cos(a)*.3); HY.torchMesh.userData.f.scale.setScalar(1+Math.sin(tn/80)*.12); if(Math.random()<dt*6) fxSpark(HY.torchMesh.position.x,HY.torchMesh.position.y+.8-hAt(P.x,P.z),HY.torchMesh.position.z,0xffa040,2); }
  for(const id in HY.peerT){ const o=PEERS[id]; const on=o&&HY.peerT[id]&&tn-HY.peerT[id]<9000&&hyIn(o.x,o.z); let f=HY.peerTorch[id]; if(on){ if(!f){ f=HY.peerTorch[id]=hyFlame(); scene.add(f); } f.position.set(o.x+.5,1.7,o.z+.3); } else if(f){ scene.remove(f); delete HY.peerTorch[id]; } }
  HY_TORCH.forEach(t=>{ if(t.f){ t.f.scale.setScalar(1+Math.sin(tn/90+t.x)*.15); } });
  const ex=HY.exitArch; if(ex&&HY.cd<=0&&Math.hypot(P.x-ex.x,P.z-ex.z)<2.4){ hyExit(); return; }
  const alive=S.sl.filter(v=>v===1).length, stumps=S.sl.filter(v=>v===2).length, burnt=S.sl.filter(v=>v===3).length;
  $("region").innerHTML=S.w>0?`🐍 레르나 늪 <b>새 히드라까지 ${Math.ceil((S.w-now)/1000)}초</b>`:S.ih?`🐍 레르나 늪 <b>👑 불멸의 머리!</b>`:`🐍 히드라 <b>머리 ${alive} · ✂ ${stumps} · 🔥 ${burnt}</b>${HY.torch?" · 🔥 횃불":""}${hyNight()?" · 🌙 늪의 밤":""}`; }
XTICK.push(hyTick);
function hySky(dt){ SKY.tTop.setHex(0x3a5a4a); SKY.tBot.setHex(0x9ab890); const k=Math.min(1,dt*1.5); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=50; scene.fog.far=200;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+30,70,P.z+30); sun.target.position.set(P.x,0,P.z); sun.intensity=.85; sun.color.setHex(0xe8f0c8); hemi.intensity=.5; fill.intensity=.25; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=.9; }
function hyMinimap(){ const ctx=mctx, S0=fitCanvas(mm); const s=S0*.94/(HY_R*2+8); const X=x=>S0/2+(x-HYX)*s, Z=z=>S0/2+(z-HYZ)*s; const S=hyData();
  ctx.fillStyle="#2a3a2a"; ctx.fillRect(0,0,S0,S0); dot(ctx,X(HYX),Z(HYZ),(HY_R+4)*s,"#5a5a3a","#3a4a2a",2); dot(ctx,X(HYX),Z(HYZ),(HY_BODY+3.5)*s,"#3a6a5a");
  for(let k=0;k<HY_N;k++){ const v=S.sl[k]; if(!v) continue; const n=HY.necks[k]; const p=n?{x:n.bx,z:n.bz}:hySlotPos(k); dot(ctx,X(p.x),Z(p.z),S0/40,v===1?"#4ac04a":v===2?"#ff7a3a":"#2a2420","#fff",1); }
  if(S.ih) dot(ctx,X(HYX),Z(HYZ),S0/18,"#a87aff","#fff",2);
  HY_TORCH.forEach(t=>dot(ctx,X(t.x),Z(t.z),S0/34,"#ffa040","#fff",1.5)); if(HY.exitArch) dot(ctx,X(HY.exitArch.x),Z(HY.exitArch.z),S0/26,"#ffd27a","#fff",2);
  for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&hyIn(o.x,o.z)) dot(ctx,X(o.x),Z(o.z),S0/36,"#1e8e3e","#fff",1.5); }
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const q=S0/20; ctx.moveTo(0,-q); ctx.lineTo(q*.7,q*.7); ctx.lineTo(0,q*.35); ctx.lineTo(-q*.7,q*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,"🐍 레르나 늪",S0/2,S0*.07,Math.round(S0/12),"#fff"); }
XZONE.push({on:()=>HY.on,clamp:()=>{ if(!hyIn(P.x,P.z)){ hyExit(true,true); return false; } const r=Math.hypot(P.x-HYX,P.z-HYZ), lim=HY_R-.8, lo=HY_BODY+.4; if(r>lim){ const k=lim/r; P.x=HYX+(P.x-HYX)*k; P.z=HYZ+(P.z-HYZ)*k; } else if(r<lo){ const k=lo/(r||1); P.x=HYX+(P.x-HYX)*k; P.z=HYZ+(P.z-HYZ)*k; } return true; },sky:hySky,mm:hyMinimap});
/* ---------- 창 · 메뉴 · 칭호 · 장식 ---------- */
const HY_DECO=DECO.length;
DECO.push({n:"히드라 비늘 방패",ic:"🛡",t:3,sc:14,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.1,.12,1.6,mat({color:0x5a3a20}),0,.8,0,6)); const sh=cyl(1,1,.18,mat({color:0x3a8a4a,metalness:.3,roughness:.4}),0,2,0,6); sh.rotation.x=Math.PI/2; g.add(sh); for(let k=0;k<7;k++){ const a=k/7*6.283; const sc=sph(.2,mat({color:0x9ad07a,metalness:.4,roughness:.3}),Math.cos(a)*.55,2+Math.sin(a)*.55,.12); sc.scale.z=.4; g.add(sc); } g.add(sph(.22,M.gold,0,2,.14)); return g; }});
const HY_SHOP=[{n:"물약 3개",ic:"🧪",c:2,f:()=>{ G.pots+=3; }},{n:"룬 가루 2개",ic:"✨",c:4,f:()=>{ G.rune=(G.rune||0)+2; }},{n:"쇳조각 6개",ic:"⛓",c:3,f:()=>{ G.ore=(G.ore||0)+6; }},{n:"무기 뽑기권 1장",ic:"🎟",c:8,f:()=>{ try{ gz().tk++; }catch(e){} }},{n:"신전 장식 «히드라 비늘 방패»",ic:"🛡",c:12,f:()=>{ hmAdd(HY_DECO); }}];
function showHydra(){ const S=hyData(); const alive=S.sl.filter(v=>v===1).length, stumps=S.sl.filter(v=>v===2).length, burnt=S.sl.filter(v=>v===3).length; const here=Object.values(PEERS).filter(o=>hyIn(o.x,o.z)).length+(HY.on?1:0);
  card(`<h2>🐍 레르나 늪의 히드라</h2><p>헤라클레스와 조카 이올라오스처럼! 머리를 베면 <b>5초 안에 🔥 횃불로 목을 지져야</b> 해요. 안 지지면 그 자리에 머리가 <b>두 개</b>로 자라요. 누구는 베고, 누구는 횃불을 들고 — 역할을 나누면 쉬워요!</p>
   <div class="idlegrid"><div><b>${S.w>0?`⏳ ${Math.ceil((S.w-Date.now())/1000)}초`:S.ih?"👑":`🐍 ${alive}`}</b><span>${S.w>0?"새 히드라까지":S.ih?"불멸의 머리!":"남은 머리"}</span></div><div><b>✂ ${stumps} · 🔥 ${burnt}</b><span>잘린 목 · 지진 목</span></div><div><b>👥 ${here}</b><span>지금 늪에 있는 사람</span></div></div>
   <div class="idlegrid"><div><b>🐍 ${G.hyScale||0}</b><span>내 히드라 비늘</span></div><div><b>${G.hyWin||0}</b><span>물리친 수</span></div><div><b>🔥 ${G.hyBurn||0}</b><span>지진 목</span></div></div>
   ${HY.on?"":`<button class="go" id="hyGo" style="align-self:center">🐍 레르나 늪으로 가기</button>`}
   <h3>🛒 비늘 가게</h3>${HY_SHOP.map((it,i)=>`<div class="row"><div class="ic">${it.ic}</div><div class="t"><div>${it.n}</div><span>🐍 ${it.c}개</span></div><button class="buy" data-hy="${i}" ${(G.hyScale||0)<it.c?"disabled":""}>사기</button></div>`).join("")}
   <p style="font-size:12px">🔥 횃불은 늪 가장자리 횃불대 4곳에서 들어요(횃불을 들고 잘린 목 곁에서 공격 버튼) · 머리를 다 없애면 👑 불멸의 머리 — 같이 때리면 ×1.6 · 빨간 원은 점프나 옆으로 피해요 · 하루 첫 승리 비늘 +5 · 🌙 매일 저녁 8~9시 늪의 밤 비늘 ×2 · 아무도 없으면 히드라가 혼자 머리를 다시 키워요!</p>`);
  const g=$("hyGo"); if(g) g.onclick=hyEnter;
  layers.querySelectorAll("[data-hy]").forEach(b=>b.onclick=()=>{ const it=HY_SHOP[+b.dataset.hy]; if((G.hyScale||0)<it.c) return; G.hyScale-=it.c; it.f(); saveGame(); jingle([659,880]); toast(`🐍 ${it.ic} ${it.n}`,`비늘 −${it.c}`,1.6); showHydra(); }); }
MENU_X.push({ic:"🐍",n:"레르나 늪의 히드라",id:"hyBtn",sub:()=>{ const S=hyData(); return S.w>0?`새 히드라까지 ${Math.ceil((S.w-Date.now())/1000)}초`:S.ih?"👑 불멸의 머리가 솟았어요!":`머리 ${S.sl.filter(v=>v===1).length}개 · 🐍 비늘 ${G.hyScale||0}${hyNight()?" · 🌙 늪의 밤 ×2":""}`; },f:showHydra});
CTX_EXTRA.push(()=>{ if(!HY.on) return null; const t=hyTorchNear(); if(t) return {t:HY.torch?"🔥 횃불 내려놓기":"🔥 횃불 들기",f:()=>{ hyTorch(!HY.torch); toast(HY.torch?"🔥 횃불을 들었어요!":"횃불을 내려놨어요",HY.torch?"잘린 목 곁에서 공격 버튼을 누르면 지져요":null,1.8); tone(HY.torch?440:330,.12,"triangle"); }}; if(HY.torch){ const k=hyNearStump(); if(k>=0) return {t:"🔥 목 지지기!",f:()=>hyBurn(k)}; } return null; });
TITLES.push({id:"hy1",n:"히드라 사냥꾼",t:1,h:"🐍 히드라 물리치기 1번",g:()=>[G.hyWin||0,1]},{id:"hy2",n:"이올라오스의 횃불",t:2,h:"🔥 잘린 목 30번 지지기",g:()=>[G.hyBurn||0,30]},{id:"hy3",n:"헤라클레스의 후예",t:3,h:"🐍 히드라 물리치기 20번",g:()=>[G.hyWin||0,20]});
</script>
