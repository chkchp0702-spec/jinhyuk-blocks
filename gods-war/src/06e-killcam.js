<script>
/* ================= v142: 보스·정예 마무리 일격 — 느린 화면 + 살짝 줌인 =================
   보스나 정예 괴물을 쓰러뜨리는 순간 세상이 0.3~0.45초 동안 느려지고(슬로모션) 카메라가 쓰러지는 괴물 쪽으로 살짝 다가감.
   보스는 위아래 검은 영화 띠가 스르륵 + 쿵 울림 + 금빛 번쩍, 정예는 짧고 가볍게. 1.5초 안에 다시 안 나옴(연달아 잡을 때 어지럽지 않게).
   모습만(실제 시간·쿨타임은 거의 그대로: 길어야 0.3초 늦어짐). 그리기 호출 0, PointLight 없음. 영화 띠는 CSS 라 배터리 절약 모드에서도 가벼움. */
const KILLCAM={t:0,d:0,slow:1,zoom:0,x:0,y:0,z:0,cool:0,boss:false,base:null};
(function(){
  const _die=HITF.die;
  HITF.die=function(m){ const r=_die.apply(this,arguments); try{ if(m&&(m.boss||m.elite)&&!m.titan) KILLCAM.go(m); }catch(e){} return r; };
  KILLCAM.go=function(m){ if(KILLCAM.cool>0||P.dead) return; const boss=!!m.boss;
    KILLCAM.boss=boss; KILLCAM.t=0; KILLCAM.d=boss?.5:.3; KILLCAM.slow=boss?.28:.45; KILLCAM.zoom=boss?.16:.09; KILLCAM.cool=1.5;
    KILLCAM.x=m.x; KILLCAM.z=m.z; KILLCAM.y=(m.mesh&&m.mesh.position?m.mesh.position.y:0)+1.2*(m.scale||1);
    if(boss){ try{ drama(0xfff0c0,.55,.7); }catch(e){} try{ tone(70,.5,"sine",0,.22); tone(140,.35,"triangle",.02,.08); tone(880,.25,"sine",.12,.04); }catch(e){} try{ buzz([40,30,90]); }catch(e){}
      { let c=document.getElementById("kcBars"); if(!c){ c=document.createElement("div"); c.id="kcBars"; c.innerHTML="<i></i><i></i>"; document.body.appendChild(c); } c.classList.remove("on"); void c.offsetWidth; c.classList.add("on"); clearTimeout(KILLCAM.bt); KILLCAM.bt=setTimeout(()=>c.classList.remove("on"),1300); } }
    else { try{ tone(330,.12,"triangle",0,.06); tone(660,.14,"sine",.04,.04); }catch(e){} } };
  const _up=update;
  update=function(dt){ const K=KILLCAM; if(K.cool>0) K.cool-=dt;
    if(K.base){ camera.fov=K.base.fov; camera.position.copy(K.base.pos); K.base=null; }   // 지난 프레임에 바꾼 카메라 되돌림
    let s=1, z=0; if(K.d>0&&K.t<K.d+.35){ K.t+=dt; const t=K.t;
      if(t<K.d){ const k=t/K.d; s=K.slow+(1-K.slow)*Math.pow(k,3); } // 느렸다가 끝 무렵 원래대로
      const zin=Math.min(1,t/.08), zout=t<K.d?1:Math.max(0,1-(t-K.d)/.35); z=K.zoom*zin*zout*(1-.25*Math.max(0,t/(K.d||1)-.5)); }
    _up(dt*s);
    if(z>0.001&&!P.dead){ K.base={fov:camera.fov,pos:camera.position.clone()};
      const v=new THREE.Vector3(K.x-camera.position.x,K.y-camera.position.y,K.z-camera.position.z); const L=v.length(); if(L>0.01) camera.position.addScaledVector(v,Math.min(.18,z*1.1));
      camera.fov=K.base.fov*(1-z); camera.updateProjectionMatrix(); } };
})();
</script>
