import type { Word } from '@/types/word'
import type { QuizMode } from '@/utils/quiz'

interface Props {
  word: Word
  mode: QuizMode
  currentIndex: number
  total: number
}

export function QuizQuestion({ word, mode, currentIndex, total }: Props) {
  const question = mode === 'en_to_ja' ? word.english : word.japanese
  const sub = mode === 'en_to_ja' ? word.englishDef : ''

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
      <p className="text-xs text-slate-400 mb-1">{currentIndex + 1} / {total}</p>
      <p className="text-3xl font-bold text-slate-800 mb-2">{question}</p>
      {sub && <p className="text-sm text-slate-400 italic">{sub}</p>}
    </div>
  )
}
