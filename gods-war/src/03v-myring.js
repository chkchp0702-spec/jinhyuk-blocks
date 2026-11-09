<script>
/* v86 내 캐릭터 발밑 고리: 은은한 금빛 원(눈금이 천천히 돎) + 내가 보는 쪽을 가리키는 작은 금빛 화살표.
   괴물·친구 무리 속에서도 "나"를 바로 찾게. 눈밭(밝은 땅)에서도 보이게 금빛 선 아래 옅은 갈색 그림자 띠.
   그림 2장(미리 만든 판 2개, 그리기 호출 +2), PointLight 없음, 배터리 절약 모드는 돌지 않고 숨쉬기만 */
const MYRING=(()=>{ let ring=null, arrow=null, t=0, glow=0;
  function cv(draw){ const c=document.createElement("canvas"); c.width=c.height=128; draw(c.getContext("2d"),128); const tx=new THREE.CanvasTexture(c); tx.anisotropy=2; return tx; }
  function ringTex(){ return cv((g,s)=>{ const C=s/2;
    g.lineWidth=14; g.strokeStyle="rgba(70,40,0,.38)"; g.beginPath(); g.arc(C,C,C-12,0,7); g.stroke();          // 밝은 땅에서도 보이는 그림자 띠
    g.lineWidth=6; g.strokeStyle="rgba(255,214,90,1)"; g.shadowColor="rgba(255,200,60,.9)"; g.shadowBlur=6; g.beginPath(); g.arc(C,C,C-12,0,7); g.stroke();
    g.lineWidth=1.6; g.strokeStyle="rgba(255,240,180,.75)"; g.beginPath(); g.arc(C,C,C-21,0,7); g.stroke();
    g.shadowBlur=4; g.fillStyle="rgba(255,226,120,.95)";
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, big=i%3===0, r1=C-12, r2=C-(big?27:21); g.save(); g.translate(C,C); g.rotate(a); g.beginPath(); g.moveTo(-(big?3:1.6),-r1); g.lineTo(big?3:1.6,-r1); g.lineTo(0,-r2); g.closePath(); g.fill(); g.restore(); }
    const rg=g.createRadialGradient(C,C,0,C,C,C-14); rg.addColorStop(0,"rgba(255,220,120,.16)"); rg.addColorStop(.8,"rgba(255,210,90,.05)"); rg.addColorStop(1,"rgba(255,210,90,0)"); g.shadowBlur=0; g.fillStyle=rg; g.beginPath(); g.arc(C,C,C-14,0,7); g.fill(); }); }
  function arrowTex(){ return cv((g,s)=>{ const C=s/2; g.shadowColor="rgba(255,190,50,.9)"; g.shadowBlur=8;
    g.fillStyle="rgba(70,40,0,.35)"; g.beginPath(); g.moveTo(C,6); g.lineTo(C+20,34); g.lineTo(C,26); g.lineTo(C-20,34); g.closePath(); g.fill();
    g.fillStyle="rgba(255,222,110,1)"; g.beginPath(); g.moveTo(C,9); g.lineTo(C+15,30); g.lineTo(C,23); g.lineTo(C-15,30); g.closePath(); g.fill(); }); }
  function mk(tex,ro){ const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3})); m.rotation.order="YXZ"; m.rotation.x=-Math.PI/2; m.userData.noOutline=true; m.renderOrder=ro; m.frustumCulled=false; scene.add(m); return m; }
  function init(){ ring=mk(ringTex(),3); arrow=mk(arrowTex(),3); }
  function hit(){ glow=1; }
  function tick(dt){ if(!ring){ try{ init(); }catch(e){ return; } }
    t+=dt; glow=Math.max(0,glow-dt*2.5);
    const hide=P.dead||!player||!player.visible&&!(P.invul>0)||(typeof PG!=="undefined"&&PG.fall);
    const gy=(P.gy!=null?P.gy:hAt(P.x,P.z)), up=P.y||0, k=1/(1+up*.35);
    const sz=(P.ride?4.6:3.6)*(1+glow*.12)*k, breathe=ECO()?.5+.5*Math.sin(t*2):.5+.5*Math.sin(t*2.4);
    let op=hide?0:(.72+.2*breathe+glow*.3)*(P.combat>0?1:.85)*(.35+.65*k);
    ring.visible=arrow.visible=op>.01; if(!ring.visible) return;
    ring.position.set(P.x,gy+.15,P.z); ring.scale.set(sz,sz,1); ring.material.opacity=Math.min(1,op);
    if(!ECO()) ring.rotation.y+=dt*.6;
    const a=player.rotation.y, d=sz*.5+.55;
    arrow.position.set(P.x+Math.sin(a)*d,gy+.16,P.z+Math.cos(a)*d); arrow.rotation.y=a+Math.PI; const as=1.25*k*(P.ride?1.3:1); arrow.scale.set(as,as,1); arrow.material.opacity=Math.min(1,op*(P.moving?1:.75));
  }
  return {tick,hit};
})();
</script>
