D=lambda js: K('__KINMEN__.'+js)
print('ads', D('ads()'))
D('setTime(15.5)')
for i in [0,3,20,30,40]:
  D(f'adGo({i})'); D('sim(0.4)'); pg.wait_for_timeout(700); pg.screenshot(path=out+f'/v14_{i}.png'); print(i, K('__KINMEN__.state()')['zone'])
