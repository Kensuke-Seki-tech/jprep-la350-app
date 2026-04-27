import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('Vitest が動作する', () => {
    expect(1 + 1).toBe(2)
  })

  it('jsdom 環境で document が定義されている', () => {
    expect(document).toBeDefined()
    expect(document.body).toBeDefined()
  })

  it('localStorage が利用できる', () => {
    localStorage.setItem('foo', 'bar')
    expect(localStorage.getItem('foo')).toBe('bar')
  })
})
