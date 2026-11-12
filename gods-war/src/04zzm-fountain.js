<script>
/* ================= 수도 광장 분수에서 물이 뿜어져 나옴 (v119) =================
   분수 꼭대기에서 물줄기가 위로 솟았다가 사방으로 포물선을 그리며 떨어지고,
   물그릇에 닿는 자리에선 작은 물보라가 톡 튐. 물 색은 세계 색이 살짝 섞인 하늘빛.
   깃발 펄럭임은 03c-models.js flagWaveMat.
   그리기: 수도마다 Points 1개(내가 그 수도 85m 안일 때만 보임) → 보통 그리기 호출 +1, PointLight 없음. 모습만. */
const FOUNT=(()=>{ const list=[]; if(typeof REGIONS==="undefined") return {list};
  const N=HIGH()&&!ECO()?190:ECO()?90:140;
  REALMS.forEach((R,i)=>{ const cap=REGIONS[i*3]; if(!cap) return;
    const geo=new THREE.BufferGeometry(); const pos=new Float32Array(N*3), seed=new Float32Array(N*3);
    for(let k=0;k<N;k++){ seed[k*3]=Math.random(); seed[k*3+1]=Math.random(); seed[k*3+2]=k<N*.78?0:1; }   // 마지막 22%는 물보라
    geo.setAttribute("position",new THREE.BufferAttribute(pos,3)); geo.setAttribute("aSeed",new THREE.BufferAttribute(seed,3));
    geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,2,0),8);
    const tint=new THREE.Color(R.c1); const col=new THREE.Color(.72,.9,1).lerp(tint,.18);
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
      uniforms:{uTime:TIME,uCol:{value:col},uPx:{value:Math.min(2,window.devicePixelRatio||1)},uDark:{value:0}},
      vertexShader:"uniform float uTime; uniform float uPx; attribute vec3 aSeed; varying float vA; varying float vK;"+
        " void main(){ float s=aSeed.x, s2=aSeed.y; vK=aSeed.z; vec3 p;"+
        " if(vK<.5){ float t=fract(uTime*.55+s);"+                                   // 솟았다 떨어지는 물줄기(1.8초)
        "   float a=s*6.2831*13.+s2*.4; float r=.15+t*(2.3+s2*.9); p=vec3(cos(a)*r, 3.35+6.2*t-8.9*t*t, sin(a)*r);"+
        "   vA=smoothstep(0.,.06,t)*(1.-smoothstep(.9,1.,t)); gl_PointSize=uPx*(1.1+1.7*(1.-t))*70./max(1.,-(modelViewMatrix*vec4(p,1.)).z); }"+
        " else { float t=fract(uTime*1.4+s*7.);"+                                    // 물그릇 물보라
        "   float a=s*6.2831*17.; float r=2.3+s2*1.; float up=t*(1.-t)*1.6; p=vec3(cos(a)*(r+t*.35), .66+up, sin(a)*(r+t*.35));"+
        "   vA=(1.-t)*.8; gl_PointSize=uPx*(1.+1.2*t)*65./max(1.,-(modelViewMatrix*vec4(p,1.)).z); }"+
        " gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }",
      fragmentShader:"uniform vec3 uCol; uniform float uDark; varying float vA; varying float vK;"+
        " void main(){ vec2 c=gl_PointCoord*2.-1.; float r=dot(c,c); if(r>1.) discard;"+
        " float core=1.-smoothstep(0.,.35,r); vec3 col=mix(uCol*(.8-uDark*.3),vec3(1.),core*.7);"+  // 가운데 하얀 반짝, 가장자리 물빛(눈밭에서도 보이게)
        " gl_FragColor=vec4(col,vA*(1.-r)*(vK<.5?.95:.75)); }"});
    const pts=new THREE.Points(geo,mat); pts.position.set(cap.x,0,cap.z); pts.frustumCulled=true; pts.userData.noOutline=true; pts.userData.noLod=true; pts.renderOrder=3; pts.visible=false; scene.add(pts);
    list.push({pts,mat,x:cap.x,z:cap.z}); });
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on); }
  let t=0;
  XTICK.push(dt=>{ t-=dt; if(t>0||typeof P==="undefined") return; t=.25; const ind=indoor();
    const night=(typeof DN!=="undefined"&&DN.night)?1:0;
    for(const f of list){ const near=!ind&&Math.hypot(P.x-f.x,P.z-f.z)<85; f.pts.visible=near; if(near) f.mat.uniforms.uDark.value=night; } });
  return {list};
})();
</script>
