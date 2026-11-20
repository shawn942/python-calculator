K('__KINMEN__.tun(0)'); pg.wait_for_timeout(2400); K('__KINMEN__.sim(0.8)'); pg.screenshot(path=out+'/dbg_hi.png')
K("__KINMEN__.quality('low')"); pg.wait_for_timeout(800); pg.screenshot(path=out+'/dbg_lo.png')
K("__KINMEN__.quality('mid')"); pg.wait_for_timeout(800); pg.screenshot(path=out+'/dbg_mid.png')
