D=lambda js: K('__KINMEN__.'+js)
pg.set_default_timeout(150000)
K("perfToggle()") if False else None
pg.evaluate("localStorage.setItem('kinmen_perf','1')")
pg.reload(); pg.wait_for_function("window.__KINMEN__ && window.__KINMEN__.ready", timeout=300000)
pg.click('#start') if pg.query_selector('#start.show') else None
pg.wait_for_timeout(9000); pg.screenshot(path=out+'/perf.png')
print(pg.evaluate("[...document.querySelectorAll('div')].map(d=>d.textContent).filter(t=>t.startsWith('FPS'))[0]"))
