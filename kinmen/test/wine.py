D=lambda js: K('__KINMEN__.'+js)
D('setTime(10)'); print(D("actGo('品酒')")); D('sim(3)'); pg.screenshot(path=out+'/wine.png')
D("actGo('租腳踏車')") if False else None
print('stars0', K('__KINMEN__.state()').get('stars'))
print(D('enterNearest()')); D("key('KeyW', true)"); D('sim(3)'); D("key('KeyW', false)"); print('stars1', D('state()').get('stars'), D('state()').get('wanted'))
m0=D('state()')['money']; print(D("actGo('高粱禮盒')"), m0, '->', D('state()')['money'])
