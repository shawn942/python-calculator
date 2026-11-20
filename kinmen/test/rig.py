import os
D=lambda js: K('__KINMEN__.'+js)
pg.wait_for_function('typeof RIG!=="undefined" || true')
for i in range(40):
  r=K('window.__rigst ? 1 : 0')
  pg.wait_for_timeout(500)
print(K('__KINMEN__.rigInfo ? __KINMEN__.rigInfo() : null'))
names=[]
for w in [2,3,8,4,9]:
  for i,a in enumerate([0, -1.5708]):
    D(f'studio({a},{w},false)'); pg.wait_for_timeout(700)
    n=f'rig{w}_{i}'; pg.screenshot(path=out+f'/{n}.png', clip={'x':490,'y':40,'width':300,'height':650}); names.append(n)
print(names)
