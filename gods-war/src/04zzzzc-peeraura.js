<script>
/* ================= v192: 친구(PEERS)도 영웅·신화 장비면 발밑 등급 빛 =================
   함께하는 친구가 낀 장비(무기·방어구·유물) 중 가장 높은 등급이 영웅(보라)·신화(금빛)이면
   내 캐릭터(v185)처럼 친구 발밑에도 그 색 빛 무늬가 천천히 돌며 숨쉬고 빛 알갱이가 솔솔 피어오름.
   가까운 친구 3명까지만(40칸 안). 판 3장 + 알갱이 Points 1묶음(색은 친구마다) → 그리기 호출 최대 +4, PointLight 없음.
   배터리 절약 모드는 알갱이 절반·무늬는 돌지 않음. 받는 쪽 모습만 — 함께하기 메시지·장비 능력·저장 기록 그대로. */
const PEERAURA=(()=>{
  const MAX=3; let disks=null, pts=null, tex=null, N=0, t=0; const D=[], slot=[];
  function init(){ tex=GEARAURA.diskTex(); const geo=new THREE.PlaneGeometry(1,1); disks=[];
    for(let i=0;i<MAX;i++){ const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:0,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
      m.rotation.order="YXZ"; m.rotation.x=-Math.PI/2; m.renderOrder=2; m.frustumCulled=false; m.userData.noOutline=true; m.userData.noLod=true; m.visible=false; scene.add(m); disks.push(m); slot.push({id:null,op:0,b:-1,ph:Math.random()*7}); }
    N=(ECO()?8:14)*MAX; const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(N*3),3)); g.setAttribute("color",new THREE.BufferAttribute(new Float32Array(N*3),3));
    pts=new THREE.Points(g,new THREE.PointsMaterial({map:GEARAURA.dotTex(),size:.5,sizeAttenuation:true,transparent:true,depthWrite:false,opacity:.85,fog:false,vertexColors:true}));
    pts.frustumCulled=false; pts.userData.noOutline=true; pts.userData.noLod=true; pts.visible=false; pts.renderOrder=4; scene.add(pts);
    for(let i=0;i<N;i++) D.push({a:Math.random()*7,r:1+Math.random()*1.5,y:Math.random()*3,v:.6+Math.random()*.9}); }
  function best(o){ if(!o||!o.e) return -1; const a=o.e.split(",").map(Number); return Math.max(a[0]|0,a[1]|0,a[2]|0); }
  function colOf(b){ const c=new THREE.Color(RAR_HEX[b]); if(b===3) c.setRGB(1,.58,.04); return c; }
  function pick(){ const L=[]; for(const id in PEERS){ const o=PEERS[id]; if(!o||o.dead||!o.mesh||!o.mesh.visible) continue; const b=best(o); if(b<2) continue; const d=Math.hypot(o.x-P.x,o.z-P.z); if(d<40) L.push([d,id,b]); } L.sort((a,b)=>a[0]-b[0]); return L.slice(0,MAX); }
  let pickT=0, chosen=[];
  function tick(dt){ if(typeof PEERS==="undefined"||typeof P==="undefined") return;
    pickT-=dt; if(pickT<=0){ pickT=.5; chosen=pick(); }
    if(!disks){ if(!chosen.length) return; try{ init(); }catch(e){ return; } }
    t+=dt; const eco=ECO(), hideAll=(typeof INTRO!=="undefined"&&INTRO.on);
    /* 자리 맞추기: 이미 있던 친구는 같은 자리, 새 친구는 빈 자리 */
    const want={}; chosen.forEach(c=>want[c[1]]=c[2]);
    slot.forEach(s=>{ if(s.id&&want[s.id]==null&&s.op<.02) s.id=null; });
    for(const c of chosen){ if(slot.some(s=>s.id===c[1])) continue; const f=slot.find(s=>!s.id); if(f){ f.id=c[1]; f.op=0; f.b=-1; } }
    const pa=pts.geometry.attributes.position.array, ca=pts.geometry.attributes.color.array, per=N/MAX; let any=false;
    slot.forEach((s,i)=>{ const m=disks[i], o=s.id?PEERS[s.id]:null; const on=!!(o&&want[s.id]!=null&&!hideAll&&!o.dead&&o.mesh&&o.mesh.visible);
      s.op+=((on?1:0)-s.op)*Math.min(1,dt*3); if(!o) s.op=0;
      m.visible=s.op>.01;
      for(let j=0;j<per;j++){ const k=i*per+j; if(!m.visible){ pa[k*3+1]=-999; continue; } }
      if(!m.visible) return; any=true;
      const b=want[s.id]!=null?want[s.id]:s.b; if(b!==s.b){ s.b=b; s.col=colOf(b); m.material.color.copy(s.col); }
      const gy=hAt(o.x,o.z), br=.5+.5*Math.sin(t*(b===3?2.6:1.9)+s.ph), sz=(b===3?6:5)*(o.ride?1.25:1)*(.96+br*.06);
      m.position.set(o.x,gy+.12,o.z); m.scale.set(sz,sz,1); if(!eco) m.rotation.y-=dt*(b===3?.5:.32);
      m.material.opacity=s.op*(.7+.2*br)*(o.m?.85:1);
      const cnt=b===3?per:Math.ceil(per*.6), H=b===3?3.4:2.7, cc=s.col.clone().lerp(new THREE.Color(1,1,1),.1).multiplyScalar(s.op);
      for(let j=0;j<per;j++){ const k=i*per+j, d=D[k]; if(j>=cnt){ pa[k*3+1]=-999; continue; }
        d.y+=dt*d.v; d.a+=dt*.5; if(d.y>H){ d.y=0; d.a=Math.random()*7; d.r=1+Math.random()*1.5*(b===3?1.2:1); }
        const rr=d.r*(1-d.y/H*.35)*(o.ride?1.25:1); pa[k*3]=o.x+Math.cos(d.a)*rr; pa[k*3+1]=gy+.2+d.y; pa[k*3+2]=o.z+Math.sin(d.a)*rr; ca[k*3]=cc.r; ca[k*3+1]=cc.g; ca[k*3+2]=cc.b; } });
    pts.visible=any; if(any){ pts.geometry.attributes.position.needsUpdate=true; pts.geometry.attributes.color.needsUpdate=true; } }
  XTICK.push(tick);
  return {tick,get n(){ return disks?disks.filter(m=>m.visible).length:0; }};
})();
</script>
