<script>
/* ================= v173: 가방 창 3D 무기 미리보기 받침대 =================
   - 가방(장비 탭)을 열면 맨 위에 지금 낀 무기가 등급 색으로 빛나는 돌 받침대 위에서 천천히 돌며 둥실 떠 있음.
   - 가방 속 다른 무기 줄을 누르면(끼기·팔기 버튼 말고) 그 무기로 바뀜. 방어구·유물 줄은 그대로.
   - 작은 캔버스 하나(따로 그리는 작은 그림판, 처음 열 때 한 번만 만들고 다시 씀). 창이 닫히면 바로 멈춤.
   - PointLight 없음(반구빛+방향빛 2개). 절약 모드는 초당 20장. 게임 규칙·저장 그대로. */
const WPVIEW=(()=>{ let R=null, scene, cam, cv, holder=null, ped, ring, beam, dust, cur="", curT=-1, raf=0, t=0, last=0, want=null;
  const st=document.createElement("style");
  st.textContent=`.wpv{display:flex;gap:10px;align-items:center;padding:6px;border-radius:14px;background:linear-gradient(135deg,rgba(255,255,255,.07),rgba(0,0,0,.25));border:1px solid rgba(255,255,255,.12)}
.wpv .box{position:relative;flex:0 0 112px;height:112px;border-radius:12px;overflow:hidden;background:radial-gradient(circle at 50% 62%,var(--wc,#8d93a8) 0%,rgba(30,20,60,.9) 58%,#0d0820 100%);box-shadow:inset 0 0 0 2px rgba(255,207,74,.55),inset 0 0 18px rgba(0,0,0,.7),0 3px 0 rgba(0,0,0,.45)}
.wpv .box canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.wpv .box::after{content:"";position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.22),rgba(255,255,255,0) 38%);pointer-events:none}
.wpv .inf{flex:1;min-width:0;font-size:13px;line-height:1.35}
.wpv .inf b{display:block;font-size:15px;margin:2px 0;color:#fff;text-shadow:0 0 8px var(--wc,#fff)}
.wpv .inf i{font-style:normal;opacity:.7;font-size:11.5px}
.card .row.wpsel{box-shadow:0 0 0 2px var(--gold,#ffcf4a) inset}
@media (orientation:landscape) and (max-height:540px){ .wpv .box{flex-basis:96px;height:96px} }`;
  document.head.appendChild(st);
  const hex=c=>"#"+c.toString(16).padStart(6,"0");
  function init(){ if(R) return true; try{
    cv=document.createElement("canvas");
    R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true,powerPreference:"low-power"}); R.setClearColor(0x000000,0); R.outputEncoding=THREE.sRGBEncoding; R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=.85;
    R.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); R.setSize(112,112,false);
    scene=new THREE.Scene(); cam=new THREE.PerspectiveCamera(32,1,.05,30); cam.position.set(0,1.15,3.9); cam.lookAt(0,.8,0);
    scene.add(new THREE.HemisphereLight(0xfff4e0,0x3a2a60,.75)); const d1=new THREE.DirectionalLight(0xffffff,.95); d1.position.set(2,3,2.5); scene.add(d1); const d2=new THREE.DirectionalLight(0x9fc4ff,.7); d2.position.set(-2.5,1.5,-2); scene.add(d2);
    ped=new THREE.Group();
    const stone=new THREE.MeshLambertMaterial({color:0x463f5a});
    const p1=new THREE.Mesh(new THREE.CylinderGeometry(.62,.7,.16,24),stone); p1.position.y=.08; ped.add(p1);
    const p2=new THREE.Mesh(new THREE.CylinderGeometry(.5,.58,.1,24),new THREE.MeshLambertMaterial({color:0x5a5272})); p2.position.y=.21; ped.add(p2);
    ring=new THREE.Mesh(new THREE.TorusGeometry(.54,.025,6,40),new THREE.MeshBasicMaterial({color:0xffcf4a})); ring.rotation.x=Math.PI/2; ring.position.y=.165; ped.add(ring);
    const bm=new THREE.MeshBasicMaterial({color:0xffcf4a,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    beam=new THREE.Mesh(new THREE.CylinderGeometry(.34,.48,1.9,24,1,true),bm); beam.position.y=1.21; ped.add(beam);
    { const ca=document.createElement("canvas"); ca.width=4; ca.height=64; const g=ca.getContext("2d"); const gr=g.createLinearGradient(0,0,0,64); gr.addColorStop(0,"rgba(255,255,255,0)"); gr.addColorStop(1,"rgba(255,255,255,1)"); g.fillStyle=gr; g.fillRect(0,0,4,64); bm.map=new THREE.CanvasTexture(ca); bm.needsUpdate=true; }
    const n=26, pos=new Float32Array(n*3); for(let i=0;i<n;i++){ const a=Math.random()*6.28, r=.15+Math.random()*.4; pos[i*3]=Math.cos(a)*r; pos[i*3+1]=.25+Math.random()*1.6; pos[i*3+2]=Math.sin(a)*r; }
    const dg=new THREE.BufferGeometry(); dg.setAttribute("position",new THREE.BufferAttribute(pos,3));
    dust=new THREE.Points(dg,new THREE.PointsMaterial({color:0xffe8a0,size:.05,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})); ped.add(dust);
    scene.add(ped); holder=new THREE.Group(); scene.add(holder); return true; }catch(e){ R=null; return false; } }
  function setWeapon(name,rar){ want={name,rar}; if(!R) return; const col=RAR_HEX[Math.max(0,Math.min(3,rar))]||0x8d93a8;
    ring.material.color.setHex(col); beam.material.color.setHex(col); beam.material.opacity=[.1,.15,.19,.24][rar]||.12; dust.material.color.setHex(col).lerp(new THREE.Color(0xffffff),.45); dust.visible=rar>=1;
    const box=cv.parentNode; if(box) box.style.setProperty("--wc",hex(col));
    if(cur===name&&curT===rar) return; const go=()=>{ if(!want||want.name!==name) return; while(holder.children.length) holder.remove(holder.children[0]);
      const src=MODELS.weap[name]; if(!src) return; const o=src.clone(true); if(rar>0) glowUp(o,col,[0,.12,.18,.26][rar]);
      o.traverse(m=>{ if(m.isMesh){ m.castShadow=false; m.frustumCulled=false; } });
      const b=new THREE.Box3().setFromObject(o), sz=new THREE.Vector3(), c=new THREE.Vector3(); b.getSize(sz); b.getCenter(c);
      const big=Math.max(sz.x,sz.y,sz.z)||1, s=1.3/big; o.scale.multiplyScalar(s); o.position.set(-c.x*s,-c.y*s,-c.z*s);
      const piv=new THREE.Group(); piv.add(o); /* 긴 쪽이 위로 서게 */ if(sz.z>sz.y*1.2) piv.rotation.x=Math.PI/2; else if(sz.x>sz.y*1.2) piv.rotation.z=Math.PI/2; const tilt=new THREE.Group(); tilt.add(piv); tilt.rotation.z=-.42;
      const sp=new THREE.Group(); sp.add(tilt); sp.position.y=.98; holder.add(sp); cur=name; curT=rar; t=0; };
    if(MODELS.weap[name]) go(); else { cur=""; ensure([],[name],go); } }
  function loop(now){ raf=0; if(!cv||!cv.isConnected||document.hidden){ return; } raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-(last||now))/1000); if(ECO()&&now-last<48) return; last=now; t+=dt;
    const sp=holder.children[0]; if(sp){ sp.rotation.y+=dt*.9; sp.position.y=.98+Math.sin(t*2)*.06; const k=Math.min(1,t*3); sp.scale.setScalar(.6+.4*(1-Math.pow(1-k,3))); }
    ring.material.opacity=1; dust.rotation.y+=dt*.4; const a=dust.geometry.attributes.position; for(let i=0;i<a.count;i++){ let y=a.getY(i)+dt*.35; if(y>1.9) y=.25; a.setY(i,y); } a.needsUpdate=true;
    beam.scale.x=beam.scale.z=1+Math.sin(t*3)*.04;
    try{ R.render(scene,cam); }catch(e){} }
  function itemOfRow(row){ const e=row.querySelector("[data-eq]"), u=row.querySelector("[data-un]");
    if(u&&u.dataset.un==="w") return {s:"w",t:G.eq.w}; if(e){ const it=G.bag[+e.dataset.eq]; if(it) return it; } return null; }
  function weaponOf(t){ const Rm=Math.max(0,Math.min(3,G.realm|0)); const W=GEAR_W[Rm]&&GEAR_W[Rm][t]; return W&&W.w; }
  function mountIn(card){ if(!card||!init()) return; const eqH=[...card.querySelectorAll("h3")][0]; if(!eqH) return;
    const wrap=document.createElement("div"); wrap.className="wpv"; wrap.innerHTML=`<div class="box"></div><div class="inf"></div>`; eqH.parentNode.insertBefore(wrap,eqH);
    const box=wrap.firstChild, inf=wrap.lastChild; box.appendChild(cv); const S=box.clientWidth||112; R.setSize(S,S,false);
    const show=(t,row)=>{ const nm=t>=0?weaponOf(t):null; card.querySelectorAll(".row.wpsel").forEach(r=>r.classList.remove("wpsel")); if(row) row.classList.add("wpsel");
      if(!nm){ inf.innerHTML=`<i>무기를 끼면 여기 받침대에 보여요</i>`; while(holder.children.length) holder.remove(holder.children[0]); cur=""; setWeapon("",0); return; }
      inf.innerHTML=`${rarTag(t)}<b>${itemName("w",t)}</b><i>${row&&!row.querySelector("[data-un]")?"가방 속 무기 미리 보기":"지금 끼고 있는 무기"} · 다른 무기 줄을 누르면 바뀌어요</i>`; setWeapon(nm,t); };
    const eqRow=card.querySelector("[data-un='w']"); show(G.eq.w,eqRow?eqRow.closest(".row"):null);
    card.querySelectorAll(".row").forEach(row=>{ const it=itemOfRow(row); if(!it||it.s!=="w") return; row.style.cursor="pointer";
      row.addEventListener("click",e=>{ if(e.target.closest("button")) return; show(it.t,row); tone(980,.04,"triangle"); }); });
    last=0; if(!raf) raf=requestAnimationFrame(loop); }
  if(typeof showBag==="function"){ const base=showBag; showBag=function(tab){ base.apply(this,arguments); try{ if(BAG_TAB==="eq"){ const c=layers.querySelector(".layer:not(.out) .card"); mountIn(c); } }catch(e){ console.warn(e); } }; }
  /* v180: 상점 「⚔ 장비」 탭에도 같은 받침대 — 상점 무기가 돌며 둥실, 잠긴 「다음 등급」 줄을 누르면 다음 무기를 미리 보여 줌(그림자 실루엣 아님, 진짜 모습 + 🔒 표시) */
  function mountShop(card){ if(!card||!init()) return; const h=card.querySelector("h3"); if(!h) return;
    const wrap=document.createElement("div"); wrap.className="wpv shopv"; wrap.innerHTML=`<div class="box"></div><div class="inf"></div>`; h.parentNode.insertBefore(wrap,h);
    const box=wrap.firstChild, inf=wrap.lastChild; box.appendChild(cv); const S=box.clientWidth||112; R.setSize(S,S,false); const t0=Math.min(3,G.rank|0);
    const show=(t,row,lock)=>{ const nm=weaponOf(t); card.querySelectorAll(".row.wpsel").forEach(r=>r.classList.remove("wpsel")); if(row) row.classList.add("wpsel"); if(!nm) return;
      const own=G.eq.w>=t||G.bag.some(it=>it.s==="w"&&it.t>=t);
      inf.innerHTML=`${rarTag(t)}<b>${lock?"🔒 ":""}${itemName("w",t)}</b><i>${lock?`${RM().ranks[t]} 계급이 되면 살 수 있는 다음 무기예요`:own?"이미 같은 등급 무기가 있어요":"상점 무기 · 「사기」로 가방에 쏙"} · 무기 줄을 누르면 바뀌어요</i>`; box.classList.toggle("lock",!!lock); setWeapon(nm,t); };
    const wb=card.querySelector("[data-sb='w']"), wr=wb&&wb.closest(".row"); show(t0,wr,false);
    if(wr){ wr.style.cursor="pointer"; wr.addEventListener("click",e=>{ if(e.target.closest("button")) return; show(t0,wr,false); tone(980,.04,"triangle"); }); }
    if(t0<3){ const lr=[...card.querySelectorAll(".row")].find(r=>r.querySelector(".ic")&&r.querySelector(".ic").textContent==="🔒"); if(lr){ lr.style.cursor="pointer"; lr.addEventListener("click",()=>{ show(t0+1,lr,true); tone(760,.05,"triangle"); }); } }
    last=0; if(!raf) raf=requestAnimationFrame(loop); }
  st.textContent+=`.wpv.shopv{margin:4px 0 2px}.wpv .box.lock{filter:saturate(.55) brightness(.85)}.wpv .box.lock::before{content:"🔒";position:absolute;right:6px;top:4px;font-size:16px;z-index:2;filter:drop-shadow(0 1px 2px #000)}`;
  if(typeof showShop==="function"){ const baseS=showShop; showShop=function(tab){ baseS.apply(this,arguments); try{ if(SHOP_TAB==="eq"){ const c=layers.querySelector(".layer:not(.out) .card"); mountShop(c); } }catch(e){ console.warn(e); } }; }
  return {setWeapon,mountIn,mountShop};
})();
</script>
