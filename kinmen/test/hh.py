D=lambda js: K('__KINMEN__.'+js)
K("(()=>{})()")
print('act', D("actGo('沖個澡')")); D('sim(0.5)'); print('hp', D('state()')['hp'])
st=D('state()'); x,z=st['x'],st['z']
D(f"free({(x-18)/150},{-(z-18)/150},9,{(x+10)/150},{-(z+10)/150},1)"); D('sim(0.3)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/hh1.png')
D(f"free({(x+18)/150},{-(z+18)/150},9,{(x-10)/150},{-(z-10)/150},1)"); D('sim(0.3)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/hh2.png')
