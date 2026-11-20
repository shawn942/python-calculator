/* =====================================================================
   道路設施：紅綠燈（AI 車輛會停紅燈）、路名牌、圓環中島
   ===================================================================== */
const TL = { nodes: [], mats: null, cycle: 26, phase: -1 };
const doorClear = (x, z, r = 3) => rooms.every(m => !m.out || Math.hypot(m.out.x - x, m.out.z - z) > r);
function tlState(g) { // 0 綠 1 黃 2 紅
  const t = (game.time || 0) % TL.cycle, h = TL.cycle / 2, u = g ? (t + h) % TL.cycle : t;
  return u < h - 3 ? 0 : u < h - 0.5 ? 1 : 2;
}
function edgeDirAt(e, n) { const pts = e.pts, k = Math.min(3, pts.length - 1), p = e.a === n ? pts[k] : pts[pts.length - 1 - k]; const dx = p.x - n.x, dz = p.z - n.z, l = Math.hypot(dx, dz) || 1; return { x: dx / l, z: dz / l }; }
function buildRoadFurniture() {
  if (!USE_OSM) return;
  const poles = [], heads = [[], [], [], []]; // A紅 A綠 B紅 B綠
  const inTown = n => TOWNS.some(t => (t.style === 'city' || t.style === 'old' || t.style === 'campus') && Math.hypot(t.x - n.x, t.z - n.z) < t.r * 1.25);
  for (const id in roadNodes) {
    const n = roadNodes[id], maj = n.edges.filter(e => !e.bridge && e.cls !== undefined && e.cls < 2);
    if (maj.length < 3 || n.edges.length > 5 || !inTown(n) || n.rbR) continue;
    if (TL.nodes.some(o => Math.hypot(o.x - n.x, o.z - n.z) < 40)) continue;
    const d0 = edgeDirAt(maj[0], n), grp = new Map(); const hwN = Math.max(...n.edges.map(e => e.hw)) * 1.18;
    for (const e of n.edges) { const d = edgeDirAt(e, n), g = Math.abs(d.x * d0.x + d.z * d0.z) > 0.7 ? 0 : 1; grp.set(e, g);
      const rx = -d.z, rz = d.x; let x = n.x + d.x * (hwN + 1.6) + rx * (e.hw + 1.4), z = n.z + d.z * (hwN + 1.6) + rz * (e.hw + 1.4);
      { let ok = roadClear(x, z, 0.4); for (let k = 1; k <= 5 && !ok; k++) for (const [a, b] of [[k * 2, 0], [0, k * 1.5], [k * 2, k * 1.5]]) { const qx = x + d.x * a + rx * b, qz = z + d.z * a + rz * b; if (roadClear(qx, qz, 0.4)) { x = qx; z = qz; ok = true; break; } } if (!ok) continue; } // 燈桿不可立在別條路的路面上
      if (sdAt(x, z) < 4 || !doorClear(x, z)) continue; const y = groundAt(x, z), rot = Math.atan2(d.x, d.z);
      const M = (px, py, pz) => new THREE.Matrix4().compose(new V3(px, py, pz), new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), rot), new V3(1, 1, 1));
      poles.push([new THREE.CylinderGeometry(0.12, 0.15, 5.2, 6).translate(0, 2.6, 0), '#5d6166', M(x, y, z)]);
      const hx = x - rx * 0.0, hz = z - rz * 0.0; // 燈箱在柱頂、朝向來車
      poles.push([new THREE.BoxGeometry(0.55, 1.3, 0.4).translate(0, 4.6, 0), '#1d1f22', M(hx, y, hz)]);
      for (const yy of [5.0, 4.2]) poles.push([new THREE.BoxGeometry(0.5, 0.05, 0.3).translate(0, yy + 0.2, 0.33), '#1d1f22', M(hx, y, hz)]); poles.push([new THREE.BoxGeometry(0.72, 1.5, 0.04).translate(0, 4.6, -0.22), '#2a2c30', M(hx, y, hz)]);
      heads[g * 2].push([new THREE.SphereGeometry(0.17, 8, 6).translate(0, 5.0, 0.22), '#ffffff', M(hx, y, hz)]);
      heads[g * 2 + 1].push([new THREE.SphereGeometry(0.17, 8, 6).translate(0, 4.2, 0.22), '#ffffff', M(hx, y, hz)]);
      if (e.cls !== undefined) addBox(x, z, 0.2, 0.2, 0);
    }
    n.tl = grp; TL.nodes.push(n);
  }
  if (TL.nodes.length) {
    const pm = new THREE.Mesh(mergeGeos(poles), mVC); pm.castShadow = true; scene.add(pm);
    TL.mats = heads.map((h, i) => { const m = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: i % 2 ? 0x22ff66 : 0xff2a1a, emissiveIntensity: 0, roughness: 0.4 }); if (h.length) scene.add(new THREE.Mesh(mergeGeos(h), m)); return m; });
  }
  // 路名牌：每條有名字的主要道路放 1～2 面（綠底白字）
  const done = new Map(); let cnt = 0; const sp = []; TL.sg = TL.sg || [];
  for (const e of [...roadEdges].sort((a, b) => b.len - a.len)) {
    if (e.bridge || e.cls === 2 || !e.name || /道路$|鄉道/.test(e.name) || e.len < 90 || cnt > 70) continue;
    const k = done.get(e.name) || 0; if (k >= 1) continue;
    const i = Math.floor(e.pts.length * (k ? 0.75 : 0.3)), p = e.pts[i]; const rx = -p.tz, rz = p.tx, x = p.x + rx * (e.hw + 2.2), z = p.z + rz * (e.hw + 2.2);
    if (!roadClear(x, z, 1, e) || !boxFree(x, z, 1) || sdAt(x, z) < 6 || !doorClear(x, z)) continue;
    const y = groundAt(x, z), rot = Math.atan2(p.tx, p.tz) + Math.PI / 2;
    sp.push([new THREE.CylinderGeometry(0.09, 0.09, 3.4, 6), '#8a8f94', new THREE.Matrix4().makeTranslation(x, y + 1.7, z)]);
    const s = signMesh(e.name, 0.7, { bg: '#0f6b3a', color: '#ffffff', size: 64, pad: 14 }); s.position.set(x, y + 3.2, z); s.rotation.y = rot; scene.add(s);
    const s2 = s.clone(); s2.rotation.y = rot + Math.PI; s2.position.set(x, y + 3.2, z); scene.add(s2); s.visible = s2.visible = false; TL.sg.push([s, s2, x, z]);
    addBox(x, z, 0.2, 0.2, 0); done.set(e.name, k + 1); cnt++;
  }
  if (sp.length) scene.add(new THREE.Mesh(mergeGeos(sp), mVC));
  TL.signs = cnt;
}
function updateTrafficLights() {
  if (TL.sg && (TL.fc = (TL.fc || 0) + 1) % 6 === 1) { const c = camera.position; const R = Q.peds < 22 ? 80 : 170; for (const q of TL.sg) q[0].visible = q[1].visible = Math.abs(q[2] - c.x) < R && Math.abs(q[3] - c.z) < R; }
  if (!TL.mats) return; const sA = tlState(0), sB = tlState(1), key = sA * 3 + sB; if (key === TL.phase) return; TL.phase = key;
  const set = (m, on, col) => { m.emissiveIntensity = on ? 2.2 : 0; if (col) m.emissive.set(col); };
  set(TL.mats[0], sA === 2); set(TL.mats[1], sA < 2, sA === 1 ? 0xffb000 : 0x22ff66);
  set(TL.mats[2], sB === 2); set(TL.mats[3], sB < 2, sB === 1 ? 0xffb000 : 0x22ff66);
}
function tlStop(a, v) { // 給 updateTraffic 用：前方路口紅燈就回傳要停的速度上限
  const node = a.dir > 0 ? a.e.b : a.e.a; if (!node.tl) return Infinity; const g = node.tl.get(a.e); if (g === undefined) return Infinity;
  const st = tlState(g), dist = a.dir > 0 ? a.e.len - a.s : a.s, stopAt = Math.max(...node.edges.map(e => e.hw)) * 1.18 + 2.5;
  if (st === 0 || dist < stopAt - 0.5 || dist > stopAt + 16 + v.speed) return Infinity; if (st === 1 && dist < stopAt + 4) return Infinity;
  return Math.max(0, (dist - stopAt) * 1.1);
}

/* 村名石碑：每個自然村在最近的道路旁立一塊（花崗岩底座＋紅字），遠了就隱藏文字 */
function buildVillageSteles() {
  if (typeof VNAMES === 'undefined' || !VNAMES.length) return; TL.sg = TL.sg || []; let n = 0;
  for (const v of VNAMES) {
    const r = nearestRoad(v.x, v.z, 70); if (!r) continue; const e = r.e, p = e.pts[clamp(r.i, 0, e.pts.length - 1)];
    let ok = false, x = 0, z = 0;
    for (const sd of [1, -1]) { const rx = -p.tz * sd, rz = p.tx * sd; x = p.x + rx * (e.hw + 2.6); z = p.z + rz * (e.hw + 2.6); if (sdAt(x, z) > 8 && roadClear(x, z, 1.2) && boxFree(x, z, 1.4)) { ok = true; break; } }
    if (!ok) continue; const y = groundAt(x, z) - 0.15, rot = Math.atan2(p.tx, p.tz) + Math.PI / 2;
    BT.cbox.add(MX(x, y, z, rot, 2.6, 0.5, 1.2), COL.stone); BT.cbox.add(MX(x, y + 0.5, z, rot, 1.9, 2.3, 0.55), new THREE.Color('#b9b2a4'));
    const s = signMesh(v.nm, 1.75, { color: '#b3261e', size: 96, pad: 8, vertical: true }); s.position.set(x + Math.sin(rot) * 0.29, y + 1.65, z + Math.cos(rot) * 0.29); s.rotation.y = rot; scene.add(s);
    const s2 = s.clone(); s2.position.set(x - Math.sin(rot) * 0.29, y + 1.65, z - Math.cos(rot) * 0.29); s2.rotation.y = rot + Math.PI; scene.add(s2);
    s.visible = s2.visible = false; TL.sg.push([s, s2, x, z, rot]); addBox(x, z, 1.1, 0.4, rot); n++;
  }
  TL.steles = n;
}

/* 公車：依 OpenStreetMap 的真實公車路線（2、3、12、15、15A、15B、35、36、37、38 路）行駛，靠真實站牌停靠 */
const BUSR = { routes: [], stops: [], t: 0, signs: new Map() };
function edgeBetween(a, b) { return a.edges.find(e => (e.a === a && e.b === b) || (e.b === a && e.a === b)); }
function linkPath(a, b) { // 路網上兩節點間沒有直接相連時（例如經過金門大橋），用 BFS 補上中間的邊
  const prev = new Map([[a, null]]), q = [a];
  while (q.length) { const u = q.shift(); if (u === b) break; if (prev.size > 400) break; for (const e of u.edges) { const v = e.a === u ? e.b : e.a; if (!prev.has(v)) { prev.set(v, u); q.push(v); } } }
  if (!prev.has(b)) return null; const p = [b]; while (p[p.length - 1] !== a) p.push(prev.get(p[p.length - 1])); return p.reverse();
}
function buildBusRoutes() {
  if (typeof OSM_BUS === 'undefined' || !USE_OSM) return; TL.sg = TL.sg || [];
  for (const r of OSM_BUS) {
    const ns = []; for (const i of r.path) { const n = roadNodes['o' + i]; if (!n) continue; if (!ns.length) { ns.push(n); continue; } const last = ns[ns.length - 1]; if (n === last) continue; if (edgeBetween(last, n)) ns.push(n); else { const lp = linkPath(last, n); if (lp && lp.length < 12) ns.push(...lp.slice(1)); } }
    const edges = []; for (let i = 1; i < ns.length; i++) { const e = edgeBetween(ns[i - 1], ns[i]); if (e) edges.push(e); }
    if (edges.length < 3) continue; BUSR.routes.push({ ref: r.ref, name: r.name, nodes: ns, edges, stops: r.stops.map(s => ({ name: s[1], x: s[2], z: s[3] })) });
  }
  // 真實站牌（同名只放一個）：站牌柱＋站名，可在這裡搭公車
  const seen = []; const poles = [];
  for (const R of BUSR.routes) for (const s of R.stops) {
    if (!s.name || seen.some(o => o.name === s.name && Math.hypot(o.x - s.x, o.z - s.z) < 60)) continue;
    const nr = nearestRoad(s.x, s.z, 25); if (!nr) continue; const e = nr.e, p = nr.p; let x = 0, z = 0, ok = false;
    for (const sd of [1, -1]) { x = p.x - p.tz * sd * (e.hw + 1.6); z = p.z + p.tx * sd * (e.hw + 1.6); if (roadClear(x, z, 0.5) && boxFree(x, z, 0.7) && sdAt(x, z) > 4 && doorClear(x, z)) { ok = true; break; } }
    if (!ok) continue; const y = groundAt(x, z), rot = Math.atan2(p.tx, p.tz) + Math.PI / 2;
    poles.push([new THREE.CylinderGeometry(0.07, 0.07, 2.7, 6), '#7a7f86', new THREE.Matrix4().makeTranslation(x, y + 1.35, z)]);
    poles.push([new THREE.BoxGeometry(0.7, 0.7, 0.06), '#1f6f3f', new THREE.Matrix4().makeTranslation(x, y + 2.6, z)]);
    const sg = signMesh('🚌 ' + s.name, 0.36, { color: '#fff', bg: '#1f6f3f', size: 44, pad: 6 }); sg.position.set(x, y + 2.1, z); sg.rotation.y = rot; scene.add(sg); const sg2 = sg.clone(); sg2.rotation.y = rot + Math.PI; scene.add(sg2);
    sg.visible = sg2.visible = false; TL.sg.push([sg, sg2, x, z]);
    const st = { name: s.name, x, z, real: true }; seen.push(st); BUSR.stops.push(st);
    addAction({ x, z, r: 2.4, inside: null, label: () => `🚌 ${s.name} 搭公車（$12）`, fn: () => busMenu(st) });
  }
  if (poles.length) scene.add(new THREE.Mesh(mergeGeos(poles), mVC));
}
function busFrontSign(ref) { let t = BUSR.signs.get(ref); if (!t) { t = textTex(ref + ' 路', { color: '#ffd23f', bg: '#111', size: 56, pad: 8 }); BUSR.signs.set(ref, t); } const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42 * t.aspect, 0.42), new THREE.MeshBasicMaterial({ map: t.tex })); return m; }
function routeBusTick(dt) {
  if (!BUSR.routes.length || player.plane) return; BUSR.t -= dt; if (BUSR.t > 0) return; BUSR.t = 3;
  if (vehicles.filter(v => v.ai && v.ai.route).length >= 4) return; const pp = wpos(), cp = camera.position;
  const cands = []; for (const R of BUSR.routes) R.edges.forEach((e, k) => { const p = e.pts[e.pts.length >> 1], d = Math.hypot(p.x - pp.x, p.z - pp.z); if (d < 380 && d > 140 && Math.hypot(p.x - cp.x, p.z - cp.z) > 120) cands.push([R, k]); });
  if (!cands.length) return; const [R, k] = pick(cands), e = R.edges[k], rd = rand() < 0.5 ? 1 : -1, i = e.pts.length >> 1, p = e.pts[i];
  for (const o of vehicles) if (Math.hypot(o.pos.x - p.x, o.pos.z - p.z) < 30) return;
  const from = rd > 0 ? R.nodes[k] : R.nodes[k + 1], dir = e.a === from ? 1 : -1;
  const v = makeVehicle('van', p.x, p.z, Math.atan2(p.tx * dir, p.tz * dir)); v.driver = 'ai';
  v.ai = { e, dir, s: i * e.step, cruise: 12 * rr(0.9, 1.05), ox: 0, oz: 0, bvx: 0, bvz: 0, stun: 0, lane: 0.48, route: { R, k, rd, wait: 0, last: null } };
  const P = edgePoint(e, v.ai.s); v.pos.x = P.x - P.tz * dir * e.hw * 0.48; v.pos.z = P.z + P.tx * dir * e.hw * 0.48; v.speed = 8;
  const sg = busFrontSign(R.ref); sg.position.set(0, 2.55, 2.76); v.group.add(sg); const sg2 = sg.clone(); sg2.position.set(0, 2.55, -2.86); sg2.rotation.y = Math.PI; v.group.add(sg2);
}
function routeNext(a, node) { // 公車到路口：照路線走下一段，到終點就折返
  const r = a.route, R = r.R; let k = r.k + r.rd; if (k < 0 || k >= R.edges.length) { r.rd = -r.rd; k = r.k; } r.k = k; const ne = R.edges[k]; if (ne.a !== node && ne.b !== node) return null; return ne;
}
function routeStopCheck(a, v, dt) {
  const r = a.route; if (r.wait > 0) { r.wait -= dt; a.lane = Math.min(0.92, a.lane + dt * 0.5); return 0; } a.lane = Math.max(0.48, a.lane - dt * 0.4);
  const node = a.dir > 0 ? a.e.b : a.e.a, dn = a.dir > 0 ? a.e.len - a.s : a.s, d0 = a.dir > 0 ? a.s : a.e.len - a.s; if (dn < 14 || d0 < 12) return Infinity; // 不停在路口
  for (const s of r.R.stops) { if (s === r.last) continue; if (Math.abs(s.x - v.pos.x) < 9 && Math.abs(s.z - v.pos.z) < 9 && Math.hypot(s.x - v.pos.x, s.z - v.pos.z) < 8) { r.last = s; r.wait = player.bus === v ? 6 : 4.5;
      if (player.bus === v) subtitle(`🚌 <b>${r.R.ref} 路</b>到站：<b>${s.name}</b>　按 <b>E</b> 下車`, 5);
      else if (!player.veh && !player.plane && !player.inside && Math.hypot(player.pos.x - v.pos.x, player.pos.z - v.pos.z) < 16) subtitle(`🚌 <b>${r.R.ref} 路</b>進站（${s.name}）　靠近按 <b>E</b> 上車（$12）`, 5);
      return 0; } }
  return Infinity;
}

/* 搭乘路線公車：公車靠站時靠近按 E 上車，沿真實路線前進，隨時按 E 下車 */
function busBoardable() { if (player.veh || player.plane || player.inside || player.bus) return null; for (const v of vehicles) if (v.ai && v.ai.route && Math.abs(v.speed) < 2 && Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z) < 7.5) return v; return null; }
function busBoard(v) { if (player.money < 12) { toast('錢不夠（車資 $12）'); return; } addMoney(-12); player.bus = v; player.model.group.visible = false; sfx('door', 0.4); v.ai.route.wait = Math.max(v.ai.route.wait, 2.5); subtitle(`🚌 搭上 <b>${v.ai.route.R.ref} 路</b>（${v.ai.route.R.name || ''}）　隨時按 <b>E</b> 下車`, 6); }
function busAlight(msg) { const v = player.bus; if (!v) return; player.bus = null; const f = fwd(v.yaw); let x = v.pos.x + f.z * 2.6, z = v.pos.z - f.x * 2.6; if (!boxFree(x, z, 0.4)) { x = v.pos.x - f.z * 2.6; z = v.pos.z + f.x * 2.6; }
  player.pos.set(x, heightAt(x, z), z); player.yaw = v.yaw; player.model.group.visible = true; player.model.group.position.copy(player.pos); poseWalk(player.model, 0, 0); sfx('door', 0.4); if (msg) toast(msg); if (v.ai && v.ai.route) v.ai.route.wait = Math.max(v.ai.route.wait, 2); }
function updateBusRide(dt) { const v = player.bus; if (!vehicles.includes(v) || !v.ai || !v.ai.route || v.burn) { busAlight('公車停駛，請下車'); return; } player.pos.copy(v.pos); player.yaw = v.yaw; player.spd = 0; player.model.group.visible = false; }

/* 村口牌樓：幾個大聚落在主要進村道路上立一座跨路牌樓（花崗岩柱＋紅瓦燕尾頂＋村名匾） */
const GATE_VILLAGES = ['瓊林', '山后', '珠山', '水頭', '歐厝', '北山', '南山', '陽翟', '碧山', '東林', '青岐', '上林', '西園', '官澳', '湖下', '古崗', '浦邊'];
function buildVillageGates() {
  if (typeof OSM_PLACES === 'undefined' || !USE_OSM) return; TL.sg = TL.sg || []; let n = 0; TL.gates = [];
  for (const nm of GATE_VILLAGES) {
    const pl = OSM_PLACES.find(p => p[0] === nm); if (!pl) continue; const cx = pl[1], cz = pl[2];
    const nr = nearestRoad(cx, cz, 140); if (!nr) continue; const e = nr.e; let best = null;
    for (const step of [-1, 1]) for (let k = 4; k < 16; k++) { const i = nr.i + step * k; if (i < 2 || i > e.pts.length - 3) break; const p = e.pts[i], d = Math.hypot(p.x - cx, p.z - cz); if (d < 28 || d > 90) continue;
      const w = e.hw + 1.1, ok = [-1, 1].every(sd => { const x = p.x - p.tz * sd * w, z = p.z + p.tx * sd * w; return boxFree(x, z, 0.8) && sdAt(x, z) > 6; }); if (ok && (!best || d < best.d)) best = { p, d }; }
    if (!best) continue; const p = best.p, w = e.hw + 1.1, rot = Math.atan2(p.tx, p.tz), y0 = Math.min(groundAt(p.x - p.tz * w, p.z + p.tx * w), groundAt(p.x + p.tz * w, p.z - p.tx * w)) - 0.2, H = 6.4;
    for (const sd of [-1, 1]) { const x = p.x - p.tz * sd * w, z = p.z + p.tx * sd * w; BT.cbox.add(MX(x, y0, z, rot, 1.1, H, 1.1), new THREE.Color('#bdb6a6')); BT.cbox.add(MX(x, y0, z, rot, 1.6, 0.8, 1.6), COL.stone); addBox(x, z, 0.6, 0.6, rot); }
    const span = w * 2 + 1.6; BT.cbox.add(MX(p.x, y0 + H, p.z, rot, span, 1.1, 0.9), new THREE.Color('#a8a092'));
    BT.roof.add(MX(p.x, y0 + H + 1.1, p.z, rot, span + 0.8, 1.4, 2.0), new THREE.Color('#b5462b'));
    BT.ridge.add(MX(p.x, y0 + H + 2.25, p.z, rot, span + 2.2, 0.9, 0.9));
    for (const f of [1, -1]) { const s = signMesh(nm, 0.95, { color: '#ffd23f', bg: '#7a1f17', size: 72, pad: 10 }); s.position.set(p.x + p.tx * 0.52 * f, y0 + H + 0.55, p.z + p.tz * 0.52 * f); s.rotation.y = rot + (f > 0 ? 0 : Math.PI); s.visible = false; scene.add(s); TL.sg.push([s, s, p.x, p.z]); }
    TL.gates.push([nm, +(p.x / KM).toFixed(4), +(-p.z / KM).toFixed(4), +rot.toFixed(3)]); n++;
  }
}

/* 圓環：OSM 標記的 16 個圓環，中央做花台中島，AI 車輛逆時針繞行後從要去的路口出去 */
const RBT = { nodes: [] };
function buildRoundabouts() {
  if (typeof OSM_RB === 'undefined' || !USE_OSM) return; const asph = [], isl = [];
  for (const [nm, x, z] of OSM_RB) {
    let n = null, bd = 64; for (const id in roadNodes) { const q = roadNodes[id], d = (q.x - x) ** 2 + (q.z - z) ** 2; if (d < bd && q.edges.length >= 2) { bd = d; n = q; } } if (!n || n.rbR) continue;
    const hw = Math.max(...n.edges.map(e => e.hw)), R = hw * 0.5 + 5.2, rI = R - hw * 0.5 - 1.6; n.rbR = R; n.rbName = nm; RBT.nodes.push(n);
    asph.push([new THREE.CircleGeometry(R + hw * 0.55 + 0.6, 40).rotateX(-Math.PI / 2), '#4a4d52', new THREE.Matrix4().makeTranslation(n.x, n.y + 0.175, n.z)]);
    isl.push([new THREE.CylinderGeometry(rI + 0.3, rI + 0.4, 0.45, 32), '#c9c4b6', new THREE.Matrix4().makeTranslation(n.x, n.y + 0.2, n.z)]);
    isl.push([new THREE.CylinderGeometry(rI, rI, 0.5, 32), '#5c8a3a', new THREE.Matrix4().makeTranslation(n.x, n.y + 0.25, n.z)]);
    if (nm) { isl.push([new THREE.CylinderGeometry(0.5, 0.7, 3.2, 8), '#d8d2c4', new THREE.Matrix4().makeTranslation(n.x, n.y + 2.0, n.z)]); isl.push([new THREE.SphereGeometry(0.75, 10, 8), '#c0392b', new THREE.Matrix4().makeTranslation(n.x, n.y + 3.9, n.z)]); }
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283, rr2 = rI * 0.62; isl.push([new THREE.SphereGeometry(0.55, 8, 6), pick(['#e8a33d', '#d9534f', '#f2c94c', '#6fbf4a']), new THREE.Matrix4().makeTranslation(n.x + Math.cos(a) * rr2, n.y + 0.6, n.z + Math.sin(a) * rr2)]); }
    addBox(n.x, n.z, rI * 0.72, rI * 0.72, 0.785);
  }
  if (asph.length) { const m = new THREE.Mesh(mergeGeos(asph), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 })); m.receiveShadow = true; scene.add(m); const m2 = new THREE.Mesh(mergeGeos(isl), mVC); m2.receiveShadow = true; m2.castShadow = true; scene.add(m2); }
}
const rbAng = (n, x, z) => Math.atan2(-(z - n.z), x - n.x);
function rbEnter(a, v) {
  const node = a.dir > 0 ? a.e.b : a.e.a; if (!node.rbR) return false; const dist = a.dir > 0 ? a.e.len - a.s : a.s; if (dist > node.rbR + 1) return false;
  let ne = null; if (a.route) { ne = routeNext(a, node); if (!ne) a.route = null; } if (!ne) { const opts = node.edges.filter(x => x !== a.e); ne = opts.length ? pick(opts) : a.e; }
  const d = edgeDirAt(ne, node), th0 = rbAng(node, v.pos.x, v.pos.z); let th1 = Math.atan2(-d.z, d.x) - 0.35; let D = th1 - th0; while (D < 0.4) D += Math.PI * 2; while (D > Math.PI * 2 + 0.4) D -= Math.PI * 2;
  a.rb = { n: node, th: th0, th1: th0 + D, ne, R: node.rbR }; return true;
}
function rbStep(a, v, dt) {
  const r = a.rb, n = r.n; r.th += Math.max(2, v.speed) * dt / r.R;
  if (r.th >= r.th1) { const ne = r.ne; a.e = ne; a.dir = ne.a === n ? 1 : -1; a.s = a.dir > 0 ? Math.min(r.R, ne.len * 0.5) : Math.max(ne.len - r.R, ne.len * 0.5); a.rb = null; return false; }
  const tx = n.x + r.R * Math.cos(r.th), tz = n.z - r.R * Math.sin(r.th), k = Math.min(1, dt * 6); v.pos.x += (tx - v.pos.x) * k; v.pos.z += (tz - v.pos.z) * k;
  const dx = -Math.sin(r.th), dz = -Math.cos(r.th); v.yaw += angDiff(v.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 6); v.vx = dx * v.speed; v.vz = dz * v.speed; v.steer = 0; return true;
}
function rbYield(a, v) { // 進圓環前讓圓環內、從左後方繞過來的車
  if (a.rb) return Infinity; const node = a.dir > 0 ? a.e.b : a.e.a; if (!node.rbR) return Infinity; const dist = a.dir > 0 ? a.e.len - a.s : a.s; if (dist > node.rbR + 8 || dist < node.rbR - 1) return Infinity;
  const th0 = rbAng(node, v.pos.x, v.pos.z);
  for (const o of vehicles) { const r = o.ai && o.ai.rb; if (!r || r.n !== node || o === v) continue; let d = th0 - r.th; d = ((d % 6.283) + 6.283) % 6.283; if (d < 1.4) return Math.max(0, (dist - node.rbR - 1.5) * 1.2); }
  if (player.veh && Math.hypot(player.veh.pos.x - node.x, player.veh.pos.z - node.z) < node.rbR + 2) { let d = th0 - rbAng(node, player.veh.pos.x, player.veh.pos.z); d = ((d % 6.283) + 6.283) % 6.283; if (d < 1.4) return Math.max(0, (dist - node.rbR - 1.5) * 1.2); }
  return Infinity;
}

/* 地圖景點：OpenStreetMap 的景點、古蹟、碉堡、風獅爺（124 個），滑鼠移上大地圖就看得到名字 */
function addOsmPlaces() {
  if (typeof OSM_POI === 'undefined' || !USE_OSM) return; let n = 0;
  for (const [nm, la, lo] of OSM_POI) { const w = GW(la, lo); if (PLACES.some(p => p.name === nm || (Math.hypot(p.x - w.x, p.z - w.z) < 25 && (p.name.includes(nm) || nm.includes(p.name))))) continue; PLACES.push({ name: nm, x: w.x, z: w.z, r: 10, osm: true }); n++; }
  TL.poi = n;
}

/* 營區：道路進入 OSM 標記的軍事用地時，路邊立衛哨亭、紅白拒馬和「營區重地」告示牌 */
function buildCampGates() {
  if (!LU || !USE_OSM) return; const parts = [], done = []; TL.sg = TL.sg || []; let n = 0;
  for (const e of roadEdges) { if (e.bridge) continue; for (let i = 2; i < e.pts.length; i += 2) {
    const p = e.pts[i], q = e.pts[i - 2], inN = (luAt(p.x, p.z) & 7) === 6, inQ = (luAt(q.x, q.z) & 7) === 6; if (inN === inQ) continue; const g = inN ? p : q;
    if (done.some(d => Math.hypot(d.x - g.x, d.z - g.z) < 120) || n >= 24) continue;
    const sd = 1, rx = -g.tz * sd, rz = g.tx * sd, x = g.x + rx * (e.hw + 2.4), z = g.z + rz * (e.hw + 2.4); if (!boxFree(x, z, 1.4) || sdAt(x, z) < 6 || !roadClear(x, z, 1.2)) continue;
    const y = groundAt(x, z) - 0.1, rot = Math.atan2(g.tx, g.tz), M = (px, py, pz, r = rot) => new THREE.Matrix4().compose(new V3(px, py, pz), new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), r), new V3(1, 1, 1));
    parts.push([new THREE.BoxGeometry(1.8, 2.5, 1.8).translate(0, 1.25, 0), '#5b6b3a', M(x, y, z)], [new THREE.BoxGeometry(2.3, 0.25, 2.3).translate(0, 2.62, 0), '#3d4a26', M(x, y, z)], [new THREE.BoxGeometry(1.2, 0.7, 0.05).translate(0, 1.6, 0.92), '#9fc4d8', M(x, y, z)]);
    for (let k = 0; k < 5; k++) parts.push([new THREE.BoxGeometry(0.5, 0.12, 0.12).translate(-1.1 + k * 0.5, 1.0, 0), k % 2 ? '#ffffff' : '#c0392b', M(g.x - rx * (e.hw - 1.2) + rx * 0, y, g.z - rz * (e.hw - 1.2), rot + Math.PI / 2)]);
    parts.push([new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6).translate(0, 0.5, 0), '#666', M(g.x - rx * (e.hw + 0.2), y, g.z - rz * (e.hw + 0.2))]);
    const s = signMesh('營區重地　禁止進入', 0.45, { color: '#fff', bg: '#a8261b', size: 48, pad: 8 }); s.position.set(x + Math.sin(rot) * 1.2, y + 1.9, z + Math.cos(rot) * 1.2); s.rotation.y = rot; scene.add(s); const s2 = s.clone(); s2.position.set(x - Math.sin(rot) * 1.2, y + 1.9, z - Math.cos(rot) * 1.2); s2.rotation.y = rot + Math.PI; scene.add(s2); s.visible = s2.visible = false; TL.sg.push([s, s2, x, z]);
    addBox(x, z, 0.95, 0.95, rot); done.push({ x: g.x, z: g.z, kx: +(x / KM).toFixed(4), ky: +(-z / KM).toFixed(4), rot }); n++; } }
  TL.campPts = done;
  if (parts.length) { const m = new THREE.Mesh(mergeGeos(parts), mVC); m.castShadow = true; scene.add(m); } TL.camps = n;
}
