<script>
/* ================= v146 그래픽: 신수가 공격할 때 작은 마법진 · 4번째마다 「신수 일격」 이름 띠 =================
   내 신수가 괴물을 공격하는 순간(tickPets 안에서 공격 시계가 새로 걸린 때) 신수 발밑에 신수 색 작은 마법진이 빙글 돌고,
   맞은 괴물 자리에 신수 색 빛이 톡. 네 번째 공격마다 마법진이 크게 + 충격파 고리 + 신수 머리 위에 「✦ 신수 이름 ✦」 금빛 띠가 떠올랐다 사라짐.
   피해·공격 간격·규칙 그대로(모습만). 이름 띠는 DOM 1개를 다시 씀(일격 때 한 번만 화면 위치 계산, CSS 애니메이션 한 번). 배터리 절약 모드는 큰 일격 때만 마법진. */
const PETFX2=(()=>{ let n=0, el=null; const V=new THREE.Vector3();
  function band(me,nm,col){ try{ if(document.hidden||typeof camera==="undefined") return; const s=me.mesh.scale.x; V.set(me.mesh.position.x,me.mesh.position.y+1.6*s+.4,me.mesh.position.z).project(camera); if(V.z>1) return;
      const sx=Math.max(110,Math.min(innerWidth-110,(V.x+1)/2*innerWidth)), sy=Math.max(70,Math.min(innerHeight-90,(1-V.y)/2*innerHeight));
      if(!el){ el=document.createElement("div"); el.id="petstrike"; el.innerHTML='<span class="sh"></span><b></b>'; document.body.appendChild(el); }
      el.querySelector("b").textContent="✦ "+nm+" 일격 ✦"; el.style.left=sx+"px"; el.style.top=sy+"px"; el.style.setProperty("--pc","#"+(col>>>0&0xffffff).toString(16).padStart(6,"0"));
      el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }catch(e){} }
  function fire(me){ try{ if(!me||!me.mesh||!me.mesh.visible||Math.hypot(me.x-P.x,me.z-P.z)>45) return; const D=PETS[G.pet]; if(!D) return;
      n++; const big=n%4===0, eco=typeof ECO==="function"&&ECO(); const col=D.c===0xffffff?D.c2:D.c;
      if(big||!eco) SFX.runeAt(me.x,me.z,col,big?3.6:2.2,big?.9:.6);
      if(me.tx!=null){ const tx=me.tx, tz=me.tz; setTimeout(()=>{ try{ SFX.glow(tx,1.1+hAt(tx,tz),tz,col,big?1.5:.8,.3); if(big) SFX.shock(tx,tz,col,2.6,.5); }catch(e){} },120); }
      if(big){ band(me,D.n,col); try{ tone(1318,.07,"triangle",0,.04); setTimeout(()=>{ try{ tone(1760,.09,"triangle",0,.035); }catch(e){} },70); }catch(e){} }
    }catch(e){} }
  if(typeof tickPets==="function"){ const _tp=tickPets; tickPets=function(dt){ const me=PETMESH.me, before=me?me.atk:0; const r=_tp.apply(this,arguments);
      try{ const m2=PETMESH.me; if(m2&&m2===me&&m2.atk>before+.5) fire(m2); }catch(e){} return r; }; }
  return {fire,get n(){ return n; }};
})();
</script>
