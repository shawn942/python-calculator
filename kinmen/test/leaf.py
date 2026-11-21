D=lambda js: K('__KINMEN__.'+js)
D('wx(0)'); D('setTime(11)'); D('teleport("nqu")'); D('sim(3)')
print(K('''(()=>{const T=__KINMEN__._T,sc=__KINMEN__._scene,c=__KINMEN__._cam.position;const M=new T.Matrix4(),v=new T.Vector3();let best=[];for(const o of sc.children){if(!o.isInstancedMesh||!/^nat_(round|tall|wide)/.test(o.name))continue;for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);v.setFromMatrixPosition(M);const d=Math.hypot(v.x-c.x,v.z-c.z);best.push([d,v.x,v.y,v.z,M.elements[5]]);}}best.sort((a,b)=>a[0]-b[0]);return best.slice(0,3).map(b=>b.map(x=>+x.toFixed(1)))})()'''))
t=K('''(()=>{const T=__KINMEN__._T,sc=__KINMEN__._scene,c=__KINMEN__._cam.position;const M=new T.Matrix4(),v=new T.Vector3();let b=null,bd=1e9;for(const o of sc.children){if(!o.isInstancedMesh||!/^nat_(round|tall|wide)/.test(o.name))continue;for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);v.setFromMatrixPosition(M);const d=Math.hypot(v.x-c.x,v.z-c.z);if(d<bd){bd=d;b=[v.x,v.y,v.z,M.elements[5]];}}}return b})()''')
x,y,z,h=t
for i,(dx,dz,dy,hh) in enumerate([(9,4,4,0.6),(14,0,1.6,0.6),(5,-3,-1,0.9)]):
  D(f"free({(x+dx)/150},{-(z+dz)/150},{y+h*hh+dy},{x/150},{-z/150},{y+h*0.65})"); D('sim(1)'); pg.wait_for_timeout(1200); pg.screenshot(path=out+f'/leaf{i}.png')
