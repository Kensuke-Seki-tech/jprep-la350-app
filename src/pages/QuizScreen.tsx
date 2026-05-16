import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useActivityLog } from '@/hooks/useActivityLog'
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

type FilterMode = 'all' | 'wrong'

export default function QuizScreen() {
  const { weekId = 'week05' } = useParams()
  useActivityLog('quiz', weekId)
  const navigate = useNavigate()
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)
  const { data: words } = useWordData(weekId, week?.dataUrl ?? null)
  const currentUser = useCurrentUser()
  const { saveQuizResult, getWeekBestScore, getLastQuizWrongWordIds, getQuizScores } = useProgress(currentUser?.userId ?? null)

  const [started, setStarted] = useState(false)
  const [mode, setMode] = useState<QuizMode>('en_to_ja')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [savedBest] = useState(() => getWeekBestScore(weekId))

  const wrongIds = useMemo(
    () => getLastQuizWrongWordIds(weekId, mode),
    [getLastQuizWrongWordIds, weekId, mode]
  )

  const hasLastSession = useMemo(
    () => getQuizScores().some(s => s.weekId === weekId && s.mode === mode),
    [getQuizScores, weekId, mode]
  )

  const wrongDisabled = wrongIds.length === 0
  const wrongLabel = wrongDisabled
    ? hasLastSession ? '前回全問正解！' : '前回データなし'
    : `${wrongIds.length}語`

  const filteredWords = useMemo(
    () => filterMode === 'wrong' && wrongIds.length > 0
      ? (words ?? []).filter(w => wrongIds.includes(w.id))
      : (words ?? []),
    [filterMode, wrongIds, words]
  )

  const session = useQuizSession(filteredWords, mode, words ?? [])

  useEffect(() => {
    if (!selected) return
    const t = setTimeout(() => {
      session.nextQuestion()
      setSelected(null)
    }, 2000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const handleAnswer = (ans: string) => {
    if (selected) return
    session.answerQuestion(ans)
    setSelected(ans)
  }

  const handleStart = () => {
    session.reset()
    setStarted(true)
  }

  const handleFinish = () => {
    saveQuizResult({
      weekId,
      score: session.score,
      total: session.total,
      percentage: session.percentage,
      mode: session.mode,
      durationSec: session.durationSec,
      answers: session.answers.map(a => ({ wordId: a.wordId, correct: a.correct })),
    })
  }

  if (!words) return <div className="py-8 text-center text-slate-400">読み込み中...</div>

  if (!started) {
    return (
      <div className="py-8 flex flex-col items-center">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">クイズ</h2>
        <p className="text-slate-500 mb-6">{week?.label} — {words.length}語</p>

        <div className="w-full max-w-xs mb-4">
          <p className="text-sm font-semibold text-slate-600 mb-2">出題形式</p>
          <div className="flex gap-3">
            {(['en_to_ja', 'ja_to_en', 'en_to_en'] as QuizMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  mode === m ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600'
                }`}
              >
                {m === 'en_to_ja' ? '英→日' : m === 'ja_to_en' ? '日→英' : '英→英'}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-xs mb-6">
          <p className="text-sm font-semibold text-slate-600 mb-2">出題範囲</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left ${
                filterMode === 'all'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              全問 ({words.length}語)
            </button>
            <button
              onClick={() => !wrongDisabled && setFilterMode('wrong')}
              disabled={wrongDisabled}
              className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left ${
                wrongDisabled
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : filterMode === 'wrong'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-600 bg-white'
              }`}
            >
              前回間違えた問題 ({wrongLabel})
            </button>
          </div>
        </div>

        <Button size="lg" onClick={handleStart} className="w-full max-w-xs">スタート</Button>
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

  const correctAnswer = session.currentWord
    ? mode === 'en_to_ja' ? session.currentWord.japanese
      : mode === 'ja_to_en' ? session.currentWord.english
      : session.currentWord.englishDef
    : ''

  const isCorrect = selected !== null && selected === correctAnswer

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
            correctAnswer={correctAnswer}
            selected={selected}
            onAnswer={handleAnswer}
          />
          {selected && (
            <div className={`mt-4 px-5 py-3 rounded-xl text-center font-bold text-base ${
              isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isCorrect ? '✅ 正解！' : `❌ 不正解 — 正解: ${correctAnswer}`}
            </div>
          )}
        </>
      )}
    </div>
  )
}
