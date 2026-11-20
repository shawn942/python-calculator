pg.set_default_timeout(150000)
D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); print('skirt quads', D('skirts()'))
for i,(x,z,h,dx,dz) in enumerate([(1396,-809,22,40,40),(1061,-120,18,-36,30)]):
  D(f'free({(x+dx)/150},{-(z+dz)/150},{h},{x/150},{-z/150},6)'); D('sim(0.2)'); D('cullNow()'); pg.wait_for_timeout(5000); pg.screenshot(path=out+f'/sk{i}.png')
