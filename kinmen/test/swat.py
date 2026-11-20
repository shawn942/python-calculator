D=lambda js: K('__KINMEN__.'+js)
pg.wait_for_function('__KINMEN__.rigInfo().bases.length>5',timeout=60000)
for i,a in enumerate([0.5,-1.2]):
  D(f'studio({a},20,false)'); K('0'); pg.wait_for_timeout(300); D(f'rigGunT("Idle_Gun_Pointing",0,0,0,0,0,0)') if False else None
  pg.wait_for_timeout(900); pg.screenshot(path=out+f'/swat{i}.png', clip={'x':440,'y':40,'width':400,'height':650})
