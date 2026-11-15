#!/usr/bin/env python3
"""Parse the hand-written content in content/ into app/data/levels/content.json."""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
C = ROOT / 'content'
errors = []


def lines(path):
    for n, raw in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        s = raw.strip()
        if s and not s.startswith(';'):
            yield n, s


def cells(s, sep='|'):
    return [c.strip() for c in s.split(sep)]


def grammar(lv):
    path = C / 'grammar' / f'n{lv}.txt'
    units, unit, pt = [], None, None
    for n, s in lines(path):
        if s.startswith('=='):
            c = cells(s[2:])
            unit = {'id': f'n{lv}u{len(units) + 1}', 'title': c[0], 'kanji': c[1] if len(c) > 1 else '文', 'points': []}
            units.append(unit)
        elif s.startswith('#'):
            c = cells(s[1:]) + ['', '', '']
            pt = {'t': c[0], 'p': c[1], 'm': c[2], 'n': c[3], 'ex': [], 'q': []}
            unit['points'].append(pt)
        else:
            c = cells(s)
            m = re.search(r'\{(.+?)\}', c[0])
            if len(c) != 5 or not m:
                errors.append(f'{path.name}:{n}: need "sentence with {{answer}} | en | wrong | wrong | wrong"')
                continue
            ans = m.group(1)
            opts = [ans] + c[2:]
            if len(set(opts)) != 4:
                errors.append(f'{path.name}:{n}: duplicate options')
            pt['ex'].append([c[0].replace('{', '').replace('}', ''), c[1]])
            pt['q'].append([c[0][:m.start()] + '（　）' + c[0][m.end():], opts, 0])
    for u in units:
        for p in u['points']:
            if len(p['ex']) < 1:
                errors.append(f'{path.name}: {p["t"]} has no examples')
    return units


def exam(lv):
    path = C / 'exam' / f'n{lv}.txt'
    out = {'kumi': [], 'tanbun': [], 'chubun': [], 'sokuji': [], 'point': []}
    sec = None
    for n, s in lines(path):
        if s.startswith('['):
            sec = s.strip('[]')
            continue
        where = f'{path.name}:{n}'
        if sec == 'kumi':
            c = cells(s)
            if len(c) != 7:
                errors.append(where + ': kumi needs 7 fields'); continue
            out['kumi'].append({'pre': c[0], 'p': c[1:5], 'post': c[5], 'en': c[6]})
        elif sec in ('tanbun', 'chubun'):
            parts = [x.strip() for x in s.split('||')]
            text = [t for t in parts[0].split('／') if t]
            qs = []
            for qp in parts[1:]:
                c = cells(qp)
                if len(c) != 6:
                    errors.append(where + ': question needs "q | right | w | w | w | note"'); continue
                qs.append({'q': c[0], 'o': c[1:5], 'w': c[5]})
            if not qs:
                errors.append(where + ': no questions'); continue
            out[sec].append({'text': text, 'qs': qs})
        elif sec == 'sokuji':
            c = cells(s)
            if len(c) != 6:
                errors.append(where + ': sokuji needs 6 fields'); continue
            out['sokuji'].append({'spk': c[0], 'u': c[1], 'o': c[2:5], 'w': c[5]})
        elif sec == 'point':
            c = cells(s)
            if len(c) != 8:
                errors.append(where + ': point needs 8 fields'); continue
            ls = []
            for l in c[2].split('／'):
                sp, _, tx = l.partition(':')
                ls.append([sp.strip(), tx.strip()])
            out['point'].append({'set': c[0], 'q': c[1], 'lines': ls, 'o': c[3:7], 'w': c[7]})
    return out


def talk():
    path = C / 'talk.txt'
    T = {'islands': [], 'tactics': [], 'drills': [], 'missions': []}
    sec, cur = None, None
    for n, s in lines(path):
        if s.startswith('['):
            sec = s.strip('[]'); cur = None
            continue
        where = f'{path.name}:{n}'
        if s.startswith('='):
            c = cells(s[1:])
            if sec == 'islands':
                cur = {'id': c[0], 'title': c[1], 'why': c[2], 'slots': [], 'lines': []}
            elif sec == 'tactics':
                cur = {'id': c[0], 'title': c[1], 'why': c[2], 'lines': []}
            elif sec == 'drills':
                cur = {'f': c[0], 'en': c[1], 'subs': []}
            elif sec == 'missions':
                cur = {'id': c[0], 'title': c[1], 'set': c[2], 'lv': int(c[3]), 'lines': []}
            T[sec].append(cur)
            continue
        if cur is None:
            errors.append(where + ': line before a "=" header'); continue
        if sec == 'islands':
            if s.startswith('@'):
                c = cells(s[1:])
                cur['slots'].append({'id': c[0], 'label': c[1], 'opts': [o.split('=') for o in c[2:] if o != '*'], 'free': '*' in c[2:]})
            else:
                c = cells(s)
                cur['lines'].append([c[0], c[1]])
        elif sec == 'tactics':
            c = cells(s) + ['']
            cur['lines'].append(c[:3])
        elif sec == 'drills':
            cur['subs'] = [o.split('=') for o in cells(s)]
            if '＿' not in cur['f'] or '_' not in cur['en'] or any(len(o) != 2 for o in cur['subs']):
                errors.append(where + ': drill needs ＿ in the frame, _ in English and jp=en pairs')
        elif sec == 'missions':
            who, _, rest = s.partition(':')
            c = cells(rest)
            if who not in ('A', 'B') or len(c) != 2:
                errors.append(where + ': mission line must be "A: jp | en" or "B: jp | en"'); continue
            cur['lines'].append([who, c[0], c[1]])
    for isl in T['islands']:
        ids = {s['id'] for s in isl['slots']}
        for jp, en in isl['lines']:
            for m in re.findall(r'\{(\w+)\}', jp + en):
                if m not in ids:
                    errors.append(f'talk.txt: island {isl["id"]} uses unknown slot {m}')
    return T


out = {'grammar': {f'n{lv}': grammar(lv) for lv in (4, 3, 2, 1)}, 'exam': {f'n{lv}': exam(lv) for lv in (4, 3, 2, 1)}, 'talk': talk()}
if errors:
    print('\n'.join(errors)); sys.exit(1)
dst = ROOT / 'app' / 'data' / 'levels' / 'content.json'
dst.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
for lv in ('n4', 'n3', 'n2', 'n1'):
    g, e = out['grammar'][lv], out['exam'][lv]
    print(lv, 'grammar', sum(len(u['points']) for u in g), 'points /', sum(len(p['q']) for u in g for p in u['points']), 'items · exam', {k: len(v) for k, v in e.items()})
t = out['talk']
print('talk', {k: len(v) for k, v in t.items()}, 'phrases', sum(len(x['lines']) for x in t['tactics']), 'drill lines', sum(len(x['subs']) for x in t['drills']), 'mission lines', sum(len(x['lines']) for x in t['missions']))
