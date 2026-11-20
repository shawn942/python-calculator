import pickle, math, json
nodes,keep=pickle.load(open('/tmp/osmw/k.pkl','rb'))
LON0,LAT0,KM=118.345,24.456,150
src=open('/home/claude/kinmen/src/06_osmroads.js',encoding='utf8').read()
D=json.loads(src[src.index('{'):src.index('};')+1]); N=D['n']
out=[]
for wid,(nds,t) in keep.items():
  if t.get('junction')!='roundabout' and '圓環' not in (t.get('name') or ''): continue
  pts=[nodes[n] for n in nds if n in nodes]
  la=sum(p[0] for p in pts)/len(pts); lo=sum(p[1] for p in pts)/len(pts)
  x=(lo-LON0)*101.3*KM; z=-(la-LAT0)*110.8*KM
  r=max(math.hypot((p[1]-lo)*101.3e3,(p[0]-la)*110.8e3) for p in pts)
  bi=min(range(len(N)),key=lambda i:(N[i][0]-x)**2+(N[i][1]-z)**2); bd=math.dist(N[bi],(x,z))
  deg=sum(1 for e in D['e'] if bi in (e[0],e[1]))
  out.append((t.get('name'),t.get('highway'),round(r),round(x),round(z),bi,round(bd,1),deg))
sel={}
for o in sorted(out,key=lambda o:-o[2]):
  nm,hw,r,x,z,bi,bd,deg=o
  if bd>8 or deg<2 or hw=='service': continue
  if bi in sel: continue
  sel[bi]=[nm or '',N[bi][0],N[bi][1]]
print(len(sel), list(sel.values()))
open('/home/claude/kinmen/src/06_osmroads.js','a',encoding='utf8').write('const OSM_RB='+json.dumps([[v[0],round(v[1],1),round(v[2],1)] for v in sel.values()],ensure_ascii=False,separators=(',',':'))+';\n')
