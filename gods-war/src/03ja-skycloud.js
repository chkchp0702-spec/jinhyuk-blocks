<script>
/* ================= 하늘 구름 (v106) =================
   하늘 돔(skyMat) 셰이더에 뭉게구름을 그려 넣음 — 천천히 흘러감, 해 쪽은 밝고 반대쪽은 살짝 그늘(높음만 입체감).
   노을 땐 분홍·주황빛, 밤엔 어두운 남색 구름, 비·폭풍 날엔 구름이 많고 잿빛. 세계마다 구름 양이 다름.
   그리기 호출·폴리곤 그대로(하늘 돔 셰이더 몇 줄). 미궁·집 안 등에선 끔. PointLight 없음. */
const SKYCLOUD=(()=>{
  const U=skyMat.uniforms; U.cOn={value:0}; U.cCov={value:.45}; U.cGrey={value:0}; U.cDay={value:1}; U.cSet={value:0}; U.cHq={value:1};
  skyMat.fragmentShader=`uniform vec3 top,bot,sunDir; uniform float time; uniform float cOn,cCov,cGrey,cDay,cSet,cHq; varying vec3 vP;
float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1.,0.)),f.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),f.x),f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<4;i++){ s+=a*vn(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
void main(){ float h=clamp(vP.y*1.6+.25,0.,1.); vec3 c=mix(bot,top,pow(h,.75)); float s=max(dot(vP,sunDir),0.); float ang=atan(vP.y-sunDir.y,vP.x-sunDir.x); float ray=.5+.5*sin(ang*9.+time*.3)*sin(ang*17.-time*.2);
  c+=vec3(1.,.95,.8)*pow(s,180.)*1.2+vec3(1.,.9,.7)*pow(s,8.)*.25+vec3(1.,.9,.7)*pow(s,3.)*ray*.12;
  if(cOn>.01 && vP.y>-.03){
    vec2 uv=vP.xz/(vP.y+.2)*1.25+vec2(time*.010,time*.004);
    float n=fbm(uv); float th=mix(.66,.40,cCov); float a=smoothstep(th,th+.13,n)*smoothstep(-.03,.14,vP.y)*cOn;
    vec2 sd=normalize(sunDir.xz+vec2(.0001))*.28; float n2=cHq>.5?fbm(uv+sd):n-.04; float lit=clamp(.6+(n-n2)*5.,0.,1.);
    float nt=clamp((1.-cDay)/.6,0.,1.);
    vec3 wh=mix(vec3(1.,1.,.99),vec3(1.,.70,.58),cSet); vec3 sh=mix(bot*.78+vec3(.07,.08,.12),vec3(.70,.50,.62),cSet*.7);
    vec3 cc=mix(sh,wh,lit); cc+=vec3(1.,.82,.58)*pow(s,5.)*(1.-smoothstep(th,th+.32,n))*.7;
    cc=mix(cc,cc*.55+bot*.22,cGrey); cc=mix(cc,bot*1.3+vec3(.05,.06,.11),nt*.86);
    cc=mix(bot,cc,smoothstep(-.02,.22,vP.y));
    c=mix(c,cc,a*mix(.95,.62,nt)); }
  gl_FragColor=vec4(c,1.); }`;
  skyMat.needsUpdate=true;
  const COV=[.42,.58,.36,.6], WC={rain:.78,storm:.92,blizzard:.95,snow:.72,wind:.5,gold:.4};
  function tick(off){ if(off){ U.cOn.value=Math.max(0,U.cOn.value-.05); return; } U.cOn.value=Math.min(1,U.cOn.value+.02);
    const center=Math.hypot(P.x,P.z)<70, th=P.x>=0?(P.z<0?0:2):(P.z<0?1:3); const w=typeof WEATHER!=="undefined"?WEATHER.type:"clear";
    const cov=center?.45:(WC[w]!=null?Math.max(WC[w],COV[th]):COV[th]); U.cCov.value+=(cov-U.cCov.value)*.01;
    const g=w==="storm"||w==="blizzard"?.85:w==="rain"?.55:w==="snow"?.25:0; U.cGrey.value+=(g-U.cGrey.value)*.01;
    U.cDay.value=typeof DAY!=="undefined"&&DAY.d!=null?DAY.d:1;
    const L=typeof DAY!=="undefined"?DAY.len:480, tt=((Date.now()/1000)%L)/L, el=Math.sin(tt*Math.PI*2); U.cSet.value=clamp(1-Math.abs(el)*3.2,0,1)*(el>-.2?1:0);
    U.cHq.value=(typeof HIGH==="function"&&HIGH()&&!(typeof ECO==="function"&&ECO()))?1:0; }
  const _ht=HORIZON.tick; HORIZON.tick=function(off){ _ht(off); try{ tick(off); }catch(e){} };
  return {tick};
})();
</script>
