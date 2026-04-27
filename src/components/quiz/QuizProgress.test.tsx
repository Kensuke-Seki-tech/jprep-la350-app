import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuizProgress } from './QuizProgress'

describe('QuizProgress', () => {
  it('TC-C-QP-01: 正解数と "currentIndex/total" を表示する', () => {
    render(<QuizProgress currentIndex={3} total={10} score={2} />)
    expect(screen.getByText('正解数: 2')).toBeInTheDocument()
    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('TC-C-QP-02: total=0 のとき進捗バーは 0% (style.width=0%)', () => {
    const { container } = render(<QuizProgress currentIndex={0} total={0} score={0} />)
    const fill = container.querySelector('.h-full') as HTMLDivElement
    expect(fill.style.width).toBe('0%')
  })

  it('TC-C-QP-03: 進捗率は currentIndex/total で四捨五入される (3/10 → 30%)', () => {
    const { container } = render(<QuizProgress currentIndex={3} total={10} score={3} />)
    const fill = container.querySelector('.h-full') as HTMLDivElement
    expect(fill.style.width).toBe('30%')
  })
})
