S=lambda: K('__KINMEN__.state()')
for n in ['jincheng','shamei']:
  K(f"__KINMEN__.teleport('{n}')"); K('__KINMEN__.sim(4)'); pg.wait_for_timeout(2500); s=S(); print('perf',n,'fps',s['fps'],'draws',s['draws'],'tris',s['tris'])
K("__KINMEN__.teleport('jincheng')"); K('__KINMEN__.setTime(21)'); K('__KINMEN__.sim(2)'); pg.wait_for_timeout(1500); pg.screenshot(path=out+'/a_night2.png')
