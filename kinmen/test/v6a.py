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
