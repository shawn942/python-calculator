D=lambda js: K('__KINMEN__.'+js)
D('setTime(10)'); D('teleport("jincheng")'); D('sim(2)'); print(D('busInfo()'))
for i in range(6):
  D('sim(10)'); print(D('busInfo()')['live'])
pg.wait_for_timeout(1500); print('fps',D('state()')['fps'])
