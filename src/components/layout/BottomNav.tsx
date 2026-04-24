import { NavLink, useLocation } from 'react-router-dom'
import { useWeekStore } from '@/hooks/useWeeks'

const tabs = [
  { to: '/', label: 'Home', icon: 'home', exact: true },
  { to: '/etymology', label: 'Roots', icon: 'roots', exact: true },
  { to: '/flashcard', label: 'Cards', icon: 'card' },
  { to: '/quiz', label: 'Quiz', icon: 'quiz' },
  { to: '/wordlist', label: 'Words', icon: 'list' },
  { to: '/progress', label: 'Progress', icon: 'chart', exact: true },
]

const iconMap: Record<string, string> = {
  home: '🏠',
  roots: '🔬',
  card: '🃏',
  quiz: '📝',
  list: '📖',
  chart: '📊',
}

export function BottomNav() {
  const { currentWeekId } = useWeekStore()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom z-10">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(tab => {
          const to = tab.exact ? tab.to : `${tab.to}/${currentWeekId}`
          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to)
          return (
            <NavLink
              key={tab.to}
              to={to}
              className={`flex-1 flex flex-col items-center py-2 pt-3 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <span className="text-xl leading-none mb-1">{iconMap[tab.icon]}</span>
              {tab.label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
