import pickle, json, math
B,P=pickle.load(open('/tmp/osmw/b.pkl','rb'))
LON0,LAT0,KM=118.345,24.456,150
g=lambda la,lo:((lo-LON0)*101.3*KM,-(la-LAT0)*110.8*KM)
bx=[g(b[0],b[1]) for b in B]
out=[]
for nm,typ,la,lo in sorted(P,key=lambda p:(p[0] or '',p[2])):
  if typ!='hamlet' or not nm: continue
  x,z=g(la,lo); nb=sum(1 for (u,v) in bx if (u-x)**2+(v-z)**2<40*40)
  out.append([nm,round(x,1),round(z,1),nb])
print(len(out), sum(o[3] for o in out), out[:5])
open('/home/claude/kinmen/src/06_osmroads.js','a',encoding='utf8').write('const OSM_PLACES='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
