D=lambda js: K('__KINMEN__.'+js)
K("localStorage.removeItem('kinmen_dex')")
m0=D('state()')['money']
D('setTime(17.5)')
for q in ['拍鸕鶿','拍水獺','拍鱟','拍白鷺']:
  print(q, D(f"actGo('{q}')"), D('state()')['money']); D('sim(0.4)')
print('total', m0, '->', D('state()')['money'])
print('again', D("actGo('拍白鷺')"), D('state()')['money'])
pg.keyboard.press('KeyP'); D('sim(0.3)'); pg.screenshot(path=out+'/dex.png')
