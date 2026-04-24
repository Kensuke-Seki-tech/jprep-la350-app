import { useState } from 'react'
import { useWeekStore, useWeeksConfig } from '@/hooks/useWeeks'
import { useUserStore, useCurrentUser } from '@/hooks/useUserStore'
import { UserAvatar } from '@/components/auth/UserAvatar'

export function Header() {
  const { currentWeekId, setCurrentWeekId } = useWeekStore()
  const { data: weeks } = useWeeksConfig()
  const currentUser = useCurrentUser()
  const { users, selectUser, clearCurrentUser } = useUserStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const availableWeeks = weeks?.filter(w => w.status === 'available') ?? []

  return (
    <header className="fixed top-0 left-0 right-0 bg-blue-700 text-white z-10 shadow-md">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold">🇺🇸 LA350</span>
          {availableWeeks.length > 0 && (
            <select
              value={currentWeekId}
              onChange={e => setCurrentWeekId(e.target.value)}
              className="bg-blue-600 text-white text-sm rounded-lg px-2 py-1 border border-blue-400 focus:outline-none"
              aria-label="Weekを選択"
            >
              {availableWeeks.map(w => (
                <option key={w.weekId} value={w.weekId}>{w.label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="relative">
          {currentUser && (
            <UserAvatar
              name={currentUser.displayName}
              color={currentUser.avatarColor}
              size="sm"
              onClick={() => setShowDropdown(v => !v)}
            />
          )}
          {showDropdown && (
            <div className="absolute right-0 top-10 bg-white text-slate-800 rounded-xl shadow-xl min-w-44 overflow-hidden z-50">
              <div className="px-4 py-2 text-xs text-slate-500 border-b">ユーザーを切替</div>
              {users.map(u => (
                <button
                  key={u.userId}
                  onClick={() => { selectUser(u.userId); setShowDropdown(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left ${
                    currentUser?.userId === u.userId ? 'bg-blue-50' : ''
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full flex-shrink-0 text-white text-xs flex items-center justify-center font-bold"
                    style={{ backgroundColor: u.avatarColor }}
                  >
                    {u.displayName.charAt(0)}
                  </span>
                  <span className="font-medium">{u.displayName}</span>
                  {currentUser?.userId === u.userId && <span className="ml-auto text-blue-600 text-xs">●</span>}
                </button>
              ))}
              <div className="border-t">
                <button
                  onClick={() => { clearCurrentUser(); setShowDropdown(false) }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-500 hover:bg-slate-50"
                >
                  ← ユーザー選択に戻る
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
