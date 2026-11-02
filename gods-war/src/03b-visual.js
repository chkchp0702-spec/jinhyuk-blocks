<script>
/* ================= 고급 그래픽: 외곽선 · 풀밭 · 밤낮 · 별 · 블룸 후처리 ================= */
/* ---- 만화풍 외곽선(뒤집힌 껍질) ---- */
const OUTLINE_MAT=new THREE.MeshBasicMaterial({color:0x1b1430,side:THREE.BackSide,toneMapped:false});
function outlined(g,thick){ const list=[]; g.traverse(m=>{ if(m.isMesh&&m.material&&!m.material.transparent&&m.material.type!=="MeshBasicMaterial"&&!m.userData.noOutline) list.push(m); });
  list.forEach(m=>{ const o=new THREE.Mesh(m.geometry,OUTLINE_MAT); o.position.copy(m.position); o.rotation.copy(m.rotation); o.scale.copy(m.scale).multiplyScalar(thick||1.07); o.castShadow=false; o.receiveShadow=false; o.userData.outline=true; m.parent.add(o); }); return g; }

/* ---- 맞으면 번쩍(히트 플래시): 그 캐릭터만 재질을 한 번 복사해 빛깔을 잠깐 바꿈 ---- */
const _HFC=new THREE.Color();
function hitTint(obj,k,col){ if(!obj) return; k=Math.max(0,Math.min(1,k||0)); const prev=obj._hfk||0; if(k===0&&prev===0) return;
  if(prev===0){ let n=0; obj.traverse(o=>{ if(o.isMesh) n++; }); if(!obj._hf||obj._hfn!==n){ const L=[]; obj.traverse(o=>{ if(!o.isMesh||o.userData.outline||!o.material||Array.isArray(o.material)||!o.material.emissive) return; if(!o._hfOwn){ o.material=o.material.clone(); o._hfOwn=1; } L.push({m:o.material,c:o.material.emissive.clone(),i:o.material.emissiveIntensity}); }); obj._hf=L; obj._hfn=n; } }
  obj._hfk=k; _HFC.set(col||0xffffff); for(const e of obj._hf){ e.m.emissive.copy(e.c).lerp(_HFC,k); e.m.emissiveIntensity=e.i+(1-e.i)*k*.9; } }

/* ---- 풀·꽃·눈덩이: 인스턴스 한 번에 그리기 ---- */
(function vegetation(){
  const dummy=new THREE.Object3D();
  function sway(material){ material.onBeforeCompile=sh=>{ sh.uniforms.uTime=TIME; sh.vertexShader="uniform float uTime;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\n#ifdef USE_INSTANCING\n float _ph=instanceMatrix[3][0]*.35+instanceMatrix[3][2]*.27; transformed.x+=sin(uTime*1.8+_ph)*.22*max(position.y,0.); transformed.z+=cos(uTime*1.3+_ph)*.12*max(position.y,0.);\n#endif"); }; material.customProgramCacheKey=()=>"sway"; return material; }
  function field(geo,material,count,realmIdx,yBase,sMin,sMax,avoid){ const sx=(realmIdx===0||realmIdx===2)?1:-1, sz=(realmIdx>=2)?1:-1; const im=new THREE.InstancedMesh(geo,material,count); let n=0;
    for(let k=0;k<count*3&&n<count;k++){ const x=sx*rnd(4,WORLD_HALF-6), z=sz*rnd(4,WORLD_HALF-6); if(Math.hypot(x,z)<REGIONS[12].r+4) continue; const cap=REGIONS[realmIdx*3]; if(Math.hypot(x-cap.x,z-cap.z)<33) continue; let bad=false; for(const rg of REGIONS){ if(!rg.cap&&Math.hypot(x-rg.x,z-rg.z)<9) bad=true; } if(bad) continue;
      const s=rnd(sMin,sMax); dummy.position.set(x,yBase*s+hAt(x,z),z); dummy.rotation.set(0,rnd(0,6.3),rnd(-.15,.15)); dummy.scale.set(s,s,s); dummy.updateMatrix(); im.setMatrixAt(n++,dummy.matrix); }
    im.count=n; im.receiveShadow=HIGH(); im.castShadow=false; im.frustumCulled=false; scene.add(im); }
  const blade=new THREE.ConeGeometry(.14,1.1,4); blade.translate(0,.55,0);
  const N=HIGH()?2600:900;
  field(blade,sway(mat({color:0x6fb04a,roughness:1})),N,0,0,.8,1.6);          // 에덴 풀
  field(new THREE.SphereGeometry(.3,6,5),mat({color:0xffd36a,emissive:0xffb020,emissiveIntensity:.5,roughness:.7}),Math.round(N*.18),0,.3,.5,1.1); // 에덴 황금 꽃
  field(new THREE.SphereGeometry(.5,6,5),mat({color:0xffffff,roughness:1}),Math.round(N*.5),1,.2,.6,1.8);   // 아스가르드 눈덩이
  field(new THREE.ConeGeometry(.2,1.3,5),mat({color:0xbfe6ff,roughness:.2,metalness:.1,transparent:true,opacity:.85}),Math.round(N*.25),1,.65,.6,1.6); // 얼음 결정
  field(blade,sway(mat({color:0xd9b24a,roughness:1})),N,2,0,1,2.2);          // 인도 황금 풀
  field(new THREE.SphereGeometry(.3,6,5),mat({color:0xff6fa0,emissive:0xff3080,emissiveIntensity:.35,roughness:.7}),Math.round(N*.18),2,.3,.5,1.1); // 인도 꽃
  field(blade,sway(mat({color:0x7fa85a,roughness:1})),N,3,0,.8,1.5);          // 올림푸스 풀
  field(new THREE.SphereGeometry(.28,6,5),mat({color:0xffffff,emissive:0xcfe8ff,emissiveIntensity:.3,roughness:.7}),Math.round(N*.18),3,.3,.5,1.1); // 흰 꽃
})();

/* ---- 별 ---- */
const STARS=(function(){ const N=1400; const g=new THREE.BufferGeometry(); const p=new Float32Array(N*3); for(let i=0;i<N;i++){ const a=rnd(0,6.283), e=rnd(.05,1.5); p[i*3]=Math.cos(a)*Math.cos(e)*400; p[i*3+1]=Math.sin(e)*400; p[i*3+2]=Math.sin(a)*Math.cos(e)*400; } g.setAttribute("position",new THREE.BufferAttribute(p,3)); const m=new THREE.PointsMaterial({color:0xffffff,size:2.2,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true,fog:false}); const pts=new THREE.Points(g,m); scene.add(pts); return pts; })();
/* 달 */
const MOON=sph(9,new THREE.MeshBasicMaterial({color:0xfff6d8,fog:false}),0,0,0); MOON.userData.noOutline=true; scene.add(MOON);

/* ---- 밤낮: 8분 주기, 모든 폰이 같은 시각 ---- */
const DAY={len:480,d:1};
function dayNight(dt,center,theme){
  const t=((Date.now()/1000)%DAY.len)/DAY.len; const ang=t*Math.PI*2; const elev=Math.sin(ang);        // -1 ~ 1
  const d=clamp(elev*1.4+.62,.32,1); DAY.d=d; const night=1-d;
  sun.position.set(P.x+Math.cos(ang)*90,20+Math.max(0,elev)*80+10,P.z+40); sun.target.position.set(P.x,0,P.z);
  sun.intensity=.15+1.15*d; sun.color.setHSL(.09,.6,.5+.45*d); hemi.intensity=.18+.4*d; fill.intensity=.1+.25*d;
  skyMat.uniforms.sunDir.value.copy(sun.position).sub(camera.position).normalize();
  const dayTop=new THREE.Color(center?0x3a2a5a:(theme.skyTop||theme.sky)), dayBot=new THREE.Color(center?0x8a7aa0:theme.fog);
  const sunset=clamp(1-Math.abs(elev)*4,0,1)*.8; dayTop.lerp(new THREE.Color(0xff8a50),sunset*.5); dayBot.lerp(new THREE.Color(0xffb070),sunset*.7);
  SKY.tTop.copy(dayTop).lerp(new THREE.Color(0x070818),night); SKY.tBot.copy(dayBot).lerp(new THREE.Color(0x1a1c3a),night);
  SKY.top.lerp(SKY.tTop,dt*.9); SKY.bot.lerp(SKY.tBot,dt*.9); scene.fog.color.copy(SKY.bot); sky.position.copy(camera.position); STARS.position.copy(camera.position); STARS.material.opacity=night*.95; STARS.rotation.y+=dt*.004;
  MOON.position.set(camera.position.x-Math.cos(ang)*300,Math.max(-40,-elev*220+30),camera.position.z-120); MOON.visible=night>.1; MOON.material.opacity=night; MOON.material.transparent=true;
  renderer.toneMappingExposure=.95-night*.25; }

/* ---- 날씨: 세계마다 다른 날씨가 3분마다 바뀜(모든 폰 동일) ---- */
const WEATHER={type:"clear",fogN:55,fogF:165,flash:0,nextBolt:5};
const WTYPES=[["clear","clear","gold","rain"],["snow","snow","blizzard","clear"],["clear","clear","rain","wind"],["clear","rain","storm","clear"]];
function weatherNow(realmIdx){ const slot=Math.floor(Date.now()/180000); const h=((slot*2654435761)>>>0)%4; return WTYPES[realmIdx][(h+slot+realmIdx)%4]; }
function tickWeather(dt,realmIdx,center){ const w=center?"clear":weatherNow(realmIdx); if(w!==WEATHER.type){ WEATHER.type=w; if(typeof toast==="function"&&started) toast({clear:"하늘이 맑아졌어요",gold:"황금빛 비가 내려요",rain:"비가 내려요",snow:"눈이 내려요",blizzard:"눈보라가 몰아쳐요!",wind:"모래바람이 불어요",storm:"폭풍이 몰려와요! 번개 조심"}[w],null,2); }
  const heavy=w==="blizzard"||w==="storm"; const tn=heavy?28:w==="rain"||w==="snow"||w==="wind"?40:55, tf=heavy?95:w==="rain"||w==="snow"||w==="wind"?130:165; WEATHER.fogN+=(tn-WEATHER.fogN)*dt; WEATHER.fogF+=(tf-WEATHER.fogF)*dt; scene.fog.near=WEATHER.fogN; scene.fog.far=WEATHER.fogF;
  WEATHER.flash=Math.max(0,WEATHER.flash-dt*6); if(w==="storm"){ WEATHER.nextBolt-=dt; if(WEATHER.nextBolt<=0){ WEATHER.nextBolt=rnd(4,11); WEATHER.flash=1; if(soundOn&&actx){ const t=actx.currentTime; const b=actx.createBuffer(1,actx.sampleRate*.6,actx.sampleRate); const d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.5); const src=actx.createBufferSource(); src.buffer=b; const g=actx.createGain(); g.gain.value=.25; src.connect(g).connect(actx.destination); src.start(t+.12); } if(typeof P!=="undefined") P.shake=Math.max(P.shake||0,.5); if(typeof fxBolt==="function"&&typeof P!=="undefined") fxBolt(P.x+rnd(-30,30),P.z+rnd(-30,30),0xffffff); } }
  if(WEATHER.flash>0){ hemi.intensity+=WEATHER.flash*1.5; sun.intensity+=WEATHER.flash*1.2; SKY.top.lerp(new THREE.Color(0xffffff),WEATHER.flash*.5); SKY.bot.lerp(new THREE.Color(0xffffff),WEATHER.flash*.5); } }

/* ---- 블룸 후처리(직접 구현): 밝은 부분만 뽑아 흐리게 더함 + 비네트 ---- */
const POST=(function(){
  if(!HIGH()) return null;
  const Q=new THREE.PlaneGeometry(2,2); const cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1); const sc=new THREE.Scene(); const quad=new THREE.Mesh(Q,null); sc.add(quad);
  const vs=`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
  const bright=new THREE.ShaderMaterial({uniforms:{t:{value:null},th:{value:.82}},vertexShader:vs,fragmentShader:`uniform sampler2D t; uniform float th; varying vec2 vUv; void main(){ vec4 c=texture2D(t,vUv); float l=dot(c.rgb,vec3(.299,.587,.114)); float k=smoothstep(th,th+.18,l); gl_FragColor=vec4(c.rgb*k,1.); }`,depthTest:false,depthWrite:false});
  const blur=new THREE.ShaderMaterial({uniforms:{t:{value:null},dir:{value:new THREE.Vector2(1,0)},res:{value:new THREE.Vector2(1,1)}},vertexShader:vs,fragmentShader:`uniform sampler2D t; uniform vec2 dir,res; varying vec2 vUv; void main(){ vec2 o=dir/res; vec4 s=texture2D(t,vUv)*.227; s+=(texture2D(t,vUv+o*1.38)+texture2D(t,vUv-o*1.38))*.316; s+=(texture2D(t,vUv+o*3.23)+texture2D(t,vUv-o*3.23))*.07; s+=(texture2D(t,vUv+o*5.1)+texture2D(t,vUv-o*5.1))*.02; gl_FragColor=s; }`,depthTest:false,depthWrite:false});
  const comp=new THREE.ShaderMaterial({uniforms:{t:{value:null},b:{value:null},str:{value:.75},hurt:{value:0},tint:{value:new THREE.Color(0xffffff)},tintA:{value:0}},vertexShader:vs,fragmentShader:`uniform sampler2D t,b; uniform float str,hurt,tintA; uniform vec3 tint; varying vec2 vUv; void main(){ vec3 c=texture2D(t,vUv).rgb; vec3 g=texture2D(b,vUv).rgb; c+=g*str; float l=dot(c,vec3(.299,.587,.114)); c=mix(vec3(l),c,1.12); vec2 d=vUv-.5; float v=1.-dot(d,d)*.9; c*=v; c=mix(c,vec3(.8,.05,.1),hurt*(1.-v)*2.); c=mix(c,tint*(.6+l),tintA*(.35+(1.-v)*.8)); gl_FragColor=vec4(c,1.); }`,depthTest:false,depthWrite:false});
  const mk=(w,h)=>{ const r=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:true,stencilBuffer:false}); r.texture.encoding=THREE.sRGBEncoding; return r; };
  const S={rt:null,a:null,b:null,w:0,h:0};
  function size(w,h){ if(S.w===w&&S.h===h) return; S.w=w;S.h=h; [S.rt,S.a,S.b].forEach(r=>r&&r.dispose()); S.rt=mk(w,h); const bw=Math.max(64,Math.round(w/4)), bh=Math.max(64,Math.round(h/4)); S.a=mk(bw,bh); S.b=mk(bw,bh); S.a.depthBuffer=S.b.depthBuffer=false; blur.uniforms.res.value.set(bw,bh); }
  function pass(m,target){ quad.material=m; renderer.setRenderTarget(target); renderer.render(sc,cam); }
  function render(){ const w=renderer.domElement.width, h=renderer.domElement.height; size(w,h); renderer.setRenderTarget(S.rt); renderer.render(scene,camera);
    bright.uniforms.t.value=S.rt.texture; pass(bright,S.a); blur.uniforms.t.value=S.a.texture; blur.uniforms.dir.value.set(1,0); pass(blur,S.b); blur.uniforms.t.value=S.b.texture; blur.uniforms.dir.value.set(0,1); pass(blur,S.a); blur.uniforms.t.value=S.a.texture; blur.uniforms.dir.value.set(1.6,0); pass(blur,S.b); blur.uniforms.t.value=S.b.texture; blur.uniforms.dir.value.set(0,1.6); pass(blur,S.a);
    comp.uniforms.t.value=S.rt.texture; comp.uniforms.b.value=S.a.texture; comp.uniforms.str.value=.45+(1-DAY.d)*.5; pass(comp,null); }
  return {render,comp};
})();
</script>
