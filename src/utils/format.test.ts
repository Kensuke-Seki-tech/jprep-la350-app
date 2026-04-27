import { describe, it, expect } from 'vitest'
import { formatDate, formatDuration, formatPercent, getInitial } from './format'

describe('format.formatDate', () => {
  it('TC-U-FORMAT-01: ISO 文字列を ja-JP のロケール表示に変換する', () => {
    const result = formatDate('2026-04-27T00:00:00.000Z')
    // ja-JP の short month は "4月" / 年 / 日
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/4月/)
  })
})

describe('format.formatDuration', () => {
  it('TC-U-FORMAT-10: 0 秒を "0分00秒" にフォーマットする', () => {
    expect(formatDuration(0)).toBe('0分00秒')
  })

  it('TC-U-FORMAT-11: 65 秒を "1分05秒" にフォーマットする', () => {
    expect(formatDuration(65)).toBe('1分05秒')
  })

  it('TC-U-FORMAT-12: 130 秒を "2分10秒" にフォーマットする', () => {
    expect(formatDuration(130)).toBe('2分10秒')
  })

  it('TC-U-FORMAT-13: 秒部分が 1 桁のとき 0 埋めされる', () => {
    expect(formatDuration(61)).toBe('1分01秒')
  })
})

describe('format.formatPercent', () => {
  it('TC-U-FORMAT-20: total=0 のとき 0 を返す', () => {
    expect(formatPercent(0, 0)).toBe(0)
  })

  it('TC-U-FORMAT-21: 60 中 42 で 70 を返す', () => {
    expect(formatPercent(42, 60)).toBe(70)
  })

  it('TC-U-FORMAT-22: 端数は四捨五入される (1/3 → 33)', () => {
    expect(formatPercent(1, 3)).toBe(33)
  })

  it('TC-U-FORMAT-23: 全問正解で 100 を返す', () => {
    expect(formatPercent(20, 20)).toBe(100)
  })
})

describe('format.getInitial', () => {
  it('TC-U-FORMAT-30: 名前の頭文字を大文字で返す', () => {
    expect(getInitial('alice')).toBe('A')
  })

  it('TC-U-FORMAT-31: 既に大文字の場合もそのまま返す', () => {
    expect(getInitial('Bob')).toBe('B')
  })

  it('TC-U-FORMAT-32: 日本語名は先頭文字をそのまま返す', () => {
    expect(getInitial('太郎')).toBe('太')
  })
})
