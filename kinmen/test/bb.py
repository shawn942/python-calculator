D=lambda js: K('__KINMEN__.'+js)
for d in [[4,4,4,4,1,1],[2,2,2,2,2,2],[3,3,3,3,3,1],[4,4,4,4,2,5],[1,2,3,4,5,6],[4,4,4,1,2,3],[5,5,5,5,1,2],[4,4,1,2,3,5],[4,1,2,3,5,6],[1,1,2,3,5,6]]:
  print(d, D(f'bbRank({d})'))
m0=D('state()')['money']; print(D("actGo('博餅')")); D('sim(0.3)'); print(m0,'->',D('state()')['money']); pg.screenshot(path=out+'/bb.png')
