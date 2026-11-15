/* The ~103 kanji of the standard N5 list. kanji|meaning|on|kun|examples (word:reading:meaning;...)|memory hook */
window.KANJI = (function () {
  const T = `一|one|イチ・イツ|ひと(つ)|一つ:ひとつ:one (thing);一人:ひとり:one person;一月:いちがつ:January|One stroke = one
二|two|ニ|ふた(つ)|二つ:ふたつ:two (things);二人:ふたり:two people;二月:にがつ:February|Two strokes = two
三|three|サン|みっ(つ)|三つ:みっつ:three (things);三月:さんがつ:March;三日:みっか:3rd day|Three strokes = three
四|four|シ|よん・よ・よっ(つ)|四つ:よっつ:four (things);四月:しがつ:April;四人:よにん:four people|A window with curtains: four panes
五|five|ゴ|いつ(つ)|五つ:いつつ:five (things);五月:ごがつ:May;五日:いつか:5th day|A 5 with a lid and a base
六|six|ロク|むっ(つ)|六つ:むっつ:six (things);六月:ろくがつ:June;六百:ろっぴゃく:600|A person with a hat and two legs doing six sit-ups
七|seven|シチ|なな(つ)・なの|七つ:ななつ:seven (things);七月:しちがつ:July;七日:なのか:7th day|An upside-down 7 with a cross
八|eight|ハチ|やっ(つ)・よう|八つ:やっつ:eight (things);八月:はちがつ:August;八日:ようか:8th day|Two strokes spreading like the bottom of an 8
九|nine|キュウ・ク|ここの(つ)|九つ:ここのつ:nine (things);九月:くがつ:September;九時:くじ:9 o'clock|A runner (力) bent at the knee: 9
十|ten|ジュウ・ジュッ|とお|十:とお:ten (things);十日:とおか:10th day;十分:じゅっぷん:10 minutes|A cross = the Roman X = 10
百|hundred|ヒャク|—|百:ひゃく:100;三百:さんびゃく:300;八百:はっぴゃく:800|One (一) on top of white (白): one hundred
千|thousand|セン|ち|千:せん:1,000;三千:さんぜん:3,000;八千:はっせん:8,000|Ten (十) with a slash on top
万|ten thousand|マン|—|一万:いちまん:10,000;万円:まんえん:10,000 yen|A person stepping over a bar: ten thousand steps
円|yen; circle|エン|まる(い)|百円:ひゃくえん:100 yen;円い:まるい:round|A wallet frame holding coins
年|year|ネン|とし|今年:ことし:this year;去年:きょねん:last year;毎年:まいとし:every year|A farmer carrying rice once a year
月|moon; month|ゲツ・ガツ|つき|月よう日:げつようび:Monday;一月:いちがつ:January;月:つき:moon|A crescent moon with two clouds
日|sun; day|ニチ・ジツ|ひ・か|日本:にほん:Japan;日よう日:にちようび:Sunday;三日:みっか:3rd day|A window with the sun in it
火|fire|カ|ひ|火よう日:かようび:Tuesday;火:ひ:fire|A person with sparks flying from both sides
水|water|スイ|みず|水よう日:すいようび:Wednesday;水:みず:water|A stream with splashes on each side
木|tree|モク・ボク|き|木よう日:もくようび:Thursday;木:き:tree|A tree: trunk, branches, roots
金|gold; money|キン|かね|金よう日:きんようび:Friday;お金:おかね:money|A roof over a pile of gold nuggets
土|earth; soil|ド・ト|つち|土よう日:どようび:Saturday;土:つち:soil|A sprout coming out of the ground
時|time; o'clock|ジ|とき|時間:じかん:time, hours;一時:いちじ:1 o'clock;時:とき:when|Sun (日) + temple (寺): the temple bell tells the time
分|minute; divide; understand|フン・ブン|わ(かる)|五分:ごふん:5 minutes;分かる:わかる:to understand;半分:はんぶん:half|A knife (刀) splitting something in two (八)
半|half|ハン|—|半分:はんぶん:half;三時半:さんじはん:3:30|A cow cut down the middle
午|noon|ゴ|—|午前:ごぜん:a.m.;午後:ごご:p.m.|A sundial pole at noon
前|before; front|ゼン|まえ|午前:ごぜん:a.m.;前:まえ:front, before;名前:なまえ:name|Horns ahead of a moon-faced boat
後|after; behind|ゴ・コウ|あと・うし(ろ)|午後:ごご:p.m.;後ろ:うしろ:behind;後で:あとで:later|A walker (彳) trailing behind
今|now|コン|いま|今:いま:now;今日:きょう:today;今週:こんしゅう:this week|A roof over a moment: right now
週|week|シュウ|—|今週:こんしゅう:this week;毎週:まいしゅう:every week;一週間:いっしゅうかん:one week|A week moves along the road (辶)
毎|every|マイ|—|毎日:まいにち:every day;毎朝:まいあさ:every morning;毎年:まいとし:every year|Mother (母) with a hat does it every day
何|what|カ|なに・なん|何:なに:what;何時:なんじ:what time;何人:なんにん:how many people|A person (亻) next to 可 ("can"): what can I do?
人|person|ジン・ニン|ひと|人:ひと:person;日本人:にほんじん:Japanese person;三人:さんにん:3 people|A person walking on two legs
男|man|ダン|おとこ|男の人:おとこのひと:man;男の子:おとこのこ:boy|Rice field (田) + power (力): the man works the field
女|woman|ジョ|おんな|女の人:おんなのひと:woman;女の子:おんなのこ:girl|A woman sitting with crossed legs
子|child|シ|こ|子ども:こども:child;男の子:おとこのこ:boy|A baby with arms out, wrapped in a blanket
父|father|フ|ちち|父:ちち:(my) father;お父さん:おとうさん:father|Dad's crossed arms under a moustache
母|mother|ボ|はは|母:はは:(my) mother;お母さん:おかあさん:mother|A woman (女) with two dots: mother
友|friend|ユウ|とも|友だち:ともだち:friend|Two hands shaking
先|ahead; previous|セン|さき|先生:せんせい:teacher;先週:せんしゅう:last week;先月:せんげつ:last month|Feet (儿) stepping out ahead
生|life; birth|セイ|い(きる)・う(まれる)|先生:せんせい:teacher;学生:がくせい:student|A plant growing out of the ground
学|study|ガク|まな(ぶ)|学生:がくせい:student;大学:だいがく:university;学校:がっこう:school|A child (子) under a roof of learning
校|school|コウ|—|学校:がっこう:school;高校:こうこう:high school|A tree (木) by the school gate
名|name|メイ|な|名前:なまえ:name;有名:ゆうめい:famous|Evening (夕) + mouth (口): calling your name in the dark
本|book; origin|ホン|もと|本:ほん:book;日本:にほん:Japan;一本:いっぽん:one (long thing)|A tree (木) with a line marking its root
上|up; above|ジョウ|うえ・あ(がる)|上:うえ:above;上手:じょうず:skilful|A line pointing up from the ground
下|down; below|カ・ゲ|した・くだ(さい)|下:した:below;下手:へた:unskilful;地下:ちか:underground|A line pointing down from the ceiling
中|middle; inside|チュウ|なか|中:なか:inside;中国:ちゅうごく:China|A line through the middle of a box
外|outside|ガイ|そと|外:そと:outside;外国:がいこく:foreign country|Evening (夕) + divining (卜): go outside at night
右|right|ウ|みぎ|右:みぎ:right;右手:みぎて:right hand|A hand holding a mouth (口): you eat with your right
左|left|サ|ひだり|左:ひだり:left;左手:ひだりて:left hand|A hand holding a tool (工): the left helps
北|north|ホク|きた|北:きた:north;北口:きたぐち:north exit|Two people sitting back to back against the cold north wind
南|south|ナン|みなみ|南:みなみ:south;南口:みなみぐち:south exit|A warm house with a cross on the roof facing south
東|east|トウ|ひがし|東:ひがし:east;東京:とうきょう:Tokyo|The sun (日) rising behind a tree (木)
西|west|セイ・サイ|にし|西:にし:west;西口:にしぐち:west exit|A bird settling into its nest at sunset
大|big|ダイ・タイ|おお(きい)|大きい:おおきい:big;大学:だいがく:university;大人:おとな:adult|A person stretching their arms wide: big
小|small|ショウ|ちい(さい)・こ|小さい:ちいさい:small;小学校:しょうがっこう:elementary school|A tiny line with two small dots
高|tall; expensive|コウ|たか(い)|高い:たかい:tall, expensive;高校:こうこう:high school|A tall tower with a roof and windows
安|cheap; peaceful|アン|やす(い)|安い:やすい:cheap|A woman (女) under a roof: peaceful and safe
長|long; chief|チョウ|なが(い)|長い:ながい:long;社長:しゃちょう:company president|An old man with long flowing hair
新|new|シン|あたら(しい)|新しい:あたらしい:new;新聞:しんぶん:newspaper|Standing (立) by a tree (木) with a new axe (斤)
古|old|コ|ふる(い)|古い:ふるい:old|Ten (十) mouths (口) passing on an old story
白|white|ハク|しろ(い)|白い:しろい:white|The sun (日) with a ray of white light
山|mountain|サン|やま|山:やま:mountain;富士山:ふじさん:Mt Fuji|Three mountain peaks
川|river|セン|かわ|川:かわ:river|Three streams of water flowing
雨|rain|ウ|あめ|雨:あめ:rain;大雨:おおあめ:heavy rain|Raindrops falling under a cloud
天|heaven; sky|テン|—|天気:てんき:weather|A big (大) person under the sky (一)
気|spirit; air|キ|—|天気:てんき:weather;元気:げんき:healthy;電気:でんき:electricity|Steam rising from a pot
電|electricity|デン|—|電車:でんしゃ:train;電話:でんわ:telephone;電気:でんき:light|Rain (雨) cloud with a lightning bolt
車|car|シャ|くるま|車:くるま:car;電車:でんしゃ:train;自転車:じてんしゃ:bicycle|A cart seen from above: two wheels and an axle
花|flower|カ|はな|花:はな:flower;花火:はなび:fireworks|Grass (艹) that changes (化) into a flower
目|eye|モク|め|目:め:eye|An eye turned on its side
口|mouth|コウ|くち・ぐち|口:くち:mouth;入口:いりぐち:entrance;出口:でぐち:exit|An open mouth
耳|ear|ジ|みみ|耳:みみ:ear|An ear with its folds
手|hand|シュ|て|手:て:hand;上手:じょうず:skilful;切手:きって:stamp|A hand with fingers spread
足|foot; leg|ソク|あし・た(りる)|足:あし:foot, leg|A knee (口) above a foot
見|see|ケン|み(る)・み(せる)|見る:みる:to see;見せる:みせる:to show|A big eye (目) on legs, looking
聞|hear; ask|ブン|き(く)|聞く:きく:to listen, ask;新聞:しんぶん:newspaper|An ear (耳) pressed to a gate (門)
読|read|ドク|よ(む)|読む:よむ:to read|Words (言) you sell (売) by reading aloud
書|write|ショ|か(く)|書く:かく:to write;辞書:じしょ:dictionary|A hand holding a brush over the sun (日)
話|talk|ワ|はな(す)・はなし|話す:はなす:to speak;電話:でんわ:telephone|Words (言) from the tongue (舌)
言|say|ゲン|い(う)|言う:いう:to say|Words coming out of a mouth (口)
行|go|コウ|い(く)|行く:いく:to go;銀行:ぎんこう:bank;旅行:りょこう:trip|A crossroads you go through
来|come|ライ|く(る)・き(ます)|来る:くる:to come;来週:らいしゅう:next week;来年:らいねん:next year|A tree (木) the wheat came back to
出|exit; go out|シュツ|で(る)・だ(す)|出る:でる:to leave;出口:でぐち:exit;出す:だす:to take out|Two mountains (山) stacked: climbing out
入|enter|ニュウ|はい(る)・い(れる)|入る:はいる:to enter;入口:いりぐち:entrance;入れる:いれる:to put in|A person stepping in
食|eat|ショク|た(べる)|食べる:たべる:to eat;食堂:しょくどう:dining hall|A roof over a bowl of rice
飲|drink|イン|の(む)|飲む:のむ:to drink;飲み物:のみもの:drink|Food (食) + a yawning mouth (欠)
買|buy|バイ|か(う)|買う:かう:to buy;買い物:かいもの:shopping|A net (罒) over shells (貝): shells were money
休|rest|キュウ|やす(む)|休む:やすむ:to rest;休み:やすみ:holiday|A person (亻) resting against a tree (木)
立|stand|リツ|た(つ)|立つ:たつ:to stand|A person standing on the ground
会|meet|カイ|あ(う)|会う:あう:to meet;会社:かいしゃ:company|People under one roof meeting
社|company; shrine|シャ|—|会社:かいしゃ:company;社長:しゃちょう:company president|An altar (礻) on the ground (土)
国|country|コク|くに|国:くに:country;外国:がいこく:foreign country;中国:ちゅうごく:China|A jewel (玉) inside borders (囗)
語|language|ゴ|—|日本語:にほんご:Japanese;英語:えいご:English|Words (言) from five (五) mouths (口)
道|road; way|ドウ|みち|道:みち:road;北海道:ほっかいどう:Hokkaido|A head (首) moving along a road (辶)
店|shop|テン|みせ|店:みせ:shop;喫茶店:きっさてん:café|A shop sign (占) under a roof (广)
間|interval; between|カン|あいだ・ま|時間:じかん:time;一週間:いっしゅうかん:one week;間:あいだ:between|The sun (日) seen between gate doors (門)
駅|station|エキ|—|駅:えき:station|A horse (馬): the old post station
魚|fish|ギョ|さかな|魚:さかな:fish|A fish: head, scaly body, tail fins
空|sky; empty|クウ|そら・あ(く)|空:そら:sky;空港:くうこう:airport|A hole (穴) above work (工): the open sky
多|many|タ|おお(い)|多い:おおい:many|Two evenings (夕夕): many nights
少|few; a little|ショウ|すく(ない)・すこ(し)|少ない:すくない:few;少し:すこし:a little|Small (小) with one more slash taken away`;
  return T.split("\n").map((l, i) => {
    const [k, m, on, kun, ex, hook] = l.split("|");
    return { id: i, k, m, on, kun, hook, ex: ex.split(";").map(e => { const [w, r, g] = e.split(":"); return { w, r, g }; }) };
  });
})();
