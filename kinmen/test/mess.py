D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("jincheng")'); D('sim(1)')
for i,v in enumerate([(-2.5,-2.4,60,-2.5,-1.7,0),(5.5,-1.5,60,6.0,-0.8,0)]):
  D('free(%s)'%','.join(map(str,v))); D('sim(0.4)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+f'/mess{i}.png')
