import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProgress } from './useProgress'

describe('useProgress', () => {
  it('TC-U-030: saveQuizResult で localStorage に保存される', () => {
    const { result } = renderHook(() => useProgress('u1'))
    act(() => result.current.saveQuizResult({
      weekId: 'week05', score: 8, total: 10, percentage: 80, mode: 'en_to_ja', durationSec: 120,
    }))
    const saved = result.current.getQuizScores()
    expect(saved).toHaveLength(1)
    expect(saved[0]!.percentage).toBe(80)
  })

  it('TC-U-031: getWeekBestScore で最高スコアが返る', () => {
    const { result } = renderHook(() => useProgress('u1'))
    act(() => {
      result.current.saveQuizResult({ weekId: 'week05', score: 6, total: 10, percentage: 60, mode: 'en_to_ja', durationSec: 100 })
      result.current.saveQuizResult({ weekId: 'week05', score: 9, total: 10, percentage: 90, mode: 'en_to_ja', durationSec: 110 })
      result.current.saveQuizResult({ weekId: 'week05', score: 7, total: 10, percentage: 70, mode: 'en_to_ja', durationSec: 120 })
    })
    expect(result.current.getWeekBestScore('week05')).toBe(90)
  })

  it('TC-U-032: 未学習 Week は null を返す', () => {
    const { result } = renderHook(() => useProgress('u1'))
    expect(result.current.getWeekBestScore('week99')).toBeNull()
  })

  it('TC-U-033: 別ユーザーのスコアは混在しない', () => {
    const { result: a } = renderHook(() => useProgress('userA'))
    act(() => a.current.saveQuizResult({ weekId: 'week05', score: 9, total: 10, percentage: 90, mode: 'en_to_ja', durationSec: 100 }))
    const { result: b } = renderHook(() => useProgress('userB'))
    expect(b.current.getQuizScores()).toEqual([])
    expect(b.current.getWeekBestScore('week05')).toBeNull()
  })
})

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

  it('TC-U-035b: getLastQuizWrongWordIds — モードをまたいで混在しない', () => {
    const { result } = renderHook(() => useProgress('u1'))
    act(() => {
      result.current.saveQuizResult({
        weekId: 'week05', score: 1, total: 2, percentage: 50, mode: 'en_to_ja', durationSec: 30,
        answers: [{ wordId: 'w2', correct: false }, { wordId: 'w1', correct: true }],
      })
      result.current.saveQuizResult({
        weekId: 'week05', score: 1, total: 2, percentage: 50, mode: 'ja_to_en', durationSec: 30,
        answers: [{ wordId: 'w3', correct: false }, { wordId: 'w1', correct: true }],
      })
    })
    expect(result.current.getLastQuizWrongWordIds('week05', 'en_to_ja')).toEqual(['w2'])
    expect(result.current.getLastQuizWrongWordIds('week05', 'ja_to_en')).toEqual(['w3'])
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

  it('TC-U-037b: getLastFlashcardWrongWordIds — スコアなしは空配列', () => {
    const { result } = renderHook(() => useProgress('u1'))
    expect(result.current.getLastFlashcardWrongWordIds('week99')).toEqual([])
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
