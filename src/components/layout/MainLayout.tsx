import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-blue-50">
      <Header />
      <main className="pt-14 pb-20 max-w-lg mx-auto px-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
