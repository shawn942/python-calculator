/* ===== 新版人物模型（參考角色設定圖的作法：統一比例、四視角一致） =====
   約 6.5 頭身的風格化比例；身體用旋轉曲面做出胸、腰、臀的厚度，
   臉有眼白瞳孔高光、眉毛、鼻子、耳朵，頭髮是一撮撮的層次，
   鞋子圓頭加白底，背包貼背有背帶。關節位置跟舊版一樣，走路動畫可直接沿用。 */
const RB = (w, h, d, r = 0.02, s = 2) => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const LATHE = (pts, seg = 14) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
const SPH = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);
// 由上往下的錐形肢段：長度 L、上半徑 a、下半徑 b（兩端圓頭）
const LIMB = (L, a, b, seg = 12) => { const pts = []; for (let i = 0; i <= 6; i++) { const t = (i / 6) * Math.PI / 2; pts.push([a * Math.sin(t), -a + a * Math.cos(t)]); } for (let i = 0; i <= 6; i++) { const t = Math.PI / 2 + (i / 6) * Math.PI / 2; pts.push([b * Math.sin(t), -L + b + b * Math.cos(t)]); } pts.reverse(); return LATHE(pts.map(p => [Math.max(0.0001, p[0]), p[1]]), seg); };
const _shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };

function makePerson(o = {}) {
  const female = o.female ?? (!o.helmet && !o.tie && rand() < 0.45), skin = o.skin || pick(SKINS), shirt = o.shirt || pick(SHIRTS), pants = o.pants || pick(PANTS), hair = o.hair || pick(HAIRS), shoe = o.shoe || pick(SHOES);
  const longSleeve = o.longSleeve ?? (o.tie || o.helmet || rand() < 0.35), skirt = o.skirt ?? (female && !o.helmet && rand() < 0.4), shorts = !skirt && !o.helmet && !o.tie && (o.shorts ?? rand() < 0.22), jacket = 'jacket' in o ? o.jacket : (!o.helmet && !o.tie && rand() < 0.18 ? pick(['#2b2f38', '#5a4636', '#3d4f3a', '#7a2f2a']) : null);
  const sw = female ? 0.88 : 1, H = o.height || (female ? rr(0.94, 1.0) : rr(0.98, 1.06)), top = jacket || shirt, sleeve = longSleeve || !!jacket, lip = female ? '#c0605a' : '#9a6352';
  const P = [], add = (g, c, m) => P.push([g, c, m || new THREE.Matrix4()]);

  /* --- 軀幹：胸腰臀用旋轉曲面，前後壓扁成橢圓剖面 --- */
  const tw = female ? [0.150, 0.150, 0.132, 0.150, 0.172, 0.176, 0.160, 0.115] : [0.158, 0.165, 0.170, 0.186, 0.200, 0.204, 0.188, 0.130];
  const torso = LATHE([[0, 0.925], [tw[0], 0.93], [tw[1], 0.99], [tw[2], 1.07], [tw[3], 1.18], [tw[4], 1.28], [tw[5], 1.35], [tw[6], 1.405], [tw[7], 1.445], [0.06, 1.47], [0, 1.475]], 18);
  add(torso, top, _PM(0, 0, 0, 0, 0, 0, sw, 1, 0.64));
  if (!jacket) add(new THREE.TorusGeometry(0.062, 0.013, 6, 18).rotateX(Math.PI / 2), _shade(shirt, 0.85), _PM(0, 1.462, 0.005, 0, 0, 0, 1.05, 1, 0.8)); // 領口
  if (jacket) { add(RB(0.085 * sw, 0.42, 0.02, 0.008), shirt, _PM(0, 1.2, 0.128 * 1)); add(RB(0.03, 0.4, 0.012, 0.005), _shade(jacket, 0.8), _PM(0.05, 1.2, 0.133)); add(RB(0.03, 0.4, 0.012, 0.005), _shade(jacket, 0.8), _PM(-0.05, 1.2, 0.133)); }
  if (o.tie) add(RB(0.042, 0.3, 0.012, 0.006), o.tie, _PM(0, 1.3, 0.13));
  /* 骨盆＋皮帶 */
  const hip = female ? 0.176 : 0.165; add(LATHE([[0, 0.835], [hip * 0.8, 0.84], [hip, 0.89], [hip * 1.01, 0.95], [hip * 0.96, 1.0], [0, 1.0]], 18), skirt ? (o.skirtCol || pants) : pants, _PM(0, 0, 0, 0, 0, 0, sw, 1, 0.68));
  if (!skirt) { add(new THREE.CylinderGeometry(hip * 0.99, hip * 0.99, 0.034, 18, 1, true), '#2a2420', _PM(0, 0.965, 0, 0, 0, 0, sw, 1, 0.69)); add(RB(0.04, 0.03, 0.01, 0.004), '#c9b37a', _PM(0, 0.965, hip * 0.69 + 0.003)); }
  if (skirt) add(LATHE([[0, 0.98], [0.165, 0.98], [0.2, 0.86], [0.255, 0.62], [0, 0.62]], 18), o.skirtCol || (shirt === pants ? '#3d4a5c' : pants), _PM(0, 0, 0, 0, 0, 0, 1, 1, 0.8));

  /* --- 頭頸臉 --- */
  add(new THREE.CylinderGeometry(0.047, 0.055, 0.12, 12), skin, _PM(0, 1.5, -0.005));
  const hy = 1.635;
  add(SPH(0.118, 24, 18), skin, _PM(0, hy, 0, 0, 0, 0, 0.92, 1.04, 1.0)); // 頭顱
  add(SPH(0.086, 18, 12), skin, _PM(0, hy - 0.045, 0.008, 0, 0, 0, female ? 0.9 : 0.97, 0.82, 0.9)); // 下巴
  for (const sd of [1, -1]) { add(SPH(0.027, 10, 8), skin, _PM(sd * 0.107, hy - 0.005, -0.004, 0, 0, 0, 0.45, 1, 0.75)); // 耳
    add(SPH(0.024, 12, 8), '#ffffff', _PM(sd * 0.04, hy + 0.008, 0.098, 0, 0, 0, 1.15, female ? 1.0 : 0.85, 0.45)); // 眼白
    add(SPH(0.0145, 10, 8), '#2a1c14', _PM(sd * 0.04, hy + 0.007, 0.106, 0, 0, 0, 1, 1, 0.55)); // 瞳孔
    add(SPH(0.0048, 6, 4), '#ffffff', _PM(sd * 0.04 + 0.005, hy + 0.013, 0.113)); // 高光
    add(RB(0.044, female ? 0.009 : 0.013, 0.012, 0.004), hair, _PM(sd * 0.041, hy + 0.04, 0.104, 0, 0, sd * (female ? 0.18 : 0.08))); // 眉
    if (female) add(SPH(0.016, 8, 6), '#f0a49a', _PM(sd * 0.058, hy - 0.025, 0.093, 0, 0, 0, 1, 0.6, 0.3)); }
  add(SPH(0.017, 10, 8), _shade(skin, 0.94), _PM(0, hy - 0.017, 0.112, 0, 0, 0, 0.8, 1.05, 0.9)); // 鼻
  add(RB(female ? 0.036 : 0.042, 0.009, 0.008, 0.003), lip, _PM(0, hy - 0.053, 0.1)); // 嘴

  /* --- 頭髮／帽子 --- */
  if (o.helmet) { add(new THREE.SphereGeometry(0.135, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), o.helmetCol || pick(['#e9e6df', '#b3423a', '#27496d', '#2b2f38', '#f0c330']), _PM(0, hy + 0.02, -0.005, 0, 0, 0, 1, 1.05, 1.08)); add(RB(0.2, 0.05, 0.02, 0.008), '#22313f', _PM(0, hy + 0.0, 0.135)); }
  else if (o.cap) { add(new THREE.SphereGeometry(0.124, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), o.cap, _PM(0, hy + 0.035, 0)); add(RB(0.16, 0.014, 0.1, 0.006), o.cap, _PM(0, hy + 0.04, 0.13, -0.1)); }
  else {
    const style = o.hairStyle || (female ? pick(['long', 'bob', 'bun', 'pony']) : pick(['short', 'short', 'crew', 'side'])), hd = _shade(hair, 0.82);
    add(new THREE.SphereGeometry(0.124, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, _PM(0, hy + 0.02, -0.016, -0.38, 0, 0, 0.98, 1.08, 1.06)); // 髮蓋
    if (style !== 'crew') for (let i = 0; i < 7; i++) { const a = -0.3 + (i / 6) * Math.PI * 1.6 + Math.PI * 0.6, r = 0.085; add(SPH(0.04, 10, 8), i % 2 ? hair : hd, _PM(Math.cos(a) * r * 0.9, hy + 0.072 + (i % 3) * 0.006, Math.sin(a) * r * -0.9 - 0.012, 0, 0, 0, 1.1, 0.6, 1.1)); } // 一撮撮的層次
    if (style === 'side') { add(RB(0.17, 0.045, 0.085, 0.02), hair, _PM(0.02, hy + 0.112, 0.06, 0.32, 0.1, -0.18)); add(RB(0.06, 0.032, 0.05, 0.014), hd, _PM(0.072, hy + 0.098, 0.082, 0.45, 0, -0.45)); }
    if (style === 'short' || style === 'side' || style === 'crew') for (const sd of [1, -1]) add(RB(0.012, 0.034, 0.02, 0.005), hair, _PM(sd * 0.105, hy + 0.012, 0.03)); // 鬢角
    if (style === 'short') add(RB(0.15, 0.035, 0.06, 0.015), hair, _PM(0, hy + 0.11, 0.066, 0.4));
    if (style === 'long' || style === 'bob' || style === 'pony' || style === 'bun') add(RB(0.19, 0.04, 0.055, 0.018), hair, _PM(0, hy + 0.1, 0.08, 0.5)); // 瀏海
    if (style === 'long') { add(RB(0.23, 0.34, 0.075, 0.035), hair, _PM(0, hy - 0.12, -0.085)); for (const sd of [1, -1]) add(RB(0.05, 0.22, 0.06, 0.02), hair, _PM(sd * 0.112, hy - 0.06, 0.012)); }
    if (style === 'bob') add(new THREE.CylinderGeometry(0.132, 0.138, 0.16, 18, 1, true), hair, _PM(0, hy - 0.02, -0.015));
    if (style === 'bun') add(SPH(0.058, 12, 10), hair, _PM(0, hy + 0.12, -0.085));
    if (style === 'pony') { add(SPH(0.03, 8, 6), '#c0392b', _PM(0, hy + 0.05, -0.122)); add(new THREE.CapsuleGeometry(0.038, 0.16, 4, 10), hair, _PM(0, hy - 0.06, -0.15, 0.32)); }
  }
  /* --- 背包：貼背、圓角、背帶 --- */
  if (o.pack) { const pc = o.pack === true ? '#c2452f' : o.pack; add(RB(0.27, 0.34, 0.12, 0.045, 3), pc, _PM(0, 1.215, -0.19)); add(RB(0.2, 0.12, 0.05, 0.02), _shade(pc, 0.78), _PM(0, 1.11, -0.255)); add(RB(0.08, 0.025, 0.04, 0.01), _shade(pc, 0.7), _PM(0, 1.4, -0.16));
    for (const sd of [1, -1]) { add(RB(0.026, 0.2, 0.01, 0.004), _shade(pc, 0.6), _PM(sd * 0.09 * sw, 1.32, 0.126, 0.18)); add(RB(0.034, 0.16, 0.02, 0.006), _shade(pc, 0.75), _PM(sd * 0.09 * sw, 1.405, 0.0, 1.4)); } }

  { const HS = 1.12, hc = new V3(0, 1.53, 0), M = new THREE.Matrix4().makeTranslation(hc.x, hc.y, hc.z).multiply(new THREE.Matrix4().makeScale(HS, HS, HS)).multiply(new THREE.Matrix4().makeTranslation(-hc.x, -hc.y, -hc.z)); for (const p of P) if (p[2].elements[13] > 1.53) p[2] = M.clone().multiply(p[2]); }
  const g = new THREE.Group(), body = new THREE.Mesh(mergeGeos(P), mPerson); body.castShadow = !!o.shadow; g.add(body);
  const limb = (px, py, segs) => { const pv = new THREE.Group(); pv.position.set(px, py, 0); g.add(pv); const m = new THREE.Mesh(mergeGeos(segs), mPerson); m.castShadow = !!o.shadow; pv.add(m); return pv; };
  /* --- 手臂：上臂＋短袖或長袖，前臂＋手掌拇指 --- */
  const ar = female ? 0.9 : 1;
  const arm = sd => {
    const segU = sleeve ? [[LIMB(0.3, 0.062 * ar, 0.05 * ar), top, _PM(0, 0.02, 0)]] : [[new THREE.CylinderGeometry(0.06 * ar, 0.066 * ar, 0.17, 14), top, _PM(-0.012 * (1), -0.05, 0, 0, 0, 0)], [LIMB(0.28, 0.049 * ar, 0.044 * ar), skin, _PM(0, -0.0, 0)]];
    const up = limb(sd * 0.215 * sw, 1.405, segU); const lo = new THREE.Group(); lo.position.set(0, -0.28, 0); up.add(lo);
    const segL = [[LIMB(0.235, 0.047 * ar, 0.036 * ar), sleeve ? top : skin, _PM(0, 0.01, 0)]]; if (sleeve) segL.push([LIMB(0.04, 0.037 * ar, 0.035 * ar), skin, _PM(0, -0.215, 0)]);
    segL.push([RB(0.052 * ar, 0.082, 0.032, 0.014), skin, _PM(0, -0.29, 0.004)], [new THREE.CapsuleGeometry(0.012, 0.032, 3, 6), skin, _PM(sd * -0.03, -0.268, 0.016, 0.3, 0, sd * 0.5)]);
    const m = new THREE.Mesh(mergeGeos(segL), mPerson); m.castShadow = !!o.shadow; lo.add(m); up.lo = lo; return up; };
  /* --- 腿：大腿、小腿、圓頭鞋＋白鞋底 --- */
  const leg = sd => {
    const thigh = shorts ? [[LIMB(0.2, 0.094, 0.088), pants, _PM(0, 0.02, 0)], [LIMB(0.43, 0.068, 0.058), skin, _PM(0, -0.0, 0)]] : [[LIMB(0.44, female ? 0.082 : 0.088, female ? 0.058 : 0.064), skirt ? skin : pants, _PM(0, 0.02, 0)]];
    const up = limb(sd * 0.092 * sw, 0.92, thigh); const lo = new THREE.Group(); lo.position.set(0, -0.42, 0); up.add(lo);
    const shin = skirt || shorts ? skin : pants, segL = [[LIMB(0.42, skirt || shorts ? 0.056 : 0.064, skirt || shorts ? 0.04 : 0.052), shin, _PM(0, 0.045, 0)]];
    segL.push([RB(0.1, 0.08, 0.24, 0.035, 3), shoe, _PM(0, -0.425, 0.04)], [RB(0.106, 0.026, 0.252, 0.012), '#f2f0ea', _PM(0, -0.467, 0.04)], [RB(0.07, 0.012, 0.06, 0.005), _shade(shoe, 0.75), _PM(0, -0.385, 0.075, -0.25)]);
    const m = new THREE.Mesh(mergeGeos(segL), mPerson); m.castShadow = !!o.shadow; lo.add(m); up.lo = lo; return up; };
  const armL = arm(1), armR = arm(-1), legL = leg(1), legR = leg(-1);
  g.scale.setScalar(H);
  return { group: g, body, legL, legR, armL, armR, female };
}
