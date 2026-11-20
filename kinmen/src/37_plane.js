/* =====================================================================
   可駕駛的小飛機
   ===================================================================== */
const planes = [];
function makePlane(x, z, yaw) {
  const T = (px, py, pz, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new V3(px, py, pz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new V3(1, 1, 1)), g = new THREE.Group();
  const body = new THREE.Mesh(mergeGeos([[new THREE.CapsuleGeometry(0.75, 4.6, 6, 12), '#f3f4f5', T(0, 1.45, 0, Math.PI / 2)], [new THREE.BoxGeometry(1.2, 0.85, 1.9), '#22313f', T(0, 1.95, 0.7)], [new THREE.BoxGeometry(11.4, 0.16, 1.7), '#f3f4f5', T(0, 2.45, 0.5)], [new THREE.BoxGeometry(11.5, 0.17, 0.5), '#c0392b', T(0, 2.45, 1.1)],
    [new THREE.BoxGeometry(3.8, 0.12, 1.1), '#f3f4f5', T(0, 1.6, -3.3)], [new THREE.BoxGeometry(0.14, 1.7, 1.3), '#c0392b', T(0, 2.35, -3.35)], [new THREE.BoxGeometry(1.52, 0.3, 5), '#c0392b', T(0, 1.2, 0)],
    [new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), '#888', T(-1.1, 1.75, 0.6, 0, 0, -0.9)], [new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), '#888', T(1.1, 1.75, 0.6, 0, 0, 0.9)],
    [new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), '#1b1c1e', T(-1.1, 0.3, 0.6, 0, 0, Math.PI / 2)], [new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), '#1b1c1e', T(1.1, 0.3, 0.6, 0, 0, Math.PI / 2)], [new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12), '#1b1c1e', T(0, 0.24, 2.4, 0, 0, Math.PI / 2)],
    [new THREE.CylinderGeometry(0.05, 0.05, 1, 6), '#888', T(-1.1, 0.8, 0.6)], [new THREE.CylinderGeometry(0.05, 0.05, 1, 6), '#888', T(1.1, 0.8, 0.6)], [new THREE.CylinderGeometry(0.05, 0.05, 1, 6), '#888', T(0, 0.75, 2.4)], [new THREE.ConeGeometry(0.3, 0.6, 10), '#c0392b', T(0, 1.45, 3.25, Math.PI / 2)]]), mVC);
  body.castShadow = true; g.add(body); const prop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.05), mTrim); prop.position.set(0, 1.45, 3.2); g.add(prop); scene.add(g);
  const p = { group: g, prop, pos: new V3(x, heightAt(x, z), z), yaw, pitch: 0, roll: 0, speed: 0, thr: 0, air: false, home: [x, z, yaw] }; g.position.copy(p.pos); g.rotation.set(0, yaw, 0, 'YXZ'); planes.push(p); return p;
}
function nearestPlane() { for (const p of planes) if (Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z) < 6 && !p.air) return p; return null; }
function enterPlane(p) { if (weather.cur === 3) { toast('大霧，機場停飛（金門霧季）'); return; } if (weather.cur === 4) { toast('颱風來了，機場關閉'); return; } player.plane = p; player.model.group.visible = false; cam.off = 0; sfx('door', 0.4); subtitle('<b>W/S</b> 油門　<b>A/D</b> 轉向　<b>↓ 或 空白鍵</b> 拉升　<b>↑ 或 Shift</b> 俯衝　　時速超過 100 再拉升起飛，降落時放慢、機頭放平。', 12); }
function exitPlane() { const p = player.plane; if (!p) return; if (p.air && p.pos.y - Math.max(0, heightAt(p.pos.x, p.pos.z)) > 25) { bailOut(p); return; } if (p.air || p.speed > 4) { toast('落地停穩才能下飛機'); return; } const f = fwd(p.yaw); player.pos.set(p.pos.x + f.z * 3, p.pos.y, p.pos.z - f.x * 3); player.pos.y = heightAt(player.pos.x, player.pos.z); player.yaw = p.yaw; cam.yaw = p.yaw; player.plane = null; player.model.group.visible = true; p.thr = 0; sfx('door', 0.4); }
function crashPlane(p, msg) { const { x, y, z } = p.pos; scene.remove(p.group); planes.splice(planes.indexOf(p), 1); player.plane = null; player.model.group.visible = true; player.pos.set(x, heightAt(x, z), z); explode(x, y, z, null); if (mission.type === 'fly') endMission(false); wasted(msg || '墜 機'); setTimeout(() => makePlane(...p.home), 3000); }
function updatePlane(p, dt) {
  const K = keys, thrIn = (K.KeyW ? 1 : 0) - (K.KeyS ? 1 : 0) + (touch.brake ? -1 : 0), turn = (K.KeyD || K.ArrowRight ? 1 : 0) - (K.KeyA || K.ArrowLeft ? 1 : 0) + touch.x, pin = (K.ArrowDown || K.Space ? 1 : 0) - (K.ArrowUp || K.ShiftLeft ? 1 : 0) - touch.y;
  p.thr = clamp(p.thr + thrIn * 0.7 * dt + (touch.y !== 0 || touch.x !== 0 ? 0.4 * dt : 0), 0, 1);
  let gy = heightAt(p.pos.x, p.pos.z);
  if (!p.air) {
    p.speed += (p.thr * 15 - 0.004 * p.speed * p.speed - (p.thr < 0.05 ? 5 : 0.5) - (K.KeyS ? 14 : 0)) * dt; p.speed = Math.max(0, p.speed);
    p.yaw -= turn * clamp(p.speed / 10, 0, 1) * 0.8 * dt; p.roll += (0 - p.roll) * Math.min(1, dt * 6);
    if (p.speed > 27 && pin > 0) p.pitch += 0.45 * dt; else p.pitch += (0 - p.pitch) * Math.min(1, dt * 5);
    const f = fwd(p.yaw), q = { x: p.pos.x + f.x * p.speed * dt, z: p.pos.z + f.z * p.speed * dt }, h = resolveCircle(q, 2.2); if (h) { if (p.speed > 16) { crashPlane(p); return; } p.speed *= 0.4; } p.pos.x = q.x; p.pos.z = q.z; gy = heightAt(q.x, q.z); p.pos.y = gy;
    if (groundAt(q.x, q.z) < -0.7 && deckY(q.x, q.z) === null && bridgeY(q.x, q.z) === null) { crashPlane(p, '落 海'); return; }
    if (p.pitch > 0.05 && p.speed > 27) { p.air = true; p.pos.y += 0.3; }
  } else {
    p.speed += (p.thr * 15 - 0.0036 * p.speed * p.speed - Math.sin(p.pitch) * 11) * dt; p.speed = clamp(p.speed, 0, 95);
    p.roll += (turn * 0.8 - p.roll) * Math.min(1, dt * 2.6); p.yaw -= p.roll * 0.95 * dt * clamp(p.speed / 40, 0.5, 1.2);
    p.pitch = clamp(p.pitch + pin * 0.75 * dt - (pin === 0 ? p.pitch * 0.25 * dt : 0), -0.9, 0.8); const lift = clamp((p.speed - 18) / 12, 0, 1); if (lift < 1) p.pitch -= (1 - lift) * 0.9 * dt; if (p.pos.y > 520) p.pitch = Math.min(p.pitch, -0.02);
    if (Math.abs(p.pos.x) > 3300 || Math.abs(p.pos.z) > 2700) { p.yaw += angDiff(p.yaw, Math.atan2(-p.pos.x, -p.pos.z)) * Math.min(1, dt * 1.2); if (game.frame % 120 === 0) toast('即將離開金門空域，自動折返'); }
    const cp = Math.cos(p.pitch), vy = Math.sin(p.pitch) * p.speed - (1 - lift) * 14; p.pos.x += Math.sin(p.yaw) * cp * p.speed * dt; p.pos.z += Math.cos(p.yaw) * cp * p.speed * dt; p.pos.y += vy * dt; gy = heightAt(p.pos.x, p.pos.z);
    if (p.pos.y < Math.max(0, groundAt(p.pos.x, p.pos.z)) + 15 && !boxFree(p.pos.x, p.pos.z, 2.5)) { crashPlane(p); return; }
    if (p.pos.y <= gy) { const sea = groundAt(p.pos.x, p.pos.z) < -0.7 && gy < 0.5; if (sea) { crashPlane(p, '落 海'); return; } if (-vy > 12 || Math.abs(p.roll) > 0.55 || p.pitch < -0.42) { crashPlane(p); return; } p.air = false; p.pos.y = gy; sfx('thud', 0.3); }
  }
  p.group.position.copy(p.pos); p.group.rotation.set(-p.pitch, p.yaw, p.roll, 'YXZ'); p.prop.rotation.z += dt * (8 + p.thr * 70); player.pos.copy(p.pos); player.yaw = p.yaw;
}
