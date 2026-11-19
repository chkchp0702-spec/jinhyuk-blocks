<script>
/* ================= v155 들판에 바람 타고 날리는 꽃잎·민들레 씨 =================
   - 인도: 분홍·자주·금잔화 주황 꽃잎이 무릎~머리 높이로 바람 따라 휘르르 날아감(하늘에서 떨어지는 03e 꽃잎과 따로, 땅 가까이).
   - 에덴: 하얀·노란 꽃잎 + 솜털 달린 민들레 씨가 천천히 둥실둥실 떠감.
   - 맑은 낮만(비·폭풍·밤엔 숨음), 바람 부는 날은 더 빠르고 많이 기울어 날림. 수도·미궁·집·놀이마당 안에선 끔.
   - Points 1묶음(그리기 1번) — 움직임·모양·뒤집힘은 전부 셰이더(매 장 CPU 계산 없음). PointLight 없음.
   - 보기만. 게임 규칙·저장과 아무 상관 없음. */
const PETALS=(function(){
  const N=HIGH()?(ECO()?44:64):28, R=14;
  const uT={value:0}, uA={value:0}, uC={value:new THREE.Vector3()}, uH={value:800}, uW={value:1}, uK={value:0};
  const g=new THREE.BufferGeometry(); const p=new Float32Array(N*3), sd=new Float32Array(N*4), col=new Float32Array(N*3);
  for(let i=0;i<N;i++){ p[i*3]=rnd(-R,R); p[i*3+1]=rnd(.15,2.6); p[i*3+2]=rnd(-R,R); sd[i*4]=rnd(0,6.28); sd[i*4+1]=rnd(.7,1.35); sd[i*4+2]=rnd(0,6.28); sd[i*4+3]=i%5<2?1:0; }
  g.setAttribute("position",new THREE.BufferAttribute(p,3)); g.setAttribute("sd",new THREE.BufferAttribute(sd,4)); g.setAttribute("color",new THREE.BufferAttribute(col,3));
  const m=new THREE.ShaderMaterial({uniforms:{t:uT,a:uA,c:uC,uH,w:uW,k:uK},transparent:true,depthWrite:false,
    vertexShader:`uniform float t,uH,w,k; uniform vec3 c; attribute vec4 sd; attribute vec3 color; varying float vB,vR,vF,vD; varying vec3 vC; void main(){
      float sp=sd.y, dn=sd.w*k; /* dn=1 이면 민들레 씨(에덴만) */
      float spd=mix(1.5,.55,dn)*w*sp; vec2 dir=normalize(vec2(1.,.35));
      vec2 l=mod(position.xz+dir*t*spd-c.xz+${R}.,${2*R}.)-${R}.;
      float gust=sin(t*.8*sp+sd.x)*.5+.5;
      float y=position.y+sin(t*1.7*sp+sd.z)*mix(.35,.18,dn)+gust*mix(.5,.25,dn)*w+dn*.4;
      vec3 q=vec3(c.x+l.x+sin(t*.9*sp+sd.z)*.6, c.y+y, c.z+l.y+cos(t*1.1*sp+sd.x)*.6);
      vB=smoothstep(${R}.,${R-4}.,length(l)); vC=color; vD=dn;
      vR=t*mix(3.2,.6,dn)*sp*(sin(sd.x)>0.?1.:-1.)+sd.z; vF=cos(t*mix(4.,.8,dn)*sp+sd.x*3.);
      vec4 mv=modelViewMatrix*vec4(q,1.); gl_Position=projectionMatrix*mv; gl_PointSize=mix(.78,.7,dn)*projectionMatrix[1][1]*uH*.5/max(.6,-mv.z); }`,
    fragmentShader:`uniform float a; varying float vB,vR,vF,vD; varying vec3 vC;
      void main(){ vec2 q=gl_PointCoord-.5; float cs=cos(vR), sn=sin(vR); q=vec2(cs*q.x-sn*q.y, sn*q.x+cs*q.y);
        vec3 c; float al;
        if(vD>.5){ /* 민들레 씨: 아래 작은 씨앗 + 위로 퍼진 솜털 우산 */
          float r=length(q-vec2(0.,-.06)); float ang=atan(q.x,-(q.y+.06));
          float ray=pow(abs(cos(ang*7.)),18.)*smoothstep(.36,.12,r)*step(r,.36)*step(abs(ang),1.75);
          float halo=smoothstep(.34,.05,r)*.35;
          float seed=smoothstep(.06,.03,length((q-vec2(0.,.2))*vec2(1.,.6)));
          float stalk=smoothstep(.018,.006,abs(q.x))*step(-.06,q.y)*step(q.y,.2);
          al=max(max(ray*.95,halo),max(seed,stalk*.8)); c=mix(vec3(1.,.99,.94),vec3(.62,.66,.72),smoothstep(.1,.34,r)*ray); c=mix(c,vec3(.5,.38,.22),max(seed,stalk));
        } else { /* 꽃잎: 끝이 둥근 물방울 모양, 뒤집힐 때 납작해짐(3D로 도는 듯) */
          float f=max(.18,abs(vF)); vec2 e=vec2(q.x/f,q.y); e.y+=.04;
          float d=dot(e/vec2(.2,.36),e/vec2(.2,.36))+e.y*1.1; if(d>1.) discard;
          float vein=smoothstep(.03,.0,abs(e.x))*.25*step(e.y,.15);
          c=mix(vC*1.12+.08,vC*.7,smoothstep(.2,1.,d)); c=mix(c,c*.75,vein); c*=(vF>0.?1.:.82); al=1.;
        }
        float o=a*vB*al; if(o<.02) discard; gl_FragColor=vec4(c,o); }`});
  const pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.renderOrder=3; pts.userData.noOutline=true; pts.userData.cullR=-1; pts.visible=false; scene.add(pts);
  const PAL={0:[0xffd23a,0xffa8c4,0xff9a3c,0xfff0a0],2:[0xff5f9e,0xff8cc0,0xd05cff,0xff9a2a,0xffc23a]};
  let lastPal=-2; const C=new THREE.Color();
  function paint(ri){ if(ri===lastPal) return; lastPal=ri; const pl=PAL[ri]; for(let i=0;i<N;i++){ C.setHex(pl[(i*7+3)%pl.length]); col[i*3]=C.r; col[i*3+1]=C.g; col[i*3+2]=C.b; } g.attributes.color.needsUpdate=true; uK.value=ri===0?1:0; }
  function tick(dt,realmIdx,center,hidden){ uT.value+=dt; const day=DAY.d==null?1:DAY.d; const df=clamp((day-.55)/.25,0,1);
    const wt=WEATHER.type, bad=wt==="rain"||wt==="storm"||wt==="blizzard"||wt==="snow";
    const ok=!hidden&&!center&&!bad&&!P.dead&&(realmIdx===0||realmIdx===2);
    uA.value+=((ok?df:0)-uA.value)*Math.min(1,dt*.7); uW.value+=((wt==="wind"?2.6:1)-uW.value)*Math.min(1,dt*.5);
    pts.visible=uA.value>.02; if(!pts.visible) return; if(realmIdx===0||realmIdx===2) paint(realmIdx);
    uC.value.set(P.x,P.gy||hAt(P.x,P.z),P.z); try{ uH.value=renderer.domElement.height; }catch(e){} }
  const _o=ATMO.tick; ATMO.tick=function(dt,realmIdx,center,hidden){ const r=_o.apply(this,arguments); try{ tick(dt,realmIdx,center,hidden); }catch(e){} return r; };
  return {tick,pts};
})();
</script>
