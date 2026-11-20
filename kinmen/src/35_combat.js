/* =====================================================================
   武器 / 射擊 / 爆炸 / 掉落物 / 下車的警察與軍人
   ===================================================================== */
const WEAPONS = [
  { id: 'fist', name: '拳頭' },
  { id: 'pistol', name: '手槍', dmg: 26, rate: 0.26, spread: 0.012, range: 140, pellets: 1, auto: false, price: 800, ammo: 48, len: 0.3 },
  { id: 'smg', name: '衝鋒槍', dmg: 15, rate: 0.085, spread: 0.032, range: 110, pellets: 1, auto: true, price: 4500, ammo: 150, len: 0.5 },
  { id: 'shotgun', name: '霰彈槍', dmg: 13, rate: 0.85, spread: 0.075, range: 46, pellets: 8, auto: false, price: 3500, ammo: 32, len: 0.8 },
  { id: 'rifle', name: '步槍', dmg: 34, rate: 0.11, spread: 0.013, range: 230, pellets: 1, auto: true, price: 9000, ammo: 180, len: 0.9 }];
const inv = { cur: 0, has: [true, false, false, false, false], ammo: [0, 0, 0, 0, 0] };
const input = { fire: false, aim: false, fireEdge: false };
const cops = [], pickups = [], wrecks = [], fx = [];
let rob = null, gunMesh = null, noAmmoT = 0;
const _d = new V3(), _o = new V3();

function refreshWeapon() {
  const w = WEAPONS[inv.cur]; $('weapon').textContent = (inv.cur ? `${w.name}　${inv.ammo[inv.cur]}` : '') + (player.nades > 0 ? `　💣${player.nades}` : ''); $('cross').classList.toggle('show', inv.cur > 0);
  if (gunMesh) { gunMesh.parent.remove(gunMesh); gunMesh = null; }
  if (inv.cur && player.model) { gunMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, w.len).translate(0, 0, w.len / 2), mTrim); gunMesh.rotation.x = Math.PI / 2; gunMesh.position.set(0, -0.27, 0.03); if (!(player.model.rig && rigGun(player.model, gunMesh))) player.model.armR.lo.add(gunMesh); }
}
function giveWeapon(i, ammo) { inv.has[i] = true; inv.ammo[i] += ammo; inv.cur = i; refreshWeapon(); }
function switchWeapon(dir) { let i = inv.cur; for (let k = 0; k < 5; k++) { i = (i + dir + 5) % 5; if (inv.has[i]) break; } inv.cur = i; refreshWeapon(); }
function selectWeapon(i) { if (inv.has[i]) { inv.cur = i; refreshWeapon(); } else toast('還沒有' + WEAPONS[i].name + '（到軍品店買）'); }
function crimeMin(n) { if (wanted.stars < n) { wanted.stars = n; wanted.evade = 0; drawStars(); } }

/* ---------- 特效 ---------- */
const tracers = []; { for (let i = 0; i < 24; i++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.9 })); l.visible = false; l.frustumCulled = false; scene.add(l); tracers.push({ l, t: 0 }); } }
let tracerI = 0;
function addTracer(a, b) { const t = tracers[tracerI++ % tracers.length], p = t.l.geometry.attributes.position; p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; t.l.visible = true; t.t = 0.06; }
const glowTex = canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,200,90,0.9)'); gr.addColorStop(1, 'rgba(255,80,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
const smokeTex = canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(40,40,40,0.9)'); gr.addColorStop(1, 'rgba(40,40,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
const flashLight = new THREE.PointLight(0xffb060, 0, 60, 1.6); scene.add(flashLight);
function puff(x, y, z, s0, s1, life, tex, add, rise = 0) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false })); sp.position.set(x, y, z); sp.scale.setScalar(s0); scene.add(sp); fx.push({ sp, s0, s1, life, t: 0, rise }); }
function explode(x, y, z, src) {
  puff(x, y + 1.5, z, 3, 20, 0.55, glowTex, true); puff(x, y + 2, z, 5, 17, 2.6, smokeTex, false, 3.5); for (let i = 0; i < 4; i++) puff(x + rr(-3, 3), y + rr(0.5, 3), z + rr(-3, 3), 2, 9, rr(0.3, 0.6), glowTex, true);
  flashLight.position.set(x, y + 3, z); flashLight.intensity = 6000; sfx('boom', 0.8);
  const R = 11, pp = player.veh ? player.veh.pos : player.pos, dp = Math.hypot(pp.x - x, pp.z - z);
  for (const p of peds) if (!p.dead && Math.hypot(p.pos.x - x, p.pos.z - z) < R) killPed(p, p.pos.x - x, p.pos.z - z);
  for (const c of [...cops]) if (Math.hypot(c.pos.x - x, c.pos.z - z) < R) killCop(c);
  for (const v of vehicles) if (v !== src && !v.burn && Math.hypot(v.pos.x - x, v.pos.z - z) < 9) { v.hp -= 80; if (v.hp <= 0) v.burn = rr(0.6, 1.6); }
  if (src) { if (player.veh === src) { exitForce(); damage(85); } const m = new THREE.Mesh(GEO.box, mat('#1c1b1a', 1)); m.position.set(src.pos.x, src.pos.y, src.pos.z); m.rotation.y = src.yaw; m.scale.set(src.def.wid, 1.0, src.def.len); m.castShadow = true; scene.add(m); wrecks.push({ m, t: 60 }); if (src.fire) scene.remove(src.fire); removeVehicle(src); }
  else if (dp < R) damage(90 * (1 - dp / R));
}

/* ---------- 掉落物 ---------- */
const PK = { secret: ['密', '#8e44ad'], pistol: ['槍', '#34495e'], smg: ['衝', '#34495e'], shotgun: ['霰', '#34495e'], rifle: ['步', '#34495e'], ammo: ['彈', '#7f8c8d'], armor: ['甲', '#2e86de'], health: ['✚', '#27ae60'], cash: ['$', '#27ae60'], loot: ['$', '#d4a017'] };
function addPickup(type, x, z, amt = 0, y = null) { if (y == null && !boxFree(x, z, 0.4)) for (let k = 1; k < 40; k++) { const a = k * 2.4, d = 0.8 + k * 0.35, nx = x + Math.cos(a) * d, nz = z + Math.sin(a) * d; if (boxFree(nx, nz, 0.5) && sdAt(nx, nz) > 2) { x = nx; z = nz; break; } } const ic = iconSprite(PK[type][0], PK[type][1]); ic.scale.set(1.3, 1.3, 1); ic.material.depthTest = true; const yy = y ?? heightAt(x, z); ic.position.set(x, yy + 1.1, z); scene.add(ic); const p = { type, x, z, y: yy, amt, ic, t: 0, perm: amt === 0 && type !== 'cash' }; pickups.push(p); return p; }
function takePickup(p) {
  const wi = WEAPONS.findIndex(w => w.id === p.type);
  if (wi > 0) { giveWeapon(wi, WEAPONS[wi].ammo); toast('撿到' + WEAPONS[wi].name); }
  else if (p.type === 'ammo') { let any = false; for (let i = 1; i < 5; i++) if (inv.has[i]) { inv.ammo[i] += Math.ceil(WEAPONS[i].ammo / 2); any = true; } if (!any) giveWeapon(1, 24); refreshWeapon(); toast('撿到彈藥'); }
  else if (p.type === 'armor') { player.armor = 100; toast('穿上防彈衣'); } else if (p.type === 'health') { player.hp = 100; toast('生命回滿'); }
  else if (p.type === 'secret') { secretsFound.add(p.secret); try { localStorage.setItem('kinmen_secrets', JSON.stringify([...secretsFound])); } catch (e) { } addMoney(2000); banner('軍事機密檔案', `${p.secret}　${secretsFound.size}/${(TUNNEL_DEFS.length + 1)}　+$2,000`); if (secretsFound.size === (TUNNEL_DEFS.length + 1)) { addMoney(15000); setTimeout(() => banner('坑道與大膽島秘境全制霸', '獎金 $15,000'), 3500); } }
  else if (p.type === 'cash') addMoney(p.amt); else if (p.type === 'loot') addLoot(p.amt);
  sfx('chime', 0.25); scene.remove(p.ic); p.gone = true; if (p.perm) { p.respawn = 240; } else pickups.splice(pickups.indexOf(p), 1);
}
function addLoot(n) { player.loot += n; $('loot').textContent = player.loot ? '贓款 $' + player.loot.toLocaleString() : ''; }

/* ---------- 射線 ---------- */
function castRay(o, d, range, t0) {
  const best = { t: range, kind: null, obj: null, head: false };
  const sph = (cx, cy, cz, r) => { const ox = o.x - cx, oy = o.y - cy, oz = o.z - cz, b = ox * d.x + oy * d.y + oz * d.z, c = ox * ox + oy * oy + oz * oz - r * r, disc = b * b - c; if (disc < 0) return -1; const t = -b - Math.sqrt(disc); return t > t0 ? t : -1; };
  const body = (e, kind) => { if (Math.abs(e.pos.x - o.x) > range || Math.abs(e.pos.z - o.z) > range) return; const lie = kind === 'ped' && e.state === 'down'; let t = sph(e.pos.x, e.pos.y + (lie ? 0.3 : 1.5), e.pos.z, 0.3); if (t > 0 && t < best.t) { best.t = t; best.kind = kind; best.obj = e; best.head = !lie; } t = sph(e.pos.x, e.pos.y + (lie ? 0.3 : 0.8), e.pos.z, 0.5); if (t > 0 && t < best.t) { best.t = t; best.kind = kind; best.obj = e; best.head = false; } };
  for (const p of peds) if (!p.dead) body(p, 'ped'); for (const c of cops) body(c, 'cop');
  for (const n of roomNpcs) if (!n.dead && n.room === player.inside) body(n, 'npc');
  for (const v of vehicles) { if (v === player.veh || Math.abs(v.pos.x - o.x) > range || Math.abs(v.pos.z - o.z) > range) continue; for (const c of vCircles(v)) { const t = sph(c.x, v.pos.y + 0.8, c.z, c.r + 0.2); if (t > 0 && t < best.t) { best.t = t; best.kind = 'veh'; best.obj = v; } } }
  if (heli && !heli.fall) { const t = sph(heli.pos.x, heli.pos.y, heli.pos.z, 2.3); if (t > 0 && t < best.t) { best.t = t; best.kind = 'heli'; best.obj = heli; } }
  for (let t = Math.max(t0, 0.8); t < best.t; t += 0.9) { const px = o.x + d.x * t, py = o.y + d.y * t, pz = o.z + d.z * t, g = heightAt(px, pz); if (py < g || (py < Math.max(0, groundAt(px, pz)) + 14 && !boxFree(px, pz, 0.05))) { best.t = t; best.kind = 'world'; best.obj = null; break; } }
  return best;
}
function shoot(w) {
  camera.getWorldDirection(_d); _o.copy(camera.position); const src = player.veh ? player.veh.pos : player.pos, t0 = Math.max(0, (src.x - _o.x) * _d.x + (src.y + 1.4 - _o.y) * _d.y + (src.z - _o.z) * _d.z) + 0.7;
  const mz = { x: src.x + _d.x * 0.8, y: src.y + (player.veh ? 1.5 : 1.42), z: src.z + _d.z * 0.8 };
  for (let k = 0; k < w.pellets; k++) {
    const d = new V3(_d.x + (Math.random() - 0.5) * 2 * w.spread, _d.y + (Math.random() - 0.5) * 2 * w.spread, _d.z + (Math.random() - 0.5) * 2 * w.spread).normalize(), r = castRay(_o, d, w.range, t0), e = { x: _o.x + d.x * r.t, y: _o.y + d.y * r.t, z: _o.z + d.z * r.t };
    addTracer(mz, e); if (r.kind) puff(e.x, e.y, e.z, 0.25, 0.9, 0.12, glowTex, true);
    if (r.kind === 'ped') { const p = r.obj; p.hp = (p.hp ?? 40) - w.dmg * (r.head ? 2.5 : 1); if (p.hp <= 0) killPed(p, d.x * 4, d.z * 4); else if (p.state !== 'wait') { p.state = 'flee'; p.t = 0; } crime(1); }
    else if (r.kind === 'cop') { const c = r.obj; c.hp -= w.dmg * (r.head ? 2.5 : 1); c.alert = true; if (c.hp <= 0) killCop(c); if (!c.thug) crimeMin(3); }
    else if (r.kind === 'npc') { hitNpc(r.obj, w.dmg * (r.head ? 2.5 : 1)); }
    else if (r.kind === 'heli') { hitHeli(w.dmg); }
    else if (r.kind === 'veh') { const v = r.obj; v.hp -= w.dmg * 0.55 * (v.bulletproof ? 0.25 : 1); v.hitP = dirPt(v, player.pos); if (v.ai) { v.ai.cruise = 27; v.ai.stun = 0; } if (v.thug) { } else if (v.driver === 'police') crimeMin(3); else crime(1); if (v.hp <= 0 && !v.burn) v.burn = 3.2; }
  }
  inv.ammo[inv.cur]--; player.fireCd = w.rate; player.aimT = 1.4; cam.pitch = Math.max(0.02, cam.pitch - 0.006); sfx(w.id === 'shotgun' ? 'shot2' : 'shot', 0.32); puff(mz.x, mz.y, mz.z, 0.5, 1.3, 0.05, glowTex, true); refreshWeapon();
  // 槍聲：附近的人逃跑，有人看到就會報警
  let seen = false; for (const p of peds) if (!p.dead && p.state !== 'wait') { const dd = Math.hypot(p.pos.x - src.x, p.pos.z - src.z); if (dd < 45) { if (p.state === 'walk') { p.state = 'flee'; p.t = 0; } seen = true; } } if (seen || player.inside) crimeMin(1);
}
function killPed(p, vx, vz) { if (p.dead) return; if (mission.taxi && mission.taxi.ped === p) endTaxi('乘客出事了，載客結束'); p.dead = true; p.state = 'down'; p.t = 0; p.vx = vx * 0.3; p.vz = vz * 0.3; p.vy = 2.5; if (rand() < 0.6) addPickup('cash', p.pos.x + rr(-1, 1), p.pos.z + rr(-1, 1), Math.round(rr(40, 400) / 10) * 10); wanted.cd = 0; crime(1); for (const o of peds) if (o !== p && o.state === 'walk' && Math.hypot(o.pos.x - p.pos.x, o.pos.z - p.pos.z) < 35) { o.state = 'flee'; o.t = 0; } }

/* ---------- 下車的警察 / 軍人 ---------- */
function spawnCop(x, z, soldier = false, room = null, thug = false) {
  const m = !soldier && !room && !thug && RIG.bases.some(b => b.name === 'm_Swat') && Q.peds >= 22 ? makeRig({ base: 'm_Swat', pistol: true, armed: true, height: 1.02 }) : makePerson(soldier ? { shirt: '#59603d', pants: '#4a5234', helmet: true, helmetCol: '#4a5234', skin: '#d9a07c', female: false, longSleeve: true, jacket: null, shorts: false } : { shirt: '#2b4f7e', pants: '#1b2433', cap: '#1b2433', female: false, longSleeve: true, jacket: null, shorts: false, shoe: '#111' }); const g = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, soldier ? 0.9 : 0.3).translate(0, 0, 0.2), mTrim); g.rotation.x = Math.PI / 2; g.position.set(0, -0.27, 0.03); m.armR.lo.add(g); m.armR.rotation.x = -1.45; m.armR.lo.rotation.x = 0;
  scene.add(m.group); const c = { m, pos: new V3(x, heightAt(x, z), z), yaw: 0, hp: soldier ? 90 : room ? 45 : 60, fireCd: rr(0.6, 1.4), bustT: 0, soldier, room, ph: 0, guard: !!room }; m.group.position.copy(c.pos); cops.push(c); return c;
}
function removeCop(c) { scene.remove(c.m.group); const i = cops.indexOf(c); if (i >= 0) cops.splice(i, 1); }
function killCop(c) { if (rand() < 0.7) addPickup('ammo', c.pos.x, c.pos.z, 1, c.pos.y); const p = { m: c.m, pos: c.pos, yaw: c.yaw, state: 'down', dead: true, t: 0, vx: 0, vz: 0, vy: 2, e: roadEdges[0], fi: 0, dir: 1, side: 1, spd: 1, ph: 0, idle: 0, keep: !!c.room }; peds.push(p); cops.splice(cops.indexOf(c), 1); if (!c.thug) { wanted.cd = 0; crimeMin(3); crime(1); } }
function updateCops(dt) {
  const st = wanted.stars, tgt = player.veh ? player.veh.pos : player.pos, pspd = player.veh ? Math.abs(player.veh.speed) : (player.spd || 0);
  for (const c of [...cops]) {
    if (c.thug) { if (!c.alert) { c.m.group.position.copy(c.pos); continue; } }
    else if (c.guard) { if (!(rob && rob.room === c.room && player.inside === c.room) && !c.alert) continue; if (player.inside !== c.room) continue; }
    else if (player.plane) { c.m.group.position.copy(c.pos); continue; }
    const dx = tgt.x - c.pos.x, dz = tgt.z - c.pos.z, d = Math.hypot(dx, dz) || 1; if (!c.guard && !c.thug && (d > 300 || st === 0)) { removeCop(c); continue; }
    const lethal = c.guard || c.thug || st >= 2 || (inv.cur > 0 && player.aimT > 0), want = lethal ? (c.guard ? 6 : 11) : 1.2; c.yaw += angDiff(c.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 8);
    if (d > want + 1.5) { const sp = lethal ? 4.6 : 6.9, nx = c.pos.x + dx / d * sp * dt, nz = c.pos.z + dz / d * sp * dt; if (groundAt(nx, nz) > -0.6 || bridgeY(nx, nz) !== null || deckY(nx, nz) !== null) { c.pos.x = nx; c.pos.z = nz; } resolveCircle(c.pos, 0.4); c.pos.y = heightAt(c.pos.x, c.pos.z); c.ph += dt * sp * 2.6; poseWalk(c.m, c.ph, 1); c.m.armR.rotation.x = -1.45; c.m.armR.lo.rotation.x = 0; } else { c.m.legL.rotation.x = c.m.legR.rotation.x = 0; if (c.m.rig) poseWalk(c.m, 0, 0); }
    if (lethal && d < 36) { c.fireCd -= dt; if (c.fireCd <= 0) { c.fireCd = rr(0.7, 1.3) * (c.soldier ? 0.45 : c.guard ? 1.6 : 1); const ph = clamp(0.62 - d * 0.014, 0.12, 0.6) * (pspd > 6 ? 0.55 : 1) * (player.veh ? 0.7 : 1) * (inCover() ? 0.35 : 1) * (player.rollT > 0 ? 0 : 1), hit = Math.random() < ph, a = { x: c.pos.x, y: c.pos.y + 1.4, z: c.pos.z }, b = { x: tgt.x + (hit ? 0 : rr(-1.5, 1.5)), y: tgt.y + (hit ? 1.2 : rr(0.2, 2.6)), z: tgt.z + (hit ? 0 : rr(-1.5, 1.5)) }; addTracer(a, b); sfx('shot', clamp(0.3 - d * 0.006, 0.04, 0.25)); if (hit) { if (player.veh) { player.veh.hp -= player.veh.bulletproof ? 1 : 6; player.veh.hitP = dirPt(player.veh, c.pos); if (player.veh.hp <= 0 && !player.veh.burn) { player.veh.burn = 3.2; toast('車要爆炸了！快下車'); } if (Math.random() < 0.3 && !player.veh.bulletproof) damage(5); } else damage(c.soldier ? 13 : 8); } } }
    else if (!lethal && st > 0 && ((!player.veh && d < 1.9) || (player.veh && d < 3.4 && pspd < 2))) { c.bustT += dt; if (c.bustT > 1.1 && wanted.bust > -50) busted(); } else c.bustT = Math.max(0, c.bustT - dt);
    c.m.group.position.copy(c.pos); c.m.group.rotation.set(0, c.yaw, 0);
  }
}
function deployCops(v) { if (cops.filter(c => !c.guard).length >= 7) return; v.deployed = true; v.parkT = 14; const f = fwd(v.yaw); for (const s of [-1, 1]) { const x = v.pos.x + f.z * s * 1.9, z = v.pos.z - f.x * s * 1.9; const c = spawnCop(x, z, !!v.soldier, null, !!v.thug); c.from = v; if (v.thug) { c.thug = true; c.alert = true; } } sfx('door', 0.3); }

/* ---------- 每幀 ---------- */
function updateCombat(dt) {
  player.fireCd -= dt; player.aimT = Math.max(0, player.aimT - dt); noAmmoT -= dt; if (input.aim && inv.cur) player.aimT = 0.3;
  const can = game.started && !game.menu && !game.mapOpen && !player.plane && !game.busy;
  if (can && player.veh && player.veh.def.tank) { if (input.fire) tankFire(); } else if (can) { if (inv.cur === 0) { if (input.fireEdge && !player.veh) punch(); } else { const w = WEAPONS[inv.cur]; if (input.fire && player.fireCd <= 0 && (w.auto || input.fireEdge)) { if (inv.ammo[inv.cur] > 0) shoot(w); else if (noAmmoT <= 0) { noAmmoT = 0.6; sfx('door', 0.2); toast('沒子彈了'); } } } }
  input.fireEdge = false;
  for (const t of tracers) if (t.t > 0) { t.t -= dt; if (t.t <= 0) t.l.visible = false; }
  for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; const k = f.t / f.life; if (k >= 1) { scene.remove(f.sp); f.sp.material.dispose(); fx.splice(i, 1); continue; } f.sp.scale.setScalar(lerp(f.s0, f.s1, k)); f.sp.material.opacity = 1 - k; f.sp.position.y += f.rise * dt; }
  flashLight.intensity *= Math.exp(-dt * 9);
  for (const v of [...vehicles]) if (v.burn) { v.burn -= dt; if (Math.random() < dt * 14) puff(v.pos.x + rr(-0.6, 0.6), v.pos.y + 1.2, v.pos.z + rr(-0.6, 0.6), 0.8, 2.6, 0.4, Math.random() < 0.6 ? glowTex : smokeTex, Math.random() < 0.6, 3); if (v.burn <= 0) explode(v.pos.x, v.pos.y, v.pos.z, v); } else if (v.hp < 35 && Math.random() < dt * 5) puff(v.pos.x, v.pos.y + 1.3, v.pos.z, 0.6, 2.2, 0.9, smokeTex, false, 2.5);
  for (let i = wrecks.length - 1; i >= 0; i--) { wrecks[i].t -= dt; if (wrecks[i].t <= 0) { scene.remove(wrecks[i].m); wrecks.splice(i, 1); } }
  const foot = !player.veh && !player.plane;
  for (const p of [...pickups]) { if (p.gone) { p.respawn -= dt; if (p.respawn <= 0) { p.gone = false; scene.add(p.ic); } continue; } p.t += dt; p.ic.position.y = p.y + 1.1 + Math.sin(p.t * 3) * 0.15; if (foot && Math.abs(p.x - player.pos.x) < 1.7 && Math.abs(p.z - player.pos.z) < 1.7 && Math.abs(p.y - player.pos.y) < 3) takePickup(p); else if (!p.perm && p.type === 'cash' && p.t > 90) { scene.remove(p.ic); pickups.splice(pickups.indexOf(p), 1); } }
  updateCops(dt); updateRob(dt);
}
