D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(10)'); D('sim(0.5)'); pg.screenshot(path=out+'/p_start.png')
D("key('KeyW', true)"); D('sim(0.6)'); pg.wait_for_timeout(200); pg.screenshot(path=out+'/p_walk.png'); D("key('KeyW', false)")
print(D('tourGo(1)')); D('sim(1.5)'); pg.wait_for_timeout(300); pg.screenshot(path=out+'/p_tour.png')
