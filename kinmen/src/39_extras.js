/* =====================================================================
   電台（程序生成音樂）
   ===================================================================== */
const STATIONS = [
  { name: '金門之聲 FM 98.7', genre: '午後輕音樂', bpm: 78, scale: [0, 2, 4, 7, 9, 11], root: 48, prog: [[0, 4, 7, 11], [9, 12, 16, 19], [2, 5, 9, 12], [7, 11, 14, 17]], drum: 'soft', lead: 'sine', djs: ['這裡是金門之聲，陪你走過浯島的每個午後。', '慢慢開，金門的路，值得慢慢看。', '剛剛聽說模範街的燒餅又排隊了。'] },
  { name: '浯島搖滾台 FM 101.3', genre: '搖滾', bpm: 136, scale: [0, 3, 5, 7, 10], root: 40, prog: [[0, 7, 12], [5, 12, 17], [3, 10, 15], [7, 14, 19]], drum: 'rock', lead: 'sawtooth', djs: ['浯島搖滾台！油門踩下去！', '下一首，獻給被警察追的那位朋友。', '金門大橋上開到底，音量也開到底！'] },
  { name: '南音古調 AM 666', genre: '南管・古調', bpm: 64, scale: [0, 2, 4, 7, 9], root: 55, prog: [[0, 7], [5, 12], [7, 14], [0, 7]], drum: 'gong', lead: 'triangle', djs: ['南音悠悠，聽見古厝的燕尾在風裡。', '瓊林、山后、水頭，聚落的老故事都在曲子裡。'] },
  { name: '關閉', off: true }];
const radio = { st: 0, next: 0, step: 0, gain: null, bar: 0, mel: 0, djT: 20 };
function radioInit() { if (!AC || radio.gain) return; radio.gain = AC.createGain(); radio.gain.gain.value = 0; radio.gain.connect(MASTER); }
function radioNote(type, f, t, dur, vol, dest = radio.gain) { const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05); }
let noiseBuf = null;
function radioNoise(t, dur, vol, hp) { if (!noiseBuf) { noiseBuf = AC.createBuffer(1, 22050, 44100); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); f.type = hp ? 'highpass' : 'bandpass'; f.frequency.value = hp || 1800; s.buffer = noiseBuf; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(f); f.connect(g); g.connect(radio.gain); s.start(t); s.stop(t + dur + 0.02); }
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function radioTick() {
  if (!AC) return; radioInit(); const S = STATIONS[radio.st], on = !!player.veh || !!player.plane; radio.gain.gain.value += ((on && !S.off ? 0.55 : 0) - radio.gain.gain.value) * 0.1;
  if (S.off || !on) { radio.next = AC.currentTime; return; } const sp = 60 / S.bpm / 4; if (radio.next < AC.currentTime) radio.next = AC.currentTime + 0.05;
  while (radio.next < AC.currentTime + 0.25) {
    const t = radio.next, st = radio.step % 16, bar = Math.floor(radio.step / 16) % 4, ch = S.prog[bar];
    if (S.drum === 'rock') { if (st % 8 === 0) radioNote('sine', 90, t, 0.25, 0.6); if (st % 8 === 4) radioNoise(t, 0.18, 0.35); if (st % 2 === 0) radioNoise(t, 0.04, 0.12, 7000); if (st % 2 === 0) for (const n of ch) radioNote('sawtooth', mtof(S.root + n), t, sp * 1.8, 0.04); radioNote('triangle', mtof(S.root - 12 + ch[0]), t, sp * 0.9, 0.18); }
    else if (S.drum === 'soft') { if (st === 0 || st === 10) radioNote('sine', 70, t, 0.3, 0.45); if (st === 4 || st === 12) radioNoise(t, 0.12, 0.12); if (st % 2 === 1) radioNoise(t, 0.03, 0.05, 8000); if (st === 0) for (const n of ch) radioNote('sine', mtof(S.root + 12 + n), t, sp * 15, 0.045); if (st % 4 === 0) radioNote('triangle', mtof(S.root - 12 + ch[st % 8 === 0 ? 0 : 2]), t, sp * 3.5, 0.16); }
    else { if (st === 0 && bar === 0) { radioNote('sine', 110, t, 3, 0.18); radioNote('sine', 166, t, 2.5, 0.08); } if (st % 8 === 0) radioNote('triangle', mtof(S.root - 12 + ch[0]), t, sp * 7, 0.12); }
    const melOn = S.drum === 'gong' ? st % 4 === 0 : S.drum === 'rock' ? st % 2 === 0 && Math.random() < 0.6 : st % 2 === 0 && Math.random() < 0.55;
    if (melOn) { radio.mel = clamp(radio.mel + Math.floor(Math.random() * 5) - 2, 0, S.scale.length * 2 - 1); const deg = radio.mel, n = S.scale[deg % S.scale.length] + 12 * Math.floor(deg / S.scale.length); radioNote(S.lead, mtof(S.root + 12 + n), t, sp * (S.drum === 'gong' ? 5 : 1.8), S.lead === 'sawtooth' ? 0.05 : 0.09); }
    radio.next += sp; radio.step++;
  }
  radio.djT -= 1 / 60; if (radio.djT <= 0) { radio.djT = rr(40, 80); toast('📻 ' + pick(S.djs.concat([`現在時間 ${$('clock').textContent}，金門${WEATHER[weather.cur].name}。`], typeof kinmenNews === 'function' ? kinmenNews() : []))); }
}
function nextStation() { radio.st = (radio.st + 1) % STATIONS.length; const S = STATIONS[radio.st]; toast(S.off ? '📻 電台關閉' : `📻 ${S.name}（${S.genre}）`); radio.djT = 8; }

/* =====================================================================
   手機
   ===================================================================== */
function phoneMenu(title, items) { openMenu(title, items.map(it => ({ ...it, free: true }))); game.menu.phone = true; }
function openPhone() {
  if (game.menu) { closeMenu(); return; } if (game.busy) return;
  phoneMenu('📱 手機', [...callItems(), { n: '聯絡人', d: '叫車、軍火、律師、修車', fn: phoneContacts }, { n: '任務', d: '主線進度與支線', fn: phoneMissions }, { n: '委託', d: storyDone() ? SIDE.filter(j => sideDone.has(j.id)).length + '/' + SIDE.length + ' 完成・朋友的請託' : '🔒 主線破關後開放', fn: phoneSide }, { n: '打工', d: '外送員・計程車・警察', fn: phoneJobs }, { n: '安全屋', d: homes.filter(h => h.own).length + ' 間・睡覺存檔・車庫', fn: phoneHomes }, { n: '生態圖鑑', d: dexGot.size + '/' + DEX.length + '・鸕鶿、水獺、鱟、白鷺、蜂虎、戴勝', fn: phoneDex }, { n: '地圖・傳送', d: '點地圖可設導航點', fn: () => { closeMenu(); toggleMap(); } },
    { n: '電台', d: STATIONS[radio.st].name, fn: () => { nextStation(); openPhone(); openPhone(); } }, { n: '天氣', d: '目前：' + WEATHER[weather.cur].name, fn: phoneWeather }, { n: '季節', d: SEASONS[season].n + '天・影響候鳥', fn: phoneSeason }, { n: '房產', d: props.filter(p => p.own).length + ' 間・每天 +$' + props.filter(p => p.own).reduce((a, p) => a + p.inc, 0).toLocaleString(), fn: phoneProps }, { n: '效能顯示', d: PERF.on ? '開（點一下關閉）' : '關（測手機流暢度用）', fn: () => { closeMenu(); perfToggle(); } }, { n: '脫困', d: '卡住時把你拉回最近的路上', fn: () => { closeMenu(); rescuePlayer(); } }, { n: '生存挑戰', d: SURV.on ? `進行中 ${Math.floor(SURV.hours)}/${SURV.goal} 小時` : '身無分文活過 24／100 小時', fn: phoneSurvival }, { n: '存檔', d: '儲存進度', fn: () => { if (wanted.stars) { toast('被通緝時不能存檔'); return; } saveGame(); saveStory(); toast('已存檔'); closeMenu(); } }]);
}
function nearRoadSpot(r = 8) { const n = nearestRoad(player.pos.x + Math.sin(player.yaw) * r, player.pos.z + Math.cos(player.yaw) * r, 120); return n ? { x: n.p.x, z: n.p.z, yaw: Math.atan2(n.p.tx, n.p.tz) } : null; }
function phoneContacts() {
  const pay = (n, f) => () => { if (player.money < n) { toast('錢不夠'); return; } addMoney(-n); f(); closeMenu(); };
  phoneMenu('📱 聯絡人', [
    { n: '金門計程車行', d: '$100 叫一台空車到附近', fn: pay(100, () => { const s = nearRoadSpot(); if (!s) return toast('附近沒有路'); const v = makeVehicle('taxi', s.x, s.z, s.yaw); v.perm = true; toast('計程車到了'); }) },
    { n: '老朋友阿明', d: '$300 借你一台休旅車', fn: pay(300, () => { const s = nearRoadSpot(); if (!s) return toast('附近沒有路'); const v = makeVehicle('suv', s.x, s.z, s.yaw); v.perm = true; toast('車停在路邊了'); }) },
    { n: '軍火商', d: '$600 送彈藥和手榴彈到你身邊', fn: pay(600, () => { addPickup('ammo', player.pos.x + 1.5, player.pos.z); player.nades = (player.nades || 0) + 2; refreshWeapon(); toast('彈藥送到了'); }) },
    { n: '律師', d: '撤銷通緝：每顆星 $1,500', fn: () => { if (!wanted.stars) return toast('你沒被通緝'); const n = wanted.stars * 1500; pay(n, () => { clearWanted(); if (player.loot) endRob(true); toast('律師搞定了'); })(); } },
    { n: '修車廠', d: '$250 修好目前的車', fn: () => { if (!player.veh) return toast('你不在車上'); pay(250, () => { player.veh.hp = 100; player.veh.burn = 0; toast('車修好了'); })(); } },
    { n: '阿德叔', d: '打電話問近況', fn: () => { closeMenu(); const C = CHAPTERS[story.ch]; subtitle(C ? `<b>阿德叔</b>：「${C.blurb}」` : '<b>阿德叔</b>：「有空回水頭吃飯啊！」', 6); } }]);
}
function phoneMissions() {
  const items = CHAPTERS.map((C, i) => ({ n: (i < story.ch ? '✅ ' : i === story.ch ? '▶ ' : '🔒 ') + C.title, d: i === story.ch ? C.blurb : '', fn: () => { if (i === story.ch && storyMarker) { setTarget(storyMarker.x, storyMarker.z, C.title); toast('已設定導航'); closeMenu(); } } }));
  items.push({ n: `風獅爺 ${mission.lions}/${lions.length}`, d: '找全部有獎金', fn: () => { const L = lions.filter(l => !l.found).sort((a, b) => Math.hypot(a.x - player.pos.x, a.z - player.pos.z) - Math.hypot(b.x - player.pos.x, b.z - player.pos.z))[0]; if (L && !mission.type) { setTarget(L.x, L.z, '風獅爺'); waypoint = true; closeMenu(); } } });
  phoneMenu('📱 任務', items);
}
function phoneWeather() { phoneMenu('📱 天氣（點選可切換）', WEATHER.map((w, i) => ({ n: (i === weather.cur ? '● ' : '') + w.name, d: w.desc, fn: () => { setWeather(i); closeMenu(); } }))); }

/* ---------- 地圖導航點 ---------- */
let waypoint = false;
/* 大地圖縮放：滾輪、雙指捏合；放大後可拖曳平移 */
const MZ = { z: 1, tx: 0, ty: 0, pts: new Map(), drag: false, d0: 0, z0: 1, m0: null, t0: null };
function mapZoomApply() { const cv = $('bigcv'), W = cv.clientWidth, H = cv.clientHeight; MZ.z = clamp(MZ.z, 1, 4); MZ.tx = clamp(MZ.tx, W * (1 - MZ.z), 0); MZ.ty = clamp(MZ.ty, H * (1 - MZ.z), 0); cv.style.transform = MZ.z > 1.001 ? `translate(${MZ.tx}px,${MZ.ty}px) scale(${MZ.z})` : ''; clearTimeout(MZ.rd); MZ.rd = setTimeout(() => { if (game.mapOpen && Math.abs((MZ.lastZ || 1) - MZ.z) > 0.3) { MZ.lastZ = MZ.z; drawBigMap(); } }, 250); }
function mapZoomAt(px, py, k) { const z1 = clamp(MZ.z * k, 1, 4), f = z1 / MZ.z; MZ.tx = px - (px - MZ.tx) * f; MZ.ty = py - (py - MZ.ty) * f; MZ.z = z1; mapZoomApply(); }
function mapZoomReset() { MZ.lastZ = 1; MZ.z = 1; MZ.tx = MZ.ty = 0; MZ.pts.clear(); const cv = $('bigcv'); if (cv) cv.style.transform = ''; }
function mapZoomInit() {
  const box = $('cvbox'); if (!box || box.zoomOn) return; box.zoomOn = true; const rel = e => { const r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  box.addEventListener('wheel', e => { e.preventDefault(); const [x, y] = rel(e); mapZoomAt(x, y, e.deltaY < 0 ? 1.25 : 0.8); }, { passive: false });
  box.addEventListener('pointerdown', e => { MZ.pts.set(e.pointerId, rel(e)); MZ.drag = false; if (MZ.pts.size === 2) { const [a, b] = [...MZ.pts.values()]; MZ.d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); MZ.z0 = MZ.z; MZ.m0 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; MZ.t0 = [MZ.tx, MZ.ty]; } else { MZ.m0 = rel(e); MZ.t0 = [MZ.tx, MZ.ty]; } });
  box.addEventListener('pointermove', e => { if (!MZ.pts.has(e.pointerId)) return; MZ.pts.set(e.pointerId, rel(e));
    if (MZ.pts.size === 2) { const [a, b] = [...MZ.pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; if (MZ.d0 > 10) { const z1 = clamp(MZ.z0 * d / MZ.d0, 1, 4), f = z1 / MZ.z0; MZ.z = z1; MZ.tx = m[0] - (MZ.m0[0] - MZ.t0[0]) * f; MZ.ty = m[1] - (MZ.m0[1] - MZ.t0[1]) * f; mapZoomApply(); } MZ.drag = true; }
    else if (MZ.z > 1.001) { const p = rel(e), dx = p[0] - MZ.m0[0], dy = p[1] - MZ.m0[1]; if (Math.abs(dx) + Math.abs(dy) > 6) MZ.drag = true; if (MZ.drag) { MZ.tx = MZ.t0[0] + dx; MZ.ty = MZ.t0[1] + dy; mapZoomApply(); } } });
  const up = e => { MZ.pts.delete(e.pointerId); if (MZ.pts.size === 1) { MZ.m0 = [...MZ.pts.values()][0]; MZ.t0 = [MZ.tx, MZ.ty]; } };
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  box.addEventListener('click', e => { if (MZ.drag) { e.stopImmediatePropagation(); e.preventDefault(); MZ.drag = false; } }, true);
}
function mapClick(e) {
  const cv = $('bigcv'), r = cv.getBoundingClientRect(), sc = r.width / mapCv.width, x = (e.clientX - r.left) / sc / MS + TX0, z = (e.clientY - r.top) / sc / MS + TZ0;
  if (dadanInsetClick((e.clientX - r.left) / sc, (e.clientY - r.top) / sc)) return;
  { const mx = (e.clientX - r.left) / sc, my = (e.clientY - r.top) / sc; let hit = null, bd = 12 / sc; for (const b of mapBlips) if (b.stop) { const d = Math.hypot(b.X - mx, b.Y - my); if (d < bd) { bd = d; hit = b; } }
    if (hit && !(mapHover && mapHover.stop === hit.stop)) { mapHover = hit; drawBigMap(); toast(`🚌 ${hit.stop.name}：${hit.stop.lines || ''} 路（再點一次設為導航點）`); return; } }
  if (mission.type) { toast('任務中不能改導航'); return; } if (waypoint && target && Math.hypot(target.x - x, target.z - z) < 60) { clearTarget(); waypoint = false; toast('已取消導航'); drawBigMap(); return; }
  const n = nearestRoad(x, z, 400); setTarget(n ? n.p.x : x, n ? n.p.z : z, '導航點'); waypoint = true; routeT = 0; toast('已設定導航點'); setTimeout(drawBigMap, 50);
}

/* =====================================================================
   戰鬥：蹲下掩護、翻滾、手榴彈、警用直升機
   ===================================================================== */
const nades = [];
function throwNade() {
  if (player.veh || player.plane || game.busy) return; if (!(player.nades > 0)) { toast('沒有手榴彈（軍品店有賣）'); return; } player.nades--; refreshWeapon();
  camera.getWorldDirection(_d); const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mat('#3d4630')); m.castShadow = true; m.position.set(player.pos.x, player.pos.y + 1.6, player.pos.z); scene.add(m);
  const hl = Math.hypot(_d.x, _d.z) || 1; m.position.x += _d.x / hl * 0.8; m.position.z += _d.z / hl * 0.8; nades.push({ m, v: new V3(_d.x / hl * 15, 7 + clamp(_d.y, -0.4, 0.6) * 9, _d.z / hl * 15), t: 2.4 }); player.punch = 0.3; sfx('swish', 0.3);
}
function updateNades(dt) { for (let i = nades.length - 1; i >= 0; i--) { const n = nades[i], p = n.m.position; n.v.y -= 18 * dt; const ox = p.x, oz = p.z; p.addScaledVector(n.v, dt); if (!boxFree(p.x, p.z, 0.12) && p.y < Math.max(0, groundAt(p.x, p.z)) + 14) { p.x = ox; p.z = oz; n.v.x *= -0.4; n.v.z *= -0.4; } const g = heightAt(p.x, p.z) + 0.12; if (p.y < g) { p.y = g; n.v.y *= -0.35; n.v.x *= 0.6; n.v.z *= 0.6; } n.t -= dt; if (n.t <= 0) { scene.remove(n.m); nades.splice(i, 1); explode(p.x, p.y, p.z, null); for (const c of [...cops]) if (Math.hypot(c.pos.x - p.x, c.pos.z - p.z) < 9) killCop(c); if (heli && Math.hypot(heli.pos.x - p.x, heli.pos.z - p.z, heli.pos.y - p.y) < 8) hitHeli(400); crime(1); } } }
function dodge() { if (player.veh || player.plane || player.rollT > 0 || player.air || game.busy) return; const ax = axis(); const f = fwd(cam.yaw); let dx = f.x * ax.y - f.z * ax.x, dz = f.z * ax.y + f.x * ax.x; const l = Math.hypot(dx, dz); if (l < 0.1) { dx = Math.sin(player.yaw); dz = Math.cos(player.yaw); } else { dx /= l; dz /= l; } player.roll = { x: dx, z: dz }; player.rollT = 0.55; player.crouch = false; sfx('swish', 0.25); }
function updateDodge(dt) { if (!(player.rollT > 0)) return; player.rollT -= dt; const px = player.pos.x, pz = player.pos.z, sp = 9; const nx = px + player.roll.x * sp * dt, nz = pz + player.roll.z * sp * dt; if (groundAt(nx, nz) > -0.9 || deckY(nx, nz) !== null || bridgeY(nx, nz) !== null) { player.pos.x = nx; player.pos.z = nz; } resolveCircle(player.pos, 0.45); player.yaw = Math.atan2(player.roll.x, player.roll.z); const M = player.model; M.body.rotation.x = (1 - player.rollT / 0.55) * Math.PI * 2; M.legL.rotation.x = M.legR.rotation.x = -1.4; M.legL.lo.rotation.x = M.legR.lo.rotation.x = 1.8; M.group.position.y = player.pos.y - 0.5 * Math.sin((1 - player.rollT / 0.55) * Math.PI); if (player.rollT <= 0) { M.body.rotation.x = 0; } }
function poseCrouch(p) { if (p.rig) return; p.legL.rotation.x = p.legR.rotation.x = -1.0; p.legL.lo.rotation.x = p.legR.lo.rotation.x = 1.75; p.body.position.y = -0.38; p.body.rotation.x = 0.2; p.armL.position.y = p.armR.position.y = 1.42 - 0.38; p.legL.position.y = p.legR.position.y = 0.92 - 0.38; }
function unCrouch(p) { if (p.rig) return; p.armL.position.y = p.armR.position.y = 1.42; p.legL.position.y = p.legR.position.y = 0.92; }
function inCover() { if (!player.crouch || player.veh) return false; for (let a = 0; a < 8; a++) if (!boxFree(player.pos.x + Math.cos(a * 0.785) * 1.1, player.pos.z + Math.sin(a * 0.785) * 1.1, 0.2)) return true; for (const v of vehicles) if (Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z) < 3) return true; return false; }

let heli = null;
const heliSpot = new THREE.SpotLight(0xf2f6ff, 0, 160, 0.22, 0.5, 1.2); scene.add(heliSpot, heliSpot.target);
function makeHeli(x, z) {
  const T = (px, py, pz, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new V3(px, py, pz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new V3(1, 1, 1)), g = new THREE.Group();
  g.add(new THREE.Mesh(mergeGeos([[new THREE.SphereGeometry(1.5, 16, 12), '#27496d', T(0, 0, 0.4)], [new THREE.CylinderGeometry(0.45, 0.22, 5, 10), '#27496d', T(0, 0.2, -3.2, Math.PI / 2)], [new THREE.BoxGeometry(0.15, 1.2, 0.9), '#f2f3f4', T(0, 0.8, -5.5)], [new THREE.SphereGeometry(1.2, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#1c2733', T(0, 0.2, 1.1, Math.PI / 2.4)], [new THREE.BoxGeometry(0.1, 0.1, 3), '#222', T(-0.9, -1.4, 0.3)], [new THREE.BoxGeometry(0.1, 0.1, 3), '#222', T(0.9, -1.4, 0.3)], [new THREE.BoxGeometry(3.1, 0.4, 0.04), '#f2f3f4', T(0, -0.2, 1.5)], [new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8), '#333', T(0, 1.6, 0.3)]]), mVC));
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(11, 0.06, 0.35), mTrim); rotor.position.set(0, 1.9, 0.3); g.add(rotor); const rotor2 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.06, 0.35), mTrim); rotor2.rotation.y = Math.PI / 2; rotor.add(rotor2);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.6, 0.18), mTrim); tail.position.set(0.25, 0.8, -5.5); g.add(tail); scene.add(g);
  return { g, rotor, tail, pos: new V3(x, 70, z), hp: 300, fireCd: 2, ang: rand() * 6.28, fall: 0, vy: 0 };
}
function hitHeli(d) { if (!heli || heli.fall) return; heli.hp -= d; if (heli.hp <= 0) { heli.fall = 1; heli.vy = 0; toast('擊落直升機！'); crime(1); } }
function updateHeli(dt) {
  const tgt = wpos();
  if (!heli && wanted.stars >= 3 && !player.inside && !player.tunnel) { const a = rand() * 6.28; heli = makeHeli(tgt.x + Math.cos(a) * 300, tgt.z + Math.sin(a) * 300); toast('🚁 警用直升機出動！'); }
  if (!heli) { heliSpot.intensity = 0; return; }
  const h = heli; h.rotor.rotation.y += dt * 30; h.tail.rotation.x += dt * 40; if (eng && game.frame % 6 === 0 && Math.hypot(h.pos.x - player.pos.x, h.pos.z - player.pos.z) < 160) sfx('thud', 0.05);
  if (h.fall) { h.vy -= 12 * dt; h.pos.y += h.vy * dt; h.g.rotation.y += dt * 5; if (Math.random() < dt * 20) puff(h.pos.x, h.pos.y, h.pos.z, 1, 4, 0.6, smokeTex, false, 1); if (h.pos.y <= heightAt(h.pos.x, h.pos.z)) { explode(h.pos.x, h.pos.y, h.pos.z, null); scene.remove(h.g); heli = null; } else h.g.position.copy(h.pos); heliSpot.intensity = 0; return; }
  if (wanted.stars < 3) { h.pos.y += 15 * dt; h.pos.x += 20 * dt; if (h.pos.y > 160) { scene.remove(h.g); heli = null; heliSpot.intensity = 0; return; } h.g.position.copy(h.pos); return; }
  h.ang += dt * 0.35; const gx = tgt.x + Math.cos(h.ang) * 38, gz = tgt.z + Math.sin(h.ang) * 38, gy = Math.max(0, groundAt(tgt.x, tgt.z)) + 42, sp = Math.min(1, dt * 0.9);
  const dx = gx - h.pos.x, dz = gz - h.pos.z; h.pos.x += dx * sp; h.pos.z += dz * sp; h.pos.y += (gy - h.pos.y) * sp; h.g.position.copy(h.pos); h.g.rotation.set(clamp(Math.hypot(dx, dz) * 0.004, 0, 0.3), Math.atan2(tgt.x - h.pos.x, tgt.z - h.pos.z), 0, 'YXZ');
  heliSpot.position.copy(h.pos); heliSpot.target.position.set(tgt.x, tgt.y, tgt.z); heliSpot.intensity = env.night * 4500;
  h.fireCd -= dt; const d = Math.hypot(tgt.x - h.pos.x, tgt.z - h.pos.z, tgt.y - h.pos.y); if (h.fireCd <= 0 && d < 90 && !player.inside) { h.fireCd = rr(0.25, 0.5); const ph = 0.18 * (inCover() ? 0.4 : 1) * (player.rollT > 0 ? 0 : 1), hit = Math.random() < ph; addTracer({ x: h.pos.x, y: h.pos.y - 1, z: h.pos.z }, { x: tgt.x + (hit ? 0 : rr(-2, 2)), y: tgt.y + (hit ? 1 : rr(0, 2)), z: tgt.z + (hit ? 0 : rr(-2, 2)) }); sfx('shot', 0.08); if (hit) { if (player.veh) { player.veh.hp -= 4; if (player.veh.hp <= 0 && !player.veh.burn) player.veh.burn = 3.2; } else bpHit(6); } }
}

/* =====================================================================
   天氣
   ===================================================================== */
const WEATHER = [{ name: '晴天', desc: '陽光普照', sun: 1, fog: [260, 3000], cloud: 0.9, rain: 0 }, { name: '多雲', desc: '雲層較厚', sun: 0.55, fog: [220, 2400], cloud: 1, rain: 0 }, { name: '下雨', desc: '路面濕滑', sun: 0.18, fog: [60, 700], cloud: 1, rain: 1 }, { name: '大霧', desc: '金門霧季，機場停飛', sun: 0.4, fog: [4, 150], cloud: 0.3, rain: 0 }, { name: '颱風', desc: '狂風暴雨，飛機、交通船停駛', sun: 0.24, fog: [40, 420], cloud: 1, rain: 1.6 }];
const weather = { cur: 0, t: 240, k: { sun: 1, near: 260, far: 3000, rain: 0 }, flash: 0 };
let rainMesh = null;
function setWeather(i) { weather.cur = i; weather.t = rr(200, 420); toast('🌤 天氣：' + WEATHER[i].name + (i === 3 ? '（機場停飛）' : i === 4 ? '（颱風警報！飛機、船班停駛）' : '')); }
function initRain() { const N = 2600, pos = new Float32Array(N * 6); for (let i = 0; i < N; i++) { const x = rr(-45, 45), y = rr(0, 40), z = rr(-45, 45); pos.set([x, y, z, x + 0.05, y - 0.9, z + 0.05], i * 6); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); rainMesh = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xd0dae6, transparent: true, opacity: 0, depthWrite: false })); rainMesh.frustumCulled = false; scene.add(rainMesh); }
function applyWeather(dt) {
  if (!rainMesh) initRain(); weather.t -= dt; if (weather.t <= 0 && !story.active) setWeather(seasonWeatherPick());
  const W = WEATHER[weather.cur], k = weather.k, a = Math.min(1, dt * 0.25); k.sun += (W.sun - k.sun) * a; k.near += (W.fog[0] - k.near) * a; k.far += ((player.plane ? Math.max(W.fog[1], 1400) * 1.7 : W.fog[1]) * Q.far - k.far) * a; k.rain += (W.rain - k.rain) * a;
  sun.intensity *= k.sun; hemi.intensity *= lerp(0.62, 1, k.sun); renderer.toneMappingExposure *= lerp(0.78, 1, clamp((k.sun - 0.18) / 0.82 + k.rain * 0 + (1 - k.rain) * 0.35, 0, 1)); scene.fog.near = k.near; scene.fog.far = k.far; if (k.sun < 0.9) { const grey = new THREE.Color(0x9aa3ab).multiplyScalar(lerp(0.25, 1, 1 - env.night)); scene.fog.color.lerp(grey, (1 - k.sun) * 1.1); skyMat.uniforms.hor.value.lerp(grey, (1 - k.sun)); skyMat.uniforms.top.value.lerp(grey, (1 - k.sun) * 0.9); }
  if (player.tunnel && player.tunnel.house) { sun.intensity = 0; hemi.intensity = 1.05; hemi.color.set(0xfff3e2); scene.fog.color.set(0xe8e2d6); scene.fog.near = 30; scene.fog.far = 120; renderer.toneMappingExposure = 1.0; } else if (player.tunnel) { sun.intensity = 0; hemi.intensity = 0.42; hemi.color.set(0xb0a898); scene.fog.color.set(0x0b0c0e); scene.fog.near = 6; scene.fog.far = player.tunnel.H > 8 ? 120 : 55; renderer.toneMappingExposure = 1.1; }
  cloudMat.opacity = Math.min(cloudMat.opacity, W.cloud); rainMesh.material.opacity = k.rain * 0.85; rainMesh.visible = k.rain > 0.02; if (rainMesh.visible) { rainMesh.position.set(camera.position.x, camera.position.y - 18 + ((game.time * 28) % 18), camera.position.z); }
  for (const e of roadEdges) if (e.mesh) { e.mesh.material.roughness = lerp(0.9, 0.35, k.rain); e.mesh.material.metalness = k.rain * 0.25; }
  if (k.rain > 0.6) { weather.flash -= dt; if (weather.flash <= 0) { weather.flash = rr(8, 22); flashLight.position.copy(camera.position).add(new V3(0, 200, 0)); flashLight.intensity = 0; hemi.intensity += 3; setTimeout(() => sfx('boom', 0.25), rr(400, 1600)); } }
}
