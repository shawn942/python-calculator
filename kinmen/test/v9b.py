S=lambda: K('__KINMEN__.state()')
D=lambda js: K('__KINMEN__.'+js)
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v9_{n}.png')
D('setTime(15.5)'); D('myhome()'); pg.wait_for_timeout(2300); D('sim(0.4)'); s=S(); y=K('__KINMEN__.state()')['yaw'] if 'yaw' in s else None
print('front', s['x'], s['z'])
D("key('KeyS',true)"); D('sim(1.8)'); D("key('KeyS',false)"); D('sim(0.4)'); shot('front2')
s=S(); D(f"free({(s['x']+12)/150},{-(s['z']+18)/150},7,{(s['x']-2)/150},{-(s['z']-6)/150},7)"); D('sim(0.2)'); shot('ext2'); D('free(null)')
D('myin()'); pg.wait_for_timeout(2500); D('sim(0.3)'); D('mytp(3,-1.5,-3.6,3.1416)'); D('sim(0.2)'); print('act', D('act()')); D('doAct()'); pg.wait_for_timeout(2500); D('sim(0.5)'); print('roof', D('onRoof()')); shot('roof2')
D('setTime(20.2)'); D('sim(1)'); shot('roof_night')
