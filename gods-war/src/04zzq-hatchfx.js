<script>
/* ================= 신수 알 부화 연출 (v125) =================
   알이 깨어날 때 바로 창이 뜨지 않고, 내 앞 땅에서 알이 통 튀어 오르며 나타나
   점점 세게 흔들리고(톡·톡 소리) 금이 하나씩 가며 금 사이로 빛이 새어 나옴 →
   펑! 껍데기 조각이 사방으로 튀고 빛기둥·고리·반짝이가 터진 뒤 "알이 깨어났어요" 창.
   모습만 — 부화 규칙·저장(hatchEgg 안의 일)은 그대로, 창이 1.7초 늦게 뜰 뿐.
   그리기 호출: 연출 동안만 알 1 + 무늬 3 + 금 1(조각은 터진 뒤 8), PointLight 없음. */
const HATCH_SPD={v:1};   // 시험할 때 천천히 보려고(평소 1)
const HATCH=(()=>{ let busy=false, live=null; const ES=1.9, EY=.66*1.9;   // 알 크기·가운데 높이
  const DARK=new THREE.Color(0x2a1406), LITC=new THREE.Color(0xfff1a0), CK=new THREE.Color();
  const SHELL=new THREE.SphereGeometry(.5,6,4,0,Math.PI*.62,0,Math.PI*.55);
  // 알 표면(반지름 .5 공을 (sx,sy,sz)로 늘린 것) 위의 점
  function surf(th,ph,S){ const s=Math.sin(th); return new THREE.Vector3(s*Math.cos(ph)*.5*S[0]*1.03, Math.cos(th)*.5*S[1]*1.03, s*Math.sin(ph)*.5*S[2]*1.03); }
  // 금(빛 새는 틈): 가운데 지그재그 한 바퀴 + 위아래로 뻗는 가지. 나타날 순서대로 띠 조각을 쌓음
  function crackGeo(S){ const segs=[]; const N=22; let prev=null;
    for(let i=0;i<=N;i++){ const ph=i/N*Math.PI*2, th=Math.PI*.5+(i%2?.16:-.12)+Math.sin(i*1.7)*.05; const p=surf(th,ph,S); if(prev) segs.push([prev,p]); prev=p; }
    const br=[[0,.35],[5,-.38],[9,.3],[13,-.34],[17,.36],[20,-.3]];
    br.forEach(([i,d])=>{ const ph=i/N*Math.PI*2; let th=Math.PI*.5, q=surf(th,ph,S); for(let k=0;k<3;k++){ th-=d*.33; const p2=surf(th,ph+(k%2?.12:-.1),S); segs.push([q,p2]); q=p2; } });
    // 처음엔 한 점에서 시작해 퍼지듯: 0번 근처부터 가까운 순
    segs.sort((a,b)=>a[0].distanceTo(segs[0][0])-b[0].distanceTo(segs[0][0]));
    const pos=new Float32Array(segs.length*18); let o=0; const w=.045;
    segs.forEach(([a,b])=>{ const n=a.clone().add(b).normalize(); const d=b.clone().sub(a); const s=d.clone().cross(n).normalize().multiplyScalar(w);
      const v=[a.clone().add(s),a.clone().sub(s),b.clone().add(s),b.clone().add(s),a.clone().sub(s),b.clone().sub(s)];
      v.forEach(p=>{ pos[o++]=p.x; pos[o++]=p.y; pos[o++]=p.z; }); });
    const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setDrawRange(0,0); g.userData.n=segs.length; return g; }
  function play(r,done){ const D=PETS[r]||PETS[0]; const S=[1.0,1.3,1.0];
    // 카메라에서 잘 보이게: 내 캐릭터 옆(화면 오른쪽)·살짝 뒤쪽(아래 버튼에 안 가리게)
    let cx=Math.sin(P.rot||0), cz=Math.cos(P.rot||0); try{ const dx=camera.position.x-P.x, dz=camera.position.z-P.z, l=Math.hypot(dx,dz); if(l>.5){ cx=dx/l; cz=dz/l; } }catch(e){}
    const x=P.x-cz*2.3-cx*1.8, z=P.z+cx*2.3-cz*1.8, gy=hAt(x,z);
    const g=new THREE.Group(); g.position.set(x,gy,z); g.userData.noLod=true;
    const em=new THREE.Color(0xffe9a0);
    const m1=new THREE.MeshStandardMaterial({color:D.c,roughness:.4,metalness:.1,emissive:em,emissiveIntensity:0});
    const m2=new THREE.MeshStandardMaterial({color:D.c2,roughness:.5,emissive:em,emissiveIntensity:0});
    const egg=new THREE.Group(); egg.scale.setScalar(ES); g.add(egg);
    const shell=new THREE.Mesh(GEO.sph,m1); shell.scale.set(S[0],S[1],S[2]); egg.add(shell);
    [[.55,.6,.9],[1.1,2.4,.75],[.8,4.2,.8]].forEach(([th,ph,s])=>{ const p=surf(th,ph,S); const d=new THREE.Mesh(GEO.sph,m2); d.scale.set(.26*s,.2*s,.26*s); d.position.copy(p.multiplyScalar(.97)); d.lookAt(0,0,0); egg.add(d); });
    const cg=crackGeo(S), cm=new THREE.MeshBasicMaterial({color:0xfff2b0,side:THREE.DoubleSide,transparent:true,opacity:1,fog:false,depthWrite:false});
    const crack=new THREE.Mesh(cg,cm); crack.userData.noOutline=true; egg.add(crack);
    g.traverse(o=>{ o.userData.noLod=true; });
    scene.add(g);
    try{ fxRing(x,z,D.c,3,.5); }catch(e){}
    live={g,egg,shell,cg,cm,m1,m2,t:0,x,z,gy,D,done,shards:null,ticks:0,boom:false};
  }
  function boom(L){ L.boom=true; const {x,z,D}=L, y=L.gy+EY;
    L.egg.visible=false;
    const sh=[]; const n=ECO()?6:8;
    for(let i=0;i<n;i++){ const m=new THREE.Mesh(SHELL,i%3===2?L.m2:L.m1); m.material.side=THREE.DoubleSide; m.scale.setScalar(rnd(.7,1.05));
      const a=i/n*Math.PI*2+rnd(-.3,.3); m.position.set(x+Math.cos(a)*.35,y+rnd(-.3,.4),z+Math.sin(a)*.35); m.rotation.set(rnd(0,6),rnd(0,6),rnd(0,6));
      m.userData.noLod=true; scene.add(m); sh.push({m,vx:Math.cos(a)*rnd(3,5.5),vy:rnd(4,7.5),vz:Math.sin(a)*rnd(3,5.5),sx:rnd(-9,9),sy:rnd(-9,9),rest:false}); }
    L.shards=sh; L.t2=0;
    L.m1.emissiveIntensity=0; L.m2.emissiveIntensity=0;
    try{ fxFlash(x,.9,z,0xffffff,4.2,.45); fxFlash(x,.9,z,D.c,6,.6); fxRing(x,z,0xfff0b0,9,.7); fxRing(x,z,D.c,13,1.0); fxSpark(x,1,z,0xfff3a0,ECO()?24:40); fxSpark(x,1,z,D.c,ECO()?14:24);
      if(typeof fxBolt==="function"&&!ECO()){ const b=cyl(.5,1.4,30,glowMat(0xfff3c0,.55),x,15+L.gy,z,10); b.userData.noOutline=true; scene.add(b); FX.push({m:b,t:0,d:.6,size:1,kind:"bolt"}); } }catch(e){}
    try{ tone(196,.25,"sine",0); tone(1568,.12,"triangle",.02); }catch(e){}
    buzz([30,20,60]);
  }
  function tick(dt){ const L=live; if(!L) return; dt*=HATCH_SPD.v; L.t+=dt; const t=L.t;
    if(!L.boom){
      // 0~.35 튀어나와 통! · .35~1.55 흔들림(점점 세게) + 금 · 1.6 펑
      let y, sq=1;
      if(t<.35){ const u=t/.35; y=Math.sin(u*Math.PI)*1.3+EY*u; sq=1+(1-u)*.15; } else { y=EY; const u=Math.min(1,(t-.35)/.12); if(u<1) sq=1-.18*Math.sin(u*Math.PI); }
      L.egg.position.y=y; L.egg.scale.set(ES/Math.sqrt(sq),ES*sq,ES/Math.sqrt(sq));
      if(t>.35){ const u=Math.min(1,(t-.35)/1.2), amp=.05+u*u*.28, f=7+u*12;
        const pulse=Math.max(0,Math.sin((t-.35)*Math.PI*2.4));   // 쉬었다 흔들었다
        L.egg.rotation.z=Math.sin(t*f)*amp*(.35+.65*pulse); L.egg.rotation.x=Math.cos(t*f*.8)*amp*.4*pulse;
        L.egg.position.x=Math.sin(t*f*1.3)*amp*.15*pulse;
        const nShow=Math.floor(Math.min(1,u*1.4)*L.cg.userData.n); L.cg.setDrawRange(0,nShow*6);
        const k=Math.floor(nShow/6); if(k>L.ticks){ L.ticks=k; try{ tone(1200+k*160,.05,"square",0); }catch(e){} if(k%2) buzz(12); }
        const glow=t>1.3?(t-1.3)*1.3:0; L.m1.emissiveIntensity=glow; L.m2.emissiveIntensity=glow;
        // 금: 처음엔 진한 갈색 틈 → 터지기 직전 안에서 빛이 새어 금빛으로 번쩍번쩍
        const lit=Math.max(0,Math.min(1,(u-.55)/.4)); CK.copy(DARK).lerp(LITC,lit*(.75+.25*Math.sin(t*26))); L.cm.color.copy(CK);
      }
      L.g.rotation.y+=dt*.6;
      if(t>=1.6) boom(L);
    } else {
      L.t2+=dt; const fade=Math.max(0,1-(L.t2-.6)/.5);
      L.shards.forEach(s=>{ if(!s.rest){ s.vy-=18*dt; s.m.position.x+=s.vx*dt; s.m.position.y+=s.vy*dt; s.m.position.z+=s.vz*dt; s.m.rotation.x+=s.sx*dt; s.m.rotation.y+=s.sy*dt;
          const gy=hAt(s.m.position.x,s.m.position.z)+.06; if(s.m.position.y<gy){ s.m.position.y=gy; if(s.vy<-3){ s.vy*=-.3; s.vx*=.5; s.vz*=.5; s.sx*=.4; s.sy*=.4; } else s.rest=true; } }
        s.m.scale.setScalar(Math.max(.001,s.m.scale.x*(fade<1?.92:1))); });
      if(L.t2>.12&&L.done){ const d=L.done; L.done=null; try{ d(); }catch(e){ console.error(e); } }
      if(L.t2>1.4){ end(); }
    } }
  function end(){ const L=live; if(!L) return; live=null; busy=false;
    try{ scene.remove(L.g); (L.shards||[]).forEach(s=>scene.remove(s.m)); L.cg.dispose(); L.cm.dispose(); L.m1.dispose(); L.m2.dispose(); }catch(e){}
    if(L.done){ const d=L.done; L.done=null; try{ d(); }catch(e){} } }
  XTICK.push(tick);
  const _he=hatchEgg;
  hatchEgg=function(){ if(busy) return; if(!G.egg) return _he.apply(this,arguments);
    if(P.dead||(typeof scene==="undefined")){ return _he.apply(this,arguments); }
    busy=true; const r=G.egg.r, self=this, args=arguments;
    try{ play(r,()=>_he.apply(self,args)); }catch(e){ console.error(e); busy=false; live=null; return _he.apply(this,arguments); }
    let lastT=-1; const guard=()=>{ if(!busy||!live) return; if(live.t===lastT){ end(); return; } lastT=live.t; setTimeout(guard,2500); }; setTimeout(guard,2500);   // 화면이 멈춰(프레임 안 돔) 있으면 창은 바로 뜨게
  };
  return {play,_L:()=>live,_s:()=>({busy,live:!!live,t:live&&live.t})};
})();
</script>
