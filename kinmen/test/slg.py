D=lambda js: K('__KINMEN__.'+js)
import math
D('setTime(11)')
for i in range(2):
  x,z,ry=D(f'sloganAt({i*7})'); cx,cz=x+math.sin(ry)*11+math.cos(ry)*3,z+math.cos(ry)*11-math.sin(ry)*3
  D(f'sloganGo({i*7})'); D(f"free({cx/150},{-cz/150},2.2,{x/150},{-z/150},1.4)"); D('sim(1.2)'); pg.wait_for_timeout(300); pg.screenshot(path=out+f'/slg{i}.png')
