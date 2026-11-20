D=lambda js: K('__KINMEN__.'+js)
D('setTime(10)'); D("actGo('迎城隍')"); D('sim(25)')
st=D('procSt()'); cx,cz=st['chair']; print(st)
D(f"free({(cx+16)/150},{-(cz+12)/150},8,{cx/150},{-cz/150},1)"); D('sim(0.5)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/proc.png')
