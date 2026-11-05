<script>
/* ================= 발자국·발먼지 (v44) =================
   - 걸음마다(발이 땅에 닿을 때) 발밑에서 먼지가 뒤로 퐁 — 땅 따라 색이 다름
     (아스가르드 눈밭: 눈가루 + 눈 위 발자국 / 모래: 모래먼지 + 발자국 / 풀밭: 옅은 흙먼지)
   - 빨리 달릴 때(질주·신수 타기) 먼지 더 크게, 점프하고 내려앉으면 먼지 고리
   - 미리 만든 몇 장을 돌려 씀(새로 만들지 않음), PointLight 없음, 배터리 절약 모드는 먼지 적게·발자국 8개까지 */
/* v60: 물 위를 걸으면 찰방 물보라(물방울 튀김) + 물결 고리가 퍼짐, 가만히 서 있어도 잔물결, 물에 뛰어내리면 큰 첨벙 */
const STEP=(()=>{ let puffs=null, prints=null, pi=0, ri=0, last=-1, side=1, prevY=0, rings=null, rgi=0, wsp=null, wspT=0, wIdle=0;
  function tex(draw){ const c=document.createElement("canvas"); c.width=c.height=64; draw(c.getContext("2d"),64); return new THREE.CanvasTexture(c); }
  const softT=()=>tex((g,s)=>{ const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); r.addColorStop(0,"rgba(255,255,255,1)"); r.addColorStop(.35,"rgba(255,255,255,.7)"); r.addColorStop(.7,"rgba(255,255,255,.2)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,s,s); });
  const printT=()=>tex((g,s)=>{ g.fillStyle="#fff"; g.filter="blur(1px)"; g.beginPath(); g.ellipse(s/2,s*.38,s*.2,s*.26,0,0,7); g.fill(); g.beginPath(); g.ellipse(s/2,s*.8,s*.15,s*.13,0,0,7); g.fill(); });
  function init(){ const st=softT(), pt=printT(); puffs=[]; prints=[];
    const NP=ECO()?10:18; for(let i=0;i<NP;i++){ const m=new THREE.Sprite(new THREE.SpriteMaterial({map:st,transparent:true,depthWrite:false,opacity:0})); m.visible=false; m.renderOrder=4; scene.add(m); puffs.push({m,t:1,d:1}); }
    { const RG=new THREE.RingGeometry(.66,1,40); rings=[]; for(let i=0,n=ECO()?4:7;i<n;i++){ const m=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,opacity:0,side:THREE.DoubleSide})); m.rotation.x=-Math.PI/2; m.userData.noOutline=true; m.visible=false; m.renderOrder=3; scene.add(m); rings.push({m,t:1,d:1}); } }
    { const PL=new THREE.PlaneGeometry(1.1,1.6); for(let i=0,n=ECO()?8:14;i<n;i++){ const m=new THREE.Mesh(PL,new THREE.MeshBasicMaterial({map:pt,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-2})); m.rotation.order="YXZ"; m.userData.noOutline=true; m.visible=false; m.renderOrder=2; scene.add(m); prints.push({m,t:1,d:1,op:0}); } } }
  // 땅 종류: 0 풀(흙먼지) 1 눈 2 모래 3 돌
  function ground(x,z){ if(typeof DG!=="undefined"&&DG.on) return 3; if(typeof DS!=="undefined"&&DS.on) return 2; if(typeof HM!=="undefined"&&HM.on) return 3; const y=hAt(x,z); if(y>28) return 1; if(Math.hypot(x,z)<(REGIONS[12]?REGIONS[12].r:40)-4) return 3; return x>=0?(z<0?0:2):(z<0?1:0); }
  const PC=[0xcdb894,0xd3dff0,0xe6c98e,0xb9b4c4,0xffffff], PO=[.42,.9,.65,.35,1], FC=[0,0x40506e,0x6e4c22,0,0], FO=[0,.68,.58,0,0];
  // 물 웅덩이 목록(연못·분수·강) — 몇 초마다 다시 훑음. 둥근 물은 반지름, 네모 물은 가로·세로로 정확히 안쪽인지 봄
  const _v=new THREE.Vector3();
  function scanWater(){ const L=[]; try{ scene.updateMatrixWorld(); scene.traverse(o=>{ if(!o.isMesh||!o.visible||(o.material!==WATER&&o.material!==M.water)) return; const pr=o.geometry.parameters||{}; let kind=0,a=0,b=0; if(pr.radius!=null&&pr.thetaLength!=null&&pr.height==null){ kind=1; a=pr.radius; } else if(pr.width!=null&&pr.height!=null){ kind=2; a=pr.width/2; b=pr.height/2; } else return; o.getWorldPosition(_v); if(kind===2&&a*b>4000) return; L.push({o,kind,a,b,x:_v.x,z:_v.z,y:_v.y,R:kind===1?a*Math.max(o.scale.x,1)+1:Math.hypot(a,b)+1,inv:new THREE.Matrix4().copy(o.matrixWorld).invert()}); }); }catch(e){} wsp=L; }
  function waterAt(x,z,gy){ if(!wsp) return null; for(const w of wsp){ if(Math.abs(x-w.x)>w.R||Math.abs(z-w.z)>w.R) continue; if(gy-w.y>.22||w.y-gy>1.2) continue; if(hAt(x,z)>w.y+.05) continue; _v.set(x,w.y,z).applyMatrix4(w.inv); if(w.kind===1?Math.hypot(_v.x,_v.y)<w.a*.92:(Math.abs(_v.x)<w.a*.95&&Math.abs(_v.y)<w.b*.92)) return w; } return null; }
  function ring(x,y,z,sz,d,op){ if(!rings) return; const r=rings[rgi=(rgi+1)%rings.length]; r.t=0; r.d=d||.9; r.sz=sz||1.6; r.op=Math.min(1,(op||.75)*1.25); r.m.position.set(x,y+.04,z); r.m.visible=true; r.m.scale.setScalar(.2); r.m.material.opacity=r.op; }
  function drops(x,y,z,n,big){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2; const p=puffs[pi=(pi+1)%puffs.length]; p.x=x+Math.cos(a)*.2; p.z=z+Math.sin(a)*.2; p.y=y+.15; p.vx=Math.cos(a)*rnd(.8,2)*big; p.vz=Math.sin(a)*rnd(.8,2)*big; p.vy=rnd(2.2,3.6)*big; p.t=0; p.d=rnd(.4,.6); p.sz=rnd(.6,1)*big; p.op=PO[4]; p.m.material.color.setHex(PC[4]); p.m.visible=true; p.m.position.set(p.x,p.y,p.z); } }
  function splashSnd(big){ try{ tone(big?520:880+Math.random()*260,big?.12:.05,"sine",0,big?.07:.035); tone(big?300:1300+Math.random()*300,.05,"triangle",.03,big?.05:.02); }catch(e){} }
  function puff(x,z,g,fx,fz,big){ const p=puffs[pi=(pi+1)%puffs.length]; const y0=hAt(x,z)+.25; p.x=x; p.z=z; p.y=y0; p.vx=-fx*rnd(1,2.2)*big+rnd(-.5,.5); p.vz=-fz*rnd(1,2.2)*big+rnd(-.5,.5); p.vy=rnd(.8,1.6)*(g===1?1.3:1); p.t=0; p.d=rnd(.45,.7)*(big>1?1.25:1); p.sz=rnd(.95,1.35)*big*(g===1?1.15:1); p.op=PO[g]; p.m.material.color.setHex(PC[g]); p.m.visible=true; p.m.position.set(x,y0,z); }
  function print(x,z,g,rot){ if(!prints.length||!FO[g]) return; const p=prints[ri=(ri+1)%prints.length]; p.m.material.color.setHex(FC[g]); p.op=FO[g]; p.t=0; p.d=g===1?6:4; p.m.position.set(x,hAt(x,z)+.2,z); p.m.rotation.set(-Math.PI/2,0,0); p.m.rotation.y=rot+Math.PI; p.m.rotation.x=-Math.PI/2; p.m.visible=true; }
  function step(fast){ const gy=(P.gy!=null?P.gy:hAt(P.x,P.z)); const w=waterAt(P.x,P.z,gy); if(w){ const fx=Math.sin(P.rot), fz=Math.cos(P.rot), rx=Math.cos(P.rot), rz=-Math.sin(P.rot); side=-side; const x=P.x+rx*side*.3, z=P.z+rz*side*.3; ring(x,w.y,z,fast?2.2:1.7,.85,.8); drops(x,w.y,z,ECO()?2:(HIGH()?(fast?6:4):3),fast?1.25:1); splashSnd(false); wIdle=0; return; }
    const g=ground(P.x,P.z); const fx=Math.sin(P.rot), fz=Math.cos(P.rot), rx=Math.cos(P.rot), rz=-Math.sin(P.rot); side=-side;
    const x=P.x+rx*side*.32-fx*.15, z=P.z+rz*side*.32-fz*.15; const big=fast?1.5:1;
    const n=ECO()?(fast?2:1):(HIGH()?(fast?3:2):(fast?2:1)); for(let i=0;i<n;i++) puff(x+rnd(-.15,.15),z+rnd(-.15,.15),g,fx,fz,big);
    print(x,z,g,P.rot); }
  function land(){ { const w=waterAt(P.x,P.z,(P.gy!=null?P.gy:hAt(P.x,P.z))); if(w){ ring(P.x,w.y,P.z,3.4,1.1,.9); ring(P.x,w.y,P.z,2.2,.8,.7); drops(P.x,w.y,P.z,ECO()?5:12,1.5); splashSnd(true); return; } }
    const g=ground(P.x,P.z); const n=ECO()?3:(HIGH()?8:5); for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; puff(P.x+Math.cos(a)*.5,P.z+Math.sin(a)*.5,g,-Math.cos(a),-Math.sin(a),1.3); }
    const rx=Math.cos(P.rot), rz=-Math.sin(P.rot); print(P.x+rx*.32,P.z+rz*.32,g,P.rot); print(P.x-rx*.32,P.z-rz*.32,g,P.rot); }
  function tick(dt){ if(!puffs){ if(typeof scene==="undefined") return; init(); }
    if(P.moving&&P.y===0&&!P.dead){ const k=Math.floor(P.walk/Math.PI); if(k!==last){ if(last>=0) step(P.haste>0||P.ride); last=k; } }
    if(prevY>.6&&P.y===0&&!P.dead) land(); prevY=P.y;
    wspT-=dt; if(wspT<=0){ wspT=wsp&&wsp.length?15:4; scanWater(); }
    if(!P.moving&&P.y===0&&!P.dead){ wIdle-=dt; if(wIdle<=0){ wIdle=1.3; const w=waterAt(P.x,P.z,(P.gy!=null?P.gy:hAt(P.x,P.z))); if(w) ring(P.x,w.y,P.z,1.3,1.4,.45); } }
    for(const r of rings){ if(!r.m.visible) continue; r.t+=dt; const k=r.t/r.d; if(k>=1){ r.m.visible=false; continue; } const e=1-Math.pow(1-k,2.2); r.m.scale.setScalar(.25+r.sz*e); r.m.material.opacity=r.op*(1-k)*(1-k*.3); }
    for(const p of puffs){ if(!p.m.visible) continue; p.t+=dt; const k=p.t/p.d; if(k>=1){ p.m.visible=false; continue; } const e=1-Math.pow(1-k,2); p.m.position.set(p.x+p.vx*e*.5,p.y+p.vy*e*.6,p.z+p.vz*e*.5); const s=p.sz*(.6+e*1.3); p.m.scale.set(s,s*.85,1); p.m.material.opacity=p.op*(1-k)*(k<.12?k/.12:1); }
    for(const p of prints){ if(!p.m.visible) continue; p.t+=dt; const k=p.t/p.d; if(k>=1){ p.m.visible=false; continue; } p.m.material.opacity=p.op*(k<.7?1:(1-k)/.3); } }
  return {tick,waterAt,scan:scanWater,_w:()=>wsp};
})();
</script>
