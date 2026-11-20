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
    K=lambda js: pg.evaluate(js); pg.set_default_timeout(150000)
    print('touch ui visible', K("getComputedStyle(document.getElementById('touch')).display"))
    pg.screenshot(path=out+'/t_mobile.png')
    # tap the 車 button near scooter
    s0=K('__KINMEN__.state()'); hid=K("document.getElementById('btnF').classList.contains('hide')"); print('btnF hidden (no car nearby)' if hid else 'btnF shown'); (None if hid else pg.tap('#btnF')); pg.wait_for_timeout(400); print('after 車 tap inVehicle', K('__KINMEN__.state()')['inVehicle']); (pg.tap('#btnF') if K('__KINMEN__.state()')['inVehicle'] else None); pg.wait_for_timeout(600)
    # joystick drag forward via pointer events
    box=pg.locator('#stick').bounding_box(); cx=box['x']+box['width']/2; cy=box['y']+box['height']/2
    K(f"""(()=>{{const st=document.getElementById('stick');const ev=(t,x,y)=>st.dispatchEvent(new PointerEvent(t,{{pointerId:7,clientX:x,clientY:y,bubbles:true,pointerType:'touch'}}));ev('pointerdown',{cx},{cy});ev('pointermove',{cx},{cy-45});}})()""")
    K('__KINMEN__.sim(4)'); s1=K('__KINMEN__.state()'); print('joystick moved', round(((s1['x']-s0['x'])**2+(s1['z']-s0['z'])**2)**.5,1),'speed',s1['speed'])
    K(f"""(()=>{{const st=document.getElementById('stick');st.dispatchEvent(new PointerEvent('pointerup',{{pointerId:7,bubbles:true,pointerType:'touch'}}));}})()""")
    pg.wait_for_timeout(600); pg.screenshot(path=out+'/t_mobile2.png')
    pg.tap('#btnM'); pg.wait_for_timeout(500); print('map open', K("document.getElementById('bigmap').classList.contains('show')")); pg.screenshot(path=out+'/t_map.png'); K('__KINMEN__.map()')
    pg.tap('#btnP'); pg.wait_for_timeout(300); print('phone open', K("document.getElementById('menu').classList.contains('show')"))
    b.close()
finally: srv.terminate()
print('\n'.join(logs) or 'NO PAGE ERRORS')
