import { describe, it, expect, vi } from 'vitest'
import { getItem, setItem, removeItem, userKey } from './storage'

describe('storage', () => {
  it('TC-U-001: setItem 後に getItem で値を取得できる', () => {
    setItem('foo', { a: 1, b: 'two' })
    expect(getItem<{ a: number; b: string }>('foo')).toEqual({ a: 1, b: 'two' })
  })

  it('TC-U-002: 存在しないキーは null を返す', () => {
    expect(getItem('nonexistent')).toBeNull()
  })

  it('TC-U-003: JSON パース失敗時は null を返す（例外なし）', () => {
    localStorage.setItem('broken', '{not valid json')
    expect(getItem('broken')).toBeNull()
  })

  it('TC-U-004: localStorage 例外時は console.error のみ（throw なし）', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    expect(() => setItem('x', { huge: 'data' })).not.toThrow()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
    setSpy.mockRestore()
  })

  it('removeItem は例外を投げない', () => {
    setItem('foo', 1)
    expect(() => removeItem('foo')).not.toThrow()
    expect(getItem('foo')).toBeNull()
  })

  it('userKey はプレフィックス付きキーを返す', () => {
    expect(userKey('u1', 'quiz_scores')).toBe('user_u1_quiz_scores')
  })
})
