D=lambda js: K('__KINMEN__.'+js)
cdp = pg.context.new_cdp_session(pg); stacks=[]
cdp.on('Debugger.paused', lambda e: stacks.append([e['callFrames'][0]['callFrameId']]+[(f['functionName'], f['location']['lineNumber']) for f in e['callFrames'][:14]]))
cdp.send('Debugger.enable')
def probe(js, label):
  stacks.clear(); K(f"window.__done=0; setTimeout(()=>{{ {js}; window.__done=1 }}, 30)"); time.sleep(2.5)
  cdp.send('Debugger.pause')
  for i in range(10):
    time.sleep(0.3); cdp.send('Runtime.getIsolateId')
    if stacks: break
  st = stacks[0] if stacks else None
  if st:
    r=cdp.send('Debugger.evaluateOnCallFrame',{'callFrameId':st[0],'expression':'String(window.__evstep)+" | "+(window.__KINMEN__?1:0)'}); print('   evstep', r.get('result',{}).get('value'), flush=True); st=st[1:]
  cdp.send('Debugger.resume'); time.sleep(0.2)
  hung = st and st[0][0] != 'frame'
  print(label, 'HUNG' if hung else 'ok', st if hung else '', flush=True)
  return hung
K("__KINMEN__.quality('low'); window.__nn=1")
for kind in ['thief','help']:
  K("__KINMEN__.teleport('jincheng')"); D('sim(2)'); D(f"ev('{kind}')"); D('sim(1)'); D('evWin()'); D('sim(0.5)')
for k in range(8):
  if probe("__KINMEN__.ev('crash')", f'crash{k}'): break
  if probe("__KINMEN__.sim(0.5)", f' sim{k}'): break
