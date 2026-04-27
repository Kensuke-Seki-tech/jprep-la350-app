import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWeekStore, useWeeksConfig } from './useWeeks'

beforeEach(() => {
  act(() => {
    useWeekStore.setState({ currentWeekId: 'week05' })
  })
  localStorage.clear()
  vi.mocked(fetch).mockReset()
})

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useWeekStore', () => {
  it('TC-U-WEEKS-01: 初期状態は currentWeekId="week05"', () => {
    expect(useWeekStore.getState().currentWeekId).toBe('week05')
  })

  it('TC-U-WEEKS-02: setCurrentWeekId で更新できる', () => {
    act(() => useWeekStore.getState().setCurrentWeekId('week06'))
    expect(useWeekStore.getState().currentWeekId).toBe('week06')
  })
})

describe('useWeeksConfig', () => {
  it('TC-U-WEEKS-10: 成功時に weeks 配列を返す', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      weeks: [
        { weekId: 'week05', label: 'Week 5', status: 'available' },
        { weekId: 'week06', label: 'Week 6', status: 'available' },
      ],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const { result } = renderHook(() => useWeeksConfig(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.weekId).toBe('week05')
  })

  it('TC-U-WEEKS-11: fetch 失敗時は isError=true を返す', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }))

    const { result } = renderHook(() => useWeeksConfig(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
