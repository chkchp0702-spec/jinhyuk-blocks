<script>
/* ================= 무기마다 다른 타격 불꽃 (v133) =================
   괴물을 때린 순간 맞은 자리에 무기 종류에 맞는 모양의 빛이 번쩍:
   검·단검·도끼 = 비스듬한 초승달 베기(때릴 때마다 방향 번갈아), 망치·돌 = 큰 네 갈래 별 + 작은 별 튐,
   창 = 앞으로 쭉 찌르는 빛줄기, 활 = 작은 빛 점이 톡톡 흩어짐 + 작은 고리, 마법 = 퍼지는 룬 고리 + 빛 점.
   치명타면 금빛·더 크게. 색은 내 무기 등급 색(없으면 세계 색). 모습만 — 피해·규칙 그대로.
   Points 하나(그리기 1번)로 최대 64개 돌려씀, PointLight 없음. 절약 모드는 작은 조각 수 절반. */
const HSPK=(()=>{ const N=64; const O={ts:1}; let pts=null,pos,col,al,sz,sh,ro, P_=[], head=0, src=null, flip=1;
  function init(){ const g=new THREE.BufferGeometry(); pos=new Float32Array(N*3); col=new Float32Array(N*3); al=new Float32Array(N); sz=new Float32Array(N); sh=new Float32Array(N); ro=new Float32Array(N);
    g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("color",new THREE.BufferAttribute(col,3)); g.setAttribute("a",new THREE.BufferAttribute(al,1)); g.setAttribute("s",new THREE.BufferAttribute(sz,1)); g.setAttribute("sh",new THREE.BufferAttribute(sh,1)); g.setAttribute("ro",new THREE.BufferAttribute(ro,1));
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{uH:{value:800}},
      vertexShader:"attribute vec3 color; attribute float a,s,sh,ro; uniform float uH; varying vec3 vC; varying float vA,vS,vR; void main(){ vC=color; vA=a; vS=sh; vR=ro; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=a>0.001? s*projectionMatrix[1][1]*uH*.5/max(.5,-mv.z) : 0.; }",
      fragmentShader:[
        "varying vec3 vC; varying float vA,vS,vR;",
        "void main(){ vec2 q=(gl_PointCoord-.5)*2.; float c=cos(vR), s=sin(vR); q=vec2(c*q.x-s*q.y, s*q.x+c*q.y); q.y=-q.y;",
        " float v=0., core=0.;",
        " if(vS<.5){ float r1=length(q), r2=length(q-vec2(.34,.06)); v=smoothstep(.95,.86,r1)*smoothstep(.7,.86,r2); float tip=smoothstep(-.95,.2,q.y)*smoothstep(.95,-.2,q.y); v*=.35+.65*tip; core=v*smoothstep(.72,.9,r2+.0)*smoothstep(.95,.82,r1)*1.4; }", // 초승달
        " else if(vS<1.5){ float d=min(abs(q.x)+abs(q.y)*5.5, abs(q.y)+abs(q.x)*5.5); v=smoothstep(1.,.15,d)+smoothstep(.55,.0,length(q))*.8; core=smoothstep(.45,.0,d)+smoothstep(.25,.0,length(q)); }", // 네 갈래 별
        " else if(vS<2.5){ float d=abs(q.y)*7.+q.x*q.x*.9; v=smoothstep(1.,.25,d)*smoothstep(-1.,-.4,q.x); core=smoothstep(.45,.0,abs(q.y)*7.)*smoothstep(-.9,.2,q.x); }", // 찌르기 빛줄기
        " else if(vS<3.5){ float r=length(q); v=smoothstep(1.,.35,r); core=smoothstep(.45,.0,r); }", // 빛 점
        " else { float r=length(q), an=atan(q.y,q.x); v=smoothstep(.16,.03,abs(r-.78))*(.55+.45*step(0.,sin(an*8.))); v+=smoothstep(.1,.0,abs(r-.5))*.5; core=smoothstep(.06,.0,abs(r-.78)); }", // 룬 고리
        " v=clamp(v,0.,1.); if(v<.02) discard; vec3 cc=mix(vC*.42,vC*1.05,smoothstep(.15,.6,v)); cc=mix(cc,vec3(1.,.99,.94),clamp(core,0.,1.)*.9);",
        " gl_FragColor=vec4(cc,vA*smoothstep(0.,.3,v)); }"].join("\n")});
    pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.renderOrder=9; scene.add(pts); for(let i=0;i<N;i++) P_.push({t:1,d:1}); }
  const C1=new THREE.Color();
  // k: 0 초승달 1 별 2 빛줄기 3 점 4 고리 / s0→s1 크기, d 시간, v 속도, sp 회전 속도
  function add(o){ const i=head; head=(head+1)%N; const p=P_[i]; Object.assign(p,{t:0,vx:0,vy:0,vz:0,sp:0,g:0},o);
    sh[i]=o.k; C1.set(o.c); col[i*3]=C1.r; col[i*3+1]=C1.g; col[i*3+2]=C1.b; }
  function hexOf(){ try{ if(G.eq&&G.eq.w>=1&&RAR_HEX[G.eq.w]!=null) return RAR_HEX[G.eq.w]; }catch(e){} return 0xff9a2a; } // 흔한 무기는 눈밭에서도 보이는 주황빛
  function hit(m,kind,crit){ if(!m||m.titan||!(m.hp>-1e9)) return; if(!pts) init(); if(pts.parent!==scene) scene.add(pts);
    const sc=Math.max(.8,Math.min(2.2,m.scale||1)), y=hAt(m.x,m.z)+1.55*sc, few=ECO()?1:0;
    // 내 쪽으로 조금 당겨서(몸 앞에) 보이게
    const dx=P.x-m.x, dz=P.z-m.z, dd=Math.hypot(dx,dz)||1, x=m.x+dx/dd*.55*sc, z=m.z+dz/dd*.55*sc;
    const base=crit?0xffd34d:hexOf(), big=(crit?1.35:1)*(.9+sc*.25), ang=()=>Math.random()*6.283;
    if(kind==="sword"||kind==="dagger"||kind==="axe"){ flip=-flip; const r0=flip*(.55+Math.random()*.35)+(kind==="axe"?-.3*flip:0);
      add({k:0,x,y,z,c:base,s0:1.8*big,s1:3*big,d:.2,ro:r0,sp:flip*2.2});
      if(crit||kind==="axe") add({k:0,x,y:y+.05,z,c:0xffffff,s0:1.1*big,s1:1.9*big,d:.16,ro:r0+flip*.25,sp:flip*2.6});
      for(let k=0;k<(3>>few);k++){ const a=ang(); add({k:3,x,y,z,c:base,s0:.35,s1:.1,d:.3,vx:Math.cos(a)*4,vy:2+Math.random()*2,vz:Math.sin(a)*4,g:9}); } }
    else if(kind==="hammer"||kind==="fist"){ const r0=Math.random()<.5?0:.785;
      add({k:1,x,y,z,c:base,s0:.4*big,s1:3.1*big,d:.22,ro:r0,sp:1.5,pop:1});
      add({k:4,x,y:y-.3,z,c:base,s0:1*big,s1:3.6*big,d:.26,ro:0});
      for(let k=0;k<(5>>few);k++){ const a=ang(); add({k:1,x,y,z,c:k%2?0xffffff:base,s0:.7,s1:.2,d:.42,ro:a,sp:6,vx:Math.cos(a)*6,vy:3+Math.random()*3,vz:Math.sin(a)*6,g:14}); } }
    else if(kind==="spear"){ // 화면에서 찌르는 방향으로 눕힘
      const v=new THREE.Vector3(m.x,y,m.z).project(camera), w=new THREE.Vector3(P.x,y,P.z).project(camera); const r0=Math.atan2(v.y-w.y,(v.x-w.x)*(innerWidth/innerHeight));
      add({k:2,x,y,z,c:base,s0:1.8*big,s1:3.3*big,d:.2,ro:r0});
      add({k:1,x,y,z,c:0xffffff,s0:.3*big,s1:1.5*big,d:.15,ro:r0,pop:1});
      for(let k=0;k<(4>>few);k++){ const a=ang(); add({k:3,x,y,z,c:base,s0:.3,s1:.08,d:.3,vx:Math.cos(a)*3,vy:1.5+Math.random()*2,vz:Math.sin(a)*3,g:8}); } }
    else if(kind==="bow"){
      add({k:4,x,y,z,c:base,s0:.5*big,s1:1.8*big,d:.2,ro:0});
      add({k:1,x,y,z,c:0xffffff,s0:.3*big,s1:1.2*big,d:.13,ro:.785,pop:1});
      for(let k=0;k<(6>>few);k++){ const a=ang(); add({k:3,x,y,z,c:k%2?0xffffff:base,s0:.42,s1:.1,d:.34,vx:Math.cos(a)*5.5,vy:1+Math.random()*3,vz:Math.sin(a)*5.5,g:10}); } }
    else { // magic
      let mc=base; try{ if(!crit) mc=RM().skills[0].color; }catch(e){}
      add({k:4,x,y,z,c:mc,s0:.6*big,s1:3.4*big,d:.34,ro:0,sp:3});
      add({k:3,x,y,z,c:0xffffff,s0:1.4*big,s1:.2,d:.22});
      for(let k=0;k<(5>>few);k++){ const a=k/5*6.283; add({k:3,x,y,z,c:mc,s0:.5,s1:.1,d:.42,vx:Math.cos(a)*3.5,vy:2.5,vz:Math.sin(a)*3.5,g:4}); } }
    pts.geometry.attributes.color.needsUpdate=true; pts.geometry.attributes.sh.needsUpdate=true; }
  function tick(dt){ if(!pts) return; dt*=O.ts; let any=false; try{ pts.material.uniforms.uH.value=renderer.domElement.height; }catch(e){}
    for(let i=0;i<N;i++){ const p=P_[i]; if(p.t>=p.d){ al[i]=0; continue; } any=true; p.t+=dt; const k=Math.min(1,p.t/p.d);
      p.vy-=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z;
      const e=p.pop?(k<.35?Math.sin(k/.35*1.5708):1-(k-.35)/.65*.5):1-Math.pow(1-k,3);
      sz[i]=p.s0+(p.s1-p.s0)*e; ro[i]=(p.ro||0)+(p.sp||0)*p.t; al[i]=k<.1?k/.1:Math.pow(1-(k-.1)/.9,1.4); }
    const g=pts.geometry; g.attributes.position.needsUpdate=true; g.attributes.a.needsUpdate=true; g.attributes.s.needsUpdate=true; g.attributes.ro.needsUpdate=true; pts.visible=any; }
  // 어떤 공격 중에 맞았는지 기억(근접 공격 중·내가 쏜 화살/구슬·던진 무기가 떨어진 순간)
  const _at=attack; attack=function(){ let k="sword"; try{ k=myWeaponKind(); }catch(e){} src=k; try{ return _at.apply(this,arguments); } finally{ src=null; } };
  const PK={arrow:"bow",orb:"magic",javelin:"spear",axe:"axe",hammer:"hammer",dagger:"dagger",rock:"fist"};
  const _pi=projImpact; projImpact=function(p){ const old=src; if(p&&!p.cosmetic&&p.hits==="mobs") src=PK[p.kind]||null; try{ return _pi.apply(this,arguments); } finally{ src=old; } };
  const _dm=damageMob; damageMob=function(m,dmg,crit){ const k=src, alive=m&&m.hp>0; const r=_dm.apply(this,arguments); if(k&&alive){ try{ hit(m,k,crit); }catch(e){} } return r; };
  XTICK.push(tick);
  O.hit=hit; O.tick=tick; return O;
})();
</script>
