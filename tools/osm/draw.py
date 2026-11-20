import json, re
from PIL import Image, ImageDraw, ImageFont
src=open('/home/claude/kinmen/src/06_osmroads.js',encoding='utf8').read()
d=json.loads(src[src.index('{'):src.rindex('}')+1])
coast=json.loads(re.search(r'const GEO_COAST=(\[.*?\]\]\]);',open('/home/claude/kinmen/src/05_data.js',encoding='utf8').read()).group(1))
LON0,LAT0,KM=118.345,24.456,150
S=0.4; X0=-2250; Z0=-1500
W,H=int(4300*S),int(2900*S)
im=Image.new('RGB',(W,H),(150,190,215)); g=ImageDraw.Draw(im)
T=lambda x,z:((x-X0)*S,(z-Z0)*S)
for r in coast: g.polygon([T((p[0]-LON0)*101.3*KM,-(p[1]-LAT0)*110.8*KM) for p in r],fill=(200,215,170))
col={0:(200,40,30),1:(230,140,20),2:(90,90,90)}
for a,b,c,ni,m in sorted(d['e'],key=lambda e:-e[2]):
  pts=[d['n'][a]]+[(m[i],m[i+1]) for i in range(0,len(m),2)]+[d['n'][b]]
  g.line([T(*p) for p in pts],fill=col[c],width=3 if c==0 else 2)
im.save('/home/claude/kinmen/test/shots/osm_roads.png')
