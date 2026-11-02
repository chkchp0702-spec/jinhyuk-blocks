<script>
/* ================= 진짜 3D 모델 (KayKit 2.0 모듈식 캐릭터 · CC0 · GitHub) =================
   - 모든 캐릭터가 같은 뼈대(Rig_Medium)를 써서 얼굴·옷·모자·망토·무기를 섞어 조립할 수 있음
   - 동작은 공용 애니메이션 라이브러리(anim_*.glb)를 어떤 캐릭터에나 적용
   - 모델은 필요할 때 내려받음(lazy). 받기 전엔 코드로 그린 캐릭터가 임시로 보임 */
const MODELS={chars:{},hex:{},weap:{},anims:[],loading:{},hexReady:false,animsReady:false,fail:false,waiters:[]};
const MIXERS=[];
const LOADER=THREE.GLTFLoader?new THREE.GLTFLoader():null;
if(!LOADER||!THREE.SkeletonUtils) MODELS.fail=true;
function prepMesh(o){ if(o.isMesh){ o.castShadow=HIGH(); o.receiveShadow=false; o.frustumCulled=false; if(o.material){ o.material.roughness=.9; o.material.metalness=0; } } }
function loadChar(name,cb){ if(MODELS.chars[name]){ cb&&cb(); return; } if(!LOADER){ return; } (MODELS.loading[name]=MODELS.loading[name]||[]).push(cb);
  if(MODELS.loading[name].length>1) return;
  LOADER.load("models/c/"+name+".glb",g=>{ g.scene.traverse(prepMesh); MODELS.chars[name]=g.scene; const cbs=MODELS.loading[name]; delete MODELS.loading[name]; cbs.forEach(f=>f&&f()); scheduleRefresh(); },undefined,()=>{ delete MODELS.loading[name]; }); }
function loadWeapon(name,cb){ if(MODELS.weap[name]){ cb&&cb(); return; } if(!LOADER) return; (MODELS.loading["w:"+name]=MODELS.loading["w:"+name]||[]).push(cb); if(MODELS.loading["w:"+name].length>1) return;
  LOADER.load("models/w/"+name+".gltf",g=>{ g.scene.traverse(prepMesh); MODELS.weap[name]=g.scene; const cbs=MODELS.loading["w:"+name]; delete MODELS.loading["w:"+name]; cbs.forEach(f=>f&&f()); scheduleRefresh(); },undefined,()=>{ delete MODELS.loading["w:"+name]; }); }
function ensure(names,weapons,cb){ let need=0; const done=()=>{ if(--need===0&&cb) cb(); }; names.forEach(n=>{ if(n&&!MODELS.chars[n]){ need++; loadChar(n,done); } }); (weapons||[]).forEach(w=>{ if(w&&!MODELS.weap[w]){ need++; loadWeapon(w,done); } }); if(need===0&&cb) cb(); return need===0; }
let refreshT=null; function scheduleRefresh(){ clearTimeout(refreshT); refreshT=setTimeout(()=>{ try{ refreshGL(); }catch(e){ console.warn(e); } },120); }
(function loadAnims(){ if(!LOADER) return; const files=["anim_general","anim_move","anim_melee","anim_ranged"]; let n=0; files.forEach(f=>LOADER.load("models/"+f+".glb",g=>{ MODELS.anims.push(...g.animations); if(++n===files.length){ MODELS.animsReady=true; scheduleRefresh(); } },undefined,()=>{ if(++n===files.length){ MODELS.animsReady=true; } })); })();
/* 건물·나무 */
const HEX_LIST=["building_castle_%c","building_church_%c","building_home_A_%c","building_home_B_%c","building_market_%c","building_tavern_%c","building_tower_A_%c","building_well_%c","building_windmill_%c","building_blacksmith_%c","tree_single_A","tree_single_B","trees_A_small","trees_A_medium","trees_A_large","trees_B_small","trees_B_medium","trees_B_large","rock_single_A","rock_single_B","rock_single_C","rock_single_D","rock_single_E","barrel","crate_A_big","tent","flag_blue","flag_yellow","flag_red","flag_green","weaponrack","wheelbarrow","sack","bucket_water","target","waterlily_A"];
const REALM_HEXCOLOR=["yellow","blue","red","green"];
(function loadHex(){ if(!LOADER) return; const list=[]; HEX_LIST.forEach(h=>{ if(h.indexOf("%c")>=0) REALM_HEXCOLOR.forEach(c=>list.push(h.replace("%c",c))); else list.push(h); }); let m=0; const fin=()=>{ if(++m===list.length){ MODELS.hexReady=true; if(typeof onHexReady==="function") onHexReady(); } };
  list.forEach(name=>LOADER.load("models/hex/"+name+".gltf",g=>{ g.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=HIGH(); o.receiveShadow=HIGH(); if(o.material){ o.material.roughness=.95; o.material.metalness=0; } } }); MODELS.hex[name]=g.scene; fin(); },undefined,fin)); })();
function hexModel(name,scale){ const src=MODELS.hex[name]; if(!src) return null; const o=src.clone(); o.scale.setScalar(scale||5); return o; }

/* ---- 꾸미기 선택지 ---- */
const FACES=[["기본",null],["팔라딘","Paladin"],["기사","Knight"],["마법사","Mage"],["야만전사","Barbarian"],["도적","Rogue"],["레인저","Ranger"],["드루이드","Druid"],["성직자","Cleric"],["마법소녀","MagicalGirl"],["영웅","Superhero"],["소년","Protagonist_A"],["소녀","Protagonist_B"],["마녀","Witch"],["원시인","Caveman"],["닌자","Ninja"],["현자","Lorekeeper"],["농부","Farmer_A"],["엔지니어","Engineer"],["모험가","Hiker"]];
const BODIES=FACES;
const HATS=[["자동",null],["없음","none"],["마법사 모자",{m:"Mage",p:["Mage_Hat"]}],["곰 투구",{m:"Barbarian",p:["Barbarian_BearHat"]}],["기사 투구",{m:"Knight",p:["Knight_Helmet","Knight_HelmetVisor"]}],["팔라딘 투구",{m:"Paladin_with_Helmet",p:["Paladin_Helmet"]}],["마녀 모자",{m:"Witch",p:["Witch_Hat"]}],["모험가 모자",{m:"Hiker",p:["Hiker_Hat"]}],["밀짚모자",{m:"Farmer_A",p:["Farmer_A_Hat"]}],["요정 모자",{m:"Helper_A",p:["Helper_A_Hat"]}],["닌자 두건",{m:"Ninja",p:["Ninja_Headband","Ninja_Mask"]}],["고글",{m:"Engineer",p:["Engineer_Goggles"]}],["안경",{m:"Lorekeeper",p:["Lorekeeper_Glasses"]}],["선글라스",{m:"Driver",p:["Driver_Sunglasses"]}]];
const CAPES=[["자동",null],["없음","none"],["기사 망토",{m:"Knight",p:["Knight_Cape"]}],["마법사 망토",{m:"Mage",p:["Mage_Cape"]}],["레인저 망토",{m:"Ranger",p:["Ranger_Cape"]}],["도적 망토",{m:"Rogue",p:["Rogue_Cape"]}],["팔라딘 망토",{m:"Paladin",p:["Paladin_Cape"]}],["영웅 망토",{m:"Superhero",p:["Superhero_Cape"]}],["흑기사 망토",{m:"BlackKnight",p:["BlackKnight_Cape"]}],["잎사귀 망토",{m:"PlantWarrior",p:["PlantWarrior_Cloak"]}],["박쥐 날개",{m:"Vampire",p:["Vampire_WingLeft","Vampire_WingRight"]}],["천사 날개","wings"]];
const WEAPONS=[["자동",null],["없음","none"],["한손검","sword_1handed"],["대검","sword_2handed"],["도끼","axe_1handed"],["큰 도끼","axe_2handed"],["지팡이","staff"],["드루이드 지팡이","druid_staff"],["마법봉","wand"],["쌍단검","dagger2"],["활","bow_withString"],["렌치","engineer_Wrench"]];
const TINTS=[["자동",null],["붉은빛",0xffd0d0],["푸른빛",0xd0e0ff],["초록빛",0xd0ffd0],["황금빛",0xfff0b0],["보랏빛",0xe8d0ff],["어둠",0x9a9aaa]];
const LOOK_ROWS=[["face","얼굴",FACES],["body","옷",BODIES],["hat","머리",HATS],["cape","망토",CAPES],["weapon","무기",WEAPONS],["tint","빛깔",TINTS]];
/* 세계·계급별 기본 모습(자동) */
function realmDefault(realm,rank){ const r=rank||0;
  if(realm===0) return {body:"Paladin",head:"Paladin",hat:r>=2?{m:"Paladin_with_Helmet",p:["Paladin_Helmet"]}:null,cape:r>=1?{m:"Paladin",p:["Paladin_Cape"]}:null,wings:r>=1,weapon:r>=4?"sword_2handed":"sword_1handed",offhand:r>=1&&r<4?"shield_badge_color":null};
  if(realm===1) return {body:"Barbarian",head:"Barbarian",hat:r>=2?{m:"Barbarian",p:["Barbarian_BearHat"]}:null,cape:r>=3?{m:"BlackKnight",p:["BlackKnight_Cape"]}:null,weapon:r>=2?"axe_2handed":"axe_1handed",offhand:r<2?"shield_round":null};
  if(realm===2) return {body:"Druid",head:"Druid",hat:r>=2?{m:"Lorekeeper",p:["Lorekeeper_Glasses"]}:null,cape:r>=3?{m:"PlantWarrior",p:["PlantWarrior_Cloak"]}:null,weapon:r>=2?"druid_staff":"staff",offhand:null};
  return {body:"Knight",head:"Knight",hat:r>=2?{m:"Knight",p:["Knight_Helmet","Knight_HelmetVisor"]}:null,cape:r>=3?{m:"Knight",p:["Knight_Cape"]}:null,weapon:r>=4?"sword_2handed":"sword_1handed",offhand:r>=1&&r<4?"shield_badge_color":null}; }
function lookSpec(realm,rank,look){ look=look||{}; const d=realmDefault(realm,rank); const pick=(list,i)=>list[i]&&list[i][1];
  const face=pick(FACES,look.face), body=pick(BODIES,look.body), hat=pick(HATS,look.hat), cape=pick(CAPES,look.cape), weapon=pick(WEAPONS,look.weapon), tint=pick(TINTS,look.tint);
  const s={body:body||d.body,head:face||d.head,hat:hat===undefined||hat===null?d.hat:(hat==="none"?null:hat),cape:null,wings:false,weapon:weapon===undefined||weapon===null?d.weapon:(weapon==="none"?null:weapon),offhand:d.offhand,tint:tint||null};
  if(cape===undefined||cape===null){ s.cape=d.cape; s.wings=!!d.wings; } else if(cape==="wings"){ s.wings=true; } else if(cape!=="none"){ s.cape=cape; }
  if(s.weapon&&s.weapon!==d.weapon) s.offhand=null; return s; }
function specNeeds(s){ const names=[s.body,s.head]; if(s.hat) names.push(s.hat.m); if(s.cape) names.push(s.cape.m); const w=[]; if(s.weapon) w.push(s.weapon==="dagger2"?"dagger":s.weapon); if(s.offhand) w.push(s.offhand); return {names:names.filter(Boolean),weapons:w}; }

/* ---- 조립: 뼈대 하나에 여러 캐릭터의 부품을 붙임 ---- */
const EXTRA_RE=/(Cape|Cloak|Hat|Helmet|HelmetVisor|Headband|Mask|Goggles|Sunglasses|Glasses|Hood|FaceNet|Wing(Left|Right)|Visor)$/;
function composeChar(s,opts){ opts=opts||{}; const src=MODELS.chars[s.body]; if(!src||!MODELS.animsReady) return null;
  const base=THREE.SkeletonUtils.clone(src); const bones={}; base.traverse(o=>{ if(o.isBone) bones[o.name]=o; });
  base.traverse(o=>{ if(o.isSkinnedMesh){ if(EXTRA_RE.test(o.name)&&!opts.keepExtras) o.visible=false; if(/_Head$/.test(o.name)&&s.head&&s.head!==s.body) o.visible=false; } });
  function addPart(modelName,partName){ const m=MODELS.chars[modelName]; if(!m) return; let sm=null; m.traverse(o=>{ if(o.isSkinnedMesh&&o.name===partName) sm=o; }); if(!sm) return; const mesh=new THREE.SkinnedMesh(sm.geometry,sm.material); mesh.name=partName; const bl=sm.skeleton.bones.map(b=>bones[b.name]||bones.hips); mesh.bind(new THREE.Skeleton(bl,sm.skeleton.boneInverses.map(x=>x.clone())),sm.bindMatrix.clone()); mesh.frustumCulled=false; mesh.castShadow=HIGH(); base.add(mesh); }
  if(s.head&&s.head!==s.body) addPart(s.head,s.head.replace(/_with_Helmet$/,"")+"_Head");
  if(s.hat) s.hat.p.forEach(p=>addPart(s.hat.m,p)); if(s.cape) s.cape.p.forEach(p=>addPart(s.cape.m,p));
  if(s.tint){ base.traverse(o=>{ if(o.isMesh&&o.material){ o.material=o.material.clone(); o.material.color.multiply(new THREE.Color(s.tint)); } }); }
  const attach=(wname,slot,mirror)=>{ const w=MODELS.weap[wname]; const b=bones[slot]; if(!w||!b) return; const o=w.clone(); if(mirror) o.scale.x=-1; b.add(o); };
  if(s.weapon){ if(s.weapon==="dagger2"){ attach("dagger","handslot.r"); attach("dagger","handslot.l",true); } else attach(s.weapon,"handslot.r"); } if(s.offhand) attach(s.offhand,"handslot.l");
  if(s.wings&&bones.chest){ const wm=mat({color:0xffffff,roughness:.9}); [-1,1].forEach(sg=>{ const wg=new THREE.Group(); wg.position.set(sg*.12,.1,-.12); wg.userData.s=sg; for(let f=0;f<4;f++){ const fe=sph(.07,wm,sg*(.16+f*.17),.1+f*.1-(f>2?.08:0),-.04); fe.scale.multiply(new THREE.Vector3(1.1,2.6+f*.35,.5)); fe.rotation.z=sg*(.45+f*.22); wg.add(fe); } bones.chest.add(wg); (base.userData.wings=base.userData.wings||[]).push(wg); }); }
  const g=new THREE.Group(); base.scale.setScalar(opts.scale||2.1); g.add(base);
  const mixer=new THREE.AnimationMixer(base); const actions={}; MODELS.anims.forEach(c=>{ actions[c.name]=mixer.clipAction(c); });
  const two=s.weapon==="sword_2handed"||s.weapon==="axe_2handed", magic=s.weapon==="staff"||s.weapon==="druid_staff"||s.weapon==="wand"||s.weapon==="spellbook_open", dual=s.weapon==="dagger2", bow=s.weapon==="bow_withString";
  g.userData.gl={mixer,actions,cur:null,onceUntil:0,attack:opts.attack||(two?"Melee_2H_Attack_Chop":magic?"Ranged_Magic_Shoot":dual?"Melee_Dualwield_Attack_Slice":bow?"Ranged_Bow_Release":s.weapon?"Melee_1H_Attack_Slice_Diagonal":"Melee_Unarmed_Attack_Punch_A"),skill:opts.skill||(two?"Melee_2H_Attack_Spin":"Ranged_Magic_Spellcasting"),alias:{Idle:"Idle_A",Walking_A:"Walking_A",Running_A:"Running_A",Hit_A:"Hit_A",Death_A:"Death_A",Jump_Full_Short:"Jump_Full_Short",Cheer:"Interact"}};
  if(base.userData.wings) g.userData.wings=base.userData.wings; MIXERS.push(g); playAnim(g,"Idle"); return g; }

/* ---- 애니메이션 제어 ---- */
function playAnim(g,name,once,fade){ const G=g.userData.gl; if(!G) return; if(G.alias&&G.alias[name]) name=G.alias[name]; const a=G.actions[name]; if(!a) return; const now=performance.now();
  if(once){ if(G.cur===name&&now<G.onceUntil) return; a.reset(); a.setLoop(THREE.LoopOnce,1); a.clampWhenFinished=true; a.enabled=true; a.fadeIn(fade||.08); a.play(); if(G.curA&&G.curA!==a) G.curA.fadeOut(fade||.08); G.cur=name; G.curA=a; G.onceUntil=now+a.getClip().duration*1000-60; return; }
  if(G.cur===name) return; if(now<G.onceUntil&&G.curA&&G.curA.loop===THREE.LoopOnce) return;
  a.reset(); a.setLoop(THREE.LoopRepeat,Infinity); a.enabled=true; a.fadeIn(fade||.18); a.play(); if(G.curA&&G.curA!==a) G.curA.fadeOut(fade||.18); G.cur=name; G.curA=a; }
function animState(g,st){ if(!g||!g.userData.gl) return; const G=g.userData.gl; if(st==="dead"){ if(G.cur!=="Death_A") playAnim(g,"Death_A",true,.1); return; } if(st==="attack"){ playAnim(g,G.attack,true,.05); return; } if(st==="skill"){ playAnim(g,G.skill,true,.05); return; } if(st==="hit"){ playAnim(g,"Hit_A",true,.05); return; } if(st==="jump"){ playAnim(g,"Jump_Full_Short",true,.05); return; } if(st==="cheer"){ playAnim(g,"Cheer",true,.1); return; }
  if(performance.now()<G.onceUntil&&G.curA&&G.curA.loop===THREE.LoopOnce) return; playAnim(g,st==="run"?"Running_A":st==="walk"?"Walking_A":"Idle"); }
function tickMixers(dt){ for(let i=MIXERS.length-1;i>=0;i--){ const g=MIXERS[i]; if(!g.parent){ MIXERS.splice(i,1); continue; } g.userData.gl.mixer.update(dt); if(g.userData.wings) g.userData.wings.forEach(w=>{ w.rotation.y=w.userData.s*Math.sin(performance.now()/450)*.25; }); } }

/* ---- 해골(1.0 팩, 자체 애니메이션) ---- */
function makeCharGL(modelName,opts){ const src=MODELS.chars[modelName]; const clips=SKEL_ANIMS[modelName]; if(!src||!clips) return null; opts=opts||{}; const obj=THREE.SkeletonUtils.clone(src); const g=new THREE.Group(); obj.scale.setScalar(opts.scale||2.1); g.add(obj);
  const mixer=new THREE.AnimationMixer(obj); const actions={}; clips.forEach(c=>{ actions[c.name]=mixer.clipAction(c); }); g.userData.gl={mixer,actions,cur:null,onceUntil:0,attack:opts.attack||"1H_Melee_Attack_Slice_Diagonal",skill:"Spellcast_Shoot",alias:{}}; MIXERS.push(g); playAnim(g,"Idle"); return g; }
const SKEL_ANIMS={};
const SKEL_OF={"드라우그":"Skeleton_Warrior","길 잃은 영혼":"Skeleton_Minion","베탈라":"Skeleton_Rogue"};
(function loadSkel(){ if(!LOADER) return; Object.values(SKEL_OF).forEach(n=>LOADER.load("models/"+n+".glb",g=>{ g.scene.traverse(prepMesh); SKEL_ANIMS[n]=g.animations; MODELS.chars[n]=g.scene; },undefined,()=>{})); })();
/* ---- 괴물·보스 → 신화에 맞는 모델 ---- */
const MOB_GL={"서리 거인":{body:"FrostGolem",scale:1.5},"트롤":{body:"OrcBrute",scale:1.25,weapon:"axe_1handed"},"서리 늑대":{body:"Werewolf_Wolf"},"타락천사":{body:"Vampire",weapon:"sword_1handed"},"네피림":{body:"OrcRaider",scale:1.3,weapon:"axe_2handed",tint:0xe8d8c0},"락샤사":{body:"Monster",weapon:"axe_1handed"},"아수라":{body:"Tiefling",weapon:"sword_2handed"},"나가":{body:"PlantWarrior",weapon:"staff"},"키클롭스":{body:"Monstrosity",scale:1.3},"사티로스":{body:"Caveman",weapon:"druid_staff"},"하르피이":{body:"AvianSwordsman",weapon:"sword_1handed"},
  "네피림의 왕":{body:"Monstrosity",scale:1.9,tint:0xe8d8b0},"서리거인 흐림":{body:"FrostGolem",scale:2.3},"미노타우로스":{body:"OrcBrute",scale:1.9,tint:0x8a6a4a,weapon:"axe_2handed"},"루시퍼":{body:"Vampire",scale:2.4,tint:0x8060c0,weapon:"sword_2handed"},"펜리르":{body:"Werewolf_Wolf",scale:2.6,tint:0x8a8a9a},"마히샤수라":{body:"Monstrosity",scale:2.4,tint:0x806040,weapon:"axe_2handed"}};
function mobGL(name,scale){ const sk=SKEL_OF[name]; if(sk){ if(!MODELS.chars[sk]) return null; const g=makeCharGL(sk,{scale:2.0*scale}); if(g){ g.userData.h=4.2*scale; g.userData.glMob=name; } return g; }
  const d=MOB_GL[name]; if(!d) return null; const s={body:d.body,head:d.body,hat:null,cape:null,weapon:d.weapon||null,offhand:null,tint:d.tint||null,wings:false}; const need=specNeeds(s); if(!ensure(need.names,need.weapons)||!MODELS.animsReady) return null;
  const g=composeChar(s,{scale:2.1*(d.scale||1)*scale,keepExtras:true}); if(!g) return null; g.userData.h=4.3*(d.scale||1)*scale; g.userData.glMob=name; const sh=new THREE.Mesh(new THREE.CircleGeometry(1*(d.scale||1),20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=.05; g.add(sh); return g; }

/* ---- 플레이어/친구/NPC 아바타 ---- */
function avatarGL(realm,rank,look,scale){ const s=lookSpec(realm,rank,look); const need=specNeeds(s); if(!ensure(need.names,need.weapons)||!MODELS.animsReady) return null;
  const g=composeChar(s,{scale:scale||2.1}); if(!g) return null; const R=REALMS[realm];
  if(rank>=4){ const aura=new THREE.Mesh(new THREE.RingGeometry(1.1,1.5,40),glowMat(R.c1,.7)); aura.rotation.x=-Math.PI/2; aura.position.y=.08; g.add(aura); g.userData.aura=aura; }
  if(rank>=6){ const crown=new THREE.Mesh(new THREE.TorusGeometry(.9,.05,8,24),glowMat(R.c1,.9)); crown.position.y=4.6; g.userData.crown=crown; g.add(crown); }
  if(realm===0){ const halo=new THREE.Mesh(new THREE.TorusGeometry(.5,.05,10,32),mat({color:0xffe27a,emissive:0xffd05a,emissiveIntensity:1.2,metalness:.5,roughness:.3})); halo.rotation.x=Math.PI/2; halo.position.y=4.35; g.add(halo); }
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=.05; g.add(sh);
  g.userData.glAvatar=true; g.userData.lookKey=JSON.stringify([realm,rank,look||{}]); return g; }
const NPC_LOOK={"예수":{body:8,hat:1,cape:1,weapon:6,tint:4},"가브리엘":{body:1,face:9,cape:11,weapon:2},"라파엘":{body:9,hat:1,cape:1,weapon:8},"토르":{body:4,hat:3,cape:8,weapon:5},"프레이야":{body:6,face:12,cape:4,weapon:10},"헤임달":{body:2,hat:4,cape:2,weapon:3},"하누만":{body:14,hat:1,cape:1,weapon:1},"가네샤":{body:16,hat:12,cape:1,weapon:6},"아그니":{body:7,hat:1,cape:9,weapon:7,tint:1},"아테나":{body:2,hat:4,cape:2,weapon:2},"아폴론":{body:11,hat:1,cape:7,weapon:10,tint:4},"헤르메스":{body:10,hat:1,cape:7,weapon:1}};
function refreshGL(){ if(!MODELS.animsReady) return;
  if(typeof player!=="undefined"&&player&&!player.userData.glAvatar&&typeof buildPlayer==="function") buildPlayer();
  if(typeof PEERS!=="undefined") for(const id in PEERS){ const o=PEERS[id]; if(!o.mesh.userData.glAvatar&&net.rebuild) net.rebuild(o); }
  if(typeof NPCS!=="undefined") NPCS.forEach(o=>{ if(o.mesh.userData.glAvatar) return; const realm=REGIONS.find(r=>r===o.cap).realm; const g=avatarGL(realm,6,NPC_LOOK[o.n]||{},2.3); if(g){ scene.remove(o.mesh); o.mesh=g; scene.add(g); g.position.set(o.x,hAt(o.x,o.z),o.z); } });
  if(typeof mobs!=="undefined") mobs.forEach(m=>{ if(m.mesh.userData.gl||m.trialOf) return; const g=mobGL(m.n,m.scale); if(g){ g.position.copy(m.mesh.position); g.rotation.y=m.mesh.rotation.y; scene.remove(m.mesh); m.mesh=g; scene.add(g); if(m.aura){ g.add(m.aura); } } }); }

/* ---- 건물·나무: 준비되면 절차 소품을 진짜 모델로 교체 ---- */
function onHexReady(){ try{ PLACED.forEach(p=>{ if(p.obj) scene.remove(p.obj); const o=hexFor(p); if(o){ o.position.set(p.x,hAt(p.x,p.z)-.05,p.z); o.rotation.y=p.rot||0; scene.add(o); p.obj=o; } }); }catch(e){ console.warn(e); } }
function hexFor(p){ const c=REALM_HEXCOLOR[p.realm]||"yellow";
  if(p.kind==="tree"){ const pool=p.realm===1?["trees_B_small","trees_B_medium","trees_B_large","tree_single_B"]:p.realm===2?["tree_single_A","tree_single_B","trees_A_small"]:["trees_A_small","trees_A_medium","trees_A_large","tree_single_A"]; return hexModel(pick(pool),rnd(4.5,6.5)); }
  if(p.kind==="rock"){ return hexModel(pick(["rock_single_A","rock_single_B","rock_single_C","rock_single_D","rock_single_E"]),rnd(9,16)); }
  if(p.kind==="house"){ return hexModel(pick(["building_home_A_"+c,"building_home_B_"+c,"building_tavern_"+c,"building_blacksmith_"+c]),5.5); }
  if(p.kind==="castle"){ return hexModel("building_castle_"+c,5.5); }
  if(p.kind==="church"){ return hexModel(pick(["building_church_"+c,"building_tower_A_"+c,"building_windmill_"+c]),5.5); }
  if(p.kind==="market"){ return hexModel("building_market_"+c,5); }
  if(p.kind==="prop"){ return hexModel(pick(["barrel","crate_A_big","tent","weaponrack","wheelbarrow","sack","bucket_water","target"]),5); }
  if(p.kind==="flag"){ return hexModel("flag_"+c,5); }
  return null; }
</script>
