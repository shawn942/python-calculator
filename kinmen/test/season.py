D=lambda js: K('__KINMEN__.'+js)
for t,i in [(17.5,3),(9,3),(17.5,1),(9,1)]:
  D(f'season({i})'); D(f'setTime({t})')
  print('season',i,'t',t, D("actGo('鸕鶿')"), '|', D("actGo('蜂虎')"))
