D=lambda js: K('__KINMEN__.'+js)
D('teleport("nqu")'); D('sim(1)'); pg.wait_for_timeout(6000)
print(K('''(()=>{const T=__KINMEN__._T,sc=__KINMEN__._scene;const reg=new Set(__KINMEN__._cullList().map(e=>e.o));const r={};const bx=new T.Box3(),v=new T.Vector3();
for(const o of sc.children){if(o.isMesh||o.isLight||!o.children.length)continue;bx.setFromObject(o);const s=bx.isEmpty()?-1:bx.getSize(v).length()/2;const k=(reg.has(o)?'REG':'no')+(o.userData._c?' _c':'')+(o.userData.noCull?' noCull':'')+' r'+(s<0?'empty':s<3?'<3':s<30?'<30':'>30')+(o.userData.vtype?' veh':'')+(o.userData.ped?' ped':'');r[k]=(r[k]||0)+1;}return r})()'''))
