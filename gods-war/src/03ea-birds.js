<script>
/* ================= v112: 먼 하늘 새 떼 =================
   낮에 화면 위쪽(먼 곳)으로 새 떼가 V자로 천천히 날아감 — 세상이 살아 있는 느낌.
   인스턴스 1묶음(그리기 호출 +1, 삼각형 몇 십 개), 날갯짓은 셰이더. 밤·비·폭풍·눈보라·미궁/집 안에선 안 나옴.
   ATMO.tick 을 감싸서 같은 박자로 움직임. 게임 규칙과는 아무 상관 없음(보기만). */
const BIRDS=(function(){
  const N=HIGH()?16:9;                      // 두 떼 합친 새 수
  const V=[ 0,0,.55, -.12,0,0, .12,0,0,   -.12,0,0, 0,0,-.5, .12,0,0,                          // 몸
            -.1,0,.22, -.1,0,-.18, -.62,0,.1,   -.62,0,.1, -.1,0,-.18, -.56,0,-.12,   -.62,0,.1, -.56,0,-.12, -1.25,0,-.34,   // 왼 날개
             .1,0,.22,  .1,0,-.18,  .62,0,.1,    .62,0,.1,  .1,0,-.18,  .56,0,-.12,    .62,0,.1,  .56,0,-.12,  1.25,0,-.34,   // 오른 날개
             0,0,-.35, -.2,0,-.72, .2,0,-.72 ];                                            // 꼬리
  const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(V,3));
  const uT={value:0}, uA={value:0}, uC={value:new THREE.Color(0x2a2438)};
  const mat=new THREE.ShaderMaterial({uniforms:{t:uT,a:uA,c:uC},transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,toneMapped:false,
    vertexShader:`uniform float t; varying float vE; void main(){ vec3 p=position; mat4 im=mat4(1.);
      #ifdef USE_INSTANCING
      im=instanceMatrix;
      #endif
      float ph=im[3].x*.37+im[3].z*.53+im[3].y*.21; float sp=8.+mod(ph*3.1,3.);
      float fl=sin(t*sp+ph); float gl=step(.5,fract(t*.11+ph*.07));     // 가끔 날개 펴고 활공
      fl=mix(fl,.15,gl*.85); float ax=abs(p.x);
      p.y+=fl*ax*.62-ax*ax*.08; p.x*=1.-.1*abs(fl); vE=ax;
      gl_Position=projectionMatrix*viewMatrix*modelMatrix*im*vec4(p,1.); }`,
    fragmentShader:`uniform float a; uniform vec3 c; varying float vE; void main(){ gl_FragColor=vec4(c*(1.+vE*.25),a*(1.-vE*.18)); }`});
  const mesh=new THREE.InstancedMesh(g,mat,N); mesh.frustumCulled=false; mesh.renderOrder=3; mesh.userData.noOutline=true; mesh.userData.noLod=true; mesh.visible=false;
  scene.add(mesh);
  const F=[{n:Math.ceil(N*.56),i0:0},{n:0,i0:0}]; F[1].n=N-F[0].n; F[1].i0=F[0].n;
  F.forEach((f,k)=>{ f.wait=k?rnd(9,16):rnd(1,3); f.on=false; f.pos=new THREE.Vector3(); f.vel=new THREE.Vector3(); f.life=0; f.sc=1; });
  const dm=new THREE.Object3D(), fw=new THREE.Vector3(), rt=new THREE.Vector3(), up=new THREE.Vector3(0,1,0), ray=new THREE.Vector3();
  function spawn(f){
    camera.getWorldDirection(fw); const pitch=Math.asin(Math.max(-1,Math.min(1,fw.y)));
    const hx=fw.x, hz=fw.z, hl=Math.hypot(hx,hz)||1; rt.set(-hz/hl,0,hx/hl);       // 화면 오른쪽(수평)
    // 화면 위쪽 15~30% 높이를 지나는 방향. 카메라가 낮게 내려다보므로, 그 방향이 땅 위 3~6 높이를 지나는 곳에 둠(먼 마을 위를 나는 새)
    const half=camera.fov*Math.PI/360, el=pitch+half*rnd(.45,.72);
    ray.set(hx/hl*Math.cos(el),Math.sin(el),hz/hl*Math.cos(el));
    const cy=camera.position.y, gy0=typeof hAt==="function"?hAt(camera.position.x+hx/hl*40,camera.position.z+hz/hl*40):0, fy=gy0+rnd(3,6);
    let d=(el<-.02&&cy>fy)?(cy-fy)/Math.sin(-el):rnd(40,60); d=Math.max(34,Math.min(80,d));
    const s=Math.random()<.5?1:-1, L=d*Math.tan(half)*camera.aspect*1.15;
    f.pos.copy(camera.position).addScaledVector(ray,d);                                  // 화면 가운데를 지날 곳(그곳 땅보다 3 위)
    const gy=typeof hAt==="function"?hAt(f.pos.x,f.pos.z):0; if(f.pos.y<gy+3) f.pos.y=gy+3;
    f.pos.addScaledVector(rt,-s*L);
    const sp=rnd(3.6,5.2); f.vel.copy(rt).multiplyScalar(s*sp).addScaledVector(fw.set(hx/hl,0,hz/hl),rnd(-.8,.8));
    f.life=2*L/sp+2; f.on=true; f.sc=rnd(1.05,1.3); f.sway=rnd(0,6.3); }
  function place(f,t,vis){
    const hl=Math.hypot(f.vel.x,f.vel.z)||1, hx=f.vel.x/hl, hz=f.vel.z/hl, yaw=Math.atan2(hx,hz);
    for(let j=0;j<f.n;j++){ const r=Math.ceil(j/2), sd=j%2?1:-1;
      const bob=Math.sin(t*1.3+j*1.7+f.sway)*.22;
      dm.position.set(f.pos.x-hx*r*1.9+(-hz)*sd*r*1.8+Math.sin(t*.7+j)*.25, f.pos.y+bob-r*.15, f.pos.z-hz*r*1.9+hx*sd*r*1.8+Math.cos(t*.6+j)*.25);
      dm.rotation.set(0,yaw,Math.sin(t*.9+j)*.12); dm.scale.setScalar(vis?f.sc*(1-r*.03):0); dm.updateMatrix(); mesh.setMatrixAt(f.i0+j,dm.matrix); } }
  function tick(dt,realmIdx,center,hidden){
    uT.value+=dt; const W=typeof WEATHER!=="undefined"?WEATHER.type:"";
    const bad=W==="rain"||W==="storm"||W==="blizzard";
    const want=(hidden||bad||realmIdx<0)?0:Math.max(0,((DAY.d==null?1:DAY.d)-.35)/.65)*.78;
    uA.value+=(want-uA.value)*Math.min(1,dt*.6);
    // 하늘 색에 맞춰 살짝(노을 땐 따뜻한 갈색, 한낮엔 남보라 그림자)
    const dd=DAY.d==null?1:DAY.d; uC.value.setRGB(.13+.08*(1-dd),.11+.02*(1-dd),.19-.06*(1-dd));
    let any=false;
    for(const f of F){
      if(!f.on){ f.wait-=dt; if(f.wait<=0&&want>.2) spawn(f); else { place(f,uT.value,false); continue; } }
      f.life-=dt; f.pos.addScaledVector(f.vel,dt); f.pos.y+=Math.sin(uT.value*.4+f.sway)*dt*.4;
      if(f.life<=0||f.pos.distanceTo(camera.position)>140){ f.on=false; f.wait=rnd(10,22); place(f,uT.value,false); continue; }
      place(f,uT.value,true); any=true; }
    mesh.instanceMatrix.needsUpdate=true; mesh.visible=any&&uA.value>.02; }
  const o=ATMO.tick; ATMO.tick=function(dt,realmIdx,center,hidden){ const r=o.apply(this,arguments); try{ tick(dt,realmIdx,center,hidden); }catch(e){} return r; };
  return {tick,mesh,F,spawn:()=>F.forEach(spawn)};
})();
</script>
