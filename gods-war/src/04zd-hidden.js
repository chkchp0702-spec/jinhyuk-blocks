<script>
/* ================= v69-1: 🔎 숨은 아기 신상 찾기 — 지도 곳곳 반짝이 보물찾기 (IDEAS G11/6-1) =================
   네 세계마다 12개(두 사냥터 6개씩) + 함께 쓰는 땅 8개(세계의 중심 4 · 태양의 사막 2 · 뱀의 섬 2) = 56개.
   자리는 고정 씨앗으로 정해져서 모든 폰·모든 날 같은 곳. 신상마다 숨는 곳이 있음(덤불·바위 더미·속 빈 통나무·버섯·부러진 기둥·꽃밭).
   가까이 가면 "딸랑♪"이 점점 빨라지고, 닿으면 신상이 폴짝 뛰며 도감 칸이 채워짐 + 작은 선물. 4·12·56개 칭호, 12개면 신전 장식.
   🗿 지혜의 석상 앞에서 하루 한 번 힌트(안 찾은 신상 하나의 대강 자리로 길 안내).
   ✨ 이번 주의 황금 신상: 주마다 자리가 바뀜(주 번호 씨앗) — 모두가 같은 곳을 찾고, 먼저 찾은 10명이 명부에(보관 hid/<주>/<id>).
   찾은 신상 앞에서 「📣 여기 숨은 신상!」 → 근처 사람 화면에 빛기둥(t:"hidp"). */
const HD_N=56;
const HD_HIDE=[{n:"덤불 속",ic:"🌿"},{n:"바위 더미 사이",ic:"🪨"},{n:"속 빈 통나무 안",ic:"🪵"},{n:"큰 버섯 아래",ic:"🍄"},{n:"부러진 기둥 뒤",ic:"🏛"},{n:"꽃밭 속",ic:"🌼"}];
const HD={spots:[],built:false,t:0,ding:0,lbl:null,gold:null,gw:-1,beams:[],q:[],visT:0,near:null};
const HDO={};   // HDO[주][id]={i,n,r,ts}
function hdWeek(){ return Math.floor((kday()+3)/7); }
function hdData(){ G.hid=G.hid||{f:{},gw:{}}; G.hid.f=G.hid.f||{}; G.hid.gw=G.hid.gw||{}; return G.hid; }
function hdCount(){ return Object.keys(hdData().f).length; }
/* ---------- 자리 정하기 (고정 씨앗) ---------- */
function hdMakeSpots(){ const S=[]; const r0=dgRng(20261106); const far=(x,z)=>S.every(s=>Math.hypot(s.x-x,s.z-z)>14);
  const place=(area,n,lo,hi,zone,name)=>{ let k=0, tries=0; while(k<n&&tries<400){ tries++; const a=r0()*6.283, d=lo+r0()*(hi-lo); const x=area.x+Math.cos(a)*d, z=area.z+Math.sin(a)*d; if(Math.abs(x)>WORLD_HALF-14||Math.abs(z)>WORLD_HALF-14) continue; if(!far(x,z)) continue; S.push({x,z,zone,rg:name,cx:area.x,cz:area.z,h:S.length%6}); k++; } };
  for(let r=0;r<4;r++){ for(const j of [1,2]){ const rg=REGIONS[r*3+j]; place(rg,6,8,rg.r*.85,"w"+r,rg.n); } }
  place(REGIONS[12],4,20,52,"c",REGIONS[12].n);
  [[70,10],[-30,60]].forEach(([lx,lz])=>S.push({x:DSX+lx,z:DSZ+lz,zone:"d",rg:"태양의 사막",cx:DSX,cz:DSZ,h:S.length%6}));
  [[30,-20],[-26,28]].forEach(([lx,lz])=>S.push({x:LVX+lx,z:LVZ+lz,zone:"s",rg:"뱀의 섬",cx:LVX,cz:LVZ,h:S.length%6}));
  return S.slice(0,HD_N); }
/* ---------- 모델 ---------- */
function hdStatue(col,gold){ const g=new THREE.Group(); const st=gold?M.gold:mat({color:0xeee8da,roughness:.7}), ac=gold?mat({color:0xfff2a0,metalness:.6,roughness:.3,emissive:0x664400,emissiveIntensity:.5}):mat({color:col,roughness:.6});
  g.add(cyl(.42,.5,.28,st,0,.14,0,10)); const body=new THREE.Group(); body.position.y=.28; g.add(body);
  const b=sph(.34,st,0,.36,0); b.scale.set(1,1.05,.9); body.add(b); body.add(sph(.3,st,0,.92,.02));
  const eyeM=mat({color:0x222222}); [-1,1].forEach(s=>{ body.add(sph(.05,eyeM,s*.11,.96,.27)); const w=sph(.2,ac,s*.36,.5,-.12); w.scale.set(.45,1,.7); w.rotation.z=s*.6; body.add(w); });
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.2,.035,6,18),gold?glowMat(0xffe08a,.95):glowMat(col,.85)); halo.rotation.x=Math.PI/2; halo.position.y=1.3; halo.userData.noOutline=true; body.add(halo);
  g.userData={body,halo}; return g; }
function hdHide(h){ const g=new THREE.Group(); const leaf=mat({color:0x4f9a48,roughness:.85}), leaf2=mat({color:0x6cb85a,roughness:.85}), rock=mat({color:0x8d8a84,roughness:.95}), wood=mat({color:0x7a5236,roughness:.95}), marble=M.marble||mat({color:0xf4efe2});
  if(h===0){ [[.9,.5,.3,.8],[-.8,.45,.4,.75],[.1,.5,-.9,.8],[-.3,.35,.95,.55]].forEach(([x,y,z,s],i)=>{ const b=sph(s,i%2?leaf2:leaf,x,y,z); b.scale.y*=.85; g.add(b); }); }
  else if(h===1){ [[.85,.4,.2,.6],[-.8,.35,-.1,.55],[.1,.3,-.85,.5],[.3,.9,-.4,.4]].forEach(([x,y,z,s])=>{ const r=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),rock); r.position.set(x,y,z); r.rotation.set(x,z,y); g.add(r); }); }
  else if(h===2){ const lg=new THREE.Mesh(new THREE.CylinderGeometry(.75,.8,2.6,12,1,true),wood); lg.material.side=THREE.DoubleSide; lg.rotation.z=Math.PI/2; lg.position.set(0,.7,0); g.add(lg); const ring=new THREE.Mesh(new THREE.TorusGeometry(.75,.08,6,16),mat({color:0xc89a6a})); ring.rotation.y=Math.PI/2; ring.position.set(1.3,.7,0); g.add(ring); }
  else if(h===3){ [[.55,1.6,.2,.9,0xd94a3a],[-.6,1.2,-.3,.7,0xe8a040]].forEach(([x,y,z,s,c])=>{ g.add(cyl(.12,.16,y,mat({color:0xf3ead8}),x,y/2,z,8)); const cap=sph(s,mat({color:c,roughness:.6}),x,y,z); cap.scale.y*=.5; g.add(cap); [0,1,2].forEach(k=>g.add(sph(.1,mat({color:0xffffff}),x+Math.cos(k*2)*s*.5,y+s*.35,z+Math.sin(k*2)*s*.5))); }); }
  else if(h===4){ g.add(cyl(.45,.5,1.6,marble,.8,.8,0,10)); const tp=cyl(.45,.45,1.1,marble,-.6,.35,.5,10); tp.rotation.z=Math.PI/2; tp.rotation.y=.6; g.add(tp); g.add(box(1.1,.25,1.1,marble,.8,.12,0)); }
  else { for(let k=0;k<9;k++){ const a=k/9*6.283, d=.5+(k%3)*.25; g.add(cyl(.03,.03,.8,leaf,Math.cos(a)*d,.4,Math.sin(a)*d,4)); g.add(sph(.14,mat({color:[0xffe04a,0xff9ad0,0xffffff][k%3],roughness:.7}),Math.cos(a)*d,.82,Math.sin(a)*d)); } [[.8,0],[-.7,.4],[0,-.8]].forEach(([x,z])=>{ const gr=sph(.45,leaf2,x,.25,z); gr.scale.y*=1.4; g.add(gr); }); }
  return g; }
function hdZoneOk(s){ if(s.zone==="d") return typeof gtOpen==="function"?!!gtOpen():true; if(s.zone==="s") return typeof lvIsle==="function"?lvIsle():true; return true; }
function hdBuild(){ if(HD.built) return; HD.built=true; HD.spots=hdMakeSpots();
  HD.spots.forEach((s,i)=>{ const col=s.zone[0]==="w"?new THREE.Color(REALMS[+s.zone[1]].c1).getHex():0x9ad8ff; const g=new THREE.Group(); const hide=hdHide(s.h); g.add(hide); const st=hdStatue(col,false); st.scale.setScalar(.62); const off=s.h===2?[.6,.35,0]:s.h===4?[-.1,0,-.2]:[0,0,0]; st.position.set(off[0],off[1],off[2]); g.add(st);
    g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=(i*2.399)%6.283; g.visible=false; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); s.g=g; s.st=st; s.hop=0; }); }
setTimeout(()=>{ try{ hdBuild(); }catch(e){ console.warn(e); } },20);
/* ---------- 황금 신상 (이번 주) ---------- */
function hdGoldSpot(w){ if(!HD.spots.length) return null; const r=dgRng(w*7919+13); const L=HD.spots.map((s,i)=>i).filter(i=>HD.spots[i].zone[0]==="w"||HD.spots[i].zone==="c"); const i=L[Math.floor(r()*L.length)]; const s=HD.spots[i]; const a=r()*6.283; return {x:s.x+Math.cos(a)*3.2,z:s.z+Math.sin(a)*3.2,i,rg:s.rg,zone:s.zone}; }
function hdGoldSync(){ const w=hdWeek(); if(HD.gw===w&&HD.gold) return; HD.gw=w; if(HD.gold){ scene.remove(HD.gold.g); HD.gold=null; } const sp=hdGoldSpot(w); if(!sp) return; const g=hdStatue(0xffd24a,true); g.scale.setScalar(.75); g.position.set(sp.x,hAt(sp.x,sp.z),sp.z); g.visible=false; const gl=new THREE.Mesh(new THREE.RingGeometry(.7,1.1,24),glowMat(0xffd24a,.6)); gl.rotation.x=-Math.PI/2; gl.position.y=.06; gl.userData.noOutline=true; g.add(gl); scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); HD.gold={...sp,g,hop:0,w}; }
function hdGoldBoard(w){ const o=HDO[w]||{}; const L=Object.values(o); const me=hdData().gw[w]; if(me&&!o[G.id]) L.push({i:G.id,n:G.name,r:G.realm,ts:me}); return L.sort((a,b)=>a.ts-b.ts); }
NETX.push({sub:()=>"hid/"+hdWeek()+"/+",pre:"hid/",f:(d,topic)=>{ if(!d||!d.i||!d.ts) return; const w=+String(topic).split("/")[1]; if(!(w>=0)) return; (HDO[w]=HDO[w]||{})[d.i]=d; }});
/* ---------- 찾기 ---------- */
function hdFind(i){ const D=hdData(); if(D.f[i]) return; const s=HD.spots[i]; D.f[i]=Date.now(); const n=hdCount(); const gold=30+G.lv*6; G.gold+=gold; let extra=""; if(n%4===0){ G.ore=(G.ore||0)+3; extra=" · ⛓ 쇳조각 +3"; } if(n%12===0){ G.rune=(G.rune||0)+2; extra+=" · ✨ 룬 가루 +2"; } if(n===HD_N){ G.gold+=3000; extra+=" · 🎉 다 찾았다! 금화 +3,000"; }
  if(n>=12&&!D.deco){ D.deco=1; try{ hmAdd(HD_DECO,"숨은 신상 12개를 찾아서"); }catch(e){} }
  saveGame(); s.hop=1; fxRing(s.x,s.z,0xfff2a0,4,.6); fxSpark(s.x,1.2,s.z,0xfff2a0,26); jingle([1046,1318,1568,2093]); buzz(25);
  toast(`🔎 숨은 아기 신상을 찾았어요! (${n}/${HD_N})`,`${HD_HIDE[s.h].ic} ${s.rg} · ${HD_HIDE[s.h].n} · 금화 +${gold}${extra}`,2.8); if(G.hidHint&&G.hidHint.i===i){ G.hidHint=null; if(P.guide&&P.guide.hd) { P.guide=null; $("guide").hidden=true; } } }
function hdFindGold(){ const D=hdData(), H=HD.gold; if(!H||D.gw[H.w]) return; D.gw[H.w]=Date.now(); const rank=hdGoldBoard(H.w).filter(x=>x.ts<D.gw[H.w]).length+1; const L=G.lv; const gold=400+L*40; G.gold+=gold; G.rune=(G.rune||0)+3; G.hidGold=(G.hidGold||0)+1; saveGame();
  try{ net.pushRet("hid/"+H.w+"/"+G.id,{i:G.id,n:G.name,r:G.realm,ts:D.gw[H.w]}); }catch(e){}
  H.hop=1; fxRing(H.x,H.z,0xffd24a,8,.9); for(let k=0;k<3;k++) setTimeout(()=>fxSpark(H.x,1.5,H.z,0xffd24a,30),k*160); jingle([784,1046,1318,1568,2093]); buzz([30,30,60]);
  try{ lvBanner("이번 주의 황금 신상",`✨ ${rank<=10?rank+"번째로 찾았어요!":"찾았어요!"}`,`금화 +${fmt(gold)} · ✨ 룬 가루 +3${rank<=10?" · 명부에 이름이 올라가요":""}`,"#ffd24a"); }catch(e){ toast("✨ 황금 신상을 찾았어요!",`금화 +${gold}`,2.6); } }
/* ---------- 📣 여기 숨은 신상! ---------- */
function hdBeam(x,z,col){ const m=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,40,12,1,true),glowMat(col||0xfff2a0,.55)); m.position.set(x,hAt(x,z)+20,z); m.userData.noOutline=true; scene.add(m); HD.beams.push({m,t:20}); }
function hdShout(){ const n=HD.near; if(!n) return; const now=Date.now(); if(HD.shT&&now-HD.shT<8000){ toast("조금 있다가 다시 알려 줄 수 있어요"); return; } HD.shT=now; hdBeam(n.x,n.z); try{ net.send({t:"hidp",x:Math.round(n.x*10)/10,z:Math.round(n.z*10)/10,g:n.gold?1:0}); }catch(e){} tone(880,.08,"triangle"); tone(1175,.1,"triangle",.08); toast("📣 여기 숨은 신상! — 근처 사람에게 빛기둥을 보여 줬어요",null,1.8); }
NETR.hidp=(o,d)=>{ if(!(d.x>-1e4)||!(d.z>-1e4)) return; if(Math.hypot(d.x-P.x,d.z-P.z)>120) return; hdBeam(d.x,d.z,d.g?0xffd24a:0xfff2a0); toast(`📣 ${o.name}: 여기 숨은 ${d.g?"황금 ":""}신상!`,"빛기둥을 따라가 봐요",2.2); tone(1318,.08,"triangle"); };
/* ---------- 힌트 (지혜의 석상, 하루 한 번) ---------- */
function hdDir(dx,dz){ const a=Math.atan2(dx,-dz); const k=Math.round(a/(Math.PI/4)); return ["북","북동","동","남동","남","남서","서","북서"][(k+8)%8]+"쪽"; }
function hdOracleNear(){ try{ return OR.spots.some(o=>o&&Math.hypot(P.x-o.x,P.z-o.z)<9); }catch(e){ return false; } }
function hdHint(){ const D=hdData(); const today=kday(); if(G.hidHint&&G.hidHint.d===today){ hdGuide(G.hidHint); return; } if(D.hintD===today){ toast("오늘 힌트는 이미 들었어요","내일 또 물어봐요",1.8); return; }
  if(!hdOracleNear()){ const o=OR.spots[Math.max(0,G.realm)]; if(o) setGuide({x:o.x,z:o.z+4,label:"🗿 지혜의 석상"}); toast("🗿 힌트는 수도의 지혜의 석상이 알려 줘요","석상으로 길 안내할게요",2); closeLayer(); return; }
  const L=HD.spots.map((s,i)=>i).filter(i=>!D.f[i]&&hdZoneOk(HD.spots[i])); if(!L.length){ toast("찾을 수 있는 신상을 다 찾았어요!"); return; }
  const mine=L.filter(i=>HD.spots[i].zone==="w"+G.realm); const pool=mine.length?mine:L; const i=pool[Math.floor(Math.random()*pool.length)]; const s=HD.spots[i]; const a=Math.random()*6.283, d=rnd(3,7);
  G.hidHint={d:today,i,x:s.x+Math.cos(a)*d,z:s.z+Math.sin(a)*d}; D.hintD=today; saveGame(); closeLayer();
  card(`<h2>🗿 지혜의 석상의 힌트</h2><p style="font-size:17px">"<b>${s.rg}</b>의 ${hdDir(s.x-s.cx,s.z-s.cz)}, <b>${HD_HIDE[s.h].ic} ${HD_HIDE[s.h].n}</b>에 아기 신상이 숨어 있느니라…"</p><p style="font-size:13px">그 근처까지 길 안내해 줄게요. 가까이 가면 "딸랑♪" 소리가 빨라져요!</p><button class="go" id="hdGo" style="align-self:center">🔎 찾으러 가기</button>`);
  jingle([392,523,659,784]); $("hdGo").onclick=()=>{ closeLayer(); hdGuide(G.hidHint); }; }
function hdGuide(h){ if(!h) return; P.guide=null; setGuide({x:h.x,z:h.z,label:"🔎 힌트 자리 근처",hd:1}); if(P.guide) P.guide.hd=1; }
/* ---------- 매 프레임 ---------- */
function hdTick(dt){ if(!started||G.realm<0||!HD.built) return; const tn=performance.now(); hdGoldSync(); const D=hdData();
  for(let i=HD.beams.length-1;i>=0;i--){ const b=HD.beams[i]; b.t-=dt; b.m.material.opacity=Math.min(.55,b.t/3)*(.75+Math.sin(tn/160)*.25); if(b.t<=0){ scene.remove(b.m); HD.beams.splice(i,1); } }
  // 보이는 것만 (가까운 것)
  HD.visT-=dt; if(HD.visT<=0){ HD.visT=.8; HD.spots.forEach(s=>{ const v=Math.abs(s.x-P.x)<70&&Math.abs(s.z-P.z)<70; if(s.g.visible!==v){ s.g.visible=v; if(v) s.g.position.y=hAt(s.x,s.z); } }); if(HD.gold){ const v=Math.abs(HD.gold.x-P.x)<70&&Math.abs(HD.gold.z-P.z)<70; if(HD.gold.g.visible!==v){ HD.gold.g.visible=v; if(v) HD.gold.g.position.y=hAt(HD.gold.x,HD.gold.z); } } }
  // 움직임: 안 찾은 신상은 후광이 반짝, 찾은 신상은 가끔 기지개
  let best=null, bd=1e9;
  HD.spots.forEach((s,i)=>{ if(!s.g.visible) return; const u=s.st.userData; const f=!!D.f[i]; u.halo.material.opacity=f?.35:.55+Math.sin(tn/250+i)*.35; u.halo.rotation.z+=dt*(f?.5:2);
    if(s.hop>0){ s.hop=Math.max(0,s.hop-dt*1.1); const p=1-s.hop; u.body.position.y=.28+Math.sin(p*Math.PI)*1.1; u.body.rotation.y=p*Math.PI*2; } else { u.body.position.y=.28+(f?0:Math.abs(Math.sin(tn/700+i))*.04); u.body.rotation.y=f?Math.sin(tn/1800+i)*.4:0; }
    const d=Math.hypot(P.x-s.x,P.z-s.z); if(!f&&hdZoneOk(s)&&d<bd){ bd=d; best=i; } if(!f&&d<1.9&&!P.dead&&hdZoneOk(s)) hdFind(i); });
  const H=HD.gold; let gd=1e9; if(H&&H.g.visible){ const u=H.g.userData; u.halo.rotation.z+=dt*3; const got=!!D.gw[H.w]; if(H.hop>0){ H.hop=Math.max(0,H.hop-dt*1.1); const p=1-H.hop; u.body.position.y=.28+Math.sin(p*Math.PI)*1.4; u.body.rotation.y=p*Math.PI*4; } else u.body.position.y=.28+Math.abs(Math.sin(tn/400))*.12; gd=Math.hypot(P.x-H.x,P.z-H.z); if(!got&&gd<2&&!P.dead) hdFindGold(); if(!got&&gd<40&&Math.random()<dt*3) fxSpark(H.x+rnd(-.5,.5),1.6,H.z+rnd(-.5,.5),0xffd24a,2); }
  // 딸랑♪ — 가까울수록 빨라짐
  const gOk=H&&!D.gw[H.w]; const dd=Math.min(bd,gOk?gd:1e9); HD.ding-=dt; if(dd<24&&!layerOpen){ if(HD.ding<=0){ HD.ding=.22+dd/24*1.3; const f=dd===gd?1568:1318; tone(f,.06,"sine",0,.045); tone(f*1.5,.05,"sine",.05,.03); } }
  // 가까운(찾은) 신상 → 📣 버튼
  HD.near=null; HD.spots.forEach((s,i)=>{ if(!HD.near&&s.g.visible&&Math.hypot(P.x-s.x,P.z-s.z)<5) HD.near={x:s.x,z:s.z,i}; }); if(H&&H.g.visible&&D.gw[H.w]&&gd<5) HD.near={x:H.x,z:H.z,gold:1};
  // 이번 주 황금 신상 이름표
  if(!HD.lbl) HD.lbl=makeLabel("ally"); if(H&&H.g.visible&&gd<16&&!layerOpen) placeLabel(HD.lbl,H.x,2.2,H.z,D.gw[H.w]?"✨ <b>황금 신상</b> (찾음)":"✨ <b>황금 신상</b>"); else HD.lbl.style.display="none"; }
XTICK.push(hdTick);
/* ---------- 창 ---------- */
function showHidden(){ const D=hdData(), n=hdCount(); const H=HD.gold; const w=hdWeek(); const bd=hdGoldBoard(w);
  const zones=[0,1,2,3].map(r=>({ic:REALMS[r].icon,n:REALMS[r].n,z:"w"+r,c:REALMS[r].c1})).concat([{ic:"⭐",n:"세계의 중심",z:"c",c:"#cfd6ff"},{ic:"☀",n:"태양의 사막",z:"d",c:"#ffd27a"},{ic:"🏝",n:"뱀의 섬",z:"s",c:"#9ad88a"}]);
  const grid=zones.map(Z=>{ const idx=HD.spots.map((s,i)=>i).filter(i=>HD.spots[i].zone===Z.z); const got=idx.filter(i=>D.f[i]).length; return `<div class="row"><div class="ic" style="color:${Z.c}">${Z.ic}</div><div class="t"><div>${Z.n} <b>${got}/${idx.length}</b></div><span style="letter-spacing:2px">${idx.map(i=>D.f[i]?"🗿":"▫").join("")}</span></div></div>`; }).join("");
  const hintBtn=G.hidHint&&G.hidHint.d===kday()?`<button class="buy" id="hdHint">🧭 오늘 힌트 자리로 길 안내</button>`:D.hintD===kday()?`<button class="buy alt" disabled>🗿 오늘 힌트는 들었어요</button>`:`<button class="buy" id="hdHint">🗿 지혜의 석상에게 힌트 듣기</button>`;
  card(`<h2>🔎 숨은 아기 신상</h2><p>세계 곳곳 덤불·바위·통나무·버섯·기둥·꽃밭에 손바닥만 한 아기 신상이 숨어 있어요. 가까이 가면 <b>딸랑♪</b> 소리가 점점 빨라져요. 찾은 신상 <b style="color:var(--gold)">${n}/${HD_N}</b></p>
   <div class="idlegrid"><div><b>🗿 ${n}</b><span>찾은 신상</span></div><div><b>✨ ${G.hidGold||0}</b><span>찾은 황금 신상</span></div></div>
   <h3>✨ 이번 주의 황금 신상</h3><p style="font-size:14px">${H?`이번 주에는 <b style="color:#ffd24a">${H.rg}</b> 어딘가에 숨어 있어요! ${D.gw[w]?"✅ 찾았어요":"모두 함께 찾아요 — 먼저 찾은 10명은 명부에 이름이 올라가요"}`:"곧 숨어요"}</p>
   ${bd.length?bd.slice(0,10).map((x,k)=>`<div class="row"><div class="ic">${["🥇","🥈","🥉"][k]||k+1}</div><div class="t"><div><b style="color:${REALMS[x.r]?REALMS[x.r].c1:"#fff"}">${x.n}</b>${x.i===G.id?" (나)":""}</div><span>${fmtAgo(x.ts)}</span></div></div>`).join(""):`<p style="font-size:12px">아직 아무도 못 찾았어요. 첫 번째가 되어 봐요!</p>`}
   <h3>🗺 찾은 곳</h3>${grid}
   <div class="exgrid">${hintBtn}</div>
   <p style="font-size:12px">찾을 때마다 금화 · 4개마다 쇳조각 · 12개마다 룬 가루 · 12개면 신전 장식 «아기 신상 정원» · 다 찾으면 금화 3,000 + 칭호. 찾은 신상 앞에서 「📣 여기 숨은 신상!」을 누르면 근처 사람에게 빛기둥을 보여 줘요. 사막·뱀의 섬 신상은 그곳이 열리면 찾을 수 있어요.</p>`);
  if($("hdHint")) $("hdHint").onclick=hdHint; }
CTX_EXTRA.push(()=>{ if(hdOracleNear()&&hdData().hintD!==kday()) return {t:"🗿 숨은 신상 힌트 듣기",f:hdHint}; return HD.near?{t:HD.near.gold?"📣 여기 황금 신상!":"📣 여기 숨은 신상!",f:hdShout}:null; });
MENU_X.push({ic:"🔎",n:"숨은 아기 신상",id:"hdBtn",sub:()=>`찾은 신상 ${hdCount()}/${HD_N} · ✨ 이번 주 황금 신상 ${HD.gold?HD.gold.rg:""}${hdData().gw[hdWeek()]?" (찾음)":""}`,f:showHidden});
const HD_DECO=DECO.length;
DECO.push({n:"아기 신상 정원",ic:"🗿",t:2,sc:15,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(1.3,1.4,.3,mat({color:0x6cb85a}),0,.15,0,16)); [-.6,.6,0].forEach((x,k)=>{ const s=hdStatue(new THREE.Color(REALMS[(r+k)%4].c1).getHex(),k===2); s.scale.setScalar(.7); s.position.set(x,.3,k===2?-.5:.3); g.add(s); }); return g; }});
TITLES.push({id:"hd4",n:"숨바꼭질 새내기",t:0,h:"숨은 아기 신상 4개 찾기",g:()=>[hdCount(),4]},{id:"hd12",n:"눈 밝은 탐험가",t:1,h:"숨은 아기 신상 12개 찾기",g:()=>[hdCount(),12]},{id:"hd56",n:"숨바꼭질의 신",t:3,h:"숨은 아기 신상 56개 모두 찾기",g:()=>[hdCount(),HD_N]},{id:"hdg",n:"황금 신상 사냥꾼",t:2,h:"이번 주의 황금 신상 3번 찾기",g:()=>[G.hidGold||0,3]});
</script>
