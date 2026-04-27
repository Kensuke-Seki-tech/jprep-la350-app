import { describe, it, expect, beforeEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useWeekStore } from '@/hooks/useWeeks'

beforeEach(() => {
  act(() => useWeekStore.setState({ currentWeekId: 'week05' }))
})

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>
  )

describe('BottomNav', () => {
  it('TC-C-BN-01: 6 タブ全て表示される', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: /Home/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Roots/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Cards/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Quiz/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Words/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Progress/ })).toBeInTheDocument()
  })

  it('TC-C-BN-02: 非 exact タブ (Cards) は currentWeekId をパスに付加', () => {
    renderAt('/')
    const cardsLink = screen.getByRole('link', { name: /Cards/ })
    expect(cardsLink.getAttribute('href')).toBe('/flashcard/week05')
  })

  it('TC-C-BN-03: exact タブ (Home) はルートパスのまま', () => {
    renderAt('/')
    const homeLink = screen.getByRole('link', { name: /Home/ })
    expect(homeLink.getAttribute('href')).toBe('/')
  })

  it('TC-C-BN-04: アクティブタブが青色クラス、非アクティブは slate-400', () => {
    renderAt('/quiz/week05')
    const quizLink = screen.getByRole('link', { name: /Quiz/ })
    expect(quizLink.className).toMatch(/text-blue-600/)
    const homeLink = screen.getByRole('link', { name: /Home/ })
    expect(homeLink.className).toMatch(/text-slate-400/)
  })

  it('TC-C-BN-05: currentWeekId 変更で href が追従する', () => {
    act(() => useWeekStore.setState({ currentWeekId: 'week06' }))
    renderAt('/')
    expect(screen.getByRole('link', { name: /Cards/ }).getAttribute('href')).toBe('/flashcard/week06')
  })
})
