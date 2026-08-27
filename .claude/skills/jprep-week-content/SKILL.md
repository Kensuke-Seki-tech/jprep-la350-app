---
name: jprep-week-content
description: Build a new Week's vocabulary content for the JPREP LA350 app from JPREP のスクリーンショット/単語リスト (Term A/B/C/D の各 Week)。weekNN.json（単語データ＋Sentences to Remember）と weekNN.quiz.json（予想問題）を生成し weeks.config.json に登録する。Use when the user supplies a term's word-list images/text and asks to add a Week, a Term, or 単語データ/予想問題 to this app.
---

# JPREP Week コンテンツ作成

JPREP LA350 の Week 単語リスト（画面キャプチャまたはテキスト）から、アプリが読む
2 つの JSON を作り、Week 一覧に登録するまでを行う。**コード変更は不要**（データ追加のみ）。

## 成果物（1 Week あたり）

| ファイル | 内容 |
|---|---|
| `public/data/weekNN.json` | 単語データ（15語）＋ Sentences to Remember（5文） |
| `public/data/weekNN.quiz.json` | 予想問題（Part1〜4） |
| `public/data/weeks.config.json` | 上記 Week のエントリを 1 行追加 |

## Week 番号の付け方

`weekNN` は**通し番号**で、Term ごとにリセットしない。`label` だけが Term 表記になる。

| Term | weekId | label |
|---|---|---|
| Term A | week05〜week10 | `Week 5` … `Week 10` |
| Term B | week11〜week20 | `Term B - Week 1` … `Term B - Week 10` |
| Term C | week21〜 | `Term C - Week 1` … |
| Term D | （Term C の続き番号） | `Term D - Week 1` … |

新しい Term を始めるときは、`weeks.config.json` の**最後のエントリの weekNumber + 1** から続ける。

## 手順

### 1. 入力を読み取る

キャプチャ画像が渡されたら Read ツールで 1 枚ずつ読む。1 Week 分の画像には通常
**単語 15 語（英語・品詞・英語定義）** と **Sentences to Remember 5 文** が含まれる。

読み取ったら、先に**単語 15 語の英語綴りと英語定義だけを一覧で提示して**、
Week 番号・label とあわせてユーザーに確認する。ここで綴りを間違えると
以降すべてに波及するので、OCR に自信がない語は必ず確認する。

- 定義文（`englishDef`）は**キャプチャの原文をそのまま使う**。言い換えない。
- Sentences to Remember も**原文どおり**。
- 画像がなくテキストで渡された場合も同じ。

### 2. `public/data/weekNN.json` を書く

`public/data/week20.json` を雛形にする。フィールド仕様は
`reference/schema.md` を参照。要点:

- `id` は `wNN_001` 〜 `wNN_015`（NN は 2 桁の Week 番号）。**キャプチャの並び順を保つ**。
- `japanese` / `exampleJa` / `etymology.*` は日本語で新規作成する（中学生〜高校生が読める平易な訳）。
- `exampleEn` はその語の意味がはっきり分かる 1 文を新規作成する（10〜20 語程度）。
  Sentences to Remember の文をそのまま流用しない。
- `etymology.morphemes` は接頭辞/語根/接尾辞に分解し、`type` は `prefix` / `root` / `suffix` のいずれか。
  分解できない語は語根 1 つだけにして、`meaning` に語源（ラテン語・古英語など）を書く。
- `emoji` は語のイメージに合うものを 1 つ。`katakana` は発音のカタカナ表記（例 `prə-TROOD`）。
- `partOfSpeech` は `n` / `adj` / `v` / `adv` / `phrase` / `other` のみ。

### 3. `public/data/weekNN.quiz.json` を書く

出題範囲は week13 以降で固定パターンになっている。**必ずこの割り当てを守る**:

| パート | キー | 件数 | 対象語（`words` 配列の順） |
|---|---|---|---|
| Part1 語義マッチ | `match` | 10 | 1〜10 番目の語 |
| Part2 空所補充 | `gap` | 5 | 1〜5 番目の語 |
| （Part2 の語群） | `bank` | 10 | 1〜10 番目の語（`match` と同じ並び） |
| Part3 4択 | `mc` | 10 | 6〜15 番目の語 |
| Part4 ディクテーション | `dict` | 3 | Sentences to Remember の 1・3・5 番目 |

- `match[].def` と `mc[].opts` の正解選択肢は、`weekNN.json` の `englishDef` と**完全一致**させる。
- `gap[].sentence` / `gap[].ja` は、その語の `exampleEn` / `exampleJa` と**完全一致**させる。
  文中に答えの語（の活用形）が現れていること。
- `mc[].opts` は 4 つ。不正解の 3 つは**同じ Week の他の語の `englishDef`** から選ぶ。
  `answer` は正解の 0 始まりインデックスで、**位置は問題ごとにばらす**（0〜3 が偏らないように）。
- `dict[].text` は Sentences to Remember の原文と完全一致。`dict[].word` はその文中の
  キーワード 1 語（その Week の単語、または文中の重要語）。

配点は実装側で固定（match 2 / gap 2 / mc 2 / dict 3 点）なので JSON には書かない。

### 4. `weeks.config.json` に登録

配列の末尾に 1 行追加する。`status` は `"available"`、`wordCount` は実際の語数（通常 15）。

```json
{ "weekId": "week21", "weekNumber": 21, "label": "Term C - Week 1", "status": "available", "dataUrl": "/data/week21.json", "wordCount": 15 }
```

### 5. 検証

```bash
npm run validate:week -- week21
```

引数なしで現行フォーマットの Week をすべて検証する。JSON 構文・件数・出題範囲・
定義文の一致・`answer` インデックスの正しさをチェックする。**エラーが 0 になるまで直す。**

week05〜week13 は現行の出題規約が固まる前に作られたもので、既定ではスキップする
（`--all` で含められるが、既存データを作り直す必要はない）。

そのあとビルドとテストを通す:

```bash
npm run build && npm run test:run
```

### 6. コミット

1 Term まとめて作る場合も、**Week 数本ずつコミットを分ける**と履歴が追いやすい
（既存の履歴も `feat: Term B Week 1〜4の単語データと予想問題を追加(week11-week14)` のように分けている）。

## よくある失敗

- `match`/`mc` の定義文を `weekNN.json` の `englishDef` から微妙に変えてしまう → 検証スクリプトで落ちる。
- `mc` の `answer` が全部 0 や 3 に偏る → 出題として不自然。
- `gap` の例文が `exampleEn` と一致しない。
- `weeks.config.json` の `wordCount` が実際の語数とずれる。
- 単語の並び順をキャプチャから変えてしまう → 出題範囲（1〜10 / 6〜15）がずれる。
