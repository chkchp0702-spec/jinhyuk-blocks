<script>
/* ================= v177: 인도 들판 한낮 아지랑이(열기 일렁임) =================
   - 인도 들판 맑은 한낮(해가 높을 때)에 내 둘레 땅(3~14m) 여기저기서 뜨거운 공기가 피어오름:
     투명한 따뜻한 빛 기둥 속에 구불구불한 열기 줄 2~3가닥이 위로 흔들리며 올라가다 사라짐(만화 속 "뜨거워~" 물결 줄처럼).
   - 한 자리에서 3~5초 피어올랐다 옅어지면 다른 자리에서 다시 피어오름. 바람 부는 날은 비스듬히 빠르게.
   - 노을·밤·비·폭풍·수도·미궁·집·놀이마당 안·죽었을 땐 사라짐. 카메라 바로 앞은 흐리게(얼굴 가리지 않음).
   - 「그래픽: 높음」일 때만. Points 1묶음(그리기 +1), 움직임·모양은 전부 셰이더. PointLight 없음. 보기만. */
const HAZE=(function(){
  if(typeof HIGH!=="function"||!HIGH()) return {tick(){},pts:null,uA:{value:0}};
  const N=ECO()?20:28, R=13;
  const uT={value:0}, uA={value:0}, uC={value:new THREE.Vector3()}, uH={value:800}, uW={value:1};
  const g=new THREE.BufferGeometry(); const p=new Float32Array(N*3), sd=new Float32Array(N*4);
  for(let i=0;i<N;i++){ p[i*3]=rnd(-R,R); p[i*3+1]=0; p[i*3+2]=rnd(-R,R); sd[i*4]=rnd(0,1); sd[i*4+1]=rnd(.75,1.25); sd[i*4+2]=rnd(0,6.28); sd[i*4+3]=rnd(.8,1.25); }
  g.setAttribute("position",new THREE.BufferAttribute(p,3)); g.setAttribute("sd",new THREE.BufferAttribute(sd,4));
  const m=new THREE.ShaderMaterial({uniforms:{t:uT,a:uA,c:uC,uH,w:uW},transparent:true,depthWrite:false,fog:false,
    vertexShader:`uniform float t,uH,w; uniform vec3 c; attribute vec4 sd; varying float vL,vS,vB,vN,vW;
      float h1(float n){ return fract(sin(n*91.7)*43758.5); }
      void main(){ float cyc=t*.24*sd.y+sd.x; float k=floor(cyc); vL=fract(cyc); vS=sd.z+k*1.7; vW=w;
        vec2 jump=vec2(h1(k+sd.z),h1(k*1.3+sd.z*2.))*${2*R}.-${R}.; /* 한 번 피어오를 때마다 자리 바꿈 */
        vec2 l=mod(position.xz+jump-c.xz+${R}.,${2*R}.)-${R}.;
        float d=length(l); vB=smoothstep(${R}.,${R-3}.,d)*smoothstep(2.5,4.5,d);
        float sz=3.4*sd.w; vec3 q=vec3(c.x+l.x, c.y+sz*.42, c.z+l.y);
        vec4 mv=modelViewMatrix*vec4(q,1.); vN=smoothstep(3.,7.,-mv.z);
        gl_Position=projectionMatrix*mv; gl_PointSize=sz*projectionMatrix[1][1]*uH*.5/max(.6,-mv.z); }`,
    fragmentShader:`uniform float t,a; varying float vL,vS,vB,vN,vW;
      void main(){ vec2 q=gl_PointCoord-.5; float y=.5-q.y; /* 0=아래(땅) 1=위 */
        float life=sin(vL*3.14159); life*=life;
        float lean=(vW-1.)*.12*y; float xx=q.x-lean;
        float body=smoothstep(.3,.0,abs(xx+sin(y*6.+t*2.+vS)*.05))*smoothstep(0.,.12,y)*pow(1.-y,1.4); /* 투명한 열기 기둥 */
        float ln=0.;
        for(int i=0;i<3;i++){ float fi=float(i); float x0=(fi-1.)*.13+sin(vS+fi*2.1)*.02;
          float wav=sin(y*15.-t*5.5+fi*2.3+vS)*.045*(.4+y);
          float dx=abs(xx-x0-wav); float seg=smoothstep(.15,.55,sin(y*7.5-t*3.2+fi*1.9+vS)); /* 위로 흘러가는 토막 */
          ln=max(ln,smoothstep(.05,.018,dx)*seg*smoothstep(.06,.2,y)*smoothstep(.92,.55,y)); }
        float o=a*vB*vN*life*(body*.2+ln*.8); if(o<.01) discard;
        vec3 col=mix(vec3(1.,.88,.62),vec3(.98,.46,.12),ln); /* 기둥은 옅은 노랑, 열기 줄은 주황 */
        gl_FragColor=vec4(col,min(.75,o)); }`});
  const pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.renderOrder=4; pts.userData.noOutline=true; pts.userData.cullR=-1; pts.userData.noLod=true; pts.visible=false; scene.add(pts);
  function tick(dt,realmIdx,center,hidden){ uT.value+=dt; const day=DAY.d==null?1:DAY.d; const hot=clamp((day-.78)/.18,0,1);
    const wt=WEATHER.type, ok=!hidden&&!center&&!P.dead&&realmIdx===2&&(wt==="clear"||wt==="wind"||wt==="gold");
    uA.value+=((ok?hot:0)-uA.value)*Math.min(1,dt*.6); uW.value+=((wt==="wind"?2.6:1)-uW.value)*Math.min(1,dt*.5);
    pts.visible=uA.value>.02; if(!pts.visible) return;
    uC.value.set(P.x,P.gy||hAt(P.x,P.z),P.z); try{ uH.value=renderer.domElement.height; }catch(e){} }
  const _o=ATMO.tick; ATMO.tick=function(dt,realmIdx,center,hidden){ const r=_o.apply(this,arguments); try{ tick(dt,realmIdx,center,hidden); }catch(e){} return r; };
  return {tick,pts,uA};
})();
</script>
