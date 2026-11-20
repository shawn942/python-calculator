S=lambda: K('__KINMEN__.state()')
def shot(n): pg.wait_for_timeout(700); pg.screenshot(path=out+f'/w_{n}.png')
print('--- gunshop'); print(K('__KINMEN__.enter(10)')); K('__KINMEN__.sim(1)'); shot('gunshop')
K("__KINMEN__.goto(0,0,0)") if False else None
# walk to counter: use action via interact after moving
K("__KINMEN__.key('KeyW',true)"); K('__KINMEN__.sim(1.6)'); K("__KINMEN__.key('KeyW',false)"); print(' interact',K('__KINMEN__.interact()')); shot('menu'); K("__KINMEN__.key('Digit1',true)"); K("__KINMEN__.key('Digit1',false)"); K("__KINMEN__.key('Escape',true)"); K("__KINMEN__.key('Escape',false)"); print(' money',S()['money'])
K('__KINMEN__.leave()'); K('__KINMEN__.sim(0.5)'); print(' outside zone',S()['zone'], S()['km'])
print('--- bank rob'); print(K('__KINMEN__.enter(1)')); K('__KINMEN__.give(2,300)'); K('__KINMEN__.sim(0.5)'); K("__KINMEN__.key('KeyW',true)"); K('__KINMEN__.sim(1.2)'); K("__KINMEN__.key('KeyW',false)"); shot('bank')
print(' interact',K('__KINMEN__.interact()'), K('__KINMEN__.rob()'), 'stars',S()['stars']); K('__KINMEN__.sim(3)'); shot('bank_rob'); K('__KINMEN__.sim(7)'); print(' rob',K('__KINMEN__.rob()'),'loot',K('__KINMEN__.loot()'),'hp',S()['hp'],'cops',K('__KINMEN__.counts()')['cops'])
K('__KINMEN__.leave()'); K('__KINMEN__.sim(6)'); s=S(); print(' outside stars',s['stars'],'police',s['police'],'cops',K('__KINMEN__.counts()')['cops'],'hp',s['hp']); shot('bank_out')
K("__KINMEN__.fire(true)"); K('__KINMEN__.sim(2)'); K("__KINMEN__.fire(false)"); s=S(); print(' after firing stars',s['stars'],'hp',s['hp'],'cops',K('__KINMEN__.counts()')['cops']); shot('shoot')
K('__KINMEN__.sim(20)'); pg.wait_for_timeout(2600); K('__KINMEN__.sim(1)'); s=S(); print(' later stars',s['stars'],'hp',s['hp'],'money',s['money'],'loot',K('__KINMEN__.loot()'),'zone',s['zone'])
print('--- plane'); K('__KINMEN__.setWanted(0)'); print(K('__KINMEN__.plane()')); K("__KINMEN__.key('KeyW',true)")
for i in range(8):
    K('__KINMEN__.sim(3)'); ps=K('__KINMEN__.pstate()'); print('  ',ps)
    if ps and ps['sp']>30 and not ps['air']: K("__KINMEN__.key('Space',true)")
    if ps and ps['air'] and ps['y']>60: K("__KINMEN__.key('Space',false)")
    if not ps: break
shot('plane'); K("__KINMEN__.key('KeyD',true)"); K('__KINMEN__.sim(4)'); K("__KINMEN__.key('KeyD',false)"); print('  turn',K('__KINMEN__.pstate()'), S()['km']); shot('plane2')
