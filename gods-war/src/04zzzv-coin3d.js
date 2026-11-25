<script>
/* ================= v178: 괴물 처치·보상 때 3D 금화가 땅에 튕기며 떨어졌다 내게 빨려듦 =================
   괴물이 쓰러지면 몸에서 반짝이는 금화가 빙글빙글 돌며 톡 튀어나와 땅에 "찰랑" 한두 번 튕기고,
   잠깐 세워진 채 빙글 돌다가 점점 빨라지며 내 쪽으로 휘어 날아와 쏙 들어감(들어갈 때 금빛으로 반짝).
   상자·현상금 같은 보상 금화(COINFLY.burst 를 부르는 곳 모두)도 내 둘레에서 분수처럼 튀었다 들어옴.
   금화 InstancedMesh 1개(앞뒷면·테두리 재질 2개 → 금화 있을 때만 그림 +2), 반짝 받는 Phong 재질 + 은은한 자체 빛(어두운 곳에서도 보임), PointLight 없음.
   화면 위 금화 칸으로 날아가는 v65 동전(COINFLY)은 그대로 — 이건 세상 속 3D 모습만. 금화 양·계산은 그대로. */
const COIN3D=(()=>{
  let im=null, N=0, i0=0, wasOn=false; const O=[];
  const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler(), V=new THREE.Vector3(), S=new THREE.Vector3(), C=new THREE.Color();
  const GOLD=new THREE.Color(1,.66,.1), SHINE=new THREE.Color(1,.93,.55);
  function init(){ N=HIGH()&&!ECO()?40:20;
    const geo=new THREE.CylinderGeometry(.3,.3,.07,18,1); geo.rotateX(Math.PI/2); // 동전 앞면이 옆(Z)을 봄 → Y축으로 돌리면 빙글
    const face=new THREE.MeshPhongMaterial({color:0xffffff,specular:0xffe27a,shininess:55,emissive:0x3a2000,fog:true});
    const rim=new THREE.MeshPhongMaterial({color:0xb8601a,specular:0x806020,shininess:30,emissive:0x2a1000,fog:true}); // 테두리는 진한 구릿빛 → 동전처럼 보임
    im=new THREE.InstancedMesh(geo,[rim,face,face],N); im.frustumCulled=false; im.userData.noLod=true; im.userData.noOutline=true; im.renderOrder=3;
    for(let k=0;k<N;k++){ M4.makeScale(0,0,0); im.setMatrixAt(k,M4); im.setColorAt(k,C.copy(GOLD)); O.push({on:0}); }
    im.visible=false; scene.add(im); }
  function spawn(x,y,z,n){ try{ if(typeof scene==="undefined"||document.hidden) return; if(!im) init();
      if(Math.hypot(x-P.x,z-P.z)>45) return; const g=hAt(x,z), self=Math.hypot(x-P.x,z-P.z)<.5;
      n=Math.min(n||3,ECO()?6:12);
      for(let i=0;i<n;i++){ const o=O[i0=(i0+1)%N]; const a=Math.random()*Math.PI*2, sp=self?rnd(2.2,4):rnd(1.4,3.6);
        o.on=1; o.x=x; o.y=g+Math.max(.7,(y||1)*.8); o.z=z; o.vx=Math.cos(a)*sp; o.vz=Math.sin(a)*sp; o.vy=rnd(5.5,9); o.g=g; o.t=0;
        o.home=rnd(.85,1.2)+i*.06; o.hs=0; o.ry=Math.random()*6.28; o.spin=rnd(9,15)*(Math.random()<.5?-1:1); o.tilt=rnd(-.5,.5); o.pop=0; o.bn=0; o.fl=0; } }catch(e){} }
  function hide(k){ M4.makeScale(0,0,0); im.setMatrixAt(k,M4); }
  function tick(dt){ if(!im) return; let live=false; const px=P.x, pz=P.z, py=(typeof player!=="undefined"&&player?player.position.y:hAt(px,pz))+1.1;
    for(let k=0;k<N;k++){ const o=O[k]; if(!o.on) continue; live=true; o.t+=dt; o.fl=Math.max(0,o.fl-dt*4);
      if(o.pop>0){ o.pop+=dt; const q=o.pop/.14; if(q>=1){ o.on=0; hide(k); continue; }
        const s=(1-q)*1.5+.05; o.ry+=dt*30; E.set(0,o.ry,0); Q.setFromEuler(E); V.set(px,py,pz); S.set(s,s,s); M4.compose(V,Q,S); im.setMatrixAt(k,M4); im.setColorAt(k,C.copy(SHINE)); continue; }
      let s=Math.min(1,o.t/.06);
      if(o.t<o.home){ // 튀어나와 땅에 찰랑 튕김
        o.vy-=24*dt; o.x+=o.vx*dt; o.y+=o.vy*dt; o.z+=o.vz*dt; o.vx*=1-1.8*dt; o.vz*=1-1.8*dt;
        const gy=o.g+.3; if(o.y<gy){ o.y=gy; if(o.bn<2&&o.vy<-1.5){ o.vy=-o.vy*.42; o.bn++; o.fl=1; o.spin*=.75; try{ if(k%3===0) tone(2600+Math.random()*500,.035,"triangle",0,.02); }catch(e){} } else { o.vy=0; o.vx*=.8; o.vz*=.8; } }
        o.ry+=o.spin*dt; o.spin*=1-.6*dt; E.set(o.tilt*(o.bn<2?1:.3),o.ry,0);
        if(o.t>o.home*.75) o.y+=dt*1.4; // 떠오를 준비
      } else { // 내 쪽으로 휘어 빨려듦
        o.hs=Math.min(o.hs+dt*32,28); const dx=px-o.x, dy=py-o.y, dz=pz-o.z, d=Math.hypot(dx,dy,dz);
        if(d<.45||o.t>o.home+3){ o.pop=.001; try{ if(k%3===0) tone(1760+Math.random()*300,.05,"sine",0,.03); }catch(e){} continue; }
        const st=Math.min(d,o.hs*dt); const sw=Math.sin(o.ry*.3+o.t*6)*Math.min(1,d/4)*.8*dt*6;
        o.x+=dx/d*st+(-dz/d)*sw; o.y+=dy/d*st+Math.max(0,d-2)*dt*.7; o.z+=dz/d*st+(dx/d)*sw;
        o.ry+=dt*22; E.set(0,o.ry,0); s*=1+Math.min(.25,o.hs*.012); }
      Q.setFromEuler(E); V.set(o.x,o.y,o.z); S.set(s,s,s); M4.compose(V,Q,S); im.setMatrixAt(k,M4);
      const gl=Math.max(o.fl,Math.pow(Math.max(0,Math.cos(o.ry*2)),24)*.8); // 튕길 때·앞면이 정면 볼 때 반짝
      im.setColorAt(k,C.copy(GOLD).lerp(SHINE,gl)); }
    im.visible=live;
    if(live||wasOn){ im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; } wasOn=live; }
  XTICK.push(tick);
  if(typeof COINFLY!=="undefined"){ const _b=COINFLY.burst; COINFLY.burst=function(x,y,z,n){ _b(x,y,z,n); spawn(x,y,z,n); }; }
  return {spawn,tick,get live(){ return O.filter(o=>o.on).length; }};
})();
</script>
