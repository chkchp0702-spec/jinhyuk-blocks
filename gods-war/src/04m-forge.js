<script>
/* ================= v24-1: 🔨 신들의 대장간 두드리기 (IDEAS G11/4-1) =================
   수도 광장 가장자리 대장간(모루 + 화로)에서 「쾅!」 박자 놀이 3번 → 무기 강화 +1 (최대 +10, 실패로 부서지는 일 없음).
   박자를 잘 맞출수록(완벽 2점·좋음 1점) 힘이 조금 더 붙음. 재료: 쇳조각(괴물·물고기·미궁) · 룬 가루(보스·별 4개 물고기·미궁).
   +5 부터 무기 둘레에 세계 색 불꽃이 피어오르고 +10 은 더 화려하게 — 친구 화면에도 보임(hi.fg).
   공용 함께하기 고리 NETX: 새 기능이 보관(retained) 주제를 붙일 때 05-net.js 를 크게 안 고치도록. */
const NETX=[];   // {sub:"wd/+/+", pre:"wd/", f:(d,topic)=>{}}
const FG_MAX=10;
const FORGE_NAME=["빛의 모루","드워프 화로","비슈바카르마 공방","헤파이스토스 화로"];
const FG={spots:[],near:false,game:null,sparkT:0,lbl:null};
function fgLv(){ return G.fg||0; }
function fgMul(){ return 1+fgLv()*.03+(G.fgQ||0)*.002; }   // +10·전부 완벽이면 공격 약 +42%
function fgCost(L){ return {ore:4+L*3, rune:L>=4?L-2:0, gold:Math.round(60*(L+1)*(L+1))}; }
function fgColor(r){ return [0xffe27a,0x8fe0ff,0xffa040,0xb48cff][r==null?G.realm:r]; }
function fgSpot(r){ const cap=REGIONS[r*3]; const inward=Math.atan2(-cap.z,-cap.x); const a=inward-1.05; return {x:cap.x+Math.cos(a)*23,z:cap.z+Math.sin(a)*23,rot:-a-Math.PI/2}; }
/* ---------- 재료 얻기 (기존 함수를 감싸서 덧붙임) ---------- */
function fgGive(ore,rune,why,quiet){ G.ore=(G.ore||0)+(ore||0); G.rune=(G.rune||0)+(rune||0); if(!quiet&&(ore||rune)) floatDmg(P.x,4.6,P.z,`${ore?"⛓ +"+ore:""}${rune?" ✨ +"+rune:""}`,"gain"); }
(function(){ const _km=killMob; killMob=function(m){ _km(m); try{ if(m.war||m.titan) return; if(m.boss) fgGive(5,1); else if(Math.random()<.28) fgGive(1,0); }catch(e){} };
  const _fc=fishCaught; fishCaught=function(g){ _fc(g); try{ const s=g.f[1]; if(s>=3) fgGive(1+(s>=5?2:0),s>=4?1:0,null,true); }catch(e){} };
  const _df=dgFinish; dgFinish=function(){ const r=_df.apply(this,arguments); try{ fgGive(6,2,null,true); }catch(e){} return r; };
  const _st=stat; stat=function(){ const s=_st(); s.atk*=fgMul(); return s; }; })();
/* ---------- 대장간 모델 (세계마다 하나, 수도 광장 가장자리) ---------- */
(function buildForges(){ for(let r=0;r<4;r++){ const s=fgSpot(r); const g=new THREE.Group(); const metal=mat({color:0x3a3d48,metalness:.7,roughness:.35}), dark=mat({color:0x2a2630,roughness:.9});
  g.add(cyl(3.6,3.9,.35,M.stone,0,.18,0,20));
  // 모루
  g.add(box(1.1,.9,1.1,dark,0,.8,0)); g.add(box(.7,.5,.7,metal,0,1.45,0)); const top=box(2.4,.45,1,metal,.2,1.9,0); g.add(top); const horn=new THREE.Mesh(new THREE.ConeGeometry(.42,1.1,12),metal); horn.rotation.z=Math.PI/2; horn.position.set(-1.45,1.9,0); g.add(horn);
  // 달아오른 쇠
  const ingot=box(1,.18,.36,mat({color:0xff7a2a,emissive:0xff5a10,emissiveIntensity:.9}),.3,2.2,0); g.add(ingot); g.userData.ingot=ingot;
  // 화로
  const br=new THREE.Group(); br.add(cyl(1.1,.8,1.2,M.stone,0,.6,0,14)); br.add(cyl(1.2,1.2,.25,dark,0,1.25,0,14)); const fire=sph(.75,glowMat(0xff8a2a,.85),0,1.6,0); fire.scale.y=1.5; br.add(fire); const fire2=sph(.45,glowMat(0xffe27a,.95),0,1.6,0); br.add(fire2); br.position.set(2.6,0,-1.4); g.add(br); g.userData.fire=fire; g.userData.fire2=fire2;
  // 망치 걸이 · 무기 진열대
  const rack=new THREE.Group(); rack.add(box(2.6,.18,.2,M.wood,0,2.3,0)); [-1.2,1.2].forEach(x=>rack.add(cyl(.09,.09,2.4,M.wood,x,1.2,0,8))); for(let k=0;k<3;k++){ const h=new THREE.Group(); h.add(cyl(.05,.05,1.1,M.wood,0,-.5,0,6)); h.add(box(.5,.28,.28,metal,0,-1.05,0)); h.position.set(-.7+k*.7,2.2,.12); rack.add(h); } rack.position.set(-2.2,0,-2); g.add(rack);
  // 세계 색 깃발
  const pole=cyl(.08,.08,4.4,M.wood,2.9,2.2,1.9,8); g.add(pole); const flag=box(1.3,.8,.05,mat({color:REALMS[r].c1,roughness:.8}),3.6,3.9,1.9); g.add(flag);
  g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); fire.castShadow=fire2.castShadow=false; FG.spots[r]={x:s.x,z:s.z,g}; } })();
function fgNear(){ if(typeof DG!=="undefined"&&DG.on) return null; if(typeof HM!=="undefined"&&HM.on) return null; for(let r=0;r<4;r++){ const s=FG.spots[r]; if(s&&Math.hypot(P.x-s.x,P.z-s.z)<5.5) return s; } return null; }
/* ---------- 박자 놀이 ---------- */
function showForge(){ const L=fgLv(), c=fgCost(L), s=fgNear(); const canPay=(G.ore||0)>=c.ore&&(G.rune||0)>=c.rune&&G.gold>=c.gold;
  const w=G.eq.w>=0?itemName("w",G.eq.w):"맨손"; const glow=L>=10?"신의 불꽃":L>=5?"세계 빛 불꽃":"";
  card(`<h2>🔨 신들의 대장간</h2><p>${FORGE_NAME[G.realm]}에서 내 무기를 두드려 강하게 만들어요. <b>부서지는 일은 없어요!</b><br>쇠 위 빛나는 점이 한가운데 올 때 「쾅!」 — 박자를 잘 맞출수록 힘이 더 붙어요.</p>
   <div class="fgbig"><em>⚔</em><b>${w} <span style="color:var(--gold)">+${L}</span></b><span>공격 +${Math.round((fgMul()-1)*100)}%${glow?` · ${glow}`:""}</span></div>
   <div class="idlegrid"><div><b>${fmt(G.ore||0)}</b><span>⛓ 쇳조각</span></div><div><b>${fmt(G.rune||0)}</b><span>✨ 룬 가루</span></div></div>
   ${L<FG_MAX?`<p>+${L+1} 만들기: ⛓ ${c.ore} ${c.rune?`· ✨ ${c.rune} `:""}· 금화 ${fmt(c.gold)}${L+1===5?" · <b style='color:#9dffb8'>+5부터 무기가 빛나요!</b>":L+1===10?" · <b style='color:#ffcf4a'>마지막 단계!</b>":""}</p>
   ${s?`<button class="go" id="fgGo" style="align-self:center" ${canPay?"":"disabled"}>🔨 두드리기 시작</button>`:`<button class="buy" id="fgWay" style="align-self:center">대장간으로 길 안내</button>`}
   ${!canPay?`<p style="font-size:12px;color:#ffb0a0">재료가 모자라요. 쇳조각은 괴물을 잡으면 가끔, 룬 가루는 보스·미궁·별 4개 물고기에서 나와요.</p>`:""}`:`<p style="color:#ffcf4a"><b>+10 완성!</b> 신의 불꽃이 깃든 무기예요.</p>`}`);
  if($("fgGo")) $("fgGo").onclick=fgStart; if($("fgWay")) $("fgWay").onclick=()=>{ const sp=FG.spots[G.realm]; setGuide({x:sp.x,z:sp.z,label:"🔨 대장간"}); closeLayer(); }; }
function fgStart(){ const L=fgLv(); if(L>=FG_MAX) return; const c=fgCost(L); if((G.ore||0)<c.ore||(G.rune||0)<c.rune||G.gold<c.gold) return; G.ore-=c.ore; G.rune-=c.rune; G.gold-=c.gold; saveGame();
  const g={n:0,pts:0,pos:0,dir:1,spd:.85+L*.08,zc:.5,zw:Math.max(.16,.3-L*.012),pw:Math.max(.05,.1-L*.004),last:performance.now(),lock:0,res:[]}; FG.game=g;
  const s=FG.spots[G.realm]; if(s) P.rot=Math.atan2(s.x-P.x,s.z-P.z);
  card(`<h2>🔨 쾅! 쾅! 쾅!</h2><p id="fgMsg">빛나는 점이 <b style="color:#ffe27a">금빛 한가운데</b>에 올 때 눌러요 (3번)</p>
    <div class="fgingot" id="fgIngot"><i class="zone" id="fgZone"></i><i class="perf" id="fgPerf"></i><i class="mark" id="fgMark"></i></div>
    <div class="fshits" id="fgHits">⚪ ⚪ ⚪</div>
    <button class="go fghit" id="fgHit" style="align-self:center">🔨 쾅!</button>`);
  $("cls").onclick=()=>{ if(FG.game&&FG.game.n<3){ fgDone(true); } else closeLayer(); };
  $("fgHit").addEventListener("pointerdown",e=>{ e.preventDefault(); fgHit(); }); fgDraw(); requestAnimationFrame(fgLoop); }
function fgDraw(){ const g=FG.game; if(!g||!$("fgIngot")) return; $("fgZone").style.left=((g.zc-g.zw/2)*100)+"%"; $("fgZone").style.width=(g.zw*100)+"%"; $("fgPerf").style.left=((g.zc-g.pw/2)*100)+"%"; $("fgPerf").style.width=(g.pw*100)+"%"; $("fgMark").style.left=(g.pos*100)+"%";
  $("fgHits").innerHTML=[0,1,2].map(k=>g.res[k]==null?"⚪":g.res[k]===2?"🌟":g.res[k]===1?"🟢":"⚫").join(" "); }
function fgLoop(){ const g=FG.game; if(!g||!$("fgIngot")){ return; } const now=performance.now(), dt=Math.min(.05,(now-g.last)/1000); g.last=now; if(g.lock>0) g.lock-=dt; else { g.pos+=g.dir*g.spd*dt; if(g.pos>1){ g.pos=1; g.dir=-1; } if(g.pos<0){ g.pos=0; g.dir=1; } } fgDraw(); if(g.n<3) requestAnimationFrame(fgLoop); }
function fgHit(){ const g=FG.game; if(!g||g.n>=3||g.lock>0) return; const d=Math.abs(g.pos-g.zc); const q=d<=g.pw/2?2:d<=g.zw/2?1:0; g.res.push(q); g.pts+=q; g.n++; g.lock=.28;
  const s=FG.spots[G.realm]; const x=s?s.x:P.x, z=s?s.z:P.z, col=fgColor();
  // 손맛: 소리·진동·불꽃·화면 흔들림
  if(q===2){ tone(1320,.06,"square"); tone(660,.12,"triangle",.02); buzz([25,20,45]); P.shake=Math.max(P.shake||0,1.1); fxSpark(x,2.3,z,0xffe27a,HIGH()?40:22); fxSpark(x,2.3,z,col,16); fxRing(x,z,0xffe27a,4.5,.45); if(typeof SFX!=="undefined"&&SFX.shock) try{ SFX.shock(x,z,col,5); }catch(e){} $("fgMsg").innerHTML=`<b style="color:#ffe27a;font-size:22px">완벽!</b>`; }
  else if(q===1){ tone(880,.06,"square"); buzz(30); P.shake=Math.max(P.shake||0,.6); fxSpark(x,2.3,z,0xffb050,HIGH()?22:12); $("fgMsg").innerHTML=`<b style="color:#9dffb8;font-size:20px">좋아요!</b>`; }
  else { tone(200,.1,"sawtooth"); buzz(50); fxSpark(x,2.3,z,0x888888,6); $("fgMsg").innerHTML=`<b style="color:#ffb0a0">빗나갔어요</b> · 괜찮아요, 부서지지 않아요!`; }
  const ig=$("fgIngot"); if(ig){ ig.classList.remove("bang"); void ig.offsetWidth; ig.classList.add("bang"); }
  g.zc=.25+Math.random()*.5; g.spd*=1.1; fgDraw(); if(g.n>=3) setTimeout(()=>fgDone(false),420); }
function fgDone(quit){ const g=FG.game; FG.game=null; if(!g) return; const L0=fgLv(); G.fg=Math.min(FG_MAX,L0+1); G.fgQ=(G.fgQ||0)+g.pts; G.fgN=(G.fgN||0)+1; if(g.pts>=6) G.fgPerfect=(G.fgPerfect||0)+1; saveGame(); try{ net.hello(); net.pushProfile(1); }catch(e){}
  const L=G.fg; jingle(L>=10?[523,659,784,1046,1318,1568,2093]:L>=5?[523,659,784,1046,1318]:[659,784,1046]); if(typeof fxPillar==="function") fxPillar(fgColor(),1.6,L>=5?22:12,1.4,.45); fxRing(P.x,P.z,fgColor(),L>=5?9:6,.8);
  if(L===5||L===10) try{ lvBanner("무기 강화",`+${L}`,L===10?"신의 불꽃이 깃들었어요!":"무기가 빛나기 시작했어요!"); }catch(e){}
  card(`<h2>🔨 강화 성공!</h2><div class="fgbig"><em>⚔</em><b>${G.eq.w>=0?itemName("w",G.eq.w):"맨손"} <span style="color:var(--gold)">+${L0} → +${L}</span></b><span>${quit?"그만둬도 강화는 됐어요":g.pts>=6?"🌟 전부 완벽! 힘이 가득 붙었어요":`박자 점수 ${g.pts}/6`} · 공격 +${Math.round((fgMul()-1)*100)}%</span></div>
   ${L===5?'<p style="color:#9dffb8"><b>+5!</b> 이제 무기에서 세계 빛 불꽃이 피어올라요. 친구 화면에도 보여요!</p>':""}${L===10?'<p style="color:#ffcf4a"><b>+10 완성!</b> 신의 불꽃 무기 — 모두가 알아볼 거예요.</p>':""}
   <div class="exgrid"><button class="buy" id="fgAgain">${L<FG_MAX?"한 번 더":"닫기"}</button><button class="buy alt" id="fgOk">좋아요!</button></div>`);
  $("fgAgain").onclick=L<FG_MAX?showForge:closeLayer; $("fgOk").onclick=closeLayer; }
/* ---------- 무기 빛 불꽃 (나 + 친구) ---------- */
const FG_V=new THREE.Vector3();
function fgHand(obj){ const u=obj.userData||{}; let h=u._fgHand; if(h===undefined){ h=obj.getObjectByName("handslotr")||obj.getObjectByName("handslot.r")||(u.armR||null); u._fgHand=h; } return h; }
function fgOrb(obj,h,lv,realm){ const u=obj.userData; const tier=lv>=10?2:lv>=5?1:0; if(u._fgOrbT===tier) return u._fgOrb; if(u._fgOrb){ u._fgOrb.parent&&u._fgOrb.parent.remove(u._fgOrb); u._fgOrb=null; } u._fgOrbT=tier; if(!tier||!h) return null;
  const g=new THREE.Group(); const col=fgColor(realm); const a=sph(tier>1?.55:.38,glowMat(col,.55),0,0,0); const b=sph(tier>1?.28:.2,glowMat(0xffffff,.8),0,0,0); g.add(a); g.add(b); if(tier>1){ const r=new THREE.Mesh(new THREE.TorusGeometry(.6,.06,6,20),glowMat(0xfff2a0,.8)); g.add(r); g.userData.ring=r; } g.traverse(o=>{ o.userData.noOutline=true; o.castShadow=false; }); g.userData.a=a;
  const ws=new THREE.Vector3(); h.getWorldScale(ws); g.scale.setScalar(1/Math.max(.01,ws.x)); h.add(g); u._fgOrb=g; return g; }
function fgEmit(obj,lv,realm){ if(!obj||!obj.visible) return; const h=fgHand(obj); const orb=fgOrb(obj,h,lv,realm); if(orb){ const t=performance.now()/1000; orb.userData.a.scale.setScalar(1+Math.sin(t*6)*.18); if(orb.userData.ring){ orb.userData.ring.rotation.x=t*3; orb.userData.ring.rotation.y=t*2; } } if(lv<5) return; if(h){ h.getWorldPosition(FG_V); } else { FG_V.set(obj.position.x,obj.position.y+2,obj.position.z); } const col=fgColor(realm);
  fxSpark(FG_V.x+rnd(-.25,.25),FG_V.y+rnd(-.1,.5),FG_V.z+rnd(-.25,.25),col,lv>=10?(HIGH()?4:2):1); if(lv>=10&&Math.random()<.5) fxSpark(FG_V.x,FG_V.y+.3,FG_V.z,0xfff6d0,1); }
function fgTick(dt){ if(!started) return; FG.sparkT-=dt; const t=performance.now()/1000;
  FG.spots.forEach(s=>{ if(!s||Math.hypot(P.x-s.x,P.z-s.z)>70) return; const u=s.g.userData; u.fire.scale.set(1+Math.sin(t*9)*.08,1.5+Math.sin(t*13)*.18,1); u.fire2.scale.setScalar(1+Math.sin(t*17)*.12); u.ingot.material.emissiveIntensity=.7+Math.sin(t*3)*.25; if(Math.random()<dt*3) fxSpark(s.x+rnd(-.5,.5),2.4,s.z+rnd(-.5,.5),0xffa040,1); });
  if(FG.sparkT<=0){ FG.sparkT=ECO()?.2:.12; if(!P.dead&&player) fgEmit(player,fgLv(),G.realm); for(const id in PEERS){ const o=PEERS[id]; if(o.fg>=5&&!o.dead&&Math.hypot(o.x-P.x,o.z-P.z)<45) fgEmit(o.mesh,o.fg,o.realm); } } }
/* ---------- 칭호 ---------- */
TITLES.push({id:"fg5",n:"불꽃 대장장이",t:1,h:"무기 +5 만들기",g:()=>[fgLv(),5]},{id:"fg10",n:"신의 대장장이",t:3,h:"무기 +10 만들기",g:()=>[fgLv(),10]},{id:"fgp",n:"완벽한 박자",t:2,h:"강화 박자 3번 모두 완벽",g:()=>[G.fgPerfect||0,1]});
</script>
