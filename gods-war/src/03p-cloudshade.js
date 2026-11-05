<script>
/* v63: 구름 그림자 — 큰 구름 그늘이 땅 위를 천천히 흘러감(그래픽 높음만 · 절약 모드는 단순 무늬, 땅 셰이더 안에서 계산 → 그리기 호출·폴리곤 그대로).
   해가 비추는 빛(직사광)만 가리므로 하늘빛은 남아 자연스럽고, 밤·던전·집 안에선 꺼짐. 흐린 날씨면 구름이 더 많아짐. */
const CLOUDSHADE=(function(){
  const U={uCS:{value:0},uCov:{value:.5},uWind:{value:new THREE.Vector2(0,0)}};
  const on=HIGH(), lite=ECO();   // 배터리 절약 모드는 구름 무늬를 더 단순하게(소음 2겹)
  const GL=`uniform float uCS; uniform float uCov; uniform vec2 uWind; varying vec2 vCW;
float csH(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float csN(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(csH(i),csH(i+vec2(1,0)),f.x),mix(csH(i+vec2(0,1)),csH(i+vec2(1,1)),f.x),f.y); }
float cloudShade(vec2 w){ vec2 p=(w+uWind)*.022; float n=csN(p)*.68+csN(p*2.3+5.2)*.32;
#ifndef CS_LITE
 n=n*.9+csN(p*5.1+9.7)*.1;
#endif
 float c=smoothstep(uCov,uCov+.16,n); return 1.-c*uCS; }
`;
  function patch(m){ if(!m||m.userData.cs||!(m.isMeshStandardMaterial||m.isMeshLambertMaterial)) return; m.userData.cs=1; const prev=m.onBeforeCompile;
    m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); Object.assign(sh.uniforms,U);
      sh.vertexShader="varying vec2 vCW;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nvCW=(modelMatrix*vec4(transformed,1.)).xz;");
      sh.fragmentShader=(lite?"#define CS_LITE\n":"")+GL+sh.fragmentShader.replace("#include <aomap_fragment>","{ float cs=cloudShade(vCW); reflectedLight.directDiffuse*=cs; reflectedLight.directSpecular*=cs; }\n#include <aomap_fragment>"); };
    m.customProgramCacheKey=function(){ return "cs1"+(lite?"l":""); }; m.needsUpdate=true; }
  if(on){ try{ TERRAIN.traverse(o=>{ if(o.isMesh) patch(o.material); });
      /* 수도 광장·마을 땅 원반도 같이(땅에 붙은 납작한 동그라미·고리만) */
      scene.children.forEach(o=>{ if(!o.isMesh||!o.geometry) return; const t=o.geometry.type; if((t==="CircleGeometry"||t==="RingGeometry")&&Math.abs(o.rotation.x+Math.PI/2)<.01&&o.position.y<.2) patch(o.material); }); }catch(e){} }
  let cs=0, cov=.5;
  function tick(dt,indoor){ if(!on) return; U.uWind.value.x-=dt*2.6; U.uWind.value.y-=dt*1.1; if(U.uWind.value.x<-9000) U.uWind.value.set(0,0);
    const d=(typeof DAY!=="undefined"&&DAY.d!=null)?DAY.d:1; const w=(typeof WEATHER!=="undefined")?WEATHER.type:"clear";
    const tc=w==="clear"?.5:w==="gold"?.6:w==="wind"?.46:.36;            // 흐린 날은 구름이 더 많이 덮음
    const ts=indoor?0:clamp((d-.5)/.35,0,1)*(w==="storm"||w==="blizzard"?.3:w==="rain"||w==="snow"?.38:.46);
    const k=Math.min(1,dt*.8); cs+=(ts-cs)*k; cov+=(tc-cov)*k; U.uCS.value=cs; U.uCov.value=cov; }
  return {tick,U,on,patch};
})();
</script>
