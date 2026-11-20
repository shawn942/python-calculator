D=lambda js: K('__KINMEN__.'+js)
S=lambda: K('__KINMEN__.state()')
print('sp', D('spInfo()'), 'player', S()['x'], S()['z'])
D('enterNearest()'); D('sim(1)'); print('in', S()['inVehicle'], D('spInfo()')); D("key('KeyW',true)"); D('sim(2)'); print(' after', D('spInfo()'), S()['speed']); D("key('KeyW',false)")
