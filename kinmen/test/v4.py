S=lambda: K('__KINMEN__.state()')
def shot(n): pg.wait_for_timeout(900); pg.screenshot(path=out+f'/v4_{n}.png')
K('__KINMEN__.sim(2)'); shot('hud')
print('--- pause'); K('__KINMEN__.pause(true)'); shot('pause'); print(' quality',K("__KINMEN__.quality('low')"),K("__KINMEN__.quality('high')")); K('__KINMEN__.pause(false)')
print('--- swim'); K("(()=>{const s=__KINMEN__.ll(24.4150,118.3560);__KINMEN__.goto(s[0],s[1],3.14)})()"); K("__KINMEN__.key('KeyW',true)")
for i in range(6):
  K('__KINMEN__.sim(2)'); w=K('__KINMEN__.swim()'); print(' ',w)
  if w['swim']: break
K('__KINMEN__.sim(2)'); K('__KINMEN__.cam(3.14,0.35)'); K('__KINMEN__.sim(0.2)'); shot('swim'); K("__KINMEN__.key('KeyW',false)")
print('--- tank'); print(' enter',K('__KINMEN__.tank()'),'stars',S()['stars'],S()['inVehicle']); K("__KINMEN__.key('KeyW',true)"); K('__KINMEN__.sim(3)'); K("__KINMEN__.key('KeyW',false)"); print(' speed',S()['speed']); K('__KINMEN__.tankFire()'); K('__KINMEN__.sim(0.3)'); shot('tank'); K('__KINMEN__.setWanted(0)')
print('--- vig'); print(' start',K('__KINMEN__.startVig()'),K('__KINMEN__.vig()')); K('__KINMEN__.sim(2)'); m0=S()['money']; K('__KINMEN__.perpHit(120)'); K('__KINMEN__.sim(1)'); print(' after hit',K('__KINMEN__.vig()'),'money+',S()['money']-m0); K('__KINMEN__.sim(3)'); print(' next',K('__KINMEN__.vig()')); K("__KINMEN__.key('KeyT',true)"); K("__KINMEN__.key('KeyT',false)"); print(' off',K('__KINMEN__.vig()'))
print('--- props',K('__KINMEN__.props()')); K('__KINMEN__.money(50000)'); print(' buy',K('__KINMEN__.buyProp(4)'),K('__KINMEN__.props()')[4]); m0=S()['money']; K('__KINMEN__.day()'); K('__KINMEN__.sim(2)'); print(' income',S()['money']-m0); shot('prop')
print('--- cows',K('__KINMEN__.cows()')); 
isl=K('__KINMEN__.islet()'); print(' islet',isl); K('__KINMEN__.setTime(14)'); K('__KINMEN__.sim(1)'); 
K(f"(()=>{{__KINMEN__.goto({isl['x']/150},{-isl['z']/150},0);__KINMEN__.sim(2);__KINMEN__.free({(isl['x']+70)/150},{-(isl['z']+50)/150},40,{isl['x']/150},{-isl['z']/150},0)}})()"); shot('islet'); K('__KINMEN__.free(null)')
