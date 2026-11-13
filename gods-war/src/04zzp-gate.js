<script>
/* ================= 수도 성문 아치 + 횃불 (v124) =================
   수도에서 세계의 중심으로 가는 큰길 위(광장 바깥쪽)에 세계마다 다른 돌 아치 성문을 세움.
   꼭대기엔 금빛 테두리·세계 색 깃발 두 장·빛나는 문양 구슬, 양옆엔 횃불 기둥 둘 —
   불꽃은 셰이더 알갱이(노랑→주황→빨강으로 날름거리며 솟음), 밤이 되면 더 크고 밝게, 바닥에 불빛 웅덩이.
   그리기: 수도마다 메시 4개(돌·금·깃발·구슬, 부품을 한 덩어리로 합침) + Points 1개, 내가 그 수도 120m 안일 때만 보임.
   PointLight 없음. 모습만 — 길·충돌·규칙 그대로. */
const GATE=(()=>{ const list=[]; if(typeof REGIONS==="undefined"||typeof REALMS==="undefined") return {list};
  // 여러 BufferGeometry 를 위치·법선만 남기고 한 덩어리로
  function merge(gs){ let n=0; const parts=gs.map(g=>{ const q=g.index?g.toNonIndexed():g; n+=q.attributes.position.count; return q; });
    const pos=new Float32Array(n*3), nor=new Float32Array(n*3); let o=0;
    for(const q of parts){ pos.set(q.attributes.position.array,o*3); nor.set(q.attributes.normal.array,o*3); o+=q.attributes.position.count; }
    const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("normal",new THREE.BufferAttribute(nor,3)); g.computeBoundingSphere(); return g; }
  const m4=new THREE.Matrix4(), q4=new THREE.Quaternion(), e3=new THREE.Euler();
  function B(w,h,d,x,y,z,ry){ const g=new THREE.BoxGeometry(w,h,d); m4.compose(new THREE.Vector3(x,y,z),q4.setFromEuler(e3.set(0,ry||0,0)),new THREE.Vector3(1,1,1)); return g.applyMatrix4(m4); }
  function C(r1,r2,h,x,y,z,s){ return new THREE.CylinderGeometry(r1,r2,h,s||10).translate(x,y,z); }
  const STONE=[M.marble,M.rock,M.temple,M.marble], TRIM=[M.gold,M.gold,M.tgold,M.gold];
  const HW=4.6;   // 기둥 사이 반 너비(길 너비 약 7)
  const TORCH=[[-HW-2.2,0],[HW+2.2,0]];
  const NF=HIGH()&&!ECO()?36:ECO()?18:26;   // 횃불 하나의 불꽃 알갱이
  REALMS.forEach((R,i)=>{ const cap=REGIONS[i*3]; if(!cap) return;
    const L=Math.hypot(cap.x,cap.z)||1, ix=-cap.x/L, iz=-cap.z/L;
    // 큰길 위에서 나무·게시판·경주 출발선·다른 시설과 안 겹치는 자리 찾기(40~60걸음)
    const obs=[]; const add=(x,z,rad)=>obs.push([x,z,rad]);
    try{ TREEPOS.forEach(t=>{ add(t[0],t[1],2); }); }catch(e){}
    try{ const g=gdSpot(i); add(g.x,g.z,5); }catch(e){} try{ const f=fgSpot(i); add(f.x,f.z,6); }catch(e){} try{ const w=wdSpot(i); add(w.x,w.z,12); }catch(e){}
    try{ add(OR.spots[i].x,OR.spots[i].z,6); }catch(e){} try{ add(PG.gates[i].x,PG.gates[i].z,7); }catch(e){}
    try{ const co=RC.courses[i]; add(co.S.x,co.S.z,7); co.rings.forEach(k=>add(k.x,k.z,3)); }catch(e){}
    try{ PLACED.forEach(o=>{ if(o.realm===i) add(o.x,o.z,o.kind==="castle"?14:o.kind==="church"?8:o.kind==="house"?5:2.5); }); }catch(e){}
    try{ XSPOT_USED.forEach(o=>{ if(o.r===i) add(o.x,o.z,o.rad||6); }); }catch(e){}
    let best=null; for(let d=40;d<=60;d+=1){ const x=cap.x+ix*d, z=cap.z+iz*d; let m=99; obs.forEach(o=>{ m=Math.min(m,Math.hypot(x-o[0],z-o[1])-o[2]); }); const sc=Math.min(m,8)-(d-40)*.03; if(!best||sc>best.sc) best={d,sc}; }
    const r=best?best.d:44; const gx=cap.x+ix*r, gz=cap.z+iz*r;
    try{ XSPOT_USED.push({r:i,x:gx,z:gz,rad:7}); }catch(e){}
    const gy=Math.min(hAt(gx-iz*HW,gz+ix*HW),hAt(gx+iz*HW,gz-ix*HW),hAt(gx,gz))-.2;
    const root=new THREE.Group(); root.position.set(gx,gy,gz); root.rotation.y=Math.atan2(ix,iz);
    // 돌: 기둥 둘(받침·몸통·머리) + 들보 + 윗단 + 횃불 기둥
    const st=[]; [-HW,HW].forEach(x=>{ st.push(B(2.2,1,2.2,x,.5,0)); st.push(B(1.6,8,1.6,x,5,0)); st.push(B(2.1,.7,2.1,x,9.35,0)); });
    st.push(B(HW*2+3.4,1.5,2.4,0,10.4,0)); st.push(B(HW*2+1.6,.9,1.9,0,11.6,0));
    if(i===1){ st.push(B(1.1,1.1,1.1,-HW-1.2,12,0,.78)); st.push(B(1.1,1.1,1.1,HW+1.2,12,0,.78)); }          // 아스가르드: 들보 끝 뿔 받침
    if(i===2){ for(let k=0;k<3;k++) st.push(B(HW*2-k*2.2,.9,1.6,0,12.5+k*.9,0)); }                          // 인도: 층층 지붕
    if(i===0||i===3){ st.push(new THREE.CylinderGeometry(1,1,1.9,3).rotateX(-Math.PI/2).scale((HW+1.2)/.866,1.6,1).translate(0,12.85,0)); } // 에덴·올림푸스: 박공
    TORCH.forEach(([x,z])=>{ st.push(C(.22,.3,3.4,x,1.7,z,8)); st.push(C(.55,.6,.35,x,.18,z,8)); });
    const stone=new THREE.Mesh(merge(st),STONE[i]); root.add(stone);
    // 금빛 띠·횃불 그릇
    const gd=[]; gd.push(B(HW*2+3.6,.22,2.5,0,9.75,0)); gd.push(B(HW*2+3.6,.22,2.5,0,11.1,0)); [-HW,HW].forEach(x=>gd.push(B(1.7,.2,1.7,x,1.08,0)));
    TORCH.forEach(([x,z])=>{ gd.push(C(.62,.28,.55,x,3.6,z,10)); gd.push(C(.66,.66,.12,x,3.88,z,10)); });
    root.add(new THREE.Mesh(merge(gd),TRIM[i]));
    // 세계 색 깃발 두 장(앞뒤에서 보이게 양면)
    const bn=[]; [-HW,HW].forEach(x=>{ const p=new THREE.PlaneGeometry(1.4,3.6,1,1); p.translate(x,7.4,1.22); bn.push(p); const p2=new THREE.PlaneGeometry(1.4,3.6,1,1); p2.rotateY(Math.PI).translate(x,7.4,-1.22); bn.push(p2); });
    const ban=new THREE.Mesh(merge(bn),mat({color:R.c1,side:THREE.DoubleSide,emissive:R.c1,emissiveIntensity:.12})); root.add(ban);
    // 들보 가운데 빛나는 문양 구슬
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.75,14,10),glowMat(R.c1,.85)); orb.position.set(0,10.45,1.3); root.add(orb);
    // 횃불 불꽃(셰이더 알갱이) + 바닥 불빛 웅덩이
    const N=NF*2+2; const pos=new Float32Array(N*3), sd=new Float32Array(N*3);
    for(let k=0;k<N;k++){ const tor=k<NF?0:k<NF*2?1:(k-NF*2); sd[k*3]=Math.random(); sd[k*3+1]=Math.random(); sd[k*3+2]=k<NF*2?tor:2+tor;
      const T=TORCH[tor%2]; pos[k*3]=T[0]; pos[k*3+1]=k<NF*2?4:.08; pos[k*3+2]=T[1]; }
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(pos,3)); geo.setAttribute("aSeed",new THREE.BufferAttribute(sd,3));
    geo.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,3,0),10);
    const fm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
      uniforms:{uTime:TIME,uPx:{value:Math.min(2,window.devicePixelRatio||1)},uNight:{value:0}},
      vertexShader:"uniform float uTime; uniform float uPx; uniform float uNight; attribute vec3 aSeed; varying float vT; varying float vK; varying float vA;"+
        " void main(){ vec3 p=position; float s=aSeed.x, s2=aSeed.y; vK=aSeed.z; float big=1.+uNight*.45;"+
        " if(vK<1.5){ float t=fract(uTime*(1.25+s2*.6)+s); vT=t;"+                                        // 솟아오르며 가늘어지는 불꽃
        "   float a=s*40.+uTime*3.; float w=(1.-t)*.32*big; p+=vec3(cos(a)*w+sin(uTime*7.+s*9.)*.05*t, t*(1.5+s2*.7)*big, sin(a)*w);"+
        "   vA=smoothstep(0.,.08,t)*(1.-t); gl_PointSize=uPx*(2.6-1.9*t)*big*58./max(1.,-(modelViewMatrix*vec4(p,1.)).z); }"+
        " else { vT=0.; vA=(.28+uNight*.55)*(.85+.15*sin(uTime*9.+vK*3.)); gl_PointSize=uPx*(8.+uNight*5.)*58./max(1.,-(modelViewMatrix*vec4(p,1.)).z); }"+ // 바닥 불빛
        " gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }",
      fragmentShader:"varying float vT; varying float vK; varying float vA;"+
        " void main(){ vec2 c=gl_PointCoord*2.-1.; float r=dot(c,c); if(r>1.) discard;"+
        " if(vK>1.5){ gl_FragColor=vec4(1.,.62,.25,vA*(1.-r)*(1.-r)); return; }"+
        " vec3 col=mix(vec3(1.,.97,.7),vec3(1.,.55,.1),smoothstep(.05,.45,vT)); col=mix(col,vec3(.85,.18,.05),smoothstep(.5,.95,vT));"+
        " float core=1.-smoothstep(0.,.45,r); col=mix(col,vec3(1.,1.,.85),core*(1.-vT)*.6);"+
        " gl_FragColor=vec4(col,vA*(1.-r*.85)); }"});
    const fire=new THREE.Points(geo,fm); fire.userData.noOutline=true; fire.renderOrder=3; root.add(fire);
    shadowify(stone); stone.receiveShadow=false;
    root.traverse(o=>{ o.userData.noOutline=o.userData.noOutline||o!==stone; });
    root.visible=false; scene.add(root);
    list.push({root,fm,orb,x:gx,z:gz}); });
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on); }
  let t=0;
  XTICK.push(dt=>{ if(typeof P==="undefined") return; const ind=indoor();
    const night=clamp(1-((typeof DAY!=="undefined"&&DAY.d!=null?DAY.d:1)-.32)/.4,0,1);
    for(const g of list){ if(g.root.visible){ g.fm.uniforms.uNight.value=night; g.orb.scale.setScalar(1+Math.sin(TIME.value*2.4)*.08); } }
    t-=dt; if(t>0) return; t=.3;
    for(const g of list) g.root.visible=!ind&&Math.hypot(P.x-g.x,P.z-g.z)<120; });
  return {list};
})();
</script>
