D=lambda js: K('__KINMEN__.'+js)
D('map()'); pg.wait_for_timeout(900)
b=D('blipAt(3)'); print(b); pg.mouse.move(b[0]-20,b[1]-20); pg.wait_for_timeout(100); pg.mouse.move(b[0],b[1]); pg.wait_for_timeout(400)
pg.screenshot(path=out+'/map_hover.png', clip={'x':b[0]-160,'y':b[1]-90,'width':320,'height':180})
