D=lambda js: K('__KINMEN__.'+js)
D('teleport("jincheng")'); D('setTime(11)'); D('sim(3)')
fr=lambda: K('''new Promise(r=>{let n=0;const t=performance.now();const f=()=>{n++; if(n<4) requestAnimationFrame(f); else r(Math.round((performance.now()-t)/4));};requestAnimationFrame(f);})''')
print('frame_ms', fr(), 'meshes', D('meshes()')['all'])
