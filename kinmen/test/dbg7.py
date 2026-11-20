K("__KINMEN__.teleport('jincheng')"); K('__KINMEN__.sim(2)'); K('__KINMEN__.pause(true)')
import time as T
for i in range(3): t=T.time(); r=K('__KINMEN__.rend()'); print('base render ms', r, 'wall', round(T.time()-t,2), flush=True)
print(K("__KINMEN__.ev('crash')"), flush=True)
for i in range(4): t=T.time(); r=K('__KINMEN__.rend()'); print('after render ms', r, 'wall', round(T.time()-t,2), flush=True)
