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
