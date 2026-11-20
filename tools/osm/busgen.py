import pickle, json, math, heapq
from collections import defaultdict
nodes,ways,rels,stops=pickle.load(open('/tmp/osmw/bus.pkl','rb'))
src=open('/home/claude/kinmen/src/06_osmroads.js',encoding='utf8').read()
D=json.loads(src[src.index('{'):src.index('};')+1])
LON0,LAT0,KM=118.345,24.456,150
P=lambda la,lo:((lo-LON0)*101.3*KM,-(la-LAT0)*110.8*KM)
N=D['n']; adj=defaultdict(list)
def elen(e):
  pts=[N[e[0]]]+[(e[4][i],e[4][i+1]) for i in range(0,len(e[4]),2)]+[N[e[1]]]
  return sum(math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]) for i in range(1,len(pts)))
for e in D['e']:
  L=elen(e); adj[e[0]].append((e[1],L)); adj[e[1]].append((e[0],L))
T=P(24.4533,118.3018); U=P(24.4428,118.2660)
tn=min((i for i in range(len(N)) if N[i][0]>T[0]-5),key=lambda i:(N[i][0]-T[0])**2+(N[i][1]-T[1])**2)
un=min((i for i in range(len(N)) if N[i][0]<U[0]+5),key=lambda i:(N[i][0]-U[0])**2+(N[i][1]-U[1])**2)
BL=math.dist(N[tn],N[un]); adj[tn].append((un,BL)); adj[un].append((tn,BL)); print('bridge',tn,un,round(BL))
grid=defaultdict(list)
for i,(x,z) in enumerate(N): grid[(int(x//20),int(z//20))].append(i)
def nearN(x,z,R):
  best,bd=None,R*R
  for dx in(-1,0,1):
    for dz in(-1,0,1):
      for i in grid[(int(x//20)+dx,int(z//20)+dz)]:
        d=(N[i][0]-x)**2+(N[i][1]-z)**2
        if d<bd: bd,best=d,i
  return best
def dij(a,b):
  dist={a:0}; prev={}; pq=[(0,a)]
  while pq:
    d,u=heapq.heappop(pq)
    if u==b: break
    if d>dist.get(u,1e18): continue
    for v,L in adj[u]:
      nd=d+L
      if nd<dist.get(v,1e18): dist[v]=nd; prev[v]=u; heapq.heappush(pq,(nd,v))
  if b not in dist: return None
  p=[b]
  while p[-1]!=a: p.append(prev[p[-1]])
  return p[::-1]
ALLST=[(r,n) for r,n in stops.items() if n]; SP={r:P(*nodes[r]) for r,n in ALLST}
want=['2','3','12','15','15A','15B','35','36','37','38']
chosen={}
for rid,(t,mem) in rels.items():
  ref=t.get('ref') or ('15A' if '15A' in (t.get('name') or '') else None)
  if ref in want and ref not in chosen: chosen[ref]=(t,mem)
out=[]
for ref,(t,mem) in chosen.items():
  seq=[]
  for typ,r,role in mem:
    if typ!='way' or r not in ways: continue
    pts=[nodes[n] for n in ways[r] if n in nodes]
    if not pts: continue
    if seq:
      e=seq[-1]
      if math.dist(e,pts[-1])<math.dist(e,pts[0]): pts=pts[::-1]
    seq+=pts
  if len(seq)<2: continue
  g=[P(*p) for p in seq]
  # sample
  smp=[]
  for i in range(1,len(g)):
    (x0,z0),(x1,z1)=g[i-1],g[i]; L=math.hypot(x1-x0,z1-z0); n=max(1,int(L/6))
    for k in range(n): smp.append((x0+(x1-x0)*k/n,z0+(z1-z0)*k/n))
  smp.append(g[-1])
  vis=[]
  for (x,z) in smp:
    n=nearN(x,z,11)
    if n is not None and (not vis or vis[-1]!=n): vis.append(n)
  path=[]
  for n in vis:
    if not path: path=[n]; continue
    if n==path[-1]: continue
    sp=dij(path[-1],n)
    if sp is None or len(sp)>40: continue
    path+=sp[1:]
  # remove immediate backtracks a-b-a
  i=1
  while i<len(path)-1:
    if path[i-1]==path[i+1]: del path[i:i+2]; i=max(1,i-1)
    else: i+=1
  if len(path)<4: continue
  # stops
  st=[]; seen=set(); used=set()
  for r,nm0 in ALLST:
    if True:
      nm=nm0 or ''
      x,z=SP[r]
      if min((N[p][0]-x)**2+(N[p][1]-z)**2 for p in path[::1])>60**2: continue
      # distance to path polyline
      dmin=1e9
      for i in range(1,len(path)):
        ax,az=N[path[i-1]]; bx,bz=N[path[i]]; ex,ez=bx-ax,bz-az; L2=ex*ex+ez*ez or 1; tt=max(0,min(1,((x-ax)*ex+(z-az)*ez)/L2)); d=math.hypot(x-ax-ex*tt,z-az-ez*tt)
        if d<dmin: dmin=d
      if dmin>10 or nm in used: continue
      used.add(nm)
      bi=min(range(len(path)),key=lambda i:(N[path[i]][0]-x)**2+(N[path[i]][1]-z)**2)
      if (nm,bi) in seen: continue
      seen.add((nm,bi)); st.append([bi,nm,round(x,1),round(z,1)])
  st.sort()
  out.append({'ref':ref,'name':t.get('name'),'path':path,'stops':st})
  print(ref,t.get('name'),'path',len(path),'stops',len(st),'km',round(sum(math.dist(N[path[i]],N[path[i-1]]) for i in range(1,len(path)))/150,1))
open('/home/claude/kinmen/src/06_osmroads.js','a',encoding='utf8').write('const OSM_BUS='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
