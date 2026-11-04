<script>
/* ================= 타격 손맛 (v34) =================
   - 맞은 괴물: 맞은 반대쪽으로 휙 밀렸다 돌아옴 + 뒤로 젖혀짐 + 살짝 들썩 (모습만 — 실제 자리·규칙은 그대로)
   - 짧은 멈춤(히트스톱): 맞는 순간 0.05초(치명타 0.09초) 동작이 딱 멈춤 → "콱" 박히는 느낌
   - 쓰러짐: 죽으면 바로 사라지지 않고 뒤로 털썩 넘어짐(3D 모델은 쓰러지는 동작) → 잠깐 누워 있다 땅속으로 스르르 + 흙먼지
   PointLight 없음, 새 그리기 없음(괴물 몸 그대로 씀). 쓰러진 몸은 최대 8개(배터리 절약 4개). */
const HITF=(()=>{ const C=[]; const ease=k=>1-Math.pow(1-k,3);
  function knock(m,dmg,crit){ if(!m||!m.mesh||m.titan) return; const dx=m.x-P.x, dz=m.z-P.z, d=Math.hypot(dx,dz)||1;
    let s=clamp(.45+(dmg/(m.mhp||1))*2.2,.45,1.25)*(crit?1.3:1); if(m.boss) s*=.35; s/=Math.max(1,(m.scale||1)*.75);
    m.kb={x:dx/d,z:dz/d,s,t:0}; m.hs=crit?.09:.05; m.mesh.rotation.order="YXZ"; m.mesh.userData.hsU=performance.now()+m.hs*1000; }
  // tickMobs 에서 위치를 정한 다음 부름
  function apply(m,dt){ const k=m.kb; if(!k) return; if(m.hs>0) m.hs-=dt; else k.t+=dt; const D=.34; if(k.t>=D){ m.kb=null; return; }
    const u=k.t/D; const off=k.s*(u<.18?ease(u/.18):Math.pow(1-(u-.18)/.82,2)); const p=m.mesh.position;
    p.x+=k.x*off; p.z+=k.z*off; p.y+=off*.22; if(!m.mesh.userData.float) m.mesh.rotation.x+=-off*.38; }
  function die(m){ if(!m||!m.mesh||m.titan||m.corpse) return false; const lim=ECO()?4:8; while(C.length>=lim) end(C[0]);
    const g=m.mesh; const dx=m.x-P.x, dz=m.z-P.z, d=Math.hypot(dx,dz)||1; g.rotation.order="YXZ"; g.userData.hsU=0;
    const c={g,t:0,x:g.position.x,y:g.position.y,z:g.position.z,dx:dx/d,dz:dz/d,sc:g.scale.x,gl:!!g.userData.gl,fl:!!g.userData.float,dust:false,rx:g.rotation.x};
    try{ hitTint(g,0); }catch(e){} if(c.gl) animState(g,"dead"); m.corpse=true; C.push(c); return true; }
  function end(c){ scene.remove(c.g); const i=C.indexOf(c); if(i>=0) C.splice(i,1); }
  function tick(dt){ for(let i=C.length-1;i>=0;i--){ const c=C[i], g=c.g; c.t+=dt; const t=c.t;
      if(c.gl){ // 3D 모델: 쓰러지는 동작 + 맞은 쪽으로 조금 밀림
        const s=ease(Math.min(1,t/.4)); g.position.set(c.x+c.dx*s*.7,c.y,c.z+c.dz*s*.7); }
      else if(c.fl){ // 떠다니는 괴물: 빙글 돌며 떨어짐
        const s=Math.min(1,t/.5); g.rotation.y+=dt*9*(1-s); g.rotation.x=c.rx-ease(s)*1.2; g.position.set(c.x+c.dx*s*.8,Math.max(hAt(c.x,c.z),c.y-ease(s)*1.4)+Math.sin(s*Math.PI)*.5,c.z+c.dz*s*.8); }
      else { // 뒤로 털썩 + 한 번 통 튐
        const s=Math.min(1,t/.38); const fall=ease(s); const bounce=t>.38&&t<.58?Math.sin((t-.38)/.2*Math.PI)*.09:0;
        g.rotation.x=c.rx-(fall+bounce)*Math.PI*.5; g.position.set(c.x+c.dx*fall*.8,c.y+Math.sin(s*Math.PI)*.35*c.sc,c.z+c.dz*fall*.8); }
      const S0=c.gl?1.25:.95, S1=S0+.65;
      if(t>S0){ if(!c.dust){ c.dust=true; try{ SFX.dust(g.position.x,g.position.z,HIGH()&&!ECO()?6:3,1.6*c.sc); }catch(e){} }
        const k=Math.min(1,(t-S0)/(S1-S0)); g.position.y=c.y-k*k*1.6*c.sc; g.scale.setScalar(c.sc*(1-k*.55)); }
      if(t>=S1) end(c); } }
  function clear(){ while(C.length) end(C[0]); }
  return {knock,apply,die,tick,clear,C};
})();
</script>
