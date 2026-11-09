<script>
/* ================= v85-1: 🎯 오늘의 현상수배 — 다 같이 찾는 떠돌이 대장 괴물 (IDEAS G11/9-2) =================
   네 수도마다 「🎯 현상수배 게시판」. 날마다(한국 날짜) 대장 괴물 3마리 — 날짜 씨앗으로 정해서 모든 폰이 같은 괴물·같은 사냥터.
   대장 괴물은 사냥터를 정해진 길(시계로 정함)로 어슬렁어슬렁 돌아다님 → 어느 폰에서 봐도 같은 곳에 있음.
   숨어 있어서 42걸음 안에 들어와야 보임(그 밖에서는 가끔 "쿵… 쿵…" 발소리만).
   찾으면 「🚩 찾았다!」 → 같은 방 모두의 지도·화면 가장자리에 깃발(보관 btf/<날>/<번호>, 5분). 처음 찾은 사람 = 눈 밝은 탐정 보너스.
   체력은 모두가 함께 깎음: 때린 양(체력 비율)을 실시간 t:"btd" 로 나눔 → 모든 폰에서 같은 비율. 쓰러지면 t:"btk" + 보관 bty/<날>/<번호>={l:다음 목숨,ts}.
   한 번이라도 때린 사람은 모두 현상금(그날 그 괴물 처음이면 크게, 다시 잡으면 조금). 쓰러진 뒤 3분 지나면 다른 자리에서 다시 어슬렁.
   내려찍기(빨간 고리 → 점프하거나 피하기). 저장: G.bty={d,got:{},det:{}} · G.btN(현상금 받은 수) · G.btDet(먼저 찾은 수). 칭호 3개. */
const BT_N=3, BT_RESP=180000, BT_FLAG_MS=300000, BT_SEE=42;
const BT_PRE=["떠돌이 대장","외눈박이 대장","불꽃 꼬리 대장","천둥 발 대장","그림자 대장","돌주먹 대장","바람 갈기 대장","왕방울 대장"];
const BT_CLUE=["발자국이 접시만 해요","지나간 자리에 풀이 눕혀져 있대요","콧김 소리가 \"푸르릉!\" 하고 들린대요","반짝이는 금화를 흘리고 다닌대요","나무에 커다란 발톱 자국을 남긴대요","배고프면 \"꾸르륵\" 소리가 크게 난대요"];
const BT={day:-1,list:[],S:[],t:0,sendT:0,boards:[],lbl:null,chips:{},box:null,near:null,stepT:0,heard:{},q:[]};
function btData(){ const d=kday(); if(!G.bty||G.bty.d!==d) G.bty={d,got:{},det:{}}; G.bty.got=G.bty.got||{}; G.bty.det=G.bty.det||{}; return G.bty; }
function btMake(day){ const r=dgRng(day*977+41); const rs=[0,1,2,3]; for(let i=3;i>0;i--){ const j=Math.floor(r()*(i+1)); [rs[i],rs[j]]=[rs[j],rs[i]]; }
  const L=[]; for(let k=0;k<BT_N;k++){ const realm=rs[k]; const rg=REGIONS[realm*3+(r()<.5?1:2)]; const R=REALMS[realm]; const di=Math.floor(r()*R.mobs.length); const def=R.mobs[di];
    const pre=BT_PRE[Math.floor(r()*BT_PRE.length)]; const star=1+Math.floor(r()*3);
    L.push({k,realm,rg:rg.id,di,def,n:`${pre} ${def.n}`,star,clue:BT_CLUE[Math.floor(r()*BT_CLUE.length)],p1:r()*6.283,p2:r()*6.283,T:260+r()*120,sx:r()<.5?-1:1}); }
  return L; }
/* 정해진 길: 사냥터 안을 8자 모양으로 천천히 돎. 목숨(l)마다 출발 자리가 달라짐 */
function btPos(b,l,t){ const rg=REGIONS[b.rg]; const s=(t==null?Date.now():t)/1000; const th=s/b.T*6.283+b.p1+(l||0)*2.1; const R=rg.r*.6;
  return {x:clamp(rg.x+b.sx*Math.sin(th)*R,-WORLD_HALF+6,WORLD_HALF-6),z:clamp(rg.z+Math.sin(2*th+b.p2)*R*.75,-WORLD_HALF+6,WORLD_HALF-6)}; }
function btSync(){ const d=kday(); if(BT.day===d) return; BT.S.forEach(s=>{ if(s&&s.m) btDrop(s,true); }); BT.day=d; BT.list=btMake(d); BT.S=BT.list.map(()=>({l:0,dead:0,lost:0,out:0,hit:false,flag:null,m:null})); }
function btAlive(k){ const s=BT.S[k]; return !!s&&Date.now()>=s.dead+BT_RESP; }
function btFlag(k){ const s=BT.S[k]; const f=s&&s.flag; return f&&f.l===s.l&&Date.now()-f.ts<BT_FLAG_MS&&btAlive(k)?f:null; }
function btReward(b){ const L=G.lv; return {gold:Math.round((260+L*28)*(.8+b.star*.2)),xp:Math.round(xpNeed(L)*(.08+b.star*.03))}; }
/* ---------- 보관 · 실시간 ---------- */
NETX.push({sub:()=>"bty/"+kday()+"/+",pre:"bty/",f:(d,topic)=>{ const a=String(topic).split("/"); if(+a[1]!==kday()||!d) return; btSync(); const k=+a[2], s=BT.S[k]; if(!s||!(d.l>s.l)) return;
  s.l=d.l; s.dead=d.ts||Date.now(); s.lost=0; s.out=0; s.hit=false; if(s.m) btDrop(s,true); }});
NETX.push({sub:()=>"btf/"+kday()+"/+",pre:"btf/",f:(d,topic)=>{ const a=String(topic).split("/"); if(+a[1]!==kday()||!d) return; btSync(); const k=+a[2], s=BT.S[k]; if(!s||d.l!==s.l) return; if(!s.flag||s.flag.ts<d.ts) s.flag=d; }});
NETR.btd=(o,d)=>{ btSync(); const s=BT.S[d.k]; if(!s||d.l!==s.l||!btAlive(d.k)||!(d.f>0)) return; s.lost=Math.min(1,s.lost+Math.min(.5,d.f)); if(s.m){ s.m.hp=Math.max(0,s.m.mhp*(1-s.lost)); s.m.hit=.12; } if(s.lost>=.999) btDead(d.k,s.l,o.name,false); };
NETR.btk=(o,d)=>{ btSync(); const s=BT.S[d.k]; if(!s||d.l!==s.l) return; btDead(d.k,d.l,o.name,false); };
NETR.btf=(o,d)=>{ btSync(); const s=BT.S[d.k], b=BT.list[d.k]; if(!s||!b||d.l!==s.l) return; const f={i:o.id,n:o.name,r:o.realm,ts:Date.now(),l:d.l}; const fresh=!btFlag(d.k); s.flag=f;
  if(fresh&&!layerOpen) toast(`🚩 ${o.name}님이 현상수배 「${b.n}」을(를) 찾았어요!`,`${REGIONS[b.rg].n} · 지도와 화면 가장자리 깃발을 따라가요`,3); jingle([784,988,1175]); };
/* ---------- 대장 괴물 ---------- */
function btSpawn(k){ const b=BT.list[k], s=BT.S[k]; const rg=REGIONS[b.rg]; const p=btPos(b,s.l); const lv=Math.min(LVMAX,Math.max(rg.lv[1]+3,G.lv+2)); const st=mobStats(lv,true); const sc=1.75+b.star*.12;
  const mesh=(typeof mobGL==="function"&&mobGL(b.def.n,sc))||makeMob(b.def.shape,b.def.c,sc);
  const m={n:b.n,shape:b.def.shape,mesh,x:p.x,z:p.z,hx:p.x,hz:p.z,lv,boss:true,world:false,hp:st.mhp,mhp:st.mhp,atk:st.atk*(.85+b.star*.1),xp:st.xp,gold:st.gold,rg:rg.id,cd:0,state:"idle",t:0,lbl:makeLabel("boss"),rot:0,hit:0,scale:sc,power:0,ev:1,bty:k,btl:s.l,stT:5};
  m.hp=Math.max(1,Math.round(m.mhp*(1-s.lost)));
  try{ const a=new THREE.Mesh(new THREE.RingGeometry(1.5,2.1,36),glowMat(0xff4a3a,.7)); a.rotation.x=-Math.PI/2; a.position.y=.12; mesh.add(a); m.aura=a; const a2=new THREE.Mesh(new THREE.RingGeometry(2.3,2.45,36),glowMat(0xffd24a,.6)); a2.rotation.x=-Math.PI/2; a2.position.y=.1; mesh.add(a2); m.aura2=a2; }catch(e){}
  mesh.position.set(p.x,hAt(p.x,p.z),p.z); mesh.visible=false; scene.add(mesh); mobs.push(m); s.m=m; return m; }
function btDrop(s,quiet){ const m=s.m; s.m=null; if(!m) return; if(!quiet) fxSpark(m.x,1.5,m.z,0xffffff,10); if(mobs.indexOf(m)>=0) removeMob(m); }
function btDead(k,l,who,mine){ const s=BT.S[k], b=BT.list[k]; if(!s||!b||s.l!==l) return; const hit=s.hit; s.l=l+1; s.dead=Date.now(); s.lost=0; s.out=0; s.hit=false; s.flag=null;
  if(s.m){ const m=s.m; s.m=null; if(mobs.indexOf(m)>=0){ fxFlash(m.x,2,m.z,0xffe08a,5,.45); fxRing(m.x,m.z,0xffd24a,9,.8); fxSpark(m.x,2,m.z,0xffd24a,30); removeMob(m); } }
  if(mine){ try{ net.send({t:"btk",k,l}); net.pushRet("bty/"+kday()+"/"+k,{l:l+1,ts:s.dead,n:G.name,i:G.id}); }catch(e){} }
  if(hit) btPay(k,who,mine); else if(!layerOpen&&Math.hypot(P.x-btPos(b,l).x,P.z-btPos(b,l).z)<120) toast(`🎯 ${who}님이 「${b.n}」을(를) 잡았어요!`,"3분 뒤 다른 자리에서 또 나타나요",2.2); }
function btPay(k,who,mine){ const b=BT.list[k]; const D=btData(); const first=!D.got[k]; const rw=btReward(b); const mul=first?1:.25; const gold=Math.round(rw.gold*mul), xp=Math.round(rw.xp*mul);
  G.gold+=gold; gainXp(xp); const got=[`금화 +${fmt(gold)}`,`경험치 +${fmt(xp)}`];
  if(first){ D.got[k]=Date.now(); G.btN=(G.btN||0)+1; const ore=2+b.star*2; G.ore=(G.ore||0)+ore; got.push(`⛓ +${ore}`); if(b.star>=2){ G.rune=(G.rune||0)+b.star-1; got.push(`✨ +${b.star-1}`); } if(Math.random()<.35+b.star*.1){ try{ got.push("🎁 "+evGear(.25)); }catch(e){} } }
  saveGame(); try{ COINFLY.burst(P.x,1.6,P.z,first?10:4); }catch(e){}
  try{ lvBanner(first?"🎯 현상금 획득!":"🎯 또 잡았어요!",b.n,(mine?"":`${who}님이 마지막 한 방 · `)+got.join(" · "),"#ff8a5a"); }catch(e){ toast(`🎯 현상금! ${b.n}`,got.join(" · "),3); }
  jingle([523,659,784,1046,1318]); buzz([30,20,60]); }
(function(){ const _dm=damageMob; damageMob=function(m,dmg,crit){ if(m&&m.bty!=null&&m.hp>0){ const s=BT.S[m.bty]; if(s&&s.m===m){ s.hit=true; const h0=m.hp, l0=s.l; _dm(m,dmg,crit); if(s.l===l0&&s.m===m){ const f=(h0-Math.max(0,m.hp))/m.mhp; if(f>0){ s.lost=Math.min(1,s.lost+f); s.out+=f; } } return; } } return _dm(m,dmg,crit); };
  const _km=killMob; killMob=function(m){ const k=m&&m.bty, l=m&&m.btl; _km(m); if(k!=null){ const s=BT.S[k]; if(s&&s.l===l){ s.m=null; btDead(k,l,G.name,true); } } };
  const _bk=BOSSBAR.kind; BOSSBAR.kind=function(m){ if(m&&m.bty!=null) return ["🎯 현상수배","b"]; return _bk.call(this,m); }; })();
/* 내려찍기: 빨간 고리 → 1.1초 뒤 쾅 (점프하면 피함) */
function btStomp(m){ const x=m.x, z=m.z, r=6.2; fxRing(x,z,0xff2a2a,r*1.6,1.1); m.mesh.userData.lunge=1.1; tone(90,.5,"sawtooth",0,.08);
  setTimeout(()=>{ if(m.hp<=0||mobs.indexOf(m)<0) return; try{ SFX.shock(x,z,0xff6a3d,r,.6); }catch(e){ fxRing(x,z,0xff6a3d,r*1.4,.5); } P.shake=Math.max(P.shake||0,.8); thud(); if(Math.hypot(P.x-x,P.z-z)<r) hurtPlayer(m.atk*1.7*(1-dmgReduce(stat().def)),{n:m.n}); },1100); }
function btMove(k,dt,tn){ const b=BT.list[k], s=BT.S[k], m=s.m; const p=btPos(b,s.l); const dx=P.x-m.x, dz=P.z-m.z, d=Math.hypot(dx,dz); const home=Math.hypot(m.x-p.x,m.z-p.z);
  const vis=d<BT_SEE||(btFlag(k)&&d<95); if(m.mesh.visible!==vis) m.mesh.visible=vis;
  m.hit=Math.max(0,m.hit-dt); m.cd-=dt; m.stT-=dt;
  const safe=inCapital(P.x,P.z); const aggro=vis&&!P.dead&&!safe&&d<18&&home<34;
  let mv=0;
  if(aggro){ m.state="chase"; if(d>3.3){ const sp=4.1; m.x+=dx/d*sp*dt; m.z+=dz/d*sp*dt; m.rot=Math.atan2(dx,dz); mv=1; } else if(m.cd<=0){ m.cd=1.35; hurtPlayer(m.atk*(1-dmgReduce(stat().def)),m.n); m.mesh.userData.lunge=.25; if(m.mesh.userData.gl) animState(m.mesh,"attack"); }
    if(m.stT<=0&&d<14){ m.stT=rnd(5.5,7.5); btStomp(m); } }
  else { m.state="wander"; if(home>60){ m.x=p.x; m.z=p.z; } else if(home>.4){ const sp=home>6?6:Math.max(1.2,home*1.5); const st=Math.min(home,sp*dt); m.x+=(p.x-m.x)/home*st; m.z+=(p.z-m.z)/home*st; m.rot=Math.atan2(p.x-m.x,p.z-m.z); mv=1; } }
  m.x=clamp(m.x,-WORLD_HALF+3,WORLD_HALF-3); m.z=clamp(m.z,-WORLD_HALF+3,WORLD_HALF-3);
  m.mesh.position.set(m.x,hAt(m.x,m.z)+(m.mesh.userData.float?Math.sin(tn/400+m.x)*.3+.2:0)+(m.mesh.userData.lunge>0?.4:0),m.z); if(m.mesh.userData.lunge>0) m.mesh.userData.lunge-=dt;
  let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*6);
  try{ if(m.mesh.userData.gl){ animState(m.mesh,m.hit>0?"hit":mv?(aggro?"run":"walk"):"idle"); if(m.mesh.userData.lunge>.2) animState(m.mesh,"attack"); } }catch(e){}
  try{ hitTint(m.mesh,m.hit/.15); HITF.apply(m,dt); }catch(e){} const sc=m.scale*(m.hit>0?1.08:1); m.mesh.scale.setScalar(sc);
  if(m.aura){ m.aura.rotation.z+=dt*2; m.aura.scale.setScalar(1+Math.sin(tn/250)*.12); } if(m.aura2) m.aura2.rotation.z-=dt;
  if(vis&&d<50){ placeLabel(m.lbl,m.x,(m.mesh.userData.h||4)*m.scale,m.z,`<em style="color:#ff8a5a">🎯 현상수배</em> ${m.n} <b>Lv.${m.lv} · ${"★".repeat(b.star)}</b><span class="hp mob"><s></s><i></i></span>`); hpBar(m.lbl,m.hp/m.mhp); } else m.lbl.style.display="none";
  if(vis&&!s.seen){ s.seen=1; if(!btFlag(k)){ toast(`🎯 현상수배 「${b.n}」 발견!`,"「🚩 찾았다!」를 누르면 모두에게 깃발로 알려요",2.6); jingle([659,880,1175]); buzz(30); } } if(!vis) s.seen=0;
  return d; }
/* ---------- 매 프레임 ---------- */
function btOver(){ return evOver()&&!(typeof DG!=="undefined"&&DG.on)&&!(typeof HM!=="undefined"&&HM.on)&&!(typeof DS!=="undefined"&&DS.on); }
function btTick(dt){ if(!started||G.realm<0) return; btSync(); const tn=performance.now(); BT.t-=dt; BT.sendT-=dt; BT.stepT-=dt;
  if(BT.t<=0){ BT.t=.5; const over=btOver();
    BT.list.forEach((b,k)=>{ const s=BT.S[k]; const alive=btAlive(k); const p=btPos(b,s.l); const d=Math.hypot(P.x-p.x,P.z-p.z);
      if(!alive||!over||d>130){ if(s.m) btDrop(s,true); return; }
      if(!s.m&&d<100) btSpawn(k);
      // 멀리서 들리는 발소리
      if(s.m&&!s.m.mesh.visible&&d<75&&!btFlag(k)&&BT.stepT<=0){ BT.stepT=2.2; tone(70,.14,"sine",0,.12); tone(60,.16,"sine",.32,.1); if(!BT.heard[b.k+":"+s.l]&&!layerOpen){ BT.heard[b.k+":"+s.l]=1; toast("🦶 쿵… 쿵… 근처에서 커다란 발소리가 들려요!",`현상수배 「${b.n}」이(가) 가까이 있어요`,2.4); } } }); }
  BT.near=null; BT.S.forEach((s,k)=>{ if(!s.m) return; if(mobs.indexOf(s.m)<0){ s.m=null; return; } const d=btMove(k,dt,tn); if(s.m&&s.m.mesh.visible&&d<30&&!btFlag(k)&&!BT.near) BT.near=k; });
  if(BT.sendT<=0){ BT.sendT=.4; BT.S.forEach((s,k)=>{ if(s.out>0){ try{ net.send({t:"btd",k,l:s.l,f:+s.out.toFixed(4)}); }catch(e){} s.out=0; } }); }
  if(!BT.st0) BT.st0=performance.now(); if(!BT.boards.length&&performance.now()-BT.st0>4000){ try{ btBoardsBuild(); }catch(e){ console.warn(e); BT.boards.push({x:1e9,z:1e9}); } } btBoards(dt); btChips(); }
XTICK.push(btTick);
/* ---------- 🚩 찾았다! ---------- */
function btShout(){ const k=BT.near; if(k==null) return; const s=BT.S[k], b=BT.list[k]; if(btFlag(k)) return; const D=btData(); const f={i:G.id,n:G.name,r:G.realm,ts:Date.now(),l:s.l}; s.flag=f;
  try{ net.pushRet("btf/"+kday()+"/"+k,f); net.send({t:"btf",k,l:s.l}); }catch(e){}
  const m=s.m; if(m){ try{ hdBeam(m.x,m.z,0xff6a3a); }catch(e){} fxRing(m.x,m.z,0xff6a3a,8,.8); }
  let extra=""; if(!D.det[k]){ D.det[k]=1; G.btDet=(G.btDet||0)+1; const g=80+G.lv*8; G.gold+=g; extra=` · 🔎 눈 밝은 탐정 보너스 금화 +${fmt(g)}`; saveGame(); }
  jingle([784,1046,1318]); buzz(25); toast(`🚩 찾았다! 「${b.n}」`,`같은 방 모두의 지도에 깃발이 떴어요${extra}`,2.8); }
CTX_EXTRA.unshift(()=>BT.near!=null?{t:"🚩 찾았다! 모두에게 알리기",f:btShout}:null);
CTX_EXTRA.push(()=>btBoardNear()?{t:"🎯 현상수배 게시판",f:showBounty}:null);
/* ---------- 화면 가장자리 깃발 칩 ---------- */
const BTV=new THREE.Vector3();
function btChips(){ if(!BT.box){ const b=document.createElement("div"); b.id="btChips"; document.body.appendChild(b); BT.box=b; }
  const Wd=innerWidth, H=innerHeight; const keep={}; const over=btOver();
  BT.list.forEach((b,k)=>{ const f=btFlag(k); if(!f||!over) return; const s=BT.S[k]; const p=s.m?{x:s.m.x,z:s.m.z}:btPos(b,s.l); const d=Math.hypot(p.x-P.x,p.z-P.z); keep[k]=1;
    let el=BT.chips[k]; if(!el){ el=document.createElement("button"); el.type="button"; el.className="frc"; el.innerHTML='<i class="ar">➤</i><b></b><span></span>'; el.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); btGuide(k); }); BT.box.appendChild(el); BT.chips[k]=el; }
    el.querySelector("b").textContent="🎯 "+b.n.split(" ").pop(); el.querySelector("span").textContent=`🚩 ${Math.round(d)}m`;
    BTV.set(p.x,hAt(p.x,p.z)+3,p.z).project(camera); let sx=(BTV.x*.5+.5)*Wd, sy=(-BTV.y*.5+.5)*H; const behind=BTV.z>1; const on=!behind&&sx>40&&sx<Wd-40&&sy>40&&sy<H-40;
    if(on&&d<BT_SEE){ el.hidden=true; return; } el.hidden=false; const cx=Wd/2, cy=H*.55; let dx=sx-cx, dy=sy-cy; if(behind){ dx=-dx; dy=-dy; } if(Math.abs(dx)<1&&Math.abs(dy)<1) dy=1;
    const mL=Math.min(215,Wd*.24), mR=Math.min(175,Wd*.2), mT=96, mB=Math.min(165,H*.38); const kx=dx>0?(Wd-mR-cx)/dx:(mL-cx)/dx, ky=dy>0?(H-mB-cy)/dy:(mT-cy)/dy; const kk=Math.min(Math.abs(kx),Math.abs(ky));
    el.style.transform=`translate(${Math.round(cx+dx*kk)}px,${Math.round(cy+dy*kk)}px) translate(-50%,-50%)`; el.querySelector(".ar").style.transform=`rotate(${Math.atan2(dy,dx)}rad)`; });
  for(const k in BT.chips){ if(!keep[k]){ BT.chips[k].remove(); delete BT.chips[k]; } }
  BT.box.hidden=!started||layerOpen||P.dead; }
function btGuide(k){ const b=BT.list[k], s=BT.S[k]; if(!b) return; const f=btFlag(k); const p=f?(s.m?{x:s.m.x,z:s.m.z}:btPos(b,s.l)):REGIONS[b.rg]; const label="🎯 "+b.n; if(P.guide&&P.guide.label===label){ P.guide={x:p.x,z:p.z,label,bt:k}; return; } P.guide=null; setGuide({x:p.x,z:p.z,label}); if(P.guide) P.guide.bt=k; }
// 깃발이 꽂힌 대장을 길 안내 중이면, 괴물이 움직여도 안내가 따라감
XTICK.push(()=>{ const g=P.guide; if(!g||g.bt==null) return; const k=g.bt, b=BT.list[k], s=BT.S[k]; if(!b||!s) return; if(!btAlive(k)){ P.guide=null; $("guide").hidden=true; return; } if(btFlag(k)){ const p=s.m?{x:s.m.x,z:s.m.z}:btPos(b,s.l); g.x=p.x; g.z=p.z; } if(s.m&&s.m.mesh.visible&&Math.hypot(P.x-s.m.x,P.z-s.m.z)<12){ P.guide=null; $("guide").hidden=true; } });
/* ---------- 지도 깃발 ---------- */
MAP_X.push((ctx,tx,tz,big,u)=>{ if(!btOver()) return; BT.list.forEach((b,k)=>{ const f=btFlag(k); if(!f) return; const s=BT.S[k]; const p=s.m?{x:s.m.x,z:s.m.z}:btPos(b,s.l); const X=tx(p.x), Z=tz(p.z); const pul=1+.25*Math.sin(performance.now()/200);
  ctx.beginPath(); ctx.arc(X,Z,8*u*pul,0,6.2832); ctx.fillStyle="rgba(255,90,60,.22)"; ctx.fill(); mapPin(ctx,X,Z,(big?5:6.4)*u,"#e8452c","🚩"); }); });
/* ---------- 게시판 (네 수도) ---------- */
function btBoardModel(){ const g=new THREE.Group(); const wood=mat({color:0x8a5a34,roughness:.9}), dark=mat({color:0x5a3820,roughness:.95}), paper=mat({color:0xf3e2b8,roughness:.95}), red=mat({color:0xc8392b,roughness:.7});
  [-1.9,1.9].forEach(x=>g.add(cyl(.16,.2,3.6,dark,x,1.8,0,8))); g.add(box(4.2,2.3,.18,wood,0,2.35,0)); const roof=box(4.8,.22,.9,dark,0,3.65,.1); roof.rotation.x=.12; g.add(roof); g.add(box(4.4,.4,.24,red,0,3.3,.06));
  const posters=[]; [-1.3,0,1.3].forEach((x,i)=>{ const p=box(1.05,1.45,.04,paper,x,2.2,.12); p.rotation.z=(i-1)*.05; g.add(p); posters.push(p); g.add(box(.9,.16,.02,red,x,2.75,.15)); g.add(sph(.07,mat({color:0xd84a3a}),x,2.88,.16)); const face=box(.5,.5,.02,mat({color:0x2a2030,roughness:1}),x,2.2,.15); g.add(face); });
  g.userData={posters}; return g; }
function btBoardSpots(){ if(BT.spots) return BT.spots; const F=[]; const add=a=>{ try{ (a||[]).forEach(o=>{ if(o&&o.x!=null) F.push([o.x,o.z]); }); }catch(e){} };
  try{ add(DG.doors); }catch(e){} try{ add(FG.spots); }catch(e){} try{ add(GD.board); }catch(e){} try{ add(PG.gates); }catch(e){} try{ add(TW.gates); }catch(e){} try{ add(LV.gates); }catch(e){} try{ add(AR.gates); }catch(e){} try{ add(NE.spots); }catch(e){} try{ add(WS.trees); }catch(e){} try{ add(OR.spots); }catch(e){}
  try{ PLACED.forEach(o=>F.push([o.x,o.z])); }catch(e){} for(const id in ALTARS){ const a=ALTARS[id]; if(a.trial) F.push([a.trial.x,a.trial.z]); if(a.shrine) F.push([a.shrine.x,a.shrine.z]); }
  BT.spots=[0,3,6,9].map(id=>{ const rg=REGIONS[id]; let best=null, bs=-1; for(let k=0;k<24;k++){ const a=k/24*6.283; for(const d of [11,14,17]){ const x=rg.x+Math.cos(a)*d, z=rg.z+Math.sin(a)*d; let m=1e9; F.forEach(f=>{ const q=Math.hypot(f[0]-x,f[1]-z); if(q<m) m=q; }); const sc=Math.min(m,16)-d*.05; if(sc>bs){ bs=sc; best={x,z}; } } }
    return {x:best.x,z:best.z,rot:Math.atan2(rg.x-best.x,rg.z-best.z)}; }); return BT.spots; }
function btBoardsBuild(){ if(BT.boards.length) return; btBoardSpots().forEach(s=>{ const g=btBoardModel(); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); BT.boards.push(Object.assign({g},s)); }); }
function btBoardNear(){ return BT.boards.find(b=>Math.hypot(P.x-b.x,P.z-b.z)<6)||null; }
function btBoards(dt){ if(!BT.lbl) BT.lbl=makeLabel("ally"); const b=BT.boards.find(b=>Math.hypot(P.x-b.x,P.z-b.z)<20); if(b&&!layerOpen){ const D=btData(); const n=Object.keys(D.got).length; placeLabel(BT.lbl,b.x,4.4,b.z,`🎯 <b>현상수배 게시판</b> ${n}/${BT_N}`); } else BT.lbl.style.display="none"; }
/* ---------- 창 ---------- */
function btStatus(k){ const b=BT.list[k], s=BT.S[k]; const D=btData(); const f=btFlag(k); if(!btAlive(k)) return {t:`💤 쓰러졌어요 · ${Math.max(1,Math.ceil((s.dead+BT_RESP-Date.now())/60000))}분 뒤 다른 자리에 나타나요`,c:"#9aa0a6"};
  if(f) return {t:`🚩 ${f.n}님이 찾았어요 · ${fmtAgo(f.ts)} · 지금 체력 ${Math.ceil((1-s.lost)*100)}%`,c:"#ff8a5a",flag:1}; return {t:"🌿 어딘가에 숨어서 어슬렁거리는 중",c:"#9dffb8"}; }
function showBounty(){ btSync(); const D=btData(); const near=btBoardNear();
  const cards=BT.list.map((b,k)=>{ const R=REALMS[b.realm], rg=REGIONS[b.rg], st=btStatus(k), rw=btReward(b), got=!!D.got[k]; const ic=(BOSSBAR.ico&&BOSSBAR.ico[b.def.shape])||"👹";
    return `<div class="btp${got?" got":""}"><div class="bth">현상수배 ${"★".repeat(b.star)}</div><div class="bti">${ic}</div><b>${b.n}</b><span style="color:${R.c1}">${R.icon} ${rg.n} 어딘가</span><small>"${b.clue}"</small>
     <em>💰 금화 ${fmt(rw.gold)} · 경험치 ${fmt(rw.xp)}${b.star>=2?` · ✨ ${b.star-1}`:""}</em><span class="bts" style="color:${st.c}">${got?"✅ 오늘 잡았어요 (또 잡으면 1/4)":st.t}</span><button class="buy${st.flag?"":" alt"}" data-btg="${k}">${st.flag?"🚩 깃발로 길 안내":"🧭 그 사냥터로 길 안내"}</button></div>`; }).join("");
  card(`<h2>🎯 오늘의 현상수배</h2><p>대장 괴물 3마리가 사냥터 어딘가에 숨어서 어슬렁거려요. <b>42걸음</b> 안에 가야 보이고, 그 밖에서는 "쿵… 쿵…" 발소리만 들려요. 찾으면 <b>「🚩 찾았다!」</b>로 같은 방 모두에게 알려 주세요 — 함께 때린 사람은 <b>모두</b> 현상금을 받아요!</p>
   <div class="btwrap">${cards}</div>
   <div class="idlegrid"><div><b>🎯 ${G.btN||0}</b><span>받은 현상금</span></div><div><b>🔎 ${G.btDet||0}</b><span>먼저 찾은 수</span></div><div><b>${Object.keys(D.got).length}/${BT_N}</b><span>오늘 잡은 대장</span></div></div>
   <p style="font-size:12px">현상수배는 매일 밤 12시(한국 시간)에 바뀌어요. 체력은 모두 함께 깎아요 — 친구가 때린 만큼 내 화면의 체력도 줄어요. 쓰러지면 3분 뒤 다른 자리에 또 나타나요. 빨간 고리(내려찍기)가 보이면 점프하거나 피해요! ${near?"":"· 게시판은 네 수도 광장에 있어요."}</p>`);
  layers.querySelectorAll("[data-btg]").forEach(el=>el.onclick=()=>{ closeLayer(); btGuide(+el.dataset.btg); }); }
MENU_X.push({ic:"🎯",n:"오늘의 현상수배",id:"btBtn",sub:()=>{ btSync(); const D=btData(); const fl=BT.list.filter((b,k)=>btFlag(k)).length; return `오늘 잡은 대장 ${Object.keys(D.got).length}/${BT_N}${fl?` · 🚩 깃발 ${fl}개`:""}`; },f:showBounty});
TITLES.push({id:"bt3",n:"현상금 사냥꾼",t:1,h:"현상수배 대장 3마리 잡기",g:()=>[G.btN||0,3]},{id:"btd5",n:"눈 밝은 탐정",t:2,h:"현상수배 대장을 먼저 찾아 깃발 꽂기 5번",g:()=>[G.btDet||0,5]},{id:"bt30",n:"전설의 현상금 사냥꾼",t:3,h:"현상수배 대장 30마리 잡기",g:()=>[G.btN||0,30]});
</script>
<style>
#btChips{position:fixed;inset:0;pointer-events:none;z-index:4} #btChips[hidden]{display:none}
#btChips .frc{position:absolute;left:0;top:0;pointer-events:auto;display:flex;align-items:center;gap:5px;border:2px solid #ff8a5a;border-radius:999px;padding:3px 10px 3px 6px;background:rgba(60,14,10,.82);color:#fff;font-family:inherit;font-size:12px;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,.45),0 0 10px rgba(255,120,60,.5);cursor:pointer;animation:ctxPulse 1.6s ease-in-out infinite}
#btChips .frc[hidden]{display:none} #btChips .frc b{font-weight:900;color:#ffd0a0} #btChips .frc span{opacity:.9;font-size:11px} #btChips .frc .ar{font-style:normal;color:#ff8a5a;font-size:13px;display:inline-block}
.btwrap{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.btp{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 6px;border-radius:10px;background:linear-gradient(180deg,#f6e6bf,#e6cf98);color:#3a2410;border:2px solid #8a5a34;text-align:center;box-shadow:inset 0 0 12px rgba(120,70,20,.35)}
.btp .bth{font-weight:900;color:#b0281c;font-size:13px;letter-spacing:1px} .btp .bti{font-size:30px;filter:brightness(0) drop-shadow(0 0 2px rgba(0,0,0,.4));line-height:1.1}
.btp.got .bti{filter:none} .btp b{font-size:13px} .btp span{font-size:11.5px;font-weight:700} .btp small{font-size:11px;opacity:.85} .btp em{font-style:normal;font-size:11px;color:#6a4a10}
.btp .bts{font-size:11px;background:rgba(40,20,10,.78);border-radius:6px;padding:2px 5px} .btp button{font-size:12px;padding:5px 8px;margin-top:2px}
@media (orientation:portrait){.btwrap{grid-template-columns:1fr}}
</style>
