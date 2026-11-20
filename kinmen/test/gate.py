import math
D=lambda js: K('__KINMEN__.'+js)
D('setTime(15)'); D('teleport("nqu")'); D('sim(2)')
G=D('tlInfo()')['gates']; print(len(G))
for i,(nm,x,y,rot) in enumerate([G[0],G[3],G[7]]):
  fx,fz=math.sin(rot),math.cos(rot)
  cx=x+fx*16/150; cy=y-fz*16/150
  D(f'free({cx},{cy},3,{x},{y},4.5)'); D('sim(0.5)'); pg.wait_for_timeout(3500); pg.screenshot(path=out+f'/gate{i}.png')
