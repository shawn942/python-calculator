js='''(()=>{const cx=-400,cz=370,R=220,o={};const bx=new __KINMEN__._T.Box3(),c=new __KINMEN__._T.Vector3();
for(const ch of __KINMEN__._scene.children){ if(ch.isInstancedMesh){continue;} bx.setFromObject(ch); if(bx.isEmpty())continue; bx.getCenter(c); if(Math.hypot(c.x-cx,c.z-cz)>R)continue; const sz=bx.getSize(new __KINMEN__._T.Vector3()).length();
 let n=0,t=0,mats=new Set(); ch.traverse(x=>{if(x.isMesh){n++;const m=x.material;const ms=Array.isArray(m)?m:[m];for(const q of ms)mats.add(q.type.replace('Mesh','').replace('Material','')+(q.map?'+map':'')+(q.transparent?'+tr':'')+(q.alphaTest?'+at':'')+(q.emissiveMap?'+em':'')+(q.side==2?'+ds':'')+(q.vertexColors?'+vc':''));}});
 const k=(ch.isMesh?'M:':ch.type+':')+(ch.isMesh?ch.geometry.type:'')+'|n'+n+'|'+[...mats].sort().join(',')+'|ud:'+Object.keys(ch.userData).filter(k=>k!='_c').join(',')+'|nm:'+ch.name+'|sz'+(sz<3?'<3':sz<12?'<12':sz<50?'<50':'big')+(ch.visible?'':'|HID')+(ch.castShadow?'|cs':'');
 o[k]=(o[k]||0)+1;}
return Object.entries(o).sort((a,b)=>b[1]-a[1]).map(e=>e[1]+'  '+e[0]);})()'''
r=K(js); print(len(r)); print('\n'.join(r[:120]))
