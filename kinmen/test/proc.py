D=lambda js: K('__KINMEN__.'+js)
D('setTime(10)'); m0=D('state()')['money']
print(D("actGo('迎城隍')")); D('sim(0.5)'); print(D('procSt()'))
for k in range(7):
  st=D('procSt()'); cx,cz=st['chair']; D(f'tp({cx+3},{cz+3})') if False else None
  D("procFollow()")
  D('sim(4)')
print(D('procSt()'), 'money', m0, '->', D('state()')['money'])
st=D('procSt()'); cx,cz=st['chair']
D(f"free({(cx+14)/150},{-(cz+10)/150},7,{cx/150},{-cz/150},1)"); D('sim(0.5)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/proc.png')
