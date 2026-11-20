r=pg.evaluate("""()=>{const K=window.__KINMEN__; return K.auditEdges? K.auditEdges():null}""")
for x in r: print(x)
