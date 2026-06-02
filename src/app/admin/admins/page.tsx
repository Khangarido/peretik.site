import { createClient } from '@/lib/supabase/server'
import { AdminsClient } from './_client'
import type { User } from '@/types'

export const metadata = { title: 'Admin — Admins' }

export default async function AdminAdminsPage() {
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: admins } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1">Admin</p>
        <h1 className="font-heading text-3xl font-bold text-white">Admin эрхүүд</h1>
      </div>
      <AdminsClient
        admins={(admins ?? []) as User[]}
        currentUserId={currentUser?.id ?? ''}
      />
    </div>
  )
}
