S=lambda: K('__KINMEN__.state()')
D=lambda js: K('__KINMEN__.'+js)
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v6_{n}.png')
def closeup(dx=4.5, dz=3.5, h=2.2):
  s=S(); D(f"free({(s['x']+dx)/150},{-(s['z']+dz)/150},{h},{s['x']/150},{-s['z']/150},0.9)")
D('setTime(15)')
# ---- 委託 ----
def run_side(id, shots=False):
  print('side', id, D(f"side('{id}')"))
  for k in range(14):
    st=D('sideSt()')
    if not st: break
    t=st['t']
    if t=='go': D('sideTp()'); D('sim(0.4)')
    elif t=='fight':
      D('sideTp()'); D('sim(1.2)')
      if shots: shot('fight')
      print('   fight', D('sideSt()')); D('sideKill()'); D('sim(0.6)')
    elif t=='chase':
      D('sim(1.5)'); print('   chase', D('sideSt()'))
      if shots: shot('chase')
      D('sideKill()'); D('sim(0.6)')
    elif t=='brawl':
      D('sideTp()'); D('sim(1.5)'); D('sideTp()'); D('sim(0.8)'); print('   brawl', D('sideSt()'))
      if shots: shot('brawl')
      D('sideKill()'); D('sim(0.6)')
  print('  ->', D('sideSt()'), 'money', S()['money'], 'mission', S()['mission'])
for i,id in enumerate(['gongtang','camera','kaoliang','patrol','debt','taro','deliver']): run_side(id, id in ('camera','kaoliang','debt'))
print('done', D('sideDone()'))
D('ring()'); D('sim(0.3)'); print('call', D('call()')); shot('call'); print('answer', D('answer()')); D('sim(0.3)'); shot('sidegoal'); run_side('x')
