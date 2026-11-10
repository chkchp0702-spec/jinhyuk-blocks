<script>
/* ================= v101: 🎰 신들의 무기 뽑기 · 👑 유일왕의 무기 (아들들 기획 11/10) =================
   - 근거리 17등급(공격력 +%) · 원거리 7등급(「던지기」가 그 무기로 바뀌고 던지기 데미지 +%).
   - 확률은 아이들 표의 순서를 그대로 살리고, 합이 100%가 되게 + "희박하지만 실제로 나오는" 값으로 맞춤(GZ_M / GZ_R 의 p).
   - 뽑기권 🎟: 매일 무료 1장씩 · 보스 처치 · 금화 구매(100+10·Lv). 10연속은 한 개 이상 높은 등급 보장. 80번 동안 귀한 게 안 나오면 보장(천장).
   - 👑 유일왕의 무기 4개: 뽑기에서 아주 드물게(0.002%) 바로 나오거나, 「유일왕의 파편」을 모아 만들기(진짜 얻는 길).
       게슈탈트의 눈(치명타) · 카타스트로피(지배) · 데우스 엑스 마키나(절대방어) · 아르카이온 제로(궁극기 만상종결·무시원)
   - 다른 플레이어를 때릴 때는 뽑기 무기 힘이 크게 줄어듦(gzPvp) — 친구들이 한 방에 쓰러지지 않게.
   - 저장: G.gc={tk,cm[],cr[],m,r,pm,pr,n,fr,k[],evo,fd,ult}. 보관 주제 kg/<번호> = 그 무기를 처음 얻은 사람. */
const GZ_M=[ {n:"미친",w:"루비소드",p:55,b:.05},{n:"외계",w:"광선검",p:20,b:.1},{n:"수호신",w:"대전의 검",p:12,b:.16},{n:"타이탄",w:"묠니르",p:6,b:.24},{n:"스크램블",w:"불검",p:3.5,b:.33},{n:"공허",w:"다이아 검",p:2,b:.44},
  {n:"절대적",w:"빛의 대검",p:.8,b:.58},{n:"신성",w:"신검",p:.4,b:.75},{n:"멀티버스",w:"광선검",p:.15,b:.95},{n:"초월",w:"루비소드",p:.07,b:1.2},{n:"구원",w:"빛의 대검",p:.04,b:1.45},{n:"신",w:"신검",p:.02,b:1.75},
  {n:"절대자",w:"대전의 검",p:.01,b:2.1},{n:"갓즈",w:"묠니르",p:.005,b:2.5},{n:"개념",w:"다이아 검",p:.003,b:3},{n:"무한",w:"불검",p:.0015,b:3.6},{n:"종결",w:"종결의 검",p:.0005,b:4.5} ];
const GZ_R=[ {n:"공허",w:"아이스스피어",p:60,b:.1,c:0x8fe6ff},{n:"구원",w:"번개",p:25,b:.25,c:0xfff07a,zap:1},{n:"절대자",w:"무한창",p:9,b:.5,c:0xb48cff},{n:"인피니티",w:"이노센트 제로",p:5,b:.8,c:0xffffff},
  {n:"핵",w:"핵무기",p:.9,b:1.4,c:0x9dff5a,nuke:1},{n:"종결",w:"종결의 창",p:.09,b:2.2,c:0xff4a5a,zap:1},{n:"제작자",w:"제작자의 번개",p:.01,b:3.5,c:0xffd84a,zap:1,nuke:1} ];
const GZ_KING=[ {n:"게슈탈트의 눈",ic:"👁",h:"모든 것을 볼 수 있다",e:"약점이 보여요 · 치명타 확률 +25%",cost:100},{n:"카타스트로피",ic:"🌀",h:"모든 것을 지배한다",e:"공격력 +50% · 때린 일반 괴물이 10% 확률로 굴복(바로 쓰러짐)",cost:200},
  {n:"데우스 엑스 마키나",ic:"🛡",h:"절대방어",e:"받는 피해 절반 · 쓰러질 피해를 60초에 한 번 막고 체력 50% 회복",cost:350},{n:"아르카이온 제로",ic:"👑",h:"태초 이전의 종결자 · 네 번째 숨겨진 무기",e:"공격력 +150% · 절대진화(처치할수록 영원히 강해짐, 최대 +100%) · 궁극기 「만상종결·무시원」",cost:600} ];
const GZ_ALIAS=["신들의 무덤","무한의 살해자","창조 이전의 왕관","모든 결말의 주인","존재하지 않는 절대자"];
const GZ_KP=.002, GZ_PITY=80, GZ_ULT_CD=120;   // 유일왕 직접 뽑기 확률(%) · 천장 · 궁극기 재사용(초)
const GZ={ult:0,save:0,aura:null,auraC:-1,netw:false,hudT:0,first:{}};
function gz(){ const c=G.gc=G.gc||{}; if(c.tk==null) c.tk=5; c.cm=c.cm||[]; c.cr=c.cr||[]; if(c.m==null) c.m=-1; if(c.r==null) c.r=-1; c.pm=c.pm||0; c.pr=c.pr||0; c.n=c.n||0; c.fr=c.fr||0; c.k=c.k||[0,0,0,0]; c.evo=c.evo||0; return c; }
function gzCol(i,n){ const t=i/(n-1); const stops=[[141,147,168],[58,141,255],[176,97,255],[255,207,74],[255,90,70],[255,255,255]]; const f=t*(stops.length-1), a=Math.floor(Math.min(f,stops.length-1.001)), u=f-a; const A=stops[a],B=stops[a+1]; return [0,1,2].map(k=>Math.round(A[k]+(B[k]-A[k])*u)); }
function gzCss(i,n){ const c=gzCol(i,n); return `rgb(${c[0]},${c[1]},${c[2]})`; }
function gzHex(i,n){ const c=gzCol(i,n); return (c[0]<<16)|(c[1]<<8)|c[2]; }
function gzName(kind,g){ const T=kind==="m"?GZ_M:GZ_R; return `${T[g].n} ${T[g].w}`; }
function gzPct(p){ return p>=1?p+"%":p>=.01?p.toFixed(2).replace(/0+$/,"")+"%":`${p}% (약 ${fmt(Math.round(100/p))}번에 1번)`; }
function gzCost(){ return 100+G.lv*10; }
function gzEvo(){ return Math.min(1,gz().evo*.0005); }
/* 공격력 배율(근거리 무기 + 유일왕) · 던지기 배율(원거리 무기) */
function gzAtkMul(){ const c=gz(); let m=1+(c.m>=0?GZ_M[c.m].b:0); if(c.k[1]) m+=.5; if(c.k[3]) m+=1.5+gzEvo(); return m; }
function gzThrowMul(){ const c=gz(); return 1+(c.r>=0?GZ_R[c.r].b:0); }
function gzPvp(d){ const m=gzAtkMul()*1.3; return Math.max(1,Math.round(d/Math.pow(m,.75))); }   // 다른 플레이어에게는 늘어난 힘의 1/4제곱만 남김
/* ---------- 뽑기 ---------- */
function gzRoll(T,minG){ let tot=0; for(let i=minG||0;i<T.length;i++) tot+=T[i].p; let r=Math.random()*tot; for(let i=minG||0;i<T.length;i++){ r-=T[i].p; if(r<=0) return i; } return T.length-1; }
function gzPull(kind,minG){ const c=gz(), T=kind==="m"?GZ_M:GZ_R, rare=kind==="m"?6:4, pk=kind==="m"?"pm":"pr"; let g;
  if(c[pk]+1>=GZ_PITY) g=gzRoll(T,rare); else g=gzRoll(T,minG||0);
  if(g>=rare) c[pk]=0; else c[pk]++;
  const own=kind==="m"?c.cm:c.cr; const isNew=!own[g]; own[g]=(own[g]||0)+1; c.n++; c.fr+=2; let equip=false; const ek=kind==="m"?"m":"r"; if(g>c[ek]){ c[ek]=g; equip=true; }
  let king=-1; if(Math.random()*100<GZ_KP){ const left=[0,1,2,3].filter(i=>!c.k[i]&&(i<3||(c.k[0]&&c.k[1]&&c.k[2]))); if(left.length){ king=left[0]; gzKingGive(king,true); } }
  return {kind,g,isNew,equip,king}; }
function gzDo(kind,n){ const c=gz(); if(c.tk<n){ const need=n-c.tk, cost=need*gzCost(); if(G.gold<cost){ toast("🎟 뽑기권과 금화가 모자라요",`뽑기권 ${need}장 = 금화 ${fmt(cost)}`,2); return; } G.gold-=cost; c.tk+=need; }
  c.tk-=n; const out=[]; const floor=kind==="m"?3:2; for(let i=0;i<n;i++){ const guar=(n>=10&&i===n-1&&!out.some(o=>o.g>=floor))?floor:0; out.push(gzPull(kind,guar)); }
  saveGame(); gzAura(true); showGachaResult(kind,out); }
function showGachaResult(kind,out){ const T=kind==="m"?GZ_M:GZ_R; const best=out.reduce((a,b)=>b.g>a.g?b:a,out[0]); const rows=out.map(o=>`<div class="gzr" style="--gc:${gzCss(o.g,T.length)}"><b>${T[o.g].n}</b><span>${T[o.g].w}</span>${o.isNew?"<i>NEW</i>":""}${o.king>=0?`<em>👑 ${GZ_KING[o.king].n}!</em>`:""}</div>`).join("");
  card(`<h2>🎰 뽑기 결과</h2><div class="gzgrid">${rows}</div><p style="font-size:13px">${best.equip||out.some(o=>o.equip)?"더 높은 등급이 나와서 자동으로 꼈어요. ":""}👑 유일왕의 파편 +${out.length*2} (지금 ${fmt(gz().fr)}개)</p><button class="go" id="gzAgain" style="align-self:center">뽑기 창으로</button>`);
  $("gzAgain").onclick=()=>showGacha(); const rareG=kind==="m"?6:4; if(best.g>=rareG){ jingle([523,659,784,1046,1318]); buzz([40,40,80]); try{ lvBanner("✨ "+T[best.g].n+" 등급!",T[best.g].w,gzPct(T[best.g].p)+"의 확률을 뚫었어요",gzCss(best.g,T.length)); }catch(e){} try{ fxRing(P.x,P.z,gzHex(best.g,T.length),14,1); }catch(e){} } else jingle([659,784]); }
/* ---------- 유일왕의 무기 ---------- */
function gzKingGive(i,fromPull){ const c=gz(); if(c.k[i]) return; c.k[i]=1; saveGame(); const K=GZ_KING[i]; try{ if(!GZ.first[i]) net.pushRet("kg/"+i,{i:G.id,n:G.name,r:G.realm,k:i,t:Date.now()}); }catch(e){}
  setTimeout(()=>{ try{ lvBanner("👑 유일왕의 무기",K.n,K.h,"#ff4a5a"); }catch(e){ toast("👑 "+K.n,K.h,3); } jingle([392,523,659,784,1046,1318]); buzz([60,40,60,40,120]); try{ fxRing(P.x,P.z,0xff4a5a,24,1.6); fxBolt(P.x,P.z,0xffd84a); }catch(e){} },fromPull?900:100); gzUltBtn(); }
function gzForge(i){ const c=gz(), K=GZ_KING[i]; if(c.k[i]) return; if(i===3&&!(c.k[0]&&c.k[1]&&c.k[2])){ toast("앞의 세 무기를 먼저 모아야 해요","네 번째는 숨겨진 무기예요",2); return; } if(c.fr<K.cost){ toast("👑 유일왕의 파편이 모자라요",`${fmt(c.fr)} / ${K.cost}`,2); return; } c.fr-=K.cost; gzKingGive(i,false); closeLayer(); }
NETX.push({sub:"kg/+",pre:"kg/",f:(d)=>{ if(!d||d.k==null||!d.n||!(d.t>0)) return; const o=GZ.first[d.k]; if(!o||d.t<o.t) GZ.first[d.k]={n:String(d.n).slice(0,12),t:d.t,me:d.i===G.id}; }});
function gzUltimate(){ const c=gz(); if(!c.k[3]||P.dead||layerOpen) return; if(GZ.ult>0){ toast(`만상종결 준비 중… ${Math.ceil(GZ.ult)}초`,null,.8); return; } if(inCapital(P.x,P.z)){ toast("수도 안에서는 쓸 수 없어요",null,1); return; }
  GZ.ult=GZ_ULT_CD; const st=stat(); P.combat=4; if(player&&player.userData.gl) animState(player,"skill"); drama(0x1a0010,.6,1.6); P.shake=Math.max(P.shake||0,1.2); buzz([80,40,160]); tone(80,.6,"sawtooth",0,.14); tone(160,.5,"square",.1,.1); tone(1200,.5,"sine",.35,.08);
  try{ lvBanner("궁극기","만상종결 · 무시원","존재삭제 — 모든 것이 처음으로 돌아간다","#ff4a5a"); }catch(e){} fxRing(P.x,P.z,0xff4a5a,60,1.4); fxRing(P.x,P.z,0xffffff,40,1); fxFlash(P.x,3,P.z,0xff4a5a,20,.8);
  const list=mobs.filter(m=>m.hp>0&&Math.hypot(m.x-P.x,m.z-P.z)<35+(m.titan?8:0)); list.forEach((m,k)=>setTimeout(()=>{ if(m.hp<=0&&!m.titan) return; try{ fxBolt(m.x,m.z,0xff4a5a); }catch(e){} if(m.boss||m.titan||m.elite) damageMob(m,st.atk*30,true); else damageMob(m,Math.max(m.hp+1,st.atk*30),true); },250+k*60));
  try{ net.send({t:"a",k:"skl"}); }catch(e){} }
function gzUltBtn(){ let b=$("bGzUlt"); const has=gz().k[3]; if(!has){ if(b) b.hidden=true; return; } if(!b){ const th=$("bThrow"); if(!th||!th.parentNode) return; b=document.createElement("button"); b.id="bGzUlt"; b.type="button"; b.className="act gzult"; b.innerHTML='<span>만상<br>종결</span><small id="gzUltCd"></small><i class="cd" id="gzUltV"></i>'; th.parentNode.appendChild(b); try{ hold(b,gzUltimate); }catch(e){ b.onclick=gzUltimate; } } b.hidden=false; }
/* ---------- 다른 함수 감싸기 ---------- */
(function(){
  const _st=stat; stat=function(){ const s=_st(); const c=gz(); s.atk*=1.3*gzAtkMul(); if(c.k[0]) s.crit+=.25; return s; };   // 1.3 = 요청사항 "스킬·일반공격 데미지 업"
  const _dm=damageMob; damageMob=function(m,dmg,crit){ try{ if(gz().k[1]&&!m.boss&&!m.titan&&!m.elite&&m.hp>0&&dmg<m.hp&&Math.random()<.1){ dmg=m.hp+1; floatDmg(m.x,5*m.scale,m.z,"굴복!","gain"); } }catch(e){} return _dm(m,dmg,crit); };
  const _km=killMob; killMob=function(m){ _km(m); try{ const c=gz(); if(c.k[3]&&c.evo<2000) c.evo++; if(m.war||m.titan) return; if(m.boss){ c.tk+=1; c.fr+=3; floatDmg(m.x,5,m.z,"🎟 뽑기권 +1","gain"); } else if(m.elite){ c.fr+=1; if(Math.random()<.25){ c.tk+=1; floatDmg(m.x,5,m.z,"🎟 뽑기권 +1","gain"); } } }catch(e){} };
  const _hp=hurtPlayer; hurtPlayer=function(dmg,from){ try{ const c=gz(); if(c.k[2]&&!P.dead&&P.invul<=0&&typeof dmg==="number"){ dmg*=.5; if(dmg>=P.hp&&GZ.save<=0&&!(P.y>0.8&&!(typeof from==="object"&&from&&from.sure))){ GZ.save=60; P.hp=Math.max(P.hp,Math.round(stat().mhp*.5)); P.invul=Math.max(P.invul||0,3); floatDmg(P.x,4.6,P.z,"🛡 절대방어!","gain"); fxRing(P.x,P.z,0xffd84a,8,.8); jingle([784,1046]); return; } } }catch(e){} return _hp(dmg,from); };
  const _td=titanDefeated; titanDefeated=function(){ const was=TB.claimed; _td(); try{ if(!was&&TB.claimed){ const c=gz(); c.tk+=5; c.fr+=40; saveGame(); setTimeout(()=>toast("🎟 뽑기권 +5 · 👑 유일왕의 파편 +40","거대 보스 보상",3),2500); } }catch(e){} };
  /* 던지기: 원거리 뽑기 무기를 끼면 그 무기를 던짐 */
  const _tw=throwWeapon; throwWeapon=function(){ const c=gz(); if(c.r<0) return _tw(); if(P.dead||layerOpen||throwCd>0) return; const R=GZ_R[c.r]; throwCd=3; const st=stat(); P.atkAnim=.35; P.combat=4; if(player.userData.gl) animState(player,"skill");
    const tg=nearestFoe(24); if(tg) P.rot=Math.atan2(tg.x-P.x,tg.z-P.z); if(player) player.rotation.y=P.rot; const range=20; const tx=tg?tg.x:P.x+Math.sin(P.rot)*range, tz=tg?tg.z:P.z+Math.cos(P.rot)*range; const sx=P.x+Math.sin(P.rot)*.8, sz=P.z+Math.cos(P.rot)*.8; const crit=Math.random()<st.crit;
    const rad=R.nuke?9:4.5; fireProj({x:sx,z:sz,y:2.6,tx,tz,ty:1.4,kind:"orb",speed:R.nuke?18:30,arc:R.nuke?.6:.12,dmg:st.atk*3*gzThrowMul(),crit,r:rad,hits:"mobs",zap:R.zap,big:1,color:R.c});
    if(R.nuke) setTimeout(()=>{ try{ fxFlash(tx,2,tz,R.c,16,.7); fxRing(tx,tz,R.c,26,1); P.shake=Math.max(P.shake||0,.9); }catch(e){} },Math.hypot(tx-sx,tz-sz)/18*1000);
    drama(R.c,.25,.6); tone(300,.12,"sawtooth",0,.1); tone(R.zap?1400:600,.1,"triangle",.05,.08); buzz(20); try{ net.send({t:"a",k:"thr",pk:"orb",sx:+sx.toFixed(1),sz:+sz.toFixed(1),pts:[[+tx.toFixed(1),+tz.toFixed(1)]]}); }catch(e){} };
  const _th=throwHud; throwHud=function(){ const c=gz(); const b=$("bThrow"); if(c.r<0||!b){ if(b&&b._k==="gz") b._k=null; return _th(); } const nm=GZ_R[c.r].w; if(b._k!=="gz"||b._gn!==nm){ b._k="gz"; b._gn=nm; $("thrNm").textContent=nm; } const tc=throwCd>0?Math.ceil(throwCd)+"초":""; if(b._tc!==tc){ b._tc=tc; $("thrCd").textContent=tc; } const pv=throwCd>0?Math.round(throwCd/3*100)+"%":"0%"; if(b._pv!==pv){ b._pv=pv; $("thrCdV").style.setProperty("--p",pv); } };
})();
/* ---------- 발밑 등급 빛 고리 ---------- */
function gzAura(pop){ const c=gz(); const g=c.k[3]?99:c.m; if(g===GZ.auraC&&!pop) return; GZ.auraC=g; if(GZ.aura){ scene.remove(GZ.aura); GZ.aura=null; } if(g<3) return; const col=g===99?0xff4a5a:gzHex(g,GZ_M.length);
  const m=new THREE.Mesh(new THREE.RingGeometry(1.25,1.5,40),glowMat(col,.5)); m.rotation.x=-Math.PI/2; m.userData.noOutline=true; scene.add(m); GZ.aura=m; if(pop){ try{ SLASH.wrap(col); }catch(e){} } }
XTICK.push(dt=>{ if(!started||G.realm<0) return; if(GZ.ult>0) GZ.ult-=dt; if(GZ.save>0) GZ.save-=dt;
  if(!GZ.netw&&typeof net!=="undefined"&&net&&net.send){ GZ.netw=true; const _s=net.send; net.send=function(o){ try{ if(o&&o.t==="hit"&&o.d>0) o.d=gzPvp(o.d); }catch(e){} return _s(o); }; }
  if(GZ.aura){ GZ.aura.position.set(P.x,hAt(P.x,P.z)+.09+(P.y||0)*0,P.z); GZ.aura.rotation.z+=dt*.8; GZ.aura.visible=!P.dead; }
  GZ.hudT-=dt; if(GZ.hudT>0) return; GZ.hudT=.25; gzAura(false); gzUltBtn(); const b=$("bGzUlt"); if(b&&!b.hidden){ const tc=GZ.ult>0?Math.ceil(GZ.ult)+"초":""; if(b._tc!==tc){ b._tc=tc; $("gzUltCd").textContent=tc; } const pv=GZ.ult>0?Math.round(GZ.ult/GZ_ULT_CD*100)+"%":"0%"; if(b._pv!==pv){ b._pv=pv; $("gzUltV").style.setProperty("--p",pv); } } });
/* ---------- 창 ---------- */
function gzFree(){ const c=gz(); const d=kday(); if(c.fd===d) return false; c.fd=d; c.tk+=2; saveGame(); return true; }
function showGacha(tab){ const c=gz(); const got=gzFree(); tab=tab||"pull";
  const tabs=`<div class="gztabs"><button data-t="pull" class="${tab==="pull"?"on":""}">🎰 뽑기</button><button data-t="bag" class="${tab==="bag"?"on":""}">⚔ 내 무기</button><button data-t="king" class="${tab==="king"?"on":""}">👑 유일왕</button><button data-t="odds" class="${tab==="odds"?"on":""}">📊 확률표</button></div>`;
  let body="";
  if(tab==="pull"){ body=`<p>🎟 뽑기권 <b>${c.tk}</b>장 · 금화 ${fmt(G.gold)} · 모자란 뽑기권은 한 장에 금화 ${fmt(gzCost())}${got?"<br>🎁 오늘의 무료 뽑기권 2장을 받았어요!":""}</p>
     <div class="row"><div class="ic">⚔</div><div class="t"><div>근거리 무기 뽑기</div><span>17등급 · 공격력이 올라요 · 지금: ${c.m>=0?gzName("m",c.m)+" (+"+Math.round(GZ_M[c.m].b*100)+"%)":"없음"}</span></div><button class="buy" id="gzM1">1번</button><button class="buy" id="gzM10">10번</button></div>
     <div class="row"><div class="ic">🏹</div><div class="t"><div>원거리 무기 뽑기</div><span>7등급 · 「던지기」가 그 무기로! · 지금: ${c.r>=0?gzName("r",c.r)+" (+"+Math.round(GZ_R[c.r].b*100)+"%)":"없음"}</span></div><button class="buy" id="gzR1">1번</button><button class="buy" id="gzR10">10번</button></div>
     <div class="diary"><p>🎟 뽑기권: 매일 처음 열면 2장 · 보스 처치 +1 · ★정예 가끔 +1 · 거대 보스 승리 +5</p><p>🔟 10번 뽑기는 근거리 「타이탄」·원거리 「절대자」 이상 1개 보장</p><p>🍀 ${GZ_PITY}번 동안 귀한 등급이 안 나오면 다음 뽑기는 근거리 「절대적」·원거리 「핵」 이상 확정 (근거리 ${c.pm}/${GZ_PITY} · 원거리 ${c.pr}/${GZ_PITY})</p><p>👑 뽑을 때마다 유일왕의 파편 +2 (지금 ${fmt(c.fr)}개)</p></div>`; }
  else if(tab==="bag"){ const mk=(kind,T,own,eq)=>T.map((t,i)=>own[i]?`<div class="row gzrow" style="--gc:${gzCss(i,T.length)}"><div class="ic">${kind==="m"?"⚔":"🏹"}</div><div class="t"><div><b class="gzn">${t.n}</b> ${t.w} ×${own[i]}</div><span>${kind==="m"?"공격력":"던지기 데미지"} +${Math.round(t.b*100)}%</span></div><button class="buy${eq===i?" alt":""}" data-eq="${kind}${i}">${eq===i?"끼는 중":"끼기"}</button></div>`:"").reverse().join("");
     const a=mk("m",GZ_M,c.cm,c.m), b=mk("r",GZ_R,c.cr,c.r); body=`<p>지금 내 공격력 배율 ×${(1.3*gzAtkMul()).toFixed(2)} · 던지기 ×${gzThrowMul().toFixed(2)} · 뽑은 횟수 ${fmt(c.n)}</p><h3>⚔ 근거리</h3>${a||'<p style="font-size:13px">아직 없어요</p>'}<h3>🏹 원거리</h3>${b||'<p style="font-size:13px">아직 없어요</p>'}`; }
  else if(tab==="king"){ const rows=GZ_KING.map((K,i)=>{ const f=GZ.first[i]; const lock=i===3&&!(c.k[0]&&c.k[1]&&c.k[2]); return `<div class="row gzrow" style="--gc:${i===3?"#ff4a5a":"#ffd84a"}"><div class="ic">${lock&&!c.k[i]?"❓":K.ic}</div><div class="t"><div><b class="gzn">${lock&&!c.k[i]?"네 번째 숨겨진 무기":K.n}</b></div><span>${lock&&!c.k[i]?"앞의 세 무기를 모두 모으면 모습을 드러내요":K.h+" — "+K.e}${f?`<br>📜 첫 주인: ${f.n}`:""}</span></div>${c.k[i]?'<button class="buy alt" disabled>가졌어요</button>':`<button class="buy" data-fg="${i}" ${c.fr<K.cost||lock?"disabled":""}>파편 ${K.cost}</button>`}</div>`; }).join("");
     body=`<div class="diary"><p>📖 유일왕에게는 무기가 네 개 있었다. 온 세계에 단 네 개뿐.</p><p>${GZ_ALIAS.map(a=>"「"+a+"」").join(" · ")}</p><p style="color:#a85a00;font-weight:800">최초이자 최후의 선언</p></div><p>👑 유일왕의 파편 <b>${fmt(c.fr)}</b>개 · 뽑기 +2 · 보스 +3 · ★정예 +1 · 거대 보스 승리 +40<br>뽑기에서 ${GZ_KP}%(5만 번에 1번) 확률로 바로 나오기도 해요.</p>${rows}${c.k[3]?`<p style="font-size:13px">절대진화: 공격력 +${(gzEvo()*100).toFixed(1)}% (처치 ${fmt(c.evo)}/2,000) · 궁극기는 「던지기」 위의 빨간 버튼 (${GZ_ULT_CD}초마다)</p>`:""}`; }
  else { const tb=(T)=>T.map((t,i)=>`<div class="gzo" style="--gc:${gzCss(i,T.length)}"><b>${t.n}</b><span>${gzPct(t.p)}</span></div>`).join(""); body=`<h3>⚔ 근거리 무기</h3><div class="gzodds">${tb(GZ_M)}</div><h3>🏹 원거리 무기</h3><div class="gzodds">${tb(GZ_R)}</div><h3>👑 유일왕의 무기</h3><div class="gzodds"><div class="gzo" style="--gc:#ff4a5a"><b>유일왕의 무기</b><span>${gzPct(GZ_KP)}</span></div></div><p style="font-size:12px">아이디어 표의 순서는 그대로, 다 더하면 딱 100%가 되게 맞췄어요. 뽑기는 게임 금화와 뽑기권으로만 해요.</p>`; }
  card(`<h2>🎰 신들의 무기 뽑기</h2>${tabs}${body}`);
  layers.querySelectorAll(".gztabs button").forEach(b=>b.onclick=()=>showGacha(b.dataset.t));
  const on=(id,f)=>{ const e=$(id); if(e) e.onclick=f; }; on("gzM1",()=>gzDo("m",1)); on("gzM10",()=>gzDo("m",10)); on("gzR1",()=>gzDo("r",1)); on("gzR10",()=>gzDo("r",10));
  layers.querySelectorAll("[data-eq]").forEach(b=>b.onclick=()=>{ const k=b.dataset.eq[0], i=+b.dataset.eq.slice(1); const key=k==="m"?"m":"r"; c[key]=c[key]===i?-1:i; saveGame(); gzAura(true); showGacha("bag"); });
  layers.querySelectorAll("[data-fg]").forEach(b=>b.onclick=()=>gzForge(+b.dataset.fg)); }
MENU_X.push({ic:"🎰",n:"신들의 무기 뽑기",id:"gzBtn",sub:()=>{ const c=gz(); return `🎟 ${c.tk}장${c.fd!==kday()?" · 🎁 오늘 무료 2장!":""} · 근거리 ${c.m>=0?GZ_M[c.m].n:"-"} · 원거리 ${c.r>=0?GZ_R[c.r].n:"-"} · 👑 ${c.k.filter(x=>x).length}/4`; },f:()=>showGacha()});
TITLES.push({id:"gz1",n:"뽑기의 달인",t:1,h:"무기 100번 뽑기",g:()=>[gz().n,100]},{id:"gz2",n:"확률을 뚫은 자",t:2,h:"근거리 「절대적」 이상 얻기",g:()=>[gz().cm.some((n,i)=>n&&i>=6)?1:0,1]},{id:"gz3",n:"유일왕의 후계자",t:3,h:"유일왕의 무기 하나 얻기",g:()=>[gz().k.filter(x=>x).length,1]},{id:"gz4",n:"태초 이전의 종결자",t:3,h:"아르카이온 제로 얻기",g:()=>[gz().k[3]?1:0,1]});
</script>
<style>
.gztabs{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:2px 0 6px}
.gztabs button{font-size:13px;font-weight:800;padding:7px 10px;border-radius:10px;border:2px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#fff}
.gztabs button.on{background:linear-gradient(180deg,#ffe08a,#e0a020);color:#2a1606;border-color:#fff}
.gzgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;width:100%}
.gzr{position:relative;display:flex;flex-direction:column;align-items:center;padding:8px 4px;border-radius:10px;border:2px solid var(--gc);background:rgba(0,0,0,.35);box-shadow:0 0 10px -2px var(--gc)}
.gzr b{color:var(--gc);font-size:15px;text-shadow:0 1px 0 #000} .gzr span{font-size:12px;opacity:.92}
.gzr i{position:absolute;top:-6px;right:-4px;font-style:normal;font-size:10px;font-weight:900;background:#ff4a5a;color:#fff;border-radius:6px;padding:1px 4px}
.gzr em{font-style:normal;font-size:12px;color:#ffd84a;font-weight:900}
.gzrow{border-left:4px solid var(--gc)} .gzn{color:var(--gc);text-shadow:0 1px 0 #000}
.gzodds{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px;width:100%}
.gzo{display:flex;justify-content:space-between;gap:6px;padding:4px 8px;border-radius:8px;background:rgba(0,0,0,.3);border-left:4px solid var(--gc);font-size:12px}
.gzo b{color:var(--gc)}
.act.gzult{position:absolute;left:-64px;bottom:80px;background:radial-gradient(circle at 35% 30%,#ff9aa2,#8a0018 70%);font-size:11px;line-height:1.05;text-shadow:0 1px 0 #000}
.act.gzult[hidden]{display:none}
@media (max-height:640px){ .act.gzult{bottom:70px} }
</style>
