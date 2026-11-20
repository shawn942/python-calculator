/* =====================================================================
   寫實樹木：樹幹＋「葉片貼圖卡片」堆成的樹冠（alpha test），每棵約 150～250 個三角形。
   法線朝樹冠外側，光影像一整團樹葉；內側與底部壓暗做出層次。?oldtrees 可切回舊版。
   ===================================================================== */
const NAT = { ready: false, g: {}, on: !/oldtrees/.test(location.search), dens: matchMedia('(pointer: coarse)').matches ? 0.5 : 0.75 }; // 手機卡片數減半（省填充率）
function natTexture() {
  const t = canvasTex(512, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const inBlob = (x, y, cx) => { const dx = (x - cx) / 96, dy = (y - 128) / 120; return dx * dx + dy * dy < 1; };
    // 左：闊葉（先畫暗的再畫亮的，有前後層次）
    const lv = []; for (let i = 0; i < 620; i++) { const x = rr(8, 196), y = rr(8, 248); if (inBlob(x, y, 102)) lv.push([x, y, rr(26, 54)]); } lv.sort((a, b) => a[2] - b[2]);
    for (const [x, y, l] of lv) { g.save(); g.translate(x, y); g.rotate(rr(0, 6.28)); g.fillStyle = `hsl(${rr(82, 120)},${rr(36, 58)}%,${l}%)`; g.beginPath(); g.ellipse(0, 0, rr(7, 11), rr(3.2, 5.2), 0, 0, 6.28); g.fill(); g.strokeStyle = `hsla(95,40%,${l + 14}%,0.5)`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-7, 0); g.lineTo(7, 0); g.stroke(); g.restore(); }
    // 中：針葉（木麻黃／松）
    const nd = []; for (let i = 0; i < 1500; i++) { const x = rr(212, 400), y = rr(8, 248); if (inBlob(x, y, 306)) nd.push([x, y, rr(22, 46)]); } nd.sort((a, b) => a[2] - b[2]);
    g.lineCap = 'round'; for (const [x, y, l] of nd) { const a = rr(0.9, 2.2), L = rr(12, 24); g.strokeStyle = `hsl(${rr(92, 128)},${rr(22, 40)}%,${l}%)`; g.lineWidth = rr(1.1, 1.9); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
    // 右：樹皮
    g.fillStyle = '#6a5645'; g.fillRect(412, 0, 100, h); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '30,20,12' : '170,150,125'},${rr(0.06, 0.22)})`; g.fillRect(rr(412, 510), rr(0, h), rr(1, 3), rr(10, 46)); }
  }, false); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
function natBuild(kind) {
  const P = [], N = [], U = [], C = [], I = []; const cc = kind === 'pine' ? [0, 0.62, 0] : [0, 0.66, 0];
  const vert = (x, y, z, u, v, s, nx, ny, nz) => { P.push(x, y, z); U.push(u, v); C.push(s * rr(0.9, 1), s, s * rr(0.82, 0.95)); if (nx === undefined) { nx = x - cc[0]; ny = (y - cc[1]) * 0.8 + 0.25; nz = z - cc[2]; } const l = Math.hypot(nx, ny, nz) || 1; N.push(nx / l, ny / l, nz / l); return P.length / 3 - 1; };
  const trunk = (h, r0, r1, bx = 0, bz = 0, lean = 0, la = 0) => { const S = 6, b = P.length / 3; for (let k = 0; k <= 3; k++) { const t = k / 3, y = h * t, r = r0 + (r1 - r0) * t, ox = bx + Math.cos(la) * lean * t * t, oz = bz + Math.sin(la) * lean * t * t; for (let i = 0; i <= S; i++) { const a = i / S * 6.283; P.push(ox + Math.cos(a) * r, y, oz + Math.sin(a) * r); N.push(Math.cos(a), 0.1, Math.sin(a)); U.push(0.83 + 0.14 * i / S, t); const s = 0.75 + 0.25 * t; C.push(s, s, s); } }
    for (let k = 0; k < 3; k++) for (let i = 0; i < S; i++) { const a = b + k * (S + 1) + i, d = a + S + 1; I.push(a, d, a + 1, a + 1, d, d + 1); } };
  const blob = (x, y, z, r, n, u0, ry = 1) => { n = Math.max(4, Math.round(n * NAT.dens)); const big = NAT.dens < 0.6 ? 1.18 : 1.06; for (let i = 0; i < n; i++) {
    let dx, dy, dz, l; do { dx = rr(-1, 1); dy = rr(-1, 1); dz = rr(-1, 1); l = Math.hypot(dx, dy, dz); } while (l > 1 || l < 0.05); dx /= l; dy /= l; dz /= l; const d = r * rr(0.35, 0.95), px = x + dx * d, py = y + dy * d * ry, pz = z + dz * d, s = r * rr(0.75, 1.15) * big;
    // 卡片的兩個軸：隨機朝向
    let ax = rr(-1, 1), ay = rr(-0.6, 0.6), az = rr(-1, 1); l = Math.hypot(ax, ay, az) || 1; ax /= l; ay /= l; az /= l; let bx = ay * dz - az * dy + rr(-0.3, 0.3), by = az * dx - ax * dz + 0.6, bz = ax * dy - ay * dx + rr(-0.3, 0.3); l = Math.hypot(bx, by, bz) || 1; bx /= l; by /= l; bz /= l;
    const sh = clamp(0.78 + 0.3 * (dy * 0.5 + 0.5) + 0.26 * d / r, 0.78, 1.3), q = [];
    for (const [a, b, u, v] of [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, 1, 0, 1]]) q.push(vert(px + (ax * a + bx * b) * s, py + (ay * a + by * b) * s, pz + (az * a + bz * b) * s, u0 + 0.01 + u * 0.38, 0.01 + v * 0.98, sh));
    I.push(q[0], q[1], q[2], q[0], q[2], q[3]); } };
  if (kind === 'round') { trunk(0.5, 0.045, 0.028); blob(0, 0.68, 0, 0.3, 22, 0); for (let k = 0; k < 5; k++) { const a = k * 1.257 + rr(-0.3, 0.3), R = rr(0.2, 0.27); blob(Math.cos(a) * R, rr(0.56, 0.7), Math.sin(a) * R, rr(0.19, 0.24), 12, 0); } }
  else if (kind === 'tall') { trunk(0.52, 0.04, 0.024, 0, 0, 0.05, rr(0, 6)); blob(0, 0.56, 0, 0.24, 16, 0); blob(0.03, 0.72, 0.02, 0.24, 18, 0); blob(-0.02, 0.86, 0, 0.16, 12, 0); for (let k = 0; k < 3; k++) { const a = k * 2.1 + rr(0, 1); blob(Math.cos(a) * 0.18, rr(0.52, 0.66), Math.sin(a) * 0.18, 0.17, 9, 0); } }
  else if (kind === 'wide') { trunk(0.42, 0.055, 0.035); for (let k = 0; k < 3; k++) { const a = k * 2.09 + 0.5; trunk(0.6, 0.02, 0.012, 0, 0, 0.26, a); } blob(0, 0.72, 0, 0.3, 18, 0, 0.75); for (let k = 0; k < 7; k++) { const a = k * 0.9 + rr(-0.2, 0.2), R = rr(0.26, 0.38); blob(Math.cos(a) * R, rr(0.56, 0.68), Math.sin(a) * R, rr(0.2, 0.25), 11, 0, 0.8); } }
  else if (kind === 'pine') { trunk(0.92, 0.03, 0.008); for (let k = 0; k < 7; k++) { const t = k / 6, y = 0.3 + t * 0.62, r = 0.2 - t * 0.13; blob(rr(-0.03, 0.03), y, rr(-0.03, 0.03), r, 10, 0.4, 0.9); } }
  else if (kind === 'bush') { cc[1] = 0.3; blob(0, 0.45, 0, 0.5, 16, 0, 0.7); blob(0.3, 0.35, 0.1, 0.35, 8, 0, 0.7); blob(-0.25, 0.35, -0.2, 0.35, 8, 0, 0.7); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeBoundingSphere(); return g;
}
let mNat = null;
async function loadNature() { if (!NAT.on) return; mNat = new THREE.MeshStandardMaterial({ map: natTexture(), alphaTest: 0.42, side: THREE.DoubleSide, vertexColors: true, roughness: 0.9 }); for (const k of ['round', 'round2', 'tall', 'wide', 'pine', 'pine2', 'bush']) NAT.g[k] = { geo: natBuild(k.replace('2', '')), h: 1 }; NAT.ready = true; }
const NAT_TREES = ['round', 'round2', 'tall', 'wide'], NAT_PINES = ['pine', 'pine2'];
/* 影子：葉片卡片不投影（alpha test 的陰影很貴），改由一顆看不見的簡單球體代投 */
const mNatSh = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
function natBatches(batch) { if (!NAT.ready) return; for (const k in NAT.g) batch('nat_' + k, NAT.g[k].geo, mNat, false); batch('nat_sh', new THREE.OctahedronGeometry(1, 0), mNatSh, true); }
const _natTint = new THREE.Color();
function natTint(h = 0.27) { return _natTint.setHSL(h + rr(-0.05, 0.05), rr(0.2, 0.45), rr(0.72, 0.95)).clone(); }
function natTree(x, z, kind, s) { // 回傳 false 代表用舊的程序化樹
  if (!NAT.ready) return false; const y = groundAt(x, z) - 0.15;
  if (kind === 1) { const k = pick(NAT_PINES), H = rr(9, 13) * s, w = H * rr(0.85, 1.1); regTree(x, z, w * 0.2 + 0.6, y + H, [BT['nat_' + k].add(MX(x, y, z, rr(0, 6.28), w, H, w), natTint(0.3)), BT.nat_sh.add(MX(x, y + H * 0.62, z, 0, w * 0.17, H * 0.34, w * 0.17))]); return true; }
  const k = pick(NAT_TREES), H = rr(7, 10) * s, w = H * rr(0.95, 1.25), ents = [BT['nat_' + k].add(MX(x, y, z, rr(0, 6.28), w, H, w), natTint()), BT.nat_sh.add(MX(x, y + H * 0.66, z, 0, w * 0.4, H * 0.27, w * 0.4))];
  if (Math.random() < 0.35) { const a = rr(0, 6.28), d = w * rr(0.35, 0.6), bx = x + Math.cos(a) * d, bz = z + Math.sin(a) * d, bs = rr(1.6, 2.6) * s; BT.nat_bush.add(MX(bx, groundAt(bx, bz) - 0.1, bz, rr(0, 6.28), bs, bs * rr(0.8, 1.1), bs), natTint(0.25)); }
  regTree(x, z, w * 0.4 + 0.6, y + H, ents); return true;
}
