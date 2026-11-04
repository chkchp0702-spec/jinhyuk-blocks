<script>
/* ================= 먼 산 실루엣 (v35) =================
   세상 둘레 아주 먼 곳에 산줄기 두 겹(먼 산은 연하게, 앞 산은 진하게)이 하늘색에 녹아 보임.
   밑동은 안개에 스르르 묻힘, 꼭대기는 살짝 밝은 테두리(눈·햇빛). 하늘색(안개 색)을 따라 낮·밤·세계 색이 저절로 바뀜.
   그리기 1번, 삼각형 ~800개, PointLight 없음. 미궁·집 안에서는 숨김. 멀리 볼수록(축소) 산도 멀리 밀려나 땅을 가리지 않음. */
const HORIZON=(()=>{ const pos=[], lay=[], ht=[]; let seed=7; const R=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  function ridge(r,L,n,hmin,hmax){ const ph=[R()*6,R()*6,R()*6]; const hs=[]; for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2;
      let h=.5+.28*Math.sin(a*3+ph[0])+.16*Math.sin(a*7+ph[1])+.09*Math.sin(a*17+ph[2])+(R()-.5)*.18; if(R()<.12) h+=R()*.35; hs.push(hmin+(hmax-hmin)*clamp(h,0,1.2)); }
    hs[n]=hs[0];
    for(let i=0;i<n;i++){ const a0=i/n*Math.PI*2, a1=(i+1)/n*Math.PI*2; const x0=Math.sin(a0)*r, z0=Math.cos(a0)*r, x1=Math.sin(a1)*r, z1=Math.cos(a1)*r; const b=-12;
      const q=[[x0,b,z0,0],[x1,b,z1,0],[x1,hs[i+1],z1,1],[x0,b,z0,0],[x1,hs[i+1],z1,1],[x0,hs[i],z0,1]];
      q.forEach(v=>{ pos.push(v[0],v[1],v[2]); lay.push(L); ht.push(v[3]*v[1]/hmax); }); } }
  ridge(275,0,140,26,92); ridge(245,1,120,14,58);
  const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute("lay",new THREE.Float32BufferAttribute(lay,1)); geo.setAttribute("ht",new THREE.Float32BufferAttribute(ht,1));
  const mat=new THREE.ShaderMaterial({fog:false,side:THREE.DoubleSide,uniforms:{fogC:{value:new THREE.Color()},topC:{value:new THREE.Color()},day:{value:1}},
    vertexShader:"attribute float lay; attribute float ht; varying float vL; varying float vH; void main(){ vL=lay; vH=ht; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader:"uniform vec3 fogC; uniform vec3 topC; uniform float day; varying float vL; varying float vH; void main(){ vec3 m=mix(fogC*vec3(.62,.68,.82),fogC*vec3(.42,.47,.62),vL); m=mix(m,topC,(1.0-vL)*.18); float a=(.30+.32*vL)*smoothstep(-.05,.5,vH); vec3 c=mix(fogC,m,clamp(a*1.6,0.0,1.0)); float rim=smoothstep(.62,1.0,vH)*(1.0-vL)*.22*day; c+=vec3(rim); gl_FragColor=vec4(c,1.0); }"});
  const mesh=new THREE.Mesh(geo,mat); mesh.frustumCulled=false; mesh.renderOrder=-1; mesh.userData.noOutline=true; mesh.userData.cullR=-1; mesh.castShadow=mesh.receiveShadow=false; scene.add(mesh);
  function tick(off){ mesh.visible=!off; if(off) return; mat.uniforms.fogC.value.copy(scene.fog.color); mat.uniforms.topC.value.copy(SKY.top); mat.uniforms.day.value=typeof DAY!=="undefined"&&DAY.d!=null?DAY.d:1;
    const s=clamp(((scene.fog?scene.fog.far:165)*Math.max(1,ZOOM*.85)+90)/250,1,1.95); mesh.scale.set(s,s,s); mesh.position.set(camera.position.x,(P.gy||0)-4*s,camera.position.z); }
  return {mesh,tick};
})();
</script>
