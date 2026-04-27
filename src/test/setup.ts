import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// localStorage はテストごとに初期化
beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.useRealTimers()
})

// ── fetch ────────────────────────────────────────────────────
vi.stubGlobal('fetch', vi.fn())

// ── Audio クラス ─────────────────────────────────────────────
class MockAudio {
  src = ''
  preload = ''
  playbackRate = 1
  currentTime = 0
  onerror: ((e: Event) => void) | null = null
  onended: (() => void) | null = null
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  addEventListener = vi.fn((evt: string, cb: () => void) => {
    if (evt === 'canplaythrough') cb()
  })
  removeEventListener = vi.fn()
}
vi.stubGlobal('Audio', MockAudio)

// ── speechSynthesis ──────────────────────────────────────────
vi.stubGlobal('speechSynthesis', {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => []),
})

vi.stubGlobal(
  'SpeechSynthesisUtterance',
  vi.fn().mockImplementation((text: string) => ({
    text, rate: 1, pitch: 1, volume: 1, voice: null, lang: 'en-US',
    onend: null, onerror: null,
  })),
)

// ── helper：UA を上書き ──────────────────────────────────────
export function setUA(ua: string) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  })
}
