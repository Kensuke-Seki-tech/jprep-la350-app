import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuizQuestion } from './QuizQuestion'
import { mockWords } from '@/test/fixtures'

describe('QuizQuestion', () => {
  it('TC-C-QQ-01: en_to_ja モードで英単語を出題、englishDef を sub に表示', () => {
    render(<QuizQuestion word={mockWords[0]!} mode="en_to_ja" currentIndex={0} total={5} />)
    expect(screen.getByText('sapling')).toBeInTheDocument()
    expect(screen.getByText('a young tree')).toBeInTheDocument()
  })

  it('TC-C-QQ-02: ja_to_en モードで日本語を出題、英語定義は表示しない', () => {
    render(<QuizQuestion word={mockWords[0]!} mode="ja_to_en" currentIndex={0} total={5} />)
    expect(screen.getByText('苗木')).toBeInTheDocument()
    expect(screen.queryByText('a young tree')).not.toBeInTheDocument()
  })

  it('TC-C-QQ-03: 進捗 "currentIndex+1 / total" を表示する', () => {
    render(<QuizQuestion word={mockWords[0]!} mode="en_to_ja" currentIndex={2} total={10} />)
    expect(screen.getByText('3 / 10')).toBeInTheDocument()
  })
})
