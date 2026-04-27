import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WordListItem } from './WordListItem'
import type { Word } from '@/types/word'

const baseWord: Word = {
  id: 'w-test',
  english: 'sapling',
  japanese: '苗木',
  englishDef: 'a young tree',
  partOfSpeech: 'n',
  ipa: '/ˈsæplɪŋ/',
  katakana: 'サプリング',
  emoji: '🌱',
  exampleEn: 'We planted a sapling.',
  exampleJa: '苗木を植えた。',
}

describe('WordListItem', () => {
  it('TC-C-WLI-01: 初期状態では英単語ヘッダーのみ、details は閉じている', () => {
    render(<WordListItem word={baseWord} index={0} />)
    expect(screen.getByText('sapling')).toBeInTheDocument()
    expect(screen.getByText('苗木')).toBeInTheDocument()
    // englishDef は detail に含まれるので、閉じている時は非表示
    expect(screen.queryByText('a young tree')).not.toBeInTheDocument()
  })

  it('TC-C-WLI-02: 行クリックで展開し englishDef と例文が表示される', async () => {
    const user = userEvent.setup()
    render(<WordListItem word={baseWord} index={0} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByText('a young tree')).toBeInTheDocument()
    expect(screen.getByText('We planted a sapling.')).toBeInTheDocument()
  })

  it('TC-C-WLI-03: index は 1 始まり (index=2 → "3" 表示)', () => {
    render(<WordListItem word={baseWord} index={2} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('TC-C-WLI-04: 品詞ラベル (partOfSpeech=n → "noun") を表示', () => {
    render(<WordListItem word={baseWord} index={0} />)
    expect(screen.getByText('noun')).toBeInTheDocument()
  })

  it('TC-C-WLI-05: etymology があると展開時に Etymology セクションを表示', async () => {
    const user = userEvent.setup()
    const wordWithEtym: Word = {
      ...baseWord,
      etymology: {
        morphemes: [
          { part: 'sap', meaning: 'tree juice', type: 'root' },
          { part: '-ling', meaning: 'small one', type: 'suffix' },
        ],
      },
    }
    render(<WordListItem word={wordWithEtym} index={0} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByText('Etymology')).toBeInTheDocument()
    expect(screen.getByText('sap (tree juice)')).toBeInTheDocument()
  })

  it('TC-C-WLI-06: 未知 partOfSpeech は "etc" にフォールバック', () => {
    const otherWord: Word = { ...baseWord, partOfSpeech: 'unknown' as Word['partOfSpeech'] }
    render(<WordListItem word={otherWord} index={0} />)
    expect(screen.getByText('etc')).toBeInTheDocument()
  })
})
