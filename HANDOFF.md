# 浯島風雲（網頁版）交接筆記

> 新對話開始時，請 Claude 先讀這份。最後更新：2026-11-21。

## 這是什麼
金門開放世界遊戲的**網頁／手機版**（three.js），跟 Unreal 5 版是兩個不同專案。
- 線上玩：https://shawn942.github.io/python-calculator/
- 程式庫：GitHub `shawn942/python-calculator`
  - `gh-pages` 分支：打包後的線上版（PWA），推上去約 1 分鐘生效
  - `kinmen-src` 分支：**原始碼、工具、App 專案、這份筆記**

## 接手步驟（新對話照做）
1. 加入程式庫（需要推送權限），clone 下來，切到 `kinmen-src` 分支。
2. `cd kinmen && npm install`（esbuild、three）
3. `bash build.sh` → 產生 `dist/game.js`
4. 測試需要 Playwright＋Chrome（SwiftShader 軟體繪圖，FPS 數字不準，約 3 秒一格）：
   `python3 test/run.py reg`（回歸）、`python3 test/run_touch.py`（觸控）、`python3 test/run.py full`（12 章劇情，約 20 分鐘）
   - 測試指令碼裡寫死了 `/home/claude/kinmen` 路徑，clone 到別處要改。
5. 部署：
   - 把 `dist/` 的 `game.js`、`tex/`、`cars/`、`chars/`、`dem.png`、`lu.png` 和 `pwa/`（index.html、manifest.json、sw.js、icon）一起放到 `gh-pages` 分支。
   - **每次部署都要改 `sw.js` 裡的 `const C = 'wudao-<時間戳>'`**，不然玩家手機會一直讀舊版快取。
   - 新增檔案要加進 `sw.js` 的 FILES 清單。
   - commit 結尾加署名行，`git -c push.negotiate=true push`。
   - 部署後用 curl 確認線上 `sw.js` 的版本號已更新。

## 資料夾
| 路徑 | 內容 |
|---|---|
| `kinmen/src/` | 30 個原始碼檔，`build.sh` 依固定順序串接後用 esbuild 打包 |
| `kinmen/dist/` | 開發用網頁＋素材（貼圖、車輛、人物模型、地形） |
| `kinmen/test/` | 測試指令碼（Playwright） |
| `kinmen/data/` | 鄉鎮、地名資料 |
| `tools/osm/` | OpenStreetMap 轉遊戲資料的產生器（原始 OSM 圖磚沒上傳，需重新從 api.openstreetmap.org 抓到 `/tmp/osm`） |
| `tools/gltf/` | 模型轉換（glb→glTF JSON、OBJ→glTF、模型簡化） |
| `pwa/` | 線上版的 index.html、manifest、service worker、圖示 |
| `app/` | Capacitor App 專案（Android＋iOS），`www/` 要從 dist 複製 |

### 重要原始碼檔
- `00_core` 核心、`02_phototex` 實拍材質載入、`06_osmroads` 道路／湖泊／地名資料（產生的）
- `10_terrain` 地形、道路網、湖泊、`20_world` 村莊與建築（含 `roadFit` 防壓路、金門大學）
- `30_entities` 車輛物理（含自動脫困）、`33_cars` 車輛模型、`34_nature` 樹
- `38_story` 劇情（12 章）、`40_game` 主迴圈、輸入、`44_life` 除錯 API（`window.__KINMEN__`）
- `51_survival` 生存挑戰、`52_touchui` 觸控按鍵＋效能顯示、`53_facades` 立面貼圖（AI 照片＋校舍）

### 生成順序（改 OSM 資料時）
`tools/osm/`：gen.py（道路）→ pl.py（地名）→ busgen.py（公車）→ rb.py（圓環）→ water.py（湖泊）→ poi.py（景點），全部寫進 `src/06_osmroads.js`；landuse.py 產生土地利用圖。

## App 打包
- Android：需要 Android SDK（`/opt/android/sdk`），`cd app && npx cap sync android && cd android && ./gradlew assembleDebug`。Maven 偶爾回 429，等一下重試。
- iOS：`app/ios` 是 Xcode 專案（SPM），要在 Mac 上用 Xcode 打包。iPhone 目前用網頁版加到主畫面。

## 限制與注意
- Claude 上的舊線上版（artifact）已過時，使用者說「更新線上版」才重新發佈；只接受 .png/.json，不接受 .bin/.glb。
- 不能做 Rockstar 商標圖示（已做原創藍底 K 字圖示）。
- 使用者提供的 AI 立面圖已縮成 `dist/tex/f_*.jpg`。

## 目前狀態（2026-11-21）
- 12 章劇情全部通過；回歸、觸控測試無錯誤。
- 最近完成：手機點畫面可推進對話、車輛卡住自動脫困、選單「脫困」「效能顯示」、金門大學依實景重建、池塘、立面輪替。
- **效能量測**：每畫面約 3400 次繪圖、700 萬三角形（含陰影），遠超手機舒適範圍（數百次、一兩百萬）。這是手機卡頓主因。

## 2026-11-21 凌晨這一輪（第 1、2 階段的務實版）
- 部署改用 `tools/deploy.sh "說明"`：一次完成 gh-pages 部署、sw.js 版本號、kinmen-src 同步。
- **效能**（`src/54_cull.js`）：
  - 距離剔除（用 layers，不動 visible）：小物件、樹、招牌、NPC 群組、遠處車輛太遠就不畫。市區繪圖次數約 900 → 380，三角形 240 萬 → 110 萬（電腦高畫質主畫面，不含陰影與後製）。`?nocull` 可關閉比較。
  - 地形切成 48 格一塊（共用頂點），可被視錐剔除；整塊深海不建。
  - 自動解析度（`autoRes`）：FPS < 27 連續 3 秒降解析度（最低 0.55 倍），> 50 連續 8 秒調回。`?nores` 關閉；自動化測試（navigator.webdriver）時不啟用。
  - 招牌：相同文字共用貼圖與材質，上傳顯示卡後釋放畫布（畫布記憶體 110 MB → 約 83 MB）。
  - 樹影代理球改成八面體。
- **卡車問題**：寫了自動試駕（除錯 API `driveBot(秒, 種子, 最高速, 晃動)` 沿路開、`offroadBot(秒, 種子)` 越野），沿路 50 多公里只卡 2～3 次（撞到停放車輛）。找到並修掉：
  - 金門大橋邊緣車身翻成直立卡住 → 加橋上護欄（`bridgeRail`）＋車身傾斜上限。
  - 車輛會被路燈、號誌、招牌細桿卡住 → 車輛忽略細桿碰撞（`resolveCircle` 第三參數）。
  - 夾在兩棟房子之間前後都動不了 → 靠 3 秒自動脫困拉回路上。
- **沒有換 Rapier**：試駕結果顯示現有物理在路上是健康的，問題出在特定障礙物；整個換掉會動到 AI 車流與 12 章任務，風險高、又無法用真機驗證手感，所以先做針對性修正。
- 路肩邊坡（road skirts）：路面高於旁邊地面時補斜坡，斷頭路盡頭也補。
- 沒做：模組化重寫、KTX2（環境沒有編碼器）、分區串流。
- 除錯 API 新增：`sceneProf()`、`groupProf()`、`texMem()`、`cullNow()`、`meshKinds()`、`skirts()`。

## 已知問題
- 浮空路段（使用者截圖，位置未知，等使用者提供地圖位置）。
- 淺水區看起來像走在水面上。
- 宿舍牆面仍是共用公寓立面。
- 「踩油門不動 3 秒自動脫困」沒能在測試中重現撞牆情境，未實測。

## 下一步：以《臺北狂飆》為參考的計畫
參考 https://www.taipei-rush.app/（three.js r186）：BatchedMesh 合併繪圖＋街區貼圖集、KTX2 壓縮貼圖、Web Worker 建城、分區串流、CSM 陰影、後製、護照收集系統。**只學做法，不抄程式和素材。**

| 階段 | 內容 | 建議模型 |
|---|---|---|
| 0 | 使用者選美術風格：A 風格化／B 半寫實（先做兩張示範截圖） | Opus |
| 1 | 模組化架構、KTX2、同區合併繪圖、樹與路人分級 | Fable |
| 2 | 換 Rapier 物理引擎、機車手感、修浮空路與淺水 | Fable |
| 3 | 分區串流、程式生成村莊街道、地標精修 | Fable＋Opus |
| 4 | 有骨架的人物、更多路人 | Opus |
| 5 | 分層陰影、後製、夜景、雨天反光、水面倒影、自動降畫質 | Opus |
| 6 | 金門護照收集、載入小知識、帳號雲端存檔（Supabase）、多人連線 | Opus |
| 7 | 標題畫面、中英雙語、自訂網域 | Sonnet／Opus |

預估 30～45 輪對話。簡單雜事（改字、重新部署、打包）用 Sonnet 省額度。

## 需要使用者協助
- 現在：選美術風格 A 或 B。
- 第 1 階段後：手機開「效能顯示」玩 5 分鐘，回報 FPS 和手機型號。
- 第 3 階段：地標照片、在地知識（店名、小吃、特產）。
- 第 6 階段：註冊免費 Supabase 帳號。
- 第 7 階段（可選）：購買網域。
- 偶爾：在電腦上開 Claude 桌面版瀏覽器面板（試玩參考遊戲、用 Gemini 生圖需要使用者登入）。
