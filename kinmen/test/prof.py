pg.set_default_timeout(150000)
D=lambda js: K('__KINMEN__.'+js)
D('sim(0.5)'); D("actGo('租腳踏車')"); D('sim(0.5)'); pg.wait_for_timeout(5000); print('hidden', D('cullNow()')); r=D('sceneProf()'); print('town', r['calls'], r['tris'])
[print(' ',x) for x in r['top'][:12]]; print('--'); [print(' ',x) for x in r['topT']]
g=D('groupProf()'); print(g['n'], g['meshes'], 'far', g['far'], g['farMeshes']); [print('  ', x) for x in g['top']]
