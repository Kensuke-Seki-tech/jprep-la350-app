import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudioButton } from './AudioButton'

describe('AudioButton', () => {
  it('TC-C-AB-01: aria-label に "<text> を再生" が設定される', () => {
    render(<AudioButton text="sapling" onSpeak={vi.fn()} />)
    expect(screen.getByLabelText('sapling を再生')).toBeInTheDocument()
  })

  it('TC-C-AB-02: 通常時は 🔊 アイコンが表示される', () => {
    render(<AudioButton text="sapling" onSpeak={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('🔊')
  })

  it('TC-C-AB-03: isPlaying=true で ⏸ アイコンに切り替わる', () => {
    render(<AudioButton text="sapling" isPlaying onSpeak={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('⏸')
    expect(screen.getByRole('button').className).toMatch(/bg-blue-500/)
  })

  it('TC-C-AB-04: クリックで onSpeak が text + speed で呼ばれる', async () => {
    const onSpeak = vi.fn()
    const user = userEvent.setup()
    render(<AudioButton text="sapling" speed={0.7} onSpeak={onSpeak} />)
    await user.click(screen.getByRole('button'))
    expect(onSpeak).toHaveBeenCalledWith('sapling', 0.7)
  })

  it('TC-C-AB-05: size=sm で小サイズクラスが付与される', () => {
    render(<AudioButton text="sapling" onSpeak={vi.fn()} size="sm" />)
    expect(screen.getByRole('button').className).toMatch(/w-7/)
  })
})
