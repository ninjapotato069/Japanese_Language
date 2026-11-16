/* ===== 90 · boot ===== */
function boot() {
  document.documentElement.setAttribute('lang', 'ja');
  migrate();
  applyTheme();
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch (e) {}
  TTS.init();
  const tabs = $('#tabs');
  TABS.forEach(t => tabs.append(h('button', { type: 'button', 'data-tab': t[0], onclick: () => tab(t[0]) }, h('span', { class: 'k', 'aria-hidden': 'true' }, t[1]), h('span', { class: 'l' }, t[2]))));
  $('.chips').prepend(h('button', { class: 'lvbadge', id: 'lvbadge', type: 'button', title: 'Switch level', 'aria-label': 'Level ' + LVNAME + '. Switch level', onclick: levelSheet }, h('i', { 'aria-hidden': 'true' }), LVNAME));
  const gear = $('#btn-set');
  gear.append(ico('gear'));
  gear.onclick = () => go('settings');
  $('#brand').onclick = () => tab('home');
  $('#seal').onclick = () => { if (loveOn()) pepTalk(); else tab('home'); };
  document.addEventListener('click', e => {
    const a = e.target && e.target.closest ? e.target.closest('a[href^="http"]') : null;
    if (a && window.AndroidApp && AndroidApp.open) { e.preventDefault(); try { AndroidApp.open(a.href); } catch (x) {} }
  });
  const map = { today: 'home', route: 'route', learn: 'learn', talk: 'talk', arcade: 'arcade', mocks: 'mocks' };
  const hs = (location.hash || '').replace('#', '');
  NAV.stack = [{ name: map[hs] || 'home', p: {} }];
  render();
  window.__booted = true;   // the screen is up; the rescue screen in the page shell checks this flag
  Notify.sync();
  Cloud.init();
  let day = today();
  setInterval(() => { if (today() !== day) { day = today(); if (cur().name === 'home') render(true); updateChips(); } }, 60000);
}
try { boot(); }
catch (e) {
  logErr('start: ' + ((e && e.message) || e));
  if (!window.__booted && window.__rescue) window.__rescue(e);
}
