/* =====================================================================
   劇情主線《浯島風雲》：五章
   ===================================================================== */
const CAST = {
  me: { name: '阿廷', col: '#3f6fa3', face: '廷' }, uncle: { name: '阿德叔', col: '#8a5a3a', face: '德' }, yun: { name: '小芸', col: '#d96c8a', face: '芸' },
  chen: { name: '老陳', col: '#59603d', face: '陳' }, lin: { name: '林隊長', col: '#27496d', face: '林' }, radio: { name: '無線電', col: '#555', face: '📻' } };
const story = { ch: 0, step: 0, active: false, npcs: [], onRob: null, cut: null, done: [] };
const CHAPTERS = [
  { title: '第一章　回到浯島', giver: 'uncle', at: [24.4108, 118.2985], blurb: '阿德叔在水頭等你。', fn: 'ch1' },
  { title: '第二章　高粱的味道', giver: 'chen', at: [24.4330, 118.3420], blurb: '酒廠旁的老陳有工作給你。', fn: 'ch2' },
  { title: '第三章　坑道裡的東西', giver: 'chen', at: [24.4330, 118.3420], blurb: '老陳又找你了，這次要去瓊林。', fn: 'chTunnel' },
  { title: '第四章　山外的夜', giver: 'yun', at: [24.4430, 118.4160], blurb: '小芸在山外找你。', fn: 'ch3' },
  { title: '第五章　莒光樓的約定', giver: 'yun', at: [24.4430, 118.4160], blurb: '小芸要你載她去見一個人。', fn: 'chDate' },
  { title: '第六章　跟蹤', giver: 'lin', at: [24.4331, 118.3201], blurb: '金城的林隊長想見你。', fn: 'chTail' },
  { title: '第七章　金庫', giver: 'chen', at: [24.4520, 118.3360], blurb: '老陳說有一票大的。', fn: 'ch4' },
  { title: '第八章　海上走私', giver: 'lin', at: [24.4158, 118.2880], blurb: '林隊長在水頭碼頭等你。', fn: 'chSea' },
  { title: '第九章　馬山的眼睛', giver: 'lin', at: [24.4892, 118.4128], blurb: '林隊長在沙美，要你去馬山拿證據。', fn: 'chMashan' },
  { title: '第十章　島孤人不孤', giver: 'lin', at: [24.4300, 118.2600], blurb: '林隊長在九宮碼頭附近，大膽島出事了。', fn: 'chDadan' },
  { title: '第十一章　古寧頭的人質', giver: 'yun', at: [24.4478, 118.3229], blurb: '小芸在金門大學，阿德叔被帶走了！', fn: 'chHostage' },
  { title: '第十二章　浯島風雲', giver: 'uncle', at: [24.4158, 118.2880], blurb: '阿德叔在水頭碼頭等你，最後一戰。', fn: 'ch5' }];
const STORY_V = 2, OLD_MAP = [0, 1, 3, 6, 11, 12];
let storyMarker = null;
function storyNpc(key, x, z, yaw, opts) { const m = makePerson({ shadow: true, ...opts }); m.group.position.set(x, heightAt(x, z), z); m.group.rotation.y = yaw; scene.add(m.group); const n = { key, m, x, z }; story.npcs.push(n); addBox(x, z, 0.3, 0.3, 0); return n; }
function clearStoryNpcs() { for (const n of story.npcs) scene.remove(n.m.group); story.npcs = []; }
function initStory() {
  try { const d = JSON.parse(localStorage.getItem('kinmen_story') || 'null'); if (d) story.ch = d.v === STORY_V ? d.ch : (OLD_MAP[d.ch] ?? d.ch); } catch (e) { }
  placeChapter();
}
function saveStory() { try { localStorage.setItem('kinmen_story', JSON.stringify({ ch: story.ch, v: STORY_V })); } catch (e) { } }
function placeChapter() {
  if (storyMarker) { scene.remove(storyMarker.ring); scene.remove(storyMarker.ic); markers.splice(markers.indexOf(storyMarker), 1); storyMarker = null; }
  clearStoryNpcs(); const C = CHAPTERS[story.ch]; if (!C) return;
  const s = spot(C.at[0], C.at[1], 2, 12); if (!s) return; const who = CAST[C.giver];
  storyNpc(C.giver, s.x, s.z, s.rot, C.giver === 'uncle' ? { female: false, shirt: '#f4f1ea', pants: '#5a5148', hair: '#6b6b6b', jacket: null } : C.giver === 'yun' ? { female: true, shirt: '#d96c8a', hairStyle: 'pony' } : C.giver === 'lin' ? { female: false, shirt: '#2b4f7e', pants: '#1b2433', cap: '#1b2433', longSleeve: true, jacket: null } : { female: false, shirt: '#59603d', cap: '#3d4630', jacket: '#2b2f38' });
  const f = fwd(s.rot); addMarker('story', { x: s.x + f.x * 2.5, z: s.z + f.z * 2.5 }, who.face, who.col, C.title); storyMarker = markers[markers.length - 1];
}
/* ---------- 對話＋過場 ---------- */
function say(lines, done) {
  $('subtitle').classList.remove('show'); subT = 0; story.dialog = { lines, i: 0, done }; game.busy = true; $('letter').classList.add('show'); showLine();
}
function showLine() { const D = story.dialog, l = D.lines[D.i], who = CAST[l[0]]; $('dlg').innerHTML = `<i style="background:${who.col}">${who.face}</i><div><b>${who.name}</b><p>${l[1]}</p></div><small>按 E 或點一下繼續</small>`; $('dlg').classList.add('show'); if (l[2]) l[2](); }
function nextLine() { const D = story.dialog; if (!D) return false; D.i++; if (D.i >= D.lines.length) { story.dialog = null; $('dlg').classList.remove('show'); $('letter').classList.remove('show'); cam.free = null; game.busy = false; if (D.done) D.done(); } else showLine(); return true; }
function cutCam(n) { const g = n.m.group.position, a = Math.atan2(player.pos.x - g.x, player.pos.z - g.z), f = { x: Math.sin(a), z: Math.cos(a) }, sx = f.z, sz = -f.x;
  if (!player.veh) { const px = g.x + f.x * 1.9 + sx * 0.5, pz = g.z + f.z * 1.9 + sz * 0.5; if (boxFree(px, pz, 0.4)) { player.pos.set(px, heightAt(px, pz), pz); } player.yaw = Math.atan2(g.x - player.pos.x, g.z - player.pos.z); player.model.group.position.copy(player.pos); player.model.group.rotation.set(0, player.yaw, 0); poseWalk(player.model, 0, 0); n.m.group.rotation.y = Math.atan2(player.pos.x - g.x, player.pos.z - g.z); }
  const mx = (g.x + player.pos.x) / 2, mz = (g.z + player.pos.z) / 2; cam.free = { p: new V3(mx - sx * 4.2 + f.x * 0.4, g.y + 1.75, mz - sz * 4.2 + f.z * 0.4), t: new V3(mx, g.y + 1.45, mz) }; }
function wideCam(x, z, h, tx, tz) { cam.free = { p: new V3(x, Math.max(0, groundAt(x, z)) + h, z), t: new V3(tx, Math.max(0, groundAt(tx, tz)) + 2, tz) }; }
/* ---------- 章節內容 ---------- */
function goal(text, x, z) { story.goalText = text; $('goal').innerHTML = `<b>${CHAPTERS[story.ch].title}</b>${text}`; if (x !== undefined) setTarget(x, z, text); }
function startChapter() {
  if (story.active || mission.type) return; story.active = true; story.step = 0; mission.type = 'story'; const C = CHAPTERS[story.ch], n = story.npcs[0];
  banner(C.title, ''); cutCam(n);
  ({ ch1, ch2, ch3, ch4, ch5, chTunnel, chDate, chTail, chSea, chMashan, chDadan, chHostage })[C.fn](n);
}
function finishChapter(pay, sub) {
  clearExtras(); story.active = false; mission.type = null; clearTarget(); $('goal').innerHTML = ''; $('timer').textContent = ''; addMoney(pay); story.ch++; saveStory(); banner('任務完成', (sub || CHAPTERS[story.ch - 1].title) + '　$' + pay.toLocaleString());
  if (story.ch < CHAPTERS.length) { placeChapter(); setTimeout(() => subtitle(`新任務：<b>${CHAPTERS[story.ch].title}</b>——${CHAPTERS[story.ch].blurb}（地圖上的頭像標記）`, 8), 3000); }
  else { placeChapter(); setTimeout(() => banner('全劇終', '感謝遊玩《浯島風雲》'), 4000); }
}
function failChapter(why) { if (!story.active) return; clearExtras(); story.active = false; mission.type = null; clearTarget(); $('goal').innerHTML = ''; $('timer').textContent = ''; story.tick = null; sfx('fail'); subtitle(`任務失敗：${why}　回到頭像標記可以重來。`, 6); placeChapter(); }
const near = (x, z, r) => Math.hypot(player.pos.x - x, player.pos.z - z) < r;

function ch1(n) {
  say([['uncle', '阿廷！你終於回來了。台北讀書讀得怎樣？'], ['me', '還行啦。叔，你電話裡說家裡出事了？'], ['uncle', '唉……我借了老陳一筆錢做民宿，現在利息滾到還不出來。'], ['uncle', '先別說這個。你騎我的機車，去金城幫我拿貢糖回來，我們邊吃邊聊。'], ['me', '好，交給我。']], () => {
    const f = fwd(n.m.group.rotation.y); const v = makeVehicle('scooter', n.x + f.z * 3, n.z - f.x * 3, n.m.group.rotation.y); v.perm = true;
    const sh = roadNodes.MF; goal('騎機車到金城模範街拿貢糖', sh.x, sh.z); story.tick = dt => {
      if (story.step === 0 && near(sh.x, sh.z, 12)) { story.step = 1; sfx('chime'); toast('拿到貢糖'); goal('把貢糖帶回水頭給阿德叔', n.x, n.z); }
      else if (story.step === 1 && near(n.x, n.z, 5) && !player.veh) { story.step = 2; cutCam(n); say([['uncle', '就是這個味道！'], ['uncle', '你也看到了，金門變了很多，但人情還在。'], ['uncle', '老陳在酒廠那邊，他說可以讓你打工抵我的債。去找他吧。']], () => finishChapter(1500)); }
    };
  });
}
function ch2(n) {
  say([['chen', '你就是阿德的姪子？瘦巴巴的。'], ['me', '我叔欠你多少，我來還。'], ['chen', '好，有骨氣。我有一批高粱要送到料羅港，客人很急。'], ['chen', '開這台小貨車，路上別給我撞破——一瓶都不准少。'], ['chen', '還有……有人可能會攔你。這把槍你先拿著。', () => { giveWeapon(1, 36); }]], () => {
    const f = fwd(n.m.group.rotation.y), v = makeVehicle('pickup', n.x + f.z * 4, n.z - f.x * 4, n.m.group.rotation.y + Math.PI / 2); v.perm = true; story.truck = v; mission.broken = 0;
    goal('開小貨車（F）把高粱送到料羅港', roadNodes.LL.x, roadNodes.LL.z); story.timer = 240;
    story.tick = dt => {
      story.timer -= dt; $('timer').textContent = '⏱ ' + Math.ceil(story.timer) + ' 秒　酒 ' + Math.max(0, 12 - mission.broken) + '/12'; if (story.timer <= 0) return failChapter('超過時間');
      if (!vehicles.includes(v)) return failChapter('貨車沒了');
      if (story.step === 0 && player.veh === v && Math.hypot(v.pos.x - roadNodes.SY.x, v.pos.z - roadNodes.SY.z) < 160) { story.step = 1; subtitle('<b>無線電</b>：「後面那兩台車是衝著你來的！」', 4); for (let k = 0; k < 2; k++) { const nr = nearestRoad(v.pos.x - Math.sin(v.yaw) * (40 + k * 10), v.pos.z - Math.cos(v.yaw) * (40 + k * 10), 80); if (!nr) continue; const t = makeVehicle('suv', nr.p.x, nr.p.z, v.yaw, '#1c1c1c'); t.driver = 'police'; t.thug = true; t.hp = 70; } }
      if (player.veh === v && near(roadNodes.LL.x, roadNodes.LL.z, 14) && Math.abs(v.speed) < 4) { for (const t of [...vehicles]) if (t.thug) { removeVehicle(t); } for (const c of [...cops]) if (c.from && c.from.thug) removeCop(c); clearWanted(); finishChapter(3000 - mission.broken * 150); }
    };
  });
}
function ch3(n) {
  say([['yun', '阿廷？好久不見！國小畢業後就沒看過你了。'], ['me', '小芸！你在山外上班？'], ['yun', '嗯……其實我是想請你幫忙。老陳的人在我家店門口鬧事，說我爸也欠錢。'], ['yun', '他們在太湖邊的停車場。我不想報警，事情會更大。'], ['me', '我去處理。'], ['yun', '小心點……把他們趕走就好。']], () => {
    const t = GW(24.4410, 118.4245), s = spot(24.4410, 118.4245, 3) || t; story.thugs = []; for (let k = 0; k < 4; k++) { const c = spawnCop(s.x + Math.cos(k * 1.6) * 6, s.z + Math.sin(k * 1.6) * 6, false, null, true); c.thug = true; c.hp = 45; c.m.group.traverse(o => { if (o.isMesh) o.material = o.material; }); story.thugs.push(c); }
    for (const c of story.thugs) { scene.remove(c.m.group); const m = makePerson({ female: false, shirt: '#1c1c1c', pants: '#1c1c1c', jacket: '#2b2f38', longSleeve: true }); const g = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.3).translate(0, 0, 0.2), mTrim); g.rotation.x = Math.PI / 2; g.position.set(0, -0.27, 0.03); m.armR.lo.add(g); scene.add(m.group); c.m = m; }
    goal('到太湖停車場趕走鬧事的人', s.x, s.z); if (!inv.has[1]) giveWeapon(1, 36);
    story.tick = dt => { const alive = story.thugs.filter(c => cops.includes(c)); if (story.step === 0 && near(s.x, s.z, 40)) { story.step = 1; for (const c of alive) c.alert = true; subtitle('他們拔槍了！', 3); }
      $('timer').textContent = '剩下 ' + alive.length + ' 人'; if (!alive.length) { clearWanted(); story.step = 2; goal('回去找小芸', n.x, n.z); story.tick = () => { if (near(n.x, n.z, 5) && !player.veh) { cutCam(n); say([['yun', '你……你真的把他們打跑了？'], ['yun', '謝謝。老陳不是好人，他在山外銀行有個保險箱，帳本都在裡面。'], ['me', '帳本？'], ['yun', '只要拿到它，你叔和我爸的債都能一筆勾銷。']], () => finishChapter(4000)); } }; } };
  });
}
function ch4(n) {
  say([['chen', '聽說你很能打。我欣賞你。'], ['chen', '我直說了：沙美的浯島銀行，金庫裡有我對手的錢。你去拿，你叔的債我一筆勾銷。'], ['me', '（他不知道小芸跟我說的事……順便把帳本也拿到手。）'], ['chen', '去軍品店準備一下，搶完甩掉警察再回來找我。']], () => {
    const B = rooms.find(r => r.name.includes('沙美')) || rooms.find(r => r.type === 'bank'); goal('搶劫沙美的浯島銀行（打開金庫）', B.door.x, B.door.z); story.robbed = false;
    story.onRob = amt => { story.robbed = true; story.onRob = null; };
    story.tick = dt => { if (story.step === 0 && rob && rob.room === B && rob.stage >= 9 && B.vaultOpen) { story.step = 1; toast('拿到帳本了'); goal('甩掉警察，把錢帶回去'); }
      if (story.step >= 1 && story.robbed && !wanted.stars) { story.step = 2; goal('回去找老陳', n.x, n.z); }
      if (story.step === 2 && near(n.x, n.z, 5) && !player.veh) { story.step = 3; cutCam(n); say([['chen', '幹得好！錢呢？'], ['me', '錢我留著。還有——你的帳本也在我這。'], ['chen', '……你這小子！'], ['chen', '好，很好。今晚水頭碼頭，我們把話說清楚。']], () => finishChapter(6000)); } };
  });
}
function ch5(n) {
  say([['uncle', '阿廷，你瘋了！老陳帶了一船的人在碼頭等你。'], ['me', '叔，該結束了。帳本交給林隊長，老陳就跑不掉。'], ['lin', '（無線電）我是金城分局林隊長。帳本我收到了，但我們的人還要十分鐘才到。'], ['lin', '撐住，別讓老陳開船跑了。']], () => {
    const P = decks.find(d => d.pier === '水頭碼頭') || decks.find(d => d.pier); const s = { x: P.x, z: P.z }; story.thugs = []; const pts = [[0, 0], [0, 20], [0, -20], [3, 35], [-3, 30], [0, 42]];
    for (const [a, b] of pts) { const q = { x: P.x + Math.sin(P.rot) * b + Math.cos(P.rot) * a, z: P.z + Math.cos(P.rot) * b - Math.sin(P.rot) * a }; const c = spawnCop(q.x, q.z, true, null); c.thug = true; c.hp = 55; c.pos.y = heightAt(q.x, q.z); story.thugs.push(c); }
    const boss = story.thugs[story.thugs.length - 1]; boss.hp = 160; boss.boss = true; scene.remove(boss.m.group); boss.m = makePerson({ shadow: true, female: false, shirt: '#59603d', cap: '#3d4630', jacket: '#2b2f38', longSleeve: true }); { const g = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.9).translate(0, 0, 0.2), mTrim); g.rotation.x = Math.PI / 2; g.position.set(0, -0.27, 0.03); boss.m.armR.lo.add(g); } scene.add(boss.m.group);
    giveWeapon(4, 120); player.armor = 100; goal('阻止老陳逃走（打倒碼頭上所有人）', s.x, s.z); story.timer = 0;
    story.tick = dt => { const alive = story.thugs.filter(c => cops.includes(c)); story.timer += dt; if (story.step === 0 && near(s.x, s.z, 70)) { story.step = 1; for (const c of alive) c.alert = true; subtitle('<b>老陳</b>：「給我上！」', 3); }
      $('timer').textContent = '敵人 ' + alive.length + (cops.includes(boss) ? '　老陳 ' + Math.max(0, Math.round(boss.hp)) : '');
      if (!alive.length) { story.tick = null; clearWanted(); wideCam(s.x + 40, s.z + 40, 25, s.x, s.z); say([['lin', '（無線電）我們到了！老陳被抓了，帳本也是鐵證。'], ['uncle', '阿廷……謝謝你。這個家，是你救回來的。'], ['yun', '以後，就留在金門吧？'], ['me', '嗯。浯島，是我家。']], () => finishChapter(20000)); } };
  });
}
function updateStory(dt) { if (story.waitSide && !side.job) { const id = story.waitSide; story.waitSide = null; story.active = true; mission.type = 'story'; if (sideDone.has(id) && story.sideOk) { story.sideOk = false; finishChapter(3000, CHAPTERS[story.ch].title); } else { story.active = false; mission.type = null; subtitle('任務失敗。回到頭像標記可以重來。', 5); placeChapter(); } } if (story.active && story.tick && !story.dialog) story.tick(dt); for (const nn of story.npcs) { nn.m.group.rotation.y += angDiff(nn.m.group.rotation.y, Math.atan2(player.pos.x - nn.x, player.pos.z - nn.z)) * Math.min(1, dt * 2); } }
function storyAbort() { for (const c of [...cops]) if (c.thug) removeCop(c); for (const v of [...vehicles]) if (v.thug) removeVehicle(v); story.onRob = null; failChapter('你倒下或被捕了'); }

/* =====================================================================
   新增章節（第三、五、六、八、九、十、十一章）
   ===================================================================== */
function thugsAt(x, z, n, hp = 45, R = 6) { const a = []; for (let k = 0; k < n; k++) { const ang = k / n * 6.28 + rand(); const c = spawnCop(x + Math.cos(ang) * R, z + Math.sin(ang) * R, false, null, true); c.thug = true; c.hp = hp; a.push(c); } return a; }
const aliveOf = arr => (arr || []).filter(c => cops.includes(c));
function chasers(v, n = 2) { for (let k = 0; k < n; k++) { const nr = nearestRoad(v.pos.x - Math.sin(v.yaw) * (45 + k * 12), v.pos.z - Math.cos(v.yaw) * (45 + k * 12), 90); if (!nr) continue; const t = makeVehicle('suv', nr.p.x, nr.p.z, v.yaw, '#1c1c1c'); t.driver = 'police'; t.thug = true; t.hp = 70; } }
function clearChasers() { for (const t of [...vehicles]) if (t.thug && t.driver === 'police') removeVehicle(t); for (const c of [...cops]) if (c.from && c.from.thug) removeCop(c); }
function seaPoint(x, z, d) { for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283, px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d; if (groundAt(px, pz) < -4 && groundAt((px + x) / 2, (pz + z) / 2) < -1) return { x: px, z: pz, a }; } return null; }
function storyExtra(o) { (story.extras = story.extras || []).push(o); return o; }
function clearExtras() { for (const o of story.extras || []) scene.remove(o); story.extras = []; }
const tunnelByName = nm => tunnels.find(t => t.name === nm);

function chTunnel(n) {
  say([['chen', '小子，上次的貨送得不錯。'], ['chen', '瓊林村底下的戰鬥坑道裡，我藏了一個包裹，你去幫我拿出來。'], ['me', '坑道？那不是觀光景點嗎？'], ['chen', '觀光客只走前面那段。往裡面走，走到底就看得到。快去快回。']], () => {
    const T = tunnelByName('瓊林戰鬥坑道'), m = T.mouths[0]; goal('到瓊林戰鬥坑道（走進入口）', m.x, m.z);
    story.tick = dt => {
      if (story.step === 0 && player.tunnel === T) { story.step = 1; goal('往坑道深處走，找到老陳的包裹'); }
      else if (story.step === 1 && player.tunnel === T && Math.hypot(player.pos.x - T.start.x, player.pos.z - T.start.z) > 24) { story.step = 2; sfx('chime'); toast('拿到包裹了'); goal('帶著包裹離開坑道'); subtitle('包裹很重……裡面好像是一疊帳冊。', 4); }
      else if (story.step === 2 && !player.tunnel) { story.step = 3; story.thugs = thugsAt(player.pos.x, player.pos.z, 3, 40, 14); for (const c of story.thugs) c.alert = true; subtitle('<b>？？？</b>：「把包裹交出來！」——有人埋伏！', 4); goal('打倒埋伏的人'); }
      else if (story.step === 3) { const a = aliveOf(story.thugs); $('timer').textContent = '剩下 ' + a.length + ' 人'; if (!a.length) { story.step = 4; clearWanted(); $('timer').textContent = ''; goal('把包裹交給老陳', n.x, n.z); } }
      else if (story.step === 4 && near(n.x, n.z, 5) && !player.veh) { story.step = 5; cutCam(n); say([['chen', '沒被跟吧？'], ['me', '有人埋伏，我處理掉了。他們是誰？'], ['chen', '……不關你的事。這是你的工錢，嘴巴閉緊。'], ['me', '（他在怕什麼？那疊帳冊……）']], () => finishChapter(3500)); }
    };
  });
}
function chDate(n) {
  say([['yun', '阿廷，你上次幫了我大忙。'], ['yun', '我找到一個以前在老陳手下做事的人，他願意說出老陳的事，約在莒光樓。'], ['yun', '我自己去會怕……你可以載我去嗎？'], ['me', '當然。上車。']], () => {
    const f = fwd(n.m.group.rotation.y), v = makeVehicle('sedan', n.x + f.z * 4, n.z - f.x * 4, n.m.group.rotation.y + Math.PI / 2, '#f2f3f4'); v.perm = true; story.car = v;
    const t = roadPt([24.42491, 118.31902]); goal('開車（F）載小芸到莒光樓', t.x, t.z); story.timer = 420; story.t = 0;
    story.tick = dt => {
      story.timer -= dt; $('timer').textContent = '⏱ ' + Math.ceil(story.timer) + ' 秒'; if (story.timer <= 0) return failChapter('來不及赴約');
      if (!vehicles.includes(v)) return failChapter('車子沒了');
      if (player.veh === v) story.t += dt;
      if (story.step === 0 && story.t > 25) { story.step = 1; subtitle('<b>小芸</b>：「阿廷……後面那兩台黑車，一直跟著我們。」', 5); chasers(v, 2); goal('甩掉跟蹤的黑車，再去莒光樓', t.x, t.z); }
      if (story.step === 1 && player.veh === v && near(t.x, t.z, 16) && Math.abs(v.speed) < 4) { const tail = vehicles.some(o => o.thug && o.driver === 'police' && Math.hypot(o.pos.x - v.pos.x, o.pos.z - v.pos.z) < 140); if (tail) { if (game.frame % 90 === 0) toast('黑車還跟著，先甩掉他們！'); return; } story.step = 2; clearChasers(); clearWanted(); $('timer').textContent = '';
        wideCam(t.x + 30, t.z + 30, 14, t.x, t.z); say([['radio', '（電話）……我是阿明，我不敢露面了，他們在跟你們。'], ['radio', '（電話）聽好：老陳在料羅港有一間倉庫，金城的林隊長在查他，去找林隊長。'], ['yun', '林隊長……我知道他，他是好人。'], ['me', '好，明天我就去金城找他。']], () => finishChapter(4000)); }
    };
  });
}
function chTail(n) {
  say([['lin', '你就是阿廷？小芸跟我說了你的事。'], ['lin', '我盯老陳很久了，但一直抓不到他的把柄。'], ['lin', '他的手下等一下會開一台白色小貨車去倉庫。你跟著它，看它停在哪裡。'], ['lin', '別跟太近，被發現就完了；也別跟丟。這把衝鋒槍給你防身。', () => giveWeapon(2, 150)]], () => {
    const w = wpos(), c = roadSamples.filter(q => { const p = q.e.pts[q.i], d = Math.hypot(p.x - w.x, p.z - w.z); return d > 70 && d < 160 && !q.e.bridge; });
    let v = null; for (let k = 0; k < 8 && !v; k++) v = spawnTraffic(pick(c)); if (!v) return failChapter('附近找不到目標');
    v.tail = true; v.perm = true; v.ai.cruise = 17; story.car = v; story.t = 0; story.lost = 0; goal('跟蹤目標車（保持 15～150 公尺）', v.pos.x, v.pos.z);
    story.tick = dt => {
      if (!vehicles.includes(v)) return failChapter('目標不見了');
      const d = Math.hypot(v.pos.x - player.pos.x, v.pos.z - player.pos.z);
      if (story.step === 0) { if (d < 13) return failChapter('跟太近，被發現了'); if (d > 165) { story.lost += dt; if (story.lost > 7) return failChapter('跟丟了'); } else { story.lost = 0; story.t += dt; }
        $('timer').textContent = `跟蹤 ${Math.floor(story.t)}/80 秒　距離 ${Math.round(d)} 公尺` + (d > 150 ? '　⚠ 快跟丟了' : d < 20 ? '　⚠ 太近了' : '');
        if (game.frame % 20 === 0) { target = { x: v.pos.x, z: v.pos.z, label: '目標車' }; routeT = 0; }
        if (story.t >= 80) { story.step = 1; v.ai.cruise = 0; v.ai.stun = 999; story.thugs = thugsAt(v.pos.x, v.pos.z, 4, 50, 8); $('timer').textContent = ''; subtitle('<b>林隊長</b>（無線電）：「它停下來了！那裡就是倉庫。小心，有守衛。」', 5); goal('解決倉庫的守衛', v.pos.x, v.pos.z); } }
      else if (story.step === 1) { const a = aliveOf(story.thugs); for (const c of a) if (Math.hypot(c.pos.x - player.pos.x, c.pos.z - player.pos.z) < 38) c.alert = true; $('timer').textContent = '守衛 ' + a.length; if (!a.length) { story.step = 2; clearWanted(); $('timer').textContent = ''; say([['lin', '（無線電）幹得好！倉庫裡全是走私的菸酒。'], ['lin', '（無線電）但這還不夠讓老陳坐牢。我需要他的帳本。'], ['me', '帳本……我想我知道在哪。']], () => finishChapter(4500)); } }
    };
  });
}
function chSea(n) {
  say([['lin', '線報說老陳今晚有一艘走私船要從金門外海出去。'], ['lin', '碼頭邊那艘快艇給你開，追上去把它擊沉，或撞到它開不動。'], ['me', '海上追逐？好，我來。']], () => {
    const sp = seaPoint(n.x, n.z, 30) || seaPoint(n.x, n.z, 55) || { x: n.x + 30, z: n.z }; const b = makeVehicle('boat', sp.x, sp.z, 0); b.perm = true; story.boat = b; goal('上快艇（F）', sp.x, sp.z);
    story.tick = dt => {
      if (story.step === 0 && player.veh === b) { const q = seaPoint(b.pos.x, b.pos.z, 170) || seaPoint(b.pos.x, b.pos.z, 120); if (!q) return failChapter('找不到走私船'); const e = makeVehicle('boat', q.x, q.z, q.a, '#2b2b2b'); e.thug = true; e.perm = true; e.hp = 120; story.enemy = e; story.dir = { x: Math.sin(q.a), z: Math.cos(q.a) }; story.bt = 0; story.step = 1; subtitle('<b>林隊長</b>：「黑色那艘就是！它往外海跑了！」', 4); }
      else if (story.step === 1) { const e = story.enemy; if (!vehicles.includes(e) || e.hp <= 0 || e.burn) { story.step = 2; banner('擊沉走私船', ''); goal('回水頭碼頭找林隊長', n.x, n.z); return; }
        story.bt += dt; const sp2 = Math.min(13, 4 + story.bt * 0.5); let nx = e.pos.x + story.dir.x * sp2 * dt, nz = e.pos.z + story.dir.z * sp2 * dt; if (groundAt(nx, nz) > -2) { const a = Math.atan2(story.dir.x, story.dir.z) + 0.6; story.dir = { x: Math.sin(a), z: Math.cos(a) }; nx = e.pos.x; nz = e.pos.z; } e.pos.x = nx; e.pos.z = nz; e.speed = sp2; e.yaw = Math.atan2(story.dir.x, story.dir.z); vehiclePost(e, dt);
        const d = Math.hypot(e.pos.x - player.pos.x, e.pos.z - player.pos.z); if (player.veh && player.veh.def.boat && d < 6.5 && Math.abs(player.veh.speed) > 9 && (story.ram || 0) < game.time) { story.ram = game.time + 1; e.hp -= 45; sfx('thud', 0.5); toast('撞到了！'); }
        $('timer').textContent = `走私船 ${Math.max(0, Math.round(e.hp))}　距離 ${Math.round(d)}`; if (d > 700) return failChapter('走私船跑掉了'); if (game.frame % 20 === 0) { target = { x: e.pos.x, z: e.pos.z, label: '走私船' }; routeT = 0; } }
      else if (story.step === 2 && near(n.x, n.z, 22)) { story.step = 3; $('timer').textContent = ''; say([['lin', '漂亮！海巡把船上的人都撈起來了。'], ['lin', '他們招了：老陳的人會在馬山觀測所，用望遠鏡跟對岸打信號。']], () => finishChapter(5000)); }
    };
  });
}
function chMashan(n) {
  say([['lin', '馬山觀測所是離對岸最近的地方。'], ['lin', '老陳的人在裡面用望遠鏡打信號。去觀測點拍下證據，然後馬上回金城警局。'], ['me', '拍完就跑，懂。']], () => {
    const T = tunnelByName('馬山觀測所'), m = T.mouths[0]; goal('進入馬山觀測所', m.x, m.z); const J = roadNodes.JC;
    story.tick = dt => {
      if (story.step === 0 && player.tunnel === T) { story.step = 1; goal('走到最裡面的觀測點（望遠鏡）'); }
      else if (story.step === 1 && player.tunnel === T && T.scope && Math.hypot(player.pos.x - T.scope.x, player.pos.z - T.scope.z) < 4) { story.step = 2; sfx('chime'); toast('📷 拍下證據'); subtitle('望遠鏡旁邊還放著信號燈和一本寫滿時間的筆記。', 4); goal('帶著證據，4 分鐘內趕回金城警局', J.x, J.z); story.timer = 240; }
      else if (story.step >= 2) { story.timer -= dt; $('timer').textContent = '⏱ ' + Math.ceil(story.timer) + ' 秒'; if (story.timer <= 0) return failChapter('證據沒能及時送到');
        if (story.step === 2 && !player.tunnel) { story.step = 3; story.thugs = thugsAt(player.pos.x, player.pos.z, 3, 40, 16); for (const c of story.thugs) c.alert = true; subtitle('外面有人在等你！快找車離開！', 4); }
        if (story.step === 3 && player.veh && !story.chased) { story.chased = true; chasers(player.veh, 2); }
        if (near(J.x, J.z, 16)) { story.step = 9; story.chased = false; clearChasers(); clearWanted(); $('timer').textContent = ''; say([['lin', '照片很清楚，這下證據確鑿。'], ['lin', '不過……大膽島那邊剛傳來消息，好像也有人要從那裡上岸。']], () => finishChapter(5000)); } }
    };
  });
}
function chDadan(n) {
  say([['lin', '老陳狗急跳牆了，他要從大膽島把貨運走。'], ['lin', '跟我搭交通船過去。今晚，我們守住那座島。']], () => {
    story.active = false; mission.type = null; const j = SIDE.find(q => q.id === 'dadan2'); story.waitSide = 'dadan2'; story.sideOk = false; startSide(j); if (!side.job) { story.waitSide = null; failChapter('無法開始'); }
  });
}
function chHostage(n) {
  say([['yun', '阿廷！不好了！阿德叔被老陳的人帶走了！'], ['yun', '有人看到他們往古寧頭去了，就在北山那一帶的老房子。'], ['me', '老陳……他敢動我叔！'], ['yun', '你一定要把他平安帶回來！']], () => {
    const s = spot(24.4800, 118.3040, 3, 14) || GW(24.4800, 118.3040); story.thugs = thugsAt(s.x, s.z, 6, 55, 9);
    const u = makePerson({ female: false, shirt: '#f4f1ea', pants: '#5a5148', hair: '#6b6b6b', jacket: null }); u.group.position.set(s.x, heightAt(s.x, s.z), s.z); poseSit(u); scene.add(u.group); storyExtra(u.group);
    if (!inv.has[1]) giveWeapon(1, 48); goal('到古寧頭救出阿德叔', s.x, s.z); const home = myHome.ext ? myHome.ext.m : roadNodes.UNI;
    story.tick = dt => {
      const a = aliveOf(story.thugs);
      if (story.step === 0) { for (const c of a) if (Math.hypot(c.pos.x - player.pos.x, c.pos.z - player.pos.z) < 45) c.alert = true; $('timer').textContent = '綁匪 ' + a.length; if (!a.length) { story.step = 1; clearWanted(); $('timer').textContent = ''; cutCam({ m: { group: u.group } }); say([['uncle', '阿廷……你怎麼來了，這裡很危險！'], ['me', '叔，我帶你回家。'], ['uncle', '老陳說今晚要從水頭碼頭跑路，你要小心……']], () => { scene.remove(u.group); goal('開車把阿德叔載回頂埔下的家', home.x, home.z); story.timer = 360; story.step = 2; }); } }
      else if (story.step >= 2) { story.timer -= dt; $('timer').textContent = '⏱ ' + Math.ceil(story.timer) + ' 秒'; if (story.timer <= 0) return failChapter('沒能把阿德叔送到安全的地方');
        if (story.step === 2 && player.veh) { story.step = 3; chasers(player.veh, 2); subtitle('<b>阿德叔</b>：「後面有車追來了！」', 4); }
        if (near(home.x, home.z, 14)) { story.step = 9; clearChasers(); clearWanted(); $('timer').textContent = ''; say([['uncle', '這是……你家？好久沒來頂埔下了。'], ['me', '叔，你先在這裡休息，最後一件事我去處理。'], ['uncle', '阿廷……老陳在水頭碼頭。我陪你去，這是我們家的事。']], () => finishChapter(6000)); } }
    };
  });
}
