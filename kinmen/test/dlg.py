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
    B=lambda: K("Object.fromEntries([...document.querySelectorAll('.tb')].map(b=>[b.id.slice(3), b.classList.contains('hide')?null:b.textContent]))")
    pg.set_default_timeout(150000); pg.wait_for_timeout(2000)
    print('story0', K('__KINMEN__.story()'))
    K('__KINMEN__.storyGo()'); pg.wait_for_timeout(4000)
    st=K('__KINMEN__.story()'); print('after go', st)
    if not st['dialog']:
        pg.tap('#btnE'); pg.wait_for_timeout(1500); st=K('__KINMEN__.story()'); print('after E', st)
    print('buttons in dialog', B())
    i0=st['dlgI']; pg.touchscreen.tap(640,300); pg.wait_for_timeout(800); i1=K('__KINMEN__.story()')['dlgI']; print('tap center', i0,'->',i1)
    pg.touchscreen.tap(200,200); pg.wait_for_timeout(800); i2=K('__KINMEN__.story()')['dlgI']; print('tap left', i1,'->',i2)
    pg.screenshot(path=out+'/dlg.png')
    for k in range(30):
        if not K('__KINMEN__.story()')['dialog']: break
        pg.touchscreen.tap(420,150); pg.wait_for_timeout(300)
    print('dialog done', K('__KINMEN__.story()'))
    # 車子卡住自動脫困
    print('veh', K("(()=>{const v=__KINMEN__.state(); return v.inVehicle})()"))
    print('\n'.join(logs) or 'NO PAGE ERRORS')
finally:
  srv.terminate()
