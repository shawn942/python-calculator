D=lambda js: K('__KINMEN__.'+js)
D('setTime(15)'); D('teleport("nqu")'); D('sim(2)'); info=D('tlInfo()'); print(info['st'])
for i,(cx,cy,x,y) in enumerate(info['st'][:3]):
  D(f'free({cx},{cy},1.6,{x},{y},1.5)'); D('sim(0.5)'); pg.wait_for_timeout(4000); pg.screenshot(path=out+f'/st{i}.png')
