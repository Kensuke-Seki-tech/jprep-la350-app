import type { ReactNode } from 'react'
import { useUserStore } from '@/hooks/useUserStore'
import { UserSelectScreen } from './UserSelectScreen'

export function AuthGate({ children }: { children: ReactNode }) {
  const currentUserId = useUserStore(s => s.currentUserId)
  if (!currentUserId) return <UserSelectScreen />
  return <>{children}</>
}
