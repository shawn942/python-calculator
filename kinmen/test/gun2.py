D=lambda js: K('__KINMEN__.'+js)
D('setTime(10)'); print(D("actGo('砲操')")); st=D('state()'); x,z=st['x'],st['z']
D(f"free({(x+6)/150},{-(z+6)/150},5,{(x-6)/150},{-(z-6)/150},1)"); D('sim(10)'); pg.wait_for_timeout(300); pg.screenshot(path=out+'/gun1.png'); D('sim(5.2)'); pg.wait_for_timeout(200); pg.screenshot(path=out+'/gun2.png')
