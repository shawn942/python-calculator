D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; D('setTime(14)'); D("quality('mid')")
names=['金城・后浦','模範街','水頭聚落','得月樓','瓊林聚落','山后民俗村','古寧頭・北山','太武山','毋忘在莒','海印寺','北山播音牆','歐厝戰車殘骸','邱良功母節孝坊','山外','金寧鄉公所・頂堡','烈嶼・東林','尚義機場','金門城']
i=0
for n in names:
  if n not in P: print('missing', n); continue
  _,x,z,r=P[n]; d=max(26,min(r*0.8,70)) if n not in ('毋忘在莒','海印寺','得月樓','北山播音牆','歐厝戰車殘骸','邱良功母節孝坊') else 22
  D(f"free({(x+d)/150},{-(z+d)/150},{d*0.5},{x/150},{-z/150},3)"); D('sim(0.25)'); pg.wait_for_timeout(500)
  pg.screenshot(path=out+f'/t2_{i:02d}.png'); open(out+f'/t2_{i:02d}.txt','w').write(n); i+=1
print('shots', i)
D('free(null)')
