D=lambda js: K('__KINMEN__.'+js)
for q in ['水頭古厝民宿','珠山古厝民宿','山后古厝民宿']:
  print(q, D(f"actGo('{q}')")); D('sim(1)')
st=D('state()'); x,z=st['x'],st['z']; D('setTime(19)'); D('sim(0.5)'); pg.wait_for_timeout(300); pg.screenshot(path=out+'/bnb.png')
