D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(11)'); D('sim(1)')
x,z,h,tx,tz,th=(-380,385,6,-470,330,4)
D(f"free({x/150},{-z/150},{h},{tx/150},{-tz/150},{th})"); D('sim(1)'); pg.wait_for_timeout(1500); D('sim(1)'); pg.wait_for_timeout(700)
js='''(()=>{const T=__KINMEN__._T,scene=__KINMEN__._scene,camera=__KINMEN__._cam;const by={};const L0=new T.Layers();const fr=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
scene.traverseVisible(o=>{if(!o.isMesh&&!o.isLine&&!o.isPoints)return;let vis=true;for(let p=o;p;p=p.parent)if(!p.visible)vis=false;if(!vis||!o.layers.test(L0))return;const g=o.geometry;if(!g)return;let t=(g.index?g.index.count:g.attributes.position.count)/3;if(o.isInstancedMesh)t*=o.count;if(o.isInstancedMesh&&!o.boundingSphere)o.computeBoundingSphere();if(!g.boundingSphere)g.computeBoundingSphere();const sp=(o.isInstancedMesh?o.boundingSphere:g.boundingSphere).clone().applyMatrix4(o.matrixWorld);if(o.frustumCulled&&!fr.intersectsSphere(sp))return;
let top=o;while(top.parent&&top.parent!==scene)top=top.parent;const m=Array.isArray(o.material)?o.material[0]:o.material;
const k=o.isInstancedMesh?'B:'+o.name:(top.isMesh?'M:'+top.geometry.type+'/'+m.type.replace('Mesh','').replace('Material','')+(m.map?'+map':'')+(m.transparent?'+tr':'')+'/'+(top.name||''):'G:'+(top.userData.model||top.userData.vtype||top.name||('n'+top.children.length)));
const e=by[k]||(by[k]={n:0,t:0});e.n++;e.t+=t;});
return Object.entries(by).sort((a,b)=>b[1].n-a[1].n).map(([k,v])=>v.n+' '+k+' '+Math.round(v.t/1000)+'k');})()'''
r=K(js); print(len(r)); print('\n'.join(r))
