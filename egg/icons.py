from PIL import Image, ImageDraw, ImageFilter
def mk(S,pad):
    im=Image.new("RGBA",(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
    for y in range(S):
        t=y/S; c=tuple(int(a+(b-a)*t) for a,b in zip((159,220,255),(134,207,102)))
        d.line([(0,y),(S,y)],fill=c+(255,))
    # grass hill
    d.ellipse([-S*.2,S*.62,S*1.2,S*1.5],fill=(110,190,80,255))
    # nest
    cx=S/2; ny=S*.74
    d.ellipse([cx-S*.3,ny-S*.08,cx+S*.3,ny+S*.1],fill=(140,90,50,255))
    d.ellipse([cx-S*.24,ny-S*.06,cx+S*.24,ny+S*.05],fill=(100,62,32,255))
    # egg
    ew,eh=S*.32,S*.42; ex0,ey0=cx-ew/2,ny-eh-S*.0
    sh=Image.new("RGBA",(S,S),(0,0,0,0)); ImageDraw.Draw(sh).ellipse([ex0+S*.02,ey0+S*.03,ex0+ew+S*.02,ey0+eh+S*.03],fill=(0,0,0,70)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(S*.02)))
    d=ImageDraw.Draw(im)
    d.ellipse([ex0,ey0,ex0+ew,ey0+eh],fill=(255,214,90,255))
    d.ellipse([ex0+ew*.15,ey0+eh*.1,ex0+ew*.5,ey0+eh*.35],fill=(255,245,200,255))
    for (fx,fy,r) in [(.65,.45,.07),(.35,.62,.06),(.62,.75,.05)]:
        d.ellipse([ex0+ew*fx-S*r/2,ey0+eh*fy-S*r/2,ex0+ew*fx+S*r/2,ey0+eh*fy+S*r/2],fill=(255,140,60,255))
    # sneaky hand / sparkle
    for (sx,sy,r) in [(.2,.25,.035),(.8,.2,.03),(.78,.42,.02)]:
        x,y=S*sx,S*sy; d.polygon([(x,y-S*r*2),(x+S*r*.5,y-S*r*.5),(x+S*r*2,y),(x+S*r*.5,y+S*r*.5),(x,y+S*r*2),(x-S*r*.5,y+S*r*.5),(x-S*r*2,y),(x-S*r*.5,y-S*r*.5)],fill=(255,255,255,255))
    return im
for S in (192,512):
    m=mk(S,0); mask=Image.new("L",(S,S),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,S-1,S-1],int(S*.22),fill=255)
    out=Image.new("RGBA",(S,S),(0,0,0,0)); out.paste(m,(0,0),mask); out.save(f"icons/icon-{S}.png")
mk(512,0).save("icons/maskable-512.png")
