D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; _,x,z,r=P['后湖海濱公園'] if '后湖海濱公園' in P else P['金門大學']
D('setTime(11)')
for i in [1,3]:
  D(f'season({i})'); D(f"free({(x+60)/150},{-(z+60)/150},25,{x/150},{-z/150},0)"); D('sim(1)'); pg.wait_for_timeout(500); pg.screenshot(path=out+f'/seas{i}.png')
