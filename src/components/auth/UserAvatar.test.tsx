import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserAvatar } from './UserAvatar'

describe('UserAvatar', () => {
  it('TC-U-AVATAR-01: onClick あり → <button> としてレンダ', () => {
    render(<UserAvatar name="Alice" color="#FF0000" onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'ユーザー: Alice' })).toBeInTheDocument()
  })

  it('TC-U-AVATAR-02: onClick なし → <button> はレンダされず、aria-label の <div> のみ', () => {
    render(<UserAvatar name="Alice" color="#FF0000" />)
    expect(screen.queryByRole('button', { name: /ユーザー: Alice/ })).toBeNull()
    expect(screen.getByLabelText('ユーザー: Alice')).toBeInTheDocument()
  })

  it('TC-U-AVATAR-03: onClick クリック時に handler が呼ばれる', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<UserAvatar name="Alice" color="#FF0000" onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'ユーザー: Alice' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
