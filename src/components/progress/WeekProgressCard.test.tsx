import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeekProgressCard } from './WeekProgressCard'

describe('WeekProgressCard', () => {
  it('TC-C-WPC-01: bestScore=null で "未受験" を表示し ProgressBar を出さない', () => {
    const { container } = render(
      <WeekProgressCard weekNumber={5} label="Week 5" bestScore={null} flashcardCount={0} lastStudied={null} />
    )
    expect(screen.getByText('未受験')).toBeInTheDocument()
    expect(container.querySelector('.h-full')).toBeNull()
  })

  it('TC-C-WPC-02: bestScore=85 で緑系テキスト + ProgressBar 表示', () => {
    const { container } = render(
      <WeekProgressCard weekNumber={5} label="Week 5" bestScore={85} flashcardCount={3} lastStudied={null} />
    )
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('85').className).toMatch(/text-green-500/)
    expect(container.querySelector('.h-full')).not.toBeNull()
  })

  it('TC-C-WPC-03: bestScore=70 で青系テキスト', () => {
    render(
      <WeekProgressCard weekNumber={5} label="Week 5" bestScore={70} flashcardCount={1} lastStudied={null} />
    )
    expect(screen.getByText('70').className).toMatch(/text-blue-500/)
  })

  it('TC-C-WPC-04: bestScore=40 で slate 系テキスト', () => {
    render(
      <WeekProgressCard weekNumber={5} label="Week 5" bestScore={40} flashcardCount={0} lastStudied={null} />
    )
    expect(screen.getByText('40').className).toMatch(/text-slate-500/)
  })

  it('TC-C-WPC-05: lastStudied がある場合は "最終: <日付>" を表示', () => {
    render(
      <WeekProgressCard weekNumber={5} label="Week 5" bestScore={80} flashcardCount={2} lastStudied="2026-04-27T00:00:00.000Z" />
    )
    expect(screen.getByText(/最終:/)).toBeInTheDocument()
  })

  it('TC-C-WPC-06: フラッシュカード回数が表示される', () => {
    render(
      <WeekProgressCard weekNumber={5} label="Week 5" bestScore={null} flashcardCount={7} lastStudied={null} />
    )
    expect(screen.getByText('7回')).toBeInTheDocument()
  })
})
