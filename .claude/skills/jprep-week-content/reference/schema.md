# データ形式リファレンス

型定義の出典: `src/types/word.ts`（`Word` / `WeekData` / `WeekConfig`）と
`src/pages/PredictedQuizScreen.tsx`（`QuizData`）。

## weekNN.json

```jsonc
{
  "weekId": "week21",
  "weekNumber": 21,
  "label": "Term C - Week 1",
  "sentencesToRemember": [          // 5文。キャプチャ原文のまま
    { "text": "英文", "ja": "和訳" }
  ],
  "words": [                        // 通常15語。キャプチャの並び順を保つ
    {
      "id": "w21_001",              // w + 2桁Week番号 + _ + 3桁連番
      "english": "protrude",
      "japanese": "突き出る、突出する",
      "englishDef": "to stick out of something, to be exposed",  // キャプチャ原文のまま
      "partOfSpeech": "v",          // n | adj | v | adv | phrase | other
      "ipa": "/prəˈtruːd/",
      "katakana": "prə-TROOD",      // 強勢のある音節を大文字に
      "emoji": "📌",
      "exampleEn": "A sharp nail protruded from the old fence, so we had to be careful.",
      "exampleJa": "古い柵から鋭い釘が突き出ていたので、私たちは注意しなければならなかった。",
      "etymology": {
        "morphemes": [
          { "part": "pro", "type": "prefix", "meaning": "前へ" },
          { "part": "trude", "type": "root",  "meaning": "押す（ラテン語 trudere）" }
        ],
        "imageDescription": "古い柵から釘が前方に突き出している様子",
        "relatedWords": ["protrusion", "intrude", "extrude"],
        "memoryTip": "pro（前へ）+ trude（押す）→ 前に押し出される → 突き出る"
      }
    }
  ]
}
```

`ipa` / `katakana` / `emoji` / `etymology` は型上は任意だが、既存 Week は全語に入って
いるので**必ず埋める**。

## weekNN.quiz.json

```jsonc
{
  "weekId": "week21",
  "match": [                        // 10件 = words[0..9]
    { "word": "protrude", "def": "to stick out of something, to be exposed" }
  ],
  "gap": [                          // 5件 = words[0..4]
    { "answer": "protrude",
      "sentence": "A sharp nail protruded from the old fence, so we had to be careful.",
      "ja": "古い柵から鋭い釘が突き出ていたので、私たちは注意しなければならなかった。" }
  ],
  "bank": ["...10語..."],           // words[0..9] の english、match と同順
  "mc": [                           // 10件 = words[5..14]
    { "q": "What does \"custody\" mean?",
      "opts": ["...4つ、他語の englishDef を混ぜる..."],
      "answer": 3,                  // 0始まり。位置をばらす
      "word": "custody" }
  ],
  "dict": [                         // 3件 = sentencesToRemember の 1・3・5 番目
    { "text": "He came up to the barred door of her cell and looked in.", "word": "barred" }
  ]
}
```

配点は実装側の定数（`MATCH_PTS=2` / `GAP_PTS=2` / `MC_PTS=2` / `DICT_PTS=3`）。
満点 = 10×2 + 5×2 + 10×2 + 3×3 = 59 点。

## weeks.config.json

```jsonc
{ "weekId": "week21", "weekNumber": 21, "label": "Term C - Week 1",
  "status": "available",            // available | coming_soon
  "dataUrl": "/data/week21.json", "wordCount": 15 }
```
