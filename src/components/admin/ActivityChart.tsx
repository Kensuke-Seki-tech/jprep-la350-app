const MODE_LABELS: Record<string, string> = {
  etymology: '語源',
  flashcard: 'フラッシュカード',
  quiz: 'クイズ',
  predicted_quiz: '予想問題',
  wordlist: '単語一覧',
  dictation: 'ディクテーション',
}

interface Props {
  data: { mode: string; count: number }[]
}

export function ActivityChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-4">データなし</p>
  }
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.mode} className="flex items-center gap-3">
          <span className="text-sm text-slate-600 w-28 text-right flex-shrink-0">
            {MODE_LABELS[item.mode] ?? item.mode}
          </span>
          <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${Math.max((item.count / max) * 100, 4)}%` }}
            >
              <span className="text-xs text-white font-bold">{item.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
