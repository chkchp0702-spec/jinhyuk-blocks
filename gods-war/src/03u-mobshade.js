<script>
/* v79 괴물 발밑 그림자: 가장자리가 부드럽게 번지는 동그란 그림자. 몸이 떠오르면(유령·날개·맞고 튕김·통통 걸음) 그림자는 땅에 그대로 붙어 있고, 높이 뜰수록 작고 흐려짐. 모습만 */
const MOBSHADE=(function(){
  let tex=null;
  function T(){ if(tex) return tex; const c=document.createElement("canvas"); c.width=c.height=64; const x=c.getContext("2d"); const g=x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,"rgba(0,0,0,1)"); g.addColorStop(.45,"rgba(0,0,0,.85)"); g.addColorStop(.75,"rgba(0,0,0,.35)"); g.addColorStop(1,"rgba(0,0,0,0)");
    x.fillStyle=g; x.fillRect(0,0,64,64); tex=new THREE.CanvasTexture(c); return tex; }
  function soften(sh,R){ try{ sh.material.map=T(); sh.material.color.set(0xffffff); sh.material.opacity=.42; sh.material.needsUpdate=true; sh.scale.setScalar(1.3); sh.userData.base=1.3; sh.renderOrder=-1; }catch(e){} return sh; }
  function apply(m,d){
    const g=m.mesh; if(!g||m.hp<=0||d>70) return; const sh=g.userData.sh; if(!sh) return;
    const lift=Math.max(0,g.position.y-hAt(m.x,m.z)), sy=g.scale.y||1, sx=g.scale.x||1, sz=g.scale.z||1, avg=(sx+sz)/2;
    const k=1/(1+lift*.45), b=sh.userData.base||1;
    sh.position.y=(.06-lift)/sy;                                   // 땅에 딱 붙임
    sh.scale.set(b*k*avg/sx,b*k*avg/sz,1);                         // 숨쉬기로 몸이 늘어도 그림자는 동그랗게
    sh.material.opacity=.42*(.35+.65*k);
  }
  return {soften,apply};
})();
</script>
