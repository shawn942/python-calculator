D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('wx(0)')
x,z=D("stalkAt()")
for i,sn in enumerate([0,2,3]):
  D(f'season({sn})'); D(f"free({(x+14)/150},{-(z+14)/150},5,{x/150},{-z/150},1)"); D('sim(0.6)'); pg.wait_for_timeout(300); pg.screenshot(path=out+f'/sorg{i}.png')
