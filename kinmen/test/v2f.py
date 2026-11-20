S=lambda: K('__KINMEN__.state()')
K('__KINMEN__.sim(1)'); print(K('__KINMEN__.enterNearest()')); print(K('__KINMEN__.dbg().vpos'))
K("__KINMEN__.key('KeyW',true)")
for i in range(5): K('__KINMEN__.sim(1.5)'); print(S()['speed'], K('__KINMEN__.dbg().vpos'))
K("__KINMEN__.free(-1.9,-1.1,30,-1.98,-1.26,2)") if False else None
pg.wait_for_timeout(500); pg.screenshot(path=out+'/z_stuck.png')
