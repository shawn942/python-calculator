/* =====================================================================
   碰撞（圓 vs 有向矩形）
   ===================================================================== */
const CCELL = 48, colHash = new Map();
const ckey = (cx, cz) => (cx + 300) * 1000 + cz + 300;
function addBox(x, z, hw, hd, rot = 0) {
  const c = { x, z, hw, hd, cos: Math.cos(rot), sin: Math.sin(rot), r: Math.hypot(hw, hd) };
  for (let cx = Math.floor((x - c.r) / CCELL); cx <= Math.floor((x + c.r) / CCELL); cx++) for (let cz = Math.floor((z - c.r) / CCELL); cz <= Math.floor((z + c.r) / CCELL); cz++) { const k = ckey(cx, cz); let a = colHash.get(k); if (!a) colHash.set(k, a = []); a.push(c); }
  return c;
}
function resolveCircle(p, rad, thin = false) { // thin：車輛不會被細桿子（路燈、號誌、招牌桿）卡住
  let hit = null; const cx0 = Math.floor((p.x - rad) / CCELL), cx1 = Math.floor((p.x + rad) / CCELL), cz0 = Math.floor((p.z - rad) / CCELL), cz1 = Math.floor((p.z + rad) / CCELL);
  for (let a = cx0; a <= cx1; a++) for (let b = cz0; b <= cz1; b++) {
    const arr = colHash.get(ckey(a, b)); if (!arr) continue;
    for (const c of arr) {
      if (c.off || (c.top !== undefined && p.y > c.top - 0.3) || (thin && c.hw < 0.36 && c.hd < 0.36)) continue; const dx = p.x - c.x, dz = p.z - c.z; if (dx * dx + dz * dz > (c.r + rad) * (c.r + rad)) continue;
      const lx = dx * c.cos - dz * c.sin, lz = dx * c.sin + dz * c.cos, qx = clamp(lx, -c.hw, c.hw), qz = clamp(lz, -c.hd, c.hd), ex = lx - qx, ez = lz - qz, d2 = ex * ex + ez * ez;
      if (d2 > rad * rad) continue; let nx, nz, pen;
      if (d2 > 1e-8) { const d = Math.sqrt(d2); nx = ex / d; nz = ez / d; pen = rad - d; }
      else { const px = c.hw - Math.abs(lx), pz = c.hd - Math.abs(lz); if (px < pz) { nx = Math.sign(lx) || 1; nz = 0; pen = px + rad; } else { nx = 0; nz = Math.sign(lz) || 1; pen = pz + rad; } }
      const wx = nx * c.cos + nz * c.sin, wz = -nx * c.sin + nz * c.cos; p.x += wx * pen; p.z += wz * pen; hit = { nx: wx, nz: wz };
    }
  }
  return hit;
}
const DOORPTS = [];
function boxFree(x, z, r, noDoor = false) {
  if (r >= 4) { let y0 = 1e9, y1 = -1e9; for (const [ax, az] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]]) { const g = groundAt(x + ax * r * 0.7, z + az * r * 0.7); if (g < y0) y0 = g; if (g > y1) y1 = g; } if (y1 - y0 > Math.max(2.0, r * 0.4)) return false; } // 太陡的坡不蓋房子（會一半埋進土裡）
  if (!noDoor) for (const d of DOORPTS) if (Math.abs(d.x - x) < r + 2.2 && Math.abs(d.z - z) < r + 2.2 && Math.hypot(d.x - x, d.z - z) < r + 2.2) return false;
  const cx0 = Math.floor((x - r) / CCELL), cx1 = Math.floor((x + r) / CCELL), cz0 = Math.floor((z - r) / CCELL), cz1 = Math.floor((z + r) / CCELL);
  for (let a = cx0; a <= cx1; a++) for (let b = cz0; b <= cz1; b++) { const arr = colHash.get(ckey(a, b)); if (!arr) continue; for (const c of arr) { if (c.off) continue; const dx = x - c.x, dz = z - c.z, lx = dx * c.cos - dz * c.sin, lz = dx * c.sin + dz * c.cos, ex = lx - clamp(lx, -c.hw, c.hw), ez = lz - clamp(lz, -c.hd, c.hd); if (ex * ex + ez * ez < r * r) return false; } }
  return true;
}
function minGround(x, z, w, d, rot) { const c = Math.cos(rot), s = Math.sin(rot); let m = groundAt(x, z); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const lx = a * w / 2, lz = b * d / 2; m = Math.min(m, groundAt(x + lx * c + lz * s, z - lx * s + lz * c)); } return m; }
function roadClear(x, z, r, skip = null) { const n = nearestRoad(x, z, r + 6, skip); return !n || n.dist > r + n.e.hw; }

/* =====================================================================
   材質、貼圖、共用幾何
   ===================================================================== */
const COL = {}; for (const [k, v] of Object.entries({ stone: '#d9d3c5', door: '#3a2a22', window: '#e9e2d2', dark: '#2b2a2c', white: '#f1ebdf', concrete: '#bdb9b0', slab: '#a9a6a0', red: '#b3312c', green: '#5f8a4a', cream: '#efe4cc', olive: '#59603d', rust: '#5b4435', asphalt: '#4a4c52', plaza: '#cfc6b3', glass: '#31495c', gold: '#d2a84a', track: '#b65a44', turf: '#5f9a4e', bunker: '#7f8273', blue: '#3b6ea8' })) COL[k] = new THREE.Color(v);
const BRICKS = ['#e8a58c', '#dd9a80', '#efb39a', '#d98f74'].map(c => new THREE.Color(c));
const TILES = ['#b5533a', '#a94a33', '#bd5f44', '#9f4630'].map(c => new THREE.Color(c));
const WALL_TINTS = ['#f3e6cf', '#f1dcd0', '#efe3c2', '#e8efe0', '#f5ead8', '#ecd5c4', '#f2e8d8', '#e3e9dc'].map(c => new THREE.Color(c));
const AWN = ['#b3423a', '#3f6fa3', '#3f8f6b', '#d1a23b', '#8a8f96', '#a65a3a'].map(c => new THREE.Color(c));
const LEAF = ['#4a7a3a', '#557f3d', '#3f6b35', '#628d44'].map(c => new THREE.Color(c));
const PINE = ['#4b7a47', '#55864d', '#447241'].map(c => new THREE.Color(c));

const brickTex = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#bfae9a'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 16; r++) for (let c = -1; c < 4; c++) { const x = c * 32 + (r % 2 ? 16 : 0), y = r * 8; const v = Math.random(); g.fillStyle = `rgb(${178 + v * 26 | 0},${84 + v * 18 | 0},${62 + v * 14 | 0})`; g.fillRect(x + 1, y + 1, 30, 6.4); }
}, true);
const facadeTex = canvasTex(256, 256, (g) => {
  g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(0, r * 64 + 60, 256, 4); for (let c = 0; c < 4; c++) { const x = c * 64 + 12, y = r * 64 + 14; g.fillStyle = '#d9d5cb'; g.fillRect(x - 3, y - 3, 46, 40); g.fillStyle = (r + c * 3) % 5 === 0 ? '#51677a' : '#33475a'; g.fillRect(x, y, 40, 34); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(x, y, 19, 34); g.fillStyle = '#d9d5cb'; g.fillRect(x + 19, y, 2, 34); if ((r * 7 + c * 5) % 6 === 1) { g.fillStyle = '#b9bcbd'; g.fillRect(x + 8, y + 38, 22, 9); } } }
}, true);
const facadeEmis = canvasTex(256, 256, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if ((r * 5 + c * 3 + 1) % 3 !== 0) { g.fillStyle = (r + c) % 2 ? '#ffd9a0' : '#fff1d0'; g.fillRect(c * 64 + 12, r * 64 + 14, 40, 34); } }, true);
const arcadeTex = canvasTex(256, 256, (g) => {
  g.drawImage(brickTex.image, 0, 0, 256, 256); g.fillStyle = 'rgba(120,40,25,0.18)'; g.fillRect(0, 0, 256, 256);
  for (let c = 0; c < 2; c++) { const x = c * 128; g.fillStyle = '#efe6d6'; g.fillRect(x + 4, 122, 120, 8); g.fillRect(x + 4, 0, 120, 7);
    g.fillStyle = '#efe6d6'; g.beginPath(); g.moveTo(x + 18, 256); g.lineTo(x + 18, 190); g.arc(x + 64, 190, 46, Math.PI, 0); g.lineTo(x + 110, 256); g.fill();
    g.fillStyle = '#2c2420'; g.beginPath(); g.moveTo(x + 26, 256); g.lineTo(x + 26, 192); g.arc(x + 64, 192, 38, Math.PI, 0); g.lineTo(x + 102, 256); g.fill();
    for (const wx of [30, 76]) { g.fillStyle = '#efe6d6'; g.fillRect(x + wx - 4, 30, 30, 70); g.fillStyle = '#3a4d58'; g.fillRect(x + wx, 34, 22, 62); } }
}, true);
const SHOPS = ['金門貢糖', '高粱酒', '一條根', '砲彈鋼刀', '廣東粥', '蚵仔麵線', '閩式燒餅', '牛肉乾', '機車出租', '民宿'];
const signAtlas = canvasTex(1280, 512, (g) => {
  const bgs = ['#b3261e', '#f4efe2', '#1f5fa8', '#e3b92f', '#f4efe2', '#2f7d58', '#b3261e', '#e3b92f', '#1f5fa8', '#f4efe2'], fgs = ['#fff3c9', '#b3261e', '#ffffff', '#2b2420', '#1f5fa8', '#ffffff', '#ffffff', '#b3261e', '#fff3c9', '#2f7d58'];
  SHOPS.forEach((s, k) => { g.fillStyle = bgs[k]; g.fillRect(k * 128, 0, 128, 512); g.strokeStyle = fgs[k]; g.lineWidth = 5; g.strokeRect(k * 128 + 8, 8, 112, 496); const ch = [...s], gap = 480 / ch.length; g.font = `900 ${Math.min(96, gap * 0.86)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fgs[k]; ch.forEach((c, i) => g.fillText(c, k * 128 + 64, 16 + gap * (i + .5))); });
});
const mFacade = new THREE.MeshStandardMaterial({ map: facadeTex, emissiveMap: facadeEmis, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.88 });
const mTempleF = new THREE.MeshStandardMaterial({ color: 0x8a2a22, roughness: 0.85 }); // 廟門立面（載入照片後換貼圖）
const mArcade = new THREE.MeshStandardMaterial({ map: arcadeTex, roughness: 0.9 });
const mBrick = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
const mPlain = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
const mLeaf = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
const mTile = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
const mSign = new THREE.MeshStandardMaterial({ map: signAtlas, emissiveMap: signAtlas, emissive: 0xffffff, emissiveIntensity: 0.15, side: THREE.FrontSide, roughness: 0.6 });
const mGlow = new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xffd58a, emissiveIntensity: 0 });
const mPool = new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,150,1)'); gr.addColorStop(0.5, 'rgba(255,200,120,0.35)'); gr.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8 });
const mMetal = new THREE.MeshStandardMaterial({ color: 0xcdd2d6, roughness: 0.35, metalness: 0.75 });

const GEO = {};
GEO.box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
GEO.cyl = new THREE.CylinderGeometry(1, 1, 1, 12).translate(0, 0.5, 0);
GEO.brick = (() => { const g = GEO.box.clone(); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 1.4); return g; })();
/* 金門老街店屋立面（騎樓拱廊＋拱窗＋招牌帶＋山牆），2 層與 3 層兩種 */
function shopFacTex(floors, emis) { const W = 384, FH = 160, H = FH * floors + 40; return canvasTex(W, H, g => {
  g.fillStyle = emis ? '#000' : '#f7f1e6'; g.fillRect(0, 0, W, H); const bw = W / 3;
  if (!emis) { g.fillStyle = '#e9dcc4'; g.fillRect(0, 0, W, 40); g.fillStyle = '#f7f1e6'; g.beginPath(); g.moveTo(W / 2 - 70, 40); g.quadraticCurveTo(W / 2, -6, W / 2 + 70, 40); g.fill(); g.strokeStyle = '#cdbb98'; g.lineWidth = 4; g.stroke(); }
  for (let f = 0; f < floors; f++) { const y0 = 40 + (floors - 1 - f) * FH;
    if (!emis) { g.fillStyle = '#ddcfb3'; g.fillRect(0, y0 + FH - 10, W, 10); }
    for (let b = 0; b < 3; b++) { const x0 = b * bw;
      if (f === 0) { if (emis) { g.fillStyle = '#ffcf7a'; g.fillRect(x0 + 22, y0 + 70, bw - 44, FH - 80); continue; } g.fillStyle = '#2a2622'; g.beginPath(); g.moveTo(x0 + 14, y0 + FH); g.lineTo(x0 + 14, y0 + 70); g.arc(x0 + bw / 2, y0 + 70, bw / 2 - 14, Math.PI, 0); g.lineTo(x0 + bw - 14, y0 + FH); g.fill(); g.fillStyle = '#5b4435'; g.fillRect(x0 + 30, y0 + 84, bw - 60, FH - 84); }
      else { const ww = bw - 50, wx = x0 + 25, wy = y0 + 42; if (emis) { if ((b + f) % 2 === 0) { g.fillStyle = '#ffd890'; g.fillRect(wx + 6, wy + 10, ww - 12, FH - 72); } continue; }
        const fc = (b + f) % 3 === 1 ? '#8c3b2b' : '#3f7f6e'; g.fillStyle = '#e2d5bb'; g.fillRect(wx - 8, wy - 26, ww + 16, FH - 30); g.fillStyle = fc; g.beginPath(); g.moveTo(wx, wy + FH - 64); g.lineTo(wx, wy + 8); g.arc(wx + ww / 2, wy + 8, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + FH - 64); g.fill();
        g.fillStyle = '#2b3a44'; g.fillRect(wx + 8, wy + 8, ww - 16, FH - 80); g.fillStyle = fc; g.fillRect(wx + ww / 2 - 3, wy + 8, 6, FH - 80); g.fillStyle = '#cfc4ad'; g.fillRect(wx - 6, wy + FH - 66, ww + 12, 8); for (let k = 0; k < 6; k++) g.fillRect(wx + 4 + k * (ww - 8) / 5, wy + FH - 60, 4, 14); } }
    if (f === 0 && !emis) { g.fillStyle = '#a82a22'; g.fillRect(18, y0 + 18, W - 36, 34); g.fillStyle = '#f4d27a'; for (let k = 0; k < 5; k++) g.fillRect(48 + k * 62, y0 + 26, 38, 18); } }
  for (let b = 0; b <= 3; b++) if (!emis) { g.fillStyle = '#e4d6bb'; g.fillRect(Math.min(W - 10, b * bw - 5), 40, 10, H - 40); } }); }
const mShop2 = new THREE.MeshStandardMaterial({ map: shopFacTex(2), emissiveMap: shopFacTex(2, true), emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.85 });
const mShop3 = new THREE.MeshStandardMaterial({ map: shopFacTex(3), emissiveMap: shopFacTex(3, true), emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.85 });
function facadeGeo(bays, floors) { const g = GEO.box.clone(); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * bays / 4, uv.getY(i) * floors / 4); return g; }
GEO.roof = (() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.quadraticCurveTo(-0.22, 0.38, 0, 1); s.quadraticCurveTo(0.22, 0.38, 0.5, 0); s.lineTo(-0.5, 0); const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 6 }); g.translate(0, 0, -0.5); g.rotateY(Math.PI / 2); { const p = g.attributes.position, u = g.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, p.getX(i) + 0.5, Math.hypot(p.getY(i), 0.5 - Math.abs(p.getZ(i))) * 0.9); } return g; })();
GEO.ridge = (() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0.62); s.quadraticCurveTo(0, -0.08, 0.5, 0.62); s.lineTo(0.5, 0.5); s.quadraticCurveTo(0, -0.2, -0.5, 0.5); s.lineTo(-0.5, 0.62); const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false, curveSegments: 10 }); g.translate(0, 0, -0.06); return g; })();
GEO.hip = new THREE.CylinderGeometry(0.42, 1, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0); { const u = GEO.hip.attributes.uv; for (let i = 0; i < u.count; i++) u.setX(i, u.getX(i) * 4); }
GEO.ico = new THREE.IcosahedronGeometry(1, 1);
GEO.cone = mergeGeos([[new THREE.ConeGeometry(1, 0.55, 8), '#ffffff', new THREE.Matrix4().makeTranslation(0, 0.275, 0)], [new THREE.ConeGeometry(0.78, 0.5, 8), '#ffffff', new THREE.Matrix4().makeTranslation(0, 0.56, 0)], [new THREE.ConeGeometry(0.52, 0.42, 8), '#ffffff', new THREE.Matrix4().makeTranslation(0, 0.8, 0)]]);
GEO.trunk = new THREE.CylinderGeometry(0.2, 0.32, 1, 6).translate(0, 0.5, 0);

function initBatches() {
  batch('wall', GEO.brick, mBrick); batch('cbox', GEO.box, mPlain); batch('ccyl', GEO.cyl, mPlain); batch('roof', GEO.roof, mTile); batch('ridge', GEO.ridge, mat('#efe6d2', 0.8)); batch('hip', GEO.hip, mTile);
  batch('tfront', new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), mTempleF, false); facVariants(); batch('kshop2', GEO.box, mShop2); batch('kshop3', GEO.box, mShop3); batch('fac33', facadeGeo(3, 3), mFacade); batch('fac34', facadeGeo(3, 4), mFacade); batch('fac84', facadeGeo(8, 4), mFacade); batch('fac86', facadeGeo(8, 6), mFacade); batch('arcade', (() => { const g = GEO.box.clone(); return g; })(), mArcade);
  batch('trunk', GEO.trunk, mat('#5f4c3b', 1)); batch('leaf', GEO.ico, mLeaf); batch('pine', GEO.cone, mLeaf); natBatches(batch); batch('tank', GEO.cyl, mMetal);
  batch('lamp', mergeGeos([[new THREE.CylinderGeometry(0.07, 0.1, 7, 6), '#7d8389', new THREE.Matrix4().makeTranslation(0, 3.5, 0)], [new THREE.BoxGeometry(0.08, 0.08, 1.7), '#7d8389', new THREE.Matrix4().makeTranslation(0, 7, 0.8)]]), mVC, false);
  batch('lampHead', new THREE.BoxGeometry(0.32, 0.12, 0.7).translate(0, 6.94, 1.5), mGlow, false);
  batch('pool', new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), mPool, false);
  for (let k = 0; k < 10; k++) { const g = new THREE.PlaneGeometry(1, 1); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, (k + uv.getX(i)) / 10); batch('sign' + k, g, mSign, false); }
  const st = new THREE.CylinderGeometry(0.03, 0.05, 1.5, 4).translate(0, 0.75, 0), hd = new THREE.SphereGeometry(0.15, 5, 4).scale(1, 2.2, 1).translate(0, 1.65, 0), T = (x, z, t) => new THREE.Matrix4().makeRotationZ(t).setPosition(x, 0, z);
  batch('stalk', mergeGeos([[st, '#5d8a3c', T(0, 0, 0.06)], [hd, '#9a3f25', T(0, 0, 0.06)], [st, '#6a9443', T(0.8, 0.5, -0.08)], [hd, '#a8492a', T(0.8, 0.5, -0.08)], [st, '#5d8a3c', T(-0.6, 0.9, 0.03)], [hd, '#8f3a22', T(-0.6, 0.9, 0.03)], [st, '#6a9443', T(0.2, -0.8, -0.04)], [hd, '#a8492a', T(0.2, -0.8, -0.04)]]), mVC, false);
  batch('spike', new THREE.CylinderGeometry(0.09, 0.11, 3.4, 5).translate(0, 1.4, 0), mat('#4d3b30', 0.9), false);
}

/* =====================================================================
   建築元件
   ===================================================================== */
function minnanHouse(x, z, rot, w = 11, d = 8) {
  const y = minGround(x, z, w, d, rot) - 0.15, hgt = 3.5, fx = Math.sin(rot), fz = Math.cos(rot), ux = Math.cos(rot), uz = -Math.sin(rot);
  BT.wall.add(MX(x, y, z, rot, w, hgt, d), pick(BRICKS)); BT.cbox.add(MX(x, y, z, rot, w + 0.25, 0.85, d + 0.25), COL.stone);
  BT.roof.add(MX(x, y + hgt, z, rot, w + 1.0, 2.3, d + 1.6), pick(TILES)); BT.ridge.add(MX(x, y + hgt + 2.0, z, rot, w + 2.4, 1.5, 1.6));
  if (rand() < 0.75) for (const s2 of [-1, 1]) { const ex = x + ux * s2 * (w / 2 + 1.0), ez = z + uz * s2 * (w / 2 + 1.0); BT.cbox.add(MX(ex, y + hgt + 2.25, ez, rot, 1.9, 0.22, 0.32, 0, s2 * 0.55), new THREE.Color('#7a2f22')); BT.cbox.add(MX(ex + ux * s2 * 0.75, y + hgt + 2.75, ez + uz * s2 * 0.75, rot, 0.9, 0.14, 0.2, 0, s2 * 0.95), new THREE.Color('#7a2f22')); }
  const px = x + fx * (d / 2 + 0.04), pz = z + fz * (d / 2 + 0.04);
  BT.cbox.add(MX(px, y, pz, rot, 1.5, 2.6, 0.12), COL.door);
  for (const s of [-1, 1]) BT.cbox.add(MX(px + ux * s * w * 0.3, y + 1.5, pz + uz * s * w * 0.3, rot, 1.1, 1.0, 0.1), COL.window);
  BT.cbox.add(MX(px, y + 2.75, pz, rot, 2.2, 0.5, 0.14), new THREE.Color('#c0392b')); BT.cbox.add(MX(px, y, pz + 0, rot, 2.4, 0.28, 0.9), COL.stone);
  addBox(x, z, w / 2, d / 2, rot);
  // 三合院：兩側護龍＋前院矮牆與門樓
  if (w > 10.4 && rand() < 0.6) { const wl = 5.2, ok = [-1, 1].every(s => { const cx = x + fx * (d / 2 + wl / 2) + ux * s * (w / 2 - 1.6), cz = z + fz * (d / 2 + wl / 2) + uz * s * (w / 2 - 1.6); return roadClear(cx, cz, 3) && boxFree(cx, cz, 1.5) && sdAt(cx, cz) > 20; }) && roadClear(x + fx * (d / 2 + wl + 0.5), z + fz * (d / 2 + wl + 0.5), 2.5);
    if (ok) { const br = pick(BRICKS), tl = pick(TILES); for (const s of [-1, 1]) { const cx = x + fx * (d / 2 + wl / 2) + ux * s * (w / 2 - 1.6), cz = z + fz * (d / 2 + wl / 2) + uz * s * (w / 2 - 1.6); BT.wall.add(MX(cx, y, cz, rot, 3.2, 2.9, wl), br); BT.roof.add(MX(cx, y + 2.9, cz, rot + Math.PI / 2, wl + 0.6, 1.4, 3.8), tl); addBox(cx, cz, 1.6, wl / 2, rot); }
      const gx = x + fx * (d / 2 + wl + 0.15), gz = z + fz * (d / 2 + wl + 0.15); for (const s of [-1, 1]) { const sx = gx + ux * s * (w / 4 + 0.9), sz = gz + uz * s * (w / 4 + 0.9); BT.wall.add(MX(sx, y, sz, rot, w / 2 - 3.6, 1.7, 0.3), br); addBox(sx, sz, w / 4 - 1.8, 0.15, rot); }
      BT.roof.add(MX(gx, y + 2.6, gz, rot, 3.4, 0.9, 1.2), tl); for (const s of [-1, 1]) BT.wall.add(MX(gx + ux * s * 1.4, y, gz + uz * s * 1.4, rot, 0.4, 2.6, 0.4), br); BT.cbox.add(MX(gx, y + 0.02, gz - fz * 0, rot, w - 3.4, 0.04, wl * 0.9 * 0 + 0.01), COL.plaza); } }
}
const shopList = [];
function shophouse(x, z, rot, w, d, floors, style) {
  const y = minGround(x, z, w, d, rot) - 0.2, fx = Math.sin(rot), fz = Math.cos(rot), ux = Math.cos(rot), uz = -Math.sin(rot);
  if (style === 'old') {
    BT.arcade.add(MX(x, y, z, rot, w, 7.4, d)); BT.cbox.add(MX(x, y + 7.4, z, rot, w + 0.4, 0.5, d + 0.4), COL.white);
    if (rand() < 0.4) BT.cbox.add(MX(x, y + 7.9, z + 0, rot, w * 0.5, 1.1, 0.4), COL.white);
  } else {
    const hgt = floors * 3.3 + 0.2; BT[floors <= 2 ? 'kshop2' : 'kshop3'].add(MX(x, y, z, rot, w, hgt + 0.25, d), pick(WALL_TINTS));
    BT.cbox.add(MX(x, y + hgt, z, rot, w + 0.3, 0.45, d + 0.3), COL.slab); if (rand() < 0.45) BT.cbox.add(MX(x + fx * (d / 2 - 1.1), y + hgt + 0.1, z + fz * (d / 2 - 1.1), rot, w + 0.4, 0.14, 2.8, 0.42), pick(TILES));
    BT.cbox.add(MX(x + fx * (d / 2 + 0.9), y + 3.2, z + fz * (d / 2 + 0.9), rot, w - 0.4, 0.14, 1.8), pick(AWN));
    if (rand() < 0.55) BT.tank.add(MX(x + rr(-2, 2) * ux, y + hgt + 0.45, z + rr(-2, 2) * uz, 0, 0.7, 1.5, 0.7));
  }
  if (rand() < 0.62) { const k = Math.floor(rand() * 10), s = rand() < .5 ? -1 : 1; BT['sign' + k].add(MX(x + fx * (d / 2 + 0.75) + ux * s * (w / 2 - 0.4), y + 5.6, z + fz * (d / 2 + 0.75) + uz * s * (w / 2 - 0.4), rot + Math.PI / 2, 1.05, 4.2, 1)); BT['sign' + k].add(MX(x + fx * (d / 2 + 0.75) + ux * s * (w / 2 - 0.4), y + 5.6, z + fz * (d / 2 + 0.75) + uz * s * (w / 2 - 0.4), rot - Math.PI / 2, 1.05, 4.2, 1)); }
  BT.cbox.add(MX(x + fx * (d / 2 + 1.7), y + 0.05, z + fz * (d / 2 + 1.7), rot, w + 0.4, 0.22, 3.4), COL.plaza);
  addBox(x, z, w / 2, d / 2, rot); shopList.push({ x, z, rot, w, d, y, style });
}
/* 建築不可壓到馬路：腳印（含邊距）碰到路面就往外找最近的空位 */
function footClear(x, z, rot, w, d, m = 1.5) { const c = Math.cos(rot), s = Math.sin(rot), nx = Math.max(2, Math.ceil(w / 5)), nz = Math.max(2, Math.ceil(d / 5)); for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) { const lx = (i / nx - 0.5) * w, lz = (j / nz - 0.5) * d, n = nearestRoad(x + lx * c + lz * s, z - lx * s + lz * c, 24); if (n && !n.e.bridge && !n.e.tunnel && n.dist < n.e.hw + m) return false; } return true; }
function roadFit(x, z, rot, w, d) { if (footClear(x, z, rot, w, d)) return { x, z }; const br = Math.hypot(w, d) * 0.5; for (let R = 6; R <= 96; R += 6) for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283 + R, cx = x + Math.cos(a) * R, cz = z + Math.sin(a) * R; if (footClear(cx, cz, rot, w, d) && boxFree(cx, cz, br * 0.85) && !(typeof inLake === 'function' && inLake(cx, cz)) && groundAt(cx, cz) > 0.6) return { x: cx, z: cz, moved: true }; } return { x, z }; }
function nquBlock(x, z, rot, w, d, floors, key) { const q = roadFit(x, z, rot, w, d); x = q.x; z = q.z; const top = block(x, z, rot, w, d, floors, COL.white, BT[key] ? key : key.replace('nqu', 'fac')), y = top - floors * 3.4;
  BT.cbox.add(MX(x, y, z, rot, w + 0.5, 3.3, d + 0.5), new THREE.Color('#8f9296')); BT.roof.add(MX(x, top + 0.5, z, rot, w + 2.5, 3.0, d + 4), new THREE.Color('#6f7378')); BT.ridge.add(MX(x, top + 3.4, z, rot, w + 4, 2.2, 1.4)); return { x, z, y: y + 0.2, top }; }
function block(x, z, rot, w, d, floors, tint, key = 'fac84') { { const q = roadFit(x, z, rot, w, d); x = q.x; z = q.z; } const y = minGround(x, z, w, d, rot) - 0.2, hgt = floors * 3.4; BT[key].add(MX(x, y, z, rot, w, hgt, d), tint); BT.cbox.add(MX(x, y + hgt, z, rot, w + 0.5, 0.6, d + 0.5), COL.slab); addBox(x, z, w / 2, d / 2, rot); return y + hgt; }
const ylTex = ['#3f7f9e', '#4f8a5d', '#b5533a'].map(c => canvasTex(256, 128, g => { g.fillStyle = '#f1e6cc'; g.fillRect(0, 0, 256, 128); for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const x0 = k * 64 + 10, y0 = r * 64 + 14; g.fillStyle = '#e2d3ae'; g.fillRect(x0 - 4, y0 - 2, 52, 50); g.fillStyle = c; g.beginPath(); g.moveTo(x0, y0 + 46); g.lineTo(x0, y0 + 18); g.arc(x0 + 22, y0 + 18, 22, Math.PI, 0); g.lineTo(x0 + 44, y0 + 46); g.fill(); g.fillStyle = '#2b3a44'; g.fillRect(x0 + 8, y0 + 18, 28, 28); g.fillStyle = '#efe6d6'; g.fillRect(x0 + 21, y0 + 14, 2, 32); } g.fillStyle = c; g.fillRect(0, 60, 256, 6); }, true));
function yanglou(x, z, rot, w, d) {
  const y = minGround(x, z, w, d, rot) - 0.15, fx = Math.sin(rot), fz = Math.cos(rot), ux = Math.cos(rot), uz = -Math.sin(rot);
  { const t = pick(ylTex).clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(w / 9)), 1); const pl = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, 7.4), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 })); pl.position.set(x + fx * (d / 2 + 0.03), y + 3.8, z + fz * (d / 2 + 0.03)); pl.rotation.y = rot; pl.receiveShadow = true; scene.add(pl); }
  BT.cbox.add(MX(x, y, z, rot, w, 7.6, d), COL.cream); BT.cbox.add(MX(x, y + 7.6, z, rot, w + 0.6, 0.5, d + 0.6), COL.white); BT.cbox.add(MX(x + fx * (d / 2 + 1.2), y + 3.7, z + fz * (d / 2 + 1.2), rot, w, 0.3, 2.4), COL.white);
  BT.cbox.add(MX(x + fx * (d / 2 + 1.2), y + 7.3, z + fz * (d / 2 + 1.2), rot, w + 0.4, 0.4, 2.6), COL.white); BT.roof.add(MX(x + fx * (d / 2 + 1.2), y + 7.7, z + fz * (d / 2 + 1.2), rot, w * 0.34, 1.8, 0.5), COL.cream);
  const n = Math.max(3, Math.round(w / 3.2)); for (let i = 0; i <= n; i++) { const o = (i / n - 0.5) * (w - 0.6); BT.ccyl.add(MX(x + fx * (d / 2 + 2.2) + ux * o, y, z + fz * (d / 2 + 2.2) + uz * o, 0, 0.24, 7.3, 0.24), COL.white); }
  for (let i = 0; i < n; i++) { const o = ((i + .5) / n - 0.5) * (w - 0.6); for (const yy of [0.9, 4.6]) BT.cbox.add(MX(x + fx * (d / 2 + 0.03) + ux * o, y + yy, z + fz * (d / 2 + 0.03) + uz * o, rot, 1.2, 2.1, 0.1), COL.glass); }
  addBox(x, z, w / 2, d / 2 + 1.2, rot);
}
function tree(x, z, kind = 0, s = 1) {
  if (inLake(x, z, 1)) return;
  if (natTree(x, z, kind, s)) return;
  const y = groundAt(x, z) - 0.1; addBox(x, z, 0.32 * s, 0.32 * s, 0);
  if (kind === 1) { const h = rr(8, 12) * s, w = rr(1.5, 2.1) * s; regTree(x, z, w * 0.75 + 0.6, y + h * 1.05, [BT.trunk.add(MX(x, y, z, 0, 0.8, h * 0.4, 0.8)), BT.pine.add(MX(x, y + h * 0.22, z, rr(0, 6), w, h * 0.82, w), pick(PINE))]); }
  else { const h = rr(2.6, 3.8) * s, r = rr(2.6, 3.8) * s; regTree(x, z, r * 0.62 + 0.6, y + h + r * 1.4, [BT.trunk.add(MX(x, y, z, 0, 1.2, h, 1.2)), BT.leaf.add(MX(x, y + h + r * 0.5, z, rr(0, 6), r, r * 0.78, r), pick(LEAF)), BT.leaf.add(MX(x + rr(-1.4, 1.4), y + h + r * 0.95, z + rr(-1.4, 1.4), rr(0, 6), r * 0.68, r * 0.6, r * 0.68), pick(LEAF))]); }
}
function stele(x, z, rot, text, h = 4, color = '#b3261e') { const y = groundAt(x, z) - 0.2; BT.cbox.add(MX(x, y, z, rot, 1.9, h + 0.6, 1.0), COL.stone); const s = signMesh(text, h * 0.86, { vertical: true, color, size: 96 }); s.position.set(x + Math.sin(rot) * 0.53, y + 0.4 + h / 2, z + Math.cos(rot) * 0.53); s.rotation.y = rot; scene.add(s); addBox(x, z, 1, 0.6, rot); }
/* OpenStreetMap 自然村（hamlet）：在真實位置補上閩南厝聚落，房子數量依 OSM 建物密度 */
const VCENTERS = [], VNAMES = [];
function osmVillages() {
  if (typeof OSM_PLACES === 'undefined' || !USE_OSM) return;
  for (const [nm, x0, z0, nb] of OSM_PLACES) {
    if (sdAt(x0, z0) < 30 || TOWNS.some(t => Math.hypot(t.x - x0, t.z - z0) < t.r * 0.9)) continue;
    const old = VCENTERS.some(c => Math.hypot(c.x - x0, c.z - z0) < 75); VNAMES.push({ nm, x: x0, z: z0 }); if (old) continue;
    const want = clamp(3 + Math.round(nb / 25), 3, 8), rot = rr(-0.25, 0.25); let got = 0;
    for (let ring = 0; ring < 6 && got < want; ring++) { const n = ring ? ring * 6 : 1; for (let k = 0; k < n && got < want; k++) { const a = k / n * 6.283 + ring * 0.7, x = x0 + Math.cos(a) * ring * 14, z = z0 + Math.sin(a) * ring * 13; if (sdAt(x, z) < 26 || groundAt(x, z) < 1.2 || inLake(x, z, 7) || !roadClear(x, z, 7) || !boxFree(x, z, 6.6)) continue; minnanHouse(x, z, rot + (rand() < 0.2 ? Math.PI / 2 : 0), rr(9.5, 12), rr(7.5, 8.5)); got++; } }
    for (let i = 0; i < 3; i++) { const a = rr(0, 6.28), d = rr(30, 50), x = x0 + Math.cos(a) * d, z = z0 + Math.sin(a) * d; if (sdAt(x, z) > 20 && roadClear(x, z, 4) && boxFree(x, z, 4)) tree(x, z, 0, 1.2); }
  }
}
function village(kx, ky, cols, rows, rot) {
  const cx = kx * KM, cz = -ky * KM, c = Math.cos(rot), s = Math.sin(rot);
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const lx = (q - (cols - 1) / 2) * 13.5 + rr(-0.6, 0.6), lz = (r - (rows - 1) / 2) * 12.5; const x = cx + lx * c + lz * s, z = cz - lx * s + lz * c; if (sdAt(x, z) < 26 || groundAt(x, z) < 1.2 || inLake(x, z, 7) || !roadClear(x, z, 7) || !boxFree(x, z, 6.6)) continue; minnanHouse(x, z, rot, rr(10, 12), rr(7.5, 8.5)); }
  for (let i = 0; i < 5; i++) { const a = rr(0, 6.28), d = Math.max(cols, rows) * 9 + rr(4, 16), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (sdAt(x, z) > 20 && roadClear(x, z, 4) && boxFree(x, z, 4)) tree(x, z, 0, 1.2); }
}
const LT = {};
function lineTown(e) {
  const next = { '-1': 0, '1': 0 }; const old = e.name === '模範街' || e.name === '沙美老街' || e.name === '莒光路';
  e.pts.forEach((p, i) => {
    if (p.town < 0) return; const t = TOWNS[p.town]; if (t.style !== 'city' && t.style !== 'old') return; const dist = i * e.step;
    if (dist < e.hw + 9 || dist > e.len - e.hw - 9) return;
    for (const s of [-1, 1]) {
      if (dist < next[s]) continue; const style = (old || t.style === 'old') ? 'old' : 'city'; const w = style === 'old' ? rr(8, 10) : rr(7, 10), d = style === 'old' ? 10 : rr(11, 13), rx = -p.tz * s, rz = p.tx * s;
      const x = p.x + rx * (e.hw + 3.6 + d / 2), z = p.z + rz * (e.hw + 3.6 + d / 2);
      { const why = sdAt(x, z) < 30 ? 'sea' : groundAt(x, z) < 1 ? 'low' : inLake(x, z, d / 2) ? 'lake' : !roadClear(x, z, d / 2 + 1.5, e) ? 'road' : !boxFree(x, z, w * 0.5) ? 'box' : null; LT[why || 'ok'] = (LT[why || 'ok'] || 0) + 1; if (why) { next[s] = dist + 3; continue; } }
      { const st2 = style === 'old' || rand() < 0.5 ? 'old' : 'city'; shophouse(x, z, Math.atan2(-rx, -rz), w, d, st2 === 'old' ? 2 : (rand() < 0.35 ? 3 : 2), st2); } next[s] = dist + w + 0.4;
    }
  });
}

/* =====================================================================
   地標（座標為實際經緯度）
   ===================================================================== */
const lions = [], PARKED = [], missionSpots = {}, PICKUPS0 = [], BOATS0 = [], PLANES0 = [];
const LIONS_LL = [[24.4469, 118.3240], [24.45683, 118.37405], [24.43838, 118.36764], [24.46345, 118.38588], [24.47439, 118.40605], [24.41251, 118.31914], [24.43623, 118.41315], [24.4313, 118.33153], [24.50324, 118.40871], [24.40417, 118.30961], [24.46535, 118.32719], [24.44189, 118.41382], [24.4326, 118.2452], [24.5036, 118.4412]];
function spot(lat, lon, r, maxRing = 16, front = 0) {
  const w = GW(lat, lon);
  for (let ring = 0; ring < maxRing; ring++) { const n = ring ? 8 + ring * 2 : 1; for (let k = 0; k < n; k++) { const a = k / n * 6.283 + ring, x = w.x + Math.cos(a) * ring * 5, z = w.z + Math.sin(a) * ring * 5; if (sdAt(x, z) < r + 12 || groundAt(x, z) < 1 || inLake(x, z, r + 1)) continue; if (!roadClear(x, z, r + 1.5) || !boxFree(x, z, r)) continue; const nr = nearestRoad(x, z, 200), rot = nr ? Math.atan2(nr.p.x - x, nr.p.z - z) : 0; if (front && !boxFree(x + Math.sin(rot) * front, z + Math.cos(rot) * front, 1.2)) continue; return { x, z, rot }; } }
  return null;
}
let lionGeo = null;
function windLion(lat, lon) {
  if (!lionGeo) { const T = (x, y, z, sx = 1, sy = 1, sz = 1, rx = 0) => new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), new V3(sx, sy, sz)); const st = '#bdb6a6', st2 = '#a8a092';
    lionGeo = mergeGeos([[new THREE.BoxGeometry(1.7, 0.9, 1.7), '#9d998f', T(0, 0.45, 0)], [new THREE.CapsuleGeometry(0.55, 0.8, 4, 12), st, T(0, 1.9, 0)], [new THREE.SphereGeometry(0.62, 16, 12), st, T(0, 3.0, 0.1)], [new THREE.TorusGeometry(0.6, 0.17, 8, 18), st2, T(0, 3.0, -0.05)],
      [new THREE.ConeGeometry(0.16, 0.3, 6), st2, T(-0.38, 3.58, 0)], [new THREE.ConeGeometry(0.16, 0.3, 6), st2, T(0.38, 3.58, 0)], [new THREE.SphereGeometry(0.09, 8, 6), '#1c1a18', T(-0.23, 3.14, 0.64)], [new THREE.SphereGeometry(0.09, 8, 6), '#1c1a18', T(0.23, 3.14, 0.64)],
      [new THREE.SphereGeometry(0.11, 8, 6), '#8a8478', T(0, 3.0, 0.72)], [new THREE.BoxGeometry(0.52, 0.17, 0.12), '#a8231c', T(0, 2.8, 0.66)], [new THREE.BoxGeometry(0.4, 0.06, 0.13), '#f2ede2', T(0, 2.86, 0.67)],
      [new THREE.CapsuleGeometry(0.14, 0.5, 3, 8), st, T(-0.3, 1.55, 0.5, 1, 1, 1, -0.5)], [new THREE.CapsuleGeometry(0.14, 0.5, 3, 8), st, T(0.3, 1.55, 0.5, 1, 1, 1, -0.5)],
      [new THREE.CylinderGeometry(0.66, 0.95, 1.7, 14, 1, true, Math.PI / 2, Math.PI), '#c2261c', T(0, 1.85, 0)]]); }
  const s = spot(lat, lon, 2, 10); if (!s) return; const x = s.x, z = s.z, y = groundAt(x, z) - 0.1; const m = new THREE.Mesh(lionGeo, mVC2); m.position.set(x, y, z); m.scale.setScalar(1.35); m.castShadow = true; m.rotation.y = s.rot; scene.add(m); addBox(x, z, 1.2, 1.2, 0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 8, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd35a, transparent: true, opacity: 0.85 })); ring.position.set(x, y + 0.5, z); scene.add(ring);
  lions.push({ x, z, mesh: m, ring, found: false });
}
function addSign(text, h, x, y, z, rot, opts) { const sm = signMesh(text, h, opts); sm.position.set(x, y, z); sm.rotation.y = rot; scene.add(sm); return sm; }

function buildNQU() {
  const A = roadNodes.UNI, A1 = roadNodes.A1, L = Math.hypot(A1.x - A.x, A1.z - A.z), f = { x: (A1.x - A.x) / L, z: (A1.z - A.z) / L }, r = { x: -f.z, z: f.x }, yawF = Math.atan2(f.x, f.z);
  const at = (a, b) => ({ x: A1.x + f.x * a + r.x * b, z: A1.z + f.z * a + r.z * b });
  const g = { x: A.x + f.x * 26, z: A.z + f.z * 26 }, gy = groundAt(g.x, g.z);
  for (const s of [-1, 1]) { const px = g.x + r.x * s * 5.6, pz = g.z + r.z * s * 5.6; BT.wall.add(MX(px, gy - 0.2, pz, yawF, 1.8, 7.4, 1.8)); BT.cbox.add(MX(px, gy + 7.2, pz, yawF, 2.2, 0.4, 2.2), COL.white); addBox(px, pz, 0.9, 0.9, yawF); }
  BT.cbox.add(MX(g.x, gy + 5.6, g.z, yawF, 13.2, 1.5, 1.2), new THREE.Color('#7c2f25'));
  for (const s of [-1, 1]) addSign('國立金門大學', 1.15, g.x - f.x * 0.62 * s, gy + 6.35, g.z - f.z * 0.62 * s, yawF + (s > 0 ? Math.PI : 0), { color: '#f6ecc9', size: 96 });
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(24, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: COL.plaza, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); plaza.position.set(A1.x, groundAt(A1.x, A1.z) + 0.12, A1.z); plaza.receiveShadow = true; scene.add(plaza);
  const beige = new THREE.Color('#ecdfc6'), red = new THREE.Color('#e3b7a3'), wh = new THREE.Color('#e9e6de');
  // 依實景重建：紅磚牆、灰石基座、閩式灰瓦屋頂；綜合大樓有白柱門廊與大階梯，另有鐘樓與旗桿
  const rotM = yawF + Math.PI; let p = at(56, 0); p = roadFit(p.x, p.z, rotM, 66, 16); const M = nquBlock(p.x, p.z, rotM, 66, 16, 5, 'nqu86');
  { const gy0 = M.y, n = { x: -f.x, z: -f.z }, gc = new THREE.Color('#6f7378'), st = new THREE.Color('#cfc9bb');
    BT.roof.add(MX(M.x, M.top + 2.0, M.z, rotM, 26, 3.6, 21), gc); BT.ridge.add(MX(M.x, M.top + 5.4, M.z, rotM, 28, 2.4, 1.6));
    const c = { x: M.x + n.x * 12, z: M.z + n.z * 12 }; BT.roof.add(MX(c.x, gy0 + 7.4, c.z, rotM, 22, 2.4, 9.5), gc); BT.cbox.add(MX(c.x, gy0 + 6.8, c.z, rotM, 21, 0.6, 8.5), COL.white);
    for (const o of [-8.5, -3, 3, 8.5]) BT.ccyl.add(MX(c.x + r.x * o + n.x * 3.6, gy0, c.z + r.z * o + n.z * 3.6, 0, 0.5, 6.8, 0.5), COL.white);
    addSign('國立金門大學', 1.0, M.x + n.x * 16.4, gy0 + 6.0, M.z + n.z * 16.4, yawF + Math.PI, { color: '#f1d27a', bg: '#22262b', size: 96, pad: 12 }); addSign('綜合大樓', 1.3, M.x + n.x * 8.3, gy0 + 11.5, M.z + n.z * 8.3, yawF + Math.PI, { color: '#f6ecc9', size: 96 });
    for (let i = 0; i < 6; i++) { const d = 17.6 + i * 2.2, h = 1.5 - i * 0.25, sx = M.x + n.x * d, sz = M.z + n.z * d; BT.cbox.add(MX(sx, gy0 - 0.6, sz, rotM, 24, h + 0.6, 2.2), st); addDeck(sx, sz, 12, 1.1, rotM, gy0 + h); }
    addDeck(c.x, c.z, 11, 4.6, rotM, gy0 + 1.5); BT.cbox.add(MX(c.x, gy0 - 0.6, c.z, rotM, 24, 2.1, 9.2), st); }
  p = at(6, -50); nquBlock(p.x, p.z, Math.atan2(r.x, r.z), 46, 15, 4, 'nqu84'); p = at(6, 50); nquBlock(p.x, p.z, Math.atan2(-r.x, -r.z), 46, 15, 4, 'nqu84');
  p = at(-26, 62); nquBlock(p.x, p.z, Math.atan2(-r.x, -r.z), 30, 20, 3, 'nqu84'); p = at(104, -38); nquBlock(p.x, p.z, rotM, 42, 14, 6, 'nqu86'); p = at(104, 22); nquBlock(p.x, p.z, rotM, 42, 14, 6, 'nqu86');
  { let t = at(40, -42); t = roadFit(t.x, t.z, yawF, 8, 8); if (boxFree(t.x, t.z, 5)) { const ty = groundAt(t.x, t.z) - 0.2; BT.cbox.add(MX(t.x, ty, t.z, yawF, 7, 4, 7), new THREE.Color('#8f9296')); BT.wall.add(MX(t.x, ty + 4, t.z, yawF, 6, 20, 6)); BT.cbox.add(MX(t.x, ty + 24, t.z, yawF, 7.6, 3.4, 7.6), COL.white); BT.hip.add(MX(t.x, ty + 27.4, t.z, yawF, 7.4, 3.2, 7.4), new THREE.Color('#6f7378')); addBox(t.x, t.z, 3.5, 3.5, yawF); } } // 鐘樓
  for (const [o, col] of [[-2.2, '#e8662a'], [0, '#c8202c'], [2.2, '#e8662a']]) { const q = { x: g.x + f.x * 14 + r.x * (16 + o), z: g.z + f.z * 14 + r.z * (16 + o) }, qy = groundAt(q.x, q.z); BT.ccyl.add(MX(q.x, qy, q.z, 0, 0.14, o ? 13 : 15, 0.14), COL.white); BT.cbox.add(MX(q.x + r.x * 0.9, qy + (o ? 11.6 : 13.6), q.z + r.z * 0.9, yawF + Math.PI / 2, 1.8, 1.2, 0.06), new THREE.Color(col)); } // 三支旗桿
  nquPond(); nquExtras(g, f, r, yawF);
  // 學生宿舍（可進入＝安全屋）
  p = at(-30, -54); missionSpots.dormAt = { x: p.x, z: p.z, rot: Math.atan2(r.x, r.z) };
  const tc = at(45, 100), ty = groundAt(tc.x, tc.z); const stad = (hl, hw) => { const s = new THREE.Shape(); s.moveTo(-hl, -hw); s.lineTo(hl, -hw); s.absarc(hl, 0, hw, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-hl, hw); s.absarc(-hl, 0, hw, Math.PI / 2, Math.PI * 1.5, false); return new THREE.ShapeGeometry(s, 20).rotateX(-Math.PI / 2); };
  const po = (c, o) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: o, polygonOffsetUnits: o });
  const tr = new THREE.Mesh(stad(26, 20), po(COL.track, -4)); tr.position.set(tc.x, ty + 0.1, tc.z); tr.rotation.y = yawF; tr.receiveShadow = true; scene.add(tr);
  const tf = new THREE.Mesh(stad(26, 13.5), po(COL.turf, -7)); tf.position.set(tc.x, ty + 0.14, tc.z); tf.rotation.y = yawF; tf.receiveShadow = true; scene.add(tf);
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, q = { x: A1.x + Math.cos(a) * 31, z: A1.z + Math.sin(a) * 31 }; if (roadClear(q.x, q.z, 3) && boxFree(q.x, q.z, 3)) tree(q.x, q.z, 0, 0.9); }
  PARKED.push(['scooter', g.x + f.x * 6 + r.x * 8, g.z + f.z * 6 + r.z * 8, yawF + Math.PI], ['scooter', g.x + f.x * 8.2 + r.x * 8, g.z + f.z * 8.2 + r.z * 8, yawF + Math.PI], ['sedan', g.x + f.x * 16 + r.x * 9, g.z + f.z * 16 + r.z * 9, yawF + Math.PI], ['scooter', g.x + f.x * 4 - r.x * 8, g.z + f.z * 4 - r.z * 8, yawF + Math.PI]);
  missionSpots.start = { x: g.x + f.x * 3.2 + r.x * 6.0, z: g.z + f.z * 3.2 + r.z * 6.0, yaw: yawF + Math.PI };
  missionSpots.race = { x: A.x + f.x * 4 - r.x * 8, z: A.z + f.z * 4 - r.z * 8 };
}
function buildJuguang() {
  const w0 = GW(24.42491, 118.31902), w = roadFit(w0.x, w0.z, 0, 42, 42), x = w.x, z = w.z, C = roadNodes.JG, rot = Math.atan2(C.x - x, C.z - z), y = groundAt(x, z) - 0.2, fx = Math.sin(rot), fz = Math.cos(rot), ux = Math.cos(rot), uz = -Math.sin(rot);
  BT.cbox.add(MX(x, y, z, rot, 36, 2.6, 28), COL.stone); BT.cbox.add(MX(x + fx * 15.5, y, z + fz * 15.5, rot, 11, 1.3, 5), COL.stone); BT.cbox.add(MX(x + fx * 17.5, y, z + fz * 17.5, rot, 11, 0.6, 4), COL.stone);
  const tier = (w, d, h, y0, roofH) => { BT.cbox.add(MX(x, y0, z, rot, w, h, d), COL.white); for (const sz of [-1, 1]) for (let i = 0; i <= 4; i++) { const o = (i / 4 - 0.5) * (w + 1.6); BT.ccyl.add(MX(x + ux * o + fx * sz * (d / 2 + 0.9), y0, z + uz * o + fz * sz * (d / 2 + 0.9), 0, 0.3, h, 0.3), COL.red); }
    BT.hip.add(MX(x, y0 + h, z, rot, (w + 6) / 1.414, roofH, (d + 6) / 1.414), COL.green); BT.cbox.add(MX(x, y0 + h - 0.35, z, rot, w + 3.4, 0.35, d + 3.4), COL.red); return y0 + h + roofH * 0.62; };
  let yy = tier(22, 14, 6, y + 2.6, 2.6); yy = tier(16, 10, 4.6, yy, 2.3); yy = tier(10.5, 7, 4.2, yy, 3.4); BT.cbox.add(MX(x, yy + 0.9, z, rot, 4.2, 0.5, 0.5), COL.gold);
  addSign('莒光樓', 1.5, x + fx * 3.62, yy - 3.4, z + fz * 3.62, rot, { color: '#f1d27a', bg: '#1d3a63', size: 96 });
  if (typeof USE_OSM !== 'undefined' && USE_OSM) { // 平台可以走上去繞樓一圈；只有主樓本身擋人
    addDeck(x + fx * 17.5, z + fz * 17.5, 5.5, 2.0, rot, y + 0.6); addDeck(x + fx * 15.5, z + fz * 15.5, 5.5, 2.5, rot, y + 1.3); addDeck(x, z, 18, 14, rot, y + 2.6); addBox(x, z, 11.9, 7.9, rot);
    const H = { name: '莒光樓', i: 0, seen: false, lines: [
      '莒光樓建於 1952 年，用來紀念在金門戰役中犧牲的將士，名字取自「毋忘在莒」的典故。',
      '三層宮殿式的造型，綠色琉璃瓦配紅柱，是金門最有代表性的地標，以前還常常出現在郵票上。',
      '它蓋在金城鎮南邊的小丘上，從這裡往南看就是金門的南海岸。',
      '樓內現在是展覽館，介紹金門的戰地歷史和人文風情。'] };
    const g = { x: x + fx * 20, z: z + fz * 20 }; addAction({ x: g.x, z: g.z, r: 3.2, inside: null, label: () => '🗣 莒光樓介紹', fn: () => heritageTalk(H) });
  } else addBox(x, z, 18, 14, rot);
  stele(x + fx * 26 + ux * 12, z + fz * 26 + uz * 12, rot, '莒光樓', 3.6);
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, q = { x: x + Math.cos(a) * 34, z: z + Math.sin(a) * 30 }; if (roadClear(q.x, q.z, 4) && boxFree(q.x, q.z, 4) && sdAt(q.x, q.z) > 20) tree(q.x, q.z, 0, 1.1); }
}
function buildWinery() {
  const w = GW(24.4336, 118.3436), x = w.x, z = w.z, H = roadNodes.WF, rot = Math.atan2(H.x - x, H.z - z), fx = Math.sin(rot), fz = Math.cos(rot), ux = Math.cos(rot), uz = -Math.sin(rot);
  const shed = (ox, oz, w, d) => { const sx = x + ux * ox + fx * oz, sz = z + uz * ox + fz * oz, y = minGround(sx, sz, w, d, rot) - 0.2; BT.cbox.add(MX(sx, y, sz, rot, w, 8, d), COL.white); BT.roof.add(MX(sx, y + 8, sz, rot, w + 0.8, 3, d + 1), new THREE.Color('#8fa1ab')); BT.cbox.add(MX(sx + fx * (d / 2 + 0.03), y, sz + fz * (d / 2 + 0.03), rot, 6, 5, 0.1), COL.blue); addBox(sx, sz, w / 2, d / 2, rot); };
  shed(-26, -22, 30, 18); shed(10, -26, 30, 18); shed(-8, -50, 44, 16);
  const bx = x + fx * 2 + ux * 24, bz = z + fz * 2 + uz * 24, by = groundAt(bx, bz) - 0.1;
  const prof = [[0, 0], [1.9, 0], [1.95, 6.4], [1.75, 7.6], [0.72, 9.4], [0.62, 11.5], [0.82, 11.6], [0.82, 12.3], [0, 12.3]].map(p => new THREE.Vector2(p[0], p[1]));
  const bottle = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), mat('#f4f0e6', 0.25)); bottle.position.set(bx, by + 0.8, bz); bottle.castShadow = true; scene.add(bottle); BT.ccyl.add(MX(bx, by, bz, 0, 2.6, 0.8, 2.6), COL.stone); addBox(bx, bz, 2.4, 2.4, 0);
  const lt = textTex('金門高粱酒', { vertical: true, color: '#f6e3a1', bg: '#b3261e', size: 96, pad: 22 }); const label = new THREE.Mesh(new THREE.CylinderGeometry(1.99, 1.99, 4.6, 20, 1, true, -0.55, 1.1), new THREE.MeshStandardMaterial({ map: lt.tex, roughness: 0.5 })); label.position.set(bx, by + 4.2, bz); label.rotation.y = rot; scene.add(label);
  stele(x + fx * 4 - ux * 4, z + fz * 4 - uz * 4, rot, '金門酒廠', 4); wineryAt = { x: x + fx * 7 - ux * 4, z: z + fz * 7 - uz * 4 };
  PARKED.push(['van', x - fx * 4 - ux * 22, z - fz * 4 - uz * 22, rot + Math.PI / 2], ['sedan', x - fx * 4 - ux * 30, z - fz * 4 - uz * 30, rot + Math.PI / 2]);
  missionSpots.deliver = { x: x + fx * 6 + ux * 8, z: z + fz * 6 + uz * 8 };
}
function buildAirport() {
  const R = RUNWAY, y = R.y, th = R.rot; const rt = canvasTex(1024, 96, (g, w, h) => { g.fillStyle = '#3f4146'; g.fillRect(0, 0, w, h); g.fillStyle = '#ecebe4'; for (let x = 90; x < w - 90; x += 46) g.fillRect(x, h / 2 - 2, 26, 4); for (const x0 of [14, w - 60]) for (let i = 0; i < 8; i++) g.fillRect(x0, 10 + i * 10, 46, 5); g.fillRect(0, 3, w, 2); g.fillRect(0, h - 5, w, 2); });
  const pm = (c, map) => new THREE.MeshStandardMaterial({ color: c, map: map || null, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const rw = new THREE.Mesh(new THREE.PlaneGeometry(R.len, R.wid).rotateX(-Math.PI / 2), pm(0xffffff, rt)); rw.position.set(R.x, y + 0.12, R.z); rw.rotation.y = th; rw.receiveShadow = true; scene.add(rw);
  let p = APW(10, 36); const ap = new THREE.Mesh(new THREE.PlaneGeometry(200, 40).rotateX(-Math.PI / 2), pm(0x5a5c60)); ap.position.set(p.x, y + 0.1, p.z); ap.rotation.y = th; ap.receiveShadow = true; scene.add(ap);
  const t = APW(0, 68); BT.cbox.add(MX(t.x, y - 0.2, t.z, th, 66, 10, 18), COL.white); for (const s of [-1, 1]) { const q = APW(0, 68 + s * 9.05); BT.cbox.add(MX(q.x, y + 1.2, q.z, th, 60, 6.5, 0.2), COL.glass); } BT.cbox.add(MX(t.x, y + 9.8, t.z, th, 70, 0.7, 22), COL.slab); addBox(t.x, t.z, 33, 9, th);
  p = APW(0, 77.3); addSign('金門尚義機場', 2.2, p.x, y + 12, p.z, th + Math.PI, { color: '#1d3a63', size: 96 }); p = APW(0, 58.7); addSign('金門尚義機場', 2.2, p.x, y + 12, p.z, th, { color: '#1d3a63', size: 96 });
  p = APW(-52, 64); BT.ccyl.add(MX(p.x, y, p.z, 0, 2.2, 22, 2.2), COL.white); BT.ccyl.add(MX(p.x, y + 22, p.z, 0, 3.6, 3.4, 3.6), COL.glass); BT.ccyl.add(MX(p.x, y + 25.4, p.z, 0, 3.9, 0.5, 3.9), COL.slab); addBox(p.x, p.z, 2.4, 2.4, 0);
  p = APW(70, 38); const T = (x, yy, z, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new V3(x, yy, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new V3(1, 1, 1));
  const plane = new THREE.Mesh(mergeGeos([[new THREE.CapsuleGeometry(1.9, 22, 6, 16), '#f3f4f5', T(0, 3.6, 0, 0, 0, Math.PI / 2)], [new THREE.BoxGeometry(5, 0.35, 26), '#e8eaec', T(-1, 3.2, 0)], [new THREE.BoxGeometry(2.6, 0.25, 9), '#e8eaec', T(-11.4, 4.2, 0)], [new THREE.BoxGeometry(3.6, 5, 0.3), '#2f6fb5', T(-11.2, 6.6, 0, 0, 0, -0.35)],
    [new THREE.CylinderGeometry(0.8, 0.8, 3, 12), '#9aa2a8', T(0.4, 2.4, 6, 0, 0, Math.PI / 2)], [new THREE.CylinderGeometry(0.8, 0.8, 3, 12), '#9aa2a8', T(0.4, 2.4, -6, 0, 0, Math.PI / 2)], [new THREE.BoxGeometry(18, 0.5, 3.82), '#2f6fb5', T(0, 3.2, 0)],
    [new THREE.CylinderGeometry(0.25, 0.25, 2, 6), '#555', T(8, 1, 0)], [new THREE.CylinderGeometry(0.25, 0.25, 2, 6), '#555', T(-2, 1, 2.6)], [new THREE.CylinderGeometry(0.25, 0.25, 2, 6), '#555', T(-2, 1, -2.6)]]), mVC);
  plane.position.set(p.x, y + 0.1, p.z); plane.rotation.y = th; plane.castShadow = true; scene.add(plane); addBox(p.x, p.z, 13, 2.2, th); addBox(p.x - R.ux, p.z - R.uz, 2.5, 13, th);
  // 可駕駛的小飛機：停在停機坪，機頭朝跑道方向
  const yawU = Math.atan2(R.ux, R.uz); for (const v of [-7, 7]) { const q = APW(-165, v); PLANES0.push([q.x, q.z, yawU]); }
  missionSpots.fly = APW(-18, 44);
  for (const [k, ty] of [[-14, 'taxi'], [0, 'taxi'], [14, 'sedan'], [30, 'van']]) { const q = APW(k, 84); PARKED.push([ty, q.x, q.z, yawU]); }
}
function buildBridge() {
  const e = bridgeEdge, n = e.pts.length, pos = [], idx = []; const dx = e.b.x - e.a.x, dz = e.b.z - e.a.z, L = Math.hypot(dx, dz), rx = -dz / L, rz = dx / L, yaw = Math.atan2(dx, dz);
  e.pts.forEach((p, i) => { const hw = e.hw + 0.5; pos.push(p.x - rx * hw, p.y + 1.1, p.z - rz * hw, p.x - rx * hw, p.y - 1.8, p.z - rz * hw, p.x + rx * hw, p.y - 1.8, p.z + rz * hw, p.x + rx * hw, p.y + 1.1, p.z + rz * hw); if (i < n - 1) { const a = i * 4; for (let k = 0; k < 3; k++) idx.push(a + k, a + k + 1, a + 4 + k, a + k + 1, a + 5 + k, a + 4 + k); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xd6d3cb, roughness: 0.85, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  for (let i = 8; i < n - 6; i += 9) { const p = e.pts[i]; if (groundAt(p.x, p.z) > 0.5) continue; BT.ccyl.add(MX(p.x, -8, p.z, 0, 1.7, p.y + 6.2, 1.7), COL.concrete); }
  const cable = [];
  for (const t of [0.25, 0.375, 0.5, 0.625, 0.75]) { const p = edgePoint(e, t * e.len); for (const s of [-1, 1]) { const qx = p.x + rx * s * (e.hw + 1.6), qz = p.z + rz * s * (e.hw + 1.6); BT.ccyl.add(MX(qx, -8, qz, 0, 1.0, p.y + 8 + 24, 1.0), COL.white); BT.leaf.add(MX(qx, p.y + 27.5, qz, 0, 1.7, 4.2, 1.7), new THREE.Color('#c76a3a'));
      for (const k of [-3, -2, -1, 1, 2, 3]) { const q = edgePoint(e, clamp(t * e.len + k * 12, 0, e.len)); cable.push(qx, p.y + 23, qz, q.x + rx * s * (e.hw + 0.4), q.y + 1.1, q.z + rz * s * (e.hw + 0.4)); } } }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cable, 3)); scene.add(new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: 0xe8e8e8 })));
  stele(e.a.x - dx / L * 6 + rx * 13, e.a.z - dz / L * 6 + rz * 13, yaw + Math.PI, '金門大橋', 4, '#1d3a63');
}
/* ---------- 通用公共建築 ---------- */
function office(lat, lon, w, d, floors, text, tint = '#e9e6de', signBg = '#1d3a63') {
  const s = spot(lat, lon, Math.max(w, d) / 2 + 1); if (!s) return null; const y = minGround(s.x, s.z, w, d, s.rot) - 0.2, fx = Math.sin(s.rot), fz = Math.cos(s.rot), h = floors * 3.3 + 0.2;
  BT[w > 16 ? 'fac84' : floors <= 3 ? 'fac33' : 'fac34'].add(MX(s.x, y, s.z, s.rot, w, w > 16 ? floors * 3.4 : h, d), new THREE.Color(tint)); BT.cbox.add(MX(s.x, y + (w > 16 ? floors * 3.4 : h), s.z, s.rot, w + 0.4, 0.5, d + 0.4), COL.slab);
  BT.cbox.add(MX(s.x + fx * (d / 2 + 0.04), y, s.z + fz * (d / 2 + 0.04), s.rot, 3, 2.8, 0.1), COL.glass); BT.cbox.add(MX(s.x + fx * (d / 2 + 1), y + 3.1, s.z + fz * (d / 2 + 1), s.rot, 5, 0.2, 2), COL.slab);
  if (text) addSign(text, Math.min(1.4, (w - 1) / [...text].length), s.x + fx * (d / 2 + 2.02), y + 3.9, s.z + fz * (d / 2 + 2.02), s.rot, { color: '#fff', bg: signBg, size: 80, pad: 14 });
  addBox(s.x, s.z, w / 2, d / 2, s.rot); return { x: s.x + fx * (d / 2 + 1.6), z: s.z + fz * (d / 2 + 1.6), rot: s.rot, y, cx: s.x, cz: s.z };
}
function temple(lat, lon, text) {
  const s = spot(lat, lon, 8); if (!s) return; const y = minGround(s.x, s.z, 13, 9, s.rot) - 0.15, fx = Math.sin(s.rot), fz = Math.cos(s.rot), ux = Math.cos(s.rot), uz = -Math.sin(s.rot);
  BT.cbox.add(MX(s.x, y, s.z, s.rot, 14, 0.7, 11), COL.stone); BT.cbox.add(MX(s.x, y + 0.7, s.z, s.rot, 12, 4, 8), new THREE.Color('#c9402f')); BT.roof.add(MX(s.x, y + 4.7, s.z, s.rot, 13.4, 2.6, 10.4), new THREE.Color('#d98a2b')); BT.ridge.add(MX(s.x, y + 6.9, s.z, s.rot, 15.4, 2.2, 1.6));
  for (const o of [-4.5, -1.6, 1.6, 4.5]) BT.ccyl.add(MX(s.x + ux * o + fx * 4.6, y + 0.7, s.z + uz * o + fz * 4.6, 0, 0.26, 4, 0.26), COL.red); BT.cbox.add(MX(s.x + fx * 4.05, y + 0.7, s.z + fz * 4.05, s.rot, 2.2, 3, 0.1), COL.door); BT[BT.tfront2 && hash2(s.x, s.z) > 0.5 ? 'tfront2' : 'tfront'].add(MX(s.x + fx * 4.13, y + 0.7, s.z + fz * 4.13, s.rot, 6.3, 3.2, 1));
  addSign(text, 0.8, s.x + fx * 4.1, y + 4.2, s.z + fz * 4.1, s.rot, { color: '#f1d27a', bg: '#3a2a22', size: 72, pad: 10 }); addBox(s.x, s.z, 6, 4, s.rot);
}
function gasStation(lat, lon) {
  const s = spot(lat, lon, 10); if (!s) return; const y = minGround(s.x, s.z, 16, 10, s.rot), fx = Math.sin(s.rot), fz = Math.cos(s.rot), ux = Math.cos(s.rot), uz = -Math.sin(s.rot);
  BT.cbox.add(MX(s.x, y - 0.3, s.z, s.rot, 20, 0.4, 14), COL.plaza); BT.cbox.add(MX(s.x + fx * 2, y + 5, s.z + fz * 2, s.rot, 16, 0.7, 9), COL.white); BT.cbox.add(MX(s.x + fx * 2, y + 5.1, s.z + fz * 2, s.rot, 16.2, 0.35, 9.2), COL.red);
  for (const a of [-6, 6]) { BT.ccyl.add(MX(s.x + ux * a + fx * 2, y, s.z + uz * a + fz * 2, 0, 0.3, 5, 0.3), COL.white); BT.cbox.add(MX(s.x + ux * a * 0.5 + fx * 2, y, s.z + uz * a * 0.5 + fz * 2, s.rot, 0.9, 1.6, 0.6), COL.red); addBox(s.x + ux * a * 0.5 + fx * 2, s.z + uz * a * 0.5 + fz * 2, 0.6, 0.5, s.rot); }
  BT.cbox.add(MX(s.x - fx * 5, y, s.z - fz * 5, s.rot, 8, 3.4, 4), COL.white); addBox(s.x - fx * 5, s.z - fz * 5, 4, 2, s.rot); addSign('加油站', 1.1, s.x + fx * 6.56, y + 5.4, s.z + fz * 6.56, s.rot, { color: '#fff', bg: '#b3261e', size: 80, pad: 12 });
}
function pier(lat, lon, len, wid, name) {
  // 從指定座標找最近的海岸，往海上蓋一條棧橋
  const w = GW(lat, lon); let best = null, bd = 1e12;
  for (let a = -30; a <= 30; a++) for (let b = -30; b <= 30; b++) { const x = w.x + a * 8, z = w.z + b * 8, sd = sdAt(x, z); if (sd < 4 || sd > 14) continue; const d = a * a + b * b; if (d < bd) { bd = d; best = [x, z]; } }
  if (!best) return null; const [x0, z0] = best; let gx = sdAt(x0 + 14, z0) - sdAt(x0 - 14, z0), gz = sdAt(x0, z0 + 14) - sdAt(x0, z0 - 14); const gl = Math.hypot(gx, gz) || 1; const ox = -gx / gl, oz = -gz / gl; // 朝海
  const yaw = Math.atan2(ox, oz), cx = x0 + ox * (len / 2 - 8), cz = z0 + oz * (len / 2 - 8), Y = 1.7;
  BT.cbox.add(MX(cx, Y - 0.5, cz, yaw, wid, 0.5, len), COL.concrete); addDeck(cx, cz, wid / 2, len / 2, yaw, Y); decks[decks.length - 1].pier = name || true;
  for (let k = 0; k < len; k += 10) for (const s of [-1, 1]) { const px = x0 + ox * (k - 6) - oz * s * (wid / 2 - 0.5), pz = z0 + oz * (k - 6) + ox * s * (wid / 2 - 0.5); BT.ccyl.add(MX(px, -6, pz, 0, 0.5, Y + 5.5, 0.5), COL.slab); BT.ccyl.add(MX(px, Y, pz, 0, 0.16, 0.9, 0.16), COL.rust); }
  const ex = x0 + ox * (len - 12), ez = z0 + oz * (len - 12); const m = MX(ex, Y - 0.1, ez, yaw); BT.lamp.add(m); BT.lampHead.add(m);
  if (name) stele(x0 - ox * 6 - oz * (wid / 2 + 3), z0 - oz * 6 + ox * (wid / 2 + 3), yaw + Math.PI, name, 3.4, '#1d3a63');
  return { x0, z0, ox, oz, yaw, len, wid, side: (k, s, off = 3) => ({ x: x0 + ox * k - oz * s * (wid / 2 + off), z: z0 + oz * k + ox * s * (wid / 2 + off) }) };
}
function buildHarbors() {
  // 水頭碼頭（小三通）
  let p = pier(24.4158, 118.2868, 96, 9, '水頭碼頭');
  if (p) { for (const [k, s] of [[52, 1], [70, -1]]) { const q = p.side(k, s); BOATS0.push([q.x, q.z, p.yaw]); }
    const f = p.side(74, 1, 9), fy = 0.2; const T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
    const ferry = new THREE.Mesh(mergeGeos([[new THREE.BoxGeometry(7, 2.6, 30), '#f2f3f4', T(0, 1.3, 0)], [new THREE.BoxGeometry(7.1, 0.6, 30.1), '#1f5fa8', T(0, 0.5, 0)], [new THREE.BoxGeometry(6, 2.4, 20), '#f2f3f4', T(0, 3.8, -1)], [new THREE.BoxGeometry(6.1, 0.9, 19), '#22313f', T(0, 3.9, -1)], [new THREE.BoxGeometry(4, 1.8, 6), '#f2f3f4', T(0, 5.9, 4)], [new THREE.BoxGeometry(4.1, 0.7, 5.6), '#22313f', T(0, 6.1, 4)], [new THREE.CylinderGeometry(0.5, 0.6, 2.4, 8), '#b3261e', T(0, 6.2, -6)]]), mVC);
    ferry.position.set(f.x + p.ox * 4, fy, f.z + p.oz * 4); ferry.rotation.y = p.yaw; ferry.castShadow = true; scene.add(ferry); addBox(ferry.position.x, ferry.position.z, 3.6, 15, p.yaw); }
  const t = office(24.4152, 118.2884, 30, 13, 3, '水頭商港旅客服務中心', '#dfe6ea'); if (t) { PARKED.push(['taxi', t.x + Math.sin(t.rot) * 5, t.z + Math.cos(t.rot) * 5, t.rot + Math.PI / 2], ['van', t.x + Math.sin(t.rot) * 5 + Math.cos(t.rot) * 8, t.z + Math.cos(t.rot) * 5 - Math.sin(t.rot) * 8, t.rot + Math.PI / 2]); }
  p = pier(24.4259, 118.2648, 70, 8, '九宮碼頭'); if (p) { const q = p.side(46, 1); BOATS0.push([q.x, q.z, p.yaw]); }
  p = pier(24.4215, 118.4285, 90, 10, '料羅港'); if (p) { for (const [k, s] of [[50, -1], [66, 1]]) { const q = p.side(k, s); BOATS0.push([q.x, q.z, p.yaw]); } }
  p = pier(24.4160, 118.3565, 66, 5, null); if (p) { const q = p.side(50, 1); BOATS0.push([q.x, q.z, p.yaw]); }
  p = pier(24.5085, 118.4445, 66, 5, null); if (p) { const q = p.side(50, -1); BOATS0.push([q.x, q.z, p.yaw]); }
}
function buildBeaches() {
  const PAR = ['#e04b3c', '#2f86c9', '#f0c330', '#3fae7c', '#f08a3c'].map(c => new THREE.Color(c));
  for (const b of BEACHES) { if (b.skip) continue; const tx = -b.inz, tz = b.inx; PLACES.push({ name: b.name, x: b.x, z: b.z, r: b.r });
    const P = (along, inland) => ({ x: b.x + tx * along + b.inx * inland, z: b.z + tz * along + b.inz * inland });
    if (b.kind === 'park') {
      for (let a = -b.r * 0.7; a <= b.r * 0.7; a += 13) { const q = P(a + rr(-3, 3), rr(4, 20)), y = groundAt(q.x, q.z); if (y < 0.4 || y > 2.6 || sdAt(q.x, q.z) < 8) continue; { const cy = GW(24.43722, 118.39008); if (Math.hypot(q.x - cy.x, q.z - cy.z) < 32) continue; } BT.ccyl.add(MX(q.x, y, q.z, 0, 0.06, 2.3, 0.06), COL.white); BT.pine.add(MX(q.x, y + 1.9, q.z, rr(0, 6), 1.7, 0.75, 1.7), pick(PAR)); BT.cbox.add(MX(q.x + 1.2, y + 0.02, q.z + 0.4, rr(0, 3), 0.9, 0.05, 1.9), pick(PAR)); }
      const lg = P(0, 30), ly = groundAt(lg.x, lg.z); if (ly > 0.5) { for (const [a, c] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) BT.ccyl.add(MX(lg.x + a, ly, lg.z + c, 0, 0.1, 3, 0.1), COL.white); BT.cbox.add(MX(lg.x, ly + 3, lg.z, 0, 2.6, 0.2, 2.6), COL.white); BT.cbox.add(MX(lg.x, ly + 3.2, lg.z, 0, 2.2, 1.6, 2.2), COL.red); BT.roof.add(MX(lg.x, ly + 4.8, lg.z, 0, 3, 0.9, 3), COL.white); addBox(lg.x, lg.z, 1.3, 1.3, 0); }
      for (let a = -b.r * 0.8; a <= b.r * 0.8; a += 18) { const q = P(a, rr(40, 56)); if (sdAt(q.x, q.z) > 30 && roadClear(q.x, q.z, 3) && boxFree(q.x, q.z, 2)) palm(q.x, q.z); }
    } else {
      for (let a = -b.r; a <= b.r; a += 4.5) { const q = P(a, rr(-7, -1)), gy = groundAt(q.x, q.z); if (gy > 0.6 || gy < -1.8) continue; BT.spike.add(MX(q.x, gy, q.z, Math.atan2(-b.inx, -b.inz), 1, 1, 1, 0.75)); }
      if (b.kind === 'tank') { const q = P(8, 3), gy = groundAt(q.x, q.z); const tk = new THREE.Mesh(tankGeo('#6b5a45', '#54463a'), mVC); tk.position.set(q.x, gy - 0.35, q.z); tk.rotation.set(0.08, 0.9, 0.05); tk.castShadow = true; scene.add(tk); addBox(q.x, q.z, 2, 3.3, 0.9); }
    }
  }
}
function palm(x, z) { const y = groundAt(x, z) - 0.1, h = rr(6, 8.5); BT.trunk.add(MX(x, y, z, 0, 0.7, h, 0.7, rr(-0.06, 0.06), rr(-0.06, 0.06))); for (let k = 0; k < 6; k++) BT.pine.add(MX(x, y + h - 0.3, z, k * 1.05 + rr(0, 0.4), 0.45, 3.4, 0.45, 1.25), pick(LEAF)); }
function tankGeo(c1, c2) { return mergeGeos([[new THREE.BoxGeometry(3.2, 1.1, 6), c1, new THREE.Matrix4().makeTranslation(0, 1.0, 0)], [new THREE.BoxGeometry(3.6, 0.7, 6.4), c2, new THREE.Matrix4().makeTranslation(0, 0.45, 0)], [new THREE.CylinderGeometry(1.2, 1.4, 0.9, 10), c1, new THREE.Matrix4().makeTranslation(0, 2.0, -0.3)], [new THREE.CylinderGeometry(0.12, 0.12, 4.2, 8), c2, new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(0, 2.1, 2.6)]]); }
function howitzer(x, z, rot) { const y = groundAt(x, z) - 0.1; const m = new THREE.Mesh(mergeGeos([[new THREE.BoxGeometry(2.4, 0.5, 3.4), '#4f5a3a', new THREE.Matrix4().makeTranslation(0, 0.7, 0)], [new THREE.CylinderGeometry(0.6, 0.6, 0.5, 12).rotateZ(Math.PI / 2), '#2b2b2b', new THREE.Matrix4().makeTranslation(-1.4, 0.6, 0)], [new THREE.CylinderGeometry(0.6, 0.6, 0.5, 12).rotateZ(Math.PI / 2), '#2b2b2b', new THREE.Matrix4().makeTranslation(1.4, 0.6, 0)], [new THREE.CylinderGeometry(0.2, 0.26, 6.5, 10), '#55603f', new THREE.Matrix4().makeRotationX(Math.PI / 2 - 0.35).setPosition(0, 2.3, 2.6)], [new THREE.BoxGeometry(1.6, 1.4, 0.15), '#4f5a3a', new THREE.Matrix4().makeTranslation(0, 1.6, 0.6)]]), mVC); m.position.set(x, y, z); m.rotation.y = rot; m.castShadow = true; scene.add(m); addBox(x, z, 1.6, 2, rot); }
function buildMisc() {
  let w, s;
  // 陳景蘭洋樓
  if (!USE_OSM) { s = spot(24.43722, 118.39008, 23); if (s) yanglou(s.x, s.z, s.rot, 44, 13); } // OSM 版改由 50_heritage 的可進入洋樓取代
  // 水頭：得月樓 + 洋樓群
  s = spot(24.40972, 118.29841, 4); if (s) { const x = s.x, z = s.z, y = groundAt(x, z) - 0.2; BT.cbox.add(MX(x, y, z, 0.3, 5.5, 17, 5.5), COL.cream); BT.cbox.add(MX(x, y + 17, z, 0.3, 6.3, 0.6, 6.3), COL.white); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) BT.cbox.add(MX(x + a * 2.4, y + 17.6, z + b * 2.4, 0.3, 1, 1.2, 1), COL.white); for (let f = 0; f < 4; f++) BT.cbox.add(MX(x + Math.sin(0.3) * 2.78, y + 2.6 + f * 3.8, z + Math.cos(0.3) * 2.78, 0.3, 1.1, 1.8, 0.1), COL.glass); addBox(x, z, 2.8, 2.8, 0.3); stele(x + 7, z + 5, 0.3, '得月樓', 3);
    for (const [dx, dz, ww] of [[16, -6, 16], [-6, 22, 14], [22, 18, 15]]) if (roadClear(x + dx, z + dz, 9) && boxFree(x + dx, z + dz, 9) && sdAt(x + dx, z + dz) > 20) yanglou(x + dx, z + dz, s.rot, ww, 9); }
  // 古寧頭戰史館 + 戰車
  s = spot(24.48298, 118.32094, 14); if (s) { const x = s.x, z = s.z, y = minGround(x, z, 26, 14, s.rot) - 0.2, fx = Math.sin(s.rot), fz = Math.cos(s.rot), ux = Math.cos(s.rot), uz = -Math.sin(s.rot); BT.cbox.add(MX(x, y, z, s.rot, 26, 7, 14), COL.bunker); for (let i = 0; i < 9; i++) BT.cbox.add(MX(x + ux * (-12 + i * 3) + fx * 6.6, y + 7, z + uz * (-12 + i * 3) + fz * 6.6, s.rot, 1.6, 1.2, 0.8), COL.bunker); BT.cbox.add(MX(x + fx * 7.05, y, z + fz * 7.05, s.rot, 4, 4.4, 0.1), COL.dark); addBox(x, z, 13, 7, s.rot);
    addSign('古寧頭戰史館', 1.3, x + fx * 7.08, y + 5.6, z + fz * 7.08, s.rot, { color: '#f4e9c8', size: 96 }); const tx = x + fx * 13 + ux * 16, tz = z + fz * 13 + uz * 16; PARKED.push(['tank', tx, tz, s.rot + 0.5]); PICKUPS0.push(['pistol', x + fx * 10, z + fz * 10]); }
  // 北山播音牆
  s = spot(24.4889, 118.31309, 8); if (s) { const wx = s.x, wz = s.z, wy = groundAt(wx, wz) - 0.3; let gx = sdAt(wx + 14, wz) - sdAt(wx - 14, wz), gz = sdAt(wx, wz + 14) - sdAt(wx, wz - 14); const ro = Math.atan2(-gx, -gz); BT.cbox.add(MX(wx, wy, wz, ro, 13, 15, 5), COL.concrete); addBox(wx, wz, 6.5, 2.5, ro);
    const st = canvasTex(256, 288, (g, w, h) => { g.fillStyle = '#a9a69d'; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) { g.fillStyle = '#2a2a2c'; g.beginPath(); g.arc(22 + c * 42.5, 20 + r * 35.5, 15, 0, 7); g.fill(); g.fillStyle = '#4a4a4c'; g.beginPath(); g.arc(22 + c * 42.5, 20 + r * 35.5, 7, 0, 7); g.fill(); } });
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 14), new THREE.MeshStandardMaterial({ map: st, roughness: 0.9 })); sp.position.set(wx + Math.sin(ro) * 2.53, wy + 7.7, wz + Math.cos(ro) * 2.53); sp.rotation.y = ro; scene.add(sp); stele(wx - Math.sin(ro) * 6, wz - Math.cos(ro) * 6, ro + Math.PI, '北山播音牆', 3.4); }
  // 馬山觀測所
  s = spot(24.52772, 118.40888, 9); if (s) { const x = s.x, z = s.z, y = groundAt(x, z) - 0.3; BT.cbox.add(MX(x, y, z, s.rot, 14, 3.6, 9), COL.bunker); BT.cbox.add(MX(x, y + 3.6, z, s.rot, 15, 0.7, 10), COL.olive); addBox(x, z, 7, 4.5, s.rot); stele(x + Math.sin(s.rot) * 9 + 6, z + Math.cos(s.rot) * 9, s.rot, '馬山觀測所', 4.4); PARKED.push(['jeep', x + Math.sin(s.rot) * 12 - 8, z + Math.cos(s.rot) * 12, s.rot + 1.2]); }
  // 太武山「毋忘在莒」
  { w = GW(24.4630, 118.4140); const x = w.x, z = w.z; /* 毋忘在莒石刻改由 48_kinmen.js 的 taiwuShan() 產生 */ PICKUPS0.push(['armor', x + Math.sin(2.6) * 6, z + Math.cos(2.6) * 6]); }
  // 翟山坑道
  s = spot(24.39003, 118.31995, 8); if (s) { const x = s.x, z = s.z, y = groundAt(x, z) - 0.3, fx = Math.sin(s.rot), fz = Math.cos(s.rot); BT.cbox.add(MX(x, y, z, s.rot, 16, 7, 9), new THREE.Color('#8b8a80')); BT.ccyl.add(MX(x + fx * 4.2, y - 3.2, z + fz * 4.2, s.rot, 3.4, 0.4, 3.4, Math.PI / 2), COL.dark); addBox(x, z, 8, 4.5, s.rot); addSign('翟山坑道', 1.3, x + fx * 4.56, y + 5.6, z + fz * 4.56, s.rot, { color: '#f4e9c8', size: 96 }); PICKUPS0.push(['shotgun', x + fx * 8, z + fz * 8]); }
  // 文臺寶塔
  s = spot(24.39875, 118.306, 4); if (s) { const y = groundAt(s.x, s.z) - 0.2; for (let k = 0; k < 5; k++) { BT.ccyl.add(MX(s.x, y + k * 2.3, s.z, 0, 1.9 - k * 0.28, 2.1, 1.9 - k * 0.28), COL.stone); BT.ccyl.add(MX(s.x, y + k * 2.3 + 2.1, s.z, 0, 2.2 - k * 0.28, 0.2, 2.2 - k * 0.28), COL.concrete); } BT.pine.add(MX(s.x, y + 11.5, s.z, 0, 0.5, 1.4, 0.5), COL.stone); addBox(s.x, s.z, 2, 2, 0); stele(s.x + 5, s.z + 3, s.rot, '文臺寶塔', 3); }
  // 邱良功母節孝坊（金城）
  s = spot(24.43139, 118.31852, 4, 8); if (s) { const y = groundAt(s.x, s.z) - 0.1, ux = Math.cos(s.rot), uz = -Math.sin(s.rot); for (const o of [-4.2, -1.5, 1.5, 4.2]) { BT.cbox.add(MX(s.x + ux * o, y, s.z + uz * o, s.rot, 0.6, Math.abs(o) < 2 ? 8 : 6, 0.6), COL.stone); addBox(s.x + ux * o, s.z + uz * o, 0.4, 0.4, s.rot); } BT.cbox.add(MX(s.x, y + 5.2, s.z, s.rot, 9.4, 0.7, 0.7), COL.stone); BT.cbox.add(MX(s.x, y + 7.2, s.z, s.rot, 4, 0.7, 0.7), COL.stone); BT.roof.add(MX(s.x, y + 7.9, s.z, s.rot, 5, 0.9, 1.4), COL.concrete); addSign('節孝', 0.9, s.x + Math.sin(s.rot) * 0.38, y + 6.3, s.z + Math.cos(s.rot) * 0.38, s.rot, { color: '#3a2a22', size: 72 }); }
  // 八二三戰史館 + 榮民砲
  s = spot(24.44319, 118.4324, 13); if (s) { const o = office(24.44319, 118.4324, 24, 12, 2, '八二三戰史館', '#d9d5c8', '#59603d'); if (o) { howitzer(o.x + Math.cos(o.rot) * 16, o.z - Math.sin(o.rot) * 16, o.rot); const jx = o.x - Math.cos(o.rot) * 16, jz = o.z + Math.sin(o.rot) * 16; const jet = new THREE.Mesh(mergeGeos([[new THREE.CapsuleGeometry(0.8, 9, 4, 10), '#aab0b5', new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(0, 2.6, 0)], [new THREE.BoxGeometry(9, 0.2, 2.6), '#9aa2a8', new THREE.Matrix4().makeTranslation(0, 2.5, -0.5)], [new THREE.BoxGeometry(0.2, 2.2, 1.8), '#9aa2a8', new THREE.Matrix4().makeTranslation(0, 3.8, -4.4)], [new THREE.BoxGeometry(0.5, 1.9, 0.5), '#777', new THREE.Matrix4().makeTranslation(0, 0.95, 0)]]), mVC); jet.position.set(jx, groundAt(jx, jz), jz); jet.rotation.y = o.rot; jet.castShadow = true; scene.add(jet); addBox(jx, jz, 1, 1, 0); } }
  // 獅山砲陣地
  s = spot(24.50395, 118.43708, 6); if (s) { lionGun = { x: s.x, z: s.z, rot: 0.6 }; howitzer(s.x, s.z, 0.6); stele(s.x + 6, s.z + 4, s.rot, '獅山砲陣地', 3.4); PICKUPS0.push(['rifle', s.x - 5, s.z + 3]); }
  // 烈嶼：八達樓子、湖井頭戰史館
  s = spot(24.42996, 118.24575, 5); if (s) { const y = groundAt(s.x, s.z) - 0.2; BT.cbox.add(MX(s.x, y, s.z, s.rot, 7, 5, 7), new THREE.Color('#9a968c')); BT.cbox.add(MX(s.x, y + 5, s.z, s.rot, 5.4, 4, 5.4), new THREE.Color('#9a968c')); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) BT.cbox.add(MX(s.x + a * 2.3, y + 9, s.z + b * 2.3, s.rot, 0.8, 0.9, 0.8), new THREE.Color('#9a968c')); BT.cbox.add(MX(s.x + Math.sin(s.rot) * 3.55, y, s.z + Math.cos(s.rot) * 3.55, s.rot, 2.6, 3.4, 0.1), COL.dark); addBox(s.x, s.z, 3.5, 3.5, s.rot); stele(s.x + 7, s.z + 2, s.rot, '八達樓子', 3); PICKUPS0.push(['armor', s.x + Math.sin(s.rot) * 6, s.z + Math.cos(s.rot) * 6]); }
  office(24.44662, 118.23106, 20, 10, 2, '湖井頭戰史館', '#b9b6a8', '#59603d');
  // 公所、縣府、醫院、警局
  office(24.43682, 118.31881, 26, 12, 4, '金門縣政府', '#e6dccb', '#7c2f25'); office(24.43282, 118.3207, 14, 9, 3, '金城鎮公所'); office(24.45101, 118.33475, 16, 10, 3, '金寧鄉公所'); office(24.4414, 118.41707, 16, 10, 3, '金湖鎮公所'); office(24.4884, 118.4138, 16, 10, 3, '金沙鎮公所'); office(24.4324, 118.2450, 16, 10, 3, '烈嶼鄉公所');
  const hs = office(24.44059, 118.41789, 28, 13, 5, '金門醫院', '#eef0f1', '#b3261e'); if (hs) missionSpots.hospital = hs; office(24.43089, 118.2425, 14, 9, 2, '金門醫院烈嶼分院', '#eef0f1', '#b3261e');
  let pd = office(24.43654, 118.31948, 16, 9, 3, '金門縣警察局', '#dfe6ee', '#27496d'); if (pd) { PARKED.push(['police', pd.x + Math.sin(pd.rot) * 4 + Math.cos(pd.rot) * 6, pd.z + Math.cos(pd.rot) * 4 - Math.sin(pd.rot) * 6, pd.rot + Math.PI / 2]); missionSpots.police = pd; }
  pd = office(24.44192, 118.41378, 14, 9, 3, '金湖分局', '#dfe6ee', '#27496d'); if (pd) PARKED.push(['police', pd.x + Math.sin(pd.rot) * 4, pd.z + Math.cos(pd.rot) * 4, pd.rot + Math.PI / 2]);
  office(24.4331, 118.3201, 14, 8, 2, '金城車站', '#e9e6de', '#2f7d58'); office(24.4422, 118.41406, 14, 8, 2, '山外車站', '#e9e6de', '#2f7d58'); office(24.48896, 118.41307, 12, 8, 2, '沙美車站', '#e9e6de', '#2f7d58');
  gasStation(24.43594, 118.3273); gasStation(24.43927, 118.33416); gasStation(24.43006, 118.33745); gasStation(24.44345, 118.32557);
  temple(24.43129, 118.3178, '奎閣'); temple(24.4318, 118.3208, '浯島城隍廟'); temple(24.4896, 118.4120, '萬安堂'); temple(24.4417, 118.4160, '山外忠烈祠'); temple(24.4553, 118.3731, '瓊林蔡氏家廟'); temple(24.4312, 118.2432, '東林佛祖宮'); temple(24.4042, 118.3088, '金門城北鎮廟');
  // 聚落（閩南古厝）
  const V = (lat, lon, c, r, rot) => { const k = G(lat, lon); VCENTERS.push({ x: k[0] * KM, z: -k[1] * KM }); village(k[0], k[1], c, r, rot); };
  V(24.4560, 118.3728, 9, 5, 0.2); V(24.4540, 118.3750, 7, 3, 0.2); V(24.5040, 118.4408, 8, 4, -0.55); V(24.4778, 118.3078, 7, 4, 0.1); V(24.4866, 118.3040, 4, 3, 0.1); V(24.4100, 118.3002, 7, 5, 0.3); V(24.4042, 118.3105, 6, 4, 0.4); V(24.4405, 118.2590, 4, 2, 0.4); V(24.4462, 118.2530, 3, 2, 0.4);
  V(24.4275, 118.4255, 4, 2, -0.4); V(24.4660, 118.3262, 4, 3, 0.5); V(24.4368, 118.3875, 4, 2, 0.1); V(24.4388, 118.3672, 4, 2, 0.2); V(24.4640, 118.3850, 4, 2, 0); V(24.4750, 118.4050, 4, 3, 0.6); V(24.4300, 118.3320, 3, 2, 0.3); V(24.4485, 118.3570, 3, 2, 0.1);
  V(24.4605, 118.4428, 4, 2, -0.2); V(24.5172, 118.4240, 3, 2, 0.2); V(24.5030, 118.4080, 3, 2, 0.4); V(24.3960, 118.3150, 3, 2, 0.3); V(24.4125, 118.3185, 3, 2, 0.2); V(24.4520, 118.3890, 3, 2, 0.5); V(24.4550, 118.3040, 3, 2, 0.1); V(24.4362, 118.2385, 3, 2, 0.3); V(24.4218, 118.2352, 3, 2, 0.1); V(24.4265, 118.3020, 3, 2, 0.2); V(24.4700, 118.4385, 3, 2, 0.3);
  osmVillages(); buildVillageSteles(); buildVillageGates();
}
/* 真實店家（座標參考 Google 地圖）：把店名掛到最近的街屋上 */
const REAL_SHOPS = [['珍香小吃店', 24.43122, 118.31859], ['佳味小吃店', 24.43204, 118.3183], ['巧味香', 24.43115, 118.31866], ['民族小吃', 24.43071, 118.32065], ['金門文創小舖', 24.4318, 118.31927], ['鎧德戶外', 24.43434, 118.31649], ['金門縣信用合作社', 24.43458, 118.3194],
  ['不一樣雞排', 24.44071, 118.41611], ['三言兩語', 24.4422, 118.41476], ['加油站小吃店', 24.44119, 118.41568], ['國際體育服裝社', 24.44173, 118.41519], ['榕榕園麵館', 24.44304, 118.4147], ['沙美現炸油條', 24.49022, 118.41283], ['遠來興小吃店', 24.49033, 118.41308], ['美食美客', 24.49005, 118.41361], ['瑞源金門燒餅', 24.48962, 118.41311], ['米香蚵嗲', 24.49024, 118.41237],
  ['陳金福號貢糖', 24.44197, 118.34502], ['新大同餐飲', 24.43002, 118.24114], ['辣妹子川菜小館', 24.42913, 118.2285], ['妙香小吃店', 24.44019, 118.26014], ['嘉年華冰果室', 24.43575, 118.2384], ['三層樓芋頭餐廳', 24.44651, 118.25217]];
function hangShopSigns() {
  const bg = ['#b3261e', '#1f5fa8', '#2f7d58', '#e3b92f', '#f4efe2'], fg = ['#fff3c9', '#ffffff', '#ffffff', '#2b2420', '#b3261e'];
  REAL_SHOPS.forEach(([name, lat, lon], k) => { const w = GW(lat, lon); let b = null, bd = 150 * 150; for (const s of shopList) { if (s.named) continue; const d = (s.x - w.x) ** 2 + (s.z - w.z) ** 2; if (d < bd) { bd = d; b = s; } }
    if (!b) { const o = office(lat, lon, 9, 9, 2, name, '#efe9dc', bg[k % 5]); return; }
    b.named = true; const fx = Math.sin(b.rot), fz = Math.cos(b.rot), h = Math.min(1.0, (b.w - 0.6) / ([...name].length * 1.02)); addSign(name, h, b.x + fx * (b.d / 2 + (b.style === 'old' ? 0.06 : 1.85)), b.y + (b.style === 'old' ? 3.9 : 3.75), b.z + fz * (b.d / 2 + (b.style === 'old' ? 0.06 : 1.85)), b.rot, { color: fg[k % 5], bg: bg[k % 5], size: 72, pad: 10 }); });
}
/* 岸邊浪花 */
let foamMat = null;
function buildFoam() {
  const pos = [], uv = []; for (let iz = 0; iz < NZ - 1; iz++) for (let ix = 0; ix < NX - 1; ix++) { const a = iz * NX + ix, h0 = HT[a], h1 = HT[a + 1], h2 = HT[a + NX], h3 = HT[a + NX + 1], mn = Math.min(h0, h1, h2, h3), mx = Math.max(h0, h1, h2, h3); if (mx < -0.75 || mn > 0.12 || SD[a] > 40) continue; const x = TX0 + ix * CELL, z = TZ0 + iz * CELL; pos.push(x, 0, z, x, 0, z + CELL, x + CELL, 0, z, x + CELL, 0, z, x, 0, z + CELL, x + CELL, 0, z + CELL); for (const [u, v] of [[0, 0], [0, 1], [1, 0], [1, 0], [0, 1], [1, 1]]) uv.push((x + u * CELL) / 40, (z + v * CELL) / 40); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const tex = canvasTex(128, 128, c => { const im = c.createImageData(128, 128); for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) { const n = pfbm(x / 128 * 6, y / 128 * 6, 6), v = smooth(0.46, 0.62, n) * 255, i = (y * 128 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = v; } c.putImageData(im, 0, 0); }, true);
  foamMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); const m = new THREE.Mesh(g, foamMat); m.position.y = 0.05; m.renderOrder = 2; scene.add(m);
}
function buildWorld() {
  initBatches();
  buildNQU(); buildJuguang(); buildWinery(); buildAirport(); buildBridge(); buildHarbors();
  buildEnterables(); buildMisc();
  LIONS_LL.forEach(p => windLion(p[0], p[1]));
  for (const e of roadEdges) if (!e.bridge) lineTown(e);
  buildProps(); buildIslet(); buildTunnels(); buildLife();
  hangShopSigns(); townInfill(); buildBeaches(); buildFoam();
  // 路燈
  for (const e of roadEdges) e.pts.forEach((p, i) => { if ((p.town < 0 && !e.bridge) || i % 8 !== 3) return; const s = (i >> 3) % 2 ? 1 : -1, rx = -p.tz * s, rz = p.tx * s, x = p.x + rx * (e.hw + 1.4), z = p.z + rz * (e.hw + 1.4), yaw = Math.atan2(-rx, -rz), y = e.bridge ? p.y : groundAt(x, z); if (!e.bridge && !boxFree(x, z, 0.5)) return; const m = MX(x, y - 0.1, z, yaw); BT.lamp.add(m); BT.lampHead.add(m); BT.pool.add(MX(x - rx * 2.6, (e.bridge ? p.y : groundAt(x - rx * 2.6, z - rz * 2.6)) + 0.22, z - rz * 2.6, 0, 13, 1, 13)); });
  // 行道樹
  for (const e of roadEdges) { if (e.bridge || e.type === 'minor') continue; e.pts.forEach((p, i) => { if (i % 4 !== 1) return; if (p.town >= 0 && TOWNS[p.town].style !== 'campus' && TOWNS[p.town].style !== 'park') return; for (const s of [-1, 1]) { const x = p.x - p.tz * s * (e.hw + 4.6) + rr(-0.6, 0.6), z = p.z + p.tx * s * (e.hw + 4.6) + rr(-0.6, 0.6); if (sdAt(x, z) < 14 || groundAt(x, z) < 1 || !roadClear(x, z, 2.5, e) || !boxFree(x, z, 2.5)) continue; tree(x, z, rand() < 0.72 ? 1 : 0); } }); }
  // 林地
  for (let i = 0; i < 6400; i++) { const x = rr(TX0 + 100, -TX0 - 100), z = rr(TZ0 + 100, -TZ0 - 250); const sd = sdAt(x, z); if (sd < 40 || gridSample(SANDW, x, z) > 0.05) continue; const g = groundAt(x, z); if (g < 1.3) continue; const lu = luAt(x, z) & 7, dens = LU ? (lu === 2 ? 1 : lu === 1 || lu === 3 || lu === 6 ? 0 : lu === 4 ? 0.55 : fbm(x * 0.005 + 3, z * 0.005 + 8) * 0.9) : fbm(x * 0.005 + 3, z * 0.005 + 8) + smooth(10, 40, g) * 0.5; if (dens < 0.5) continue; if (Math.hypot(x - RUNWAY.x, z - RUNWAY.z) < 260) continue; if (!roadClear(x, z, 7) || !boxFree(x, z, 4)) continue; tree(x, z, rand() < (g > 14 ? 0.75 : 0.45) ? 1 : 0, rr(0.85, 1.25)); }
  // 高粱田
  let fields = 0; for (let tries = 0; tries < 1200 && fields < 18; tries++) { const x = rr(-1300, 1900), z = rr(-1100, 900), rot = rr(0, 3.14); if (sdAt(x, z) < 110 || groundAt(x, z) > 9 || Math.abs(groundAt(x + 30, z) - groundAt(x - 30, z)) > 1.6 || !roadClear(x, z, 46) || !boxFree(x, z, 46) || Math.hypot(x - RUNWAY.x, z - RUNWAY.z) < 300) continue; fields++; SORG.push({ x, z }); const c = Math.cos(rot), s = Math.sin(rot); addBox(x, z, 0.01, 0.01, 0);
    for (let a = -28; a <= 28; a += 2.6) for (let b = -19; b <= 19; b += 2.6) { const wx = x + a * c + b * s + rr(-0.3, 0.3), wz = z - a * s + b * c + rr(-0.3, 0.3), gy = groundAt(wx, wz); if (gy < 1) continue; BT.stalk.add(MX(wx, gy - 0.05, wz, rr(0, 6.28), 1, rr(0.9, 1.2), 1)); } }
  buildCows();
  for (const k in BT) BT[k].build();
}

/* 地名 */
const PLACES = [['國立金門大學', 24.4478, 118.3229, 0.45], ['金城・后浦', 24.4338, 118.3200, 0.6], ['模範街', 24.4312, 118.3186, 0.15], ['莒光樓', 24.42491, 118.31902, 0.3], ['水頭聚落', 24.4100, 118.2990, 0.4], ['水頭碼頭', 24.4152, 118.2884, 0.3], ['金門城', 24.4042, 118.3096, 0.3], ['翟山坑道', 24.3905, 118.3200, 0.3], ['古崗湖', 24.3943, 118.3156, 0.3], ['古寧頭・南山', 24.4773, 118.3085, 0.4], ['古寧頭・北山', 24.4866, 118.3050, 0.3], ['古寧頭戰史館', 24.4830, 118.3209, 0.3], ['慈湖', 24.4690, 118.3068, 0.5], ['金寧鄉公所・頂堡', 24.4508, 118.3348, 0.3], ['金門酒廠', 24.4336, 118.3436, 0.35], ['瓊林聚落', 24.4550, 118.3738, 0.42], ['尚義機場', 24.4318, 118.3596, 0.6], ['太武山', 24.4625, 118.4130, 1.1], ['山外', 24.4415, 118.4148, 0.5], ['太湖', 24.4398, 118.4263, 0.32], ['八二三戰史館', 24.4432, 118.4324, 0.25], ['料羅港', 24.4235, 118.4280, 0.4], ['陳景蘭洋樓', 24.43722, 118.39008, 0.3], ['沙美老街', 24.4892, 118.4128, 0.42], ['陽翟老街', 24.4794, 118.4273, 0.25], ['山后民俗村', 24.5038, 118.4404, 0.35], ['獅山砲陣地', 24.5040, 118.4371, 0.15], ['馬山觀測所', 24.5270, 118.4090, 0.35], ['金門大橋', 24.4476, 118.2853, 1.2], ['烈嶼・東林', 24.4318, 118.2440, 0.45], ['烈嶼・后頭', 24.4402, 118.2601, 0.25], ['九宮碼頭', 24.4262, 118.2640, 0.25], ['湖井頭', 24.4462, 118.2315, 0.25], ['八達樓子', 24.4300, 118.2458, 0.12]]
  .map(p => ({ name: p[0], ...GW(p[1], p[2]), r: p[3] * KM }));
function zoneAt(x, z) {
  if (player.tunnel) return { name: player.tunnel.name, town: townAt(player.tunnel.surf.x, player.tunnel.surf.z) };
  if (player.inside) return { name: player.inside.name, town: townAt(x, z) };
  let best = null; for (const p of PLACES) { if (p.osm) continue; const d = Math.hypot(x - p.x, z - p.z); if (d < p.r && (!best || p.r < best.r)) best = p; }
  const town = sdAt(x, z) < -40 ? '金門海域' : townAt(x, z); return { name: best ? best.name : town, town };
}
