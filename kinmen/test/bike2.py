D=lambda js: K('__KINMEN__.'+js)
D("actGo('租腳踏車')"); D('sim(0.5)'); D('enterNearest()'); D("teleport('金城')") if False else None
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; _,x,z,r=P['模範街']
D(f'warpVeh({x},{z})'); D('sim(0.5)'); D("key('KeyW', true)"); D('sim(2)'); D("key('KeyW', false)"); D('sim(0.4)')
print(D('state()')); pg.screenshot(path=out+'/bike2.png')
