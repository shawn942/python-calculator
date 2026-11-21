/* =====================================================================
   你家：金寧鄉頂埔下 201 號（一整排 8 間連棟透天厝的其中一間）
   1F 車庫＋客廳＋麻將桌＋廚房＋廁所　2F 兩間房（主臥、書房）
   3F 兩間房（客房、儲藏室＋保險箱）　頂樓平台（樓梯間、水塔、曬衣架、泡茶桌）
   門口有停車場；其他 7 間掛「售」，買下可出租收租金，也能再賣掉
   室內沿用坑道的「傳送進室內」機制（house 類型），進門被通緝也安全
   ===================================================================== */
const HOME_LL = [24.4462, 118.3168];
const ROW_NUMS = [195, 197, 199, 201, 203, 205, 207, 209], MY_IDX = 3;
const myHome = { T: null, ext: null, roofCols: [], body: null, cat: null, mjT: -9 };
let safeMoney = 0; try { safeMoney = +localStorage.getItem('kinmen_safe') || 0; } catch (e) { }
const FLOOR_ORIGIN = n => ({ x: 7700 + (n - 1) * 40, z: 400 });
const mPanel = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4dc, emissiveIntensity: 1.4 });
const mSky = new THREE.MeshStandardMaterial({ color: 0xcfe6f5, emissive: 0xbfdcf0, emissiveIntensity: 0.9 }); mSky.userData.noMerge = true;
const mTV = new THREE.MeshStandardMaterial({ color: 0x223344, emissive: 0x5a8fd6, emissiveIntensity: 0.9 });
const tileTex = canvasTex(128, 128, g => { g.fillStyle = '#e8e1d2'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#c9c0ad'; g.lineWidth = 3; for (let i = 0; i <= 128; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); } }, true);
const woodTex = canvasTex(128, 128, g => { g.fillStyle = '#a77b52'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 128; i += 16) { g.fillStyle = i % 32 ? '#9a7049' : '#b08559'; g.fillRect(0, i, 128, 15); } }, true);
const shutterTex = canvasTex(64, 64, g => { g.fillStyle = '#a3a9ad'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#8a9095'; for (let i = 0; i < 64; i += 6) g.fillRect(0, i, 64, 2); }, true);

function hb(x, y, z, w, h, d, col, rot = 0) { BT.cbox.add(MX(x, y, z, rot, w, h, d), new THREE.Color(col)); }
function hmesh(geo, m, x, y, z, ry = 0) { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.rotation.y = ry; scene.add(me); return me; }
function wallX(o, Y, z, x0, x1, col = '#f3efe6') { const w = x1 - x0, cx = o.x + (x0 + x1) / 2; hb(cx, Y, o.z + z, w, 3.2, 0.14, col); addBox(cx, o.z + z, w / 2, 0.07, 0); }
function wallZ(o, Y, x, z0, z1, col = '#f3efe6') { const d = z1 - z0, cz = o.z + (z0 + z1) / 2; hb(o.x + x, Y, cz, 0.14, 3.2, d, col); addBox(o.x + x, cz, 0.07, d / 2, 0); }
function homeAct(T, x, z, label, fn, r = 1.6) { addAction({ x, z, r, inside: null, tunnel: T, label: typeof label === 'function' ? label : () => label, fn }); }
const ARRIVE = n => ({ x: FLOOR_ORIGIN(n).x - 0.8, z: FLOOR_ORIGIN(n).z - 1.2 });
function floorTp(n) { const T = myHome.T, a = ARRIVE(n); if (game.busy) return; game.busy = true; sfx('door', 0.15); fade(['', '一樓', '二樓', '三樓'][n], () => { player.pos.set(a.x, T.Y, a.z); player.yaw = 0; cam.yaw = 0; cam.pos.set(a.x, T.Y + 1.6, a.z - 2.5); game.busy = false; }); }

/* 每層樓的外殼：地板、外牆（連棟沒有側窗）、天花板、燈、樓梯 */
function buildFloorShell(n, Y) {
  const o = FLOOR_ORIGIN(n), W = 6, D = 14, H = 3.2;
  hb(o.x, Y - 0.4, o.z, W, 0.4, D, '#d8d0c0'); addDeck(o.x, o.z, W / 2, D / 2, 0, Y);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: n === 1 ? tileTex : woodTex, roughness: 0.6 })); fl.material.map = fl.material.map.clone(); fl.material.map.needsUpdate = true; fl.material.map.repeat.set(n === 1 ? 3 : 2, n === 1 ? 7 : 5); fl.rotation.x = -Math.PI / 2; fl.position.set(o.x, Y + 0.01, o.z); fl.receiveShadow = true; scene.add(fl);
  for (const [x, z, w, d] of [[o.x - W / 2 - 0.15, o.z, 0.3, D + 0.6], [o.x + W / 2 + 0.15, o.z, 0.3, D + 0.6], [o.x, o.z - D / 2 - 0.15, W, 0.3], [o.x, o.z + D / 2 + 0.15, W, 0.3]]) { hb(x, Y, z, w, H + 0.2, d, '#f3efe6'); addBox(x, z, w / 2, d / 2, 0); }
  hb(o.x, Y + H, o.z, W + 0.6, 0.3, D + 0.6, '#fbf8f2');
  for (const z of [-5, -1.4, 3.8]) hmesh(new THREE.BoxGeometry(1.1, 0.05, 1.1), mPanel, o.x + 0.8, Y + H - 0.03, o.z + z);
  if (n > 1) { hmesh(new THREE.PlaneGeometry(3.4, 1.5), mSky, o.x + 0.6, Y + 1.6, o.z + D / 2 - 0.01, Math.PI); hmesh(new THREE.PlaneGeometry(2.4, 1.3), mSky, o.x + 0.9, Y + 1.7, o.z - D / 2 + 0.01, 0); }
  for (let k = 0; k < 7; k++) hb(o.x - 2.25, Y, o.z - 1.0 - k * 0.38, 1.3, (k + 1) * 0.42, 0.38, '#cfc6b4');
  hb(o.x - 1.55, Y, o.z - 2.3, 0.06, 1.0, 2.6, '#5b4435'); addBox(o.x - 2.25, o.z - 2.3, 0.7, 1.35, 0);
  return o;
}
/* 二、三樓：中間走廊＋前後兩間房（門口在走廊靠樓梯那側） */
function twoRooms(o, Y, tint) { wallX(o, Y, 1.0, -3, -1.4, tint); wallX(o, Y, 1.0, -0.4, 3, tint); wallX(o, Y, -3.8, -3, -1.4, tint); wallX(o, Y, -3.8, -0.4, 3, tint); hb(o.x - 0.9, Y + 2.2, o.z + 1.0, 1.0, 1.0, 0.14, tint); hb(o.x - 0.9, Y + 2.2, o.z - 3.8, 1.0, 1.0, 0.14, tint); }
function bed(o, Y, x, z, w, col) { hb(o.x + x, Y, o.z + z, w, 0.45, 2.3, '#7a5236'); hb(o.x + x, Y + 0.45, o.z + z, w - 0.1, 0.25, 2.2, '#f4f1ea'); hb(o.x + x, Y + 0.7, o.z + z - 0.35, w - 0.08, 0.1, 1.5, col); hb(o.x + x, Y + 0.7, o.z + z + 0.85, w - 0.5, 0.16, 0.42, '#ffffff'); hb(o.x + x, Y, o.z + z + 1.2, w + 0.1, 1.1, 0.12, '#5b4435'); addBox(o.x + x, o.z + z, w / 2, 1.2, 0); }

function buildHomeInterior(T) {
  const Y = T.Y;
  // ---------- 1F：車庫、客廳、麻將桌、廚房、廁所 ----------
  { const o = buildFloorShell(1, Y);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.8), new THREE.MeshStandardMaterial({ map: shutterTex, roughness: 0.6, metalness: 0.4 })); sh.material.map.repeat.set(1, 6); sh.position.set(o.x - 0.6, Y + 1.4, o.z + 6.98); sh.rotation.y = Math.PI; scene.add(sh);
    hb(o.x + 2.3, Y, o.z + 6.95, 0.95, 2.2, 0.06, '#5a3b28');
    hb(o.x - 1.6, Y, o.z + 5.3, 0.5, 0.6, 1.5, '#c0392b'); hb(o.x - 1.6, Y + 0.6, o.z + 5.0, 0.42, 0.3, 0.7, '#222'); hb(o.x - 1.6, Y + 0.55, o.z + 5.95, 0.5, 0.5, 0.12, '#c0392b'); addBox(o.x - 1.6, o.z + 5.3, 0.3, 0.8, 0);
    // 客廳
    hb(o.x - 2.4, Y, o.z + 2.6, 1.0, 0.45, 3.0, '#6b4a34'); hb(o.x - 2.8, Y + 0.45, o.z + 2.6, 0.3, 0.55, 3.0, '#6b4a34'); addBox(o.x - 2.4, o.z + 2.6, 0.5, 1.5, 0);
    hb(o.x - 1.0, Y, o.z + 2.6, 1.0, 0.42, 1.4, '#7a5236'); addBox(o.x - 1.0, o.z + 2.6, 0.5, 0.7, 0);
    hb(o.x + 2.65, Y, o.z + 2.6, 0.6, 0.55, 2.4, '#3d2f25'); hb(o.x + 2.7, Y + 0.55, o.z + 2.6, 0.1, 0.95, 1.7, '#111'); hmesh(new THREE.PlaneGeometry(1.6, 0.86), mTV, o.x + 2.64, Y + 1.03, o.z + 2.6, -Math.PI / 2); addBox(o.x + 2.65, o.z + 2.6, 0.3, 1.2, 0);
    homeAct(T, o.x + 1.3, o.z + 2.6, '看電視（金門新聞台）', watchTV, 1.6);
    { const cat = new THREE.Mesh(mergeGeos([[new THREE.CapsuleGeometry(0.17, 0.4, 4, 8).rotateX(Math.PI / 2), '#e08a3c', new THREE.Matrix4().makeTranslation(0, 0.2, 0)], [new THREE.SphereGeometry(0.15, 10, 8), '#e08a3c', new THREE.Matrix4().makeTranslation(0, 0.36, 0.32)], [new THREE.ConeGeometry(0.05, 0.1, 4), '#e08a3c', new THREE.Matrix4().makeTranslation(0.07, 0.5, 0.32)], [new THREE.ConeGeometry(0.05, 0.1, 4), '#e08a3c', new THREE.Matrix4().makeTranslation(-0.07, 0.5, 0.32)], [new THREE.CylinderGeometry(0.03, 0.03, 0.45, 5).rotateX(1.1), '#e08a3c', new THREE.Matrix4().makeTranslation(0, 0.38, -0.42)]]), mVC); cat.position.set(o.x - 2.4, Y + 0.45, o.z + 3.6); cat.rotation.y = Math.PI / 2; scene.add(cat); myHome.cat = cat;
      homeAct(T, o.x - 1.7, o.z + 3.9, '摸貓（橘子）', () => { player.hp = Math.min(100, player.hp + 5); sfx('chime', 0.15); subtitle(pick(['<b>橘子</b>：「喵～」（蹭了蹭你的手）', '<b>橘子</b>：「呼嚕呼嚕……」', '<b>橘子</b>：（翻肚子給你摸）', '<b>橘子</b>：（瞪你一眼，繼續睡）']), 3); }, 1.3); }
    // 麻將桌
    hb(o.x + 1.0, Y, o.z - 1.3, 1.5, 0.72, 1.5, '#5b4435'); hb(o.x + 1.0, Y + 0.72, o.z - 1.3, 1.36, 0.03, 1.36, '#2e7d4f'); addBox(o.x + 1.0, o.z - 1.3, 0.75, 0.75, 0);
    for (const [a, b] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { hb(o.x + 1.0 + a * 1.05, Y, o.z - 1.3 + b * 1.05, 0.42, 0.45, 0.42, '#7a5236'); for (let t = -4; t <= 4; t++) hb(o.x + 1.0 + a * 0.5 + (b ? t * 0.1 : 0), Y + 0.75, o.z - 1.3 + b * 0.5 + (a ? t * 0.1 : 0), a ? 0.06 : 0.08, 0.1, a ? 0.08 : 0.06, t % 3 ? '#f4f1e6' : '#3f8f5a'); }
    homeAct(T, o.x + 1.0, o.z - 0.1, '打一圈麻將（底 $500）', playMahjong, 1.4);
    // 廚房（後面右邊）
    hb(o.x + 1.2, Y, o.z - 6.6, 3.4, 0.9, 0.7, '#e9e5dc'); hb(o.x + 1.2, Y + 0.9, o.z - 6.6, 3.4, 0.05, 0.72, '#555'); hb(o.x + 1.2, Y + 1.7, o.z - 6.8, 3.4, 0.7, 0.4, '#e9e5dc'); addBox(o.x + 1.2, o.z - 6.6, 1.7, 0.35, 0);
    hb(o.x + 2.55, Y, o.z - 5.0, 0.8, 1.85, 0.75, '#f4f6f7'); hb(o.x + 2.14, Y + 1.0, o.z - 5.0, 0.04, 0.5, 0.05, '#999'); addBox(o.x + 2.55, o.z - 5.0, 0.4, 0.38, 0);
    homeAct(T, o.x + 1.6, o.z - 5.2, '開冰箱找東西吃', () => { if (SURV.on) return toast('挑戰期間冰箱是空的，去外面買吧'); const f = pick([['泡麵', 25], ['貢糖', 15], ['廣東粥', 30], ['蚵仔麵線', 30], ['一顆蘋果', 10], ['媽媽包的水餃', 40]]); player.hp = Math.min(100, player.hp + f[1]); sfx('chime', 0.2); toast(`吃了${f[0]}　+${f[1]} 血`); });
    // 廁所（後面左邊）
    wallX(o, Y, -4.6, -3, -1.9, '#e3eef2'); wallZ(o, Y, -0.6, -7, -4.6, '#e3eef2');
    hb(o.x - 2.5, Y, o.z - 6.5, 0.5, 0.45, 0.7, '#ffffff'); hb(o.x - 2.5, Y + 0.45, o.z - 6.8, 0.5, 0.5, 0.2, '#ffffff'); hb(o.x - 1.2, Y + 0.8, o.z - 6.85, 0.6, 0.15, 0.35, '#ffffff'); hb(o.x - 1.2, Y + 1.3, o.z - 6.98, 0.6, 0.8, 0.02, '#bfd3dc'); hb(o.x - 1.4, Y + 2.0, o.z - 5.4, 0.2, 0.1, 0.3, '#aaa'); hb(o.x - 1.4, Y, o.z - 5.4, 1.2, 0.06, 1.2, '#cfd8dc');
    homeAct(T, o.x - 1.6, o.z - 5.6, '洗個熱水澡（回滿血）', () => { player.hp = 100; sfx('chime', 0.2); subtitle('洗完澡，整個人神清氣爽。', 3); }, 1.3);
    homeAct(T, o.x - 2.4, o.z - 5.9, '上廁所', () => { sfx('chime', 0.1); toast('舒服多了'); player.hp = Math.min(100, player.hp + 5); }, 1.0);
    homeAct(T, o.x - 2.25, o.z - 0.4, '上 2 樓', () => floorTp(2), 1.4);
  }
  // ---------- 2F：主臥、書房 ----------
  { const o = buildFloorShell(2, Y); twoRooms(o, Y, '#f3efe6');
    bed(o, Y, 1.4, 4.4, 2.0, '#4f7cac'); homeAct(T, o.x - 0.1, o.z + 4.2, '躺上床（睡覺・存檔）', bedMenu, 1.6);
    hb(o.x - 2.65, Y, o.z + 4.4, 0.65, 2.3, 2.0, '#c9b38f'); hb(o.x - 2.31, Y + 0.3, o.z + 4.4, 0.02, 1.8, 0.04, '#5b4435'); addBox(o.x - 2.65, o.z + 4.4, 0.33, 1.0, 0);
    homeAct(T, o.x - 1.8, o.z + 4.4, '打開衣櫃換衣服', () => { restyle(); sfx('door', 0.2); toast('換好衣服了'); }, 1.3);
    hb(o.x + 2.5, Y, o.z + 2.0, 0.9, 0.8, 1.4, '#c9b38f');
    // 書房：書桌＋電腦、書櫃
    hb(o.x + 2.5, Y, o.z - 5.4, 0.9, 0.75, 1.8, '#a77b52'); hb(o.x + 2.75, Y + 0.75, o.z - 5.4, 0.08, 0.5, 0.8, '#111'); hmesh(new THREE.PlaneGeometry(0.74, 0.44), mTV, o.x + 2.705, Y + 1.0, o.z - 5.4, -Math.PI / 2); hb(o.x + 1.6, Y, o.z - 5.4, 0.5, 0.5, 0.5, '#333'); addBox(o.x + 2.5, o.z - 5.4, 0.45, 0.9, 0);
    homeAct(T, o.x + 1.4, o.z - 5.4, '用電腦（看遊戲進度）', useComputer, 1.3);
    hb(o.x - 2.6, Y, o.z - 5.6, 0.6, 2.2, 2.2, '#8b6a48'); for (let k = 0; k < 4; k++) hb(o.x - 2.32, Y + 0.3 + k * 0.5, o.z - 5.6, 0.05, 0.35, 2.0, pick(['#c0392b', '#2e86de', '#27ae60', '#d4a017'])); addBox(o.x - 2.6, o.z - 5.6, 0.3, 1.1, 0);
    homeAct(T, o.x - 2.25, o.z - 0.4, '上 3 樓', () => floorTp(3), 1.4); homeAct(T, o.x - 1.1, o.z - 3.2, '下 1 樓', () => floorTp(1), 1.1);
  }
  // ---------- 3F：客房、儲藏室（保險箱、健身器材） ----------
  { const o = buildFloorShell(3, Y); twoRooms(o, Y, '#eef1ea');
    bed(o, Y, 1.8, 4.4, 1.3, '#8e6bb0'); homeAct(T, o.x + 0.6, o.z + 4.2, '在客房小睡一下（回滿血）', () => { game.busy = true; fade('Z z z', () => { env.tod = (env.tod + 2) % 24; player.hp = 100; game.busy = false; }); }, 1.4);
    hb(o.x - 2.4, Y, o.z + 5.6, 1.0, 0.75, 0.6, '#a77b52'); hb(o.x - 2.4, Y + 0.75, o.z + 5.6, 0.5, 0.35, 0.3, '#333');
    // 儲藏室
    for (const [x, z, s] of [[-2.4, -6.2, 0.7], [-1.6, -6.4, 0.5], [-2.5, -5.4, 0.55]]) hb(o.x + x, Y, o.z + z, s, s, s, '#b8956a');
    hb(o.x + 2.5, Y, o.z - 6.4, 0.8, 0.9, 0.7, '#4a4f55'); hb(o.x + 2.11, Y + 0.45, o.z - 6.4, 0.03, 0.18, 0.18, '#d4a017'); addBox(o.x + 2.5, o.z - 6.4, 0.4, 0.35, 0);
    homeAct(T, o.x + 1.7, o.z - 6.1, () => `保險箱（存款 $${safeMoney.toLocaleString()}，被打死或被捕都不會少）`, safeMenu, 1.3);
    hb(o.x + 1.0, Y, o.z - 4.9, 1.6, 0.45, 0.45, '#333'); hb(o.x + 1.0, Y + 0.9, o.z - 4.9, 1.8, 0.05, 0.05, '#999'); for (const a of [-0.85, 0.85]) hmesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 14).rotateZ(Math.PI / 2), mat('#222'), o.x + 1.0 + a, Y + 0.9, o.z - 4.9);
    homeAct(T, o.x + 1.0, o.z - 4.1, '練舉重', () => { player.hp = Math.min(100, player.hp + 10); sfx('thud', 0.2); toast(pick(['嘿咻！+1 力氣', '練到手臂發抖', '今天練胸'])); }, 1.1);
    homeAct(T, o.x - 2.25, o.z - 0.4, '上頂樓平台', roofUp, 1.4); homeAct(T, o.x - 1.1, o.z - 3.2, '下 2 樓', () => floorTp(2), 1.1);
  }
}
function bedMenu() {
  openMenu('🛏 你的床', [{ n: '睡到早上 8 點', d: '補滿血、撤銷通緝、存檔', fn: () => sleepTo(null, 8) }, { n: '睡到晚上 8 點', d: '補滿血、撤銷通緝、存檔', fn: () => sleepTo(null, 20) }, { n: '起床', d: '', fn: closeMenu }].map(i => ({ ...i, free: true })));
}
function saveSafe() { try { localStorage.setItem('kinmen_safe', String(safeMoney)); } catch (e) { } }
function safeMenu() {
  const mv = n => () => { if (n > 0) { n = Math.min(n, player.money); if (!n) return toast('身上沒錢'); addMoney(-n); safeMoney += n; } else { n = Math.min(-n, safeMoney); if (!n) return toast('保險箱是空的'); safeMoney -= n; addMoney(n); } saveSafe(); sfx('chime', 0.2); safeMenu(); };
  openMenu(`🔒 保險箱　存款 $${safeMoney.toLocaleString()}`, [{ n: '存 $1,000', fn: mv(1000) }, { n: '存 $10,000', fn: mv(10000) }, { n: '全部存進去', fn: mv(1e12) }, { n: '提 $1,000', fn: mv(-1000) }, { n: '提 $10,000', fn: mv(-10000) }, { n: '全部提出來', fn: mv(-1e12) }, { n: '關上', fn: closeMenu }].map(i => ({ ...i, d: '', free: true })));
}
function playMahjong() {
  if (game.time - myHome.mjT < 1.2) return; if (player.money < 500) { toast('至少要有 $500 才能上桌'); return; } myHome.mjT = game.time;
  const who = pick(['阿德叔', '隔壁林媽媽', '對面陳伯', '小芸']), r = rand(); let d, t;
  if (r < 0.1) { d = 2500; t = `<b>自摸！清一色！</b>　${who}：「今天手氣也太好了吧！」`; } else if (r < 0.38) { d = 1000; t = `<b>胡了！</b>　${who}：「唉，被你胡走了。」`; } else if (r < 0.66) { d = -800; t = `<b>放槍……</b>　${who}：「謝啦～胡！」`; } else if (r < 0.82) { d = 0; t = `<b>流局</b>　${who}：「洗牌洗牌，再來一圈。」`; } else { d = -500; t = `<b>${who}自摸</b>　你：「……」`; }
  sfx(d > 0 ? 'chime' : 'thud', 0.25); if (d) addMoney(d); subtitle(t, 4);
}
function watchTV() {
  const n = [], st = wanted.stars, m = player.money;
  n.push(st ? `警方正在全島搜捕一名${'★'.repeat(st)}級通緝犯，呼籲民眾注意安全。` : '今日金門治安良好，縣警局表示「一切平安」。');
  n.push(m > 50000 ? `坊間傳聞頂埔下出了一位神秘富豪，身家超過 ${Math.floor(m / 10000)} 萬。` : '金門高粱酒今年銷量再創新高，酒廠表示將擴大生產。');
  n.push(secretsFound.size ? `有民眾在坑道內發現 ${secretsFound.size} 份老舊軍事檔案，國家公園將進行研究。` : '翟山坑道本週末舉辦坑道音樂會，歡迎民眾參加。');
  n.push(`天氣：今天${WEATHER[weather.cur].name}，${WEATHER[weather.cur].desc}。`, '大膽島心戰牆晚上七點到九點點燈，對岸觀光船又排起了長龍。');
  sfx('chime', 0.15); n.forEach((t, k) => setTimeout(() => subtitle(`📺 <b>金門新聞台</b>　${t}`, 4.2), k * 4300));
}
function useComputer() {
  const lionsN = lions.filter(l => l.found).length, it = [['主線劇情', `${Math.min(story.ch, CHAPTERS.length)}/${CHAPTERS.length} 章`], ['機密檔案', `${secretsFound.size}/${TUNNEL_DEFS.length + 1}`], ['朋友委託', `${SIDE.filter(j => sideDone.has(j.id)).length}/${SIDE.length}`], ['風獅爺', `${lionsN}/${lions.length}`], ['房產', `${props.filter(p => p.own).length}/${props.length}`], ['安全屋', `${homes.filter(h => h.own).length}/${homes.length}`], ['生態圖鑑', `${dexGot.size}/${DEX.length}`], ['自行車賽紀錄', BR.best ? BR.best.toFixed(1) + ' 秒' : '尚未完賽'], ['水獺照片', otter.shots + ' 張']];
  const pct = Math.round(100 * (Math.min(story.ch, CHAPTERS.length) / CHAPTERS.length + secretsFound.size / (TUNNEL_DEFS.length + 1) + sideDone.size / SIDE.length + lionsN / Math.max(1, lions.length) + props.filter(p => p.own).length / props.length + homes.filter(h => h.own).length / homes.length + dexGot.size / DEX.length) / 7);
  openMenu(`💻 浯島風雲 進度 ${pct}%`, it.map(([n, d]) => ({ n, d, free: true, fn: () => { } })).concat([{ n: '關掉電腦', d: '', free: true, fn: closeMenu }]));
}

/* ---------- 外觀：一整排 8 間三樓連棟透天＋頂樓平台＋門口停車場 ---------- */
function buildRow() {
  let s = null; const okLot = q => { const c = Math.cos(q.rot), sn = Math.sin(q.rot); for (let a = -24; a <= 24; a += 4) for (const b of [-7, 0, 7, 11, 15, 19]) { const x = q.x + a * c + b * sn, z = q.z - a * sn + b * c; if (!boxFree(x, z, 2.6) || (b < 8 && !roadClear(x, z, 2)) || sdAt(x, z) < 20) return false; } return true; };
  for (let ring = 0; ring < 10 && !s; ring++) for (let k = 0; k < (ring ? 8 : 1) && !s; k++) { const la = HOME_LL[0] + Math.cos(k * 0.785) * ring * 0.0012, lo = HOME_LL[1] + Math.sin(k * 0.785) * ring * 0.0013, q = spot(la, lo, 26, 10); if (q && okLot(q)) { s = q; myHome.ring = ring; } }
  if (!s) s = spot(HOME_LL[0], HOME_LL[1], 26, 24); if (!s) return null;
  const rot = s.rot, c = Math.cos(rot), sn = Math.sin(rot), W = 6, D = 14, FH = 3.3, NF = 3, HT = NF * FH, N = ROW_NUMS.length;
  const y0 = minGround(s.x, s.z, W * N, D, rot) - 0.2, P = (a, b) => ({ x: s.x + a * c + b * sn, z: s.z - a * sn + b * c }), B = (a, b, y, w, h, d, col) => { const p = P(a, b); hb(p.x, y, p.z, w, h, d, col, rot); }, BT2 = (a, b, y, w, h, d, col, rx) => { const p = P(a, b); BT.cbox.add(MX(p.x, y, p.z, rot, w, h, d, rx), new THREE.Color(col)); }, ry = y0 + HT;
  const tints = ['#ead9c6', '#e4d3c4', '#efe3d2', '#e1d6c8'], houses = [];
  for (let i = 0; i < N; i++) { const a0 = (i - (N - 1) / 2) * W, num = ROW_NUMS[i], mine = i === MY_IDX;
    B(a0, 0, y0, W - 0.04, HT, D, tints[i % 4]); const pc = P(a0, 0), col = addBox(pc.x, pc.z, W / 2, D / 2, rot); if (mine) myHome.body = col;
    for (let k = 0; k < NF; k++) { const y = y0 + k * FH; B(a0, D / 2 + 0.01, y + FH - 0.25, W, 0.25, 0.05, '#c9b49a');
      if (k === 0) { const p = P(a0 - 0.6, D / 2 + 0.03), sh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.8), new THREE.MeshStandardMaterial({ map: shutterTex, roughness: 0.6, metalness: 0.4 })); sh.position.set(p.x, y + 1.4, p.z); sh.rotation.y = rot; scene.add(sh); B(a0 + 2.3, D / 2 + 0.02, y, 0.95, 2.2, 0.06, '#5a3b28'); BT2(a0, D / 2 + 2.0, y + 2.8, W + 0.1, 0.1, 4.0, '#8fa9bf', 0.16); for (const sd of [-1, 1]) { B(a0 + sd * (W / 2 - 0.15), D / 2 + 3.8, y, 0.1, 2.45, 0.1, '#777'); const pp = P(a0 + sd * (W / 2 - 0.15), D / 2 + 3.8); addBox(pp.x, pp.z, 0.08, 0.08, 0); } const q = P(a0 + 2.3, D / 2 + 0.08); addSign(`頂埔下 ${num} 號`, 0.3, q.x, y + 2.45, q.z, rot, { color: '#fff', bg: '#1f4e8c', size: 64, pad: 8 }); }
      else { B(a0, D / 2 + 0.75, y, W, 0.2, 1.5, '#cfcac0'); B(a0, D / 2 + 1.45, y + 0.95, W, 0.08, 0.1, '#d5d8db'); for (let bb = -2.8; bb <= 2.81; bb += 0.4) B(a0 + bb, D / 2 + 1.45, y + 0.2, 0.05, 0.75, 0.05, '#d5d8db'); for (const sd of [-W / 2 + 0.05, W / 2 - 0.05]) B(a0 + sd, D / 2 + 0.75, y + 0.2, 0.08, 0.83, 1.4, '#e6e2da'); B(a0 + 0.3, D / 2 + 0.02, y + 0.9, 3.6, 1.6, 0.06, '#2c3e50'); for (let a = -1.4; a <= 1.81; a += 0.4) B(a0 + a, D / 2 + 0.18, y + 0.85, 0.04, 1.75, 0.04, '#333'); B(a0 + 0.3, D / 2 + 0.18, y + 2.55, 3.7, 0.05, 0.05, '#333'); BT2(a0, D / 2 + 1.0, y + 2.9, W + 0.1, 0.08, 2.1, '#8fa9bf', 0.22); } }
    // 斜屋頂（前段紅瓦斜頂，後段保留平台）
    { const g = profGeo([[D / 2 + 0.6, 0], [D / 2 - 3.0, 0], [D / 2 - 3.0, 2.3]], W + 0.2), m = new THREE.Mesh(g, mat('#9c4a35', 0.85)); const p = P(a0, 0); m.position.set(p.x, ry, p.z); m.rotation.y = rot; m.castShadow = true; scene.add(m); if (mine) { const q = P(a0, D / 2 - 1.2); myHome.roofCols.push(addBox(q.x, q.z, W / 2, 1.8, rot)); } }
    // 頂樓平台：女兒牆、樓梯間、水塔
    for (const [a, b, w, d] of [[0, D / 2 - 0.1, W, 0.2], [0, -D / 2 + 0.1, W, 0.2], [W / 2 - 0.1, 0, 0.2, D], [-W / 2 + 0.1, 0, 0.2, D]]) { B(a0 + a, b, ry, w, 1.0, d, '#e3d3bf'); if (mine) { const p = P(a0 + a, b); myHome.roofCols.push(addBox(p.x, p.z, w / 2, d / 2, rot)); } }
    B(a0 - 1.6, -4.6, ry, 2.6, 2.6, 4.4, '#e3d3bf'); B(a0 - 1.6, -4.6, ry + 2.6, 2.9, 0.15, 4.7, '#b9b2a6'); B(a0 - 1.6, -2.38, ry, 0.95, 2.1, 0.05, '#5a3b28'); if (mine) { const p = P(a0 - 1.6, -4.6); myHome.roofCols.push(addBox(p.x, p.z, 1.3, 2.2, rot)); }
    { const p = P(a0 + 1.7, -5.2); BT.ccyl.add(MX(p.x, ry, p.z, 0, 1.3, 1.6, 1.3), new THREE.Color('#c8ccd0')); if (mine) myHome.roofCols.push(addBox(p.x, p.z, 0.7, 0.7, 0)); }
    houses.push({ i, num, a0, mine, door: P(a0 + 2.3, D / 2), front: P(a0 + 2.3, D / 2 + 1.4) }); }
  // 你家頂樓：曬衣架、泡茶桌、盆栽
  { const a0 = houses[MY_IDX].a0; B(a0 + 1.2, -1.5, ry, 0.05, 1.6, 0.05, '#888'); B(a0 + 1.2, 1.5, ry, 0.05, 1.6, 0.05, '#888'); B(a0 + 1.2, 0, ry + 1.6, 0.04, 0.04, 3.0, '#888'); for (const [b, col] of [[-1.0, '#2e86de'], [-0.3, '#f1f1f1'], [0.4, '#c0392b'], [1.0, '#f1c40f']]) B(a0 + 1.2, b, ry + 0.9, 0.04, 0.7, 0.45, col);
    B(a0 - 1.0, 1.6, ry, 0.9, 0.7, 0.9, '#7a5236'); B(a0 - 1.0, 1.6, ry + 0.7, 0.3, 0.12, 0.2, '#e8e2d4'); for (const b of [0.7, 2.5]) B(a0 - 1.0, b, ry, 0.45, 0.45, 0.45, '#2e86de');
    for (const [a, b] of [[-2.4, 3.6], [2.4, 3.6], [-2.4, 0.2]]) { const p = P(a0 + a, b); BT.ccyl.add(MX(p.x, ry, p.z, 0, 0.5, 0.5, 0.5), new THREE.Color('#9c5b3b')); BT.leaf.add(MX(p.x, ry + 0.5, p.z, 0, 0.7, 0.7, 0.7), new THREE.Color('#4f7a3a')); }
    const pa = P(a0, 0); addDeck(pa.x, pa.z, W / 2, D / 2, rot, ry); for (const cc of myHome.roofCols) cc.off = true; }
  // 門口停車場（8 格）＋停幾台鄰居的車
  for (let i = 0; i < N; i++) { const a0 = houses[i].a0, p = P(a0, D / 2 + 6.5), gy = groundAt(p.x, p.z); B(a0, D / 2 + 6.5, gy - 0.15, W, 0.25, 11, '#4a4d50'); B(a0 - W / 2 + 0.06, D / 2 + 7.5, gy + 0.1, 0.12, 0.02, 7, '#f1f1f1'); }
  { const a0 = houses[N - 1].a0; B(a0 + W / 2 - 0.06, D / 2 + 7.5, groundAt(P(a0, D / 2 + 7).x, P(a0, D / 2 + 7).z) + 0.1, 0.12, 0.02, 7, '#f1f1f1'); }
  for (const i of [0, 2, 5, 6]) { const p = P(houses[i].a0, D / 2 + 7.2), v = makeVehicle(pick(['sedan', 'suv', 'pickup', 'van']), p.x, p.z, rot + Math.PI); v.perm = true; }
  const door = houses[MY_IDX].door, f = { x: sn, z: c }, m = { x: door.x + f.x * 1.9, z: door.z + f.z * 1.9, yaw: rot, trig: { x: door.x + f.x * 1.0, z: door.z + f.z * 1.0 } };
  return { s, rot, P, ry, m, houses, a0: houses[MY_IDX].a0, garage: P(houses[MY_IDX].a0, D / 2 + 7.2) };
}
function roofUp() { const E = myHome.ext; if (!E || game.busy) return; game.busy = true; sfx('door', 0.2); fade('頂樓平台', () => { player.tunnel = null; roomLight.intensity = 0; myHome.body.off = true; for (const cc of myHome.roofCols) cc.off = false; const p = E.P(E.a0 + 1.6, 1.0), yw = E.rot + Math.PI / 2; player.pos.set(p.x, E.ry, p.z); player.yaw = yw; cam.yaw = yw; cam.pos.set(p.x - Math.sin(yw) * 2.5, E.ry + 2.2, p.z - Math.cos(yw) * 2.5); myHome.onRoof = true; lastZone = ''; game.busy = false; }); }
function roofDown() { const T = myHome.T; if (!T || game.busy) return; game.busy = true; sfx('door', 0.2); fade('三樓', () => { myHome.onRoof = false; myHome.body.off = false; for (const cc of myHome.roofCols) cc.off = true; player.tunnel = T; T.surf = T.mouths[0]; const a = ARRIVE(3); player.pos.set(a.x, T.Y, a.z); player.yaw = 0; cam.yaw = 0; cam.pos.set(a.x, T.Y + 1.6, a.z - 2.5); lastZone = ''; game.busy = false; }); }
function rowHouses(E) {
  for (const h of E.houses) { if (h.mine) continue; const name = `頂埔下 ${h.num} 號`, price = 32000 + ((h.num * 37) % 6) * 2000, inc = Math.round(price / 20 / 100) * 100, p = { name, price, inc, x: h.front.x, z: h.front.z, own: propSaved.includes(name), row: true };
    p.ic = iconSprite('售', '#27ae60'); p.ic.scale.set(1.5, 1.5, 1); p.ic.position.set(h.door.x, E.ry + 2.2, h.door.z); scene.add(p.ic); props.push(p); setPropIcon(p);
    addAction({ x: h.front.x, z: h.front.z, r: 2.2, inside: null, label: () => p.own ? `${name}（出租中，每天 +$${inc.toLocaleString()}）：按 E 考慮賣掉` : `買下 ${name}（$${price.toLocaleString()}，出租每天 +$${inc.toLocaleString()}）`, fn: () => {
      if (!p.own) { if (player.money < price) { toast('錢不夠'); sfx('fail', 0.2); return; } addMoney(-price); p.own = true; setPropIcon(p); saveProps(); banner('買下連棟透天', `${name}　出租每天 +$${inc.toLocaleString()}`); return; }
      const sell = Math.round(price * 0.85 / 100) * 100; openMenu(`🏠 ${name}`, [{ n: `賣掉（$${sell.toLocaleString()}）`, d: '買價的八五折', free: true, fn: () => { closeMenu(); p.own = false; setPropIcon(p); saveProps(); addMoney(sell); banner('賣掉房子', `${name}　+$${sell.toLocaleString()}`); } }, { n: '繼續出租', d: `每天 +$${inc.toLocaleString()}`, free: true, fn: closeMenu }]); } }); }
}
function buildMyHome() {
  const E = buildRow(); if (!E) return; myHome.ext = E; rowHouses(E);
  const o1 = FLOOR_ORIGIN(1), T = { name: '頂埔下 201 號', desc: '你家：一樓客廳、廚房、麻將桌和廁所，二三樓各兩間房，頂樓是平台', house: true, Y: 2, H: 3.2, map: [''], start: { x: o1.x + 1.2, z: o1.z + 5.6 }, startYaw: Math.PI, exits: [{ i: 0, x: o1.x + 2.3, z: o1.z + 6.6 }, { i: 0, x: o1.x - 0.6, z: o1.z + 6.6 }], mouths: [E.m], surf: E.m };
  myHome.T = T; tunnels.push(T); buildHomeInterior(T);
  { const p = E.P(E.a0 - 1.6, -2.0); addAction({ x: p.x, z: p.z, r: 1.6, inside: null, label: () => '下樓（回 3 樓）', fn: roofDown }); const q = E.P(E.a0 - 1.0, 2.0); addAction({ x: q.x, z: q.z, r: 1.6, inside: null, label: () => '在頂樓泡茶看風景（回滿血）', fn: () => { player.hp = 100; sfx('chime', 0.2); subtitle(pick(['頂樓的風很舒服，遠遠看得到太武山。', '泡一壺茶，看著頂埔下的田和慈湖路的車。', '傍晚的雲被夕陽染成橘色，今天也辛苦了。']), 4); } }); }
  PLACES.push({ name: '頂埔下 201 號', x: E.houses[MY_IDX].door.x, z: E.houses[MY_IDX].door.z, r: 12 }, { name: '頂埔下連棟透天', x: E.s.x, z: E.s.z, r: 32 });
  const g = E.garage, h = { name: '頂埔下 201 號（你家）', price: 0, x: E.m.x, z: E.m.z, rot: E.rot, gx: g.x, gz: g.z, own: true, car: homeSave.gar['頂埔下 201 號（你家）'] || null, mine: true };
  // 出生點：家門口；你的紅色跑車停在自己的車位
  { const m = E.m, f = fwd(m.yaw); missionSpots.start = { x: m.x + f.x * 7.5, z: m.z + f.z * 7.5, yaw: m.yaw + Math.PI }; if (!h.car) { const v = makeVehicle('sports', g.x, g.z, E.rot, '#d4140b'); v.perm = true; v.fromGar = h; v.carColor = '#d4140b'; } }
  h.ic = iconSprite('家', '#e67e22'); h.ic.scale.set(1.7, 1.7, 1); h.ic.position.set(E.houses[MY_IDX].door.x, E.ry + 5, E.houses[MY_IDX].door.z); scene.add(h.ic); h.ring = ringAt(g.x, g.z, 0x2e86de, 2.2); h.gic = iconSprite('車', '#2e86de'); h.gic.scale.set(1.2, 1.2, 1); h.gic.position.set(g.x, heightAt(g.x, g.z) + 4.2, g.z); scene.add(h.gic); homes.push(h);
}
function homeGo() { const E = myHome.ext; if (!E) return; if (wanted.stars) { toast('被通緝時不能傳送'); return; } if (player.plane || game.busy) return; if (game.mapOpen) toggleMap(); if (player.veh) exitForce(); game.busy = true; fade('回家', () => { const m = E.m, f = fwd(m.yaw); player.pos.set(m.x + f.x * 2, heightAt(m.x + f.x * 2, m.z + f.z * 2), m.z + f.z * 2); player.yaw = m.yaw + Math.PI; cam.yaw = player.yaw; cam.pos.set(player.pos.x + f.x * 5, player.pos.y + 3, player.pos.z + f.z * 5); lastZone = ''; game.busy = false; }); }
function updateMyHome() { mShop2.emissiveIntensity = mShop3.emissiveIntensity = mFacade.emissiveIntensity; for (const m of FACV) m.emissiveIntensity = mFacade.emissiveIntensity; const day = env.tod > 6.2 && env.tod < 18.4, k = day ? 0.9 : 0.06; mSky.emissiveIntensity += (k - mSky.emissiveIntensity) * 0.1; mSky.color.set(day ? 0xcfe6f5 : 0x1a2433); }
function myHomeView() { const E = myHome.ext; if (!E) return null; const a = E.P(-4, 7 + 26), b = E.P(0, 0); return [a.x, a.z, b.x, b.z, E.ry]; }
