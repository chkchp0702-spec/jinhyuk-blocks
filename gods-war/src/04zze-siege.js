<script>
/* ================= v113-3: 🏰 기사단 성 차지하기 — 금요일 밤 공성전 (IDEAS G11/11-3 · 사용자: 금요일 저녁 8시로) =================
   세계의 중심 둘레 네 귀퉁이(반지름 135m, 대각선)에 성 4개: 에덴 빛의 성채 · 아스가르드 서리 요새 · 인도 연꽃 성 · 올림푸스 대리석 성.
   - 공성전: 매주 금요일 20:00~20:30(한국 시간). 19:50부터 알림. 첫 회 11/13(금).
   - 성문 체력 300점: 공격 한 번 = 1점(치명타 2점) · 🪵 공성 망치 곁에 서 있으면 2.5초마다 4점(혼자면 🤖 탈로스가 같이 밀어 +4).
     모든 사람의 타격을 더함(실시간 t:"csh" + 보관 cst/g/<성> 로 늦게 온 사람도 맞춤). 기사단이 달라도 같이 부술 수 있음(연합).
   - 성문이 부서지면 안마당의 빛 구슬 곁(4m)에서 30초 버티면 차지! 같은 기사단이 함께 있으면 더 빨리.
     주인 기사단의 진짜 단원이 구슬 8m 안에 있으면 멈춤. 성 앞은 주인 기사단의 「수비 영웅」(결투장 기록으로 만든 복사본 — 접속 안 한 단원)이 지킴.
   - 차지하면 보관 cst/o/<성> = {g 코드, gn 이름, gf 깃발, n 차지한 사람, ts} → 깃발·지도 색이 그 기사단 색. 30분 안에 다시 빼앗길 수도!
   - 성 주인 기사단: 일주일 동안 성 근처(45m)에서 경험치 +10% · 하루 한 번 「성주 보물」(금화 + 뽑기권) · 칭호.
   - 공성전에 함께한 사람(성문 20점 이상 또는 성 근처 60초): 그 주 「공성 상자」 한 번.
   - 기사단이 없으면 성문 부수기만 도울 수 있음(🗡 용병). 공성전이 아닐 때는 누구나 성 안을 구경할 수 있음.
   저장: G.csHitN(성문 점수 누적) · G.csCap(차지 횟수) · G.csWk(공성 상자 받은 주) · G.csDay(성주 보물 받은 날) · G.csDef(쓰러뜨린 수비 영웅). 칭호 3개. */
const CS_R=135, CS_W=10, CS_GATE=300, CS_HOLD=30, CS_DUR=30*60000, CS_HR=20;
const CS_LIST=[{n:"에덴 빛의 성채",ic:"✝",wall:0xf4efe0,trim:0xffd05a,roof:0xffe08a},{n:"아스가르드 서리 요새",ic:"ᚦ",wall:0x8a96a8,trim:0xbfe4ff,roof:0x3a5a8a},{n:"인도 연꽃 성",ic:"🪷",wall:0xe0b080,trim:0xff8fb8,roof:0xd8602a},{n:"올림푸스 대리석 성",ic:"🏛",wall:0xf2efe8,trim:0x5a9adf,roof:0x7a9ad8}];
CS_LIST.forEach((c,i)=>{ const sx=i===0||i===2?1:-1, sz=i<2?-1:1; c.x=sx*CS_R*Math.SQRT1_2; c.z=sz*CS_R*Math.SQRT1_2; c.ga=Math.atan2(-c.z,-c.x); });
const CS={built:false,parts:[],c:[],o:{},hits:{},gsync:{},send:{},sendT:1,ramT:2.5,pubT:3,t:0,hold:{},foes:{},gm:{},hud:null,hudKey:"",noteT:0,live:null,force:0,near:0,part:{},ann:{},capQ:null,lbl:[]};
function csSlot(t){ t=t||Date.now(); const k=kday(t); for(let d=k-1;d<=k+7;d++){ if((d+4)%7!==5) continue; const s=d*86400000-9*3600000+CS_HR*3600000; if(t<s+CS_DUR) return {t:s,w:d}; } return null; }
function csLive(){ const now=Date.now(); if(CS.force&&now<CS.force+CS_DUR) return {t:CS.force,w:-1}; const s=csSlot(); return s&&now>=s.t&&now<s.t+CS_DUR?s:null; }
function csWhen(t){ const d=new Date(t+9*3600000); return `${d.getUTCMonth()+1}/${d.getUTCDate()}(${"일월화수목금토"[d.getUTCDay()]}) 저녁 ${d.getUTCHours()-12}시`; }
function csEpoch(i){ const o=CS.o[i]; return o?o.ts:0; }
function csGateHp(i){ const e=csEpoch(i); const s=(CS.hits[i]&&CS.hits[i].e===e)?CS.hits[i].s:0; return Math.max(0,CS_GATE-s); }
function csMyCode(){ try{ const g=gdMine(); return g?g.c:null; }catch(e){ return null; } }
function csOwnerMine(i){ const o=CS.o[i]; const c=csMyCode(); return !!(o&&c&&o.g===c); }
function csCol(i){ const o=CS.o[i]; if(!o||!o.gf) return null; return GD_COL[o.gf[0]]||"#888"; }
function csSym(i){ const o=CS.o[i]; if(!o||!o.gf) return "🏳"; return GD_SYM[o.gf[1]]||"🛡️"; }
function csOName(i){ const o=CS.o[i]; return o?gdName(o.gn):"주인 없음"; }
/* ---------- 보관·실시간 ---------- */
NETX.push({sub:"cst/+/+",pre:"cst/",f:(d,topic)=>{ const a=String(topic).split("/"); const kind=a[1], i=a[2]|0; if(!CS_LIST[i]||!d) return;
  if(kind==="o"){ csOwnerSet(i,d,false); }
  else if(kind==="g"){ if(!(d.s>0)) return; const h=CS.hits[i]; if(d.e===csEpoch(i)&&(!h||h.e!==d.e||h.s<d.s)) CS.hits[i]={e:d.e,s:Math.min(CS_GATE*2,d.s|0)}; } }});
function csOwnerSet(i,d,live){ if(!d||!d.g||!(d.ts>0)) return false; const cur=CS.o[i]; if(cur&&cur.ts>=d.ts) return false; const o={g:String(d.g).slice(0,8),gn:Array.isArray(d.gn)?d.gn.slice(0,3).map(x=>x|0):[0,0,0],gf:Array.isArray(d.gf)?d.gf.slice(0,2).map(x=>x|0):[0,0],n:String(d.n||"?").slice(0,10),ts:+d.ts};
  CS.o[i]=o; CS.hits[i]={e:o.ts,s:0}; CS.hold[i]=0; csFoesClear(i); csPaint(i);
  if(live&&started){ const mine=csMyCode()===o.g; const C=CS_LIST[i]; try{ lvBanner(mine?"🏰 성을 차지했어요!":"🏰 성의 주인이 바뀌었어요",C.n,`${csSym(i)} ${gdName(o.gn)} · ${o.n}`,csCol(i)); }catch(e){ toast(`🏰 ${C.n}`,`${gdName(o.gn)}의 성이 되었어요`,3); }
    jingle(mine?[523,659,784,1046,1318,1568]:[392,523,659]); buzz(mine?[40,30,80]:[30]); if(mine&&Math.hypot(P.x-C.x,P.z-C.z)<45) csCapReward(i); }
  return true; }
NETR.csh=(o,d)=>{ const i=d.c|0; if(!CS_LIST[i]||!(d.k>0)||d.e!==csEpoch(i)) return; const h=CS.hits[i]&&CS.hits[i].e===d.e?CS.hits[i]:(CS.hits[i]={e:d.e,s:0}); const was=h.s; h.s=Math.min(CS_GATE*2,h.s+Math.min(20,d.k|0)); if(was<CS_GATE&&h.s>=CS_GATE) csGateBroke(i); };
NETR.csc=(o,d)=>{ const i=d.c|0; if(!CS_LIST[i]) return; csOwnerSet(i,d,true); };
function csHit(i,k){ const e=csEpoch(i); const h=CS.hits[i]&&CS.hits[i].e===e?CS.hits[i]:(CS.hits[i]={e,s:0}); const was=h.s; h.s+=k; CS.send[i]=(CS.send[i]||0)+k; G.csHitN=(G.csHitN||0)+k; CS.part.hit=(CS.part.hit||0)+k; if(was<CS_GATE&&h.s>=CS_GATE) csGateBroke(i); }
function csGateBroke(i){ const C=CS_LIST[i]; csGm(i,false); const d=Math.hypot(P.x-C.x,P.z-C.z); if(d<60&&started){ toast(`💥 ${C.n} 성문이 부서졌어요!`,"안마당의 빛 구슬 곁에서 30초 버티면 차지!",3); thud(); buzz([60,40,60]); P.shake=Math.max(P.shake||0,.8); }
  const s=CS.c[i]; if(s){ s.doors.forEach(x=>x.visible=false); s.rubble.visible=true; const g=CS_LIST[i]; fxSpark(g.x+Math.cos(g.ga)*CS_W,2,g.z+Math.sin(g.ga)*CS_W,0xc8a070,30); }
  (CS.foes[i]||[]).forEach(m=>{ m.home=1; }); }
/* ---------- 성 모습 ---------- */
function csBuild(){ if(CS.built) return; CS.built=true;
  CS_LIST.forEach((C,i)=>{ const g=new THREE.Group(); const wall=mat({color:C.wall,roughness:.85}), trim=mat({color:C.trim,roughness:.5,metalness:.2}), roof=mat({color:C.roof,roughness:.7}), dk=mat({color:0x5a3a20,roughness:.95});
    // 성벽: 원통 2겹(바깥·안) + 위 고리 + 성가퀴(인스턴스 하나) → 그리기 횟수를 적게
    const gapA=2*Math.asin(1.75/CS_W); const wd=mat({color:C.wall,roughness:.85,side:THREE.DoubleSide});
    const ow=new THREE.Mesh(new THREE.CylinderGeometry(CS_W+.6,CS_W+.6,4.2,40,1,true,Math.PI/2+gapA/2,Math.PI*2-gapA),wd); ow.position.y=2.1; g.add(ow);
    const iw=new THREE.Mesh(new THREE.CylinderGeometry(CS_W-.6,CS_W-.6,4.2,40,1,true,Math.PI/2+gapA/2,Math.PI*2-gapA),wd); iw.position.y=2.1; g.add(iw);
    const tp=new THREE.Mesh(new THREE.RingGeometry(CS_W-.6,CS_W+.6,40,1,gapA/2,Math.PI*2-gapA),mat({color:C.trim,roughness:.6,side:THREE.DoubleSide})); tp.rotation.x=-Math.PI/2; tp.position.y=4.2; g.add(tp);
    { const N=36, L=[]; for(let k=0;k<N;k++){ const a=(k+.5)/N*Math.PI*2; const aa=Math.min(a,Math.PI*2-a); if(aa<gapA/2+.08) continue; L.push(a); } const im=new THREE.InstancedMesh(GEO.box,trim,L.length); const o3=new THREE.Object3D(); L.forEach((a,k)=>{ o3.position.set(Math.cos(a)*CS_W,4.55,Math.sin(a)*CS_W); o3.rotation.set(0,-a,0); o3.scale.set(1.25,.7,.7); o3.updateMatrix(); im.setMatrixAt(k,o3.matrix); }); g.add(im); }
    // 성문(바깥쪽 = 로컬 +x 쪽, 그룹을 돌려 세계의 중심을 보게 함)
    const doors=[]; [-1,1].forEach(s=>{ const d=box(.35,3.4,1.6,dk,CS_W,1.7,s*.82); g.add(d); doors.push(d); const st=box(.4,.2,1.5,mat({color:0x8a8a9a,metalness:.5}),CS_W+.2,2.4,s*.82); g.add(st); doors.push(st); });
    g.add(box(1.6,1.1,4.6,wall,CS_W,4.6,0)); g.add(box(.3,1,1.6,trim,CS_W+.85,4.6,0));
    const rubble=new THREE.Group(); for(let k=0;k<7;k++) rubble.add(box(rnd(.4,.9),rnd(.3,.6),rnd(.4,.9),dk,CS_W+rnd(-.6,1.4),.25,rnd(-1.2,1.2))); rubble.visible=false; g.add(rubble);
    // 탑 4개 + 깃발
    const flags=[]; [45,135,225,315].forEach(dg=>{ const a=dg*Math.PI/180; const x=Math.cos(a)*CS_W, z=Math.sin(a)*CS_W; g.add(cyl(1.7,1.9,6.4,wall,x,3.2,z,12)); g.add(cyl(2,2,.5,trim,x,6.6,z,12)); const cn=new THREE.Mesh(new THREE.ConeGeometry(2.1,2.8,12),roof); cn.position.set(x,8.2,z); g.add(cn);
      g.add(cyl(.06,.06,2.4,dk,x,10.6,z,6)); const fl=box(1.4,.85,.05,mat({color:0xe8e8e8}),x+.7,11.3,z); fl.userData.flag=1; g.add(fl); flags.push(fl); });
    // 안마당: 빛 구슬
    g.add(cyl(1.3,1.6,1.1,trim,0,.55,0,12)); const orb=sph(.75,glowMat(0xffffff,.85),0,2.1,0); orb.userData.noOutline=true; g.add(orb); const oring=new THREE.Mesh(GEO.ring,glowMat(0xffffff,.5)); oring.rotation.x=-Math.PI/2; oring.scale.setScalar(4); oring.position.y=.15; oring.userData.noOutline=true; g.add(oring);
    // 공성 망치(공성전 때만)
    const ram=new THREE.Group(); const lg=cyl(.45,.45,4.4,mat({color:0x8a5a30,roughness:1}),0,1.2,0,10); lg.rotation.z=Math.PI/2; ram.add(lg); ram.add(sph(.55,mat({color:0x9a9aaa,metalness:.6,roughness:.35}),-2.3,1.2,0)); [[1.2,.8],[-1.2,.8],[1.2,-.8],[-1.2,-.8]].forEach(([x,z])=>{ const w=new THREE.Mesh(new THREE.TorusGeometry(.42,.1,6,12),dk); w.position.set(x,.45,z); ram.add(w); }); ram.add(box(3.2,.12,1.9,mat({color:0x8a5a30}),0,2.3,0));
    ram.position.set(CS_W+6,0,0); ram.visible=false; g.add(ram);
    const bot=new THREE.Group(); const br=mat({color:0xb07a3a,metalness:.6,roughness:.35}); bot.add(box(.9,1.2,.6,br,0,1.5,0)); bot.add(box(.6,.5,.5,br,0,2.4,0)); bot.add(sph(.08,glowMat(0x6af0ff,.9),.2,2.45,.26)); bot.add(sph(.08,glowMat(0x6af0ff,.9),-.2,2.45,.26)); [-.25,.25].forEach(x=>bot.add(box(.25,.9,.3,br,x,.45,0))); bot.position.set(CS_W+6,0,1.6); bot.visible=false; g.add(bot);
    g.position.set(C.x,hAt(C.x,C.z),C.z); g.rotation.y=-C.ga; shadowify(g); scene.add(g); CS.parts.push(g);
    CS.c[i]={g,doors,rubble,flags,orb,oring,ram,bot}; CS.lbl[i]={c:makeLabel(""),o:makeLabel(""),r:makeLabel("")}; csPaint(i); }); }
function csLocal(i,lx,lz){ const C=CS_LIST[i]; const ca=Math.cos(C.ga), sa=Math.sin(C.ga); return {x:C.x+lx*ca-lz*sa,z:C.z+lx*sa+lz*ca}; }
function csPaint(i){ const s=CS.c[i]; if(!s) return; const col=csCol(i); const c=new THREE.Color(col||"#e8e8e8"); s.flags.forEach(f=>{ f.material=mat({color:c.getHex(),roughness:.7}); }); s.orb.material.color.set(col?c:new THREE.Color(0xffffff)); s.oring.material.color.set(col?c:new THREE.Color(0xffffff)); }
/* ---------- 성문(때릴 수 있는 것) ---------- */
function csGm(i,on){ const cur=CS.gm[i]; if(on&&!cur){ const p=csLocal(i,CS_W+.6,0); const mesh=new THREE.Group(); mesh.userData.h=3.6; const m={n:CS_LIST[i].n+" 성문",shape:"x",mesh,x:p.x,z:p.z,hx:p.x,hz:p.z,lv:G.lv,boss:false,world:false,hp:CS_GATE,mhp:CS_GATE,atk:0,xp:0,gold:0,rg:12,cd:9,state:"idle",t:0,lbl:makeLabel(""),rot:0,hit:0,scale:1.4,power:0,ev:1,still:1,csGate:1,csI:i}; mesh.position.set(p.x,hAt(p.x,p.z),p.z); scene.add(mesh); mobs.push(m); CS.gm[i]=m; }
  else if(!on&&cur){ removeMob(cur); delete CS.gm[i]; } }
(function(){ const _dm=damageMob; damageMob=function(m,dmg,crit){ if(m&&m.csGate){ const i=m.csI; if(!csLive()||csGateHp(i)<=0) return; const k=crit?2:1; csHit(i,k); m.hit=.15; floatDmg(m.x,3.8,m.z,`쾅! -${k}`,crit?"crit":""); fxSpark(m.x,1.8,m.z,0xc8a070,6); tone(crit?200:150,.07,"square",0,.1); P.combat=4; return; } return _dm.apply(this,arguments); };
  const _km=killMob; killMob=function(m){ const d=m&&m.csDef; _km(m); if(d){ G.csDef=(G.csDef||0)+1; saveGame(); } };
  const _gx=gainXp; gainXp=function(n){ try{ if(n>0){ for(let i=0;i<4;i++){ if(csOwnerMine(i)&&Math.hypot(P.x-CS_LIST[i].x,P.z-CS_LIST[i].z)<45){ n=Math.round(n*1.1); break; } } } }catch(e){} return _gx(n); }; })();
/* ---------- 수비 영웅 ---------- */
function csFoesClear(i){ (CS.foes[i]||[]).forEach(m=>{ if(mobs.indexOf(m)>=0) removeMob(m); }); CS.foes[i]=[]; CS.foes[i].made=0; }
function csFoeRecs(i){ const o=CS.o[i]; const L=[]; if(o){ try{ gdMembers(o.g).forEach(r=>{ if(r.me||PEERS[r.i]) return; const a=(typeof ARD!=="undefined")&&ARD[r.i]; L.push(a?Object.assign({},a,{n:a.n||r.n}):{n:r.n,r:r.r|0,k:0,l:r.l||1,lk:[0,0,0,0,0,0],e:[-1,-1,-1]}); }); }catch(e){} }
  L.sort(()=>Math.random()-.5); const out=L.slice(0,3); const C=CS_LIST[i]; const realm=i; while(out.length<(o?2:2)) out.push({n:o?`${gdName(o.gn).split(" ")[1]||""} 수비병`:"돌 수비병",r:realm,k:1,l:G.lv,lk:[0,0,0,0,0,0],e:[-1,-1,-1],bot:1}); return out; }
function csFoesMake(i){ const L=csFoeRecs(i); const st=stat(); CS.foes[i]=[]; CS.foes[i].made=1;
  L.forEach((rec,k)=>{ const p=csLocal(i,CS_W+3.2,(k-(L.length-1)/2)*2.8); let mesh=null; try{ mesh=typeof arAvatar==="function"?arAvatar(rec):null; }catch(e){} if(!mesh) mesh=makeAvatar(rec.r|0,rec.k|0,false);
    const hp=Math.round(st.atk*(rec.bot?9:14)); const ms=mobStats(Math.max(1,G.lv),false);
    const m={n:rec.bot?rec.n:`🛡 ${rec.n}`,shape:"hero",mesh,x:p.x,z:p.z,hx:p.x,hz:p.z,lv:rec.l||G.lv,boss:false,world:false,hp,mhp:hp,atk:ms.atk*(rec.bot?.55:.7),xp:Math.round(ms.xp*1.5),gold:Math.round(ms.gold*1.5),rg:12,cd:1.3,state:"idle",t:0,lbl:makeLabel(""),rot:CS_LIST[i].ga+Math.PI,hit:0,scale:1,power:0,ev:1,csDef:1,csI:i,home:0,walk:0,copy:!rec.bot};
    mesh.position.set(p.x,hAt(p.x,p.z),p.z); scene.add(mesh); mobs.push(m); CS.foes[i].push(m); }); }
function csTickFoes(i,dt){ const L=CS.foes[i]; if(!L) return; const st=stat(), tn=performance.now(); const C=CS_LIST[i];
  for(let k=L.length-1;k>=0;k--){ const m=L[k]; if(mobs.indexOf(m)<0){ L.splice(k,1); continue; } const u=m.mesh.userData; m.hit=Math.max(0,m.hit-dt); m.cd-=dt;
    const home=m.home?csLocal(i,2.4*Math.cos(k*2.1),2.4*Math.sin(k*2.1)):{x:m.hx,z:m.hz};
    const dx=P.x-m.x, dz=P.z-m.z, d=Math.hypot(dx,dz); let mv=0;
    if(m.ctStun>0){ } else if(!P.dead&&d<13&&Math.hypot(P.x-home.x,P.z-home.z)<20){ m.state="chase"; m.rot=Math.atan2(dx,dz); if(d>2.2){ m.x+=dx/d*4.2*dt; m.z+=dz/d*4.2*dt; mv=1; } else if(m.cd<=0){ m.cd=1.35; hurtPlayer(m.atk*(1-dmgReduce(st.def)),m.n); u.lunge=.25; try{ if(u.gl) animState(m.mesh,"attack"); }catch(e){} } }
    else { m.state="idle"; const hx=home.x-m.x, hz=home.z-m.z, hd=Math.hypot(hx,hz); if(hd>.6){ m.x+=hx/hd*3.6*dt; m.z+=hz/hd*3.6*dt; m.rot=Math.atan2(hx,hz); mv=1; } }
    m.mesh.position.set(m.x,hAt(m.x,m.z)+(u.lunge>0?.3:0),m.z); if(u.lunge>0) u.lunge-=dt; let dr=m.rot-m.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; m.mesh.rotation.y+=dr*Math.min(1,dt*8);
    try{ if(u.gl) animState(m.mesh,m.hit>0?"hit":mv?"run":"idle"); else if(u.legL){ m.walk+=mv?dt*10:0; const sw=mv?Math.sin(m.walk)*.7:0; u.legL.rotation.x=sw; u.legR.rotation.x=-sw; } }catch(e){}
    hitTint(m.mesh,m.hit/.15); try{ HITF.apply(m,dt); }catch(e){}
    if(d<40) placeLabel(m.lbl,m.x,3.6,m.z,`${m.copy?'<span style="color:#9adfff">수비 영웅</span> ':""}${m.n}<span class="hp"><i style="width:${Math.round(m.hp/m.mhp*100)}%"></i></span>`); else m.lbl.style.display="none"; } }
/* ---------- 보상 ---------- */
function csCapReward(i){ G.csCap=(G.csCap||0)+1; const gold=400+G.lv*40; G.gold+=gold; try{ gz().tk+=3; }catch(e){} gainXp(200+G.lv*30); saveGame();
  setTimeout(()=>toast(`🏰 ${CS_LIST[i].n} 차지 보상!`,`금화 +${fmt(gold)} · 🎟 뽑기권 +3`,3),2600); }
function csPartReward(){ const live=csLive(); const wk=live?live.w:null; if(wk==null||G.csWk===wk) return; if((CS.part.hit||0)<20&&(CS.part.t||0)<60) return; G.csWk=wk; const gold=150+G.lv*15; G.gold+=gold; try{ gz().tk+=1; }catch(e){} G.ore=(G.ore||0)+5; saveGame();
  toast("🎁 공성 상자!",`함께해 줘서 고마워요 · 금화 +${fmt(gold)} · 🎟 +1 · ⛓ +5`,3); jingle([659,784,1046,1318]); }
function csCanClaim(){ let any=false; for(let i=0;i<4;i++) if(csOwnerMine(i)) any=true; return any&&G.csDay!==kday(); }
function csClaim(){ if(!csCanClaim()) return; G.csDay=kday(); let n=0; for(let i=0;i<4;i++) if(csOwnerMine(i)) n++; const gold=(200+G.lv*20)*n; G.gold+=gold; try{ gz().tk+=n; }catch(e){} saveGame(); jingle([523,659,784,1046]); toast("👑 성주 보물!",`성 ${n}개 · 금화 +${fmt(gold)} · 🎟 뽑기권 +${n}`,2.6); }
/* ---------- 매 프레임 ---------- */
function csHudEl(){ const q=$("quest"); const host=q&&q.parentNode; if(CS.hud&&CS.hud.isConnected&&CS.hud.parentNode===host) return CS.hud; if(!CS.hud){ const d=document.createElement("div"); d.id="csHud"; d.hidden=true; d.addEventListener("pointerdown",e=>e.stopPropagation()); d.addEventListener("click",()=>showSiege()); CS.hud=d; } if(host&&q) host.insertBefore(CS.hud,q); else document.body.appendChild(CS.hud); return CS.hud; }
function csTick(dt){ if(!started||G.realm<0) return; csBuild(); const live=csLive(); const away=typeof glAway==="function"&&glAway(); const now=Date.now(); const myCode=csMyCode();
  // 알림
  const slot=csSlot(); if(slot&&!live){ const left=slot.t-now; if(left>0&&left<10*60000&&CS.ann.pre!==slot.w){ CS.ann.pre=slot.w; toast("🏰 10분 뒤 기사단 공성전!","금요일 저녁 8시 · 세계의 중심 둘레 성 4개",3.2); jingle([392,523,659]); } }
  if(live&&CS.ann.go!==live.t){ CS.ann.go=live.t; CS.part={hit:0,t:0}; try{ lvBanner("🏰 공성전 시작!","기사단 성 차지하기","30분 동안 · 성문을 부수고 빛 구슬을 지켜요","#c8322a"); }catch(e){} jingle([392,523,659,784,1046]); buzz([60,40,60]); }
  if(!live&&CS.wasLive){ csPartReward(); for(let i=0;i<4;i++){ csGm(i,false); csFoesClear(i); } toast("🏰 공성전이 끝났어요!",`다음 공성전: ${slot?csWhen(slot.t):"다음 주 금요일"}`,3); }
  if(live&&CS.wasLive&&live.t+CS_DUR-now<1500) csPartReward();
  CS.wasLive=!!live;
  let nearI=-1, nd=1e9; for(let i=0;i<4;i++){ const C=CS_LIST[i]; const d=Math.hypot(P.x-C.x,P.z-C.z); if(d<nd){ nd=d; nearI=i; } } CS.near=away?-1:nearI;
  for(let i=0;i<4;i++){ const C=CS_LIST[i], s=CS.c[i]; const d=Math.hypot(P.x-C.x,P.z-C.z); const vis=!away&&d<(ECO()?150:220); s.g.visible=vis; const gate=csGateHp(i); const owner=csOwnerMine(i);
    const broken=live&&gate<=0; s.doors.forEach(x=>x.visible=!broken); s.rubble.visible=broken;
    s.ram.visible=!!live&&gate>0&&vis; s.orb.position.y=2.1+Math.sin(now/500+i)*.18; s.oring.rotation.z+=dt;
    if(live&&!away){
      // 성문 · 망치 · 수비 영웅(공격하는 사람 폰에서만)
      csGm(i,gate>0&&!owner&&d<70);
      if(!owner&&d<30&&!(CS.foes[i]&&CS.foes[i].made)) csFoesMake(i);
      csTickFoes(i,dt);
      // 닫힌 성문: 주인이 아니면 성벽 안으로 못 들어감
      if(gate>0&&!owner&&d<CS_W+1&&!P.dead){ const k=(CS_W+1)/(d||1); P.x=C.x+(P.x-C.x)*k; P.z=C.z+(P.z-C.z)*k; }
      // 망치 밀기
      const rp=csLocal(i,CS_W+6,0); const rd=Math.hypot(P.x-rp.x,P.z-rp.z); s.bot.visible=false;
      if(gate>0&&!owner&&rd<3.8&&!P.dead){ let push=1; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&Math.hypot(o.x-rp.x,o.z-rp.z)<3.8) push++; } const robot=push===1; s.bot.visible=robot;
        CS.ramT-=dt; if(CS.ramT<=0){ CS.ramT=2.5; const k=4+(robot?4:0); csHit(i,k); const gp=csLocal(i,CS_W+.6,0); floatDmg(gp.x,4,gp.z,`🪵 쿵! -${k}`,"crit"); fxSpark(gp.x,1.8,gp.z,0xc8a070,14); thud(); buzz(30); P.shake=Math.max(P.shake||0,.4); s.ram.position.x=CS_W+4.6; } else s.ram.position.x+=((CS_W+6)-s.ram.position.x)*Math.min(1,dt*3);
        placeLabel(CS.lbl[i].r,rp.x,3.4,rp.z,`🪵 공성 망치 👥${push}${robot?" + 🤖 탈로스":""}`); }
      else { CS.lbl[i].r.style.display="none"; s.ram.position.x=CS_W+6; }
      // 빛 구슬 지키기
      const od=Math.hypot(P.x-C.x,P.z-C.z);
      if(gate<=0&&myCode&&!owner&&od<4&&!P.dead){ let block=false; const oc=CS.o[i]&&CS.o[i].g; for(const id in PEERS){ const o=PEERS[id]; if(oc&&!o.dead&&o.gd&&o.gd[3]===oc&&Math.hypot(o.x-C.x,o.z-C.z)<8) block=true; } (CS.foes[i]||[]).forEach(m=>{ if(m.hp>0&&Math.hypot(m.x-C.x,m.z-C.z)<8) block=true; });
        let mates=0; for(const id in PEERS){ const o=PEERS[id]; if(!o.dead&&o.gd&&o.gd[3]===myCode&&Math.hypot(o.x-C.x,o.z-C.z)<5) mates++; }
        if(!block){ CS.hold[i]=(CS.hold[i]||0)+dt*(1+.5*Math.min(3,mates)); if(Math.random()<dt*6) fxSpark(C.x,2,C.z,new THREE.Color(GD_COL[gdMine().gf[0]]||"#fff").getHex(),3);
          if(CS.hold[i]>=CS_HOLD){ CS.hold[i]=0; const g=gdMine(); const rec={g:g.c,gn:g.gn,gf:g.gf,n:G.name,ts:Date.now()}; try{ net.pushRet("cst/o/"+i,rec); net.send(Object.assign({t:"csc",c:i},rec)); }catch(e){} csOwnerSet(i,rec,true); } }
        placeLabel(CS.lbl[i].c,C.x,3.8,C.z,block?"⛔ 수비하는 사람이 있어요! 먼저 물리쳐요":`💠 차지하는 중 ${Math.floor(CS.hold[i]||0)}/${CS_HOLD}초${mates?` · 👥+${mates}`:""}<span class="hp"><i style="width:${Math.round((CS.hold[i]||0)/CS_HOLD*100)}%;background:#ffd24a"></i></span>`); }
      else { if(od>6) CS.hold[i]=Math.max(0,(CS.hold[i]||0)-dt*2); CS.lbl[i].c.style.display="none"; }
      if(d<60) CS.part.t=(CS.part.t||0)+dt;
    } else { csGm(i,false); if(CS.foes[i]&&CS.foes[i].made) csFoesClear(i); CS.lbl[i].r.style.display="none"; CS.lbl[i].c.style.display="none"; s.bot.visible=false; }
    // 성 이름표
    if(vis&&d<75){ const col=csCol(i); placeLabel(CS.lbl[i].o,C.x,12.6,C.z,`<b style="color:#ffe08a">${C.ic} ${C.n}</b><br><span style="color:${col||"#ddd"}">${csSym(i)} ${csOName(i)}</span>${live?` · 성문 <b>${Math.round(gate/CS_GATE*100)}%</b>`:""}`); } else CS.lbl[i].o.style.display="none"; }
  // 성문 이름표·체력
  for(const k in CS.gm){ const m=CS.gm[k]; const hp=csGateHp(+k); m.hp=Math.max(1,hp); if(Math.hypot(P.x-m.x,P.z-m.z)<40) placeLabel(m.lbl,m.x,4.4,m.z,`🚪 성문 ${hp}/${CS_GATE}<span class="hp"><i style="width:${Math.round(hp/CS_GATE*100)}%"></i></span>`); else m.lbl.style.display="none"; }
  // 보내기: 성문 점수 1초마다 묶어서 + 보관
  CS.sendT-=dt; if(CS.sendT<=0){ CS.sendT=1; for(const i in CS.send){ const k=CS.send[i]; if(k>0){ try{ net.send({t:"csh",c:+i,e:csEpoch(+i),k}); }catch(e){} CS.gsync[i]=1; } } CS.send={}; }
  CS.pubT-=dt; if(CS.pubT<=0){ CS.pubT=6; if(live) for(const i in CS.gsync){ const h=CS.hits[i]; if(h&&h.s>0) try{ net.pushRet("cst/g/"+i,{e:h.e,s:h.s,ts:Date.now()}); }catch(e){} } CS.gsync={}; }
  // 위쪽 알림 띠
  const hud=csHudEl(); const show=!!live&&!layerOpen&&!away; if(!show){ if(!hud.hidden) hud.hidden=true; CS.hudKey=""; }
  else { const left=Math.max(0,live.t+CS_DUR-now); const mm=Math.floor(left/60000), ss=Math.floor(left%60000/1000); const C=nearI>=0?CS_LIST[nearI]:null; const near=C&&nd<80;
    const h=`🏰 공성전 <b>${mm}:${String(ss).padStart(2,"0")}</b>${near?` · ${C.ic} ${csSym(nearI)} ${csOName(nearI)} · 🚪 ${Math.round(csGateHp(nearI)/CS_GATE*100)}%`:" · 메뉴 → 기사단 성"}${!myCode?' · <span style="color:#ffd08a">🗡 용병</span>':""}`;
    if(h!==CS.hudKey){ CS.hudKey=h; hud.innerHTML=h; } if(hud.hidden) hud.hidden=false; } }
XTICK.push(csTick);
/* ---------- 지도 ---------- */
MAP_X.push((ctx,tx,tz,big,u)=>{ if(typeof glAway==="function"&&glAway()) return; const live=csLive(); CS_LIST.forEach((C,i)=>{ const X=tx(C.x), Z=tz(C.z); const col=csCol(i); if(col){ ctx.beginPath(); ctx.arc(X,Z,(big?7:9)*u,0,6.2832); ctx.fillStyle=col+"66"; ctx.fill(); }
  if(live){ ctx.beginPath(); ctx.arc(X,Z,(big?9:11)*u*(1+.15*Math.sin(performance.now()/200)),0,6.2832); ctx.strokeStyle="#ff4a3a"; ctx.lineWidth=1.6*u; ctx.stroke(); }
  mapPin(ctx,X,Z,(big?6:7.5)*u,col||"#9a9aa8",col?csSym(i):"🏰"); }); });
/* ---------- 창 ---------- */
function csGo(i){ if(P.dead||P.trial){ toast("지금은 갈 수 없어요"); return; } if(typeof glAway==="function"&&glAway()){ toast("지금 있는 곳에서 먼저 나와요"); return; } if(mobs.some(m=>m.state==="chase"&&!m.csDef&&Math.hypot(m.x-P.x,m.z-P.z)<16)){ toast("전투 중에는 갈 수 없어요"); return; }
  const p=csLocal(i,CS_W+12,rnd(-3,3)); closeLayer(); P.x=p.x; P.z=p.z; P.y=0; P.vy=0; P.invul=Math.max(P.invul||0,1.5); fxRing(P.x,P.z,0xffe08a,6,.7); jingle([523,784,1046]); toast(`🏰 ${CS_LIST[i].n} 앞이에요`,csLive()?"🪵 공성 망치 곁에 서면 함께 밀어요":"공성전은 금요일 저녁 8시!",2.4); }
function showSiege(){ const live=csLive(), slot=csSlot(); const g=(()=>{ try{ return gdMine(); }catch(e){ return null; } })(); const own=[0,1,2,3].filter(csOwnerMine);
  card(`<h2>🏰 기사단 성 차지하기</h2><p>세계의 중심 둘레 네 귀퉁이에 성이 있어요. <b>매주 금요일 저녁 8시~8시 반</b>에 기사단끼리 성을 차지해요! 🪵 공성 망치를 함께 밀고 성문을 때려 부순 다음, 안마당 <b>빛 구슬</b> 곁에서 30초 버티면 우리 성!</p>
   <div class="idlegrid"><div><b>${live?"🔥 지금!":"⏳"}</b><span>${live?`끝까지 ${Math.ceil((live.t+CS_DUR-Date.now())/60000)}분`:slot?csWhen(slot.t):"-"}</span></div><div><b>${g?GD_SYM[g.gf[1]]||"🛡️":"🗡"}</b><span>${g?gdName(g.gn):"기사단 없음(용병)"}</span></div><div><b>${own.length}</b><span>우리 기사단의 성</span></div></div>
   ${CS_LIST.map((C,i)=>{ const col=csCol(i); return `<div class="row"><div class="ic">${C.ic}</div><div class="t"><div><b>${C.n}</b></div><span style="color:${col||"inherit"}">${csSym(i)} ${csOName(i)}${CS.o[i]?` · ${CS.o[i].n}`:""}${live?` · 🚪 ${Math.round(csGateHp(i)/CS_GATE*100)}%`:""}</span></div><button class="go" data-cg="${i}">가기</button></div>`; }).join("")}
   ${own.length?`<button class="buy" id="csClaimB" style="align-self:center" ${csCanClaim()?"":"disabled"}>${csCanClaim()?"👑 오늘의 성주 보물 받기":"👑 성주 보물은 내일 또!"}</button>`:""}
   <p style="font-size:12px">${g?"":"⚠ 기사단이 없으면 성문 부수기만 도울 수 있어요(🗡 용병) — 메뉴 → 기사단에서 들어가요. "}성 주인은 접속하지 않아도 단원들의 <b>수비 영웅</b>이 성문 앞을 지켜요. 여러 기사단이 함께 성문을 부술 수 있고, 구슬은 먼저 지킨 기사단 거예요. 성 주인: 성 근처 경험치 +10% · 하루 한 번 성주 보물. 공성전에 함께하면 그 주 🎁 공성 상자!</p>`);
  layers.querySelectorAll("[data-cg]").forEach(b=>b.onclick=()=>csGo(+b.dataset.cg)); if($("csClaimB")) $("csClaimB").onclick=()=>{ csClaim(); showSiege(); }; }
MENU_X.push({ic:"🏰",n:"기사단 성",id:"csBtn",sub:()=>{ const live=csLive(); if(live) return "🔥 공성전 중! 지금 가요"; const own=[0,1,2,3].filter(csOwnerMine).length; const s=csSlot(); return `${own?`👑 우리 성 ${own}개 · `:""}공성전 ${s?csWhen(s.t):"금요일 8시"}`; },f:showSiege});
TITLES.push({id:"cs1",n:"성문 부수는 자",t:1,h:"성문 점수 100점",g:()=>[G.csHitN||0,100]},{id:"cs2",n:"성의 주인",t:2,h:"성 차지하기 1번",g:()=>[G.csCap||0,1]},{id:"cs3",n:"네 성의 왕",t:3,h:"성 차지하기 10번",g:()=>[G.csCap||0,10]});
</script>
<style>
#csHud{pointer-events:auto;align-self:flex-start;margin-top:3px;padding:3px 9px;border-radius:11px;background:linear-gradient(180deg,rgba(120,24,20,.92),rgba(70,14,14,.92));border:1.5px solid #ffb04a;color:#fff;font-size:11.5px;line-height:1.35;box-shadow:0 2px 0 rgba(0,0,0,.45);max-width:220px}
#csHud[hidden]{display:none} #csHud b{color:#ffe08a}
</style>
