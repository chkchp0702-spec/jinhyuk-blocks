<script>
/* ================= 공격할 때 몸이 앞으로 내딛기 (v123) =================
   근접 공격을 휘두르면 앞발을 내딛듯 몸이 앞으로 쑥 나가며 앞으로 숙였다가 용수철처럼 돌아옴.
   망치는 크게 내려찍듯(숙임 크게·살짝 주저앉음), 창은 길게 찌르듯(앞으로 멀리), 검·도끼는 그 사이.
   활·마법은 쏠 때 반대로 살짝 뒤로 반동. 내딛는 발 앞에 작은 흙먼지(땅 색).
   모습만 — 위치(P.x·P.z)·공격 거리·피해·규칙 그대로. 그리기 호출 0(먼지는 STEP 의 것을 돌려씀). */
const LUNGE=(()=>{ let t=9, dur=.32, dist=0, lean=0, dip=0, lastRx=null, on=false, fx=0, fz=0;
  const KIND={ sword:{d:.55,l:.17,p:.10,u:.30}, axe:{d:.5,l:.2,p:.12,u:.32}, dagger:{d:.6,l:.14,p:.06,u:.26},
    spear:{d:.95,l:.12,p:.05,u:.34}, hammer:{d:.42,l:.32,p:.26,u:.40}, bow:{d:-.22,l:-.08,p:0,u:.26}, magic:{d:-.16,l:-.06,p:0,u:.30} };
  function start(kind){ if(P.dead||P.ride||(typeof player==="undefined")||!player) return;
    const K=KIND[kind]||KIND.sword, s=ECO()?.8:1;
    dist=K.d*s; lean=K.l; dip=K.p; dur=K.u; t=0; on=true;
    fx=Math.sin(P.rot||0); fz=Math.cos(P.rot||0);
    if(K.d>0&&P.y<.05){ try{ const g=STEP.ground(P.x,P.z), px=P.x+fx*1.1, pz=P.z+fz*1.1;
      STEP.puff(px,pz,g,fx,fz,kind==="hammer"?1.25:.8); if(!ECO()) STEP.puff(px+fz*.4,pz-fx*.4,g,fx,fz,.7); }catch(e){} } }
  const _at=attack;
  attack=function(){ const cd=P.atkCd; const r=_at.apply(this,arguments);
    try{ if(P.atkCd>cd&&P.atkAnim>0){ let k="sword"; try{ k=myWeaponKind(); }catch(e){} start(k); } }catch(e){} return r; };
  // 모양: 0~25% 빠르게 내딛고, 남은 시간 동안 살짝 넘었다가 돌아옴
  function curve(u){ if(u<.25){ const a=u/.25; return 1-(1-a)*(1-a); } const b=(u-.25)/.75; return Math.cos(b*Math.PI*.5)*(1-b)+Math.sin(b*Math.PI)*-.08; }
  function tick(dt){ if(!on||typeof player==="undefined"||!player) return;
    if(player.rotation.order!=="YXZ") player.rotation.order="YXZ";
    let base=player.rotation.x; if(lastRx!==null&&Math.abs(base-lastRx)<1e-6) base=0;   // 남이 안 바꿨으면 내 몫 빼기
    t+=dt; if(P.dead||P.ride||t>=dur){ on=false; player.rotation.x=base; lastRx=null; return; }
    const c=curve(t/dur);
    player.position.x+=fx*dist*c; player.position.z+=fz*dist*c;
    if(dip>0) player.position.y-=dip*Math.max(0,c);
    player.rotation.x=base+lean*c; lastRx=player.rotation.x; }
  XTICK.push(tick);
  // 활·마법 반동
  if(typeof rangedAttack==="function"){ const _ra=rangedAttack; rangedAttack=function(kind){ const r=_ra.apply(this,arguments); try{ start(kind); }catch(e){} return r; }; }
  return {start,tick,_s:()=>({t,on,dist})};
})();
</script>
