<script>
/* ================= v175: 괴물 처치 때 3D 경험치 구슬이 몸에서 튀어나와 땅에 통통 튄 뒤 내 가슴으로 빨려듦 =================
   괴물이 쓰러지면 몸에서 파란·보랏빛 빛 구슬이 사방으로 톡 튀어나와 땅에 한두 번 통통 튀고, 잠깐 둥실 떠 있다가
   점점 빨라지며 내 가슴으로 휘어 날아와 쏙 들어감(들어갈 때 하얗게 반짝이며 쏙 작아져 사라짐). 보스는 더 많이.
   빛 구슬 알맹이 + 흐린 빛무리 InstancedMesh 2개(둘 다 보통 섞기 — 더하기 빛은 흰 눈밭에서 하얗게 묻힘)(구슬 있을 때만 그림 +2), PointLight 없음. 절약 모드·「낮음」은 개수 줄임.
   화면 위 경험치 바로 날아가는 v98 구슬(XPFLY)은 그대로 — 이건 세상 속 3D 모습만. 경험치 계산은 그대로. */
const XPORB=(()=>{
  let core=null, halo=null, N=0, i0=0, wasOn=false, t=0; const O=[];
  const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S=new THREE.Vector3(), C=new THREE.Color();
  const COLS=[new THREE.Color(.1,.55,1), new THREE.Color(.15,.8,1), new THREE.Color(.55,.3,1)]; const WH=new THREE.Color(1,1,1);
  function init(){ N=HIGH()&&!ECO()?48:24;
    const mk=(geo,op,add)=>{ const im=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,fog:false}),N);
      im.frustumCulled=false; im.userData.noLod=true; im.renderOrder=3; for(let k=0;k<N;k++){ M4.makeScale(0,0,0); im.setMatrixAt(k,M4); im.setColorAt(k,C.setRGB(0,0,0)); } im.visible=false; scene.add(im); return im; };
    core=mk(new THREE.IcosahedronGeometry(.2,1),1,false); halo=mk(new THREE.IcosahedronGeometry(.46,1),.3,false); halo.renderOrder=2; // 둘 다 보통 섞기 — 더하기 빛은 흰 눈밭에서 하얗게 묻혀 버림
    for(let k=0;k<N;k++) O.push({on:0}); }
  function spawn(x,y,z,n){ try{ if(typeof scene==="undefined"||document.hidden) return; if(!core) init();
      if(Math.hypot(x-P.x,z-P.z)>45) return; const g=hAt(x,z);
      n=ECO()?Math.min(Math.round((n||3)*1.5),6):Math.min(Math.round((n||3)*2.5),16);
      for(let i=0;i<n;i++){ const o=O[i0=(i0+1)%N]; const a=Math.random()*Math.PI*2, sp=rnd(1.8,4.2);
        o.on=1; o.x=x; o.y=g+Math.max(.8,y*.8); o.z=z; o.vx=Math.cos(a)*sp; o.vz=Math.sin(a)*sp; o.vy=rnd(5,8.5); o.g=g; o.t=0;
        o.home=rnd(.75,1.15)+i*.05; o.hs=0; o.c=COLS[i%3]; o.ph=Math.random()*6.28; o.pop=0; o.bn=0; } }catch(e){} }
  function hide(k){ M4.makeScale(0,0,0); core.setMatrixAt(k,M4); halo.setMatrixAt(k,M4); }
  function tick(dt){ if(!core) return; t+=dt; let live=false; const px=P.x, pz=P.z, py=(typeof player!=="undefined"&&player?player.position.y:hAt(px,pz))+1.3;
    for(let k=0;k<N;k++){ const o=O[k]; if(!o.on) continue; live=true; o.t+=dt;
      if(o.pop>0){ o.pop+=dt; const q=o.pop/.16; if(q>=1){ o.on=0; hide(k); continue; }
        const s=(1-q)*1.6+.05; V.set(px,py,pz); S.set(s,s,s); M4.compose(V,Q,S); core.setMatrixAt(k,M4); halo.setMatrixAt(k,M4);
        core.setColorAt(k,C.copy(o.c).lerp(WH,.6)); halo.setColorAt(k,C.copy(o.c).lerp(WH,.3)); continue; }
      if(o.t<o.home){ // 튀어나와 땅에 통통
        o.vy-=22*dt; o.x+=o.vx*dt; o.y+=o.vy*dt; o.z+=o.vz*dt; o.vx*=1-1.6*dt; o.vz*=1-1.6*dt;
        const gy=o.g+.16; if(o.y<gy){ o.y=gy; if(o.bn<2&&o.vy<-1.5){ o.vy=-o.vy*.45; o.bn++; } else { o.vy=0; } }
        if(o.t>o.home*.7) o.y+=dt*1.2; // 떠오를 준비
      } else { // 내 가슴으로 휘어 빨려듦
        o.hs=Math.min(o.hs+dt*34,30); const dx=px-o.x, dy=py-o.y, dz=pz-o.z, d=Math.hypot(dx,dy,dz);
        if(d<.45||o.t>o.home+3){ o.pop=.001; try{ if(k%4===0) tone(2200+Math.random()*400,.04,"sine",0,.025); }catch(e){} continue; }
        const st=Math.min(d,o.hs*dt); const sw=Math.sin(o.ph+o.t*7)*Math.min(1,d/4)*.9*dt*6; // 살짝 옆으로 휘기
        o.x+=dx/d*st+(-dz/d)*sw; o.y+=dy/d*st+Math.max(0,d-2)*dt*.6; o.z+=dz/d*st+(dx/d)*sw; }
      const pulse=1+Math.sin(o.ph+t*9)*.18, fade=Math.min(1,o.t/.08);
      const s=(o.t<o.home?1:1+Math.min(.4,o.hs*.02))*pulse*fade;
      V.set(o.x,o.y,o.z); S.set(s,s,s); M4.compose(V,Q,S); core.setMatrixAt(k,M4); halo.setMatrixAt(k,M4);
      core.setColorAt(k,C.copy(o.c).lerp(WH,.12+Math.sin(o.ph+t*9)*.1)); halo.setColorAt(k,C.copy(o.c)); }
    core.visible=halo.visible=live;
    if(live||wasOn){ for(const im of [core,halo]){ im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; } } wasOn=live; }
  XTICK.push(tick);
  if(typeof XPFLY!=="undefined"){ const _b=XPFLY.burst; XPFLY.burst=function(x,y,z,n){ _b(x,y,z,n); spawn(x,y,z,n); }; }
  return {spawn,tick,get live(){ return O.filter(o=>o.on).length; }};
})();
</script>
