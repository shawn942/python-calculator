/* =====================================================================
   市區填滿：lineTown 只沿路蓋一排店屋，鎮上會剩很多空草地。這裡在市鎮範圍內把
   後排與空地補上公寓和店屋，面向最近的馬路，讓金城、山外、沙美像真的市街。
   不蓋在路上、水裡、陡坡、任務點與停車位旁；?noinfill 可關閉。
   ===================================================================== */
const INFILL = { on: !/noinfill/.test(location.search), n: 0 };
function townInfill() {
  if (!INFILL.on) return; const keep = []; for (const k in missionSpots) { const m = missionSpots[k]; if (m && typeof m.x === 'number') keep.push([m.x, m.z, 15]); } for (const p of PARKED) keep.push([p[1], p[2], 7]); for (const l of lions) if (l && typeof l.x === 'number') keep.push([l.x, l.z, 6]);
  const tints = ['#ffffff', '#f3ead8', '#e9e4da', '#f6efe6', '#dfe4e6'].map(c => new THREE.Color(c));
  for (const t of TOWNS) { if (t.style !== 'city' && t.style !== 'old') continue; const R = t.r * 1.08, step = 10.4;
    for (let gx = -R; gx <= R; gx += step) for (let gz = -R; gz <= R; gz += step) { if (gx * gx + gz * gz > R * R) continue; const x = t.x + gx + rr(-1.3, 1.3), z = t.z + gz + rr(-1.3, 1.3);
      const n = nearestRoad(x, z, 44); if (!n || n.e.bridge || n.dist < n.e.hw + 6.2) continue; if (groundAt(x, z) < 1.2 || sdAt(x, z) < 30 || inLake(x, z, 8)) continue;
      const rot = Math.atan2(n.p.x - x, n.p.z - z), w = rr(8.4, 9.8), d = rr(7.8, 9.2); if (!footClear(x, z, rot, w + 1.5, d + 1.5, 1.6) || !boxFree(x, z, Math.max(w, d) * 0.66)) continue; if (keep.some(k => Math.hypot(k[0] - x, k[1] - z) < k[2] + 5)) continue;
      if (typeof treeNear === 'function') for (const tr of treeNear(x, z, 7)) dropTree(tr);
      if (t.style === 'city' && rand() < 0.62) { // 公寓：3～5 樓，屋頂有樓梯間和水塔
        const fl = 3 + Math.floor(rand() * 3), y = minGround(x, z, w, d, rot) - 0.25, H = fl * 3.3, c = Math.cos(rot), s = Math.sin(rot); BT.cbox.add(MX(x, y - 1.2, z, rot, w + 0.3, 1.5, d + 0.3), COL.slab);
        BT[fl <= 3 ? 'fac33' : 'fac34'].add(MX(x, y + 0.3, z, rot, w, H, d), pick(tints)); BT.cbox.add(MX(x, y + 0.3 + H, z, rot, w + 0.5, 0.45, d + 0.5), COL.slab);
        const ox = rr(-1.5, 1.5), oz = rr(-1.2, 1.2); BT.cbox.add(MX(x + ox * c + oz * s, y + 0.75 + H, z - ox * s + oz * c, rot, 3, 2.4, 2.6), COL.slab); BT.ccyl.add(MX(x + (ox + 2.6) * c + oz * s, y + 0.75 + H, z - (ox + 2.6) * s + oz * c, 0, 0.75, 1.7, 0.75), new THREE.Color('#b9bec2'));
        addBox(x, z, w / 2, d / 2, rot); }
      else shophouse(x, z, rot, w, d, rand() < 0.3 ? 3 : 2, t.style === 'old' || rand() < 0.5 ? 'old' : 'city');
      INFILL.n++; } }
}
/* 路邊成排的機車（台灣街景的招牌）：純裝飾、不能騎、沒有碰撞，遠了自動不畫 */
function townScooters() {
  if (!INFILL.on) return; const Rz = new THREE.Matrix4().makeRotationZ(Math.PI / 2), T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z);
  const geo = mergeGeos([[PG.box(0.34, 0.2, 1.2), '#ffffff', T(0, 0.4, 0)], [PG.box(0.34, 0.3, 0.62), '#ffffff', T(0, 0.6, -0.34)], [PG.box(0.3, 0.09, 0.64), '#1c1c1c', T(0, 0.8, -0.3)], [PG.box(0.36, 0.62, 0.1), '#ffffff', _PM(0, 0.72, 0.42, -0.25)], [PG.box(0.6, 0.05, 0.06), '#222222', T(0, 1.05, 0.34)], [PG.box(0.16, 0.1, 0.05), '#fff6c8', T(0, 0.93, 0.5)], [PG.box(0.14, 0.07, 0.04), '#c0241c', T(0, 0.7, -0.66)],
    [PG.cyl(0.26, 0.26, 0.11, 10), '#1a1a1a', T(0, 0.26, 0.6).multiply(Rz)], [PG.cyl(0.26, 0.26, 0.12, 10), '#1a1a1a', T(0, 0.26, -0.6).multiply(Rz)]]);
  batch('pscoot', geo, mVC, false); const cols = ['#d9d9d6', '#b3312c', '#27496d', '#3a3f48', '#e0c040', '#5a8f6a', '#f08a3c', '#ffffff', '#8a8f96'].map(c => new THREE.Color(c)); let n = 0;
  for (const e of roadEdges) { if (e.bridge || e.tunnel) continue; let nextI = 3 + Math.floor(rand() * 5);
    for (let i = 3; i < e.pts.length - 3; i++) { const p = e.pts[i]; if (p.town < 0 || i < nextI) continue; const t = TOWNS[p.town]; if (t.style !== 'city' && t.style !== 'old') continue; nextI = i + 4 + Math.floor(rand() * 6);
      const s = rand() < 0.5 ? 1 : -1, nx = -p.tz * s, nz = p.tx * s, cnt = 3 + Math.floor(rand() * 5), off = e.hw + 2.2, yaw = Math.atan2(-nx, -nz) + rr(-0.12, 0.12);
      for (let k = 0; k < cnt; k++) { const a = (k - (cnt - 1) / 2) * 0.78, x = p.x + nx * off + p.tx * a, z = p.z + nz * off + p.tz * a; if (!roadClear(x, z, 0.9, e) || !boxFree(x, z, 0.8) || (typeof doorClear === 'function' && !doorClear(x, z)) || PARKED.some(q => Math.hypot(q[1] - x, q[2] - z) < 3.5)) continue;
        BT.pscoot.add(MX(x, groundAt(x, z), z, yaw + rr(-0.08, 0.08) + 0.3, 1, 1, 1), pick(cols)); n++; if (k === 2 && !INFILL.sample) INFILL.sample = [x, z, nx, nz]; } } }
  INFILL.scooters = n;
}
