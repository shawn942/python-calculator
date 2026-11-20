S=lambda: K('__KINMEN__.state()')
D=lambda js: K('__KINMEN__.'+js)
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v8_{n}.png')
D('setTime(15)'); m0=S()['money']
print('start', D("side('dadan2')"))
for k in range(12):
  st=D('sideSt()')
  if not st: break
  print(' stage', st['i'], st['t'], 'timer', st['timer'], 'tod', S()['tod'], flush=True)
  if st['t']=='go': D('sideTp()'); D('sim(0.6)')
  elif st['t']=='fight':
    D('sideTp()'); D('sim(1.5)'); print('   fight', D('sideSt()'), 'rifle cur', S()['inVehicle']); shot('fight'); D('sideKill()'); D('sim(0.6)')
  elif st['t']=='escape':
    D('sim(3)'); s2=D('sideSt()'); print('   escape', s2); 
    cx,cz=-2727,1092
    shot('escape'); D('sideKill()'); D('sim(1)')
  if st['i']==4 and st['t']=='go': pass
print('end', D('sideSt()'), 'paid', S()['money']-m0, 'done', 'dadan2' in D('sideDone()'))
D('setTime(15)'); D('map()'); pg.wait_for_timeout(800); pg.screenshot(path=out+'/v8_bigmap.png')
box=K("(()=>{const r=document.getElementById('bigcv').getBoundingClientRect(); return [r.left,r.top,r.width,r.height]})()"); print('bigcv', box)
pg.mouse.click(box[0]+box[2]*0.08, box[1]+box[3]*0.25); pg.wait_for_timeout(400); print('target after inset click', K("document.getElementById('toast').textContent"))
