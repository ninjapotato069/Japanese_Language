/* Rescue screen. Runs before the app and is written in plain ES5, so it still works when the app itself cannot start
   (a startup error, or a phone whose web engine is too old for the app's code). If the app has not drawn its first
   screen by the time all scripts have run, the page shell calls window.__rescue() and this shows a way out instead
   of a blank page. It never touches saved progress, except to read it for the backup code. */
(function () {
  var errs = [];
  function note(m) { m = String(m || 'error').slice(0, 220); if (errs.length < 6 && errs.indexOf(m) < 0) errs.push(m); }
  window.addEventListener('error', function (e) { note((e && e.message) + (e && e.lineno ? ' (line ' + e.lineno + ')' : '')); });
  function savedCode() {
    var list = [], best = '', bestAt = -2;
    try { if (window.AndroidApp && AndroidApp.load) list.push(AndroidApp.load()); } catch (e) {}
    try { list.push(localStorage.getItem('n5cc.v1')); } catch (e) {}
    for (var i = 0; i < list.length; i++) {
      var raw = list[i], at = -1;
      if (!raw) continue;
      try { at = JSON.parse(raw).updated || 0; } catch (e) {}
      if (at > bestAt) { bestAt = at; best = raw; }
    }
    return best;
  }
  function el(tag, cls, text) { var x = document.createElement(tag); if (cls) x.className = cls; if (text != null) x.textContent = text; return x; }
  window.__rescue = function (err) {
    if (window.__rescued) return;
    window.__rescued = true;
    if (err) note(err.message || err);
    var ua = navigator.userAgent || '', android = (ua.match(/Android [\d.]+/) || [''])[0], engine = (ua.match(/Chrome\/\d+/) || [''])[0];
    var host = document.getElementById('view') || document.body;
    host.innerHTML = '';
    var card = el('div', 'card stack rescue');
    card.appendChild(el('h2', null, 'The app couldn’t open'));
    card.appendChild(el('p', null, 'Your progress is saved on this device — nothing is lost. Tap Try again. If this keeps happening, send a screenshot of this screen.'));
    var row = el('div', 'row');
    var retry = el('button', 'btn primary', 'Try again');
    retry.type = 'button';
    retry.onclick = function () { location.reload(); };
    var copy = el('button', 'btn ghost', 'Copy backup code');
    copy.type = 'button';
    var box = el('textarea', 'field');
    box.readOnly = true;
    box.style.display = 'none';
    box.setAttribute('aria-label', 'Backup code');
    copy.onclick = function () {
      var code = savedCode();
      if (!code) { copy.textContent = 'No saved progress found'; return; }
      box.value = code;
      box.style.display = 'block';
      box.focus();
      box.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      copy.textContent = ok ? 'Copied ✓' : 'Long-press the code below to copy it';
    };
    row.appendChild(retry);
    row.appendChild(copy);
    card.appendChild(row);
    card.appendChild(box);
    card.appendChild(el('pre', 'mute small', (errs.join('\n') || 'The app stopped while starting.') + '\nApp __VERSION__' + (android ? ' · ' + android : '') + (engine ? ' · ' + engine : '')));
    host.appendChild(card);
  };
}());
