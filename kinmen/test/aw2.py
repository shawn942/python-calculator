D=lambda js: K('__KINMEN__.'+js)
pg.set_default_timeout(120000); D('setTime(11)')
P=[(-384,172,90),(-410,95,110),(-395,517,70),(1396,-809,40),(1061,-120,45),(-1414,258,60),(-438,1052,45),(-457,376,30)]
for i,(x,z,h) in enumerate(P):
  D(f'tpTo({x+30},{z+30})') if False else None
  D(f'free({(x+h*0.5)/150},{-(z+h*0.7)/150},{h},{x/150},{-z/150},2)'); D('sim(0.3)'); pg.wait_for_timeout(2500); pg.screenshot(path=out+f'/aw{i}.png')
