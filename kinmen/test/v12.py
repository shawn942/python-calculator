D=lambda js: K('__KINMEN__.'+js)
D('setTime(15.5)'); D('myhome()'); pg.wait_for_timeout(2300); D('sim(0.3)')
v=D('myview()'); D(f"free({v[0]/150},{-v[1]/150},9,{v[2]/150},{-v[3]/150},6)"); D('sim(0.2)'); pg.wait_for_timeout(800); pg.screenshot(path=out+'/v12_row.png')
D(f"free({(v[0]*0.5+v[2]*0.5)/150},{-(v[1]*0.5+v[3]*0.5)/150},4,{v[2]/150},{-v[3]/150},6)"); D('sim(0.2)'); pg.wait_for_timeout(800); pg.screenshot(path=out+'/v12_close.png')
