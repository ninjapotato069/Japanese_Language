/* ===== 05 · levels: N5 is the hand-built course; N4-N1 load a level pack and generate their papers from it =====
   Only one level is active at a time (S.set.lv). Switching level saves and reloads the page, so everything below this
   file can go on assuming a single set of VOCAB / KANJI / GRAMMAR / PAPERS. */
const LVS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const LVINFO = {
  // min = minutes for this app's mock sections; real = the real exam's sittings; pass = overall pass mark out of 180
  n5: { name: 'N5', nat: '5Q', pass: 80, min: [20, 40, 30], real: [20, 40, 30], blurb: 'Starting out: kana, 100 kanji, 700 words' },
  n4: { name: 'N4', nat: '4Q', pass: 90, min: [25, 35, 15], real: [25, 55, 35], blurb: 'Everyday Japanese: 170 more kanji, 600 words' },
  n3: { name: 'N3', nat: '3Q', pass: 95, min: [30, 40, 15], real: [30, 70, 40], blurb: 'The bridge level: 370 kanji, 2,000 words' },
  n2: { name: 'N2', nat: '2Q', pass: 90, min: [30, 40, 15], real: [105, 50], blurb: 'Working Japanese: 370 kanji, 1,600 words' },
  n1: { name: 'N1', nat: '1Q', pass: 100, min: [30, 40, 15], real: [110, 55], blurb: 'Advanced: 1,100 kanji, 2,600 words' }
};
const PACKS = window.LEVELS || {};
const LV = S.set.lv && S.set.lv !== 'n5' && PACKS[S.set.lv] ? S.set.lv : 'n5';
const LVN = +LV[1];
const PACK = LV === 'n5' ? null : PACKS[LV];
const PASSMARK = LVINFO[LV].pass;
const MQ = LV === 'n5' ? 'mq:' : 'm' + LVN + ':';      // key prefix for mock questions kept in the review deck
const TALK = window.TALK || { islands: [], tactics: [], drills: [], missions: [] };
const FREQ = window.FREQ || [];

/* move the level-specific parts of saved progress in and out of the active slots (also used when two copies are merged) */
function setLevel(lv) {
  if (lv === LV || LVS.indexOf(lv) < 0 || (lv !== 'n5' && !PACKS[lv])) return;
  switchLevelState(S, lv);
  S.updated = Date.now();
  persist();
  if (typeof flushAll === 'function') { try { flushAll(); } catch (e) {} }
  location.reload();
}

/* seeded random numbers, so that paper 7 is the same paper every time it is opened */
function seeded(seed) {
  let a = seed >>> 0;
  const r = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  r.int = n => Math.floor(r() * n);
  r.shuffle = arr => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = r.int(i + 1), t = a2[i]; a2[i] = a2[j]; a2[j] = t; } return a2; };
  return r;
}

if (PACK) {
  /* ---- vocabulary: decks by word class, most frequent words first ---- */
  const CLS = { verb: 'verbs', iadj: 'iadj', naadj: 'naadj', adv: 'adverbs', exp: 'exp' };
  const words = PACK.vocab.map(w => ({ id: LV + '_' + (w.k || w.r), kana: w.r, kanji: w.k || '', en: w.m, g: w.g || 0, c: w.c, x: w.x || null, hy: w.h || null, sy: w.s || '' }));
  const decks = [], byId = {};
  const deck = (id, title, mark) => byId[id] || (byId[id] = (decks.push({ id, title, mark, words: [] }), decks[decks.length - 1]));
  let nounN = 0;
  words.forEach(w => {
    let d;
    if (CLS[w.c]) d = deck(CLS[w.c], { verbs: 'Verbs', iadj: 'い-adjectives', naadj: 'な-adjectives', adverbs: 'Adverbs', exp: 'Expressions' }[CLS[w.c]], { verbs: '動', iadj: '形', naadj: 'な', adverbs: '副', exp: '句' }[CLS[w.c]]);
    else { const n = Math.floor(nounN++ / 120) + 1; d = deck('nouns' + n, 'Nouns ' + n, '名'); }
    w.deck = d.id; d.words.push(w);
  });
  ['iadj', 'naadj', 'verbs'].forEach(id => deck(id, id, '語'));      // the adjective and verb drills expect these decks to exist
  window.VOCAB = { decks: decks.filter(d => d.words.length), all: words };
  ['iadj', 'naadj', 'verbs'].forEach(id => { if (!byId[id].words.length) window.VOCAB.decks.push(byId[id]); });
  /* ---- kanji ---- */
  window.KANJI = PACK.kanji.map(k => ({ id: LV + '_' + k.k, k: k.k, m: k.m, on: k.on || '–', kun: k.kun || '–', ex: k.ex.map(e => ({ w: e[0], r: e[1], g: e[2] })), hook: k.st ? k.st + ' strokes' : '' }));
  /* ---- grammar ---- */
  window.GRAMMAR = PACK.grammar || [];
  /* ---- papers ---- */
  window.PAPERS = makePapers(words);
}

function makePapers(words) {
  const N = 12, EX = PACK.exam || {}, sent = PACK.sent;
  const base = seeded(1000 + LVN * 77);
  const ul = t => '<span class="ul">' + esc(t) + '</span>';
  const BLANK = '<span class="blank">（　　　）</span>';
  const form = w => w.kanji || w.kana;
  // the sentence a word appears in, with the word swapped for something else
  const inSent = (w, i, fn) => { const x = w.x[i % w.x.length], s = sent[x[0]][0], f = form(w); return esc(s.slice(0, x[1])) + fn(f) + esc(s.slice(x[1] + f.length)); };
  const withX = words.filter(w => w.x);
  const pools = {
    kanji: base.shuffle(words.filter(w => w.kanji && w.kana.length >= 2)),
    hyoki: base.shuffle(words.filter(w => w.hy && w.hy.length >= 3)),
    bun: base.shuffle(withX),
    iikae: base.shuffle(words.filter(w => w.sy)),
    yoho: base.shuffle(withX.filter(w => w.c === 'noun' || w.c === 'naadj' || w.c === 'adv')),
    bunpo: base.shuffle((PACK.grammar || []).reduce((a, u) => a.concat(u.points.reduce((b, p) => b.concat(p.q.map(q => ({ q, p }))), [])), []))
  };
  const byClass = {};
  words.forEach(w => (byClass[w.c] = byClass[w.c] || []).push(w));
  const COUNT = { n4: [7, 5, 8, 4, 4, 13, 4], n3: [8, 6, 11, 5, 5, 13, 5], n2: [6, 5, 8, 5, 5, 12, 5], n1: [6, 0, 8, 6, 6, 10, 5] }[LV];
  const take = (pool, P, n) => { const out = []; if (!pool.length) return out; for (let i = 0; i < n; i++) out.push(pool[((P - 1) * n + i) % pool.length]); return out; };
  const rot = (arr, P, n) => { const out = []; for (let i = 0; i < Math.min(n, (arr || []).length); i++) out.push(arr[(P - 1 + i) % arr.length]); return out; };
  // four options in a seeded order; returns { o, a } with a counted from 1
  const opts = (r, right, wrong) => { const o = r.shuffle([right].concat(wrong.slice(0, 3))); return { o, a: o.indexOf(right) + 1 }; };
  const others = (r, w, n, show) => { const seen = new Set([show(w)]), out = []; const pool = r.shuffle(byClass[w.c].length > 8 ? byClass[w.c] : words);
    for (const x of pool) { const t = show(x); if (!seen.has(t) && x.en !== w.en) { seen.add(t); out.push(x); if (out.length >= n) break; } } return out; };
  function readingWrong(r, w) {
    const out = [], seen = new Set([w.kana]);
    const add = t => { if (t && !seen.has(t) && out.length < 3) { seen.add(t); out.push(t); } };
    perturb(w.kana).forEach(add);
    r.shuffle(words.filter(x => x.kanji && x.kana.length === w.kana.length && x.kana[0] === w.kana[0])).forEach(x => add(x.kana));
    r.shuffle(words.filter(x => x.kanji && Math.abs(x.kana.length - w.kana.length) <= 1)).forEach(x => add(x.kana));
    return out;
  }
  function build(P) {
    const r = seeded(P * 7919 + LVN * 104729), s1 = [];
    take(pools.kanji, P, COUNT[0]).forEach((w, i) => {
      const o = opts(r, w.kana, readingWrong(r, w));
      s1.push({ t: 'kanji', s: w.x ? inSent(w, i, ul) : ul(w.kanji), o: o.o, a: o.a, w: w.kanji + ' = ' + w.kana + ' (' + w.en + ')' });
    });
    take(pools.hyoki, P, COUNT[1]).forEach((w, i) => {
      const o = opts(r, w.kanji, r.shuffle(w.hy));
      s1.push({ t: 'hyoki', s: w.x ? inSent(w, i, () => ul(w.kana)) : ul(w.kana), o: o.o, a: o.a, w: w.kana + ' = ' + w.kanji + ' (' + w.en + ')' });
    });
    take(pools.bun, P, COUNT[2]).forEach((w, i) => {
      const o = opts(r, form(w), others(r, w, 3, form).map(form));
      s1.push({ t: 'bunmyaku', s: inSent(w, i, () => BLANK), o: o.o, a: o.a, w: form(w) + (w.kanji ? '（' + w.kana + '）' : '') + ' = ' + w.en + '. ' + sent[w.x[i % w.x.length][0]][1] });
    });
    take(pools.iikae, P, COUNT[3]).forEach((w, i) => {
      const o = opts(r, w.sy, others(r, w, 4, form).map(form).filter(t => t !== w.sy));
      s1.push({ t: 'iikae', s: w.x ? inSent(w, i, ul) : ul(form(w)), o: o.o, a: o.a, w: form(w) + ' ≈ ' + w.sy + ' (' + w.en + ')' });
    });
    take(pools.yoho, P, COUNT[4]).forEach((w, i) => {
      const f = form(w), right = inSent(w, i, ul);
      const wrong = others(r, w, 12, form).filter(x => x.x && x.c === w.c).slice(0, 3).map(x => inSent(x, i, () => ul(f)));
      if (wrong.length < 3) return;
      const o = opts(r, right, wrong);
      s1.push({ t: 'yoho', s: '<b>' + esc(f) + '</b>', o: o.o, a: o.a, w: f + (w.kanji ? '（' + w.kana + '）' : '') + ' = ' + w.en + '. Only one sentence uses it naturally.' });
    });
    const s2 = { bunpo: [], kumitate: [], tanbun: [], chubun: null };
    take(pools.bunpo, P, COUNT[5]).forEach(x => {
      const o = opts(r, x.q[1][0], x.q[1].slice(1));
      s2.bunpo.push({ s: esc(x.q[0]).replace('（　）', BLANK), o: o.o, a: o.a, w: x.p.t + ': ' + x.p.m });
    });
    rot(EX.kumi, P, COUNT[6]).forEach(k => {
      const order = r.shuffle([0, 1, 2, 3]);
      s2.kumitate.push({ s: esc(k.pre) + ' <span class="sl"></span><span class="sl"></span><span class="sl star">★</span><span class="sl"></span> ' + esc(k.post), o: order.map(i => k.p[i]), a: order.indexOf(2) + 1,
        w: k.pre + ' ［' + k.p[0] + '］［' + k.p[1] + '］［' + k.p[2] + '★］［' + k.p[3] + '］ ' + k.post + ' ' + k.en });
    });
    rot(EX.tanbun, P, 2).forEach(t => { const q = t.qs[0], o = opts(r, q.o[0], q.o.slice(1)); s2.tanbun.push({ lead: '', text: t.text, q: q.q, o: o.o, a: o.a, w: q.w }); });
    const ch = rot(EX.chubun, P, 1)[0];
    if (ch) s2.chubun = { text: ch.text, qs: ch.qs.map(q => { const o = opts(r, q.o[0], q.o.slice(1)); return { q: q.q, o: o.o, a: o.a, w: q.w }; }) };
    const s3 = { point: [], sokuji: [] };
    rot(EX.point, P, 3).forEach(x => { const o = opts(r, x.o[0], x.o.slice(1)); s3.point.push({ set: x.set, q: x.q, lines: x.lines, o: o.o, a: o.a, w: x.w }); });
    rot(EX.sokuji, P * 3 - 2, 6).forEach(x => { const o = r.shuffle(x.o); s3.sokuji.push({ spk: x.spk, u: x.u, o, a: o.indexOf(x.o[0]) + 1, w: x.w }); });
    return { id: P, gen: true, s1, s2, s3 };
  }
  const arr = [], cache = {};
  for (let i = 0; i < N; i++) Object.defineProperty(arr, i, { enumerable: true, configurable: true, get: () => cache[i] || (cache[i] = build(i + 1)) });
  return arr;
}

/* ---------- wording that depends on the level ---------- */
const LVNAME = LVINFO[LV].name;
const THREE_PART = LVN <= 3;        // N3-N1 are scored in three parts of 60; N5 and N4 in two parts (120 + 60)
const PASS_TEXT = THREE_PART
  ? 'Pass = ' + PASSMARK + '/180 overall, with at least 19/60 in each of language knowledge, reading and listening. These mocks mark language knowledge and reading together out of 120, so treat 38 there as the bare minimum.'
  : 'Pass = ' + PASSMARK + '/180 overall, plus at least 38/120 in vocabulary, grammar and reading together and 19/60 in listening.';
const REAL_TOTAL = sum(LVINFO[LV].real);
function levelCodes() {
  if (!PACK) return CORE.CODES;
  const words = VOCAB.all.length, weeks = Math.ceil(words / 20 / 7);
  return [
    ['Most-used words first', 'Every deck is sorted by how often a word is really used. The first third of the list does most of the work in reading and listening; the rare tail can wait.'],
    ['Vocabulary is the big lever', words.toLocaleString('en') + ' words at this level. Twenty a day with spaced reviews covers them in about ' + weeks + ' weeks, and words decide reading and listening too.'],
    ['Learn kanji inside words', KANJI.length + ' new kanji. Learn each through two or three words you already need: readings stick to words, not to lists.'],
    ['Grammar comes in pairs', 'Most patterns have a usual partner: たとえ…ても, さえ…ば, からには…たい. Learn the pair and half the blanks fill themselves.'],
    ['Pass maths', PASS_TEXT + ' A safe target is 60% in every part.'],
    ['Listening has its own minimum', 'Under 19/60 in listening fails the test whatever your total. Ten minutes of listening every day.'],
    ['Read the question first', 'Long passages punish slow readers. Read the question and the options, then scan for the line that answers it. The last paragraph usually carries the writer’s opinion.'],
    ['Mocks are training, not judging', 'From the second half of your plan, do one mock section a day and study every mistake. One full mock on the weekend.'],
    ['Never leave a blank', 'There is no penalty for a wrong answer. Guess, mark it, move on.'],
    ['Speak it to keep it', 'Ten minutes in the Talk tab turns words you recognise into words you can use, and that makes listening easier too.']
  ];
}
function levelSections() {
  if (!PACK) return CORE.SECTIONS;
  return [
    ['Vocabulary and kanji', ['Kanji reading: watch small っ, long vowels and voiced sounds. The wrong options differ by exactly those.',
      LVN > 1 ? 'Writing in kanji: the wrong options swap in a kanji with the same reading. Check each character, not the overall shape.' : 'Context: read the whole sentence; the answer is usually a fixed pairing of words.',
      'Paraphrase: put the underlined word into simple Japanese in your head, then find its twin.',
      'Usage: three of the four sentences use the word where another word belongs. Test each one by swapping in a synonym.']],
    ['Grammar and reading', ['Look at the words right before and after the blank first: the form they need removes two options at once.',
      '★ questions: build the whole sentence on scrap paper, then pick the ★ piece. The piece that must touch the words before or after the blanks is your anchor.',
      'Reading: read the question first, then hunt. For “what does the writer want to say”, weigh the last paragraph most.',
      'Budget your time. Leave grammar when your time for it is up; reading questions carry more marks each.']],
    ['Listening', ['Read the printed options before the talk starts and listen for a change of plan: でも, やっぱり, それより.',
      'Key-point questions: the question is spoken first. Hold on to its question word (どうして, 何を, いつ).',
      'Quick response: nothing is printed. Trust your first instinct and let the question go.',
      'Audio plays once in the real test: practise in Exam mode with one play only.']]
  ];
}
function examScript() {
  const R = LVINFO[LV].real, n5 = LV === 'n5';
  const out = [
    ['7 days before', ['Mocks only: one section a day in Exam mode, plus your review deck.', 'One full mock on the weekend, every section in one sitting.', 'Get your test voucher (受験票) as soon as it is issued and check the venue and route.']],
    ['The day before', [n5 ? 'Vault quick pass: dates, counters, て-form, こそあど, question words.' : 'Skim your most-missed cards and the grammar list. Nothing new.', 'Pack: test voucher, photo ID, HB pencils, eraser, an analogue watch, water.', 'No new material. Sleep early.']],
    ['Exam morning', [n5 ? 'Light breakfast. Five minutes of Kana Rush and one listening drill to wake your ears up.' : 'Light breakfast. One listening drill to wake your ears up.', 'Arrive 30 minutes early. Phone off and away.']]
  ];
  if (R.length === 3) out.push(
    ['Vocabulary · ' + R[0] + ' min', [n5 ? 'About 50 seconds per question. Never leave a bubble empty: wrong answers cost nothing.' : 'Under a minute per question. Never leave a bubble empty: wrong answers cost nothing.', 'Kanji reading: check small っ, long vowels and ' + (n5 ? 'the special dates.' : 'voiced sounds.')]],
    ['Grammar & reading · ' + R[1] + ' min', [n5 ? 'Grammar in about 12 minutes, then reading.' : 'Give grammar about a third of the time, then read.', 'For ★ questions, write the four pieces in order in the margin first.', 'Reading: read the question first, then find the line that answers it.']],
    ['Listening · ' + R[2] + ' min', ['Read the printed options before each audio starts.', 'Mark your answer straight away; each audio plays once.', n5 ? 'Parts 3 and 4 are spoken only: decide in the pause, then let it go.' : 'Quick-response questions are spoken only: decide in the pause, then let it go.']]);
  else out.push(
    ['Language knowledge & reading · ' + R[0] + ' min', ['One sitting with no break, and you set the pace. Give vocabulary and grammar about a third of the time and keep the rest for reading.', 'For ★ questions, write the four pieces in order in the margin first.', 'Reading: short passages first, then the long ones. Read the question before the text.', 'Never leave a bubble empty: wrong answers cost nothing.']],
    ['Listening · ' + R[1] + ' min', ['Read the printed options before each audio starts.', 'Mark your answer straight away; each audio plays once.', 'Quick-response questions are spoken only: decide in the pause, then let it go.']]);
  out.push(['Mark sheet', ['Fill each bubble completely with an HB pencil.', 'Every five questions, check the question number matches the row you are marking.']]);
  return out;
}

/* version history, newest first (also in CHANGELOG.md) */
const CHANGES = [
  ['2.0.0', ['All five levels: switch between N5, N4, N3, N2 and N1 at any time; each keeps its own plan, reviews and scores.',
    'N4 to N1 packs: about 6,900 words and 2,000 kanji, sorted by how often they are used, with example sentences.',
    'Mock papers for N4 to N1, generated from the real question types, plus a new “usage” question type.',
    'New Talk tab: Core 1,000 words, speech islands, survival tactics, pattern drills and role-play missions, with a ten-minute daily workout.',
    'A fresh look, a level switch in the top bar, and a “Check for updates” button in Settings.']],
  ['1.7', ['Good morning, good evening and good night notifications on Android.']],
  ['1.6', ['Fixed a blank screen when reopening the app after playing an Arcade game.', 'If the app ever fails to start it now shows a recovery screen instead of a blank page.']],
  ['1.5', ['Fixed lessons and particle quizzes not saving as complete. Added a Diagnostics card in Settings.']]
];
