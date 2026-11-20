D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("jincheng")'); D('sim(1)')
for i,v in enumerate([(1.0,-3.5,300,3.0,0.5,0),(-1.5,1.0,250,0,3,0),(-9.5,-6,250,-10.3,-2.6,0)]):
  D('free(%s)'%','.join(map(str,v))); D('sim(0.5)'); pg.wait_for_timeout(3000); pg.screenshot(path=out+f'/lu{i}.png')
print(D('state()')['fps'])
