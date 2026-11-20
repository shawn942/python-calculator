D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; _,x,z,r=P['后湖海濱公園']; print(x,z)
print(D("actGo('沖個澡')"))
D('season(1)'); D('wx(0)'); D('setTime(11)'); D(f"free({(x+50)/150},{-(z-50)/150},18,{x/150},{-z/150},0)"); D('sim(1)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/hh_new.png')
