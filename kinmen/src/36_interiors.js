/* =====================================================================
   可進入的建築（無縫室內）：銀行（可搶）、便利店、軍品店、宿舍
   室內就蓋在建築本體裡，走進門就到，不用傳送。
   室內座標：local x＝左右，local z＝前後（門在 +z），R.L(lx, lz) 轉成世界座標
   ===================================================================== */
const rooms = [], actions = [], roomNpcs = [];
const roomLight = new THREE.PointLight(0xfff1d8, 0, 34, 1.1); scene.add(roomLight);
function addAction(a) { actions.push(a); return a; }
function shellRoom(lat, lon, name, type, w, d, floors, tint, wallCol, floorCol, signText, signBg, at = null, opt = {}) {
  const s = at || spot(lat, lon, Math.max(w, d) / 2 + 2, 16, d / 2 + 2.0) || spot(lat, lon, Math.max(w, d) / 2 + 2); if (!s) return null;
  const rot = s.rot, c = Math.cos(rot), sn = Math.sin(rot), cx = s.x, cz = s.z;
  const L = (lx, lz) => ({ x: cx + lx * c + lz * sn, z: cz - lx * sn + lz * c });
  let gmin = 1e9, gmax = -1e9; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0], [0, 1.25]]) { const p = L(a * (w / 2 + 0.5), b * (d / 2 + 0.5)), g = groundAt(p.x, p.z); gmin = Math.min(gmin, g); gmax = Math.max(gmax, g); }
  const Y = gmax + 0.2, H = 3.9, R = { name, type, cx, cz, rot, w, d, Y, H, L, cool: -1e9, wasIn: false };
  R.local = (x, z) => { const dx = x - cx, dz = z - cz; return { lx: dx * c - dz * sn, lz: dx * sn + dz * c }; };
  R.contains = (x, z, m = 0) => { const q = R.local(x, z); return Math.abs(q.lx) < w / 2 - m && Math.abs(q.lz) < d / 2 - m; };
  const tc = new THREE.Color(tint), wc = new THREE.Color(wallCol);
  // 地基、地板、門口台階
  let p = L(0, 0); BT.cbox.add(MX(p.x, gmin - 0.4, p.z, rot, w + 0.8, Y - gmin + 0.4, d + 0.8), COL.stone);
  rb(R, 0, 0, w, 0.06, d, floorCol, false, -0.04); addDeck(cx, cz, w / 2 + 0.4, d / 2 + 0.4, rot, Y);
  p = L(0, d / 2 + 1.4); BT.cbox.add(MX(p.x, gmin - 0.4, p.z, rot, 3.4, Y - gmin + 0.4, 2.0), COL.concrete); addDeck(p.x, p.z, 1.7, 1.0, rot, Y);
  // 外牆（外層顏色）＋內牆（室內顏色）＋碰撞
  const wall = (lx, lz, ww, dd, h = H, y0 = 0, solid = true) => { const q = L(lx, lz); BT.cbox.add(MX(q.x, Y + y0, q.z, rot, ww, h, dd), tc); if (solid) addBox(q.x, q.z, ww / 2, dd / 2, rot); };
  const inner = (lx, lz, ww, dd, h = H, y0 = 0) => { const q = L(lx, lz); BT.cbox.add(MX(q.x, Y + y0, q.z, rot, ww, h, dd), wc); };
  wall(0, -d / 2 - 0.15, w + 0.6, 0.3); inner(0, -d / 2 + 0.03, w, 0.06);
  for (const sd of [-1, 1]) { wall(sd * (w / 2 + 0.15), 0, 0.3, d + 0.6); inner(sd * (w / 2 - 0.03), 0, 0.06, d); }
  const seg = w / 2 - 1.3; for (const sd of [-1, 1]) { wall(sd * (1.3 + (seg + 0.3) / 2), d / 2 + 0.15, seg + 0.3, 0.3); inner(sd * (1.3 + seg / 2), d / 2 - 0.03, seg, 0.06); }
  wall(0, d / 2 + 0.15, 2.6, 0.3, H - 2.8, 2.8, false); inner(0, d / 2 - 0.03, 2.6, 0.06, H - 2.8, 2.8);
  // 櫥窗、門框
  if (!opt.trad) { for (const sd of [-1, 1]) { const q = L(sd * (1.3 + seg / 2), d / 2 + 0.31); BT.cbox.add(MX(q.x, Y + 0.8, q.z, rot, seg - 1.2, 2.0, 0.04), COL.glass); }
  for (const sd of [-1, 1]) for (let k = -1; k <= 1; k++) { const q = L(sd * (w / 2 + 0.31), k * d / 3.2); BT.cbox.add(MX(q.x, Y + 1.0, q.z, rot + Math.PI / 2, 1.6, 1.6, 0.04), COL.glass); } }
  else { const q = L(0, 0); BT.roof.add(MX(q.x, Y + H + 0.3, q.z, rot, w + 1.6, 2.8, d + 2.0), new THREE.Color('#b5462b')); BT.ridge.add(MX(q.x, Y + H + 2.85, q.z, rot, w + 3.0, 1.5, 1.6)); for (const sd of [-1, 1]) { const e = L(sd * (w / 2 + 1.4), 0); BT.cbox.add(MX(e.x, Y + H + 3.2, e.z, rot, 2.0, 0.24, 0.34, 0, sd * 0.55), new THREE.Color('#7a2f22')); } }
  // 天花板、樓上
  rb(R, 0, 0, w + 0.6, 0.35, d + 0.6, COL.slab, false, H); inner(0, 0, w - 0.1, d - 0.1, 0.04, H - 0.05);
  if (floors > 1) { p = L(0, 0); BT[floors <= 3 ? 'fac33' : 'fac34'].add(MX(p.x, Y + H + 0.3, p.z, rot, w + 0.6, (floors - 1) * 3.3, d + 0.6), tc); BT.cbox.add(MX(p.x, Y + H + 0.3 + (floors - 1) * 3.3, p.z, rot, w + 1, 0.5, d + 1), COL.slab); }
  for (let a = -w / 2 + 2.5; a < w / 2 - 1; a += 5) for (let b = -d / 2 + 2.5; b < d / 2 - 1; b += 5) rb(R, a, b, 1.4, 0.06, 0.5, '#fffbe8', false, H - 0.12);
  // 招牌、雨遮
  if (opt.western) { const n = Math.max(4, Math.round(w / 3)); for (let i = 0; i <= n; i++) { const o = (i / n - 0.5) * (w - 0.4), q = L(o, d / 2 + 2.6); if (Math.abs(o) < 1.6) continue; BT.ccyl.add(MX(q.x, Y, q.z, 0, 0.26, H + 3.3 * (floors - 1), 0.26), COL.white); } const q = L(0, d / 2 + 1.4); BT.cbox.add(MX(q.x, Y + H, q.z, rot, w + 0.4, 0.35, 2.9), COL.white); BT.cbox.add(MX(q.x, Y + H + 3.3 * (floors - 1), q.z, rot, w + 0.6, 0.45, 3.1), COL.white); BT.cbox.add(MX(q.x, Y + H + 0.35, q.z + 0, rot, w + 0.4, 0.9, 0.12), COL.white); const t = L(0, d / 2 + 2.7); BT.roof.add(MX(t.x, Y + H + 3.3 * (floors - 1) + 0.4, t.z, rot, w * 0.3, 1.6, 0.4), COL.cream); }
  if (!opt.trad && !opt.western) { p = L(0, d / 2 + 1.0); BT.cbox.add(MX(p.x, Y + 3.0, p.z, rot, Math.min(w - 1, 7), 0.16, 1.8), new THREE.Color(signBg)); }
  if (signText) { const hs = Math.min(1.25, (w - 1.5) / [...signText].length); p = L(0, d / 2 + 0.33); addSign(signText, hs, p.x, Y + H - 0.2 + (floors > 1 ? 0.6 : 0), p.z, rot, { color: '#fff', bg: signBg, size: 80, pad: 14 }); }
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.35, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x6fd3ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false })); p = L(0, d / 2 + 1.4); ring.position.set(p.x, Y + 0.2, p.z); scene.add(ring);
  R.door = { ...L(0, d / 2 + 2.0), yaw: rot }; R.out = R.door; rooms.push(R); DOORPTS.push(R.door);
  return R;
}
function rb(R, lx, lz, w, h, d, col, solid = true, y0 = 0) { const q = R.L(lx, lz); BT.cbox.add(MX(q.x, R.Y + y0, q.z, R.rot, w, h, d), col instanceof THREE.Color ? col : new THREE.Color(col)); return solid ? addBox(q.x, q.z, w / 2, d / 2, R.rot) : null; }
function rnpc(R, lx, lz, yaw, opts, role) { const m = makePerson(opts); const q = R.L(lx, lz), pos = new V3(q.x, R.Y, q.z); m.group.position.copy(pos); m.group.rotation.y = yaw + R.rot; scene.add(m.group); const n = { m, pos, room: R, role, hp: 40, dead: false, state: 'idle', yaw: yaw + R.rot }; roomNpcs.push(n); addBox(q.x, q.z, 0.3, 0.3, 0); return n; }
function rsign(R, text, h, lx, lz, y, opts) { const q = R.L(lx, lz); return addSign(text, h, q.x, R.Y + y, q.z, R.rot, opts); }
function hitNpc(n, dmg) { n.hp -= dmg; if (n.hp <= 0 && !n.dead) { n.dead = true; n.m.group.rotation.set(-Math.PI / 2, n.yaw, 0, 'YXZ'); n.m.group.position.y = n.room.Y + 0.25; wanted.cd = 0; crimeMin(3); crime(1); } else scareRoom(n.room); }
function scareRoom(R) { for (const n of roomNpcs) if (n.room === R && !n.dead) { n.m.armL.rotation.x = n.m.armR.rotation.x = -2.9; n.state = 'scared'; } }
function calmRoom(R) { for (const n of roomNpcs) if (n.room === R) { n.dead = false; n.hp = 40; n.state = 'idle'; n.m.armL.rotation.x = n.m.armR.rotation.x = 0; n.m.group.rotation.set(0, n.yaw, 0); n.m.group.position.y = R.Y; } if (R.vault) { R.vault.off = false; R.vaultMesh.visible = true; R.vaultOpen = false; } }
function leaveRoom() { player.inside = null; roomLight.intensity = 0; closeMenu(); }
function updateRooms() {
  const was = player.inside; let now = null;
  if (player.tunnel) return;
  if (!player.veh && !player.plane) for (const R of rooms) if (Math.abs(player.pos.x - R.cx) < 20 && Math.abs(player.pos.z - R.cz) < 20 && R.contains(player.pos.x, player.pos.z) && player.pos.y < R.Y + 2) { now = R; break; }
  if (now !== was) {
    if (now) { if (game.time - now.cool > 300 && !(rob && rob.room === now)) calmRoom(now); const q = now.L(0, -now.d * 0.1); roomLight.position.set(q.x, now.Y + 3.2, q.z); roomLight.intensity = 30; lastZone = ''; }
    else leaveRoom();
    player.inside = now;
  }
}
function nearAction() { let best = null, bd = 1e9; for (const a of actions) { if (a.inside !== (player.inside || null) || (a.tunnel || null) !== (player.tunnel || null)) continue; const d = Math.hypot(a.x - player.pos.x, a.z - player.pos.z); if (d < a.r && d < bd) { const l = a.label(); if (l) { bd = d; best = a; best._l = l; } } } return best; }
function act(R, lx, lz, r, label, fn) { const q = R.L(lx, lz); return addAction({ x: q.x, z: q.z, r, inside: R, label, fn }); }

function buildBank(name, lat, lon) {
  const R = shellRoom(lat, lon, name, 'bank', 22, 18, 3, '#e8e2d2', '#ece6d6', '#b9b2a2', '浯島銀行', '#1d3a63'); if (!R) return null; const wood = '#6b4a34';
  rb(R, -2, -1.5, 16, 1.15, 0.9, wood); rb(R, -2, -1.5, 16.2, 0.08, 1.1, '#d8d2c2', false, 1.15); for (const x of [-7, -2, 3]) rb(R, x, -1.5, 0.08, 1.0, 0.7, '#9fc4d8', false, 1.2);
  rb(R, -4, -5, 14, R.H, 0.4, '#d9d2c0'); rb(R, 8.75, -5, 4.5, R.H, 0.4, '#d9d2c0'); { const q = R.L(4.75, -5); R.vault = addBox(q.x, q.z, 1.75, 0.25, R.rot); }
  const vm = new THREE.Mesh(mergeGeos([[new THREE.BoxGeometry(3.5, 3.6, 0.35), '#8d949a', new THREE.Matrix4().makeTranslation(0, 1.8, 0)], [new THREE.TorusGeometry(0.55, 0.08, 8, 20), '#c9ced2', new THREE.Matrix4().makeTranslation(0, 1.8, 0.24)], [new THREE.BoxGeometry(1.2, 0.08, 0.08), '#c9ced2', new THREE.Matrix4().makeTranslation(0, 1.8, 0.24)], [new THREE.BoxGeometry(0.08, 1.2, 0.08), '#c9ced2', new THREE.Matrix4().makeTranslation(0, 1.8, 0.24)]]), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.8 }));
  { const q = R.L(4.75, -5); vm.position.set(q.x, R.Y, q.z); vm.rotation.y = R.rot; scene.add(vm); R.vaultMesh = vm; }
  for (const x of [-9, -6, -3, 0]) { rb(R, x, -8.3, 2.2, 2.4, 0.9, '#7d848a'); rb(R, x, -7.8, 1.8, 0.25, 0.3, COL.gold, false, 0.9); rb(R, x, -7.8, 1.8, 0.25, 0.3, '#7fae6a', false, 1.5); }
  rb(R, -9.5, 5, 1.2, 0.5, 4, wood); rb(R, 9.5, 4, 1.2, 0.5, 4, wood); rb(R, 9.8, -3.2, 1.6, 1.7, 0.8, '#2e3b46'); rb(R, -10, 7.5, 0.8, 1.4, 0.8, COL.green);
  rsign(R, name, 0.9, -4, -4.78, 3.0, { color: '#f1d27a', bg: '#1d3a63', size: 80, pad: 14 });
  for (const x of [-7, -2, 3]) rnpc(R, x, -3, 0, { shirt: '#f1f1f1', pants: '#1b2433', tie: '#1d3a63' }, 'teller'); rnpc(R, -8.6, 5.5, 1.6, {}, 'customer'); rnpc(R, 5, 3, -2.2, {}, 'customer');
  { const q = R.L(9, 6.5); const g = spawnCop(q.x, q.z, false, R); g.yaw = R.rot - 1.6; g.m.group.rotation.y = g.yaw; g.pos.y = R.Y; }
  act(R, -2, 0.2, 6.5, () => rob ? null : (game.time - R.cool < 300 ? '（剛被搶過，櫃檯沒錢了）' : inv.cur > 0 ? '搶劫銀行' : '（掏出槍才能搶劫：按 2）'), () => { if (!rob && inv.cur > 0 && game.time - R.cool >= 300) startRob(R); });
  act(R, 4.75, -3.9, 2.2, () => rob && rob.room === R && rob.stage === 2 ? '撬開金庫' : null, () => { rob.stage = 3; rob.t = 0; });
  R.robSpot = [-2, 0.2, 8]; return R;
}
function buildStore(name, lat, lon) {
  const R = shellRoom(lat, lon, name, 'store', 14, 10, 2, '#f4f4ef', '#f1efe8', '#d9dcdc', '浯島便利店', '#2f7d58'); if (!R) return null; const cols = ['#e04b3c', '#2f86c9', '#f0c330', '#3fae7c', '#f08a3c', '#8e5bb5'];
  for (const x of [-4.5, -1.5, 1.5]) { rb(R, x, -1, 0.9, 1.7, 5.5, '#eceff1'); for (let k = 0; k < 8; k++) for (const sd of [-1, 1]) rb(R, x + sd * 0.48, -3.4 + k * 0.68, 0.06, 0.34, 0.5, pick(cols), false, 0.3 + (k % 3) * 0.48); }
  rb(R, 0, -4.6, 13, 2.2, 0.7, '#cfd8dc'); rb(R, 0, -4.2, 12.6, 1.9, 0.06, '#9fc4d8', false, 0.2); rb(R, 4.6, 2.0, 3.6, 1.05, 0.9, '#eceff1'); rb(R, 5.6, 2.0, 0.5, 0.35, 0.5, '#2e3b46', false, 1.05);
  rnpc(R, 4.6, 0.9, 0, { shirt: '#2f7d58', pants: '#2b3240' }, 'clerk');
  act(R, 4.4, 3.2, 2.2, () => rob ? null : inv.cur > 0 ? (game.time - R.cool < 180 ? '（收銀機是空的）' : '搶劫收銀機') : '買東西', () => { if (inv.cur > 0) { if (game.time - R.cool >= 180) startRob(R); } else openMenu(name, [{ n: '便當', p: 80, d: '生命 +40', fn: () => { player.hp = Math.min(100, player.hp + 40); survEat(45); } }, { n: '金門高粱（小瓶）', p: 300, d: '生命回滿', fn: () => { player.hp = 100; survEat(10); } }, { n: '一條根貼布', p: 150, d: '護甲 +25', fn: () => { player.armor = Math.min(100, player.armor + 25); } }, { n: '貢糖禮盒', p: 200, d: '生命 +60', fn: () => { player.hp = Math.min(100, player.hp + 60); survEat(60); } }]); });
  R.robSpot = [4.4, 3.2, 3.5]; return R;
}
function buildGunShop(name, lat, lon) {
  const R = shellRoom(lat, lon, name, 'gun', 14, 10, 2, '#8b8f78', '#5a5f4a', '#6b6456', '金門軍品店', '#3d4630'); if (!R) return null;
  rb(R, 0, -3, 12, 1.05, 0.9, '#3d4630'); rb(R, 0, -4.75, 13, 2.4, 0.2, '#3a3a36', false, 0.6);
  for (let k = 0; k < 7; k++) rb(R, -5.2 + k * 1.75, -4.6, 1.2 - (k % 3) * 0.25, 0.13, 0.08, '#18191a', false, 1.3 + (k % 2) * 0.7); for (const x of [-5.5, 5.5]) { rb(R, x, 1.5, 1, 1.9, 3.2, '#4f5a3a'); rb(R, x, 1.5, 1.1, 0.4, 3, '#2b2b2b', false, 1.9); }
  rsign(R, '武器・彈藥・防彈衣', 0.6, 0, -4.62, 3.3, { color: '#f4e9c8', size: 72 });
  rnpc(R, 0, -3.9, 0, { shirt: '#59603d', pants: '#2b2b2b' }, 'clerk');
  const buy = i => ({ n: WEAPONS[i].name + (inv.has[i] ? '（補彈）' : ''), p: inv.has[i] ? Math.round(WEAPONS[i].price * 0.2) : WEAPONS[i].price, d: `子彈 +${WEAPONS[i].ammo}`, fn: () => giveWeapon(i, WEAPONS[i].ammo) });
  act(R, 0, -1.6, 2.6, () => '買武器', () => openMenu(name, [buy(1), buy(2), buy(3), buy(4), { n: '手榴彈 ×3', p: 900, d: '按 G 投擲', fn: () => { player.nades = (player.nades || 0) + 3; refreshWeapon(); } }, { n: '防彈衣', p: 1200, d: '護甲補滿', fn: () => { player.armor = 100; } }]));
  return R;
}
function buildDorm(at) {
  const R = shellRoom(0, 0, '學生宿舍', 'home', 12, 9, 4, '#ecdfc6', '#e9e2d0', '#a9896a', '學生宿舍', '#7c2f25', at); if (!R) return null;
  { // 波浪形山牆（宿舍實景屋頂線）：前後兩面，三個弧峰
    const top = R.Y + R.H + 0.3 + 3 * 3.3 + 0.5, w = R.w + 1, sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); const n = 3;
    for (let i = 0; i < n; i++) { const x0 = -w / 2 + i * w / n, x1 = x0 + w / n, xm = (x0 + x1) / 2; sh.lineTo(x0 + w / n * 0.12, 1.1); sh.bezierCurveTo(xm - w / n * 0.2, 1.1, xm - w / n * 0.16, 2.6, xm, 2.6); sh.bezierCurveTo(xm + w / n * 0.16, 2.6, xm + w / n * 0.2, 1.1, x1 - w / n * 0.12, 1.1); sh.lineTo(x1, 0.2); }
    sh.lineTo(w / 2, 0); sh.lineTo(-w / 2, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.45, bevelEnabled: false, curveSegments: 6 });
    const mW = new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.9 });
    for (const side of [1, -1]) { const m = new THREE.Mesh(g, mW), q = R.L(0, side * (R.d / 2 + 0.3)); m.position.set(q.x, top, q.z); m.rotation.y = R.rot + (side > 0 ? 0 : Math.PI); m.translateZ(-0.22); m.castShadow = true; scene.add(m); }
  }
  rb(R, -3.9, -2.6, 2.2, 0.55, 3.4, '#4a6fa5'); rb(R, -3.9, -4.0, 2.2, 0.9, 0.4, '#f1f1f1', false, 0.3); rb(R, 4.0, -3.6, 2.4, 1.0, 1.1, '#8a6a4a'); rb(R, 4.0, -3.8, 0.9, 0.6, 0.1, '#1c2733', false, 1.0); rb(R, 5.2, 1.0, 1.1, 2.4, 2.2, '#7a5a3a'); rb(R, -5.2, 1.6, 1, 1.2, 1.6, '#6f7c85');
  act(R, -2.7, -2.0, 2, () => '睡覺（存檔、回血、時間 +8 小時）', () => { if (wanted.stars) { toast('被通緝時睡不著'); return; } game.busy = true; fade('Zzz…', () => { env.tod = (env.tod + 8) % 24; player.hp = 100; saveGame(); game.busy = false; toast('已存檔'); }); });
  act(R, 4.4, 1.0, 1.8, () => '換衣服', () => restyle(player.model));
  return R;
}
function buildEnterables() {
  buildDorm(missionSpots.dormAt);
  for (const [n, la, lo] of [['金城分行', 24.4350, 118.3195], ['山外分行', 24.4412, 118.4151], ['頂堡分行', 24.4497, 118.3336], ['沙美分行', 24.4880, 118.4145], ['烈嶼分行', 24.4326, 118.2460]]) buildBank('浯島銀行 ' + n, la, lo);
  for (const [n, la, lo] of [['金城', 24.4322, 118.3192], ['大學', 24.4443, 118.3263], ['頂堡', 24.4502, 118.3356], ['山外', 24.4426, 118.4153], ['沙美', 24.4894, 118.4139], ['東林', 24.4320, 118.2447], ['水頭', 24.4104, 118.2996]]) buildStore('浯島便利店 ' + n + '店', la, lo);
  buildGunShop('金門軍品店 金城店', 24.4344, 118.3170); buildGunShop('金門軍品店 山外店', 24.4417, 118.4158); buildGunShop('金門軍品店 東林店', 24.4310, 118.2430); buildHeritage();
}

/* ---------- 搶劫 ---------- */
function startRob(R) {
  rob = { room: R, stage: 1, t: 0, got: 0, beep: 0 }; R.cool = game.time; scareRoom(R); wanted.cd = 0;
  if (R.type === 'bank') { crimeMin(3); subtitle('搶劫中！<b>待在櫃檯前</b>，行員正在裝錢…', 6); for (const c of cops) if (c.room === R) c.alert = true; } else { crimeMin(2); subtitle('店員正在把收銀機的錢拿出來…', 4); }
}
function endRob(ok) { if (!rob && !player.loot) return; if (ok && player.loot > 0) { const n = player.loot; addMoney(n); banner('搶劫成功', '贓款入袋 $' + n.toLocaleString()); if (story.onRob) story.onRob(n); } player.loot = 0; addLoot(0); rob = null; $('prog').style.display = 'none'; }
function updateRob(dt) {
  if (!rob) return; const R = rob.room, here = player.inside === R, bar = $('prog'), fill = bar.firstElementChild;
  if (here) { rob.beep -= dt; if (rob.beep <= 0) { rob.beep = 0.7; sfx('alarm', 0.12); } }
  if (rob.stage === 1) { const total = R.type === 'bank' ? 12000 : 1400, rate = R.type === 'bank' ? 1500 : 500, q = R.L(R.robSpot[0], R.robSpot[1]); if (here && Math.hypot(player.pos.x - q.x, player.pos.z - q.z) < R.robSpot[2]) { const n = Math.min(total - rob.got, Math.ceil(rate * dt)); rob.got += n; addLoot(n); bar.style.display = 'block'; fill.style.width = rob.got / total * 100 + '%'; if (rob.got >= total) { bar.style.display = 'none'; if (R.type === 'bank') { rob.stage = 2; subtitle('櫃檯的錢到手了！<b>金庫</b>在右後方——過去按 E 撬開，或現在就跑。甩掉警察錢才算你的。', 8); } else { rob.stage = 9; subtitle('到手了，快跑！甩掉警察錢才算你的。', 5); } } } else bar.style.display = 'none'; }
  else if (rob.stage === 3) { const q = R.L(4.75, -3.9); if (here && Math.hypot(player.pos.x - q.x, player.pos.z - q.z) < 3) { rob.t += dt; bar.style.display = 'block'; fill.style.width = rob.t / 6 * 100 + '%'; if (rob.t >= 6) { bar.style.display = 'none'; R.vault.off = true; R.vaultMesh.visible = false; R.vaultOpen = true; for (const x of [-7, -4, -1, 2]) { const p = R.L(x, -6.6); addPickup('loot', p.x, p.z, 9000, R.Y); } crimeMin(4); rob.stage = 9; sfx('chime'); subtitle('金庫開了！把錢拿走，然後<b>甩掉警察</b>。', 6); } } else { bar.style.display = 'none'; rob.stage = 2; } }
}
