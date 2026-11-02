<script>
/* ================= 진짜 3D 모델 (KayKit, CC0 · GitHub에서 가져옴): 캐릭터·해골·건물·나무 ================= */
const MODELS={chars:{},hex:{},charsReady:false,hexReady:false,fail:false};
const MIXERS=[];
const CHAR_OF_REALM=["Mage","Barbarian","Rogue","Knight"];
const HEX_LIST=["building_castle_%c","building_church_%c","building_home_A_%c","building_home_B_%c","building_market_%c","building_tavern_%c","building_tower_A_%c","building_well_%c","building_windmill_%c","building_blacksmith_%c","tree_single_A","tree_single_B","trees_A_small","trees_A_medium","trees_A_large","trees_B_small","trees_B_medium","trees_B_large","rock_single_A","rock_single_B","rock_single_C","rock_single_D","rock_single_E","barrel","crate_A_big","tent","flag_blue","flag_yellow","flag_red","flag_green","weaponrack","wheelbarrow","sack","bucket_water","target","waterlily_A"];
const REALM_HEXCOLOR=["yellow","blue","red","green"];
(function loadModels(){
  if(!THREE.GLTFLoader||!THREE.SkeletonUtils){ MODELS.fail=true; return; }
  const L=new THREE.GLTFLoader(); const chars=["Knight","Barbarian","Mage","Rogue","Skeleton_Warrior","Skeleton_Minion","Skeleton_Rogue"]; let n=0;
  chars.forEach(name=>L.load("models/"+name+".glb",g=>{ g.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=HIGH(); o.receiveShadow=false; o.frustumCulled=false; if(o.material){ o.material.roughness=.9; o.material.metalness=0; } } }); MODELS.chars[name]=g; if(++n===chars.length){ MODELS.charsReady=true; if(typeof onCharsReady==="function") onCharsReady(); } },undefined,()=>{ MODELS.fail=true; }));
  const list=[]; HEX_LIST.forEach(h=>{ if(h.indexOf("%c")>=0) REALM_HEXCOLOR.forEach(c=>list.push(h.replace("%c",c))); else list.push(h); }); let m=0;
  list.forEach(name=>L.load("models/hex/"+name+".gltf",g=>{ g.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=HIGH(); o.receiveShadow=HIGH(); if(o.material){ o.material.roughness=.95; o.material.metalness=0; } } }); MODELS.hex[name]=g.scene; if(++m===list.length){ MODELS.hexReady=true; if(typeof onHexReady==="function") onHexReady(); } },undefined,()=>{ if(++m===list.length){ MODELS.hexReady=true; if(typeof onHexReady==="function") onHexReady(); } }));
})();
function hexModel(name,scale){ const src=MODELS.hex[name]; if(!src) return null; const o=src.clone(); o.scale.setScalar(scale||5); return o; }

/* ---- 애니메이션 캐릭터 만들기 ---- */
function makeCharGL(modelName,opts){
  const src=MODELS.chars[modelName]; if(!src) return null; opts=opts||{};
  const obj=THREE.SkeletonUtils.clone(src.scene); const g=new THREE.Group(); obj.scale.setScalar(opts.scale||2.1); g.add(obj);
  if(opts.tint){ obj.traverse(o=>{ if(o.isMesh&&o.material){ o.material=o.material.clone(); o.material.color.multiply(new THREE.Color(opts.tint)); } }); }
  const show=(nm,v)=>{ const o=obj.getObjectByName(nm); if(o) o.visible=!!v; };
  (opts.hide||[]).forEach(nm=>show(nm,false)); Object.keys(opts.parts||{}).forEach(nm=>show(nm,opts.parts[nm]));
  const mixer=new THREE.AnimationMixer(obj); const actions={}; src.animations.forEach(c=>{ actions[c.name]=mixer.clipAction(c); });
  g.userData.gl={mixer,actions,cur:null,onceUntil:0,attack:opts.attack||"1H_Melee_Attack_Slice_Diagonal",skill:opts.skill||"Spellcast_Shoot"}; MIXERS.push(g);
  playAnim(g,"Idle"); return g; }
function playAnim(g,name,once,fade){ const G=g.userData.gl; if(!G) return; const a=G.actions[name]; if(!a) return; const now=performance.now();
  if(once){ if(G.cur===name&&now<G.onceUntil) return; a.reset(); a.setLoop(THREE.LoopOnce,1); a.clampWhenFinished=true; a.enabled=true; a.fadeIn(fade||.08); a.play(); if(G.curA&&G.curA!==a) G.curA.fadeOut(fade||.08); G.cur=name; G.curA=a; G.onceUntil=now+a.getClip().duration*1000-60; return; }
  if(G.cur===name) return; if(now<G.onceUntil&&G.cur!=="Idle"&&G.cur!=="Walking_A"&&G.cur!=="Running_A"&&G.cur!=="Death_A") return;
  a.reset(); a.setLoop(THREE.LoopRepeat,Infinity); a.enabled=true; a.fadeIn(fade||.18); a.play(); if(G.curA&&G.curA!==a) G.curA.fadeOut(fade||.18); G.cur=name; G.curA=a; }
function animState(g,st){ if(!g||!g.userData.gl) return; const G=g.userData.gl; if(st==="dead"){ if(G.cur!=="Death_A") playAnim(g,"Death_A",true,.1); return; } if(st==="attack"){ playAnim(g,G.attack,true,.05); return; } if(st==="skill"){ playAnim(g,G.skill,true,.05); return; } if(st==="hit"){ playAnim(g,"Hit_A",true,.05); return; } if(st==="jump"){ playAnim(g,"Jump_Full_Short",true,.05); return; } if(st==="cheer"){ playAnim(g,"Cheer",true,.1); return; }
  if(performance.now()<G.onceUntil) return; playAnim(g,st==="run"?"Running_A":st==="walk"?"Walking_A":"Idle"); }
function tickMixers(dt){ for(let i=MIXERS.length-1;i>=0;i--){ const g=MIXERS[i]; if(!g.parent){ MIXERS.splice(i,1); continue; } g.userData.gl.mixer.update(dt); } }

/* ---- 세계·계급·꾸미기에 맞는 캐릭터 ---- */
function avatarGL(realm,rank,look){ look=look||{}; if(!MODELS.charsReady) return null; const name=CHAR_OF_REALM[realm];
  const hat=look.hair===1?false:look.hair===2?true:rank>=2, cape=look.cloth===1?false:look.cloth===2?true:rank>=3; const tint=LOOKS.eye[look.eye]||null;
  let parts={},hide=[],attack="1H_Melee_Attack_Slice_Diagonal",skill="Spellcast_Shoot";
  if(name==="Knight"){ hide=["2H_Sword","1H_Sword_Offhand","Badge_Shield","Rectangle_Shield"]; parts={Spike_Shield:rank>=4,Round_Shield:rank>=1&&rank<4,Knight_Helmet:hat,Knight_Cape:cape}; }
  else if(name==="Mage"){ hide=["Spellbook","Spellbook_open"]; parts={"1H_Wand":rank<2,"2H_Staff":rank>=2,Mage_Hat:hat,Mage_Cape:cape}; attack="Spellcast_Shoot"; skill="Spellcasting"; }
  else if(name==="Barbarian"){ hide=["1H_Axe_Offhand","Mug"]; parts={"1H_Axe":rank<2,"2H_Axe":rank>=2,Barbarian_Round_Shield:rank<2,Barbarian_Hat:hat,Barbarian_Cape:cape}; attack=rank>=2?"2H_Melee_Attack_Chop":"1H_Melee_Attack_Slice_Diagonal"; }
  else { hide=["1H_Crossbow","2H_Crossbow","Throwable"]; parts={Knife:true,Knife_Offhand:rank>=2,Rogue_Cape:cape}; }
  const g=makeCharGL(name,{hide,parts,attack,skill,tint}); if(!g) return null; const R=REALMS[realm];
  if(rank>=4){ const aura=new THREE.Mesh(new THREE.RingGeometry(1.1,1.5,40),glowMat(R.c1,.7)); aura.rotation.x=-Math.PI/2; aura.position.y=.08; g.add(aura); g.userData.aura=aura; }
  if(rank>=6){ const crown=new THREE.Mesh(new THREE.TorusGeometry(.9,.05,8,24),glowMat(R.c1,.9)); crown.position.y=4.6; g.userData.crown=crown; g.add(crown); }
  if(realm===0){ const halo=new THREE.Mesh(new THREE.TorusGeometry(.5,.05,10,32),mat({color:0xffe27a,emissive:0xffd05a,emissiveIntensity:1.2,metalness:.5,roughness:.3})); halo.rotation.x=Math.PI/2; halo.position.y=4.3; g.add(halo); }
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=.05; g.add(sh);
  g.userData.glAvatar=true; return g; }
const SKEL_OF={"드라우그":"Skeleton_Warrior","길 잃은 영혼":"Skeleton_Minion","베탈라":"Skeleton_Rogue"};
function mobGL(name,scale){ const mn=SKEL_OF[name]; if(!mn||!MODELS.charsReady) return null; const g=makeCharGL(mn,{scale:2.0*scale,attack:mn==="Skeleton_Mage"?"Spellcast_Shoot":"1H_Melee_Attack_Slice_Diagonal"}); if(!g) return null; g.userData.h=4.2*scale; const sh=new THREE.Mesh(new THREE.CircleGeometry(1,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false})); sh.rotation.x=-Math.PI/2; sh.position.y=.05; g.add(sh); return g; }

/* ---- 모델이 준비되면 캐릭터 교체 ---- */
function onCharsReady(){ try{ if(typeof buildPlayer==="function"&&player) buildPlayer(); if(typeof PEERS!=="undefined") for(const id in PEERS){ const o=PEERS[id]; if(typeof net!=="undefined"&&net.rebuild) net.rebuild(o); }
  NPCS.forEach((o,k)=>{ const g=avatarGL(REGIONS.find(r=>r===o.cap).realm,6,{hair:2,cloth:2,eye:[0,1,5,3][k%4]}); if(g){ scene.remove(o.mesh); g.scale.setScalar(1.15); o.mesh=g; scene.add(g); } }); }catch(e){ console.warn(e); } }

/* ---- 건물·나무: 준비되면 절차 소품을 진짜 모델로 교체 ---- */
// PLACED는 03-core에서 선언
function onHexReady(){ try{ PLACED.forEach(p=>{ if(p.obj) scene.remove(p.obj); const o=hexFor(p); if(o){ o.position.set(p.x,hAt(p.x,p.z)-.05,p.z); o.rotation.y=p.rot||0; scene.add(o); p.obj=o; } }); }catch(e){ console.warn(e); } }
function hexFor(p){ const c=REALM_HEXCOLOR[p.realm]||"yellow"; const R=REALMS[p.realm]||REALMS[0];
  if(p.kind==="tree"){ const pool=p.realm===1?["trees_B_small","trees_B_medium","trees_B_large","tree_single_B"]:p.realm===2?["tree_single_A","tree_single_B","trees_A_small"]:["trees_A_small","trees_A_medium","trees_A_large","tree_single_A"]; return hexModel(pick(pool),rnd(4.5,6.5)); }
  if(p.kind==="rock"){ return hexModel(pick(["rock_single_A","rock_single_B","rock_single_C","rock_single_D","rock_single_E"]),rnd(9,16)); }
  if(p.kind==="house"){ return hexModel(pick(["building_home_A_"+c,"building_home_B_"+c,"building_tavern_"+c,"building_blacksmith_"+c]),5.5); }
  if(p.kind==="castle"){ return hexModel("building_castle_"+c,5.5); }
  if(p.kind==="church"){ return hexModel(pick(["building_church_"+c,"building_tower_A_"+c,"building_windmill_"+c]),5.5); }
  if(p.kind==="market"){ return hexModel("building_market_"+c,5); }
  if(p.kind==="well"){ return hexModel("building_well_"+c,5); }
  if(p.kind==="prop"){ return hexModel(pick(["barrel","crate_A_big","tent","weaponrack","wheelbarrow","sack","bucket_water","target"]),5); }
  if(p.kind==="flag"){ return hexModel("flag_"+c,5); }
  return null; }
</script>
