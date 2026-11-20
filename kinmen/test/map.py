D=lambda js: K('__KINMEN__.'+js)
pg.keyboard.press('KeyM'); D('sim(0.3)'); pg.wait_for_timeout(500); pg.screenshot(path=out+'/map.png')
