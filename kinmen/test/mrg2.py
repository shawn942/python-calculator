D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(11)'); D('sim(1)')
import json as _j
tag=os.environ.get('TAG','a')
P={p[0]:p for p in K('__KINMEN__.placesAll()')}
V=[]
for nm,dx,dz,h in [('金城・后浦',40,60,10),('山外',60,50,40),('沙美老街',50,40,30),('水頭聚落',60,40,25),('國立金門大學',80,80,50),('瓊林聚落',50,60,30),('古寧頭・南山',60,40,30)]:
  _,x,z,r=P.get(nm) or list(P.values())[0]; V.append((nm,x+dx,z+dz,h,x,z,4))
tot=0
for i,(nm,x,z,h,tx,tz,th) in enumerate(V):
  D(f"free({x/150},{-z/150},{h},{tx/150},{-tz/150},{th})"); D('sim(1)'); pg.wait_for_timeout(1500); D('sim(1)'); pg.wait_for_timeout(700)
  s=D('sceneProf()'); print(i,nm,'calls',s['calls'],'tris',s['tris']); tot+=s['calls']
  pg.screenshot(path=out+f'/mrg_{tag}{i}.png')
print('total calls',tot)
D('setTime(21)'); D('sim(1)')
for i in (1,2):
  nm,x,z,h,tx,tz,th=V[i]; D(f"free({x/150},{-z/150},{h},{tx/150},{-tz/150},{th})"); D('sim(1)'); pg.wait_for_timeout(1500); pg.screenshot(path=out+f'/mrg_{tag}n{i}.png')
print(_j.dumps(D('mergeInfo()'),ensure_ascii=False))
