/* ===== 20 · shell, router, shared components ===== */
const VIEWS = {};
function view(name, tabName, fn) { fn.tab = tabName; VIEWS[name] = fn; }
const TABS = [['home', '今', 'Today'], ['route', '道', 'Route'], ['learn', '学', 'Learn'], ['arcade', '遊', 'Arcade'], ['mocks', '試', 'Mocks']];
const NAV = { stack: [{ name: 'home', p: {} }] };
const cur = () => NAV.stack[NAV.stack.length - 1];
const tabOf = n => (VIEWS[n] && VIEWS[n].tab) || n;
function go(name, p) { cur().y = window.scrollY; NAV.stack.push({ name, p: p || {} }); render(); }
function swap(name, p) { NAV.stack[NAV.stack.length - 1] = { name, p: p || {} }; render(); }
function tab(name) { NAV.stack = [{ name, p: {} }]; render(); }
function back() {
  if (SHEETS.length) { SHEETS[SHEETS.length - 1](); return true; }
  if (NAV.stack.length > 1) { NAV.stack.pop(); render(false, cur().y || 0); return true; }
  if (cur().name !== 'home') { tab('home'); return true; }
  return false;
}
window.__back = back;
function render(keep, y) {
  runLeave(); TTS.stop();
  const c = cur(), V = VIEWS[c.name] || VIEWS.home, main = $('#view');
  const sy = keep ? window.scrollY : (y || 0);
  main.innerHTML = '';
  let node;
  try { node = V(c.p || {}); }
  catch (e) {
    console.error(e); logErr('screen ' + c.name + ': ' + ((e && e.message) || e));
    node = h('div', { class: 'card stack' }, h('h2', {}, 'This screen hit an error'), h('p', { class: 'mute' }, String((e && e.message) || e)), h('button', { class: 'btn', onclick: () => tab('home') }, 'Back to Today'));
  }
  main.appendChild(node);
  window.scrollTo(0, sy);
  const t = tabOf(c.name);
  document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === t ? 'page' : 'false'));
  updateChips();
}
function updateChips() {
  const st = $('#chip-streak'), xp = $('#chip-xp'), sub = $('#brand-sub');
  if (st) { st.innerHTML = ''; st.append(ico('flame'), ' ' + streakNow()); st.title = 'Day streak · best ' + (S.streak.best || 0); }
  if (xp) { const lv = level(); xp.innerHTML = ''; xp.append(h('i', {}, 'Lv' + lv.n), h('span', { class: 'hide-xs' }, ' ' + S.xp + ' XP')); xp.title = lv.jp + ' · ' + lv.en + ' · ' + S.xp + ' XP'; }
  if (sub) { const dl = daysLeft(); sub.textContent = (loveOn() ? ED.brand() : '') + (dl > 0 ? dl + ' days to ' + examInfo().name : dl === 0 ? 'exam day' : 'pick your next exam'); }
}
function head(title, sub, eyebrow) {
  return h('div', { class: 'pagehead' },
    NAV.stack.length > 1 ? h('button', { class: 'back', type: 'button', onclick: back }, ico('back'), 'Back') : null,
    eyebrow ? h('div', { class: 'eyebrow' }, eyebrow) : null,
    h('h1', {}, title), sub ? h('p', {}, sub) : null);
}
const markEl = m => h('span', { class: 'mark', style: m && m.length > 1 ? 'font-size:' + (m.length > 2 ? 12 : 16) + 'px' : null }, m || '・');
function stepPill(r) { const n = (r.m ? 1 : 0) + (r.u ? 1 : 0); return n ? h('span', { class: 'pill gold' }, n + '/3 steps') : h('span', { class: 'pill' }, 'New'); }
function lessonRow(l) {
  const r = S.les[l.id] || {};
  return h('button', { class: 'li', type: 'button', onclick: () => go('lesson', { id: l.id }) }, markEl(l.mark),
    h('span', { class: 'body' }, h('b', {}, l.title), h('span', {}, l.sub + ' · ' + l.min + ' min')),
    h('span', { class: 'end' }, lessonDone(l.id) ? h('span', { class: 'pill good' }, ico('check'), r.t ? ' ' + r.t + '%' : ' Known') : stepPill(r)));
}
function bar(pct, cls) { return h('div', { class: 'bar ' + (cls || '') }, h('i', { style: 'width:' + clamp(Math.round(pct * 100), 0, 100) + '%' })); }
function chipset(options, value, onPick) {
  const box = h('div', { class: 'chipset', role: 'group' });
  options.forEach(o => box.append(h('button', { type: 'button', 'aria-pressed': String(o[0] === value), onclick: () => { box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false')); box.querySelector('[data-v="' + o[0] + '"]').setAttribute('aria-pressed', 'true'); onPick(o[0]); }, 'data-v': o[0] }, o[1])));
  return box;
}

/* ---------- flashcards: memorise step ---------- */
function Cards(cards, onDone, doneLabel, onComplete) {
  const root = h('div', { class: 'fc-wrap' });
  const total = cards.length;
  let queue = cards.slice(), got = 0, flipped = false;
  const dots = h('div', { class: 'dots', 'aria-hidden': 'true' }), count = h('div', { class: 'cnt' }), stage = h('div', { style: 'width:100%;display:grid;justify-items:center' });
  const acts = h('div', { class: 'fc-actions' },
    h('button', { class: 'btn', type: 'button', onclick: () => again() }, 'Again'),
    h('button', { class: 'btn primary', type: 'button', onclick: () => gotIt() }, ico('check'), 'Got it'));
  root.append(dots, stage, acts, count, h('p', { class: 'mute small center', style: 'max-width:440px;margin:0' }, 'Say it out loud before you flip. “Got it” sends the card to your review deck; “Again” brings it back in a few cards.'));
  function flip(btn, c) { flipped = !flipped; btn.classList.toggle('flip', flipped); if (flipped && c.say) TTS.say(c.say); }
  function draw() {
    dots.innerHTML = '';
    if (total <= 40) for (let i = 0; i < total; i++) dots.append(h('i', { class: i < got ? 'ok' : i === got ? 'on' : '' }));
    count.textContent = got + ' / ' + total + ' memorised';
    stage.innerHTML = '';
    if (!queue.length) return finish();
    const c = queue[0]; flipped = false;
    const btn = h('button', { class: 'fc', type: 'button', 'aria-label': 'Flip the card' },
      h('div', { class: 'in' }, h('div', { class: 'face' }, h('div', {}, c.front), h('div', { class: 'hint' }, 'Tap to flip')), h('div', { class: 'face rear' }, h('div', {}, c.back), h('div', { class: 'hint' }, c.say ? 'Listen, repeat, then grade yourself' : 'Grade yourself below'))));
    btn.onclick = () => flip(btn, c);
    stage.append(btn);
    stage.flipper = () => flip(btn, c);
  }
  function again() { if (!queue.length) return; const c = queue.shift(); queue.splice(Math.min(3, queue.length), 0, c); SFX.tick(); draw(); }
  function gotIt() { if (!queue.length) return; const c = queue.shift(); got++; if (c.key) srsAdd(c.key); gainXP(1, true); draw(); }
  function finish() {
    if (onComplete) onComplete();
    save(); toast('+' + total + ' XP', 'xp'); SFX.win();
    acts.remove(); dots.remove();
    stage.append(h('div', { class: 'card result', style: 'width:min(100%,440px)' }, h('div', { class: 'score' }, String(total)), h('div', {}, 'cards memorised'),
      h('p', { class: 'mute' }, 'They are in your review deck now and come back tomorrow.'),
      onDone ? h('button', { class: 'btn pink', type: 'button', onclick: onDone }, doneLabel || 'Next: understand', ico('next')) : null));
  }
  onKey(root, e => {
    if (!queue.length) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (stage.flipper) stage.flipper(); }
    else if (e.key === 'ArrowRight' || e.key === 'g') gotIt();
    else if (e.key === 'ArrowLeft' || e.key === 'a') again();
  });
  draw();
  return root;
}

/* ---------- multiple-choice quiz: test step, reviews, drills ---------- */
const PRAISE = ['Correct.', 'Yes!', 'Nailed it.', 'Right.', 'そうです！', 'いいですね。'];
function optText(t, oc) {
  if (oc === 'jpbig') return h('span', { style: 'font:24px/1.2 var(--f-glyph);font-weight:600' }, t);
  if (oc === 'glyphbig') return h('span', { style: 'font:32px/1.2 var(--f-glyph);font-weight:600' }, t);
  return h('span', {}, t);
}
function promptEl(Q) {
  const box = h('div', { class: 'prompt' });
  if (Q.ask) box.append(h('div', { class: 'ask' }, Q.ask));
  if (Q.pre) box.append(h('div', { class: 'pre', html: Q.pre }));
  if (Q.audio || Q.seq) {
    const seq = Q.seq || [{ t: Q.audio }];
    const pb = h('button', { class: 'playbtn', type: 'button' }, ico('play'), Q.seq ? 'Play audio' : 'Play');
    const playIt = async () => { pb.classList.add('playing'); await TTS.play(seq); pb.classList.remove('playing'); };
    pb.onclick = playIt;
    box.append(h('div', {}, pb));
    if (Q.autoplay !== false) later(300, playIt, box);
    const vh = voiceHelp();
    if (vh) { box.append(vh); if (Q.scriptText) box.append(h('div', { class: 'script', style: 'text-align:left' }, Q.scriptText)); }
  }
  if (Q.q) {
    const qc = Q.qc || '';
    const cls = 'q' + (qc.indexOf('huge') >= 0 ? ' huge' : qc.indexOf('large') >= 0 ? ' large' : qc === 'stem' ? ' stem' : '');
    box.append(Q.qh ? h('div', { class: cls, html: Q.q }) : h('div', { class: cls }, Q.q));
  }
  if (Q.meta) box.append(h('div', { class: 'meta' }, Q.meta));
  return box;
}
function regen(Q) { if (Q.k && Q.k.slice(0, 3) !== 'mq:') { const n = qFor(Q.k); if (n) return n; } return Object.assign({}, Q); }
function reshuffle(Q) { const right = Q.o[Q.a], o = shuffle(Q.o); return Object.assign({}, Q, { o, a: o.indexOf(right) }); }
function retryOf(Q) {
  let n = null;
  if (Q.k && Q.k.slice(0, 3) !== 'mq:') { try { n = qFor(Q.k); } catch (e) { n = null; } }
  n = n || (Q.fixed ? Object.assign({}, Q) : reshuffle(Q));
  n._retry = (Q._retry || 0) + 1;
  return n;
}
function mistakesList(ws) {
  return h('div', { class: 'list', style: 'text-align:left;width:100%' }, ws.slice(0, 12).map(Q => h('div', { class: 'li' },
    h('span', { class: 'body' }, h('b', { html: Q.qh ? Q.q : esc(Q.q || Q.audio || Q.ask || '') }), h('span', {}, '✓ ' + Q.o[Q.a])))));
}
function Quiz(qs, o) {
  o = o || {};
  qs = qs.slice();
  const total = qs.length;
  const root = h('div', { class: 'quiz' });
  const st = { i: 0, right: 0, first: 0, combo: 0, max: 0, wrong: [], locked: false, xp: 0, miss: 0 };
  let card = null, opts = null, fb = null, nextBtn = null, fin = null;
  function finalize() {
    if (fin) return fin;
    const n = total;
    const pct = n ? Math.round(st.first / n * 100) : 0, graded = o.pass != null, pass = !graded || !!o.loop || pct >= o.pass;
    const res = { right: st.first, n, pct, pass, wrong: st.wrong.slice(), xp: st.xp, max: st.max };
    fin = { res, n, pct, graded, pass };
    fin.extra = o.onFinish ? o.onFinish(res) : null;
    return fin;
  }
  function draw() {
    root.innerHTML = '';
    if (st.i >= qs.length) return finish();
    const Q = qs[st.i];
    st.locked = false;
    root.append(h('div', { class: 'qhead' }, h('span', { class: 'cnt' }, (st.i + 1) + '/' + qs.length), bar(st.i / qs.length), Q._retry ? h('span', { class: 'pill warn' }, 'Again') : null, h('span', { class: 'combo' }, st.combo >= 2 ? '×' + st.combo : '')));
    card = promptEl(Q);
    const short = Q.o.every(t => String(t).length <= 7);
    opts = h('div', { class: 'opts' + (short ? ' two' : '') });
    Q.o.forEach((t, i) => opts.append(h('button', { class: 'opt', type: 'button', onclick: () => choose(i) }, h('span', { class: 'o' }, String(i + 1)), Q.hide ? h('span', { class: 'hidden-opt' }, 'listen for option ' + (i + 1)) : optText(t, Q.oc))));
    fb = h('div');
    nextBtn = h('button', { class: 'btn primary', type: 'button', hidden: true, onclick: next }, st.i + 1 < qs.length ? 'Next' : 'See result', ico('next'));
    root.append(card, opts, fb, h('div', { class: 'row' }, nextBtn, o.quit ? h('button', { class: 'btn ghost small', type: 'button', onclick: () => { st.i = qs.length; finish(true); } }, 'End early') : null));
  }
  function choose(i) {
    if (st.locked) return;
    st.locked = true;
    const Q = qs[st.i], ok = i === Q.a, firstTry = !Q._retry;
    opts.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (j === Q.a) b.classList.add('ok'); else if (j === i) b.classList.add('no'); const hx = b.querySelector('.hidden-opt'); if (hx) { hx.textContent = Q.o[j]; hx.className = ''; } });
    if (ok) { st.right++; if (firstTry) st.first++; st.combo++; st.miss = 0; st.max = Math.max(st.max, st.combo); SFX.ok(); const x = (o.xpEach || 2) + (st.combo >= 5 ? 1 : 0); st.xp += x; gainXP(x, true); if (st.combo === 5 || st.combo === 10 || st.combo === 20) loveToast(pick(PEP.combo), { c: st.combo }); }
    else { st.combo = 0; st.miss++; if (firstTry) st.wrong.push(Q); if (o.loop && !Q._retry) qs.push(retryOf(Q)); SFX.bad(); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); if (st.miss === 3) loveToast(pick(PEP.wrongRun)); }
    if (Q.k && o.srs !== false) srsGrade(Q.k, ok);
    if (o.onAnswer) o.onAnswer(Q, ok, i);
    fb.innerHTML = '';
    fb.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, h('b', {}, ok ? (loveOn() && Math.random() < 0.3 ? tpl(pick(PEP.right)) : pick(PRAISE)) : (loveOn() && Math.random() < 0.4 ? tpl(pick(PEP.wrong)) : 'Not quite.')), ' ', Q.wh ? h('span', { html: Q.w || '' }) : (Q.w || ''), ' ',
      Q.say && TTS.can() ? sayBtn(Q.say) : null, !ok && o.loop && !Q._retry ? h('div', { class: 'small', style: 'margin-top:4px' }, 'This one comes back once at the end.') : null));
    if (Q.script) fb.append(Q.script());
    nextBtn.firstChild.textContent = st.i + 1 < qs.length ? 'Next' : 'See result';
    nextBtn.hidden = false;
    save();
    if (st.i === qs.length - 1) finalize();
    if (ok && !o.waitRight && !Q.wait) later(950, next, nextBtn);
  }
  function next() { if (!st.locked) return; st.i++; draw(); }
  function finish() {
    root.innerHTML = '';
    const f = finalize(), n = f.n, pct = f.pct, graded = f.graded, pass = f.pass, extra = f.extra, mastered = !o.loop || pct >= (o.pass || 80);
    if (st.xp) toast('+' + st.xp + ' XP', 'xp');
    updateChips();
    root.append(h('div', { class: 'card result' },
      graded ? h('div', { class: 'stamp pop' + (pass ? '' : ' fail'), style: pass && mastered ? null : 'font-size:24px' }, pass ? (mastered ? '合格' : '完了') : 'もう少し') : null,
      h('div', { class: 'score' }, st.first + '/' + n), h('div', { class: 'mute' }, pct + '%' + (o.loop ? ' right first time' : '') + ' · best combo ×' + st.max),
      graded ? h('p', { style: 'margin:0' }, pass ? (typeof o.passText === 'function' ? o.passText(f.res) : (o.passText || 'Passed.')) : (o.failText || 'You need ' + o.pass + '%. Look at the misses, then try again.')) : null,
      st.wrong.length ? mistakesList(st.wrong) : null,
      h('div', { class: 'row', style: 'justify-content:center' },
        st.wrong.length ? h('button', { class: 'btn', type: 'button', onclick: () => root.replaceWith(Quiz(shuffle(st.wrong.map(regen)), { srs: o.srs, waitRight: o.waitRight, title: 'Mistakes' })) }, 'Retry mistakes') : null,
        extra)));
    if (graded && pass) { SFX.win(); if (mastered) celebrate(); }
  }
  root.__st = st; root.__qs = qs;
  onKey(root, e => {
    if (!card || st.i >= qs.length) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= qs[st.i].o.length && !st.locked) choose(n - 1);
    else if ((e.key === 'Enter' || e.key === ' ') && st.locked) { e.preventDefault(); next(); }
  });
  draw();
  return root;
}
