import { ProgressBar } from '@/components/common/ProgressBar'
import { formatDate } from '@/utils/format'

interface Props {
  weekNumber: number
  label: string
  bestScore: number | null
  flashcardCount: number
  lastStudied: string | null
}

export function WeekProgressCard({ weekNumber, label, bestScore, flashcardCount, lastStudied }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs text-slate-400 font-medium">WEEK</span>
          <p className="text-2xl font-bold text-slate-800">{weekNumber}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
        <div className="text-right">
          {bestScore !== null ? (
            <p className={`text-3xl font-bold ${bestScore >= 80 ? 'text-green-500' : bestScore >= 60 ? 'text-blue-500' : 'text-slate-500'}`}>
              {bestScore}<span className="text-base font-normal text-slate-400">%</span>
            </p>
          ) : (
            <p className="text-slate-300 text-sm">未受験</p>
          )}
          <p className="text-xs text-slate-400">クイズベスト</p>
        </div>
      </div>

      {bestScore !== null && (
        <ProgressBar value={bestScore} className="mb-3" />
      )}

      <div className="flex justify-between text-xs text-slate-400">
        <span>フラッシュカード: <strong className="text-slate-600">{flashcardCount}回</strong></span>
        {lastStudied && <span>最終: {formatDate(lastStudied)}</span>}
      </div>
    </div>
  )
}
