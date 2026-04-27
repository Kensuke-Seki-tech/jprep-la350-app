import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { UserSelectScreen } from '@/components/auth/UserSelectScreen'
import { FlashcardCard } from '@/components/flashcard/FlashcardCard'
import { QuizChoices } from '@/components/quiz/QuizChoices'
import PredictedQuizScreen from '@/pages/PredictedQuizScreen'
import { mockWords, mockQuizData } from '@/test/fixtures'

expect.extend(toHaveNoViolations)

vi.mock('@/hooks/useWeeks', () => ({
  useWeeksConfig: () => ({
    data: [{ weekId: 'week05', weekNumber: 5, label: 'Week 5', status: 'available', dataUrl: '/data/week05.json', wordCount: 30 }],
  }),
}))

describe('TC-NF-003 axe アクセシビリティ violations 0', () => {
  it('UserSelectScreen', async () => {
    const { container } = render(<UserSelectScreen />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('FlashcardCard', async () => {
    const { container } = render(
      <FlashcardCard word={mockWords[0]!} index={0} total={6} mode="en_to_ja" onResult={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('QuizChoices', async () => {
    const choices = ['苗木', '廃止する', 'けだるい', 'しなやかな']
    const { container } = render(
      <QuizChoices choices={choices} correctAnswer="苗木" selected={null} onAnswer={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('PredictedQuizScreen (intro phase)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockQuizData), { status: 200 }),
    )
    const { container, findByText } = render(
      <MemoryRouter initialEntries={['/predicted-quiz/week05']}>
        <Routes>
          <Route path="/predicted-quiz/:weekId" element={<PredictedQuizScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await findByText(/予想問題/)
    expect(await axe(container)).toHaveNoViolations()
  })
})
