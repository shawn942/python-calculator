D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; D('setTime(14)'); D("quality('mid')")
shots=[('古崗樓',22,0.45),('明遺古街',30,0.5)]
for i,(n,d,h) in enumerate(shots):
  if n not in P: print('missing', n); continue
  _,x,z,r=P[n]; D(f"free({(x+d)/150},{-(z+d*0.6)/150},{abs(d)*h},{x/150},{-z/150},2)"); D('sim(0.25)'); pg.wait_for_timeout(500); pg.screenshot(path=out+f'/t4_{i}.png'); open(out+f'/t4_{i}.txt','w').write(n)
