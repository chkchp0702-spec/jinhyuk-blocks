<script>
/* ================= v186: 달릴 때 망토가 뒤로 휘날림 =================
   내 캐릭터 망토(기사·마법사·레인저·도적·팔라딘·영웅·흑기사 망토, 잎사귀 망토)가 몸에 딱 붙은 판처럼 굳어 있던 것을,
   달리면 아래쪽부터 뒤로 들려 펄럭이고(빠를수록·탈것 타면 더), 멈추면 천천히 내려와 살랑, 점프하면 위로 살짝 뜸.
   망토 재질만 복사해 정점 셰이더 몇 줄(어깨 쪽은 그대로, 끝으로 갈수록 크게) — 그리기 호출·폴리곤 그대로, PointLight 없음.
   v101 림라이트(RIM)와 순서 상관없이 함께 붙음. 모습만 — 저장·규칙 그대로. */
const CAPEWAVE=(()=>{
  const U={uRun:{value:0},uLift:{value:0},uSw:{value:0}}; let lastP=null, n=0, t=0, run=0, lift=0, sw=0, prevRot=null;
  function capeMat(m,top,bot){ if(!m||Array.isArray(m)||m.userData.cape) return m;
    const c=m.clone(); c.userData.cape=true; const prev=m.onBeforeCompile, pk=m.customProgramCacheKey?m.customProgramCacheKey():"";
    c.onBeforeCompile=function(sh,r){ if(prev) try{ prev.call(this,sh,r); }catch(e){}
      sh.uniforms.uTime=TIME; sh.uniforms.uRun=U.uRun; sh.uniforms.uLift=U.uLift; sh.uniforms.uSw=U.uSw;
      sh.vertexShader="uniform float uTime;\nuniform float uRun;\nuniform float uLift;\nuniform float uSw;\n"+sh.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      { float h=clamp((${top.toFixed(3)}-position.y)/${Math.max(.2,top-bot).toFixed(3)},0.,1.); float w=h*h;
        float fl=sin(uTime*(6.+uRun*6.)+position.y*7.+position.x*2.5);
        transformed.z-=w*(uRun*.55+uLift*.12)+w*fl*(.018+uRun*.05);
        transformed.y+=w*(uRun*.24+uLift*.22);
        transformed.x+=w*(uSw*.28+cos(uTime*4.3+position.y*5.)*(.01+uRun*.025)); }`); };
    c.customProgramCacheKey=function(){ return "cape1"+pk; }; return c; }
  function apply(){ if(typeof player==="undefined"||!player) return; player.traverse(o=>{ if(!o.isSkinnedMesh||!/_(Cape|Cloak)$/.test(o.name)||!o.material||Array.isArray(o.material)||o.material.userData.cape) return;
      if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const b=o.geometry.boundingBox; o.material=capeMat(o.material,b.max.y,b.min.y); }); }
  function tick(dt){ if(typeof player==="undefined"||!player||typeof P==="undefined") return;
    if(player!==lastP||(++n%30===0)){ lastP=player; try{ apply(); }catch(e){} }
    t+=dt; const rT=P.dead?0:P.moving?(P.ride?1.25:1)*(P.dashT>0?1.3:1):0;
    run+=(rT-run)*Math.min(1,dt*(rT>run?4:2.2));                 // 달리면 금방 들리고, 멈추면 천천히 내려옴
    const lT=(P.y||0)>.05?Math.min(1,(P.y||0)*.6):0; lift+=(lT-lift)*Math.min(1,dt*5);
    const r=player.rotation.y; if(prevRot!=null){ let d=r-prevRot; d=Math.atan2(Math.sin(d),Math.cos(d)); const sT=Math.max(-1,Math.min(1,-d/Math.max(dt,.001)*.12)); sw+=(sT-sw)*Math.min(1,dt*4); } prevRot=r;   // 돌 때 반대쪽으로 쓸림
    U.uRun.value=run; U.uLift.value=lift; U.uSw.value=sw*(.4+run*.6); }
  XTICK.push(tick);
  return {U,apply,tick};
})();
</script>
