<script>
/* ================= v15: 지도 — 구글 지도 느낌 =================
   - 바탕(한 번만 그림, 1024px): 진짜 지형 높이로 음영(언덕 그림자), 세계별 땅색, 바다, 숲(나무 자리), 물, 광장, 건물 지붕, 큰길(노란 도로)·수도 순환로(흰 길).
   - 매번 그리는 것: 영토(옅은 색 + 점선 경계), 제단, 지명(흰 테두리 글씨), 수도 빨간 핀, 전쟁·거대 보스 핀, 친구, 길 안내 파란 경로, 내 위치(파란 점 + 바라보는 방향 빛), 나침반·축척. */
const MAPB=WORLD_HALF+12, MAPN=1024;
let MAPBASE=null;
const MAPCOL={ land:[[0xe8,0xf1,0xdc],[0xee,0xf2,0xf6],[0xf4,0xea,0xd6],[0xe4,0xef,0xdc]], center:[0xec,0xe8,0xf2], rock:[0xd9,0xd5,0xca], snow:[0xfb,0xfc,0xfd], sea:[0xaa,0xda,0xff] };
function buildMapBase(){ const N=MAPN, c=document.createElement("canvas"); c.width=c.height=N; const ctx=c.getContext("2d"); const img=ctx.createImageData(N,N), D=img.data;
  const GN=257, hg=new Float32Array(GN*GN); const w2g=v=>(v+MAPB)/(2*MAPB)*(GN-1);
  for(let j=0;j<GN;j++) for(let i=0;i<GN;i++){ const x=-MAPB+i/(GN-1)*2*MAPB, z=-MAPB+j/(GN-1)*2*MAPB; hg[j*GN+i]=hAt(x,z); }
  const H=(gx,gz)=>{ gx=Math.max(0,Math.min(GN-1.001,gx)); gz=Math.max(0,Math.min(GN-1.001,gz)); const i=gx|0, j=gz|0, fx=gx-i, fz=gz-j; const a=hg[j*GN+i], b=hg[j*GN+i+1], c2=hg[(j+1)*GN+i], d=hg[(j+1)*GN+i+1]; return (a*(1-fx)+b*fx)*(1-fz)+(c2*(1-fx)+d*fx)*fz; };
  const sm=(a,b,t)=>{ t=Math.max(0,Math.min(1,(t-a)/(b-a))); return t*t*(3-2*t); }; const L=MAPCOL.land;
  for(let py=0;py<N;py++){ const z=-MAPB+(py+.5)/N*2*MAPB, gz=w2g(z); for(let px=0;px<N;px++){ const x=-MAPB+(px+.5)/N*2*MAPB, gx=w2g(x); const o=(py*N+px)*4;
      const e=Math.max(Math.abs(x),Math.abs(z)); if(e>WORLD_HALF+5){ D[o]=MAPCOL.sea[0]; D[o+1]=MAPCOL.sea[1]; D[o+2]=MAPCOL.sea[2]; D[o+3]=255; continue; }
      const bx=sm(-18,18,x), bz=sm(-18,18,z); let r=[0,1,2].map(k=>{ const top=L[1][k]+(L[0][k]-L[1][k])*bx, bot=L[3][k]+(L[2][k]-L[3][k])*bx; return top+(bot-top)*bz; });
      const dc=Math.hypot(x,z), cm=1-sm(REGIONS[12].r-6,REGIONS[12].r+8,dc); r=r.map((v,k)=>v+(MAPCOL.center[k]-v)*cm);
      const h=H(gx,gz); const rk=sm(9,18,h), sn=sm(28,40,h); r=r.map((v,k)=>{ v=v+(MAPCOL.rock[k]-v)*rk; return v+(MAPCOL.snow[k]-v)*sn; });
      // 언덕 그림자(북서쪽에서 빛)
      const sl=(H(gx-1.2,gz-1.2)-H(gx+1.2,gz+1.2)); const sh=Math.max(-.14,Math.min(.1,sl*.025)); const k2=1+sh;
      D[o]=Math.min(255,r[0]*k2); D[o+1]=Math.min(255,r[1]*k2); D[o+2]=Math.min(255,r[2]*k2); D[o+3]=255; } }
  ctx.putImageData(img,0,0);
  const s=N/(2*MAPB), X=v=>(v+MAPB)*s;
  // 해안선
  ctx.strokeStyle="rgba(120,170,210,.9)"; ctx.lineWidth=2; ctx.strokeRect(X(-WORLD_HALF-5),X(-WORLD_HALF-5),(WORLD_HALF+5)*2*s,(WORLD_HALF+5)*2*s);
  // 숲(나무 자리) — 공원처럼 연두색
  TREEPOS.forEach(t=>{ const snow=t[3]===1; const r=(t[2]?11:7)*s; const g=ctx.createRadialGradient(X(t[0]),X(t[1]),0,X(t[0]),X(t[1]),r); const c=snow?"170,205,190":"150,205,135"; g.addColorStop(0,`rgba(${c},${t[2]?.55:.3})`); g.addColorStop(.6,`rgba(${c},${t[2]?.35:.18})`); g.addColorStop(1,`rgba(${c},0)`); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(X(t[0]),X(t[1]),r,0,6.2832); ctx.fill(); });
  // 물(장면의 물 그림)
  try{ scene.updateMatrixWorld(true); const v=new THREE.Vector3(); scene.traverse(o=>{ if(!o.isMesh||(o.material!==WATER&&o.material!==M.water)) return; if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.getWorldPosition(v); const sc=new THREE.Vector3(); o.getWorldScale(sc); const r=o.geometry.boundingSphere.radius*Math.max(sc.x,sc.z);
      ctx.fillStyle="#aadaff"; ctx.strokeStyle="#8cc4f0"; ctx.lineWidth=1; ctx.beginPath(); if(o.geometry.type==="PlaneGeometry"){ const p=o.geometry.parameters; ctx.save(); ctx.translate(X(v.x),X(v.z)); ctx.fillRect(-p.width/2*sc.x*s,-p.height/2*sc.z*s,p.width*sc.x*s,p.height*sc.z*s); ctx.restore(); } else { ctx.arc(X(v.x),X(v.z),r*s,0,6.2832); ctx.fill(); ctx.stroke(); } }); }catch(e){}
  // 큰길: 수도 → 세계의 중심 (노란 도로)
  const road=(w,col)=>{ ctx.strokeStyle=col; ctx.lineWidth=w*s; ctx.lineCap="round"; REGIONS.forEach(rg=>{ if(!rg.cap) return; ctx.beginPath(); ctx.moveTo(X(rg.x),X(rg.z)); ctx.lineTo(X(0),X(0)); ctx.stroke(); }); };
  road(7.5,"#e9b44c"); road(5.2,"#fde293");
  // 광장·수도 순환로
  REGIONS.forEach(rg=>{ if(!rg.cap) return; ctx.fillStyle="#f3f1ec"; ctx.beginPath(); ctx.arc(X(rg.x),X(rg.z),30*s,0,6.2832); ctx.fill(); ctx.strokeStyle="#dadce0"; ctx.lineWidth=3.6*s; ctx.beginPath(); ctx.arc(X(rg.x),X(rg.z),31*s,0,6.2832); ctx.stroke(); ctx.strokeStyle="#ffffff"; ctx.lineWidth=2.2*s; ctx.stroke(); });
  ctx.fillStyle="#efedf3"; ctx.beginPath(); ctx.arc(X(0),X(0),23*s,0,6.2832); ctx.fill(); ctx.strokeStyle="#d7d2e4"; ctx.lineWidth=1.5; ctx.stroke();
  // 건물 지붕
  const SZ={castle:[13,11],church:[7,10],house:[5,5],market:[7,6],flag:[0,0],prop:[0,0]};
  PLACED.forEach(p=>{ const z=SZ[p.kind]||[4,4]; if(!z[0]) return; ctx.save(); ctx.translate(X(p.x),X(p.z)); ctx.rotate(-(p.rot||0)); ctx.fillStyle="rgba(0,0,0,.08)"; ctx.fillRect(-z[0]/2*s+1.5,-z[1]/2*s+1.5,z[0]*s,z[1]*s); ctx.fillStyle=p.kind==="castle"||p.kind==="church"?"#e2dccf":"#ece6da"; ctx.strokeStyle="#cfc6b6"; ctx.lineWidth=1; ctx.fillRect(-z[0]/2*s,-z[1]/2*s,z[0]*s,z[1]*s); ctx.strokeRect(-z[0]/2*s,-z[1]/2*s,z[0]*s,z[1]*s); ctx.restore(); });
  MAPBASE=c; return c; }

const MAPFONT='"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif';
function mapText(ctx,t,x,y,px,col,wt,halo){ ctx.font=`${wt||600} ${px}px ${MAPFONT}`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.lineJoin="round"; ctx.lineWidth=Math.max(2.5,px*.32); ctx.strokeStyle=halo||"rgba(255,255,255,.95)"; ctx.strokeText(t,x,y); ctx.fillStyle=col||"#3c4043"; ctx.fillText(t,x,y); }
function mapPin(ctx,x,y,s,col,glyph){ ctx.save(); ctx.translate(x,y); ctx.fillStyle="rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(0,0,s*.45,s*.18,0,0,6.2832); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(-s*.25,-s*.7,-s*.9,-s*1.1,-s*.9,-s*1.75); ctx.arc(0,-s*1.75,s*.9,Math.PI,0); ctx.bezierCurveTo(s*.9,-s*1.1,s*.25,-s*.7,0,0); ctx.closePath(); ctx.fillStyle=col; ctx.fill(); ctx.lineWidth=Math.max(1,s*.12); ctx.strokeStyle="rgba(0,0,0,.25)"; ctx.stroke();
  if(glyph){ ctx.font=`700 ${s*1.05}px ${MAPFONT}`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle="#fff"; ctx.fillText(glyph,0,-s*1.72); } else { ctx.fillStyle="#7b1010"; ctx.beginPath(); ctx.arc(0,-s*1.75,s*.32,0,6.2832); ctx.fill(); } ctx.restore(); }
function hexA(h,a){ const c=new THREE.Color(h); return `rgba(${c.r*255|0},${c.g*255|0},${c.b*255|0},${a})`; }
function drawMinimap(ctxIn,size){ const big=!!ctxIn; const ctx=ctxIn||mctx; const S=big?size:fitCanvas(mm); const u=S/150; if(!MAPBASE) buildMapBase();
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,S,S);
  const half=big?MAPB:85, cx=big?0:P.x, cz=big?0:P.z; const k=S/(half*2); const tx=x=>(x-cx+half)*k, tz=z=>(z-cz+half)*k;
  ctx.save(); if(!big){ ctx.beginPath(); ctx.arc(S/2,S/2,S/2,0,6.2832); ctx.clip(); }
  ctx.fillStyle="#aadaff"; ctx.fillRect(0,0,S,S); ctx.imageSmoothingEnabled=true; try{ ctx.imageSmoothingQuality="high"; }catch(e){}
  const bs=MAPN/(2*MAPB); ctx.drawImage(MAPBASE,(cx-half+MAPB)*bs,(cz-half+MAPB)*bs,half*2*bs,half*2*bs,0,0,S,S);
  // 영토: 옅은 색 + 점선 경계
  REGIONS.forEach(rg=>{ if(rg.cap) return; const o=W.o[rg.id]; const X=tx(rg.x), Z=tz(rg.z), r=rg.r*k; const col=o>=0?REALMS[o].c1:"#9aa0a6";
    ctx.beginPath(); ctx.arc(X,Z,r,0,6.2832); ctx.fillStyle=o>=0?hexA(col,.13):"rgba(154,160,166,.08)"; ctx.fill(); ctx.setLineDash([4*u,3*u]); ctx.lineWidth=(big?1:1.4)*u; ctx.strokeStyle=o>=0?hexA(col,.9):"rgba(120,124,130,.7)"; ctx.stroke(); ctx.setLineDash([]);
    const al=TERR_RINGS[rg.id]&&TERR_RINGS[rg.id].position; if(al){ const ax=tx(al.x), az=tz(al.z), rr=(big?3.2:4.2)*u; ctx.beginPath(); ctx.arc(ax,az,rr,0,6.2832); ctx.fillStyle="#fff"; ctx.fill(); ctx.lineWidth=2*u; ctx.strokeStyle=o>=0?col:"#80868b"; ctx.stroke(); ctx.beginPath(); ctx.arc(ax,az,rr*.45,0,6.2832); ctx.fillStyle=o>=0?col:"#80868b"; ctx.fill(); } });
  // 길 안내: 파란 경로
  if(P.guide&&P.guide.x!=null){ const gx=tx(P.guide.x), gz=tz(P.guide.z); ctx.lineCap="round"; ctx.lineWidth=6*u; ctx.strokeStyle="#1557b0"; ctx.beginPath(); ctx.moveTo(tx(P.x),tz(P.z)); ctx.lineTo(gx,gz); ctx.stroke(); ctx.lineWidth=4*u; ctx.strokeStyle="#4285f4"; ctx.stroke(); }
  // 몬스터(가까운 것만 작게) · 보스
  mobs.forEach(m=>{ if(m.war||m.titan) return; if(!big&&Math.hypot(m.x-P.x,m.z-P.z)>70) return; if(m.boss){ mapPin(ctx,tx(m.x),tz(m.z),(big?4.2:5.2)*u,"#f29900","👑"); } else { dot(ctx,tx(m.x),tz(m.z),(big?1.3:1.8)*u,"rgba(217,48,37,.85)","#fff",.6*u); } });
  if(typeof warActive==="function"&&warActive()){ WAR.units.forEach(un=>{ if(un.dead) return; dot(ctx,tx(un.x),tz(un.z),1.5*u,WAR.joined?(un.side===WAR.side?"#1e8e3e":"#d93025"):(un.side==="att"?"#f29900":"#4285f4"),"#fff",.5*u); });
    const g=TERR_RINGS[WAR.cur.rg].position; const pul=1+.3*Math.sin(performance.now()/180); ctx.beginPath(); ctx.arc(tx(g.x),tz(g.z),9*u*pul,0,6.2832); ctx.fillStyle="rgba(217,48,37,.18)"; ctx.fill(); mapPin(ctx,tx(g.x),tz(g.z),(big?5:6.5)*u,"#d93025","⚔"); }
  if(typeof DG!=="undefined"&&DG.doors) DG.doors.forEach(d=>mapPin(ctx,tx(d.x),tz(d.z),(big?4.5:5)*u,"#7a4ae8","🌀"));
  if(typeof OR!=="undefined") OR.spots.forEach(s=>mapPin(ctx,tx(s.x),tz(s.z),(big?4.2:4.8)*u,"#3a8fc8","🗿"));
  if(typeof GT_POS!=="undefined") mapPin(ctx,tx(GT_POS.x),tz(GT_POS.z),(big?5:6)*u,"#d49a20","☀");
  if(typeof TITAN_POS!=="undefined"&&typeof TB!=="undefined"&&!TB.claimed&&titanLeft()>0) mapPin(ctx,tx(TITAN_POS.x),tz(TITAN_POS.z),(big?5:6)*u,"#e8710a","🌋");
  // 지명
  REGIONS.forEach(rg=>{ const X=tx(rg.x), Z=tz(rg.z); if(!big&&Math.hypot(X-S/2,Z-S/2)>S*.47) return; if(rg.cap){ const R=REALMS[rg.realm]; mapPin(ctx,X,Z,(big?5.2:6.4)*u,"#ea4335",R.icon); mapText(ctx,rg.n,X,Z+(big?6:7.5)*u,(big?6.6:10)*u,"#202124",700); }
    else mapText(ctx,rg.n,X,Z+(rg.center?(big?-4:-6)*u:0),(big?5.8:9)*u,rg.center?"#5f3dc4":"#3c4043",600); });
  if(big){ REALMS.forEach((R,i)=>{ const sx=(i===0||i===2)?1:-1, sz=(i>=2)?1:-1; mapText(ctx,R.n,tx(sx*100),tz(sz*100),8*u,"rgba(95,99,104,.42)",800,"rgba(255,255,255,.35)"); }); }
  // 친구
  for(const id in PEERS){ const o=PEERS[id]; const X=tx(o.x), Z=tz(o.z); const mate=typeof gdMate==="function"&&gdMate(o); if(mate) dot(ctx,X,Z,5.6*u,"rgba(255,207,74,.35)","#f4b400",1.6*u); dot(ctx,X,Z,3.4*u,o.realm===G.realm?"#1e8e3e":"#d93025","#fff",1.6*u); if(big||Math.hypot(o.x-P.x,o.z-P.z)<70) mapText(ctx,(mate?"🛡️":"")+o.name,X,Z-6*u,(big?5.5:8)*u,"#202124",700); }
  // 내 위치: 파란 점 + 바라보는 방향 빛
  if(player){ const X=tx(P.x), Z=tz(P.z); ctx.save(); ctx.translate(X,Z); ctx.rotate(-P.rot+Math.PI); const gr=ctx.createRadialGradient(0,0,0,0,0,20*u); gr.addColorStop(0,"rgba(66,133,244,.55)"); gr.addColorStop(1,"rgba(66,133,244,0)"); ctx.fillStyle=gr; ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,20*u,-Math.PI/2-.55,-Math.PI/2+.55); ctx.closePath(); ctx.fill(); ctx.restore();
    dot(ctx,X,Z,9*u,"rgba(66,133,244,.16)"); ctx.shadowColor="rgba(0,0,0,.35)"; ctx.shadowBlur=3*u; dot(ctx,X,Z,4.6*u,"#4285f4","#fff",2*u); ctx.shadowBlur=0; }
  ctx.restore();
  // 나침반 · 축척 · 테두리
  if(!big){ ctx.beginPath(); ctx.arc(S/2,S/2,S/2-1.5*u,0,6.2832); ctx.lineWidth=3*u; ctx.strokeStyle="#ffffff"; ctx.stroke(); ctx.lineWidth=1*u; ctx.strokeStyle="rgba(0,0,0,.25)"; ctx.beginPath(); ctx.arc(S/2,S/2,S/2-.5*u,0,6.2832); ctx.stroke();
    const nx=S/2, ny=11*u; dot(ctx,nx,ny,7*u,"#fff","rgba(0,0,0,.2)",1*u); ctx.fillStyle="#ea4335"; ctx.beginPath(); ctx.moveTo(nx,ny-5*u); ctx.lineTo(nx+2.6*u,ny+.5*u); ctx.lineTo(nx-2.6*u,ny+.5*u); ctx.fill(); ctx.fillStyle="#9aa0a6"; ctx.beginPath(); ctx.moveTo(nx,ny+5*u); ctx.lineTo(nx+2.6*u,ny+.5*u); ctx.lineTo(nx-2.6*u,ny+.5*u); ctx.fill(); }
  else {
    const nx=S-14*u, ny=14*u; dot(ctx,nx,ny,8*u,"#fff","rgba(0,0,0,.2)",1*u); ctx.fillStyle="#ea4335"; ctx.beginPath(); ctx.moveTo(nx,ny-6*u); ctx.lineTo(nx+3*u,ny); ctx.lineTo(nx-3*u,ny); ctx.fill(); ctx.fillStyle="#9aa0a6"; ctx.beginPath(); ctx.moveTo(nx,ny+6*u); ctx.lineTo(nx+3*u,ny); ctx.lineTo(nx-3*u,ny); ctx.fill(); } }
</script>
