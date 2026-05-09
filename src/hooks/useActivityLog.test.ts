import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockInsert, mockFrom } = vi.hoisted(() => {
  const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert })
  return { mockInsert, mockFrom }
})

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

vi.mock('@/hooks/useUserStore', () => ({
  useCurrentUser: vi.fn(),
}))

import { useCurrentUser } from '@/hooks/useUserStore'
import { useActivityLog } from './useActivityLog'
import type { UserProfile } from '@/types/user'

const mockUser: UserProfile = {
  userId: 'u1',
  displayName: 'Taro',
  avatarColor: '#3b82f6',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: '2026-01-01T00:00:00.000Z',
}

describe('useActivityLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ユーザーが未ログインの場合はINSERTしない', () => {
    vi.mocked(useCurrentUser).mockReturnValue(null)
    renderHook(() => useActivityLog('quiz', 'week08'))
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('ユーザーがいる場合にINSERTを1回呼ぶ', () => {
    vi.mocked(useCurrentUser).mockReturnValue(mockUser)
    renderHook(() => useActivityLog('quiz', 'week08'))
    expect(mockFrom).toHaveBeenCalledWith('activity_logs')
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockInsert).toHaveBeenCalledWith({
      user_name: 'Taro',
      mode: 'quiz',
      week_id: 'week08',
    })
  })

  it('week_id が null の場合もINSERTする（語源画面）', () => {
    vi.mocked(useCurrentUser).mockReturnValue(mockUser)
    renderHook(() => useActivityLog('etymology', null))
    expect(mockInsert).toHaveBeenCalledWith({
      user_name: 'Taro',
      mode: 'etymology',
      week_id: null,
    })
  })

  it('再レンダーで追加INSERTしない', () => {
    vi.mocked(useCurrentUser).mockReturnValue(mockUser)
    const { rerender } = renderHook(() => useActivityLog('flashcard', 'week07'))
    rerender()
    rerender()
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
