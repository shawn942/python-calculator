D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("guningtou")'); D('sim(1)')
c=D('ll(24.4690,118.3068)'); t=D('ll(24.4398,118.4263)'); r=D('ll(24.4863,118.41181)')
for i,(p,h) in enumerate([(c,160),(t,110),(r,90)]):
  D(f'free({p[0]+0.35},{p[1]-0.45},{h},{p[0]},{p[1]},0)'); D('sim(0.5)'); pg.wait_for_timeout(3000); pg.screenshot(path=out+f'/lake{i}.png')
D('free(null)'); pg.keyboard.press('KeyM'); pg.wait_for_timeout(1500); pg.screenshot(path=out+'/lake_map.png')
print(K('__KINMEN__.audit()')['doorsBlocked'])
