<script>
/* ================= v153 그래픽: 괴물이 때릴 때 빨간 반달 궤적 =================
   괴물이 공격을 휘두르는 순간(WARN 의 빨간 원이 다 찬 뒤 "쾅") 몸 앞에 빨간 초승달 궤적이 휙 지나가며
   머리 쪽은 주황·하얗게 달아오르고 꼬리는 스르륵 사라짐 → "저 녀석한테 맞았다!" 가 눈에 보임.
   보스는 더 크고 굵은 검붉은 반달 + 금빛 심. 칠 때마다 왼→오 / 오→왼 번갈아 기울임.
   모습만 — 공격 시간·피해·거리 그대로(lunge 값을 읽기만 함). 공유 도형 1개, 재질 최대 4개(절약 2개), PointLight 없음. */
const MOBARC=(()=>{
  const V=`varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const F=`uniform vec3 col,hot; uniform float prog,fade,dir,thick; varying vec3 vP;
   void main(){ float a=atan(vP.y,vP.x); float t=a/3.14159265; if(dir<0.0) t=1.0-t; if(t<0.0||t>1.0) discard;
    float head=prog*1.35; float d=head-t; if(d<0.0) discard; float tail=1.0-smoothstep(0.0,0.85,d);
    float r=(length(vP.xy)-1.0)/2.2; float w=pow(max(sin(t*3.14159),0.0),0.55)*thick;
    float band=1.0-smoothstep(w*0.5,w,abs(r-0.6));
    float core=(1.0-smoothstep(0.0,w*0.33,abs(r-0.6)))*(1.0-smoothstep(0.0,0.3,d));
    float al=band*tail*fade; if(al<0.01) discard;
    vec3 c=mix(col*0.55,col,band); c=mix(c,hot,core*0.85);
    gl_FragColor=vec4(c,min(1.0,al*1.15)); }`;
  const GEO=new THREE.RingGeometry(1.0,3.2,36,1,0,Math.PI);
  const pool=[]; let flip=1, last=performance.now();
  function item(){ const lim=(typeof ECO==="function"&&ECO())?2:4; let it=pool.find(q=>!q.on); if(it) return it; if(pool.length>=lim) return pool.reduce((a,b)=>a.t>b.t?a:b);
    const mat=new THREE.ShaderMaterial({vertexShader:V,fragmentShader:F,transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide,
      uniforms:{col:{value:new THREE.Color()},hot:{value:new THREE.Color()},prog:{value:0},fade:{value:1},dir:{value:1},thick:{value:.5}}});
    const g=new THREE.Group(); const m=new THREE.Mesh(GEO,mat); m.userData.noOutline=true; m.renderOrder=6; m.frustumCulled=false; g.add(m); g.visible=false; scene.add(g);
    it={g,m,mat,on:false,t:0,d:.28}; pool.push(it); return it; }
  function swing(m){ const it=item(); const u=it.mat.uniforms; flip=-flip; const sc=Math.max(.8,Math.min(2.6,Math.sqrt(m.scale||1)));
    const big=m.boss, el=m.elite;
    u.col.value.set(big?0xc0101a:el?0xff3a1a:0xff2a14); u.hot.value.set(big?0xffd060:0xffc27a); u.dir.value=flip; u.prog.value=0; u.fade.value=1; u.thick.value=big?.7:el?.62:.55;
    const h=(m.mesh.userData.h||3)*(m.scale||1);
    const ry=m.rot!=null?m.rot:m.mesh.rotation.y;
    // 괴물 앞(나와 괴물 사이) 몸 가운데 높이에 — 카메라를 바라보게 세워 어느 쪽에서 봐도 반달 모양이 보임(할퀴듯 비스듬히)
    it.g.position.set(m.x+Math.sin(ry)*1.2*sc,hAt(m.x,m.z)+Math.min(h*.5,1.0+1.1*sc),m.z+Math.cos(ry)*1.2*sc);
    it.m.rotation.set(0,0,Math.PI+flip*(big?.55:.7));
    it.g.quaternion.copy(camera.quaternion);
    it.g.scale.setScalar((big?1.35:1)*sc*.85);
    it.d=big?.34:.26; it.t=0; it.on=true; it.g.visible=true; }
  function tick(){ const now=performance.now(); const dt=Math.min(.1,(now-last)/1000); last=now;
    for(const it of pool){ if(!it.on) continue; it.t+=dt; const k=it.t/it.d; const u=it.mat.uniforms;
      it.g.quaternion.copy(camera.quaternion); u.prog.value=Math.min(1,k*1.25); u.fade.value=k<.55?1:Math.max(0,1-(k-.55)/.45);
      if(k>=1){ it.on=false; it.g.visible=false; } } }
  // WARN.tick(m,inRange,dt) 는 tickMobs 에서 괴물마다 불림 → 방금 휘두른 괴물(lunge 막 걸림)을 찾아 반달 하나
  const oT=WARN.tick, oE=WARN.end;
  WARN.tick=function(m,inRange,dt){ const r=oT.apply(this,arguments);
    try{ const ud=m.mesh&&m.mesh.userData; if(ud){ if(ud.lunge>.12&&!ud._arc&&m.hp>0){ ud._arc=true; swing(m); } else if(!(ud.lunge>.12)) ud._arc=false; } }catch(e){}
    return r; };
  WARN.end=function(){ const r=oE.apply(this,arguments); try{ tick(); }catch(e){} return r; };
  return {swing,tick,pool};  // pool 은 확인용
})();
</script>
