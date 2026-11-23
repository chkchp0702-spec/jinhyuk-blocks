<script>
/* ================= v170 아스가르드 밤 오로라 빛이 눈밭에 은은히 비침 =================
   - 아스가르드 밤하늘 오로라(03e-atmo.js)가 진할수록 내 둘레 땅에 초록·청록·보라 빛 띠가 천천히 흘러가며 물듦(커튼이 일렁이듯).
   - 하얀 눈밭에서도 보이게 더하기 대신 '미리 곱한 반투명' 섞기(v168 방식). 가장자리는 스르르 흐려짐.
   - 그래픽 「높음」에서만, 절약 모드는 격자 거칠게. 판 1장(그리기 +1) — 땅 높이는 내가 4m 넘게 움직일 때만 다시 맞춤. PointLight 없음. 보기만. */
const AURG=(function(){
  if(typeof ATMO==="undefined"||!ATMO.u||typeof THREE==="undefined") return {};
  const R=34, SEG=26, uT={value:0}, uS={value:0}, uC={value:new THREE.Vector2()};
  const g=new THREE.PlaneGeometry(R*2,R*2,SEG,SEG); g.rotateX(-Math.PI/2);
  const pos=g.attributes.position, base=Float32Array.from(pos.array);
  const m=new THREE.ShaderMaterial({uniforms:{t:uT,s:uS,c:uC},transparent:true,depthWrite:false,fog:false,toneMapped:false,
    blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,
    vertexShader:"varying vec2 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xz; gl_Position=projectionMatrix*viewMatrix*w; }",
    fragmentShader:"uniform float t,s; uniform vec2 c; varying vec2 vW; void main(){ vec2 d=vW-c; float r=length(d)/"+R+".; if(r>1.) discard;"+
      " float edge=1.-smoothstep(.55,1.,r);"+
      " float w1=sin(vW.x*.085+sin(vW.y*.05+t*.23)*2.2+t*.17);"+          // 큰 커튼 띠
      " float w2=sin(vW.x*.04-vW.y*.07+sin(vW.x*.03-t*.12)*1.6-t*.11);"+    // 비스듬한 둘째 띠
      " float band=pow(max(0.,w1*.5+.5),3.)*.85+pow(max(0.,w2*.5+.5),4.)*.6;"+
      " float fl=.8+.2*sin(t*1.3+vW.x*.2+vW.y*.13);"+                        // 잔잔한 일렁임
      " float mx=.5+.5*sin(vW.y*.06+t*.09+w2);"+
      " vec3 col=mix(vec3(.15,1.,.55),vec3(.2,.85,1.),.5+.5*w1); col=mix(col,vec3(.72,.35,1.),smoothstep(.55,.95,mx));"+
      " float a=clamp(band*fl*edge*s,0.,.42); gl_FragColor=vec4(col*a*1.15,a*.62); }"});
  const mesh=new THREE.Mesh(g,m); mesh.frustumCulled=false; mesh.renderOrder=1; mesh.visible=false; mesh.userData.noOutline=true; mesh.userData.noLod=true; scene.add(mesh);
  let cx=1e9, cz=1e9;
  function fit(x,z){ cx=Math.round(x/4)*4; cz=Math.round(z/4)*4; mesh.position.set(cx,0,cz);
    for(let i=0;i<pos.count;i++){ const px=base[i*3]+cx, pz=base[i*3+2]+cz; pos.array[i*3+1]=(typeof hAt==="function"?hAt(px,pz):0)+.14; }
    pos.needsUpdate=true; }
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on); }
  function tick(dt,realmIdx,center,hidden){ uT.value+=dt;
    const night=Math.max(0,Math.min(1,(.78-(DAY.d==null?1:DAY.d))/.4));
    const want=(realmIdx===1&&!center&&!hidden&&HIGH()&&!indoor())?Math.min(1.2,ATMO.u.uA.value)*night:0;
    uS.value+=(want-uS.value)*Math.min(1,dt*.9); mesh.visible=uS.value>.02; if(!mesh.visible) return;
    if(Math.abs(P.x-cx)>4||Math.abs(P.z-cz)>4) fit(P.x,P.z); uC.value.set(P.x,P.z); }
  const _o=ATMO.tick; ATMO.tick=function(dt,realmIdx,center,hidden){ const r=_o.apply(this,arguments); try{ tick(dt,realmIdx,center,hidden); }catch(e){} return r; };
  return {mesh,uS};
})();
</script>
