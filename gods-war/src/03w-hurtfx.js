<script>
/* v87 맞을 때 화면 연출: 때린 괴물 쪽 화면 가장자리가 붉게 번쩍(어디서 맞았는지 바로 보임) + 화면이 살짝 붉게 깜빡.
   체력이 30% 아래면 화면 가장자리가 심장 박동처럼 쿵쿵 붉게 뛰고(15% 아래면 더 빨리), 체력 바도 붉게 깜빡.
   CSS 그림만(3D 그리기 호출 0). 배터리 절약 모드는 박동 대신 은은한 붉은 테두리만. 모습만 — 피해·규칙 그대로 */
const HURTFX=(()=>{ let el=null, chk=0, lvl=0; const _v=new THREE.Vector3();
  function src(){ let best=null, bd=14; try{ for(const m of mobs){ if(m.hp<=0) continue; const d=Math.hypot(m.x-P.x,m.z-P.z); if(d<bd){ bd=d; best=m; } } }catch(e){} return best; }
  function hit(){ try{ if(typeof MYRING!=="undefined") MYRING.hit(); }catch(e){}
    el=el||document.getElementById("hurtdir"); if(!el) return;
    let x=50,y=50; const m=src();
    if(m){ _v.set(m.x,(m.mesh?m.mesh.position.y:hAt(m.x,m.z))+1.5,m.z).project(camera); let sx=_v.x, sy=-_v.y; if(_v.z>1){ sx=-sx; sy=-sy; }
      const k=1/Math.max(Math.abs(sx),Math.abs(sy),.001); if(Math.abs(sx)<.75&&Math.abs(sy)<.75){ sx*=k; sy*=k; } else { sx=Math.max(-1,Math.min(1,sx*k)); sy=Math.max(-1,Math.min(1,sy*k)); }
      x=50+sx*50; y=50+sy*50; el.style.background=`radial-gradient(ellipse 55% 75% at ${x}% ${y}%,rgba(255,40,30,.85) 0%,rgba(255,20,20,.45) 35%,rgba(255,0,0,0) 70%)`; }
    else el.style.background="radial-gradient(ellipse at 50% 50%,rgba(255,0,0,0) 45%,rgba(255,40,30,.7) 100%)";
    el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
  function tick(dt){ chk-=dt; if(chk>0) return; chk=.2; let r=1; try{ r=P.hp/stat().mhp; }catch(e){} const n=(P.dead||!started)?0:r<.15?2:r<.3?1:0; if(n===lvl) return; lvl=n; const b=document.body; b.classList.toggle("lowhp",n>0); b.classList.toggle("lowhp2",n===2); b.classList.toggle("lowhpEco",n>0&&ECO()); }
  return {hit,tick};
})();
</script>
