D=lambda js: K('__KINMEN__.'+js)
D("actGo('租腳踏車')"); D('sim(0.5)'); D('enterNearest()')
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; _,x,z,r=P['模範街']
D(f'warpVeh({x},{z})'); D('sim(0.3)')
s0=D('state()'); D("key('KeyW', true)")
for k in range(6): D('sim(2)'); s=D('state()'); print(k, s.get('speed'), round(((s['x']-s0['x'])**2+(s['z']-s0['z'])**2)**0.5,1))
