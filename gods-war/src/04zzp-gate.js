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
  function mergeUV(gs){ let n=0; const parts=gs.map(g=>{ const q=g.index?g.toNonIndexed():g; n+=q.attributes.position.count; return q; });
    const pos=new Float32Array(n*3), nor=new Float32Array(n*3), uv=new Float32Array(n*2); let o=0;
    for(const q of parts){ pos.set(q.attributes.position.array,o*3); nor.set(q.attributes.normal.array,o*3); uv.set(q.attributes.uv.array,o*2); o+=q.attributes.position.count; }
    const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("normal",new THREE.BufferAttribute(nor,3)); g.setAttribute("uv",new THREE.BufferAttribute(uv,2)); g.computeBoundingSphere(); return g; }
  // 세계마다 깃발 그림: [바탕, 진한 띠, 문양]
  const BAN=[["#8e1b2c","#5e0f1c"],["#1d4f94","#0f2d5c"],["#c4410c","#7c2408"],["#1e3fae","#122a73"]];
  function banTex(i){ const W=96,H=240, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const x=cv.getContext("2d");
    const tail=H-46; x.beginPath(); x.moveTo(0,0); x.lineTo(W,0); x.lineTo(W,H); x.lineTo(W/2,tail); x.lineTo(0,H); x.closePath();
    const gr=x.createLinearGradient(0,0,0,H); gr.addColorStop(0,BAN[i][0]); gr.addColorStop(1,BAN[i][1]); x.fillStyle=gr; x.fill();
    x.save(); x.clip(); x.fillStyle="rgba(0,0,0,.28)"; x.fillRect(0,0,W,22); x.fillStyle="rgba(255,255,255,.06)"; for(let k=0;k<W;k+=12) x.fillRect(k,0,5,H); x.restore();
    // 금빛 테두리(안쪽 두 줄)
    x.strokeStyle="#f3c74d"; x.lineWidth=7; x.beginPath(); x.moveTo(7,22); x.lineTo(7,H-10); x.lineTo(W/2,tail+9); x.lineTo(W-7,H-10); x.lineTo(W-7,22); x.closePath(); x.stroke();
    x.strokeStyle="#fff1b8"; x.lineWidth=2; x.beginPath(); x.moveTo(15,30); x.lineTo(15,H-26); x.lineTo(W/2,tail-3); x.lineTo(W-15,H-26); x.lineTo(W-15,30); x.closePath(); x.stroke();
    x.fillStyle="#f3c74d"; x.fillRect(0,14,W,8);
    // 문양(금빛 원판 위)
    const cx=W/2, cy=96; x.fillStyle="rgba(255,225,130,.22)"; x.beginPath(); x.arc(cx,cy,32,0,7); x.fill(); x.strokeStyle="#f3c74d"; x.lineWidth=3; x.beginPath(); x.arc(cx,cy,32,0,7); x.stroke();
    x.fillStyle="#ffd860"; x.strokeStyle="#7a5410"; x.lineWidth=2; x.lineJoin="round"; x.beginPath();
    if(i===0){ x.rect(cx-6,cy-24,12,48); x.rect(cx-19,cy-12,38,11); }                         // 십자가
    else if(i===1){ x.moveTo(cx,cy-26); x.lineTo(cx+15,cy-9); x.lineTo(cx+19,cy+24); x.lineTo(cx+12,cy+24); x.lineTo(cx+9,cy+2); x.lineTo(cx,cy+12); x.lineTo(cx-9,cy+2); x.lineTo(cx-12,cy+24); x.lineTo(cx-19,cy+24); x.lineTo(cx-15,cy-9); x.closePath(); // 오탈라 룬 모양
      x.moveTo(cx,cy-15); x.lineTo(cx-8,cy-6); x.lineTo(cx,cy+3); x.lineTo(cx+8,cy-6); x.closePath(); }
    else if(i===2){ for(let k=0;k<8;k++){ const a=k*Math.PI/4; x.moveTo(cx,cy); x.ellipse(cx+Math.cos(a)*14,cy+Math.sin(a)*14,13,6,a,0,7); } }   // 연꽃
    else { x.moveTo(cx+8,cy-28); x.lineTo(cx-14,cy+4); x.lineTo(cx-1,cy+4); x.lineTo(cx-9,cy+28); x.lineTo(cx+15,cy-6); x.lineTo(cx+2,cy-6); x.lineTo(cx+10,cy-28); x.closePath(); } // 번개
    x.fill(i===2?"nonzero":"evenodd"); x.stroke(); if(i===2){ x.fillStyle="#fff1b8"; x.beginPath(); x.arc(cx,cy,7,0,7); x.fill(); }
    // 아래쪽 작은 별 셋
    x.fillStyle="#f3c74d"; [[cx,160],[cx-18,150],[cx+18,150]].forEach(([a,b])=>{ x.beginPath(); for(let k=0;k<10;k++){ const r=k%2?2.6:6.5, an=-Math.PI/2+k*Math.PI/5; x.lineTo(a+Math.cos(an)*r,b+Math.sin(an)*r); } x.fill(); });
    const t=new THREE.CanvasTexture(cv); t.anisotropy=2; if(THREE.SRGBColorSpace) t.colorSpace=THREE.SRGBColorSpace; return t; }
  function banMat(i){ const m=mat({map:banTex(i),side:THREE.DoubleSide,alphaTest:.5,emissive:0xffffff,emissiveIntensity:.08});
    if(m.emissiveMap!==undefined) m.emissiveMap=m.map;
    m.onBeforeCompile=sh=>{ sh.uniforms.uTime=TIME; sh.vertexShader="uniform float uTime;\n"+sh.vertexShader.replace("#include <begin_vertex>",
      "#include <begin_vertex>\n{ float _h=clamp((9.2-transformed.y)/4.,0.,1.); float _w=sin(uTime*2.3+transformed.y*1.4+transformed.x*.7)*.16+sin(uTime*3.7+transformed.y*2.6)*.05; transformed.z+=_w*_h*sign(transformed.z+.0001); transformed.x+=cos(uTime*1.7+transformed.y)*.05*_h; }"); };
    return m; }
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
    // 세계 색 깃발 두 장(앞뒤에서 보이게 양면)
    // (v127) 진한 세계 색 바탕 + 금빛 테두리·문양 그림 + 제비꼬리 끝, 바람에 살랑(셰이더)
    const bn=[]; [-HW,HW].forEach(x=>{ const p=new THREE.PlaneGeometry(1.6,4,2,6); p.translate(x,7.2,1.22); bn.push(p); const p2=new THREE.PlaneGeometry(1.6,4,2,6); p2.rotateY(Math.PI).translate(x,7.2,-1.22); bn.push(p2); });
    const ban=new THREE.Mesh(mergeUV(bn),banMat(i)); ban.userData.noOutline=true; root.add(ban);
    // 깃대 가로막대(금)
    [-HW,HW].forEach(x=>{ [1.25,-1.25].forEach(z=>gd.push(new THREE.CylinderGeometry(.08,.08,1.9,6).rotateZ(Math.PI/2).translate(x,9.22,z))); });
    root.add(new THREE.Mesh(merge(gd),TRIM[i]));
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
