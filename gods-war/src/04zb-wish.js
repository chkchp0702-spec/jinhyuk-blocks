<script>
/* ================= v56-2: 🌳 소원 나무 — 모르는 사람끼리 재료 나눠 주기 (IDEAS G11/5-5) =================
   네 수도마다 커다란 소원 나무. 하루 한 장 소원 쪽지를 걸어요 — 물건과 개수만 고름(글자 안 씀 → 나쁜 말 걱정 없음).
   누구든(처음 보는 사람도) 나무 앞에서 남는 재료로 소원을 들어줄 수 있어요. 들어준 사람은 🌸 친절 꽃잎.
   소원 주인은 꺼져 있어도 괜찮아요 — 다음에 켜면 "○○님이 소원을 들어줬어요!" + 🙏 고마워 버튼.
   주고받는 맞바꾸기가 아니라 "주기만" 하는 것이라 속이거나 빼앗길 걱정이 없음.
   아무도 못 들어주면 8시간 뒤 🧚 나무의 정령이 대신 들어줌(혼자 놀 때도 손해 없음).
   보관(retained) 주제: ws/<id> = 내 소원 {i,n,r,k,c,ts,d,g(이루어짐),b(들어준 사람),sp(새싹)}
                     wg/<주인>/<준 사람> = {i,n,r,o,ts,k,c,d}  ·  wt/<준 사람>/<주인> = {i,n,ts} (고마워)
   나무에는 아직 안 이루어진 소원 쪽지가 매달리고, 오늘 이루어진 소원 수만큼 꽃이 핌. */
const WS_ITEMS=[
 {k:"ore",ic:"⛓",n:"쇳조각",cs:[5,10],get:()=>G.ore||0,add:n=>{ G.ore=(G.ore||0)+n; }},
 {k:"rune",ic:"✨",n:"룬 가루",cs:[1,2],get:()=>G.rune||0,add:n=>{ G.rune=(G.rune||0)+n; }},
 {k:"pots",ic:"🧪",n:"물약",cs:[2,3],get:()=>G.pots||0,add:n=>{ G.pots=(G.pots||0)+n; }},
 {k:"stone",ic:"🧱",n:"건축 돌",cs:[5,10],get:()=>G.stone||0,add:n=>{ G.stone=(G.stone||0)+n; }},
 {k:"sun",ic:"☀",n:"태양 조각",cs:[2,3],get:()=>G.sun||0,add:n=>{ G.sun=(G.sun||0)+n; }},
 {k:"gold",ic:"🪙",n:"금화",cs:[100,300],get:()=>G.gold||0,add:n=>{ G.gold=(G.gold||0)+n; }} ];
const WS_SPIRIT_H=8;
const WS={trees:[],lbl:null,t:0,notes:[],flowers:[],q:[],dirty:true,pubT:5,sel:{k:0,c:0},spT:10};
const WSO={}, WGO={};   // WSO[id]=소원, WGO[주인+":"+준사람]=선물 기록
function wsItem(k){ return WS_ITEMS.find(x=>x.k===k)||WS_ITEMS[0]; }
function wsMine(){ const w=G.ws; return w&&w.d>=kday()-1?w:null; }
function wsToday(){ const w=G.ws; return w&&w.d===kday()?w:null; }
function wsOpenList(){ const day=kday(), L=[]; for(const id in WSO){ const w=WSO[id]; if(!w||id===G.id||w.g||w.d<day-1) continue; if(wsGranted(id,w.ts)) continue; L.push(w); } L.sort((a,b)=>(b.sp?1:0)-(a.sp?1:0)||b.ts-a.ts); return L; }
function wsGranted(owner,ts){ for(const key in WGO){ const g=WGO[key]; if(g.o===owner&&g.ts===ts) return g; } return null; }
function wsBloom(){ const day=kday(); let n=0; for(const key in WGO) if(WGO[key].d===day) n++; return n; }
function wsMyGave(owner,ts){ const g=WGO[owner+":"+G.id]; return g&&g.ts===ts; }
/* ---------- 나무 ---------- */
function wsTreeModel(){ const g=new THREE.Group(); const bark=mat({color:0x8a6040,roughness:.95}), dk=mat({color:0x6a4a30,roughness:1}), leaf=mat({color:0x5fae58,roughness:.8}), leaf2=mat({color:0x7cc46a,roughness:.8});
  g.add(cyl(1.1,1.7,7,bark,0,3.5,0,12)); for(let k=0;k<5;k++){ const a=k/5*6.283; const rt=cyl(.25,.55,2.6,dk,Math.cos(a)*1.5,.35,Math.sin(a)*1.5,6); rt.rotation.z=Math.cos(a)*1.15; rt.rotation.x=-Math.sin(a)*1.15; g.add(rt); }
  for(let k=0;k<4;k++){ const a=k/4*6.283+.4; const br=cyl(.32,.55,4.5,bark,Math.cos(a)*1.6,7.6,Math.sin(a)*1.6,7); br.rotation.z=-Math.cos(a)*.75; br.rotation.x=Math.sin(a)*.75; g.add(br); }
  const blobs=[[0,10.5,0,4.2],[3.4,9.4,.6,3],[-3.2,9.6,-.4,3.1],[.5,9.2,3.2,2.9],[-.6,9.3,-3.2,2.9],[2,12.2,-1.4,2.4],[-1.8,12,1.6,2.4]];
  blobs.forEach(([x,y,z,r],i)=>{ const s=sph(r,i%2?leaf2:leaf,x,y,z); s.scale.y*=.78; g.add(s); });
  const glow=new THREE.Mesh(new THREE.RingGeometry(3.2,4,40),glowMat(0xffc8f0,.35)); glow.rotation.x=-Math.PI/2; glow.position.y=.1; glow.userData.noOutline=true; g.add(glow);
  const sign=new THREE.Group(); sign.add(cyl(.1,.1,1.8,dk,0,.9,0,6)); sign.add(box(1.6,.7,.12,mat({color:0xf3e2b8,roughness:.9}),0,1.75,0)); sign.position.set(3.2,0,2.2); g.add(sign);
  g.userData={blobs,glow,h:13}; return g; }
setTimeout(()=>{ for(let r=0;r<4;r++){ let s; try{ s=xCapSpot(r,24); }catch(e){ const c=REGIONS[r*3]; s={x:c.x+(c.x>0?-22:22),z:c.z-10,rot:0}; } XSPOT_USED.push({r,x:s.x,z:s.z,rad:7}); const g=wsTreeModel(); g.position.set(s.x,hAt(s.x,s.z),s.z); g.rotation.y=s.rot; scene.add(shadowify(g)); g.traverse(o=>{ if(o.material&&o.material.blending===THREE.AdditiveBlending){ o.castShadow=false; o.userData.noOutline=true; } }); WS.trees[r]={x:s.x,z:s.z,rot:s.rot,g,notes:[],flowers:[]}; } WS.dirty=true; },5);
function wsNear(){ if(typeof TW!=="undefined"&&TW.on) return null; for(const t of WS.trees){ if(t&&Math.hypot(P.x-t.x,P.z-t.z)<6.5) return t; } return null; }
const WS_NOTE_C=[0xfff2a0,0xbfe0ff,0xffc89a,0xd8f0ff];
function wsDecorate(){ WS.dirty=false; const open=wsOpenList().slice(0,12); const me=wsMine(); const notes=me&&!me.got?[{r:G.realm,me:1}].concat(open):open; const bloom=Math.min(40,wsBloom()+(me&&me.got?1:0));
  WS.trees.forEach(t=>{ if(!t) return; t.notes.forEach(n=>t.g.remove(n)); t.flowers.forEach(f=>t.g.remove(f)); t.notes=[]; t.flowers=[]; const B=t.g.userData.blobs;
    notes.slice(0,12).forEach((w,i)=>{ const a=i/12*6.283*1.618+.3, b=B[1+(i%4)]; const x=b[0]+Math.cos(a)*b[3]*.85, z=b[2]+Math.sin(a)*b[3]*.85, y=b[1]-b[3]*.62; const n=new THREE.Group(); n.add(cyl(.02,.02,.7,mat({color:0xffffff}),0,.35,0,4)); const p=box(.5,.68,.04,mat({color:WS_NOTE_C[Math.max(0,w.r||0)%4],roughness:.9,emissive:w.me?0x332200:0x000000}),0,-.2,0); n.add(p); n.position.set(x,y,z); n.rotation.y=a; n.userData.sw=rnd(0,6); t.g.add(n); t.notes.push(n); });
    for(let i=0;i<bloom;i++){ const b=B[i%B.length]; const a=i*2.399, e=Math.acos(1-2*((i*.618)%1)); const x=b[0]+Math.sin(e)*Math.cos(a)*b[3]*.98, y=b[1]+Math.cos(e)*b[3]*.78, z=b[2]+Math.sin(e)*Math.sin(a)*b[3]*.98; const f=sph(.32,mat({color:[0xffb8e0,0xffffff,0xffd0f0,0xffe08a][i%4],roughness:.6,emissive:0x40102a}),x,y,z); t.g.add(f); t.flowers.push(f); } }); }
/* ---------- 내 소원 걸기 ---------- */
function wsHang(k,c){ if(wsToday()){ toast("오늘은 이미 소원을 걸었어요","내일 또 걸 수 있어요",1.8); return; } const it=wsItem(k); const ts=Date.now(); if(G.ws&&G.ws.ts&&!G.ws.got){ G.wsOld=(G.wsOld||[]).concat([G.ws.ts]).slice(-3); } G.ws={d:kday(),k:it.k,c,ts,got:0}; saveGame(); wsPub(); WS.dirty=true;
  const t=wsNear(); if(t){ fxRing(t.x,t.z,0xffc8f0,7,.8); fxSpark(t.x,8,t.z,0xffe08a,24); } jingle([659,784,988,1318]); toast(`🌳 소원 쪽지를 걸었어요 — ${it.ic} ${it.n} ${c}개`,"누군가 들어주면 알려 줄게요 · 꺼 둬도 괜찮아요",2.6); }
function wsPub(){ const w=wsMine(); if(!w) return; try{ net.pushRet("ws/"+G.id,{i:G.id,n:G.name,r:G.realm,k:w.k,c:w.c,ts:w.ts,d:w.d,g:w.got?1:0,b:w.by||"",sp:G.rank===0?1:0}); }catch(e){} }
/* ---------- 들어주기 ---------- */
function wsGive(id){ const w=WSO[id]; if(!w||w.g||wsGranted(id,w.ts)){ toast("이미 이루어진 소원이에요"); WS.dirty=true; return false; } if(id===G.id) return false; if(!wsNear()){ toast("소원 나무 앞에서 들어줄 수 있어요"); return false; }
  const it=wsItem(w.k); if(it.get()<w.c){ toast(`${it.ic} ${it.n}${josa(it.n,"이","가")} 모자라요`,`${w.c}개가 필요해요 · 지금 ${fmt(it.get())}개`,1.8); return false; }
  it.add(-w.c); const day=kday(); const rec={i:G.id,n:G.name,r:G.realm,o:id,ts:w.ts,k:w.k,c:w.c,d:day}; WGO[id+":"+G.id]=rec; try{ net.pushRet("wg/"+id+"/"+G.id,rec); }catch(e){}
  G.wsPet=(G.wsPet||0)+1; G.wsGive=(G.wsGive||0)+1; G.wsGiveNm=G.wsGiveNm||{}; G.wsGiveNm[id]=1; const L=G.lv; const gold=20+L*3; G.gold+=gold; saveGame(); WS.dirty=true;
  const t=wsNear(); if(t){ fxRing(t.x,t.z,0xffb8e0,8,.9); for(let k=0;k<3;k++) setTimeout(()=>fxSpark(t.x+rnd(-3,3),9+rnd(-1,2),t.z+rnd(-3,3),0xffb8e0,18),k*180); }
  jingle([784,988,1175,1568]); buzz(30); toast(`🌸 ${w.n}님의 소원을 들어줬어요!`,`친절 꽃잎 +1 (모두 ${G.wsPet}장) · 나무의 답례 금화 +${gold}`,2.6); return true; }
/* ---------- 받은 선물 · 고마워 ---------- */
function wsOnGrant(g){ const w=G.ws; if(!w||g.o!==G.id) return; G.wsGot=G.wsGot||{}; const key=g.i+":"+g.ts; if(G.wsGot[key]) return; const old=g.ts!==w.ts; if(old&&(G.wsOld||[]).indexOf(g.ts)<0) return; G.wsGot[key]=Date.now();
  const it=wsItem(g.k); it.add(g.c); if(old){ G.wsRecv=(G.wsRecv||0)+1; saveGame(); WS.q.push(g); return; } const first=!w.got; w.got=1; if(first){ w.by=g.n; w.byId=g.i; } G.wsRecv=(G.wsRecv||0)+1; saveGame(); wsPub(); WS.dirty=true; WS.q.push(g); }
function wsThank(g){ if(!g||!g.i||g.i==="spirit") return; try{ net.pushRet("wt/"+g.i+"/"+G.id,{i:G.id,n:G.name,ts:g.ts}); }catch(e){} G.wsThx=(G.wsThx||0)+1; G.wsThxd=G.wsThxd||{}; G.wsThxd[g.i+":"+g.ts]=1; saveGame(); }
function wsShowGot(g){ const it=wsItem(g.k); const sp=g.i==="spirit";
  card(`<h2>🌳 소원이 이루어졌어요!</h2><p style="font-size:17px">${sp?"🧚 <b>나무의 정령</b>이 기다리다 못해 대신 들어줬어요!":`<b style="color:${REALMS[g.r]?REALMS[g.r].c1:"#fff"}">${g.n}</b>님${REALMS[g.r]?` (${REALMS[g.r].n})`:""}이 내 소원을 들어줬어요!`}</p>
   <div class="idlegrid"><div><b>${it.ic} +${fmt(g.c)}</b><span>${it.n}</span></div><div><b>🌳</b><span>소원 나무에 꽃이 하나 더 피었어요</span></div></div>
   ${sp?"":`<button class="go" id="wsThx" style="align-self:center;font-size:20px;padding:10px 30px">🙏 고마워!</button>`}<button class="buy alt" id="wsOk" style="align-self:center">${sp?"좋아요!":"나중에"}</button>`);
  jingle([523,659,784,1046,1318]); if($("wsThx")) $("wsThx").onclick=()=>{ wsThank(g); closeLayer(); toast(`🙏 ${g.n}님에게 고마운 마음을 보냈어요`,null,1.8); tone(988,.1,"triangle"); }; $("wsOk").onclick=closeLayer; }
NETX.push({sub:"ws/+",pre:"ws/",f:(d)=>{ if(!d||!d.i||!d.ts) return; if(d.i===G.id) return; WSO[d.i]=d; WS.dirty=true; }});
NETX.push({sub:"wg/+/+",pre:"wg/",f:(d)=>{ if(!d||!d.i||!d.o||!d.ts) return; WGO[d.o+":"+d.i]=d; WS.dirty=true; if(d.o===G.id) wsOnGrant(d); }});
NETX.push({sub:()=>"wt/"+G.id+"/+",pre:"wt/",f:(d)=>{ if(!d||!d.i||d.i===G.id||!d.ts) return; G.wtSeen=G.wtSeen||{}; const key=d.i+":"+d.ts; if(G.wtSeen[key]) return; G.wtSeen[key]=1; G.wsThxGot=(G.wsThxGot||0)+1; saveGame(); setTimeout(()=>{ toast(`🙏 ${d.n}님이 고마워해요!`,"내가 들어준 소원이 이루어졌어요 🌸",2.6); tone(1175,.1,"triangle"); tone(1568,.12,"triangle",.08); },WS.q.length?3000:400); }});
/* ---------- 매 프레임 ---------- */
function wsTick(dt){ if(!started||G.realm<0) return; const tn=performance.now();
  WS.trees.forEach(t=>{ if(!t) return; const u=t.g.userData; if(u.glow) u.glow.material.opacity=.28+Math.sin(tn/700)*.1; t.notes.forEach(n=>{ n.rotation.z=Math.sin(tn/600+n.userData.sw)*.18; }); });
  WS.t-=dt; if(WS.t>0) return; WS.t=.5;
  if(WS.dirty) wsDecorate();
  if(!WS.lbl) WS.lbl=makeLabel("ally"); const t=WS.trees.find(t=>t&&Math.hypot(P.x-t.x,P.z-t.z)<32); if(t&&!layerOpen&&!(typeof TW!=="undefined"&&TW.on)){ const n=wsOpenList().length; placeLabel(WS.lbl,t.x,14,t.z,`🌳 <b>소원 나무</b>${n?` · 쪽지 ${n}장`:""}${wsBloom()?` · 🌸${wsBloom()}`:""}`); } else WS.lbl.style.display="none";
  // 받은 선물 알림 (창이 닫혀 있을 때)
  if(WS.q.length&&!layerOpen&&!P.dead){ wsShowGot(WS.q.shift()); }
  // 나무의 정령: 8시간 기다려도 아무도 안 들어주면
  WS.spT-=.5; if(WS.spT<=0){ WS.spT=30; const w=G.ws; if(w&&!w.got&&Date.now()-w.ts>WS_SPIRIT_H*3600000){ wsOnGrant({i:"spirit",n:"나무의 정령",r:-1,o:G.id,ts:w.ts,k:w.k,c:w.c,d:kday()}); } }
  WS.pubT-=.5; if(WS.pubT<=0){ WS.pubT=300; wsPub(); } }
XTICK.push(wsTick);
/* ---------- 창 ---------- */
function showWish(){ const near=wsNear(), me=wsMine(), today=wsToday(); const open=wsOpenList(); const sel=WS.sel;
  const mine=today?`<div class="row"><div class="ic">${wsItem(today.k).ic}</div><div class="t"><div>내 소원: ${wsItem(today.k).n} ${today.c}개</div><span>${today.got?`✅ ${today.by||"누군가"}님이 들어줬어요!`:`기다리는 중… ${Math.max(0,WS_SPIRIT_H-Math.floor((Date.now()-today.ts)/3600000))}시간 안에 아무도 없으면 🧚 나무의 정령이 들어줘요`}</span></div></div>`
   :`<p style="font-size:13px">무엇이 필요해요? 물건과 개수를 골라 쪽지를 걸어요 (하루 한 장)</p><div class="exgrid" id="wsPick">${WS_ITEMS.map((it,i)=>`<button class="buy${sel.k===i?"":" alt"}" data-k="${i}">${it.ic} ${it.n}</button>`).join("")}</div>
     <div class="exgrid" id="wsCnt">${WS_ITEMS[sel.k].cs.map((c,j)=>`<button class="buy${sel.c===j?"":" alt"}" data-c="${j}">${fmt(c)}개</button>`).join("")}</div>
     ${near?`<button class="go" id="wsHang" style="align-self:center;font-size:18px;padding:10px 24px">🌳 소원 쪽지 걸기 — ${WS_ITEMS[sel.k].ic} ${fmt(WS_ITEMS[sel.k].cs[sel.c])}개</button>`:`<p style="font-size:13px;color:var(--gold)">쪽지는 수도의 소원 나무 앞에서 걸 수 있어요</p>`}`;
  const rows=open.slice(0,15).map(w=>{ const it=wsItem(w.k); const have=it.get(); const R=REALMS[w.r]; return `<div class="row"><div class="ic">${it.ic}</div><div class="t"><div>${w.sp?"🌱 ":""}<b style="color:${R?R.c1:"#fff"}">${w.n}</b> · ${it.n} ${fmt(w.c)}개 필요해요</div><span>${R?R.n+" · ":""}${fmtAgo(w.ts)} · 나는 ${fmt(have)}개 있어요</span></div>${near?`<button class="buy" data-give="${w.i}" ${have>=w.c?"":"disabled"}>들어주기</button>`:""}</div>`; }).join("");
  card(`<h2>🌳 소원 나무</h2><p>필요한 재료를 쪽지에 적어 걸고, 남는 재료로 다른 사람 소원을 들어줘요. 처음 보는 사람끼리도 착한 일을 주고받아요. 오늘 이루어진 소원 <b style="color:#ffb8e0">🌸 ${wsBloom()}개</b></p>
   ${mine}
   <div class="idlegrid"><div><b>🌸 ${G.wsPet||0}</b><span>친절 꽃잎 (들어준 소원)</span></div><div><b>🙏 ${G.wsThxGot||0}</b><span>받은 고마워</span></div></div>
   <h3>🗒 기다리는 소원 쪽지</h3>${rows||'<p style="font-size:13px">지금은 걸린 쪽지가 없어요. 친구나 다른 모험가가 쪽지를 걸면 여기에 보여요.</p>'}
   ${near?"":`<button class="buy" id="wsWay" style="align-self:center">소원 나무로 길 안내</button>`}
   <p style="font-size:12px">들어주기는 "주기만" 해요 — 맞바꾸기가 아니라서 속거나 빼앗길 걱정이 없어요. 들어주면 🌸 친절 꽃잎과 나무의 답례 금화를 받아요. 🌱 표시는 처음 온 새싹이에요.</p>`);
  layers.querySelectorAll("#wsPick [data-k]").forEach(b=>b.onclick=()=>{ WS.sel={k:+b.dataset.k,c:0}; tone(660,.05); showWish(); });
  layers.querySelectorAll("#wsCnt [data-c]").forEach(b=>b.onclick=()=>{ WS.sel.c=+b.dataset.c; tone(700,.05); showWish(); });
  if($("wsHang")) $("wsHang").onclick=()=>{ const it=WS_ITEMS[WS.sel.k]; wsHang(it.k,it.cs[WS.sel.c]); showWish(); };
  layers.querySelectorAll("[data-give]").forEach(b=>b.onclick=()=>{ if(wsGive(b.dataset.give)) showWish(); });
  if($("wsWay")) $("wsWay").onclick=()=>{ const t=WS.trees[Math.max(0,G.realm)]; if(t) setGuide({x:t.x,z:t.z+5,label:"🌳 소원 나무"}); closeLayer(); }; }
function fmtAgo(ts){ const m=Math.max(0,Math.floor((Date.now()-ts)/60000)); return m<1?"방금":m<60?`${m}분 전`:`${Math.floor(m/60)}시간 전`; }
CTX_EXTRA.push(()=>wsNear()?{t:wsOpenList().length?`🌳 소원 나무 (${wsOpenList().length})`:"🌳 소원 나무",f:showWish}:null);
MENU_X.push({ic:"🌳",n:"소원 나무",id:"wsBtn",sub:()=>{ const t=wsToday(); return `${t?(t.got?"내 소원이 이루어졌어요!":"내 쪽지가 걸려 있어요"):"오늘의 소원 쪽지 걸기"} · 🌸 ${G.wsPet||0} · 기다리는 쪽지 ${wsOpenList().length}장`; },f:showWish});
const WS_DECO=DECO.length;
DECO.push({n:"작은 소원 나무",ic:"🌳",t:2,sc:15,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); g.add(cyl(.25,.4,2.2,mat({color:0x8a6040}),0,1.1,0,8)); [[0,2.8,0,1.2],[.8,2.4,.2,.8],[-.7,2.5,-.2,.8]].forEach(([x,y,z,s])=>{ const b=sph(s,mat({color:0x6fbf60}),x,y,z); b.scale.y*=.8; g.add(b); }); [[.5,3.2,.6],[-.6,2.9,.5],[.2,2.3,-.9]].forEach(([x,y,z])=>g.add(sph(.18,mat({color:0xffb8e0,emissive:0x40102a}),x,y,z))); return g; }});
(function(){ let given=false; XTICK.push(()=>{ if(given||!started) return; if((G.wsPet||0)>=5&&!G.wsDeco){ given=true; G.wsDeco=1; try{ hmAdd(WS_DECO,"소원 나무가 고마워서"); }catch(e){} saveGame(); } else if(G.wsDeco) given=true; }); })();
TITLES.push({id:"ws1",n:"소원을 들어준 신",t:1,h:"다른 사람의 소원 들어주기",g:()=>[G.wsGive||0,1]},{id:"ws10",n:"친절한 꽃잎",t:2,h:"소원 10번 들어주기 (친절 꽃잎 10장)",g:()=>[G.wsPet||0,10]},{id:"ws30",n:"꽃피우는 손",t:3,h:"소원 30번 들어주기",g:()=>[G.wsPet||0,30]},{id:"wsthx",n:"고마운 사람",t:1,h:"🙏 고마워 5번 받기",g:()=>[G.wsThxGot||0,5]});
</script>
