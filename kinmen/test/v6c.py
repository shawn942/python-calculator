S=lambda: K('__KINMEN__.state()')
D=lambda js: K('__KINMEN__.'+js)
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v6_{n}.png')
def closeup(dx=4.5, dz=3.5, h=2.2):
  s=S(); D(f"free({(s['x']+dx)/150},{-(s['z']+dz)/150},{h},{s['x']/150},{-s['z']/150},0.9)")
D('setTime(15)')
# ---- 隨機事件 ----
for kind in ['thief','help','crash']:
  K("__KINMEN__.teleport('jincheng')"); D('sim(2)'); ok=D(f"ev('{kind}')"); D('sim(1)'); print('event', kind, ok, D('evSt()')); shot('ev_'+kind)
  m0=S()['money']; print('  win', flush=True); D('evWin()'); print('  w1', flush=True); D('sim(0.5)'); print('  w2', flush=True)
  if kind=='crash': D("key('KeyE',true)"); D('sim(0.1)'); D("key('KeyE',false)"); pg.wait_for_timeout(4600); D('sim(0.3)')
  print('  after', D('evSt()'), 'money +', S()['money']-m0, 'stars', S()['stars'])
# ---- 跳傘 ----
K("__KINMEN__.goto(-2,-1.2,0)"); D('sim(1)'); print('plane', D('plane()')); D("key('KeyW',true)"); D('sim(4)'); D("key('Space',true)"); D('sim(5)'); D("key('Space',false)"); print(' ', D('pstate()'))
print('bail', D('bail()')); D('sim(1.5)'); print(' fall', D('sky()')); shot('freefall'); D('chute()'); D('sim(1)'); print(' chute', D('sky()')); shot('chute')
for k in range(12):
  D('sim(3)'); s=D('sky()')
  if not s['air']: break
print(' landed', D('sky()'), 'hp', S()['hp'], 'planes', D('counts()')['planes'])
# ---- 倒地 ----
K("__KINMEN__.teleport('jincheng')"); D('sim(1.5)'); print('knock', D('knock()')); D('sim(0.4)'); shot('knock'); D('sim(3)'); print(' down after', D('down()'), 'hp', S()['hp'])
# ---- 翻上車頂 ----
D("spawn('van')"); D('sim(0.3)'); y0=S()['y']; D("key('KeyW',true)")
for k in range(30):
  if D('vault()')>0: break
  D('sim(0.1)')
D("key('Space',true)"); D('sim(0.1)'); D("key('Space',false)"); D('sim(1.0)'); D("key('KeyW',false)"); D('sim(0.6)'); print('vault ground', y0, 'now', D('roof()'), 'air', D('sky()')['air']); shot('roof')
# ---- 雨天 ----
D('rain(true)'); K("__KINMEN__.teleport('jincheng')"); D('sim(2.5)'); shot('rain'); D('rain(false)')
