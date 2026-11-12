<script>
/* ================= 기술 맞은 땅에 남는 자국 (v114) =================
   기술(useSkill)을 쓴 뒤 1.6초 안에 터진 충격파(SFX.shock) 자리 + 큰 괴물이 땅 내려찍은 자리에
   세계마다 다른 자국이 잠깐 남았다(3.5초) 서서히 사라짐.
   에덴=금빛 성흔 · 아스가르드=파란 서리 결정 · 인도=검게 그을림+불씨 · 올림푸스=번개 갈라짐.
   판 몇 장을 돌려씀(높음 6장, 그 밖 4장) — 빛나는 금 줄은 그래픽 높음일 때만. 모습만, 규칙 그대로. */
const SCORCH=(()=>{ if(typeof SFX==="undefined") return null;
  const PL=new THREE.PlaneGeometry(1,1); const TX={};
  const R=(a,b)=>a+Math.random()*(b-a);
  // 가운데서 뻗는 들쭉날쭉 금(갈래 포함)
  function cracks(g,s,n,len,w,col){ const c=s/2; g.strokeStyle=col; g.lineCap="round"; g.lineJoin="round";
    for(let i=0;i<n;i++){ let a=i/n*Math.PI*2+R(-.25,.25), x=c+Math.cos(a)*s*.05, y=c+Math.sin(a)*s*.05; const L=len*R(.6,1); const seg=6; let lw=w;
      for(let k=0;k<seg;k++){ const nx=x+Math.cos(a)*L/seg, ny=y+Math.sin(a)*L/seg; g.lineWidth=lw; g.beginPath(); g.moveTo(x,y); g.lineTo(nx,ny); g.stroke();
        if(k>0&&k<seg-1&&Math.random()<.35){ const b=a+R(.5,.9)*(Math.random()<.5?-1:1); g.lineWidth=lw*.6; g.beginPath(); g.moveTo(nx,ny); g.lineTo(nx+Math.cos(b)*L*.18,ny+Math.sin(b)*L*.18); g.stroke(); }
        x=nx; y=ny; a+=R(-.45,.45); lw=Math.max(.8,lw*.78); } } }
  function blot(g,s,rgb,a0,a1,rad){ const c=s/2; for(let i=0;i<7;i++){ const ox=c+R(-.08,.08)*s, oy=c+R(-.08,.08)*s, r=s*rad*R(.55,.85); const gr=g.createRadialGradient(ox,oy,0,ox,oy,r); gr.addColorStop(0,`rgba(${rgb},${a0})`); gr.addColorStop(.6,`rgba(${rgb},${a1})`); gr.addColorStop(1,`rgba(${rgb},0)`); g.fillStyle=gr; g.fillRect(0,0,s,s); } }
  function tex(key,draw){ if(TX[key]) return TX[key]; const c=document.createElement("canvas"); c.width=c.height=256; const g=c.getContext("2d"); draw(g,256); const t=new THREE.CanvasTexture(c); TX[key]=t; return t; }
  const STY=[
    { // 에덴: 연한 금빛 그을림 + 빛살 무늬
      base:(g,s)=>{ blot(g,s,"120,86,24",.32,.16,.48); const c=s/2; g.strokeStyle="rgba(150,108,30,.55)"; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; g.lineWidth=i%2?2:4; g.beginPath(); g.moveTo(c+Math.cos(a)*s*.12,c+Math.sin(a)*s*.12); g.lineTo(c+Math.cos(a)*s*(i%2?.32:.42),c+Math.sin(a)*s*(i%2?.32:.42)); g.stroke(); } g.lineWidth=3; g.beginPath(); g.arc(c,c,s*.2,0,7); g.stroke(); },
      glow:(g,s)=>{ const c=s/2; g.strokeStyle="rgba(255,230,140,1)"; for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; g.lineWidth=i%2?2:3.5; g.beginPath(); g.moveTo(c+Math.cos(a)*s*.13,c+Math.sin(a)*s*.13); g.lineTo(c+Math.cos(a)*s*(i%2?.3:.4),c+Math.sin(a)*s*(i%2?.3:.4)); g.stroke(); } g.lineWidth=3; g.beginPath(); g.arc(c,c,s*.2,0,7); g.stroke(); },
      gc:0xffe08a },
    { // 아스가르드: 파란 서리 결정 (눈 위에서도 보이게 진한 파랑 선)
      base:(g,s)=>{ blot(g,s,"120,180,235",.5,.28,.46); const c=s/2; g.strokeStyle="rgba(30,80,150,.85)"; g.lineCap="round";
        for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+.26; const L=s*.4; g.lineWidth=3.5; g.beginPath(); g.moveTo(c,c); g.lineTo(c+Math.cos(a)*L,c+Math.sin(a)*L); g.stroke(); g.lineWidth=2;
          for(let k=1;k<=3;k++){ const d=L*k/4, x=c+Math.cos(a)*d, y=c+Math.sin(a)*d, l=L*(.32-k*.06); for(const sd of [-1,1]){ const b=a+sd*.8; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(b)*l,y+Math.sin(b)*l); g.stroke(); } } }
        g.strokeStyle="rgba(240,250,255,.9)"; g.lineWidth=1.4; for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+.26; g.beginPath(); g.moveTo(c+Math.cos(a)*4,c+Math.sin(a)*4); g.lineTo(c+Math.cos(a)*s*.36,c+Math.sin(a)*s*.36); g.stroke(); } },
      glow:(g,s)=>{ const c=s/2; g.strokeStyle="rgba(170,235,255,1)"; g.lineCap="round"; for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+.26, L=s*.4; g.lineWidth=3; g.beginPath(); g.moveTo(c,c); g.lineTo(c+Math.cos(a)*L,c+Math.sin(a)*L); g.stroke(); } },
      gc:0x9fe8ff },
    { // 인도: 검게 그을림 + 불씨 금
      base:(g,s)=>{ blot(g,s,"24,14,8",.85,.45,.44); g.globalCompositeOperation="source-over"; cracks(g,s,9,s*.44,4,"rgba(10,5,2,.9)"); },
      glow:(g,s)=>{ cracks(g,s,9,s*.4,3.5,"rgba(255,140,40,1)"); const c=s/2, gr=g.createRadialGradient(c,c,0,c,c,s*.18); gr.addColorStop(0,"rgba(255,170,60,.8)"); gr.addColorStop(1,"rgba(255,90,20,0)"); g.fillStyle=gr; g.fillRect(0,0,s,s); },
      gc:0xff8a30, flick:1 },
    { // 올림푸스: 번개 맞아 갈라진 땅
      base:(g,s)=>{ blot(g,s,"30,30,48",.7,.35,.4); cracks(g,s,8,s*.47,4.5,"rgba(14,14,26,.95)"); },
      glow:(g,s)=>{ cracks(g,s,8,s*.43,3,"rgba(190,220,255,1)"); },
      gc:0xbfe0ff },
  ];
  const pool=[]; let until=0;
  function mk(){ const mat=(add)=>new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const a=new THREE.Mesh(PL,mat(false)), b=new THREE.Mesh(PL,mat(true)); for(const m of [a,b]){ m.rotation.order="YXZ"; m.rotation.x=-Math.PI/2; m.userData.noOutline=true; m.visible=false; m.renderOrder=2; scene.add(m); }
    const o={a,b,t:9,d:3.5,gd:1.2,flick:0}; pool.push(o); return o; }
  function mark(x,z,r,realm){ if(!scene||typeof hAt!=="function") return; const max=(HIGH()&&!ECO())?6:4; let o=pool.find(p=>p.t>=p.d); if(!o){ if(pool.length<max) o=mk(); else o=pool.reduce((m,p)=>p.t>m.t?p:m,pool[0]); }
    const st=STY[realm]||STY[2]; const k=realm in STY?realm:2; o.a.material.map=tex("b"+k,st.base); o.a.material.needsUpdate=true; o.b.material.map=tex("g"+k,st.glow); o.b.material.color.setHex(st.gc); o.b.material.needsUpdate=true;
    const s=Math.max(2.6,Math.min(13,r*.95)), y=hAt(x,z)+.1, rot=Math.random()*6.283; for(const m of [o.a,o.b]){ m.position.set(x,y+(m===o.b?.02:0),z); m.rotation.y=rot; m.scale.set(s,s,1); m.visible=true; }
    o.b.visible=HIGH(); o.t=0; o.d=s>8?4.2:3.4; o.gd=1.3; o.flick=st.flick?1:0; o.s=s; }
  function tick(dt){ for(const o of pool){ if(o.t>=o.d){ if(o.a.visible){ o.a.visible=o.b.visible=false; } continue; } o.t+=dt; const k=o.t/o.d;
      o.a.material.opacity=(o.t<.12?o.t/.12:k>.62?1-(k-.62)/.38:1)*.9; const sc=o.s*(o.t<.12?.75+o.t/.12*.25:1); o.a.scale.set(sc,sc,1); o.b.scale.set(sc,sc,1);
      if(o.b.visible){ const g=o.t/o.gd; o.b.material.opacity=g>=1?0:(1-g)*(1-g)*(o.flick?.75+.25*Math.sin(o.t*31)*Math.sin(o.t*13):1); if(g>=1) o.b.visible=false; }
      if(o.t>=o.d){ o.a.visible=o.b.visible=false; } } }
  // 기술을 쓴 뒤 잠깐 동안 터지는 충격파 + 괴물 내려찍기(붉은 주황) 자리에 자국
  const _sh=SFX.shock; SFX.shock=function(x,z,color,r,dur){ const out=_sh.apply(this,arguments); try{ const slam=color===0xff6a3d||color===0xff7a3d; if((performance.now()<until&&r>=2)||slam) mark(x,z,r||4,slam?2:G.realm); }catch(e){} return out; };
  const _bl=SFX.beamLine; SFX.beamLine=function(x,z,rot,len,w,color){ const out=_bl.apply(this,arguments); try{ if(performance.now()<until){ const ex=x+Math.sin(rot)*len, ez=z+Math.cos(rot)*len; setTimeout(()=>mark(ex,ez,(w||2.6)*1.9,G.realm),110); } }catch(e){} return out; };
  if(typeof useSkill==="function"){ const _us=useSkill; useSkill=function(){ until=performance.now()+1600; return _us.apply(this,arguments); }; }
  XTICK.push(tick);
  return {mark,pool};
})();
</script>
