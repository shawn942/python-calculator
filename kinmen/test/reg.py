S=lambda: K('__KINMEN__.state()')
print('AUDIT',json.dumps(K('__KINMEN__.audit()'),ensure_ascii=False))
print('rob:',K('__KINMEN__.enter(4)')); K('__KINMEN__.give(2,300)'); K('__KINMEN__.sim(0.3)'); print(' start',K('__KINMEN__.startRob()')); K('__KINMEN__.sim(9)'); print(' ',K('__KINMEN__.rob()'),'loot',K('__KINMEN__.loot()'),'stars',S()['stars'],'hp',S()['hp']); K('__KINMEN__.setWanted(0)')
K("__KINMEN__.goto(-2,-1.2,0)"); K('__KINMEN__.sim(1)'); print('plane',K('__KINMEN__.plane()')); K("__KINMEN__.key('KeyW',true)"); K('__KINMEN__.sim(4)'); K("__KINMEN__.key('Space',true)"); K('__KINMEN__.sim(4)'); K("__KINMEN__.key('Space',false)"); print(' ',K('__KINMEN__.pstate()')); K("__KINMEN__.key('KeyW',false)")
print('boat',K('__KINMEN__.boat(1)')); K("__KINMEN__.key('KeyW',true)"); K('__KINMEN__.sim(4)'); K("__KINMEN__.key('KeyW',false)"); print(' ',S()['speed'])
for n in ['jincheng','shamei']:
  K(f"__KINMEN__.teleport('{n}')"); K('__KINMEN__.sim(4)'); pg.wait_for_timeout(2500); s=S(); print('perf',n,'fps',s['fps'],'draws',s['draws'])
