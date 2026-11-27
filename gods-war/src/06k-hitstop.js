<script>
/* ================= v189: 보통 괴물 처치 순간 아주 짧은 히트스톱 + 카메라 콕 당김 =================
   보스·정예는 v142 KILLCAM(느린 화면) 몫 — 여기는 보통 괴물. 쓰러뜨리는 순간 세상이 약 0.06초 거의 멈췄다가(손에 "툭" 걸리는 느낌)
   카메라가 괴물 쪽으로 살짝 콕 다가갔다 0.2초에 걸쳐 제자리. 한 번에 여럿 잡아도 한 번만(0.22초 쿨), 멀리서 남이 잡은 건 무시.
   모습만(실제로 늦어지는 시간 0.06초 아래), 그리기 호출 0, PointLight 없음. 계산만 하므로 배터리 절약 모드도 같음. */
const HSTOP={f:0,ft:0,p:0,pt:0,x:0,y:0,z:0,cool:0,base:null,on:true};
(function(){
  const _die=HITF.die;
  HITF.die=function(m){ const r=_die.apply(this,arguments);
    try{ if(r!==false&&m&&!m.boss&&!m.elite&&!m.titan&&!m.war) HSTOP.go(m); }catch(e){} return r; };
  HSTOP.go=function(m){ const H=HSTOP; if(!H.on||H.cool>0||P.dead) return;
    if(typeof KILLCAM!=="undefined"&&KILLCAM.d>0&&KILLCAM.t<KILLCAM.d) return;   // 보스 슬로모션 중엔 안 겹침
    if(Math.hypot(m.x-P.x,m.z-P.z)>22) return;
    H.ft=H.f=.065; H.pt=H.p=.24; H.cool=.22;
    H.x=m.x; H.z=m.z; H.y=(m.mesh&&m.mesh.position?m.mesh.position.y:0)+.9*(m.scale||1);
    H.amp=.065; };
  const _up=update;
  update=function(dt){ const H=HSTOP; if(H.cool>0) H.cool-=dt;
    if(H.base){ camera.fov=H.base.fov; camera.position.copy(H.base.pos); camera.updateProjectionMatrix(); H.base=null; }
    let s=1; if(H.f>0){ H.f-=dt; s=.06; }            // 거의 멈춤
    _up(dt*s);
    if(H.p>0){ H.p-=dt; const t=1-H.p/H.pt;             // 0→1
      const k=t<.18?t/.18:Math.pow(1-(t-.18)/.82,2);    // 빠르게 콕 → 천천히 제자리
      const z=H.amp*k; if(z>.001&&!P.dead){ H.base={fov:camera.fov,pos:camera.position.clone()};
        const v=new THREE.Vector3(H.x-camera.position.x,H.y-camera.position.y,H.z-camera.position.z); if(v.length()>.01) camera.position.addScaledVector(v,z);
        camera.fov=H.base.fov*(1-z*.35); camera.updateProjectionMatrix(); } } };
})();
</script>
