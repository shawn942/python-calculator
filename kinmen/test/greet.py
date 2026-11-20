D=lambda js: K('__KINMEN__.'+js)
P={p[0]:p for p in K('__KINMEN__.placesAll()')}; _,x,z,r=P['模範街']
D(f"goto({x/150},{-z/150})") if False else None
D("actGo('迎城隍')"); D('sim(2)')
for k in range(3):
  print(D('pedGo()')); D('sim(0.1)'); pg.keyboard.press('KeyE'); D('sim(0.3)'); print(K("[...document.querySelectorAll('div')].filter(d=>d.innerText && d.innerText.includes('路人')).map(d=>d.innerText).slice(-1)[0]"))
