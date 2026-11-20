/* =====================================================================
   觸控按鍵：依情境顯示。靠近車才出現「上車」，上車後變「下車」；
   沒有可互動的東西時互動鍵淡出；車上攻擊鍵變煞車、跳躍鍵變喇叭。
   ===================================================================== */
const TUI = { on: false, f: 0, last: {} };
function touchStyle() {
  const st = document.createElement('style'); st.textContent = `
  .tb { background:linear-gradient(160deg,rgba(40,52,64,.62),rgba(10,14,20,.62)) !important; border:1.5px solid rgba(255,255,255,.38) !important; box-shadow:0 4px 14px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18); -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px); letter-spacing:.04em; transition:opacity .22s ease, transform .22s cubic-bezier(.3,1.4,.5,1), background .2s, border-color .2s; text-shadow:0 1px 2px rgba(0,0,0,.6); }
  .tb:active { transform:scale(.9); filter:brightness(1.35); }
  .tb.hide { opacity:0 !important; transform:scale(.55); pointer-events:none !important; }
  .tb.dim { opacity:.38; }
  .tb.go { background:linear-gradient(160deg,rgba(255,196,60,.92),rgba(214,140,20,.92)) !important; border-color:#fff3c4 !important; color:#231a05 !important; text-shadow:none; }
  .tb.out { background:linear-gradient(160deg,rgba(236,92,76,.9),rgba(170,44,36,.9)) !important; border-color:#ffd2cb !important; }
  .tb.act { background:linear-gradient(160deg,rgba(72,170,255,.9),rgba(28,104,200,.9)) !important; border-color:#d6ecff !important; }
  #stick { background:radial-gradient(circle,rgba(255,255,255,.06),rgba(255,255,255,.16)) !important; border:1.5px solid rgba(255,255,255,.32) !important; box-shadow:0 4px 16px rgba(0,0,0,.3); }
  #nub { background:radial-gradient(circle at 35% 30%,#fff,rgba(255,255,255,.55)) !important; box-shadow:0 2px 8px rgba(0,0,0,.4); }`;
  document.head.appendChild(st);
}
function tbSet(id, label, cls) { // label 為 null＝隱藏
  const k = label + '|' + cls; if (TUI.last[id] === k) return; TUI.last[id] = k; const b = $(id); if (!b) return;
  b.classList.toggle('hide', label === null); for (const c of ['dim', 'go', 'out', 'act']) b.classList.toggle(c, cls === c); if (label !== null) b.textContent = label;
}
function updateTouchUI() {
  if (!TUI.on) { if ($('touch').style.display !== 'block') return; TUI.on = true; touchStyle(); }
  if (++TUI.f % 5) return;
  if (story.dialog) { tbSet('btnE', '繼續', 'go'); for (const id of ['btnF', 'btnA', 'btnJ', 'btnG', 'btnQ']) tbSet(id, null, ''); return; }
  const v = player.veh, pl = player.plane, foot = !v && !pl && !player.bus;
  // 車鍵
  let f = null, fc = 'go';
  if (pl) { if (!(pl.air || pl.speed > 4)) { f = '下機'; fc = 'out'; } } else if (v) { f = v.def.boat ? '下船' : '下車'; fc = 'out'; }
  else if (!player.inside && !player.bus && !game.busy) { const np = nearestPlane(), nv = np ? null : nearestVehicle(); if (np) f = '飛機'; else if (nv) f = nv.driver === 'ai' ? '搶車' : nv.def.boat ? '開船' : '上車'; }
  tbSet('btnF', f, fc);
  // 互動鍵
  let e = null, ec = 'act';
  if (game.menu) { e = '關閉'; ec = 'out'; } else if (player.bus) { e = '下車'; ec = 'out'; }
  else if (foot) { const a = nearAction(), m = nearMarker(); if (a) e = '互動'; else if (m) e = '任務'; else if (busBoardable()) e = '搭車'; else { e = '互動'; ec = 'dim'; } }
  else if (v && v.def.taxi && !mission.taxi && !mission.type) e = '載客';
  tbSet('btnE', e, ec);
  tbSet('btnA', player.bus ? null : (v || pl) ? '煞車' : inv.cur ? '開槍' : '出拳', '');
  tbSet('btnJ', pl || player.bus ? null : v ? '喇叭' : '跳', '');
  tbSet('btnG', foot && player.nades > 0 ? '💣' : null, '');
  tbSet('btnQ', player.bus ? null : '武器', '');
}

/* 效能顯示：手機選單「效能顯示」開關，記在本機。顯示 FPS、繪圖次數、三角形數、畫質 */
const PERF = { on: (() => { try { return localStorage.getItem('kinmen_perf') === '1'; } catch (e) { return false; } })(), el: null, n: 0, t: 0, fps: 0, lo: 999 };
function perfToggle() { PERF.on = !PERF.on; try { localStorage.setItem('kinmen_perf', PERF.on ? '1' : '0'); } catch (e) { } if (PERF.el) PERF.el.style.display = PERF.on ? '' : 'none'; toast(PERF.on ? '效能顯示：開' : '效能顯示：關'); }
function perfTick(now) {
  if (!PERF.on) return; if (!PERF.el) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 6px);transform:translateX(-50%);z-index:30;background:rgba(0,0,0,.6);color:#8f8;font:700 12px/1.35 ui-monospace,monospace;padding:4px 10px;border-radius:8px;pointer-events:none;white-space:pre;text-align:center'; document.body.appendChild(d); PERF.el = d; }
  renderer.info.autoReset = false; PERF.calls = renderer.info.render.calls; PERF.tris = renderer.info.render.triangles; renderer.info.reset(); // 一整格畫面（含後製）的總量
  PERF.n++; if (!PERF.t) PERF.t = now; const dt = now - PERF.t; if (dt < 1000) return;
  const fps = PERF.n * 1000 / dt; PERF.n = 0; PERF.t = now; PERF.lo = Math.min(PERF.lo, fps); const M = renderer.info.memory;
  PERF.el.style.color = fps >= 45 ? '#8f8' : fps >= 25 ? '#fd6' : '#f77';
  PERF.el.textContent = `FPS ${fps.toFixed(0)}（最低 ${PERF.lo.toFixed(0)}）・繪圖 ${PERF.calls}・三角形 ${(PERF.tris / 1000).toFixed(0)}k\n貼圖 ${M.textures}・解析度 ${renderer.getPixelRatio().toFixed(2)}x・${innerWidth}×${innerHeight}`;
}
