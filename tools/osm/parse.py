import glob, json, re, math, pickle
import xml.etree.ElementTree as ET
src=open('/home/claude/kinmen/src/05_data.js',encoding='utf8').read()
coast=json.loads(re.search(r'const GEO_COAST=(\[.*?\]\]\]);',src).group(1))
nodes={}; ways={}
for f in glob.glob('/tmp/osm/t_*.osm'):
  try: root=ET.parse(f).getroot()
  except Exception as e: print('bad',f,e); continue
  for n in root.iter('node'): nodes[int(n.get('id'))]=(float(n.get('lat')),float(n.get('lon')))
  for w in root.iter('way'):
    t={tg.get('k'):tg.get('v') for tg in w.iter('tag')}
    if 'highway' not in t: continue
    ways[int(w.get('id'))]=([int(nd.get('ref')) for nd in w.iter('nd')],t)
def inpoly(poly,x,y):
  ins=False; j=len(poly)-1
  for i in range(len(poly)):
    xi,yi=poly[i]; xj,yj=poly[j]
    if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi: ins=not ins
    j=i
  return ins
bbs=[(min(p[0] for p in r),max(p[0] for p in r),min(p[1] for p in r),max(p[1] for p in r),r) for r in coast]
def onK(lat,lon):
  for x0,x1,y0,y1,r in bbs:
    if x0-0.003<=lon<=x1+0.003 and y0-0.003<=lat<=y1+0.003 and inpoly(r,lon,lat): return True
  return False
from collections import Counter
L=Counter(); keep={}
for wid,(nds,t) in ways.items():
  pts=[nodes[n] for n in nds if n in nodes]
  if len(pts)<2: continue
  mid=pts[len(pts)//2]
  if not (onK(*pts[0]) or onK(*pts[-1]) or onK(*mid)) and t.get('name')!='金門大橋': continue
  d=sum(math.hypot((pts[i][1]-pts[i-1][1])*101.3,(pts[i][0]-pts[i-1][0])*110.8) for i in range(1,len(pts)))
  L[t['highway']]+=d; keep[wid]=(nds,t)
for k,v in L.most_common(): print(k, round(v,1))
pickle.dump((nodes,keep),open('/tmp/osmw/k.pkl','wb'))
print('coast rings',len(coast))
