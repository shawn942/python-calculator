D=lambda js: K('__KINMEN__.'+js)
pg.set_default_timeout(120000)
D('sim(0.5)'); D('cam(0.4,0.14)'); D('sim(0.4)'); pg.screenshot(path=out+'/ph0.png')
D("actGo('租腳踏車')"); D('sim(0.5)'); D('cam(0.8,0.2)'); D('sim(0.4)'); pg.screenshot(path=out+'/ph1.png')
