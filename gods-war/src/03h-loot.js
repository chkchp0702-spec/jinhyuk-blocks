<script>
/* ================= v30 보물 획득 연출 =================
   괴물이 장비를 떨어뜨리면: 작은 보물상자가 톡 튀어나와 통통 튀고 → 뚜껑이 열리며
   등급 색 빛기둥(일반 회색·희귀 파랑·영웅 보라·신화 금빛)이 솟고 빛가루가 터짐 →
   빛 구슬이 포물선을 그리며 내 몸으로 쏙 들어옴. 상자는 공유 모양·재질이라 가볍고 PointLight 없음. */
const LOOT=(()=>{ let G0=null;
  function base(){ if(G0) return G0; const L=c=>new THREE.MeshLambertMaterial({color:c});
    G0={body:new THREE.BoxGeometry(1,.62,.7), lid:new THREE.BoxGeometry(1.04,.26,.74), band:new THREE.BoxGeometry(1.06,.66,.12), lock:new THREE.BoxGeometry(.2,.24,.1),
      wood:L(0x8a5530), woodD:L(0x6b3e22), gold:L(0xf2c14e), orb:new THREE.SphereGeometry(.28,12,8), gp:new THREE.PlaneGeometry(.9,.6)};
    G0.lid.translate(0,.13,.37); return G0; }
  const hexOf=s=>parseInt(String(s).replace("#",""),16)||0xffffff;
  function chest(col){ const b=base(); const g=new THREE.Group();
    const body=new THREE.Mesh(b.body,b.wood); body.position.y=.31; g.add(body);
    for(const x of [-.36,.36]){ const bd=new THREE.Mesh(b.band,b.gold); bd.position.set(x,.32,0); bd.scale.x=.12; g.add(bd); }
    const pv=new THREE.Group(); pv.position.set(0,.62,-.37); g.add(pv);
    const lid=new THREE.Mesh(b.lid,b.woodD); pv.add(lid); const lb=new THREE.Mesh(b.lid,b.gold); lb.scale.set(.14,1.05,1.03); pv.add(lb); lb.position.x=0;
    const lock=new THREE.Mesh(b.lock,b.gold); lock.position.set(0,.5,.37); g.add(lock);
    // 상자 안에서 새어 나오는 등급 빛(뚜껑 열리면 보임)
    const gm=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}); g.material={dispose(){ gm.dispose(); }}; const glow=new THREE.Mesh(b.gp,gm); glow.rotation.x=-Math.PI/2; glow.position.y=.63; g.add(glow);
    g.traverse(o=>{ o.userData.noOutline=true; if(o.isMesh) o.castShadow=true; }); g.userData.pv=pv; g.userData.glow=glow; g.userData.lock=lock; return g; }
  // 밝은 눈밭에서도 색이 보이게: 진한 색 보통 섞기 겉껍질 + 빛나는 속심
  const deepC=c=>{ const k=new THREE.Color(c); k.multiplyScalar(.62); return k; };
  function beam(x,y,z,col,h,dur,r){ beam1(x,y,z,col,h,dur,r,true); beam1(x,y,z,col,h*1.05,dur,r*.38,false); }
  function beam1(x,y,z,col,h,dur,r,outer){ const mat=outer?new THREE.MeshBasicMaterial({color:deepC(col),map:lvTex(),transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}):lvMat(col,0);
    const m=new THREE.Mesh(LVFX.geo,mat); m.userData.noOutline=true; m.renderOrder=5; m.position.set(x,y,z); scene.add(m);
    FX.push({m,t:0,d:dur,tick:(f,k)=>{ const up=Math.min(1,k*6); const rr=r*(k<.1?.4+k*6:1-(k-.1)*.5); f.m.scale.set(rr,h*(.2+.8*Math.pow(up,.6)),rr); f.m.material.opacity=(outer?.7:.8)*(k<.08?k/.08:k>.7?(1-k)/.3:1); f.m.rotation.y+=.04; }}); }
  function orb(x,y,z,col,delay){ const b=base(); const m=new THREE.Mesh(b.orb,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})); m.userData.noOutline=true; m.position.set(x,y,z); scene.add(m);
    let trail=0; FX.push({m,t:-delay,d:.75,tick:(f,k,dt)=>{ if(k<0){ f.m.visible=false; return; } f.m.visible=true; const e=k*k*(3-2*k); const tx=P.x,ty=(P.gy||0)+1.4,tz=P.z;
      f.m.position.set(x+(tx-x)*e, y+(ty-y)*e+Math.sin(k*Math.PI)*3.2, z+(tz-z)*e); const s=1.4-k*.6; f.m.scale.setScalar(s); f.m.material.opacity=k<.1?k*10:1;
      trail+=dt; if(HIGH()&&trail>.06){ trail=0; fxSpark(f.m.position.x,f.m.position.y-hAt(f.m.position.x,f.m.position.z),f.m.position.z,col,3); }
      if(k>.96&&!f.done){ f.done=1; fxFlash(tx,1.2,tz,col,1.8,.35); fxRing(tx,tz,col,4,.45); tone(1568,.12,"sine",0,.08); } }}); }
  function drop(x,z,tier){ try{ const R=(typeof RAR!=="undefined"&&RAR[tier])||{c:"#ffffff"}; const col=hexOf(R.c); const hi=HIGH(); const y0=hAt(x,z);
    const g=chest(col); const ang=Math.random()*6.28; const ox=Math.sin(ang)*1.2, oz=Math.cos(ang)*1.2; g.rotation.y=Math.atan2(P.x-x,P.z-z); g.position.set(x,y0,z); g.scale.setScalar(.01); scene.add(g);
    const big=1.25+tier*.15; let opened=false;
    FX.push({m:g,t:0,d:2.6,tick:(f,k,dt)=>{ const t=f.t; let s=big, py=0;
      if(t<.55){ const u=t/.55; py=Math.sin(u*Math.PI)*2.4; s=big*Math.min(1,.3+u*1.6); g.position.x=x+ox*u; g.position.z=z+oz*u; g.rotation.z=Math.sin(u*12)*.15*(1-u); }
      else if(t<.8){ const u=(t-.55)/.25; py=Math.sin(u*Math.PI)*.5; s=big*(1+Math.sin(u*Math.PI)*.08); g.rotation.z=0; }
      else { const sq=t<.9?Math.sin((t-.8)/.1*Math.PI)*.12:0; s=big; g.scale.set(big*(1+sq),big*(1-sq),big*(1+sq)); }
      if(t<.8) g.scale.setScalar(s);
      const cx=g.position.x, cz=g.position.z; g.position.y=hAt(cx,cz)+py;
      if(t>=.9&&!opened){ opened=true; beam(cx,hAt(cx,cz),cz,col,(hi?9:6)+tier*3,1.7,.55+tier*.12); fxSpark(cx,1,cz,col,hi?26+tier*10:12+tier*4); fxSpark(cx,1,cz,0xfff2c0,hi?12:6); fxRing(cx,cz,col,3+tier*1.5,.6);
        if(tier>=2){ try{ SFX.shock(cx,cz,col,4+tier,.6); }catch(e){} } if(tier>=3){ fxFlash(cx,1.5,cz,0xffe08a,4,.5); P.shake=Math.max(P.shake||0,.4); }
        orb(cx,hAt(cx,cz)+1,cz,col,.35); tone(880,.08,"triangle"); tone(1318,.1,"triangle",.07); }
      const pv=g.userData.pv; if(opened){ const u=Math.min(1,(t-.9)/.25); pv.rotation.x=-1.9*(1-Math.pow(1-u,3)); g.userData.lock.visible=false; g.userData.glow.material.opacity=.9*Math.min(1,u*2)*(t>2.2?(2.6-t)/.4:1); }
      else if(t>.8){ pv.rotation.x=Math.sin(t*90)*.06; } // 덜컹덜컹
      if(t>2.2){ const v=Math.max(.01,(2.6-t)/.4); g.scale.setScalar(big*v); } }});
    if(tier>=2) setTimeout(()=>{ try{ tone(523,.1,"triangle"); tone(784,.12,"triangle",.08); tone(1046,.25,"triangle",.16); }catch(e){} },950);
  }catch(e){ console.warn(e); } }
  return {drop}; })();
</script>
