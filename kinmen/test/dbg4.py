D=lambda js: K('__KINMEN__.'+js)
for kind in ['thief','help']:
  K("__KINMEN__.teleport('jincheng')"); D('sim(2)'); D(f"ev('{kind}')"); D('sim(1)'); D('evWin()'); D('sim(0.5)'); print(kind, 'done', flush=True)
K("__KINMEN__.teleport('jincheng')"); D('sim(2)')
cdp = pg.context.new_cdp_session(pg); stacks=[]
cdp.on('Debugger.paused', lambda e: stacks.append([(f['functionName'], f['location']['lineNumber'], f['location'].get('columnNumber')) for f in e['callFrames'][:12]]))
cdp.send('Debugger.enable')
K("setTimeout(()=>{window.__evr = __KINMEN__.ev('crash')}, 50)"); time.sleep(4)
cdp.send('Debugger.pause')
for i in range(10):
  time.sleep(0.3); cdp.send('Runtime.getIsolateId')
  if stacks: break
print('stacks', stacks, flush=True)
