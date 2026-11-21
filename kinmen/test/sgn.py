D=lambda js: K('__KINMEN__.'+js)
for loc in ['jincheng','nqu','airport']:
  D(f'teleport("{loc}")'); D('sim(3)')
  r=K('''(()=>{const T=__KINMEN__._T,scene=__KINMEN__._scene,cam=__KINMEN__._cam;const by={};const v=new T.Vector3();
  scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.geometry.type!=='PlaneGeometry')return;const m=o.material;if(Array.isArray(m)||!m.map)return;o.getWorldPosition(v);if(v.distanceTo(cam.position)>700)return;
   let vis=true;for(let p=o;p;p=p.parent)if(!p.visible)vis=false;
   const top=(()=>{let t=o;while(t.parent&&t.parent!==scene)t=t.parent;return t})();
   const k=m.type.replace('Mesh','').replace('Material','')+(m.transparent?'+tr':'')+(m.alphaTest?'+at'+m.alphaTest:'')+(m.depthWrite?'':'+nodw')+(m.side==2?'+ds':'')+(m.polygonOffset?'+po':'')+(m.emissiveMap?'+em':'')+(m.map.image&&m.map.image.width?' img'+m.map.image.width+'x'+m.map.image.height:' noimg')+(m.map.isCanvasTexture?' canvas':'')+' par:'+(o.parent===scene?'scene':(top.isMesh?'mesh':'grp'+top.children.length+(top.userData.vtype?':veh':'')+(top.userData.ped?':ped':'')))+(vis?'':' HID')+' shared:'+(m.userData._sh||'');
   const e=by[k]||(by[k]={c:0,mats:new Set()});e.c++;e.mats.add(m.uuid);});
  return Object.entries(by).sort((a,b)=>b[1].c-a[1].c).map(([k,e])=>e.c+' mats'+e.mats.size+'  '+k);})()''')
  print('==',loc); print('\n'.join(r[:25]))
