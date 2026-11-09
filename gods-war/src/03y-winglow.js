<script>
/* v94 밤이 되면 마을 건물 창문에 노란 불빛 — KayKit 건물 아틀라스의 창유리 칸(8x4 중 7번째 열·2번째 줄)만 발광. 그리기 호출 그대로 */
const WINGLOW={u:{value:0},cache:new Map()};
function winGlowMat(m){ if(!m||Array.isArray(m)||!m.map) return m; let c=WINGLOW.cache.get(m); if(c) return c; c=m.clone(); const prev=m.onBeforeCompile;
  c.onBeforeCompile=(sh,r)=>{ if(prev) try{ prev(sh,r); }catch(e){} sh.uniforms.uWin=WINGLOW.u; sh.uniforms.uTime=(typeof TIME!=="undefined")?TIME:{value:0};
    sh.vertexShader="varying float vWinH;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n#ifdef USE_INSTANCING\nvWinH=fract(sin(dot(instanceMatrix[3].xz,vec2(12.9898,78.233)))*43758.5453);\n#else\nvWinH=.5;\n#endif");
    sh.fragmentShader="uniform float uWin; uniform float uTime; varying float vWinH;\n"+sh.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
#ifdef USE_MAP
{ float _wm=step(.752,vUv.x)*step(vUv.x,.873)*step(.252,vUv.y)*step(vUv.y,.498); float _on=step(.18,vWinH); float _fl=.86+.14*sin(uTime*(1.3+vWinH*2.)+vWinH*40.);
  float _k=clamp(uWin,0.,1.)*_wm*_on; diffuseColor.rgb*=1.-.8*_k; totalEmissiveRadiance+=_k*_fl*mix(vec3(1.,.3,.04),vec3(1.,.62,.2),clamp(vUv.y*4.-1.,0.,1.))*1.25; }
#endif`); };
  c.customProgramCacheKey=()=>"winglow"+(m.customProgramCacheKey?m.customProgramCacheKey():""); WINGLOW.cache.set(m,c); return c; }
(function(){ if(typeof dayNight!=="function") return; const _dn=dayNight; dayNight=function(dt,center,theme){ const r=_dn.apply(this,arguments); try{ const d=(typeof DAY!=="undefined"&&DAY.d!=null)?DAY.d:1; const inDg=(typeof DG!=="undefined"&&DG&&DG.on); const n=inDg?0:clamp((.78-d)/.34,0,1); WINGLOW.u.value+=(n-WINGLOW.u.value)*Math.min(1,(dt||.016)*2); }catch(e){} return r; }; })();
</script>
