<script>
/* ================= v169 친구 이름표 옆 작은 얼굴 초상 =================
   - 가까이 있는 친구(PEERS) 2명까지 이름표 맨 앞에 동그란 얼굴 초상(그 친구 3D 캐릭터를 앞에서 비스듬히 찍은 것) + 세계 색 금속 고리.
   - 내 초상(04zz-portrait.js)과 같은 방식: 화면 구석 작은 칸에 그 친구 몸만(층 8) 한 번 그려 복사 → 메인 그림이 바로 덮어씀.
   - 자주 안 찍음: 처음 가까워질 때 + 6초마다 한 명씩(절약 모드는 모습이 바뀔 때·20초마다). 창 열림·미궁 중엔 안 찍음.
   - placeLabel 을 감싸 친구 이름표 글자(html)에만 <img> 를 끼움 — 05-net.js·메시지 형식 그대로, 보기만. */
(function(){
  if(typeof placeLabel!=="function"||typeof THREE==="undefined") return;
  const st=document.createElement("style");
  st.textContent=`.ppor{position:relative;display:inline-block;width:26px;height:26px;margin:0 4px 0 0;vertical-align:-8px;border-radius:50%;padding:2px;box-sizing:border-box;
  background:conic-gradient(from 210deg,#ffe7a0,var(--c1) 25%,#a8741c 50%,#fff6d0 62%,var(--c1) 80%,#ffe7a0);box-shadow:0 2px 0 rgba(10,5,2,.6),0 0 6px rgba(0,0,0,.5)}
.ppor.foe{background:conic-gradient(from 210deg,#ffc0b0,var(--c1) 25%,#8a2010 50%,#ffe0d8 62%,var(--c1) 80%,#ffc0b0)}
.ppor img{display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 50% 35%,#5a4a8a,#1c1438);box-shadow:inset 0 0 0 1px rgba(0,0,0,.6)}
.ppor::after{content:"";position:absolute;inset:2px;border-radius:50%;background:linear-gradient(160deg,rgba(255,255,255,.4),rgba(255,255,255,0) 45%);pointer-events:none}
@media (orientation:landscape) and (max-height:540px){ .ppor{width:24px;height:24px;vertical-align:-7px} }`;
  document.head.appendChild(st);
  const cam=new THREE.PerspectiveCamera(30,1,.05,60), H=new THREE.Vector3(), B=new THREE.Box3();
  const cv=document.createElement("canvas"); cv.width=cv.height=64; const cx=cv.getContext("2d");
  let t=1.2, rr=0;
  function key(o){ return [o.realm,o.rank,o.lk,o.e,o.mesh&&o.mesh.uuid,o.mesh&&o.mesh.children.length].join("|"); }
  function shoot(o){ const m=o.mesh; if(!m||!renderer) return false;
    let h=3; try{ const r=m.rotation.y; m.rotation.y=0; m.updateMatrixWorld(true); B.setFromObject(m); m.rotation.y=r; m.updateMatrixWorld(true); const hh=B.max.y-m.position.y; if(hh>.5&&hh<12) h=hh; }catch(e){}
    m.getWorldPosition(H); H.y+=h*.72; const d=h*.95+.5, a=(m.rotation.y||0)+.42; cam.position.set(H.x+Math.sin(a)*d,H.y+h*.06,H.z+Math.cos(a)*d); cam.lookAt(H.x,H.y-h*.04,H.z); cam.updateProjectionMatrix();
    const pr=renderer.getPixelRatio(), sz=new THREE.Vector2(); renderer.getSize(sz); const S=Math.min(48,Math.floor(sz.y/4)); const dv=renderer.domElement;
    const vp=new THREE.Vector4(); renderer.getViewport(vp); const was=renderer.getRenderTarget(); const lights=[]; let ok=false;
    try{ m.traverse(x=>x.layers.enable(8)); scene.children.forEach(x=>{ if(x.isLight){ x.layers.enable(8); lights.push(x); } }); cam.layers.set(8);
      renderer.setRenderTarget(null); renderer.setScissorTest(true); renderer.setScissor(0,0,S,S); renderer.setViewport(0,0,S,S);
      const sm=renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate=false; const cc=new THREE.Color(); renderer.getClearColor(cc); const ca=renderer.getClearAlpha(); const bg=scene.background, fg=scene.fog;
      renderer.setClearColor(REALMS[o.realm]?new THREE.Color(REALMS[o.realm].b||0x3a2c66).lerp(new THREE.Color(0x1c1438),.5):0x3a2c66,1); scene.background=null; scene.fog=null;
      renderer.render(scene,cam); scene.background=bg; scene.fog=fg; renderer.setClearColor(cc,ca); renderer.shadowMap.autoUpdate=sm;
      const px=Math.round(S*pr); cx.clearRect(0,0,64,64); cx.drawImage(dv,0,dv.height-px,px,px,0,0,64,64); o.__por=cv.toDataURL("image/jpeg",.8); ok=true; }
    catch(e){} finally{ renderer.setScissorTest(false); renderer.setViewport(vp); renderer.setRenderTarget(was); try{ m.traverse(x=>x.layers.disable(8)); lights.forEach(x=>x.layers.disable(8)); }catch(e){} }
    return ok; }
  const _pl=placeLabel;
  placeLabel=function(el,x,y,z,html){
    if(html!==undefined&&el&&el.__pp&&el.__pp.__pn&&el.__pp.__por){ const o=el.__pp; const k=html.lastIndexOf(o.name+" <b>"); const R=REALMS[o.realm];
      if(k>=0&&R) html=html.slice(0,k)+`<span class="ppor${o.realm!==G.realm?" foe":""}" style="--c1:${R.c1}"><img src="${o.__por}" alt=""></span>`+html.slice(k); }
    return _pl.call(this,el,x,y,z,html); };
  XTICK.push(function(dt){ if(typeof started!=="undefined"&&!started) return; t-=dt;
    const L=[]; for(const id in PEERS){ const o=PEERS[id]; if(!o) continue; if(o.lbl&&o.lbl.__pp!==o) o.lbl.__pp=o; const d=Math.hypot(o.x-P.x,o.z-P.z); o.__pn=false; if(d<30&&!o.dead&&o.mesh) L.push([d,o]); }
    L.sort((a,b)=>a[0]-b[0]); const near=L.slice(0,2).map(v=>v[1]); near.forEach(o=>o.__pn=true);
    if(!near.length||(typeof layerOpen!=="undefined"&&layerOpen)) return;
    /* 새로 가까워졌거나 모습이 바뀐 친구는 바로(0.4초 간격), 아니면 정해진 간격마다 차례로 */
    const fresh=near.find(o=>!o.__por||o.__pk!==key(o));
    if(fresh){ if(t<=0){ t=.4; fresh.__pk=key(fresh); shoot(fresh); } return; }
    if(t<=0){ t=ECO()?20:6; rr=(rr+1)%near.length; shoot(near[rr]); } });
})();
</script>
