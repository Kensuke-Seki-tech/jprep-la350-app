import { useWeeksConfig } from '@/hooks/useWeeks'
import { useCurrentUser } from '@/hooks/useUserStore'
import { useProgress } from '@/hooks/useProgress'
import { WeekProgressCard } from '@/components/progress/WeekProgressCard'

export default function ProgressScreen() {
  const { data: weeks } = useWeeksConfig()
  const currentUser = useCurrentUser()
  const { getWeekBestScore, getWeekFlashcardCount, getLastStudied } = useProgress(currentUser?.userId ?? null)

  const availableWeeks = weeks?.filter(w => w.status === 'available') ?? []
  const totalSessions = availableWeeks.reduce((acc, w) =>
    acc + getWeekFlashcardCount(w.weekId), 0
  )
  const studiedWeeks = availableWeeks.filter(w => getWeekBestScore(w.weekId) !== null).length

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        {currentUser?.displayName} さんの進捗
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-600">{studiedWeeks}</p>
          <p className="text-xs text-slate-400 mt-1">受験済みWeek</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-purple-600">{totalSessions}</p>
          <p className="text-xs text-slate-400 mt-1">フラッシュカード回数</p>
        </div>
      </div>

      {availableWeeks.length === 0 && (
        <p className="text-center text-slate-400 py-8">データを読み込み中...</p>
      )}

      {availableWeeks.map(w => (
        <WeekProgressCard
          key={w.weekId}
          weekNumber={w.weekNumber}
          label={w.label}
          bestScore={getWeekBestScore(w.weekId)}
          flashcardCount={getWeekFlashcardCount(w.weekId)}
          lastStudied={getLastStudied(w.weekId)}
        />
      ))}
    </div>
  )
}
