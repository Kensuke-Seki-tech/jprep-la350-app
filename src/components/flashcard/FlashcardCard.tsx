import { useState, useEffect } from 'react'
import type { Word } from '@/types/word'
import { Button } from '@/components/common/Button'
import { AudioButton } from '@/components/common/AudioButton'
import { SpeedControl } from '@/components/common/SpeedControl'
import { useAudio } from '@/hooks/useAudio'

interface Props {
  word: Word
  index: number
  total: number
  onResult: (result: 'correct' | 'incorrect') => void
}

const posLabel: Record<string, string> = {
  n: 'noun', adj: 'adj', v: 'verb', adv: 'adv', phrase: 'phrase', other: 'other'
}

export function FlashcardCard({ word, index, total, onResult }: Props) {
  const [flipped, setFlipped] = useState(false)
  const { isPlaying, currentSpeed, setSpeed, speak } = useAudio()

  useEffect(() => {
    speak(word.english, currentSpeed)
    setFlipped(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id])

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true)
      setTimeout(() => speak(word.english, currentSpeed), 200)
    }
  }

  const handleResult = (r: 'correct' | 'incorrect') => {
    setFlipped(false)
    setTimeout(() => onResult(r), 50)
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-sm text-slate-500 mb-3">
        <span>{index + 1} / {total}</span>
        <SpeedControl currentSpeed={currentSpeed} onSpeedChange={setSpeed} showDictation={false} />
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
          {posLabel[word.partOfSpeech] ?? word.partOfSpeech}
        </span>
      </div>

      <div
        className="flip-card w-full cursor-pointer"
        onClick={handleFlip}
        role="button"
        aria-label={flipped ? word.japanese : word.english}
      >
        <div className={`flip-inner relative ${flipped ? 'flipped' : ''}`} style={{ minHeight: 280 }}>

          <div className="flip-front absolute inset-0 bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-slate-800 text-center mb-2">{word.english}</p>
            {word.ipa && (
              <div className="flex items-center gap-2 mb-2" onClick={e => e.stopPropagation()}>
                <span className="text-blue-500 font-mono text-sm">{word.ipa}</span>
                <AudioButton
                  text={word.english}
                  speed={currentSpeed}
                  isPlaying={isPlaying}
                  onSpeak={speak}
                  size="md"
                />
              </div>
            )}
            {word.emoji && <span className="text-5xl mb-2">{word.emoji}</span>}
            <p className="text-slate-400 text-sm text-center">{word.englishDef}</p>
            <p className="text-blue-400 text-xs mt-4">Tap to reveal</p>
          </div>

          <div className="flip-back absolute inset-0 bg-blue-600 rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-white">
            <div className="flex items-center gap-2 mb-2">
              {word.emoji && <span className="text-3xl">{word.emoji}</span>}
              <p className="text-2xl font-bold text-center">{word.japanese}</p>
            </div>
            <hr className="border-blue-400 w-full my-3" />
            <div className="flex items-start gap-2 w-full" onClick={e => e.stopPropagation()}>
              <div className="flex-1">
                <p className="text-sm text-blue-100 italic text-center leading-relaxed mb-1">{word.exampleEn}</p>
                <p className="text-xs text-blue-200 text-center">{word.exampleJa}</p>
              </div>
              <AudioButton
                text={word.exampleEn}
                speed={currentSpeed}
                isPlaying={isPlaying}
                onSpeak={speak}
                size="sm"
                className="flex-shrink-0 bg-blue-400 text-white hover:bg-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3 mt-4">
          <Button variant="danger" className="flex-1" onClick={() => handleResult('incorrect')}>
            Again
          </Button>
          <Button variant="success" className="flex-1" onClick={() => handleResult('correct')}>
            Got it!
          </Button>
        </div>
      )}
      {!flipped && (
        <Button variant="ghost" className="w-full mt-4" onClick={handleFlip}>
          Tap to reveal meaning
        </Button>
      )}
    </div>
  )
}
