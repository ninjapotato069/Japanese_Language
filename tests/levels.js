// Every level boots, every view opens, every lesson can build its test, every generated paper is well formed.
// Run: node tests/levels.js   (after python3 tools/build.py)
const { chromium } = require(process.env.PW || 'playwright');
const path = require('path');
const PAGE = 'file://' + path.resolve(__dirname, '..', 'dist', 'test.html');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL ' + m); } else if (process.env.V) console.log('  pass ' + m); };

(async () => {
  const browser = await chromium.launch();
  for (const lv of ['n5', 'n4', 'n3', 'n2', 'n1']) {
    const ctx = await browser.newContext({ viewport: { width: 393, height: 851 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    await page.addInitScript(lv => {
      if (!localStorage.getItem('n5cc.v1')) localStorage.setItem('n5cc.v1', JSON.stringify({ v: 1, setup: true, created: '2026-11-01', updated: 5, xp: 10, set: { lv, love: false }, lv: { hello: '2099-01-01', st: 0, pp: {}, nAsk: 'x' } }));
    }, lv);
    await page.goto(PAGE);
    await page.waitForTimeout(600);
    const t0 = Date.now();
    const info = await page.evaluate(() => ({ booted: window.__booted === true, lv: __T.LV, lessons: __T.LESSONS.length, words: __T.VOCAB.all.length, kanji: __T.KANJI.length, gram: __T.GRAMMAR.length, papers: __T.PAPERS.length, views: Object.keys(__T.VIEWS) }));
    console.log(lv.toUpperCase() + ': ' + JSON.stringify(Object.assign({}, info, { views: info.views.length })));
    ok(info.booted && info.lv === lv, lv + ' boots at its own level');
    // lessons: every lesson builds a test with valid questions
    const les = await page.evaluate(() => {
      const bad = []; let n = 0;
      __T.LESSONS.forEach(L => {
        try {
          const qs = __T.testQs(L);
          if (qs.length < 4) bad.push(L.id + ': only ' + qs.length + ' questions');
          qs.forEach(q => { n++; if (!q.o || q.o.length < 2 || new Set(q.o).size !== q.o.length || q.a < 0 || q.a >= q.o.length || q.o.some(o => !o || /undefined|null|NaN/.test(o))) bad.push(L.id + ': bad question ' + JSON.stringify(q.o) + ' a=' + q.a); });
        } catch (e) { bad.push(L.id + ': ' + e.message); }
      });
      return { n, bad: bad.slice(0, 8), badN: bad.length };
    });
    ok(les.badN === 0, lv + ' lesson tests: ' + les.n + ' questions, ' + les.badN + ' bad ' + JSON.stringify(les.bad));
    // papers: every question of every section
    const pap = await page.evaluate(() => {
      const bad = []; let n = 0; const sizes = [];
      for (let P = 1; P <= __T.PAPERS.length; P++) for (let s = 1; s <= 3; s++) {
        try {
          const m = __T.model(P, s);
          if (P === 1) sizes.push(m.groups.map(g => g.type + ':' + g.qs.length).join(' ') + ' = ' + m.max);
          if (!m.flat.length) bad.push(P + '-' + s + ' empty');
          const want = { 1: 42, 2: 78, 3: 60 }[s];
          if (Math.abs(m.max - want) > 0.11) bad.push(P + '-' + s + ' max ' + m.max);
          m.flat.forEach(q => { n++; const need = q.type === 'sokuji' || q.type === 'hatsuwa' ? 3 : 4;
            if (!q.o || q.o.length !== need || new Set(q.o).size !== need || !(q.a >= 1 && q.a <= need) || q.o.some(o => !o || /undefined|NaN/.test(o)) || /undefined|NaN/.test(q.stem || '') || !q.w) bad.push(P + '-' + s + ' q' + q.no + ' ' + q.type + ' ' + JSON.stringify(q.o) + ' a=' + q.a); });
        } catch (e) { bad.push(P + '-' + s + ': ' + e.message); }
      }
      return { n, bad: bad.slice(0, 8), badN: bad.length, sizes };
    });
    console.log('   paper 1: ' + pap.sizes.join(' | '));
    ok(pap.badN === 0, lv + ' papers: ' + pap.n + ' questions, ' + pap.badN + ' bad ' + JSON.stringify(pap.bad));
    // every view opens without an error
    const params = await page.evaluate(() => { const L = __T.LESSONS; const by = k => (L.find(l => l.kind === k) || {}).id; return { lessons: ['kana', 'vocab', 'kanji', 'grammar', 'core'].map(by).filter(Boolean), deck: __T.VOCAB.decks[0].id, vset: Object.keys(__T.VSET)[0] }; });
    const P0 = { deck: { id: params.deck }, vaultset: { id: params.vset }, drill: { type: 'kanji' } };
    const visits = info.views.filter(v => !/^(lesson|exam|result|paper|game)$/.test(v)).map(v => [v, P0[v] || {}]);
    params.lessons.forEach(id => visits.push(['lesson', { id }]));
    visits.push(['paper', { p: 1 }], ['exam', { p: 1, s: 1, mode: 'practice' }], ['exam', { p: 2, s: 2, mode: 'practice' }], ['exam', { p: 1, s: 3, mode: 'practice' }]);
    for (const [v, p] of visits) {
      const before = errs.length;
      const res = await page.evaluate(([v, p]) => { try { __T.go(v, p); return document.querySelector('#view').innerText.length; } catch (e) { return 'throw ' + e.message; } }, [v, p]);
      await page.waitForTimeout(60);
      const txt = await page.evaluate(() => document.querySelector('#view').innerText.slice(0, 200));
      ok(typeof res === 'number' && res > 20 && errs.length === before && !/Something went wrong|couldn’t open this screen/i.test(txt), lv + ' view ' + v + ' ' + JSON.stringify(p) + ' → ' + res + ' ' + (errs.slice(before).join(' | ') || '') + (typeof res === 'number' && res <= 20 ? ' [' + txt + ']' : ''));
      await page.evaluate(() => { document.querySelectorAll('.sheet-wrap,.scrim').forEach(x => x.remove()); });
    }
    const diag = await page.evaluate(() => (__T.S.diag || []).map(d => d.m));
    ok(diag.length === 0, lv + ' error log empty: ' + JSON.stringify(diag.slice(0, 5)));
    ok(errs.length === 0, lv + ' page errors: ' + JSON.stringify(errs.slice(0, 5)));
    console.log('   ' + visits.length + ' views, ' + les.n + ' lesson questions, ' + pap.n + ' paper questions in ' + (Date.now() - t0) + ' ms');
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
  process.exit(fails ? 1 : 0);
})();
