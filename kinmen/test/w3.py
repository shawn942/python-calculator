S=lambda: K('__KINMEN__.state()')
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/w3_{n}.png')
K("__KINMEN__.teleport('shamei')"); K('__KINMEN__.setTime(14)')
for i,n in [(2,'rain'),(3,'fog'),(1,'cloudy')]:
  K(f'__KINMEN__.weather({i})'); K('__KINMEN__.sim(16)'); print(n,K('__KINMEN__.wk()')['far']); shot(n)
K('__KINMEN__.weather(0)'); K('__KINMEN__.sim(16)')
print(' go',K('__KINMEN__.storyGo()')); K('__KINMEN__.sim(0.2)'); shot('talk')
K('__KINMEN__.skipTalk()')
# close-up of people
K("__KINMEN__.teleport('jincheng')"); K('__KINMEN__.setTime(11)'); K('__KINMEN__.sim(8)')
K("(()=>{const s=__KINMEN__.state();__KINMEN__.free((s.x+3.2)/150,-(s.z+2)/150,1.6,s.x/150,-s.z/150,1.2)})()"); pg.wait_for_timeout(300); shot('closeup'); K('__KINMEN__.free(null)')
