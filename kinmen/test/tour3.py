D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; D('setTime(14)'); D("quality('mid')")
shots=[('金城・后浦',60,0.45),('模範街',40,0.35),('沙美老街',45,0.4),('山外',55,0.4),('明德公園',40,0.5),('雙鯉濕地',45,0.5),('毋忘在莒',16,0.25)]
for i,(n,d,h) in enumerate(shots):
  if n not in P: print('missing', n); continue
  _,x,z,r=P[n]; D(f"free({(x+d)/150},{-(z+d*0.6)/150},{d*h},{x/150},{-z/150},2)"); D('sim(0.25)'); pg.wait_for_timeout(500); pg.screenshot(path=out+f'/t3_{i}.png'); open(out+f'/t3_{i}.txt','w').write(n)
D('setTime(20.5)'); _,x,z,r=P['金城・后浦']; D(f"free({(x+40)/150},{-(z+24)/150},16,{x/150},{-z/150},2)"); D('sim(1)'); pg.wait_for_timeout(500); pg.screenshot(path=out+'/t3_7.png'); open(out+'/t3_7.txt','w').write('金城（夜）')
