D=lambda js: K('__KINMEN__.'+js)
pg.set_default_timeout(150000); D('setTime(10.5)')
a=K('__KINMEN__.audit()'); print('parkedTree', a.get('parkedTree'), 'parkedBlocked', a.get('parkedBlocked'))
d=K('__KINMEN__.spots ? __KINMEN__.spots() : null'); print('spots', str(d)[:200])
x,z=-250,78
D(f'free({(x-30)/150},{-(z-8)/150},5,{x/150},{-z/150},1)'); D('sim(0.3)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+'/fc0.png')
