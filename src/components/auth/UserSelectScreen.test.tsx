import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { UserSelectScreen } from './UserSelectScreen'
import { useUserStore } from '@/hooks/useUserStore'
import { MAX_USERS } from '@/types/user'

beforeEach(async () => {
  await act(async () => {
    useUserStore.setState({ users: [], currentUserId: null })
  })
  localStorage.clear()
})

describe('UserSelectScreen', () => {
  it('TC-C-020: 既存ユーザーが一覧表示される', async () => {
    await act(async () => {
      useUserStore.getState().addUser('Alice', '#FF0000')
      useUserStore.getState().addUser('Bob', '#00FF00')
    })
    render(<UserSelectScreen />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('TC-C-021: ユーザークリックで selectUser が呼ばれる（currentUserId 更新）', async () => {
    await act(async () => {
      useUserStore.getState().addUser('Alice', '#FF0000')
    })
    const aliceId = useUserStore.getState().users[0]!.userId
    const user = userEvent.setup()
    render(<UserSelectScreen />)
    await user.click(screen.getByRole('button', { name: /Alice/ }))
    await waitFor(() => {
      expect(useUserStore.getState().currentUserId).toBe(aliceId)
    })
  })

  it('TC-C-022: 「＋ 新しいユーザーを追加」で入力フォームが表示される', async () => {
    const user = userEvent.setup()
    render(<UserSelectScreen />)
    await user.click(screen.getByRole('button', { name: /新しいユーザーを追加/ }))
    expect(await screen.findByPlaceholderText('名前を入力')).toBeInTheDocument()
  })

  it('TC-C-023: MAX_USERS いる場合「追加」ボタンが非表示', async () => {
    await act(async () => {
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
    await user.type(await screen.findByPlaceholderText('名前を入力'), 'Charlie')
    await user.click(screen.getByRole('button', { name: '作成' }))
    await waitFor(() => {
      expect(useUserStore.getState().users.some(u => u.displayName === 'Charlie')).toBe(true)
    })
  })
})
