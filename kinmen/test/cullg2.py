D=lambda js: K('__KINMEN__.'+js)
D('teleport("nqu")'); D('sim(1)'); pg.wait_for_timeout(3000)
print(K('''(()=>{const sc=__KINMEN__._scene;const reg=new Set(__KINMEN__._cullList().map(e=>e.o));const r={};
for(const o of sc.children){if(o.isMesh||o.isLight||!o.children.length||reg.has(o))continue;const k=Object.keys(o.userData).join(',')+'|'+o.type+'|'+o.name+'|kids'+o.children.length+'|veh'+__KINMEN__._isVeh(o);r[k]=(r[k]||0)+1;}return [__KINMEN__._cf(),r]})()'''))
