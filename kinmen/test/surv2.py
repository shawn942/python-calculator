D=lambda js: K('__KINMEN__.'+js)
D('sim(0.5)'); D('survStart(100)'); D('survEat(-200)')
for i in range(12):
  D('sim(8)'); s=D('surv()'); st=D('state()')
  if not s['on']: break
print('fail', i, 'on', s['on'], 'money', s['money'], 'hp', st['hp'], 'saved', pg.evaluate("localStorage.getItem('kinmen_surv')"))
pg.wait_for_timeout(6000); D('sim(3)'); print('after respawn', D('state()')['hp'], D('surv()')['money'])
