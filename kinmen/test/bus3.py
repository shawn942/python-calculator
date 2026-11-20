import math
D=lambda js: K('__KINMEN__.'+js)
D('setTime(10)'); D('teleport("jincheng")'); D('sim(2)')
shot=0
for i in range(30):
  D('sim(2)'); L=D('busInfo()')['live']
  for bb in L:
    if bb[3]:
      ref,k,sp,w,x,y,yaw=bb; fx,fz=math.sin(yaw),math.cos(yaw)
      cx=x+(fx*9+fz*6)/150; cy=y-(fz*9-fx*6)/150
      D(f'free({cx},{cy},3,{x},{y},1.5)'); pg.wait_for_timeout(3500); pg.screenshot(path=out+f'/bus{shot}.png'); shot+=1; break
  if shot>=2: break
  if shot: D('free(null)')
print(shot)
