D=lambda js: K('__KINMEN__.'+js)
for t in [8, 14]:
  D(f'setTime({t})')
  for q in ['廣東粥','閩式燒餅','芋頭冰','蚵仔麵線','蚵嗲']:
    print(t, q, D(f"actGo('{q}')"), D('state()')['money'])
D('sim(0.3)'); pg.screenshot(path=out+'/food.png')
