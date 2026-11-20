D=lambda js: K('__KINMEN__.'+js)
D('setTime(9)'); m0=D('state()')['money']
for q in ['拍栗喉蜂虎','拍戴勝']:
  print(q, D(f"actGo('{q}')"), D('state()')['money']); D('sim(1.5)'); pg.wait_for_timeout(400)
  st=D('state()'); x,z=st['x'],st['z']
  if '蜂虎' in q: D(f"free({x/150},{-z/150},2.2,{x/150},{-z/150},1.5)") 
  D('sim(1)'); pg.screenshot(path=out+f"/dex_{'bee' if '蜂' in q else 'hoo'}.png")
