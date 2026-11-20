D=lambda js: K('__KINMEN__.'+js)
H=D('herInfo()'); r=H[0][1]
D(f'enter({r})'); D('sim(0.5)'); print(D('ylUp()')); pg.wait_for_timeout(1500); D('sim(1)'); print(D('ylState()'))
pg.wait_for_timeout(1500); pg.screenshot(path=out+'/yl_bal.png')
print(D('interact()')); pg.wait_for_timeout(1500); D('sim(0.5)'); print(D('ylState()'))
print(K('__KINMEN__.audit()')['doorsBlocked'], K('__KINMEN__.audit()')['noDoor'])
