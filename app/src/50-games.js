/* ===== 50 · arcade ===== */
function timedMC(cfg) {
  const root = h('div', { class: 'arena' });
  const tBox = h('span', { class: 'box timer num' }), sBox = h('span', { class: 'box num' }), cBox = h('span', { class: 'box num' }), lBox = h('span', { class: 'box lives' });
  const stage = h('div', { class: 'stack' }), fuse = h('div', { class: 'bar gold' }, h('i', { style: 'width:100%' }));
  root.append(h('div', { class: 'hud' }, cfg.secs ? tBox : lBox, sBox, cBox), stage);
  let left = (cfg.secs || 0) * 10, score = 0, combo = 0, lives = cfg.lives || 0, right = 0, total = 0, over = false, fuseMs = 0, fuseLeft = 0, Q = null, locked = true, btns = [], pr = null;
  function hud() {
    tBox.textContent = '⏱ ' + (left / 10).toFixed(1); sBox.textContent = 'SCORE ' + score; cBox.textContent = combo >= 2 ? '×' + combo : '×1';
    lBox.innerHTML = ''; for (let i = 0; i < (cfg.lives || 0); i++) lBox.append(h('i', {}, i < lives ? '♥' : '♡'));
  }
  function nextQ() {
    if (over) return;
    Q = cfg.next(); locked = false; total++;
    stage.innerHTML = '';
    pr = promptEl(Q);
    const opts = h('div', { class: 'opts two' });
    btns = Q.o.map((t, i) => h('button', { class: 'opt', type: 'button', onclick: () => answer(i) }, h('span', { class: 'o' }, String(i + 1)), optText(t, Q.oc)));
    btns.forEach(b => opts.append(b));
    fuseMs = typeof cfg.fuse === 'function' ? cfg.fuse(score) : (cfg.fuse || 0); fuseLeft = fuseMs;
    if (fuseMs) { fuse.firstChild.style.width = '100%'; stage.append(fuse); }
    stage.append(pr, opts);
  }
  function miss(i) {
    combo = 0; SFX.bad();
    btns.forEach((b, j) => { b.disabled = true; if (j === Q.a) b.classList.add('ok'); else if (j === i) b.classList.add('no'); });
    pr.classList.remove('shake'); void pr.offsetWidth; pr.classList.add('shake');
    if (cfg.secs) left = Math.max(0, left - 30);
    if (cfg.lives) lives--;
    hud();
    later(800, () => { if (cfg.lives && lives <= 0) finish(); else nextQ(); }, root);
  }
  function answer(i) {
    if (locked || over) return;
    locked = true;
    if (i !== Q.a) return miss(i);
    combo++; right++; score += combo >= 5 ? 2 : 1; SFX.ok();
    if (combo === 10 || combo === 20) loveToast(pick(PEP.combo), { c: combo });
    btns[i].classList.add('ok'); btns.forEach(b => { b.disabled = true; });
    hud();
    later(cfg.pause || 220, nextQ, root);
  }
  function finish() { if (over) return; over = true; TTS.stop(); cfg.end(score, { right, total }); }
  every(100, () => {
    if (over || document.visibilityState === 'hidden') return;
    if (cfg.secs) { left--; if (left <= 0) { left = 0; hud(); finish(); return; } if (left % 5 === 0) hud(); }
    if (fuseMs && !locked) { fuseLeft -= 100; fuse.firstChild.style.width = Math.max(0, fuseLeft / fuseMs * 100) + '%'; if (fuseLeft <= 0) { locked = true; miss(-1); } }
  }, root);
  onKey(root, e => { const n = parseInt(e.key, 10); if (Q && !locked && n >= 1 && n <= Q.o.length) answer(n - 1); });
  hud(); nextQ();
  return root;
}
const nokey = q => { delete q.k; return q; };
function playKana(mode, end) {
  const base = s => KANA_ALL[s].filter(x => x.grp === 'base');
  const pool = mode === 'h' ? base('h') : mode === 'k' ? base('k') : mode === 'hk' ? base('h').concat(base('k')) : KANA_ALL.h.concat(KANA_ALL.k);
  let last = null;
  return timedMC({ secs: 60, end, next: () => { let it = pick(pool); if (it === last) it = pick(pool); last = it; return nokey(qKana(it, 'read', pool.filter(x => x.s === it.s))); } });
}
function playPart(mode, end) {
  let order = shuffle(CORE.PDRILL), i = 0;
  return timedMC({ lives: 3, end, fuse: sc => Math.max(3500, 9000 - sc * 220), next: () => { if (i >= order.length) { order = shuffle(CORE.PDRILL); i = 0; } return qDrill(order[i++]); } });
}
function playNum(mode, end) {
  const gens = { num: qNum, time: qTime, date: qDate, count: () => qCount(ITEMS['ct:' + rnd(CORE.COUNTERS.length)]) };
  return timedMC({ secs: 60, end, next: () => nokey((mode === 'mix' ? gens[pick(Object.keys(gens))] : gens[mode])()) });
}
function playVerb(mode, end) {
  const F = { all: CORE.FORMS.map(f => f[0]), masu: ['masu', 'masen', 'mashita', 'masendeshita', 'mashou', 'tai'], te: ['te', 'ta', 'nai', 'nakatta'] }[mode] || CORE.FORMS.map(f => f[0]);
  return timedMC({ secs: 60, end, next: () => qVerb(F) });
}
function playListen(mode, end) {
  const mine = VOCAB.all.filter(w => S.srs['v:' + w.id]), pool = mode === 'learned' && mine.length >= 8 ? mine : VOCAB.all;
  return timedMC({ lives: 3, end, pause: 500, next: () => nokey(qVocab(ITEMS['v:' + pick(pool).id], 'listen')) });
}
function playMatch(mode, end) {
  const mine = KANJI.filter(k => S.srs['kj:' + k.id]), pool = mode === 'learned' && mine.length >= 6 ? mine : KANJI;
  const root = h('div', { class: 'arena' }), clock = h('span', { class: 'box timer num' }), rBox = h('span', { class: 'box num' }), mBox = h('span', { class: 'box num' }), grid = h('div', { class: 'match' });
  root.append(h('div', { class: 'hud' }, clock, rBox, mBox), grid);
  const t0 = Date.now();
  let round = 0, misses = 0, sel = null, left = 0, over = false;
  const draw = () => { rBox.textContent = 'ROUND ' + Math.min(round, 3) + '/3'; mBox.textContent = 'MISS ' + misses; };
  function newRound() {
    round++;
    if (round > 3) { over = true; SFX.win(); return end(Math.round((Date.now() - t0) / 100) / 10 + misses * 2, { misses }); }
    const ks = [], used = new Set();
    shuffle(pool).forEach(k => { if (ks.length < 6 && !used.has(k.m)) { used.add(k.m); ks.push(k); } });
    grid.innerHTML = ''; sel = null; left = ks.length;
    shuffle(ks.map(k => ({ id: k.id, t: k.k, kind: 'k' })).concat(ks.map(k => ({ id: k.id, t: k.m, kind: 'm' })))).forEach(tl => {
      const b = h('button', { class: 'mt' + (tl.kind === 'k' ? ' k' : ''), type: 'button' }, tl.t);
      b.onclick = () => {
        if (over || b.classList.contains('done')) return;
        if (!sel) { sel = { tl, b }; b.classList.add('sel'); return; }
        if (sel.b === b) { b.classList.remove('sel'); sel = null; return; }
        if (sel.tl.id === tl.id && sel.tl.kind !== tl.kind) {
          SFX.ok(); sel.b.classList.add('done'); b.classList.add('done'); sel = null;
          if (--left === 0) later(300, newRound, root);
        } else {
          SFX.bad(); misses++; const a = sel.b; a.classList.add('bad'); b.classList.add('bad'); a.classList.remove('sel'); sel = null;
          later(400, () => { a.classList.remove('bad'); b.classList.remove('bad'); }, root);
        }
        draw();
      };
      grid.append(b);
    });
    draw();
  }
  every(100, () => { if (!over) clock.textContent = '⏱ ' + ((Date.now() - t0) / 1000).toFixed(1); }, root);
  newRound();
  return root;
}
const GAMES = {
  kana: { k: '仮', title: 'Kana Rush', desc: '60 seconds: read as many kana as you can. Five in a row doubles your points; a miss costs 3 seconds.', modes: [['h', 'ひらがな'], ['k', 'カタカナ'], ['hk', 'Both'], ['all', 'Both + ゛゜ + combos']], play: playKana },
  match: { k: '漢', title: 'Kanji Match', desc: 'Pair six kanji with their meanings. Three rounds against the clock; each miss adds 2 seconds.', modes: [['learned', 'My kanji'], ['all', 'All 103']], play: playMatch, lower: true, unit: 's' },
  part: { k: '的', title: 'Particle Sniper', desc: 'Pick the right particle before the fuse burns out. It gets faster. Three lives.', modes: null, play: playPart },
  num: { k: '数', title: 'Number Ninja', desc: 'Prices, clock times, dates and counters at speed. 60 seconds.', modes: [['mix', 'Everything'], ['num', 'Prices'], ['time', 'Times'], ['date', 'Dates'], ['count', 'Counters']], play: playNum },
  verb: { k: '動', title: 'Verb Forge', desc: 'Conjugate on the clock: ます, ません, て, た, ない and more. 60 seconds.', modes: [['all', 'All forms'], ['masu', 'ます family'], ['te', 'て, た, ない']], play: playVerb },
  listen: { k: '聞', title: 'Listen & Tap', desc: 'Hear a word, tap its meaning. Three lives. Trains the ear for the listening section.', modes: [['learned', 'My words'], ['all', 'All words']], play: playListen, voice: true }
};
const bestKey = (id, mode) => id + ':' + (mode || '-');
function bestText(G, v) { return v == null ? '—' : G.lower ? v.toFixed(1) + ' s' : String(v); }
view('arcade', 'arcade', () => {
  const root = h('div', { class: 'stack' });
  root.append(head('Arcade', 'One-minute games that drill exactly what the test asks. Play one when you have a spare minute on the commute.', '遊 Arcade'));
  root.append(h('div', { class: 'arcade' }, Object.keys(GAMES).map(id => { const G = GAMES[id], m = G.modes ? G.modes[0][0] : '', b = S.games[bestKey(id, m)];
    return h('button', { class: 'game', type: 'button', onclick: () => go('game', { id }) }, h('span', { class: 'gk', 'aria-hidden': 'true' }, G.k), h('b', {}, G.title), h('span', {}, G.desc), h('span', { class: 'hi' }, 'BEST ' + bestText(G, b))); })));
  return root;
});
view('game', 'arcade', p => {
  const G = GAMES[p.id], root = h('div', { class: 'stack' });
  if (!G) return root;
  let mode = S.games['mode:' + p.id] || (G.modes ? G.modes[0][0] : '');
  function intro() {
    root.innerHTML = '';
    root.append(head(G.title, G.desc, '遊 Arcade'));
    const best = S.games[bestKey(p.id, mode)];
    const vh = G.voice ? voiceHelp() : null;
    root.append(h('div', { class: 'card intro-card' }, h('div', { class: 'row' }, h('span', { class: 'big-ja' }, G.k), h('div', {}, h('div', { class: 'eyebrow' }, 'Best'), h('div', { class: 'big-num', style: 'font-size:32px' }, bestText(G, best)))),
      G.modes ? chipset(G.modes, mode, v => { mode = v; S.games['mode:' + p.id] = v; save(); intro(); }) : null, vh,
      h('button', { class: 'btn pink', type: 'button', disabled: !!vh, onclick: play }, 'Start'),
      h('div', { class: 'small mute' }, 'Keys 1 to 4 work too.')));
  }
  function play() {
    root.innerHTML = '';
    root.append(h('div', { class: 'row' }, h('button', { class: 'back', type: 'button', onclick: intro }, ico('back'), 'Quit'), h('b', {}, G.title)));
    root.append(G.play(mode, (score, info) => over(score, info)));
  }
  function over(score, info) {
    const k = bestKey(p.id, mode), prev = S.games[k];
    const better = prev == null || (G.lower ? score < prev : score > prev);
    if (better) S.games[k] = score;
    if (better && prev != null) loveToast(pick(PEP.record));
    save();
    gainXP(G.lower ? 15 : Math.min(40, Math.round(score)));
    root.innerHTML = '';
    root.append(head(G.title, '', '遊 Arcade'), h('div', { class: 'card result' }, better && prev != null ? h('div', { class: 'stamp pop', style: 'font-size:24px' }, '新記録') : null,
      h('div', { class: 'score' }, bestText(G, score)), h('div', { class: 'mute' }, G.lower ? plural(info.misses, 'miss', 'misses') : info.right + ' right of ' + info.total),
      h('div', { class: 'mute small' }, 'Best ' + bestText(G, S.games[k])),
      h('div', { class: 'row', style: 'justify-content:center' }, h('button', { class: 'btn pink', type: 'button', onclick: play }, 'Play again'), h('button', { class: 'btn', type: 'button', onclick: () => tab('arcade') }, 'Arcade'))));
    if (better && prev != null) { celebrate(); SFX.win(); }
  }
  intro();
  return root;
});
