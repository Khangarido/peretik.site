'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as AppUser } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
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
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Update the client immediately, then re-render server components after
    // Supabase has removed its auth cookies.
    setUser(null)
    setProfile(null)
    router.replace('/login')
    router.refresh()
  }, [router, supabase])

  return { user, profile, loading, signOut, isAdmin: profile?.role === 'admin' }
}
