D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; D('setTime(14)')
for i,n in enumerate(['翟山坑道','擎天廳','瓊林戰鬥坑道']):
  _,x,z,r=P[n]; D(f"tpTo ? 0:0") if False else None
  K(f"__KINMEN__.tunExit && 0"); D(f"free({(x+9)/150},{-(z+9)/150},4,{x/150},{-z/150},2)"); D('sim(0.3)'); pg.wait_for_timeout(500); pg.screenshot(path=out+f'/portal{i}.png')
