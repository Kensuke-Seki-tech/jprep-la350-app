import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import FlashcardScreen from './FlashcardScreen'
import { mockWords } from '@/test/fixtures'

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
    <MemoryRouter initialEntries={['/flashcard/week05']}>
      <Routes>
        <Route path="/flashcard/:weekId" element={<FlashcardScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FlashcardScreen - 3 モード', () => {
  it('TC-U-FLASHCARD-MODE-01: 初期モードは en_to_ja（英→日 が選択）', async () => {
    renderScreen()
    const button = await screen.findByRole('button', { name: /英 → 日/ })
    expect(button.className).toContain('blue-600')
  })

  it('TC-U-FLASHCARD-MODE-02: 「日 → 英」タップで mode=ja_to_en', async () => {
    const user = userEvent.setup()
    renderScreen()
    const jaToEn = await screen.findByRole('button', { name: /日 → 英/ })
    await user.click(jaToEn)
    expect(jaToEn.className).toContain('blue-600')
  })

  it('TC-U-FLASHCARD-MODE-03: 「英 → 英」タップで mode=en_to_en', async () => {
    const user = userEvent.setup()
    renderScreen()
    const enToEn = await screen.findByRole('button', { name: /英 → 英/ })
    await user.click(enToEn)
    expect(enToEn.className).toContain('blue-600')
  })

  it('TC-U-FLASHCARD-MODE-04: en_to_en でカード裏面が englishDef を表示', async () => {
    const user = userEvent.setup()
    renderScreen()
    await user.click(await screen.findByRole('button', { name: /英 → 英/ }))
    await user.click(screen.getByRole('button', { name: 'スタート' }))
    await user.click(await screen.findByRole('button', { name: 'sapling' }))
    expect(await screen.findByText('a young tree')).toBeInTheDocument()
  })
})
