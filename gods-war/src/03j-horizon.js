<script>
/* ================= 먼 산 실루엣 (v35) =================
   세상 둘레 아주 먼 곳에 산줄기 두 겹(먼 산은 연하게, 앞 산은 진하게)이 하늘색에 녹아 보임.
   밑동은 안개에 스르르 묻힘, 꼭대기는 살짝 밝은 테두리(눈·햇빛). 하늘색(안개 색)을 따라 낮·밤·세계 색이 저절로 바뀜.
   그리기 1번, 삼각형 ~800개, PointLight 없음. 미궁·집 안에서는 숨김. 멀리 볼수록(축소) 산도 멀리 밀려나 땅을 가리지 않음. */
/* v77: 안개 짙은 날(눈보라·폭풍·비) 산 실루엣이 진해지고, 눈보라 안개가 살짝 걷혀 먼 산·하늘이 보임. */
/* v66: 먼 산 꼭대기에 눈 덮인 봉우리(들쭉날쭉 눈 선·골짜기 줄무늬) + 해 쪽 봉우리가 노을에 주황빛으로 물듦 + 낮엔 눈이 반짝반짝(높음만). 셰이더 몇 줄만, 그리기 호출·폴리곤 그대로. */
const HORIZON=(()=>{ const pos=[], lay=[], ht=[]; let seed=7; const R=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  function ridge(r,L,n,hmin,hmax){ const ph=[R()*6,R()*6,R()*6]; const hs=[]; for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2;
      let h=.5+.28*Math.sin(a*3+ph[0])+.16*Math.sin(a*7+ph[1])+.09*Math.sin(a*17+ph[2])+(R()-.5)*.18; if(R()<.12) h+=R()*.35; hs.push(hmin+(hmax-hmin)*clamp(h,0,1.2)); }
    hs[n]=hs[0];
    for(let i=0;i<n;i++){ const a0=i/n*Math.PI*2, a1=(i+1)/n*Math.PI*2; const x0=Math.sin(a0)*r, z0=Math.cos(a0)*r, x1=Math.sin(a1)*r, z1=Math.cos(a1)*r; const b=-12;
      const q=[[x0,b,z0,0],[x1,b,z1,0],[x1,hs[i+1],z1,1],[x0,b,z0,0],[x1,hs[i+1],z1,1],[x0,hs[i],z0,1]];
      q.forEach(v=>{ pos.push(v[0],v[1],v[2]); lay.push(L); ht.push(v[3]*v[1]/hmax); }); } }
  ridge(275,0,140,26,92); ridge(245,1,120,14,58);
  const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute("lay",new THREE.Float32BufferAttribute(lay,1)); geo.setAttribute("ht",new THREE.Float32BufferAttribute(ht,1));
  const mat=new THREE.ShaderMaterial({fog:false,side:THREE.DoubleSide,uniforms:{fogC:{value:new THREE.Color()},topC:{value:new THREE.Color()},day:{value:1},snow:{value:.5},sunset:{value:0},sunXZ:{value:new THREE.Vector2(1,0)},tm:{value:0},hq:{value:1},dense:{value:0}},
    vertexShader:"attribute float lay; attribute float ht; varying float vL; varying float vH; varying vec2 vP; void main(){ vL=lay; vH=ht; vP=position.xz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader:"uniform vec3 fogC; uniform vec3 topC; uniform float day; uniform float snow; uniform float sunset; uniform vec2 sunXZ; uniform float tm; uniform float hq; uniform float dense; varying float vL; varying float vH; varying vec2 vP; void main(){ vec3 m=mix(fogC*vec3(.62,.68,.82),fogC*vec3(.42,.47,.62),vL); m=mix(m,topC,(1.0-vL)*.18); m=mix(m,fogC*vec3(.50,.56,.70),dense*.45); float a=(.30+.32*vL)*smoothstep(-.05,.5,vH)*(1.0+dense*(.75-vL*.25)); vec3 c=mix(fogC,m,clamp(a*1.6,0.0,1.0)); float rim=smoothstep(.62,1.0,vH)*(1.0-vL)*.22*day; c+=vec3(rim); float an=atan(vP.x,vP.y); vec2 dr=normalize(vP); float face=dot(dr,sunXZ)*.5+.5; float ln=.41+vL*.07+.05*sin(an*31.0+vL*3.0)+.035*sin(an*83.0)+.02*sin(an*197.0); float sn=smoothstep(ln,ln+.07,vH)*snow*(1.0-vL*.4); vec3 sc=mix(vec3(.62,.70,.92)*.55,vec3(1.0,.99,.96),day); sc=mix(sc,vec3(1.0,.72,.55),sunset*(.45+.55*face)*.9); float sh=.80+.20*sin(an*150.0+vH*11.0)*(.6+.4*face); c=mix(c,mix(fogC,sc*sh,.82-vL*.22),sn*(.50+.38*day)); float gl=smoothstep(.28,.8,vH)*sunset*(.4+.6*face*face)*(1.0-vL*.45); c+=vec3(1.0,.50,.22)*gl*.42; if(hq>.5){ float h=fract(sin(floor(an*2200.0)*12.9898+floor(vH*110.0)*78.233)*43758.55); float tw=pow(max(0.0,sin(tm*2.3+h*50.0)),10.0); c+=vec3(1.0,.97,.9)*step(.982,h)*tw*sn*day*(.45+.4*face); } gl_FragColor=vec4(c,1.0); }"});
  const mesh=new THREE.Mesh(geo,mat); mesh.frustumCulled=false; mesh.renderOrder=-1; mesh.userData.noOutline=true; mesh.userData.cullR=-1; mesh.castShadow=mesh.receiveShadow=false; scene.add(mesh);
  function tick(off){ mesh.visible=!off; if(off) return; mat.uniforms.fogC.value.copy(scene.fog.color); mat.uniforms.topC.value.copy(SKY.top); mat.uniforms.day.value=typeof DAY!=="undefined"&&DAY.d!=null?DAY.d:1;
    /* v66: 세계마다 눈 양(아스가르드 많이·인도 조금), 해 쪽 봉우리에 노을빛, 낮엔 눈이 반짝 */
    const U=mat.uniforms, th=P.x>=0?(P.z<0?REALMS[0]:REALMS[2]):(P.z<0?REALMS[1]:REALMS[3]); const sw={pine:1,column:.8,"tree-gold":.55,temple:.38}[th.prop]; U.snow.value+=((sw==null?.5:sw)-U.snow.value)*.03;
    const tt=((Date.now()/1000)%(typeof DAY!=="undefined"?DAY.len:480))/(typeof DAY!=="undefined"?DAY.len:480), el=Math.sin(tt*Math.PI*2); U.sunset.value=clamp(1-Math.abs(el)*3.2,0,1)*(el>-.2?1:0);
    U.sunXZ.value.set(Math.cos(tt*Math.PI*2),.44).normalize(); U.tm.value=performance.now()/1000; /* v77: 눈보라·비처럼 안개가 짙은 날엔 산 실루엣을 더 진하게(안개 속에 희미하게라도 보이게) */ const fd=clamp((165-(scene.fog?scene.fog.far:165))/70,0,1); U.dense.value+=(fd-U.dense.value)*.05; U.hq.value=(typeof HIGH==="function"&&HIGH()&&!(typeof ECO==="function"&&ECO()))?1:0;
    const s=clamp(((scene.fog?scene.fog.far:165)*Math.max(1,ZOOM*.85)+90)/250,1,1.95); mesh.scale.set(s,s,s); mesh.position.set(camera.position.x,(P.gy||0)-4*s,camera.position.z); }
  return {mesh,tick};
})();
</script>
