pg.set_default_timeout(150000)
D=lambda js: K('__KINMEN__.'+js)
D('setTime(15.5)')
x,z=D('gw(24.4550,118.3738)'); D(f'free({(x+60)/150},{-(z+50)/150},30,{x/150},{-z/150},3)'); D('sim(0.2)'); D('cullNow()'); pg.wait_for_timeout(5000); pg.screenshot(path=out+'/sw0.png')
