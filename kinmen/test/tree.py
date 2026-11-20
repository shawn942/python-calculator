D=lambda js: K('__KINMEN__.'+js)
D("actGo('租腳踏車')"); D('sim(0.5)'); D('enterNearest()'); D("key('KeyW', true)"); D('sim(6)'); D("key('KeyW', false)"); D('sim(0.5)')
pg.screenshot(path=out+'/tree1.png')
for k in range(6):
  D(f'cam({k*1.05},0.15)'); D('sim(0.4)'); pg.screenshot(path=out+f'/tree_r{k}.png')
