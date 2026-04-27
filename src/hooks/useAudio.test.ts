import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { setUA } from '@/test/setup'
import { UA_IPHONE, UA_ANDROID, UA_DESKTOP } from '@/test/fixtures'

async function loadUseAudio(ua: string) {
  setUA(ua)
  vi.resetModules()
  const mod = await import('./useAudio')
  return mod.useAudio
}

describe('useAudio - UA 判定', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TC-U-AUDIO-MOBILE-01: iPhone UA で webSpeech 経由', async () => {
    const useAudio = await loadUseAudio(UA_IPHONE)
    const { result } = renderHook(() => useAudio())
    act(() => result.current.speak('hello', 1.0))
    expect(window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('TC-U-AUDIO-MOBILE-02: Android UA で webSpeech 経由', async () => {
    const useAudio = await loadUseAudio(UA_ANDROID)
    const { result } = renderHook(() => useAudio())
    act(() => result.current.speak('hello', 1.0))
    expect(window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('TC-U-AUDIO-MOBILE-03: デスクトップ UA で Audio() を経由', async () => {
    const useAudio = await loadUseAudio(UA_DESKTOP)
    const calls: number[] = []
    vi.stubGlobal('Audio', class {
      src = ''; preload = ''; playbackRate = 1
      onerror: any = null; onended: any = null
      play = vi.fn().mockResolvedValue(undefined)
      pause = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
      constructor() { calls.push(1) }
    } as any)
    const { result } = renderHook(() => useAudio())
    act(() => result.current.speak('hello', 1.0))
    expect(calls.length).toBeGreaterThan(0)
  })

  it('TC-U-AUDIO-MOBILE-04: モバイルで new Audio() は呼ばれない', async () => {
    const useAudio = await loadUseAudio(UA_IPHONE)
    const calls: number[] = []
    vi.stubGlobal('Audio', class {
      src = ''; preload = ''; playbackRate = 1
      onerror: any = null; onended: any = null
      play = vi.fn().mockResolvedValue(undefined)
      pause = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
      constructor() { calls.push(1) }
    } as any)
    const { result } = renderHook(() => useAudio())
    act(() => result.current.speak('hello', 1.0))
    expect(calls.length).toBe(0)
  })

  it('TC-U-AUDIO-MOBILE-05: デスクトップで Google TTS URL がセットされる', async () => {
    const useAudio = await loadUseAudio(UA_DESKTOP)
    const constructed: string[] = []
    vi.stubGlobal('Audio', class {
      src = ''; preload = ''; playbackRate = 1
      onerror: any = null; onended: any = null
      play = vi.fn().mockResolvedValue(undefined)
      pause = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
      constructor(src?: string) { constructed.push(src ?? '') }
    } as any)
    const { result } = renderHook(() => useAudio())
    act(() => result.current.speak('hello', 1.0))
    expect(constructed[0]).toContain('translate.google.com/translate_tts')
    expect(constructed[0]).toContain('q=hello')
  })

  it('TC-U-AUDIO-MOBILE-06: デスクトップ play() reject で webSpeech にフォールバック', async () => {
    const useAudio = await loadUseAudio(UA_DESKTOP)
    const FailingAudio = class {
      src = ''; preload = ''; playbackRate = 1
      onerror: any = null; onended: any = null
      play = vi.fn().mockRejectedValue(new Error('CORS'))
      pause = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
    }
    vi.stubGlobal('Audio', FailingAudio as any)
    const { result } = renderHook(() => useAudio())
    await act(async () => {
      result.current.speak('hello', 1.0)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(window.speechSynthesis.speak).toHaveBeenCalled()
  })

  it('TC-U-AUDIO-MOBILE-07: stop() で speechSynthesis.cancel() が呼ばれる', async () => {
    const useAudio = await loadUseAudio(UA_IPHONE)
    const { result } = renderHook(() => useAudio())
    act(() => result.current.stop())
    expect(window.speechSynthesis.cancel).toHaveBeenCalled()
  })

  it('TC-U-AUDIO-MOBILE-08: デスクトップ 0.5x 速で playbackRate=0.75', async () => {
    const useAudio = await loadUseAudio(UA_DESKTOP)
    let captured: any = null
    vi.stubGlobal('Audio', class {
      src = ''; preload = ''; playbackRate = 1
      onerror: any = null; onended: any = null
      play = vi.fn().mockResolvedValue(undefined)
      pause = vi.fn()
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
      constructor() { captured = this }
    } as any)
    const { result } = renderHook(() => useAudio())
    act(() => result.current.speak('hello', 0.5))
    expect(captured.playbackRate).toBe(0.75)
  })
})
