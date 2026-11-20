/* =====================================================================
   實拍材質（Poly Haven，CC0）：柏油、草地、紅磚、灰泥牆。載入失敗就用原本的程序化貼圖。
   ===================================================================== */
const PHOTO = { on: !/nophoto/.test(location.search), img: {} };
function loadPhotos() {
  if (!PHOTO.on) return Promise.resolve();
  const one = n => new Promise(res => { const im = new Image(); im.onload = () => { PHOTO.img[n] = im; res(); }; im.onerror = () => res(); im.src = 'tex/' + n + '.jpg'; });
  return Promise.all(['asphalt', 'asphalt_n', 'grass', 'grass_n', 'brick', 'brick_n', 'plaster', 'plaster_n', 'roof', 'roof_n', 'f_yanglou', 'f_apt', 'f_shop2', 'f_shop3', 'f_temple', 'f_apt2', 'f_apt3', 'f_shop2b', 'f_shop3b', 'f_temple2'].map(one));
}
function photoTex(n, srgb = true, rx = 1, ry = 1) { const im = PHOTO.img[n]; if (!im) return null; const t = new THREE.Texture(im); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; t.needsUpdate = true; return t; }
/* 轉成偏亮的灰階細節圖（平均亮度 = mean），給「頂點色 × 貼圖」的材質用，顏色仍由頂點色決定 */
function photoGray(n, mean = 232, contrast = 1, size = 512) {
  const im = PHOTO.img[n]; if (!im) return null;
  return canvasTex(size, size, g => { g.drawImage(im, 0, 0, size, size); const d = g.getImageData(0, 0, size, size), a = d.data; let s = 0; for (let i = 0; i < a.length; i += 4) { a[i] = 0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2]; s += a[i]; } const m = s / (a.length / 4);
    for (let i = 0; i < a.length; i += 4) { const v = clamp(mean + (a[i] - m) * contrast, 0, 255); a[i] = a[i + 1] = a[i + 2] = v; } g.putImageData(d, 0, 0); }, true);
}
