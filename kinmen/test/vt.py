r=pg.evaluate("""()=>{const o={}; for(const c of window.__KINMEN__.vehTris()) o[c[0]]=c.slice(1); return o}""")
print(r)
