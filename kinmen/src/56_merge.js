/* =====================================================================
   街區合併繪圖＋貼圖集（參考《臺北狂飆》的做法，程式自寫）
   一個市鎮範圍內所有「不會動」的房子零件（牆、屋頂、立面、招牌、水塔、路燈…）
   原本是每種零件 × 每種材質各一道繪圖指令；這裡把它們烘成少數幾個大模型，
   所有貼圖收進一組「貼圖陣列」（每層一張，可重複鋪貼、有正確的 mipmap），
   小招牌再拼成共用的貼圖集。粗糙度、金屬度、夜間燈光都改成頂點資料，
   所以整個街區只需要一種材質。
   ?nomerge 關閉；?mergeall 全島市鎮都合併（測試用）。
   ===================================================================== */
const MRG = { on: !/nomerge/.test(location.search), all: /mergeall/.test(location.search), towns: ['金城鎮', '金寧鄉', '金湖鎮', '金沙鎮', '烈嶼鄉'], cell: 260, size: /msize=512/.test(location.search) || matchMedia('(pointer: coarse)').matches ? 512 : 1024, meshes: [], src: [], stat: null, u: null };
const MRG_SKIP = /^(nat_|leaf$|pine$|trunk$|pool$|stalk$|spike$)/; // 樹（擋鏡頭時要個別隱藏）、半透明光暈、高粱田

function mergeTowns() {
  if (!MRG.on) return; const t0 = performance.now();
  const regs = townPolys.filter(t => MRG.all || MRG.towns.includes(t.name)).map(t => { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const r of t.rings) for (const p of r) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); } return { name: t.name, rings: t.rings, x0, z0, x1, z1, cells: new Map(), n: 0 }; });
  if (!regs.length) return;
  const regAt = (x, z) => { for (const r of regs) { if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue; for (const g of r.rings) if (inRing(g, x, z)) return r; } return null; }; // 只認鄉鎮界線內（室內場景放在很遠的地方，不能算進來）
  const EG = new Map(typeof mAd !== 'undefined' ? [[mAd, 1], [mStand, 0.9]] : []), TLS = new Set(typeof TL !== 'undefined' && TL.sg ? TL.sg.flatMap(q => [q[0], q[1]]) : []);
  const WIN = new Set([mFacade, mShop2, mShop3, ...FACV]), defOBC = THREE.Material.prototype.onBeforeCompile;
  const imgW = im => im.naturalWidth || im.videoWidth || im.width || 0, imgH = im => im.naturalHeight || im.videoHeight || im.height || 0;
  const okT = t => !t || (t.isTexture && !t.isCompressedTexture && !t.isDataTexture && t.image && !t.image.data && imgW(t.image) > 1 && t.rotation === 0 && t.flipY);
  /* ---- 哪些材質可以併進來 ---- */
  const MI = new Map();
  const matInfo = m => { if (MI.has(m)) return MI.get(m); let r = null;
    if (m && m.isMeshStandardMaterial && !m.isMeshPhysicalMaterial && (!(m.transparent || m.alphaTest) || (m.map && m.blending === THREE.NormalBlending)) && m.opacity === 1 && m.visible && !m.wireframe && !m.flatShading && !m.alphaMap && !m.aoMap && !m.lightMap && !m.bumpMap && !m.displacementMap && !m.roughnessMap && !m.metalnessMap && !m.envMap && m.depthTest && m.depthWrite && !m.polygonOffset && m.side !== THREE.BackSide && (m.onBeforeCompile === defOBC || m === mFacade) && !m.userData.noMerge) {
      let g = 0, es = 0, em = null, ok = okT(m.map) && okT(m.normalMap); const lit = m.emissive.r + m.emissive.g + m.emissive.b > 0;
      if (m === mSign) { g = 2; es = 1; em = 'base'; } // 招牌：夜間自發光用同一張圖
      else if (m === mGlow) { g = 3; es = 1; } // 路燈燈頭
      else if (WIN.has(m)) { g = 1; es = 1; em = m.emissiveMap; ok = ok && !!em && okT(em); } // 窗燈
      else if (m.emissiveMap && m.emissiveMap === m.map && EG.has(m)) { g = 4; es = EG.get(m); em = 'base'; } // 廣告看板：白天微亮、晚上亮（updateAds 調整）
      else if (m.emissiveMap) ok = false; // 不認得的發光貼圖（可能有自己的動畫）→ 不併
      else if (lit && m.emissiveIntensity > 0) es = Math.min(8, m.emissiveIntensity); // 固定亮度
      if (ok) r = { m, map: m.map || null, nrm: m.normalMap || null, ns: m.normalMap ? m.normalScale.x : 0, em, g, es, ec: es ? m.emissive : null, rough: m.roughness, metal: m.metalness, col: m.color, vc: m.vertexColors, dbl: m.side === THREE.DoubleSide, cut: !!(m.transparent || m.alphaTest), grime: m === mFacade && !!m.userData.grime };
    }
    MI.set(m, r); return r; };
  /* ---- 收集零件 ---- */
  const UVB = new Map(), uvBounds = g => { let b = UVB.get(g); if (!b) { b = [0, 0, 0, 0]; const u = g.attributes.uv; if (u) { b = [1e9, 1e9, -1e9, -1e9]; for (let i = 0; i < u.count; i++) { const x = u.getX(i), y = u.getY(i); if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; } } UVB.set(g, b); } return b; };
  const TEX = new Map(); // 貼圖來源 → { img, tile（要獨占一層）, layer, rect }
  const useTex = (t, geo, force) => { let e = TEX.get(t.source); if (!e) TEX.set(t.source, e = { img: t.image, tile: false, layer: -1, rect: null }); if (!e.tile) { t.updateMatrix(); const m = t.matrix.elements, b = uvBounds(geo), us = [b[0] * m[0] + m[6], b[2] * m[0] + m[6]], vs = [b[1] * m[4] + m[7], b[3] * m[4] + m[7]]; if (force || Math.min(imgW(e.img), imgH(e.img)) > MRG.size * 0.75 || Math.min(...us) < -0.002 || Math.max(...us) > 1.002 || Math.min(...vs) < -0.002 || Math.max(...vs) > 1.002) e.tile = true; } return e; };
  const NT = new Map(), ET = new Map(), items = []; let nInst = 0, nMesh = 0, removed = 0;
  const push = (reg, geo, M, mi, col, cast, at) => { if (!geo.attributes.position || !geo.attributes.position.count) return false; if (mi.map && !geo.attributes.uv) return false;
    const k = Math.floor((at ? at.x : M.elements[12]) / MRG.cell) + ',' + Math.floor((at ? at.z : M.elements[14]) / MRG.cell) + (mi.dbl ? 'd' : '') + (mi.cut ? 'a' : cast ? 'c' : ''); let c = reg.cells.get(k); if (!c) reg.cells.set(k, c = { items: [], nv: 0, ni: 0, dbl: mi.dbl, cut: mi.cut, cast: cast && !mi.cut });
    if (mi.map) useTex(mi.map, geo, !!(mi.nrm || (mi.em && mi.em !== 'base'))); if (mi.nrm && !NT.has(mi.nrm.source)) NT.set(mi.nrm.source, { img: mi.nrm.image, layer: NT.size }); if (mi.em && mi.em !== 'base' && !ET.has(mi.em.source)) ET.set(mi.em.source, { img: mi.em.image, layer: ET.size });
    c.items.push([geo, M, mi, col]); c.nv += geo.attributes.position.count; c.ni += geo.index ? geo.index.count : geo.attributes.position.count; reg.n++; return true; };
  const M4 = new THREE.Matrix4(), C = new THREE.Color();
  for (const o of scene.children.slice()) {
    if (o.isInstancedMesh) { if (!o.userData.batch || MRG_SKIP.test(o.name) || Array.isArray(o.material)) continue; const mi = matInfo(o.material); if (!mi) continue; o.updateMatrixWorld();
      const keep = []; for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, M4); const W = M4.clone().premultiply(o.matrixWorld), reg = regAt(W.elements[12], W.elements[14]); let col = null; if (reg && o.instanceColor) { o.getColorAt(i, C); col = C.clone(); }
        if (reg && push(reg, o.geometry, W, mi, col, o.castShadow)) nInst++; else keep.push(i); }
      if (keep.length === o.count) continue; removed++;
      if (!keep.length) { scene.remove(o); continue; }
      keep.forEach((s, d) => { if (s === d) return; o.getMatrixAt(s, M4); o.setMatrixAt(d, M4); if (o.instanceColor) { o.getColorAt(s, C); o.setColorAt(d, C); } }); o.count = keep.length; o.instanceMatrix.needsUpdate = true; if (o.instanceColor) o.instanceColor.needsUpdate = true; o.boundingSphere = null; o.boundingBox = null; o.computeBoundingSphere(); continue; }
    if (navigator.webdriver && o.isMesh && !o.isInstancedMesh) { o.updateMatrixWorld(); const g0 = o.geometry; if (!g0.boundingSphere) g0.computeBoundingSphere(); const c0 = g0.boundingSphere.center.clone().applyMatrix4(o.matrixWorld); if (regAt(c0.x, c0.z)) { const m = o.material, why = o.isSkinnedMesh ? 'skin' : o.children.length ? 'kids' : !o.visible ? 'hidden' : !o.frustumCulled ? 'nofc' : o.userData.noCull ? 'nocull' : o.userData.noMerge ? 'nomerge' : o.name ? 'name' : Array.isArray(m) ? 'arr' : o.renderOrder ? 'ro' : !matInfo(m) ? 'mat:' + m.type + (m.transparent ? '+tr' : '') + (m.alphaTest ? '+at' : '') + (m.map && !okT(m.map) ? '+badmap' : '') + (m.emissiveMap ? '+em' : '') + (m.polygonOffset ? '+po' : '') + (m.depthWrite ? '' : '+nodw') + (m.side === THREE.BackSide ? '+back' : '') + (m.onBeforeCompile !== defOBC ? '+obc' : '') : 'ok'; const k = g0.type + ' ' + why; (MRG.why || (MRG.why = {}))[k] = (MRG.why[k] || 0) + 1; } }
    if (!o.isMesh || o.isSkinnedMesh || o.children.length || (!o.visible && !TLS.has(o)) || !o.frustumCulled || o.userData.noCull || o.userData.noMerge || o.name || Array.isArray(o.material) || o.renderOrder || o.morphTargetInfluences) continue;
    const mi = matInfo(o.material); if (!mi) continue; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (g.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) > 60) continue; // 地形、道路這類大模型不動
    o.updateMatrixWorld(); const ctr = g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld), reg = Math.abs(ctr.x) + Math.abs(ctr.z) < 2 ? null : regAt(ctr.x, ctr.z); if (!reg) continue; // 原點的是還沒擺出去的樣板模型
    if (!push(reg, g, o.matrixWorld.clone(), mi, null, o.castShadow, ctr)) continue;
    nMesh++; MRG.src.push({ o, m: o.matrixWorld.clone(), mat: o.material, tl: TLS.has(o) }); scene.remove(o);
  }
  if (!nInst && !nMesh) return;
  if (TLS.size) TL.sg = TL.sg.filter(q => q[0].parent || q[1].parent); // 路名、村名牌併進街區後一直顯示，不用再靠近才打開
  if (navigator.webdriver) { const set = new Set(MRG.src.map(s => s.o)), rm = scene.remove.bind(scene); MRG.rm = []; scene.remove = (...a) => { for (const o of a) if (set.has(o)) MRG.rm.push(o); return rm(...a); }; } // 測試時記錄：被併掉的東西事後有沒有被遊戲拿掉
  /* ---- 貼圖陣列：要重複鋪貼或大張的各占一層，小張（招牌）拼進共用層 ---- */
  const S = MRG.size, cv = document.createElement('canvas'), layers = []; cv.width = cv.height = S; const g2 = cv.getContext('2d', { willReadFrequently: true });
  const grab = (size, draw) => { if (cv.width !== size) cv.width = cv.height = size; g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, size, size); draw(g2, size); const d = g2.getImageData(0, 0, size, size).data, o = new Uint8Array(size * size * 4), row = size * 4; for (let y = 0; y < size; y++) o.set(d.subarray(y * row, y * row + row), (size - 1 - y) * row); return o; }; // 上下顛倒：資料貼圖第 0 列在下面
  const pack = [...TEX.values()].filter(e => !e.tile).map(e => { const w = imgW(e.img), h = imgH(e.img), k = Math.min(S < 1000 ? 0.7 : 1, (S - 8) / Math.max(w, h)); /* 手機招牌縮到 0.7 倍省記憶體 */ e.w = Math.max(4, Math.round(w * k)); e.h = Math.max(4, Math.round(h * k)); return e; }).sort((a, b) => b.h - a.h);
  for (const e of TEX.values()) if (e.tile) { e.layer = layers.length; layers.push(grab(S, (g, s) => g.drawImage(e.img, 0, 0, s, s))); }
  { const G = 4; let sheet = null; const sheets = []; for (const e of pack) { let put = false; for (const sh of sheets) { if (sh.x + e.w + G * 2 > S) { sh.x = 0; sh.y += sh.rowH; sh.rowH = 0; } if (sh.y + e.h + G * 2 <= S) { e.sh = sh; e.px = sh.x + G; e.py = sh.y + G; sh.x += e.w + G * 2; sh.rowH = Math.max(sh.rowH, e.h + G * 2); sh.list.push(e); put = true; break; } } if (!put) { sheet = { x: e.w + G * 2, y: 0, rowH: e.h + G * 2, list: [e] }; e.sh = sheet; e.px = G; e.py = G; sheets.push(sheet); } }
    for (const sh of sheets) { const L = layers.length; layers.push(grab(S, g => { for (const e of sh.list) { g.drawImage(e.img, e.px - G, e.py - G, e.w + G * 2, e.h + G * 2); g.drawImage(e.img, e.px, e.py, e.w, e.h); } })); for (const e of sh.list) { e.layer = L; e.rect = [e.px / S, (S - e.py - e.h) / S, e.w / S, e.h / S]; } }
    MRG.sheets = sheets.length; }
  const arrTex = (list, size, srgb) => { const n = Math.max(1, list.length), data = new Uint8Array(size * size * 4 * n); list.forEach((d, i) => data.set(d, i * size * size * 4)); const t = new THREE.DataArrayTexture(data, size, size, n); t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.anisotropy = 8; t.needsUpdate = true; return t; };
  const NS = Math.min(S, 512), ES = 256, tMap = arrTex(layers, S, true), tNrm = arrTex([...NT.values()].map(e => grab(NS, (g, s) => g.drawImage(e.img, 0, 0, s, s))), NS, false), tEm = arrTex([...ET.values()].map(e => grab(ES, (g, s) => { g.fillStyle = '#000'; g.fillRect(0, 0, s, s); g.drawImage(e.img, 0, 0, s, s); })), ES, true);
  /* ---- 材質：一種就夠 ---- */
  const U = MRG.u = { mMap: { value: tMap }, mNrm: { value: tNrm }, mEm: { value: tEm }, mGrime: { value: mFacade.userData.grime || null }, mEI: { value: new THREE.Vector4() } };
  const mk = (side, cut) => { const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, side, alphaTest: cut ? 0.5 : 0 });
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, U);
      sh.vertexShader = 'attribute vec4 aCol;\nattribute vec4 aLay;\nattribute vec4 aPbr;\nattribute vec4 aEc;\nvarying vec3 vMC;\nvarying vec4 vLay;\nvarying vec4 vPbr;\nvarying vec3 vEc;\nvarying vec2 vMUv;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vMUv = uv; vLay = aLay; vPbr = aPbr; vEc = aEc.rgb; vMC = mix(aCol.rgb / 12.92, pow((aCol.rgb + 0.055) / 1.055, vec3(2.4)), step(0.04045, aCol.rgb));');
      sh.fragmentShader = 'uniform mediump sampler2DArray mMap;\nuniform mediump sampler2DArray mNrm;\nuniform mediump sampler2DArray mEm;\nuniform sampler2D mGrime;\nuniform vec4 mEI;\nvarying vec3 vMC;\nvarying vec4 vLay;\nvarying vec4 vPbr;\nvarying vec3 vEc;\nvarying vec2 vMUv;\n' + sh.fragmentShader
        .replace('#include <map_fragment>', '  vec4 mT4 = vec4(1.0);\n  if (vLay.x < 254.5) mT4 = texture(mMap, vec3(vMUv, floor(vLay.x + 0.5)));\n  vec3 mTex = mT4.rgb;\n  diffuseColor.rgb *= mTex * vMC;\n' + (cut ? '  diffuseColor.a *= mT4.a;\n' : '') + '  float mFlag = floor(vLay.w + 0.5);\n' + (U.mGrime.value ? '  if (mFlag > 7.5) diffuseColor.rgb *= mix(0.78, 1.0, smoothstep(0.0, 0.18, fract(vMUv.y))) * (0.9 + 0.1 * texture(mGrime, vMUv * 0.37).r);\n' : ''))
        .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vPbr.x;')
        .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vPbr.y;')
        .replace('#include <normal_fragment_maps>', '  if (vLay.y > 0.5) {\n    vec3 mapN = texture(mNrm, vec3(vMUv, floor(vLay.y - 0.5))).xyz * 2.0 - 1.0; mapN.xy *= vPbr.w * 2.0;\n    vec3 q0 = dFdx(-vViewPosition), q1 = dFdy(-vViewPosition); vec2 st0 = dFdx(vMUv), st1 = dFdy(vMUv);\n    vec3 q1p = cross(q1, normal), q0p = cross(normal, q0); vec3 mT = q1p * st0.x + q0p * st1.x, mB = q1p * st0.y + q0p * st1.y;\n    float mDet = max(dot(mT, mT), dot(mB, mB)); float mSc = mDet == 0.0 ? 0.0 : inversesqrt(mDet);\n    normal = normalize(mat3(mT * mSc, mB * mSc, normal) * mapN);\n  }')
        .replace('#include <emissivemap_fragment>', '  {\n    float mg = mod(mFlag, 8.0); float mei = (mg < 0.5 ? 1.0 : mg < 1.5 ? mEI.x : mg < 2.5 ? mEI.y : mg < 3.5 ? mEI.z : mEI.w) * vPbr.z * 8.0;\n    vec3 me = vEc; if (vLay.z > 254.5) me *= mTex; else if (vLay.z > 0.5) me *= texture(mEm, vec3(vMUv, floor(vLay.z - 0.5))).rgb;\n    totalEmissiveRadiance = me * mei;\n  }'); };
    m.customProgramCacheKey = () => 'mrg' + side + (cut ? 'a' : '') + (U.mGrime.value ? 'g' : ''); return m; };
  const MATS = {}, matFor = (dbl, cut) => { const k = (dbl ? 'd' : 'f') + (cut ? 'a' : ''); return MATS[k] || (MATS[k] = mk(dbl ? THREE.DoubleSide : THREE.FrontSide, cut)); };
  /* ---- 幾何：每個市鎮切成幾格，每格一個模型 ---- */
  const N3 = new THREE.Matrix3(), sr = new THREE.Color(), u8 = v => Math.max(0, Math.min(255, Math.round(v * 255))); let tris = 0, verts = 0;
  for (const reg of regs) for (const c of reg.cells.values()) {
    const pos = new Float32Array(c.nv * 3), nor = new Int8Array(c.nv * 4), uv = new Float32Array(c.nv * 2), col = new Uint8Array(c.nv * 4), lay = new Uint8Array(c.nv * 4), pbr = new Uint8Array(c.nv * 4), ec = new Uint8Array(c.nv * 4), idx = new Uint32Array(c.ni); let vo = 0, io = 0;
    for (const [geo, M, mi, icol] of c.items) { const P = geo.attributes.position, Nn = geo.attributes.normal || (geo.computeVertexNormals(), geo.attributes.normal), Uv = geo.attributes.uv, Gc = mi.vc ? geo.attributes.color : null, n = P.count, e = M.elements; N3.getNormalMatrix(M); const ne = N3.elements, flip = M.determinant() < 0;
      const te = mi.map ? TEX.get(mi.map.source) : null, tm = mi.map ? (mi.map.updateMatrix(), mi.map.matrix.elements) : null, rc = te && te.rect;
      const L0 = te ? te.layer : 255, L1 = mi.nrm ? NT.get(mi.nrm.source).layer + 1 : 0, L2 = mi.em === 'base' ? 255 : mi.em ? ET.get(mi.em.source).layer + 1 : 0, L3 = mi.g + (mi.grime ? 8 : 0);
      const br = mi.col.r * (icol ? icol.r : 1), bg = mi.col.g * (icol ? icol.g : 1), bb = mi.col.b * (icol ? icol.b : 1), R = u8(mi.rough), Mt = u8(mi.metal), Es = u8(mi.es / 8), Ns = u8(mi.ns / 2); let er = 0, eg = 0, eb = 0; if (mi.ec) { er = u8(mi.ec.r); eg = u8(mi.ec.g); eb = u8(mi.ec.b); }
      let cr = 0, cg = 0, cb = 0; if (!Gc) { sr.setRGB(br, bg, bb).convertLinearToSRGB(); cr = u8(sr.r); cg = u8(sr.g); cb = u8(sr.b); }
      for (let i = 0; i < n; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), v = vo + i, v3 = v * 3, v4 = v * 4;
        pos[v3] = e[0] * x + e[4] * y + e[8] * z + e[12]; pos[v3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; pos[v3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
        const nx = Nn.getX(i), ny = Nn.getY(i), nz = Nn.getZ(i); let ax = ne[0] * nx + ne[3] * ny + ne[6] * nz, ay = ne[1] * nx + ne[4] * ny + ne[7] * nz, az = ne[2] * nx + ne[5] * ny + ne[8] * nz; const l = Math.hypot(ax, ay, az) || 1; nor[v4] = Math.round(ax / l * 127); nor[v4 + 1] = Math.round(ay / l * 127); nor[v4 + 2] = Math.round(az / l * 127);
        if (Uv) { let a = Uv.getX(i), b = Uv.getY(i); if (tm) { const a2 = tm[0] * a + tm[3] * b + tm[6]; b = tm[1] * a + tm[4] * b + tm[7]; a = a2; } if (rc) { a = rc[0] + Math.max(0, Math.min(1, a)) * rc[2]; b = rc[1] + Math.max(0, Math.min(1, b)) * rc[3]; } uv[v * 2] = a; uv[v * 2 + 1] = b; }
        if (Gc) { sr.setRGB(br * Gc.getX(i), bg * Gc.getY(i), bb * Gc.getZ(i)).convertLinearToSRGB(); cr = u8(sr.r); cg = u8(sr.g); cb = u8(sr.b); } col[v4] = cr; col[v4 + 1] = cg; col[v4 + 2] = cb; col[v4 + 3] = 255;
        lay[v4] = L0; lay[v4 + 1] = L1; lay[v4 + 2] = L2; lay[v4 + 3] = L3; pbr[v4] = R; pbr[v4 + 1] = Mt; pbr[v4 + 2] = Es; pbr[v4 + 3] = Ns; ec[v4] = er; ec[v4 + 1] = eg; ec[v4 + 2] = eb; }
      const I = geo.index, ni = I ? I.count : n; for (let i = 0; i < ni; i += 3) { const a = vo + (I ? I.getX(i) : i), b = vo + (I ? I.getX(i + 1) : i + 1), d = vo + (I ? I.getX(i + 2) : i + 2); idx[io + i] = a; idx[io + i + 1] = flip ? d : b; idx[io + i + 2] = flip ? b : d; }
      vo += n; io += ni; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 4, true)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 4, true)); g.setAttribute('aLay', new THREE.BufferAttribute(lay, 4, false)); g.setAttribute('aPbr', new THREE.BufferAttribute(pbr, 4, true)); g.setAttribute('aEc', new THREE.BufferAttribute(ec, 4, true)); g.setIndex(new THREE.BufferAttribute(c.nv > 65535 ? idx : new Uint16Array(idx), 1)); g.computeBoundingSphere(); g.computeBoundingBox();
    const mesh = new THREE.Mesh(g, matFor(c.dbl, c.cut)); mesh.name = 'town:' + reg.name; mesh.castShadow = c.cast; mesh.receiveShadow = true; mesh.userData.noCull = true; mesh.matrixAutoUpdate = false; mesh.onBeforeRender = () => MRG.tick(); scene.add(mesh); MRG.meshes.push(mesh); tris += io / 3; verts += vo; c.items = null; }
  MRG.tick = () => U.mEI.value.set(mFacade.emissiveIntensity, mSign.emissiveIntensity, mGlow.emissiveIntensity, typeof mAd !== 'undefined' ? mAd.emissiveIntensity : 0); MRG.tick();
  MRG.tileSizes = [...TEX.values()].filter(e => e.tile).map(e => imgW(e.img) + 'x' + imgH(e.img)); MRG.packSizes = pack.map(e => imgW(e.img) + 'x' + imgH(e.img));
  MRG.stat = { towns: regs.map(r => r.name + ':' + r.n), meshes: MRG.meshes.length, tris, verts, inst: nInst, plain: nMesh, batchesTouched: removed, layers: layers.length, sheets: MRG.sheets, packed: pack.length, nrm: NT.size, emis: ET.size, size: S, texMB: Math.round((layers.length * S * S + Math.max(1, NT.size) * NS * NS + Math.max(1, ET.size) * ES * ES) * 4 * 1.33 / 1048576), ms: Math.round(performance.now() - t0) };
}
/* 測試用：被併掉的獨立模型事後有沒有被遊戲邏輯移動、隱藏或加回場景（有的話代表它其實會動，不該併） */
function mergeCheck() { const bad = []; for (const s of MRG.src) { const o = s.o; o.updateMatrixWorld(); const rmv = MRG.rm && MRG.rm.includes(o); if (rmv || o.parent || (!o.visible && !s.tl) || o.material !== s.mat || !o.matrixWorld.equals(s.m)) bad.push([+s.m.elements[12].toFixed(1), +s.m.elements[14].toFixed(1), o.geometry.type, rmv ? 'removed' : o.parent ? 'readded' : !o.visible ? 'hidden' : o.material !== s.mat ? 'mat' : 'moved']); } return { checked: MRG.src.length, bad }; }
