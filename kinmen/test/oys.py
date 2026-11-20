D=lambda js: K('__KINMEN__.'+js)
D('setTime(9)'); m0=D('state()')['money']; print(D("actGo('採石蚵')"), m0, '->', D('state()')['money']); D('sim(0.5)')
print(D("actGo('採石蚵')"))
st=D('state()'); x,z=st['x'],st['z']; D(f"free({(x+12)/150},{-(z+12)/150},6,{(x-20)/150},{-(z-20)/150},0)"); D('sim(1)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/oys.png')
