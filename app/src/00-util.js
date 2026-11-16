/* ===== 00 · helpers, storage, sync, voice, sound, XP, SRS ===== */
const $ = (s, r) => (r || document).querySelector(s);
function h(tag, props) {
  const el = document.createElement(tag);
  if (props) for (const k in props) {
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (let i = 2; i < arguments.length; i++) kid(el, arguments[i]);
  return el;
}
function kid(el, c) {
  if (c == null || c === false || c === true) return;
  if (Array.isArray(c)) { c.forEach(x => kid(el, x)); return; }
  el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
}
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
const sample = (a, n) => shuffle(a).slice(0, n);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const uniq = a => Array.from(new Set(a));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');
const sum = (a, f) => a.reduce((t, x) => t + (f ? f(x) : x), 0);
function chunks(arr, n) { const out = [], base = Math.floor(arr.length / n), extra = arr.length % n; let i = 0; for (let c = 0; c < n; c++) { const len = base + (c < extra ? 1 : 0); out.push(arr.slice(i, i + len)); i += len; } return out; }
const plural = (n, w, p) => n + ' ' + (n === 1 ? w : (p || w + 's'));

/* timers and keys that switch themselves off once their view is gone */
function every(ms, fn, root) { const id = setInterval(() => { if (!root.isConnected) { clearInterval(id); return; } fn(); }, ms); return id; }
function later(ms, fn, root) { return setTimeout(() => { if (root.isConnected) fn(); }, ms); }
const KEYS = [];
function onKey(root, fn) { KEYS.push({ root, fn }); }
document.addEventListener('keydown', e => {
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  for (let i = KEYS.length - 1; i >= 0; i--) {
    const k = KEYS[i];
    if (!k.root.isConnected) { KEYS.splice(i, 1); continue; }
    k.fn(e); return;
  }
});
let LEAVE = [];
const onLeave = fn => LEAVE.push(fn);
function runLeave() { const l = LEAVE; LEAVE = []; l.forEach(f => { try { f(); } catch (e) {} }); }

/* ---------- dates (local calendar days) ---------- */
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function parseYmd(s) { const a = String(s).split('-').map(Number); return new Date(a[0], (a[1] || 1) - 1, a[2] || 1); }
function dayNo(s) { const d = parseYmd(s); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
const DAY_START_H = 4; // a study day runs 4 am to 4 am, so late-night sessions count for the same day
const today = () => ymd(new Date(Date.now() - DAY_START_H * 36e5));
function addDays(s, n) { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
const fmtDate = (s, o) => parseYmd(s).toLocaleDateString('en-GB', o || { weekday: 'short', day: 'numeric', month: 'short' });
const fmtLong = s => parseYmd(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const weekday = s => parseYmd(s).getDay(); // 0 = Sunday
const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

/* ---------- icons ---------- */
const SV = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  speak: `<svg ${SV}><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>`,
  gear: `<svg ${SV}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  back: `<svg ${SV}><path d="M15 18l-6-6 6-6"/></svg>`,
  next: `<svg ${SV}><path d="M9 18l6-6-6-6"/></svg>`,
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.9 3.2 4.6 5.4 4.6 9.6a4.6 4.6 0 0 1-9.2 0c0-2.1 1-3.5 2.1-4.6.1 1.8.9 3 2.1 3.2C11 7.6 11.2 4.6 12 2zM5 14.5a7 7 0 0 0 14 0c0-1.6-.4-3-1.1-4.2.2 4-2.7 7.4-5.9 7.4s-5.6-2.6-5.9-6c-.7 1-1.1 1.8-1.1 2.8z"/></svg>',
  check: `<svg ${SV}><path d="M20 6 9 17l-5-5"/></svg>`,
  sheet: `<svg ${SV}><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="9" cy="8" r="1.3"/><circle cx="15" cy="8" r="1.3"/><circle cx="9" cy="13" r="1.3"/><circle cx="15" cy="13" r="1.3"/><path d="M8 18h8"/></svg>`,
  replay: `<svg ${SV}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>`
};
const ico = name => h('span', { class: 'ico', html: ICON[name], 'aria-hidden': 'true' });

/* ---------- storage: this browser first, Claude account sync when the viewer allows it ---------- */
const KEY = 'n5cc.v1';
const APP_VERSION = '2.0.0';
// games where a lower score wins (times). Kept here, not read from GAMES: saved copies are merged while the app is still loading, before the games file has run
const LOWER_BETTER = { match: 1 };
const BOOT_NOTES = [];   // problems met while opening saved progress; written to the error log once logging is ready
function blankState() {
  return { v: 1, updated: 0, created: today(), setup: false,
    set: { exam: 'jlpt27', date: '2027-07-04', mins: 30, kana: 'none', rate: 0.9, theme: 'auto', sfx: true, voice: '', once: true, showOpts: false, love: true, lv: 'n5' },
    xp: 0, days: {}, streak: { n: 0, best: 0, last: '' }, srs: {}, les: {}, mocks: {}, drafts: {}, hist: [], ts: {}, games: {}, seen: {}, today: null, lv: { hello: '', st: 0, pp: {} }, L: {}, talk: {} };
}
function normalize(s) {
  const b = blankState();
  if (!s || typeof s !== 'object' || s.v !== 1) return b;
  for (const k in b) if (!(k in s) || s[k] == null) s[k] = b[k];
  s.set = Object.assign(b.set, s.set || {});
  return s;
}
/* Progress that belongs to one JLPT level (mock scores, drafts, today's plan). The active level's copy sits in the usual
   slots; the other levels wait in s.L. This moves a state from its current level to another one. */
const LVKEYS = ['mocks', 'drafts', 'hist', 'ts', 'seen'];
const levelOf = s => (s && s.set && s.set.lv) || 'n5';
function switchLevelState(s, to) {
  const from = levelOf(s);
  if (from === to) return s;
  s.L = s.L || {};
  const keep = { pp: (s.lv && s.lv.pp) || {} };
  LVKEYS.forEach(k => { keep[k] = s[k]; });
  s.L[from] = keep;
  const b = s.L[to] || {};
  delete s.L[to];
  s.mocks = b.mocks || {}; s.drafts = b.drafts || {}; s.hist = b.hist || []; s.ts = b.ts || {}; s.seen = b.seen || {};
  s.today = null;
  s.lv = s.lv || {}; s.lv.pp = b.pp || {};
  s.set = s.set || {}; s.set.lv = to;
  return s;
}
/* merge the level-specific parts of two copies; x is the newer one */
function mergeLevelData(x, y) {
  x = x || {}; y = y || {};
  const keys = (a, b) => Array.from(new Set(Object.keys(a || {}).concat(Object.keys(b || {})))), r = {};
  r.mocks = {};
  keys(x.mocks, y.mocks).forEach(p => {
    const u0 = (x.mocks || {})[p] || {}, v0 = (y.mocks || {})[p] || {}, o = {};
    keys(u0, v0).forEach(s => { const u = u0[s], v = v0[s]; o[s] = !u ? v : !v ? u : ((u.n || 0) > (v.n || 0) || ((u.n || 0) === (v.n || 0) && (u.d || '') >= (v.d || '')) ? u : v); });
    r.mocks[p] = o;
  });
  const seenH = new Set();
  r.hist = (y.hist || []).concat(x.hist || []).filter(e => { const k = [e.p, e.s, e.sc, e.d, e.m].join('|'); if (seenH.has(k)) return false; seenH.add(k); return true; }).slice(-300);
  r.ts = {};
  keys(x.ts, y.ts).forEach(t => { const u = (x.ts || {})[t], v = (y.ts || {})[t]; r.ts[t] = (!v || (u && u[1] >= v[1]) ? u : v).slice(); });
  r.seen = {};
  keys(x.seen, y.seen).forEach(t => {
    const u0 = (x.seen || {})[t] || {}, v0 = (y.seen || {})[t] || {}, o = {};
    keys(u0, v0).forEach(p => { const u = u0[p] || '', v = v0[p] || '', L = Math.max(u.length, v.length); let str = ''; for (let i = 0; i < L; i++) str += (u[i] === '1' || v[i] === '1') ? '1' : '0'; o[p] = str; });
    r.seen[t] = o;
  });
  r.drafts = Object.assign({}, y.drafts || {}, x.drafts || {});
  r.pp = Object.assign({}, y.pp || {}, x.pp || {});
  return r;
}
/* merge two copies of progress so that nothing done on either copy is lost */
function mergeStates(a, b) {
  if (!a || a.v !== 1) return b;
  if (!b || b.v !== 1) return a;
  if ((b.resetAt || 0) > (a.updated || 0)) return b;   // a reset or restore on one copy wins over older work
  if ((a.resetAt || 0) > (b.updated || 0)) return a;
  const nw = (a.updated || 0) >= (b.updated || 0) ? a : b;
  let od = nw === a ? b : a;
  if (levelOf(od) !== levelOf(nw)) od = switchLevelState(JSON.parse(JSON.stringify(od)), levelOf(nw));   // compare like with like
  const m = JSON.parse(JSON.stringify(nw));
  const keys = (x, y) => Array.from(new Set(Object.keys(x || {}).concat(Object.keys(y || {}))));
  m.les = {};
  keys(nw.les, od.les).forEach(id => {
    const x = (nw.les || {})[id] || {}, y = (od.les || {})[id] || {}, r = {};
    ['m', 'u', 'p'].forEach(f => { if (x[f] || y[f]) r[f] = 1; });
    if (x.t != null || y.t != null) r.t = Math.max(x.t || 0, y.t || 0);
    if (x.d || y.d) r.d = x.d || y.d;
    m.les[id] = r;
  });
  m.srs = {};
  keys(nw.srs, od.srs).forEach(k => {
    const x = (nw.srs || {})[k], y = (od.srs || {})[k];
    if (!x || !y) { m.srs[k] = (x || y).slice(); return; }
    const nx = x[2] + x[3], ny = y[2] + y[3];
    m.srs[k] = (nx > ny || (nx === ny && x[1] >= y[1]) ? x : y).slice();
  });
  m.days = {};
  keys(nw.days, od.days).forEach(d => {
    const x = (nw.days || {})[d] || {}, y = (od.days || {})[d] || {}, r = {};
    keys(x, y).forEach(f => { r[f] = Math.max(+x[f] || 0, +y[f] || 0); });
    m.days[d] = r;
  });
  const lvd = mergeLevelData(nw, od);
  m.mocks = lvd.mocks; m.hist = lvd.hist; m.ts = lvd.ts;
  m.games = Object.assign({}, od.games || {}, nw.games || {});
  keys(nw.games, od.games).forEach(k => {
    const x = (nw.games || {})[k], y = (od.games || {})[k];
    if (typeof x !== 'number' || typeof y !== 'number') return;
    m.games[k] = LOWER_BETTER[k.split(':')[0]] ? Math.min(x, y) : Math.max(x, y);
  });
  m.seen = lvd.seen;
  const sx = nw.streak || {}, sy = od.streak || {};
  m.streak = ((sx.last || '') > (sy.last || '') || ((sx.last || '') === (sy.last || '') && (sx.n || 0) >= (sy.n || 0))) ? Object.assign({}, sx) : Object.assign({}, sy);
  m.streak.best = Math.max(sx.best || 0, sy.best || 0, m.streak.n || 0);
  const lx = nw.lv || {}, ly = od.lv || {};
  // pop-up bookkeeping: keep every key either copy has (when the notes prompt was shown, which version's news was seen, …)
  const lastOf = (a, b) => ((a || '') >= (b || '') ? a : b) || a || b || '';
  m.lv = Object.assign({}, ly, lx, { hello: lastOf(lx.hello, ly.hello), st: Math.max(lx.st || 0, ly.st || 0), pp: Object.assign({}, ly.pp || {}, lx.pp || {}) });
  if (lx.nAsk || ly.nAsk) m.lv.nAsk = lastOf(lx.nAsk, ly.nAsk);
  if (lx.ver || ly.ver) m.lv.ver = [lx.ver, ly.ver].filter(Boolean).sort((a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); return 0; }).pop();
  if (od.today && (!nw.today || od.today.date > nw.today.date)) m.today = JSON.parse(JSON.stringify(od.today));
  m.L = {};
  keys(nw.L, od.L).forEach(k => { const x = (nw.L || {})[k], y = (od.L || {})[k]; m.L[k] = x && y ? mergeLevelData(x, y) : JSON.parse(JSON.stringify(x || y)); });
  delete m.L[levelOf(m)];
  m.talk = {};
  keys(nw.talk, od.talk).forEach(k => { const x = (nw.talk || {})[k], y = (od.talk || {})[k]; m.talk[k] = (x && typeof x === 'object') ? Object.assign({}, y || {}, x) : (x != null ? x : y); });
  m.xp = Math.max(nw.xp || 0, od.xp || 0);
  m.setup = !!(nw.setup || od.setup);
  m.mig = Math.max(nw.mig || 0, od.mig || 0);
  m.created = (nw.created || '') < (od.created || '') && nw.created ? nw.created : (od.created || nw.created);
  m.updated = Math.max(nw.updated || 0, od.updated || 0);
  return m;
}
function loadLocal() {
  const found = [];
  if (window.AndroidApp && AndroidApp.load) { try { const raw = AndroidApp.load(); if (raw) found.push(JSON.parse(raw)); } catch (e) { BOOT_NOTES.push('phone copy unreadable: ' + e.message); } }
  try { const raw = localStorage.getItem(KEY); if (raw) found.push(JSON.parse(raw)); } catch (e) { BOOT_NOTES.push('browser copy unreadable: ' + e.message); }
  const ok = found.filter(s => s && typeof s === 'object' && s.v === 1);
  if (!ok.length) return blankState();
  try { return normalize(ok.reduce((x, y) => mergeStates(x, y))); }
  catch (e) {
    // a failed merge must never stop the app opening: carry on with the newest copy exactly as saved
    BOOT_NOTES.push('merge failed, opened newest copy: ' + ((e && e.message) || e));
    return normalize(ok.reduce((x, y) => ((y.updated || 0) > (x.updated || 0) ? y : x)));
  }
}
function persist() {
  const json = JSON.stringify(S);
  if (window.AndroidApp && AndroidApp.save) { try { AndroidApp.save(json); } catch (e) {} }
  try { localStorage.setItem(KEY, json); } catch (e) {}
}
let S = loadLocal();
// quiet saves (things the app does on its own, like planning today) never make this device's copy look newer than the synced one
function save(quiet) {
  if (!quiet) S.updated = Date.now();
  if (S.hist.length > 300) S.hist = S.hist.slice(-300);
  persist();
  if (!quiet) Cloud.queue(false);
}
// one-time fix: a lesson whose test was already taken counts as complete (tests used to need 80%)
function migrate() {
  if ((S.mig || 0) >= 3) return;
  Object.keys(S.les).forEach(id => { const r = S.les[id]; if (r && typeof r.t === 'number' && !r.p) { r.p = 1; r.m = 1; r.u = 1; r.d = r.d || today(); } });
  S.mig = 3; save(true);
}
const pristine = () => !S.xp && !Object.keys(S.les).length && !Object.keys(S.mocks).length && !Object.keys(S.srs).length;
// keep the last few errors on the device so the Diagnostics card can show what went wrong
function logErr(msg) {
  try {
    let where = '';
    try { where = NAV.stack.length ? NAV.stack[NAV.stack.length - 1].name : ''; } catch (x) {}   // NAV does not exist yet while the app is loading
    S.diag = (S.diag || []).concat([{ t: new Date().toISOString().slice(0, 19).replace('T', ' '), m: String(msg).slice(0, 180), v: APP_VERSION, at: where }]).slice(-12);
    save(true);
  } catch (x) {}
}
window.addEventListener('error', ev => logErr((ev.message || 'error') + (ev.lineno ? ' (line ' + ev.lineno + ')' : '')));
window.addEventListener('unhandledrejection', ev => { const r = ev.reason; logErr('promise: ' + ((r && (r.message || r.code)) || r)); });
BOOT_NOTES.forEach(logErr);
let cloudDone = null;
const cloudReady = new Promise(r => { cloudDone = r; setTimeout(r, 2500); });
const Cloud = {
  ref: null, busy: false, dirty: false, timer: 0, retried: false, on: false, base: 0,
  async init() {
    try { await this.start(); } catch (e) {}
    cloudDone();
  },
  async start() {
    const c = window.claude;
    if (!c || typeof c.use !== 'function') return;
    try {
      const both = await Promise.all([c.use('db'), c.use('user')]);
      const db = both[0], user = both[1];
      if (!db || !user) return;
      const uid = await user.id();
      if (!uid) return;
      const ref = db.doc('data/users/' + uid + '/progress');
      const snap = await ref.get();
      this.ref = ref; this.on = true;
      let remote = null;
      if (snap.exists) { try { remote = JSON.parse((snap.data() || {}).state); } catch (e) {} }
      if (remote && remote.v === 1) {
        const before = JSON.stringify(S);
        S = normalize(pristine() ? remote : mergeStates(S, remote));
        migrate();
        persist();
        if (levelMismatch()) { location.reload(); return; }   // the synced copy is on another level: reopen at that level
        this.base = remote.updated || 0;
        if (JSON.stringify(S) !== before) { SHEETS.slice().forEach(cl => cl()); applyTheme(); TTS.pickVoice(); render(true); }
        if ((S.updated || 0) > this.base) this.queue(true);
      } else if (S.updated) this.queue(true);
      updateSync();
    } catch (e) { this.ref = null; this.on = false; }
  },
  queue(soon) {
    if (!this.ref) return;
    this.dirty = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), soon ? 400 : 1500);
  },
  async flush() {
    if (!this.ref || this.busy || !this.dirty) return;
    this.busy = true; this.dirty = false;
    try {
      const snap = await this.ref.get();   // pull first: work done on another device is merged in, never overwritten
      if (snap.exists) {
        let remote = null;
        try { remote = JSON.parse((snap.data() || {}).state); } catch (e) {}
        if (remote && remote.v === 1 && (remote.updated || 0) > this.base) { S = normalize(mergeStates(S, remote)); migrate(); persist(); }
      }
      await this.ref.set({ v: 1, updated: S.updated, state: JSON.stringify(S) });
      this.base = S.updated || 0;
      this.retried = false;
    } catch (e) {
      const code = e && e.code;
      if (code === 'unavailable' && !this.retried) { this.retried = true; this.dirty = true; this.busy = false; setTimeout(() => this.flush(), 1500 + rnd(2500)); return; }
      if (code === 'unavailable' || code === 'resource_exhausted') this.dirty = true;
      else { this.ref = null; this.on = false; }
    }
    this.busy = false;
    updateSync();
  }
};
// true when saved progress says one level but this page was loaded for another (only possible right after a sync)
function levelMismatch() { const want = levelOf(S); return want !== LV && (want === 'n5' || !!PACKS[want]); }
function flushAll() { if (S.updated) persist(); if (Cloud.dirty) { clearTimeout(Cloud.timer); Cloud.flush(); } }
window.__flush = flushAll;
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushAll(); });
window.addEventListener('pagehide', flushAll);
function updateSync() { const el = $('#sync-state'); if (el) el.textContent = Cloud.on ? 'Synced to your Claude account (private to you).' : 'Saved on this device.'; }

/* ---------- theme ---------- */
const HOST_THEME = document.documentElement.getAttribute('data-theme');
function applyTheme() {
  const root = document.documentElement, t = S.set.theme;
  if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t);
  else if (HOST_THEME) root.setAttribute('data-theme', HOST_THEME);
  else root.removeAttribute('data-theme');
  if (window.AndroidApp && AndroidApp.setBars) {
    try {
      const dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      AndroidApp.setBars(getComputedStyle(root).getPropertyValue('--card').trim() || '#ffffff', !dark);
    } catch (e) {}
  }
}

/* ---------- Japanese voice: Android bridge in the app, speechSynthesis in browsers ---------- */
const TTS = {
  android: !!window.AndroidTTS, ja: null, ja2: null, list: [], seq: 0, token: 0, cb: {}, keep: null, loaded: false,
  init() {
    if (this.android || !('speechSynthesis' in window)) return;
    const load = () => { this.loaded = true; this.pickVoice(); };
    try { load(); speechSynthesis.addEventListener('voiceschanged', load); } catch (e) { try { speechSynthesis.onvoiceschanged = load; } catch (e2) {} }
  },
  pickVoice() {
    if (this.android || !('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices() || [];
    this.all = vs.length;
    this.list = vs.filter(v => /^ja([-_]|$)/i.test(v.lang || ''));
    const pref = S.set.voice && this.list.find(v => v.voiceURI === S.set.voice);
    this.ja = pref || this.list.find(v => /google/i.test(v.name)) || this.list.find(v => /kyoko|otoya|haruka|ayumi|nanami|keita|ichiro/i.test(v.name)) || this.list[0] || null;
    this.ja2 = this.list.find(v => v !== this.ja) || this.ja;
  },
  can() {
    if (this.android) { try { return !!AndroidTTS.ready(); } catch (e) { return false; } }
    if (!('speechSynthesis' in window)) return false;
    return !!this.ja || !this.all; // voices not listed yet: try anyway
  },
  speak(text, o) {
    o = o || {};
    const rate = o.rate || S.set.rate || 0.9, pitch = o.pitch || 1;
    return new Promise(res => {
      if (!text) return res();
      if (this.android) {
        const id = 'u' + (++this.seq);
        let done = false;
        const fin = () => { if (!done) { done = true; delete this.cb[id]; res(); } };
        this.cb[id] = fin;
        try { AndroidTTS.speak(String(text), rate, pitch, id); } catch (e) { fin(); return; }
        setTimeout(fin, 2500 + String(text).length * 420 / rate);
        return;
      }
      if (!('speechSynthesis' in window)) return res();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'ja-JP';
      const v = o.alt ? this.ja2 : this.ja;
      if (v) u.voice = v;
      u.rate = rate; u.pitch = pitch;
      let done = false, t = 0;
      const fin = () => { if (!done) { done = true; clearTimeout(t); res(); } };
      u.onend = fin; u.onerror = fin;
      t = setTimeout(fin, 3000 + String(text).length * 450 / rate);
      this.keep = u;
      try { speechSynthesis.speak(u); } catch (e) { fin(); }
    });
  },
  say(text) { this.stop(); return this.speak(text); },
  async play(seq, onStep) {
    this.stop();
    const tok = ++this.token;
    for (let i = 0; i < seq.length; i++) {
      if (tok !== this.token) return false;
      const s = seq[i];
      if (onStep) onStep(i);
      await this.speak(s.t, { pitch: s.p, alt: s.alt });
      if (tok !== this.token) return false;
      if (s.gap) await sleep(s.gap);
    }
    return tok === this.token;
  },
  stop() {
    this.token++;
    if (this.android) { try { AndroidTTS.stop(); } catch (e) {} Object.keys(this.cb).forEach(k => this.cb[k]()); }
    else if ('speechSynthesis' in window) { try { speechSynthesis.cancel(); } catch (e) {} }
  }
};
window.__ttsDone = id => { const f = TTS.cb[id]; if (f) f(); };
function sayBtn(text, label) {
  return h('button', { class: 'say', type: 'button', title: 'Listen', 'aria-label': label || 'Listen', onclick: e => { e.stopPropagation(); TTS.say(text); } }, ico('speak'));
}
function voiceHelp() {
  if (TTS.can()) return null;
  return h('div', { class: 'note pink small' },
    h('b', {}, 'No Japanese voice found on this device. '),
    TTS.android
      ? ['Install one: Android Settings › System › Languages › Text-to-speech › Google › install Japanese. ', h('button', { class: 'btn small', onclick: () => { try { AndroidTTS.install(); } catch (e) {} } }, 'Open voice settings')]
      : 'Add one: Windows Settings › Time & language › Speech › Add voices › Japanese; Android Chrome uses Google voices (Settings › Languages › Text-to-speech); iPhone and Mac include Kyoko. Until then, use “Show script”.');
}

/* ---------- sound effects ---------- */
const SFX = {
  ctx: null,
  tone(fs, dur, type, vol) {
    if (!S.set.sfx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const C = this.ctx || (this.ctx = new AC());
      if (C.state === 'suspended') C.resume();
      let t = C.currentTime + 0.01;
      fs.forEach(f => {
        const o = C.createOscillator(), g = C.createGain();
        o.type = type || 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + dur + 0.02);
        t += dur * 0.75;
      });
    } catch (e) {}
  },
  ok() { this.tone([880, 1320], 0.08, 'triangle', 0.05); },
  bad() { this.tone([233, 175], 0.13, 'square', 0.025); },
  win() { this.tone([523, 659, 784, 1047], 0.12, 'triangle', 0.05); },
  tick() { this.tone([1400], 0.03, 'sine', 0.015); }
};

/* ---------- toast, sheet, confetti ---------- */
function toast(msg, cls) { const box = $('#toast'); if (!box) return; const d = h('div', { class: cls || '' }, msg); box.appendChild(d); setTimeout(() => d.remove(), 1900); }
const SHEETS = [];
function sheet(build) {
  const wrap = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' });
  const panel = h('div', { class: 'panel' });
  const close = () => { if (!wrap.isConnected) return; wrap.remove(); const i = SHEETS.indexOf(close); if (i >= 0) SHEETS.splice(i, 1); };
  wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  kid(panel, build(close));
  wrap.appendChild(panel);
  document.body.appendChild(wrap);
  SHEETS.push(close);
  onKey(wrap, e => { if (e.key === 'Escape') close(); });
  return close;
}
function confirmSheet(title, text, yes, onYes) {
  sheet(close => [h('h2', { class: 'verdict' }, title), text ? h('p', { class: 'mute' }, text) : null,
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: close }, 'Cancel'), h('button', { class: 'btn pink', onclick: () => { close(); onYes(); } }, yes))]);
}
function celebrate() {
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  const c = h('canvas', { class: 'confetti' });
  document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1, W = c.width = innerWidth * dpr, H = c.height = innerHeight * dpr;
  c.style.width = '100%'; c.style.height = '100%';
  const ctx = c.getContext('2d'), cs = getComputedStyle(document.documentElement);
  const cols = ['--sheet', '--pencil', '--good', '--ink2'].map(v => cs.getPropertyValue(v).trim() || '#d63f6b');
  const ps = Array.from({ length: 110 }, () => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.4, y: H * 0.4, vx: (Math.random() - 0.5) * 16 * dpr, vy: (-Math.random() * 15 - 5) * dpr, r: (5 + Math.random() * 6) * dpr, c: pick(cols), a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3 }));
  let t = 0;
  (function f() {
    ctx.clearRect(0, 0, W, H);
    ps.forEach(p => { p.vy += 0.5 * dpr; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
    if (++t < 120) requestAnimationFrame(f); else c.remove();
  })();
}

/* ---------- XP, streak, levels ---------- */
const LEVELS = [[0, 'ひよこ', 'Chick'], [200, 'がくせい', 'Student'], [500, 'がんばりや', 'Grinder'], [1000, 'せんぱい', 'Senpai'], [1800, 'にんじゃ', 'Ninja'], [3000, 'さむらい', 'Samurai'], [4500, 'たつじん', 'Master'], [6500, 'しょうぐん', 'Shogun'], [9000, 'ごうかく', 'Pass-ready']];
function level(xp) {
  xp = xp == null ? S.xp : xp;
  let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const lo = LEVELS[i][0], hi = LEVELS[i + 1] ? LEVELS[i + 1][0] : lo;
  return { n: i + 1, jp: LEVELS[i][1], en: LEVELS[i][2], lo, hi, pct: hi > lo ? (xp - lo) / (hi - lo) : 1 };
}
function dayRec(d) { d = d || today(); return S.days[d] || (S.days[d] = { x: 0 }); }
function touchStreak() {
  const t = today();
  if (S.streak.last === t) return;
  S.streak.n = S.streak.last === addDays(t, -1) ? S.streak.n + 1 : 1;
  S.streak.last = t;
  S.streak.best = Math.max(S.streak.best || 0, S.streak.n);
}
function streakNow() { const t = today(); return (S.streak.last === t || S.streak.last === addDays(t, -1)) ? S.streak.n : 0; }
const dailyGoal = () => S.set.mins * 2;
let xpBuf = 0, xpTimer = 0;
function gainXP(n, quiet) {
  n = Math.round(n);
  if (n <= 0) return;
  const before = level().n;
  S.xp += n;
  const r = dayRec(); r.x = (r.x || 0) + n;
  touchStreak();
  save();
  if (!quiet) { xpBuf += n; clearTimeout(xpTimer); xpTimer = setTimeout(() => { toast('+' + xpBuf + ' XP', 'xp'); xpBuf = 0; }, 350); }
  const lv = level();
  if (lv.n > before) { setTimeout(() => { toast('Level ' + lv.n + ': ' + lv.jp + ' · ' + lv.en + (loveOn() ? ED.levelUp() : '')); celebrate(); SFX.win(); }, 500); }
  updateChips();
}

/* ---------- spaced repetition (Leitner boxes) ---------- */
const IV = [0, 1, 2, 4, 7, 14, 30];
function srsAdd(key) { if (!S.srs[key]) S.srs[key] = [1, dayNo(today()) + 1, 0, 0]; }
function srsGrade(key, ok) {
  const t = dayNo(today());
  const s = S.srs[key] || (S.srs[key] = [0, t, 0, 0]);
  if (ok) { s[0] = Math.min(6, s[0] + 1); s[1] = t + IV[s[0]]; s[2]++; }
  else { s[0] = 0; s[1] = t; s[3]++; }
}
function dueKeys() { const t = dayNo(today()); return Object.keys(S.srs).filter(k => S.srs[k][1] <= t && ITEM(k)); }
