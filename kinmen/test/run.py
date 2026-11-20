import sys, json, time, subprocess, os
from playwright.sync_api import sync_playwright
steps = sys.argv[1] if len(sys.argv)>1 else 'basic'
srv = subprocess.Popen([sys.executable,'-I','-m','http.server','8765','--directory','/home/claude/kinmen/dist'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(0.8)
out='/home/claude/kinmen/test/shots'; os.makedirs(out,exist_ok=True)
logs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1280,'height':720})
    pg.on('console',lambda m: logs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
    pg.on('response',lambda r: logs.append('HTTP %d %s'%(r.status,r.url)) if r.status>=400 else None)
    pg.on('pageerror',lambda e: logs.append('PAGEERROR: '+str(e)))
    t0=time.time(); pg.goto('http://localhost:8765/index.html'+os.environ.get('Q',''))
    try: pg.wait_for_function('window.__KINMEN__ && window.__KINMEN__.ready',timeout=120000)
    except Exception as e: print('READY TIMEOUT',e)
    print('boot seconds',round(time.time()-t0,1))
    K=lambda js: pg.evaluate(js)
    if steps=='basic':
      pg.wait_for_timeout(1500); pg.screenshot(path=out+'/00_start.png')
      K('__KINMEN__.start()'); pg.wait_for_timeout(2500); pg.screenshot(path=out+'/01_nqu.png'); print(json.dumps(K('__KINMEN__.state()'),ensure_ascii=False))
    else:
      K('__KINMEN__.start()'); pg.wait_for_timeout(800)
      exec(open('/home/claude/kinmen/test/'+steps+'.py').read())
    b.close()
finally:
  srv.terminate()
print('\n'.join(logs[:40]) or 'NO CONSOLE ERRORS')
