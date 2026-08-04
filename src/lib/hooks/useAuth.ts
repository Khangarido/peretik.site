'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as AppUser } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: { user: import('@supabase/supabase-js').User } | null) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = useCallback(async () => {
    // Clear the HTTP-only server session first, then clear Supabase's browser
    // storage. Both are needed because protected routes are checked on server.
    const response = await fetch('/api/auth/signout', { method: 'POST' })
    if (!response.ok) throw new Error('Unable to sign out')

    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw error

    // Update the client immediately and use a hard navigation so neither the
    // App Router cache nor a stale profile can retain the previous session.
    setUser(null)
    setProfile(null)
    window.location.replace('/login')
  }, [supabase])

  return { user, profile, loading, signOut, isAdmin: profile?.role === 'admin' }
}
