D=lambda js: K('__KINMEN__.'+js)
pg.set_default_timeout(150000)
D('sim(0.3)'); print('enter', D('enterNearest()')); D('sim(0.5)'); print('veh0', D('vehInfo()'))
D('vehFlip()'); D('key("KeyW",true)')
for i in range(5): D('sim(1)'); D('vehFlip()') if i==0 else None
D('key("KeyW",false)'); print('veh after hold', D('vehInfo()'))
D('rescue()'); D('sim(0.3)'); print('after manual rescue', D('vehInfo()'))
