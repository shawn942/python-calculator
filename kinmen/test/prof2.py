K("__KINMEN__.teleport('jincheng')"); K('__KINMEN__.sim(4)')
for q in ['high','mid','low']:
  K(f"__KINMEN__.quality('{q}')"); pg.wait_for_timeout(500); print(q, K('__KINMEN__.prof()')['render'], 'ms')
