pg.keyboard.press('KeyM'); pg.wait_for_timeout(1200)
r=K('''(()=>{const cv=document.getElementById('bigcv');const b=cv.getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()''')
# find a stop blip in page coords
pt=K('''(()=>{const cv=document.getElementById('bigcv');const b=cv.getBoundingClientRect();return null})()''')
for fx in [0.37,0.38,0.39,0.40,0.41]:
  for fy in [0.55,0.57,0.59,0.61,0.63]:
    pg.mouse.click(r[0]+r[2]*fx, r[1]+r[3]*fy); pg.wait_for_timeout(150)
    t=K("document.getElementById('toast') ? document.getElementById('toast').textContent : ''")
    if '🚌' in t: print('hit',fx,fy,t); break
  else: continue
  break
pg.wait_for_timeout(500); pg.screenshot(path=out+'/busmap3.png')
