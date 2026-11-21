D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(11)')
for loc in ['nqu','jincheng']:
  D(f'teleport("{loc}")'); D('sim(3)'); D('cullNow()')
  s=D('sceneProf()'); print('==',loc,s['calls'],s['tris']); print('\n'.join(s['top']))
