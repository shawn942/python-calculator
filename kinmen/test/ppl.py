D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(10)'); D("actGo('迎城隍')"); D('sim(25)'); st=D('procSt()'); cx,cz=st['chair']
D(f"free({(cx+12)/150},{-(cz+9)/150},5,{cx/150},{-cz/150},1)"); D('sim(0.5)'); pg.wait_for_timeout(300); pg.screenshot(path=out+'/ppl0.png')
D('free(null)'); D("actGo('砲操')"); st=D('state()'); x,z=st['x'],st['z']; D(f"free({(x+6)/150},{-(z+6)/150},4,{(x-6)/150},{-(z-6)/150},1)"); D('sim(11)'); pg.wait_for_timeout(300); pg.screenshot(path=out+'/ppl1.png')
