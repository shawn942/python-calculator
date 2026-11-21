/* =====================================================================
   生活系統
   安全屋（睡覺存檔・換衣・車庫）、手機委託（支線）與打工、隨機事件、
   跳傘、被撞倒地、翻越上車頂、車輛凹陷與破窗、改車店、雨天撐傘
   ===================================================================== */
const PL = { 水頭: [24.4100, 118.2990], 模範街: [24.4318, 118.3193], 莒光樓: [24.42491, 118.31902], 金門大學: [24.4478, 118.3229], 山外: [24.4415, 118.4148], 沙美: [24.4892, 118.4128], 瓊林: [24.4550, 118.3738], 馬山: [24.5270, 118.4090], 料羅: [24.4275, 118.4250], 烈嶼: [24.4318, 118.2440], 金寧: [24.4508, 118.3348] };
function roadPt(ll) { const w = GW(ll[0], ll[1]), n = nearestRoad(w.x, w.z, 300); return n ? { x: n.p.x, z: n.p.z } : { x: w.x, z: w.z }; }
function tpTo(x, z) { const v = player.veh; if (v) { v.pos.set(x, heightAt(x, z), z); v.vx = v.vz = v.speed = 0; } player.pos.set(x, heightAt(x, z), z); }
function dirPt(v, from) { const dx = from.x - v.pos.x, dz = from.z - v.pos.z, d = Math.hypot(dx, dz) || 1; return { x: v.pos.x + dx / d * 1.1, z: v.pos.z + dz / d * 1.1 }; }

/* ---------- 安全屋 ---------- */
const HOMES = [['金城老街公寓', 24.4295, 118.3155, 18000], ['山外透天厝', 24.4428, 118.4092, 32000], ['古寧頭三合院', 24.4790, 118.3060, 26000], ['烈嶼海景平房', 24.4335, 118.2468, 15000]];
const homes = []; let homeSave = { own: [], gar: {} };
try { homeSave = Object.assign(homeSave, JSON.parse(localStorage.getItem('kinmen_homes') || '{}')); } catch (e) { }
function saveHomes() { try { localStorage.setItem('kinmen_homes', JSON.stringify({ own: homes.filter(h => h.own).map(h => h.name), gar: Object.fromEntries(homes.filter(h => h.car).map(h => [h.name, h.car])) })); } catch (e) { } }
function ringAt(x, z, color, r = 2.6) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.5, 28, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false })); m.position.set(x, heightAt(x, z) + 0.3, z); scene.add(m); return m; }
function buildHomes() {
  for (const [name, la, lo, price] of HOMES) {
    const o = office(la, lo, 9, 8, 2, name, '#efe3cf', '#2e5e8c'); if (!o) continue; const ux = Math.cos(o.rot), uz = -Math.sin(o.rot);
    let gx = o.x + ux * 7, gz = o.z + uz * 7; if (!boxFree(gx, gz, 2.4)) { gx = o.x - ux * 7; gz = o.z - uz * 7; }
    const h = { name, price, x: o.x, z: o.z, rot: o.rot, gx, gz, own: homeSave.own.includes(name), car: homeSave.gar[name] || null };
    h.ic = iconSprite('售', '#7f8c8d'); h.ic.scale.set(1.7, 1.7, 1); h.ic.position.set(o.x, heightAt(o.x, o.z) + 8.6, o.z); scene.add(h.ic);
    h.ring = ringAt(gx, gz, 0x2e86de); h.gic = iconSprite('車', '#2e86de'); h.gic.scale.set(1.6, 1.6, 1); h.gic.position.set(gx, heightAt(gx, gz) + 2.6, gz); scene.add(h.gic); homes.push(h); setHomeIcon(h);
    addAction({ x: o.x, z: o.z, r: 3, inside: null, label: () => h.own ? `${h.name}（安全屋）：睡覺存檔・換衣服・車庫` : `買下安全屋 ${h.name}（$${h.price.toLocaleString()}）`, fn: () => h.own ? homeMenu(h) : buyHome(h) });
  }
}
function setHomeIcon(h) { const t = iconSprite(h.own ? '家' : '售', h.own ? '#2e86de' : '#7f8c8d'); h.ic.material.map = t.material.map; h.ic.material.needsUpdate = true; h.ring.visible = h.gic.visible = h.own; }
function buyHome(h) { if (h.own) return; if (player.money < h.price) { toast('錢不夠'); sfx('fail', 0.2); return; } addMoney(-h.price); h.own = true; setHomeIcon(h); saveHomes(); banner('買下安全屋', `${h.name}：可以睡覺存檔、換衣服，旁邊的藍圈是你的車庫`); }
function sleepTo(h, hh) { closeMenu(); game.busy = true; fade('Z z z', () => { env.tod = hh; player.hp = 100; clearWanted(); saveGame(); saveHomes(); game.busy = false; toast(`睡到 ${hh}:00，已存檔`); }); }
function carName(c) { return VDEF[c.type] ? VDEF[c.type].name : c.type; }
function homeMenu(h) {
  const items = [{ n: '睡到早上 8 點', d: '補滿血、撤銷通緝、存檔', fn: () => sleepTo(h, 8) }, { n: '睡到晚上 8 點', d: '補滿血、撤銷通緝、存檔', fn: () => sleepTo(h, 20) }, { n: '換一套衣服', d: '衣櫃隨機挑一套', fn: () => { restyle(); sfx('door', 0.2); toast('換好衣服了'); } },
    h.car ? { n: '開出車庫：' + carName(h.car), d: (h.car.eng > 1 ? '引擎升級 ' : '') + (h.car.bp ? '防彈' : ''), fn: () => { closeMenu(); garageOut(h); } } : { n: '車庫是空的', d: '開車停到旁邊的藍圈就會停進來', fn: () => { } },
    { n: '離開', d: '', fn: closeMenu }];
  openMenu('🏠 ' + h.name, items.map(i => ({ ...i, free: true })));
}
function applyMods(v, c) { if (c.eng > 1) v.engine = c.eng; if (c.bp) { v.bulletproof = true; v.hp = 160; } v.carColor = c.color; }
function garageOut(h) { const c = h.car; if (!c) return; const v = makeVehicle(c.type, h.gx, h.gz, h.rot + Math.PI / 2, c.color || undefined); v.perm = true; v.fromGar = h; applyMods(v, c); h.car = null; saveHomes(); toast(carName(c) + ' 開出來了'); }
function garageIn(h, v) { h.car = { type: v.type, color: v.carColor || ((v.paint0 || v.paint) ? '#' + (v.paint0 || v.paint).color.getHexString() : null), eng: v.engine || 1, bp: !!v.bulletproof }; exitForce(); removeVehicle(v); player.pos.set(h.x, heightAt(h.x, h.z), h.z); saveHomes(); banner('車庫', `${carName(h.car)} 停進了 ${h.name}`); }
function updateHomes(dt) {
  const v = player.veh; life.garCd -= dt; if (!v || v.def.boat || v.type === 'tank' || life.garCd > 0) return;
  for (const h of homes) { if (!h.own) continue; const d = Math.hypot(v.pos.x - h.gx, v.pos.z - h.gz);
    if (v.fromGar === h && !v.garAway) { if (d > 12) v.garAway = true; continue; }
    if (d < 4 && Math.abs(v.speed) < 1.5) { life.garCd = 4; if (h.car) toast('車庫已經有車了'); else garageIn(h, v); return; } }
}
function phoneHomes() { phoneMenu('📱 安全屋', homes.map(h => ({ n: (h.own ? '🏠 ' : '') + h.name, d: h.own ? (h.car ? '車庫：' + carName(h.car) : '車庫空著') : `售價 $${h.price.toLocaleString()}（點選導航）`, fn: () => { if (!mission.type) { setTarget(h.x, h.z, h.name); waypoint = true; closeMenu(); toast('已設定導航'); } } }))); }

/* ---------- 手機委託（支線） ---------- */
const SIDE = [
  { id: 'gongtang', who: '阿德叔', title: '貢糖急件', pay: 1500, pitch: '阿廷啊，模範街的貢糖要送去水頭給客人，拿到貨三分鐘內要送到！', thanks: '準時！客人很滿意', st: [{ t: 'go', at: PL.模範街, text: '到模範街貢糖店拿貨' }, { t: 'go', at: PL.水頭, text: '三分鐘內把貢糖送到水頭', time: 180 }] },
  { id: 'camera', who: '小芸', title: '被搶走的相機', pay: 3000, pitch: '我的相機在莒光樓被三個混混搶走了……裡面有我拍了一整年的照片，幫我拿回來好不好？', thanks: '照片都還在，謝謝你！', st: [{ t: 'fight', at: PL.莒光樓, n: 3, text: '莒光樓的混混拿走了相機，教訓他們' }, { t: 'go', at: PL.金門大學, text: '把相機還給在金門大學的小芸' }] },
  { id: 'kaoliang', who: '老陳', title: '被偷的高粱', pay: 2500, pitch: '有人把我一車高粱開走了！你快幫我攔下來！', thanks: '一瓶都沒破，好樣的', st: [{ t: 'chase', text: '攔下偷高粱的車（撞擊或射擊讓它停下）' }, { t: 'go', at: PL.山外, text: '到山外跟老陳會合' }] },
  { id: 'patrol', who: '林隊長', title: '海岸巡邏', pay: 2200, pitch: '今晚海岸線不平靜，幫我巡一圈：瓊林、馬山、沙美，三分鐘內跑完。', thanks: '辛苦了，沒發現異狀', st: [{ t: 'go', at: PL.瓊林, r: 14, text: '巡邏點 1／3：瓊林', time: 180 }, { t: 'go', at: PL.馬山, r: 14, text: '巡邏點 2／3：馬山', keep: true }, { t: 'go', at: PL.沙美, r: 14, text: '巡邏點 3／3：沙美', keep: true }] },
  { id: 'debt', who: '阿德叔', title: '討債', pay: 2000, pitch: '料羅有個傢伙欠我們家三萬塊欠了三年，去「提醒」他一下，別動傢伙。', thanks: '他明天就會把錢送來', st: [{ t: 'brawl', at: PL.料羅, text: '找到欠債的人，赤手空拳把他打倒' }] },
  { id: 'poach', who: '野鳥學會李老師', title: '慈湖盜獵者', pay: 2800, pitch: '有人在慈湖架網抓鸕鶿，要偷賣到對岸！我們不敢靠近，你幫忙去處理一下？', thanks: '網都拆了，鸕鶿今晚可以安心睡了', st: [{ t: 'fight', at: [24.4690, 118.3020], n: 3, text: '到慈湖邊，把架網盜獵的人趕走' }, { t: 'go', at: [24.4652, 118.2990], r: 12, text: '到慈湖三角堡跟李老師回報' }] },
  { id: 'oyster', who: '沙美蚵嗲阿姨', title: '蚵嗲攤缺貨', pay: 1800, pitch: '今天的石蚵不夠了！古寧頭的老蚵農幫我留了一簍，四分鐘內幫我載回沙美，客人在排隊啦！', thanks: '剛好趕上，客人都吃到了', st: [{ t: 'go', at: [24.4880, 118.3170], r: 14, text: '到古寧頭石蚵田拿一簍石蚵' }, { t: 'go', at: PL.沙美, text: '四分鐘內把石蚵載回沙美', time: 240 }] },
  { id: 'temple', who: '城隍廟主委', title: '鬧事的醉漢', pay: 1600, pitch: '遶境前有個喝醉的在模範街鬧事，還說要砸神轎。少年仔，幫我請他「冷靜」一下，不要動刀動槍。', thanks: '城隍爺會保佑你的', st: [{ t: 'brawl', at: PL.模範街, text: '到模範街，赤手空拳讓醉漢冷靜下來' }, { t: 'go', at: [24.4318, 118.3208], r: 10, text: '回城隍廟跟主委說一聲' }] },
  { id: 'dadan', who: '林隊長', title: '大膽島的霓虹燈', pay: 2600, pitch: '大膽島心戰牆的霓虹燈管燒掉了，新燈管放在九宮碼頭，幫我搭交通船送過去，晚上七點前要亮！', thanks: '今晚七點，對岸又看得到了', st: [{ t: 'go', at: [24.4268, 118.2632], text: '到九宮碼頭拿燈管' }, { t: 'go', pt: () => dadan.wall, r: 14, text: '搭交通船到大膽島，把燈管送到北山的心戰牆' }] },
  { id: 'dadan2', who: '林隊長', title: '【特別篇】島孤人不孤', pay: 8000, pitch: '海巡在大膽島外海盯上一批走私快艇，今晚可能摸黑上岸。島上人手不夠，你跟我過去一趟。', thanks: '島孤人不孤——今晚你就是那個讓它不孤的人。', st: [
    { t: 'go', at: [24.4268, 118.2632], text: '到九宮碼頭跟林隊長會合' },
    { t: 'go', pt: () => dadan.pier, r: 12, text: '搭交通船到大膽島', say: ['<b>林隊長</b>：「大膽島離廈門只有 4.4 公里，走私客最愛挑這種夜裡摸過來。」'] },
    { t: 'go', pt: () => dadan.wall, r: 14, night: 20.4, text: '天黑了。到北山心戰牆跟守島的衛兵會合', say: ['<b>衛兵</b>：「1950 年 7 月 26 日晚上，七百多人就是從生明路兩邊的沙灘摸上來的。」', '<b>衛兵</b>：「當年守軍不到三百人，守了一整夜。今晚換我們了。」'] },
    { t: 'fight', pt: () => ({ x: lerp(DN.x, DS.x, 0.35) - 19, z: lerp(DN.z, DS.z, 0.35) }), n: 4, arm: true, text: '走私客從生明路西側沙灘上岸了！把他們擋下來', say: ['<b>林隊長</b>：「步槍跟防彈背心拿去，小心點！」'] },
    { t: 'go', pt: () => ({ x: DS.x, z: DS.z - 6 }), r: 9, time: 55, ambush: 3, text: '無線電被干擾了！像當年的傳令兵賴生明一樣，沿著生明路衝到南山燈塔通報', say: ['<b>林隊長</b>：「1950 年賴生明就是這樣冒著砲火跑過這條路的，路就是用他的名字取的。快跑！」'] },
    { t: 'escape', from: () => ({ x: DS.x - DS.rx - 24, z: DS.z - 10 }), text: '走私快艇要往對岸逃了！在它開進對岸海域前擊沉它' },
    { t: 'go', pt: () => dadan.pier, r: 12, text: '回大膽碼頭跟林隊長會合' }] },
  { id: 'taro', who: '小芸', title: '烈嶼芋頭酥', pay: 2400, pitch: '烈嶼的芋頭酥賣到缺貨了，幫我去小金門載一箱回金寧！', thanks: '社團的人都搶著吃', st: [{ t: 'go', at: PL.烈嶼, text: '過金門大橋到烈嶼拿芋頭酥' }, { t: 'go', at: PL.金寧, text: '把芋頭酥送回金寧', time: 'auto' }] }];
const side = { job: null, i: 0, timer: 0, pt: null, thugs: null, perp: null, ped: null };
const sideDone = new Set(); try { for (const id of JSON.parse(localStorage.getItem('kinmen_side') || '[]')) sideDone.add(id); } catch (e) { }
const life = { callT: 150, call: null, callAge: 0, garCd: 0 };
function callItems() { const j = life.call; return j ? [{ n: '📞 接聽：' + j.who, d: j.title, fn: () => { life.call = null; closeMenu(); startSide(j); } }] : []; }
function phoneSide() { if (!storyDone()) { toast('先把主線劇情走完，朋友們才會來找你幫忙'); return; } phoneMenu('📱 委託', SIDE.map(j => ({ n: (sideDone.has(j.id) ? '✅ ' : '') + j.title, d: `${j.who}：${j.pitch.slice(0, 22)}…　$${(sideDone.has(j.id) ? j.pay / 2 : j.pay).toLocaleString()}`, fn: () => { closeMenu(); startSide(j); } }))); }
function phoneJobs() {
  phoneMenu('📱 打工', [{ n: '外送員', d: '取餐送餐三趟，每趟限時，$1,800', fn: startDeliveryJob },
    { n: '計程車司機', d: '要坐在計程車上（聯絡人可以叫車）', fn: () => { if (!player.veh || player.veh.type !== 'taxi') return toast('先找一台計程車'); if (mission.type || mission.taxi) return toast('先完成目前的任務'); closeMenu(); startTaxi(); } },
    { n: '警察任務', d: '要坐在警車上', fn: () => { closeMenu(); startVigilante(); } }]);
}
function startDeliveryJob() { closeMenu(); const names = Object.keys(PL), st = []; for (let k = 0; k < 3; k++) { const sh = pick(REAL_SHOPS), dn = pick(names); st.push({ t: 'go', at: [sh[1], sh[2]], text: `到「${sh[0]}」取餐（第 ${k + 1}／3 單）` }, { t: 'go', at: PL[dn], text: `把餐送到${dn}（第 ${k + 1}／3 單）`, time: 'auto' }); } startSide({ id: 'deliver', gen: true, who: '金門外送', title: '外送員打工', pay: 1800, st, thanks: '辛苦了，這是今天的薪水' }); }
function startSide(job) {
  if (mission.type || mission.taxi || (story.active)) { toast('先完成目前的任務'); return; } if (ev.cur) endEvent(null);
  side.job = job; side.i = 0; side.timer = 0; mission.type = 'side'; sfx('chime', 0.4); subtitle(`<b>${job.who}</b>：「${job.pitch}」`, 6); sideStage();
}
function sideStage() {
  const st = side.job.st[side.i]; side.pt = st.pt ? st.pt() : st.at ? roadPt(st.at) : null; side.thugs = null; side.ped = null; side.perp = null; side.retry = 0;
  if (st.time) { const w = wpos(); side.timer = st.time === 'auto' ? clamp(Math.hypot(side.pt.x - w.x, side.pt.z - w.z) / 9 + 45, 60, 300) : st.time; } else if (!st.keep) side.timer = 0;
  $('goal').innerHTML = `<b>${side.job.title}</b>${st.text}`; if (side.pt) setTarget(side.pt.x, side.pt.z, st.text); else clearTarget();
  side.boat = null; side.amb = null; const job = side.job;
  if (st.night) { env.tod = st.night; toast('🌙 夜幕低垂'); }
  if (st.say) st.say.forEach((l, k) => setTimeout(() => { if (side.job === job) subtitle(l, 5.5); }, 600 + k * 5800));
  if (st.arm) { giveWeapon(4, 150); player.armor = 100; toast('拿到步槍和防彈背心'); }
  if (st.ambush && side.pt) { const w = wpos(); side.amb = []; for (let k = 0; k < st.ambush; k++) { const t = (k + 1) / (st.ambush + 1), x = lerp(w.x, side.pt.x, t) + (k % 2 ? 9 : -9), z = lerp(w.z, side.pt.z, t), c = spawnCop(x, z, false, null, true); c.thug = true; c.hp = 40; c.alert = true; side.amb.push(c); } }
}
function sideNext() { side.i++; if (side.i >= side.job.st.length) return endSide(true); sfx('chime', 0.25); sideStage(); }
function endSide(ok, msg) {
  const j = side.job; if (!j) return;
  if (side.thugs) for (const c of side.thugs) if (cops.includes(c) && !c.alert) removeCop(c);
  if (side.perp && vehicles.includes(side.perp)) { side.perp.perp = false; side.perp.thug = false; }
  if (side.ped && peds.includes(side.ped)) { side.ped.bad = false; side.ped.idle = 0; }
  if (side.boat && vehicles.includes(side.boat) && !ok) removeVehicle(side.boat); side.boat = null; if (side.amb) for (const c of side.amb) if (cops.includes(c)) removeCop(c); side.amb = null;
  side.job = null; if (mission.type === 'side') mission.type = null; clearTarget(); $('timer').textContent = '';
  $('goal').innerHTML = story.goalText && CHAPTERS[story.ch] ? `<b>${CHAPTERS[story.ch].title}</b>${story.goalText}` : '';
  if (ok && story.waitSide === j.id) story.sideOk = true;
  if (ok) { const pay = sideDone.has(j.id) && !j.gen ? Math.round(j.pay / 2) : j.pay; addMoney(pay); banner('委託完成：' + j.title, `${j.who}：「${j.thanks || '多謝啦！'}」　+$${pay.toLocaleString()}`); if (!j.gen) { sideDone.add(j.id); try { localStorage.setItem('kinmen_side', JSON.stringify([...sideDone])); } catch (e) { } } }
  else if (msg) { sfx('fail', 0.4); subtitle(msg, 4); }
}
function updateSide(dt) {
  if (!side.job) return; const st = side.job.st[side.i], w = wpos(), d = side.pt ? Math.hypot(side.pt.x - w.x, side.pt.z - w.z) : 0;
  if (side.timer > 0) { side.timer -= dt; $('timer').textContent = `⏱ ${side.job.title}　${Math.ceil(side.timer)} 秒`; if (side.timer <= 0) return endSide(false, '時間到了，委託失敗'); } else $('timer').textContent = '';
  if (st.t === 'go') { if (d < (st.r || 9)) sideNext(); return; }
  if (st.t === 'fight') {
    if (!side.thugs) { if (d < 90) { side.thugs = []; for (let k = 0; k < st.n; k++) { const a = k / st.n * 6.28 + rand(), x = side.pt.x + Math.cos(a) * 5, z = side.pt.z + Math.sin(a) * 5, c = spawnCop(x, z, false, null, true); c.thug = true; c.hp = 45; c.yaw = a + Math.PI; c.m.group.rotation.y = c.yaw; side.thugs.push(c); } subtitle('<b>混混</b>：「看什麼看？想討回相機，先過我們這關！」', 4); } return; }
    for (const c of side.thugs) if (cops.includes(c) && Math.hypot(c.pos.x - w.x, c.pos.z - w.z) < 32) c.alert = true;
    if (side.thugs.every(c => !cops.includes(c))) { addPickup('cash', side.pt.x, side.pt.z, 300); sideNext(); } return;
  }
  if (st.t === 'brawl') {
    let p = side.ped; if (p && !peds.includes(p)) p = side.ped = null;
    if (!p) { if (d < 70) { const n = nearestRoad(side.pt.x, side.pt.z, 120); if (n) { p = side.ped = spawnPed({ e: n.e, i: n.i }); p.bad = true; p.idle = 999; p.keep = true; } } return; }
    if (p.state === 'down') { p.bad = false; side.ped = null; return sideNext(); }
    if (game.frame % 20 === 0) { target = { x: p.pos.x, z: p.pos.z, label: '欠債的人' }; routeT = 0; }
    const dp = Math.hypot(p.pos.x - player.pos.x, p.pos.z - player.pos.z);
    if (!player.veh && dp < 8 && p.state !== 'fight') { if (!side.talked) { side.talked = true; subtitle('<b>欠債的</b>：「錢？什麼錢？想打架是不是！」', 4); } p.state = 'fight'; p.t = 0; p.idle = 0; }
    if (p.state === 'fight') p.t = Math.min(p.t, 4); return;
  }
  if (st.t === 'escape') {
    let v = side.boat;
    if (!v) { const f = st.from(), dx = -2900 - f.x, dz = 300 - f.z, l = Math.hypot(dx, dz); v = side.boat = makeVehicle('boat', f.x, f.z, Math.atan2(dx, dz), '#2b2b2b'); v.thug = true; v.hp = 110; v.perm = true; side.bdir = { x: dx / l, z: dz / l }; side.bt = 0; subtitle('<b>林隊長</b>：「黑色那艘！別讓它跑進對岸海域！」', 4); return; }
    if (!vehicles.includes(v) || v.hp <= 0 || v.burn) { banner('擊沉走私快艇', '走私集團一網打盡'); side.boat = null; return sideNext(); }
    side.bt += dt; const sp = Math.min(10, 3 + side.bt * 0.6); v.pos.x += side.bdir.x * sp * dt; v.pos.z += side.bdir.z * sp * dt; v.speed = sp; v.yaw = Math.atan2(side.bdir.x, side.bdir.z); vehiclePost(v, dt);
    if (Math.hypot(v.pos.x - DADAN.x, v.pos.z - DADAN.z) > 560) { removeVehicle(v); side.boat = null; return endSide(false, '快艇逃進對岸海域了，委託失敗'); }
    if (game.frame % 20 === 0) { target = { x: v.pos.x, z: v.pos.z, label: '走私快艇' }; targetMesh.visible = false; routeT = 0; } return;
  }
  if (st.t === 'chase') {
    let v = side.perp;
    if (!v) { side.retry -= dt; if (side.retry > 0) return; side.retry = 0.5; const c = roadSamples.filter(s => { const q = s.e.pts[s.i], dd = Math.hypot(q.x - w.x, q.z - w.z); return dd > 150 && dd < 380 && !s.e.bridge; }); if (!c.length) return; v = spawnTraffic(pick(c)); if (!v) return; v.perp = true; v.thug = true; v.ai.cruise = 25; v.hp = 140; side.perp = v; subtitle(`<b>老陳</b>：「是一台${v.def.name}，就在附近！」`, 4); return; }
    if (!vehicles.includes(v) || v.hp <= 45) { if (v.ai) { v.ai.cruise = 0; v.ai.stun = 999; } v.perp = false; v.thug = false; side.perp = null; banner('攔下來了', '高粱追回來了'); return sideNext(); }
    if (Math.hypot(v.pos.x - w.x, v.pos.z - w.z) > 650) return endSide(false, '小偷跑掉了，委託失敗');
    if (v.ai && v.hp < 140) v.ai.cruise = Math.min(30, 25 + (140 - v.hp) * 0.05);
    if (game.frame % 30 === 0) { target = { x: v.pos.x, z: v.pos.z, label: '偷高粱的車' }; targetMesh.visible = false; routeT = 0; }
  }
}
const storyDone = () => story.ch >= CHAPTERS.length;
function updateCalls(dt) {
  if (!storyDone()) return;
  if (life.call) { life.callAge += dt; if (life.callAge > 60) { toast('📵 未接來電：' + life.call.who); life.call = null; } return; }
  if (!mission.type && !mission.taxi && !story.active && !game.busy && !player.tunnel && !ev.cur) life.callT -= dt;
  if (life.callT <= 0) { const pool = SIDE.filter(j => !sideDone.has(j.id)), j = pick(pool.length ? pool : SIDE); life.call = j; life.callAge = 0; life.callT = rr(160, 260); sfx('chime', 0.5); subtitle(`📞 <b>${j.who}</b> 來電：「${j.pitch}」<br>按 P 打開手機接聽`, 9); }
}

/* ---------- 隨機事件：搶劫、找麻煩、車禍 ---------- */
const ev = { t: 75, cur: null };
function startEvent(kind) {
  const w = wpos(), far = (p, a, b) => { const d = Math.hypot(p.pos.x - w.x, p.pos.z - w.z); return d > a && d < b; };
  if (kind === 'thief') { const c = peds.filter(p => p.state === 'walk' && !p.dead && !p.bad && far(p, 20, 75)); if (!c.length) return false; const p = pick(c); p.state = 'thief'; p.bad = true; p.t = 0; p.rph = 0; ev.cur = { kind, p, t: 90 }; subtitle('<b>路人</b>：「搶劫啊！有人搶走我的包包！」（追上去把他撂倒）', 5); sfx('alarm', 0.12); setTarget(p.pos.x, p.pos.z, '小偷'); targetMesh.visible = false; return true; }
  if (kind === 'help') { const c = peds.filter(p => p.state === 'walk' && !p.dead && !p.bad && far(p, 35, 110)); if (!c.length) return false; const p = pick(c); p.idle = 999; p.victim = true; const thugs = []; for (const s of [-1, 1]) { const a = p.yaw + s * 0.9, x = p.pos.x + Math.sin(a) * 2.2, z = p.pos.z + Math.cos(a) * 2.2, c2 = spawnCop(x, z, false, null, true); c2.thug = true; c2.hp = 50; c2.yaw = Math.atan2(p.pos.x - x, p.pos.z - z); c2.m.group.rotation.y = c2.yaw; thugs.push(c2); } ev.cur = { kind, p, thugs, t: 150 }; subtitle('<b>路人</b>：「救命啊！他們要搶錢！」（有混混在找麻煩）', 5); setTarget(p.pos.x, p.pos.z, '求救'); return true; }
  if (kind === 'crash') { const s = nearRoadSpot(rr(70, 110)); if (!s || Math.hypot(s.x - w.x, s.z - w.z) < 40) return false; const f = fwd(s.yaw), types = ['sedan', 'taxi', 'suv', 'pickup', 'van'];
    const a = makeVehicle(pick(types), s.x, s.z, s.yaw + 0.35), b = makeVehicle(pick(types), s.x + f.x * 4.2 + f.z * 1.2, s.z + f.z * 4.2 - f.x * 1.2, s.yaw + 2.1); for (const v of [a, b]) { v.hp = 30; v.dmgSeen = 30; } scuff(a); scuff(b); breakGlass(a); breakGlass(b);
    const hx = s.x - f.z * 3, hz = s.z + f.x * 3, m = makePerson({}); m.group.position.set(hx, heightAt(hx, hz) + 0.22, hz); m.group.rotation.set(-Math.PI / 2, rand() * 6, 0, 'YXZ'); scene.add(m.group);
    const act = addAction({ x: hx, z: hz, r: 3.5, inside: null, label: () => '打 119 叫救護車', fn: () => { const i = actions.indexOf(act); if (i >= 0) actions.splice(i, 1); subtitle('<b>119</b>：「救護車馬上到，請不要移動傷者。」', 4); setTimeout(() => { scene.remove(m.group); if (ev.cur && ev.cur.kind === 'crash') endEvent(true); }, 4000); } });
    ev.cur = { kind, cars: [a, b], m, act, t: 180, x: hx, z: hz }; subtitle('前面好像出車禍了……過去看看（按 E 叫救護車）', 5); sfx('boom', 0.15); setTarget(hx, hz, '車禍'); return true; }
  return false;
}
function endEvent(ok) {
  const e = ev.cur; if (!e) return; ev.cur = null; clearTarget();
  if (e.kind === 'thief') { const p = e.p; if (ok) { addPickup('cash', p.pos.x + 0.8, p.pos.z, 400); addMoney(300); banner('抓到小偷', '包包還給失主了　+$300'); } else { if (p.state === 'thief') { p.state = 'flee'; p.t = 0; } subtitle('小偷跑掉了……', 3); } setTimeout(() => { p.bad = false; }, 9000); }
  if (e.kind === 'help') { e.p.idle = 0; e.p.victim = false; if (ok) { addMoney(800); banner('見義勇為', '+$800'); } else for (const c of e.thugs) if (cops.includes(c) && !c.alert) removeCop(c); }
  if (e.kind === 'crash') { const i = actions.indexOf(e.act); if (i >= 0) actions.splice(i, 1); if (ok) { addMoney(300); banner('熱心民眾', '+$300'); } else scene.remove(e.m.group); life.junk.push(...e.cars); }
}
function updateThief(p, dt) {
  const w = wpos(), dx = p.pos.x - w.x, dz = p.pos.z - w.z, d = Math.hypot(dx, dz) || 1; p.t += dt;
  const a = Math.sin(p.t * 0.6 + p.ph) * 0.7, tx = dx / d * Math.cos(a) - dz / d * Math.sin(a), tz = dx / d * Math.sin(a) + dz / d * Math.cos(a), ox = p.pos.x, oz = p.pos.z, sp = 6.1;
  p.pos.x += tx * sp * dt; p.pos.z += tz * sp * dt; resolveCircle(p.pos, 0.35); if (groundAt(p.pos.x, p.pos.z) < -0.4) { p.pos.x = ox; p.pos.z = oz; p.ph += 2; } if (Math.hypot(p.pos.x - ox, p.pos.z - oz) < sp * dt * 0.3) p.ph += dt * 4;
  p.pos.y = heightAt(p.pos.x, p.pos.z); p.yaw += angDiff(p.yaw, Math.atan2(tx, tz)) * Math.min(1, dt * 8); p.rph += dt * 15; poseWalk(p.m, p.rph, 1.3); p.m.group.position.copy(p.pos); p.m.group.rotation.set(0, p.yaw, 0);
}
function updateEvents(dt) {
  for (const v of [...life.junk]) if (!vehicles.includes(v) || (v !== player.veh && Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z) > 260)) { if (vehicles.includes(v) && v !== player.veh) removeVehicle(v); life.junk.splice(life.junk.indexOf(v), 1); }
  const e = ev.cur;
  if (!e) { if (!mission.type && !mission.taxi && !story.active && !game.busy && !player.inside && !player.tunnel && !player.plane && !side.job) ev.t -= dt; if (ev.t <= 0) ev.t = startEvent(pick(['thief', 'help', 'crash'])) ? rr(90, 160) : 12; return; }
  e.t -= dt; const w = wpos();
  if (e.kind === 'thief') { const p = e.p; if (!peds.includes(p)) return endEvent(false); if (p.state === 'down') return endEvent(true); if (e.t <= 0 || Math.hypot(p.pos.x - w.x, p.pos.z - w.z) > 170) return endEvent(false); if (game.frame % 20 === 0) { target = { x: p.pos.x, z: p.pos.z, label: '小偷' }; routeT = 0; } return; }
  if (e.kind === 'help') { const p = e.p, dp = Math.hypot(p.pos.x - w.x, p.pos.z - w.z); for (const c of e.thugs) if (cops.includes(c) && dp < 24) c.alert = true; if (e.thugs.every(c => !cops.includes(c))) return endEvent(true); if (e.t <= 0 || dp > 260 || !peds.includes(p)) return endEvent(false); return; }
  if (e.kind === 'crash') { if (e.t <= 0 || Math.hypot(e.x - w.x, e.z - w.z) > 300) endEvent(false); }
}

/* ---------- 跳傘、倒地、翻越 ---------- */
let canopy = null;
function makeCanopy() {
  const g = new THREE.Group(), th = Math.PI / 2.8, R = 3.4, rr0 = R * Math.sin(th), ry = R * Math.cos(th) * 0.45;
  const tex = canvasTex(128, 16, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f4f1e8' : '#e8573a'; c.fillRect(i * 16, 0, 16, 16); } });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 24, 6, 0, Math.PI * 2, 0, th).scale(1, 0.45, 0.7).translate(0, -ry, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.75, side: THREE.DoubleSide })));
  const pts = []; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; pts.push(Math.cos(a) * rr0, 0, Math.sin(a) * rr0 * 0.7, 0, -3.1, 0); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x2b2b2b })));
  scene.add(g); return g;
}
function bailOut(p) {
  const f = fwd(p.yaw); player.plane = null; player.model.group.visible = true; player.pos.set(p.pos.x - f.z * 2.5, p.pos.y - 2, p.pos.z + f.x * 2.5); player.yaw = p.yaw; player.air = true; player.vy = 0; player.sky = true; player.chute = false; player.skyT = 0;
  const s = Math.max(p.speed, 22); p.ghost = { vx: f.x * s, vz: f.z * s, vy: 0, t: 0 }; if (mission.type === 'fly') endMission(false, true); sfx('swish', 0.5); banner('跳 傘', '按空白鍵（手機按「跳」）開傘');
}
function landed(hv) {
  const sky = player.sky, chute = player.chute; player.sky = false; player.chute = false; if (canopy) canopy.visible = false; const M = player.model; M.armL.rotation.z = 0; M.armR.rotation.z = 0;
  if (waterDepthAt(player.pos.x, player.pos.z) > 1.1) return; if (sky && chute) { toast('平安著陸'); return; }
  if (hv < -27) { wasted(sky ? '沒 開 傘' : '摔 死 了'); return; }
  if (hv < -13) { damage((-hv - 13) * 4); player.down = 1.3; player.downT = 0; player.dv = { x: 0, z: 0 }; player.vy = 0; }
}
function updateSky(dt) {
  for (const p of [...planes]) if (p.ghost) { const g = p.ghost; g.t += dt; g.vy -= 9.8 * dt; p.pos.x += g.vx * dt; p.pos.z += g.vz * dt; p.pos.y += g.vy * dt; p.group.position.copy(p.pos); p.group.rotation.set(Math.min(0.9, g.t * 0.25), p.yaw, g.t * 0.5, 'YXZ');
    if (p.pos.y <= Math.max(0, heightAt(p.pos.x, p.pos.z)) + 0.6) { scene.remove(p.group); planes.splice(planes.indexOf(p), 1); explode(p.pos.x, Math.max(p.pos.y, 0.6), p.pos.z, null); setTimeout(() => makePlane(...p.home), 4000); } }
  if (!player.sky) return; if (!player.air) { player.sky = false; return; }
  player.skyT += dt; const M = player.model;
  if (!player.chute && player.skyT > 0.5 && (keys.Space || touch.jump)) { player.chute = true; touch.jump = false; player.vy = Math.max(player.vy, -12); sfx('swish', 0.6); toast('開傘！'); }
  if (player.chute) { if (!canopy) canopy = makeCanopy(); canopy.visible = true; canopy.position.set(player.pos.x, player.pos.y + 4.7, player.pos.z); canopy.rotation.y = player.yaw; const f = fwd(player.yaw); player.pos.x += f.x * 5 * dt; player.pos.z += f.z * 5 * dt; M.armL.rotation.set(-2.8, 0, 0); M.armR.rotation.set(-2.8, 0, 0); M.armL.lo.rotation.x = 0; M.armR.lo.rotation.x = 0; }
  else { M.group.rotation.set(1.25, player.yaw, 0, 'YXZ'); M.armL.rotation.set(-2.2, 0, 0.9); M.armR.rotation.set(-2.2, 0, -0.9); M.legL.rotation.x = 0.35; M.legR.rotation.x = 0.35; $('timer').textContent = `高度 ${Math.round(player.pos.y - Math.max(0, heightAt(player.pos.x, player.pos.z)))} m　按空白鍵開傘`; }
  if (player.chute && !side.job) $('timer').textContent = '';
}
function knockPlayer(v) { const s = Math.abs(v.speed); damage(6 + s * 1.1); if (player.hp <= 0 || game.busy) return; player.down = 2.4; player.downT = 0; player.dv = { x: v.vx * 0.55 || fwd(v.yaw).x * s * 0.55, z: v.vz * 0.55 || fwd(v.yaw).z * s * 0.55 }; player.vy = 3 + s * 0.08; player.air = false; sfx('thud', 0.6); }
function updateDown(dt) {
  const G = player.model.group; player.down -= dt; player.downT += dt; player.pos.x += player.dv.x * dt; player.pos.z += player.dv.z * dt; const k = Math.exp(-2.5 * dt); player.dv.x *= k; player.dv.z *= k;
  player.vy -= 19 * dt; const gy = heightAt(player.pos.x, player.pos.z); player.pos.y = Math.max(gy, player.pos.y + player.vy * dt); if (player.pos.y <= gy) player.vy = 0; resolveCircle(player.pos, 0.45);
  const lie = player.down > 0.6 ? Math.min(1, player.downT * 5) : Math.max(0, player.down / 0.6); poseWalk(player.model, 0, 0); G.rotation.set(-Math.PI / 2 * lie, player.yaw, 0, 'YXZ'); G.position.set(player.pos.x, player.pos.y + 0.22 * lie, player.pos.z);
  if (player.down <= 0) { player.down = 0; G.rotation.set(0, player.yaw, 0); }
}
const ROOF = { sports: 1.25, sedan: 1.5, taxi: 1.66, police: 1.62, suv: 1.8, pickup: 1.7, van: 2.3, jeep: 1.9, tank: 2.3 };
function roofH(v) { return ROOF[v.type] || 0; }
function vaultH() {
  const f = fwd(player.yaw), ax0 = player.pos.x + f.x * 1.1, az0 = player.pos.z + f.z * 1.1;
  for (const v of vehicles) { const rh = roofH(v); if (!rh || Math.abs(v.pos.x - player.pos.x) > 8 || Math.abs(v.pos.z - player.pos.z) > 8) continue; for (const c of vCircles(v)) if (Math.hypot(c.x - ax0, c.z - az0) < c.r + 0.35) { const dh = v.pos.y + rh - player.pos.y; if (dh > 0.5 && dh < 2.8) return dh; } }
  return 0;
}

/* ---------- 車損：凹陷、破窗、冒煙 ---------- */
const mGlassBroken = new THREE.MeshStandardMaterial({ color: 0xc9d3db, roughness: 0.35, metalness: 0.2, transparent: true, opacity: 0.8, map: canvasTex(128, 128, g => { g.fillStyle = '#9aa7b2'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#f4f8fb'; g.lineWidth = 1.2; for (let k = 0; k < 4; k++) { const cx = rand() * 128, cy = rand() * 128; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + rand() * 0.4; let x = cx, y = cy; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 5; s++) { x += Math.cos(a + rand() * 0.6 - 0.3) * 14; y += Math.sin(a + rand() * 0.6 - 0.3) * 14; g.lineTo(x, y); } g.stroke(); } } }) });
/* 車漆隨車況變髒變暗（不改模型頂點，避免部分顯示卡卡住） */
function scuff(v) {
  if (!v.paint || v.def.boat) return; if (!v.paint0) v.paint0 = v.paint; const lv = v.hp < 40 ? 2 : v.hp < 70 ? 1 : 0; if ((v.scuffLv || 0) >= lv) return; v.scuffLv = lv;
  const c = v.paint0.color.clone().lerp(new THREE.Color('#3b342d'), lv * 0.24), m2 = mat('#' + c.getHexString(), 0.35 + lv * 0.22, Math.max(0.05, 0.35 - lv * 0.14)), old = v.paint;
  for (const o of v.group.children) if (o.isMesh && o.material === old) o.material = m2; v.paint = m2;
}
function setPaint(v, m2) { const old = v.paint; for (const o of v.group.children) if (o.isMesh && o.material === old) o.material = m2; v.paint = m2; v.paint0 = m2; v.scuffLv = 0; }
function breakGlass(v) { if (v.glassBroken) return; v.glassBroken = true; for (const o of v.group.children) if (o.isMesh && o.material === mGlass) { o.userData.glass0 = o.material; o.material = mGlassBroken; } }
function repairVeh(v) { v.hp = v.bulletproof ? 160 : 100; v.burn = 0; v.dmgSeen = v.hp; v.glassBroken = false; if (v.paint0) setPaint(v, v.paint0); for (const o of v.group.children) if (o.isMesh && o.userData.glass0) { o.material = o.userData.glass0; delete o.userData.glass0; } }
function updateDamage(dt) {
  for (const v of vehicles) { if (!v.paint || Math.abs(v.pos.x - player.pos.x) > 160 || Math.abs(v.pos.z - player.pos.z) > 160) continue;
    if (v.dmgSeen === undefined) v.dmgSeen = v.hp;
    if (v.hp < v.dmgSeen - 2) { scuff(v); v.hitP = null; v.dmgSeen = v.hp; } else if (v.hp > v.dmgSeen) v.dmgSeen = v.hp;
    if (v.hp < 55 && !v.glassBroken && !v.def.boat) { breakGlass(v); sfx('thud', 0.25); }
    if (v.hp < 35 && v.hp > 0 && !v.burn && rand() < dt * 6) { const f = fwd(v.yaw), l = v.def.len * 0.42; puff(v.pos.x + f.x * l + rr(-0.3, 0.3), v.pos.y + 1.1, v.pos.z + f.z * l + rr(-0.3, 0.3), 0.6, 2.4, 1.6, smokeTex, false, 1.8); } }
}

/* ---------- 改車店 ---------- */
let modShop = null; const PAINTS = ['#c0392b', '#1f3a5f', '#f4f4f0', '#141414', '#d4a017', '#27ae60', '#8e44ad', '#e67e22', '#7f8c8d', '#2e86de'];
function buildModShop() {
  const o = office(24.4302, 118.3132, 12, 9, 1, '阿明改車廠', '#d9d2c3', '#c0392b'); if (!o) return; const fx = Math.sin(o.rot), fz = Math.cos(o.rot), x = o.x + fx * 4, z = o.z + fz * 4;
  modShop = { x, z, open: false }; ringAt(x, z, 0xe67e22, 3.2); const ic = iconSprite('修', '#e67e22'); ic.scale.set(1.6, 1.6, 1); ic.position.set(x, heightAt(x, z) + 5.6, z); scene.add(ic); PLACES.push({ name: '阿明改車廠', x, z, r: 20 });
}
function respray(v) { v.ci = ((v.ci ?? PAINTS.indexOf(v.carColor)) + 1) % PAINTS.length; const c = PAINTS[v.ci]; v.carColor = c; setPaint(v, mat(c, 0.35, 0.35)); }
function openModMenu(v) {
  const buy = (n, f) => () => { if (player.money < n) { toast('錢不夠'); sfx('fail', 0.2); return; } addMoney(-n); f(); sfx('chime', 0.3); openModMenu(v); };
  const items = [{ n: '修車', d: `$300・目前車況 ${Math.max(0, Math.round(v.hp / (v.bulletproof ? 1.6 : 1)))}%`, fn: buy(300, () => repairVeh(v)) }, { n: '噴漆', d: '$500・換顏色（可以一直換）', fn: buy(500, () => respray(v)) },
    v.engine > 1 ? { n: '引擎已升級 ✅', d: '極速與加速 +25%', fn: () => { } } : { n: '引擎升級', d: '$3,000・極速與加速 +25%', fn: buy(3000, () => { v.engine = 1.25; }) },
    v.bulletproof ? { n: '防彈已改裝 ✅', d: '子彈幾乎打不穿', fn: () => { } } : { n: '防彈改裝', d: '$5,000・車窗防彈、車體更耐打', fn: buy(5000, () => { v.bulletproof = true; v.hp = Math.max(v.hp, 160); v.dmgSeen = v.hp; }) },
    { n: '離開', d: '', fn: closeMenu }];
  openMenu('🔧 阿明改車廠　' + v.def.name, items.map(i => ({ ...i, free: true }))); game.menu.shop = true;
}
function updateModShop() {
  if (!modShop) return; const v = player.veh, d = v ? Math.hypot(v.pos.x - modShop.x, v.pos.z - modShop.z) : 1e9;
  if (game.menu && game.menu.shop && d > 7) closeMenu();
  if (d > 8) { modShop.open = false; return; }
  if (!modShop.open && v && !v.def.boat && v.type !== 'tank' && d < 4.5 && Math.abs(v.speed) < 2 && !game.menu) { modShop.open = true; openModMenu(v); }
}
function bpHit(n) { const v = player.veh; if (v && v.bulletproof) { v.hp -= n * 0.15; return; } damage(n); }

/* ---------- 雨天撐傘 ---------- */
const umbMats = ['#2c3e50', '#c0392b', '#2e86de', '#f1c40f', '#27ae60', '#8e44ad', '#ecf0f1'].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide }));
let umbGeo = null;
function makeUmb(p) { if (!umbGeo) umbGeo = [new THREE.ConeGeometry(0.95, 0.35, 10, 1, true).translate(0, 2.3, 0), new THREE.CylinderGeometry(0.015, 0.015, 1.05, 4).translate(0, 1.78, 0)]; const g = new THREE.Group(); g.add(new THREE.Mesh(umbGeo[0], pick(umbMats)), new THREE.Mesh(umbGeo[1], mTrim)); g.position.set(0.2, 0, 0.12); p.m.group.add(g); return g; }
function updateUmbrellas() {
  const rain = weather.k.rain > 0.4;
  for (const p of peds) { if (p.dead || p.state === 'down' || p.m.group.rotation.x) { if (p.umb) p.umb.visible = false; continue; }
    if (rain && p.umb === undefined && Math.abs(p.pos.x - player.pos.x) < 140 && Math.abs(p.pos.z - player.pos.z) < 140) p.umb = rand() < 0.75 ? makeUmb(p) : null;
    if (p.umb) { p.umb.visible = rain; if (rain) { p.m.armR.rotation.set(-0.55, 0, 0); p.m.armR.lo.rotation.x = -1.3; } } }
}

/* ---------- 主更新、建造、除錯 ---------- */
life.junk = [];
function buildLife() { buildHomes(); buildModShop(); buildDadan(); buildMyHome(); buildKinmen(); buildAds(); }
function fixDoors() { for (const R of rooms) { const o = R.out; if (!o || boxFree(o.x, o.z, 0.6)) continue; const f = fwd(o.yaw || 0), r = { x: f.z, z: -f.x }; let ok = null;
    for (const fd of [0, 1, 2, 3]) { for (const sd of [0, -1, 1, -2, 2, -3, 3]) { const x = o.x + f.x * fd + r.x * sd, z = o.z + f.z * fd + r.z * sd; if (boxFree(x, z, 0.7)) { ok = { ...o, x, z }; break; } } if (ok) break; } if (ok) R.out = ok; } }
function updateLife(dt) {
  if (!life.doorsFixed) { life.doorsFixed = true; fixDoors(); }
  updateDadan(); updateKinmenFX(dt); updateMyHome(); updateAds(); updateSky(dt); updateHomes(dt); updateModShop(); updateCalls(dt); updateSide(dt); updateEvents(dt); updateDamage(dt); updateUmbrellas();
  for (const e of [ev.cur]) if (e && e.kind === 'help' && e.p.victim) { e.p.m.armL.rotation.set(-2.8, 0, 0); e.p.m.armR.rotation.set(-2.8, 0, 0); }
}
function lifeDebug() {
  return {
    homes: () => homes.map(h => [h.name, h.own, h.car && h.car.type]), buyHome: i => { const h = homes[i]; player.money += h.price; buyHome(h); return h.own; }, homeGo: i => { const h = homes[i]; tpTo(h.x, h.z); return h.name; }, homeMenu: i => homeMenu(homes[i]), garGo: i => { const h = homes[i]; tpTo(h.gx, h.gz); return [h.gx, h.gz]; }, garOut: i => garageOut(homes[i]),
    sides: () => SIDE.map(j => j.id), side: id => { const j = id === 'deliver' ? null : SIDE.find(s => s.id === id); if (j) startSide(j); else startDeliveryJob(); return side.job && side.job.id; }, sideSt: () => side.job ? { id: side.job.id, i: side.i, n: side.job.st.length, t: side.job.st[side.i].t, timer: Math.round(side.timer), thugs: side.thugs ? side.thugs.filter(c => cops.includes(c)).length : null, perp: side.perp ? Math.round(side.perp.hp) : null, ped: side.ped ? side.ped.state : null } : null,
    sideTp: () => { if (side.pt) tpTo(side.pt.x + 3, side.pt.z + 3); return !!side.pt; }, sideKill: () => { if (side.boat) side.boat.hp = 0; if (side.amb) for (const c of side.amb) if (cops.includes(c)) killCop(c); if (side.thugs) for (const c of side.thugs) if (cops.includes(c)) killCop(c); if (side.perp) side.perp.hp = 40; if (side.ped) knockPed(side.ped, 1, 1); }, sideDone: () => [...sideDone], ring: () => { life.callT = 0; }, call: () => life.call && life.call.id, answer: () => { const it = callItems()[0]; if (it) it.fn(); return side.job && side.job.id; },
    ev: k => { if (ev.cur) endEvent(null); return startEvent(k); }, evSt: () => ev.cur ? { kind: ev.cur.kind, t: Math.round(ev.cur.t), p: ev.cur.p ? ev.cur.p.state : null, thugs: ev.cur.thugs ? ev.cur.thugs.filter(c => cops.includes(c)).length : null } : null, evWin: () => { const e = ev.cur; if (!e) return; if (e.kind === 'thief') knockPed(e.p, 1, 1); if (e.kind === 'help') for (const c of e.thugs) if (cops.includes(c)) killCop(c); if (e.kind === 'crash') { tpTo(e.x + 1.5, e.z); } },
    modGo: () => { if (!modShop) return false; tpTo(modShop.x, modShop.z); return true; }, mod: () => { if (player.veh) openModMenu(player.veh); return !!game.menu; }, menuPick: i => { const it = game.menu && game.menu.items[i]; if (it) it.fn(); return game.menu && game.menu.title; }, veh: () => { const v = player.veh; return v ? { type: v.type, hp: Math.round(v.hp), eng: v.engine || 1, bp: !!v.bulletproof, color: v.carColor || (v.paint && '#' + v.paint.color.getHexString()), glass: !!v.glassBroken } : null; },
    hurtVeh: n => { const v = player.veh || vehicles.find(o => Math.hypot(o.pos.x - player.pos.x, o.pos.z - player.pos.z) < 10); if (!v) return null; v.hitP = { x: v.pos.x + fwd(v.yaw).x * 2.2, z: v.pos.z + fwd(v.yaw).z * 2.2 }; v.hp -= n; return Math.round(v.hp); },
    bail: () => { const p = player.plane; if (!p) return 'no plane'; exitPlane(); return player.sky; }, sky: () => ({ sky: !!player.sky, chute: !!player.chute, y: Math.round(player.pos.y), air: player.air }), chute: () => { touch.jump = true; }, knock: () => { const v = vehicles.find(o => o.type !== 'boat') || vehicles[0]; v.speed = 14; v.vx = 10; v.vz = 0; knockPlayer(v); v.speed = 0; v.vx = 0; return player.down; }, down: () => +(player.down || 0).toFixed(2),
    blockers: nm => { const m = rooms.find(r => r.name.includes(nm)), o = m.out, out = []; for (const arr of colHash.values()) for (const c of arr) { if (c.off || out.includes(c)) continue; const dx = o.x - c.x, dz = o.z - c.z, lx = dx * c.cos - dz * c.sin, lz = dx * c.sin + dz * c.cos; if (Math.abs(lx) < c.hw + 0.5 && Math.abs(lz) < c.hd + 0.5) out.push(c); } return { door: [o.x, o.z], room: [m.x, m.z, m.w, m.d], hits: out.map(c => [+c.x.toFixed(1), +c.z.toFixed(1), c.hw, c.hd, +Math.atan2(c.sin, c.cos).toFixed(2)]) }; },
    dgo: () => { dadanGo(); return true; }, dwall: () => { tpTo(dadan.wall.x, dadan.wall.z); return [Math.round(dadan.wall.x), Math.round(dadan.wall.z)]; }, dpier: () => { tpTo(dadan.pier.x, dadan.pier.z); return true; }, dground: () => [+groundAt(player.pos.x, player.pos.z).toFixed(1), +sdAt(player.pos.x, player.pos.z).toFixed(1)], neon: () => dadan.sign && +dadan.sign.material.emissiveIntensity.toFixed(2),
    lights: () => ({ beacon: targetMesh.visible, flash: Math.round(flashLight.intensity), room: Math.round(roomLight.intensity), hemi: +hemi.intensity.toFixed(2), sun: +sun.intensity.toFixed(2), exp: +renderer.toneMappingExposure.toFixed(2), head: Math.round(headLamp.intensity), heli: Math.round(heliSpot.intensity), hurt: document.getElementById('hurt').className }),
    myhome: () => { homeGo(); return !!myHome.ext; }, myin: () => { const E = myHome.ext; tpTo(E.m.trig.x, E.m.trig.z); return player.tunnel && player.tunnel.name; }, myfl: n => { const o = FLOOR_ORIGIN(n); player.pos.set(o.x - 0.9, 2, o.z - 3.5); return n; }, mytp: (n, dx, dz, yaw) => { const o = FLOOR_ORIGIN(n); player.pos.set(o.x + dx, 2, o.z + dz); player.yaw = yaw; cam.yaw = yaw; return true; }, roofUp: () => { roofUp(); return true; }, roofDown: () => { roofDown(); return true; }, onRoof: () => !!myHome.onRoof, mj: () => { myHome.mjT = -9; const m0 = player.money; playMahjong(); return player.money - m0; }, safe: () => safeMoney, ads: () => adBoards.length, adGo: i => { const b = adBoards[i]; tpTo(b.x + Math.sin(b.rot) * 16, b.z + Math.cos(b.rot) * 16); player.yaw = b.rot + Math.PI; cam.yaw = player.yaw; return true; }, spInfo: () => { const v = vehicles.find(o => o.type === 'sports'); const g = myHome.ext.garage; return v ? [Math.round(v.pos.x), Math.round(v.pos.z), +v.yaw.toFixed(2), Math.round(g.x), Math.round(g.z), +myHome.ext.rot.toFixed(2), Math.round(v.pos.y*10)/10] : null; }, homeRing: () => myHome.ring ?? -1, startPos: () => [Math.round(missionSpots.start.x), Math.round(missionSpots.start.z)], act: () => { const a = nearAction(); return a ? a.label() : null; }, doAct: () => { const a = nearAction(); if (a) a.fn(); return !!a; },
    myview: () => myHomeView(),
    st: () => ({ ch: story.ch, fn: CHAPTERS[story.ch] && CHAPTERS[story.ch].fn, step: story.step, active: story.active, dialog: !!story.dialog, wait: story.waitSide, tunnel: player.tunnel && player.tunnel.name, timer: Math.round(story.timer || 0) }),
    actGo: (q) => { const a = actions.find(a => !a.inside && !a.tunnel && String(a.label()).includes(q)); if (!a) return null; exitForce(); tpTo(a.x, a.z); const r = a.label(); a.fn(); return r; },
    mineGo: () => { const m = mine.zones[0]; if (!m) return null; exitForce(); tpTo(m.x, m.z); return [m.x, m.z]; },
    lakeFit: () => LAKES.map(l => { const rd = (x, z) => { let bd = 1e9; for (const e of roadEdges) for (const p of e.pts) bd = Math.min(bd, Math.hypot(p.x - x, p.z - z)); return bd; }; if (rd(l.x, l.z) > l.r + 8) return null; let best = null; for (let dx = -120; dx <= 120; dx += 8) for (let dz = -120; dz <= 120; dz += 8) { const x = l.x + dx, z = l.z + dz; if (rd(x, z) > l.r + 10 && sdAt(x, z) > l.r + 12) { const c = Math.hypot(dx, dz); if (!best || c < best[2]) best = [dx, dz, c]; } } return best; }),
    lakeRoad: () => LAKES.map(l => { let bd = 1e9, bp = null; for (const e of roadEdges) for (const p of e.pts) { const d = Math.hypot(p.x - l.x, p.z - l.z); if (d < bd) { bd = d; bp = p; } } return [Math.round(l.x), Math.round(l.z), l.r, Math.round(bd), Math.round(bp.x - l.x), Math.round(bp.z - l.z), +l.wy.toFixed(1), +groundAt(l.x + l.r * 1.2, l.z).toFixed(1)]; }),
    wildC: () => ({ bee: bee.c && [bee.c.x, bee.c.z, bee.c.f.x, bee.c.f.z, bee.c.y], hoo: hoo.c && [hoo.c.x, hoo.c.z] }),
    season: (i) => { if (i != null) setSeason(i); return season; },
    brC: () => ({ on: BR.on, i: BR.i, cps: BR.cps.map(c => [Math.round(c.x), Math.round(c.z), c.name]) }),
    brLen: () => { let L = 0, p = BR.start; for (const c of BR.cps) { const r = computeRoute(p.x, p.z, c.x, c.z); if (r) for (let i = 1; i < r.length; i++) L += Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]); p = c; } return Math.round(L); },
    pedGo: () => { const p = peds.find(p => p.state === 'walk'); if (!p) return null; exitForce(); tpTo(p.pos.x + 1.5, p.pos.z + 1.5); return true; },
    pc: () => { useComputer(); const t = document.body.innerText; closeMenu(); return t.slice(t.indexOf('浯島風雲 進度'), t.indexOf('浯島風雲 進度') + 200); },
    probe: (lat, lon) => { const c = GW(lat, lon), o = []; for (let d = -60; d <= 60; d += 10) { const x = c.x + d, z = c.z; o.push([d, +groundAt(x, z).toFixed(2), +sdAt(x, z).toFixed(1)]); } return o; },
    wx: (i) => { setWeather(i); weather.k.sun = WEATHER[i].sun; weather.k.rain = WEATHER[i].rain; weather.k.near = WEATHER[i].fog[0]; weather.k.far = WEATHER[i].fog[1]; return WEATHER[i].name; },
    sloganAt: (i) => sloganList[i] && [sloganList[i].x, sloganList[i].z, sloganList[i].ry],
    sloganGo: (i) => { const s = sloganList[i]; if (!s) return sloganList.length; exitForce(); tpTo(s.x + Math.sin(s.ry) * 9, s.z + Math.cos(s.ry) * 9); player.yaw = s.ry + Math.PI; return sloganList.length; },
    stalkAt: () => SORG[0] && [SORG[0].x, SORG[0].z],
    lanAt: () => lanternAt && [lanternAt[2], lanternAt[57]],
    boats: () => harbor.boats.map(b => [Math.round(b.x), Math.round(b.z)]),
    rigGunT: (anim, x, y, z, rx, ry, rz) => { const P = window.__studio.p; if (!P || !P.rig) return 'no'; Object.assign(RIG_GUN, { x, y, z, rx, ry, rz }); const g = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.5).translate(0, 0, 0.25), mTrim); if (P.rig.gunH) P.rig.gunH.clear(); rigGun(P, g); rigPlay(P, anim, 0); P.rig.mixer.update(0.1); g.updateWorldMatrix(true, false); const wp = new V3(), ws = new V3(), hp = new V3(); g.getWorldPosition(wp); g.getWorldScale(ws); P.rig.hand.getWorldPosition(hp); return [wp.toArray().map(v => +v.toFixed(2)), ws.toArray().map(v => +v.toFixed(3)), hp.toArray().map(v => +v.toFixed(2)), g.visible, P.rig.hand.name]; },
    rigSitT: (th, sh) => { if (th !== undefined) Object.assign(RIG_SIT, { th, sh }); const P = window.__studio.p; rigSit(P); return !!P.rig; },
    roadGrade: () => { const out = []; for (const e of roadEdges) { if (e.bridge) continue; let mx = 0, at = null; for (let i = 1; i < e.pts.length; i++) { const a = e.pts[i - 1], b = e.pts[i], d = Math.hypot(b.x - a.x, b.z - a.z) || 1, g = Math.abs(heightAt(b.x, b.z) - heightAt(a.x, a.z)) / d; if (g > mx) { mx = g; at = [+(b.x / KM).toFixed(2), +(-b.z / KM).toFixed(2)]; } } out.push([e.name, +mx.toFixed(3), at]); } return out.sort((a, b) => b[1] - a[1]).slice(0, 10); },
    tlInfo: () => ({ n: TL.nodes.length, camps: TL.camps, campAt: (TL.campPts || []).map(d => [d.kx, d.ky, +d.rot.toFixed(2)]), gates: TL.gates, signs: TL.signs, steles: TL.steles, vis: TL.sg.filter(q => q[0].visible).length, fc: TL.fc, cp: camera.position.toArray().map(v => Math.round(v)), st: TL.sg.filter(q => q[4] !== undefined).slice(0, 3).map(q => [+((q[2] + Math.sin(q[4]) * 4) / KM).toFixed(4), +(-(q[3] + Math.cos(q[4]) * 4) / KM).toFixed(4), +(q[2] / KM).toFixed(4), +(-q[3] / KM).toFixed(4)]), at: TL.nodes.slice(0, 6).map(n => [+(n.x / KM).toFixed(2), +(-n.z / KM).toFixed(2)]) }),
    sgDbg: () => { const s = signMesh('上林埔', 1.75, { color: '#b3261e', size: 96, pad: 8, vertical: true }); const q = TL.sg[0][0]; return s.material.map.image.toDataURL(); return [s.geometry.parameters, s.material.map.image.width, s.material.map.image.height, q.geometry.parameters, q.scale.toArray(), q.rotation.toArray().slice(0, 3)]; },
    busBoardT: () => { const v = vehicles.find(v => v.ai && v.ai.route); if (!v) return 'nobus'; v.speed = 0; v.ai.route.wait = 3; const f = fwd(v.yaw); player.pos.set(v.pos.x + f.z * 3, v.pos.y, v.pos.z - f.x * 3); const r = interact(); return [r, !!player.bus, player.money]; },
    busRide: () => ({ on: !!player.bus, vis: player.model.group.visible, px: +(player.pos.x / KM).toFixed(3), pz: +(-player.pos.z / KM).toFixed(3) }), interact: () => interact(),
    busInfo: () => ({ routes: BUSR.routes.map(R => R.ref + ':' + R.edges.length + '/' + R.stops.length), stops: BUSR.stops.length, live: vehicles.filter(v => v.ai && v.ai.route).map(v => [v.ai.route.R.ref, v.ai.route.k, +v.speed.toFixed(1), v.ai.route.wait > 0, +(v.pos.x / KM).toFixed(3), +(-v.pos.z / KM).toFixed(3), +v.yaw.toFixed(2)]) }),
    herTalk: () => { heritageTalk(HERITAGE[0]); heritageTalk(HERITAGE[0]); const a = actions.filter(a => a.inside === HERITAGE[1].R).map(a => a.label()); return [$('subtitle').textContent.slice(0, 60), player.money, a]; },
    herInfo: () => HERITAGE.map(H => { const r = rooms.indexOf(H.R); return [H.name, r, +(H.R.door.x / KM).toFixed(4), +(-H.R.door.z / KM).toFixed(4), +(H.R.cx / KM).toFixed(4), +(-H.R.cz / KM).toFixed(4)]; }),
    dyUp: () => { const a = actions.find(a => a.label && (() => { try { return a.label() === '⬆ 爬上得月樓槍樓頂'; } catch (e) { return false; } })()); if (!a) return 'none'; player.pos.set(a.x, heightAt(a.x, a.z), a.z); return interact(); },
    dyDbg: () => [deyueAt.x, deyueAt.z, groundAt(deyueAt.x, deyueAt.z), heightAt(deyueAt.x, deyueAt.z), deckY(deyueAt.x, deyueAt.z)],
    actDbg: () => { const a = nearAction(); if (!a) return null; const l = a._l; a.fn(); return [l, a.x, a.z, +player.pos.x.toFixed(1), +player.pos.z.toFixed(1)]; },
    ylUp: () => { const H = HERITAGE.find(h => h.name === '陳景蘭洋樓'); const a = actions.find(a => a.inside === H.R && a.label() === '⬆ 上二樓陽台'); player.pos.set(a.x, H.R.Y, a.z); const r1 = interact(); return [r1, a.label()]; },
    ylState: () => ({ y: +player.pos.y.toFixed(2), inside: player.inside ? player.inside.name : null, near: (nearAction() || {})._l || null }),
    doorDbg: n => { const m = rooms.find(r => r.name === n); const o = m.out, out = []; for (const arr of colHash.values()) for (const c of arr) { const dx = o.x - c.x, dz = o.z - c.z; if (Math.hypot(dx, dz) < c.r + 0.6) out.push([+(c.x - o.x).toFixed(1), +(c.z - o.z).toFixed(1), c.hw, c.hd]); } return [m.cx === undefined ? 0 : 1, out.slice(0, 6), BUSR.stops.filter(s => Math.hypot(s.x - o.x, s.z - o.z) < 4).map(s => s.name), TL.sg.filter(q => Math.hypot(q[2] - o.x, q[3] - o.z) < 4).length]; },
    mapProf: () => { const t0 = performance.now(); drawBigMap(); const t1 = performance.now(); drawMinimap(); const t2 = performance.now(); return [Math.round(t1 - t0), Math.round(t2 - t1)]; },
    meshStat: () => { const c = {}; let vis = 0, all = 0; scene.traverse(o => { if (!(o.isMesh || o.isSprite || o.isLine)) return; all++; let v = o.visible, p = o.parent; while (v && p) { v = p.visible; p = p.parent; } if (!v) return; vis++; const k = (o.isSkinnedMesh ? 'skin' : o.isInstancedMesh ? 'inst' : o.isSprite ? 'sprite' : o.geometry.type) + (o.material && o.material.map ? '+tex' : ''); c[k] = (c[k] || 0) + 1; }); return { all, vis, c }; },
    meshStat2: () => { const c = {}; scene.traverse(o => { if (!o.isMesh || o.geometry.type !== 'BufferGeometry' || !o.material.map) return; const im = o.material.map.image; const k = (im ? im.width + 'x' + im.height : '?') + ' v' + o.geometry.attributes.position.count; c[k] = (c[k] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 12); },
    rbInfo: () => ({ n: RBT.nodes.length, names: RBT.nodes.map(n => n.rbName), at: RBT.nodes.map(n => [+(n.x / KM).toFixed(3), +(-n.z / KM).toFixed(3)]), circling: vehicles.filter(v => v.ai && v.ai.rb).length }),
    carInfo: () => ({ ready: CARM.ready, err: CARM.err, n: Object.keys(CARM.m), withModel: vehicles.filter(v => v.group.userData.model).length, total: vehicles.length }),
    surv: () => ({ ...SURV, el: null, money: player.money }), survStart: g => survStart(g), survSet: (h, hu) => { SURV.hours = h; if (hu !== undefined) SURV.hunger = hu; }, survEat: n => survEat(n),
    auditWorld: () => {
      const boxes = new Set(); for (const a of colHash.values()) for (const c of a) boxes.add(c);
      const onRoad = [], slope = [], wet = []; let nb = 0;
      for (const c of boxes) { if (c.off) continue; nb++; let pen = 0, pe = null, y0 = 1e9, y1 = -1e9, lake = 0;
        for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const lx = i / 2 * c.hw, lz = j / 2 * c.hd, x = c.x + lx * c.cos + lz * c.sin, z = c.z - lx * c.sin + lz * c.cos; const n = nearestRoad(x, z, 16); if (n && !n.e.bridge && !n.e.tunnel) { const d = n.e.hw - n.dist; if (d > pen) { pen = d; pe = n.e; } } if (Math.abs(i) === 2 && Math.abs(j) === 2) { const g = groundAt(x, z); y0 = Math.min(y0, g); y1 = Math.max(y1, g); } if (typeof inLake === 'function' && inLake(x, z)) lake++; }
        const R = { x: Math.round(c.x), z: Math.round(c.z), w: +(c.hw * 2).toFixed(1), d: +(c.hd * 2).toFixed(1) };
        if (pen > 0.6) onRoad.push({ ...R, pen: +pen.toFixed(1), road: pe.type, top: c.top !== undefined }); if (y1 - y0 > 2.2 && c.r > 3) slope.push({ ...R, dy: +(y1 - y0).toFixed(1) }); if (lake > 3) wet.push(R); }
      const trees = []; let nt = 0; for (const a of TREEG.values()) for (const t of a) { nt++; const n = nearestRoad(t.x, t.z, 14); if (n && !n.e.bridge && !n.e.tunnel && n.dist < n.e.hw - 0.2) trees.push({ x: Math.round(t.x), z: Math.round(t.z), in: +(n.e.hw - n.dist).toFixed(1) }); }
      onRoad.sort((a, b) => b.pen - a.pen); slope.sort((a, b) => b.dy - a.dy);
      return { boxes: nb, trees: nt, onRoad: onRoad.length, onRoadBig: onRoad.filter(o => o.w > 4 && o.d > 4).length, slope: slope.length, wet: wet.length, treesOnRoad: trees.length, sampleRoad: onRoad.slice(0, 25), sampleSlope: slope.slice(0, 12), sampleWet: wet.slice(0, 6), sampleTrees: trees.slice(0, 8) };
    },
    auditEdges: () => { const boxes = new Set(); for (const a of colHash.values()) for (const c of a) if (c.hw > 4 && c.hd > 4 && !c.off) boxes.add(c); const hit = new Map();
      for (const c of boxes) for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { const lx = i / 4 * c.hw, lz = j / 4 * c.hd, x = c.x + lx * c.cos + lz * c.sin, z = c.z - lx * c.sin + lz * c.cos, n = nearestRoad(x, z, 16); if (n && !n.e.bridge && !n.e.tunnel && n.e.hw - n.dist > 0.6) { let h = hit.get(n.e); if (!h) hit.set(n.e, h = { n: 0, bx: new Set() }); h.n++; h.bx.add(Math.round(c.x) + ',' + Math.round(c.z) + ' ' + Math.round(c.hw * 2) + 'x' + Math.round(c.hd * 2)); } }
      return [...hit].map(([e, h]) => ({ id: e.id, type: e.type, len: Math.round(e.len), a: [Math.round(e.pts[0].x), Math.round(e.pts[0].z)], b: [Math.round(e.pts[e.pts.length - 1].x), Math.round(e.pts[e.pts.length - 1].z)], hits: h.n, boxes: [...h.bx].slice(0, 3) })); },
    freeSpots: (cx, cz, R, r) => { const o = []; for (let x = cx - R; x <= cx + R; x += 12) for (let z = cz - R; z <= cz + R; z += 12) { if (!roadClear(x, z, r) || inLake(x, z)) continue; let ok = true, y0 = 1e9, y1 = -1e9; for (let a = 0; a < 6.28 && ok; a += 0.7) for (const k of [0.5, 1]) { const px = x + Math.cos(a) * r * k, pz = z + Math.sin(a) * r * k; if (resolveCircle({ x: px, z: pz }, 1.5)) { ok = false; break; } const g = groundAt(px, pz); y0 = Math.min(y0, g); y1 = Math.max(y1, g); } if (ok && y1 - y0 < 3 && y0 > 2) o.push([Math.round(x), Math.round(z), +(y1 - y0).toFixed(1), +y0.toFixed(1), Math.round(Math.hypot(x - cx, z - cz))]); } return o.sort((a, b) => a[4] - b[4]).filter(q => Math.hypot(q[0] + 336, q[1] - 44) > 75 && Math.hypot(q[0] + 498, q[1] - 103) > 60).slice(0, 10); },
    dorm: () => missionSpots.dormAt,
    vehFlip: () => { if (player.veh) player.veh.roll = 1.6; }, rescue: () => rescuePlayer(), vehInfo: () => player.veh ? { x: +player.veh.pos.x.toFixed(1), z: +player.veh.pos.z.toFixed(1), roll: +(player.veh.roll || 0).toFixed(2), stuck: +(player.veh.stuckT || 0).toFixed(2) } : null,
    sceneProf: () => { const by = {}; let calls = 0, tris = 0; const L0 = new THREE.Layers(); const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      scene.traverseVisible(o => { if (!o.isMesh && !o.isLine && !o.isPoints) return; let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) vis = false; if (!vis || !o.layers.test(L0)) return; const g = o.geometry; if (!g) return; let t = (g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)) / 3; if (o.isInstancedMesh) t *= o.count; let inF = true; let sp = null; { if (o.isInstancedMesh && !o.boundingSphere) o.computeBoundingSphere(); if (!g.boundingSphere) g.computeBoundingSphere(); sp = (o.isInstancedMesh ? o.boundingSphere : g.boundingSphere).clone().applyMatrix4(o.matrixWorld); if (o.frustumCulled) inF = fr.intersectsSphere(sp); } if (inF) { const d = Math.max(0, sp.center.distanceTo(camera.position) - sp.radius), bk = d < 300 ? 'd0-300' : d < 700 ? 'd300-700' : d < 1500 ? 'd700-1500' : 'd1500+'; const B = by['~' + bk] || (by['~' + bk] = { n: 0, vis: 0, tris: 0, vtris: 0 }); B.vis++; B.vtris += t; }
        let top = o; while (top.parent && top.parent !== scene) top = top.parent; const k = o.isInstancedMesh ? 'B:' + o.name : (top.isMesh ? 'M:' + top.geometry.type + (top.material.map ? '+map' : '') : 'G:' + (top.userData.model || top.userData.vtype || top.name || (top.children.length > 30 ? 'big' : top.children.length > 8 ? 'mid' : 'small'))); const e = by[k] || (by[k] = { n: 0, vis: 0, tris: 0, vtris: 0 }); e.n++; e.tris += t; if (inF) { e.vis++; e.vtris += t; calls++; tris += t; } });
      return { far: camera.far, fog: scene.fog ? [scene.fog.near, scene.fog.far, scene.fog.density] : null, sh: [sun.shadow.camera.right, sun.shadow.mapSize.x], pr: renderer.getPixelRatio(), calls, tris: Math.round(tris), info: { calls: PERF.calls, tris: PERF.tris }, top: Object.entries(by).sort((a, b) => b[1].vis - a[1].vis).slice(0, 14).map(([k, v]) => k + ' n=' + v.n + ' vis=' + v.vis + ' vtris=' + Math.round(v.vtris / 1000) + 'k'), topT: Object.entries(by).sort((a, b) => b[1].vtris - a[1].vtris).slice(0, 10).map(([k, v]) => k + ' vis=' + v.vis + ' vtris=' + Math.round(v.vtris / 1000) + 'k') }; },
    meshKinds: () => { const o = {}; for (const c of scene.children) { if (!c.isMesh || c.isInstancedMesh) continue; const g = c.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); const k = g.type + '|r' + (g.boundingSphere.radius < 3 ? '<3' : g.boundingSphere.radius < 30 ? '<30' : g.boundingSphere.radius < 400 ? '<400' : 'big') + '|' + (c.material.map ? (c.material.map.isCanvasTexture ? 'canvas' : 'tex') : 'nomap') + (c.frustumCulled ? '' : '|nocull'); o[k] = (o[k] || 0) + 1; } const cars = {}; for (const v of vehicles) { let n = 0; v.group.traverse(x => { if (x.isMesh) n++; }); const k = (v.group.userData.model || v.type); cars[k] = n; } return { o, cars, nveh: vehicles.length, peds: peds.length, top: scene.children.length }; },
    groupProf: () => { const L0 = new THREE.Layers(), o = []; for (const c of scene.children) { if (c.isMesh || !c.visible) continue; let n = 0, t = 0, sk = 0, nm = ''; c.traverse(x => { if (x.isMesh && x.layers.test(L0)) { n++; const g = x.geometry; t += (g.index ? g.index.count : g.attributes.position.count) / 3; if (x.isSkinnedMesh) sk++; if (!nm && x.name) nm = x.name; } }); if (n) o.push([Math.round(c.position.distanceTo(camera.position)), n, Math.round(t), sk, c.type, nm.slice(0, 18), +c.position.y.toFixed(1)]); } o.sort((a, b) => b[2] - a[2]); return { n: o.length, meshes: o.reduce((a, b) => a + b[1], 0), top: o.slice(0, 14), far: o.filter(e => e[0] > 400).length, farMeshes: o.filter(e => e[0] > 400).reduce((a, b) => a + b[1], 0) }; },
    /* 自動試駕：沿著路網一直開，記錄「踩著油門卻不動」的地點與原因。用來找會卡車的地方 */
    /* 越野試駕：不管路，朝隨機方向直線開，找地形與障礙物的卡點 */
    offroadBot: (secs, seed = 1) => { const v = player.veh; if (!v) return 'no vehicle'; let rs = seed; const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647; const stuck = []; let slow = 0, tx = 0, tz = 0, dist = 0, lx = v.pos.x, lz = v.pos.z;
      const pickT = () => { for (let k = 0; k < 30; k++) { const a = rnd() * 6.283, d = 150 + rnd() * 350; tx = v.pos.x + Math.cos(a) * d; tz = v.pos.z + Math.sin(a) * d; if (groundAt(tx, tz) > 1.5) return; } }; pickT();
      const N = Math.round(secs * 30); for (let f = 0; f < N; f++) { if (f % 500 === 499 || Math.hypot(tx - v.pos.x, tz - v.pos.z) < 15) pickT(); const df = angDiff(v.yaw, Math.atan2(tx - v.pos.x, tz - v.pos.z)), sp = Math.hypot(v.vx, v.vz); keys.KeyW = sp < 16; keys.KeyA = df > 0.06; keys.KeyD = df < -0.06;
        v.hp = 999; v.burn = 0; player.hp = 100; wanted.stars = 0; wanted.heat = 0; stepGame(1 / 30); dist += Math.hypot(v.pos.x - lx, v.pos.z - lz); lx = v.pos.x; lz = v.pos.z; if (player.veh !== v) { stuck.push({ x: Math.round(v.pos.x), z: Math.round(v.pos.z), why: 'ejected' }); break; }
        slow = sp < 0.8 ? slow + 1 : 0; if (slow > 75) { const q = v.pos, cs = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const c of (colHash.get(ckey(Math.floor(q.x / CCELL) + a, Math.floor(q.z / CCELL) + b)) || [])) if (!c.off && Math.hypot(c.x - q.x, c.z - q.z) < c.r + 3) cs.push((c.hw * 2).toFixed(1) + 'x' + (c.hd * 2).toFixed(1) + (c.top !== undefined ? 't' : ''));
          const f2 = fwd(v.yaw); stuck.push({ x: Math.round(q.x), z: Math.round(q.z), col: [...new Set(cs)].slice(0, 4).join(' '), veh: vehicles.filter(o => o !== v && Math.hypot(o.pos.x - q.x, o.pos.z - q.z) < 5).length, wd: +waterDepthAt(q.x + f2.x * 3, q.z + f2.z * 3).toFixed(1), slope: +(groundAt(q.x + f2.x * 3, q.z + f2.z * 3) - groundAt(q.x, q.z)).toFixed(1), lake: inLake(q.x + f2.x * 4, q.z + f2.z * 4) });
          // 模擬玩家：倒車 2 秒再換方向
          keys.KeyW = false; keys.KeyS = true; for (let k = 0; k < 60; k++) stepGame(1 / 30); keys.KeyS = false; const moved = Math.hypot(v.pos.x - q.x, v.pos.z - q.z); stuck[stuck.length - 1].rev = +Math.hypot(v.vx, v.vz).toFixed(1); pickT(); slow = 0; f += 60; } v.stuckT = 0; }
      keys.KeyW = keys.KeyA = keys.KeyD = keys.KeyS = false; return { km: +(dist / 1000).toFixed(2), n: stuck.length, stuck: stuck.slice(0, 40) }; },
    driveBot: (secs, seed = 1, vmax = 13, wob = 0) => { const v = player.veh; if (!v) return 'no vehicle'; let rs = seed; const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647; const stuck = []; let n0 = nearestRoad(v.pos.x, v.pos.z, 300); if (!n0) return 'no road'; let e = n0.e, i = n0.i, dir = 1, slow = 0, dist = 0, lx = v.pos.x, lz = v.pos.z; const savedRescue = v.stuckT;
      const place = () => { const p = e.pts[i], q = e.pts[clamp(i + dir, 0, e.pts.length - 1)]; v.pos.set(p.x, p.y + 0.5, p.z); v.yaw = Math.atan2((q.x - p.x) || p.tx * dir, (q.z - p.z) || p.tz * dir); v.vx = v.vz = 0; v.speed = 0; }; place();
      const N = Math.round(secs * 30); for (let f = 0; f < N; f++) {
        // 目標點：沿目前路段往前 3 個點；到底就換下一條路
        let ti = i + dir * 3; if (ti < 0 || ti >= e.pts.length) { const nd = dir > 0 ? e.b : e.a, opts = nd.edges.filter(x => x !== e && !x.tunnel); if (!opts.length) { dir = -dir; ti = clamp(ti, 0, e.pts.length - 1); } else { const ne = opts[Math.floor(rnd() * opts.length)]; dir = ne.a === nd ? 1 : -1; e = ne; i = dir > 0 ? 0 : e.pts.length - 1; ti = clamp(i + dir * 3, 0, e.pts.length - 1); } }
        const t = e.pts[clamp(ti, 0, e.pts.length - 1)], want = Math.atan2(t.x - v.pos.x, t.z - v.pos.z), df = angDiff(v.yaw, want), sp = Math.hypot(v.vx, v.vz);
        const wb = wob ? Math.sin(f * 0.013 + seed) * wob : 0; keys.KeyW = sp < vmax; keys.KeyS = false; keys.KeyA = df + wb > 0.06; keys.KeyD = df + wb < -0.06;
        v.hp = 999; v.burn = 0; player.hp = 100; wanted.stars = 0; wanted.heat = 0; stepGame(1 / 30); dist += Math.hypot(v.pos.x - lx, v.pos.z - lz); lx = v.pos.x; lz = v.pos.z; if (player.veh !== v) { stuck.push({ x: Math.round(v.pos.x), z: Math.round(v.pos.z), why: 'ejected', busy: game.busy }); break; }
        // 更新目前在路段上的位置
        let bi = i, bd = 1e9; for (let k = Math.max(0, i - 4); k <= Math.min(e.pts.length - 1, i + 4); k++) { const d = Math.hypot(e.pts[k].x - v.pos.x, e.pts[k].z - v.pos.z); if (d < bd) { bd = d; bi = k; } } i = bi;
        slow = sp < 0.8 ? slow + 1 : 0;
        if (slow > 75 || bd > 60) { const q = { x: v.pos.x, z: v.pos.z, y: v.pos.y }, h = resolveCircle({ x: q.x, z: q.z, y: q.y }, 2.2, true); let col = null; if (h) { const cs = []; const a = colHash.get(ckey(Math.floor(q.x / CCELL), Math.floor(q.z / CCELL))) || []; for (const c of a) if (!c.off && Math.hypot(c.x - q.x, c.z - q.z) < c.r + 2.4) cs.push((c.hw * 2).toFixed(1) + 'x' + (c.hd * 2).toFixed(1)); col = cs.slice(0, 3).join(' '); }
          const nv = vehicles.filter(o => o !== v && Math.hypot(o.pos.x - q.x, o.pos.z - q.z) < 5).map(o => o.type).join(','); stuck.push({ x: Math.round(q.x), z: Math.round(q.z), veh: nv, wd: +waterDepthAt(q.x, q.z).toFixed(1), why: bd > 60 ? 'offroad' : 'stuck', road: e.type, eid: e.id, off: +bd.toFixed(1), col, gdy: +(groundAt(q.x, q.z) - q.y).toFixed(1), pitch: +(v.pitch || 0).toFixed(2), roll: +(v.roll || 0).toFixed(2) }); i = clamp(i + dir * 6, 0, e.pts.length - 1); place(); slow = 0; }
        v.stuckT = 0; }
      keys.KeyW = keys.KeyA = keys.KeyD = false; return { km: +(dist / 1000).toFixed(2), n: stuck.length, stuck: stuck.slice(0, 40) }; },
    texMem: () => { const seen = new Set(); let cv = 0, cvPx = 0, im = 0, imPx = 0; const big = {}; scene.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) for (const k of ['map', 'emissiveMap', 'normalMap', 'alphaMap']) { const t = m[k]; if (!t || !t.image || seen.has(t)) continue; seen.add(t); const w = t.image.width || 0, h = t.image.height || 0; if (t.image.getContext) { cv++; cvPx += w * h; } else { im++; imPx += w * h; } const key = w + 'x' + h; big[key] = (big[key] || 0) + 1; } }); return { canvases: cv, canvasMB: Math.round(cvPx * 4 / 1048576), images: im, imageMB: Math.round(imPx * 4 / 1048576), sizes: Object.entries(big).sort((a, b) => b[1] - a[1]).slice(0, 10) }; },
    rinfo: () => { renderer.info.autoReset = false; const r = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, q: settings.q, pr: renderer.getPixelRatio() }; renderer.info.reset(); return r; },
    gw: (la, lo) => { const w = GW(la, lo); return [Math.round(w.x), Math.round(w.z)]; }, edgeNames: () => { const o = {}; for (const e of roadEdges) if (e.name) o[e.name] = (o[e.name] || 0) + 1; return Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 40).map(a => a[0] + a[1]).join(' '); },
    lt: () => ({ ...LT, townPts: roadEdges.reduce((a, e) => a + e.pts.filter(p => p.town >= 0).length, 0), allPts: roadEdges.reduce((a, e) => a + e.pts.length, 0) }),
    infill: () => [INFILL.n, INFILL.scooters, INFILL.sample, INFILL.poles],
    vehTris: () => { const o = {}; for (const v of vehicles) { const k = v.group.userData.model || v.type; if (o[k]) continue; const parts = []; v.group.traverse(x => { if (x.isMesh) { const g = x.geometry; parts.push([g.type.replace('Geometry', ''), Math.round((g.index ? g.index.count : g.attributes.position.count) / 3)]); } }); parts.sort((a, b) => b[1] - a[1]); o[k] = [parts.reduce((a, b) => a + b[1], 0), parts.length, parts.slice(0, 3).map(p => p.join(':')).join(' ')]; } return Object.entries(o).map(([k, v]) => [k, ...v]); },
    skirts: () => ROAD_SKIRTS,
    cullNow: () => { CULL.f = 9; CULL.seen = 0; cullUpdate(); return { hid: CULL.hidden, list: CULL.list.length, vehHid: vehicles.filter(v => v._cv === false).length, veh: vehicles.length, fov: camera.fov, cam: [Math.round(camera.position.x), Math.round(camera.position.z)], pl: [Math.round(player.pos.x), Math.round(player.pos.z)] }; },
    natInfo: () => ({ ready: NAT.ready, n: Object.keys(NAT.g), tris: Object.fromEntries(Object.entries(NAT.g).map(([k, v]) => [k, v.geo.index.count / 3])), trees: Object.keys(BT).filter(k => k.startsWith('nat_')) }),
    rigInfo: () => ({ err: RIG.err || null, ready: RIG.ready, bases: RIG.bases.map(b => b.name), clips: Object.keys(RIG.clips).length, S: +RIG.S.toFixed(4), live: RIG.list.length, player: !!(player.model && player.model.rig) }),
    studio: (ang, which, female) => { const Y = 900; if (!window.__studio) { const g = new THREE.Group(); const room = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 14), new THREE.MeshStandardMaterial({ color: 0xb9b6ae, side: THREE.BackSide, roughness: 1 })); room.position.set(0, Y + 3.9, 0); g.add(room); const fl = new THREE.GridHelper(14, 28, 0xc9c4b8, 0xdedad0); fl.position.set(0, Y + 0.002, 0); g.add(fl); const L = new THREE.DirectionalLight(0xffffff, 1.0); L.position.set(3, Y + 6, 5); L.target.position.set(0, Y + 1, 0); g.add(L, L.target); const A = new THREE.HemisphereLight(0xffffff, 0xb8b2a4, 0.55); A.position.set(0, Y + 4, 0); g.add(A); scene.add(g); window.__studio = { g, p: null }; }
      const S = window.__studio; if (S.p) { S.g.remove(S.p.group); } const spec = female ? { female: true, shirt: '#e86f5c', pants: '#2f3e57', skin: '#efc3a2', hair: '#3a2418', hairStyle: 'pony', shoe: '#ffffff', jacket: null, longSleeve: false, skirt: false, shorts: false } : { shadow: true, female: false, jacket: null, longSleeve: false, shorts: false, hairStyle: 'side', shoe: '#f2f2f2', shirt: '#f3efe6', pants: '#3d5a80', skin: '#e8b796', hair: '#1b1917', pack: true };
      S.p = which === 20 && RIG.bases.length ? makeRig({ base: 'm_Swat', pistol: true, armed: true, height: 1 }) : which === 2 && RIG.ready ? makeRig({ hero: true, tint: RIG_HERO_TINT, height: 1 }) : which >= 3 && RIG.bases.length ? makeRig({ base: RIG_FILES[(which - 3) % RIG_FILES.length], height: 1 }) : (which === 1 ? makePersonOld : makePerson)(spec); S.p.group.position.set(0, Y, 0); S.p.group.rotation.y = ang; S.g.add(S.p.group); cam.free = { p: new V3(0, Y + 1.0, 5.2), t: new V3(0, Y + 0.88, 0) }; camera.fov = 26; document.body.classList.add('photo'); camera.updateProjectionMatrix(); scene.fog && (scene.fog.near = 1e5, scene.fog.far = 2e5); return true; },
    studioCar: (type, ang, which) => { const Y = 900; if (!window.__studio) __KINMEN__.studio(0, 2, false); const S = window.__studio; if (S.p) { S.g.remove(S.p.group); S.p = null; } if (S.car) S.g.remove(S.car); const v = makeVehicle(type, 0, 0, 0, type === 'sports' ? '#d4140b' : undefined); vehicles.splice(vehicles.indexOf(v), 1); scene.remove(v.group); const c = v.group; c.position.set(0, Y, 0); c.rotation.set(0, ang, 0); S.g.add(c); S.car = c; const L = (v.def.len || 4.4); cam.free = { p: new V3(0, Y + 1.6, L * 1.75 + 2.5), t: new V3(0, Y + 0.75, 0) }; camera.fov = 30; camera.updateProjectionMatrix(); document.body.classList.add('photo'); return v.def.name; },
    news: () => kinmenNews(),
    bbRank: (d) => bobingRank(d),
    busN: () => busStops.map(s => s.name),
    tourGo: (i) => { const m = tour.groups[i].men[0]; exitForce(); tpTo(m.x + 4, m.z + 4); player.yaw = Math.atan2(-4, -4); return [m.x, m.z]; },
    tourN: () => tour.groups.map(g => g.men.length),
    fishBite: () => { fish.t = 0.01; return fish.st; },
    procFollow: () => { const c = proc.mem.find(m => m.role === 'chair'); if (!c) return null; exitForce(); tpTo(c.o.position.x + 3, c.o.position.z + 3); return true; },
    procSt: () => ({ on: proc.on, s: proc.s, L: Math.round(proc.L), n: proc.mem.length, blessed: proc.blessed, chair: proc.mem.length ? [proc.mem.find(m => m.role === 'chair').o.position.x, proc.mem.find(m => m.role === 'chair').o.position.z] : null }),
    otterC: () => otter.c && [otter.c.x, otter.c.z, otter.r],
    rideTest: (type = 'scooter') => { exitForce(); const n = nearestRoad(player.pos.x, player.pos.z, 400); if (!n) return null; const p = n.e.pts[n.i], q = n.e.pts[Math.min(n.i + 1, n.e.pts.length - 1)]; const v = makeVehicle(type, p.x, p.z, Math.atan2(q.x - p.x, q.z - p.z)); player.pos.set(p.x, heightAt(p.x, p.z), p.z); enterVehicle(v); return { type: v.type, two: !!v.def.two }; },
    ride: () => { const v = player.veh; return v ? { spd: +v.speed.toFixed(2), yr: +(v.yawRate || 0).toFixed(3), roll: +v.roll.toFixed(3), pitch: +v.pitch.toFixed(3), pA: +(v.pitchA || 0).toFixed(3), yaw: +v.yaw.toFixed(3), x: +v.pos.x.toFixed(1), z: +v.pos.z.toFixed(1), slip: +(v.slip || 0).toFixed(2), bank: +(cam.bank || 0).toFixed(3) } : null; },
    vehNear: () => vehicles.filter(v => v.pos.distanceTo(player.pos) < 15).map(v => v.type),
    stOld: () => { const fn = CHAPTERS[story.ch] && CHAPTERS[story.ch].fn, n = story.npcs[0]; const onFoot = () => { exitForce(); tpTo(n.x + 2, n.z + 2); };
      if (fn === 'ch1') { if (story.step === 0) { exitForce(); tpTo(roadNodes.MF.x, roadNodes.MF.z); } else onFoot(); }
      else if (fn === 'ch2') { const v = story.truck; if (!v) return 'notruck'; exitForce(); v.pos.set(roadNodes.LL.x + 2, heightAt(roadNodes.LL.x + 2, roadNodes.LL.z), roadNodes.LL.z); v.speed = 0; player.pos.set(v.pos.x + 2, v.pos.y, v.pos.z); enterVehicle(v); v.speed = 0; }
      else if (fn === 'ch3' || fn === 'ch5') { if (aliveOf(story.thugs).length) { for (const c of aliveOf(story.thugs)) killCop(c); } else onFoot(); }
      else if (fn === 'ch4') { if (story.step < 2) { story.step = 1; story.robbed = true; clearWanted(); } else onFoot(); }
      return story.step; },
    stKill: () => { for (const c of aliveOf(story.thugs)) killCop(c); if (story.enemy) story.enemy.hp = 0; if (story.step === 0 && story.car && story.car.tail) story.t = 80; return true; },
    stNpc: () => { const nn = story.npcs[0]; if (nn) tpTo(nn.x + 2, nn.z + 2); return !!nn; }, tunEnter: nm => { const T = tunnelByName(nm); enterTunnel(T, 0); return true; }, tunExit: () => { exitTunnel(0); return true; }, tunWalk: d => { const T = player.tunnel; player.pos.x = T.start.x + d; return true; },
    tgt: () => target ? [Math.round(target.x), Math.round(target.z)] : null, tgtTp: () => { if (target) tpTo(target.x + 1, target.z + 1); return !!target; }, inBoat: () => { if (story.boat) { exitForce(); enterVehicle(story.boat); } return player.veh && player.veh.type; },
    scopeTp: () => { const T = player.tunnel; if (T && T.scope) { player.pos.x = T.scope.x + 1; player.pos.z = T.scope.z + 1; } return !!(T && T.scope); },
    tunScope: () => { const T = player.tunnel; if (!T || !T.scope) return false; player.pos.set(T.scope.x + 1.2, T.Y, T.scope.z); return true; },
    placesAll: () => PLACES.map(p => [p.name, Math.round(p.x), Math.round(p.z), p.r]), sitesAll: () => SITES.map(s => s.name || s[0]),
    blipAt: i => { const b = mapBlips[i]; if (!b) return null; const r = $('bigcv').getBoundingClientRect(), s2 = r.width / mapCv.width; return [r.left + b.X * s2, r.top + b.Y * s2, b.name]; },
    vault: () => vaultH(), roof: () => +player.pos.y.toFixed(2), rain: on => { setWeather(on ? 2 : 0); weather.k.rain = on ? 1 : 0; }
  };
}
