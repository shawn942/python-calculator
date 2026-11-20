D=lambda js: K('__KINMEN__.'+js)
D('teleport("shuitou")'); D('sim(1)'); print(D('dyUp()')); pg.wait_for_timeout(1500); D('sim(1)'); print(D('ylState()'))
pg.wait_for_timeout(2000); pg.screenshot(path=out+'/dy_top.png')
print(D('interact()')); pg.wait_for_timeout(3000); D('sim(0.5)'); print(D('ylState()'))
