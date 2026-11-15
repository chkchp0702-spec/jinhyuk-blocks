<script>
/* ================= 바람 줄무늬 (v134) =================
   활강할 때·높은 데서 빠르게 떨어질 때·바람 기둥에 붕 솟을 때, 내 몸 둘레로 가는 바람 줄이 쓱쓱 스쳐 지나감(스피드 라인).
   날아가는 방향 반대로 흘러서 빠르게 나는 느낌. 빠를수록 줄이 길고 진함, 땅에 닿으면 스르르 사라짐.
   모습만 — 움직임·규칙 그대로. 얇은 사각형 묶음 1개(그리기 1번, 최대 28줄 · 절약 모드 16줄), PointLight 없음. */
const SPDL=(()=>{ const N=28; let mesh=null,pos,al,L=[],lv=0,prev=null,vel=new THREE.Vector3(),D=new THREE.Vector3(0,-1,0);
  const A=new THREE.Vector3(),B=new THREE.Vector3(),U=new THREE.Vector3(),V=new THREE.Vector3(),S=new THREE.Vector3(),C=new THREE.Vector3(),T=new THREE.Vector3();
  function init(){ const g=new THREE.BufferGeometry(); pos=new Float32Array(N*4*3); al=new Float32Array(N*4); const uv=new Float32Array(N*4*2), idx=[];
    for(let i=0;i<N;i++){ const b=i*4; uv.set([0,0,0,1,1,0,1,1],b*2); idx.push(b,b+1,b+2,b+1,b+3,b+2); L.push(newLine({})); }
    g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("a",new THREE.BufferAttribute(al,1)); g.setAttribute("uv",new THREE.BufferAttribute(uv,2)); g.setIndex(idx);
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
      vertexShader:"attribute float a; varying float vA; varying vec2 vU; void main(){ vA=a; vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader:"varying float vA; varying vec2 vU; void main(){ float x=vU.x; float tail=smoothstep(0.,.75,x)*smoothstep(1.,.85,x); float w=1.-abs(vU.y*2.-1.); float a=vA*tail*smoothstep(0.,.6,w); if(a<.01) discard; vec3 c=mix(vec3(.30,.42,.62),vec3(1.),smoothstep(.45,.85,w)); gl_FragColor=vec4(c,a); }"});
    mesh=new THREE.Mesh(g,m); mesh.frustumCulled=false; mesh.renderOrder=7; mesh.userData.noOutline=true; mesh.userData.noLod=true; }
  function newLine(l){ l.a=Math.random()*6.283; l.r=1.3+Math.random()*1.9; l.h=(Math.random()-.5)*2.4; l.s=Math.random(); l.sp=.9+Math.random()*.8; l.len=.7+Math.random()*.6; l.w=.06+Math.random()*.06; return l; }
  function tick(dt){ if(typeof player==="undefined"||!player||!started||dt<=0) return; const p=player.position;
    if(!prev) prev=p.clone(); vel.copy(p).sub(prev).divideScalar(dt); prev.copy(p); let sp=vel.length(); if(sp>70){ sp=0; vel.set(0,0,0); }
    const air=P.y>.9&&!P.dead; const gl=(typeof GL!=="undefined"&&GL.on);
    let want=0; if(air&&(gl||Math.abs(P.vy)>8)) want=Math.min(1,Math.max(0,(sp-6)/10)+(gl?.6:0));
    lv+=(want-lv)*Math.min(1,dt*(want>lv?6:3.5)); if(lv<.02&&want===0){ if(mesh) mesh.visible=false; return; }
    if(!mesh) init(); if(mesh.parent!==scene) scene.add(mesh); mesh.visible=true;
    if(sp>1) D.lerp(T.copy(vel).divideScalar(sp),Math.min(1,dt*8)).normalize();
    // D 에 수직인 두 축
    U.set(0,1,0); if(Math.abs(D.y)>.9) U.set(1,0,0); U.crossVectors(D,U).normalize(); V.crossVectors(D,U).normalize();
    const n=ECO()?16:N, flow=Math.max(8,sp)*.09, len=.9+Math.min(2.6,sp*.11), cam=camera.position;
    for(let i=0;i<N;i++){ const l=L[i], b=i*4; if(i>=n){ al[b]=al[b+1]=al[b+2]=al[b+3]=0; continue; }
      l.s+=dt*flow*l.sp; if(l.s>1) newLine(l), l.s=0;
      const along=(.5-l.s)*7; // 앞에서 생겨 뒤로 흘러감
      C.copy(p); C.y+=1.2; C.addScaledVector(U,Math.cos(l.a)*l.r).addScaledVector(V,Math.sin(l.a)*l.r).addScaledVector(D,along+l.h);
      A.copy(C); B.copy(C).addScaledVector(D,-len*l.len); // A=앞(진함) B=꼬리
      T.copy(A).sub(cam); S.crossVectors(D,T).normalize().multiplyScalar(l.w);
      pos[b*3]=B.x-S.x; pos[b*3+1]=B.y-S.y; pos[b*3+2]=B.z-S.z; pos[b*3+3]=B.x+S.x; pos[b*3+4]=B.y+S.y; pos[b*3+5]=B.z+S.z;
      pos[b*3+6]=A.x-S.x; pos[b*3+7]=A.y-S.y; pos[b*3+8]=A.z-S.z; pos[b*3+9]=A.x+S.x; pos[b*3+10]=A.y+S.y; pos[b*3+11]=A.z+S.z;
      const f=Math.sin(Math.min(1,l.s)*Math.PI)*lv*.9; al[b]=al[b+1]=al[b+2]=al[b+3]=f; }
    const g=mesh.geometry; g.attributes.position.needsUpdate=true; g.attributes.a.needsUpdate=true; }
  XTICK.push(tick);
  return {tick,get lv(){return lv;}};
})();
</script>
