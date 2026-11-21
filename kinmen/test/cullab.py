D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(11)'); D('sim(1)')
P={p[0]:p for p in K('__KINMEN__.placesAll()')}
ta=tb=0
for nm,dx,dz,h in [('金城・后浦',40,60,10),('山外',60,50,40),('沙美老街',50,40,30),('水頭聚落',60,40,25),('國立金門大學',80,80,50),('瓊林聚落',50,60,30),('古寧頭・南山',60,40,30)]:
  _,x,z,r=P[nm]; D(f"free({(x+dx)/150},{-(z+dz)/150},{h},{x/150},{-z/150},4)"); D('sim(1)'); pg.wait_for_timeout(1200)
  res=[]
  for g,m in ((520,700),(320,450)):
    D(f'cullCaps({g},{m})'); D('cullNow()'); res.append(D('sceneProf()')['calls'])
  ta+=res[0]; tb+=res[1]; print(nm,'old',res[0],'new',res[1])
print('total old',ta,'new',tb)
