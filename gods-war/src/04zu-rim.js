<script>
/* ================= v101 그래픽: 내 캐릭터 림라이트(가장자리 빛) — 배경 속에서 또렷이 · 그래픽 높음만(절약 모드도 내 캐릭터 한 명뿐이라 가벼움) =================
   내 캐릭터 재질만 한 번 복사해(다른 사람·괴물은 그대로) 화면 바깥쪽을 향한 가장자리에 은은한 빛을 더함. 빛·그림자·그리기 호출 늘지 않음. */
const RIM=(function(){
  const U={rimCol:{value:new THREE.Color(0xfff0c8)},rimStr:{value:.5}};
  const CACHE=new Map(); let lastP=null, n=0;
  function ok(m){ return !!m&&(m.isMeshStandardMaterial||m.isMeshLambertMaterial)&&!m.transparent; }
  function on(){ try{ return HIGH(); }catch(e){ return false; } }
  function rimMat(m){ if(!m||!ok(m)||m.userData.rim) return m; let c=CACHE.get(m); if(c) return c;
    c=m.clone(); c.userData.rim=true; const prev=m.onBeforeCompile;
    c.onBeforeCompile=function(sh,r){ if(prev) try{ prev.call(this,sh,r); }catch(e){}
      sh.uniforms.rimCol=U.rimCol; sh.uniforms.rimStr=U.rimStr;
      sh.vertexShader="varying vec3 vRimN;\nvarying vec3 vRimV;\n"+sh.vertexShader.replace("#include <project_vertex>","#include <project_vertex>\nvRimN=normalize(transformedNormal); vRimV=-mvPosition.xyz;");
      sh.fragmentShader="varying vec3 vRimN;\nvarying vec3 vRimV;\nuniform vec3 rimCol;\nuniform float rimStr;\n"+sh.fragmentShader.replace("#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\n{ float rf=1.0-clamp(abs(dot(normalize(vRimN),normalize(vRimV))),0.0,1.0); totalEmissiveRadiance+=rimCol*(smoothstep(.38,1.0,rf)*rimStr); }"); };
    c.customProgramCacheKey=function(){ return "rim1"+(m.customProgramCacheKey?m.customProgramCacheKey():""); };
    CACHE.set(m,c); return c; }
  function apply(){ if(typeof player==="undefined"||!player) return; player.traverse(o=>{ if(!o.isMesh||!o.material) return;
      if(Array.isArray(o.material)){ if(o.material.some(x=>x&&ok(x)&&!x.userData.rim)) o.material=o.material.map(rimMat); }
      else if(ok(o.material)&&!o.material.userData.rim) o.material=rimMat(o.material); }); }
  const TINT=new THREE.Color(), WARM=new THREE.Color(0xffe6b0), MOON=new THREE.Color(0xa8c8ff);
  function tick(){ if(!on()) return; try{
      if(player!==lastP||(++n%3===0)){ lastP=player; apply(); }
      const d=(typeof DAY!=="undefined"&&DAY.d!=null)?DAY.d:1;            // 밤(어두움)일수록 달빛 파랑·조금 더 진하게
      const k=Math.max(0,Math.min(1,(1-d)/.6));
      TINT.copy(WARM).lerp(MOON,k); try{ const R=RM(); if(R&&R.c1) TINT.lerp(new THREE.Color(R.c1),.3); }catch(e){}
      U.rimCol.value.copy(TINT); U.rimStr.value=(.75+.35*k)*(document.body.classList.contains("dying")?.3:1);
    }catch(e){} }
  setInterval(tick,400);
  return {U,apply,tick};
})();
</script>
