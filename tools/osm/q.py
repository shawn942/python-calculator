import pickle
nodes,keep=pickle.load(open('/tmp/osmw/k.pkl','rb'))
from collections import Counter
c=Counter()
for wid,(nds,t) in keep.items():
  if 'bridge' in t and t['highway'] in('primary','secondary','tertiary'): print('bridge',wid,t.get('name'),t['highway'],len(nds))
  if t.get('name') in ('模範街','莒光路','沙美老街','金門大橋','烈嶼鄉道'): c[(t.get('name'),t['highway'])]+=1
print(c)
names=Counter(t.get('name') for nds,t in keep.values() if t['highway'] in ('primary','secondary','tertiary'))
print(names.most_common(60))
