/* =====================================================================
   真實地理：經緯度 → 世界座標（1 公里 = 150 單位）
   海岸線與鄉鎮界來自 GEO_COAST / GEO_TOWNS
   ===================================================================== */
const LON0 = 118.345, LAT0 = 24.456;
const G = (lat, lon) => [(lon - LON0) * 101.3, (lat - LAT0) * 110.8];
const GW = (lat, lon) => ({ x: (lon - LON0) * 101.3 * KM, z: -(lat - LAT0) * 110.8 * KM });
const ringW = r => r.map(c => [(c[0] - LON0) * 101.3 * KM, -(c[1] - LAT0) * 110.8 * KM]);
const coastPolys = GEO_COAST.map(ringW), mainPoly = coastPolys[0], lieyuPoly = coastPolys[1];
const townPolys = Object.entries(GEO_TOWNS).map(([name, rs]) => { const rings = rs.map(ringW); let cx = 0, cz = 0; const big = rings.reduce((a, b) => b.length > a.length ? b : a); for (const p of big) { cx += p[0]; cz += p[1]; } return { name, rings, cx: cx / big.length, cz: cz / big.length }; });
function inRing(r, x, z) { let ins = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { if (((r[i][1] > z) !== (r[j][1] > z)) && (x < (r[j][0] - r[i][0]) * (z - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0])) ins = !ins; } return ins; }
function townAt(x, z) { for (const t of townPolys) for (const r of t.rings) if (inRing(r, x, z)) return t.name; let b = null, bd = 1e12; for (const t of townPolys) { const d = (t.cx - x) ** 2 + (t.cz - z) ** 2; if (d < bd) { bd = d; b = t; } } return b.name; }

const TX0 = -2180, TZ0 = -1450, CELL = 8, NX = 546, NZ = 349, ROOM_Y = 2;
const WX0 = -2900; // 玩家可到的最西邊（含大膽島）
const SD = new Float32Array(NX * NZ), HT = new Float32Array(NX * NZ), SANDW = new Float32Array(NX * NZ);
const HILLS = [[24.4625, 118.4130, 78, 190], [24.4570, 118.4043, 42, 150], [24.4685, 118.4225, 40, 150], [24.5040, 118.4371, 13, 70], [24.3925, 118.3185, 11, 90], [24.4370, 118.2400, 13, 100], [24.4490, 118.3560, 7, 110], [24.4760, 118.4380, 12, 110]]
  .map(h => ({ ...GW(h[0], h[1]), h: h[2], s: h[3] }));
let LAKES = [[24.4690, 118.3068, 62], [24.4398, 118.4263, 40], [24.39382, 118.31455, 24], [24.47654, 118.31135, 20], [24.4262, 118.3168, 18], [24.49057, 118.42005, 26]].map(l => ({ ...GW(l[0], l[1]), r: l[2] }));
const BEACHES = [['歐厝沙灘', 24.4085, 118.3390, 95, 'tank'], ['后湖海濱公園', 24.41597, 118.34606, 90, 'park'], ['成功海灘', 24.4310, 118.3900, 80, 'park'], ['料羅灣', 24.4200, 118.4200, 100, 'park'], ['慈堤海岸', 24.4640, 118.2985, 80, 'spike'], ['北山海灘', 24.4900, 118.3060, 80, 'spike'], ['山后海灘', 24.5075, 118.4440, 70, 'park'], ['雙口海灘', 24.4440, 118.2275, 70, 'spike'], ['貓公石海岸', 24.4500, 118.2600, 60, 'park']]
  .map(b => ({ name: b[0], ...GW(b[1], b[2]), r: b[3], kind: b[4] }));
const decks = [];
function addDeck(x, z, hw, hd, rot, y) { decks.push({ x, z, hw, hd, cos: Math.cos(rot), sin: Math.sin(rot), y, rot }); }
function deckY(x, z) { for (const c of decks) { const dx = x - c.x, dz = z - c.z; if (Math.abs(dx * c.cos - dz * c.sin) <= c.hw && Math.abs(dx * c.sin + dz * c.cos) <= c.hd) return c.y; } return null; }

function sdPoly(poly, x, z) {
  let d = 1e12, inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const ax = poly[j][0], az = poly[j][1], bx = poly[i][0], bz = poly[i][1], ex = bx - ax, ez = bz - az;
    let t = ((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez); t = t < 0 ? 0 : t > 1 ? 1 : t;
    const dx = x - (ax + ex * t), dz = z - (az + ez * t), dd = dx * dx + dz * dz; if (dd < d) d = dd;
    if (((az > z) !== (bz > z)) && (x < (bx - ax) * (z - az) / (bz - az) + ax)) inside = !inside;
  }
  return inside ? Math.sqrt(d) : -Math.sqrt(d);
}
/* 真實高程：Copernicus DEM GLO-30（與 TerraPrinter 同一資料源），重採樣到地形格點，單位公尺 */
let DEM = null; const DEM_K = 0.28;
/* 真實湖泊：OpenStreetMap 的水域多邊形（慈湖、太湖、榮湖、陵水湖、各水庫…） */
/* 金門大學校內的池塘（實景有木棧道與拱橋）：加進湖泊清單，地形會自動挖低、鋪水面 */
const NQU_POND = { x: -250, z: 78, rx: 24, rz: 17 };
if (typeof OSM_LAKES !== 'undefined') { const f = []; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, k = 1 + 0.12 * Math.sin(a * 3 + 1); f.push(+(NQU_POND.x + Math.cos(a) * NQU_POND.rx * k).toFixed(1), +(NQU_POND.z + Math.sin(a) * NQU_POND.rz * k).toFixed(1)); } OSM_LAKES.push(['金大池塘', 1200, f]); }
const LK = (typeof OSM_LAKES !== 'undefined' && !/oldroads|nolake/.test(location.search)) ? OSM_LAKES.map(([nm, A, f]) => { const pts = []; for (let i = 0; i < f.length; i += 2) pts.push([f[i], f[i + 1]]); let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, cx = 0, cz = 0; for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); cx += x; cz += z; } return { nm, A, pts, x0, x1, z0, z1, cx: cx / pts.length, cz: cz / pts.length }; }) : [];
function inLake(x, z, m = 2) { for (const L of LK) { if (L.skip || x < L.x0 - m || x > L.x1 + m || z < L.z0 - m || z > L.z1 + m) continue; if (sdPoly(L.pts, x, z) > -m) return true; } return false; }
function carveLakes(only) {
  for (const L of LK) { if (only && L.nm !== only) continue;
    let rim = 1e9; for (const [x, z] of L.pts) rim = Math.min(rim, gridSample(HT, x, z)); L.rim = rim; if (rim < 0.3 || gridSample(SD, L.cx, L.cz) < 6) { L.skip = true; continue; }
    const i0 = Math.max(0, Math.floor((L.x0 - 10 - TX0) / CELL)), i1 = Math.min(NX - 1, Math.ceil((L.x1 + 10 - TX0) / CELL)), j0 = Math.max(0, Math.floor((L.z0 - 10 - TZ0) / CELL)), j1 = Math.min(NZ - 1, Math.ceil((L.z1 + 10 - TZ0) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const x = TX0 + i * CELL, z = TZ0 + j * CELL, sd = sdPoly(L.pts, x, z); if (sd < -9) continue; const k = j * NX + i, depth = rim - 1.4 - Math.min(2.2, Math.max(0, sd) * 0.07); HT[k] = Math.min(HT[k], lerp(HT[k], depth, smooth(-9, 4, sd))); }
  }
}
let LU = null; // OpenStreetMap 土地利用（1 農田 2 樹林 3 住商 4 草地公園 5 濕地 6 營區；高 5 位元是塊別變化）
const luAt = (x, z) => { if (!LU) return 0; const i = Math.round((x - TX0) / CELL), j = Math.round((z - TZ0) / CELL); return i < 0 || j < 0 || i >= NX || j >= NZ ? 0 : LU[j * NX + i]; };
async function loadGrayPNG(url) { // 8 位元灰階 PNG → 每格一個位元組（託管只接受圖片等副檔名）
  const r = await fetch(url); if (!r.ok) return null; const bm = await createImageBitmap(await r.blob(), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' }); if (bm.width !== NX || bm.height !== NZ) return null;
  const c = document.createElement('canvas'); c.width = NX; c.height = NZ; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(bm, 0, 0); const d = g.getImageData(0, 0, NX, NZ).data, out = new Uint8Array(NX * NZ); for (let i = 0; i < out.length; i++) out[i] = d[i * 4]; return out; }
async function loadLU() { if (/nolu|oldroads/.test(location.search)) return; try { LU = await loadGrayPNG('lu.png'); } catch (e) { LU = null; } }
async function loadDEM() { if (/nodem/.test(location.search)) return; try { DEM = await loadGrayPNG('dem.png'); } catch (e) { DEM = null; } }
function baseHeight(x, z, sd, dem) {
  if (sd < 0) return Math.max(-8, sd * 0.07);
  const shore = smooth(0, 60, sd);
  if (dem !== undefined && dem !== null) {
    let h = 0.25 + shore * 1.6 + dem * DEM_K * (1 + dem / 600) * smooth(0, 90, sd);
    h += (fbm(x * 0.02, z * 0.02) - 0.5) * 1.0 * shore + (fbm(x * 0.006, z * 0.006) - 0.5) * 1.6 * smooth(30, 200, sd);
    h = Math.max(h, 0.25 + shore * 0.6);
    if (!LK.length) for (const l of LAKES) { const d = Math.hypot(x - l.x, z - l.z); if (d < l.r * 1.25) { const tgt = l.r > 50 ? -2.4 : Math.min(h - 2.8, Math.max(-2.4, h * 0.55 - 2.2)); h = lerp(h, tgt, smooth(l.r * 1.25, l.r * 0.45, d)); } }
    return h;
  }
  let h = 0.25 + shore * 2.2 + smooth(40, 420, sd) * 3.5;
  h += (fbm(x * 0.004, z * 0.004) - 0.5) * 9 * smooth(30, 260, sd);
  h += (fbm(x * 0.02, z * 0.02) - 0.5) * 1.1 * shore;
  for (const k of HILLS) { const d2 = (x - k.x) * (x - k.x) + (z - k.z) * (z - k.z); if (d2 < k.s * k.s * 9) h += k.h * Math.exp(-d2 / (2 * k.s * k.s)) * smooth(0, 120, sd) * (0.85 + 0.3 * fbm(x * 0.012, z * 0.012)); }
  h = Math.max(h, 0.25 + shore * 0.6);
  if (!LK.length) for (const l of LAKES) { const d = Math.hypot(x - l.x, z - l.z); if (d < l.r * 1.25) { const tgt = l.r > 50 ? -2.4 : Math.min(h - 2.8, Math.max(-2.4, h * 0.55 - 2.2)); h = lerp(h, tgt, smooth(l.r * 1.25, l.r * 0.45, d)); } }
  return h;
}
function buildTerrainData() {
  const polys = coastPolys.map(p => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const q of p) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]); } return { p, x0, x1, z0, z1 }; });
  for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) {
    const x = TX0 + ix * CELL, z = TZ0 + iz * CELL; let sd = -220;
    for (const P of polys) if (x > P.x0 - 220 && x < P.x1 + 220 && z > P.z0 - 220 && z < P.z1 + 220) sd = Math.max(sd, sdPoly(P.p, x, z));
    if (sd > -120) sd += (fbm(x * 0.012, z * 0.012) - 0.5) * 12;
    SD[iz * NX + ix] = sd;
  }
  LAKES = LAKES.filter(l => gridSample(SD, l.x, l.z) > l.r + 12);
  for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) { const i = iz * NX + ix; HT[i] = baseHeight(TX0 + ix * CELL, TZ0 + iz * CELL, SD[i], DEM ? DEM[i] : null); }
  carveLakes();
  // 海灘：把指定座標吸附到最近的海岸，做出寬沙灘
  for (const b of BEACHES) {
    let best = null, bd = 1e12; const R = 260, i0 = Math.max(0, Math.floor((b.x - R - TX0) / CELL)), i1 = Math.min(NX - 1, Math.ceil((b.x + R - TX0) / CELL)), j0 = Math.max(0, Math.floor((b.z - R - TZ0) / CELL)), j1 = Math.min(NZ - 1, Math.ceil((b.z + R - TZ0) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const sd = SD[j * NX + i]; if (sd < 14 || sd > 30) continue; const x = TX0 + i * CELL, z = TZ0 + j * CELL, d = (x - b.x) ** 2 + (z - b.z) ** 2; if (d < bd) { bd = d; best = [x, z]; } }
    if (!best) { b.skip = true; continue; } b.x = best[0]; b.z = best[1];
    const gx = (gridSample(SD, b.x + 12, b.z) - gridSample(SD, b.x - 12, b.z)), gz = (gridSample(SD, b.x, b.z + 12) - gridSample(SD, b.x, b.z - 12)), gl = Math.hypot(gx, gz) || 1; b.inx = gx / gl; b.inz = gz / gl; // 指向內陸
    const r = b.r * 1.3, a0 = Math.max(0, Math.floor((b.x - r - TX0) / CELL)), a1 = Math.min(NX - 1, Math.ceil((b.x + r - TX0) / CELL)), c0 = Math.max(0, Math.floor((b.z - r - TZ0) / CELL)), c1 = Math.min(NZ - 1, Math.ceil((b.z + r - TZ0) / CELL));
    for (let j = c0; j <= c1; j++) for (let i = a0; i <= a1; i++) { const k = j * NX + i, sd = SD[k]; if (sd < -60 || sd > 85) continue; const d = Math.hypot(TX0 + i * CELL - b.x, TZ0 + j * CELL - b.z); if (d > r) continue; const w = smooth(r, r * 0.6, d) * smooth(85, 60, sd); HT[k] = lerp(HT[k], clamp(sd * 0.028, -2.2, 1.7) + 0.08, w); SANDW[k] = Math.max(SANDW[k], w); }
  }
}
function gridSample(A, x, z) {
  let fx = (x - TX0) / CELL, fz = (z - TZ0) / CELL; fx = clamp(fx, 0, NX - 1.001); fz = clamp(fz, 0, NZ - 1.001);
  const ix = fx | 0, iz = fz | 0, u = fx - ix, v = fz - iz, i = iz * NX + ix;
  return (A[i] * (1 - u) + A[i + 1] * u) * (1 - v) + (A[i + NX] * (1 - u) + A[i + NX + 1] * u) * v;
}
/* 大膽島：在網格外的獨立地形（北山、南山、中間沙頸＝生明路） */
const DADAN = GW(24.39028, 118.16556);
const DN = { x: DADAN.x + 6, z: DADAN.z - 64, rx: 44, rz: 50, h: 19 }, DS = { x: DADAN.x - 4, z: DADAN.z + 54, rx: 54, rz: 60, h: 29 };
function dadanSD(x, z) {
  const e = c => (1 - Math.hypot((x - c.x) / c.rx, (z - c.z) / c.rz)) * Math.min(c.rx, c.rz), t = (z - DN.z) / (DS.z - DN.z), neck = t > 0 && t < 1 ? 15 - Math.abs(x - lerp(DN.x, DS.x, t)) : -999;
  return Math.max(e(DN), e(DS), neck) + (fbm(x * 0.03 + 7, z * 0.03 + 3) - 0.5) * 9;
}
function dadanGround(x, z) {
  const sd = dadanSD(x, z); if (sd < 0) return Math.max(-8, sd * 0.12);
  const b = c => { const t = Math.hypot((x - c.x) / (c.rx * 0.95), (z - c.z) / (c.rz * 0.95)); return t < 1 ? c.h * (1 - t * t) ** 1.6 : 0; };
  return 0.3 + smooth(0, 10, sd) * 1.4 + (b(DN) + b(DS)) * smooth(2, 16, sd) + (fbm(x * 0.05, z * 0.05) - 0.5) * 2 * smooth(4, 20, sd);
}
const inDadan = (x, z) => x < TX0 + 4 && Math.abs(x - DADAN.x) < 140 && Math.abs(z - DADAN.z) < 190;
const groundAt = (x, z) => inDadan(x, z) ? dadanGround(x, z) : gridSample(HT, x, z);
const sdAt = (x, z) => inDadan(x, z) ? dadanSD(x, z) : gridSample(SD, x, z);
function flattenDisc(x, z, R, target = null) {
  if (target === null) target = Math.max(1.4, groundAt(x, z));
  const i0 = Math.max(0, Math.floor((x - R - TX0) / CELL)), i1 = Math.min(NX - 1, Math.ceil((x + R - TX0) / CELL)), j0 = Math.max(0, Math.floor((z - R - TZ0) / CELL)), j1 = Math.min(NZ - 1, Math.ceil((z + R - TZ0) / CELL));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const d = Math.hypot(TX0 + i * CELL - x, TZ0 + j * CELL - z); if (d < R) { const k = j * NX + i; HT[k] = lerp(HT[k], target, smooth(R, R * 0.7, d)); } }
  return target;
}

let terrainMesh = null;
const FIELDC = ['#b86f4a', '#c08a52', '#9cab55', '#c9b46a', '#a7623e', '#8fa64e', '#d0a85c', '#b5794c'].map(h => new THREE.Color(h)), FOREST = new THREE.Color('#3f6e35'), WETL = new THREE.Color('#6f8a6a'), MILC = new THREE.Color('#7d7a5c');
function buildTerrainMesh() {
  const pos = new Float32Array(NX * NZ * 3), col = new Float32Array(NX * NZ * 3), uv = new Float32Array(NX * NZ * 2);
  const C = h => new THREE.Color(h);
  const sand = C('#e2d3a8'), wet = C('#c9b98c'), deep = C('#3f6f78'), g1 = C('#7fa653'), g2 = C('#5d8a45'), dry = C('#b3ab6a'), soil = C('#b86f4a'), rock = C('#9a968c'), c = new THREE.Color();
  for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) {
    const i = iz * NX + ix, x = TX0 + ix * CELL, z = TZ0 + iz * CELL, h = HT[i], sd = SD[i];
    pos[i * 3] = x; pos[i * 3 + 1] = h; pos[i * 3 + 2] = z; uv[i * 2] = x / 26; uv[i * 2 + 1] = z / 26;
    const hx = HT[iz * NX + Math.min(NX - 1, ix + 1)] - HT[iz * NX + Math.max(0, ix - 1)], hz = HT[Math.min(NZ - 1, iz + 1) * NX + ix] - HT[Math.max(0, iz - 1) * NX + ix];
    const slope = Math.hypot(hx, hz) / (2 * CELL);
    if (h < 0.15) { c.copy(wet).lerp(deep, smooth(0, -6, h)); }
    else {
      c.copy(g1).lerp(g2, smooth(0.3, 0.7, fbm(x * 0.011, z * 0.011)));
      c.lerp(dry, smooth(0.5, 0.72, fbm(x * 0.0035 + 9, z * 0.0035 + 4)) * 0.75);
      c.lerp(soil, smooth(0.6, 0.7, fbm(x * 0.006 + 40, z * 0.006 + 17)) * 0.8 * (1 - smooth(0.1, 0.3, slope)));
      c.lerp(rock, Math.max(smooth(0.32, 0.6, slope), smooth(34, 62, h) * 0.8));
      if (LU && LU[i]) { const cl = LU[i] & 7, vr = LU[i] >> 3; if (cl === 1) c.copy(FIELDC[vr & 7]).lerp(g1, 0.15 * fbm(x * 0.05, z * 0.05)); else if (cl === 2) c.lerp(FOREST, 0.65); else if (cl === 3) c.lerp(dry, 0.35); else if (cl === 4) c.copy(g1).lerp(g2, 0.3); else if (cl === 5) c.lerp(WETL, 0.6); else if (cl === 6) c.lerp(MILC, 0.45); else if (cl === 7) c.copy(sand); c.lerp(rock, smooth(0.32, 0.6, slope)); }
      c.lerp(sand, Math.max(1 - smooth(16, 52, sd), SANDW[i]));
    }
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const idx = new Uint32Array((NX - 1) * (NZ - 1) * 6); let k = 0;
  for (let iz = 0; iz < NZ - 1; iz++) for (let ix = 0; ix < NX - 1; ix++) { const a = iz * NX + ix, b = a + 1, d = a + NX, e = d + 1; idx[k++] = a; idx[k++] = d; idx[k++] = b; idx[k++] = b; idx[k++] = d; idx[k++] = e; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals();
  const detail = canvasTex(256, 256, gg => { const im = gg.createImageData(256, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const n = pfbm(x / 256 * 16, y / 256 * 16, 16); const v = clamp(236 + (n - 0.47) * 90, 0, 255); const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } gg.putImageData(im, 0, 0); }, true);
  const pg = photoGray('grass', 226, 1.25), tm = new THREE.MeshStandardMaterial({ vertexColors: true, map: pg || detail, roughness: 0.96 });
  if (pg) { pg.repeat.set(4, 4); const nn = photoTex('grass_n', false, 4, 4); if (nn) { tm.normalMap = nn; tm.normalScale = new THREE.Vector2(0.6, 0.6); } }
  terrainMesh = new THREE.Mesh(g, tm);
  terrainMesh.receiveShadow = true; scene.add(terrainMesh);
}

/* =====================================================================
   道路圖：節點用真實經緯度（公所、車站、聚落等座標）
   ===================================================================== */
const roadNodes = {}, roadEdges = [], roadSamples = [], townSamples = [];
function RN(id, lat, lon) { const w = GW(lat, lon); roadNodes[id] = { id, x: w.x, z: w.z, y: 0, edges: [] }; }
function RE(a, b, mids, name, type = 'major') { roadEdges.push({ id: roadEdges.length, a: roadNodes[a], b: roadNodes[b], mids: mids.map(m => G(m[0], m[1])), name, type, hw: type === 'minor' ? 3.6 : type === 'bridge' ? 6 : 5.5, bridge: type === 'bridge' }); }
const NODES = { JC: [24.4331, 118.3201], JCW: [24.4322, 118.3160], JCN: [24.4396, 118.3205], JCE: [24.4359, 118.3262], JCS: [24.4285, 118.3227], MF: [24.4306, 118.3176], UNI: [24.4438, 118.3255], A1: [24.4476, 118.3229], JN: [24.4506, 118.3350], ANQ: [24.4654, 118.3272], HX: [24.4545, 118.3052], CD: [24.4640, 118.3012], NS: [24.4773, 118.3085], BS: [24.4862, 118.3052], GN: [24.4830, 118.3205],
  PS: [24.4480, 118.3580], QL: [24.4550, 118.3738], XJ: [24.4520, 118.3900], SW: [24.4422, 118.4141], SWS: [24.4388, 118.4128], SWE: [24.4408, 118.4182], ZL: [24.4635, 118.3859], DM: [24.4744, 118.4061], SM: [24.4889, 118.4131], SMO: [24.4906, 118.4108], YZ: [24.4794, 118.4273], EA: [24.4600, 118.4420], SH: [24.5030, 118.4395], GA: [24.5170, 118.4250], MS: [24.5262, 118.4094],
  WN: [24.4313, 118.3315], WF: [24.4325, 118.3436], AP: [24.4354, 118.3606], SY: [24.4372, 118.3690], CG: [24.4368, 118.3885], LL: [24.4268, 118.4268], TH: [24.4425, 118.4300], JG: [24.4252, 118.3200], JMC: [24.4042, 118.3096], ST: [24.4100, 118.2990], STP: [24.4150, 118.2892], GG: [24.3955, 118.3160], ZS: [24.3912, 118.3198],
  T: [24.4533, 118.3018], U: [24.4428, 118.2660], HT: [24.4402, 118.2601], DL: [24.4318, 118.2440], JG9: [24.4268, 118.2632], HJ: [24.4458, 118.2325], HC: [24.4462, 118.2522], QQ: [24.4215, 118.2345] };
const USE_OSM = typeof OSM_ROADS !== 'undefined' && !/oldroads/.test(location.search);
if (!USE_OSM) {
for (const id in NODES) RN(id, NODES[id][0], NODES[id][1]);
RE('JC', 'JCN', [[24.4368, 118.3190]], '民生路'); RE('JC', 'JCE', [], '民族路'); RE('JC', 'JCS', [], '莒光路'); RE('JC', 'JCW', [], '民權路'); RE('JC', 'MF', [], '模範街', 'minor'); RE('JCW', 'JCN', [[24.4362, 118.3162]], '珠浦北路', 'minor'); RE('JCN', 'JCE', [], '環島北路', 'minor');
RE('JCE', 'UNI', [], '環島北路'); RE('UNI', 'A1', [], '大學路', 'minor'); RE('UNI', 'JN', [], '環島北路'); RE('JN', 'QL', [[24.4540, 118.3480], [24.4562, 118.3620]], '環島北路'); RE('QL', 'ZL', [], '環島北路'); RE('ZL', 'DM', [], '環島北路'); RE('DM', 'SM', [], '環島北路');
RE('JCE', 'PS', [[24.4393, 118.3342], [24.4420, 118.3450]], '伯玉路'); RE('PS', 'QL', [], '伯玉路'); RE('QL', 'XJ', [], '伯玉路'); RE('XJ', 'SW', [[24.4500, 118.4020]], '伯玉路');
RE('JCS', 'WN', [], '環島南路'); RE('WN', 'WF', [], '桃園路'); RE('WF', 'AP', [[24.4338, 118.3520]], '環島南路'); RE('AP', 'SY', [], '環島南路'); RE('SY', 'CG', [], '環島南路'); RE('CG', 'SWS', [[24.4372, 118.4010]], '環島南路'); RE('SWS', 'SW', [], '中正路', 'minor'); RE('SW', 'SWE', [], '復興路', 'minor'); RE('SWE', 'SWS', [], '黃海路', 'minor');
RE('QL', 'SY', [[24.4460, 118.3720]], '瓊徑路'); RE('UNI', 'HX', [[24.4500, 118.3150]], '慈湖路'); RE('HX', 'T', [], '金門大橋引道'); RE('T', 'U', [], '金門大橋', 'bridge'); RE('HX', 'CD', [], '慈堤'); RE('CD', 'NS', [], '慈湖路'); RE('NS', 'BS', [], '古寧路'); RE('NS', 'GN', [], '古寧路'); RE('GN', 'ANQ', [], '頂林路'); RE('ANQ', 'JN', [], '頂林路');
RE('JCS', 'JG', [], '賢城路'); RE('JG', 'JMC', [[24.4150, 118.3160]], '西海路'); RE('JMC', 'ST', [], '西海路'); RE('ST', 'STP', [], '西海路'); RE('JCW', 'STP', [[24.4265, 118.3030]], '西海路'); RE('JMC', 'GG', [], '古崗路'); RE('GG', 'ZS', [], '翟山路');
RE('SW', 'TH', [[24.4432, 118.4220]], '太湖路'); RE('TH', 'LL', [[24.4345, 118.4300]], '復國墩路'); RE('SWS', 'LL', [[24.4320, 118.4190]], '黃海路'); RE('TH', 'EA', [], '環島東路'); RE('EA', 'YZ', [[24.4700, 118.4380]], '環島東路'); RE('YZ', 'SM', [], '環島東路');
RE('SM', 'SMO', [], '沙美老街', 'minor'); RE('SM', 'SH', [[24.4985, 118.4290]], '陽沙路'); RE('SH', 'GA', [], '獅山路'); RE('GA', 'MS', [], '馬山路'); RE('SM', 'MS', [[24.5032, 118.4087]], '馬山路');
RE('U', 'HT', [], '烈嶼環島路'); RE('HT', 'DL', [[24.4365, 118.2520]], '烈嶼中路'); RE('HT', 'JG9', [], '九宮路'); RE('JG9', 'DL', [[24.4296, 118.2540]], '八青路'); RE('DL', 'HJ', [[24.4375, 118.2372]], '湖井頭路'); RE('HJ', 'HC', [], '烈嶼環島北路'); RE('HC', 'HT', [], '烈嶼環島北路'); RE('DL', 'QQ', [], '青岐路');
} else buildOsmGraph();
/* 真實路網：OpenStreetMap 的主次要道路＋產業道路；舊節點代號（JC、SM…）對應到最近的真實路口 */
function buildOsmGraph() {
  const D = OSM_ROADS, ids = D.n.map((p, i) => { const id = 'o' + i; roadNodes[id] = { id, x: p[0], z: p[1], y: 0, edges: [] }; return id; });
  for (const [a, b, c, ni, m] of D.e) { const mids = []; for (let k = 0; k < m.length; k += 2) mids.push([m[k] / KM, -m[k + 1] / KM]); roadEdges.push({ id: roadEdges.length, a: roadNodes[ids[a]], b: roadNodes[ids[b]], mids, name: D.names[ni] || (c === 2 ? '產業道路' : '鄉道'), type: c === 2 ? 'minor' : 'major', hw: c === 0 ? 5.5 : c === 1 ? 4.6 : 3.6, bridge: false, cls: c }); }
  const nearest = (x, z, ok) => { let best = null, bd = 1e18; for (const id of ids) { const n = roadNodes[id]; const d = (n.x - x) ** 2 + (n.z - z) ** 2; if (d < bd && (!ok || ok(n))) { bd = d; best = n; } } return best; };
  RN('T', NODES.T[0], NODES.T[1]); RN('U', NODES.U[0], NODES.U[1]);
  const T = roadNodes.T, U = roadNodes.U, tn = nearest(T.x, T.z, n => n.x > T.x - 5), un = nearest(U.x, U.z, n => n.x < U.x + 5);
  const link = (a, b, name) => roadEdges.push({ id: roadEdges.length, a, b, mids: [], name, type: 'major', hw: 5.5, bridge: false, cls: 0 });
  link(tn, T, '金烈大道'); roadEdges.push({ id: roadEdges.length, a: T, b: U, mids: [], name: '金門大橋', type: 'bridge', hw: 6, bridge: true }); link(U, un, '金烈大道');
  for (const id in NODES) { if (id === 'T' || id === 'U') continue; const w = GW(NODES[id][0], NODES[id][1]), n = nearest(w.x, w.z); Object.defineProperty(roadNodes, id, { value: n, enumerable: false, configurable: true }); }
}

const TOWNS = [['金城', 24.4338, 118.3200, 0.6, 'city'], ['金門大學', 24.4476, 118.3229, 0.45, 'campus'], ['山外', 24.4415, 118.4148, 0.5, 'city'], ['沙美', 24.4892, 118.4128, 0.42, 'old'], ['頂堡', 24.4508, 118.3348, 0.3, 'city'], ['東林', 24.4318, 118.2440, 0.36, 'city'], ['陽翟', 24.4794, 118.4273, 0.22, 'old'],
  ['水頭', 24.4100, 118.2990, 0.38, 'village'], ['水頭碼頭', 24.4150, 118.2892, 0.25, 'park'], ['瓊林', 24.4550, 118.3738, 0.38, 'village'], ['山后', 24.5030, 118.4395, 0.32, 'village'], ['古寧頭', 24.4773, 118.3085, 0.4, 'village'], ['北山', 24.4862, 118.3052, 0.25, 'village'], ['莒光樓', 24.4252, 118.3200, 0.28, 'park'], ['尚義機場', 24.4354, 118.3606, 0.35, 'park'], ['料羅', 24.4268, 118.4268, 0.3, 'village'], ['金門城', 24.4042, 118.3096, 0.3, 'village'], ['后頭', 24.4402, 118.2601, 0.25, 'village'], ['九宮', 24.4268, 118.2632, 0.25, 'park'], ['馬山', 24.5262, 118.4094, 0.25, 'park'], ['湖井頭', 24.4458, 118.2325, 0.22, 'park'], ['安岐', 24.4654, 118.3272, 0.22, 'village'], ['成功', 24.4368, 118.3885, 0.25, 'village'], ['酒廠', 24.4325, 118.3436, 0.25, 'park']]
  .map((t, i) => ({ i, name: t[0], ...GW(t[1], t[2]), r: t[3] * KM, style: t[4] }));
const SITES = [[24.4478, 118.3229, 150], [24.4338, 118.3198, 105], [24.42491, 118.31902, 60], [24.4336, 118.3436, 70], [24.4100, 118.2990, 60], [24.4150, 118.2892, 50], [24.4415, 118.4148, 90], [24.4892, 118.4128, 70], [24.5040, 118.4408, 70], [24.43722, 118.39008, 45], [24.4840, 118.3205, 50], [24.5270, 118.4090, 40], [24.4550, 118.3738, 60], [24.4318, 118.2440, 60], [24.4508, 118.3348, 50], [24.4773, 118.3085, 50]].map(s => [...G(s[0], s[1]), s[2]]);
const RUNWAY = { ...GW(24.4300, 118.3592), len: 380, wid: 30, rot: 0.468 }; RUNWAY.ux = Math.cos(RUNWAY.rot); RUNWAY.uz = -Math.sin(RUNWAY.rot); RUNWAY.vx = -Math.sin(RUNWAY.rot); RUNWAY.vz = -Math.cos(RUNWAY.rot); // u：跑道方向；v：朝北（航廈側）
const APW = (u, v) => ({ x: RUNWAY.x + RUNWAY.ux * u + RUNWAY.vx * v, z: RUNWAY.z + RUNWAY.uz * u + RUNWAY.vz * v });
let bridgeEdge = null;
const ROADCELL = 30, roadHash = new Map();
const rkey = (x, z) => (Math.floor(x / ROADCELL) + 400) * 2000 + Math.floor(z / ROADCELL) + 400;

function buildRoadData() {
  for (const s of SITES) flattenDisc(s[0] * KM, -s[1] * KM, s[2]); carveLakes('金大池塘'); // 校園整平後再把池塘挖回來
  { const t = Math.max(2.2, flattenDisc(RUNWAY.x, RUNWAY.z, 70)); for (let k = -4; k <= 4; k++) { const p = APW(k * 48, 0); flattenDisc(p.x, p.z, 60, t); } for (let k = -2; k <= 2; k++) { const p = APW(k * 45, 42); flattenDisc(p.x, p.z, 52, t); } RUNWAY.y = t; }
  for (const id in roadNodes) { const n = roadNodes[id]; n.y = Math.max(1.2, groundAt(n.x, n.z)); }
  for (const e of roadEdges) {
    const cp = [new V3(e.a.x, 0, e.a.z), ...e.mids.map(m => new V3(m[0] * KM, 0, -m[1] * KM)), new V3(e.b.x, 0, e.b.z)];
    const curve = new THREE.CatmullRomCurve3(cp, false, 'centripetal'); const L = curve.getLength(), n = Math.max(2, Math.ceil(L / 5));
    const sp = curve.getSpacedPoints(n); e.len = L; e.step = L / n;
    e.pts = sp.map((v, i) => { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n, i + 1)]; const tl = Math.hypot(b.x - a.x, b.z - a.z) || 1; return { x: v.x, z: v.z, y: 0, tx: (b.x - a.x) / tl, tz: (b.z - a.z) / tl, town: -1 }; });
    e.a.edges.push(e); e.b.edges.push(e);
    if (e.bridge) { bridgeEdge = e; e.pts.forEach((p, i) => { const t = i / n; p.y = lerp(e.a.y, e.b.y, t) + 15 * smooth(0, 0.2, t) * smooth(1, 0.8, t); }); continue; }
    const ys = e.pts.map(p => Math.max(1.2, groundAt(p.x, p.z))); ys[0] = e.a.y; ys[n] = e.b.y;
    for (let pass = 0; pass < 10; pass++) for (let i = 1; i < n; i++) ys[i] = (ys[i - 1] + 2 * ys[i] + ys[i + 1]) / 4;
    { const g = 0.13 * e.step; for (let it = 0; it < 40; it++) { let ch = 0; for (let i = 1; i < n; i++) { const v = clamp(ys[i], ys[i - 1] - g, ys[i - 1] + g); ch += Math.abs(v - ys[i]); ys[i] = v; } for (let i = n - 1; i > 0; i--) { const v = clamp(ys[i], ys[i + 1] - g, ys[i + 1] + g); ch += Math.abs(v - ys[i]); ys[i] = v; } if (ch < 0.01) break; } for (let pass = 0; pass < 3; pass++) for (let i = 1; i < n; i++) ys[i] = (ys[i - 1] + 2 * ys[i] + ys[i + 1]) / 4; }
    e.pts.forEach((p, i) => p.y = ys[i]);
  }
  // 把路面底下的地形整平
  const Wt = new Float32Array(NX * NZ), Ht = new Float32Array(NX * NZ);
  for (const e of roadEdges) { const R = e.hw + 11, inner = e.hw + 3;
    for (let pi = 0; pi < e.pts.length; pi++) { const p = e.pts[pi]; if (e.bridge && pi > 5 && pi < e.pts.length - 6) continue; const i0 = Math.max(0, Math.floor((p.x - R - TX0) / CELL)), i1 = Math.min(NX - 1, Math.ceil((p.x + R - TX0) / CELL)), j0 = Math.max(0, Math.floor((p.z - R - TZ0) / CELL)), j1 = Math.min(NZ - 1, Math.ceil((p.z + R - TZ0) / CELL));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const d = Math.hypot(TX0 + i * CELL - p.x, TZ0 + j * CELL - p.z); if (d >= R) continue; const w = smooth(R, inner, d), k = j * NX + i; if (w > Wt[k]) { Wt[k] = w; Ht[k] = p.y; } } } }
  for (let k = 0; k < NX * NZ; k++) if (Wt[k] > 0) HT[k] = lerp(HT[k], Ht[k], Wt[k]);
  for (const e of roadEdges) {
    e.pts.forEach((p, i) => {
      if (!e.bridge) { const rx = -p.tz, rz = p.tx; p.y = Math.max(groundAt(p.x, p.z), groundAt(p.x + rx * e.hw, p.z + rz * e.hw), groundAt(p.x - rx * e.hw, p.z - rz * e.hw)); }
      for (const t of TOWNS) if (Math.hypot(p.x - t.x, p.z - t.z) < t.r) { p.town = t.i; break; }
      const s = { e, i }; roadSamples.push(s); if (p.town >= 0 && !e.bridge) townSamples.push(s);
      const k = rkey(p.x, p.z); let a = roadHash.get(k); if (!a) roadHash.set(k, a = []); a.push(s);
    });
  }
  for (const id in roadNodes) { const n = roadNodes[id]; n.y = groundAt(n.x, n.z); }
}
function nearestRoad(x, z, R = 60, skipEdge = null) {
  let best = null, bd = R * R; const c = Math.ceil(R / ROADCELL), cx = Math.floor(x / ROADCELL), cz = Math.floor(z / ROADCELL);
  for (let a = cx - c; a <= cx + c; a++) for (let b = cz - c; b <= cz + c; b++) { const arr = roadHash.get((a + 400) * 2000 + b + 400); if (!arr) continue; for (const s of arr) { if (s.e === skipEdge) continue; const p = s.e.pts[s.i], d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z); if (d < bd) { bd = d; best = s; } } }
  return best ? { e: best.e, i: best.i, p: best.e.pts[best.i], dist: Math.sqrt(bd) } : null;
}
function edgePoint(e, s) { const f = clamp(s / e.step, 0, e.pts.length - 1.0001), i = f | 0, t = f - i, a = e.pts[i], b = e.pts[i + 1]; return { x: lerp(a.x, b.x, t), z: lerp(a.z, b.z, t), y: lerp(a.y, b.y, t), tx: lerp(a.tx, b.tx, t), tz: lerp(a.tz, b.tz, t) }; }
function bridgeY(x, z) {
  const e = bridgeEdge; if (!e) return null; const A = e.a, B = e.b;
  if (x < Math.min(A.x, B.x) - 10 || x > Math.max(A.x, B.x) + 10 || z < Math.min(A.z, B.z) - 10 || z > Math.max(A.z, B.z) + 10) return null;
  const ex = B.x - A.x, ez = B.z - A.z, L2 = ex * ex + ez * ez; const t = ((x - A.x) * ex + (z - A.z) * ez) / L2; if (t < 0 || t > 1) return null;
  const lat = Math.abs((x - A.x) * ez - (z - A.z) * ex) / Math.sqrt(L2); if (lat > e.hw + 0.6) return null;
  return edgePoint(e, t * e.len).y;
}
function heightAt(x, z) { let g = groundAt(x, z); const b = bridgeY(x, z); if (b !== null && b > g) g = b; const d = deckY(x, z); if (d !== null && d > g) g = d; return g; }

function buildRoadMeshes() {
  const PA = PHOTO.img.asphalt, RS = PA ? 512 : 256;
  const mk = (center) => canvasTex(RS, RS, (g, W, H) => {
    const w = 256, h = 256; if (PA) { g.drawImage(PA, 0, 0, W, H); g.fillStyle = 'rgba(20,22,26,0.18)'; g.fillRect(0, 0, W, H); g.scale(2, 2); g.globalAlpha = 0.9; } else { g.fillStyle = '#4a4c52'; g.fillRect(0, 0, w, h); }
    if (!PA) for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.07})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.fillStyle = '#e8e6dc'; g.fillRect(12, 0, 5, h); g.fillRect(w - 17, 0, 5, h);
    if (center) { g.fillStyle = '#e0b83c'; g.fillRect(w / 2 - 6, 0, 4, h); g.fillRect(w / 2 + 2, 0, 4, h); }
    else { g.fillStyle = '#e8e6dc'; g.fillRect(w / 2 - 2, 0, 4, h * 0.45); }
  }, true);
  const mMajor = new THREE.MeshStandardMaterial({ map: mk(true), roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const mMinor = new THREE.MeshStandardMaterial({ map: mk(false), roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  if (PA) { for (const m of [mMajor, mMinor]) { m.normalMap = photoTex('asphalt_n', false); m.normalScale = new THREE.Vector2(0.7, 0.7); } }
  const mJ = new THREE.MeshStandardMaterial({ color: PA ? 0xd2d2d0 : 0x4a4c52, map: PA ? photoTex('asphalt') : null, normalMap: PA ? photoTex('asphalt_n', false) : null, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 });
  for (const e of roadEdges) {
    const n = e.pts.length, pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = []; const off = e.bridge ? 0.02 : 0.09 + (e.id % 4) * 0.012;
    e.pts.forEach((p, i) => { const rx = -p.tz, rz = p.tx; pos.set([p.x - rx * e.hw, p.y + off, p.z - rz * e.hw, p.x + rx * e.hw, p.y + off, p.z + rz * e.hw], i * 6); uv.set([0, i * e.step / 14, 1, i * e.step / 14], i * 4); if (i < n - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    // 依區塊合併成少數幾個網格（原本一條路一個 draw call）
    const mid = e.pts[n >> 1], key = (e.type === 'minor' ? 'n' : 'j') + Math.floor(mid.x / 600) + ',' + Math.floor(mid.z / 600); let ch = RCH.get(key); if (!ch) RCH.set(key, ch = { mat: e.type === 'minor' ? mMinor : mMajor, gs: [], es: [] }); ch.gs.push(g); ch.es.push(e);
  }
  for (const ch of RCH.values()) { const m = new THREE.Mesh(mergeIdx(ch.gs), ch.mat); m.receiveShadow = true; scene.add(m); for (const e of ch.es) e.mesh = m; }
  const disc = new THREE.CircleGeometry(1, 28); disc.rotateX(-Math.PI / 2); const dch = new Map();
  for (const id in roadNodes) { const n = roadNodes[id]; if (n.edges.length < 2 && id !== 'A1' && id !== 'MF' && id !== 'SMO') continue; const hw = Math.max(...n.edges.map(e => e.hw)); const g = disc.clone(); g.scale(hw * 1.18, 1, hw * 1.18); g.translate(n.x, n.y + 0.16, n.z); { const P = g.attributes.position, U = g.attributes.uv; for (let i = 0; i < P.count; i++) U.setXY(i, P.getX(i) / 9, P.getZ(i) / 9); } const key = Math.floor(n.x / 600) + ',' + Math.floor(n.z / 600); let a = dch.get(key); if (!a) dch.set(key, a = []); a.push(g); }
  for (const a of dch.values()) { const m = new THREE.Mesh(mergeIdx(a), mJ); m.receiveShadow = true; scene.add(m); }
}
const RCH = new Map();
function mergeIdx(gs) { // 合併同材質的有索引幾何（位置、法線、UV）
  let nv = 0, ni = 0; for (const g of gs) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = new Uint32Array(ni); let ov = 0, oi = 0;
  for (const g of gs) { const c = g.attributes.position.count; pos.set(g.attributes.position.array, ov * 3); if (g.attributes.normal) nor.set(g.attributes.normal.array, ov * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, ov * 2); const ix = g.index ? g.index.array : null; const m = ix ? ix.length : c; for (let k = 0; k < m; k++) idx[oi + k] = (ix ? ix[k] : k) + ov; ov += c; oi += m; g.dispose(); }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.BufferAttribute(pos, 3)); r.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); r.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); r.setIndex(new THREE.BufferAttribute(idx, 1)); r.computeBoundingSphere(); return r;
}
