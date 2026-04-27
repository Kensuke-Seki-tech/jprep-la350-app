import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from './Header'
import { useWeekStore } from '@/hooks/useWeeks'
import { useUserStore } from '@/hooks/useUserStore'
import type { ReactNode } from 'react'

beforeEach(() => {
  act(() => {
    useWeekStore.setState({ currentWeekId: 'week05' })
    useUserStore.setState({
      users: [
        { userId: 'u1', displayName: 'Alice', avatarColor: '#FF6B6B', createdAt: '', lastLoginAt: '' },
        { userId: 'u2', displayName: 'Bob', avatarColor: '#4ECDC4', createdAt: '', lastLoginAt: '' },
      ],
      currentUserId: 'u1',
    })
  })
  localStorage.clear()
  vi.mocked(fetch).mockReset()
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
    weeks: [
      { weekId: 'week05', label: 'Week 5', status: 'available' },
      { weekId: 'week06', label: 'Week 6', status: 'available' },
      { weekId: 'week99', label: 'Week 99', status: 'planned' },
    ],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
})

const renderHeader = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const Wrap = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return render(<Header />, { wrapper: Wrap })
}

describe('Header', () => {
  it('TC-C-HD-01: LA350 ロゴと Week セレクター (available のみ) を表示', async () => {
    renderHeader()
    expect(screen.getByText('🇺🇸 LA350')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText('Weekを選択')).toBeInTheDocument())
    const select = screen.getByLabelText('Weekを選択') as HTMLSelectElement
    expect(select.options).toHaveLength(2)
    expect(Array.from(select.options).map(o => o.value)).toEqual(['week05', 'week06'])
  })

  it('TC-C-HD-02: Week セレクター変更で setCurrentWeekId が呼ばれる', async () => {
    renderHeader()
    await waitFor(() => screen.getByLabelText('Weekを選択'))
    const user = userEvent.setup()
    await user.selectOptions(screen.getByLabelText('Weekを選択'), 'week06')
    expect(useWeekStore.getState().currentWeekId).toBe('week06')
  })

  it('TC-C-HD-03: 現在ユーザーのアバターが表示される', () => {
    renderHeader()
    expect(screen.getByLabelText(/Alice/)).toBeInTheDocument()
  })

  it('TC-C-HD-04: アバタークリックでユーザー切替ドロップダウンが開く', async () => {
    renderHeader()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/Alice/))
    expect(screen.getByText('ユーザーを切替')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('TC-C-HD-05: ドロップダウンの "ユーザー選択に戻る" で clearCurrentUser', async () => {
    renderHeader()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/Alice/))
    await user.click(screen.getByRole('button', { name: /ユーザー選択に戻る/ }))
    expect(useUserStore.getState().currentUserId).toBeNull()
  })

  it('TC-C-HD-06: ドロップダウンで別ユーザークリックで selectUser', async () => {
    renderHeader()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(/Alice/))
    await user.click(screen.getByRole('button', { name: /Bob/ }))
    expect(useUserStore.getState().currentUserId).toBe('u2')
  })
})
