<script>
/* ================= 타격 손맛 (v34) =================
   - 맞은 괴물: 맞은 반대쪽으로 휙 밀렸다 돌아옴 + 뒤로 젖혀짐 + 살짝 들썩 (모습만 — 실제 자리·규칙은 그대로)
   - 짧은 멈춤(히트스톱): 맞는 순간 0.05초(치명타 0.09초) 동작이 딱 멈춤 → "콱" 박히는 느낌
   - 쓰러짐: 죽으면 바로 사라지지 않고 뒤로 털썩 넘어짐(3D 모델은 쓰러지는 동작) → 잠깐 누워 있다 땅속으로 스르르 + 흙먼지
   PointLight 없음, 새 그리기 없음(괴물 몸 그대로 씀). 쓰러진 몸은 최대 8개(배터리 절약 4개). */

/* v61: 사라질 때 빛 조각으로 흩어짐 — 반짝이는 마름모 조각 하나의 Points(그리기 1번)로 최대 120개 돌려씀 */
const SHARD=(()=>{ const N=120; let pts=null, pos, col, al, sz, P_=[]; let head=0;
  function init(){ const g=new THREE.BufferGeometry(); pos=new Float32Array(N*3); col=new Float32Array(N*3); al=new Float32Array(N); sz=new Float32Array(N);
    g.setAttribute("position",new THREE.BufferAttribute(pos,3)); g.setAttribute("color",new THREE.BufferAttribute(col,3)); g.setAttribute("a",new THREE.BufferAttribute(al,1)); g.setAttribute("s",new THREE.BufferAttribute(sz,1));
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uH:{value:800}},
      vertexShader:"attribute vec3 color; attribute float a; attribute float s; uniform float uH; varying vec3 vC; varying float vA; void main(){ vC=color; vA=a; vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=a>0.001? s*projectionMatrix[1][1]*uH*.5/max(.5,-mv.z) : 0.; }",
      fragmentShader:"varying vec3 vC; varying float vA; void main(){ vec2 q=gl_PointCoord-.5; float d=abs(q.x)*1.6+abs(q.y); if(d>.5) discard; float core=smoothstep(.2,0.,d); vec3 c=mix(vC*.72,vec3(1.),core*.9); float edge=smoothstep(.5,.42,d); gl_FragColor=vec4(c,vA*edge); }"});
    pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.renderOrder=6; scene.add(pts); for(let i=0;i<N;i++) P_.push({t:1,d:1}); }
  const C1=new THREE.Color();
  function burst(x,y,z,n,r,hex,up){ if(!pts) init(); if(pts.parent!==scene) scene.add(pts); for(let k=0;k<n;k++){ const i=head; head=(head+1)%N; const p=P_[i]; const a=Math.random()*6.283, rr=r*Math.sqrt(Math.random());
      p.x=x+Math.cos(a)*rr*.5; p.y=y+Math.random()*r*.9; p.z=z+Math.sin(a)*rr*.5; const sp=1.2+Math.random()*1.8; p.vx=Math.cos(a)*sp; p.vz=Math.sin(a)*sp; p.vy=(up||2.2)*(.6+Math.random()*.8); p.sp=(Math.random()<.5?-1:1)*(1.5+Math.random()*2);
      p.t=0; p.d=.85+Math.random()*.6; p.s=(.55+Math.random()*.5)*Math.max(.8,Math.min(2.2,r*.6)); C1.set(Math.random()<.3?0xfff0b0:hex); col[i*3]=C1.r; col[i*3+1]=C1.g; col[i*3+2]=C1.b; }
    pts.geometry.attributes.color.needsUpdate=true; }
  function tick(dt){ if(!pts) return; let any=false; try{ pts.material.uniforms.uH.value=renderer.domElement.height; }catch(e){}
    for(let i=0;i<N;i++){ const p=P_[i]; if(p.t>=p.d){ al[i]=0; continue; } any=true; p.t+=dt; const k=Math.min(1,p.t/p.d);
      const dr=Math.exp(-dt*2.6); p.vx*=dr; p.vz*=dr; p.vy=p.vy*Math.exp(-dt*.8)+dt*.9; const c=Math.cos(p.sp*dt), s=Math.sin(p.sp*dt), vx=p.vx*c-p.vz*s; p.vz=p.vx*s+p.vz*c; p.vx=vx;
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z;
      al[i]=(k<.12?k/.12:1-Math.pow((k-.12)/.88,1.6))*(.75+.25*Math.sin(p.t*24+i)); sz[i]=p.s*(1-k*.55); }
    const g=pts.geometry; g.attributes.position.needsUpdate=true; g.attributes.a.needsUpdate=true; g.attributes.s.needsUpdate=true; pts.visible=any; }
  return {burst,tick};
})();
const HITF=(()=>{ const C=[]; const ease=k=>1-Math.pow(1-k,3);
  function knock(m,dmg,crit){ if(!m||!m.mesh||m.titan) return; const dx=m.x-P.x, dz=m.z-P.z, d=Math.hypot(dx,dz)||1;
    let s=clamp(.45+(dmg/(m.mhp||1))*2.2,.45,1.25)*(crit?1.3:1); if(m.boss) s*=.35; s/=Math.max(1,(m.scale||1)*.75);
    m.kb={x:dx/d,z:dz/d,s,t:0}; m.hs=crit?.09:.05; let A=clamp(.2+(dmg/(m.mhp||1))*.6,.2,.36)*(crit?1.3:1); if(m.boss) A*=.5; m.sq={t:0,a:A,c:crit?0xffe7a0:0xffffff}; m.mesh.rotation.order="YXZ"; m.mesh.userData.hsU=performance.now()+m.hs*1000; }
  // tickMobs 에서 위치를 정한 다음 부름
  /* v109: 맞으면 몸이 하얗게 확 부풀었다(옆으로 퍼지고 납작) 용수철처럼 쭉 늘었다 돌아옴 — 모습만 */
  function squash(m,dt){ const q=m.sq; if(!q||!m.mesh) return; if(!(m.hs>0)) q.t+=dt; const T=.42; if(q.t>=T){ m.sq=null; return; }
    const t=q.t, e=Math.exp(-t*9)*Math.cos(t*24)*q.a*(1-t/T); const g=m.mesh.scale; const y=1-e*.75, xz=1+e*.6;
    g.set(g.x*xz,g.y*y,g.z*xz); const f=t<.06?1:Math.max(0,1-(t-.06)/.2); try{ hitTint(m.mesh,f*.95,q.c); }catch(err){} }
  function apply(m,dt){ squash(m,dt); const k=m.kb; if(!k) return; if(m.hs>0) m.hs-=dt; else k.t+=dt; const D=.34; if(k.t>=D){ m.kb=null; return; }
    const u=k.t/D; const off=k.s*(u<.18?ease(u/.18):Math.pow(1-(u-.18)/.82,2)); const p=m.mesh.position;
    p.x+=k.x*off; p.z+=k.z*off; p.y+=off*.22; if(!m.mesh.userData.float) m.mesh.rotation.x+=-off*.38; }
  function die(m){ if(!m||!m.mesh||m.titan||m.corpse) return false; const lim=ECO()?4:8; while(C.length>=lim) end(C[0]);
    const g=m.mesh; const dx=m.x-P.x, dz=m.z-P.z, d=Math.hypot(dx,dz)||1; g.rotation.order="YXZ"; g.userData.hsU=0;
    const c={g,t:0,x:g.position.x,y:g.position.y,z:g.position.z,dx:dx/d,dz:dz/d,sc:g.scale.x,gl:!!g.userData.gl,fl:!!g.userData.float,dust:false,rx:g.rotation.x,boss:!!m.boss,hex:m.boss?0xc69bff:(m.elite?0xff7a2a:0xffb020),h:(m.boss?2.6:1.6)*(m.scale||1)};
    try{ hitTint(g,0); }catch(e){} if(c.gl) animState(g,"dead"); m.corpse=true; C.push(c); return true; }
  function end(c){ scene.remove(c.g); const i=C.indexOf(c); if(i>=0) C.splice(i,1); }
  function tick(dt){ for(let i=C.length-1;i>=0;i--){ const c=C[i], g=c.g; c.t+=dt; const t=c.t;
      if(c.gl){ // 3D 모델: 쓰러지는 동작 + 맞은 쪽으로 조금 밀림
        const s=ease(Math.min(1,t/.4)); g.position.set(c.x+c.dx*s*.7,c.y,c.z+c.dz*s*.7); }
      else if(c.fl){ // 떠다니는 괴물: 빙글 돌며 떨어짐
        const s=Math.min(1,t/.5); g.rotation.y+=dt*9*(1-s); g.rotation.x=c.rx-ease(s)*1.2; g.position.set(c.x+c.dx*s*.8,Math.max(hAt(c.x,c.z),c.y-ease(s)*1.4)+Math.sin(s*Math.PI)*.5,c.z+c.dz*s*.8); }
      else { // 뒤로 털썩 + 한 번 통 튐
        const s=Math.min(1,t/.38); const fall=ease(s); const bounce=t>.38&&t<.58?Math.sin((t-.38)/.2*Math.PI)*.09:0;
        g.rotation.x=c.rx-(fall+bounce)*Math.PI*.5; g.position.set(c.x+c.dx*fall*.8,c.y+Math.sin(s*Math.PI)*.35*c.sc,c.z+c.dz*fall*.8); }
      const S0=c.gl?1.25:.95, S1=S0+.65;
      if(t>S0){ const lo=ECO()||!HIGH(); if(!c.dust){ c.dust=true; try{ SFX.dust(g.position.x,g.position.z,lo?2:4,1.3*c.sc); }catch(e){}
          try{ SHARD.burst(g.position.x,g.position.y+.2,g.position.z,(c.boss?26:14)>>(ECO()?1:0),c.h*.8,c.hex,c.boss?3:2.2); tone(1320,.09,"sine",0,.04); tone(1760,.12,"sine",.06,.03); }catch(e){} }
        const k=Math.min(1,(t-S0)/(S1-S0)); try{ hitTint(g,Math.min(1,k*1.8),0xfff6d8); }catch(e){} // 몸이 하얗게 빛나며
        if(!c.e2&&k>.45){ c.e2=true; try{ SHARD.burst(g.position.x,g.position.y+.1,g.position.z,(c.boss?16:8)>>(ECO()?1:0),c.h*.6,c.hex,3.2); }catch(e){} }
        g.position.y=c.y-k*k*.5*c.sc+k*.25; const sq=1-k*k; g.scale.set(c.sc*(sq*.9+.1)*(1+k*.15),c.sc*(sq*1.0+.02)*(1+k*.35*(1-k)),c.sc*(sq*.9+.1)*(1+k*.15)); }
      if(t>=S1) end(c); } SHARD.tick(dt); }
  function clear(){ while(C.length) end(C[0]); }
  return {knock,apply,die,tick,clear,C};
})();
</script>
