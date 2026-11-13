<script>
/* ================= 맞으면 내 캐릭터가 뒤로 휘청 (v121) =================
   괴물·병사 공격에 맞으면 때린 쪽 반대로 몸이 휙 젖혀지며 살짝 밀렸다가 용수철처럼 돌아옴.
   센 한 방(최대 체력의 12% 넘게)일수록 더 크게 휘청. 피함·방패로 다 막음·탈것 위·죽음 땐 안 함.
   모습만 — 위치(P.x·P.z)·피해·규칙 그대로. 그리기 호출 0(내 캐릭터 기울기만). */
const STAG=(()=>{ let tx=0, tz=0, v=0, a=0, ax=0, az=0, on=false;
  function src(){ let best=null, bd=16; try{ for(const m of mobs){ if(m.hp<=0) continue; const d=Math.hypot(m.x-P.x,m.z-P.z); if(d<bd){ bd=d; best=m; } } }catch(e){}
    return best; }
  function kick(dmg){ if(P.dead||P.ride) return; let mhp=1; try{ mhp=stat().mhp; }catch(e){}
    const k=Math.min(1,.45+(dmg/mhp)*4.5);          // 센 공격일수록 크게
    const m=src(); let dx, dz;
    if(m){ dx=P.x-m.x; dz=P.z-m.z; } else { dx=-Math.sin(P.rot||0); dz=-Math.cos(P.rot||0); }
    const l=Math.hypot(dx,dz)||1; ax=dx/l; az=dz/l;     // 밀리는 방향(세계 기준)
    v=Math.max(v,0)+k*17; if(v>22) v=22; on=true; }
  const _hp=hurtPlayer;
  hurtPlayer=function(dmg,from){ const before=P.hp; const r=_hp.apply(this,arguments); try{ if(P.hp<before&&!P.dead) kick(before-P.hp); }catch(e){} return r; };
  function tick(dt){ if(!on||typeof player==="undefined"||!player) return;
    if(player.rotation.order!=="YXZ") player.rotation.order="YXZ";
    if(P.dead||P.ride){ a=0; v=0; }
    // 용수철: 빨리 젖혀졌다가 살짝 넘어 돌아옴
    const K=170, D=15; v+=(-K*a-D*v)*Math.min(dt,.05); a+=v*Math.min(dt,.05);
    if(Math.abs(a)<.004&&Math.abs(v)<.02){ a=0; v=0; on=false; player.rotation.x=0; player.rotation.z=0; return; }
    const ry=player.rotation.y, s=Math.sin(ry), c=Math.cos(ry);
    const lz=ax*s+az*c, lx=ax*c-az*s;                // 밀리는 방향을 캐릭터 기준(앞=+z, 옆=+x)으로
    const tilt=a*.42;                                // 최대 약 24도
    player.rotation.x=lz*tilt; player.rotation.z=-lx*tilt;
    const push=Math.max(0,a)*.38; player.position.x+=ax*push; player.position.z+=az*push;
    if(a>.15) player.position.y-=a*.06; }
  XTICK.push(tick);
  return {kick,tick};
})();
</script>
