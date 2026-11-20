import os
pg.keyboard.press('KeyM'); pg.wait_for_timeout(1200); pg.screenshot(path=out+'/map_'+os.environ.get('TAG','x')+'.png', clip={'x':280,'y':40,'width':720,'height':640})
