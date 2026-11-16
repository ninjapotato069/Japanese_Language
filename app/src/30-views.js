/* ===== 30 · views: today, route, learn modules, lessons, vault, review, settings ===== */
const KANA_TOTAL = KANA_ALL.h.length + KANA_ALL.k.length;
function counts() {
  let kana = 0, kj = 0, vo = 0, gr = 0, secs = 0;
  LESSONS.forEach(l => { if (!lessonDone(l.id)) return; const n = l.items.length; if (l.kind === 'kana') kana += n; else if (l.kind === 'kanji') kj += n; else if (l.kind === 'vocab') vo += n; else if (l.kind === 'grammar') gr += n; });
  Object.keys(S.mocks).forEach(p => { secs += Object.keys(S.mocks[p]).length; });
  return { kana, kj, vo, gr, secs, due: dueKeys().length };
}
function planStats() {
  const all = planOrder(), done = all.filter(l => lessonDone(l.id)).length;
  const fp = genPlan(today(), remainingLessons(), daysLeft(), S.set.mins);
  return { done, total: all.length, pct: all.length ? done / all.length : 1, fp };
}
const ring = (pct, label) => h('div', { class: 'ring', style: '--p:' + Math.round(pct * 100) }, h('span', {}, label));
function openTask(x) {
  switch (x.t) {
    case 'review': return go('review');
    case 'lesson': return go('lesson', { id: x.id });
    case 'listen': return go('listenset', { type: 'mix', task: 1 });
    case 'read': return go('readset', { type: pick(READ_TYPES()), task: 1 });
    case 'talk': return go('talkdaily', { task: 1 });
    case 'mock': return go('exam', x.full ? { p: x.p, s: 1, mode: 'exam', full: 1 } : { p: x.p, s: x.s, mode: 'exam' });
    case 'vault': return x.id === 'all' ? go('vault', { task: 1 }) : go('vaultset', { id: x.id, task: 1 });
    case 'script': return go('route', { anchor: 'script' });
  }
}
function missionCard(ts) {
  const tasks = ts.tasks, core = tasks.filter(x => !x.extra), mins = sum(core, taskMin), doneN = core.filter(taskDone).length;
  const card = h('div', { class: 'card lift stack mission', style: 'gap:6px' },
    h('div', { class: 'row' }, h('div', { class: 'eyebrow grow' }, "Today's session"), h('span', { class: 'pill' }, '~' + mins + ' min'), h('span', { class: 'pill ' + (doneN === core.length ? 'good' : 'pink') }, doneN + '/' + core.length)));
  let num = 0;
  tasks.forEach(x => {
    const d = taskDone(x), lb = taskLabel(x);
    if (!x.extra) num++;
    let sub = lb[1] + ' · ' + taskMin(x) + ' min', label = d ? 'Again' : 'Start', part = false;
    if (!d && x.t === 'lesson') { const r = S.les[x.id] || {}; if (r.m || r.u) { part = true; label = 'Continue'; sub = (r.u ? 'Next step: the test' : 'Next step: understand') + ' · ' + sub; } }
    card.append(h('div', { class: 'task' }, h('span', { class: 'bub' + (d ? ' on' : part ? ' part' : '') }, d ? '✓' : x.extra ? '+' : String(num)),
      h('div', { class: 't' }, h('b', {}, (x.extra ? 'Bonus: ' : '') + lb[0]), h('small', {}, sub)),
      h('button', { class: 'btn small ' + (d ? 'ghost' : 'primary'), type: 'button', onclick: () => openTask(x) }, label)));
  });
  const nx = core.find(x => !taskDone(x)) || tasks.find(x => !taskDone(x));
  if (nx) card.append(h('button', { class: 'btn pink block mt8', type: 'button', onclick: () => openTask(nx) }, 'Start: ' + taskLabel(nx)[0], ico('next')));
  else {
    const ids = tasks.filter(x => x.t === 'lesson').map(x => x.id), nl = nextLesson(ids);
    card.append(h('div', { class: 'note mt8' }, 'Session done. Fifteen minutes a day beats five hours on Sunday.'),
      nl ? h('button', { class: 'btn block', type: 'button', onclick: () => { S.today.tasks.push({ t: 'lesson', id: nl.id, extra: 1 }); save(); go('lesson', { id: nl.id }); } }, 'Get ahead: ' + nl.title) : null);
  }
  return card;
}
function nextTaskButtons() {
  const ts = todaySession(), nx = ts.tasks.filter(x => !x.extra).find(x => !taskDone(x)) || ts.tasks.find(x => !taskDone(x));
  return [nx ? h('button', { class: 'btn pink', type: 'button', onclick: () => { NAV.stack = [{ name: 'home', p: {} }]; openTask(nx); } }, 'Next: ' + taskLabel(nx)[0], ico('next')) : null,
    h('button', { class: nx ? 'btn' : 'btn pink', type: 'button', onclick: () => tab('home') }, 'Back to Today')];
}
function predict() {
  const rec = s => S.hist.filter(x => x.s === s).slice(-3);
  const avg = a => a.length ? sum(a, x => x.sc / x.mx) / a.length : null;
  const tsAvg = types => { let r = 0, n = 0; types.forEach(t => { const v = S.ts[t]; if (v) { r += v[0]; n += v[1]; } }); return n >= 6 ? r / n : null; };
  let a1 = avg(rec(1)), a2 = avg(rec(2)), a3 = avg(rec(3));
  const src = { 1: a1 != null ? 'mock' : 'drill', 2: a2 != null ? 'mock' : 'drill', 3: a3 != null ? 'mock' : 'drill' };
  if (a1 == null) a1 = tsAvg(['kanji', 'hyoki', 'bunmyaku', 'iikae']);
  if (a2 == null) a2 = tsAvg(['bunpo', 'kumitate', 'bunsho', 'tanbun', 'chubun', 'joho']);
  if (a3 == null) a3 = tsAvg(['kadai', 'point', 'hatsuwa', 'sokuji']);
  const known = [a1, a2, a3].filter(x => x != null);
  if (!known.length) return null;
  const fb = sum(known) / known.length, partial = known.length < 3;
  const s12 = Math.round((a1 != null ? a1 : fb) * 42 + (a2 != null ? a2 : fb) * 78), s3 = Math.round((a3 != null ? a3 : fb) * 60), tot = s12 + s3;
  const pass = s12 >= 38 && s3 >= 19 && tot >= PASSMARK, safe = s12 >= 60 && s3 >= 30 && tot >= 100;
  return { s12, s3, tot, pass, safe, partial, src };
}
function mbar(label, v, max, min, safe) {
  return h('div', { class: 'mbar' }, h('span', {}, label),
    h('div', { class: 'track', title: 'Pass line ' + min + '/' + max }, h('i', { style: 'width:' + clamp(v / max * 100, 0, 100) + '%;opacity:' + (v >= min ? 0.55 : 0.25) + ';background:' + (v >= min ? 'var(--good)' : 'var(--bad)') }), h('b', { style: 'left:' + (min / max * 100) + '%' }), safe ? h('b', { style: 'left:' + (safe / max * 100) + '%;background:var(--good);width:2px;opacity:.6' }) : null),
    h('span', { class: 'num' }, v + '/' + max));
}
function predictorCard() {
  const P = predict();
  const card = h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Pass predictor'));
  if (!P) {
    card.append(h('p', { class: 'mute', style: 'margin:0' }, 'Do any mock section or a few drills and this turns into your live pass forecast: section by section, against the real pass lines.'),
      h('button', { class: 'btn small', type: 'button', onclick: () => tab('mocks') }, 'Open the ' + PAPERS.length + ' mocks'));
    return card;
  }
  card.append(h('div', { class: 'verdict ' + (P.safe ? 'good' : P.pass ? 'warn' : 'bad') }, P.safe ? 'On track to pass' : P.pass ? 'Borderline pass' : 'At risk right now'),
    h('div', { class: 'math' }, mbar('Vocab + grammar', P.s12, 120, 38, 72), mbar('Listening', P.s3, 60, 19, 36), mbar('Total', P.tot, 180, PASSMARK, 108)),
    h('div', { class: 'small mute' }, 'Red line = pass minimum. ' + (P.partial ? 'Partial estimate: take all three sections for a full forecast.' : 'Based on your last mock attempts.')));
  return card;
}
function weakCard() {
  const rows = Object.keys(S.ts).filter(t => TYPES[t] && S.ts[t][1] >= 4).map(t => ({ t, acc: S.ts[t][0] / S.ts[t][1], n: S.ts[t][1] })).sort((a, b) => a.acc - b.acc).slice(0, 3);
  const items = Object.keys(S.srs).filter(k => S.srs[k][3] >= 2 && ITEM(k)).sort((a, b) => S.srs[b][3] - S.srs[a][3]).slice(0, 8);
  const card = h('div', { class: 'card stack' }, h('div', { class: 'eyebrow' }, 'Weak spots'));
  if (!rows.length && !items.length) { card.append(h('p', { class: 'mute', style: 'margin:0' }, 'Nothing flagged yet. Mistakes from lessons, drills and mocks collect here so you can fix them first.')); return card; }
  rows.forEach(r => card.append(h('div', { class: 'row' }, h('div', { class: 'grow' }, h('b', {}, TYPES[r.t][1]), h('div', { class: 'small mute' }, Math.round(r.acc * 100) + '% right over ' + r.n + ' questions')),
    h('button', { class: 'btn small', type: 'button', onclick: () => openDrill(r.t) }, 'Drill'))));
  if (items.length) card.append(h('button', { class: 'btn small', type: 'button', onclick: () => go('review', { keys: items.join(',') }) }, 'Fix your ' + items.length + ' most-missed cards'));
  return card;
}
function sparkCard() {
  const days = [], t = today();
  for (let i = 13; i >= 0; i--) days.push(addDays(t, -i));
  const vals = days.map(d => (S.days[d] && S.days[d].x) || 0), mx = Math.max(dailyGoal(), Math.max.apply(null, vals));
  return h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'eyebrow grow' }, 'XP, last 14 days'), h('span', { class: 'small mute' }, 'Goal ' + dailyGoal() + ' a day')),
    h('div', { class: 'sparkbars', role: 'img', 'aria-label': 'XP per day for the last two weeks' }, vals.map((v, i) => h('i', { class: i === 13 ? 'today' : v >= dailyGoal() ? 'on' : '', style: 'height:' + Math.max(3, Math.round(v / mx * 100)) + '%', title: fmtDate(days[i]) + ': ' + v + ' XP' }))),
    h('div', { class: 'sparklbl' }, h('span', {}, fmtDate(days[0], { day: 'numeric', month: 'short' })), h('span', {}, 'today')));
}
view('home', 'home', () => {
  const root = h('div', { class: 'stack' });
  const ex = examInfo(), dl = daysLeft(), ts = todaySession(), st = planStats(), fp = st.fp, c = counts();
  const goal = dailyGoal(), xpT = (S.days[today()] && S.days[today()].x) || 0, lv = level();
  const hero = h('div', { class: 'card lift stack' },
    h('div', { class: 'row' }, h('div', { class: 'eyebrow grow' }, 'Countdown'), h('span', { class: 'pill gold' }, 'Lv' + lv.n + ' ' + lv.jp)),
    h('div', { class: 'count' }, h('div', { class: 'big' }, dl > 0 ? String(dl) : dl === 0 ? '今日' : '—'),
      h('div', { class: 'lbl' }, h('b', { style: 'font-size:16px;color:var(--ink)' }, dl > 0 ? (dl === 1 ? 'day' : 'days') + ' to ' + ex.name : dl === 0 ? 'Exam day: you trained for this' : 'Your exam date has passed'), h('br'), fmtLong(ex.date))),
    h('div', { class: 'row' }, ring(st.pct, Math.round(st.pct * 100) + '%'),
      h('div', { class: 'grow' }, h('b', {}, st.done + ' of ' + st.total + ' lessons done'),
        h('div', { class: 'small mute' }, fp.learnDays ? 'New lessons for ' + plural(fp.learnDays, 'day') + ', then ' + plural(fp.mockDays, 'day') + ' of mocks.' : dl > 0 ? 'All lessons done: mocks and review until the exam.' : ''),
        h('div', { class: 'small', style: 'margin-top:6px' }, 'Today ' + xpT + '/' + goal + ' XP'), bar(xpT / goal, 'gold'))),
    fp.compressed ? h('div', { class: 'note pink small' }, 'To cover everything by ' + fmtDate(ex.date) + ' you need about ' + fp.need + ' min a day (you set ' + S.set.mins + '). The plan is packed to fit; raise your daily time or pick a later exam if it feels heavy. ',
      h('button', { class: 'btn small', type: 'button', onclick: () => go('settings') }, 'Adjust')) : null,
    dl < 0 ? h('button', { class: 'btn pink', type: 'button', onclick: () => go('settings') }, 'Choose your next exam date') : null);
  root.append(greetCard(), h('div', { class: 'hero' }, hero, missionCard(ts)));
  const tile = (label, v, max, to, sub) => h('button', { class: 'tile', type: 'button', onclick: to }, h('span', { class: 'eyebrow' }, label), h('span', { class: 'v' }, String(v), max ? h('small', {}, ' / ' + max) : null), max ? bar(v / max) : h('span', { class: 'small mute' }, sub || ''));
  root.append(h('div', { class: 'tiles' },
    LV === 'n5' ? tile('Kana', S.set.kana === 'both' ? KANA_TOTAL : c.kana, KANA_TOTAL, () => go('kana')) : tile('Speaking', talkScore().done, talkScore().total, () => tab('talk')),
    tile('Kanji', c.kj, KANJI.length, () => go('kanji')),
    tile('Words', c.vo, VOCAB.all.length, () => go('vocab')),
    tile('Grammar', c.gr, GPTS.length, () => go('grammar')),
    tile('Mock sections', c.secs, PAPERS.length * 3, () => tab('mocks')),
    tile('Due now', c.due, 0, () => go('review'), c.due ? 'Clear them first' : 'All caught up')));
  root.append(h('div', { class: 'grid two' }, predictorCard(), weakCard()));
  root.append(h('div', { class: 'quick' },
    h('button', { type: 'button', onclick: () => go('review') }, h('b', {}, '復 Review'), h('span', {}, c.due ? plural(c.due, 'card') + ' due' : 'Nothing due')),
    LV === 'n5' ? h('button', { type: 'button', onclick: () => go('game', { id: 'kana' }) }, h('b', {}, '仮 Kana Rush'), h('span', {}, '60-second warm-up')) : null,
    h('button', { type: 'button', onclick: () => go('talkdaily') }, h('b', {}, '話 Talk workout'), h('span', {}, 'Ten minutes of speaking')),
    h('button', { type: 'button', onclick: () => go('listenset', { type: 'mix' }) }, h('b', {}, '聞 Listening'), h('span', {}, '4 audio questions')),
    h('button', { type: 'button', onclick: () => { const q = mockQueue().next(); go('exam', { p: q.p, s: q.s, mode: 'practice' }); } }, h('b', {}, '試 Random section'), h('span', {}, 'Practice mode, instant marking')),
    h('button', { type: 'button', onclick: () => go('vault') }, h('b', {}, '暗 Cheat sheets'), h('span', {}, VAULT_ALL.length + ' by-heart tables'))));
  root.append(sparkCard());
  cloudReady.then(() => { if (!root.isConnected) return; if (!S.setup) setupSheet(); else { if (!whatsNewOnce()) helloSheet(); streakPop(); notifyAsk(); } });
  return root;
});

/* ---------- route: pass maths, plan, cheat codes, exam day ---------- */
const DATES = [
  ['JLPT ' + LVNAME + ' · Sun 6 Dec 2026', 'Registration in India ran from about mid-August to early October 2026 and has closed.'],
  ['NAT-TEST ' + LVINFO[LV].nat + ' · Sun 13 Dec 2026', 'Same level and question types as JLPT ' + LVNAME + '. India registration (through Team Languages) closed on 13 Nov 2026. The test runs several times a year.'],
  ['JLPT ' + LVNAME + ' · Sun 4 Jul 2027', 'The next JLPT session. Registration usually opens in the spring; watch jlpt.jp and your local centre.'],
  ['JLPT ' + LVNAME + ' · Sun 5 Dec 2027', 'The JLPT is held on the first Sunday of July and of December. Registration for December usually opens in August.']
];
const SOURCES = [
  ['JLPT official site', 'https://www.jlpt.jp/e/', 'Levels, dates and the scoring and pass rules'],
  ['NAT-TEST official site', 'https://www.nat-test.com/', 'Dates and the ' + LVINFO[LV].nat + ' (' + LVNAME + '-level) format'],
  ['Team Languages', 'https://teamlanguages.com/', 'NAT-TEST registration and venues in India'],
  ['Wikipedia: Japanese-Language Proficiency Test', 'https://en.wikipedia.org/wiki/Japanese-Language_Proficiency_Test', 'Background on levels and scoring'],
  ['Tofugu: Learn Hiragana', 'https://www.tofugu.com/japanese/learn-hiragana/', 'The picture-hook method behind the kana memory hooks'],
  ["Tae Kim's Guide to Japanese", 'https://guidetojapanese.org/learn/', 'Plain explanations of the grammar patterns'],
  ['JLPT Sensei: ' + LVNAME + ' grammar list', 'https://jlptsensei.com/jlpt-' + LV + '-grammar-list/', 'Cross-check for the grammar patterns'],
  ['Tanos: JLPT ' + LVNAME + ' lists', 'http://www.tanos.co.uk/jlpt/jlpt' + LVN + '/', 'The classic ' + LVNAME + ' vocabulary and kanji lists'],
  ['JMdict and KANJIDIC (EDRDG)', 'https://www.edrdg.org/', 'Dictionary data behind the N4 to N1 word and kanji packs (CC BY-SA 4.0)'],
  ['Tatoeba / Tanaka Corpus', 'https://tatoeba.org/', 'Example sentences for N4 to N1 words (CC BY)'],
  ['NHK News Web Easy', 'https://www3.nhk.or.jp/news/easy/', 'Simple-Japanese news for extra reading once you finish']
];
function extLink(url, label) {
  return h('a', { href: url, target: '_blank', rel: 'noopener' }, label);
}
/* ---------- versions ---------- */
const UPDATE_URL = 'https://raw.githubusercontent.com/ninjapotato069/Japanese_Language/main/docs/version.json';
const RELEASES_URL = 'https://github.com/ninjapotato069/Japanese_Language/tree/main/releases';
const newer = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
function whatsNew(close) {
  return [h('h2', {}, 'What’s new in ' + APP_VERSION), h('div', { class: 'stack', style: 'gap:10px' }, CHANGES.slice(0, 3).map((c, i) => h('div', { class: 'stack', style: 'gap:2px' },
    h('b', {}, 'Version ' + c[0] + (i ? '' : ' · now')), h('ul', { style: 'margin:0;padding-left:20px' }, c[1].map(t => h('li', { class: 'small' }, t)))))),
    h('button', { class: 'btn pink block', type: 'button', onclick: close }, 'Got it')];
}
function whatsNewOnce() {
  if (S.lv.ver === APP_VERSION) return false;
  const fresh = !S.lv.ver && !S.xp;
  S.lv.ver = APP_VERSION; save(true);
  if (fresh || SHEETS.length) return false;
  whenCalm(() => sheet(whatsNew));
  return true;
}
function updateRow() {
  const box = h('div', { class: 'stack', style: 'gap:8px' }, h('div', { class: 'row', style: 'justify-content:space-between' },
    h('span', {}, h('b', {}, 'Version ' + APP_VERSION), ' · ', h('span', { class: 'mute' }, window.AndroidApp ? 'Android app' : 'web')),
    h('button', { class: 'btn small', type: 'button', onclick: () => sheet(whatsNew) }, 'What’s new')));
  if (!window.AndroidApp) { box.append(h('p', { class: 'small mute', style: 'margin:0' }, 'The web version updates itself whenever a new version is published.')); return box; }
  const out = h('div', { class: 'small' });
  const check = h('button', { class: 'btn small', type: 'button', onclick: async () => {
    out.textContent = 'Checking…';
    try {
      const r = await fetch(UPDATE_URL, { cache: 'no-store' }), v = await r.json();
      if (v && v.version && newer(v.version, APP_VERSION)) {
        out.innerHTML = '';
        out.append(h('b', {}, 'Version ' + v.version + ' is out. '), v.notes ? v.notes + ' ' : '', h('a', { href: 'https://github.com/ninjapotato069/Japanese_Language/raw/main/' + v.apk }, 'Download the new app'),
          h('div', { class: 'mute' }, 'Install it over this one. Your progress stays.'));
      } else out.textContent = 'You have the latest version.';
    } catch (e) { out.innerHTML = ''; out.append('Could not check right now. ', h('a', { href: RELEASES_URL }, 'Open the releases page')); }
  } }, 'Check for updates');
  box.append(h('div', { class: 'row' }, check), out);
  return box;
}
function sourcesList() { return h('div', { class: 'list' }, SOURCES.map(s => h('div', { class: 'li' }, h('span', { class: 'body' }, h('b', {}, extLink(s[1], s[0])), h('span', {}, s[2]))))); }
function sessionRow(se, isToday) {
  const done = isToday && se.tasks.filter(x => !x.extra).every(taskDone);
  const tags = se.tasks.map(x => { const tg = x.t === 'lesson' ? (LMAP[x.id] ? KINDNAME[LMAP[x.id].kind] : 'Lesson') : x.t === 'mock' ? (x.full ? 'Full mock' : 'Mock S' + x.s) : { review: 'Review', listen: 'Listening', read: 'Reading', vault: 'Cheat sheet', script: 'Exam script', talk: 'Talk' }[x.t]; return h('span', { class: 'pill ' + (x.t === 'mock' ? 'pink' : x.t === 'lesson' ? 'gold' : '') }, tg); });
  return h('button', { class: 'sess' + (isToday ? ' today' : '') + (done ? ' done' : ''), type: 'button', onclick: () => sessionSheet(se, isToday) },
    h('span', { class: 'd' }, h('b', {}, String(parseYmd(se.date).getDate())), h('span', {}, fmtDate(se.date, { weekday: 'short' }))),
    h('span', { class: 'tags' }, tags), h('span', { class: 'small mute num' }, isToday ? 'today' : sum(se.tasks, taskMin) + 'm'));
}
function sessionSheet(se, isToday) {
  sheet(close => [h('h2', { class: 'verdict' }, (isToday ? 'Today · ' : '') + fmtLong(se.date)),
    h('div', { class: 'list' }, se.tasks.map(x => { const lb = taskLabel(x); return h('div', { class: 'li' }, h('span', { class: 'body' }, h('b', {}, lb[0]), h('span', {}, lb[1] + ' · ' + taskMin(x) + ' min')),
      (isToday || x.t === 'lesson') ? h('button', { class: 'btn small', type: 'button', onclick: () => { close(); openTask(x); } }, isToday ? 'Start' : 'Do it now') : null); })),
    h('button', { class: 'btn', type: 'button', onclick: close }, 'Close')]);
}
view('route', 'route', p => {
  const root = h('div', { class: 'stack' }), ex = examInfo(), dl = daysLeft(), ts = todaySession(), fp = futurePlan(), whole = genPlan(today(), remainingLessons(), dl, S.set.mins);
  root.append(head('Your route to 合格', 'The shortest path that still passes: learn only what the test asks, review it on a schedule, then train on real-format mocks.', 'Route'));
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Pass maths'),
    h('p', { class: 'mute', style: 'margin:0' }, 'JLPT ' + LVNAME + ' pass rules (NAT-TEST ' + LVINFO[LV].nat + ' uses a similar 180-point scale). You need every line, not just the total.'),
    h('div', { class: 'math' }, mbar('Vocab + grammar', 38, 120, 38, 72), mbar('Listening', 19, 60, 19, 36), mbar('Total', PASSMARK, 180, PASSMARK, 108)),
    h('div', { class: 'note small' }, PASS_TEXT + ' A safe target is 60% in every section (green tick on each bar).')));
  const phases = h('div', { class: 'phasebar', role: 'img', 'aria-label': 'Plan phases' });
  const totalD = Math.max(1, whole.sessions.length);
  [['p2', 'Learn', whole.learnDays], ['p3', 'Mocks', whole.mockDays], ['p4', 'Final', whole.tail]].forEach(x => { if (x[2] > 0) phases.append(h('span', { class: x[0], style: 'flex:' + x[2] }, x[1] + ' ' + x[2] + 'd')); });
  const plan = h('div', { class: 'card stack' }, h('h2', {}, 'Your plan'),
    h('div', { class: 'kv small' }, h('span', { class: 'mute' }, 'Exam'), h('b', {}, ex.name + ' · ' + fmtLong(ex.date)), h('span', { class: 'mute' }, 'Days left'), h('b', {}, String(Math.max(0, dl))),
      h('span', { class: 'mute' }, 'Lessons left'), h('b', {}, whole.lessons + ' (about ' + Math.round(whole.total / 60) + ' h)'), h('span', { class: 'mute' }, 'Daily time'), h('b', {}, (whole.need || S.set.mins) + ' min needed · you set ' + S.set.mins)),
    totalD > 1 ? phases : null,
    whole.compressed ? h('div', { class: 'note pink small' }, 'Packed plan: more than your daily time. Raise minutes per day or pick a later exam in settings for a lighter load.') : null,
    h('button', { class: 'btn small', type: 'button', onclick: () => go('settings') }, 'Change level, exam or daily time'));
  const list = h('div', { class: 'week' });
  const all = [{ date: ts.date, tasks: ts.tasks }].concat(fp.sessions);
  let lastWeek = '', shown = 0;
  const limit = p.all ? all.length : 21;
  all.forEach((se, i) => {
    if (shown >= limit) return;
    const d = parseYmd(se.date), mon = addDays(se.date, -((d.getDay() + 6) % 7));
    if (mon !== lastWeek) { lastWeek = mon; list.append(h('h3', {}, 'Week of ' + fmtDate(mon, { day: 'numeric', month: 'short' }))); }
    list.append(sessionRow(se, i === 0)); shown++;
  });
  plan.append(list);
  if (all.length > limit) plan.append(h('button', { class: 'btn small', type: 'button', onclick: () => swap('route', { all: 1 }) }, 'Show all ' + all.length + ' sessions'));
  if (dl <= 0) plan.append(h('div', { class: 'empty' }, 'No sessions: the exam date has passed. Pick a new date in settings.'));
  root.append(plan);
  root.append(h('div', { class: 'card stack' }, h('h2', {}, '10 cheat codes'), h('div', { class: 'codes' }, levelCodes().map((c, i) => h('div', { class: 'code' }, h('span', { class: 'cn' }, 'CODE ' + String(i + 1).padStart(2, '0')), h('b', {}, c[0]), h('p', {}, c[1]))))));
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Section tactics'), levelSections().map(s => h('div', { class: 'stack', style: 'gap:6px' }, h('h3', {}, s[0]), h('ul', { style: 'margin:0;padding-left:20px' }, s[1].map(t => h('li', {}, t)))))));
  const scr = h('div', { class: 'card stack', id: 'script' }, h('h2', {}, 'Exam-day script'),
    examScript().map(s => h('div', { class: 'stack', style: 'gap:4px' }, h('h3', {}, s[0]), h('ul', { style: 'margin:0;padding-left:20px' }, s[1].map(t => h('li', {}, t))))),
    loveOn() ? h('div', { class: 'note pink' }, ED.routeNote()) : null,
    h('button', { class: 'btn small', type: 'button', onclick: () => { dayRec().scr = 1; save(); checkSession(); toast('Script marked as read'); } }, ico('check'), 'Mark as read'));
  root.append(scr);
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Dates and registration'), DATES.map(d => h('div', {}, h('b', {}, d[0]), h('div', { class: 'small mute' }, d[1]))),
    h('div', { class: 'small mute' }, 'Dates checked in November 2026. Confirm on the official sites before you pay.')));
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Sources'), h('p', { class: 'small mute', style: 'margin:0' }, 'Lessons, hooks and lists were written for this app and cross-checked against these.'), sourcesList()));
  if (p.anchor) later(120, () => { const el = document.getElementById(p.anchor); if (el) { el.scrollIntoView({ block: 'start' }); if (p.anchor === 'script') { dayRec().scr = 1; save(); checkSession(); } } }, root);
  return root;
});

/* ---------- learn hub ---------- */
function modProgress(kind, filter) { const ls = LESSONS.filter(l => l.kind === kind && (!filter || filter(l))); return [ls.filter(l => lessonDone(l.id)).length, ls.length]; }
view('learn', 'learn', () => {
  const root = h('div', { class: 'stack' }), c = counts();
  root.append(head('Learn', 'Every lesson runs in three steps: 覚える memorise by heart, わかる understand, テスト test. Pass the test at 80% and the cards join your review deck.', 'Learn'));
  const nl = nextLesson();
  if (nl) root.append(h('button', { class: 'li', type: 'button', style: 'border-color:var(--sheet);border-width:2px', onclick: () => go('lesson', { id: nl.id }) }, markEl(nl.mark), h('span', { class: 'body' }, h('b', {}, 'Next in your plan: ' + nl.title), h('span', {}, KINDNAME[nl.kind] + ' · ' + nl.sub)), h('span', { class: 'end' }, ico('next'))));
  const coreIds = ids => { const ls = ids.map(i => LMAP[i]).filter(Boolean); return ls.length ? [ls.filter(l => lessonDone(l.id)).length, ls.length] : null; };
  const n5 = LV === 'n5', basics = n5 ? '' : ' (N5 basics, for reference)';
  const mods = [
    n5 ? ['仮', 'Kana', 'Hiragana and katakana with picture hooks', 'kana', modProgress('kana')] : null,
    ['漢', 'Kanji', KANJI.length.toLocaleString('en') + ' ' + LVNAME + ' kanji inside real words', 'kanji', modProgress('kanji')],
    ['語', 'Vocabulary', VOCAB.decks.length + (n5 ? ' themed decks · ' : ' decks · ') + VOCAB.all.length.toLocaleString('en') + ' words', 'vocab', modProgress('vocab')],
    ['文', 'Grammar', GRAMMAR.length + ' units · ' + GPTS.length + ' patterns', 'grammar', modProgress('grammar')],
    ['話', 'Conversation', 'Core words, islands, drills and role-play missions', 'talk', null],
    ['聞', 'Listening lab', 'Exam-format audio questions from the ' + PAPERS.length + ' papers', 'listen', null],
    ['読', 'Reading lab', 'Timed passages from the ' + PAPERS.length + ' papers', 'read', null],
    ['動', 'Verb and adjective lab', 'Every form of every ' + LVNAME + ' verb', 'verbs', coreIds(['c-verbs1', 'c-verbs2', 'c-adj'])],
    ['数', 'Numbers, time and dates', 'Prices, clock times, dates, counters' + basics, 'numbers', coreIds(['c-num', 'c-time', 'c-dates', 'c-count'])],
    ['助', 'Particles', n5 ? 'は が を に で: half the grammar marks' : 'The 16 basic particles' + basics, 'particles', coreIds(['c-part'])],
    ['暗', 'By-heart vault', VAULT_ALL.length + ' cheat sheets to recite' + basics, 'vault', null],
    ['復', 'Review deck', c.due ? plural(c.due, 'card') + ' due now' : 'Nothing due', 'review', null]
  ].filter(Boolean);
  root.append(h('div', { class: 'grid' }, mods.map(m => h('button', { class: 'li', type: 'button', style: 'align-items:flex-start', onclick: () => (m[3] === 'talk' ? tab('talk') : go(m[3])) }, markEl(m[0]),
    h('span', { class: 'body' }, h('b', {}, m[1]), h('span', {}, m[2]), m[4] ? h('span', { style: 'margin-top:6px' }, bar(m[4][0] / Math.max(1, m[4][1]))) : null),
    m[4] ? h('span', { class: 'end small mute num' }, m[4][0] + '/' + m[4][1]) : null))));
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'All lessons in plan order'), h('div', { class: 'list' }, planOrder().map(lessonRow))));
  return root;
});

/* ---------- lesson: memorise → understand → test ---------- */
const DECK_NOTES = {
  verbs: 'The badge shows each verb’s group, which decides how it changes: group 1 (う-verbs), group 2 (る-verbs: drop る), group 3 (する, くる). The Verb lab shows every form.',
  iadj: 'い-adjectives end in い and change themselves: たかい → たかくない → たかかった. いい is the odd one: よくない, よかった.',
  naadj: 'な-adjectives take な before a noun (しずかな へや) and です / じゃ ありません at the end. きれい, きらい and ゆうめい look like い-adjectives but are な-adjectives.',
  katakana: 'Loanwords: sound out the katakana, then say it with an English accent. ー makes a long vowel: コーヒー = coffee.',
  question: 'Question words are tested head-on in listening. Know なに/なん, だれ, どこ, いつ, いくら, いくつ and どうして cold.',
  time: 'Learn these in sets: きのう / きょう / あした, せんしゅう / こんしゅう / らいしゅう. The vault has the full tables.',
  phrases: 'Set phrases are the whole of listening part 3 (what do you say?) and much of part 4 (quick reply). Say each one out loud.',
  adverbs: 'Some adverbs only go with negatives: あまり たべません (I don’t eat much), ぜんぜん わかりません (I don’t understand at all).',
  people: 'Family words have two sets: plain for your own family (はは), polite for someone else’s (おかあさん). See the Family cheat sheet.',
  places: 'Many place words end in や (shop): ほんや, はなや, パンや. Watch for えき, びょういん and ぎんこう in listening.',
  food: 'The listening test loves ordering food and drink: learn the counters つ and 杯 alongside these.'
};
function kcell(it) {
  const s = S.srs[it.s + ':' + it.k];
  return h('button', { class: 'kcell' + (s && s[0] >= 3 ? ' ok' : ''), type: 'button', title: it.h || it.r, onclick: () => TTS.say(it.k) }, h('b', {}, it.k), h('span', {}, it.r));
}
function kanaGrid(s, grp, onlyKeys) {
  const its = KANA_ALL[s].filter(x => x.grp === grp && (!onlyKeys || onlyKeys.indexOf(s + ':' + x.k) >= 0));
  if (grp === 'yo') return h('div', { class: 'kgrid', style: 'grid-template-columns:repeat(3,minmax(0,1fr));max-width:340px' }, its.map(kcell));
  if (grp === 'dak') return h('div', { class: 'kgrid' }, its.map(kcell));
  const grid = h('div', { class: 'kgrid' }), have = new Set(its.map(x => x.k));
  const blank = () => h('span', { class: 'kcell blank', 'aria-hidden': 'true' });
  KANA.ROWS.forEach(row => {
    const chars = Array.from(s === 'h' ? row : KANA.toKata(row)), inRow = chars.filter(c => have.has(c));
    if (!inRow.length) return;
    const cell = c => have.has(c) ? kcell(ITEMS[s + ':' + c]) : blank();
    if (chars.length === 5) chars.forEach(c => grid.append(cell(c)));
    else if (chars.length === 3 && row === 'やゆよ') { grid.append(cell(chars[0]), blank(), cell(chars[1]), blank(), cell(chars[2])); }
    else { grid.append(cell(chars[0]), blank(), blank(), blank(), cell(chars[1])); grid.append(cell(chars[2]), blank(), blank(), blank(), blank()); }
  });
  return grid;
}
function underKana(L) {
  const its = L.items.map(k => ITEMS[k]), out = [];
  out.push(h('div', { class: 'card stack' }, h('h3', {}, 'Tap to hear'), kanaGrid(L.s, its[0].grp, L.items)));
  if (L.s === 'k' && loveOn() && ED.nameCard) out.push(nameCard());
  const hooks = its.filter(x => x.h);
  if (hooks.length) out.push(h('div', { class: 'card stack' }, h('h3', {}, its[0].grp === 'base' ? 'Memory hooks' : 'How they are built'), h('div', { class: 'pairs' }, hooks.map(x => h('div', { class: 'pair' }, h('span', { class: 'gl' }, x.k), h('span', { class: 'small' }, x.h))))));
  const conf = CONF[L.s].filter(p => its.some(x => x.k === p[0] || x.k === p[1]));
  if (conf.length) out.push(h('div', { class: 'card stack' }, h('h3', {}, 'Do not mix these up'), conf.map(p => h('div', { class: 'row' }, h('span', { class: 'mid-ja' }, p[0] + ' ' + p[1]), h('span', { class: 'small grow' }, p[2])))));
  (L.rules || []).forEach(i => { const r = KANA.rules[i]; out.push(h('div', { class: 'note' }, h('b', {}, r[0] + '. '), r[1])); });
  if (!(L.rules || []).length) out.push(h('div', { class: 'note' }, 'Look at each shape, read the hook, say the sound out loud. Spend about three seconds per kana; the review deck does the rest.'));
  return out;
}
function underVocab(L) {
  const ws = L.items.map(k => ITEMS[k]), list = h('div', { class: 'wl' });
  ws.forEach(w => list.append(sayBtn(w.kana), h('div', { class: 'w' }, w.kana, w.kanji ? h('small', {}, w.kanji) : null), h('div', { class: 'm' }, w.en, w.g ? h('span', { class: 'pill', style: 'margin-left:6px' }, 'group ' + w.g) : null)));
  const ctx = h('div', { class: 'stack', style: 'gap:8px' });
  let shown = 0;
  shuffle(ws).forEach(w => { if (shown >= 6) return; const c = contextFor(w); if (c) { ctx.append(h('div', { class: 'ctx', html: c + ' <span class="mute small">· ' + esc(w.kana) + ' = ' + esc(w.en) + '</span>' })); shown++; } });
  return [DECK_NOTES[L.deck] ? h('div', { class: 'note' }, DECK_NOTES[L.deck]) : null, h('div', { class: 'card stack' }, h('h3', {}, 'The words'), list),
    shown ? h('div', { class: 'card stack' }, h('h3', {}, 'Seen in your mock papers'), h('p', { class: 'small mute', style: 'margin:0' }, 'Real sentences from the 40 papers that use these words.'), ctx) : null];
}
function kanjiBlock(k) {
  return h('div', { class: 'card kjcard' }, h('div', { class: 'gl' }, k.k),
    h('div', { class: 'stack', style: 'gap:6px;min-width:0' }, h('b', { style: 'font-size:18px' }, k.m),
      h('div', { class: 'rd' }, h('b', {}, 'On '), k.on, '　', h('b', {}, 'Kun '), k.kun), h('div', { class: 'small mute' }, k.hook),
      h('div', { class: 'ex' }, k.ex.map(e => h('div', { class: 'exl' }, sayBtn(e.r), h('b', {}, e.w), h('span', {}, e.r), h('span', { class: 'mute small' }, e.g))))));
}
function underKanji(L) {
  return [h('div', { class: 'note' }, 'On-readings (katakana here) are used in compounds like 学校 がっこう. Kun-readings (hiragana) are used when the kanji stands alone or has kana after it, like 大きい おおきい. The test only asks you to read and recognise, so skip stroke order.'),
    L.items.map(k => kanjiBlock(ITEMS[k]))];
}
function gptBlock(g) {
  return h('div', { class: 'gpt' }, h('div', { class: 'eyebrow' }, g.t), h('div', { class: 'pat' }, g.p), h('div', {}, g.m), g.n ? h('div', { class: 'tip' }, g.n) : null,
    g.ex.map(e => h('div', { class: 'gex' }, sayBtn(e[0]), h('div', {}, h('div', { class: 'jp' }, e[0]), h('div', { class: 'en' }, e[1])))));
}
function vaultTable(set, cover) {
  const box = h('div', { class: 'stack', style: 'gap:0' });
  set.rows.forEach(r => { const say = jpPart(r[1]) || jpPart(r[0]); const b = h('div', { class: 'b' + (cover ? ' cover' : ''), onclick: () => b.classList.remove('cover') }, r[1]);
    box.append(h('div', { class: 'vrow' }, h('div', { class: 'a row', style: 'gap:8px;flex-wrap:nowrap' }, say ? sayBtn(say) : null, h('span', {}, r[0])), b)); });
  return box;
}
function numExplorer() {
  const out = h('div', { class: 'out' }), inp = h('input', { class: 'field', id: 'num-in', type: 'number', min: '0', max: '99999', value: '3600', inputmode: 'numeric', 'aria-label': 'Number' });
  const upd = () => { const n = Math.floor(+inp.value); out.textContent = n >= 0 && n <= 99999 && inp.value !== '' ? CORE.num(n) : 'Type 0 to 99,999'; };
  inp.addEventListener('input', upd); upd();
  return h('div', { class: 'card explore' }, h('h3', {}, 'Try any number'), h('div', { class: 'row' }, inp, h('button', { class: 'btn small', type: 'button', onclick: () => TTS.say(out.textContent) }, ico('speak'), 'Hear it')), out);
}
function timeExplorer() {
  const hs = h('select', { class: 'sel', id: 'time-h', 'aria-label': 'Hour' }, Array.from({ length: 12 }, (x, i) => h('option', { value: i + 1 }, (i + 1) + ' o’clock')));
  const ms = h('select', { class: 'sel', id: 'time-m', 'aria-label': 'Minutes' }, Array.from({ length: 60 }, (x, i) => h('option', { value: i }, ':' + String(i).padStart(2, '0'))));
  hs.value = '4'; ms.value = '30';
  const out = h('div', { class: 'out' }), upd = () => { out.textContent = timeStr(+hs.value, +ms.value); };
  hs.onchange = upd; ms.onchange = upd; upd();
  return h('div', { class: 'card explore' }, h('h3', {}, 'Try any time'), h('div', { class: 'row' }, hs, ms, h('button', { class: 'btn small', type: 'button', onclick: () => TTS.say(out.textContent) }, ico('speak'), 'Hear it')), out);
}
function dateGrid() {
  const g = h('div', { class: 'kjgrid', style: 'grid-template-columns:repeat(auto-fill,minmax(96px,1fr))' });
  for (let d = 1; d <= 31; d++) { const irr = d <= 10 || d === 14 || d === 20 || d === 24; g.append(h('button', { class: 'kcell', type: 'button', onclick: () => TTS.say(CORE.DAYS[d]) }, h('b', { style: 'font-size:17px' }, d + '日'), h('span', { class: irr ? 'irr' : '' }, CORE.DAYS[d]))); }
  return g;
}
function counterCards() {
  return h('div', { class: 'grid two' }, CORE.COUNTERS.map(c => h('div', { class: 'card stack', style: 'gap:6px' }, h('div', { class: 'row' }, h('span', { class: 'mid-ja' }, c.c), h('span', { class: 'small mute grow' }, c.use)),
    h('div', { class: 'small', style: 'line-height:1.9' }, c.r.map((r, i) => h('span', { style: 'margin-right:10px;white-space:nowrap' }, h('span', { class: 'mute' }, (i + 1) + ' '), h('span', { class: r.indexOf('*') >= 0 ? 'irr' : '' }, r.replace('*', ''))))))));
}
function verbExplorer() {
  const sel = h('select', { class: 'sel', id: 'verb-sel', 'aria-label': 'Verb' }, VERBS.map((v, i) => h('option', { value: i }, v.kana + (v.kanji ? '（' + v.kanji + '）' : '') + ' · ' + v.en)));
  const tbl = h('table', { class: 't formtab' });
  const upd = () => { const v = VERBS[+sel.value]; tbl.innerHTML = ''; tbl.append(h('tr', {}, h('td', {}, 'group'), h('td', {}, String(v.g))));
    CORE.FORMS.forEach(f => { const s = CORE.conj(v.kana, v.g, f[0]); tbl.append(h('tr', {}, h('td', {}, f[1]), h('td', {}, s, ' ', sayBtn(s)))); }); };
  sel.onchange = upd; upd();
  return h('div', { class: 'card explore' }, h('h3', {}, 'Verb lab: pick any ' + LVNAME + ' verb'), sel, h('div', { class: 'table-wrap' }, tbl));
}
function adjExplorer() {
  const all = IADJ.map(a => [a, 'i']).concat(NADJ.map(a => [a, 'na']));
  const sel = h('select', { class: 'sel', id: 'adj-sel', 'aria-label': 'Adjective' }, all.map((x, i) => h('option', { value: i }, x[0].kana + ' · ' + x[0].en + ' (' + (x[1] === 'i' ? 'い' : 'な') + ')')));
  const tbl = h('table', { class: 't formtab' });
  const upd = () => { const x = all[+sel.value]; tbl.innerHTML = ''; ['now', 'neg', 'past', 'pastneg', 'te', 'adv'].forEach(f => { const s = CORE.adj(x[0].kana, x[1], f); tbl.append(h('tr', {}, h('td', {}, AFN[f]), h('td', {}, s, ' ', sayBtn(s)))); });
    tbl.append(h('tr', {}, h('td', {}, 'before a noun'), h('td', {}, x[1] === 'i' ? x[0].kana + ' + N' : x[0].kana + 'な + N'))); };
  sel.onchange = upd; upd();
  return h('div', { class: 'card explore' }, h('h3', {}, 'Adjective lab'), sel, h('div', { class: 'table-wrap' }, tbl));
}
function particleTable() {
  return h('div', { class: 'card stack' }, h('h3', {}, 'The 16 N5 particles'), h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('tr', {}, h('th', {}, ''), h('th', {}, 'Job'), h('th', {}, 'Example')),
    CORE.PARTICLES.map(p => h('tr', {}, h('td', {}, h('b', { class: 'mid-ja' }, p[0]), h('div', { class: 'small mute' }, p[1])), h('td', { class: 'small' }, p[2]), h('td', {}, p[3], ' ', sayBtn(p[3].split('/')[0])))))));
}
function underCore(L) {
  const sets = (L.sets || []).map(id => h('div', { class: 'card stack' }, h('h3', {}, VSET[id].title), h('p', { class: 'small mute', style: 'margin:0' }, VSET[id].why), vaultTable(VSET[id])));
  switch (L.id) {
    case 'c-part': return [h('div', { class: 'note' }, 'Read the words right before and after the blank. Place where something happens → で. Place where something is, time, destination → に. Thing acted on → を.'), particleTable()];
    case 'c-num': return [h('div', { class: 'note' }, 'Big numbers are built left to right: 3,600 = さんぜん + ろっぴゃく. Only 300, 600, 800, 3,000 and 8,000 change their sound. 10,000 is one unit: いちまん.'), numExplorer(), sets];
    case 'c-time': return [h('div', { class: 'note' }, 'Hours: watch 4 よじ, 7 しちじ, 9 くじ. Minutes switch between ふん and ぷん: 1, 3, 4, 6, 8, 10 take ぷん. Half past is はん.'), timeExplorer(), sets];
    case 'c-dates': return [h('div', { class: 'note' }, 'Days 1 to 10, 14, 20 and 24 are irregular (pink). Every other day is number + にち. Weekdays are the elements: 月 moon, 火 fire, 水 water, 木 tree, 金 gold, 土 earth, 日 sun.'), h('div', { class: 'card stack' }, h('h3', {}, 'Tap a date to hear it'), dateGrid()), sets];
    case 'c-count': return [h('div', { class: 'note' }, 'Counters attach to the number. The sound changes (pink) follow a pattern: 1, 6, 8 and 10 double up with っ; with ほん/ひき/はい, 3 turns soft: さんぼん, さんびき, さんばい.'), counterCards()];
    case 'c-verbs1': case 'c-verbs2': return [h('div', { class: 'note' }, L.id === 'c-verbs1' ? 'Find the group first, then the form follows. Group 1 swaps the final u-sound for an i-sound before ます (かう → かいます). Group 2 just drops る. する → します, くる → きます.' : 'Group 2 verbs drop る and add て. Group 1 verbs follow the song in the table: う・つ・る → って, む・ぶ・ぬ → んで, く → いて, ぐ → いで, す → して. た-form is the て-form with た/だ. The one exception: いく → いって.'), verbExplorer(), sets];
    case 'c-adj': return [h('div', { class: 'note' }, 'い-adjectives change their い: たかい → たかくない → たかかった. な-adjectives never change; the ending after them does: しずかです → しずかじゃ ありません → しずかでした.'), adjExplorer(), sets];
    default: return sets;
  }
}
function understandFor(L) {
  if (L.kind === 'kana') return underKana(L);
  if (L.kind === 'vocab') return underVocab(L);
  if (L.kind === 'kanji') return underKanji(L);
  if (L.kind === 'grammar') return L.items.map(k => gptBlock(ITEMS[k]));
  return underCore(L);
}
function cardFor(k) {
  const it = ITEM(k);
  if (!it) return null;
  const big = t => h('div', { class: 'big glyph' }, t), mid = (t, st) => h('div', { class: 'mid', style: st || null }, t), sub = (t, st) => h('div', { class: 'sub', style: st || null }, t);
  switch (it.kind) {
    case 'kana': return { key: k, front: big(it.k), back: [mid(it.r, 'font-family:var(--f-ui)'), it.h ? sub(it.h) : null], say: it.k };
    case 'vocab': return { key: k, front: [mid(it.kana), it.kanji ? sub(it.kanji) : null], back: [mid(it.en, 'font:700 24px/1.3 var(--f-ui)'), sub((it.kanji ? it.kanji + ' · ' : '') + it.kana + (it.g ? ' · group ' + it.g : ''))], say: it.kana };
    case 'kanji': return { key: k, front: big(it.k), back: [mid(it.m, 'font:700 24px/1.3 var(--f-ui)'), sub('On ' + it.on + ' · Kun ' + it.kun), sub(it.ex.slice(0, 2).map(e => e.w + ' ' + e.r).join('　')), sub(it.hook, 'font-size:13px')], say: it.ex[0].r };
    case 'grammar': return { key: k, front: [h('div', { class: 'eyebrow' }, 'Pattern'), h('div', { style: 'font-size:22px;font-weight:700;color:var(--sheet)' }, it.p), sub(it.ex[0][0], 'font-size:17px;margin-top:10px')], back: [h('div', { style: 'font-size:18px;font-weight:700' }, firstSentence(it.m)), sub(it.ex[0][1]), it.n ? sub(it.n, 'font-size:13px') : null], say: it.ex[0][0] };
    case 'vault': return { key: k, front: mid(it.f, 'font-size:' + (it.f.length > 12 ? 20 : 30) + 'px'), back: [mid(it.b, 'font-size:' + (it.b.length > 14 ? 18 : 24) + 'px'), sub(it.set.title, 'font-size:12px')], say: jpPart(it.b) || jpPart(it.f) };
    case 'part': return { key: k, front: big(it.p), back: [mid(it.use, 'font:700 18px/1.4 var(--f-ui)'), sub(it.ex)], say: it.ex.split('/')[0] };
    case 'freq': return freqCard(k);
    case 'count': return { key: k, front: [big(it.c.length > 1 ? '' : it.c), it.c.length > 1 ? mid(it.c) : null, sub(it.use)], back: h('div', { class: 'small', style: 'line-height:2' }, it.r.map((r, i) => h('div', {}, (i + 1) + '  ', h('span', { class: r.indexOf('*') >= 0 ? 'irr' : '' }, r.replace('*', ''))))), say: it.r.slice(0, 5).map(r => r.replace('*', '')).join('、') };
  }
  return null;
}
view('lesson', 'learn', p => {
  const L = LMAP[p.id];
  if (!L) return h('div', { class: 'stack' }, head('Lesson not found'));
  const rec = () => S.les[L.id] || (S.les[L.id] = {});
  const root = h('div', { class: 'stack' }), steps = h('div', { class: 'steps', role: 'tablist' }), body = h('div', { class: 'stack' });
  root.append(head(L.title, L.sub, KINDNAME[L.kind] + ' · about ' + L.min + ' min'), steps, body);
  const names = [['覚える', 'Memorise'], ['わかる', 'Understand'], ['テスト', 'Test']];
  let step = p.step || (lessonDone(L.id) ? 2 : rec().m ? (rec().u ? 3 : 2) : 1);
  function drawSteps() {
    steps.innerHTML = '';
    names.forEach((nm, i) => { const n = i + 1, r = S.les[L.id] || {}, done = n === 1 ? r.m : n === 2 ? r.u : lessonDone(L.id);
      steps.append(h('button', { role: 'tab', type: 'button', 'aria-selected': String(n === step), onclick: () => show(n) }, h('b', {}, (done ? '✓ ' : '') + nm[0]), h('span', {}, n + ' · ' + nm[1]))); });
  }
  function show(n) {
    step = n; TTS.stop(); drawSteps(); body.innerHTML = '';
    if (n === 1) body.append(Cards(L.items.map(cardFor).filter(Boolean), () => show(2), 'Next: understand', () => { const r = rec(); if (!r.m) { r.m = 1; gainXP(10); } save(); drawSteps(); }));
    else if (n === 2) { kid(body, understandFor(L)); body.append(h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: () => { const r = rec(); if (!r.u) { r.u = 1; gainXP(5); } save(); show(3); window.scrollTo(0, 0); } }, 'Got it. Test me', ico('next')))); }
    else {
      body.append(h('div', { class: 'note small' }, 'Finish the test to complete this lesson. Any question you miss comes back once at the end, and goes into your review deck.'));
      body.append(Quiz(testQs(L), { pass: 80, loop: true,
        passText: res => res.pct >= 80 ? (loveOn() ? tpl(pick(PEP.pass)) : 'Lesson passed. Its cards are in your review deck.') : (loveOn() ? tpl(pick(PEP.done)) : 'Lesson complete.') + ' The ones you missed are in your review deck.',
        onFinish: res => {
          const r = rec(); r.t = Math.max(r.t || 0, res.pct);
          const first = !r.p; r.p = 1; r.m = 1; r.u = 1; r.d = today(); L.items.forEach(srsAdd); save(); if (first) gainXP(30); checkSession(); drawSteps();
          const saved = lessonDone(L.id);
          return [h('div', { class: 'small', style: 'width:100%;color:' + (saved ? 'var(--good)' : 'var(--bad)') }, saved ? '✓ Saved · ' + L.title + ' is complete' : 'Could not save this result. Open Settings › Diagnostics.')].concat(nextTaskButtons());
        } }));
    }
  }
  show(step);
  return root;
});

/* ---------- module screens ---------- */
view('kana', 'learn', p => {
  const s = p.s || 'h', root = h('div', { class: 'stack' });
  root.append(head('Kana', 'Two alphabets of 46 sounds each, plus ゛゜ sounds and combos. Hiragana first; katakana is for loanwords like コーヒー.', '仮 Kana'));
  root.append(h('div', { class: 'seg', role: 'group' }, [['h', 'ひらがな Hiragana'], ['k', 'カタカナ Katakana']].map(x => h('button', { type: 'button', 'aria-pressed': String(x[0] === s), onclick: () => swap('kana', { s: x[0] }) }, x[1]))));
  if (S.set.kana === 'both' || (S.set.kana === 'hira' && s === 'h')) root.append(h('div', { class: 'note small' }, 'You told the app you already read these, so their lessons count as done. Kana Rush in the Arcade keeps them sharp.'));
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Lessons'), h('div', { class: 'list' }, LESSONS.filter(l => l.kind === 'kana' && l.s === s).map(lessonRow))));
  if (s === 'k' && loveOn() && ED.nameCard) root.append(nameCard());
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Chart · tap to hear · green = well learned'), kanaGrid(s, 'base'), h('h3', {}, '゛ and ゜'), kanaGrid(s, 'dak'), h('h3', {}, 'Combos'), kanaGrid(s, 'yo')));
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Lookalikes'), CONF[s].map(pp => h('div', { class: 'row' }, h('span', { class: 'mid-ja' }, pp[0] + ' ' + pp[1]), h('span', { class: 'small grow' }, pp[2])))));
  root.append(h('button', { class: 'btn pink', type: 'button', onclick: () => go('game', { id: 'kana' }) }, 'Play Kana Rush'));
  return root;
});
view('kanji', 'learn', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Kanji', 'The ' + KANJI.length.toLocaleString('en') + ' ' + LVNAME + ' kanji, each learned inside two or three real words. Recognition only: the test never asks you to write.', '漢 Kanji'));
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Lessons'), h('div', { class: 'list' }, LESSONS.filter(l => l.kind === 'kanji').map(lessonRow))));
  const grid = h('div', { class: 'kjgrid' });
  KANJI.forEach(k => { const s = S.srs['kj:' + k.id]; grid.append(h('button', { class: 'kj' + (s ? (s[0] >= 3 ? ' ok' : ' seen') : ''), type: 'button', title: k.m, onclick: () => sheet(close => [kanjiBlock(k), h('button', { class: 'btn', type: 'button', onclick: close }, 'Close')]) }, k.k)); });
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'All ' + KANJI.length.toLocaleString('en') + ' · tap for details'), grid, h('div', { class: 'small mute' }, 'Yellow edge = in your deck · green = well learned')));
  root.append(h('button', { class: 'btn pink', type: 'button', onclick: () => go('game', { id: 'match' }) }, 'Play Kanji Match'));
  return root;
});
function wordRow(w) { return h('div', { class: 'li' }, sayBtn(w.kana), h('span', { class: 'body' }, h('b', {}, w.kana + (w.kanji ? '　' + w.kanji : '')), h('span', {}, w.en + (w.g ? ' · group ' + w.g : '')))); }
view('vocab', 'learn', p => {
  const root = h('div', { class: 'stack' });
  root.append(head('Vocabulary', VOCAB.all.length.toLocaleString('en') + ' ' + LVNAME + ' words in ' + VOCAB.decks.length + (PACK ? ' decks, most-used words first.' : ' themed decks.') + ' Words decide more marks than anything else on the test.', '語 Vocabulary'));
  const q = h('input', { class: 'search', id: 'vocab-search', type: 'search', placeholder: 'Search kana, kanji or English', value: p.q || '', 'aria-label': 'Search words' });
  const res = h('div', { class: 'list' });
  const decks = h('div', { class: 'list' }, VOCAB.decks.map(d => { const ls = LESSONS.filter(l => l.kind === 'vocab' && l.deck === d.id), dn = ls.filter(l => lessonDone(l.id)).length;
    return h('button', { class: 'li', type: 'button', onclick: () => go('deck', { id: d.id }) }, markEl(d.mark), h('span', { class: 'body' }, h('b', {}, d.title), h('span', {}, plural(d.words.length, 'word') + ' · ' + plural(ls.length, 'lesson'))), h('span', { class: 'end' }, dn === ls.length ? h('span', { class: 'pill good' }, ico('check')) : h('span', { class: 'small mute num' }, dn + '/' + ls.length))); }));
  const upd = () => { const t = q.value.trim().toLowerCase(); res.innerHTML = ''; decks.hidden = !!t; if (!t) return;
    const hits = VOCAB.all.filter(w => w.kana.indexOf(t) >= 0 || (w.kanji && w.kanji.indexOf(t) >= 0) || w.en.toLowerCase().indexOf(t) >= 0 || KANA.toKata(w.kana).indexOf(t) >= 0).slice(0, 40);
    if (!hits.length) res.append(h('div', { class: 'empty' }, 'No ' + LVNAME + ' word matches “' + q.value + '”.')); hits.forEach(w => res.append(wordRow(w))); };
  q.addEventListener('input', upd);
  root.append(q, res, decks);
  upd();
  return root;
});
view('deck', 'learn', p => {
  const d = DECK[p.id], root = h('div', { class: 'stack' });
  if (!d) return root;
  root.append(head(d.title, plural(d.words.length, 'word'), '語 Deck'));
  if (DECK_NOTES[d.id]) root.append(h('div', { class: 'note' }, DECK_NOTES[d.id]));
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Lessons'), h('div', { class: 'list' }, LESSONS.filter(l => l.kind === 'vocab' && l.deck === d.id).map(lessonRow))));
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Every word'), h('div', { class: 'list' }, d.words.map(w => wordRow(Object.assign({}, w))))));
  return root;
});
view('grammar', 'learn', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Grammar', 'Learn patterns, not theory. Each unit gives you the template, two example sentences and a quick test.', '文 Grammar'));
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Units'), h('div', { class: 'list' }, LESSONS.filter(l => l.kind === 'grammar').map(lessonRow))));
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'All ' + GPTS.length + ' patterns at a glance'), h('div', { class: 'table-wrap' }, h('table', { class: 't' }, GPTS.map(g => h('tr', {}, h('td', { style: 'white-space:nowrap' }, h('b', {}, g.t)), h('td', { class: 'small' }, firstSentence(g.m))))))));
  return root;
});
view('numbers', 'learn', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Numbers, time and dates', 'Listening is full of prices, times and dates. These are pure by-heart material with a few sound changes.', '数 Numbers'));
  if (LMAP['c-num']) root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Lessons'), h('div', { class: 'list' }, ['c-num', 'c-time', 'c-dates', 'c-count'].map(id => lessonRow(LMAP[id])))));
  root.append(numExplorer(), timeExplorer(), h('div', { class: 'card stack' }, h('h3', {}, 'Dates · tap to hear'), dateGrid()), h('h2', {}, 'Counters'), counterCards());
  root.append(h('button', { class: 'btn pink', type: 'button', onclick: () => go('game', { id: 'num' }) }, 'Play Number Ninja'));
  return root;
});
view('verbs', 'learn', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Verb and adjective lab', 'Every ' + LVNAME + ' verb in every form the test uses, generated on the fly so you can check any verb.', '動 Lab'));
  if (LMAP['c-verbs1']) root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Lessons'), h('div', { class: 'list' }, ['c-verbs1', 'c-verbs2', 'c-adj'].map(id => lessonRow(LMAP[id])))));
  root.append(verbExplorer(), h('div', { class: 'card stack' }, h('h3', {}, VSET.te.title), vaultTable(VSET.te)), adjExplorer());
  root.append(h('button', { class: 'btn pink', type: 'button', onclick: () => go('game', { id: 'verb' }) }, 'Play Verb Forge'));
  return root;
});
view('particles', 'learn', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Particles', 'Small words, big marks. Most grammar blanks are a particle choice.', '助 Particles'));
  root.append(LMAP['c-part'] ? lessonRow(LMAP['c-part']) : null, particleTable());
  root.append(h('button', { class: 'btn pink', type: 'button', onclick: () => go('game', { id: 'part' }) }, 'Play Particle Sniper'));
  return root;
});

/* ---------- vault ---------- */
view('vault', 'learn', p => {
  const root = h('div', { class: 'stack' });
  root.append(head('By-heart vault', 'Tables you simply memorise. Cover the answers, recite, reveal. Two minutes a sheet.', '暗 Vault'));
  root.append(h('div', { class: 'list' }, VAULT_ALL.map(v => { const learned = v.rows.filter((r, i) => { const s = S.srs['vt:' + v.id + ':' + i]; return s && s[0] >= 2; }).length;
    return h('button', { class: 'li', type: 'button', onclick: () => go('vaultset', { id: v.id, task: p.task }) }, markEl('暗'), h('span', { class: 'body' }, h('b', {}, v.title), h('span', {}, v.why)), h('span', { class: 'end small mute num' }, learned + '/' + v.rows.length)); })));
  if (p.task) { dayRec().vt = 1; save(); checkSession(); }
  return root;
});
view('vaultset', 'learn', p => {
  const v = VSET[p.id], root = h('div', { class: 'stack' });
  if (!v) return root;
  let cover = true;
  root.append(head(v.title, v.why, '暗 Cheat sheet'));
  const tbl = h('div', { class: 'card' });
  const draw = () => { tbl.innerHTML = ''; tbl.append(vaultTable(v, cover)); };
  draw();
  root.append(h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => { cover = !cover; draw(); } }, 'Hide or show answers'),
    h('button', { class: 'btn pink', type: 'button', onclick: () => { root.innerHTML = ''; root.append(head(v.title, 'Self-test', '暗 Cheat sheet'), Quiz(shuffle(v.rows.map((r, i) => qVault(ITEMS['vt:' + v.id + ':' + i]))), { onFinish: () => { dayRec().vt = 1; save(); checkSession(); return h('button', { class: 'btn', type: 'button', onclick: back }, 'Done'); } })); } }, 'Test me')),
    h('p', { class: 'small mute', style: 'margin:0' }, 'Tap a grey box to reveal one answer.'), tbl);
  if (p.task) { dayRec().vt = 1; save(); checkSession(); }
  return root;
});

/* ---------- review deck ---------- */
view('review', 'learn', p => {
  const root = h('div', { class: 'stack' });
  const forced = p.keys ? p.keys.split(',').filter(k => ITEM(k)) : null;
  let keys = forced || dueKeys();
  root.append(head('Review deck', 'Spaced repetition: right answers push a card further away (1, 2, 4, 7, 14, 30 days); a miss brings it back today.', '復 Review'));
  if (!keys.length) {
    const learned = Object.keys(S.srs).filter(k => ITEM(k));
    root.append(h('div', { class: 'card empty' }, h('div', { class: 'big-ja' }, '✓'), h('p', {}, learned.length ? (loveOn() ? tpl(dayPick(PEP.review, 'rev')) + ' ' : 'Nothing due. ') + 'Your deck holds ' + plural(learned.length, 'card') + '.' : 'Your deck is empty. Finish a lesson’s memorise step and its cards land here.'),
      learned.length ? h('button', { class: 'btn', type: 'button', onclick: () => { root.innerHTML = ''; root.append(head('Extra practice', 'Ten random cards from your deck; no schedule changes.', '復 Review'), Quiz(sample(learned, 10).map(k => qFor(k)).filter(Boolean), { srs: false })); } }, 'Practise 10 anyway') : h('button', { class: 'btn pink', type: 'button', onclick: () => { const l = nextLesson(); if (l) go('lesson', { id: l.id }); } }, 'Start the next lesson')));
    if (!forced) { dayRec().rev = 1; save(); checkSession(); }
    return root;
  }
  keys = shuffle(keys).slice(0, 20);
  const qs = keys.map(k => qFor(k)).filter(Boolean);
  root.append(h('div', { class: 'small mute' }, plural(qs.length, 'card') + (forced ? ' you miss most' : ' due') + (dueKeys().length > 20 && !forced ? ' (first 20 of ' + dueKeys().length + ')' : '')),
    Quiz(qs, { waitRight: false, onFinish: res => { dayRec().rev = 1; save(); checkSession(); if (!dueKeys().length) loveToast(pick(PEP.review)); return [dueKeys().length ? h('button', { class: 'btn', type: 'button', onclick: () => swap('review') }, 'Review ' + Math.min(20, dueKeys().length) + ' more') : null].concat(nextTaskButtons()); } }));
  return root;
});

/* ---------- setup and settings ---------- */
function examChoices() { return [['jlpt26', 'JLPT · 6 Dec 2026'], ['nat26', 'NAT-TEST · 13 Dec 2026'], ['jlpt27', 'JLPT · 4 Jul 2027'], ['jlpt27d', 'JLPT · 5 Dec 2027'], ['custom', 'Another date']].filter(x => x[0] === 'custom' || EXAMS[x[0]][1] >= today() || x[0] === S.set.exam); }
function settingsControls(draft) {
  const dateIn = h('input', { class: 'field', id: 'exam-date', type: 'date', value: draft.date || '2026-12-06', min: today(), 'aria-label': 'Exam date', onchange: e => { draft.date = e.target.value; } });
  const dateWrap = h('div', { hidden: draft.exam !== 'custom' }, dateIn);
  const kanaWrap = h('div', { class: 'stack', style: 'gap:6px', hidden: draft.lv !== 'n5' }, h('label', { class: 'fl' }, 'Kana'), chipset([['none', 'Starting from zero'], ['hira', 'I read hiragana'], ['both', 'I read both']], draft.kana, v => { draft.kana = v; }));
  const blurb = h('div', { class: 'small mute' }, LVINFO[draft.lv].blurb);
  return [
    h('label', { class: 'fl' }, 'Which level?'), levelPicker(draft.lv, v => { draft.lv = v; kanaWrap.hidden = v !== 'n5'; blurb.textContent = LVINFO[v].blurb; }), blurb,
    h('label', { class: 'fl' }, 'Which exam?'), chipset(examChoices(), draft.exam, v => { draft.exam = v; dateWrap.hidden = v !== 'custom'; }), dateWrap,
    h('label', { class: 'fl' }, 'Minutes a day you can really give'), chipset([[20, '20'], [30, '30'], [45, '45'], [60, '60'], [90, '90']].map(x => [String(x[0]), x[1] + ' min']), String(draft.mins), v => { draft.mins = +v; }),
    kanaWrap
  ];
}
function levelPicker(cur, on) {
  const row = h('div', { class: 'lvpick', role: 'group', 'aria-label': 'JLPT level' });
  LVS.forEach(lv => row.append(h('button', { type: 'button', 'data-lv': lv, 'aria-pressed': String(lv === cur), disabled: lv !== 'n5' && !PACKS[lv], onclick: e => { row.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); on(lv); } }, LVINFO[lv].name)));
  return row;
}
function applySettings(draft) {
  S.set.exam = draft.exam; S.set.mins = draft.mins; S.set.kana = draft.kana;
  if (draft.exam === 'custom' && draft.date) S.set.date = draft.date;
  S.today = null; save();
  if (draft.lv && draft.lv !== LV) { setLevel(draft.lv); return true; }   // saves and reloads the page at the new level
  return false;
}
/* quick switch from the top bar */
function levelSheet() {
  sheet(close => [h('h2', {}, 'Switch level'), h('p', { class: 'small mute', style: 'margin:0' }, 'Each level keeps its own lessons, reviews and mock scores. Switching never erases anything.'),
    h('div', { class: 'list' }, LVS.map(lv => h('button', { class: 'li lvrow', type: 'button', 'data-lv': lv, disabled: lv !== 'n5' && !PACKS[lv], onclick: () => { close(); if (lv !== LV) setLevel(lv); } },
      h('span', { class: 'mark' }, LVINFO[lv].name), h('span', { class: 'body' }, h('b', {}, 'JLPT ' + LVINFO[lv].name + (lv === LV ? ' · studying now' : '')), h('span', {}, LVINFO[lv].blurb)), lv === LV ? h('span', { class: 'end' }, ico('check')) : null))),
    h('button', { class: 'btn', type: 'button', onclick: close }, 'Close')]);
}
function setupSheet() {
  if (SHEETS.length) return;
  const draft = { exam: S.set.exam, mins: S.set.mins, kana: S.set.kana, date: S.set.date, lv: LV };
  sheet(close => ED.setup().concat([settingsControls(draft),
    h('button', { class: 'btn pink block', type: 'button', onclick: () => { S.setup = true; S.lv.hello = today(); if (applySettings(draft)) return; close(); render(); toast(ED.setupToast()); Notify.sync(); } }, 'Build my plan')]));
}
function taskWhy(x) {
  const d = dayRec();
  if (x.t === 'lesson') { const r = S.les[x.id] || {}; return r.p ? 'test finished, ' + (r.t || 0) + '% right first time' : r.u ? 'test not finished yet' : r.m ? 'understand and test left' : 'not started'; }
  if (x.t === 'review') return d.rev ? 'review round done' : dueKeys().length + ' cards due';
  if (x.t === 'listen') return (d.lis || 0) + ' listening sets today';
  if (x.t === 'read') return (d.rd || 0) + ' reading sets today';
  if (x.t === 'mock') return taskDone(x) ? 'submitted' : 'not submitted yet';
  if (x.t === 'talk') return dayRec().tk ? 'workout done' : 'bonus · not done yet';
  return taskDone(x) ? 'done' : 'not done';
}
function storageCheck() {
  const out = [];
  if (window.AndroidApp && AndroidApp.load) { try { const raw = AndroidApp.load(), s = raw ? JSON.parse(raw) : null; out.push('phone storage ' + (s && s.updated === S.updated ? 'OK' : s ? 'behind' : 'empty')); } catch (e) { out.push('phone storage error: ' + e.message); } }
  try { const raw = localStorage.getItem(KEY), s = raw ? JSON.parse(raw) : null; out.push('browser storage ' + (s && s.updated === S.updated ? 'OK' : s ? 'behind' : 'empty')); } catch (e) { out.push('browser storage blocked'); }
  if (window.claude) out.push('account sync ' + (Cloud.on ? 'on' : 'off'));
  return out.join(' · ');
}
function saveTest() {
  const probe = 'probe-' + Date.now();
  S.probe = probe; save();
  const found = [];
  if (window.AndroidApp && AndroidApp.load) { try { found.push(['phone storage', JSON.parse(AndroidApp.load() || '{}').probe === probe]); } catch (e) { found.push(['phone storage', false]); } }
  try { found.push(['browser storage', JSON.parse(localStorage.getItem(KEY) || '{}').probe === probe]); } catch (e) { found.push(['browser storage', false]); }
  delete S.probe; save(true);
  if (!found.some(f => f[1])) return '✗ Nothing could be saved on this device.';
  return found.map(f => (f[1] ? '✓ ' : '✗ ') + f[0]).join(' · ');
}
function diagReport() {
  const ts = todaySession(), L = [];
  L.push('JLPT Cheat Codes v' + APP_VERSION + ' · level ' + LVNAME + (window.AndroidApp ? ' · Android app' : ' · web') + ' · ' + (navigator.userAgent.match(/Android [\d.]+|iPhone OS [\d_]+|Windows NT [\d.]+|Mac OS X [\d_]+/) || [''])[0]);
  L.push('Study day ' + today() + ' · now ' + new Date().toLocaleString('en-GB'));
  L.push('Last saved ' + (S.updated ? new Date(S.updated).toLocaleString('en-GB') : 'never') + ' · ' + storageCheck());
  if (Notify.ok()) L.push('Notifications ' + Notify.state() + ' · ' + NOTIFY.slots.map(s => { const p = Notify.pref(s.id); return s.id + ' ' + p.t + (p.on ? ' ✓' : ' off'); }).join(' · '));
  L.push(Object.keys(S.les).filter(k => S.les[k].p).length + ' lessons complete · ' + S.xp + ' XP · ' + streakNow() + '-day streak');
  L.push("Today's session:");
  ts.tasks.forEach(x => L.push('  ' + (taskDone(x) ? '✓' : '·') + ' ' + taskLabel(x)[0] + (x.extra ? ' (bonus)' : '') + ': ' + taskWhy(x)));
  const errs = S.diag || [];
  L.push('Recent errors: ' + (errs.length ? '' : 'none'));
  errs.slice(-6).forEach(e => L.push('  ' + e.t + ' v' + e.v + ' [' + e.at + '] ' + e.m));
  return L.join('\n');
}
view('settings', 'home', () => {
  const root = h('div', { class: 'stack' }), draft = { exam: S.set.exam, mins: S.set.mins, kana: S.set.kana, date: S.set.date, lv: LV };
  root.append(head('Settings', '', 'Settings'));
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Your plan'), settingsControls(draft),
    h('button', { class: 'btn pink', type: 'button', onclick: () => { S.setup = true; if (applySettings(draft)) return; toast('Plan rebuilt'); back(); } }, 'Save and rebuild plan')));
  const rate = h('input', { type: 'range', id: 'tts-rate', min: '0.6', max: '1.2', step: '0.05', value: String(S.set.rate), 'aria-label': 'Speech speed', oninput: e => { S.set.rate = +e.target.value; rl.textContent = S.set.rate.toFixed(2) + '×'; save(); } });
  const rl = h('span', { class: 'small num' }, S.set.rate.toFixed(2) + '×');
  const voice = TTS.android ? null : h('select', { class: 'sel', id: 'tts-voice', 'aria-label': 'Voice', onchange: e => { S.set.voice = e.target.value; save(); TTS.pickVoice(); } },
    h('option', { value: '' }, 'Best available Japanese voice'), TTS.list.map(v => h('option', { value: v.voiceURI, selected: v.voiceURI === S.set.voice }, v.name)));
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Voice and sound'),
    h('div', { class: 'row' }, h('label', { class: 'fl', for: 'tts-rate' }, 'Speech speed'), rate, rl),
    voice, voiceHelp(),
    h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', onclick: () => TTS.say('こんにちは。わたしの なまえは たなかです。どうぞ よろしく おねがいします。') }, ico('speak'), 'Test the voice')),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', id: 'sfx', checked: S.set.sfx, onchange: e => { S.set.sfx = e.target.checked; save(); } }), 'Sound effects'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', id: 'love', checked: S.set.love !== false, onchange: e => { S.set.love = e.target.checked; save(); updateChips(); } }), ED.loveLabel)));
  root.append(notifyCard());
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Theme'), chipset([['auto', 'Match device'], ['light', 'Light'], ['dark', 'Dark']], S.set.theme, v => { S.set.theme = v; save(); applyTheme(); })));
  const box = h('textarea', { class: 'field', id: 'progress-code', 'aria-label': 'Progress code', placeholder: 'Paste a progress code here to restore it' });
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Your progress'), h('p', { class: 'small mute', id: 'sync-state', style: 'margin:0' }, ''),
    h('p', { class: 'small', style: 'margin:0' }, 'Move progress between the Android app and the web version: copy the code on one, paste it on the other.'),
    box, h('div', { class: 'row' },
      h('button', { class: 'btn small', type: 'button', onclick: () => { box.value = JSON.stringify(S); box.select(); try { navigator.clipboard.writeText(box.value).then(() => toast('Copied'), () => toast('Code shown: select and copy it')); } catch (e) { toast('Code shown: select and copy it'); } } }, 'Copy progress code'),
      h('button', { class: 'btn small', type: 'button', onclick: () => { let s = null; try { s = JSON.parse(box.value); } catch (e) {} if (!s || s.v !== 1) { toast('That code is not valid'); return; } confirmSheet('Replace progress?', 'This overwrites everything on this device with the pasted code.', 'Replace', () => { S = normalize(s); S.resetAt = Date.now(); save(); if (levelOf(S) !== LV) { location.reload(); return; } applyTheme(); Notify.sync(); tab('home'); toast('Progress restored'); }); } }, 'Restore from code'),
      h('button', { class: 'btn small ghost', type: 'button', style: 'color:var(--bad)', onclick: () => confirmSheet('Reset everything?', 'XP, streak, lessons, reviews and mock scores will be erased.', 'Erase', () => { const keep = S.set; S = blankState(); S.set = keep; S.setup = true; S.mig = 3; S.resetAt = Date.now(); save(); tab('home'); toast('Progress reset'); }) }, 'Reset progress'))));
  const rep = h('pre', { class: 'diag' }, diagReport()), res = h('div', { class: 'small' });
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'Diagnostics'), h('p', { class: 'small mute', style: 'margin:0' }, 'If something does not save, copy this report and send it over.'), rep, res,
    h('div', { class: 'row' },
      h('button', { class: 'btn small', type: 'button', onclick: () => { const ok = saveTest(); res.textContent = ok; res.style.color = ok.indexOf('✗') >= 0 ? 'var(--bad)' : 'var(--good)'; rep.textContent = diagReport(); } }, 'Run save test'),
      h('button', { class: 'btn small', type: 'button', onclick: () => { const t = diagReport(); try { navigator.clipboard.writeText(t).then(() => toast('Report copied'), () => toast('Select the report text to copy it')); } catch (e) { toast('Select the report text to copy it'); } } }, 'Copy report'),
      h('button', { class: 'btn small ghost', type: 'button', onclick: () => { S.diag = []; save(true); rep.textContent = diagReport(); } }, 'Clear error log'))));
  root.append(h('div', { class: 'card stack' }, h('h2', {}, 'About · v' + APP_VERSION), h('p', { class: 'small mute', style: 'margin:0' }, 'JLPT Cheat Codes · N5 to N1 lessons, mock papers, a conversation trainer, games and a spaced-repetition deck. Audio uses your device’s Japanese text-to-speech voice.'), updateRow(), sourcesList()));
  later(10, updateSync, root);
  return root;
});
