D=lambda js: K('__KINMEN__.'+js)
D('sim(0.5)')
for k in range(3):
  D(f'cam({k*2.1+0.4},0.14)'); D('sim(0.4)'); pg.screenshot(path=out+f'/ph{k}.png')
D("actGo('租腳踏車')"); D('sim(0.5)'); D('cam(0.8,0.2)'); D('sim(0.4)'); pg.screenshot(path=out+'/ph3.png')
