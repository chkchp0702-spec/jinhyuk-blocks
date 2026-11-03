<script>
/* ================= 아주 작은 MQTT 클라이언트 (웹소켓) — 외부 라이브러리 없이 ================= */
function MiniMQTT(url,opt){
  const self={url,ok:false,ws:null,buf:new Uint8Array(0),pid:1,pingT:null,retry:null,closed:false,subs:[],opt};
  const enc=new TextEncoder(), dec=new TextDecoder();
  function str(s){ const b=enc.encode(s); const o=new Uint8Array(b.length+2); o[0]=b.length>>8; o[1]=b.length&255; o.set(b,2); return o; }
  function cat(arr){ let n=0; arr.forEach(a=>n+=a.length); const o=new Uint8Array(n); let p=0; arr.forEach(a=>{ o.set(a,p); p+=a.length; }); return o; }
  function pkt(type,body){ const len=[]; let x=body.length; do{ let d=x%128; x=Math.floor(x/128); if(x>0) d|=128; len.push(d); }while(x>0); return cat([new Uint8Array([type]),new Uint8Array(len),body]); }
  function send(u8){ try{ if(self.ws&&self.ws.readyState===1) self.ws.send(u8); }catch(e){} }
  function connect(){ if(self.closed) return; let ws; try{ ws=new WebSocket(url,"mqtt"); }catch(e){ schedule(); return; } ws.binaryType="arraybuffer"; self.ws=ws;
    const to=setTimeout(()=>{ try{ ws.close(); }catch(e){} },9000);
    ws.onopen=()=>{ const body=cat([str("MQTT"),new Uint8Array([4,2,0,opt.keepalive||25]),str(opt.clientId)]); send(pkt(0x10,body)); };
    ws.onmessage=ev=>{ const d=new Uint8Array(ev.data); self.buf=cat([self.buf,d]); parse(); };
    ws.onclose=()=>{ clearTimeout(to); if(self.ok){ self.ok=false; opt.onclose&&opt.onclose(); } clearInterval(self.pingT); schedule(); };
    ws.onerror=()=>{};
    function parse(){ for(;;){ const b=self.buf; if(b.length<2) return; let mul=1,len=0,i=1; for(;;){ if(i>=b.length) return; const d=b[i++]; len+=(d&127)*mul; mul*=128; if(!(d&128)) break; } if(b.length<i+len) return; const type=b[0]>>4, body=b.subarray(i,i+len); self.buf=b.subarray(i+len);
        if(type===2){ if(body[1]===0){ self.ok=true; clearTimeout(to); self.pingT=setInterval(()=>send(new Uint8Array([0xC0,0])),(opt.keepalive||25)*1000*.6); self.subs.forEach(t=>subscribe(t)); opt.onconnect&&opt.onconnect(); } else { try{ ws.close(); }catch(e){} } }
        else if(type===3){ const qos=(b[0]>>1)&3; const tl=(body[0]<<8)|body[1]; const topic=dec.decode(body.subarray(2,2+tl)); let p=2+tl; if(qos>0) p+=2; const retain=b[0]&1; opt.onmessage&&opt.onmessage(topic,dec.decode(body.subarray(p)),!!retain); } } }
  }
  function schedule(){ if(self.closed) return; clearTimeout(self.retry); self.retry=setTimeout(connect,3000+Math.random()*2000); }
  function subscribe(t){ if(self.subs.indexOf(t)<0) self.subs.push(t); if(!self.ok) return; const id=self.pid++; send(pkt(0x82,cat([new Uint8Array([id>>8,id&255]),str(t),new Uint8Array([0])]))); }
  function publish(t,msg,retain){ if(!self.ok) return; send(pkt(0x30|(retain?1:0),cat([str(t),enc.encode(msg)]))); }
  function close(){ self.closed=true; clearInterval(self.pingT); clearTimeout(self.retry); try{ self.ws&&self.ws.close(); }catch(e){} }
  connect(); return {subscribe,publish,close,get ok(){ return self.ok; }};
}

/* ================= 함께하기: 같은 초대 링크(방)의 모든 폰이 공개 중계 서버 4곳에 동시에 연결 ================= */
const PEERS={};   // 다른 플레이어들
const net=(function(){
  const BROKERS=window.GW_BROKERS||["wss://broker.emqx.io:8084/mqtt","wss://broker.hivemq.com:8884/mqtt","wss://mqtt.eclipseprojects.io:443/mqtt","wss://test.mosquitto.org:8081"];
  const ROOT="chk0702/godswar/"+ROOM+"/"; const TOPIC=ROOT+"all", WTOPIC=ROOT+"world", PTOPIC=ROOT+"p/", BTOPIC=ROOT+"titan/";
  const N={clients:[],up:0,seq:0,seen:{},seenN:0,sendT:0,started:false,hiT:0,worldT:0,lastWorld:""};
  function dots(){ N.clients.forEach((c,i)=>{ const d=$("netPill").querySelector(`.dot[data-i="${i}"]`); if(d) d.classList.toggle("on",c.ok); }); const n=Object.keys(PEERS).length; $("netTxt").textContent=N.up>0?(n>0?`${n}명과 함께`:"접속 중 · 친구 기다리는 중"):"연결 중…"; }
  function start(){ if(N.started||G.realm<0||!ACCESS) return; N.started=true; if(!/^https?:/.test(location.protocol)){ $("netTxt").textContent="앱에서만 함께하기 가능"; return; }
    BROKERS.forEach((url,i)=>{ const c=MiniMQTT(url,{clientId:"gw_"+G.id+"_"+i+"_"+Math.random().toString(36).slice(2,6),keepalive:25,
      onconnect:()=>{ N.up++; c.subscribe(TOPIC); c.subscribe(WTOPIC); c.subscribe(PTOPIC+"+"); try{ c.subscribe(BTOPIC+TB.w+"/+"); }catch(e){} dots(); hello(); try{ c.publish(PTOPIC+G.id,JSON.stringify(myProfile(1)),true); }catch(e){} },
      onclose:()=>{ N.up=Math.max(0,N.up-1); dots(); },
      onmessage:(topic,msg,retain)=>{ let d; try{ d=JSON.parse(msg); }catch(e){ return; } if(topic===WTOPIC){ mergeWorld(d); return; } if(topic.indexOf(BTOPIC)===0){ if(typeof titanMsg==="function") titanMsg(d); return; } if(topic.indexOf(PTOPIC)===0){ if(typeof mmoProfile==="function") mmoProfile(d); return; } recv(d); } });
      N.clients.push(c); }); dots(); }
  function send(o){ if(!N.started) return; o.i=G.id; o.q=++N.seq; const s=JSON.stringify(o); N.clients.forEach(c=>{ try{ c.publish(TOPIC,s); }catch(e){} }); }
  function pushWorld(){ const s=JSON.stringify(W); N.clients.forEach(c=>{ try{ c.publish(WTOPIC,s,true); }catch(e){} }); }
  function pushProfile(on){ if(!N.started||G.realm<0) return; const s=JSON.stringify(myProfile(on)); N.clients.forEach(c=>{ try{ c.publish(PTOPIC+G.id,s,true); }catch(e){} }); }
  function pushTitan(o){ if(!N.started) return; const s=JSON.stringify(o); N.clients.forEach(c=>{ try{ c.publish(BTOPIC+o.w+"/"+G.id,s,true); }catch(e){} }); }
  function hello(){ send({t:"hi",n:G.name,r:G.realm,k:G.rank,l:G.lv,lk:lookArr(),e:[G.eq.w,G.eq.a,G.eq.r],pt:(typeof petArr==="function"?petArr():null)}); }
  function lookArr(){ const l=G.look||{}; return [l.face||0,l.body||0,l.hat||0,l.cape||0,l.weapon||0,l.tint||0]; }
  function eqObj(e){ const a=(e||"-1,-1,-1").split(",").map(Number); return {w:a[0],a:a[1],r:a[2]}; }
  function lookObj(a){ a=a||[0,0,0,0,0,0]; return {face:a[0]||0,body:a[1]||0,hat:a[2]||0,cape:a[3]||0,weapon:a[4]||0,tint:a[5]||0}; }
  function ensure(id,d){ let o=PEERS[id]; if(!o){ o=PEERS[id]={id,name:d.n||"?",realm:d.r||0,rank:d.k||0,lv:d.l||1,x:d.x||0,z:d.z||0,tx:d.x||0,tz:d.z||0,tf:0,m:0,walk:0,hp:1,mhp:1,dead:false,last:performance.now(),mesh:null,lbl:makeLabel(""),w:-1,anim:0};
      o.lk=(d.lk||[0,0,0,0,0,0]).join(","); o.e=(d.e||[-1,-1,-1]).join(","); o.mesh=(typeof avatarGL==="function"&&avatarGL(o.realm,o.rank,lookObj(d.lk),undefined,eqObj(o.e)))||makeAvatar(o.realm,o.rank,false,lookObj(d.lk)); scene.add(o.mesh); o.mesh.position.set(o.x,0,o.z); toast(`${o.name} 입장!`,`${REALMS[o.realm].n} · ${REALMS[o.realm].ranks[o.rank]}`,2.2); jingle([523,659,784]); dots(); }
    return o; }
  function rebuild(o){ scene.remove(o.mesh); const lk=lookObj(o.lk?o.lk.split(",").map(Number):null); o.mesh=(typeof avatarGL==="function"&&avatarGL(o.realm,o.rank,lk,undefined,eqObj(o.e)))||makeAvatar(o.realm,o.rank,false,lk); scene.add(o.mesh); o.mesh.position.set(o.x,0,o.z); if(o.w>=0&&!o.mesh.userData.glAvatar){ const w=makeWeapon(o.realm,o.w); w.position.set(0,-1.2,.3); o.mesh.userData.armR.add(w); } }
  function recv(d){ if(!d||!d.t||!d.i||d.i===G.id) return; const key=d.i+":"+d.q; if(N.seen[key]) return; N.seen[key]=1; if(++N.seenN>600){ N.seen={}; N.seenN=0; }
    if(!PEERS[d.i]&&d.t!=="hi"&&d.t!=="st") return; const o=ensure(d.i,d); o.last=performance.now();
    if(d.t==="hi"){ const lk=(d.lk||[0,0,0,0,0,0]).join(","), e=(d.e||[-1,-1,-1]).join(","); if(o.realm!==d.r||o.rank!==d.k||o.lk!==lk||o.e!==e){ o.realm=d.r; o.rank=d.k; o.lk=lk; o.e=e; rebuild(o); } o.name=d.n; o.lv=d.l; o.pt=d.pt||null; }
    else if(d.t==="st"){ if(d.n) o.name=d.n; o.tx=d.x; o.tz=d.z; o.tf=d.f; o.m=d.m; o.hp=d.h; o.mhp=d.H; o.lv=d.l; o.dead=!!d.D; if(o.rank!==d.k||o.realm!==d.r||o.w!==d.w){ o.rank=d.k; o.realm=d.r; o.w=d.w; rebuild(o); } o.mesh.visible=!o.dead; }
    else if(d.t==="a"){ if(d.pj||d.k==="thr"){ if(typeof peerProj==="function") peerProj(o,d); } o.anim=.3; o.skl=d.k==="skl"||d.k==="thr"; if(d.k==="skl") fxRing(o.x,o.z,REALMS[o.realm].skills[0].color,6,.5); }
    else if(d.t==="hit"){ if(d.to!==G.id||P.dead) return; if(inCapital(P.x,P.z)) return; const st=stat(); hurtPlayer(d.d*(1-dmgReduce(st.def))*.7,o.name); toast(`${o.name}의 공격!`,null,.8); }
    else if(d.t==="dead"){ if(d.by===G.name){ G.war++; G.gold+=40+o.lv*5; gainXp(60+o.lv*12); toast(`${o.name} 격파!`,`전쟁 점수 +1 · 금화 +${40+o.lv*5}`,2.6); jingle([659,784,1046,1318]); saveGame(); } else toast(`${o.name}이(가) 쓰러졌어요`,null,1.4); }
    else if(d.t==="cap"){ if(mergeWorld({o:d.o,ts:d.ts})) toast(`${o.name}이(가) 영토를 점령했어요!`,`${REALMS[o.realm].n} 세력 확장`,2.4); }
    else if(d.t==="say"){ chat(o.name,d.m,o.realm,o); }
    else if(d.t==="sk"||d.t==="combo"){ if(typeof comboRecv==="function") comboRecv(o,d); }
    else if(d.t==="wc"){ if(typeof warContrib==="function") warContrib(d.i,d); } }
  function chat(who,m,realm,o){ if(typeof CHATLOG!=="undefined") CHATLOG.push({who,m,realm,t:Date.now()}); if(o){ o.bubble=m; o.bubbleT=5; } else { P.bubble=m; P.bubbleT=5; } const el=document.createElement("div"); el.className="msg"; el.innerHTML=`<b style="color:${realm>=0?REALMS[realm].c1:"#fff"}">${who}</b> ${m}`; $("chat").appendChild(el); setTimeout(()=>el.remove(),6000); tone(880,.05,"sine",0,.05); }
  function tick(dt){ if(!N.started) return;
    const now=performance.now();
    for(const id in PEERS){ const o=PEERS[id]; if(now-o.last>8000){ scene.remove(o.mesh); o.lbl.remove(); toast(`${o.name} 퇴장`,null,1.4); delete PEERS[id]; dots(); continue; }
      o.bubbleT=Math.max(0,(o.bubbleT||0)-dt); const p=o.mesh.position; const dx=o.tx-p.x, dz=o.tz-p.z; if(Math.hypot(dx,dz)>40){ p.x=o.tx; p.z=o.tz; } else { p.x+=dx*Math.min(1,dt*8); p.z+=dz*Math.min(1,dt*8); } o.x=p.x; o.z=p.z; p.y=hAt(p.x,p.z);
      let dr=o.tf-o.mesh.rotation.y; while(dr>Math.PI) dr-=Math.PI*2; while(dr<-Math.PI) dr+=Math.PI*2; o.mesh.rotation.y+=dr*Math.min(1,dt*12);
      if(o.m) o.walk+=dt*9; const u=o.mesh.userData, sw=o.m?Math.sin(o.walk)*.7:0; o.anim=Math.max(0,o.anim-dt); if(u.gl){ animState(o.mesh,o.dead?"dead":o.anim>.25?(o.skl?"skill":"attack"):o.m?"run":"idle"); if(u.crown) u.crown.rotation.y+=dt*2; } else { u.legL.rotation.x=sw; u.legR.rotation.x=-sw; u.armL.rotation.x=-sw; o.anim=Math.max(0,o.anim-dt); u.armR.rotation.x=o.anim>0?-2.2:sw; u.body.position.y=o.m?Math.abs(Math.sin(o.walk))*.12:0; }
      if(Math.hypot(o.x-P.x,o.z-P.z)<60&&!o.dead){ const foe=o.realm!==G.realm; o.lbl.className="lbl "+(foe?"foe":"ally"); placeLabel(o.lbl,o.x,4.6,o.z,`${o.bubbleT>0?`<span class="bub">${o.bubble}</span>`:""}${o.name} <b>${REALMS[o.realm].n} · ${REALMS[o.realm].ranks[o.rank]} Lv.${o.lv}</b><span class="hp"><i style="width:${Math.round(o.hp/o.mhp*100)}%;background:${foe?"#ff5a5f":"#3fd27a"}"></i></span>`); } else o.lbl.style.display="none"; }
    if(N.up>0){ N.sendT-=dt; if(N.sendT<=0){ N.sendT=.16; send({t:"st",n:G.name,x:+P.x.toFixed(1),z:+P.z.toFixed(1),f:+P.rot.toFixed(2),m:P.moving?1:0,h:Math.round(P.hp),H:stat().mhp,l:G.lv,k:G.rank,r:G.realm,w:G.eq.w,D:P.dead?1:0}); }
      N.hiT-=dt; if(N.hiT<=0){ N.hiT=6; hello(); } N.worldT-=dt; if(N.worldT<=0){ N.worldT=45; pushWorld(); } N.profT=(N.profT||20)-dt; if(N.profT<=0){ N.profT=60; pushProfile(1); } } }
  return {start,send,tick,pushWorld,pushProfile,pushTitan,chat,rebuild,hello,get up(){ return N.up; }};
})();
</script>
