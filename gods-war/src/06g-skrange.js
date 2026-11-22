<script>
/* ================= v164: 기술 버튼을 꾹 누르고 있으면 바닥에 기술 범위가 보임 =================
   기술은 누르는 순간 그대로 나감(sklPress 그대로). 버튼을 0.28초 넘게 누르고 있으면(쿨타임 중에도) 내 발밑에
   그 기술이 닿는 모양이 기술 색으로 그려짐 — 둘레 기술(원), 앞으로 쏘는 기술(긴 띠 + 앞으로 흐르는 화살 무늬),
   부채꼴로 던지는 기술(부채꼴), 앞에 떨어지는 기술·도약(앞쪽 착지 원 + 화살표). 쿨타임 중이면 둘레 빛이
   시계방향으로 차오르며 남은 시간을 보여주고, 다 차면 하얗게 반짝. 손 떼면 스르르 사라짐.
   그리기: 바닥 판 1장(셰이더) — 누르고 있을 때만. PointLight 없음. 모습만(기술 규칙·쿨타임 그대로). */
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
    a+=((want?1:0)-a)*Math.min(1,dt*(want?14:7)); if(!mesh) return; if(a<.02){ mesh.visible=false; if(!want) on=-1; return; }
    if(cur){ const S=cur.S, left=P.sklCd[cur.si]||0, c=S.cd?clamp(1-left/S.cd,0,1):1; U.cd.value=c; const r=left<=0?1:0; if(r&&!ready){ U.flash.value=1; try{ tone(1320,.08,"sine",0,.04); }catch(e){} } ready=r; }
    U.flash.value=Math.max(0,U.flash.value-dt*2.5); U.t.value=t; U.a.value=a*(ready?1:.75);
    let rot=P.rot; if(cur&&cur.S.type==="meteor"){ /* 가장 센 괴물 쪽으로 떨어짐 — 보이는 원도 그쪽 */ try{ const tg=mobs.filter(m=>m.hp>0&&Math.hypot(m.x-P.x,m.z-P.z)<16).sort((x,y)=>y.mhp-x.mhp)[0]; if(tg){ const d=Math.hypot(tg.x-P.x,tg.z-P.z); rot=Math.atan2(tg.x-P.x,tg.z-P.z); U.C.value.set(0,d); } else U.C.value.set(0,cur.S.dist||10); }catch(e){} }
    const gy=(P.gy!=null?P.gy:hAt(P.x,P.z)); mesh.position.set(P.x,gy+.12,P.z); mesh.rotation.y=rot+Math.PI; mesh.visible=true; }
  XTICK.push(tick);
  return {tick,down,up,get mesh(){ return mesh; },get U(){ return U; }};
})();
</script>
