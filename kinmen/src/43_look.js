/* =====================================================================
   畫面真實度：後製（GTAO 環境光遮蔽、泛光、調色暗角）＋材質髒污
   ===================================================================== */
let composer = null, gtao = null, bloom = null, grade = null;
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, vig: { value: 0.32 }, sat: { value: 1.08 }, con: { value: 1.06 }, warm: { value: 0.025 }, wet: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float vig,sat,con,warm,wet; varying vec2 vUv;
    void main(){ vec4 c=texture2D(tDiffuse,vUv); vec3 col=c.rgb; float l=dot(col,vec3(0.299,0.587,0.114));
      col=mix(vec3(l),col,sat-wet*0.35); col=(col-0.5)*con+0.5; col+=vec3(warm,warm*0.4,-warm*0.6)*(1.0-wet); col=mix(col,col*vec3(0.88,0.94,1.04),wet);
      vec2 d=vUv-0.5; col*=1.0-vig*dot(d,d)*2.2; gl_FragColor=vec4(clamp(col,0.0,1.0),c.a); }` };
function setupPost() {
  if (composer) { composer.dispose(); composer = null; gtao = bloom = grade = null; }
  if (settings.q === 'low') return;
  const w = window.innerWidth, h = window.innerHeight; composer = new EffectComposer(renderer); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  if (settings.q === 'high') { try { gtao = new GTAOPass(scene, camera, w, h); { const r0 = gtao.render.bind(gtao), hid = []; gtao.render = (...a) => { hid.length = 0; scene.traverseVisible(o => { if (o.isSprite || (o.material && o.material.transparent && !o.material.depthWrite)) hid.push(o); }); for (const o of hid) o.visible = false; try { r0(...a); } finally { for (const o of hid) o.visible = true; } }; } gtao.output = GTAOPass.OUTPUT.Default; gtao.blendIntensity = 0.9; gtao.updateGtaoMaterial({ radius: 1.6, distanceExponent: 1.5, thickness: 1.2, scale: 1.0, samples: 12 }); gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, rings: 2, samples: 8 }); composer.addPass(gtao); } catch (e) { gtao = null; } }
  bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.32, 0.45, 0.88); composer.addPass(bloom);
  composer.addPass(new OutputPass()); grade = new ShaderPass(GradeShader); composer.addPass(grade);
}
function renderFrame() {
  if (composer) { if (grade) { grade.uniforms.wet.value = weather.k.rain * 0.8 + (weather.cur === 3 ? 0.3 : weather.cur === 4 ? 0.4 : 0); grade.uniforms.vig.value = player.tunnel ? 0.6 : 0.32; } if (bloom) bloom.strength = 0.25 + env.night * 0.45; composer.render(); }
  else renderer.render(scene, camera);
}
window.addEventListener('resize', () => { if (composer) { composer.setSize(window.innerWidth, window.innerHeight); if (gtao) gtao.setSize(window.innerWidth, window.innerHeight); } });

/* 牆面髒污：底部較暗、有雨痕與斑駁 */
function grimeTex() {
  return canvasTex(256, 256, g => {
    const im = g.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const n = pfbm(x / 256 * 8, y / 256 * 8, 8), streak = pnoise(x / 256 * 40, y / 256 * 2, 40), base = 1 - smooth(0.62, 1.0, y / 255) * 0.32, v = clamp((0.86 + (n - 0.5) * 0.24 - streak * 0.06) * base, 0, 1) * 255, i = (y * 256 + x) * 4; im.data[i] = v; im.data[i + 1] = v * 0.99; im.data[i + 2] = v * 0.97; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
  });
}
function applyGrime() {
  const t = grimeTex(); mPlain.map = t; mPlain.needsUpdate = true;
  if (PHOTO.img.plaster) { const im = PHOTO.img.plaster, c = t.image, g = c.getContext('2d'); g.globalCompositeOperation = 'multiply'; g.drawImage(photoGray('plaster', 238, 1.6, 256).image, 0, 0, c.width, c.height); g.globalCompositeOperation = 'source-over'; t.needsUpdate = true; }
  { const rt = photoGray('roof', 205, 1.5); if (rt) { mTile.map = rt; const nn = photoTex('roof_n', false); if (nn) { mTile.normalMap = nn; mTile.normalScale = new THREE.Vector2(1, 1); } mTile.needsUpdate = true; } }
  if (PHOTO.img.brick) { const c = brickTex.image; c.width = c.height = 512; const g = c.getContext('2d'); g.drawImage(PHOTO.img.brick, 0, 0, 512, 512); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,170,130,0.55)'; g.fillRect(0, 0, 512, 512); g.globalCompositeOperation = 'source-over'; brickTex.needsUpdate = true; const nn = photoTex('brick_n', false); if (nn) { mBrick.normalMap = nn; mBrick.normalScale = new THREE.Vector2(0.8, 0.8); mBrick.needsUpdate = true; } }
  const t2 = grimeTex(); t2.wrapS = THREE.RepeatWrapping; t2.wrapT = THREE.ClampToEdgeWrapping; mFacade.onBeforeCompile = sh => { sh.uniforms.grime = { value: t2 }; sh.fragmentShader = 'uniform sampler2D grime;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n  diffuseColor.rgb *= mix(0.78, 1.0, smoothstep(0.0, 0.18, fract(vMapUv.y))) * (0.9 + 0.1 * texture2D(grime, vMapUv * 0.37).r);'); };
  mFacade.needsUpdate = true;
  repaintFacades();
  const fab = canvasTex(64, 64, g => { const im = g.createImageData(64, 64); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const v = 220 + ((x + y) % 2) * 12 + hash2(x, y) * 23, i = (y * 64 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); }, true); fab.repeat.set(6, 6); mPerson.map = fab; mPerson.needsUpdate = true;
}
