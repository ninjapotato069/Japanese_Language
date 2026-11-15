/* ===== 25 · greetings, pep talks and pop-ups (wording comes from the edition file) ===== */
const loveOn = () => S.set.love !== false;
function hashStr(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
const dayPick = (arr, salt) => arr[hashStr(today() + '|' + (salt || '')) % arr.length];
const coreTasks = ts => ts.tasks.filter(x => !x.extra);
const withName = (s, n) => n ? s + ', ' + n : s;
function greetLine() {
  const hr = new Date().getHours();
  if (hr >= 4 && hr < 11) return { jp: 'おはよう', en: 'Good morning (ohayou)', icon: '☀' };
  if (hr >= 11 && hr < 17) return { jp: 'こんにちは', en: 'Hello (konnichiwa)', icon: '✿' };
  if (hr >= 17 && hr < 22) return { jp: 'こんばんは', en: 'Good evening (konbanwa)', icon: '☾' };
  return { jp: 'おつかれさま', en: 'Studying late (otsukaresama: thanks for your hard work)', icon: '☾', late: true };
}
function lastActiveGap() {
  const t = today(), days = Object.keys(S.days).filter(d => d < t && S.days[d] && S.days[d].x > 0).sort();
  return days.length ? dayNo(t) - dayNo(days[days.length - 1]) : 0;
}
function todayNote(n) {
  const dl = daysLeft();
  if (dl < 0 && dl > -15) return tpl(PEP.after, n);
  if (PEP.countdown[dl]) return tpl(PEP.countdown[dl], n);
  if (greetLine().late) return tpl(PEP.late, n);
  if (lastActiveGap() >= 2) return tpl(dayPick(PEP.back, 'back'), n);
  const st = streakNow();
  if (st >= 3 && hashStr(today()) % 3 === 0) return withName(st + '-day streak', n) + '! れんぞく (renzoku) means “in a row”. Keep it going.';
  return tpl(dayPick(PEP.daily, 'daily'), n);
}
function greetCard() {
  const g = greetLine(), n = dayNick();
  return h('div', { class: 'greet' },
    h('div', { class: 'grow', style: 'min-width:0' }, h('div', { class: 'eyebrow' }, fmtDate(today(), { weekday: 'long', day: 'numeric', month: 'long' })),
      h('h1', { class: 'gh' }, withName(g.jp, n) + ' ' + g.icon), h('div', { class: 'small mute' }, g.en), h('p', { class: 'gnote' }, todayNote(n))),
    h('button', { class: 'seal big', type: 'button', title: 'Pep talk', 'aria-label': 'Pep talk', onclick: pepTalk }, '合'));
}
function wordOfDay() { return VOCAB.all[hashStr(today() + '|word') % VOCAB.all.length]; }
function loveToast(t, vars) { if (!loveOn()) return; let s = tpl(t); for (const k in (vars || {})) s = s.replace('{' + k + '}', vars[k]); toast(s, 'love'); }
function whenCalm(fn, tries) {
  tries = tries || 0;
  if (tries > 400) return;
  if (SHEETS.length || cur().name === 'exam' || document.querySelector('.quiz .opts, .arena .opts')) { setTimeout(() => whenCalm(fn, tries + 1), 1500); return; }
  fn();
}
function lovePop(build) { if (!loveOn()) return; whenCalm(() => sheet(build)); }
function pepTalk() {
  let last = '';
  sheet(close => {
    const msg = h('p', { class: 'pep' }), next = () => { let m; do { m = pick(PEP.notes); } while (m === last && PEP.notes.length > 1); last = m; msg.textContent = tpl(m); SFX.tick(); };
    next();
    return [h('div', { class: 'eyebrow' }, 'Pep talk' + ED.heart), msg,
      h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: next }, 'Another one' + ED.heart), h('button', { class: 'btn', type: 'button', onclick: close }, 'Back to studying'))];
  });
}
function helloSheet() {
  if (!S.setup || !loveOn() || S.lv.hello === today() || SHEETS.length) return;
  S.lv.hello = today(); save(true);
  const g = greetLine(), n = dayNick(), w = wordOfDay(), ts = todaySession(), st = streakNow();
  sheet(close => [h('div', { class: 'eyebrow' }, fmtDate(today(), { weekday: 'long', day: 'numeric', month: 'long' })),
    h('h2', { class: 'gh', style: 'font-size:26px' }, withName(g.jp, n) + ' ' + g.icon), h('div', { class: 'small mute', style: 'margin-top:-8px' }, g.en),
    h('div', { class: 'note pink' }, todayNote(n)),
    h('div', { class: 'card stack', style: 'gap:4px' }, h('div', { class: 'eyebrow' }, 'Word of the day'),
      h('div', { class: 'row' }, h('span', { class: 'mid-ja' }, w.kana), w.kanji ? h('span', { class: 'mute' }, w.kanji) : null, sayBtn(w.kana)), h('div', { class: 'small' }, w.en)),
    h('div', { class: 'row' }, st ? h('span', { class: 'pill gold' }, ico('flame'), ' ' + st + '-day streak') : null, h('span', { class: 'pill pink' }, plural(coreTasks(ts).length, 'task') + ' · ~' + sum(coreTasks(ts), taskMin) + ' min today')),
    h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: () => { close(); const x = coreTasks(ts).find(t => !taskDone(t)); if (x) openTask(x); } }, 'Let’s go', ico('next')), h('button', { class: 'btn', type: 'button', onclick: close }, 'Later')),
    h('div', { class: 'small mute' }, 'Tap the 合 stamp any time you need a pep talk.')]);
}
function streakPop() {
  const st = streakNow(), keys = Object.keys(PEP.streak).map(Number).filter(k => k <= st && k > (S.lv.st || 0));
  if (!keys.length || !loveOn()) return;
  const k = Math.max.apply(null, keys);
  S.lv.st = k; save(true);
  lovePop(close => { celebrate(); SFX.win(); return [h('div', { class: 'center' }, h('div', { class: 'stamp pop', style: 'font-size:' + (String(k).length > 2 ? 24 : 30) + 'px' }, k + '日')),
    h('h2', { class: 'gh center' }, plural(k, 'day') + ' in a row!'), h('p', { class: 'pep center' }, tpl(PEP.streak[k])), h('button', { class: 'btn pink block', type: 'button', onclick: close }, 'Keep going')]; });
}
function sessionPop() {
  if (!loveOn()) { toast("Today's session complete"); celebrate(); SFX.win(); return; }
  lovePop(close => {
    celebrate(); SFX.win();
    const ids = todaySession().tasks.filter(x => x.t === 'lesson').map(x => x.id), nl = nextLesson(ids), d = dayRec();
    return [h('div', { class: 'center' }, h('div', { class: 'stamp pop', style: 'font-size:19px' }, 'おつかれ')),
      h('h2', { class: 'gh center' }, tpl(pick(PEP.sessionTitle))), h('p', { class: 'pep center' }, tpl(pick(PEP.session))),
      h('div', { class: 'small mute center' }, streakNow() + '-day streak · ' + (d.x || 0) + ' XP today'),
      h('div', { class: 'row', style: 'justify-content:center' }, nl ? h('button', { class: 'btn', type: 'button', onclick: () => { close(); S.today.tasks.push({ t: 'lesson', id: nl.id, extra: 1 }); save(); go('lesson', { id: nl.id }); } }, 'Get ahead: ' + nl.title) : null,
        h('button', { class: 'btn pink', type: 'button', onclick: close }, 'Done for today' + ED.heart))];
  });
}
function paperPassPop(P) {
  if (!loveOn() || S.lv.pp[P]) return;
  S.lv.pp[P] = 1; save();
  const n = ED.anyNick();
  lovePop(close => { celebrate(); SFX.win(); return [h('div', { class: 'center' }, h('div', { class: 'stamp pop' }, '合格')), h('h2', { class: 'gh center' }, withName('合格', n) + '!'),
    h('p', { class: 'pep center' }, tpl(PEP.paperPass, n)), h('div', { class: 'small mute center' }, 'Mock paper ' + P + ', all three sections.'), h('button', { class: 'btn pink block', type: 'button', onclick: close }, 'Yay!')]; });
}
