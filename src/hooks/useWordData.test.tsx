import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useWordData } from './useWordData'

beforeEach(() => {
  vi.mocked(fetch).mockReset()
})

const wrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useWordData', () => {
  it('TC-U-WORDDATA-01: dataUrl=null のとき fetch は呼ばれず data は undefined', () => {
    const { result } = renderHook(() => useWordData('week05', null), { wrapper: wrapper() })
    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })

  it('TC-U-WORDDATA-02: 成功時に words 配列を返す', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      weekId: 'week05',
      words: [
        { id: 'w1', english: 'sapling', japanese: '苗木', englishDef: 'a young tree', partOfSpeech: 'n', exampleEn: '', exampleJa: '' },
      ],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const { result } = renderHook(() => useWordData('week05', '/data/week05.json'), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0]?.english).toBe('sapling')
  })

  it('TC-U-WORDDATA-03: fetch 失敗時は isError=true を返す', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }))

    const { result } = renderHook(() => useWordData('week99', '/data/week99.json'), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
