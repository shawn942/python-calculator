/* =====================================================================
   輸入 / 介面
   ===================================================================== */
const $ = id => document.getElementById(id);
const keys = {}, touch = { x: 0, y: 0, run: false, jump: false, brake: false };
const cam = { yaw: 0, pitch: 0.3, off: 0, lastIn: -9, pos: new V3() };
const game = { started: false, time: 0, mapOpen: false, frame: 0, fps: 60, menu: null, busy: false, saveT: 20 };
const wanted = { stars: 0, evade: 0, bust: 0, cd: 0, spawnT: 0 };
const mission = { type: null, stage: 0, timer: 0, broken: 0, taxi: null, lions: 0, best: null };
let target = null, routePts = null, routeT = 0, lastZone = '', toastT = 0, subT = 0;

window.addEventListener('keydown', e => { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault(); const rep = keys[e.code]; keys[e.code] = true; if (!rep && game.started) onKey(e.code); });
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function onKey(c) {
  if (game.paused) { if (c === 'Escape') togglePause(false); return; }
  if (story.dialog) { if (c === 'KeyE' || c === 'Space' || c === 'Enter') nextLine(); return; }
  if (game.menu) { if (c === 'Escape' || c === 'KeyE' || (c === 'KeyP' && game.menu.phone)) { closeMenu(); return; } const m = /^Digit(\d)$/.exec(c); if (m) { buyItem(+m[1] - 1); return; } }
  if (c === 'KeyF') { if (player.inside || game.busy) return; if (player.plane) exitPlane(); else if (player.veh) exitVehicle(); else { const pl = nearestPlane(); if (pl) enterPlane(pl); else { const v = nearestVehicle(); if (v) enterVehicle(v); } } }
  else if (c === 'KeyE') interact();
  else if (c === 'KeyM') toggleMap();
  else if (c === 'Escape' && game.mapOpen) toggleMap();
  else if (c === 'Escape') togglePause();
  else if (c === 'KeyN') { env.tod = (env.tod + 3) % 24; toast('時間快轉 3 小時'); }
  else if (c === 'KeyH') sfx('horn', 0.5);
  else if (c === 'KeyQ') switchWeapon(1);
  else if (c === 'KeyP') openPhone();
  else if (c === 'KeyK') { document.body.classList.toggle('photo'); if (document.body.classList.contains('photo')) toast('📷 拍照模式（再按 K 恢復）'); }
  else if (c === 'KeyV') nextStation();
  else if (c === 'KeyG') throwNade();
  else if (c === 'KeyC') { if (!player.veh && !player.plane) { player.crouch = !player.crouch; toast(player.crouch ? '蹲下（靠牆或車邊＝掩護）' : '站起'); } }
  else if (c === 'ControlLeft' || c === 'AltLeft') dodge();
  else if (/^Digit[1-5]$/.test(c)) selectWeapon(+c[5] - 1);
  else if (c === 'KeyT') { if (vig.on) endVig('警察任務結束'); else if (player.veh && player.veh.type === 'police') startVigilante(); else if (mission.taxi) endTaxi('載客結束'); else if (player.veh && player.veh.def.taxi) startTaxi(); else toast('要先坐上計程車（黃色）'); }
  else if (c === 'KeyR') { if (player.inside || player.plane || (player.veh && player.veh.def.boat)) return; const n = nearestRoad(player.pos.x, player.pos.z, 600); if (n) { const t = player.veh || player; t.pos.set(n.p.x, n.p.y, n.p.z); if (player.veh) { player.veh.yaw = Math.atan2(n.p.tx, n.p.tz); player.veh.vx = player.veh.vz = 0; } toast('已回到最近的道路'); } }
  else if (c === 'Tab') $('help').classList.toggle('show');
}
let drag = null, locked = false;
const look = (dx, dy) => { dx *= settings.sens; dy *= settings.sens; if (player.veh || player.plane) cam.off -= dx * 0.004; else cam.yaw -= dx * 0.004; cam.pitch = clamp(cam.pitch + dy * 0.003, player.inside ? 0.0 : 0.02, 1.25); cam.lastIn = game.time; };
canvas.addEventListener('contextmenu', e => e.preventDefault());
$('dlg').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); nextLine(); }); $('letter').style.pointerEvents = 'none';
canvas.addEventListener('pointerdown', e => {
  if (story.dialog) { nextLine(); return; } // 對話中：點畫面任何地方都能繼續（含手機）
  if (e.pointerType === 'touch') { if (e.clientX < window.innerWidth * 0.4) return; drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; return; }
  if (e.button === 2) { input.aim = true; return; } if (e.button !== 0) return;
  if (story.dialog) { nextLine(); return; }
  if (game.started) { input.fire = true; input.fireEdge = true; if (!locked && canvas.requestPointerLock) { try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => { }); } catch (err) { } } }
  drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
});
document.addEventListener('pointerlockchange', () => { const was = locked; locked = document.pointerLockElement === canvas; if (was && !locked && game.started && !game.mapOpen && !game.menu && !story.dialog && !game.paused) togglePause(true); });
window.addEventListener('mousemove', e => { if (locked) look(e.movementX, e.movementY); });
window.addEventListener('pointermove', e => { if (locked || !drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; look(dx * 1.25, dy * 1.3); });
window.addEventListener('pointerup', e => { if (e.button === 2) input.aim = false; if (e.button === 0 || e.pointerType === 'touch') { if (e.pointerType !== 'touch') input.fire = false; if (drag && e.pointerId === drag.id) drag = null; } });
window.addEventListener('wheel', e => { if (game.started && !game.mapOpen) switchWeapon(e.deltaY > 0 ? 1 : -1); }, { passive: true });
function axis() { let x = touch.x, y = touch.y; if (keys.KeyW || keys.ArrowUp) y += 1; if (keys.KeyS || keys.ArrowDown) y -= 1; if (keys.KeyA || keys.ArrowLeft) x -= 1; if (keys.KeyD || keys.ArrowRight) x += 1; return { x: clamp(x, -1, 1), y: clamp(y, -1, 1) }; }
function setupTouch() {
  if (!('ontouchstart' in window) && !(navigator.maxTouchPoints > 0)) return; $('touch').style.display = 'block';
  const st = $('stick'), nub = $('nub'); let sid = null, sx = 0, sy = 0;
  st.addEventListener('pointerdown', e => { sid = e.pointerId; const r = st.getBoundingClientRect(); sx = r.left + r.width / 2; sy = r.top + r.height / 2; try { st.setPointerCapture(sid); } catch (err) { } e.preventDefault(); });
  st.addEventListener('pointermove', e => { if (e.pointerId !== sid) return; let dx = (e.clientX - sx) / 50, dy = (e.clientY - sy) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } touch.x = dx; touch.y = -dy; touch.run = l > 0.9; nub.style.transform = `translate(${dx * 38}px,${dy * 38}px)`; });
  const end = e => { if (e.pointerId !== sid) return; sid = null; touch.x = touch.y = 0; touch.run = false; nub.style.transform = ''; }; st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  const btn = (id, down, up) => { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); down(); }); if (up) { b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); } };
  btn('btnF', () => onKey('KeyF')); btn('btnE', () => { if (story.dialog) { nextLine(); return; } if (game.menu) closeMenu(); else if (!interact()) onKey('KeyT'); }); btn('btnA', () => { if (inv.cur || !player.veh) { input.fire = true; input.fireEdge = true; } if (player.veh || player.plane) touch.brake = true; }, () => { touch.brake = false; input.fire = false; }); btn('btnQ', () => switchWeapon(1)); btn('btnJ', () => { if (!player.veh && !player.plane) touch.jump = true; else onKey('KeyH'); }); btn('btnM', () => toggleMap()); btn('btnP', () => openPhone()); btn('btnG', () => throwNade());
}
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); toastT = 2.6; }
function subtitle(msg, dur = 6) { const s = $('subtitle'); s.innerHTML = msg; s.classList.toggle('show', !!msg); subT = dur; }
function banner(title, sub) { const b = $('banner'); b.innerHTML = `<b>${title}</b><span>${sub || ''}</span>`; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); sfx('chime', 0.4); }
function openMenu(title, items) { game.menu = { title, items }; const m = $('menu'); m.innerHTML = `<h4>${title}</h4>` + items.map((it, i) => `<div data-i="${i}"><b>${i + 1}</b>${it.n}<i>${it.d || ''}</i><em>${it.free ? '' : '$' + it.p.toLocaleString()}</em></div>`).join('') + `<p>按數字鍵${items[0] && items[0].free ? '選擇' : '購買'}　${items[0] && items[0].free ? 'P' : 'E'} / Esc 關閉</p>`; m.classList.add('show'); m.querySelectorAll('div').forEach(d => d.onclick = () => buyItem(+d.dataset.i)); }
function closeMenu() { game.menu = null; $('menu').classList.remove('show'); }
function buyItem(i) { const it = game.menu && game.menu.items[i]; if (!it) return; if (it.free) { it.fn(); return; } if (player.money < it.p) { toast('錢不夠'); sfx('fail', 0.2); return; } addMoney(-it.p); it.fn(); sfx('chime', 0.3); toast('買了 ' + it.n); const t = game.menu.title, src = actions.find(a => a.inside === player.inside && a._l === '買武器'); if (src) src.fn(); }
function fade(text, cb) { const f = $('fade'); f.querySelector('span').textContent = text; f.classList.add('show'); setTimeout(() => { cb(); setTimeout(() => f.classList.remove('show'), 700); }, 900); }
function addMoney(n) { player.money = Math.max(0, player.money + n); $('money').textContent = '$' + player.money.toLocaleString(); const d = $('delta'); d.textContent = (n >= 0 ? '+$' : '-$') + Math.abs(n).toLocaleString(); d.className = n >= 0 ? 'show plus' : 'show minus'; setTimeout(() => d.className = '', 1600); }

/* ---------- 音效（WebAudio 合成） ---------- */
let AC = null, eng = null;
let MASTER = null;
function initAudio() { try { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = settings.vol; MASTER.connect(AC.destination); const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = 50; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0; o.connect(f); f.connect(g); g.connect(MASTER); o.start(); eng = { o, f, g }; } catch (e) { AC = null; } }
function sfx(name, vol = 0.3) {
  if (!AC) return; try { const t = AC.currentTime, g = AC.createGain(); g.connect(MASTER);
    const tone = (type, f0, f1, dur, v = vol) => { const o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); o.start(t); o.stop(t + dur); };
    if (name === 'thud') { const b = AC.createBuffer(1, 4410, 44100), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2); const s = AC.createBufferSource(), f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; s.buffer = b; s.connect(f); f.connect(g); g.gain.value = vol; s.start(t); }
    else if (name === 'door') tone('square', 140, 70, 0.09, vol * 0.5); else if (name === 'swish') tone('sine', 500, 180, 0.12); else if (name === 'horn') { tone('square', 420, 415, 0.45, vol * 0.35); }
    else if (name === 'shot' || name === 'shot2' || name === 'boom') { const dur = name === 'boom' ? 1.1 : name === 'shot2' ? 0.28 : 0.14, b = AC.createBuffer(1, 44100 * dur | 0, 44100), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, name === 'boom' ? 2.2 : 4); const s = AC.createBufferSource(), f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = name === 'boom' ? 420 : name === 'shot2' ? 1500 : 2600; s.buffer = b; s.connect(f); f.connect(g); g.gain.value = vol * (name === 'boom' ? 1.6 : 1); s.start(t); }
    else if (name === 'splash') { const b = AC.createBuffer(1, 22050, 44100), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5); const s = AC.createBufferSource(), f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; s.buffer = b; s.connect(f); f.connect(g); g.gain.value = vol; s.start(t); }
    else if (name === 'moo') { const o = AC.createOscillator(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(110, t + 1.1); f.type = 'lowpass'; f.frequency.value = 500; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.15); g.gain.linearRampToValueAtTime(0.001, t + 1.2); o.connect(f); f.connect(g); o.start(t); o.stop(t + 1.25); }
    else if (name === 'alarm') tone('square', 980, 760, 0.3, vol);
    else if (name === 'chime') { tone('sine', 880, 880, 0.18); setTimeout(() => sfx('chime2', vol), 120); } else if (name === 'chime2') tone('sine', 1320, 1320, 0.3); else if (name === 'fail') tone('sawtooth', 300, 90, 0.5, vol * 0.5);
  } catch (e) { }
}

/* =====================================================================
   通緝 / 警察
   ===================================================================== */
function crime(n) { if (wanted.cd > 0) return; wanted.cd = 1.4; wanted.stars = Math.min(5, wanted.stars + n); wanted.evade = 0; drawStars(); }
function drawStars() { $('stars').innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < wanted.stars ? 'on' : ''}">★</i>`).join(''); }
function clearWanted() { wanted.stars = 0; wanted.evade = 0; wanted.bust = 0; for (const v of [...vehicles]) if (v.driver === 'police') removeVehicle(v); for (const c of [...cops]) if (!c.guard) removeCop(c); drawStars(); $('stars').classList.remove('flash'); }
function updatePolice(v, dt) {
  const tp = wpos(), dx = tp.x - v.pos.x, dz = tp.z - v.pos.z, d = Math.hypot(dx, dz); let gx = tp.x, gz = tp.z;
  if (v.deployed) { v.parkT -= dt; if (d > 90 || v.parkT <= 0) { if (d > 90) { v.deployed = false; for (const c of [...cops]) if (c.from === v) removeCop(c); } else v.parkT = 0; } if (v.deployed && (v.parkT > 0 || d < 30)) { driveVehicle(v, { thr: 0, steer: 0, hb: true }, dt); vehicleCollide(v, dt); vehiclePost(v, dt); return d; } }
  else if (d < 20 && Math.abs(v.speed) < 6 && !player.plane) deployCops(v);
  v.rt = (v.rt || 0) - dt; if (v.rt <= 0) { v.rt = 1.1; v.route = d > 34 ? computeRoute(v.pos.x, v.pos.z, tp.x, tp.z) : null; }
  if (v.route && d > 34) { let bi = 0, bd = 1e12; const n = Math.min(v.route.length, 60); for (let i = 1; i < n; i++) { const q = v.route[i], dd = (q[0] - v.pos.x) ** 2 + (q[1] - v.pos.z) ** 2; if (dd < bd) { bd = dd; bi = i; } } const q = v.route[Math.min(v.route.length - 1, bi + 4)]; gx = q[0]; gz = q[1]; }
  const ang = angDiff(v.yaw, Math.atan2(gx - v.pos.x, gz - v.pos.z)); let thr = 1, steer = clamp(ang * 1.8, -1, 1);
  if (Math.abs(ang) > 0.7 && v.speed > 11) thr = -0.4;
  if (v.revT > 0) { v.revT -= dt; thr = -1; steer = -steer; } else { if (d < 9) thr = Math.abs(v.speed) > 6 ? -1 : 0.25; if (Math.abs(v.speed) < 1.2 && d > 9) { v.stuckT += dt; if (v.stuckT > 1.2) { v.revT = 1.1; v.stuckT = 0; } } else v.stuckT = 0; }
  driveVehicle(v, { thr, steer, hb: false }, dt); vehicleCollide(v, dt); vehiclePost(v, dt); return d;
}
function updateWanted(dt, nearRoad) {
  wanted.cd -= dt; const s = wanted.stars, wp = wpos(); let nearest = 1e9, count = 0;
  for (const v of [...vehicles]) if (v.driver === 'police') { count++; const d = updatePolice(v, dt); nearest = Math.min(nearest, d); if (d > 650 || (groundAt(v.pos.x, v.pos.z) < -1.3 && bridgeY(v.pos.x, v.pos.z) === null)) removeVehicle(v); }
  for (const c of cops) if (!c.guard) nearest = Math.min(nearest, Math.hypot(c.pos.x - wp.x, c.pos.z - wp.z));
  const fl = Math.floor(game.time * 5) % 2; mSirenR.emissiveIntensity = count && fl ? 4 : 0; mSirenB.emissiveIntensity = count && !fl ? 4 : 0;
  if (!s) return;
  wanted.spawnT -= dt; if (count < [0, 1, 2, 3, 4, 5][s] && wanted.spawnT <= 0 && nearRoad.length) { wanted.spawnT = 2.2; const sm = pick(nearRoad), p = sm.e.pts[sm.i]; const d = Math.hypot(p.x - wp.x, p.z - wp.z); if (d > 140 && d < 330 && !sm.e.bridge) { const army = s >= 4 && rand() < 0.5, v = makeVehicle(army ? 'jeep' : 'police', p.x, p.z, Math.atan2(wp.x - p.x, wp.z - p.z)); v.driver = 'police'; v.soldier = army; } }
  if (player.tunnel) nearest = 1e9;
  if (nearest > (player.plane ? 260 : 150)) { wanted.evade += dt * (player.plane ? 0.6 : 1); if (wanted.evade > 12 + s * 4) { clearWanted(); if (player.loot > 0) endRob(true); else { rob = null; toast('甩掉警察了'); } return; } } else wanted.evade = 0;
  $('stars').classList.toggle('flash', wanted.evade > 2);
  const ps = player.veh ? Math.abs(player.veh.speed) : (player.spd || 0);
  if (s < 3 && nearest < 7.5 && ps < 3 && !player.tunnel && !player.plane && player.aimT <= 0) { wanted.bust += dt; if (wanted.bust > 2.2) busted(); } else wanted.bust = Math.max(0, wanted.bust - dt);
}
function busted() { if (wanted.bust < -50) return; wanted.bust = -99; game.busy = true; sfx('fail', 0.4); fade('被 捕', () => { exitForce(); endMission(false, true); clearWanted(); endRob(false); const B = missionSpots.police || roadNodes.JCN; player.pos.set(B.x, heightAt(B.x, B.z), B.z); player.hp = 100; for (let i = 1; i < 5; i++) inv.ammo[i] = Math.floor(inv.ammo[i] / 2); refreshWeapon(); addMoney(-Math.min(player.money, Math.max(200, Math.round(player.money * 0.15)))); cam.pos.copy(player.pos); game.busy = false; subtitle('你被帶回金門縣警察局，繳了罰款，子彈被沒收一半。', 5); }); }
function damage(n) { if (game.busy) return; if (player.armor > 0) { const a = Math.min(player.armor, n * 0.7); player.armor -= a; n -= a; } player.hp -= n; $('hurt').classList.add('show'); setTimeout(() => $('hurt').classList.remove('show'), 250); if (player.hp <= 0) wasted('陣 亡'); }
function wasted(text) {
  if (game.busy) return; survFail(); game.busy = true; player.hp = 1; sfx('fail', 0.4);
  fade(text, () => { if (player.inside) { player.inside = null; roomLight.intensity = 0; } exitForce(); endMission(false, true); clearWanted(); endRob(false); closeMenu(); let b = null, bd = 1e12; const ref = player.pos; for (const id of ['JCN', 'SWE', 'SM', 'DL']) { const nd = roadNodes[id], d = (nd.x - ref.x) ** 2 + (nd.z - ref.z) ** 2; if (d < bd) { bd = d; b = nd; } }
    const x = b.x + 12, z = b.z + 10; player.pos.set(x, heightAt(x, z), z); resolveCircle(player.pos, 0.6); player.hp = 100; player.armor = 0; addMoney(-Math.min(player.money, Math.max(300, Math.round(player.money * 0.1)))); cam.pos.copy(player.pos); game.busy = false; subtitle('你在醫院醒來，付了醫藥費。', 5); });
}
function respawn(text, nearRoadSide) { game.busy = true; sfx('fail', 0.4); fade(text, () => { exitForce(); endMission(false, true); const n = nearestRoad(player.pos.x, player.pos.z, 1200), x = n ? n.p.x : roadNodes.UNI.x, z = n ? n.p.z : roadNodes.UNI.z; player.pos.set(x, heightAt(x, z), z); cam.pos.copy(player.pos); game.busy = false; }); }
function onPlayerCrash(impact) { sfx('thud', clamp(impact / 20, 0.15, 0.7)); const v = player.veh; if (v && impact > 6) { v.hp -= (impact - 6) * 1.6; if (v.hp <= 0 && !v.burn) { v.burn = 3.2; toast('車要爆炸了！快下車'); } } if (impact > 12) damage((impact - 12) * 1.4); if ((mission.type === 'deliver' || (story.active && story.ch === 1)) && impact > 8) { mission.broken++; toast('高粱酒破了一瓶！（-$200）'); } }

/* =====================================================================
   任務
   ===================================================================== */
const markers = [];
function iconSprite(ch, color) { const t = canvasTex(128, 128, g => { g.fillStyle = color; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 6; g.stroke(); g.fillStyle = '#fff'; g.font = `900 72px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 68); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, fog: false })); s.scale.set(3.2, 3.2, 1); s.renderOrder = 20; return s; }
function addMarker(id, spot, ch, color, title) { const y = heightAt(spot.x, spot.z); const ring = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 1.6, 32, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); ring.position.set(spot.x, y + 0.8, spot.z); scene.add(ring); const ic = iconSprite(ch, color); ic.position.set(spot.x, y + 5, spot.z); scene.add(ic); markers.push({ id, x: spot.x, z: spot.z, ring, ic, ch, color, title }); }
const targetMesh = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 60, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false, fog: false })); targetMesh.visible = false; scene.add(targetMesh);
function setTarget(x, z, label) { waypoint = false; target = { x, z, label, beacon: true }; targetMesh.visible = true; targetMesh.position.set(x, heightAt(x, z) + 30, z); routeT = 0; }
function clearTarget() { target = null; targetMesh.visible = false; routePts = null; }
function initMissions() { addMarker('deliver', missionSpots.deliver, '酒', '#c0392b', '高粱急送'); addMarker('race', missionSpots.race, '賽', '#2e86de', '古寧頭環線計時賽'); addMarker('fly', missionSpots.fly, '飛', '#8e44ad', '空中巡禮'); try { mission.best = JSON.parse(localStorage.getItem('kinmen_best') || 'null'); } catch (e) { } }
function nearMarker() { if (mission.type) return null; for (const m of markers) if (Math.hypot(m.x - player.pos.x, m.z - player.pos.z) < 5.5) return m; return null; }
function interact() { if (game.busy) return false; if (player.bus) { busAlight('下車了'); return true; } { const bv = busBoardable(); if (bv) { busBoard(bv); return true; } } const sm = nearMarker(); if (!player.veh && !player.plane && !(sm && sm.id === 'story')) { const a = nearAction(); if (a) { a.fn(); return true; } } const m = nearMarker(); if (!m) return greetPed(); if (m.id === 'story') startChapter(); else if (m.id === 'deliver') startDeliver(); else if (m.id === 'fly') startFly(); else startRace(); return true; }
const FLY = [[24.4625, 118.4130, 150, '太武山'], [24.5270, 118.4090, 90, '馬山'], [24.4830, 118.3209, 85, '古寧頭'], [24.4476, 118.2853, 75, '金門大橋'], [24.42491, 118.31902, 75, '莒光樓'], [24.4300, 118.3592, 70, '尚義機場上空']].map(f => { const w = GW(f[0], f[1]); return { ...w, alt: f[2], name: f[3] }; });
function fixFlyAlt() { for (const f of FLY) { let g = 0; for (let a = 0; a < 8; a++) g = Math.max(g, groundAt(f.x + Math.cos(a) * 25, f.z + Math.sin(a) * 25)); f.alt = Math.max(f.alt, g + 60); } }
const flyRing = new THREE.Mesh(new THREE.TorusGeometry(16, 1.1, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.85, fog: false })); flyRing.visible = false; scene.add(flyRing);
function startFly() { fixFlyAlt(); mission.type = 'fly'; mission.stage = 0; mission.timer = 0; sfx('chime'); nextFly(); subtitle('空中巡禮：坐上停機坪的<b>小飛機</b>（F），依序穿過 6 個黃色光圈。', 9); }
function nextFly() { const f = FLY[mission.stage]; setTarget(f.x, f.z, f.name); flyRing.visible = true; flyRing.position.set(f.x, f.alt, f.z); }
const DELIVER = [['MF', '模範街'], ['AP', '尚義機場'], ['SW', '山外車站']], RACE = ['CD', 'NS', 'GN', 'JN', 'UNI'];
function startDeliver() { mission.type = 'deliver'; mission.stage = 0; mission.timer = 300; mission.broken = 0; sfx('chime'); nextDeliver(); }
function nextDeliver() { const [id, name] = DELIVER[mission.stage], n = roadNodes[id]; setTarget(n.x, n.z, name); subtitle(`把高粱酒送到 <b>${name}</b>${player.veh ? '' : '（先找一台車，按 F 上車）'}　小心別撞破酒瓶`, 7); }
function startRace() { mission.type = 'race'; mission.stage = 0; mission.timer = 0; sfx('chime'); const n = roadNodes[RACE[0]]; setTarget(n.x, n.z, '檢查點 1'); subtitle(`計時開始！依序通過 5 個檢查點（慈堤 → 南山 → 古寧頭戰史館 → 頂堡 → 金門大學）${mission.best ? '　最佳 ' + mission.best.toFixed(1) + ' 秒' : ''}`, 7); }
function endMission(success, silent) { if (!mission.type && !mission.taxi) return; if (mission.type === 'vig') { endVig(null); return; } if (mission.type === 'story') { storyAbort(); return; } if (mission.type === 'side') { endSide(false, silent ? null : '委託失敗'); return; } if (mission.taxi) endTaxi(null); mission.type = null; flyRing.visible = false; clearTarget(); $('timer').textContent = ''; if (!silent && !success) { sfx('fail'); subtitle('任務失敗', 4); } }
function startTaxi() { mission.taxi = { stage: 0, ped: null, from: null, n: 0 }; sfx('chime'); nextFare(); }
function nextFare() {
  const cands = townSamples.filter(s => { const p = s.e.pts[s.i], d = Math.hypot(p.x - player.pos.x, p.z - player.pos.z); return d > 120 && d < 650; }); const s = cands.length ? pick(cands) : pick(townSamples);
  const pd = spawnPed(s); pd.state = 'wait'; pd.idle = 1e9; mission.taxi.ped = pd; mission.taxi.stage = 0; setTarget(pd.pos.x, pd.pos.z, '乘客'); subtitle('有乘客叫車，前往 <b>黃色標記</b> 接客（按 T 可結束載客）', 6);
}
function endTaxi(msg) { const t = mission.taxi; if (!t) return; if (t.ped && peds.includes(t.ped)) { t.ped.state = 'walk'; t.ped.idle = 0; } mission.taxi = null; clearTarget(); if (msg) subtitle(msg, 3); }
function updateMissions(dt) {
  const v = player.veh, sp = v ? Math.abs(v.speed) : 0, dT = target ? Math.hypot(target.x - player.pos.x, target.z - player.pos.z) : 1e9;
  if (mission.type === 'deliver') {
    mission.timer -= dt; $('timer').textContent = '⏱ ' + Math.max(0, Math.ceil(mission.timer)) + ' 秒　酒 ' + (12 - mission.broken) + '/12';
    if (mission.timer <= 0 || mission.broken >= 12) { endMission(false); return; }
    if (dT < 10 && v && sp < 7) { mission.stage++; sfx('chime'); if (mission.stage >= DELIVER.length) { const pay = 3000 + Math.ceil(mission.timer) * 4 - mission.broken * 200; mission.type = null; clearTarget(); $('timer').textContent = ''; addMoney(pay); banner('任務完成', '高粱急送　酬勞 $' + pay.toLocaleString()); } else { mission.timer += 20; nextDeliver(); } }
  } else if (mission.type === 'race') {
    mission.timer += dt; $('timer').textContent = '⏱ ' + mission.timer.toFixed(1) + ' 秒　' + (mission.stage + 1) + '/' + RACE.length;
    if (dT < 14) { mission.stage++; sfx('chime'); if (mission.stage >= RACE.length) { const t = mission.timer, pay = t < 105 ? 2500 : t < 140 ? 1500 : 600; if (!mission.best || t < mission.best) { mission.best = t; try { localStorage.setItem('kinmen_best', JSON.stringify(t)); } catch (e) { } } mission.type = null; clearTarget(); $('timer').textContent = ''; addMoney(pay); subtitle(`完賽！${t.toFixed(1)} 秒　獎金 <b>$${pay.toLocaleString()}</b>${mission.best === t ? '　新紀錄！' : ''}`, 6); } else { const n = roadNodes[RACE[mission.stage]]; setTarget(n.x, n.z, '檢查點 ' + (mission.stage + 1)); } }
  }
  if (mission.type === 'fly') { const f = FLY[mission.stage]; flyRing.rotation.y += dt * 0.6; flyRing.lookAt(player.pos.x, f.alt, player.pos.z); if (player.plane) { mission.timer += dt; $('timer').textContent = '✈ ' + mission.timer.toFixed(0) + ' 秒　' + (mission.stage + 1) + '/' + FLY.length + '　' + f.name; if (Math.hypot(f.x - player.pos.x, f.z - player.pos.z, f.alt - player.pos.y) < 22) { mission.stage++; sfx('chime'); if (mission.stage >= FLY.length) { mission.type = null; flyRing.visible = false; clearTarget(); $('timer').textContent = ''; addMoney(5000); banner('任務完成', '空中巡禮　獎金 $5,000'); } else nextFly(); } } }
  const tx = mission.taxi; if (tx) {
    if (!v || !v.def.taxi) { endTaxi('離開計程車，載客結束'); }
    else if (tx.stage === 0) { if (dT < 9 && sp < 2.5) { removePed(tx.ped); tx.ped = null; const far = PLACES.filter(p => !p.osm && Math.hypot(p.x - player.pos.x, p.z - player.pos.z) > 420 && !/太武山|湖|大橋|海|沙灘|坑道/.test(p.name)), pl = pick(far), n = nearestRoad(pl.x, pl.z, 500); tx.stage = 1; tx.from = { x: player.pos.x, z: player.pos.z }; tx.t0 = game.time; setTarget(n.p.x, n.p.z, pl.name); sfx('door'); subtitle(`乘客：「麻煩到 <b>${pl.name}</b>，謝謝。」`, 6); } }
    else if (dT < 11 && sp < 3) { const dist = Math.hypot(target.x - tx.from.x, target.z - tx.from.z), fare = Math.round((80 + dist * 0.35) / 5) * 5, tip = (game.time - tx.t0) < dist / 14 ? Math.round(fare * 0.3 / 5) * 5 : 0; addMoney(fare + tip); tx.n++; sfx('chime'); toast(`車資 $${fare}${tip ? ' + 小費 $' + tip : ''}`); nextFare(); }
  }
  if (!player.inside && !player.plane) for (const L of lions) if (!L.found && Math.hypot(L.x - player.pos.x, L.z - player.pos.z) < 5.5) { L.found = true; L.ring.visible = false; mission.lions++; addMoney(500); sfx('chime'); toast(`找到風獅爺 ${mission.lions}/${lions.length}`); if (mission.lions === lions.length) { addMoney(10000); banner('風獅爺巡禮完成', '全島風獅爺都找到了　獎金 $10,000'); } }
  for (const m of markers) { m.ring.visible = m.ic.visible = !mission.type; m.ic.position.y = heightAt(m.x, m.z) + 5 + Math.sin(game.time * 2) * 0.3; }
  for (const L of lions) if (!L.found) L.ring.rotation.y += dt;
  if (waypoint && target && Math.hypot(target.x - player.pos.x, target.z - player.pos.z) < 16) { clearTarget(); waypoint = false; toast('抵達導航點'); sfx('chime', 0.2); }
}

/* ---------- GPS：在道路圖上找最短路徑 ---------- */
function computeRoute(ax, az, bx, bz) {
  const s = nearestRoad(ax, az, 500), t = nearestRoad(bx, bz, 500); if (!s || !t) return null; const out = [[ax, az]];
  const seg = (e, i0, i1) => { const st = i0 <= i1 ? 1 : -1; let g = 0; for (let i = i0; i !== i1 + st; i += st) { if (++g > 4000) { console.warn('route seg guard', i0, i1, e.pts.length); break; } const q = e.pts[i]; if (q) out.push([q.x, q.z]); } };
  if (s.e === t.e) { seg(s.e, s.i, t.i); out.push([bx, bz]); return out; }
  const dist = new Map(), prev = new Map(), done = new Set(); dist.set(s.e.a, s.i * s.e.step); dist.set(s.e.b, s.e.len - s.i * s.e.step);
  for (; ;) { let u = null, ud = 1e12; for (const [n, d] of dist) if (!done.has(n) && d < ud) { ud = d; u = n; } if (!u) break; done.add(u); for (const e of u.edges) { const w = e.a === u ? e.b : e.a, nd = ud + e.len; if (nd < (dist.get(w) ?? 1e12)) { dist.set(w, nd); prev.set(w, { n: u, e }); } } }
  const da = (dist.get(t.e.a) ?? 1e12) + t.i * t.e.step, db = (dist.get(t.e.b) ?? 1e12) + t.e.len - t.i * t.e.step; let end = da < db ? t.e.a : t.e.b; const chain = []; let cur = end, gg = 0; while (prev.has(cur)) { if (++gg > 4000) { console.warn('route prev guard'); break; } const p = prev.get(cur); chain.unshift({ e: p.e, to: cur }); cur = p.n; }
  seg(s.e, s.i, cur === s.e.a ? 0 : s.e.pts.length - 1); for (const c of chain) { if (c.e.b === c.to) seg(c.e, 0, c.e.pts.length - 1); else seg(c.e, c.e.pts.length - 1, 0); } seg(t.e, end === t.e.a ? 0 : t.e.pts.length - 1, t.i); out.push([bx, bz]); return out;
}

/* =====================================================================
   地圖
   ===================================================================== */
const MS = (window.matchMedia && matchMedia('(pointer:coarse)').matches) ? 0.5 : 0.8, MSW = MS / 0.5, mapCv = document.createElement('canvas'); mapCv.width = Math.ceil((NX - 1) * CELL * MS); mapCv.height = Math.ceil((NZ - 1) * CELL * MS);
const mpx = x => (x - TX0) * MS, mpz = z => (z - TZ0) * MS;
function buildMap() {
  const g = mapCv.getContext('2d'); g.fillStyle = '#24465a'; g.fillRect(0, 0, mapCv.width, mapCv.height);
  for (const poly of coastPolys) { g.beginPath(); poly.forEach((p, i) => i ? g.lineTo(mpx(p[0]), mpz(p[1])) : g.moveTo(mpx(p[0]), mpz(p[1]))); g.closePath(); g.fillStyle = '#5f7353'; g.fill(); g.lineWidth = 5 * MSW; g.strokeStyle = '#d6c998'; g.stroke(); }
  for (const b of BEACHES) if (!b.skip) { g.fillStyle = 'rgba(226,211,168,0.8)'; g.beginPath(); g.arc(mpx(b.x), mpz(b.z), b.r * MS * 0.6, 0, 7); g.fill(); }
  for (const h of HILLS) { if (h.h < 20) continue; const gr = g.createRadialGradient(mpx(h.x), mpz(h.z), 0, mpx(h.x), mpz(h.z), h.s * MS * 1.6); gr.addColorStop(0, 'rgba(60,72,58,0.9)'); gr.addColorStop(1, 'rgba(60,72,58,0)'); g.fillStyle = gr; g.beginPath(); g.arc(mpx(h.x), mpz(h.z), h.s * MS * 1.6, 0, 7); g.fill(); }
  if (LK.length) { g.fillStyle = '#2f5e77'; for (const L of LK) { if (L.skip) continue; g.beginPath(); L.pts.forEach(([x, z], i) => i ? g.lineTo(mpx(x), mpz(z)) : g.moveTo(mpx(x), mpz(z))); g.closePath(); g.fill(); } } else for (const l of LAKES) { g.fillStyle = '#2f5e77'; g.beginPath(); g.arc(mpx(l.x), mpz(l.z), l.r * 0.72 * MS, 0, 7); g.fill(); }
  g.setLineDash([10 * MSW, 8 * MSW]); g.lineWidth = 2 * MSW; g.strokeStyle = 'rgba(255,255,255,0.35)'; for (const t of townPolys) for (const r of t.rings) { g.beginPath(); r.forEach((p, i) => i ? g.lineTo(mpx(p[0]), mpz(p[1])) : g.moveTo(mpx(p[0]), mpz(p[1]))); g.closePath(); g.stroke(); } g.setLineDash([]);
  for (const t of TOWNS) if (t.style === 'city' || t.style === 'old' || t.style === 'campus') { g.fillStyle = 'rgba(150,146,132,0.55)'; g.beginPath(); g.arc(mpx(t.x), mpz(t.z), t.r * MS * 0.8, 0, 7); g.fill(); }
  g.save(); g.translate(mpx(RUNWAY.x), mpz(RUNWAY.z)); g.rotate(-RUNWAY.rot); g.fillStyle = '#3b3d41'; g.fillRect(-RUNWAY.len / 2 * MS, -RUNWAY.wid / 2 * MS, RUNWAY.len * MS, RUNWAY.wid * MS); g.restore();
  for (const d of decks) { g.save(); g.translate(mpx(d.x), mpz(d.z)); g.rotate(-d.rot); g.fillStyle = '#b9b6ad'; g.fillRect(-d.hw * MS, -d.hd * MS, d.hw * 2 * MS, d.hd * 2 * MS); g.restore(); }
  g.lineCap = g.lineJoin = 'round'; for (const pass of [0, 1]) for (const e of roadEdges) { g.beginPath(); e.pts.forEach((p, i) => i ? g.lineTo(mpx(p.x), mpz(p.z)) : g.moveTo(mpx(p.x), mpz(p.z))); const w = (e.type === 'minor' ? 3 : 5) * MSW; g.lineWidth = pass ? w : w + 3 * MSW; g.strokeStyle = pass ? (e.bridge ? '#f2efe2' : '#d9d6c8') : '#2b3438'; g.stroke(); }
}
const mm = $('minimap'), mmg = mm.getContext('2d'), mmR = { v: 150, t: 150 };
function drawMinimap() {
  const S = mm.width, c = S / 2, v = player.veh, wp0 = wpos(), viewR = (mmR.t = player.plane ? 420 : (TOWNS.some(t => Math.hypot(t.x - wp0.x, t.z - wp0.z) < t.r) && (!v || Math.abs(v.speed) < 8) ? 95 : 150) + (v ? Math.min(120, Math.abs(v.speed) * 4) : 0), mmR.v += (mmR.t - mmR.v) * 0.06), k = c / viewR, phi = cam.yaw - Math.PI, cs = Math.cos(phi), sn = Math.sin(phi), px = wp0.x, pz = wp0.z, g = mmg;
  g.save(); g.clearRect(0, 0, S, S); g.beginPath(); g.arc(c, c, c - 3, 0, 7); g.clip(); g.fillStyle = '#24465a'; g.fillRect(0, 0, S, S);
  g.translate(c, c); g.rotate(phi); g.scale(k / MS, k / MS); g.drawImage(mapCv, -mpx(px), -mpz(pz)); dadanMini(g, px, pz);
  if (routePts) { g.beginPath(); routePts.forEach((p, i) => { const X = mpx(p[0]) - mpx(px), Y = mpz(p[1]) - mpz(pz); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.lineWidth = 7 * MS / k; g.strokeStyle = '#ffd23f'; g.lineJoin = 'round'; g.stroke(); }
  g.restore();
  const P = (x, z, edge) => { let dx = (x - px) * k, dz = (z - pz) * k, X = dx * cs - dz * sn, Y = dx * sn + dz * cs; const l = Math.hypot(X, Y), m = c - 12; if (l > m) { if (!edge) return null; X *= m / l; Y *= m / l; } return [c + X, c + Y]; };
  const dot = (q, col, r) => { if (!q) return; g.fillStyle = col; g.beginPath(); g.arc(q[0], q[1], r, 0, 7); g.fill(); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke(); };
  for (const o of vehicles) if (o.driver === 'police') dot(P(o.pos.x, o.pos.z, false), Math.floor(game.time * 4) % 2 ? '#ff4444' : '#4477ff', S * 0.028);
  for (const L of lions) if (!L.found) dot(P(L.x, L.z, false), '#f39c12', S * 0.02);
  for (const c of cops) if (!c.guard) dot(P(c.pos.x, c.pos.z, false), '#4477ff', S * 0.016);
  for (const r of rooms) dot(P(r.door.x, r.door.z, false), r.type === 'bank' ? '#d4a017' : r.type === 'gun' ? '#8b8f78' : '#6fd3ff', S * 0.018);
  if (!mission.type) for (const m of markers) { const q = P(m.x, m.z, true); dot(q, m.color, S * 0.045); g.fillStyle = '#fff'; g.font = `900 ${S * 0.055}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(m.ch, q[0], q[1] + 1); }
  if (target) dot(P(target.x, target.z, true), '#ffd23f', S * 0.04);
  const n = P(px, pz - 1e5, true); g.fillStyle = '#fff'; g.font = `900 ${S * 0.07}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText('N', n[0], n[1]); g.fillText('N', n[0], n[1]);
  const a = player.yaw, ax = Math.sin(a) * cs - Math.cos(a) * sn, ay = Math.sin(a) * sn + Math.cos(a) * cs, r = S * 0.05; g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(c + ax * r * 1.5, c + ay * r * 1.5); g.lineTo(c - ax * r - ay * r * 0.9, c - ay * r + ax * r * 0.9); g.lineTo(c - ax * r * 0.4, c - ay * r * 0.4); g.lineTo(c - ax * r + ay * r * 0.9, c - ay * r - ax * r * 0.9); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 5; g.strokeStyle = 'rgba(10,14,18,0.85)'; g.beginPath(); g.arc(c, c, c - 3, 0, 7); g.stroke();
}
const FAST = [['金城鎮・金城車站', 'JC'], ['金寧鄉・金門大學', 'UNI'], ['金寧鄉・鄉公所（頂堡）', 'JN'], ['金寧鄉・古寧頭', 'NS'], ['金湖鎮・山外車站', 'SW'], ['金湖鎮・尚義機場', 'AP'], ['金湖鎮・料羅港', 'LL'], ['金沙鎮・沙美', 'SM'], ['金沙鎮・山后民俗村', 'SH'], ['金沙鎮・馬山', 'MS'], ['烈嶼鄉・東林', 'DL'], ['烈嶼鄉・九宮碼頭', 'JG9'], ['金城鎮・水頭碼頭', 'STP'], ['金城鎮・莒光樓', 'JG'], ['烈嶼鄉・大膽島', 'DADAN'], ['金寧鄉・頂埔下（你家）', 'HOME']];
function fastTravel(id) {
  if (id === 'DADAN') return dadanGo(); if (id === 'HOME') return homeGo();
  if (wanted.stars) { toast('被通緝時不能傳送'); return; } if (player.plane || game.busy) { toast('現在不能傳送'); return; } if (player.veh && player.veh.def.boat) { toast('先下船'); return; }
  const n = roadNodes[id]; if (game.mapOpen) toggleMap(); game.busy = true; fade('傳送中', () => { const e = n.edges[0], i = e.a === n ? Math.min(3, e.pts.length - 1) : Math.max(0, e.pts.length - 4), p = e.pts[i], t = player.veh || player; t.pos.set(p.x, p.y, p.z); if (player.veh) { player.veh.yaw = Math.atan2(p.tx, p.tz); player.veh.vx = player.veh.vz = 0; player.pos.copy(t.pos); } cam.pos.copy(player.pos); nearT = 0; game.busy = false; });
}
function toggleMap() { game.mapOpen = !game.mapOpen; $('bigmap').classList.toggle('show', game.mapOpen); if (game.mapOpen) { mapZoomInit(); mapZoomReset(); if (document.exitPointerLock && locked) document.exitPointerLock(); drawBigMap(); const ft = $('ft'); if (!ft.querySelector('button')) for (const [label, id] of FAST) { const b = document.createElement('button'); b.textContent = label; b.onclick = ev => { ev.stopPropagation(); fastTravel(id); }; ft.appendChild(b); } } }
let mapBlips = [], mapHover = null, busLegend = [];
function drawBigMap() {
  const cv = $('bigcv'), W = Math.min(window.innerWidth - (window.innerWidth > 900 ? 300 : 30), 1500), H = Math.min(window.innerHeight - 120, W * mapCv.height / mapCv.width), sc = Math.min(W / mapCv.width, H / mapCv.height), dpr = Math.min(2, window.devicePixelRatio || 1) * (typeof MZ !== 'undefined' ? Math.min(2.5, MZ.z) : 1);
  cv.width = mapCv.width * sc * dpr; cv.height = mapCv.height * sc * dpr; cv.style.width = mapCv.width * sc + 'px'; cv.style.height = mapCv.height * sc + 'px'; const g = cv.getContext('2d'); g.scale(sc * dpr, sc * dpr); g.drawImage(mapCv, 0, 0); const zs = sc * (typeof MZ !== 'undefined' ? Math.pow(MZ.z, 0.7) : 1);
  g.textAlign = 'center'; g.textBaseline = 'middle'; mapBlips = [];
  if (sc > 1.6 || 1) { g.font = `600 ${10.5 / zs}px ${FONT}`; g.fillStyle = 'rgba(255,255,255,0.6)'; g.textAlign = 'center'; for (const v of VNAMES) g.fillText(v.nm, mpx(v.x), mpz(v.z)); }
  for (const t of townPolys) { g.font = `900 ${26 / zs}px ${FONT}`; g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillText(t.name, mpx(t.cx), mpz(t.cz)); }
  // GTA 風格圖示：深色圓底＋彩色外框＋單字；景點只畫小菱形，滑鼠移上去才顯示名稱
  const blip = (x, z, col, r, ch, name) => { const X = mpx(x), Y = mpz(z); g.fillStyle = '#16191d'; g.beginPath(); g.arc(X, Y, r / zs, 0, 7); g.fill(); g.lineWidth = 2.2 / zs; g.strokeStyle = col; g.stroke(); if (ch) { g.fillStyle = col; g.font = `900 ${r * 1.15 / zs}px ${FONT}`; g.fillText(ch, X, Y + 0.6 / zs); } if (name) mapBlips.push({ X, Y, name }); };
  const seen = new Set(); for (const p of PLACES) { if (seen.has(p.name) || p.x > 4000) continue; seen.add(p.name); const X = mpx(p.x), Y = mpz(p.z), r = 3.2 / zs; g.fillStyle = 'rgba(244,239,226,0.85)'; g.beginPath(); g.moveTo(X, Y - r); g.lineTo(X + r, Y); g.lineTo(X, Y + r); g.lineTo(X - r, Y); g.closePath(); g.fill(); mapBlips.push({ X, Y, name: p.name }); }
  if (BUSR.routes.length) { const done = new Set(); g.strokeStyle = 'rgba(46,204,113,0.55)'; g.lineWidth = 2.2 / zs; g.setLineDash([5 / zs, 3 / zs]); g.beginPath(); for (const R of BUSR.routes) for (const e of R.edges) { if (done.has(e)) continue; done.add(e); e.pts.forEach((p, i) => i ? g.lineTo(mpx(p.x), mpz(p.z)) : g.moveTo(mpx(p.x), mpz(p.z))); } g.stroke(); g.setLineDash([]);
    busLegend = []; if (mapHover && mapHover.stop) { const PAL = ['#ff6b6b', '#ffd23f', '#4dabf7', '#b07be0', '#ff9f43', '#20c997', '#f783ac', '#a9e34b', '#74c0fc', '#ffa8a8']; let li = 0; for (const R of BUSR.routes) { if (!R.stops.some(q => q.name === mapHover.stop.name)) continue; const col = PAL[BUSR.routes.indexOf(R) % PAL.length], off = (li - 1) * 1.6 / zs; g.strokeStyle = col; g.lineWidth = 3.4 / zs; g.beginPath(); let first = true; for (const e of R.edges) e.pts.forEach(p => { const X = mpx(p.x) + off, Y = mpz(p.z) + off; if (first) { g.moveTo(X, Y); first = false; } else g.lineTo(X, Y); }); g.stroke(); busLegend.push([col, `${R.ref} 路　${(R.name || '').replace(/^金門縣(公車)?\s*/, '').slice(0, 16)}`]); li++; } }
    for (const s of BUSR.stops) { if (!s.lines) s.lines = BUSR.routes.filter(R => R.stops.some(q => q.name === s.name)).map(R => R.ref).filter((x, i, a) => a.indexOf(x) === i).join('、'); const X = mpx(s.x), Y = mpz(s.z); g.fillStyle = '#2ecc71'; g.beginPath(); g.arc(X, Y, 2.1 / zs, 0, 7); g.fill(); mapBlips.push({ X, Y, name: `🚌 ${s.name}（${s.lines} 路）`, stop: s }); } }
  for (const r of rooms) { const t = r.type; blip(r.door.x, r.door.z, t === 'bank' ? '#3ccf6e' : t === 'gun' ? '#e67e22' : t === 'home' ? '#b07be0' : '#5dade2', 5.2, t === 'bank' ? '$' : t === 'gun' ? '槍' : t === 'home' ? '家' : '店', r.name); }
  for (const h of homes) if (h.own) blip(h.x, h.z, '#ff9f43', 6, '家', h.name);
  for (const m of markers) blip(m.x, m.z, m.color, 7.5, m.ch, m.label || m.name);
  if (routePts) { g.beginPath(); routePts.forEach((p, i) => i ? g.lineTo(mpx(p[0]), mpz(p[1])) : g.moveTo(mpx(p[0]), mpz(p[1]))); g.lineWidth = 4 / zs; g.strokeStyle = '#b07be0'; g.stroke(); }
  const wp = wpos(); if (target) blip(target.x, target.z, '#ffd23f', 8, '★', target.label);
  { const X = mpx(wp.x), Y = mpz(wp.z), a = cam.yaw, R = 9 / zs; g.save(); g.translate(X, Y); g.rotate(-a + Math.PI); g.beginPath(); g.moveTo(0, -R); g.lineTo(R * 0.7, R * 0.8); g.lineTo(0, R * 0.4); g.lineTo(-R * 0.7, R * 0.8); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2 / zs; g.strokeStyle = '#111'; g.stroke(); g.restore(); }
  drawDadanInset(g, sc);
  if (mapHover && busLegend.length) { const lx = Math.min(mapHover.X + 14 / zs, mapCv.width - 190 / zs); busLegend.forEach(([col, tx], i) => { const ly = mapHover.Y + (20 + i * 17) / zs; g.fillStyle = 'rgba(12,14,17,0.9)'; g.fillRect(lx - 5 / zs, ly - 8.5 / zs, 185 / zs, 16 / zs); g.fillStyle = col; g.font = `700 ${11.5 / zs}px ${FONT}`; g.textAlign = 'left'; g.fillText(tx, lx, ly); g.textAlign = 'center'; }); }
  if (mapHover) { const t = mapHover.name; g.font = `700 ${14 / zs}px ${FONT}`; const w = g.measureText(t).width + 16 / zs, X = Math.min(mapHover.X + 12 / zs, mapCv.width - w), Y = mapHover.Y - 22 / zs; g.fillStyle = 'rgba(12,14,17,0.88)'; g.fillRect(X, Y - 11 / zs, w, 22 / zs); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(t, X + 8 / zs, Y); }
  if (!cv.hoverOn) { cv.hoverOn = true; cv.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(), s2 = r.width / mapCv.width, mx = (e.clientX - r.left) / s2, my = (e.clientY - r.top) / s2; let best = null, bd = 13 / s2; for (const b of mapBlips) { const d = Math.hypot(b.X - mx, b.Y - my); if (d < bd) { bd = d; best = b; } } if (best !== mapHover) { mapHover = best; drawBigMap(); } }); cv.addEventListener('mouseleave', () => { if (mapHover) { mapHover = null; drawBigMap(); } }); }
}

/* =====================================================================
   日夜 / 環境
   ===================================================================== */
const env = { tod: 16.4, night: 0 }, sunDir = new V3(), lightDir = new V3();
const SKY = { dayTop: new THREE.Color('#2e7bd3'), dayHor: new THREE.Color('#bfe0f5'), duskTop: new THREE.Color('#3a4f8a'), duskHor: new THREE.Color('#f8a060'), nightTop: new THREE.Color('#040711'), nightHor: new THREE.Color('#0f1c36'), sunLow: new THREE.Color('#ff9a57'), sunHigh: new THREE.Color('#fff3df'), moon: new THREE.Color('#9db7ff'), hemiDay: new THREE.Color('#cfe3ff'), hemiNight: new THREE.Color('#32406b') };
const cTop = new THREE.Color(), cHor = new THREE.Color();
const headLamp = new THREE.SpotLight(0xfff0c8, 0, 75, 0.6, 0.7, 2); scene.add(headLamp, headLamp.target);
function updateEnv(dt, focus) {
  env.tod = (env.tod + dt / 45) % 24; const t = (env.tod - 6) / 12 * Math.PI, el = Math.sin(t), elev = el * 1.08;
  sunDir.set(Math.cos(t) * Math.cos(elev), Math.sin(elev), 0.45 * Math.cos(elev)).normalize();
  const day = smooth(-0.1, 0.3, el), tw = clamp(1 - Math.abs(el - 0.04) / 0.34, 0, 1), night = 1 - smooth(-0.14, 0.1, el); env.night = night;
  cTop.copy(SKY.nightTop).lerp(SKY.dayTop, day).lerp(SKY.duskTop, tw * 0.6); cHor.copy(SKY.nightHor).lerp(SKY.dayHor, day).lerp(SKY.duskHor, tw * 0.8);
  skyMat.uniforms.top.value.copy(cTop); skyMat.uniforms.hor.value.copy(cHor); skyMat.uniforms.sunDir.value.copy(sunDir); skyMat.uniforms.night.value = night; skyMat.uniforms.sunCol.value.copy(SKY.sunLow).lerp(SKY.sunHigh, smooth(0.05, 0.5, el)).multiplyScalar(smooth(-0.12, 0.02, el));
  scene.fog.color.copy(cHor).lerp(cTop, 0.12);
  if (el > -0.03) { lightDir.copy(sunDir); if (lightDir.y < 0.06) { lightDir.y = 0.06; lightDir.normalize(); } sun.color.copy(SKY.sunLow).lerp(SKY.sunHigh, smooth(0.05, 0.5, el)); sun.intensity = 2.7 * smooth(-0.03, 0.22, el); }
  else { lightDir.copy(sunDir).multiplyScalar(-1); if (lightDir.y < 0.25) { lightDir.y = 0.25; lightDir.normalize(); } sun.color.copy(SKY.moon); sun.intensity = 0.85 * smooth(-0.03, -0.2, el); }
  sun.position.set(focus.x + lightDir.x * 400, focus.y + lightDir.y * 400, focus.z + lightDir.z * 400); sun.target.position.copy(focus);
  hemi.intensity = lerp(0.8, 1.55, day); hemi.color.copy(SKY.hemiNight).lerp(SKY.hemiDay, day); renderer.toneMappingExposure = lerp(1.15, 1.05, day);
  mFacade.emissiveIntensity = night * 0.55; mGlow.emissiveIntensity = night * 3; mPool.opacity = night * 0.5;
  { const v = player.veh; if (v && night > 0.25 && !v.def.boat) { const f = fwd(v.yaw); headLamp.intensity = night * 900; headLamp.position.set(v.pos.x + f.x * 1.6, v.pos.y + 1.0, v.pos.z + f.z * 1.6); headLamp.target.position.set(v.pos.x + f.x * 24, v.pos.y - 0.5, v.pos.z + f.z * 24); } else headLamp.intensity = 0; } mSign.emissiveIntensity = 0.15 + night * 0.85; mHead.emissiveIntensity = 0.3 + night * 3; mTail.emissiveIntensity = 0.25 + night * 1.5; cloudMat.opacity = lerp(0.25, 0.9, day);
  sky.position.copy(camera.position); water.position.x = Math.round(camera.position.x / 200) * 200; water.position.z = Math.round(camera.position.z / 200) * 200; waterNormal.offset.x += dt * 0.012; waterNormal.offset.y += dt * 0.007; if (foamMat) { foamMat.map.offset.x += dt * 0.02; foamMat.map.offset.y += dt * 0.013; foamMat.opacity = (0.42 + Math.sin(game.time * 1.3) * 0.16) * lerp(0.5, 1, day); }
  scene.fog.far = player.plane ? 5200 : 3000;
  const h = Math.floor(env.tod), m = Math.floor((env.tod % 1) * 60); $('clock').textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
function updateCamera(dt) {
  if (cam.free) { camera.position.copy(cam.free.p); camera.lookAt(cam.free.t); return; }
  const v = player.veh || player.bus, pl = player.plane, R = player.inside; let tp, dist, hgt, side = 0, pitch = cam.pitch; const crouchY = player.crouch && !v && !pl ? -0.45 : 0;
  if (pl) { if (game.time - cam.lastIn > 1.5) cam.off *= Math.exp(-2.5 * dt); cam.yaw += angDiff(cam.yaw, pl.yaw + cam.off) * (1 - Math.exp(-dt * 4)); dist = 17; hgt = 2.4; tp = pl.pos; pitch = clamp(0.2 - pl.pitch * 0.6, -0.3, 0.8); }
  else if (v) { if (game.time - cam.lastIn > 1.2 && !(inv.cur && (input.fire || input.aim))) cam.off *= Math.exp(-2.5 * dt); cam.yaw += angDiff(cam.yaw, v.yaw + cam.off) * (1 - Math.exp(-dt * (v.def.two ? 7 : 5))); dist = (player.bus ? 13 : v.def.two ? 5.2 : v.type === 'van' ? 10 : v.type === 'boat' ? 10 : 8.4) + Math.abs(v.speed) * (v.def.two ? 0.06 : 0.08); hgt = v.type === 'van' ? 2.5 : v.def.two ? 1.45 : 1.6; tp = v.pos; }
  else { const armed = inv.cur > 0; if (!armed && !locked && player.spd > 0 && game.time - cam.lastIn > 1.6) cam.yaw += angDiff(cam.yaw, player.yaw) * Math.min(1, dt * 1.3); dist = R ? 3.3 : input.aim && armed ? 3.0 : armed ? 4.8 : 6.4; hgt = 1.55; tp = player.pos; if (armed) side = 0.65; if (player.tunnel) { const big = player.tunnel.H > 8; dist = Math.min(dist, big ? 5.5 : 3.2); side = big ? side : 0.15; hgt = Math.min(1.55, player.tunnel.H - 0.9); } }
  const f = fwd(cam.yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), sx = -f.z * side, sz = f.x * side; let wx = tp.x - f.x * dist * cp + sx, wz = tp.z - f.z * dist * cp + sz, wy = tp.y + hgt + dist * sp;
  if (player.tunnel) { wy = Math.min(wy, player.tunnel.Y + player.tunnel.H - 0.35); pitch = Math.min(pitch, 0.5); }
  if (R) { const q = R.local(wx, wz), lx = clamp(q.lx, -R.w / 2 + 0.35, R.w / 2 - 0.35), lz = clamp(q.lz, -R.d / 2 + 0.35, R.d / 2 - 0.35), w2 = R.L(lx, lz); wx = w2.x; wz = w2.z; wy = Math.min(wy, R.Y + R.H - 0.3); }
  else { const gy = heightAt(wx, wz) + 0.8; if (wy < gy) wy = gy; if (wy < 0.6) wy = 0.6;
    if (!pl) { const ox = tp.x + sx, oz = tp.z + sz, oy = tp.y + hgt; for (let k = 1; k <= 8; k++) { const t = k / 8, qx = lerp(ox, wx, t), qz = lerp(oz, wz, t), qy = lerp(oy, wy, t); if (qy < Math.max(0, groundAt(qx, qz)) + 10 && !boxFree(qx, qz, 0.35)) { const tt = Math.max(0.12, (k - 1.4) / 8); wx = lerp(ox, wx, tt); wz = lerp(oz, wz, tt); wy = lerp(oy, wy, tt); break; } } } }
  if (!v && !pl) player.model.group.visible = !player.bus && !(player.tunnel && Math.hypot(cam.pos.x - tp.x, cam.pos.z - tp.z) < 0.9);
  const k = 1 - Math.exp(-dt * (pl ? 6 : 12)); cam.pos.x += (wx - cam.pos.x) * k; cam.pos.y += (wy - cam.pos.y) * k; cam.pos.z += (wz - cam.pos.z) * k; camera.position.copy(cam.pos); if (!R && !player.tunnel && !pl) treeOcclude(cam.pos.x, cam.pos.y, cam.pos.z, tp.x, tp.y + hgt, tp.z); else if (treeHidden.size) treeOcclude(0, 0, 0, 0, 0, 0);
  const la = !v && !pl && inv.cur ? 14 : 0; camera.position.y += crouchY; camera.lookAt(tp.x + sx + f.x * la, tp.y + hgt + crouchY - (la ? Math.tan(pitch) * la * 0.75 : 0), tp.z + sz + f.z * la);
  cam.bank = (cam.bank || 0) + ((v && v.def && v.def.two && !player.bus ? (v.roll || 0) * 0.16 : 0) - (cam.bank || 0)) * Math.min(1, dt * 5); if (Math.abs(cam.bank) > 0.001) camera.rotateZ(cam.bank); // 騎機車時鏡頭跟著微微傾斜
  const fov = pl ? 62 + pl.speed * 0.12 : input.aim && inv.cur && !v ? 40 : 58 + (v ? clamp(Math.abs(v.speed) / v.def.max, 0, 1) * 13 : 0); if (Math.abs(camera.fov - fov) > 0.1) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 6); camera.updateProjectionMatrix(); }
}

/* =====================================================================
   主迴圈
   ===================================================================== */
let nearRoad = [], nearTown = [], nearT = 0, spawnT = 0, last = 0;
function treeNear(x, z, r) { const i0 = Math.floor((x - r - 8) / TCELL), i1 = Math.floor((x + r + 8) / TCELL), j0 = Math.floor((z - r - 8) / TCELL), j1 = Math.floor((z + r + 8) / TCELL); const o = []; for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const a = TREEG.get(i + ',' + j); if (a) for (const t of a) if (t.y1 > -50 && Math.hypot(t.x - x, t.z - z) < r) o.push(t); } return o; }
function dropTree(t) { for (const e of t.ents) { e[0] = ZERO_M.clone(); if (e[2]) { e[2].setMatrixAt(e[3], ZERO_M); e[2].instanceMatrix.needsUpdate = true; } } t.y1 = -99; }
function spawnParked() {
  for (const p of PARKED) { if (p[0] !== 'police' && !boxFree(p[1], p[2], 1.4)) continue; for (const t of treeNear(p[1], p[2], 3.2)) dropTree(t); const v = makeVehicle(p[0], p[1], p[2], p[3]); v.perm = true; }
  for (const b of BOATS0) { const v = makeVehicle('boat', b[0], b[1], b[2]); v.perm = true; } for (const q of PLANES0) makePlane(q[0], q[1], q[2]); for (const k of PICKUPS0) addPickup(k[0], k[1], k[2]);
  let n = 0; for (let tries = 0; tries < 400 && n < 34; tries++) { const s = pick(townSamples), e = s.e, p = e.pts[s.i], t = TOWNS[p.town]; if (t.style === 'park' || s.i < 4 || s.i > e.pts.length - 5) continue; const side = rand() < 0.5 ? 1 : -1, x = p.x - p.tz * side * (e.hw + 0.9), z = p.z + p.tx * side * (e.hw + 0.9); if (vehicles.some(o => Math.hypot(o.pos.x - x, o.pos.z - z) < 7) || !boxFree(x, z, 1.2) || treeNear(x, z, 3).length) continue; const r = rand(), v = makeVehicle(r < 0.42 ? 'scooter' : r < 0.66 ? 'sedan' : r < 0.78 ? 'suv' : r < 0.88 ? 'pickup' : r < 0.94 ? 'taxi' : 'van', x, z, Math.atan2(p.tx * side, p.tz * side)); v.perm = true; n++; }
}
function updateWorld(dt) {
  const wp = wpos(), px = wp.x, pz = wp.z;
  nearT -= dt; if (nearT <= 0) { nearT = 1.2; nearRoad = roadSamples.filter(s => { const p = s.e.pts[s.i], d = Math.abs(p.x - px) + Math.abs(p.z - pz); return d > 190 && d < 520; }); nearTown = townSamples.filter(s => { const p = s.e.pts[s.i], d = Math.hypot(p.x - px, p.z - pz); return d > 40 && d < 230; }); }
  routeBusTick(dt); spawnT -= dt; if (spawnT <= 0) { spawnT = 0.2; let nt = 0; for (const v of vehicles) if (v.ai) nt++; if (nt < (player.plane ? 14 : Q.traffic) && nearRoad.length) { const s = pick(nearRoad); if (!s.e.bridge || rand() < 0.3) spawnTraffic(s); } if (peds.length < Q.peds && nearTown.length) spawnPed(pick(nearTown)); }
  for (const v of [...vehicles]) {
    const d = Math.abs(v.pos.x - px) + Math.abs(v.pos.z - pz); v.group.visible = d < (player.plane ? 700 : 330);
    if (v.ai) { if (d > 640 && !v.perp) { removeVehicle(v); continue; } updateTraffic(v, dt); vehiclePost(v, dt); }
    else if (v.driver === 'none') { if (!v.perm && d > 640) { removeVehicle(v); continue; } if (Math.abs(v.vx) + Math.abs(v.vz) > 0.05) { driveVehicle(v, { thr: 0, steer: 0, hb: true }, dt); vehicleCollide(v, dt); vehiclePost(v, dt); } }
  }
  for (const p of [...peds]) { if (p.state === 'wait') { p.m.group.position.copy(p.pos); p.m.armR.rotation.x = -2.6 + Math.sin(game.time * 6) * 0.3; p.m.group.rotation.y = Math.atan2(px - p.pos.x, pz - p.pos.z); continue; } if (!p.keep && (Math.hypot(p.pos.x - px, p.pos.z - pz) > 300 || (p.dead && p.t > 45))) { if (mission.taxi && mission.taxi.ped === p) endTaxi(null); removePed(p); continue; } updatePed(p, dt); }
}
function updateHud(dt) {
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('show'); } if (subT > 0) { subT -= dt; if (subT <= 0) $('subtitle').classList.remove('show'); }
  const v = player.veh, pl = player.plane; $('speed').textContent = pl ? `${Math.round(pl.speed * 3.6)} km/h　高度 ${Math.round(Math.max(0, pl.pos.y) * 3)} m　油門 ${Math.round(pl.thr * 100)}%` : v ? Math.round(Math.abs(v.speed) * 3.6) + ' km/h' : ''; $('hp').style.width = clamp(player.hp, 0, 100) + '%'; $('armor').style.width = clamp(player.armor, 0, 100) + '%'; if (player.hp < 100 && !wanted.stars) player.hp = Math.min(100, player.hp + dt * 1.5);
  let pr = ''; if (pl) pr = pl.air || pl.speed > 4 ? '' : '按 <b>F</b> 下飛機'; else if (!v) { const a = nearAction(), m = nearMarker(), np = player.inside ? null : nearestPlane(), nv = player.inside ? null : nearestVehicle(); if (a) pr = `按 <b>E</b> ${a._l}`; else if (m) pr = `按 <b>E</b> 開始任務：${m.title}`; else if (np) pr = '按 <b>F</b> 駕駛小飛機'; else if (nv) pr = `按 <b>F</b> ${nv.driver === 'ai' ? '搶' : nv.def.boat ? '開' : '上'}${nv.def.boat ? '船' : '車'}（${nv.def.name}）`; } else if (v.def.taxi && !mission.taxi && !mission.type) pr = '按 <b>T</b> 開始載客';
  if (game.menu) { pr = ''; if (!game.menu.phone && !game.menu.shop && !nearAction()) closeMenu(); }
  updateTouchUI(); if (TUI.on && pr) pr = pr.replace(/^按 <b>[A-Z]<\/b> /, ''); // 觸控不顯示鍵盤提示
  const pe = $('prompt'); if (pe.dataset.t !== pr) { pe.dataset.t = pr; pe.innerHTML = pr; pe.classList.toggle('show', !!pr); }
  if (game.frame % 20 === 0) { const z = zoneAt(player.pos.x, player.pos.z); if (z.name !== lastZone) { lastZone = z.name; const ze = $('zone'); ze.innerHTML = `<b>${z.name}</b><span>${z.name === z.town || !z.town ? '金門縣' : z.town}</span>`; ze.classList.remove('show'); void ze.offsetWidth; ze.classList.add('show'); } }
  if (target) { routeT -= dt; if (routeT <= 0) { routeT = 1; const wp = wpos(); routePts = mission.type === 'fly' ? [[wp.x, wp.z], [target.x, target.z]] : computeRoute(wp.x, wp.z, target.x, target.z); } targetMesh.material.opacity = 0.22 + Math.sin(game.time * 4) * 0.08; { const wq = wpos(); targetMesh.visible = mission.type !== 'fly' && target.beacon === true && Math.hypot(target.x - wq.x, target.z - wq.z) > 16; } }
  if (game.frame % 2 === 0) drawMinimap(); if (game.mapOpen && game.frame % 30 === 0) drawBigMap();
  if (eng) { const s = pl ? 20 + pl.thr * 30 : v ? Math.abs(v.speed) : 0; eng.g.gain.value = pl ? 0.03 + pl.thr * 0.04 : v && v.def.quiet ? 0 : v ? 0.035 + Math.min(0.03, s * 0.001) : 0; eng.o.frequency.value = v && v.def.two ? 80 + s * 6.5 + (axis().y > 0 ? 22 : 0) : 48 + s * 4.2 + (v && axis().y > 0 ? 14 : 0); eng.f.frequency.value = v && v.def.two ? 900 + s * 45 : 380 + s * 22; } // 機車：無段變速的高音引擎聲
  game.saveT -= dt; if (game.saveT <= 0) { game.saveT = 30; if (!wanted.stars) saveGame(); }
}
// 手機切到別的 App 或關掉時立刻存一次（不用等 30 秒自動存檔）；並請瀏覽器把存檔標成「不要自動清掉」
for (const ev of ['visibilitychange', 'pagehide']) window.addEventListener(ev, () => { if ((ev === 'pagehide' || document.visibilityState === 'hidden') && game.started && !wanted.stars) { saveGame(); try { saveStory(); } catch (e) { } } });
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { }); } catch (e) { }
function saveGame() { try { localStorage.setItem('kinmen_save2', JSON.stringify({ money: player.money, has: inv.has, ammo: inv.ammo, armor: player.armor, lions: lions.map(l => l.found) })); } catch (e) { } }
function loadGame() { try { const d = JSON.parse(localStorage.getItem('kinmen_save2') || 'null'); if (!d) return; player.money = d.money; d.has.forEach((h, i) => inv.has[i] = !!h || i === 0); d.ammo.forEach((a, i) => inv.ammo[i] = a | 0); player.armor = d.armor || 0; (d.lions || []).forEach((f, i) => { if (f && lions[i]) { lions[i].found = true; lions[i].ring.visible = false; mission.lions++; } }); } catch (e) { } }
function stepGame(dt) { game.time += dt; game.frame++; updateSurvival(dt); updateRooms(); const ax = game.busy ? { x: 0, y: 0 } : axis(); if (player.plane) updatePlane(player.plane, dt); else if (player.veh) updatePlayerVehicle(dt, ax); else if (player.bus) updateBusRide(dt); else updatePlayerFoot(dt, ax); for (const p of planes) if (p !== player.plane && p.speed > 0) { p.speed = 0; } updateCombat(dt); updateTunnels(dt); updateAmbient(dt); updateVig(dt); updateDays(); updateCows(dt); updateTide(); updateNades(dt); updateHeli(dt); radioTick(); updateStory(dt); updateWorld(dt); updateLife(dt); updateWanted(dt, nearRoad); updateMissions(dt); updateHud(dt); }
function frame(now) {
  requestAnimationFrame(frame); perfTick(now); cullUpdate(); autoRes(now); const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; game.fps = lerp(game.fps, 1 / Math.max(dt, 1e-3), 0.05);
  if (game.started && !game.paused) stepGame(dt); else if (!game.started) { cam.yaw += dt * 0.05; }
  rigUpdate(dt); updateTrafficLights(); updateCamera(dt); drunkCam(); updateEnv(game.started ? dt : dt * 0.2, player.pos); applyWeather(game.started ? dt : 0.016); renderFrame();
}
const tick = () => new Promise(r => setTimeout(r, 30));
async function boot() {
  const L = t => { $('loadtext').textContent = t; };
  { // 載入畫面的金門小知識
    const tips = ['風獅爺是金門的守護神，立在村口鎮風止煞。', '貢糖是金門名產，用花生和麥芽糖反覆搥打製成。', '金門高粱酒以 58 度最有名。', '金門菜刀是用砲彈的鋼打造的。', '八二三砲戰發生在 1958 年。', '古寧頭戰役發生在 1949 年。', '翟山坑道是能讓小艇直接開進去的水道坑道。', '金門大橋連接大金門和烈嶼（小金門）。', '閩南古厝屋脊兩端高高翹起，叫做燕尾脊。', '洋樓是早年下南洋的金門人賺錢回鄉蓋的。', '卡住的時候：手機選單裡有「脫困」。', '想知道手機順不順：手機選單裡有「效能顯示」。'];
    const d = document.createElement('p'); d.style.cssText = 'margin-top:18px;font-size:14px;opacity:.78;max-width:80vw;text-align:center'; d.textContent = '小知識：' + tips[Math.floor(Math.random() * tips.length)]; $('loading').appendChild(d); }
  try { await Promise.race([document.fonts.load(`800 40px "Noto Sans TC"`, '金門浯島風雲國立大學莒光樓酒廠機場橋' + SHOPS.join('') + (typeof OSM_PLACES !== 'undefined' ? OSM_PLACES.map(p => p[0]).join('') + OSM_ROADS.names.join('') : '')), new Promise(r => setTimeout(r, 1500))]); } catch (e) { }
  L('產生金門島地形…'); await loadDEM(); await loadLU(); await tick(); buildTerrainData();
  L('鋪設道路…'); await tick(); await loadPhotos().catch(() => { }); buildRoadData(); buildTerrainMesh(); buildRoadMeshes();
  L('建造聚落與地標…'); await tick(); await loadNature().catch(() => { }); buildWorld(); buildRoundabouts(); buildRoadFurniture(); buildCampGates(); addOsmPlaces(); buildBusRoutes(); buildMap();
  L('準備車輛與居民…'); await tick(); applyQuality(); applyGrime(); mergeTowns(); buildFarShore(); initPlayer(); loadRigs().catch(() => { }); await loadCars().catch(() => { }); spawnParked(); initMissions(); loadGame(); survLoad(); initStory(); setupTouch(); drawStars(); addMoney(0); $('delta').className = ''; refreshWeapon();
  cam.yaw = player.yaw + 0.5; cam.pitch = 0.22; const f = fwd(cam.yaw); cam.pos.set(player.pos.x - f.x * 14, player.pos.y + 6, player.pos.z - f.z * 14);
  $('loading').style.display = 'none'; $('start').classList.add('show'); window.__KINMEN__.ready = true; requestAnimationFrame(frame);
}
function startGame() { if (game.started) return; game.started = true; initAudio(); $('start').classList.remove('show'); $('hud').classList.add('show'); cam.yaw = player.yaw; cam.pitch = 0.3; const touchUI = $('touch').style.display === 'block'; if (touchUI) subtitle('歡迎來到金門！點<b>車</b>開你家門口的紅色跑車，點<b>圖</b>可以傳送到各鄉鎮，點<b>☰</b>暫停與調整畫質。', 10); else subtitle('歡迎來到金門。這裡是你家（頂埔下 201 號），按 <b>F</b> 開門口的紅色跑車；按 <b>M</b> 開地圖可以<b>傳送</b>到各鄉鎮。金城和山外有<b>軍品店</b>買槍、有<b>銀行</b>可以搶，機場有<b>小飛機</b>，碼頭有<b>快艇</b>。', 14); }
$('startBtn').addEventListener('click', startGame);
$('bigmap').addEventListener('click', e => { if (e.target.id === 'bigmap') toggleMap(); });
$('bigcv').addEventListener('click', mapClick);
$('pauseBtn').addEventListener('click', () => togglePause(true));
$('resetBtn').addEventListener('click', () => { try { for (const k of ['kinmen_save2', 'kinmen_story', 'kinmen_props', 'kinmen_homes', 'kinmen_side', 'kinmen_secrets']) localStorage.removeItem(k); } catch (e) { } location.reload(); });

/* ---------- 除錯 / 自動測試用的狀態介面 ---------- */
const SCENES = { nqu: [24.4447, 118.3250, 0.6], jincheng: [24.4336, 118.3204, 2.4], bank: [24.4350, 118.3197, 0], airport: [24.4340, 118.3600, 3.1], shuitou: [24.4150, 118.2890, 4], shanwai: [24.4420, 118.4143, 2.2], shamei: [24.4890, 118.4132, 5.5], lieyu: [24.4320, 118.2442, 4], guningtou: [24.4775, 118.3087, 5.6], shanhou: [24.5032, 118.4397, 0.6] };
for (const k in SCENES) { const g = G(SCENES[k][0], SCENES[k][1]); SCENES[k] = [g[0], g[1], SCENES[k][2]]; }
window.__KINMEN__ = {
  ready: false, scenes: Object.keys(SCENES), start: startGame, _scene: scene, _T: THREE, _cam: camera, mergeInfo: () => MRG.stat, mergeCheck, _msrc: () => MRG.src, _ms: k => MRG[k], cullCaps, _cullList: () => CULL.list, _cf: () => CULL.f, _isVeh: o => vehicles.some(v => v.group === o), _cullInfo: () => { const c = { n: CULL.list.length, grp: 0, hid: CULL.hidden, d: {} }; for (const e of CULL.list) { if (e.grp) c.grp++; const k = (e.grp ? "g" : "m") + Math.round(e.d / 100) * 100; c.d[k] = (c.d[k] || 0) + 1; } return c; }, _ri: () => renderer.info.memory, _mwhy: () => Object.entries(MRG.why || {}).sort((a, b) => b[1] - a[1]),
  state: () => ({ x: +player.pos.x.toFixed(1), y: +player.pos.y.toFixed(1), z: +player.pos.z.toFixed(1), km: [+(player.pos.x / KM).toFixed(2), +(-player.pos.z / KM).toFixed(2)], inVehicle: player.veh ? player.veh.type : null, speed: player.veh ? +player.veh.speed.toFixed(1) : 0, money: player.money, hp: Math.round(player.hp), stars: wanted.stars, tod: +env.tod.toFixed(2), zone: lastZone, mission: mission.type, taxi: !!mission.taxi, vehicles: vehicles.length, traffic: vehicles.filter(v => v.ai).length, police: vehicles.filter(v => v.driver === 'police').length, peds: peds.length, lions: mission.lions, fps: Math.round(game.fps), draws: renderer.info.render.calls, tris: renderer.info.render.triangles }),
  teleport: (name, yawOverride) => { const s = SCENES[name]; if (!s) return false; exitForce(); const x = s[0] * KM, z = -s[1] * KM; player.pos.set(x, heightAt(x, z), z); player.yaw = yawOverride ?? s[2]; cam.yaw = player.yaw; const f = fwd(cam.yaw); cam.pos.set(x - f.x * 8, player.pos.y + 4, z - f.z * 8); nearT = 0; return true; },
  setTime: h => { env.tod = h; }, setWanted: n => { wanted.cd = 0; wanted.stars = 0; crime(n); }, key: (c, down) => { keys[c] = down; if (down) onKey(c); }, cam: (yaw, pitch) => { cam.yaw = yaw; cam.pitch = pitch; cam.lastIn = game.time + 1e6; },
  enterNearest: () => { const v = nearestVehicle(60); if (v) enterVehicle(v); return v ? v.type : null; }, spawn: type => { const f = fwd(player.yaw); return !!makeVehicle(type, player.pos.x + f.x * 5, player.pos.z + f.z * 5, player.yaw); },
  route: (a, b) => { const A = SCENES[a], B = SCENES[b], r = computeRoute(A[0] * KM, -A[1] * KM, B[0] * KM, -B[1] * KM); return r ? r.length : 0; }, interact, map: toggleMap,
  sim: secs => { const n = Math.round(secs * 30); for (let i = 0; i < n; i++) { stepGame(1 / 30); rigUpdate(1 / 30); updateCamera(1 / 30); updateEnv(1 / 30, player.pos); applyWeather(1 / 30); } return game.frame; },
  goto: (kx, ky, yaw = 0) => { exitForce(); const x = kx * KM, z = -ky * KM; player.pos.set(x, heightAt(x, z), z); player.yaw = yaw; cam.yaw = yaw; const f = fwd(yaw); cam.pos.set(x - f.x * 8, player.pos.y + 4, z - f.z * 8); nearT = 0; },
  free: (kx, ky, h, tkx, tky, th) => { if (kx === null) { cam.free = null; return; } const x = kx * KM, z = -ky * KM, tx = tkx * KM, tz = -tky * KM; cam.free = { p: new V3(x, Math.max(0, groundAt(x, z)) + h, z), t: new V3(tx, Math.max(0, groundAt(tx, tz)) + th, tz) }; },
  warpVeh: (x, z) => { const v = player.veh; if (!v) return false; v.pos.set(x, heightAt(x, z), z); v.vx = v.vz = 0; v.speed = 0; player.pos.copy(v.pos); nearT = 0; return true; },
  ll: (lat, lon) => G(lat, lon), sd: (kx, ky) => Math.round(sdAt(kx * KM, -ky * KM)), give: (i, n = 200) => giveWeapon(i, n), money: n => addMoney(n), rooms: () => rooms.map(r => r.name + (r.out ? '' : ' [無門]')), enter: i => { exitForce(); const r = rooms[i]; const q = r.L(0, r.d / 2 - 1.6); player.pos.set(q.x, r.Y, q.z); player.yaw = r.rot + Math.PI; cam.yaw = player.yaw; cam.pos.set(q.x, r.Y + 2, q.z); updateRooms(); return r.name; }, leave: () => { const q = player.inside ? player.inside.door : player.pos; player.pos.set(q.x, heightAt(q.x, q.z), q.z); updateRooms(); }, startRob: () => { if (player.inside) startRob(player.inside); return !!rob; }, rob: () => rob && { stage: rob.stage, got: rob.got, t: rob.t }, loot: () => player.loot,
  fire: on => { input.fire = on; if (on) input.fireEdge = true; }, plane: () => { const p = planes[0]; exitForce(); player.pos.set(p.pos.x + 3, p.pos.y, p.pos.z); enterPlane(p); return true; }, pstate: () => player.plane && { y: +player.plane.pos.y.toFixed(1), sp: +player.plane.speed.toFixed(1), air: player.plane.air, pitch: +player.plane.pitch.toFixed(2) }, boats: () => vehicles.filter(v => v.def.boat).map(v => [v.pos.x | 0, v.pos.z | 0, +groundAt(v.pos.x, v.pos.z).toFixed(1)]), boat: i => { const b = vehicles.filter(v => v.def.boat)[i]; exitForce(); enterVehicle(b); player.pos.copy(b.pos); return true; }, ft: id => fastTravel(id), counts: () => ({ cops: cops.length, pickups: pickups.length, planes: planes.length, shops: shopList.length, named: shopList.filter(s => s.named).length, actions: actions.length, lions: lions.length, beaches: BEACHES.filter(b => !b.skip).map(b => b.name), decks: decks.length }),
  check: () => { const bad = []; for (const id in roadNodes) { const n = roadNodes[id], sd = sdAt(n.x, n.z); if (sd < 25) bad.push(id + ':' + sd.toFixed(0)); } const wet = roadEdges.filter(e => !e.bridge && e.pts.some(p => sdAt(p.x, p.z) < 6)).map(e => e.a.id + '-' + e.b.id); const rw = [-200, -100, 0, 100, 200].map(u => { const p = APW(u, 0); return sdAt(p.x, p.z).toFixed(0); }); return { bad, wet, rw, town: Object.keys(roadNodes).slice(0, 0) }; },
  audit: () => {
    const r = {};
    r.parkedTree = vehicles.filter(v => v.perm && !v.def.boat && treeNear(v.pos.x, v.pos.z, 2.6).length).length; r.parkedBlocked = vehicles.filter(v => v.perm && !v.def.boat && !boxFree(v.pos.x, v.pos.z, 0.6)).map(v => v.type + '@' + zoneAt(v.pos.x, v.pos.z).name);
    r.boatsOnLand = vehicles.filter(v => v.def.boat && groundAt(v.pos.x, v.pos.z) > -0.55).length;
    r.doorsBlocked = rooms.filter(m => m.out && !boxFree(m.out.x, m.out.z, 0.5, true)).map(m => m.name); r.doorsWet = rooms.filter(m => m.out && sdAt(m.out.x, m.out.z) < 5).map(m => m.name); r.noDoor = rooms.filter(m => !m.out).map(m => m.name);
    r.lionsBlocked = lions.filter(l => { for (let a = 0; a < 8; a++) { const x = l.x + Math.cos(a) * 3.5, z = l.z + Math.sin(a) * 3.5; if (boxFree(x, z, 0.5) && groundAt(x, z) > 0) return false; } return true; }).length;
    r.markersBlocked = markers.filter(m => !boxFree(m.x, m.z, 0.6)).map(m => m.id);
    r.ftBad = FAST.filter(([n, id]) => { if (id === 'DADAN' || id === 'HOME') return false; const nd = roadNodes[id]; return !nd || !nd.edges.length; }).map(f => f[0]);
    r.pickBlocked = pickups.filter(p => Math.abs(p.y - groundAt(p.x, p.z)) < 3 && !p.secret).filter(p => !boxFree(p.x, p.z, 0.4) || sdAt(p.x, p.z) < 2).map(p => p.type);
    r.planesBlocked = planes.filter(p => !boxFree(p.pos.x, p.pos.z, 2)).length;
    r.deliverRoutes = DELIVER.map(d => { const n = roadNodes[d[0]]; return d[1] + ':' + (computeRoute(missionSpots.deliver.x, missionSpots.deliver.z, n.x, n.z) || []).length; });
    r.townsWithShop = [...new Set(rooms.filter(m => m.out).map(m => townAt(m.out.x, m.out.z)))];
    r.townsWithBank = [...new Set(rooms.filter(m => m.type === 'bank' && m.out).map(m => townAt(m.out.x, m.out.z)))];
    let road = 0; for (const e of roadEdges) road += e.len; r.roadKm = +(road / KM).toFixed(1);
    r.flyRingAlt = FLY.map(f => Math.round(f.alt - Math.max(0, groundAt(f.x, f.z))));
    return r;
  },
  wk: () => ({ cur: weather.cur, k: weather.k, near: scene.fog.near, far: scene.fog.far, sun: sun.intensity, rain: rainMesh && rainMesh.material.opacity }),
  meshes: () => { const r = { veh: 0, ped: 0, cop: 0, other: 0 }; const cnt = o => { let n = 0; o.traverse(c => { if (c.isMesh) n++; }); return n; }; for (const v of vehicles) r.veh += cnt(v.group); for (const p of peds) r.ped += cnt(p.m.group); for (const c of cops) r.cop += cnt(c.m.group); let all = 0; scene.traverse(c => { if (c.isMesh || c.isSprite || c.isLine) all++; }); r.all = all; r.nveh = vehicles.length; r.nped = peds.length; return r; },
  story: () => ({ ch: story.ch, active: story.active, step: story.step, dialog: !!story.dialog, dlgI: story.dialog ? story.dialog.i : -1, goal: story.goalText, thugs: cops.filter(c => c.thug).length }), storyGo: () => { const m = storyMarker; if (!m) return false; exitForce(); player.pos.set(m.x, heightAt(m.x, m.z), m.z); return interact(); }, skipTalk: () => { let n = 0; while (story.dialog && n++ < 30) nextLine(); }, setCh: c => { story.ch = c; story.active = false; mission.type = null; placeChapter(); },
  killThugs: () => { for (const c of [...cops]) if (c.thug) killCop(c); }, weather: i => setWeather(i), radio: () => { nextStation(); return radio.st; }, phone: () => { openPhone(); return !!game.menu; }, pick: i => buyItem(i), nade: () => { player.nades = 3; throwNade(); }, heli: () => !!heli, crouch: () => { player.crouch = true; return inCover(); }, roll: () => dodge(), inside: () => player.inside && player.inside.name,
  pause: on => togglePause(on), quality: q => { settings.q = q; applyQuality(); return Q.name; }, swim: () => ({ swim: !!player.swim, y: +player.pos.y.toFixed(2), depth: +waterDepthAt(player.pos.x, player.pos.z).toFixed(2) }), tank: () => { const v = vehicles.find(v => v.def.tank); if (!v) return false; exitForce(); player.pos.set(v.pos.x + 3, v.pos.y, v.pos.z); enterVehicle(v); return true; }, tankFire: () => { if (player.veh) player.veh.cool = 0; tankFire(); }, vig: () => ({ on: vig.on, n: vig.n, perp: !!vig.perp, perpHp: vig.perp && vig.perp.hp }), perpHit: n => { if (vig.perp) vig.perp.hp -= n; }, startVig: () => { const v = vehicles.find(v => v.type === 'police' && v.driver === 'none'); if (!v) return 'nopolice'; exitForce(); player.pos.set(v.pos.x + 2, v.pos.y, v.pos.z); enterVehicle(v); startVigilante(); return vig.on; }, props: () => props.map(p => [p.name, p.own]), buyProp: i => { const p = props[i]; exitForce(); player.pos.set(p.x, heightAt(p.x, p.z), p.z); return interact(); }, day: () => { env.tod = 23.99; }, cows: () => cows.length, islet: () => ({ x: ISLET.x, z: ISLET.z, low: tideLow(), deckY: ISLET.deck && ISLET.deck.y }),
  prof: () => { const r = {}; const T = (n, fn) => { const t = performance.now(); for (let i = 0; i < 20; i++) fn(); r[n] = +((performance.now() - t) / 20).toFixed(2); }; const d = 1 / 30;
    T('world', () => updateWorld(d)); T('combat', () => updateCombat(d)); T('ambient', () => updateAmbient(d)); T('cows', () => updateCows(d)); T('wanted', () => updateWanted(d, nearRoad)); T('missions', () => updateMissions(d)); T('hud', () => updateHud(d)); T('camera', () => updateCamera(d)); T('env', () => { updateEnv(d, player.pos); applyWeather(d); }); T('foot', () => updatePlayerFoot(d, { x: 0, y: 0 })); T('render', () => renderer.render(scene, camera)); return r; },
  tunnels: () => tunnels.map(t => [t.name, t.mouths.length, !!t.start, t.exits.length]), tun: i => { const t = tunnels[i], m = t.mouths[0]; exitForce(); player.tunnel = null; t.left = -9; player.pos.set(m.trig.x, heightAt(m.trig.x, m.trig.z), m.trig.z); updateTunnels(0); return t.name; }, ...lifeDebug(), inTunnel: () => player.tunnel && player.tunnel.name, camdbg: () => { const c = camera.position, p = player.pos, r = [c.x, c.y, c.z, p.x, p.y, p.z, boxFree(c.x, c.z, 0.2)]; const R = []; for (const [dx, dz] of [[2, 0], [-2, 0], [0, 2], [0, -2], [1.4, 0], [-1.4, 0], [0, 1.4], [0, -1.4]]) R.push(boxFree(p.x + dx, p.z + dz, 0.1) ? 1 : 0); return [r.map(v => +(+v).toFixed(2)), R, player.yaw.toFixed(2), cam.yaw.toFixed(2)]; }, secrets: () => secretsFound.size, walkTo: (dx, dz) => { player.pos.x += dx; player.pos.z += dz; },
  dbg: () => ({ spots: missionSpots, lion0: lions[0] && [lions[0].x, lions[0].z], nearRoad: nearRoad.length, nearTown: nearTown.length, target, route: routePts ? routePts.length : 0, timer: mission.timer, stage: mission.stage, broken: mission.broken, evade: wanted.evade, vpos: player.veh ? [player.veh.pos.x, player.veh.pos.z, player.veh.yaw] : null })
};
boot().catch(e => { console.error(e); $('loadtext').textContent = '載入失敗：' + e.message; });
