#!/bin/bash
# 用法：deploy.sh "提交說明"  → 部署線上版（gh-pages）並同步原始碼（kinmen-src）
set -e; MSG="$1"; D=/home/claude/kinmen/dist; P=/home/claude/kinmen-pwa; R=/home/claude/python-calculator; S=/tmp/srcbr
cp $D/game.js $P/; cp -r $D/tex $D/cars $P/ 2>/dev/null || true
python3 - <<'PY'
import re,time,os
p='/home/claude/kinmen-pwa/sw.js'; s=open(p).read(); s=re.sub(r"const C = 'wudao-\d+'","const C = 'wudao-%d'"%int(time.time()),s)
add=[f for f in sorted(os.listdir('/home/claude/kinmen-pwa/tex')) if ("./tex/"+f+"'") not in s]
if add: s=s.replace("'./tex/roof.jpg',","'./tex/roof.jpg', "+", ".join("'./tex/%s'"%f for f in add)+",",1)
open(p,'w').write(s)
PY
cp -r $P/. $R/; cd $R; git add -A; git commit -qm "$MSG

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UTsfGAB1uthZu57X6ZTjaE" || true; git -c push.negotiate=true push 2>&1 | tail -1
cd /home/claude/kinmen; tar --exclude=./node_modules --exclude=./test/shots --exclude=./build --exclude='*.log' -cf - . | (cd $S/kinmen && tar -xf -); cp $P/sw.js $P/index.html $S/pwa/; cp /home/claude/deploy.sh $S/tools/
cd $S; git add -A; git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "$MSG

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UTsfGAB1uthZu57X6ZTjaE" || true; git -c push.negotiate=true push 2>&1 | tail -1
grep "const C" $P/sw.js
