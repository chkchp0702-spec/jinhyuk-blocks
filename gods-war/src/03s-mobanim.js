<script>
/* v68 괴물 몸짓: 걸을 땐 통통 걸음·앞으로 기울임·뒤뚱, 돌 땐 몸 기울임, 가만히 있을 땐 숨쉬기(들썩)·두리번. 모습만 — 위치·속도·공격은 그대로 */
const MOBANIM=(function(){
  const cl=(v,a,b)=>v<a?a:v>b?b:v;
  function apply(m,dt,t,d){
    const g=m.mesh; if(!g||m.hp<=0||!(dt>0)) return; const ud=g.userData;
    if(m._ph==null){ m._ph=Math.random()*6.283; m._px=m.x; m._pz=m.z; m._v=0; m._st=0; m._bk=0; m._ryp=g.rotation.y; m._lw=0; }
    const v=Math.hypot(m.x-m._px,m.z-m._pz)/dt; m._px=m.x; m._pz=m.z; m._v+=(cl(v,0,12)-m._v)*Math.min(1,dt*8);
    let dr=g.rotation.y-m._ryp; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m._ryp=g.rotation.y;
    if(d>70) return;
    g.rotation.order="YXZ";
    const walk=cl(m._v/4,0,1.2), sc=m.scale||1;
    m._bk+=(cl(-dr/dt*.07,-.28,.28)-m._bk)*Math.min(1,dt*6); // 도는 쪽으로 몸 기울임
    m._st+=dt*(3.5+m._v*2.1);
    const idle=walk<.15&&m.state!=="chase"&&m.hit<=0;
    m._lw+=((idle?1:0)-m._lw)*Math.min(1,dt*2.5);
    if(m._lw>.01){ const lk=(Math.sin(t*.0007+m._ph)*.42+Math.sin(t*.0019+m._ph*2)*.12)*m._lw; m._lk=lk; g.rotation.y+=lk; m._ryp+=lk; }
    if(ud.gl){ g.rotation.z=m._bk*.6; return; }
    if(ud.float){ g.rotation.z=m._bk+Math.sin(t*.0011+m._ph)*.08; return; }
    const s=Math.sin(m._st);
    if(m.state!=="chase") g.position.y+=Math.abs(s)*.16*walk*Math.min(1.6,sc);   // 통통 걸음(쫓을 땐 원래 뜀 그대로)
    g.rotation.x+=.11*walk;                                                         // 앞으로 기울임
    g.rotation.z=m._bk+s*.075*walk;                                                 // 뒤뚱
    const br=Math.sin(t*.0024+m._ph)*m._lw;                                         // 숨쉬기: 늘었다 줄었다
    if(br) g.scale.set(g.scale.x*(1-br*.02),g.scale.y*(1+br*.045),g.scale.z*(1-br*.02));
    if(walk>.2){ const sq=1+Math.abs(Math.cos(m._st))*.05*walk; g.scale.y*=sq; g.scale.x/=Math.sqrt(sq); g.scale.z/=Math.sqrt(sq); } // 발 디딜 때 살짝 찌그러짐
  }
  return {apply};
})();
</script>
