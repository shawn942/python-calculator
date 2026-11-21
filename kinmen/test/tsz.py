from collections import Counter
print(Counter(K('__KINMEN__._ms("tileSizes")')).most_common())
c=Counter(K('__KINMEN__._ms("packSizes")')); print(len(c), c.most_common(15))
import math
ps=[tuple(map(int,x.split('x'))) for x in K('__KINMEN__._ms("packSizes")')]; print('pack area Mpx', sum(w*h for w,h in ps)/1e6, 'max', max(ps,key=lambda p:p[0]*p[1]))
