D=lambda js: K('__KINMEN__.'+js)
D('setTime(17.3)'); pg.keyboard.press('KeyK'); D('sim(0.5)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+'/photo.png')
pg.keyboard.press('KeyK'); D('sim(0.2)'); print(K("document.body.classList.contains('photo')"))
