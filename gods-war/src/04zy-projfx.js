<script>
/* ================= v104: 던진 무기 회전 잔상 · 꽂힐 때 흙 튐 =================
   - 던지기(창·손도끼·망치·단검·돌·큰 불덩이·화살비)가 날아갈 때 뒤로 빛 꼬리, 빙글 도는 무기는 날 끝이 그리는 둥근 잔상
   - 땅에 떨어지거나 꽂히면 땅 색(풀=흙, 눈=눈덩이+회색, 모래, 돌) 조각이 튀어 오르고 바닥에 옅은 자국이 남았다 사라짐
   - 점(Points) 두 묶음 + 자국 판 몇 장을 돌려 씀 → 그리기 호출 +2~3, PointLight 없음. 절약 모드는 알갱이 수 절반.
   - 데미지·사거리·쿨타임 그대로(겉모습만 덧붙임). */
const PROJFX=(()=>{ let glow=null, dirt=null, marks=null, mi=0, on=false; const V=new THREE.Vector3();
  const TRAIL={axe:1,hammer:1,javelin:1,dagger:1,rock:1};
  function makePts(N,additive){ const pos=new Float32Array(N*3), col=new Float32Array(N*3), sz=new Float32Array(N), al=new Float32Array(N);
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(pos,3)); geo.setAttribute("color",new THREE.BufferAttribute(col,3)); geo.setAttribute("size",new THREE.BufferAttribute(sz,1)); geo.setAttribute("alpha",new THREE.BufferAttribute(al,1));
    const m=new THREE.ShaderMaterial({uniforms:{sc:{value:300}},transparent:true,depthWrite:false,blending:THREE.NormalBlending,
      vertexShader:"attribute float size; attribute float alpha; attribute vec3 color; varying vec3 vC; varying float vA; uniform float sc; void main(){ vC=color; vA=alpha; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=alpha>0.001?size*sc/max(.5,-mv.z):0.; gl_Position=projectionMatrix*mv; }",
      fragmentShader:additive?"varying vec3 vC; varying float vA; void main(){ vec2 d=gl_PointCoord-.5; float r=length(d)*2.; if(r>1.) discard; float f=smoothstep(1.,.15,r); vec3 c=mix(vC,vec3(1.),pow(max(0.,1.-r*1.6),2.)*.75); gl_FragColor=vec4(c,f*vA); }"
                             :"varying vec3 vC; varying float vA; void main(){ vec2 d=gl_PointCoord-.5; float r=length(d)*2.; if(r>1.) discard; float f=smoothstep(1.,.55,r); vec3 c=vC*(1.08-.35*length(d+vec2(.18,.18))); gl_FragColor=vec4(c,f*vA); }"});
    const pts=new THREE.Points(geo,m); pts.frustumCulled=false; pts.renderOrder=5; pts.userData.noOutline=true; scene.add(pts);
    const P=[]; for(let i=0;i<N;i++) P.push({t:1,d:1,x:0,y:-999,z:0,vx:0,vy:0,vz:0,s:.3,s1:0,g:0,c:new THREE.Color()}); return {pts,geo,pos,col,sz,al,P,i:0,N}; }
  function init(){ if(on) return; on=true; const k=ECO()?.5:1; glow=makePts(Math.round(220*k),true); dirt=makePts(Math.round(120*k),false);
    const c=document.createElement("canvas"); c.width=c.height=64; const g=c.getContext("2d"); const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,"rgba(255,255,255,.85)"); r.addColorStop(.5,"rgba(255,255,255,.45)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,64,64);
    const tx=new THREE.CanvasTexture(c), PL=new THREE.PlaneGeometry(1,1); marks=[]; for(let i=0;i<(ECO()?3:6);i++){ const m=new THREE.Mesh(PL,new THREE.MeshBasicMaterial({map:tx,color:0x2a1c10,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-3})); m.rotation.x=-Math.PI/2; m.visible=false; m.renderOrder=2; m.userData.noOutline=true; scene.add(m); marks.push({m,t:1,d:1,op:0}); } }
  function emit(S,x,y,z,o){ const p=S.P[S.i]; S.i=(S.i+1)%S.N; p.x=x; p.y=y; p.z=z; p.vx=o.vx||0; p.vy=o.vy||0; p.vz=o.vz||0; p.t=0; p.d=o.d||.4; p.s=o.s||.4; p.s1=o.s1!=null?o.s1:0; p.g=o.g||0; p.c.set(o.c); p.a=o.a!=null?o.a:1; }
  function step(S,dt){ for(let i=0;i<S.N;i++){ const p=S.P[i]; if(p.t>=p.d){ S.al[i]=0; continue; } p.t+=dt; const k=Math.min(1,p.t/p.d);
      p.vy-=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; if(p.g>0){ const gy=hAt(p.x,p.z)+.05; if(p.y<gy){ p.y=gy; p.vy*=-.3; p.vx*=.5; p.vz*=.5; } } else { p.vx*=.94; p.vy*=.94; p.vz*=.94; }
      S.pos[i*3]=p.x; S.pos[i*3+1]=p.y; S.pos[i*3+2]=p.z; S.col[i*3]=p.c.r; S.col[i*3+1]=p.c.g; S.col[i*3+2]=p.c.b; S.sz[i]=p.s+(p.s1-p.s)*k; S.al[i]=p.a*(p.g>0?(k<.7?1:1-(k-.7)/.3):(1-k)); }
    S.geo.attributes.position.needsUpdate=true; S.geo.attributes.color.needsUpdate=true; S.geo.attributes.size.needsUpdate=true; S.geo.attributes.alpha.needsUpdate=true; S.pts.material.uniforms.sc.value=renderer.domElement.height*.5/Math.tan(camera.fov*Math.PI/360); }
  // 땅 종류: 0 풀 1 눈 2 모래 3 돌 (03l-step.js 와 같은 기준)
  function ground(x,z){ if(typeof DG!=="undefined"&&DG.on) return 3; if(typeof DS!=="undefined"&&DS.on) return 2; if(typeof HM!=="undefined"&&HM.on) return 3; const y=hAt(x,z); if(y>28) return 1; if(Math.hypot(x,z)<(REGIONS[12]?REGIONS[12].r:40)-4) return 3; return x>=0?(z<0?0:2):(z<0?1:0); }
  const DIRT=[[0x6b4a2a,0x8a6a3a,0x4e7a32],[0x6f7f96,0xdfe8f4,0x8e9db3],[0xd8b47a,0xb08850,0xe8cf98],[0x8a8478,0x5f5a52,0xb0aa9c]];
  function trailCol(p){ if(p.kind==="hammer") return 0x3f86ff; if(p.kind==="rock") return 0x9a8a70; if(p.kind==="orb") return p.mesh.userData.glow||0xff8a3d; let c=0x8fb4ff; try{ if(!p.cosmetic) c=RM().skills[0].color; else if(p.color!=null) c=p.color; }catch(e){} const C=new THREE.Color(c), h={}; C.getHSL(h); C.setHSL(h.h,Math.max(.6,h.s),Math.min(.58,Math.max(.42,h.l))); return C.getHex(); }
  function tick(dt){ if(!on){ if(typeof scene==="undefined") return; init(); }
    const far2=55*55, n=ECO()?1:2;
    for(const p of PROJ){ if(!p.fx||p.stuck>0) continue; const m=p.mesh; const dx=m.position.x-P.x, dz=m.position.z-P.z; if(dx*dx+dz*dz>far2) continue; const c=p._tc||(p._tc=trailCol(p));
      if(TRAIL[p.kind]&&m.userData.inner&&m.userData.inner.userData.spin){ // 빙글 도는 무기: 날 끝 두 곳이 그리는 원 잔상
        const inner=m.userData.inner; m.updateMatrixWorld(true); const L=p.kind==="rock"?.3:p.kind==="hammer"?.75:.6;
        for(let k=0;k<n;k++){ V.set(0,k?-L*.5:L,0); inner.localToWorld(V); emit(glow,V.x,V.y,V.z,{c,s:p.kind==="hammer"?1.2:.95,s1:.3,d:p.kind==="rock"?.22:.4,a:k?.5:.95}); }
        if(p.kind==="hammer"&&Math.random()<dt*25) emit(glow,m.position.x+rnd(-.4,.4),m.position.y+rnd(-.2,.5),m.position.z+rnd(-.4,.4),{c:0xffffff,s:.3,s1:0,d:.25,vy:rnd(-1,1),vx:rnd(-2,2),vz:rnd(-2,2)}); }
      else if(p.kind==="orb"){ for(let k=0;k<n;k++) emit(glow,m.position.x+rnd(-.25,.25),m.position.y+rnd(-.25,.25),m.position.z+rnd(-.25,.25),{c,s:p.big?2.2:1.1,s1:.2,d:.35,vy:rnd(.5,1.5)}); }
      else { // 창·단검·화살비: 뒤로 가는 가는 빛 꼬리(꼬리 두 개를 이어 찍어 선처럼)
        const px=p._lx!=null?p._lx:m.position.x, py=p._ly!=null?p._ly:m.position.y, pz=p._lz!=null?p._lz:m.position.z; const S=p.kind==="javelin"?.8:.55;
        for(let k=0;k<3;k++){ const f=k/3; emit(glow,px+(m.position.x-px)*f,py+(m.position.y-py)*f,pz+(m.position.z-pz)*f,{c,s:S,s1:.05,d:p.kind==="arrow"?.16:.22,a:.85}); } }
      p._lx=m.position.x; p._ly=m.position.y; p._lz=m.position.z; }
    step(glow,dt); step(dirt,dt);
    for(const k of marks){ if(k.t>=k.d) continue; k.t+=dt; const f=k.t/k.d; k.m.material.opacity=k.op*(f<.08?f/.08:f>.6?1-(f-.6)/.4:1); if(k.t>=k.d) k.m.visible=false; } }
  function burst(x,z,kind,big){ if(!on) return; const dx=x-P.x, dz=z-P.z; if(dx*dx+dz*dz>60*60) return; const gt=ground(x,z), pal=DIRT[gt], gy=hAt(x,z);
    const N=Math.round((big?26:kind==="javelin"||kind==="hammer"?18:kind==="arrow"?5:14)*(ECO()?.6:1));
    for(let i=0;i<N;i++){ const a=Math.random()*6.283, sp=rnd(2,big?7:5); emit(dirt,x+Math.cos(a)*.2,gy+.15,z+Math.sin(a)*.2,{c:pal[i%3],vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:rnd(3,big?9:7),g:20,s:rnd(.24,big?.6:.46),s1:rnd(.12,.24),d:rnd(.6,1.0)}); }
    // 흙먼지 구름(밝은 땅에서도 보이게 살짝 어두운 색)
    const dust=gt===1?0x8e9cb2:gt===3?0x9a9488:0xa08a68; for(let i=0;i<(big?6:3);i++) emit(dirt,x+rnd(-.5,.5),gy+.4,z+rnd(-.5,.5),{c:dust,vx:rnd(-1.2,1.2),vz:rnd(-1.2,1.2),vy:rnd(.6,1.6),s:rnd(.8,1.2),s1:big?2.8:2,d:.75,a:.55});
    if(kind!=="arrow"){ const k=marks[mi]; mi=(mi+1)%marks.length; const s=big?4:kind==="javelin"||kind==="hammer"?2.6:1.9; k.m.scale.set(s,s,1); k.m.position.set(x,gy+.06,z); k.m.material.color.setHex(gt===1?0x46546c:gt===2?0x6a4a24:0x2a1c10); k.op=gt===1?.55:.5; k.t=0; k.d=2.6; k.m.visible=true; }
    if(kind==="javelin"||kind==="hammer"||big){ P.shake=Math.max(P.shake||0,big?.5:.28); } }
  // fireProj·projImpact 를 감싸서 겉모습만 덧붙임
  const fire0=fireProj; fireProj=function(o){ const p=fire0(o); if(TRAIL[o.kind]||(o.kind==="orb"&&o.big)||(o.kind==="arrow"&&o.arc>=1)) p.fx=1; return p; };
  const imp0=projImpact; projImpact=function(p){ const r=imp0(p); try{ if(p.fx||p.kind==="javelin"){ const m=p.mesh; const air=m.position.y-hAt(m.position.x,m.position.z); if(air<3.2||p.t>=p.T) burst(m.position.x,m.position.z,p.kind,!!p.big); } }catch(e){} return r; };
  XTICK.push(dt=>{ try{ tick(dt); }catch(e){} });
  return {burst,_s:()=>({glow,dirt})}; })();
</script>
