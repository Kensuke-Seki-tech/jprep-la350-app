import { useState } from 'react'
import type { Word } from '@/types/word'
import { AudioButton } from '@/components/common/AudioButton'
import { useAudio } from '@/hooks/useAudio'

const posLabel: Record<string, string> = {
  n: 'noun', adj: 'adj', v: 'verb', adv: 'adv', phrase: 'ph', other: 'etc'
}
const posColor: Record<string, string> = {
  n: 'bg-blue-100 text-blue-700',
  adj: 'bg-purple-100 text-purple-700',
  v: 'bg-green-100 text-green-700',
  adv: 'bg-orange-100 text-orange-700',
  phrase: 'bg-pink-100 text-pink-700',
  other: 'bg-slate-100 text-slate-600',
}

interface WordListItemProps {
  word: Word
  index: number
  currentSpeed?: 1.0 | 0.7 | 0.5
}

export function WordListItem({ word, index, currentSpeed = 1.0 }: WordListItemProps) {
  const [open, setOpen] = useState(false)
  const { isPlaying, speak } = useAudio()

  return (
    <div className="bg-white rounded-xl mb-2 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-slate-400 text-sm w-6 text-right flex-shrink-0">{index + 1}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${posColor[word.partOfSpeech] ?? posColor.other}`}>
          {posLabel[word.partOfSpeech] ?? 'etc'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{word.english}</span>
            {word.emoji && <span className="text-base">{word.emoji}</span>}
          </div>
          {word.ipa && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-blue-500 font-mono text-xs">{word.ipa}</span>
              <span onClick={e => e.stopPropagation()}>
                <AudioButton
                  text={word.english}
                  speed={currentSpeed}
                  isPlaying={isPlaying}
                  onSpeak={(text, speed) => { speak(text, speed) }}
                  size="sm"
                />
              </span>
              {word.katakana && (
                <span className="text-gray-400 text-xs hidden sm:inline">{word.katakana}</span>
              )}
            </div>
          )}
        </div>
        <span className="text-slate-500 text-sm ml-2 flex-shrink-0">{word.japanese}</span>
        <span className="text-slate-300 ml-1">{open ? '...' : '+'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-2 space-y-2">
          <p className="text-sm text-slate-500 italic">{word.englishDef}</p>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm text-slate-600">{word.exampleEn}</p>
              <p className="text-xs text-slate-400 mt-0.5">{word.exampleJa}</p>
            </div>
            <AudioButton
              text={word.exampleEn}
              speed={currentSpeed}
              isPlaying={isPlaying}
              onSpeak={(text, speed) => { speak(text, speed) }}
              size="sm"
            />
          </div>
          {word.etymology && (
            <div className="bg-gray-50 rounded-lg p-2 mt-1">
              <p className="text-xs text-gray-500 font-medium mb-1">Etymology</p>
              <div className="flex flex-wrap gap-1">
                {word.etymology.morphemes.map((m, i) => (
                  <span key={i} className={`text-xs px-1.5 py-0.5 rounded border
                    ${m.type === 'prefix' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      m.type === 'root' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-orange-50 text-orange-700 border-orange-200'}`}>
                    {m.part} ({m.meaning})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
