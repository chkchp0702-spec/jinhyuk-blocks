<script>
/* ================= 정예·보스 등장 연출 (v116) =================
   정예 괴물·지역 보스·세계 보스가 나타날 때(내 근처 45m 안):
   - 땅이 갈라지며 빛나는 금 원(정예 금빛 / 보스 붉은 / 세계 보스 보랏빛)이 퍼졌다 식음
   - 흙먼지 기둥이 솟고 가운데 얇은 빛기둥, 흙 조각 튐, 화면 흔들림·땅 울림 소리
   - 괴물이 땅속에서 쑥 솟아오름(0.6초, 모습만)
   모습만 — 스폰 규칙·능력치·시간 그대로. 판·기둥 세트 최대 3벌 돌려씀(그리기 호출 +3), PointLight 없음. */
const SPAWNFX=(()=>{ const SETS=[]; const PGEO=new THREE.PlaneGeometry(2,2); const CGEO=new THREE.CylinderGeometry(1,.55,1,20,1,true); CGEO.translate(0,.5,0);
  const CVS="varying vec2 vU; void main(){ vU=uv*2.-1.; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }";
  const CFS="uniform float k; uniform float f; uniform float s; uniform vec3 col; varying vec2 vU;"+
    "float h(float n){ return fract(sin(n)*43758.5453); }"+
    "void main(){ float r=length(vU); if(r>1.) discard; float a=atan(vU.y,vU.x); float N=13.;"+
    " float id=floor((a+3.1416)/6.2832*N); float fa=fract((a+3.1416)/6.2832*N)-.5;"+
    " float wob=(h(id+s)-.5)*.5+sin(r*14.+id*2.)*.12;"+                       // 금이 삐뚤빼뚤
    " float len=.55+.45*h(id*7.1+s);"+                                         // 금 길이 제각각
    " float w=(.05+.05*(1.-r))*(1.-r*.6);"+
    " float crack=(1.-smoothstep(w*.4,w,abs(fa-wob*(r*.8))))*step(r,len*k)*smoothstep(0.,.12,r);"+
    " float br=fract((a+3.1416)/6.2832*N*2.+.25)-.5; float crack2=(1.-smoothstep(.02,.06,abs(br-(h(id+3.)-.5)*.6*r)))*step(.35,r)*step(r,len*k*.8)*.7;"+ // 곁가지 금
    " float c=max(crack,crack2);"+
    " float burn=(1.-smoothstep(0.,.55*k,r))*.55;"+                            // 가운데 그을림
    " float edge=smoothstep(k-.12,k-.02,r)*(1.-smoothstep(k-.02,k+.02,r))*(1.-f);"+ // 퍼지는 빛 테두리
    " vec3 hot=mix(col,vec3(1.,.95,.75),.55);"+
    " vec3 C=mix(vec3(.08,.05,.04),mix(col,hot,(1.-r)*.6),clamp(c+edge,0.,1.));"+
    " float glow=(c*(1.-f*.85)+edge);"+
    " float A=clamp(burn*(1.-f*.5)+c*.95+edge*.8,0.,1.)*(1.-smoothstep(.75,1.,f));"+
    " gl_FragColor=vec4(C*(1.+glow*.6),A); }";
  const DVS="varying vec2 vU; varying float vY; void main(){ vU=uv; vY=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }";
  const DFS="uniform float t; uniform float f; uniform vec3 col; uniform float add; varying vec2 vU; varying float vY;"+
    "float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }"+
    "float n2(vec2 p){ vec2 i=floor(p),q=fract(p); q=q*q*(3.-2.*q); return mix(mix(h(i),h(i+vec2(1,0)),q.x),mix(h(i+vec2(0,1)),h(i+1.),q.x),q.y); }"+
    "void main(){ float v=vU.y; vec2 p=vec2(vU.x*10.,v*3.-t*2.2);"+
    " float n=n2(p)*.6+n2(p*2.3+7.)*.4;"+
    " float a=(1.-v)*(1.-v)*smoothstep(0.,.08,v)*smoothstep(.12,.6,n+.2*(1.-v));"+
    " a*=add>.5?(.55+.45*sin(vU.x*62.83+t*6.)):1.;"+
    " a*=(1.-f);"+
    " gl_FragColor=vec4(col*(add>.5?1.4:mix(.85,1.15,n)),a*(add>.5?.75:.85)); }";
  function mk(){ const crack=new THREE.Mesh(PGEO,new THREE.ShaderMaterial({uniforms:{k:{value:0},f:{value:0},s:{value:0},col:{value:new THREE.Color()}},vertexShader:CVS,fragmentShader:CFS,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    crack.rotation.x=-Math.PI/2; crack.renderOrder=3;
    const dust=new THREE.Mesh(CGEO,new THREE.ShaderMaterial({uniforms:{t:{value:0},f:{value:0},col:{value:new THREE.Color(.62,.55,.47)},add:{value:0}},vertexShader:DVS,fragmentShader:DFS,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
    const beam=new THREE.Mesh(CGEO,new THREE.ShaderMaterial({uniforms:{t:{value:0},f:{value:0},col:{value:new THREE.Color()},add:{value:1}},vertexShader:DVS,fragmentShader:DFS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
    [crack,dust,beam].forEach(o=>{ o.userData.noOutline=true; o.userData.noLod=true; o.frustumCulled=false; o.visible=false; scene.add(o); });
    return {crack,dust,beam,t:9,d:2.6,on:false}; }
  function get(){ let s=SETS.find(o=>!o.on); if(s) return s; if(SETS.length<(ECO()?2:3)){ s=mk(); SETS.push(s); return s; } return SETS.reduce((a,b)=>a.t>b.t?a:b); }
  function dustCol(x,z){ // 땅 색에 맞춘 흙먼지(눈밭은 회청색, 모래는 누런색)
    const r=typeof G!=="undefined"?G.realm:0; return r===1?new THREE.Color(.58,.62,.7):r===2?new THREE.Color(.72,.6,.42):new THREE.Color(.6,.52,.43); }
  function play(m,kind){ if(!m||!m.mesh||typeof P==="undefined") return; const dd=Math.hypot(m.x-P.x,m.z-P.z); if(dd>45) return;
    const col=kind==="world"?0xb07cff:kind==="boss"?0xff5a2a:0xffc83a; const R=kind==="world"?8.5:kind==="boss"?6.5:4.2;
    const s=get(); s.on=true; s.t=0; s.d=kind==="elite"?2.1:2.8; s.R=R; s.kind=kind; s.x=m.x; s.z=m.z; const y=hAt(m.x,m.z);
    s.crack.material.uniforms.col.value.set(col); s.crack.material.uniforms.s.value=Math.random()*50; s.crack.position.set(m.x,y+.14,m.z); s.crack.scale.setScalar(R);
    s.dust.material.uniforms.col.value.copy(dustCol(m.x,m.z)); s.dust.position.set(m.x,y,m.z); s.beam.position.set(m.x,y,m.z); s.beam.material.uniforms.col.value.set(col);
    [s.crack,s.dust,s.beam].forEach(o=>o.visible=true);
    m._rise=kind==="elite"?.5:.7; m._riseD=m._rise;
    try{ fxSpark(m.x,.6,m.z,kind==="elite"?0xd9b070:0x9a8170,kind==="elite"?10:18); }catch(e){}
    try{ fxRing(m.x,m.z,col,R*1.6,.6); }catch(e){}
    P.shake=Math.max(P.shake||0,kind==="elite"?.25:kind==="boss"?.6:.9);
    try{ if(typeof tone==="function"){ tone(kind==="elite"?70:48,.45,"sawtooth",0,.12); tone(kind==="elite"?110:80,.3,"triangle",.08,.1); } }catch(e){} }
  function tick(dt){ for(const s of SETS){ if(!s.on) continue; s.t+=dt; const t=s.t, d=s.d;
      if(t>=d){ s.on=false; [s.crack,s.dust,s.beam].forEach(o=>o.visible=false); continue; }
      const k=Math.min(1,t/.35), ek=1-Math.pow(1-k,3); const f=Math.max(0,(t-d*.45)/(d*.55));
      const cu=s.crack.material.uniforms; cu.k.value=ek; cu.f.value=f;
      const rise=Math.min(1,t/.5), er=1-Math.pow(1-rise,2); const H=s.kind==="elite"?6:s.kind==="boss"?9:13;
      const du=s.dust.material.uniforms; du.t.value=t; du.f.value=Math.min(1,Math.max(0,(t-.5)/(d-.5))*1.2); s.dust.scale.set(s.R*(.35+.35*er),H*(.4+.6*er),s.R*(.35+.35*er));
      const bu=s.beam.material.uniforms; bu.t.value=t; bu.f.value=Math.min(1,t/(d*.7)); const bw=s.R*.16*(1-bu.f.value*.6); s.beam.scale.set(bw,H*1.5*er,bw); } }
  // 괴물이 땅속에서 솟아오름: 모습만(위치는 tickMobs 가 매 장 다시 정한 뒤 여기서 살짝 내림)
  if(typeof HITF!=="undefined"&&HITF.apply){ const _ap=HITF.apply; HITF.apply=function(m,dt){ const r=_ap.apply(this,arguments);
      if(m&&m._rise>0){ m._rise-=dt; const k=1-Math.max(0,m._rise)/m._riseD; const e=1-Math.pow(1-k,3); const h=(m.mesh.userData.h||3)*(m.scale||1);
        m.mesh.position.y-=h*.9*(1-e); const sq=k<1?1+.12*Math.sin(k*Math.PI):1; m.mesh.scale.x*=1/Math.sqrt(sq); m.mesh.scale.z*=1/Math.sqrt(sq); m.mesh.scale.y*=sq; }
      return r; }; }
  // 감싸기: 보스(spawnMob boss) · 정예(makeElite — 이벤트 정예도 위치 정한 뒤 부르므로 자리 맞음)
  const _sp=spawnMob; spawnMob=function(rg,boss,world){ const m=_sp.apply(this,arguments); if(m&&boss) try{ play(m,world?"world":"boss"); }catch(e){} return m; };
  if(typeof makeElite==="function"){ const _me=makeElite; makeElite=function(m){ const was=m&&m.elite; const r=_me.apply(this,arguments); if(m&&!was&&m.elite) try{ play(m,"elite"); }catch(e){} return r; }; }
  XTICK.push(tick);
  return {play,SETS};
})();
</script>
