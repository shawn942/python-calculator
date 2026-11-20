S=lambda: K('__KINMEN__.state()')
D=lambda js: K('__KINMEN__.'+js)
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v7_{n}.png')
D('setTime(14)')
print('dgo', D('dgo()')); pg.wait_for_timeout(2200); D('sim(0.5)'); s=S(); print(' at', s['x'], s['z'], 'zone', s['zone'], 'ground', D('dground()')); shot('pier')
print('wall', D('dwall()')); D('sim(0.5)'); print(' zone', S()['zone'], D('dground()')); D('cam(0.67,0.12)'); D('sim(0.3)'); shot('wall')
D('setTime(20)'); D('sim(2)'); print(' neon', D('neon()')); shot('wall_night'); D('setTime(14)'); D('sim(1)')
s=S(); cx,cz=-2727,1092
D(f"free({(cx+190)/150},{-(cz+60)/150},95,{cx/150},{-cz/150},5)"); D('sim(0.3)'); shot('aerial'); D('free(null)')
D(f"free({(cx-120)/150},{-(cz-150)/150},40,{(cx-16)/150},{-(cz-86)/150},8)"); D('sim(0.3)'); shot('wall_sea'); D('free(null)')
# 交通船
print('ft JG9', D("ft('JG9')")); pg.wait_for_timeout(2200); D('sim(0.5)'); print(' zone', S()['zone'], 'money', S()['money'])
D("key('KeyE',true)"); D('sim(0.1)'); D("key('KeyE',false)"); pg.wait_for_timeout(2500); D('sim(0.5)'); print(' after ferry zone', S()['zone'], 'money', S()['money'])
# 走路：從碼頭往西走上島
D('cam(-1.5708,0.15)'); D("key('KeyW',true)"); D('sim(6)'); D("key('KeyW',false)"); s=S(); print(' walked', s['x'], s['z'], s['y'], s['zone']); shot('walk')
# 委託
print('side dadan', D("side('dadan')"))
for k in range(4):
  st=D('sideSt()')
  if not st: break
  D('sideTp()'); D('sim(0.5)')
print(' ->', D('sideSt()'), 'done', 'dadan' in D('sideDone()'))
