import glob, pickle
import xml.etree.ElementTree as ET
nodes={}; ways={}; rels={}; stops={}
for f in glob.glob('/tmp/osm/t_*.osm'):
  root=ET.parse(f).getroot()
  for n in root.iter('node'):
    nodes[int(n.get('id'))]=(float(n.get('lat')),float(n.get('lon')))
    t={tg.get('k'):tg.get('v') for tg in n.iter('tag')}
    if t.get('highway')=='bus_stop' or t.get('public_transport') in ('platform','stop_position'): stops[int(n.get('id'))]=t.get('name')
  for w in root.iter('way'): ways[int(w.get('id'))]=[int(nd.get('ref')) for nd in w.iter('nd')]
  for r in root.iter('relation'):
    t={tg.get('k'):tg.get('v') for tg in r.iter('tag')}
    if t.get('route')=='bus':
      rels[int(r.get('id'))]=(t,[(m.get('type'),int(m.get('ref')),m.get('role')) for m in r.iter('member')])
print('stops',len(stops),'named',sum(1 for v in stops.values() if v),'routes',len(rels))
for rid,(t,mem) in list(rels.items())[:60]:
  print(rid,t.get('ref'),t.get('name'),len([m for m in mem if m[0]=='way']),len([m for m in mem if m[0]=='node']), sum(1 for m in mem if m[0]=='way' and m[1] in ways))
pickle.dump((nodes,ways,rels,stops),open('/tmp/osmw/bus.pkl','wb'))
