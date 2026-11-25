<script>
/* ================= v182: 들판 3D 구름 덩어리 — 폭풍 땐 먹구름, 번개 칠 때 구름 속이 번쩍 =================
   하늘에 떠 있는 3D 뭉게구름(03-core.js CLOUDS, 26덩이·재질 1개)은 늘 하얗고 멈춰 있었음.
   - 날씨 따라 색이 천천히 바뀜: 비 → 잿빛, 폭풍 → 짙은 먹구름(보랏빛 남색), 눈·눈보라 → 푸르스름한 회색. 맑으면 다시 하양.
   - 바람 따라 천천히 흘러감(폭풍·바람 날은 더 빨리), 끝까지 가면 반대편에서 다시 들어옴.
   - 하늘 번개(v174 SKYBOLT)가 칠 때 그 방향 구름들이 속부터 하얗게·보랏빛으로 번쩍(가운데가 더 밝게) — 2~3번 깜빡.
   재질 1개에 셰이더 몇 줄(onBeforeCompile) + 색 바꾸기 → 그리기 호출·폴리곤 그대로. PointLight 없음. 날씨 규칙 그대로(모습만). */
const STORMCLOUD=(()=>{
  if(typeof CLOUDS==="undefined"||!CLOUDS.length) return {};
  let mesh=null; CLOUDS[0].traverse(o=>{ if(!mesh&&o.isMesh) mesh=o; }); if(!mesh) return {};
  const M=mesh.material, U={uB:{value:0},uDir:{value:new THREE.Vector3(0,.3,1)}};
  M.onBeforeCompile=sh=>{ sh.uniforms.uB=U.uB; sh.uniforms.uDir=U.uDir;
    sh.vertexShader="varying vec3 vScW; varying float vScF;\n"+sh.vertexShader.replace("#include <project_vertex>","#include <project_vertex>\n vScW=(modelMatrix*vec4(transformed,1.)).xyz; vScF=normalize(normalMatrix*objectNormal).z;");
    sh.fragmentShader="uniform float uB; uniform vec3 uDir; varying vec3 vScW; varying float vScF;\n"+sh.fragmentShader.replace("#include <dithering_fragment>",
      "#include <dithering_fragment>\n if(uB>.001){ vec3 vd=normalize(vScW-cameraPosition); float g=pow(max(dot(vd,normalize(uDir)),0.),5.); float core=.45+.55*clamp(vScF,0.,1.);"+
      " gl_FragColor.rgb+=vec3(.9,.86,1.)*uB*g*core*1.6+vec3(.5,.42,.8)*uB*pow(max(dot(vd,normalize(uDir)),0.),2.)*.25; }"); };
  M.needsUpdate=true;
  const WHITE=new THREE.Color(0xffffff), TGT={rain:[0x8c93a3,.25],storm:[0x3f4258,.55],blizzard:[0xaab6c8,.2],snow:[0xc6d0de,.12],wind:[0xe6eaf0,.05],gold:[0xffe7b0,0]};
  const cTo=new THREE.Color(), op0=M.opacity; let fr=0, wind=1;
  XTICK.push(dt=>{ if(!started) return; const w=(typeof WEATHER!=="undefined"&&WEATHER.type)||"clear"; const t=TGT[w];
    cTo.copy(t?cTo.set(t[0]):WHITE); M.color.lerp(cTo,Math.min(1,dt*.35)); const opT=t?Math.min(.97,op0+t[1]*.25):op0; M.opacity+=(opT-M.opacity)*Math.min(1,dt*.35);
    // 하늘 번개 빛을 구름에도
    try{ const S=SKYBOLT.U; U.uB.value=S.bAmp.value||0; U.uDir.value.copy(S.bDir.value); if(WEATHER.flash>.6) U.uB.value=Math.max(U.uB.value,WEATHER.flash*.8); }catch(e){}
    // 흘러가기(절약 모드는 3장에 1번)
    const wT=w==="storm"?3.2:w==="wind"||w==="blizzard"?2.6:w==="rain"?1.6:1; wind+=(wT-wind)*Math.min(1,dt*.3);
    const eco=(typeof ECO==="function"&&ECO()); fr++; if(eco&&fr%3) return; const k=dt*(eco?3:1)*wind*1.1;
    for(const g of CLOUDS){ g.position.x+=(g.userData.v||.7)*k; g.position.z+=(g.userData.v||.7)*k*.35; if(g.position.x>275) g.position.x-=550; if(g.position.z>275) g.position.z-=550; } });
  return {U,M};
})();
</script>
