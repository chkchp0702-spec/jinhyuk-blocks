<script>
/* ================= v149 그래픽: 내 캐릭터 대기 동작(숨쉬기·두리번·손 인사) =================
   가만히 서 있으면 가슴이 천천히 오르내리며 숨쉬고, 4초 넘게 서 있으면 7~10초마다
   ①고개를 왼쪽·오른쪽으로 두리번(몸도 살짝 따라 돎) ②손을 들어 인사(Interact 동작 한 번)를 번갈아 함.
   애니메이션 믹서가 뼈를 움직인 "뒤"에 머리·가슴 뼈에 살짝 더하는 방식(tickMixers 감싸기) — 모델·저장·규칙 그대로, 모습만.
   움직이거나 공격·점프·죽음·탈것·창 열림이면 바로 멈추고 처음부터. 뼈 2개 회전만이라 휴대폰 부담 거의 없음. */
const IDLEFX=(()=>{ let t=0, next=5, act=null, at=0, nAct=0, br=0, bones=null, owner=null;
  function findBones(){ const u=player&&player.userData; if(!u||!u.gl) return null; if(owner===player&&bones) return bones; owner=player; bones={}; player.traverse(o=>{ if(!o.isBone) return; const n=o.name.toLowerCase(); if(n==="head") bones.head=o; else if(n==="chest") bones.chest=o; else if(n==="spine") bones.spine=o; }); return bones; }
  function calm(){ return started&&player&&player.userData.gl&&!P.dead&&!P.moving&&!P.ride&&P.y<.05&&!(P.atkAnim>0)&&!layerOpen&&player.visible; }
  function post(dt){ try{ if(!calm()){ t=0; next=4+Math.random()*2; act=null; br=Math.max(0,br-dt*3); return; }
      const B=findBones(); if(!B||!B.head) return; const G=player.userData.gl; if(G.cur!=="Idle_A"&&act!=="wave") { t=0; return; }
      t+=dt; br=Math.min(1,br+dt*1.5); const now=performance.now()/1000;
      /* 숨쉬기: 가슴이 뒤로 살짝 젖혀졌다 돌아옴(머리는 반대로 받쳐 시선 유지) */
      const b=(Math.sin(now*2.1)*.5+.5)*br; if(B.chest){ B.chest.rotation.x-=.05*b; } B.head.rotation.x+=.035*b; if(B.spine) B.spine.position.y+=.004*b;
      if(!act&&t>next){ act=(nAct++%3===2)?"wave":"look"; at=0; next=t+7+Math.random()*3; if(act==="wave"){ playAnim(player,"Cheer",true,.2); } }
      if(act==="look"){ at+=dt; const D=2.8; if(at>=D){ act=null; return; } const k=at/D;
        /* 0→왼쪽 보고 멈춤→오른쪽 보고 멈춤→앞으로. 부드러운 곡선 */
        const s=Math.sin(k*Math.PI*2)*Math.min(1,Math.sin(k*Math.PI)*2.2); const yaw=s*.75;
        B.head.rotation.y+=yaw; if(B.chest) B.chest.rotation.y+=yaw*.28; B.head.rotation.z+=s*.06; }
      else if(act==="wave"){ at+=dt; if(at>2.2) act=null; }
    }catch(e){} }
  return {post,get act(){ return act; },get at(){ return at; }};
})();
{ const _tm=tickMixers; tickMixers=function(dt){ _tm(dt); IDLEFX.post(dt); }; }
</script>
