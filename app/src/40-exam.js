/* ===== 40 · mocks: section model, exam engine, results, drills, listening and reading labs ===== */
const SEC = { 1: ['げんご ちしき（もじ・ごい）', 'Vocabulary', 20], 2: ['げんご ちしき（ぶんぽう）・どっかい', 'Grammar & reading', 40], 3: ['ちょうかい', 'Listening', 30] };
const INSTR = {
  kanji: ['＿＿＿の ことばは ひらがなで どう かきますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。', 'How is the underlined word read?'],
  hyoki: ['＿＿＿の ことばは どう かきますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。', 'How is the underlined word written?'],
  bunmyaku: ['（　　）に なにが はいりますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。', 'Which word fits the blank?'],
  iikae: ['＿＿＿の ぶんと だいたい おなじ いみの ぶんが あります。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。', 'Which sentence means about the same as the underlined one?'],
  bunpo: ['（　　）に 何を 入れますか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。', 'Which word or form fits the blank?'],
  kumitate: ['★に 入る ものは どれですか。１・２・３・４から いちばん いい ものを 一つ えらんで ください。', 'Put the four pieces in order. Which one lands on ★?'],
  bunsho: ['<span class="bx">14</span>から<span class="bx">17</span>に 何を 入れますか。ぶんしょうの いみを かんがえて、１・２・３・４から いちばん いい ものを 一つ えらんで ください。', 'Fill each numbered box in the passage.'],
  tanbun: ['つぎの （１）と （２）の ぶんしょうを 読んで、しつもんに こたえて ください。こたえは、１・２・３・４から いちばん いい ものを 一つ えらんで ください。', 'Read each short text and answer.'],
  chubun: ['つぎの ぶんしょうを 読んで、しつもんに こたえて ください。こたえは、１・２・３・４から いちばん いい ものを 一つ えらんで ください。', 'Read the passage and answer.'],
  joho: ['つぎの じょうほうを 見て、しつもんに こたえて ください。こたえは、１・２・３・４から いちばん いい ものを 一つ えらんで ください。', 'Find the answer in the notice or table.'],
  kadai: ['はじめに しつもんを 聞いて ください。それから 話を 聞いて、１から４の 中から、いちばん いい ものを 一つ えらんで ください。', 'Hear the question, then the talk: what will the person do or need?'],
  point: ['はじめに しつもんを 聞いて ください。それから 話を 聞いて、１から４の 中から、いちばん いい ものを 一つ えらんで ください。', 'Hear the question, then listen for the one key detail.'],
  hatsuwa: ['えを 見ながら しつもんを 聞いて ください。➡（やじるし）の 人は 何と 言いますか。１から３の 中から、いちばん いい ものを 一つ えらんで ください。', 'What does the person say in this situation? Options are spoken only.'],
  sokuji: ['えなどが ありません。ぶんを 聞いて、１から３の 中から、いちばん いい ものを 一つ えらんで ください。', 'Hear one line, then pick the best reply. Options are spoken only.']
};
if (PACK) {
  [1, 2, 3].forEach(i => { SEC[i][2] = LVINFO[LV].min[i - 1]; });
  SEC[1][0] = '言語知識（文字・語彙）'; SEC[2][0] = '言語知識（文法）・読解'; SEC[3][0] = '聴解';
  Object.assign(INSTR, {
    kanji: ['＿＿＿の言葉の読み方として最もよいものを、１・２・３・４から一つ選びなさい。', 'How is the underlined word read?'],
    hyoki: ['＿＿＿の言葉を漢字で書くとき、最もよいものを１・２・３・４から一つ選びなさい。', 'How is the underlined word written in kanji?'],
    bunmyaku: ['（　　）に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。', 'Which word fits the blank?'],
    iikae: ['＿＿＿の言葉に意味が最も近いものを、１・２・３・４から一つ選びなさい。', 'Which word is closest in meaning to the underlined one?'],
    bunpo: ['次の文の（　　）に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。', 'Which form fits the blank?'],
    kumitate: ['次の文の ★ に入る最もよいものを、１・２・３・４から一つ選びなさい。', 'Put the four pieces in order. Which one lands on ★?'],
    tanbun: ['次の文章を読んで、質問に答えなさい。答えは、１・２・３・４から最もよいものを一つ選びなさい。', 'Read each short text and answer.'],
    chubun: ['次の文章を読んで、質問に答えなさい。答えは、１・２・３・４から最もよいものを一つ選びなさい。', 'Read the passage and answer.'],
    point: ['まず質問を聞いてください。それから話を聞いて、１から４の中から、最もよいものを一つ選んでください。', 'Hear the question, then listen for the key point.'],
    sokuji: ['まず文を聞いてください。それから、それに対する返事を聞いて、１から３の中から、最もよいものを一つ選んでください。', 'Hear one line, then pick the best reply. Options are spoken only.']
  });
}
INSTR.yoho = ['次の言葉の使い方として最もよいものを、１・２・３・４から一つ選びなさい。', 'Which sentence uses the word correctly?'];
const MODELS = {};
function model(P, sec) {
  const key = P + ':' + sec;
  if (MODELS[key]) return MODELS[key];
  const D = PAPERS[P - 1], groups = [], flat = [];
  const grp = (type, mn, extra) => { const g = Object.assign({ type, mn, qs: [] }, extra || {}); groups.push(g); return g; };
  const addQ = (g, q) => { q.k = flat.length; q.no = flat.length + 1; q.type = g.type; q.g = g; q.ti = g.qs.length; g.qs.push(q); flat.push(q); };
  if (sec === 1) {
    ['kanji', 'hyoki', 'bunmyaku', 'iikae', 'yoho'].forEach(t => { const qs = D.s1.filter(q => q.t === t); if (!qs.length) return; const g = grp(t, groups.length + 1); qs.forEach(q => addQ(g, { stem: q.s, o: q.o, a: q.a, w: q.w, pts: 2 })); });
  } else if (sec === 2) {
    const s2 = D.s2;
    let g;
    if (s2.bunpo && s2.bunpo.length) { g = grp('bunpo', groups.length + 1); s2.bunpo.forEach(q => addQ(g, { stem: q.s, o: q.o, a: q.a, w: q.w, pts: 2 })); }
    if (s2.kumitate && s2.kumitate.length) { g = grp('kumitate', groups.length + 1); s2.kumitate.forEach(q => addQ(g, { stem: q.s, o: q.o, a: q.a, w: q.w, pts: 2 })); }
    if (s2.bunsho) { g = grp('bunsho', groups.length + 1, { passage: s2.bunsho }); s2.bunsho.qs.forEach(q => addQ(g, { stem: '', o: q.o, a: q.a, w: q.w, pts: 2 })); }
    if (s2.tanbun && s2.tanbun.length) { g = grp('tanbun', groups.length + 1); s2.tanbun.forEach((q, i) => addQ(g, { pre: q, pn: i + 1, stem: q.q, o: q.o, a: q.a, w: q.w, pts: 8 })); }
    if (s2.chubun) { g = grp('chubun', groups.length + 1, { passage: s2.chubun }); s2.chubun.qs.forEach(q => addQ(g, { stem: q.q, o: q.o, a: q.a, w: q.w, pts: 8 })); }
    if (s2.joho) { g = grp('joho', groups.length + 1, { passage: s2.joho }); addQ(g, { stem: s2.joho.q, o: s2.joho.o, a: s2.joho.a, w: s2.joho.w, pts: 12 }); }
  } else {
    ['kadai', 'point', 'hatsuwa', 'sokuji'].forEach(t => { const qs = D.s3[t] || []; if (!qs.length) return; const g = grp(t, groups.length + 1); qs.forEach((q, i) => addQ(g, { L: q, n: i + 1, stem: q.q || '', o: q.o, a: q.a, w: q.w, pts: 2.5 })); });
  }
  if (D.gen) { // generated papers vary in length: scale the points so that every paper is still marked out of 42 / 78 / 60
    const want = { 1: 42, 2: 78, 3: 60 }[sec], raw = sum(flat, q => q.pts);
    if (raw) flat.forEach(q => { q.pts = q.pts * want / raw; });
  }
  return (MODELS[key] = { P, sec, groups, flat, max: Math.round(sum(flat, q => q.pts) * 10) / 10 });
}
const fmtPts = x => Number.isInteger(x) ? String(x) : x.toFixed(1);
function passageHTML(g) {
  const ps = (arr) => arr.map(l => '<p>' + l + '</p>').join('');
  if (g.type === 'bunsho') { const b = g.passage; return '<div class="intro">' + b.intro + '</div>' + b.parts.map(pt => '<div class="pbox">' + (pt[0] ? '<div class="pt">' + pt[0] + '</div>' : '') + ps(String(pt[1]).split('\n')) + '</div>').join(''); }
  if (g.type === 'tanbun') { const d = g.passage; return (g.pn ? '<div class="lead"><b>（' + g.pn + '）</b> ' : '<div class="lead">') + (d.lead || '') + '</div><div class="pbox">' + ps(d.text) + '</div>'; }
  if (g.type === 'chubun') return '<div class="pbox">' + ps(g.passage.text) + '</div>';
  if (g.type === 'joho') { const j = g.passage; return '<div class="lead">' + (j.lead || '') + '</div><div class="jbox"><div class="jt">' + j.title + '</div><div class="table-wrap"><table class="jtab">' + j.table.map((r, i) => '<tr>' + r.map(c => (i === 0 ? '<th>' : '<td>') + c + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</table></div>' + (j.notes || []).map(n => '<div class="jn">' + n + '</div>').join('') + '</div>'; }
  return '';
}
const preHTML = q => q.type === 'tanbun' ? passageHTML({ type: 'tanbun', passage: q.pre, pn: q.pn }) : '';
function voiceFor(spk, order) {
  if (/^男/.test(spk)) return { p: 0.8, alt: true };
  if (/^女/.test(spk)) return { p: 1.18, alt: false };
  return order % 2 ? { p: 1.12, alt: false } : { p: 0.86, alt: true };
}
function audioSeq(q) {
  const L = q.L, t = q.type, seq = [], N = (x, gap) => seq.push({ t: x, p: 1, gap: gap == null ? 350 : gap });
  N(q.n + 'ばん。', 500);
  if (t === 'kadai' || t === 'point') {
    N(L.set, 300); N(L.q, t === 'point' ? 2200 : 900);
    const order = {}; let oi = 0;
    L.lines.forEach(l => { if (!(l[0] in order)) order[l[0]] = oi++; const v = voiceFor(l[0], order[l[0]]); seq.push({ t: l[1], p: v.p, alt: v.alt, gap: 450 }); });
    N(L.q, 0);
  } else if (t === 'hatsuwa') {
    N(L.scene, 500); N('➡の 人は 何と 言いますか。'.replace('➡', 'やじるし'), 700);
    L.o.forEach((o, i) => N((i + 1) + '、' + o, 600));
  } else {
    const v = voiceFor(L.spk, 0), r = voiceFor(/^男/.test(L.spk) ? '女' : '男', 1);
    seq.push({ t: L.u, p: v.p, alt: v.alt, gap: 700 });
    L.o.forEach((o, i) => seq.push({ t: (i + 1) + '、' + o, p: r.p, alt: r.alt, gap: 600 }));
  }
  return seq;
}
function scriptLines(q) {
  const L = q.L, t = q.type;
  if (t === 'kadai' || t === 'point') return [['', L.set], ['Q', L.q]].concat(L.lines);
  if (t === 'hatsuwa') return [['', L.scene], ['Q', '➡の 人は 何と 言いますか。']].concat(L.o.map((o, i) => [String(i + 1), o]));
  return [[L.spk, L.u]].concat(L.o.map((o, i) => [String(i + 1), o]));
}
const scriptNode = q => h('div', { class: 'script' }, scriptLines(q).map(l => h('div', {}, l[0] ? h('b', {}, l[0]) : null, l[1])));
const scriptText = q => scriptLines(q).map(l => (l[0] ? l[0] + ' ' : '') + l[1]).join('\n');
function scoreOf(m, ans) {
  let score = 0;
  const byG = m.groups.map(g => ({ type: g.type, mn: g.mn, got: 0, n: g.qs.length, pts: 0, max: sum(g.qs, q => q.pts) }));
  m.flat.forEach(q => { if (ans[q.k] === q.a) { score += q.pts; const b = byG[m.groups.indexOf(q.g)]; b.got++; b.pts += q.pts; } });
  score = Math.round(score * 10) / 10;
  byG.forEach(b => { b.pts = Math.round(b.pts * 10) / 10; b.max = Math.round(b.max * 10) / 10; });
  return { score, max: m.max, pct: m.max ? score / m.max : 0, byG };
}
function seenGet(type, P, i) { const s = S.seen[type] && S.seen[type][P]; return !!(s && s[i] === '1'); }
function seenSet(type, P, i) { const o = S.seen[type] || (S.seen[type] = {}); let s = o[P] || ''; while (s.length <= i) s += '0'; o[P] = s.slice(0, i) + '1' + s.slice(i + 1); }
function paperResult(P) {
  const r = S.mocks[P] || {};
  if (!r[1] || !r[2] || !r[3]) return null;
  const s12 = r[1].l + r[2].l, s3 = r[3].l, tot = s12 + s3;
  return { s12, s3, tot, pass: s12 >= 38 && s3 >= 19 && tot >= PASSMARK };
}
function recordAttempt(P, sec, mode, ans) {
  const m = model(P, sec), sc = scoreOf(m, ans);
  S.mocks[P] = S.mocks[P] || {};
  const r = S.mocks[P][sec] || { b: 0, n: 0 };
  r.n++; r.l = sc.score; r.b = Math.max(r.b, sc.score); r.pct = sc.pct; r.d = today(); r.m = mode; r.a = ans.join('');
  S.mocks[P][sec] = r;
  S.hist.push({ p: P, s: sec, sc: sc.score, mx: m.max, d: today(), m: mode });
  m.flat.forEach(q => { const t = S.ts[q.type] || (S.ts[q.type] = [0, 0]); t[1]++; if (ans[q.k] === q.a) t[0]++; seenSet(q.type, P, q.ti); });
  delete S.drafts[P + '-' + sec];
  save();
  gainXP(10 + Math.round(sc.pct * 40));
  checkSession();
  return sc;
}
function groupHead(g) {
  const ins = INSTR[g.type];
  return h('div', { class: 'mh' }, h('div', { class: 'ja' }, h('span', { class: 'mn' }, 'もんだい' + g.mn), h('span', { html: ins[0] })), h('div', { class: 'en' }, TYPES[g.type][1] + ' · ' + ins[1]));
}
function qMock(P, sec, k) {
  const m = model(P, sec), q = m.flat[k];
  if (!q) return null;
  const base = { k: MQ + P + ':' + sec + ':' + k, ask: TYPES[q.type][1] + ' · paper ' + P, o: q.o, a: q.a - 1, fixed: true, w: q.w, wait: true };
  if (q.L) return mk(Object.assign(base, { seq: audioSeq(q), q: q.type === 'hatsuwa' ? '<span class="scene">え</span> ' + esc(q.L.scene) : '', qh: true, qc: 'stem', hide: (q.type === 'hatsuwa' || q.type === 'sokuji') && !S.set.showOpts, scriptText: scriptText(q), script: () => scriptNode(q) }));
  const pre = q.type === 'tanbun' ? preHTML(q) : q.g.passage ? passageHTML(q.g) : '';
  return mk(Object.assign(base, { pre, q: q.type === 'bunsho' ? '<span class="bx">' + q.no + '</span> に 入る ものは どれですか。' : q.stem, qh: true, qc: 'stem' }));
}

/* ---------- exam engine ---------- */
view('exam', 'mocks', p => {
  const P = +p.p, sec = +p.s, mode = p.mode === 'practice' ? 'practice' : 'exam', m = model(P, sec), dkey = P + '-' + sec;
  const root = h('div', { class: 'stack' });
  const draft = S.drafts[dkey];
  if (draft && !p.resume && !p.fresh) {
    const answered = draft.ans.filter(Boolean).length;
    root.append(head('Paper ' + P + ' · section ' + sec, SEC[sec][1], '試 Mock'),
      h('div', { class: 'card intro-card' }, h('h2', {}, 'Unfinished attempt'), h('p', { class: 'mute', style: 'margin:0' }, answered + ' of ' + m.flat.length + ' answered' + (draft.mode === 'exam' ? ' · ' + mmss(draft.left) + ' left' : '') + ' · ' + (draft.mode === 'exam' ? 'Exam mode' : 'Practice mode')),
        h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: () => swap('exam', Object.assign({}, p, { mode: draft.mode, resume: 1 })) }, 'Resume'),
          h('button', { class: 'btn', type: 'button', onclick: () => { delete S.drafts[dkey]; save(); swap('exam', Object.assign({}, p, { fresh: 1 })); } }, 'Start over'))));
    return root;
  }
  const st = { ans: m.flat.map(() => 0), left: SEC[sec][2] * 60, el: 0, played: {}, started: false, done: false };
  if (draft && p.resume) { st.ans = draft.ans.slice(); st.left = draft.left; st.el = draft.el || 0; st.played = draft.played || {}; }
  const once = () => mode === 'exam' && S.set.once;
  const clock = h('span', { class: 'clock num' }), cnt = h('span', { class: 'small mute num' }), body = h('div', { class: 'stack' }), cards = {}, plays = {};
  function saveDraft() { if (st.done || !st.started) return; S.drafts[dkey] = { mode, ans: st.ans, left: st.left, el: st.el, played: st.played, ts: Date.now() }; save(); }
  function drawClock() { clock.textContent = mode === 'exam' ? mmss(st.left) : mmss(st.el); clock.classList.toggle('low', mode === 'exam' && st.left <= 120); }
  function drawCount() { cnt.textContent = st.ans.filter(Boolean).length + '/' + m.flat.length + ' answered'; }
  let ticks = 0;
  function tick() {
    if (!st.started || st.done || document.visibilityState === 'hidden') return;
    if (mode === 'exam') { st.left--; if (st.left <= 0) { st.left = 0; drawClock(); toast('Time is up'); submit(); return; } } else st.el++;
    drawClock();
    if (++ticks % 5 === 0) saveDraft();
  }
  function submit() {
    if (st.done) return;
    st.done = true; TTS.stop();
    recordAttempt(P, sec, mode, st.ans);
    swap('result', { p: P, s: sec, full: p.full });
  }
  function askSubmit() {
    const blank = st.ans.filter(a => !a).length;
    confirmSheet(blank ? plural(blank, 'question') + ' still blank' : 'Submit this section?', blank ? 'Wrong answers cost nothing, so guess before you submit.' : 'You will see your score and every explanation.', 'Submit', submit);
  }
  function omrSheet() {
    sheet(close => [h('h2', { class: 'verdict' }, 'Answer sheet'), h('div', { class: 'omr' }, m.flat.map(q => h('button', { type: 'button', onclick: () => { close(); const c = cards[q.k]; if (c) c.scrollIntoView({ block: 'center' }); } },
      h('span', { class: 'n' }, String(q.no)), h('span', { class: 'bb' }, q.o.map((o, i) => h('i', { class: st.ans[q.k] === i + 1 ? 'on' : '' })))))), h('button', { class: 'btn', type: 'button', onclick: close }, 'Close')]);
  }
  function choose(q, i, opts, fb) {
    if (st.done) return;
    if (mode === 'practice') {
      if (st.ans[q.k]) return;
      st.ans[q.k] = i + 1;
      const ok = i + 1 === q.a;
      opts.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (j + 1 === q.a) b.classList.add('ok'); else if (j === i) b.classList.add('no'); const tx = b.querySelector('.hidden-opt'); if (tx) { tx.textContent = q.o[j]; tx.className = ''; } });
      cards[q.k].classList.add(ok ? 'right' : 'wrong');
      if (ok) SFX.ok(); else SFX.bad();
      fb.innerHTML = '';
      fb.append(h('div', { class: 'why' }, h('b', {}, ok ? 'Correct. ' : 'Answer: ' + q.a + '. '), q.w), q.L ? scriptNode(q) : null);
    } else {
      st.ans[q.k] = st.ans[q.k] === i + 1 ? 0 : i + 1;
      opts.querySelectorAll('.opt').forEach((b, j) => b.classList.toggle('sel', st.ans[q.k] === j + 1));
    }
    drawCount(); saveDraft();
  }
  function playBtn(q) {
    const b = h('button', { class: 'playbtn', type: 'button' });
    const draw = () => { b.innerHTML = ''; if (once() && st.played[q.k]) { b.disabled = true; b.append(ico('check'), 'Played'); } else b.append(ico('play'), st.played[q.k] ? 'Play again' : 'Play'); };
    b.onclick = async () => { if (once() && st.played[q.k]) return; st.played[q.k] = 1; saveDraft(); b.classList.add('playing'); await TTS.play(audioSeq(q)); b.classList.remove('playing'); draw(); };
    plays[q.k] = draw; draw();
    return b;
  }
  function qCard(q) {
    const card = h('div', { class: 'qcard', id: 'eq' + q.k }), fb = h('div', { class: 'stack', style: 'gap:8px' });
    cards[q.k] = card;
    if (q.type === 'tanbun') card.append(h('div', { html: preHTML(q) }));
    if (q.L) {
      card.append(h('div', { class: 'row' }, h('span', { class: 'qn' }, String(q.no)), playBtn(q), q.type === 'hatsuwa' ? h('span', { class: 'small grow' }, h('span', { class: 'scene' }, 'え'), q.L.scene) : null));
      if (mode === 'practice' && q.stem) card.append(h('div', { class: 'stem small mute' }, q.stem));
      if (!TTS.can()) card.append(h('details', {}, h('summary', { class: 'small' }, 'No Japanese voice here: show the script'), scriptNode(q)));
    } else card.append(h('div', { class: 'stem' }, h('span', { class: 'qn' }, String(q.no)), h('span', { html: q.type === 'bunsho' ? '' : q.stem })));
    const hide = q.L && (q.type === 'hatsuwa' || q.type === 'sokuji') && !S.set.showOpts;
    const opts = h('div', { class: 'opts' });
    q.o.forEach((t, i) => opts.append(h('button', { class: 'opt' + (st.ans[q.k] === i + 1 && mode === 'exam' ? ' sel' : ''), type: 'button', onclick: () => choose(q, i, opts, fb) }, h('span', { class: 'o' }, String(i + 1)), hide ? h('span', { class: 'hidden-opt' }, 'listen for option ' + (i + 1)) : h('span', { html: t }))));
    card.append(opts, fb);
    if (mode === 'practice' && st.ans[q.k]) { const a = st.ans[q.k]; st.ans[q.k] = 0; choose(q, a - 1, opts, fb); }
    return card;
  }
  let auto = false;
  async function playAll(btn) {
    if (auto) { auto = false; TTS.stop(); return; }
    auto = true; btn.innerHTML = ''; btn.append(ico('stop'), 'Stop');
    for (const q of m.flat) {
      if (!auto || !root.isConnected) break;
      if (once() && st.played[q.k]) continue;
      const c = cards[q.k]; c.scrollIntoView({ block: 'center', behavior: 'smooth' }); c.classList.add('hl');
      st.played[q.k] = 1; saveDraft();
      const ok = await TTS.play(audioSeq(q));
      c.classList.remove('hl'); if (plays[q.k]) plays[q.k]();
      if (!ok || !auto) break;
      const tk = TTS.token; await sleep(q.type === 'kadai' || q.type === 'point' ? 7000 : 5000);
      if (TTS.token !== tk) break;
    }
    auto = false; btn.innerHTML = ''; btn.append(ico('play'), 'Play whole section');
  }
  function start() {
    st.started = true; root.innerHTML = '';
    const ebar = h('div', { class: 'exambar' }, h('div', { class: 'grow', style: 'min-width:0' }, h('b', { class: 'small' }, 'Paper ' + P + ' · ' + SEC[sec][1] + (mode === 'practice' ? ' · practice' : '')), h('div', {}, cnt)), clock,
      h('button', { class: 'iconbtn', type: 'button', title: 'Answer sheet', 'aria-label': 'Answer sheet', onclick: omrSheet }, ico('sheet')),
      h('button', { class: 'btn small pink', type: 'button', onclick: askSubmit }, mode === 'practice' ? 'Finish' : 'Submit'));
    root.append(ebar, body);
    if (sec === 3) {
      const pa = h('button', { class: 'btn primary', type: 'button' }, ico('play'), 'Play whole section'); pa.onclick = () => playAll(pa);
      body.append(h('div', { class: 'card stack' }, h('div', { class: 'row' }, pa, h('label', { class: 'toggle' }, h('input', { type: 'checkbox', id: 'show-opts', checked: S.set.showOpts, onchange: e => { S.set.showOpts = e.target.checked; save(); start(); } }), 'Print the spoken options (easier)')),
        h('div', { class: 'small mute' }, mode === 'exam' && S.set.once ? 'Exam mode: each audio plays once, like the real test.' : 'Replay any audio as often as you like.'), voiceHelp()));
    }
    m.groups.forEach(g => { body.append(groupHead(g)); if (g.passage) body.append(h('div', { html: passageHTML(g) })); g.qs.forEach(q => body.append(qCard(q))); });
    body.append(h('button', { class: 'btn pink block', type: 'button', onclick: askSubmit }, mode === 'practice' ? 'Finish and score' : 'Submit section'));
    drawClock(); drawCount();
    every(1000, tick, root);
  }
  onLeave(() => { if (!st.done && st.started) saveDraft(); });
  if (mode === 'exam' && !p.resume) {
    root.append(head('Paper ' + P + ' · section ' + sec, SEC[sec][0], '試 Mock · Exam mode'),
      h('div', { class: 'card intro-card' }, h('h2', {}, SEC[sec][1] + ' · ' + m.flat.length + ' questions · ' + SEC[sec][2] + ' min'),
        h('ul', { style: 'margin:0;padding-left:20px' }, h('li', {}, 'The timer starts when you press Start and submits automatically at zero.'), h('li', {}, 'Tap an option to mark it, tap again to clear. The sheet icon shows your answer sheet.'),
          sec === 3 ? h('li', {}, 'Each audio plays once. “Play whole section” runs every question in order with answer pauses, like the real test.') : null, h('li', {}, 'Leaving this screen pauses the timer and keeps your answers.')),
        loveOn() ? h('div', { class: 'note pink small' }, ED.examNote()) : null,
        h('div', { class: 'row' }, h('button', { class: 'btn pink', type: 'button', onclick: start }, 'Start'), h('button', { class: 'btn', type: 'button', onclick: () => swap('exam', { p: P, s: sec, mode: 'practice', fresh: 1 }) }, 'Practice mode instead'))));
  } else start();
  return root;
});

/* ---------- results ---------- */
function addMistakes(P, sec, ans) {
  const m = model(P, sec); let n = 0;
  m.flat.forEach(q => { if (ans[q.k] !== q.a) { S.srs[MQ + P + ':' + sec + ':' + q.k] = [0, dayNo(today()), 0, 1]; n++; } });
  save(); toast(plural(n, 'question') + ' added to your review deck');
}
function reviewList(m, ans, onlyWrong) {
  const box = h('div', { class: 'stack' });
  m.groups.forEach(g => {
    const qs = g.qs.filter(q => !onlyWrong || ans[q.k] !== q.a);
    if (!qs.length) return;
    box.append(groupHead(g));
    if (g.passage) box.append(h('div', { html: passageHTML(g) }));
    qs.forEach(q => {
      const chosen = ans[q.k], ok = chosen === q.a;
      const card = h('div', { class: 'qcard ' + (ok ? 'right' : 'wrong') });
      if (q.type === 'tanbun') card.append(h('div', { html: preHTML(q) }));
      if (q.L) card.append(h('div', { class: 'row' }, h('button', { class: 'playbtn', type: 'button', onclick: () => TTS.play(audioSeq(q)) }, ico('play'), 'Replay')));
      card.append(h('div', { class: 'stem' }, h('span', { class: 'qn' }, String(q.no)), h('span', { html: q.L ? esc(q.stem || '') : q.type === 'bunsho' ? '' : q.stem })));
      card.append(h('div', { class: 'opts' }, q.o.map((t, i) => h('div', { class: 'opt' + (i + 1 === q.a ? ' ok' : i + 1 === chosen ? ' no' : '') }, h('span', { class: 'o' }, String(i + 1)), h('span', { html: t })))));
      card.append(h('div', { class: 'why' }, h('b', {}, ok ? 'Correct. ' : chosen ? 'You chose ' + chosen + '. ' : 'Left blank. '), q.w));
      if (q.L) card.append(scriptNode(q));
      box.append(card);
    });
  });
  if (!box.childNodes.length) box.append(h('div', { class: 'empty' }, 'No mistakes in this section.'));
  return box;
}
view('result', 'mocks', p => {
  const P = +p.p, sec = +p.s, m = model(P, sec), r = S.mocks[P] && S.mocks[P][sec], root = h('div', { class: 'stack' });
  if (!r) return h('div', { class: 'stack' }, head('No result yet'));
  const ans = r.a.split('').map(Number), sc = scoreOf(m, ans), wrong = m.flat.filter(q => ans[q.k] !== q.a).length;
  root.append(head('Paper ' + P + ' · section ' + sec, SEC[sec][1] + ' · ' + (r.m === 'exam' ? 'Exam mode' : 'Practice mode') + ' · ' + fmtLong(r.d), '試 Result'));
  const line = sec === 3 ? (sc.score >= 19 ? 'Above the listening minimum (19/60).' : 'Below the listening minimum of 19/60: this alone fails the test.') : 'Sections 1 and 2 together need at least 38 of 120.';
  const card = h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { class: 'big-num' }, fmtPts(sc.score), h('span', { class: 'mute', style: 'font-size:20px' }, ' / ' + m.max)), h('div', { class: 'mute' }, Math.round(sc.pct * 100) + '% · ' + line)),
    sec === 3 ? h('div', { class: 'stamp pop' + (sc.score >= 19 ? '' : ' fail'), style: 'width:96px;height:96px;font-size:' + (sc.score >= 19 ? 26 : 18) + 'px' }, sc.score >= 19 ? '合格' : 'あと少し') : null),
    h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('tr', {}, h('th', {}, 'Part'), h('th', {}, 'Type'), h('th', {}, 'Right'), h('th', {}, 'Points')),
      sc.byG.map(b => h('tr', {}, h('td', {}, 'もんだい' + b.mn), h('td', {}, TYPES[b.type][1]), h('td', { class: 'num' }, b.got + '/' + b.n), h('td', { class: 'num' }, fmtPts(b.pts) + '/' + fmtPts(b.max)))))));
  root.append(card);
  if (loveOn()) root.append(h('div', { class: 'note pink' }, tpl(sec === 3 && sc.score < 19 ? PEP.listenLow : pick(sc.pct >= 0.75 ? PEP.mockHigh : sc.pct >= 0.5 ? PEP.mockMid : PEP.mockLow))));
  const pr = paperResult(P);
  if (pr) {
    root.append(h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'grow' }, h('h2', {}, 'Paper ' + P + ' total'), h('div', { class: 'big-num' }, fmtPts(pr.tot), h('span', { class: 'mute', style: 'font-size:20px' }, ' / 180'))),
      h('div', { class: 'stamp pop' + (pr.pass ? '' : ' fail'), style: pr.pass ? null : 'font-size:24px' }, pr.pass ? '合格' : '不合格')),
      h('div', { class: 'math' }, mbar('Vocab + grammar', Math.round(pr.s12), 120, 38, 72), mbar('Listening', Math.round(pr.s3), 60, 19, 36), mbar('Total', Math.round(pr.tot), 180, PASSMARK, 108)),
      h('div', { class: 'small mute' }, 'Uses your latest attempt at each section.')));
    if (pr.pass && loveOn() && !S.lv.pp[P]) paperPassPop(P);
    else if (pr.pass && p.full && sec === 3) later(400, () => { celebrate(); SFX.win(); }, root);
  }
  const nextSec = sec < 3 ? sec + 1 : 0;
  root.append(h('div', { class: 'row' },
    p.full && nextSec ? h('button', { class: 'btn pink', type: 'button', onclick: () => swap('exam', { p: P, s: nextSec, mode: 'exam', full: 1 }) }, 'Start section ' + nextSec + ': ' + SEC[nextSec][1], ico('next')) : null,
    wrong ? h('button', { class: 'btn' + (p.full && nextSec ? '' : ' pink'), type: 'button', onclick: () => addMistakes(P, sec, ans) }, 'Add ' + plural(wrong, 'mistake') + ' to review') : null,
    h('button', { class: 'btn', type: 'button', onclick: () => swap('exam', { p: P, s: sec, mode: 'exam', fresh: 1 }) }, 'Retake'),
    h('button', { class: 'btn', type: 'button', onclick: () => swap('paper', { p: P }) }, 'Paper ' + P)));
  let onlyWrong = true;
  const rl = h('div');
  const drawRL = () => { rl.innerHTML = ''; rl.append(reviewList(m, ans, onlyWrong)); };
  root.append(h('div', { class: 'row' }, h('h2', { class: 'grow' }, 'Review'), h('div', { class: 'seg' }, h('button', { type: 'button', 'aria-pressed': 'true', onclick: e => { onlyWrong = true; e.target.setAttribute('aria-pressed', 'true'); e.target.nextSibling.setAttribute('aria-pressed', 'false'); drawRL(); } }, 'Mistakes'),
    h('button', { type: 'button', 'aria-pressed': 'false', onclick: e => { onlyWrong = false; e.target.setAttribute('aria-pressed', 'true'); e.target.previousSibling.setAttribute('aria-pressed', 'false'); drawRL(); } }, 'All'))), rl);
  drawRL();
  return root;
});

/* ---------- papers, paper detail, history, drills ---------- */
function secStatus(P, s) {
  const r = S.mocks[P] && S.mocks[P][s], d = S.drafts[P + '-' + s];
  if (d) return h('span', { class: 'pill warn' }, 'In progress');
  if (!r) return h('span', { class: 'pill' }, 'Not taken');
  return h('span', { class: 'pill ' + (r.pct >= 0.6 ? 'good' : r.pct >= 0.45 ? 'warn' : 'bad') }, fmtPts(r.l) + '/' + model(P, s).max + (r.n > 1 ? ' · best ' + fmtPts(r.b) : ''));
}
view('paper', 'mocks', p => {
  const P = +p.p, root = h('div', { class: 'stack' }), pr = paperResult(P);
  const sizes = [1, 2, 3].map(s => model(P, s).flat.length), mins = sum([1, 2, 3], s => SEC[s][2]);
  root.append(head('Mock paper ' + P, (PACK ? 'A compact ' + LVNAME + ' paper built from the real question types: ' : 'Real N5 format: ') + sizes.join(' + ') + ' questions in ' + mins + ' minutes. Exam mode times and marks it like the real thing; practice mode marks each answer instantly.', '試 Mock'));
  if (PACK) root.append(h('div', { class: 'note small' }, 'The real ' + LVNAME + ' exam is longer (' + REAL_TOTAL + ' minutes) and adds a few question types these papers leave out, such as text grammar and information search. Scores here show your level on each question type, not a guaranteed result.'));
  if (pr) root.append(h('div', { class: 'card row' }, h('div', { class: 'grow' }, h('b', {}, 'Total ' + fmtPts(pr.tot) + '/180'), h('div', { class: 'small mute' }, 'Vocab + grammar ' + fmtPts(pr.s12) + '/120 · listening ' + fmtPts(pr.s3) + '/60')), h('div', { class: 'stamp', style: 'width:84px;height:84px;font-size:' + (pr.pass ? 22 : 17) + 'px' + (pr.pass ? '' : ';border-color:var(--mute);color:var(--mute)') }, pr.pass ? '合格' : '不合格')));
  root.append(h('button', { class: 'btn pink', type: 'button', onclick: () => go('exam', { p: P, s: 1, mode: 'exam', full: 1 }) }, 'Full mock · all three sections · ' + mins + ' min'));
  [1, 2, 3].forEach(s => {
    const m = model(P, s), r = S.mocks[P] && S.mocks[P][s];
    root.append(h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('div', { class: 'grow' }, h('h3', {}, 'Section ' + s + ' · ' + SEC[s][1]), h('div', { class: 'small mute' }, SEC[s][0] + ' · ' + m.flat.length + ' questions · ' + SEC[s][2] + ' min')), secStatus(P, s)),
      h('div', { class: 'row' }, h('button', { class: 'btn primary small', type: 'button', onclick: () => go('exam', { p: P, s, mode: 'exam' }) }, 'Exam mode'), h('button', { class: 'btn small', type: 'button', onclick: () => go('exam', { p: P, s, mode: 'practice' }) }, 'Practice'),
        r ? h('button', { class: 'btn small ghost', type: 'button', onclick: () => go('result', { p: P, s }) }, 'Last result') : null)));
  });
  return root;
});
const DRILL_TYPES = ['kanji', 'hyoki', 'bunmyaku', 'iikae', 'yoho', 'bunpo', 'kumitate', 'bunsho'];
/* which question types this level's papers contain (N5 has all the classic ones; generated levels leave a few out) */
const HAS = {};
function hasType(t) { if (!TYPES[t]) return false; if (!(t in HAS)) { let n = 0; for (let P = 1; P <= Math.min(2, PAPERS.length) && !n; P++) n = model(P, TYPES[t][0]).flat.filter(q => q.type === t).length; HAS[t] = n > 0; } return HAS[t]; }
const LISTEN_TYPES = () => ['kadai', 'point', 'hatsuwa', 'sokuji'].filter(hasType);
const READ_TYPES = () => ['tanbun', 'chubun', 'joho'].filter(hasType);
function openDrill(t) { if (DRILL_TYPES.indexOf(t) >= 0) go('drill', { type: t }); else if (TYPES[t][0] === 3) go('listenset', { type: t }); else go('readset', { type: t }); }
function poolOf(type) {
  const sec = TYPES[type][0], fresh = [], old = [];
  for (let P = PAPERS.length; P >= 1; P--) model(P, sec).flat.forEach(q => { if (q.type === type) (seenGet(type, P, q.ti) ? old : fresh).push({ P, sec, q }); });
  return { fresh, old };
}
function pickFrom(type, n) { const pl = poolOf(type); return pl.fresh.slice(0, n).concat(shuffle(pl.old)).slice(0, n); }
function labFinish(items, res) { items.forEach(x => { const t = S.ts[x.q.type] || (S.ts[x.q.type] = [0, 0]); seenSet(x.q.type, x.P, x.q.ti); }); save(); }
function labQuiz(items, kind, task) {
  const qs = items.map(x => qMock(x.P, x.sec, x.q.k)).filter(Boolean);
  return Quiz(qs, { waitRight: true, onAnswer: (Q, ok) => { const t = Q.k.split(':'), q = model(+t[1], +t[2]).flat[+t[3]], s = S.ts[q.type] || (S.ts[q.type] = [0, 0]); s[1]++; if (ok) s[0]++; seenSet(q.type, +t[1], q.ti); },
    onFinish: res => { const d = dayRec(); if (kind === 'listen') d.lis = (d.lis || 0) + 1; else if (kind === 'read') d.rd = (d.rd || 0) + 1; save(); gainXP(5); if (res.pct >= 60) loveToast(pick(PEP.lab)); checkSession();
      return [res.wrong.length ? h('button', { class: 'btn', type: 'button', onclick: () => { res.wrong.forEach(Q => { if (!S.srs[Q.k]) S.srs[Q.k] = [0, dayNo(today()), 0, 1]; }); save(); toast('Added to your review deck'); } }, 'Add misses to review') : null,
        h('button', { class: task ? 'btn' : 'btn pink', type: 'button', onclick: () => render() }, 'Another set')].concat(task ? nextTaskButtons() : []); } });
}
view('drill', 'mocks', p => {
  const t = hasType(p.type) && DRILL_TYPES.indexOf(p.type) >= 0 ? p.type : DRILL_TYPES.find(hasType), root = h('div', { class: 'stack' }), pl = poolOf(t);
  root.append(head(TYPES[t][1] + ' drill', '10 questions of one type from across the ' + PAPERS.length + ' papers, unseen ones first. ' + pl.fresh.length + ' unseen of ' + (pl.fresh.length + pl.old.length) + '.', '試 Drill · ' + TYPES[t][2]),
    h('div', { class: 'mh' }, h('div', { class: 'ja', html: INSTR[t][0] }), h('div', { class: 'en' }, INSTR[t][1])));
  root.append(labQuiz(pickFrom(t, 10), 'drill'));
  return root;
});
view('mocks', 'mocks', p => {
  const v = p.v || 'papers', root = h('div', { class: 'stack' });
  root.append(head(PAPERS.length + ' mock papers', PACK ? 'Papers built from the ' + LVNAME + ' question types in exam order, with section timers, spoken audio and instant marking.' : 'Every N5 question type in the real order, with section timers, spoken audio and instant marking.', '試 Mocks'));
  root.append(h('div', { class: 'seg', role: 'group' }, [['papers', 'Papers'], ['drills', 'Drills by type'], ['history', 'History']].map(x => h('button', { type: 'button', 'aria-pressed': String(x[0] === v), onclick: () => swap('mocks', { v: x[0] }) }, x[1]))));
  if (v === 'papers') {
    const nq = mockQueue().next();
    root.append(h('button', { class: 'li', type: 'button', style: 'border:2px solid var(--sheet)', onclick: () => go('exam', { p: nq.p, s: nq.s, mode: 'exam' }) }, markEl('試'), h('span', { class: 'body' }, h('b', {}, 'Next up: paper ' + nq.p + ' · section ' + nq.s), h('span', {}, SEC[nq.s][1] + ' · ' + SEC[nq.s][2] + ' min · exam mode')), h('span', { class: 'end' }, ico('next'))));
    root.append(h('div', { class: 'papers' }, PAPERS.map((x, i) => { const P = i + 1, pr = paperResult(P), r = S.mocks[P] || {};
      return h('button', { class: 'paper', type: 'button', onclick: () => go('paper', { p: P }) }, h('span', { class: 'eyebrow' }, 'Paper'), h('span', { class: 'pn num' }, String(P)),
        h('span', { class: 'sec3' }, [1, 2, 3].map(s => h('i', { class: r[s] ? 'on' : '', title: 'Section ' + s }))), h('span', { class: 'small mute num' }, pr ? fmtPts(pr.tot) + '/180' : [1, 2, 3].filter(s => r[s]).length + '/3 sections'),
        pr && pr.pass ? h('span', { class: 'mini-stamp' }, '合格') : null); })));
  } else if (v === 'drills') {
    [1, 2, 3].forEach(s => {
      root.append(h('h2', {}, 'Section ' + s + ' · ' + SEC[s][1]));
      root.append(h('div', { class: 'list' }, Object.keys(TYPES).filter(t => TYPES[t][0] === s && hasType(t)).map(t => { const a = S.ts[t], pl = poolOf(t);
        return h('button', { class: 'li', type: 'button', onclick: () => openDrill(t) }, h('span', { class: 'body' }, h('b', {}, TYPES[t][1]), h('span', {}, TYPES[t][2] + ' · ' + (pl.fresh.length + pl.old.length) + ' questions · ' + pl.fresh.length + ' unseen')),
          h('span', { class: 'end' }, a && a[1] ? h('span', { class: 'pill ' + (a[0] / a[1] >= 0.7 ? 'good' : a[0] / a[1] >= 0.5 ? 'warn' : 'bad') }, Math.round(a[0] / a[1] * 100) + '%') : h('span', { class: 'pill' }, 'New'))); })));
    });
  } else {
    const hs = S.hist.slice().reverse();
    if (!hs.length) root.append(h('div', { class: 'card empty' }, 'No attempts yet. Your first mock section takes ' + SEC[1][2] + ' minutes.'));
    else root.append(h('div', { class: 'card table-wrap' }, h('table', { class: 't' }, h('tr', {}, h('th', {}, 'Date'), h('th', {}, 'Paper'), h('th', {}, 'Section'), h('th', {}, 'Score'), h('th', {}, 'Mode')),
      hs.slice(0, 100).map(x => h('tr', { style: 'cursor:pointer', onclick: () => go('result', { p: x.p, s: x.s }) }, h('td', { class: 'num' }, fmtDate(x.d, { day: 'numeric', month: 'short' })), h('td', { class: 'num' }, String(x.p)), h('td', {}, SEC[x.s][1]), h('td', { class: 'num' }, fmtPts(x.sc) + '/' + x.mx), h('td', { class: 'small' }, x.m))))));
  }
  return root;
});

/* ---------- listening and reading labs ---------- */
view('listen', 'learn', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Listening lab', 'Exam-format questions from the ' + PAPERS.length + ' papers, read aloud by your device’s Japanese voice. Unseen questions come first.', '聞 Listening'));
  const vh = voiceHelp(); if (vh) root.append(vh);
  root.append(h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('label', { class: 'fl', for: 'lab-rate' }, 'Speed'), h('input', { type: 'range', id: 'lab-rate', min: '0.6', max: '1.2', step: '0.05', value: String(S.set.rate), oninput: e => { S.set.rate = +e.target.value; save(); } })),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', id: 'lab-show', checked: S.set.showOpts, onchange: e => { S.set.showOpts = e.target.checked; save(); } }), 'Print the spoken options for spoken-only questions (easier)'),
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', id: 'lab-once', checked: S.set.once, onchange: e => { S.set.once = e.target.checked; save(); } }), 'Exam mode mocks play each audio once')));
  root.append(h('button', { class: 'btn pink', type: 'button', onclick: () => go('listenset', { type: 'mix' }) }, 'Mixed set: one of each type'));
  root.append(h('div', { class: 'list' }, LISTEN_TYPES().map(t => { const pl = poolOf(t), a = S.ts[t];
    return h('button', { class: 'li', type: 'button', onclick: () => go('listenset', { type: t }) }, markEl('聞'), h('span', { class: 'body' }, h('b', {}, TYPES[t][1]), h('span', {}, INSTR[t][1] + ' · ' + pl.fresh.length + ' unseen')), h('span', { class: 'end' }, a && a[1] ? h('span', { class: 'pill' }, Math.round(a[0] / a[1] * 100) + '%') : h('span', { class: 'pill' }, '5 per set'))); })));
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Listening tactics'), h('ul', { style: 'margin:0;padding-left:20px' }, levelSections()[2][1].map(t => h('li', {}, t)))));
  return root;
});
view('listenset', 'learn', p => {
  const t = p.type || 'mix', root = h('div', { class: 'stack' });
  const items = t === 'mix' ? (LISTEN_TYPES().length > 2 ? LISTEN_TYPES().map(x => pickFrom(x, 1)[0]) : LISTEN_TYPES().reduce((a, x) => a.concat(pickFrom(x, 2)), [])).filter(Boolean) : pickFrom(t, 5);
  root.append(head(t === 'mix' ? 'Listening drill' : TYPES[t][1], t === 'mix' ? 'One question of each listening type. Each plays automatically; replay as needed.' : INSTR[t][1], '聞 Listening'));
  const vh = voiceHelp(); if (vh) root.append(vh);
  root.append(labQuiz(items, 'listen', p.task));
  return root;
});
view('read', 'learn', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Reading lab', (PACK ? 'Short texts and longer passages' : 'Short notes, longer passages and information-search notices') + ' from the ' + PAPERS.length + ' papers. Read the question first, then hunt.', '読 Reading'));
  [['tanbun', 'Two short texts (memos, emails)', '4 min'], ['chubun', 'One longer passage, two questions', '6 min'], ['joho', 'A notice or timetable, one question', '3 min']].filter(x => hasType(x[0])).forEach(x => {
    const pl = poolOf(x[0]);
    root.append(h('button', { class: 'li', type: 'button', onclick: () => go('readset', { type: x[0] }) }, markEl('読'), h('span', { class: 'body' }, h('b', {}, TYPES[x[0]][1]), h('span', {}, x[1] + ' · target ' + x[2] + ' · ' + pl.fresh.length + ' unseen questions')), h('span', { class: 'end' }, ico('next'))));
  });
  root.append(h('div', { class: 'card stack' }, h('h3', {}, 'Reading tactics'), h('ul', { style: 'margin:0;padding-left:20px' }, levelSections()[1][1].map(t => h('li', {}, t)))));
  return root;
});
view('readset', 'learn', p => {
  const t = hasType(p.type || 'tanbun') ? (p.type || 'tanbun') : READ_TYPES()[0], root = h('div', { class: 'stack' }), pl = poolOf(t);
  const first = pl.fresh[0] || pick(pl.old);
  if (!first) return root;
  const items = (pl.fresh.length ? pl.fresh : pl.old).filter(x => x.P === first.P);
  const target = { tanbun: 240, chubun: 360, joho: 180 }[t];
  const clock = h('span', { class: 'clock num' }, '0:00');
  let el = 0;
  root.append(head(TYPES[t][1] + ' · paper ' + first.P, 'Target ' + mmss(target) + '. Read the question first.', '読 Reading'), h('div', { class: 'exambar' }, h('b', { class: 'grow small' }, 'Time'), clock));
  root.append(labQuiz(items, 'read', p.task));
  every(1000, () => { el++; clock.textContent = mmss(el); clock.classList.toggle('low', el > target); }, root);
  return root;
});
