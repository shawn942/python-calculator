/* =====================================================================
   寫實立面：用實拍灰泥／紅磚當底，再畫上內凹窗、玻璃反光、窗台陰影、雨痕、冷氣機、
   洋樓百葉窗與拱廊。版面（窗戶格位）與原本相同，夜間窗燈貼圖仍然對得上。
   ===================================================================== */
function repaintFacades() {
  if (!PHOTO.img.plaster) return; const hsh = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
  const plaster = photoGray('plaster', 236, 1.7, 512).image;
  const glass = (g, x, y, w, h, lit) => { const gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, lit ? '#8fb0c8' : '#6d8aa0'); gr.addColorStop(0.55, '#34485a'); gr.addColorStop(1, '#1e2a36'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = 'rgba(255,255,255,0.13)'; g.beginPath(); g.moveTo(x + w * 0.1, y + h); g.lineTo(x + w * 0.55, y); g.lineTo(x + w * 0.8, y); g.lineTo(x + w * 0.35, y + h); g.fill(); g.restore();
    const sh = g.createLinearGradient(x, y, x, y + 9); sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(x, y, w, 9); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x, y, 3, h); };
  { // ---- 一般樓房：4×4 扇窗 ----
    const c = facadeTex.image; c.width = c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#f1ece1'; g.fillRect(0, 0, 512, 512); g.globalCompositeOperation = 'multiply'; g.drawImage(plaster, 0, 0, 512, 512); g.globalCompositeOperation = 'source-over';
    for (let r = 0; r < 4; r++) { // 樓板線＋陰影
      const by = r * 128 + 118; g.fillStyle = '#d8d2c4'; g.fillRect(0, by, 512, 7); const sh = g.createLinearGradient(0, by + 7, 0, by + 20); sh.addColorStop(0, 'rgba(0,0,0,0.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(0, by + 7, 512, 13);
      for (let k = 0; k < 4; k++) { const x = k * 128 + 24, y = r * 128 + 28, w = 80, h = 68, rnd = hsh(r, k);
        const st = g.createLinearGradient(0, y + h + 8, 0, y + h + 46); st.addColorStop(0, 'rgba(60,50,40,0.22)'); st.addColorStop(1, 'rgba(60,50,40,0)'); g.fillStyle = st; g.fillRect(x + 6, y + h + 8, 10, 38); g.fillRect(x + w - 16, y + h + 8, 8, 30); // 雨痕
        g.fillStyle = '#cfc8b8'; g.fillRect(x - 6, y - 6, w + 12, h + 12); g.fillStyle = '#e9e4d8'; g.fillRect(x - 6, y - 6, w + 12, 3); glass(g, x, y, w, h, rnd > 0.6);
        if (rnd < 0.35) { g.fillStyle = `rgba(${rnd < 0.18 ? '236,226,200' : '205,215,222'},0.82)`; g.fillRect(x + 3, y + 3, w * (0.3 + rnd), h - 3); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(x + 6 + i * 6, y + 3, 2, h - 3); } } // 窗簾
        g.fillStyle = '#ded8ca'; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * 0.36, w, 3);
        g.fillStyle = '#e4dfd2'; g.fillRect(x - 10, y + h + 4, w + 20, 6); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x - 8, y + h + 10, w + 16, 4); // 窗台
        if ((r * 7 + k * 5) % 6 === 1) { const ax = x + 14, ay = y + h + 14; g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(ax + 3, ay + 4, 46, 20); g.fillStyle = '#c3c6c6'; g.fillRect(ax, ay, 46, 20); g.fillStyle = '#8f9496'; for (let i = 0; i < 5; i++) g.fillRect(ax + 4, ay + 3 + i * 3.4, 24, 1.4); g.beginPath(); g.arc(ax + 37, ay + 10, 6, 0, 6.28); g.fill(); } } }
    facadeTex.needsUpdate = true; }
  { // ---- 洋樓／騎樓：下層拱廊、上層百葉窗 ----
    const c = arcadeTex.image; c.width = c.height = 512; const g = c.getContext('2d'); for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 3; tx++) g.drawImage(brickTex.image, tx * 171, ty * 171, 172, 172); g.fillStyle = 'rgba(120,40,25,0.14)'; g.fillRect(0, 0, 512, 512);
    const band = (y, h) => { g.fillStyle = '#ebe2d0'; g.fillRect(0, y, 512, h); g.globalCompositeOperation = 'multiply'; g.drawImage(plaster, 0, y, 512, h, 0, y, 512, h); g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, y, 512, 2); const sh = g.createLinearGradient(0, y + h, 0, y + h + 12); sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(0, y + h, 512, 12); };
    band(0, 14); band(244, 16);
    for (let k = 0; k < 2; k++) { const x = k * 256;
      const arch = (inset, r, top) => { g.beginPath(); g.moveTo(x + 128 - r, 512); g.lineTo(x + 128 - r, top); g.arc(x + 128, top, r, Math.PI, 0); g.lineTo(x + 128 + r, 512); g.closePath(); };
      g.fillStyle = '#ebe2d0'; arch(0, 92, 380); g.fill(); g.save(); arch(0, 92, 380); g.clip(); g.globalCompositeOperation = 'multiply'; g.drawImage(plaster, 0, 256, 256, 256, x, 256, 256, 256); g.restore(); g.globalCompositeOperation = 'source-over';
      const dk = g.createLinearGradient(0, 300, 0, 512); dk.addColorStop(0, '#0f0c0a'); dk.addColorStop(0.6, '#241d18'); dk.addColorStop(1, '#3a3028'); g.fillStyle = dk; arch(0, 76, 384); g.fill();
      g.save(); arch(0, 76, 384); g.clip(); g.fillStyle = 'rgba(255,214,150,0.16)'; g.fillRect(x + 70, 430, 116, 82); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x + 52, 300, 14, 212); g.restore(); // 店內微光＋拱內側陰影
      g.fillStyle = '#f3ecdc'; g.beginPath(); g.moveTo(x + 118, 288); g.lineTo(x + 138, 288); g.lineTo(x + 134, 312); g.lineTo(x + 122, 312); g.fill(); // 拱心石
      for (const wx of [60, 152]) { const X = x + wx, Y = 68, W = 44, H = 124; g.fillStyle = '#ebe2d0'; g.fillRect(X - 9, Y - 9, W + 18, H + 18); g.beginPath(); g.arc(X + W / 2, Y - 9, W / 2 + 9, Math.PI, 0); g.fill(); glass(g, X, Y, W, H, false);
        const open = hsh(k, wx) > 0.45; for (const sd of [0, 1]) { const sx = open ? (sd ? X + W + 1 : X - W / 2 - 1) : X + sd * W / 2, sw = W / 2; g.fillStyle = '#2f6b55'; g.fillRect(sx, Y, sw, H); g.fillStyle = 'rgba(0,0,0,0.28)'; for (let i = 0; i < 15; i++) g.fillRect(sx + 3, Y + 5 + i * 8, sw - 6, 3); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(sx, Y, 2, H); } // 綠色百葉窗
        g.fillStyle = '#e4dccb'; g.fillRect(X - 14, Y + H + 9, W + 28, 7); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(X - 12, Y + H + 16, W + 24, 5); } }
    arcadeTex.needsUpdate = true; }
  // ---- 老街店屋（米色拱廊）：保留原版面，放大兩倍後疊上灰泥質感、陰影、玻璃反光、雨痕 ----
  for (const [m, floors] of [[typeof mShop2 !== 'undefined' ? mShop2 : null, 2], [typeof mShop3 !== 'undefined' ? mShop3 : null, 3]]) { if (!m || !m.map) continue;
    const c = m.map.image, W = 384, FH = 160, H = FH * floors + 40, old = document.createElement('canvas'); old.width = c.width; old.height = c.height; old.getContext('2d').drawImage(c, 0, 0);
    c.width = W * 2; c.height = H * 2; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(old, 0, 0, W * 2, H * 2);
    g.globalCompositeOperation = 'multiply'; for (let y = 0; y < H * 2; y += 512) for (let x = 0; x < W * 2; x += 512) g.drawImage(plaster, x, y); g.globalCompositeOperation = 'source-over'; g.scale(2, 2);
    const grad = (x, y, w, h, a0, a1, vert = true) => { const gr = vert ? g.createLinearGradient(0, y, 0, y + h) : g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, `rgba(0,0,0,${a0})`); gr.addColorStop(1, `rgba(0,0,0,${a1})`); g.fillStyle = gr; g.fillRect(x, y, w, h); };
    const bw = W / 3; grad(0, 40, W, 12, 0.3, 0); // 山牆下緣陰影
    for (let f = 0; f < floors; f++) { const y0 = 40 + (floors - 1 - f) * FH; grad(0, y0 + FH, W, 12, 0.32, 0); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, y0 + FH - 10, W, 1.5);
      for (let b = 0; b < 3; b++) { const x0 = b * bw;
        if (f === 0) { g.save(); g.beginPath(); g.moveTo(x0 + 14, y0 + FH); g.lineTo(x0 + 14, y0 + 70); g.arc(x0 + bw / 2, y0 + 70, bw / 2 - 14, Math.PI, 0); g.lineTo(x0 + bw - 14, y0 + FH); g.clip(); grad(x0 + 14, y0 + 20, bw - 28, 70, 0.75, 0); grad(x0 + 14, y0, 12, FH, 0.5, 0, false); g.fillStyle = 'rgba(255,205,140,0.13)'; g.fillRect(x0 + 34, y0 + 100, bw - 68, FH - 100); g.restore(); grad(x0 + 30, y0 + 52, bw - 60, 8, 0.25, 0); }
        else { const ww = bw - 50, wx = x0 + 25, wy = y0 + 42; g.save(); g.beginPath(); g.rect(wx + 8, wy + 8, ww - 16, FH - 80); g.clip(); const gl = g.createLinearGradient(0, wy + 8, 0, wy + FH - 72); gl.addColorStop(0, 'rgba(150,185,210,0.45)'); gl.addColorStop(0.6, 'rgba(0,0,0,0)'); gl.addColorStop(1, 'rgba(0,0,0,0.3)'); g.fillStyle = gl; g.fillRect(wx, wy, ww, FH); g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(wx + 10, wy + FH - 72); g.lineTo(wx + ww * 0.55, wy + 8); g.lineTo(wx + ww * 0.75, wy + 8); g.lineTo(wx + 30, wy + FH - 72); g.fill(); grad(wx + 8, wy + 8, ww - 16, 9, 0.5, 0); g.restore();
          grad(wx - 6, wy + FH - 58, ww + 12, 7, 0.3, 0); for (const sx of [wx + 4, wx + ww - 12]) { const st = g.createLinearGradient(0, wy + FH - 50, 0, wy + FH - 12); st.addColorStop(0, 'rgba(70,55,40,0.22)'); st.addColorStop(1, 'rgba(70,55,40,0)'); g.fillStyle = st; g.fillRect(sx, wy + FH - 50, 7, 38); } } }
      if (f === 0) { grad(18, y0 + 52, W - 36, 6, 0.35, 0); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(18, y0 + 18, W - 36, 2); } }
    for (let b = 0; b <= 3; b++) { const px = Math.min(W - 10, b * bw - 5); grad(px + 10, 40, 6, H - 40, 0.2, 0, false); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(px, 40, 1.5, H - 40); } // 壁柱的受光邊與陰影
    g.setTransform(1, 0, 0, 1, 0, 0); m.map.needsUpdate = true; }
  // ---- 使用者提供的 AI 實景立面：洋樓、公寓、店屋、廟門 ----
  const put = (tex, name) => { const im = PHOTO.img[name]; if (!im || !tex) return false; const c = tex.image; c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); tex.needsUpdate = true; return true; };
  // 夜間窗燈：把照片上「窗戶」的區塊染成暖光（鐵窗、窗簾的剪影會留著）
  const lights = (tex, name, rects) => { const im = PHOTO.img[name]; if (!im || !tex) return; const c = tex.image, W = c.width = 512, H = c.height = Math.round(512 * im.naturalHeight / im.naturalWidth), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (const [x0, y0, x1, y1, warm] of rects) { g.save(); g.beginPath(); g.rect(x0 * W, y0 * H, (x1 - x0) * W, (y1 - y0) * H); g.clip(); g.drawImage(im, 0, 0, W, H); g.globalCompositeOperation = 'lighter'; g.fillStyle = warm ? 'rgba(255,170,70,0.5)' : 'rgba(255,214,150,0.42)'; g.fillRect(0, 0, W, H); g.restore(); } tex.needsUpdate = true; };
  put(arcadeTex, 'f_yanglou');
  if (put(facadeTex, 'f_apt')) { const R = []; [[0.05, 0.165], [0.295, 0.415], [0.525, 0.645], [0.76, 0.885]].forEach(([y0, y1], r) => [[0.01, 0.215], [0.225, 0.455], [0.71, 0.995]].forEach(([x0, x1], k) => { if (hsh(r + 3, k + 7) > 0.42) R.push([x0, y0, x1, y1, hsh(r, k) > 0.5]); })); lights(facadeEmis, 'f_apt', R); }
  if (put(mShop2.map, 'f_shop2')) lights(mShop2.emissiveMap, 'f_shop2', [[0.12, 0.125, 0.325, 0.35, false], [0.68, 0.125, 0.88, 0.35, true], [0.095, 0.675, 0.345, 0.895, true], [0.665, 0.675, 0.915, 0.895, true]]);
  if (put(mShop3.map, 'f_shop3')) lights(mShop3.emissiveMap, 'f_shop3', [[0.315, 0.621, 0.698, 0.795, true], [0.12, 0.618, 0.267, 0.827, true], [0.734, 0.618, 0.881, 0.827, true], [0.303, 0.544, 0.698, 0.595, false]]);
  { const t = photoTex('f_temple'); if (t) { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; mTempleF.map = t; mTempleF.color.set(0xffffff); mTempleF.needsUpdate = true; } }
}

/* 同一種建築輪替多張立面：依位置固定挑一張，重開遊戲不會變 */
const FACV = [];
/* 金門大學校舍立面：紅磚牆＋白框雙窗＋樓板線（參考實景自行繪製），有實拍紅磚時用它當底 */
function nquDraw(g, emis) { const hs = (a, b) => hash2(a * 3.1 + 5, b * 7.7 + 2);
  if (emis) { g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512); } else if (PHOTO.img.brick) { for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) g.drawImage(PHOTO.img.brick, tx * 128, ty * 128, 129, 129); g.fillStyle = 'rgba(240,128,84,0.42)'; g.fillRect(0, 0, 512, 512); } else { g.fillStyle = '#c4613f'; g.fillRect(0, 0, 512, 512); }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = c * 128, y = r * 128;
    if (!emis) { g.fillStyle = '#d9d4c8'; g.fillRect(x, y + 116, 128, 12); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y, 128, 5); }
    for (const wx of [14, 70]) { if (emis) { if (hs(r, c + wx) > 0.55) { g.fillStyle = hs(c, r) > 0.5 ? '#ffd9a0' : '#fff1d0'; g.fillRect(x + wx, y + 36, 44, 58); } continue; }
      g.fillStyle = '#ece7da'; g.fillRect(x + wx - 4, y + 32, 52, 68); const gr = g.createLinearGradient(0, y + 36, 0, y + 94); gr.addColorStop(0, '#7f9bb0'); gr.addColorStop(0.6, '#34485a'); gr.addColorStop(1, '#202c38'); g.fillStyle = gr; g.fillRect(x + wx, y + 36, 44, 58);
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x + wx, y + 36, 44, 6); g.fillStyle = '#ece7da'; g.fillRect(x + wx + 20, y + 36, 3, 58); g.fillRect(x + wx, y + 56, 44, 3); g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x + wx - 4, y + 100, 52, 4); } } }
const nquTex = canvasTex(512, 512, g => nquDraw(g, false), true), nquEmis = canvasTex(512, 512, g => nquDraw(g, true), true);
const mNQU = new THREE.MeshStandardMaterial({ map: nquTex, emissiveMap: nquEmis, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.88 }); FACV.push(mNQU);
function facVariants() {
  const mk = (name, rects) => { const im = PHOTO.img[name]; if (!im) return null; const t = photoTex(name), W = 512, H = Math.round(512 * im.naturalHeight / im.naturalWidth);
    const e = canvasTex(W, H, g => { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); for (const [x0, y0, x1, y1, warm] of rects) { g.save(); g.beginPath(); g.rect(x0 * W, y0 * H, (x1 - x0) * W, (y1 - y0) * H); g.clip(); g.drawImage(im, 0, 0, W, H); g.globalCompositeOperation = 'lighter'; g.fillStyle = warm ? 'rgba(255,170,70,0.5)' : 'rgba(255,214,150,0.42)'; g.fillRect(0, 0, W, H); g.restore(); } }, true);
    const m = new THREE.MeshStandardMaterial({ map: t, emissiveMap: e, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.88 }); FACV.push(m); return m; };
  const vary = (key, mats) => { mats = mats.filter(Boolean); if (!mats.length || !BT[key]) return; const base = BT[key], bs = [base]; BT[key + '_v0'] = base; mats.forEach((m, i) => bs.push(batch(key + '_v' + (i + 1), base.geo, m))); BT[key] = { geo: base.geo, build() { }, add: (mx, c) => bs[Math.floor(hash2(Math.round(mx.elements[12]), Math.round(mx.elements[14])) * bs.length) % bs.length].add(mx, c) }; };
  nquDraw(nquTex.image.getContext('2d'), false); nquTex.needsUpdate = true; batch('nqu84', facadeGeo(8, 4), mNQU); batch('nqu86', facadeGeo(8, 6), mNQU);
  const A2 = mk('f_apt2', [[0.055, 0.075, 0.465, 0.27, true], [0.035, 0.405, 0.465, 0.64, false], [0.575, 0.42, 0.96, 0.62, true], [0.57, 0.785, 0.965, 0.95, false]]);
  const A3 = mk('f_apt3', [[0.02, 0.04, 0.4, 0.175, false], [0.595, 0.29, 0.975, 0.39, true], [0.02, 0.52, 0.4, 0.645, true], [0.595, 0.745, 0.975, 0.87, true], [0.02, 0.745, 0.4, 0.87, false]]);
  for (const k of ['fac33', 'fac34', 'fac84', 'fac86']) vary(k, [A2, A3]);
  vary('kshop2', [mk('f_shop2b', [[0.315, 0.53, 0.698, 0.745, true], [0.12, 0.527, 0.267, 0.785, true], [0.734, 0.527, 0.881, 0.785, true], [0.303, 0.435, 0.698, 0.498, false]])]);
  vary('kshop3', [mk('f_shop3b', [[0.12, 0.096, 0.325, 0.273, false], [0.68, 0.319, 0.88, 0.496, true], [0.4, 0.319, 0.6, 0.496, false], [0.095, 0.747, 0.345, 0.92, true], [0.665, 0.747, 0.915, 0.92, true]])]);
  { const t = photoTex('f_temple2'); if (t) { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; batch('tfront2', BT.tfront.geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 }), false); } }
}

/* 金門大學池塘：木棧道（可走）、中央涼亭、石拱橋（可走） */
function nquPond() {
  const L = LK.find(l => l.nm === '金大池塘'); if (!L || L.skip) return; const P = NQU_POND, y = L.rim + 0.3, wood = new THREE.Color('#5b3d2a'), dark = new THREE.Color('#3f2a1d'), stone = new THREE.Color('#b9b3a4');
  const plank = (x, z, w, d) => { BT.cbox.add(MX(x, y - 0.25, z, 0, w, 0.25, d), wood); addDeck(x, z, w / 2, d / 2, 0, y); for (let px = x - w / 2 + 0.3; px <= x + w / 2; px += 4) for (const sz of [-1, 1]) BT.ccyl.add(MX(px, y - 3, z + sz * (d / 2 - 0.2), 0, 0.16, 3, 0.16), dark); };
  const rail = (x, z, w, d) => { BT.cbox.add(MX(x, y + 0.95, z, 0, w, 0.12, d), dark); const n = Math.max(2, Math.round(Math.max(w, d) / 1.6)); for (let i = 0; i <= n; i++) { const t = i / n - 0.5; BT.cbox.add(MX(x + (w > d ? t * w : 0), y, z + (w > d ? 0 : t * d), 0, 0.12, 1.0, 0.12), dark); } };
  // 東西向棧道（在中央轉折一次）＋中央平台與涼亭
  plank(P.x - 16, P.z - 4, 24, 3); rail(P.x - 16, P.z - 5.4, 24, 0.1); rail(P.x - 18.5, P.z - 2.6, 19, 0.1);
  plank(P.x, P.z, 9, 9); rail(P.x + 4.4, P.z, 0.1, 9); rail(P.x, P.z + 4.4, 9, 0.1); rail(P.x + 1.6, P.z - 4.4, 5.6, 0.1);
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) BT.cbox.add(MX(P.x + a * 3.6, y, P.z + b * 3.6, 0, 0.28, 3.4, 0.28), dark); for (let i = -4; i <= 4; i++) BT.cbox.add(MX(P.x + i * 0.95, y + 3.4, P.z, 0, 0.18, 0.18, 8.6), dark); for (const b of [-3.6, 3.6]) BT.cbox.add(MX(P.x, y + 3.25, P.z + b, 0, 8.6, 0.2, 0.3), dark);
  plank(P.x - 2.6, P.z + 11, 3, 14); rail(P.x - 4, P.z + 11.5, 0.1, 13); rail(P.x - 1.2, P.z + 11.5, 0.1, 13);
  // 石拱橋：南北向跨過池塘東側
  const bx = P.x + 15, L0 = 34, N = 11; for (let i = 0; i < N; i++) { const t = (i + 0.5) / N, z = P.z - L0 / 2 + t * L0, h = Math.sin(t * Math.PI) * 2.6, seg = L0 / N + 0.2; BT.cbox.add(MX(bx, y - 0.4, z, 0, 4, h + 0.4, seg), stone); addDeck(bx, z, 2, seg / 2, 0, y + h); for (const sx of [-1, 1]) BT.cbox.add(MX(bx + sx * 1.9, y + h, z, 0, 0.25, 0.9, seg), stone); }
}
/* 校門石碑、橘紅直條紋的現代大樓（參考實景自行繪製） */
const stripeTex = canvasTex(512, 256, g => { const cols = ['#b5502f', '#c96a2e', '#a8472b', '#d98a35', '#b5502f', '#9a9a94', '#c05a30', '#d98a35', '#a8472b', '#c96a2e']; let x = 0, i = 0; while (x < 512) { const w = 22 + (i * 37 % 5) * 9; g.fillStyle = cols[i % cols.length]; g.fillRect(x, 0, w, 256); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x, 0, 1.5, 256); if (i % 4 === 2) { g.fillStyle = '#24323e'; g.fillRect(x + 4, 60, w - 8, 150); } x += w; i++; } for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; g.fillRect(Math.random() * 512, Math.random() * 256, 2, 5); } }, true);
const mStripe = new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.8 });
function nquExtras(g, f, r, yawF) {
  { const q = { x: g.x + f.x * 10.5 + r.x * 16, z: g.z + f.z * 10.5 + r.z * 16 }, qy = groundAt(q.x, q.z); if (roadClear(q.x, q.z, 3) && boxFree(q.x, q.z, 3)) { BT.cbox.add(MX(q.x, qy - 0.2, q.z, yawF, 8.4, 0.5, 2.2), COL.stone); BT.cbox.add(MX(q.x, qy + 0.3, q.z, yawF, 7.4, 1.9, 1.2), new THREE.Color('#1f2a44')); for (const sgn of [1, -1]) addSign('國立金門大學', 0.95, q.x - f.x * 0.63 * sgn, qy + 1.3, q.z - f.z * 0.63 * sgn, yawF + (sgn > 0 ? Math.PI : 0), { color: '#f1d27a', size: 96 }); BT.cbox.add(MX(q.x + f.x * 2.4 + r.x * 1.5, qy, q.z + f.z * 2.4 + r.z * 1.5, yawF + 0.3, 3.4, 3.2, 0.7), COL.white); addBox(q.x, q.z, 3.7, 0.7, yawF); } }
  { let p = roadFit(-498, 103, yawF, 30, 18); if (boxFree(p.x, p.z, 14)) { const y = minGround(p.x, p.z, 30, 18, yawF) - 0.2; if (!BT.nqumod) batch('nqumod', GEO.box, mStripe); BT.cbox.add(MX(p.x, y, p.z, yawF, 31, 3, 19), new THREE.Color('#a9a9a3')); BT.nqumod.add(MX(p.x, y + 3, p.z, yawF, 30, 11, 18)); BT.nqumod.add(MX(p.x + r.x * 3, y + 14, p.z + r.z * 3, yawF, 14, 5, 12)); BT.cbox.add(MX(p.x, y + 7.2, p.z, yawF, 33, 0.35, 21), new THREE.Color('#d8d8d2')); addBox(p.x, p.z, 15, 9, yawF); addSign('圖資大樓', 1.2, p.x - f.x * 9.2, y + 4.6, p.z - f.z * 9.2, yawF + Math.PI, { color: '#ffffff', bg: '#24323e', size: 96, pad: 10 }); } }
}
