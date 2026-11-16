<script>
/* ================= v141 낮 들판의 나비 =================
   - 맑은 낮이면 내 둘레(약 12걸음 안)에 나비가 팔랑팔랑 날갯짓하며 이리저리 떠다님. 밤엔 반딧불(03m)에게 자리를 넘겨 줌.
   - 세계마다 색: 에덴 금빛·주황, 아스가르드 얼음빛·하늘색, 인도 분홍·보라, 올림푸스 하늘·흰빛. 수도엔 섞여서.
   - Points 1묶음(그리기 1번) — 날개 모양·날갯짓은 셰이더가 그림. 비·폭풍·눈보라·눈 땐 숨음. 미궁·집·사막·놀이마당 안에선 끔.
   - PointLight 없음. 그래픽 낮음 10마리, 높음 18마리(절약 모드 12). */
const BFLY=(function(){
  const N=HIGH()?(ECO()?12:18):10; const uT={value:0}, uA={value:0}, uC={value:new THREE.Vector3()}, uH={value:800};
  const g=new THREE.BufferGeometry(); const p=new Float32Array(N*3), sd=new Float32Array(N*4), col=new Float32Array(N*3);
  for(let i=0;i<N;i++){ p[i*3]=rnd(-12,12); p[i*3+1]=rnd(.5,2.1); p[i*3+2]=rnd(-12,12); sd[i*4]=rnd(0,6.28); sd[i*4+1]=rnd(.7,1.3); sd[i*4+2]=rnd(0,6.28); sd[i*4+3]=rnd(.8,1.2); }
  g.setAttribute("position",new THREE.BufferAttribute(p,3)); g.setAttribute("sd",new THREE.BufferAttribute(sd,4)); g.setAttribute("color",new THREE.BufferAttribute(col,3));
  const m=new THREE.ShaderMaterial({uniforms:{t:uT,a:uA,c:uC,uH},transparent:true,depthWrite:false,
    vertexShader:`uniform float t,uH; uniform vec3 c; attribute vec4 sd; attribute vec3 color; varying float vF,vB,vS; varying vec3 vC; void main(){
      vec2 l=mod(position.xz-c.xz+12.,24.)-12.; float sp=sd.y;
      float fl=t*(9.+3.*sp)+sd.x*5.; float w=abs(sin(fl)); vF=.18+.82*w; vS=sin(sd.z)>0.?1.:-1.;
      vec3 q=vec3(c.x+l.x+sin(t*.35*sp+sd.x)*2.2+sin(t*1.1*sp+sd.z)*.5, c.y+position.y+sin(t*.6*sp+sd.z)*.45+w*.12, c.z+l.y+cos(t*.3*sp+sd.x*1.7)*2.2+cos(t*.9*sp)*.4);
      vB=smoothstep(12.,8.,length(l)); vC=color;
      vec4 mv=modelViewMatrix*vec4(q,1.); gl_Position=projectionMatrix*mv; gl_PointSize=.85*sd.w*projectionMatrix[1][1]*uH*.5/max(.6,-mv.z); }`,
    fragmentShader:`uniform float a; varying float vF,vB,vS; varying vec3 vC;
      float el(vec2 q,vec2 c,vec2 r){ vec2 d=(q-c)/r; return dot(d,d); }
      void main(){ vec2 q=gl_PointCoord-.5; q.x*=vS; float ax=abs(q.x); float f=vF;
        float up=el(vec2(ax,q.y),vec2(.2*f,-.09),vec2(.21*f+.015,.19));
        float lo=el(vec2(ax,q.y),vec2(.15*f,.13),vec2(.15*f+.012,.13));
        float body=el(q,vec2(0.,.01),vec2(.035,.2));
        float wing=min(up,lo); if(wing>1.&&body>1.) discard;
        vec3 c=vC; float edge=smoothstep(.55,1.,wing); c=mix(c*1.1+.05,c*.22,edge); /* 날개 끝은 진한 테두리 */
        float dot1=el(vec2(ax,q.y),vec2(.24*f,-.12),vec2(.06*f+.01,.05)); c=mix(vec3(1.,.98,.9),c,smoothstep(.6,1.,dot1)); /* 하얀 점 무늬 */
        if(body<=1.) c=vec3(.12,.09,.08);
        float k=a*vB*(body<=1.?1.:.95); if(k<.01) discard; gl_FragColor=vec4(c,k); }`});
  const pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.renderOrder=3; pts.userData.noOutline=true; pts.userData.cullR=-1; pts.visible=false; scene.add(pts);
  const PAL=[[0xffb020,0xff7a2a,0xffe066],[0x6fd0ff,0x9fe8ff,0x4a8dff],[0xff6fb0,0xc77dff,0xff9ad5],[0x5fc8ff,0xfff4d0,0x7fe0c0]];
  let lastPal=-2; const C=new THREE.Color();
  function paint(ci){ if(ci===lastPal) return; lastPal=ci; for(let i=0;i<N;i++){ const pl=ci<0?PAL[i%4]:PAL[ci]; C.setHex(pl[i%pl.length]); col[i*3]=C.r; col[i*3+1]=C.g; col[i*3+2]=C.b; } g.attributes.color.needsUpdate=true; }
  function tick(dt,realmIdx,center,hidden){ uT.value+=dt; const day=DAY.d==null?1:DAY.d; const df=clamp((day-.62)/.2,0,1);
    const w=WEATHER.type, bad=w==="rain"||w==="storm"||w==="blizzard"||w==="snow";
    const want=hidden||bad||(P.dead)?0:df; uA.value+=(want-uA.value)*Math.min(1,dt*.7);
    pts.visible=uA.value>.02; if(!pts.visible) return; paint(center?-1:Math.max(0,realmIdx));
    uC.value.set(P.x,P.gy||hAt(P.x,P.z),P.z); try{ uH.value=renderer.domElement.height; }catch(e){} }
  /* 반딧불과 같은 자리(06-ui 메인 루프의 NIGHTFX.tick)에서 함께 돌림 */
  if(typeof NIGHTFX!=="undefined"){ const _nt=NIGHTFX.tick; NIGHTFX.tick=function(dt,r,c,h){ _nt(dt,r,c,h); try{ tick(dt,r,c,h); }catch(e){} }; }
  return {tick,pts};
})();
</script>
