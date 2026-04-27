import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuizSession } from './useQuizSession'
import { mockWords } from '@/test/fixtures'

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('useQuizSession', () => {
  it('TC-U-020: 初期状態で currentIndex=0', () => {
    const { result } = renderHook(() => useQuizSession(mockWords, 'en_to_ja'))
    expect(result.current.currentIndex).toBe(0)
  })

  it('TC-U-021: 正解選択で score=1', () => {
    const { result } = renderHook(() => useQuizSession(mockWords, 'en_to_ja'))
    const correct = result.current.currentWord!.japanese
    act(() => result.current.answerQuestion(correct))
    expect(result.current.score).toBe(1)
  })

  it('TC-U-022: 不正解選択で score=0', () => {
    const { result } = renderHook(() => useQuizSession(mockWords, 'en_to_ja'))
    act(() => result.current.answerQuestion('絶対に存在しない答え'))
    expect(result.current.score).toBe(0)
  })

  it('TC-U-023: nextQuestion で currentIndex+1', () => {
    const { result } = renderHook(() => useQuizSession(mockWords, 'en_to_ja'))
    act(() => result.current.answerQuestion('something'))
    act(() => result.current.nextQuestion())
    expect(result.current.currentIndex).toBe(1)
  })

  it('TC-U-024: 最終問題で nextQuestion を呼ぶと isFinished=true', () => {
    const { result } = renderHook(() => useQuizSession(mockWords, 'en_to_ja'))
    for (let i = 0; i < mockWords.length - 1; i++) {
      act(() => result.current.answerQuestion('x'))
      act(() => result.current.nextQuestion())
    }
    act(() => result.current.answerQuestion('x'))
    act(() => result.current.nextQuestion())
    expect(result.current.isFinished).toBe(true)
  })

  it('TC-U-025: percentage = score/total*100', () => {
    const { result } = renderHook(() => useQuizSession(mockWords, 'en_to_ja'))
    // 6 問中 3 問正解 → 50%
    for (let i = 0; i < 3; i++) {
      const correct = result.current.currentWord!.japanese
      act(() => result.current.answerQuestion(correct))
      act(() => result.current.nextQuestion())
    }
    for (let i = 0; i < 3; i++) {
      act(() => result.current.answerQuestion('wrong'))
      act(() => result.current.nextQuestion())
    }
    expect(result.current.percentage).toBe(50)
  })

  it('TC-U-026: reset で全状態が初期値に', () => {
    const { result } = renderHook(() => useQuizSession(mockWords, 'en_to_ja'))
    act(() => result.current.answerQuestion('x'))
    act(() => result.current.nextQuestion())
    act(() => result.current.reset())
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.score).toBe(0)
    expect(result.current.isFinished).toBe(false)
  })
})
