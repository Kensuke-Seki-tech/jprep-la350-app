import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpeedControl } from './SpeedControl'

describe('SpeedControl', () => {
  it('TC-C-SC-01: showDictation=true で 3 段速度ボタンが表示される', () => {
    render(<SpeedControl currentSpeed={1.0} onSpeedChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '×1.0' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '×0.7' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '×0.5' })).toBeInTheDocument()
  })

  it('TC-C-SC-02: showDictation=false で ×0.5 ボタンが表示されない', () => {
    render(<SpeedControl currentSpeed={1.0} onSpeedChange={vi.fn()} showDictation={false} />)
    expect(screen.queryByRole('button', { name: '×0.5' })).not.toBeInTheDocument()
  })

  it('TC-C-SC-03: 現在速度のボタンが青ハイライトされる', () => {
    render(<SpeedControl currentSpeed={0.7} onSpeedChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '×0.7' }).className).toMatch(/bg-blue-500/)
    expect(screen.getByRole('button', { name: '×1.0' }).className).toMatch(/bg-gray-100/)
  })

  it('TC-C-SC-04: ボタン押下で onSpeedChange が指定速度で呼ばれる', async () => {
    const onSpeedChange = vi.fn()
    const user = userEvent.setup()
    render(<SpeedControl currentSpeed={1.0} onSpeedChange={onSpeedChange} />)
    await user.click(screen.getByRole('button', { name: '×0.5' }))
    expect(onSpeedChange).toHaveBeenCalledWith(0.5)
  })
})
