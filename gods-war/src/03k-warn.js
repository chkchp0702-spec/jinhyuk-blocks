<script>
/* ================= 괴물 공격 예고 (v38) =================
   - 괴물이 때리기 직전(보통 0.5초·보스 0.7초): 발밑에 빨간 경고 원이 생기고 안쪽이 가운데서부터 차오름 → 다 차면 "쾅"
   - 몸이 움츠러들고(납작·뒤로 젖힘) 몸이 빨갛게 달아오름 → 덮치기 직전 느낌
   - 모습만 — 공격 시간·피해·규칙은 그대로(cd 값을 읽기만 함)
   그리기: 경고 중인 괴물만 원 1장(최대 8장, 배터리 절약 4장), 셰이더 하나, PointLight 없음. */
const WARN=(()=>{ const POOL=[]; let used=0; const GEO=new THREE.PlaneGeometry(2,2);
  const VS="varying vec2 vU; void main(){ vU=uv*2.-1.; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }";
  const FS="uniform float k; uniform float t; uniform float hit; varying vec2 vU; void main(){ float r=length(vU); if(r>1.) discard;"+
    " float edge=smoothstep(.84,.92,r)*(1.-smoothstep(.97,1.,r));"+   // 바깥 테두리
    " float fill=1.-smoothstep(k-.04,k,r);"+                            // 차오르는 안쪽
    " float front=smoothstep(k-.1,k-.02,r)*(1.-smoothstep(k-.02,k+.02,r));"+ // 차오르는 끝 밝은 줄
    " float tick=step(.5,fract(atan(vU.y,vU.x)*3.8197))*smoothstep(.78,.8,r)*(1.-smoothstep(.84,.86,r));"+ // 안쪽 눈금
    " float pulse=.75+.25*sin(t*22.);"+
    " vec3 dark=vec3(.55,.02,.0), red=vec3(1.,.12,.04), hot=vec3(1.,.75,.35);"+
    " float a=edge*pulse+fill*.48+front*.9+tick*.55+(1.-r)*.08; a=max(a,hit*(1.-r*.6)*.9);"+
    " vec3 c=mix(dark,red,clamp(fill*.6+edge*.5,0.,1.)); c=mix(c,hot,front*.8+hit*.7);"+
    " gl_FragColor=vec4(c,clamp(a,0.,1.)); }";
  function make(){ const mat=new THREE.ShaderMaterial({uniforms:{k:{value:0},t:{value:0},hit:{value:0}},vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const m=new THREE.Mesh(GEO,mat); m.rotation.x=-Math.PI/2; m.userData.noOutline=true; m.renderOrder=3; m.frustumCulled=false; m.visible=false; scene.add(m); return m; }
  function begin(){ used=0; }
  // tickMobs 에서 괴물 모습을 다 정한 다음 부름. inRange: 때릴 수 있는 거리 안·쫓는 중
  function tick(m,inRange,dt){ const W=m.boss?.7:.5; const ud=m.mesh.userData;
    // 방금 때림 → 원이 하얗게 번쩍하고 사라짐(0.15초)
    if(ud.lunge>.1&&ud.wk>.5){ ud.wf=.15; }
    ud.wk=0;
    let k=0; if(inRange&&m.cd>0&&m.cd<W&&!P.dead&&m.hp>0) k=1-m.cd/W;
    if(ud.wf>0) ud.wf-=dt;
    const flash=ud.wf>0?ud.wf/.15:0;
    if(k<=0&&flash<=0) return;
    ud.wk=k;
    const lim=ECO()?4:8; if(used>=lim) return;
    const d=POOL[used]||(POOL[used]=make()); used++;
    const R=((m.boss?3.4:2.3)+1.5)*(m.boss?1.2:1)*Math.max(1,Math.sqrt(m.scale||1)*.8);
    d.visible=true; d.scale.setScalar(R); d.position.set(m.x,hAt(m.x,m.z)+.16,m.z);
    d.material.uniforms.k.value=flash>0?1:k; d.material.uniforms.t.value=performance.now()/1000; d.material.uniforms.hit.value=flash;
    if(k>0){ // 움츠림: 납작해지고 뒤로 젖힘 + 빨갛게 달아오름
      const e=k*k; const s=m.mesh.scale; s.y*=1-.16*e; s.x*=1+.08*e; s.z*=1+.08*e;
      if(!ud.float) m.mesh.rotation.x+=-.22*e; m.mesh.position.y-=.12*e*(m.scale||1);
      try{ hitTint(m.mesh,Math.max(m.hit/.15,(.25+.3*Math.abs(Math.sin(performance.now()/45)))*k),0xff2a10); }catch(e){} } }
  function end(){ for(let i=used;i<POOL.length;i++) POOL[i].visible=false; }
  return {begin,tick,end};
})();
</script>
