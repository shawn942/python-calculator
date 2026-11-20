D=lambda js: K('__KINMEN__.'+js)
pg.wait_for_function('__KINMEN__.rigInfo().bases.length>5',timeout=60000)
for i,(th,sh) in enumerate([(-1.45,1.45)]):
  D('studio(-1.5708,2,false)'); D(f'rigSitT({th},{sh})'); pg.wait_for_timeout(800); pg.screenshot(path=out+f'/sit{i}.png', clip={'x':440,'y':40,'width':400,'height':650})
