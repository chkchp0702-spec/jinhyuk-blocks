<script>
/* ================= 비 오는 날 땅에 빗방울 물결 (v117) =================
   비·폭풍·황금비가 오면 내 주변 땅(반지름 약 12m)에 빗방울이 떨어진 자리마다
   작은 물방울이 톡 튀고 동그란 물결이 두 겹으로 퍼졌다 사라짐. 폭풍은 더 많이·빠르게, 황금비는 금빛 물결.
   비가 그치면 서서히 줄어듦. 미궁·집 안·수도 가운데(맑음)에선 없음.
   그리기: 인스턴스 1묶음(높음 64개 / 그 밖 44개 / 절약 28개) → 그리기 호출 +1, PointLight 없음. 모습만. */
const RIPPLE=(()=>{ const N=HIGH()&&!ECO()?64:ECO()?28:44;
  const geo=new THREE.InstancedBufferGeometry(); const base=new THREE.PlaneGeometry(1,1); base.rotateX(-Math.PI/2);
  geo.index=base.index; geo.attributes.position=base.attributes.position; geo.attributes.uv=base.attributes.uv;
  const aOff=new Float32Array(N*3), aAge=new Float32Array(N), aSz=new Float32Array(N);
  geo.setAttribute("aOff",new THREE.InstancedBufferAttribute(aOff,3)); geo.setAttribute("aAge",new THREE.InstancedBufferAttribute(aAge,1)); geo.setAttribute("aSz",new THREE.InstancedBufferAttribute(aSz,1));
  geo.instanceCount=N;
  const mat=new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(.85,.92,1)},amt:{value:0},dark:{value:0}},transparent:true,depthWrite:false,
    vertexShader:"attribute vec3 aOff; attribute float aAge; attribute float aSz; varying vec2 vU; varying float vA; void main(){ vU=uv*2.-1.; vA=aAge; vec3 p=position*aSz+aOff; gl_Position=projectionMatrix*viewMatrix*vec4(p,1.); }",
    fragmentShader:"uniform vec3 col; uniform float amt; uniform float dark; varying vec2 vU; varying float vA; void main(){ if(vA<0.||vA>1.) discard; float r=length(vU); if(r>1.) discard;"+
      " float R1=.15+vA*.85, R2=max(0.,vA-.28)*1.1;"+   // 바깥 물결·안쪽 두 번째 물결
      " float w=.1+.05*vA;"+
      " float g1=1.-smoothstep(0.,w,abs(r-R1)); float g2=(1.-smoothstep(0.,w*.8,abs(r-R2)))*step(.01,R2)*.6;"+
      " float hi=(1.-smoothstep(0.,w*.6,abs(r-(R1-w*.9))))*.9;"+   // 물결 안쪽 반짝 줄(밝은 땅에서도 보이게 바깥은 진하게)
      " float drop=(1.-smoothstep(0.,.18,r))*(1.-smoothstep(0.,.18,vA))*1.2;"+     // 떨어진 순간 하얀 점
      " float fade=(1.-vA)*(1.-vA);"+
      " float a=(g1+g2+hi*.8)*fade+drop; a*=amt;"+
      " vec3 c=mix(col*.42,vec3(1.),clamp(drop*.8+hi*fade,0.,1.));"+
      " gl_FragColor=vec4(c,clamp(a,0.,1.)); }"});
  const mesh=new THREE.Mesh(geo,mat); mesh.frustumCulled=false; mesh.userData.noOutline=true; mesh.userData.noLod=true; mesh.renderOrder=2; mesh.visible=false; scene.add(mesh);
  const life=new Float32Array(N), age=new Float32Array(N).fill(2); let amt=0;
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on)||(typeof xzOn==="function"&&xzOn()); }
  function respawn(i,storm){ const a=Math.random()*6.283, d=Math.sqrt(Math.random())*11+1.2; const x=P.x+Math.cos(a)*d, z=P.z+Math.sin(a)*d;
    aOff[i*3]=x; aOff[i*3+1]=hAt(x,z)+.09; aOff[i*3+2]=z; aSz[i]=(storm?1.7:1.4)+Math.random()*1.0; life[i]=(storm?.45:.65)+Math.random()*.35; age[i]=0; }
  function tick(dt){ if(typeof P==="undefined") return; const w=WEATHER.type; const wet=(w==="rain"||w==="storm"||w==="gold")&&!indoor();
    amt+=((wet?1:0)-amt)*Math.min(1,dt*(wet?.8:1.5)); if(amt<.02){ if(mesh.visible){ mesh.visible=false; } return; }
    mesh.visible=true; const storm=w==="storm"; const gold=w==="gold";
    mat.uniforms.amt.value=amt; mat.uniforms.col.value.setRGB(gold?1:.62,gold?.78:.74,gold?.3:.9);
    const act=Math.round(N*(storm?1:w==="rain"?.8:.6)*amt);
    for(let i=0;i<N;i++){ if(age[i]>=1){ // 쉬다가 비 양만큼 다시 떨어짐
        if(i<act&&wet&&Math.random()<dt*6) respawn(i,storm); else { aAge[i]=-1; continue; } }
      age[i]+=dt/life[i]; aAge[i]=Math.min(1.01,age[i]); }
    geo.attributes.aOff.needsUpdate=true; geo.attributes.aAge.needsUpdate=true; geo.attributes.aSz.needsUpdate=true; }
  XTICK.push(tick);
  return {mesh,get amt(){ return amt; }};
})();
</script>
