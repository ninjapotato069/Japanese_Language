#!/usr/bin/env python3
"""Bundle data + app into single-file pages:
  dist/artifact.html              content-only page (published as a Claude artifact)
  docs/index.html                 full page for GitHub Pages (installable web app)
  android/apkdir/assets/www/      full page with fonts embedded, for the Android app
  dist/test.html, dist/app.js     test builds
Run tools/build_levels.py and tools/build_content.py first if the data or content changed."""
import json, os, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / 'app'
SRC, DATA = APP / 'src', APP / 'data'
TITLE = 'JLPT Cheat Codes'
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=DotGothic16'
         '&family=Klee+One:wght@400;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap">')
SHELL = '''<div class="shell" id="app">
<header class="top">
<button class="seal" id="seal" type="button" aria-label="Pep talk" title="Pep talk">合</button><button class="brand" id="brand" type="button" aria-label="Go to Today"><span><b>JLPT Cheat Codes</b><small id="brand-sub"></small></span></button>
<div class="chips"><span class="chip" id="chip-streak"></span><span class="chip xp" id="chip-xp"></span><button class="iconbtn" id="btn-set" type="button" aria-label="Settings"></button></div>
</header>
<main id="view"></main>
<nav class="tabs" id="tabs" aria-label="Sections"></nav>
</div>
<div class="toast" id="toast" aria-live="polite"></div>'''


def safe(js):
    return js.replace('</script', '<\\/script')


def app_js():
    parts = []
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.js'):
            continue
        if f.startswith('25-'):   # the wording file goes just before the code that uses it
            parts.append((SRC / 'editions' / 'neutral.js').read_text() + '\n')
        parts.append((SRC / f).read_text() + '\n')
    return ''.join(parts)


def jdump(x):
    return json.dumps(x, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def build():
    css = (SRC / 'style.css').read_text()
    data = ''.join((DATA / f).read_text() + '\n' for f in ['kana.js', 'kanji.js', 'vocab.js', 'grammar.js', 'core.js'])
    pj = jdump(json.loads((DATA / 'papers.json').read_text()))
    content = json.loads((DATA / 'levels' / 'content.json').read_text())
    levels = {}
    for lv in ('n4', 'n3', 'n2', 'n1'):
        pack = json.loads((DATA / 'levels' / f'{lv}.json').read_text())
        pack['grammar'] = content['grammar'][lv]
        pack['exam'] = content['exam'][lv]
        levels[lv] = pack
    freq = json.loads((DATA / 'levels' / 'freq.json').read_text())
    extra = 'window.LEVELS=' + jdump(levels) + ';\nwindow.TALK=' + jdump(content['talk']) + ';\nwindow.FREQ=' + jdump(freq) + ';'
    fontcss = (APP / 'fonts' / 'fonts.css').read_text() if (APP / 'fonts' / 'fonts.css').exists() else ''
    app = app_js()
    version = re.search(r"APP_VERSION = '([^']+)'", app).group(1)
    rescue = (APP / 'shell' / 'rescue.js').read_text().replace('__VERSION__', version)
    # rescue screen first (plain ES5), then data and app; the last line shows the rescue screen if the app never drew a screen
    scripts = ('<script>' + safe(rescue) + '</script>\n'
               '<script>' + safe(data) + '</script>\n<script>window.PAPERS=' + pj + ';</script>\n<script>' + extra + '</script>\n'
               '<script>(function(){"use strict";\n' + safe(app) + '\n})();</script>\n'
               '<script>if(!window.__booted&&window.__rescue)window.__rescue();</script>')
    head = f'<title>{TITLE}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n{FONTS}\n<style>\n{css}\n</style>\n'
    page = head + SHELL + '\n' + scripts + '\n'
    (ROOT / 'dist').mkdir(exist_ok=True)
    (ROOT / 'dist' / 'artifact.html').write_text(page)

    def full(head_extra, fonts, tail=''):
        return ('<!doctype html>\n<html lang="ja"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
                f'<title>{TITLE}</title>{head_extra}<style>\n{fonts}\nhtml{{-webkit-text-size-adjust:100%}}\n{css}\n</style></head>\n<body>\n'
                + SHELL + '\n' + scripts + '\n' + tail + '</body></html>\n')

    www = ROOT / 'android' / 'apkdir' / 'assets' / 'www'
    www.mkdir(parents=True, exist_ok=True)
    (www / 'index.html').write_text(full('', fontcss))
    pwa_head = ('<meta name="theme-color" content="#D63F6B"><link rel="manifest" href="manifest.webmanifest">'
                '<link rel="icon" href="favicon.png" type="image/png"><link rel="apple-touch-icon" href="icon-192.png">' + FONTS)
    pwa_tail = "<script>if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(function(){});</script>\n"
    docs = ROOT / 'docs'
    docs.mkdir(exist_ok=True)
    (docs / 'index.html').write_text(full(pwa_head, '', pwa_tail))
    (docs / 'version.json').write_text(json.dumps({'version': version, 'apk': f'releases/JLPT-Cheat-Codes-v{version}.apk', 'notes': 'See CHANGELOG.md'}, indent=1) + '\n')
    sw = (APP / 'shell' / 'sw.js').read_text().replace('__VERSION__', version)
    (docs / 'sw.js').write_text(sw)
    hook = ('window.__T={go:go,tab:tab,swap:swap,back:back,model:model,render:render,get S(){return S},set S(v){S=v},LESSONS:LESSONS,GAMES:GAMES,TTS:TTS,'
            'genPlan:genPlan,todaySession:todaySession,planOrder:planOrder,sessionPop:sessionPop,streakPop:streakPop,paperPassPop:paperPassPop,'
            'helloSheet:helloSheet,pepTalk:pepTalk,PEP:PEP,checkSession:checkSession,NOTIFY:NOTIFY,Notify:Notify,ED:ED,EDITION:EDITION,notifyAsk:notifyAsk,'
            'LV:LV,PAPERS:PAPERS,ITEMS:ITEMS,VOCAB:VOCAB,KANJI:KANJI,GRAMMAR:GRAMMAR,testQs:testQs,qFor:qFor,setLevel:setLevel,mergeStates:mergeStates,switchLevelState:switchLevelState,TALK:TALK,FREQ:FREQ,VIEWS:VIEWS,VSET:VSET,DECK:DECK,qFreq:qFreq,ITEM:ITEM,dueKeys:dueKeys};')
    test = page.replace('\n})();</script>', '\n' + hook + '\n})();</script>').replace(FONTS, '<style>' + fontcss + '</style>')
    (ROOT / 'dist' / 'test.html').write_text('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + test + '</body></html>')
    (ROOT / 'dist' / 'app.js').write_text(data + '\nwindow.PAPERS=' + pj + ';\n' + extra + '\n(function(){"use strict";\n' + app + '\n})();\n')
    print('v' + version, '· artifact', len(page.encode()) // 1024, 'KB · android', len((www / 'index.html').read_bytes()) // 1024, 'KB · web', len((docs / 'index.html').read_bytes()) // 1024, 'KB')


if __name__ == '__main__':
    build()
