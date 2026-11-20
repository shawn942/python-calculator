import time
D=lambda js: K('__KINMEN__.'+js)
D('sim(0.5)')
# 實際渲染時間：用 rAF 量 6 幀
js="new Promise(r=>{let n=0,t0=performance.now();const f=()=>{if(++n>=6)r((performance.now()-t0)/6);else requestAnimationFrame(f)};requestAnimationFrame(f)})"
print('frame ms home', round(pg.evaluate(js)))
D("actGo('租腳踏車')"); D('sim(0.5)'); print('frame ms forest', round(pg.evaluate(js)))
