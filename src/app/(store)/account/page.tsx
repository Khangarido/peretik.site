import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AccountClient } from './_client'
import type { User, Order } from '@/types'

export const metadata = { title: 'Бүртгэл — Peretik' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/account')

  const [profileRes, ordersRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1.5">Миний</p>
        <h1 className="font-heading text-4xl font-bold text-white">Бүртгэл</h1>
      </div>
      <AccountClient
        profile={profileRes.data as User | null}
        email={user.email ?? ''}
        orders={(ordersRes.data ?? []) as Order[]}
      />
    </div>
  )
}
