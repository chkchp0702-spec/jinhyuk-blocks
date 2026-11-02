from PIL import Image, ImageDraw
def icon(size,maskable=False):
    im=Image.new('RGB',(size,size),'#1a1030'); d=ImageDraw.Draw(im)
    pad=size*0.12 if maskable else size*0.04
    cols=['#ffd95e','#8fd0ff','#ff9f3d','#7fe0ff']; c=size/2; r=size/2-pad
    # 네 세계 조각
    for i,(a0,col) in enumerate(zip([270,0,90,180],cols)):
        d.pieslice([c-r,c-r,c+r,c+r],a0,a0+90,fill=col)
    d.ellipse([c-r*.62,c-r*.62,c+r*.62,c+r*.62],fill='#1a1030')
    # 번개
    s=r*.5; pts=[(c+s*.1,c-s),(c-s*.45,c+s*.1),(c+s*.05,c+s*.1),(c-s*.15,c+s),(c+s*.5,c-s*.15),(c+s*.02,c-s*.15)]
    d.polygon(pts,fill='#ffd95e')
    return im
icon(192).save('icons/icon-192.png'); icon(512).save('icons/icon-512.png'); icon(512,True).save('icons/maskable-512.png'); print('icons ok')
