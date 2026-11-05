<script>
/* v58 무기 궤적(베기 초승달) + 장비 바꿀 때 몸에 감기는 빛 — 모습만(피해·사거리 그대로)
   SLASH.swing: 무기 등급 색 초승달이 휙 지나가며 머리 쪽은 하얗게, 꼬리는 스르륵 사라짐. 칠 때마다 왼→오/오→왼 번갈아.
     창은 앞으로 찌르는 좁고 긴 빛, 망치는 굵고 큰 빛. 공유 도형 1개 + 재질 4개 돌려씀(새 도형 안 만듦).
   SLASH.wrap: 장비를 끼면 등급 색 빛 띠 두 줄이 발밑에서 머리 위로 빙글빙글 감아 올라감(원기둥 1개). */
const SLASH=(function(){
  const V=`varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const F=`uniform vec3 col; uniform float prog,fade,dir,rIn,rOut,tMin,tMax,thick; varying vec3 vP;
   void main(){ float a=atan(vP.y,vP.x); float t=a/3.14159265; if(dir<0.0) t=1.0-t; t=(t-tMin)/(tMax-tMin); if(t<0.0||t>1.0) discard;
    float head=prog*1.3; float d=head-t; if(d<0.0) discard; float tail=1.0-smoothstep(0.0,0.9,d);
    float r=(length(vP.xy)-rIn)/(rOut-rIn); float w=pow(max(sin(t*3.14159),0.0),0.6)*thick; float band=1.0-smoothstep(w*0.55,w,abs(r-0.62));
    float core=(1.0-smoothstep(0.0,w*0.35,abs(r-0.62)))*(1.0-smoothstep(0.0,0.25,d));
    float al=band*tail*fade; if(al<0.01) discard; gl_FragColor=vec4(mix(col,vec3(1.0),core*0.8),min(1.0,al*1.1)); }`;
  const pool=[];
  function item(){ let it=pool.find(q=>!q.on); if(it) return it; if(pool.length>=4) return pool[0];
    const mat=new THREE.ShaderMaterial({vertexShader:V,fragmentShader:F,transparent:true,depthWrite:false,side:THREE.DoubleSide,
      uniforms:{col:{value:new THREE.Color()},prog:{value:0},fade:{value:1},dir:{value:1},rIn:{value:1},rOut:{value:3},tMin:{value:0},tMax:{value:1},thick:{value:.4}}});
    const g=new THREE.Group(); const m=new THREE.Mesh(new THREE.RingGeometry(1.2,3.2,40,1,0,Math.PI),mat); m.rotation.set(-Math.PI/2,0,Math.PI); m.userData.noOutline=true; m.renderOrder=6; m.frustumCulled=false; g.add(m); g.visible=false; scene.add(g);
    it={g,m,mat,on:false,t:0,d:.24}; pool.push(it); return it; }
  let flip=1;
  function swing(x,z,rot,color,kind){ const it=item(); const u=it.mat.uniforms; flip=-flip; const k=kind||"sword";
    const R=k==="spear"?[1.6,4.9]:k==="hammer"?[1.0,3.7]:[1.2,3.3];
    if(it.m.geometry.parameters.innerRadius!==R[0]||it.m.geometry.parameters.outerRadius!==R[1]){ it.m.geometry.dispose(); it.m.geometry=new THREE.RingGeometry(R[0],R[1],40,1,0,Math.PI); }
    u.rIn.value=R[0]; u.rOut.value=R[1]; u.col.value.set(color); u.dir.value=flip; u.prog.value=0; u.fade.value=1;
    if(k==="spear"){ u.tMin.value=.4; u.tMax.value=.6; u.thick.value=.5; } else if(k==="hammer"){ u.tMin.value=0; u.tMax.value=1; u.thick.value=.62; } else { u.tMin.value=0; u.tMax.value=1; u.thick.value=.5; }
    it.g.position.set(x,(P.gy||hAt(x,z))+1.5,z); it.g.rotation.set(0,rot,0); it.g.rotateZ(flip*(k==="hammer"?.35:.18)); it.g.rotateX(k==="hammer"?.25:-.08); it.d=k==="hammer"?.3:.24; it.t=0; it.on=true; it.g.visible=true; it.k=k; }
  /* 장비 빛 감기 */
  let wrapM=null, wrapT=-1, wrapD=1.1;
  function wrap(color){ if(!wrapM){ const g=new THREE.CylinderGeometry(1.25,1.05,3.4,28,1,true); g.translate(0,1.7,0);
      wrapM=new THREE.Mesh(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
        uniforms:{col:{value:new THREE.Color()},k:{value:0}},
        vertexShader:`varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader:`uniform vec3 col; uniform float k; varying vec2 vU; void main(){ float top=k*1.35; float y=vU.y; if(y>top) discard;
          float s=fract(vU.x*2.0+y*1.4-k*1.6); float band=1.0-smoothstep(0.06,0.16,abs(s-0.5)); float head=1.0-smoothstep(0.0,0.35,top-y);
          float al=band*(0.35+0.65*head)*smoothstep(0.0,0.08,y)*(1.0-smoothstep(0.75,1.0,k)); al+=head*0.18*(1.0-k); if(al<0.01) discard;
          gl_FragColor=vec4(mix(col,vec3(1.0),head*band*0.6),min(1.0,al)); }`}));
      wrapM.userData.noOutline=true; wrapM.renderOrder=6; wrapM.frustumCulled=false; scene.add(wrapM); }
    wrapM.material.uniforms.col.value.set(color); wrapT=0; wrapM.visible=true; }
  function tick(dt){ for(const it of pool){ if(!it.on) continue; it.t+=dt; const k=it.t/it.d; if(k>=1){ it.on=false; it.g.visible=false; continue; } const u=it.mat.uniforms; u.prog.value=Math.min(1,k/.55); u.fade.value=k<.55?1:1-(k-.55)/.45;
      if(it.k==="spear"){ const s=.85+.3*Math.min(1,k/.4); it.m.scale.set(1,s,1); } }
    if(wrapM&&wrapT>=0){ wrapT+=dt; const k=wrapT/wrapD; if(k>=1||!player){ wrapT=-1; wrapM.visible=false; } else { wrapM.position.set(P.x,(P.gy||hAt(P.x,P.z))+(P.y||0),P.z); wrapM.rotation.y+=dt*3; wrapM.material.uniforms.k.value=k; const s=1-.25*k; wrapM.scale.set(s,1,s); } } }
  return {swing,wrap,tick,pool}; })();
</script>
