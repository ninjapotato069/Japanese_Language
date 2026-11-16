// Talk tab flows and level switching.  Run: node tests/talk.js   (after python3 tools/build.py)
const { chromium } = require(process.env.PW || 'playwright');
const path = require('path');
const PAGE = 'file://' + path.resolve(__dirname, '..', 'dist', 'test.html');
let fails = 0;
const ok = (c, m) => { console.log((c ? '  pass ' : '  FAIL ') + m); if (!c) fails++; };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 393, height: 851 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await page.addInitScript(() => {
    if (!localStorage.getItem('n5cc.v1')) localStorage.setItem('n5cc.v1', JSON.stringify({ v: 1, setup: true, created: '2026-11-01', updated: 5, xp: 10, set: { lv: 'n5', love: false }, lv: { hello: '2099-01-01', st: 0, pp: {}, nAsk: 'x', ver: '2.0.0' } }));
    window.speechSynthesis && (window.speechSynthesis.speak = u => setTimeout(() => u.onend && u.onend(), 5));
  });
  await page.goto(PAGE);
  await page.waitForTimeout(500);
  const S = () => page.evaluate(() => JSON.parse(localStorage.getItem('n5cc.v1')));

  console.log('Core words: listen, say, check');
  await page.evaluate(() => __T.go('coreset', { b: 0 }));
  for (let i = 0; i < 25 && await page.locator('.fc-actions .btn.primary').count(); i++) await page.click('.fc-actions .btn.primary');
  await page.click('button:has-text("Next: say them")');
  for (let i = 0; i < 60; i++) {
    if (await page.locator('.antic .result').count()) break;
    const show = page.locator('.antic button:has-text("Show me"):visible');
    if (await show.count()) await show.click();
    await page.click('.antic .grade button.primary');
  }
  ok(await page.locator('.antic .result').count() === 1, 'anticipation round finishes');
  await page.click('button:has-text("Next: check by ear")');
  for (let i = 0; i < 60; i++) {
    const info = await page.evaluate(() => { const q = document.querySelector('.quiz'); if (!q || !q.__st) return { gone: 1 }; const st = q.__st; if (st.i >= q.__qs.length) return { done: 1 }; return { a: q.__qs[st.i].a, locked: st.locked }; });
    if (info.gone || info.done) break;
    if (info.locked) { await page.click('.quiz .btn.primary:not([hidden])'); continue; }
    await page.locator('.quiz .opts .opt').nth(info.a).click();
    await page.waitForTimeout(30);
  }
  let st = await S();
  const fkeys = Object.keys(st.srs).filter(k => k.startsWith('f:'));
  ok(fkeys.length === 20 && st.talk.cb && st.talk.cb[0] === 1, 'first 20 core words saved to the review deck (' + fkeys.length + ')');
  ok(await page.evaluate(() => __T.dueKeys().length >= 0 && !!__T.ITEM('f:' + __T.FREQ[0].w)), 'core words are review-deck items');
  const q = await page.evaluate(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const it = __T.ITEM('f:' + __T.FREQ[i * 37].w); return ['listen', 'mean', 'jp'].map(m => { const x = __T.qFreq(it, m); return x.o.length === 4 && new Set(x.o).size === 4 && x.a >= 0 && x.o[x.a] === (m === 'jp' ? it.w : it.m); }).every(Boolean); }).every(Boolean));
  ok(q, 'core-word questions are well formed in all three modes');

  console.log('Speech island');
  await page.evaluate(() => __T.go('island', { id: 'me' }));
  await page.fill('#isl-me-name', 'ロハン');
  await page.click('.chipset button[data-v="インド"]');
  const script = await page.innerText('#view');
  ok(/ロハンと もうします/.test(script) && /インドから きました/.test(script), 'island lines fill in your details');
  await page.click('button:has-text("Rehearse line by line")');
  for (let i = 0; i < 20; i++) {
    if (await page.locator('.antic .result').count()) break;
    const show = page.locator('.antic button:has-text("Show me"):visible');
    if (await show.count()) await show.click();
    await page.click('.antic .grade button.primary');
  }
  st = await S();
  ok(st.talk.isl.me.r === 1 && st.talk.isl.me.v.name.jp === 'ロハン', 'rehearsal run and details saved');

  console.log('Mission');
  await page.evaluate(() => __T.go('mission', { id: 'konbini' }));
  for (let i = 0; i < 40; i++) {
    if (await page.locator('.chat ~ .result, .result').count()) break;
    const chk = page.locator('.msg.me.pending button:has-text("Check")');
    if (await chk.count()) { await chk.click(); await page.click('.msg.me.pending button:has-text("I said it")'); }
    else await page.waitForTimeout(120);
  }
  st = await S();
  ok(st.talk.mis && st.talk.mis.konbini && st.talk.mis.konbini.best === 4 && st.talk.mis.konbini.of === 4, 'mission scored 4/4 and saved');

  console.log('Daily workout');
  await page.evaluate(() => __T.go('talkdaily'));
  for (let i = 0; i < 120; i++) {
    if (await page.locator('.result .stamp').count() && await page.locator('button:has-text("Done")').count()) break;
    const r1 = page.locator('button:has-text("Round 2"), button:has-text("Round 3")');
    if (await r1.count()) { await r1.first().click(); continue; }
    const show = page.locator('.antic button:has-text("Show me"):visible');
    if (await show.count()) await show.click();
    const g = page.locator('.antic .grade button.primary:visible');
    if (await g.count()) { await g.click(); continue; }
    const chk = page.locator('.msg.me.pending button:has-text("Check")');
    if (await chk.count()) { await chk.click(); await page.click('.msg.me.pending button:has-text("I said it")'); continue; }
    await page.waitForTimeout(100);
  }
  st = await S();
  const day = Object.keys(st.days).sort().pop();
  ok(st.days[day].tk === 1, 'workout marks today as done');
  ok(await page.evaluate(() => __T.todaySession().tasks.some(t => t.t === 'talk' && t.extra)), 'workout is a bonus task in Today’s session');

  console.log('Level switching keeps each level’s data');
  await page.evaluate(() => { const S = __T.S; S.mocks = { 3: { 1: { sc: 30, mx: 42, pct: 0.7, d: '2026-11-10', n: 1 } } }; S.hist = [{ p: 3, s: 1, sc: 30, mx: 42, d: '2026-11-10', m: 'exam' }]; localStorage.setItem('n5cc.v1', JSON.stringify(S)); });
  await Promise.all([page.waitForEvent('load'), page.evaluate(() => __T.setLevel('n2')).catch(() => {})]);
  await page.waitForTimeout(600);
  let info = await page.evaluate(() => ({ lv: __T.LV, mocks: Object.keys(__T.S.mocks).length, kept: !!(__T.S.L.n5 && __T.S.L.n5.mocks[3]), srs: Object.keys(__T.S.srs).filter(k => k.startsWith('f:')).length, talk: !!__T.S.talk.mis.konbini }));
  ok(info.lv === 'n2' && info.mocks === 0 && info.kept, 'N2 starts with its own empty mock record; N5 scores are kept aside');
  ok(info.srs >= 20 && info.talk, 'Talk progress and core words carry over to N2 (' + info.srs + ' core words)');
  await Promise.all([page.waitForEvent('load'), page.evaluate(() => __T.setLevel('n5')).catch(() => {})]);
  await page.waitForTimeout(600);
  info = await page.evaluate(() => ({ lv: __T.LV, m: __T.S.mocks[3] && __T.S.mocks[3][1].sc, h: __T.S.hist.length, L: Object.keys(__T.S.L) }));
  ok(info.lv === 'n5' && info.m === 30 && info.h === 1 && info.L.indexOf('n5') < 0 && info.L.indexOf('n2') >= 0, 'switching back restores N5 scores (' + JSON.stringify(info) + ')');
  // two copies at different levels merge without losing either level
  const merged = await page.evaluate(() => {
    const a = JSON.parse(JSON.stringify(__T.S)); a.updated = 100;
    const b = JSON.parse(JSON.stringify(__T.S)); b.updated = 200; __T.switchLevelState(b, 'n3'); b.mocks = { 1: { 2: { sc: 50, mx: 78, pct: 0.64, d: '2026-11-12', n: 1 } } };
    const m = __T.mergeStates(a, b);
    return { lv: m.set.lv, n3: !!(m.mocks[1] && m.mocks[1][2]), n5: !!(m.L.n5 && m.L.n5.mocks[3]) };
  });
  ok(merged.lv === 'n3' && merged.n3 && merged.n5, 'merging copies on different levels keeps both (' + JSON.stringify(merged) + ')');
  ok(!errs.length, 'no page errors: ' + (errs.join(' | ') || 'none'));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
  process.exit(fails ? 1 : 0);
})();
