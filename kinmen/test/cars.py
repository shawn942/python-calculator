D=lambda js: K('__KINMEN__.'+js)
print(D('carInfo()'))
for i,(t,a) in enumerate([('sedan',0.6),('sports',2.4),('police',0.6),('taxi',-0.8),('suv',2.6)]):
  D(f'studioCar("{t}",{a})'); pg.wait_for_timeout(900); pg.screenshot(path=out+f'/car{i}.png', clip={'x':240,'y':120,'width':800,'height':480})
