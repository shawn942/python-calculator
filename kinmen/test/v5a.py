S=lambda: K('__KINMEN__.state()')
def shot(n): pg.wait_for_timeout(1000); pg.screenshot(path=out+f'/v5_{n}.png')
print('tunnels',K('__KINMEN__.tunnels()'))
K("__KINMEN__.teleport('jincheng')"); K('__KINMEN__.setTime(15.5)'); K('__KINMEN__.sim(6)'); shot('street')
K("(()=>{const s=__KINMEN__.state();__KINMEN__.free((s.x+2.6)/150,-(s.z+1.6)/150,1.7,s.x/150,-s.z/150,1.1)})()"); pg.wait_for_timeout(300); shot('closeup'); K('__KINMEN__.free(null)')
for i in range(7):
  print(' enter',K(f'__KINMEN__.tun({i})')); pg.wait_for_timeout(2400); K('__KINMEN__.sim(0.5)'); print('   in:',K('__KINMEN__.inTunnel()'),S()['zone']); K('__KINMEN__.sim(0.3)'); shot(f't{i}')
K('__KINMEN__.setTime(21)'); K("__KINMEN__.teleport('jincheng')"); pg.wait_for_timeout(1500); K('__KINMEN__.sim(3)'); shot('night')
