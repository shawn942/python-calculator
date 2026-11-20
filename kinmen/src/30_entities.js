/* =====================================================================
   人物
   ===================================================================== */
const fwd = yaw => ({ x: Math.sin(yaw), z: Math.cos(yaw) });
const SHIRTS = ['#d8d3c8', '#3f6fa3', '#b3423a', '#2f7d58', '#e3b92f', '#6b5b95', '#f08a5d', '#2b2f38', '#8fb8de', '#c9d1d6', '#f4f1ea', '#d96c8a', '#7a9e7e'], PANTS = ['#2b3240', '#3d4a5c', '#5a5148', '#1f2329', '#6f7c85', '#40513b', '#b9a98a', '#4f6b8f'], SKINS = ['#e8b796', '#d9a07c', '#f0c6a8', '#c98f6b', '#e2ad8a'], HAIRS = ['#1b1917', '#2b211c', '#3a2e28', '#6b6b6b', '#4a3426', '#151413'], SHOES = ['#1c1c1c', '#f2f2f2', '#5b4435', '#2b3240', '#8a2f2a'];
const _PM = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new V3(sx, sy, sz));
const PG = { cap: (r, l) => mergeGeos([[new THREE.CylinderGeometry(r, r * 0.78, l + r * 1.5, 10), '#ffffff'], [new THREE.SphereGeometry(r * 0.98, 10, 6), '#ffffff', new THREE.Matrix4().makeTranslation(0, (l + r * 1.5) / 2, 0)]]), cyl: (a, b, h, n = 10) => new THREE.CylinderGeometry(a, b, h, n), sph: (r, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h), box: (a, b, c) => new THREE.BoxGeometry(a, b, c) };
const mPerson = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 });
/* 人物：身體一個合併網格＋上臂/前臂/大腿/小腿四組關節，臉、髮型、服裝隨機 */
function makePersonOld(o = {}) {
  const female = o.female ?? (!o.helmet && !o.tie && rand() < 0.45), skin = o.skin || pick(SKINS), shirt = o.shirt || pick(SHIRTS), pants = o.pants || pick(PANTS), hair = o.hair || pick(HAIRS), shoe = o.shoe || pick(SHOES);
  const longSleeve = o.longSleeve ?? (o.tie || o.helmet || rand() < 0.35), skirt = o.skirt ?? (female && !o.helmet && rand() < 0.4), shorts = !skirt && !o.helmet && !o.tie && (o.shorts ?? rand() < 0.22), jacket = 'jacket' in o ? o.jacket : (!o.helmet && !o.tie && rand() < 0.25 ? pick(['#2b2f38', '#5a5148', '#27496d', '#6b4a34', '#8a8f96']) : null);
  const sw = female ? 0.86 : 1, H = o.height || (female ? rr(0.94, 1.0) : rr(0.98, 1.06)), top = jacket || shirt;
  const parts = [
    [PG.box(0.32 * sw + 0.02, 0.2, 0.2), skirt ? shirt : pants, _PM(0, 0.96, 0)],
    [PG.cyl(0.2 * sw, 0.15 * sw + (female ? 0.012 : 0), 0.46, 8), top, _PM(0, 1.21, 0, 0, Math.PI / 8, 0, 1, 1, 0.6)], [PG.box(0.4 * sw, 0.09, 0.2), top, _PM(0, 1.415, 0)], [PG.box(0.3 * sw, 0.16, 0.05), top, _PM(0, 1.3, 0.085, -0.15)],
    [PG.sph(0.085), top, _PM(0.2 * sw, 1.41, 0)], [PG.sph(0.085), top, _PM(-0.2 * sw, 1.41, 0)],
    [PG.box(0.33 * sw, 0.045, 0.205), '#2a2420', _PM(0, 1.06, 0)],
    [PG.cyl(0.052, 0.06, 0.12, 8), skin, _PM(0, 1.5, 0)],
    [PG.sph(0.115, 16, 12), skin, _PM(0, 1.655, 0.005, 0, 0, 0, 0.95, 1.12, 1.02)],
    [PG.sph(0.024, 6, 4), skin, _PM(0.112, 1.65, 0)], [PG.sph(0.024, 6, 4), skin, _PM(-0.112, 1.65, 0)],
    [PG.sph(0.016, 6, 4), '#181412', _PM(0.042, 1.675, 0.104)], [PG.sph(0.016, 6, 4), '#181412', _PM(-0.042, 1.675, 0.104)],
    [PG.box(0.045, 0.011, 0.012), hair, _PM(0.043, 1.703, 0.108, 0, 0, 0.12)], [PG.box(0.045, 0.011, 0.012), hair, _PM(-0.043, 1.703, 0.108, 0, 0, -0.12)],
    [PG.box(0.024, 0.04, 0.03), skin, _PM(0, 1.645, 0.118)], [PG.box(0.05, 0.01, 0.01), female ? '#b4534f' : '#8a5a4a', _PM(0, 1.607, 0.108)]];
  if (jacket) { parts.push([PG.box(0.12 * sw, 0.42, 0.02), shirt, _PM(0, 1.22, 0.118)]); }
  if (o.tie) parts.push([PG.box(0.045, 0.3, 0.015), o.tie, _PM(0, 1.3, 0.122)]);
  if (o.helmet) parts.push([new THREE.SphereGeometry(0.14, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), o.helmetCol || pick(['#e9e6df', '#b3423a', '#27496d', '#2b2f38', '#f0c330']), _PM(0, 1.69, -0.005, 0, 0, 0, 1, 1.05, 1.08)], [PG.box(0.2, 0.06, 0.02), '#22313f', _PM(0, 1.665, 0.125)]);
  else if (o.cap) parts.push([new THREE.SphereGeometry(0.125, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), o.cap, _PM(0, 1.7, 0)], [PG.box(0.16, 0.015, 0.09), o.cap, _PM(0, 1.71, 0.13)]);
  else {
    const style = o.hairStyle || (female ? pick(['long', 'bob', 'bun', 'pony']) : pick(['short', 'short', 'crew', 'side']));
    parts.push([new THREE.SphereGeometry(0.124, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.56), hair, _PM(0, 1.67, -0.01, -0.25, 0, 0, 1, 1.12, 1.08)]);
    if (style === 'long') parts.push([PG.box(0.24, 0.32, 0.08), hair, _PM(0, 1.52, -0.085)]); if (style === 'bob') parts.push([PG.cyl(0.13, 0.135, 0.15, 12), hair, _PM(0, 1.62, -0.02, 0, 0, 0, 1, 1, 1)]);
    if (style === 'bun') parts.push([PG.sph(0.06), hair, _PM(0, 1.77, -0.08)]); if (style === 'pony') parts.push([PG.cap(0.035, 0.18), hair, _PM(0, 1.6, -0.14, 0.3)]);
    if (style === 'side') parts.push([PG.box(0.2, 0.04, 0.12), hair, _PM(0.02, 1.765, 0.03, 0, 0, -0.15)]);
  }
  if (skirt) parts.push([PG.cyl(0.17, 0.25, 0.42, 12), shirt === pants ? '#3d4a5c' : pants, _PM(0, 0.81, 0)]);
  if (o.pack) parts.push([PG.box(0.3, 0.4, 0.16), o.pack === true ? '#c2452f' : o.pack, _PM(0, 1.25, -0.2)], [PG.box(0.26, 0.15, 0.05), '#9a3423', _PM(0, 1.12, -0.29)]);
  { const HS = 0.86, hc = new V3(0, 1.66, 0); for (const p of parts) { if (!p[2]) continue; const e = p[2].elements; if (e[13] > 1.51) { p[2] = new THREE.Matrix4().makeTranslation(hc.x, hc.y - 0.035, hc.z).multiply(new THREE.Matrix4().makeScale(HS, HS, HS)).multiply(new THREE.Matrix4().makeTranslation(-hc.x, -hc.y, -hc.z)).multiply(p[2]); } } }
  parts.push([PG.box(0.13, 0.06, 0.1), skin, _PM(0, 1.565, 0.035)]);
  const g = new THREE.Group(), body = new THREE.Mesh(mergeGeos(parts), mPerson); body.castShadow = !!o.shadow; g.add(body);
  const limb = (px, py, segs) => { const pv = new THREE.Group(); pv.position.set(px, py, 0); g.add(pv); const m = new THREE.Mesh(mergeGeos(segs), mPerson); m.castShadow = !!o.shadow; pv.add(m); return pv; };
  const arm = sd => { const up = limb(sd * 0.225 * sw, 1.42, longSleeve || jacket ? [[PG.cap(0.054, 0.2), top, _PM(0, -0.14, 0)]] : [[PG.cyl(0.07, 0.065, 0.13, 8), top, _PM(0, -0.05, 0)], [PG.cap(0.047, 0.17), skin, _PM(0, -0.17, 0)]]);
    const lo = new THREE.Group(); lo.position.set(0, -0.285, 0); up.add(lo); const m = new THREE.Mesh(mergeGeos([[PG.cap(longSleeve || jacket ? 0.05 : 0.043, 0.19), longSleeve || jacket ? top : skin, _PM(0, -0.12, 0)], [PG.box(0.065, 0.09, 0.035), skin, _PM(0, -0.27, 0.005)], [PG.box(0.02, 0.04, 0.03), skin, _PM(sd * -0.035, -0.255, 0.02)]]), mPerson); m.castShadow = !!o.shadow; lo.add(m); up.lo = lo; return up; };
  const leg = sd => { const up = limb(sd * 0.095 * sw, 0.92, [[PG.cap(0.078, 0.26), skirt ? skin : pants, _PM(0, -0.2, 0)]]); const lo = new THREE.Group(); lo.position.set(0, -0.42, 0); up.add(lo);
    const m = new THREE.Mesh(mergeGeos([[PG.cap(0.058, 0.28), skirt || shorts ? skin : pants, _PM(0, -0.2, 0)], [PG.box(0.095, 0.075, 0.24), shoe, _PM(0, -0.43, 0.045)], [PG.box(0.098, 0.02, 0.245), '#e8e4dc', _PM(0, -0.465, 0.045)]]), mPerson); m.castShadow = !!o.shadow; lo.add(m); up.lo = lo; return up; };
  const armL = arm(1), armR = arm(-1), legL = leg(1), legR = leg(-1);
  if (shorts) { legL.children[0].geometry.dispose(); legL.remove(legL.children[0]); const t = (sd) => { const m = new THREE.Mesh(mergeGeos([[PG.cyl(0.085, 0.08, 0.2, 8), pants, _PM(0, -0.1, 0)], [PG.cap(0.06, 0.12), skin, _PM(0, -0.3, 0)]]), mPerson); return m; }; legL.add(t(1)); legR.remove(legR.children[0]); legR.add(t(-1)); }
  g.scale.setScalar(H);
  return { group: g, body, legL, legR, armL, armR, female };
}
function poseWalk(p, ph, amp) {
  if (p.rig) return rigLoco(p, ph, amp);
  const s = Math.sin(ph), c = Math.cos(ph); p.legL.rotation.x = s * 0.62 * amp; p.legR.rotation.x = -s * 0.62 * amp;
  p.legL.lo.rotation.x = amp * (0.08 + 0.95 * Math.max(0, -c)); p.legR.lo.rotation.x = amp * (0.08 + 0.95 * Math.max(0, c));
  p.armL.rotation.x = -s * 0.5 * amp; p.armR.rotation.x = s * 0.5 * amp; p.armL.lo.rotation.x = -0.25 - 0.35 * amp * Math.max(0, s); p.armR.lo.rotation.x = -0.25 - 0.35 * amp * Math.max(0, -s);
  p.armL.rotation.z = 0.06; p.armR.rotation.z = -0.06; p.body.rotation.x = amp > 1.1 ? 0.12 : 0; p.body.position.y = Math.abs(c) * 0.025 * amp;
}
function poseSit(p) { if (p.rig) return rigSit(p); p.legL.rotation.x = p.legR.rotation.x = -1.45; p.legL.lo.rotation.x = p.legR.lo.rotation.x = 1.35; p.armL.rotation.x = p.armR.rotation.x = -0.85; p.armL.lo.rotation.x = p.armR.lo.rotation.x = -0.5; }
function restyle() { const old = player.model, m = RIG.bases.length ? makeRig({ shadow: true, base: pick(RIG_FILES), height: 1 }) : makePerson({ shadow: true, pack: true }); m.group.position.copy(old.group.position); m.group.rotation.copy(old.group.rotation); scene.remove(old.group); scene.add(m.group); player.model = m; refreshWeapon(); }

/* =====================================================================
   載具
   ===================================================================== */
const VDEF = {
  sedan: { len: 4.4, wid: 1.8, max: 34, acc: 9.5, name: '轎車' }, taxi: { len: 4.4, wid: 1.8, max: 34, acc: 9.5, color: '#f0bf1e', taxi: true, name: '計程車' },
  police: { len: 4.4, wid: 1.8, max: 38, acc: 12, color: '#f2f3f4', name: '警車' }, jeep: { len: 4.0, wid: 1.8, max: 29, acc: 8.5, color: '#59603d', offroad: true, open: true, name: '軍用吉普車' },
  van: { len: 5.4, wid: 2.0, max: 27, acc: 6.5, color: '#eef0f1', name: '金門公車' }, suv: { len: 4.7, wid: 1.9, max: 33, acc: 9, name: '休旅車' }, pickup: { len: 5.0, wid: 1.85, max: 30, acc: 8, name: '小貨車' }, boat: { len: 6.4, wid: 2.3, max: 27, acc: 10, color: '#f2f3f4', boat: true, open: true, name: '快艇' }, scooter: { len: 1.9, wid: 0.7, max: 25, acc: 10.5, open: true, two: true, name: '機車' }, bike: { len: 1.8, wid: 0.6, max: 12.5, acc: 6.5, open: true, two: true, quiet: true, color: '#2f9e5b', name: '腳踏車' }, sports: { len: 4.4, wid: 1.9, max: 52, acc: 21, color: '#d4140b', name: '跑車' }
};
const CAR_COLORS = ['#c9d1d6', '#2f3640', '#8b2f2a', '#27496d', '#e9e6df', '#5c6b5a', '#b08a3c', '#6f7c85', '#3f8f6b'];
const mGlass = new THREE.MeshStandardMaterial({ color: 0x1c2733, roughness: 0.12, metalness: 0.7 }), mTire = mat('#1b1c1e', 0.9), mHub = mat('#b9bec3', 0.4, 0.6), mTrim = mat('#222428', 0.6);
const mHead = new THREE.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xffe9b0, emissiveIntensity: 0.3 }), mTail = new THREE.MeshStandardMaterial({ color: 0xa81d1d, emissive: 0xff2a2a, emissiveIntensity: 0.25 });
const mSirenR = new THREE.MeshStandardMaterial({ color: 0xaa2222, emissive: 0xff2222, emissiveIntensity: 0 }), mSirenB = new THREE.MeshStandardMaterial({ color: 0x2244aa, emissive: 0x2266ff, emissiveIntensity: 0 });
const geoCache = {}; const cg = (k, f) => geoCache[k] || (geoCache[k] = f());
function profGeo(pts, width, bevel = 0.07) { const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 4 }); g.translate(0, 0, -(width - 2 * bevel) / 2); g.rotateY(-Math.PI / 2); return g; }
const vehicles = [];
function makeVehicle(type, x, z, yaw, color) {
  const def = VDEF[type], g = new THREE.Group(), paint = mat(color || def.color || pick(CAR_COLORS), 0.35, 0.35), wheels = [], front = [];
  const add = (geo, m, px = 0, py = 0, pz = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(px, py, pz); me.castShadow = geo.type === 'ExtrudeGeometry'; g.add(me); return me; };
  const B = (w, h, d) => cg('b' + w + '_' + h + '_' + d, () => new THREE.BoxGeometry(w, h, d));
  const wheel = (wx, wz, r, w, isF) => { const pv = new THREE.Group(); pv.position.set(wx, r, wz); const me = new THREE.Mesh(cg('whl2' + r + w, () => { const h = w / 2, ri = r * 0.64, sh = Math.min(r * 0.22, h * 0.9), tp = [[ri, -h], [r - sh, -h], [r - sh * 0.3, -h + sh * 0.3], [r, -h + sh], [r, h - sh], [r - sh * 0.3, h - sh * 0.3], [r - sh, h], [ri, h]]; const tire = new THREE.LatheGeometry(tp.map(p => new THREE.Vector2(p[0], p[1])).reverse(), 22).rotateZ(Math.PI / 2);
      const parts = [[tire, '#1b1c1e'], [new THREE.CylinderGeometry(ri, ri, w * 0.9, 18).rotateZ(Math.PI / 2), '#4a4f55'], [new THREE.CylinderGeometry(r * 0.16, r * 0.16, w + 0.04, 10).rotateZ(Math.PI / 2), '#d9dde1']];
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; for (const sd of [1, -1]) parts.push([new THREE.BoxGeometry(0.02, ri * 0.92, r * 0.13), '#eceff2', new THREE.Matrix4().makeTranslation(sd * (w * 0.45 + 0.005), 0, 0).multiply(new THREE.Matrix4().makeRotationX(a)).multiply(new THREE.Matrix4().makeTranslation(0, ri * 0.46, 0))]); }
      return mergeGeos(parts); }), mVC); pv.add(me); g.add(pv); wheels.push({ me, r }); if (isF) front.push(pv); };
  let rider = null;
  if (CARM.ready && CARM_FOR[type] && carFromModel(type, g, paint, wheels, front, def)) { } else if (type === 'tank') { } else if (type === 'bike') {
    const fr = (x1, y1, z1, x2, y2, z2, t = 0.045) => { const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1, L = Math.hypot(dx, dy, dz), m = new THREE.Mesh(new THREE.BoxGeometry(t, L, t), paint); m.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / L, dy / L, dz / L)); m.castShadow = true; g.add(m); };
    fr(0, 0.36, -0.55, 0, 0.4, 0.05); fr(0, 0.4, 0.05, 0, 0.82, -0.15); fr(0, 0.36, -0.55, 0, 0.82, -0.15); fr(0, 0.82, -0.15, 0, 0.84, 0.42); fr(0, 0.4, 0.05, 0, 0.84, 0.42); fr(0, 0.36, 0.6, 0, 0.98, 0.45);
    add(B(0.5, 0.04, 0.04), mTrim, 0, 1.0, 0.45); add(B(0.16, 0.05, 0.26), mTrim, 0, 0.88, -0.17); add(B(0.3, 0.16, 0.26), mTrim, 0, 0.5, 0.82);
    wheel(0, 0.6, 0.34, 0.05, true); wheel(0, -0.55, 0.34, 0.05, false);
  } else if (type === 'scooter') {
    add(cg('scBody', () => profGeo([[-0.78, 0.3], [0.2, 0.3], [0.45, 0.45], [0.56, 0.98], [0.42, 1.0], [0.2, 0.52], [-0.2, 0.52], [-0.3, 0.74], [-0.82, 0.74]], 0.36, 0.05)), paint);
    add(B(0.3, 0.09, 0.62), mTrim, 0, 0.8, -0.5); add(B(0.62, 0.05, 0.05), mTrim, 0, 1.06, 0.47); add(B(0.16, 0.12, 0.05), mHead, 0, 0.9, 0.6); add(B(0.14, 0.08, 0.04), mTail, 0, 0.7, -0.84);
    wheel(0, 0.64, 0.27, 0.12, true); wheel(0, -0.62, 0.27, 0.13, false);
    rider = makePerson({ helmet: true }); rider.group.position.set(0, -0.06, -0.42); poseSit(rider); g.add(rider.group); rider.group.visible = false;
  } else if (type === 'boat') {
    add(cg('btHull', () => profGeo([[-3.1, 0.0], [2.2, 0.0], [3.3, 0.95], [2.0, 1.0], [-3.1, 0.95]], 2.2, 0.1)), paint); add(B(2.24, 0.16, 6.2), mat('#1f5fa8', 0.5), 0, 0.62, 0);
    add(B(1.6, 0.5, 0.06), mGlass, 0, 1.3, 0.6).rotation.x = -0.35; add(B(1.7, 0.3, 1.4), mat('#d8d2c2', 0.8), 0, 1.0, -1.2); add(B(0.5, 0.9, 0.5), mTrim, 0, 0.8, -3.2); add(B(0.3, 0.1, 0.06), mHead, 0, 1.0, 3.1);
  } else if (type === 'jeep') {
    add(cg('jpBody', () => profGeo([[-1.95, 0.5], [1.9, 0.5], [1.98, 0.95], [1.0, 1.06], [0.95, 1.16], [-1.95, 1.16]], 1.76)), paint);
    const ws = add(B(1.5, 0.6, 0.06), mGlass, 0, 1.45, 0.86); ws.rotation.x = -0.2; add(B(1.62, 0.07, 2.0), mat('#3d4630', 0.9), 0, 1.86, -0.5);
    for (const sx of [-0.76, 0.76]) for (const sz of [0.45, -1.45]) add(B(0.07, 0.72, 0.07), mTrim, sx, 1.5, sz);
    add(B(0.34, 0.14, 0.06), mHead, -0.6, 0.86, 2.0); add(B(0.34, 0.14, 0.06), mHead, 0.6, 0.86, 2.0); add(B(0.3, 0.12, 0.06), mTail, -0.62, 0.9, -1.98); add(B(0.3, 0.12, 0.06), mTail, 0.62, 0.9, -1.98);
    const sp = add(cg('spare', () => new THREE.CylinderGeometry(0.38, 0.38, 0.22, 14).rotateX(Math.PI / 2)), mTire, 0, 1.0, -2.08);
    for (const sx of [-0.86, 0.86]) { wheel(sx, 1.25, 0.4, 0.28, true); wheel(sx, -1.3, 0.4, 0.28, false); }
  } else if (type === 'van') {
    add(cg('busBody', () => profGeo([[-2.72, 0.6], [-2.7, 0.38], [2.6, 0.38], [2.74, 0.72], [2.74, 1.3], [2.6, 2.3], [2.4, 2.48], [-2.6, 2.48], [-2.72, 2.32]], 2.0, 0.1)), paint);
    add(B(2.03, 0.26, 5.2), mat('#2e8b57', 0.5), 0, 0.82, -0.05); add(B(2.02, 0.06, 5.2), mat('#e8b92e', 0.5), 0, 0.98, -0.05);
    for (const sd of [-1, 1]) for (let k = 0; k < 5; k++) { const z = -2.2 + k * 0.92; if (sd > 0 && k === 4) continue; add(B(0.05, 0.72, 0.8), mGlass, sd * 1.005, 1.78, z); }
    add(B(0.05, 1.5, 0.7), mGlass, 1.005, 1.28, 1.92); add(B(0.055, 0.04, 0.72), mTrim, 1.01, 1.28, 1.92);
    const ws = add(B(1.84, 1.0, 0.06), mGlass, 0, 1.72, 2.8); ws.rotation.x = -0.12; add(B(1.4, 0.26, 0.05), mTrim, 0, 2.3, 2.7);
    const ds = signMesh('金門公車', 0.17, { color: '#ffb02e', bg: '#111', size: 40, pad: 4 }); ds.position.set(0, 2.3, 2.73); g.add(ds);
    add(B(1.3, 0.22, 1.6), mat('#d8dcdf', 0.6), 0, 2.58, -0.8); add(B(1.84, 0.95, 0.06), mGlass, 0, 1.75, -2.83);
    for (const sd of [-1, 1]) { add(B(0.36, 0.16, 0.06), mHead, sd * 0.68, 0.8, 2.85); add(B(0.22, 0.4, 0.06), mTail, sd * 0.82, 1.0, -2.83); add(B(0.06, 0.3, 0.14), mTrim, sd * 1.16, 1.95, 2.55); }
    add(B(1.9, 0.18, 0.12), mTrim, 0, 0.45, 2.84); add(B(1.9, 0.18, 0.12), mTrim, 0, 0.45, -2.84);
    for (const sx of [-0.92, 0.92]) { wheel(sx, 1.75, 0.42, 0.28, true); wheel(sx, -1.75, 0.42, 0.28, false); }
  } else if (type === 'sports') {
    add(cg('spBody2', () => profGeo([[-2.22, 0.5], [-2.2, 0.32], [2.05, 0.3], [2.2, 0.4], [2.22, 0.56], [2.05, 0.66], [1.6, 0.73], [0.85, 0.79], [-0.6, 0.86], [-1.5, 0.87], [-2.0, 0.84], [-2.2, 0.74]], 1.9, 0.12)), paint);
    add(cg('spGlass2', () => profGeo([[-1.55, 0.84], [0.82, 0.78], [0.35, 1.07], [-0.2, 1.15], [-0.85, 1.12], [-1.3, 0.98]], 1.46, 0.06)), mGlass); add(cg('spRoof2', () => profGeo([[-0.95, 1.1], [0.25, 1.11], [-0.2, 1.17], [-0.7, 1.16]], 1.2, 0.04)), paint);
    add(B(1.86, 0.05, 0.3), mTrim, 0, 1.0, -2.02); for (const sd of [-0.62, 0.62]) add(B(0.06, 0.16, 0.1), mTrim, sd, 0.9, -2.0);
    for (const sd of [-1, 1]) { const hl = add(B(0.48, 0.05, 0.05), mHead, sd * 0.6, 0.58, 2.12); hl.rotation.z = sd * 0.12; hl.rotation.y = sd * -0.25; add(B(0.05, 0.16, 0.6), mTrim, sd * 0.955, 0.56, -0.45); add(B(0.04, 0.08, 3.0), mTrim, sd * 0.955, 0.36, 0.05); add(cg('exh', () => new THREE.CylinderGeometry(0.05, 0.05, 0.14, 10).rotateX(Math.PI / 2)), mHub, sd * 0.35, 0.36, -2.24); }
    add(B(1.62, 0.06, 0.05), mTail, 0, 0.74, -2.2); add(B(1.75, 0.11, 0.12), mTrim, 0, 0.36, 2.17); add(B(1.7, 0.14, 0.1), mTrim, 0, 0.38, -2.2); add(B(0.9, 0.08, 0.04), mTrim, 0, 0.47, 2.2);
    for (const sx of [-0.85, 0.85]) { wheel(sx, 1.36, 0.34, 0.3, true); wheel(sx, -1.3, 0.35, 0.33, false); }
  } else {
    const suv = type === 'suv', pk = type === 'pickup', L2 = suv ? 2.35 : pk ? 2.5 : 2.2, rh = suv ? 1.78 : pk ? 1.7 : 1.5, belt = suv ? 1.12 : pk ? 1.08 : 0.98;
    const body = suv ? [[-2.35, 0.42], [2.28, 0.42], [2.36, 0.62], [2.3, 0.95], [1.55, 1.1], [-2.3, 1.14], [-2.36, 0.9]] : pk ? [[-2.5, 0.45], [2.42, 0.45], [2.5, 0.66], [2.42, 0.98], [1.5, 1.1], [-2.5, 1.12], [-2.52, 0.9]]
      : [[-2.18, 0.36], [2.12, 0.36], [2.22, 0.55], [2.18, 0.78], [1.95, 0.88], [1.2, 0.99], [-1.75, 1.02], [-2.12, 0.94], [-2.22, 0.66]];
    add(cg('body' + type, () => profGeo(body, 1.8)), paint);
    const cab = suv ? [[-2.15, 1.12], [1.35, 1.08], [0.75, 1.72], [-2.05, 1.76]] : pk ? [[-0.25, 1.1], [1.35, 1.08], [0.85, 1.66], [-0.2, 1.68]] : [[-1.55, 1.0], [1.08, 0.97], [0.45, 1.46], [-1.12, 1.49]];
    add(cg('glass' + type, () => profGeo(cab, 1.6, 0.04)), mGlass);
    const roofZ = suv ? -0.6 : pk ? 0.32 : -0.33, roofL = suv ? 2.9 : pk ? 1.1 : 1.6, roofY = suv ? 1.76 : pk ? 1.68 : 1.49;
    add(B(1.5, 0.07, roofL), paint, 0, roofY + 0.02, roofZ);
    const pill = (zt, zb, yb, yt) => { for (const sd of [-0.77, 0.77]) { const m = add(B(0.07, Math.hypot(yt - yb, zt - zb), 0.08), paint, sd, (yb + yt) / 2, (zt + zb) / 2); m.rotation.x = Math.atan2(zt - zb, yt - yb); } };
    if (suv) { pill(0.75, 1.32, 1.1, 1.74); pill(-2.05, -2.15, 1.12, 1.76); } else if (pk) { pill(0.85, 1.33, 1.08, 1.68); pill(-0.2, -0.25, 1.1, 1.68); } else { pill(0.45, 1.06, 0.98, 1.47); pill(-1.12, -1.53, 1.0, 1.49); }
    for (const sd of [-0.92, 0.92]) { add(B(0.14, 0.09, 0.2), paint, sd, belt + 0.12, suv ? 1.25 : pk ? 1.25 : 0.95); add(B(0.03, 0.035, 1.2), mTrim, sd * 0.985, belt - 0.15, suv ? -0.3 : pk ? 0.4 : -0.15); }
    const fz = L2 + 0.04, bz = -L2 - 0.04; add(B(1.86, 0.22, 0.14), mTrim, 0, 0.5, fz - 0.02); add(B(1.86, 0.22, 0.14), mTrim, 0, 0.5, bz + 0.02); add(B(0.9, 0.18, 0.04), mTrim, 0, 0.74, fz);
    add(B(0.38, 0.13, 0.06), mHead, -0.64, 0.76, fz - 0.02); add(B(0.38, 0.13, 0.06), mHead, 0.64, 0.76, fz - 0.02); add(B(0.36, 0.16, 0.06), mTail, -0.66, suv ? 0.95 : 0.8, bz + 0.02); add(B(0.36, 0.16, 0.06), mTail, 0.66, suv ? 0.95 : 0.8, bz + 0.02);
    add(B(0.5, 0.13, 0.02), mat('#f4f4f0', 0.6), 0, 0.5, fz + 0.06); add(B(0.5, 0.13, 0.02), mat('#f4f4f0', 0.6), 0, 0.52, bz - 0.06);
    for (const [wz, sd] of [[L2 * 0.6, 1], [L2 * 0.6, -1], [-L2 * 0.6, 1], [-L2 * 0.6, -1]]) add(cg('arch', () => new THREE.CylinderGeometry(0.42, 0.42, 0.06, 14, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2)), mTrim, sd * 0.88, 0.42, wz);
    if (pk) { for (const sd of [-0.86, 0.86]) add(B(0.08, 0.42, 2.25), paint, sd, 1.28, -1.3); add(B(1.78, 0.42, 0.08), paint, 0, 1.28, -2.45); add(B(1.7, 0.04, 2.2), mat('#3a3a3a', 0.9), 0, 1.13, -1.3); if (rand() < 0.6) add(B(1.2, 0.5, 1.0), mat(pick(['#b9a98a', '#5f8a4a', '#d8d2c2']), 0.9), 0, 1.38, -1.4); }
    if (type === 'taxi') { add(B(0.55, 0.2, 0.26), mat('#fdf6d8', 0.4), 0, 1.62, -0.2); add(B(1.83, 0.12, 2.0), mat('#1b1b1b', 0.6), 0, 0.82, -0.1); }
    if (type === 'police') { add(B(1.83, 0.18, 2.6), mat('#27496d', 0.5), 0, 0.8, -0.1); add(B(1.0, 0.1, 0.3), mTrim, 0, 1.58, -0.3); add(B(0.42, 0.14, 0.26), mSirenR, -0.27, 1.66, -0.3); add(B(0.42, 0.14, 0.26), mSirenB, 0.27, 1.66, -0.3); }
    const wr = suv ? 0.4 : pk ? 0.38 : 0.34; for (const sx of [-0.86, 0.86]) { wheel(sx, L2 * 0.6, wr, 0.26, true); wheel(sx, -L2 * 0.6, wr, 0.26, false); }
  }
  { const buckets = new Map(); for (const m of [...g.children]) { if (!m.isMesh || !m.visible) continue; m.updateMatrix(); let b = buckets.get(m.material); if (!b) buckets.set(m.material, b = []); b.push(m); }
    for (const [mt, list] of buckets) { if (list.length < 2) continue; const merged = new THREE.Mesh(mergeGeos(list.map(m => [m.geometry, '#ffffff', m.matrix])), mt); merged.castShadow = list.some(m => m.castShadow); merged.userData.own = true; for (const m of list) g.remove(m); g.add(merged); } }
  scene.add(g);
  const v = { type, def, group: g, paint, pos: new V3(x, heightAt(x, z), z), yaw, vx: 0, vz: 0, speed: 0, steer: 0, pitch: 0, roll: 0, driver: 'none', ai: null, wheels, front, rider, hp: 100, onRoad: true, roadT: 0, stuckT: 0, revT: 0, perm: false, hitCd: 0 };
  if (type === 'tank') { buildTankModel(v); v.hp = 600; } vehicles.push(v); vehiclePost(v, 1); return v;
}
function removeVehicle(v) { scene.remove(v.group); const i = vehicles.indexOf(v); if (i >= 0) vehicles.splice(i, 1); }
function vehiclePost(v, dt) {
  if (v.def.boat) { v.pos.y = 0.12 + Math.sin(game.time * 1.7 + v.pos.x * 0.1) * 0.08; v.pitch += (-clamp(v.speed, 0, 26) * 0.006 - v.pitch) * Math.min(1, dt * 4); v.roll += (-v.steer * 0.5 * clamp(Math.abs(v.speed) / 12, 0, 1) - v.roll) * Math.min(1, dt * 4); v.group.position.copy(v.pos); v.group.rotation.set(v.pitch, v.yaw, v.roll, 'YXZ'); return; }
  const f = fwd(v.yaw), hl = v.def.len * 0.36, hw = Math.max(0.3, v.def.wid * 0.4), rx = -f.z, rz = f.x;
  const yF = heightAt(v.pos.x + f.x * hl, v.pos.z + f.z * hl), yB = heightAt(v.pos.x - f.x * hl, v.pos.z - f.z * hl), yL = heightAt(v.pos.x - rx * hw, v.pos.z - rz * hw), yR = heightAt(v.pos.x + rx * hw, v.pos.z + rz * hw);
  const k = Math.min(1, dt * 14); v.pos.y += ((yF + yB) / 2 - v.pos.y) * Math.min(1, dt * 20);
  v.pitch += (Math.atan2(yB - yF, hl * 2) - v.pitch) * k; let rollT = Math.atan2(yL - yR, hw * 2); if (v.def.two) rollT = -v.steer * 1.1 * Math.min(1, Math.abs(v.speed) / 9);
  v.roll += (rollT - v.roll) * k; v.group.position.copy(v.pos); v.group.rotation.set(v.pitch, v.yaw, v.roll, 'YXZ');
  for (const w of v.wheels) w.me.rotation.x += v.speed * dt / w.r; for (const p of v.front) p.rotation.y = v.steer;
}
function driveBoat(v, ctl, dt) {
  const T = v.def; let f = fwd(v.yaw), vf = v.vx * f.x + v.vz * f.z;
  if (ctl.thr > 0) vf += T.acc * dt * Math.max(0, 1 - vf / T.max); else if (ctl.thr < 0) vf -= T.acc * 0.7 * dt * Math.max(0, 1 + vf / (T.max * 0.3)); vf -= vf * 0.12 * dt;
  v.steer += (ctl.steer * 0.5 - v.steer) * Math.min(1, dt * 4); v.yaw += v.steer * clamp(vf / 8, -1, 1) * 1.5 * dt; f = fwd(v.yaw); const r = { x: -f.z, z: f.x }, vl = (v.vx * r.x + v.vz * r.z) * Math.exp(-2.5 * dt);
  v.vx = f.x * vf + r.x * vl; v.vz = f.z * vf + r.z * vl; v.speed = vf; const nx = v.pos.x + v.vx * dt, nz = v.pos.z + v.vz * dt, ok = (x, z) => groundAt(x, z) < -0.55 && deckY(x, z) === null;
  if (ok(nx + f.x * 2.6, nz + f.z * 2.6) && ok(nx - f.x * 2.6, nz - f.z * 2.6)) { v.pos.x = nx; v.pos.z = nz; } else { v.vx *= -0.15; v.vz *= -0.15; }
}
function driveVehicle(v, ctl, dt) {
  if (v.def.tank) return driveTank(v, ctl, dt);
  if (v.def.boat) return driveBoat(v, ctl, dt);
  const T = v.def; let f = fwd(v.yaw), r = { x: -f.z, z: f.x }, vf = v.vx * f.x + v.vz * f.z, vl = v.vx * r.x + v.vz * r.z;
  v.roadT -= dt; if (v.roadT <= 0) { v.roadT = 0.25; const n = nearestRoad(v.pos.x, v.pos.z, 24); v.onRoad = !!(n && n.dist < n.e.hw + 1.2) || bridgeY(v.pos.x, v.pos.z) !== null; }
  const maxS = T.max * (v.engine || 1) * (v.onRoad ? 1 : (T.offroad ? 0.88 : 0.7));
  if (ctl.thr > 0) { if (vf < 0) vf += 20 * dt; else vf += T.acc * (v.engine || 1) * ctl.thr * dt * Math.max(0, 1 - vf / maxS); }
  else if (ctl.thr < 0) { if (vf > 0.6) vf -= 24 * dt; else vf -= T.acc * 0.6 * dt * Math.max(0, 1 + vf / (maxS * 0.33)); }
  vf -= vf * (v.onRoad ? 0.1 : 0.28) * dt; if (!ctl.thr) vf -= Math.sign(vf) * Math.min(Math.abs(vf), 1.8 * dt);
  if (ctl.hb) vf -= Math.sign(vf) * Math.min(Math.abs(vf), 13 * dt);
  v.vx = f.x * vf + r.x * vl; v.vz = f.z * vf + r.z * vl;
  const sp = Math.abs(vf), maxSteer = lerp(0.6, 0.085, clamp(sp / T.max, 0, 1));
  v.steer += (ctl.steer * maxSteer - v.steer) * Math.min(1, dt * 7);
  v.yaw += (vf / (T.len * 0.62)) * Math.tan(v.steer) * dt * (ctl.hb ? 1.4 : 1);
  f = fwd(v.yaw); r = { x: -f.z, z: f.x }; vf = v.vx * f.x + v.vz * f.z; vl = v.vx * r.x + v.vz * r.z;
  vl *= Math.exp(-(ctl.hb ? 1.5 : (v.onRoad ? 7.5 : 4.5)) * dt);
  v.vx = f.x * vf + r.x * vl; v.vz = f.z * vf + r.z * vl; v.speed = vf; v.slip = Math.abs(vl);
  const px = v.pos.x, pz = v.pos.z; v.pos.x += v.vx * dt; v.pos.z += v.vz * dt; deckGuard(px, pz, v.pos, v);
}
function deckGuard(px, pz, pos, v = null) { const b0 = bridgeY(px, pz); if (b0 !== null && b0 > groundAt(px, pz) + 1.5 && bridgeY(pos.x, pos.z) === null) { pos.x = px; pos.z = pz; if (v) { v.vx *= 0.3; v.vz *= 0.3; } return true; } return false; }
function vCircles(v) { if (v.def.two) return [{ x: v.pos.x, z: v.pos.z, r: 0.55 }]; const f = fwd(v.yaw), o = v.def.len * 0.27, r = v.def.wid * 0.58; return [{ x: v.pos.x + f.x * o, z: v.pos.z + f.z * o, r }, { x: v.pos.x - f.x * o, z: v.pos.z - f.z * o, r }]; }
/* 物理驅動的車（玩家、警車、滑行中）對建築/車/人的碰撞 */
function vehicleCollide(v, dt) {
  v.hitCd -= dt; let impact = 0;
  for (const c of vCircles(v)) { const q = { x: c.x, z: c.z }, h = resolveCircle(q, c.r, true); if (h) { v.pos.x += q.x - c.x; v.pos.z += q.z - c.z; const vn = v.vx * h.nx + v.vz * h.nz; if (vn < 0) { impact = Math.max(impact, -vn); v.hitP = { x: c.x - h.nx * c.r, z: c.z - h.nz * c.r }; v.vx -= h.nx * vn * 1.25; v.vz -= h.nz * vn * 1.25; } } }
  for (const o of vehicles) { if (o === v) continue; const dx = o.pos.x - v.pos.x, dz = o.pos.z - v.pos.z; if (dx * dx + dz * dz > 64) continue;
    for (const a of vCircles(v)) for (const b of vCircles(o)) { const ex = b.x - a.x, ez = b.z - a.z, d = Math.hypot(ex, ez), m = a.r + b.r; if (d >= m || d < 1e-4) continue; const nx = ex / d, nz = ez / d, pen = m - d, rel = (v.vx - o.vx) * nx + (v.vz - o.vz) * nz;
      if (v.def.tank && !o.def.tank) { o.pos.x += nx * pen; o.pos.z += nz * pen; if (o.ai) { o.ai.ox += nx * pen; o.ai.oz += nz * pen; o.ai.stun = 2; } if (rel > 1) { o.hp -= rel * 4; if (o.hp <= 0 && !o.burn) o.burn = 1.2; if (v.hitCd <= 0) { v.hitCd = 0.4; sfx('thud', 0.4); if (v.driver === 'player') crime(1); } } continue; }
      v.pos.x -= nx * pen * 0.6; v.pos.z -= nz * pen * 0.6; if (rel > 0) { impact = Math.max(impact, rel * 0.8); v.hitP = o.hitP = { x: a.x + nx * a.r, z: a.z + nz * a.r }; v.vx -= nx * rel * 0.75; v.vz -= nz * rel * 0.75;
        if (o.ai) { o.ai.bvx += nx * rel * 0.8; o.ai.bvz += nz * rel * 0.8; o.speed *= 0.3; o.ai.stun = o.perp ? 0.4 : 1.5; if (o.perp) o.hp -= rel * 2.5; } else if (o.driver !== 'player') { o.vx += nx * rel * 0.6; o.vz += nz * rel * 0.6; o.pos.x += nx * pen * 0.4; o.pos.z += nz * pen * 0.4; }
        if (v.driver === 'player' && o.type === 'police' && rel > 5 && v.hitCd <= 0) crime(1); } } }
  const sp = Math.hypot(v.vx, v.vz);
  if (sp > 3.5 && (v.driver === 'player' || v.driver === 'police')) for (const p of peds) { if (p.state === 'down') continue; for (const c of vCircles(v)) if (Math.hypot(p.pos.x - c.x, p.pos.z - c.z) < c.r + 0.35) { knockPed(p, v.vx, v.vz); if (v.driver === 'player' && !p.bad) crime(1); break; } }
  if (impact > 2.5 && v.hitCd <= 0) { v.hitCd = 0.35; if (v.driver === 'player') onPlayerCrash(impact); }
  return impact;
}

/* ---------- 路上車流（沿道路圖行駛） ---------- */
function spawnTraffic(s) {
  const e = s.e, p = e.pts[s.i]; for (const o of vehicles) if (Math.hypot(o.pos.x - p.x, o.pos.z - p.z) < 26) return null;
  const t = rand(), type = t < 0.34 ? 'scooter' : t < 0.6 ? 'sedan' : t < 0.7 ? 'suv' : t < 0.8 ? 'pickup' : t < 0.88 ? 'taxi' : t < 0.95 ? 'van' : 'jeep', dir = rand() < 0.5 ? 1 : -1;
  const v = makeVehicle(type, p.x, p.z, Math.atan2(p.tx * dir, p.tz * dir)); v.driver = 'ai'; if (v.rider) v.rider.group.visible = true;
  v.ai = { e, dir, s: s.i * e.step, cruise: (e.type === 'minor' ? 8 : 15) * rr(0.8, 1.15) * (type === 'scooter' ? 0.9 : 1), ox: 0, oz: 0, bvx: 0, bvz: 0, stun: 0, lane: type === 'scooter' ? 0.7 : 0.48 };
  const P = edgePoint(e, v.ai.s), dx = P.tx * dir, dz = P.tz * dir; v.pos.x = P.x - dz * e.hw * v.ai.lane; v.pos.z = P.z + dx * e.hw * v.ai.lane; v.speed = v.ai.cruise * 0.8; return v;
}
function updateTraffic(v, dt) {
  const a = v.ai, f = fwd(v.yaw); let target = a.e.type === 'minor' ? Math.min(a.cruise, 8) : a.cruise; if (a.stun > 0) { a.stun -= dt; target = 0; } target = Math.min(target, tlStop(a, v), rbYield(a, v)); if (a.route) { target = Math.min(target, routeStopCheck(a, v, dt)); }
  const chk = (ox, oz, rad) => { const dx = ox - v.pos.x, dz = oz - v.pos.z, ahead = dx * f.x + dz * f.z; if (ahead < 1 || ahead > 15 + v.speed) return; if (Math.abs(-dx * f.z + dz * f.x) < 1.5 + rad) target = Math.min(target, Math.max(0, (ahead - 7) * 0.9)); };
  const pp = wpos(); if (!player.inside && !player.plane) chk(pp.x, pp.z, player.veh ? 1 : 0.4);
  for (const o of vehicles) if (o !== v && Math.abs(o.pos.x - v.pos.x) < 40 && Math.abs(o.pos.z - v.pos.z) < 40) chk(o.pos.x, o.pos.z, o.def.wid / 2);
  if (typeof proc !== 'undefined' && proc.on) for (const m of proc.mem) { const p = m.o.position; if (Math.abs(p.x - v.pos.x) < 30 && Math.abs(p.z - v.pos.z) < 30) chk(p.x, p.z, 2.5); }
  v.speed += clamp(target - v.speed, -16 * dt, 5 * dt); a.s += a.dir * v.speed * dt;
  if ((a.rb || rbEnter(a, v)) && rbStep(a, v, dt)) return;
  if (a.s > a.e.len || a.s < 0) { const node = a.dir > 0 ? a.e.b : a.e.a, rn = a.route ? routeNext(a, node) : null; if (a.route && !rn) a.route = null; const opts = rn ? [rn] : node.edges.filter(x => x !== a.e); if (!opts.length) { a.dir *= -1; a.s = clamp(a.s, 0, a.e.len); } else { const ne = pick(opts); a.e = ne; a.dir = ne.a === node ? 1 : -1; a.s = a.dir > 0 ? 0 : ne.len; } }
  const P = edgePoint(a.e, a.s), dx = P.tx * a.dir, dz = P.tz * a.dir, lane = a.e.hw * a.lane;
  a.ox += a.bvx * dt; a.oz += a.bvz * dt; const dk = Math.exp(-3 * dt); a.bvx *= dk; a.bvz *= dk; const ok = Math.exp(-0.7 * dt); a.ox *= ok; a.oz *= ok;
  const k = Math.min(1, dt * 6); v.pos.x += (P.x - dz * lane + a.ox - v.pos.x) * k; v.pos.z += (P.z + dx * lane + a.oz - v.pos.z) * k;
  v.yaw += angDiff(v.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 5); v.vx = dx * v.speed; v.vz = dz * v.speed; v.steer = 0;
}

/* =====================================================================
   行人（沿人行道走；受驚會逃）
   ===================================================================== */
const peds = [];
function spawnPed(s) {
  const e = s.e, p = e.pts[s.i], side = rand() < 0.5 ? 1 : -1, off = e.hw + 2.1, x = p.x - p.tz * side * off, z = p.z + p.tx * side * off;
  const m = RIG.bases.length && Q.peds >= 22 ? makeRig({ skinVar: true }) : makePerson({ pack: TOWNS[p.town] && TOWNS[p.town].style === 'campus' && rand() < 0.7 }); scene.add(m.group);
  const pd = { m, pos: new V3(x, heightAt(x, z), z), yaw: 0, e, fi: s.i, dir: rand() < 0.5 ? 1 : -1, side, state: 'walk', t: 0, spd: rr(1.2, 1.9), ph: rr(0, 6), vx: 0, vz: 0, vy: 0, idle: 0 }; peds.push(pd); return pd;
}
function removePed(p) { scene.remove(p.m.group); const i = peds.indexOf(p); if (i >= 0) peds.splice(i, 1); }
function knockPed(p, vx, vz) { if (p.state === 'down') return; p.state = 'down'; p.t = 0; p.vx = vx * 0.6; p.vz = vz * 0.6; p.vy = 3.5 + Math.hypot(vx, vz) * 0.12; sfx('thud', 0.5); for (const o of peds) if (o !== p && o.state === 'walk' && Math.hypot(o.pos.x - p.pos.x, o.pos.z - p.pos.z) < 26) pedReact(o, 'see'); }
function updatePed(p, dt) {
  if (updatePedExtra(p, dt)) return;
  const pp = wpos(), dxp = p.pos.x - pp.x, dzp = p.pos.z - pp.z, dp = Math.hypot(dxp, dzp);
  if (p.state === 'down') { p.t += dt; p.pos.x += p.vx * dt; p.pos.z += p.vz * dt; const dk = Math.exp(-3 * dt); p.vx *= dk; p.vz *= dk; p.vy -= 18 * dt; const gy = heightAt(p.pos.x, p.pos.z); p.pos.y = Math.max(gy, p.pos.y + p.vy * dt); resolveCircle(p.pos, 0.35);
    p.m.group.rotation.set(-Math.PI / 2 * Math.min(1, p.t * 4), p.yaw, 0, 'YXZ'); p.m.group.position.set(p.pos.x, p.pos.y + 0.22, p.pos.z); if (p.t > 7 && !p.dead) { p.state = Math.random() < 0.4 && !player.veh ? 'fight' : 'flee'; p.t = 2; p.m.group.rotation.set(0, p.yaw, 0); } return; }
  let sp = p.spd, tx, tz;
  if (p.state === 'flee') { p.t += dt; sp = 6.2; const l = dp || 1; tx = dxp / l; tz = dzp / l; if (p.t > 7 && dp > 22) { p.state = 'walk'; const n = nearestRoad(p.pos.x, p.pos.z, 90); if (n) { p.e = n.e; p.fi = n.i; } } }
  else {
    if (player.veh && dp < 7 && Math.abs(player.veh.speed) > 9) { p.state = 'flee'; p.t = 4; return; }
    if (p.idle > 0) { p.idle -= dt; poseWalk(p.m, 0, 0); p.m.group.position.copy(p.pos); return; } if (rand() < dt * 0.04) p.idle = rr(1.5, 5);
    const n = p.e.pts.length; let q = p.e.pts[clamp(Math.round(p.fi), 0, n - 1)]; const off = p.e.hw + 2.1; let gx = q.x - q.tz * p.side * off, gz = q.z + q.tx * p.side * off;
    if (Math.hypot(gx - p.pos.x, gz - p.pos.z) < 2.2) { p.fi += p.dir * 1; if (p.fi < 1 || p.fi > n - 2 || p.e.pts[clamp(Math.round(p.fi), 0, n - 1)].town < 0) { p.dir *= -1; p.fi += p.dir * 2; } }
    const l = Math.hypot(gx - p.pos.x, gz - p.pos.z) || 1; tx = (gx - p.pos.x) / l; tz = (gz - p.pos.z) / l;
  }
  p.pos.x += tx * sp * dt; p.pos.z += tz * sp * dt; resolveCircle(p.pos, 0.35); if (groundAt(p.pos.x, p.pos.z) < -0.4) { p.pos.x -= tx * sp * dt * 2; p.pos.z -= tz * sp * dt * 2; }
  p.pos.y = heightAt(p.pos.x, p.pos.z); p.yaw += angDiff(p.yaw, Math.atan2(tx, tz)) * Math.min(1, dt * 8); p.ph += dt * sp * 2.6; poseWalk(p.m, p.ph, sp > 3 ? 1.25 : 0.75);
  p.m.group.position.copy(p.pos); p.m.group.rotation.set(0, p.yaw, 0);
}

/* =====================================================================
   玩家
   ===================================================================== */
const player = { pos: new V3(), yaw: 0, vy: 0, air: false, veh: null, plane: null, inside: null, hp: 100, armor: 0, money: 3000, loot: 0, punch: 0, ph: 0, model: null, fireCd: 0, aimT: 0, spd: 0 };
function wpos() { return player.tunnel ? player.tunnel.surf : player.veh ? player.veh.pos : player.pos; }
function initPlayer() { player.model = makePerson({ shadow: true, female: false, jacket: null, longSleeve: false, shorts: false, hairStyle: 'side', shoe: '#f2f2f2', shirt: '#f3efe6', pants: '#3d5a80', skin: '#e8b796', hair: '#1b1917', pack: true }); scene.add(player.model.group); const s = missionSpots.start; player.pos.set(s.x, heightAt(s.x, s.z), s.z); player.yaw = s.yaw; }
function nearestVehicle(maxD = 3.6) { if (player.bus) return null; let best = null, bd = maxD; for (const v of vehicles) { if (v.burn) continue; const d = Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z) - v.def.len * 0.3; if (d < bd) { bd = d; best = v; } } return best; }
function enterVehicle(v) {
  if (v.type !== 'boat' && v.driver === 'police' && !v.deployed) { toast('車上有警察！'); return; }
  leaveSwim(); if (v.def.tank && !v.stolen) { v.stolen = true; wanted.cd = 0; crimeMin(2); toast('偷走戰車！左鍵開砲'); }
  if (v.driver === 'police') { v.driver = 'none'; wanted.cd = 0; crimeMin(2); toast('偷警車！'); }
  if (v.driver === 'ai') { const f = fwd(v.yaw), s = { e: v.ai.e, i: clamp(Math.round(v.ai.s / v.ai.e.step), 0, v.ai.e.pts.length - 1) }; const pd = spawnPed(s); pd.pos.set(v.pos.x + f.z * 1.6, v.pos.y, v.pos.z - f.x * 1.6); pd.state = 'flee'; pd.t = 0; v.ai = null; crime(1); toast('搶車！'); }
  v.driver = 'player'; player.veh = v; player.model.group.visible = false; if (v.rider) { v.rider.group.visible = false; }
  if (v.def.open) { player.model.group.visible = true; }
  sfx('door', 0.4); cam.off = 0;
}
function exitVehicle() {
  const v = player.veh; if (!v) return; if (Math.abs(v.speed) > 9) { toast('車速太快，先減速'); return; }
  const f = fwd(v.yaw);
  if (v.def.boat) { let sp = null; for (let r = 2.5; r <= 9 && !sp; r += 1.5) for (let k = 0; k < 16 && !sp; k++) { const a = k / 16 * 6.283, x = v.pos.x + Math.cos(a) * r, z = v.pos.z + Math.sin(a) * r; if ((groundAt(x, z) > -0.3 || deckY(x, z) !== null) && boxFree(x, z, 0.5)) sp = [x, z]; } if (!sp) { const f2 = fwd(v.yaw); sp = [v.pos.x + f2.z * 2.6, v.pos.z - f2.x * 2.6]; } player.pos.set(sp[0], heightAt(sp[0], sp[1]), sp[1]); v.vx = v.vz = 0; }
  else { player.pos.set(v.pos.x + f.z * (v.def.wid / 2 + 0.9), v.pos.y, v.pos.z - f.x * (v.def.wid / 2 + 0.9)); resolveCircle(player.pos, 0.45); }
  player.yaw = v.yaw; v.driver = 'none'; player.veh = null; player.model.group.visible = true; player.model.group.rotation.set(0, player.yaw, 0); poseWalk(player.model, 0, 0); cam.yaw = v.yaw; sfx('door', 0.4);
  if (mission.taxi) endTaxi('下車了，載客結束');
}
function updatePlayerFoot(dt, ax) {
  if (player.down > 0) return updateDown(dt);
  if (!player.air && !(player.rollT > 0) && waterDepthAt(player.pos.x, player.pos.z) > 1.1) { updateSwim(dt, ax); return; } else if (player.swim) leaveSwim();
  if (player.rollT > 0) { updateDodge(dt); player.spd = 9; return; }
  const sprint = (keys.ShiftLeft || keys.ShiftRight || touch.run) && !player.crouch, moving = ax.x || ax.y, sp = moving ? (player.crouch ? 2.2 : sprint ? 7.8 : 4.4) : 0, px = player.pos.x, pz = player.pos.z;
  if (moving) { const f = fwd(cam.yaw); let dx = f.x * ax.y - f.z * ax.x, dz = f.z * ax.y + f.x * ax.x; const l = Math.hypot(dx, dz); dx /= l; dz /= l; player.yaw += angDiff(player.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 12); const nx = px + dx * sp * dt, nz = pz + dz * sp * dt; if (player.tunnel) { player.pos.x = nx; player.pos.z = nz; } else { player.pos.x = clamp(nx, WX0, -TX0 - 40); player.pos.z = clamp(nz, TZ0 + 40, -TZ0 - 40); } }
  if (inv.cur && player.aimT > 0) player.yaw += angDiff(player.yaw, cam.yaw) * Math.min(1, dt * 18);
  resolveCircle(player.pos, 0.45); deckGuard(px, pz, player.pos);
  let roof = -1e9, roofV = null; for (const v of vehicles) { const rh = roofH(v); for (const c of vCircles(v)) { const ex = player.pos.x - c.x, ez = player.pos.z - c.z, d = Math.hypot(ex, ez), m = c.r + 0.42; if (d < m && d > 1e-4) { if (rh && player.pos.y >= v.pos.y + rh - 0.5) { if (d < c.r + 0.15 && v.pos.y + rh > roof) { roof = v.pos.y + rh; roofV = v; } continue; } player.pos.x += ex / d * (m - d); player.pos.z += ez / d * (m - d); if (v !== player.veh && v.driver !== 'none' && Math.abs(v.speed) > 6 && v.hitCd <= 0 && !player.air) { v.hitCd = 1; knockPlayer(v); return; } } } }
  if (roofV && !player.air) { const rf = fwd(roofV.yaw); player.pos.x += rf.x * roofV.speed * dt; player.pos.z += rf.z * roofV.speed * dt; }
  const gy = Math.max(heightAt(player.pos.x, player.pos.z), roof);
  if (player.air) { player.vy -= 19 * dt; player.vy = Math.max(player.vy, player.chute ? -4.2 : -55); player.pos.y += player.vy * dt; if (player.vaultT > 0) { player.vaultT -= dt; const vf = fwd(player.yaw); player.pos.x += vf.x * 2.8 * dt; player.pos.z += vf.z * 2.8 * dt; } if (player.pos.y <= gy) { const hv = player.vy; player.pos.y = gy; player.air = false; landed(hv); } } else { if (player.pos.y - gy > 0.7) { player.air = true; player.vy = 0; } else player.pos.y = gy; if (!player.air && (keys.Space || touch.jump)) { const vh = vaultH(); player.vy = vh > 0 ? Math.sqrt(2 * 19 * (vh + 0.45)) : 6.2; if (vh > 0) { player.vaultT = 0.5; sfx('swish', 0.2); } player.air = true; touch.jump = false; } }
  player.ph += dt * sp * 2.5; poseWalk(player.model, player.ph, moving ? (sprint ? 1.3 : 0.85) : 0); if (player.crouch) poseCrouch(player.model); else unCrouch(player.model);
  if (inv.cur) { const M = player.model, aim = player.aimT > 0; M.armR.rotation.x = aim ? -1.5 + cam.pitch * 0.5 - 0.12 : -0.35; M.armR.lo.rotation.x = aim ? 0 : -0.9; if (aim && WEAPONS[inv.cur].len > 0.4) { M.armL.rotation.x = M.armR.rotation.x + 0.1; M.armL.rotation.z = -0.55; M.armL.lo.rotation.x = -0.5; } }
  if (player.punch > 0) { player.punch -= dt; player.model.armR.rotation.x = -1.6 * Math.sin(Math.min(1, (0.3 - player.punch) / 0.3) * Math.PI); }
  player.model.group.position.copy(player.pos); player.model.group.rotation.set(0, player.yaw, 0); player.spd = sp;
}
function punch() { if (player.veh || player.punch > 0 || player.swim) return; for (const n of roomNpcs) if (n.room === player.inside && !n.dead && Math.hypot(n.pos.x - player.pos.x, n.pos.z - player.pos.z) < 1.9) { scareRoom(n.room); crimeMin(1); } player.punch = 0.3; const f = fwd(player.yaw); let hit = false, bad = false; for (const p of peds) { const dx = p.pos.x - player.pos.x, dz = p.pos.z - player.pos.z; if (p.state !== 'down' && Math.hypot(dx, dz) < 1.9 && dx * f.x + dz * f.z > 0.2) { knockPed(p, f.x * 5, f.z * 5); hit = true; if (p.bad) bad = true; } } if (hit && !bad) crime(1); else sfx('swish', 0.25); }
/* 脫困：拉回最近的路面，車頭朝路的方向 */
function rescueTo(x, z) { const n = nearestRoad(x, z, 400); if (!n) return null; const p = n.p, e = n.e, i = Math.min(n.i, e.pts.length - 2), q = e.pts[i + 1] || p; let tx = q.x - e.pts[i].x, tz = q.z - e.pts[i].z; const l = Math.hypot(tx, tz) || 1; return { x: p.x, z: p.z, y: Math.max(p.y, groundAt(p.x, p.z)), yaw: Math.atan2(tx / l, tz / l) }; }
function rescueVehicle(v, why) { const r = rescueTo(v.pos.x, v.pos.z); if (!r) return false; v.pos.set(r.x, r.y + 0.6, r.z); v.yaw = r.yaw; v.vx = v.vz = 0; v.speed = 0; v.pitch = v.roll = 0; v.stuckT = 0; toast(why || '車卡住了，已拉回路上'); return true; }
function rescuePlayer() { if (player.inside) { toast('在室內不需要脫困'); return; } if (player.veh) { rescueVehicle(player.veh, '已拉回路上'); return; } const r = rescueTo(player.pos.x, player.pos.z); if (!r) return; player.pos.set(r.x + Math.cos(r.yaw) * 4, r.y + 0.3, r.z - Math.sin(r.yaw) * 4); player.vy = 0; if (player.swim) leaveSwim(); toast('已移到路邊'); }
function updatePlayerVehicle(dt, ax) {
  const v = player.veh; if (v.turret) { v.turret.rotation.y += angDiff(v.turret.rotation.y, cam.yaw - v.yaw) * Math.min(1, dt * 3); v.cool = (v.cool || 0) - dt; }
  driveVehicle(v, { thr: ax.y, steer: -ax.x, hb: !!(keys.Space || touch.brake) }, dt); const imp = vehicleCollide(v, dt); vehiclePost(v, dt);
  if (!v.def.boat && !v.def.tank) { const pushing = Math.abs(ax.y) > 0.3 && Math.abs(v.speed || 0) < 0.8, flipped = Math.abs(v.roll || 0) > 1.1 || Math.abs(v.pitch || 0) > 1.1; v.stuckT = (pushing || flipped) ? (v.stuckT || 0) + dt : 0; if (v.stuckT > 3) rescueVehicle(v); }
  player.pos.copy(v.pos); player.yaw = v.yaw;
  if (v.def.open) { const g = player.model.group, f = fwd(v.yaw); if (v.type === 'boat') { g.position.set(v.pos.x - f.x * 0.6, v.pos.y + 0.3, v.pos.z - f.z * 0.6); g.rotation.set(0, v.yaw, 0); } else if (v.def.two) { g.position.set(v.pos.x - f.x * 0.42, v.pos.y - 0.06, v.pos.z - f.z * 0.42); g.rotation.set(v.pitch, v.yaw, v.roll, 'YXZ'); } else { g.position.set(v.pos.x + f.z * 0.4 - f.x * 0.1, v.pos.y + 0.16, v.pos.z - f.x * 0.4 - f.z * 0.1); g.rotation.set(0, v.yaw, 0); } poseSit(player.model); }
  if (!v.def.boat && groundAt(v.pos.x, v.pos.z) < -1.3 && bridgeY(v.pos.x, v.pos.z) === null && deckY(v.pos.x, v.pos.z) === null) { const veh = v; exitForce(); removeVehicle(veh); respawn('落海了！車子泡湯', true); }
}
function exitForce() { if (player.bus) { player.bus = null; player.model.group.visible = true; } const v = player.veh; if (!v) return; v.driver = 'none'; player.veh = null; player.model.group.visible = true; poseWalk(player.model, 0, 0); }
