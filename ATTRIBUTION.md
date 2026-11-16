# Data sources

The N4–N1 packs in `app/data/levels/` are built by `tools/build_levels.py` from these open datasets. Because some of them are licensed CC BY-SA 4.0, the generated packs (`n4.json` … `n1.json`, `freq.json`) are shared under **CC BY-SA 4.0** as well.

| Data | Source | Licence |
|---|---|---|
| JLPT word lists (N5–N1) | [open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks), based on Jonathan Waller's lists at [tanos.co.uk](http://www.tanos.co.uk/jlpt/) | MIT; lists CC BY |
| Kanji, readings, meanings, JLPT levels | [kanji-data](https://github.com/davidluzgouveia/kanji-data), from KANJIDIC by the [EDRDG](https://www.edrdg.org/) | MIT; KANJIDIC CC BY-SA 4.0 |
| Parts of speech and English glosses | JMdict by the [EDRDG](https://www.edrdg.org/), via the jamdict-data package | CC BY-SA 4.0 |
| Example sentences | The Tanaka Corpus (now part of [Tatoeba](https://tatoeba.org/)), via [small_parallel_enja](https://github.com/odashi/small_parallel_enja) | CC BY 2.0 FR |
| Word frequencies for the Core 1,000 list | [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer | code Apache 2.0; data CC BY-SA 4.0 |

The N5 course, the grammar patterns and exam questions in `content/`, and the conversation content in `content/talk.txt` are written for this app.

## Methods behind the Talk tab

- Speech islands and conversation tactics: Boris Shekhtman, *How to Improve Your Foreign Language Immediately*, written from his work training diplomats, journalists and business people.
- Pattern drills: the audio-lingual method, first known as the “Army Method” from US military language training in World War II.
- Anticipation and graduated-interval recall: Paul Pimsleur's language courses.
