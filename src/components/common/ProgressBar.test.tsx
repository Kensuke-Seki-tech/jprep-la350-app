import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

const innerBar = (container: HTMLElement) =>
  container.querySelector('.h-full') as HTMLDivElement

describe('ProgressBar', () => {
  it('TC-C-PB-01: value=80 以上で緑バーになる', () => {
    const { container } = render(<ProgressBar value={85} />)
    expect(innerBar(container).className).toMatch(/bg-green-500/)
  })

  it('TC-C-PB-02: value=60 以上 80 未満で青バーになる', () => {
    const { container } = render(<ProgressBar value={70} />)
    expect(innerBar(container).className).toMatch(/bg-blue-500/)
  })

  it('TC-C-PB-03: value<60 で slate バーになる', () => {
    const { container } = render(<ProgressBar value={30} />)
    expect(innerBar(container).className).toMatch(/bg-slate-400/)
  })

  it('TC-C-PB-04: 明示的な color を指定するとしきい値より優先される', () => {
    const { container } = render(<ProgressBar value={10} color="bg-purple-500" />)
    expect(innerBar(container).className).toMatch(/bg-purple-500/)
  })

  it('TC-C-PB-05: value=120 のとき width は 100% で打ち止め', () => {
    const { container } = render(<ProgressBar value={120} />)
    expect(innerBar(container).style.width).toBe('100%')
  })
})
