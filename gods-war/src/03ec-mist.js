<script>
/* ================= v158 올림푸스 들판에 땅 가까이 흘러가는 구름 조각 =================
   - 올림푸스(신들의 산 위)답게 무릎~어깨 높이로 뭉게구름 조각이 천천히 흘러감. 바람 부는 날엔 더 빠르고 길게 늘어짐.
   - 폭풍엔 회색 먹구름 조각, 노을·밤엔 하늘색 따라 살짝 주황·남색으로 물듦.
   - 수도·미궁·집·놀이마당 안·죽었을 때는 숨음. 내 캐릭터 바로 앞(카메라 가까이)은 흐려져 가리지 않음.
   - Points 1묶음(그리기 1번) — 움직임·모양은 전부 셰이더. PointLight 없음. 보기만(게임 규칙·저장과 상관 없음). */
const MIST=(function(){
  const N=HIGH()?(ECO()?16:22):12, R=16;
  const uT={value:0}, uA={value:0}, uC={value:new THREE.Vector3()}, uH={value:800}, uW={value:1}, uCol={value:new THREE.Color(1,1,1)};
  const g=new THREE.BufferGeometry(); const p=new Float32Array(N*3), sd=new Float32Array(N*4);
  for(let i=0;i<N;i++){ p[i*3]=rnd(-R,R); p[i*3+1]=rnd(.9,3.2); p[i*3+2]=rnd(-R,R); sd[i*4]=rnd(0,6.28); sd[i*4+1]=rnd(.75,1.3); sd[i*4+2]=rnd(.8,1.35); sd[i*4+3]=rnd(0,1); }
  g.setAttribute("position",new THREE.BufferAttribute(p,3)); g.setAttribute("sd",new THREE.BufferAttribute(sd,4));
  const m=new THREE.ShaderMaterial({uniforms:{t:uT,a:uA,c:uC,uH,w:uW,col:uCol},transparent:true,depthWrite:false,
    vertexShader:`uniform float t,uH,w; uniform vec3 c; attribute vec4 sd; varying float vB,vS,vN; void main(){
      float spd=.55*w*sd.y; vec2 dir=normalize(vec2(1.,.3));
      vec2 l=mod(position.xz+dir*t*spd-c.xz+${R}.,${2*R}.)-${R}.;
      float y=position.y+sin(t*.35*sd.y+sd.x)*.25;
      vec3 q=vec3(c.x+l.x, c.y+y, c.z+l.y);
      vB=smoothstep(${R}.,${R-6}.,length(l)); vS=sd.w; vec4 mv=modelViewMatrix*vec4(q,1.);
      vN=smoothstep(3.,9.,-mv.z); /* 카메라 바로 앞은 흐리게 */
      gl_Position=projectionMatrix*mv; gl_PointSize=min(uH*.36, 4.4*sd.z*projectionMatrix[1][1]*uH*.5/max(1.,-mv.z)); }`,
    fragmentShader:`uniform float a,t,w; uniform vec3 col; varying float vB,vS,vN;
      float blob(vec2 q,vec2 o,float r){ return smoothstep(r,r*.6,length(q-o)); }
      void main(){ vec2 q=gl_PointCoord-.5; q.y=q.y*mix(1.9,2.5,clamp(w-1.,0.,1.)); q.x*=mix(1.,.8,clamp(w-1.,0.,1.));
        float s=vS*6.28;
        float d=blob(q,vec2(0.,.02),.3)+blob(q,vec2(-.2+.05*sin(s),.06),.2)+blob(q,vec2(.2,.04+.04*cos(s)),.22)+blob(q,vec2(.06*cos(s+t*.2),-.1),.2)*.8;
        d=clamp(d,0.,1.); float wob=.85+.15*sin(q.x*14.+s+t*.6)*sin(q.y*11.-t*.4);
        float o=a*vB*vN*d*wob*.82; if(o<.01) discard;
        vec3 c=mix(col*vec3(.58,.63,.76),col*1.06,smoothstep(-.12,.16,-q.y)); /* 윗면 밝고 아랫면 살짝 그늘 */
        gl_FragColor=vec4(c,o); }`});
  const pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.renderOrder=3; pts.userData.noOutline=true; pts.userData.cullR=-1; pts.userData.noLod=true; pts.visible=false; scene.add(pts);
  const W=new THREE.Color(1,1,1), DUSK=new THREE.Color(1,.82,.7), NIGHT=new THREE.Color(.42,.48,.66), STORM=new THREE.Color(.55,.57,.62), T=new THREE.Color();
  function tick(dt,realmIdx,center,hidden){ uT.value+=dt; const day=DAY.d==null?1:DAY.d;
    const wt=WEATHER.type, ok=!hidden&&!center&&!P.dead&&realmIdx===3;
    uA.value+=((ok?(wt==="storm"?.85:1):0)-uA.value)*Math.min(1,dt*.6); uW.value+=((wt==="wind"?2.4:wt==="storm"?1.8:1)-uW.value)*Math.min(1,dt*.5);
    pts.visible=uA.value>.02; if(!pts.visible) return;
    if(wt==="storm"||wt==="rain") T.copy(STORM); else { T.copy(W); if(day<.7) T.lerp(DUSK,clamp((.7-day)/.25,0,1)); if(day<.42) T.lerp(NIGHT,clamp((.42-day)/.2,0,1)); }
    uCol.value.lerp(T,Math.min(1,dt*.8));
    uC.value.set(P.x,P.gy||hAt(P.x,P.z),P.z); try{ uH.value=renderer.domElement.height; }catch(e){} }
  const _o=ATMO.tick; ATMO.tick=function(dt,realmIdx,center,hidden){ const r=_o.apply(this,arguments); try{ tick(dt,realmIdx,center,hidden); }catch(e){} return r; };
  return {tick,pts};
})();
</script>
