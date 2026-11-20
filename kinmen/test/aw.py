import json
r=K('__KINMEN__.auditWorld()'); json.dump(r,open('/tmp/aw.json','w'))
print({k:v for k,v in r.items() if not k.startswith('sample')})
for k in ('sampleRoad','sampleSlope','sampleWet','sampleTrees'):
  print(k); [print('  ',x) for x in r[k][:14]]
