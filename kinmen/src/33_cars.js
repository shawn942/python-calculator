/* =====================================================================
   車輛模型（Quaternius Cars，CC0）：轎車、計程車、警車、休旅車、跑車改用真實比例的低多邊形模型
   載入失敗時退回原本程序化的車
   ===================================================================== */
const CARM = { ready: false, m: {}, err: null, on: !/oldcars/.test(location.search) };
const CARM_PAINT = { NormalCar1: 'Blue', NormalCar2: 'LightBlue', SUV: 'White', SportsCar: 'Orange', SportsCar2: 'White' };
const CARM_FOR = { sedan: ['NormalCar1', 'NormalCar2'], taxi: ['Taxi'], police: ['Cop'], suv: ['SUV'], sports: ['SportsCar', 'SportsCar2'] };
function loadCars() {
  if (!CARM.on) return Promise.resolve(false);
  const ld = new GLTFLoader(), names = [...new Set(Object.values(CARM_FOR).flat())];
  return Promise.all(names.map(n => new Promise(res => ld.load('cars/' + n + '.json', g => {
    const s = g.scene; s.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(s); CARM.m[n] = { scene: s, len: b.max.z - b.min.z }; res();
  }, undefined, e => { CARM.err = n + ': ' + (e && (e.message || e)); res(); })))).then(() => { CARM.ready = Object.keys(CARM.m).length > 0; return CARM.ready; });
}
const mCopW = mat('#f2f3f4', 0.35, 0.3), mCopB = mat('#1f4f8f', 0.4, 0.3);
function carFromModel(type, g, paint, wheels, front, def) {
  const opts = CARM_FOR[type].filter(k => CARM.m[k]); if (!opts.length) return false; const n = pick(opts), M = CARM.m[n], s = def.len / M.len * 1.03;
  const root = M.scene.clone(true); root.scale.setScalar(s); g.add(root);
  root.traverse(c => { if (!c.isMesh) return; c.castShadow = true; const nm = c.material.name;
    if (nm === CARM_PAINT[n]) c.material = paint; else if (nm === 'Windows') c.material = mGlass; else if (nm === 'Headlights') c.material = mHead; else if (nm === 'TailLights') c.material = mTail;
    else if (nm === 'BlueLights') c.material = mSirenB; else if (nm === 'WhiteLights') c.material = mSirenR; });
  if (type === 'police') { const body = root.children.find(c => !/Wheel/.test(c.name)); body && body.traverse(c => { if (!c.isMesh) return; if (c.material.name === 'Black') c.material = mCopW; else if (c.material.name === 'White') c.material = mCopB; }); }
  for (const c of [...root.children]) { if (!/Wheel/.test(c.name)) continue; const r = Math.max(0.12, c.position.y * s);
    if (/Front/.test(c.name)) { const pv = new THREE.Group(); pv.position.copy(c.position); root.add(pv); c.position.set(0, 0, 0); pv.add(c); front.push(pv); }
    wheels.push({ me: c, r }); }
  g.userData.model = n; return true;
}
