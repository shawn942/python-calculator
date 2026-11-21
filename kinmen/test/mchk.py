D=lambda js: K('__KINMEN__.'+js)
D('teleport("jincheng")'); D('sim(20)'); D('setTime(20)'); D('sim(10)')
import json as _j; print(_j.dumps(D('mergeCheck()'),ensure_ascii=False)[:600]); print(_j.dumps(D('mergeInfo()'),ensure_ascii=False))
