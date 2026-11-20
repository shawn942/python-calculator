D=lambda js: K('__KINMEN__.'+js)
D('setTime(10)'); print(D("actGo('砲操')"))
st=D('state()'); x,z=st['x'],st['z']
for k in range(8): D('sim(2)')
D('sim(-1)') if False else None
print('done')
