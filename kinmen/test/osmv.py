D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("jincheng")'); D('sim(1)')
views={'o_jc':(-2.2,-3.6,120,-2.5,-2.5,0),'o_sw':(6.6,-2.9,110,6.9,-1.6,0),'o_sm':(6.3,2.9,110,6.5,3.6,0),'o_br':(-3.9,-5.0,140,-5.6,-2.1,0),'o_jcst':(-2.35,-2.75,9,-2.5,-2.45,2)}
for n,v in views.items():
  D('free(%s)'%','.join(map(str,v))); D('sim(0.4)'); pg.wait_for_timeout(2200); pg.screenshot(path=out+f'/{n}.png')
D('free(null)'); pg.keyboard.press('KeyM'); pg.wait_for_timeout(1200); pg.screenshot(path=out+'/o_map.png')
