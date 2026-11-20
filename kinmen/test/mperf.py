import sys, json, time, subprocess, os
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable,'-I','-m','http.server','8766','--directory','/home/claude/kinmen/dist'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(0.8)
out='/home/claude/kinmen/test/shots'; logs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    ctx=b.new_context(viewport={'width':844,'height':390},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=ctx.new_page(); pg.on('pageerror',lambda e: logs.append('PAGEERROR: '+str(e)))
    pg.goto('http://localhost:8766/index.html'+__import__('os').environ.get('Q','')); pg.wait_for_function('window.__KINMEN__ && window.__KINMEN__.ready',timeout=120000)
    print('pre', pg.evaluate('JSON.stringify(window.__KINMEN__.state())')[:200]); pg.evaluate("document.getElementById('startBtn').click()"); pg.wait_for_timeout(1500); print('started')
    K=lambda js: pg.evaluate(js)
    print('touch ui visible', K("getComputedStyle(document.getElementById('touch')).display"))
    pg.set_default_timeout(150000); K("__KINMEN__.sim(0.5)"); K("__KINMEN__.actGo('租腳踏車')"); K("__KINMEN__.sim(0.5)")
    import os
    if 'nocull' not in os.environ.get('Q',''): K("__KINMEN__.cullNow()")
    K("perfToggle && 0") if False else None
    pg.evaluate("(()=>{localStorage.setItem('kinmen_perf','1')})()")
    r=pg.evaluate("new Promise(res=>{const I=window.__KINMEN__.rinfo; let n=0; const f=()=>{ n++; if(n==2) I(); if(n>=3) res(I()); else requestAnimationFrame(f)}; requestAnimationFrame(f)})")
    print('mobile frame', r)
    print('\n'.join(logs) or 'NO PAGE ERRORS')
finally:
  srv.terminate()
