D=lambda js: K('__KINMEN__.'+js)
D('setTime(17.5)'); cx,cz,r=D('otterC()'); print(cx,cz,r)
D(f"free({(cx+r*1.1)/150},{-(cz+r*1.1)/150},7,{cx/150},{-cz/150},0)"); D('sim(2)'); pg.wait_for_timeout(1500); pg.screenshot(path=out+'/otter.png')
