/* =====================================================================
   距離剔除：小東西（招牌、路燈、欄杆、雜物）離鏡頭太遠就不畫，車輛超過一定距離也不畫。
   用 layers 做（不動 visible，遊戲邏輯自己開關 visible 的東西不受影響）。
   可見距離 = max(最短距離, 物件半徑 × K)；畫質低時再打折。?nocull 可關閉比較。
   ===================================================================== */
/* 霧從 260 公尺開始：小群組（路人、擺設）320 公尺、小模型 450 公尺外不畫（原本 520／700） */
const CULL = { on: !/nocull/.test(location.search), list: [], seen: 0, f: 0, K: 230, min: 230, gmax: 320, mmax: 450, veh: 320, hidden: 0, _v: new THREE.Vector3(), _m: new THREE.Matrix4() };
function cullScan(force) { // 把新出現的頂層物件登記進來（數量沒變也定期掃：路人生成和消失可能剛好抵銷）
  const ch = scene.children; if (ch.length === CULL.seen && !force) return; CULL.seen = ch.length;
  if (force) CULL.list = CULL.list.filter(e => e.o.parent); // 已經從場景拿掉的就不再追蹤
  const vg = new Set(vehicles.map(v => v.group)), bx = new THREE.Box3();
  for (const o of ch) { if (o.userData._c) continue;
    if (!o.isMesh) { // 群組（路人、店員、雕像、小型擺設）：用整體外框算大小，位置跟著群組走
      if (o.isLight || o.isCamera || vg.has(o) || !o.children.length || o.userData.noCull) continue; o.userData._c = 1; bx.setFromObject(o); if (bx.isEmpty()) continue; const r = bx.getSize(CULL._v).length() / 2; if (!(r > 0) || r > 30) continue;
      CULL.list.push({ o, grp: true, r, c: bx.getCenter(new THREE.Vector3()).sub(o.position), R: 0, d: Math.min(Math.max(CULL.min, r * CULL.K), CULL.gmax), v: true }); continue; }
    o.userData._c = 1; if (!o.frustumCulled || o.userData.noCull || !o.geometry) continue; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (!g.boundingSphere) continue;
    let r, R, c;
    if (o.isInstancedMesh) { if (!o.boundingSphere) o.computeBoundingSphere(); let ms = 0; const step = Math.max(1, Math.floor(o.count / 48)); for (let i = 0; i < o.count; i += step) { o.getMatrixAt(i, CULL._m); const e = CULL._m.elements; ms = Math.max(ms, Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10])); } r = g.boundingSphere.radius * ms; R = o.boundingSphere.radius; c = o.boundingSphere.center.clone(); }
    else { r = g.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z); R = r; c = g.boundingSphere.center.clone(); }
    if (!(r > 0) || r > 45) continue; // 大型物件（建築群、地形、道路）永遠畫
    CULL.list.push({ o, c, R, r, d: r < 9 ? Math.min(Math.max(CULL.min, r * CULL.K), CULL.mmax) : Math.max(950, r * 150), v: true }); } // 樹、路燈這類中小物件最遠 950 公尺（再遠有霧，看不清）
}
function cullUpdate() {
  if (!CULL.on || (++CULL.f % 10 && CULL.f > 3)) return; if (CULL.f % 120 === 10 || !CULL.seen) cullScan(CULL.f % 120 === 10);
  const cp = camera.position, k = (Q.far || 1) * (60 / Math.max(20, camera.fov)), v3 = CULL._v; let hid = 0;
  for (const e of CULL.list) { const o = e.o; if (e.grp) v3.copy(e.c).add(o.position); else v3.copy(e.c).applyMatrix4(o.matrixWorld); const dist = v3.distanceTo(cp) - e.R, vis = dist < e.d * k; if (!vis) hid++; if (vis !== e.v) { e.v = vis; if (e.grp) o.traverse(x => { if (vis) x.layers.enable(0); else x.layers.disable(0); }); else if (vis) o.layers.enable(0); else o.layers.disable(0); } }
  const vd = CULL.veh * k; for (const v of vehicles) { const vis = v === player.veh || Math.hypot(v.pos.x - cp.x, v.pos.z - cp.z) < vd; if (!vis) hid++; if (vis !== (v._cv !== false)) { v._cv = vis; v.group.traverse(x => { if (vis) x.layers.enable(0); else x.layers.disable(0); }); } }
  CULL.hidden = hid;
}

/* 自動解析度：手機幀數太低時自動降低繪圖解析度，順了再慢慢調回來（設定的畫質是上限）。?nores 可關閉 */
const ARES = { on: !/nores/.test(location.search) && !navigator.webdriver, n: 0, t: 0, k: 1, good: 0, bad: 0 };
function autoRes(now) {
  if (!ARES.on || !game.started || game.paused) { ARES.t = 0; ARES.n = 0; return; } ARES.n++; if (!ARES.t) { ARES.t = now; ARES.n = 0; return; } const dt = now - ARES.t; if (dt < 1000) return;
  const fps = ARES.n * 1000 / dt; ARES.n = 0; ARES.t = now; if (dt > 2500) return; // 分頁切到背景再回來的那一格不算
  if (fps < 27) { ARES.bad++; ARES.good = 0; } else if (fps > 50) { ARES.good++; ARES.bad = 0; } else { ARES.bad = ARES.good = 0; }
  let k = ARES.k; if (ARES.bad >= 3 && k > 0.55) { k = Math.max(0.55, k - 0.12); ARES.bad = 0; } else if (ARES.good >= 8 && k < 1) { k = Math.min(1, k + 0.08); ARES.good = 0; } if (k === ARES.k) return; ARES.k = k;
  const pr = Math.min(window.devicePixelRatio || 1, Q.pr) * k; renderer.setPixelRatio(pr); if (typeof composer !== 'undefined' && composer) { composer.setPixelRatio(pr); composer.setSize(window.innerWidth, window.innerHeight); }
}

function cullCaps(g, m) { CULL.gmax = g; CULL.mmax = m; for (const e of CULL.list) { if (e.grp) e.d = Math.min(Math.max(CULL.min, e.r * CULL.K), g); else if (e.r < 9) e.d = Math.min(Math.max(CULL.min, e.r * CULL.K), m); } CULL.f = 0; }
