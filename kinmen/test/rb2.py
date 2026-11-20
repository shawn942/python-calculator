D=lambda js: K('__KINMEN__.'+js)
D('setTime(11)'); D('teleport("jincheng")'); D('sim(2)')
mx=0
for i in range(20): D('sim(3)'); mx=max(mx,D('rbInfo()')['circling'])
print('max circling',mx, D('state()')['traffic'])
