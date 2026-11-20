/* =====================================================================
   廣告看板：翁品洋 3（使用者提供的競選海報圖）
   大型看板放在人多的地方；金寧鄉沿路再放直式立牌
   ===================================================================== */
const adBoards = [];
const adTex = new THREE.TextureLoader().load('./ad_wpy.jpg', t => { t.needsUpdate = true; }); adTex.colorSpace = THREE.SRGBColorSpace; adTex.anisotropy = 4;
const mAd = new THREE.MeshStandardMaterial({ map: adTex, emissive: 0xffffff, emissiveMap: adTex, emissiveIntensity: 0.12, roughness: 0.6 });
const standTex = canvasTex(256, 512, g => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#1f6fd6'); gr.addColorStop(1, '#0d3f94'); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#ffd23f'; g.fillRect(0, 0, 256, 10); g.fillRect(0, 502, 256, 10);
  g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 92, 66, 0, 7); g.fill(); g.fillStyle = '#d61f26'; g.beginPath(); g.arc(128, 92, 56, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 92px ${FONT}`; g.fillText('3', 128, 98);
  g.font = `900 92px ${FONT}`; ['翁', '品', '洋'].forEach((ch, i) => g.fillText(ch, 128, 222 + i * 92));
  g.font = `700 22px ${FONT}`; g.fillStyle = '#ffd23f'; g.fillText('金寧鄉鄉長候選人', 128, 482);
});
const mStand = new THREE.MeshStandardMaterial({ map: standTex, emissive: 0xffffff, emissiveMap: standTex, emissiveIntensity: 0.1, roughness: 0.7 });
const AD_SPOTS = [['金城車站', 24.4331, 118.3201], ['模範街', 24.4312, 118.3186], ['國立金門大學', 24.4478, 118.3229], ['金寧鄉公所（頂堡）', 24.4497, 118.3336], ['頂埔下（離家遠一點）', 24.4498, 118.3205], ['古寧頭', 24.4773, 118.3085],
  ['山外車站', 24.4415, 118.4148], ['尚義機場', 24.4354, 118.3606], ['沙美', 24.4892, 118.4128], ['水頭碼頭', 24.4150, 118.2892], ['九宮碼頭', 24.4268, 118.2632], ['莒光樓', 24.42491, 118.31902], ['金城北', 24.4396, 118.3205], ['水頭聚落', 24.4100, 118.2990], ['慈湖', 24.4640, 118.2985], ['榜林', 24.4480, 118.3580], ['瓊林', 24.4550, 118.3738], ['后湖', 24.4150, 118.3560],
  ['成功', 24.4310, 118.3900], ['料羅', 24.4275, 118.4250], ['太湖', 24.4398, 118.4263], ['山后', 24.5030, 118.4395], ['馬山', 24.5270, 118.4090], ['烈嶼東林', 24.4318, 118.2440],
  ['盤山', 24.4505, 118.3270], ['夏墅', 24.4240, 118.3080], ['珠山', 24.4205, 118.3040], ['歐厝', 24.4060, 118.3150], ['安岐', 24.4600, 118.3110], ['湖下', 24.4440, 118.3000], ['浦邊', 24.5010, 118.4170], ['官澳', 24.5130, 118.4290],
  ['陽翟', 24.4970, 118.3980], ['溪湖', 24.4690, 118.3820], ['新頭', 24.4160, 118.4300], ['夏興', 24.4330, 118.3740], ['南山', 24.4740, 118.3090], ['北山', 24.4830, 118.3050], ['上林', 24.4250, 118.2350], ['西方', 24.4390, 118.2380]];
function adBoard(x, z, rot, S = 10) {
  const y = groundAt(x, z), fx = Math.sin(rot), fz = Math.cos(rot), ux = Math.cos(rot), uz = -Math.sin(rot), H = S > 8 ? 4 : 3.2;
  for (const sd of [-1, 1]) { const px = x + ux * sd * S * 0.32, pz = z + uz * sd * S * 0.32; BT.ccyl.add(MX(px, y - 0.2, pz, 0, 0.32, H + S * 0.5, 0.32), new THREE.Color('#5c6166')); addBox(px, pz, 0.25, 0.25, 0); }
  hb(x, y + H, z, S + 0.5, S + 0.5, 0.35, '#e9edf2', rot); hb(x, y + H + S + 0.5, z, S + 0.7, 0.18, 0.6, '#1f5fbf', rot);
  for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(S, S), mAd); m.position.set(x + fx * 0.19 * s, y + H + 0.25 + S / 2, z + fz * 0.19 * s); m.rotation.y = s > 0 ? rot : rot + Math.PI; scene.add(m); }
  adBoards.push({ x, z, rot });
}
function adStand(x, z, rot) {
  const y = groundAt(x, z), ux = Math.cos(rot), uz = -Math.sin(rot), fx = Math.sin(rot), fz = Math.cos(rot);
  for (const sd of [-1, 1]) BT.ccyl.add(MX(x + ux * sd * 0.7, y - 0.1, z + uz * sd * 0.7, 0, 0.08, 1.2, 0.08), new THREE.Color('#444'));
  hb(x, y + 0.9, z, 1.75, 3.3, 0.08, '#e9edf2', rot); addBox(x, z, 0.9, 0.12, rot);
  for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), mStand); m.position.set(x + fx * 0.05 * s, y + 2.55, z + fz * 0.05 * s); m.rotation.y = s > 0 ? rot : rot + Math.PI; scene.add(m); }
}
function buildAds() {
  const home = myHome.ext && myHome.ext.s, farOk = (x, z, d) => !(home && Math.hypot(x - home.x, z - home.z) < 120) && !adBoards.some(b => Math.hypot(b.x - x, b.z - z) < d);
  for (const [, la, lo] of AD_SPOTS) { const s = spot(la, lo, 7, 20) || spot(la, lo, 5, 20); if (!s || !farOk(s.x, s.z, 60)) continue; adBoard(s.x, s.z, s.rot, 10); }
  // 全島主要道路旁每隔一段一面 8 公尺看板（面向道路）
  let m = 0; for (let k = 0; k < roadSamples.length && m < 26; k++) { const smp = roadSamples[(k * 4813) % roadSamples.length], e = smp.e, p = e.pts[smp.i]; if (e.bridge || (e.hw || 3) < 3) continue;
    const side = m % 2 ? 1 : -1, off = (e.hw || 3) + 6.5, x = p.x - p.tz * side * off, z = p.z + p.tx * side * off; if (!farOk(x, z, 230) || !boxFree(x, z, 5) || !roadClear(x, z, 4.5) || sdAt(x, z) < 14) continue;
    adBoard(x, z, Math.atan2(p.x - x, p.z - z), 8); m++; }
  // 金寧鄉沿路的直式立牌（每隔一段放一面，面向道路）
  const used = []; let n = 0;
  for (let k = 0; k < roadSamples.length && n < 22; k += 3) { const smp = roadSamples[(k * 7919) % roadSamples.length], e = smp.e, p = e.pts[smp.i]; if (e.bridge || townAt(p.x, p.z) !== '金寧鄉' || used.some(q => Math.hypot(q.x - p.x, q.z - p.z) < 140)) continue;
    const side = n % 2 ? 1 : -1, off = e.hw + 3.2, x = p.x - p.tz * side * off, z = p.z + p.tx * side * off; if (!boxFree(x, z, 1.4) || !roadClear(x, z, 1.2) || sdAt(x, z) < 10) continue;
    adStand(x, z, Math.atan2(p.x - x, p.z - z)); used.push({ x: p.x, z: p.z }); n++; }
}
function updateAds() { const night = env.tod < 6 || env.tod > 18.5 ? 1 : 0, k = 0.12 + night * 0.55; mAd.emissiveIntensity += (k - mAd.emissiveIntensity) * 0.1; mStand.emissiveIntensity = mAd.emissiveIntensity * 0.9; }
