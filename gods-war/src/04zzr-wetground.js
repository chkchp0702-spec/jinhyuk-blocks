<script>
/* ================= 비 오면 땅이 젖어 반짝 (v129) =================
   비·폭풍·황금비가 오면 땅이 몇 초에 걸쳐 촉촉하게 젖어 살짝 어두워지고,
   군데군데 생긴 웅덩이(자리 고정 무늬)에는 하늘빛이 비치고 해 쪽으로 볼 땐 반짝 빛남.
   비스듬히 멀리 볼수록 땅 전체가 은은히 하늘빛을 띰(젖은 아스팔트처럼). 비가 그치면 천천히 마름.
   황금비는 금빛으로 비침. 눈·눈보라·모래바람·미궁·집 안은 안 젖음.
   땅 셰이더 안에서 계산(CLOUDSHADE 와 같은 방식) → 그리기 호출·폴리곤 그대로, PointLight 없음. 그래픽 「높음」만(절약 모드도 셰이더 계산 몇 줄뿐). 모습만. */
const WETG=(()=>{
  const U={uWet:{value:0},uSkyW:{value:new THREE.Color(.7,.8,.95)},uSunW:{value:new THREE.Vector3(.5,.8,.3)},uSunC:{value:new THREE.Color(1,.95,.85)}};
  const on=HIGH();
  const GL=`uniform float uWet; uniform vec3 uSkyW; uniform vec3 uSunW; uniform vec3 uSunC; varying vec3 vWW; varying vec3 vWN;
float wgH(vec2 p){ return fract(sin(dot(p,vec2(41.7,289.3)))*15731.743); }
float wgN(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(wgH(i),wgH(i+vec2(1,0)),f.x),mix(wgH(i+vec2(0,1)),wgH(i+vec2(1,1)),f.x),f.y); }
`;
  const FR=`if(uWet>.001){ vec3 V=normalize(cameraPosition-vWW); vec3 N=normalize(vWN);
  float flat1=smoothstep(.82,.97,N.y);                                     // 비탈은 물이 안 고임
  float n=wgN(vWW.xz*.26)*.65+wgN(vWW.xz*.71+3.1)*.35;
  float pud=smoothstep(.6,.655,n)*flat1*smoothstep(.35,1.,uWet);           // 웅덩이 자리(고정 무늬)
  float rim=smoothstep(.55,.6,n)*(1.-pud)*flat1;                          // 웅덩이 둘레 진한 젖은 띠
  float dk=1.-uWet*(.2+.16*rim+.42*pud);                                            // 젖으면 어두워짐
  reflectedLight.directDiffuse*=dk; reflectedLight.indirectDiffuse*=dk;
  float fres=pow(1.-clamp(dot(V,N),0.,1.),4.);
  vec3 R=reflect(-V,vec3(0.,1.,0.));
  float glint=pow(max(dot(R,normalize(uSunW)),0.),pud>.5?1400.:300.);          // 해 반짝(웅덩이는 날카롭게)
  reflectedLight.indirectDiffuse+=uSkyW*uWet*(fres*(.06+.14*pud)+pud*.022)+uSunC*glint*uWet*(.05+.7*pud);
}
`;
  function patch(m){ if(!m||m.userData.wetg||!(m.isMeshStandardMaterial||m.isMeshLambertMaterial)) return; m.userData.wetg=1; const prev=m.onBeforeCompile, prevKey=m.customProgramCacheKey;
    m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); Object.assign(sh.uniforms,U);
      sh.vertexShader="varying vec3 vWW; varying vec3 vWN;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nvWW=(modelMatrix*vec4(transformed,1.)).xyz; vWN=normalize(mat3(modelMatrix)*objectNormal);");
      sh.fragmentShader=GL+sh.fragmentShader.replace("#include <aomap_fragment>",FR+"#include <aomap_fragment>"); };
    m.customProgramCacheKey=function(){ return (prevKey?prevKey.call(this):"")+"wg1"; }; m.needsUpdate=true; }
  if(on){ try{ TERRAIN.traverse(o=>{ if(o.isMesh) patch(o.material); });
      scene.children.forEach(o=>{ if(!o.isMesh||!o.geometry) return; const t=o.geometry.type; if((t==="CircleGeometry"||t==="RingGeometry")&&Math.abs(o.rotation.x+Math.PI/2)<.01&&o.position.y<.2) patch(o.material); }); }catch(e){} }
  let wet=0; const tmp=new THREE.Vector3(), gold=new THREE.Color(1,.8,.35);
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on)||(typeof xzOn==="function"&&!!xzOn()); }
  function tick(dt){ if(!on) return; const w=(typeof WEATHER!=="undefined")?WEATHER.type:"clear"; const raining=(w==="rain"||w==="storm"||w==="gold")&&!indoor();
    wet+=((raining?1:0)-wet)*Math.min(1,dt*(raining?.22:indoor()?3:.06)); if(wet<.002) wet=0; U.uWet.value=wet; if(!wet) return;
    U.uSkyW.value.copy(SKY.bot).lerp(SKY.top,.35); if(w==="gold") U.uSkyW.value.lerp(gold,.6);
    tmp.copy(sun.position).sub(sun.target.position).normalize(); U.uSunW.value.copy(tmp);
    U.uSunC.value.copy(sun.color).multiplyScalar(Math.min(1.4,sun.intensity)); }
  XTICK.push(tick);
  return {U,on,get wet(){ return wet; },patch};
})();
</script>
