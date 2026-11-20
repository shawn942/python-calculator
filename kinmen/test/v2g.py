S=lambda: K('__KINMEN__.state()')
K('__KINMEN__.sim(1)'); print(K('__KINMEN__.enterNearest()')); K("__KINMEN__.key('KeyW',true)")
for i in range(5): K('__KINMEN__.sim(1.5)'); s=S(); print(s['speed'], s['zone'])
K("__KINMEN__.key('KeyW',false)"); pg.wait_for_timeout(500); pg.screenshot(path=out+'/z_go.png')
