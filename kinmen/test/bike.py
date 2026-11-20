D=lambda js: K('__KINMEN__.'+js)
D('give(0, 0)') if False else None
print('money', D('state()')['money'])
for q in ['租腳踏車','買青花酒瓶','買砲彈菜刀']:
  print(q, D(f"actGo('{q}')"), 'money', D('state()')['money'])
  D('sim(0.5)')
D("actGo('租腳踏車')"); D('sim(0.5)'); print('near', D('vehNear()'))
print('enter', D('enterNearest()')); D('sim(0.3)')
s0=D('state()'); D("key('KeyW', true)"); D('sim(6)'); s1=D('state()'); D("key('KeyW', false)")
print('drive', s0.get('veh'), s1.get('veh'), 'moved', round(((s1['x']-s0['x'])**2+(s1['z']-s0['z'])**2)**0.5,1), 'speed', s1.get('speed'))
pg.screenshot(path=out+'/bike.png')
