<script>
/* ================= v137 그래픽: 밤에 내 캐릭터를 비추는 달빛 =================
   밤이 되면(DAY.d 어두울수록) 내 캐릭터 발밑에 은은한 푸른 달빛 웅덩이 + 위에서 내려오는 옅은 달빛 기둥(그래픽 높음만, 절약 모드는 조금 옅게)이 서서히 켜져
   어두운 땅에서도 "나"가 묻히지 않게. 낮엔 숨김(그리기 0). 판 1장 + 열린 원뿔 1개(+2 호출, 밤에만), PointLight 없음, 규칙 그대로. */
const MOONPOOL=(function(){ let pool=null, cone=null, t=0, k=0;
  function cv(w,h,draw){ const c=document.createElement("canvas"); c.width=w; c.height=h; draw(c.getContext("2d"),w,h); return new THREE.CanvasTexture(c); }
  function init(){
    const pt=cv(128,128,(g,s)=>{ const C=s/2, rg=g.createRadialGradient(C,C,0,C,C,C);
      rg.addColorStop(0,"rgba(200,225,255,1)"); rg.addColorStop(.4,"rgba(140,185,255,.6)"); rg.addColorStop(.72,"rgba(90,140,255,.22)"); rg.addColorStop(1,"rgba(100,140,255,0)");
      g.fillStyle=rg; g.fillRect(0,0,s,s);
      g.strokeStyle="rgba(205,228,255,.8)"; g.lineWidth=3; g.beginPath(); g.arc(C,C,C*.62,0,7); g.stroke(); });
    pool=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:pt,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    pool.rotation.x=-Math.PI/2; pool.renderOrder=2; pool.frustumCulled=false; pool.userData.noOutline=true; pool.userData.noLod=true; pool.visible=false; scene.add(pool);
    const ct=cv(4,128,(g,w,h)=>{ const lg=g.createLinearGradient(0,0,0,h); lg.addColorStop(0,"rgba(190,215,255,0)"); lg.addColorStop(.55,"rgba(190,215,255,.22)"); lg.addColorStop(1,"rgba(215,232,255,.55)"); g.fillStyle=lg; g.fillRect(0,0,w,h); });
    const cg=new THREE.CylinderGeometry(.9,2.3,10,20,1,true); cg.translate(0,5,0);
    cone=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({map:ct,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:0,fog:false}));
    cone.renderOrder=2; cone.frustumCulled=false; cone.userData.noOutline=true; cone.userData.noLod=true; cone.visible=false; scene.add(cone); }
  function tick(dt){ if(typeof started!=="undefined"&&!started) return; if(!pool){ try{ init(); }catch(e){ return; } }
    t+=dt; const d=(typeof DAY!=="undefined"&&DAY.d!=null)?DAY.d:1;
    let want=Math.max(0,Math.min(1,(.62-d)/.26));
    try{ if(typeof inDungeon==="function"&&inDungeon()) want=0; }catch(e){}
    if(P.dead||!player||!player.visible) want=0;
    k+=(want-k)*Math.min(1,dt*1.5);
    const on=k>.02; pool.visible=on; const hi=on&&HIGH(); cone.visible=hi; if(!on) return;
    const gy=(P.gy!=null?P.gy:hAt(P.x,P.z)), up=P.y||0, fade=1/(1+up*.3), br=.85+.15*Math.sin(t*1.3);
    const sz=(P.ride?7.5:6)*(1+.04*Math.sin(t*1.1));
    pool.position.set(P.x,gy+.12,P.z); pool.scale.set(sz,sz,1); pool.material.opacity=Math.min(1,.9*k*br*fade);
    if(hi){ cone.position.set(P.x,gy+.05,P.z); cone.rotation.y+=dt*.15; cone.material.opacity=(ECO()?.4:.55)*k*br; }
  }
  XTICK.push(tick);
  return {tick,get k(){ return k; }};
})();
</script>
