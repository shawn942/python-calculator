S=lambda: K('__KINMEN__.state()'); T=lambda: K('__KINMEN__.story()')
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/s_{n}.png')
print('--- ch1'); print(' go',K('__KINMEN__.storyGo()'), T()); K('__KINMEN__.sim(0.3)'); shot('ch1_talk'); K('__KINMEN__.skipTalk()'); print(' after talk',T())
g=K('__KINMEN__.dbg()')['target']; K(f"__KINMEN__.goto({g['x']/150},{-g['z']/150},0)"); K('__KINMEN__.sim(0.5)'); print(' ',T()); g=K('__KINMEN__.dbg()')['target']; K(f"__KINMEN__.goto({(g['x']+2)/150},{-(g['z']+2)/150},0)"); K('__KINMEN__.sim(0.5)'); print(' ',T()); K('__KINMEN__.skipTalk()'); K('__KINMEN__.sim(0.5)'); print(' done',T(),S()['money'])
print('--- ch2'); K('__KINMEN__.sim(4)'); print(' go',K('__KINMEN__.storyGo()')); K('__KINMEN__.skipTalk()'); K('__KINMEN__.sim(0.3)'); print(' ',T(), 'weapon pistol?'); print(' enter',K('__KINMEN__.enterNearest()'))
sy=K("(()=>{const n=__KINMEN__.dbg().target;return n})()"); 
# warp truck near SY to trigger thugs, then to LL
K("(()=>{const s=__KINMEN__.ll(24.4372,118.3690);__KINMEN__.warpVeh(s[0]*150,-s[1]*150)})()"); K('__KINMEN__.sim(2)'); print(' thugs?',T(),'police veh',S()['police'],'stars',S()['stars']); shot('ch2_chase')
g=K('__KINMEN__.dbg()')['target']; K(f"__KINMEN__.warpVeh({g['x']+2},{g['z']+2})"); K('__KINMEN__.sim(1)'); print(' done',T(),S()['money'],'police',S()['police'])
print('--- ch3'); K("__KINMEN__.key('KeyF',true)");K("__KINMEN__.key('KeyF',false)"); K('__KINMEN__.sim(4)'); print(' go',K('__KINMEN__.storyGo()')); K('__KINMEN__.skipTalk()'); g=K('__KINMEN__.dbg()')['target']; K(f"__KINMEN__.goto({(g['x']+12)/150},{-(g['z']+12)/150},0)"); K('__KINMEN__.sim(3)'); print(' ',T(),'hp',S()['hp'],'stars',S()['stars']); shot('ch3_fight'); K('__KINMEN__.killThugs()'); K('__KINMEN__.sim(0.5)'); print(' killed',T(),'stars',S()['stars'])
g=K('__KINMEN__.dbg()')['target']; K(f"__KINMEN__.goto({(g['x']+2)/150},{-(g['z']+2)/150},0)"); K('__KINMEN__.sim(0.5)'); K('__KINMEN__.skipTalk()'); K('__KINMEN__.sim(0.5)'); print(' done',T())
print('--- ch4'); K('__KINMEN__.sim(4)'); print(' go',K('__KINMEN__.storyGo()')); K('__KINMEN__.skipTalk()'); print(' ',T())
K('__KINMEN__.setCh(4)'); print('--- ch5'); print(' go',K('__KINMEN__.storyGo()')); K('__KINMEN__.skipTalk()'); g=K('__KINMEN__.dbg()')['target']; K(f"__KINMEN__.goto({(g['x'])/150},{-(g['z'])/150},0)"); K('__KINMEN__.sim(2)'); print(' ',T(),'hp',S()['hp']); shot('ch5_fight'); K('__KINMEN__.killThugs()'); K('__KINMEN__.sim(0.5)'); print(' ',T()); shot('ch5_end'); K('__KINMEN__.skipTalk()'); K('__KINMEN__.sim(0.5)'); print(' end',T(),S()['money'])
print('--- weather'); K('__KINMEN__.weather(2)'); pg.wait_for_timeout(9000); shot('rain'); K('__KINMEN__.weather(3)'); pg.wait_for_timeout(9000); shot('fog'); K('__KINMEN__.weather(0)')
