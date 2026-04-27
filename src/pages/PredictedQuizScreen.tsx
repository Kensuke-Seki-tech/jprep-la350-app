import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeeksConfig } from '@/hooks/useWeeks'
import { useAudio } from '@/hooks/useAudio'
import { Button } from '@/components/common/Button'

// ── Data types ──────────────────────────────────────────────
interface MatchItem  { word: string; def: string }
interface GapItem    { answer: string; sentence: string; ja: string }
interface MCItem     { q: string; opts: string[]; answer: number; word: string }
interface DictItem   { text: string; word: string }

interface QuizData {
  weekId: string
  match: MatchItem[]
  gap: GapItem[]
  bank: string[]
  mc: MCItem[]
  dict: DictItem[]
}

type Phase = 'intro' | 'part1' | 'part2' | 'part3' | 'part4' | 'result'

// ── Score constants ──────────────────────────────────────────
const MATCH_PTS = 2
const GAP_PTS   = 2
const MC_PTS    = 2
const DICT_PTS  = 3

// ── Helpers ──────────────────────────────────────────────────
function shuffled<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ── Main component ───────────────────────────────────────────
export default function PredictedQuizScreen() {
  const { weekId = 'week05' } = useParams()
  const navigate = useNavigate()
  const { data: weeks } = useWeeksConfig()
  const week = weeks?.find(w => w.weekId === weekId)

  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [phase, setPhase]       = useState<Phase>('intro')

  const [score, setScore]       = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const scoreRef    = useRef(0)
  const maxScoreRef = useRef(0)
  const addScore = (pts: number) => {
    scoreRef.current += pts
    maxScoreRef.current += Math.abs(pts) // not used inline but tracked in maxScore state
    setScore(s => s + pts)
  }

  // Load quiz data
  useEffect(() => {
    const url = `/data/${weekId}.quiz.json`
    fetch(url)
      .then(r => r.json())
      .then((d: QuizData) => {
        setQuizData(d)
        const ms = d.match.length * MATCH_PTS + d.gap.length * GAP_PTS + d.mc.length * MC_PTS + d.dict.length * DICT_PTS
        setMaxScore(ms)
        maxScoreRef.current = ms
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [weekId])

  if (loading) return <div className="py-8 text-center text-slate-400">読み込み中...</div>
  if (!quizData) return <div className="py-8 text-center text-slate-400">データが見つかりません</div>

  // ── Phase renderers ──
  if (phase === 'intro') {
    return (
      <div className="py-8 flex flex-col items-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">{week?.label} 予想問題</h2>
        <p className="text-slate-500 mb-6">LA350 の単語で腕試し！</p>
        <div className="w-full max-w-xs space-y-2 mb-8">
          {[
            { part: 'Part 1', icon: '🔗', title: 'Vocabulary Matching', desc: `${quizData.match.length}問 — 単語と定義を対応させよう` },
            { part: 'Part 2', icon: '📝', title: 'Sentence Gap Fill',   desc: `${quizData.gap.length}問 — 空欄を埋めよう` },
            { part: 'Part 3', icon: '💡', title: 'Multiple Choice',     desc: `${quizData.mc.length}問 — 意味を選ぼう` },
            { part: 'Part 4', icon: '🎧', title: 'Dictation',           desc: `${quizData.dict.length}問 — 音声を書き取ろう` },
          ].map(item => (
            <div key={item.part} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.part}: {item.title}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-400 mb-4">満点: {maxScore}点</p>
        <Button size="lg" onClick={() => setPhase('part1')} className="w-full max-w-xs">スタート</Button>
      </div>
    )
  }

  if (phase === 'part1') {
    return (
      <Part1Matching
        items={quizData.match}
        onComplete={(pts) => { addScore(pts); setPhase('part2') }}
      />
    )
  }

  if (phase === 'part2') {
    return (
      <Part2GapFill
        items={quizData.gap}
        bank={quizData.bank}
        onComplete={(pts) => { addScore(pts); setPhase('part3') }}
      />
    )
  }

  if (phase === 'part3') {
    return (
      <Part3MultipleChoice
        items={quizData.mc}
        onComplete={(pts) => { addScore(pts); setPhase('part4') }}
      />
    )
  }

  if (phase === 'part4') {
    return (
      <Part4Dictation
        items={quizData.dict}
        onComplete={(pts) => { addScore(pts); setPhase('result') }}
      />
    )
  }

  // Result
  const pct = maxScore > 0 ? Math.max(0, Math.min(100, Math.round(score / maxScore * 100))) : 0
  let emoji = '🌱', title = "Let's Try Again!", msg = '焦らず、発音を聴きながら一語ずつ覚えよう！'
  if (pct >= 90) { emoji = '🏆'; title = 'Outstanding!!'; msg = '完璧！本番のクイズも余裕で合格できそう！' }
  else if (pct >= 75) { emoji = '🎉'; title = 'Great Job!'; msg = 'よくできました！間違えた問題を復習しよう。' }
  else if (pct >= 55) { emoji = '💪'; title = 'Good Try!'; msg = 'もうひと息！単語リストで確認してから再挑戦しよう。' }
  else if (pct >= 30) { emoji = '📚'; title = 'Keep Going!'; msg = '単語学習に戻って基礎を固めよう！' }

  return (
    <div className="py-8 flex flex-col items-center text-center">
      <div className="text-6xl mb-3">{emoji}</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">{title}</h2>
      <p className="text-5xl font-bold text-blue-600 mb-1">{pct}%</p>
      <p className="text-slate-500 mb-1">{score} / {maxScore} 点</p>
      <p className="text-sm text-slate-400 mb-6">{msg}</p>
      <div className="w-full max-w-xs space-y-2 mb-6 text-left">
        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 space-y-1">
          <p>Part 1 マッチング: 満点 {quizData.match.length * MATCH_PTS}点</p>
          <p>Part 2 穴埋め: 満点 {quizData.gap.length * GAP_PTS}点</p>
          <p>Part 3 選択問題: 満点 {quizData.mc.length * MC_PTS}点</p>
          <p>Part 4 ディクテーション: 満点 {quizData.dict.length * DICT_PTS}点</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button onClick={() => { setScore(0); scoreRef.current = 0; setPhase('intro') }}>もう一度</Button>
        <Button variant="secondary" onClick={() => navigate('/')}>ホームへ</Button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Part 1: Vocabulary Matching
// ══════════════════════════════════════════════════════════════
function Part1Matching({ items, onComplete }: { items: MatchItem[]; onComplete: (pts: number) => void }) {
  const [wordOrder] = useState(() => shuffled(items))
  const [defOrder]  = useState(() => shuffled(items))
  const [matched, setMatched]       = useState<Set<string>>(new Set())
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedDef,  setSelectedDef]  = useState<string | null>(null)
  const [wrongPair, setWrongPair]       = useState<{ word: string; def: string } | null>(null)
  const [pts, setPts] = useState(0)

  const tryMatch = (word: string, def: string) => {
    const defItem = items.find(i => i.word === word)
    if (defItem && defItem.def === def) {
      const next = new Set(matched)
      next.add(word)
      setMatched(next)
      setPts(p => p + MATCH_PTS)
      setSelectedWord(null)
      setSelectedDef(null)
    } else {
      setWrongPair({ word, def })
      setPts(p => p - 1)
    }
  }

  useEffect(() => {
    if (!wrongPair) return
    const id = window.setTimeout(() => {
      setWrongPair(null)
      setSelectedWord(null)
      setSelectedDef(null)
    }, 500)
    return () => clearTimeout(id)
  }, [wrongPair])

  const handleWord = (word: string) => {
    if (matched.has(word)) return
    const newWord = word
    if (selectedDef) {
      tryMatch(newWord, selectedDef)
    } else {
      setSelectedWord(newWord)
    }
  }

  const handleDef = (defWord: string, def: string) => {
    if (matched.has(defWord)) return
    if (selectedWord) {
      tryMatch(selectedWord, def)
    } else {
      setSelectedDef(def)
    }
  }

  const allMatched = matched.size === items.length

  return (
    <div className="py-4">
      <PartHeader part={1} title="Vocabulary Matching" desc="単語をタップ→定義をタップして対応させよう" />
      <div className="mb-4 text-right text-sm text-slate-500">{matched.size} / {items.length} マッチ完了</div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Words column */}
        <div className="space-y-2">
          {wordOrder.map(item => {
            const isMatched  = matched.has(item.word)
            const isSelected = selectedWord === item.word
            const isWrong    = wrongPair?.word === item.word
            return (
              <button
                key={item.word}
                onClick={() => handleWord(item.word)}
                disabled={isMatched}
                className={`w-full py-3 px-3 rounded-xl text-sm font-bold transition-all text-center
                  ${isMatched  ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                    isWrong    ? 'bg-red-100 text-red-700 border-2 border-red-400' :
                    isSelected ? 'bg-blue-600 text-white border-2 border-blue-600' :
                                 'bg-white text-slate-800 border-2 border-slate-200 active:scale-95'}`}
              >
                {item.word}
              </button>
            )
          })}
        </div>

        {/* Definitions column */}
        <div className="space-y-2">
          {defOrder.map((item, idx) => {
            const isMatched  = matched.has(item.word)
            const isSelected = selectedDef === item.def
            const isWrong    = wrongPair?.def === item.def
            return (
              <button
                key={item.word}
                onClick={() => handleDef(item.word, item.def)}
                disabled={isMatched}
                className={`w-full py-3 px-3 rounded-xl text-xs transition-all text-left
                  ${isMatched  ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                    isWrong    ? 'bg-red-100 text-red-700 border-2 border-red-400' :
                    isSelected ? 'bg-blue-600 text-white border-2 border-blue-600' :
                                 'bg-white text-slate-700 border-2 border-slate-200 active:scale-95'}`}
              >
                <span className="font-bold mr-1">{idx + 1}.</span>{item.def}
              </button>
            )
          })}
        </div>
      </div>

      {allMatched && (
        <div className="text-center">
          <p className="text-green-600 font-bold mb-4">全問マッチ完了！🎉</p>
          <Button onClick={() => onComplete(pts)} className="w-full max-w-xs">Part 2 へ</Button>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Part 2: Sentence Gap Fill
// ══════════════════════════════════════════════════════════════
function Part2GapFill({ items, bank, onComplete }: { items: GapItem[]; bank: string[]; onComplete: (pts: number) => void }) {
  const { speak } = useAudio()
  const [filled, setFilled]         = useState<(string | null)[]>(Array(items.length).fill(null))
  const [results, setResults]       = useState<(boolean | null)[]>(Array(items.length).fill(null))
  const [selectedBlank, setSelectedBlank] = useState<number | null>(null)
  const [usedWords, setUsedWords]   = useState<Set<string>>(new Set())
  const [wrongBlank, setWrongBlank] = useState<number | null>(null)
  const [pts, setPts] = useState(0)

  const doneCount = results.filter(r => r !== null).length

  const selectBlank = (i: number) => {
    if (results[i] === true) return
    setSelectedBlank(i)
  }

  const pickWord = (word: string) => {
    if (usedWords.has(word)) return
    if (selectedBlank === null) return
    const item = items[selectedBlank]
    const correct = word.toLowerCase() === item.answer.toLowerCase()
    const newFilled  = [...filled];  newFilled[selectedBlank]  = word
    const newResults = [...results]; newResults[selectedBlank] = correct
    setFilled(newFilled)
    setResults(newResults)
    if (correct) {
      setUsedWords(prev => new Set([...prev, word]))
      setPts(p => p + GAP_PTS)
    } else {
      setPts(p => p - 1)
      setWrongBlank(selectedBlank)
    }
    setSelectedBlank(null)
  }

  useEffect(() => {
    if (wrongBlank === null) return
    const blank = wrongBlank
    const id = window.setTimeout(() => {
      setFilled(prev => { const next = [...prev]; next[blank] = null; return next })
      setResults(prev => { const next = [...prev]; next[blank] = null; return next })
      setWrongBlank(null)
    }, 600)
    return () => clearTimeout(id)
  }, [wrongBlank])

  const allDone = doneCount === items.length

  return (
    <div className="py-4">
      <PartHeader part={2} title="Sentence Gap Fill" desc="空欄をタップ→下の単語を選んで埋めよう" />

      {/* Word bank */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4">
        <p className="text-xs text-slate-400 mb-2 font-medium">単語バンク</p>
        <div className="flex flex-wrap gap-2">
          {bank.map(word => (
            <button
              key={word}
              onClick={() => pickWord(word)}
              disabled={usedWords.has(word)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
                ${usedWords.has(word)
                  ? 'bg-slate-200 text-slate-400 line-through'
                  : 'bg-white border-2 border-slate-200 text-slate-700 active:scale-95 hover:border-blue-400'}`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Sentences */}
      <div className="space-y-3 mb-6">
        {items.map((item, i) => {
          const parts = item.sentence.split(new RegExp(`\\b${item.answer}\\b`, 'i'))
          const isCorrect = results[i] === true
          const isWrong   = results[i] === false
          const isActive  = selectedBlank === i
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-blue-600 mt-1">Q{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {parts[0]}
                    <button
                      onClick={() => selectBlank(i)}
                      className={`inline-flex items-center justify-center min-w-[80px] px-2 py-0.5 mx-1 rounded border-2 font-bold text-sm transition-all
                        ${isCorrect ? 'border-green-400 bg-green-50 text-green-700' :
                          isWrong   ? 'border-red-400 bg-red-50 text-red-600' :
                          isActive  ? 'border-blue-500 bg-blue-50 text-blue-700' :
                                      'border-slate-300 bg-slate-50 text-slate-500'}`}
                    >
                      {filled[i] ?? '＿＿＿'}
                    </button>
                    {parts[1]}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-400 flex-1">{item.ja}</p>
                    <button
                      onClick={() => speak(item.sentence)}
                      className="text-blue-400 hover:text-blue-600 text-sm"
                      aria-label="発音を聴く"
                    >🔊</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="text-center">
          <Button onClick={() => onComplete(pts)} className="w-full max-w-xs">Part 3 へ</Button>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Part 3: Multiple Choice
// ══════════════════════════════════════════════════════════════
function Part3MultipleChoice({ items, onComplete }: { items: MCItem[]; onComplete: (pts: number) => void }) {
  const { speak } = useAudio()
  const [answers, setAnswers] = useState<(number | null)[]>(Array(items.length).fill(null))
  const [pts, setPts] = useState(0)

  const answeredCount = answers.filter(a => a !== null).length

  const pick = (qi: number, ji: number) => {
    if (answers[qi] !== null) return
    const correct = ji === items[qi].answer
    const next = [...answers]; next[qi] = ji
    setAnswers(next)
    setPts(p => p + (correct ? MC_PTS : -1))
  }

  const allDone = answeredCount === items.length

  return (
    <div className="py-4">
      <PartHeader part={3} title="Multiple Choice" desc="単語の意味として最も適切なものを選ぼう" />

      <div className="space-y-4 mb-6">
        {items.map((item, qi) => (
          <div key={qi} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-purple-600">Q{qi + 1}</span>
              <p className="text-sm font-bold text-slate-800 flex-1">{item.q}</p>
              <button onClick={() => speak(item.word)} className="text-blue-400 text-sm" aria-label="発音を聴く">🔊</button>
            </div>
            <div className="space-y-2">
              {item.opts.map((opt, ji) => {
                const answered = answers[qi] !== null
                const isSelected = answers[qi] === ji
                const isCorrect  = ji === item.answer
                let cls = 'bg-slate-50 border-slate-200 text-slate-700'
                if (answered) {
                  if (isCorrect)        cls = 'bg-green-500 border-green-500 text-white'
                  else if (isSelected)  cls = 'bg-red-500 border-red-500 text-white'
                  else                  cls = 'bg-slate-50 border-slate-100 text-slate-300'
                }
                return (
                  <button
                    key={ji}
                    onClick={() => pick(qi, ji)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${cls}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {allDone && (
        <div className="text-center">
          <Button onClick={() => onComplete(pts)} className="w-full max-w-xs">Part 4 へ</Button>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Part 4: Dictation
// ══════════════════════════════════════════════════════════════
function Part4Dictation({ items, onComplete }: { items: DictItem[]; onComplete: (pts: number) => void }) {
  const { speak } = useAudio()
  const [inputs,  setInputs]  = useState<string[]>(Array(items.length).fill(''))
  const [done,    setDone]    = useState<(boolean | null)[]>(Array(items.length).fill(null))
  const [revealed, setRevealed] = useState<boolean[]>(Array(items.length).fill(false))
  const [pts, setPts] = useState(0)

  const submit = (i: number) => {
    if (done[i] !== null) return
    const v = inputs[i].trim().toLowerCase().replace(/[^a-z0-9 ]/g, '')
    const a = items[i].text.toLowerCase().replace(/[^a-z0-9 ]/g, '')
    if (!v) return
    const aTok = a.split(/\s+/).filter(Boolean)
    const vTok = v.split(/\s+/).filter(Boolean)
    const hit = aTok.filter(t => vTok.includes(t)).length
    const ratio = hit / Math.max(1, aTok.length)

    const newDone = [...done]
    newDone[i] = ratio >= 0.5
    setDone(newDone)

    if (ratio >= 0.9)      setPts(p => p + DICT_PTS)
    else if (ratio >= 0.5) setPts(p => p + 1)
    else                   setPts(p => p - 1)
  }

  const reveal = (i: number) => {
    const newR = [...revealed]; newR[i] = true
    setRevealed(newR)
    if (done[i] === null) {
      const newDone = [...done]; newDone[i] = false
      setDone(newDone)
      setPts(p => p - 1)
    }
  }

  const allDone = done.every(d => d !== null)

  return (
    <div className="py-4">
      <PartHeader part={4} title="Dictation" desc="音声を聴いて文を書き取ろう" />

      <div className="space-y-4 mb-6">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-orange-600">Q{i + 1}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => speak(item.text, 1.0)}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  🔊 再生
                </button>
                <button
                  onClick={() => speak(item.text, 0.7)}
                  className="px-3 py-1.5 bg-blue-400 text-white rounded-lg text-xs font-semibold"
                >
                  🐢 ゆっくり
                </button>
                <button
                  onClick={() => reveal(i)}
                  className="px-3 py-1.5 bg-slate-400 text-white rounded-lg text-xs font-semibold"
                >
                  👁 答え
                </button>
              </div>
            </div>
            <input
              type="text"
              value={inputs[i]}
              onChange={e => { const next = [...inputs]; next[i] = e.target.value; setInputs(next) }}
              onKeyDown={e => { if (e.key === 'Enter') submit(i) }}
              placeholder="聴こえた文を書き取ろう..."
              disabled={done[i] !== null}
              className={`w-full px-3 py-2 rounded-lg border-2 text-sm mb-2 transition-colors
                ${done[i] === true  ? 'border-green-400 bg-green-50' :
                  done[i] === false ? 'border-red-400 bg-red-50' :
                                      'border-slate-200 bg-white focus:border-blue-400 outline-none'}`}
            />
            {revealed[i] && (
              <p className="text-xs text-slate-500 mb-2">答え: <span className="font-semibold text-slate-700">{item.text}</span></p>
            )}
            {done[i] === null && (
              <button
                onClick={() => submit(i)}
                className="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-semibold"
              >
                採点
              </button>
            )}
            {done[i] !== null && !revealed[i] && (
              <p className="text-xs text-slate-500">答え: <span className="font-semibold text-slate-700">{item.text}</span></p>
            )}
          </div>
        ))}
      </div>

      {allDone && (
        <div className="text-center">
          <Button onClick={() => onComplete(pts)} className="w-full max-w-xs">結果を見る</Button>
        </div>
      )}
    </div>
  )
}

// ── Shared header ────────────────────────────────────────────
function PartHeader({ part, title, desc }: { part: number; title: string; desc: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Part {part}</p>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  )
}
