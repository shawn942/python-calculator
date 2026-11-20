D=lambda js: K('__KINMEN__.'+js)
D('sim(1)'); pg.wait_for_timeout(1500); pg.screenshot(path=out+'/start.png')
print(D('state()'))
