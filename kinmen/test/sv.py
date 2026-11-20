pg.set_default_timeout(150000)
D=lambda js: K('__KINMEN__.'+js)
D('setTime(15.5)'); r=D('infill()'); print('infill', r[:2]); x,z,nx,nz=r[2]
D(f'free({(x-nx*7+nz*3)/150},{-(z-nz*7-nx*3)/150},2.6,{x/150},{-z/150},0.6)'); D('sim(0.2)'); D('cullNow()'); pg.wait_for_timeout(5000); pg.screenshot(path=out+'/sv0.png')
