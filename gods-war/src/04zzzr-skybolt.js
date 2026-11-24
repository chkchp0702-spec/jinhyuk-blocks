<script>
/* ================= v174: 폭풍 날 먼 하늘 구름 속 번개 =================
   - 폭풍(올림푸스 폭풍·땅 번개 칠 때)이면 하늘 돔 구름 속이 군데군데 번쩍 — 두세 번 깜빡이며 구름 안쪽이 하얗게·보랏빛으로 밝아짐.
   - 밝은 번쩍 땐 구름에서 지평선 쪽으로 갈라지는 가는 번개 줄기도 잠깐 보임. 1~3초 뒤 멀리서 우르릉 천둥(낮고 작게).
   - 땅에 번개(원래 WEATHER.flash)가 칠 때도 하늘이 같이 번쩍. 하늘 돔 셰이더 몇 줄만 → 그리기 호출·폴리곤 그대로. PointLight 없음.
   - 미궁·집 안 등 하늘 구름이 꺼진 곳에선 안 보임. 날씨·피해·규칙 그대로(모습과 소리만). */
const SKYBOLT=(()=>{ const U=skyMat.uniforms; U.bAmp={value:0}; U.bDir={value:new THREE.Vector3(0,.3,1)}; U.bSeed={value:0}; U.bLine={value:0};
  const fs=skyMat.fragmentShader;
  if(fs.indexOf("c=mix(c,cc,a*mix(.95,.62,nt)); }")>0){
    skyMat.fragmentShader=fs.replace("uniform float cOn,","uniform float bAmp,bSeed,bLine; uniform vec3 bDir; uniform float cOn,")
      .replace("c=mix(c,cc,a*mix(.95,.62,nt)); }",`c=mix(c,cc,a*mix(.95,.62,nt));
    if(bAmp>.001){ float bd=max(dot(vP,bDir),0.); float gl=pow(bd,9.)*bAmp; float inC=a*(.55+.45*n);
      c+=vec3(.86,.84,1.)*gl*(inC*2.2+.5)+vec3(.55,.5,.85)*pow(bd,3.)*bAmp*inC*.35; }
    if(bLine>.001 && vP.y>-.02 && vP.y<bDir.y){ float az=atan(vP.z,vP.x)-atan(bDir.z,bDir.x); az=mod(az+3.14159,6.28318)-3.14159;
      float yy=(bDir.y-vP.y)*70.; float off=(vn(vec2(yy,bSeed))-.5)*.05+(vn(vec2(yy*3.1,bSeed+7.))-.5)*.02; float x=abs(az-off*(.3+(bDir.y-vP.y)*4.));
      float br=abs(az-off*.6-(bDir.y-vP.y)*(fract(bSeed*.37)>.5?.5:-.5)); float bm=step(vP.y,bDir.y-.025)*step(bDir.y-.09,vP.y);
      float ln=(exp(-x*520.)*1.4+exp(-x*110.)*.3)+exp(-br*1200.)*bm*.7; c+=vec3(.95,.92,1.)*ln*bLine*1.6*smoothstep(-.02,.06,vP.y); } }`);
    skyMat.needsUpdate=true; }
  let next=3, pulses=[], tt=0, line=0; const D=new THREE.Vector3();
  function rumble(delay,vol){ if(!soundOn||!actx) return; try{ const t=actx.currentTime+delay, len=1.8; const b=actx.createBuffer(1,actx.sampleRate*len|0,actx.sampleRate), d=b.getChannelData(0); let l=0;
      for(let i=0;i<d.length;i++){ l=l*.985+(Math.random()*2-1)*.015; const k=i/d.length; d[i]=l*6*Math.pow(1-k,1.6)*Math.min(1,k*14)*(.75+.25*Math.sin(k*23)); }
      const s=actx.createBufferSource(); s.buffer=b; const f=actx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=180; const g=actx.createGain(); g.gain.value=vol; s.connect(f).connect(g).connect(actx.destination); s.start(t); }catch(e){} }
  function strike(big){ const a=Math.random()*Math.PI*2, el=big?.05+Math.random()*.08:.04+Math.random()*.14; D.set(Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)).normalize();
    if(typeof camera!=="undefined"&&big){ /* 큰 번개는 보이는 쪽 하늘에 */ const f=new THREE.Vector3(); camera.getWorldDirection(f); f.y=0; f.normalize(); const aa=Math.atan2(f.z,f.x)+(Math.random()-.5)*1.1; D.set(Math.cos(aa)*Math.cos(el),Math.sin(el),Math.sin(aa)*Math.cos(el)).normalize(); }
    U.bDir.value.copy(D); U.bSeed.value=Math.random()*90; const A=big?1:.45+Math.random()*.3; pulses=[[0,A],[.08+Math.random()*.04,A*.55],[.2+Math.random()*.08,A*.8]]; if(Math.random()<.4) pulses.length=2;
    tt=0; line=big||Math.random()<.35?1:0; rumble(big?.9+Math.random()*.6:1.4+Math.random()*1.4,big?.55:.32); }
  let lastFlash=0;
  function tick(dt){ if(!started) return; const on=U.cOn&&U.cOn.value>.3, storm=typeof WEATHER!=="undefined"&&WEATHER.type==="storm";
    const fl=typeof WEATHER!=="undefined"?WEATHER.flash:0; if(on&&fl>.95&&lastFlash<.95&&!pulses.length) strike(true); lastFlash=fl;
    if(on&&storm){ next-=dt; if(next<=0){ next=(typeof ECO==="function"&&ECO()?2.5:1.6)+Math.random()*3.2; if(!pulses.length) strike(false); } }
    if(pulses.length){ tt+=dt; let amp=0, alive=false; for(const [t0,A] of pulses){ const k=tt-t0; if(k<0){ alive=true; continue; } const e=A*Math.exp(-k*14); amp+=e; if(e>.01) alive=true; }
      U.bAmp.value=Math.min(1.4,amp)*(on?1:0); U.bLine.value=line?Math.min(1,amp*1.3)*(on?1:0):0; if(!alive){ pulses=[]; U.bAmp.value=0; U.bLine.value=0; } } }
  XTICK.push(tick);
  return {strike,tick,U};
})();
</script>
