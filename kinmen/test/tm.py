pg.set_default_timeout(150000)
D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); x,z=-457,376
D(f'free({(x+26)/150},{-(z-30)/150},7,{x/150},{-z/150},5)'); D('sim(0.3)'); D('cullNow()'); pg.wait_for_timeout(6000); pg.screenshot(path=out+'/tm.png'); pg.wait_for_timeout(4000); pg.screenshot(path=out+'/tm.png')
print(D('texMem()'))
