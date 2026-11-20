S=lambda: K('__KINMEN__.state()')
print(K('__KINMEN__.wk()')['cur'])
print('plane',K('__KINMEN__.plane()'), K('__KINMEN__.pstate()')); K("__KINMEN__.key('KeyW',true)")
for i in range(6): K('__KINMEN__.sim(1.5)'); print(K('__KINMEN__.pstate()'), S()['km'])
K("__KINMEN__.key('Space',true)"); K('__KINMEN__.sim(3)'); print(K('__KINMEN__.pstate()'))
for n in ['jincheng','shamei']:
  K(f"__KINMEN__.teleport('{n}')"); K('__KINMEN__.sim(4)'); pg.wait_for_timeout(2500); s=S(); print('perf',n,'fps',s['fps'],'draws',s['draws'])
