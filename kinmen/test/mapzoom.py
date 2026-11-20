pg.keyboard.press('KeyM'); pg.wait_for_timeout(1200)
r=K('''(()=>{const b=document.getElementById('cvbox').getBoundingClientRect();return [b.left,b.top,b.width,b.height]})()''')
cx,cy=r[0]+r[2]*0.39,r[1]+r[3]*0.57
pg.mouse.move(cx,cy)
for i in range(5): pg.mouse.wheel(0,-100); pg.wait_for_timeout(120)
pg.wait_for_timeout(800)
pg.mouse.click(cx,cy); pg.wait_for_timeout(400)
print(K("document.getElementById('toast').textContent"))
# drag pan
pg.mouse.move(cx,cy); pg.mouse.down(); pg.mouse.move(cx-150,cy-60,steps=8); pg.mouse.up(); pg.wait_for_timeout(600)
print(K("document.getElementById('bigcv').style.transform"))
pg.screenshot(path=out+'/mapzoom.png')
