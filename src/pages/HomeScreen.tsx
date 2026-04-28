import { useNavigate } from 'react-router-dom'
import { useWeekStore, useWeeksConfig } from '@/hooks/useWeeks'
import { useCurrentUser } from '@/hooks/useUserStore'
import { useWordData } from '@/hooks/useWordData'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { currentWeekId } = useWeekStore()
  const { data: weeks } = useWeeksConfig()
  const currentUser = useCurrentUser()
  const currentWeek = weeks?.find(w => w.weekId === currentWeekId)
  const { data: words } = useWordData(currentWeekId, currentWeek?.dataUrl ?? null)

  const menuItems = [
    { icon: '🔬', label: '語源学習', desc: '語根・接頭辞・イラストで覚える', path: '/etymology', color: 'bg-green-500' },
    { icon: '🃏', label: 'フラッシュカード', desc: '英→日・日→英・英→英 3モード', path: `/flashcard/${currentWeekId}`, color: 'bg-blue-500' },
    { icon: '📝', label: 'クイズ', desc: '4択で実力チェック', path: `/quiz/${currentWeekId}`, color: 'bg-purple-500' },
    { icon: '🎯', label: '予想問題', desc: 'マッチング・穴埋め・選択・ディクテーション', path: `/predicted-quiz/${currentWeekId}`, color: 'bg-red-500' },
    { icon: '📖', label: '単語一覧', desc: '例文付き全単語リスト', path: `/wordlist/${currentWeekId}`, color: 'bg-teal-500' },
    { icon: '✍', label: 'ディクテーション', desc: 'Sentences to Remember — テストに出る', path: `/dictation/${currentWeekId}`, color: 'bg-amber-500' },
    { icon: '📊', label: '進捗確認', desc: '学習の記録を見る', path: '/progress', color: 'bg-orange-500' },
  ]

  return (
    <div className="py-6">
      {currentUser && (
        <div className="mb-6">
          <p className="text-slate-500 text-sm">こんにちは、</p>
          <p className="text-2xl font-bold text-slate-800">{currentUser.displayName} さん</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4">
        <div className="text-4xl">📚</div>
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">現在の学習</p>
          <p className="text-xl font-bold text-slate-800">{currentWeek?.label ?? '...'}</p>
          <p className="text-sm text-slate-500">{words?.length ?? currentWeek?.wordCount ?? 0}語</p>
        </div>
      </div>

      <div className="space-y-3">
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 text-left hover:shadow-md active:scale-95 transition-all"
          >
            <span className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
              {item.icon}
            </span>
            <div>
              <p className="font-bold text-slate-800">{item.label}</p>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
            <span className="ml-auto text-slate-300 text-xl">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
