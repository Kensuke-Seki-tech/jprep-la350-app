import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useUserStore } from './useUserStore'
import { MAX_USERS } from '@/types/user'

beforeEach(() => {
  act(() => {
    useUserStore.setState({ users: [], currentUserId: null })
  })
  localStorage.clear()
})

describe('useUserStore', () => {
  it('TC-U-040: addUser でユーザーが追加される', () => {
    act(() => useUserStore.getState().addUser('Alice', '#FF0000'))
    expect(useUserStore.getState().users).toHaveLength(1)
    expect(useUserStore.getState().users[0]!.displayName).toBe('Alice')
  })

  it('TC-U-041: 5 人いる状態でさらに追加すると無視される', () => {
    act(() => {
      for (let i = 0; i < MAX_USERS; i++) {
        useUserStore.getState().addUser(`User${i}`, '#000')
      }
    })
    expect(useUserStore.getState().users).toHaveLength(MAX_USERS)
    act(() => useUserStore.getState().addUser('Sixth', '#000'))
    expect(useUserStore.getState().users).toHaveLength(MAX_USERS)
  })

  it('TC-U-042: selectUser で currentUserId が更新される', () => {
    act(() => useUserStore.getState().addUser('Alice', '#000'))
    act(() => useUserStore.getState().addUser('Bob', '#111'))
    const bobId = useUserStore.getState().users[1]!.userId
    act(() => useUserStore.getState().selectUser(bobId))
    expect(useUserStore.getState().currentUserId).toBe(bobId)
  })

  it('TC-U-043: removeUser で指定ユーザーが削除される', () => {
    act(() => useUserStore.getState().addUser('Alice', '#000'))
    const id = useUserStore.getState().users[0]!.userId
    act(() => useUserStore.getState().removeUser(id))
    expect(useUserStore.getState().users).toHaveLength(0)
  })

  it('TC-U-044: 選択中ユーザーを削除すると currentUserId=null', () => {
    act(() => useUserStore.getState().addUser('Alice', '#000'))
    const id = useUserStore.getState().users[0]!.userId
    act(() => useUserStore.getState().selectUser(id))
    act(() => useUserStore.getState().removeUser(id))
    expect(useUserStore.getState().currentUserId).toBeNull()
  })
})
