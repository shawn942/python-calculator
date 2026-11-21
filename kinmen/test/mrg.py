D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(11)'); D('sim(1)')
import json as _j
tag=os.environ.get('TAG','a')
V=[(-380,385,6,-470,330,4),(-300,300,60,-420,420,0),(-440,350,4,-380,420,6),(-420,330,140,-380,400,0)]
for i,(x,z,h,tx,tz,th) in enumerate(V):
  D(f"free({x/150},{-z/150},{h},{tx/150},{-tz/150},{th})"); D('sim(1)'); pg.wait_for_timeout(1500); D('sim(1)'); pg.wait_for_timeout(700)
  s=D('sceneProf()'); print(i,'calls',s['calls'],'tris',s['tris'],'info',s['info']); 
  if i==0: print(_j.dumps(s['top'],ensure_ascii=False)); print(_j.dumps(s['topT'],ensure_ascii=False))
  pg.screenshot(path=out+f'/mrg_{tag}{i}.png')
D('setTime(21)'); D('sim(1)')
for i in (0,1):
  x,z,h,tx,tz,th=V[i]; D(f"free({x/150},{-z/150},{h},{tx/150},{-tz/150},{th})"); D('sim(1)'); pg.wait_for_timeout(1500); pg.screenshot(path=out+f'/mrg_{tag}n{i}.png')
print(_j.dumps(D('mergeInfo()'),ensure_ascii=False))
