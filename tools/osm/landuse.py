import glob, math, json, re
import xml.etree.ElementTree as ET
from collections import Counter
nodes={}; ways={}; W=[]; R=[]
for f in glob.glob('/tmp/osm/t_*.osm'):
  root=ET.parse(f).getroot()
  for n in root.iter('node'): nodes[int(n.get('id'))]=(float(n.get('lat')),float(n.get('lon')))
  for w in root.iter('way'):
    nds=[int(nd.get('ref')) for nd in w.iter('nd')]; ways[int(w.get('id'))]=nds
    t={tg.get('k'):tg.get('v') for tg in w.iter('tag')}
    k=t.get('landuse') or t.get('natural') or t.get('leisure')
    if k: W.append((int(w.get('id')),nds,k))
LON0,LAT0,KM=118.345,24.456,150
g=lambda la,lo:((lo-LON0)*101.3*KM,-(la-LAT0)*110.8*KM)
C=Counter(); seen=set()
for wid,nds,k in W:
  if wid in seen or nds[0]!=nds[-1]: continue
  seen.add(wid)
  P=[g(*nodes[n]) for n in nds if n in nodes]
  if len(P)<4: continue
  A=abs(sum(P[i][0]*P[i-1][1]-P[i-1][0]*P[i][1] for i in range(len(P))))/2
  C[k]+=A
for k,v in C.most_common(25): print(k, round(v))

import numpy as np
from matplotlib.path import Path
TX0,TZ0,CELL,NX,NZ=-2180,-1450,8,546,349
LU=np.zeros((NZ,NX),dtype=np.uint8)
CLS={'farmland':1,'orchard':1,'meadow':4,'wood':2,'forest':2,'scrub':2,'residential':3,'commercial':3,'industrial':3,'retail':3,'grass':4,'park':4,'cemetery':4,'pitch':4,'recreation_ground':4,'wetland':5,'military':6,'beach':7,'sand':7}
PRI={1:1,4:2,2:3,5:4,3:5,6:6,7:7}
XX,ZZ=np.meshgrid(TX0+np.arange(NX)*CELL, TZ0+np.arange(NZ)*CELL)
cnt=Counter(); seen=set()
items=[]
for wid,nds,k in W:
  if k not in CLS or wid in seen or nds[0]!=nds[-1]: continue
  seen.add(wid); P=[g(*nodes[n]) for n in nds if n in nodes]
  if len(P)<4: continue
  items.append((PRI[CLS[k]],CLS[k],wid,P))
items.sort()
for pri,c,wid,P in items:
  xs=[p[0] for p in P]; zs=[p[1] for p in P]
  i0=max(0,int((min(xs)-TX0)//CELL)); i1=min(NX-1,int((max(xs)-TX0)//CELL)+1); j0=max(0,int((min(zs)-TZ0)//CELL)); j1=min(NZ-1,int((max(zs)-TZ0)//CELL)+1)
  if i1<i0 or j1<j0: continue
  sub=np.stack([XX[j0:j1+1,i0:i1+1].ravel(),ZZ[j0:j1+1,i0:i1+1].ravel()],1)
  m=Path(P).contains_points(sub).reshape(j1-j0+1,i1-i0+1)
  if not m.any(): continue
  v=c|((wid*2654435761>>7)&7)<<3
  if c==7: m=m&True
  LU[j0:j1+1,i0:i1+1][m]=v; cnt[c]+=int(m.sum())
print(cnt)
LU.tofile('/home/claude/kinmen/dist/lu.bin')
