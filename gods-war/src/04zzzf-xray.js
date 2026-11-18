<script>
/* ================= v152 그래픽: 가려지면 내 캐릭터 윤곽이 비쳐 보임(엑스레이 실루엣) =================
   상업용 게임처럼 내 캐릭터가 나무·건물·바위 뒤로 들어가 가려지면, 가려진 부분만 하늘빛 반투명 실루엣으로 비쳐 보임 → 어디 있는지 안 잃어버림.
   방법: 몸(SkinnedMesh)마다 같은 뼈를 쓰는 그림자 몸을 하나 더 붙이고, "깊이가 더 먼 곳(=무언가 앞을 가린 곳)"에서만 그리게 함(depthFunc Greater).
   실루엣은 불투명 목록에서 내 몸보다 먼저 그려 내 몸끼리 겹친 곳엔 안 생김(발이 땅에 묻힌 곳은 살짝 당겨 무시). 몸 부품만(무기 X) → 그리기 호출 몇 개만 늘어남.
   빛·그림자·외곽선 없음, 규칙·저장 그대로 — 모습만. 죽음·탈것 때는 숨김. */
const XRAY=(()=>{ let owner=null, list=[], seen=0;
  const mat=new THREE.MeshBasicMaterial({color:0x6fcfff,transparent:false,blending:THREE.CustomBlending,blendSrc:THREE.SrcAlphaFactor,blendDst:THREE.OneMinusSrcAlphaFactor,opacity:.58,depthWrite:false,depthFunc:THREE.GreaterDepth,fog:false,skinning:true});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uT={value:0}; mat.userData.sh=sh;
    sh.vertexShader=sh.vertexShader.replace("#include <project_vertex>","#include <project_vertex>\n mvPosition.z+=.35; gl_Position=projectionMatrix*mvPosition; vVy=transformed.y;").replace("void main() {","varying float vVy;\nvoid main() {");
    sh.fragmentShader=sh.fragmentShader.replace("void main() {","uniform float uT; varying float vVy;\nvoid main() {").replace("#include <dithering_fragment>","#include <dithering_fragment>\n float sc=.82+.18*sin(vVy*9.-uT*4.); gl_FragColor.rgb*=sc; gl_FragColor.rgb+=vec3(.12,.1,.05)*(1.-sc);"); };
  function clear(){ list.forEach(m=>{ if(m.parent) m.parent.remove(m); }); list=[]; }
  function attach(){ clear(); owner=player; const src=[]; player.traverse(o=>{ if(o.isSkinnedMesh&&!o.userData.xray) src.push(o); });
    src.forEach(o=>{ const s=new THREE.SkinnedMesh(o.geometry,mat); s.bind(o.skeleton,o.bindMatrix); s.userData.xray=true; s.userData.noOutline=true; s.userData.noLod=true; s.renderOrder=9; s.frustumCulled=false; s.castShadow=false; s.receiveShadow=false; s.matrixAutoUpdate=o.matrixAutoUpdate; s.position.copy(o.position); s.quaternion.copy(o.quaternion); s.scale.copy(o.scale); o.parent.add(s); list.push(s); }); }
  /* 내 몸은 실루엣보다 나중에 그림(renderOrder 10) → 실루엣을 그릴 땐 깊이 버퍼에 내 몸이 없어서 내 몸끼리 겹친 곳엔 안 생김 */
  function lift(){ player.traverse(o=>{ if(o.isMesh&&!o.userData.xray&&!(o.material&&o.material.transparent)&&o.renderOrder<10) o.renderOrder=10; }); }
  function tick(dt){ try{ if(!started||!player){ return; } const u=player.userData; if(!u||!u.gl) return;
      if(owner!==player||((seen-=dt)<0&&!list.length)){ seen=2; attach(); lift(); } else if(seen<0){ seen=2; lift(); }
      const on=!P.dead&&!P.ride&&player.visible; list.forEach(m=>{ m.visible=on; });
      if(mat.userData.sh) mat.userData.sh.uniforms.uT.value+=dt;
    }catch(e){} }
  return {tick,get n(){ return list.length; },mat};
})();
{ const _tm=tickMixers; tickMixers=function(dt){ _tm(dt); XRAY.tick(dt); }; }
</script>
