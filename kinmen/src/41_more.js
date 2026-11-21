/* =====================================================================
   v0.4：游泳、暫停與畫質、音效、戰車、警察任務、房產、黃牛、建功嶼、路人反應
   ===================================================================== */

/* ---------- 畫質設定 ---------- */
const QUALITY = { low: { name: '低', pr: 0.75, shadow: 0, traffic: 12, peds: 14, far: 0.7 }, mid: { name: '中', pr: 1, shadow: 1024, traffic: 18, peds: 22, far: 0.85 }, high: { name: '高', pr: 1.75, shadow: 2048, traffic: 26, peds: 30, far: 1 } };
const settings = { q: ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'mid' : 'high', vol: 0.8, sens: 1 };
try { Object.assign(settings, JSON.parse(localStorage.getItem('kinmen_settings') || '{}')); } catch (e) { }
let Q = QUALITY[settings.q] || QUALITY.high;
function applyQuality() {
  Q = QUALITY[settings.q]; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pr)); onResize(); ARES.k = 1; ARES.bad = ARES.good = 0;
  sun.castShadow = Q.shadow > 0; if (Q.shadow && sun.shadow.mapSize.x !== Q.shadow) { sun.shadow.mapSize.set(Q.shadow, Q.shadow); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  if (MASTER) MASTER.gain.value = settings.vol; if (typeof setupPost === 'function') setupPost(); try { localStorage.setItem('kinmen_settings', JSON.stringify(settings)); } catch (e) { }
}
/* ---------- 暫停選單 ---------- */
function togglePause(on = !game.paused) {
  if (!game.started) return; game.paused = on; $('pause').classList.toggle('show', on); if (on) { if (document.exitPointerLock && locked) document.exitPointerLock(); renderPause(); if (AC) AC.suspend(); } else if (AC) AC.resume();
}
function renderPause() {
  const p = $('pauseBody'), vols = [[0, '關'], [0.4, '低'], [0.8, '中'], [1.2, '高']];
  p.innerHTML = `<button data-a="resume" class="big">繼續遊戲</button>
  <div class="row"><span>畫質</span>${Object.entries(QUALITY).map(([k, q]) => `<button data-q="${k}" class="${settings.q === k ? 'on' : ''}">${q.name}</button>`).join('')}</div>
  <div class="row"><span>音量</span>${vols.map(([v, n]) => `<button data-v="${v}" class="${Math.abs(settings.vol - v) < 0.01 ? 'on' : ''}">${n}</button>`).join('')}</div>
  <div class="row"><span>視角靈敏度</span>${[0.6, 1, 1.5].map((v, i) => `<button data-s="${v}" class="${settings.sens === v ? 'on' : ''}">${['慢', '標準', '快'][i]}</button>`).join('')}</div>
  <div class="stats">劇情 ${Math.min(story.ch, CHAPTERS.length)}/${CHAPTERS.length}　風獅爺 ${mission.lions}/${lions.length}　房產 ${props.filter(p => p.own).length}/${props.length}　金錢 $${player.money.toLocaleString()}</div>
  <button data-a="help">操作說明</button><button data-a="save">存檔</button><button data-a="reset" class="warn">清除存檔重新開始</button>`;
  p.querySelectorAll('button').forEach(b => b.onclick = () => { const d = b.dataset; if (d.a === 'resume') togglePause(false); else if (d.a === 'help') { $('help').classList.toggle('show'); } else if (d.a === 'save') { if (wanted.stars) toast('被通緝時不能存檔'); else { saveGame(); saveStory(); toast('已存檔'); } } else if (d.a === 'reset') { try { for (const k of ['kinmen_save2', 'kinmen_story', 'kinmen_props']) localStorage.removeItem(k); } catch (e) { } location.reload(); }
    else if (d.q) { settings.q = d.q; applyQuality(); renderPause(); } else if (d.v) { settings.vol = +d.v; applyQuality(); renderPause(); } else if (d.s) { settings.sens = +d.s; applyQuality(); renderPause(); } });
}

/* ---------- 游泳 ---------- */
function waterDepthAt(x, z) { if (deckY(x, z) !== null || bridgeY(x, z) !== null) return 0; return -groundAt(x, z); }
function updateSwim(dt, ax) {
  const sprint = keys.ShiftLeft || keys.ShiftRight || touch.run, moving = ax.x || ax.y, sp = moving ? (sprint ? 3.6 : 2.3) : 0;
  if (moving) { const f = fwd(cam.yaw); let dx = f.x * ax.y - f.z * ax.x, dz = f.z * ax.y + f.x * ax.x; const l = Math.hypot(dx, dz); dx /= l; dz /= l; player.yaw += angDiff(player.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 6); player.pos.x = player.tunnel ? player.pos.x + dx * sp * dt : clamp(player.pos.x + dx * sp * dt, WX0, -TX0 - 40); player.pos.z = clamp(player.pos.z + dz * sp * dt, TZ0 + 40, -TZ0 - 40); }
  resolveCircle(player.pos, 0.45); player.ph += dt * (moving ? (sprint ? 5 : 3.2) : 1.2);
  const M = player.model, s = player.ph; player.pos.y = -0.25 + Math.sin(game.time * 2) * 0.05;
  M.group.position.set(player.pos.x, player.pos.y, player.pos.z); M.group.rotation.set(moving ? 1.3 : 0.25, player.yaw, 0, 'YXZ');
  M.armL.rotation.x = moving ? -s : -1.2 + Math.sin(s) * 0.5; M.armR.rotation.x = moving ? -s - Math.PI : -1.2 - Math.sin(s) * 0.5; M.armL.lo.rotation.x = M.armR.lo.rotation.x = -0.2;
  M.legL.rotation.x = Math.sin(s * 3) * 0.35; M.legR.rotation.x = -Math.sin(s * 3) * 0.35; M.legL.lo.rotation.x = M.legR.lo.rotation.x = 0.15; M.body.rotation.x = 0; M.body.position.y = 0;
  if (moving && Math.random() < dt * 6) puff(player.pos.x, 0.1, player.pos.z, 0.4, 1.4, 0.5, smokeTex === null ? glowTex : foamPuff, false, 0);
  player.spd = sp; if (!player.swim) { player.swim = true; sfx('splash', 0.35); if (inv.cur) { player.swimGun = inv.cur; inv.cur = 0; refreshWeapon(); } player.crouch = false; unCrouch(M); }
}
const foamPuff = canvasTex(32, 32, g => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
function leaveSwim() { if (!player.swim) return; player.swim = false; player.model.group.rotation.set(0, player.yaw, 0); if (player.swimGun) { inv.cur = player.swimGun; player.swimGun = 0; refreshWeapon(); } }

/* ---------- 音效：警笛、腳步、雨聲 ---------- */
const amb = { siren: null, rain: null, lastStep: 0 };
function initAmbient() {
  if (!AC || amb.siren) return;
  const o = AC.createOscillator(), o2 = AC.createOscillator(), lfo = AC.createOscillator(), lg = AC.createGain(), g = AC.createGain(); o.type = 'square'; o2.type = 'sawtooth'; o.frequency.value = 900; o2.frequency.value = 905; lfo.frequency.value = 0.45; lg.gain.value = 330; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2200; o.connect(f); o2.connect(f); f.connect(g); g.gain.value = 0; g.connect(MASTER); o.start(); o2.start(); lfo.start(); amb.siren = g;
  const b = AC.createBuffer(1, 88200, 44100), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = AC.createBufferSource(); s.buffer = b; s.loop = true; const rf = AC.createBiquadFilter(); rf.type = 'highpass'; rf.frequency.value = 1400; const rg = AC.createGain(); rg.gain.value = 0; s.connect(rf); rf.connect(rg); rg.connect(MASTER); s.start(); amb.rain = rg;
}
function updateAmbient(dt) {
  if (!AC) return; initAmbient(); let near = 1e9; const wp = wpos(); for (const v of vehicles) if (v.driver === 'police' && !v.thug) near = Math.min(near, Math.hypot(v.pos.x - wp.x, v.pos.z - wp.z));
  amb.siren.gain.value += ((near < 260 ? (1 - near / 260) * 0.05 : 0) - amb.siren.gain.value) * Math.min(1, dt * 4);
  amb.rain.gain.value += (weather.k.rain * (player.inside ? 0.025 : 0.07) - amb.rain.gain.value) * Math.min(1, dt * 2);
  if (!player.veh && !player.plane && !player.swim && player.spd > 0.5 && !player.air) { const st = Math.floor(player.ph / Math.PI); if (st !== amb.lastStep) { amb.lastStep = st; footstep(player.spd > 6); } }
}
function footstep(run) { const t = AC.currentTime, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); if (!noiseBuf) radioNoise(t, 0.01, 0); s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = weather.k.rain > 0.5 ? 1500 : 650 + Math.random() * 200; g.gain.setValueAtTime(run ? 0.12 : 0.07, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07); s.connect(f); f.connect(g); g.connect(MASTER); s.start(t, Math.random()); s.stop(t + 0.08); }

/* ---------- M41 戰車 ---------- */
VDEF.tank = { len: 6.4, wid: 3.2, max: 13, acc: 4.5, color: '#55603f', offroad: true, tank: true, name: 'M41 戰車' };
function buildTankModel(v) {
  const g = v.group, T = (x, y, z) => new THREE.Matrix4().makeTranslation(x, y, z), c = '#55603f', c2 = '#3d4630';
  g.add(new THREE.Mesh(mergeGeos([[new THREE.BoxGeometry(2.9, 0.9, 5.8), c, T(0, 1.15, 0)], [new THREE.BoxGeometry(3.3, 0.95, 6.3), '#2b2b2b', T(0, 0.55, 0)], [new THREE.BoxGeometry(3.32, 0.12, 6.0), c2, T(0, 1.05, 0)], [new THREE.BoxGeometry(2.4, 0.3, 1.4), c2, T(0, 1.7, -2.2)]]), mVC));
  for (const sd of [-1.45, 1.45]) for (let k = -2; k <= 2; k++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.4, 12).rotateZ(Math.PI / 2), mat('#3a3a3a', 0.8)); w.position.set(sd, 0.45, k * 1.2); g.add(w); v.wheels.push({ me: w, r: 0.42 }); }
  const tur = new THREE.Group(); tur.position.set(0, 1.6, 0.3); g.add(tur); tur.add(new THREE.Mesh(mergeGeos([[new THREE.CylinderGeometry(1.15, 1.35, 0.85, 14), c, T(0, 0.42, 0)], [new THREE.BoxGeometry(0.5, 0.35, 0.5), c2, T(0.5, 1.0, -0.2)], [new THREE.CylinderGeometry(0.12, 0.14, 3.6, 10).rotateX(Math.PI / 2), c2, T(0, 0.48, 2.7)], [new THREE.CylinderGeometry(0.2, 0.2, 0.5, 10).rotateX(Math.PI / 2), c2, T(0, 0.48, 4.4)]]), mVC));
  v.turret = tur; g.traverse(o => { if (o.isMesh) o.castShadow = true; });
}
function driveTank(v, ctl, dt) {
  const T = v.def; let f = fwd(v.yaw), vf = v.vx * f.x + v.vz * f.z; if (ctl.thr) vf += ctl.thr * T.acc * dt * Math.max(0, 1 - Math.abs(vf) / T.max); else vf -= Math.sign(vf) * Math.min(Math.abs(vf), 6 * dt);
  v.yaw += ctl.steer * 0.85 * dt * (vf < -0.5 ? -1 : 1); f = fwd(v.yaw); v.vx = f.x * vf; v.vz = f.z * vf; v.speed = vf; v.steer = 0; const px = v.pos.x, pz = v.pos.z; v.pos.x += v.vx * dt; v.pos.z += v.vz * dt; deckGuard(px, pz, v.pos, v); v.onRoad = true;
  for (const w of v.wheels) w.me.rotation.x += (vf + ctl.steer * 2) * dt / 0.42;
}
function tankFire() {
  const v = player.veh; if (!v || !v.def.tank || (v.cool || 0) > 0) return; v.cool = 1.6; camera.getWorldDirection(_d); _o.copy(camera.position);
  const t0 = Math.max(0, (v.pos.x - _o.x) * _d.x + (v.pos.y + 2 - _o.y) * _d.y + (v.pos.z - _o.z) * _d.z) + 4, r = castRay(_o, _d, 260, t0), e = { x: _o.x + _d.x * r.t, y: _o.y + _d.y * r.t, z: _o.z + _d.z * r.t };
  const mz = { x: v.pos.x + Math.sin(cam.yaw) * 5.2, y: v.pos.y + 2.1, z: v.pos.z + Math.cos(cam.yaw) * 5.2 }; addTracer(mz, e); puff(mz.x, mz.y, mz.z, 1.5, 4, 0.25, glowTex, true); puff(mz.x, mz.y, mz.z, 1.5, 5, 1.2, smokeTex, false, 1);
  if (r.kind === 'veh' && r.obj !== v) { r.obj.hp = 0; r.obj.burn = 0.05; } explode(e.x, e.y, e.z, null); if (r.kind === 'heli') hitHeli(999); crimeMin(2); cam.pitch = Math.max(0.02, cam.pitch - 0.03);
}

/* ---------- 警察任務 ---------- */
const vig = { on: false, perp: null, t: 0, n: 0 };
function startVigilante() { if (vig.on || mission.type) return; if (!player.veh || player.veh.type !== 'police') { toast('要坐在警車上'); return; } vig.on = true; vig.n = 0; mission.type = 'vig'; clearWanted(); nextPerp(); }
function nextPerp() {
  const wp = wpos(), c = roadSamples.filter(s => { const p = s.e.pts[s.i], d = Math.hypot(p.x - wp.x, p.z - wp.z); return d > 160 && d < 420 && !s.e.bridge; }); if (!c.length) return endVig('附近沒有嫌犯');
  const v = spawnTraffic(pick(c)); if (!v) { setTimeout(nextPerp, 500); return; } v.perp = true; v.thug = true; v.ai.cruise = 25; v.hp = 140; vig.perp = v; vig.t = 150; vig.lastHp = v.hp;
  subtitle(`<b>無線電</b>：「嫌犯開著 ${v.def.name} 逃逸中，請攔下他！」（撞擊或射擊讓車停下）`, 6); sfx('alarm', 0.15);
}
function endVig(msg) { vig.on = false; if (vig.perp && vehicles.includes(vig.perp)) { vig.perp.perp = false; vig.perp.thug = false; } vig.perp = null; if (mission.type === 'vig') mission.type = null; clearTarget(); $('timer').textContent = ''; if (msg) subtitle(msg, 4); }
function updateVig(dt) {
  if (!vig.on) return; const v = vig.perp; if (!player.veh || player.veh.type !== 'police') return endVig('離開警車，警察任務結束');
  vig.t -= dt; $('timer').textContent = `🚔 警察任務　第 ${vig.n + 1} 名　⏱ ${Math.ceil(vig.t)} 秒`;
  if (vig.wait) return;
  if (!v || !vehicles.includes(v)) { vig.n++; addMoney(1200); banner('嫌犯擊斃', '+$1,200'); return nextPerp(); }
  if (Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z) > 600 || vig.t <= 0) return endVig('嫌犯跑掉了，警察任務結束');
  if (v.ai && v.hp < vig.lastHp) { v.ai.cruise = Math.min(30, v.ai.cruise + 2); vig.lastHp = v.hp; }
  if (v.hp <= 45 && v.ai) { const pay = 2000 + vig.n * 500; v.ai.cruise = 0; v.ai.stun = 999; v.perp = false; v.thug = false; vig.n++; addMoney(pay); banner('嫌犯投降', `第 ${vig.n} 名　+$${pay.toLocaleString()}`); vig.perp = null; vig.wait = true; return setTimeout(() => { vig.wait = false; if (vig.on) nextPerp(); }, 2500); }
  if (game.frame % 30 === 0) { target = { x: v.pos.x, z: v.pos.z, label: '嫌犯' }; targetMesh.visible = false; routeT = 0; }
}

/* ---------- 房產 ---------- */
const PROPS = [['水頭古厝民宿', 24.4094, 118.3012, 25000, 1500], ['模範街貢糖店', 24.4314, 118.3188, 40000, 2600], ['金寧咖啡廳', 24.4492, 118.3330, 30000, 1800], ['山外機車行', 24.4406, 118.4140, 30000, 1900], ['沙美燒餅店', 24.4899, 118.4120, 20000, 1200], ['烈嶼芋頭餐廳', 24.4465, 118.2522, 28000, 1700], ['料羅海景民宿', 24.4275, 118.4250, 45000, 3000], ['珠山古厝民宿', 24.4210, 118.3135, 32000, 2000], ['山后古厝民宿', 24.5025, 118.4380, 36000, 2300]];
const props = []; let propSaved = [];
try { propSaved = JSON.parse(localStorage.getItem('kinmen_props') || '[]'); } catch (e) { }
function oldHouseProp(la, lo, name) {
  const s = spot(la, lo, 7, 26); if (!s) return null; const f = fwd(s.rot); minnanHouse(s.x, s.z, s.rot, 12, 9); const y = groundAt(s.x, s.z);
  addSign(name, 0.5, s.x + f.x * 4.75, y + 2.9, s.z + f.z * 4.75, s.rot, { color: '#f4d27a', bg: '#7c2f25', size: 56, pad: 8 });
  for (const sd of [-1, 1]) { const lx = s.x + f.x * 4.9 + Math.cos(s.rot) * sd * 1.9, lz = s.z + f.z * 4.9 - Math.sin(s.rot) * sd * 1.9; const l = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshStandardMaterial({ color: 0xd4140b, emissive: 0xff2a10, emissiveIntensity: 0.6 })); l.scale.y = 1.25; l.position.set(lx, y + 2.6, lz); scene.add(l); }
  return { x: s.x + f.x * 6.5, z: s.z + f.z * 6.5 };
}
function buildProps() {
  for (const [name, la, lo, price, inc] of PROPS) {
    const o = name.includes('古厝') ? oldHouseProp(la, lo, name) : office(la, lo, 10, 9, 2, name, '#efe6d2', '#6b4a34'); if (!o) continue; const p = { name, price, inc, x: o.x, z: o.z, own: propSaved.includes(name) };
    p.ic = iconSprite('售', '#27ae60'); p.ic.scale.set(2.2, 2.2, 1); p.ic.position.set(o.x, heightAt(o.x, o.z) + 4.2, o.z); scene.add(p.ic); props.push(p); setPropIcon(p);
    addAction({ x: o.x, z: o.z, r: 3, inside: null, label: () => p.own ? `${p.name}（你的房產，每天 +$${p.inc.toLocaleString()}）` : `買下 ${p.name}（$${p.price.toLocaleString()}，每天 +$${p.inc.toLocaleString()}）`, fn: () => { if (p.own) return; if (player.money < p.price) { toast('錢不夠'); sfx('fail', 0.2); return; } addMoney(-p.price); p.own = true; setPropIcon(p); saveProps(); banner('購買房產', p.name + '　每天收入 $' + p.inc.toLocaleString()); } });
  }
}
function setPropIcon(p) { const t = iconSprite(p.own ? '產' : '售', p.own ? '#d4a017' : '#27ae60'); p.ic.material.map = t.material.map; p.ic.material.needsUpdate = true; }
function saveProps() { try { localStorage.setItem('kinmen_props', JSON.stringify(props.filter(p => p.own).map(p => p.name))); } catch (e) { } }
let lastTod = null;
function updateDays() { if (lastTod !== null && env.tod < lastTod - 1) { const inc = props.filter(p => p.own).reduce((a, p) => a + p.inc, 0); if (inc) { addMoney(inc); toast(`🏠 房產收入 +$${inc.toLocaleString()}`); } } lastTod = env.tod; }
function phoneProps() { phoneMenu('📱 房產', props.map(p => ({ n: (p.own ? '🏠 ' : '') + p.name, d: p.own ? `每天 +$${p.inc.toLocaleString()}` : `售價 $${p.price.toLocaleString()}（點選導航）`, fn: () => { if (!mission.type) { setTarget(p.x, p.z, p.name); waypoint = true; closeMenu(); toast('已設定導航'); } } }))); }

/* ---------- 金門黃牛 ---------- */
const cows = []; let cowGeo = null;
function buildCows() {
  const T = (x, y, z, rx = 0) => new THREE.Matrix4().compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), new V3(1, 1, 1)), c = '#b8864b', c2 = '#8c6235';
  cowGeo = { body: mergeGeos([[new THREE.CapsuleGeometry(0.42, 1.0, 4, 10).rotateX(Math.PI / 2), c, T(0, 1.05, 0)], [new THREE.BoxGeometry(0.7, 0.35, 0.5), c2, T(0, 1.35, 0.15)], ...[[-0.25, 0.55], [0.25, 0.55], [-0.25, -0.55], [0.25, -0.55]].map(([x, z]) => [new THREE.CylinderGeometry(0.08, 0.07, 0.75, 6), c2, T(x, 0.4, z)]), [new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4), c2, T(0, 1.0, -0.8, 0.4)]]),
    head: mergeGeos([[new THREE.BoxGeometry(0.34, 0.36, 0.55), c, T(0, 0, 0.2)], [new THREE.BoxGeometry(0.28, 0.2, 0.15), '#3a2a22', T(0, -0.08, 0.5)], [new THREE.ConeGeometry(0.04, 0.22, 5).rotateZ(1.2), '#e8dcc0', T(0.22, 0.2, 0.05)], [new THREE.ConeGeometry(0.04, 0.22, 5).rotateZ(-1.2), '#e8dcc0', T(-0.22, 0.2, 0.05)], [new THREE.BoxGeometry(0.15, 0.08, 0.04), c2, T(0.24, 0.08, 0)], [new THREE.BoxGeometry(0.15, 0.08, 0.04), c2, T(-0.24, 0.08, 0)]]) };
  let herds = 0; for (let tries = 0; tries < 800 && herds < 14; tries++) { const x = rr(TX0 + 200, -TX0 - 200), z = rr(TZ0 + 200, -TZ0 - 250); if (sdAt(x, z) < 80 || groundAt(x, z) < 1.5 || groundAt(x, z) > 18 || !roadClear(x, z, 25) || !boxFree(x, z, 20)) continue; herds++;
    for (let k = 0; k < 3 + (rand() * 3 | 0); k++) { const cx = x + rr(-14, 14), cz = z + rr(-14, 14); if (!boxFree(cx, cz, 1.5) || !roadClear(cx, cz, 6)) continue; const g = new THREE.Group(), b = new THREE.Mesh(cowGeo.body, mVC), h = new THREE.Mesh(cowGeo.head, mVC); h.position.set(0, 1.3, 1.05); g.add(b, h); b.castShadow = true; g.position.set(cx, groundAt(cx, cz), cz); g.rotation.y = rr(0, 6.28); scene.add(g); cows.push({ g, h, hx: x, hz: z, t: rr(0, 6), st: 'graze', yaw: g.rotation.y, down: 0 }); } }
}
function updateCows(dt) {
  const wp = wpos();
  for (const c of cows) { const p = c.g.position, d = Math.abs(p.x - wp.x) + Math.abs(p.z - wp.z); c.g.visible = d < 380; if (d > 260) continue;
    if (c.down > 0) { c.down -= dt; c.g.rotation.z = Math.min(1.5, c.g.rotation.z + dt * 6); if (c.down <= 0) c.g.rotation.z = 0; continue; }
    const v = player.veh; if (v && Math.hypot(v.pos.x - p.x, v.pos.z - p.z) < 2.4 && Math.abs(v.speed) > 4) { c.down = 6; v.vx *= 0.5; v.vz *= 0.5; sfx('thud', 0.4); if (Math.random() < 0.5) toast('撞到牛了！'); continue; }
    c.t -= dt; if (c.t <= 0) { c.st = c.st === 'walk' ? 'graze' : (Math.random() < 0.45 ? 'walk' : 'graze'); c.t = rr(3, 9); if (c.st === 'walk') c.yaw = Math.atan2(c.hx - p.x + rr(-12, 12), c.hz - p.z + rr(-12, 12)); if (Math.random() < 0.08 && d < 60) sfx('moo', 0.18); }
    const scared = d < 9 && !player.veh; if (scared) { c.st = 'walk'; c.yaw = Math.atan2(p.x - wp.x, p.z - wp.z); c.t = 2; }
    c.g.rotation.y += angDiff(c.g.rotation.y, c.yaw) * Math.min(1, dt * 2); c.h.rotation.x = c.st === 'graze' ? 0.9 : 0;
    if (c.st === 'walk') { const sp = scared ? 2.4 : 0.8, nx = p.x + Math.sin(c.g.rotation.y) * sp * dt, nz = p.z + Math.cos(c.g.rotation.y) * sp * dt; if (groundAt(nx, nz) > 1 && boxFree(nx, nz, 1) && roadClear(nx, nz, 3)) { p.x = nx; p.z = nz; } else c.yaw += 2; p.y = groundAt(p.x, p.z); } }
}

/* ---------- 建功嶼（退潮時石板路露出來）---------- */
const ISLET = { ...GW(24.42744, 118.30008), r: 26 };
function buildIslet() {
  // 從小島往金城海岸找最近的陸地，鋪一條石板路
  let best = null, bd = 1e12; for (let a = 0; a < 64; a++) { const ang = a / 64 * 6.283; for (let d = ISLET.r + 10; d < 260; d += 6) { const x = ISLET.x + Math.cos(ang) * d, z = ISLET.z + Math.sin(ang) * d; if (sdAt(x, z) > 8) { if (d < bd) { bd = d; best = { x, z, ang }; } break; } } }
  if (!best) return; const L = bd - ISLET.r + 6, yaw = Math.atan2(Math.cos(best.ang), Math.sin(best.ang)), cx = ISLET.x + Math.cos(best.ang) * (ISLET.r - 3 + L / 2), cz = ISLET.z + Math.sin(best.ang) * (ISLET.r - 3 + L / 2);
  const path = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, L), new THREE.MeshStandardMaterial({ color: 0x9c968a, roughness: 0.95 })); path.position.set(cx, -0.1, cz); path.rotation.y = yaw; path.receiveShadow = true; path.userData.noMerge = true; scene.add(path); addDeck(cx, cz, 1.6, L / 2, yaw, 0.15); ISLET.path = path; ISLET.deck = decks[decks.length - 1]; ISLET.deck.tide = true;
  const isl = new THREE.Mesh(new THREE.CylinderGeometry(ISLET.r * 0.85, ISLET.r, 5, 20), new THREE.MeshStandardMaterial({ color: 0x8f8a7d, roughness: 1 })); isl.position.set(ISLET.x, -1.8, ISLET.z); isl.receiveShadow = true; scene.add(isl);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(ISLET.r * 0.7, ISLET.r * 0.85, 1.2, 20), new THREE.MeshStandardMaterial({ color: 0x6f8a4f, roughness: 1 })); top.position.set(ISLET.x, 1.2, ISLET.z); scene.add(top); addDeck(ISLET.x, ISLET.z, ISLET.r * 0.62, ISLET.r * 0.62, 0, 1.8);
  // 鄭成功像（公共紀念雕像）＋碉堡
  const st = new THREE.Mesh(mergeGeos([[new THREE.BoxGeometry(2.6, 2.4, 2.6), '#cfc8b8', new THREE.Matrix4().makeTranslation(0, 1.2, 0)], [new THREE.CylinderGeometry(0.55, 0.8, 2.6, 10), '#e8e2d4', new THREE.Matrix4().makeTranslation(0, 3.7, 0)], [new THREE.SphereGeometry(0.35, 10, 8), '#e8e2d4', new THREE.Matrix4().makeTranslation(0, 5.25, 0)], [new THREE.BoxGeometry(0.2, 2.2, 0.2), '#e8e2d4', new THREE.Matrix4().makeTranslation(0.65, 3.7, 0.3)]]), mVC); st.position.set(ISLET.x, 1.8, ISLET.z); st.rotation.y = best.ang + Math.PI / 2; st.castShadow = true; scene.add(st); addBox(ISLET.x, ISLET.z, 1.4, 1.4, 0);
  const bx = ISLET.x - Math.cos(best.ang) * 12, bz = ISLET.z - Math.sin(best.ang) * 12; const bk = new THREE.Mesh(new THREE.BoxGeometry(8, 2.6, 5), mat('#7f8273')); bk.position.set(bx, 3.1, bz); bk.castShadow = true; scene.add(bk); addBox(bx, bz, 4, 2.5, 0);
  stele(best.x + Math.cos(best.ang) * 4 + 4, best.z + Math.sin(best.ang) * 4, yaw, '建功嶼', 3.4); PLACES.push({ name: '建功嶼', x: ISLET.x, z: ISLET.z, r: 60 });
}
function tideLow() { const h = env.tod; return (h >= 0 && h < 6) || (h >= 12 && h < 18); }
function updateTide() { if (!ISLET.path) return; const low = tideLow(), y = low ? -0.1 : -0.75; ISLET.path.position.y += (y - ISLET.path.position.y) * 0.05; ISLET.deck.y = ISLET.path.position.y + 0.25; }

/* ---------- 路人反應：報警、還手 ---------- */
function pedReact(p, kind) {
  if (p.dead || p.state === 'wait' || p.state === 'call' || p.state === 'fight') return;
  if (kind === 'hit' && Math.random() < 0.35) { p.state = 'fight'; p.t = 0; return; }
  if (Math.random() < 0.3 && !wanted.stars) { p.state = 'call'; p.t = 0; return; }
  p.state = 'flee'; p.t = 0;
}
function updatePedExtra(p, dt) {
  if (p.state === 'thief') { updateThief(p, dt); return true; }
  if (p.state === 'call') { p.t += dt; p.m.armR.rotation.x = -2.3; p.m.armR.lo.rotation.x = -2.2; poseWalk(p.m, 0, 0); p.m.armR.rotation.x = -2.3; p.m.armR.lo.rotation.x = -2.2; p.m.group.position.copy(p.pos); if (p.t > 3) { if (!wanted.stars) { crimeMin(1); toast('有人報警了！'); } p.state = 'flee'; p.t = 0; } return true; }
  if (p.state === 'fight') { p.t += dt; const dx = player.pos.x - p.pos.x, dz = player.pos.z - p.pos.z, d = Math.hypot(dx, dz) || 1; p.yaw = Math.atan2(dx, dz); if (player.veh || p.t > 15 || d > 25) { p.state = 'flee'; p.t = 0; return false; }
    if (d > 1.3) { p.pos.x += dx / d * 4.5 * dt; p.pos.z += dz / d * 4.5 * dt; resolveCircle(p.pos, 0.35); p.pos.y = heightAt(p.pos.x, p.pos.z); p.ph += dt * 10; poseWalk(p.m, p.ph, 1.1); }
    else { p.hitCd = (p.hitCd || 0) - dt; if (p.hitCd <= 0) { p.hitCd = 1.1; p.m.armR.rotation.x = -1.6; damage(5); sfx('thud', 0.2); } else if (p.hitCd < 0.8) p.m.armR.rotation.x = -0.3; }
    p.m.group.position.copy(p.pos); p.m.group.rotation.set(0, p.yaw, 0); return true; }
  return false;
}
