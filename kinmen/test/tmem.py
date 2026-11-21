import json
D=lambda js: K('__KINMEN__.'+js)
D('teleport("jincheng")'); D('sim(3)'); pg.wait_for_timeout(1500)
print('renderer textures', K('__KINMEN__._ri()'), json.dumps(D('mergeInfo()'),ensure_ascii=False))
