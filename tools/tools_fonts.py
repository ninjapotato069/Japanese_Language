#!/usr/bin/env python3
"""Subset the four Google Fonts families (from @fontsource npm packages) to the characters the app uses.
Writes fonts/*.woff2 and fonts/fonts.css (data: URIs) for the offline Android build."""
import base64, io, pathlib, sys
from fontTools import subset
from fontTools.ttLib import TTFont

FS = pathlib.Path(sys.argv[1])            # node_modules/@fontsource
ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / 'fonts'
html = ''.join((ROOT / 'dist' / n).read_text(encoding='utf-8') for n in ['n5-cheat-codes.html', 'n5-neutral.html'] if (ROOT / 'dist' / n).exists())
used = set(ord(c) for c in html)
for a, b in [(0x20, 0x7E), (0xA0, 0xFF), (0x2000, 0x206F), (0x2190, 0x21FF), (0x3000, 0x30FF), (0xFF01, 0xFF5E)]:
    used.update(range(a, b + 1))
used.update(ord(c) for c in '★☆♥♡✓×・→➡〜ー')
FACES = [('Zen Kaku Gothic New', 'zen-kaku-gothic-new', 400), ('Zen Kaku Gothic New', 'zen-kaku-gothic-new', 700),
         ('Klee One', 'klee-one', 600), ('Dela Gothic One', 'dela-gothic-one', 400), ('DotGothic16', 'dotgothic16', 400)]

def ranges(cps):
    cps = sorted(cps); out = []; s = p = cps[0]
    for c in cps[1:]:
        if c == p + 1: p = c; continue
        out.append((s, p)); s = p = c
    out.append((s, p))
    return ','.join(('U+%X' % a) if a == b else ('U+%X-%X' % (a, b)) for a, b in out)

def sub(path, chars):
    f = TTFont(str(path))
    cmap = f.getBestCmap() or {}
    keep = sorted(c for c in chars if c in cmap)
    if not keep: return None, []
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
    s = subset.Subsetter(options=opts); s.populate(unicodes=keep); s.subset(f)
    buf = io.BytesIO(); f.flavor = 'woff2'; f.save(buf)
    return buf.getvalue(), keep

css = []
total = 0
for fam, pkg, w in FACES:
    latin = FS / pkg / 'files' / f'{pkg}-latin-{w}-normal.woff2'
    jap = FS / pkg / 'files' / f'{pkg}-japanese-{w}-normal.woff2'
    remaining = set(used)
    for part, path in [('latin', latin), ('ja', jap)]:
        if not path.exists(): continue
        data, keep = sub(path, remaining)
        if not data: continue
        remaining -= set(keep)
        name = f'{pkg}-{w}-{part}.woff2'
        (OUT / name).write_bytes(data)
        total += len(data)
        b64 = base64.b64encode(data).decode()
        css.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}" % (fam, w, b64, ranges(keep)))
        print(name, len(data) // 1024, 'KB', len(keep), 'glyphs')
(OUT / 'fonts.css').write_text('\n'.join(css))
print('total', total // 1024, 'KB')
