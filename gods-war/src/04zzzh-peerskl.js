<script>
/* ================= v156 친구가 기술 쓰면 머리 옆에 기술 이름 말풍선 =================
   - 함께하는 친구(PEERS)가 기술을 쓰면(받은 "sk" 메시지 = 원래 합체 기술용) 그 친구 머리 옆에 「💥 심판의 빛」 같은 작은 말풍선이
     톡 튀어나와 위로 떠오르며 1.6초 뒤 사라짐. 테두리는 기술 색, 같은 편은 금빛·다른 편은 붉은 꼬리표. 궁극기는 「궁극기」 딱지.
   - comboRecv 를 감싸서 보기만(합체 기술 규칙·메시지 형식 그대로). DOM 은 친구마다 1개 돌려씀, 45걸음 안·화면 안일 때만. 그리기 호출 0. */
const PEERSKL=(function(){
  const M={}; const v=new THREE.Vector3(); const LIFE=1.6;
  function hex(c){ return "#"+(c>>>0&0xffffff).toString(16).padStart(6,"0"); }
  function show(o,si){ try{ const R=REALMS[o.realm]; const S=R&&R.skills&&R.skills[si]; if(!S||!S.n) return;
      let e=M[o.id]; if(!e){ e=M[o.id]={el:document.createElement("div"),t:0}; e.el.className="pskl"; e.el.innerHTML='<i></i><b></b><em>궁극기</em>'; labelsEl.appendChild(e.el); }
      e.el.querySelector("i").textContent=typeof skIcon==="function"?skIcon(S):"✨"; e.el.querySelector("b").textContent=S.n;
      let col=S.color!=null?hex(S.color):"#ffd34a"; if(/^#f{5,6}|^#fffff/i.test(col)) col=R.c1||col;
      e.el.style.setProperty("--sc",col); e.el.classList.toggle("ult",S.type==="ult"); e.el.classList.toggle("foe",o.realm!==G.realm);
      e.el.classList.remove("on"); void e.el.offsetWidth; e.el.classList.add("on"); e.t=LIFE; e.o=o;
    }catch(err){} }
  if(typeof comboRecv==="function"){ const _cr=comboRecv; comboRecv=function(o,d){ const r=_cr.apply(this,arguments); try{ if(d&&d.t==="sk"&&o) show(o,d.s|0); }catch(e){} return r; }; }
  XTICK.push(function(dt){ for(const id in M){ const e=M[id]; if(e.t<=0) continue; e.t-=dt; const o=e.o;
      if(e.t<=0||!PEERS[id]||o.dead||Math.hypot(o.x-P.x,o.z-P.z)>45){ e.t=0; e.el.style.display="none"; if(!PEERS[id]){ e.el.remove(); delete M[id]; } continue; }
      v.set(o.x,hAt(o.x,o.z)+3.1,o.z).project(camera); if(v.z>1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1){ e.el.style.display="none"; continue; }
      e.el.style.display=""; const k=1-e.t/LIFE; const sx=(v.x+1)/2*innerWidth+18, sy=(1-v.y)/2*innerHeight-k*26;
      e.el.style.transform=`translate(${sx|0}px,${sy|0}px)`; } });
  return {show};
})();
</script>
