import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import QuizScreen from './QuizScreen'
import { mockWords } from '@/test/fixtures'
import { setItem } from '@/utils/storage'

vi.mock('@/hooks/useWeeks', () => ({
  useWeeksConfig: () => ({
    data: [{ weekId: 'week05', weekNumber: 5, label: 'Week 5', status: 'available', dataUrl: '/data/week05.json', wordCount: 6 }],
  }),
}))
vi.mock('@/hooks/useWordData', () => ({
  useWordData: () => ({ data: mockWords }),
}))
vi.mock('@/hooks/useUserStore', () => ({
  useCurrentUser: () => ({ userId: 'u1', displayName: 'Test', avatarColor: '#000', createdAt: '', lastLoginAt: '' }),
  useUserStore: () => ({ users: [], currentUserId: 'u1', addUser: vi.fn(), selectUser: vi.fn(), removeUser: vi.fn(), clearCurrentUser: vi.fn() }),
}))

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/quiz/week05']}>
      <Routes>
        <Route path="/quiz/:weekId" element={<QuizScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('QuizScreen — 出題範囲フィルタ', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  it('TC-U-QUIZ-FILTER-01: 出題範囲セクションが表示される', async () => {
    renderScreen()
    expect(await screen.findByText('出題範囲')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /全問/ })).toBeInTheDocument()
  })

  it('TC-U-QUIZ-FILTER-02: 前回データなしの時、前回間違えた問題ボタンがdisabled', async () => {
    renderScreen()
    await screen.findByText('出題範囲')
    const wrongBtn = screen.getByRole('button', { name: /前回間違えた問題/ })
    expect(wrongBtn).toBeDisabled()
    expect(wrongBtn).toHaveTextContent('前回データなし')
  })

  it('TC-U-QUIZ-FILTER-03: 前回データがある時、前回間違えた問題ボタンが有効で語数を表示', async () => {
    setItem('user_u1_quiz_scores', [{
      scoreId: 's1', weekId: 'week05', score: 5, total: 6, percentage: 83,
      mode: 'en_to_ja', timestamp: new Date().toISOString(), durationSec: 60,
      answers: [
        { wordId: 'w1', correct: true },
        { wordId: 'w2', correct: false },
        { wordId: 'w3', correct: true },
        { wordId: 'w4', correct: true },
        { wordId: 'w5', correct: true },
        { wordId: 'w6', correct: true },
      ],
    }])
    renderScreen()
    await screen.findByText('出題範囲')
    const wrongBtn = screen.getByRole('button', { name: /前回間違えた問題/ })
    expect(wrongBtn).not.toBeDisabled()
    expect(wrongBtn).toHaveTextContent('1語')
  })
})
