D=lambda js: K('__KINMEN__.'+js)
pg.wait_for_function('__KINMEN__.rigInfo().bases.length>5',timeout=60000)
D('teleport("jincheng")'); D('setTime(11)'); D('sim(2)'); D('setWanted(2)'); D('sim(14)')
pg.wait_for_timeout(1500); pg.screenshot(path=out+'/cops.png'); print(D('state()')['police'], D('meshes()'))
