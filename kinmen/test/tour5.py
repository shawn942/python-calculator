D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(11)')
for i in range(2):
  print(D(f'tourGo({i})')); D('sim(2)'); pg.wait_for_timeout(400); pg.screenshot(path=out+f'/tour{i}.png')
