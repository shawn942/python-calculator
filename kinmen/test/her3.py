D=lambda js: K('__KINMEN__.'+js)
H=D('herInfo()'); nm,r,dx,dy,cx,cy=H[0]
ex,ey=dx+(dx-cx)*1.6, dy+(dy-cy)*1.6
D('setTime(15)'); D(f'free({ex},{ey},6,{cx},{cy},4)'); D('sim(0.5)'); pg.wait_for_timeout(3500); pg.screenshot(path=out+'/yl_out.png')
D('free(null)'); print(D(f'enter({r})')); D('sim(1)'); K("__KINMEN__.key('KeyW',true)"); D('sim(0.6)'); K("__KINMEN__.key('KeyW',false)"); D('sim(0.5)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+'/yl_in.png')
