D=lambda js: K('__KINMEN__.'+js)
print(D('wx(4)')); D('setTime(14)')
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; _,x,z,r=P['后湖海濱公園']
D(f"free({(x+50)/150},{-(z+50)/150},20,{x/150},{-z/150},0)"); D('sim(2)'); pg.wait_for_timeout(500); pg.screenshot(path=out+'/ty.png')
