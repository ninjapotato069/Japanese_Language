/* Kana: basic 46 + dakuten + yoon for both scripts, with original memory hooks. */
window.KANA = (function () {
  // kana | romaji | memory hook
  const H = `あ|a|A cross stuck through an apple: bite it and say "Ah!"
い|i|Two eels standing side by side: "ii" (ee)
う|u|Someone doubled over with a little hat: "Ugh, my stomach"
え|e|A dancer with a feather on her head, kicking: "Eh?"
お|o|A golfer: cross is the club, the dot is the ball flying off: "Oh!"
か|ka|A karate chop (力) with a spark flying off: "Ka!"
き|ki|An old-fashioned key: two teeth on top, a loop below
く|ku|A cuckoo's open beak: "ku, ku"
け|ke|A keg on its side with a tap on the left
こ|ko|Two lines like a coin slot: ko = coin
さ|sa|A samurai sword through a curved handle
し|shi|A fish hook: she goes fishing
す|su|A swing seat with a loop: "su-ing" on the swing
せ|se|A sail and mast: say "se" to set sail
そ|so|A zigzag thread being sewn: sew = so
た|ta|Looks like the letters t and a written together: ta
ち|chi|A cheerleader's number 5 with a little cap on top
つ|tsu|A single wave curling over: tsu-nami
て|te|A tennis racket handle bent down: te
と|to|A toe with a thorn sticking into it
な|na|A nun praying next to a cross: na
に|ni|A knee (left line) next to two short lines
ぬ|nu|Noodles with a loop at the end (め has no loop)
ね|ne|A cat (neko) with a curled tail: the loop is the tail
の|no|A "No entry" sign: a circle with a slash
は|ha|An H with an "a" hanging off it: "Ha!"
ひ|hi|A big grin: "hee hee"
ふ|fu|Mount Fuji with two little clouds at its sides
へ|he|The simplest hill you can draw: "heh"
ほ|ho|は with an extra roof bar: a ho-tel sign
ま|ma|Mama with two arms crossing over a loop
み|mi|A music note "mi" swirling into a cross-tail
む|mu|A cow with a horn and a swishing tail: "moo"
め|me|An eye (め = eye!) with a squiggle; no loop (ぬ has one)
も|mo|A fish hook with two worms: "more worms"
や|ya|A yak with a horn: ya
ゆ|yu|A U-turn sign with a line straight through it
よ|yo|A yo-yo hanging under a little crossbar
ら|ra|A rapper holding a mic upside down
り|ri|Two reeds by the river
る|ru|A route that ends in a loop (ろ has no loop)
れ|re|A man kneeling with one leg kicked out (ね has a loop)
ろ|ro|A road with a sharp turn and no loop
わ|wa|A man waving with a big curved arm (ね ends in a loop)
を|o|A man with a hat doing a kick: used only as the particle を (o)
ん|n|A lazy handwritten "n"`;
  const K = `ア|a|An axe chopping wood: "Ah!"
イ|i|An easel standing up
ウ|u|う with a roof on top
エ|e|An elevator: top floor, shaft, ground floor
オ|o|An opera singer with arms spread: "Oh!"
カ|ka|か without its spark
キ|ki|A key with two teeth
ク|ku|A cook's tall hat bent over
ケ|ke|A keg tipped with a tap (ク has no third stroke through)
コ|ko|A corner: ko-rner
サ|sa|A saddle with two posts
シ|shi|She smiles: two dots side by side, the last stroke sweeps UP
ス|su|A superhero cape flying in the wind
セ|se|Same shape family as せ
ソ|so|A needle sewing DOWN: one dot, one long stroke downward
タ|ta|ク with a tongue sticking out
チ|chi|A cheerleader with a pompom on top
ツ|tsu|Tsunami from above: two dots on top, the stroke sweeps DOWN
テ|te|A telephone pole
ト|to|A totem pole with one branch
ナ|na|A knife: ナイフ starts with ナ
ニ|ni|Two lines: 二 means 2, read ni
ヌ|nu|Chopsticks catching a noodle
ネ|ne|A necktie on a little person
ノ|no|A single slash: "No"
ハ|ha|Two lines laughing: "ha ha"
ヒ|hi|A heel kicking: hi-ya!
フ|fu|A fool's hook
ヘ|he|Same as へ
ホ|ho|A holy cross with two legs
マ|ma|Mama's open mouth shouting "Ma!"
ミ|mi|Three lines: "me" counting three
ム|mu|A flexed arm muscle: mu-scle
メ|me|An X marks "me"
モ|mo|も without the hook
ヤ|ya|A yak horn
ユ|yu|A U-turn sign (コ has the gap on the left)
ヨ|yo|A backwards E: yo
ラ|ra|フ wearing a flat cap
リ|ri|Same as り
ル|ru|Two roots of a tree
レ|re|A check mark
ロ|ro|A box, like the kanji 口 (mouth)
ワ|wa|A wine glass seen from the side (ウ has a dot on top)
ヲ|o|The particle を in katakana; almost never used
ン|n|One dot, stroke rising UP (ソ goes down)`;
  function parse(t) { return t.split("\n").map(l => { const [k, r, h] = l.split("|"); return { k, r, h }; }); }
  const DAK = [["が","ga"],["ぎ","gi"],["ぐ","gu"],["げ","ge"],["ご","go"],["ざ","za"],["じ","ji"],["ず","zu"],["ぜ","ze"],["ぞ","zo"],
    ["だ","da"],["ぢ","ji"],["づ","zu"],["で","de"],["ど","do"],["ば","ba"],["び","bi"],["ぶ","bu"],["べ","be"],["ぼ","bo"],
    ["ぱ","pa"],["ぴ","pi"],["ぷ","pu"],["ぺ","pe"],["ぽ","po"]];
  const YOON = [["きゃ","kya"],["きゅ","kyu"],["きょ","kyo"],["しゃ","sha"],["しゅ","shu"],["しょ","sho"],["ちゃ","cha"],["ちゅ","chu"],["ちょ","cho"],
    ["にゃ","nya"],["にゅ","nyu"],["にょ","nyo"],["ひゃ","hya"],["ひゅ","hyu"],["ひょ","hyo"],["みゃ","mya"],["みゅ","myu"],["みょ","myo"],
    ["りゃ","rya"],["りゅ","ryu"],["りょ","ryo"],["ぎゃ","gya"],["ぎゅ","gyu"],["ぎょ","gyo"],["じゃ","ja"],["じゅ","ju"],["じょ","jo"],
    ["びゃ","bya"],["びゅ","byu"],["びょ","byo"],["ぴゃ","pya"],["ぴゅ","pyu"],["ぴょ","pyo"]];
  const toKata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
  const hira = parse(H), kata = parse(K);
  const dakH = DAK.map(([k, r]) => ({ k, r })), dakK = DAK.map(([k, r]) => ({ k: toKata(k), r }));
  const yoH = YOON.map(([k, r]) => ({ k, r })), yoK = YOON.map(([k, r]) => ({ k: toKata(k), r }));
  // sets used by the 8-day kana sprint (5 rows per hiragana set)
  const ROWS = ["あいうえお", "かきくけこ", "さしすせそ", "たちつてと", "なにぬねの", "はひふへほ", "まみむめも", "やゆよ", "らりるれろ", "わをん"];
  const confuse = {
    h: [["さ", "ち", "Mirror images: さ opens to the left at the bottom, ち opens to the right"],
        ["ぬ", "め", "ぬ ends in a loop, め does not (め = eye)"],
        ["ね", "れ", "Both start with a vertical line: ね ends in a loop, れ kicks out"],
        ["ね", "わ", "ね loops at the end, わ curves out"],
        ["る", "ろ", "る has a loop at the bottom, ろ is open"],
        ["は", "ほ", "ほ has an extra bar on top"],
        ["い", "り", "り has a longer right stroke; い is two short strokes"],
        ["こ", "に", "に has an extra vertical line on the left"],
        ["あ", "お", "あ has a cross; お has a dot on the upper right"],
        ["う", "つ", "う has a short stroke on top, つ is just the wave"],
        ["ち", "ら", "ち has a cross bar at the top, ら has only a short dash"],
        ["た", "な", "な has a little loop at the bottom right"],
        ["き", "さ", "き has two bars, さ has one"]],
    k: [["シ", "ツ", "シ: dots side by side, last stroke goes UP. ツ: dots on top, stroke goes DOWN"],
        ["ソ", "ン", "ソ: stroke goes DOWN like ツ. ン: stroke goes UP like シ"],
        ["ク", "ケ", "ケ has a stroke crossing through"],
        ["ク", "タ", "タ has an extra stroke inside"],
        ["ウ", "ワ", "ウ has a dot on top, ワ does not"],
        ["フ", "ワ", "ワ has a short vertical line on the left"],
        ["ア", "マ", "マ has a dot-like final stroke inside, ア has a tail going down"],
        ["コ", "ユ", "ユ has a bottom line extending out to the right"],
        ["チ", "テ", "チ's top stroke slants, テ has two flat bars"],
        ["ナ", "メ", "ナ is a cross, メ is an X"],
        ["ス", "ヌ", "ヌ has an extra short stroke"],
        ["ロ", "コ", "ロ is a closed box"]]
  };
  const rules = [
    ["Dakuten ゛", "Two little marks turn k→g, s→z, t→d, h→b. か→が, さ→ざ, た→だ, は→ば."],
    ["Handakuten ゜", "A little circle turns h→p. は→ぱ, ひ→ぴ, ふ→ぷ, へ→ぺ, ほ→ぽ."],
    ["Small ゃ ゅ ょ", "Write them small after an i-sound kana to glide: き+ゃ = きゃ (kya), し+ょ = しょ (sho)."],
    ["Small っ", "A small つ means: pause and double the next consonant. きって (kitte, stamp) vs きて (kite, come)."],
    ["Long vowels", "Hiragana repeats the vowel: おかあさん, おにいさん, くうこう. え-row lengthens with い (せんせい), お-row with う (ありがとう). Katakana uses a dash: コーヒー."],
    ["は へ を as particles", "As particles they are read wa, e, o: わたしは (wa), がっこうへ (e), パンを (o)."],
    ["じ/ぢ and ず/づ", "Same sounds. You will almost always see じ and ず; ぢ/づ appear in a few words like つづく and はなぢ."],
    ["ん before b/m/p", "ん sounds like m before b, m, p: しんぶん (shimbun), さんぽ (sampo)."],
    ["Katakana extras", "Loanwords use combos like ティ (ti), ファ (fa), フォ (fo), ウェ (we): パーティー, フォーク."]
  ];
  return { hira, kata, dakH, dakK, yoH, yoK, ROWS, confuse, rules, toKata };
})();
