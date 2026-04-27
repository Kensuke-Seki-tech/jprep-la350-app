import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from './MainLayout'
import { useWeekStore } from '@/hooks/useWeeks'
import { useUserStore } from '@/hooks/useUserStore'

beforeEach(() => {
  act(() => {
    useWeekStore.setState({ currentWeekId: 'week05' })
    useUserStore.setState({
      users: [{ userId: 'u1', displayName: 'Alice', avatarColor: '#FF6B6B', createdAt: '', lastLoginAt: '' }],
      currentUserId: 'u1',
    })
  })
  vi.mocked(fetch).mockReset()
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
    weeks: [{ weekId: 'week05', label: 'Week 5', status: 'available' }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
})

describe('MainLayout', () => {
  it('TC-C-ML-01: Header / Outlet (子ルート) / BottomNav を同時にレンダする', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<div data-testid="child-page">CHILD</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
    await waitFor(() => expect(screen.getByTestId('child-page')).toBeInTheDocument())
    // Header
    expect(screen.getByText('🇺🇸 LA350')).toBeInTheDocument()
    // BottomNav
    expect(screen.getByRole('link', { name: /Home/ })).toBeInTheDocument()
  })
})
