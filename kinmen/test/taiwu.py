D=lambda js: K('__KINMEN__.'+js)
D('setTime(10)'); D('teleport("shanwai")'); D('sim(1)')
views={'tw_stone':(6.33,0.5,14, 6.43,0.64,4),'tw_far':(5.6,-1.2,40,6.43,0.64,10),'ly_road':(-9.5,-2.9,6,-8.63,-1.73,2)}
for n,v in views.items():
  D('free(%s)'%','.join(map(str,v))); D('sim(0.5)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+f'/{n}.png')
print(K('__KINMEN__.audit()'))
