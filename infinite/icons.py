from PIL import Image, ImageDraw, ImageFont, ImageFilter
F="/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"
def mk(S,inner):
    im=Image.new("RGBA",(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
    for y in range(S):
        t=y/S; c=tuple(int(a+(b-a)*t) for a,b in zip((91,107,255),(26,29,74))); d.line([(0,y),(S,y)],fill=c+(255,))
    # infinity loop
    cx,cy=S/2,S*.44; r=S*.17*inner; w=int(S*.075*inner)
    for dx,col in ((-1,(255,77,94)),(1,(255,204,51))):
        d.ellipse([cx+dx*r*1.05-r,cy-r*.8,cx+dx*r*1.05+r,cy+r*.8],outline=col+(255,),width=w)
    f=ImageFont.truetype(F,int(S*.15*inner))
    d.text((S/2,S*.78),"무한게임",font=f,fill=(255,255,255,255),anchor="mm",stroke_width=int(S*.012),stroke_fill=(20,24,60,255))
    return im
for S in (192,512):
    m=mk(S,1); mask=Image.new("L",(S,S),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,S-1,S-1],int(S*.22),fill=255)
    o=Image.new("RGBA",(S,S),(0,0,0,0)); o.paste(m,(0,0),mask); o.save(f"icons/icon-{S}.png")
mk(512,.8).save("icons/maskable-512.png")
