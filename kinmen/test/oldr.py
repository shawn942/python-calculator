print(K('__KINMEN__.state()')['zone'], K('__KINMEN__.audit()')['roadKm'])
pg.wait_for_timeout(3000)
print(K('game.fps'+'||0') if False else K('__KINMEN__.state()')['fps'])
