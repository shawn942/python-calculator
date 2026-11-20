/* =====================================================================
   生存挑戰：身無分文開始，在金門活過 24／100 個遊戲小時。
   會餓（要賺錢買東西吃），100 小時版每過一天警方追緝升一級。陣亡或被捕就失敗。
   挑戰期間原本的錢先寄放，結束（不論成敗）都會還給你；中途關掉 App 會接著算。
   ===================================================================== */
const SURV = { on: false, goal: 24, hours: 0, hunger: 100, stash: 0, last: 0, saveT: 0, hurtT: 0, day: 0, el: null };
const survBest = () => +(localStorage.getItem('kinmen_surv_best') || 0);
function survHud() {
  if (!SURV.el) { const d = document.createElement('div'); d.id = 'surv'; d.style.cssText = 'margin-top:8px;font-weight:800;font-size:14px;text-align:right;text-shadow:0 1px 3px #000;display:none'; $('tr').appendChild(d); SURV.el = d; }
  SURV.el.style.display = SURV.on ? '' : 'none'; if (!SURV.on) return;
  const h = Math.round(SURV.hunger), c = h > 50 ? '#8fe38f' : h > 20 ? '#ffd24a' : '#ff6b5a';
  SURV.el.innerHTML = `⏳ 生存 ${Math.floor(SURV.hours)} / ${SURV.goal} 小時<br><span style="color:${c}">🍚 飽足 ${h}%</span>`;
}
function survSave() { try { if (SURV.on) localStorage.setItem('kinmen_surv', JSON.stringify({ goal: SURV.goal, hours: SURV.hours, hunger: SURV.hunger, stash: SURV.stash, day: SURV.day, heat: SURV.heat || 0, heatEnd: SURV.heatEnd || 0 })); else localStorage.removeItem('kinmen_surv'); } catch (e) { } }
function survStart(goal) {
  if (SURV.on) return; if (wanted.stars) { toast('被通緝時不能開始挑戰'); return; }
  Object.assign(SURV, { on: true, goal, hours: 0, hunger: 100, stash: player.money, last: env.tod, day: 0, hurtT: 0, heat: 0, heatEnd: 0 }); addMoney(-player.money); survSave(); survHud(); sfx('chime', 0.3);
  subtitle(`<b>生存挑戰開始</b>：身上的錢先寄放，活過 ${goal} 個小時就贏。記得賺錢買東西吃（便利商店、小吃攤）。${goal > 24 ? '每過一天，警方會多盯你一級。' : ''}`, 9);
}
function survEnd(win, why) {
  if (!SURV.on) return; SURV.on = false; const hrs = Math.floor(SURV.hours); if (hrs > survBest()) { try { localStorage.setItem('kinmen_surv_best', hrs); } catch (e) { } }
  const prize = win ? (SURV.goal >= 100 ? 100000 : 15000) : hrs * 100; addMoney(SURV.stash + prize); SURV.stash = 0; survSave(); survHud(); saveGame();
  if (win) { sfx('chime', 0.5); subtitle(`<b>挑戰成功！</b>你在金門活過了 ${SURV.goal} 小時。獎金 $${prize.toLocaleString()}，寄放的錢也還你了。`, 10); }
  else subtitle(`<b>生存挑戰結束</b>（${why}）：撐了 ${hrs} 小時${prize ? '，安慰獎 $' + prize.toLocaleString() : ''}。寄放的錢已歸還。最佳紀錄 ${survBest()} 小時。`, 9);
}
function survFail() { survEnd(false, '倒下了'); }
function survEat(n) { if (!SURV.on) return; SURV.hunger = Math.min(100, SURV.hunger + n); survHud(); }
function survLoad() { try { const d = JSON.parse(localStorage.getItem('kinmen_surv') || 'null'); if (!d) return; Object.assign(SURV, d, { on: true, last: env.tod, hurtT: 0 }); survHud(); toast(`生存挑戰繼續：第 ${Math.floor(SURV.hours)} 小時`); } catch (e) { } }
function updateSurvival(dt) {
  if (!SURV.on || game.busy) { SURV.last = env.tod; return; }
  let d = (env.tod - SURV.last + 24) % 24; SURV.last = env.tod; if (d > 0.05) d = 0; // 睡覺、快轉跳過的時間不算
  SURV.hours += d; SURV.hunger = Math.max(0, SURV.hunger - d * 7);
  if (SURV.hunger <= 0) { SURV.hurtT -= dt; if (SURV.hurtT <= 0) { SURV.hurtT = 2.5; toast('餓到發昏，快找東西吃！'); damage(9); if (!SURV.on) return; } }
  else if (SURV.hunger < 20 && Math.floor((SURV.hunger + d * 7) / 5) !== Math.floor(SURV.hunger / 5)) toast('肚子很餓了…');
  if (SURV.goal > 24) { const day = Math.floor(SURV.hours / 24); if (day > SURV.day) { SURV.day = day; if (day < 5) { SURV.heat = Math.min(4, day); SURV.heatEnd = SURV.hours + 2; crimeMin(SURV.heat); subtitle(`<b>第 ${day + 1} 天</b>：警方接獲線報，追緝升到 ${Math.min(4, day)} 星，撐過兩小時！`, 6); } } }
  if (SURV.heat && SURV.hours < SURV.heatEnd) crimeMin(SURV.heat); else SURV.heat = 0; // 追緝維持 2 小時，躲不掉，只能撐過去
  if (SURV.hours >= SURV.goal) { survEnd(true); return; }
  SURV.saveT -= dt; if (SURV.saveT <= 0) { SURV.saveT = 5; survSave(); survHud(); }
}
function phoneSurvival() {
  if (SURV.on) return phoneMenu('⏳ 生存挑戰', [{ n: '目前進度', d: `${Math.floor(SURV.hours)} / ${SURV.goal} 小時・飽足 ${Math.round(SURV.hunger)}%`, fn: closeMenu }, { n: '放棄挑戰', d: '歸還寄放的錢', fn: () => { closeMenu(); survEnd(false, '放棄'); } }]);
  phoneMenu('⏳ 生存挑戰', [{ n: '24 小時（約 18 分鐘）', d: '身無分文開始・獎金 $15,000', fn: () => { closeMenu(); survStart(24); } }, { n: '100 小時（約 75 分鐘）', d: '每天追緝升級・獎金 $100,000', fn: () => { closeMenu(); survStart(100); } }, { n: '最佳紀錄', d: survBest() + ' 小時', fn: closeMenu }]);
}
