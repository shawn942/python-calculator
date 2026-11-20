/* =====================================================================
   金門特色地標與地景
   得月樓、太武山（花崗岩、毋忘在莒、海印寺）、北山播音牆、歐厝戰車殘骸、
   貞節牌坊、反空降樁、木麻黃行道樹
   ===================================================================== */
var deyueAt = null;
function deyueLou() {
  const s = spot(24.4098, 118.2985, 4.5, 16); if (!s) return; deyueAt = { x: s.x, z: s.z }; const y = groundAt(s.x, s.z) - 0.2, r = s.rot, W = 5.4;
  hb(s.x, y, s.z, W, 9.6, W, '#c96a4f', r); hb(s.x, y, s.z, W + 0.3, 0.9, W + 0.3, '#bfb8aa', r);
  hb(s.x, y + 9.6, s.z, W + 0.3, 4.2, W + 0.3, '#f1ebe0', r); hb(s.x, y + 13.8, s.z, W + 0.7, 0.35, W + 0.7, '#e2dccf', r);
  const f = fwd(r), u = { x: Math.cos(r), z: -Math.sin(r) };
  for (let k = -2; k <= 2; k++) for (const [a, b] of [[f, u], [u, f], [{ x: -f.x, z: -f.z }, u], [{ x: -u.x, z: -u.z }, f]]) { if (k % 2) continue; hb(s.x + a.x * (W / 2 + 0.2) + b.x * k * 1.1, y + 14.15, s.z + a.z * (W / 2 + 0.2) + b.z * k * 1.1, 0.7, 0.8, 0.7, '#f1ebe0', r); }
  for (const yy of [3.2, 6.4, 10.8]) for (const sd of [-1, 1]) hb(s.x + f.x * (W / 2 + 0.02) + u.x * sd * 1.2, y + yy, s.z + f.z * (W / 2 + 0.02) + u.z * sd * 1.2, 0.35, 0.6, 0.06, '#2b2b2b', r);
  hb(s.x + f.x * (W / 2 + 0.02), y, s.z + f.z * (W / 2 + 0.02), 1.3, 2.4, 0.08, '#5a3b28', r);
  addSign('得月樓', 0.55, s.x + f.x * (W / 2 + 0.08), y + 12.6, s.z + f.z * (W / 2 + 0.08), r, { color: '#7c2f25', bg: '#f1ebe0', size: 80, pad: 6 });
  const dyBox = addBox(s.x, s.z, W / 2, W / 2, r); PLACES.push({ name: '得月樓', x: s.x, z: s.z, r: 14 });
  // 爬上槍樓頂：屋頂女兒牆內可以站，看水頭聚落和金廈海域
  const top = y + 14.15; dyBox.top = top; addDeck(s.x, s.z, W / 2 + 0.2, W / 2 + 0.2, r, top); const door = { x: s.x + f.x * (W / 2 + 1.6), z: s.z + f.z * (W / 2 + 1.6) };
  addAction({ x: door.x, z: door.z, r: 2.2, inside: null, label: () => player.pos.y < top - 1 ? '⬆ 爬上得月樓槍樓頂' : null, fn: () => fade('沿著窄樓梯往上爬……', () => { player.pos.set(s.x, top, s.z); player.yaw = r; cam.yaw = r; subtitle('<b>得月樓</b>：1931 年旅居南洋的水頭人黃輝煌興建的槍樓，用來防範海盜土匪。名字取自「近水樓台先得月」。從這裡可以看到整個水頭聚落和對岸。', 9); }) });
  addAction({ x: s.x, z: s.z, r: 3.2, inside: null, label: () => player.pos.y > top - 0.6 ? '⬇ 下樓' : null, fn: () => fade('下樓……', () => { player.pos.set(door.x, heightAt(door.x, door.z), door.z); player.yaw = r; }) });
}
function graniteRock(x, z, sc) { const y = groundAt(x, z) - 0.4 * sc, g = 0.55 + rand() * 0.15; BT.cbox.add(MX(x, y, z, rand() * 6, sc * rr(1.6, 2.6), sc * rr(1.0, 1.8), sc * rr(1.4, 2.2), rr(-0.25, 0.25), rr(-0.25, 0.25)), new THREE.Color(g, g * 0.98, g * 0.94)); addBox(x, z, sc * 0.9, sc * 0.9, 0); }
function taiwuShan() {
  const c = GW(24.4625, 118.4130);
  for (let k = 0; k < 260; k++) { const a = rand() * 6.283, d = Math.sqrt(rand()) * 210, x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d * 0.8; if (!roadClear(x, z, 3) || !boxFree(x, z, 2.5) || sdAt(x, z) < 20 || groundAt(x, z) < 12) continue; graniteRock(x, z, rr(0.8, 2.2) * (1 - d / 400)); }
  // 毋忘在莒：巨石上的紅色直書石刻
  { const s = spot(24.4618, 118.4085, 4, 30); if (s) { const y = groundAt(s.x, s.z) - 0.6; hb(s.x, y, s.z, 5.5, 7.5, 4.2, '#a19c92', s.rot); hb(s.x + 0.6, y + 6.5, s.z - 0.4, 4.2, 2.2, 3.4, '#9a958b', s.rot + 0.2); for (const sd of [1, -1]) { const t = signMesh('毋忘在莒', 5.2, { vertical: true, color: '#c0271d', size: 120 }); t.material.transparent = true; t.position.set(s.x + Math.sin(s.rot) * 2.13 * sd, y + 3.9, s.z + Math.cos(s.rot) * 2.13 * sd); t.rotation.y = s.rot + (sd < 0 ? Math.PI : 0); scene.add(t); } addBox(s.x, s.z, 2.8, 2.1, s.rot); PLACES.push({ name: '毋忘在莒', x: s.x, z: s.z, r: 16 }); } }
  // 海印寺：山頂古寺＋石門關
  { const s = spot(24.4632, 118.4148, 7, 30); if (s) { const y = groundAt(s.x, s.z) - 0.3, r = s.rot, f = fwd(r), u = { x: Math.cos(r), z: -Math.sin(r) };
    hb(s.x, y, s.z, 12, 4.2, 9, '#e9dcc3', r); hb(s.x, y + 4.2, s.z, 13.4, 0.6, 10.4, '#b3412c', r); hb(s.x, y + 4.8, s.z, 10.5, 1.4, 7.8, '#a8392a', r); hb(s.x, y + 6.2, s.z, 12.6, 0.4, 0.6, '#7a2f22', r);
    for (const sd of [-1, 1]) BT.cbox.add(MX(s.x + u.x * sd * 6.8, y + 6.3, s.z + u.z * sd * 6.8, r, 1.8, 0.24, 0.4, 0, sd * 0.6), new THREE.Color('#7a2f22'));
    for (const sd of [-1.5, 0, 1.5]) hb(s.x + f.x * 4.52 + u.x * sd * 2.4, y, s.z + f.z * 4.52 + u.z * sd * 2.4, 1.4, 2.8, 0.08, sd ? '#8c1d18' : '#5a3b28', r);
    addSign('海印寺', 0.85, s.x + f.x * 4.6, y + 3.6, s.z + f.z * 4.6, r, { color: '#f4d27a', bg: '#7c2f25', size: 80, pad: 8 }); addBox(s.x, s.z, 6, 4.5, r);
    const gx = s.x + f.x * 14, gz = s.z + f.z * 14, gy = groundAt(gx, gz) - 0.3; for (const sd of [-1, 1]) { hb(gx + u.x * sd * 2.2, gy, gz + u.z * sd * 2.2, 1.4, 3.6, 1.4, '#a19c92', r); addBox(gx + u.x * sd * 2.2, gz + u.z * sd * 2.2, 0.7, 0.7, r); } hb(gx, gy + 3.6, gz, 5.9, 1.1, 1.6, '#a19c92', r);
    addSign('石門關', 0.5, gx + f.x * 0.85, gy + 4.15, gz + f.z * 0.85, r, { color: '#7c2f25', bg: '#c9c4b8', size: 64, pad: 6 }); PLACES.push({ name: '海印寺', x: s.x, z: s.z, r: 20 }); } }
}
function beishanBroadcast() {
  const s = spot(24.4878, 118.3036, 5, 20); if (!s) return; const y = groundAt(s.x, s.z) - 0.2, r = s.rot, f = fwd(r);
  hb(s.x, y, s.z, 9, 7.5, 6, '#8d9180', r); hb(s.x, y + 7.5, s.z, 9.4, 0.4, 6.4, '#777b6c', r);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) hb(s.x + f.x * 3.02 + Math.cos(r) * (i - 1.5) * 1.9, y + 1.6 + j * 1.9, s.z + f.z * 3.02 - Math.sin(r) * (i - 1.5) * 1.9, 1.5, 1.5, 0.12, '#2a2c26', r);
  addSign('北山播音牆', 0.7, s.x + f.x * 3.1, y + 7.0, s.z + f.z * 3.1, r, { color: '#fff', bg: '#4b5040', size: 72, pad: 8 }); addBox(s.x, s.z, 4.5, 3, r);
  addAction({ x: s.x + f.x * 5, z: s.z + f.z * 5, r: 4, inside: null, label: () => '聽播音牆廣播', fn: () => { sfx('chime', 0.2); subtitle('<b>北山播音牆</b>：（當年這面牆裝了 48 個喇叭，對著對岸播送音樂和喊話。）', 6); } });
  PLACES.push({ name: '北山播音牆', x: s.x, z: s.z, r: 16 });
}
function ouCuoTank() {
  const bp = PLACES.find(p => p.name === '歐厝沙灘'); if (!bp) return; let best = null; for (let k = 0; k < 60 && !best; k++) { const x = bp.x + rr(-25, 25), z = bp.z + rr(-25, 25); if (boxFree(x, z, 3) && groundAt(x, z) > -1.5) best = { x, z }; } if (!best) best = { x: bp.x, z: bp.z };
  const y = Math.max(groundAt(best.x, best.z), -0.6) - 0.5, r = rand() * 6, rust = '#6b4a34';
  hb(best.x, y, best.z, 3.6, 1.3, 6.4, rust, r); hb(best.x, y + 1.3, best.z, 2.6, 0.9, 3, '#5d3f2b', r); BT.ccyl.add(MX(best.x + Math.sin(r) * 2.8, y + 1.75, best.z + Math.cos(r) * 2.8, r, 0.25, 3.4, 0.25, Math.PI / 2 - 0.15), new THREE.Color('#4f3424'));
  addBox(best.x, best.z, 1.8, 3.2, r); PLACES.push({ name: '歐厝戰車殘骸', x: best.x, z: best.z, r: 14 });
}
function chastityArch() {
  const s = spot(24.4322, 118.3177, 3.5, 14); if (!s) return; const y = groundAt(s.x, s.z) - 0.2, r = s.rot, u = { x: Math.cos(r), z: -Math.sin(r) }, f = fwd(r);
  for (const sd of [-2.6, -0.9, 0.9, 2.6]) { hb(s.x + u.x * sd, y, s.z + u.z * sd, 0.55, 5.2, 0.55, '#c9c4b8', r); addBox(s.x + u.x * sd, s.z + u.z * sd, 0.3, 0.3, r); }
  hb(s.x, y + 5.2, s.z, 6.4, 0.6, 0.8, '#bdb8ab', r); hb(s.x, y + 5.8, s.z, 2.4, 1.6, 0.6, '#c9c4b8', r); hb(s.x, y + 7.4, s.z, 3.2, 0.5, 1.0, '#a8a296', r);
  addSign('欽旌節孝', 0.45, s.x + f.x * 0.32, y + 6.6, s.z + f.z * 0.32, r, { color: '#7c2f25', bg: '#c9c4b8', size: 64, pad: 6 }); PLACES.push({ name: '邱良功母節孝坊', x: s.x, z: s.z, r: 12 });
}
function antiAirbornePosts() {
  let n = 0; for (let k = 0; k < 900 && n < 30; k++) { const x = rr(TX0 + 300, -TX0 - 300), z = rr(TZ0 + 200, -TZ0 - 200); if (sdAt(x, z) < 60 || !roadClear(x, z, 26) || !boxFree(x, z, 24) || townAt(x, z) === '' ) continue; const nearTown = TOWNS.some(t => Math.hypot(x - t.x, z - t.z) < t.r + 40); if (nearTown) continue;
    const r = rand() * 3, c = Math.cos(r), s = Math.sin(r); for (let i = -3; i <= 3; i++) for (let j = -2; j <= 2; j++) { if (rand() < 0.25) continue; const px = x + (i * 6 + rr(-0.6, 0.6)) * c + j * 6 * s, pz = z - (i * 6) * s + (j * 6 + rr(-0.6, 0.6)) * c, g = groundAt(px, pz); BT.ccyl.add(MX(px, g - 0.2, pz, 0, 0.32, rr(2.4, 3.2), 0.32, rr(-0.06, 0.06), rr(-0.06, 0.06)), new THREE.Color('#9a968c')); }
    n++; }
}
function casuarinaRows() {
  let n = 0; for (const e of roadEdges) { if (e.bridge || n > 1600) continue; for (let i = 2; i < e.pts.length - 2; i += 2) { const p = e.pts[i]; if (p.town >= 0) continue;
    for (const sd of [-1, 1]) { const off = e.hw + 3.2, x = p.x - p.tz * sd * off, z = p.z + p.tx * sd * off; if (sdAt(x, z) < 16 || !roadClear(x, z, 2.2) || !boxFree(x, z, 1.8) || rand() < 0.25 || inLake(x, z)) continue;
      const y = groundAt(x, z) - 0.1, h = rr(9, 13); if (!natTree(x, z, 1, 1)) { BT.trunk.add(MX(x, y, z, 0, 0.55, h * 0.55, 0.55)); BT.pine.add(MX(x, y + h * 0.3, z, rand() * 6, rr(1.1, 1.5), h * 0.75, rr(1.1, 1.5)), new THREE.Color(rr(0.22, 0.3), rr(0.36, 0.44), rr(0.22, 0.28))); } addBox(x, z, 0.25, 0.25, 0); n++; } } }
}
const mPond = new THREE.MeshStandardMaterial({ color: 0x3f8fb0, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.88 });
const mPondGreen = new THREE.MeshStandardMaterial({ color: 0x2f5a48, roughness: 0.06, metalness: 0.45, transparent: true, opacity: 0.9 }); // 校園池塘偏綠
function pond(x, z, rx, rz, rot = 0, y = null) { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2), mPond); m.scale.set(rx, 1, rz); m.rotation.y = rot; m.position.set(x, y == null ? groundAt(x, z) + 0.08 : y, z); scene.add(m);
  if (y != null) { const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 40).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb9b2a4, roughness: 0.9 })); rim.scale.set(rx, 12, rz); rim.rotation.y = rot; rim.position.set(x, y, z); scene.add(rim);
    const lo = Math.min(groundAt(x + rx, z), groundAt(x - rx, z), groundAt(x, z + rz), groundAt(x, z - rz)); if (y - lo > 0.3) { const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, y - lo + 0.3, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xb9b2a4, roughness: 0.9 })); wall.scale.set(rx, 1, rz); wall.rotation.y = rot; wall.position.set(x, (y + lo - 0.3) / 2, z); scene.add(wall); } }
  return m; }
function mingdePark() {
  const span = q => { let lo = 1e9, hi = -1e9; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const g = groundAt(q.x + i * 8, q.z + j * 8); lo = Math.min(lo, g); hi = Math.max(hi, g); } return hi - lo; };
  let s = null, best = 1e9; for (let k = 0; k < 60 && best > 2.2; k++) { const q = spot(24.4490 + rr(-0.008, 0.006) * (k > 0), 118.4162 + rr(-0.008, 0.008) * (k > 0), 16, 30); if (!q) continue; const d = span(q); if (d < best) { best = d; s = q; } } if (!s) return; const r = s.rot, f = fwd(r), u = { x: Math.cos(r), z: -Math.sin(r) };
  { const px = s.x - f.x * 4, pz = s.z - f.z * 4; let hi = -1e9; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) hi = Math.max(hi, groundAt(px + i * 11, pz + j * 7)); pond(px, pz, 13, 8, r, hi + 0.25); } addBox(s.x - f.x * 4, s.z - f.z * 4, 12, 7, r);
  const ox = s.x + u.x * 11, oz = s.z + u.z * 11, oy = groundAt(ox, oz) - 0.2; hb(ox, oy, oz, 3.2, 0.8, 3.2, '#bdb8ab', r); hb(ox, oy + 0.8, oz, 1.6, 9, 1.6, '#e8e4da', r); hb(ox, oy + 9.8, oz, 0.9, 1.2, 0.9, '#e8e4da', r); addBox(ox, oz, 1.6, 1.6, r);
  const t = signMesh('八二三戰役殉職紀念碑', 6.6, { vertical: true, color: '#7c2f25', size: 90 }); t.position.set(ox + f.x * 0.82, oy + 5.3, oz + f.z * 0.82); t.rotation.y = r; scene.add(t);
  const hx = s.x - u.x * 12, hz = s.z - u.z * 12, hy = groundAt(hx, hz) - 0.2; hb(hx, hy, hz, 8, 6.6, 6, '#efe6d6', r); hb(hx, hy + 6.6, hz, 8.6, 0.4, 6.6, '#bdb9b0', r); hb(hx + f.x * 3.02, hy, hz + f.z * 3.02, 1.2, 2.4, 0.06, '#5a3b28', r); addBox(hx, hz, 4, 3, r);
  addSign('胡璉將軍紀念館', 0.55, hx + f.x * 3.08, hy + 5.4, hz + f.z * 3.08, r, { color: '#fff', bg: '#2f4a6b', size: 64, pad: 8 });
  addAction({ x: ox + f.x * 3, z: oz + f.z * 3, r: 3.5, inside: null, label: () => '看紀念碑', fn: () => subtitle('<b>明德公園</b>：1958 年八二三砲戰，第一發砲彈就落在這裡，三位副司令官吉星文、趙家驤、章傑在此殉職。', 7) });
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28, x = s.x + Math.cos(a) * 22, z = s.z + Math.sin(a) * 18; if (boxFree(x, z, 2) && roadClear(x, z, 2)) tree(x, z, k % 3 ? 0 : 1, 1); }
  PLACES.push({ name: '明德公園', x: s.x, z: s.z, r: 26 });
}
function shuangliWetland() {
  const s = spot(24.4790, 118.3135, 22, 40) || spot(24.4790, 118.3135, 16, 40); if (!s) return; const r = s.rot, f = fwd(r), u = { x: Math.cos(r), z: -Math.sin(r) };
  pond(s.x, s.z, 20, 13, r); pond(s.x + u.x * 13, s.z + u.z * 13, 9, 7, r + 0.6); addBox(s.x, s.z, 17, 10, r);
  for (let k = 0; k < 120; k++) { const a = rand() * 6.28, d = rr(0.88, 1.08), x = s.x + (Math.cos(a) * 20 * d) * u.x + (Math.sin(a) * 13 * d) * f.x, z = s.z + (Math.cos(a) * 20 * d) * u.z + (Math.sin(a) * 13 * d) * f.z; BT.ccyl.add(MX(x, groundAt(x, z) - 0.1, z, 0, 0.03, rr(1.2, 2.2), 0.03, rr(-0.15, 0.15), rr(-0.15, 0.15)), new THREE.Color(rr(0.5, 0.62), rr(0.55, 0.62), rr(0.3, 0.38))); }
  for (let k = -9; k <= 9; k++) { const x = s.x + f.x * k * 1.5, z = s.z + f.z * k * 1.5; hb(x, 0.35, z, 2, 0.15, 1.55, '#8a6a48', r); } addDeck(s.x, s.z, 1.0, 14.5, r, 0.5);
  for (let k = 0; k < 6; k++) { const a = rand() * 6.28, x = s.x + Math.cos(a) * rr(6, 16) * 0.9, z = s.z + Math.sin(a) * rr(4, 10) * 0.9; const b = new THREE.Mesh(mergeGeos([[new THREE.CapsuleGeometry(0.16, 0.36, 4, 8).rotateX(1.2), '#f7f7f2', new THREE.Matrix4().makeTranslation(0, 0.75, 0)], [new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4), '#2b2b2b', new THREE.Matrix4().makeTranslation(0, 0.3, 0)], [new THREE.CylinderGeometry(0.04, 0.05, 0.42, 5).rotateX(-0.4), '#f7f7f2', new THREE.Matrix4().makeTranslation(0, 1.05, 0.2)]]), mVC); b.position.set(x, 0.05, z); b.rotation.y = rand() * 6; scene.add(b); }
  const hx = s.x + f.x * 20, hz = s.z + f.z * 20, hy = groundAt(hx, hz) - 0.2; if (boxFree(hx, hz, 4)) { hb(hx, hy, hz, 7, 3.2, 5, '#c9b38f', r); hb(hx, hy + 3.2, hz, 7.8, 0.3, 5.8, '#6b4a34', r); addBox(hx, hz, 3.5, 2.5, r); addSign('雙鯉濕地自然中心', 0.5, hx + f.x * 2.56, hy + 2.6, hz + f.z * 2.56, r, { color: '#fff', bg: '#3f7f5a', size: 64, pad: 8 }); }
  addAction({ x: s.x + f.x * 15.5, z: s.z + f.z * 15.5, r: 3.2, inside: null, label: () => '📷 拍白鷺鷥', fn: () => { flashShot(); sfx('chime', 0.3); dexShot('egret'); } });
  PLACES.push({ name: '雙鯉濕地', x: s.x, z: s.z, r: 30 });
}
function buildKinmen() { kinmenBatch2(); mingdePark(); shuangliWetland(); deyueLou(); taiwuShan(); beishanBroadcast(); chastityArch(); antiAirbornePosts(); casuarinaRows(); }

/* ---------- 第二批：金城古蹟、古寧頭戰役遺跡、中山紀念林、金合利鋼刀 ---------- */
const sideOf = r => ({ f: fwd(r), u: { x: Math.cos(r), z: -Math.sin(r) } });
function heritage(name, lat, lon, w, d, info, sign = {}) {
  const s = spot(lat, lon, Math.max(w, d) / 2 + 1.5, 24); if (!s) return null; const r = s.rot, { f } = sideOf(r);
  minnanHouse(s.x, s.z, r, w, d); const y = minGround(s.x, s.z, w, d, r) - 0.15;
  addSign(name, 0.6, s.x + f.x * (d / 2 + 0.2), y + 3.05, s.z + f.z * (d / 2 + 0.2), r, Object.assign({ color: '#f4d27a', bg: '#7c2f25', size: 64, pad: 8 }, sign));
  addAction({ x: s.x + f.x * (d / 2 + 2), z: s.z + f.z * (d / 2 + 2), r: 3, inside: null, label: () => '看介紹', fn: () => subtitle(`<b>${name}</b>：${info}`, 7) });
  PLACES.push({ name, x: s.x, z: s.z, r: Math.max(w, d) }); return s;
}
function beishanYanglou() {
  const s = spot(24.4772, 118.3058, 7, 24); if (!s) return; const r = s.rot, { f, u } = sideOf(r), y = groundAt(s.x, s.z) - 0.2, W = 11, Dp = 9;
  hb(s.x, y, s.z, W, 3.6, Dp, '#ece0c6', r); hb(s.x, y + 3.6, s.z, W + 0.3, 0.3, Dp + 0.3, '#b7a789', r); hb(s.x - u.x * 1.2, y + 3.9, s.z - u.z * 1.2, W - 2.4, 3.3, Dp, '#e6d8bb', r);
  hb(s.x + u.x * (W / 2 - 1.2), y + 3.9, s.z + u.z * (W / 2 - 1.2), 2.4, 1.4, Dp, '#cbb796', r); // 被砲擊崩掉的一角
  for (const yy of [0, 3.9]) for (let k = -2; k <= 2; k++) hb(s.x + f.x * (Dp / 2 + 0.6) + u.x * k * 2.2, y + yy, s.z + f.z * (Dp / 2 + 0.6) + u.z * k * 2.2, 0.5, yy ? 2.8 : 3.6, 0.5, '#e6d7bb', r);
  for (const yy of [1.1, 5.0]) for (const k of [-3.6, -1.2, 1.2, 3.6]) { if (yy > 4 && k > 2) continue; hb(s.x + f.x * (Dp / 2 + 0.03) + u.x * k, y + yy, s.z + f.z * (Dp / 2 + 0.03) + u.z * k, 1.0, 1.7, 0.05, '#2e3a40', r); hb(s.x + f.x * (Dp / 2 + 0.04) + u.x * k, y + yy + 1.7, s.z + f.z * (Dp / 2 + 0.04) + u.z * k, 1.25, 0.2, 0.06, '#efe3c8', r); }
  for (let k = 0; k < 40; k++) { const a = rr(-W / 2 + 0.4, W / 2 - 0.4), hh = rr(0.5, 7); if (hh > 4 && a > W / 2 - 2.4) continue; const sz = rr(0.06, 0.13); hb(s.x + f.x * (Dp / 2 + 0.035) + u.x * a, y + hh, s.z + f.z * (Dp / 2 + 0.035) + u.z * a, sz, sz, 0.05, '#5b5348', r); }
  addBox(s.x, s.z, W / 2 + 0.6, Dp / 2 + 0.8, r);
  addSign('北山洋樓', 0.5, s.x + f.x * (Dp / 2 + 0.7), y + 7.4, s.z + f.z * (Dp / 2 + 0.7), r, { color: '#3b2a1a', bg: '#e8dcc2', size: 64, pad: 6 });
  addAction({ x: s.x + f.x * (Dp / 2 + 3), z: s.z + f.z * (Dp / 2 + 3), r: 3.5, inside: null, label: () => '看彈孔', fn: () => subtitle('<b>北山洋樓</b>：1949 年古寧頭戰役，共軍曾以這棟洋樓為指揮所，國軍反攻時激烈巷戰，牆上的彈孔留到今天。', 7) });
  PLACES.push({ name: '北山洋樓', x: s.x, z: s.z, r: 16 });
}
function zhongshanForest() {
  const c = GW(24.4545, 118.3535); let n = 0;
  for (let k = 0; k < 900 && n < 260; k++) { const a = rand() * 6.283, d = Math.sqrt(rand()) * 170, x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; if (!roadClear(x, z, 3) || !boxFree(x, z, 2.5) || sdAt(x, z) < 20) continue; tree(x, z, rand() < 0.75 ? 1 : 0, rr(0.9, 1.3)); n++; }
  const s = spot(24.4545, 118.3535, 7, 24); if (!s) return; const r = s.rot, { f } = sideOf(r), y = groundAt(s.x, s.z) - 0.2;
  hb(s.x, y, s.z, 12, 4, 8, '#efe6d6', r); hb(s.x, y + 4, s.z, 13.6, 0.5, 9.6, '#3d6b4a', r); hb(s.x, y + 4.5, s.z, 11, 1.4, 7, '#2f5a3c', r); hb(s.x + f.x * 4.02, y, s.z + f.z * 4.02, 2.2, 2.6, 0.08, '#5a3b28', r); addBox(s.x, s.z, 6, 4, r);
  addSign('中山紀念林', 0.75, s.x + f.x * 4.08, y + 3.3, s.z + f.z * 4.08, r, { color: '#fff', bg: '#2f5a3c', size: 72, pad: 8 });
  for (let k = 0; k < 5; k++) { const bx = s.x + f.x * 7 + Math.cos(r) * (k - 2) * 1.1, bz = s.z + f.z * 7 - Math.sin(r) * (k - 2) * 1.1; if (boxFree(bx, bz, 0.6)) hb(bx, groundAt(bx, bz), bz, 0.15, 1, 1.7, ['#d4140b', '#2d6cdf', '#f2c230', '#2f9e5b', '#222'][k], r); }
  addAction({ x: s.x + f.x * 7, z: s.z + f.z * 7, r: 3, inside: null, label: () => '租腳踏車（$50）', fn: () => { if (player.money < 50) return toast('錢不夠'); addMoney(-50); const v = makeVehicle('bike', s.x + f.x * 9, s.z + f.z * 9, r); if (!v) { addMoney(50); return toast('這裡沒辦法租'); } toast('租了一台腳踏車，按 F 騎上去，林間步道慢慢騎'); } });
  bikeRaceInit(s);
  PLACES.push({ name: '中山紀念林', x: s.x, z: s.z, r: 60 });
}
function jinheliKnives() {
  const s = spot(24.4326, 118.3172, 3.5, 20); if (!s) return; const r = s.rot, { f } = sideOf(r), y = groundAt(s.x, s.z) - 0.2;
  hb(s.x, y, s.z, 6.5, 4.4, 6, '#d8cbb4', r); hb(s.x, y + 4.4, s.z, 7, 0.4, 6.5, '#8f3a2a', r); hb(s.x + f.x * 3.02, y, s.z + f.z * 3.02, 3.4, 2.6, 0.08, '#3a2a1c', r); addBox(s.x, s.z, 3.25, 3, r);
  addSign('金合利鋼刀', 0.6, s.x + f.x * 3.1, y + 3.4, s.z + f.z * 3.1, r, { color: '#fff', bg: '#8f3a2a', size: 64, pad: 8 });
  addAction({ x: s.x + f.x * 4.5, z: s.z + f.z * 4.5, r: 3, inside: null, label: () => '買砲彈菜刀（$800）', fn: () => { if (player.money < 800) return toast('錢不夠'); addMoney(-800); sfx('chime', 0.3); subtitle('<b>金合利鋼刀</b>：師傅把八二三砲戰留下的砲彈殼切開、鍛打，一顆砲彈可以打出五十把菜刀。你帶走了一把。', 7); } });
  PLACES.push({ name: '金合利鋼刀', x: s.x, z: s.z, r: 10 });
}
function kinmenBatch2() {
  zongbingshu(); ceramicsFactory(); horseshoeCrabHall(); cihuCormorants(); lieyuForts(); houhuBeach(); applySeasonLook(); lakeWater(); rongLakeOtters(); beeEaterSlope(); hoopoes(); oysterField(); procInit(); lionGunInit(); wineryInit(); fishingInit(); touristsInit(); busInit(); gugangLou(); mingYiStreet(); gongtangInit(); sloganWalls(); coastPillboxes(); lanternStreets(); bobingInit(); foodStalls(); bridgeLights(); harborLife();
  heritage('浯江書院', 24.4331, 118.3158, 12, 9, '清乾隆年間創立，祀朱熹，是金門古時讀書人考科舉的地方，金門四大書院之一。');
  heritage('李光前將軍廟', 24.4768, 118.3012, 9, 7, '古寧頭戰役中殉職的李光前團長，戰後村民感念他，立廟祭祀，香火至今不斷。', { bg: '#a32a1e' });
  beishanYanglou(); zhongshanForest(); jinheliKnives();
}

/* ---------- 第三批：總兵署衙門格局、金門陶瓷廠 ---------- */
function zongbingshu() {
  const s = spot(24.4316, 118.3181, 13, 26); if (!s) return; const r = s.rot, { f, u } = sideOf(r), y = minGround(s.x, s.z, 22, 26, r) - 0.15;
  const P = (a, b) => ({ x: s.x + u.x * a + f.x * b, z: s.z + u.z * a + f.z * b });
  for (const [a, b, w, d] of [[-10.5, 0, 0.6, 24], [10.5, 0, 0.6, 24], [0, -12, 21.6, 0.6], [-6.8, 12, 7.4, 0.6], [6.8, 12, 7.4, 0.6]]) { const q = P(a, b); hb(q.x, y, q.z, w, 2.6, d, '#b5452e', r); hb(q.x, y + 2.6, q.z, w + 0.3, 0.25, d + 0.3, '#7d2a1c', r); addBox(q.x, q.z, w / 2 + 0.1, d / 2 + 0.1, r); }
  const g = P(0, 12); hb(g.x, y, g.z, 6.2, 3.6, 3.2, '#a8392a', r); hb(g.x, y + 3.6, g.z, 7.4, 0.35, 4.2, '#5e2318', r); hb(g.x, y + 3.95, g.z, 5.6, 0.8, 3.0, '#c84a2d', r);
  for (const sd of [-1, 1]) { const e = P(sd * 3.4, 12.2); hb(e.x, y + 4.5, e.z, 0.5, 0.6, 0.5, '#c84a2d', r); const c = P(sd * 2.2, 13.7); hb(c.x, y, c.z, 0.35, 3.6, 0.35, '#7d2a1c', r); const l = P(sd * 3.6, 15.4); hb(l.x, y, l.z, 0.9, 0.9, 0.9, '#b9b2a4', r); hb(l.x, y + 0.9, l.z, 0.7, 1.1, 0.8, '#a39c8e', r); }
  hb(g.x + f.x * 1.62, y, g.z + f.z * 1.62, 2.6, 2.8, 0.06, '#3a1c12', r);
  addSign('金門鎮總兵署', 0.72, g.x + f.x * 1.7, y + 3.15, g.z + f.z * 1.7, r, { color: '#f4d27a', bg: '#1d1d1d', size: 64, pad: 8 });
  const yard = P(0, 4); hb(yard.x, y - 0.1, yard.z, 9, 0.2, 7, '#c9c1b2', r);
  const h = P(0, -6); minnanHouse(h.x, h.z, r, 16, 9);
  for (const sd of [-1, 1]) { const w = P(sd * 7.5, 2); minnanHouse(w.x, w.z, r + sd * Math.PI / 2, 8, 5); }
  for (const sd of [-1, 1]) { const q = P(sd * 5, 17.5); hb(q.x, y, q.z, 0.14, 8, 0.14, '#7d2a1c', r); hb(q.x + u.x * sd * 0.7, y + 6.6, q.z + u.z * sd * 0.7, 1.4, 1.0, 0.03, '#d4140b', r); }
  addAction({ x: g.x + f.x * 4, z: g.z + f.z * 4, r: 3.5, inside: null, label: () => '看介紹', fn: () => subtitle('<b>金門鎮總兵署</b>：清代金門鎮總兵的官署，前身是明末盧若騰的故居。門樓、前埕、大堂一進一進往裡走，是全台現存唯一的總兵署。', 7) });
  PLACES.push({ name: '金門鎮總兵署', x: s.x, z: s.z, r: 16 });
}
function ceramicsFactory() {
  const s = spot(24.4290, 118.4060, 12, 30); if (!s) return; const r = s.rot, { f, u } = sideOf(r), y = minGround(s.x, s.z, 24, 20, r) - 0.2;
  const P = (a, b) => ({ x: s.x + u.x * a + f.x * b, z: s.z + u.z * a + f.z * b });
  for (const [a, b, w, d, c] of [[-5, -2, 12, 10, '#d9d2c3'], [7, -3, 9, 8, '#cfc6b4']]) { const q = P(a, b); hb(q.x, y, q.z, w, 5, d, c, r); hb(q.x, y + 5, q.z, w + 0.4, 0.4, d + 0.4, '#6f7f86', r); addBox(q.x, q.z, w / 2 + 0.2, d / 2 + 0.2, r); hb(q.x + f.x * (d / 2 + 0.03), y, q.z + f.z * (d / 2 + 0.03), 3.2, 3.4, 0.06, '#3f4a50', r); }
  const ch = P(9, -7); const cm = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 16, 12), new THREE.MeshStandardMaterial({ color: 0x9c4a32, roughness: 0.95 })); cm.position.set(ch.x, y + 8, ch.z); cm.castShadow = true; scene.add(cm); addBox(ch.x, ch.z, 1, 1, r);
  const mJar = new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.35, metalness: 0.05 }), mBlue = new THREE.MeshStandardMaterial({ color: 0x2b4fa0, roughness: 0.4 }), mRed = new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.45 });
  const jarGeo = new THREE.LatheGeometry([[0, 0], [0.9, 0], [1.25, 0.6], [1.35, 1.4], [1.05, 2.3], [0.42, 2.7], [0.38, 3.2], [0.55, 3.35], [0, 3.35]].map(p => new THREE.Vector2(p[0], p[1])), 20);
  for (let k = 0; k < 5; k++) { const q = P(-8 + k * 4, 7.5), sc = k === 2 ? 1.9 : rr(0.9, 1.25), j = new THREE.Mesh(jarGeo, mJar); j.scale.setScalar(sc); j.position.set(q.x, groundAt(q.x, q.z), q.z); j.castShadow = true; scene.add(j);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.36, 0.35, 20, 1, true), k % 2 ? mRed : mBlue); band.scale.setScalar(sc); band.position.set(q.x, groundAt(q.x, q.z) + 1.4 * sc, q.z); scene.add(band); addBox(q.x, q.z, 1.2 * sc, 1.2 * sc, 0); }
  const gq = P(0, 11); addSign('金門縣陶瓷廠', 0.75, gq.x, groundAt(gq.x, gq.z) + 2.4, gq.z, r, { color: '#fff', bg: '#2b4fa0', size: 64, pad: 8 }); hb(gq.x, groundAt(gq.x, gq.z), gq.z, 0.2, 2.0, 0.2, '#555', r);
  addAction({ x: gq.x + f.x * 2, z: gq.z + f.z * 2, r: 3.5, inside: null, label: () => '買青花酒瓶（$600）', fn: () => { if (player.money < 600) return toast('錢不夠'); addMoney(-600); sfx('chime', 0.3); subtitle('<b>金門縣陶瓷廠</b>：1963 年設立，號稱全台唯一官窯，用金門高嶺土燒製高粱酒瓶與青花瓷。你帶走一支青花酒瓶。', 7); } });
  PLACES.push({ name: '金門陶瓷廠', x: s.x, z: s.z, r: 18 });
}

/* ---------- 鱟生態文化館（金城西海路）＋ 潮間帶的鱟 ---------- */
function horseshoeCrabHall() {
  let s = null; for (let k = 0; k < 80 && !s; k++) { const q = spot(24.4290 + rr(-0.012, 0.012), 118.3105 + rr(-0.018, 0.004), 7, 10); if (q && sdAt(q.x, q.z) > 14 && sdAt(q.x, q.z) < 45) s = q; } if (!s) s = spot(24.4290, 118.3105, 7, 26); if (!s) return; const r = s.rot, { f } = sideOf(r), y = groundAt(s.x, s.z) - 0.2;
  hb(s.x, y, s.z, 13, 4.2, 9, '#e9ecef', r); hb(s.x, y + 4.2, s.z, 13.8, 0.4, 9.8, '#2a6f8f', r); hb(s.x + f.x * 4.53, y, s.z + f.z * 4.53, 3, 2.8, 0.06, '#24414f', r); addBox(s.x, s.z, 6.6, 4.6, r);
  addSign('鱟生態文化館', 0.7, s.x + f.x * 4.6, y + 3.5, s.z + f.z * 4.6, r, { color: '#fff', bg: '#2a6f8f', size: 64, pad: 8 });
  const mShell = new THREE.MeshStandardMaterial({ color: 0x5b4a30, roughness: 0.55, metalness: 0.1 });
  const crabGeo = mergeGeos([[new THREE.SphereGeometry(0.5, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.35, 1.1), '#ffffff'], [new THREE.BoxGeometry(0.07, 0.07, 0.9).translate(0, 0.05, -0.9), '#ffffff']]);
  const shore = []; for (let k = 0; k < 3000 && shore.length < 40; k++) { const p = { x: s.x + rr(-160, 160), z: s.z + rr(-160, 160) }; const d = sdAt(p.x, p.z); if (d > -5 && d < 1.5) shore.push(p); }
  for (const p of shore) { const c = new THREE.Mesh(crabGeo, mShell); c.scale.setScalar(rr(0.6, 1.1)); c.position.set(p.x, Math.max(groundAt(p.x, p.z), -0.1) + 0.02, p.z); c.rotation.y = rr(0, 6.28); scene.add(c); }
  addAction({ x: s.x + f.x * 6.5, z: s.z + f.z * 6.5, r: 3.5, inside: null, label: () => '📷 拍鱟・看介紹', fn: () => (flashShot(), dexShot('crab'), subtitle('<b>鱟生態文化館</b>：鱟比恐龍還早出現，被稱為活化石。戰地時期金門沿海少有開發，泥灘成了鱟的家，現在全年禁捕。退潮時灘地上看得到牠們。', 8)) });
  PLACES.push({ name: '鱟生態文化館', x: s.x, z: s.z, r: 12 });
}

/* ---------- 慈湖鸕鶿：白天外海覓食、傍晚成群回湖盤旋、夜裡停在湖邊樹上 ---------- */
const corm = { mesh: null, n: 90, birds: [], c: null, r: 60 };
function cihuCormorants() {
  const c = GW(24.4690, 118.3068), L = LAKES.find(l => Math.hypot(l.x - c.x, l.z - c.z) < 40); corm.c = L ? { x: L.x, z: L.z } : c; corm.r = L ? L.r : 50;
  const roost = []; for (let k = 0; k < 400 && roost.length < 22; k++) { const a = rand() * 6.283, d = corm.r + rr(6, 26), x = corm.c.x + Math.cos(a) * d, z = corm.c.z + Math.sin(a) * d; if (groundAt(x, z) < 0.6 || !roadClear(x, z, 3) || !boxFree(x, z, 2.5)) continue; tree(x, z, 1, rr(1.05, 1.3)); roost.push({ x, z, y: groundAt(x, z) + rr(9.5, 12.5) }); }
  if (!roost.length) return;
  const g = mergeGeos([[new THREE.BoxGeometry(0.22, 0.2, 0.9), '#1c1f22'], [new THREE.BoxGeometry(0.1, 0.1, 0.3).translate(0, 0.1, 0.55), '#1c1f22'], [new THREE.BoxGeometry(1.5, 0.04, 0.32).translate(0, 0.04, 0.05), '#2a2e33'], [new THREE.BoxGeometry(0.08, 0.04, 0.12).translate(0, 0.1, 0.74), '#d9a33a']]);
  corm.mesh = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }), corm.n); corm.mesh.frustumCulled = false; scene.add(corm.mesh);
  for (let i = 0; i < corm.n; i++) { const t = roost[i % roost.length]; corm.birds.push({ ph: rand() * 6.283, sp: rr(0.25, 0.4), rad: rr(0.35, 1.0), alt: rr(10, 26), perch: { x: t.x + rr(-1.4, 1.4), y: t.y + rr(-2, 0.6), z: t.z + rr(-1.4, 1.4) }, sea: rr(0, 6.283) }); }
  const s = spot(24.4690, 118.3068 + 0.004, 4, 30); if (s) { const { f } = sideOf(s.rot), y = groundAt(s.x, s.z) - 0.2; hb(s.x, y, s.z, 5, 0.5, 3, '#8a6a46', s.rot); for (const sd of [-1, 1]) hb(s.x + Math.cos(s.rot) * sd * 2.2, y, s.z - Math.sin(s.rot) * sd * 2.2, 0.2, 1.4, 3, '#6a4e33', s.rot);
    addSign('慈湖・鸕鶿觀賞', 0.55, s.x + f.x * 1.6, y + 2.2, s.z + f.z * 1.6, s.rot, { color: '#fff', bg: '#2a5d6e', size: 64, pad: 8 });
    addAction({ x: s.x + f.x * 2.5, z: s.z + f.z * 2.5, r: 3.5, inside: null, label: () => !cormSeason() ? '鸕鶿秋冬才會來' : env.tod > 16.5 && env.tod < 19 ? '📷 拍鸕鶿歸巢' : '等到傍晚看鸕鶿', fn: () => { if (!cormSeason()) { subtitle('<b>慈湖</b>：鸕鶿是冬候鳥，秋天才會從北方飛來，現在湖上空空的。（手機「季節」可以切換）', 7); return; } if (!(env.tod > 16.5 && env.tod < 19)) env.tod = 17.2; else { flashShot(); sfx('chime', 0.3); dexShot('corm'); } subtitle('<b>慈湖</b>：每年冬天上萬隻鸕鶿從北方飛來金門過冬，白天到海上捕魚，傍晚成群飛回慈湖邊的樹林過夜，黑壓壓一片。', 8); } });
    PLACES.push({ name: '慈湖鸕鶿', x: s.x, z: s.z, r: 20 }); }
}
const _cm = new THREE.Matrix4(), _cq = new THREE.Quaternion(), _ce = new THREE.Euler(0, 0, 0, 'YXZ'), _cs = new THREE.Vector3(1, 1, 1), _cp = new THREE.Vector3();
function updateCormorants() {
  if (!corm.mesh) return; const c = corm.c; if (!cormSeason() || Math.hypot(camera.position.x - c.x, camera.position.z - c.z) > 900) { corm.mesh.visible = false; return; } corm.mesh.visible = true;
  const h = env.tod, T = game.time, dusk = h > 16.6 && h < 18.9, night = h >= 18.9 || h < 6.3;
  for (let i = 0; i < corm.n; i++) { const b = corm.birds[i]; let x, y, z, yaw, roll = 0, sc = 1.4;
    if (night) { x = b.perch.x; y = b.perch.y; z = b.perch.z; yaw = b.ph; sc = 1.1; }
    else if (dusk) { const k = Math.min(1, (h - 16.6) / 0.5), a = b.ph + T * b.sp, R = corm.r * (0.3 + b.rad * 0.9) * (1.6 - 0.6 * k); x = c.x + Math.cos(a) * R; z = c.z + Math.sin(a) * R; y = groundAt(c.x, c.z) + b.alt * (0.7 + 0.3 * Math.sin(T * 0.6 + b.ph)) + 4; yaw = -a; roll = -0.35; }
    else { const a = b.sea + T * b.sp * 0.6, R = 260 + b.rad * 140, ox = c.x - 380, oz = c.z - 220; x = ox + Math.cos(a) * R; z = oz + Math.sin(a) * R * 0.6; y = 6 + b.alt * 0.4; yaw = -a; roll = -0.2; }
    const flap = night ? 0 : Math.sin(T * 9 + b.ph) * 0.25; _ce.set(flap * 0.3, yaw, roll + flap); _cq.setFromEuler(_ce); _cs.setScalar(sc); _cp.set(x, y, z); _cm.compose(_cp, _cq, _cs); corm.mesh.setMatrixAt(i, _cm); }
  corm.mesh.instanceMatrix.needsUpdate = true;
}

/* ---------- 烈嶼三堡：將軍堡、勇士堡＋鐵漢堡（地雷主題館＋模擬地雷區） ---------- */
function concreteFort(s, W, D, H, name, slits, color = '#8d8f84') {
  const r = s.rot, { f, u } = sideOf(r), y = minGround(s.x, s.z, W, D, r) - 0.3;
  hb(s.x, y, s.z, W, H, D, color, r); hb(s.x, y + H, s.z, W + 0.6, 0.5, D + 0.6, '#6f7166', r); hb(s.x, y + H + 0.5, s.z, W - 1, 0.6, D - 1, '#5d6a4a', r); addBox(s.x, s.z, W / 2 + 0.4, D / 2 + 0.4, r);
  for (let k = 0; k < slits; k++) { const side = k % 4, t = (Math.floor(k / 4) + 0.5) / Math.ceil(slits / 4) - 0.5; const sx = side < 2 ? t * W : (side === 2 ? -1 : 1) * (W / 2 + 0.03), sz = side < 2 ? (side === 0 ? 1 : -1) * (D / 2 + 0.03) : t * D; hb(s.x + u.x * sx + f.x * sz, y + H * 0.62, s.z + u.z * sx + f.z * sz, side < 2 ? 0.9 : 0.06, 0.28, side < 2 ? 0.06 : 0.9, '#1a1b18', r); }
  for (let k = 0; k < 10; k++) { const a = rr(-W / 2, W / 2), b = rr(-D / 2, D / 2); hb(s.x + u.x * a + f.x * b, y + rr(0.4, H - 0.6), s.z + u.z * a + f.z * b, rr(1, 2.5), rr(0.6, 1.4), rr(1, 2.5), pick(['#4f6b3a', '#6b7a45', '#3e5530']), r); }
  hb(s.x + f.x * (D / 2 + 0.04), y, s.z + f.z * (D / 2 + 0.04), 1.6, 2.2, 0.06, '#2b2c28', r);
  addSign(name, 0.6, s.x + f.x * (D / 2 + 0.1), y + H - 0.6, s.z + f.z * (D / 2 + 0.1), r, { color: '#fff', bg: '#a3221b', size: 64, pad: 8 });
  return y;
}
const mine = { zones: [], cd: 0 };
function lieyuForts() {
  let s = null; for (let k = 0; k < 60 && !s; k++) { const q = spot(24.4418 + rr(-0.002, 0.002) * (k > 0), 118.2650 + rr(-0.003, 0.002) * (k > 0), 7, 12); if (q && sdAt(q.x, q.z) > 8 && sdAt(q.x, q.z) < 40) s = q; } if (!s) s = spot(24.4418, 118.2650, 7, 30);
  if (s) { concreteFort(s, 12, 9, 3.2, '將軍堡', 24); const { f } = sideOf(s.rot);
    addAction({ x: s.x + f.x * 7, z: s.z + f.z * 7, r: 3.5, inside: null, label: () => '看介紹', fn: () => subtitle('<b>將軍堡</b>：監控大小金門之間的金烈水道，堡裡有 24 個機槍和步槍射口。1958 年八二三砲戰期間，蔣經國曾到這裡視察。現在射口成了看金門大橋的最佳觀景窗。', 8) });
    PLACES.push({ name: '將軍堡', x: s.x, z: s.z, r: 14 }); }
  const a = spot(24.4380, 118.2370, 6, 30); if (!a) return; const ra = a.rot, { f, u } = sideOf(ra);
  concreteFort(a, 9, 7, 3, '勇士堡', 12); const MT = tunnels.find(t => t.name === '地雷主題館'); const fortMouth = (q, i) => { if (!MT) return; const qf = fwd(q.rot), y = groundAt(q.x + qf.x * 4.6, q.z + qf.z * 4.6); MT.mouths[i] = { x: q.x + qf.x * 5.0, z: q.z + qf.z * 5.0, yaw: q.rot, trig: { x: q.x + qf.x * 4.2, z: q.z + qf.z * 4.2 } }; const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.35, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x9b59b6, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); ring.position.set(q.x + qf.x * 4.6, y + 0.4, q.z + qf.z * 4.6); scene.add(ring); }; fortMouth(a, 0);
  let bd = 0; for (const d of [34, -34, 28, -28, 42, -42, 22, -22]) { const q = { x: a.x + u.x * d, z: a.z + u.z * d, rot: ra }; if (boxFree(q.x, q.z, 6) && roadClear(q.x, q.z, 6) && sdAt(q.x, q.z) > 10) { concreteFort(q, 9, 7, 3, '鐵漢堡', 12); fortMouth(q, 1); bd = d; break; } }
  const g = { x: a.x + u.x * bd / 2 + f.x * 8, z: a.z + u.z * bd / 2 + f.z * 8 }, gy = groundAt(g.x, g.z);
  hb(g.x, gy, g.z, 5, 3, 0.4, '#5d6a4a', ra); addSign('地雷主題館', 0.6, g.x + f.x * 0.25, gy + 2.3, g.z + f.z * 0.25, ra, { color: '#ffde3b', bg: '#222', size: 64, pad: 8 });
  let m = null; for (const [p1, p2] of [[18, 0], [-18, 0], [24, 0], [-24, 0], [18, 12], [-18, -12], [30, 0], [-30, 0], [0, 26], [0, -26]]) { const q = { x: a.x + u.x * (bd / 2 + p2) + f.x * p1, z: a.z + u.z * (bd / 2 + p2) + f.z * p1, r: 9 }; if (roadClear(q.x, q.z, 12) && boxFree(q.x, q.z, 9) && sdAt(q.x, q.z) > 12) { m = q; break; } } if (!m) return; mine.zones.push(m);
  for (let k = 0; k < 16; k++) { const t = k / 16 * 6.283, px = m.x + Math.cos(t) * m.r, pz = m.z + Math.sin(t) * m.r; hb(px, groundAt(px, pz), pz, 0.12, 1.1, 0.12, '#6a5236', 0); if (k % 4 === 0) { const sg = signMesh('雷', 1.3, { color: '#fff', bg: '#c4161c', size: 64, pad: 10 }); sg.position.set(px, groundAt(px, pz) + 1.7, pz); sg.rotation.y = Math.atan2(px - m.x, pz - m.z); scene.add(sg); } }
  hb(m.x, groundAt(m.x, m.z) - 0.05, m.z, m.r * 1.6, 0.1, m.r * 1.6, '#8a7a5c', ra);
  addAction({ x: g.x + f.x * 2.5, z: g.z + f.z * 2.5, r: 3.5, inside: null, label: () => '看介紹', fn: () => subtitle('<b>勇士堡・鐵漢堡</b>：兩座堡壘由地下坑道相連，現在是全台唯一的地雷主題館。後面圍起來的是模擬地雷區，感應到人就會發出爆炸巨響——敢走進去試試嗎？', 8) });
  PLACES.push({ name: '勇士堡・鐵漢堡', x: g.x, z: g.z, r: 22 });
}
function updateMinefield(dt) {
  mine.cd -= dt; if (mine.cd > 0 || player.veh || player.plane || player.inside) return;
  if (player.tunnel) { const ms = player.tunnel.mines; if (ms) for (const m of ms) if (Math.abs(player.pos.x - m.x) < 1.5 && Math.abs(player.pos.z - m.z) < 1.5 && rand() < 0.5) { mine.cd = 2.2; sfx('boom', 0.45); toast('💥 轟！模擬地雷步道（只是音效）'); return; } else mine.cd = 0.4; return; }
  for (const m of mine.zones) if (Math.hypot(player.pos.x - m.x, player.pos.z - m.z) < m.r * 0.92) { mine.cd = 3.5; sfx('boom', 0.5); if (typeof shakeCam === 'function') shakeCam(0.6); toast('💥 轟！踩到模擬地雷（只是感應音效，別擔心）'); return; }
}
function updateKinmenFX(dt) { updateCormorants(); updateMinefield(dt); updateOtters(); updateBeeEaters(); updateHoopoes(dt); updateBikeRace(dt); updateProcession(dt); updateLionGun(dt); updateDrunk(dt); updateFishing(dt); updateTyphoon(dt); updateTourists(dt); updateGongtang(dt); updateLanterns(); updateProcDrums(dt); updateBridgeLights(); updateCityLights(); updateHarbor(); }

/* ---------- 后湖海濱公園：金門的游泳海灘（救生員、淋浴間、野餐樹林、浮球泳區） ---------- */
let houhuCrowd = null;
function houhuBeach() {
  const B = BEACHES.find(b => (b.name || b[0]) === '后湖海濱公園'); if (!B || B.skip) return; const c = { x: B.x, z: B.z };
  let land = null, sea = null; for (let k = 0; k < 600 && !(land && sea); k++) { const a = rand() * 6.283, d = rr(10, 120), x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d, sd = sdAt(x, z); if (!land && sd > 4 && sd < 9 && boxFree(x, z, 3) && roadClear(x, z, 3)) land = { x, z }; }
  if (!land) return; let gx = 0, gz = 0; { const e = 3, a = sdAt(land.x + e, land.z) - sdAt(land.x - e, land.z), b = sdAt(land.x, land.z + e) - sdAt(land.x, land.z - e), L = Math.hypot(a, b) || 1; gx = -a / L; gz = -b / L; }
  const seaYaw = Math.atan2(gx, gz), ux = Math.cos(seaYaw), uz = -Math.sin(seaYaw), G = (a, b) => ({ x: land.x + ux * a + gx * b, z: land.z + uz * a + gz * b });
  // 救生員高台
  { const p = G(0, 2), y = groundAt(p.x, p.z); for (const [a, b] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) hb(p.x + ux * a + gx * b, y, p.z + uz * a + gz * b, 0.15, 3, 0.15, '#f2f2f2', seaYaw); hb(p.x, y + 3, p.z, 2, 0.2, 2, '#d4140b', seaYaw); hb(p.x, y + 3.2, p.z, 1.2, 0.7, 0.6, '#f2f2f2', seaYaw); const um = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 8), mat('#d4140b', 0.7)); um.position.set(p.x, y + 5.2, p.z); scene.add(um); hb(p.x, y + 3.2, p.z, 0.06, 1.8, 0.06, '#777', seaYaw); addBox(p.x, p.z, 1, 1, seaYaw);
    addSign('救生員', 0.4, p.x + gx * 1.02, y + 2.4, p.z + gz * 1.02, seaYaw, { color: '#fff', bg: '#d4140b', size: 48, pad: 6 }); }
  // 淋浴廁所
  { const p = G(-14, -14), y = groundAt(p.x, p.z) - 0.2; if (boxFree(p.x, p.z, 4)) { hb(p.x, y, p.z, 7, 3, 4, '#e8e2d2', seaYaw); hb(p.x, y + 3, p.z, 7.6, 0.3, 4.6, '#2a6f8f', seaYaw); addBox(p.x, p.z, 3.6, 2.1, seaYaw); addSign('淋浴・廁所', 0.45, p.x + gx * 2.05, y + 2.4, p.z + gz * 2.05, seaYaw, { color: '#fff', bg: '#2a6f8f', size: 48, pad: 6 });
    addAction({ x: p.x + gx * 3.4, z: p.z + gz * 3.4, r: 2.6, inside: null, label: () => '沖個澡（回滿體力）', fn: () => { player.hp = 100; sfx('splash', 0.4); toast('沖完澡，全身清爽（體力回滿）'); } }); } }
  // 野餐樹林＋桌子
  for (let k = 0; k < 14; k++) { const p = G(rr(10, 34), rr(-24, -10)); if (boxFree(p.x, p.z, 2.5) && roadClear(p.x, p.z, 3) && sdAt(p.x, p.z) > 12) { tree(p.x, p.z, rand() < 0.5 ? 1 : 0, rr(0.9, 1.15)); if (k % 3 === 0) { const q = { x: p.x + 2.6, z: p.z + 1 }; if (boxFree(q.x, q.z, 1.2)) { const y = groundAt(q.x, q.z); hb(q.x, y, q.z, 1.8, 0.75, 0.9, '#8a6a46', seaYaw); hb(q.x + gx * 0.8, y, q.z + gz * 0.8, 1.8, 0.42, 0.3, '#7a5a3a', seaYaw); hb(q.x - gx * 0.8, y, q.z - gz * 0.8, 1.8, 0.42, 0.3, '#7a5a3a', seaYaw); } } } }
  // 泳區浮球線
  const mB = mat('#ff8a1f', 0.6), bg = new THREE.SphereGeometry(0.28, 8, 6); for (let a = -40; a <= 40; a += 2.5) for (const b of [26]) { const p = G(a, b); if (sdAt(p.x, p.z) < -2) { const m = new THREE.Mesh(bg, mB); m.position.set(p.x, 0.05, p.z); scene.add(m); } } for (let b = 6; b <= 26; b += 2.5) for (const a of [-40, 40]) { const p = G(a, b); if (sdAt(p.x, p.z) < -2) { const m = new THREE.Mesh(bg, mB); m.position.set(p.x, 0.05, p.z); scene.add(m); } }
  { const grp = new THREE.Group(); const body = new THREE.CapsuleGeometry(0.22, 0.9, 4, 8), head = new THREE.SphereGeometry(0.17, 8, 6), mSk = mat('#d9a27a', 0.7); for (let k = 0; k < 22; k++) { const inSea = k < 10, p = inSea ? G(rr(-30, 30), rr(9, 22)) : G(rr(-34, 34), rr(-6, 5)); const sd = sdAt(p.x, p.z); if (inSea ? sd > -1.5 : sd < 1) continue; const y = inSea ? -0.55 : groundAt(p.x, p.z); const P = makePerson({ shorts: true, longSleeve: false, jacket: null, shirt: pick(['#e74c3c', '#2d6cdf', '#f2c230', '#1abc9c', '#e84393', '#ffffff']) }), o = P.group; o.rotation.y = rr(0, 6.28);
      if (!inSea && k % 2) { o.rotation.x = -Math.PI / 2; o.position.set(p.x, y + 0.2, p.z); } else o.position.set(p.x, y, p.z); grp.add(o); }
    scene.add(grp); houhuCrowd = grp; }
  const sp = G(6, -6), sy = groundAt(sp.x, sp.z); hb(sp.x, sy, sp.z, 0.2, 2.4, 0.2, '#555', seaYaw); addSign('后湖海濱公園', 0.7, sp.x + gx * 0.15, sy + 2.6, sp.z + gz * 0.15, seaYaw + Math.PI, { color: '#fff', bg: '#1f6f8f', size: 64, pad: 8 });
  addAction({ x: sp.x - gx * 1.6, z: sp.z - gz * 1.6, r: 2.8, inside: null, label: () => '看介紹', fn: () => subtitle('<b>后湖海濱公園</b>：金門的游泳海灘，有救生員和淋浴間。因為國軍長年駐守海岸，沙灘一直保持乾淨。這裡也是每十二年一次「后湖海醮」祭祀海上亡魂的地方。', 8) });
}

/* ---------- 金沙榮湖：歐亞水獺（清晨、傍晚出沒，拍到照片有獎勵） ---------- */
const otter = { list: [], c: null, r: 24, shots: 0, lastDay: -1 };
function otterGeo() { return mergeGeos([[new THREE.CapsuleGeometry(0.22, 0.75, 4, 8).rotateX(Math.PI / 2), '#5a3d26'], [new THREE.SphereGeometry(0.2, 8, 6).translate(0, 0.12, 0.62), '#6b4a2f'], [new THREE.SphereGeometry(0.12, 6, 5).translate(0, 0.06, 0.78), '#c9b597'], [new THREE.ConeGeometry(0.1, 0.7, 6).rotateX(-Math.PI / 2).translate(0, 0, -0.78), '#4e3420']]); }
function rongLakeOtters() {
  const c0 = GW(24.49057, 118.42005), L = LAKES.find(l => Math.hypot(l.x - c0.x, l.z - c0.z) < 40); otter.c = L ? { x: L.x, z: L.z } : c0; otter.wy = L && L.wy || 0; otter.r = L ? L.r : 20; if (!L) return;
  try { otter.shots = +localStorage.getItem('kinmen_otter') || 0; } catch (e) { }
  const g = otterGeo(), m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 });
  for (let i = 0; i < 4; i++) { const o = new THREE.Mesh(g, m); o.castShadow = true; scene.add(o); otter.list.push({ m: o, ph: rand() * 6.28, sp: rr(0.12, 0.22), rad: rr(0.35, 0.75), dive: rr(0, 10) }); }
  let s = null; for (let k = 0; k < 200 && !s; k++) { const a = rand() * 6.283, d = otter.r + rr(4, 14), x = otter.c.x + Math.cos(a) * d, z = otter.c.z + Math.sin(a) * d; if (groundAt(x, z) > 0.5 && boxFree(x, z, 3) && roadClear(x, z, 3)) s = { x, z, rot: Math.atan2(otter.c.x - x, otter.c.z - z) }; }
  if (!s) return; const y = groundAt(s.x, s.z), f = fwd(s.rot);
  const st = new THREE.Mesh(g, mat('#b07a45', 0.5)); st.scale.setScalar(3.2); st.position.set(s.x - f.x * 3, y + 0.75, s.z - f.z * 3); st.rotation.set(-0.9, s.rot, 0); scene.add(st); hb(s.x - f.x * 3, y, s.z - f.z * 3, 1.6, 0.5, 1.6, '#cfc6b4', s.rot); addBox(s.x - f.x * 3, s.z - f.z * 3, 1, 1, s.rot);
  addSign('榮湖・歐亞水獺', 0.5, s.x - f.x * 1.2, y + 2.2, s.z - f.z * 1.2, s.rot, { color: '#fff', bg: '#5a3d26', size: 56, pad: 8 }); hb(s.x - f.x * 1.3, y, s.z - f.z * 1.3, 0.12, 2, 0.12, '#555', s.rot);
  addAction({ x: s.x, z: s.z, r: 4, inside: null, label: () => otterOut() ? '📷 拍水獺照片' : '等水獺出現（清晨、傍晚比較常見）', fn: () => {
    if (!otterOut()) { subtitle('<b>歐亞水獺</b>：台灣本島幾乎已經絕跡，金門是牠們最後的家園之一，屬於保育類。牠們多在清晨和傍晚出來覓食，耐心等一下吧。', 7); return; }
    const day = Math.floor(game.time / 600); sfx('chime', 0.3); flashShot(); dexShot('otter');
    if (otter.lastDay === day) return toast('拍到了！（獎勵每輪時間只能領一次）'); otter.lastDay = day; otter.shots++; try { localStorage.setItem('kinmen_otter', otter.shots); } catch (e) { }
    addMoney(500); banner('拍到歐亞水獺', `第 ${otter.shots} 張水獺照片・保育獎金 $500`); } });
  PLACES.push({ name: '榮湖水獺', x: s.x, z: s.z, r: 20 });
}
function otterOut() { const h = env.tod; return (h > 5.2 && h < 8.5) || (h > 16.5 && h < 20.5); }
function flashShot() { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:.85;pointer-events:none;z-index:99;transition:opacity .5s'; document.body.appendChild(d); requestAnimationFrame(() => { d.style.opacity = 0; }); setTimeout(() => d.remove(), 600); }
function updateOtters() {
  if (!otter.list.length) return; const c = otter.c, near = Math.hypot(camera.position.x - c.x, camera.position.z - c.z) < 400, out = otterOut(), T = game.time;
  for (const o of otter.list) { o.m.visible = near && out; if (!o.m.visible) continue; const a = o.ph + T * o.sp, R = otter.r * o.rad * 0.62, x = c.x + Math.cos(a) * R, z = c.z + Math.sin(a) * R, dv = Math.sin(T * 0.7 + o.dive);
    o.m.position.set(x, otter.wy - 0.12 + (dv < -0.85 ? -0.6 : 0) + Math.sin(T * 3 + o.ph) * 0.04, z); o.m.rotation.set(0, -a + Math.PI, 0); }
}

/* ---------- 內陸湖補水面（離海太遠時海水 shader 會淡到看不見） ---------- */
const shoreMat = new THREE.MeshStandardMaterial({ color: 0x7c7650, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1 });
function lakeWater() {
  if (LK.length) { for (const L of LK) { if (L.skip) continue; let wl = L.rim - 0.5; for (const e of roadEdges) for (const p of e.pts) if (p.x > L.x0 - 4 && p.x < L.x1 + 4 && p.z > L.z0 - 4 && p.z < L.z1 + 4 && sdPoly(L.pts, p.x, p.z) > -4) wl = Math.min(wl, p.y - 0.7); wl = Math.max(0.06, wl); L.wy = wl;
      const sh = new THREE.Shape(L.pts.map(([x, z]) => new THREE.Vector2(x, -z))), g = new THREE.ShapeGeometry(sh, 2).rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, L.nm === '金大池塘' ? mPondGreen : mPond); m.position.y = wl; m.receiveShadow = true; scene.add(m);
      for (const a of TREEG.values()) for (const t of a) if (t.x > L.x0 && t.x < L.x1 && t.z > L.z0 && t.z < L.z1 && sdPoly(L.pts, t.x, t.z) > -1 && groundAt(t.x, t.z) < wl + 0.4) { for (const e of t.ents) e[0] = ZERO_M.clone(); t.y1 = -99; } }
    for (const l of LAKES) { const L = LK.find(L => !L.skip && sdPoly(L.pts, l.x, l.z) > 0) || LK.filter(L => !L.skip).sort((a, b) => Math.hypot(a.cx - l.x, a.cz - l.z) - Math.hypot(b.cx - l.x, b.cz - l.z))[0]; l.wy = L ? L.wy : 0.5; }
    return; }
  for (const l of LAKES) { let wl = 1e9; for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; wl = Math.min(wl, groundAt(l.x + Math.cos(a) * l.r * 0.95, l.z + Math.sin(a) * l.r * 0.95)); } wl = wl - 0.35; for (const e of roadEdges) for (const p of e.pts) if (Math.hypot(p.x - l.x, p.z - l.z) < l.r * 1.0) wl = Math.min(wl, groundAt(p.x, p.z) - 0.6); wl = Math.max(0.06, wl); l.wy = wl;
    const cg = new THREE.CircleGeometry(l.r * (l.r > 50 ? 0.93 : 0.74), 120).rotateX(-Math.PI / 2), pa = cg.attributes.position; for (let i = 1; i < pa.count; i++) { const x = pa.getX(i), z = pa.getZ(i), a = Math.atan2(z, x), k = 1 + 0.07 * Math.sin(a * 3 + l.x) + 0.05 * Math.sin(a * 5 + l.z) + 0.03 * Math.sin(a * 9); pa.setX(i, x * k); pa.setZ(i, z * k); } cg.computeVertexNormals();
    const m = new THREE.Mesh(cg, mPond); m.position.set(l.x, wl, l.z); m.receiveShadow = true; scene.add(m);
    if (l.r <= 50) { const rg = new THREE.RingGeometry(l.r * 0.735, l.r * 1.2, 120, 1).rotateX(-Math.PI / 2), ra = rg.attributes.position; for (let i = 0; i < ra.count; i++) { const x = ra.getX(i), z = ra.getZ(i), a = Math.atan2(z, x), k = 1 + 0.07 * Math.sin(a * 3 + l.x) + 0.05 * Math.sin(a * 5 + l.z) + 0.03 * Math.sin(a * 9); ra.setX(i, x * k); ra.setZ(i, z * k); }
      const shore = new THREE.Mesh(rg, shoreMat); shore.position.set(l.x, wl + 0.05, l.z); shore.receiveShadow = true; scene.add(shore); }
    if (l.r <= 50) for (let k = 0; k < l.r * 7; k++) { const a = rand() * 6.283, d = l.r * rr(0.78, 1.02), x = l.x + Math.cos(a) * d, z = l.z + Math.sin(a) * d, g = groundAt(x, z); if (g < wl - 0.4 || g > wl + 0.9 || !roadClear(x, z, 2)) continue; for (let j = 0; j < 3; j++) { const xx = x + rr(-0.6, 0.6), zz = z + rr(-0.6, 0.6); BT.ccyl.add(MX(xx, Math.max(g, wl) - 0.15, zz, 0, 0.05, rr(1.1, 2.1), 0.05, rr(-0.18, 0.18), rr(-0.18, 0.18)), new THREE.Color(rr(0.5, 0.64), rr(0.55, 0.63), rr(0.28, 0.36))); } }
    for (const a of TREEG.values()) for (const t of a) if (Math.hypot(t.x - l.x, t.z - l.z) < l.r * 0.93 && groundAt(t.x, t.z) < wl + 0.3) { for (const e of t.ents) e[0] = ZERO_M.clone(); t.y1 = -99; } }
}

/* ---------- 金門生態圖鑑（手機） ---------- */
const DEX = [
  { id: 'corm', n: '鸕鶿', hint: '秋冬的傍晚，到慈湖鸕鶿觀賞平台' },
  { id: 'otter', n: '歐亞水獺', hint: '清晨或傍晚，到金沙榮湖' },
  { id: 'crab', n: '鱟', hint: '金城西海岸的鱟生態文化館' },
  { id: 'egret', n: '白鷺鷥', hint: '古寧頭附近的雙鯉濕地木棧道' },
  { id: 'bee', n: '栗喉蜂虎', hint: '春夏的白天，慈湖三角堡旁的營巢坡面' },
  { id: 'hoopoe', n: '戴勝', hint: '白天，瓊林村外的農田' }];
let dexGot = new Set(); try { dexGot = new Set(JSON.parse(localStorage.getItem('kinmen_dex') || '[]')); } catch (e) { }
function dexShot(id) {
  if (dexGot.has(id)) return false; dexGot.add(id); try { localStorage.setItem('kinmen_dex', JSON.stringify([...dexGot])); } catch (e) { }
  const d = DEX.find(x => x.id === id); addMoney(300);
  if (dexGot.size === DEX.length) { addMoney(3000); banner('生態圖鑑完成！', DEX.length + ' 種金門生物全部拍到・獎金 $3,300'); } else banner('圖鑑新增：' + d.n, `${dexGot.size}/${DEX.length}・獎金 $300`);
  return true;
}
function phoneDex() { phoneMenu('📷 生態圖鑑 ' + dexGot.size + '/' + DEX.length, DEX.map(d => ({ n: (dexGot.has(d.id) ? '✅ ' : '❓ ') + d.n, d: dexGot.has(d.id) ? '已拍到' : d.hint, fn: () => { } }))); }

/* ---------- 慈湖三角堡：栗喉蜂虎營巢坡面＋迷彩賞鳥平台 ---------- */
const bee = { mesh: null, birds: [], c: null };
function beeEaterSlope() {
  let s = null; for (let k = 0; k < 80 && !s; k++) { const q = spot(24.4652 + rr(-0.0015, 0.0015) * (k > 0), 118.2990 + rr(-0.002, 0.002) * (k > 0), 9, 14); if (q && sdAt(q.x, q.z) > 12) s = q; } if (!s) return;
  const r = s.rot, f = fwd(r), u = { x: Math.cos(r), z: -Math.sin(r) }, y = minGround(s.x, s.z, 16, 6, r) - 0.4; bee.c = { x: s.x, z: s.z, y, f, u };
  BT.cbox.add(MX(s.x - f.x * 1.5, y, s.z - f.z * 1.5, r, 16, 4.2, 5), new THREE.Color('#c9a26a')); BT.cbox.add(MX(s.x - f.x * 1.9, y + 4.2, s.z - f.z * 1.9, r, 15.4, 0.5, 4.4), new THREE.Color('#7f8f4a')); addBox(s.x - f.x * 1.5, s.z - f.z * 1.5, 8, 2.6, r);
  for (let k = 0; k < 46; k++) { const a = rr(-7.2, 7.2), h = rr(0.9, 3.6); hb(s.x + u.x * a + f.x * 1.02, y + h, s.z + u.z * a + f.z * 1.02, 0.24, 0.2, 0.05, '#2e2014', r); }
  const pv = { x: s.x + f.x * 12, z: s.z + f.z * 12 }, py = groundAt(pv.x, pv.z) - 0.1;
  hb(pv.x, py, pv.z, 8, 0.4, 3, '#7a6a4a', r); for (const sd of [-1, 1]) hb(pv.x + u.x * sd * 3.9, py, pv.z + u.z * sd * 3.9, 0.2, 2.6, 3, '#5d6a4a', r); hb(pv.x + f.x * 1.4, py, pv.z + f.z * 1.4, 8, 2.6, 0.15, '#4f6b3a', r); hb(pv.x, py + 2.6, pv.z, 8.4, 0.2, 3.4, '#3e5530', r);
  for (let k = -3; k <= 3; k++) hb(pv.x + u.x * k * 1.05 - f.x * 1.42, py + 1.2, pv.z + u.z * k * 1.05 - f.z * 1.42, 0.6, 0.35, 0.08, '#1a1b18', r); addBox(pv.x + f.x * 1.4, pv.z + f.z * 1.4, 4.1, 0.2, r);
  addSign('栗喉蜂虎營巢地', 0.5, pv.x + f.x * 1.5, py + 2.15, pv.z + f.z * 1.5, r, { color: '#fff', bg: '#2f7d4f', size: 56, pad: 8 });
  const g = mergeGeos([[new THREE.BoxGeometry(0.11, 0.1, 0.32), '#3fae5a'], [new THREE.BoxGeometry(0.06, 0.03, 0.34).translate(0, 0, -0.32), '#2d7fd0'], [new THREE.BoxGeometry(0.08, 0.06, 0.06).translate(0, -0.03, 0.15), '#a5451e'], [new THREE.BoxGeometry(0.03, 0.03, 0.12).translate(0, 0.01, 0.24), '#222'], [new THREE.BoxGeometry(0.5, 0.02, 0.12).translate(0, 0.03, 0.02), '#3a9e52']]);
  bee.mesh = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 }), 26); bee.mesh.frustumCulled = false; scene.add(bee.mesh);
  for (let i = 0; i < 26; i++) bee.birds.push({ ph: rand() * 6.28, sp: rr(0.5, 0.9), a: rr(-7, 7), h: rr(0.95, 3.5), R: rr(5, 13), up: rr(4, 9) });
  addAction({ x: pv.x - f.x * 0.2, z: pv.z - f.z * 0.2, r: 3, inside: null, label: () => !beeSeason() ? '栗喉蜂虎春夏才會來' : beeOut() ? '📷 拍栗喉蜂虎' : '等栗喉蜂虎出來（白天）', fn: () => { if (!beeOut()) { subtitle('<b>栗喉蜂虎</b>：金門的「夏日精靈」，台灣本島沒有分布。每年春天飛來，在土坡挖洞築巢，白天在空中捕蟲。', 7); return; } flashShot(); sfx('chime', 0.3); dexShot('bee'); subtitle('<b>栗喉蜂虎</b>：綠身、藍尾、栗色喉嚨。金管處在慈湖三角堡營造了這面繁殖坡，從迷彩賞鳥牆的窗口就能看到牠們進出巢洞。', 7); } });
  PLACES.push({ name: '栗喉蜂虎營巢地', x: s.x, z: s.z, r: 16 });
}
function beeOut() { return beeSeason() && env.tod > 6 && env.tod < 17.5; }
function updateBeeEaters() {
  if (!bee.mesh) return; const c = bee.c, near = beeSeason() && Math.hypot(camera.position.x - c.x, camera.position.z - c.z) < 300; bee.mesh.visible = near; if (!near) return; const out = beeOut(), T = game.time;
  for (let i = 0; i < bee.birds.length; i++) { const b = bee.birds[i], hx = c.x + c.u.x * b.a + c.f.x * 1.1, hz = c.z + c.u.z * b.a + c.f.z * 1.1, hy = c.y + b.h; let x, y, z, yaw;
    const cyc = (T * b.sp * 0.15 + b.ph) % 1; if (!out || cyc < 0.25) { x = hx + c.f.x * 0.15; y = hy; z = hz + c.f.z * 0.15; yaw = Math.atan2(c.f.x, c.f.z); }
    else { const a = (cyc - 0.25) / 0.75 * 6.283; x = hx + c.f.x * (Math.sin(a / 2) * b.R) + c.u.x * Math.sin(a) * b.R * 0.5; z = hz + c.f.z * (Math.sin(a / 2) * b.R) + c.u.z * Math.sin(a) * b.R * 0.5; y = hy + Math.sin(a / 2) * b.up; const dx = c.f.x * Math.cos(a / 2) * b.R / 2 + c.u.x * Math.cos(a) * b.R * 0.5, dz = c.f.z * Math.cos(a / 2) * b.R / 2 + c.u.z * Math.cos(a) * b.R * 0.5; yaw = Math.atan2(dx, dz); }
    _ce.set(0, yaw, out && cyc >= 0.25 ? Math.sin(T * 14 + b.ph) * 0.3 : 0); _cq.setFromEuler(_ce); _cs.setScalar(1.6); _cp.set(x, y, z); _cm.compose(_cp, _cq, _cs); bee.mesh.setMatrixAt(i, _cm); }
  bee.mesh.instanceMatrix.needsUpdate = true;
}

/* ---------- 瓊林農田：戴勝（白天在地上啄食） ---------- */
const hoo = { list: [], c: null };
function hoopoes() {
  let s = null; for (let k = 0; k < 120 && !s; k++) { const p = GW(24.4550 + rr(-0.004, 0.004), 118.3738 + rr(-0.005, 0.005)); if (boxFree(p.x, p.z, 7) && roadClear(p.x, p.z, 5) && sdAt(p.x, p.z) > 30) s = p; } if (!s) return; hoo.c = s;
  const g = mergeGeos([[new THREE.BoxGeometry(0.14, 0.13, 0.3), '#d9925a'], [new THREE.BoxGeometry(0.16, 0.05, 0.22).translate(0, 0.06, -0.06), '#1d1d1d'], [new THREE.BoxGeometry(0.17, 0.02, 0.06).translate(0, 0.09, -0.04), '#f2f2f2'], [new THREE.BoxGeometry(0.17, 0.02, 0.05).translate(0, 0.09, -0.12), '#f2f2f2'], [new THREE.BoxGeometry(0.1, 0.1, 0.1).translate(0, 0.1, 0.17), '#d9925a'], [new THREE.BoxGeometry(0.04, 0.14, 0.12).translate(0, 0.2, 0.15), '#c96f35'], [new THREE.BoxGeometry(0.02, 0.02, 0.16).translate(0, 0.09, 0.29), '#222'], [new THREE.BoxGeometry(0.02, 0.12, 0.02).translate(0.03, -0.12, 0), '#555'], [new THREE.BoxGeometry(0.02, 0.12, 0.02).translate(-0.03, -0.12, 0), '#555']]);
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 });
  for (let i = 0; i < 4; i++) { const o = new THREE.Mesh(g, m); o.scale.setScalar(1.5); scene.add(o); hoo.list.push({ m: o, x: s.x + rr(-5, 5), z: s.z + rr(-5, 5), yaw: rr(0, 6.28), t: rr(0, 3), ph: rand() * 6.28 }); }
  for (let k = 0; k < 40; k++) { const x = s.x + rr(-9, 9), z = s.z + rr(-9, 9); BT.ccyl.add(MX(x, groundAt(x, z), z, 0, 0.05, rr(0.4, 0.9), 0.05, rr(-0.3, 0.3), rr(-0.3, 0.3)), new THREE.Color(rr(0.55, 0.7), rr(0.6, 0.7), rr(0.3, 0.4))); }
  const sp = { x: s.x + 9.5, z: s.z }, y = groundAt(sp.x, sp.z); hb(sp.x, y, sp.z, 0.12, 1.6, 0.12, '#6a5236', 0); addSign('瓊林農田・戴勝出沒', 0.36, sp.x, y + 1.75, sp.z, Math.PI / 2, { color: '#fff', bg: '#7a4b22', size: 48, pad: 6 });
  addAction({ x: sp.x + 1, z: sp.z, r: 3.2, inside: null, label: () => hooOut() ? '📷 拍戴勝' : '等戴勝出來（白天）', fn: () => { if (!hooOut()) { subtitle('<b>戴勝</b>：頭上有像扇子的羽冠，在金門是常見的留鳥，白天常在農田、草地用長嘴翻土找蟲。', 7); return; } flashShot(); sfx('chime', 0.3); dexShot('hoopoe'); subtitle('<b>戴勝</b>：橘色身體、黑白斑紋的翅膀，受驚時羽冠會整個張開。金門人很常在田邊看到牠。', 7); } });
  PLACES.push({ name: '瓊林戴勝', x: s.x, z: s.z, r: 12 });
}
function hooOut() { return env.tod > 6.5 && env.tod < 17.8; }
function updateHoopoes(dt) {
  if (!hoo.c) return; const near = Math.hypot(camera.position.x - hoo.c.x, camera.position.z - hoo.c.z) < 200, out = hooOut(), T = game.time;
  for (const h of hoo.list) { h.m.visible = near && out; if (!h.m.visible) continue; h.t -= dt; if (h.t < 0) { h.t = rr(1, 3.5); h.yaw += rr(-1.5, 1.5); if (Math.hypot(h.x - hoo.c.x, h.z - hoo.c.z) > 7) h.yaw = Math.atan2(hoo.c.x - h.x, hoo.c.z - h.z); }
    const walk = h.t > 1; if (walk) { h.x += Math.sin(h.yaw) * dt * 0.6; h.z += Math.cos(h.yaw) * dt * 0.6; } h.m.position.set(h.x, groundAt(h.x, h.z) + 0.18, h.z); h.m.rotation.set(walk ? 0 : 0.5 + Math.sin(T * 8 + h.ph) * 0.3, h.yaw, 0); }
}

/* ---------- 季節：預設跟現實月份，手機可切換。鸕鶿秋冬、栗喉蜂虎春夏 ---------- */
const SEASONS = [{ n: '春', d: '3–5 月・栗喉蜂虎飛來築巢' }, { n: '夏', d: '6–8 月・蜂虎育雛、海灘旺季' }, { n: '秋', d: '9–11 月・鸕鶿陸續飛抵' }, { n: '冬', d: '12–2 月・東北季風，上萬隻鸕鶿過冬' }];
let season = (() => { try { const v = localStorage.getItem('kinmen_season'); if (v !== null) return +v; } catch (e) { } const m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? 0 : m <= 8 && m >= 6 ? 1 : m >= 9 && m <= 11 ? 2 : 3; })();
const cormSeason = () => season >= 2, beeSeason = () => season <= 1;
function setSeason(i) { season = i; try { localStorage.setItem('kinmen_season', i); } catch (e) { } applySeasonLook(); toast('季節切換為「' + SEASONS[i].n + '」' + (i === 3 ? '・東北季風來了，海面浪大' : i === 0 ? '・霧季，常起大霧' : '')); }
const SEASON_LOOK = [{ g: '#f2fff0', w: '#2f8aa4', n: 0.9 }, { g: '#ffffff', w: '#2a8fb0', n: 0.7 }, { g: '#f6ead0', w: '#2c7f9c', n: 1.1 }, { g: '#e9dcb4', w: '#3a7389', n: 1.8 }];
var SORG = SORG || [];
const STALK_TINT = ['#8fd27a', '#ffffff', '#ffc7a8', '#9c8460'];
function applySeasonLook() { const L = SEASON_LOOK[season]; if (BT.stalk && BT.stalk.mat) BT.stalk.mat.color.set(STALK_TINT[season]); if (houhuCrowd) houhuCrowd.visible = season === 1; if (terrainMesh) terrainMesh.material.color.set(L.g); waterMat.color.set(L.w); if (waterMat.normalScale) waterMat.normalScale.setScalar(L.n); }
const SEASON_WX = [[0.35, 0.2, 0.15, 0.3, 0], [0.55, 0.13, 0.24, 0.0, 0.08], [0.63, 0.24, 0.1, 0.0, 0.03], [0.35, 0.45, 0.17, 0.03, 0]];
function seasonWeatherPick() { const w = SEASON_WX[season], r = rand(); let a = 0; for (let i = 0; i < 5; i++) { a += w[i]; if (r < a) return i; } return 0; }
function phoneSeason() { phoneMenu('📱 季節（點選可切換）', SEASONS.map((x, i) => ({ n: (i === season ? '● ' : '') + x.n + '天', d: x.d, fn: () => { setSeason(i); closeMenu(); } }))); }

/* ---------- 太武山環線自行車賽：中山紀念林出發，騎腳踏車依序過檢查點 ---------- */
const BR = { on: false, cps: [], i: 0, t: 0, off: 0, best: 0, start: null };
try { BR.best = +localStorage.getItem('kinmen_bikebest') || 0; } catch (e) { }
function bikeRaceInit(s) {
  BR.start = { x: s.x, z: s.z, rot: s.rot }; const nn = id => roadNodes[id] && { x: roadNodes[id].x, z: roadNodes[id].z, n: id };
  BR.cps = [['QL', '瓊林'], ['XJ', '小徑'], ['PS', '蓮花池']].map(([id, n]) => ({ ...nn(id), name: n })).filter(c => c.x != null); BR.cps.push({ x: s.x, z: s.z, name: '終點・中山紀念林' });
  const f = fwd(s.rot); addAction({ x: s.x + f.x * 7 + Math.cos(s.rot) * 4, z: s.z + f.z * 7 - Math.sin(s.rot) * 4, r: 3, inside: null, label: () => BR.on ? '比賽進行中' : '🚲 太武山環線自行車賽' + (BR.best ? `（紀錄 ${BR.best.toFixed(0)} 秒）` : ''), fn: bikeRaceStart });
}
function bikeRaceStart() {
  if (BR.on) return; if (mission.type || game.busy) return toast('先完成目前的任務'); const s = BR.start, f = fwd(s.rot);
  const v = makeVehicle('bike', s.x + f.x * 9, s.z + f.z * 9, s.rot); if (!v) return toast('起跑區被擋住了'); exitForce(); player.pos.set(v.pos.x + 1.5, v.pos.y, v.pos.z); enterVehicle(v); v.speed = 0;
  BR.on = true; BR.i = 0; BR.t = -3; BR.off = 0; sfx('chime', 0.4); banner('太武山環線自行車賽', '騎腳踏車依序通過 ' + BR.cps.length + ' 個檢查點，下車超過 8 秒算棄賽');
  const c = BR.cps[0]; setTarget(c.x, c.z, '檢查點 1・' + c.name);
}
function bikeRaceEnd(msg) { BR.on = false; clearTarget(); $('timer').textContent = ''; if (msg) { sfx('fail'); subtitle(msg, 4); } }
function updateBikeRace(dt) {
  if (!BR.on) return; BR.t += dt; const v = player.veh;
  if (BR.t < 0) { $('timer').textContent = '🚲 ' + Math.ceil(-BR.t) + '…'; if (v) v.speed = 0; return; }
  if (!v || v.type !== 'bike') { BR.off += dt; if (BR.off > 8) return bikeRaceEnd('下車太久，棄賽'); } else BR.off = 0;
  if (wanted.stars > 0) return bikeRaceEnd('被警察盯上了，比賽中止');
  const c = BR.cps[BR.i]; $('timer').textContent = '🚲 ' + BR.t.toFixed(1) + ' 秒　' + (BR.i + 1) + '/' + BR.cps.length + (BR.off > 0 ? '　快回到車上！' : '');
  if (Math.hypot(player.pos.x - c.x, player.pos.z - c.z) < 12) { BR.i++; sfx('chime', 0.35);
    if (BR.i >= BR.cps.length) { const t = BR.t, pay = t < 200 ? 3000 : t < 250 ? 1800 : 800, rec = !BR.best || t < BR.best; if (rec) { BR.best = t; try { localStorage.setItem('kinmen_bikebest', t); } catch (e) { } } bikeRaceEnd(); addMoney(pay); banner('完賽！', `${t.toFixed(1)} 秒・獎金 $${pay.toLocaleString()}${rec ? '・新紀錄' : ''}`); return; }
    const n = BR.cps[BR.i]; setTarget(n.x, n.z, (BR.i === BR.cps.length - 1 ? '' : '檢查點 ' + (BR.i + 1) + '・') + n.name); }
}

/* ---------- 古寧頭石蚵田：潮間帶一排排花崗石條，可以採石蚵 ---------- */
const oys = { last: -99 };
function oysterField() {
  let c = null; for (let k = 0; k < 400 && !c; k++) { const p = GW(24.4880 + rr(-0.004, 0.004), 118.3170 + rr(-0.008, 0.008)); const sd = sdAt(p.x, p.z); if (sd < -6 && sd > -12) c = p; } if (!c) return;
  let gx = 0, gz = 0; { const e = 4, a = sdAt(c.x + e, c.z) - sdAt(c.x - e, c.z), b = sdAt(c.x, c.z + e) - sdAt(c.x, c.z - e), L = Math.hypot(a, b) || 1; gx = a / L; gz = b / L; } const ux = -gz, uz = gx; // g 指向陸地
  let n = 0; for (let row = -7; row <= 7; row++) for (let j = 0; j < 26; j++) { const x = c.x + ux * row * 2.6 - gx * j * 1.1 + rr(-0.15, 0.15), z = c.z + uz * row * 2.6 - gz * j * 1.1 + rr(-0.15, 0.15); if (sdAt(x, z) > -1 || sdAt(x, z) < -28) continue; BT.cbox.add(MX(x, -0.9, z, rr(0, 3), 0.22, rr(1.1, 1.5), 0.18, rr(-0.12, 0.12), rr(-0.12, 0.12)), new THREE.Color(pick(['#8e8a80', '#9a958a', '#7f7b72']))); if (rand() < 0.5) BT.cbox.add(MX(x, -0.15, z, 0, 0.3, 0.25, 0.26), new THREE.Color('#c8c2b0')); n++; }
  const sh = { x: c.x + gx * 9, z: c.z + gz * 9 }; for (let k = 0; k < 20 && sdAt(sh.x, sh.z) < 2; k++) { sh.x += gx * 2; sh.z += gz * 2; } const y = groundAt(sh.x, sh.z);
  hb(sh.x, y, sh.z, 0.12, 1.6, 0.12, '#6a5236', 0); addSign('古寧頭石蚵田', 0.4, sh.x, y + 1.8, sh.z, Math.atan2(gx, gz), { color: '#fff', bg: '#3d5a6c', size: 48, pad: 6 });
  const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.4, 10), mat('#a7834f', 0.9)); bk.position.set(sh.x + ux * 1.2, y + 0.2, sh.z + uz * 1.2); scene.add(bk);
  addAction({ x: sh.x + ux * 1.2, z: sh.z + uz * 1.2, r: 3, inside: null, label: () => env.tod > 5 && env.tod < 18.5 ? '🦪 採石蚵' : '天黑了，明早再來採蚵', fn: () => {
    if (!(env.tod > 5 && env.tod < 18.5)) return subtitle('<b>石蚵田</b>：金門人在潮間帶插花崗石條養蚵，退潮時穿雨鞋、提竹簍下去剖蚵。天黑看不到路，明天早上再來。', 6);
    if (game.time - oys.last < 90) return toast('剛採過，等潮水再退一點（' + Math.ceil(90 - (game.time - oys.last)) + ' 秒）');
    oys.last = game.time; const kg = Math.round(rr(1.5, 4.5) * 10) / 10, pay = Math.round(kg * 180); env.tod = Math.min(18.4, env.tod + 1.2); addMoney(pay); sfx('splash', 0.4);
    subtitle(`<b>採石蚵</b>：在灘地上剖了一個多小時，裝了 ${kg} 公斤石蚵，賣給村裡的蚵嗲攤 <b>$${pay}</b>。金門石蚵個頭小但很鮮甜，是蚵仔煎、蚵嗲的靈魂。`, 7); } });
  PLACES.push({ name: '古寧頭石蚵田', x: sh.x, z: sh.z, r: 20 });
}

/* ---------- 浯島迎城隍：金城街頭遶境（旗隊、舞獅、鼓陣、神轎、鞭炮） ---------- */
const proc = { on: false, path: null, L: 0, s: 0, grp: null, mem: [], fire: [], blessed: false, near: 0, temple: null, crack: 0 };
function procInit() {
  const t = GW(24.4318, 118.3208); proc.temple = t;
  addAction({ x: t.x, z: t.z, r: 7, inside: null, label: () => proc.on ? '遶境進行中，跟著隊伍走' : '🏮 迎城隍遶境', fn: procStart });
}
function procPathBuild() {
  const pts = [], add = r => { if (r) for (const p of r) pts.push({ x: p[0], z: p[1] }); }; const t = proc.temple, ids = ['JC', 'JCN', 'JCE', 'JC', 'JCS', 'MF'];
  let a = t; for (const id of ids) { const n = roadNodes[id]; if (!n) continue; add(computeRoute(a.x, a.z, n.x, n.z)); a = n; } add(computeRoute(a.x, a.z, t.x, t.z));
  const out = [pts[0]]; for (const p of pts) { const q = out[out.length - 1]; if (Math.hypot(p.x - q.x, p.z - q.z) > 1.2) out.push(p); }
  let L = 0; out[0].d = 0; for (let i = 1; i < out.length; i++) { L += Math.hypot(out[i].x - out[i - 1].x, out[i].z - out[i - 1].z); out[i].d = L; } proc.path = out; proc.L = L;
}
function procAt(d) { const P = proc.path; if (d <= 0) return { x: P[0].x, z: P[0].z, yaw: 0 }; let lo = 0, hi = P.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m].d < d) lo = m; else hi = m; } const a = P[lo], b = P[hi], k = (d - a.d) / Math.max(0.01, b.d - a.d); return { x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k), yaw: Math.atan2(b.x - a.x, b.z - a.z) }; }
function procStart() {
  if (proc.on) return; if (!(env.tod > 7 && env.tod < 18)) { subtitle('<b>迎城隍</b>：農曆四月十二，浯島城隍爺出巡金城大街小巷，是金門最熱鬧的廟會。白天才有遶境，明天早上再來。', 7); return; }
  if (!proc.path) procPathBuild(); if (!proc.path || proc.path.length < 3) return toast('今天路線不通，遶境取消');
  const g = new THREE.Group(), body = new THREE.CapsuleGeometry(0.24, 0.95, 4, 8), head = new THREE.SphereGeometry(0.18, 8, 6), mSk = mat('#d6a07a', 0.7), mFlag = mat('#d4140b', 0.7), mGold = mat('#e8b92e', 0.5), mPole = mat('#5a3b28', 0.8);
  const mk = (role, i) => { const c = role === 'lion' ? '#e8b92e' : role === 'drum' ? '#1d3b8f' : role === 'bear' ? '#f2f2f2' : '#c0392b', P = makePerson({ shirt: c, pants: role === 'bear' ? '#f2f2f2' : '#1d1d1d', longSleeve: true, skirt: false, shorts: false, jacket: null }), o = P.group;
    if (role === 'flag') { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.4, 5), mPole); p.position.set(0.3, 1.7, 0); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.4), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xd4140b : 0xe8b92e, side: THREE.DoubleSide })); f.position.set(0.75, 2.7, 0); o.add(p, f); }
    if (role === 'lion') { const l = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.9), mGold); l.position.y = 1.1; const hd = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.8), mFlag); hd.position.set(0, 1.5, 1.1); o.add(l, hd); }
    if (role === 'drum') { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.5, 14).rotateX(Math.PI / 2), mFlag); d.position.set(0, 1.0, 0.45); o.add(d); }
    g.add(o); return { o, P, role, off: 0, ph: rand() * 6 }; };
  proc.mem = []; let off = 0; const push = (role, n, gap) => { for (let i = 0; i < n; i++) { const m = mk(role, i); m.off = off; m.side = (i % 2 ? 1 : -1) * 0.9; proc.mem.push(m); if (i % 2) off += gap; } };
  push('flag', 8, 2.6); off += 2; const lion = mk('lion', 0); lion.off = off; lion.side = 0; proc.mem.push(lion); off += 4; push('drum', 6, 2.2); off += 2;
  const chair = new THREE.Group(); const box = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.7, 1.5), mFlag); box.position.y = 1.9; const roof = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.8, 4), mGold); roof.position.y = 3.15; roof.rotation.y = Math.PI / 4; const poles = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 4.2), mPole); poles.position.set(0.75, 1.35, 0); const poles2 = poles.clone(); poles2.position.x = -0.75; chair.add(box, roof, poles, poles2); g.add(chair);
  proc.mem.push({ o: chair, role: 'chair', off: off, side: 0, ph: 0 }); for (const [sx, sz] of [[-0.75, 1.6], [0.75, 1.6], [-0.75, -1.6], [0.75, -1.6]]) { const m = mk('bear', 0); m.off = off - sz; m.side = sx; proc.mem.push(m); } off += 5; push('flag', 6, 2.4);
  proc.span = off; scene.add(g); proc.grp = g; proc.s = proc.span; proc.on = true; proc.blessed = false; proc.near = 0;
  banner('浯島迎城隍', '城隍爺出巡！跟著遶境隊伍走一段，沾沾福氣'); sfx('chime', 0.4);
}
function procEnd() { if (proc.grp) { scene.remove(proc.grp); proc.grp = null; } for (const f of proc.fire) scene.remove(f.m); proc.fire = []; proc.on = false; }
function updateProcession(dt) {
  if (!proc.on) return; proc.s += dt * 1.3; if (proc.s - proc.span > proc.L + 2) { procEnd(); toast('城隍爺回廟了，遶境圓滿'); return; }
  const T = game.time; let front = null;
  for (const m of proc.mem) { const d = Math.max(0, Math.min(proc.L, proc.s - m.off)), p = procAt(d), sx = Math.cos(p.yaw) * m.side, sz = -Math.sin(p.yaw) * m.side; const x = p.x + sx, z = p.z + sz, bob = m.role === 'lion' ? Math.abs(Math.sin(T * 5 + m.ph)) * 0.5 : Math.abs(Math.sin(T * 6 + m.ph)) * 0.08;
    m.o.position.set(x, groundAt(x, z) + (m.P ? 0 : bob), z); m.o.rotation.y = p.yaw + (m.role === 'lion' ? Math.sin(T * 2.3) * 0.5 : 0); if (m.P) { poseWalk(m.P, T * 5.2 + m.ph, 0.45); if (m.role === 'flag') m.P.armR.rotation.x = -2.6; if (m.role === 'bear') m.P.armL.rotation.x = m.P.armR.rotation.x = -2.9; if (m.role === 'drum') { m.P.armL.rotation.x = -1.2 + Math.sin(T * 9) * 0.4; m.P.armR.rotation.x = -1.2 - Math.sin(T * 9) * 0.4; } } if (!front) front = { x, z }; }
  proc.crack -= dt; if (proc.crack < 0 && front) { proc.crack = rr(0.08, 0.5); const near = Math.hypot(player.pos.x - front.x, player.pos.z - front.z) < 80; if (near) sfx('shot', 0.05); const sp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 4, 3), new THREE.MeshBasicMaterial({ color: rand() < 0.5 ? 0xffd34d : 0xff4a2a })); sp.position.set(front.x + rr(-2, 2), groundAt(front.x, front.z) + 0.3, front.z + rr(-2, 2)); scene.add(sp); proc.fire.push({ m: sp, t: 0.5, vy: rr(2, 5) }); }
  for (let i = proc.fire.length - 1; i >= 0; i--) { const f = proc.fire[i]; f.t -= dt; f.m.position.y += f.vy * dt; f.vy -= 9 * dt; if (f.t < 0) { scene.remove(f.m); proc.fire.splice(i, 1); } }
  const chair = proc.mem.find(m => m.role === 'chair'); if (chair && !proc.blessed) { if (player.pos.distanceTo(chair.o.position) < 12 && !player.veh) proc.near += dt; if (proc.near > 25) { proc.blessed = true; addMoney(888); banner('沾到城隍爺的福氣', '跟著神轎走了一段・紅包 $888'); } }
}

/* ---------- 跟路人打招呼：金門話（閩南語）回應 ---------- */
const GREET = [['食飽未？', '吃飽了沒？'], ['少年仔，欲去佗位？', '年輕人，要去哪裡？'], ['高粱酒愛試看覓喔，五十八度的！', '高粱酒要試試看，五十八度的！'], ['蚵嗲趁燒食較好食。', '蚵嗲趁熱吃比較好吃。'], ['以前炮彈仔單號規工咧落，這馬較清靜矣。', '以前單號整天在打砲彈，現在比較安靜了。'], ['阮囝攏去台灣食頭路矣。', '我小孩都去台灣工作了。'], ['風獅爺有咧顧，免驚啦。', '有風獅爺在保佑，別怕。'], ['欲食貢糖無？阮厝邊咧做的。', '要不要吃貢糖？我鄰居做的。'], ['這馬遊客真濟，路愛較細膩咧。', '現在遊客很多，路上要小心點。']];
const GREET_W = [['今仔日風真透，衫愛加穿一領。', '今天風好大，衣服要多穿一件。']], GREET_S = [['熱甲欲死，去后湖泅水較快活。', '熱死了，去后湖游泳比較爽快。']];
let greetT = 0;
function greetPed() {
  if (player.veh || player.plane || player.tunnel || game.time - greetT < 1.2) return false; let best = null, bd = 3.2;
  for (const p of peds) { if (p.state === 'down' || p.state === 'flee') continue; const d = Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z); if (d < bd) { bd = d; best = p; } } if (!best) return false; greetT = game.time;
  best.yaw = Math.atan2(player.pos.x - best.pos.x, player.pos.z - best.pos.z);
  const pool = wanted.stars > 0 ? [['啊！莫靠近我！', '啊！不要靠近我！']] : GREET.concat(season === 3 ? GREET_W : season === 1 ? GREET_S : []), g = pick(pool);
  subtitle(`<b>路人</b>：「${g[0]}」<span style="opacity:.7">（${g[1]}）</span>`, 4.5); return true;
}

/* ---------- 獅山砲陣地：砲操表演（口令、推砲、裝填、擊發） ---------- */
var lionGun = lionGun || null; const gd = { on: false, t: 0, men: [], step: 0, smoke: [] };
const GD_STEPS = [[0, '值星官：「砲操表演，開始！」'], [2.5, '「砲班就位！」士兵跑向八吋榴彈砲'], [6, '「方向，左三密位！高低，正二十！」'], [9.5, '「裝填！」兩名砲手扛起九十多公斤的砲彈'], [13, '「預備——」'], [15, 'BOOM'], [17, '「射擊完畢！砲班歸位！」']];
function lionGunInit() {
  if (!lionGun) return; const g = lionGun, f = fwd(g.rot);
  addAction({ x: g.x + f.x * 7, z: g.z + f.z * 7, r: 3.5, inside: null, label: () => gd.on ? '表演中…' : '🎖 看砲操表演', fn: lionGunStart });
}
function lionGunStart() {
  if (gd.on || !lionGun) return; if (!(env.tod > 8 && env.tod < 17)) { subtitle('<b>獅山砲陣地</b>：砲操表演白天才有，每天固定場次。現在士兵都下哨了。', 6); return; }
  const g = lionGun, body = new THREE.CapsuleGeometry(0.24, 0.95, 4, 8), head = new THREE.SphereGeometry(0.19, 8, 6), mU = mat('#4b5a32', 0.8), mH = mat('#3a4527', 0.6), mSk = mat('#d6a07a', 0.7);
  gd.men = []; for (let i = 0; i < 8; i++) { const P = makePerson({ shirt: '#4b5a32', pants: '#3e4a2a', longSleeve: true, female: false, helmet: true, shoe: '#1a1a1a' }), o = P.group; const hat = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 5, 0, 6.3, 0, 1.6), mH); hat.position.y = 1.68; o.add(hat); scene.add(o);
    const a = (i / 8) * 6.283, home = { x: g.x + Math.cos(a) * 3.2, z: g.z + Math.sin(a) * 3.2 }, start = { x: g.x + 12 + i * 1.1, z: g.z + 9 }; o.position.set(start.x, groundAt(start.x, start.z), start.z); gd.men.push({ o, P, home, start, ph: rand() * 6 }); }
  gd.on = true; gd.t = 0; gd.step = 0; sfx('chime', 0.3);
}
function updateLionGun(dt) {
  if (!gd.on) return; gd.t += dt; const g = lionGun;
  while (gd.step < GD_STEPS.length && gd.t >= GD_STEPS[gd.step][0]) { const [, txt] = GD_STEPS[gd.step]; if (txt === 'BOOM') { sfx('boom', 0.9); const f = fwd(g.rot); for (let k = 0; k < 14; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(rr(0.8, 1.6), 6, 5), new THREE.MeshBasicMaterial({ color: k < 3 ? 0xffc04d : 0xd8d4cc, transparent: true, opacity: 0.85 })); m.position.set(g.x + f.x * rr(4, 7), groundAt(g.x, g.z) + rr(1.5, 3), g.z + f.z * rr(4, 7)); scene.add(m); gd.smoke.push({ m, t: rr(1.5, 3), vx: f.x * rr(1, 3), vz: f.z * rr(1, 3) }); } subtitle('<b>轟——！</b>整座山都在震。（表演用空包彈）', 3); } else subtitle('<b>獅山砲陣地</b>：' + txt, 3.4); gd.step++; }
  const phase = gd.t < 2.5 ? 0 : gd.t < 17 ? 1 : 2;
  for (const m of gd.men) { const tgt = phase === 1 ? m.home : m.start, p = m.o.position, dx = tgt.x - p.x, dz = tgt.z - p.z, d = Math.hypot(dx, dz); if (phase > 0 && d > 0.2) { const sp = Math.min(d, dt * 4.5); p.x += dx / d * sp; p.z += dz / d * sp; m.o.rotation.y = Math.atan2(dx, dz); } p.y = groundAt(p.x, p.z); poseWalk(m.P, gd.t * 11 + m.ph, d > 0.2 && phase > 0 ? 1.2 : 0); if (phase === 1 && d <= 0.2) { m.o.rotation.y = Math.atan2(g.x - p.x, g.z - p.z); if (gd.t > 9.5 && gd.t < 15) m.P.armL.rotation.x = m.P.armR.rotation.x = -1.3; } }
  for (let i = gd.smoke.length - 1; i >= 0; i--) { const s = gd.smoke[i]; s.t -= dt; s.m.position.x += s.vx * dt; s.m.position.z += s.vz * dt; s.m.position.y += dt * 0.8; s.m.scale.multiplyScalar(1 + dt * 0.6); s.m.material.opacity = Math.max(0, s.t / 3); if (s.t < 0) { scene.remove(s.m); gd.smoke.splice(i, 1); } }
  if (gd.t > 22) { for (const m of gd.men) scene.remove(m.o); gd.men = []; gd.on = false; }
}

/* ---------- 金門酒廠：參觀品酒（喝了會茫，開車算酒駕） ---------- */
var wineryAt = wineryAt || null; const drunk = { t: 0, caught: false };
function wineryInit() {
  if (!wineryAt) return; const w = wineryAt;
  addAction({ x: w.x, z: w.z, r: 3.5, inside: null, label: () => '🥃 參觀酒廠・品酒', fn: () => { if (!(env.tod > 8 && env.tod < 17.5)) return subtitle('<b>金門酒廠</b>：參觀時間白天才開放。', 5);
    subtitle('<b>金門酒廠</b>：1952 年胡璉將軍為了讓軍民吃飽，推廣種高粱、釀酒換米，才有今天的金門高粱。導覽員倒了一小杯 58 度的給你……', 7); drunk.t = 45; drunk.caught = false; sfx('chime', 0.3); setTimeout(() => toast('🥃 有點茫……喝了酒不要開車喔'), 2500); } });
  addAction({ x: w.x + 2.5, z: w.z + 2.5, r: 2.5, inside: null, label: () => '🎁 買高粱禮盒（$1,200）', fn: () => { if (player.money < 1200) return toast('錢不夠'); addMoney(-1200); sfx('chime', 0.3); banner('買了一盒 58 度金門高粱', '帶回台灣送人最有面子'); } });
}
function updateDrunk(dt) {
  if (drunk.t <= 0) return; drunk.t -= dt;
  if (player.veh && player.veh.driver === 'player' && !drunk.caught && drunk.t < 43 && player.veh.speed > 3) { drunk.caught = true; crimeMin(1); subtitle('<b>酒駕！</b>喝了高粱還開車，警察盯上你了。', 4); }
}
function drunkCam() { if (drunk.t <= 0) return; const k = Math.min(1, drunk.t / 15); camera.rotation.z += Math.sin(game.time * 0.9) * 0.06 * k; camera.position.y += Math.sin(game.time * 1.3) * 0.18 * k; camera.position.x += Math.sin(game.time * 0.7) * 0.25 * k; }

/* ---------- 碼頭釣魚：拋竿 → 等咬 → 看準時機按 E 收竿 ---------- */
const FISH = [['黃魚', 0.6, 1.8, 260], ['石斑', 0.8, 3.5, 420], ['白帶魚', 0.4, 1.2, 180], ['黑鯛（烏格）', 0.5, 2.2, 300], ['紅魽', 1.0, 4.5, 520], ['臭肚魚', 0.2, 0.6, 80], ['破鞋子', 0, 0, 0]];
const fish = { st: 0, t: 0, spot: null, line: null, total: 0 };
try { fish.total = +localStorage.getItem('kinmen_fish') || 0; } catch (e) { }
function fishingInit() {
  for (const [lat, lon, name] of [[24.4150, 118.2892, '水頭碼頭'], [24.4268, 118.2632, '九宮碼頭'], [24.4260, 118.4060, '新湖漁港']]) {
    const c = GW(lat, lon); let s = null; for (let k = 0; k < 4000 && !s; k++) { const a = rand() * 6.283, d = rr(4, 170), x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d, g = groundAt(x, z); if (g < 0.25 || g > 2.5 || !boxFree(x, z, 1.2)) continue; for (let j = 0; j < 12; j++) { const t = j / 12 * 6.283, sx = Math.sin(t), sz = Math.cos(t); if (groundAt(x + sx * 5, z + sz * 5) < -0.05 && groundAt(x + sx * 11, z + sz * 11) < -0.35) { s = { x, z, sx, sz }; break; } } } if (!s) continue; s.name = name; const y = groundAt(s.x, s.z);
    const bk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.45, 10), mat('#2d6cdf', 0.6)); bk.position.set(s.x - s.sz * 1, y + 0.22, s.z + s.sx * 1); scene.add(bk);
    for (const sd of [-3.5, 4]) { const ax = s.x - s.sz * sd, az = s.z + s.sx * sd; if (!boxFree(ax, az, 0.6) || groundAt(ax, az) < 0.2) continue; const P = makePerson({ shorts: rand() < 0.5, female: false }), o = P.group; o.position.set(ax, groundAt(ax, az), az); o.rotation.y = Math.atan2(s.sx, s.sz); P.armL.rotation.x = P.armR.rotation.x = -0.9; scene.add(o);
      const tip = new THREE.Vector3(ax + s.sx * 2.8, groundAt(ax, az) + 2.7, az + s.sz * 2.8), lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(ax + s.sx * 0.45, groundAt(ax, az) + 1.15, az + s.sz * 0.45), tip, new THREE.Vector3(ax + s.sx * 9, 0.02, az + s.sz * 9)]); scene.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x222222 }))); }
    addAction({ x: s.x, z: s.z, r: 2.6, inside: null, label: () => fish.st === 0 ? '🎣 釣魚' : fish.st === 2 ? '❗ 收竿！' : '等魚咬餌…（按 E 收線放棄）', fn: () => fishPress(s) });
  }
}
function fishPress(s) {
  if (fish.st === 0) { fish.st = 1; fish.t = rr(3, 9); fish.spot = s; const y = groundAt(s.x, s.z); const bob = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mat('#ff3b2f', 0.4)); bob.position.set(s.x + s.sx * 7, 0.05, s.z + s.sz * 7); scene.add(bob); fish.line = bob; player.yaw = Math.atan2(s.sx, s.sz); const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]); fish.rod = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x222222 })); fish.rod.frustumCulled = false; scene.add(fish.rod); sfx('swish', 0.3); toast('拋竿！等魚上鉤…'); return; }
  if (fish.st === 2) { const r = rand(), f = r < 0.08 ? FISH[6] : pick(FISH.slice(0, 6)); fishDone(); if (!f[3]) { subtitle('拉上來一看……是一隻<b>破鞋子</b>。', 4); return; } const kg = Math.round(rr(f[1], f[2]) * 10) / 10, pay = Math.round(f[3] * kg); addMoney(pay); fish.total++; try { localStorage.setItem('kinmen_fish', fish.total); } catch (e) { } sfx('splash', 0.4); banner('釣到 ' + f[0] + '！', kg + ' 公斤・賣給魚販 $' + pay); return; }
  fishDone(); toast('收線了');
}
function fishDone() { fish.st = 0; if (fish.line) { scene.remove(fish.line); fish.line = null; } if (fish.rod) { scene.remove(fish.rod); fish.rod = null; } }
function updateFishing(dt) {
  if (!fish.st) return; const s = fish.spot; if (Math.hypot(player.pos.x - s.x, player.pos.z - s.z) > 4 || player.veh) { fishDone(); return; }
  if (fish.rod && fish.line) { const p = fish.rod.geometry.attributes.position, hx = player.pos.x + s.sx * 0.4, hz = player.pos.z + s.sz * 0.4, hy = player.pos.y + 1.2, tx = player.pos.x + s.sx * 2.6, tz = player.pos.z + s.sz * 2.6, ty = player.pos.y + 2.6 + (fish.st === 2 ? -0.5 : 0); p.setXYZ(0, hx, hy, hz); p.setXYZ(1, tx, ty, tz); p.setXYZ(2, fish.line.position.x, fish.line.position.y, fish.line.position.z); p.needsUpdate = true; player.yaw = Math.atan2(s.sx, s.sz); }
  fish.t -= dt; if (fish.line) fish.line.position.y = 0.05 + Math.sin(game.time * 3) * 0.04 - (fish.st === 2 ? 0.18 + Math.sin(game.time * 25) * 0.08 : 0);
  if (fish.st === 1 && fish.t <= 0) { fish.st = 2; fish.t = 1.3; sfx('splash', 0.25); toast('❗ 魚咬餌了！快按 E'); }
  else if (fish.st === 2 && fish.t <= 0) { fishDone(); toast('魚跑掉了……'); }
}

/* 颱風：海浪、樹搖、車子被風推 */
function updateTyphoon(dt) { const on = weather.cur === 4; if (houhuCrowd) houhuCrowd.visible = season === 1 && !on && weather.cur !== 2; waterMat.normalScale && waterMat.normalScale.setScalar(on ? 2.6 : SEASON_LOOK[season].n); if (!on) return; const v = player.veh; if (v && v.driver === 'player' && !v.def.boat) { const w = Math.sin(game.time * 0.7) * 0.5 + 0.5; v.pos.x += Math.cos(game.time * 0.13) * w * dt * (v.def.two ? 1.6 : 0.6); v.pos.z += Math.sin(game.time * 0.13) * w * dt * (v.def.two ? 1.6 : 0.6); } }

/* ---------- 熱門景點的觀光客：白天成群走動、拍照，晚上和雨天散去 ---------- */
const tour = { groups: [] };
function touristsInit() {
  const body = new THREE.CapsuleGeometry(0.23, 0.9, 4, 8), head = new THREE.SphereGeometry(0.17, 8, 6), cap = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10), mSk = mat('#d9a882', 0.7), cam = new THREE.BoxGeometry(0.16, 0.1, 0.08);
  const spots = [[24.42491, 118.31902, 10], [24.4312, 118.3186, 12], [24.4830, 118.3209, 9], [24.4625, 118.4130, 7]]; if (typeof deyueAt !== 'undefined' && deyueAt) spots.push([null, null, 8, deyueAt]);
  for (const [lat, lon, n, at] of spots) { const c = at || GW(lat, lon); const g = { c, men: [], grp: new THREE.Group() };
    for (let i = 0; i < n; i++) { let x = 0, z = 0, ok = false; for (let k = 0; k < 40 && !ok; k++) { x = c.x + rr(-16, 16); z = c.z + rr(-16, 16); ok = boxFree(x, z, 0.6) && groundAt(x, z) > 0.3; } if (!ok) continue;
      const P = makePerson({ shorts: rand() < 0.4, pack: rand() < 0.35 }), o = P.group; const shooter = rand() < 0.4; if (shooter) { const cm = new THREE.Mesh(cam, mat('#222', 0.4)); cm.position.set(0, 1.45, 0.3); o.add(cm); }
      o.position.set(x, groundAt(x, z), z); g.grp.add(o); g.men.push({ o, P, x, z, yaw: rr(0, 6.28), t: rr(0, 4), shooter, ph: rand() * 6 }); }
    scene.add(g.grp); tour.groups.push(g); }
}
function updateTourists(dt) {
  const out = env.tod > 8 && env.tod < 18 && weather.cur !== 2 && weather.cur !== 4;
  for (const g of tour.groups) { const near = Math.hypot(camera.position.x - g.c.x, camera.position.z - g.c.z) < 260; g.grp.visible = out && near; if (!g.grp.visible) continue;
    for (const m of g.men) { m.t -= dt; if (m.t < 0) { m.t = rr(2, 6); m.walk = !m.shooter && rand() < 0.6; m.yaw = Math.hypot(m.x - g.c.x, m.z - g.c.z) > 14 ? Math.atan2(g.c.x - m.x, g.c.z - m.z) : rr(0, 6.28); }
      if (m.walk) { const nx = m.x + Math.sin(m.yaw) * dt * 0.9, nz = m.z + Math.cos(m.yaw) * dt * 0.9; if (boxFree(nx, nz, 0.4)) { m.x = nx; m.z = nz; } else m.t = 0; }
      m.o.position.set(m.x, groundAt(m.x, m.z), m.z); m.o.rotation.y = m.shooter ? Math.atan2(g.c.x - m.x, g.c.z - m.z) : m.yaw; poseWalk(m.P, game.time * 7 + m.ph, m.walk ? 0.6 : 0); if (m.shooter) { m.P.armL.rotation.x = m.P.armR.rotation.x = -1.4; } } }
}

/* ---------- 金門公車：各鄉鎮站牌，按 E 搭車到其他站（$12） ---------- */
const BUS_STOPS = [['金城車站', 'JC'], ['山外車站', 'SW'], ['沙美車站', 'SM'], ['金門大學', 'UNI'], ['尚義機場', 'AP'], ['瓊林', 'QL'], ['水頭', 'ST'], ['古寧頭', 'GN']];
const busStops = [];
function busInit() {
  for (const [name, id] of BUS_STOPS) { const n = roadNodes[id]; if (!n || !n.edges.length) continue; let e, p, side, off, x, z, found = false;
    for (const ee of n.edges) { for (const k of [6, 9, 12, 15, 4, 18, 22]) { for (const sd of [1, -1]) { const i = ee.a === n ? Math.min(k, ee.pts.length - 1) : Math.max(0, ee.pts.length - 1 - k), pp = ee.pts[i]; const o = ee.hw + 1.8, xx = pp.x - pp.tz * sd * o, zz = pp.z + pp.tx * sd * o; if (boxFree(xx, zz, 0.8) && roadClear(xx, zz, 0.6)) { e = ee; p = pp; side = sd; off = o; x = xx; z = zz; found = true; break; } } if (found) break; } if (found) break; } if (!found) continue;
    const y = groundAt(x, z), rot = Math.atan2(-p.tz, p.tx) + Math.PI / 2; hb(x, y, z, 0.1, 2.6, 0.1, '#7a7f86', 0); const sg = signMesh('公車 ' + name, 0.42, { color: '#fff', bg: '#1f6f3f', size: 48, pad: 6 }); sg.position.set(x, y + 2.75, z); sg.rotation.y = Math.atan2(p.tz * side, -p.tx * side) + Math.PI; scene.add(sg);
    hb(x + p.tx * 1.4, y, z + p.tz * 1.4, 2.2, 0.45, 0.6, '#9aa3ab', Math.atan2(p.tx, p.tz) + Math.PI / 2); const st = { name, x, z }; busStops.push(st);
    addAction({ x, z, r: 2.6, inside: null, label: () => '🚌 搭公車（$12）', fn: () => busMenu(st) }); }
}
function busMenu(from) {
  if (wanted.stars) return toast('被通緝時公車司機不讓你上車'); if (player.money < 12) return toast('錢不夠');
  openMenu('🚌 金門公車・' + from.name + ' 上車', busStops.filter(s => s !== from).map(s => ({ n: s.name, d: Math.round(Math.hypot(s.x - from.x, s.z - from.z) / KM * 10) / 10 + ' 公里・$12', free: true, fn: () => { closeMenu(); busRide(from, s); } })));
}
function busRide(from, to) {
  addMoney(-12); if (player.veh) exitForce(); game.busy = true; const mins = Math.max(8, Math.round(Math.hypot(to.x - from.x, to.z - from.z) / KM * 3));
  fade('搭公車往 ' + to.name + '……', () => { player.pos.set(to.x + 1.2, heightAt(to.x + 1.2, to.z), to.z); env.tod = (env.tod + mins / 60) % 24; game.busy = false; toast(`🚌 到站：${to.name}（坐了約 ${mins} 分鐘）`); });
}

/* ---------- 古崗樓（古崗湖畔的雙層樓閣）＋ 金門城明遺古街 ---------- */
function gugangLou() {
  const c0 = GW(24.39382, 118.31455), L = LAKES.find(l => Math.hypot(l.x - c0.x, l.z - c0.z) < 40); if (!L) return; let s = null;
  for (let k = 0; k < 200 && !s; k++) { const a = rand() * 6.283, d = L.r + rr(5, 14), x = L.x + Math.cos(a) * d, z = L.z + Math.sin(a) * d; if (boxFree(x, z, 5) && roadClear(x, z, 5)) s = { x, z, rot: Math.atan2(L.x - x, L.z - z) }; } if (!s) return;
  const y = minGround(s.x, s.z, 8, 8, s.rot) - 0.2, r = s.rot, red = '#b3261e', mRoof = '#1f5e4a';
  hb(s.x, y, s.z, 8.4, 1.2, 8.4, '#b9b2a4', r); for (const [a, b] of [[-3, -3], [3, -3], [-3, 3], [3, 3], [-3, 0], [3, 0], [0, -3], [0, 3]]) { const px = s.x + Math.cos(r) * a + Math.sin(r) * b, pz = s.z - Math.sin(r) * a + Math.cos(r) * b; hb(px, y + 1.2, pz, 0.35, 3.4, 0.35, red, r); hb(px, y + 5.2, pz, 0.3, 2.6, 0.3, red, r); }
  hb(s.x, y + 1.2, s.z, 5.4, 3.2, 5.4, '#efe3c8', r); hb(s.x, y + 4.6, s.z, 8.6, 0.25, 8.6, '#7a2a1c', r); BT.roof.add(MX(s.x, y + 4.85, s.z, r, 9.6, 1.1, 9.6), new THREE.Color(mRoof)); hb(s.x, y + 5.2, s.z, 4.6, 2.6, 4.6, '#efe3c8', r);
  BT.roof.add(MX(s.x, y + 7.8, s.z, r, 7.2, 1.6, 7.2), new THREE.Color(mRoof)); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 6), mat('#e8b92e', 0.4)); tip.position.set(s.x, y + 9.8, s.z); scene.add(tip); addBox(s.x, s.z, 4.3, 4.3, r);
  const f = fwd(r + Math.PI); addSign('古崗樓', 0.6, s.x + f.x * 2.75, y + 6.4, s.z + f.z * 2.75, r + Math.PI, { color: '#f4d27a', bg: '#1d1d1d', size: 64, pad: 8 });
  addAction({ x: s.x + f.x * 5.5, z: s.z + f.z * 5.5, r: 3.2, inside: null, label: () => '看介紹', fn: () => subtitle('<b>古崗樓</b>：1960 年代建在古崗湖畔的中國宮殿式樓閣，樓前湖光山色，是金門最上鏡的風景之一。附近就是魯王的「漢影雲根」石刻。', 7) });
  PLACES.push({ name: '古崗樓', x: s.x, z: s.z, r: 14 });
}
function mingYiStreet() {
  const c = GW(24.4042, 118.3096), n = nearestRoad(c.x, c.z, 200); if (!n) return; const p = n.p, tx = p.tx, tz = p.tz, nx = -tz, nz = tx; let built = 0;
  for (const side of [1, -1]) for (let k = -3; k <= 3; k++) { const off = n.e.hw + 5.2, x = p.x + tx * k * 6.4 + nx * side * off, z = p.z + tz * k * 6.4 + nz * side * off; if (!boxFree(x, z, 3.1) || !roadClear(x, z, n.e.hw + 1)) continue; const y = groundAt(x, z) - 0.2, rot = Math.atan2(-nx * side, -nz * side);
    hb(x, y, z, 6, 3.4, 6, pick(['#a8a296', '#b5452e', '#9e988c', '#b84a30']), rot); BT.roof.add(MX(x, y + 3.4, z, rot, 6.4, 1.4, 6.6), new THREE.Color('#9c3b26')); hb(x - nx * side * 3.02, y, z - nz * side * 3.02, 1.6, 2.4, 0.06, '#4a3424', rot); hb(x - nx * side * 3.03 + tx * 1.9, y + 1.2, z - nz * side * 3.03 + tz * 1.9, 0.9, 0.9, 0.05, '#2c2620', rot); addBox(x, z, 3, 3, rot); built++; }
  if (!built) return; const ay = groundAt(p.x, p.z); for (const sd of [-1, 1]) hb(p.x + nx * sd * (n.e.hw + 0.4) + tx * -22, ay, p.z + nz * sd * (n.e.hw + 0.4) + tz * -22, 0.6, 4.4, 0.6, '#9e988c', 0);
  const sg = signMesh('明遺古街', 0.8, { color: '#f4d27a', bg: '#3a2a1c', size: 64, pad: 8 }); sg.position.set(p.x + tx * -22, ay + 4.2, p.z + tz * -22); sg.rotation.y = Math.atan2(tx, tz); scene.add(sg);
  addAction({ x: p.x + tx * -18, z: p.z + tz * -18, r: 4, inside: null, label: () => '看介紹', fn: () => subtitle('<b>明遺古街</b>：金門城是明朝洪武年間江夏侯周德興築的千戶所城，城內這條老街保留了花崗石和紅磚老店屋，是金門最古老的街道之一。', 7) });
  PLACES.push({ name: '明遺古街', x: p.x, z: p.z, r: 22 });
}

/* ---------- 模範街：手工貢糖 DIY（看準時機按 E 搥花生） ---------- */
const gt = { on: false, round: 0, hits: [], t: 0, el: null };
function gongtangInit() {
  const c = GW(24.4312, 118.3186), n = nearestRoad(c.x, c.z, 120); if (!n) return; let s = null; for (let k = 0; k < 120 && !s; k++) { const x = c.x + rr(-25, 25), z = c.z + rr(-25, 25); if (boxFree(x, z, 1.4) && !roadClear(x, z, 6) === false && groundAt(x, z) > 0.3) s = { x, z }; } if (!s) return;
  const y = groundAt(s.x, s.z); hb(s.x, y, s.z, 1.8, 0.9, 0.9, '#7a5a3a', 0); hb(s.x, y + 0.9, s.z, 1.6, 0.08, 0.8, '#c9a26a', 0); const sg = signMesh('貢糖 DIY', 0.4, { color: '#fff', bg: '#b3261e', size: 48, pad: 6 }); sg.position.set(s.x, y + 1.9, s.z); scene.add(sg); hb(s.x, y + 0.9, s.z, 0.06, 1.0, 0.06, '#555', 0);
  gt.x = s.x; gt.z = s.z + 1.2; addAction({ x: s.x, z: s.z + 1.2, r: 2.4, inside: null, label: () => gt.on ? '❗ 搥！（按 E）' : '🥜 手工貢糖 DIY（$100）', fn: gongtangPress });
}
function gongtangPress() {
  if (!gt.on) { if (player.money < 100) return toast('錢不夠'); addMoney(-100); gt.on = true; gt.round = 0; gt.hits = []; gt.t = 0; gongtangUI(true); subtitle('<b>貢糖 DIY</b>：花生和麥芽糖要趁熱搥，看指針走到<b style="color:#5ce08a">綠色</b>時按 E，搥三下。', 5); return; }
  const p = gtPos(), good = Math.abs(p - 0.5) < 0.12, ok = Math.abs(p - 0.5) < 0.26; gt.hits.push(good ? 2 : ok ? 1 : 0); sfx('thud', 0.4); gt.round++; gt.t = 0;
  toast(good ? '漂亮！' : ok ? '還可以' : '太歪了……');
  if (gt.round >= 3) { const sc = gt.hits.reduce((a, b) => a + b, 0), q = sc >= 5 ? ['特級貢糖', 900] : sc >= 3 ? ['一般貢糖', 400] : ['碎掉的貢糖', 120]; gt.on = false; gongtangUI(false); addMoney(q[1]); banner('做好了：' + q[0], '賣給遊客 $' + q[1] + '（評分 ' + sc + '/6）'); }
}
function gtPos() { return (Math.sin(gt.t * (2.4 + gt.round * 0.8)) + 1) / 2; }
function gongtangUI(show) {
  if (show && !gt.el) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:50%;bottom:22%;transform:translateX(-50%);width:320px;height:22px;border-radius:11px;background:#2b2b2b;border:2px solid #f4d27a;z-index:50;overflow:hidden'; d.innerHTML = '<div style="position:absolute;left:38%;width:24%;top:0;bottom:0;background:#e0b04a"></div><div style="position:absolute;left:44%;width:12%;top:0;bottom:0;background:#5ce08a"></div><div id="gtNeedle" style="position:absolute;top:-2px;bottom:-2px;width:4px;background:#fff;left:0"></div>'; document.body.appendChild(d); gt.el = d; }
  if (!show && gt.el) { gt.el.remove(); gt.el = null; }
}
function updateGongtang(dt) { if (!gt.on) return; gt.t += dt; const n = document.getElementById('gtNeedle'); if (n) n.style.left = (gtPos() * 98) + '%'; if (Math.hypot(player.pos.x - gt.x, player.pos.z - gt.z) > 5) { gt.on = false; gongtangUI(false); toast('貢糖做到一半跑掉了……'); } }

/* ---------- 戰地標語牆：路邊、村口的白牆紅字 ---------- */
const SLOGANS = ['枕戈待旦', '莊敬自強', '處變不驚', '保密防諜', '軍民一家', '反共復國', '誓死保衛金門', '實踐三民主義', '復興基地', '毋忘在莒', '團結自強', '光復大陸國土'];
function sloganWalls() {
  let n = 0, tries = 0; const used = [];
  while (n < 22 && tries++ < 900) { const e = pick(roadEdges); if (!e || e.bridge || !e.pts || e.pts.length < 4) continue; const i = 1 + Math.floor(rand() * (e.pts.length - 2)), p = e.pts[i], side = rand() < 0.5 ? 1 : -1, off = e.hw + 3.2, x = p.x - p.tz * side * off, z = p.z + p.tx * side * off;
    if (used.some(u => Math.hypot(u.x - x, u.z - z) < 180) || sdAt(x, z) < 15 || !boxFree(x, z, 4.5) || !roadClear(x, z, 1.4)) continue; if (missionSpots.start && Math.hypot(missionSpots.start.x - x, missionSpots.start.z - z) < 120) continue;
    const txt = pick(SLOGANS), W = Math.max(5, txt.length * 1.5 + 1.2), rot = Math.atan2(p.tz * -side * 0 + p.tx, p.tz) + Math.PI / 2, y = groundAt(x, z) - 0.2, fx = p.tz * side * 0 - p.tz * -side, fz = -p.tx * side;
    const ry = Math.atan2(-(-p.tz * side), -(p.tx * side)); hb(x, y, z, W, 2.6, 0.5, '#efeae0', ry); hb(x, y + 2.6, z, W + 0.2, 0.15, 0.6, '#9e988c', ry); addBox(x, z, W / 2, 0.3, ry);
    const sg = signMesh(txt, Math.min(1.2, (W - 1) / txt.length / 1.05), { color: '#c0241c', bg: '#efeae0', size: 72, pad: 4 }); const nx = -(-p.tz * side), nz = -(p.tx * side); sg.position.set(x + Math.sin(ry) * 0.27, y + 1.4, z + Math.cos(ry) * 0.27); sg.rotation.y = ry; scene.add(sg);
    used.push({ x, z, ry }); n++; } sloganList = used;
}
let sloganList = [];

/* ---------- 海岸機槍堡＋瓊麻（帶刺劍麻，當年用來阻擋登陸） ---------- */
function coastPillboxes() {
  const leaf = new THREE.ConeGeometry(0.09, 1.3, 4).translate(0, 0.65, 0), parts = []; for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, m = new THREE.Matrix4().makeRotationY(a).multiply(new THREE.Matrix4().makeRotationZ(0.75 - (k % 3) * 0.22)); parts.push([leaf.clone(), k % 2 ? '#4f7a5a' : '#5d8a64', m]); }
  const agaveG = mergeGeos(parts), agaveM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }); const ag = []; const used = []; let n = 0;
  for (let t = 0; t < 4000 && n < 30; t++) { const x = TX0 + rand() * NX * CELL, z = TZ0 + rand() * NZ * CELL, sd = sdAt(x, z); if (sd < 10 || sd > 26 || groundAt(x, z) < 0.6) continue; if (used.some(u => Math.hypot(u.x - x, u.z - z) < 130) || !boxFree(x, z, 3) || !roadClear(x, z, 3)) continue; if (missionSpots.start && Math.hypot(missionSpots.start.x - x, missionSpots.start.z - z) < 150) continue;
    const e = 4, a = sdAt(x + e, z) - sdAt(x - e, z), b = sdAt(x, z + e) - sdAt(x, z - e), ry = Math.atan2(-a, -b), y = groundAt(x, z) - 0.4;
    hb(x, y, z, 3.4, 2.2, 3.4, '#8d8f84', ry); hb(x, y + 2.2, z, 3.8, 0.35, 3.8, '#6f7166', ry); hb(x + Math.sin(ry) * 1.72, y + 1.45, z + Math.cos(ry) * 1.72, 1.6, 0.26, 0.05, '#1a1b18', ry); hb(x - Math.sin(ry) * 1.72, y, z - Math.cos(ry) * 1.72, 0.8, 1.6, 0.05, '#2b2c28', ry); addBox(x, z, 1.8, 1.8, ry);
    for (let k = 0; k < 7; k++) { const aa = rand() * 6.283, d = rr(3, 6), px = x + Math.cos(aa) * d, pz = z + Math.sin(aa) * d; if (sdAt(px, pz) > 4 && roadClear(px, pz, 1)) ag.push([px, groundAt(px, pz), pz, rr(0.8, 1.3), rand() * 6.28]); }
    used.push({ x, z }); n++; }
  for (let k = 0; k < 900; k++) { const x = TX0 + rand() * NX * CELL, z = TZ0 + rand() * NZ * CELL, sd = sdAt(x, z); if (sd > 5 && sd < 22 && groundAt(x, z) > 0.4 && boxFree(x, z, 1) && roadClear(x, z, 1.5)) ag.push([x, groundAt(x, z), z, rr(0.8, 1.3), rand() * 6.28]); }
  const im = new THREE.InstancedMesh(agaveG, agaveM, ag.length), M = new THREE.Matrix4(); ag.forEach(([x, y, z, s, r], i) => { M.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r, 0)), new THREE.Vector3(s, s, s)); im.setMatrixAt(i, M); }); im.castShadow = true; scene.add(im);

}

/* ---------- 老街紅燈籠（模範街、沙美老街），晚上亮起來 ---------- */
const lanternMat = new THREE.MeshStandardMaterial({ color: 0xc0100a, emissive: 0xe0140a, emissiveIntensity: 0.15, roughness: 0.6 });
let lanternAt = null;
function lanternStreets() {
  const geo = new THREE.SphereGeometry(0.32, 10, 8).scale(1, 1.25, 1), list = [], wire = [];
  for (const [lat, lon] of [[24.4312, 118.3186], [24.4906, 118.4108]]) { const c = GW(lat, lon), n = nearestRoad(c.x, c.z, 120); if (!n) continue; const e = n.e;
    for (let k = -6; k <= 6; k++) { const i = Math.max(0, Math.min(e.pts.length - 1, n.i + k * 2)), p = e.pts[i]; if (!p) continue; const nx = -p.tz, nz = p.tx, w = e.hw + 1.2, y = groundAt(p.x, p.z) + 4.6;
      for (let j = -2; j <= 2; j++) { const t = j / 2.5, x = p.x + nx * w * t, z = p.z + nz * w * t; list.push([x, y - (1 - t * t) * 0.6, z]); } wire.push(new THREE.Vector3(p.x - nx * w, y + 0.3, p.z - nz * w), new THREE.Vector3(p.x + nx * w, y + 0.3, p.z + nz * w)); } }
  if (!list.length) return; lanternAt = list; const im = new THREE.InstancedMesh(geo, lanternMat, list.length), M = new THREE.Matrix4(); list.forEach(([x, y, z], i) => { M.makeTranslation(x, y, z); im.setMatrixAt(i, M); }); scene.add(im);
  const lg = new THREE.BufferGeometry().setFromPoints(wire); scene.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x333333 })));
}
function updateLanterns() { lanternMat.emissiveIntensity = 0.15 + env.night * 0.75; }

/* ---------- 中秋博餅：擲六顆骰子，依組合給獎（一秀、二舉、四進、三紅、對堂、狀元） ---------- */
const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
function bobingRank(d) {
  const c = [0, 0, 0, 0, 0, 0, 0]; for (const x of d) c[x]++; const fours = c[4], maxSame = Math.max(...c.slice(1)), same = c.findIndex((v, i) => i > 0 && v === maxSame);
  if (fours === 4 && c[1] === 2) return ['狀元插金花', 8888]; if (maxSame === 6) return fours === 6 ? ['六勃紅・狀元', 8888] : c[1] === 6 ? ['遍地錦・狀元', 8888] : ['六勃黑・狀元', 6666]; if (maxSame === 5) return ['五子登科・狀元', 3888]; if (fours === 4) return ['狀元', 1888];
  if (c.slice(1).every(v => v === 1)) return ['對堂', 800]; if (fours === 3) return ['三紅', 500]; if (maxSame === 4) return ['四進', 300]; if (fours === 2) return ['二舉', 150]; if (fours === 1) return ['一秀', 80]; return ['沒中', 0];
}
function bobingInit() {
  const t = GW(24.4318, 118.3208); let s = null; for (let k = 0; k < 60 && !s; k++) { const x = t.x + rr(-14, 14), z = t.z + rr(-14, 14); if (boxFree(x, z, 1.6) && groundAt(x, z) > 0.3) s = { x, z }; } if (!s) return; const y = groundAt(s.x, s.z);
  const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 20), mat('#b3261e', 0.6)); tb.position.set(s.x, y + 0.85, s.z); scene.add(tb); hb(s.x, y, s.z, 0.15, 0.85, 0.15, '#5a3b28', 0); const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 8, 0, 6.3, 1.2, 1.9), mat('#f2efe6', 0.3)); bowl.position.set(s.x, y + 1.25, s.z); scene.add(bowl);
  const sg = signMesh('中秋博餅', 0.38, { color: '#f4d27a', bg: '#b3261e', size: 48, pad: 6 }); sg.position.set(s.x, y + 2.1, s.z); scene.add(sg); hb(s.x + 1.1, y, s.z, 0.06, 2.0, 0.06, '#555', 0);
  addAction({ x: s.x, z: s.z + 1.3, r: 2.5, inside: null, label: () => '🎲 博餅（$50）' + (season === 2 ? '・中秋限定加倍' : ''), fn: () => {
    if (player.money < 50) return toast('錢不夠'); addMoney(-50); const d = Array.from({ length: 6 }, () => 1 + Math.floor(rand() * 6)); let [name, pay] = bobingRank(d); if (season === 2) pay *= 2; sfx('thud', 0.35); setTimeout(() => sfx('thud', 0.25), 120); setTimeout(() => sfx('thud', 0.2), 260);
    const face = d.map(x => `<span style="font-size:1.5em;${x === 4 ? 'color:#ff4a3a' : ''}">${DICE[x - 1]}</span>`).join(' ');
    subtitle(`${face}　<b>${name}</b>${pay ? '　獎金 $' + pay : ''}`, 5); if (pay) { addMoney(pay); if (pay >= 1888) banner('博到 ' + name + '！', '獎金 $' + pay.toLocaleString()); } } });
  PLACES.push({ name: '中秋博餅', x: s.x, z: s.z, r: 6 });
}

/* ---------- 遶境鑼鼓：大鼓＋銅鑼，「咚咚鏘」節奏，越近越大聲 ---------- */
const drumBeat = { t: 0, i: 0 };
function procDrum(kind, vol) {
  if (!AC || vol < 0.01) return; try { const t = AC.currentTime, g = AC.createGain(); g.connect(MASTER);
    if (kind === 'drum') { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.25); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); o.start(t); o.stop(t + 0.32); }
    else { for (const f of [520, 787, 1130, 1490]) { const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = f * (0.98 + Math.random() * 0.04); o.connect(g); o.start(t); o.stop(t + 1.1); } g.gain.setValueAtTime(vol * 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.1); } } catch (e) { }
}
function updateProcDrums(dt) {
  if (!proc.on || !proc.mem.length) return; const lead = proc.mem.find(m => m.role === 'drum') || proc.mem[0], d = Math.hypot(player.pos.x - lead.o.position.x, player.pos.z - lead.o.position.z), vol = Math.max(0, 1 - d / 120) * 0.45; if (vol <= 0) return;
  drumBeat.t -= dt; if (drumBeat.t > 0) return; const pat = ['drum', 'drum', 'gong', null]; const k = pat[drumBeat.i % 4]; drumBeat.i++; drumBeat.t = 0.32; if (k) procDrum(k, vol);
}

/* ---------- 電台在地新聞：依季節、天氣、時段 ---------- */
function kinmenNews() {
  const n = ['金門酒廠今天開放參觀，58 度高粱試飲，喝了記得不要開車。', '模範街今天的貢糖 DIY 攤位大排長龍。', '公車處提醒，金城、山外、沙美之間每天都有班車。'];
  if (season === 0) n.push('春天霧季來了，尚義機場今天可能延誤，搭機旅客請注意。', '栗喉蜂虎陸續飛抵慈湖三角堡，賞鳥朋友把握機會。');
  if (season === 1) n.push('后湖海濱公園救生員已經上班，戲水請在浮球範圍內。', '栗喉蜂虎進入育雛期，請大家賞鳥保持距離。');
  if (season === 2) n.push('中秋將近，城隍廟前的博餅桌獎金加倍！', '第一批鸕鶿已經抵達慈湖。');
  if (season === 3) n.push('東北季風增強，海邊風浪大，請不要靠近消波塊。', '上萬隻鸕鶿在慈湖過冬，傍晚歸巢非常壯觀。');
  if (weather.cur === 4) n.push('颱風警報！飛機、交通船全面停駛，請大家待在室內。'); if (weather.cur === 3) n.push('大霧籠罩全島，尚義機場暫停起降。');
  if (proc.on) n.push('城隍爺正在金城遶境，民生路一帶交通管制。'); if (env.tod > 16 && env.tod < 19 && cormSeason()) n.push('現在正是慈湖鸕鶿歸巢的時間。');
  return n;
}

/* ---------- 在地小吃攤：吃了回血，附小吃介紹 ---------- */
const FOODS = [
  ['廣東粥', 24.4325, 118.3195, 60, 40, '金門人的早餐：米粒熬到化開成綿綿的粥底，加豬肝、肉丸，再配一根油條。', () => env.tod > 5.5 && env.tod < 11, '廣東粥只賣早上，中午就收攤了'],
  ['閩式燒餅', 24.4899, 118.4115, 40, 30, '沙美老街的燒餅：酥皮包著甜鹹內餡，烤到外皮一層一層掉渣。', null, ''],
  ['芋頭冰', 24.4465, 118.2522, 50, 35, '烈嶼芋頭鬆軟香甜，做成冰淇淋綿密到不行，是小金門必吃。', null, ''],
  ['蚵仔麵線', 24.4410, 118.4135, 70, 45, '石蚵小顆但鮮甜，配上紅麵線，再加一匙辣椒醬。', null, ''],
  ['蚵嗲', 24.4892, 118.4135, 50, 35, '石蚵、韭菜、豬肉包進麵糊下鍋炸，咬下去燙口又酥脆。', null, '']];
function foodStalls() {
  for (const [name, lat, lon, price, hp, info, open, closed] of FOODS) {
    const c = GW(lat, lon); let s = null; for (let k = 0; k < 120 && !s; k++) { const x = c.x + rr(-22, 22), z = c.z + rr(-22, 22); if (boxFree(x, z, 1.5) && groundAt(x, z) > 0.3 && !roadClear(x, z, 4) && roadClear(x, z, 0.8)) s = { x, z }; } if (!s) continue;
    const y = groundAt(s.x, s.z); hb(s.x, y, s.z, 1.8, 0.95, 1.0, '#8a6a46', 0); for (const [a, b] of [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]]) hb(s.x + a, y, s.z + b, 0.06, 2.2, 0.06, '#666', 0); hb(s.x, y + 2.2, s.z, 2.2, 0.08, 1.4, pick(['#c0392b', '#2d6cdf', '#e8b92e', '#16a085']), 0);
    const sg = signMesh(name, 0.36, { color: '#fff', bg: '#7c2f25', size: 48, pad: 6 }); sg.position.set(s.x, y + 1.75, s.z + 0.52); scene.add(sg); addBox(s.x, s.z, 0.95, 0.55, 0);
    addAction({ x: s.x, z: s.z + 1.4, r: 2.4, inside: null, label: () => (open && !open() ? '🍜 ' + name + '（打烊了）' : `🍜 吃${name}（$${price}）`), fn: () => { if (open && !open()) return toast(closed); if (player.money < price) return toast('錢不夠'); addMoney(-price); player.hp = Math.min(100, player.hp + hp); survEat(hp * 1.5); sfx('chime', 0.2); subtitle(`<b>${name}</b>：${info}`, 6); } });
    PLACES.push({ name: name + '攤', x: s.x, z: s.z, r: 5 }); }
}

/* ---------- 金門大橋夜間燈光 ---------- */
const bridgeLightMat = new THREE.MeshStandardMaterial({ color: 0xfff2d0, emissive: 0xffe3a0, emissiveIntensity: 0, roughness: 0.4 });
function bridgeLights() {
  if (typeof bridgeEdge === 'undefined' || !bridgeEdge) return; const e = bridgeEdge, list = [];
  for (let i = 2; i < e.pts.length - 2; i += 3) { const p = e.pts[i], nx = -p.tz, nz = p.tx; for (const sd of [-1, 1]) list.push([p.x + nx * sd * (e.hw + 0.5), (p.y || 0) + 1.3, p.z + nz * sd * (e.hw + 0.5)]); }
  if (!list.length) return; const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 8, 6), bridgeLightMat, list.length), M = new THREE.Matrix4(); list.forEach(([x, y, z], i) => { M.makeTranslation(x, y, z); im.setMatrixAt(i, M); }); scene.add(im);
}
function updateBridgeLights() { bridgeLightMat.emissiveIntensity = env.night * 2.0; }

/* ---------- 對岸城市夜景：天際線的窗戶入夜亮燈 ---------- */
let cityPts = null;
function cityLights() {
  if (typeof CITY_LIGHTS === 'undefined' || !CITY_LIGHTS.length) return; const n = CITY_LIGHTS.length / 3, col = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const c = new THREE.Color(pick(['#ffe2a8', '#fff4dc', '#ffd27a', '#cfe6ff', '#ffffff'])); col.set([c.r, c.g, c.b], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(CITY_LIGHTS, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  cityPts = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, fog: false, depthWrite: false })); cityPts.frustumCulled = false; scene.add(cityPts);
}
function updateCityLights() { if (!cityPts) { if (game.time > 0.5) { cityLights(); if (!cityPts) cityPts = false; } return; } const o = env.night * (weather.cur === 3 ? 0.15 : weather.cur >= 2 ? 0.5 : 1); cityPts.material.opacity = o; cityPts.visible = o > 0.02; }

/* ---------- 漁港氣氛：停泊漁船（隨浪起伏）＋岸邊釣客 ---------- */
const harbor = { boats: [], anglers: [] };
function harborLife() {
  const hull = mergeGeos([[new THREE.BoxGeometry(2.2, 0.9, 6.5), '#f2f2f2', new THREE.Matrix4().makeTranslation(0, 0.2, 0)], [new THREE.ConeGeometry(1.15, 1.6, 4).rotateX(Math.PI / 2).rotateZ(Math.PI / 4).scale(1.35, 0.55, 1), '#f2f2f2', new THREE.Matrix4().makeTranslation(0, 0.2, 3.9)], [new THREE.BoxGeometry(2.25, 0.25, 6.6), '#1f5fa8', new THREE.Matrix4().makeTranslation(0, -0.2, 0)], [new THREE.BoxGeometry(1.5, 1.3, 1.8), '#dfe6ea', new THREE.Matrix4().makeTranslation(0, 1.25, -1.2)], [new THREE.BoxGeometry(1.52, 0.35, 1.82), '#c0392b', new THREE.Matrix4().makeTranslation(0, 2.0, -1.2)], [new THREE.CylinderGeometry(0.05, 0.05, 3.2, 5), '#555', new THREE.Matrix4().makeTranslation(0, 2.6, 0.8)]]);
  const bm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });
  for (const [lat, lon] of [[24.4260, 118.4060], [24.4268, 118.2632], [24.4150, 118.2892]]) { const c = GW(lat, lon); let placed = 0;
    for (let k = 0; k < 800 && placed < 4; k++) { const a = rand() * 6.283, d = rr(10, 160), x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; if (groundAt(x, z) > -0.7 || groundAt(x, z) < -6 || harbor.boats.some(b => Math.hypot(b.x - x, b.z - z) < 9)) continue; let nearLand = false; for (let j = 0; j < 8 && !nearLand; j++) { const t = j / 8 * 6.283; if (groundAt(x + Math.sin(t) * 32, z + Math.cos(t) * 32) > 0.2) nearLand = true; } if (!nearLand) continue;
      const m = new THREE.Mesh(hull, bm); m.castShadow = true; scene.add(m); harbor.boats.push({ m, x, z, yaw: rand() * 6.28, ph: rand() * 6 }); placed++; } }
}
function updateHarbor() { const T = game.time; for (const b of harbor.boats) { if (Math.abs(camera.position.x - b.x) > 500 || Math.abs(camera.position.z - b.z) > 500) { b.m.visible = false; continue; } b.m.visible = true; const sw = weather.cur === 4 ? 3 : season === 3 ? 1.8 : 1; b.m.position.set(b.x, -0.15 + Math.sin(T * 1.3 + b.ph) * 0.12 * sw, b.z); b.m.rotation.set(Math.sin(T * 1.1 + b.ph) * 0.03 * sw, b.yaw + Math.sin(T * 0.3 + b.ph) * 0.08, Math.sin(T * 0.9 + b.ph * 2) * 0.05 * sw); } }
