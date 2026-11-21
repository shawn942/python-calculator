import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/* =====================================================================
   浯島風雲 Kinmen Open World — 瀏覽器原型
   座標：1 公里 = 150 世界單位；+X 為東、-Z 為北。
   ===================================================================== */
const V3 = THREE.Vector3;
const KM = 150;
const WP = (kx, ky) => ({ x: kx * KM, z: -ky * KM });

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = mulberry32(20261117);
const rr = (a, b) => a + (b - a) * rand();
const pick = arr => arr[Math.floor(rand() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function angDiff(a, b) { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
function hash2(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return lerp(lerp(hash2(xi, yi), hash2(xi + 1, yi), u), lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u), v); }
function fbm(x, y) { let s = 0, a = .5; for (let i = 0; i < 4; i++) { s += a * vnoise(x, y); x *= 2.03; y *= 2.03; a *= .5; } return s; }
function pnoise(x, y, per) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const h = (a, b) => hash2(((a % per) + per) % per, ((b % per) + per) % per); return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v); }
function pfbm(x, y, per) { let s = 0, a = .5, p = per; for (let i = 0; i < 4; i++) { s += a * pnoise(x, y, p); x *= 2; y *= 2; p *= 2; a *= .5; } return s; }

const FONT = '"Noto Sans TC","Microsoft JhengHei","PingFang TC","Noto Sans CJK TC",sans-serif';

/* ---------- renderer / scene ---------- */
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbfe0f5, 260, 3000);
const camera = new THREE.PerspectiveCamera(58, 1, 0.5, 9000);
function onResize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', onResize); onResize();
// 手機轉向或從桌面捷徑開啟時，iOS 有時回報舊尺寸：稍等再重新量一次
for (const ev of ['orientationchange', 'pageshow']) window.addEventListener(ev, () => { for (const t of [120, 400, 900]) setTimeout(() => window.dispatchEvent(new Event('resize')), t); });
if (window.visualViewport) visualViewport.addEventListener('resize', () => window.dispatchEvent(new Event('resize')));

const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x8a8468, 1.05); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 3.2);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
{ const sc = sun.shadow.camera; sc.left = -150; sc.right = 150; sc.top = 150; sc.bottom = -150; sc.near = 10; sc.far = 900; }
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.5;
scene.add(sun, sun.target);

/* ---------- helpers ---------- */
function canvasTex(w, h, draw, repeat = false, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const MATS = new Map();
function mat(hex, rough = 0.8, metal = 0) { const k = hex + '|' + rough + '|' + metal; let m = MATS.get(k); if (!m) { m = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal }); MATS.set(k, m); } return m; }
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new V3(), _p = new V3();
function MX(x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) { _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); return new THREE.Matrix4().compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz)); }
function mergeGeos(parts) {
  let n = 0; const gs = parts.map(([g, c, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); if (m) q.applyMatrix4(m); if (!q.attributes.normal) q.computeVertexNormals(); n += q.attributes.position.count; return [q, new THREE.Color(c)]; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  for (const [q, c] of gs) { const cnt = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); for (let i = 0; i < cnt; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; } o += cnt; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
}
const mVC = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
const mVC2 = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });

/* 分區塊的 InstancedMesh：讓視錐剔除與陰影範圍有效 */
const CHUNK = 400;
class Batch {
  constructor(geo, material, cast = true) { this.geo = geo; this.mat = material; this.cast = cast; this.chunks = new Map(); }
  add(m, color = null) { const k = Math.floor(m.elements[12] / CHUNK) + ',' + Math.floor(m.elements[14] / CHUNK); let a = this.chunks.get(k); if (!a) this.chunks.set(k, a = []); const e = [m, color, null, 0]; a.push(e); return e; }
  build() {
    for (const a of this.chunks.values()) {
      const mesh = new THREE.InstancedMesh(this.geo, this.mat, a.length); const useCol = a.some(i => i[1]);
      for (let i = 0; i < a.length; i++) { mesh.setMatrixAt(i, a[i][0]); a[i][2] = mesh; a[i][3] = i; if (useCol) mesh.setColorAt(i, a[i][1] || WHITE); }
      mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = this.cast; mesh.receiveShadow = true; mesh.computeBoundingSphere(); mesh.name = this.key || ''; mesh.userData.batch = true; scene.add(mesh);
    }
    this.chunks.clear();
  }
}
const WHITE = new THREE.Color(1, 1, 1);
/* 擋鏡頭的樹：記錄每棵樹的 instance，鏡頭視線被擋時暫時隱藏 */
const TREEG = new Map(), TCELL = 24, ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0); let treeHidden = new Set();
function regTree(x, z, r, y1, ents) { const k = Math.floor(x / TCELL) + ',' + Math.floor(z / TCELL); let a = TREEG.get(k); if (!a) TREEG.set(k, a = []); a.push({ x, z, r, y1, ents }); }
function treeOcclude(cx, cy, cz, tx, ty, tz) {
  const now = new Set(), dx = tx - cx, dz = tz - cz, L2 = dx * dx + dz * dz || 1;
  const x0 = Math.floor((Math.min(cx, tx) - 6) / TCELL), x1 = Math.floor((Math.max(cx, tx) + 6) / TCELL), z0 = Math.floor((Math.min(cz, tz) - 6) / TCELL), z1 = Math.floor((Math.max(cz, tz) + 6) / TCELL);
  for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) { const a = TREEG.get(i + ',' + j); if (!a) continue;
    for (const t of a) { let u = ((t.x - cx) * dx + (t.z - cz) * dz) / L2; u = Math.max(0, Math.min(0.92, u)); const px = cx + dx * u, pz = cz + dz * u, py = cy + (ty - cy) * u, d = Math.hypot(t.x - px, t.z - pz); if (d < t.r && py < t.y1) now.add(t); } }
  for (const t of treeHidden) if (!now.has(t)) for (const e of t.ents) if (e[2]) { e[2].setMatrixAt(e[3], e[0]); e[2].instanceMatrix.needsUpdate = true; }
  for (const t of now) if (!treeHidden.has(t)) for (const e of t.ents) if (e[2]) { e[2].setMatrixAt(e[3], ZERO_M); e[2].instanceMatrix.needsUpdate = true; }
  treeHidden = now;
}
const BT = {};
function batch(name, geo, material, cast = true) { const b = BT[name] = new Batch(geo, material, cast); b.key = name; return b; }

/* 文字貼圖（招牌、石碑、校門） */
function textTex(text, { size = 72, color = '#fff', bg = null, vertical = false, pad = 18, weight = 800, stroke = null } = {}) {
  const chars = [...text]; const m = document.createElement('canvas').getContext('2d'); m.font = `${weight} ${size}px ${FONT}`;
  const tw = vertical ? size : Math.ceil(m.measureText(text).width), th = vertical ? size * chars.length * 1.08 : size * 1.2;
  const w = tw + pad * 2, h = Math.ceil(th + pad * 2);
  const tex = canvasTex(w, h, g => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    g.font = `${weight} ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color;
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = size * 0.12; g.lineJoin = 'round'; }
    if (vertical) chars.forEach((ch, i) => { const y = pad + size * 1.08 * (i + 0.5); if (stroke) g.strokeText(ch, w / 2, y); g.fillText(ch, w / 2, y); });
    else { if (stroke) g.strokeText(text, w / 2, h / 2); g.fillText(text, w / 2, h / 2); }
  });
  return { tex, aspect: w / h };
}
const SIGN_CACHE = new Map();
function signMesh(text, height, opts = {}) {
  // 相同文字與樣式的招牌共用同一張貼圖與材質；貼圖上傳到顯示卡後就釋放畫布記憶體（手機記憶體有限）
  const key = text + '|' + JSON.stringify(opts); let S = SIGN_CACHE.get(key);
  if (!S) { const { tex, aspect } = textTex(text, opts); tex.onUpdate = function () { const c = this.image; if (c && c.getContext && c.width > 1) { this.userData.w = c.width; this.userData.h = c.height; c.width = c.height = 1; } }; S = { aspect, mat: new THREE.MeshStandardMaterial({ map: tex, transparent: !opts.bg, roughness: 0.7, side: THREE.FrontSide }) }; SIGN_CACHE.set(key, S); }
  return new THREE.Mesh(new THREE.PlaneGeometry(height * S.aspect, height), S.mat);
}

/* ---------- sky ---------- */
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new V3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, night: { value: 0 } },
  vertexShader: `varying vec3 vDir; void main(){ vDir=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 top,hor,sunCol,sunDir; uniform float night; varying vec3 vDir;
    float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
    void main(){ vec3 d=normalize(vDir); float h=clamp(d.y,0.0,1.0); vec3 c=mix(hor,top,pow(h,0.5));
      if(d.y<0.0) c=mix(hor,hor*0.55,clamp(-d.y*5.0,0.0,1.0));
      float s=max(dot(d,sunDir),0.0); c+=sunCol*(pow(s,420.0)*5.0+pow(s,14.0)*0.30+pow(s,3.0)*0.10);
      vec3 g=floor(d*240.0); float st=step(0.9988,hash(g))*night*smoothstep(0.02,0.3,d.y); c+=vec3(st*0.9);
      gl_FragColor=vec4(c,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(6000, 32, 16), skyMat); sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);

/* 雲 */
const cloudTex = canvasTex(256, 128, (g, w, h) => {
  for (let i = 0; i < 26; i++) { const x = 40 + Math.random() * (w - 80), y = 44 + Math.random() * 40, r = 18 + Math.random() * 30; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
});
const clouds = []; const cloudMat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, fog: false, depthWrite: false, opacity: 0.9 });
for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(cloudMat); const a = Math.random() * Math.PI * 2, d = 1400 + Math.random() * 2600; s.position.set(Math.cos(a) * d, 520 + Math.random() * 380, Math.sin(a) * d); const sc = 700 + Math.random() * 900; s.scale.set(sc, sc * 0.42, 1); s.renderOrder = -5; scene.add(s); clouds.push(s); }

/* ---------- water ---------- */
const waterNormal = canvasTex(256, 256, (g) => {
  const im = g.createImageData(256, 256); const hgt = (x, y) => pfbm(x / 256 * 8, y / 256 * 8, 8);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const dx = (hgt(x + 1, y) - hgt(x - 1, y)) * 9, dy = (hgt(x, y + 1) - hgt(x, y - 1)) * 9; const l = Math.hypot(dx, dy, 1); const i = (y * 256 + x) * 4; im.data[i] = (-dx / l * .5 + .5) * 255; im.data[i + 1] = (-dy / l * .5 + .5) * 255; im.data[i + 2] = (1 / l * .5 + .5) * 255; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0);
}, true, false);
waterNormal.repeat.set(450, 450);
const waterMat = new THREE.MeshStandardMaterial({ color: 0x2a86a8, roughness: 0.16, metalness: 0.05, transparent: true, opacity: 0.84, normalMap: waterNormal, normalScale: new THREE.Vector2(0.55, 0.55) });
const water = new THREE.Mesh(new THREE.PlaneGeometry(18000, 18000), waterMat); water.rotation.x = -Math.PI / 2; water.receiveShadow = true; scene.add(water);
