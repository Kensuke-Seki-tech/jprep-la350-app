# 前回間違えた問題フィルター 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** フラッシュカード・クイズ・予想問題の開始前に「全問」か「前回間違えた問題のみ」を選べるようにする。

**Architecture:** `useProgress` フックに間違いWordId取得メソッドを追加し、各スタート画面がフィルタ済み問題リストを渡す。予想問題は `onComplete` が間違い識別子を返すよう変更し、セッション結果をlocalStorageに保存する。

**Tech Stack:** React + TypeScript, Vitest, @testing-library/react, localStorage

---

## ファイルマップ

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `src/hooks/useProgress.ts` | 修正 | `QuizAnswer`型追加、`QuizScore.answers?`追加、`PredictedQuizScore`型追加、5つのメソッド追加 |
| `src/hooks/useProgress.test.ts` | 修正 | 新メソッドのテスト6件追加 |
| `src/hooks/useQuizSession.ts` | 修正 | 内部`QuizAnswer`に`wordId`追加、`allWords`オプション引数追加 |
| `src/hooks/useQuizSession.test.ts` | 修正 | `answers[0].wordId`のテスト追加 |
| `src/pages/QuizScreen.tsx` | 修正 | filterMode state、フィルタUI、answers保存 |
| `src/pages/QuizScreen.test.tsx` | 新規作成 | フィルタUIのテスト3件 |
| `src/pages/FlashcardScreen.tsx` | 修正 | filterMode state、フィルタUI |
| `src/pages/FlashcardScreen.test.tsx` | 修正 | フィルタUIのテスト2件追加 |
| `src/pages/PredictedQuizScreen.tsx` | 修正 | effectiveData、onComplete変更、wrongItems収集・保存、filterMode state |
| `src/pages/PredictedQuizScreen.test.tsx` | 修正 | 保存・フィルタのテスト3件追加 |

---

## Task 1: useProgress — 型と新メソッドを追加

**Files:**
- Modify: `src/hooks/useProgress.ts`
- Modify: `src/hooks/useProgress.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`src/hooks/useProgress.test.ts` の末尾に追加:

```typescript
describe('useProgress — 前回間違えたWordId', () => {
  it('TC-U-034: getLastQuizWrongWordIds — スコアなしは空配列', () => {
    const { result } = renderHook(() => useProgress('u1'))
    expect(result.current.getLastQuizWrongWordIds('week05', 'en_to_ja')).toEqual([])
  })

  it('TC-U-035: getLastQuizWrongWordIds — 直近セッションの不正解wordIdを返す', () => {
    const { result } = renderHook(() => useProgress('u1'))
    act(() => result.current.saveQuizResult({
      weekId: 'week05', score: 1, total: 2, percentage: 50, mode: 'en_to_ja', durationSec: 30,
      answers: [
        { wordId: 'w1', correct: true },
        { wordId: 'w2', correct: false },
      ],
    }))
    expect(result.current.getLastQuizWrongWordIds('week05', 'en_to_ja')).toEqual(['w2'])
  })

  it('TC-U-036: getLastQuizWrongWordIds — 全問正解は空配列', () => {
    const { result } = renderHook(() => useProgress('u1'))
    act(() => result.current.saveQuizResult({
      weekId: 'week05', score: 2, total: 2, percentage: 100, mode: 'en_to_ja', durationSec: 20,
      answers: [
        { wordId: 'w1', correct: true },
        { wordId: 'w2', correct: true },
      ],
    }))
    expect(result.current.getLastQuizWrongWordIds('week05', 'en_to_ja')).toEqual([])
  })

  it('TC-U-037: getLastFlashcardWrongWordIds — 直近セッションのincorrect wordIdを返す', () => {
    const { result } = renderHook(() => useProgress('u1'))
    act(() => result.current.saveFlashcardResult({
      weekId: 'week05', correctCount: 1, totalCount: 2,
      results: [
        { wordId: 'w1', result: 'correct' },
        { wordId: 'w2', result: 'incorrect' },
      ],
    }))
    expect(result.current.getLastFlashcardWrongWordIds('week05')).toEqual(['w2'])
  })

  it('TC-U-038: savePredictedQuizResult — 保存後に getLastPredictedQuizWrong が返す', () => {
    const { result } = renderHook(() => useProgress('u1'))
    act(() => result.current.savePredictedQuizResult({
      weekId: 'week05', score: 10, maxScore: 20,
      wrongItems: { match: ['abolish'], gap: ['languid'], mc: ['supple'], dict: ['intrepid'] },
    }))
    expect(result.current.getLastPredictedQuizWrong('week05')).toEqual({
      match: ['abolish'], gap: ['languid'], mc: ['supple'], dict: ['intrepid'],
    })
  })

  it('TC-U-039: getLastPredictedQuizWrong — データなしは null', () => {
    const { result } = renderHook(() => useProgress('u1'))
    expect(result.current.getLastPredictedQuizWrong('week05')).toBeNull()
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```
npx vitest run src/hooks/useProgress.test.ts
```
Expected: 6件の新テストが `TypeError` や `not a function` で FAIL

- [ ] **Step 3: useProgress.ts に型とメソッドを実装**

`src/hooks/useProgress.ts` を以下の完成版に置き換え:

```typescript
import { useState, useCallback } from 'react';
import { getItem, setItem, userKey } from '@/utils/storage';
import type { QuizMode } from '@/utils/quiz';

export interface QuizAnswer {
  wordId: string;
  correct: boolean;
}

export interface QuizScore {
  scoreId: string;
  weekId: string;
  score: number;
  total: number;
  percentage: number;
  mode: 'en_to_ja' | 'ja_to_en' | 'en_to_en';
  timestamp: string;
  durationSec: number;
  answers?: QuizAnswer[];
}

export interface FlashcardResult {
  wordId: string;
  result: 'correct' | 'incorrect' | 'skipped';
}

export interface FlashcardScore {
  sessionId: string;
  weekId: string;
  correctCount: number;
  totalCount: number;
  results: FlashcardResult[];
  timestamp: string;
}

export interface PredictedQuizScore {
  sessionId: string;
  weekId: string;
  timestamp: string;
  score: number;
  maxScore: number;
  wrongItems: {
    match: string[];
    gap: string[];
    mc: string[];
    dict: string[];
  };
}

export function useProgress(userId: string | null) {
  const [_refresh, setRefresh] = useState(0);
  const refresh = useCallback(() => setRefresh(n => n + 1), []);

  const getQuizScores = useCallback((): QuizScore[] => {
    if (!userId) return [];
    return getItem<QuizScore[]>(userKey(userId, 'quiz_scores')) ?? [];
  }, [userId, _refresh]); // eslint-disable-line

  const getFlashcardScores = useCallback((): FlashcardScore[] => {
    if (!userId) return [];
    return getItem<FlashcardScore[]>(userKey(userId, 'flashcard_scores')) ?? [];
  }, [userId, _refresh]); // eslint-disable-line

  const getPredictedQuizScores = useCallback((): PredictedQuizScore[] => {
    if (!userId) return [];
    return getItem<PredictedQuizScore[]>(userKey(userId, 'predicted_quiz_scores')) ?? [];
  }, [userId, _refresh]); // eslint-disable-line

  const getWeekBestScore = useCallback((weekId: string): number | null => {
    const scores = getQuizScores().filter(s => s.weekId === weekId);
    if (scores.length === 0) return null;
    return Math.max(...scores.map(s => s.percentage));
  }, [getQuizScores]);

  const getWeekFlashcardCount = useCallback((weekId: string): number => {
    return getFlashcardScores().filter(s => s.weekId === weekId).length;
  }, [getFlashcardScores]);

  const getLastStudied = useCallback((weekId: string): string | null => {
    const quizDates = getQuizScores()
      .filter(s => s.weekId === weekId)
      .map(s => s.timestamp);
    const fcDates = getFlashcardScores()
      .filter(s => s.weekId === weekId)
      .map(s => s.timestamp);
    const all = [...quizDates, ...fcDates].sort().reverse();
    return all[0] ?? null;
  }, [getQuizScores, getFlashcardScores]);

  const getLastQuizWrongWordIds = useCallback((weekId: string, mode: QuizMode): string[] => {
    const scores = getQuizScores()
      .filter(s => s.weekId === weekId && s.mode === mode)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (scores.length === 0) return [];
    return (scores[0]!.answers ?? [])
      .filter(a => !a.correct)
      .map(a => a.wordId);
  }, [getQuizScores]);

  const getLastFlashcardWrongWordIds = useCallback((weekId: string): string[] => {
    const scores = getFlashcardScores()
      .filter(s => s.weekId === weekId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (scores.length === 0) return [];
    return scores[0]!.results
      .filter(r => r.result === 'incorrect')
      .map(r => r.wordId);
  }, [getFlashcardScores]);

  const getLastPredictedQuizWrong = useCallback((weekId: string): PredictedQuizScore['wrongItems'] | null => {
    const scores = getPredictedQuizScores()
      .filter(s => s.weekId === weekId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (scores.length === 0) return null;
    return scores[0]!.wrongItems;
  }, [getPredictedQuizScores]);

  const saveQuizResult = useCallback((
    result: Omit<QuizScore, 'scoreId' | 'timestamp'>
  ) => {
    if (!userId) return;
    const scores = getItem<QuizScore[]>(userKey(userId, 'quiz_scores')) ?? [];
    const newScore: QuizScore = {
      ...result,
      scoreId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setItem(userKey(userId, 'quiz_scores'), [...scores, newScore]);
    refresh();
  }, [userId, refresh]);

  const saveFlashcardResult = useCallback((
    result: Omit<FlashcardScore, 'sessionId' | 'timestamp'>
  ) => {
    if (!userId) return;
    const scores = getItem<FlashcardScore[]>(userKey(userId, 'flashcard_scores')) ?? [];
    const newScore: FlashcardScore = {
      ...result,
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setItem(userKey(userId, 'flashcard_scores'), [...scores, newScore]);
    refresh();
  }, [userId, refresh]);

  const savePredictedQuizResult = useCallback((
    result: Omit<PredictedQuizScore, 'sessionId' | 'timestamp'>
  ) => {
    if (!userId) return;
    const scores = getItem<PredictedQuizScore[]>(userKey(userId, 'predicted_quiz_scores')) ?? [];
    const newScore: PredictedQuizScore = {
      ...result,
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setItem(userKey(userId, 'predicted_quiz_scores'), [...scores, newScore]);
    refresh();
  }, [userId, refresh]);

  return {
    getQuizScores,
    getFlashcardScores,
    getPredictedQuizScores,
    getWeekBestScore,
    getWeekFlashcardCount,
    getLastStudied,
    getLastQuizWrongWordIds,
    getLastFlashcardWrongWordIds,
    getLastPredictedQuizWrong,
    saveQuizResult,
    saveFlashcardResult,
    savePredictedQuizResult,
  };
}
```

- [ ] **Step 4: テストがパスすることを確認**

```
npx vitest run src/hooks/useProgress.test.ts
```
Expected: 全件 PASS

- [ ] **Step 5: コミット**

```
git add src/hooks/useProgress.ts src/hooks/useProgress.test.ts
git commit -m "feat: useProgress に QuizAnswer・PredictedQuizScore 型と間違いID取得メソッドを追加"
```

---

## Task 2: useQuizSession — wordId追跡とallWords引数を追加

**Files:**
- Modify: `src/hooks/useQuizSession.ts`
- Modify: `src/hooks/useQuizSession.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`src/hooks/useQuizSession.test.ts` の既存テストの末尾に追加:

```typescript
  it('TC-U-027: answerQuestion で answers[0].wordId が currentWord.id と一致', () => {
    const { result } = renderHook(() => useQuizSession(mockWords, 'en_to_ja'))
    const wordId = result.current.currentWord!.id
    act(() => result.current.answerQuestion('anything'))
    expect(result.current.answers[0]!.wordId).toBe(wordId)
  })
```

- [ ] **Step 2: テストが失敗することを確認**

```
npx vitest run src/hooks/useQuizSession.test.ts
```
Expected: TC-U-027 が `undefined` で FAIL（`answers` は未公開 or `wordId` がない）

- [ ] **Step 3: useQuizSession.ts を更新**

`src/hooks/useQuizSession.ts` を以下の完成版に置き換え:

```typescript
import { useState, useCallback, useRef, useMemo } from 'react';
import type { Word } from '@/types/word';
import { shuffleArray, generateChoices, type QuizMode } from '@/utils/quiz';

interface QuizAnswer {
  wordId: string;
  selected: string;
  correct: boolean;
}

export function useQuizSession(words: Word[], mode: QuizMode, allWords?: Word[]) {
  const [questions, setQuestions] = useState(() => shuffleArray(words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef(Date.now());

  const currentWord = questions[currentIndex];
  const choicePool = allWords ?? words;
  const choices = useMemo(
    () => currentWord ? generateChoices(currentWord, choicePool, mode) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWord?.id, mode]
  );

  const answerQuestion = useCallback((selected: string) => {
    if (!currentWord || isAnswered) return;
    const correctAnswer =
      mode === 'en_to_ja' ? currentWord.japanese :
      mode === 'ja_to_en' ? currentWord.english :
      currentWord.englishDef;
    const correct = selected === correctAnswer;
    setAnswers(prev => [...prev, {
      wordId: currentWord.id,
      selected,
      correct,
    }]);
    setIsAnswered(true);
  }, [currentWord, isAnswered, mode]);

  const nextQuestion = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setIsAnswered(false);
    }
  }, [currentIndex, questions.length]);

  const reset = useCallback(() => {
    setQuestions(shuffleArray(words));
    setCurrentIndex(0);
    setAnswers([]);
    setIsAnswered(false);
    setIsFinished(false);
    startTimeRef.current = Date.now();
  }, [words]);

  const score = answers.filter(a => a.correct).length;
  const total = questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);

  return {
    currentWord,
    choices,
    currentIndex,
    total,
    score,
    percentage,
    durationSec,
    isAnswered,
    isFinished,
    answers,
    answerQuestion,
    nextQuestion,
    reset,
    mode,
  };
}
```

- [ ] **Step 4: テストがパスすることを確認**

```
npx vitest run src/hooks/useQuizSession.test.ts
```
Expected: 全件 PASS

- [ ] **Step 5: コミット**

```
git add src/hooks/useQuizSession.ts src/hooks/useQuizSession.test.ts
git commit -m "feat: useQuizSession に wordId 追跡と allWords 引数を追加"
```

---

## Task 3: QuizScreen — フィルタUI追加とanswers保存

**Files:**
- Modify: `src/pages/QuizScreen.tsx`
- Create: `src/pages/QuizScreen.test.tsx`

- [ ] **Step 1: 失敗するテストを書く**

`src/pages/QuizScreen.test.tsx` を新規作成:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import QuizScreen from './QuizScreen'
import { mockWords } from '@/test/fixtures'
import { setItem } from '@/utils/storage'

vi.mock('@/hooks/useWeeks', () => ({
  useWeeksConfig: () => ({
    data: [{ weekId: 'week05', weekNumber: 5, label: 'Week 5', status: 'available', dataUrl: '/data/week05.json', wordCount: 6 }],
  }),
}))
vi.mock('@/hooks/useWordData', () => ({
  useWordData: () => ({ data: mockWords }),
}))
vi.mock('@/hooks/useUserStore', () => ({
  useCurrentUser: () => ({ userId: 'u1', displayName: 'Test', avatarColor: '#000', createdAt: '', lastLoginAt: '' }),
  useUserStore: () => ({ users: [], currentUserId: 'u1', addUser: vi.fn(), selectUser: vi.fn(), removeUser: vi.fn(), clearCurrentUser: vi.fn() }),
}))

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/quiz/week05']}>
      <Routes>
        <Route path="/quiz/:weekId" element={<QuizScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('QuizScreen — 出題範囲フィルタ', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  it('TC-U-QUIZ-FILTER-01: 出題範囲セクションが表示される', async () => {
    renderScreen()
    expect(await screen.findByText('出題範囲')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /全問/ })).toBeInTheDocument()
  })

  it('TC-U-QUIZ-FILTER-02: 前回データなしの時、前回間違えた問題ボタンがdisabled', async () => {
    renderScreen()
    await screen.findByText('出題範囲')
    const wrongBtn = screen.getByRole('button', { name: /前回間違えた問題/ })
    expect(wrongBtn).toBeDisabled()
    expect(wrongBtn).toHaveTextContent('前回データなし')
  })

  it('TC-U-QUIZ-FILTER-03: 前回データがある時、前回間違えた問題ボタンが有効で語数を表示', async () => {
    // w2 を間違えたセッションを localStorage にセット
    setItem('user_u1_quiz_scores', [{
      scoreId: 's1', weekId: 'week05', score: 5, total: 6, percentage: 83,
      mode: 'en_to_ja', timestamp: new Date().toISOString(), durationSec: 60,
      answers: [
        { wordId: 'w1', correct: true },
        { wordId: 'w2', correct: false },
        { wordId: 'w3', correct: true },
        { wordId: 'w4', correct: true },
        { wordId: 'w5', correct: true },
        { wordId: 'w6', correct: true },
      ],
    }])
    renderScreen()
    await screen.findByText('出題範囲')
    const wrongBtn = screen.getByRole('button', { name: /前回間違えた問題/ })
    expect(wrongBtn).not.toBeDisabled()
    expect(wrongBtn).toHaveTextContent('1語')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```
npx vitest run src/pages/QuizScreen.test.tsx
```
Expected: 3件とも「出題範囲」が見つからず FAIL

- [ ] **Step 3: QuizScreen.tsx を更新**

`src/pages/QuizScreen.tsx` を以下の完成版に置き換え:

```typescript
import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useWeeksConfig } from '@/hooks/useWeeks'
import { useWordData } from '@/hooks/useWordData'
import { useCurrentUser } from '@/hooks/useUserStore'
import { useProgress } from '@/hooks/useProgress'
import { useQuizSession } from '@/hooks/useQuizSession'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizChoices } from '@/components/quiz/QuizChoices'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { formatDuration } from '@/utils/format'
import type { QuizMode } from '@/utils/quiz'

type FilterMode = 'all' | 'wrong'

export default function QuizScreen() {
  const { weekId = 'week05' } = useParams()
  useActivityLog('quiz', weekId)
  const navigate = useNavigate()
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)
  const { data: words } = useWordData(weekId, week?.dataUrl ?? null)
  const currentUser = useCurrentUser()
  const { saveQuizResult, getWeekBestScore, getLastQuizWrongWordIds, getQuizScores } = useProgress(currentUser?.userId ?? null)

  const [started, setStarted] = useState(false)
  const [mode, setMode] = useState<QuizMode>('en_to_ja')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [savedBest] = useState(() => getWeekBestScore(weekId))

  const wrongIds = useMemo(
    () => getLastQuizWrongWordIds(weekId, mode),
    [getLastQuizWrongWordIds, weekId, mode]
  )

  const hasLastSession = useMemo(
    () => getQuizScores().some(s => s.weekId === weekId && s.mode === mode),
    [getQuizScores, weekId, mode]
  )

  const wrongDisabled = wrongIds.length === 0
  const wrongLabel = wrongDisabled
    ? hasLastSession ? '前回全問正解！' : '前回データなし'
    : `${wrongIds.length}語`

  const filteredWords = useMemo(
    () => filterMode === 'wrong' && wrongIds.length > 0
      ? (words ?? []).filter(w => wrongIds.includes(w.id))
      : (words ?? []),
    [filterMode, wrongIds, words]
  )

  const session = useQuizSession(filteredWords, mode, words ?? [])

  useEffect(() => {
    if (!selected) return
    const t = setTimeout(() => {
      session.nextQuestion()
      setSelected(null)
    }, 2000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const handleAnswer = (ans: string) => {
    if (selected) return
    session.answerQuestion(ans)
    setSelected(ans)
  }

  const handleStart = () => {
    session.reset()
    setStarted(true)
  }

  const handleFinish = () => {
    saveQuizResult({
      weekId,
      score: session.score,
      total: session.total,
      percentage: session.percentage,
      mode: session.mode,
      durationSec: session.durationSec,
      answers: session.answers.map(a => ({ wordId: a.wordId, correct: a.correct })),
    })
  }

  if (!words) return <div className="py-8 text-center text-slate-400">読み込み中...</div>

  if (!started) {
    return (
      <div className="py-8 flex flex-col items-center">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">クイズ</h2>
        <p className="text-slate-500 mb-6">{week?.label} — {words.length}語</p>

        <div className="w-full max-w-xs mb-4">
          <p className="text-sm font-semibold text-slate-600 mb-2">出題形式</p>
          <div className="flex gap-3">
            {(['en_to_ja', 'ja_to_en', 'en_to_en'] as QuizMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  mode === m ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600'
                }`}
              >
                {m === 'en_to_ja' ? '英→日' : m === 'ja_to_en' ? '日→英' : '英→英'}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-xs mb-6">
          <p className="text-sm font-semibold text-slate-600 mb-2">出題範囲</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left ${
                filterMode === 'all'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              全問 ({words.length}語)
            </button>
            <button
              onClick={() => !wrongDisabled && setFilterMode('wrong')}
              disabled={wrongDisabled}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left ${
                wrongDisabled
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : filterMode === 'wrong'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              前回間違えた問題 ({wrongLabel})
            </button>
          </div>
        </div>

        <Button size="lg" onClick={handleStart} className="w-full max-w-xs">スタート</Button>
      </div>
    )
  }

  if (session.isFinished) {
    const isNewBest = savedBest === null || session.percentage > savedBest
    return (
      <div className="py-8 flex flex-col items-center text-center">
        <div className="text-6xl mb-4">{session.percentage >= 80 ? '🏆' : '📝'}</div>
        {isNewBest && session.percentage > 0 && (
          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
            🎉 ベストスコア更新！
          </div>
        )}
        <p className="text-5xl font-bold text-blue-600 mb-1">{session.percentage}%</p>
        <p className="text-slate-500 mb-1">{session.score} / {session.total} 問 正解</p>
        <p className="text-xs text-slate-400 mb-4">所要時間: {formatDuration(session.durationSec)}</p>
        <ProgressBar value={session.percentage} className="w-full max-w-xs mb-8" />
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => { handleFinish(); navigate(`/quiz/${weekId}`) }}>もう一度</Button>
          <Button variant="secondary" onClick={() => { handleFinish(); navigate('/progress') }}>結果を保存して進捗へ</Button>
        </div>
      </div>
    )
  }

  const correctAnswer = session.currentWord
    ? mode === 'en_to_ja' ? session.currentWord.japanese
      : mode === 'ja_to_en' ? session.currentWord.english
      : session.currentWord.englishDef
    : ''

  const isCorrect = selected !== null && selected === correctAnswer

  return (
    <div className="py-4">
      <QuizProgress currentIndex={session.currentIndex} total={session.total} score={session.score} />
      {session.currentWord && (
        <>
          <QuizQuestion
            word={session.currentWord}
            mode={session.mode}
            currentIndex={session.currentIndex}
            total={session.total}
          />
          <QuizChoices
            choices={session.choices}
            correctAnswer={correctAnswer}
            selected={selected}
            onAnswer={handleAnswer}
          />
          {selected && (
            <div className={`mt-4 px-5 py-3 rounded-xl text-center font-bold text-base ${
              isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isCorrect ? '✅ 正解！' : `❌ 不正解 — 正解: ${correctAnswer}`}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: テストがパスすることを確認**

```
npx vitest run src/pages/QuizScreen.test.tsx
```
Expected: 3件 PASS

- [ ] **Step 5: コミット**

```
git add src/pages/QuizScreen.tsx src/pages/QuizScreen.test.tsx
git commit -m "feat: QuizScreen に出題範囲フィルタUI を追加し answers を保存"
```

---

## Task 4: FlashcardScreen — フィルタUI追加

**Files:**
- Modify: `src/pages/FlashcardScreen.tsx`
- Modify: `src/pages/FlashcardScreen.test.tsx`

- [ ] **Step 1: 失敗するテストを書く**

`src/pages/FlashcardScreen.test.tsx` の末尾に追加（既存の `describe` の外に新しい `describe` を追加）:

```typescript
describe('FlashcardScreen — 出題範囲フィルタ', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  it('TC-U-FLASHCARD-FILTER-01: 出題範囲セクションが表示され全問がデフォルト', async () => {
    renderScreen()
    expect(await screen.findByText('出題範囲')).toBeInTheDocument()
    const allBtn = screen.getByRole('button', { name: /全問/ })
    expect(allBtn.className).toContain('blue-600')
  })

  it('TC-U-FLASHCARD-FILTER-02: 前回データなしの時、前回間違えた問題ボタンがdisabled', async () => {
    renderScreen()
    await screen.findByText('出題範囲')
    const wrongBtn = screen.getByRole('button', { name: /前回間違えた問題/ })
    expect(wrongBtn).toBeDisabled()
  })
})
```

必要なインポートを `FlashcardScreen.test.tsx` の先頭に確認・追加（`setItem` は `@/utils/storage` から）。

- [ ] **Step 2: テストが失敗することを確認**

```
npx vitest run src/pages/FlashcardScreen.test.tsx
```
Expected: 新規2件が「出題範囲」未発見で FAIL、既存4件は PASS

- [ ] **Step 3: FlashcardScreen.tsx を更新**

`src/pages/FlashcardScreen.tsx` を以下の完成版に置き換え:

```typescript
import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useWeeksConfig } from '@/hooks/useWeeks'
import { useWordData } from '@/hooks/useWordData'
import { useCurrentUser } from '@/hooks/useUserStore'
import { useProgress } from '@/hooks/useProgress'
import { shuffleArray } from '@/utils/quiz'
import type { FlashcardMode } from '@/utils/quiz'
import { FlashcardCard } from '@/components/flashcard/FlashcardCard'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'

type CardResult = { wordId: string; result: 'correct' | 'incorrect' }
type FilterMode = 'all' | 'wrong'

const MODES: { value: FlashcardMode; label: string; desc: string }[] = [
  { value: 'en_to_ja', label: '英 → 日', desc: '英単語を見て日本語を答える' },
  { value: 'ja_to_en', label: '日 → 英', desc: '日本語を見て英単語を答える' },
  { value: 'en_to_en', label: '英 → 英', desc: '英単語を見て英語定義を答える' },
]

export default function FlashcardScreen() {
  const { weekId = 'week05' } = useParams()
  useActivityLog('flashcard', weekId)
  const navigate = useNavigate()
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)
  const { data: words } = useWordData(weekId, week?.dataUrl ?? null)
  const currentUser = useCurrentUser()
  const { saveFlashcardResult, getLastFlashcardWrongWordIds, getFlashcardScores } = useProgress(currentUser?.userId ?? null)

  const [cards, setCards] = useState<typeof words>()
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<CardResult[]>([])
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mode, setMode] = useState<FlashcardMode>('en_to_ja')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')

  const wrongIds = useMemo(
    () => getLastFlashcardWrongWordIds(weekId),
    [getLastFlashcardWrongWordIds, weekId]
  )

  const hasLastSession = useMemo(
    () => getFlashcardScores().some(s => s.weekId === weekId),
    [getFlashcardScores, weekId]
  )

  const wrongDisabled = wrongIds.length === 0
  const wrongLabel = wrongDisabled
    ? hasLastSession ? '前回全問正解！' : '前回データなし'
    : `${wrongIds.length}語`

  const start = () => {
    if (!words) return
    const pool = filterMode === 'wrong' && wrongIds.length > 0
      ? words.filter(w => wrongIds.includes(w.id))
      : words
    setCards(shuffleArray(pool))
    setIndex(0)
    setResults([])
    setStarted(true)
    setFinished(false)
  }

  const handleResult = (result: 'correct' | 'incorrect') => {
    if (!cards) return
    const word = cards[index]
    if (!word) return
    const newResults = [...results, { wordId: word.id, result }]
    setResults(newResults)

    if (index >= cards.length - 1) {
      const correctCount = newResults.filter(r => r.result === 'correct').length
      saveFlashcardResult({
        weekId,
        correctCount,
        totalCount: cards.length,
        results: newResults.map(r => ({ ...r, result: r.result })),
      })
      setFinished(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  const currentCard = cards?.[index]
  const correctCount = results.filter(r => r.result === 'correct').length
  const total = cards?.length ?? 0
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0

  if (!words) return <div className="py-8 text-center text-slate-400">読み込み中...</div>

  if (!started) {
    return (
      <div className="py-8 flex flex-col items-center">
        <div className="text-6xl mb-4">🃏</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">フラッシュカード</h2>
        <p className="text-slate-500 mb-6">{week?.label} — {words.length}語</p>

        <div className="w-full max-w-xs mb-4">
          <p className="text-sm font-semibold text-slate-600 mb-2">学習モード</p>
          <div className="flex flex-col gap-2">
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left flex items-center gap-3 ${
                  mode === m.value
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                <span className="text-base font-bold w-16">{m.label}</span>
                <span className={`text-xs ${mode === m.value ? 'text-blue-100' : 'text-slate-400'}`}>{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-xs mb-6">
          <p className="text-sm font-semibold text-slate-600 mb-2">出題範囲</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left ${
                filterMode === 'all'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              全問 ({words.length}語)
            </button>
            <button
              onClick={() => !wrongDisabled && setFilterMode('wrong')}
              disabled={wrongDisabled}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left ${
                wrongDisabled
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : filterMode === 'wrong'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              前回間違えた問題 ({wrongLabel})
            </button>
          </div>
        </div>

        <Button size="lg" onClick={start} className="w-full max-w-xs">スタート</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="py-8 flex flex-col items-center text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">完了！</h2>
        <p className="text-5xl font-bold text-blue-600 mb-1">{pct}%</p>
        <p className="text-slate-500 mb-2">{correctCount} / {total} 語 覚えた</p>
        <ProgressBar value={pct} className="w-full max-w-xs mb-8" />
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={start}>もう一度</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>ホームへ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <ProgressBar value={total > 0 ? (index / total) * 100 : 0} className="mb-4" />
      {currentCard && (
        <FlashcardCard
          word={currentCard}
          index={index}
          total={total}
          mode={mode}
          onResult={handleResult}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: テストがパスすることを確認**

```
npx vitest run src/pages/FlashcardScreen.test.tsx
```
Expected: 全6件 PASS

- [ ] **Step 5: コミット**

```
git add src/pages/FlashcardScreen.tsx src/pages/FlashcardScreen.test.tsx
git commit -m "feat: FlashcardScreen に出題範囲フィルタUI を追加"
```

---

## Task 5: PredictedQuizScreen — 間違い追跡・保存・フィルタUI

**Files:**
- Modify: `src/pages/PredictedQuizScreen.tsx`
- Modify: `src/pages/PredictedQuizScreen.test.tsx`

注: `PredictedQuizScore.wrongItems` の型を設計書から変更する。  
各パートの間違いを索引（index）ではなく識別文字列（word/answer）で保存することで、フィルタ時にインデックスのズレを防ぐ。  
- `match`: 間違えた word 文字列  
- `gap`: 間違えた answer 文字列  
- `mc`: 間違えた word 文字列  
- `dict`: 間違えた word 文字列

- [ ] **Step 1: 失敗するテストを書く**

`src/pages/PredictedQuizScreen.test.tsx` の末尾に追加（既存 import の `mockQuizData` はすでに import 済み）:

```typescript
vi.mock('@/hooks/useUserStore', () => ({
  useCurrentUser: () => ({ userId: 'u1', displayName: 'Test', avatarColor: '#000', createdAt: '', lastLoginAt: '' }),
  useUserStore: () => ({ users: [], currentUserId: 'u1', addUser: vi.fn(), selectUser: vi.fn(), removeUser: vi.fn(), clearCurrentUser: vi.fn() }),
}))

describe('PredictedQuizScreen — 出題範囲フィルタ', () => {
  it('TC-U-PRED-21: イントロ画面に出題範囲セクションが表示される', async () => {
    mockFetchOk()
    renderScreen()
    expect(await screen.findByText('出題範囲')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /全問/ })).toBeInTheDocument()
  })

  it('TC-U-PRED-22: 前回データなしの時、前回間違えた問題ボタンがdisabled', async () => {
    mockFetchOk()
    renderScreen()
    await screen.findByText('出題範囲')
    const wrongBtn = screen.getByRole('button', { name: /前回間違えた問題/ })
    expect(wrongBtn).toBeDisabled()
  })

  it('TC-U-PRED-23: 全問終了後に predicted_quiz_scores が localStorage に保存される', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ...mockQuizData,
      match: [{ word: 'sapling', def: 'a young tree' }],
      gap: [{ answer: 'sapling', sentence: 'plant a sapling now', ja: 'いま苗木を植える' }],
      bank: ['sapling'],
      mc: [{ q: 'meaning?', opts: ['a young tree', 'X', 'Y', 'Z'], answer: 0, word: 'sapling' }],
      dict: [{ text: 'plant a sapling', word: 'sapling' }],
    }), { status: 200 }))
    renderScreen()
    await screen.findByText(/予想問題/)
    await user.click(screen.getByRole('button', { name: 'スタート' }))
    // Part1 正解
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(screen.getByRole('button', { name: /a young tree/ }))
    await user.click(await screen.findByRole('button', { name: 'Part 2 へ' }))
    // Part2 正解
    await user.click(screen.getByRole('button', { name: /＿＿＿/ }))
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(await screen.findByRole('button', { name: 'Part 3 へ' }))
    // Part3 正解
    await user.click(screen.getByRole('button', { name: 'a young tree' }))
    await user.click(await screen.findByRole('button', { name: 'Part 4 へ' }))
    // Part4 正解
    const input = screen.getByPlaceholderText('聴こえた文を書き取ろう...')
    await user.type(input, 'plant a sapling')
    await user.click(screen.getByRole('button', { name: '採点' }))
    await user.click(await screen.findByRole('button', { name: '結果を見る' }))
    await screen.findByText('Outstanding!!')
    // localStorage に保存されていることを確認
    const { getItem } = await import('@/utils/storage')
    const saved = getItem<unknown[]>('user_u1_predicted_quiz_scores')
    expect(saved).toHaveLength(1)
  }, 20000)
})
```

- [ ] **Step 2: テストが失敗することを確認**

```
npx vitest run src/pages/PredictedQuizScreen.test.tsx --reporter=verbose 2>&1 | tail -20
```
Expected: TC-U-PRED-21, 22, 23 が FAIL、既存テストは PASS

- [ ] **Step 3: PredictedQuizScreen.tsx を更新**

`src/pages/PredictedQuizScreen.tsx` を以下の完成版に置き換え:

```typescript
import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useWeeksConfig } from '@/hooks/useWeeks'
import { useAudio } from '@/hooks/useAudio'
import { useCurrentUser } from '@/hooks/useUserStore'
import { useProgress } from '@/hooks/useProgress'
import { Button } from '@/components/common/Button'

// ── Data types ──────────────────────────────────────────────
interface MatchItem  { word: string; def: string }
interface GapItem    { answer: string; sentence: string; ja: string }
interface MCItem     { q: string; opts: string[]; answer: number; word: string }
interface DictItem   { text: string; word: string }

interface QuizData {
  weekId: string
  match: MatchItem[]
  gap: GapItem[]
  bank: string[]
  mc: MCItem[]
  dict: DictItem[]
}

type Phase = 'intro' | 'part1' | 'part2' | 'part3' | 'part4' | 'result'
type FilterMode = 'all' | 'wrong'

// ── Score constants ──────────────────────────────────────────
const MATCH_PTS = 2
const GAP_PTS   = 2
const MC_PTS    = 2
const DICT_PTS  = 3

// ── Helpers ──────────────────────────────────────────────────
function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function calcMaxScore(data: QuizData): number {
  return data.match.length * MATCH_PTS + data.gap.length * GAP_PTS + data.mc.length * MC_PTS + data.dict.length * DICT_PTS
}

// ── Main component ───────────────────────────────────────────
export default function PredictedQuizScreen() {
  const { weekId = 'week05' } = useParams()
  useActivityLog('predicted_quiz', weekId)
  const navigate = useNavigate()
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)
  const currentUser = useCurrentUser()
  const { savePredictedQuizResult, getLastPredictedQuizWrong, getPredictedQuizScores } = useProgress(currentUser?.userId ?? null)

  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [phase, setPhase]       = useState<Phase>('intro')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')

  const [score, setScore]       = useState(0)
  const scoreRef    = useRef(0)

  // 各パートの間違いアイテム（識別文字列）
  const [wrongMatch, setWrongMatch] = useState<string[]>([])
  const [wrongGap,   setWrongGap]   = useState<string[]>([])
  const [wrongMc,    setWrongMc]    = useState<string[]>([])
  const [wrongDict,  setWrongDict]  = useState<string[]>([])

  const addScore = (pts: number) => {
    scoreRef.current += pts
    setScore(s => s + pts)
  }

  // Load quiz data
  useEffect(() => {
    const url = `/data/${weekId}.quiz.json`
    fetch(url)
      .then(r => r.json())
      .then((d: QuizData) => {
        setQuizData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [weekId])

  const lastWrong = useMemo(
    () => getLastPredictedQuizWrong(weekId),
    [getLastPredictedQuizWrong, weekId]
  )

  const hasLastSession = useMemo(
    () => getPredictedQuizScores().some(s => s.weekId === weekId),
    [getPredictedQuizScores, weekId]
  )

  // フィルタ済みデータ（全問 or 前回間違えたもの）
  const effectiveData = useMemo((): QuizData | null => {
    if (!quizData) return null
    if (filterMode === 'all' || !lastWrong) return quizData
    return {
      ...quizData,
      match: quizData.match.filter(item => lastWrong.match.includes(item.word)),
      gap:   quizData.gap.filter(item => lastWrong.gap.includes(item.answer)),
      mc:    quizData.mc.filter(item => lastWrong.mc.includes(item.word)),
      dict:  quizData.dict.filter(item => lastWrong.dict.includes(item.word)),
    }
  }, [quizData, filterMode, lastWrong])

  const wrongDisabled = !lastWrong || (
    lastWrong.match.length === 0 &&
    lastWrong.gap.length === 0 &&
    lastWrong.mc.length === 0 &&
    lastWrong.dict.length === 0
  )

  const wrongLabel = wrongDisabled
    ? hasLastSession ? '前回全問正解！' : '前回データなし'
    : undefined

  // フィルタモード時に空のパートをスキップして次のphaseを返す
  const nextPhase = (current: Phase): Phase => {
    if (!effectiveData) return 'result'
    const order: Phase[] = ['part1', 'part2', 'part3', 'part4', 'result']
    const partData: Record<string, unknown[]> = {
      part1: effectiveData.match,
      part2: effectiveData.gap,
      part3: effectiveData.mc,
      part4: effectiveData.dict,
    }
    let next = order[order.indexOf(current) + 1] ?? 'result'
    while (next !== 'result' && (partData[next]?.length ?? 0) === 0) {
      next = order[order.indexOf(next) + 1] ?? 'result'
    }
    return next
  }

  const handleComplete = (
    part: 'match' | 'gap' | 'mc' | 'dict',
    pts: number,
    wrongIds: string[],
    currentPhase: Phase
  ) => {
    addScore(pts)
    if (part === 'match') setWrongMatch(wrongIds)
    else if (part === 'gap') setWrongGap(wrongIds)
    else if (part === 'mc') setWrongMc(wrongIds)
    else setWrongDict(wrongIds)

    const next = nextPhase(currentPhase)
    if (next === 'result') {
      // save before showing result (scoreRef.current already includes pts from addScore above)
      savePredictedQuizResult({
        weekId,
        score: scoreRef.current,
        maxScore: effectiveData ? calcMaxScore(effectiveData) : 0,
        wrongItems: {
          match: part === 'match' ? wrongIds : wrongMatch,
          gap:   part === 'gap'   ? wrongIds : wrongGap,
          mc:    part === 'mc'    ? wrongIds : wrongMc,
          dict:  part === 'dict'  ? wrongIds : wrongDict,
        },
      })
    }
    setPhase(next)
  }

  if (loading) return <div className="py-8 text-center text-slate-400">読み込み中...</div>
  if (!quizData || !effectiveData) return <div className="py-8 text-center text-slate-400">データが見つかりません</div>

  // ── Phase renderers ──
  if (phase === 'intro') {
    const maxScore = calcMaxScore(quizData)
    return (
      <div className="py-8 flex flex-col items-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">{week?.label} 予想問題</h2>
        <p className="text-slate-500 mb-6">LA350 の単語で腕試し！</p>
        <div className="w-full max-w-xs space-y-2 mb-6">
          {[
            { part: 'Part 1', icon: '🔗', title: 'Vocabulary Matching', desc: `${quizData.match.length}問 — 単語と定義を対応させよう` },
            { part: 'Part 2', icon: '📝', title: 'Sentence Gap Fill',   desc: `${quizData.gap.length}問 — 空欄を埋めよう` },
            { part: 'Part 3', icon: '💡', title: 'Multiple Choice',     desc: `${quizData.mc.length}問 — 意味を選ぼう` },
            { part: 'Part 4', icon: '🎧', title: 'Dictation',           desc: `${quizData.dict.length}問 — 音声を書き取ろう` },
          ].map(item => (
            <div key={item.part} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.part}: {item.title}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-xs mb-4">
          <p className="text-sm font-semibold text-slate-600 mb-2">出題範囲</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left ${
                filterMode === 'all'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              全問
            </button>
            <button
              onClick={() => !wrongDisabled && setFilterMode('wrong')}
              disabled={wrongDisabled}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left ${
                wrongDisabled
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : filterMode === 'wrong'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              {wrongLabel ? `前回間違えた問題 (${wrongLabel})` : '前回間違えた問題'}
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-4">満点: {maxScore}点</p>
        <Button size="lg" onClick={() => { setScore(0); scoreRef.current = 0; setPhase(nextPhase('intro')) }} className="w-full max-w-xs">スタート</Button>
      </div>
    )
  }

  if (phase === 'part1') {
    return (
      <Part1Matching
        items={effectiveData.match}
        onComplete={(pts, wrongWords) => handleComplete('match', pts, wrongWords, 'part1')}
      />
    )
  }

  if (phase === 'part2') {
    return (
      <Part2GapFill
        items={effectiveData.gap}
        bank={quizData.bank}
        onComplete={(pts, wrongAnswers) => handleComplete('gap', pts, wrongAnswers, 'part2')}
      />
    )
  }

  if (phase === 'part3') {
    return (
      <Part3MultipleChoice
        items={effectiveData.mc}
        onComplete={(pts, wrongWords) => handleComplete('mc', pts, wrongWords, 'part3')}
      />
    )
  }

  if (phase === 'part4') {
    return (
      <Part4Dictation
        items={effectiveData.dict}
        onComplete={(pts, wrongWords) => handleComplete('dict', pts, wrongWords, 'part4')}
      />
    )
  }

  // Result
  const maxScore = calcMaxScore(effectiveData)
  const pct = maxScore > 0 ? Math.max(0, Math.min(100, Math.round(score / maxScore * 100))) : 0
  let emoji = '🌱', title = "Let's Try Again!", msg = '焦らず、発音を聴きながら一語ずつ覚えよう！'
  if (pct >= 90) { emoji = '🏆'; title = 'Outstanding!!'; msg = '完璧！本番のクイズも余裕で合格できそう！' }
  else if (pct >= 75) { emoji = '🎉'; title = 'Great Job!'; msg = 'よくできました！間違えた問題を復習しよう。' }
  else if (pct >= 55) { emoji = '💪'; title = 'Good Try!'; msg = 'もうひと息！単語リストで確認してから再挑戦しよう。' }
  else if (pct >= 30) { emoji = '📚'; title = 'Keep Going!'; msg = '単語学習に戻って基礎を固めよう！' }

  return (
    <div className="py-8 flex flex-col items-center text-center">
      <div className="text-6xl mb-3">{emoji}</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">{title}</h2>
      <p className="text-5xl font-bold text-blue-600 mb-1">{pct}%</p>
      <p className="text-slate-500 mb-1">{score} / {maxScore} 点</p>
      <p className="text-sm text-slate-400 mb-6">{msg}</p>
      <div className="w-full max-w-xs space-y-2 mb-6 text-left">
        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 space-y-1">
          <p>Part 1 マッチング: 満点 {effectiveData.match.length * MATCH_PTS}点</p>
          <p>Part 2 穴埋め: 満点 {effectiveData.gap.length * GAP_PTS}点</p>
          <p>Part 3 選択問題: 満点 {effectiveData.mc.length * MC_PTS}点</p>
          <p>Part 4 ディクテーション: 満点 {effectiveData.dict.length * DICT_PTS}点</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button onClick={() => { setScore(0); scoreRef.current = 0; setWrongMatch([]); setWrongGap([]); setWrongMc([]); setWrongDict([]); setPhase('intro') }}>もう一度</Button>
        <Button variant="secondary" onClick={() => navigate('/')}>ホームへ</Button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Part 1: Vocabulary Matching
// ══════════════════════════════════════════════════════════════
function Part1Matching({ items, onComplete }: { items: MatchItem[]; onComplete: (pts: number, wrongWords: string[]) => void }) {
  const [wordOrder] = useState(() => shuffled(items))
  const [defOrder]  = useState(() => shuffled(items))
  const [matched, setMatched]       = useState<Set<string>>(new Set())
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedDef,  setSelectedDef]  = useState<string | null>(null)
  const [wrongPair, setWrongPair]       = useState<{ word: string; def: string } | null>(null)
  const [pts, setPts] = useState(0)

  const tryMatch = (word: string, def: string) => {
    const defItem = items.find(i => i.word === word)
    if (defItem && defItem.def === def) {
      const next = new Set(matched)
      next.add(word)
      setMatched(next)
      setPts(p => p + MATCH_PTS)
      setSelectedWord(null)
      setSelectedDef(null)
    } else {
      setWrongPair({ word, def })
      setPts(p => p - 1)
    }
  }

  useEffect(() => {
    if (!wrongPair) return
    const id = window.setTimeout(() => {
      setWrongPair(null)
      setSelectedWord(null)
      setSelectedDef(null)
    }, 500)
    return () => clearTimeout(id)
  }, [wrongPair])

  const handleWord = (word: string) => {
    if (matched.has(word)) return
    const newWord = word
    if (selectedDef) {
      tryMatch(newWord, selectedDef)
    } else {
      setSelectedWord(newWord)
    }
  }

  const handleDef = (defWord: string, def: string) => {
    if (matched.has(defWord)) return
    if (selectedWord) {
      tryMatch(selectedWord, def)
    } else {
      setSelectedDef(def)
    }
  }

  const allMatched = matched.size === items.length

  const handleComplete = () => {
    const wrongWords = items.filter(item => !matched.has(item.word)).map(item => item.word)
    onComplete(pts, wrongWords)
  }

  return (
    <div className="py-4">
      <PartHeader part={1} title="Vocabulary Matching" desc="単語をタップ→定義をタップして対応させよう" />
      <div className="mb-4 text-right text-sm text-slate-500">{matched.size} / {items.length} マッチ完了</div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="space-y-2">
          {wordOrder.map(item => {
            const isMatched  = matched.has(item.word)
            const isSelected = selectedWord === item.word
            const isWrong    = wrongPair?.word === item.word
            return (
              <button
                key={item.word}
                onClick={() => handleWord(item.word)}
                disabled={isMatched}
                className={`w-full py-3 px-3 rounded-xl text-sm font-bold transition-all text-center
                  ${isMatched  ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                    isWrong    ? 'bg-red-100 text-red-700 border-2 border-red-400' :
                    isSelected ? 'bg-blue-600 text-white border-2 border-blue-600' :
                                 'bg-white text-slate-800 border-2 border-slate-200 active:scale-95'}`}
              >
                {item.word}
              </button>
            )
          })}
        </div>

        <div className="space-y-2">
          {defOrder.map((item, idx) => {
            const isMatched  = matched.has(item.word)
            const isSelected = selectedDef === item.def
            const isWrong    = wrongPair?.def === item.def
            return (
              <button
                key={item.word}
                onClick={() => handleDef(item.word, item.def)}
                disabled={isMatched}
                className={`w-full py-3 px-3 rounded-xl text-xs transition-all text-left
                  ${isMatched  ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                    isWrong    ? 'bg-red-100 text-red-700 border-2 border-red-400' :
                    isSelected ? 'bg-blue-600 text-white border-2 border-blue-600' :
                                 'bg-white text-slate-700 border-2 border-slate-200 active:scale-95'}`}
              >
                <span className="font-bold mr-1">{idx + 1}.</span>{item.def}
              </button>
            )
          })}
        </div>
      </div>

      <div className="text-center">
        {allMatched && <p className="text-green-600 font-bold mb-4">全問マッチ完了！🎉</p>}
        <Button onClick={handleComplete} className="w-full max-w-xs">Part 2 へ</Button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Part 2: Sentence Gap Fill
// ══════════════════════════════════════════════════════════════
function Part2GapFill({ items, bank, onComplete }: { items: GapItem[]; bank: string[]; onComplete: (pts: number, wrongAnswers: string[]) => void }) {
  const { speak } = useAudio()
  const [filled, setFilled]         = useState<(string | null)[]>(Array(items.length).fill(null))
  const [results, setResults]       = useState<(boolean | null)[]>(Array(items.length).fill(null))
  const [selectedBlank, setSelectedBlank] = useState<number | null>(null)
  const [usedWords, setUsedWords]   = useState<Set<string>>(new Set())
  const [wrongBlank, setWrongBlank] = useState<number | null>(null)
  const [pts, setPts] = useState(0)

  const selectBlank = (i: number) => {
    if (results[i] === true) return
    setSelectedBlank(i)
  }

  const pickWord = (word: string) => {
    if (usedWords.has(word)) return
    if (selectedBlank === null) return
    const item = items[selectedBlank]
    const correct = word.toLowerCase() === item!.answer.toLowerCase()
    const newFilled  = [...filled];  newFilled[selectedBlank]  = word
    const newResults = [...results]; newResults[selectedBlank] = correct
    setFilled(newFilled)
    setResults(newResults)
    if (correct) {
      setUsedWords(prev => new Set([...prev, word]))
      setPts(p => p + GAP_PTS)
    } else {
      setPts(p => p - 1)
      setWrongBlank(selectedBlank)
    }
    setSelectedBlank(null)
  }

  useEffect(() => {
    if (wrongBlank === null) return
    const blank = wrongBlank
    const id = window.setTimeout(() => {
      setFilled(prev => { const next = [...prev]; next[blank] = null; return next })
      setResults(prev => { const next = [...prev]; next[blank] = null; return next })
      setWrongBlank(null)
    }, 600)
    return () => clearTimeout(id)
  }, [wrongBlank])

  const handleComplete = () => {
    const wrongAnswers = items
      .filter((_, i) => results[i] !== true)
      .map(item => item.answer)
    onComplete(pts, wrongAnswers)
  }

  return (
    <div className="py-4">
      <PartHeader part={2} title="Sentence Gap Fill" desc="空欄をタップ→下の単語を選んで埋めよう" />

      <div className="bg-slate-50 rounded-xl p-3 mb-4">
        <p className="text-xs text-slate-400 mb-2 font-medium">単語バンク</p>
        <div className="flex flex-wrap gap-2">
          {bank.map(word => (
            <button
              key={word}
              onClick={() => pickWord(word)}
              disabled={usedWords.has(word)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${usedWords.has(word)
                  ? 'bg-slate-200 text-slate-400 line-through'
                  : 'bg-white border-2 border-slate-200 text-slate-700 active:scale-95 hover:border-blue-400'}`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item, i) => {
          const parts = item.sentence.split(new RegExp(`\\b${item.answer}\\b`, 'i'))
          const isCorrect = results[i] === true
          const isWrong   = results[i] === false
          const isActive  = selectedBlank === i
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-blue-600 mt-1">Q{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {parts[0]}
                    <button
                      onClick={() => selectBlank(i)}
                      className={`inline-flex items-center justify-center min-w-[80px] px-2 py-0.5 mx-1 rounded border-2 font-bold text-sm transition-all
                        ${isCorrect ? 'border-green-400 bg-green-50 text-green-700' :
                          isWrong   ? 'border-red-400 bg-red-50 text-red-600' :
                          isActive  ? 'border-blue-500 bg-blue-50 text-blue-700' :
                                      'border-slate-300 bg-slate-50 text-slate-500'}`}
                    >
                      {filled[i] ?? '＿＿＿'}
                    </button>
                    {parts[1]}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => speak(item.sentence)}
                      className="text-blue-400 hover:text-blue-600 text-sm"
                      aria-label="発音を聴く"
                    >🔊</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <Button onClick={handleComplete} className="w-full max-w-xs">Part 3 へ</Button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Part 3: Multiple Choice
// ══════════════════════════════════════════════════════════════
function Part3MultipleChoice({ items, onComplete }: { items: MCItem[]; onComplete: (pts: number, wrongWords: string[]) => void }) {
  const { speak } = useAudio()
  const [answers, setAnswers] = useState<(number | null)[]>(Array(items.length).fill(null))
  const [pts, setPts] = useState(0)

  const answeredCount = answers.filter(a => a !== null).length

  const pick = (qi: number, ji: number) => {
    if (answers[qi] !== null) return
    const correct = ji === items[qi]!.answer
    const next = [...answers]; next[qi] = ji
    setAnswers(next)
    setPts(p => p + (correct ? MC_PTS : -1))
  }

  const allDone = answeredCount === items.length

  const handleComplete = () => {
    const wrongWords = items
      .filter((item, qi) => answers[qi] !== item.answer)
      .map(item => item.word)
    onComplete(pts, wrongWords)
  }

  return (
    <div className="py-4">
      <PartHeader part={3} title="Multiple Choice" desc="単語の意味として最も適切なものを選ぼう" />

      <div className="space-y-4 mb-6">
        {items.map((item, qi) => (
          <div key={qi} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-purple-600">Q{qi + 1}</span>
              <p className="text-sm font-bold text-slate-800 flex-1">{item.q}</p>
              <button onClick={() => speak(item.word)} className="text-blue-400 text-sm" aria-label="発音を聴く">🔊</button>
            </div>
            <div className="space-y-2">
              {item.opts.map((opt, ji) => {
                const answered = answers[qi] !== null
                const isSelected = answers[qi] === ji
                const isCorrect  = ji === item.answer
                let cls = 'bg-slate-50 border-slate-200 text-slate-700'
                if (answered) {
                  if (isCorrect)        cls = 'bg-green-500 border-green-500 text-white'
                  else if (isSelected)  cls = 'bg-red-500 border-red-500 text-white'
                  else                  cls = 'bg-slate-50 border-slate-100 text-slate-300'
                }
                return (
                  <button
                    key={ji}
                    onClick={() => pick(qi, ji)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${cls}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {allDone && (
        <div className="text-center">
          <Button onClick={handleComplete} className="w-full max-w-xs">Part 4 へ</Button>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Part 4: Dictation
// ══════════════════════════════════════════════════════════════
function Part4Dictation({ items, onComplete }: { items: DictItem[]; onComplete: (pts: number, wrongWords: string[]) => void }) {
  const { speak } = useAudio()
  const [inputs,  setInputs]  = useState<string[]>(Array(items.length).fill(''))
  const [done,    setDone]    = useState<(boolean | null)[]>(Array(items.length).fill(null))
  const [revealed, setRevealed] = useState<boolean[]>(Array(items.length).fill(false))
  const [pts, setPts] = useState(0)

  const submit = (i: number) => {
    if (done[i] !== null) return
    const v = inputs[i]!.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '')
    const a = items[i]!.text.toLowerCase().replace(/[^a-z0-9 ]/g, '')
    if (!v) return
    const aTok = a.split(/\s+/).filter(Boolean)
    const vTok = v.split(/\s+/).filter(Boolean)
    const hit = aTok.filter(t => vTok.includes(t)).length
    const ratio = hit / Math.max(1, aTok.length)

    const newDone = [...done]
    newDone[i] = ratio >= 0.5
    setDone(newDone)

    if (ratio >= 0.9)      setPts(p => p + DICT_PTS)
    else if (ratio >= 0.5) setPts(p => p + 1)
    else                   setPts(p => p - 1)
  }

  const reveal = (i: number) => {
    const newR = [...revealed]; newR[i] = true
    setRevealed(newR)
    if (done[i] === null) {
      const newDone = [...done]; newDone[i] = false
      setDone(newDone)
      setPts(p => p - 1)
    }
  }

  const allDone = done.every(d => d !== null)

  const handleComplete = () => {
    const wrongWords = items
      .filter((_, i) => done[i] === false)
      .map(item => item.word)
    onComplete(pts, wrongWords)
  }

  return (
    <div className="py-4">
      <PartHeader part={4} title="Dictation" desc="音声を聴いて文を書き取ろう" />

      <div className="space-y-4 mb-6">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-orange-600">Q{i + 1}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => speak(item.text, 1.0)}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  🔊 再生
                </button>
                <button
                  onClick={() => speak(item.text, 0.7)}
                  className="px-3 py-1.5 bg-blue-400 text-white rounded-lg text-xs font-semibold"
                >
                  🐢 ゆっくり
                </button>
                <button
                  onClick={() => reveal(i)}
                  className="px-3 py-1.5 bg-slate-400 text-white rounded-lg text-xs font-semibold"
                >
                  👁 答え
                </button>
              </div>
            </div>
            <input
              type="text"
              value={inputs[i]}
              onChange={e => { const next = [...inputs]; next[i] = e.target.value; setInputs(next) }}
              onKeyDown={e => { if (e.key === 'Enter') submit(i) }}
              placeholder="聴こえた文を書き取ろう..."
              disabled={done[i] !== null}
              className={`w-full px-3 py-2 rounded-lg border-2 text-sm mb-2 transition-colors
                ${done[i] === true  ? 'border-green-400 bg-green-50' :
                  done[i] === false ? 'border-red-400 bg-red-50' :
                                      'border-slate-200 bg-white focus:border-blue-400 outline-none'}`}
            />
            {revealed[i] && (
              <p className="text-xs text-slate-500 mb-2">答え: <span className="font-semibold text-slate-700">{item.text}</span></p>
            )}
            {done[i] === null && (
              <button
                onClick={() => submit(i)}
                className="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-semibold"
              >
                採点
              </button>
            )}
            {done[i] !== null && !revealed[i] && (
              <p className="text-xs text-slate-500">答え: <span className="font-semibold text-slate-700">{item.text}</span></p>
            )}
          </div>
        ))}
      </div>

      {allDone && (
        <div className="text-center">
          <Button onClick={handleComplete} className="w-full max-w-xs">結果を見る</Button>
        </div>
      )}
    </div>
  )
}

// ── Shared header ────────────────────────────────────────────
function PartHeader({ part, title, desc }: { part: number; title: string; desc: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Part {part}</p>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  )
}
```

- [ ] **Step 4: テストがパスすることを確認**

```
npx vitest run src/pages/PredictedQuizScreen.test.tsx --reporter=verbose 2>&1 | tail -30
```
Expected: 全23件 PASS（既存20件 + 新規3件）

- [ ] **Step 5: コミット**

```
git add src/pages/PredictedQuizScreen.tsx src/pages/PredictedQuizScreen.test.tsx
git commit -m "feat: PredictedQuizScreen に間違いアイテム追跡・保存・フィルタUI を追加"
```

---

## Task 6: 全テスト実行と最終確認

- [ ] **Step 1: 全テストを実行**

```
npx vitest run
```
Expected: 全件 PASS。失敗があれば該当タスクに戻って修正。

- [ ] **Step 2: 設計書の wrongItems 型を修正**

`docs/superpowers/specs/2026-05-16-wrong-only-filter-design.md` の `wrongItems` 定義を更新:

```markdown
wrongItems: {
  match: string[];   // 間違えたword文字列
  gap: string[];     // 間違えたanswer文字列（実装時にindexから変更）
  mc: string[];      // 間違えたword文字列
  dict: string[];    // 間違えたword文字列
};
```

- [ ] **Step 3: コミット**

```
git add docs/superpowers/specs/2026-05-16-wrong-only-filter-design.md
git commit -m "docs: PredictedQuizScore.wrongItems 型をstring[]に修正"
```
