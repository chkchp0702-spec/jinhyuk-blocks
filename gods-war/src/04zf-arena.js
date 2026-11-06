<script>
/* ================= v69-3: ⚔️ 발할라 결투장 — 내가 꺼 둬도 내 영웅이 대신 싸움 (IDEAS G11/6-3) =================
   수도마다 「⚔️ 발할라 결투장 문」 → 지도 밖(x≈380, z≈380) 둥근 결투장. 처음 들어가면 내 「수비 영웅」(모습·장비·짝꿍 신수·기술 3개)이 등록됨.
   다른 사람이 도전하면 그 사람 폰에서 내 영웅이 저절로 움직이며 싸움 → 내가 자고 있어도 내 영웅이 결투장을 지킴.
   다음에 켜면 "쉬는 동안 내 영웅이 N번 도전을 받아 M번 막아냈어요!" 보고서(이긴 사람 이름 · 🤝 좋은 결투!).
   도전: 비슷한 힘의 상대 3명 중 골라 ⚔ 1:1 또는 🤝 2:2(내 친구의 수비 영웅이 내 편 로봇처럼 같이 싸움). 진짜 사람이 모자라면 신전 수련 전사(로봇)가 채움.
   힘 맞추기: 결투장 안에서는 체력을 100으로 맞추고, 상대 체력은 내 공격력에 맞춰 줌(힘 차이는 아주 조금만 반영) → 처음 온 사람도 이길 수 있음.
   다치지 않음 — 결투장 체력이 0이 되면 무릎만 꿇어요. 물약은 결투마다 2번(체력 +30). 90초가 지나면 체력이 더 많이 남은 쪽이 이김.
   결투 점수(이번 주) → 🥉 청동 → 🥈 은(120) → 🥇 금(300) → 💎 신화(600) 방패. 매주 월요일 정산 상자. 점수는 하루 10판까지 오름(그 뒤는 연습).
   시즌(4주) 결투 점수 1~10등은 다음 시즌 내내 결투장 둘레에 금빛 석상으로 서 있음(첫 시즌엔 지금 순위).
   보관(retained) 주제: ard/<id> = 수비 영웅 {i,n,r,k,l,lk,e,pt,sk,sx,wk,pw,p,w,sp,s,ps,psn,ts}
                     arr/<수비 영웅 id>/<도전한 사람 id> = 결과 {i,n,r,o,w(도전자가 이김 1),ts,gg(좋은 결투)} */
const ARX=380, ARZ=380, AR_R=19, AR_OUT=44, AR_T=90, AR_DAY=10;
const AR_TIER=[{n:"청동 방패",ic:"🥉",min:0,c:"#e0a070"},{n:"은 방패",ic:"🥈",min:120,c:"#d8dde6"},{n:"금 방패",ic:"🥇",min:300,c:"#ffcf4a"},{n:"신화 방패",ic:"💎",min:600,c:"#d08aff"}];
const AR_BOTS=[["수련 천사 엘리엘","빛의 견습 기사 하니엘"],["발키리 수련생 힐드","아인헤리야르 토르발"],["아르주나의 제자 비라","가루다 견습 무사 아난"],["아테나의 견습 전사 레아","스파르타 수련생 니코스"]];
const AR_SAY=["좋은 결투! 🤝","또 겨뤄요!","강하다!","고마워!"];
const AR={on:false,built:false,parts:[],gates:[],gateLbl:null,cd:0,f:null,hud:null,picks:null,mode:1,stat:[],statKey:"",lbl:[],repQ:[],repT:0,amb:0,pubT:4,t:0,fx:[],hp0:0,boardLbl:null};
const ARD={}, ARR={};
function arIn(x,z){ return Math.abs(x-ARX)<150&&Math.abs(z-ARZ)<150; }
function arWeek(){ return Math.floor((kday()+3)/7); }
function arSeason(){ try{ return ssNo(); }catch(e){ return 0; } }
function arTier(p){ let t=0; AR_TIER.forEach((x,i)=>{ if((p||0)>=x.min) t=i; }); return t; }
function arPow(){ const st=stat(); return Math.round(st.atk+st.mhp*.1+G.lv*2+G.rank*10); }
function arData(){ const w=arWeek(), S=arSeason(), day=kday(); const a=G.ar=G.ar||{w,p:0,n:0,d:day,win:0,lose:0,dw:0,dl:0,sp:0,s:S,seen:{},regT:0};
  a.seen=a.seen||{}; if(a.d!==day){ a.d=day; a.n=0; }
  if(a.w!==w){ const old=a.p||0, oldT=arTier(old); if(a.w!=null&&old>0){ const L=G.lv; const gold=[300,700,1500,3000][oldT]+L*20*(oldT+1), ore=[3,6,10,16][oldT], rune=[1,2,4,6][oldT]; G.gold+=gold; G.ore=(G.ore||0)+ore; G.rune=(G.rune||0)+rune; a.bestT=Math.max(a.bestT||0,oldT); AR.repQ.push({chest:1,t:oldT,gold,ore,rune,p:old}); } a.w=w; a.p=0; }
  if(a.s!==S){ a.psn=a.s; a.ps=a.sp||0; a.sp=0; a.s=S; }
  return a; }
/* ---------- 수비 영웅 기록 ---------- */
function arSkills(){ const R=RM(); let sl=[0,1,2]; try{ sl=skSlots(); }catch(e){} const L=[]; sl.forEach(i=>{ const S=R.skills[i]; if(S&&G.rank>=(S.rank||0)&&L.length<3&&L.indexOf(i)<0) L.push(i); }); return L; }
function arMyRec(){ const a=arData(), st=stat(); const l=G.look||{}; const sk=arSkills(); let wk="sword"; try{ wk=myWeaponKind(); }catch(e){}
  return {i:G.id,n:G.name,r:G.realm,k:G.rank,l:G.lv,lk:[l.face||0,l.body||0,l.hat||0,l.cape||0,l.weapon||0,l.tint||0],e:[G.eq.w,G.eq.a,G.eq.r],pt:typeof petArr==="function"?petArr():null,sk:sk.map(i=>RM().skills[i].n),sx:sk.map(i=>RM().skills[i].type),wk,pw:arPow(),p:a.p,w:a.w,sp:a.sp,s:a.s,ps:a.ps||0,psn:a.psn==null?-1:a.psn,ts:Date.now()}; }
function arPub(){ const a=arData(); if(!a.regT) return; try{ net.pushRet("ard/"+G.id,arMyRec()); }catch(e){} }
NETX.push({sub:"ard/+",pre:"ard/",f:d=>{ if(!d||!d.i||d.i===G.id||!(d.r>=0)) return; ARD[d.i]=d; }});
NETX.push({sub:()=>"arr/"+G.id+"/+",pre:"arr/",f:d=>{ if(!d||!d.i||d.o!==G.id||!d.ts) return; ARR[d.i]=d; AR.repT=Math.max(AR.repT,performance.now()); }});
/* ---------- 상대 고르기 ---------- */
function arBot(k,myPw){ const r=(G.realm+1+k)%4; const nm=AR_BOTS[r][(k+arWeek())%2]; const rk=clamp(G.rank+(k===2?1:0)-(k===0?1:0),0,6); return {i:"bot:"+k,n:nm,r,k:rk,l:clamp(G.lv+k-1,1,LVMAX),lk:[0,0,0,0,0,0],e:[Math.min(3,Math.floor(rk/2)),Math.min(3,Math.floor(rk/2)),-1],pt:null,sk:[],sx:["aoe","line","dash"].slice(0,1+Math.min(2,Math.floor(rk/2))),wk:k===1?"bow":"sword",pw:Math.round(myPw*([.88,.97,1.06][k]||1)),p:0,bot:1}; }
function arPick(shuffle){ const my=arPow(), now=Date.now(); const L=Object.values(ARD).filter(d=>now-(d.ts||0)<21*86400000&&d.i!==G.id); L.sort((a,b)=>Math.abs(a.pw-my)-Math.abs(b.pw-my)); let top=L.slice(0,8); if(shuffle){ for(let i=top.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [top[i],top[j]]=[top[j],top[i]]; } } const P3=top.slice(0,3); for(let k=0;P3.length<3;k++) P3.push(arBot(k,my)); P3.sort((a,b)=>a.pw-b.pw); AR.picks=P3; return P3; }
function arFriends(){ const L=[]; const now=Date.now(); for(const id in ARD){ const d=ARD[id]; if(now-(d.ts||0)>21*86400000) continue; const fr=(G.frN&&G.frN[id])||(PEERS[id])||(typeof gdTag==="function"&&d.gd&&d.gd===gdTag())||(G.wsGiveNm&&G.wsGiveNm[id]); L.push({d,fr:!!fr}); } L.sort((a,b)=>(b.fr?1:0)-(a.fr?1:0)||Math.abs(a.d.pw-arPow())-Math.abs(b.d.pw-arPow())); return L.map(x=>x.d); }
/* ---------- 결투장 만들기 ---------- */
function arBuild(){ if(AR.built) return; AR.built=true; const add=o=>{ scene.add(o); AR.parts.push(o); return o; };
  const stone=mat({color:0x9a8a78,roughness:.9}), dk=mat({color:0x6a5a4a,roughness:.95}), sand=mat({color:0xe8d6aa,roughness:1}), wood=mat({color:0x7a5236,roughness:.95}), gold=M.gold;
  const G0=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CircleGeometry(AR_OUT+2,64),stone); base.rotation.x=-Math.PI/2; base.position.set(ARX,-.02,ARZ); G0.add(base);
  const pit=new THREE.Mesh(new THREE.CircleGeometry(AR_R,56),sand); pit.rotation.x=-Math.PI/2; pit.position.set(ARX,.01,ARZ); G0.add(pit);
  const ringL=new THREE.Mesh(new THREE.RingGeometry(AR_R-.1,AR_R+.9,64),gold); ringL.rotation.x=-Math.PI/2; ringL.position.set(ARX,.03,ARZ); G0.add(ringL);
  const rune=new THREE.Mesh(new THREE.RingGeometry(4,4.6,40),glowMat(0xffc860,.35)); rune.rotation.x=-Math.PI/2; rune.position.set(ARX,.05,ARZ); rune.userData.noOutline=true; G0.add(rune); AR.rune=rune;
  // 바깥 벽 + 방패
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(AR_OUT+2,AR_OUT+2,5,64,1,true),dk); wall.material.side=THREE.DoubleSide; wall.position.set(ARX,2.5,ARZ); G0.add(wall);
  for(let k=0;k<20;k++){ const a=k/20*6.283; if(Math.abs(Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2)))<.3) continue; const x=ARX+Math.cos(a)*(AR_OUT+1.6), z=ARZ+Math.sin(a)*(AR_OUT+1.6); const sh=new THREE.Group(); sh.add(cyl(1.3,1.3,.25,mat({color:[0xc83a3a,0x3a6ac8,0xe8c040,0x3a9a5a][k%4],roughness:.6}),0,0,0,18)); sh.add(cyl(.35,.35,.35,gold,0,0,0,10)); sh.children.forEach(c=>c.rotation.x=Math.PI/2); sh.position.set(x,3.2,z); sh.lookAt(ARX,3.2,ARZ); G0.add(sh); }
  // 기둥 8개 + 금빛 지붕 들보
  for(let k=0;k<8;k++){ const a=k/8*6.283+Math.PI/8; const x=ARX+Math.cos(a)*(AR_R+3.5), z=ARZ+Math.sin(a)*(AR_R+3.5); G0.add(cyl(.8,1,9,stone,x,4.5,z,10)); G0.add(box(2,.5,2,gold,x,9.2,z)); const f=sph(.6,glowMat(0xffa040,.85),x,10,z); f.userData.noOutline=true; G0.add(f); }
  // 남쪽 결투 석판 (여기서 상대 고르기)
  const tab=new THREE.Group(); tab.add(box(4.2,2.6,.5,stone,0,1.9,0)); tab.add(box(4.6,.4,.8,gold,0,3.3,0)); tab.add(box(4.6,.6,.8,dk,0,.3,0)); const sw=box(.25,2.4,.1,mat({color:0xd8dde6,metalness:.7,roughness:.3}),-.7,2,.3); sw.rotation.z=.6; tab.add(sw); const sw2=sw.clone(); sw2.rotation.z=-.6; sw2.position.x=.7; tab.add(sw2);
  tab.position.set(ARX,0,ARZ+AR_R+6); G0.add(tab); AR.tab={x:ARX,z:ARZ+AR_R+6};
  add(shadowify(G0));
  { const g=pgArch(false); g.position.set(ARX,0,ARZ+AR_OUT-2.5); add(shadowify(g)); AR.exitArch={x:ARX,z:ARZ+AR_OUT-3.2}; }
  AR.parts.forEach(o=>o.traverse&&o.traverse(m=>{ if(m.material&&m.material.blending===THREE.AdditiveBlending){ m.castShadow=false; m.userData.noOutline=true; } })); }
function arShow(v){ AR.parts.forEach(o=>o.visible=v); AR.stat.forEach(s=>s.g.visible=v); }
(function(){ const _h=hAt; hAt=function(x,z){ return arIn(x,z)?0:_h(x,z); }; })();
/* ---------- 시즌 석상 ---------- */
function arStatueList(){ const S=arSeason(); const recs=Object.values(ARD).concat([arMyRec()]); let L=recs.map(r=>({r,v:r.s===S-1?(r.sp||0):r.psn===S-1?(r.ps||0):0})).filter(x=>x.v>0); let prev=true; if(!L.length){ prev=false; L=recs.map(r=>({r,v:r.s===S?(r.sp||0):0})).filter(x=>x.v>0); } L.sort((a,b)=>b.v-a.v); return {L:L.slice(0,10),prev}; }
function arStatues(){ const {L,prev}=arStatueList(); const key=(prev?"p":"c")+L.map(x=>x.r.i+":"+x.v).join(","); if(key===AR.statKey) return; AR.statKey=key; AR.stat.forEach(s=>{ scene.remove(s.g); s.lbl.remove(); }); AR.stat=[];
  L.forEach((x,k)=>{ const a=-Math.PI/2+(k-4.5)*.36; const px=ARX+Math.cos(a)*(AR_R+11), pz=ARZ+Math.sin(a)*(AR_R+11); const g=new THREE.Group(); g.add(cyl(1.3,1.5,1.2+(k<3?.6:0),M.marble,0,.6+(k<3?.3:0),0,14)); g.add(cyl(1.35,1.35,.15,M.gold,0,1.25+(k<3?.6:0),0,14));
    let av; try{ av=makeAvatar(x.r.r,x.r.k||0,true,{}); av.traverse(o=>{ if(o.isMesh) o.material=M.gold; }); }catch(e){ av=new THREE.Group(); av.add(sph(1,M.gold,0,2,0)); } av.position.y=1.3+(k<3?.6:0); av.scale.setScalar(k===0?1.25:k<3?1.1:1); av.rotation.y=Math.atan2(ARX-px,ARZ-pz); g.add(av);
    g.position.set(px,0,pz); scene.add(shadowify(g)); g.visible=AR.on; AR.stat.push({g,x:px,z:pz,lbl:makeLabel("ally"),txt:`${["🥇","🥈","🥉"][k]||`${k+1}등`} <b>${x.r.n}</b> · ${fmt(x.v)}점${prev?"":" (지금)"}`}); }); }
/* ---------- 들어가기 · 나가기 ---------- */
function arEnter(){ if(AR.on||P.dead) return; if(P.trial){ toast("승급 시험 중이에요"); return; } if(mobs.some(m=>m.state==="chase"&&!m.arena&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  try{ twBusyExit(); }catch(er){ closeLayer(); } try{ if(TW.on) twExit(true,true); }catch(er){} try{ if(LV.on) lvExit(true,true); }catch(er){}
  const a=arData(); arBuild(); AR.on=true; arShow(true); arStatues(); AR.cd=2.5; P.x=ARX; P.z=ARZ+AR_R+9; P.y=0; P.vy=0; P.rot=Math.PI; P.invul=Math.max(P.invul||0,1.5); P.guide=null; $("guide").hidden=true; G.arIn=(G.arIn||0)+1;
  const first=!a.regT; if(first){ a.regT=Date.now(); } saveGame(); arPub();
  try{ lvBanner("아스가르드의 전사들이 모이는 곳","⚔️ 발할라 결투장",first?"내 수비 영웅이 등록됐어요 — 내가 꺼 둬도 대신 싸워 줘요!":"결투 석판에서 상대를 골라요","#ffcf4a"); }catch(er){}
  fxRing(P.x,P.z,0xffcf4a,8,.8); fxSpark(P.x,2,P.z,0xffcf4a,30); jingle([392,523,659,784]); }
function arExit(silent,noTp){ if(!AR.on) return; if(AR.f) arEndFight(null,true); AR.on=false; arShow(false); AR.stat.forEach(s=>s.lbl.style.display="none"); if(AR.boardLbl) AR.boardLbl.style.display="none";
  if(!noTp){ const s=AR.gates[Math.max(0,G.realm)]||{x:REGIONS[G.realm*3].x,z:REGIONS[G.realm*3].z,rot:0}; P.x=s.x+Math.sin(s.rot)*6; P.z=s.z+Math.cos(s.rot)*6; P.y=0; P.vy=0; P.rot=s.rot; AR.cd=4; } if(!silent) toast("수도로 돌아왔어요",null,1.6); }
/* ---------- 수도의 결투장 문 ---------- */
function arGateModel(){ const g=new THREE.Group(); const st=mat({color:0x8a7a68,roughness:.9}), wd=mat({color:0x7a5236,roughness:.95}), gold=M.gold;
  [-1,1].forEach(k=>{ g.add(cyl(.55,.7,6.6,st,k*2.9,3.3,0,10)); const sh=new THREE.Group(); sh.add(cyl(1,1,.2,mat({color:k<0?0xc83a3a:0x3a6ac8,roughness:.6}),0,0,0,18)); sh.add(cyl(.3,.3,.3,gold,0,0,0,10)); sh.children.forEach(c=>c.rotation.x=Math.PI/2); sh.position.set(k*2.9,4.6,.62); g.add(sh); });
  const beam=box(7.4,.7,1.1,wd,0,6.9,0); g.add(beam); g.add(box(7.8,.22,1.3,gold,0,7.35,0)); [-1,1].forEach(k=>{ const sp=cyl(.07,.07,4.2,mat({color:0xd8dde6,metalness:.7,roughness:.3}),k*.9,8.5,0,6); sp.rotation.z=k*.55; g.add(sp); });
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.35,.2,10,40),glowMat(0xffcf4a,.8)); ring.position.y=3.2; ring.userData.noOutline=true; g.add(ring); const disc=new THREE.Mesh(new THREE.CircleGeometry(2.25,40),glowMat(0xff8a3a,.3)); disc.position.y=3.2; disc.userData.noOutline=true; g.add(disc);
  g.userData.ring=ring; g.userData.disc=disc; return g; }
setTimeout(()=>{ for(let r=0;r<4;r++){ let s; try{ s=xCapSpot(r,34); }catch(e){ const c=REGIONS[r*3]; s={x:c.x+(c.x>0?-36:36),z:c.z+16,rot:0}; } XSPOT_USED.push({r,x:s.x,z:s.z,rad:6}); const g=arGateModel(); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); AR.gates[r]={x:s.x,z:s.z,rot:s.rot,g}; } },25);
function arGateNear(){ if(AR.on) return null; if((typeof TW!=="undefined"&&TW.on)||(typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on)||(typeof LV!=="undefined"&&LV.on)) return null; for(const s of AR.gates){ if(s&&Math.hypot(P.x-s.x,P.z-s.z)<5.5) return s; } return null; }
/* ---------- 영웅 (상대·내 편) ---------- */
function arLook(a){ a=a||[]; return {face:a[0]||0,body:a[1]||0,hat:a[2]||0,cape:a[3]||0,weapon:a[4]||0,tint:a[5]||0}; }
function arEq(e){ e=e||[-1,-1,-1]; return {w:e[0],a:e[1],r:e[2]}; }
function arAvatar(rec){ let g=null; try{ g=(typeof avatarGL==="function"&&avatarGL(rec.r,rec.k||0,arLook(rec.lk),undefined,arEq(rec.e)))||null; }catch(e){ g=null; } if(!g){ g=makeAvatar(rec.r,rec.k||0,false,arLook(rec.lk)); try{ if(rec.e&&rec.e[0]>=0&&!g.userData.glAvatar&&g.userData.armR){ const w=makeWeapon(rec.r,rec.e[0]); w.position.set(0,-1.2,.3); g.userData.armR.add(w); } }catch(e){} } return g; }
function arSkillKind(t){ return (t==="aoe"||t==="meteor"||t==="ult"||t==="orbit")?"ring":(t==="line"||t==="bolt"||t==="multi")?"line":(t==="dash"||t==="pull")?"dash":(t==="heal"||t==="shield"||t==="team")?"heal":"buff"; }
function arPower(rec){ return clamp(Math.pow((rec.pw||arPow())/Math.max(1,arPow()),.3),.85,1.2); }
function arMkAI(rec){ const sk=(rec.sx||[]).slice(0,3).map((t,i)=>({k:arSkillKind(t),n:(rec.sk&&rec.sk[i])||"기술",cd:3+i*2.5})); if(!sk.length) sk.push({k:"dash",n:"돌진 베기",cd:4}); return {sk,cd:1.4,strafe:Math.random()<.5?1:-1,stT:rnd(1.5,3),buff:0,cast:null,ranged:rec.wk==="bow"||rec.wk==="magic",healed:0,jump:0}; }
function arFoe(rec,x,z,mult){ const f=arPower(rec), st=stat(); const mesh=arAvatar(rec); const hp=Math.round(st.atk*45*f*mult); const m={n:rec.n,shape:"hero",mesh,x,z,hx:x,hz:z,lv:rec.l||1,boss:false,world:false,hp,mhp:hp,atk:0,xp:0,gold:0,rg:12,cd:1,state:"chase",t:0,lbl:makeLabel(""),rot:0,hit:0,scale:1,power:0,ev:1,arena:1,rec,f:f*(mult<1?.85:1),ai:arMkAI(rec),walk:0};
  mesh.position.set(x,0,z); scene.add(mesh); mobs.push(m); if(rec.pt&&PETS[rec.pt[0]]){ const pm=makePet(rec.pt[0],rec.pt[1]||1,rec.pt[2]); scene.add(pm); m.pet={mesh:pm,x:x-1.5,z:z-1.5,atk:2}; } return m; }
function arAlly(rec,x,z){ const mesh=arAvatar(rec); mesh.position.set(x,0,z); scene.add(mesh); const a={n:rec.n,rec,mesh,x,z,hp:100,rot:Math.PI,hit:0,ai:arMkAI(rec),f:arPower(rec),walk:0,lbl:makeLabel("ally")}; if(rec.pt&&PETS[rec.pt[0]]){ const pm=makePet(rec.pt[0],rec.pt[1]||1,rec.pt[2]); scene.add(pm); a.pet={mesh:pm,x:x-1.5,z:z-1.5,atk:2}; } return a; }
function arAnim(o,moving,dt,act){ const u=o.mesh.userData; if(u.gl){ if(act) animState(o.mesh,act); else animState(o.mesh,o.hit>0?"hit":moving?"run":"idle"); return; }
  o.walk+=dt*(moving?10:0); const sw=moving?Math.sin(o.walk)*.7:0; if(u.legL){ u.legL.rotation.x=sw; u.legR.rotation.x=-sw; u.armL.rotation.x=-sw; u.armR.rotation.x=act==="attack"||act==="skill"?-1.6:sw; } }
/* ---------- 효과 (예고 고리·줄·탄) ---------- */
function arWarnRing(x,z,r,t,col){ const m=new THREE.Mesh(new THREE.RingGeometry(r-.45,r,40),glowMat(col||0xff4060,.85)); m.rotation.x=-Math.PI/2; m.position.set(x,.12,z); m.userData.noOutline=true; scene.add(m); const fill=new THREE.Mesh(new THREE.CircleGeometry(r,32),glowMat(col||0xff4060,.18)); fill.rotation.x=-Math.PI/2; fill.position.set(x,.1,z); fill.userData.noOutline=true; scene.add(fill); return {m,fill,t,T:t}; }
function arWarnLine(x,z,rot,len,w,t){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),glowMat(0xff4060,.3)); m.rotation.x=-Math.PI/2; m.rotation.z=-rot; m.position.set(x+Math.sin(rot)*len/2,.12,z+Math.cos(rot)*len/2); m.userData.noOutline=true; scene.add(m); return {m,t,T:t}; }
function arOrb(x,z,tx,tz,col,dmg,src){ const m=sph(.45,glowMat(col,.95),x,1.6,z); m.userData.noOutline=true; scene.add(m); const d=Math.hypot(tx-x,tz-z)||1; AR.fx.push({kind:"orb",m,x,z,vx:(tx-x)/d*16,vz:(tz-z)/d*16,t:1.4,dmg,src,col}); }
function arClearFx(){ AR.fx.forEach(e=>{ if(e.m) scene.remove(e.m); if(e.w){ scene.remove(e.w.m); if(e.w.fill) scene.remove(e.w.fill); } }); AR.fx=[]; }
/* ---------- 결투 ---------- */
function arTargets(side){ const F=AR.f; if(!F) return []; if(side==="foe"){ const L=[]; if(!F.meDown) L.push({me:1,x:P.x,z:P.z}); F.allies.forEach(a=>{ if(a.hp>0) L.push({ally:a,x:a.x,z:a.z}); }); return L; } return F.foes.filter(m=>m.hp>0).map(m=>({foe:m,x:m.x,z:m.z})); }
function arHitT(tg,dmg,src,sure){ const F=AR.f; if(!F||F.state!=="fight") return; if(tg.me){ if(F.meDown) return; if(!sure&&P.y>.8){ floatDmg(P.x,3,P.z,"피함!","gain"); G.dodges=(G.dodges||0)+1; return; } if(P.invul>0) return; F.myHp=Math.max(0,F.myHp-dmg); P.hitFlash=.25; P.shake=Math.max(P.shake||0,.35); floatDmg(P.x,3.6,P.z,"-"+Math.round(dmg),""); tone(150,.08,"square",0,.08); buzz(20); try{ if(player.userData.gl) animState(player,"hit"); }catch(e){} if(F.myHp<=0){ F.meDown=1; floatDmg(P.x,4.4,P.z,"무릎!",""); } }
  else if(tg.ally){ const a=tg.ally; if(a.hp<=0) return; a.hp=Math.max(0,a.hp-dmg); a.hit=.2; floatDmg(a.x,3.6,a.z,"-"+Math.round(dmg),""); if(a.hp<=0){ a.down=0; fxSpark(a.x,1.5,a.z,0xffffff,14); } }
  else if(tg.foe){ damageMob(tg.foe,dmg,false); } }
function arStart(recs,mode,ally){ const F0=AR.f; if(F0) return; closeLayer(); const a=arData(); const ranked=a.n<AR_DAY; P.dead=false; AR.hp0=P.hp; const st=stat(); P.hp=Math.round(st.mhp*.5); arClearFx();
  const F=AR.f={mode,state:"intro",cd:3.6,t:AR_T,myHp:100,pots:2,meDown:0,foes:[],allies:[],recs,ranked,lastHp:P.hp,cnt:-1};
  P.x=ARX+(mode===2?2.5:0); P.z=ARZ+12; P.y=0; P.vy=0; P.rot=Math.PI; P.guide=null;
  if(mode===2){ F.foes.push(arFoe(recs[0],ARX-3.5,ARZ-12,.8)); F.foes.push(arFoe(recs[1],ARX+3.5,ARZ-12,.8)); if(ally) F.allies.push(arAlly(ally,ARX-3,ARZ+12.5)); }
  else F.foes.push(arFoe(recs[0],ARX,ARZ-12,1));
  F.foes.forEach(m=>{ m.rot=0; m.mesh.rotation.y=0; }); arHud(true); jingle([392,523,659]); tone(110,.4,"sawtooth",0,.08); }
function arTickFight(dt){ const F=AR.f; if(!F) return; const tn=performance.now();
  // 체력 회복 기술 → 결투장 체력으로
  if(F.state==="fight"&&P.hp>F.lastHp){ const st=stat(); F.myHp=Math.min(100,F.myHp+(P.hp-F.lastHp)/st.mhp*100); } { const st=stat(); P.hp=Math.round(st.mhp*.5); F.lastHp=P.hp; }
  if(F.state==="intro"){ F.cd-=dt; P.x=ARX+(F.mode===2?2.5:0); P.z=ARZ+12; const n=Math.ceil(F.cd-.6); if(n!==F.cnt){ F.cnt=n; if(n>0){ arBig(String(n)); tone(520,.12,"square",0,.07); } else { arBig("⚔ 결투!"); tone(784,.25,"square",0,.08); tone(1046,.3,"square",.08,.08); } } if(F.cd<=0){ F.state="fight"; } }
  else if(F.state==="fight"){ F.t-=dt; if(F.t<=0){ const mine=F.myHp/100, theirs=F.foes.reduce((s,m)=>s+m.hp/m.mhp,0)/F.foes.length; arEndFight(mine>=theirs); return; } }
  else if(F.state==="end"){ F.cd-=dt; F.foes.concat(F.allies).forEach(o=>{ if(o.kneel!=null){ o.kneel=Math.min(1,o.kneel+dt*2); o.mesh.rotation.x=o.kneel*.45; o.mesh.position.y=-o.kneel*.45; } }); if(F.cd<=0) arAfter(); return; }
  const fight=F.state==="fight";
  // 상대
  F.foes.forEach(m=>{ const ai=m.ai; m.hit=Math.max(0,m.hit-dt); if(m.hp<=0){ if(m.kneel==null) m.kneel=0; m.kneel=Math.min(1,m.kneel+dt*2); m.mesh.rotation.x=m.kneel*.45; m.mesh.position.set(m.x,-m.kneel*.45,m.z); return; } ai.cd-=dt; ai.stT-=dt; ai.buff=Math.max(0,ai.buff-dt); ai.sk.forEach(s=>s.cd-=dt); if(ai.stT<=0){ ai.stT=rnd(1.4,3.2); ai.strafe*=-1; }
    const T=arTargets("foe"); let tg=null, td=1e9; T.forEach(t=>{ const d=Math.hypot(t.x-m.x,t.z-m.z); if(d<td){ td=d; tg=t; } });
    let moving=false, act=null;
    if(fight&&tg&&!ai.cast){ const dx=tg.x-m.x, dz=tg.z-m.z, d=td||1; const want=ai.ranged?9:2.2; const spd=4.6*(ai.buff>0?1.2:1); m.rot=Math.atan2(dx,dz);
      if(d>want+.4){ m.x+=dx/d*spd*dt; m.z+=dz/d*spd*dt; moving=true; } else if(ai.ranged&&d<want-3){ m.x-=dx/d*spd*.8*dt; m.z-=dz/d*spd*.8*dt; moving=true; } else { m.x+=-dz/d*ai.strafe*1.8*dt; m.z+=dx/d*ai.strafe*1.8*dt; moving=true; }
      const sk=ai.sk.find(s=>s.cd<=0&&(s.k!=="heal"||m.hp/m.mhp<.6)&&(s.k!=="dash"||d<9)&&(s.k!=="line"||d<12)&&(s.k!=="ring"||d<10));
      if(sk){ sk.cd=rnd(6,9); arCast(m,sk,tg); act="skill"; }
      else if(ai.cd<=0&&d<=want+.6){ ai.cd=ai.ranged?1.3:1.1; act="attack"; m.mesh.userData.lunge=.25; const dm=5.5*m.f*(ai.buff>0?1.3:1); if(ai.ranged) arOrb(m.x,m.z,tg.x,tg.z,ai.buff>0?0xff8a3a:new THREE.Color(REALMS[m.rec.r].c1).getHex(),dm,m); else arHitT(tg,dm,m); try{ SLASH.swing(m.x,m.z,m.rot,new THREE.Color(REALMS[m.rec.r].c1).getHex(),"sword"); }catch(e){} } }
    if(ai.cast){ const c=ai.cast; c.t-=dt; if(c.k==="dash"&&c.t<=c.T-.45&&!c.go){ c.go=1; } if(c.go&&c.k==="dash"&&!c.done){ const s=22*dt; m.x+=Math.sin(c.rot)*s; m.z+=Math.cos(c.rot)*s; c.dist-=s; if(c.dist<=0){ c.done=1; fxRing(m.x,m.z,0xff8a3a,4,.4); arTargets("foe").forEach(t=>{ if(Math.hypot(t.x-m.x,t.z-m.z)<2.6) arHitT(t,10*m.f,m); }); } } if(c.t<=0) ai.cast=null; }
    // 결투장 밖으로 안 나가게
    const r=Math.hypot(m.x-ARX,m.z-ARZ); if(r>AR_R-1.2){ const k=(AR_R-1.2)/r; m.x=ARX+(m.x-ARX)*k; m.z=ARZ+(m.z-ARZ)*k; }
    let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*10);
    const lu=m.mesh.userData.lunge||0; if(lu>0) m.mesh.userData.lunge=lu-dt; ai.jump=Math.max(0,ai.jump-dt); const jy=ai.jump>0?Math.sin(ai.jump/.5*Math.PI)*1.2:0; if(fight&&Math.random()<dt*.15) ai.jump=.5;
    m.mesh.position.set(m.x,jy+(lu>0?.3:0),m.z); m.mesh.rotation.x=0; try{ HITF.apply(m,dt); }catch(e){} hitTint(m.mesh,m.hit/.15); arAnim(m,moving,dt,act);
    if(m.pet) arPetTick(m.pet,m,"foe",dt);
    placeLabel(m.lbl,m.x,4.5,m.z,`<b style="color:${REALMS[m.rec.r].c1}">${m.rec.bot?"🤖 ":""}${m.n}</b><span class="hp mob"><s></s><i></i></span>`); hpBar(m.lbl,m.hp/m.mhp); });
  // 내 편 (2:2)
  F.allies.forEach(a=>{ const ai=a.ai; a.hit=Math.max(0,a.hit-dt); if(a.hp<=0){ if(a.kneel==null) a.kneel=0; a.kneel=Math.min(1,a.kneel+dt*2); a.mesh.rotation.x=a.kneel*.45; a.mesh.position.y=-a.kneel*.45; placeLabel(a.lbl,a.x,3.6,a.z,`<b>${a.n}</b> 무릎`); return; }
    ai.cd-=dt; ai.sk.forEach(s=>s.cd-=dt); const T=arTargets("ally"); let tg=null, td=1e9; T.forEach(t=>{ const d=Math.hypot(t.x-a.x,t.z-a.z); if(d<td){ td=d; tg=t; } }); let moving=false, act=null; const st=stat();
    if(fight&&tg){ const dx=tg.x-a.x, dz=tg.z-a.z, d=td||1; const want=ai.ranged?8:2.3; a.rot=Math.atan2(dx,dz); if(d>want){ a.x+=dx/d*4.4*dt; a.z+=dz/d*4.4*dt; moving=true; }
      const sk=ai.sk.find(s=>s.cd<=0&&s.k!=="heal"); if(sk&&d<6){ sk.cd=rnd(7,10); act="skill"; fxRing(a.x,a.z,new THREE.Color(REALMS[a.rec.r].c1).getHex(),8,.5); fxSpark(a.x,1.5,a.z,0xffffff,16); floatDmg(a.x,4.6,a.z,sk.n,"gain"); F.foes.forEach(m=>{ if(m.hp>0&&Math.hypot(m.x-a.x,m.z-a.z)<5) damageMob(m,st.atk*1.5*a.f,false); }); }
      else if(ai.cd<=0&&d<=want+.5){ ai.cd=1.2; act="attack"; if(ai.ranged) arOrb(a.x,a.z,tg.x,tg.z,0x7ac8ff,st.atk*.55*a.f,a); else damageMob(tg.foe,st.atk*.55*a.f*rnd(.9,1.1),false); } }
    const r=Math.hypot(a.x-ARX,a.z-ARZ); if(r>AR_R-1.2){ const k=(AR_R-1.2)/r; a.x=ARX+(a.x-ARX)*k; a.z=ARZ+(a.z-ARZ)*k; }
    let dr=a.rot-a.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; a.mesh.rotation.y+=dr*Math.min(1,dt*10); a.mesh.position.set(a.x,0,a.z); hitTint(a.mesh,a.hit/.2); arAnim(a,moving,dt,act);
    if(a.pet) arPetTick(a.pet,a,"ally",dt);
    placeLabel(a.lbl,a.x,4.4,a.z,`<b style="color:#7ad8ff">🤝 ${a.n}</b><span class="hp"><i style="width:${Math.round(a.hp)}%"></i></span>`); });
  // 효과
  for(let i=AR.fx.length-1;i>=0;i--){ const e=AR.fx[i]; e.t-=dt;
    if(e.kind==="orb"){ e.x+=e.vx*dt; e.z+=e.vz*dt; e.m.position.set(e.x,1.6,e.z); const side=e.src&&e.src.arena?"foe":"ally"; let hit=false; arTargets(side).forEach(t=>{ if(!hit&&Math.hypot(t.x-e.x,t.z-e.z)<1.1){ hit=true; arHitT(t,e.dmg,e.src); } }); if(hit||e.t<=0||Math.hypot(e.x-ARX,e.z-ARZ)>AR_R+2){ fxSpark(e.x,1.6,e.z,e.col,8); scene.remove(e.m); AR.fx.splice(i,1); } continue; }
    if(e.w){ const w=e.w; w.t-=dt; const p=1-w.t/w.T; w.m.material.opacity=.45+Math.sin(tn/60)*.35; if(w.fill) w.fill.material.opacity=.12+p*.25; if(w.t<=0){ scene.remove(w.m); if(w.fill) scene.remove(w.fill); e.go(); AR.fx.splice(i,1); } } }
  // 끝?
  if(fight){ if(F.foes.every(m=>m.hp<=0)) arEndFight(true); else if(F.meDown&&F.allies.every(a=>a.hp<=0)) arEndFight(false); }
  arHud(); }
function arCast(m,sk,tg){ const ai=m.ai, f=m.f; floatDmg(m.x,4.8,m.z,sk.n,"crit"); tone(330,.12,"sawtooth",0,.06); const col=new THREE.Color(REALMS[m.rec.r].c1).getHex();
  if(sk.k==="ring"){ const x=tg.x, z=tg.z; const w=arWarnRing(x,z,3.6,1.0); ai.cast={k:"ring",t:.6,T:.6}; AR.fx.push({w,go:()=>{ fxRing(x,z,col,8,.5); fxSpark(x,1,z,col,24); P.shake=Math.max(P.shake||0,.4); thud(); arTargets("foe").forEach(t=>{ if(Math.hypot(t.x-x,t.z-z)<3.6) arHitT(t,13*f,m); }); }}); }
  else if(sk.k==="line"){ const rot=Math.atan2(tg.x-m.x,tg.z-m.z); const x0=m.x, z0=m.z; const w=arWarnLine(x0,z0,rot,13,2.6,.85); ai.cast={k:"line",t:.9,T:.9}; m.rot=rot; AR.fx.push({w,go:()=>{ fxLine(x0,z0,rot,13,col); arTargets("foe").forEach(t=>{ const dx=t.x-x0, dz=t.z-z0; const along=dx*Math.sin(rot)+dz*Math.cos(rot), side=Math.abs(dx*Math.cos(rot)-dz*Math.sin(rot)); if(along>-1&&along<13.5&&side<1.5) arHitT(t,14*f,m); }); }}); }
  else if(sk.k==="dash"){ const rot=Math.atan2(tg.x-m.x,tg.z-m.z); const dist=Math.min(9,Math.hypot(tg.x-m.x,tg.z-m.z)+1); const w=arWarnLine(m.x,m.z,rot,dist,2.2,.45); AR.fx.push({w,go:()=>{}}); m.rot=rot; ai.cast={k:"dash",t:.95,T:.95,rot,dist}; }
  else if(sk.k==="heal"){ if(m.hp/m.mhp<.6&&ai.healed<2){ ai.healed++; const h=Math.round(m.mhp*.15); m.hp=Math.min(m.mhp,m.hp+h); floatDmg(m.x,3.8,m.z,"+"+fmt(h),"gain"); fxRing(m.x,m.z,0x9dffb8,5,.6); fxSpark(m.x,2,m.z,0x9dffb8,20); } else { ai.buff=5; fxRing(m.x,m.z,col,5,.5); } }
  else { ai.buff=5; fxRing(m.x,m.z,0xff8a3a,6,.6); fxSpark(m.x,2,m.z,0xff8a3a,22); } }
function arPetTick(o,owner,side,dt){ o.atk-=dt; o.tx=o.tz=null; const T=arTargets(side==="foe"?"foe":"ally"); let tg=null, td=1e9; T.forEach(t=>{ const d=Math.hypot(t.x-o.x,t.z-o.z); if(d<td){ td=d; tg=t; } }); if(tg&&td<9&&AR.f&&AR.f.state==="fight"){ o.tx=tg.x; o.tz=tg.z; if(o.atk<=0){ o.atk=2.6; o.mesh.userData.lunge=1; fxLine(o.x,o.z,Math.atan2(tg.x-o.x,tg.z-o.z),Math.min(8,td),0xffe08a); if(side==="foe") arHitT(tg,2*owner.f,owner,true); else damageMob(tg.foe,stat().atk*.25,false); } } try{ followPet(o,owner.x,owner.z,owner.mesh.rotation.y,dt); }catch(e){} }
function arEndFight(win,abort){ const F=AR.f; if(!F||F.state==="end") return; arClearFx();
  if(abort){ arCleanup(); return; }
  F.state="end"; F.win=!!win; F.cd=3.2; const a=arData(); let dp=0; const real=F.recs.filter(r=>!r.bot);
  if(F.ranked){ a.n++; if(win){ dp=real.length?24:12; if(F.recs.some(r=>arTier(r.p)>arTier(a.p))) dp+=6; } else dp=-6; a.p=Math.max(0,(a.p||0)+dp); a.sp=Math.max(0,(a.sp||0)+Math.max(0,dp)); }
  if(win){ a.win=(a.win||0)+1; const L=G.lv; const gold=60+L*8; G.gold+=gold; gainXp(Math.round(xpNeed(L)*.03)); F.gold=gold; } else { a.lose=(a.lose||0)+1; G.gold+=20; F.gold=20; }
  F.dp=dp; saveGame();
  F.rts=Date.now(); real.forEach(r=>{ try{ net.pushRet("arr/"+r.i+"/"+G.id,{i:G.id,n:G.name,r:G.realm,o:r.i,w:win?1:0,ts:F.rts,m:F.mode}); }catch(e){} }); F.sent=real.map(r=>r.i);
  arPub();
  if(win) F.foes.forEach(m=>{ if(m.kneel==null) m.kneel=0; }); else F.allies.forEach(x=>{ if(x.kneel==null) x.kneel=0; });
  arBig(win?"🏆 승리!":"💫 무릎을 꿇었어요"); if(win){ jingle([523,659,784,1046,1318,1568]); buzz([30,30,60]); fxRing(P.x,P.z,0xffcf4a,10,1); for(let k=0;k<3;k++) setTimeout(()=>fxSpark(P.x+rnd(-2,2),3,P.z+rnd(-2,2),0xffcf4a,24),k*200); try{ if(player.userData.gl) animState(player,"cheer"); }catch(e){} } else { jingle([523,494,440,392]); } }
function arCleanup(){ const F=AR.f; if(!F) return; F.foes.forEach(m=>{ const i=mobs.indexOf(m); if(i>=0) mobs.splice(i,1); scene.remove(m.mesh); m.lbl.remove(); if(m.pet) scene.remove(m.pet.mesh); }); F.allies.forEach(a=>{ scene.remove(a.mesh); a.lbl.remove(); if(a.pet) scene.remove(a.pet.mesh); }); AR.f=null; arHud(false); P.hp=Math.max(1,Math.min(stat().mhp,AR.hp0||stat().mhp)); }
(function(){ const _km=killMob; killMob=function(m){ if(m&&m.arena){ m.hp=0; m.lbl.style.display="none"; fxSpark(m.x,2,m.z,0xffe08a,20); floatDmg(m.x,4.4,m.z,"무릎!","gain"); if(m.pet){ scene.remove(m.pet.mesh); m.pet=null; } m.kneel=0; const i=mobs.indexOf(m); if(i>=0) mobs.splice(i,1); return; } return _km(m); };
  const _hp=hurtPlayer; hurtPlayer=function(d,f){ if(AR.on) return; return _hp(d,f); };
  const _up=usePotion; usePotion=function(){ const F=AR.f; if(F&&F.state==="fight"){ if(F.pots<=0){ toast("결투마다 물약은 2번까지예요"); return; } if(F.myHp>=100){ toast("체력이 가득해요"); return; } F.pots--; F.myHp=Math.min(100,F.myHp+30); fxRing(P.x,P.z,0x9dffb8,4); fxSpark(P.x,2,P.z,0x9dffb8,18); jingle([659,880]); floatDmg(P.x,3.8,P.z,"+30","gain"); return; } return _up(); };
  const _sh=spawnAtHome; spawnAtHome=function(){ if(AR.on) arExit(true,true); _sh(); };
  const _sw=showWarPrompt; showWarPrompt=function(){ if(AR.on){ toast("⚔ 다른 곳에서 전쟁이 벌어지고 있어요","결투장을 마치고 가 봐요",1.8); return; } _sw(); }; })();
function arAfter(){ const F=AR.f; if(!F) return; const win=F.win, dp=F.dp, gold=F.gold, ranked=F.ranked, sent=F.sent||[], recs=F.recs, rts=F.rts||Date.now(), mode=F.mode; arCleanup(); P.x=ARX; P.z=ARZ+AR_R+9; P.rot=Math.PI; try{ arStatues(); }catch(e){} const a=arData(); const T=AR_TIER[arTier(a.p)];
  card(`<h2>${win?"🏆 승리!":"💫 좋은 결투였어요!"}</h2><p style="font-size:16px">${recs.map(r=>`<b style="color:${REALMS[r.r].c1}">${r.n}</b>`).join(" · ")}${josa(recs[recs.length-1].n,"과","와")}의 ${mode===2?"🤝 2:2":"⚔ 1:1"} 결투</p>
   <div class="idlegrid"><div><b>${ranked?(dp>=0?"+":"")+dp:"연습"}</b><span>${ranked?"결투 점수":"오늘 점수 결투 10판을 다 했어요"}</span></div><div><b>${T.ic} ${fmt(a.p)}</b><span>${T.n} (이번 주)</span></div><div><b>🪙 +${gold}</b><span>금화</span></div></div>
   ${sent.length?`<p style="font-size:13px">상대에게 정해진 말 하나를 남길 수 있어요</p><div class="exgrid" id="arSay">${AR_SAY.map((s,i)=>`<button class="buy alt" data-say="${i}">${s}</button>`).join("")}</div>`:""}
   <div class="exgrid"><button class="go" id="arAgain">⚔ 다음 결투</button><button class="buy alt" id="arOk">결투장 둘러보기</button></div>`);
  layers.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>{ const i=+b.dataset.say; sent.forEach(id=>{ try{ net.pushRet("arr/"+id+"/"+G.id,{i:G.id,n:G.name,r:G.realm,o:id,w:win?1:0,ts:rts,m:mode,gg:i+1}); }catch(e){} }); layers.querySelectorAll("[data-say]").forEach(x=>x.disabled=true); toast(`"${AR_SAY[i]}" 를 남겼어요`,null,1.4); tone(988,.08,"triangle"); });
  $("arAgain").onclick=()=>{ showArena(true); }; $("arOk").onclick=closeLayer; }
/* ---------- 화면 위 결투판 ---------- */
function arHud(show){ if(!AR.hud){ const st=document.createElement("style"); st.textContent=`#arHud{position:fixed;left:50%;top:calc(max(4px,env(safe-area-inset-top)) + 2px);transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:10px;pointer-events:none;width:min(46vw,460px)}#arHud[hidden]{display:none}#arHud .sd{flex:1;display:flex;flex-direction:column;gap:3px}#arHud .sd.r{align-items:flex-end}#arHud .nm{font-size:13px;font-weight:900;color:#fff;text-shadow:0 2px 0 #000,0 0 6px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}#arHud .bar{width:100%;height:13px;border-radius:7px;background:rgba(0,0,0,.55);border:2px solid #ffcf4a;overflow:hidden;box-shadow:0 0 0 2px rgba(0,0,0,.4)}#arHud .bar.s{height:8px;border-width:1px}#arHud .bar i{display:block;height:100%;transition:width .15s}#arHud .sd.l .bar i{background:linear-gradient(90deg,#3a8dff,#7ad8ff)}#arHud .sd.r .bar i{background:linear-gradient(270deg,#ff3a5a,#ff9a7a);margin-left:auto}#arHud .tm{min-width:58px;text-align:center;font-size:26px;font-weight:900;color:#ffcf4a;text-shadow:0 2px 0 #000,0 0 10px rgba(255,180,60,.7);background:radial-gradient(circle,rgba(40,20,0,.75),rgba(0,0,0,0) 70%);border-radius:50%}#arHud .tm small{display:block;font-size:10px;color:#fff}#arBig{position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:8;font-size:64px;font-weight:900;color:#ffcf4a;text-shadow:0 4px 0 #6a3a00,0 0 30px rgba(255,200,80,.9);pointer-events:none;opacity:0;transition:opacity .2s,transform .2s;white-space:nowrap}#arBig.on{opacity:1;transform:translate(-50%,-50%) scale(1.08)}`; document.head.appendChild(st);
    const h=document.createElement("div"); h.id="arHud"; h.hidden=true; document.body.appendChild(h); AR.hud=h; const b=document.createElement("div"); b.id="arBig"; document.body.appendChild(b); AR.big=b; }
  const F=AR.f; if(show===false||!F){ AR.hud.hidden=true; return; } AR.hud.hidden=false; let top=""; ["warbar","evbar","lvbar"].forEach(id=>{ const x=$(id); if(x&&!x.hidden){ const r=x.getBoundingClientRect(); if(r.height>0) top=Math.round(r.bottom+4)+"px"; } }); if(AR.hud._t!==top){ AR.hud._t=top; AR.hud.style.top=top; }
  const me=`<div class="nm">${G.name} ${F.pots?"🧪".repeat(F.pots):""}</div><div class="bar"><i style="width:${Math.round(F.myHp)}%"></i></div>${F.allies.map(a=>`<div class="nm" style="font-size:11px">🤝 ${a.n}</div><div class="bar s"><i style="width:${Math.round(a.hp)}%"></i></div>`).join("")}`;
  const foes=F.foes.map((m,k)=>`<div class="nm"${k?' style="font-size:11px"':""}>${m.rec.bot?"🤖 ":""}${m.n}</div><div class="bar${k?" s":""}"><i style="width:${Math.round(Math.max(0,m.hp)/m.mhp*100)}%"></i></div>`).join("");
  const html=`<div class="sd l">${me}</div><div class="tm">${Math.ceil(Math.max(0,F.t))}<small>${F.mode===2?"2:2":"1:1"}</small></div><div class="sd r">${foes}</div>`; if(AR.hud._h!==html){ AR.hud._h=html; AR.hud.innerHTML=html; } }
function arBig(t){ arHud(); const b=AR.big; if(!b) return; b.textContent=t; b.classList.add("on"); clearTimeout(b._t); b._t=setTimeout(()=>b.classList.remove("on"),t.length>3?1400:650); }
/* ---------- 쉬는 동안 수비 보고서 ---------- */
function arReport(){ const a=arData(); if(!a.regT) return; const L=[]; for(const id in ARR){ const d=ARR[id]; const prev=a.seen[id]||{}; if(d.ts<a.regT) continue; if(d.ts>(prev.ts||0)) L.push({d,nw:1}); else if(d.ts===prev.ts&&(d.gg||0)!==(prev.gg||0)&&d.gg) L.push({d,nw:0}); else continue; a.seen[id]={ts:d.ts,gg:d.gg||0}; }
  if(!L.length) return; let held=0, lost=0; L.forEach(x=>{ if(!x.nw) return; if(x.d.w){ lost++; a.dl=(a.dl||0)+1; a.p=Math.max(0,(a.p||0)-3); } else { held++; a.dw=(a.dw||0)+1; a.p=(a.p||0)+6; a.sp=(a.sp||0)+6; } }); saveGame(); arPub();
  AR.repQ.push({L,held,lost}); }
function arShowReport(q){ if(q.chest){ const T=AR_TIER[q.t]; card(`<h2>${T.ic} 지난주 결투장 정산!</h2><p style="font-size:16px">지난주 결투 점수 <b>${fmt(q.p)}</b>점 — <b style="color:${T.c}">${T.n}</b></p><div class="idlegrid"><div><b>🪙 +${fmt(q.gold)}</b><span>금화</span></div><div><b>⛓ +${q.ore}</b><span>쇳조각</span></div><div><b>✨ +${q.rune}</b><span>룬 가루</span></div></div><p style="font-size:13px">이번 주 점수는 0부터 다시 시작해요. 더 높은 방패에 도전!</p><button class="buy" id="arOk" style="align-self:center">좋아요!</button>`); jingle([523,659,784,1046,1318]); $("arOk").onclick=closeLayer; return; }
  const rows=q.L.slice(0,10).map(x=>{ const d=x.d, R=REALMS[d.r]; return `<div class="row"><div class="ic">${x.nw?(d.w?"💫":"🛡"):"🤝"}</div><div class="t"><div><b style="color:${R?R.c1:"#fff"}">${d.n}</b>${x.nw?(d.w?"님이 이겼어요":"님을 막아냈어요!"):"님"}${d.m===2?" (2:2)":""}</div><span>${fmtAgo(d.ts)}${d.gg?` · "${AR_SAY[d.gg-1]}"`:""}</span></div></div>`; }).join("");
  const n=q.held+q.lost; card(`<h2>⚔️ 내 수비 영웅 보고서</h2><p style="font-size:17px">${n?`쉬는 동안 내 영웅이 <b>${n}번</b> 도전을 받아 <b style="color:#7ad8ff">${q.held}번</b> 막아냈어요!`:"결투한 친구가 인사를 남겼어요!"}</p>${n?`<div class="idlegrid"><div><b>🛡 ${q.held}</b><span>막아냄 (+6점씩)</span></div><div><b>💫 ${q.lost}</b><span>짐 (−3점씩)</span></div></div>`:""}${rows}<button class="buy" id="arOk" style="align-self:center">좋아요!</button>`); jingle([659,784,988,1318]); $("arOk").onclick=closeLayer; }
/* ---------- 매 프레임 ---------- */
function arTick(dt){ if(!started||G.realm<0) return; const tn=performance.now(); AR.cd=Math.max(0,AR.cd-dt);
  AR.gates.forEach(s=>{ if(!s||!s.g) return; const u=s.g.userData; u.ring.rotation.z+=dt*1.4; u.disc.material.opacity=.25+Math.sin(tn/240)*.1; });
  if(!AR.gateLbl) AR.gateLbl=makeLabel("ally"); { const s=!AR.on?AR.gates.find(s=>s&&Math.hypot(P.x-s.x,P.z-s.z)<30):null; if(s&&!layerOpen) placeLabel(AR.gateLbl,s.x,8.6,s.z,`⚔️ <b>발할라 결투장</b>`); else AR.gateLbl.style.display="none"; }
  AR.t-=dt; if(AR.t<=0){ AR.t=1; arData(); if(AR.repT&&tn-AR.repT>2500){ AR.repT=0; arReport(); } }
  if(AR.repQ.length&&!layerOpen&&!P.dead&&!AR.f) arShowReport(AR.repQ.shift());
  AR.pubT-=dt; if(AR.pubT<=0){ AR.pubT=600; arPub(); }
  if(!AR.on) return; if(!arIn(P.x,P.z)){ arExit(true,true); return; }
  if(AR.rune) AR.rune.material.opacity=.25+Math.sin(tn/300)*.15;
  if(AR.f) arTickFight(dt);
  else { // 둘러보기
    const ex=AR.exitArch; if(ex&&AR.cd<=0&&Math.hypot(P.x-ex.x,P.z-ex.z)<2.6){ arExit(); return; }
    if(!AR.boardLbl) AR.boardLbl=makeLabel("ally"); if(AR.tab&&Math.hypot(P.x-AR.tab.x,P.z-AR.tab.z)<26&&!layerOpen) placeLabel(AR.boardLbl,AR.tab.x,4.4,AR.tab.z,"⚔ <b>결투 석판</b> · 상대 고르기"); else AR.boardLbl.style.display="none"; }
  AR.stat.forEach(s=>{ if(!AR.f&&!layerOpen&&Math.hypot(P.x-s.x,P.z-s.z)<14) placeLabel(s.lbl,s.x,5.4,s.z,s.txt); else s.lbl.style.display="none"; });
  AR.amb-=dt; if(AR.amb<=0){ AR.amb=ECO()?.6:.25; fxSpark(ARX+rnd(-30,30),rnd(.5,4),ARZ+rnd(-30,30),0xffc860,2); }
  const a=arData(); const T=AR_TIER[arTier(a.p)]; $("region").innerHTML=AR.f?`⚔️ 발할라 결투장 <b>${AR.f.mode===2?"2:2":"1:1"} 결투 중</b>`:`⚔️ 발할라 결투장 <b>${T.ic} ${fmt(a.p)}점</b>`; }
XTICK.push(arTick);
function arSky(dt){ SKY.tTop.setHex(0x3a5aa8); SKY.tBot.setHex(0xffc890); const k=Math.min(1,dt*1.5); SKY.top.lerp(SKY.tTop,k); SKY.bot.lerp(SKY.tBot,k); scene.fog.color.copy(SKY.bot); scene.fog.near=90; scene.fog.far=320;
  sky.position.copy(camera.position); STARS.material.opacity=0; MOON.visible=false; sun.position.set(P.x+40,80,P.z+20); sun.target.position.set(P.x,0,P.z); sun.intensity=1.05; sun.color.setHex(0xffe0b0); hemi.intensity=.5; fill.intensity=.25; skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize(); renderer.toneMappingExposure=.92; }
function arMinimap(){ const ctx=mctx, S=fitCanvas(mm); const s=S*.94/(AR_OUT*2+6); const X=x=>S/2+(x-ARX)*s, Z=z=>S/2+(z-ARZ)*s;
  ctx.fillStyle="#3a2e24"; ctx.fillRect(0,0,S,S); dot(ctx,X(ARX),Z(ARZ),AR_OUT*s,"#9a8a78","#6a5a4a",2); dot(ctx,X(ARX),Z(ARZ),AR_R*s,"#e8d6aa","#ffcf4a",2);
  if(AR.exitArch) dot(ctx,X(AR.exitArch.x),Z(AR.exitArch.z),S/26,"#ffd27a","#fff",2); if(AR.tab) dot(ctx,X(AR.tab.x),Z(AR.tab.z),S/30,"#c8a060","#fff",1.5);
  if(AR.f){ AR.f.foes.forEach(m=>{ if(m.hp>0) dot(ctx,X(m.x),Z(m.z),S/40,"#d93025","#fff",1.5); }); AR.f.allies.forEach(a=>{ if(a.hp>0) dot(ctx,X(a.x),Z(a.z),S/40,"#7ad8ff","#fff",1.5); }); }
  for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&arIn(o.x,o.z)) dot(ctx,X(o.x),Z(o.z),S/36,"#1e8e3e","#fff",1.5); }
  const px=X(P.x), pz=Z(P.z); ctx.save(); ctx.translate(px,pz); ctx.rotate(Math.PI-P.rot); ctx.fillStyle="#3a8dff"; ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.beginPath(); const q=S/20; ctx.moveTo(0,-q); ctx.lineTo(q*.7,q*.7); ctx.lineTo(0,q*.35); ctx.lineTo(-q*.7,q*.7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  mmLabel(ctx,"⚔️ 결투장",S/2,S*.07,Math.round(S/12),"#fff"); }
XZONE.push({on:()=>AR.on,clamp:()=>{ if(!arIn(P.x,P.z)){ arExit(true,true); return false; } const lim=AR.f?AR_R-.8:AR_OUT-1.2; const r=Math.hypot(P.x-ARX,P.z-ARZ); if(r>lim){ const k=lim/r; P.x=ARX+(P.x-ARX)*k; P.z=ARZ+(P.z-ARZ)*k; } return true; },sky:arSky,mm:arMinimap});
/* ---------- 창 ---------- */
function arRecRow(r,i,btn){ const R=REALMS[r.r]; const T=AR_TIER[arTier(r.p)]; const f=arPower(r); return `<div class="row"><div class="ic" style="color:${R.c1}">${r.bot?"🤖":R.icon}</div><div class="t"><div><b style="color:${R.c1}">${r.n}</b> ${r.bot?"":T.ic} Lv.${r.l}</div><span>${R.ranks[r.k||0]} · 힘 ${f>1.05?"조금 셈":f<.95?"조금 약함":"비슷함"}${r.sk&&r.sk.length?` · ${r.sk.join("·")}`:""}${r.pt&&PETS[r.pt[0]]?` · ${PETS[r.pt[0]].n}`:""}${r.bot?" · 신전 수련 전사":""}</span></div>${btn}</div>`; }
function showArena(shuffle){ const a=arData(); const T=AR_TIER[arTier(a.p)], nx=AR_TIER[arTier(a.p)+1]; const picks=(!AR.picks||shuffle)?arPick(!!shuffle):AR.picks; const mode=AR.mode;
  const w=arWeek(), S=arSeason(); const recs=Object.values(ARD).concat(a.regT?[arMyRec()]:[]); const wk=recs.filter(r=>r.w===w&&r.p>0).sort((x,y)=>y.p-x.p).slice(0,10); const fr=arFriends().filter(d=>!picks.some(p=>p.i===d.i)).slice(0,6);
  const inside=AR.on&&!AR.f; const btn=(r,i)=>inside?`<button class="buy" data-ar="${i}">${mode===2?"🤝 2:2":"⚔ 도전"}</button>`:"";
  const allySel=AR.ally&&ARD[AR.ally]?ARD[AR.ally]:fr[0]||null;
  card(`<h2>⚔️ 발할라 결투장</h2><p>내 <b>수비 영웅</b>이 결투장을 지켜요 — 내가 게임을 꺼 둬도 다른 사람이 도전하면 내 영웅이 대신 싸워요! 결투장 안에서는 체력을 맞춰 줘서 처음 온 사람도 이길 수 있어요. 다치지 않고, 지면 무릎만 꿇어요.</p>
   <div class="idlegrid"><div><b style="color:${T.c}">${T.ic} ${fmt(a.p)}</b><span>${T.n} · 이번 주${nx?` (${nx.ic} ${nx.min}점까지 ${nx.min-a.p})`:""}</span></div><div><b>⚔ ${a.win||0}승 ${a.lose||0}패</b><span>오늘 점수 결투 ${Math.min(a.n,AR_DAY)}/${AR_DAY}</span></div><div><b>🛡 ${a.dw||0}</b><span>수비 영웅이 막아낸 수</span></div></div>
   ${a.regT?`<p style="font-size:12px">🛡 내 수비 영웅: ${G.name} · ${RM().ranks[G.rank]} Lv.${G.lv} · 기술 ${arSkills().map(i=>RM().skills[i].n).join("·")||"없음"} (결투장에 올 때마다 지금 모습으로 바뀌어요)</p>`:`<p style="font-size:12px;color:var(--gold)">결투장에 처음 들어가면 내 수비 영웅이 등록돼요.</p>`}
   <h3>상대 고르기</h3><div class="exgrid"><button class="buy${mode===1?"":" alt"}" id="arM1">⚔ 1:1</button><button class="buy${mode===2?"":" alt"}" id="arM2">🤝 2:2 (친구 영웅과 함께)</button><button class="buy alt" id="arShuf">🔄 다른 상대</button></div>
   ${mode===2?`<p style="font-size:13px">내 편: ${allySel?`<b>🤝 ${allySel.n}</b>의 수비 영웅`:`🤖 ${arBot(3,arPow()).n}(신전 수련 전사)`}${fr.length>1?" · 아래에서 바꿀 수 있어요":""} · 상대: 위 3명 중 2명(고른 사람 + 옆 사람)</p>`:""}
   ${picks.map((r,i)=>arRecRow(r,i,btn(r,i))).join("")}
   ${mode===2&&fr.length?`<div class="exgrid" id="arAl">${fr.map(d=>`<button class="buy${allySel&&allySel.i===d.i?"":" alt"}" data-al="${d.i}">🤝 ${d.n}</button>`).join("")}</div>`:""}
   ${inside?"":AR.on?"":`<button class="go" id="arGo" style="align-self:center">⚔️ 결투장으로 가기</button>`}
   <h3>🏆 이번 주 결투 순위</h3>${wk.length?wk.map((r,k)=>`<div class="row"><div class="ic">${["🥇","🥈","🥉"][k]||k+1}</div><div class="t"><div><b style="color:${REALMS[r.r].c1}">${r.n}</b>${r.i===G.id?" (나)":""}</div><span>${AR_TIER[arTier(r.p)].ic} ${fmt(r.p)}점</span></div></div>`).join(""):`<p style="font-size:12px">아직 이번 주 점수가 없어요. 첫 승리를 해 봐요!</p>`}
   <p style="font-size:12px">이기면 +24점(로봇은 +12) · 지면 −6점 · 내 영웅이 막아내면 +6점 · 하루 10판까지 점수 · 매주 월요일 정산 상자(🥉🥈🥇💎) · 시즌 1~10등은 결투장 둘레에 금빛 석상! · 물약은 결투마다 2번 · 점프로 피할 수 있어요.</p>`);
  $("arM1").onclick=()=>{ AR.mode=1; tone(660,.05); showArena(); }; $("arM2").onclick=()=>{ AR.mode=2; tone(660,.05); showArena(); }; $("arShuf").onclick=()=>{ tone(700,.05); showArena(true); };
  layers.querySelectorAll("[data-al]").forEach(b=>b.onclick=()=>{ AR.ally=b.dataset.al; tone(700,.05); showArena(); });
  layers.querySelectorAll("[data-ar]").forEach(b=>b.onclick=()=>{ const i=+b.dataset.ar; const P3=AR.picks; if(AR.mode===2){ const j=i===2?1:i+1; const ally=allySel||arBot(3,arPow()); arStart([P3[i],P3[j]],2,Object.assign({},ally,{n:ally.n})); } else arStart([P3[i]],1); });
  if($("arGo")) $("arGo").onclick=()=>{ const s=AR.gates[Math.max(0,G.realm)]; closeLayer(); if(s&&Math.hypot(P.x-s.x,P.z-s.z)<8) arEnter(); else if(s){ setGuide({x:s.x,z:s.z+5,label:"⚔️ 발할라 결투장 문"}); } }; }
CTX_EXTRA.push(()=>{ if(arGateNear()) return {t:"⚔️ 발할라 결투장으로",f:arEnter}; if(AR.on&&!AR.f&&AR.tab&&Math.hypot(P.x-AR.tab.x,P.z-AR.tab.z)<6) return {t:"⚔ 결투 석판 — 상대 고르기",f:()=>showArena()}; return null; });
MENU_X.push({ic:"⚔️",n:"발할라 결투장",id:"arBtn",sub:()=>{ const a=arData(); const T=AR_TIER[arTier(a.p)]; return `${T.ic} ${T.n} ${fmt(a.p)}점 · ${a.win||0}승 ${a.lose||0}패 · 🛡 수비 ${a.dw||0}번 막아냄`; },f:()=>showArena()});
TITLES.push({id:"ar1",n:"결투장의 새내기",t:0,h:"발할라 결투장에서 첫 승리",g:()=>[(G.ar&&G.ar.win)||0,1]},{id:"ar20",n:"발할라의 전사",t:2,h:"결투 20번 이기기",g:()=>[(G.ar&&G.ar.win)||0,20]},{id:"arg",n:"금 방패의 용사",t:2,h:"한 주에 금 방패(300점) 되기",g:()=>[G.ar?Math.max(G.ar.p||0,(G.ar.bestT||0)>=2?300:0):0,300]},{id:"arm",n:"신화 방패의 전설",t:3,h:"한 주에 신화 방패(600점) 되기",g:()=>[G.ar?Math.max(G.ar.p||0,(G.ar.bestT||0)>=3?600:0):0,600]},{id:"ard10",n:"잠든 수호자",t:2,h:"수비 영웅이 도전 10번 막아내기",g:()=>[(G.ar&&G.ar.dw)||0,10]});
</script>
