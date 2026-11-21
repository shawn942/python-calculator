#!/bin/bash
# 用法：bash tools/deploy.sh "提交說明"
# 從 kinmen-src 分支的 clone 執行：建置 → 部署線上版（gh-pages）→ 提交原始碼（kinmen-src）。
# 目錄：SRC = kinmen-src 的 clone（預設為本腳本的上一層）；GH = gh-pages 的 clone（沒有就自動 clone）。
set -e; MSG="$1"; [ -z "$MSG" ] && { echo '需要提交說明'; exit 1; }
SRC=$(cd "$(dirname "$0")/.." && pwd); GH=${GH:-/home/claude/ghp}; URL=https://github.com/shawn942/python-calculator
TRAILER="${TRAILER:-}"
[ -d "$GH/.git" ] || git clone --depth 1 --branch gh-pages $URL "$GH"
cd "$SRC/kinmen" && bash build.sh
D="$SRC/kinmen/dist"
cp "$D/game.js" "$D/dem.png" "$D/lu.png" "$GH/"; cp -r "$D/tex" "$D/cars" "$D/chars" "$GH/"; cp "$SRC/pwa/"* "$GH/"
python3 - "$GH" <<'PY'
import re,time,os,sys
g=sys.argv[1]; p=g+'/sw.js'; s=open(p).read(); s=re.sub(r"const C = 'wudao-\d+'","const C = 'wudao-%d'"%int(time.time()),s)
for d in ('tex','cars','chars'):
  for f in sorted(os.listdir(g+'/'+d)):
    k="'./%s/%s'"%(d,f)
    if k not in s: s=s.replace("'./game.js',","'./game.js', "+k+",",1)
open(p,'w').write(s); open(sys.argv[1]+'/../.swver','w').write(re.search(r"wudao-\d+",s).group(0))
PY
cp "$GH/sw.js" "$SRC/pwa/sw.js"
cd "$GH"; git add -A; git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "$MSG${TRAILER:+

$TRAILER}" || true; git -c push.negotiate=true push origin gh-pages 2>&1 | tail -1
cd "$SRC"; git add -A; git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "$MSG${TRAILER:+

$TRAILER}" || true; git -c push.negotiate=true push origin kinmen-src 2>&1 | tail -1
V=$(cat "$GH/../.swver"); echo "部署版本 $V"
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do sleep 15; if curl -s "$URL" >/dev/null 2>&1; then :; fi; L=$(curl -s "https://shawn942.github.io/python-calculator/sw.js?$RANDOM" | grep -o "wudao-[0-9]*"); echo "線上 $L"; [ "$L" = "$V" ] && { echo '線上已更新'; exit 0; }; done; echo '線上還沒更新（GitHub Pages 有時要多等一下）'
