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
