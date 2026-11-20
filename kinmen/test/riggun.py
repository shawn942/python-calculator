import os
D=lambda js: K('__KINMEN__.'+js)
pg.wait_for_function('__KINMEN__.rigInfo().bases.length>5',timeout=60000)
names=[]
for k,(a) in enumerate([[0,0.08,0.02,0,0,0],[0,0.08,0.02,1.5708,0,0],[0,0.08,0.02,-1.5708,0,0],[0,0.08,0.02,0,1.5708,0],[0,0.08,0.02,0,0,1.5708]]):
  D('studio(-1.5708,2,false)'); print(D('rigGunT("Idle_Gun_Pointing",%s)'%','.join(map(str,a)))); pg.wait_for_timeout(900)
  n=f'gun{k}'; pg.screenshot(path=out+f'/{n}.png', clip={'x':200,'y':100,'width':500,'height':300}); names.append(n)
D('studio(0.4,2,false)'); pg.wait_for_timeout(600); pg.screenshot(path=out+'/hero.png', clip={'x':440,'y':40,'width':400,'height':650})
