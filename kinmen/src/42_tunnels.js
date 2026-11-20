/* =====================================================================
   坑道與秘境：入口在真實座標，內部用格子地圖蓋在地圖外的地底空間
   # 岩壁  . 地面  ~ 水道  S 起點  1/2 出口（對應入口）  L 燈  $ 機密檔案
   C 火砲  B 望遠鏡  P 舞台  s 座位  W 武器箱  b 船
   ===================================================================== */
const tunnels = [], secretsFound = new Set();
try { for (const n of JSON.parse(localStorage.getItem('kinmen_secrets') || '[]')) secretsFound.add(n); } catch (e) { }
const TUNNEL_DEFS = [
  { name: '翟山坑道', at: [[24.39003, 118.31995]], H: 7, desc: 'A 字型戰備水道，花崗岩全靠人工開鑿', map: [
    '###########################',
    '#S.....L.......L.........1#',
    '#.#######################.#',
    '#.#.....L.....$.....L...#.#',
    '#L#.~~~~~~~~~~~~~~~~~~~.#L#',
    '#...~~~~~~~~b~~~~~~~~~~...#',
    '#.#.~~~~~~~~~~~~~~~~~~~.#.#',
    '#.#.....L...........L...#.#',
    '#.#######################.#',
    '#.........................#',
    '###########################'] },
  { name: '九宮坑道', at: [[24.42379, 118.26262], [24.4248, 118.2660]], H: 6.5, desc: '烈嶼的戰備水道，有兩個出入口', map: [
    '#############################',
    '#S....L.....~~~~~.....L....2#',
    '#.##########~~~~~#########..#',
    '#L#....L....~~~~~...L....#.L#',
    '#...........~~~~~...........#',
    '#.#.....$...~~~~~...b....#..#',
    '#.##########~~~~~#########..#',
    '#1..........~~~~~...........#',
    '#############################'] },
  { name: '擎天廳', at: [[24.45377, 118.40649]], H: 15, desc: '太武山腹內，用炸藥一寸寸挖出的大禮堂', map: [
    '#################',
    '#PPPPPPPPPPPPPPP#',
    '#PPPPPPPPPPPPPPP#',
    '#...............#',
    '#.sssss...sssss.#',
    '#.sssss...sssss.#',
    '#.sssss...sssss.#',
    '#.sssss...sssss.#',
    '#L.............L#',
    '#.sssss...sssss.#',
    '#.sssss.$.sssss.#',
    '#L.............L#',
    '########...######',
    '########.L.######',
    '########...######',
    '########.S.######',
    '########.1.######',
    '#################'] },
  { name: '瓊林戰鬥坑道', kind: 'concrete', at: [[24.45514, 118.37306], [24.4562, 118.3752]], H: 2.6, desc: '村子底下的地道，家家戶戶都有暗門', map: [
    '#####################',
    '#S..#.....L....#...2#',
    '###.#.####.###.#.####',
    '#...#.#..#...#...#..#',
    '#.###.#..###.#####..#',
    '#.L.....#..$.....L..#',
    '###.###.#.####.###.##',
    '#...#...#....#...#..#',
    '#.###.######.###.#..#',
    '#1....L........W....#',
    '#####################'] },
  { name: '獅山砲陣地', at: [[24.50395, 118.43708]], H: 6, desc: '八吋榴砲藏在山洞裡，一聲令下推出洞口', map: [
    '###########################',
    '#S......L.......L........1#',
    '#.###.#######.#######.###.#',
    '#L#C#.#..C..#.#..C..#.#C#L#',
    '#.#.#.#.....#.#.....#.#.#.#',
    '#...........W.........$...#',
    '###########################'] },
  { name: '馬山觀測所', kind: 'concrete', at: [[24.52772, 118.40888]], H: 3.2, desc: '最靠近對岸的前線，望遠鏡看得到廈門', map: [
    '###############',
    '#.....B.B.....#',
    '#.............#',
    '######...######',
    '######.L.######',
    '######...######',
    '######.$.######',
    '######...######',
    '######.L.######',
    '######...######',
    '######.S.######',
    '######.1.######',
    '###############'] },
  { name: '慈湖三角堡', kind: 'concrete', at: [[24.46520, 118.29732]], H: 2.5, desc: '慈湖邊的三角形碉堡，低矮的地道通往射口', map: [
    '#############',
    '#.....$.....#',
    '##.##...##.##',
    '###.#...#.###',
    '####.#L#.####',
    '#####...#####',
    '#####.S.#####',
    '#####.1.#####',
    '#############'] },
  { name: '地雷主題館', kind: 'concrete', at: [], noPortal: true, H: 2.6, desc: '勇士堡與鐵漢堡之間的坑道，展示各式地雷。中間那段是模擬地雷步道，小心腳下', map: [
    '########################',
    '##..M...M..L..M...M..###',
    '#1S.L...mmmmmmmm..L.T2##',
    '##..M...M..L..M...M..###',
    '########################'] }];
const mRock = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, map: canvasTex(256, 256, g => { const im = g.createImageData(256, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const n = pfbm(x / 256 * 10, y / 256 * 10, 10), sp = hash2(x, y) > 0.93 ? 30 : 0, v = clamp(120 + (n - 0.5) * 120 + sp, 0, 255), i = (y * 256 + x) * 4; im.data[i] = v * 0.98; im.data[i + 1] = v * 0.95; im.data[i + 2] = v * 0.9; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }, true) });
const mBulb = new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xffd28a, emissiveIntensity: 3 });
const mVault = mRock.clone(); mVault.side = THREE.DoubleSide;
const MINE_NAMES = ['反戰車雷', '跳雷', '絆發雷', '蝶形雷', '反人員雷', '詭雷', '闊刀地雷', '塑膠地雷'];
function buildTunnels() {
  batch('vault', new THREE.CylinderGeometry(1, 1, 1, 18, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2), mVault, false);
  batch('rock', GEO.box, mRock); batch('bulb', new THREE.SphereGeometry(0.18, 8, 6), mBulb, false);
  const CS = 3; let k = 0;
  for (const D of TUNNEL_DEFS) {
    const ox = 6200 + (k % 4) * 260, oz = Math.floor(k / 4) * 260 - 200, Y = 2, T = { ...D, ox, oz, Y, exits: [], surf: null, mouths: [] }; k++;
    const rows = D.map.length, cols = D.map[0].length, at = (r, c) => (r < 0 || c < 0 || r >= rows || c >= cols) ? '#' : D.map[r][c];
    const W = (c) => ox + (c - cols / 2) * CS, Z = (r) => oz + (r - rows / 2) * CS, conc = D.kind === 'concrete';
    const wallC = () => conc ? new THREE.Color().setHSL(0.1, 0.04, 0.62 + rand() * 0.06) : new THREE.Color().setHSL(0.08, 0.14, 0.52 + rand() * 0.12);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const ch = at(r, c), x = W(c), z = Z(r);
      if (ch === '#') { let adj = false; for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) if (at(r + dr, c + dc) !== '#') adj = true; if (!adj) continue; BT.rock.add(MX(x, Y - 0.5, z, 0, CS, D.H + 1, CS), wallC()); addBox(x, z, CS / 2, CS / 2, 0); continue; }
      BT.rock.add(MX(x, Y + D.H + 0.4, z, 0, CS, 0.6, CS), wallC());
      if (ch === '~' || ch === 'b') { if (ch === 'b') T.boat = { x, z }; continue; }
      BT.cbox.add(MX(x, Y - 0.6, z, 0, CS, 0.6, CS), new THREE.Color(ch === 'P' ? '#6b4a34' : conc ? '#77756f' : '#6a6257')); addDeck(x, z, CS / 2, CS / 2, 0, Y);
      if (ch === 'S') T.start = { x, z }; if (ch === 'T') T.start2 = { x, z };
      if (ch === 'm') { (T.mines || (T.mines = [])).push({ x, z }); BT.cbox.add(MX(x, Y + 0.01, z, 0, CS * 0.96, 0.02, CS * 0.96), new THREE.Color('#5a4a32')); }
      if (ch === 'M') { BT.cbox.add(MX(x, Y, z, 0, 1.4, 0.9, 1.4), new THREE.Color('#d8d2c4')); BT.ccyl.add(MX(x, Y + 0.9, z, 0, 0.45, 0.16, 0.45), new THREE.Color(pick(['#4f5a3a', '#3e4630', '#5c5a4a']))); BT.ccyl.add(MX(x, Y + 1.06, z, 0, 0.1, 0.06, 0.1), new THREE.Color('#8f8a7a')); addBox(x, z, 0.75, 0.75, 0); T.mk = (T.mk || 0) + 1; const lb = signMesh(MINE_NAMES[(T.mk - 1) % MINE_NAMES.length], 0.32, { color: '#ffde3b', bg: '#1d1d1d', size: 48, pad: 6 }); const fz = r < rows / 2 ? 1 : -1; lb.position.set(x, Y + 0.55, z + fz * 0.72); lb.rotation.y = fz > 0 ? 0 : Math.PI; scene.add(lb); } if (ch === '1' || ch === '2') T.exits.push({ i: +ch - 1, x, z });
      if (ch === 'L' && conc) BT.bulb.add(MX(x, Y + D.H - 0.12, z, 0, 0.35, 0.25, 7));
      else if (ch === 'L') { BT.bulb.add(MX(x, Y + Math.min(D.H, 4.5) - 0.4, z)); BT.ccyl.add(MX(x, Y + Math.min(D.H, 4.5) - 0.25, z, 0, 0.02, 0.3, 0.02), COL.dark); }
      if (ch === '$' && !secretsFound.has(D.name)) { const p = addPickup('secret', x, z, 0, Y); p.secret = D.name; p.perm = false; }
      if (ch === 'W') addPickup(pick(['rifle', 'shotgun', 'smg', 'armor']), x, z, 0, Y);
      if (ch === 'P') BT.cbox.add(MX(x, Y, z, 0, CS, 1.2, CS), new THREE.Color('#7a5236'));
      if (ch === 's') { BT.cbox.add(MX(x, Y, z, 0, CS * 0.9, 0.45, 0.5), new THREE.Color('#8b2a2a')); BT.cbox.add(MX(x, Y + 0.45, z - 0.3, 0, CS * 0.9, 0.6, 0.12), new THREE.Color('#8b2a2a')); }
      if (ch === 'C') { const m = new THREE.Mesh(mergeGeos([[new THREE.BoxGeometry(2.4, 0.5, 3.4), '#4f5a3a', new THREE.Matrix4().makeTranslation(0, 0.7, 0)], [new THREE.CylinderGeometry(0.62, 0.62, 0.5, 12).rotateZ(Math.PI / 2), '#2b2b2b', new THREE.Matrix4().makeTranslation(-1.4, 0.6, 0)], [new THREE.CylinderGeometry(0.62, 0.62, 0.5, 12).rotateZ(Math.PI / 2), '#2b2b2b', new THREE.Matrix4().makeTranslation(1.4, 0.6, 0)], [new THREE.CylinderGeometry(0.24, 0.3, 6.5, 10), '#55603f', new THREE.Matrix4().makeRotationX(Math.PI / 2 + 0.4).setPosition(0, 2.2, -1.5)]]), mVC); m.position.set(x, Y, z); scene.add(m); addBox(x, z, 1.4, 1.4, 0); }
      if (ch === 'B') { const m = new THREE.Mesh(mergeGeos([[new THREE.CylinderGeometry(0.06, 0.08, 1.3, 8), '#2b2b2b', new THREE.Matrix4().makeTranslation(0, 0.65, 0)], [new THREE.CylinderGeometry(0.11, 0.13, 0.6, 10).rotateX(Math.PI / 2), '#3d4630', new THREE.Matrix4().makeTranslation(0.13, 1.4, 0)], [new THREE.CylinderGeometry(0.11, 0.13, 0.6, 10).rotateX(Math.PI / 2), '#3d4630', new THREE.Matrix4().makeTranslation(-0.13, 1.4, 0)]]), mVC); m.position.set(x, Y, z); scene.add(m); addBox(x, z, 0.3, 0.3, 0);
        if (!T.scope) { T.scope = { x, z }; addAction({ x, z, r: 2.2, inside: null, tunnel: T, label: () => '用望遠鏡看對岸（廈門）', fn: () => lookAcross(T) }); } }
    }
    // 拱頂：每段通道依寬度做半圓（或扁拱）頂，花崗岩坑道的招牌樣子
    const vk = new Set(); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (at(r, c) === '#') continue;
      let x0 = c, x1 = c, z0 = r, z1 = r; while (at(r, x0 - 1) !== '#') x0--; while (at(r, x1 + 1) !== '#') x1++; while (at(z0 - 1, c) !== '#') z0--; while (at(z1 + 1, c) !== '#') z1++;
      const sx = x1 - x0 + 1, sz = z1 - z0 + 1, alongZ = sx <= sz, span = alongZ ? sx : sz, key = alongZ ? 'z' + x0 + ',' + x1 + ',' + r : 'x' + z0 + ',' + z1 + ',' + c; if (vk.has(key)) continue; vk.add(key);
      const R = span * CS / 2, Hv = Math.min(R, D.H * (conc ? 0.4 : 0.45)), cx = alongZ ? (W(x0) + W(x1)) / 2 : W(c), cz = alongZ ? Z(r) : (Z(z0) + Z(z1)) / 2;
      BT.vault.add(MX(cx, Y + D.H - Hv, cz, alongZ ? 0 : Math.PI / 2, R, Hv, CS + 0.02), wallC()); }
    // 水道：沿水面兩側一排暖色壁燈（翟山、九宮的經典畫面）
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if ((at(r, c) === '~' || at(r, c) === 'b') && c % 2 === 0) for (const dr of [-1, 1]) { const n = at(r + dr, c); if (n !== '~' && n !== 'b') BT.bulb.add(MX(W(c), Y - 0.35, Z(r) + dr * (CS / 2 - 0.15), 0, 0.5, 0.5, 0.5)); }
    { let best = null; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (at(r, c) === 'S') { let bd = -1; for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { let n = 0; while (n < 30 && at(r + dr * (n + 1), c + dc * (n + 1)) !== '#' && at(r + dr * (n + 1), c + dc * (n + 1)) !== '1' && at(r + dr * (n + 1), c + dc * (n + 1)) !== '2') n++; if (n > bd) { bd = n; best = Math.atan2(dc, dr); } } } T.startYaw = best ?? Math.PI; }
    // 水道兩側石欄、舞台布幕、名牌
    if (D.name === '擎天廳') { const s = signMesh('擎天廳', 2.2, { color: '#f1d27a', bg: '#7c2f25', size: 96 }); s.position.set(ox, Y + 9, Z(0) + CS / 2 + 0.05); scene.add(s); BT.cbox.add(MX(ox, Y + 1.2, Z(0) + CS / 2 + 0.1, 0, (cols - 2) * CS, 7, 0.1), new THREE.Color('#5a1f1f')); }
    { const e = T.start; const s = signMesh(D.name, 0.9, { color: '#f4e9c8', bg: '#3d4630', size: 80, pad: 12 }); const bf = fwd(T.startYaw); s.position.set(e.x - bf.x * (CS / 2 - 0.06), Y + Math.min(D.H - 0.9, 3.0), e.z - bf.z * (CS / 2 - 0.06)); s.rotation.y = T.startYaw; scene.add(s); }
    if (T.boat) { const v = makeVehicle('boat', T.boat.x, T.boat.z, Math.PI / 2); v.perm = true; v.tunnelBoat = true; }
    // 地面上的坑道口
    D.at.forEach((ll, i) => { const s = spot(ll[0], ll[1], 3.5, 14); if (!s) return; const y = groundAt(s.x, s.z) - 0.2, fx = Math.sin(s.rot), fz = Math.cos(s.rot), ux = Math.cos(s.rot), uz = -Math.sin(s.rot), back = { x: s.x - fx * 2, z: s.z - fz * 2 };
      // 花崗岩小山＋半圓拱門（坑道是從花崗岩裡鑿出來的）
      for (let q = 0; q < 9; q++) { const a = (q / 8 - 0.5) * 2.6, dd = 2.2 + Math.abs(a) * 1.4 + rand() * 1.2, rx = back.x - fx * dd * 0.6 + ux * Math.sin(a) * 5, rz = back.z - fz * dd * 0.6 + uz * Math.sin(a) * 5, g = 0.5 + rand() * 0.14; BT.cbox.add(MX(rx, y - 0.8, rz, s.rot + rr(-0.5, 0.5), rr(3.5, 5.5), rr(4.5, 7.5) * (1 - Math.abs(a) * 0.25), rr(3.5, 5), rr(-0.15, 0.15), rr(-0.15, 0.15)), new THREE.Color(g, g * 0.97, g * 0.92)); }
      BT.cbox.add(MX(back.x - fx * 2.5, y - 0.5, back.z - fz * 2.5, s.rot, 9.5, 6.8, 6), new THREE.Color('#7f7c72')); addBox(back.x - fx * 1.2, back.z - fz * 1.2, 4.6, 3.4, s.rot);
      for (let q = 0; q < 3; q++) { const tx = back.x - fx * (3 + q) + ux * rr(-3, 3), tz = back.z - fz * (3 + q) + uz * rr(-3, 3); BT.trunk.add(MX(tx, y + 5.6, tz, 0, 0.8, 2.4, 0.8)); BT.leaf.add(MX(tx, y + 8.4, tz, rand() * 6, 2.6, 2.1, 2.6), pick(LEAF)); }
      { const px = s.x + fx * 0.5, pz = s.z + fz * 0.5, sh = new THREE.Shape(); sh.moveTo(-1.55, 0); sh.lineTo(1.55, 0); sh.lineTo(1.55, 2.2); sh.absarc(0, 2.2, 1.55, 0, Math.PI, false); sh.lineTo(-1.55, 0);
        const hole = new THREE.Mesh(new THREE.ShapeGeometry(sh, 12), new THREE.MeshBasicMaterial({ color: 0x050505 })); hole.position.set(px, y, pz); hole.rotation.y = s.rot; scene.add(hole);
        const arch = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.32, 6, 18, Math.PI), mat('#a8a397', 0.9)); arch.position.set(px + fx * 0.05, y + 2.2, pz + fz * 0.05); arch.rotation.y = s.rot; scene.add(arch);
        for (const sd of [-1, 1]) BT.cbox.add(MX(px + ux * sd * 1.8 + fx * 0.05, y, pz + uz * sd * 1.8 + fz * 0.05, s.rot, 0.64, 2.2, 0.64), new THREE.Color('#a8a397')); }
      addSign(D.name, 0.55, s.x + fx * 0.75, y + 4.7, s.z + fz * 0.75, s.rot, { color: '#f4e9c8', bg: '#3d4630', size: 72, pad: 10 });
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.35, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x9b59b6, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); ring.position.set(s.x + fx * 1.9, y + 0.4, s.z + fz * 1.9); scene.add(ring);
      T.mouths[i] = { x: s.x + fx * 1.9, z: s.z + fz * 1.9, yaw: s.rot, trig: { x: s.x + fx * 1.25, z: s.z + fz * 1.25 } }; });
    if (D.noPortal) { if (T.start2) { let bd = -1, best = 0; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (at(r, c) === 'T') for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { let n = 0; while (n < 30 && !'#12'.includes(at(r + dr * (n + 1), c + dc * (n + 1)))) n++; if (n > bd) { bd = n; best = Math.atan2(dc, dr); } } T.startYaw2 = best; } tunnels.push(T); continue; }
    if (!T.mouths.length) continue; PLACES.push({ name: D.name, x: T.mouths[0].x, z: T.mouths[0].z, r: 30 }); tunnels.push(T);
  }
}
function enterTunnel(T, i) {
  if (game.busy) return; game.busy = true; T.surf = T.mouths[i] || T.mouths[0]; sfx('door', 0.3);
  fade(T.name, () => { player.tunnel = T; const s2 = i === 1 && T.start2, s = s2 || T.start, y0 = s2 ? T.startYaw2 : T.startYaw, f0 = fwd(y0); player.pos.set(s.x + f0.x * 2.2, T.Y, s.z + f0.z * 2.2); player.yaw = y0; cam.yaw = y0; cam.pitch = 0.12; cam.pos.set(s.x - f0.x * 0.8, T.Y + 1.6, s.z - f0.z * 0.8); lastZone = ''; game.busy = false; nearT = 0;
    if (!T.seen) { T.seen = true; subtitle(`<b>${T.name}</b>　${T.desc}${T.map.join('').includes('$') && !secretsFound.has(T.name) ? '。裡面藏著一份<b>軍事機密檔案</b>。' : ''}`, 7); } });
}
function exitTunnel(i) {
  const T = player.tunnel; if (!T || game.busy) return; game.busy = true; const m = T.mouths[i] || T.mouths[0];
  fade('', () => { player.tunnel = null; const f = fwd(m.yaw); player.pos.set(m.x + f.x * 1.5, heightAt(m.x + f.x * 1.5, m.z + f.z * 1.5), m.z + f.z * 1.5); player.yaw = m.yaw; cam.yaw = m.yaw; cam.pos.set(player.pos.x - f.x * 5, player.pos.y + 3, player.pos.z - f.z * 5); roomLight.intensity = 0; lastZone = ''; game.busy = false; nearT = 0; });
}
function lookAcross(T) {
  const m = T.mouths[0], f = fwd(m.yaw); game.busy = true; $('letter').classList.add('show'); const sx = m.x, sz = m.z, sy = Math.max(0, groundAt(sx, sz)) + 14;
  player.scopeView = true; cam.free = { p: new V3(sx, sy, sz), t: new V3(sx + 0.2 * 1000, 4, sz - 1000) }; const oldFov = camera.fov; camera.fov = 16; camera.updateProjectionMatrix();
  subtitle('望遠鏡裡，對岸的高樓清清楚楚。最近的地方，兩岸只隔兩公里。', 5);
  setTimeout(() => { cam.free = null; player.scopeView = false; camera.fov = oldFov; camera.updateProjectionMatrix(); $('letter').classList.remove('show'); game.busy = false; }, 5200);
}
var CITY_LIGHTS = CITY_LIGHTS || [];
// 對岸天際線（只在遠方海上，望遠鏡看得到）
function buildFarShore() {
  const g = []; let x = -1600; while (x < 2600) { const w = rr(14, 40), h = rr(20, 120), d = rr(14, 30), zc = -2600 + rr(-60, 60); g.push([new THREE.BoxGeometry(w, h, d), pick(['#9aa3ab', '#b5bcc2', '#8c939a', '#c4c9cc']), new THREE.Matrix4().makeTranslation(x, h / 2, zc)]); for (let k = 0; k < w * h / 60; k++) CITY_LIGHTS.push(x + rr(-w / 2 + 1, w / 2 - 1), rr(3, h - 2), zc + d / 2 + 0.6); x += w + rr(2, 30); }
  const m = new THREE.Mesh(mergeGeos(g), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, fog: false, transparent: true, opacity: 0.55 })); scene.add(m);
}
function updateTunnels(dt) {
  const T = player.tunnel;
  if (!T) { if (!player.veh && !player.plane && !game.busy) for (const t of tunnels) for (let i = 0; i < t.mouths.length; i++) { const m = t.mouths[i]; if (m && Math.abs(player.pos.x - m.trig.x) < 1.3 && Math.abs(player.pos.z - m.trig.z) < 1.3 && game.time - (t.left || -9) > 2) { enterTunnel(t, i); return; } } return; }
  roomLight.position.set(player.pos.x + Math.sin(player.yaw) * 2, T.Y + Math.min(T.H, 4.5) - 0.3, player.pos.z + Math.cos(player.yaw) * 2); roomLight.intensity = T.H > 8 ? 26 : 13; roomLight.distance = T.H > 8 ? 60 : 22;
  if (!game.busy) for (const e of T.exits) if (Math.abs(player.pos.x - e.x) < 1.2 && Math.abs(player.pos.z - e.z) < 1.2) { T.left = game.time; exitTunnel(e.i); return; }
}
