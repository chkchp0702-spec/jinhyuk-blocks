<script>
/* v64: 물약 회복 연출 — 마시면 몸 둘레로 초록 빛 나선 두 줄이 빙글빙글 올라가고, ✚ 빛 십자가 둥실 떠오르며,
   몸이 잠깐 초록빛으로 은은히 빛나고, 머리 위에 초록 「+회복량」 숫자. 발밑엔 초록 마법진.
   빛 나선은 점 묶음 하나(밝은 눈밭에서도 보이게 진한 초록 테두리)(그리기 1번), 십자는 3~5장, 0.9~1.3초 뒤 모두 사라짐. PointLight 없음. */
const HEALFX=(function(){
  let dot=null, cross=null;
  function tex(draw){ const c=document.createElement("canvas"); c.width=c.height=64; draw(c.getContext("2d"),64); return new THREE.CanvasTexture(c); }
  function dotT(){ return dot||(dot=tex((g,s)=>{ const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2); r.addColorStop(0,"rgba(255,255,255,1)"); r.addColorStop(.3,"rgba(255,255,255,.8)"); r.addColorStop(1,"rgba(255,255,255,0)"); g.fillStyle=r; g.fillRect(0,0,s,s); })); }
  function crossT(){ return cross||(cross=tex((g,s)=>{ const c=s/2; const r=g.createRadialGradient(c,c,0,c,c,c); r.addColorStop(0,"rgba(120,255,160,.55)"); r.addColorStop(1,"rgba(120,255,160,0)"); g.fillStyle=r; g.fillRect(0,0,s,s);
      g.fillStyle="#1f8a45"; g.fillRect(c-8,c-22,16,44); g.fillRect(c-22,c-8,44,16); g.fillStyle="#7dffa6"; g.fillRect(c-5,c-19,10,38); g.fillRect(c-19,c-5,38,10); g.fillStyle="#fff"; g.fillRect(c-2,c-14,4,28); g.fillRect(c-14,c-2,28,4); })); }
  const C1=new THREE.Color(0x5dff8a), C2=new THREE.Color(0xd8ffe4);
  function play(amount){ if(typeof player==="undefined"||!player) return; const eco=ECO(), N=eco?22:44, H=3.4;
    /* 빛 나선 두 줄 */
    const geo=new THREE.BufferGeometry(), pos=new Float32Array(N*3), col=new Float32Array(N*4); geo.setAttribute("position",new THREE.BufferAttribute(pos,3)); geo.setAttribute("rgba",new THREE.BufferAttribute(col,4));
    /* 밝은 눈밭에서도 보이게: 더하기 빛이 아니라 진한 초록 테두리 + 밝은 속 점 */
    const m=new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:{sz:{value:renderer.getPixelRatio()*(eco?130:145)}},transparent:true,depthWrite:false,
      vertexShader:"attribute vec4 rgba; varying vec4 vC; uniform float sz; void main(){ vC=rgba; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=sz/-mv.z; gl_Position=projectionMatrix*mv; }",
      fragmentShader:"varying vec4 vC; void main(){ float d=length(gl_PointCoord-.5)*2.; if(d>1.) discard; vec3 rim=vec3(.05,.42,.18); vec3 c=mix(vC.rgb,rim,smoothstep(.45,.8,d)); float a=vC.a*(1.-smoothstep(.8,1.,d)); gl_FragColor=vec4(c,a); }"})); m.frustumCulled=false; m.renderOrder=5; m.userData.noOutline=true; scene.add(m);
    FX.push({m,t:0,d:1.25,own:true,tick:(f,k)=>{ const by=(P.y||0)+hAt(P.x,P.z); for(let i=0;i<N;i++){ const s=i&1, u=(i>>1)/(N/2); const h=clamp(k*2.3-u*1.3,0,1); const vis=h>0&&h<1?Math.sin(h*Math.PI):0;
        const a=s*Math.PI+h*7+k*3, r=1.15*(1-h*.45); pos[i*3]=P.x+Math.cos(a)*r; pos[i*3+1]=by+.2+h*H; pos[i*3+2]=P.z+Math.sin(a)*r;
        const c=(i%3===0)?C2:C1; col[i*4]=c.r; col[i*4+1]=c.g; col[i*4+2]=c.b; col[i*4+3]=vis*(1-k*.3); }
      geo.attributes.position.needsUpdate=true; geo.attributes.rgba.needsUpdate=true; P.healGlow=Math.max(P.healGlow||0,1-k); }});
    /* ✚ 빛 십자 둥실 */
    const nc=eco?3:5; for(let j=0;j<nc;j++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:crossT(),toneMapped:false,transparent:true,depthWrite:false,opacity:0})); sp.renderOrder=6; scene.add(sp); const a=j/nc*6.28+rnd(-.3,.3), r=rnd(.7,1.3), sz=rnd(.7,1.05);
      FX.push({m:sp,t:-j*.12,d:.95,tick:(f,k)=>{ if(k<0){ sp.visible=false; return; } sp.visible=true; const e=1-Math.pow(1-k,2); sp.position.set(P.x+Math.cos(a)*r,(P.y||0)+hAt(P.x,P.z)+1.2+e*2.6,P.z+Math.sin(a)*r); const s=sz*(k<.2?k/.2:1); sp.scale.set(s,s,1); sp.material.opacity=k<.2?k/.2:1-(k-.2)/.8; }}); }
    if(typeof SFX!=="undefined") try{ SFX.runeAt(P.x,P.z,0x5dff8a,4.2,.9); }catch(e){}
    if(amount>0) floatDmg(P.x,4.4,P.z,"+"+fmt(amount),"heal"); }
  return {play};
})();
</script>
