D=lambda js: K('__KINMEN__.'+js)
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v7_{n}.png')
D('setTime(15)'); D('dwall()'); pg.wait_for_timeout(500); D('sim(0.5)')
D('cam(3.6,0.05)'); D('sim(0.5)'); shot('xiamen')
D('cam(2.6,0.05)'); D('sim(0.5)'); shot('xiamen2')
cx,cz=-2727,1092
D(f"free({(cx+40)/150},{-(cz-150)/150},30,{(cx-200)/150},{-(cz-900)/150},20)"); D('sim(0.3)'); shot('xiamen3'); D('free(null)')
