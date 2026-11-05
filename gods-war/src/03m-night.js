<script>
/* ================= v49 밤하늘 별똥별 · 반딧불 =================
   - 밤이 되면 내 둘레에 반딧불이 깜빡깜빡 떠다님(세계마다 색: 에덴 금빛, 아스가르드 얼음빛, 인도 분홍빛, 올림푸스 하늘빛).
     위치·흔들림은 전부 셰이더에서 계산 → 매 장 JS 일 없음, 그리기 호출 1개.
   - 맑은 밤하늘엔 가끔 별똥별이 꼬리를 끌며 스윽 지나감(+작은 "티링" 소리). 그리기 호출 1~2개.
   - 비·폭풍·눈보라 땐 안 보임. 미궁·집·사막 안에선 끔. PointLight 없음. 배터리 절약이면 반딧불 수 줄임. */
const NIGHTFX=(function(){
  const uT={value:0}, uA={value:0}, uC={value:new THREE.Vector3()}, uCol={value:new THREE.Color(0xd8ff70)}, uPx={value:1};
  /* ---- 반딧불 ---- */
  const FN=HIGH()?(ECO()?40:56):22; const fg=new THREE.BufferGeometry(); const fp=new Float32Array(FN*3), fs=new Float32Array(FN*4);
  for(let i=0;i<FN;i++){ fp[i*3]=rnd(-14,14); fp[i*3+1]=rnd(.5,3.2); fp[i*3+2]=rnd(-14,14); fs[i*4]=rnd(0,6.28); fs[i*4+1]=rnd(.6,1.6); fs[i*4+2]=rnd(0,6.28); fs[i*4+3]=rnd(.75,1.3); }
  fg.setAttribute("position",new THREE.BufferAttribute(fp,3)); fg.setAttribute("sd",new THREE.BufferAttribute(fs,4));
  const fm=new THREE.ShaderMaterial({uniforms:{t:uT,a:uA,c:uC,col:uCol,px:uPx},transparent:true,depthWrite:false,fog:false,
    vertexShader:`uniform float t,px; uniform vec3 c; attribute vec4 sd; varying float vB; void main(){
      vec2 l=mod(position.xz-c.xz+14.,28.)-14.; float sp=sd.y;
      vec3 p=vec3(c.x+l.x+sin(t*.5*sp+sd.x)*1.4+sin(t*1.3*sp+sd.z)*.4, c.y+position.y+sin(t*.8*sp+sd.z)*.55, c.z+l.y+cos(t*.45*sp+sd.x*1.3)*1.4);
      float bl=.5+.5*sin(t*(1.6+sd.y)+sd.x*3.); bl=smoothstep(.15,1.,bl); vB=bl*smoothstep(14.,9.,length(l));
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=(18.+12.*bl)*sd.w*px/max(1.,-mv.z)*15.; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`uniform float a; uniform vec3 col; varying float vB; void main(){ float d=length(gl_PointCoord-.5); float g=smoothstep(.5,0.,d); g*=g; float core=smoothstep(.12,0.,d);
      float k=(g*.8+core)*vB*a; if(k<.004) discard; gl_FragColor=vec4(mix(col*1.15,vec3(1.,1.,.9),core*.7),min(1.,k)); }`});
  const flies=new THREE.Points(fg,fm); flies.frustumCulled=false; flies.renderOrder=3; flies.userData.noOutline=true; flies.userData.cullR=-1; /* 먼 물체 숨기기(cullFar)에서 빼기 — 정점이 세계 좌표라서 */ flies.visible=false; scene.add(flies);
  /* ---- 별똥별 ---- */
  function starMesh(){ const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(12),3)); g.setAttribute("uv",new THREE.BufferAttribute(new Float32Array([0,0,0,1,1,0,1,1]),2)); g.setIndex([0,2,1,1,2,3]);
    const m=new THREE.ShaderMaterial({uniforms:{a:{value:0}},transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,fog:false,side:THREE.DoubleSide,
      vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader:`uniform float a; varying vec2 vUv; void main(){ float x=vUv.x; float y=1.-abs(vUv.y-.5)*2.; float tail=pow(x,2.4)*y*y;
        float head=smoothstep(.86,1.,x)*smoothstep(0.,.6,y); vec3 c=mix(vec3(1.,.72,.45),vec3(.85,.93,1.),x)+head*.8; float k=(tail*.9+head*.9)*a; gl_FragColor=vec4(c*k,k); }`});
    const s=new THREE.Mesh(g,m); s.frustumCulled=false; s.renderOrder=9; s.userData.noOutline=true; s.userData.cullR=-1; s.visible=false; scene.add(s); return {s,m,life:0,dur:1,H:new THREE.Vector3(),D:new THREE.Vector3(),len:0,w:1}; }
  const SS=[starMesh()]; if(HIGH()&&!ECO()) SS.push(starMesh());
  const N={next:rnd(2,5),on:0};
  const _f=new THREE.Vector3(), _r=new THREE.Vector3(), _up=new THREE.Vector3(0,1,0), _tl=new THREE.Vector3(), _n=new THREE.Vector3(), _v=new THREE.Vector3();
  const _p=new THREE.Vector3();
  /* 별똥별은 화면 위쪽 1/3 어딘가에서 시작 — 카메라가 내려다봐도 보이게 화면 기준으로 자리를 잡음 */
  function launch(){ const s=SS.find(q=>q.life<=0); if(!s) return; const cam=camera.position;
    _p.set(rnd(-.75,.75),rnd(.62,.92),.5).unproject(camera).sub(cam).normalize(); s.H.copy(cam).addScaledVector(_p,140);
    _r.set(1,0,0).applyQuaternion(camera.quaternion); _f.set(0,1,0).applyQuaternion(camera.quaternion); const sd=Math.random()<.5?-1:1;
    s.D.copy(_r).multiplyScalar(sd).addScaledVector(_f,-rnd(.3,.6)).normalize();
    s.dur=rnd(.7,1.15); s.life=s.dur; s.len=0; s.w=rnd(1.5,2.1); s.sp=rnd(70,95); s.s.visible=true;
    if(typeof soundOn!=="undefined"&&soundOn&&typeof tone==="function"){ tone(1568,.22,"sine",0,.025); tone(2349,.3,"sine",.09,.02); } }
  function drawStar(s,dt){ s.life-=dt; if(s.life<=0){ s.s.visible=false; return; } const k=1-s.life/s.dur;
    s.H.addScaledVector(s.D,s.sp*dt); s.len=Math.min(46,s.len+s.sp*dt*.9);
    _tl.copy(s.H).addScaledVector(s.D,-s.len); _v.subVectors(camera.position,s.H); _n.crossVectors(s.D,_v).normalize().multiplyScalar(s.w);
    const pa=s.s.geometry.attributes.position, tw=.15;
    pa.setXYZ(0,_tl.x-_n.x*tw,_tl.y-_n.y*tw,_tl.z-_n.z*tw); pa.setXYZ(1,_tl.x+_n.x*tw,_tl.y+_n.y*tw,_tl.z+_n.z*tw);
    pa.setXYZ(2,s.H.x-_n.x,s.H.y-_n.y,s.H.z-_n.z); pa.setXYZ(3,s.H.x+_n.x,s.H.y+_n.y,s.H.z+_n.z); pa.needsUpdate=true;
    s.m.uniforms.a.value=Math.min(1,k*6)*Math.min(1,s.life/s.dur*3)*N.on; }
  const COL=[0xffcf40,0x48e0a0,0xff6fb0,0x40c8ff]; /* 밝은 눈밭에서도 보이게 진한 색 */
  function tick(dt,realmIdx,center,hidden){ uT.value+=dt; const night=1-(DAY.d==null?1:DAY.d); const nf=clamp((night-.3)/.3,0,1);
    const w=WEATHER.type, bad=w==="rain"||w==="storm"||w==="blizzard";
    const want=hidden||bad?0:nf; uA.value+=(want-uA.value)*Math.min(1,dt*.8); N.on+=((hidden||bad||w==="snow"?0:nf)-N.on)*Math.min(1,dt);
    flies.visible=uA.value>.02; if(flies.visible){ uC.value.set(P.x,P.gy||0,P.z); uPx.value=renderer.getPixelRatio(); const ci=center?0:Math.max(0,realmIdx); uCol.value.lerp(_c3.setHex(COL[ci]||COL[0]),Math.min(1,dt*2)); }
    for(const s of SS) if(s.life>0) drawStar(s,dt);
    if(N.on>.5){ N.next-=dt; if(N.next<=0){ N.next=rnd(4,9)*(HIGH()?1:1.6); launch(); if(SS.length>1&&Math.random()<.18) setTimeout(launch,rnd(150,400)); } } }
  const _c3=new THREE.Color();
  return {tick,launch,flies,SS};
})();
</script>
