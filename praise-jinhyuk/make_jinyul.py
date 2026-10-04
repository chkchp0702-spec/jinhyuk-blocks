import re, os, json, subprocess
s=open('game.html',encoding='utf-8').read()
# 이름 바꾸기
s=s.replace("진혁","진율").replace("혁이","율이").replace("혁","율")
s=s.replace('"율이멋짐"','"율이멋져"').replace('"진율이멋짐"','"진율이멋져"').replace('"진율이는멋짐"','"진율이는멋져"')
s=s.replace('"jh-','"jy-')
# 노을빛 하늘 + 민트 틀
s=s.replace("--sky-top:#7fd0ff;","--sky-top:#ffc48c;").replace("--sky-low:#3f86e0;","--sky-low:#ee6f9c;")
s=s.replace("--frame:#ffd04d;","--frame:#6fdcbc;").replace("--frame-dark:#d99a12;","--frame-dark:#2f9e7f;")
s=s.replace("linear-gradient(180deg,#ffe27a,var(--frame))","linear-gradient(180deg,#a9f0db,var(--frame))")
s=s.replace("--ink:#1f2a5c;","--ink:#3a1f4f;").replace("--well:#1c2657;","--well:#33204f;").replace("--well-low:#141b40;","--well-low:#24163a;")
s=s.replace(".brand b{color:var(--gold);font-weight:400}",".brand b{color:#fff3a6;font-weight:400}").replace("text-shadow:0 2px 0 rgba(31,42,92,.55),0 0 8px rgba(31,42,92,.35)","text-shadow:0 2px 0 rgba(90,30,80,.6),0 0 10px rgba(90,30,80,.45)")
assert "혁" not in s
os.makedirs('../praise-jinyul/icons',exist_ok=True)
open('../praise-jinyul/game.html','w',encoding='utf-8').write(s)
b=open('build.py',encoding='utf-8').read()
b=b.replace("'game.html'","'../praise-jinyul/game.html'").replace("'index.html'","'../praise-jinyul/index.html'").replace("'manifest.webmanifest'","'../praise-jinyul/manifest.webmanifest'").replace("open('sw.js'","open('../praise-jinyul/sw.js'")
b=b.replace("praise-jinhyuk","praise-jinyul").replace("#7fd0ff","#ffc48c").replace("진혁이","진율이").replace("jh-v1","py-v1")
exec(b)
ic=open('icons.py',encoding='utf-8').read()
ic=ic.replace('chars=["진","혁","최","고"]','chars=["진","율","최","고"]').replace('(127,208,255),(63,134,224)','(255,196,140),(238,111,156)')
ic=ic.replace('cols=[(255,93,93),(255,164,27),(42,164,244),(54,196,107)]','cols=[(143,99,242),(22,193,176),(255,93,93),(255,164,27)]').replace('f"icons/','f"../praise-jinyul/icons/').replace('"icons/maskable','"../praise-jinyul/icons/maskable')
exec(ic)
