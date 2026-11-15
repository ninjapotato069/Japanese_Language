/* N5 vocabulary in themed decks. kana|kanji|meaning[|verb group 1/2/3] */
window.VOCAB = (function () {
  const D = [
["phrases", "Greetings & set phrases", "挨", `おはようございます||good morning
こんにちは||hello; good afternoon
こんばんは||good evening
さようなら||goodbye
おやすみなさい||good night
ありがとうございます||thank you
どういたしまして||you're welcome
すみません||excuse me; I'm sorry
ごめんなさい||I'm sorry
いただきます||said before eating
ごちそうさまでした||said after eating
いってきます||I'm off (leaving home)
いってらっしゃい||see you later (to someone leaving)
ただいま||I'm home
おかえりなさい||welcome home
はじめまして||nice to meet you
どうぞよろしく||pleased to meet you
おねがいします||please (asking for something)
どうぞ||please go ahead; here you are
どうも||thanks; very
おげんきですか|お元気ですか|how are you?
はい||yes
いいえ||no
ええ||yes (softer)
そうです||that's right
しつれいします|失礼します|excuse me (entering or leaving)
しつれいしました|失礼しました|excuse me (when leaving a room)
おじゃまします||sorry to intrude (entering a home)
おだいじに||take care (to a sick person)
おめでとうございます||congratulations
もしもし||hello (on the phone)
では||well then
じゃあ||well then (casual)
また あした||see you tomorrow
いらっしゃいませ||welcome (in a shop)
わかりました|分かりました|understood
ください||please give me
ちょっと まって ください||please wait a moment
もう いちど||once more
けっこうです||no thank you; that's fine`],
["people", "People & family", "人", `わたし|私|I; me
あなた||you
ひと|人|person
おとこ|男|man
おんな|女|woman
おとこのこ|男の子|boy
おんなのこ|女の子|girl
こども|子ども|child
おとな|大人|adult
ともだち|友だち|friend
かぞく|家族|family
ちち|父|(my) father
はは|母|(my) mother
あに|兄|(my) older brother
あね|姉|(my) older sister
おとうと|弟|younger brother
いもうと|妹|younger sister
おとうさん|お父さん|father (someone's)
おかあさん|お母さん|mother (someone's)
おにいさん|お兄さん|older brother (someone's)
おねえさん|お姉さん|older sister (someone's)
きょうだい|兄弟|siblings
りょうしん|両親|parents
おじいさん||grandfather; old man
おばあさん||grandmother; old woman
おじさん||uncle; man
おばさん||aunt; woman
ごしゅじん|ご主人|(someone's) husband
おくさん|奥さん|(someone's) wife
せんせい|先生|teacher
がくせい|学生|student
りゅうがくせい|留学生|international student
いしゃ|医者|doctor
かいしゃいん|会社員|company employee
おまわりさん||police officer
みなさん|皆さん|everyone (polite)
みんな||everyone
ひとり|一人|one person; alone
ふたり|二人|two people
〜じん|〜人|person from (country)`],
["time", "Time & calendar", "時", `いま|今|now
きょう|今日|today
あした|明日|tomorrow
きのう|昨日|yesterday
あさって||the day after tomorrow
おととい||the day before yesterday
けさ|今朝|this morning
こんばん|今晩|this evening
ゆうべ||last night
まいにち|毎日|every day
まいあさ|毎朝|every morning
まいばん|毎晩|every night
まいしゅう|毎週|every week
まいつき|毎月|every month
まいとし|毎年|every year
せんしゅう|先週|last week
こんしゅう|今週|this week
らいしゅう|来週|next week
せんげつ|先月|last month
こんげつ|今月|this month
らいげつ|来月|next month
きょねん|去年|last year
ことし|今年|this year
らいねん|来年|next year
あさ|朝|morning
ひる|昼|noon; daytime
ばん|晩|evening
よる|夜|night
ゆうがた|夕方|early evening
ごぜん|午前|a.m.; morning
ごご|午後|p.m.; afternoon
じかん|時間|time; hours
とき|時|time; when
はん|半|half past
げつようび|月曜日|Monday
かようび|火曜日|Tuesday
すいようび|水曜日|Wednesday
もくようび|木曜日|Thursday
きんようび|金曜日|Friday
どようび|土曜日|Saturday
にちようび|日曜日|Sunday
なんようび|何曜日|what day of the week
しゅうまつ|週末|weekend
やすみ|休み|holiday; day off; break
なつやすみ|夏休み|summer holidays
ふゆやすみ|冬休み|winter holidays
たんじょうび|誕生日|birthday
はる|春|spring
なつ|夏|summer
あき|秋|autumn
ふゆ|冬|winter
きせつ|季節|season
まえ|前|before; front
あと|後|after; later
はじめて|初めて|for the first time
さいご|最後|the last
いちにち|一日|one day; all day
ついたち|一日|1st of the month`],
["places", "Places & buildings", "店", `いえ|家|house
うち|家|home
へや|部屋|room
だいどころ|台所|kitchen
げんかん|玄関|entrance hall
にわ|庭|garden
おふろ|お風呂|bath
トイレ||toilet
おてあらい|お手洗い|restroom
がっこう|学校|school
だいがく|大学|university
きょうしつ|教室|classroom
としょかん|図書館|library
びょういん|病院|hospital
ぎんこう|銀行|bank
ゆうびんきょく|郵便局|post office
えき|駅|station
みせ|店|shop
デパート||department store
スーパー||supermarket
コンビニ||convenience store
レストラン||restaurant
きっさてん|喫茶店|café
しょくどう|食堂|cafeteria
ほんや|本屋|bookshop
やおや|八百屋|greengrocer
パンや|パン屋|bakery
こうえん|公園|park
どうぶつえん|動物園|zoo
えいがかん|映画館|cinema
ホテル||hotel
かいしゃ|会社|company
くうこう|空港|airport
こうばん|交番|police box
まち|町|town
くに|国|country
がいこく|外国|foreign country
ところ|所|place
いりぐち|入口|entrance
でぐち|出口|exit
かいだん|階段|stairs
エレベーター||elevator
ビル||building
アパート||apartment
プール||swimming pool
しろ|城|castle
おてら|お寺|temple
じんじゃ|神社|shrine`],
["move", "Transport & directions", "道", `くるま|車|car
でんしゃ|電車|train
ちかてつ|地下鉄|subway
バス||bus
タクシー||taxi
じてんしゃ|自転車|bicycle
ひこうき|飛行機|airplane
ふね|船|ship
みち|道|road
はし|橋|bridge
かど|角|corner
きっぷ|切符|ticket
バスてい|バス停|bus stop
みぎ|右|right
ひだり|左|left
うえ|上|on; above
した|下|under; below
なか|中|inside
そと|外|outside
うしろ|後ろ|behind
となり|隣|next to
よこ|横|beside
ちかく|近く|nearby
むこう|向こう|over there; beyond
あいだ|間|between
まっすぐ||straight ahead
ひがし|東|east
にし|西|west
みなみ|南|south
きた|北|north
〜がわ|〜側|~ side
ほう|方|direction; side`],
["food", "Food & drink", "食", `ごはん|ご飯|cooked rice; meal
あさごはん|朝ご飯|breakfast
ひるごはん|昼ご飯|lunch
ばんごはん|晩ご飯|dinner
たべもの|食べ物|food
のみもの|飲み物|drink
みず|水|water
おゆ|お湯|hot water
おちゃ|お茶|green tea
こうちゃ|紅茶|black tea
コーヒー||coffee
ぎゅうにゅう|牛乳|milk
ジュース||juice
おさけ|お酒|alcohol; sake
ビール||beer
パン||bread
にく|肉|meat
ぎゅうにく|牛肉|beef
ぶたにく|豚肉|pork
とりにく|鳥肉|chicken
さかな|魚|fish
たまご|卵|egg
やさい|野菜|vegetables
くだもの|果物|fruit
りんご||apple
みかん||mandarin orange
バナナ||banana
おかし|お菓子|sweets; snacks
ケーキ||cake
カレー||curry
てんぷら||tempura
すし||sushi
そば||soba noodles
ラーメン||ramen
サンドイッチ||sandwich
しお|塩|salt
さとう|砂糖|sugar
しょうゆ||soy sauce
バター||butter
おべんとう|お弁当|boxed lunch
りょうり|料理|cooking; dish
はし|箸|chopsticks
さら|皿|plate
ちゃわん|茶碗|rice bowl
コップ||glass; cup
カップ||cup
スプーン||spoon
フォーク||fork
ナイフ||knife
メニュー||menu`],
["things", "Home & everyday things", "物", `つくえ|机|desk
いす||chair
テーブル||table
ベッド||bed
まど|窓|window
ドア||door
と|戸|door (sliding)
かぎ||key; lock
でんき|電気|electricity; light
テレビ||TV
ラジオ||radio
でんわ|電話|telephone
れいぞうこ|冷蔵庫|refrigerator
ストーブ||heater
カメラ||camera
パソコン||computer
とけい|時計|clock; watch
しんぶん|新聞|newspaper
ざっし|雑誌|magazine
ほん|本|book
じしょ|辞書|dictionary
てがみ|手紙|letter
きって|切手|stamp
はがき||postcard
ふうとう|封筒|envelope
にもつ|荷物|luggage
かばん||bag
さいふ|財布|wallet
かさ|傘|umbrella
めがね||glasses
ハンカチ||handkerchief
ちず|地図|map
しゃしん|写真|photo
え|絵|picture; painting
はこ|箱|box
もの|物|thing
かみ|紙|paper
ペン||pen
えんぴつ|鉛筆|pencil
ボールペン||ballpoint pen
けしゴム|消しゴム|eraser
ノート||notebook
タオル||towel
シャワー||shower
カレンダー||calendar
ポスト||post box
ボタン||button
おかね|お金|money
カード||card
テープ||tape
くすり|薬|medicine`],
["school", "School & work", "学", `しごと|仕事|work; job
べんきょう|勉強|study
じゅぎょう|授業|class; lesson
しゅくだい|宿題|homework
テスト||test
しけん|試験|exam
しつもん|質問|question
こたえ|答え|answer
もんだい|問題|problem; question
れんしゅう|練習|practice
ことば|言葉|word; language
ぶん|文|sentence
さくぶん|作文|essay
かんじ|漢字|kanji
ひらがな||hiragana
カタカナ||katakana
にほんご|日本語|Japanese language
えいご|英語|English
いみ|意味|meaning
なまえ|名前|name
ページ||page
〜ばん|〜番|number ~
クラス||class
かいぎ|会議|meeting
はなし|話|talk; story
ニュース||news
コピー||copy
アルバイト||part-time job`],
["body", "Body & health", "体", `あたま|頭|head
かお|顔|face
め|目|eye
みみ|耳|ear
はな|鼻|nose
くち|口|mouth
は|歯|tooth
て|手|hand
あし|足|leg; foot
からだ|体|body
おなか||stomach
せ|背|height; back
かみ|髪|hair
こえ|声|voice
びょうき|病気|illness
かぜ|風邪|a cold
ねつ|熱|fever
のど||throat
せき||cough`],
["nature", "Nature, weather & animals", "天", `てんき|天気|weather
あめ|雨|rain
ゆき|雪|snow
かぜ|風|wind
はれ|晴れ|sunny weather
くもり|曇り|cloudy weather
そら|空|sky
やま|山|mountain
かわ|川|river
うみ|海|sea
いけ|池|pond
き|木|tree
はな|花|flower
さくら|桜|cherry blossom
いぬ|犬|dog
ねこ|猫|cat
とり|鳥|bird
どうぶつ|動物|animal
ひ|日|sun; day
つき|月|moon
ほし|星|star
いし|石|stone
みどり|緑|green; greenery`],
["clothes", "Clothes & colours", "色", `ふく|服|clothes
ようふく|洋服|Western clothes
シャツ||shirt
ワイシャツ||dress shirt
セーター||sweater
コート||coat
ズボン||trousers
スカート||skirt
くつ|靴|shoes
くつした|靴下|socks
ぼうし|帽子|hat
ネクタイ||necktie
ポケット||pocket
きもの|着物|kimono
いろ|色|colour
あか|赤|red
あお|青|blue
しろ|白|white
くろ|黒|black
きいろ|黄色|yellow
ちゃいろ|茶色|brown`],
["fun", "Hobbies & activities", "遊", `しゅみ|趣味|hobby
スポーツ||sports
サッカー||football
テニス||tennis
やきゅう|野球|baseball
すいえい|水泳|swimming
うた|歌|song
おんがく|音楽|music
えいが|映画|movie
ピアノ||piano
ギター||guitar
りょこう|旅行|trip; travel
さんぽ|散歩|walk; stroll
かいもの|買い物|shopping
パーティー||party
ゲーム||game
しあい|試合|match; game
まつり|祭り|festival
はなび|花火|fireworks
カラオケ||karaoke`],
["verbs", "Verbs (group 1 / 2 / 3)", "動", `あう|会う|to meet|1
あく|開く|to open (by itself)|1
あける|開ける|to open (something)|2
あげる||to give|2
あそぶ|遊ぶ|to play; to hang out|1
あびる|浴びる|to take (a shower)|2
あらう|洗う|to wash|1
ある||to be; to have (things)|1
あるく|歩く|to walk|1
いう|言う|to say|1
いく|行く|to go|1
いる||to be (people, animals)|2
いる|要る|to need|1
いれる|入れる|to put in|2
うたう|歌う|to sing|1
うまれる|生まれる|to be born|2
うる|売る|to sell|1
おきる|起きる|to get up|2
おく|置く|to put; to place|1
おしえる|教える|to teach; to tell|2
おす|押す|to push|1
おぼえる|覚える|to memorise|2
およぐ|泳ぐ|to swim|1
おりる|降りる|to get off|2
おわる|終わる|to end|1
かう|買う|to buy|1
かえす|返す|to give back|1
かえる|帰る|to go home|1
かかる||to take (time, money)|1
かく|書く|to write|1
かける||to call (a phone); to put on (glasses)|2
かす|貸す|to lend|1
かぶる||to put on (a hat)|1
かりる|借りる|to borrow|2
きく|聞く|to listen; to ask|1
きる|切る|to cut|1
きる|着る|to put on (a shirt)|2
くる|来る|to come|3
けす|消す|to turn off; to erase|1
こたえる|答える|to answer|2
さく|咲く|to bloom|1
さす||to put up (an umbrella)|1
しぬ|死ぬ|to die|1
しまる|閉まる|to close (by itself)|1
しめる|閉める|to close (something)|2
しめる|締める|to tie (a tie)|2
しる|知る|to know (しって います)|1
すう|吸う|to smoke; to breathe in|1
すむ|住む|to live (すんで います)|1
する||to do|3
すわる|座る|to sit|1
だす|出す|to take out; to hand in|1
たつ|立つ|to stand|1
たのむ|頼む|to ask for; to order|1
たべる|食べる|to eat|2
ちがう|違う|to be different|1
つかう|使う|to use|1
つかれる|疲れる|to get tired|2
つく|着く|to arrive|1
つくる|作る|to make|1
つける||to turn on|2
つとめる|勤める|to work for (a company)|2
でかける|出かける|to go out|2
できる||to be able to; to be ready|2
でる|出る|to leave; to go out|2
とぶ|飛ぶ|to fly|1
とまる|止まる|to stop|1
とる|取る|to take|1
とる|撮る|to take (a photo)|1
なく|鳴く|to cry (animal, bird)|1
なくす||to lose|1
ならう|習う|to learn|1
ならぶ|並ぶ|to line up|1
なる||to become|1
ぬぐ|脱ぐ|to take off (clothes)|1
ねる|寝る|to sleep; to go to bed|2
のぼる|登る|to climb|1
のむ|飲む|to drink|1
のる|乗る|to get on; to ride|1
はいる|入る|to enter|1
はく||to put on (shoes, trousers)|1
はじまる|始まる|to begin|1
はしる|走る|to run|1
はたらく|働く|to work|1
はなす|話す|to speak|1
はれる|晴れる|to clear up|2
ひく|引く|to pull; to catch (a cold)|1
ひく|弾く|to play (an instrument)|1
ふく|吹く|to blow|1
ふる|降る|to fall (rain, snow)|1
まがる|曲がる|to turn|1
まつ|待つ|to wait|1
みがく|磨く|to brush; to polish|1
みせる|見せる|to show|2
みる|見る|to see; to watch|2
もつ|持つ|to hold; to have|1
もらう||to receive|1
やすむ|休む|to rest; to take a day off|1
やる||to do (casual)|1
よぶ|呼ぶ|to call|1
よむ|読む|to read|1
わかる|分かる|to understand|1
わすれる|忘れる|to forget|2
わたす|渡す|to hand over|1
わたる|渡る|to cross|1
べんきょうする|勉強する|to study|3
けっこんする|結婚する|to get married|3
さんぽする|散歩する|to take a walk|3
そうじする|掃除する|to clean|3
せんたくする|洗濯する|to do laundry|3
りょこうする|旅行する|to travel|3
れんしゅうする|練習する|to practise|3
しつもんする|質問する|to ask a question|3
でんわする|電話する|to phone|3
かいものする|買い物する|to go shopping|3`],
["iadj", "い-adjectives", "形", `あおい|青い|blue
あかい|赤い|red
あかるい|明るい|bright
あたたかい|暖かい|warm
あたらしい|新しい|new
あつい|暑い|hot (weather)
あつい|熱い|hot (to touch)
あつい|厚い|thick
あぶない|危ない|dangerous
あまい|甘い|sweet
いい||good
いそがしい|忙しい|busy
いたい|痛い|painful
うすい|薄い|thin; weak (taste)
うるさい||noisy
おいしい||delicious
おおい|多い|many; a lot
おおきい|大きい|big
おそい|遅い|late; slow
おもい|重い|heavy
おもしろい|面白い|interesting; funny
からい|辛い|spicy
かるい|軽い|light
かわいい||cute
きいろい|黄色い|yellow
きたない|汚い|dirty
くらい|暗い|dark
くろい|黒い|black
さむい|寒い|cold (weather)
しろい|白い|white
すくない|少ない|few
すずしい|涼しい|cool
せまい|狭い|narrow; small (room)
たかい|高い|tall; expensive
たのしい|楽しい|fun
ちいさい|小さい|small
ちかい|近い|near
つまらない||boring
つめたい|冷たい|cold (to touch)
つよい|強い|strong
とおい|遠い|far
ながい|長い|long
ぬるい||lukewarm
はやい|早い|early
はやい|速い|fast
ひくい|低い|low; short
ひろい|広い|wide; spacious
ふとい|太い|thick; fat
ふるい|古い|old (things)
ほしい|欲しい|want (a thing)
ほそい|細い|thin; slender
まずい||tasting bad
まるい|丸い|round
みじかい|短い|short
むずかしい|難しい|difficult
やさしい|易しい|easy
やさしい|優しい|kind; gentle
やすい|安い|cheap
よわい|弱い|weak
わかい|若い|young
わるい|悪い|bad`],
["naadj", "な-adjectives", "好", `いや|嫌|unpleasant
いろいろ||various
きらい|嫌い|disliked
きれい||pretty; clean
げんき|元気|healthy; lively
しずか|静か|quiet
じょうず|上手|skilful
じょうぶ|丈夫|sturdy; strong
すき|好き|liked
だいじょうぶ|大丈夫|all right
だいすき|大好き|loved
たいせつ|大切|important; precious
たいへん|大変|hard; terrible
にぎやか||lively
ひま|暇|free (time)
へた|下手|unskilful
べんり|便利|convenient
ゆうめい|有名|famous
りっぱ|立派|splendid
しんせつ|親切|kind
だめ||no good
おなじ|同じ|the same (おなじ + noun)`],
["adverbs", "Adverbs, linkers & amounts", "副", `あまり||not very (+ negative)
いちばん|一番|most; number one
いっしょに|一緒に|together
いつも||always
すこし|少し|a little
ちょっと||a little; a moment
ぜんぶ|全部|all
ぜんぜん|全然|not at all (+ negative)
たくさん||a lot
とても||very
ほんとうに|本当に|really
また||again
まだ||still; not yet
もう||already; more
もっと||more
ゆっくり||slowly
よく||often; well
すぐ||soon; right away
ときどき|時々|sometimes
たいてい||usually
たぶん||probably
だいたい||roughly
はじめに|初めに|first of all
そして||and then
それから||after that
でも||but
しかし||however
ですから||so; therefore
じゃあ||well then
〜ぐらい||about (amount)
〜ごろ||about (point in time)
〜だけ||only
〜など||and so on`],
["question", "Question words & こそあど", "問", `なに|何|what
なん|何|what (before d/t/n sounds or counters)
だれ||who
どなた||who (polite)
どこ||where
どちら||which (of two); where (polite)
いつ||when
いくら||how much (money)
いくつ||how many; how old
どう||how
いかが||how (polite)
どんな||what kind of
どうして||why
なぜ||why
どれ||which one (of 3+)
どの||which (+ noun)
これ||this one
それ||that one (near you)
あれ||that one over there
この||this (+ noun)
その||that (+ noun)
あの||that over there (+ noun)
ここ||here
そこ||there (near you)
あそこ||over there
こちら||this way; this person
そちら||that way
あちら||that way over there
こっち||this way (casual)
そっち||that way (casual)
あっち||over there (casual)
どっち||which way (casual)`],
["katakana", "More katakana words", "片", `アメリカ||USA
イギリス||UK
インド||India
ちゅうごく|中国|China
かんこく|韓国|Korea
グラム||gram
キロ||kilo
メートル||metre
ゼロ||zero
スリッパ||slippers
ダンス||dance
ペット||pet
チケット||ticket
チーズ||cheese
チョコレート||chocolate
アイスクリーム||ice cream
ハンバーガー||hamburger
クッキー||cookie
ピクニック||picnic
コンサート||concert
エアコン||air conditioner
ベルト||belt
カーテン||curtain
メモ||memo
スキー||skiing
メール||email`]
  ];
  const decks = D.map(([id, title, mark, txt]) => ({
    id, title, mark,
    words: txt.split("\n").map((l, i) => {
      const [kana, kanji, en, g] = l.split("|");
      return { id: id + ":" + i, kana, kanji: kanji || "", en, g: g ? +g : 0 };
    })
  }));
  const all = decks.flatMap(d => d.words.map(w => Object.assign({ deck: d.id }, w)));
  return { decks, all };
})();
