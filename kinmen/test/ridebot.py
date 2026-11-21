D=lambda js: K('__KINMEN__.'+js)
for t,vm,seed in (('scooter',13,3),('scooter',20,3),('scooter',20,7),('sedan',20,3),('sedan',20,7),('bike',8,3)):
  D(f"rideTest('{t}')"); r=D(f'driveBot(90, {seed}, {vm}, 0)'); print(t,vm,seed,' km',r.get('km'),'stuck',r.get('n'),[ (s['why'],s['col']) for s in r.get('stuck',[])])
