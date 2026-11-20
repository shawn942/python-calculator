def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/w4_{n}.png')
K("__KINMEN__.teleport('shamei')"); K('__KINMEN__.setTime(14)')
for i,n in [(2,'rain'),(3,'fog')]:
  K(f'__KINMEN__.weather({i})'); K('__KINMEN__.sim(20)'); shot(n)
K('__KINMEN__.weather(0)'); K('__KINMEN__.sim(20)')
def fshot(name,la,lo,cla,clo,h,th,tod=11):
    K(f"(()=>{{const a=__KINMEN__.ll({la},{lo}),c=__KINMEN__.ll({cla},{clo});__KINMEN__.goto(a[0],a[1],0);__KINMEN__.setTime({tod});__KINMEN__.sim(3);__KINMEN__.free(c[0],c[1],{h},a[0],a[1],{th});}})()"); shot(name)
fshot('qionglin',24.4560,118.3728,24.4548,118.3745,22,2)
fshot('shuitou',24.4100,118.2990,24.4112,118.3005,20,4)
K('__KINMEN__.free(null)')
