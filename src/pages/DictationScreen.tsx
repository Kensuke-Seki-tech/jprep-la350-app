import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useWeeksConfig } from '@/hooks/useWeeks'
import { useAudio } from '@/hooks/useAudio'
import { AudioButton } from '@/components/common/AudioButton'
import { SpeedControl } from '@/components/common/SpeedControl'
import { Button } from '@/components/common/Button'
import type { WeekData, SentenceToRemember } from '@/types/word'

export default function DictationScreen() {
  const { weekId = 'week05' } = useParams()
  const navigate = useNavigate()
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)

  const { data: weekData } = useQuery<WeekData>({
    queryKey: ['weekFullData', weekId],
    queryFn: async () => {
      if (!week?.dataUrl) throw new Error('No data URL')
      const res = await fetch(week.dataUrl)
      if (!res.ok) throw new Error(`Failed to load ${weekId}`)
      return res.json()
    },
    enabled: !!week?.dataUrl,
    staleTime: Infinity,
  })

  const sentences = weekData?.sentencesToRemember ?? []
  const { isPlaying, currentSpeed, setSpeed, speak } = useAudio()
  const [revealedMap, setRevealedMap] = useState<Record<number, boolean>>({})
  const [showJaMap, setShowJaMap] = useState<Record<number, boolean>>({})

  const toggleReveal = (i: number) =>
    setRevealedMap(prev => ({ ...prev, [i]: !prev[i] }))
  const toggleJa = (i: number) =>
    setShowJaMap(prev => ({ ...prev, [i]: !prev[i] }))

  if (!weekData) {
    return <div className="py-8 text-center text-slate-400">Loading...</div>
  }

  if (sentences.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center text-center">
        <div className="text-5xl mb-4">&#128229;</div>
        <p className="text-slate-500">No dictation sentences for this week.</p>
        <Button variant="secondary" className="mt-6" onClick={() => navigate('/')}>Home</Button>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dictation</h2>
          <p className="text-sm text-slate-400">{week?.label} - Sentences to Remember</p>
        </div>
        <SpeedControl currentSpeed={currentSpeed} onSpeedChange={setSpeed} showDictation={false} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
        <span className="text-lg">&#9999;</span>
        <p className="text-sm text-amber-700 font-medium">Listen and write the sentence in your notebook. Then tap to check your answer.</p>
      </div>

      <div className="space-y-4">
        {sentences.map((s: SentenceToRemember, i: number) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Sentence {i + 1}
              </span>
              <div className="flex items-center gap-2">
                <AudioButton
                  text={s.text}
                  speed={currentSpeed}
                  isPlaying={isPlaying}
                  onSpeak={speak}
                  size="md"
                />
              </div>
            </div>

            {revealedMap[i] ? (
              <div
                className="rounded-xl px-4 py-3 mb-3 bg-green-50 border border-green-200 cursor-pointer"
                onClick={() => toggleReveal(i)}
                title="Tap to hide"
              >
                <p className="text-base font-semibold text-slate-800 leading-relaxed">
                  {s.text}
                </p>
              </div>
            ) : (
              <button
                className="w-full rounded-xl px-4 py-3 mb-3 bg-slate-100 border border-dashed border-slate-300 text-slate-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all"
                onClick={() => toggleReveal(i)}
              >
                <span>&#128065;</span> Show Answer
              </button>
            )}

            {s.ja && (
              <div>
                <button
                  onClick={() => toggleJa(i)}
                  className="text-xs text-blue-500 underline mb-1"
                >
                  {showJaMap[i] ? 'Hide Japanese' : 'Show Japanese'}
                </button>
                {showJaMap[i] && (
                  <p className="text-sm text-slate-500 leading-relaxed">{s.ja}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => speak(sentences.map((s: SentenceToRemember) => s.text).join(' ... '), currentSpeed)}
          className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          Play All Sentences
        </button>
      </div>

      <div className="mt-3">
        <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
          Home
        </Button>
      </div>
    </div>
  )
}
