import os
D=lambda js: K('__KINMEN__.'+js)
which=int(os.environ.get('WHICH','2')); fem=os.environ.get('FEM','false')
names=[]
for i,a in enumerate([0, -0.785, -1.5708, 3.1416]):
  D(f'studio({a},{which},{fem})'); D('sim(0.2)'); pg.wait_for_timeout(300)
  n=f'sheet{which}_{fem}_{i}'; pg.screenshot(path=out+f'/{n}.png', clip={'x':490,'y':40,'width':300,'height':650}); names.append(n)
print(names)
