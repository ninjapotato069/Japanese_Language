# JLPT Cheat Codes

A study app for the Japanese-Language Proficiency Test, from N5 to N1, for people with little time. It runs in the browser and as an Android app, works offline and keeps your progress on your device.

## What it does

- **A plan for every day until your exam.** Pick your level, your exam date and how many minutes a day you have. Each day you get a short session: new lessons, reviews, drills and, closer to the exam, mock papers.
- **Lessons in three steps.** Memorise with flashcards, understand with notes and examples, then pass a test. Missed questions come back at the end and go into a spaced-repetition review deck.
- **All five levels.** N5 is a hand-built course (kana, 103 kanji, 719 words, 14 grammar units, 40 mock papers). N4 to N1 add about 6,900 words and 2,000 kanji, sorted by how often they are used, with example sentences and the grammar patterns for each level. Each level keeps its own plan, reviews and scores.
- **Mock papers.** N5 has 40 papers in the real format. N4 to N1 have 12 papers each, generated from the real question types: kanji reading, writing, context, paraphrase, usage, grammar, sentence order (★), reading and listening.
- **Talk.** A speaking trainer built on the methods government language schools use to get people talking fast:
  - *Core 1,000*: the most frequent words in everyday Japanese. The first 100 cover about 63% of the words in a typical text, the first 1,000 about 87% (counting particles and endings).
  - *Anticipation*: see the English, say the Japanese in the pause, then hear the answer.
  - *Speech islands*: short talks about yourself, learned by heart.
  - *Survival tactics*: phrases for stalling, asking again, checking and steering a conversation.
  - *Pattern drills*: one sentence frame, many fillers.
  - *Missions*: role-plays from the shop counter to a job interview.
  - A ten-minute daily workout ties these together.
- **Arcade, cheat sheets and a pass predictor** for the days you need something lighter.
- **Reminders on Android**: good morning, good evening and good night notes, which change depending on whether today's session is done.

Audio uses your device's Japanese text-to-speech voice. On Android, install the Google Japanese voice if no audio plays (Settings › System › Languages › Text-to-speech).

## Install

**Android:** download the newest APK from [`releases/`](releases/) on your phone, open it and allow installing from this source. To update, install the new APK over the old one. **Do not uninstall first**, because uninstalling deletes your progress. Settings › Version › *Check for updates* tells you when a new version is out.

**Web:** open `docs/index.html`, or the GitHub Pages site once Pages is turned on for this repository (Settings › Pages › Deploy from a branch › `main` / `docs`). It can be added to the home screen and works offline after the first visit.

## Versions

The current version is in [`docs/version.json`](docs/version.json), and the history is in [`CHANGELOG.md`](CHANGELOG.md). Version numbers follow `major.minor.patch`. Every release adds its APK to `releases/`.

## Building

```
python3 tools/build_levels.py --ds <datasets folder>   # only when the N4–N1 data changes (see ATTRIBUTION.md)
python3 tools/build_content.py                         # grammar, exam banks and Talk content from content/*.txt
python3 tools/build.py                                 # the pages: dist/, docs/ and the Android page
python3 tools/tools_fonts.py <@fontsource folder>      # optional: font subsets for the offline Android page, then build.py again
KS_PASS=... android/build_apk.sh                       # the signed APK in releases/
node tests/levels.js                                   # every level boots; every lesson, paper and screen works
```

- `app/src/`: the app, plain JavaScript, bundled in file order into one page.
- `app/data/`: the N5 course and the generated N4–N1 packs.
- `content/`: hand-written grammar, exam questions and conversation content, as plain text.
- `android/`: the WebView wrapper (notifications, text-to-speech, storage).
- `tools/`: build scripts. `tests/`: automated checks.

## Things to know

- The N4–N1 papers are practice papers generated from the real question types. They are shorter than the real exam and leave out a few question types, so they show your level on each type of question, not a guaranteed score.
- Usage (用法) questions are built automatically from example sentences, using する-nouns only. Now and then a "wrong" sentence can still read naturally.
- Listening questions are read by a text-to-speech voice, not recorded speakers.
- Exam dates and registration details change. Check [jlpt.jp](https://www.jlpt.jp/e/) before you register.

Data sources and their licences are listed in [`ATTRIBUTION.md`](ATTRIBUTION.md).
