D=lambda js: K('__KINMEN__.'+js)
L=D('brLen()'); print('road len', L, 'units; at 11u/s', round(L/11), 's; at 9.5 avg', round(L/9.5))
D("actGo('租腳踏車')"); D('sim(0.5)'); D('enterNearest()'); D("key('KeyW', true)"); D('sim(12)'); print('speed', D('state()').get('speed')); D("key('KeyW', false)")
