<script>
/* ================= v168 수도 광장 밤 불빛 웅덩이 (모습만 — PointLight 없이) =================
   해가 지면 수도 둘레 가로등 10개 발밑·시장 노점 3곳·가운데 분수 둘레 바닥에 따뜻한 빛 원이 은은히 켜지고
   (세계 색이 살짝 섞인 주황빛, 촛불처럼 살짝 일렁임), 가로등 머리엔 부드러운 빛무리가 번짐.
   그리기: 바닥 판 묶음 Mesh 1개 + 빛무리 Points 1개 — 밤이고 내가 수도 가까이(110m)일 때만 보임 → 그리기 +2. */
const LAMPGLOW=(()=>{ if(typeof REGIONS==="undefined"||typeof REALMS==="undefined") return {};
  const spots=[], halos=[];
  REALMS.forEach((R,i)=>{ const cap=REGIONS[i*3]; if(!cap) return; const col=new THREE.Color(1,.62,.28).lerp(new THREE.Color(R.c1),.3);
    for(let j=0;j<10;j++){ const a=j/10*6.283; const x=cap.x+Math.cos(a)*31, z=cap.z+Math.sin(a)*31; spots.push({x,z,r:6.2,c:col,k:1}); halos.push({x,y:4.3,z,c:col}); }
    const inward=Math.atan2(-cap.z,-cap.x);
    for(let k=0;k<3;k++){ const a=inward+Math.PI/2+(k-1)*.5; spots.push({x:cap.x+Math.cos(a)*25,z:cap.z+Math.sin(a)*25,r:4.2,c:new THREE.Color(1,.7,.35),k:.8}); }
    spots.push({x:cap.x,z:cap.z,r:10.5,c:new THREE.Color(.75,.85,1).lerp(new THREE.Color(R.c1),.35).lerp(new THREE.Color(1,.75,.4),.35),k:.85}); });
  // 바닥 빛 원 묶음
  const n=spots.length, pos=new Float32Array(n*4*3), uv=new Float32Array(n*4*2), cl=new Float32Array(n*4*4), idx=[];
  spots.forEach((s,i)=>{ const y=(typeof hAt==="function"?hAt(s.x,s.z):0)+.1; [[-1,-1],[1,-1],[1,1],[-1,1]].forEach((q,v)=>{ const o=i*4+v; pos.set([s.x+q[0]*s.r,y,s.z+q[1]*s.r],o*3); uv.set(q,o*2); cl.set([s.c.r*s.k,s.c.g*s.k,s.c.b*s.k,(i%7)/7],o*4); }); const b=i*4; idx.push(b,b+2,b+1,b,b+3,b+2); });
  const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(pos,3)); geo.setAttribute("aQ",new THREE.BufferAttribute(uv,2)); geo.setAttribute("aC",new THREE.BufferAttribute(cl,4)); geo.setIndex(idx);
  const U={uTime:TIME,uN:{value:0}};
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:U,
    vertexShader:"attribute vec2 aQ; attribute vec4 aC; varying vec2 vQ; varying vec4 vC; void main(){ vQ=aQ; vC=aC; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader:"uniform float uTime; uniform float uN; varying vec2 vQ; varying vec4 vC; void main(){ float r=length(vQ); if(r>1.) discard;"+
      " float sd=vC.a*40.; float fl=1.+sin(uTime*6.3+sd)*.06+sin(uTime*13.7+sd*2.)*.04;"+   // 촛불 일렁임
      " float g=pow(1.-r,1.8)*.85+(1.-smoothstep(0.,.55,r))*.25; float rim=(1.-smoothstep(0.,.07,abs(r-.82)))*.08;"+
      " float a=clamp((g+rim)*uN*fl,0.,1.); vec3 hot=vC.rgb*vec3(1.,.7,.45); gl_FragColor=vec4(hot*a*.9+vec3(1.,.85,.5)*a*a*.35, a*.78); }"});
  const pool=new THREE.Mesh(geo,mat); pool.frustumCulled=false; pool.renderOrder=2; pool.userData.noOutline=true; pool.userData.noLod=true; pool.visible=false; scene.add(pool);
  // 가로등 머리 빛무리
  const hp=new Float32Array(halos.length*3), hc=new Float32Array(halos.length*4);
  halos.forEach((h,i)=>{ hp.set([h.x,h.y+(typeof hAt==="function"?hAt(h.x,h.z):0),h.z],i*3); hc.set([h.c.r,h.c.g,h.c.b,Math.random()],i*4); });
  const hg=new THREE.BufferGeometry(); hg.setAttribute("position",new THREE.BufferAttribute(hp,3)); hg.setAttribute("aC",new THREE.BufferAttribute(hc,4));
  const hm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,uniforms:{uTime:TIME,uN:U.uN,uPx:{value:Math.min(2,window.devicePixelRatio||1)}},
    vertexShader:"uniform float uTime; uniform float uPx; attribute vec4 aC; varying vec4 vC; void main(){ vC=aC; vec4 mv=modelViewMatrix*vec4(position,1.); float dz=max(1.,-mv.z); gl_PointSize=min(uPx*70.,uPx*(1.+sin(uTime*5.+aC.a*30.)*.05)*240./dz); vC.a=smoothstep(4.,10.,dz); gl_Position=projectionMatrix*mv; }",
    fragmentShader:"uniform float uN; varying vec4 vC; void main(){ vec2 c=gl_PointCoord*2.-1.; float r=length(c); if(r>1.) discard;"+
      " float g=pow(1.-r,2.4)*.7+(1.-smoothstep(0.,.22,r))*.6; float st=max(0.,1.-abs(c.y)*9.)*max(0.,1.-abs(c.x))*.18;"+   // 둥근 빛무리 + 옆으로 살짝 빛줄
      " float a=clamp((g+st)*uN,0.,1.); a*=vC.a; gl_FragColor=vec4((vC.rgb*.8+vec3(.2))*a, a*.45); }"});
  const halo=new THREE.Points(hg,hm); halo.frustumCulled=false; halo.renderOrder=3; halo.userData.noOutline=true; halo.userData.noLod=true; halo.visible=false; scene.add(halo);
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on); }
  let chk=0, near=false, cur=0;
  XTICK.push(dt=>{ if(typeof P==="undefined") return; chk-=dt;
    if(chk<=0){ chk=.3; near=false; if(!indoor()) for(let i=0;i<REALMS.length;i++){ const c=REGIONS[i*3]; if(c&&Math.hypot(P.x-c.x,P.z-c.z)<110){ near=true; break; } } }
    const d=(typeof DAY!=="undefined"&&DAY.d!=null)?DAY.d:1; const tgt=near?Math.max(0,Math.min(1,(.74-d)/.3)):0;
    cur+=(tgt-cur)*Math.min(1,dt*1.5); U.uN.value=cur; const on=cur>.015; pool.visible=on; halo.visible=on; });
  return {pool,halo,U};
})();
</script>
