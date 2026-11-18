<script>
/* ================= v150 그래픽: 미니맵에 떨어진 보물·줍기·보물 지도 표시 =================
   길에 떨어진 반짝이 줍기(PK.list)는 미니맵에 그 빛 색 작은 보석 구슬(✦ 반짝)로, 둥둥 떠오르듯 살짝 커졌다 작아짐.
   보물 지도로 생긴 보물 자리(PK.tm)는 빨간 X 위 작은 금테 보물상자 아이콘 + 금빛 맥박 고리 → "저기 보물!" 이 한눈에.
   그림은 처음 한 번만 캔버스에 그려 두고 drawImage 로 돌려씀(색마다 1장). 보기만 — 줍기·보물 규칙 그대로. */
const MMLOOT=(()=>{ const IC={};
  function orb(col){ const k="o"+col; if(IC[k]) return IC[k]; const c=document.createElement("canvas"); c.width=c.height=48; const g=c.getContext("2d"); const C=24; const h="#"+(col>>>0&0xffffff).toString(16).padStart(6,"0");
    const halo=g.createRadialGradient(C,C,4,C,C,23); halo.addColorStop(0,h+"cc"); halo.addColorStop(1,h+"00"); g.fillStyle=halo; g.beginPath(); g.arc(C,C,23,0,6.2832); g.fill();
    const gr=g.createRadialGradient(C-4,C-5,1,C,C,12); gr.addColorStop(0,"#ffffff"); gr.addColorStop(.45,h); gr.addColorStop(1,"rgba(40,30,60,.9)"); g.fillStyle=gr; g.beginPath(); g.arc(C,C,11,0,6.2832); g.fill();
    g.lineWidth=2.6; g.strokeStyle="#fff"; g.stroke();
    g.fillStyle="#fff"; g.beginPath(); for(let i=0;i<8;i++){ const a=i*Math.PI/4-Math.PI/2, r=i%2?2.2:6.5; g.lineTo(C+12+Math.cos(a)*r*.9-4,C-12+Math.sin(a)*r*.9+4); } g.closePath(); g.fill();
    return IC[k]=c; }
  function chest(){ if(IC.ch) return IC.ch; const c=document.createElement("canvas"); c.width=c.height=64; const g=c.getContext("2d"); const C=32; g.lineCap="round"; g.lineJoin="round";
    /* 뒤의 빨간 X */ for(const s of [-1,1]){ g.beginPath(); g.moveTo(C-22,C+s*-20); g.lineTo(C+22,C+s*20); g.lineWidth=9; g.strokeStyle="#fff"; g.stroke(); g.lineWidth=5.5; g.strokeStyle="#e8302a"; g.stroke(); }
    /* 상자 몸통·뚜껑 */ const bx=C-15, by=C-8, bw=30, bh=20;
    g.fillStyle="#fff"; g.beginPath(); g.roundRect?g.roundRect(bx-3,by-11,bw+6,bh+14,6):g.rect(bx-3,by-11,bw+6,bh+14); g.fill();
    const wg=g.createLinearGradient(0,by,0,by+bh); wg.addColorStop(0,"#b0723c"); wg.addColorStop(1,"#6b3e1e"); g.fillStyle=wg; g.fillRect(bx,by,bw,bh);
    const lg=g.createLinearGradient(0,by-9,0,by); lg.addColorStop(0,"#c98a4a"); lg.addColorStop(1,"#8a5228"); g.fillStyle=lg; g.beginPath(); g.moveTo(bx,by); g.quadraticCurveTo(C,by-14,bx+bw,by); g.closePath(); g.fill();
    g.fillStyle="#ffd24a"; g.fillRect(bx+5,by-6,4,bh+6); g.fillRect(bx+bw-9,by-6,4,bh+6); g.fillRect(bx,by-1.5,bw,3.5);
    g.fillStyle="#fff2b0"; g.fillRect(C-3.5,by-1,7,8); g.fillStyle="#5a3000"; g.fillRect(C-1,by+2,2,3.5);
    g.lineWidth=1.6; g.strokeStyle="rgba(50,20,0,.75)"; g.strokeRect(bx,by,bw,bh);
    return IC.ch=c; }
  function draw(ctx,tx,tz,big,u){ if(typeof PK==="undefined") return; const now=performance.now();
    if(PK.list) PK.list.forEach((p,i)=>{ if(!big&&Math.hypot(p.x-P.x,p.z-P.z)>80) return; const col=p.T.trap?0xfff2a0:p.T.c; const r=(big?3.4:6.8)*u*(1+.14*Math.sin(now/260+i*1.7)); ctx.drawImage(orb(col),tx(p.x)-r,tz(p.z)-r,r*2,r*2); });
    const T=PK.tm; if(T){ const X=tx(T.x), Z=tz(T.z), pul=.5+.5*Math.sin(now/220); const R=(big?7:12)*u;
      ctx.beginPath(); ctx.arc(X,Z,R*(1+.35*pul),0,6.2832); ctx.fillStyle=`rgba(255,200,60,${.14+.2*(1-pul)})`; ctx.fill(); ctx.lineWidth=1.4*u; ctx.strokeStyle=`rgba(255,220,110,${.5+.4*(1-pul)})`; ctx.stroke();
      const s=(big?6.5:12)*u; ctx.drawImage(chest(),X-s,Z-s-(big?0:1.2*u*pul),s*2,s*2); } }
  return {draw,orb,chest}; })();
MAP_X.push((ctx,tx,tz,big,u)=>MMLOOT.draw(ctx,tx,tz,big,u));
</script>
