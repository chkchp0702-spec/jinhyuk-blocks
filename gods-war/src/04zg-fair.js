<script>
/* ================= v83: ⚖ 공평 맞추기 =================
   같은 방(비밀번호 1004)의 모험가 중 가장 높은 사람에게 나머지가 저절로 맞춰짐.
   맞추는 것: 레벨·경험치 · 계급(승급) · 장비 등급(무기·갑옷·유물 칸마다 가장 높은 것) · 대장간 강화(+단계·박자 점수) · 신수(종류마다 가장 높은 레벨, 없는 신수는 받음)
   맞추지 않는 것: 금화·재료(쓰면 다시 채워지는 문제) · 꾸미기 · 칭호 · 기록
   정보는 ① 지금 접속한 친구(PEERS) ② 모험가 명부(ROSTER, 30일 안에 들어온 사람)에서 읽음. 5초마다 확인. */
const FAIR={t:20,last:"",end:Date.parse("2026-11-12T00:00:00+09:00")};   /* v84: 이번 한 번만 — 캐릭터마다 한 번 맞추면 끝(G.fairDone), 11/12 0시 이후엔 아예 안 함. 접속 20초 뒤(친구 정보가 다 도착한 뒤) 확인 */
(function(){ const _mp=myProfile; myProfile=function(on){ const p=_mp(on); try{ const ps={}; const D=G.pets||{}; for(const r in D){ if(D[r]&&D[r].lv) ps[r]=D[r].lv; } p.fa={fg:G.fg||0,fq:G.fgQ||0,ps}; }catch(e){} return p; }; })();
function fairPool(){ const L=[]; const now=Date.now();
  for(const id in ROSTER){ const p=ROSTER[id]; if(!p||p.i===G.id||now-(p.t||0)>30*86400000) continue; L.push({n:p.n,l:p.l|0,x:p.x||0,k:p.k|0,e:p.e||[-1,-1,-1],fg:p.fa?p.fa.fg|0:0,fq:p.fa?p.fa.fq|0:0,ps:p.fa?p.fa.ps||{}:(p.pt?{[p.pt[0]]:p.pt[1]}:{})}); }
  for(const id in PEERS){ const o=PEERS[id]; if(!o||o.lv==null) continue; const e=(o.e||"-1,-1,-1").split(",").map(Number); L.push({n:o.name,l:o.lv|0,x:0,k:o.rank|0,e,fg:o.fg|0,fq:0,ps:o.pt?{[o.pt[0]]:o.pt[1]}:{}}); }
  return L; }
function fairSync(quiet){ if(!started||G.realm<0||P.trial||G.fairDone||Date.now()>FAIR.end) return; const L=fairPool(); if(!L.length) return; const ch=[]; let who="";
  const top=L.reduce((a,b)=>(b.l>a.l||(b.l===a.l&&b.x>a.x))?b:a);
  if(top.l>G.lv||(top.l===G.lv&&top.x>G.xp+1)){ const up=top.l>G.lv; G.lv=Math.min(LVMAX,top.l); G.xp=Math.max(G.xp,Math.min(top.x,xpNeed(G.lv)-1)); if(up){ ch.push("레벨 "+G.lv); who=top.n; } }
  const kMax=Math.min(RANK_LV.length-1,Math.max(...L.map(p=>p.k))); let look=false;
  if(kMax>G.rank){ G.rank=kMax; ch.push("계급 "+RM().ranks[G.rank]); look=true; who=who||L.find(p=>p.k===kMax).n; }
  ["w","a","r"].forEach((s,i)=>{ const m=Math.min(TIER[s].length-1,Math.max(...L.map(p=>p.e[i]==null?-1:p.e[i]|0))); if(m>(G.eq[s]==null?-1:G.eq[s])){ G.eq[s]=m; ch.push(`${RAR[m].n} ${itemName(s,m)}`); look=true; } });
  const fg=Math.min(FG_MAX,Math.max(...L.map(p=>p.fg))); if(fg>(G.fg||0)){ G.fg=fg; ch.push("대장간 +"+fg); look=true; }
  const fq=Math.max(...L.map(p=>p.fq)); if(fq>(G.fgQ||0)) G.fgQ=fq;
  let pets=false; try{ petData(); L.forEach(p=>{ for(const r in p.ps){ const lv=Math.min(PET_MAX,p.ps[r]|0); if(!PETS[r]||lv<1) continue; const cur=G.pets[r]; if(!cur){ G.pets[r]={lv,xp:0,t:Date.now()}; ch.push(`신수 ${PETS[r].n} Lv.${lv}`); pets=true; } else if(cur.lv<lv){ cur.lv=lv; cur.xp=0; ch.push(`${PETS[r].n} Lv.${lv}`); pets=true; } } }); if(pets&&(G.pet==null||G.pet<0)) G.pet=+Object.keys(G.pets)[0]; }catch(e){}
  if(!ch.length) return;
  G.fairDone=1;
  P.hp=stat().mhp; saveGame(); if(look) try{ buildPlayer(); }catch(e){} if(pets) try{ rebuildMyPet(); }catch(e){} try{ skNames(); }catch(e){} hudT=0; try{ hud(); }catch(e){} try{ net.hello(); net.pushProfile(1); }catch(e){}
  const key=ch.join("|"); if(quiet||key===FAIR.last) return; FAIR.last=key;
  try{ lvBanner("⚖ 공평 맞추기",who?who+" 님에게 맞췄어요":"친구들에게 맞췄어요",ch.slice(0,4).join(" · ")+(ch.length>4?` 외 ${ch.length-4}개`:"")+" · 이번 한 번만","#9fe0ff"); }catch(e){ toast("⚖ 공평 맞추기",ch.join(" · "),3); }
  try{ fxPillar(0x9fe0ff,1,HIGH()?30:16,1.4,.45); }catch(e){} jingle([523,659,784,1046]); }
XTICK.push(dt=>{ FAIR.t-=dt; if(FAIR.t>0) return; FAIR.t=5; try{ fairSync(); }catch(e){ console.warn(e); } });
</script>
