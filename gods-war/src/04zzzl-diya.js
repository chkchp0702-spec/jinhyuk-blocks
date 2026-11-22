<script>
/* ================= v163: 인도 연못·물가에 저녁이면 꽃등불(디야)이 둥실 =================
   해가 기울면(저녁~밤) 인도 땅의 가까운 물(연꽃 연못·호수) 위에 작은 흙 그릇 등불들이 금잔화 꽃잎 고리를 두르고
   천천히 맴돌며 떠다님. 불꽃은 일렁이고, 물 위에 주황 빛 번짐이 비침. 낮이면 스르르 사라짐.
   그리기: 그릇 1 + 꽃잎 고리 1(InstancedMesh) + 불꽃·빛 번짐 Points 1 = 3번, 보일 때만. PointLight 없음.
   물 위치는 FJUMP(04zzza) 가 찾아둔 물 목록을 보기만 함. 모습만(게임 규칙·저장과 아무 상관 없음). */
const DIYA=(()=>{ const N=HIGH()?(ECO()?7:10):6; let built=false, bowl, ring, fl, fpos, fa, fs, D=[], spot=null, a=0, t=0, scanT=0;
  const dm=new THREE.Object3D();
  function build(){ built=true;
    const pts=[]; [[0,0],[.16,.01],[.27,.07],[.32,.15],[.3,.17],[.22,.1],[.08,.08],[0,.08]].forEach(p=>pts.push(new THREE.Vector2(p[0],p[1])));
    const bg=new THREE.LatheGeometry(pts,9);
    bowl=new THREE.InstancedMesh(bg,new THREE.MeshLambertMaterial({color:0xb2552a,emissive:0x5a1a04}),N);
    const rg=new THREE.TorusGeometry(.36,.075,4,10); rg.rotateX(Math.PI/2);
    ring=new THREE.InstancedMesh(rg,new THREE.MeshLambertMaterial({color:0xffa21c,emissive:0x6a2a00}),N);
    const C=new THREE.Color(); for(let i=0;i<N;i++){ C.setHex(i%3===1?0xffcf2a:(i%3===2?0xff5a7a:0xff8a14)); ring.setColorAt(i,C); }
    [bowl,ring].forEach(m=>{ m.userData.noOutline=true; m.userData.noLod=true; m.userData.cullR=-1; m.frustumCulled=false; m.visible=false; m.count=N; scene.add(m); });
    // 불꽃(i) + 물 위 빛 번짐(N+i)
    const g=new THREE.BufferGeometry(); fpos=new Float32Array(N*2*3); fa=new Float32Array(N*2); fs=new Float32Array(N*2);
    for(let i=0;i<N;i++){ fs[i]=0; fs[N+i]=1; }
    g.setAttribute("position",new THREE.BufferAttribute(fpos,3)); g.setAttribute("a",new THREE.BufferAttribute(fa,1)); g.setAttribute("k",new THREE.BufferAttribute(fs,1));
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uH:{value:800},t:{value:0}},
      vertexShader:`attribute float a,k; uniform float uH,t; varying float vA,vK,vF; void main(){ vA=a; vK=k; vF=sin(t*13.+position.x*7.)*.5+sin(t*21.+position.z*5.)*.5;
        vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=a>.001?mix(.95,3.4,k)*projectionMatrix[1][1]*uH*.5/max(.5,-mv.z):0.; }`,
      fragmentShader:`varying float vA,vK,vF; void main(){ vec2 q=gl_PointCoord-.5; q.y=-q.y;
        if(vK<.5){ /* 불꽃: 아래 둥글고 위로 뾰족한 물방울, 하얀 심지 */
          vec2 e=vec2(q.x*(1.+vF*.12)/(.2+.08*smoothstep(.2,-.3,q.y)),(q.y+.12)/.36); float d=length(vec2(e.x,max(e.y,0.)*1.25+min(e.y,0.)*2.4));
          float f=smoothstep(1.,.55,d), core=smoothstep(.55,.1,d), halo=smoothstep(.5,.0,length(q))*.35;
          vec3 c=mix(vec3(1.,.32,.04),vec3(1.,.78,.25),f); c=mix(c,vec3(1.,.98,.85),core);
          float o=max(f,halo)*vA; if(o<.02) discard; gl_FragColor=vec4(c*o,o);
        } else { /* 물 위 빛 번짐: 납작하고 부드러운 주황 원 + 일렁이는 빛줄기 */
          vec2 e=q*vec2(1.,2.4); float d=length(e); float o=smoothstep(.5,.0,d)*.42*vA*(.85+vF*.15);
          o+=smoothstep(.06,.0,abs(q.x))*smoothstep(.5,.05,abs(q.y+.05))*.18*vA;
          if(o<.01) discard; gl_FragColor=vec4(vec3(1.,.55,.16)*o,o); } }`});
    fl=new THREE.Points(g,m); fl.frustumCulled=false; fl.renderOrder=5; fl.userData.noOutline=true; fl.userData.noLod=true; fl.userData.cullR=-1; fl.visible=false; scene.add(fl);
    for(let i=0;i<N;i++) D.push({r:.28+Math.random()*.62,ph:i/N*6.283+Math.random()*.4,sp:(.05+Math.random()*.06)*(i%2?1:-1),bob:Math.random()*6.28,spin:Math.random()*6.28}); }
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on); }
  function pick(){ spot=null; try{ const L=FJUMP.spots||[]; let bd=1e9; for(const s of L){ if(fishRealmAt(s.x,s.z)!==2||s.r<1.6) continue; const d=Math.hypot(P.x-s.x,P.z-s.z)-s.r; if(d<bd){ bd=d; spot=s; } } if(bd>55) spot=null; }catch(e){ spot=null; } }
  function tick(dt){ if(typeof P==="undefined") return; t+=dt; scanT-=dt; if(scanT<=0){ scanT=2.5; pick(); }
    const day=DAY.d==null?1:DAY.d; const want=(spot&&!indoor()&&!P.dead)?clamp((.82-day)/.3,0,1):0;
    a+=(want-a)*Math.min(1,dt*.8); if(a<.02){ if(built){ bowl.visible=ring.visible=fl.visible=false; } return; }
    if(!built) build(); if(!spot) return; const s=spot, R=s.r*1.05, y=s.y+.03;
    for(let i=0;i<N;i++){ const d=D[i]; d.ph+=d.sp*dt*(1.6/Math.max(1.5,R*d.r)); const rr=R*d.r, x=s.x+Math.cos(d.ph)*rr, z=s.z+Math.sin(d.ph)*rr;
      const bob=Math.sin(t*1.3+d.bob)*.025, tl=Math.sin(t*.9+d.bob)*.07; d.spin+=dt*.15;
      const sc=.75+.25*a; dm.position.set(x,y+bob,z); dm.rotation.set(tl,d.spin,tl*.6); dm.scale.setScalar(sc*1.9); dm.updateMatrix(); bowl.setMatrixAt(i,dm.matrix);
      dm.position.y=y+bob+.1; dm.updateMatrix(); ring.setMatrixAt(i,dm.matrix);
      fpos[i*3]=x; fpos[i*3+1]=y+bob+.58*sc; fpos[i*3+2]=z; fa[i]=a*(.88+.12*Math.sin(t*9+i));
      fpos[(N+i)*3]=x; fpos[(N+i)*3+1]=y+.01; fpos[(N+i)*3+2]=z; fa[N+i]=a; }
    bowl.instanceMatrix.needsUpdate=true; ring.instanceMatrix.needsUpdate=true; fl.geometry.attributes.position.needsUpdate=true; fl.geometry.attributes.a.needsUpdate=true;
    fl.material.uniforms.t.value=t; try{ fl.material.uniforms.uH.value=renderer.domElement.height; }catch(e){}
    bowl.visible=ring.visible=fl.visible=true; }
  XTICK.push(tick);
  return {tick,get bowl(){ return bowl; },get fl(){ return fl; },get spot(){ return spot; },get a(){ return a; },pick};
})();
</script>
