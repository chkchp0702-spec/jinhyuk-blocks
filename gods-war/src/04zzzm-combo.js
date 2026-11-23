<script>
/* ================= v167 공격 버튼 연타 콤보 불꽃 고리 (모습만 — 공격 규칙·데미지 그대로) =================
   공격이 괴물에 맞을 때마다(활·마법은 가까이 괴물이 있을 때 쏘면) 콤보가 1씩 오르고, 1.4초 안 때리면 사라짐.
   3연타부터 버튼 둘레에 톱니 불꽃 고리가 돌며 타오르고, 위에 「×N」 배지:
   3~4 주황 불꽃 · 5~9 푸른 흰 불꽃 · 10 이상 보라·금 무지개 불꽃. 단계 오를 때 '화륵' 소리 + 퍼지는 고리.
   DOM: 버튼 안 <i> 2개(고리·배지), 움직임은 3D 프레임(XTICK)에서 transform 만 — CSS 무한 애니메이션 없음. */
const ATKCMB=(()=>{
  const b=document.getElementById("bAtk"); if(!b||typeof attack!=="function") return {};
  const ring=document.createElement("i"); ring.className="cmbR"; const bad=document.createElement("i"); bad.className="cmbB"; b.appendChild(ring); b.appendChild(bad);
  let n=0, idle=0, tier=0, rot=0, pulse=0, inAtk=false, hit=false;
  const _dm=damageMob; damageMob=function(m,d,c){ if(inAtk) hit=true; return _dm.apply(this,arguments); };
  const _a=attack;
  attack=function(){ const cd0=(typeof P!=="undefined")?P.atkCd:1; inAtk=true; hit=false; let r; try{ r=_a.apply(this,arguments); } finally { inAtk=false; }
    try{ if(cd0<=0&&P.atkCd>0||hit){ let ok=hit; if(!ok){ const wk=(typeof myWeaponKind==="function")?myWeaponKind():"sword"; if(wk==="bow"||wk==="magic"){ for(const m of mobs){ if(m.hp>0&&Math.hypot(m.x-P.x,m.z-P.z)<16){ ok=true; break; } } } } if(ok) add(); } }catch(e){}
    return r; };
  function tierOf(k){ return k>=10?3:k>=5?2:k>=3?1:0; }
  function add(){ n++; idle=1.4; pulse=1; const t=tierOf(n);
    if(t!==tier){ if(t>tier&&t>0){ b.classList.remove("cmbUp"); void b.offsetWidth; b.classList.add("cmbUp"); setTimeout(()=>b.classList.remove("cmbUp"),520);
        try{ const f=[0,330,440,587][t]; tone(f,.12,"sawtooth",0,.05); tone(f*1.5,.16,"triangle",.06,.06); if(t===3) tone(f*2,.2,"triangle",.12,.05); }catch(e){} try{ if(navigator.vibrate&&!ECO()) navigator.vibrate(t*8); }catch(e){} }
      tier=t; b.classList.remove("cmb1","cmb2","cmb3"); if(t) b.classList.add("cmb"+t); }
    if(t){ bad.textContent="×"+n; bad.classList.remove("pop"); void bad.offsetWidth; bad.classList.add("pop"); } }
  function reset(){ n=0; tier=0; b.classList.remove("cmb1","cmb2","cmb3"); }
  XTICK.push(dt=>{ if(!n) return; idle-=dt; if(idle<=0||(typeof P!=="undefined"&&P.dead)){ reset(); return; }
    if(!tier) return; rot=(rot+dt*(140+tier*90))%360; pulse=Math.max(0,pulse-dt*4);
    const fl=1+Math.sin(performance.now()/60)*.025*tier+pulse*.1, fade=Math.min(1,idle/.45);
    ring.style.transform=`rotate(${rot.toFixed(1)}deg) scale(${fl.toFixed(3)})`; ring.style.opacity=fade.toFixed(2); bad.style.opacity=fade.toFixed(2); });
  return {get n(){ return n; }, add, reset};
})();
</script>
