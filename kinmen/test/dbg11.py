D=lambda js: K('__KINMEN__.'+js)
P=[p for p in K('__KINMEN__.placesAll()') if '戰車' in p[0]]; print(P)
if P:
  _,x,z,r=P[0]; D('setTime(14)'); D(f"free({(x+14)/150},{-(z+14)/150},6,{x/150},{-z/150},1)"); D('sim(0.3)'); pg.wait_for_timeout(600); pg.screenshot(path=out+'/tank.png')
