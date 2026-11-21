D=lambda js: K('__KINMEN__.'+js)
D('teleport("nqu")'); D('sim(1)'); pg.wait_for_timeout(1500)
print(K('''(()=>{const r={};return [__KINMEN__._cullInfo()]})()'''))
