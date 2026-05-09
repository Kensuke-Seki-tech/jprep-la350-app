import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useWeeksConfig } from '@/hooks/useWeeks'
import { useWordData } from '@/hooks/useWordData'
import { useCurrentUser } from '@/hooks/useUserStore'
import { useProgress } from '@/hooks/useProgress'
import { shuffleArray } from '@/utils/quiz'
import type { FlashcardMode } from '@/utils/quiz'
import { FlashcardCard } from '@/components/flashcard/FlashcardCard'
import { Button } from '@/components/common/Button'
import { ProgressBar } from '@/components/common/ProgressBar'

type CardResult = { wordId: string; result: 'correct' | 'incorrect' }

const MODES: { value: FlashcardMode; label: string; desc: string }[] = [
  { value: 'en_to_ja', label: '英 → 日', desc: '英単語を見て日本語を答える' },
  { value: 'ja_to_en', label: '日 → 英', desc: '日本語を見て英単語を答える' },
  { value: 'en_to_en', label: '英 → 英', desc: '英単語を見て英語定義を答える' },
]

export default function FlashcardScreen() {
  const { weekId = 'week05' } = useParams()
  useActivityLog('flashcard', weekId)
  const navigate = useNavigate()
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)
  const { data: words } = useWordData(weekId, week?.dataUrl ?? null)
  const currentUser = useCurrentUser()
  const { saveFlashcardResult } = useProgress(currentUser?.userId ?? null)

  const [cards, setCards] = useState<typeof words>()
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<CardResult[]>([])
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mode, setMode] = useState<FlashcardMode>('en_to_ja')

  const start = () => {
    if (!words) return
    setCards(shuffleArray(words))
    setIndex(0)
    setResults([])
    setStarted(true)
    setFinished(false)
  }

  const handleResult = (result: 'correct' | 'incorrect') => {
    if (!cards) return
    const word = cards[index]
    if (!word) return
    const newResults = [...results, { wordId: word.id, result }]
    setResults(newResults)

    if (index >= cards.length - 1) {
      const correctCount = newResults.filter(r => r.result === 'correct').length
      saveFlashcardResult({
        weekId,
        correctCount,
        totalCount: cards.length,
        results: newResults.map(r => ({ ...r, result: r.result })),
      })
      setFinished(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  const currentCard = cards?.[index]
  const correctCount = results.filter(r => r.result === 'correct').length
  const total = cards?.length ?? 0
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0

  if (!words) return <div className="py-8 text-center text-slate-400">読み込み中...</div>

  if (!started) {
    return (
      <div className="py-8 flex flex-col items-center">
        <div className="text-6xl mb-4">🃏</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">フラッシュカード</h2>
        <p className="text-slate-500 mb-6">{week?.label} — {words.length}語</p>

        <div className="w-full max-w-xs mb-6">
          <p className="text-sm font-semibold text-slate-600 mb-2">学習モード</p>
          <div className="flex flex-col gap-2">
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`w-full py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors text-left flex items-center gap-3 ${
                  mode === m.value
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 bg-white'
                }`}
              >
                <span className="text-base font-bold w-16">{m.label}</span>
                <span className={`text-xs ${mode === m.value ? 'text-blue-100' : 'text-slate-400'}`}>{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <Button size="lg" onClick={start} className="w-full max-w-xs">スタート</Button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="py-8 flex flex-col items-center text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">完了！</h2>
        <p className="text-5xl font-bold text-blue-600 mb-1">{pct}%</p>
        <p className="text-slate-500 mb-2">{correctCount} / {total} 語 覚えた</p>
        <ProgressBar value={pct} className="w-full max-w-xs mb-8" />
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={start}>もう一度</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>ホームへ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <ProgressBar value={total > 0 ? (index / total) * 100 : 0} className="mb-4" />
      {currentCard && (
        <FlashcardCard
          word={currentCard}
          index={index}
          total={total}
          mode={mode}
          onResult={handleResult}
        />
      )}
    </div>
  )
}
