#!/bin/bash
set -e
cd "$(dirname "$0")" && mkdir -p build && cat src/00_core.js src/02_phototex.js src/05_data.js src/06_osmroads.js src/10_terrain.js src/20_world.js src/30_entities.js src/31_person.js src/32_rig.js src/33_cars.js src/34_nature.js src/35_combat.js src/36_interiors.js src/37_plane.js src/38_story.js src/39_extras.js src/41_more.js src/42_tunnels.js src/43_look.js src/44_life.js src/45_dadan.js src/46_home.js src/47_ads.js src/48_kinmen.js src/49_roads.js src/50_heritage.js src/51_survival.js src/52_touchui.js src/53_facades.js src/54_cull.js src/40_game.js > build/entry.js
./node_modules/.bin/esbuild build/entry.js --bundle --format=esm --minify --target=es2020 --outfile=dist/game.js --log-level=warning
wc -c dist/game.js
