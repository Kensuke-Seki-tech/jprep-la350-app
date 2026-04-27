import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { useUserStore } from '@/hooks/useUserStore'
import { useProgress } from '@/hooks/useProgress'

beforeEach(async () => {
  await act(async () => {
    useUserStore.setState({ users: [], currentUserId: null })
  })
  localStorage.clear()
})

describe('TC-NF-005 localStorage 使用量', () => {
  it('5 user × 15 week × 4 quiz type 書き込みで 1MB 未満', async () => {
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        useUserStore.getState().addUser(`User${i}`, '#000000')
      }
    })
    const users = useUserStore.getState().users
    expect(users).toHaveLength(5)

    for (const u of users) {
      const { result } = renderHook(() => useProgress(u.userId))
      await act(async () => {
        for (let w = 1; w <= 15; w++) {
          const weekId = `week${String(w).padStart(2, '0')}`
          for (const mode of ['en_to_ja', 'ja_to_en'] as const) {
            for (let rep = 0; rep < 2; rep++) {
              result.current.saveQuizResult({
                weekId,
                score: 18,
                total: 20,
                percentage: 90,
                mode,
                durationSec: 240,
              })
            }
          }
        }
      })
    }

    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k === null) continue
      const v = localStorage.getItem(k) ?? ''
      total += new Blob([k + v]).size
    }

    expect(total).toBeLessThan(1_048_576)
  })
})
