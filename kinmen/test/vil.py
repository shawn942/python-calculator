D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("shanwai")'); D('sim(1)')
for n,v in {'v1':(4.4,0.0,90,5.0,0.9,0),'v2':(-9.0,-0.4,100,-9.6,0.5,0)}.items():
  D('free(%s)'%','.join(map(str,v))); D('sim(0.4)'); pg.wait_for_timeout(2200); pg.screenshot(path=out+f'/{n}.png')
D('free(null)'); pg.keyboard.press('KeyM'); pg.wait_for_timeout(1500); pg.screenshot(path=out+'/v_map.png')
print(K('__KINMEN__.state()')['fps'])
