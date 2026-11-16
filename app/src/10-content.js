/* ===== 10 · content: item index, lessons, question builders, plan ===== */
const PAPERS = window.PAPERS || [];
const ITEMS = {};
const KANA_ALL = { h: [], k: [] };
[['h', KANA.hira, KANA.dakH, KANA.yoH], ['k', KANA.kata, KANA.dakK, KANA.yoK]].forEach(row => {
  const s = row[0];
  const put = (x, grp, hook) => { const it = { kind: 'kana', s, k: x.k, r: x.r, h: hook || '', grp }; ITEMS[s + ':' + x.k] = it; KANA_ALL[s].push(it); };
  row[1].forEach(x => put(x, 'base', x.h));
  row[2].forEach(x => { const d = x.k.normalize('NFD'); put(x, 'dak', d[0] + (d[1] === '゚' ? ' + ゜' : ' + ゛') + ' → ' + x.k + ' (' + x.r + ')'); });
  row[3].forEach(x => put(x, 'yo', x.k[0] + ' + small ' + x.k[1] + ' → ' + x.r));
});
KANJI.forEach(k => { ITEMS['kj:' + k.id] = Object.assign({ kind: 'kanji' }, k); });
const DECK = {};
VOCAB.decks.forEach(d => { DECK[d.id] = d; });
VOCAB.all.forEach(w => { ITEMS['v:' + w.id] = Object.assign({ kind: 'vocab' }, w); });
const GPTS = [];
GRAMMAR.forEach(u => u.points.forEach((p, i) => { const it = Object.assign({ kind: 'grammar', unit: u, i }, p); ITEMS['g:' + u.id + ':' + i] = it; GPTS.push(it); }));
const XSETS = [
  { id: 'nums', title: 'Numbers: the sound changes', why: 'Prices and phone numbers come up in every listening paper.', rows: [
    ['0', 'ゼロ・れい'], ['4', 'よん (also し)'], ['7', 'なな (also しち)'], ['9', 'きゅう (also く)'], ['100', 'ひゃく'], ['300', 'さんびゃく'], ['600', 'ろっぴゃく'],
    ['800', 'はっぴゃく'], ['1,000', 'せん'], ['3,000', 'さんぜん'], ['8,000', 'はっせん'], ['10,000', 'いちまん'], ['¥4', 'よえん']] },
  { id: 'masu', title: 'Making the ます form', why: 'Every polite verb in the test is built this way.', rows: [
    ['group 1: かう', 'かいます (u-sound → i-sound + ます)'], ['group 1: のむ', 'のみます'], ['group 1: まつ', 'まちます'], ['group 1: はなす', 'はなします'],
    ['group 2: たべる', 'たべます (drop る, add ます)'], ['group 2: みる', 'みます'], ['group 3: する', 'します'], ['group 3: くる', 'きます'],
    ['not (polite)', '〜ません'], ['did (polite)', '〜ました'], ['did not (polite)', '〜ませんでした'], ["let's", '〜ましょう']] }
];
const VAULT_ALL = CORE.VAULT.concat(XSETS);
const VSET = {};
VAULT_ALL.forEach(v => { VSET[v.id] = v; v.rows.forEach((r, i) => { ITEMS['vt:' + v.id + ':' + i] = { kind: 'vault', set: v, i, f: r[0], b: r[1] }; }); });
CORE.PARTICLES.forEach((p, i) => { ITEMS['pt:' + i] = { kind: 'part', i, p: p[0], ro: p[1], use: p[2], ex: p[3] }; });
CORE.COUNTERS.forEach((c, i) => { ITEMS['ct:' + i] = Object.assign({ kind: 'count', i }, c); });

const TYPES = {
  yoho: [1, 'Usage', 'ようほう'],
  kanji: [1, 'Kanji reading', 'かんじよみ'], hyoki: [1, 'Writing: kana or kanji', 'ひょうき'], bunmyaku: [1, 'Word in context', 'ぶんみゃくきてい'], iikae: [1, 'Same meaning', 'いいかえ'],
  bunpo: [2, 'Grammar blanks', 'ぶんぽう'], kumitate: [2, 'Sentence building ★', 'くみたて'], bunsho: [2, 'Passage grammar', 'ぶんしょうの ぶんぽう'], tanbun: [2, 'Short reading', 'たんぶん'],
  chubun: [2, 'Longer reading', 'ちゅうぶん'], joho: [2, 'Information search', 'じょうほうけんさく'],
  kadai: [3, 'Task listening', 'かだいりかい'], point: [3, 'Point listening', 'ポイントりかい'], hatsuwa: [3, 'What do you say?', 'はつわひょうげん'], sokuji: [3, 'Quick response', 'そくじおうとう']
};
function ITEM(k) {
  if (ITEMS[k]) return ITEMS[k];
  if (k && k.slice(0, 3) === MQ) {
    const a = k.split(':').map(Number), p = a[1], s = a[2], i = a[3];
    if (p >= 1 && p <= PAPERS.length && s >= 1 && s <= 3) { const m = model(p, s); if (m.flat[i]) return { kind: 'mock', p, s, i }; }
  }
  return null;
}

/* ---------- lessons ---------- */
const LESSONS = [], LMAP = {};
const addL = o => { LESSONS.push(o); LMAP[o.id] = o; };
const ROWSTART = [0, 5, 10, 15, 20, 25, 30, 35, 38, 43];
(LV === 'n5' ? ['h', 'k'] : []).forEach(s => {
  const nm = s === 'h' ? 'Hiragana' : 'Katakana';
  const base = KANA_ALL[s].filter(x => x.grp === 'base'), dak = KANA_ALL[s].filter(x => x.grp === 'dak'), yo = KANA_ALL[s].filter(x => x.grp === 'yo');
  const key = x => s + ':' + x.k;
  const pos = i => s === 'h' ? -1 + i * 0.01 : 0.01 + 0.2 * (i + 0.5) / 5;
  [[0, 15], [15, 30], [30, 46]].forEach((ab, i) => {
    const starts = ROWSTART.filter(x => x >= ab[0] && x < ab[1]).map(x => base[x].k);
    addL({ id: s + (i + 1), kind: 'kana', s, stream: s, pos: pos(i), title: nm + ' ' + (i + 1), sub: starts.join(' ') + ' rows', mark: base[ab[0]].k,
      items: base.slice(ab[0], ab[1]).map(key), min: 15, rules: s === 'h' ? [[], [], [5, 7]][i] : [[], [], [7]][i] });
  });
  addL({ id: s + '4', kind: 'kana', s, stream: s, pos: pos(3), title: nm + ' 4', sub: '゛ and ゜ sounds', mark: dak[0].k, items: dak.map(key), min: 12, rules: s === 'h' ? [0, 1, 6] : [0, 1] });
  addL({ id: s + '5', kind: 'kana', s, stream: s, pos: pos(4), title: nm + ' 5', sub: 'Combos and small っ', mark: yo[0].k, items: yo.map(key), min: 12, rules: s === 'h' ? [2, 3, 4] : [2, 3, 4, 8] });
});
const V2 = ['question', 'verbs', 'iadj', 'naadj', 'adverbs'];
const vdecks = { v1: VOCAB.decks.filter(d => V2.indexOf(d.id) < 0), v2: V2.map(id => DECK[id]).filter(Boolean) };
['v1', 'v2'].forEach(st => {
  const ls = [];
  vdecks[st].forEach(d => {
    const n = Math.ceil(d.words.length / 24);
    if (!n) return;
    chunks(d.words, n).forEach((ws, i) => ls.push({ id: (LV === 'n5' ? 'v-' : LV + 'v-') + d.id + '-' + i, kind: 'vocab', deck: d.id, stream: st, title: d.title + (n > 1 ? ' ' + (i + 1) + '/' + n : ''),
      sub: plural(ws.length, 'word'), mark: d.mark, items: ws.map(w => 'v:' + w.id), min: Math.round(4 + ws.length * 0.55) }));
  });
  ls.forEach((l, i) => { l.pos = st === 'v1' ? (i + 0.5) / ls.length : 0.02 + 0.93 * (i + 0.5) / ls.length; addL(l); });
});
const KJN = LV === 'n5' ? 11 : Math.max(1, Math.ceil(KANJI.length / 10));
chunks(KANJI, KJN).forEach((ks, i) => addL({ id: (LV === 'n5' ? 'kj' : LV + 'kj') + (i + 1), kind: 'kanji', stream: 'kj', pos: 0.06 + 0.88 * (i + 0.5) / KJN, title: 'Kanji ' + (i + 1),
  sub: ks.slice(0, 6).map(k => k.k).join(' ') + (ks.length > 6 ? ' …' : ''), mark: ks[0].k, items: ks.map(k => 'kj:' + k.id), min: 15 }));
GRAMMAR.forEach((u, i) => addL({ id: 'g-' + u.id, kind: 'grammar', unit: u, stream: 'g', pos: 0.02 + 0.93 * (i + 0.5) / GRAMMAR.length, title: u.title,
  sub: plural(u.points.length, 'pattern'), mark: u.kanji, items: u.points.map((p, j) => 'g:' + u.id + ':' + j), min: 8 + u.points.length * 2 }));
[['c-part', 'Particles', 'は が を に で へ と も の や から まで', '助', 0.03, { parts: true }],
 ['c-num', 'Numbers to 99,999', 'Prices and the sound changes', '数', 0.09, { sets: ['nums'], gen: 'num' }],
 ['c-kosoado', 'こそあど and question words', 'これ それ あれ どれ · なに だれ どこ', '何', 0.15, { sets: ['kosoado', 'qwords'] }],
 ['c-time', 'Telling the time', 'よじ, くじ, ろっぷん, はん', '時', 0.21, { sets: ['time'], gen: 'time' }],
 ['c-verbs1', 'Verb groups and ます forms', 'ます ません ました ませんでした ましょう たい', '動', 0.27, { sets: ['groups', 'masu'], gen: 'verb', forms: ['masu', 'masen', 'mashita', 'masendeshita', 'mashou', 'tai'] }],
 ['c-adj', 'Adjective endings', 'い and な adjectives in every tense', '形', 0.36, { sets: ['adj'], gen: 'adj' }],
 ['c-dates', 'Dates, months and weekdays', 'ついたち, はつか, らいしゅう', '日', 0.44, { sets: ['dates', 'months', 'timewords'], gen: 'date' }],
 ['c-verbs2', 'て, た and ない forms', 'The て-form song and plain forms', 'て', 0.49, { sets: ['te'], gen: 'verb', forms: ['te', 'ta', 'nai', 'nakatta'] }],
 ['c-count', 'Counters', '本 枚 人 つ 回 階 and their sound changes', '本', 0.6, { counters: true, gen: 'count' }],
 ['c-family', 'Family and position words', 'ちち or おとうさん · うえ した なか', '家', 0.7, { sets: ['family', 'position'] }],
 ['c-instr', 'Read the test instructions', 'Know every instruction before exam day', '試', 0.9, { sets: ['instructions'] }]
].filter(() => LV === 'n5').forEach(c => {
  const x = c[5], items = [];
  (x.sets || []).forEach(sid => VSET[sid].rows.forEach((r, i) => items.push('vt:' + sid + ':' + i)));
  if (x.parts) CORE.PARTICLES.forEach((p, i) => items.push('pt:' + i));
  if (x.counters) CORE.COUNTERS.forEach((p, i) => items.push('ct:' + i));
  addL(Object.assign({ id: c[0], kind: 'core', stream: 'c', title: c[1], sub: c[2], mark: c[3], pos: c[4], items, min: 15 }, x));
});
const KINDNAME = { kana: 'Kana', vocab: 'Vocabulary', kanji: 'Kanji', grammar: 'Grammar', core: 'Core skill' };
const PRI = { h: 0, k: 1, c: 2, g: 3, v1: 4, v2: 5, kj: 6 };
function kanaKnown(l) { return l.kind === 'kana' && (S.set.kana === 'both' || (S.set.kana === 'hira' && l.s === 'h')); }
function planOrder() { return LESSONS.filter(l => !kanaKnown(l)).sort((a, b) => (a.pos - b.pos) || (PRI[a.stream] - PRI[b.stream])); }
function lessonDone(id) { const l = LMAP[id]; if (!l) return false; if (kanaKnown(l)) return true; const r = S.les[id]; return !!(r && r.p); }
function nextLesson(exclude) { const ex = exclude || []; return planOrder().find(l => !lessonDone(l.id) && ex.indexOf(l.id) < 0) || null; }

/* ---------- question builders ---------- */
function fillP(right, lists, n) {
  const out = [], seen = new Set([String(right)]);
  for (const list of lists) {
    for (const c of shuffle(list || [])) {
      if (out.length >= n) return out;
      const s = c == null ? '' : String(c);
      if (!s || seen.has(s)) continue;
      seen.add(s); out.push(s);
    }
  }
  return out;
}
function mk(q) {
  const ai = q.a || 0, right = String(q.o[ai]);
  const wrong = uniq(q.o.filter((x, i) => i !== ai).map(String).filter(x => x && x !== right));
  const opts = q.fixed ? q.o.map(String) : shuffle([right].concat(wrong.slice(0, (q.n || 4) - 1)));
  return Object.assign({}, q, { o: opts, a: q.fixed ? ai : opts.indexOf(right) });
}
const blankify = s => esc(s).replace(/（　）/g, '<span class="blank">（　　　）</span>').replace(/＿/g, '<span class="blank">（　　　）</span>');
const firstSentence = m => { const i = m.indexOf('. '); return i > 0 ? m.slice(0, i + 1) : m; };
const isJP = s => /[぀-ヿ一-鿿]/.test(s || '');
function jpPart(s) { if (!isJP(s)) return ''; const t = String(s).split(/[（(]/)[0].replace(/[〜~]/g, '').trim(); return isJP(t) ? t : ''; }

const DAKMAP = {};
'かが きぎ くぐ けげ こご さざ しじ すず せぜ そぞ ただ ちぢ つづ てで とど はば ひび ふぶ へべ ほぼ'.split(' ').forEach(p => { DAKMAP[p[0]] = p[1]; DAKMAP[p[1]] = p[0]; });
'ぱは ぴひ ぷふ ぺへ ぽほ'.split(' ').forEach(p => { DAKMAP[p[0]] = p[1]; });
const OROW = 'おこそとのほもよろごぞどぼぽょ', EROW = 'えけせてねへめれげぜでべぺ';
function perturb(s) {
  const c = Array.from(s), out = new Set();
  const put = a => { const t = a.join(''); if (t && t !== s && t.length > 1) out.add(t); };
  const iTsu = c.indexOf('っ');
  if (iTsu >= 0) put(c.filter((x, i) => i !== iTsu));
  else for (let i = 1; i < c.length; i++) if ('かきくけこさしすせそたちつてとぱぴぷぺぽ'.indexOf(c[i]) >= 0) { put(c.slice(0, i).concat('っ', c.slice(i))); break; }
  for (let i = 1; i < c.length; i++) {
    if (c[i] === 'う' && OROW.indexOf(c[i - 1]) >= 0) { put(c.filter((x, j) => j !== i)); break; }
    if (c[i] === 'い' && EROW.indexOf(c[i - 1]) >= 0) { put(c.filter((x, j) => j !== i)); break; }
  }
  for (let i = 0; i < c.length; i++) if (OROW.indexOf(c[i]) >= 0 && c[i + 1] !== 'う' && c[i + 1] !== 'ょ') { put(c.slice(0, i + 1).concat('う', c.slice(i + 1))); break; }
  for (let i = 0; i < c.length; i++) if (DAKMAP[c[i]]) { const a = c.slice(); a[i] = DAKMAP[c[i]]; put(a); break; }
  for (let i = 0; i < c.length; i++) if ('ゃゅょ'.indexOf(c[i]) >= 0) { const a = c.slice(); a[i] = { 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ' }[c[i]]; put(a); const b = c.slice(); b[i] = c[i] === 'ょ' ? 'ゅ' : 'ょ'; put(b); break; }
  return Array.from(out);
}
const CONF = { h: KANA.confuse.h, k: KANA.confuse.k };
function kanaConf(it) { return CONF[it.s].filter(p => p[0] === it.k || p[1] === it.k).map(p => p[0] === it.k ? p[1] : p[0]); }
function qKana(it, mode, pool) {
  pool = pool || KANA_ALL[it.s].filter(x => x.grp === it.grp);
  const key = it.s + ':' + it.k, w = it.k + ' = ' + it.r + (it.h ? ' · ' + it.h : '');
  mode = mode || (Math.random() < 0.65 ? 'read' : 'pick');
  if (mode === 'read') {
    const confR = kanaConf(it).map(k => ITEMS[it.s + ':' + k]).filter(Boolean).map(x => x.r);
    const cons = pool.filter(x => x.r[0] === it.r[0]).map(x => x.r), vow = pool.filter(x => x.r.slice(-1) === it.r.slice(-1)).map(x => x.r);
    return mk({ k: key, ask: 'How do you read it?', q: it.k, qc: 'huge', o: [it.r].concat(fillP(it.r, [confR, cons, vow, pool.map(x => x.r)], 3)), w, say: it.k });
  }
  const sameR = k => { const x = ITEMS[it.s + ':' + k]; return x && x.r === it.r; };
  const confK = kanaConf(it).filter(k => !sameR(k));
  return mk({ k: key, ask: 'Which kana is “' + it.r + '”?', q: it.r, qc: 'large', o: [it.k].concat(fillP(it.k, [confK, pool.filter(x => x.r !== it.r).map(x => x.k)], 3)), oc: 'jpbig', w, say: it.k });
}
function qVocab(it, mode) {
  const key = 'v:' + it.id, deck = DECK[it.deck].words, all = VOCAB.all;
  const w = it.kana + (it.kanji ? '（' + it.kanji + '）' : '') + ' = ' + it.en;
  mode = mode || (it.kanji && Math.random() < 0.3 ? 'read' : pick(['mean', 'mean', 'jp']));
  if (mode === 'read' && !it.kanji) mode = 'mean';
  if (mode === 'mean' || mode === 'listen') {
    const ds = fillP(it.en, [deck.filter(x => x.en !== it.en).map(x => x.en), all.map(x => x.en)], 3);
    if (mode === 'listen') return mk({ k: key, ask: 'What does it mean?', q: '', audio: it.kana, o: [it.en].concat(ds), w, say: it.kana });
    return mk({ k: key, ask: 'What does it mean?', q: it.kana, qc: 'large', meta: it.kanji, o: [it.en].concat(ds), w, say: it.kana });
  }
  if (mode === 'jp') {
    const ds = fillP(it.kana, [deck.filter(x => x.en !== it.en).map(x => x.kana), all.filter(x => x.en !== it.en).map(x => x.kana)], 3);
    return mk({ k: key, ask: 'Which word means this?', q: it.en, qc: 'mid', o: [it.kana].concat(ds), oc: 'jp', w, say: it.kana });
  }
  const ds = fillP(it.kana, [perturb(it.kana), deck.filter(x => x.kanji && x.kana.length === it.kana.length).map(x => x.kana), deck.map(x => x.kana)], 3);
  return mk({ k: key, ask: 'How is it read?', q: it.kanji, qc: 'large', o: [it.kana].concat(ds), oc: 'jp', w, say: it.kana });
}
const SIMK = ['人入八', '大犬天太', '日目白月田', '土上工', '木本休', '千午年', '右左石', '力九', '小少', '母毎', '学字', '校交', '東車', '四西', '見貝', '話語読', '間聞門', '先生', '名外夕', '山出', '金全', '今会', '水木', '男田', '耳目', '手毛', '立六', '万方', '何同', '国口回', '書昼', '気汽', '南半', '北比'];
function simKanji(k) { const g = SIMK.filter(x => x.indexOf(k) >= 0).join(''); return Array.from(g).filter(c => c !== k && KANJI.some(x => x.k === c)); }
const KEXR = KANJI.reduce((a, k) => a.concat(k.ex.map(e => e.r)), []);
function qKanji(it, mode) {
  const key = 'kj:' + it.id;
  mode = mode || pick(['mean', 'word', 'word', 'pick']);
  if (mode === 'mean') return mk({ k: key, ask: 'What does this kanji mean?', q: it.k, qc: 'huge glyph', o: [it.m].concat(fillP(it.m, [KANJI.map(k => k.m)], 3)), w: it.k + ' = ' + it.m + ' · ' + it.hook, say: it.ex[0].r });
  if (mode === 'pick') return mk({ k: key, ask: 'Which kanji means “' + it.m + '”?', q: it.m, qc: 'mid', o: [it.k].concat(fillP(it.k, [simKanji(it.k), KANJI.map(k => k.k)], 3)), oc: 'glyphbig', w: it.m + ' = ' + it.k + ' · ' + it.hook });
  const ex = pick(it.ex);
  return mk({ k: key, ask: 'How is it read?', q: ex.w, qc: 'large', o: [ex.r].concat(fillP(ex.r, [perturb(ex.r), KEXR.filter(r => r.length === ex.r.length), KEXR], 3)), oc: 'jp', w: ex.w + ' = ' + ex.r + ' (' + ex.g + ')', say: ex.r });
}
function gExplain(it) { return '<b>' + esc(it.t) + '</b> · ' + esc(it.m) + (it.n ? '<br><span class="mute">' + esc(it.n) + '</span>' : ''); }
function qGrammarFrom(it, qq) {
  const stem = qq[0], sent = /^Choose the correct sentence/.test(stem), arrow = stem.indexOf('→') > 0;
  return mk({ k: 'g:' + it.unit.id + ':' + it.i, ask: sent ? 'Choose the correct sentence' : arrow ? 'Change the form' : 'Fill the blank', q: sent ? '' : blankify(stem), qh: true, qc: 'stem', o: qq[1], a: qq[2], oc: 'jp', w: gExplain(it), wh: true, say: stem.indexOf('（　）') >= 0 ? stem.replace('（　）', qq[1][qq[2]]) : '' });
}
function qGrammar(it, mode) {
  if (it.q.length && mode !== 'mean') return qGrammarFrom(it, pick(it.q));
  const others = GPTS.filter(g => g !== it).map(g => firstSentence(g.m));
  return mk({ k: 'g:' + it.unit.id + ':' + it.i, ask: 'What does this pattern mean?', q: esc(it.t) + '<div class="meta">' + esc(it.ex[0][0]) + '</div>', qh: true, qc: 'stem', o: [firstSentence(it.m)].concat(fillP(firstSentence(it.m), [others], 3)), w: gExplain(it), wh: true, say: it.ex[0][0] });
}
function qVault(it) {
  return mk({ k: 'vt:' + it.set.id + ':' + it.i, ask: it.set.title, q: it.f, qc: isJP(it.f) ? 'large' : 'mid', o: [it.b].concat(fillP(it.b, [it.set.rows.map(r => r[1])], 3)), oc: 'jp', w: it.f + ' → ' + it.b, say: jpPart(it.b) || jpPart(it.f) });
}
function qPart(it) {
  const twin = { に: 'へ', へ: 'に', と: 'や', や: 'と' }[it.p];
  return mk({ k: 'pt:' + it.i, ask: 'Which particle does this job?', q: it.use, qc: 'mid', o: [it.p].concat(fillP(it.p, [CORE.PARTICLES.map(p => p[0]).filter(p => p !== twin)], 3)), oc: 'jpbig', w: it.p + ' (' + it.ro + '): ' + it.ex, say: it.ex.split('/')[0] });
}
function qDrill(d) {
  return mk({ ask: 'Pick the particle', q: blankify(d.s), qh: true, qc: 'stem', o: [d.a].concat(d.d), oc: 'jpbig', w: esc(d.s.replace('＿', d.a)), wh: true, say: d.s.replace('＿', d.a) });
}
const HFAM = { は: 'はばぱ', ひ: 'ひびぴ', ふ: 'ふぶぷ', へ: 'へべぺ', ほ: 'ほぼぽ', ば: 'はばぱ' };
const sokuon = b => b.replace(/いち$/, 'いっ').replace(/ろく$/, 'ろっ').replace(/はち$/, 'はっ').replace(/じゅう$/, 'じゅっ');
function qCount(it, n) {
  n = n || 1 + rnd(10);
  const right = it.r[n - 1].replace('*', ''), k = it.k || 'つ', base = CORE.num(n), v = [];
  const fam = HFAM[k[0]];
  if (fam) Array.from(fam).forEach(f => { v.push(base + f + k.slice(1)); v.push(sokuon(base) + f + k.slice(1)); });
  v.push(sokuon(base) + k);
  const label = n + (it.c === 'つ' ? 'つ' : it.c);
  return mk({ k: 'ct:' + it.i, ask: 'Read it (' + it.use + ')', q: label, qc: 'large', o: [right].concat(fillP(right, [v, [base + k], it.r.map(x => x.replace('*', ''))], 3)), oc: 'jp', w: label + ' = ' + right + (it.r[n - 1].indexOf('*') >= 0 ? ' (irregular)' : ''), say: right });
}
function numWrong(n) {
  const r = CORE.num(n), out = [];
  [['さんびゃく', 'さんひゃく'], ['ろっぴゃく', 'ろくひゃく'], ['はっぴゃく', 'はちひゃく'], ['さんぜん', 'さんせん'], ['はっせん', 'はちせん'], ['きゅう', 'く'], ['ろっぴゃく', 'ろっひゃく'], ['さんびゃく', 'さんぴゃく']].forEach(p => { if (r.indexOf(p[0]) >= 0) out.push(r.replace(p[0], p[1])); });
  if (/^せん/.test(r)) out.push('いち' + r);
  if (/^ひゃく/.test(r)) out.push('いち' + r);
  return out;
}
function qNum() {
  const kind = pick(['n2', 'n3', 'n4', 'yen', 'yen']);
  let n;
  if (kind === 'n2') n = 11 + rnd(89);
  else if (kind === 'n3') n = (1 + rnd(9)) * 100 + rnd(10) * 10 + rnd(10);
  else if (kind === 'n4') n = (1 + rnd(9)) * 1000 + rnd(10) * 100;
  else n = (1 + rnd(99)) * (Math.random() < 0.5 ? 10 : 100);
  const suf = kind === 'yen' ? 'えん' : '', right = CORE.num(n) + suf;
  const near = [n + 100, Math.abs(n - 100) || n + 200, n + 10, n * 10 <= 99999 ? n * 10 : n + 1000, n + 1000].map(m => CORE.num(m) + suf);
  const label = (kind === 'yen' ? '¥' : '') + n.toLocaleString('en-US');
  return mk({ ask: 'How do you say it?', q: label, qc: 'large num', o: [right].concat(fillP(right, [numWrong(n).map(x => x + suf), near], 3)), oc: 'jp', w: label + ' = ' + right, say: right });
}
const timeStr = (hh, m) => CORE.HOUR[hh] + (m === 0 ? '' : m === 30 ? 'はん' : CORE.minutes(m));
function qTime() {
  const hh = 1 + rnd(12), m = pick([0, 0, 5, 10, 15, 20, 30, 30, 40, 45, 50, 1, 3, 4, 6, 8]), right = timeStr(hh, m);
  const mins = m === 0 ? '' : m === 30 ? 'はん' : CORE.minutes(m), wr = [];
  if (hh === 4) wr.push('よんじ' + mins);
  if (hh === 9) wr.push('きゅうじ' + mins);
  const MW = { 1: 'いちふん', 3: 'さんふん', 4: 'よんふん', 6: 'ろくふん', 10: 'じゅうふん', 20: 'にじゅうふん', 40: 'よんじゅうふん', 50: 'ごじゅうふん', 30: 'さんじゅうふん' };
  if (MW[m]) wr.push(CORE.HOUR[hh] + MW[m]);
  const other = [timeStr(hh % 12 + 1, m), timeStr(hh === 1 ? 12 : hh - 1, m), timeStr(hh, (m + 10) % 60), timeStr(hh, m === 30 ? 0 : 30)];
  const label = hh + ':' + String(m).padStart(2, '0');
  return mk({ ask: 'What time is it?', q: label, qc: 'large num', o: [right].concat(fillP(right, [wr, other], 3)), oc: 'jp', w: label + ' = ' + right, say: right });
}
const DAYWRONG = { 1: ['いちにち', 'いっか'], 2: ['ふたか', 'ににち'], 3: ['さんにち', 'みか', 'むいか'], 4: ['ようか', 'よんにち'], 5: ['いっか', 'ごにち'], 6: ['ろくにち', 'みっか'], 7: ['しちにち', 'ななか'],
  8: ['よっか', 'はちにち'], 9: ['くにち', 'ここのつか'], 10: ['とうか', 'じゅうにち'], 14: ['じゅうよんにち', 'じゅうようか'], 20: ['にじゅうにち', 'ふつか'], 24: ['にじゅうよんにち', 'にじゅうようか'] };
function qDate() {
  const mode = pick(['day', 'day', 'day', 'month', 'week']);
  if (mode === 'day') {
    const d = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 20, 24, 11 + rnd(20)]), right = CORE.DAYS[d];
    return mk({ ask: 'How do you read the date?', q: d + '日', qc: 'large', o: [right].concat(fillP(right, [DAYWRONG[d] || [], [CORE.DAYS[d === 31 ? 30 : d + 1], CORE.DAYS[d === 1 ? 2 : d - 1]]], 3)), oc: 'jp', w: d + '日 = ' + right, say: right });
  }
  if (mode === 'month') {
    const m = 1 + rnd(12), right = CORE.MONTHS[m], wr = { 4: ['よんがつ', 'よがつ'], 7: ['なながつ', 'ななげつ'], 9: ['きゅうがつ', 'きゅげつ'] }[m] || [CORE.num(m) + 'げつ'];
    return mk({ ask: 'How do you read the month?', q: m + '月', qc: 'large', o: [right].concat(fillP(right, [wr, CORE.MONTHS.slice(1)], 3)), oc: 'jp', w: m + '月 = ' + right, say: right });
  }
  const i = rnd(7), d = CORE.WEEK[i];
  return mk({ ask: 'How do you read it?', q: d[1], qc: 'large', o: [d[0]].concat(fillP(d[0], [CORE.WEEK.map(x => x[0])], 3)), oc: 'jp', w: d[1] + ' = ' + d[0] + ' (' + d[2] + ')', say: d[0] });
}
const VERBS = VOCAB.all.filter(w => w.g);
const AROW = { う: 'わ', く: 'か', ぐ: 'が', す: 'さ', つ: 'た', ぬ: 'な', ぶ: 'ば', む: 'ま', る: 'ら' }, EROW1 = { う: 'え', く: 'け', ぐ: 'げ', す: 'せ', つ: 'て', ぬ: 'ね', ぶ: 'べ', む: 'め', る: 'れ' };
const FORMNAME = {}; CORE.FORMS.forEach(f => { FORMNAME[f[0]] = f[1]; });
function wrongConj(v, f) {
  const k = v.kana, st = k.slice(0, -1), last = k.slice(-1), out = [];
  if (v.g === 1 && last === 'る') out.push(CORE.conj(k, 2, f));
  if (v.g === 2) out.push(CORE.conj(k, 1, f));
  if (v.g === 3) { out.push(CORE.conj(k, 1, f)); out.push(CORE.conj(k, 2, f)); }
  if (f === 'te' || f === 'ta') (f === 'te' ? ['って', 'んで', 'いて', 'いで', 'して'] : ['った', 'んだ', 'いた', 'いだ', 'した']).forEach(e => out.push(st + e));
  if ((f === 'nai' || f === 'nakatta') && v.g === 1) { const tail = f === 'nai' ? 'ない' : 'なかった'; out.push(st + 'あ' + tail); out.push(st + 'え' + tail); }
  if (v.g === 1 && 'masu masen mashita masendeshita mashou tai'.indexOf(f) >= 0) {
    const suf = CORE.conj(k, 1, f).slice(CORE.conj(k, 1, 'masu').length - 2);
    out.push(k + suf);
    if (AROW[last]) out.push(st + AROW[last] + suf, st + EROW1[last] + suf);
  }
  if (v.g === 2 && 'masu masen mashita masendeshita mashou tai'.indexOf(f) >= 0) out.push(k + CORE.conj(k, 2, f).slice(st.length));
  return out;
}
function qVerb(forms) {
  const v = pick(VERBS), f = pick(forms), right = CORE.conj(v.kana, v.g, f);
  const other = forms.filter(x => x !== f).map(x => CORE.conj(v.kana, v.g, x));
  return mk({ ask: 'Make the ' + FORMNAME[f], q: v.kana, qc: 'large', meta: (v.kanji ? v.kanji + ' · ' : '') + v.en + ' · group ' + v.g, o: [right].concat(fillP(right, [wrongConj(v, f), other], 3)), oc: 'jp', w: v.kana + ' → ' + right + ' (group ' + v.g + ')', say: right });
}
function qGroup() {
  const v = pick(VERBS), why = v.g === 3 ? 'する and くる are the only group 3 verbs.' : v.g === 2 ? 'Ends in -iru or -eru and is not a group 1 trap.' : (v.kana.slice(-1) === 'る' ? 'Looks like group 2 but it is a group 1 trap.' : 'Does not end in る: group 1.');
  return mk({ ask: 'Which verb group?', q: v.kana, qc: 'large', meta: v.en, o: ['group ' + v.g].concat(['group 1', 'group 2', 'group 3'].filter(x => x !== 'group ' + v.g)), n: 3, w: v.kana + ': group ' + v.g + '. ' + why, say: v.kana });
}
const IADJ = DECK.iadj.words, NADJ = DECK.naadj.words.filter(w => w.kana !== 'おなじ');
const AFN = { now: 'present (polite)', neg: 'negative (polite)', past: 'past (polite)', pastneg: 'past negative (polite)', te: 'て-form (joining)', adv: 'adverb form' };
function qAdj() {
  const isI = Math.random() < 0.6, a = pick(isI ? IADJ : NADJ), t = isI ? 'i' : 'na', f = pick(['neg', 'past', 'pastneg', 'te', 'neg', 'past', 'adv']);
  const right = CORE.adj(a.kana, t, f), wr = [CORE.adj(a.kana, isI ? 'na' : 'i', f)];
  if (isI && f === 'past') wr.push(a.kana + 'でした');
  if (isI && f === 'neg') wr.push(a.kana + 'くないです');
  if (!isI && f === 'neg') wr.push(a.kana + 'くないです');
  const other = ['now', 'neg', 'past', 'pastneg', 'te', 'adv'].filter(x => x !== f).map(x => CORE.adj(a.kana, t, x));
  return mk({ ask: 'Make the ' + AFN[f], q: a.kana, qc: 'large', meta: (isI ? 'い-adjective' : 'な-adjective') + ' · ' + a.en, o: [right].concat(fillP(right, [wr, other], 3)), oc: 'jp', w: a.kana + ' → ' + right, say: right });
}
function qFor(key, mode) {
  const it = ITEM(key);
  if (!it) return null;
  switch (it.kind) {
    case 'kana': return qKana(it, mode);
    case 'vocab': return qVocab(it, mode);
    case 'kanji': return qKanji(it, mode);
    case 'grammar': return qGrammar(it, mode);
    case 'vault': return qVault(it);
    case 'part': return qPart(it);
    case 'count': return qCount(it);
    case 'mock': return qMock(it.p, it.s, it.i);
    case 'freq': return qFreq(it, mode);
  }
  return null;
}
function testQs(L) {
  let qs = [];
  const keys = shuffle(L.items);
  if (L.kind === 'kana') keys.slice(0, 12).forEach(k => qs.push(qKana(ITEMS[k])));
  else if (L.kind === 'vocab') keys.slice(0, 12).forEach(k => qs.push(qVocab(ITEMS[k])));
  else if (L.kind === 'kanji') { keys.forEach(k => qs.push(qKanji(ITEMS[k]))); keys.slice(0, 2).forEach(k => qs.push(qKanji(ITEMS[k], 'word'))); }
  else if (L.kind === 'grammar') {
    L.items.forEach(k => ITEMS[k].q.forEach(qq => qs.push(qGrammarFrom(ITEMS[k], qq))));
    shuffle(L.items).slice(0, Math.max(2, 8 - qs.length)).forEach(k => qs.push(qGrammar(ITEMS[k], 'mean')));
  } else {
    const g = { num: qNum, time: qTime, date: qDate, count: () => qCount(pick(CORE.COUNTERS.map((c, i) => ITEMS['ct:' + i]))), adj: qAdj, verb: () => qVerb(L.forms) }[L.gen];
    if (L.id === 'c-part') { sample(CORE.PDRILL, 9).forEach(d => qs.push(qDrill(d))); sample(L.items, 3).forEach(k => qs.push(qPart(ITEMS[k]))); }
    else if (g) { for (let i = 0; i < 9; i++) qs.push(g()); if (L.id === 'c-verbs1') { qs.push(qGroup(), qGroup(), qGroup()); } else sample(L.items, 3).forEach(k => qs.push(qFor(k))); }
    else keys.slice(0, 12).forEach(k => qs.push(qFor(k)));
  }
  qs = qs.filter(Boolean);
  const seen = new Set();
  qs = qs.filter(q => { const sig = q.ask + '|' + strip(q.q || q.audio || ''); if (seen.has(sig)) return false; seen.add(sig); return true; });
  return shuffle(qs).slice(0, 12);
}

/* ---------- context sentences from the 40 papers ---------- */
let CORPUS = null;
function corpus() {
  if (CORPUS) return CORPUS;
  if (PACK) return (CORPUS = PACK.sent.map(x => x[0]));
  const out = [];
  const add = t => { if (!t) return; strip(t).replace(/\s+/g, ' ').split('。').forEach(x => { x = x.trim(); if (x.length > 4 && x.indexOf('（') < 0 && x.indexOf('★') < 0) out.push(x + '。'); }); };
  PAPERS.forEach(P => {
    P.s1.forEach(q => { if (q.t === 'kanji' || q.t === 'hyoki' || q.t === 'iikae') add(q.s); if (q.t === 'iikae') q.o.forEach(add); });
    P.s2.tanbun.forEach(x => x.text.forEach(add));
    P.s2.chubun.text.forEach(add);
    P.s3.kadai.concat(P.s3.point).forEach(x => x.lines.forEach(l => add(l[1])));
    P.s3.sokuji.forEach(x => add(x.u));
  });
  CORPUS = uniq(out);
  return CORPUS;
}
function contextFor(w) {
  if (PACK) {
    if (!w.x) return '';
    const x = pick(w.x), s = PACK.sent[x[0]][0], f = w.kanji || w.kana;
    return esc(s.slice(0, x[1])) + '<mark>' + esc(f) + '</mark>' + esc(s.slice(x[1] + f.length)) + '<span class="cx-en">' + esc(PACK.sent[x[0]][1]) + '</span>';
  }
  const forms = [];
  if (w.kanji) forms.push(w.kanji);
  if (w.g) { try { if (w.kanji) forms.push(CORE.conj(w.kanji, w.g, 'masu')); forms.push(CORE.conj(w.kana, w.g, 'masu')); } catch (e) {} }
  if (w.kana.length >= 3 || (w.kana.length === 2 && !w.g)) forms.push(w.kana);
  const C = corpus(), start = rnd(C.length);
  for (let n = 0; n < C.length; n++) {
    const s = C[(start + n) % C.length];
    for (const f of forms) {
      const i = s.indexOf(f);
      if (i < 0) continue;
      const kanjiForm = /[一-鿿]/.test(f);
      if (!kanjiForm && i > 0 && !/[\s、。「（・]/.test(s[i - 1])) continue;
      return esc(s.slice(0, i)) + '<mark>' + esc(f) + '</mark>' + esc(s.slice(i + f.length));
    }
  }
  return '';
}

/* ---------- exam calendar and the plan generator ---------- */
const EXAMS = { jlpt26: ['JLPT ' + LVINFO[LV].name, '2026-12-06'], nat26: ['NAT-TEST ' + LVINFO[LV].nat, '2026-12-13'], jlpt27: ['JLPT ' + LVINFO[LV].name, '2027-07-04'], jlpt27d: ['JLPT ' + LVINFO[LV].name, '2027-12-05'], custom: ['Your exam', ''] };
function examInfo() { const e = EXAMS[S.set.exam] || EXAMS.jlpt26; return { name: e[0], date: S.set.exam === 'custom' ? (S.set.date || EXAMS.jlpt26[1]) : e[1] }; }
const daysLeft = () => dayNo(examInfo().date) - dayNo(today());
const SECMIN = { 1: LVINFO[LV].min[0], 2: LVINFO[LV].min[1], 3: LVINFO[LV].min[2] };
function taskMin(x) {
  if (x.t === 'lesson') return LMAP[x.id] ? LMAP[x.id].min : 15;
  if (x.t === 'mock') return x.full ? 90 : SECMIN[x.s];
  return { review: 5, listen: 8, read: 8, vault: 5, script: 5, talk: 10 }[x.t] || 5;
}
function mockDone(p, s) { return !!(S.mocks[p] && S.mocks[p][s]); }
function weakestSection() {
  let best = null;
  for (let p = 1; p <= PAPERS.length; p++) for (let s = 1; s <= 3; s++) { const r = S.mocks[p] && S.mocks[p][s]; if (r && (!best || r.pct < best.pct)) best = { p, s, pct: r.pct }; }
  return best || { p: 1, s: 1 };
}
function mockQueue(skip) {
  const used = new Set(skip || []);
  const done = (p, s) => used.has(p + ':' + s) || mockDone(p, s);
  const order = [3, 1, 2];
  let rot = S.hist.length % 3;
  return {
    next() {
      for (let t = 0; t < 3; t++) {
        const s = order[(rot++) % 3];
        for (let p = 1; p <= PAPERS.length; p++) if (!done(p, s)) { used.add(p + ':' + s); return { t: 'mock', p, s }; }
      }
      const w = weakestSection(); return { t: 'mock', p: w.p, s: w.s, retake: true };
    },
    full() {
      for (let p = 1; p <= PAPERS.length; p++) if (![1, 2, 3].some(s => done(p, s))) { [1, 2, 3].forEach(s => used.add(p + ':' + s)); return { t: 'mock', p, full: true }; }
      return null;
    }
  };
}
function genPlan(from, lessons, D, mins, skipMocks) {
  const total = sum(lessons, l => l.min);
  const out = { sessions: [], learnDays: 0, mockDays: 0, tail: 0, perDay: 0, need: 0, compressed: false, total, lessons: lessons.length };
  if (D <= 0) return out;
  const tail = D >= 4 ? 1 : 0, avail = D - tail, budget = Math.max(10, mins - 8);
  const mockMin = avail >= 6 ? Math.max(2, Math.round(avail * 0.3)) : (avail >= 3 ? 1 : 0);
  let learn = total ? Math.ceil(total / budget) : 0;
  if (learn > avail - mockMin) { learn = total ? Math.max(1, avail - mockMin) : 0; out.compressed = total > learn * budget * 1.05; }
  else if (avail > 60 && total) learn = Math.max(learn, Math.min(avail - mockMin, Math.round(avail * 0.55)));
  out.learnDays = learn; out.mockDays = avail - learn; out.tail = tail;
  out.perDay = learn ? Math.round(total / learn) : 0;
  out.need = out.perDay + 8;
  const days = Array.from({ length: avail }, () => []);
  if (learn) { let cum = 0; const per = total / learn; lessons.forEach(l => { days[Math.min(learn - 1, Math.floor((cum + l.min / 2) / per))].push(l); cum += l.min; }); }
  let kanaOpen = !lessons.some(l => l.kind === 'kana' && l.s === 'h');
  const mq = mockQueue(skipMocks);
  let vi = rnd(VAULT_ALL.length), alt = 0;
  for (let d = 0; d < avail; d++) {
    const date = addDays(from, d), tasks = [];
    if (d > 0 || dueKeys().length) tasks.push({ t: 'review' });
    days[d].forEach(l => tasks.push({ t: 'lesson', id: l.id }));
    if (d >= learn) {
      if (weekday(date) === 0 && mins >= 30) { const f = mq.full(); tasks.push(f || mq.next()); } else tasks.push(mq.next());
      tasks.push({ t: 'vault', id: VAULT_ALL[(vi++) % VAULT_ALL.length].id });
    } else if (kanaOpen) {
      if (mins >= 45) tasks.push({ t: 'listen' }, { t: 'read' });
      else tasks.push({ t: (alt++) % 2 ? 'read' : 'listen' });
    }
    if (days[d].some(l => l.kind === 'kana' && l.s === 'h' && l.id === 'h5')) kanaOpen = true;
    if (!tasks.length) tasks.push({ t: 'review' });
    out.sessions.push({ date, tasks, phase: d >= learn ? 'mock' : 'learn' });
  }
  if (tail) out.sessions.push({ date: addDays(from, avail), tasks: [{ t: 'review' }, { t: 'vault', id: 'all' }, { t: 'script' }], phase: 'final' });
  return out;
}
function remainingLessons() { return planOrder().filter(l => !lessonDone(l.id)); }
function todaySession() {
  const t = today();
  if (S.today && S.today.date === t && S.today.v === S.set.exam + S.set.mins + S.set.kana + S.set.date) {
    if (!S.today.k) { // sessions saved by v1.2: lessons added after the planned tasks were 'get ahead' extras
      let seenOther = false;
      S.today.tasks.forEach(x => { if (x.t !== 'lesson' && x.t !== 'review') seenOther = true; else if (x.t === 'lesson' && seenOther) x.extra = 1; });
      S.today.k = 2; save(true);
    }
    return S.today;
  }
  const plan = genPlan(t, remainingLessons(), daysLeft(), S.set.mins);
  const first = plan.sessions[0];
  S.today = { date: t, k: 2, v: S.set.exam + S.set.mins + S.set.kana + S.set.date, tasks: (first ? first.tasks : [{ t: 'review' }]).concat([{ t: 'talk', extra: 1 }]), phase: first ? first.phase : 'after' };
  save(true);
  return S.today;
}
function futurePlan() {
  const ts = todaySession();
  const ids = ts.tasks.filter(x => x.t === 'lesson').map(x => x.id);
  const skip = [];
  ts.tasks.forEach(x => { if (x.t === 'mock') { if (x.full) [1, 2, 3].forEach(s => skip.push(x.p + ':' + s)); else skip.push(x.p + ':' + x.s); } });
  return genPlan(addDays(today(), 1), remainingLessons().filter(l => ids.indexOf(l.id) < 0), daysLeft() - 1, S.set.mins, skip);
}
function taskDone(x) {
  const d = dayRec();
  switch (x.t) {
    case 'review': return !!d.rev || dueKeys().length === 0;
    case 'lesson': return lessonDone(x.id);
    case 'listen': return (d.lis || 0) > 0;
    case 'read': return (d.rd || 0) > 0;
    case 'mock': return x.full ? [1, 2, 3].every(s => mockDone(x.p, s) && S.mocks[x.p][s].d === today()) : (x.retake ? !!(S.mocks[x.p] && S.mocks[x.p][x.s] && S.mocks[x.p][x.s].d === today()) : mockDone(x.p, x.s));
    case 'vault': return !!d.vt;
    case 'script': return !!d.scr;
    case 'talk': return !!d.tk;
  }
  return false;
}
function taskLabel(x) {
  switch (x.t) {
    case 'review': { const n = dueKeys().length; return ['Review due cards', n ? plural(n, 'card') + ' waiting' : 'Nothing due right now']; }
    case 'lesson': { const l = LMAP[x.id]; return l ? [l.title, KINDNAME[l.kind] + ' · ' + l.sub] : ['Lesson', '']; }
    case 'listen': return ['Listening drill', '4 real-format audio questions'];
    case 'read': return ['Reading drill', 'One timed passage from a mock paper'];
    case 'mock': return x.full ? ['Full mock: paper ' + x.p, 'All three sections, timed like the real test'] : [(x.retake ? 'Retake: paper ' : 'Mock paper ') + x.p + ' · section ' + x.s, SECNAME[x.s] + ' · ' + SECMIN[x.s] + ' min'];
    case 'vault': return x.id === 'all' ? ['Vault quick pass', 'Skim every cheat sheet once'] : ['Cheat sheet: ' + (VSET[x.id] ? VSET[x.id].title : ''), 'Cover the answers and recite'];
    case 'script': return ['Exam-day script', 'What to pack, when to arrive, how to pace'];
    case 'talk': return ['Talk workout', 'Core words, a pattern drill and a mission · 10 min'];
  }
  return ['Task', ''];
}
const SECNAME = { 1: 'Vocabulary', 2: 'Grammar & reading', 3: 'Listening' };
function checkSession() {
  const ts = todaySession(), d = dayRec();
  if (d.sess || !ts.tasks.length) return;
  if (ts.tasks.filter(x => !x.extra).every(taskDone)) { d.sess = 1; save(); gainXP(40); setTimeout(sessionPop, 600); }
}
