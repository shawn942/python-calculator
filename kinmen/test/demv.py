import os
D=lambda js: K('__KINMEN__.'+js)
tag=os.environ.get('TAG','dem')
D('setTime(10)'); D('teleport("shanwai")'); D('sim(1)')
views={'taiwu':(5.6,-2.8,70, 6.78,0.85,30),'over':(0.5,-11,1100, 0.5,-0.5,0),'lieyu':(-7.5,-7,260, -10.2,-2.6,0),'east':(1.5,-1.0,30, 6.8,0.85,40)}
for n,v in views.items():
  D('free(%s)'%','.join(map(str,v))); D('sim(0.5)'); pg.wait_for_timeout(2500)
  pg.screenshot(path=out+f'/{tag}_{n}.png')
print(K('__KINMEN__.state()'))
