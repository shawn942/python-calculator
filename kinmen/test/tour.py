import json
D=lambda js: K('__KINMEN__.'+js)
P=K('__KINMEN__.placesAll()'); seen=set(); D('setTime(14)'); D("quality('mid')")
i=0
for name,x,z,r in P:
  if name in seen or x>4000: continue
  seen.add(name); d=max(30,min(r*0.9,90))
  K(f"__KINMEN__.tpTo ? 0 : 0"); D(f"free({(x+d)/150},{-(z+d)/150},{d*0.55},{x/150},{-z/150},2)"); D('sim(0.25)'); pg.wait_for_timeout(500)
  pg.screenshot(path=out+f'/tour_{i:02d}.png'); open(out+f'/tour_{i:02d}.txt','w').write(name); i+=1
print('shots', i)
