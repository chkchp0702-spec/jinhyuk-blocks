from PIL import Image, ImageDraw, ImageFont, ImageFilter
F="/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"
def mk(S, pad):
    im=Image.new("RGBA",(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
    # sky bg
    for y in range(S):
        t=y/S; c=tuple(int(a+(b-a)*t) for a,b in zip((127,208,255),(63,134,224)))
        d.line([(0,y),(S,y)],fill=c+(255,))
    u=(S-2*pad)/2
    cols=[(255,93,93),(255,164,27),(42,164,244),(54,196,107)]
    chars=["진","혁","최","고"]
    font=ImageFont.truetype(F,int(u*0.58),index=1) if False else ImageFont.truetype(F,int(u*0.58))
    for k in range(4):
        x=pad+(k%2)*u; y=pad+(k//2)*u; g=u*0.06
        box=[x+g,y+g,x+u-g,y+u-g]; r=int(u*0.2)
        sh=Image.new("RGBA",(S,S),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle([box[0],box[1]+u*.05,box[2],box[3]+u*.05],r,fill=(20,27,64,110))
        im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(u*.03)))
        d=ImageDraw.Draw(im)
        c=cols[k]; dark=tuple(int(v*.72) for v in c)
        d.rounded_rectangle(box,r,fill=dark+(255,))
        d.rounded_rectangle([box[0],box[1],box[2],box[3]-u*.07],r,fill=c+(255,))
        hl=Image.new("RGBA",(S,S),(0,0,0,0)); ImageDraw.Draw(hl).ellipse([box[0]+u*.12,box[1]+u*.07,box[0]+u*.55,box[1]+u*.28],fill=(255,255,255,140))
        im.alpha_composite(hl)
        d=ImageDraw.Draw(im)
        cx=(box[0]+box[2])/2; cy=(box[1]+box[3])/2-u*.03
        d.text((cx,cy+u*.035),chars[k],font=font,fill=dark+(255,),anchor="mm")
        d.text((cx,cy),chars[k],font=font,fill=(255,255,255,255),anchor="mm")
    return im
for S in (192,512):
    m=mk(S,int(S*.1)); mask=Image.new("L",(S,S),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,S-1,S-1],int(S*.22),fill=255)
    out=Image.new("RGBA",(S,S),(0,0,0,0)); out.paste(m,(0,0),mask); out.save(f"icons/icon-{S}.png")
mk(512,int(512*.2)).save("icons/maskable-512.png")
