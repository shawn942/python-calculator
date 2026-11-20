D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("jincheng")'); D('sim(2)'); I=D('rbInfo()'); print(I['n'],I['names'])
x,y=I['at'][I['names'].index('金城圓環')]
mx=0
for i in range(10): D('sim(3)'); mx=max(mx,D('rbInfo()')['circling'])
print('max circling',mx)
D(f'free({x+0.05},{y-0.06},22,{x},{y},0)'); D('sim(1)'); pg.wait_for_timeout(3000); pg.screenshot(path=out+'/rb0.png')
x,y=I['at'][I['names'].index('林厝圓環')]
D(f'free({x+0.05},{y-0.06},22,{x},{y},0)'); D('sim(1)'); pg.wait_for_timeout(3000); pg.screenshot(path=out+'/rb1.png')
print(D('state()')['fps'])
