<script>
/* ================= v69-2: 🥚 신수 둥지 — 다른 사람 신수와 짝지어 새 신수 알 (IDEAS G11/6-2) =================
   수도마다 커다란 「신수 둥지」. Lv10 넘은 신수를 맡기고, 둥지 게시판에서 친구나 처음 보는 사람의 신수와 짝을 지음.
   짝을 지은 때부터 8시간(게임을 꺼 둬도 흐름) 뒤 두 사람 모두 「섞인 알」을 받음 — 섞인 신수 6종이 새로 생김.
     그리핀+슬레이프니르=히포그리프 · 그리핀+가루다=태양 독수리 · 그리핀+페가수스=하늘 사자
     슬레이프니르+가루다=불꽃 갈기 말 · 슬레이프니르+페가수스=구름 말 · 가루다+페가수스=무지개 새
     (섞인 신수끼리 짝지으면 그 부모 중 하나씩 골라 다시 섞임 · 불사조와 짝지으면 반반)
   아주 가끔(5%, 확률 공개 · 돈과 상관없음) 반짝이는 ✨별빛 신수. 신수 정보에 "부모: ○○의 그리핀 · △△의 페가수스".
   8시간 동안 아무도 짝을 안 지으면 🦚 둥지 지기 공작이 짝이 되어 줌(혼자 놀 때도 손해 없음).
   보관(retained) 주제: ne/<id> = {i,n,r,pk,pl,sh,ts,m(짝 id),mt(짝 지은 때),mk,ml,mn,msh,d(끝)}  ·  nk/<받는 사람>/<보낸 사람> = 🙏 고마워
   짝 짓기는 한쪽이 먼저 "이 신수랑!" 하고 올리면(m) 상대 폰이 다음에 볼 때 받아들임 — 가장 먼저 온 짝 하나. */
const NB=PETS.length;   // 섞인 신수가 시작하는 번호 (불사조 다음)
PETS.push(
 {n:"아기 히포그리프",kind:"pegasus",c:0xe8d27a,c2:0xb8c6d8,egg:"섞인 무늬 알",par:[0,1]},
 {n:"아기 태양 독수리",kind:"bird",c:0xffc23a,c2:0xff7a2a,egg:"섞인 무늬 알",par:[0,2]},
 {n:"아기 하늘 사자",kind:"griffin",c:0xfff4d8,c2:0xffcf4a,egg:"섞인 무늬 알",par:[0,3]},
 {n:"아기 불꽃 갈기 말",kind:"horse8",c:0xc8b8a8,c2:0xff7a30,egg:"섞인 무늬 알",par:[1,2]},
 {n:"아기 구름 말",kind:"pegasus",c:0xdce8f8,c2:0x8ab0e0,egg:"섞인 무늬 알",par:[1,3]},
 {n:"아기 무지개 새",kind:"bird",c:0xff9ad0,c2:0x8ad8ff,egg:"섞인 무늬 알",par:[2,3]});
const NE_PAIR={"0-1":NB,"0-2":NB+1,"0-3":NB+2,"1-2":NB+3,"1-3":NB+4,"2-3":NB+5};
const NE_H=8, NE_MINLV=10, NE_SHINY=.05, NE_ICON=["🦅","🐎","🐦","🦄","🔥","🦄","🦅","🦁","🐎","☁","🌈"];
const NE={spots:[],lbl:null,t:0,pubT:6,q:[],gotQ:[]};
const NEO={};
function nePetIc(r){ return NE_ICON[r]||"🐾"; }
function neBase(x){ if(x<4||x===4) return [x]; const D=PETS[x]; return D&&D.par?D.par:[0]; }
function neOutcomes(a,b){ const S=new Set(); neBase(a).forEach(pa=>neBase(b).forEach(pb=>{ if(pa===pb) S.add(pa); else if(pa===4||pb===4){ S.add(4); S.add(pa===4?pb:pa); } else S.add(NE_PAIR[Math.min(pa,pb)+"-"+Math.max(pa,pb)]); })); return [...S]; }
function neChild(a,b,rr){ const A=neBase(a), B=neBase(b); const pa=A[Math.floor(rr()*A.length)], pb=B[Math.floor(rr()*B.length)]; if(pa===pb) return pa; if(pa===4||pb===4) return rr()<.5?4:(pa===4?pb:pa); return NE_PAIR[Math.min(pa,pb)+"-"+Math.max(pa,pb)]; }
function neHash(s){ let h=2166136261; s=String(s); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function neMine(){ const n=G.nest; return n&&n.pk>=0&&!n.d?n:null; }
function neAway(r){ const n=neMine(); return !!n&&n.pk===r; }
(function(){ const _ea=expPetAway; expPetAway=function(r){ return _ea(r)||neAway(r); };
  const _es=expStart; expStart=function(d,h){ if(neAway(G.pet)){ toast("🥚 그 신수는 지금 둥지에 있어요","둥지에서 돌아오면 원정을 보낼 수 있어요",2.2); return; } return _es(d,h); };
  const _he=hatchEgg; hatchEgg=function(){ const e=G.egg; const r=e?e.r:-1, sh=e&&e.sh, par=e&&e.par; const had=r>=0&&G.pets&&G.pets[r]&&G.pets[r].sh; _he(); if(r<0) return; const p=G.pets&&G.pets[r]; if(!p) return; let ch=false; if(par&&!p.par){ p.par=par; ch=true; } if(sh&&!had){ p.sh=1; ch=true; setTimeout(()=>{ toast(`✨ 별빛 ${PETS[r].n}!`,"반짝반짝 빛나는 아주 드문 신수예요",3); jingle([1318,1568,2093,2637]); },900); } if(ch){ saveGame(); try{ rebuildMyPet(); net.hello(); net.pushProfile(1); }catch(e2){} } }; })();
/* ---------- 둥지 모델 ---------- */
function neModel(){ const g=new THREE.Group(); const st=M.marble||mat({color:0xf4efe2}), twig=mat({color:0x9a6a3a,roughness:1}), twig2=mat({color:0x7a5030,roughness:1});
  g.add(cyl(3.2,3.6,1.2,st,0,.6,0,20)); { const rim=new THREE.Mesh(new THREE.TorusGeometry(3.4,.12,6,40),M.gold); rim.rotation.x=Math.PI/2; rim.position.y=1.22; g.add(rim); }
  for(let k=0;k<26;k++){ const a=k/26*6.283; const t=cyl(.12,.12,3.6,k%2?twig:twig2,Math.cos(a)*2.4,2,Math.sin(a)*2.4,5); t.rotation.z=Math.PI/2; t.rotation.y=-a+(k%3-1)*.35; t.rotation.x=(k%2?.25:-.25); g.add(t); }
  const bowl=new THREE.Mesh(new THREE.TorusGeometry(2.3,.75,8,22),twig); bowl.rotation.x=Math.PI/2; bowl.position.y=2; g.add(bowl); const inner=cyl(1.9,1.4,.4,twig2,0,1.6,0,16); g.add(inner);
  const eggs=[]; [[0,0,0xfff2c8,1],[-.95,.5,0xc8e4ff,.8],[.9,-.6,0xffd0e8,.8]].forEach(([x,z,c,s])=>{ const e=sph(.7*s,mat({color:c,roughness:.45,emissive:c,emissiveIntensity:.12}),x,2.4+.25*s,z); e.scale.y*=1.3; g.add(e); eggs.push(e); for(let k=0;k<3;k++){ const sp=sph(.12*s,mat({color:0xffffff}),x+Math.cos(k*2.1)*.45*s,2.5+.25*s+(k-1)*.3*s,z+Math.sin(k*2.1)*.45*s+.3*s); g.add(sp); } });
  const glow=new THREE.Mesh(new THREE.RingGeometry(3.6,4.3,40),glowMat(0xffe0a0,.35)); glow.rotation.x=-Math.PI/2; glow.position.y=.08; glow.userData.noOutline=true; g.add(glow);
  const sign=new THREE.Group(); sign.add(cyl(.1,.1,1.8,twig2,0,.9,0,6)); sign.add(box(1.6,.7,.12,mat({color:0xf3e2b8,roughness:.9}),0,1.75,0)); sign.position.set(3.8,0,1.6); g.add(sign);
  g.userData={eggs,glow}; return g; }
setTimeout(()=>{ for(let r=0;r<4;r++){ let s; try{ s=xCapSpot(r,30); }catch(e){ const c=REGIONS[r*3]; s={x:c.x+(c.x>0?-30:30),z:c.z+12,rot:0}; } XSPOT_USED.push({r,x:s.x,z:s.z,rad:6}); const g=neModel(); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); NE.spots[r]={x:s.x,z:s.z,rot:s.rot,g}; } },15);
function neNear(){ if(typeof TW!=="undefined"&&TW.on) return null; for(const s of NE.spots){ if(s&&Math.hypot(P.x-s.x,P.z-s.z)<6.5) return s; } return null; }
/* ---------- 게시판 · 짝 짓기 ---------- */
function neClaimed(id,ts){ for(const k in NEO){ const z=NEO[k]; if(z&&z.m===id&&z.mt>ts&&!z.d) return z; } const me=neMine(); return me&&me.m===id&&me.mt>ts?me:null; }
function neBoard(){ const now=Date.now(), L=[]; for(const id in NEO){ const y=NEO[id]; if(!y||id===G.id||y.d||!(y.pk>=0)||y.m||now-y.ts>3*86400000) continue; if(neClaimed(id,y.ts)) continue; L.push(y); } return L.sort((a,b)=>b.ts-a.ts); }
function nePub(){ const n=G.nest; if(!n) return; try{ net.pushRet("ne/"+G.id,{i:G.id,n:G.name,r:G.realm,pk:n.pk,pl:n.pl,sh:n.sh?1:0,ts:n.ts,m:n.m||"",mt:n.mt||0,mk:n.mk==null?-1:n.mk,ml:n.ml||0,mn:n.mn||"",msh:n.msh?1:0,d:n.d?1:0}); }catch(e){} }
function neDeposit(r){ if(neMine()){ toast("이미 둥지에 신수가 있어요"); return; } const p=G.pets&&G.pets[r]; if(!p) return; if(p.lv<NE_MINLV){ toast(`신수가 Lv.${NE_MINLV} 이상이어야 맡길 수 있어요`); return; } if(typeof expPetAway==="function"&&G.exp&&G.exp.pet===r){ toast("그 신수는 원정 중이에요"); return; } if(!neNear()){ toast("수도의 신수 둥지 앞에서 맡길 수 있어요"); return; }
  G.nest={pk:r,pl:p.lv,sh:p.sh?1:0,ts:Date.now(),m:"",mt:0,mk:-1,ml:0,mn:"",msh:0,d:0}; saveGame(); nePub(); try{ rebuildMyPet(); net.hello(); net.pushProfile(1); }catch(e){}
  const s=neNear(); if(s){ fxRing(s.x,s.z,0xffe0a0,7,.8); fxSpark(s.x,3,s.z,PETS[r].c,26); } jingle([659,784,988,1318]); toast(`🥚 ${PETS[r].n}${josa(PETS[r].n,"을","를")} 둥지에 맡겼어요`,"게시판에서 짝을 고르거나, 누군가 골라 주길 기다려요 · 꺼 둬도 괜찮아요",3); }
function nePair(id){ const me=neMine(); if(!me||me.m){ toast("먼저 내 신수를 둥지에 맡겨요"); return false; } const y=NEO[id]; if(!y||y.m||y.d||neClaimed(id,y.ts)){ toast("이미 다른 짝이 생긴 신수예요"); return false; }
  Object.assign(me,{m:y.i,mt:Date.now(),mk:y.pk,ml:y.pl,mn:y.n,msh:y.sh?1:0}); saveGame(); nePub(); const s=neNear(); if(s){ fxRing(s.x,s.z,0xff9ad0,8,.9); fxSpark(s.x,3.5,s.z,0xff9ad0,30); } jingle([784,988,1175,1568]); buzz(25);
  toast(`💞 ${y.n}님의 ${PETS[y.pk].n}${josa(PETS[y.pk].n,"와","과")} 짝이 되었어요!`,`${NE_H}시간 뒤 두 사람 모두 섞인 알을 받아요`,3); return true; }
function neCancel(){ const me=neMine(); if(!me||me.m) return; G.nest=null; try{ net.pushRet("ne/"+G.id,{i:G.id,n:G.name,r:G.realm,pk:-1,ts:Date.now(),d:1}); }catch(e){} saveGame(); try{ rebuildMyPet(); net.hello(); net.pushProfile(1); }catch(e){} toast("신수가 둥지에서 돌아왔어요"); }
function neOnRec(y){ if(!y||!y.i||y.i===G.id) return; NEO[y.i]=y; const me=neMine(); if(me&&!me.m&&y.m===G.id&&y.mt>me.ts&&!y.d){ Object.assign(me,{m:y.i,mt:y.mt,mk:y.pk,ml:y.pl,mn:y.n,msh:y.sh?1:0}); saveGame(); nePub(); NE.q.push(`💞 ${y.n}님이 내 ${PETS[me.pk].n}${josa(PETS[me.pk].n,"을","를")} 짝으로 골랐어요!`); } }
/* ---------- 알 나오기 ---------- */
function neDeliver(){ const me=neMine(); if(!me) return; const rr=dgRng((me.mt%2000000000)^neHash(G.id)); const child=neChild(me.pk,me.mk,rr); const sh=rr()<NE_SHINY; const par=[`${G.name}의 ${PETS[me.pk].n}`,`${me.mn}의 ${PETS[me.mk]?PETS[me.mk].n:"신수"}`];
  const egg={r:child,sh:sh?1:0,par,from:me.m,fn:me.mn}; G.nestEggs=G.nestEggs||[]; G.nestEggs.push(egg); G.nestN=(G.nestN||0)+1; if(sh) G.nestSh=(G.nestSh||0)+1; const pk=me.pk;
  // 신수가 둥지에서 돌아오며 조금 자람
  const p=G.pets[pk]; if(p&&p.lv<PET_MAX){ p.lv=Math.min(PET_MAX,p.lv+1); }
  G.nest=null; try{ net.pushRet("ne/"+G.id,{i:G.id,n:G.name,r:G.realm,pk:-1,ts:Date.now(),d:1}); }catch(e){} saveGame(); try{ rebuildMyPet(); net.hello(); net.pushProfile(1); }catch(e){} NE.gotQ.push(egg); }
function neShowEgg(e){ const sp=e.from==="spirit"; const outs=PETS[e.r];
  card(`<h2>🥚 둥지에서 섞인 알이 나왔어요!</h2><p style="font-size:16px">${sp?"🦚 <b>둥지 지기 공작</b>":`<b>${e.fn}</b>님`}의 신수와 내 신수 사이에서 <b>${e.sh?"✨ 반짝이는 ":""}${outs.egg}</b>이 태어났어요.</p>
   <p style="font-size:13px">부모: ${e.par.join(" · ")}<br>알은 곧 깨어나요! 내 신수도 둥지에서 돌아오며 레벨이 1 올랐어요.</p>
   ${sp?"":`<button class="go" id="neThx" style="align-self:center;font-size:20px;padding:10px 30px">🙏 고마워!</button>`}<button class="buy alt" id="neOk" style="align-self:center">${sp?"좋아요!":"나중에"}</button>`);
  jingle([523,659,784,1046,1318]); if($("neThx")) $("neThx").onclick=()=>{ try{ net.pushRet("nk/"+e.from+"/"+G.id,{i:G.id,n:G.name,ts:Date.now()}); }catch(er){} closeLayer(); toast(`🙏 ${e.fn}님에게 고마운 마음을 보냈어요`,null,1.8); }; $("neOk").onclick=closeLayer; }
NETX.push({sub:"ne/+",pre:"ne/",f:d=>neOnRec(d)});
NETX.push({sub:()=>"nk/"+G.id+"/+",pre:"nk/",f:d=>{ if(!d||!d.i||d.i===G.id||!d.ts) return; G.nkSeen=G.nkSeen||{}; const k=d.i+":"+d.ts; if(G.nkSeen[k]) return; G.nkSeen[k]=1; G.nkGot=(G.nkGot||0)+1; saveGame(); NE.q.push(`🙏 ${d.n}님이 신수 둥지 짝꿍이 되어 줘서 고마워해요!`); }});
/* ---------- 매 프레임 ---------- */
function neTick(dt){ if(!started||G.realm<0) return; const tn=performance.now();
  NE.spots.forEach((s,i)=>{ if(!s) return; const u=s.g.userData; u.glow.material.opacity=.28+Math.sin(tn/700)*.1; u.eggs.forEach((e,k)=>{ e.rotation.z=Math.sin(tn/300+k*2)*(.06+(neMine()&&i===G.realm&&k===0?.12:0)); }); });
  NE.t-=dt; if(NE.t>0) return; NE.t=.5;
  if(!NE.lbl) NE.lbl=makeLabel("ally"); const s=NE.spots.find(s=>s&&Math.hypot(P.x-s.x,P.z-s.z)<30); if(s&&!layerOpen&&!(typeof TW!=="undefined"&&TW.on)){ const n=neBoard().length; placeLabel(NE.lbl,s.x,5.6,s.z,`🥚 <b>신수 둥지</b>${n?` · 짝 찾는 신수 ${n}`:""}`); } else NE.lbl.style.display="none";
  const me=neMine(); const now=Date.now();
  if(me&&!me.m&&now-me.ts>=NE_H*3600000){ Object.assign(me,{m:"spirit",mt:me.ts,mk:rint(0,3),ml:me.pl,mn:"둥지 지기 공작",msh:0}); saveGame(); nePub(); }
  if(me&&me.m&&now>=me.mt+NE_H*3600000) neDeliver();
  if(!G.egg&&G.nestEggs&&G.nestEggs.length){ const e=G.nestEggs.shift(); G.egg={r:e.r,t0:Date.now()-EGG_MS+4000,sh:e.sh,par:e.par}; G.eggEver=1; saveGame(); }
  if(!layerOpen&&!P.dead){ if(NE.gotQ.length) neShowEgg(NE.gotQ.shift()); else if(NE.q.length){ toast(NE.q.shift(),null,2.8); jingle([784,988,1175]); } }
  NE.pubT-=.5; if(NE.pubT<=0){ NE.pubT=300; if(G.nest) nePub(); } }
XTICK.push(neTick);
/* ---------- 창 ---------- */
function neLeft(ms){ return fmtLeft(Math.max(60000,ms)); }
function showNest(){ petData(); const me=neMine(), near=neNear(), now=Date.now(); const L=neBoard();
  let top;
  if(me){ const D=PETS[me.pk]; if(me.m){ const mk=PETS[me.mk]; const outs=neOutcomes(me.pk,me.mk).map(x=>`${nePetIc(x)} ${PETS[x].n.replace("아기 ","")}`).join(" · ");
      top=`<div class="row"><div class="ic">💞</div><div class="t"><div>${nePetIc(me.pk)} 내 ${D.n} ♥ ${me.m==="spirit"?"🦚 ":""}${me.mn}의 ${mk?mk.n:"신수"}</div><span>섞인 알까지 ${neLeft(me.mt+NE_H*3600000-now)} · 게임을 꺼 둬도 시간이 흘러요<br>나올 수 있는 신수: ${outs} (✨ 별빛 ${Math.round(NE_SHINY*100)}%)</span></div></div>`; }
    else top=`<div class="row"><div class="ic">${nePetIc(me.pk)}</div><div class="t"><div>내 ${me.sh?"✨":""}${D.n} Lv.${me.pl} — 짝을 기다리는 중</div><span>아래 게시판에서 짝을 고르거나, 누군가 골라 주길 기다려요. ${neLeft(me.ts+NE_H*3600000-now)} 안에 아무도 없으면 🦚 둥지 지기 공작이 짝이 되어 줘요.</span></div><button class="buy alt" id="neBack">데려오기</button></div>`; }
  else { const ok=Object.keys(G.pets||{}).map(Number).filter(r=>G.pets[r].lv>=NE_MINLV&&!(PETS[r]&&PETS[r].leg)&&!(G.exp&&G.exp.pet===r));
    top=ok.length?`<p style="font-size:13px">어떤 신수를 둥지에 맡길까요? (Lv.${NE_MINLV} 이상)</p><div class="exgrid">${ok.map(r=>`<button class="buy" data-dep="${r}" ${near?"":"disabled"}>${nePetIc(r)} ${G.pets[r].sh?"✨":""}${PETS[r].n.replace("아기 ","")} Lv.${G.pets[r].lv}</button>`).join("")}</div>${near?"":`<p style="font-size:12px;color:var(--gold)">수도의 신수 둥지 앞에서 맡길 수 있어요</p>`}`
      :`<p style="font-size:13px">Lv.${NE_MINLV} 넘은 신수가 있어야 맡길 수 있어요. 신수와 함께 괴물을 잡으면 신수가 자라요.</p>`; }
  const rows=L.slice(0,14).map(y=>{ const D=PETS[y.pk]; const R=REALMS[y.r]; const outs=me&&!me.m?neOutcomes(me.pk,y.pk).map(x=>nePetIc(x)).join(""):""; return `<div class="row"><div class="ic">${nePetIc(y.pk)}</div><div class="t"><div>${y.sh?"✨":""}${D?D.n:"신수"} Lv.${y.pl}</div><span><b style="color:${R?R.c1:"#fff"}">${y.n}</b>${R?" · "+R.n:""} · ${fmtAgo(y.ts)}${outs?` · 나올 수 있는 신수 ${outs}`:""}</span></div>${me&&!me.m?`<button class="buy" data-pair="${y.i}">이 신수랑!</button>`:""}</div>`; }).join("");
  card(`<h2>🥚 신수 둥지</h2><p>내 신수를 맡기고 다른 사람(처음 보는 사람도)의 신수와 짝을 지으면, ${NE_H}시간 뒤 <b>두 사람 모두</b> 섞인 알을 받아요. 그리핀+페가수스 = 하늘 사자처럼 새로운 신수가 태어나요!</p>
   ${top}
   <div class="idlegrid"><div><b>🥚 ${G.nestN||0}</b><span>둥지에서 받은 알</span></div><div><b>✨ ${G.nestSh||0}</b><span>별빛 신수 알</span></div><div><b>🙏 ${G.nkGot||0}</b><span>받은 고마워</span></div></div>
   <h3>📋 짝 찾는 신수</h3>${rows||'<p style="font-size:13px">지금은 짝을 찾는 신수가 없어요. 내 신수를 먼저 맡겨 두면 다른 사람이 골라 줄 수 있어요.</p>'}
   ${near?"":`<button class="buy" id="neWay" style="align-self:center">신수 둥지로 길 안내</button>`}
   <p style="font-size:12px">섞인 신수 6종: 🦄 히포그리프 · 🦅 태양 독수리 · 🦁 하늘 사자 · 🐎 불꽃 갈기 말 · ☁ 구름 말 · 🌈 무지개 새. 이미 있는 신수가 나오면 그 신수 레벨 +2. ✨ 별빛 신수는 ${Math.round(NE_SHINY*100)}% — 진짜 돈과는 아무 상관 없어요. 맡긴 신수는 둥지에 있는 동안 따라다니지 않아요.</p>`);
  layers.querySelectorAll("[data-dep]").forEach(b=>b.onclick=()=>{ neDeposit(+b.dataset.dep); showNest(); });
  layers.querySelectorAll("[data-pair]").forEach(b=>b.onclick=()=>{ if(nePair(b.dataset.pair)) showNest(); });
  if($("neBack")) $("neBack").onclick=()=>{ neCancel(); showNest(); };
  if($("neWay")) $("neWay").onclick=()=>{ const s=NE.spots[Math.max(0,G.realm)]; if(s) setGuide({x:s.x,z:s.z+5,label:"🥚 신수 둥지"}); closeLayer(); }; }
CTX_EXTRA.push(()=>neNear()?{t:neBoard().length?`🥚 신수 둥지 (${neBoard().length})`:"🥚 신수 둥지",f:showNest}:null);
MENU_X.push({ic:"🥚",n:"신수 둥지",id:"neBtn",sub:()=>{ const me=neMine(); if(me) return me.m?`💞 짝꿍과 알 품는 중 · ${neLeft(me.mt+NE_H*3600000-Date.now())} 남음`:"내 신수가 짝을 기다려요"; return `신수를 맡기고 짝 짓기 · 짝 찾는 신수 ${neBoard().length}`; },f:showNest});
/* ---------- 신수 도감 (섞인 신수·별빛·부모 포함) ---------- */
showPets=function(){ petData(); const eg=G.egg?`<div class="row"><div class="ic">🥚</div><div class="t"><div>${G.egg.sh?"✨ ":""}${(PETS[G.egg.r]||PETS[0]).egg} 품는 중</div><span>${eggLeft()>0?`깨어나기까지 ${Math.ceil(eggLeft()/60000)}분 · 게임을 꺼 둬도 자라요`:"곧 깨어나요!"}</span></div></div>`:`<div class="row"><div class="ic">🥚</div><div class="t"><div>알 없음</div><span>괴물을 잡으면 가끔 알이 나와요(보스는 자주). 🥚 신수 둥지에서 짝을 지어도 알이 생겨요.</span></div></div>`;
  const where=r=>r<4?`${REALMS[r].n}의 신수 · ${PETS[r].egg}에서 태어나요`:r===4?"태양의 사막 · 혼돈의 뱀 아펩이 가끔 떨어뜨려요":PETS[r].leg?"🐲 전설 신수 · 한 달에 한 번 「전설 신수 길들이기 대작전」에서 알을 받아요":`섞인 신수 · 🥚 신수 둥지에서 ${PETS[PETS[r].par[0]].n.replace("아기 ","")}+${PETS[PETS[r].par[1]].n.replace("아기 ","")}`;
  const rows=PETS.map((D,r)=>{ const p=G.pets[r]; if(!p) return `<div class="row" style="opacity:.55"><div class="ic">❔</div><div class="t"><div>???</div><span>${where(r)}</span></div></div>`;
    const on=G.pet===r, away=expPetAway(r), nest=neAway(r); return `<div class="row"><div class="ic" style="color:#${D.c.toString(16).padStart(6,"0")}">${nePetIc(r)}</div><div class="t"><div>${p.sh?"✨ 별빛 ":""}${D.n} Lv.${p.lv}${nest?' <i class="st">🥚 둥지</i>':away?' <i class="st">🧭 원정 중</i>':on?' <i class="st on">함께하는 중</i>':""}</div><span>금화 +${p.lv*2}% · 공격 함께 ${p.lv>=PET_MAX?"· 최고 레벨!":`· 다음 레벨까지 ${petNeed(p.lv)-Math.floor(p.xp||0)}마리`}${p.lv>=10?" · 👑 왕관":""}${p.par?`<br>부모: ${p.par.join(" · ")}`:""}</span></div>${on||away?"":`<button class="buy" data-pet="${r}">데려가기</button>`}</div>`; }).join("");
  card(`<h2>🐣 신수</h2><p>신수 도감 ${Object.keys(G.pets).length}/${PETS.length} · 신수는 괴물을 같이 공격하고 금화를 더 주워 줘요. 친구 화면에도 보여요.</p>${eg}${rows}<p style="font-size:12px">괴물 1마리 = 신수 경험치 1 (보스 6). 쉬는 동안 수련한 괴물 수만큼 신수도 자라요. 레벨 10이 되면 왕관, 그리고 🥚 신수 둥지에 맡길 수 있어요!</p>`);
  layers.querySelectorAll("[data-pet]").forEach(b=>b.onclick=()=>{ G.pet=+b.dataset.pet; saveGame(); rebuildMyPet(); try{ net.hello(); net.pushProfile(1); }catch(e){} jingle([659,784,1046]); showPets(); }); };
TITLES.push({id:"ne1",n:"신수 둥지지기",t:1,h:"신수 둥지에서 섞인 알 받기",g:()=>[G.nestN||0,1]},{id:"ne5",n:"신수 중매쟁이",t:2,h:"신수 둥지에서 알 5개 받기",g:()=>[G.nestN||0,5]},{id:"nesh",n:"별빛 신수의 주인",t:3,h:"✨ 별빛 신수 얻기",g:()=>[Object.values(G.pets||{}).some(p=>p.sh)?1:0,1]},{id:"nedex",n:"신수 박사",t:3,h:"신수 도감 8칸 채우기",g:()=>[Object.keys(G.pets||{}).length,8]});
</script>
