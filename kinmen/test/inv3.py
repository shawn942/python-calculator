D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(11)'); D('sim(1)')
js='''(()=>{const T=__KINMEN__._T,scene=__KINMEN__._scene;const by={};const bx=new T.Box3(),v=new T.Vector3();
for(const o of scene.children){ if(o.isMesh||o.isLight||!o.children.length)continue; let n=0,t=0,sk=0;const gt={};o.traverse(x=>{if(x.isMesh){n++;if(x.isSkinnedMesh)sk++;const g=x.geometry;t+=(g.index?g.index.count:g.attributes.position.count)/3;gt[g.type.replace('Geometry','')]=(gt[g.type.replace('Geometry','')]||0)+1;}});
 bx.setFromObject(o);const s=bx.getSize(v);const k='n'+n+(sk?'/sk':'')+' sz'+s.x.toFixed(0)+'x'+s.y.toFixed(0)+'x'+s.z.toFixed(0)+' '+Object.entries(gt).map(e=>e[0]+e[1]).join(',')+' ud:'+Object.keys(o.userData).filter(k=>k!='_c').join(',')+(o.visible?'':' HID');
 const e=by[k]||(by[k]={c:0,t:0,p:[Math.round(o.position.x),Math.round(o.position.z)]});e.c++;e.t+=t;}
return Object.entries(by).sort((a,b)=>b[1].c-a[1].c).slice(0,45).map(([k,v])=>v.c+'  '+k+'  tris'+Math.round(v.t)+' @'+v.p);})()'''
r=K(js); print('\n'.join(r))
