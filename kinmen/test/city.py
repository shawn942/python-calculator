D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(21)'); D('sim(1)')
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; _,x,z,r=P['古寧頭戰史館']
D(f"free({x/150},{-z/150},30,{x/150},{-(z-2000)/150},20)"); D('sim(1)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/city1.png')
_,x,z,r=P['水頭聚落']
D(f"free({x/150},{-z/150},25,{(x-1500)/150},{-(z)/150},30)"); D('sim(1)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/city2.png')
