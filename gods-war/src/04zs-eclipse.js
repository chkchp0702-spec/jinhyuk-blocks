<script>
/* ================= v95-3: 🌑 배고픈 라후의 일식 축제 — 해를 한입 문 라후에게 꿀떡 던지기 (IDEAS G11/9-9) =================
   언제: 2주에 한 번 수요일 저녁 8시~8시 30분(한국 시간). 첫 회 11/11(수).
   하늘에 둥근 보랏빛 거인 머리 「라후」(인도 신화 — 우리 게임만의 귀여운 먹보 얼굴)가 해를 한입 앙! → 30분 동안 세상이 노을빛으로 어둑.
   🍡 꿀떡 모으기: 괴물 처치 +1(★정예 +3, 보스 +10) · 수도에서 「🔨 떡 찧기」(3번 찧으면 +1, 한 판 30개까지).
   화면 위 띠의 「🍡 던지기」로 하늘의 라후 입에 휙! 전 세계 합계(보관 ek/<회>/<id>: 세계·던진 수·구운 수)가 목표 360개를 넘으면
   배부른 라후가 해를 「퉤!」 → 하늘이 밝아지고 세계의 중심에 🌈 무지개 다리가 하루 동안. 함께한 사람 모두 보물 상자.
   쉬는 동안 성장: 내 영웅이 30분마다 꿀떡 1개를 구워 둠(최대 40개) → 다음 일식 때 저절로 라후에게 감(게임을 꺼 둬도 보관 메시지로 더해짐).
   🐘 가네샤 할아버지도 8초마다 1개씩 던져 줌(모든 폰이 시계로 같은 수).
   끝나면 세계별 합(던진 + 구운)이 가장 많은 세계 수도 위에 「☀️ 해를 돌려준 세계」 깃발 일주일.
   저장: G.ekK(대상 회) · G.ekBT(굽기 시작 시각) · G.ekS(이번 회 던진 수) · G.ekHave(가진 꿀떡) · G.ekMor(찧어서 얻은 수) · G.ekPaid{회} · G.ekTot · G.ekWin. 칭호 3개. */
const EK_START=Date.UTC(2026,10,11,11,0,0), EK_P=14*86400000, EK_DUR=30*60000, EK_GOAL=360, EK_BAKE=30*60000, EK_BAKEMAX=40, EK_GANE=8000, EK_MORMAX=30;
const EK={rec:{},dark:0,built:false,g:null,P:null,bar:null,rb:null,flag:null,flagR:-1,pubT:0,dirty:false,ann:{},okShown:{},pound:0,fly:[],winShown:-1};
function ekStartOf(k){ return EK_START+k*EK_P; }
function ekNextK(t){ t=t||Date.now(); return Math.max(0,Math.ceil((t-EK_START-EK_DUR)/EK_P)); }   // 지금 하는 중이거나 다음 회
function ekActive(t){ t=t||Date.now(); const k=ekNextK(t), s=ekStartOf(k); return t>=s&&t<s+EK_DUR; }
function ekKst(t){ return new Date(t+9*3600000); }
function ekWhen(k){ const d=ekKst(ekStartOf(k)); return `${d.getUTCMonth()+1}/${d.getUTCDate()}(${"일월화수목금토"[d.getUTCDay()]}) 저녁 8시`; }
function ekGane(k,t){ t=t||Date.now(); const s=ekStartOf(k); return Math.max(0,Math.floor((Math.min(t,s+EK_DUR)-s)/EK_GANE)); }
function ekSums(k){ const R=EK.rec[k]||{}; const by=[0,0,0,0]; let thrown=0; for(const id in R){ const o=R[id]; const v=(o.s|0)+Math.min(EK_BAKEMAX,o.b|0); if(o.r>=0&&o.r<4) by[o.r]+=v; thrown+=v; }
  const me=G.ekK===k?(G.ekS|0)+ekBaked(k):0; const mine=R[G.id]; if(G.realm>=0&&me>((mine?(mine.s|0)+Math.min(EK_BAKEMAX,mine.b|0):0))){ const add=me-(mine?(mine.s|0)+Math.min(EK_BAKEMAX,mine.b|0):0); by[G.realm]+=add; thrown+=add; }
  const gane=ekGane(k); return {by,players:thrown,gane,total:thrown+gane}; }
function ekWinner(k){ const b=ekSums(k).by; let w=-1,m=0; b.forEach((v,i)=>{ if(v>m){ m=v; w=i; } }); return w; }
function ekBaked(k){ if(G.ekK!==k||!G.ekBT) return 0; const until=Math.min(Date.now(),ekStartOf(k)); return Math.max(0,Math.min(EK_BAKEMAX,Math.floor((until-G.ekBT)/EK_BAKE))); }
function ekRecv(d,topic){ const a=String(topic).split("/"); const k=+a[1], id=a[2]; if(!(k>=0)||!id||!d) return; (EK.rec[k]||(EK.rec[k]={}))[id]={r:d.r|0,s:d.s|0,b:d.b|0,n:d.n||"?"}; }
NETX.push({sub:()=>"ek/"+ekNextK()+"/+",pre:"ek/",f:ekRecv});
NETX.push({sub:()=>"ek/"+Math.max(0,ekNextK()-1)+"/+",pre:"ek/",f:ekRecv});
function ekPub(){ if(G.realm<0||G.ekK==null) return; const k=G.ekK, rec={i:G.id,n:G.name,r:G.realm,s:G.ekS|0,b:ekBaked(k),t:Date.now()}; (EK.rec[k]||(EK.rec[k]={}))[G.id]={r:rec.r,s:rec.s,b:rec.b,n:rec.n}; try{ net.pushRet("ek/"+k+"/"+G.id,rec); EK.dirty=false; }catch(e){} }
/* 회가 바뀌면 굽기 다시 시작 */
function ekRoll(){ const k=ekNextK(); if(G.ekK===k) return; const prevK=G.ekK; if(prevK!=null&&prevK<k){ G.ekBT=Math.max(G.ekBT||0,ekStartOf(k-1)+EK_DUR); } if(!G.ekBT) G.ekBT=Date.now()-4*3600000;   // 처음엔 8개 구워 둔 채로 시작
  G.ekK=k; G.ekS=0; G.ekHave=0; G.ekMor=0; saveGame(); EK.dirty=true; }
/* ---------- 라후 · 해 (하늘에 붙어 있음) ---------- */
function ekModel(){ const g=new THREE.Group(); const B=o=>{ const m=new THREE.MeshBasicMaterial(Object.assign({fog:false},o)); return m; };
  const sun=new THREE.Group(); const disc=new THREE.Mesh(new THREE.CircleGeometry(24,40),B({color:0xffd64a})); sun.add(disc); const halo=new THREE.Mesh(new THREE.RingGeometry(24,40,40),B({color:0xffb030,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending})); sun.add(halo); g.add(sun);
  const head=new THREE.Group(); const skin=B({color:0x6a5ad0}), dark=B({color:0x1a1030}), white=B({color:0xffffff}), pink=B({color:0xff8ab8}), gold=B({color:0xffc83a});
  head.add(new THREE.Mesh(new THREE.CircleGeometry(21,40),skin)); const hair=new THREE.Mesh(new THREE.RingGeometry(19,23,40,1,0,Math.PI),B({color:0x3a2a8a})); hair.position.z=.1; head.add(hair);
  const eyes=[]; [-1,1].forEach(s=>{ const e=new THREE.Group(); e.position.set(s*7,5,.3); const w=new THREE.Mesh(new THREE.CircleGeometry(4.6,24),white); e.add(w); const p=new THREE.Mesh(new THREE.CircleGeometry(2.4,20),dark); p.position.set(0,-.6,.1); e.add(p); const sh=new THREE.Mesh(new THREE.CircleGeometry(.8,10),white); sh.position.set(.9,.4,.2); e.add(sh); head.add(e); eyes.push(e);
    const ch=new THREE.Mesh(new THREE.CircleGeometry(3,20),B({color:0xff8ab8,transparent:true,opacity:.7})); ch.position.set(s*11,-3,.2); head.add(ch); });
  const mouth=new THREE.Mesh(new THREE.CircleGeometry(7,28,Math.PI,Math.PI),dark); mouth.position.set(0,-6,.3); head.add(mouth); const tongue=new THREE.Mesh(new THREE.CircleGeometry(3.6,20,Math.PI,Math.PI),pink); tongue.position.set(0,-9.5,.4); head.add(tongue);
  const crown=new THREE.Group(); crown.position.set(0,20,.2); crown.add(new THREE.Mesh(new THREE.PlaneGeometry(16,3),gold)); [-6,-2,2,6].forEach(x=>{ const t=new THREE.Mesh(new THREE.CircleGeometry(2,3),gold); t.position.set(x,2,0); t.rotation.z=Math.PI/2; crown.add(t); }); head.add(crown);
  g.add(head); let ro=60; g.traverse(o=>{ o.frustumCulled=false; o.renderOrder=ro++; if(o.material){ o.material.depthTest=false; o.material.depthWrite=false; o.material.transparent=true; } }); /* 땅·건물에 가리지 않게 하늘 스티커처럼 맨 위에 */ g.userData.noOutline=true; g.userData.cullR=-1; return {g,sun,head,eyes,mouth,tongue,halo}; }
const _ekV=new THREE.Vector3(), _ekD=new THREE.Vector3();
/* 화면 오른쪽 위 하늘 자리(달처럼 나를 따라다님) — 카메라가 내려다봐도 보이게 화면 기준 */
function ekSkyPos(out){ _ekD.set(.34,.14,.5).unproject(camera).sub(camera.position).normalize(); return out.copy(camera.position).addScaledVector(_ekD,230); }
/* ---------- 하늘 어둡게 (dayNight 뒤에 덧칠) ---------- */
(function(){ if(typeof dayNight!=="function") return; const _dn=dayNight; const cTop=new THREE.Color(0x3a1d5a), cBot=new THREE.Color(0xc06a7a);
  dayNight=function(dt){ const r=_dn.apply(this,arguments); const e=EK.dark; if(e>.01){ sun.intensity*=1-.55*e; hemi.intensity*=1-.35*e; fill.intensity*=1-.3*e; const k=Math.min(1,dt*2)*e; SKY.top.lerp(cTop,k); SKY.bot.lerp(cBot,k*.8); scene.fog.color.copy(SKY.bot); renderer.toneMappingExposure*=1-.18*e; } return r; }; })();
/* ---------- 꿀떡 모으기 · 던지기 ---------- */
(function(){ const _k=killMob; killMob=function(m){ const r=_k.apply(this,arguments); try{ if(ekActive()&&!m.war){ ekRoll(); const n=m.boss?10:m.elite?3:1; G.ekHave=(G.ekHave||0)+n; floatDmg(m.x,3,m.z,`+🍡${n}`,"gain"); } }catch(e){} return r; }; })();
function ekPound(){ if(!ekActive()) return; ekRoll(); if((G.ekMor|0)>=EK_MORMAX){ toast("🔨 방앗간 떡은 이번 판에 다 찧었어요","괴물을 잡아서 꿀떡을 더 모아요!",1.8); return; }
  EK.pound++; P.shake=Math.max(P.shake||0,.15); fxSpark(P.x,1,P.z,0xffffff,6); tone(140,.12,"sine",0,.15); tone(90,.15,"sine",.03,.12); buzz(15);
  if(EK.pound%3===0){ G.ekMor=(G.ekMor|0)+1; G.ekHave=(G.ekHave|0)+1; floatDmg(P.x,3,P.z,"+🍡1","gain"); tone(880,.08,"triangle",.05); }
  else floatDmg(P.x,2.6,P.z,"쿵!",""); }
CTX_EXTRA.push(()=>ekActive()&&inCapital(P.x,P.z)?{t:`🔨 떡 찧기${(G.ekMor|0)>=EK_MORMAX?" (다 찧음)":""}`,f:ekPound}:null);
function ekThrow(){ if(!ekActive()||P.dead) return; ekRoll(); const n=G.ekHave|0; if(n<=0){ toast("🍡 꿀떡이 없어요","괴물을 잡거나 수도에서 떡을 찧어요",1.6); return; }
  const before=ekSums(G.ekK).total; G.ekS=(G.ekS|0)+n; G.ekHave=0; G.ekTot=(G.ekTot||0)+n; saveGame(); EK.dirty=true; EK.pubT=Math.min(EK.pubT,.5);
  ekFly(P.x,P.z,Math.min(8,n)); try{ net.send({t:"ekt",n}); }catch(e){} jingle([523,659,784]); buzz([15,15]);
  setTimeout(()=>{ tone(200,.15,"square",0,.06); tone(160,.2,"square",.1,.06); toast(`😋 냠냠! 라후가 꿀떡 ${n}개를 먹었어요`,`전 세계 ${ekSums(G.ekK).total}/${EK_GOAL}`,1.8); if(EK.P) EK.chomp=.6; },900);
  if(before<EK_GOAL&&ekSums(G.ekK).total>=EK_GOAL) setTimeout(ekCheckOk,1200); }
NETR.ekt=(o,d)=>{ if(!ekActive()) return; if(Math.hypot(o.x-P.x,o.z-P.z)<60) ekFly(o.x,o.z,Math.min(6,d.n|0)); };
function ekFly(x,z,n){ const m1=mat({color:0xffe9f0}), m2=mat({color:0x9ad86a}), m3=mat({color:0xffd27a}); const ms=[m1,m2,m3];
  for(let i=0;i<n;i++){ const o=sph(.35,ms[i%3],0,0,0); o.position.set(x+rnd(-.6,.6),hAt(x,z)+2,z+rnd(-.6,.6)); scene.add(o); EK.fly.push({o,t:-i*.08,s:o.position.clone()}); } }
function ekFlyTick(dt){ if(!EK.fly.length) return; ekSkyPos(_ekV); for(let i=EK.fly.length-1;i>=0;i--){ const f=EK.fly[i]; f.t+=dt; if(f.t<0) continue; const k=Math.min(1,f.t/1);
  const tx=f.s.x+(_ekV.x-f.s.x)*.25, ty=f.s.y+40, tz=f.s.z+(_ekV.z-f.s.z)*.25; f.o.position.set(f.s.x+(tx-f.s.x)*k,f.s.y+(ty-f.s.y)*k+Math.sin(k*Math.PI)*6,f.s.z+(tz-f.s.z)*k); f.o.scale.setScalar(.7*(1-k*.7)); f.o.rotation.x+=dt*8;
  if(k>=1){ scene.remove(f.o); EK.fly.splice(i,1); } } }
/* ---------- 성공 · 보상 ---------- */
function ekCheckOk(){ const k=G.ekK; if(k==null) return; const S=ekSums(k); if(S.total<EK_GOAL||EK.okShown[k]) return; EK.okShown[k]=1;
  if(ekActive()&&!layerOpen){ toast("☀️ 퉤! 배부른 라후가 해를 뱉었어요!","세계의 중심에 🌈 무지개 다리가 생겼어요",3.4); jingle([523,659,784,1046,1318,1568]); for(let j=0;j<6;j++) setTimeout(()=>fxSpark(P.x+rnd(-6,6),6,P.z+rnd(-6,6),[0xffe08a,0xff8ab8,0x8ad8ff][j%3],14),j*150); }
  ekPay(k); }
function ekPay(k){ G.ekPaid=G.ekPaid||{}; if(G.ekPaid[k]) return; const mine=(G.ekK===k?(G.ekS|0)+ekBaked(k):0)||(((EK.rec[k]||{})[G.id]||{}).s|0)+(((EK.rec[k]||{})[G.id]||{}).b|0); if(mine<=0) return;
  G.ekPaid[k]=1; G.ekWin=(G.ekWin||0)+1; const L=G.lv, gold=Math.round(500+L*40+Math.min(200,mine)*3), xp=Math.round(xpNeed(L)*.1), ore=3+Math.floor(Math.random()*3); G.gold+=gold; gainXp(xp); G.ore=(G.ore||0)+ore;
  const got=[`금화 +${fmt(gold)}`,`경험치 +${fmt(xp)}`,`⛓ +${ore}`]; if(Math.random()<.5){ try{ got.push("🎁 "+evGear(.3)); }catch(e){} } saveGame();
  setTimeout(()=>{ try{ COINFLY.burst(P.x,1.6,P.z,12); }catch(e){} try{ lvBanner("☀️ 해를 돌려줬어요!",`라후의 감사 상자 · 내 꿀떡 ${mine}개`,got.join(" · "),"#ffd64a"); }catch(e){ toast("☀️ 라후의 감사 상자!",got.join(" · "),3); } },ekActive()?2200:3500); }
/* 지난 회 결과 (꺼 둔 동안 끝난 일식도) */
function ekPastCheck(){ const k=ekNextK()-1; if(k<0||ekActive()) return; const end=ekStartOf(k)+EK_DUR; if(Date.now()-end>EK_P) return; if(!EK.rec[k]) return;
  const S=ekSums(k); if(S.total>=EK_GOAL) ekPay(k); const w=ekWinner(k); if(w>=0&&EK.winShown!==k&&Date.now()-end<7*86400000&&!layerOpen){ EK.winShown=k; G.ekSeenW=G.ekSeenW||{}; if(!G.ekSeenW[k]){ G.ekSeenW[k]=1; saveGame(); toast(`☀️ 지난 일식 1등: ${REALMS[w].icon} ${REALMS[w].n}!`,`${REALMS[w].n} 수도 위에 「해를 돌려준 세계」 깃발이 일주일 동안 펄럭여요`,3.2); } } }
/* ---------- 무지개 다리 · 깃발 ---------- */
function ekRainbow(on){ if(!on){ if(EK.rb) EK.rb.visible=false; return; } if(!EK.rb){ const g=new THREE.Group(); [0xff4a4a,0xff9a3a,0xffe03a,0x4ad06a,0x3aa0ff,0x8a5aff].forEach((c,i)=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(46-i*1.4,.7,6,48,Math.PI),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.55,depthWrite:false})); g.add(t); });
  g.position.set(0,hAt(0,0)-2,-8); g.userData.noOutline=true; g.userData.cullR=-1; g.traverse(o=>o.frustumCulled=false); scene.add(g); EK.rb=g; } EK.rb.visible=true; }
function ekFlag(r){ if(EK.flagR===r) return; EK.flagR=r; if(EK.flag){ scene.remove(EK.flag); EK.flag=null; } if(r<0) return; const cap=REGIONS[r*3]; const g=new THREE.Group(); const gold=mat({color:0xffc83a,metalness:.5,roughness:.35,emissive:0x4a3000});
  g.add(cyl(.25,.25,10,gold,0,5,0,8)); const cl=new THREE.Mesh(new THREE.PlaneGeometry(5,3),new THREE.MeshBasicMaterial({color:new THREE.Color(REALMS[r].c1),side:THREE.DoubleSide})); cl.position.set(2.6,8.4,0); g.add(cl);
  const sunM=new THREE.Mesh(new THREE.CircleGeometry(1,20),new THREE.MeshBasicMaterial({color:0xff9a1a,side:THREE.DoubleSide})); sunM.position.set(2.6,8.4,.02); g.add(sunM); g.add(sph(.45,gold,0,10.2,0));
  g.position.set(cap.x,hAt(cap.x,cap.z)+14,cap.z); g.userData.cloth=cl; g.userData.noOutline=true; scene.add(g); EK.flag=g; }
/* ---------- 매 프레임 ---------- */
function ekTick(dt){ if(!started||G.realm<0) return; ekRoll(); const now=Date.now(), act=ekActive(), k=G.ekK, S=act?ekSums(k):null; const ok=act&&S.total>=EK_GOAL;
  // 알림
  const st=ekStartOf(ekNextK()); const pre=st-now; if(pre>0&&pre<10*60000&&!EK.ann["p"+st]){ EK.ann["p"+st]=1; if(!layerOpen) toast("🌑 10분 뒤에 배고픈 라후가 와요!","저녁 8시 · 꿀떡을 던져서 해를 돌려받아요",3); }
  if(act&&!EK.ann["s"+st]){ EK.ann["s"+st]=1; setTimeout(()=>{ if(!layerOpen){ toast("🌑 라후가 해를 한입 앙! 물었어요!","괴물을 잡고 수도에서 떡을 찧어 꿀떡을 모아 던져요 · 내 영웅이 구운 꿀떡도 보냈어요",3.6); jingle([392,330,262]); } },1500); EK.dirty=true; }
  if(ok) ekCheckOk();
  EK.dark+=(((act&&!ok)?1:0)-EK.dark)*Math.min(1,dt*.6);
  // 하늘의 라후
  if(act){ if(!EK.built){ EK.built=true; try{ EK.P=ekModel(); EK.g=EK.P.g; scene.add(EK.g); }catch(e){ console.warn(e); } } }
  if(EK.g){ EK.g.visible=act&&!(typeof DG!=="undefined"&&DG.on)&&!(typeof HM!=="undefined"&&HM.on); if(EK.g.visible){ const Pm=EK.P; ekSkyPos(_ekV); EK.g.position.copy(_ekV); EK.g.lookAt(camera.position);
    const prog=Math.min(1,S.total/EK_GOAL); const tn=performance.now()/1000; EK.ho=(EK.ho==null?0:EK.ho); const tgt=ok?62:(1-prog)*6+prog*26; EK.ho+=(tgt-EK.ho)*Math.min(1,dt*1.5);
    Pm.head.position.set(EK.ho-4,-2+Math.sin(tn*1.2)*1.2,1); Pm.head.rotation.z=Math.sin(tn*.8)*.06; EK.chomp=Math.max(0,(EK.chomp||0)-dt); const mo=ok?.4:(EK.chomp>0?.4+Math.abs(Math.sin(EK.chomp*14))*.9:1);
    Pm.mouth.scale.set(1,mo,1); Pm.tongue.visible=mo>.6; const bl=(tn%3.5)<.12; Pm.eyes.forEach(e=>e.scale.y=bl?.1:1);
    Pm.halo.material.opacity=ok?.6:.12+prog*.2; Pm.sun.scale.setScalar(ok?1+Math.sin(tn*2)*.03:1); } }
  ekFlyTick(dt);
  // 무지개: 성공한 회가 끝나고 하루 동안 (또는 성공 직후)
  const pk=ekNextK()-1; let rbOn=ok; if(!act&&pk>=0&&EK.rec[pk]){ const end=ekStartOf(pk)+EK_DUR; if(now-end<86400000&&ekSums(pk).total>=EK_GOAL) rbOn=true; }
  ekRainbow(rbOn&&Math.hypot(P.x,P.z)<300);
  // 깃발: 지난 회 1등 세계 일주일
  let fr=-1; if(!act&&pk>=0&&EK.rec[pk]&&now-(ekStartOf(pk)+EK_DUR)<7*86400000) fr=ekWinner(pk); ekFlag(fr); if(EK.flag){ const c=EK.flag.userData.cloth; c.rotation.y=Math.sin(performance.now()/500)*.25; }
  // 보관 메시지
  EK.pubT-=dt; if(EK.pubT<=0){ EK.pubT=act?2:180; if(EK.dirty||!act){ const b=ekBaked(G.ekK); if(EK.dirty||b!==EK.lastB){ EK.lastB=b; ekPub(); } } }
  EK.pastT=(EK.pastT||3)-dt; if(EK.pastT<=0){ EK.pastT=5; ekPastCheck(); }
  ekBarUi(act,S); }
XTICK.push(ekTick);
function ekBarUi(act,S){ if(!EK.bar){ const b=document.createElement("div"); b.id="ekBar"; b.hidden=true; b.innerHTML='<div class="ekt"></div><button type="button" id="ekThrow">🍡 던지기</button>'; document.body.appendChild(b); EK.bar=b;
    b.querySelector("#ekThrow").addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); ekThrow(); }); }
  const b=EK.bar; const show=act&&!layerOpen&&started&&!(typeof DG!=="undefined"&&DG.on); if(!show){ if(!b.hidden) b.hidden=true; return; } b.hidden=false;
  let bot=0; ["warbar","bossbar","evbar","giBar","shBar"].forEach(id=>{ const el=$(id); if(el&&!el.hidden){ const r=el.getBoundingClientRect(); if(r.height>0) bot=Math.max(bot,r.bottom); } }); const top=bot>0?Math.round(bot+6)+"px":""; if(b._t!==top){ b._t=top; b.style.top=top; }
  const left=Math.max(0,Math.ceil((ekStartOf(G.ekK)+EK_DUR-Date.now())/60000)); const ok=S.total>=EK_GOAL; const pct=Math.min(100,Math.round(S.total/EK_GOAL*100));
  const h=`<b>${ok?"☀️ 해를 돌려받았어요! 축제 시간":"🌑 배고픈 라후의 일식"} · 🍡 ${S.total}/${EK_GOAL}</b><i style="--p:${pct}%"></i><span>남은 ${left}분 · ${ok?"더 던지면 우리 세계 깃발!":"꿀떡을 모아 라후 입에 던져요"}</span>`;
  const t=b.querySelector(".ekt"); if(t._h!==h){ t._h=h; t.innerHTML=h; } const btn=b.querySelector("#ekThrow"), bt=`🍡 던지기 ${G.ekHave|0}`; if(btn._t!==bt){ btn._t=bt; btn.textContent=bt; btn.disabled=!(G.ekHave>0); } }
/* ---------- 창 · 지도 ---------- */
MAP_X.push((ctx,tx,tz,big,u)=>{ if(!EK.rb||!EK.rb.visible) return; mapPin(ctx,tx(0),tz(-8),(big?6:7.5)*u,"#8a5aff","🌈"); });
function showEclipse(){ ekRoll(); const act=ekActive(), k=G.ekK, S=ekSums(k); const pk=k-1;
  const rows=[0,1,2,3].map(i=>`<div><b>${REALMS[i].icon} ${S.by[i]}</b><span>${REALMS[i].n}</span></div>`).join("");
  let past=""; if(pk>=0&&EK.rec[pk]){ const P2=ekSums(pk), w=ekWinner(pk); past=`<p style="font-size:13px">지난 일식(${ekWhen(pk)}): 🍡 ${P2.total}/${EK_GOAL} ${P2.total>=EK_GOAL?"☀️ 성공!":"— 아쉽게 모자랐어요"}${w>=0?` · 1등 ${REALMS[w].icon} ${REALMS[w].n}`:""}</p>`; }
  card(`<h2>🌑 배고픈 라후의 일식 축제</h2><p>2주에 한 번 저녁, 먹보 거인 머리 <b>라후</b>가 하늘에 나타나 해를 한입 앙! 물어요. 세상이 30분 동안 노을빛으로 어둑해지면, 모두 함께 <b>🍡 꿀떡</b>을 모아 라후 입에 던져요. 전 세계 합계가 <b>${EK_GOAL}개</b>가 되면 배부른 라후가 해를 「퉤!」 뱉어요.</p>
   <div class="idlegrid"><div><b>${act?"🌑 지금!":"🗓"}</b><span>${act?`남은 ${Math.max(0,Math.ceil((ekStartOf(k)+EK_DUR-Date.now())/60000))}분`:ekWhen(k)}</span></div><div><b>🍡 ${S.total}/${EK_GOAL}</b><span>${act?"전 세계 꿀떡":"이번 회 모인 꿀떡"}</span></div><div><b>${ekBaked(k)}/${EK_BAKEMAX}</b><span>내 영웅이 구운 꿀떡</span></div><div><b>${G.ekWin||0}</b><span>해를 돌려준 횟수</span></div></div>
   <h3>🏆 세계별 꿀떡</h3><div class="idlegrid">${rows}</div>${past}
   <h3>🎮 이렇게 놀아요</h3><div class="diary"><p>⚔ 일식 동안 괴물을 잡으면 🍡 +1 (★정예 +3, 보스 +10).</p><p>🔨 수도에서 「떡 찧기」 버튼을 3번 누르면 🍡 +1 (한 번에 30개까지).</p><p>🍡 화면 위 띠의 「던지기」로 하늘의 라후에게 휙!</p><p>💤 게임을 꺼 둬도 내 영웅이 30분마다 꿀떡을 1개씩 구워 둬요(최대 ${EK_BAKEMAX}개) — 일식 때 저절로 보내져요.</p><p>🐘 가네샤 할아버지도 8초마다 하나씩 도와줘요.</p><p>☀️ 성공하면 함께한 사람 모두 감사 상자 + 세계의 중심에 🌈 무지개 다리(하루). 가장 많이 던진 세계 수도에는 「해를 돌려준 세계」 깃발이 일주일!</p></div>`); }
MENU_X.push({ic:"🌑",n:"라후의 일식 축제",id:"ekBtn",sub:()=>{ if(ekActive()){ const S=ekSums(G.ekK); return `🌑 지금! 🍡 ${S.total}/${EK_GOAL}`; } return `다음: ${ekWhen(ekNextK())} · 구운 꿀떡 ${ekBaked(G.ekK)}`; },f:showEclipse});
TITLES.push({id:"ek1",n:"해를 돌려준 자",t:2,h:"라후의 일식 성공 함께하기",g:()=>[G.ekWin||0,1]},{id:"ek100",n:"꿀떡 장인",t:2,h:"꿀떡 100개 던지기",g:()=>[G.ekTot||0,100]},{id:"ek3",n:"라후의 단짝",t:3,h:"일식 성공 3번",g:()=>[G.ekWin||0,3]});
</script>
<style>
#ekBar{position:fixed;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 54px);transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:8px;min-width:260px;max-width:min(62vw,500px);padding:5px 8px 6px 14px;border-radius:14px;background:linear-gradient(180deg,rgba(50,22,70,.9),rgba(30,14,40,.9));border:2px solid #ffb04a;box-shadow:0 0 0 2px rgba(0,0,0,.45),0 0 14px rgba(255,160,60,.45);color:#fff}
#ekBar[hidden]{display:none} #ekBar .ekt{flex:1;display:flex;flex-direction:column;gap:2px;text-align:center;pointer-events:none}
#ekBar b{font-size:14px;color:#ffe6b0;text-shadow:0 2px 0 #000} #ekBar span{font-size:12px;opacity:.92}
#ekBar i{display:block;height:7px;border-radius:4px;background:linear-gradient(90deg,#ffd64a var(--p),rgba(255,255,255,.15) var(--p))}
#ekThrow{pointer-events:auto;flex:none;font-size:15px;font-weight:900;padding:8px 10px;border-radius:12px;border:2px solid #fff;background:linear-gradient(180deg,#ff9ac0,#e0508a);color:#fff;text-shadow:0 1px 0 #000;box-shadow:0 3px 0 rgba(0,0,0,.4)}
#ekThrow:disabled{filter:grayscale(.7);opacity:.7}
</style>
