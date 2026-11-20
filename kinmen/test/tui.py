import sys, json, time, subprocess, os
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable,'-I','-m','http.server','8766','--directory','/home/claude/kinmen/dist'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(0.8)
out='/home/claude/kinmen/test/shots'; logs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    ctx=b.new_context(viewport={'width':844,'height':390},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=ctx.new_page(); pg.on('pageerror',lambda e: logs.append('PAGEERROR: '+str(e)))
    pg.goto('http://localhost:8766/index.html'); pg.wait_for_function('window.__KINMEN__ && window.__KINMEN__.ready',timeout=120000)
    print('pre', pg.evaluate('JSON.stringify(window.__KINMEN__.state())')[:200]); pg.evaluate("document.getElementById('startBtn').click()"); pg.wait_for_timeout(1500); print('started')
    K=lambda js: pg.evaluate(js)
    print('touch ui visible', K("getComputedStyle(document.getElementById('touch')).display"))
    B=lambda: K("Object.fromEntries([...document.querySelectorAll('.tb')].map(b=>[b.id.slice(3), b.classList.contains('hide')?null:b.textContent+(b.classList.contains('dim')?'(dim)':'')]))")
    pg.set_default_timeout(120000); pg.wait_for_timeout(2500); print('home (near car)', B()); pg.screenshot(path=out+'/tu0.png')
    pg.tap('#btnF'); pg.wait_for_timeout(2500); print('in car', K('__KINMEN__.state()')['inVehicle'], B()); pg.screenshot(path=out+'/tu1.png')
    pg.tap('#btnF'); pg.wait_for_timeout(1500); K("__KINMEN__.actGo('租腳踏車')"); K('__KINMEN__.key("KeyS",true)'); pg.wait_for_timeout(9000); K('__KINMEN__.key("KeyS",false)'); pg.wait_for_timeout(2500); print('away', B()); pg.screenshot(path=out+'/tu2.png')
    print('prompt', K("document.getElementById('prompt').textContent"))
    print('\n'.join(logs) or 'NO PAGE ERRORS')
finally:
  srv.terminate()
