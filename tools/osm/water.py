import glob, math, json, re
import xml.etree.ElementTree as ET
nodes={}; W=[]
for f in glob.glob('/tmp/osm/t_*.osm'):
  root=ET.parse(f).getroot()
  for n in root.iter('node'): nodes[int(n.get('id'))]=(float(n.get('lat')),float(n.get('lon')))
  for w in root.iter('way'):
    t={tg.get('k'):tg.get('v') for tg in w.iter('tag')}
    if t.get('natural')=='water' or t.get('landuse') in ('reservoir','basin') or t.get('water'):
      W.append((int(w.get('id')),[int(nd.get('ref')) for nd in w.iter('nd')],t))
seen=set(); out=[]
src=open('/home/claude/kinmen/src/05_data.js',encoding='utf8').read()
coast=json.loads(re.search(r'const GEO_COAST=(\[.*?\]\]\]);',src).group(1))
def inpoly(poly,x,y):
  ins=False; j=len(poly)-1
  for i in range(len(poly)):
    xi,yi=poly[i]; xj,yj=poly[j]
    if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi: ins=not ins
    j=i
  return ins
for wid,nds,t in W:
  if wid in seen: continue
  seen.add(wid)
  pts=[nodes[n] for n in nds if n in nodes]
  if len(pts)<4 or nds[0]!=nds[-1]: continue
  A=0
  for i in range(len(pts)):
    x1,y1=pts[i][1]*101300,pts[i][0]*110800; x2,y2=pts[i-1][1]*101300,pts[i-1][0]*110800; A+=x1*y2-x2*y1
  A=abs(A)/2
  la=sum(p[0] for p in pts)/len(pts); lo=sum(p[1] for p in pts)/len(pts)
  if not any(inpoly(r,lo,la) for r in coast): continue
  out.append((round(A),t.get('name'),round(la,5),round(lo,5),len(pts)))
out.sort(reverse=True)
print(len(out)); 
for o in out[:30]: print(o)
# relations
ways={}; rels=[]
for f in glob.glob('/tmp/osm/t_*.osm'):
  root=ET.parse(f).getroot()
  for w in root.iter('way'): ways[int(w.get('id'))]=[int(nd.get('ref')) for nd in w.iter('nd')]
  for r in root.iter('relation'):
    t={tg.get('k'):tg.get('v') for tg in r.iter('tag')}
    if t.get('natural')=='water' or t.get('water') or t.get('landuse')=='reservoir':
      rels.append((int(r.get('id')),t,[(int(m.get('ref')),m.get('role')) for m in r.iter('member') if m.get('type')=='way']))
print('rels',len({r[0] for r in rels}))
done=set()
for rid,t,mem in rels:
  if rid in done: continue
  done.add(rid)
  print(rid,t.get('name'),len(mem),sum(1 for m in mem if m[0] in ways))

LON0,LAT0,KM=118.345,24.456,150
g=lambda la,lo:((lo-LON0)*101.3*KM,-(la-LAT0)*110.8*KM)
def dp(pts,eps):
  if len(pts)<3: return pts
  a,b=pts[0],pts[-1]; dx,dz=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dz) or 1e-9
  best,bi=0,0
  for i in range(1,len(pts)-1):
    d=abs((pts[i][0]-a[0])*dz-(pts[i][1]-a[1])*dx)/L
    if d>best: best,bi=d,i
  if best<eps: return [a,b]
  return dp(pts[:bi+1],eps)[:-1]+dp(pts[bi:],eps)
def area(P):
  return abs(sum(P[i][0]*P[i-1][1]-P[i-1][0]*P[i][1] for i in range(len(P))))/2
def join(ws):
  ws=[list(w) for w in ws if len(w)>1]; rings=[]
  while ws:
    cur=ws.pop(0)
    changed=True
    while cur[0]!=cur[-1] and changed:
      changed=False
      for i,w in enumerate(ws):
        if w[0]==cur[-1]: cur+=w[1:]; ws.pop(i); changed=True; break
        if w[-1]==cur[-1]: cur+=w[::-1][1:]; ws.pop(i); changed=True; break
    if cur[0]==cur[-1]: rings.append(cur)
  return rings
L=[]
seenr=set()
for rid,t,mem in rels:
  if rid in seenr: continue
  seenr.add(rid)
  outer=[ways[m] for m,role in mem if m in ways and role in ('outer','')]
  for ring in join(outer):
    P=[g(*nodes[n]) for n in ring if n in nodes]
    if len(P)>3: L.append((t.get('name') or '',P))
for wid,nds,t in W:
  pts=[nodes[n] for n in nds if n in nodes]
  if len(pts)<4 or nds[0]!=nds[-1]: continue
  L.append((t.get('name') or '',[g(*p) for p in pts]))
print('L',len(L), sorted((round(area(P)),nm) for nm,P in L)[-5:])
out=[]; used=set()
for nm,P in L:
  A=area(P)
  if A<300 or '碼頭' in nm or '港' in nm: continue   # game units^2 (~13000 m2)
  cx=sum(p[0] for p in P)/len(P); cz=sum(p[1] for p in P)/len(P)
  la=LAT0-cz/KM/110.8; lo=LON0+cx/KM/101.3
  if nm=='慈湖': print('DBG',la,lo,any(inpoly(r,lo,la) for r in coast))
  if not any(inpoly(r,lo,la) for r in coast): continue
  k=(round(cx),round(cz))
  if k in used: continue
  used.add(k)
  if P[0]==P[-1]: P=P[:-1]
  m=len(P)//2; Q=dp(P[:m+1],1.2)[:-1]+dp(P[m:]+[P[0]],1.2)[:-1]
  if nm=='慈湖': print('Q',len(P),len(Q))
  if len(Q)<4: continue
  out.append([nm,round(A),[v for p in Q for v in (round(p[0],1),round(p[1],1))]])
out.sort(key=lambda o:-o[1])
print('lakes',len(out),[(o[0],o[1]) for o in out[:40]])
src=open('/home/claude/kinmen/src/06_osmroads.js',encoding='utf8').read()
i=src.find('const OSM_LAKES=')
if i>=0: src=src[:i]
open('/home/claude/kinmen/src/06_osmroads.js','w',encoding='utf8').write(src+'const OSM_LAKES='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
