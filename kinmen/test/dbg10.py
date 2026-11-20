D=lambda js: K('__KINMEN__.'+js)
print(D('tun(2)')); pg.wait_for_timeout(2400); D('sim(0.3)'); s=K('__KINMEN__.state()'); print('in', s['x'], s['z'], D('inTunnel()'))
D("key('KeyW',true)"); D('sim(1)'); D("key('KeyW',false)"); s=K('__KINMEN__.state()'); print('after walk', s['x'], s['z'], D('inTunnel()'))
