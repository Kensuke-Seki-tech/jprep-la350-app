import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('TC-C-BTN-01: children をラベルとしてレンダする', () => {
    render(<Button>クリック</Button>)
    expect(screen.getByRole('button', { name: 'クリック' })).toBeInTheDocument()
  })

  it('TC-C-BTN-02: variant=danger で赤系クラスが付与される', () => {
    render(<Button variant="danger">削除</Button>)
    expect(screen.getByRole('button').className).toMatch(/bg-red-500/)
  })

  it('TC-C-BTN-03: size=lg で lg 系のパディングクラスが付与される', () => {
    render(<Button size="lg">大</Button>)
    expect(screen.getByRole('button').className).toMatch(/px-6/)
  })

  it('TC-C-BTN-04: onClick が発火する', async () => {
    const handler = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={handler}>OK</Button>)
    await user.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('TC-C-BTN-05: disabled 時はクリックが無視される', async () => {
    const handler = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={handler} disabled>OK</Button>)
    await user.click(screen.getByRole('button'))
    expect(handler).not.toHaveBeenCalled()
  })
})
