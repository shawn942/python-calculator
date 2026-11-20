/* =====================================================================
   骨架角色（Quaternius Ultimate Modular Men/Women，CC0）
   載入失敗或低畫質時自動退回程序化 makePerson
   ===================================================================== */
const RIG = { ready: false, clips: {}, hero: null, bases: [], list: [], S: 1, dt: 0.016, f: 0, on: !/norig/.test(location.search) };
const RIG_FILES = ['m_Suit', 'm_Farmer', 'm_Worker', 'm_Beach', 'm_Swat', 'w_Casual', 'w_Formal', 'w_Punk', 'w_Suit', 'w_Worker'];
const RIG_PED = ['m_Suit', 'm_Farmer', 'm_Worker', 'm_Beach', 'w_Casual', 'w_Formal', 'w_Punk', 'w_Suit', 'w_Worker'];
function rigPrep(s) {
  s.traverse(c => { if (c.isMesh) { c.castShadow = false; c.receiveShadow = false; const m = c.material; if (m && m.isMeshStandardMaterial) { m.roughness = Math.max(0.75, m.roughness); m.metalness = 0; } } });
}
function loadRigs() {
  if (!RIG.on) return Promise.resolve(false);
  const ld = new GLTFLoader(); ld.setMeshoptDecoder(MeshoptDecoder);
  const get = n => new Promise(res => ld.load('chars/' + n + '.json', g => res(g), undefined, e => { RIG.err = n + ': ' + (e && (e.message || e)); console.error('rig load', RIG.err); res(null); }));
  return get('hero').then(h => {
    if (!h) return false;
    for (const a of h.animations) RIG.clips[a.name] = a;
    rigPrep(h.scene); RIG.hero = h.scene;
    h.scene.updateMatrixWorld(true); const hb = h.scene.getObjectByName('Head'), hp = new V3(); if (hb) hb.getWorldPosition(hp); RIG.S = hp.y > 0.05 ? 1.56 / hp.y : 1;
    RIG.ready = true; rigSwapPlayer();
    return Promise.all(RIG_FILES.map(get)).then(arr => { arr.forEach((g, i) => { if (!g) return; rigPrep(g.scene); RIG.bases.push({ name: RIG_FILES[i], scene: g.scene, fem: RIG_FILES[i][0] === 'w' }); }); return true; });
  });
}
const RIG_HERO_TINT = { LightBrown: '#f3efe6', LightBlue: '#2f4a6e', Red_Dark: '#f2f2f2' };
function makeRig(o = {}) {
  let b;
  if (o.hero || !RIG.bases.length) b = { scene: RIG.hero, fem: false, name: 'hero' };
  else { let pool = RIG.bases.filter(x => RIG_PED.includes(x.name)); if (o.base) pool = RIG.bases.filter(x => x.name === o.base); else if (o.female === true) pool = pool.filter(x => x.fem); else if (o.female === false) pool = pool.filter(x => !x.fem); b = pick(pool.length ? pool : RIG.bases); }
  const s = SkeletonUtils.clone(b.scene), g = new THREE.Group();
  s.scale.setScalar(RIG.S * (o.height || rr(0.95, 1.04))); g.add(s);
  const tint = o.tint || null, mats = {};
  s.traverse(c => { if (c.name === 'Pistol') { c.visible = !!o.pistol; return; } if (!c.isMesh) return; c.castShadow = !!o.shadow; if (tint) { const n = c.material.name; if (tint[n]) { if (!mats[n]) { mats[n] = c.material.clone(); mats[n].color.set(tint[n]); } c.material = mats[n]; } } });
  if (o.skinVar) { const sk = new THREE.Color().setHSL(0.07, 0.45, rr(0.42, 0.62)); s.traverse(c => { if (c.isMesh && c.material.name === 'Skin') { if (!mats.Skin) { mats.Skin = c.material.clone(); mats.Skin.color.copy(sk).convertSRGBToLinear(); } c.material = mats.Skin; } }); }
  const D = () => { const d = new THREE.Object3D(); d.lo = new THREE.Object3D(); return d; };
  const bone = n => s.getObjectByName(n.replace('.', ''));
  const r = { mixer: new THREE.AnimationMixer(s), acts: {}, cur: null, lock: 0, orphan: 0, sit: false, ph: 0, acc: 0, root: s,
    hand: bone('Wrist.R'), legs: [bone('UpperLeg.L'), bone('UpperLeg.R')], shins: [bone('LowerLeg.L'), bone('LowerLeg.R')], arms: [bone('UpperArm.L'), bone('UpperArm.R')], feet: [bone('Foot.L'), bone('Foot.R')] };
  const P = { armed: !!o.armed, group: g, body: new THREE.Object3D(), legL: D(), legR: D(), armL: D(), armR: D(), female: b.fem, rig: r, rigName: b.name };
  rigPlay(P, 'Idle', 0); r.mixer.update(0); s.updateMatrixWorld(true);
  if (r.feet[0] && r.feet[1] && r.shins[0] && r.shins[1]) r.footOff = r.feet.map((f, i) => r.shins[i].worldToLocal(f.getWorldPosition(new V3())));
  r.mixer.update(rr(0, 2));
  RIG.list.push(P); return P;
}
function rigPlay(P, name, fade = 0.22, once = false) {
  const r = P.rig; if (r.cur === name && !once) return; const clip = RIG.clips[name]; if (!clip) return;
  let a = r.acts[name]; if (!a) a = r.acts[name] = r.mixer.clipAction(clip);
  const prev = r.cur && r.acts[r.cur];
  a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = once; a.timeScale = 1; a.setEffectiveWeight(1); a.play();
  if (prev && prev !== a && fade > 0) a.crossFadeFrom(prev, fade, false); else if (prev && prev !== a) prev.stop();
  r.cur = name; if (once) r.lock = clip.duration * 0.92;
}
function rigLoco(P, ph, amp) {
  const r = P.rig; r.sit = false; if (r.lock > 0) return;
  const isP = P === player.model, armed = isP ? inv.cur > 0 : P.armed;
  const n = P.armed && !isP ? (amp <= 0.01 ? 'Idle_Gun_Pointing' : 'Run_Shoot') : amp <= 0.01 ? (armed ? (player.aimT > 0 ? 'Idle_Gun_Pointing' : 'Idle_Gun') : 'Idle') : amp > 1.1 ? (armed && player.aimT > 0 ? 'Run_Shoot' : 'Run') : 'Walk';
  rigPlay(P, n);
  const dph = ph - r.ph; r.ph = ph; const a = r.acts[n];
  if (amp > 0.01 && dph > 0 && dph < 3 && a) { const w = dph / Math.max(1e-3, RIG.dt); a.timeScale = clamp(w / (2 * Math.PI) * RIG.clips[n].duration * (n === 'Walk' ? 1 : 0.5), 0.55, n === 'Run_Shoot' ? 1.4 : 2.2); }
}
function rigUpdate(dt) {
  RIG.dt = dt; RIG.f++; if (!RIG.list.length) return; const cp = cam.pos;
  for (let i = RIG.list.length - 1; i >= 0; i--) {
    const P = RIG.list[i], g = P.group, r = P.rig;
    if (!g.parent) { if (++r.orphan > 120) { r.mixer.stopAllAction(); RIG.list.splice(i, 1); } continue; } r.orphan = 0;
    if (P === player.model && player.punch > 0.15 && r.lock <= 0 && r.cur !== 'Punch_Right') rigPlay(P, 'Punch_Right', 0.08, true);
    if (r.lock > 0) r.lock -= dt;
    r.acc += dt; if (!g.visible) continue;
    const d = Math.hypot(g.position.x - cp.x, g.position.z - cp.z), k = d < 40 ? 1 : d < 90 ? 2 : 4;
    if ((RIG.f + i) % k) continue;
    if (r.footBase) { r.feet[0].position.copy(r.footBase[0]); r.feet[1].position.copy(r.footBase[1]); r.footBase = null; }
    r.mixer.update(Math.min(0.2, r.acc)); r.acc = 0;
    if (r.sit) rigSitPose(r);
  }
}
const RIG_SIT = { th: -1.45, sh: 1.45 };
const _rq = new THREE.Quaternion(), _rq2 = new THREE.Quaternion(), _ra = new V3();
function rigRotX(r, b, ang) { if (!b) return; b.parent.getWorldQuaternion(_rq).invert(); r.root.getWorldQuaternion(_rq2); _ra.set(1, 0, 0).applyQuaternion(_rq2).applyQuaternion(_rq).normalize(); b.quaternion.premultiply(_rq2.setFromAxisAngle(_ra, ang)); }
const _rv = [new V3(), new V3()];
function rigSitPose(r) {
  const ok = r.feet[0] && r.feet[1] && r.shins[0] && r.shins[1] && r.footOff;
  if (ok) { r.footBase = r.feet.map(f => f.position.clone()); for (let i = 0; i < 2; i++) _rv[i].copy(r.footOff[i]); }
  r.root.updateMatrixWorld(true); for (const b of r.legs) rigRotX(r, b, RIG_SIT.th); for (const b of r.arms) rigRotX(r, b, -0.9);
  r.root.updateMatrixWorld(true); for (const b of r.shins) rigRotX(r, b, RIG_SIT.sh);
  if (!ok) return; r.root.updateMatrixWorld(true);
  for (let i = 0; i < 2; i++) { const f = r.feet[i]; r.shins[i].localToWorld(_rv[i]); f.parent.worldToLocal(_rv[i]); f.position.copy(_rv[i]); }
}
function rigSit(P) { const r = P.rig; if (r.lock > 0) return; rigPlay(P, 'Idle', 0.15); r.sit = true; }
function rigSwapPlayer() {
  if (!player.model || player.model.rig || !RIG.ready) return;
  const old = player.model, m = makeRig({ hero: true, shadow: true, tint: RIG_HERO_TINT, height: 1 });
  m.group.position.copy(old.group.position); m.group.rotation.copy(old.group.rotation); m.group.visible = old.group.visible;
  if (old.group.parent) old.group.parent.add(m.group); old.group.parent && old.group.parent.remove(old.group);
  player.model = m; refreshWeapon();
}
function rigGun(P, gun) {
  const h = P.rig.hand; if (!h) return false; h.updateWorldMatrix(true, false); const ws = new V3(); h.getWorldScale(ws);
  const H = P.rig.gunH || (P.rig.gunH = new THREE.Group()); if (H.parent !== h) h.add(H);
  H.scale.setScalar(1 / Math.max(1e-4, ws.x)); H.position.set(0, 0, 0); H.rotation.set(0, 0, 0);
  gun.position.set(RIG_GUN.x, RIG_GUN.y, RIG_GUN.z); gun.rotation.set(RIG_GUN.rx, RIG_GUN.ry, RIG_GUN.rz); H.add(gun); return true;
}
const RIG_GUN = { x: 0, y: 0.03, z: 0.01, rx: -1.5708, ry: 0, rz: 0 };
