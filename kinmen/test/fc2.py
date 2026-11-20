import math
D=lambda js: K('__KINMEN__.'+js)
pg.set_default_timeout(150000); D('setTime(10.5)')
d=D('dorm()'); x,z,r=d['x'],d['z'],d['rot']; print(d)
fx,fz=math.sin(r),math.cos(r)
D(f'free({(x+fx*40)/150},{-(z+fz*40)/150},14,{x/150},{-z/150},12)'); D('sim(0.3)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+'/fc1.png')
