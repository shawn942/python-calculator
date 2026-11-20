S=lambda: K('__KINMEN__.state()')
D=lambda js: K('__KINMEN__.'+js)
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v6_{n}.png')
def closeup(dx=4.5, dz=3.5, h=2.2):
  s=S(); D(f"free({(s['x']+dx)/150},{-(s['z']+dz)/150},{h},{s['x']/150},{-s['z']/150},0.9)")
D('setTime(15)')
# ---- 安全屋 ----
print('homes', D('homes()'))
print('buy', D('buyHome(0)'), D('homeGo(0)')); D('sim(0.5)'); shot('home')
D('homeMenu(0)'); D('sim(0.1)'); shot('homemenu'); D('setTime(22)'); D('menuPick(0)'); pg.wait_for_timeout(2600); D('sim(0.3)'); print(' slept tod', S()['tod'], 'hp', S()['hp'])
print('spawn', D("spawn('suv')"), D('enterNearest()'), S()['inVehicle']); D('garGo(0)'); D('sim(1)'); print(' garaged', D('homes()'), 'inVeh', S()['inVehicle'])
D('garOut(0)'); D('sim(0.5)'); print(' out', D('homes()')); shot('garage')
# ---- 改車店 + 車損 ----
D('enterNearest()'); print('modGo', D('modGo()'), S()['inVehicle']); D('sim(0.6)'); print(' menu', K('document.querySelector("#menu").classList.contains("show") && document.querySelector("#menu h4").textContent')); shot('modmenu')
D('money(20000)'); D('menuPick(1)'); D('menuPick(1)'); print(' paint', D('veh()')); D('menuPick(2)'); D('menuPick(3)'); print(' mods', D('veh()'))
print(' hurt', D('hurtVeh(40)')); D('sim(0.2)'); print(' hurt', D('hurtVeh(60)')); D('sim(0.2)'); print(' ', D('veh()'))
D("key('KeyF',true)"); D('sim(0.1)'); D("key('KeyF',false)"); D('sim(0.4)'); closeup(); shot('dent'); D('free(null)')
D('enterNearest()'); D('sim(0.3)'); D('mod()'); D('menuPick(0)'); print(' repaired', D('veh()')); K("document.querySelector('#menu').classList.remove('show')"); D("key('KeyF',true)"); D('sim(0.1)'); D("key('KeyF',false)"); D('sim(0.3)')
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
# ---- 隨機事件 ----
for kind in ['thief','help','crash']:
  K("__KINMEN__.teleport('jincheng')"); D('sim(2)'); ok=D(f"ev('{kind}')"); D('sim(1)'); print('event', kind, ok, D('evSt()')); shot('ev_'+kind)
  m0=S()['money']; D('evWin()'); D('sim(0.5)')
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
