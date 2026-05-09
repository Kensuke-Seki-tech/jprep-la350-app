import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ActivityChart } from '@/components/admin/ActivityChart'
import { ActivityTable } from '@/components/admin/ActivityTable'
import type { AggregatedRow } from '@/components/admin/ActivityTable'

const STORAGE_KEY = 'jprep_admin_auth'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string


interface ActivityLog {
  id: string
  user_name: string
  mode: string
  week_id: string | null
  accessed_at: string
}

type DateRange = 'today' | 'week' | 'month' | 'all'

function getStartDate(range: DateRange): string | null {
  const now = new Date()
  if (range === 'today') {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d.toISOString()
  }
  if (range === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString()
  }
  if (range === 'month') {
    const d = new Date(now); d.setMonth(d.getMonth() - 1); return d.toISOString()
  }
  return null
}

function aggregateLogs(logs: ActivityLog[]): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>()
  for (const log of logs) {
    const date = log.accessed_at.slice(0, 10)
    const key = `${date}|${log.user_name}|${log.mode}|${log.week_id ?? ''}`
    const existing = map.get(key)
    if (existing) {
      existing.count++
    } else {
      map.set(key, { date, user_name: log.user_name, mode: log.mode, week_id: log.week_id, count: 1 })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date))
}

function getModeChartData(rows: AggregatedRow[]) {
  const map = new Map<string, number>()
  for (const row of rows) {
    map.set(row.mode, (map.get(row.mode) ?? 0) + row.count)
  }
  return Array.from(map.entries())
    .map(([mode, count]) => ({ mode, count }))
    .sort((a, b) => b.count - a.count)
}

export default function AdminScreen() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [selectedUser, setSelectedUser] = useState('all')

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthed(true)
    } else {
      setPasswordError(true)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuthed(false)
    setPassword('')
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    const startDate = getStartDate(dateRange)
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('accessed_at', { ascending: false })
    if (startDate) {
      query = query.gte('accessed_at', startDate)
    }
    query.then(({ data, error }) => {
      if (error) console.warn('[admin]', error.message)
      setLogs((data as ActivityLog[]) ?? [])
      setLoading(false)
    })
  }, [authed, dateRange])

  if (!authed) {
    return (
      <div className="py-16 flex flex-col items-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin</h1>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="パスワード"
            className={`w-full border-2 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-blue-500 ${
              passwordError ? 'border-red-400' : 'border-slate-200'
            }`}
          />
          {passwordError && (
            <p className="text-red-500 text-sm text-center">パスワードが違います</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
          >
            ログイン
          </button>
        </div>
      </div>
    )
  }

  const allUsers = Array.from(new Set(logs.map(l => l.user_name))).sort()
  const filteredLogs = selectedUser === 'all' ? logs : logs.filter(l => l.user_name === selectedUser)
  const aggregated = aggregateLogs(filteredLogs)
  const chartData = getModeChartData(aggregated)

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          ログアウト
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value as DateRange)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
        >
          <option value="today">今日</option>
          <option value="week">今週</option>
          <option value="month">今月</option>
          <option value="all">全期間</option>
        </select>

        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
        >
          <option value="all">全員</option>
          {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">読み込み中...</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              モード別利用回数
            </h2>
            <ActivityChart data={chartData} />
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              詳細ログ
            </h2>
            <ActivityTable rows={aggregated} />
          </div>
        </>
      )}
    </div>
  )
}
