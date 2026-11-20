D=lambda js: K('__KINMEN__.'+js)
def W(ms=2600): pg.wait_for_timeout(ms); D('sim(0.3)')
import time
T0=time.time()
def run(ch):
  D(f'setCh({ch})'); D('sim(0.3)'); print(' go', D('storyGo()')); D('sim(0.3)'); D('skipTalk()'); st=D('st()'); print('CH', ch, st['fn'], st, flush=True)
  for it in range(40):
    D('skipTalk()'); st=D('st()')
    if st['ch']!=ch: print('  -> done', st['ch'], 'money', K('__KINMEN__.state()')['money'], round(time.time()-T0), flush=True); return True
    if not st['active'] and not st['wait']: print('  INACTIVE (failed?)', st, flush=True); return False
    fn, step = st['fn'], st['step']
    if st['wait']:
      s2=D('sideSt()')
      if s2:
        if s2['t'] in ('go',): D('sideTp()')
        else: D('sideTp()'); D('sim(1.5)'); D('sideKill()')
        D('sim(0.6)'); continue
      D('sim(0.5)'); continue
    if fn in ('ch1','ch2','ch3','ch4','ch5'): print('   old', D('stOld()'), flush=True)
    elif fn=='chTunnel':
      if step==0: D("tunEnter('瓊林戰鬥坑道')"); W()
      elif step==1: D('tunWalk(30)'); D('sim(0.3)')
      elif step==2: D('tunExit()'); W()
      elif step==3: D('stKill()')
      else: D('stNpc()')
    elif fn=='chDate':
      if step==0: D('enterNearest()'); D('sim(27)')
      else: D('tgtTp()'); D('sim(0.6)')
    elif fn=='chTail': D('stKill()'); D('sim(0.5)')
    elif fn=='chSea':
      if step==0: D('inBoat()'); D('sim(0.6)')
      elif step==1: D('stKill()')
      else: D('stNpc()')
    elif fn=='chMashan':
      if step==0: D("tunEnter('馬山觀測所')"); W()
      elif step==1: D('tunScope()'); D('sim(0.3)')
      elif step==2: D('tunExit()'); W()
      else: D('tgtTp()')
    elif fn=='chHostage':
      if step==0: D('stKill()')
      else: D('tgtTp()')
    D('sim(1.0)')
    if it%5==4: print('   ', it, D('st()'), flush=True)
  print('  STUCK', D('st()'), flush=True); return False
import os
ok=[run(c) for c in eval(os.environ.get('CHS','range(12)'))]
print('RESULT', ok)
