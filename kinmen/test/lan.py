D=lambda js: K('__KINMEN__.'+js)
a,b=D('lanAt()'); D('wx(0)'); D('setTime(20.2)')
D(f"free({a[0]/150},{-a[2]/150},2.5,{b[0]/150},{-b[2]/150},4)"); D('sim(1)'); pg.wait_for_timeout(400); pg.screenshot(path=out+'/lan.png')
