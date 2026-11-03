<script>
/* ================= 기술 이펙트 다듬기 (v21) =================
   - 기술 쓰면 발밑에 빙글 도는 마법진
   - 충격파: 부드러운 빛 고리 2겹(밝은 바탕에서도 보이게 색 테두리 + 빛) + 흙먼지
   - 일직선 기술: 앞으로 뻗는 빛줄기(가운데 하얀 심 + 색 테두리) + 잔상 + 땅에 남는 자국
   - 번개·폭발: 하얀 공 대신 부드럽게 퍼지는 빛
   모두 그리기 몇 번뿐, PointLight 없음. 흙먼지·잔상은 그래픽 높음일 때 더 많이. */
const SFX=(()=>{ const T={}; const PL=new THREE.PlaneGeometry(1,1);
  function can(n,draw){ if(T[n]) return T[n]; const c=document.createElement("canvas"); c.width=c.height=128; const g=c.getContext("2d"); draw(g,128); const t=new THREE.CanvasTexture(c); T[n]=t; return t; }
  const soft=()=>can("soft",(g,s)=>{ const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); r.addColorStop(0,"rgba(255,255,255,1)"); r.addColorStop(.25,"rgba(255,255,255,.75)"); r.addColorStop(.6,"rgba(255,255,255,.18)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,s,s); });
  const ring=()=>can("ring",(g,s)=>{ const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); r.addColorStop(0,"rgba(255,255,255,0)"); r.addColorStop(.55,"rgba(255,255,255,.05)"); r.addColorStop(.82,"rgba(255,255,255,.65)"); r.addColorStop(.9,"rgba(255,255,255,1)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,s,s); });
  const rune=()=>can("rune",(g,s)=>{ const c=s/2; g.strokeStyle="#fff"; g.fillStyle="#fff"; g.lineWidth=3; g.beginPath(); g.arc(c,c,c-4,0,7); g.stroke(); g.lineWidth=1.6; g.beginPath(); g.arc(c,c,c-14,0,7); g.stroke(); g.beginPath(); g.arc(c,c,c*.42,0,7); g.stroke();
    g.lineWidth=2; g.beginPath(); for(let i=0;i<=6;i++){ const a=i*Math.PI*4/6*1.5-Math.PI/2; const r=c-14; const x=c+Math.cos(i*Math.PI*2/6*2-Math.PI/2)*r, y=c+Math.sin(i*Math.PI*2/6*2-Math.PI/2)*r; i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke(); g.beginPath(); for(let i=0;i<=6;i++){ const x=c+Math.cos(i*Math.PI*2/6*2-Math.PI/2+Math.PI/6*2)*(c-14), y=c+Math.sin(i*Math.PI*2/6*2-Math.PI/2+Math.PI/6*2)*(c-14); i?g.lineTo(x,y):g.moveTo(x,y); } g.stroke();
    for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; g.save(); g.translate(c+Math.cos(a)*(c-9),c+Math.sin(a)*(c-9)); g.rotate(a); g.fillRect(-1,-2.5,2,5); g.restore(); }
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+Math.PI/6; g.beginPath(); g.arc(c+Math.cos(a)*c*.66,c+Math.sin(a)*c*.66,4,0,7); g.fill(); } });
  const beam=()=>can("beam",(g,s)=>{ const r=g.createLinearGradient(0,0,s,0); r.addColorStop(0,"rgba(255,255,255,0)"); r.addColorStop(.3,"rgba(255,255,255,.55)"); r.addColorStop(.5,"rgba(255,255,255,1)"); r.addColorStop(.7,"rgba(255,255,255,.55)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,s,s); g.globalCompositeOperation="destination-in"; const v=g.createLinearGradient(0,0,0,s); v.addColorStop(0,"rgba(0,0,0,0)"); v.addColorStop(.12,"rgba(0,0,0,1)"); v.addColorStop(.85,"rgba(0,0,0,1)"); v.addColorStop(1,"rgba(0,0,0,0)"); g.fillStyle=v; g.fillRect(0,0,s,s); });
  const scar=()=>can("scar",(g,s)=>{ const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); r.addColorStop(0,"rgba(40,28,20,.9)"); r.addColorStop(.55,"rgba(40,28,20,.5)"); r.addColorStop(1,"rgba(40,28,20,0)"); g.fillStyle=r; g.fillRect(0,0,s,s); });
  function mat(tex,color,op,add){ return new THREE.MeshBasicMaterial({map:tex,color,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,side:THREE.DoubleSide}); }
  function flat(tex,color,op,add,x,z,y){ const m=new THREE.Mesh(PL,mat(tex,color,op,add)); m.rotation.x=-Math.PI/2; m.position.set(x,(y||.15)+hAt(x,z),z); m.userData.noOutline=true; m.renderOrder=3; scene.add(m); return m; }
  function sprite(tex,color,op,add){ const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending})); m.renderOrder=4; scene.add(m); return m; }
  const ease=k=>1-Math.pow(1-k,3);
  // 밝은 바탕(눈·모래)에서도 보이게: 색을 진하게 만든 테두리 색
  const hsl={}; function deep(color){ const c=new THREE.Color(color); c.getHSL(hsl); if(hsl.s<.12) return new THREE.Color(0x5fb4ff); c.setHSL(hsl.h,Math.max(hsl.s,.85),Math.min(hsl.l,.55)); return c; }
  // 부드러운 빛(하얀 공 대신)
  function glow(x,y,z,color,size,dur){ const m=sprite(soft(),color,1,true); m.position.set(x,y,z); m.scale.setScalar(.01); FX.push({m,t:0,d:dur||.35,tick:(f,k)=>{ const s=size*(.5+ease(k)*.9)*2; m.scale.set(s,s,1); m.material.opacity=1-k*k; }}); }
  // 충격파 2겹 + 흙먼지
  function shock(x,z,color,r,dur){ dur=dur||.55; const a=flat(ring(),color,.95,true,x,z,.18), b=flat(ring(),deep(color),.6,false,x,z,.16); const w=flat(ring(),0xffffff,.9,true,x,z,.2);
    FX.push({m:a,t:0,d:dur,tick:(f,k)=>{ const s=r*2.1*ease(k)+.5; a.scale.set(s,s,1); a.material.opacity=.95*(1-k); }});
    FX.push({m:b,t:0,d:dur*1.1,tick:(f,k)=>{ const s=r*2.2*ease(k)+.5; b.scale.set(s,s,1); b.material.opacity=.6*(1-k); }});
    FX.push({m:w,t:-dur*.18,d:dur*.85,tick:(f,k)=>{ if(k<0){ w.visible=false; return; } w.visible=true; const s=r*1.5*ease(k)+.3; w.scale.set(s,s,1); w.material.opacity=.9*(1-k); }});
    dust(x,z,HIGH()?10:5,r*.75); }
  function dust(x,z,n,r){ for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+rnd(-.3,.3); const m=sprite(soft(),0xcbb79a,.55,false); const sp=r*rnd(.6,1.1); const y0=hAt(x,z)+.5; m.position.set(x,y0,z); const sz=rnd(1.4,2.4); FX.push({m,t:0,d:rnd(.6,.9),tick:(f,k)=>{ const e=ease(k); m.position.set(x+Math.cos(a)*sp*e,y0+e*1.1,z+Math.sin(a)*sp*e); const s=sz*(.6+e*1.2); m.scale.set(s,s,1); m.material.opacity=.55*(1-k); }}); } }
  // 발밑 마법진
  function runeAt(x,z,color,size,dur){ const m=flat(rune(),deep(color),0,false,x,z,.22); const m2=flat(soft(),color,0,true,x,z,.19); dur=dur||.9;
    FX.push({m,t:0,d:dur,tick:(f,k,dt)=>{ const s=size*(k<.2?ease(k/.2):1+(k-.2)*.15); m.scale.set(s,s,1); m.rotation.z+=dt*2.4; m.material.opacity=(k<.2?k/.2:1-(k-.2)/.8)*.95; }});
    FX.push({m:m2,t:0,d:dur,tick:(f,k)=>{ const s=size*1.3; m2.scale.set(s,s,1); m2.material.opacity=(k<.2?k/.2:1-(k-.2)/.8)*.45; }}); }
  // 일직선 빛줄기 + 잔상 + 땅 자국
  function beamLine(x,z,rot,len,w,color){ const sx=Math.sin(rot), sz=Math.cos(rot); const y=1.3+hAt(x,z);
    const mk=(tex,c,op,add,width,yy,d,delay,vert)=>{ const m=new THREE.Mesh(PL,mat(tex,c,0,add)); m.rotation.order="YXZ"; if(vert){ m.rotation.y=rot+Math.PI/2; m.rotation.z=Math.PI/2; } else { m.rotation.y=rot; m.rotation.x=-Math.PI/2; } m.userData.noOutline=true; m.renderOrder=4; scene.add(m);
      FX.push({m,t:-(delay||0),d,tick:(f,k)=>{ if(k<0){ m.visible=false; return; } m.visible=true; const g=Math.min(1,k/.22); const L=len*ease(g); m.scale.set(width*(1-k*.5),L,1); m.position.set(x+sx*L/2,yy,z+sz*L/2); m.material.opacity=op*(k<.22?1:1-(k-.22)/.78); }}); };
    const dc=deep(color); mk(beam(),dc,.8,false,w*2,y,.5); mk(beam(),dc,.7,false,w*1.1,y,.5,0,true); mk(beam(),color,1,true,w*1.4,y+.05,.45); mk(beam(),0xffffff,.95,true,w*.5,y+.1,.32); mk(beam(),0xffffff,.9,true,w*.45,y+.1,.32,0,true);
    const ghosts=HIGH()?3:1; for(let i=1;i<=ghosts;i++) mk(beam(),dc,.4/i,false,w*(1.6+i*.4),y-.1*i,.5,.06*i);
    const sc=new THREE.Mesh(PL,mat(scar(),0xffffff,0,false)); sc.rotation.order="YXZ"; sc.rotation.y=rot; sc.rotation.x=-Math.PI/2; sc.position.set(x+sx*len/2,.14+hAt(x+sx*len/2,z+sz*len/2),z+sz*len/2); sc.scale.set(w*1.3,len,1); sc.userData.noOutline=true; scene.add(sc);
    FX.push({m:sc,t:0,d:1.6,tick:(f,k)=>{ sc.material.opacity=(k<.1?k/.1:1-(k-.1)/.9)*.45; }});
    const ex=x+sx*len, ez=z+sz*len; setTimeout(()=>{ shock(ex,ez,color,w*1.6,.45); glow(ex,1.5+hAt(ex,ez),ez,color,w*1.2,.35); },110);
    if(HIGH()) for(let i=1;i<=4;i++){ const d=len*i/5; setTimeout(()=>fxSpark(x+sx*d,1.2,z+sz*d,color,8),i*25); } }
  // 질주 잔상(빛 줄무늬)
  function speed(x,z,rot,color){ for(let i=0;i<(HIGH()?5:3);i++){ const o=rnd(-1.2,1.2); const px=x+Math.cos(rot)*o, pz=z-Math.sin(rot)*o; const m=new THREE.Mesh(PL,mat(beam(),deep(color),0,false)); m.rotation.order="YXZ"; m.rotation.y=rot; m.rotation.x=-Math.PI/2; m.userData.noOutline=true; scene.add(m); const yy=rnd(.6,2.4)+hAt(x,z);
    FX.push({m,t:-i*.03,d:.35,tick:(f,k)=>{ if(k<0){ m.visible=false; return; } m.visible=true; m.position.set(px-Math.sin(rot)*2,yy,pz-Math.cos(rot)*2); m.scale.set(.35,4*(1-k)+.5,1); m.material.opacity=.8*(1-k); }}); } }
  return {glow,shock,dust,runeAt,beamLine,speed};
})();
</script>
