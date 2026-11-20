D=lambda js: K('__KINMEN__.'+js)
print('enter', D("tunEnter('地雷主題館')")); pg.wait_for_timeout(2500); D('sim(0.3)')
print('in', D('state()'))
pg.screenshot(path=out+'/mine0.png')
toasts=set()
for k in range(40):
  D(f'tunWalk({k*2.2})'); D('sim(0.5)'); t=K("document.getElementById('toast') && document.getElementById('toast').textContent"); 
  if t: toasts.add(t)
  st=D('state()'); print(k, round(st['x'],1), t, flush=True)
  if k==8: pg.screenshot(path=out+'/mine1.png')
  if st['x'] < 6000: print('exited at', k, st); break
pg.wait_for_timeout(2000); D('sim(0.5)'); print('after', D('state()')); print('toasts', toasts)
pg.screenshot(path=out+'/mine2.png')
