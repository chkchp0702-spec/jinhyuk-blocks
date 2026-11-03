<script>
/* ================= 세계별 하늘 분위기 =================
   에덴: 하늘에서 내려오는 황금 빛줄기 · 아스가르드: 밤하늘 오로라(낮에도 희미하게)
   인도: 빙글빙글 떨어지는 꽃잎 · 올림푸스: 먹구름 왕관 + 멀리 치는 제우스 번개
   보이는 세계 하나만 켜짐. 그리기 호출: 세계당 1~3개. PointLight 없음. */
const ATMO=(function(){
  const root=new THREE.Group(); root.userData.noOutline=true; scene.add(root);
  const add=(o)=>{ o.frustumCulled=false; o.renderOrder=2; root.add(o); return o; };
  const uT={value:0}, uA={value:0}, uR={value:0}, uO={value:0};

  /* ---- 아스가르드 오로라: 휘어진 커튼 3장, 셰이더로 일렁임 ---- */
  const aur=new THREE.Group(); root.add(aur);
  const aurMat=new THREE.ShaderMaterial({uniforms:{t:uT,a:uA},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,toneMapped:false,
    vertexShader:`uniform float t; attribute float seed; varying vec2 vUv; varying float vS; void main(){ vUv=uv; vS=seed; vec3 p=position; float w=sin(uv.x*7.+t*.25+seed*3.)*6.+sin(uv.x*17.-t*.4+seed)*2.;
      p.x+=w*cos(seed); p.z+=w*sin(seed); p.y+=sin(uv.x*5.+t*.3+seed)*3.; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
    fragmentShader:`uniform float t,a; varying vec2 vUv; varying float vS; void main(){
      float s=.45+.55*sin(vUv.x*70.+t*.9+sin(vUv.x*11.+t*.35+vS)*4.); s=s*s;
      float f=smoothstep(0.,.07,vUv.y)*pow(1.-vUv.y,1.4); float e=sin(vUv.x*3.14159);
      vec3 g=vec3(.15,1.,.55), c=vec3(.2,.75,1.), p=vec3(.75,.3,1.);
      vec3 col=mix(g,c,smoothstep(.15,.5,vUv.y)); col=mix(col,p,smoothstep(.5,.95,vUv.y)+.25*sin(vS*5.));
      float k=(s*.75+.25)*f*e*a*(.75+.25*sin(t*.6+vS*2.)); gl_FragColor=vec4(col*k,k); }`});
  [[0,-1.57,1.7,40,4,24],[1,-1.1,1.1,50,7,24],[2,-2.05,1.1,46,6,20]].forEach(([i,a0,span,R,y0,h])=>{
    const geo=new THREE.PlaneGeometry(1,1,90,1); const pa=geo.attributes.position, uv=geo.attributes.uv; const sd=new Float32Array(pa.count);
    for(let k=0;k<pa.count;k++){ const u=uv.getX(k), v=uv.getY(k); const an=a0+(u-.5)*span; pa.setXYZ(k,Math.cos(an)*R,y0+v*h,Math.sin(an)*R); sd[k]=i*1.7+.4; }
    geo.setAttribute("seed",new THREE.BufferAttribute(sd,1)); aur.add(add(new THREE.Mesh(geo,aurMat))); });

  /* ---- 에덴 빛줄기: 사각형 8개를 한 덩어리로, 셰이더에서 카메라 쪽으로 돌려 세움 ---- */
  const RAYN=8; const rg=new THREE.BufferGeometry(); const rp=new Float32Array(RAYN*4*3), rc=new Float32Array(RAYN*4*3), ro=new Float32Array(RAYN*4*3); const ri=[];
  for(let r=0;r<RAYN;r++){ const an=-2.7+r/RAYN*2.4+rnd(-.12,.12), d=rnd(16,38); const cx=Math.cos(an)*d, cz=Math.sin(an)*d; const w=rnd(3,7.5), ph=rnd(0,6.28);
    [[-1,0],[1,0],[-1,1],[1,1]].forEach(([sx,sy],q)=>{ const j=(r*4+q)*3; rc[j]=cx; rc[j+1]=0; rc[j+2]=cz; ro[j]=sx*w; ro[j+1]=sy; ro[j+2]=ph; });
    const b=r*4; ri.push(b,b+1,b+2,b+1,b+3,b+2); }
  rg.setAttribute("position",new THREE.BufferAttribute(rp,3)); rg.setAttribute("ctr",new THREE.BufferAttribute(rc,3)); rg.setAttribute("off",new THREE.BufferAttribute(ro,3)); rg.setIndex(ri);
  const rayMat=new THREE.ShaderMaterial({uniforms:{t:uT,a:uR},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,toneMapped:false,
    vertexShader:`uniform float t; attribute vec3 ctr; attribute vec3 off; varying vec2 vUv; varying float vPh; void main(){ vec4 wc=modelMatrix*vec4(ctr,1.); float y=off.y; vPh=off.z;
      vec3 lean=vec3(.42,0.,.18); vec3 base=wc.xyz+vec3(sin(t*.07+off.z)*6.,-2.,cos(t*.05+off.z)*6.); vec3 p=base+vec3(0.,y*48.,0.)+lean*y*48.;
      vec3 toC=cameraPosition-p; toC.y=0.; vec3 rgt=normalize(cross(vec3(0.,1.,0.),toC+vec3(.0001)));
      p+=rgt*off.x*(.45+y*.8); vUv=vec2(off.x>0.?1.:0.,y); gl_Position=projectionMatrix*viewMatrix*vec4(p,1.); }`,
    fragmentShader:`uniform float t,a; varying vec2 vUv; varying float vPh; void main(){ float x=1.-abs(vUv.x-.5)*2.; x=x*x*(3.-2.*x);
      float v=smoothstep(.02,.1,vUv.y)*smoothstep(1.,.35,vUv.y); float fl=.55+.45*sin(t*.5+vPh*3.);
      float k=x*v*fl*a*.5; gl_FragColor=vec4(vec3(1.,.8,.4)*k,k); }`});
  const rays=add(new THREE.Mesh(rg,rayMat));

  /* ---- 인도 꽃잎: 인스턴스 한 번에, 빙글빙글 ---- */
  const PN=HIGH()?110:50; const pg=new THREE.CircleGeometry(.2,7); pg.scale(1.35,.72,1); pg.translate(.1,0,0);
  const petMat=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide,emissive:0x802040,transparent:true,opacity:0});
  const pet=add(new THREE.InstancedMesh(pg,petMat,PN)); pet.renderOrder=0; const PCOL=[0xff6fa0,0xff8cc0,0xffb0d0,0xff5070,0xffd0e4]; const PD=[]; const _c=new THREE.Color();
  for(let i=0;i<PN;i++){ PD.push({x:rnd(-20,20),y:rnd(0,11),z:rnd(-24,16),a:rnd(0,6.3),b:rnd(0,6.3),s:rnd(.8,1.5),v:rnd(.7,1.4)}); pet.setColorAt(i,_c.set(PCOL[i%PCOL.length])); }
  const dm=new THREE.Object3D();

  /* ---- 올림푸스: 먹구름 왕관 + 번개 ---- */
  const CN=16; const cloudMat=new THREE.MeshStandardMaterial({color:0x6a7088,roughness:1,emissive:0x9fc0ff,emissiveIntensity:0,transparent:true,opacity:0,depthWrite:false});
  const cl=add(new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),cloudMat,CN)); cl.renderOrder=1;
  for(let i=0;i<CN;i++){ const an=-3.14+i/CN*3.14+rnd(-.1,.1), d=rnd(34,50); dm.position.set(Math.cos(an)*d,rnd(12,17),Math.sin(an)*d); dm.scale.set(rnd(8,13),rnd(2.6,4),rnd(6,9)); dm.rotation.set(0,rnd(0,6.3),0); dm.updateMatrix(); cl.setMatrixAt(i,dm.matrix); }
  const boltMat=new THREE.MeshBasicMaterial({color:0xdcecff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false,side:THREE.DoubleSide});
  const bolt=add(new THREE.Mesh(new THREE.BufferGeometry(),boltMat)); bolt.visible=false;
  const O={next:3,fl:0};
  function makeBolt(){ const x0=P.x+rnd(-15,15), z0=P.z-rnd(9,26); const top=16, bot=(typeof hAt==="function"?hAt(x0,z0):0);
    const pts=[]; const N=15; let x=x0,z=z0; for(let i=0;i<=N;i++){ const y=top+(bot-top)*i/N; pts.push(new THREE.Vector3(x,y,z)); x+=rnd(-2.2,2.2); z+=rnd(-1.5,1.5); }
    const br=[]; const s=rint(4,8); let bx=pts[s].x,bz=pts[s].z; br.push(pts[s].clone()); for(let i=1;i<=4;i++){ bx+=rnd(.8,2.2)*(x0<P.x?-1:1); bz+=rnd(-1,1); br.push(new THREE.Vector3(bx,pts[s].y-i*2.2,bz)); }
    const P2=[], I2=[]; const cam=camera.position;
    function strip(L,w){ const b=P2.length/3; for(let i=0;i<L.length;i++){ const p=L[i]; const dx=cam.x-p.x, dz=cam.z-p.z, l=Math.hypot(dx,dz)||1; const rx=-dz/l*w, rz=dx/l*w; P2.push(p.x-rx,p.y,p.z-rz,p.x+rx,p.y,p.z+rz); if(i){ const k=b+(i-1)*2; I2.push(k,k+1,k+2,k+1,k+3,k+2); } } }
    strip(pts,.55); strip(br,.3); const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(P2,3)); g.setIndex(I2); bolt.geometry.dispose(); bolt.geometry=g; }

  function strike(){ O.next=rnd(3.5,8); makeBolt(); bolt.position.set(-root.position.x,0,-root.position.z); O.fl=1; }
  let cur=-1;
  function tick(dt,realmIdx,center,hidden){
    const on=hidden||center?-1:realmIdx; uT.value+=dt; const night=1-(DAY.d||1);
    root.position.set(camera.position.x,0,camera.position.z);
    const k=(want,u,sp)=>{ u.value+=(want-u.value)*Math.min(1,dt*(sp||.8)); return u.value; };
    // 아스가르드: 밤엔 진하게, 낮에도 아주 희미하게
    const aw=on===1?(.18+night*1.1)*(WEATHER.type==="blizzard"?.35:1):0; k(aw,uA); aur.visible=uA.value>.01;
    // 에덴: 낮·맑을수록 밝게
    const rw=on===0?(DAY.d*(WEATHER.type==="rain"?.3:1)*(WEATHER.type==="gold"?1.4:1)):0; k(rw,uR); rays.visible=uR.value>.01;
    // 인도 꽃잎
    const pw=on===2?(WEATHER.type==="rain"?.3:1):0; petMat.opacity+=(pw*.95-petMat.opacity)*Math.min(1,dt); pet.visible=petMat.opacity>.02;
    if(pet.visible){ const t=uT.value, cx=camera.position.x-root.position.x, wind=WEATHER.type==="wind"?3:1;
      for(let i=0;i<PN;i++){ const q=PD[i]; q.y-=dt*q.v*.9; q.x+=dt*(.8*wind+Math.sin(t*.9+i)*.6); q.z+=Math.cos(t*.7+i*1.3)*dt*.5; q.a+=dt*q.v*2.2; q.b+=dt*q.v*1.4;
        if(q.y<-.5){ q.y=rnd(8,12); q.x=rnd(-20,20); q.z=rnd(-24,16); } if(q.x>20) q.x-=40; if(q.x<-20) q.x+=40; if(q.z>16) q.z-=40; if(q.z<-24) q.z+=40;
        dm.position.set(P.x-root.position.x+q.x,(P.y||0)+q.y,P.z-root.position.z+q.z); dm.rotation.set(q.a,q.b,Math.sin(q.a)*.6); dm.scale.setScalar(q.s); dm.updateMatrix(); pet.setMatrixAt(i,dm.matrix); }
      pet.instanceMatrix.needsUpdate=true; }
    // 올림푸스 먹구름 + 번개
    const ow=on===3?1:0; k(ow,uO,.6); cloudMat.opacity=uO.value*.9; cl.visible=uO.value>.02;
    O.fl=Math.max(0,O.fl-dt*2.2); cloudMat.emissiveIntensity=O.fl*1.6+uO.value*.05; boltMat.opacity=Math.min(1,O.fl*1.6)*(.78+.22*Math.sin(O.fl*38))*uO.value; bolt.visible=boltMat.opacity>.02;
    if(on===3){ O.next-=dt*(WEATHER.type==="storm"?2.5:1); if(O.next<=0){ strike();
      if(typeof soundOn!=="undefined"&&soundOn&&typeof actx!=="undefined"&&actx){ try{ const t=actx.currentTime; const b=actx.createBuffer(1,actx.sampleRate*1.2|0,actx.sampleRate); const d=b.getChannelData(0); let lp=0; for(let i=0;i<d.length;i++){ lp+=((Math.random()*2-1)-lp)*.04; d[i]=lp*3*Math.pow(1-i/d.length,1.8); } const src=actx.createBufferSource(); src.buffer=b; const g=actx.createGain(); g.gain.value=.12; src.connect(g).connect(actx.destination); src.start(t+.5); }catch(e){} } } }
    else O.fl=0;
    if(on!==cur) cur=on; }
  return {tick,root,strike,u:{uA,uR,uO}};
})();
</script>
