<script>
/* ================= v105: 왼쪽 위 내 정보 칸에 얼굴 초상 동그라미 =================
   - 내 3D 캐릭터 얼굴을 앞에서 비스듬히 찍어 동그라미 안에 보여 줌(뒤 배경은 지금 서 있는 곳 그대로)
   - 테두리는 내 세계 색 금속 고리, 아래에 작은 레벨 배지. 맞으면 붉게 번쩍·살짝 흔들림, 체력 낮으면 붉은 숨, 쓰러지면 흑백.
   - 매 프레임 찍지 않음: 1.5초마다(절약 모드 4초) 화면 구석 작은 칸에 한 번 그려 복사 → 메인 그림이 바로 덮어씀. 빛·그리기 규칙 그대로. */
const PORTRAIT=(()=>{ let kT=0, lastKey="", nShot=0, el=null, cv=null, cx=null, lv=null, t=0, hb=null, hbFor=null, hbT=0, lastLv=-1, lastHit=0; const cam=new THREE.PerspectiveCamera(30,1,.05,80); const V=new THREE.Vector3(), H=new THREE.Vector3();
  const st=document.createElement("style");
  st.textContent=`#status.hasPor{padding-left:72px!important;min-height:64px}
#portrait{position:absolute;left:8px;top:50%;width:56px;height:56px;margin-top:-28px;border-radius:50%;pointer-events:none;z-index:2;
  background:conic-gradient(from 210deg,var(--gm1,#ffe7a0),var(--c1) 22%,var(--gm3,#a8741c) 48%,#fff6d0 60%,var(--c1) 78%,var(--gm1,#ffe7a0));padding:3px;box-shadow:0 3px 0 rgba(10,5,2,.55),0 0 10px rgba(0,0,0,.45)}
#portrait canvas{display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 50% 35%,#5a4a8a,#1c1438);box-shadow:inset 0 0 0 2px rgba(20,10,4,.75),inset 0 -8px 12px rgba(0,0,0,.35)}
#portrait::after{content:"";position:absolute;inset:3px;border-radius:50%;background:linear-gradient(160deg,rgba(255,255,255,.38),rgba(255,255,255,0) 42%);pointer-events:none}
#portrait b{position:absolute;left:50%;bottom:-7px;transform:translateX(-50%);min-width:24px;padding:0 5px;height:16px;line-height:15px;border-radius:8px;font-size:11px;font-weight:900;color:#fff;text-align:center;
  background:linear-gradient(#5b3fa8,#2a1a5a);border:1.5px solid var(--c1);text-shadow:0 1px 0 #000;box-shadow:0 2px 0 rgba(0,0,0,.5);white-space:nowrap}
#portrait.hit{animation:porHit .35s ease-out} #portrait.hit canvas{box-shadow:inset 0 0 0 2px rgba(20,10,4,.75),inset 0 0 16px 8px rgba(255,30,30,.85)}
#portrait.low canvas{animation:porLow 1s ease-in-out infinite} #portrait.dead canvas{filter:grayscale(1) brightness(.7)}
#portrait.lvup{animation:porLv .9s ease-out}
@keyframes porHit{0%{transform:translate(0,0)}25%{transform:translate(-3px,1px)}50%{transform:translate(3px,-1px)}75%{transform:translate(-1px,0)}100%{transform:none}}
@keyframes porLow{0%,100%{box-shadow:inset 0 0 0 2px rgba(20,10,4,.75),inset 0 0 4px 2px rgba(255,40,40,.2)}50%{box-shadow:inset 0 0 0 2px rgba(20,10,4,.75),inset 0 0 14px 6px rgba(255,40,40,.75)}}
@keyframes porLv{0%{transform:scale(1);filter:brightness(1)}30%{transform:scale(1.16);filter:brightness(1.8) drop-shadow(0 0 8px #ffe27a)}100%{transform:scale(1);filter:none}}
body.eco #portrait.low canvas{animation:none;box-shadow:inset 0 0 0 2px rgba(20,10,4,.75),inset 0 0 10px 4px rgba(255,40,40,.6)}
@media (orientation:landscape) and (max-height:540px){ #status.hasPor{padding-left:62px!important;min-height:54px} #portrait{width:48px;height:48px;margin-top:-24px;left:7px} #portrait b{font-size:10px;height:14px;line-height:13px;bottom:-6px} }`;
  document.head.appendChild(st);
  function mount(){ const s=document.getElementById("status"); if(!s) return false; if(el&&el.isConnected) return true;
    el=document.createElement("div"); el.id="portrait"; cv=document.createElement("canvas"); cv.width=cv.height=112; cx=cv.getContext("2d"); lv=document.createElement("b"); el.append(cv,lv); s.prepend(el); s.classList.add("hasPor"); return true; }
  function headBox(){ if(hbFor===player&&hbT>0) return hb; hbFor=player; hbT=8; try{ const r=player.rotation.y; player.rotation.y=0; player.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(player); player.rotation.y=r; player.updateMatrixWorld(true); const h=b.max.y-player.position.y; hb={h:(h>.5&&h<12)?h:3}; }catch(e){ hb={h:3}; } return hb; }
  function shoot(){ if(!player||!renderer||!cx) return; const hb=headBox(); const h=hb.h, s=player.scale.y||1;
    player.getWorldPosition(H); H.y+=h*.71; const d=h*.95+.5, a=(P.rot||0)+.42; V.set(H.x+Math.sin(a)*d,H.y+h*.06,H.z+Math.cos(a)*d); cam.position.copy(V); cam.lookAt(H.x,H.y-h*.04,H.z); cam.fov=30; cam.near=.05; cam.far=60; cam.updateProjectionMatrix();
    const pr=renderer.getPixelRatio(), sz=new THREE.Vector2(); renderer.getSize(sz); const S=Math.min(64,Math.floor(sz.y/3)); const dv=renderer.domElement;
    const vp=new THREE.Vector4(); renderer.getViewport(vp); const was=renderer.getRenderTarget(); const lab=[];
    try{ renderer.setRenderTarget(null); renderer.setScissorTest(true); renderer.setScissor(0,0,S,S); renderer.setViewport(0,0,S,S); const sm=renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate=false; if(ECO()){ /* v108 배터리: 세상 전체 대신 내 캐릭터와 빛만 그림(층 7) */ player.traverse(o=>o.layers.enable(7)); scene.children.forEach(o=>{ if(o.isLight) o.layers.enable(7); }); cam.layers.set(7); const cc=new THREE.Color(); renderer.getClearColor(cc); const ca=renderer.getClearAlpha(); renderer.setClearColor(0x3a2c66,1); const bg=scene.background; scene.background=null; renderer.render(scene,cam); scene.background=bg; renderer.setClearColor(cc,ca); } else { cam.layers.set(0); renderer.render(scene,cam); } renderer.shadowMap.autoUpdate=sm;
      const px=Math.round(S*pr); cx.clearRect(0,0,112,112); cx.drawImage(dv,0,dv.height-px,px,px,0,0,112,112); }
    catch(e){} finally{ renderer.setScissorTest(false); renderer.setViewport(vp); renderer.setRenderTarget(was); } }
  function tick(dt){ if(!started) return; if(!mount()) return; t-=dt; hbT-=dt;
    /* v108 배터리: 절약 모드에서는 모습이 바뀔 때(레벨·장비·꾸미기·쓰러짐)와 30초마다만 다시 찍음 — 찍을 때마다 그래픽 칩이 멈춰 서서 기다리던 것 줄임 */
    if(ECO()){ kT-=dt; if(kT<=0){ kT=1; let k=""; try{ k=JSON.stringify([G.look,G.eq,G.realm,G.rank,G.lv,!!P.dead,player&&player.uuid,player&&player.children.length]); }catch(e){} if(k!==lastKey){ lastKey=k; t=Math.min(t,.3); nShot=0; } } }
    if(t<=0){ nShot++; t=ECO()?(nShot<4?2:30):1.5; if(!(typeof layerOpen!=="undefined"&&layerOpen)) shoot(); }
    try{ const L=G.lv||G.level||(document.getElementById("plv")||{}).textContent; if(L!==lastLv){ if(lastLv!==-1){ el.classList.remove("lvup"); void el.offsetWidth; el.classList.add("lvup"); t=Math.min(t,.4); } lastLv=L; lv.textContent=L; }
      const st=stat(); const hit=(P.hitFlash||0)>0; if(hit&&!lastHit){ el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); } lastHit=hit;
      el.classList.toggle("low",!P.dead&&P.hp/st.mhp<.3); el.classList.toggle("dead",!!P.dead); }catch(e){} }
  XTICK.push(dt=>{ try{ tick(dt); }catch(e){} });
  return {shoot,_t:()=>t}; })();
</script>
