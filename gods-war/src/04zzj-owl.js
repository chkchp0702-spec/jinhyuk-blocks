<script>
/* ================= v118-1: 🦉 아테나의 부엉이 편지 — 꺼 둔 친구에게 날아가는 작은 선물 (IDEAS G11/12-1) =================
   메뉴 🦉(또는 모험가 명부의 「🦉 부엉이 편지」) → 받을 사람 고르기(접속 중 친구 + 명부에 있는 모험가) → 정해진 말 카드 1장 + 스티커 1개 + 선물 1개(없어도 됨).
   - 자유 글 없음(모르는 사람과도 안전). 하루 3통(「고마워」 답장은 따로 하루 10통).
   - 받는 사람이 꺼져 있어도 보관(retained) 주제 owl/<받는 id>/<보낸 id> 에 남아 있다가, 다음에 켜면 부엉이가 퍼덕퍼덕 날아와 편지를 펼쳐 줌.
     같은 사람에게 보낸 최근 3통을 한 묶음으로 올림 → 받는 쪽은 편지 id 로 한 번만 받음(G.owlSeen).
   - 선물은 보낼 때 내 가방에서 빠지고, 받는 사람이 편지를 펼칠 때 들어감.
   - 「💌 고마워」 답장이 오가면 둘 다 🪶 우정 깃털 +1 → 깃털 10개: 신전 장식 «아테나의 부엉이 횃대», 칭호 3개.
   저장: G.owlSeen{id:1} · G.owlOut{받는id:[편지]} · G.owlBox[받은 편지 20] · G.owlDay{d,n,th} · G.owlF(깃털) · G.owlSent · G.owlGot · G.owlDeco · G.owlThx{편지id:1} */
const OWL_DAY=3, OWL_THX=10, OWL_KEEP=14*86400000;
const OWL_SAY=["같이 놀자! 🎮","고마워! 💛","보스 잡으러 와! ⚔","대단해! 👏","잘 자! 🌙","축하해! 🎉","보고 싶어! 🌈","오늘도 힘내! 💪"];
const OWL_STK=["🦉","⭐","🌸","🍯","⚡","🐣","🍀","👑"];
const OWL_GIFT=[{k:"",n:"선물 없음",ic:"✉"},
 {k:"pot",n:"물약 1개",ic:"🧪",has:()=>(G.pots||0)>=1,take:()=>{ G.pots--; },give:()=>{ G.pots=(G.pots||0)+1; }},
 {k:"ore",n:"쇳조각 2개",ic:"⛓",has:()=>(G.ore||0)>=2,take:()=>{ G.ore-=2; },give:()=>{ G.ore=(G.ore||0)+2; }},
 {k:"rune",n:"룬 가루 1개",ic:"✨",has:()=>(G.rune||0)>=1,take:()=>{ G.rune--; },give:()=>{ G.rune=(G.rune||0)+1; }},
 {k:"gold",n:"금화 100",ic:"💰",has:()=>(G.gold||0)>=100,take:()=>{ G.gold-=100; },give:()=>{ G.gold=(G.gold||0)+100; }}];
const OWL={q:[],qd:{},fly:null,mesh:null,to:null,say:0,stk:0,gift:0,t:0};
function owlEsc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])).slice(0,24); }
function owlDay(){ const d=kday(); if(!G.owlDay||G.owlDay.d!==d) G.owlDay={d,n:0,th:0}; return G.owlDay; }
function owlSeen(){ return G.owlSeen=G.owlSeen||{}; }
function owlNameOf(id){ const o=PEERS[id]; if(o) return o.name; const p=ROSTER[id]; return p?p.n:"모험가"; }
function owlRealmOf(id){ const o=PEERS[id]; if(o) return o.realm; const p=ROSTER[id]; return p&&p.r>=0?p.r:0; }
/* ---------- 받기 ---------- */
NETX.push({sub:()=>"owl/"+G.id+"/+",pre:"owl/",f:(d,topic)=>{ if(!d||typeof d!=="object"||d.to!==G.id||!d.i||d.i===G.id) return; const parts=String(topic||"").split("/"); if(parts[1]!==G.id||parts[2]!==d.i) return;
  const L=Array.isArray(d.L)?d.L.slice(-3):[]; const S=owlSeen(); const now=Date.now();
  L.forEach(l=>{ if(!l||typeof l.id!=="string"||l.id.indexOf(d.i+"-")!==0) return; if(S[l.id]||OWL.qd[l.id]) return; const ts=+l.ts||0; if(!(ts>0)||now-ts>OWL_KEEP||ts>now+600000) return;
    OWL.qd[l.id]=1; OWL.q.push({id:l.id,ts,i:d.i,n:owlEsc(d.n||"모험가"),r:clamp(d.r|0,0,3),m:clamp(l.m|0,0,OWL_SAY.length-1),s:clamp(l.s|0,0,OWL_STK.length-1),g:clamp(l.g|0,0,OWL_GIFT.length-1),th:l.th?1:0,re:typeof l.re==="string"?l.re.slice(0,60):""}); });
  OWL.q.sort((a,b)=>a.ts-b.ts); }});
/* ---------- 보내기 ---------- */
function owlSend(to,m,s,g,th,re){ if(!to||to===G.id) return false; const D=owlDay(); if(th){ if(D.th>=OWL_THX){ toast("오늘 답장은 다 보냈어요","내일 또 보내요",1.6); return false; } } else if(D.n>=OWL_DAY){ toast(`오늘 편지 ${OWL_DAY}통을 다 보냈어요`,"내일 부엉이가 또 쉬고 와요",1.8); return false; }
  const GF=OWL_GIFT[g]||OWL_GIFT[0]; if(!th&&GF.k&&!GF.has()){ toast(`${GF.ic} ${GF.n}이(가) 모자라요`,null,1.4); return false; } if(th) g=0;
  if(!th&&GF.k) GF.take();
  const l={id:G.id+"-"+Date.now(),ts:Date.now(),m,s,g,th:th?1:0}; if(re) l.re=re;
  G.owlOut=G.owlOut||{}; const arr=(G.owlOut[to]||[]).filter(x=>Date.now()-x.ts<OWL_KEEP); arr.push(l); G.owlOut[to]=arr.slice(-3);
  const ks=Object.keys(G.owlOut); if(ks.length>40){ ks.sort((a,b)=>((G.owlOut[a].slice(-1)[0]||{}).ts||0)-((G.owlOut[b].slice(-1)[0]||{}).ts||0)); ks.slice(0,ks.length-40).forEach(k=>delete G.owlOut[k]); }
  try{ net.pushRet("owl/"+to+"/"+G.id,{i:G.id,n:G.name,r:G.realm,to,L:G.owlOut[to]}); }catch(e){}
  if(th){ D.th++; G.owlF=(G.owlF||0)+1; owlDecoCheck(); } else { D.n++; G.owlSent=(G.owlSent||0)+1; }
  saveGame(); owlLaunch(); jingle([659,784,988,1318]); return true; }
function owlDecoCheck(){ if((G.owlF||0)>=10&&!G.owlDeco&&typeof OWL_DECO==="number"){ G.owlDeco=1; try{ hmAdd(OWL_DECO,"🪶 우정 깃털 10개로"); }catch(e){} } }
/* ---------- 부엉이 모습 ---------- */
function owlMesh(){ const g=new THREE.Group(); const br=mat({color:0x8a6040,roughness:.95}), lt=mat({color:0xe8d4b0,roughness:1}), wh=mat({color:0xffffff}), bk=mat({color:0x1a1410}), ye=mat({color:0xf2b21a});
  const body=sph(.55,br,0,0,0); body.scale.set(1,1.15,.95); g.add(body); const belly=sph(.42,lt,0,-.08,.22); belly.scale.set(1,1.1,.6); g.add(belly);
  const head=new THREE.Group(); head.position.y=.62; g.add(head); head.add(sph(.42,br,0,0,0)); [-1,1].forEach(s=>{ head.add(sph(.16,wh,s*.17,.04,.33)); head.add(sph(.08,bk,s*.17,.04,.43)); const ear=box(.1,.24,.08,br,s*.26,.36,0); ear.rotation.z=-s*.35; head.add(ear); });
  const bk2=new THREE.Mesh(new THREE.ConeGeometry(.07,.18,6),ye); bk2.rotation.x=Math.PI/2+.4; bk2.position.set(0,-.08,.42); head.add(bk2);
  const wings=[]; [-1,1].forEach(s=>{ const pv=new THREE.Group(); pv.position.set(s*.42,.18,0); const w=box(.9,.12,.6,br,s*.45,0,0); pv.add(w); const tip=box(.4,.1,.45,lt,s*.85,-.02,0); pv.add(tip); g.add(pv); wings.push({pv,s}); });
  [-1,1].forEach(s=>g.add(box(.08,.18,.08,ye,s*.15,-.66,.08)));
  const letter=box(.62,.04,.42,mat({color:0xfff6dc}),0,-.82,.1); g.add(letter); const seal=sph(.08,mat({color:0xd8303a}),0,-.79,.12); seal.scale.y=.4; g.add(seal);
  g.userData={head,wings,letter,seal}; shadowify(g); return g; }
function owlLaunch(){ /* 보낼 때: 내 곁에서 부엉이가 날아올라 멀리 감 */ const m=owlMesh(); m.userData.letter.visible=true; m.position.set(P.x+1.2,hAt(P.x,P.z)+2.6,P.z+.6); scene.add(m); OWL.fly={m,t:0,k:"out",x0:m.position.x,y0:m.position.y,z0:m.position.z,dx:rnd(-1,1),dz:-1}; fxSpark(P.x,2.4,P.z,0xfff0c0,16); }
function owlArrive(l){ const m=owlMesh(); const a=Math.random()*6.283; const x0=P.x+Math.cos(a)*30, z0=P.z+Math.sin(a)*30, y0=hAt(P.x,P.z)+24; m.position.set(x0,y0,z0); scene.add(m); OWL.fly={m,t:0,k:"in",x0,y0,z0,l}; tone(740,.12,"sine",0,.08); tone(620,.16,"sine",.18,.08); }
function owlTickFly(dt){ const f=OWL.fly; if(!f) return; f.t+=dt; const m=f.m, u=m.userData; const flap=Math.sin(f.t*(f.k==="hover"?14:18)); u.wings.forEach(w=>w.pv.rotation.z=w.s*flap*.9);
  if(f.k==="in"){ const T=2.2, k=Math.min(1,f.t/T), e=1-Math.pow(1-k,3); const tx=P.x+1.4, tz=P.z+.8, ty=hAt(P.x,P.z)+3.4; m.position.set(f.x0+(tx-f.x0)*e,f.y0+(ty-f.y0)*e+Math.sin(k*Math.PI)*3,f.z0+(tz-f.z0)*e); m.rotation.y=Math.atan2(tx-f.x0,tz-f.z0)*(1-k)+Math.atan2(P.x-m.position.x,P.z-m.position.z)*k;
    if(k>=1){ f.k="hover"; f.t=0; fxSpark(m.position.x,0,m.position.z,0xfff0c0,18); jingle([784,988,1175]); } }
  else if(f.k==="hover"){ m.position.y=hAt(P.x,P.z)+3.4+Math.sin(f.t*5)*.15; m.position.x=P.x+1.4; m.position.z=P.z+.8; u.head.rotation.z=Math.sin(f.t*3)*.25;
    if(f.t>.7&&!f.shown){ f.shown=true; u.letter.visible=false; u.seal.visible=false; owlOpen(f.l); } if(f.shown&&!layerOpen){ f.k="out"; f.t=0; f.x0=m.position.x; f.y0=m.position.y; f.z0=m.position.z; f.dx=rnd(-1,1); f.dz=rnd(-1,1); } }
  else if(f.k==="out"){ const k=Math.min(1,f.t/2.2); m.position.set(f.x0+f.dx*k*30,f.y0+k*k*26,f.z0+(f.dz||-1)*k*30); m.rotation.y=Math.atan2(f.dx,f.dz||-1); if(k>=1){ scene.remove(m); OWL.fly=null; } } }
/* ---------- 편지 펼치기 ---------- */
function owlOpen(l){ const S=owlSeen(); if(S[l.id]) return; S[l.id]=1; const ks=Object.keys(S); if(ks.length>200){ ks.slice(0,ks.length-200).forEach(k=>delete S[k]); }
  const GF=OWL_GIFT[l.g]||OWL_GIFT[0]; if(!l.th&&GF.k) GF.give(); if(l.th){ G.owlF=(G.owlF||0)+1; owlDecoCheck(); } G.owlGot=(G.owlGot||0)+1;
  G.owlBox=(G.owlBox||[]).concat([{i:l.i,n:l.n,r:l.r,m:l.m,s:l.s,g:l.g,th:l.th,ts:l.ts,id:l.id}]).slice(-20); saveGame();
  const R=REALMS[l.r]||REALMS[0];
  card(`<div style="text-align:center"><div style="font-size:54px;line-height:1.1">${OWL_STK[l.s]}</div>
   <h2 style="margin:6px 0">🦉 ${l.th?"고마워 답장이":"부엉이 편지가"} 왔어요!</h2>
   <p style="margin:2px 0"><b style="color:${R.c1}">${R.icon} ${l.n}</b> 님이 보냈어요 · ${owlAgo(l.ts)}</p>
   <div style="margin:10px auto;padding:14px 16px;max-width:340px;border-radius:14px;background:linear-gradient(#fff8e4,#f4e2b8);color:#5a3a1a;font-size:22px;font-weight:900;box-shadow:0 4px 0 #c8a060">${OWL_SAY[l.m]}</div>
   ${l.th?`<p>🪶 우정 깃털 +1 (지금 ${G.owlF||0}개)</p>`:GF.k?`<p>🎁 선물: <b>${GF.ic} ${GF.n}</b> 받았어요!</p>`:""}</div>
   <div class="exgrid">${l.th?"":`<button class="buy" id="owTh">💌 고마워 답장</button>`}<button class="buy alt" id="owRe">🦉 나도 편지 쓰기</button></div>`);
  const th=$("owTh"); if(th) th.onclick=()=>{ G.owlThx=G.owlThx||{}; if(G.owlThx[l.id]){ toast("벌써 답장했어요"); return; } if(owlSend(l.i,1,0,0,1,l.id)){ G.owlThx[l.id]=1; const k2=Object.keys(G.owlThx); if(k2.length>100) k2.slice(0,k2.length-100).forEach(k=>delete G.owlThx[k]); saveGame(); toast("💌 고마워 답장을 보냈어요",`🪶 우정 깃털 +1 (${G.owlF}개)`,2); closeLayer(); } };
  $("owRe").onclick=()=>owlCompose(l.i);
  buzz([20,40,20]); }
function owlAgo(ts){ const m=Math.max(0,(Date.now()-ts)/60000); if(m<1) return "방금"; if(m<60) return `${Math.round(m)}분 전`; if(m<1440) return `${Math.round(m/60)}시간 전`; return `${Math.round(m/1440)}일 전`; }
/* ---------- 창 ---------- */
function owlPeople(){ const L=[]; const seen={}; for(const id in PEERS){ const o=PEERS[id]; seen[id]=1; L.push({id,n:owlEsc(o.name),r:o.realm,on:1,t:Date.now()}); }
  for(const id in ROSTER){ if(seen[id]||id===G.id) continue; const p=ROSTER[id]; if(!p||Date.now()-(p.t||0)>30*86400000||!(p.r>=0)) continue; L.push({id,n:owlEsc(p.n),r:p.r,on:0,t:p.t||0}); }
  L.sort((a,b)=>b.on-a.on||b.t-a.t); return L.slice(0,30); }
function showOwl(){ const D=owlDay(); const L=owlPeople(); const box=(G.owlBox||[]).slice().reverse();
  card(`<h2>🦉 아테나의 부엉이 편지</h2><p>친구가 게임을 꺼 둬도 괜찮아요! 부엉이가 편지를 들고 기다렸다가, 친구가 다음에 켜면 퍼덕퍼덕 날아가 펼쳐 줘요. 정해진 말 카드 + 스티커 + 작은 선물 하나를 담을 수 있어요.</p>
   <div class="idlegrid"><div><b>✉ ${Math.max(0,OWL_DAY-D.n)}/${OWL_DAY}</b><span>오늘 보낼 수 있는 편지</span></div><div><b>🪶 ${G.owlF||0}</b><span>우정 깃털${(G.owlF||0)<10?` (10개면 신전 장식!)`:""}</span></div><div><b>📬 ${G.owlGot||0}</b><span>받은 편지</span></div></div>
   <h3>누구에게 보낼까요?</h3>
   ${L.length?L.map(p=>{ const R=REALMS[p.r]||REALMS[0]; return `<div class="row"><div class="ic" style="color:${R.c1}">${R.icon}</div><div class="t"><div>${p.n} ${p.on?'<i class="st on">접속 중</i>':'<i class="st">💤 쉬는 중</i>'}</div><span>${R.n}${p.on?"":` · ${owlAgo(p.t)} 접속`}</span></div><button class="buy" data-ow="${p.id}" ${D.n>=OWL_DAY?"disabled":""}>✉ 쓰기</button></div>`; }).join(""):`<p style="font-size:13px">아직 아는 모험가가 없어요. 사냥터·놀이 마당에서 친구를 만나면 여기에 나와요.</p>`}
   <h3>📬 받은 편지함</h3>${box.length?box.map(b=>{ const R=REALMS[b.r]||REALMS[0]; return `<div class="row"><div class="ic">${OWL_STK[b.s]||"🦉"}</div><div class="t"><div><b style="color:${R.c1}">${owlEsc(b.n)}</b> · ${OWL_SAY[b.m]||""}</div><span>${b.th?"💌 고마워 답장":OWL_GIFT[b.g]&&OWL_GIFT[b.g].k?`🎁 ${OWL_GIFT[b.g].ic} ${OWL_GIFT[b.g].n}`:"✉ 편지"} · ${owlAgo(b.ts)}</span></div></div>`; }).join(""):`<p style="font-size:13px">아직 받은 편지가 없어요.</p>`}
   <p style="font-size:12px">하루 ${OWL_DAY}통 · 「💌 고마워」 답장이 오가면 둘 다 🪶 우정 깃털 +1 · 자유 글은 없어서 처음 만난 사람과도 안전해요.</p>`);
  layers.querySelectorAll("[data-ow]").forEach(b=>b.onclick=()=>owlCompose(b.dataset.ow)); }
function owlCompose(to){ OWL.to=to; const nm=owlEsc(owlNameOf(to)), R=REALMS[owlRealmOf(to)]||REALMS[0]; const D=owlDay();
  if(D.n>=OWL_DAY){ toast(`오늘 편지 ${OWL_DAY}통을 다 보냈어요`,"내일 또 보내요",1.8); return; }
  const pick=(arr,cur,key)=>arr.map((x,i)=>`<button class="buy${i===cur?"":" alt"}" data-${key}="${i}">${x}</button>`).join("");
  card(`<h2>✉ <b style="color:${R.c1}">${nm}</b> 님에게 편지</h2>
   <h3>💬 말 카드</h3><div class="exgrid">${pick(OWL_SAY,OWL.say,"om")}</div>
   <h3>🌟 스티커</h3><div class="exgrid">${pick(OWL_STK,OWL.stk,"os")}</div>
   <h3>🎁 선물 (내 가방에서 빠져요)</h3><div class="exgrid">${OWL_GIFT.map((g,i)=>{ const ok=!g.k||g.has(); return `<button class="buy${i===OWL.gift?"":" alt"}" data-og="${i}" ${ok?"":"disabled"}>${g.ic} ${g.n}</button>`; }).join("")}</div>
   <div style="margin:8px auto;padding:10px 14px;max-width:320px;border-radius:12px;background:linear-gradient(#fff8e4,#f4e2b8);color:#5a3a1a;font-weight:900;text-align:center"><span style="font-size:30px">${OWL_STK[OWL.stk]}</span><br>${OWL_SAY[OWL.say]}<br><small>${OWL_GIFT[OWL.gift].ic} ${OWL_GIFT[OWL.gift].n}</small></div>
   <button class="go" id="owGo" style="align-self:center">🦉 부엉이야, 날아가!</button>`);
  layers.querySelectorAll("[data-om]").forEach(b=>b.onclick=()=>{ OWL.say=+b.dataset.om; owlCompose(to); });
  layers.querySelectorAll("[data-os]").forEach(b=>b.onclick=()=>{ OWL.stk=+b.dataset.os; owlCompose(to); });
  layers.querySelectorAll("[data-og]").forEach(b=>b.onclick=()=>{ OWL.gift=+b.dataset.og; owlCompose(to); });
  $("owGo").onclick=()=>{ const g=OWL.gift; const GF=OWL_GIFT[g]; if(GF.k&&!GF.has()){ OWL.gift=0; owlCompose(to); return; } if(owlSend(to,OWL.say,OWL.stk,g,0)){ closeLayer(); toast(`🦉 ${nm} 님에게 편지가 날아가요!`,PEERS[to]?"지금 바로 받아요":"다음에 켜면 부엉이가 찾아가요",2.4); OWL.gift=0; } }; }
/* ---------- 매 프레임 ---------- */
function owlTick(dt){ owlTickFly(dt); if(!started||OWL.fly) return; OWL.t-=dt; if(OWL.t>0) return; OWL.t=.5;
  if(!OWL.q.length||layerOpen||P.dead||P.trial) return; if(typeof HS!=="undefined"&&HS.m) return; if(typeof PG!=="undefined"&&PG.m) return; if(typeof AR!=="undefined"&&AR.f) return;
  const l=OWL.q.shift(); if(owlSeen()[l.id]) return; owlArrive(l); }
XTICK.push(owlTick);
/* ---------- 메뉴 · 명부 · 장식 · 칭호 ---------- */
MENU_X.push({ic:"🦉",n:"부엉이 편지",id:"owlBtn",sub:()=>{ const D=owlDay(); return `${OWL.q.length?`📬 새 편지 ${OWL.q.length}통 · `:""}오늘 ${Math.max(0,OWL_DAY-D.n)}/${OWL_DAY}통 · 🪶 ${G.owlF||0}`; },f:showOwl});
(function(){ const _sr=showRoster; showRoster=function(){ _sr(); try{ const b=$("toChat"); if(b){ const ob=document.createElement("button"); ob.className="buy"; ob.id="owlRB"; ob.style.alignSelf="center"; ob.textContent="🦉 부엉이 편지"; ob.onclick=showOwl; b.parentNode.insertBefore(ob,b); } }catch(e){} }; })();
const OWL_DECO=DECO.length;
DECO.push({n:"아테나의 부엉이 횃대",ic:"🦉",t:2,sc:12,p:0,trophy:1,mk:r=>{ const g=new THREE.Group(); const wd=mat({color:0x7a5236}); g.add(cyl(.12,.16,2.6,wd,0,1.3,0,8)); const bar=box(1.6,.14,.14,wd,0,2.55,0); g.add(bar); g.add(cyl(.5,.6,.2,wd,0,.1,0,12)); const o=owlMesh(); o.userData.letter.visible=false; o.userData.seal.visible=false; o.scale.setScalar(.7); o.position.set(0,3.15,0); g.add(o); return g; }});
TITLES.push({id:"ow1",n:"부엉이 친구",t:1,h:"🦉 편지 10통 보내기",g:()=>[G.owlSent||0,10]},{id:"ow2",n:"우정 깃털",t:2,h:"🪶 우정 깃털 10개",g:()=>[G.owlF||0,10]},{id:"ow3",n:"아테나의 우체부",t:3,h:"🪶 우정 깃털 50개",g:()=>[G.owlF||0,50]});
</script>
