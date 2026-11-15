#!/usr/bin/env python3
"""Bundle data + app into one HTML page per edition: the artifact page (content only) and the Android page (full document)."""
import json, os, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
SRC, DATA = ROOT / 'src', ROOT / 'data'
TITLE = 'N5 Cheat Codes'
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=DotGothic16'
         '&family=Klee+One:wght@400;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap">')
SHELL = '''<div class="shell" id="app">
<header class="top">
<button class="seal" id="seal" type="button" aria-label="Pep talk" title="Pep talk">合</button><button class="brand" id="brand" type="button" aria-label="Go to Today"><span><b>N5 Cheat Codes</b><small id="brand-sub"></small></span></button>
<div class="chips"><span class="chip" id="chip-streak"></span><span class="chip xp" id="chip-xp"></span><button class="iconbtn" id="btn-set" type="button" aria-label="Settings"></button></div>
</header>
<main id="view"></main>
<nav class="tabs" id="tabs" aria-label="Sections"></nav>
</div>
<div class="toast" id="toast" aria-live="polite"></div>'''


def safe(js):
    return js.replace('</script', '<\\/script')


# Editions share all code; only the wording file differs.
EDITIONS = {
    'love': {'page': 'dist/n5-cheat-codes.html', 'www': 'apk/www', 'test': 'dist/test.html', 'node': 'dist/app.js'},
    'neutral': {'page': 'dist/n5-neutral.html', 'www': 'apk/www-neutral', 'test': 'dist/test-neutral.html', 'node': 'dist/app-neutral.js'},
}
# none of these may appear anywhere in the neutral build
PERSONAL = []


def app_js(edition):
    parts = []
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.js'):
            continue
        if f.startswith('25-'):   # the edition's wording goes just before the code that uses it
            parts.append((SRC / 'editions' / (edition + '.js')).read_text() + '\n')
        parts.append((SRC / f).read_text() + '\n')
    return ''.join(parts)


def build_edition(edition, css, data, pj, fontcss):
    out = {k: ROOT / v for k, v in EDITIONS[edition].items()}
    app = app_js(edition)
    version = re.search(r"APP_VERSION = '([^']+)'", app).group(1)
    rescue = (ROOT / 'shell' / 'rescue.js').read_text().replace('__VERSION__', version)
    # rescue screen first (plain ES5), then data and app; the last line shows the rescue screen if the app never drew a screen
    scripts = ('<script>' + safe(rescue) + '</script>\n'
               '<script>' + safe(data) + '</script>\n<script>window.PAPERS=' + pj + ';</script>\n'
               '<script>(function(){"use strict";\n' + safe(app) + '\n})();</script>\n'
               '<script>if(!window.__booted&&window.__rescue)window.__rescue();</script>')
    head = f'<title>{TITLE}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n{FONTS}\n<style>\n{css}\n</style>\n'
    page = head + SHELL + '\n' + scripts + '\n'
    out['page'].parent.mkdir(parents=True, exist_ok=True)
    out['page'].write_text(page)
    full = ('<!doctype html>\n<html lang="ja"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            f'<title>{TITLE}</title><style>\n{fontcss}\nhtml{{-webkit-text-size-adjust:100%}}\n{css}\n</style></head>\n<body>\n'
            + SHELL + '\n' + scripts + '\n</body></html>\n')
    out['www'].mkdir(parents=True, exist_ok=True)
    (out['www'] / 'index.html').write_text(full)
    hook = ('window.__T={go:go,tab:tab,swap:swap,back:back,model:model,render:render,get S(){return S},set S(v){S=v},LESSONS:LESSONS,GAMES:GAMES,TTS:TTS,'
            'genPlan:genPlan,todaySession:todaySession,planOrder:planOrder,sessionPop:sessionPop,streakPop:streakPop,paperPassPop:paperPassPop,'
            'helloSheet:helloSheet,pepTalk:pepTalk,PEP:PEP,checkSession:checkSession,NOTIFY:NOTIFY,Notify:Notify,ED:ED,EDITION:EDITION,notifyAsk:notifyAsk};')
    test = page.replace('\n})();</script>', '\n' + hook + '\n})();</script>').replace(FONTS, '<style>' + fontcss + '</style>')
    out['test'].write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + test + '</body></html>')
    out['node'].write_text(data + '\nwindow.PAPERS=' + pj + ';\n(function(){"use strict";\n' + app + '\n})();\n')
    if edition == 'neutral':
        for f in [out['page'], out['www'] / 'index.html']:
            text = f.read_text()
            leaks = [w for w in PERSONAL if w in text]
            assert not leaks, f'personal text in the neutral build ({f.name}): {leaks}'
    print(edition, 'page', len(page.encode()) // 1024, 'KB;', 'apk html', len(full.encode()) // 1024, 'KB')


def build():
    css = (SRC / 'style.css').read_text()
    data = ''.join((DATA / f).read_text() + '\n' for f in ['kana.js', 'kanji.js', 'vocab.js', 'grammar.js', 'core.js'])
    papers = json.loads((DATA / 'papers.json').read_text())
    pj = json.dumps(papers, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    fontcss = (ROOT / 'fonts' / 'fonts.css').read_text() if (ROOT / 'fonts' / 'fonts.css').exists() else ''
    for edition in EDITIONS:
        build_edition(edition, css, data, pj, fontcss)


if __name__ == '__main__':
    build()
