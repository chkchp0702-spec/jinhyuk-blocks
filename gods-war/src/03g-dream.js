<script>
/* ================= 💤 쉬는 친구 꿈결 연출 (v23) =================
   - 쉬는 친구 몸은 살짝 비치는 푸른 꿈빛(반투명 + 은은한 빛, 그림자 없음, 검은 외곽선 숨김)
   - 발밑에 천천히 숨 쉬는 꿈빛 고리
   - 머리 위로 "Z" 세 개가 번갈아 둥실 떠오르며 커지고 사라짐
   - 그래픽 높음이면 몸 둘레에 작은 별빛 가루가 천천히 떠오름
   ghost 하나에 그리기 4~8번, PointLight 없음, 가까이(55m) 있을 때만 보임. */
const DREAM=(()=>{ const T={}; const PL=new THREE.PlaneGeometry(1,1); const TINT=new THREE.Color(0x7d8cff), TINT2=new THREE.Color(0x3a4cc0);
  function can(n,draw){ if(T[n]) return T[n]; const c=document.createElement("canvas"); c.width=c.height=128; const g=c.getContext("2d"); draw(g,128); const t=new THREE.CanvasTexture(c); T[n]=t; return t; }
  const zTex=()=>can("z",(g,s)=>{ g.font="900 96px Arial Black, Arial, sans-serif"; g.textAlign="center"; g.textBaseline="middle"; g.lineJoin="round";
    g.lineWidth=14; g.strokeStyle="rgba(30,40,110,.9)"; g.strokeText("Z",s/2,s/2+4); const gr=g.createLinearGradient(0,20,0,108); gr.addColorStop(0,"#ffffff"); gr.addColorStop(1,"#a9c6ff"); g.fillStyle=gr; g.fillText("Z",s/2,s/2+4); });
  const ringTex=()=>can("ring",(g,s)=>{ const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); r.addColorStop(0,"rgba(255,255,255,.35)"); r.addColorStop(.45,"rgba(255,255,255,.12)"); r.addColorStop(.78,"rgba(255,255,255,.85)"); r.addColorStop(.86,"rgba(255,255,255,.5)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,s,s);
    g.fillStyle="#fff"; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, x=s/2+Math.cos(a)*s*.39, y=s/2+Math.sin(a)*s*.39; g.beginPath(); g.moveTo(x,y-5); g.lineTo(x+2,y); g.lineTo(x,y+5); g.lineTo(x-2,y); g.closePath(); g.fill(); } });
  const dotTex=()=>can("dot",(g,s)=>{ const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); r.addColorStop(0,"rgba(255,255,255,1)"); r.addColorStop(.3,"rgba(255,255,255,.6)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,s,s); });
  function spr(tex,col,add){ const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:col,transparent:true,opacity:0,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending})); m.renderOrder=5; return m; }
  /* 몸을 꿈빛으로: 재질은 이 ghost 것만 복사해서 바꿈(다른 캐릭터는 그대로) */
  function dreamify(mesh){ if(!mesh||mesh.userData.dream) return; mesh.userData.dream=1;
    mesh.traverse(o=>{ if(!o.isMesh&&!o.isSkinnedMesh) return; o.castShadow=false;
      if(o.userData.outline){ o.visible=false; return; }
      const one=m=>{ if(!m) return m; m=m.clone(); m.transparent=true; m.opacity=.82; m.depthWrite=true; if(m.color) m.color.lerp(TINT,.55); if(m.emissive){ m.emissive.lerp(TINT2,.6); m.emissiveIntensity=Math.max(m.emissiveIntensity||0,.25); } return m; };
      o.material=Array.isArray(o.material)?o.material.map(one):one(o.material); }); }
  function make(){ const grp=new THREE.Group(); grp.userData.noOutline=true;
    const ring=new THREE.Mesh(PL,new THREE.MeshBasicMaterial({map:ringTex(),color:0x8fb4ff,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2; ring.position.y=.12; ring.scale.setScalar(2.6); ring.renderOrder=3; ring.userData.noOutline=true; grp.add(ring);
    const zs=[0,1,2].map(i=>{ const z=spr(zTex(),0xffffff,false); grp.add(z); return {s:z,ph:i/3}; });
    const dots=HIGH()?[0,1,2,3,4].map(i=>{ const d=spr(dotTex(),0xbcd4ff,true); grp.add(d); return {s:d,ph:i/5,a:i*1.257}; }):[];
    scene.add(grp); return {grp,ring,zs,dots,t:Math.random()*10}; }
  function tick(d,dt,x,y,z,show){ if(!d) return; d.grp.visible=show; if(!show) return; d.t+=dt; const t=d.t; d.grp.position.set(x,y,z);
    const br=.5+.5*Math.sin(t*1.6); d.ring.material.opacity=.32+.28*br; d.ring.scale.setScalar(2.4+.35*br); d.ring.rotation.z=t*.25;
    for(const e of d.zs){ const k=((t*.32)+e.ph)%1; const s=e.s; s.position.set(.35+k*.9+Math.sin(k*6+e.ph*4)*.18,2.3+k*1.7,0); s.scale.setScalar(.5+k*.7);
      s.material.opacity=k<.15?k/.15:k>.7?(1-k)/.3:1; s.material.rotation=Math.sin(k*5+e.ph)*.3-.15; }
    for(const e of d.dots){ const k=((t*.22)+e.ph)%1; const a=e.a+t*.6; e.s.position.set(Math.cos(a)*.75,.2+k*2.4,Math.sin(a)*.75); e.s.scale.setScalar(.22*(1-k*.5)); e.s.material.opacity=Math.sin(k*Math.PI)*.75; } }
  function drop(d){ if(!d) return; scene.remove(d.grp); d.grp.traverse(o=>{ if(o.material&&o.material.dispose) o.material.dispose(); }); }
  return {dreamify,make,tick,drop};
})();
</script>
