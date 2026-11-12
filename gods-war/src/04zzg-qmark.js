<script>
/* ================= 머리 위 「!」 표시 (v115) =================
   이야기 전령·이야기 영웅처럼 이름표에 ❗ 가 붙은 대상: 글자 ❗ 대신 이름표 위에 금빛 방패 「!」 배지가
   통통 튀고(가끔 빙글) 빛나며, 발밑에 금빛 고리가 숨쉬듯 퍼짐 → 멀리서도 "저기 가 봐야지" 가 보임.
   placeLabel 을 감싸서 글자만 바꿈(글자 바뀔 때만 DOM), 튀는 움직임은 3D 프레임(XTICK)에서 배지 1~2개만.
   발밑 고리는 판 2장 돌려씀. 모습만 — 이야기 규칙·임무 그대로. */
const QMARK=(()=>{ if(typeof placeLabel!=="function") return null; const _pl=placeLabel; const act=new Map();
  const BADGE='<i class="qmk"><i class="qmi">!</i></i>';
  placeLabel=function(el,x,y,z,html){ if(typeof html==="string"&&html.indexOf("❗")>=0){ html=BADGE+html.replace(/❗\s?/g,""); el._qmT=performance.now(); el._qmX=x; el._qmZ=z; if(!act.has(el)) act.set(el,{t0:el._qmT,b:null,r:null}); }
    return _pl(el,x,y,z,html); };
  const rings=[]; let tex=null;
  function ringTex(){ if(tex) return tex; const c=document.createElement("canvas"); c.width=c.height=128; const g=c.getContext("2d"); const r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,"rgba(255,220,110,0)"); r.addColorStop(.55,"rgba(255,215,90,.12)"); r.addColorStop(.78,"rgba(255,200,60,.85)"); r.addColorStop(.86,"rgba(255,245,190,1)"); r.addColorStop(1,"rgba(255,200,60,0)"); g.fillStyle=r; g.fillRect(0,0,128,128); tex=new THREE.CanvasTexture(c); return tex; }
  function ring(){ let o=rings.find(r=>!r.used); if(o){ o.used=true; return o; } if(rings.length>=2) return null; const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:ringTex(),color:0xffd35a,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    m.rotation.x=-Math.PI/2; m.userData.noOutline=true; m.renderOrder=2; scene.add(m); o={m,used:true}; rings.push(o); return o; }
  function tick(dt){ if(!act.size) return; const now=performance.now(), eco=ECO();
    for(const [el,s] of act){ const alive=now-(el._qmT||0)<300&&el.style.display!=="none";
      if(!alive){ if(s.r){ s.r.used=false; s.r.m.visible=false; s.r=null; } act.delete(el); continue; }
      if(!s.b||!s.b.isConnected) s.b=el.querySelector(".qmk");
      const t=(now-s.t0)/1000;
      if(s.b){ const ph=t%2.6; const bob=Math.abs(Math.sin(t*3.4))*-7; const sq=ph<.12?1+.18*Math.sin(ph/.12*Math.PI):1; const spin=ph>1.7&&ph<2.2?Math.cos((ph-1.7)/.5*Math.PI*2):1;
        s.b.style.transform=`translateY(${bob.toFixed(1)}px) scale(${(spin*sq).toFixed(3)},${(1/sq).toFixed(3)})`; s.b.classList.toggle("qflip",spin<0); }
      if(!s.r) s.r=ring(); if(s.r){ const m=s.r.m, k=(t*.7)%1; m.visible=true; const sc=2.2+k*3.4; m.scale.set(sc,sc,1); m.position.set(el._qmX,hAt(el._qmX,el._qmZ)+.12,el._qmZ); m.material.opacity=(k<.15?k/.15:1-(k-.15)/.85)*(eco?.6:.8); } } }
  XTICK.push(tick);
  return {act};
})();
</script>
