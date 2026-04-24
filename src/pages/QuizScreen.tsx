import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeeksConfig } from '@/hooks/useWeeks'
import { useWordData } from '@/hooks/useWordData'
import { useCurrentUser } from '@/hooks/useUserStore'
import { useProgress } from '@/hooks/useProgress'
import { useQuizSession } from '@/hooks/useQuizSession'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { QuizChoices } from '@/components/quiz/QuizChoices'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'
import { formatDuration } from '@/utils/format'
import type { QuizMode } from '@/utils/quiz'

export default function QuizScreen() {
  const { weekId = 'week05' } = useParams()
  const navigate = useNavigate()
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)
  const { data: words } = useWordData(weekId, week?.dataUrl ?? null)
  const currentUser = useCurrentUser()
  const { saveQuizResult, getWeekBestScore } = useProgress(currentUser?.userId ?? null)

  const [started, setStarted] = useState(false)
  const [mode, setMode] = useState<QuizMode>('en_to_ja')
  const [selected, setSelected] = useState<string | null>(null)
  const [savedBest] = useState(() => getWeekBestScore(weekId))

  const session = useQuizSession(words ?? [], mode)

  useEffect(() => {
    if (!selected) return
    const t = setTimeout(() => {
      if (session.isFinished) return
      session.nextQuestion()
      setSelected(null)
    }, 1000)
    return () => clearTimeout(t)
  }, [selected, session])

  const handleAnswer = (ans: string) => {
    if (selected) return
    session.answerQuestion(ans)
    setSelected(ans)
    if (session.currentIndex >= session.total - 1) {
      setTimeout(() => {
        session.nextQuestion()
        setSelected(null)
      }, 1100)
    }
  }

  const handleFinish = () => {
    saveQuizResult({
      weekId,
      score: session.score,
      total: session.total,
      percentage: session.percentage,
      mode: session.mode,
      durationSec: session.durationSec,
    })
  }

  if (!words) return <div className="py-8 text-center text-slate-400">読み込み中...</div>

  if (!started) {
    return (
      <div className="py-8 flex flex-col items-center">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">クイズ</h2>
        <p className="text-slate-500 mb-6">{week?.label} — {words.length}語</p>

        <div className="w-full max-w-xs mb-6">
          <p className="text-sm font-semibold text-slate-600 mb-2">出題形式</p>
          <div className="flex gap-3">
            {(['en_to_ja', 'ja_to_en'] as QuizMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  mode === m ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600'
                }`}
              >
                {m === 'en_to_ja' ? '英→日' : '日→英'}
              </button>
            ))}
          </div>
        </div>

        <Button size="lg" onClick={() => setStarted(true)} className="w-full max-w-xs">スタート</Button>
      </div>
    )
  }

  if (session.isFinished) {
    const isNewBest = savedBest === null || session.percentage > savedBest
    return (
      <div className="py-8 flex flex-col items-center text-center">
        <div className="text-6xl mb-4">{session.percentage >= 80 ? '🏆' : '📝'}</div>
        {isNewBest && session.percentage > 0 && (
          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
            🎉 ベストスコア更新！
          </div>
        )}
        <p className="text-5xl font-bold text-blue-600 mb-1">{session.percentage}%</p>
        <p className="text-slate-500 mb-1">{session.score} / {session.total} 問 正解</p>
        <p className="text-xs text-slate-400 mb-4">所要時間: {formatDuration(session.durationSec)}</p>
        <ProgressBar value={session.percentage} className="w-full max-w-xs mb-8" />
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => { handleFinish(); navigate(`/quiz/${weekId}`) }}>もう一度</Button>
          <Button variant="secondary" onClick={() => { handleFinish(); navigate('/progress') }}>結果を保存して進捗へ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <QuizProgress currentIndex={session.currentIndex} total={session.total} score={session.score} />
      {session.currentWord && (
        <>
          <QuizQuestion
            word={session.currentWord}
            mode={session.mode}
            currentIndex={session.currentIndex}
            total={session.total}
          />
          <QuizChoices
            choices={session.choices}
            correctAnswer={mode === 'en_to_ja' ? session.currentWord.japanese : session.currentWord.english}
            selected={selected}
            onAnswer={handleAnswer}
          />
        </>
      )}
    </div>
  )
}
