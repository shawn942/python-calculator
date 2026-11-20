K("__KINMEN__.teleport('jincheng')"); K('__KINMEN__.sim(4)')
print(K("""(()=>{const f={};const T=(n,fn)=>{const t=performance.now();for(let i=0;i<30;i++)fn();f[n]=+((performance.now()-t)/30).toFixed(2);};
T('stepTotal',()=>__KINMEN__.sim(1/30));
return f;})()"""))
print(K("__KINMEN__.prof()"))
print('boats',K('__KINMEN__.boats()'))
for i in range(4):
  K(f'__KINMEN__.boat({i})'); K("__KINMEN__.key('KeyW',true)"); K('__KINMEN__.sim(3)'); K("__KINMEN__.key('KeyW',false)"); print(' boat',i,K('__KINMEN__.state()')['speed'])
