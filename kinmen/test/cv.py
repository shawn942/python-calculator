import os
pg.set_default_timeout(150000)
D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('sim(0.3)')
tag='n' if 'nocull' in os.environ.get('Q','') else 'c'
D('free(-3.2,-0.9,60,-1.5,-0.2,5)'); D('sim(0.2)'); D('cullNow()'); pg.wait_for_timeout(6000); pg.screenshot(path=out+f'/cv_{tag}0.png')
D('free(null)'); D('sim(0.2)'); D('cullNow()'); pg.wait_for_timeout(6000); pg.screenshot(path=out+f'/cv_{tag}1.png')
