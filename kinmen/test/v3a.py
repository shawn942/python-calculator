S=lambda: K('__KINMEN__.state()')
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/n_{n}.png')
# models close-up
K("__KINMEN__.teleport('jincheng')"); K('__KINMEN__.setTime(11)'); K('__KINMEN__.sim(8)')
K("(()=>{const s=__KINMEN__.state();__KINMEN__.free((s.x+5)/150,-(s.z+3)/150,2.2,s.x/150,-s.z/150,1.2)})()"); shot('people'); K('__KINMEN__.free(null)')
K('__KINMEN__.cam(0.8,0.15)'); K('__KINMEN__.sim(0.3)'); shot('street')
# seamless interior: walk in through bank door
print('--- walk-in'); K('__KINMEN__.enter(1)'); K('__KINMEN__.leave()'); K('__KINMEN__.sim(0.2)'); print(' outside:',K('__KINMEN__.inside()'))
s=S(); K("__KINMEN__.key('KeyW',true)"); 
for i in range(6):
  K('__KINMEN__.sim(0.4)'); 
  if K('__KINMEN__.inside()'): break
K("__KINMEN__.key('KeyW',false)"); print(' after walking:',K('__KINMEN__.inside()'), S()['zone']); shot('bankin')
K('__KINMEN__.leave()'); K('__KINMEN__.sim(0.5)'); K('__KINMEN__.cam(3.5,0.2)'); K('__KINMEN__.sim(0.3)'); shot('bankout')
# phone/radio
print('--- phone',K('__KINMEN__.phone()')); shot('phone'); K('__KINMEN__.pick(0)'); shot('contacts'); K('__KINMEN__.pick(0)'); K('__KINMEN__.sim(0.3)'); print(' taxi called; vehicles',S()['vehicles'])
print('radio st',K('__KINMEN__.radio()'))
# weather
for i,n in [(2,'rain'),(3,'fog')]:
  K(f'__KINMEN__.weather({i})'); K('__KINMEN__.sim(14)'); shot(n)
K('__KINMEN__.weather(0)'); K('__KINMEN__.sim(14)')
# heli + nade + cover
print('--- heli'); K('__KINMEN__.setWanted(3)'); K('__KINMEN__.sim(6)'); print(' heli',K('__KINMEN__.heli()'),'cover',K('__KINMEN__.crouch()')); K('__KINMEN__.cam(0.8,0.45)'); shot('heli'); K('__KINMEN__.nade()'); K('__KINMEN__.sim(1.0)'); shot('nade'); K('__KINMEN__.sim(2)'); print(' hp',S()['hp'],'stars',S()['stars'])
K('__KINMEN__.setWanted(0)')
