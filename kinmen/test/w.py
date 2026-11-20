S=lambda: K('__KINMEN__.state()')
K("__KINMEN__.goto(-7.2,-1.62,2.4)"); K('__KINMEN__.sim(2)'); K('__KINMEN__.setWanted(3)'); K('__KINMEN__.sim(12)'); s=S(); print(' stars',s['stars'],'police',s['police']); pg.wait_for_timeout(700); pg.screenshot(path=out+'/f_wanted.png')
K('__KINMEN__.sim(10)'); pg.wait_for_timeout(2600); K('__KINMEN__.sim(1)'); s=S(); print(' after: stars',s['stars'],'police',s['police'],'km',s['km'],'money',s['money'])
print('--- escape test'); K("__KINMEN__.goto(-3.0,-0.3,1.5)"); K('__KINMEN__.sim(1)'); K('__KINMEN__.setWanted(1)'); K("__KINMEN__.spawn('sedan')"); K('__KINMEN__.enterNearest()'); K("__KINMEN__.key('KeyW',true)"); K('__KINMEN__.sim(8)'); s=S(); print(' driving speed',s['speed'],'police',s['police'],'stars',s['stars'],'km',s['km']); pg.wait_for_timeout(600); pg.screenshot(path=out+'/f_drive.png'); K("__KINMEN__.key('KeyW',false)")
# landmark freecam shots
K("__KINMEN__.key('Space',true)"); K('__KINMEN__.sim(3)'); K("__KINMEN__.key('Space',false)")
cams=[('juguang',-6.78,-2.92,-6.95,-2.62,10,9,15.5),('winery',-5.2,-0.55,-5.22,-0.86,7,6,11),('mofan',-7.53,-1.68,-7.55,-1.4,5,4,10.5),('airport',0.3,-1.9,0.75,-1.55,16,4,13),('nqu',-5.95,0.95,-6.4,0.45,30,6,16.6),('shuitou',-7.58,-4.5,-7.35,-4.3,8,7,15.5),('guning',-8.3,3.36,-8.2,3.15,6,4,14),('chen',3.0,-2.85,2.9,-2.6,7,4,10),('shanhou',6.42,5.27,6.15,4.95,16,3,9.5),('jincheng_night',-7.2,-1.7,-7.12,-1.5,9,5,20.5),('bridge',-10.3,0.45,-9.3,1.75,30,10,17.3),('mashan',5.0,7.18,5.1,6.95,6,3,12)]
for name,tx,ty,cx,cy,h,th,tod in cams:
    K(f"__KINMEN__.goto({tx},{ty},0); __KINMEN__.setTime({tod}); __KINMEN__.sim(5); __KINMEN__.free({cx},{cy},{h},{tx},{ty},{th})"); pg.wait_for_timeout(1300); pg.screenshot(path=out+f'/c_{name}.png')
K('__KINMEN__.free(null)')
