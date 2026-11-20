import time as T
D=lambda js: K('__KINMEN__.'+js)
K("__KINMEN__.goto(-2,-1.2,0)"); D('sim(1)'); D('plane()'); D("key('KeyW',true)"); D('sim(4)'); D("key('Space',true)"); D('sim(5)'); D("key('Space',false)"); D("key('KeyW',false)")
print('bail', D('bail()'), flush=True); D('sim(1.5)'); D('chute()'); D('sim(0.5)'); print('chute', D('sky()'), flush=True)
for k in range(14):
  t=T.time(); D('sim(2)'); s=D('sky()'); print(' ', k, s, round(T.time()-t,1), flush=True)
  if not s['air']: break
print('landed hp', K('__KINMEN__.state()')['hp'], flush=True)
pg.screenshot(path=out+'/v6_land.png'); print('shot ok', flush=True)
