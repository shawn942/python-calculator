D=lambda js: K('__KINMEN__.'+js)
D('setTime(9)'); w=D('wildC()'); print(w)
x,z,fx,fz,y=w['bee']; cx,cz=x+fx*13,z+fz*13
D(f"free({cx/150},{-cz/150},{(y+3)/150*0+3.5},{x/150},{-z/150},{2})"); D('sim(3)'); pg.wait_for_timeout(500); pg.screenshot(path=out+'/dex_bee.png')
hx,hz=w['hoo']; D(f"free({(hx+4)/150},{-(hz+4)/150},1.4,{hx/150},{-hz/150},0.2)"); D('sim(2)'); pg.wait_for_timeout(500); pg.screenshot(path=out+'/dex_hoo.png')
