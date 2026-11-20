D=lambda js: K('__KINMEN__.'+js)
H=D('herInfo()'); print(H)
for i,(nm,r) in enumerate(H):
  if r<0: continue
  print(D(f'enter({r})')); D('sim(1)'); K("__KINMEN__.key('KeyW',true)"); D('sim(0.6)'); K("__KINMEN__.key('KeyW',false)"); D('sim(0.5)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+f'/her{i}.png')
  D('leave()'); D('sim(0.5)')
D('teleport("shanhou")'); D('sim(1)'); pg.wait_for_timeout(2000); pg.screenshot(path=out+'/her_out.png')
print(K('__KINMEN__.audit()')['doorsBlocked'])
