/* ===== edition · neutral: friendly coaching for anyone, no personal names ===== */
const EDITION = 'neutral';
const dayNick = () => '';
const nameCard = () => null;
function tpl(t) { return String(t).replace(/,?\s*\{[ns]\}/g, ''); }
const PEP = {
  daily: [
    'がんばって！ (ganbatte: you can do it)',
    'すこしずつ (sukoshi zutsu): little by little. Fifteen minutes still counts.',
    'You don’t need perfect. You need 80 out of 180, and you can get way more.',
    'Every kana you learn today is yours forever.',
    'できる！ (dekiru: you can). One session at a time.',
    'Tiny goal for today: one session. That’s it.',
    'ゆっくりで いいよ (yukkuri de ii yo): slow is fine. Just don’t stop.',
    '30 minutes a day = 合格. That’s the whole formula.',
    'One more word today than yesterday. That’s how N5 is won.',
    'Three alphabets, and you’re learning all of them. That’s seriously impressive.',
    'Tired day? Just do the review deck. Five minutes keeps the streak alive.',
    'きょうも がんばろう (kyou mo ganbarou): let’s give it our best today too.',
    'Future-you holding an N5 certificate says ありがとう (arigatou: thank you).',
    'You’re not behind. You’re one session away from being ahead.',
    'だいじょうぶ (daijoubu: it’s okay). Mistakes are just your brain taking notes.',
    'The mock papers should be scared of you.',
    'Coffee ready? Notebook open? Let’s do this.',
    'Five minutes of reviews counts. Promise.'
  ],
  right: ['Yes!', 'That’s it!', 'すごい！', 'Correct!', 'Nice one!', 'そうそう！'],
  wrong: ['Not quite.', 'Almost.', 'Close one.'],
  pass: [
    '合格！ Lesson passed.',
    'すごい (sugoi: amazing)! Lesson done.',
    'Look at you go! Another lesson in the bag.',
    'よくできました (yoku dekimashita: well done)!',
    'That’s one more lesson the exam can’t surprise you with.'
  ],
  done: [
    'Lesson complete! The tricky ones will come back in your reviews.',
    'Done! Missed a few? That’s exactly what the review deck is for.',
    'Finished! Every miss is now a flashcard working for you.',
    'おつかれさま！ Lesson done. You’ll nail the misses next time.'
  ],
  fail: [
    'So close! One more try and it’s yours.',
    'だいじょうぶ. Look at the misses, then go again.',
    'Not yet, but soon. Every miss becomes a card you won’t miss again.',
    'Deep breath. Flip back to Understand for a minute, then retry.',
    'You’re closer than the score says. Again?'
  ],
  session: [
    'おつかれさま means “thanks for your hard work”. You earned it.',
    'Another day closer to 合格.',
    'Streak saved, brain upgraded. Go relax.',
    'Exams are passed one ordinary day at a time, and you just did one.',
    'Today: done. Tomorrow: same time?'
  ],
  sessionTitle: ['Session complete!', 'おつかれさま！', 'Done for today!', 'Well done!'],
  streak: {
    3: '3 days in a row! The habit is forming.',
    7: 'One whole week! 一週間 (isshuukan: one week), and you can read that now.',
    14: 'Two weeks straight! Most people quit by now. Not you.',
    21: '21 days! They say that’s how long a habit takes. It’s officially yours.',
    30: '30 days in a row! A whole month.',
    50: '50-day streak! That’s real discipline. すごすぎる (sugosugiru: way too amazing).',
    75: '75 days! Unstoppable.',
    100: '100 days! ひゃくにち. Absolute legend.'
  },
  combo: ['×{c} combo! On fire!', '×{c} in a row! Unstoppable.', '×{c}! Show-off.'],
  wrongRun: ['Deep breath. だいじょうぶ.', 'Slow down a little. You know more than you think.', 'It’s okay. Every miss goes to your review deck so it sticks.'],
  mockHigh: ['That’s a pass-level section! すごい！', 'Look at that score! Exam-ready on this section.'],
  mockMid: ['Solid work. Fix the misses below and this turns into a pass-level score.', 'Good going. The review list below is where the next ten marks are hiding.'],
  mockLow: ['Early days. Every miss below is one you won’t make on exam day.', 'This is what practice is for. Read the explanations, then retake it next week.'],
  listenLow: 'Listening needs some work. A daily listening drill fixes this fast.',
  paperPass: 'You just passed a full N5 mock. That’s exactly what exam day looks like.',
  record: ['New record!', 'Personal best!', 'Record smashed!'],
  review: ['Deck cleared! Brain 1, forgetting 0.', 'All caught up. Your memory thanks you.'],
  lab: ['Your ears are getting sharper!', '聞こえた？ (kikoeta: did you catch that?) Nice work.', 'Reading like a pro!'],
  back: ['おかえり (okaeri: welcome back)! No guilt, just today’s session.', 'Welcome back! Let’s pick up right where you left off.'],
  late: 'It’s late. Do your reviews, then おやすみなさい (oyasuminasai: good night). Sleep helps memory too.',
  notes: [
    'You’re doing better than you think.',
    'Every session is a gift to future-you.',
    'がんばって！ One small step every day.',
    'You don’t have to feel ready. You just have to start.',
    'If it feels hard, that means you’re learning.',
    'One kanji at a time. 一 (ichi) is a great place to start.',
    'Sip of water, roll your shoulders, one more card. You’ve got this.',
    'Whatever the score, showing up is the win.',
    'Tap the stamp again for another one.',
    'Smile. Japanese is fun.',
    'Drink some water first. Then one quick quiz. Deal?',
    'Study now, then say one new word out loud.',
    'You + 40 mock papers = 合格.'
  ],
  countdown: {
    100: '100 days to go. Plenty of time if you start today.',
    60: '60 days. Two months of small sessions = one big 合格.',
    30: 'One month left! Mock papers start soon.',
    21: 'Three weeks to go. Mock paper time!',
    14: 'Two weeks. Mocks, review, sleep. Repeat.',
    7: 'One week left! Mocks only now. Trust your training.',
    3: '3 days. Light review and early nights.',
    2: '2 days. Vault quick pass and lots of water.',
    1: 'Tomorrow’s the day! Pack your bag and sleep early.',
    0: '今日は しけんの日 (exam day)! You’ve got this. Breathe, read the question first, never leave a blank.'
  },
  after: 'You did it! However it went, you showed up and did the work.'
};
const ED = {
  heart: '', named: false, nameCard: false,
  anyNick: () => '',
  brand: () => '',
  levelUp: () => '. Nice work!',
  routeNote: () => 'Whatever the result, showing up every day is the hard part, and you’re doing it.',
  examNote: () => 'You’ve got this. Read every option, and never leave a blank.',
  loveLabel: 'Pep talks and pop-ups',
  setup: () => [h('div', { class: 'eyebrow' }, 'Welcome'), h('h2', { class: 'gh', style: 'font-size:26px' }, 'Let’s crack N5'),
    h('p', { style: 'margin:0' }, 'A plan for every day until your exam, bite-size lessons, games, and 40 full mock papers. Answer three quick questions and your plan is ready. がんばって！ (ganbatte: you can do it)')],
  setupToast: () => 'Plan ready. Let’s go!'
};
const NOTIFY = {
  title: 'Daily reminders',
  channel: 'Daily study reminders',
  glyph: '合', color: '#D63F6B',
  names: () => [],
  ask: { eyebrow: 'Reminders', title: 'Want daily reminders?',
    body: 'A good-morning note, an evening nudge if today’s session is still waiting, and a good-night check before bed.',
    hint: 'Tap Allow on the next screen.', yes: 'Turn on', no: 'Not now' },
  granted: 'Reminders are on. Next one: {slot} at {t}.',
  later: 'Okay. You can turn reminders on any time in Settings.',
  slots: [{ id: 'morning', label: 'Good morning', icon: '☀', t: '08:00' }, { id: 'evening', label: 'Good evening', icon: '☾', t: '19:00' }, { id: 'night', label: 'Good night', icon: '🌙', t: '22:30' }],
  msgs: {
    morning: [
      ['Good morning ☀', 'Have a nice day! Today’s session is ready: 15 minutes is all it takes.'],
      ['おはよう ☀', 'Good morning! きょうも がんばって (kyou mo ganbatte: do your best today too).'],
      ['おはようございます ☀', 'That’s the polite “good morning”. Have a great day, and fit in one short session.'],
      ['Good morning ☀', 'New day, new kana. Your plan for today is ready.'],
      ['Rise and shine ☀', 'Have a nice day! いってらっしゃい (itterasshai: off you go).']
    ],
    'evening.todo': [
      ['Good evening ☾', 'Today’s session is waiting. 15 minutes before dinner?'],
      ['こんばんは ☾', 'Konbanwa means good evening. Tired? Five minutes of review keeps your streak alive.'],
      ['Good evening ☾', 'Your flashcards are due. Ten minutes now beats an hour on Sunday.']
    ],
    'evening.done': [
      ['Good evening ☾', 'Session done today. Nice work, enjoy your evening.'],
      ['こんばんは ☾', 'Today’s Japanese: done ✓ Relax, you earned it.']
    ],
    'night.todo': [
      ['Good night 🌙', 'No session today? Two minutes of review keeps your streak. Or rest, tomorrow is fine.'],
      ['おやすみ 🌙', 'Tomorrow’s session will be right here. Sleep well.']
    ],
    'night.done': [
      ['Good night 🌙', 'Session done today. おやすみ (oyasumi: good night)!'],
      ['おやすみなさい 🌙', 'Sleep locks in what you learned today. See you tomorrow.']
    ]
  }
};
