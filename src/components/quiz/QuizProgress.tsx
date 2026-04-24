import { ProgressBar } from '@/components/common/ProgressBar'

interface Props {
  currentIndex: number
  total: number
  score: number
}

export function QuizProgress({ currentIndex, total, score }: Props) {
  const pct = total > 0 ? Math.round((currentIndex / total) * 100) : 0
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>正解数: {score}</span>
        <span>{currentIndex}/{total}</span>
      </div>
      <ProgressBar value={pct} color="bg-blue-500" />
    </div>
  )
}
