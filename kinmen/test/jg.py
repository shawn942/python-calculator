D=lambda js: K('__KINMEN__.'+js)
D('setTime(16)'); D('teleport("jincheng")'); D('sim(1)')
print(K('__KINMEN__.audit()')['doorsBlocked'])
# walk onto platform: free cam view
x,y=-2.5,-2.85
p=D('ll(24.42491,118.31902)'); print(p)
D(f'free({p[0]+0.12},{p[1]-0.12},25,{p[0]},{p[1]},4)'); D('sim(0.5)'); pg.wait_for_timeout(3000); pg.screenshot(path=out+'/jg.png')
