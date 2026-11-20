D=lambda js: K('__KINMEN__.'+js)
pg.set_default_timeout(150000); D('setTime(11)')
x,z,h=-457,376,26
D(f'free({(x+h*0.6)/150},{-(z+h*0.8)/150},{h},{x/150},{-z/150},1)'); D('sim(0.3)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+'/jx.png')
D('free(null)'); D('survStart(100)'); D('survSet(23.99)'); D('sim(20)'); pg.wait_for_timeout(3000); D('sim(20)')
s=D('surv()'); print('heat', s.get('heat'), round(s['hours'],2), 'stars', D('state()')['stars'], 'police', D('state()').get('police'))
D('survSet(26.2)'); D('sim(40)'); pg.wait_for_timeout(3000); D('sim(5)'); print('after heat', D('surv()').get('heat'), 'stars', D('state()')['stars'])
