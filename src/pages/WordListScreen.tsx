import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useWeeksConfig } from '@/hooks/useWeeks'
import { useWordData } from '@/hooks/useWordData'
import { WordListItem } from '@/components/wordlist/WordListItem'
import { SpeedControl } from '@/components/common/SpeedControl'
import { useAudio } from '@/hooks/useAudio'
import type { AudioSpeed } from '@/types/word'

export default function WordListScreen() {
  const { weekId = 'week05' } = useParams()
  useActivityLog('wordlist', weekId)
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)
  const { data: wordData, isLoading } = useWordData(weekId, week?.dataUrl ?? null)
  const words = wordData ?? []
  const [search, setSearch] = useState('')
  const { currentSpeed, setSpeed } = useAudio()

  const filtered = words.filter(w =>
    w.english.toLowerCase().includes(search.toLowerCase()) ||
    w.japanese.includes(search)
  )

  if (isLoading) return <div className="py-8 text-center text-slate-400">Loading...</div>

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-slate-800">{week?.label}</h2>
        <span className="text-sm text-slate-400">{filtered.length} words</span>
      </div>

      <div className="mb-3 flex justify-end">
        <SpeedControl
          currentSpeed={currentSpeed}
          onSpeedChange={setSpeed}
          showDictation={true}
        />
      </div>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search..."
        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
      />

      <div>
        {filtered.map((word, i) => (
          <WordListItem
            key={word.id}
            word={word}
            index={i}
            currentSpeed={currentSpeed as AudioSpeed}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-8">No words found</p>
        )}
      </div>
    </div>
  )
}
