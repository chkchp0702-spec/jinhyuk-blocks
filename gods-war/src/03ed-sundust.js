<script>
/* ================= v159 에덴 들판 햇살 속 금빛 빛가루 =================
   - 에덴 들판 맑은 낮에 무릎~머리 높이로 금빛 빛가루(햇살 먼지)가 천천히 떠다니며 반짝반짝 깜빡임.
   - 몇 개는 작은 십자 별빛이 번쩍, 노을엔 주황빛으로 물듦. 비·폭풍·밤엔 사라짐(밤엔 03m 반딧불이 대신).
   - 수도·미궁·집·놀이마당 안·죽었을 땐 숨음. 카메라 바로 앞은 흐리게(얼굴 가리지 않음).
   - Points 1묶음(그리기 1번), 진한 호박색 테 + 밝은 속(흰 땅에서도 보이게) — 움직임·깜빡임은 셰이더. PointLight 없음. 보기만. */
const SUNDUST=(function(){
  const N=HIGH()?(ECO()?60:90):36, R=13;
  const uT={value:0}, uA={value:0}, uC={value:new THREE.Vector3()}, uH={value:800}, uW={value:1}, uCol={value:new THREE.Color(1,.82,.38)};
  const g=new THREE.BufferGeometry(); const p=new Float32Array(N*3), sd=new Float32Array(N*4);
  for(let i=0;i<N;i++){ p[i*3]=rnd(-R,R); p[i*3+1]=rnd(.25,2.8); p[i*3+2]=rnd(-R,R); sd[i*4]=rnd(0,6.28); sd[i*4+1]=rnd(.6,1.4); sd[i*4+2]=rnd(.6,1.5); sd[i*4+3]=i%4===0?1:0; }
  g.setAttribute("position",new THREE.BufferAttribute(p,3)); g.setAttribute("sd",new THREE.BufferAttribute(sd,4));
  const m=new THREE.ShaderMaterial({uniforms:{t:uT,a:uA,c:uC,uH,w:uW,col:uCol},transparent:true,depthWrite:false,
    vertexShader:`uniform float t,uH,w; uniform vec3 c; attribute vec4 sd; varying float vB,vTw,vSt,vN; void main(){
      float sp=sd.y; vec2 dir=normalize(vec2(1.,.5));
      vec2 l=mod(position.xz+dir*t*.18*w*sp-c.xz+${R}.,${2*R}.)-${R}.;
      float y=position.y+sin(t*.45*sp+sd.x)*.35+t*.05*sp; y=mod(y-.2,2.8)+.2; /* 아주 천천히 피어오름 */
      vec3 q=vec3(c.x+l.x+sin(t*.6*sp+sd.z)*.5, c.y+y, c.z+l.y+cos(t*.5*sp+sd.x)*.5);
      vB=smoothstep(${R}.,${R-4}.,length(l))*smoothstep(.2,.6,y)*smoothstep(3.,2.4,y);
      float tw=sin(t*2.3*sd.z+sd.x*5.); vTw=.6+.4*pow(tw*.5+.5,2.); vSt=sd.w*smoothstep(.75,1.,tw);
      vec4 mv=modelViewMatrix*vec4(q,1.); vN=smoothstep(1.5,4.,-mv.z);
      gl_Position=projectionMatrix*mv; gl_PointSize=(.75+sd.w*.4)*(1.+vSt*.9)*projectionMatrix[1][1]*uH*.5/max(.6,-mv.z); }`,
    fragmentShader:`uniform float a; uniform vec3 col; varying float vB,vTw,vSt,vN;
      void main(){ vec2 q=gl_PointCoord-.5; float r=length(q);
        float core=smoothstep(.11,.035,r), glow=pow(smoothstep(.45,.0,r),1.6)*.85;
        float star=vSt*(smoothstep(.035,.0,abs(q.x))+smoothstep(.035,.0,abs(q.y)))*smoothstep(.5,.08,r);
        float o=a*vB*vN*(max(core,glow)*vTw+star); if(o<.01) discard;
        vec3 c=mix(col*mix(.8,1.,core),vec3(1.,.97,.8),clamp(core+star*.6,0.,1.)); gl_FragColor=vec4(c,min(1.,o)); }`});
  const pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.renderOrder=4; pts.userData.noOutline=true; pts.userData.cullR=-1; pts.userData.noLod=true; pts.visible=false; scene.add(pts);
  const GOLD=new THREE.Color(1,.68,.16), DUSK=new THREE.Color(1,.45,.15), T=new THREE.Color();
  function tick(dt,realmIdx,center,hidden){ uT.value+=dt; const day=DAY.d==null?1:DAY.d; const df=clamp((day-.5)/.25,0,1);
    const wt=WEATHER.type, bad=wt==="rain"||wt==="storm"||wt==="blizzard"||wt==="snow"||wt==="fog";
    const ok=!hidden&&!center&&!bad&&!P.dead&&realmIdx===0;
    uA.value+=((ok?df:0)-uA.value)*Math.min(1,dt*.7); uW.value+=((wt==="wind"?3:1)-uW.value)*Math.min(1,dt*.5);
    pts.visible=uA.value>.02; if(!pts.visible) return;
    T.copy(GOLD); if(day<.8) T.lerp(DUSK,clamp((.8-day)/.25,0,1)); uCol.value.lerp(T,Math.min(1,dt));
    uC.value.set(P.x,P.gy||hAt(P.x,P.z),P.z); try{ uH.value=renderer.domElement.height; }catch(e){} }
  const _o=ATMO.tick; ATMO.tick=function(dt,realmIdx,center,hidden){ const r=_o.apply(this,arguments); try{ tick(dt,realmIdx,center,hidden); }catch(e){} return r; };
  return {tick,pts};
})();
</script>
