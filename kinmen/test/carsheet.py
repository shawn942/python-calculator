import os
D=lambda js: K('__KINMEN__.'+js)
tag=os.environ.get('TAG','old')
types=['sedan','sports','taxi','police','suv','pickup','van','jeep']
for t in types:
  print(t, D(f"studioCar('{t}', -0.72)")); D('sim(0.2)'); pg.wait_for_timeout(250); pg.screenshot(path=out+f'/car_{tag}_{t}.png', clip={'x':190,'y':140,'width':900,'height':440})
