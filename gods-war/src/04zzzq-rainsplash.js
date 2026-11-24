<script>
/* ================= v172: 비 오는 날 땅에 톡톡 빗방울 동심원 + 걸을 때 발밑 물튀김 =================
   비·폭풍·황금비가 올 때(미궁·집 안·수도 맑음 제외) 내 둘레 10m 땅과 물 위에 빗방울이 떨어진 자리마다 작은 물결 고리가 톡톡 퍼짐
   (폭풍은 더 많이, 황금비는 금빛). 걷거나 달리면 발이 닿는 자리마다 조금 큰 물튀김 고리가 찰박찰박 생김.
   고리 묶음 InstancedMesh 1개(그리기 +1, 비 올 때만 보임), PointLight 없음. 절약 모드·「낮음」은 고리 수를 줄임. 모습만. */
const RAINSPL=(()=>{
  let im=null, N=0, i0=0, acc=0, stepAcc=0, side=1, lx=0, lz=0, wasOn=false; const R=[];
  const M4=new THREE.Matrix4(), Q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0)), V=new THREE.Vector3(), S=new THREE.Vector3(), C=new THREE.Color();
  const BLUE=new THREE.Color(.62,.78,1), GOLD=new THREE.Color(1,.82,.4);
  function indoor(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on)||(typeof xzOn==="function"&&!!xzOn()); }
  function init(){ N=HIGH()?44:22; const geo=new THREE.RingGeometry(.78,1,22);
    const mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    im=new THREE.InstancedMesh(geo,mat,N); im.frustumCulled=false; im.userData.noLod=true; im.renderOrder=2;
    for(let k=0;k<N;k++){ R.push({t:1,d:1,x:0,y:-999,z:0,sz:.4,op:0}); M4.makeScale(0,0,0); im.setMatrixAt(k,M4); im.setColorAt(k,C.setRGB(0,0,0)); }
    im.visible=false; scene.add(im); }
  function gy(x,z){ let y=hAt(x,z); try{ const w=STEP.waterAt(x,z,y); if(w) y=w.y; }catch(e){} return y; }
  function spawn(x,z,sz,d,op){ const r=R[i0=(i0+1)%N]; r.t=0; r.d=d; r.x=x; r.z=z; r.y=gy(x,z)+.07; r.sz=sz; r.op=op; }
  function tick(dt){ if(typeof started==="undefined"||!started) return; if(!im){ if(typeof scene==="undefined") return; init(); }
    const w=(typeof WEATHER!=="undefined")?WEATHER.type:"clear"; const on=(w==="rain"||w==="storm"||w==="gold")&&!indoor()&&!P.dead;
    let live=false;
    if(on){ const eco=ECO(), hi=HIGH(); const rate=(w==="storm"?1.5:1)*(hi?(eco?16:28):9); acc+=dt*rate;
      while(acc>=1){ acc-=1; const a=Math.random()*Math.PI*2, d=Math.sqrt(Math.random())*10; spawn(P.x+Math.cos(a)*d,P.z+Math.sin(a)*d,rnd(.28,.5),rnd(.45,.65),rnd(.55,.85)); }
      // 걸음 물튀김: 땅 위에서 움직일 때 보폭마다(달리면 더 자주)
      const mv=Math.hypot(P.x-lx,P.z-lz)/Math.max(dt,1e-4); if(P.y<=.05&&mv>1.2&&mv<40){ stepAcc+=dt*(mv>7?3.6:2.4); if(stepAcc>=1){ stepAcc=0; side=-side; const rx=Math.cos(P.rot), rz=-Math.sin(P.rot);
        const x=P.x+rx*side*.3, z=P.z+rz*side*.3; spawn(x,z,mv>7?.95:.75,.6,1); if(hi&&!eco) spawn(x,z,.45,.42,.9); } } }
    lx=P.x; lz=P.z;
    const col=w==="gold"?GOLD:BLUE;
    for(let k=0;k<N;k++){ const r=R[k]; if(r.t>=r.d){ if(r.op>0){ r.op=0; M4.makeScale(0,0,0); im.setMatrixAt(k,M4); } continue; }
      r.t+=dt; const q=Math.min(1,r.t/r.d); const e=1-Math.pow(1-q,2.2); live=true;
      const s=r.sz*(.15+e); V.set(r.x,r.y,r.z); S.set(s,s,s); M4.compose(V,Q,S); im.setMatrixAt(k,M4);
      const f=r.op*(1-q)*(q<.12?q/.12:1); im.setColorAt(k,C.copy(col).multiplyScalar(f)); }
    im.visible=live; if(live||wasOn){ im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; } wasOn=live; }
  XTICK.push(tick);
  return {tick,get n(){ return N; }};
})();
</script>
