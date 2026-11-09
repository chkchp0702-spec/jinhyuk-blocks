<script>
/* ================= v95-1: 🎵 신들의 악기 — 어디서나 꺼내 부는 리라·뿔피리 (IDEAS G11/9-7) =================
   메뉴 → 신들의 악기 → 악기 고르고 「🎶 연주하기」 → 화면 아래에 색깔 음 버튼 5개(도·레·미·솔·라 — 아무렇게 쳐도 예쁜 5음).
   소리는 WebAudio 로 그 자리에서 만듦(소리 파일 없음). 누르면 머리 위로 ♪ 가 퐁퐁, 근처(40m) 사람에게도 들림(t:"mu").
   악보 4곡: 창에 색 동그라미로 그려져 있고, 맞게 치면 🌸 꽃비 + 하루 한 번 금화. 근처 사람이 10초 안에 같은 노래를 치면 「🌟 합주!」(t:"mus").
   아무나 시끄럽게 못 하게: 정해진 5음만, 1초에 8음까지, 「근처 연주 소리 끄기」(G.muMute).
   저장: G.muIns(고른 악기) · G.muDay/G.muDone(오늘 친 노래) · G.muKnown(한 번이라도 친 노래들) · G.muSongs(친 횟수) · G.muDuet(합주 횟수). 칭호 3개. */
const MU_NOTE=[523.25,587.33,659.25,783.99,880];
const MU_KEY=[{n:"도",c:"#ff5b5b"},{n:"레",c:"#ff9f3a"},{n:"미",c:"#ffd93a"},{n:"솔",c:"#4fd16a"},{n:"라",c:"#46a6ff"}];
const MU_INS=[
 {n:"황금 나팔",ic:"🎺",r:0,type:"square",oct:1,d:.32,v:.05},
 {n:"뿔피리",ic:"📯",r:1,type:"sawtooth",oct:.5,d:.5,v:.06},
 {n:"시타르",ic:"🪕",r:2,type:"square",oct:1,d:.55,v:.04,det:1},
 {n:"리라",ic:"🎼",r:3,type:"triangle",oct:1,d:.7,v:.12}];
const MU_SONGS=[
 {n:"에덴의 아침",ic:"🌅",s:[0,2,4,3,2,1,0]},
 {n:"무지개 다리",ic:"🌈",s:[2,2,3,4,4,3,2]},
 {n:"연꽃 자장가",ic:"🪷",s:[4,3,2,3,4,4]},
 {n:"올림포스 행진",ic:"🏛️",s:[0,0,3,3,4,4,3]}];
const MU={on:false,bar:null,buf:[],last:0,rate:[],done:{},peerSong:{},floatT:0};
function muIns(){ const i=G.muIns; return MU_INS[i>=0&&i<4?i:Math.max(0,G.realm)]||MU_INS[0]; }
function muSound(k,ins,vol,delay){ const f=MU_NOTE[k]*ins.oct; tone(f,ins.d,ins.type,delay||0,(vol==null?1:vol)*ins.v); if(ins.det) tone(f*1.006,ins.d*.8,"sawtooth",(delay||0)+.01,(vol==null?1:vol)*ins.v*.5); if(ins.r===3) tone(f*2,ins.d*.4,"sine",(delay||0),(vol==null?1:vol)*ins.v*.25); }
function muDayReset(){ const d=kday(); if(G.muDay!==d){ G.muDay=d; G.muDone={}; } }
function muPlay(k){ if(P.dead) return; const now=performance.now(); MU.rate=MU.rate.filter(t=>now-t<1000); if(MU.rate.length>=8) return; MU.rate.push(now);
  const ins=muIns(); muSound(k,ins,1); floatDmg(P.x+rnd(-.4,.4),(P.gy?P.gy-hAt(P.x,P.z):0)+3.6,P.z,"♪","gain"); try{ net.send({t:"mu",k,s:G.muIns>=0?G.muIns:Math.max(0,G.realm)}); }catch(e){}
  const b=MU.bar&&MU.bar.querySelector(`[data-k="${k}"]`); if(b){ b.classList.remove("hit"); void b.offsetWidth; b.classList.add("hit"); }
  if(now-MU.last>2500) MU.buf=[]; MU.last=now; MU.buf.push(k); if(MU.buf.length>12) MU.buf.shift();
  MU_SONGS.forEach((S,i)=>{ const n=S.s.length; if(MU.buf.length<n) return; for(let j=0;j<n;j++) if(MU.buf[MU.buf.length-n+j]!==S.s[j]) return; muSongDone(i); MU.buf=[]; }); }
function muSongDone(i){ const S=MU_SONGS[i]; muDayReset(); G.muSongs=(G.muSongs||0)+1; G.muKnown=G.muKnown||{}; G.muKnown[i]=1; MU.done[i]=Date.now();
  for(let j=0;j<5;j++) setTimeout(()=>fxSpark(P.x+rnd(-3,3),3.5,P.z+rnd(-3,3),[0xffa8d0,0xfff0a0,0xc8a8ff,0xffffff][j%4],10),j*120);
  jingle([784,988,1175,1568]); buzz([20,20,20]);
  let sub="🌸 꽃비가 내려요!"; if(!G.muDone[i]){ G.muDone[i]=1; const gold=Math.round(80+G.lv*6); G.gold+=gold; sub=`🌸 꽃비! 오늘 처음 · 금화 +${fmt(gold)}`; }
  toast(`${S.ic} 「${S.n}」 연주 성공!`,sub,2.4); try{ net.send({t:"mus",s:i}); }catch(e){}
  const pd=MU.peerSong[i]; if(pd&&Date.now()-pd.t<10000) muDuet(i,pd.n); saveGame(); }
function muDuet(i,who){ const k="d"+i; if(MU[k]&&Date.now()-MU[k]<12000) return; MU[k]=Date.now(); G.muDuet=(G.muDuet||0)+1; const gold=Math.round(120+G.lv*8); G.gold+=gold; saveGame();
  for(let j=0;j<8;j++) setTimeout(()=>fxSpark(P.x+rnd(-5,5),5,P.z+rnd(-5,5),0xffe08a,12),j*90);
  jingle([523,659,784,1046,1318,1568]); try{ lvBanner("🌟 합주!",`「${MU_SONGS[i].n}」`,`${who}님과 함께 · 금화 +${fmt(gold)}`,"#ffe08a"); }catch(e){ toast("🌟 합주!",`${who}님과 함께 · 금화 +${fmt(gold)}`,2.6); } }
NETR.mu=(o,d)=>{ if(G.muMute||o.dead) return; const dist=Math.hypot(o.x-P.x,o.z-P.z); if(dist>40) return; const k=d.k|0; if(k<0||k>4) return; const ins=MU_INS[d.s|0]||MU_INS[0];
  muSound(k,ins,Math.max(.15,.7*(1-dist/40))); o.muT=(o.muT||0); const now=performance.now(); if(now-o.muT>180){ o.muT=now; floatDmg(o.x+rnd(-.4,.4),3.6,o.z,"♪","gain"); } };
NETR.mus=(o,d)=>{ const i=d.s|0; if(!MU_SONGS[i]) return; if(Math.hypot(o.x-P.x,o.z-P.z)>40) return; MU.peerSong[i]={t:Date.now(),n:o.name};
  if(!layerOpen) toast(`🎵 ${o.name}님이 「${MU_SONGS[i].n}」을(를) 연주했어요`,MU.done[i]&&Date.now()-MU.done[i]<10000?null:"10초 안에 같은 노래를 치면 🌟 합주!",2);
  if(MU.done[i]&&Date.now()-MU.done[i]<10000) muDuet(i,o.name); };
/* ---------- 연주 띠 ---------- */
function muBarEl(){ if(MU.bar) return MU.bar; const b=document.createElement("div"); b.id="muBar"; b.hidden=true;
  b.innerHTML=`<button type="button" class="mux" data-x="ins"></button>`+MU_KEY.map((K,k)=>`<button type="button" class="muk" data-k="${k}" style="--c:${K.c}"><b>${K.n}</b></button>`).join("")+`<button type="button" class="mux" data-x="off">✖</button>`;
  b.addEventListener("pointerdown",e=>{ const t=e.target.closest("button"); if(!t) return; e.stopPropagation(); e.preventDefault(); audioWake&&audioWake();
    if(t.dataset.k!=null) muPlay(+t.dataset.k); else if(t.dataset.x==="off") muStop(); else if(t.dataset.x==="ins"){ G.muIns=((G.muIns>=0?G.muIns:Math.max(0,G.realm))+1)%4; saveGame(); const I=muIns(); toast(`${I.ic} ${I.n}(으)로 바꿨어요`,null,1.2); muSound(2,I,1); muBarSync(); } });
  document.body.appendChild(b); MU.bar=b; muBarSync(); return b; }
function muBarSync(){ if(!MU.bar) return; const I=muIns(); MU.bar.querySelector('[data-x="ins"]').textContent=I.ic; }
function muStart(){ MU.on=true; muBarEl(); muBarSync(); toast(`${muIns().ic} ${muIns().n}을(를) 꺼냈어요!`,"색깔 버튼을 눌러 연주해요 · ✖ 로 넣기",2); }
function muStop(){ MU.on=false; if(MU.bar) MU.bar.hidden=true; }
XTICK.push(()=>{ if(!MU.bar) return; const show=MU.on&&started&&!layerOpen&&!P.dead; if(MU.bar.hidden===show){ MU.bar.hidden=!show; document.body.classList.toggle("muOn",show); } });
document.addEventListener("keydown",e=>{ if(!MU.on||layerOpen||e.repeat) return; const tg=e.target&&e.target.tagName; if(tg==="INPUT"||tg==="TEXTAREA") return; const k="12345".indexOf(e.key); if(k>=0){ muPlay(k); e.preventDefault(); } });
/* ---------- 창 ---------- */
function muDots(s){ return s.map(k=>`<i class="mud" style="background:${MU_KEY[k].c}">${MU_KEY[k].n}</i>`).join(""); }
function muListen(i){ const I=muIns(); MU_SONGS[i].s.forEach((k,j)=>muSound(k,I,1,j*.38)); }
function showMusic(){ muDayReset(); const I=muIns(); const kn=Object.keys(G.muKnown||{}).length;
  card(`<h2>🎵 신들의 악기</h2><p>어디서나 악기를 꺼내 연주해요! 색깔 버튼 5개만 있어서 아무렇게 쳐도 예쁜 소리가 나요. <b>근처 사람에게도 들려요.</b> 아래 악보대로 치면 🌸 꽃비가 내리고, 근처 사람과 10초 안에 같은 노래를 치면 <b>🌟 합주!</b></p>
   <div class="idlegrid"><div><b>${I.ic}</b><span>${I.n}</span></div><div><b>${kn}/4</b><span>아는 노래</span></div><div><b>${G.muSongs||0}</b><span>연주한 노래</span></div><div><b>${G.muDuet||0}</b><span>합주</span></div></div>
   <h3>🎺 악기 고르기</h3><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${MU_INS.map((x,i)=>`<button type="button" class="buy" data-mi="${i}" style="${x===I?"outline:3px solid #ffe08a":""}">${x.ic} ${x.n}<small style="display:block;font-size:11px;opacity:.8">${REALMS[x.r].n}</small></button>`).join("")}</div>
   <h3>📜 악보</h3><div class="diary">${MU_SONGS.map((S,i)=>`<p style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><b>${S.ic} ${S.n}</b> ${(G.muDone||{})[i]?"✅":""} <span style="display:inline-flex;gap:2px">${muDots(S.s)}</span> <button type="button" class="buy" data-ml="${i}" style="padding:3px 8px;font-size:12px">👂 듣기</button></p>`).join("")}</div>
   <p style="font-size:12px">하루에 노래마다 처음 성공하면 금화! 키보드는 1~5. <label><input type="checkbox" id="muMute" ${G.muMute?"checked":""}> 근처 사람 연주 소리 끄기</label></p>
   <button class="go" id="muGo" type="button" style="align-self:center">${MU.on?"🎶 계속 연주하기":"🎶 연주하기"}</button>`);
  layers.querySelectorAll("[data-mi]").forEach(b=>b.onclick=()=>{ G.muIns=+b.dataset.mi; saveGame(); muSound(2,muIns(),1); muBarSync(); showMusic(); });
  layers.querySelectorAll("[data-ml]").forEach(b=>b.onclick=()=>muListen(+b.dataset.ml));
  $("muMute").onchange=e=>{ G.muMute=!!e.target.checked; saveGame(); };
  $("muGo").onclick=()=>{ closeLayer(); muStart(); }; }
MENU_X.push({ic:"🎵",n:"신들의 악기",id:"muBtn",sub:()=>`${muIns().ic} ${muIns().n} · 아는 노래 ${Object.keys(G.muKnown||{}).length}/4`,f:showMusic});
TITLES.push({id:"mu3",n:"떠돌이 악사",t:1,h:"악보대로 노래 3번 연주",g:()=>[G.muSongs||0,3]},{id:"mu4",n:"모든 노래를 아는 자",t:2,h:"악보 4곡 모두 연주",g:()=>[Object.keys(G.muKnown||{}).length,4]},{id:"mud1",n:"신들의 합창단",t:2,h:"근처 사람과 🌟 합주",g:()=>[G.muDuet||0,1]});
</script>
<style>
#muBar{position:fixed;left:50%;bottom:calc(max(10px,env(safe-area-inset-bottom)) + 52px);transform:translateX(-50%);z-index:6;display:flex;gap:5px;align-items:center;padding:6px 8px;border-radius:18px;background:rgba(20,16,40,.82);border:2px solid #ffe08a;box-shadow:0 0 0 2px rgba(0,0,0,.45);touch-action:none}
#muBar[hidden]{display:none}
body.muOn #bCtx{bottom:calc(max(10px,env(safe-area-inset-bottom)) + 124px)}
#muBar .muk{width:46px;height:46px;border-radius:50%;border:3px solid #fff;background:var(--c);color:#fff;font-weight:900;font-size:15px;text-shadow:0 1px 0 #000;box-shadow:0 3px 0 rgba(0,0,0,.4);padding:0}
#muBar .muk.hit{animation:muHit .25s ease-out}
#muBar .mux{width:38px;height:38px;border-radius:12px;border:2px solid #ffe08a;background:#2b2250;color:#fff;font-size:18px;padding:0}
@keyframes muHit{0%{transform:scale(.82);filter:brightness(1.6)}100%{transform:scale(1);filter:none}}
.mud{display:inline-block;min-width:20px;height:20px;line-height:20px;border-radius:50%;color:#fff;font-style:normal;font-size:10px;font-weight:900;text-align:center;text-shadow:0 1px 0 #000}
@media (max-height:420px){ #muBar .muk{width:40px;height:40px;font-size:13px} #muBar .mux{width:32px;height:32px} }
</style>
