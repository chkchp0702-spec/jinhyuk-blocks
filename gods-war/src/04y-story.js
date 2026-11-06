<script>
/* ================= v49-2: 📜 신들의 이야기 연재 — 일주일마다 열리는 새 장 (IDEAS G11/5-3) =================
   메뉴 📜 이야기 · 수도의 이야기 전령(에덴 가브리엘·아스가르드 헤임달·인도 나라다·올림푸스 헤르메스)에게 말 걸기.
   만화처럼 그림 칸 + 말풍선(글자가 또르르 나옴, 화면 위아래 검은 띠) → 장마다 할 일 3~4개 → 장 끝 보스 → 끝 만화 → 그림 카드·칭호·상자.
   1부 「혼돈의 왕」 6장. 한국 날짜로 2026-11-02(월)에 1장, 그 뒤 월요일마다 한 장씩 열림 → 모든 사람이 같은 날 새 장을 받음.
   할 일 종류: 안개 괴물(m.mist, 내 레벨에 맞춰 나옴) · 아무 괴물 · 빛나는 룬 줍기 · 말 걸기 · 물고기 바치기 · 제단 가기 · 보스(m.styBoss).
   보스는 친구가 준 데미지도 함께 깎임(t:"sth"). 내가 깬 장 수는 캐릭터 정보(sc)에 실려 이야기 창 「이번 장을 깬 모험가」에 보임. */
const STY_D0=Math.round(Date.UTC(2026,10,2)/86400000);   // 1장이 열린 날(한국 날짜 번호)
const STY_MSG=[{n:"가브리엘",t:"천사장",ic:"👼"},{n:"헤임달",t:"무지개 다리 파수꾼",ic:"🛡️"},{n:"나라다",t:"떠돌이 현자",ic:"🪕"},{n:"헤르메스",t:"전령의 신",ic:"🪽"}];
const STY_HERO=[{n:"미카엘",t:"대천사",ic:"⚔️"},{n:"브륀힐드",t:"발키리",ic:"🐎"},{n:"하누만",t:"바람의 원숭이 영웅",ic:"🐒"},{n:"아테나",t:"지혜와 용기의 여신",ic:"🦉"}];
const STY_CHAOS={n:"???",t:"검은 안개 속 목소리",ic:"🌀"}, STY_CHAOS2={n:"카오스",t:"혼돈의 왕",ic:"👁️"};
const STORY=[
 {n:"검은 안개가 피어나다",ic:"🌫️",al:1,card:"검은 안개의 첫날",
  intro:[["msg","{ME}! 큰일이에요. {F1}에 검은 안개가 피어올랐어요.","🌫️🌳🌫️"],["me","검은 안개요? 무슨 일이죠?"],["msg","안개에 닿은 괴물들 눈이 빨갛게 빛나고 아주 사나워졌어요. 먼저 안개 괴물을 물리쳐 주세요!","👹🌫️👹"]],
  steps:[{k:"mist",n:6,rg:1,txt:"{F1}의 안개 괴물 6마리 물리치기"},{k:"rune",n:3,rg:1,nm:"빛의 룬",txt:"안개 속에 떨어진 빛의 룬 3개 찾기"},
   {k:"talk",who:"msg",txt:"수도로 돌아가 {M}에게 룬 보여 주기",lines:[["msg","이 룬에 글씨가 새겨져 있어요… 「혼돈이 깨어난다」.","🪨✨"],["me","혼돈이요?"],["msg","안개를 불러온 우두머리가 {F1} 한가운데에 있어요. 조심해요!"]]},
   {k:"boss",rg:1,b:{n:"안개 늑대 우두머리",shape:"wolf",c:0x3a2a5a},txt:"{F1}의 안개 늑대 우두머리 쓰러뜨리기"}],
  outro:[["chaos","후후후… 작은 영웅이구나. 이건 시작일 뿐이야.","🌀👁️🌀"],["me","누구야?! 모습을 보여!"],["msg","그 목소리… 아주 오래전에 잠든 혼돈의 힘이에요. 다음 장에서 더 알아봐요!"]]},
 {n:"무지개 다리의 손님",ic:"🌈",al:1,card:"무지개 다리의 우정",
  intro:[["msg","{ME}! 다른 세계에서 손님이 왔어요. {ALLY}의 {AH}예요!","🌈✨"],["hero","네가 {R}의 영웅이구나! 우리 {ALLY}에도 검은 안개가 퍼졌어."],["hero","누군가 네 세계를 하나씩 삼키려 해. 함께 막자!","🤝"]],
  steps:[{k:"talk",who:"hero",txt:"{F2} 가는 길에서 {AH} 만나기",lines:[["hero","와 줘서 고마워! 괴물을 많이 물리칠수록 안개가 약해져."],["me","좋아, 같이 가자!"]]},
   {k:"kill",n:15,txt:"괴물 15마리 물리치기 (아무 괴물이나)"},{k:"fish",n:1,txt:"물고기 1마리 낚아 호수 정령에게 바치기 (물가에서 🎣)"},
   {k:"boss",rg:2,b:{n:"안개 뱀",shape:"snake",c:0x2a1a4a},txt:"{F2}의 안개 뱀 쓰러뜨리기"}],
  outro:[["hero","해냈어! 안개가 조금 걷혔어.","🌤️"],["chaos","흥, 둘이 모이면 이길 것 같으냐? 네 세계가 다 모여도 나는 못 막는다!","🌀"],["me","두고 봐! 우리는 친구가 많다고!"]]},
 {n:"사라진 불꽃",ic:"🔥",al:1,card:"다시 타오른 성화",
  intro:[["msg","{ME}, {CAP}의 성화가 꺼졌어요!","🏛️💨"],["msg","안개가 불씨를 훔쳐 {F2}에 흩어 놓았어요. 불씨 조각을 모아 주세요."],["me","불이 꺼지면 어떻게 돼요?"],["msg","불빛이 없으면 괴물들이 수도까지 들어올 수 있어요. 서둘러요!","🌑"]],
  steps:[{k:"rune",n:3,rg:2,nm:"불씨 조각",fire:1,txt:"{F2}에 흩어진 불씨 조각 3개 모으기"},{k:"mist",n:8,rg:2,txt:"{F2}의 안개 괴물 8마리 물리치기"},
   {k:"visit",at:"shrine",txt:"{CAP} 성전으로 돌아가 불씨 올리기",lines:[["me","불씨야, 다시 타올라라!","🔥"],["msg","성화가 다시 타올라요! 그런데… 마지막 불씨를 지키던 녀석이 있어요."]]},
   {k:"boss",rg:2,b:{n:"그림자 불꽃 정령",shape:"fireserpent",c:0x3a1a5a},txt:"{F2}의 그림자 불꽃 정령 쓰러뜨리기"}],
  outro:[["msg","성화가 활활 타올라요! 이 불빛이면 안개가 수도에 못 들어와요.","🔥🏛️✨"],["chaos","불꽃 따위… 내 사자들이 곧 찾아갈 것이다.","🌀"]]},
 {n:"혼돈의 사자들",ic:"⚔️",al:2,card:"사자들을 물리친 날",
  intro:[["msg","혼돈의 사자들이 나타났어요! 검은 갑옷을 입은 무시무시한 녀석들이에요.","⚔️🌑"],["hero","{ME}! 나 {ALLY}의 {AH}야. 우리 세계에도 사자들이 왔어. 각자 자리에서 막자!"],["me","좋아요, 제 세계는 제가 지킬게요!"]],
  steps:[{k:"talk",who:"hero",txt:"{AH}에게 혼돈의 사자 이야기 듣기",lines:[["hero","사자들은 안개 괴물을 부하로 부려. 부하부터 잡아야 해."],["hero","하나 더! 사자들은 빛나는 수호의 룬을 무서워해.","🛡️✨"]]},
   {k:"mist",n:10,rg:1,txt:"{F1}의 안개 괴물 10마리 물리치기"},{k:"rune",n:3,rg:1,nm:"수호의 룬",txt:"수호의 룬 3개 찾기"},
   {k:"boss",rg:1,b:{n:"혼돈의 사자",shape:"draugr",c:0x1a1a2a},txt:"{F1}의 혼돈의 사자 쓰러뜨리기"}],
  outro:[["hero","사자들이 물러났어! 그런데 이상해… 너무 조용해."],["chaos2","그래, 맞다. 나는 카오스. 네 세계의 문장을 노리고 있지.","👁️🌀"],["msg","네 세계의 문장이요?! 큰일이에요!"]]},
 {n:"네 세계의 맹세",ic:"🤝",al:3,card:"네 세계의 맹세",
  intro:[["msg","네 세계를 지키는 힘은 「네 세계의 문장」에서 나와요. 카오스가 그걸 빼앗으려 해요.","✝️ ᛟ 🕉️ ⚡"],["hero","{ME}, 나 {ALLY}의 {AH}야. 네 세계가 함께 맹세하면 문장이 더 단단해진대!"],["me","모두 함께 맹세하자!","🤝"]],
  steps:[{k:"rune",n:4,rg:0,nm:"세계의 문장",txt:"흩어진 네 세계의 문장 4개 찾기"},{k:"kill",n:20,txt:"괴물 20마리 물리치기 (아무 괴물이나)"},
   {k:"talk",who:"msg",txt:"{M}에게 문장 맡기기",lines:[["msg","문장이 빛나요! 이제 맹세의 노래를 불러요.","✨"],["me","♪ 네 세계는 하나, 우리는 친구! ♪","🎵"]]},
   {k:"boss",rg:2,b:{n:"안개 거인",shape:"icegiant",c:0x2a2a4a},txt:"{F2}의 안개 거인 쓰러뜨리기"}],
  outro:[["msg","문장이 지켜졌어요! 그런데… 하늘이 갈라져요!","🌌⚡"],["chaos2","좋다. 이제 내가 직접 가 주마. 다음 장, 혼돈의 왕이 깨어난다!","👁️"]]},
 {n:"혼돈의 왕 카오스",ic:"👑",al:1,card:"혼돈을 잠재운 영웅",
  intro:[["chaos2","드디어 깨어났다! 나는 카오스, 세상이 생기기 전의 혼돈이다!","🌀👑🌀"],["msg","{ME}! 네 세계의 영웅들이 각자 자리에서 카오스의 그림자를 막고 있어요."],["hero","{ME}! 지금이야! 다 같이 힘을 모으자!"],["me","모두 함께라면 이길 수 있어!","✊"]],
  steps:[{k:"talk",who:"msg",txt:"{M}에게 마지막 축복 받기",lines:[["msg","네 세계의 축복을 모두 담았어요. 힘내요!","🌟"],["me","다녀올게요!"]]},
   {k:"mist",n:12,rg:1,txt:"{F1}의 안개 괴물 12마리 물리치기"},
   {k:"boss",rg:2,big:1,b:{n:"혼돈의 왕 카오스",shape:"darkangel",c:0x2a0a4a},txt:"{F2}에서 혼돈의 왕 카오스 쓰러뜨리기 (친구와 함께면 더 쉬워요)"}],
  outro:[["chaos2","말도 안 돼… 작은 영웅들이… 힘을 모으다니…","🌀💫"],["msg","해냈어요! 네 세계에 다시 햇빛이 비쳐요!","☀️🌈🌸"],["hero","{ME}, 너는 진짜 영웅이야. 우리 또 만나자!"],["me","응! 다음 모험도 함께하자!"],["msg","「신들의 이야기」 1부 끝 — 2부도 기대해 주세요!","📜✨"]]}];
const STY={t:0,npc:null,hero:null,heroR:-1,lbl:null,hlbl:null,runes:[],runeKey:"",boss:null,spawnT:0,pubT:3,heard:false,cin:false};
function styData(){ if(!G.sty) G.sty={c:0,cur:-1,s:0,n:0,got:0,cards:{}}; return G.sty; }
function styOpenN(){ return clamp(Math.floor((kday()-STY_D0)/7)+1,0,STORY.length); }
function styNextDays(){ const n=styOpenN(); if(n>=STORY.length) return -1; return STY_D0+7*n-kday(); }
function styAlly(ch){ return (Math.max(0,G.realm)+(STORY[ch]?STORY[ch].al:1))%4; }
function styWho(k,ch){ const r=Math.max(0,G.realm); if(k==="msg") return STY_MSG[r]; if(k==="hero") return STY_HERO[styAlly(ch)]; if(k==="chaos") return STY_CHAOS; if(k==="chaos2") return STY_CHAOS2; return {n:G.name||"나",t:RM().n+"의 영웅",ic:RM().icon}; }
function styFill(s,ch){ const r=Math.max(0,G.realm), al=styAlly(ch); return String(s).replace(/\{ME\}/g,G.name||"용사").replace(/\{R\}/g,REALMS[r].n).replace(/\{CAP\}/g,REALMS[r].capital).replace(/\{F1\}/g,REGIONS[r*3+1].n).replace(/\{F2\}/g,REGIONS[r*3+2].n).replace(/\{M\}/g,STY_MSG[r].n).replace(/\{ALLY\}/g,REALMS[al].n).replace(/\{AH\}/g,STY_HERO[al].n); }
function styStep(){ const d=styData(); if(d.cur<0) return null; const C=STORY[d.cur]; return C?C.steps[d.s]||null:null; }
function styOff(){ return (typeof DG!=="undefined"&&DG.on)||(typeof HM!=="undefined"&&HM.on)||(typeof DS!=="undefined"&&DS.on)||(typeof PG!=="undefined"&&PG.on); }
/* ---------- 장소 ---------- */
function styMsgSpot(){ const s=homeShrine(); const rg=REGIONS[G.realm*3]; const dir=rg.z>0?-1:1, sx=rg.x>0?-1:1; return {x:s.x+sx*7,z:s.z+dir*12}; }
function styHeroSpot(){ const r=Math.max(0,G.realm); const f=REGIONS[r*3+2], c=REGIONS[r*3]; return {x:f.x+(c.x-f.x)*.42,z:f.z+(c.z-f.z)*.42}; }
function styTarget(){ const st=styStep(); if(!st) return null; const r=Math.max(0,G.realm), d=styData();
  if(st.k==="mist"||st.k==="boss"){ const rg=REGIONS[r*3+st.rg]; return {x:rg.x,z:rg.z,label:styFill(st.txt,d.cur)}; }
  if(st.k==="rune"){ const L=styRunes().filter(o=>!o.got); let b=null,bd=1e9; L.forEach(o=>{ const q=Math.hypot(o.x-P.x,o.z-P.z); if(q<bd){ bd=q; b=o; } }); return b?{x:b.x,z:b.z,label:`${st.nm} (${d.n}/${st.n})`}:null; }
  if(st.k==="talk"){ const p=st.who==="hero"?styHeroSpot():styMsgSpot(); return {x:p.x,z:p.z,label:`💬 ${styWho(st.who,d.cur).n}`}; }
  if(st.k==="visit"){ const s=homeShrine(); return {x:s.x,z:s.z,label:RM().capital+" 성전"}; }
  if(st.k==="fish"){ return null; } if(st.k==="kill"){ const rg=REGIONS[r*3+1]; return {x:rg.x,z:rg.z,label:rg.n}; } return null; }
/* ---------- 룬(빛나는 돌) ---------- */
function styRunes(){ const d=styData(), st=styStep(); if(!st||st.k!=="rune") return []; const key=d.cur+":"+d.s+":"+G.realm; if(STY.runeKey===key) return STY.runes;
  STY.runes.forEach(o=>{ if(o.g) scene.remove(o.g); }); STY.runes=[]; STY.runeKey=key; const r=Math.max(0,G.realm); const rng=dgRng(d.cur*131+d.s*17+r*7+3);
  for(let i=0;i<st.n;i++){ const rg=REGIONS[r*3+(st.rg===0?1+(i%2):st.rg)]; let x,z; for(let k=0;k<20;k++){ const a=rng()*6.283, q=rg.r*(.25+rng()*.5); x=rg.x+Math.cos(a)*q; z=rg.z+Math.sin(a)*q; if(Math.abs(x)<WORLD_HALF-12&&Math.abs(z)<WORLD_HALF-12) break; }
    const got=!!(d.got&(1<<i)); const o={i,x,z,got,g:null}; if(!got){ o.g=styRuneMesh(st.fire?0xff8a30:st.rg===0?[0xffd95e,0x9fd8ff,0xff9a5a,0xa0ff9a][i%4]:0x9fe0ff); o.g.position.set(x,hAt(x,z),z); scene.add(o.g); } STY.runes.push(o); }
  return STY.runes; }
function styRuneMesh(c){ const g=new THREE.Group(); const st=mat({color:0x6a6a7a,roughness:.85}); const core=new THREE.Group(); core.add(box(.9,1.5,.35,st,0,0,0)); const gl=box(.5,1,.4,glowMat(c,.95),0,0,0); gl.userData.noOutline=true; core.add(gl); core.position.y=1.6; g.add(core);
  const beam=cyl(.5,.9,22,glowMat(c,.16),0,11,0,10); beam.userData.noOutline=true; g.add(beam); const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1.3,28),glowMat(c,.6)); ring.rotation.x=-Math.PI/2; ring.position.y=.08; ring.userData.noOutline=true; g.add(ring); g.userData={core,beam,ring}; return g; }
function styClearRunes(){ STY.runes.forEach(o=>{ if(o.g) scene.remove(o.g); }); STY.runes=[]; STY.runeKey=""; }
/* ---------- 사람들(전령·영웅) ---------- */
function styNpcMesh(r,rank){ const m=(typeof avatarGL==="function"&&avatarGL(r,rank,{hair:2,cloth:2}))||makeAvatar(r,rank,false,{hair:2,cloth:2}); return m; }
function styEnsureNpc(){ if(G.realm<0) return; if(!STY.npc){ const p=styMsgSpot(); STY.npc=styNpcMesh(G.realm,5); STY.npc.position.set(p.x,hAt(p.x,p.z),p.z); STY.npc.rotation.y=Math.atan2(homeShrine().x-p.x,homeShrine().z-p.z)+Math.PI; scene.add(shadowify(STY.npc)); STY.npcP=p;
    const ring=new THREE.Mesh(new THREE.RingGeometry(1.4,1.9,32),glowMat(0xffe7a0,.5)); ring.rotation.x=-Math.PI/2; ring.position.set(p.x,hAt(p.x,p.z)+.08,p.z); ring.userData.noOutline=true; scene.add(ring); STY.npcRing=ring; }
  const st=styStep(); const want=st&&st.k==="talk"&&st.who==="hero"?styAlly(styData().cur):-1;
  if(STY.heroR!==want){ if(STY.hero){ scene.remove(STY.hero); STY.hero=null; } STY.heroR=want; if(want>=0){ const p=styHeroSpot(); STY.hero=styNpcMesh(want,6); STY.hero.position.set(p.x,hAt(p.x,p.z),p.z); STY.hero.rotation.y=Math.atan2(P.x-p.x,P.z-p.z); scene.add(shadowify(STY.hero)); STY.heroP=p; fxSpark(p.x,2,p.z,0xffffff,20); } } }
function styNearTalk(){ if(styOff()||G.realm<0) return null; const st=styStep(), d=styData();
  if(STY.hero&&STY.heroP&&Math.hypot(P.x-STY.heroP.x,P.z-STY.heroP.z)<5.5) return {who:"hero"};
  if(STY.npcP&&Math.hypot(P.x-STY.npcP.x,P.z-STY.npcP.z)<5.5) return {who:"msg"}; return null; }
function styTalk(who){ const st=styStep(), d=styData(); if(st&&st.k==="talk"&&st.who===who){ styComic(st.lines,d.cur,()=>styAdvance()); return; }
  if(who==="msg"){ if(d.cur<0&&d.c<styOpenN()){ styStart(d.c); return; } showStory(); return; }
  styComic([["hero","{ME}, 힘내! 우리 세계도 열심히 막고 있어!"]],d.cur,null); }
/* ---------- 만화(그림 칸 + 말풍선) ---------- */
function styCss(){ if(STY.css) return; STY.css=1; const s=document.createElement("style"); s.textContent=`#stc{position:fixed;inset:0;z-index:30;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;background:linear-gradient(180deg,rgba(0,0,0,.72) 0,rgba(0,0,0,0) 13%,rgba(0,0,0,0) 52%,rgba(10,6,24,.7) 100%);pointer-events:auto;cursor:pointer;padding:0 max(14px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
#stc:before,#stc:after{content:"";position:fixed;left:0;right:0;height:7vh;background:#000;z-index:-1}#stc:before{top:0}#stc:after{bottom:0;opacity:.0}
#stc .stt{position:fixed;top:max(10px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);color:#ffe7a0;font-weight:900;font-size:clamp(13px,3.4vw,16px);letter-spacing:1px;text-shadow:0 2px 0 #000;white-space:nowrap}
#stc .sts{font-size:clamp(46px,13vw,88px);line-height:1;margin-bottom:10px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.6));animation:stPop .45s cubic-bezier(.2,1.6,.4,1)}
#stc .stb{position:relative;width:min(94vw,640px);background:#fffaf0;color:#2a1a0c;border:4px solid #2a1a0c;border-radius:22px;padding:12px 16px 14px 92px;min-height:96px;box-shadow:0 8px 0 rgba(0,0,0,.35);font-size:clamp(16px,4.2vw,20px);font-weight:800;line-height:1.45;text-align:left;animation:stIn .3s ease-out}
#stc .stb.me{padding:12px 92px 14px 16px;background:#eef6ff}#stc .stb.ev{background:#2a1838;color:#f0dcff;border-color:#b07aff}
#stc .stf{position:absolute;left:10px;top:-26px;width:72px;height:72px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff,var(--fc,#ffe7a0));border:4px solid #2a1a0c;display:flex;align-items:center;justify-content:center;font-size:40px}
#stc .stb.me .stf{left:auto;right:10px}#stc .stb.ev .stf{border-color:#b07aff;background:radial-gradient(circle at 40% 35%,#6a3a9a,#1a0a2a)}
#stc .stw{font-size:13px;font-weight:900;color:#8a5a14;margin-bottom:2px}#stc .stb.ev .stw{color:#c8a0ff}#stc .stw small{font-weight:700;opacity:.75;margin-left:6px}
#stc .stn{color:#fff;font-weight:800;font-size:13px;margin-top:8px;opacity:.85;text-shadow:0 1px 0 #000}#stc .stk{position:fixed;top:max(8px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));font:inherit;font-size:13px;font-weight:800;padding:5px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.5);background:rgba(0,0,0,.45);color:#fff}
@keyframes stPop{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}@keyframes stIn{0%{transform:translateY(16px);opacity:0}100%{transform:none;opacity:1}}
@media (orientation:landscape) and (max-height:540px){ #stc .sts{font-size:44px;margin-bottom:4px} #stc .stb{min-height:70px;font-size:15px;padding:9px 14px 10px 80px} #stc .stb.me{padding:9px 80px 10px 14px} #stc .stf{width:60px;height:60px;font-size:32px;top:-20px} }
#quest .q.story{border-color:#ffd27a!important;background:linear-gradient(135deg,rgba(90,60,10,.85),rgba(40,20,60,.85))!important;color:#ffe7a0}
.stch{display:flex;gap:10px;align-items:center;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:8px 10px}.stch .ic{font-size:30px}.stch.lock{opacity:.55}.stch.now{border-color:#ffd27a;box-shadow:0 0 0 2px rgba(255,210,122,.35)}
body.stOn .hud,body.stOn .acts,body.stOn #quest,body.stOn #minimap,body.stOn #zoomBtns,body.stOn #joy,body.stOn #chat,body.stOn #labels,body.stOn #toast,body.stOn #lvup,body.stOn #bCtx,body.stOn #guide,body.stOn #pgHud,body.stOn #bossbar{visibility:hidden!important}
.stcards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.stcards div{background:linear-gradient(160deg,#3a2a5a,#1a1030);border:2px solid #ffd27a;border-radius:12px;text-align:center;padding:8px 4px;font-size:12px;font-weight:800;color:#ffe7a0}.stcards div b{display:block;font-size:30px}.stcards div.no{border-color:rgba(255,255,255,.2);color:#888;filter:grayscale(1)}`; document.head.appendChild(s); }
function styComic(lines,ch,done,title){ styCss(); if(!lines||!lines.length){ if(done) done(); return; } closeLayer(); STY.cin=true; document.body.classList.add("stOn"); let i=0, typing=null, full="";
  const el=document.createElement("div"); el.id="stc"; document.body.appendChild(el); layerOpen=true;
  const end=()=>{ clearInterval(typing); el.remove(); document.body.classList.remove("stOn"); STY.cin=false; layerOpen=false; if(done) done(); };
  const show=()=>{ const [k,t,sc]=lines[i]; const w=styWho(k,ch); full=styFill(t,ch); const ev=k==="chaos"||k==="chaos2", me=k==="me"; const fc=k==="hero"?REALMS[styAlly(ch)].c1:k==="msg"?RM().c1:me?RM().c1:"#b07aff";
    el.innerHTML=`<div class="stt">${title||(STORY[ch]?`📜 ${ch+1}장 · ${STORY[ch].ic} ${STORY[ch].n}`:"📜 신들의 이야기")}</div><button class="stk" type="button">건너뛰기 ⏭</button>${sc?`<div class="sts">${sc}</div>`:""}<div class="stb${me?" me":""}${ev?" ev":""}"><div class="stf" style="--fc:${fc}">${w.ic}</div><div class="stw">${w.n}<small>${w.t}</small></div><div class="stx"></div></div><div class="stn">${i+1} / ${lines.length} · 화면을 누르면 계속 ▶</div>`;
    el.querySelector(".stk").onclick=e=>{ e.stopPropagation(); end(); }; const tx=el.querySelector(".stx"); let n=0; clearInterval(typing); typing=setInterval(()=>{ n+=2; tx.textContent=full.slice(0,n); if(n%6===0) tone(ev?220:me?620:520,.03,"triangle",0,.025); if(n>=full.length){ clearInterval(typing); typing=null; } },28);
    tone(ev?110:660,.12,ev?"sawtooth":"triangle",0,.06); };
  el.addEventListener("pointerdown",e=>{ e.stopPropagation(); e.preventDefault(); if(e.target.closest(".stk")) return; if(typing){ clearInterval(typing); typing=null; el.querySelector(".stx").textContent=full; return; } i++; if(i>=lines.length) end(); else show(); });
  show(); }
/* ---------- 진행 ---------- */
function styStart(ch){ const d=styData(); if(ch!==d.c||ch>=styOpenN()) return; d.cur=ch; d.s=0; d.n=0; d.got=0; saveGame(); styComic(STORY[ch].intro,ch,()=>{ styStepBegin(); }); }
function styStepBegin(){ const st=styStep(), d=styData(); if(!st) return; d.n=0; d.got=0; styClearRunes(); STY.boss=null; saveGame(); try{ renderQuests(); }catch(e){}
  try{ lvBanner(`📜 ${d.cur+1}장 「${STORY[d.cur].n}」`,`할 일 ${d.s+1} / ${STORY[d.cur].steps.length}`,styFill(st.txt,d.cur)+" · 왼쪽 위 📜 줄을 누르면 길 안내","#ffe7a0"); }catch(e){ toast("📜 "+styFill(st.txt,d.cur)); } jingle([523,659,784]); }
function styAdvance(){ const d=styData(); const C=STORY[d.cur]; if(!C) return; d.s++; d.n=0; d.got=0; styClearRunes(); STY.boss=null;
  if(d.s>=C.steps.length){ const ch=d.cur; d.cur=-1; d.s=0; saveGame(); try{ renderQuests(); }catch(e){} styComic(C.outro,ch,()=>styReward(ch)); return; }
  saveGame(); toast("✅ 할 일 완료!",styFill(C.steps[d.s].txt,d.cur),2.4); jingle([659,784,1046]); setTimeout(styStepBegin,1200); }
function styCount(k,add){ const st=styStep(); if(!st||st.k!==k) return; const d=styData(); d.n=Math.min(st.n||1,d.n+(add||1)); try{ renderQuests(); }catch(e){} if(d.n>=(st.n||1)) styAdvance(); else saveGame(); }
function styReward(ch){ const d=styData(); d.c=Math.max(d.c,ch+1); d.cards=d.cards||{}; d.cards[ch]=Date.now(); const C=STORY[ch];
  const gold=150+(ch+1)*80+G.lv*8, xp=Math.round(xpNeed(G.lv)*.25); G.gold+=gold; gainXp(xp); G.rune=(G.rune||0)+2+ch; G.ore=(G.ore||0)+3; const tier=Math.min(3,1+Math.floor(ch/2)); const s=pick(["w","a","r"]); G.bag.push({s,t:tier}); saveGame(); STY.pubT=1; try{ renderQuests(); }catch(e){}
  try{ drama(0xffd27a,.4,2.2); fxPillar(0xffd27a,2.4,40,2.6,.5); lvBanner(`📜 ${ch+1}장 완료!`,`${C.ic} ${C.n}`,`그림 카드 「${C.card}」를 얻었어요`,"#ffd27a"); }catch(e){} jingle([523,659,784,1046,1318,1568]); buzz([60,40,80]);
  setTimeout(()=>{ const nd=styNextDays(); card(`<h2>📜 ${ch+1}장 「${C.n}」 완료!</h2><div class="stcards" style="grid-template-columns:1fr"><div><b>${C.ic}</b>${C.card}</div></div>
   <div class="diary"><p>⬤ 금화 +${fmt(gold)}</p><p>✨ 경험치 +${fmt(xp)}</p><p>✨ 룬 가루 +${2+ch} · ⛓ 쇳조각 +3</p><p>🎁 ${RAR[tier].n} ${itemName(s,tier)}</p></div>
   <p style="text-align:center">${ch+1>=STORY.length?"<b>1부 끝!</b> 네 세계를 구했어요 🎉":d.c<styOpenN()?`다음 장 「${STORY[d.c].n}」이 벌써 열려 있어요!`:nd>0?`다음 장 「${STORY[d.c].n}」은 <b>${nd}일 뒤</b>(월요일)에 열려요!`:""}</p>
   <button class="buy" id="stOk" style="align-self:center">좋아요!</button>`); $("stOk").onclick=()=>{ if(d.c<styOpenN()) showStory(); else closeLayer(); }; },1400); }
/* ---------- 안개 괴물 · 보스 ---------- */
function styMistMob(rg){ const R=REALMS[rg.realm>=0?rg.realm:0]; const def=pick(R.mobs); const lv=clamp(G.lv+rint(-1,1),1,LVMAX); const st=mobStats(lv,false); const scale=rnd(.95,1.2);
  let x,z; for(let k=0;k<14;k++){ const a=rnd(0,6.283), q=rnd(12,20); x=P.x+Math.cos(a)*q; z=P.z+Math.sin(a)*q; if(Math.hypot(x-rg.x,z-rg.z)<rg.r-4) break; x=rg.x+rnd(-rg.r*.5,rg.r*.5); z=rg.z+rnd(-rg.r*.5,rg.r*.5); }
  const mesh=(typeof mobGL==="function"&&mobGL(def.n,scale))||makeMob(def.shape,def.c,scale); styMistify(mesh,false);
  const m={n:"안개 "+def.n,shape:def.shape,mesh,x,z,hx:x,hz:z,lv,boss:false,world:false,hp:Math.round(st.mhp*1.3),mhp:Math.round(st.mhp*1.3),atk:st.atk,xp:Math.round(st.xp*1.4),gold:Math.round(st.gold*1.3),rg:rg.id,cd:0,state:"idle",t:rnd(0,2),lbl:makeLabel(""),rot:rnd(0,6.3),hit:0,scale,power:0,mist:true};
  mesh.position.set(x,hAt(x,z),z); scene.add(mesh); mobs.push(m); fxSpark(x,1.5,z,0x6a3a9a,14); return m; }
function styMistify(mesh,big){ const ring=new THREE.Mesh(new THREE.RingGeometry(big?2:1.1,big?3.2:1.8,32),glowMat(0x9a5aff,.55)); ring.rotation.x=-Math.PI/2; ring.position.y=.1; ring.userData.noOutline=true; mesh.add(ring); mesh.userData.mistRing=ring;
  const fm=new THREE.MeshBasicMaterial({color:0x1a0a2a,transparent:true,opacity:.32,depthWrite:false}); for(let k=0;k<(big?7:4);k++){ const p=new THREE.Mesh(GEO.sph,fm); const a=k/(big?7:4)*6.283; p.position.set(Math.cos(a)*(big?1.6:.9),rnd(.4,1.8),Math.sin(a)*(big?1.6:.9)); p.scale.setScalar(big?2.2:1.3); p.userData.noOutline=true; mesh.add(p); }
  const eye=glowMat(0xff3050,.95); [-1,1].forEach(s=>{ const e=new THREE.Mesh(GEO.sph,eye); e.scale.setScalar(.14); e.position.set(s*.2,(mesh.userData.h||3)*.72,.55); e.userData.noOutline=true; mesh.add(e); }); }
function styBossSpawn(st,ch){ const r=Math.max(0,G.realm); const rg=REGIONS[r*3+st.rg]; const def=st.b; const lv=clamp(G.lv+2,3,LVMAX); const s0=mobStats(lv,true); const scale=st.big?2.9:2.2; const k=(st.big?1.7:1.2)*(1+.4*Object.values(PEERS).filter(o=>Math.hypot(o.x-rg.x,o.z-rg.z)<rg.r+20).length);
  const mesh=makeMob(def.shape,def.c,scale); styMistify(mesh,true); const aura=new THREE.Mesh(new THREE.RingGeometry(1.6,2.4,40),glowMat(0xb07aff,.7)); aura.rotation.x=-Math.PI/2; aura.position.y=.12; aura.userData.noOutline=true; mesh.add(aura);
  const x=rg.x+rnd(-4,4), z=rg.z+rnd(-4,4); const m={n:def.n,shape:def.shape,mesh,x,z,hx:x,hz:z,lv,boss:true,world:false,hp:Math.round(s0.mhp*k),mhp:Math.round(s0.mhp*k),atk:s0.atk*(st.big?1.15:1),xp:Math.round(s0.xp*1.3),gold:Math.round(s0.gold*1.3),rg:rg.id,cd:1,state:"idle",t:1,lbl:makeLabel("boss"),rot:0,hit:0,scale,power:st.big?99:70+ch*4,styBoss:ch,aura};
  mesh.position.set(x,hAt(x,z),z); scene.add(mesh); mobs.push(m); STY.boss=m;
  try{ lvBanner(`📜 ${ch+1}장 보스`,`${STORY[ch].ic} ${def.n}`,"검은 안개 속에서 나타났어요! 친구와 함께라면 더 쉬워요","#c8a0ff"); }catch(e){ toast(`${def.n} 출현!`); } tone(70,.8,"sawtooth",0,.18); buzz([80,40,80]); fxRing(x,z,0xb07aff,16,1.2); P.shake=Math.max(P.shake||0,.9); return m; }
(function(){ const _km=killMob; killMob=function(m){ const isB=m.styBoss!=null, ch=m.styBoss; _km(m); try{ if(m.war||m.titan) return; const st=styStep(); if(!st) return;
      if(st.k==="mist"&&m.mist) styCount("mist"); else if(st.k==="kill"&&!m.trialOf) styCount("kill"); else if(st.k==="boss"&&isB&&ch===styData().cur){ STY.boss=null; styAdvance(); } }catch(e){ console.warn(e); } };
  const _dm=damageMob; damageMob=function(m,dmg,crit){ const h0=m.hp; _dm(m,dmg,crit); if(m.styBoss!=null&&h0>0){ const d=Math.round(h0-Math.max(0,m.hp)); if(d>0) try{ net.send({t:"sth",c:m.styBoss,d}); }catch(e){} } };
  const _fc=fishCaught; fishCaught=function(g){ _fc(g); try{ styCount("fish"); }catch(e){} };
  const _mp=myProfile; myProfile=function(on){ const p=_mp(on); try{ p.sc=styData().c; }catch(e){} return p; };
  const _rq=renderQuests; renderQuests=function(){ _rq(); try{ styQuestLine(); }catch(e){} }; })();
NETR.sth=(o,d)=>{ const b=STY.boss; if(!b||b.hp<=0||mobs.indexOf(b)<0||d.c!==b.styBoss||Math.hypot(o.x-b.x,o.z-b.z)>70) return; const dmg=Math.min(d.d|0,b.mhp); if(dmg<=0) return; b.hp-=dmg; b.hit=.12; floatDmg(b.x+rnd(-1.5,1.5),3*b.scale,b.z,"-"+fmt(dmg),""); if(b.hp<=0){ b.hp=0; killMob(b); toast(`${o.name}와(과) 함께 ${b.n}을(를) 쓰러뜨렸어요!`,null,2.6); } };
/* ---------- 임무 목록 맨 위 📜 줄 ---------- */
function styQuestLine(){ const q=$("quest"); if(!q||G.realm<0) return; const old=q.querySelector(".q.story"); if(old) old.remove(); const d=styData(), st=styStep(); let html=null;
  if(st){ const cnt=st.n&&st.k!=="talk"&&st.k!=="visit"&&st.k!=="boss"?` <small>${d.n}/${st.n}</small>`:""; html=`📜 ${d.cur+1}장 · ${styFill(st.txt,d.cur)}${cnt}`; }
  else if(d.c<styOpenN()) html=`📜 새 이야기! ${d.c+1}장 「${STORY[d.c].n}」`;
  if(!html) return; const el=document.createElement("div"); el.className="q story"; el.innerHTML=html; el.onclick=()=>{ const s=styStep(); if(!s){ showStory(); return; } const t=styTarget(); if(t) setGuide(t); else if(s.k==="fish") toast("🎣 물가에서 낚시 버튼","수도 분수·연못·호숫가",2); }; q.insertBefore(el,q.firstChild); }
/* ---------- 매 프레임 ---------- */
function styTick(dt){ if(!started||G.realm<0) return; const tn=performance.now(), d=styData(); styEnsureNpc(); const st=styStep(); const off=styOff();
  // 전령: 새 장이 있으면 "📜 새 이야기!"
  if(STY.npc){ const p=STY.npcP, dist=Math.hypot(P.x-p.x,P.z-p.z); STY.npc.position.y=hAt(p.x,p.z)+Math.sin(tn/600)*.06; if(STY.npcRing) STY.npcRing.material.opacity=.35+Math.sin(tn/300)*.15; if(dist<14&&!off) STY.npc.rotation.y+=(Math.atan2(P.x-p.x,P.z-p.z)-STY.npc.rotation.y)*Math.min(1,dt*3);
    if(!STY.lbl) STY.lbl=makeLabel("ally"); const newCh=d.cur<0&&d.c<styOpenN(), talkNow=st&&st.k==="talk"&&st.who==="msg"; if(dist<45&&!layerOpen&&!off) placeLabel(STY.lbl,p.x,4.9,p.z,`${newCh||talkNow?"❗ ":""}${STY_MSG[G.realm].ic} ${STY_MSG[G.realm].n} <b>${newCh?`📜 새 이야기! ${d.c+1}장`:talkNow?"말을 걸어요!":"이야기 전령"}</b>`); else STY.lbl.style.display="none";
    if(newCh&&dist<60&&Math.random()<dt*2) fxSpark(p.x,4.6,p.z,0xffe7a0,2); }
  if(STY.hero&&STY.heroP){ const p=STY.heroP, dist=Math.hypot(P.x-p.x,P.z-p.z); STY.hero.position.y=hAt(p.x,p.z)+Math.sin(tn/500)*.06; if(dist<16) STY.hero.rotation.y=Math.atan2(P.x-p.x,P.z-p.z); if(!STY.hlbl) STY.hlbl=makeLabel("ally"); const w=STY_HERO[STY.heroR]; if(dist<60&&!layerOpen&&!off) placeLabel(STY.hlbl,p.x,5,p.z,`❗ ${w.ic} ${w.n} <b>${REALMS[STY.heroR].n}의 ${w.t}</b>`); else STY.hlbl.style.display="none"; if(dist<70&&Math.random()<dt*2) fxSpark(p.x,4,p.z,0xffffff,2); }
  else if(STY.hlbl) STY.hlbl.style.display="none";
  // 처음 켰을 때 새 장 알림
  if(!STY.heard){ STY.heard=true; if(d.cur<0&&d.c<styOpenN()&&(d.seen||-1)<d.c){ d.seen=d.c; setTimeout(()=>{ if(!layerOpen) toast(`📜 새 이야기 ${d.c+1}장이 열렸어요!`,`「${STORY[d.c].n}」 · 수도의 ${STY_MSG[G.realm].n}에게 말을 걸어요`,3.4); },6000); } setTimeout(()=>{ try{ renderQuests(); }catch(e){} },500); }
  if(!st||off) { if(STY.runes.length&&(!st||st.k!=="rune")) styClearRunes(); return; }
  const r=G.realm;
  if(st.k==="rune"){ styRunes().forEach(o=>{ if(o.got||!o.g) return; const u=o.g.userData; u.core.rotation.y+=dt*1.5; u.core.position.y=1.6+Math.sin(tn/400+o.i)*.25; u.beam.material.opacity=.12+Math.sin(tn/300+o.i)*.05; u.ring.rotation.z+=dt;
      if(Math.hypot(P.x-o.x,P.z-o.z)<2.6&&!P.dead){ o.got=true; d.got|=(1<<o.i); scene.remove(o.g); o.g=null; fxRing(o.x,o.z,0xffe7a0,5,.6); fxSpark(o.x,2,o.z,0xffe7a0,30); jingle([784,988,1318]); floatDmg(o.x,3.5,o.z,`✨ ${st.nm}!`,"gain"); styCount("rune"); } }); }
  if(st.k==="mist"){ const rg=REGIONS[r*3+st.rg]; const inR=Math.hypot(P.x-rg.x,P.z-rg.z)<rg.r+10; STY.spawnT-=dt; const alive=mobs.filter(m=>m.mist).length; if(inR&&!P.dead&&STY.spawnT<=0&&alive<3&&alive<(st.n-d.n)){ STY.spawnT=rnd(1.5,3); styMistMob(rg); } if(inR&&Math.random()<dt*3) fxSpark(P.x+rnd(-14,14),rnd(.3,2),P.z+rnd(-14,14),0x3a1a5a,2); }
  if(st.k==="boss"){ const rg=REGIONS[r*3+st.rg]; if(STY.boss&&mobs.indexOf(STY.boss)<0) STY.boss=null; if(!STY.boss&&!P.dead&&Math.hypot(P.x-rg.x,P.z-rg.z)<45){ const ex=mobs.find(m=>m.styBoss===d.cur); if(ex) STY.boss=ex; else styBossSpawn(st,d.cur); } }
  if(st.k==="visit"){ const s=homeShrine(); if(Math.hypot(P.x-s.x,P.z-s.z)<9&&!layerOpen&&!P.dead){ styComic(st.lines||[["me","도착했어요!"]],d.cur,()=>styAdvance()); } }
  STY.pubT-=dt; if(STY.pubT<=0){ STY.pubT=600; try{ net.pushProfile(1); }catch(e){} } }
XTICK.push(styTick);
/* ---------- 이야기 창 ---------- */
function showStory(){ styCss(); const d=styData(), open=styOpenN(), nd=styNextDays(); const st=styStep();
  const rows=STORY.map((C,i)=>{ const done=i<d.c, now=d.cur===i, avail=!done&&!now&&i===d.c&&i<open, lock=i>=open; const opensIn=STY_D0+7*i-kday();
    return `<div class="stch${lock?" lock":""}${now||avail?" now":""}"><div class="ic">${lock?"🔒":C.ic}</div><div class="t" style="flex:1"><div><b>${i+1}장 · ${lock?"???":C.n}</b></div><span style="font-size:12px;opacity:.85">${done?"✅ 완료 · 그림 카드 「"+C.card+"」":now?`▶ 할 일 ${d.s+1}/${C.steps.length}: ${styFill(C.steps[d.s].txt,i)}`:avail?"새 이야기가 기다려요!":lock?`${opensIn}일 뒤(월요일)에 열려요`:"앞 장을 먼저 끝내요"}</span></div>
     ${done?`<button class="buy alt" data-rp="${i}">다시 보기</button>`:now?`<button class="buy" data-go="${i}">길 안내</button>`:avail?`<button class="go" data-st="${i}" style="padding:6px 12px;font-size:15px">시작!</button>`:""}</div>`; }).join("");
  const kings=Object.values(typeof ROSTER!=="undefined"?ROSTER:{}).filter(p=>p.sc>=open&&p.i!==G.id).map(p=>p.n); if(d.c>=open) kings.unshift(G.name+" (나)");
  card(`<h2>📜 신들의 이야기 — 1부 「혼돈의 왕」</h2><p>만화처럼 펼쳐지는 이야기를 따라 네 세계를 지켜요! <b>월요일마다 새 장</b>이 모든 사람에게 같은 날 열려요. 수도의 <b>${STY_MSG[G.realm].ic} ${STY_MSG[G.realm].n}</b>에게 말을 걸어도 돼요.</p>
   <div style="display:flex;flex-direction:column;gap:8px">${rows}</div>
   ${nd>0?`<p style="text-align:center">⏳ 다음 장 「${STORY[open].n}」까지 <b>${nd}일</b></p>`:open>=STORY.length?`<p style="text-align:center">1부 6장이 모두 열렸어요!</p>`:""}
   <h3>🖼️ 그림 카드 ${Object.keys(d.cards||{}).length}/${STORY.length}</h3><div class="stcards">${STORY.map((C,i)=>`<div class="${(d.cards||{})[i]?"":"no"}"><b>${(d.cards||{})[i]?C.ic:"❔"}</b>${(d.cards||{})[i]?C.card:i+1+"장"}</div>`).join("")}</div>
   <h3>🏅 이번 장(${open}장)까지 깬 모험가</h3>${kings.length?`<p>${kings.join(" · ")}</p>`:'<p style="font-size:13px">아직 아무도 없어요. 가장 먼저 깨 보세요!</p>'}`);
  layers.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>styStart(+b.dataset.st));
  layers.querySelectorAll("[data-rp]").forEach(b=>b.onclick=()=>{ const i=+b.dataset.rp; styComic(STORY[i].intro.concat(STORY[i].outro),i,()=>showStory()); });
  layers.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{ const t=styTarget(); if(t){ setGuide(t); closeLayer(); } else if(st&&st.k==="fish"){ toast("🎣 물가에서 낚시 버튼","수도 분수·연못·호숫가",2.4); closeLayer(); } else closeLayer(); }); }
CTX_EXTRA.push(()=>{ const n=styNearTalk(); if(!n) return null; const w=styWho(n.who,styData().cur); return {t:`💬 ${w.n}에게 말 걸기`,f:()=>styTalk(n.who)}; });
TITLES.push({id:"st1",n:"이야기의 시작",t:0,h:"📜 신들의 이야기 1장 끝내기",g:()=>[Math.min(1,styData().c),1]},{id:"st3",n:"성화의 수호자",t:1,h:"📜 신들의 이야기 3장 끝내기",g:()=>[Math.min(3,styData().c),3]},{id:"st6",n:"혼돈을 잠재운 영웅",t:3,h:"📜 신들의 이야기 1부(6장) 모두 끝내기",g:()=>[styData().c,6]});
</script>
