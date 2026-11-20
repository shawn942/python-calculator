import pickle, math, json
from collections import defaultdict
nodes,keep=pickle.load(open('/tmp/osmw/k.pkl','rb'))
LON0,LAT0,KM=118.345,24.456,150
def P(nid):
  lat,lon=nodes[nid]; return ((lon-LON0)*101.3*KM, -(lat-LAT0)*110.8*KM)
CLS={'trunk':(0,5.5),'primary':(0,5.5),'primary_link':(1,4.6),'secondary':(0,5.5),'secondary_link':(1,4.6),'tertiary':(1,4.6),'tertiary_link':(1,4.6),'unclassified':(2,3.6)}
SPECIAL={'模範街','莒光路','沙美老街','珠浦北路','珠浦東路','珠浦西路','莒光路一段','莒光路二段'}
W=[]
for wid,(nds,t) in keep.items():
  h=t['highway']; nm=t.get('name') or ''
  if '金門大橋' in nm: continue
  if t.get('area')=='yes': continue
  if h in CLS: c,hw=CLS[h]
  elif nm in SPECIAL and h in('residential','pedestrian','living_street'): c,hw=2,3.6
  else: continue
  nds=[n for n in nds if n in nodes]
  if len(nds)>=2: W.append((nds,c,hw,nm,t.get('oneway') in ('yes','-1')))
# junctions
use=defaultdict(int)
for nds,*_r in W:
  for n in nds: use[n]+=1
  use[nds[0]]+=1; use[nds[-1]]+=1
# split into segments
segs=[]
for nds,c,hw,nm,ow in W:
  cur=[nds[0]]
  for n in nds[1:]:
    cur.append(n)
    if use[n]>=2 and n!=cur[0]:
      segs.append([cur,c,hw,nm,ow]); cur=[n]
  if len(cur)>1: segs.append([cur,c,hw,nm,ow])
# cluster junction nodes within R
J=set()
for s in segs: J.add(s[0][0]); J.add(s[0][-1])
J=list(J); par={j:j for j in J}
def f(a):
  while par[a]!=a: par[a]=par[par[a]]; a=par[a]
  return a
grid=defaultdict(list); R=9
for j in J:
  x,z=P(j); grid[(int(x//R),int(z//R))].append(j)
for j in J:
  x,z=P(j); gx,gz=int(x//R),int(z//R)
  for dx in(-1,0,1):
    for dz in(-1,0,1):
      for k in grid[(gx+dx,gz+dz)]:
        if k!=j:
          x2,z2=P(k)
          if math.hypot(x-x2,z-z2)<R: par[f(j)]=f(k)
groups=defaultdict(list)
for j in J: groups[f(j)].append(j)
cpos={r:(sum(P(j)[0] for j in g)/len(g), sum(P(j)[1] for j in g)/len(g)) for r,g in groups.items()}
def dp(pts,eps):
  if len(pts)<3: return pts
  a,b=pts[0],pts[-1]; dx,dz=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dz) or 1e-9
  best,bi=0,0
  for i in range(1,len(pts)-1):
    d=abs((pts[i][0]-a[0])*dz-(pts[i][1]-a[1])*dx)/L
    if d>best: best,bi=d,i
  if best<eps: return [a,b]
  return dp(pts[:bi+1],eps)[:-1]+dp(pts[bi:],eps)
E={}
for nds,c,hw,nm,ow in segs:
  a,b=f(nds[0]),f(nds[-1])
  if a==b: continue
  pts=[cpos[a]]+[P(n) for n in nds[1:-1]]+[cpos[b]]
  pts=dp(pts,1.2)
  L=sum(math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]) for i in range(1,len(pts)))
  key=(min(a,b),max(a,b))
  if key in E and E[key]['c']<=c: continue
  E[key]=dict(a=a,b=b,pts=pts,c=c,hw=hw,nm=nm,L=L,ow=ow)
edges=list(E.values())
def adj():
  A=defaultdict(list)
  for i,e in enumerate(edges): A[e['a']].append(i); A[e['b']].append(i)
  return A
# prune minor parallels: sample minor edge, if most samples near a better edge -> drop
def samples(e,step=6):
  out=[]; pts=e['pts']
  for i in range(1,len(pts)):
    (x0,z0),(x1,z1)=pts[i-1],pts[i]; L=math.hypot(x1-x0,z1-z0); n=max(1,int(L/step))
    for k in range(n): t=k/n; out.append((x0+(x1-x0)*t,z0+(z1-z0)*t))
  return out
sg=defaultdict(list); G2=12
for i,e in enumerate(edges):
  for (x,z) in samples(e,4): sg[(int(x//G2),int(z//G2))].append((i,x,z))
def near_other(i,x,z,r,maxc):
  ea=edges[i]
  gx,gz=int(x//G2),int(z//G2)
  for dx in(-1,0,1):
    for dz in(-1,0,1):
      for (j,x2,z2) in sg[(gx+dx,gz+dz)]:
        if j!=i and edges[j]['c']<=maxc and not edges[j].get('dead') and edges[j]['a'] not in (ea['a'],ea['b']) and edges[j]['b'] not in (ea['a'],ea['b']) and (x-x2)**2+(z-z2)**2<r*r: return True
  return False
order=sorted(range(len(edges)),key=lambda i:-edges[i]['c'])
drop=0
for i in order:
  e=edges[i]
  if e['c']<2 and not e['ow']: continue
  ss=samples(e); a0=edges[i]['pts'][0]; b0=edges[i]['pts'][-1]
  inner=[p for p in ss if math.hypot(p[0]-a0[0],p[1]-a0[1])>14 and math.hypot(p[0]-b0[0],p[1]-b0[1])>14]
  if len(inner)<2: continue
  cnt=sum(near_other(i,x,z,e['hw']+5.5+3, e['c']) for (x,z) in inner)
  if cnt/len(inner)>0.5: e['dead']=1; drop+=1
edges=[e for e in edges if not e.get('dead')]
# remove short dead-end minor stubs iteratively
for it in range(6):
  A=adj(); rm=set()
  for i,e in enumerate(edges):
    deg=(len(A[e['a']]),len(A[e['b']]))
    if min(deg)==1 and e['L']<(70 if e['c']==2 else 25): rm.add(i)
  if not rm: break
  edges=[e for i,e in enumerate(edges) if i not in rm]
# --- 清理：拿掉多餘的小環路與短死巷，讓路網乾淨 ---
import heapq as _hq
def alt_path(a,b,skip,limit):
  A=adj(); dist={a:0}; pq=[(0,a)]
  while pq:
    d,u=_hq.heappop(pq)
    if u==b: return d
    if d>limit: return None
    if d>dist.get(u,1e18): continue
    for i in A[u]:
      if i==skip: continue
      e=edges[i]; v=e['b'] if e['a']==u else e['a']; nd=d+e['L']
      if nd<dist.get(v,1e18): dist[v]=nd; _hq.heappush(pq,(nd,v))
  return None
for rnd in range(3):
  rm=set(); order2=sorted([i for i,e in enumerate(edges) if e['c']>=1],key=lambda i:edges[i]['L'])
  for i in order2:
    e=edges[i]
    if e['c']==1 and e['L']>60: continue
    d=alt_path(e['a'],e['b'],i,e['L']*1.8+50)
    if d is not None: rm.add(i); edges[i]=dict(e,L=1e9)  # mark so later checks skip it
  edges=[e for i,e in enumerate(edges) if i not in rm]
  print('round',rnd,'removed loops',len(rm))
  if rnd==0:
    def tort(e): p=e['pts']; st=math.dist(p[0],p[-1]) or 1; return e['L']/st
    before=len(edges); edges=[e for e in edges if not (e['c']==2 and (tort(e)>1.45 or e['L']<70))]; print('tortuous minor removed',before-len(edges))
  for it in range(10):
    A=adj(); rm=set()
    for i,e in enumerate(edges):
      deg=(len(A[e['a']]),len(A[e['b']]))
      if min(deg)==1 and e['L']<(220 if e['c']==2 else 70 if e['c']==1 else 30): rm.add(i)
    if not rm: break
    edges=[e for i,e in enumerate(edges) if i not in rm]
# components
A=adj(); seen={}; comp=0
for n in list(A):
  if n in seen: continue
  st=[n]; seen[n]=comp
  while st:
    u=st.pop()
    for i in A[u]:
      for v in (edges[i]['a'],edges[i]['b']):
        if v not in seen: seen[v]=comp; st.append(v)
  comp+=1
cl=defaultdict(float)
for e in edges: cl[seen[e['a']]]+=e['L']
edges=[e for e in edges if cl[seen[e['a']]]>2500]
used=sorted({e['a'] for e in edges}|{e['b'] for e in edges})
idx={n:i for i,n in enumerate(used)}
names=sorted({e['nm'] for e in edges}); ni={n:i for i,n in enumerate(names)}
out={'n':[[round(cpos[n][0],1),round(cpos[n][1],1)] for n in used],
     'e':[[idx[e['a']],idx[e['b']],e['c'],ni[e['nm']],[v for p in e['pts'][1:-1] for v in (round(p[0],1),round(p[1],1))]] for e in edges],
     'names':names}
tot=sum(e['L'] for e in edges)/150
print('nodes',len(used),'edges',len(edges),'km',round(tot,1),'dropped parallel',drop, 'by class',[round(sum(e['L'] for e in edges if e['c']==c)/150,1) for c in range(3)])
js='/* OpenStreetMap 道路（© OpenStreetMap contributors, ODbL）：由 tools/osm 產生，座標為遊戲單位 */\nconst OSM_ROADS='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n'
open('/home/claude/kinmen/src/06_osmroads.js','w',encoding='utf8').write(js)
print(len(js))
