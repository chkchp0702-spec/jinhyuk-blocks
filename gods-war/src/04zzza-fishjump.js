<script>
/* ================= v143: 호수·연못에서 물고기가 톡 뛰어올랐다 첨벙 =================
   물가(호수·연꽃 연못·분수·낚시터) 가까이(35m 안)에 있으면 몇 초마다 물고기 한 마리가 물 위로 활처럼 뛰어올라
   몸을 비틀며 반짝이고 다시 쏙 들어감. 나갈 때·들어갈 때 물방울이 튀고 물결 고리 두 겹이 퍼짐(가까우면 퐁당 소리).
   세계마다 물고기 색(에덴 금빛 잉어·아스가르드 은빛 연어·인도 주홍 잉어·올림푸스 푸른 고등어).
   그리기: 물고기 1(몸+꼬리 한 덩어리) + 물결 고리 2 + 물방울 Points 1 — 보일 때만. PointLight 없음. 모습만(낚시 규칙 그대로). */
const FJUMP=(()=>{ let spots=null, scanT=0, wait=3, fish=null, rings=[], drops=null, dpos, dal, D=[]; const ND=40;
  const COL=[[0xff9410,0xffe070],[0xb8d0ea,0x4f86c8],[0xff4a1a,0xfff0d8],[0x2a6fe0,0xc8e4ff]];
  function scan(){ const L=[]; try{ scene.updateMatrixWorld(true); const v=new THREE.Vector3(), sc=new THREE.Vector3();
      scene.traverse(o=>{ if(!o.isMesh||(o.material!==WATER&&o.material!==M.water)) return; for(let q=o;q;q=q.parent){ if(!q.visible&&!q.userData._cullHid) return; } if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.getWorldPosition(v); o.getWorldScale(sc);
        const pr=o.geometry.parameters||{}; let r; if(pr.radius!=null) r=pr.radius*Math.max(sc.x,sc.z)*.62; else if(pr.width!=null&&pr.height!=null) r=Math.min(pr.width*sc.x,pr.height*(sc.y||1))*.32; else r=o.geometry.boundingSphere.radius*Math.max(sc.x,sc.z)*.4;
        if(r<.9||r>40) return; L.push({x:v.x,z:v.z,y:v.y,r}); }); }catch(e){} spots=L; }
  function build(){ const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(.5,10,7),new THREE.MeshLambertMaterial({color:0xffb43a,emissive:0x221100}));
    body.scale.set(.32,.38,1); g.add(body);
    const tail=new THREE.Mesh(new THREE.ConeGeometry(.26,.42,4),body.material); tail.rotation.x=-Math.PI/2; tail.scale.set(.25,1,1); tail.position.z=-.62; g.add(tail);
    const fin=new THREE.Mesh(new THREE.ConeGeometry(.12,.3,3),new THREE.MeshLambertMaterial({color:0xfff0b0,emissive:0x332200})); fin.position.set(0,.2,-.05); fin.scale.set(.3,1,1.4); g.add(fin);
    g.userData.noOutline=true; g.visible=false; scene.add(g); fish={g,body,tail,fin,on:false};
    for(let i=0;i<2;i++){ const m=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xeaf8ff,transparent:true,opacity:0,depthWrite:false})); m.rotation.x=-Math.PI/2; m.visible=false; m.userData.noOutline=true; m.renderOrder=3; scene.add(m); rings.push({m,t:9,d:1}); }
    const pg=new THREE.BufferGeometry(); dpos=new Float32Array(ND*3); dal=new Float32Array(ND); pg.setAttribute("position",new THREE.BufferAttribute(dpos,3)); pg.setAttribute("a",new THREE.BufferAttribute(dal,1));
    const pm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uH:{value:800}},
      vertexShader:"attribute float a; uniform float uH; varying float vA; void main(){ vA=a; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=a>0.001?.24*projectionMatrix[1][1]*uH*.5/max(.5,-mv.z):0.; }",
      fragmentShader:"varying float vA; void main(){ vec2 q=gl_PointCoord-.5; float d=length(q); if(d>.5) discard; vec3 c=mix(vec3(.62,.84,1.),vec3(1.),smoothstep(.35,.0,d)); gl_FragColor=vec4(c,vA*smoothstep(.5,.3,d)); }"});
    drops=new THREE.Points(pg,pm); drops.frustumCulled=false; drops.renderOrder=4; drops.visible=false; scene.add(drops); for(let i=0;i<ND;i++) D.push({t:1,d:1}); }
  function splash(x,y,z,big){ rings.forEach((r,i)=>{ r.t=-i*.16; r.d=.9+i*.25; r.x=x; r.y=y+.03; r.z=z; r.s=big?3:2.2; });
    const n=big?20:12; let k=0; for(let i=0;i<ND&&k<n;i++){ const p=D[i]; if(p.t<p.d) continue; k++; const a=Math.random()*6.283, sp=.8+Math.random()*1.6;
      p.x=x; p.y=y+.05; p.z=z; p.vx=Math.cos(a)*sp; p.vz=Math.sin(a)*sp; p.vy=2.2+Math.random()*2.4; p.t=0; p.d=.5+Math.random()*.35; p.y0=y; }
    if(Math.hypot(x-P.x,z-P.z)<16){ try{ tone(big?520:760,.07,"sine",0,.05); tone(big?260:380,.12,"sine",.03,.04); }catch(e){} } }
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on); }
  function jump(s){ if(!fish) build(); const r=(typeof fishRealmAt==="function")?fishRealmAt(s.x,s.z):0; const C=COL[r]||COL[0];
    fish.body.material.color.setHex(C[0]); fish.fin.material.color.setHex(C[1]);
    const a=Math.random()*6.283, d=Math.sqrt(Math.random())*s.r*.55, h=Math.random()*6.283, L=Math.min(2.2+Math.random()*1.6,s.r*.9+1.2);
    const x0=s.x+Math.cos(a)*d, z0=s.z+Math.sin(a)*d; fish.j={x0,z0,dx:Math.sin(h)*L,dz:Math.cos(h)*L,y:s.y,H:1.5+Math.random()*1.1,t:0,T:.85+Math.random()*.3,sc:1.5+Math.random()*.6,roll:(Math.random()<.5?-1:1),in:false};
    fish.g.rotation.order="YXZ"; fish.g.rotation.y=h; fish.g.scale.setScalar(fish.j.sc); fish.g.visible=true; fish.on=true; splash(x0,s.y,z0,false); }
  function tick(dt){ if(typeof P==="undefined") return;
    scanT-=dt; if(scanT<=0||!spots){ scanT=spots&&spots.length?20:6; scan(); }
    // 물고기 날기
    if(fish&&fish.on){ const j=fish.j; j.t+=dt; const k=Math.min(1,j.t/j.T); const y=j.y+Math.sin(k*Math.PI)*j.H-.15*(1-Math.sin(k*Math.PI));
      fish.g.position.set(j.x0+j.dx*k,y,j.z0+j.dz*k); fish.g.rotation.x=-Math.cos(k*Math.PI)*1.05; fish.g.rotation.z=Math.sin(k*Math.PI*2)*.5*j.roll;
      fish.tail.rotation.y=Math.sin(j.t*28)*.6; fish.body.material.emissive.setScalar(.22+.3*Math.max(0,Math.sin(j.t*16)));
      if(k>=1){ fish.on=false; fish.g.visible=false; splash(j.x0+j.dx,j.y,j.z0+j.dz,true); } }
    // 물결 고리
    rings.forEach(r=>{ if(r.t>=r.d){ r.m.visible=false; return; } r.t+=dt; if(r.t<0){ r.m.visible=false; return; } const k=r.t/r.d; r.m.visible=true;
      r.m.position.set(r.x,r.y,r.z); r.m.scale.setScalar(.25+k*r.s); r.m.material.opacity=(1-k)*(1-k)*.95; });
    // 물방울
    if(drops){ let any=false; try{ drops.material.uniforms.uH.value=renderer.domElement.height; }catch(e){}
      for(let i=0;i<ND;i++){ const p=D[i]; if(p.t>=p.d){ dal[i]=0; continue; } any=true; p.t+=dt; p.vy-=9.8*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt;
        if(p.y<p.y0){ p.t=p.d; dal[i]=0; continue; } dpos[i*3]=p.x; dpos[i*3+1]=p.y; dpos[i*3+2]=p.z; dal[i]=.95*(1-p.t/p.d*.5); }
      drops.geometry.attributes.position.needsUpdate=true; drops.geometry.attributes.a.needsUpdate=true; drops.visible=any; }
    // 다음 물고기
    if(fish&&fish.on) return; wait-=dt; if(wait>0) return; wait=(ECO()?4:2.6)+Math.random()*4;
    if(P.dead||indoor()||!spots||!spots.length) return;
    let best=null, bd=1e9; for(const s of spots){ const d=Math.hypot(P.x-s.x,P.z-s.z)-s.r; if(d<bd){ bd=d; best=s; } }
    if(best&&bd<35) jump(best); }
  XTICK.push(tick);
  return {jump:s=>jump(s||spots[0]),get spots(){ return spots; },get fish(){ return fish; },rescan:scan};
})();
</script>
