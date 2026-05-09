# Supabase 利用状況トラッキング & 管理ダッシュボード Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 各モード画面を開いた回数をSupabaseに記録し、先生が `/admin` で日別・ユーザー別の利用状況を確認できるようにする。

**Architecture:** 既存のZustand + localsStorageには一切手を加えず、各ページコンポーネントのマウント時に `useActivityLog` フックが fire-and-forget でSupabaseにINSERTする薄いレイヤーを追加する。ダッシュボードは `/admin` ルートに追加しパスワードで保護する。

**Tech Stack:** React 18 + TypeScript 5, @supabase/supabase-js v2, Tailwind CSS 3, Vitest + Testing Library

---

## File Map

### 新規作成
| ファイル | 役割 |
|---|---|
| `src/lib/supabase.ts` | Supabaseクライアントのシングルトン |
| `src/hooks/useActivityLog.ts` | マウント時に1回INSERTするフック |
| `src/hooks/useActivityLog.test.ts` | useActivityLogのユニットテスト |
| `src/components/admin/ActivityChart.tsx` | モード別利用回数のCSS棒グラフ |
| `src/components/admin/ActivityTable.tsx` | 日別×ユーザー×モードの集計テーブル |
| `src/pages/AdminScreen.tsx` | パスワードゲート付きダッシュボード画面 |
| `.env.local.example` | 環境変数テンプレート |

### 既存ファイル変更
| ファイル | 変更内容 |
|---|---|
| `src/App.tsx` | `/admin` ルートを追加 |
| `src/pages/EtymologyScreen.tsx` | `useActivityLog('etymology', currentWeekId)` を追加 |
| `src/pages/FlashcardScreen.tsx` | `useActivityLog('flashcard', weekId)` を追加 |
| `src/pages/QuizScreen.tsx` | `useActivityLog('quiz', weekId)` を追加 |
| `src/pages/PredictedQuizScreen.tsx` | `useActivityLog('predicted_quiz', weekId)` を追加 |
| `src/pages/WordListScreen.tsx` | `useActivityLog('wordlist', weekId)` を追加 |
| `src/pages/DictationScreen.tsx` | `useActivityLog('dictation', weekId)` を追加 |

---

## Task 1: Supabase パッケージのインストールと環境設定

**Files:**
- Create: `.env.local.example`
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: パッケージをインストール**

```bash
npm install @supabase/supabase-js
```

Expected output: `added 1 package` (or similar, no errors)

- [ ] **Step 2: `.env.local.example` を作成**

`.env.local.example` を以下の内容で作成（このファイルはコミットする）:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PASSWORD=your-admin-password
```

- [ ] **Step 3: `.env.local` を作成（gitignore済み）**

`.env.local` を以下の内容で作成（実際の値は後でSupabaseプロジェクト作成後に記入する）:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PASSWORD=your-admin-password
```

- [ ] **Step 4: `src/lib/supabase.ts` を作成**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 5: TypeScriptビルドが通ることを確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 6: コミット**

```bash
git add src/lib/supabase.ts .env.local.example package.json package-lock.json
git commit -m "feat: Supabaseクライアントのセットアップと環境変数テンプレートを追加"
```

---

## Task 2: useActivityLog フックの実装（TDD）

**Files:**
- Create: `src/hooks/useActivityLog.test.ts`
- Create: `src/hooks/useActivityLog.ts`

- [ ] **Step 1: 失敗するテストを書く**

`src/hooks/useActivityLog.test.ts` を以下の内容で作成:

```typescript
import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert })

vi.mock('@/lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

vi.mock('@/hooks/useUserStore', () => ({
  useCurrentUser: vi.fn(),
}))

import { useCurrentUser } from '@/hooks/useUserStore'
import { useActivityLog } from './useActivityLog'
import type { UserProfile } from '@/types/user'

const mockUser: UserProfile = {
  userId: 'u1',
  displayName: 'Taro',
  avatarColor: '#3b82f6',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: '2026-01-01T00:00:00.000Z',
}

describe('useActivityLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ユーザーが未ログインの場合はINSERTしない', () => {
    vi.mocked(useCurrentUser).mockReturnValue(null)
    renderHook(() => useActivityLog('quiz', 'week08'))
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('ユーザーがいる場合にINSERTを1回呼ぶ', () => {
    vi.mocked(useCurrentUser).mockReturnValue(mockUser)
    renderHook(() => useActivityLog('quiz', 'week08'))
    expect(mockFrom).toHaveBeenCalledWith('activity_logs')
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockInsert).toHaveBeenCalledWith({
      user_name: 'Taro',
      mode: 'quiz',
      week_id: 'week08',
    })
  })

  it('week_id が null の場合もINSERTする（語源画面）', () => {
    vi.mocked(useCurrentUser).mockReturnValue(mockUser)
    renderHook(() => useActivityLog('etymology', null))
    expect(mockInsert).toHaveBeenCalledWith({
      user_name: 'Taro',
      mode: 'etymology',
      week_id: null,
    })
  })

  it('再レンダーで追加INSERTしない', () => {
    vi.mocked(useCurrentUser).mockReturnValue(mockUser)
    const { rerender } = renderHook(() => useActivityLog('flashcard', 'week07'))
    rerender()
    rerender()
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run src/hooks/useActivityLog.test.ts
```

Expected: `Cannot find module '@/hooks/useActivityLog'` のようなエラーで FAIL

- [ ] **Step 3: `src/hooks/useActivityLog.ts` を実装**

```typescript
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/useUserStore'

export function useActivityLog(mode: string, weekId: string | null) {
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (!currentUser) return
    supabase
      .from('activity_logs')
      .insert({ user_name: currentUser.displayName, mode, week_id: weekId })
      .then(({ error }) => {
        if (error) console.warn('[activity_log]', error.message)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx vitest run src/hooks/useActivityLog.test.ts
```

Expected: `4 tests passed`

- [ ] **Step 5: コミット**

```bash
git add src/hooks/useActivityLog.ts src/hooks/useActivityLog.test.ts
git commit -m "feat: useActivityLog フックを実装（マウント時にSupabaseへ利用記録をINSERT）"
```

---

## Task 3: 各モード画面への useActivityLog 追加

**Files:**
- Modify: `src/pages/EtymologyScreen.tsx`
- Modify: `src/pages/FlashcardScreen.tsx`
- Modify: `src/pages/QuizScreen.tsx`
- Modify: `src/pages/PredictedQuizScreen.tsx`
- Modify: `src/pages/WordListScreen.tsx`
- Modify: `src/pages/DictationScreen.tsx`

- [ ] **Step 1: EtymologyScreen にフックを追加**

`src/pages/EtymologyScreen.tsx` の先頭importに追加:
```typescript
import { useActivityLog } from '@/hooks/useActivityLog';
```

`export const EtymologyScreen: React.FC = () => {` の直後、`const { currentWeekId } = useWeekStore();` の次の行に追加:
```typescript
useActivityLog('etymology', currentWeekId);
```

- [ ] **Step 2: FlashcardScreen にフックを追加**

`src/pages/FlashcardScreen.tsx` の先頭importに追加:
```typescript
import { useActivityLog } from '@/hooks/useActivityLog'
```

`export default function FlashcardScreen() {` の直後、`const { weekId = 'week05' } = useParams()` の次の行に追加:
```typescript
useActivityLog('flashcard', weekId)
```

- [ ] **Step 3: QuizScreen にフックを追加**

`src/pages/QuizScreen.tsx` の先頭importに追加:
```typescript
import { useActivityLog } from '@/hooks/useActivityLog'
```

`export default function QuizScreen() {` の直後、`const { weekId = 'week05' } = useParams()` の次の行に追加:
```typescript
useActivityLog('quiz', weekId)
```

- [ ] **Step 4: PredictedQuizScreen にフックを追加**

`src/pages/PredictedQuizScreen.tsx` の先頭importに追加:
```typescript
import { useActivityLog } from '@/hooks/useActivityLog'
```

`export default function PredictedQuizScreen() {` の直後、`const { weekId = 'week05' } = useParams()` の次の行に追加:
```typescript
useActivityLog('predicted_quiz', weekId)
```

- [ ] **Step 5: WordListScreen にフックを追加**

`src/pages/WordListScreen.tsx` の先頭importに追加:
```typescript
import { useActivityLog } from '@/hooks/useActivityLog'
```

`export default function WordListScreen() {` の直後、`const { weekId = 'week05' } = useParams()` の次の行に追加:
```typescript
useActivityLog('wordlist', weekId)
```

- [ ] **Step 6: DictationScreen にフックを追加**

`src/pages/DictationScreen.tsx` の先頭importに追加:
```typescript
import { useActivityLog } from '@/hooks/useActivityLog'
```

`export default function DictationScreen() {` の直後、`const { weekId = 'week05' } = useParams()` の次の行に追加:
```typescript
useActivityLog('dictation', weekId)
```

- [ ] **Step 7: TypeScriptビルドが通ることを確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 8: 既存テストが壊れていないことを確認**

```bash
npx vitest run
```

Expected: 既存テストが全件 PASS（useActivityLog のテストも含む）

- [ ] **Step 9: コミット**

```bash
git add src/pages/EtymologyScreen.tsx src/pages/FlashcardScreen.tsx src/pages/QuizScreen.tsx src/pages/PredictedQuizScreen.tsx src/pages/WordListScreen.tsx src/pages/DictationScreen.tsx
git commit -m "feat: 全モード画面にuseActivityLogを追加（画面開くたびにSupabaseへ記録）"
```

---

## Task 4: ActivityChart コンポーネント

**Files:**
- Create: `src/components/admin/ActivityChart.tsx`

- [ ] **Step 1: `src/components/admin/ActivityChart.tsx` を作成**

```typescript
const MODE_LABELS: Record<string, string> = {
  etymology: '語源',
  flashcard: 'フラッシュカード',
  quiz: 'クイズ',
  predicted_quiz: '予想問題',
  wordlist: '単語一覧',
  dictation: 'ディクテーション',
}

interface Props {
  data: { mode: string; count: number }[]
}

export function ActivityChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-4">データなし</p>
  }
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.mode} className="flex items-center gap-3">
          <span className="text-sm text-slate-600 w-28 text-right flex-shrink-0">
            {MODE_LABELS[item.mode] ?? item.mode}
          </span>
          <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${Math.max((item.count / max) * 100, 4)}%` }}
            >
              <span className="text-xs text-white font-bold">{item.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: TypeScriptビルドが通ることを確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/admin/ActivityChart.tsx
git commit -m "feat: ActivityChartコンポーネントを追加（モード別利用回数のCSS棒グラフ）"
```

---

## Task 5: ActivityTable コンポーネント

**Files:**
- Create: `src/components/admin/ActivityTable.tsx`

- [ ] **Step 1: `src/components/admin/ActivityTable.tsx` を作成**

```typescript
const MODE_LABELS: Record<string, string> = {
  etymology: '語源',
  flashcard: 'フラッシュカード',
  quiz: 'クイズ',
  predicted_quiz: '予想問題',
  wordlist: '単語一覧',
  dictation: 'ディクテーション',
}

export interface AggregatedRow {
  date: string
  user_name: string
  mode: string
  week_id: string | null
  count: number
}

interface Props {
  rows: AggregatedRow[]
}

export function ActivityTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-4">データなし</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-left border-b border-slate-100">
            <th className="pb-2 pr-4 font-medium">日付</th>
            <th className="pb-2 pr-4 font-medium">ユーザー</th>
            <th className="pb-2 pr-4 font-medium">モード</th>
            <th className="pb-2 pr-4 font-medium">Week</th>
            <th className="pb-2 font-medium text-right">回数</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-2 pr-4 text-slate-600">{row.date}</td>
              <td className="py-2 pr-4 font-medium text-slate-800">{row.user_name}</td>
              <td className="py-2 pr-4 text-slate-600">{MODE_LABELS[row.mode] ?? row.mode}</td>
              <td className="py-2 pr-4 text-slate-500">{row.week_id ?? '—'}</td>
              <td className="py-2 font-bold text-blue-600 text-right">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: TypeScriptビルドが通ることを確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/admin/ActivityTable.tsx
git commit -m "feat: ActivityTableコンポーネントを追加（日別×ユーザー×モードの集計テーブル）"
```

---

## Task 6: AdminScreen — ダッシュボード画面

**Files:**
- Create: `src/pages/AdminScreen.tsx`

- [ ] **Step 1: `src/pages/AdminScreen.tsx` を作成**

```typescript
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
```

- [ ] **Step 2: TypeScriptビルドが通ることを確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/pages/AdminScreen.tsx
git commit -m "feat: AdminScreenを追加（パスワードゲート付きダッシュボード）"
```

---

## Task 7: /admin ルートの追加と動作確認

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: `src/App.tsx` に `/admin` ルートを追加**

`src/App.tsx` の既存importに追加:
```typescript
import AdminScreen from '@/pages/AdminScreen'
```

`<Route path="*" element={<Navigate to="/" replace />} />` の直前に追加:
```typescript
<Route path="/admin" element={<AdminScreen />} />
```

完成形:
```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthGate } from '@/components/auth/AuthGate'
import { MainLayout } from '@/components/layout/MainLayout'
import HomeScreen from '@/pages/HomeScreen'
import FlashcardScreen from '@/pages/FlashcardScreen'
import QuizScreen from '@/pages/QuizScreen'
import WordListScreen from '@/pages/WordListScreen'
import ProgressScreen from '@/pages/ProgressScreen'
import { EtymologyScreen } from '@/pages/EtymologyScreen'
import PredictedQuizScreen from '@/pages/PredictedQuizScreen'
import DictationScreen from '@/pages/DictationScreen'
import AdminScreen from '@/pages/AdminScreen'

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/etymology" element={<EtymologyScreen />} />
          <Route path="/flashcard/:weekId" element={<FlashcardScreen />} />
          <Route path="/quiz/:weekId" element={<QuizScreen />} />
          <Route path="/predicted-quiz/:weekId" element={<PredictedQuizScreen />} />
          <Route path="/wordlist/:weekId" element={<WordListScreen />} />
          <Route path="/dictation/:weekId" element={<DictationScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthGate>
  )
}
```

- [ ] **Step 2: 全テストが通ることを確認**

```bash
npx vitest run
```

Expected: 全件 PASS

- [ ] **Step 3: TypeScriptビルドが通ることを確認**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/App.tsx
git commit -m "feat: /adminルートをApp.tsxに追加"
```

---

## Task 8: Supabase テーブルのセットアップ（手動作業）

このタスクはSupabase Studioで行う手動作業です。コードの変更はありません。

- [ ] **Step 1: Supabase プロジェクトを作成**

1. https://supabase.com にアクセスしてプロジェクトを作成
2. `Settings > API` から以下を取得:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` キー → `VITE_SUPABASE_ANON_KEY`
3. `.env.local` の値を実際の値に書き換える

- [ ] **Step 2: activity_logs テーブルを作成**

Supabase Studio の `SQL Editor` で以下を実行:

```sql
create table activity_logs (
  id          uuid primary key default gen_random_uuid(),
  user_name   text not null,
  mode        text not null,
  week_id     text,
  accessed_at timestamptz default now()
);
```

- [ ] **Step 3: RLS ポリシーを設定**

```sql
-- RLSを有効化
alter table activity_logs enable row level security;

-- INSERT: アプリ（anon key）から書き込み可能
create policy "allow_insert" on activity_logs
  for insert to anon
  with check (true);

-- SELECT: ダッシュボード（anon key）から読み取り可能
create policy "allow_select" on activity_logs
  for select to anon
  using (true);
```

- [ ] **Step 4: 動作確認**

1. `npm run dev` で開発サーバーを起動
2. アプリにログインしてフラッシュカード画面を開く
3. Supabase Studio の `Table Editor > activity_logs` でレコードが追加されていることを確認
4. `http://localhost:5173/admin` にアクセスしてパスワードを入力
5. ダッシュボードにデータが表示されることを確認
