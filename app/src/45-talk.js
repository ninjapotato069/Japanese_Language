/* ===== 45 · Talk: speak from day one =====
   Built on the methods government language schools use to get people speaking fast:
   core vocabulary first (the most frequent words), anticipation (say it before you hear it, then check),
   shadowing (repeat straight after the voice), speech islands (prepared monologues about yourself),
   substitution drills (one frame, many fillers) and role-play missions. Talk progress is shared by every level. */
const TK = () => S.talk || (S.talk = {});
const tkPart = k => TK()[k] || (TK()[k] = {});
const READING_N = {};
FREQ.forEach(w => { READING_N[w.r] = (READING_N[w.r] || 0) + 1; });
FREQ.forEach((w, i) => { ITEMS['f:' + w.w] = { kind: 'freq', i, w: w.w, r: w.r, m: w.m, x: w.x, cv: w.cv }; });
const firstMeaning = m => String(m).split(/[;,]/)[0].trim().toLowerCase();
const CORE_BATCH = 20;
const coreBatches = () => Math.ceil(FREQ.length / CORE_BATCH);
const coreKeys = b => FREQ.slice(b * CORE_BATCH, (b + 1) * CORE_BATCH).map(w => 'f:' + w.w);
const coreLearned = () => FREQ.filter(w => S.srs['f:' + w.w]).length;
function talkScore() { return { done: coreLearned(), total: FREQ.length }; }
/* share of everyday Japanese text you can follow: the words learned from the top of the list, without gaps */
function coreCoverage() {
  let n = 0;
  while (n < FREQ.length && S.srs['f:' + FREQ[n].w]) n++;
  return { n, cv: n ? FREQ[n - 1].cv : 0 };
}
const say = (text, alt) => TTS.speak(text, alt ? { alt: true } : {});
const shadowGap = t => 900 + String(t).length * 170;

/* review-deck questions and cards for core words */
function qFreq(it, mode) {
  const key = 'f:' + it.w, fm = firstMeaning(it.m);
  const near = FREQ.slice(Math.max(0, it.i - 60), it.i + 60).filter(x => x.w !== it.w && firstMeaning(x.m) !== fm);
  const rest = FREQ.filter(x => x.w !== it.w && firstMeaning(x.m) !== fm);
  const w = it.w + (it.r !== it.w ? '（' + it.r + '）' : '') + ' = ' + it.m;
  mode = mode || pick(['listen', 'mean', 'jp']);
  if (mode === 'listen' && READING_N[it.r] > 1) mode = 'mean';
  if (mode === 'jp') {
    const ds = fillP(it.w, [near.filter(x => x.r !== it.r).map(x => x.w), rest.map(x => x.w)], 3);
    return mk({ k: key, ask: 'Which word means this?', q: it.m, qc: 'mid', o: [it.w].concat(ds), oc: 'jp', w, say: it.r });
  }
  const ds = fillP(it.m, [near.filter(x => x.r !== it.r).map(x => x.m), rest.map(x => x.m)], 3);
  if (mode === 'listen') return mk({ k: key, ask: 'What does it mean?', q: '', audio: it.r, o: [it.m].concat(ds), w, say: it.r });
  return mk({ k: key, ask: 'What does it mean?', q: it.w, qc: 'large', meta: it.r !== it.w ? it.r : '', o: [it.m].concat(ds), w, say: it.r });
}
function freqCard(k) {
  const it = ITEMS[k];
  return { key: k, front: [h('div', { class: 'big glyph', style: it.w.length > 3 ? 'font-size:44px' : null }, it.w), it.r !== it.w ? h('div', { class: 'sub' }, it.r) : null],
    back: [h('div', { class: 'mid', style: 'font:700 22px/1.3 var(--f-ui)' }, it.m), it.r !== it.w ? h('div', { class: 'sub' }, it.w + ' · ' + it.r) : null,
      it.x ? h('div', { class: 'sub', style: 'font-size:15px;margin-top:8px' }, it.x[0]) : null, it.x ? h('div', { class: 'sub', style: 'font-size:12px' }, it.x[1]) : null], say: it.r };
}

/* ---------- Anticipation: see the English, say the Japanese in the pause, then hear it and grade yourself ----------
   items: { cue, jp, kana?, say?, note?, key?, fresh? }. A fresh item is first heard and repeated (shadowing),
   then comes back three items later as a real anticipation prompt. */
function Anticipate(items, o) {
  o = o || {};
  const queue = items.map(x => Object.assign({}, x)), total = items.length;
  const root = h('div', { class: 'antic' });
  let done = 0, said = 0, cur = null, revealed = false;
  const gap = o.gap || 3500;
  function grade(good) {
    const it = queue.shift();
    if (it.fresh) { it.fresh = false; queue.splice(Math.min(3, queue.length), 0, it); draw(); return; }
    if (it.key) { if (!S.srs[it.key]) { if (good) srsAdd(it.key); } else srsGrade(it.key, good); }
    if (!good && !it.again) { it.again = true; queue.splice(Math.min(4, queue.length), 0, it); }
    else { done++; if (good) said++; }
    if (good) { SFX.ok(); gainXP(1, true); } else SFX.tick();
    save(true);
    draw();
  }
  function reveal() {
    if (revealed || !cur) return;
    revealed = true;
    cur.box.classList.add('shown');
    cur.ans.hidden = false; cur.go.hidden = true; cur.grade.hidden = false;
    TTS.say(cur.it.say || cur.it.kana || cur.it.jp);
  }
  function draw() {
    root.innerHTML = ''; revealed = false; TTS.stop();
    if (!queue.length) return finish();
    const it = queue[0];
    const head = h('div', { class: 'qhead' }, h('span', { class: 'cnt' }, Math.min(done + 1, total) + '/' + total), bar(done / total), it.again ? h('span', { class: 'pill warn' }, 'Again') : null);
    const ans = h('div', { class: 'ans', hidden: true }, h('div', { class: 'jp' }, it.jp), it.kana && it.kana !== it.jp ? h('div', { class: 'kana' }, it.kana) : null,
      h('div', { class: 'row', style: 'justify-content:center' }, sayBtn(it.say || it.kana || it.jp)));
    const box = h('div', { class: 'card stage' + (it.fresh ? ' fresh' : '') },
      h('div', { class: 'mode' }, it.fresh ? 'New · listen, then repeat out loud' : 'Say it in Japanese'),
      h('div', { class: 'cue' }, it.cue), it.note ? h('div', { class: 'note-in' }, it.note) : null,
      it.fresh ? null : h('div', { class: 'meter', 'aria-hidden': 'true' }, h('i', { style: 'animation-duration:' + gap + 'ms' })), ans);
    const go = h('button', { class: 'btn primary', type: 'button', onclick: reveal }, 'Show me');
    const gradeRow = h('div', { class: 'row grade', hidden: true },
      it.fresh ? h('button', { class: 'btn primary', type: 'button', onclick: () => grade(true) }, 'I repeated it', ico('next'))
        : [h('button', { class: 'btn', type: 'button', onclick: () => grade(false) }, 'Missed it'), h('button', { class: 'btn primary', type: 'button', onclick: () => grade(true) }, ico('check'), 'I said it')]);
    cur = { it, box, ans, go, grade: gradeRow };
    root.append(head, box, h('div', { class: 'row', style: 'justify-content:center' }, go, gradeRow));
    if (it.fresh) reveal();
    else later(gap, reveal, box);
  }
  function finish() {
    TTS.stop();
    const extra = o.onDone ? o.onDone(said, total) : null;
    root.append(h('div', { class: 'card result' }, h('div', { class: 'score' }, said + '/' + total), h('div', { class: 'mute' }, 'said in time, first or second try'),
      h('div', { class: 'row', style: 'justify-content:center' }, extra || null)));
    SFX.win();
  }
  onKey(root, e => {
    if (!cur || !queue.length) return;
    if ((e.key === ' ' || e.key === 'Enter') && !revealed) { e.preventDefault(); reveal(); }
    else if (revealed && (e.key === 'ArrowRight' || e.key === 'g')) grade(true);
    else if (revealed && (e.key === 'ArrowLeft' || e.key === 'a') && !cur.it.fresh) grade(false);
  });
  draw();
  return root;
}

/* hands-free: the voice reads each line, then leaves a pause for you to repeat it */
function ShadowPlayer(lines, label) {
  const list = h('ol', { class: 'shadow-list' }, lines.map(l => h('li', {}, h('span', { class: 'jp' }, l.jp), l.en ? h('span', { class: 'en' }, l.en) : null)));
  const btn = h('button', { class: 'btn', type: 'button' }, ico('play'), label || 'Play hands-free');
  let playing = false;
  btn.onclick = async () => {
    if (playing) { TTS.stop(); return; }
    playing = true; btn.innerHTML = ''; btn.append(ico('stop'), 'Stop');
    const seq = lines.map(l => ({ t: l.say || l.jp, gap: shadowGap(l.jp), alt: l.alt }));
    await TTS.play(seq, i => list.querySelectorAll('li').forEach((li, j) => li.classList.toggle('on', j === i)));
    playing = false; btn.innerHTML = ''; btn.append(ico('play'), label || 'Play hands-free');
    list.querySelectorAll('li').forEach(li => li.classList.remove('on'));
  };
  return h('div', { class: 'stack', style: 'gap:8px' }, h('div', { class: 'row' }, btn, h('span', { class: 'small mute' }, 'Repeat each line in the pause after it.')), list);
}

/* ---------- islands ---------- */
function islandVal(isl, slotId) {
  const v = (tkPart('isl')[isl.id] || {}).v || {}, sl = isl.slots.find(s => s.id === slotId);
  if (v[slotId]) return v[slotId];
  if (sl && sl.opts.length) return { jp: sl.opts[0][0], en: sl.opts[0][1], auto: true };
  return { jp: '', en: '' };
}
function islandLines(isl) {
  const fill = (t, part) => t.replace(/\{(\w+)\}/g, (m, id) => { const v = islandVal(isl, id); return (part === 'jp' ? v.jp : v.en) || '＿＿'; });
  return isl.lines.map(l => ({ jp: fill(l[0], 'jp'), en: fill(l[1], 'en') }));
}
function islandReady(isl) { return ((tkPart('isl')[isl.id] || {}).r || 0) >= 3; }

/* ---------- missions: a role-play, partner lines spoken, your lines prompted in English ---------- */
function Mission(M, o) {
  o = o || {};
  const root = h('div', { class: 'stack' }), chat = h('div', { class: 'chat', 'aria-live': 'polite' });
  const showJp = o.showJp !== false;
  let k = 0, mine = 0, said = 0, stopped = false;
  const total = M.lines.filter(l => l[0] === 'B').length;
  root.append(chat);
  onLeave(() => { stopped = true; });
  async function step() {
    if (stopped || !root.isConnected) return;
    if (k >= M.lines.length) return finish();
    const [who, jp, en] = M.lines[k];
    if (who === 'A') {
      const jpEl = h('div', { class: 'jp', hidden: !showJp }, jp), enEl = h('div', { class: 'en', hidden: !showJp }, en);
      const b = h('div', { class: 'bub them' }, h('div', { class: 'who' }, 'Them'), jpEl, enEl,
        showJp ? null : h('button', { class: 'linkish', type: 'button', onclick: e => { jpEl.hidden = false; enEl.hidden = false; e.currentTarget.remove(); } }, 'Show what they said'));
      chat.append(b); b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      await say(jp, true);
      await sleep(350);
      k++; step();
    } else {
      mine++;
      const ans = h('div', { class: 'jp', hidden: true }, jp);
      const ctl = h('div', { class: 'row' });
      const b = h('div', { class: 'bub me pending' }, h('div', { class: 'who' }, 'You · line ' + mine + ' of ' + total), h('div', { class: 'en' }, en), ans, ctl);
      const done = good => { if (good) said++; ctl.remove(); b.classList.remove('pending'); b.classList.add(good ? 'ok' : 'miss'); k++; step(); };
      const show = () => { ans.hidden = false; ctl.innerHTML = ''; say(jp);
        ctl.append(h('button', { class: 'btn small', type: 'button', onclick: () => done(false) }, 'Missed it'), h('button', { class: 'btn small primary', type: 'button', onclick: () => done(true) }, ico('check'), 'I said it')); };
      ctl.append(h('span', { class: 'small mute' }, 'Say it out loud, then'), h('button', { class: 'btn small primary', type: 'button', onclick: show }, 'Check'));
      chat.append(b); b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
  function finish() {
    const r = tkPart('mis')[M.id] || (tkPart('mis')[M.id] = {});
    r.best = Math.max(r.best || 0, said); r.n = (r.n || 0) + 1; r.d = today(); r.of = total;
    gainXP(10); save();
    const extra = o.onDone ? o.onDone(said, total) : null;
    root.append(h('div', { class: 'card result' }, h('div', { class: 'stamp pop' + (said >= total * 0.8 ? '' : ' fail'), style: 'font-size:22px' }, said >= total * 0.8 ? '任務完了' : 'もう一回'),
      h('div', { class: 'score' }, said + '/' + total), h('div', { class: 'mute' }, 'of your lines said without looking'),
      h('div', { class: 'row', style: 'justify-content:center' }, h('button', { class: 'btn', type: 'button', onclick: () => root.replaceWith(Mission(M, o)) }, ico('replay'), 'Run it again'), extra)));
    SFX.win();
  }
  later(250, step, root);
  return root;
}

/* ---------- screens ---------- */
const TALK_SECTIONS = [
  ['核', 'Core 1,000', 'core', () => { const c = coreCoverage(); return coreLearned() + ' of ' + FREQ.length + ' words · you follow ' + Math.round(c.cv * 100) + '% of everyday text'; }],
  ['島', 'Speech islands', 'islands', () => TALK.islands.filter(islandReady).length + ' of ' + TALK.islands.length + ' ready · short talks about you, learned by heart'],
  ['術', 'Survival tactics', 'tactics', () => TALK.tactics.length + ' toolkits · stall, ask again, rephrase, steer'],
  ['型', 'Pattern drills', 'tdrills', () => TALK.drills.length + ' frames · swap one word, say the whole sentence'],
  ['任', 'Missions', 'missions', () => Object.keys(tkPart('mis')).length + ' of ' + TALK.missions.length + ' run · role-plays from shop counter to job interview']
];
view('talk', 'talk', () => {
  const root = h('div', { class: 'stack' }), d = dayRec();
  root.append(head('Talk', 'Speak from day one. Ten minutes a day on the methods used to get diplomats and soldiers talking fast.', '話 Talk'));
  const c = coreCoverage();
  root.append(h('div', { class: 'card stack talk-hero' },
    h('div', { class: 'row', style: 'justify-content:space-between;align-items:flex-start' },
      h('div', { class: 'stack', style: 'gap:2px' }, h('h2', {}, d.tk ? 'Today’s workout is done' : 'Today’s workout'),
        h('p', { class: 'small mute', style: 'margin:0' }, d.tk ? 'Run it again or pick any drill below.' : 'Core words, one pattern drill and one mission. About ten minutes.')),
      h('span', { class: 'pill ' + (d.tk ? 'good' : 'gold') }, d.tk ? '✓ done' : '10 min')),
    coverageBand(c),
    h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: () => go('talkdaily') }, d.tk ? 'Again' : 'Start', ico('next')))));
  root.append(h('div', { class: 'list' }, TALK_SECTIONS.map(s => h('button', { class: 'li', type: 'button', onclick: () => go(s[2]) }, markEl(s[0]), h('span', { class: 'body' }, h('b', {}, s[1]), h('span', {}, s[3]())), h('span', { class: 'end' }, ico('next'))))));
  root.append(h('details', { class: 'card method' }, h('summary', {}, 'How these methods work'),
    h('dl', {},
      h('dt', {}, 'Core vocabulary first'), h('dd', {}, 'A few hundred words make up most of what people say. The Core 1,000 list is ranked by how often each word really appears, so every word you learn pays off at once.'),
      h('dt', {}, 'Anticipation'), h('dd', {}, 'You see the English, say the Japanese in the pause, then hear the right answer. Pulling a word out of memory fixes it far better than reading it again. Pimsleur built his courses on this, together with spaced reviews.'),
      h('dt', {}, 'Speech islands'), h('dd', {}, 'Short talks about yourself, learned until they come out without thinking. Boris Shekhtman used them to train diplomats and journalists: steer the talk to your island and you sound fluent while you rest.'),
      h('dt', {}, 'Pattern drills'), h('dd', {}, 'One sentence frame, many fillers, said fast until the frame is automatic. This is the drill style of the Army Method that trained US soldiers in WWII.'),
      h('dt', {}, 'Shadowing and missions'), h('dd', {}, 'Repeat straight after the voice to copy its rhythm, then play your part in real situations with no script in front of you.'))));
  return root;
});
function coverageBand(c) {
  const pct = Math.round(c.cv * 100);
  const marks = [100, 300, 600, 1000].filter(n => n <= FREQ.length).map(n => [n, FREQ[n - 1].cv]);
  return h('div', { class: 'cov', role: 'img', 'aria-label': 'You follow about ' + pct + '% of the words in everyday Japanese text' },
    h('div', { class: 'cov-bar' }, h('i', { style: 'width:' + pct + '%' }), marks.map(m => h('b', { style: 'left:' + Math.round(m[1] * 100) + '%', title: m[0] + ' words' }))),
    h('div', { class: 'cov-key small' }, marks.map(m => h('span', {}, h('b', {}, m[0].toLocaleString('en')), ' words → ' + Math.round(m[1] * 100) + '%'))),
    h('div', { class: 'small mute' }, c.n ? 'You know the top ' + c.n + ' words in a row: about ' + pct + '% of the words in an everyday Japanese text, counting particles and endings.' : 'Learn the first 20 words and you already know about ' + Math.round(FREQ[Math.min(19, FREQ.length - 1)].cv * 100) + '% of the words in an everyday Japanese text, counting particles and endings.'));
}
view('core', 'talk', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Core 1,000', 'The most frequent words in everyday Japanese, ranked by how often they are used in subtitles, news, books and the web. Twenty at a time: listen, say, check.', '核 Core'));
  root.append(h('div', { class: 'card stack' }, coverageBand(coreCoverage())));
  const list = h('div', { class: 'list' });
  for (let b = 0; b < coreBatches(); b++) {
    const keys = coreKeys(b), got = keys.filter(k => S.srs[k]).length, first = FREQ[b * CORE_BATCH], last = FREQ[Math.min(FREQ.length, (b + 1) * CORE_BATCH) - 1];
    const done = (tkPart('cb')[b] || 0) || got === keys.length;
    list.append(h('button', { class: 'li', type: 'button', onclick: () => go('coreset', { b }) }, h('span', { class: 'mark num', style: 'font-size:13px' }, String(b + 1)),
      h('span', { class: 'body' }, h('b', {}, FREQ.slice(b * CORE_BATCH, b * CORE_BATCH + 5).map(w => w.w).join('　') + ' …'), h('span', {}, 'Words ' + (b * CORE_BATCH + 1) + '–' + Math.min(FREQ.length, (b + 1) * CORE_BATCH) + ' · up to ' + Math.round(last.cv * 100) + '% coverage')),
      h('span', { class: 'end' }, done ? h('span', { class: 'pill good' }, ico('check')) : got ? h('span', { class: 'pill gold' }, got + '/' + keys.length) : h('span', { class: 'pill' }, 'New'))));
  }
  root.append(list);
  return root;
});
view('coreset', 'talk', p => {
  const b = clamp(+p.b || 0, 0, coreBatches() - 1), keys = coreKeys(b), root = h('div', { class: 'stack' });
  root.append(head('Core words ' + (b * CORE_BATCH + 1) + '–' + Math.min(FREQ.length, (b + 1) * CORE_BATCH), 'Listen and repeat each word, then say it from the English, then check by ear.', '核 Core · set ' + (b + 1)));
  const steps = h('div', { class: 'steps', role: 'tablist' }), body = h('div', { class: 'stack' });
  root.append(steps, body);
  const names = [['聞く', 'Listen'], ['言う', 'Say'], ['確認', 'Check']];
  let step = p.step || 1;
  function drawSteps() {
    steps.innerHTML = '';
    names.forEach((nm, i) => steps.append(h('button', { role: 'tab', type: 'button', 'aria-selected': String(i + 1 === step), onclick: () => show(i + 1) }, h('b', {}, nm[0]), h('span', {}, (i + 1) + ' · ' + nm[1]))));
  }
  function show(n) {
    step = n; drawSteps(); body.innerHTML = ''; TTS.stop();
    if (n === 1) body.append(Cards(keys.map(freqCard), () => show(2), 'Next: say them'));
    else if (n === 2) body.append(Anticipate(shuffle(keys).map(k => { const it = ITEMS[k]; return { key: k, cue: it.m, jp: it.w, kana: it.r, say: it.r }; }), { onDone: () => [h('button', { class: 'btn pink', type: 'button', onclick: () => show(3) }, 'Next: check by ear', ico('next'))] }));
    else body.append(Quiz(shuffle(keys).map(k => qFreq(ITEMS[k], READING_N[ITEMS[k].r] > 1 ? 'mean' : 'listen')), { pass: 80, loop: true, passText: 'Set complete. These words now come back in your review deck.',
      onFinish: () => { tkPart('cb')[b] = 1; keys.forEach(srsAdd); save(); return [b + 1 < coreBatches() ? h('button', { class: 'btn pink', type: 'button', onclick: () => swap('coreset', { b: b + 1 }) }, 'Next 20 words', ico('next')) : null, h('button', { class: 'btn', type: 'button', onclick: () => back() }, 'Back to Core 1,000')]; } }));
    window.scrollTo(0, 0);
  }
  show(step);
  return root;
});
view('islands', 'talk', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Speech islands', 'Five short talks about you. Fill in your details once, then rehearse each one until it comes out without thinking. In a real conversation, steer towards an island and speak with confidence.', '島 Islands'));
  root.append(h('div', { class: 'list' }, TALK.islands.map(isl => { const r = (tkPart('isl')[isl.id] || {}).r || 0;
    return h('button', { class: 'li', type: 'button', onclick: () => go('island', { id: isl.id }) }, markEl('島'), h('span', { class: 'body' }, h('b', {}, isl.title), h('span', {}, isl.why)),
      h('span', { class: 'end' }, islandReady(isl) ? h('span', { class: 'pill good' }, ico('check'), ' ready') : r ? h('span', { class: 'pill gold' }, r + '/3 runs') : h('span', { class: 'pill' }, 'New'))); })));
  return root;
});
view('island', 'talk', p => {
  const isl = TALK.islands.find(x => x.id === p.id) || TALK.islands[0], root = h('div', { class: 'stack' });
  const rec = () => tkPart('isl')[isl.id] || (tkPart('isl')[isl.id] = {});
  root.append(head(isl.title, isl.why, '島 Island'));
  const script = h('div', { class: 'stack', style: 'gap:6px' });
  const drawScript = () => { script.innerHTML = ''; islandLines(isl).forEach(l => script.append(h('div', { class: 'line' }, sayBtn(l.jp), h('div', { style: 'min-width:0' }, h('div', { class: 'jp' }, l.jp), h('div', { class: 'small mute' }, l.en))))); };
  const form = h('div', { class: 'card stack' }, h('h3', {}, 'Your details'));
  isl.slots.forEach(sl => {
    const v = islandVal(isl, sl.id);
    form.append(h('label', { class: 'fl', for: 'isl-' + isl.id + '-' + sl.id }, sl.label));
    if (sl.free) {
      form.append(h('input', { class: 'field', id: 'isl-' + isl.id + '-' + sl.id, value: v.jp || '', placeholder: sl.id === 'name' ? 'Your name, in katakana if you can (ロハン)' : 'Type it as you would say it',
        oninput: e => { const r = rec(); r.v = r.v || {}; r.v[sl.id] = { jp: e.target.value.trim(), en: e.target.value.trim() }; save(true); drawScript(); } }));
    } else {
      form.append(chipset(sl.opts.map(o => [o[0], o[1]]), v.auto ? null : v.jp, val => { const o = sl.opts.find(x => x[0] === val), r = rec(); r.v = r.v || {}; r.v[sl.id] = { jp: o[0], en: o[1] }; save(); drawScript(); }));
    }
  });
  drawScript();
  root.append(form, h('div', { class: 'card stack' }, h('h3', {}, 'Your island'), script));
  const r = rec().r || 0;
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Rehearse'), h('p', { class: 'small mute', style: 'margin:0' }, (islandReady(isl) ? 'Ready. Keep it warm with one run a week. ' : 'Three clean runs and it counts as ready. ') + 'Runs so far: ' + r + '.'),
    h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: () => practise() }, 'Rehearse line by line', ico('next'))), ShadowPlayer(islandLines(isl), 'Play it hands-free')));
  function practise() {
    root.innerHTML = '';
    root.append(head(isl.title, 'Say each line from the English. Then hear it and grade yourself.', '島 Rehearsal'));
    root.append(Anticipate(islandLines(isl).map(l => ({ cue: l.en, jp: l.jp })), { gap: 5000, onDone: (said, total) => { const x = rec(); if (said >= total - 1) x.r = (x.r || 0) + 1; x.d = today(); gainXP(5); save(); return [h('button', { class: 'btn pink', type: 'button', onclick: () => swap('island', { id: isl.id }) }, 'Back to the island')]; } }));
  }
  return root;
});
view('tactics', 'talk', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Survival tactics', 'What fluent speakers do when they get stuck: fill the silence, ask again, check, rephrase, steer. Learn these first and no conversation leaves you frozen.', '術 Tactics'));
  root.append(h('div', { class: 'list' }, TALK.tactics.map(t => h('button', { class: 'li', type: 'button', onclick: () => go('tactic', { id: t.id }) }, markEl('術'), h('span', { class: 'body' }, h('b', {}, t.title), h('span', {}, t.why)), h('span', { class: 'end' }, (tkPart('tac')[t.id] ? h('span', { class: 'pill good' }, ico('check')) : h('span', { class: 'pill' }, t.lines.length + ' phrases')))))));
  return root;
});
view('tactic', 'talk', p => {
  const t = TALK.tactics.find(x => x.id === p.id) || TALK.tactics[0], root = h('div', { class: 'stack' });
  root.append(head(t.title, t.why, '術 Tactic'));
  root.append(h('div', { class: 'card stack', style: 'gap:6px' }, t.lines.map(l => h('div', { class: 'line' }, sayBtn(l[0]), h('div', { style: 'min-width:0' }, h('div', { class: 'jp' }, l[0]), h('div', { class: 'small' }, l[1]), l[2] ? h('div', { class: 'small mute' }, l[2]) : null)))));
  root.append(h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: () => { root.innerHTML = ''; root.append(head(t.title, 'Say each phrase from its meaning.', '術 Drill'), Anticipate(shuffle(t.lines).map(l => ({ cue: l[1], note: l[2], jp: l[0] })), { onDone: () => { tkPart('tac')[t.id] = 1; save(); return [h('button', { class: 'btn pink', type: 'button', onclick: () => back() }, 'Back to tactics')]; } })); } }, 'Drill these', ico('next'))));
  root.append(ShadowPlayer(t.lines.map(l => ({ jp: l[0], en: l[1] }))));
  return root;
});
const drillLines = d => d.subs.map(s => ({ jp: d.f.replace('＿', s[0]), en: d.en.replace('_', s[1]) }));
view('tdrills', 'talk', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Pattern drills', 'One frame, five fillers. Say the whole sentence each time, fast, until the frame comes out by itself.', '型 Drills'));
  root.append(h('div', { class: 'list' }, TALK.drills.map((d, i) => h('button', { class: 'li', type: 'button', onclick: () => go('tdrill', { i }) }, markEl('型'),
    h('span', { class: 'body' }, h('b', { class: 'jp' }, d.f), h('span', {}, d.en)), h('span', { class: 'end' }, tkPart('drl')[i] ? h('span', { class: 'pill good' }, ico('check')) : h('span', { class: 'pill' }, d.subs.length))))));
  return root;
});
view('tdrill', 'talk', p => {
  const i = clamp(+p.i || 0, 0, TALK.drills.length - 1), d = TALK.drills[i], root = h('div', { class: 'stack' });
  root.append(head(d.f, d.en, '型 Drill ' + (i + 1) + ' of ' + TALK.drills.length));
  root.append(Anticipate(shuffle(drillLines(d)).map(l => ({ cue: l.en, jp: l.jp })), { onDone: () => { tkPart('drl')[i] = 1; save(); return [i + 1 < TALK.drills.length ? h('button', { class: 'btn pink', type: 'button', onclick: () => swap('tdrill', { i: i + 1 }) }, 'Next drill', ico('next')) : null, h('button', { class: 'btn', type: 'button', onclick: () => back() }, 'All drills')]; } }));
  root.append(h('details', { class: 'card' }, h('summary', {}, 'All five sentences, hands-free'), ShadowPlayer(drillLines(d))));
  return root;
});
view('missions', 'talk', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Missions', 'Role-plays of real situations. The other person speaks; you play your part from an English prompt, out loud, then check. One star is easy, three is a real test.', '任 Missions'));
  root.append(h('div', { class: 'list' }, TALK.missions.map(m => { const r = tkPart('mis')[m.id];
    return h('button', { class: 'li', type: 'button', onclick: () => go('mission', { id: m.id }) }, markEl('任'), h('span', { class: 'body' }, h('b', {}, m.title), h('span', {}, '★'.repeat(m.lv) + '☆'.repeat(3 - m.lv) + ' · ' + m.set)),
      h('span', { class: 'end' }, r ? h('span', { class: 'pill ' + (r.best >= (r.of || 1) * 0.8 ? 'good' : 'gold') }, r.best + '/' + r.of) : h('span', { class: 'pill' }, 'New'))); })));
  return root;
});
view('mission', 'talk', p => {
  const M = TALK.missions.find(x => x.id === p.id) || TALK.missions[0], root = h('div', { class: 'stack' });
  const hard = !!p.hard;
  root.append(head(M.title, M.set, '任 Mission · ' + '★'.repeat(M.lv) + '☆'.repeat(3 - M.lv)));
  root.append(h('div', { class: 'seg', role: 'group' }, [['play', 'Play your part'], ['hard', 'Ears only'], ['listen', 'Listen through']].map(x => h('button', { type: 'button', 'aria-pressed': String((p.mode || 'play') === x[0]), onclick: () => swap('mission', { id: M.id, mode: x[0], hard: x[0] === 'hard' ? 1 : 0 }) }, x[1]))));
  if (p.mode === 'listen') root.append(ShadowPlayer(M.lines.map(l => ({ jp: l[1], en: (l[0] === 'A' ? 'Them: ' : 'You: ') + l[2], alt: l[0] === 'A' })), 'Play the conversation'));
  else root.append(Mission(M, { showJp: !hard }));
  return root;
});

/* ---------- today's ten-minute workout ---------- */
function workoutWords() {
  const t = dayNo(today());
  const due = FREQ.filter(w => { const r = S.srs['f:' + w.w]; return r && r[1] <= t; }).slice(0, 6).map(w => 'f:' + w.w);
  const fresh = FREQ.filter(w => !S.srs['f:' + w.w]).slice(0, Math.max(3, 8 - due.length)).map(w => 'f:' + w.w);
  return due.map(k => ({ k, fresh: false })).concat(fresh.map(k => ({ k, fresh: true })));
}
view('talkdaily', 'talk', p => {
  const root = h('div', { class: 'stack' }), n = dayNo(today());
  const drill = TALK.drills[n % TALK.drills.length];
  const mis = TALK.missions.slice().sort((a, b) => ((tkPart('mis')[a.id] || {}).n || 0) - ((tkPart('mis')[b.id] || {}).n || 0) || a.lv - b.lv)[0];
  root.append(head('Talk workout', 'Three short rounds. Speak out loud every time: whispering counts, thinking it does not.', '話 ' + fmtDate(today())));
  const box = h('div', { class: 'stack' });
  root.append(box);
  const rounds = [
    ['Core words', () => Anticipate(workoutWords().map(x => { const it = ITEMS[x.k]; return { key: x.k, cue: it.m, jp: it.w, kana: it.r, say: it.r, fresh: x.fresh }; }), { onDone: () => nextBtn(1) })],
    ['Pattern drill: ' + drill.f, () => Anticipate(shuffle(drillLines(drill)).map(l => ({ cue: l.en, jp: l.jp })), { onDone: () => nextBtn(2) })],
    ['Mission: ' + mis.title, () => Mission(mis, { onDone: () => { finish(); return [h('button', { class: 'btn pink', type: 'button', onclick: () => tab('talk') }, 'Done')]; } })]
  ];
  const dots = h('ol', { class: 'rounds' }, rounds.map((r, i) => h('li', { 'data-i': i }, r[0])));
  root.insertBefore(dots, box);
  function nextBtn(i) { return [h('button', { class: 'btn pink', type: 'button', onclick: () => run(i) }, 'Round ' + (i + 1) + ': ' + rounds[i][0], ico('next'))]; }
  function run(i) {
    box.innerHTML = ''; TTS.stop();
    dots.querySelectorAll('li').forEach((li, j) => { li.classList.toggle('on', j === i); li.classList.toggle('ok', j < i); });
    box.append(rounds[i][1]());
    window.scrollTo(0, 0);
  }
  function finish() {
    const d = dayRec();
    dots.querySelectorAll('li').forEach(li => { li.classList.remove('on'); li.classList.add('ok'); });
    if (!d.tk) { d.tk = 1; gainXP(15); save(); toast('Talk workout done · +15 XP', 'xp'); checkSession(); }
  }
  run(0);
  return root;
});
