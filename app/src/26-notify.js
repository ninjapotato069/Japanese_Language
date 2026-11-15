/* ===== 26 · phone notifications: good morning, good evening, good night (Android app only) =====
   The app sends the times and the message lists to Android, which schedules one alarm per note and picks a message
   when it fires (evening and night notes check whether today's session is done). Nothing here runs on the web. */
const Notify = {
  pending: false,
  ok: () => !!(window.AndroidApp && AndroidApp.setReminders),
  state() { try { return AndroidApp.notifyState() || 'on'; } catch (e) { return 'on'; } },   // on · ask · blocked
  pref(id) { const all = S.set.nt || {}, v = all[id] || {}, d = NOTIFY.slots.find(s => s.id === id); return { on: v.on !== false, t: /^\d\d:\d\d$/.test(v.t || '') ? v.t : d.t }; },
  setPref(id, patch) { S.set.nt = Object.assign({}, S.set.nt || {}); S.set.nt[id] = Object.assign(this.pref(id), patch); save(); this.sync(); },
  slots() { return NOTIFY.slots.map(s => { const p = this.pref(s.id); return { id: s.id, on: !!(S.setup && p.on), h: +p.t.slice(0, 2), m: +p.t.slice(3, 5) }; }); },
  sync() {
    if (!this.ok()) return;
    try { AndroidApp.setReminders(JSON.stringify({ v: 1, channel: NOTIFY.channel, glyph: NOTIFY.glyph, color: NOTIFY.color, names: NOTIFY.names(), msgs: NOTIFY.msgs, slots: this.slots() })); }
    catch (e) { logErr('notifications: ' + e.message); }
  },
  next() {   // the next note that will arrive, for the confirmation toast
    const now = new Date(), mins = now.getHours() * 60 + now.getMinutes();
    const on = NOTIFY.slots.map(s => Object.assign({}, s, this.pref(s.id))).filter(s => s.on);
    if (!on.length) return null;
    const at = s => +s.t.slice(0, 2) * 60 + +s.t.slice(3, 5);
    return on.slice().sort((a, b) => at(a) - at(b)).find(s => at(s) > mins) || on.slice().sort((a, b) => at(a) - at(b))[0];
  },
  ask() { this.pending = true; try { AndroidApp.askNotify(); } catch (e) { this.pending = false; } },
  test() {
    const hr = new Date().getHours(), id = hr >= 4 && hr < 12 ? 'morning' : hr >= 12 && hr < 21 ? 'evening' : 'night';
    if (this.state() !== 'on') { this.ask(); return; }
    try { AndroidApp.testNotify(id); toast('Sent! Check your notifications.'); } catch (e) { toast('Could not send a test'); }
  }
};
// Android reports the permission result here (and again whenever the app comes back to the front)
window.__notifyPerm = st => {
  if (Notify.pending) {
    Notify.pending = false;
    if (st === 'on') { const n = Notify.next(); toast(n ? NOTIFY.granted.replace('{slot}', n.label).replace('{t}', n.t) : NOTIFY.granted.replace(/ Next one.*$/, '')); }
    else toast(NOTIFY.later);
  }
  Notify.sync();
  if (cur().name === 'settings' && !SHEETS.length) render(true);
};
// once, after the plan is built: explain the notes, then let Android show its permission prompt
function notifyAsk() {
  if (!Notify.ok() || !S.setup || S.lv.nAsk || !NOTIFY.slots.some(s => Notify.pref(s.id).on)) return;
  whenCalm(() => {
    if (S.lv.nAsk || Notify.state() !== 'ask') return;
    S.lv.nAsk = today(); save(true);
    const a = NOTIFY.ask;
    sheet(close => [h('div', { class: 'eyebrow' }, a.eyebrow), h('h2', { class: 'gh', style: 'font-size:24px' }, a.title), h('p', { style: 'margin:0' }, a.body),
      h('div', { class: 'stack', style: 'gap:6px' }, NOTIFY.slots.map(s => h('div', { class: 'row small' }, h('span', { class: 'pill' }, s.icon + ' ' + Notify.pref(s.id).t), s.label))),
      h('p', { class: 'small mute', style: 'margin:0' }, a.hint),
      h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: () => { close(); Notify.ask(); } }, a.yes), h('button', { class: 'btn', type: 'button', onclick: () => { close(); toast(NOTIFY.later); } }, a.no))]);
  });
}
function notifyCard() {
  if (!Notify.ok()) return null;
  const st = Notify.state(), box = h('div', { class: 'card stack', id: 'notify-card' }, h('h2', {}, NOTIFY.title));
  if (st !== 'on') box.append(h('div', { class: 'note small' }, st === 'blocked' ? 'Notifications are switched off for this app in your phone settings.' : 'Allow notifications so these can reach you.', ' ',
    h('button', { class: 'btn small pink', type: 'button', onclick: () => Notify.ask() }, st === 'blocked' ? 'Open phone settings' : 'Allow notifications')));
  NOTIFY.slots.forEach(s => {
    const p = Notify.pref(s.id);
    box.append(h('div', { class: 'row nslot' },
      h('label', { class: 'toggle grow' }, h('input', { type: 'checkbox', 'data-slot': s.id, checked: p.on, onchange: e => Notify.setPref(s.id, { on: e.target.checked }) }), s.icon + ' ' + s.label),
      h('input', { type: 'time', class: 'sel ntime', 'data-slot': s.id, value: p.t, 'aria-label': s.label + ' time', onchange: e => { if (/^\d\d:\d\d$/.test(e.target.value)) Notify.setPref(s.id, { t: e.target.value }); } })));
  });
  box.append(h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', onclick: () => Notify.test() }, 'Send a test now')),
    h('p', { class: 'small mute', style: 'margin:0' }, 'Evening and night notes change depending on whether today’s session is done.'));
  return box;
}
