D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; nm=[k for k in P if '大橋' in k]; print(nm)
_,x,z,r=P[nm[0]]; D('wx(0)'); D('setTime(20.5)'); D(f"free({(x+120)/150},{-(z-60)/150},25,{x/150},{-z/150},8)"); D('sim(1)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/bridge.png')
