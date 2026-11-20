import json
pg.set_default_timeout(600000)
D=lambda js: K('__KINMEN__.'+js)
D('sim(0.3)'); print('enter', D('enterNearest()')); D('sim(0.5)')
allS=[]; km=0
for seed in (3,17,91,222,555,1234):
  D('enterNearest()') if not D('state()')['inVehicle'] else None; r=D(f'offroadBot(240,{seed})'); 
  if isinstance(r,str): print(r); break
  km+=r['km']; allS+=r['stuck']; print(seed, r['km'], r['n'], flush=True)
print('total km', round(km,1), 'events', len(allS)); json.dump(allS, open('/tmp/bot.json','w'))
for s in allS[:30]: print(' ', s)
