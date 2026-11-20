<script>
/* ================= v161 길에서 줍기 ✨ — 빙글 도는 보석 + 바닥 그림자 =================
   - 지금까지는 빛나는 공 하나만 둥실 → 각진 보석(빛 받는 면이 반짝반짝)이 빙글 돌며 위아래 둥실,
     2.6초마다 "반짝!" 하고 커졌다 돌아옴, 높음 그래픽에선 작은 보석 조각 2개가 둘레를 돎.
   - 발밑에 진한 그림자 원(보석이 올라가면 작고 흐려짐) → 하얀 눈밭에서도 어디 있는지 또렷.
   - 무엇인지는 그대로 비밀(함정도 같은 모습). 줍는 규칙·시간·저장은 그대로, 04z-events.js 의 PK 목록을 보기만.
   - PointLight 없음, 아이템당 그리기 2~4번(최대 3개). */
(function(){
  if(typeof PK==="undefined") return;
  let S=null;
  function shared(){ if(S) return S;
    const gem=new THREE.OctahedronGeometry(.42,0); gem.scale(1,1.45,1);
    const chip=new THREE.OctahedronGeometry(.085,0);
    const c=document.createElement("canvas"); c.width=c.height=64; const g=c.getContext("2d"); const rg=g.createRadialGradient(32,32,2,32,32,31);
    rg.addColorStop(0,"rgba(10,20,40,.85)"); rg.addColorStop(.55,"rgba(10,20,40,.5)"); rg.addColorStop(1,"rgba(0,0,0,0)"); g.fillStyle=rg; g.fillRect(0,0,64,64);
    const shMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,opacity:.55});
    const sh=new THREE.PlaneGeometry(1.7,1.7); sh.rotateX(-Math.PI/2);
    S={gem,chip,sh,shMat}; return S; }
  // 눈밭에서도 색이 보이게 채도를 올리고 어둡게
  function sat(c,k){ const h={}; c.getHSL(h); return new THREE.Color().setHSL(h.h,Math.min(1,h.s*1.25+.1),Math.min(.6,h.l*.82)).multiplyScalar(k/.75); }
  const live=new Set();
  function dress(p){ const s=shared(); const col=p.T.trap?0xfff2a0:p.T.c; const base=new THREE.Color(col);
    const mat=new THREE.MeshPhongMaterial({color:sat(base,.75),emissive:sat(base,.22),specular:0xffffff,shininess:70,flatShading:true,fog:false});
    const gem=new THREE.Mesh(s.gem,mat); gem.userData.noOutline=true; gem.castShadow=false; p.g.add(gem);
    const sh=new THREE.Mesh(s.sh,s.shMat); sh.position.y=.1; sh.renderOrder=1; sh.userData.noOutline=true; p.g.add(sh);
    const chips=[]; if(HIGH()){ const cm=new THREE.MeshBasicMaterial({color:base.clone().lerp(new THREE.Color(0xffffff),.45)}); for(let i=0;i<2;i++){ const ch=new THREE.Mesh(s.chip,cm); ch.userData.noOutline=true; p.g.add(ch); chips.push(ch); } p._cm=cm; }
    // 원래 빛 공(더하기 섞기라 눈밭에선 하얗게 뭉개짐)은 숨김
    if(p.o) p.o.visible=false; // 빛 공은 숨기고 보석으로
    p._gem={gem,sh,chips,mat,base,ph:Math.random()*6.28,em:sat(base,.22)}; live.add(p); }
  function clean(){ for(const p of live){ if(PK.list.indexOf(p)<0){ try{ p._gem.mat.dispose(); if(p._cm) p._cm.dispose(); }catch(e){} live.delete(p); } } }
  const tmp=new THREE.Color();
  XTICK.push(function(dt){ if(!PK.list.length&&!live.size) return; const t=performance.now()/1000;
    for(const p of PK.list){ if(!p._gem) dress(p); const q=p._gem; const bob=Math.sin(t*2.3+q.ph)*.16; const y=1.15+bob;
      q.gem.position.y=y; q.gem.rotation.y+=dt*2.1; q.gem.rotation.z=Math.sin(t*1.3+q.ph)*.12;
      // 2.6초마다 반짝(커졌다 돌아오며 하얗게)
      const k=((t+q.ph)%2.6)/2.6; const gl=k<.1?Math.sin(k/.1*Math.PI):0; q.gem.scale.setScalar(1+gl*.28);
      tmp.copy(q.em).lerp(new THREE.Color(0xffffff),gl*.55); q.mat.emissive.copy(tmp);
      const ss=1-bob*.9; q.sh.scale.set(ss,1,ss); 
      q.chips.forEach((ch,i)=>{ const a=t*2.6+i*Math.PI+q.ph; ch.position.set(Math.cos(a)*.7,y+Math.sin(a*1.7)*.18,Math.sin(a)*.7); ch.rotation.y=a*2; }); }
    if(live.size>PK.list.length) clean(); });
})();
</script>
