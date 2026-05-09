import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/useUserStore'

export function useActivityLog(mode: string, weekId: string | null) {
  const currentUser = useCurrentUser()
  const logged = useRef(false)

  useEffect(() => {
    if (!currentUser || logged.current) return
    logged.current = true
    supabase
      .from('activity_logs')
      .insert({ user_name: currentUser.displayName, mode, week_id: weekId })
      .then(({ error }) => {
        if (error) console.error('[activity_log] insert failed:', error.message)
        else console.log('[activity_log] logged:', mode, weekId)
      })
  }, [currentUser, mode, weekId])
}
