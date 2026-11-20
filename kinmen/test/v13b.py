D=lambda js: K('__KINMEN__.'+js)
D('setCh(9)'); D('sim(0.3)'); print('go', D('storyGo()')); D('sim(0.3)'); print(D('st()')); D('skipTalk()'); D('sim(0.5)'); print('after talk', D('st()'), D('sideSt()'))
for k in range(10):
  s2=D('sideSt()'); print(' side', s2, D('st()')['wait'])
  if not s2: break
  D('sideTp()'); D('sim(0.6)'); D('sideKill()'); D('sim(0.6)')
D('sim(1)'); print('end', D('st()'))
