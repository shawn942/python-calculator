D=lambda js: K('__KINMEN__.'+js)
L=K('window.__pbl'); D('setTime(11)')
for i in range(2):
  x,z=L[i*9]; D(f"free({(x+9)/150},{-(z+7)/150},4,{x/150},{-z/150},1)"); D('sim(1)'); pg.wait_for_timeout(300); pg.screenshot(path=out+f'/pb{i}.png')
