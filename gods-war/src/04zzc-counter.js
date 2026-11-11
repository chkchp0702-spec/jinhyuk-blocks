<script>
/* ================= v113-1: ⚡ 신의 반격 — 딱 맞춰 피하면 세상이 느려지는 순간 (IDEAS G11/11-1) =================
   괴물이 때리기 직전(발밑 빨간 원이 차오를 때) 「딱 그 순간」 점프해서 공격을 피하면 = 완벽한 피하기!
   - 판정: 점프를 누른 뒤 0.42초 안에 괴물 공격이 들어와 공중에서 피함(처음 5번은 0.6초로 넉넉하게). hurtPlayer 를 감쌈.
   - 연출: 0.55초 동안 세상이 느려짐(update 의 dt 를 줄임 → 괴물·화살·효과 모두) + 화면 가장자리 금빛 + "⚡ 완벽!" + 찰칵 소리.
   - 1.1초 안에 공격 버튼 → 「신의 반격」: 세계마다 다른 연출(에덴 빛 십자 · 아스가르드 번개 · 인도 연꽃 회오리 · 올림푸스 방패 밀치기)
     데미지 = 공격력 × 2 (콤보 2번째 ×2.5 · 3번째부터 ×3) + 괴물이 1.6초 동안 비틀(다음 공격이 늦어짐) + 뒤로 밀림.
   - 콤보: 8초 안에 다시 반격하면 이어짐. 다른 사람 화면에도 내 자리에서 금빛 번쩍(t:"ctr").
   저장: G.ctN(완벽 피하기) · G.ctK(반격) · G.ctBest(최고 콤보) · G.ctTip(안내 본 횟수). 칭호 3개. */
const CT_WIN=.42, CT_WIN_EASY=.6, CT_SLOW=.55, CT_SCALE=.3, CT_HIT=1.1, CT_COMBO=8;
const CT={jt:-9,last:-9,slowT:0,win:0,m:null,combo:0,comboT:0,tipT:0,el:null};
const CT_STYLE=[{n:"빛의 십자 베기",c:0xffe58a,c2:0xffffff},{n:"번개 내려찍기",c:0x9ad8ff,c2:0xffffff},{n:"연꽃 회오리",c:0xff8fc8,c2:0xffe08a},{n:"방패 밀치기",c:0xffd05a,c2:0x7ab8ff}];
function ctNow(){ return performance.now()/1000; }
function ctEl(){ if(CT.el&&CT.el.isConnected) return CT.el; const d=document.createElement("div"); d.id="ctFx"; d.innerHTML='<div class="ed"></div><div class="tx"></div>'; document.body.appendChild(d); CT.el=d; return d; }
function ctShow(txt,sub){ const d=ctEl(); d.querySelector(".tx").innerHTML=`${txt}${sub?`<small>${sub}</small>`:""}`; d.classList.remove("on"); void d.offsetWidth; d.classList.add("on"); clearTimeout(CT.hideT); CT.hideT=setTimeout(()=>d.classList.remove("on"),900); }
/* ---------- 점프 기록: 점프 버튼은 06-ui.js 가 먼저 묶어서, 매 프레임 위로 솟는 순간(vy 가 갑자기 커짐)을 봄 ---------- */
function ctJumpWatch(){ const vy=P.vy||0; if(vy>8&&vy>(CT.pvy||0)+4) CT.jt=ctNow()-.016; CT.pvy=vy; }
/* ---------- 완벽한 피하기 판정 ---------- */
function ctAttacker(from){ if(typeof from!=="string") return null; let best=null, bd=1e9; for(const m of mobs){ if(m.hp<=0||m.n!==from||m.still||m.titan) continue; const d=Math.hypot(m.x-P.x,m.z-P.z); const lim=(m.boss?4.6:3.6)*Math.max(1,m.scale||1); if(d<lim&&d<bd){ bd=d; best=m; } } return best; }
(function(){ const _h=hurtPlayer; hurtPlayer=function(dmg,from){
  try{ if(!P.dead&&!(P.invul>0)&&P.y>0.8&&!(typeof from==="object"&&from&&from.sure)){ const t=ctNow(); const win=(G.ctN||0)<5?CT_WIN_EASY:CT_WIN;
      if(t-CT.jt<win&&t-CT.last>1.2){ const m=ctAttacker(from); if(m){ const r=_h.apply(this,arguments); ctPerfect(m); return r; } } } }catch(e){ console.warn(e); }
  return _h.apply(this,arguments); }; })();
function ctPerfect(m){ CT.last=ctNow(); CT.slowT=CT_SLOW; CT.win=CT_HIT; CT.m=m; G.ctN=(G.ctN||0)+1; saveGame();
  tone(1760,.05,"square",0,.07); tone(2349,.09,"sine",.03,.06); tone(220,.25,"sine",0,.05); buzz([15,30,15]);
  try{ SFX.glow(P.x,1.6+hAt(P.x,P.z),P.z,0xffe08a,2.6,.5); }catch(e){} fxRing(P.x,P.z,0xffe08a,4,.45);
  ctShow("⚡ 완벽!",G.ctN<=3?"지금 공격 버튼! → 신의 반격":"공격으로 반격!");
  try{ m.cd=Math.max(m.cd||0,.9); }catch(e){} }
/* ---------- 신의 반격 ---------- */
function ctCounter(){ const m=CT.m; CT.win=0; CT.m=null; if(!m||m.hp<=0||mobs.indexOf(m)<0) return false; const d=Math.hypot(m.x-P.x,m.z-P.z); if(d>7) return false;
  const t=ctNow(); CT.combo=(t-CT.comboT<CT_COMBO)?CT.combo+1:1; CT.comboT=t; const mult=CT.combo>=3?3:CT.combo===2?2.5:2;
  P.rot=Math.atan2(m.x-P.x,m.z-P.z); try{ if(player) player.rotation.y=P.rot; }catch(e){}
  const st=stat(); const realm=Math.max(0,G.realm|0); const S=CT_STYLE[realm]||CT_STYLE[0];
  ctFx(realm,m); damageMob(m,st.atk*mult*rnd(.95,1.05),true);
  if(m.hp>0){ m.cd=Math.max(m.cd||0,1.6); m.ctStun=1.6; if(!m.boss&&!m.still){ const k=d||1; m.x+=(m.x-P.x)/k*2.4; m.z+=(m.z-P.z)/k*2.4; } }
  G.ctK=(G.ctK||0)+1; G.ctBest=Math.max(G.ctBest||0,CT.combo); saveGame();
  ctShow(`⚡ 신의 반격!${CT.combo>1?` <em>×${CT.combo}</em>`:""}`,`${S.n} · 데미지 ×${mult}`);
  jingle([784,1046,1318,1568]); thud(); buzz([30,20,50]); P.shake=Math.max(P.shake||0,.7);
  try{ net.send({t:"ctr",x:Math.round(P.x*10)/10,z:Math.round(P.z*10)/10,r:realm,c:CT.combo}); }catch(e){}
  return true; }
function ctFx(realm,m){ const S=CT_STYLE[realm]||CT_STYLE[0]; const x=m.x, z=m.z, rot=P.rot;
  try{
    if(realm===0){ SFX.beamLine(P.x,P.z,rot+.45,8,1.1,S.c); SFX.beamLine(P.x,P.z,rot-.45,8,1.1,S.c2); SFX.glow(x,2+hAt(x,z),z,S.c,3.2,.5); SFX.runeAt(x,z,S.c,3.4,.7); }
    else if(realm===1){ SFX.glow(x,6+hAt(x,z),z,S.c,2,.3); for(let k=0;k<6;k++) fxSpark(x,6-k,z,S.c,4); SFX.shock(x,z,S.c,5,.45); SFX.dust(x,z,14,3); SFX.glow(x,1+hAt(x,z),z,S.c2,3.4,.35); }
    else if(realm===2){ SFX.runeAt(x,z,S.c,4,.8); SFX.shock(x,z,S.c2,4.2,.5); for(let k=0;k<8;k++){ const a=k/8*6.283; fxSpark(x+Math.cos(a)*1.6,1.2,z+Math.sin(a)*1.6,k%2?S.c:S.c2,4); } SFX.glow(x,1.8+hAt(x,z),z,S.c,2.8,.45); }
    else { SFX.speed(P.x,P.z,rot,S.c); SFX.shock(x,z,S.c2,4.6,.45); SFX.glow(x,1.6+hAt(x,z),z,S.c,3,.45); SFX.dust(x,z,12,2.6); }
  }catch(e){ fxRing(x,z,S.c,5,.5); fxSpark(x,2,z,S.c,24); }
  fxFlash(x,1.6,z,0xffffff,2.4,.25); }
(function(){ const _a=attack; attack=function(){ if(CT.win>0&&!P.dead&&!layerOpen&&!(P.atkCd>0)){ const ok=ctCounter(); const r=_a.apply(this,arguments); if(ok) P.atkCd=Math.max(P.atkCd||0,.32); return r; } return _a.apply(this,arguments); }; })();
/* 남이 반격하면 그 자리에 금빛 번쩍 */
NETR.ctr=(o,d)=>{ if(!o||!(Math.abs(+d.x)<2000)) return; const x=+d.x, z=+d.z; if(Math.hypot(x-P.x,z-P.z)>70) return; const S=CT_STYLE[d.r|0]||CT_STYLE[0]; fxRing(x,z,S.c,4.5,.45); fxSpark(x,2.4,z,S.c,16); try{ SFX.glow(x,1.8+hAt(x,z),z,S.c,2.2,.4); }catch(e){} if((d.c|0)>=3) floatDmg(x,4.6,z,`⚡ 반격 ×${d.c|0}`,"crit"); };
/* ---------- 세상이 느려짐: update 의 dt 를 줄임 ---------- */
function ctScale(){ if(CT.slowT<=0) return 1; const k=CT.slowT/CT_SLOW; return CT_SCALE+(1-CT_SCALE)*Math.max(0,1-k*1.6); }
document.addEventListener("DOMContentLoaded",()=>{ try{ const _u=update; update=function(dt){ const s=ctScale(); return _u(s<1?dt*s:dt); }; }catch(e){ console.warn(e); } });
/* ---------- 매 프레임 (진짜 시간으로 셈) ---------- */
function ctTick(){ ctJumpWatch(); const t=ctNow(); const rd=Math.min(.1,t-(CT.rt||t)); CT.rt=t;
  if(CT.slowT>0){ CT.slowT=Math.max(0,CT.slowT-rd); } const el=CT.el; if(el) el.classList.toggle("slow",CT.slowT>0);
  if(CT.win>0){ CT.win=Math.max(0,CT.win-rd); if(CT.win<=0) CT.m=null; }
  mobs.forEach(m=>{ if(m.ctStun>0){ m.ctStun-=rd; if(m.hp>0&&m.mesh){ m.mesh.rotation.z=Math.sin(t*18)*.12*Math.min(1,m.ctStun); if(m.ctStun<=0) m.mesh.rotation.z=0; } } });
  // 처음 몇 번은 빨간 원이 찰 때 알려 줌
  if((G.ctN||0)<2&&(G.ctTip||0)<6&&!P.dead&&!layerOpen&&t-CT.tipT>40){ const w=mobs.find(m=>m.mesh&&m.mesh.userData.wk>.35&&Math.hypot(m.x-P.x,m.z-P.z)<4.5); if(w){ CT.tipT=t; G.ctTip=(G.ctTip||0)+1; toast("💡 빨간 원이 다 차기 직전에 점프!","딱 맞춰 피하면 ⚡ 완벽! → 공격 버튼으로 「신의 반격」",3); } } }
XTICK.push(ctTick);
/* ---------- 창 ---------- */
function showCounter(){ const realm=Math.max(0,G.realm|0); const S=CT_STYLE[realm];
  card(`<h2>⚡ 신의 반격</h2><p>괴물 발밑에 <b style="color:#ff6a4a">빨간 원</b>이 차오르면 곧 공격이 와요. 원이 <b>거의 다 찼을 때</b> 점프해서 피하면 <b>⚡ 완벽!</b> — 세상이 잠깐 느려져요.</p>
   <p>그때 <b>공격 버튼</b>을 누르면 내 세계의 「신의 반격」이 나가요: <b style="color:#ffe08a">${REALMS[realm].icon} ${S.n}</b> · 데미지 ×2 + 괴물이 비틀거려요. 8초 안에 또 반격하면 콤보 ×2.5 · ×3!</p>
   <div class="idlegrid"><div><b>${G.ctN||0}</b><span>완벽한 피하기</span></div><div><b>${G.ctK||0}</b><span>신의 반격</span></div><div><b>×${G.ctBest||0}</b><span>최고 콤보</span></div></div>
   <div class="exgrid">${CT_STYLE.map((s,i)=>`<div class="row"><div class="ic">${REALMS[i].icon}</div><div class="t"><div>${REALMS[i].n}</div><span>${s.n}</span></div></div>`).join("")}</div>
   <p style="font-size:12px">처음 5번은 타이밍을 넉넉하게 봐줘요. 너무 일찍 뛰면 그냥 「피함!」이에요 — 원이 꽉 차기 바로 전이 딱 좋아요.</p>`); }
MENU_X.push({ic:"⚡",n:"신의 반격",id:"ctBtn",sub:()=>(G.ctK?`반격 ${G.ctK}번 · 최고 콤보 ×${G.ctBest||1}`:"딱 맞춰 점프하면 슬로 모션 반격!"),f:showCounter});
TITLES.push({id:"ct1",n:"딱 그 순간",t:1,h:"완벽한 피하기 10번",g:()=>[G.ctN||0,10]},{id:"ct2",n:"바람보다 빠른 자",t:2,h:"신의 반격 콤보 ×3",g:()=>[G.ctBest||0,3]},{id:"ct3",n:"반격의 신",t:3,h:"신의 반격 100번",g:()=>[G.ctK||0,100]});
</script>
<style>
#ctFx{position:fixed;inset:0;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
#ctFx.on,#ctFx.slow{opacity:1;transition:none}
#ctFx .ed{position:absolute;inset:0;box-shadow:inset 0 0 70px 18px rgba(255,214,90,.55),inset 0 0 0 3px rgba(255,236,160,.7);background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(60,40,0,.28) 100%)}
#ctFx:not(.slow) .ed{opacity:.45}
#ctFx .tx{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%) scale(.6);opacity:0;text-align:center;color:#fff3c0;font-weight:900;font-size:34px;letter-spacing:1px;text-shadow:0 3px 0 #7a4a00,0 0 14px rgba(255,200,60,.9),0 0 2px #000;white-space:nowrap}
#ctFx .tx em{font-style:normal;color:#ffd24a} #ctFx .tx small{display:block;font-size:13px;font-weight:800;color:#fff;text-shadow:0 1px 2px #000;margin-top:2px}
#ctFx.on .tx{animation:ctPop .9s ease-out forwards}
@keyframes ctPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}30%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-62%) scale(1)}}
</style>
