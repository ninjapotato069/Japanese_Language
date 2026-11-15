#!/usr/bin/env python3
"""Build the N4-N1 level packs and the spoken-frequency deck from open datasets.

Inputs (see ATTRIBUTION.md), all expected under --ds:
  open-anki-jlpt-decks/src/n*.csv   JLPT word lists (MIT; based on tanos.co.uk, CC BY)
  kanji-data/kanji.json             kanji with JLPT level (MIT; from KANJIDIC, CC BY-SA)
  small_parallel_enja/train.*       Tanaka Corpus sentence pairs (CC BY)
  jd/.../jamdict.db                 JMdict in SQLite (CC BY-SA), for part of speech and glosses
  wordfreq (pip)                    word frequencies for Japanese (Apache-2.0 code, CC BY-SA data)
Output: app/data/levels/n4.json ... n1.json, app/data/levels/freq.json
"""
import argparse, collections, csv, json, pathlib, re, sqlite3, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument('--ds', required=True)
A = ap.parse_args()
DS = pathlib.Path(A.ds)
OUT = ROOT / 'app' / 'data' / 'levels'
OUT.mkdir(parents=True, exist_ok=True)

import wordfreq
FREQ = wordfreq.get_frequency_dict('ja')
KANJI_RE = re.compile(r'[一-鿿々]')
HIRA_RE = re.compile(r'^[ぁ-ゖー]+$')
KANA_RE = re.compile(r'^[ぁ-ゖァ-ヺー・]+$')
kata2hira = lambda s: ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)
hira2kata = lambda s: ''.join(chr(ord(c) + 0x60) if 'ぁ' <= c <= 'ゖ' else c for c in s)

# ---------------------------------------------------------------- JMdict
db = sqlite3.connect(str(next(DS.glob('jd/**/jamdict.db'))))
print('loading JMdict…', file=sys.stderr)
ent_kanji, ent_kana = collections.defaultdict(list), collections.defaultdict(list)
by_kanji, by_kana = collections.defaultdict(list), collections.defaultdict(list)
kpri = collections.defaultdict(set)
for kid, idseq, text in db.execute('select ID, idseq, text from Kanji'):
    ent_kanji[idseq].append(text); by_kanji[text].append(idseq)
for kid, pri in db.execute('select k.idseq, p.text from KJP p join Kanji k on k.ID = p.kid'):
    kpri[kid].add(pri)
for kid, idseq, text in db.execute('select ID, idseq, text from Kana'):
    ent_kana[idseq].append(text); by_kana[text].append(idseq)
for kid, pri in db.execute('select k.idseq, p.text from KNP p join Kana k on k.ID = p.kid'):
    kpri[kid].add(pri)
sense_of = collections.defaultdict(list)
for sid, idseq in db.execute('select ID, idseq from Sense order by ID'):
    sense_of[idseq].append(sid)
pos_of, gloss_of, misc_of = collections.defaultdict(list), collections.defaultdict(list), collections.defaultdict(list)
for sid, t in db.execute('select sid, text from pos'):
    pos_of[sid].append(t)
for sid, t in db.execute("select sid, text from SenseGloss where lang = 'eng' order by rowid"):
    gloss_of[sid].append(t)
for sid, t in db.execute('select sid, text from misc'):
    misc_of[sid].append(t)


def pri_score(idseq):
    p = kpri[idseq]
    s = 0
    for t in p:
        if t in ('ichi1', 'news1', 'spec1'):
            s += 10
        elif t.startswith('nf'):
            s += max(0, 50 - int(t[2:])) / 5
        elif t in ('ichi2', 'news2', 'spec2', 'gai1'):
            s += 3
    return s


def find_entry(expr, reading):
    cands = by_kanji.get(expr) or []
    if cands and reading:
        hit = [i for i in cands if reading in ent_kana[i]]
        cands = hit or cands
    if not cands:
        cands = [i for i in by_kana.get(expr, []) + by_kana.get(reading, [])]
    if not cands:
        return None
    return max(cands, key=pri_score)


def pos_class(idseq):
    """-> (class, verb group). class: verb, iadj, naadj, adv, noun, exp"""
    if idseq is None:
        return 'noun', 0
    pos = []
    for sid in sense_of[idseq][:2]:
        pos += pos_of[sid]
    j = ' | '.join(pos).lower()
    if 'ichidan verb' in j:
        return 'verb', 2
    if 'godan verb' in j:
        return 'verb', 1
    if 'kuru verb' in j or re.search(r'suru verb - (special|included)', j):
        return 'verb', 3
    if "adjective (keiyoushi)" in j:
        return 'iadj', 0
    if 'adjectival nouns or quasi-adjectives' in j or "'taru' adjective" in j:
        return 'naadj', 0
    if 'noun' in j:
        return 'noun', 0
    if 'adverb' in j:
        return 'adv', 0
    if 'expressions' in j or 'conjunction' in j or 'interjection' in j:
        return 'exp', 0
    return 'noun', 0


def first_gloss(idseq):
    if idseq is None:
        return ''
    g = gloss_of[sense_of[idseq][0]] if sense_of[idseq] else []
    return g[0] if g else ''


def short_gloss(idseq, n=2):
    out = []
    for sid in sense_of[idseq][:2]:
        for g in gloss_of[sid][:2]:
            if g not in out and len(out) < n:
                out.append(g)
    return '; '.join(out)


# ---------------------------------------------------------------- kanji
KD = json.load(open(DS / 'kanji-data' / 'kanji.json', encoding='utf-8'))
KLEVEL = {k: v['jlpt_new'] for k, v in KD.items() if v.get('jlpt_new')}
by_on = collections.defaultdict(list)
for k, v in KD.items():
    if v.get('jlpt_new'):
        for r in (v.get('readings_on') or [])[:2]:
            by_on[r].append(k)


def klevel_ok(text, lv):
    """all kanji in the text belong to this level or an easier one"""
    return all(KLEVEL.get(c, 0) >= lv for c in KANJI_RE.findall(text))


# ---------------------------------------------------------------- sentences (Tanaka corpus, pre-tokenised)
FIX_EN = [(r" n't", "n't"), (r" '(s|m|re|ve|ll|d)\b", r"'\1"), (r' ([.,?!;:])', r'\1'), (r'\bi\b', 'I'), (r'\$ ', '$'), (r" o'clock", " o'clock"), (r'`` ', '"'), (r" ''", '"')]
PROPER = ('japan japanese english england america american tokyo kyoto osaka china chinese france french german germany london paris tom mary john bob ken jim jane kate bill mike nancy '
          'sunday monday tuesday wednesday thursday friday saturday january february march april june july august september october november december '
          'europe asia africa canada australia india italy spain korea christmas mr. mrs. ms. dr. new york mt. fuji tv').split()


def detok(s):
    for a, b in FIX_EN:
        s = re.sub(a, b, s)
    for w in PROPER:
        s = re.sub(r'\b' + re.escape(w) + r'(?![a-z])', w.capitalize() if w != 'tv' else 'TV', s)
    return s[:1].upper() + s[1:]


SENT = []          # (tokens, joined, en)
tok_index = collections.defaultdict(list)   # joined span text at token boundaries -> [(sent, char offset)]
ja = (DS / 'small_parallel_enja' / 'train.ja').read_text(encoding='utf-8').splitlines()
en = (DS / 'small_parallel_enja' / 'train.en').read_text(encoding='utf-8').splitlines()
seen = set()
for j, e in zip(ja, en):
    toks = j.split()
    joined = ''.join(toks)
    if joined in seen or not (7 <= len(joined) <= 34) or re.search(r'[A-Za-z0-9０-９]', joined) or '"' in e:
        continue
    seen.add(joined)
    si = len(SENT)
    SENT.append((toks, joined, detok(e)))
    off = 0
    starts = []
    for t in toks:
        starts.append(off); off += len(t)
    for a in range(len(toks)):
        span = ''
        for b in range(a, min(a + 4, len(toks))):
            span += toks[b]
            tok_index[span].append((si, starts[a]))
print(len(SENT), 'sentences', file=sys.stderr)


def examples(expr, lv, limit=3):
    hits = tok_index.get(expr, [])
    if not hits:
        return []
    good = [h for h in hits if klevel_ok(SENT[h[0]][1], lv)]
    pool = good or hits
    pool = sorted(pool, key=lambda h: (abs(len(SENT[h[0]][1]) - 17), h[0]))
    out, used = [], set()
    for si, off in pool:
        if si in used:
            continue
        used.add(si); out.append((si, off))
        if len(out) >= limit:
            break
    return out


# ---------------------------------------------------------------- vocabulary
def freq_of(expr, reading):
    return max(FREQ.get(expr, 0), FREQ.get(reading, 0) if expr == reading else 0)


def clean_meaning(m):
    m = re.sub(r'\s+', ' ', m).strip().strip(',;')
    parts = [p.strip() for p in re.split(r'[;,]', m) if p.strip()]
    out = []
    for p in parts:
        if len('; '.join(out + [p])) > 54 and out:
            break
        out.append(p)
    return '; '.join(out[:4])


WORDS = {}      # level -> list of dict
ALLW = {}       # expr -> (level, word)
for lv in (5, 4, 3, 2, 1):
    rows = list(csv.DictReader(open(DS / 'open-anki-jlpt-decks' / 'src' / f'n{lv}.csv', encoding='utf-8')))
    out, seen_e = [], set()
    for r in rows:
        e, rd, m = r['expression'].strip(), r['reading'].strip(), r['meaning'].strip()
        if not e or not m or re.search(r'[〜～~()（）\s・／/,、。.…\[\]A-Za-zＡ-Ｚ0-9０-９]', e + rd):
            continue
        rd = rd or e
        if not KANA_RE.match(rd) or e in seen_e or e in ALLW:
            continue
        seen_e.add(e)
        idseq = find_entry(e, rd)
        cls, grp = pos_class(idseq)
        kana = rd
        if cls == 'verb' and not re.search(r'[うくぐすつぬぶむる]$', kana):
            cls, grp = 'noun', 0
        if cls == 'iadj' and not kana.endswith('い'):
            cls = 'noun'
        w = {'k': e if KANJI_RE.search(e) else '', 'r': kana, 'm': clean_meaning(m), 'c': cls, 'g': grp, 'f': freq_of(e, rd), 'id': idseq, 'e': e}
        out.append(w)
        ALLW[e] = (lv, w)
    WORDS[lv] = out
    print('N%d words' % lv, len(out), collections.Counter(w['c'] for w in out).most_common(), file=sys.stderr)

# synonym pairs: same first JMdict gloss, same class
by_gloss = collections.defaultdict(list)
for e, (lv, w) in ALLW.items():
    g = first_gloss(w['id'])
    if g and len(g) > 3:
        by_gloss[(g, w['c'])].append((lv, e))


def fake_spellings(e, rd, lv):
    """wrong kanji spellings for 'how is it written' questions: swap one kanji for another with the same on-reading"""
    ks = [c for c in e if KANJI_RE.match(c)]
    out = []
    for c in ks:
        ons = (KD.get(c, {}).get('readings_on') or [])[:2]
        alts = []
        for o in ons:
            alts += [x for x in by_on[o] if x != c and KLEVEL.get(x, 0) >= max(1, lv - 1)]
        alts = sorted(set(alts), key=lambda x: (abs(KLEVEL.get(x, 0) - lv), KD[x].get('freq') or 9999))
        for a in alts[:3]:
            f = e.replace(c, a, 1)
            if f not in ALLW and f not in by_kanji and f not in out:
                out.append(f)
    # interleave so that distractors change different characters
    return out[:5]


def build_level(lv):
    sents, sid_map = [], {}

    def sref(si):
        if si not in sid_map:
            sid_map[si] = len(sents)
            sents.append([SENT[si][1], SENT[si][2]])
        return sid_map[si]

    words = sorted(WORDS[lv], key=lambda w: -w['f'])
    V = []
    for i, w in enumerate(words):
        ex = [[sref(si), off] for si, off in examples(w['e'], lv)]
        row = {'k': w['k'], 'r': w['r'], 'm': w['m'], 'c': w['c']}
        if w['g']:
            row['g'] = w['g']
        if ex:
            row['x'] = ex
        if w['k']:
            hy = fake_spellings(w['e'], w['r'], lv)
            if len(hy) >= 3:
                row['h'] = hy[:4]
        g = first_gloss(w['id'])
        syn = [e for (l2, e) in by_gloss.get((g, w['c']), []) if e != w['e'] and l2 >= lv]
        if syn:
            row['s'] = syn[0]
        V.append(row)
    # kanji of this level, most frequent first
    ks = sorted([k for k, l in KLEVEL.items() if l == lv], key=lambda k: KD[k].get('freq') or 9999)
    K = []
    idx = collections.defaultdict(list)
    for l2 in (lv, lv + 1, lv + 2, lv + 3, lv + 4, lv - 1, lv - 2, lv - 3):
        for w in WORDS.get(l2, []):
            if w['k']:
                for c in set(KANJI_RE.findall(w['k'])):
                    idx[c].append(w)
    for k in ks:
        d = KD[k]
        exs = []
        for w in sorted(idx.get(k, []), key=lambda w: -w['f'])[:3]:
            exs.append([w['e'], w['r'], w['m'].split(';')[0]])
        if not exs:
            c = sorted([i for t in by_kanji if k in t and len(t) <= 3 for i in by_kanji[t] if pri_score(i) > 0], key=lambda i: -pri_score(i))[:2]
            for i in c:
                t = [x for x in ent_kanji[i] if k in x][0]
                exs.append([t, ent_kana[i][0], first_gloss(i)])
        if not exs:
            continue
        on = '・'.join(hira2kata(r) for r in (d.get('readings_on') or [])[:3])
        kun = '・'.join(re.sub(r'\.(.+)$', r'(\1)', r.lstrip('-').rstrip('-')) for r in (d.get('readings_kun') or [])[:3])
        K.append({'k': k, 'm': ', '.join(x.lower() for x in (d.get('meanings') or [])[:3]), 'on': on, 'kun': kun, 'ex': exs, 'st': d.get('strokes') or 0})
    return {'level': lv, 'vocab': V, 'kanji': K, 'sent': sents}


for lv in (4, 3, 2, 1):
    pack = build_level(lv)
    (OUT / f'n{lv}.json').write_text(json.dumps(pack, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    v = pack['vocab']
    print('N%d: %d words (%d with sentences, %d spellings, %d synonyms), %d kanji, %d sentences, %d KB' % (
        lv, len(v), sum('x' in w for w in v), sum('h' in w for w in v), sum('s' in w for w in v), len(pack['kanji']), len(pack['sent']),
        (OUT / f'n{lv}.json').stat().st_size // 1024), file=sys.stderr)

# ---------------------------------------------------------------- spoken-frequency deck
SKIP_POS = ('particle', 'auxiliary', 'prefix', 'suffix', 'counter', 'copula')
ranked = sorted(FREQ.items(), key=lambda x: -x[1])
total = sum(f for _, f in ranked)
deck, cum, seen_id = [], 0.0, set()
OVERRIDE = {'何': 'なに', '方': 'ほう', '今日': 'きょう', '明日': 'あした', '私': 'わたし', '日': 'ひ', '中': 'なか', '後': 'あと', '前': 'まえ', '上': 'うえ', '下': 'した', '他': 'ほか', '家': 'いえ', '人': 'ひと',
            '間': 'あいだ', '今': 'いま', '時': 'とき', '所': 'ところ', '行く': 'いく', '言う': 'いう', '一人': 'ひとり', '二人': 'ふたり', '大人': 'おとな', '昨日': 'きのう', '今年': 'ことし', '一日': 'いちにち',
            '本当': 'ほんとう', '最近': 'さいきん', '気': 'き', '話': 'はなし', '目': 'め', '手': 'て', '声': 'こえ', '顔': 'かお', '頭': 'あたま', '国': 'くに', '店': 'みせ', '外': 'そと', '彼': 'かれ', '彼女': 'かのじょ',
            '俺': 'おれ', '君': 'きみ', '僕': 'ぼく', '誰': 'だれ', '事': 'こと', '物': 'もの', '次': 'つぎ', '少し': 'すこし', '全部': 'ぜんぶ', '一緒': 'いっしょ', '分': 'ふん', '月': 'つき', '年': 'とし', '円': 'えん',
            '水': 'みず', '金': 'かね', '車': 'くるま', '道': 'みち', '体': 'からだ', '心': 'こころ', '力': 'ちから', '名前': 'なまえ', '好き': 'すき', '嫌': 'いや', '一番': 'いちばん', '最後': 'さいご', '最初': 'さいしょ'}
OVERRIDE.update(dict(x.split(':') for x in ('本:ほん 子:こ 男:おとこ 女:おんな 国:くに 車:くるま 金:かね 店:みせ 物:もの 顔:かお 声:こえ 頭:あたま 心:こころ 下:した 別:べつ 夜:よる 朝:あさ 昼:ひる 夏:なつ 冬:ふゆ 春:はる 秋:あき '
    '雨:あめ 犬:いぬ 猫:ねこ 駅:えき 町:まち 山:やま 川:かわ 海:うみ 空:そら 花:はな 木:き 火:ひ 耳:みみ 口:くち 足:あし 歌:うた 絵:え 色:いろ 音:おと 味:あじ 形:かたち 親:おや 父:ちち 母:はは 兄:あに 姉:あね 弟:おとうと 妹:いもうと '
    '夫:おっと 妻:つま 娘:むすめ 一:いち 二:に 三:さん 四:よん 五:ご 六:ろく 七:なな 八:はち 九:きゅう 十:じゅう 百:ひゃく 千:せん 万:まん 数:かず 力:ちから 名:な 家:いえ 風:かぜ 雪:ゆき 肉:にく 魚:さかな 米:こめ 茶:ちゃ 酒:さけ 薬:くすり '
    '服:ふく 靴:くつ 鍵:かぎ 窓:まど 席:せき 紙:かみ 箱:はこ 石:いし 星:ほし 島:しま 森:もり 橋:はし 庭:にわ 壁:かべ 床:ゆか 嘘:うそ 夢:ゆめ 愛:あい 恋:こい 命:いのち 死:し 血:ち 涙:なみだ 汗:あせ 熱:ねつ 傷:きず 罪:つみ 敵:てき 味方:みかた '
    '神:かみ 鬼:おに 王:おう 馬:うま 鳥:とり 虫:むし 牛:うし 豚:ぶた 卵:たまご 塩:しお 油:あぶら 皿:さら 机:つくえ 棚:たな 袋:ふくろ 糸:いと 針:はり 刀:かたな 剣:けん 銃:じゅう 船:ふね 港:みなと 空港:くうこう 線:せん 点:てん 丸:まる 角:かど '
    '横:よこ 隣:となり 奥:おく 裏:うら 表:おもて 先:さき 元:もと 右:みぎ 左:ひだり 北:きた 南:みなみ 東:ひがし 西:にし 週:しゅう 秒:びょう 歳:さい 回:かい 度:ど 番:ばん 階:かい 枚:まい 冊:さつ 匹:ひき 杯:はい 台:だい 個:こ 件:けん 例:れい 嫌:いや 変:へん 楽:らく 暇:ひま 急:きゅう 損:そん 得:とく 無理:むり').split()))
STOP = set('という として について によって による でしょ みたい ください たち 出し 思い なんか なんて とか って ので のに けど けれど だから なら たら ながら まま ほど くらい ぐらい ばかり だけ しか こそ さえ でも ても とも よね かな かも だろ だろう でしょう です ます ました ません ている てる てい られる れる せる させる たい そう よう らしい べき はず わけ ため もん もの こと ところ とき 無い 良い 出来る 下さい 頂く 致す 居る 有る 為る 成る 言い 行き 見 出 入り 取り 持ち 使い 作り 買い 思っ 言っ 行っ やっ なっ あっ もらっ 出来 分かり 知り 感じ られ なく なり あり おり いき'.split())
STOP -= set('感じ もの こと ところ とき ため'.split())
KEEP_STEM = set('考え 感じ 答え 流れ 違い 終わり 楽しみ 間違い 出会い 始め 疲れ 晴れ 別れ 遅れ 汚れ 助け 届け 知らせ 迎え 借り'.split())
DROP = set('クソ バカ お前 ネタ 版 わかり いただき 生き 過ぎ 試し まとめ 通り 限り ちゃう ちゃん すぎる やすい ガン 神 王 敵 鬼 銃 剣 刀 罪 死 血'.split())
for tok, f in ranked[:12000]:
    if tok in STOP or (len(tok) == 1 and tok not in OVERRIDE):
        cum += f
        continue
    cum += f
    if len(deck) >= 1000:
        break
    if not re.match(r'^[ぁ-ゖァ-ヺー一-鿿々]+$', tok) or (len(tok) == 1 and not KANJI_RE.match(tok)):
        continue
    if HIRA_RE.match(tok) and len(tok) <= 2 and tok not in ('ある', 'いる', 'する', 'なる', 'いい', 'ない', 'これ', 'それ', 'あれ', 'どれ', 'ここ', 'そこ', 'どこ', 'いつ', 'なぜ', 'はい', 'まだ', 'もう', 'よく', 'また', 'でも', 'ねえ', 'うん', 'いや', 'くる', 'みる', 'やる', 'いく', 'いう', 'こと', 'もの', 'とき', 'ため', 'ひと', 'まあ', 'ほら', 'さあ', 'ぜひ', 'すぐ', 'ただ', 'なに', 'だれ', 'どう', 'そう', 'こう', 'ああ', 'ええ', 'おれ', 'ぼく', 'きみ', 'みな', 'いま', 'あと', 'まえ', 'うち', 'そば', 'たち', 'ほど', 'だけ', 'ほか', 'べつ', 'ずっと'):
        continue
    idseq = find_entry(tok, OVERRIDE.get(tok, ''))
    if idseq is None or idseq in seen_id or pri_score(idseq) < 10:
        continue
    # spoken filter: the word must occur in everyday example sentences, and must not be a bare verb stem
    if len({si for si, _ in tok_index.get(tok, [])}) < 3:
        continue
    if tok not in KEEP_STEM and any(pos_class(i)[0] == 'verb' for i in by_kanji.get(tok + 'る', []) + by_kana.get(tok + 'る', [])):
        continue
    if tok in DROP:
        continue
    j = ' | '.join(p for sid in sense_of[idseq][:1] for p in pos_of[sid]).lower()
    if any(s in j for s in SKIP_POS) and 'noun' not in j and 'verb' not in j:
        continue
    if 'verb' in j and not re.search(r'[うくぐすつぬぶむる]$', tok):
        continue        # conjugated fragment
    if any(m in ('archaism', 'vulgar expression or word', 'derogatory', 'obsolete term') for sid in sense_of[idseq][:1] for m in misc_of[sid]):
        continue
    kana = OVERRIDE.get(tok) or (ent_kana[idseq][0] if KANJI_RE.search(tok) else tok)
    seen_id.add(idseq)
    ex = examples(tok, 3, 1)
    deck.append({'w': tok, 'r': kana, 'm': short_gloss(idseq, 2), 'cv': round(cum / total, 4), 'x': [SENT[ex[0][0]][1], SENT[ex[0][0]][2]] if ex else None})
(OUT / 'freq.json').write_text(json.dumps(deck, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('frequency deck:', len(deck), 'words; coverage at 100/300/600/1000:', [deck[i - 1]['cv'] for i in (100, 300, 600, 1000) if i <= len(deck)], cum / total, file=sys.stderr)
print(' '.join(d['w'] + '/' + d['r'] for d in deck[:1000:4]), file=sys.stderr)
