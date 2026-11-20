D=lambda js: K('__KINMEN__.'+js)
for jid in ['poach','oyster','temple']:
  m0=D('state()')['money']; D(f"side('{jid}')"); D('sim(0.5)')
  for it in range(12):
    st=D('sideSt()')
    if not st: break
    if st['t'] in ('fight','brawl','chase'): D('sideTp()'); D('sim(1.5)'); D('sideKill()')
    else: D('sideTp()')
    D('sim(1.0)')
  print(jid, 'done' if not D('sideSt()') else D('sideSt()'), m0, '->', D('state()')['money'], flush=True)
