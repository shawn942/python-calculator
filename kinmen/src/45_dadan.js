/* =====================================================================
   大膽島（真實座標 24.39028N, 118.16556E）
   北山：心戰牆「三民主義統一中國」、北安寺、神雞之墓、神泉茶坊
   南山：大膽燈塔底座、大膽寺、「島孤人不孤」、茜露墓園
   中間沙頸：生明路；東側：大膽碼頭（交通船往返九宮碼頭）
   ===================================================================== */
const dadan = { wall: null, sign: null, pier: null, back: null, talk: 0 };
const DADAN_TALK = [
  '1950 年 7 月 26 日，七百名共軍摸黑登陸，不到三百名守軍守了一晝夜，史稱大二膽戰役。',
  '南北山一度斷了聯絡，傳令兵賴生明冒著砲火跑過中間這條路，後來這條路就叫「生明路」。',
  '心戰牆 1986 年蓋好，高 3.2 公尺、寬 20 公尺，晚上七點到九點會點霓虹燈，對岸看得一清二楚。',
  '北山有一座神雞之墓，聽說砲擊前牠都會先啼叫示警，救了不少弟兄。',
  '對面就是廈門，只有 4.4 公里，天氣好的時候連高樓的窗戶都數得出來。',
  '1951 年經國先生來島上視察，把「大擔」改名成「大膽」，還題了「島孤人不孤」。'];
function dadanLL(dx, dz) { return { x: DADAN.x + dx, z: DADAN.z + dz }; }
function soldierModel(x, z, yaw) { const m = makePerson({ shirt: '#59603d', pants: '#4a5234', helmet: true, helmetCol: '#4a5234', skin: '#d9a07c', female: false, longSleeve: true, jacket: null, shorts: false, shoe: '#222' }); m.group.position.set(x, groundAt(x, z), z); m.group.rotation.y = yaw; scene.add(m.group); addBox(x, z, 0.35, 0.35, 0); return m; }
function miniTemple(x, z, rot, name) {
  const y = groundAt(x, z) - 0.2; BT.cbox.add(MX(x, y, z, rot, 7, 3.4, 5.5), new THREE.Color('#d8cdb8')); BT.cbox.add(MX(x, y + 3.4, z, rot, 7.6, 0.5, 6.1), new THREE.Color('#a8402f'));
  BT.cbox.add(MX(x, y + 3.9, z, rot, 5.2, 0.9, 4.2), new THREE.Color('#b3312c')); const f = fwd(rot); BT.cbox.add(MX(x + f.x * 2.76, y, z + f.z * 2.76, rot, 1.6, 2.4, 0.08), COL.door);
  addSign(name, 0.75, x + f.x * 2.85, y + 2.85, z + f.z * 2.85, rot, { color: '#f4d27a', bg: '#7c2f25', size: 72, pad: 10 }); addBox(x, z, 3.5, 2.75, rot);
}
function buildDadan() {
  buildXiamen();
  // 地形網格（獨立的一塊）
  const X0 = DADAN.x - 110, Z0 = DADAN.z - 170, S = 3, nx = 74, nz = 114, pos = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3), idx = [];
  const sand = new THREE.Color('#d8c8a0'), wet = new THREE.Color('#8f8a7a'), rock = new THREE.Color('#8c877c'), g1 = new THREE.Color('#6a8a48'), g2 = new THREE.Color('#4f6b38'), c = new THREE.Color();
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = X0 + i * S, z = Z0 + j * S, h = dadanGround(x, z), sd = dadanSD(x, z), k = j * nx + i, sl = Math.hypot(dadanGround(x + 1.5, z) - dadanGround(x - 1.5, z), dadanGround(x, z + 1.5) - dadanGround(x, z - 1.5)) / 3;
    pos[k * 3] = x; pos[k * 3 + 1] = h; pos[k * 3 + 2] = z;
    if (sd < 0) c.copy(wet); else if (sd < 7 || h < 2.0) c.copy(sand); else if (sl > 0.75) c.copy(rock); else c.copy(g1).lerp(g2, fbm(x * 0.04, z * 0.04)).lerp(rock, smooth(0.45, 0.75, sl));
    col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b; if (i < nx - 1 && j < nz - 1) idx.push(k, k + nx, k + 1, k + 1, k + nx, k + nx + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const land = new THREE.Mesh(geo, mVC); land.receiveShadow = true; scene.add(land);
  // 生明路：沙頸上連接南北山的戰車道
  const road = [], rp = [], N = 40; for (let k = 0; k <= N; k++) { const t = k / N, x = lerp(DN.x + 2, DS.x + 6, t), z = lerp(DN.z + 26, DS.z - 30, t); road.push({ x, z }); }
  for (let k = 0; k < road.length; k++) { const a = road[k], b = road[Math.min(k + 1, road.length - 1)], q = road[Math.max(k - 1, 0)], dx = b.x - q.x, dz = b.z - q.z, l = Math.hypot(dx, dz) || 1, ux = -dz / l * 1.7, uz = dx / l * 1.7; for (const sd of [-1, 1]) rp.push(a.x + ux * sd, groundAt(a.x + ux * sd, a.z + uz * sd) + 0.08, a.z + uz * sd); }
  const ri = []; for (let k = 0; k < road.length - 1; k++) { const a = k * 2; ri.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); rg.setIndex(ri); rg.computeVertexNormals(); const rm = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: 0x8d8a84, roughness: 0.95, side: THREE.DoubleSide })); rm.receiveShadow = true; scene.add(rm);
  const mid = road[20]; stele(mid.x - 6.5, mid.z + 6, Math.PI / 2, '生明路', 2.2, '#2f4a6b');
  // 心戰牆：北山西北坡，面向廈門
  const wr = Math.atan2(-0.62, -0.78), wf = fwd(wr), W = dadanLL(-16, -88 + 0); W.x = DN.x - 20; W.z = DN.z - 22; const wy = groundAt(W.x, W.z);
  BT.cbox.add(MX(W.x, wy - 0.5, W.z, wr, 27, 6.6, 0.8), new THREE.Color('#ece6d8')); for (const sx of [-12, -4, 4, 12]) BT.cbox.add(MX(W.x - wf.z * sx - wf.x * 0.9, wy - 0.5, W.z + wf.x * sx - wf.z * 0.9, wr, 0.6, 4.5, 1.6), COL.concrete); addBox(W.x, W.z, 13.5, 0.7, wr);
  const s = signMesh('三民主義統一中國', 4.2, { color: '#d42a1e', bg: '#ece6d8', size: 140, pad: 8 }), sw = s.geometry.parameters.width; if (sw > 25.5) s.scale.setScalar(25.5 / sw);
  s.position.set(W.x + wf.x * 0.42, wy + 3.0, W.z + wf.z * 0.42); s.rotation.y = wr; s.material.emissive = new THREE.Color(0xff2a18); s.material.emissiveMap = s.material.map; s.material.emissiveIntensity = 0; scene.add(s);
  dadan.wall = { x: W.x + wf.x * 9, z: W.z + wf.z * 9 }; dadan.sign = s; stele(W.x - wf.x * 4 + wf.z * 15, W.z - wf.z * 4 - wf.x * 15, wr + Math.PI, '心戰牆', 1.6, '#2f4a6b');
  if (!secretsFound.has('大膽島')) { const sx = W.x - wf.x * 2.2, sz = W.z - wf.z * 2.2, p = addPickup('secret', sx, sz, 0, groundAt(sx, sz)); p.secret = '大膽島'; p.perm = false; }
  // 北山：北安寺、神雞之墓、神泉茶坊
  miniTemple(DN.x + 16, DN.z - 6, -Math.PI / 2, '北安寺');
  { const x = DN.x + 22, z = DN.z + 6, y = groundAt(x, z); const m = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8, 0, 6.29, 0, Math.PI / 2), mat('#9c968a')); m.position.set(x, y - 0.1, z); scene.add(m); addBox(x, z, 1.4, 1.4, 0); stele(x - 2.6, z, -Math.PI / 2, '護島神雞之墓', 1.5); }
  { const x = DN.x - 6, z = DN.z + 18, rot = Math.PI / 2 + 0.3, y = groundAt(x, z) - 0.2, f = fwd(rot); BT.cbox.add(MX(x, y, z, rot, 8, 3.2, 6), new THREE.Color('#efe4cc')); BT.cbox.add(MX(x, y + 3.2, z, rot, 8.6, 0.4, 6.6), COL.slab); addBox(x, z, 4, 3, rot);
    addSign('神泉茶坊', 0.8, x + f.x * 3.05, y + 2.5, z + f.z * 3.05, rot, { color: '#fff', bg: '#5a7d3a', size: 72, pad: 10 });
    addAction({ x: x + f.x * 4.5, z: z + f.z * 4.5, r: 3, inside: null, label: () => '喝一杯神泉茶、吃神泉蛋糕（$50，回滿血）', fn: () => { if (player.money < 50) return toast('錢不夠'); addMoney(-50); player.hp = 100; sfx('chime', 0.3); subtitle('<b>茶坊老闆</b>：「用神泉的水泡的茶，喝了整個人都精神起來！」', 4); } }); }
  // 南山：燈塔底座、大膽寺、島孤人不孤、茜露墓園
  { const x = DS.x, z = DS.z + 2, y = groundAt(x, z); const b = new THREE.Mesh(mergeGeos([[new THREE.CylinderGeometry(3, 3.4, 3.2, 16), '#d6d0c2', new THREE.Matrix4().makeTranslation(0, 1.4, 0)], [new THREE.CylinderGeometry(2.2, 2.4, 1.4, 16, 1, true), '#bdb6a6', new THREE.Matrix4().makeTranslation(0, 3.6, 0)], [new THREE.TorusGeometry(2.6, 0.08, 6, 24).rotateX(Math.PI / 2), '#5b4435', new THREE.Matrix4().makeTranslation(0, 3.1, 0)]]), mVC2); b.position.set(x, y - 0.2, z); b.castShadow = true; scene.add(b); addBox(x, z, 3, 3, 0); stele(x + 5, z - 3.5, Math.PI, '大膽燈塔', 1.4, '#2f4a6b'); }
  miniTemple(DS.x - 20, DS.z + 14, Math.PI / 2, '大膽寺');
  stele(DS.x + 8, DS.z - 26, Math.PI, '島孤人不孤', 3.4);
  stele(DS.x + 26, DS.z + 18, -Math.PI / 2, '戰鬥英雄茜露之墓', 1.4, '#2f4a6b');
  // 海岸碉堡
  for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283 + 0.4, c0 = k < 3 ? DN : DS; for (let r = 1.0; r > 0.5; r -= 0.04) { const x = c0.x + Math.sin(a) * c0.rx * r, z = c0.z + Math.cos(a) * c0.rz * r, sd = dadanSD(x, z); if (sd > 6 && sd < 14 && boxFree(x, z, 3.5) && !(z > DN.z + 24 && z < DS.z - 26)) { const y = groundAt(x, z), rot = a; BT.cbox.add(MX(x, y - 0.6, z, rot, 5, 3, 4), new THREE.Color('#7f8273')); BT.cbox.add(MX(x + Math.sin(a) * 2.02, y + 1.3, z + Math.cos(a) * 2.02, rot, 2.6, 0.35, 0.05), COL.dark); addBox(x, z, 2.5, 2, rot); break; } } }
  // 大膽碼頭（東側，面向烈嶼）＋交通船
  const pz = lerp(DN.z, DS.z, 0.48), px0 = lerp(DN.x, DS.x, 0.48) + 12, L = 38, pcx = px0 + L / 2;
  const pm = new THREE.Mesh(new THREE.BoxGeometry(L, 1.3, 6), mat('#a9a6a0', 0.95)); pm.position.set(pcx, 0.6, pz); pm.receiveShadow = true; scene.add(pm); addDeck(pcx, pz, L / 2, 3, 0, 1.25);
  addSign('大膽碼頭', 0.9, px0 + 1, 3.4, pz - 3.2, Math.PI, { color: '#fff', bg: '#1d3a63', size: 72, pad: 10 });
  dadan.pier = { x: px0 + 4, z: pz }; const bt = makeVehicle('boat', pcx + 6, pz + 7, Math.PI / 2); bt.perm = true;
  const sol = soldierModel(px0 + 3, pz - 2.2, -Math.PI / 2); sol.armR.rotation.x = -2.6;
  addAction({ x: px0 + 3, z: pz - 2.2, r: 3.2, inside: null, label: () => '跟衛兵聊聊大膽島', fn: () => { subtitle('<b>衛兵</b>：「' + DADAN_TALK[dadan.talk++ % DADAN_TALK.length] + '」', 7); } });
  addAction({ x: px0 + 8, z: pz, r: 3.5, inside: null, label: () => '搭交通船回九宮碼頭（$100）', fn: () => ferry(false) });
  soldierModel(W.x + wf.x * 6 + wf.z * 15, W.z + wf.z * 6 - wf.x * 15, wr); soldierModel(DS.x + 5, DS.z - 6, Math.PI);
  // 九宮碼頭：交通船
  const J0 = roadNodes.JG9; if (J0) { const e = J0.edges[0], i = e.a === J0 ? Math.min(3, e.pts.length - 1) : Math.max(0, e.pts.length - 4), J = { x: (e.pts[i].x + J0.x) / 2, z: (e.pts[i].z + J0.z) / 2 }; dadan.back = { x: e.pts[i].x, z: e.pts[i].z }; const ic = iconSprite('船', '#1d6fa5'); ic.scale.set(1.6, 1.6, 1); ic.position.set(J.x, heightAt(J.x, J.z) + 3.4, J.z); scene.add(ic); addAction({ x: J.x, z: J.z, r: Math.max(9, Math.hypot(e.pts[i].x - J0.x, e.pts[i].z - J0.z) / 2 + 5), inside: null, label: () => '搭交通船到大膽島（$100）', fn: () => ferry(true) }); }
  // 樹
  for (let k = 0; k < 700; k++) { const x = DADAN.x + rr(-100, 100), z = DADAN.z + rr(-160, 160); if (!inDadan(x, z) || dadanSD(x, z) < 12 || groundAt(x, z) < 3) continue; if (Math.abs(x - lerp(DN.x + 2, DS.x + 6, clamp((z - DN.z - 26) / (DS.z - 30 - DN.z - 26), 0, 1))) < 4 && z > DN.z + 20 && z < DS.z - 24) continue; if (!boxFree(x, z, 4.5) || fbm(x * 0.03 + 1, z * 0.03) < 0.42) continue; tree(x, z, rand() < 0.6 ? 1 : 0, rr(0.8, 1.15)); }
  PLACES.push({ name: '心戰牆', x: W.x, z: W.z, r: 22 }, { name: '大膽碼頭', x: pcx, z: pz, r: 26 }, { name: '生明路', x: mid.x, z: mid.z, r: 30 }, { name: '大膽島・北山', x: DN.x, z: DN.z, r: 70 }, { name: '大膽島・南山', x: DS.x, z: DS.z, r: 80 }, { name: '大膽島', x: DADAN.x, z: DADAN.z, r: 190 });
}
/* 對岸：廈門島南岸天際線（距大膽島約 4.4 公里）與「一國兩制 統一中國」標語牆 */
function buildXiamen() {
  const g = []; let x = -4100; while (x < -2320) { const t = (x + 4100) / 1780, zc = lerp(380, 40, t), w = rr(16, 42), h = rr(25, 160) * (0.6 + 0.4 * Math.sin(t * 9 + 1) ** 2), dd = rr(16, 34), zz = zc - rr(30, 160); g.push([new THREE.BoxGeometry(w, h, dd), pick(['#9aa3ab', '#b5bcc2', '#8c939a', '#c4c9cc', '#a7b0b8']), new THREE.Matrix4().makeTranslation(x, h / 2 - 2, zz)]); for (let k = 0; k < dd * h / 70; k++) CITY_LIGHTS.push(x + w / 2 + 0.6, rr(2, h - 4), zz + rr(-dd / 2 + 1, dd / 2 - 1)); x += w + rr(2, 22); }
  g.push([new THREE.BoxGeometry(1800, 6, 260), '#7d8a6a', new THREE.Matrix4().makeTranslation(-3210, 1, 120)]);
  const m = new THREE.Mesh(mergeGeos(g), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, fog: false, transparent: true, opacity: 0.62 })); scene.add(m);
  const sg = signMesh('一國兩制　統一中國', 11, { color: '#c0392b', bg: '#e9e4d8', size: 120, pad: 8 }); sg.material.fog = false; sg.position.set(-2860, 9, 268); sg.rotation.y = Math.atan2(DADAN.x - -2860, DADAN.z - 268); scene.add(sg);
}
function ferry(go) {
  if (game.busy) return; if (weather.cur === 4) { toast('颱風天，交通船停駛'); return; } if (player.money < 100) { toast('錢不夠'); return; } if (player.veh) exitForce(); addMoney(-100); game.busy = true;
  fade(go ? '交通船前往大膽島' : '交通船返回九宮碼頭', () => { const t = go ? dadan.pier : dadan.back; player.pos.set(t.x, heightAt(t.x, t.z), t.z); player.yaw = go ? -Math.PI / 2 : Math.PI; cam.yaw = player.yaw; cam.pos.set(t.x - Math.sin(player.yaw) * 5, player.pos.y + 3, t.z - Math.cos(player.yaw) * 5); game.busy = false; lastZone = '';
    if (go) banner('大膽島', '前線中的前線　距離廈門 4.4 公里'); });
}
function dadanGo() { if (wanted.stars) { toast('被通緝時不能傳送'); return; } if (player.plane || game.busy) return; if (game.mapOpen) toggleMap(); if (player.veh) exitForce(); game.busy = true; fade('傳送中', () => { const t = dadan.pier; player.pos.set(t.x, heightAt(t.x, t.z), t.z); player.yaw = -Math.PI / 2; cam.yaw = player.yaw; cam.pos.copy(player.pos); game.busy = false; lastZone = ''; }); }
function updateDadan() { if (!dadan.sign) return; const on = env.tod >= 19 && env.tod < 21; const m = dadan.sign.material, k = on ? 1.6 + Math.sin(game.time * 9) * 0.08 : 0; m.emissiveIntensity += (k - m.emissiveIntensity) * 0.1; }
function dadanMini(g, px, pz) {
  if (px > TX0 + 700) return; const X = x => mpx(x) - mpx(px), Y = z => mpz(z) - mpz(pz), poly = (pts, col) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.closePath(); g.fillStyle = col; g.fill(); };
  const ell = (c, k, col) => { g.beginPath(); g.ellipse(X(c.x), Y(c.z), c.rx * k * MS, c.rz * k * MS, 0, 0, 7); g.fillStyle = col; g.fill(); };
  ell(DN, 1, '#d8c8a0'); ell(DS, 1, '#d8c8a0'); poly([[DN.x - 13, DN.z], [DN.x + 13, DN.z], [DS.x + 13, DS.z], [DS.x - 13, DS.z]], '#d8c8a0'); ell(DN, 0.72, '#7d9a63'); ell(DS, 0.72, '#7d9a63');
  g.beginPath(); g.moveTo(X(DN.x + 2), Y(DN.z + 26)); g.lineTo(X(DS.x + 6), Y(DS.z - 30)); g.lineWidth = 3.4 * MS; g.strokeStyle = '#e8e2d4'; g.stroke();
  if (dadan.pier) { g.fillStyle = '#bdb9b0'; g.fillRect(X(dadan.pier.x - 4), Y(dadan.pier.z - 3), 38 * MS, 6 * MS); }
}
let dadanInset = null;
function drawDadanInset(g, sc) {
  const W = mapCv.width, H = mapCv.height, iw = W * 0.15, ih = iw * 1.35, ix = W * 0.015, iy = H * 0.04, k = ih / 380, X = x => ix + iw / 2 + (x - DADAN.x) * k, Y = z => iy + ih / 2 + 12 / sc + (z - DADAN.z) * k; dadanInset = { ix, iy, iw, ih };
  g.save(); g.fillStyle = 'rgba(20,48,66,0.92)'; g.fillRect(ix, iy, iw, ih); g.lineWidth = 2 / sc; g.strokeStyle = '#f4efe2'; g.strokeRect(ix, iy, iw, ih); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
  const ell = (c, m, col) => { g.beginPath(); g.ellipse(X(c.x), Y(c.z), c.rx * m * k, c.rz * m * k, 0, 0, 7); g.fillStyle = col; g.fill(); };
  ell(DN, 1, '#d8c8a0'); ell(DS, 1, '#d8c8a0'); g.beginPath(); g.moveTo(X(DN.x - 13), Y(DN.z)); g.lineTo(X(DN.x + 13), Y(DN.z)); g.lineTo(X(DS.x + 13), Y(DS.z)); g.lineTo(X(DS.x - 13), Y(DS.z)); g.closePath(); g.fill(); ell(DN, 0.72, '#7d9a63'); ell(DS, 0.72, '#7d9a63');
  g.beginPath(); g.moveTo(X(DN.x + 2), Y(DN.z + 26)); g.lineTo(X(DS.x + 6), Y(DS.z - 30)); g.lineWidth = 3 * k; g.strokeStyle = '#e8e2d4'; g.stroke();
  if (dadan.pier) { g.fillStyle = '#bdb9b0'; g.fillRect(X(dadan.pier.x - 4), Y(dadan.pier.z - 3), 38 * k, 6 * k); }
  g.textAlign = 'center'; g.textBaseline = 'middle'; const lab = (t, x, z, f = 11) => { g.font = `700 ${f / sc}px ${FONT}`; g.lineWidth = 3 / sc; g.strokeStyle = 'rgba(15,22,28,0.85)'; g.strokeText(t, X(x), Y(z)); g.fillStyle = '#f4efe2'; g.fillText(t, X(x), Y(z)); };
  if (dadan.wall) lab('心戰牆', dadan.wall.x - 20, dadan.wall.z - 12); lab('北山', DN.x + 10, DN.z + 4); lab('南山', DS.x, DS.z + 10); lab('生明路', DN.x - 30, (DN.z + DS.z) / 2, 10); if (dadan.pier) lab('碼頭', dadan.pier.x + 30, dadan.pier.z - 12, 10);
  const wp = wpos(); if (inDadan(wp.x, wp.z)) { g.fillStyle = '#fff'; g.beginPath(); g.arc(X(wp.x), Y(wp.z), 6 / sc, 0, 7); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2 / sc; g.stroke(); }
  g.restore(); g.textAlign = 'center'; g.font = `900 ${13 / sc}px ${FONT}`; g.fillStyle = '#ffd23f'; g.fillText('大膽島', ix + iw / 2, iy + 12 / sc); g.font = `600 ${9.5 / sc}px ${FONT}`; g.fillStyle = '#f4efe2'; g.fillText('實際位置：烈嶼西南約 12 公里・點一下導航到交通船', ix + iw / 2, iy + ih + 11 / sc);
}
function dadanInsetClick(mx, mz) { const r = dadanInset; if (!r || mx < r.ix || mx > r.ix + r.iw || mz < r.iy || mz > r.iy + r.ih + 20) return false; if (!dadan.back) return true; if (mission.type) { toast('任務中不能改導航'); return true; } setTarget(dadan.back.x, dadan.back.z, '九宮碼頭交通船（往大膽島）'); waypoint = true; routeT = 0; toast('已導航到九宮碼頭的交通船'); setTimeout(drawBigMap, 50); return true; }
