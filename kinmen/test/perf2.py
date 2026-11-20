D=lambda js: K('__KINMEN__.'+js)
S=lambda: K('__KINMEN__.state()')
def meas(tag):
  D('sim(2)'); pg.wait_for_timeout(2500); s=S(); print('perf', tag, s.get('fps'), flush=True)
D('season(3)'); D('setTime(17.6)'); D("actGo('鸕鶿')"); meas('慈湖鸕鶿黃昏')
D('setTime(10)'); D("actGo('租腳踏車')"); meas('中山紀念林')
D("actGo('迎城隍')"); D('sim(20)'); D('procFollow()'); meas('迎城隍')
D('season(1)'); D('setTime(9)'); D("actGo('拍栗喉蜂虎')"); meas('蜂虎')
