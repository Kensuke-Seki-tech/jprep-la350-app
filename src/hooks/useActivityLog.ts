import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/useUserStore'

export function useActivityLog(mode: string, weekId: string | null) {
  const currentUser = useCurrentUser()

  useEffect(() => {
    if (!currentUser) return
    supabase
      .from('activity_logs')
      .insert({ user_name: currentUser.displayName, mode, week_id: weekId })
      .then(({ error }) => {
        if (error) console.warn('[activity_log]', error.message)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
