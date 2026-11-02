import json,os,shutil
parts=sorted(f for f in os.listdir('src'))
s=''.join(open(os.path.join('src',f),encoding='utf-8').read() for f in parts)
s=s.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','three.min.js')
open('index.html','w',encoding='utf-8').write(s)
if not os.path.exists('three.min.js'): shutil.copy('../egg-steal/three.min.js','three.min.js')
json.dump({"name":"신들의 전쟁","short_name":"신들의 전쟁","description":"네 신화 세계의 전쟁 · 친구와 함께","lang":"ko",
 "id":"/jinhyuk-blocks/gods-war/","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#1a1030","theme_color":"#1a1030",
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open('manifest.webmanifest','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('gods-war built',len(s))
