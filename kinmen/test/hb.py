D=lambda js: K('__KINMEN__.'+js)
B=D('boats()'); print(len(B)); D('setTime(10)'); D('wx(0)')
x,z=B[0]; D(f"free({(x+18)/150},{-(z+14)/150},7,{x/150},{-z/150},0)"); D('sim(1)'); pg.wait_for_timeout(300); pg.screenshot(path=out+'/hb.png')
