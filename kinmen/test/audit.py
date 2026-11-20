S=lambda: K('__KINMEN__.state()')
print('AUDIT',json.dumps(K('__KINMEN__.audit()'),ensure_ascii=False))
# missions end-to-end
sp=K('__KINMEN__.dbg()')['spots']
K(f"__KINMEN__.goto({sp['deliver']['x']/150},{-sp['deliver']['z']/150},0)"); K('__KINMEN__.sim(0.4)'); print('deliver start',K('__KINMEN__.interact()'),S()['mission']); K("__KINMEN__.spawn('sedan')"); K('__KINMEN__.enterNearest()'); m0=S()['money']
for i in range(3):
  K('__KINMEN__.sim(1.2)'); d=K('__KINMEN__.dbg()'); K(f"__KINMEN__.warpVeh({d['target']['x']+3},{d['target']['z']+3})"); K('__KINMEN__.sim(0.5)')
print(' deliver result',S()['mission'],S()['money']-m0)
K("__KINMEN__.key('KeyF',true)");K("__KINMEN__.key('KeyF',false)")
K(f"__KINMEN__.goto({sp['race']['x']/150},{-sp['race']['z']/150},0)"); K('__KINMEN__.sim(0.4)'); print('race start',K('__KINMEN__.interact()'),S()['mission']); K("__KINMEN__.spawn('sedan')"); K('__KINMEN__.enterNearest()'); m0=S()['money']
for i in range(5):
  K('__KINMEN__.sim(0.6)'); d=K('__KINMEN__.dbg()'); 
  if not d['target']: break
  K(f"__KINMEN__.warpVeh({d['target']['x']+2},{d['target']['z']+2})"); K('__KINMEN__.sim(0.4)')
print(' race result',S()['mission'],S()['money']-m0)
K("__KINMEN__.key('KeyF',true)");K("__KINMEN__.key('KeyF',false)")
K(f"__KINMEN__.goto({sp['fly']['x']/150},{-sp['fly']['z']/150},0)"); K('__KINMEN__.sim(0.4)'); print('fly start',K('__KINMEN__.interact()'),S()['mission'])
# perf at busy spots
for n in ['jincheng','shanwai','shamei','airport']:
  K(f"__KINMEN__.teleport('{n}')"); K('__KINMEN__.sim(4)'); pg.wait_for_timeout(2500); s=S(); print('perf',n,'fps',s['fps'],'draws',s['draws'],'tris',s['tris'],'traffic',s['traffic'],'peds',s['peds'])
# night shot + mobile viewport
K("__KINMEN__.teleport('jincheng')"); K('__KINMEN__.setTime(21)'); K('__KINMEN__.sim(2)'); pg.wait_for_timeout(1500); pg.screenshot(path=out+'/a_night.png')
pg.set_viewport_size({'width':390,'height':844}); pg.wait_for_timeout(1200); pg.screenshot(path=out+'/a_mobile.png')
