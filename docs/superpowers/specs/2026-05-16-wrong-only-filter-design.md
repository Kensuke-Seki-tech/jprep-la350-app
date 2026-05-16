# 設計書: 前回間違えた問題のみ出題フィルター

**日付**: 2026-05-16  
**対象画面**: フラッシュカード、クイズ、予想問題

---

## 概要

問題セッション開始前に「全問」か「前回間違えた問題のみ」を選べるUIを追加する。
対象は直近1セッションの間違い。前回データなし・全問正解の場合は選択肢をグレーアウトする。

---

## データモデルの変更

### `QuizAnswer`（新規型） — `useProgress.ts`

```ts
export interface QuizAnswer {
  wordId: string;
  correct: boolean;
}
```

### `QuizScore`（変更） — `useProgress.ts`

```ts
export interface QuizScore {
  scoreId: string;
  weekId: string;
  score: number;
  total: number;
  percentage: number;
  mode: 'en_to_ja' | 'ja_to_en' | 'en_to_en';
  timestamp: string;
  durationSec: number;
  answers: QuizAnswer[];  // 追加（後方互換: score.answers ?? []）
}
```

### `PredictedQuizScore`（新規型） — `useProgress.ts`

```ts
export interface PredictedQuizScore {
  sessionId: string;
  weekId: string;
  timestamp: string;
  score: number;
  maxScore: number;
  wrongItems: {
    match: string[];   // 間違えたword文字列
    gap: string[];     // 間違えたanswer文字列
    mc: string[];      // 間違えたword文字列
    dict: string[];    // 間違えたword文字列
  };
}
```

---

## `useProgress.ts` の変更

### 追加メソッド

| メソッド | 返り値 | 説明 |
|---|---|---|
| `getLastQuizWrongWordIds(weekId, mode)` | `string[]` | 直近QuizScoreから間違えたwordIdの配列。データなし・全問正解は空配列 |
| `getLastFlashcardWrongWordIds(weekId)` | `string[]` | 直近FlashcardScoreから`result === 'incorrect'`のwordIdの配列 |
| `getPredictedQuizScores()` | `PredictedQuizScore[]` | localStorageから全予想問題スコアを取得 |
| `savePredictedQuizResult(result)` | `void` | 予想問題の結果を保存（sessionId・timestamp自動付与） |
| `getLastPredictedQuizWrong(weekId)` | `PredictedQuizScore['wrongItems'] \| null` | 直近予想問題の間違いアイテム。なければnull |

### localStorageキー
- 予想問題スコア: `user_{userId}_predicted_quiz_scores`

---

## 各画面の変更

### `QuizScreen.tsx`

**スタート画面に追加:**
- `filterMode: 'all' | 'wrong'` state
- `getLastQuizWrongWordIds(weekId, mode)` を呼び、間違いwordIdリストを取得
- 選択UIを出題形式の下に追加（ラジオボタン風2択）
- 「前回間違えた問題のみ」の件数を表示（例: `前回間違えた問題 (8語)`）
- データなし・全問正解の場合はグレーアウト＋理由テキスト表示

**セッション開始時:**
- `filterMode === 'wrong'` の場合、`words.filter(w => wrongIds.includes(w.id))` を `useQuizSession` に渡す
- `filterMode === 'all'` の場合、`words` をそのまま渡す

**結果保存時（`handleFinish`）:**
```ts
saveQuizResult({
  weekId,
  score: session.score,
  total: session.total,
  percentage: session.percentage,
  mode: session.mode,
  durationSec: session.durationSec,
  answers: session.answers.map(a => ({ wordId: a.wordId, correct: a.correct })),
})
```

### `useQuizSession.ts`（微修正）

`QuizAnswer` 型に `wordId` を追加:
```ts
interface QuizAnswer {
  wordId: string;   // 追加
  selected: string;
  correct: boolean;
}
```

`answerQuestion` 内で `wordId: currentWord.id` をセット。

### `FlashcardScreen.tsx`

**スタート画面に追加:**
- `filterMode: 'all' | 'wrong'` state
- `getLastFlashcardWrongWordIds(weekId)` を呼び、間違いwordIdリストを取得
- 選択UIをモード選択の下に追加

**`start()` 関数の変更:**
```ts
const start = () => {
  if (!words) return
  const pool = filterMode === 'wrong' && wrongIds.length > 0
    ? words.filter(w => wrongIds.includes(w.id))
    : words
  setCards(shuffleArray(pool))
  ...
}
```

`FlashcardScore` の型・保存ロジックは変更なし（既に `results[]` がある）。

### `PredictedQuizScreen.tsx`

**イントロ画面に追加:**
- `filterMode: 'all' | 'wrong'` state
- `getLastPredictedQuizWrong(weekId)` を呼び、間違いアイテムを取得
- 選択UI追加（データなし・全パート全問正解の場合はグレーアウト）

**各Partコンポーネントの変更:**

`onComplete` の返り値に間違いアイテム情報を追加:
```ts
// 変更前
onComplete: (pts: number) => void
// 変更後
onComplete: (pts: number, wrongIndices: string[] | number[]) => void
```

`filterMode === 'wrong'` 時、各Partに絞り込み済みアイテムを渡す:
- `Part1Matching`: `filteredItems` prop（`wrongItems.match` に含まれるwordのみ）
- `Part2GapFill`: `filteredItems` prop（`wrongItems.gap` indexのみ）
- `Part3MultipleChoice`: `filteredItems` prop（`wrongItems.mc` indexのみ）
- `Part4Dictation`: `filteredItems` prop（`wrongItems.dict` indexのみ）

絞り込み時に間違いが0のパートは自動スキップ（phaseを次のpartに進める）。

**結果保存:**
```ts
savePredictedQuizResult({
  weekId,
  score,
  maxScore,
  wrongItems: { match: wrongMatch, gap: wrongGap, mc: wrongMc, dict: wrongDict },
})
```

---

## UIの状態整理

| 状態 | 「前回間違えた問題のみ」ボタン |
|---|---|
| 前回セッションなし | グレーアウト + `(前回データなし)` |
| 前回全問正解 | グレーアウト + `(前回全問正解！)` |
| 前回に間違いあり | 有効 + `(N語)` or `(N問)` を表示 |

---

## 後方互換性

- 既存の `QuizScore` データには `answers` フィールドがないため、参照箇所は `score.answers ?? []` でフォールバック
- 既存の `FlashcardScore`・`PredictedQuizScore` の既存データはないため考慮不要

---

## テスト方針

- `useProgress` の新メソッドは既存の `useProgress.test.ts` にユニットテストを追加
- `useQuizSession` の `answers` に `wordId` が含まれることをテスト
- 各画面のスタート画面でのUI分岐はスモークテストで確認
