/* =====================================================================
   可走進去參觀的古蹟：瓊林蔡氏家廟、山后民俗文化村海珠堂
   ===================================================================== */
const HERITAGE = [];
function heritageTalk(H) { const i = H.i % H.lines.length; H.i++; subtitle(`<b>導覽・${H.name}</b>（${i + 1}/${H.lines.length}）<br>${H.lines[i]}`, 9); if (!H.seen) { H.seen = true; addMoney(150); toast(`第一次參觀 ${H.name}，獲得 $150 文化體驗金`); } }
function heritageHall(lat, lon, name, sign, w, d, lines, decorate) {
  const R = shellRoom(lat, lon, name, 'heritage', w, d, 1, '#b8573a', '#efe2c8', '#7b5a3c', sign, '#7a1f17', null, { trad: true }); if (!R) return null;
  const bk = -d / 2 + 0.9;
  rb(R, 0, bk + 0.5, Math.min(7, w - 3), 1.05, 1.3, '#6b2a1a');                         // 供桌
  rb(R, 0, bk - 0.1, Math.min(6, w - 4), 2.4, 0.5, '#3d1a10', true, 1.05);               // 神龕
  for (let k = -5; k <= 5; k++) rb(R, k * 0.48, bk + 0.2, 0.26, 0.62 + (k % 2 ? 0 : 0.14), 0.06, '#d8b45a', false, 1.35);   // 神主牌
  rb(R, 0, bk + 0.6, 0.55, 0.32, 0.55, '#b8862b', false, 1.05);                          // 香爐
  for (const sx of [-1, 1]) { rb(R, sx * (w / 2 - 2.2), -d / 4, 0.5, 3.9, 0.5, '#9e2a1c'); rb(R, sx * (w / 2 - 2.2), d / 5, 0.5, 3.9, 0.5, '#9e2a1c'); }
  for (const sx of [-2.6, 2.6]) rb(R, sx, bk + 1.6, 0.5, 0.6, 0.5, '#c0392b', false, 3.0);  // 燈籠
  rb(R, 0, d / 2 - 2.6, w - 3, 0.04, 2.4, '#a9442f', false, 0.02);                      // 紅地毯
  decorate && decorate(R, bk);
  const H = { name, R, lines, i: 0, seen: false }; HERITAGE.push(H);
  rnpc(R, w / 2 - 2.0, bk + 3.0, -0.6, { shirt: '#5b5b5b', pants: '#3a3a3a', hair: '#9a9a9a', jacket: null, longSleeve: true, female: false }, 'guide');
  act(R, w / 2 - 2.6, bk + 3.6, 2.2, () => '🗣 聽導覽', () => heritageTalk(H));
  act(R, 0, bk + 1.8, 1.8, () => '🙏 上香', () => { if (game.time - (H.incense || -1e9) < 60) { toast('剛上過香了'); return; } H.incense = game.time; player.hp = 100; sfx('chime', 0.4); toast('上香祈福：生命回滿'); });
  return R;
}
function buildHeritage() {
  buildChenYanglou(); buildJinshuiSchool();
  heritageHall(24.4552, 118.3727, '瓊林蔡氏家廟', '蔡氏家廟', 13, 15, [
    '瓊林是金門最有名的蔡氏聚落，舊名「平林」。明代村裡出了好幾位進士和官員，相傳後來由皇帝賜名「瓊林」。',
    '村子裡有「七座八祠」，一個村就有八座祠堂，這裡的蔡氏家廟是國定古蹟。',
    '祠堂正中的神龕供奉蔡氏歷代祖先牌位，每年春、秋都會舉行隆重的祭祖儀式。',
    '村口還有一座「一門三節坊」，表揚蔡家三位守節的婦女，也是金門重要的石牌坊。',
    '瓊林地下還有戰地時期挖的民防坑道，戰時全村都能躲進地道裡。'
  ], (R, bk) => { rsign(R, '瓊林家廟', 0.6, 0, bk + 0.46, 3.55, { color: '#ffd23f', bg: '#1d1d1d', size: 72, pad: 10 }); for (const sx of [-1, 1]) rsign(R, sx < 0 ? '祖德流芳' : '宗功浩大', 2.0, sx * 3.6, bk - 0.32, 1.5, { color: '#1d1d1d', bg: '#c0392b', size: 64, pad: 6, vertical: true }); });
  heritageHall(24.5036, 118.4405, '山后民俗文化村・海珠堂', '海珠堂', 12, 13, [
    '山后中堡是清朝光緒年間，旅日商人王國珍、王敬祥父子出錢興建的聚落，一共 18 棟閩南二落大厝。',
    '整個聚落前後蓋了二十多年才完成，房子排列整齊，是金門保存最完整的傳統建築群之一。',
    '這棟「海珠堂」以前是村裡的私塾，讓王家子弟和村裡的小孩讀書。',
    '現在這裡是民俗文化村，屋裡展示早年金門人的生活用品、婚嫁禮俗和農具。',
    '仔細看屋脊兩端翹起的「燕尾」，這是閩南建築的特色，以前只有家裡出過功名的人家才能用。'
  ], (R, bk) => { rsign(R, '海珠堂', 0.6, 0, bk + 0.46, 3.55, { color: '#ffd23f', bg: '#1d1d1d', size: 72, pad: 10 }); for (let k = -1; k <= 1; k++) { rb(R, k * 2.4, 1.0, 1.6, 0.75, 0.6, '#7a5230'); rb(R, k * 2.4, 1.8, 1.4, 0.45, 0.4, '#7a5230'); } rb(R, -(12 / 2 - 1.0), -1.5, 0.6, 1.6, 3.2, '#5d4030'); rb(R, -(12 / 2 - 1.0), -1.5, 0.4, 0.5, 0.4, '#c9b28a', false, 1.6); });
}
/* 陳景蘭洋樓：金門最大的洋樓，改成可進入的展示館 */
function buildChenYanglou() {
  if (!USE_OSM) return;
  const s0 = spot(24.43722, 118.39008, 13); if (!s0) return; const gx = sdAt(s0.x + 20, s0.z) - sdAt(s0.x - 20, s0.z), gz = sdAt(s0.x, s0.z + 20) - sdAt(s0.x, s0.z - 20); // 往海的方向＝離岸距離遞減的方向
  const at = { x: s0.x, z: s0.z, rot: Math.hypot(gx, gz) > 0.5 ? Math.atan2(-gx, -gz) : s0.rot };
  const R = shellRoom(24.43722, 118.39008, '陳景蘭洋樓', 'heritage', 22, 12, 2, '#efe6cf', '#f4efe2', '#9c8a6e', '陳景蘭洋樓', '#6d5a3a', at, { western: true }); if (!R) return;
  const bk = -12 / 2 + 0.6;
  for (const x of [-7.5, -2.5, 2.5, 7.5]) { rb(R, x, bk + 0.3, 3.6, 2.6, 0.2, '#5a4632', false, 0.4); rb(R, x, bk + 0.42, 3.2, 2.2, 0.04, '#e9e1cc', false, 0.6); }    // 展板
  for (const x of [-6, 0, 6]) { rb(R, x, 0.5, 2.4, 0.9, 1.2, '#4a3a2a'); rb(R, x, 0.5, 2.2, 0.6, 1.0, '#bcd6df', false, 0.9); rb(R, x, 0.5, 0.5, 0.35, 0.4, '#b8862b', false, 0.92); }  // 展示櫃
  rb(R, -9.5, 3.2, 0.6, 1.0, 0.6, '#2e5e3e'); rb(R, 9.5, 3.2, 0.6, 1.0, 0.6, '#2e5e3e');
  rsign(R, '陳景蘭洋樓　展示館', 0.55, 0, bk + 0.55, 3.35, { color: '#3b2a1a', bg: '#e8dcc2', size: 64, pad: 8 });
  const H = { name: '陳景蘭洋樓', R, i: 0, seen: false, lines: [
    '陳景蘭洋樓位在金湖鎮成功村，是旅居南洋的僑商陳景蘭在 1920 年代蓋的，是金門規模最大的洋樓。',
    '正面整排的拱廊和白色柱子是典型的「五腳基」外廊式洋樓，融合了西洋和閩南建築的特色。',
    '洋樓後來被拿來當學校使用，戰地時期也曾被軍方徵用。',
    '現在由金門國家公園修復，開放成展示館，介紹僑鄉文化和洋樓的歷史。',
    '金門有很多洋樓，都是早年到南洋打拚的金門人「落番」賺錢後回鄉蓋的。'
  ] }; HERITAGE.push(H);
  rnpc(R, 8.5, -1.5, -0.6, { shirt: '#3d5a80', pants: '#2b3240', hair: '#3a2a1a', jacket: null, longSleeve: true, female: true }, 'guide');
  act(R, 7.8, -0.8, 2.2, () => '🗣 聽導覽', () => heritageTalk(H));
  // 二樓外廊陽台：從室內樓梯上去，可以看海
  const w = 22, d = 12, by = R.Y + R.H + 0.35, q = R.L(0, d / 2 + 1.4); addDeck(q.x, q.z, w / 2, 1.35, R.rot, by);
  rb(R, -w / 2 + 1.2, -2.5, 1.6, 2.2, 3.0, '#7a5a3a'); for (let k = 0; k < 6; k++) rb(R, -w / 2 + 1.2, -1.2 + k * 0.45, 1.6, 0.15, 0.4, '#5a4030', false, 0.3 + k * 0.4);
  const n = 22; for (let i = 0; i <= n; i++) { const o = (i / n - 0.5) * (w - 0.2), p = R.L(o, d / 2 + 2.75); BT.ccyl.add(MX(p.x, by, p.z, 0, 0.07, 0.95, 0.07), COL.white); } { const p = R.L(0, d / 2 + 2.75); BT.cbox.add(MX(p.x, by + 0.95, p.z, R.rot, w, 0.12, 0.22), COL.white); }
  const up = R.L(-w / 2 + 1.2, -0.4), bal = R.L(-w / 2 + 2.0, d / 2 + 1.4);
  act(R, -w / 2 + 1.2, -0.2, 1.8, () => '⬆ 上二樓陽台', () => fade('上樓……', () => { leaveRoom(); player.pos.set(bal.x, by, bal.z); player.yaw = R.rot; cam.yaw = R.rot; toast('二樓外廊：洋樓面向大海，前方就是成功海灘'); }));
  addAction({ x: bal.x, z: bal.z, r: 1.8, inside: null, label: () => player.pos.y > by - 0.5 ? '⬇ 下樓' : null, fn: () => { if (player.pos.y < by - 0.5) return; fade('下樓……', () => { player.pos.set(up.x, R.Y, up.z); player.inside = R; player.yaw = R.rot + Math.PI; }); } });
}
/* 水頭金水學校：僑匯興學的洋式學校，現為僑鄉文化展示館 */
function buildJinshuiSchool() {
  if (!USE_OSM) return;
  const R = shellRoom(24.4112, 118.2972, '金水學校', 'heritage', 18, 11, 2, '#e9e3d3', '#f3eee2', '#a08b6a', '金水學校', '#2f5d50', null, { western: true }); if (!R) return;
  const bk = -11 / 2 + 0.6;
  for (let r2 = 0; r2 < 3; r2++) for (const x of [-5, -1.5, 2]) { rb(R, x, -1.6 + r2 * 2.0, 1.6, 0.75, 0.6, '#8a6a46'); rb(R, x, -0.9 + r2 * 2.0, 0.5, 0.45, 0.45, '#6a5038'); }   // 舊課桌椅
  rb(R, 0, bk + 0.1, 6, 2.0, 0.08, '#2c3e34', false, 1.0); rb(R, 0, bk + 0.6, 2.0, 0.9, 0.7, '#7a5a3a');          // 黑板、講桌
  rsign(R, '金水國民學校', 0.5, 0, bk + 0.2, 3.35, { color: '#f4efe2', bg: '#2f5d50', size: 64, pad: 8 });
  for (const x of [-8, 8]) { rb(R, x, -1, 0.2, 2.4, 3.2, '#5a4632', false, 0.4); rb(R, x + (x < 0 ? 0.12 : -0.12), -1, 0.04, 2.0, 2.8, '#e9e1cc', false, 0.6); }
  const H = { name: '金水學校', R, i: 0, seen: false, lines: [
    '金水學校是水頭村旅居南洋的僑民在 1930 年代捐錢蓋的洋式學校，讓家鄉的孩子有新式教育可以讀。',
    '當年很多金門人到印尼、新加坡、馬來西亞打拚，賺了錢寄回家鄉蓋房子、辦學校，這就是「僑匯」。',
    '學校建築是中西合璧的洋樓風格，正面有拱廊，中間是大禮堂，兩邊是教室。',
    '現在學校改成展示館，介紹金門人「落番」下南洋的故事和僑鄉的生活。',
    '旁邊的得月樓和水頭的洋樓群，也大多是同一個時期由僑匯興建的。'
  ] }; HERITAGE.push(H);
  rnpc(R, 6.5, 2.5, -2.4, { shirt: '#f4f1ea', pants: '#3a3a3a', hair: '#555', jacket: '#2f5d50', longSleeve: true, female: false }, 'guide');
  act(R, 6.0, 3.0, 2.2, () => '🗣 聽導覽', () => heritageTalk(H));
}
