D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}
print('has', '慈湖鸕鶿' in P)
_,x,z,r=P['慈湖鸕鶿']
for i,h in enumerate([17.6, 20.5, 11]):
  D(f'setTime({h})'); D(f"free({(x+30)/150},{-(z+30)/150},18,{(x-40)/150},{-(z-10)/150},12)"); D('sim(1.5)'); pg.wait_for_timeout(400); pg.screenshot(path=out+f'/corm{i}.png')
print(D("actGo('鸕鶿')"))
