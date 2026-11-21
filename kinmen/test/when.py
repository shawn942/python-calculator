D=lambda js: K('__KINMEN__.'+js)
D('teleport("jincheng")'); D('sim(3)')
print(K('''(()=>{const T=__KINMEN__._T,scene=__KINMEN__._scene,cam=__KINMEN__._cam;const v=new T.Vector3();const out={};
for(const o of scene.children){if(!o.isMesh||o.geometry.type!=='PlaneGeometry'||!o.material.map)continue;o.getWorldPosition(v);if(v.distanceTo(cam.position)>700)continue;const k=(o.userData._c!==undefined?'c':'')+' id<'+(o.id<20000?'2e4':o.id<60000?'6e4':o.id<150000?'15e4':'big');out[k]=(out[k]||0)+1;}
const ids=__KINMEN__._msrc().map(s=>s.o.id);return [out,Math.min(...ids),Math.max(...ids),cam.position.toArray().map(Math.round)]})()'''))
