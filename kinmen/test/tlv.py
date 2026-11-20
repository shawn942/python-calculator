D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("jincheng")'); D('sim(3)'); print(D('tlInfo()'))
for i,v in enumerate([(-2.32,-2.80,6,-2.39,-2.73,3),(-2.45,-2.66,5,-2.39,-2.73,3),(-2.0,-1.43,6,-1.93,-1.35,3)]):
  D('free(%s)'%','.join(map(str,v))); D('sim(0.6)'); pg.wait_for_timeout(2000); pg.screenshot(path=out+f'/tl{i}.png')
D('free(null)'); D('teleport("jincheng")'); D('sim(3)'); pg.wait_for_timeout(2500); print('fps',D('state()')['fps'])
