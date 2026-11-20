import time
D=lambda js: K('__KINMEN__.'+js)
fr=lambda: K('''new Promise(r=>{let n=0;const t=performance.now();const f=()=>{n++; if(n<5) requestAnimationFrame(f); else r(Math.round((performance.now()-t)/5));};requestAnimationFrame(f);})''')
print('closed frame ms', fr(), flush=True)
K("document.getElementById('bigmap').classList.add('show')")
print('overlay only frame ms', fr(), flush=True)
K("document.getElementById('bigmap').classList.remove('show')")
pg.keyboard.press('KeyM'); print('open frame ms', fr(), flush=True)
print(K("[document.getElementById('bigcv').width, document.getElementById('bigcv').height]"))
