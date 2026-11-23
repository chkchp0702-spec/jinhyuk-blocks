<script>
/* ================= v166: 올림푸스 밤하늘 별자리 =================
   올림푸스(그리스 신들의 땅) 들판에서 맑은 밤이면, 하늘 위쪽에 별 몇 개가 하나씩 반짝 켜지고
   별과 별 사이에 빛줄기가 차례로 그어져 별자리(국자·카시오페이아·백조·오리온)가 완성됨 —
   다 그어지면 "띠링" 작은 소리, 잠깐 빛나다 스르르 사라지고 몇 초 뒤 다른 별자리. 별자리 이름은 그 아래 작은 글씨.
   그리기: 하늘 판 1장(셰이더, 보일 때만) + 이름 글씨 1개. PointLight 없음. 비·눈·폭풍·미궁·집 안·한낮엔 안 나옴. */
const CONSTEL=(function(){
  const SH=[ /* 별 위치(-1~1), 이어 그을 줄(별 번호 쌍) */
    {n:"큰곰자리 국자",s:[[-1,.22],[-.62,.28],[-.27,.16],[.04,0],[.14,-.46],[.66,-.52],[.72,-.06]],l:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]]},
    {n:"카시오페이아자리",s:[[-1,.32],[-.5,-.3],[0,.12],[.5,-.36],[1,.34]],l:[[0,1],[1,2],[2,3],[3,4]]},
    {n:"백조자리",s:[[0,.95],[0,.32],[0,-.3],[0,-.95],[-.78,.5],[.8,.44]],l:[[0,1],[1,2],[2,3],[4,1],[1,5]]},
    {n:"오리온자리",s:[[-.52,.82],[.56,.72],[-.16,.02],[0,.06],[.16,.1],[-.5,-.86],[.52,-.8]],l:[[0,2],[2,3],[3,4],[4,1],[2,5],[4,6]]}];
  const NS=8, NL=8;
  const U={a:{value:0},t:{value:0},pr:{value:0},ns:{value:0},nl:{value:0},S:{value:Array.from({length:NS},()=>new THREE.Vector2())},L:{value:Array.from({length:NL},()=>new THREE.Vector4())}};
  let mesh=null, lbl=null, st=null, next=rnd(3,6), k=0, si=Math.floor(Math.random()*SH.length), ding=false;
  const off=new THREE.Vector3(), _p=new THREE.Vector3();
  function build(){ const g=new THREE.PlaneGeometry(2,2);
    const m=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,fog:false,
      vertexShader:`varying vec2 vP; void main(){ vP=position.xy*1.25; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader:`uniform float a,t,pr,ns,nl; uniform vec2 S[${NS}]; uniform vec4 L[${NL}]; varying vec2 vP;
        void main(){ vec2 p=vP; float c=0., ln=0., hd=0.;
          for(int i=0;i<${NS};i++){ if(float(i)>=ns) break; float on=clamp(pr*(ns+2.)-float(i),0.,1.); float d=length(p-S[i]);
            float tw=.75+.25*sin(t*3.1+float(i)*2.3); float cr=smoothstep(.055,0.,d)*1.3+exp(-d*d*160.)*.8;
            vec2 q=abs(p-S[i]); float sp=smoothstep(.014,0.,min(q.x,q.y))*smoothstep(.22,0.,max(q.x,q.y))*.9; /* 십자 반짝 */
            c+=(cr+sp*tw)*on*(1.+.8*(1.-on)); }
          float lp=clamp(pr*1.35-.25,0.,1.)*nl;
          for(int i=0;i<${NL};i++){ if(float(i)>=nl) break; float f=clamp(lp-float(i),0.,1.); if(f<=0.) break; vec2 A=L[i].xy, B=L[i].zw; vec2 ba=B-A; float h=clamp(dot(p-A,ba)/dot(ba,ba),0.,f);
            float d=length(p-A-ba*h); ln+=(smoothstep(.02,.004,d)*1.1+exp(-d*d*700.)*.45); if(f<1.){ float dh=length(p-A-ba*f); hd+=exp(-dh*dh*500.); } }
          vec3 col=vec3(.75,.88,1.)*c+vec3(.55,.75,1.)*ln*.75+vec3(1.,.85,.45)*hd*1.4;
          float k=a*clamp(c+ln*.75+hd,0.,1.6); gl_FragColor=vec4(col*a,k); }`});
    mesh=new THREE.Mesh(g,m); mesh.frustumCulled=false; mesh.renderOrder=8; mesh.userData.noOutline=true; mesh.userData.noLod=true; mesh.userData.cullR=-1; mesh.visible=false; scene.add(mesh);
    lbl=document.createElement("div"); lbl.className="cstlbl"; lbl.style.cssText="position:fixed;left:0;top:0;pointer-events:none;z-index:4;font:800 13px/1 system-ui,sans-serif;color:#dfeeff;letter-spacing:2px;text-shadow:0 0 6px #6fb4ff,0 1px 2px #000;opacity:0;transform:translate(-50%,0);white-space:nowrap;display:none"; document.body.appendChild(lbl); }
  function launch(){ if(!mesh) build(); const sh=SH[si%SH.length]; si++;
    U.ns.value=sh.s.length; sh.s.forEach((v,i)=>U.S.value[i].set(v[0],v[1])); U.nl.value=sh.l.length; sh.l.forEach((e,i)=>{ const A=sh.s[e[0]], B=sh.s[e[1]]; U.L.value[i].set(A[0],A[1],B[0],B[1]); });
    _p.set(rnd(-.5,.5),rnd(.6,.78),.5).unproject(camera).sub(camera.position).normalize(); off.copy(_p).multiplyScalar(140);
    mesh.quaternion.copy(camera.quaternion); mesh.rotateZ(rnd(-.35,.35)); const sc=rnd(19,23); mesh.scale.set(sc,sc,1);
    st={t:0,dur:9}; ding=false; lbl.textContent="✦ "+sh.n+" ✦"; }
  function tick(dt,realmIdx,center,hidden){ U.t.value+=dt;
    const night=1-(DAY.d==null?1:DAY.d); const nf=clamp((night-.3)/.3,0,1); const w=WEATHER.type, bad=w==="rain"||w==="storm"||w==="blizzard"||w==="snow";
    const ok=!hidden&&!bad&&!center&&realmIdx===3&&!P.dead; k+=((ok?nf:0)-k)*Math.min(1,dt*.8);
    if(!st){ if(k>.6){ next-=dt; if(next<=0){ launch(); next=rnd(5,10); } } if(mesh&&mesh.visible){ mesh.visible=false; lbl.style.display="none"; } return; }
    st.t+=dt; const T=st.t, D=st.dur; U.pr.value=clamp(T/4.2,0,1); const fade=Math.min(1,T/.6)*clamp((D-T)/1.6,0,1);
    U.a.value=fade*k; mesh.position.copy(camera.position).add(off); mesh.visible=U.a.value>.01;
    if(U.pr.value>=1&&!ding){ ding=true; if(typeof soundOn!=="undefined"&&soundOn&&typeof tone==="function"){ tone(1319,.25,"sine",0,.02); tone(1760,.35,"sine",.1,.018); tone(2637,.45,"sine",.22,.012); } }
    /* 별자리 이름: 판 아래쪽 화면 자리에 */
    const nk=clamp((T-3.6)/.8,0,1)*fade*k; if(nk>.02){ _p.set(0,-1.35,0).applyMatrix4(mesh.matrixWorld).project(camera); const W=innerWidth, H=innerHeight;
      if(_p.z<1){ lbl.style.display="block"; lbl.style.left=((_p.x+1)*W/2).toFixed(0)+"px"; lbl.style.top=((1-_p.y)*H/2).toFixed(0)+"px"; lbl.style.opacity=nk.toFixed(2); } } else lbl.style.display="none";
    if(T>=D||k<.05){ st=null; mesh.visible=false; lbl.style.display="none"; } }
  if(typeof NIGHTFX!=="undefined"){ const _nt=NIGHTFX.tick; NIGHTFX.tick=function(dt,r,c,h){ _nt(dt,r,c,h); try{ tick(dt,r,c,h); }catch(e){} }; }
  return {tick,launch,get mesh(){ return mesh; },U};
})();
</script>
