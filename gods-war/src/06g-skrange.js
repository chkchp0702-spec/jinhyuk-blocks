<script>
/* ================= v164: 기술 버튼을 꾹 누르고 있으면 바닥에 기술 범위가 보임 =================
   기술은 누르는 순간 그대로 나감(sklPress 그대로). 버튼을 0.28초 넘게 누르고 있으면(쿨타임 중에도) 내 발밑에
   그 기술이 닿는 모양이 기술 색으로 그려짐 — 둘레 기술(원), 앞으로 쏘는 기술(긴 띠 + 앞으로 흐르는 화살 무늬),
   부채꼴로 던지는 기술(부채꼴), 앞에 떨어지는 기술·도약(앞쪽 착지 원 + 화살표). 쿨타임 중이면 둘레 빛이
   시계방향으로 차오르며 남은 시간을 보여주고, 다 차면 하얗게 반짝. 손 떼면 스르르 사라짐.
   그리기: 바닥 판 1장(셰이더) — 누르고 있을 때만. PointLight 없음. 모습만(기술 규칙·쿨타임 그대로).
   v165: 범위가 보이는 동안 그 안에 들어온 괴물 발밑에 작은 표적(네 귀퉁이 꺾쇠 + 도는 고리)이 톡 튀어나옴 —
   들어오면 커졌다 자리잡고, 나가면 스르르. 공격 기술만(치유·보호막·함께·소환·분노는 표적 없음).
   그리기: 표적 묶음(InstancedMesh, 최대 10개) 1번 더 — 누르고 있을 때만. */
const SKRANGE=(()=>{ let mesh=null, on=-1, hold=-1, holdT=0, a=0, t=0, ready=0, cur=null;
  const U={t:{value:0},a:{value:0},col:{value:new THREE.Color()},E:{value:10},mode:{value:0},R:{value:5},C:{value:new THREE.Vector2()},L:{value:0},W:{value:0},A:{value:0},cd:{value:1},flash:{value:0}};
  function build(){ const g=new THREE.PlaneGeometry(1,1); g.rotateX(-Math.PI/2);
    const m=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,
      vertexShader:`varying vec2 vP; uniform float E; void main(){ vP=vec2(position.x,-position.z)*2.*E; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader:`uniform float t,a,E,mode,R,L,W,A,cd,flash; uniform vec3 col; uniform vec2 C; varying vec2 vP;
        float ring(float d,float r,float w){ return smoothstep(w,0.,abs(d-r)); }
        void main(){ vec2 p=vP; float fill=0., edge=0., deco=0., sh=0.; float ang=atan(p.x,p.y); /* 0=앞, 시계방향 + */
          float sweep=fract(ang/6.2832+1.); float done=step(sweep,cd);
          if(mode<.5){ /* 둘레 원 */ float d=length(p); fill=step(d,R)*(.16+.14*smoothstep(R*.35,R,d)); edge=ring(d,R,.42)*(.45+.55*done); sh=smoothstep(.7,0.,d-R-.3)*step(R+.2,d);
            float tk=step(.8,fract(sweep*36.-t*.6))*ring(d,R-.45,.18); deco=tk*.55;
            deco+=ring(d,mod(t*R*.9,R),.25)*.25*step(d,R); }
          else if(mode<1.5){ /* 앞으로 긴 띠 */ float inb=step(abs(p.x),W*.5)*step(0.,p.y)*step(p.y,L);
            fill=inb*.2; sh=smoothstep(.45,0.,abs(p.x)-W*.5-.15)*step(W*.5+.1,abs(p.x))*step(0.,p.y)*step(p.y,L); float e=max(smoothstep(.32,0.,abs(abs(p.x)-W*.5))*step(0.,p.y)*step(p.y,L), smoothstep(.32,0.,abs(p.y-L))*step(abs(p.x),W*.5));
            edge=e*(.35+.65*step(p.y/L,cd)); float ch=fract((p.y-abs(p.x)*.8)/2.2-t*1.6); deco=inb*smoothstep(.0,.08,ch)*smoothstep(.3,.18,ch)*.8*smoothstep(L,L-2.,p.y); }
          else if(mode<2.5){ /* 부채꼴 */ float d=length(p); float inb=step(abs(ang),A)*step(d,L); fill=inb*(.14+.14*smoothstep(0.,L,d)); sh=smoothstep(.5,0.,d-L-.2)*step(L+.12,d)*step(abs(ang),A);
            float e=max(ring(d,L,.36)*step(abs(ang),A), smoothstep(.32,0.,abs(abs(ang)-A)*d)*step(d,L)); edge=e*(.35+.65*step(d/L,cd));
            deco=inb*ring(d,mod(t*L*.8,L),.3)*.35; }
          else { /* 앞에 떨어지는 원 + 화살표 길 */ float d=length(p-C); fill=step(d,R)*(.18+.14*smoothstep(R*.3,R,d)); sh=smoothstep(.5,0.,d-R-.2)*step(R+.12,d); float sw=fract(atan(p.x-C.x,p.y-C.y)/6.2832+1.);
            edge=ring(d,R,.4)*(.45+.55*step(sw,cd)); deco=ring(d,R*(.4+.2*sin(t*5.)),.18)*.5;
            float lp=step(abs(p.x),.55)*step(.6,p.y)*step(p.y,C.y-R); float ch=fract(p.y/1.6-abs(p.x)*.5-t*1.8); deco+=lp*smoothstep(.0,.1,ch)*smoothstep(.35,.2,ch)*.7; }
          fill*=1.9; float lit=fill+edge+deco; float o=(lit+sh*.6)*a*smoothstep(E,E-1.5,max(abs(p.x),abs(p.y)));
          vec3 deep=col*col*.55; vec3 c=mix(deep,col,clamp(edge+deco,0.,1.)); c=mix(c,vec3(1.),edge*.25+flash*.6); c=mix(c,vec3(.05,.03,.1),sh*(1.-min(1.,lit))); if(o<.01) discard; gl_FragColor=vec4(c,min(1.,o)); }`});
    mesh=new THREE.Mesh(g,m); mesh.renderOrder=2; mesh.frustumCulled=false; mesh.userData.noOutline=true; mesh.userData.noLod=true; mesh.userData.cullR=-1; mesh.visible=false; scene.add(mesh); }
  let tg=null; const TGN=10, TU={t:{value:0},a:{value:0},col:U.col}, pops=new Map(), _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _v=new THREE.Vector3(), _s=new THREE.Vector3(), _up=new THREE.Vector3(0,1,0);
  function buildTg(){ const g=new THREE.PlaneGeometry(1,1); g.rotateX(-Math.PI/2);
    const m=new THREE.ShaderMaterial({uniforms:TU,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,
      vertexShader:`varying vec2 vP; void main(){ vP=vec2(position.x,-position.z)*2.; gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.); }`,
      fragmentShader:`uniform float t,a; uniform vec3 col; varying vec2 vP;
        void main(){ vec2 p=vP; float d=length(p); float c=cos(t*1.6), s=sin(t*1.6); vec2 q=vec2(c*p.x-s*p.y,s*p.x+c*p.y);
          vec2 aq=abs(q); float box=max(aq.x,aq.y); float mn=min(aq.x,aq.y);
          float br=smoothstep(.1,.04,abs(box-.8))*step(.4,mn); /* 네 귀퉁이 꺾쇠(굵게) */
          float brO=smoothstep(.17,.1,abs(box-.8))*step(.34,mn)*(1.-br); /* 꺾쇠 검은 테 */
          float rg=smoothstep(.08,.03,abs(d-.52))*step(.35,fract(atan(p.y,p.x)/6.2832*6.-t*.8)); /* 끊긴 고리 */
          float rgO=smoothstep(.14,.08,abs(d-.52))*(1.-rg);
          float fl=smoothstep(.55,.2,d)*.28; /* 안쪽 은은한 채움 */
          vec3 gold=vec3(1.,.82,.3); vec3 cc=vec3(0.); float o=0.;
          cc=mix(cc,col*col,fl); o=max(o,fl);
          cc=mix(cc,vec3(.08,.03,.06),max(brO,rgO)); o=max(o,max(brO,rgO)*.75);
          cc=mix(cc,mix(col,vec3(1.),.35),rg); o=max(o,rg);
          cc=mix(cc,mix(gold,vec3(1.),.25+.25*sin(t*8.)),br); o=max(o,br);
          o*=a; if(o<.02) discard; gl_FragColor=vec4(cc,min(1.,o)); }`});
    tg=new THREE.InstancedMesh(g,m,TGN); tg.count=0; tg.renderOrder=3; tg.frustumCulled=false; tg.userData.noOutline=true; tg.userData.noLod=true; tg.userData.cullR=-1; tg.visible=false; scene.add(tg); }
  const NOTG={heal:1,shield:1,team:1,summon:1,rage:1};
  function inside(m,rot){ const dx=m.x-P.x, dz=m.z-P.z; const f=dx*Math.sin(rot)+dz*Math.cos(rot), sd=dx*Math.cos(rot)-dz*Math.sin(rot); const mr=.45*(m.scale||1), md=U.mode.value;
    if(md<.5) return Math.hypot(dx,dz)<U.R.value+mr;
    if(md<1.5) return Math.abs(sd)<U.W.value*.5+mr&&f>-mr&&f<U.L.value+mr;
    if(md<2.5){ const d=Math.hypot(dx,dz); return d<U.L.value+mr&&Math.abs(Math.atan2(sd,f))<U.A.value+mr/Math.max(1,d); }
    return Math.hypot(sd-U.C.value.x,f-U.C.value.y)<U.R.value+mr; }
  function tickTg(dt,rot,show){ if(!show||!cur||NOTG[cur.S.type]){ pops.forEach((v,k)=>{ v.w-=dt*6; if(v.w<=0) pops.delete(k); }); if(tg){ if(!pops.size) tg.visible=false; } if(!pops.size) return; }
    if(!tg) buildTg(); TU.t.value=t; TU.a.value=a;
    const inn=new Set(); if(show&&cur&&!NOTG[cur.S.type]){ for(const m of mobs){ if(m.hp<=0||m.dead||(m.mesh&&!m.mesh.visible)) continue; if(Math.abs(m.x-P.x)>30||Math.abs(m.z-P.z)>30) continue; if(inside(m,rot)){ inn.add(m); if(!pops.has(m)){ pops.set(m,{w:0,age:0}); if(pops.size<=TGN) try{ tone(880+pops.size*90,.04,"triangle",0,.025); }catch(e){} } } } }
    let n=0; pops.forEach((v,m)=>{ if(inn.has(m)) v.w=Math.min(1,v.w+dt*7); else v.w-=dt*5; v.age+=dt; if(v.w<=0||m.hp<=0){ pops.delete(m); return; } if(n>=TGN) return;
      const pop=v.age<.35?1+.5*Math.sin(v.age/.35*Math.PI):1; const sc=(2.2+1.4*(m.scale||1)*(m.boss?1.5:1))*v.w*pop*(1+.05*Math.sin(t*6));
      const y=(m.mesh?m.mesh.position.y:hAt(m.x,m.z))+.16; _v.set(m.x,y,m.z); _q.setFromAxisAngle(_up,0); _s.set(sc,1,sc); _m.compose(_v,_q,_s); tg.setMatrixAt(n++,_m); });
    tg.count=n; tg.instanceMatrix.needsUpdate=true; tg.visible=n>0; }
  function skillOf(i){ try{ const si=skSlot(i); return {si,S:RM().skills[si]}; }catch(e){ return null; } }
  function shape(S){ const ty=S.type; U.C.value.set(0,0); U.L.value=0; U.W.value=0; U.A.value=0;
    if(ty==="line"){ U.mode.value=1; U.L.value=S.r||10; U.W.value=S.w||2.6; return U.L.value+1.5; }
    if(ty==="multi"){ U.mode.value=2; U.L.value=S.r||16; U.A.value=Math.min(1.3,(S.spread||.2)*((S.cnt||3)-1)*.5+.14); return U.L.value+1.5; }
    if(ty==="meteor"||ty==="dash"){ U.mode.value=3; const ds=S.dist||10, r=S.r||5; U.C.value.set(0,ds); U.R.value=r; return ds+r+1.5; }
    U.mode.value=0; const r=S.r||(ty==="orbit"?2.6:ty==="rage"?7:ty==="heal"?6:ty==="shield"?2.4:ty==="summon"?4:5); U.R.value=r; return r+1.5; }
  function down(i){ hold=i; holdT=0; }
  function up(i){ if(hold===i) hold=-1; }
  [0,1,2,3,4,5].forEach(i=>{ const b=$("bSkill"+i); if(!b) return; b.addEventListener("pointerdown",()=>down(i)); ["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,()=>up(i))); });
  function tick(dt){ if(typeof P==="undefined") return; t+=dt;
    if(hold>=0) holdT+=dt; const want=hold>=0&&holdT>.28&&!P.dead&&!layerOpen;
    if(want&&on!==hold){ const k=skillOf(hold); if(k&&k.S){ if(!mesh) build(); on=hold; cur=k; const E=shape(k.S); U.E.value=E; mesh.scale.set(E*2,1,E*2); U.col.value.setHex(k.S.color||0xffe08a); ready=P.sklCd[k.si]<=0?1:0; } }
    a+=((want?1:0)-a)*Math.min(1,dt*(want?14:7)); if(!mesh) return; if(a<.02){ mesh.visible=false; if(!want) on=-1; tickTg(dt,P.rot,false); return; }
    if(cur){ const S=cur.S, left=P.sklCd[cur.si]||0, c=S.cd?clamp(1-left/S.cd,0,1):1; U.cd.value=c; const r=left<=0?1:0; if(r&&!ready){ U.flash.value=1; try{ tone(1320,.08,"sine",0,.04); }catch(e){} } ready=r; }
    U.flash.value=Math.max(0,U.flash.value-dt*2.5); U.t.value=t; U.a.value=a*(ready?1:.75);
    let rot=P.rot; if(cur&&cur.S.type==="meteor"){ /* 가장 센 괴물 쪽으로 떨어짐 — 보이는 원도 그쪽 */ try{ const tg=mobs.filter(m=>m.hp>0&&Math.hypot(m.x-P.x,m.z-P.z)<16).sort((x,y)=>y.mhp-x.mhp)[0]; if(tg){ const d=Math.hypot(tg.x-P.x,tg.z-P.z); rot=Math.atan2(tg.x-P.x,tg.z-P.z); U.C.value.set(0,d); } else U.C.value.set(0,cur.S.dist||10); }catch(e){} }
    const gy=(P.gy!=null?P.gy:hAt(P.x,P.z)); mesh.position.set(P.x,gy+.12,P.z); mesh.rotation.y=rot+Math.PI; mesh.visible=true; tickTg(dt,rot,want); }
  XTICK.push(tick);
  return {tick,down,up,get mesh(){ return mesh; },get U(){ return U; },get tg(){ return tg; }};
})();
</script>
