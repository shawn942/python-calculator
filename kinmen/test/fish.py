D=lambda js: K('__KINMEN__.'+js)
m0=D('state()')['money']
for k in range(4):
  print(D("actGo('釣魚')"), D('fishBite()')); D('sim(0.2)'); print(D("actGo('收竿')"), D('state()')['money'], flush=True); D('sim(0.2)')
print(m0, '->', D('state()')['money'])
print(D("actGo('釣魚')")); D('sim(0.5)'); st=D('state()'); x,z=st['x'],st['z']
D(f"free({(x-9)/150},{-(z-9)/150},3.5,{(x+4)/150},{-(z+4)/150},0.8)"); D('sim(0.4)'); pg.screenshot(path=out+'/fish.png')
