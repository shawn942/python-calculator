D=lambda js: K('__KINMEN__.'+js)
m0=D('state()')['money']; print(D("actGo('貢糖 DIY')")); D('sim(0.2)')
for i in range(3):
  D('sim(0.37)'); print(D("actGo('搥')"))
print(m0, '->', D('state()')['money'])
