D=lambda js: K('__KINMEN__.'+js)
print('spawn', D("rideTest('scooter')"))
D('sim(0.5)')
# 直線加速
D("key('KeyW', true)"); 
for t in (1,2,4): D('sim(%s)'%(1 if t==1 else t-1 if t==2 else 2)); print('accel', D('ride()'))
pg.screenshot(path=out+'/ride_straight.png')
# 高速右轉（D）
D("key('KeyD', true)"); D('sim(0.6)'); r=D('ride()'); print('turnR', r); D('sim(0.15)'); pg.screenshot(path=out+'/ride_leanR.png')
D("key('KeyD', false)"); D('sim(1.2)'); print('straighten', D('ride()'))
D("key('KeyA', true)"); D('sim(0.6)'); print('turnL', D('ride()')); D('sim(0.15)'); pg.screenshot(path=out+'/ride_leanL.png')
D("key('KeyA', false)"); D("key('KeyW', false)")
# 煞車點頭
D("key('KeyS', true)"); D('sim(0.4)'); print('brake', D('ride()')); D("key('KeyS', false)"); D('sim(2)')
# 低速迴轉半徑
D("key('KeyW', true)"); D('sim(0.7)'); D("key('KeyW', false)"); s=D('ride()'); print('slow', s)
import math
D("key('KeyW', true)"); D("key('KeyA', true)")
pts=[]
for i in range(12): D('sim(0.25)'); r=D('ride()'); pts.append((r['x'],r['z'],r['spd'],r['yr']))
D("key('KeyA', false)"); D("key('KeyW', false)")
print('uturn pts', pts[-3:])
# 估算半徑：速度/角速度
rs=[abs(p[2]/p[3]) for p in pts if abs(p[3])>0.05]; print('radius ~', round(sum(rs)/len(rs),2) if rs else None)
# 腳踏車也試
print('bike', D("rideTest('bike')")); D("key('KeyW', true)"); D('sim(3)'); D("key('KeyD', true)"); D('sim(0.8)'); print('bike turn', D('ride()')); D("key('KeyD', false)"); D("key('KeyW', false)")
# 汽車沒被影響
print('car', D("rideTest('sedan')")); D("key('KeyW', true)"); D('sim(3)'); D("key('KeyD', true)"); D('sim(0.8)'); print('car turn', D('ride()')); D("key('KeyD', false)"); D("key('KeyW', false)")
