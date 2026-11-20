pg.set_default_timeout(150000)
D=lambda js: K('__KINMEN__.'+js)
D('setTime(15.5)'); r=D('infill()'); print('infill', r[:2], r[3]); x,z,nx,nz=r[2]
D(f'free({(x-nx*5+nz*22)/150},{-(z-nz*5-nx*22)/150},3.2,{(x-nz*10)/150},{-(z+nx*10)/150},3.5)'); D('sim(0.2)'); D('cullNow()'); pg.wait_for_timeout(5000); pg.screenshot(path=out+'/sv0.png')
