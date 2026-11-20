D=lambda js: K('__KINMEN__.'+js)
m0=D('state()')['money']
print(D("actGo('自行車賽')")); D('sim(1)'); bb=D('brC()'); print(bb, D('state()').get('veh'))
import math
tot=0; px,pz=None,None
for x,z,n in bb['cps']:
  if px is not None: tot+=math.hypot(x-px,z-pz)
  px,pz=x,z
print('route straight-line', round(tot), 'units ~', round(tot/11), 's at max')
D('sim(3.5)')
for x,z,n in bb['cps']:
  D(f'warpVeh({x},{z})'); D('sim(0.6)'); print(n, D('brC()')['i'], K("document.getElementById('timer').textContent"))
print('money', m0, '->', D('state()')['money'], D('brC()')['on'])
