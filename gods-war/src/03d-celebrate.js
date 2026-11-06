<script>
/* ================= v18 레벨업·승급 연출: 빛기둥 · 떠오르는 고리 · 솟는 빛가루 · 화면 금빛 · 큰 글씨 ================= */
const LVFX={tex:null,geo:null};
function lvTex(){ if(LVFX.tex) return LVFX.tex; const c=document.createElement("canvas"); c.width=8; c.height=128; const g=c.getContext("2d");
  const gr=g.createLinearGradient(0,0,0,128); gr.addColorStop(0,"rgba(255,255,255,0)"); gr.addColorStop(.45,"rgba(255,255,255,.35)"); gr.addColorStop(.88,"rgba(255,255,255,1)"); gr.addColorStop(1,"rgba(255,255,255,.15)");
  g.fillStyle=gr; g.fillRect(0,0,8,128); LVFX.tex=new THREE.CanvasTexture(c); LVFX.geo=new THREE.CylinderGeometry(1,1,1,20,1,true); LVFX.geo.translate(0,.5,0); return LVFX.tex; }
function lvMat(color,op){ return new THREE.MeshBasicMaterial({color,map:lvTex(),transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}); }
function lvFollow(m,y){ m.position.set(P.x,(P.gy||0)+(y||0),P.z); }
/* 빛기둥: 발밑에서 하늘로 확 솟았다가 가늘어지며 사라짐 (나를 따라다님) */
function fxPillar(color,r,h,dur,op){ op=op||.5; const m=new THREE.Mesh((lvTex(),LVFX.geo),lvMat(color,op)); m.userData.noOutline=true; m.renderOrder=5; lvFollow(m); scene.add(m);
  FX.push({m,t:0,d:dur,kind:"lv",tick:(f,k)=>{ lvFollow(f.m); const up=Math.min(1,k*5); const rr=r*(k<.12?.3+k/.12*.9:1.2-(k-.12)*1.1); f.m.scale.set(Math.max(.05,rr),h*(.15+.85*Math.pow(up,.5)),Math.max(.05,rr)); f.m.material.opacity=op*(k<.7?1:(1-k)/.3); f.m.rotation.y+=.05; }}); }
/* 몸을 감싸며 위로 떠오르는 고리 */
function fxRiseRing(color,delay,size,dur){ const m=new THREE.Mesh(GEO.ring,glowMat(color,0)); m.rotation.x=-Math.PI/2; m.userData.noOutline=true; lvFollow(m,.1); scene.add(m);
  FX.push({m,t:-delay,d:dur,kind:"lv",tick:(f,k)=>{ if(k<0){ f.m.visible=false; return; } f.m.visible=true; lvFollow(f.m,.1+k*5.5); const s=size*(1.25-k*.75); f.m.scale.set(s,s,s); f.m.material.opacity=.95*(k<.15?k/.15:1-(k-.15)/.85); }}); }
/* 나선으로 솟는 빛가루 */
function fxRiseDust(color,n,dur){ const geo=new THREE.BufferGeometry(); const p=new Float32Array(n*3); const a=[]; for(let i=0;i<n;i++) a.push({ang:Math.random()*6.28,r:rnd(.6,2.4),vy:rnd(3,9),sp:rnd(1.5,3.5)*(Math.random()<.5?-1:1),y:rnd(-.5,1)});
  geo.setAttribute("position",new THREE.BufferAttribute(p,3)); const m=new THREE.Points(geo,new THREE.PointsMaterial({color,size:.38,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending})); m.userData.noOutline=true; scene.add(m);
  FX.push({m,t:0,d:dur,kind:"lv",own:true,tick:(f,k,dt)=>{ const gy=P.gy||0; for(let i=0;i<n;i++){ const q=a[i]; q.y+=q.vy*dt; q.ang+=q.sp*dt; q.r*=1+dt*.25; p[i*3]=P.x+Math.cos(q.ang)*q.r; p[i*3+1]=gy+q.y; p[i*3+2]=P.z+Math.sin(q.ang)*q.r; } geo.attributes.position.needsUpdate=true; f.m.material.opacity=k<.6?1:(1-k)/.4; }}); }
/* 화면 쪽: 금빛 번쩍 + 큰 글씨 배너 */
function lvBanner(top,big,sub,css){ let b=$("lvup"); if(!b){ b=document.createElement("div"); b.id="lvup"; b.innerHTML='<div class="rays"></div><div class="top"></div><div class="big"></div><div class="sub"></div>'; document.body.appendChild(b); const g=document.createElement("div"); g.id="lvglow"; document.body.appendChild(g); }
  b.style.setProperty("--lc",css||"#ffd76a"); $("lvglow").style.setProperty("--lc",css||"#ffd76a");
  b.querySelector(".top").textContent=top; b.querySelector(".big").textContent=big; b.querySelector(".sub").innerHTML=sub||"";
  $("toast").classList.add("lvdn");
  LVFX.bt=0; LVFX.b=b; LVFX.g=$("lvglow"); LVFX.r=b.querySelector(".rays"); LVFX.bg=b.querySelector(".big"); b.style.display=LVFX.g.style.display="block"; tickLvBanner(0); }
/* 게임 시간으로 움직임(메인 루프에서 부름) — 화면이 버벅여도 순서대로 보임 */
const easeOutBack=x=>{ const c=1.9; return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2); };
/* v72: 가운데서 톡 터진 뒤(0.9초) 작아지며 화면 위쪽 띠로 올라가 붙음 → 싸우는 화면 가운데를 오래 가리지 않음 */
function tickLvBanner(dt){ if(!LVFX.b||LVFX.bt==null) return; const t=(LVFX.bt+=dt), D=3.1; const b=LVFX.b, g=LVFX.g;
  if(t>=D){ b.style.display=g.style.display="none"; LVFX.bt=null; $("toast").classList.remove("lvdn"); return; }
  const op=t<.2?t/.2:t>D-.45?(D-t)/.45:1; const kk=clamp((t-.9)/.45,0,1), dk=kk*kk*(3-2*kk);
  const sc=(t<.3?.6+.5*easeOutBack(t/.3):1)*(1-.38*dk); const ty=Math.max(54,innerHeight*.16), dyp=-dk*Math.max(0,b.offsetTop-ty);
  b.style.opacity=op.toFixed(3); b.style.setProperty("--dk",dk.toFixed(3)); b.style.transform=`translate(-50%,calc(-50% + ${dyp.toFixed(1)}px)) scale(${sc.toFixed(3)})`;
  const pk=Math.min(1,t/.45); LVFX.bg.style.transform=`scale(${(t<.45?2.2-1.2*easeOutBack(pk):1).toFixed(3)})`;
  LVFX.r.style.transform=`rotate(${(t*40).toFixed(1)}deg) scale(${(t<.4?.3+.8*t/.4:1.1-.1*Math.min(1,(t-.4)/2)).toFixed(3)})`; LVFX.r.style.opacity=((t<.4?t/.4*.9:.9-.35*Math.min(1,(t-.4)/2.4))*(1-.85*dk)).toFixed(3);
  g.style.opacity=(t<.15?t/.15:Math.max(0,1-(t-.15)/1.0)).toFixed(3); }
const hexCss=c=>"#"+(c>>>0).toString(16).padStart(6,"0");
function celebrateLevel(lv,s0){ const s1=stat(); const hi=HIGH();
  fxPillar(0xffc94a,.95,hi?42:26,1.8,.45); if(hi) fxPillar(0xfff2c0,.3,46,1.4,.35);
  for(let i=0;i<3;i++) fxRiseRing(0xffd76a,i*.18,2.4,1.1); fxRing(P.x,P.z,0xffffff,7,.6); fxRiseDust(0xffe9a8,hi?60:28,1.9);
  drama(0xffd76a,.35,1.2); P.shake=Math.max(P.shake||0,.35); buzz([30,40,60]);
  const d=(s0&&s1)?`체력 <b>+${fmt(s1.mhp-s0.mhp)}</b> · 공격 <b>+${fmt(s1.atk-s0.atk)}</b>`:"체력과 공격력이 올랐어요";
  lvBanner("LEVEL UP","Lv "+lv,d); }
function celebrateRank(R,rank){ const c=R.c1, css=hexCss(c), hi=HIGH();
  fxPillar(c,1.3,hi?60:34,2.6,.4); fxPillar(0xffc94a,.6,64,2.2,.3); if(hi) fxPillar(0xfff2c0,.25,66,1.8,.3);
  for(let i=0;i<5;i++) fxRiseRing(i%2?0xffe08a:c,i*.16,3.2,1.3); fxRing(P.x,P.z,c,18,1.3); fxRing(P.x,P.z,0xffffff,9,.7); fxFlash(P.x,2,P.z,0xfff2c0,4,.4); fxRiseDust(c,hi?90:36,2.6); fxRiseDust(0xffe9a8,hi?50:20,2.2);
  drama(c,.3,1.6); P.shake=Math.max(P.shake||0,1.1); buzz([60,40,60,40,140]);
  lvBanner("승급!",R.ranks[rank],rank===6?`${R.absolute} 바로 아래, 최고 계급!`:"더 강해졌어요 · 새 장비를 낄 수 있어요",css); }
</script>
