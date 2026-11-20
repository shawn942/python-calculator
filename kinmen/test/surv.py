D=lambda js: K('__KINMEN__.'+js)
S=lambda: {k:(round(v,2) if isinstance(v,float) else v) for k,v in D('surv()').items() if k in ('on','goal','hours','hunger','stash','money','day')}
D('sim(0.5)'); m0=D('surv()')['money']; D('survStart(24)'); print('start', S())
t0=K('__KINMEN__.surv().last'); D('sim(20)'); print('after sim20', S())
pg.wait_for_timeout(4000); D('sim(1)'); print('after wait', S())
D('survEat(-200)'); D('sim(6)'); print('starving hp', K('__KINMEN__.hp ? __KINMEN__.hp() : null'), S())
D('survEat(50)'); D('survSet(23.999)'); D('sim(30)'); pg.wait_for_timeout(3000); D('sim(2)'); s=S(); print('win?', s, 'expected money', m0+15000)
print('hud', pg.evaluate("document.getElementById('surv').style.display"), 'saved', pg.evaluate("localStorage.getItem('kinmen_surv')"), 'best', pg.evaluate("localStorage.getItem('kinmen_surv_best')"))
# 100 小時版：追緝升級、陣亡失敗歸還
D('survStart(100)'); D('survSet(23.99)'); D('sim(30)'); pg.wait_for_timeout(3000); D('sim(2)'); print('day2', S(), 'stars', K('document.querySelectorAll("#stars .on").length'))
pg.screenshot(path=out+'/surv.png')
D('survEat(-200)'); 
for i in range(12): D('sim(8)')
print('fail?', S())
