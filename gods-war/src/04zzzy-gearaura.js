<script>
/* ================= v185: 영웅·신화 장비를 낀 내 캐릭터 발밑에 등급 색 빛 기운 =================
   낀 장비(무기·방어구·유물) 중 가장 높은 등급이 영웅(보라)·신화(금빛)이면
   발밑에 그 색의 은은한 빛 무늬(빛살 꽃잎 + 룬 고리)가 천천히 돌며 숨쉬고, 둘레에서 빛 알갱이가 위로 솔솔 피어오름.
   신화는 알갱이가 더 많고 무늬가 한 겹 더. 눈밭에서도 보이게 진한 색 테두리.
   판 1장 + 알갱이 Points 1묶음(그리기 호출 최대 +2), PointLight 없음. 배터리 절약 모드는 알갱이 수 절반·무늬는 돌지 않음.
   모습만 — 장비 능력·저장 기록 그대로. */
const GEARAURA=(()=>{
  let disk=null, pts=null, cur=-1, t=0, op=0, N=0; const D=[];
  function diskTex(){ const c=document.createElement("canvas"); c.width=c.height=256; const g=c.getContext("2d"), C=128;
    const rg=g.createRadialGradient(C,C,0,C,C,C); rg.addColorStop(0,"rgba(255,255,255,.7)"); rg.addColorStop(.45,"rgba(255,255,255,.32)"); rg.addColorStop(.8,"rgba(255,255,255,.08)"); rg.addColorStop(1,"rgba(255,255,255,0)");
    g.fillStyle=rg; g.beginPath(); g.arc(C,C,C,0,7); g.fill();
    // 빛살 꽃잎 8장
    for(let i=0;i<8;i++){ g.save(); g.translate(C,C); g.rotate(i/8*Math.PI*2); const lg=g.createLinearGradient(0,0,0,-C*.92); lg.addColorStop(0,"rgba(255,255,255,.0)"); lg.addColorStop(.35,"rgba(255,255,255,.5)"); lg.addColorStop(1,"rgba(255,255,255,0)");
      g.fillStyle=lg; g.beginPath(); g.moveTo(0,-C*.18); g.quadraticCurveTo(C*.13,-C*.55,0,-C*.92); g.quadraticCurveTo(-C*.13,-C*.55,0,-C*.18); g.fill(); g.restore(); }
    // 룬 고리(진한 테두리 + 밝은 선 + 점 눈금)
    g.lineWidth=12; g.strokeStyle="rgba(40,20,60,.5)"; g.beginPath(); g.arc(C,C,C*.7,0,7); g.stroke();
    g.lineWidth=3.5; g.strokeStyle="rgba(255,255,255,.95)"; g.beginPath(); g.arc(C,C,C*.7,0,7); g.stroke();
    g.lineWidth=1.5; g.strokeStyle="rgba(255,255,255,.6)"; g.beginPath(); g.arc(C,C,C*.62,0,7); g.stroke();
    g.fillStyle="rgba(255,255,255,.95)"; for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, r=C*.66; g.beginPath(); g.arc(C+Math.cos(a)*r,C+Math.sin(a)*r,i%3===0?3.2:1.6,0,7); g.fill(); }
    const tx=new THREE.CanvasTexture(c); tx.anisotropy=2; return tx; }
  function dotTex(){ const c=document.createElement("canvas"); c.width=c.height=32; const g=c.getContext("2d");
    const rg=g.createRadialGradient(16,16,0,16,16,16); rg.addColorStop(0,"rgba(255,255,255,1)"); rg.addColorStop(.3,"rgba(255,255,255,.9)"); rg.addColorStop(.6,"rgba(255,255,255,.3)"); rg.addColorStop(1,"rgba(255,255,255,0)");
    g.fillStyle=rg; g.fillRect(0,0,32,32); return new THREE.CanvasTexture(c); }
  function init(){
    disk=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:diskTex(),transparent:true,depthWrite:false,opacity:0,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    disk.rotation.order="YXZ"; disk.rotation.x=-Math.PI/2; disk.renderOrder=2; disk.frustumCulled=false; disk.userData.noOutline=true; disk.userData.noLod=true; disk.visible=false; scene.add(disk);
    N=ECO()?12:24; const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(new Float32Array(N*3),3));
    pts=new THREE.Points(geo,new THREE.PointsMaterial({map:dotTex(),size:.42,sizeAttenuation:true,transparent:true,depthWrite:false,opacity:0,fog:false}));
    pts.frustumCulled=false; pts.userData.noOutline=true; pts.userData.noLod=true; pts.visible=false; pts.renderOrder=4; scene.add(pts);
    for(let i=0;i<N;i++) D.push({a:Math.random()*7,r:1+Math.random()*1.6,y:Math.random()*3,v:.6+Math.random()*.9}); }
  function best(){ try{ return Math.max(G.eq.w|0,G.eq.a|0,G.eq.r|0); }catch(e){ return -1; } }
  function tick(dt){ if(typeof P==="undefined"||!G||!G.eq) return; const b=best();
    if(b<2&&!disk) return; if(!disk){ try{ init(); }catch(e){ return; } }
    t+=dt; const hide=b<2||P.dead||!player||!player.visible||(typeof PG!=="undefined"&&PG.fall)||(typeof INTRO!=="undefined"&&INTRO.on);
    op+=((hide?0:1)-op)*Math.min(1,dt*3);
    disk.visible=pts.visible=op>.01; if(!disk.visible) return;
    if(b!==cur){ cur=b; const col=new THREE.Color(RAR_HEX[b]); if(b===3) col.setRGB(1,.58,.04); disk.material.color.copy(col); pts.material.color.copy(col).lerp(new THREE.Color(1,1,1),.1); }
    const gy=(P.gy!=null?P.gy:hAt(P.x,P.z)), up=P.y||0, k=1/(1+up*.35), eco=ECO();
    const br=.5+.5*Math.sin(t*(b===3?2.6:1.9)), sz=(b===3?6.2:5.2)*(P.ride?1.25:1)*(.96+br*.06)*k;
    disk.position.set(P.x,gy+.12,P.z); disk.scale.set(sz,sz,1); if(!eco) disk.rotation.y-=dt*(b===3?.5:.32);
    disk.material.opacity=op*(.78+.22*br)*(P.moving?.85:1)*(.4+.6*k);
    const p=pts.geometry.attributes.position.array, cnt=b===3?N:Math.ceil(N*.6), H=b===3?3.6:2.8;
    for(let i=0;i<N;i++){ const d=D[i]; if(i>=cnt){ p[i*3+1]=-999; continue; }
      d.y+=dt*d.v; d.a+=dt*.5; if(d.y>H){ d.y=0; d.a=Math.random()*7; d.r=1+Math.random()*1.6*(b===3?1.25:1); }
      const rr=d.r*(1-d.y/H*.35)*(P.ride?1.25:1); p[i*3]=P.x+Math.cos(d.a)*rr; p[i*3+1]=gy+.2+d.y; p[i*3+2]=P.z+Math.sin(d.a)*rr; }
    pts.geometry.attributes.position.needsUpdate=true; pts.material.opacity=op*.9; pts.material.size=(b===3?.62:.52);
  }
  XTICK.push(tick);
  return {tick,diskTex,dotTex,get on(){ return !!(disk&&disk.visible); }};
})();
</script>
