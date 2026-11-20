import json
P=K('__KINMEN__.placesAll()'); print(len(P)); print(json.dumps([p[0] for p in P], ensure_ascii=False))
open(out+'/places.json','w').write(json.dumps(P, ensure_ascii=False))
