import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateChoices, shuffleArray } from './quiz'
import { mockWords } from '@/test/fixtures'

describe('generateChoices', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('TC-U-010: 50語から4択を生成する（正解1+ダミー3）', () => {
    const choices = generateChoices(mockWords[0]!, mockWords, 'en_to_ja')
    expect(choices).toHaveLength(4)
  })

  it('TC-U-011: 生成した選択肢に重複がない', () => {
    const choices = generateChoices(mockWords[0]!, mockWords, 'en_to_ja')
    const set = new Set(choices)
    expect(set.size).toBe(choices.length)
  })

  it('TC-U-012: 正解が必ず選択肢に含まれている', () => {
    const correct = mockWords[0]!
    const choices = generateChoices(correct, mockWords, 'en_to_ja')
    expect(choices).toContain(correct.japanese)
  })

  it('TC-U-013: ja_to_en モードで英語選択肢が生成される', () => {
    const correct = mockWords[0]!
    const choices = generateChoices(correct, mockWords, 'ja_to_en')
    expect(choices).toContain(correct.english)
    // 全候補は mockWords の english いずれか
    const englishSet = new Set(mockWords.map(w => w.english))
    choices.forEach(c => expect(englishSet.has(c)).toBe(true))
  })

  it('TC-U-014: 単語数が4未満の場合でも動作する', () => {
    const small = mockWords.slice(0, 2) // 2 words
    const choices = generateChoices(small[0]!, small, 'en_to_ja')
    expect(choices.length).toBeLessThanOrEqual(4)
    expect(choices).toContain(small[0]!.japanese)
  })
})

describe('shuffleArray', () => {
  it('元配列を変更せず新しい配列を返す', () => {
    const arr = [1, 2, 3]
    const result = shuffleArray(arr)
    expect(result).not.toBe(arr)
    expect(result.sort()).toEqual([1, 2, 3])
  })
})
