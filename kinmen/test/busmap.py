D=lambda js: K('__KINMEN__.'+js)
pg.keyboard.press('KeyM'); pg.wait_for_timeout(1200)
r=K('''(()=>{const cv=document.getElementById('bigcv');const b=cv.getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()''')
print(r)
# hover a stop: search stops via blips not exposed; sweep around Jincheng area
import itertools
best=None
for fx in [0.37,0.38,0.39,0.40,0.41]:
  for fy in [0.55,0.57,0.59,0.61,0.63]:
    pg.mouse.move(r[0]+r[2]*fx, r[1]+r[3]*fy); pg.wait_for_timeout(120)
pg.wait_for_timeout(400); pg.screenshot(path=out+'/busmap2.png')
