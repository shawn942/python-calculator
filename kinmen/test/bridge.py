D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("jincheng")'); D('sim(1)')
t=D('ll(24.4533,118.3018)'); u=D('ll(24.4428,118.2660)')
for i,p in enumerate([t,u]):
  D(f'free({p[0]+0.06},{p[1]+0.08},40,{p[0]},{p[1]},0)'); D('sim(0.5)'); pg.wait_for_timeout(3000); pg.screenshot(path=out+f'/br{i}.png')
