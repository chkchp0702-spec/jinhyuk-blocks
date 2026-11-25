<style>
#sweep{position:fixed;left:50%;top:31%;transform:translate(-50%,-50%);z-index:9;pointer-events:none;text-align:center;display:none;white-space:nowrap}
#sweep .swT{font-family:var(--title);font-size:clamp(30px,10.5vh,52px);line-height:1;letter-spacing:4px;padding:0 .2em;
  background:linear-gradient(180deg,#fff8d6 0%,#ffe27a 38%,#f2a722 62%,#ffd04a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 3px 0 #3a1a04) drop-shadow(2px 0 0 #3a1a04) drop-shadow(-2px 0 0 #3a1a04) drop-shadow(0 -2px 0 #3a1a04) drop-shadow(0 0 12px rgba(255,170,40,.8));position:relative}
#sweep .swRow{position:relative;display:inline-block}
#sweep .swH{position:absolute;left:0;top:0;font-family:var(--title);font-size:clamp(30px,10.5vh,52px);line-height:1;letter-spacing:4px;padding:0 .2em;
  background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.95) 50%,transparent 60%);background-size:300% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;color:transparent}
#sweep .swN{display:inline-block;margin-top:2px;font-family:var(--title);font-size:clamp(12px,3.6vh,18px);letter-spacing:3px;color:#fff;
  padding:2px 14px;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(120,60,10,.75),transparent);text-shadow:0 1px 0 #3a1a04,0 0 8px #ffb84a}
#sweep .swW{position:absolute;top:44%;width:clamp(40px,12vw,90px);height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,#ffe08a);box-shadow:0 0 8px #ffbf4a}
#sweep .swW.l{right:100%;margin-right:6px} #sweep .swW.r{left:100%;margin-left:6px;transform:scaleX(-1)}
#sweep.swOn{display:block;animation:swIn 1.55s cubic-bezier(.2,.9,.3,1) forwards}
#sweep.swOn .swH{animation:swShine .9s .18s ease-out forwards}
#sweep.swOn .swW{animation:swWing .5s .08s ease-out both}
@keyframes swIn{0%{opacity:0;transform:translate(-50%,-50%) scale(2.1) rotate(-4deg)}14%{opacity:1;transform:translate(-50%,-50%) scale(.92) rotate(1deg)}24%{transform:translate(-50%,-50%) scale(1.06)}34%{transform:translate(-50%,-50%) scale(1)}78%{opacity:1;transform:translate(-50%,-52%) scale(1)}100%{opacity:0;transform:translate(-50%,-62%) scale(.96)}}
@keyframes swShine{to{background-position:0% 0}}
@keyframes swWing{from{opacity:0;transform:scaleX(0)}to{opacity:1}}
#sweep .swW.r{animation-name:swWingR}
@keyframes swWingR{from{opacity:0;transform:scaleX(0)}to{opacity:1;transform:scaleX(-1)}}
@media (orientation:portrait){#sweep{top:30%}}
</style>
<script>
/* ================= v181: 무리 싹쓸이 — 마지막 한 마리 쓰러뜨리면 「싹쓸이!」 금빛 글씨 + 땅 파동 고리 (모습만) =================
   12초 안에 이어서 3마리 이상 쓰러뜨리고, 그 순간 나를 쫓던 괴물이 둘레(22m)에 하나도 안 남으면:
   - 화면 위쪽(가운데는 안 가림)에 「싹쓸이!」 금빛 큰 글씨가 쾅 떨어지며 빛 한 줄 스치고 「N마리 연속」 띠, 1.5초 뒤 위로 사라짐
   - 내 발밑에서 금빛 땅 파동 고리(빛살 무늬)가 18m까지 퍼지고 두 번째 얇은 고리가 뒤따름 + 금빛 불꽃 + '따다단' 소리
   killMob 감싸기 — 보상·경험치·저장 그대로. 파동은 평면 1장(셰이더) 재사용, 보일 때만 그리기 +1, PointLight 없음.
   전쟁·거대 보스·결투장·미궁 보스 처치는 세지 않음. 쿨타임 10초. */
const SWEEP=(()=>{
  let el=null, streak=0, lastK=-99, cool=0, wave=null, wt=-1, ox=0, oz=0;
  function box(){ if(el) return el; el=document.createElement("div"); el.id="sweep"; el.innerHTML='<div class="swRow"><i class="swW l"></i><div class="swT">싹쓸이!</div><div class="swH">싹쓸이!</div><i class="swW r"></i></div><br><div class="swN"></div>'; document.body.appendChild(el); return el; }
  function mkWave(){ const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
      uniforms:{t:{value:0},c:{value:new THREE.Color(0xffc94a)}},
      vertexShader:"varying vec2 vU; void main(){ vU=uv*2.-1.; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
      fragmentShader:"uniform float t; uniform vec3 c; varying vec2 vU; void main(){ float r=length(vU); float a=atan(vU.y,vU.x);"+
        "float R1=t*.92, R2=max(0.,t-.22)*.92;"+
        "float k1=exp(-pow((r-R1)/.035,2.)), k2=exp(-pow((r-R2)/.018,2.))*.7;"+
        "float trail=smoothstep(R1,R1-.22,r)*step(r,R1)*.28*(1.-t);"+
        "float rays=pow(abs(sin(a*9.+t*2.)),14.)*smoothstep(R1,R1*.4,r)*step(r,R1)*.5*(1.-t);"+
        "float fade=(1.-t)*(1.-t)*smoothstep(1.,.9,r);"+
        "vec3 col=mix(c,vec3(1.,.98,.85),k1*.6);"+
        "gl_FragColor=vec4(col*(k1*1.3+k2+trail+rays)*fade*1.25,1.); }"});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(40,40),mat); m.rotation.x=-Math.PI/2; m.userData.noOutline=true; m.userData.noLod=true; m.renderOrder=4; m.frustumCulled=false; m.visible=false; scene.add(m); return m; }
  function fire(n){ cool=10; streak=0;
    const b=box(); b.querySelector(".swN").textContent=n+"마리 연속"; b.classList.remove("swOn"); void b.offsetWidth; b.classList.add("swOn");
    clearTimeout(b._t); b._t=setTimeout(()=>b.classList.remove("swOn"),1600);
    try{ if(!wave) wave=mkWave(); ox=P.x; oz=P.z; wave.position.set(ox,(P.gy!=null?P.gy:hAt(ox,oz))+.15,oz); wave.visible=true; wt=0; }catch(e){ console.warn(e); }
    try{ fxSpark(P.x,1.2,P.z,0xffd86a,(typeof HIGH==="function"&&HIGH())?26:14); fxFlash(P.x,1,P.z,0xffe08a,3,.35); }catch(e){}
    try{ tone(784,.08,"square",0,.05); tone(988,.08,"square",.07,.05); tone(1318,.22,"triangle",.14,.07); tone(196,.25,"sawtooth",0,.06); }catch(e){}
    try{ P.shake=Math.max(P.shake||0,.25); }catch(e){} try{ buzz([20,30,40]); }catch(e){} }
  const _km=killMob;
  killMob=function(m){ const skip=!m||m.war||m.titan||m.arena||m.dgBoss||m.dsBoss; const r=_km.apply(this,arguments);
    try{ if(skip||!started||P.dead) return r; if(Math.hypot(m.x-P.x,m.z-P.z)>30) return r;
      const now=performance.now()/1000; if(now-lastK>12) streak=0; lastK=now; streak++;
      if(streak>=3&&cool<=0){ let left=0; for(const o of mobs){ if(o!==m&&o.hp>0&&!o.war&&!o.titan&&o.state==="chase"&&Math.hypot(o.x-P.x,o.z-P.z)<22){ left++; break; } }
        if(!left){ const n=streak; setTimeout(()=>fire(n),260); } } }catch(e){ console.warn(e); }
    return r; };
  XTICK.push(dt=>{ if(cool>0) cool-=dt; if(wt<0||!wave) return; wt+=dt/.95; if(wt>=1){ wt=-1; wave.visible=false; return; } wave.material.uniforms.t.value=wt; });
  return {fire, get streak(){ return streak; }};
})();
</script>
