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
fpri = collections.defaultdict(set)      # (entry, written form) -> priority tags of that form only
for kid, idseq, text in db.execute('select ID, idseq, text from Kanji'):
    ent_kanji[idseq].append(text); by_kanji[text].append(idseq)
for kid, txt, pri in db.execute('select k.idseq, k.text, p.text from KJP p join Kanji k on k.ID = p.kid'):
    kpri[kid].add(pri); fpri[(kid, txt)].add(pri)
for kid, idseq, text in db.execute('select ID, idseq, text from Kana'):
    ent_kana[idseq].append(text); by_kana[text].append(idseq)
for kid, txt, pri in db.execute('select k.idseq, k.text, p.text from KNP p join Kana k on k.ID = p.kid'):
    kpri[kid].add(pri); fpri[(kid, txt)].add(pri)
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


def pri_score(idseq, form=None):
    p = fpri[(idseq, form)] if form is not None else kpri[idseq]
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
    if cands:
        return max(cands, key=lambda i: (pri_score(i, expr), pri_score(i)))
    cands = [(i, expr) for i in by_kana.get(expr, [])] + [(i, reading) for i in by_kana.get(reading, [])]
    if not cands:
        return None
    # a kana word: prefer the entry where this very spelling is the common one, and entries usually written in kana
    def kana_rank(c):
        i, form = c
        uk = any('usually written using kana alone' in m for sid in sense_of[i][:1] for m in misc_of[sid])
        return (pri_score(i, form) + (4 if uk or not ent_kanji[i] else 0), ent_kana[i][0] == form, pri_score(i))
    return max(cands, key=kana_rank)[0]


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


def strip_parens(g):
    prev = None
    while prev != g:
        prev = g
        g = re.sub(r'\s*\([^()]*\)', '', g)
    return g.strip(' ;,')


def short_gloss(idseq, n=2):
    """the first sense only, without the dictionary's bracketed notes"""
    out = []
    for g in gloss_of[sense_of[idseq][0]][:3] if sense_of[idseq] else []:
        g = strip_parens(g)
        if g and g not in out and len(out) < n and len(g) <= 28:
            out.append(g)
    return '; '.join(out) or strip_parens(first_gloss(idseq))


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
FIX_EN = [(r" n't", "n't"), (r" '(t|s|m|re|ve|ll|d)\b", r"'\1"), (r' ([.,?!;:])', r'\1'), (r'\bi\b', 'I'), (r'\$ ', '$'), (r" o'clock", " o'clock"), (r'`` ', '"'), (r" ''", '"')]
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
STOP = set('に対して にとって において に対する によって に関する に関して に基づく という として について によって による でしょ みたい ください たち 出し 思い なんか なんて とか って ので のに けど けれど だから なら たら ながら まま ほど くらい ぐらい ばかり だけ しか こそ さえ でも ても とも よね かな かも だろ だろう でしょう です ます ました ません ている てる てい られる れる せる させる たい そう よう らしい べき はず わけ ため もん もの こと ところ とき 無い 良い 出来る 下さい 頂く 致す 居る 有る 為る 成る 言い 行き 見 出 入り 取り 持ち 使い 作り 買い 思っ 言っ 行っ やっ なっ あっ もらっ 出来 分かり 知り 感じ られ なく なり あり おり いき'.split())
STOP -= set('感じ もの こと ところ とき ため'.split())
GLOSS = dict(x.split('=') for x in (
    'する=to do|ある=to be, to exist (things); to have|いる=to be, to exist (people, animals)|なる=to become|ない=not; there is no|こと=thing, matter (abstract)|もの=thing, object|'
    'いい=good; fine|よい=good|これ=this (one)|それ=that (one, near you)|あれ=that (one, over there)|この=this ...|その=that ...|あの=that ... (over there)|ここ=here|そこ=there|どこ=where|'
    'いう=to say|言う=to say|思う=to think|見る=to see, to look, to watch|行く=to go|来る=to come|出る=to go out, to leave; to come out|できる=can do; to be made, to be ready|'
    '人=person|私=I, me|今=now|時=time; when|日=day; sun|年=year|中=inside; middle|前=before; in front|後=after; behind|何=what|方=direction; side; way|自分=oneself|'
    'そう=so; like that|どう=how|こう=like this|もう=already; soon; more|まだ=still; not yet|また=again; also|よく=often; well|ため=for the sake of; because of|ところ=place; point|'
    'とき=time; when|はい=yes|いや=no; unpleasant|でも=but|だけ=only|ほど=extent; about|ほか=other|みんな=everyone|とても=very|ちょっと=a little; just a moment|'
    '持つ=to hold; to have|使う=to use|分かる=to understand|知る=to know|考える=to think about, to consider|聞く=to hear, to listen; to ask|書く=to write|読む=to read|'
    '作る=to make|入る=to enter|出す=to take out; to send; to hand in|買う=to buy|食べる=to eat|飲む=to drink|会う=to meet|話す=to speak, to talk|待つ=to wait|'
    '好き=liked; favourite|多い=many, much|少ない=few, little|大きい=big|小さい=small|高い=tall; expensive|安い=cheap|新しい=new|古い=old (things)|長い=long|早い=early; fast|'
    '今日=today|明日=tomorrow|昨日=yesterday|今年=this year|毎日=every day|時間=time; hour|仕事=work, job|会社=company|学校=school|家=house, home|話=talk; story|'
    '気=spirit; mood; attention|手=hand|目=eye|声=voice|顔=face|頭=head|心=heart, mind|体=body|水=water|金=money|名前=name|国=country|店=shop|道=road; way|'
    '本当=truth; really|一緒=together|大丈夫=all right, OK|必要=necessary|大切=important, precious|問題=problem; question|意味=meaning|理由=reason|場合=case, situation|'
    '彼=he, him|彼女=she, her; girlfriend|誰=who|僕=I, me (male, casual)|俺=I, me (male, rough)|君=you (casual)|あなた=you|子=child|男=man|女=woman|友達=friend|'
    'やる=to do (casual); to give|くる=to come|いく=to go|みる=to see, to look|おく=to put, to place|くれる=to give (to me)|もらう=to receive|あげる=to give; to raise|'
    'しれる=to become known|すぎる=to pass; to be too much|かける=to hang; to call; to spend|つく=to arrive; to be attached; to turn on|とる=to take|'
    'すごい=amazing; terrific|うん=yeah, uh-huh|ただ=just, only; free of charge|先=ahead; earlier; tip|しまう=to finish; to put away|あまり=(not) very; too much|どれ=which (one)|全く=completely; (not) at all|'
    '一つ=one (thing)|度=times; degrees|無理=impossible; unreasonable|最高=the best; highest|元気=well, healthy; lively|残念=unfortunate; a pity|ダメ=no good; not allowed|欲しい=to want (a thing)|'
    'こちら=this way; this (polite)|言葉=word; language|相手=the other person; partner|事件=incident; case|最後=last; the end|一番=number one; the most|時代=era, period|だって=because; after all|'
    '多く=many; much|良く=well; often|大変=very; hard, tough|結構=fine, enough; quite|別に=(not) particularly|なんか=something; somehow|やはり=as expected; after all|やっぱり=as expected; after all|'
    'すぐ=at once; soon|ずっと=the whole time; by far|ちゃんと=properly|たくさん=a lot, many|いつも=always|いろいろ=various|ぜひ=by all means|たぶん=probably|きっと=surely|なぜ=why|どうして=why|'
    'お願い=request; please|すみません=excuse me; sorry|ごめん=sorry|大好き=to love, to like a lot|嫌い=disliked|上手=good at|下手=bad at|便利=convenient|有名=famous|'
    'いっぱい=full; a lot|いつか=someday|例=example|肉=meat|かかる=to take (time, money)|つける=to attach; to turn on|ほら=look!; see!|ようやく=at last, finally|おやすみ=good night|よろしく=best regards; please|どういう=what kind of|'
    'だいたい=roughly; mostly|うまい=tasty; skilful|ひどい=awful, terrible|得意=good at; strong point|苦手=weak at; dislike|楽=easy, comfortable|勝手=selfish; as one pleases|次第=depending on; as soon as|横=side; beside|表=front; surface; chart|'
    '丸=circle|やめる=to stop, to quit|合う=to fit, to match|当たる=to hit; to be right|主人=husband; master|さあ=well, come on|どうも=thanks; somehow|なんとか=somehow; one way or another|不思議=strange, mysterious|そこで=so, then|それで=and so; because of that|'
    '一=one|二=two|三=three|四=four|五=five|六=six|七=seven|八=eight|九=nine|十=ten|百=hundred|千=thousand|万=ten thousand|円=yen|分=minute; part|月=month; moon|本=book; counter for long things|上=above, on top|下=below, under|外=outside|間=between; during|所=place|次=next|別=separate, different|他=other'
).split('|'))
KEEP_STEM = set('考え 感じ 答え 流れ 違い 終わり 楽しみ 間違い 出会い 始め 疲れ 晴れ 別れ 遅れ 汚れ 助け 届け 知らせ 迎え 借り'.split())
DROP = set('読み 迎え 帰り 借り 頂き 勝ち 立ち 待ち 売り 乗り 送り 切り 直し 回し 渡し 振り 戻り 貸し 通し 戻し 払い 泣き 走り 行い 流し 向い かかり あたり なさい ないし にかけて いただける ついてる ご覧 きみ きょう しょうが 得る 無し 遊び 働き 続き 残り 始まり 変わり 疲れ 助け 遅れ 別れ 汚れ 許し 驚き 喜び 怒り 痛み 好み 笑い 願い 疑い 戦い 連中 あいつ おまえ 馬鹿 殺人 死亡 犯罪 兵士 天使 惑星 委員 候補 大統領 女優 俳優 作者 クソ バカ お前 ネタ 版 わかり いただき 生き 過ぎ 試し まとめ 通り 限り ちゃう ちゃん すぎる やすい ガン 神 王 敵 鬼 銃 剣 刀 罪 死 血'.split())
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
    deck.append({'w': tok, 'r': kana, 'm': GLOSS.get(tok) or short_gloss(idseq, 2), 'cv': round(cum / total, 4), 'x': [SENT[ex[0][0]][1], SENT[ex[0][0]][2]] if ex else None})
(OUT / 'freq.json').write_text(json.dumps(deck, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('frequency deck:', len(deck), 'words; coverage at 100/300/600/1000:', [deck[i - 1]['cv'] for i in (100, 300, 600, 1000) if i <= len(deck)], cum / total, file=sys.stderr)

