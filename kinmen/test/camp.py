import math
D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("jincheng")'); D('sim(1)')
C=D('tlInfo()')['campAt']; print(C)
for i,(x,y,r) in enumerate(C[:2]):
  fx,fz=math.sin(r),math.cos(r)
  D(f'free({x-fx*12/150+fz*4/150},{y+fz*12/150+fx*4/150},4,{x},{y},1.5)'); D('sim(0.5)'); pg.wait_for_timeout(3000); pg.screenshot(path=out+f'/camp{i}.png')
