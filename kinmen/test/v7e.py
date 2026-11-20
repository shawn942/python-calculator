D=lambda js: K('__KINMEN__.'+js)
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v7_{n}.png')
D('setTime(15)'); D('dwall()'); pg.wait_for_timeout(500); D('sim(0.5)'); D('cam(2.6,0.05)')
for q in ['high','mid','low']: D(f"quality('{q}')"); D('sim(0.3)'); shot('cl_'+q)
