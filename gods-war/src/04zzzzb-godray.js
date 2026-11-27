<script>
/* ================= v191: 아침 해 뜰 때 하늘 빛살(갓레이) =================
   - 해가 떠오르는 동안(8분 하루 중 약 40초) 해 쪽에서 하늘 전체로 금빛·복숭아빛 빛살이 부채처럼 퍼지고,
     빛살 사이사이엔 살짝 어두운 그늘 띠 — 반대쪽 하늘에선 빛살이 다시 모여드는 모습(반대 빛살)까지.
   - 해 둘레엔 따뜻한 아침 햇무리. 먼 산 실루엣 뒤에서 빛이 새어 나오는 느낌. 빛살은 천천히 흔들리며 바뀜.
   - 하늘 돔 셰이더 몇 줄만 → 그리기 호출·폴리곤 그대로. PointLight 없음. 그래픽 높음일 때만, 미궁·집 안 등에선 끔.
   - 비·눈보라·폭풍 날엔 구름에 가려 약하게. 모습만(시간·날씨·규칙 그대로). GODRAY.force=0~1 로 시험용 강제. */
const GODRAY=(()=>{ const U=skyMat.uniforms; U.gR={value:0};
  const fs=skyMat.fragmentShader, END="gl_FragColor=vec4(c,1.); }";
  const at=fs.lastIndexOf(END);
  if(at>0&&fs.indexOf("float vn(")>0){
    const f2=fs.slice(0,at).replace("uniform float cOn,","uniform float gR; uniform float cOn,");
    skyMat.fragmentShader=f2+`
  if(gR>.001 && vP.y>-.05){ vec3 vd=normalize(vP); vec3 sd=normalize(sunDir); vec3 uu=normalize(cross(sd,vec3(0.,1.,0.))+vec3(.0001)); vec3 ww=cross(uu,sd);
    vec2 q=normalize(vec2(dot(vd,uu),dot(vd,ww))+vec2(.00001)); float ct=dot(vd,sd);
    float r=vn(q*5.5+vec2(time*.035,-time*.02))*.65+vn(q*13.+vec2(-time*.05,time*.03))*.35; r=smoothstep(.38,.78,r);
    float near=max(ct,0.); float hm=1.-smoothstep(.18+.45*near,.62+.35*near,vd.y); float lo=smoothstep(-.05,.03,vd.y);
    float g=gR*hm*lo*mix(.55,1.,smoothstep(-.4,.9,ct));
    vec3 warm=mix(vec3(1.,.58,.3),vec3(1.,.8,.48),smoothstep(0.,.8,near));
    c=c*(1.-.2*g*(1.-r))+warm*r*g*.22; c+=vec3(1.,.6,.32)*pow(near,4.)*.2*gR*lo+vec3(1.,.78,.5)*pow(near,24.)*.3*gR; }
  `+END+fs.slice(at+END.length);
    skyMat.needsUpdate=true; }
  let cur=0;
  function tick(dt){ if(!started) return; let tgt=0;
    const on=U.cOn&&U.cOn.value>.3, hq=typeof HIGH==="function"&&HIGH();
    if(on&&hq){ const L=typeof DAY!=="undefined"?DAY.len:480, a=((Date.now()/1000)%L)/L*Math.PI*2, el=Math.sin(a);
      if(Math.cos(a)>0) tgt=smoothstep(-.14,.02,el)*(1-smoothstep(.2,.44,el));
      const w=typeof WEATHER!=="undefined"?WEATHER.type:"clear"; tgt*=w==="storm"||w==="blizzard"?.25:w==="rain"||w==="snow"?.5:1; }
    if(GODRAY.force!=null&&on) tgt=GODRAY.force;
    cur+=(tgt-cur)*Math.min(1,dt*1.5); if(cur<.002&&tgt===0) cur=0; U.gR.value=cur; }
  function smoothstep(a,b,x){ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
  XTICK.push(tick);
  return {tick,force:null,U};
})();
</script>
