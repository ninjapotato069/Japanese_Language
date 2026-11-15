/* Numbers, time, dates, counters, verb engine, particles, by-heart vault, strategy text. */
window.CORE = (function () {
  const D1 = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
  function num(n) { // 0..99999 in hiragana
    if (n === 0) return "ゼロ";
    let s = "";
    const man = Math.floor(n / 10000); n %= 10000;
    if (man) s += (man === 1 ? "いち" : num(man)) + "まん";
    const sen = Math.floor(n / 1000); n %= 1000;
    if (sen) s += ({ 1: "せん", 3: "さんぜん", 8: "はっせん" })[sen] || (D1[sen] + "せん");
    const hy = Math.floor(n / 100); n %= 100;
    if (hy) s += ({ 1: "ひゃく", 3: "さんびゃく", 6: "ろっぴゃく", 8: "はっぴゃく" })[hy] || (D1[hy] + "ひゃく");
    const ju = Math.floor(n / 10); n %= 10;
    if (ju) s += (ju === 1 ? "" : D1[ju]) + "じゅう";
    if (n) s += D1[n];
    return s;
  }
  const HOUR = ["", "いちじ", "にじ", "さんじ", "よじ", "ごじ", "ろくじ", "しちじ", "はちじ", "くじ", "じゅうじ", "じゅういちじ", "じゅうにじ"];
  const MINU = ["", "いっぷん", "にふん", "さんぷん", "よんぷん", "ごふん", "ろっぷん", "ななふん", "はっぷん", "きゅうふん"];
  function minutes(m) {
    if (m === 0) return "";
    const t = Math.floor(m / 10), u = m % 10;
    if (u === 0) return (t === 1 ? "" : D1[t]) + "じゅっぷん";
    return (t ? (t === 1 ? "" : D1[t]) + "じゅう" : "") + MINU[u];
  }
  function time(h, m) { return HOUR[h] + (m === 30 && Math.random() < 0.5 ? "はん" : minutes(m)); }
  const DAYS = ["", "ついたち", "ふつか", "みっか", "よっか", "いつか", "むいか", "なのか", "ようか", "ここのか", "とおか",
    "じゅういちにち", "じゅうににち", "じゅうさんにち", "じゅうよっか", "じゅうごにち", "じゅうろくにち", "じゅうしちにち", "じゅうはちにち", "じゅうくにち", "はつか",
    "にじゅういちにち", "にじゅうににち", "にじゅうさんにち", "にじゅうよっか", "にじゅうごにち", "にじゅうろくにち", "にじゅうしちにち", "にじゅうはちにち", "にじゅうくにち", "さんじゅうにち", "さんじゅういちにち"];
  const MONTHS = ["", "いちがつ", "にがつ", "さんがつ", "しがつ", "ごがつ", "ろくがつ", "しちがつ", "はちがつ", "くがつ", "じゅうがつ", "じゅういちがつ", "じゅうにがつ"];
  const WEEK = [["げつようび", "月曜日", "Monday"], ["かようび", "火曜日", "Tuesday"], ["すいようび", "水曜日", "Wednesday"], ["もくようび", "木曜日", "Thursday"], ["きんようび", "金曜日", "Friday"], ["どようび", "土曜日", "Saturday"], ["にちようび", "日曜日", "Sunday"]];
  // counters 1..10; * marks the irregular readings
  const COUNTERS = [
    { c: "つ", use: "general things (1-10)", r: ["ひとつ*", "ふたつ*", "みっつ*", "よっつ*", "いつつ*", "むっつ*", "ななつ*", "やっつ*", "ここのつ*", "とお*"] },
    { c: "人", k: "にん", use: "people", r: ["ひとり*", "ふたり*", "さんにん", "よにん*", "ごにん", "ろくにん", "ななにん", "はちにん", "きゅうにん", "じゅうにん"] },
    { c: "本", k: "ほん", use: "long thin things: pens, bottles, umbrellas", r: ["いっぽん*", "にほん", "さんぼん*", "よんほん", "ごほん", "ろっぽん*", "ななほん", "はっぽん*", "きゅうほん", "じゅっぽん*"] },
    { c: "枚", k: "まい", use: "flat things: paper, tickets, shirts", r: ["いちまい", "にまい", "さんまい", "よんまい", "ごまい", "ろくまい", "ななまい", "はちまい", "きゅうまい", "じゅうまい"] },
    { c: "冊", k: "さつ", use: "books, notebooks", r: ["いっさつ*", "にさつ", "さんさつ", "よんさつ", "ごさつ", "ろくさつ", "ななさつ", "はっさつ*", "きゅうさつ", "じゅっさつ*"] },
    { c: "匹", k: "ひき", use: "small animals, fish", r: ["いっぴき*", "にひき", "さんびき*", "よんひき", "ごひき", "ろっぴき*", "ななひき", "はっぴき*", "きゅうひき", "じゅっぴき*"] },
    { c: "個", k: "こ", use: "small objects: eggs, apples", r: ["いっこ*", "にこ", "さんこ", "よんこ", "ごこ", "ろっこ*", "ななこ", "はっこ*", "きゅうこ", "じゅっこ*"] },
    { c: "台", k: "だい", use: "machines, cars", r: ["いちだい", "にだい", "さんだい", "よんだい", "ごだい", "ろくだい", "ななだい", "はちだい", "きゅうだい", "じゅうだい"] },
    { c: "回", k: "かい", use: "times (how often)", r: ["いっかい*", "にかい", "さんかい", "よんかい", "ごかい", "ろっかい*", "ななかい", "はっかい*", "きゅうかい", "じゅっかい*"] },
    { c: "階", k: "かい", use: "floors", r: ["いっかい*", "にかい", "さんがい*", "よんかい", "ごかい", "ろっかい*", "ななかい", "はっかい*", "きゅうかい", "じゅっかい*"] },
    { c: "歳", k: "さい", use: "age (20 = はたち)", r: ["いっさい*", "にさい", "さんさい", "よんさい", "ごさい", "ろくさい", "ななさい", "はっさい*", "きゅうさい", "じゅっさい*"] },
    { c: "杯", k: "はい", use: "cups, glasses, bowls", r: ["いっぱい*", "にはい", "さんばい*", "よんはい", "ごはい", "ろっぱい*", "ななはい", "はっぱい*", "きゅうはい", "じゅっぱい*"] },
    { c: "番", k: "ばん", use: "number in order", r: ["いちばん", "にばん", "さんばん", "よんばん", "ごばん", "ろくばん", "ななばん", "はちばん", "きゅうばん", "じゅうばん"] },
    { c: "時間", k: "じかん", use: "hours (duration)", r: ["いちじかん", "にじかん", "さんじかん", "よじかん*", "ごじかん", "ろくじかん", "ななじかん", "はちじかん", "くじかん*", "じゅうじかん"] },
    { c: "週間", k: "しゅうかん", use: "weeks", r: ["いっしゅうかん*", "にしゅうかん", "さんしゅうかん", "よんしゅうかん", "ごしゅうかん", "ろくしゅうかん", "ななしゅうかん", "はっしゅうかん*", "きゅうしゅうかん", "じゅっしゅうかん*"] },
    { c: "か月", k: "かげつ", use: "months (duration)", r: ["いっかげつ*", "にかげつ", "さんかげつ", "よんかげつ", "ごかげつ", "ろっかげつ*", "ななかげつ", "はちかげつ", "きゅうかげつ", "じゅっかげつ*"] },
    { c: "年", k: "ねん", use: "years", r: ["いちねん", "にねん", "さんねん", "よねん*", "ごねん", "ろくねん", "ななねん", "はちねん", "きゅうねん", "じゅうねん"] },
    { c: "円", k: "えん", use: "yen", r: ["いちえん", "にえん", "さんえん", "よえん*", "ごえん", "ろくえん", "ななえん", "はちえん", "きゅうえん", "じゅうえん"] }
  ];

  // ---------- verb engine ----------
  const ROW = { う: ["わ", "い", "う", "え", "お"], く: ["か", "き", "く", "け", "こ"], ぐ: ["が", "ぎ", "ぐ", "げ", "ご"], す: ["さ", "し", "す", "せ", "そ"],
    つ: ["た", "ち", "つ", "て", "と"], ぬ: ["な", "に", "ぬ", "ね", "の"], ぶ: ["ば", "び", "ぶ", "べ", "ぼ"], む: ["ま", "み", "む", "め", "も"], る: ["ら", "り", "る", "れ", "ろ"] };
  function teStem(v, g) {
    if (g === 3) { if (v.endsWith("する")) return v.slice(0, -2) + "して"; if (v.endsWith("くる")) return v.slice(0, -2) + "きて"; }
    if (g === 2) return v.slice(0, -1) + "て";
    if (v === "いく" || v.endsWith("いく") && v.length <= 3) return v.slice(0, -1) + "って";
    const st = v.slice(0, -1), e = v.slice(-1);
    if ("うつる".includes(e)) return st + "って";
    if ("むぶぬ".includes(e)) return st + "んで";
    if (e === "く") return st + "いて";
    if (e === "ぐ") return st + "いで";
    if (e === "す") return st + "して";
    return v + "て";
  }
  function conj(v, g, form) {
    const st = v.slice(0, -1), e = v.slice(-1);
    let masu, nai;
    if (g === 3) {
      const base = v.endsWith("する") ? v.slice(0, -2) : v.slice(0, -2);
      masu = base + (v.endsWith("する") ? "し" : "き"); nai = base + (v.endsWith("する") ? "しない" : "こない");
    } else if (g === 2) { masu = st; nai = st + "ない"; }
    else { masu = st + ROW[e][1]; nai = (v === "ある") ? "ない" : st + ROW[e][0] + "ない"; }
    const te = teStem(v, g), ta = te.replace(/て$/, "た").replace(/で$/, "だ");
    switch (form) {
      case "masu": return masu + "ます";
      case "masen": return masu + "ません";
      case "mashita": return masu + "ました";
      case "masendeshita": return masu + "ませんでした";
      case "mashou": return masu + "ましょう";
      case "tai": return masu + "たい";
      case "te": return te;
      case "ta": return ta;
      case "nai": return nai;
      case "nakatta": return nai.replace(/ない$/, "なかった");
      default: return v;
    }
  }
  const FORMS = [["masu", "ます (polite)"], ["masen", "ません (polite negative)"], ["mashita", "ました (polite past)"], ["masendeshita", "ませんでした (polite past negative)"],
    ["mashou", "ましょう (let's)"], ["tai", "たい (want to)"], ["te", "て-form"], ["ta", "た-form (plain past)"], ["nai", "ない-form (plain negative)"], ["nakatta", "なかった (plain past negative)"]];
  function adj(a, type, form) { // type i / na
    if (type === "i") {
      const st = a === "いい" ? "よ" : a.slice(0, -1);
      return { now: a + "です", neg: st + "くないです", past: st + "かったです", pastneg: st + "くなかったです", te: st + "くて", adv: st + "く" }[form];
    }
    return { now: a + "です", neg: a + "じゃ ありません", past: a + "でした", pastneg: a + "じゃ ありませんでした", te: a + "で", adv: a + "に" }[form];
  }

  // ---------- particles ----------
  const PARTICLES = [
    ["は", "wa", "Topic: what we are talking about", "わたしは がくせいです。"],
    ["が", "ga", "Subject / with すき, じょうず, わかる, ある, いる, ほしい", "ねこが すきです。"],
    ["を", "o", "Object of an action; route you move through", "パンを たべます。 / こうえんを あるきます。"],
    ["に", "ni", "Time point; destination; place where something exists; person you give to or meet", "7じに おきます。 / へやに います。"],
    ["へ", "e", "Direction (to)", "がっこうへ 行きます。"],
    ["で", "de", "Place of an action; means (by, with, in); event location", "こうえんで あそびます。 / バスで 行きます。"],
    ["と", "to", "And (complete list); with (a person); quoting", "パンと たまご / ともだちと 行きます。"],
    ["も", "mo", "Also, too; with negatives: not even", "わたしも 行きます。"],
    ["の", "no", "Of, 's; links nouns", "わたしの かばん"],
    ["や", "ya", "And (examples, list not complete)", "りんごや バナナ"],
    ["か", "ka", "Question; or", "コーヒーか こうちゃ"],
    ["から", "kara", "From; because", "9じから / さむいですから"],
    ["まで", "made", "Until; as far as", "5じまで / えきまで"],
    ["より", "yori", "Than", "バスは でんしゃより やすいです。"],
    ["ね", "ne", "Isn't it? (seeking agreement)", "いい 天気ですね。"],
    ["よ", "yo", "You know (new information)", "あぶないですよ。"]
  ];
  // particle drill: sentence with ＿, answer, distractor pool
  const PDRILL = `わたし＿ がくせいです。|は|を,に,で
ねこ＿ すきです。|が|を,で,に
まいあさ パン＿ たべます。|を|が,で,に
7じ＿ おきます。|に|で,を,が
がっこう＿ 行きます。|へ|を,で,が
としょかん＿ べんきょうします。|で|に,を,へ
バス＿ えきまで 行きます。|で|に,を,が
ともだち＿ えいがを 見ました。|と|を,に,で
わたし＿ 行きます。トムさんも 行きます。|も|を,で,に
これは わたし＿ かさです。|の|が,を,に
りんご＿ バナナなどを かいました。|や|を,で,に
コーヒー＿ こうちゃ、どちらが いいですか。|と|や,も,を
9じ＿ 5じまで はたらきます。|から|まで,に,で
えき＿ あるいて 10ぷんです。|まで|に,を,が
きょうは きのう＿ さむいです。|より|から,まで,で
へや＿ テレビが あります。|に|で,を,へ
こうえん＿ あるきます。|を|に,が,と
にほんご＿ はなして ください。|で|に,が,へ
いもうと＿ ほんを あげました。|に|を,で,から
あの 人＿ だれですか。|は|を,に,で
つくえの 上＿ ペンが あります。|に|で,を,が
あした ははと デパート＿ 行きます。|へ|を,が,で
この ケーキ＿ ははが つくりました。|は|に,で,から
日本語＿ すこし わかります。|が|に,で,へ
ペン＿ なまえを 書いて ください。|で|を,に,が
うち＿ えきまで 10ぷんです。|から|まで,を,で
これは なん＿ ほんですか。|の|が,を,に
あさごはん＿ たべませんでした。|を|が,に,で
いい てんきです＿。|ね|を,が,に
デパートで くつ＿ かいました。|を|が,に,で
にちようび＿ テニスを します。|に|で,を,へ
わたしは バス＿ のります。|に|を,で,が
こうえんで まつり＿ あります。|が|を,に,で
あにの へやは 2かい＿ あります。|に|で,を,が
しゅくだいは もう おわりました＿。|か|を,が,に
あめです＿、うちに います。|から|まで,が,を
わたしは すし＿ たべたいです。|が|に,で,へ
くうこう＿ ともだちを まちます。|で|に,を,が
はし＿ わたって、みぎに まがります。|を|に,で,が
この みせは パン＿ おいしいです。|が|を,に,で`.split("\n").map(l => { const [s, a, d] = l.split("|"); return { s, a, d: d.split(",") }; });

  // ---------- by-heart vault ----------
  const VAULT = [
    { id: "kosoado", title: "こ・そ・あ・ど table", why: "Appears in every grammar section.", rows: [
      ["これ / それ / あれ / どれ", "this one / that one / that one over there / which one"],
      ["この / その / あの / どの + N", "this N / that N / that N over there / which N"],
      ["ここ / そこ / あそこ / どこ", "here / there / over there / where"],
      ["こちら / そちら / あちら / どちら", "this way / that way / that way over there / which way (polite)"],
      ["こっち / そっち / あっち / どっち", "casual versions of the row above"],
      ["こんな / そんな / あんな / どんな", "this kind / that kind / that kind / what kind"]] },
    { id: "qwords", title: "Question words", why: "One wrong question word = one lost question.", rows: [
      ["なに・なん", "what"], ["だれ・どなた", "who"], ["どこ", "where"], ["いつ", "when"], ["いくら", "how much (price)"],
      ["いくつ", "how many; how old"], ["どう・いかが", "how"], ["どんな", "what kind of"], ["どうして・なぜ", "why"],
      ["どのくらい", "how long; how much"], ["なんじ", "what time"], ["なんようび", "what day of the week"], ["なんにん", "how many people"]] },
    { id: "dates", title: "Dates 1-31 (the weird ones)", why: "Kanji reading questions love these.", rows: [
      ["1日", "ついたち"], ["2日", "ふつか"], ["3日", "みっか"], ["4日", "よっか"], ["5日", "いつか"], ["6日", "むいか"], ["7日", "なのか"],
      ["8日", "ようか"], ["9日", "ここのか"], ["10日", "とおか"], ["14日", "じゅうよっか"], ["20日", "はつか"], ["24日", "にじゅうよっか"],
      ["other days", "number + にち (じゅうくにち = 19th)"]] },
    { id: "time", title: "Hours and minutes", why: "Listening questions are full of times.", rows: [
      ["4じ", "よじ (not よんじ)"], ["7じ", "しちじ"], ["9じ", "くじ (not きゅうじ)"],
      ["1ぷん", "いっぷん"], ["3ぷん", "さんぷん"], ["4ぷん", "よんぷん"], ["6ぷん", "ろっぷん"], ["8ぷん", "はっぷん"], ["10ぷん", "じゅっぷん"],
      ["2ふん・5ふん・7ふん・9ふん", "にふん・ごふん・ななふん・きゅうふん"], ["half past", "はん: 3じはん = 3:30"]] },
    { id: "months", title: "Months and weekdays", why: "Watch 4, 7 and 9.", rows: [
      ["4がつ", "しがつ"], ["7がつ", "しちがつ"], ["9がつ", "くがつ"], ["other months", "number + がつ"],
      ["月 火 水 木 金 土 日 + ようび", "げつ か すい もく きん ど にち"]] },
    { id: "timewords", title: "Last / this / next", why: "せん・こん・らい patterns, with two exceptions.", rows: [
      ["week", "せんしゅう / こんしゅう / らいしゅう"], ["month", "せんげつ / こんげつ / らいげつ"],
      ["year", "きょねん / ことし / らいねん (exceptions!)"], ["day", "きのう / きょう / あした"],
      ["morning, evening", "けさ (this morning) / こんばん (this evening)"]] },
    { id: "family", title: "Family: mine vs yours", why: "My family = plain words; someone else's = polite words.", rows: [
      ["father", "ちち / おとうさん"], ["mother", "はは / おかあさん"], ["older brother", "あに / おにいさん"],
      ["older sister", "あね / おねえさん"], ["younger brother", "おとうと / おとうとさん"], ["younger sister", "いもうと / いもうとさん"],
      ["parents", "りょうしん / ごりょうしん"], ["family", "かぞく / ごかぞく"]] },
    { id: "te", title: "The て-form song", why: "Unlocks ください, います, から, もいい, はいけません.", rows: [
      ["う・つ・る", "→ って (かって, まって, とって)"], ["む・ぶ・ぬ", "→ んで (よんで, あそんで, しんで)"], ["く", "→ いて (かいて)"],
      ["ぐ", "→ いで (およいで)"], ["す", "→ して (はなして)"], ["group 2 (〜る)", "→ て (たべて, みて)"],
      ["する / くる", "→ して / きて"], ["exception", "いく → いって"]] },
    { id: "groups", title: "Which group is my verb?", why: "Needed for every conjugation.", rows: [
      ["group 3", "する, くる (and べんきょうする etc.)"], ["group 2", "ends in -iru or -eru: たべる, みる, おきる, ねる"],
      ["group 1", "everything else: かう, まつ, よむ, かく"], ["group 1 traps", "かえる (go home), はいる, はしる, しる, きる (cut), いる (need)"]] },
    { id: "adj", title: "Adjective endings", why: "Grammar part 1 tests these every time.", rows: [
      ["い now / not", "たかいです / たかくないです"], ["い past / not", "たかかったです / たかくなかったです"],
      ["い special", "いい → よくない, よかった"], ["な now / not", "しずかです / しずかじゃ ありません"],
      ["な past / not", "しずかでした / しずかじゃ ありませんでした"], ["before a noun", "たかい やま / しずかな へや"],
      ["joining", "たかくて / しずかで"], ["tricky な-adjectives", "きれい, きらい, ゆうめい, しんせつ"]] },
    { id: "position", title: "Position words", why: "Listening part 1 and reading part 6.", rows: [
      ["うえ / した", "on, above / under, below"], ["なか / そと", "inside / outside"], ["まえ / うしろ", "in front / behind"],
      ["みぎ / ひだり", "right / left"], ["となり / よこ", "next to / beside"], ["ちかく / あいだ", "near / between"]] },
    { id: "instructions", title: "Read the test instructions", why: "Know them before the day so you spend zero seconds on them.", rows: [
      ["もんだい", "question set"], ["えらんで ください", "please choose"], ["いちばん いい もの", "the best one"],
      ["ことばは どう かきますか", "how is the word written?"], ["ひらがなで どう かきますか", "how is it read in hiragana?"],
      ["（　）に なにを いれますか", "what goes in the blank?"], ["おなじ いみの ぶん", "a sentence with the same meaning"],
      ["★に はいる もの", "the piece that goes in ★"], ["しつもんに こたえて ください", "answer the question"], ["えを みて", "look at the picture"]] }
  ];

  // ---------- strategy content ----------
  const CODES = [
    ["Kana in 8 days, then never again", "Everything else sits on kana. Learn hiragana in 4 days and katakana in 4. Don't learn romaji spellings of words; read kana from day one."],
    ["Vocabulary is the big lever", "Words decide vocabulary questions, most grammar blanks, all reading and all listening. Fifteen to twenty-five new words a day with spaced reviews beats long weekend sessions."],
    ["Learn kanji inside words", "There are only about 100. Learn 日曜日, 一人, 三日 as words with readings. Skip stroke order: the test never asks you to write."],
    ["Grammar: patterns, not theory", "75 patterns cover N5. Learn each as a template with two example sentences. Particles と で に を は が are half the grammar marks."],
    ["Pass maths: you only need 44%", "Pass = 80/180 overall, plus at least 38/120 in sections 1 and 2 together and 19/60 in listening. A safe target is 60% in each section."],
    ["Listening has its own minimum", "Fail listening (under 19/60) and you fail the test, whatever your total. Ten minutes of listening every day from week 2."],
    ["Mocks are training, not judging", "From the second half of your plan, do one mock section a day and review every mistake. A full mock on the weekend."],
    ["Never leave a blank", "There is no penalty for wrong answers. Guess, mark it, move on."],
    ["Speed in the hall", "Vocabulary: about 50 seconds per question. Grammar and reading: grammar in 12 minutes, leaving about 25 for reading. Listening: read the printed options before each audio starts."],
    ["Small daily beats big weekly", "30 to 45 focused minutes a day, every day, is the minimum-effort route. The streak counter is there to keep you honest."]
  ];
  const SECTIONS = [
    ["Vocabulary · 20 min · 21 questions", ["Part 1 kanji reading: watch for small っ, long vowels and the special dates/counters.", "Part 2 writing: check every stroke of similar kanji and katakana (シ/ツ, ソ/ン).", "Part 3 context: read the whole sentence, the answer is usually a collocation.", "Part 4 paraphrase: translate the underlined sentence in your head, then find its twin."]],
    ["Grammar & reading · 40 min · 22 questions", ["Grammar part 1: look at the words right before and after the blank first.", "Part 2 (★): build the full sentence on scrap paper, then pick the ★ piece.", "Part 3 passage: read the sentence before and after each box.", "Reading: read the question first, then hunt for the answer in the text. Information search (part 6): only read the rows the question needs."]],
    ["Listening · 30 min · 24 questions", ["Parts 1-2: read the printed options before the talk starts; listen for changes of plan: でも, じゃあ, 〜では なくて.", "Part 3: choose what the arrow person SAYS (requests ください, offers ましょうか, greetings).", "Part 4: quick replies; trust your first instinct and move on.", "You cannot replay audio in the real test: practise in Exam mode with one play only."]]
  ];
  return { num, minutes, time, HOUR, DAYS, MONTHS, WEEK, COUNTERS, conj, teStem, FORMS, adj, PARTICLES, PDRILL, VAULT, CODES, SECTIONS };
})();
