import glob, json, re
import xml.etree.ElementTree as ET
nodes={}; P=[]
src=open('/home/claude/kinmen/src/05_data.js',encoding='utf8').read()
coast=json.loads(re.search(r'const GEO_COAST=(\[.*?\]\]\]);',src).group(1))
def inpoly(poly,x,y):
  ins=False; j=len(poly)-1
  for i in range(len(poly)):
    xi,yi=poly[i]; xj,yj=poly[j]
    if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi: ins=not ins
    j=i
  return ins
ways=[]
for f in glob.glob('/tmp/osm/t_*.osm'):
  root=ET.parse(f).getroot()
  for n in root.iter('node'):
    la,lo=float(n.get('lat')),float(n.get('lon')); nodes[int(n.get('id'))]=(la,lo)
    t={tg.get('k'):tg.get('v') for tg in n.iter('tag')}
    if t.get('name') and (t.get('tourism') in ('attraction','museum','viewpoint') or 'historic' in t): P.append((t['name'],t.get('tourism') or t.get('historic'),la,lo))
  for w in root.iter('way'):
    t={tg.get('k'):tg.get('v') for tg in w.iter('tag')}
    if t.get('name') and (t.get('tourism') in ('attraction','museum','viewpoint') or 'historic' in t): ways.append((t['name'],t.get('tourism') or t.get('historic'),[int(nd.get('ref')) for nd in w.iter('nd')]))
for nm,k,nds in ways:
  pts=[nodes[n] for n in nds if n in nodes]
  if pts: P.append((nm,k,sum(p[0] for p in pts)/len(pts),sum(p[1] for p in pts)/len(pts)))
seen={}; 
for nm,k,la,lo in P:
  if nm in seen or not any(inpoly(r,lo,la) for r in coast): continue
  seen[nm]=(k,round(la,5),round(lo,5))
print(len(seen))
out=[[nm,v[1],v[2]] for nm,v in seen.items()]
src=open('/home/claude/kinmen/src/06_osmroads.js',encoding='utf8').read(); i=src.find('const OSM_POI=')
if i>=0: src=src[:i]
open('/home/claude/kinmen/src/06_osmroads.js','w',encoding='utf8').write(src+'const OSM_POI='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print([o[0] for o in out[:60]])
