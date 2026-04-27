import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'
import { UserSelectScreen } from './UserSelectScreen'
import { useUserStore } from '@/hooks/useUserStore'
import { MAX_USERS } from '@/types/user'

beforeEach(() => {
  act(() => {
    useUserStore.setState({ users: [], currentUserId: null })
  })
  localStorage.clear()
})

describe('UserSelectScreen', () => {
  it('TC-C-020: 既存ユーザーが一覧表示される', () => {
    act(() => {
      useUserStore.getState().addUser('Alice', '#FF0000')
      useUserStore.getState().addUser('Bob', '#00FF00')
    })
    render(<UserSelectScreen />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('TC-C-021: ユーザークリックで selectUser が呼ばれる（currentUserId 更新）', async () => {
    act(() => useUserStore.getState().addUser('Alice', '#FF0000'))
    const aliceId = useUserStore.getState().users[0]!.userId
    const user = userEvent.setup()
    render(<UserSelectScreen />)
    // UserSelectScreen の行 button が UserAvatar の <button> を内包しているため複数 button が /Alice/ にマッチ。
    // 外側のクリック対象 button は DOM 順で最初に現れるため [0] で取得。
    const rowBtns = screen.getAllByRole('button', { name: /Alice/ })
    await user.click(rowBtns[0]!)
    expect(useUserStore.getState().currentUserId).toBe(aliceId)
  })

  it('TC-C-022: 「＋ 新しいユーザーを追加」で入力フォームが表示される', async () => {
    const user = userEvent.setup()
    render(<UserSelectScreen />)
    await user.click(screen.getByRole('button', { name: /新しいユーザーを追加/ }))
    expect(screen.getByPlaceholderText('名前を入力')).toBeInTheDocument()
  })

  it('TC-C-023: MAX_USERS いる場合「追加」ボタンが非表示', () => {
    act(() => {
      for (let i = 0; i < MAX_USERS; i++) {
        useUserStore.getState().addUser(`User${i}`, '#000')
      }
    })
    render(<UserSelectScreen />)
    expect(screen.queryByRole('button', { name: /新しいユーザーを追加/ })).toBeNull()
  })

  it('TC-C-024: 名前を入力して「作成」で addUser される', async () => {
    const user = userEvent.setup()
    render(<UserSelectScreen />)
    await user.click(screen.getByRole('button', { name: /新しいユーザーを追加/ }))
    await user.type(screen.getByPlaceholderText('名前を入力'), 'Charlie')
    await user.click(screen.getByRole('button', { name: '作成' }))
    expect(useUserStore.getState().users.some(u => u.displayName === 'Charlie')).toBe(true)
  })
})
