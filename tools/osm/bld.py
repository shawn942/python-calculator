import glob, json, re, math, pickle
import xml.etree.ElementTree as ET
from collections import Counter
src=open('/home/claude/kinmen/src/05_data.js',encoding='utf8').read()
coast=json.loads(re.search(r'const GEO_COAST=(\[.*?\]\]\]);',src).group(1))
nodes={}; blds=[]; places=[]
for f in glob.glob('/tmp/osm/t_*.osm'):
  root=ET.parse(f).getroot()
  for n in root.iter('node'):
    nodes[int(n.get('id'))]=(float(n.get('lat')),float(n.get('lon')))
    t={tg.get('k'):tg.get('v') for tg in n.iter('tag')}
    if t.get('place') in ('village','hamlet','neighbourhood','town','suburb','isolated_dwelling','locality'): places.append((t.get('name'),t['place'],float(n.get('lat')),float(n.get('lon'))))
  for w in root.iter('way'):
    t={tg.get('k'):tg.get('v') for tg in w.iter('tag')}
    if 'building' in t: blds.append(([int(nd.get('ref')) for nd in w.iter('nd')],t.get('building')))
def inpoly(poly,x,y):
  ins=False; j=len(poly)-1
  for i in range(len(poly)):
    xi,yi=poly[i]; xj,yj=poly[j]
    if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi: ins=not ins
    j=i
  return ins
def onK(lat,lon): return any(inpoly(r,lon,lat) for r in coast)
B=[]
seen=set()
for nds,typ in blds:
  pts=[nodes[n] for n in nds if n in nodes]
  if len(pts)<3: continue
  la=sum(p[0] for p in pts)/len(pts); lo=sum(p[1] for p in pts)/len(pts)
  k=(round(la,5),round(lo,5))
  if k in seen: continue
  seen.add(k)
  # area m2
  A=0
  for i in range(len(pts)):
    x1,y1=pts[i][1]*101300,pts[i][0]*110800; x2,y2=pts[i-1][1]*101300,pts[i-1][0]*110800; A+=x1*y2-x2*y1
  if onK(la,lo): B.append((la,lo,abs(A)/2,typ))
P=[p for p in {(a,b,round(c,4),round(d,4)) for a,b,c,d in places} if onK(p[2],p[3])]
print('buildings',len(B),'area km2',round(sum(b[2] for b in B)/1e6,2), Counter(b[3] for b in B).most_common(8))
print('places',len(P), Counter(p[1] for p in P))
pickle.dump((B,P),open('/tmp/osmw/b.pkl','wb'))
