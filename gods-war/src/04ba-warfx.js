<script>
/* ================= v48 전쟁 연출 =================
   - 전장에 진영 깃발: 수비대 큰 깃발 2개(제단 양옆) + 공격대 깃발 3개(세 갈래 진지). 천은 셰이더로 펄럭임.
   - 병사 발밑에 진영 색 빛 고리(한 번에 그리는 InstancedMesh).
   - 전투가 시작되는 순간 "⚔ 전투 개시!" 큰 배너 + 뿔나팔·함성 소리 + 화면 흔들림.
   그리기 호출: 깃대 1 + 꼭지 1 + 천 5 + 고리 1. PointLight 없음. 게임 규칙·점수는 그대로(모습만). */
const WARFX=(function(){
  const root=new THREE.Group(); root.userData.noOutline=true; root.userData.cullR=-1; root.visible=false; scene.add(root);
  const uT={value:0};
  /* 깃대(+금빛 꼭지) 4개를 한 번에 */
  const poleG=new THREE.CylinderGeometry(.09,.12,7,6); poleG.translate(0,3.5,0);
  const poles=new THREE.InstancedMesh(poleG,new THREE.MeshLambertMaterial({color:0x5a3a22}),5); poles.userData.noOutline=true; root.add(poles);
  const tipG=new THREE.OctahedronGeometry(.32,0); tipG.translate(0,7.25,0);
  const tips=new THREE.InstancedMesh(tipG,new THREE.MeshLambertMaterial({color:0xffd24a,emissive:0x7a5a10}),5); tips.userData.noOutline=true; root.add(tips);
  /* 천: 깃대 쪽(x=0)은 묶여 있고 끝으로 갈수록 크게 펄럭 */
  const clothG=new THREE.PlaneGeometry(3.2,2,14,6); clothG.translate(1.6,5.6,0);
  function clothMat(){ return new THREE.ShaderMaterial({uniforms:{t:uT,c:{value:new THREE.Color(0xffffff)},ph:{value:0}},side:THREE.DoubleSide,
    vertexShader:`uniform float t,ph; varying vec2 vUv; varying float vSh; void main(){ vUv=uv; vec3 p=position; float a=uv.x;
      float w=sin(a*5.5-t*7.+ph)*.32*a+sin(a*9.-t*11.+uv.y*2.+ph)*.08*a; p.z+=w; p.y-=a*a*.25; vSh=cos(a*5.5-t*7.+ph)*a;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
    fragmentShader:`uniform vec3 c; varying vec2 vUv; varying float vSh; void main(){ vec3 col=c;
      float edge=step(vUv.y,.12)+step(.88,vUv.y)+step(vUv.x,.08); col=mix(col,vec3(1.,.84,.35),clamp(edge,0.,1.)*.85);
      vec2 q=abs(vUv-vec2(.5,.5))*vec2(1.6,1.); float dia=step(q.x+q.y,.26)-step(q.x+q.y,.17); col=mix(col,vec3(1.,.95,.75),dia*.9);
      float tail=step(.86,vUv.x)*step(abs(vUv.y-.5),(vUv.x-.86)*3.2); if(tail>.5) discard;
      col*=.72+.38*(.5+.5*vSh); gl_FragColor=vec4(col,1.); }`}); }
  const mA=clothMat(), mD=clothMat(); mA.uniforms.ph.value=0; mD.uniforms.ph.value=1.7;
  const cloths=[0,1,2,3,4].map(i=>{ const m=new THREE.Mesh(clothG,i<2?mD:mA); m.userData.noOutline=true; root.add(m); return m; });
  /* 병사 발밑 진영 빛 고리 */
  const RN=56; const ringG=new THREE.RingGeometry(.2,1.55,28); ringG.rotateX(-Math.PI/2);
  const ringM=new THREE.ShaderMaterial({uniforms:{t:uT},transparent:true,depthWrite:false,fog:false,
    vertexShader:`varying vec2 vP; varying vec3 vC; void main(){ vP=position.xz; vC=vec3(1.);
      #ifdef USE_INSTANCING_COLOR
      vC=instanceColor;
      #endif
      gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.); }`,
    fragmentShader:`uniform float t; varying vec2 vP; varying vec3 vC; void main(){ float r=length(vP); float k=clamp(1.-abs(r-1.28)/.26,0.,1.); k=k*(2.-k); float fill=smoothstep(1.3,.4,r)*.3; float a=atan(vP.y,vP.x);
      float sp=.65+.35*sin(a*3.+t*3.); gl_FragColor=vec4(mix(vC,vec3(1.),k*.2)*1.1,clamp(k*sp*1.1+fill,0.,.92)); }`});
  const rings=new THREE.InstancedMesh(ringG,ringM,RN); rings.userData.noOutline=true; rings.frustumCulled=false; root.add(rings);
  for(let i=0;i<RN;i++) rings.setColorAt(i,new THREE.Color()); rings.count=0; /* 색 버퍼는 count 0 전에 만들어야 크기가 맞음 */
  const dm=new THREE.Object3D(), _c=new THREE.Color();
  /* 배너 */
  const st=document.createElement("style"); st.textContent=`
#warban{position:fixed;left:0;right:0;top:30%;z-index:9;pointer-events:none;text-align:center;opacity:0;font-family:var(--font)}
#warban .bg{position:absolute;left:0;right:0;top:-10px;bottom:-12px;background:linear-gradient(90deg,transparent,rgba(30,4,10,.82) 18%,rgba(30,4,10,.82) 82%,transparent);border-top:2px solid rgba(255,200,90,.85);border-bottom:2px solid rgba(255,200,90,.85);box-shadow:0 0 24px rgba(255,80,40,.45)}
#warban .t{position:relative;font-size:clamp(34px,8vw,56px);color:#fff3c8;letter-spacing:4px;text-shadow:-2px -2px 0 #3a0a10,2px -2px 0 #3a0a10,-2px 2px 0 #3a0a10,2px 2px 0 #3a0a10,0 0 18px #ff6a2a}
#warban .s{position:relative;font-size:clamp(14px,3vw,19px);margin-top:2px;text-shadow:0 2px 0 #1b1030}
#warban .s b{font-weight:400} #warban .sw{position:absolute;left:0;right:0;top:-10px;bottom:-12px;overflow:hidden}
#warban .sw i{position:absolute;top:0;bottom:0;width:30%;left:-35%;background:linear-gradient(100deg,transparent,rgba(255,240,200,.55),transparent);transform:skewX(-20deg)}
#warban.on{animation:wbIn 2.6s ease-out forwards} #warban.on .t{animation:wbT 2.6s cubic-bezier(.2,1.4,.4,1) forwards} #warban.on .sw i{animation:wbSw .9s .25s ease-out}
@keyframes wbIn{0%{opacity:0}8%{opacity:1}80%{opacity:1}100%{opacity:0}}
@keyframes wbT{0%{transform:scale(2.4);opacity:0}12%{transform:scale(.94);opacity:1}20%{transform:scale(1)}100%{transform:scale(1.04)}}
@keyframes wbSw{to{left:110%}}
@media (orientation:landscape) and (max-height:540px){ #warban{top:22%} }`;
  document.head.appendChild(st);
  const ban=document.createElement("div"); ban.id="warban"; ban.innerHTML=`<div class="bg"></div><div class="sw"><i></i></div><div class="t"></div><div class="s"></div>`; document.body.appendChild(ban);
  function banner(t,s){ ban.querySelector(".t").textContent=t; ban.querySelector(".s").innerHTML=s; ban.classList.remove("on"); void ban.offsetWidth; ban.classList.add("on"); }
  function horn(){ if(!soundOn||!actx) return; try{ audioWake(); const t=actx.currentTime;
      [[147,0,1.1],[196,.45,1.3]].forEach(([f,d,l])=>{ const o=actx.createOscillator(), o2=actx.createOscillator(), g=actx.createGain(), lp=actx.createBiquadFilter(); o.type="sawtooth"; o2.type="sawtooth"; o.frequency.setValueAtTime(f*.94,t+d); o.frequency.linearRampToValueAtTime(f,t+d+.12); o2.frequency.value=f*1.005; lp.type="lowpass"; lp.frequency.value=900;
        g.gain.setValueAtTime(0,t+d); g.gain.linearRampToValueAtTime(.09,t+d+.1); g.gain.setValueAtTime(.09,t+d+l-.25); g.gain.linearRampToValueAtTime(0,t+d+l); o.connect(lp); o2.connect(lp); lp.connect(g).connect(actx.destination); o.start(t+d); o2.start(t+d); o.stop(t+d+l+.05); o2.stop(t+d+l+.05); });
      /* 함성: 걸러진 잡음이 점점 커졌다 줄어듦 */
      const L=1.6, b=actx.createBuffer(1,actx.sampleRate*L|0,actx.sampleRate), dd=b.getChannelData(0); for(let i=0;i<dd.length;i++) dd[i]=Math.random()*2-1;
      const src=actx.createBufferSource(); src.buffer=b; const bp=actx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=520; bp.Q.value=.8; const g=actx.createGain();
      g.gain.setValueAtTime(0,t+.9); g.gain.linearRampToValueAtTime(.07,t+1.5); g.gain.linearRampToValueAtTime(0,t+.9+L); src.connect(bp).connect(g).connect(actx.destination); src.start(t+.9); }catch(e){} }
  const F={ev:null,fought:false};
  const hex=(s)=>_c.set(s||"#cfcfcf").getHex();
  function place(i,x,z,face){ const y=hAt(x,z); dm.position.set(x,y,z); dm.rotation.set(0,face,0); dm.scale.setScalar(i<2?1.35:1.2); dm.updateMatrix(); poles.setMatrixAt(i,dm.matrix); tips.setMatrixAt(i,dm.matrix); cloths[i].position.set(x,y,z); cloths[i].rotation.y=face; cloths[i].scale.setScalar(i<2?1.35:1.2); }
  function setup(ev){ const s=warSides(ev); mA.uniforms.c.value.set(s.ac); mD.uniforms.c.value.set(s.dc); const A=warAxis();
    /* 깃발은 바람 방향(공격대 → 제단) 반대로 날리게 */
    [-1,1].forEach((sd,k)=>place(k,A.g.x-A.ux*2+A.uz*sd*6.5,A.g.z-A.uz*2-A.ux*sd*6.5,Math.atan2(A.ux,A.uz)+Math.PI/2));
    for(let l=0;l<3;l++){ const d=laneDir(l); place(l+2,A.g.x+d.x*36,A.g.z+d.z*36,Math.atan2(-d.x,-d.z)+Math.PI/2); }
    poles.instanceMatrix.needsUpdate=true; tips.instanceMatrix.needsUpdate=true; }
  function tick(dt){ const ev=WAR.cur; const on=!!(ev&&!ev.none&&!ev.resolved&&warActive());
    if(!on){ if(root.visible) root.visible=false; F.ev=ev; return; }
    const g=TERR_RINGS[ev.rg].position; const near=WAR.joined||Math.hypot(g.x-P.x,g.z-P.z)<90;
    if(F.ev!==ev){ F.ev=ev; F.fought=Date.now()>=ev.start+4000; setup(ev); }
    root.visible=near; if(!near) return; uT.value+=dt;
    if(!F.fought&&Date.now()>=ev.start){ F.fought=true; const s=warSides(ev);
      banner("⚔ 전투 개시!",`<b style="color:${s.ac}">${s.an}</b> <span style="color:#fff">⚔</span> <b style="color:${s.dc}">${s.dn}</b>`); horn(); P.shake=Math.max(P.shake||0,.7); buzz([120,60,120]);
      fxFlash(g.x,2,g.z,0xffb050,6,.5); }
    /* 고리: 가까운 병사만 */
    let n=0; const ca=hex(warSides(ev).ac), cd=hex(warSides(ev).dc);
    for(const u of WAR.units){ if(n>=RN) break; if(u.dead) continue; const d=Math.abs(u.x-P.x)+Math.abs(u.z-P.z); if(d>70) continue;
      const sc=(u.captain?1.7:1)*(1+.08*Math.sin(uT.value*4+n)); const da=Math.hypot(u.x-g.x,u.z-g.z); dm.position.set(u.x,hAt(u.x,u.z)+(da<4.3?.78:.2),u.z); /* 제단 받침돌 위에 선 병사 */ dm.rotation.set(0,uT.value*(u.side==="att"?.8:-.8),0); dm.scale.set(sc,1,sc); dm.updateMatrix(); rings.setMatrixAt(n,dm.matrix);
      _c.setHex(u.side==="att"?ca:cd); if(u.hit>0) _c.lerp(new THREE.Color(1,1,1),.6); rings.setColorAt(n,_c); n++; }
    rings.count=n; if(n){ rings.instanceMatrix.needsUpdate=true; if(rings.instanceColor) rings.instanceColor.needsUpdate=true; } }
  return {tick,banner,root};
})();
</script>
