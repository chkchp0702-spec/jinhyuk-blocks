<script>
/* ================= v89-2: 🪧 길 위의 돌 표지판 — 모르는 사람에게 남기는 도움말 (IDEAS G11/9-5) =================
   하루 3개까지 아무 데나 표지판을 세움. 글자는 안 치고 정해진 말 하나 + 그림말(이모티콘) 하나만 고름 → 나쁜 말 걱정 없음.
   표지판은 보관 메시지(sg/<내 아이디>/<칸>)로 남아서, 나중에 지나가는 다른 사람 모두에게 보임(게임을 꺼 둬도).
   다른 사람이 누르면 「👍 고마워요」(보관 sgl/<표지판>/<누른 사람>) → 꺼 둬도 쌓이고, 다음에 들어오면 "표지판이 N명을 도왔어요!" + 금화.
   👍 5개 넘으면 금빛 표지판(7일 동안), 보통은 3일 뒤 사라짐. 내 표지판 칸은 12개를 돌려 씀(가장 오래된 것부터 바뀜).
   저장: G.sgDay={d,n}(오늘 세운 수) · G.sgSeq · G.sgL{표지판:보상 받은 👍 수} · G.sgHelp(도운 사람 수) · G.sgThx(내가 누른 👍 수). 칭호 3개. */
const SG_SAY=["여기 보물!","조심, 센 괴물!","점프해 봐!","쉬어 가요","멋진 경치!","이쪽으로 가요 ➜","바람 기둥 있어요","같이 사냥해요!","힘내요!","비밀 장소!"];
const SG_EMO=["😀","😮","💪","⭐","❤️","🔥","🐉","🌈"];
const SG_DAY=3, SG_SLOTS=12, SG_GOLDN=5, SG_MAXN=3;
const SG={list:{},likes:{},near:null,lbls:[],pend:0,pendT:0,t:0,maxShow:60};
function sgKey(s){ return s.i+"_"+s.k+"_"+s.ts; }
function sgLikes(key){ const L=SG.likes[key]; return L?L.size:0; }
function sgAlive(s){ if(!s||!s.ts) return false; const age=Date.now()-s.ts; return age<SG_DAY*86400000||(age<7*86400000&&sgLikes(sgKey(s))>=SG_GOLDN); }
function sgToday(){ const d=kday(); if(!G.sgDay||G.sgDay.d!==d) G.sgDay={d,n:0}; return G.sgDay; }
/* ---------- 보관 메시지 받기 ---------- */
NETX.push({sub:"sg/+/+",pre:"sg/",f:(d,topic)=>{ const a=String(topic).split("/"); const id=a[1], k=+a[2]; const slot=id+"/"+k; const old=SG.list[slot];
  if(!d||!d.ts||d.m==null){ if(old) sgDrop(slot); return; } if(old&&old.ts===d.ts) return; if(old) sgDrop(slot);
  const s={i:id,k,ts:+d.ts,x:+d.x,z:+d.z,m:Math.max(0,Math.min(SG_SAY.length-1,d.m|0)),e:Math.max(0,Math.min(SG_EMO.length-1,d.e|0)),n:String(d.n||"?").slice(0,8),r:d.r|0,mesh:null,gold:false};
  if(!isFinite(s.x)||!isFinite(s.z)) return; SG.list[slot]=s; }});
NETX.push({sub:"sgl/+/+",pre:"sgl/",f:(d,topic)=>{ const a=String(topic).split("/"); const key=a[1], who=a[2]; if(!key||!who||!d) return; let L=SG.likes[key]; if(!L) L=SG.likes[key]=new Set(); if(L.has(who)) return; L.add(who);
  if(key.indexOf(G.id+"_")===0&&who!==G.id){ G.sgL=G.sgL||{}; const got=G.sgL[key]||0; const n=L.size-(L.has(G.id)?1:0); if(n>got){ G.sgL[key]=n; SG.pend+=n-got; SG.pendT=1.6; } } }});
function sgPay(){ const n=SG.pend; SG.pend=0; if(n<=0) return; const g=(30+G.lv*3)*n; G.gold+=g; G.sgHelp=(G.sgHelp||0)+n; saveGame();
  try{ COINFLY.burst(P.x,1.6,P.z,Math.min(10,3+n)); }catch(e){} jingle([659,784,988,1318]); buzz([20,30,20]);
  try{ lvBanner("🪧 고마워요!",`표지판이 ${n}명을 도왔어요`,`금화 +${fmt(g)} · 지금까지 도운 사람 ${fmt(G.sgHelp)}명`,"#9dffb8"); }catch(e){ toast(`🪧 표지판이 ${n}명을 도왔어요!`,`금화 +${fmt(g)}`,3); } }
/* ---------- 모양 ---------- */
function sgModel(gold){ const g=new THREE.Group(); const stone=mat({color:0x8d8a84,roughness:1}), wood=mat({color:0x8a5a34,roughness:.9}), dark=mat({color:0x5a3820,roughness:.95});
  const board=gold?mat({color:0xffd24a,roughness:.35,metalness:.5,emissive:0x6a4a00}):mat({color:0xd9b98a,roughness:.9});
  g.add(cyl(.55,.7,.4,stone,0,.2,0,9)); g.add(cyl(.09,.11,2.2,dark,0,1.3,0,7)); g.add(box(1.5,.8,.12,board,0,2.15,0)); g.add(box(1.62,.12,.16,wood,0,2.58,0)); g.add(box(1.62,.12,.16,wood,0,1.72,0));
  if(gold){ const r=new THREE.Mesh(GEO.ring,glowMat(0xffd24a,.6)); r.rotation.x=-Math.PI/2; r.scale.setScalar(1.6); r.position.y=.12; r.userData.noOutline=true; g.add(r); g.userData.ring=r; }
  return shadowify(g); }
function sgDrop(slot){ const s=SG.list[slot]; if(s&&s.mesh){ scene.remove(s.mesh); s.mesh=null; } delete SG.list[slot]; }
/* ---------- 세우기 ---------- */
function sgWhereOk(){ if(!started||G.realm<0||P.dead) return "지금은 세울 수 없어요"; if(typeof glAway==="function"&&glAway()) return "따로 된 곳(미궁·섬·탑 등)에서는 못 세워요"; if(!evOver()) return "여기서는 못 세워요";
  if(typeof GI!=="undefined"&&GI.gy>0.5) return "땅 위에서만 세울 수 있어요"; for(const k in SG.list){ const s=SG.list[k]; if(sgAlive(s)&&Math.hypot(s.x-P.x,s.z-P.z)<5) return "가까이에 다른 표지판이 있어요 — 조금 떨어져서 세워요"; } return ""; }
function sgPlace(m,e){ const T=sgToday(); if(T.n>=SG_MAXN){ toast("오늘은 표지판을 다 세웠어요","내일 또 3개를 세울 수 있어요",2); return; } const why=sgWhereOk(); if(why){ toast("🪧 "+why,null,2); return; }
  const k=(G.sgSeq=(G.sgSeq||0)+1)%SG_SLOTS; T.n++; const d={x:+P.x.toFixed(1),z:+P.z.toFixed(1),m,e,n:G.name,r:G.realm,ts:Date.now()};
  try{ net.pushRet("sg/"+G.id+"/"+k,d); }catch(e){} const slot=G.id+"/"+k; if(SG.list[slot]) sgDrop(slot); SG.list[slot]={i:G.id,k,ts:d.ts,x:d.x,z:d.z,m,e,n:G.name,r:G.realm,mesh:null,gold:false};
  saveGame(); closeLayer(); fxRing(P.x,P.z,0xffe08a,4,.5); fxSpark(P.x,2,P.z,0xffe08a,16); jingle([523,659,784]); toast(`🪧 표지판을 세웠어요 — ${SG_SAY[m]} ${SG_EMO[e]}`,`지나가는 사람이 👍 누르면 꺼 둬도 금화가 쌓여요 · 오늘 ${T.n}/${SG_MAXN}`,3); }
function sgLike(s){ const key=sgKey(s); let L=SG.likes[key]; if(!L) L=SG.likes[key]=new Set(); if(L.has(G.id)||s.i===G.id) return; L.add(G.id);
  try{ net.pushRet("sgl/"+key+"/"+G.id,{ts:Date.now()}); }catch(e){} G.sgThx=(G.sgThx||0)+1; const xp=Math.round(xpNeed(G.lv)*.004)+5; gainXp(xp); saveGame();
  const y=2.6; fxSpark(s.x,y,s.z,0x9dffb8,14); floatDmg(s.x,3.4,s.z,"👍 고마워요!","gain"); jingle([784,988]); buzz(15); toast(`👍 ${s.n}님의 표지판에 고마워요!`,`${s.n}님에게 금화가 가요 · 나도 경험치 +${fmt(xp)}`,2); }
/* ---------- 매 프레임 ---------- */
function sgTick(dt){ if(!started||G.realm<0) return; if(!SG.pruned){ SG.pruned=1; const L=G.sgL||{}; for(const k in L){ const ts=+String(k).split("_").pop(); if(!(Date.now()-ts<8*86400000)) delete L[k]; } } if(SG.pendT>0){ SG.pendT-=dt; if(SG.pendT<=0&&!layerOpen&&!P.dead) sgPay(); else if(SG.pendT<=0) SG.pendT=1; }
  SG.t-=dt; const away=(typeof glAway==="function"&&glAway())||!evOver();
  if(SG.t<=0){ SG.t=.5; const arr=[]; for(const slot in SG.list){ const s=SG.list[slot]; if(!sgAlive(s)){ sgDrop(slot); continue; } s.d=Math.hypot(s.x-P.x,s.z-P.z); arr.push(s); }
    arr.sort((a,b)=>a.d-b.d); arr.forEach((s,i)=>{ const want=!away&&i<SG.maxShow&&s.d<130; const gold=sgLikes(sgKey(s))>=SG_GOLDN;
      if(want&&(!s.mesh||s.gold!==gold)){ if(s.mesh) scene.remove(s.mesh); s.gold=gold; s.mesh=sgModel(gold); s.mesh.position.set(s.x,hAt(s.x,s.z),s.z); s.mesh.rotation.y=((s.ts%628)/100); scene.add(s.mesh); }
      else if(!want&&s.mesh){ scene.remove(s.mesh); s.mesh=null; } });
    SG.near=null; if(!away&&!P.dead){ const n=arr.find(s=>s.d<4.5&&s.i!==G.id&&!(SG.likes[sgKey(s)]&&SG.likes[sgKey(s)].has(G.id))); SG.near=n||null; }
    SG.vis=arr.filter(s=>s.mesh&&s.d<24).slice(0,4); }
  for(const slot in SG.list){ const s=SG.list[slot]; if(s.mesh&&s.mesh.userData.ring){ s.mesh.userData.ring.rotation.z+=dt; } }
  const vis=away||layerOpen?[]:(SG.vis||[]); while(SG.lbls.length<4) SG.lbls.push(makeLabel("ally"));
  SG.lbls.forEach((l,i)=>{ const s=vis[i]; if(!s){ l.style.display="none"; return; } const n=sgLikes(sgKey(s)); const mine=s.i===G.id;
    placeLabel(l,s.x,3.3,s.z,`${s.gold?"✨":""}🪧 <b>${SG_SAY[s.m]} ${SG_EMO[s.e]}</b><span style="font-size:11px;opacity:.85"> ${mine?"내 표지판":s.n}${n?` · 👍${n}`:""}</span>`); }); }
XTICK.push(sgTick);
CTX_EXTRA.push(()=>SG.near?{t:`👍 고마워요 · ${SG_SAY[SG.near.m]}`,f:()=>{ const s=SG.near; SG.near=null; if(s) sgLike(s); }}:null);
MAP_X.push((ctx,tx,tz,big,u)=>{ if(!evOver()) return; for(const slot in SG.list){ const s=SG.list[slot]; if(!sgAlive(s)) continue; const X=tx(s.x), Z=tz(s.z); const gold=sgLikes(sgKey(s))>=SG_GOLDN, mine=s.i===G.id;
  if(gold||mine) mapPin(ctx,X,Z,(big?3.6:4.6)*u,gold?"#e0a020":"#4a9a5a","🪧"); else { ctx.beginPath(); ctx.arc(X,Z,1.8*u,0,6.2832); ctx.fillStyle="#c8a070"; ctx.fill(); } } });
/* ---------- 창 ---------- */
function showSigns(){ const T=sgToday(); let pick={m:0,e:0}; const mine=Object.values(SG.list).filter(s=>s.i===G.id&&sgAlive(s)).sort((a,b)=>b.ts-a.ts);
  const why=sgWhereOk(); const left=SG_MAXN-T.n;
  card(`<h2>🪧 길 위의 돌 표지판</h2><p>지금 서 있는 자리에 표지판을 세워요. 글자는 안 치고 <b>말 하나 + 그림말 하나</b>만 골라요. 지나가는 다른 사람이 <b>👍 고마워요</b>를 누르면, 게임을 꺼 둬도 금화가 쌓여요!</p>
   <h3>💬 말 고르기</h3><div class="exgrid" id="sgM">${SG_SAY.map((s,i)=>`<button class="buy${i?" alt":""}" data-m="${i}">${s}</button>`).join("")}</div>
   <h3>😀 그림말 고르기</h3><div class="exgrid" id="sgE">${SG_EMO.map((s,i)=>`<button class="buy${i?" alt":""}" data-e="${i}" style="font-size:20px">${s}</button>`).join("")}</div>
   <p id="sgPrev" style="text-align:center;font-size:15px"></p>
   <button class="buy" id="sgGo" style="align-self:center" ${left<=0||why?"disabled":""}>🪧 여기에 세우기 (오늘 ${left}/${SG_MAXN}개 남음)</button>
   ${why&&left>0?`<p style="font-size:12px;color:#ffb0a0;text-align:center">${why}</p>`:""}
   <div class="idlegrid"><div><b>👍 ${fmt(G.sgHelp||0)}</b><span>내 표지판이 도운 사람</span></div><div><b>${mine.length}</b><span>세워 둔 표지판</span></div><div><b>${G.sgThx||0}</b><span>내가 누른 👍</span></div></div>
   ${mine.length?`<h3>📍 내 표지판</h3><div class="diary">${mine.slice(0,6).map(s=>{ const rg=regionAt(s.x,s.z); return `<p>${sgLikes(sgKey(s))>=SG_GOLDN?"✨":"🪧"} ${SG_SAY[s.m]} ${SG_EMO[s.e]} · ${rg?rg.n:"들판"} · ${fmtAgo(s.ts)} · 👍${sgLikes(sgKey(s))}</p>`; }).join("")}</div>`:""}
   <p style="font-size:12px">하루 3개까지 · 보통 3일, 👍 ${SG_GOLDN}개 넘으면 금빛 표지판이 되어 7일 동안 남아요. 표지판 앞에 가면 「👍 고마워요」 버튼이 떠요(내 것·이미 누른 것은 빼고).</p>`);
  const prev=()=>{ const p=$("sgPrev"); if(p) p.innerHTML=`미리 보기: 🪧 <b>${SG_SAY[pick.m]} ${SG_EMO[pick.e]}</b>`; }; prev();
  layers.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{ pick.m=+b.dataset.m; layers.querySelectorAll("[data-m]").forEach(x=>x.classList.toggle("alt",x!==b)); prev(); tone(660,.05); });
  layers.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{ pick.e=+b.dataset.e; layers.querySelectorAll("[data-e]").forEach(x=>x.classList.toggle("alt",x!==b)); prev(); tone(760,.05); });
  if($("sgGo")) $("sgGo").onclick=()=>sgPlace(pick.m,pick.e); }
MENU_X.push({ic:"🪧",n:"길 위의 돌 표지판",id:"sgBtn",sub:()=>`오늘 ${sgToday().n}/${SG_MAXN} · 도운 사람 ${fmt(G.sgHelp||0)}명`,f:showSigns});
TITLES.push({id:"sg10",n:"길의 친구",t:1,h:"내 표지판이 10명 돕기(👍 10개)",g:()=>[G.sgHelp||0,10]},{id:"sgt20",n:"고마움을 아는 여행자",t:1,h:"다른 사람 표지판에 👍 20번",g:()=>[G.sgThx||0,20]},{id:"sg100",n:"모두의 길잡이 표지판",t:3,h:"내 표지판이 100명 돕기",g:()=>[G.sgHelp||0,100]});
</script>
