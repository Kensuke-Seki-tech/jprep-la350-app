import { useState } from 'react'
import { useUserStore, getNextColor } from '@/hooks/useUserStore'
import { UserAvatar } from './UserAvatar'
import { AVATAR_COLORS, MAX_USERS } from '@/types/user'

export function UserSelectScreen() {
  const { users, addUser, selectUser } = useUserStore()
  const [mode, setMode] = useState<'select' | 'create'>('select')
  const [name, setName] = useState('')
  const [color, setColor] = useState(() => getNextColor(users))

  const handleCreate = () => {
    if (!name.trim()) return
    addUser(name.trim(), color)
    setName('')
    setMode('select')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-3xl font-bold text-center mb-2">🇺🇸 JPREP LA350</h1>
        <p className="text-blue-200 text-center mb-8">誰が使いますか？</p>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {mode === 'select' ? (
            <>
              {users.length === 0 ? (
                <p className="text-slate-500 text-center py-4">ユーザーがいません</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {users.map(u => (
                    <button
                      key={u.userId}
                      onClick={() => selectUser(u.userId)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <UserAvatar name={u.displayName} color={u.avatarColor} size="md" />
                      <span className="font-semibold text-slate-800 text-lg">{u.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
              {users.length < MAX_USERS && (
                <button
                  onClick={() => { setColor(getNextColor(users)); setMode('create'); }}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                >
                  ＋ 新しいユーザーを追加
                </button>
              )}
            </>
          ) : (
            <>
              <h2 className="font-bold text-slate-800 text-lg mb-4">ユーザーを作成</h2>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="名前を入力"
                maxLength={10}
                autoFocus
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-lg focus:outline-none focus:border-blue-500 mb-4"
              />
              <p className="text-sm text-slate-500 mb-2">カラーを選択</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={`カラー ${c}`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('select')}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-40"
                >
                  作成
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
