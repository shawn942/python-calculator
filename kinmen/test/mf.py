pg.set_default_timeout(150000)
D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); print('infill', D('infill()'), D('lt()'))
for i,(la,lo,h,dx,dz) in enumerate([(24.4338,118.3200,40,90,80),(24.4338,118.3200,6,30,24)]):
  x,z=D(f'gw({la},{lo})'); print(x,z)
  D(f'free({(x+dx)/150},{-(z+dz)/150},{h},{x/150},{-z/150},4)'); D('sim(0.2)'); D('cullNow()'); pg.wait_for_timeout(5000); pg.screenshot(path=out+f'/mf{i}.png')
