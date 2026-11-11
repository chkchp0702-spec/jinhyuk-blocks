<script>
/* ================= v108: 🔋 배터리 3차 대수술 (절약 모드에서만) =================
   잰 것(844×390 가로, 들판): 한 장에 그리기 호출 509번·삼각형 23만 개 — v37(99~141번) 뒤로 그래픽이 70번 넘게 더해지며 다시 늘어남.
   ① 작아서 안 보이는 것은 안 그림(PWR.lod): 화면에서 지름 약 5픽셀보다 작게 보이거나 안개 너머에 있는 물체는 하나하나 빼고 그림.
      세상 곳곳에 흩어진 알·고리·구슬·포스터처럼 한 묶음으로 넓게 퍼진 것도 조각마다 따짐 → 앞으로 그래픽이 더 늘어도 저절로 적용.
   ② 화면 글씨·버튼의 끝없이 도는 움직임(반짝·두근 등)은 한 번만 움직이고 멈춤 — 하나라도 돌면 3D를 쉬게 해 놓아도 화면 전체를 1초에 120번 다시 그림.
   ③ 화면 가장자리 어둡게(비네트) 겹 끔 — 매 장 화면 전체를 한 번 더 칠하던 것.
   (프레임을 화면 주사율마다 깨우지 않는 것은 06-ui.js pwSched, 초상 사진은 04zz-portrait.js) */
const PWR=(()=>{
  const S={on:ECO(),act:false,cam:new THREE.Vector3(),k:400,far:1e9,near:1e9,span:1,minPx:2.6,hid:0};
  const sph=new THREE.Sphere();
  const orig=THREE.Frustum.prototype.intersectsObject;
  THREE.Frustum.prototype.intersectsObject=function(o){
    if(!S.act||o.userData.noLod) return orig.call(this,o);
    const g=o.geometry; if(!g) return orig.call(this,o);
    if(g.boundingSphere===null) g.computeBoundingSphere();
    sph.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
    if(!this.intersectsSphere(sph)) return false;
    if(o.isInstancedMesh) return true;
    let r=sph.radius; if(g._bigBS) r=Math.max(.6,r*.4);   // 03c prepMesh 가 캐릭터 경계를 2.5배 키워 둔 것은 원래 크기로 따짐
    const d=sph.center.distanceTo(S.cam);
    const m=Array.isArray(o.material)?o.material[0]:o.material;
    if(d-sph.radius>S.far&&!(m&&m.fog===false)){ S.hid++; return false; }          // 안개가 다 덮은 곳
    if(d>r*1.5){ let px=r*S.k/d; if(!(m&&m.fog===false)&&d>S.near) px*=Math.max(0,1-(d-S.near)/S.span);   // 안개에 덮인 만큼 덜 보임
      if(px<S.minPx){ S.hid++; return false; } }                // 화면에서 너무 작음(안개 속이면 더 일찍 뺌)
    return true; };
  const rr=renderer.render.bind(renderer);
  renderer.render=function(sc,cam){
    if(S.on&&cam&&cam.isPerspectiveCamera){ S.cam.copy(cam.position); if(cam.parent) cam.getWorldPosition(S.cam);
      S.k=(innerHeight/2)/Math.tan(cam.fov*Math.PI/360)*(cam.zoom||1);
      const fg=sc&&sc.fog&&sc.fog.far?sc.fog:null; S.far=fg?fg.far+8:1e9; S.near=fg?fg.near:1e9; S.span=fg?Math.max(1,fg.far-fg.near):1; S.hid=0; S.act=true; try{ return rr(sc,cam); } finally{ S.act=false; } }
    return rr(sc,cam); };
  if(S.on){ const st=document.createElement("style");
    st.textContent=`body.eco.pwPlay *,body.eco.pwPlay *::before,body.eco.pwPlay *::after{animation-iteration-count:1!important}
body.eco.pwPlay #gnSky .st{animation-iteration-count:infinite!important}
body.eco #vignette{display:none}`;
    document.head.appendChild(st); }
  XTICK.push(()=>{ if(S.on&&started&&!document.body.classList.contains("pwPlay")) document.body.classList.add("pwPlay"); });
  return S; })();
</script>
