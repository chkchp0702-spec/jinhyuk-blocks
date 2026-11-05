<script>
/* v59: 화면 위 보스 체력판 — 초상 칸·이름·Lv·종류 띠·체력 숫자·3단계(페이즈) 표시 (모습만, 보스 능력 그대로) */
const BOSSBAR={ cur:null, ph:0, ico:{wolf:"🐺",naga:"🐍",snake:"🐍",apep:"🐍",fireserpent:"🐉",hydra:"🐲",icegiant:"🧊",nephilim:"🗿",giant:"🗿",cyclops:"👁️",troll:"🧌",draugr:"💀",mummy:"🧟",ghost:"👻",vetala:"🦇",darkangel:"😈",angel:"👼",demon:"👹",ravana:"👺",rakshasa:"👺",asura:"👹",bull:"🐂",satyr:"🐐",harpy:"🦅",scorpion:"🦂",scarab:"🪲",turret:"🗼",war:"⚔️"},
  kind(m){ if(m.titan) return ["거대 보스","t"]; if(m.trialOf) return ["승급 시험","r"]; if(m.styBoss!=null) return ["이야기 보스","s"]; if(m.ds) return ["미궁 보스","d"]; if(m.world) return ["세계 보스","w"]; return ["지역 보스","b"]; },
  update(near){ const bb=$("bossbar"); if(!bb) return; if(!near){ if(!bb.hidden){ bb.hidden=true; } this.cur=null; return; }
    const p=clamp(near.hp/near.mhp,0,1), ph=p>2/3?0:p>1/3?1:2;
    if(this.cur!==near){ this.cur=near; this.ph=ph; bb._hp=null; bb._hg=null; const k=this.kind(near); bb.className="k"+k[1]; $("bossIco").textContent=this.ico[near.shape]||"👑"; $("bossKind").textContent=k[0]; $("bossNm").textContent=near.n; $("bossLv").textContent="Lv."+near.lv+(near.power?" · 파워 "+near.power:""); bb.hidden=false; bb.classList.remove("in"); void bb.offsetWidth; bb.classList.add("in"); }
    if(bb.hidden) bb.hidden=false;
    if(ph>this.ph){ this.ph=ph; const f=$("bossPh"); f.textContent=ph===1?"⚡ 2단계 — 화가 났다!":"🔥 3단계 — 마지막 힘!"; bb.classList.remove("phx"); void bb.offsetWidth; bb.classList.add("phx"); try{ tone(ph===1?150:110,.25,"sawtooth",0,.12); }catch(e){} }
    bb.dataset.ph=ph; hpBar(bb,p);
    const t=fmt(Math.max(0,Math.ceil(near.hp)))+" / "+fmt(near.mhp)+"  ("+Math.ceil(p*100)+"%)"; if(bb._ht2!==t){ bb._ht2=t; $("bossNum").textContent=t; }
  } };
</script>

