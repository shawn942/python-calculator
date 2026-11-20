D=lambda js: K('__KINMEN__.'+js)
D('setTime(15)'); D('dgo()'); pg.wait_for_timeout(2300); D('sim(0.5)'); pg.wait_for_timeout(600)
pg.screenshot(path=out+'/v7_mini.png', clip={'x':0,'y':480,'width':260,'height':240})
