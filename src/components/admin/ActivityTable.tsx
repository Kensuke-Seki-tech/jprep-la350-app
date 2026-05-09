const MODE_LABELS: Record<string, string> = {
  etymology: '語源',
  flashcard: 'フラッシュカード',
  quiz: 'クイズ',
  predicted_quiz: '予想問題',
  wordlist: '単語一覧',
  dictation: 'ディクテーション',
}

export interface AggregatedRow {
  date: string
  user_name: string
  mode: string
  week_id: string | null
  count: number
}

interface Props {
  rows: AggregatedRow[]
}

export function ActivityTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-4">データなし</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-left border-b border-slate-100">
            <th className="pb-2 pr-4 font-medium">日付</th>
            <th className="pb-2 pr-4 font-medium">ユーザー</th>
            <th className="pb-2 pr-4 font-medium">モード</th>
            <th className="pb-2 pr-4 font-medium">Week</th>
            <th className="pb-2 font-medium text-right">回数</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-2 pr-4 text-slate-600">{row.date}</td>
              <td className="py-2 pr-4 font-medium text-slate-800">{row.user_name}</td>
              <td className="py-2 pr-4 text-slate-600">{MODE_LABELS[row.mode] ?? row.mode}</td>
              <td className="py-2 pr-4 text-slate-500">{row.week_id ?? '—'}</td>
              <td className="py-2 font-bold text-blue-600 text-right">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
